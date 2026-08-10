import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import { getPublicTournaments } from '../../services/tournamentService'
import { getAllPlans } from '../../services/subscriptionPlanService'
import { HiLocationMarker, HiStar, HiArrowRight, HiShieldCheck, HiOutlineDesktopComputer, HiOutlineCalendar, HiOutlineShieldCheck } from 'react-icons/hi'
import { IoFootball, IoGameController, IoTrophyOutline, IoPeopleOutline, IoLocationOutline } from 'react-icons/io5'
import { GiCricketBat, GiAxeInLog } from 'react-icons/gi'
import { MdStadium, MdPayments, MdQrCodeScanner } from 'react-icons/md'
import { RiTrophyFill, RiGamepadFill } from 'react-icons/ri'
import TurfSearchBar from '../../components/TurfSearchBar'
import TurfResultsGrid from '../../components/TurfResultsGrid'
import TurfMapExplorer from '../../components/TurfMapExplorer'
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

/* ── MOCK DATA (Purged and Sport-Limited) ── */
const sports = [
    { name: 'Football', slug: 'Football', icon: '⚽', venues: 120 },
    { name: 'Cricket', slug: 'Cricket', icon: '🏏', venues: 95 },
]

const allTurfs = [
    { id: 1, name: 'SportZone Arena', location: 'Andheri West, Mumbai', city: 'Mumbai', rating: 4.8, price: 1200, image: '/images/turf1.png', sports: ['Cricket', 'Football'], amenities: ['Floodlights', 'Parking', 'Washroom'], lat: 19.1136, lng: 72.8697 },
    { id: 2, name: 'Champion Cricket Ground', location: 'Koramangala, Bangalore', city: 'Bangalore', rating: 4.9, price: 1500, image: '/images/turf2.png', sports: ['Cricket'], amenities: ['Floodlights', 'Seating', 'Drinking Water'], lat: 12.9352, lng: 77.6245 },
    { id: 3, name: 'GameVault Center', location: 'Koramangala, Bangalore', city: 'Bangalore', rating: 4.9, price: 1200, image: '/images/turf3.png', sports: ['Football', 'Cricket'], amenities: ['Floodlights', 'Parking', 'Seating', 'Washroom'], lat: 12.9698, lng: 77.7500 },
    { id: 4, name: 'ProKick Stadium', location: 'Indiranagar, Bangalore', city: 'Bangalore', rating: 4.7, price: 1400, image: '/images/turf4.png', sports: ['Football'], amenities: ['Floodlights', 'Parking', 'Washroom'], lat: 12.9784, lng: 77.6408 },
    { id: 5, name: 'ProPlay Arena', location: 'Vashi, Navi Mumbai', city: 'Mumbai', rating: 4.5, price: 1000, image: '/images/turf4.png', sports: ['Football'], amenities: ['Floodlights', 'Parking'], lat: 19.0330, lng: 73.0297 },
    { id: 6, name: 'Royal Cricket Ground', location: 'Vijay Nagar, Indore', city: 'Indore', rating: 4.7, price: 1000, image: '/images/turf5.png', sports: ['Cricket'], amenities: ['Floodlights', 'Parking', 'Drinking Water'], lat: 22.7533, lng: 75.8937 },
    { id: 7, name: 'DunkZone', location: 'Bandra, Mumbai', city: 'Mumbai', rating: 4.3, price: 750, image: '/images/turf2.png', sports: ['Football'], amenities: ['Floodlights', 'Parking'], lat: 19.0596, lng: 72.8295 },
    { id: 8, name: 'PixelArena', location: 'HSR Layout, Bangalore', city: 'Bangalore', rating: 4.8, price: 1500, image: '/images/turf6.png', sports: ['Football', 'Cricket'], amenities: ['Floodlights', 'Parking', 'Washroom', 'Seating', 'Drinking Water', 'AC'], lat: 12.9121, lng: 77.6446 },
    { id: 9, name: 'Skyline Football Turf', location: 'Powai, Mumbai', city: 'Mumbai', rating: 4.6, price: 1400, image: '/images/turf6.png', sports: ['Football'], amenities: ['Floodlights', 'Washroom'], lat: 19.1176, lng: 72.9060 },
    { id: 10, name: 'StrikeZone Cricket', location: 'Noida, Delhi', city: 'Delhi', rating: 4.6, price: 850, image: '/images/turf7.png', sports: ['Cricket'], amenities: ['Floodlights', 'Parking', 'Washroom', 'Drinking Water'], lat: 28.5355, lng: 77.3910 },
    { id: 11, name: 'Master Blaster Cricket', location: 'Saket, Delhi', city: 'Delhi', rating: 4.8, price: 1100, image: '/images/turf7.png', sports: ['Cricket'], amenities: ['Floodlights', 'Equipment'], lat: 28.5244, lng: 77.2167 },
    { id: 12, name: 'Pune Football Arena', location: 'Kothrud, Pune', city: 'Pune', rating: 4.5, price: 1000, image: '/images/turf2.png', sports: ['Football'], amenities: ['Floodlights', 'Parking', 'Washroom', 'Seating'], lat: 18.5074, lng: 73.8077 },
    { id: 13, name: 'Spike Football Turf', location: 'Bhawarkua, Indore', city: 'Indore', rating: 4.6, price: 500, image: '/images/turf1.png', sports: ['Football'], amenities: ['Floodlights', 'Parking', 'Washroom'], lat: 22.6953, lng: 75.8690 },
    { id: 14, name: 'Indore Sports Complex', location: 'LIG Colony, Indore', city: 'Indore', rating: 4.9, price: 1200, image: '/images/turf3.png', sports: ['Football', 'Cricket'], amenities: ['Floodlights', 'Parking', 'Seating', 'Washroom', 'AC'], lat: 22.7380, lng: 75.8916 },
    { id: 15, name: 'Rajiv Gandhi Stadium Turf', location: 'Navlakha, Indore', city: 'Indore', rating: 4.5, price: 700, image: '/images/turf4.png', sports: ['Football', 'Cricket'], amenities: ['Floodlights', 'Parking', 'Seating', 'Drinking Water'], lat: 22.7000, lng: 75.8752 },
]

