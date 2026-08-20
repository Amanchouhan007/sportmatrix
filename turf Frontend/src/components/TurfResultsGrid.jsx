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

/* ── Slot Availability Data (Operating 6:00 AM to 11:00 PM) ── */
const slotsByTurf = {
    1: [{ time: '6:00 PM', status: 'available' }, { time: '7:00 PM', status: 'available' }, { time: '8:00 PM', status: 'few' }],
    2: [{ time: '5:00 PM', status: 'available' }, { time: '6:00 PM', status: 'few' }, { time: '8:00 PM', status: 'available' }],
    3: [{ time: '6:00 AM', status: 'available' }, { time: '7:00 AM', status: 'available' }, { time: '6:00 PM', status: 'available' }],
    4: [{ time: '7:00 PM', status: 'available' }, { time: '8:00 PM', status: 'few' }, { time: '9:00 PM', status: 'available' }],
    5: [{ time: '6:00 AM', status: 'available' }, { time: '6:00 PM', status: 'available' }, { time: '7:00 PM', status: 'few' }],
    6: [{ time: '6:00 AM', status: 'available' }, { time: '7:00 AM', status: 'available' }, { time: '8:00 AM', status: 'available' }, { time: '6:00 PM', status: 'available' }, { time: '8:00 PM', status: 'available' }, { time: '9:00 PM', status: 'available' }],
    7: [{ time: '6:00 PM', status: 'few' }, { time: '7:00 PM', status: 'available' }, { time: '8:00 PM', status: 'available' }],
    8: [{ time: '6:00 AM', status: 'available' }, { time: '7:00 PM', status: 'available' }, { time: '8:00 PM', status: 'available' }],
    9: [{ time: '6:00 PM', status: 'few' }, { time: '7:00 PM', status: 'available' }],
    10: [{ time: '6:00 AM', status: 'available' }, { time: '6:00 PM', status: 'available' }],
    11: [{ time: '7:00 PM', status: 'few' }, { time: '8:00 PM', status: 'available' }],
    12: [{ time: '6:00 AM', status: 'available' }, { time: '7:00 PM', status: 'available' }],
    13: [{ time: '6:00 AM', status: 'available' }, { time: '7:00 AM', status: 'available' }, { time: '5:00 PM', status: 'available' }, { time: '7:00 PM', status: 'available' }, { time: '8:00 PM', status: 'available' }],
    14: [{ time: '6:00 AM', status: 'available' }, { time: '8:00 AM', status: 'available' }, { time: '6:00 PM', status: 'available' }, { time: '8:00 PM', status: 'available' }, { time: '9:00 PM', status: 'available' }],
    15: [{ time: '6:00 AM', status: 'available' }, { time: '7:00 AM', status: 'available' }, { time: '6:00 PM', status: 'available' }, { time: '7:00 PM', status: 'available' }],
    16: [{ time: '6:00 AM', status: 'available' }, { time: '7:00 AM', status: 'available' }, { time: '6:00 PM', status: 'available' }, { time: '8:00 PM', status: 'available' }],
    17: [{ time: '6:00 AM', status: 'available' }, { time: '7:00 AM', status: 'available' }, { time: '7:00 PM', status: 'available' }, { time: '9:00 PM', status: 'available' }],
    18: [{ time: '6:00 AM', status: 'available' }, { time: '6:00 PM', status: 'available' }, { time: '8:00 PM', status: 'available' }],
    19: [{ time: '6:00 AM', status: 'available' }, { time: '7:00 AM', status: 'available' }, { time: '6:00 PM', status: 'available' }, { time: '8:00 PM', status: 'available' }],
}

