import React from 'react';
import { HiLocationMarker, HiStar, HiHeart } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

export default function TurfCardPremium({ turf, onMouseEnter, onClick, isActive }) {
    const navigate = useNavigate();
    
    let sportsArr = [];
    try {
        sportsArr = typeof turf.sports === 'string' ? JSON.parse(turf.sports) : (turf.sports || []);
    } catch(e) {
        sportsArr = [];
    }

    const fallbackImage = 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80&fit=crop';
    
    return (
        <div 
            className={`group flex flex-row bg-slate-900 border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer p-2 gap-2
                ${isActive ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)] bg-slate-800/80 scale-[1.01] z-10 relative' : 'border-white/5 hover:border-slate-700 hover:bg-slate-800/50'}
            `}
            onMouseEnter={onMouseEnter}
            onClick={onClick}
        >
            {/* Image Section */}
            <div className="w-28 sm:w-32 min-h-[105px] self-stretch relative overflow-hidden rounded-lg shrink-0">
                <img 
                    src={turf.image || fallbackImage} 
                    alt={turf.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <button className="absolute top-1.5 right-1.5 bg-black/40 backdrop-blur-md p-1 rounded-full text-slate-300 hover:text-red-500 transition-colors z-10">
                    <HiHeart className="w-4 h-4" />
                </button>
                <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/20 flex items-center gap-1 z-10 shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    <span className="text-[10px]">🔥</span>
                    <span className="text-white text-[8px] font-black uppercase tracking-widest">Early Bird</span>
                </div>
                <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1 z-10">
                    <HiStar className="text-amber-400 w-2.5 h-2.5" />
                    <span className="text-white text-[9px] font-bold">{turf.rating || '4.5'}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col justify-between flex-1 py-0.5 pr-1">
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">{turf.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-1.5">
                        {turf.distance != null && (
                            <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 flex items-center gap-0.5">
                                <HiLocationMarker className="w-2.5 h-2.5" />
                                {Number(turf.distance).toFixed(1)} KM Away
                            </span>
                        )}
                        <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">{turf.status === 'ACTIVE' ? 'Open Now' : 'Available'}</span>
                    </div>

                    <div className="flex gap-1 flex-wrap mb-1.5">
                        {sportsArr.slice(0, 2).map((sport, idx) => (
                            <span key={idx} className="text-[8px] font-black uppercase tracking-widest bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                                {sport}
                            </span>
                        ))}
                    </div>

                    {/* Format & Surface Tags */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[8px] font-bold text-slate-400 bg-white/5 px-1 py-0.5 rounded border border-white/5 flex items-center gap-0.5">
                            📏 {turf.format || '5v5'}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 bg-white/5 px-1 py-0.5 rounded border border-white/5 flex items-center gap-0.5">
                            🌱 {turf.surface || 'Artificial'}
                        </span>
                    </div>

                    {/* Amenities */}
                    <div className="flex items-center gap-1 mb-1">
                        {[
                            { icon: '💡', label: 'Floodlights' },
                            { icon: '🅿️', label: 'Parking' },
                            { icon: '👕', label: 'Changing Room' },
                            { icon: '🚰', label: 'Drinking Water' }
                        ].map((amenity, i) => (
                            <div key={i} className="group/tooltip relative flex items-center justify-center w-4 h-4 rounded-sm bg-white/5 hover:bg-white/10 border border-white/5 transition-colors cursor-help">
                                <span className="text-[8px] grayscale brightness-150 opacity-80">{amenity.icon}</span>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-slate-800 text-slate-200 text-[8px] font-black tracking-wide rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                                    {amenity.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-end justify-between mt-auto pt-1">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-emerald-400 leading-none">₹{turf.price || 800}</span>
                            <span className="text-[10px] text-slate-500 line-through font-bold hidden sm:inline-block">₹{Math.round((turf.price || 800) * 1.2)}</span>
                            <span className="text-[8px] text-slate-500 font-bold uppercase">/hr</span>
                        </div>
                        <span className="text-[9px] font-black text-emerald-500 mt-0.5">SAVE ₹{Math.round((turf.price || 800) * 0.2)}</span>
                    </div>
                    
                    <div className="flex gap-1.5 items-center">
                        {turf.latitude && turf.longitude && (
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${turf.latitude},${turf.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="w-7 h-7 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg flex items-center justify-center transition-all hover:text-white"
                                title="Get Direction"
                            >
                                <HiLocationMarker className="w-3.5 h-3.5" />
                            </a>
                        )}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/turfs/${turf._id || turf.slug || turf.id}`);
                            }} 
                            className="px-4 h-7 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all shadow-[0_5px_10px_rgba(59,130,246,0.2)] flex items-center justify-center"
                        >
                            Book
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
