import { useNavigate } from 'react-router-dom';

export default function TurfCard({ turf, onMouseEnter, onMouseLeave, i = 0 }) {
    const navigate = useNavigate();
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
            id={`turf-card-${turf.id}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={() => navigate(`/turfs/${turf.id}`)}
            style={{ animationDelay: `${i * 100}ms` }}
            className={`group relative flex flex-col h-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,230,167,0.15)] cursor-pointer`}
        >
            {/* Image Section */}
            <div className="relative h-[168px] w-full shrink-0 overflow-hidden">
                <img
                    src={turf.image}
                    alt={turf.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.classList.add('bg-gradient-to-br', 'from-slate-800', 'to-slate-900')
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent pointer-events-none" />

                {promo && (
                    <div className="absolute top-2 left-2 z-20 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1 flex items-center gap-1 shadow-md">
                        <span className="text-[10px]">{promo.icon}</span>
                        <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                            {promo.text.includes('•') ? promo.text.split('•')[1].trim() : promo.text}
                        </span>
                    </div>
                )}

                <div className="absolute top-2 right-2 z-20 text-[14px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" title={turf.sports[0]}>
                    {{
                        'football': '⚽',
                        'cricket': '🏏',
                        'box cricket': '🏏'
                    }[(turf.sports[0] || 'football').toLowerCase()] || '🏆'}
                </div>

                <div className="absolute bottom-2 right-2 z-20 text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                    Open till 11 PM
                </div>
            </div>

            <div className="px-3 py-2 flex flex-col flex-1 relative z-10 bg-slate-900">
                
                <h3 className="text-[16px] font-bold text-white leading-tight mb-0.5 truncate group-hover:text-[#00E6A7] transition-colors">
                    {turf.name}
                </h3>

                <div className="text-[11px] text-slate-400 mb-0.5 flex items-center gap-1.5 truncate">
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${turf.lat || 19.1136},${turf.lng || 72.8697}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                        title="Open directions in Google Maps"
                    >
                        <span>📍 {turf.location}</span>
                    </a>
                    <span className="text-slate-600">•</span>
                    <span>{(Number(turf.distance) || 4.2).toFixed(1)} km</span>
                </div>

                <div className="text-[10px] text-slate-500 mb-1.5 flex items-center gap-1">
                    <span className="text-amber-400 text-[9px]">⭐</span> 
                    <span className="font-medium text-slate-300">{turf.rating.toFixed(1)}</span> 
                    <span>(324)</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-medium text-slate-300 flex items-center gap-0.5">
                        {(turf.amenities || []).join(' ').toLowerCase().includes('covered') ? 'Covered' : 'Open'}
                    </span>
                    <span className={`text-[10px] font-medium flex items-center gap-0.5
                        ${turf.rating >= 4.7 ? 'text-emerald-400' : 
                        turf.rating >= 4.4 ? 'text-cyan-400' : 
                        turf.rating >= 4.0 ? 'text-yellow-400' : 
                        'text-gray-400'}`}>
                        {turf.rating >= 4.7 ? 'Excellent' : turf.rating >= 4.4 ? 'Very Good' : turf.rating >= 4.0 ? 'Good' : 'Average'}
                    </span>
                    <span className="text-[10px] font-medium text-amber-400 flex items-center gap-0.5">
                        {Number(turf.price) < 600 ? 'Value' : Number(turf.price) < 900 ? 'Budget' : Number(turf.price) < 1200 ? 'Premium' : 'Expensive'}
                    </span>
                </div>

                <div className="flex flex-wrap items-center mb-1.5">
                    <span className="text-[10px] font-medium text-slate-300 line-clamp-2 leading-tight" title={[turf.dimensions || '90 × 45 ft', 'Turf', ...(turf.amenities || ['Parking', 'Washroom'])].join(', ')}>
                        {[
                            turf.dimensions || '90 × 45 ft',
                            'Turf',
                            ...(turf.amenities || ['Parking', 'Washroom'])
                        ].join(', ')}
                    </span>
                </div>

                <div className="border-t border-white/10 pt-2 mt-auto flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-400 uppercase tracking-widest font-medium mb-0.5 leading-none">Starts From</span>
                        <div className="flex items-baseline text-white">
                            <span className="text-[18px] font-bold leading-none tracking-tight">₹{turf.price}</span>
                            <span className="text-[10px] text-slate-500 font-medium ml-1">/hr</span>
                        </div>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/turfs/${turf.id}`) }}
                        className="px-4 py-1.5 rounded-lg text-[11px] font-bold text-slate-950 bg-gradient-to-r from-[#00E6A7] to-[#00C2FF] hover:from-[#00c892] hover:to-[#00b0e6] transition-all duration-300 shadow-[0_4px_15px_rgba(0,230,167,0.3)] hover:shadow-[0_6px_20px_rgba(0,230,167,0.5)] hover:scale-105 active:scale-95 flex-shrink-0"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    )
}
