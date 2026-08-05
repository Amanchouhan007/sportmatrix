import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { HiLocationMarker, HiStar, HiSearch, HiFilter, HiX, HiRefresh, HiOutlineClock } from 'react-icons/hi'
import TurfSearchBar from '../../components/TurfSearchBar'
import TurfCard from '../../components/TurfCard'

const allTurfs = [
    { id: 1, name: 'SportZone Arena', location: 'Andheri West, Mumbai', city: 'Mumbai', sport: 'Cricket', sports: ['Cricket'], rating: 4.8, reviews: 124, price: 800, amenities: ['Floodlights', 'Parking', 'Washroom', 'Drinking Water'], image: '/images/turf1.png' },
    { id: 3, name: 'GameVault Center', location: 'Koramangala, Bangalore', city: 'Bangalore', sport: 'Multi-Sport', sports: ['Football', 'Cricket'], rating: 4.9, reviews: 203, price: 1200, amenities: ['Floodlights', 'Parking', 'Washroom', 'Seating', 'Drinking Water'], image: '/images/turf2.png' },
    { id: 4, name: 'ProKick Stadium', location: 'Indiranagar, Bangalore', city: 'Bangalore', sport: 'Football', sports: ['Football'], rating: 4.7, reviews: 156, price: 900, amenities: ['Floodlights', 'Parking', 'Washroom'], image: '/images/turf3.png' },
    { id: 6, name: 'NetPoint Arena', location: 'Delhi', city: 'Delhi', sport: 'Football', sports: ['Football'], rating: 4.4, reviews: 65, price: 500, amenities: ['Parking', 'Washroom'], image: '/images/turf4.png' },
    { id: 7, name: 'DunkZone', location: 'Bandra, Mumbai', city: 'Mumbai', sport: 'Football', sports: ['Football'], rating: 4.3, reviews: 48, price: 750, amenities: ['Floodlights', 'Parking'], image: '/images/turf2.png' },
    { id: 8, name: 'PixelArena', location: 'HSR Layout, Bangalore', city: 'Bangalore', sport: 'Multi-Sport', sports: ['Football', 'Cricket'], rating: 4.8, reviews: 178, price: 1500, amenities: ['Floodlights', 'Parking', 'Washroom', 'Seating', 'Drinking Water', 'AC'], image: '/images/turf6.png' },
    { id: 9, name: 'StrikeZone Cricket', location: 'Noida, Delhi', city: 'Delhi', sport: 'Cricket', sports: ['Cricket'], rating: 4.6, reviews: 92, price: 850, amenities: ['Floodlights', 'Parking', 'Washroom', 'Drinking Water'], image: '/images/turf7.png' },
    { id: 10, name: 'Royal Cricket Ground', location: 'Vijay Nagar, Indore', city: 'Indore', sport: 'Cricket', sports: ['Cricket'], rating: 4.7, reviews: 110, price: 600, amenities: ['Floodlights', 'Parking', 'Drinking Water'], image: '/images/turf1.png' },
    { id: 12, name: 'Pune Football Arena', location: 'Kothrud, Pune', city: 'Pune', sport: 'Football', sports: ['Football'], rating: 4.5, reviews: 67, price: 1000, amenities: ['Floodlights', 'Parking', 'Washroom', 'Seating'], image: '/images/turf2.png' },
    { id: 14, name: 'Indore Sports Complex', location: 'LIG Colony, Indore', city: 'Indore', sport: 'Football', sports: ['Football'], rating: 4.9, reviews: 120, price: 800, amenities: ['Floodlights', 'Parking', 'Seating', 'Washroom', 'AC'], image: '/images/turf3.png' },
    { id: 15, name: 'Rajiv Gandhi Stadium Turf', location: 'Navlakha, Indore', city: 'Indore', sport: 'Football', sports: ['Football', 'Cricket'], rating: 4.5, reviews: 88, price: 700, amenities: ['Floodlights', 'Parking', 'Seating', 'Drinking Water'], image: '/images/turf4.png' },
    { id: 17, name: 'Deccan Arena Football', location: 'Madhapur, Hyderabad', city: 'Hyderabad', sport: 'Football', sports: ['Football'], rating: 4.8, reviews: 90, price: 1100, amenities: ['Floodlights', 'Parking', 'Washroom'], image: '/images/turf1.png' },
    { id: 18, name: 'Grand Turf Cricket Ground', location: 'OMR, Chennai', city: 'Chennai', sport: 'Cricket', sports: ['Cricket'], rating: 4.7, reviews: 64, price: 950, amenities: ['Floodlights', 'Seating', 'Drinking Water'], image: '/images/turf6.png' },
    { id: 19, name: 'Metro Sports Club', location: 'Vijay Nagar, Indore', city: 'Indore', sport: 'Multi-Sport', sports: ['Football', 'Cricket'], rating: 4.9, reviews: 145, price: 1300, amenities: ['Floodlights', 'Parking', 'Washroom', 'Seating', 'Drinking Water', 'AC'], image: '/images/turf7.png' },
    { id: 20, name: 'Cyber City Soccer Turf', location: 'Gachibowli, Hyderabad', city: 'Hyderabad', sport: 'Football', sports: ['Football'], rating: 4.6, reviews: 78, price: 1000, amenities: ['Floodlights', 'Parking', 'Washroom'], image: '/images/turf1.png' },
    { id: 21, name: 'Apex Sports Arena', location: 'Whitefield, Bangalore', city: 'Bangalore', sport: 'Multi-Sport', sports: ['Football', 'Cricket'], rating: 4.8, reviews: 112, price: 1100, amenities: ['Floodlights', 'Parking', 'Washroom', 'Drinking Water'], image: '/images/turf4.png' },
]