export default function TurfResultsGrid({ turfs, searchValues, recentSearches = [], onClear }) {
    const navigate = useNavigate()
    const [activeFilter, setActiveFilter] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [viewMode, setViewMode] = useState('list') // 'list' | 'split'
    const [hoveredTurfId, setHoveredTurfId] = useState(null)
    const [isSortOpen, setIsSortOpen] = useState(false)

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
        <section className="pt-0 pb-8 bg-white relative overflow-hidden">
            {/* Background Spotlights */}
            <div className="absolute top-[10%] left-[5%] w-[45vw] h-[45vw] bg-[#C8FF2E]/15 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[10%] right-[5%] w-[40vw] h-[40vw] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* ── Recent Searches ── */}
                {recentSearches.length > 0 && (
                    <div className="flex items-center gap-3 mb-2 bg-white border border-[#E5E7EB] rounded-full py-1.5 px-4 w-fit shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#6B7280]">Recent Searches</span>
                        <div className="flex gap-2">
                            {recentSearches.slice(0, 3).map((rs, i) => (
                                <span key={i} className="text-[10px] font-black text-[#111827] bg-[#C8FF2E] px-3 py-1 rounded-full border border-[#B5F000] shadow-sm">
                                    {rs.location && <>{rs.location}</>}
                                    {rs.sport && <> • {rs.sport}</>}
                                </span>
                            ))}
                        </div>
                    </div>
                )}


                {/* ── Header & Filters Control Bar (Natural Clean Scroll - Never Covers Cards) ── */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-[#E5E7EB]">
                    {/* Left: Heading & Count Pill */}
                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                        <h2 className="text-[18px] sm:text-[22px] md:text-[26px] font-black italic uppercase tracking-tight leading-none flex items-center gap-2 text-[#111827]">
                            EXPLORE <span className="text-[#16A34A] underline decoration-[#C8FF2E] decoration-4 underline-offset-4">TOP TURFS</span>
                        </h2>
                        <span className="text-[9px] font-black text-[#111827] bg-[#C8FF2E] border border-[#B5F000] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm">
                            {sortedTurfs.length} Venues
                        </span>
                    </div>

                    {/* Right: Aligned Sort Toolbar */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Sort Dropdown Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setIsSortOpen(!isSortOpen)}
                                className="flex items-center gap-1.5 sm:gap-2 bg-white border border-[#E5E7EB] hover:border-[#C8FF2E] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shrink-0 shadow-sm transition-all cursor-pointer"
                            >
                                <span className="text-[10px] sm:text-[11px] font-bold text-[#111827] uppercase tracking-wider leading-none">
                                    SORT: <span className="text-[#16A34A]">{activeFilter === 'price-low' ? 'PRICE: LOW TO HIGH' : activeFilter === 'price-high' ? 'PRICE: HIGH TO LOW' : activeFilter === 'rating' ? 'TOP RATED' : 'NEAREST FIRST'}</span>
                                </span>
                                <svg className={`w-3 h-3 text-[#111827] transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isSortOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                                    <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-60 sm:w-64 max-w-[calc(100vw-32px)] bg-white border border-[#E5E7EB] rounded-2xl shadow-xl py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                        {[
                                            { value: '', label: '📍 NEAREST FIRST' },
                                            { value: 'price-low', label: '💰 PRICE: LOW TO HIGH' },
                                            { value: 'price-high', label: '💸 PRICE: HIGH TO LOW' },
                                            { value: 'rating', label: '⭐ TOP RATED' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => {
                                                    setActiveFilter(opt.value);
                                                    setIsSortOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-between cursor-pointer ${
                                                    activeFilter === opt.value
                                                        ? 'bg-[#C8FF2E] text-[#111827]'
                                                        : 'text-[#6B7280] hover:bg-[#F7F9FC] hover:text-[#111827]'
                                                }`}
                                            >
                                                <span>{opt.label}</span>
                                                {activeFilter === opt.value && (
                                                    <span className="text-xs font-black">✓</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Split Layout Container ── */}
                <div className={`flex flex-col lg:flex-row gap-6 relative ${viewMode === 'split' ? 'items-start' : ''}`}>

                    {/* Left Pane: Cards */}
                    <div className={`w-full ${viewMode === 'split' ? 'lg:w-[55%] shrink-0 overflow-y-auto' : 'lg:w-full'}`}>
                        {sortedTurfs.length === 0 ? (
                            <div className="text-center py-20 bg-slate-900/40 border border-white/5 rounded-3xl p-10 backdrop-blur-md">
                                <div className="text-5xl mb-4">🏟️</div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">No Spaces Discovered</h3>
                                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">Modify your filter constraints or try another sector to view options.</p>
                                <button onClick={onClear} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-full transition-all shadow-lg shadow-blue-500/20">Reset Filters</button>
                            </div>
                        ) : (
                            <div className={`grid gap-6 xl:gap-8 items-stretch ${viewMode === 'split'
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
                                turfs={sortedTurfs.map(t => ({ ...t, latitude: t.lat, longitude: t.lng }))}
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
