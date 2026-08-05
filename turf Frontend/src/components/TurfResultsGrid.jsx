import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiLocationMarker, HiStar, HiCheckCircle, HiX, HiSortDescending, HiFilter, HiMap, HiViewList } from 'react-icons/hi'
import GoogleMapView from './GoogleMapView'
import TurfCard from './TurfCard'

/* ── Quick Filter Options ── */
const filterOptions = [
    { key: 'price-low', label: '₹ Low to High', icon: '💰' },
    { key: 'price-high', label: '₹ High to Low', icon: '💸' },
    { key: 'rating', label: 'Top Rated', icon: '⭐' },
    { key: 'available', label: 'Available Now', icon: '✅' },
]

/* ── Slot Availability Data (mock) ── */
const slotsByTurf = {
    1: [
        { time: '6PM', status: 'available' },
        { time: '7PM', status: 'available' },
        { time: '8PM', status: 'few' },
        { time: '9PM', status: 'booked' },
    ],
    2: [
        { time: '5PM', status: 'available' },
        { time: '6PM', status: 'few' },
        { time: '7PM', status: 'booked' },
    ],
    3: [
        { time: '4PM', status: 'available' },
        { time: '5PM', status: 'available' },
        { time: '6PM', status: 'available' },
    ],
    4: [
        { time: '6PM', status: 'booked' },
        { time: '7PM', status: 'booked' },
        { time: '8PM', status: 'few' },
    ],
    5: [
        { time: '5PM', status: 'available' },
        { time: '6PM', status: 'available' },
        { time: '7PM', status: 'few' },
        { time: '8PM', status: 'available' },
    ],
    6: [
        { time: '4PM', status: 'available' },
        { time: '5PM', status: 'available' },
        { time: '6PM', status: 'available' },
        { time: '7PM', status: 'few' },
    ],
    7: [
        { time: '4PM', status: 'available' },
        { time: '5PM', status: 'available' },
        { time: '6PM', status: 'few' },
        { time: '7PM', status: 'booked' },
    ],
    8: [
        { time: '6PM', status: 'available' },
        { time: '7PM', status: 'available' },
        { time: '8PM', status: 'available' },
        { time: '9PM', status: 'available' },
    ],
    9: [
        { time: '5PM', status: 'few' },
        { time: '6PM', status: 'booked' },
        { time: '7PM', status: 'available' },
        { time: '8PM', status: 'available' },
    ],
    10: [
        { time: '4PM', status: 'available' },
        { time: '5PM', status: 'available' },
        { time: '6PM', status: 'available' },
    ],
    11: [
        { time: '6PM', status: 'available' },
        { time: '7PM', status: 'few' },
        { time: '8PM', status: 'booked' },
    ],
    12: [
        { time: '5PM', status: 'available' },
        { time: '6PM', status: 'available' },
        { time: '7PM', status: 'available' },
        { time: '8PM', status: 'few' },
    ],
}