const sportSlugs = { football: 'Football', cricket: 'Cricket', 'multi-sport': 'Multi-Sport' }
const allAmenities = ['Floodlights', 'Parking', 'Washroom', 'Drinking Water', 'Seating', 'AC']

/* ─── Sidebar width constant ─── */
const SIDEBAR_W = 290   // px

export default function AllTurfsPage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const [city, setCity] = useState(searchParams.get('location') || '')
    const [sport, setSport] = useState('')
    const [search, setSearch] = useState('')
    const [priceRange, setPriceRange] = useState([0, 3000])
    const [minRating, setMinRating] = useState(0)
    const [selectedAmenities, setSelectedAmenities] = useState([])
    const [availableToday, setAvailableToday] = useState(searchParams.get('available') === 'true')
    const [sortBy, setSortBy] = useState('rating')
    const [drawerOpen, setDrawerOpen] = useState(true)

    /* detect mobile/tablet (≤ 767px) — overlay mode */
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    const [searchValues, setSearchValues] = useState({
        location: searchParams.get('location') || '',
        sport: searchParams.get('sport') || '',
        date: '', time: '', players: 10,
    })

    const handleSearchChange = (vals) => setSearchValues(vals)
    const handleSearch = (vals) => {
        setSearchValues(vals)
        setCity(vals.location)
        setSport(vals.sport)
        setSearch('')
    }

    useEffect(() => {
        window.scrollTo(0, 0)
        const loc = searchParams.get('location')
        const sp = searchParams.get('sport')
        const avail = searchParams.get('available')
        if (loc) setCity(loc.charAt(0).toUpperCase() + loc.slice(1))
        if (sp) setSport(sportSlugs[sp] || sp.charAt(0).toUpperCase() + sp.slice(1))
        if (avail === 'true') setAvailableToday(true)
    }, [searchParams])

    const filtered = allTurfs
        .filter(t => {
            if (city && !t.city.toLowerCase().includes(city.toLowerCase())) return false
            if (sport && !t.sports.some(s => s.toLowerCase().includes(sport.toLowerCase())) && !t.sport.toLowerCase().includes(sport.toLowerCase())) return false
            if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.location.toLowerCase().includes(search.toLowerCase())) return false
            if (t.price < priceRange[0] || t.price > priceRange[1]) return false
            if (t.rating < minRating) return false
            if (selectedAmenities.length > 0 && !selectedAmenities.every(a => t.amenities.includes(a))) return false
            return true
        })
        .sort((a, b) => {
            if (sortBy === 'rating') return b.rating - a.rating
            if (sortBy === 'price-low') return a.price - b.price
            if (sortBy === 'price-high') return b.price - a.price
            if (sortBy === 'reviews') return b.reviews - a.reviews
            return 0
        })

    const toggleAmenity = (a) =>
        setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

    const clearFilters = () => {
        setSearchValues({ location: '', sport: '', date: '', time: '', players: 10 })
        setCity(''); setSport(''); setSearch(''); setPriceRange([0, 3000])
        setMinRating(0); setSelectedAmenities([]); setAvailableToday(false); setSortBy('rating')
        setSearchParams({})
    }

    const hasActiveFilters = city || sport || search || priceRange[0] > 0 || priceRange[1] < 3000 || minRating > 0 || selectedAmenities.length > 0
    const activeFilterCount = [city, sport, minRating > 0, selectedAmenities.length > 0, availableToday].filter(Boolean).length

    /* ─── How many grid columns fit in the available content width ─── */
    const gridCols = drawerOpen && !isMobile
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'

    return (
        <div className="h-screen w-screen overflow-hidden bg-[#020617] text-white selection:bg-emerald-500/30 flex flex-col relative">

            {/* Cinematic Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-500/10 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* ── Mobile overlay backdrop ── */}
            {isMobile && drawerOpen && (
                <div
                    className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-sm"
                    onClick={() => setDrawerOpen(false)}
                />
            )}

            {/* ── Fixed Search Bar Section (below Navbar) ── */}
            <div className="w-full shrink-0 pt-[61px] md:pt-[65px] pb-[10px] mb-[10px] bg-[#020617] relative z-40">
                <div className="w-full px-6 lg:px-12 max-w-[1400px] mx-auto">
                    <TurfSearchBar
                        values={searchValues}
                        onChange={handleSearchChange}
                        onSearch={handleSearch}
                        onClear={clearFilters}
                    />
                </div>
            </div>

            {/* ── Main Layout Body (Fixed Sidebar + Scrollable Cards) ── */}
            <div className="flex-1 flex min-h-0 w-full relative z-30 overflow-hidden">

                {/* ── Filter Sidebar ── */}
                <div
                    className={`bg-[#020617] border-r border-white/10 shadow-[4px_0_40px_rgba(0,0,0,0.7)] flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out ${isMobile
                            ? `fixed top-0 left-0 bottom-0 z-[70] w-[290px] ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`
                            : `relative z-30 ${drawerOpen ? 'w-[290px] opacity-100' : 'w-0 opacity-0 border-none pointer-events-none'}`
                        }`}
                >
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between pl-5 pr-3 py-4 border-b border-white/8 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                                <HiFilter className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <span className="text-sm font-black text-white uppercase tracking-widest">Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded-full leading-none">
                                    {activeFilterCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-[9px] text-slate-400 font-bold uppercase tracking-widest hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded-md flex items-center gap-1"
                                >
                                    <HiRefresh className="w-2.5 h-2.5" /> Reset
                                </button>
                            )}
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
                            >
                                <HiX className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Filter Body */}
                    <div className="flex-1 overflow-y-auto pl-5 pr-3 py-4 flex flex-col gap-5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>

                        {/* Price Range */}
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">💰 Price / Hr</label>
                            <div className="relative w-full h-1.5 bg-white/10 rounded-full my-2">
                                <div className="absolute left-[20%] right-[30%] h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" />
                                <div className="absolute left-[20%] top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-emerald-400 cursor-pointer hover:scale-110 transition-transform" />
                                <div className="absolute right-[30%] top-1/2 -translate-y-1/2 -mr-2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-emerald-400 cursor-pointer hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold text-white">
                                <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/8">₹500</span>
                                <span className="text-white/30">—</span>
                                <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/8">₹2500</span>
                            </div>
                        </div>

                        <div className="h-px bg-white/6" />

                        {/* Rating */}
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">⭐ Rating</label>
                            <div className="flex flex-wrap gap-1.5">
                                {[0, 3, 4, 4.5].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setMinRating(r)}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all border ${minRating === r ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.12)]' : 'bg-white/5 border-white/8 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20'}`}
                                    >
                                        {r === 0 ? 'Any' : `${r}+ ⭐`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-white/6" />

                        {/* Amenities */}
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">✨ Amenities</label>
                            <div className="flex flex-wrap gap-1.5">
                                {allAmenities.map(a => (
                                    <button
                                        key={a}
                                        onClick={() => toggleAmenity(a)}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all border ${selectedAmenities.includes(a) ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.12)]' : 'bg-white/5 border-white/8 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20'}`}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-white/6" />

                        {/* Availability */}
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">📅 Availability</label>
                            <div className="flex flex-wrap gap-1.5">
                                {['Today', 'Tomorrow', 'Weekend'].map(av => (
                                    <button
                                        key={av}
                                        onClick={() => setAvailableToday(av === 'Today' ? !availableToday : false)}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all border ${av === 'Today' && availableToday ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.12)]' : 'bg-white/5 border-white/8 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20'}`}
                                    >
                                        {av}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-white/6" />

                        {/* Sort By */}
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <HiOutlineClock className="w-3 h-3" /> Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[11px] font-bold text-white hover:bg-white/8 appearance-none outline-none cursor-pointer focus:ring-0 tracking-wide transition-all"
                            >
                                <option value="rating" className="bg-slate-900">Best Rated</option>
                                <option value="reviews" className="bg-slate-900">Most Booked</option>
                                <option value="price-low" className="bg-slate-900">Lowest Price</option>
                                <option value="price-high" className="bg-slate-900">Highest Price</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Right Pane: Fixed Toolbar + Scrollable Cards ── */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

                    {/* Fixed Toolbar Bar */}
                    <div className="shrink-0 px-6 md:px-8 py-[11px] border-b border-white/5 bg-[#020617] flex items-center justify-between z-20">
                        <button
                            onClick={() => setDrawerOpen(!drawerOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 border ${activeFilterCount > 0
                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.2)] hover:shadow-[0_0_24px_rgba(16,185,129,0.35)]'
                                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <HiFilter className="w-4 h-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="bg-emerald-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        <span className="text-sm font-bold text-slate-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            {filtered.length} {filtered.length === 1 ? 'Venue' : 'Venues'} Found
                        </span>
                    </div>

                    {/* ── Scrollable Venue Cards Section ONLY ── */}
                    <div className="flex-1 h-full overflow-y-auto px-6 md:px-8 py-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>

                        {/* Card Grid */}
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-3xl">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                                    <HiSearch className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3">No venues found</h3>
                                <p className="text-white/40 font-medium mb-8 text-center max-w-sm text-sm">
                                    We couldn't find any turfs matching your criteria. Try clearing some filters.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="px-8 py-3 bg-white text-slate-950 font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 text-xs"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className={`grid ${gridCols} gap-6 items-stretch pb-10`}>
                                {filtered.map((t, i) => (
                                    <TurfCard key={t.id} turf={t} i={i} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
