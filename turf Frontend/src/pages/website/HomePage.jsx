import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import { getPublicTournaments } from '../../services/tournamentService'
import { HiLocationMarker, HiStar, HiArrowRight, HiShieldCheck, HiOutlineDesktopComputer, HiOutlineCalendar, HiOutlineShieldCheck } from 'react-icons/hi'
import { IoFootball, IoGameController, IoTrophyOutline, IoPeopleOutline, IoLocationOutline } from 'react-icons/io5'
import { GiCricketBat, GiAxeInLog } from 'react-icons/gi'
import { MdStadium, MdPayments, MdQrCodeScanner } from 'react-icons/md'
import { RiTrophyFill, RiGamepadFill } from 'react-icons/ri'
import TurfSearchBar from '../../components/TurfSearchBar'
import TurfResultsGrid from '../../components/TurfResultsGrid'
import CategoryBar from '../../components/CategoryBar'
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
    { id: 1, name: 'Green Arena Football Turf', location: 'Andheri West, Mumbai', city: 'Mumbai', rating: 4.8, price: 1200, image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80&fit=crop', sports: ['Football'], amenities: ['Floodlights', 'Parking', 'Washroom'], lat: 19.1136, lng: 72.8697 },
    { id: 2, name: 'Champion Cricket Academy', location: 'Koramangala, Bangalore', city: 'Bangalore', rating: 4.9, price: 1500, image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80&fit=crop', sports: ['Cricket'], amenities: ['Floodlights', 'Seating', 'Drinking Water'], lat: 12.9352, lng: 77.6245 },
    { id: 4, name: 'Elite Sports Complex', location: 'Whitefield, Bangalore', city: 'Bangalore', rating: 4.6, price: 2000, image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80&fit=crop', sports: ['Football', 'Cricket'], amenities: ['Floodlights', 'Parking', 'Seating', 'Washroom'], lat: 12.9698, lng: 77.7500 },
    { id: 5, name: 'ProPlay Arena', location: 'Vashi, Navi Mumbai', city: 'Mumbai', rating: 4.5, price: 1000, image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80&fit=crop', sports: ['Football'], amenities: ['Floodlights', 'Parking'], lat: 19.0330, lng: 73.0297 },
    { id: 6, name: 'Royal Cricket Ground', location: 'Vijay Nagar, Indore', city: 'Indore', rating: 4.7, price: 600, image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80&fit=crop', sports: ['Cricket'], amenities: ['Floodlights', 'Parking', 'Drinking Water'], lat: 22.7533, lng: 75.8937 },
    { id: 9, name: 'Skyline Football Turf', location: 'Powai, Mumbai', city: 'Mumbai', rating: 4.6, price: 1400, image: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&q=80&fit=crop', sports: ['Football'], amenities: ['Floodlights', 'Washroom'], lat: 19.1176, lng: 72.9060 },
    { id: 11, name: 'Master Blaster Cricket', location: 'Saket, Delhi', city: 'Delhi', rating: 4.8, price: 1100, image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80&fit=crop', sports: ['Cricket'], amenities: ['Floodlights', 'Equipment'], lat: 28.5244, lng: 77.2167 },
    { id: 13, name: 'Spike Football Turf', location: 'Bhawarkua, Indore', city: 'Indore', rating: 4.6, price: 500, image: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80&fit=crop', sports: ['Football'], amenities: ['Floodlights', 'Parking', 'Washroom'], lat: 22.6953, lng: 75.8690 },
    { id: 14, name: 'Indore Sports Arena', location: 'LIG Colony, Indore', city: 'Indore', rating: 4.9, price: 800, image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80&fit=crop', sports: ['Football', 'Cricket'], amenities: ['Floodlights', 'Parking', 'Seating', 'Washroom', 'AC'], lat: 22.7380, lng: 75.8916 },
    { id: 15, name: 'Rajiv Gandhi Stadium Turf', location: 'Navlakha, Indore', city: 'Indore', rating: 4.5, price: 700, image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80&fit=crop', sports: ['Football', 'Cricket'], amenities: ['Floodlights', 'Parking', 'Seating', 'Drinking Water'], lat: 22.7000, lng: 75.8752 },
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

    /* ── Fetch Upcoming Tournaments ── */
    useEffect(() => {
        getPublicTournaments().then(res => {
            if (res.success && Array.isArray(res.data)) {
                setUpcomingTournaments(res.data.slice(0, 4))
            }
        }).catch(() => {})
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
        if (appliedFilters.location && t.city.toLowerCase() !== appliedFilters.location.toLowerCase()) return false
        if (appliedFilters.sport && !t.sports.some(s => s.toLowerCase() === appliedFilters.sport.toLowerCase())) return false

        // Only show turfs in user's city (within ~65km) by default
        if (!appliedFilters.location && userLocation && t.distance !== null && t.distance > 65) return false

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

    /* ── Handle explicit search (Commit and Scroll) ── */
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
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
    }, [])

    /* ── Clear filters ── */
    const clearFilters = () => {
        const empty = { location: '', sport: '', date: '', time: '', players: 10 }
        setSearchValues(empty)
        setAppliedFilters(empty)
        setShowResults(false)
    }

    return (
        <div className="bg-[#020617] relative selection:bg-blue-600/30 overflow-x-hidden min-h-screen text-slate-100">

            {/* ══════════════════════════════════════════════
                CINEMATIC HERO FIRST SCREEN SECTION
            ══════════════════════════════════════════════ */}
            <section className="relative flex flex-col pt-[60px] pb-16 lg:pb-24 z-40 justify-center min-h-[95vh] md:min-h-screen">

                {/* ── CINEMATIC GLOWING GRID BACKGROUND ── */}
                <style>{`
                    .collage-card {
                        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .collage-card:hover {
                        transform: scale(1.08) translateY(-10px) rotate(0deg) !important;
                        z-index: 50;
                        box-shadow: 0 0 30px rgba(25, 230, 140, 0.4);
                        border-color: rgba(25, 230, 140, 0.8);
                    }
                `}</style>
                <div className="absolute inset-0 z-0 bg-[#020617] overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518605368461-1e1e38ce8ba8?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-[0.3] mix-blend-screen" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/95 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                    {/* Soft Fog / Glow */}
                    <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-[#19E68C]/10 blur-[150px] rounded-full pointer-events-none" />
                </div>

                <div className="relative z-30 w-full px-6 lg:px-12 max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    
                    {/* LEFT CONTENT */}
                    <div className="flex-1 flex flex-col items-start text-left w-full max-w-2xl pt-4">


                        {/* Headings */}
                        <h1 className="text-3xl sm:text-4xl md:text-[56px] font-black text-white leading-[1.1] tracking-tight mb-4">
                            Play Any <span className="text-[#19E68C] drop-shadow-[0_0_15px_rgba(25,230,140,0.4)]">Sport.</span><br />
                            Book Any <span className="text-[#19E68C] drop-shadow-[0_0_15px_rgba(25,230,140,0.4)]">Turf.</span><br />
                            Join Any <span className="text-[#19E68C] drop-shadow-[0_0_15px_rgba(25,230,140,0.4)]">Tournament.</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-sm md:text-base text-slate-400 font-medium max-w-xl mb-6 leading-relaxed">
                            Book Football, Cricket, Badminton, Pickleball,<br className="hidden sm:block" />
                            Box Cricket, Tennis and more from verified venues near you.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-8">
                            <button onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-6 py-3 text-sm bg-[#19E68C] hover:bg-[#15c577] text-[#020617] font-black rounded-xl transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(25,230,140,0.3)] hover:shadow-[0_0_30px_rgba(25,230,140,0.5)]">
                                Find Turfs <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={() => navigate('/tournaments')} className="w-full sm:w-auto px-6 py-3 text-sm bg-white/5 border border-white/20 hover:border-white/50 hover:bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl transition-all text-center">
                                Explore Tournaments
                            </button>
                        </div>

                        {/* Trust Statistics */}
                        <div className="flex justify-between items-start w-full max-w-2xl border-t border-white/10 pt-6">
                            <div>
                                <div className="text-xl font-black text-white flex items-center justify-center gap-1"><IoTrophyOutline className="text-[#19E68C] w-4 h-4" /> 250+</div>
                                <div className="text-[9px] text-center uppercase tracking-wider font-bold text-slate-500 mt-1">Venues</div>
                            </div>
                            <div>
                                <div className="text-xl font-black text-white flex items-center justify-center gap-1"><IoPeopleOutline className="text-[#19E68C] w-4 h-4" /> 12K+</div>
                                <div className="text-[9px] text-center uppercase tracking-wider font-bold text-slate-500 mt-1">Players</div>
                            </div>
                            <div>
                                <div className="text-xl font-black text-white flex items-center justify-center gap-1"><HiOutlineCalendar className="text-[#19E68C] w-4 h-4" /> 900+</div>
                                <div className="text-[9px] text-center uppercase tracking-wider font-bold text-slate-500 mt-1">Events</div>
                            </div>
                            <div>
                                <div className="text-xl font-black text-white flex items-center justify-center gap-1"><IoLocationOutline className="text-[#19E68C] w-4 h-4" /> 35+</div>
                                <div className="text-[9px] text-center uppercase tracking-wider font-bold text-slate-500 mt-1">Cities</div>
                            </div>
                            <div>
                                <div className="text-xl font-black text-white flex items-center justify-center gap-1"><span className="text-[#19E68C] text-base">★</span> 4.9</div>
                                <div className="text-[9px] text-center uppercase tracking-wider font-bold text-slate-500 mt-1">Rating</div>
                            </div>
                            <div>
                                <div className="text-xl font-black text-white flex items-center justify-center gap-1"><HiOutlineShieldCheck className="text-[#19E68C] w-4 h-4" /> 99%</div>
                                <div className="text-[9px] text-center uppercase tracking-wider font-bold text-slate-500 mt-1">Verified</div>
                            </div>
                        </div>

                        {/* SEARCH SECTION (MOVED DOWN) */}
                        <div 
                            ref={searchReveal.ref}
                            className={`relative z-50 w-full mt-10 transition-all duration-300 ease-out ${searchReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                        >
                            <TurfSearchBar
                                values={searchValues}
                                onChange={handleSearchChange}
                                onSearch={handleSearch}
                                onClear={clearFilters}
                            />
                        </div>
                    </div>

                    {/* RIGHT CONTENT (PREMIUM COLLAGE) */}
                    <div className="flex-1 w-full relative hidden lg:block h-[500px] perspective-1000 origin-center scale-[0.85]">
                        <div className="absolute inset-0 flex items-center justify-center">
                            
                            {/* Card 1 - Football (Now in Cricket's position) */}
                            <div className="collage-card absolute w-[260px] h-[340px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-30" style={{ transform: 'translate(40px, -150px) rotate(4deg)' }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                <img src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Football" />
                                <div className="absolute bottom-4 left-4 z-20 text-white font-bold tracking-widest uppercase text-sm">Football</div>
                            </div>
                            
                            {/* Card 2 - Cricket (Now in Football's position) */}
                            <div className="collage-card absolute w-[220px] h-[300px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-20" style={{ transform: 'translate(-140px, -100px) rotate(-8deg)' }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Cricket" />
                                <div className="absolute bottom-4 left-4 z-20 text-white font-bold tracking-widest uppercase text-sm">Cricket</div>
                            </div>
                            
                            {/* Card 3 - Basketball */}
                            <div className="collage-card absolute w-[200px] h-[260px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-10" style={{ transform: 'translate(200px, -30px) rotate(12deg)' }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Basketball" />
                                <div className="absolute bottom-4 left-4 z-20 text-white font-bold tracking-widest uppercase text-sm">Basketball</div>
                            </div>
                            
                            {/* Card 4 - Badminton */}
                            <div className="collage-card absolute w-[240px] h-[320px] rounded-2xl overflow-hidden border border-[#19E68C]/40 shadow-[0_0_30px_rgba(25,230,140,0.15)] z-40" style={{ transform: 'translate(-100px, 120px) rotate(5deg)' }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10" />
                                <img src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Badminton" />
                                <div className="absolute bottom-4 left-4 z-20 text-[#19E68C] font-black tracking-widest uppercase text-sm drop-shadow-md">Badminton</div>
                            </div>

                            {/* Card 5 - Tennis */}
                            <div className="collage-card absolute w-[220px] h-[280px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-20" style={{ transform: 'translate(130px, 140px) rotate(-6deg)' }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                <img src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Tennis" />
                                <div className="absolute bottom-4 left-4 z-20 text-white font-bold tracking-widest uppercase text-sm">Tennis</div>
                            </div>
                            
                            {/* Card 6 - Pickleball */}
                            <div className="collage-card absolute w-[180px] h-[220px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-10" style={{ transform: 'translate(-240px, 50px) rotate(-15deg)' }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                <img src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Pickleball" />
                                <div className="absolute bottom-4 left-4 z-20 text-white font-bold tracking-widest uppercase text-sm">Pickleball</div>
                            </div>

                        </div>
                    </div>
                </div>

            </section>
            


            {/* ══════════════════════════════════════════════
                PREMIUM GOOGLE MAPS NEARBY SEARCH SECTION
            ══════════════════════════════════════════════ */}
            <div ref={resultsRef} className="relative z-30">
                {showResults ? (
                    <div className="animate-fade-in duration-500 ease-out transition-all">
                        <TurfMapExplorer />
                    </div>
                ) : (
                    <TurfResultsGrid
                        turfs={filteredTurfs.slice(0, 8)}
                        searchValues={searchValues}
                        recentSearches={recentSearches}
                        onClear={clearFilters}
                    />
                )}
            </div>

            {/* ══════════════════════════════════════════════
                SECTION 2: ENERGETIC UPCOMING TOURNAMENTS
            ══════════════════════════════════════════════ */}
            <section className="pt-6 pb-8 bg-[#020617] border-t border-white/5 relative overflow-hidden">
                {/* Visual Glow */}
                <div className="absolute top-[20%] right-[10%] w-[35vw] h-[35vw] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                    <div className="text-center mb-6">
                        <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.25em] bg-blue-500/10 border border-blue-500/25 px-4 py-1.5 rounded-full">Competitive Arena</span>
                        <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tight text-white mt-3 mb-1.5">
                            Upcoming <span className="text-blue-500">Tournaments</span>
                        </h2>
                        <p className="text-xs text-slate-400 max-w-lg mx-auto font-semibold">Bring your squad, dominate division tables, and earn high-stakes victory across the region</p>
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
                            const statusColor = spotsLeft <= 3 ? 'border-amber-500/35 bg-amber-500/5 text-amber-400' : 'border-emerald-500/35 bg-emerald-500/5 text-emerald-400'
                            const statusText = !isOpen ? t.status : (spotsLeft <= 3 ? 'Few Slots Left' : 'Registration Open')
                            const colors = ['from-blue-600 to-indigo-600', 'from-emerald-600 to-teal-600', 'from-purple-600 to-indigo-600', 'from-amber-600 to-orange-600']
                            return (
                            <div
                                key={t.id || t._id || idx}
                                className="group bg-slate-900 border border-white/5 hover:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:scale-[1.02] relative"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4 gap-2">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${statusColor}`}>
                                            {statusText}
                                        </span>
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wide">{t.sport || 'Sports'}</span>
                                    </div>
                                    <h3 className="text-lg font-black uppercase text-white tracking-tight mb-4">{t.title || t.name}</h3>

                                    <div className="p-3 bg-slate-950 border border-white/5 rounded-xl space-y-2 mb-6">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-slate-500 font-bold uppercase tracking-wide">GRAND PRIZE</span>
                                            <span className="text-white font-black">{t.prize || `₹${t.entryFee || 0}`} Cash Pool</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-slate-500 font-bold uppercase tracking-wide">ENTRY FEE</span>
                                            <span className="text-slate-300 font-black">₹{t.entryFee || 0} / SQUAD</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-white/5 text-slate-400">
                                            <span className="font-semibold uppercase tracking-wider">{spotsLeft} / {t.maxTeams || 16} SLOTS REMAINING</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => navigate(`/tournaments/${t.id || t._id}`)} className={`w-full py-3 bg-gradient-to-r ${colors[idx % colors.length]} text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:scale-[1.02]`}>
                                    Register Squad
                                </button>
                            </div>
                        )})}
                    </div>
                </div>
            </section>
            {/* ══════════════════════════════════════════════
                NEW SECTION: PREMIUM SUBSCRIPTION PLANS
            ══════════════════════════════════════════════ */}
            <section id="subscription" className="pt-8 pb-20 bg-[#030712] border-t border-white/5 relative overflow-hidden">
                {/* Stunning Radial Glow */}
                <div className="absolute top-[30%] left-[20%] w-[45vw] h-[45vw] bg-emerald-500/5 blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-[#16a34a] text-[10px] font-black uppercase tracking-[0.25em] bg-[#16a34a]/10 border border-[#16a34a]/25 px-4 py-1.5 rounded-full">Membership Access</span>
                        <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tight text-white mt-3 mb-1.5">
                            Subscription <span className="text-[#16a34a]">Plans</span>
                        </h2>
                        <p className="text-xs text-slate-400 max-w-lg mx-auto font-semibold">Elevate your game. Unlock unlimited field bookings, priority access, and tactical squad advantages.</p>
                    </div>

                    <div
                        ref={subReveal.ref}
                        className={`grid grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto gap-8 items-start transition-all duration-[1000ms] ease-out ${subReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                            }`}
                    >
                        {[
                            {
                                name: '7-Day Free Trial',
                                price: '0',
                                period: '/7 DAYS',
                                desc: 'NO CREDIT CARD REQUIRED',
                                color: 'from-slate-500 to-slate-700',
                                accent: 'slate',
                                features: ['Full platform access for 7 days', 'Book up to 1 field / court', 'Join 1 open tournament free', 'Standard customer service']
                            },
                            {
                                name: 'Basic Plan',
                                price: '499',
                                period: '/MO',
                                desc: 'RECOMMENDED FOR REGULARS',
                                color: 'from-blue-500 to-indigo-600',
                                accent: 'blue',
                                features: ['10 Field Bookings / Month', 'Squad / Team Authorization', 'Tournament entry access', 'Priority customer service']
                            },
                            {
                                name: 'Premium Plan',
                                price: '1,499',
                                period: '/MO',
                                desc: 'ELITE UNLIMITED OPERATIONS',
                                color: 'from-[#16a34a] to-emerald-600',
                                accent: 'emerald',
                                popular: true,
                                features: ['Unlimited Tactical Bookings', 'Full Arena & Court Access', '24/7 VIP Dedicated Link', 'Private Tournament Hosting']
                            }
                        ].map((p, idx) => (
                            <div
                                key={idx}
                                className={`relative group flex flex-col bg-slate-900 border transition-all duration-300 hover:-translate-y-1.5 rounded-2xl p-6 h-full ${p.popular
                                    ? 'border-[#16a34a]/30 shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(22,163,74,0.1)] z-20'
                                    : 'border-white/5 hover:border-slate-800'
                                    }`}
                            >
                                {p.popular && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30">
                                        <span className="bg-[#16a34a] text-white text-[9px] font-black px-3.5 py-1 rounded-full shadow-lg tracking-widest uppercase italic">
                                            MOST POPULAR
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-lg font-black text-white italic tracking-tighter uppercase mb-1">{p.name}</h3>
                                <p className="text-[9px] font-bold text-slate-500 tracking-wider mb-4 uppercase">{p.desc}</p>

                                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-white/5">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">INR</span>
                                    <span className="text-3xl font-black text-white">{p.price}</span>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{p.period}</span>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {p.features.map((f, fidx) => (
                                        <li key={fidx} className="flex items-center gap-2.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => navigate('/membership')}
                                    className={`w-full py-3.5 text-[10px] font-black italic tracking-[0.2em] uppercase rounded-xl border transition-all duration-300 cursor-pointer ${p.accent === 'slate'
                                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                            : p.accent === 'blue'
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500/20 text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                                : 'bg-gradient-to-r from-emerald-500 to-[#16a34a] border-emerald-500/20 text-white hover:from-emerald-400 hover:to-green-500 hover:shadow-[0_0_20px_rgba(22,163,74,0.3)]'
                                        }`}
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
            <section className="py-10 bg-[#050b18] border-t border-white/5 relative overflow-hidden">
                {/* Ambient Glow Effects */}
                <div className="absolute top-[10%] left-[5%] w-[50vw] h-[50vw] bg-blue-600/[0.04] blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[10%] right-[5%] w-[40vw] h-[40vw] bg-emerald-500/[0.03] blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute top-[40%] left-[50%] w-[30vw] h-[30vw] bg-purple-600/[0.03] blur-[120px] rounded-full pointer-events-none -translate-x-1/2" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white mb-3 leading-[1.1]">
                            Why Choose{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">SportMatrix</span>
                        </h2>
                        <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
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
                                gradient: 'from-blue-500 to-cyan-500',
                                borderGlow: 'hover:border-blue-500/40 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(59,130,246,0.05)]',
                                iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-blue-500/20'
                            },
                            {
                                title: 'Multi-Sport Turf Hub',
                                desc: 'Central architecture coordinating grass, clay, and turf-based athletic fields on a unified management ledger.',
                                icon: GiCricketBat,
                                gradient: 'from-emerald-500 to-green-500',
                                borderGlow: 'hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15),inset_0_0_20px_rgba(16,185,129,0.05)]',
                                iconBg: 'bg-gradient-to-br from-emerald-500/20 to-green-500/10 border-emerald-500/20'
                            },
                            {
                                title: 'POS Powered Billing',
                                desc: 'Integrated cash splits, canteen orders, hardware rentals, and instant checkout with split payment engines.',
                                icon: MdPayments,
                                gradient: 'from-violet-500 to-purple-500',
                                borderGlow: 'hover:border-violet-500/40 hover:shadow-[0_8px_30px_rgba(139,92,246,0.15),inset_0_0_20px_rgba(139,92,246,0.05)]',
                                iconBg: 'bg-gradient-to-br from-violet-500/20 to-purple-500/10 border-violet-500/20'
                            },
                            {
                                title: 'QR Access Controls',
                                desc: 'Contactless slot verification, secure locker systems, and automated session-duration tracking checks.',
                                icon: MdQrCodeScanner,
                                gradient: 'from-amber-500 to-orange-500',
                                borderGlow: 'hover:border-amber-500/40 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15),inset_0_0_20px_rgba(245,158,11,0.05)]',
                                iconBg: 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/20'
                            },
                            {
                                title: 'Bracket Engine',
                                desc: 'Automated tournament scheduling, squad bracket generators, and live leaderboard tracking systems.',
                                icon: RiTrophyFill,
                                gradient: 'from-rose-500 to-pink-500',
                                borderGlow: 'hover:border-rose-500/40 hover:shadow-[0_8px_30px_rgba(244,63,94,0.15),inset_0_0_20px_rgba(244,63,94,0.05)]',
                                iconBg: 'bg-gradient-to-br from-rose-500/20 to-pink-500/10 border-rose-500/20'
                            }
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className={`group bg-slate-950/60 border border-white/[0.06] rounded-2xl p-7 flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-2 backdrop-blur-xl ${item.borderGlow}`}
                            >
                                {/* Icon Container */}
                                <div className={`w-14 h-14 ${item.iconBg} border rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl relative`}>
                                    <item.icon className="w-7 h-7 text-white/80 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-sm font-black uppercase text-white tracking-wider mb-3 leading-tight">{item.title}</h3>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                                {/* Bottom accent line */}
                                <div className={`w-8 h-0.5 bg-gradient-to-r ${item.gradient} rounded-full mt-5 opacity-40 group-hover:opacity-100 group-hover:w-12 transition-all duration-500`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                SECTION 5: OWNER COMMAND CENTRAL CTA
            ══════════════════════════════════════════════ */}
            <section className="py-10 bg-[#050b18] border-t border-white/5 relative overflow-hidden">
                {/* Lights decoration */}
                <div className="absolute top-0 left-[20%] w-[35vw] h-[35vw] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-[20%] w-[35vw] h-[35vw] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
                    <div className="bg-slate-900 border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-[0_30px_70px_rgba(0,0,0,0.7)] relative overflow-hidden backdrop-blur-md">
                        {/* Glowing spot in capsule */}
                        <div className="absolute -top-[50%] left-[50%] -translate-x-[50%] w-[80%] h-[80%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                        <span className="text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] bg-blue-500/10 border border-blue-500/25 px-4 py-1.5 rounded-full inline-block mb-4">
                            Enterprise Operations
                        </span>

                        <h2 className="text-2xl sm:text-4xl font-black italic uppercase text-white tracking-tight mb-4">
                            “Run Your Turf Professionally”
                        </h2>

                        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 font-semibold">
                            Scale your business with SportMatrix. Oversee match bookings, handle cashless POS billing, launch tournaments, set subscription membership passes, and audit multi-branch operations within a unified command dashboard.
                        </p>

                        <div className="flex justify-center items-center">
                            <button onClick={() => navigate('/contact')} className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-[#16a34a] hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(22,163,74,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                                Request Demo & Onboard
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