export default function HomePage() {
    const navigate = useNavigate()
    const resultsRef = useRef(null)
    const subReveal = useReveal()
    const tourneyReveal = useReveal()
    const ecosystemReveal = useReveal()
    const searchReveal = useReveal()

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

    /* ── Fetch Upcoming Tournaments & Subscription Plans ── */
    useEffect(() => {
        getPublicTournaments().then(res => {
            if (res?.success && Array.isArray(res?.data)) {
                setUpcomingTournaments(res.data.slice(0, 4))
            }
        }).catch(() => { })

        getAllPlans().then(res => {
            if (res?.success && Array.isArray(res?.data)) {
                setHomePlans(res.data.filter(p => p && p.status === 'active'))
            }
        }).catch(() => { })
    }, [])

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

    const getDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 9999
        const R = 6371 // km
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    /* ── Filtered Turfs ── */
    const filteredTurfs = allTurfs.map(t => ({
        ...t,
        distance: userLocation ? getDistance(userLocation.lat, userLocation.lng, t.lat, t.lng) : null
    })).filter(t => {
        if (appliedFilters.location) {
            const locFilter = appliedFilters.location.toLowerCase().trim()
            const matchCity = t.city.toLowerCase().includes(locFilter) || locFilter.includes(t.city.toLowerCase())
            const matchLocation = t.location ? t.location.toLowerCase().includes(locFilter) : false
            const matchName = t.name ? t.name.toLowerCase().includes(locFilter) : false
            if (!matchCity && !matchLocation && !matchName) return false
        }
        if (appliedFilters.sport && !t.sports.some(s => s.toLowerCase() === appliedFilters.sport.toLowerCase())) return false

        return true
    }).sort((a, b) => {
        if (userLocation && a.distance !== null && b.distance !== null) {
            return a.distance - b.distance
        }
        return b.rating - a.rating
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

    return (
        <div className="bg-white relative selection:bg-[#C8FF2E]/40 overflow-x-hidden min-h-screen text-[#111827]">

            {/* ══════════════════════════════════════════════
                AIRBNB-STYLE SEARCH & CATEGORIES
            ══════════════════════════════════════════════ */}
            <section className="pt-[74px] md:pt-[80px] pb-0 bg-white relative z-40">
                <div className="w-full px-6 lg:px-12 max-w-[1400px] mx-auto transform translate-y-[7px]">
                    <TurfSearchBar
                        values={searchValues}
                        onChange={handleSearchChange}
                        onSearch={handleSearch}
                        onClear={clearFilters}
                    />
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                POPULAR TURFS GRID
            ══════════════════════════════════════════════ */}
            <div ref={resultsRef} className="relative z-30 pt-0 pb-4">
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
                            const isOpen = t.status === 'Approved'
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
                    <div className="text-center mb-16">
                        <span className="text-[#16A34A] text-[10px] font-black uppercase tracking-[0.25em] bg-green-50 border border-green-200 px-4 py-1.5 rounded-full shadow-sm">Membership Access</span>
                        <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tight text-[#111827] mt-3 mb-1.5">
                            Subscription <span className="text-[#16A34A] underline decoration-[#C8FF2E] decoration-4 underline-offset-4">Plans</span>
                        </h2>
                        <p className="text-xs text-[#6B7280] max-w-lg mx-auto font-semibold leading-relaxed">Elevate your game. Unlock unlimited field bookings, priority access, and tactical squad advantages.</p>
                    </div>

                    <div
                        ref={subReveal.ref}
                        className={`grid grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto gap-8 items-start transition-all duration-[1000ms] ease-out ${subReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                            }`}
                    >
                        {(homePlans.length > 0 ? homePlans.map((p, idx) => {
                            const priceVal = p.monthlyPricing?.price ?? 0;
                            const pNameLower = (p.planName || '').toLowerCase();
                            let accent = 'blue';
                            if (p.isPopular || pNameLower.includes('enterprise') || pNameLower.includes('premium')) accent = 'emerald';
                            else if (priceVal === 0 || pNameLower.includes('starter') || pNameLower.includes('free')) accent = 'slate';

                            return {
                                name: p.planName,
                                price: priceVal.toLocaleString('en-IN'),
                                period: priceVal === 0 ? '/TRIAL' : '/MO',
                                desc: p.description ? p.description.toUpperCase() : 'STANDARD OPERATIONAL ACCESS',
                                accent,
                                popular: Boolean(p.isPopular),
                                features: p.features && p.features.length > 0 ? p.features : ['Standard Platform Support']
                            };
                        }) : [
                            {
                                name: 'Starter Plan',
                                price: '999',
                                period: '/MO',
                                desc: 'IDEAL FOR SINGLE TURF OWNERS GETTING STARTED.',
                                accent: 'slate',
                                features: ['Online Slot Booking', 'Basic Analytics', 'Email Notifications', 'Standard Support']
                            },
                            {
                                name: 'Professional Plan',
                                price: '2,499',
                                period: '/MO',
                                desc: 'PERFECT FOR GROWING MULTI-TURF SPORTS COMPLEXES.',
                                accent: 'emerald',
                                popular: true,
                                features: ['All Starter Features', 'Multi-Branch Management', 'Advanced Analytics & Exports', 'POS Integration']
                            },
                            {
                                name: 'Enterprise Arena',
                                price: '4,999',
                                period: '/MO',
                                desc: 'CUSTOM TAILORED PLAN FOR LARGE STADIUM & TURF NETWORKS.',
                                accent: 'blue',
                                features: ['Unlimited Branches', 'Dedicated Account Manager', 'Custom Billing Integrations', 'White Label Branding']
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

                                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[#E5E7EB]">
                                    <span className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest">INR</span>
                                    <span className="text-3xl font-black text-[#111827]">{p.price}</span>
                                    <span className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest">{p.period}</span>
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {p.features.map((f, fidx) => (
                                        <li key={fidx} className="flex items-start gap-2.5">
                                            <span className="w-2 h-2 rounded-full bg-[#16A34A] mt-1 shrink-0" />
                                            <span className="text-[10px] font-semibold text-[#111827] uppercase tracking-wide">{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => navigate('/membership')}
                                    className="w-full py-3.5 text-[10px] font-black italic tracking-[0.2em] uppercase rounded-[14px] border transition-all duration-300 cursor-pointer bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] border-[#B5F000] shadow-[0_12px_25px_rgba(184,255,44,0.28)]"
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
                                title: 'Smart Booking Engine',
                                desc: 'Realtime session scheduler with dynamic pricing, peak-hour management, and weather-based auto-adjustments.',
                                icon: MdStadium,
                            },
                            {
                                title: 'Multi-Sport Turf Hub',
                                desc: 'Central architecture coordinating grass, clay, and turf-based athletic fields on a unified management ledger.',
                                icon: GiCricketBat,
                            },
                            {
                                title: 'POS Powered Billing',
                                desc: 'Integrated cash splits, canteen orders, hardware rentals, and instant checkout with split payment engines.',
                                icon: MdPayments,
                            },
                            {
                                title: 'QR Access Controls',
                                desc: 'Contactless slot verification, secure locker systems, and automated session-duration tracking checks.',
                                icon: MdQrCodeScanner,
                            },
                            {
                                title: 'Bracket Engine',
                                desc: 'Automated tournament scheduling, squad bracket generators, and live leaderboard tracking systems.',
                                icon: RiTrophyFill,
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
        </div>
    )
}
