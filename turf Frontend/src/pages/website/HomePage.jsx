import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import { getPublicTournaments } from '../../services/tournamentService'
import { getAllPlans } from '../../services/subscriptionPlanService'
import { getLiveDareChallenges } from '../../services/challengeService'
import { getPublicBranches } from '../../services/publicBranchService'
import { HiLocationMarker, HiStar, HiArrowRight, HiShieldCheck, HiOutlineDesktopComputer, HiOutlineCalendar, HiOutlineShieldCheck } from 'react-icons/hi'
import { IoFootball, IoGameController, IoTrophyOutline, IoPeopleOutline, IoLocationOutline } from 'react-icons/io5'
import { GiCricketBat, GiAxeInLog } from 'react-icons/gi'
import { MdStadium, MdPayments, MdQrCodeScanner } from 'react-icons/md'
import { RiTrophyFill, RiGamepadFill } from 'react-icons/ri'
import TurfSearchBar from '../../components/TurfSearchBar'
import TurfResultsGrid from '../../components/TurfResultsGrid'
import TurfMapExplorer from '../../components/TurfMapExplorer'
import TeamPaymentModesSection from '../../components/website/TeamPaymentModesSection'
import LiveCricketChallengeCard from '../../components/website/LiveCricketChallengeCard'
import CorporateBookingSection from '../../components/website/CorporateBookingSection'
import MembershipCheckoutModal from '../../components/membership/MembershipCheckoutModal'
import PageLoader from '../../components/ui/PageLoader'
import useRealtime from '../../utils/useRealtime'

const DEFAULT_FALLBACK_DARES = [
    {
        id: 'dare-default-1',
        branchId: 16,
        challengerTeam: 'INDORE WARRIORS XI',
        venueName: 'Indore Turf Arena, Vijay Nagar, Indore',
        matchTime: 'Tonight, 8:00 PM – 9:00 PM',
        matchFee: 1200,
        depositFee: 100,
        sportName: 'Box Cricket',
        badge: '🔥 LIVE DARE'
    },
    {
        id: 'dare-default-2',
        branchId: 1,
        challengerTeam: 'ROYAL STRIKERS XI',
        venueName: 'Champion Turf Arena, Palasia, Indore',
        matchTime: 'Tonight, 9:30 PM – 10:30 PM',
        matchFee: 1500,
        depositFee: 150,
        sportName: 'Box Cricket',
        badge: '🔥 LIVE DARE'
    }
]
function useReveal() {
    const ref = useRef(null)
    const [v, setV] = useState(false)
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            setV(e.isIntersecting)
        }, { threshold: 0.1 })
        if (ref.current) obs.observe(ref.current)
        return () => obs.disconnect()
    }, [])
    return { ref, visible: v }
}

/* ── MOCK DATA (Cricket Only Specialization) ── */
const sports = [
    { name: 'Cricket', slug: 'Cricket', icon: '🏏', venues: 150 },
]

const allTurfs = []

