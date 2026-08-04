import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiLocationMarker, HiStar, HiCheckCircle, HiX, HiSortDescending, HiFilter } from 'react-icons/hi'

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

                {/* ── Live Current Tournament Announcement Bar ── */}
                <div
                    className="w-[calc(100%-2px)] mx-auto h-[38px] md:h-[42px] mt-1 mb-4 px-3.5 flex items-center gap-3 overflow-hidden rounded-xl relative z-20 group"
                    style={{
                        background: 'rgba(8, 15, 35, 0.72)',
                        border: '1px solid rgba(0, 230, 167, 0.18)',
                        backdropFilter: 'blur(14px)',
                        WebkitBackdropFilter: 'blur(14px)',
                        boxShadow: '0 0 18px rgba(0, 230, 167, 0.08)'
                    }}
                >
                    {/* Left Live Badge */}
                    <div
                        className="h-[26px] md:h-[28px] px-3 rounded-full flex items-center justify-center font-black text-[11px] text-black tracking-[0.4px] shrink-0 select-none shadow-[0_0_12px_rgba(0,230,167,0.35)]"
                        style={{
                            background: 'linear-gradient(135deg, #00E6A7, #00C2FF)'
                        }}
                    >
                        <span className="relative flex h-1.5 w-1.5 mr-1.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                        </span>
                        <span className="whitespace-nowrap text-black font-black">LIVE TOURNAMENT</span>
                    </div>

                    {/* Center Marquee / Ticker Headline */}
                    <div className="flex-1 overflow-hidden relative flex items-center h-full">
                        <div
                            className="whitespace-nowrap flex items-center gap-6 text-[12px] md:text-[13.5px] font-semibold text-white animate-marquee"
                        >
                            {/* Desktop Headline */}
                            <span className="hidden md:inline-flex items-center gap-1.5">
                                <span className="text-[#00E6A7] font-bold">Indore Premier Turf League 2026</span> is currently running • <span className="text-[#00E6A7] font-bold">Finals Today</span> at <span className="text-[#00E6A7] font-bold">8:00 PM</span>
                            </span>

                            {/* Mobile Headline */}
                            <span className="md:hidden inline-flex items-center gap-1 text-[12px]">
                                <span className="text-[#00E6A7] font-bold">Indore Premier Turf League 2026</span> • <span className="text-[#00E6A7] font-bold">Finals Today 8:00 PM</span>
                            </span>
                        </div>
                    </div>

                    {/* Right Side CTA Button */}
                    <button
                        onClick={() => navigate('/customer/tournaments')}
                        className="hidden md:flex h-[26px] md:h-[28px] px-3 rounded-[8px] items-center justify-center font-bold text-[11px] text-[#00E6A7] shrink-0 transition-all duration-300 cursor-pointer hover:bg-[#00E6A7] hover:text-[#04121F] hover:shadow-[0_0_15px_rgba(0,230,167,0.4)]"
                        style={{
                            background: 'rgba(0, 230, 167, 0.12)',
                            border: '1px solid rgba(0, 230, 167, 0.28)'
                        }}
                    >
                        VIEW BRACKET
                    </button>
                </div>

                {/* ── Header & Filters Control Bar ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
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
                        {/* Quick Filter Chips (Scrollable row) */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                            {filterOptions.map(f => (
                                <button
                                    key={f.key}
                                    className={`px-3.5 py-1.5 border rounded-full text-[10.5px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeFilter === f.key
                                        ? 'bg-gradient-to-r from-[#00E6A7] to-[#00C2FF] border-[#00E6A7] text-slate-950 font-black shadow-[0_0_15px_rgba(0,230,167,0.35)]'
                                        : 'bg-slate-900/80 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-white/20'
                                        }`}
                                    onClick={() => setActiveFilter(activeFilter === f.key ? '' : f.key)}
                                >
                                    <span>{f.icon}</span> <span>{f.label}</span>
                                </button>
                            ))}
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

                {/* ── Turf Cards Grid ── */}
                {sortedTurfs.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/40 border border-white/5 rounded-3xl p-10 backdrop-blur-md">
                        <div className="text-5xl mb-4">🏟️</div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">No Spaces Discovered</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">Modify your filter constraints or try another sector to view options.</p>
                        <button onClick={onClear} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-full transition-all shadow-lg shadow-blue-500/20">Reset Filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 xl:gap-8 items-stretch">
                        {sortedTurfs.map(turf => {
                            const isGaming = turf.sports.includes('Gaming Zone')

                            const turfNameLower = (turf.name || '').toLowerCase()
                            let promo = null
                            if (turfNameLower.includes('indore sports arena') || turfNameLower.includes('indore sports complex')) {
                                promo = { icon: '🎁', text: 'Today 9:00 AM - 10:00 AM' }
                            } else if (turfNameLower.includes('royal cricket ground')) {
                                promo = { icon: '🏷️', text: 'Early Bird Offer • ₹200 OFF' }
                            } else if (turfNameLower.includes('green arena') || turfNameLower.includes('sportzone arena')) {
                                promo = { icon: '⚽', text: 'Peak Hour Offer • 25% OFF' }
                            } else if (turfNameLower.includes('champion cricket') || turfNameLower.includes('prokick stadium')) {
                                promo = { icon: '🏏', text: 'Weekend Special • ₹300 OFF' }
                            }

                            return (
                                <div
                                    key={turf.id}
                                    onClick={() => navigate(`/turfs/${turf.id}`)}
                                    className={`group relative flex flex-col h-full bg-slate-950/40 border rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1.5 backdrop-blur-xl cursor-pointer ${isGaming
                                        ? 'border-purple-950/60 hover:border-purple-500/40 hover:shadow-[0_12px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(168,85,247,0.15)] shadow-[inset_0_0_20px_rgba(168,85,247,0.02)]'
                                        : 'border-white/5 hover:border-emerald-500/35 hover:shadow-[0_12px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.1)]'
                                        }`}
                                >
                                    {/* Image Section - Clean Visual with Frosted Glass Overlay */}
                                    <div className="relative h-[145px] overflow-hidden shrink-0">
                                        <img
                                            src={turf.image}
                                            alt={turf.name}
                                            className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.style.display = 'none'
                                                e.target.parentElement.classList.add('bg-gradient-to-br', 'from-slate-800', 'to-slate-900')
                                                if (!e.target.parentElement.querySelector('.fallback-icon')) {
                                                    const fallback = document.createElement('div')
                                                    fallback.className = 'fallback-icon absolute inset-0 flex items-center justify-center text-4xl opacity-30'
                                                    fallback.textContent = '🏟️'
                                                    e.target.parentElement.appendChild(fallback)
                                                }
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

                                        {/* Top Left: Glass Badge Offer */}
                                        {promo && (
                                            <div className="absolute top-2.5 left-2.5 z-20 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded px-2 py-1.5 flex flex-col shadow-lg pointer-events-none">
                                                <span className="text-[8px] font-black text-orange-500 uppercase tracking-tight flex items-center gap-1 leading-none mb-1">
                                                    <span className="text-[9px]">{promo.icon}</span> {promo.text.includes('•') ? promo.text.split('•')[0].trim() : 'SPECIAL OFFER'}
                                                </span>
                                                <span className="text-[7.5px] font-bold text-white uppercase tracking-widest leading-none">
                                                    {promo.text.includes('•') ? promo.text.split('•')[1].trim() : promo.text}
                                                </span>
                                            </div>
                                        )}

                                        {/* Top Right: Sleek Rating Badge */}
                                        <div className="absolute top-2.5 right-2.5 z-20 bg-slate-950/85 backdrop-blur-md border border-white/10 text-amber-400 text-[9.5px] px-2 py-0.5 rounded-full font-black flex items-center gap-0.5 shadow-md">
                                            <span>★</span> <span className="text-white">{turf.rating.toFixed(1)}</span>
                                        </div>
                                    </div>

                                    {/* Info Content Section - Clean Tag Area */}
                                    <div className="p-3.5 flex flex-col flex-1 relative z-10">
                                        {/* Sports Category Tags */}
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {turf.sports.map(sport => {
                                                const isZone = sport.toLowerCase() === 'gaming zone'
                                                return (
                                                    <span key={sport} className={`px-2 py-0.5 text-white text-[7.5px] font-black uppercase tracking-widest rounded-md ${isZone ? 'bg-purple-600/90' : 'bg-emerald-600/90'}`}>
                                                        {sport}
                                                    </span>
                                                )
                                            })}
                                        </div>

                                        {/* Turf Name */}
                                        <h3 className={`text-sm font-black text-white transition-colors uppercase tracking-tight leading-snug truncate ${isGaming ? 'group-hover:text-purple-400' : 'group-hover:text-[#00E6A7]'}`}>
                                            {turf.name}
                                        </h3>

                                        {/* Location */}
                                        <p className="text-[11.5px] font-bold text-slate-300 flex items-center gap-1.5 mt-1.5 mb-2.5 leading-none">
                                            <HiLocationMarker className={`w-3.5 h-3.5 shrink-0 ${isGaming ? 'text-purple-400' : 'text-[#00E6A7]'}`} />
                                            <span className="truncate">{turf.location}</span>
                                        </p>

                                        {/* Action & Price Block */}
                                        <div className="border-t border-white/5 pt-2.5 mt-auto flex items-center justify-between gap-3">
                                            <div>
                                                <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest block leading-none mb-0.5">Starts from</span>
                                                <div className="flex items-baseline text-white">
                                                    <span className="text-[10px] font-black mr-0.5">₹</span>
                                                    <span className="text-base font-black tracking-tight">{turf.price}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide ml-0.5">/hr</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/turfs/${turf.id}`) }}
                                                className={`h-7 px-4 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-[1.03] cursor-pointer ${isGaming
                                                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25'
                                                    : 'bg-gradient-to-r from-[#00E6A7] to-[#00C2FF] hover:from-[#00c892] hover:to-[#00b0e6] text-slate-950 font-black shadow-[0_0_12px_rgba(0,230,167,0.3)]'
                                                    }`}
                                            >
                                                BOOK
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}

