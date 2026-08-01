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
        <section className="pt-8 pb-10 bg-[#020617] relative overflow-hidden">
            {/* Background Spotlights */}
            <div className="absolute top-[20%] left-[10%] w-[35vw] h-[35vw] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                {/* ── Recent Searches ── */}
                {recentSearches.length > 0 && (
                    <div className="flex items-center gap-3 mb-8 bg-slate-900/30 border border-white/5 rounded-full py-2 px-5 w-fit backdrop-blur-md">
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

                {/* ── Header & Filters Bar ── */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10 border-b border-white/5 pb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
                        {/* Heading */}
                        <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tight leading-none flex items-center gap-3 whitespace-nowrap">
                            EXPLORE <span className="text-emerald-400">TOP TURFS</span>
                            <span className="text-xl text-slate-600 font-bold not-italic tracking-normal">({sortedTurfs.length})</span>
                        </h2>

                        {/* Divider */}
                        <div className="hidden md:block w-px h-8 bg-white/10 shrink-0"></div>

                        {/* Quick Filters */}
                        <div className="flex gap-3 flex-wrap items-center">
                            {filterOptions.map(f => (
                                <button
                                    key={f.key}
                                    className={`px-4 py-2 border rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${activeFilter === f.key ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                    onClick={() => setActiveFilter(activeFilter === f.key ? '' : f.key)}
                                >
                                    <span className="mr-1">{f.icon}</span> {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-3 bg-slate-900/60 border border-white/10 px-5 py-2.5 rounded-full w-fit shrink-0 relative group hover:border-white/20 transition-all">
                        <select className="bg-transparent text-white text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer border-none pr-6 appearance-none focus:ring-0">
                            <option className="bg-slate-950 text-white">RECOMMENDED</option>
                            <option className="bg-slate-950 text-white">PRICE: LOW TO HIGH</option>
                            <option className="bg-slate-950 text-white">RATING: HIGH TO LOW</option>
                        </select>
                        <div className="absolute right-4 pointer-events-none text-slate-400 group-hover:text-white transition-colors">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M19 9l-7 7-7-7" />
                            </svg>
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
                            
                            // Check for target promo cards (Indore Sports, Royal Cricket, Green Arena, Champion Cricket)
                            const turfNameLower = (turf.name || '').toLowerCase()
                            let promo = null
                            if (turfNameLower.includes('indore sports arena') || turfNameLower.includes('indore sports complex')) {
                                promo = {
                                    ribbon: '⚡ 9AM–10AM OFFER • Save 30% OFF',
                                    strip: '🎯 Today 9:00 AM – 10:00 AM • Flat 30% OFF'
                                }
                            } else if (turfNameLower.includes('royal cricket ground')) {
                                promo = {
                                    ribbon: '🔥 MORNING SLOT • ₹200 OFF • 9AM–10AM',
                                    strip: '⏰ Early Bird Offer • ₹200 OFF on morning booking'
                                }
                            } else if (turfNameLower.includes('green arena') || turfNameLower.includes('sportzone arena')) {
                                promo = {
                                    ribbon: '⚡ EVENING DEAL • Save 25% OFF',
                                    strip: '⚽ Peak Hour Offer • Flat 25% OFF on booking'
                                }
                            } else if (turfNameLower.includes('champion cricket') || turfNameLower.includes('prokick stadium')) {
                                promo = {
                                    ribbon: '🔥 WEEKEND SPECIAL • ₹300 OFF',
                                    strip: '🏏 Prime Time Deal • ₹300 OFF on pitch booking'
                                }
                            }

                            return (
                                <div 
                                    key={turf.id} 
                                    onClick={() => navigate(`/turfs/${turf.id}`)}
                                    className={`group relative flex flex-col h-full bg-slate-950/40 border rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1.5 backdrop-blur-xl cursor-pointer ${
                                        isGaming 
                                            ? 'border-purple-950/60 hover:border-purple-500/40 hover:shadow-[0_12px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(168,85,247,0.15)] shadow-[inset_0_0_20px_rgba(168,85,247,0.02)]' 
                                            : 'border-white/5 hover:border-emerald-500/35 hover:shadow-[0_12px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.1)]'
                                    }`}
                                >
                                    {/* Image Section */}
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                                        
                                        {/* Floating Promotional Ribbon (Top-Left) */}
                                        {promo && (
                                            <div 
                                                className="absolute top-3 left-3 z-10 max-w-[calc(100%-90px)] font-bold text-[11px] text-white px-3 py-1.5 flex items-center gap-1 leading-none transition-all duration-300 pointer-events-none shadow-[0_0_12px_rgba(0,230,167,0.35)] group-hover:shadow-[0_0_18px_rgba(0,230,167,0.6)] truncate"
                                                style={{
                                                    background: 'linear-gradient(135deg, #00E6A7, #00C2FF)',
                                                    borderRadius: '9999px',
                                                }}
                                            >
                                                <span className="truncate">{promo.ribbon}</span>
                                            </div>
                                        )}

                                        {/* Rating Badge (Top-Right) */}
                                        <div className="absolute top-3 right-3 z-20 min-w-[48px] bg-slate-950/90 text-amber-400 text-[9px] px-2 py-1 rounded font-black flex items-center justify-center gap-0.5 shadow-md">
                                            <span>★</span> <span className="text-white">{turf.rating.toFixed(1)}</span>
                                        </div>

                                        {/* Sport Category Tags */}
                                        <div className={`absolute bottom-2.5 left-2.5 flex flex-wrap gap-1.5 pointer-events-none ${promo ? 'max-w-[70%]' : ''}`}>
                                            {turf.sports.map(sport => {
                                                const isZone = sport.toLowerCase() === 'gaming zone'
                                                const bgClass = isZone ? 'bg-purple-600' : 'bg-emerald-600'
                                                
                                                return (
                                                    <span key={sport} className={`px-2 py-0.5 text-white text-[8px] font-black uppercase tracking-widest rounded ${bgClass}`}>
                                                        {sport}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Info Content Section */}
                                    <div className="p-4 flex flex-col flex-1 relative z-10">
                                        <h3 className={`text-sm font-black text-white transition-colors uppercase tracking-tight leading-tight truncate ${isGaming ? 'group-hover:text-purple-400' : 'group-hover:text-emerald-400'}`}>
                                            {turf.name}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold mt-1.5 mb-2">
                                            <HiLocationMarker className={`w-3.5 h-3.5 shrink-0 ${isGaming ? 'text-purple-500' : 'text-emerald-500'}`} />
                                            <span className="truncate">{turf.location}</span>
                                        </p>

                                        {/* Additional Mini Offer Strip */}
                                        {promo && (
                                            <div 
                                                className="mt-2 mb-2.5 px-2 py-1.5 rounded-lg text-[10px] font-semibold text-[#00E6A7] flex items-center gap-1 leading-tight"
                                                style={{
                                                    background: 'rgba(0, 230, 167, 0.12)',
                                                    border: '1px solid rgba(0, 230, 167, 0.25)',
                                                    borderRadius: '8px'
                                                }}
                                            >
                                                <span className="truncate">{promo.strip}</span>
                                            </div>
                                        )}

                                        {/* Action & Price Block */}
                                        <div className="border-t border-white/5 pt-3.5 flex items-center justify-between gap-3 mt-auto">
                                            <div>
                                                <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest block leading-none mb-0.5">Starts from</span>
                                                <div className="flex items-baseline text-white">
                                                    <span className="text-[10px] font-black mr-0.5">₹</span>
                                                    <span className="text-base font-black tracking-tight">{turf.price}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide ml-0.5">/hr</span>
                                                </div>
                                            </div>
                                            <button className={`px-4 py-1.5 bg-gradient-to-r ${isGaming ? 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_4px_12px_rgba(168,85,247,0.2)]' : 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_4px_12px_rgba(16,185,129,0.2)]'} text-white font-black text-[8px] uppercase tracking-widest rounded-lg hover:scale-[1.02] transition-all cursor-pointer`} onClick={(e) => { e.stopPropagation(); navigate(`/booking/${turf.id}`) }}>
                                                Book
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