export default function HomePage() {
    const navigate = useNavigate()
    const resultsRef = useRef(null)
    const subReveal = useReveal()
    const tourneyReveal = useReveal()
    const ecosystemReveal = useReveal()
    const searchReveal = useReveal()

    /* ── Dynamic Turfs State Sync ── */
    const [dynamicTurfs, setDynamicTurfs] = useState([])

    /* ── Search State ── */
    const [searchValues, setSearchValues] = useState({
        location: '',
        sport: '',
        date: '',
        time: '',
        players: 10,
    })
    const [appliedFilters, setAppliedFilters] = useState({
        location: '',
        sport: '',
        date: '',
        time: '',
        players: 10,
    })
    const [showResults, setShowResults] = useState(false)
    const [recentSearches, setRecentSearches] = useState([])
    const [userLocation, setUserLocation] = useState(null)
    const [upcomingTournaments, setUpcomingTournaments] = useState([])
    const [homePlans, setHomePlans] = useState([])
    const [backendChallenges, setBackendChallenges] = useState([])
    const [isChallengeVisible, setIsChallengeVisible] = useState(true)
    const [billingCycle, setBillingCycle] = useState('monthly')
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
    const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState(null)
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    // Resolve loading immediately when API responds (no artificial delays on fast connections)
    useEffect(() => {
        getPublicBranches({ limit: 100 }).finally(() => {
            setIsInitialLoading(false)
        })
    }, [])

    const handleGetStartedPlan = (p) => {
        const numericPrice = typeof p.price === 'string' ? parseInt(p.price.replace(/,/g, ''), 10) : (p.numericPrice || p.price || 999)
        setSelectedCheckoutPlan({
            ...p,
            id: p.name ? p.name.toUpperCase().replace(/\s+/g, '_') : 'STARTER',
            rawId: p.name ? p.name.toUpperCase().replace(/\s+/g, '_') : 'STARTER',
            numericPrice: isNaN(numericPrice) ? 999 : numericPrice,
            period: p.period || (billingCycle === 'yearly' ? '/YEAR' : '/MO')
        })
        setIsCheckoutModalOpen(true)
    }

    /* ── Fetch Live Branches, Upcoming Tournaments, Subscription Plans & Live Dares ── */
    useEffect(() => {
        const mapBranchData = (rawBranches) => {
            return rawBranches.map((b, idx) => {
                let parsedSports = ['Cricket'];
                try {
                    if (Array.isArray(b.sports) && b.sports.length > 0) {
                        parsedSports = b.sports.map(s => typeof s === 'string' ? s : (s?.name || 'Cricket'));
                    } else if (typeof b.sports === 'string' && b.sports.trim().startsWith('[')) {
                        const arr = JSON.parse(b.sports);
                        parsedSports = arr.map(s => typeof s === 'string' ? s : (s?.name || 'Cricket'));
                    }
                } catch (_) { }

                let parsedAmenities = ['Floodlights', 'Parking', 'Washroom'];
                try {
                    if (Array.isArray(b.amenities)) parsedAmenities = b.amenities;
                    else if (typeof b.amenities === 'string' && b.amenities.trim().startsWith('[')) parsedAmenities = JSON.parse(b.amenities);
                } catch (_) { }

                let firstImg = b.logo;
                if (!firstImg && Array.isArray(b.images) && b.images.length > 0) firstImg = b.images[0];
                if (!firstImg && typeof b.images === 'string' && b.images.startsWith('[')) {
                    try {
                        const arr = JSON.parse(b.images);
                        if (arr.length > 0) firstImg = arr[0];
                    } catch (_) { }
                }

                const rawPrice = Number(b.pricePerHour ?? b.price ?? b.minPriceHourly ?? b.price_per_hour);
                const resolvedPrice = (!isNaN(rawPrice) && rawPrice > 0) ? rawPrice : 1000;

                const rawRating = Number(b.rating);
                const resolvedRating = (!isNaN(rawRating) && rawRating > 0) ? rawRating : 4.8;

                return {
                    id: b.id || b._id || (idx + 1),
                    _id: b.id || b._id,
                    name: b.branchName || b.name,
                    location: b.fullAddress || `${b.city || 'Indore'}, ${b.country || 'India'}`,
                    city: b.city || 'Indore',
                    rating: resolvedRating,
                    price: resolvedPrice,
                    pricePerHour: resolvedPrice,
                    dimensionsSqFt: b.dimensionsSqFt || b.dimensions_sqft,
                    dimensions: b.dimensionsSqFt ? `${Number(b.dimensionsSqFt).toLocaleString('en-IN')} Sq.Ft` : (b.turfSize || b.dimensions || '5,000 Sq.Ft'),
                    turfSize: b.dimensionsSqFt ? `${Number(b.dimensionsSqFt).toLocaleString('en-IN')} Sq.Ft` : (b.turfSize || b.dimensions || '5,000 Sq.Ft'),
                    surfaceType: b.surfaceType || b.surface_type || 'TurfPro Synthetic Arena',
                    image: firstImg || `/images/turf${(idx % 5) + 1}.png`,
                    sports: parsedSports,
                    amenities: parsedAmenities,
                    discountOffer: b.discountOffer || b.discount_offer || '',
                    couponCode: b.couponCode || b.coupon_code || '',
                    openingTime: b.openingTime || b.opening_time || '08:00 AM',
                    closingTime: b.closingTime || b.closing_time || '11:00 PM',
                    lat: Number(b.latitude || (22.7244 + (idx * 0.01))),
                    lng: Number(b.longitude || (75.8839 + (idx * 0.01)))
                }
            })
        }

        const loadTurfs = () => {
            // publicBranchService uses the unauthenticated publicApi client — no JWT attached
            getPublicBranches({ limit: 100 }).then(res => {
                const rawBranches = res?.data?.branches || res?.branches || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []))
                if (Array.isArray(rawBranches) && rawBranches.length > 0) {
                    setDynamicTurfs(mapBranchData(rawBranches))
                }
            }).catch(() => {})
        }

        loadTurfs()
        const retryTimer = setTimeout(loadTurfs, 1200)

        getPublicTournaments().then(res => {
            if (res?.success && Array.isArray(res?.data)) {
                setUpcomingTournaments(res.data.slice(0, 4))
            }
        }).catch(() => { })

        getAllPlans().then(res => {
            if (res?.success && Array.isArray(res?.data)) {
                setHomePlans(res.data.filter(p => p && (p.status || '').toLowerCase() === 'active'))
            }
        }).catch(() => { })

        const fetchLiveDares = () => {
            getLiveDareChallenges().then(res => {
                if (res?.success && Array.isArray(res?.data) && res.data.length > 0) {
                    setBackendChallenges(res.data)
                }
            }).catch(() => { })
        }

        fetchLiveDares()
    }, [])

    const fetchLiveDares = useCallback(() => {
        getLiveDareChallenges().then(res => {
            if (res?.success && Array.isArray(res?.data) && res.data.length > 0) {
                setBackendChallenges(res.data)
            }
        }).catch(() => { })
    }, [])

    useRealtime(['dare:new', 'booking:new', 'match:updated', 'match:opponent-joined'], fetchLiveDares)


    /* ── Geolocation & Initial Nearby Sort ── */
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords
                    setUserLocation({ lat: latitude, lng: longitude })
                },
                (err) => console.log('Location denied'),
                { timeout: 10000 }
            )
        }
    }, [])

    /* ── Coordinate Mapping for Dynamic Distance & Nearby Sorting ── */
    const AREA_COORDINATES = {
        // Indore Areas
        'vijay nagar': { lat: 22.7533, lng: 75.8937, name: 'Vijay Nagar, Indore' },
        'palasia': { lat: 22.7244, lng: 75.8839, name: 'Palasia, Indore' },
        'lig': { lat: 22.7380, lng: 75.8916, name: 'LIG Colony, Indore' },
        'lig colony': { lat: 22.7380, lng: 75.8916, name: 'LIG Colony, Indore' },
        'bhawarkua': { lat: 22.6953, lng: 75.8690, name: 'Bhawarkua, Indore' },
        'bhawarkuan': { lat: 22.6953, lng: 75.8690, name: 'Bhawarkua, Indore' },
        'navlakha': { lat: 22.7000, lng: 75.8752, name: 'Navlakha, Indore' },
        'annapurna': { lat: 22.7010, lng: 75.8320, name: 'Annapurna, Indore' },
        'super corridor': { lat: 22.7650, lng: 75.8300, name: 'Super Corridor, Indore' },
        'rau': { lat: 22.6300, lng: 75.8050, name: 'Rau, Indore' },
        'bypass': { lat: 22.7200, lng: 75.9200, name: 'Bypass, Indore' },
        'rajwada': { lat: 22.7196, lng: 75.8577, name: 'Rajwada, Indore' },
        'indore': { lat: 22.7196, lng: 75.8577, name: 'Indore' },
        // Other Cities
        'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
        'andheri': { lat: 19.1136, lng: 72.8697, name: 'Andheri, Mumbai' },
        'bandra': { lat: 19.0596, lng: 72.8295, name: 'Bandra, Mumbai' },
        'powai': { lat: 19.1176, lng: 72.9060, name: 'Powai, Mumbai' },
        'vashi': { lat: 19.0330, lng: 73.0297, name: 'Vashi, Mumbai' },
        'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
        'koramangala': { lat: 12.9352, lng: 77.6245, name: 'Koramangala, Bangalore' },
        'indiranagar': { lat: 12.9784, lng: 77.6408, name: 'Indiranagar, Bangalore' },
        'hsr layout': { lat: 12.9121, lng: 77.6446, name: 'HSR Layout, Bangalore' },
        'delhi': { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
        'pune': { lat: 18.5204, lng: 73.8567, name: 'Pune' },
    }

    const resolveOriginCoordinates = (locString, userGPS, explicitCoords) => {
        if (explicitCoords?.lat && explicitCoords?.lng) return explicitCoords
        if (!locString || locString.toLowerCase().includes('current') || locString.toLowerCase().includes('near me')) {
            if (userGPS?.lat && userGPS?.lng) return userGPS
            return { lat: 22.7196, lng: 75.8577 } // default Indore Center
        }
        const clean = locString.toLowerCase()
        for (const [key, coords] of Object.entries(AREA_COORDINATES)) {
            if (clean.includes(key)) return coords
        }
        if (userGPS?.lat && userGPS?.lng) return userGPS
        return { lat: 22.7196, lng: 75.8577 }
    }

    const getDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 9999
        const R = 6371 // km
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return Math.max(0.1, Number((R * c).toFixed(1)))
    }

    const activeLoc = appliedFilters.location || searchValues.location
    const originCoords = resolveOriginCoordinates(activeLoc, userLocation, appliedFilters.coords || searchValues.coords)

    /* ── Filtered & Nearby-Ranked Turfs (Google Maps / Nearby First Style) ── */
    const filteredTurfs = dynamicTurfs.map(t => {
        const d = getDistance(originCoords.lat, originCoords.lng, t.lat, t.lng)
        return {
            ...t,
            distance: d
        }
    }).filter(t => {
        if (activeLoc && !activeLoc.toLowerCase().includes('near me') && !activeLoc.toLowerCase().includes('current') && !activeLoc.toLowerCase().includes('all venues') && !activeLoc.toLowerCase().includes('all cities')) {
            const locFilter = activeLoc.toLowerCase().trim()
            const cleanLocFilter = locFilter.replace(/[\d\.]+\s*km\s*radius\s*\|?/gi, '').replace(/\d+\.\d+/g, '').trim()
            if (cleanLocFilter.length > 0 && !cleanLocFilter.includes('radius')) {
                const isIndoreQuery = cleanLocFilter.includes('indore') || Object.keys(AREA_COORDINATES).filter(k => AREA_COORDINATES[k].lat > 22 && AREA_COORDINATES[k].lat < 23).some(k => cleanLocFilter.includes(k))
                if (isIndoreQuery) {
                    if (t.city && t.city.toLowerCase() !== 'indore') return false
                } else {
                    const matchCity = t.city && (t.city.toLowerCase().includes(cleanLocFilter) || cleanLocFilter.includes(t.city.toLowerCase()))
                    const matchLocation = t.location ? t.location.toLowerCase().includes(cleanLocFilter) : false
                    const matchName = t.name ? t.name.toLowerCase().includes(cleanLocFilter) : false
                    if (!matchCity && !matchLocation && !matchName) return false
                }
            }
        }
        if (appliedFilters.sport && appliedFilters.sport !== 'All Sports' && appliedFilters.sport !== 'All') {
            const sReq = appliedFilters.sport.toLowerCase()
            const matchSport = t.sports.some(s => {
                const sLow = (typeof s === 'string' ? s : s?.name || '').toLowerCase()
                return sLow.includes(sReq) || sReq.includes(sLow) || (sReq.includes('cricket') && sLow.includes('cricket'))
            })
            if (!matchSport) return false
        }

        return true
    }).sort((a, b) => {
        // ALWAYS rank closest turfs to the searched location/area first
        return a.distance - b.distance
    })

    /* ── Handle search field changes (No filtering here) ── */
    const handleSearchChange = useCallback((vals) => {
        setSearchValues(vals)
    }, [])

    /* ── Handle explicit search (Commit Filters) ── */
    const handleSearch = useCallback((vals) => {
        setSearchValues(vals)
        setAppliedFilters(vals)
        setShowResults(true)
        // Add to recent searches
        if (vals.location || vals.sport) {
            setRecentSearches(prev => {
                const newEntry = { location: vals.location, sport: vals.sport, time: vals.time }
                const filtered = prev.filter(r => !(r.location === newEntry.location && r.sport === newEntry.sport))
                return [newEntry, ...filtered].slice(0, 3)
            })
        }
    }, [])

    /* ── Clear filters ── */
    const clearFilters = () => {
        const empty = { location: '', sport: '', date: '', time: '', players: 10 }
        setSearchValues(empty)
        setAppliedFilters(empty)
        setShowResults(false)
    }

    // Dynamic Multi-Match Dare Challenge Pool based on selected location & top turfs
    const activeCityName = appliedFilters.location || searchValues.location || 'Indore'
    const topTurfsList = (filteredTurfs.length > 0 ? filteredTurfs : dynamicTurfs).slice(0, 4)

    const challengerTeamNames = [
        'Indore Strikers XI',
        'Vijay Nagar Royals',
        'Palasia Smashers',
        'Indore Super Kings'
    ]

    const timeSlots = [
        'Tonight, 8:30 PM – 9:30 PM',
        'Tonight, 9:30 PM – 10:30 PM',
        'Tomorrow, 7:00 AM – 8:00 AM',
        'Tomorrow, 8:00 PM – 9:00 PM'
    ]

    // Read any user-created open challenges from localStorage if present
    let localOpenChallenges = []
    try {
        const saved = JSON.parse(localStorage.getItem('open_challenges') || '[]')
        if (Array.isArray(saved)) localOpenChallenges = saved
    } catch (_) { }

    // Dynamic Dare Challenges fetched from real-time database with live fallbacks
    const dynamicChallenges = [
        ...localOpenChallenges,
        ...backendChallenges,
        ...(backendChallenges.length === 0 && localOpenChallenges.length === 0 ? DEFAULT_FALLBACK_DARES : [])
    ]



    if (isInitialLoading) {
        return <PageLoader text="Loading Kiaan Turf..." fullScreen />
    }

    return (
        <div className="bg-white relative selection:bg-[#C8FF2E]/40 min-h-screen text-[#111827]">

            {/* ══════════════════════════════════════════════
                AIRBNB-STYLE SEARCH & CATEGORIES
            ══════════════════════════════════════════════ */}
            <section className="pt-3 pb-2 bg-transparent relative z-20">
                <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
                    <div className="relative z-20">
                        <TurfSearchBar
                            values={searchValues}
                            onChange={handleSearchChange}
                            onSearch={handleSearch}
                            onClear={clearFilters}
                        />
                    </div>

                    {/* ── SPECIAL CRICKET MODES & USP ATTRACTION TEMPLATES (Immersive Templates with Background Photos, Spec Tables & No Redundant Tags) ── */}
                    <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-4.5 w-full max-w-full select-none">

                        {/* 1. 🔥 DARE MATCH™ TEMPLATE */}
                        <div
                            onClick={() => {
                                resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
                            }}
                            className="group relative overflow-hidden w-full min-w-0 flex flex-col justify-between p-3.5 sm:p-4.5 rounded-3xl border-2 border-orange-500/60 hover:border-orange-400 shadow-xl hover:shadow-[0_20px_45px_rgba(249,115,22,0.45)] transition-all duration-500 cursor-pointer hover:-translate-y-1.5 text-left min-h-[310px]"
                        >
                            {/* Background Photo */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                                style={{ backgroundImage: `url('/images/dare_match_template.jpg')` }}
                            />
                            {/* Dark Gradient Tint & Frosted Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F0C] via-[#0B0F0C]/90 to-[#0B0F0C]/60 backdrop-blur-[1px]" />
                            {/* Neon Fire Shimmer Line */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

                            <div className="relative z-10 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-[0_0_25px_rgba(249,115,22,0.8)] flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform animate-fire-float">
                                        🔥
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-xs sm:text-sm font-black text-orange-400 uppercase tracking-wider truncate">Dare Match™</h3>
                                        <p className="text-sm sm:text-base font-black text-white leading-tight truncate">"Dum Hai Toh Harake Dikha!"</p>
                                    </div>
                                </div>

                                <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-relaxed">
                                    Winner plays 100% FREE! Losing team settles total match rent at match end.
                                </p>

                                {/* Proper Details Table */}
                                <div className="p-2.5 sm:p-3 rounded-2xl bg-black/60 border border-orange-500/30 backdrop-blur-md space-y-1.5 text-[10px] sm:text-[11px]">
                                    <div className="flex justify-between items-center text-slate-300 font-semibold border-b border-white/10 pb-1 gap-1">
                                        <span className="shrink-0">Winner Rule</span>
                                        <span className="text-emerald-400 font-black truncate">100% Free (Refund)</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300 font-semibold border-b border-white/10 pb-1 gap-1">
                                        <span className="shrink-0">Loser Rule</span>
                                        <span className="text-red-400 font-black truncate">Pays Total Fee</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300 font-semibold gap-1">
                                        <span className="shrink-0">Advance Entry</span>
                                        <span className="text-amber-400 font-black truncate">30% Deposit</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 mt-3 pt-2.5 border-t border-orange-500/30 flex items-center justify-between text-xs font-black text-orange-400 group-hover:text-white transition-colors">
                                <span>Play Dare Match</span>
                                <span className="text-orange-400 group-hover:text-white font-black group-hover:translate-x-1.5 transition-transform">Challenge →</span>
                            </div>
                        </div>

                        {/* 2. 🤝 50:50 SPLIT™ TEMPLATE */}
                        <div
                            onClick={() => {
                                resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
                            }}
                            className="group relative overflow-hidden w-full min-w-0 flex flex-col justify-between p-3.5 sm:p-4.5 rounded-3xl border-2 border-emerald-500/60 hover:border-emerald-400 shadow-xl hover:shadow-[0_20px_45px_rgba(16,185,129,0.45)] transition-all duration-500 cursor-pointer hover:-translate-y-1.5 text-left min-h-[310px]"
                        >
                            {/* Background Photo */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                                style={{ backgroundImage: `url('/images/split_50_template.jpg')` }}
                            />
                            {/* Dark Gradient Tint & Frosted Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F0C] via-[#0B0F0C]/90 to-[#0B0F0C]/60 backdrop-blur-[1px]" />
                            {/* Neon Emerald Shimmer Line */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

                            <div className="relative z-10 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-[0_0_25px_rgba(16,185,129,0.8)] flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                                        🤝
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-wider truncate">50:50 Split™</h3>
                                        <p className="text-sm sm:text-base font-black text-white leading-tight truncate">"Aadha Bill Tera, Aadha Mera!"</p>
                                    </div>
                                </div>

                                <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-relaxed">
                                    Both captains pay half (50%) rent. Automated payment link sent to opponent captain.
                                </p>

                                {/* Proper Details Table */}
                                <div className="p-2.5 sm:p-3 rounded-2xl bg-black/60 border border-emerald-500/30 backdrop-blur-md space-y-1.5 text-[10px] sm:text-[11px]">
                                    <div className="flex justify-between items-center text-slate-300 font-semibold border-b border-white/10 pb-1 gap-1">
                                        <span className="shrink-0">Your Share</span>
                                        <span className="text-emerald-400 font-black truncate">50% (₹600 of ₹1.2k)</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300 font-semibold border-b border-white/10 pb-1 gap-1">
                                        <span className="shrink-0">Opponent Share</span>
                                        <span className="text-teal-400 font-black truncate">50% (₹600 of ₹1.2k)</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300 font-semibold gap-1">
                                        <span className="shrink-0">Confirmation</span>
                                        <span className="text-amber-400 font-black truncate">Auto WhatsApp Link</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 mt-3 pt-2.5 border-t border-emerald-500/30 flex items-center justify-between text-xs font-black text-emerald-400 group-hover:text-white transition-colors">
                                <span>Split 50:50 Rent</span>
                                <span className="text-emerald-400 group-hover:text-white font-black group-hover:translate-x-1.5 transition-transform">Split →</span>
                            </div>
                        </div>

                        {/* 3. 👥 SQUAD SPLIT™ TEMPLATE */}
                        <div
                            onClick={() => {
                                resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
                            }}
                            className="group relative overflow-hidden w-full min-w-0 flex flex-col justify-between p-3.5 sm:p-4.5 rounded-3xl border-2 border-blue-500/60 hover:border-blue-400 shadow-xl hover:shadow-[0_20px_45px_rgba(59,130,246,0.45)] transition-all duration-500 cursor-pointer hover:-translate-y-1.5 text-left min-h-[310px]"
                        >
                            {/* Background Photo */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                                style={{ backgroundImage: `url('/images/squad_split_template.jpg')` }}
                            />
                            {/* Dark Gradient Tint & Frosted Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F0C] via-[#0B0F0C]/90 to-[#0B0F0C]/60 backdrop-blur-[1px]" />
                            {/* Neon Blue Shimmer Line */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

                            <div className="relative z-10 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-[0_0_25px_rgba(59,130,246,0.8)] flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                        👥
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-xs sm:text-sm font-black text-blue-400 uppercase tracking-wider truncate">Squad Split™</h3>
                                        <p className="text-sm sm:text-base font-black text-white leading-tight truncate">"Apna Hissa, Khud Bharo!"</p>
                                    </div>
                                </div>

                                <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-relaxed">
                                    Individual UPI links sent to each teammate. Everyone pays their equal share directly.
                                </p>

                                {/* Proper Details Table */}
                                <div className="p-2.5 sm:p-3 rounded-2xl bg-black/60 border border-blue-500/30 backdrop-blur-md space-y-1.5 text-[10px] sm:text-[11px]">
                                    <div className="flex justify-between items-center text-slate-300 font-semibold border-b border-white/10 pb-1 gap-1">
                                        <span className="shrink-0">Squad Size</span>
                                        <span className="text-blue-400 font-black truncate">2 to 14 Players</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300 font-semibold border-b border-white/10 pb-1 gap-1">
                                        <span className="shrink-0">Per Player Share</span>
                                        <span className="text-cyan-400 font-black truncate">₹150 – ₹300 / Head</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300 font-semibold gap-1">
                                        <span className="shrink-0">UPI Link</span>
                                        <span className="text-emerald-400 font-black truncate">Live Player Status</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 mt-3 pt-2.5 border-t border-blue-500/30 flex items-center justify-between text-xs font-black text-blue-400 group-hover:text-white transition-colors">
                                <span>Create Squad Split</span>
                                <span className="text-blue-400 group-hover:text-white font-black group-hover:translate-x-1.5 transition-transform">Share →</span>
                            </div>
                        </div>

                        {/* 4. 💳 FULL PAY™ TEMPLATE */}
                        <div
                            onClick={() => {
                                resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
                            }}
                            className="group relative overflow-hidden w-full min-w-0 flex flex-col justify-between p-3.5 sm:p-4.5 rounded-3xl border-2 border-lime-500/60 hover:border-lime-400 shadow-xl hover:shadow-[0_20px_45px_rgba(132,204,22,0.45)] transition-all duration-500 cursor-pointer hover:-translate-y-1.5 text-left min-h-[310px]"
                        >
                            {/* Background Photo */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                                style={{ backgroundImage: `url('/images/full_pay_template.jpg')` }}
                            />
                            {/* Dark Gradient Tint & Frosted Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F0C] via-[#0B0F0C]/90 to-[#0B0F0C]/60 backdrop-blur-[1px]" />
                            {/* Neon Lime Shimmer Line */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C8FF2E] to-transparent" />

                            <div className="relative z-10 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#16A34A] to-emerald-700 text-white shadow-[0_0_25px_rgba(22,163,74,0.8)] flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                                        💳
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-xs sm:text-sm font-black text-[#C8FF2E] uppercase tracking-wider truncate">Full Pay™</h3>
                                        <p className="text-sm sm:text-base font-black text-white leading-tight truncate">"Tera Bhai Dega Pura Bill!"</p>
                                    </div>
                                </div>

                                <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-relaxed">
                                    Pay complete turf amount upfront for instant slot locking. Collect offline at your ease.
                                </p>

                                {/* Proper Details Table */}
                                <div className="p-2.5 sm:p-3 rounded-2xl bg-black/60 border border-lime-500/30 backdrop-blur-md space-y-1.5 text-[10px] sm:text-[11px]">
                                    <div className="flex justify-between items-center text-slate-300 font-semibold border-b border-white/10 pb-1 gap-1">
                                        <span className="shrink-0">Booking Speed</span>
                                        <span className="text-[#C8FF2E] font-black truncate">Instant 10s Lock</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300 font-semibold border-b border-white/10 pb-1 gap-1">
                                        <span className="shrink-0">Upfront Pay</span>
                                        <span className="text-emerald-400 font-black truncate">100% Single Captain</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300 font-semibold gap-1">
                                        <span className="shrink-0">Settlement</span>
                                        <span className="text-cyan-400 font-black truncate">Collect Offline Cash/UPI</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 mt-3 pt-2.5 border-t border-lime-500/30 flex items-center justify-between text-xs font-black text-[#C8FF2E] group-hover:text-white transition-colors">
                                <span>Instant Full Booking</span>
                                <span className="text-[#C8FF2E] group-hover:text-white font-black group-hover:translate-x-1.5 transition-transform">Book →</span>
                            </div>
                        </div>

                        {/* 5. 👑 HALL OF FAME™ TEMPLATE */}
                        <div
                            onClick={() => navigate('/leaderboard')}
                            className="group relative overflow-hidden w-full min-w-0 flex flex-col justify-between p-3.5 sm:p-4.5 rounded-3xl border-2 border-amber-500/60 hover:border-amber-400 shadow-xl hover:shadow-[0_20px_45px_rgba(245,158,11,0.45)] transition-all duration-500 cursor-pointer hover:-translate-y-1.5 text-left min-h-[310px] sm:col-span-2 lg:col-span-1"
                        >
                            {/* Background Photo */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                                style={{ backgroundImage: `url('/images/hall_of_fame_template.jpg')` }}
                            />
                            {/* Dark Gradient Tint & Frosted Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F0C] via-[#0B0F0C]/90 to-[#0B0F0C]/60 backdrop-blur-[1px]" />
                            {/* Neon Amber Shimmer Line */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

                            <div className="relative z-10 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-black shadow-[0_0_25px_rgba(245,158,11,0.8)] flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                                        👑
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider truncate">Player Matchmaking™</h3>
                                        <p className="text-sm sm:text-base font-black text-white leading-tight truncate">"Best Players Ke Sath Khelo!"</p>
                                    </div>
                                </div>

                                <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-relaxed">
                                    City ke best players aur top cricket teams ko match khelne ke liye bulao aur challenge karo.
                                </p>

                                {/* Proper Details Table */}
                                <div className="p-2.5 sm:p-3 rounded-2xl bg-black/60 border border-amber-500/30 backdrop-blur-md space-y-1.5 text-[10px] sm:text-[11px]">
                                    <div className="flex justify-between items-center text-slate-300 font-semibold border-b border-white/10 pb-1 gap-1">
                                        <span className="shrink-0">Khiladi Invite</span>
                                        <span className="text-amber-400 font-black truncate">Top City Players</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300 font-semibold border-b border-white/10 pb-1 gap-1">
                                        <span className="shrink-0">Open Challenge</span>
                                        <span className="text-orange-400 font-black truncate">Direct WhatsApp Invite</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300 font-semibold gap-1">
                                        <span className="shrink-0">Rankings</span>
                                        <span className="text-yellow-400 font-black truncate">Top XI Leaderboard</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 mt-3 pt-2.5 border-t border-amber-500/30 flex items-center justify-between text-xs font-black text-amber-400 group-hover:text-white transition-colors">
                                <span>Best Players Se Khelo</span>
                                <span className="text-amber-400 group-hover:text-white font-black group-hover:translate-x-1.5 transition-transform">Invite →</span>
                            </div>
                        </div>
                    </div>

                    {/* FLOATING SIDE LIVE CRICKET CHALLENGE POPUP (Strictly Database Driven) */}
                    {isChallengeVisible && dynamicChallenges.length > 0 && (
                        <LiveCricketChallengeCard
                            challenges={dynamicChallenges}
                            onDismiss={() => setIsChallengeVisible(false)}
                        />
                    )}

                </div>
            </section>

            {/* ══════════════════════════════════════════════
                POPULAR TURFS GRID
            ══════════════════════════════════════════════ */}
            <div ref={resultsRef} className={`relative z-10 ${isChallengeVisible ? 'pt-3' : 'pt-0'} pb-12`}>
                {/* Radial Glow Lighting behind Explore Turfs */}
                <div
                    style={{
                        background: 'radial-gradient(circle at center, #DFFFE6 0%, transparent 65%)',
                        opacity: 0.10
                    }}
                    className="absolute inset-0 pointer-events-none -z-10"
                />
                <TurfResultsGrid
                    turfs={filteredTurfs}
                    searchValues={searchValues}
                    recentSearches={recentSearches}
                    onClear={clearFilters}
                />
            </div>

            {/* ══════════════════════════════════════════════
                SECTION 2: ENERGETIC UPCOMING TOURNAMENTS
            ══════════════════════════════════════════════ */}
            <section className="pt-8 pb-16 bg-[#F8FFF9] border-t border-[#00A651]/12 relative overflow-hidden">
                {/* Visual Glows */}
                <div className="absolute top-[15%] right-[10%] w-[40vw] h-[40vw] bg-[#C8FF2E]/15 blur-[140px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[10%] left-[5%] w-[35vw] h-[35vw] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                    <div className="text-center mb-8">
                        <span className="text-[#16A34A] text-[10px] font-black uppercase tracking-[0.25em] bg-green-50 border border-green-200 px-4 py-1.5 rounded-full shadow-sm">Competitive Arena</span>
                        <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tight text-[#111827] mt-3 mb-1.5">
                            Upcoming <span className="text-[#16A34A] underline decoration-[#C8FF2E] decoration-4 underline-offset-4">Tournaments</span>
                        </h2>
                        <p className="text-xs text-[#6B7280] max-w-lg mx-auto font-semibold leading-relaxed">Bring your squad, dominate division tables, and earn high-stakes victory across the region</p>
                    </div>

                    <div
                        ref={tourneyReveal.ref}
                        className={`grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 transition-all duration-[1000ms] ease-out ${tourneyReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                            }`}
                    >
                        {(upcomingTournaments.length > 0 ? upcomingTournaments : [
                            { id: 'fallback-1', title: 'Matrix Football League', sport: 'Football', prize: '₹50,000', entryFee: '2500', maxTeams: 16, registrations: 13, status: 'Approved' },
                            { id: 'fallback-2', title: 'Indore Turf Cricket Cup', sport: 'Cricket', prize: '₹75,000', entryFee: '3000', maxTeams: 12, registrations: 6, status: 'Approved' }
                        ]).slice(0, 4).map((t, idx) => {
                            const spotsLeft = (t.maxTeams || 16) - (t.registrations || 0)
                            const isOpen = ['APPROVED', 'ACTIVE', 'REGISTRATION_OPEN', 'UPCOMING'].includes((t.status || '').toUpperCase()) || t.status === 'Approved'
                            const statusColor = spotsLeft <= 3 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-green-200 bg-green-50 text-[#16A34A]'
                            const statusText = !isOpen ? t.status : (spotsLeft <= 3 ? 'Few Slots Left' : 'Registration Open')
                            return (
                                <div
                                    key={t.id || t._id || idx}
                                    className="group bg-white border border-[#E5E7EB] hover:border-[#16A34A]/40 rounded-[18px] p-6 flex flex-col justify-between shadow-[0_15px_45px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-[6px] relative overflow-hidden"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4 gap-2">
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-[6px] border ${statusColor}`}>
                                                {statusText}
                                            </span>
                                            <span className="text-[9px] font-black text-[#6B7280] uppercase tracking-wide bg-slate-100 border border-[#E5E7EB] px-2.5 py-1 rounded-[6px]">{t.sport || 'Sports'}</span>
                                        </div>
                                        <h3 className="text-lg font-black uppercase text-[#111827] tracking-tight mb-4 group-hover:text-[#16A34A] transition-colors">{t.title || t.name}</h3>

                                        <div className="p-3.5 bg-slate-50 border border-[#E5E7EB] rounded-[14px] space-y-2 mb-6">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-[#6B7280] font-bold uppercase tracking-wide">GRAND PRIZE</span>
                                                <span className="text-[#111827] font-black">{t.prize || `₹${t.entryFee || 0}`} Cash Pool</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-[#6B7280] font-bold uppercase tracking-wide">ENTRY FEE</span>
                                                <span className="text-[#111827] font-black">₹{t.entryFee || 0} / SQUAD</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-[#E5E7EB] text-[#6B7280]">
                                                <span className="font-bold uppercase tracking-wider text-[#16A34A]">{spotsLeft} / {t.maxTeams || 16} SLOTS REMAINING</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => navigate(`/tournaments/${t.id || t._id}`)} className="w-full py-3.5 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-[10px] uppercase tracking-widest rounded-[14px] transition-all shadow-[0_12px_25px_rgba(184,255,44,0.28)] hover:scale-[1.02] cursor-pointer border border-[#B5F000]">
                                        Register Squad
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>
            {/* ══════════════════════════════════════════════
                NEW SECTION: PREMIUM SUBSCRIPTION PLANS
            ══════════════════════════════════════════════ */}
            <section id="subscription" className="pt-12 pb-20 bg-white border-t border-[#00A651]/12 relative overflow-hidden">
                {/* Visual Glow */}
                <div className="absolute top-[25%] left-[15%] w-[45vw] h-[45vw] bg-[#C8FF2E]/15 blur-[150px] rounded-full pointer-events-none" />

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                    <div className="text-center mb-10">
                        <span className="text-[#16A34A] text-[10px] font-black uppercase tracking-[0.25em] bg-green-50 border border-green-200 px-4 py-1.5 rounded-full shadow-sm">Membership Access</span>
                        <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tight text-[#111827] mt-3 mb-1.5">
                            Subscription <span className="text-[#16A34A] underline decoration-[#C8FF2E] decoration-4 underline-offset-4">Plans</span>
                        </h2>
                        <p className="text-xs text-[#6B7280] max-w-lg mx-auto font-semibold leading-relaxed mb-6">Elevate your game. Unlock unlimited field bookings, priority access, and tactical squad advantages.</p>

                        {/* Billing Cycle Toggle Switch with Light UI Theme, Boundaries & Hover Highlights */}
                        <div className="inline-flex items-center gap-1.5 bg-white border-2 border-slate-200 hover:border-emerald-400 p-1.5 rounded-full shadow-sm transition-all duration-300">
                            <button
                                type="button"
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${billingCycle === 'monthly'
                                        ? 'bg-[#111827] text-white shadow-sm border border-slate-900'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                Monthly
                            </button>

                            <div
                                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                className="w-12 h-6 rounded-full bg-slate-100 border-2 border-slate-300 hover:border-emerald-500 p-0.5 cursor-pointer relative transition-colors shrink-0"
                            >
                                <div className={`w-4.5 h-4.5 rounded-full bg-[#10B981] shadow-md transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-6 bg-[#16A34A]' : 'translate-x-0 bg-slate-600'}`} />
                            </div>

                            <button
                                type="button"
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${billingCycle === 'yearly'
                                        ? 'bg-[#16A34A] text-white shadow-sm border border-emerald-600'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                <span>Yearly</span>
                                <span className="bg-[#C8FF2E] text-[#111827] text-[9.5px] font-black px-2 py-0.5 rounded-full border border-[#aee810] shadow-2xs animate-pulse">
                                    SAVE 20%
                                </span>
                            </button>
                        </div>
                    </div>

                    <div
                        ref={subReveal.ref}
                        className={`grid grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto gap-8 items-start transition-all duration-[1000ms] ease-out ${subReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                            }`}
                    >
                        {(homePlans.length > 0 ? homePlans.map((p, idx) => {
                            const monthlyPrice = p.monthlyPricing?.price ?? (idx === 0 ? 999 : idx === 1 ? 2499 : 4999);
                            const isYearly = billingCycle === 'yearly';
                            const annualPriceWithDiscount = Math.round(monthlyPrice * 12 * 0.8);
                            const displayPrice = isYearly ? annualPriceWithDiscount.toLocaleString('en-IN') : monthlyPrice.toLocaleString('en-IN');
                            const perMonthEquivalent = Math.round(monthlyPrice * 0.8).toLocaleString('en-IN');
                            const yearlySavings = Math.round(monthlyPrice * 12 * 0.2).toLocaleString('en-IN');

                            const pNameLower = (p.planName || '').toLowerCase();
                            let accent = 'blue';
                            if (p.isPopular || pNameLower.includes('enterprise') || pNameLower.includes('premium')) accent = 'emerald';
                            else if (monthlyPrice === 0 || pNameLower.includes('starter') || pNameLower.includes('free')) accent = 'slate';

                            let baseFeatures = [
                                '1 Venue / Turf Location',
                                'Online Slot Booking & WhatsApp Confirmations',
                                'Basic Revenue & Occupancy Analytics',
                                'Standard Email & Chat Support'
                            ]
                            let monthlyPerks = [
                                '7-Day Free Trial (Cancel Anytime)',
                                'Instant WhatsApp Slot Alerts',
                                'Zero Setup / Onboarding Fee'
                            ]
                            let yearlyPerks = [
                                'FREE Custom Turf Webpage (Val. ₹1,500)',
                                '₹500 Featured Turf Ad Credits',
                                '1 Month Extra Free Validity (13 Mo)'
                            ]

                            if (idx === 1 || pNameLower.includes('professional') || p.isPopular) {
                                baseFeatures = [
                                    'Up to 3 Venue Branches / Turfs',
                                    'Multi-Staff Roles & Cashier POS System',
                                    '🔥 Dare Match™ & 50:50 Fee Splitting',
                                    'Advanced Analytics & PDF/CSV Exports',
                                    'Priority 24/7 WhatsApp Support'
                                ]
                                monthlyPerks = [
                                    '14-Day Free Trial (Zero Risk)',
                                    'Free Staff Training & Role Setup',
                                    '₹300 Monthly Ad Booster Credit',
                                    'Unlimited Player Split-Payment Invites'
                                ]
                                yearlyPerks = [
                                    'FREE Thermal Receipt Printer Sync',
                                    '₹2,000 Top-Banner Ad Credits',
                                    '2 Months Extra Free Validity (14 Mo)',
                                    'Complimentary Live Scorer Console'
                                ]
                            } else if (idx === 2 || pNameLower.includes('enterprise')) {
                                baseFeatures = [
                                    'Unlimited Branches & Multi-City Networks',
                                    'Dedicated Account Manager & 99.9% SLA',
                                    'White-Label Custom Branding & Domain',
                                    'Corporate GST Invoice & Tournament Suite'
                                ]
                                monthlyPerks = [
                                    '30-Day Money-Back Guarantee',
                                    'Free Custom Subdomain Setup',
                                    '₹1,000 Monthly Regional Banner Credits',
                                    'Dedicated WhatsApp Account Manager'
                                ]
                                yearlyPerks = [
                                    '0% Platform Corporate Event Commission',
                                    '₹5,000 Region-Wide Ad Credits',
                                    'Free Hardware & QR Scanner Bundle',
                                    'Dedicated 1-on-1 Onboarding & Custom APIs'
                                ]
                            }

                            return {
                                name: p.planName,
                                price: displayPrice,
                                period: isYearly ? '/YEAR' : '/MO',
                                perMonthNote: isYearly ? `₹${perMonthEquivalent}/mo · Save ₹${yearlySavings} (20% OFF)` : null,
                                desc: p.description ? p.description.toUpperCase() : 'STANDARD OPERATIONAL ACCESS',
                                accent,
                                popular: Boolean(p.isPopular),
                                features: p.features && p.features.length > 0 ? p.features : baseFeatures,
                                activePerks: isYearly ? yearlyPerks : monthlyPerks,
                                isYearly
                            };
                        }) : [
                            {
                                name: 'Starter Plan',
                                price: billingCycle === 'yearly' ? (999 * 12 * 0.8).toLocaleString('en-IN') : '999',
                                period: billingCycle === 'yearly' ? '/YEAR' : '/MO',
                                perMonthNote: billingCycle === 'yearly' ? '₹799/mo · Save ₹2,398/yr (20% OFF)' : null,
                                desc: 'IDEAL FOR SINGLE TURF OWNERS GETTING STARTED.',
                                accent: 'slate',
                                features: [
                                    '1 Venue / Turf Location',
                                    'Online Slot Booking & WhatsApp Confirmations',
                                    'Basic Revenue & Occupancy Analytics',
                                    'Standard Email & Chat Support'
                                ],
                                activePerks: billingCycle === 'yearly' ? [
                                    'FREE Custom Turf Webpage (Val. ₹1,500)',
                                    '₹500 Featured Turf Ad Credits',
                                    '1 Month Extra Free Validity (13 Mo)'
                                ] : [
                                    '7-Day Free Trial (Cancel Anytime)',
                                    'Instant WhatsApp Slot Alerts',
                                    'Zero Setup / Onboarding Fee'
                                ],
                                isYearly: billingCycle === 'yearly'
                            },
                            {
                                name: 'Professional Plan',
                                price: billingCycle === 'yearly' ? (2499 * 12 * 0.8).toLocaleString('en-IN') : '2,499',
                                period: billingCycle === 'yearly' ? '/YEAR' : '/MO',
                                perMonthNote: billingCycle === 'yearly' ? '₹1,999/mo · Save ₹5,998/yr (20% OFF)' : null,
                                desc: 'PERFECT FOR GROWING MULTI-TURF SPORTS COMPLEXES.',
                                accent: 'emerald',
                                popular: true,
                                features: [
                                    'Up to 3 Venue Branches / Turfs',
                                    'Multi-Staff Roles & Cashier POS System',
                                    '🔥 Dare Match™ & 50:50 Fee Splitting',
                                    'Advanced Analytics & PDF/CSV Exports',
                                    'Priority 24/7 WhatsApp Support'
                                ],
                                activePerks: billingCycle === 'yearly' ? [
                                    'FREE Thermal Receipt Printer Sync',
                                    '₹2,000 Top-Banner Ad Credits',
                                    '2 Months Extra Free Validity (14 Mo)',
                                    'Complimentary Live Scorer Console'
                                ] : [
                                    '14-Day Free Trial (Zero Risk)',
                                    'Free Staff Training & Role Setup',
                                    '₹300 Monthly Ad Booster Credit',
                                    'Unlimited Player Split-Payment Invites'
                                ],
                                isYearly: billingCycle === 'yearly'
                            },
                            {
                                name: 'Enterprise Arena',
                                price: billingCycle === 'yearly' ? (4999 * 12 * 0.8).toLocaleString('en-IN') : '4,999',
                                period: billingCycle === 'yearly' ? '/YEAR' : '/MO',
                                perMonthNote: billingCycle === 'yearly' ? '₹3,999/mo · Save ₹11,998/yr (20% OFF)' : null,
                                desc: 'CUSTOM TAILORED PLAN FOR LARGE STADIUM & TURF NETWORKS.',
                                accent: 'blue',
                                features: [
                                    'Unlimited Branches & Multi-City Networks',
                                    'Dedicated Account Manager & 99.9% SLA',
                                    'White-Label Custom Branding & Domain',
                                    'Corporate GST Invoice & Tournament Suite'
                                ],
                                activePerks: billingCycle === 'yearly' ? [
                                    '0% Platform Corporate Event Commission',
                                    '₹5,000 Region-Wide Ad Credits',
                                    'Free Hardware & QR Scanner Bundle',
                                    'Dedicated 1-on-1 Onboarding & Custom APIs'
                                ] : [
                                    '30-Day Money-Back Guarantee',
                                    'Free Custom Subdomain Setup',
                                    '₹1,000 Monthly Regional Banner Credits',
                                    'Dedicated WhatsApp Account Manager'
                                ],
                                isYearly: billingCycle === 'yearly'
                            }
                        ]).map((p, idx) => (
                            <div
                                key={idx}
                                className={`relative group flex flex-col bg-white border transition-all duration-300 hover:-translate-y-[6px] rounded-[18px] p-6 h-full ${p.popular
                                    ? 'border-[#C8FF2E] shadow-[0_20px_45px_rgba(200,255,46,0.25)] z-20 ring-2 ring-[#C8FF2E]'
                                    : 'border-[#E5E7EB] hover:border-[#16A34A]/40 shadow-[0_15px_45px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.14)]'
                                    }`}
                            >
                                {p.popular && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30">
                                        <span className="bg-[#C8FF2E] text-[#111827] text-[9px] font-black px-4 py-1 rounded-full shadow-md tracking-widest uppercase italic border border-[#B5F000]">
                                            MOST POPULAR
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-lg font-black text-[#111827] italic tracking-tighter uppercase mb-1">{p.name}</h3>
                                <p className="text-[9px] font-bold text-[#6B7280] tracking-wider mb-4 uppercase">{p.desc}</p>

                                <div className="flex flex-col mb-6 pb-5 border-b border-[#E5E7EB]">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest">INR</span>
                                        <span className="text-3xl font-black text-[#111827]">₹{p.price}</span>
                                        <span className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest">{p.period}</span>
                                    </div>
                                    {p.perMonthNote && (
                                        <span className="text-[9.5px] font-black text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg mt-2 inline-block self-start shadow-2xs">
                                            ⚡ {p.perMonthNote}
                                        </span>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-4 flex-1">
                                    {p.features.map((f, fidx) => (
                                        <li key={fidx} className="flex items-start gap-2.5">
                                            <span className="w-2 h-2 rounded-full bg-[#16A34A] mt-1 shrink-0" />
                                            <span className="text-[10px] font-bold text-[#111827] uppercase tracking-wide">{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* MONTHLY & YEARLY EXCLUSIVE BONUS PERKS HIGHLIGHT BOX */}
                                {p.activePerks && p.activePerks.length > 0 && (
                                    <div className={`mb-6 pt-3 pb-3 px-3 border rounded-xl shadow-2xs ${p.isYearly
                                            ? 'bg-gradient-to-br from-emerald-50/90 to-teal-50 border-emerald-200'
                                            : 'bg-gradient-to-br from-blue-50/90 to-slate-50 border-blue-200'
                                        }`}>
                                        <span className={`text-[9.5px] font-black uppercase tracking-wider block mb-1.5 ${p.isYearly ? 'text-[#065F46]' : 'text-blue-900'
                                            }`}>
                                            {p.isYearly ? '🎁 YEARLY EXCLUSIVE BONUS PERKS' : '⚡ MONTHLY INCLUDED BONUS PERKS'}
                                        </span>
                                        <ul className="space-y-1.5">
                                            {p.activePerks.map((perk, perkIdx) => (
                                                <li key={perkIdx} className="text-[9.5px] font-extrabold text-[#111827] flex items-center gap-1.5">
                                                    <span className={p.isYearly ? 'text-emerald-600 font-black' : 'text-blue-600 font-black'}>✓</span>
                                                    <span>{perk}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleGetStartedPlan(p)}
                                    className="w-full py-3.5 text-[10px] font-black italic tracking-[0.2em] uppercase rounded-[14px] border transition-all duration-300 cursor-pointer bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] border-[#B5F000] shadow-[0_12px_25px_rgba(184,255,44,0.28)] active:scale-95"
                                >
                                    GET STARTED
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                SECTION 3: WHY CHOOSE SPORTMATRIX (ECOSYSTEM STORYTELLING)
            ══════════════════════════════════════════════ */}
            <section className="py-16 bg-[#F8FFF9] border-t border-[#00A651]/12 relative overflow-hidden">
                {/* Ambient Glow Effects */}
                <div className="absolute top-[10%] left-[5%] w-[50vw] h-[50vw] bg-[#C8FF2E]/15 blur-[160px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#111827] mb-3 leading-[1.1]">
                            Why Choose{' '}
                            <span className="text-[#16A34A] underline decoration-[#C8FF2E] decoration-4 underline-offset-4">SportMatrix</span>
                        </h2>
                        <div className="w-20 h-1 bg-[#C8FF2E] mx-auto rounded-full shadow-sm" />
                    </div>

                    <div
                        ref={ecosystemReveal.ref}
                        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 transition-all duration-[1000ms] ease-out ${ecosystemReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                            }`}
                    >
                        {[
                            {
                                title: 'Smart Slot Booking',
                                desc: 'Instant cricket turf slot reservations, floodlight night match booking, dynamic pricing, and instant confirmation.',
                                icon: MdStadium,
                            },
                            {
                                title: 'Captain Handshake',
                                desc: 'Anti-tamper match verification where opponent captains confirm scores or certified turf umpires ratify official stats.',
                                icon: HiShieldCheck,
                            },
                            {
                                title: 'Live Leaderboard',
                                desc: 'Weighted Player Performance Score (PPS) tracking top batsmen, lethal bowlers, and MVPs across turf cricket matches.',
                                icon: RiTrophyFill,
                            },
                            {
                                title: 'Split Pay & Dare Mode',
                                desc: 'Split match fees equally among teammates via UPI or challenge rival squads in high-stakes "Winner Refunded" Dare matches.',
                                icon: MdPayments,
                            },
                            {
                                title: 'Cricket Tournaments',
                                desc: 'Automated knockout brackets, squad registrations, live tournament standings, and verified prize pool distribution.',
                                icon: GiCricketBat,
                            }
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="group bg-white border border-[#E5E7EB] rounded-[18px] p-7 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-[6px] shadow-[0_15px_45px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.14)] hover:border-[#16A34A]/40"
                            >
                                {/* Icon Container */}
                                <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-[14px] flex items-center justify-center mb-6 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-[#C8FF2E] group-hover:border-[#B5F000]">
                                    <item.icon className="w-7 h-7 text-[#16A34A] group-hover:text-[#111827] transition-colors duration-300" />
                                </div>
                                <h3 className="text-sm font-black uppercase text-[#111827] tracking-wider mb-3 leading-tight">{item.title}</h3>
                                <p className="text-xs text-[#6B7280] font-medium leading-relaxed">{item.desc}</p>
                                {/* Bottom accent line */}
                                <div className="w-8 h-1 bg-[#C8FF2E] rounded-full mt-5 opacity-60 group-hover:opacity-100 group-hover:w-14 transition-all duration-500" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                SECTION 4.5: TEAM MATCH PAYMENT MODES SHOWCASE
            ══════════════════════════════════════════════ */}
            <TeamPaymentModesSection onSelectMode={(modeId) => navigate(`/booking/1?mode=${modeId}`)} />

            {/* ══════════════════════════════════════════════
                SECTION 4.6: CORPORATE & BULK EVENT HIRE
            ══════════════════════════════════════════════ */}
            <CorporateBookingSection />

            {/* ══════════════════════════════════════════════
                SECTION 5: OWNER COMMAND CENTRAL CTA
            ══════════════════════════════════════════════ */}
            <section className="py-16 bg-white border-t border-[#00A651]/12 relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
                    <div className="bg-gradient-to-b from-white to-[#F8FFF9] border border-[#E5E7EB] p-8 md:p-12 rounded-[2rem] shadow-[0_15px_45px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.14)] relative overflow-hidden text-[#111827]">
                        {/* Glowing spot in capsule */}
                        <div className="absolute -top-[50%] left-[50%] -translate-x-[50%] w-[85%] h-[85%] bg-[#C8FF2E]/25 blur-[120px] rounded-full pointer-events-none" />

                        <span className="text-[#111827] text-[9.5px] font-black uppercase tracking-[0.25em] bg-[#C8FF2E] border border-[#B5F000] px-4 py-1.5 rounded-full inline-block mb-4 shadow-sm">
                            Enterprise Operations
                        </span>

                        <h2 className="text-2xl sm:text-4xl font-black italic uppercase text-[#111827] tracking-tight mb-4 leading-tight">
                            “Run Your Turf Professionally”
                        </h2>

                        <p className="text-sm text-[#6B7280] max-w-2xl mx-auto leading-relaxed mb-10 font-semibold">
                            Scale your business with SportMatrix. Oversee match bookings, handle cashless POS billing, launch tournaments, set subscription membership passes, and audit multi-branch operations within a unified command dashboard.
                        </p>

                        <div className="flex justify-center items-center">
                            <button onClick={() => navigate('/contact')} className="px-12 py-4 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-xs uppercase tracking-widest rounded-full shadow-[0_12px_25px_rgba(184,255,44,0.28)] transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer border border-[#B5F000]">
                                Request Demo & Onboard
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            {/* Interactive Checkout & Registration Modal for GET STARTED */}
            <MembershipCheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                plan={selectedCheckoutPlan}
                billingCycle={billingCycle}
            />
        </div>
    )
}