export default function TurfResultsGrid({ turfs, searchValues, recentSearches = [], onClear }) {
    const navigate = useNavigate()
    const [activeFilter, setActiveFilter] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [viewMode, setViewMode] = useState('list') // 'list' | 'split'
    const [hoveredTurfId, setHoveredTurfId] = useState(null)

    const { location, sport } = searchValues || {}

    /* ── Apply quick filter sort ── */
    let sortedTurfs = [...turfs]
    if (activeFilter === 'price-low') sortedTurfs.sort((a, b) => a.price - b.price)
    else if (activeFilter === 'price-high') sortedTurfs.sort((a, b) => b.price - a.price)
    else if (activeFilter === 'rating') sortedTurfs.sort((a, b) => b.rating - a.rating)
    else if (activeFilter === 'available') sortedTurfs = sortedTurfs.filter(t => (slotsByTurf[t.id] || []).some(s => s.status === 'available'))

    const statusColor = (status) => {
        if (status === 'available') return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
        if (status === 'few') return 'text-amber-400 border-amber-500/20 bg-amber-500/5'
        return 'text-slate-600 border-white/5 opacity-40'
    }

    const statusLabel = (status) => {
        if (status === 'available') return 'Available'
        if (status === 'few') return 'Few Slots'
        return 'Booked'
    }

    return (
        <section className="pt-3 pb-8 bg-[#020617] relative overflow-hidden">
            {/* Background Spotlights */}
            <div className="absolute top-[20%] left-[10%] w-[35vw] h-[35vw] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                {/* ── Recent Searches ── */}
                {recentSearches.length > 0 && (
                    <div className="flex items-center gap-3 mb-4 bg-slate-900/30 border border-white/5 rounded-full py-2 px-5 w-fit backdrop-blur-md">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Recent Searches</span>
                        <div className="flex gap-2">
                            {recentSearches.slice(0, 3).map((rs, i) => (
                                <span key={i} className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                                    {rs.location && <>{rs.location}</>}
                                    {rs.sport && <> • {rs.sport}</>}
                                </span>
                            ))}
                        </div>
                    </div>
                )}


                {/* ── Header & Filters Control Bar ── */}
                <div className="sticky top-[72px] z-30 bg-[#020617] flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4 pt-3">
                    {/* Left: Heading & Count Pill */}
                    <div className="flex items-center gap-3 shrink-0">
                        <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tight leading-none flex items-center gap-2">
                            EXPLORE <span className="text-[#00E6A7]">TOP TURFS</span>
                        </h2>
                        <span className="text-[11px] font-bold text-[#00E6A7] bg-[#00E6A7]/10 border border-[#00E6A7]/25 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(0,230,167,0.15)]">
                            {sortedTurfs.length} Venues
                        </span>
                    </div>

                    {/* Right: Aligned Filters & Sort Toolbar */}
                    <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar py-1 shrink-0">
                        {/* Filters Dropdown Button */}
                        <div className="relative shrink-0">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-1.5 border rounded-full text-[10.5px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                                    activeFilter 
                                        ? 'bg-gradient-to-r from-[#00E6A7] to-[#00C2FF] border-[#00E6A7] text-slate-950 font-black shadow-[0_0_15px_rgba(0,230,167,0.35)]'
                                        : 'bg-slate-900/80 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-white/20'
                                }`}
                            >
                                <HiFilter className="w-3.5 h-3.5" /> <span>Filters {activeFilter && '(1)'}</span>
                            </button>

                            {/* Dropdown Popover */}
                            {showFilters && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowFilters(false)}></div>
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 py-1">
                                        {filterOptions.map(f => (
                                            <button
                                                key={f.key}
                                                onClick={() => {
                                                    setActiveFilter(activeFilter === f.key ? '' : f.key)
                                                    setShowFilters(false)
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${
                                                    activeFilter === f.key
                                                        ? 'bg-[#00E6A7]/10 text-[#00E6A7]'
                                                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2"><span>{f.icon}</span> {f.label}</span>
                                                {activeFilter === f.key && <HiCheckCircle className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="w-px h-6 bg-white/10 shrink-0 hidden sm:block"></div>

                        {/* Sort Dropdown Selector */}
                        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-white/10 px-3.5 py-1.5 rounded-full shrink-0 relative group hover:border-[#00E6A7]/40 transition-all cursor-pointer">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">SORT:</span>
                            <select
                                className="bg-transparent text-white text-[10.5px] font-black uppercase tracking-wider outline-none cursor-pointer border-none pr-5 appearance-none focus:ring-0"
                                value={activeFilter}
                                onChange={(e) => setActiveFilter(e.target.value)}
                            >
                                <option value="" className="bg-slate-950 text-white">RECOMMENDED</option>
                                <option value="price-low" className="bg-slate-950 text-white">PRICE: LOW TO HIGH</option>
                                <option value="price-high" className="bg-slate-950 text-white">PRICE: HIGH TO LOW</option>
                                <option value="rating" className="bg-slate-950 text-white">RATING: HIGH TO LOW</option>
                            </select>
                            <div className="absolute right-3 pointer-events-none text-slate-400 group-hover:text-[#00E6A7] transition-colors">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Split Layout Container ── */}
                <div className={`flex flex-col lg:flex-row gap-6 relative ${viewMode === 'split' ? 'items-start' : ''}`}>
                    
                    {/* Left Pane: Cards */}
                    <div
                        className={`w-full ${viewMode === 'split' ? 'lg:w-[55%] shrink-0' : 'lg:w-full'} overflow-y-auto`}
                        style={{ maxHeight: 'calc(100vh - 220px)', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
                    >
                        {sortedTurfs.length === 0 ? (
                            <div className="text-center py-20 bg-slate-900/40 border border-white/5 rounded-3xl p-10 backdrop-blur-md">
                                <div className="text-5xl mb-4">🏟️</div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">No Spaces Discovered</h3>
                                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">Modify your filter constraints or try another sector to view options.</p>
                                <button onClick={onClear} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-full transition-all shadow-lg shadow-blue-500/20">Reset Filters</button>
                            </div>
                        ) : (
                            <div className={`grid gap-6 xl:gap-8 items-stretch ${
                                viewMode === 'split' 
                                    ? 'grid-cols-1 sm:grid-cols-2' 
                                    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                            }`}>
                                {sortedTurfs.map(turf => (
                                    <TurfCard 
                                        key={turf.id} 
                                        turf={turf} 
                                        onMouseEnter={() => setHoveredTurfId(turf.id)}
                                        onMouseLeave={() => setHoveredTurfId(null)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Pane: Map */}
                    {viewMode === 'split' && (
                        <div className="hidden lg:block lg:w-[45%] shrink-0 sticky top-[100px] h-[calc(100vh-140px)] rounded-3xl overflow-hidden border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20">
                            <GoogleMapView
                                turfs={sortedTurfs.map(t => ({...t, latitude: t.lat, longitude: t.lng}))}
                                hoveredTurfId={hoveredTurfId}
                                onMarkerClick={(id) => {
                                    setHoveredTurfId(id)
                                    const el = document.getElementById(`turf-card-${id}`)
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
