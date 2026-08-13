import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiHeart } from 'react-icons/hi';
import { useToast } from './ui/Toast';

export default function TurfCard({ turf, onMouseEnter, onMouseLeave, i = 0 }) {
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [isLiked, setIsLiked] = useState(() => {
        try {
            const stored = localStorage.getItem('sportmatrix_liked_turfs');
            if (stored) {
                const arr = JSON.parse(stored);
                return arr.includes(turf.id);
            }
            // default like for Royal Cricket Ground (id 6)
            return turf.id === 6;
        } catch (e) {
            return turf.id === 6;
        }
    });

    const toggleLike = (e) => {
        e.stopPropagation();
        const nextState = !isLiked;
        setIsLiked(nextState);
        try {
            const stored = localStorage.getItem('sportmatrix_liked_turfs');
            let arr = stored ? JSON.parse(stored) : [6];
            if (nextState) {
                if (!arr.includes(turf.id)) arr.push(turf.id);
                if (addToast) addToast({ message: `❤️ Added ${turf.name} to Wishlist!`, type: 'success' });
            } else {
                arr = arr.filter(id => id !== turf.id);
                if (addToast) addToast({ message: `Removed ${turf.name} from Wishlist.`, type: 'info' });
            }
            localStorage.setItem('sportmatrix_liked_turfs', JSON.stringify(arr));
        } catch (err) {
            console.error(err);
        }
    };

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

    const fallbackImage = '/images/turf1.png';

    return (
        <div
            id={`turf-card-${turf.id}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={() => navigate(`/turfs/${turf.id}`)}
            style={{ animationDelay: `${i * 100}ms` }}
            className={`group relative flex flex-col h-full bg-white border border-[#E5E7EB] rounded-[18px] overflow-hidden transition-all duration-300 hover:-translate-y-[6px] hover:border-[#16A34A]/40 shadow-[0_15px_45px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.14)] cursor-pointer`}
        >
            {/* Image Section */}
            <div className="relative h-[168px] w-full shrink-0 overflow-hidden">
                <div className="relative w-full h-full overflow-hidden">
                    <img
                        src={turf.image || fallbackImage}
                        alt={turf.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImage;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    <button
                        type="button"
                        onClick={toggleLike}
                        title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all duration-200 z-[2] shadow-md cursor-pointer ${
                            isLiked
                                ? 'bg-white text-rose-500 scale-110 ring-2 ring-rose-300 shadow-rose-200'
                                : 'bg-white/85 text-slate-400 hover:text-rose-500 hover:scale-105'
                        }`}
                    >
                        <HiHeart className={`w-4 h-4 transition-transform duration-200 ${isLiked ? 'scale-110 text-rose-500' : ''}`} />
                    </button>

                    {promo && (
                        <div className="absolute top-2 left-2 z-[2] bg-[#C8FF2E] border border-[#B5F000] rounded-[8px] px-2 py-0.5 flex items-center gap-1 shadow-sm">
                            <span className="text-[10px]">{promo.icon}</span>
                            <span className="text-[9px] font-black text-[#111827] uppercase tracking-wider">
                                {promo.text.includes('•') ? promo.text.split('•')[1].trim() : promo.text}
                            </span>
                        </div>
                    )}

                    <div className="absolute bottom-2 left-2 z-[2] text-[9px] font-black text-white flex items-center gap-1.5 drop-shadow-md whitespace-nowrap bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF2E] shadow-[0_0_8px_rgba(200,255,46,0.8)] animate-pulse"></span>
                        Open: 6:00 AM – 11:00 PM
                    </div>
                </div>
            </div>

            <div className="px-3.5 py-2.5 flex flex-col flex-1 relative z-10 bg-white">

                <h3 className="text-[16px] font-black text-[#111827] leading-tight mb-0.5 truncate group-hover:text-[#16A34A] transition-colors">
                    {turf.name}
                </h3>

                <div className="text-[11px] text-[#6B7280] mb-0.5 flex items-center gap-1.5 truncate font-semibold">
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${turf.lat || 19.1136},${turf.lng || 72.8697}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-[#16A34A] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                        title="Open directions in Google Maps"
                    >
                        <span>📍 {turf.location}</span>
                    </a>
                    {turf.distance !== null && turf.distance !== undefined && !isNaN(Number(turf.distance)) && (
                        <>
                            <span className="text-slate-300">•</span>
                            <span>{Number(turf.distance).toFixed(1)} km</span>
                        </>
                    )}
                </div>

                <div className="text-[10px] text-[#6B7280] mb-1.5 flex items-center gap-1">
                    <span className="text-amber-500 text-[10px]">⭐</span>
                    <span className="font-bold text-[#111827]">{turf.rating ? Number(turf.rating).toFixed(1) : '4.5'}</span>
                    <span className="font-medium text-[#6B7280]">({turf.reviews || 120})</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="text-[9px] font-bold text-[#111827] bg-slate-100 px-2 py-0.5 rounded-[6px] border border-[#E5E7EB] flex items-center gap-0.5">
                        {(turf.amenities || []).join(' ').toLowerCase().includes('covered') ? 'Covered' : 'Open'}
                    </span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-[6px] border flex items-center gap-0.5
                        ${turf.rating >= 4.4 ? 'text-[#16A34A] border-green-200 bg-green-50' :
                            turf.rating >= 4.0 ? 'text-amber-600 border-amber-200 bg-amber-50' :
                                'text-gray-600 border-gray-200 bg-gray-50'}`}>
                        {turf.rating >= 4.7 ? 'Excellent' : turf.rating >= 4.4 ? 'Very Good' : turf.rating >= 4.0 ? 'Good' : 'Average'}
                    </span>
                    <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-[6px] flex items-center gap-0.5">
                        {Number(turf.price) < 600 ? 'Value' : Number(turf.price) < 900 ? 'Budget' : Number(turf.price) < 1200 ? 'Premium' : 'Expensive'}
                    </span>
                </div>

                <div className="flex flex-wrap items-center mb-1.5">
                    <span className="text-[10px] font-medium text-[#6B7280] line-clamp-2 leading-tight" title={[turf.dimensions || '90 × 45 ft', 'Turf', ...(turf.amenities || ['Parking', 'Washroom'])].join(', ')}>
                        {[
                            turf.dimensions || '90 × 45 ft',
                            'Turf',
                            ...(turf.amenities || ['Parking', 'Washroom'])
                        ].join(', ')}
                    </span>
                </div>

                <div className="border-t border-[#E5E7EB] pt-2 mt-auto flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-[#6B7280] uppercase tracking-widest font-black mb-0.5 leading-none">Starts From</span>
                        <div className="flex items-baseline text-[#111827]">
                            <span className="text-[19px] font-black leading-none tracking-tight text-[#111827]">₹{Number(turf.price).toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-[#6B7280] font-bold ml-1">/hr</span>
                        </div>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/booking/${turf.id}`) }}
                        className="px-4 py-2 rounded-[14px] text-[11px] font-black text-[#111827] bg-[#C8FF2E] hover:bg-[#B5F000] transition-all duration-300 shadow-[0_4px_15px_rgba(200,255,46,0.4)] hover:shadow-[0_6px_20px_rgba(200,255,46,0.6)] hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer border border-[#B5F000]"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    )
}
