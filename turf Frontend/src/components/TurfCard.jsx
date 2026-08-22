import { useState } from 'react';
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

    // Dynamic Turf Owner Offer Reader with Guaranteed CSS Gradients
    const getTurfOffer = (t) => {
        try {
            // 1. Check if Turf Owner has created an active offer for this specific turf
            const cachedDiscounts = localStorage.getItem('sports_discounts_data');
            if (cachedDiscounts) {
                const list = JSON.parse(cachedDiscounts);
                const matched = list.find(d => {
                    if (d.status && d.status !== 'Active') return false;
                    const matchesId = String(d.turfId) === String(t.id) ||
                                      d.turfId === `turf-${t.id}` ||
                                      (d.turfName && d.turfName.toLowerCase().includes(t.name.toLowerCase()));
                    return matchesId;
                });

                if (matched) {
                    const isPercent = matched.discountType === 'Percentage';
                    const tag = isPercent ? `${matched.discountValue}% OFF` : `FLAT ₹${matched.discountValue} OFF`;
                    return {
                        code: matched.promoCode || 'PROMO' + matched.discountValue,
                        icon: '🔥',
                        tag: matched.title ? matched.title.toUpperCase() : tag,
                        discount: matched.discountValue,
                        type: isPercent ? 'percent' : 'flat',
                        bg: 'linear-gradient(135deg, #E11D48 0%, #F97316 50%, #F59E0B 100%)',
                        shadow: '0 6px 18px rgba(225,29,72,0.55)'
                    };
                }
            }
        } catch (e) {
            console.error('Error fetching turf owner offer:', e);
        }

        // 2. Default high-converting offer if no owner custom discount is active
        const id = Number(t.id) || 1;
        const offers = [
            { code: 'SM200', icon: '🔥', tag: 'FLAT ₹200 OFF', discount: 200, type: 'flat', bg: 'linear-gradient(135deg, #E11D48 0%, #F97316 50%, #F59E0B 100%)', shadow: '0 6px 18px rgba(225,29,72,0.55)' },
            { code: 'CRICKET20', icon: '⚡', tag: '20% OFF FIRST MATCH', discount: 20, type: 'percent', bg: 'linear-gradient(135deg, #D97706 0%, #EA580C 50%, #DC2626 100%)', shadow: '0 6px 18px rgba(234,88,12,0.55)' },
            { code: 'PROUMPIRE', icon: '🏏', tag: 'FREE UMPIRE ADDON', discount: 300, type: 'umpire', bg: 'linear-gradient(135deg, #059669 0%, #0D9488 50%, #059669 100%)', shadow: '0 6px 18px rgba(5,150,105,0.55)' },
            { code: 'NIGHTSPECIAL', icon: '🌙', tag: 'NIGHT MATCH DEAL', discount: 200, type: 'flat', bg: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #DB2777 100%)', shadow: '0 6px 18px rgba(124,58,237,0.55)' },
            { code: 'DARECASH150', icon: '🎁', tag: '₹150 DARE CASHBACK', discount: 150, type: 'flat', bg: 'linear-gradient(135deg, #EA580C 0%, #DC2626 50%, #F59E0B 100%)', shadow: '0 6px 18px rgba(220,38,38,0.55)' },
            { code: 'SQUAD100', icon: '🎟️', tag: 'SQUAD ₹100/PLAYER', discount: 150, type: 'flat', bg: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #0284C7 100%)', shadow: '0 6px 18px rgba(37,99,235,0.55)' },
            { code: 'EARLY250', icon: '⭐', tag: 'EARLY BIRD ₹250 OFF', discount: 250, type: 'flat', bg: 'linear-gradient(135deg, #059669 0%, #65A30D 50%, #0D9488 100%)', shadow: '0 6px 18px rgba(101,163,13,0.55)' },
        ];
        return offers[id % offers.length];
    }
    const promo = getTurfOffer(turf)

    const fallbackImage = '/images/turf1.png';

    const handleViewDetails = (e) => {
        if (e) e.stopPropagation();
        navigate(`/turf/${turf.id}`)
    }

    const handleBookNow = (e) => {
        if (e) e.stopPropagation();
        const promoParam = promo?.code ? `?promo=${promo.code}` : ''
        navigate(`/booking/${turf.id}${promoParam}`)
    }

    const getTurfHourlyPrice = (t) => {
        if (!t) return 1000;
        const val = t.pricePerHour ?? t.price ?? t.price_per_hour ?? t.hourlyRate ?? t.hourly_rate ?? t.minPrice ?? t.startPrice;
        if (val !== undefined && val !== null && val !== '') {
            const num = Number(val);
            if (!isNaN(num) && num > 0) return num;
        }
        return 1000;
    };
    const hourlyPrice = getTurfHourlyPrice(turf);

    return (
        <div
            id={`turf-card-${turf.id}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={handleViewDetails}
            style={{ animationDelay: `${i * 100}ms` }}
            className={`group relative flex flex-col h-full bg-white border border-[#E5E7EB] rounded-[18px] overflow-hidden transition-all duration-300 hover:-translate-y-[6px] hover:border-[#16A34A]/40 shadow-[0_15px_45px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.14)] cursor-pointer`}
        >
            {/* Image Section */}
            <div className="relative h-[155px] sm:h-[168px] w-full shrink-0 overflow-hidden">
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

                    {/* Ultra-Attractive Glowing Offer Badge (Prominent, Bold & Guaranteed Visible) */}
                    {(turf.discountOffer || promo) && (
                        <div 
                            onClick={(e) => { e.stopPropagation(); handleBookNow(e) }}
                            style={{ 
                                background: promo?.bg || 'linear-gradient(135deg, #D97706 0%, #EA580C 50%, #DC2626 100%)', 
                                boxShadow: promo?.shadow || '0 6px 18px rgba(234,88,12,0.55)' 
                            }}
                            className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 border sm:border-2 border-white/80 rounded-xl px-2 sm:px-2.5 py-0.5 sm:py-1 flex items-center gap-1 sm:gap-1.5 backdrop-blur-md transition-all duration-300 group-hover:scale-105 shadow-lg select-none cursor-pointer max-w-[calc(100%-48px)] overflow-hidden"
                        >
                            <span className="text-[11px] sm:text-xs animate-bounce shrink-0 drop-shadow-md">{promo?.icon || '⚡'}</span>
                            <span className="text-[9.5px] sm:text-[10.5px] font-black text-white uppercase tracking-wider drop-shadow-md truncate">
                                {turf.discountOffer ? turf.discountOffer.toUpperCase() : (promo?.tag || '20% OFF FIRST MATCH')}
                            </span>
                        </div>
                    )}

                    <div className="absolute bottom-2 left-2 z-[2] text-[8.5px] sm:text-[9px] font-black text-white flex items-center gap-1.5 drop-shadow-md whitespace-nowrap bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF2E] shadow-[0_0_8px_rgba(200,255,46,0.8)] animate-pulse"></span>
                        Open: {turf.openingTime || '6:00 AM'} – {turf.closingTime || '11:00 PM'}
                    </div>
                </div>
            </div>

            <div className="px-3 sm:px-3.5 py-2.5 flex flex-col flex-1 relative z-10 bg-white">

                <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="text-[13.5px] sm:text-[14px] font-black text-[#111827] leading-snug line-clamp-1 group-hover:text-[#16A34A] transition-colors">
                        {turf.name}
                    </h3>
                </div>

                <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] text-[#6B7280] font-semibold mb-1">
                    <span className="truncate">📍 {turf.location || turf.city}</span>
                    <span>•</span>
                    <span className="text-[#10B981] font-bold shrink-0">{turf.distance ? `${Number(turf.distance).toFixed(1)} km` : '1.2 km'}</span>
                </div>

                <div className="flex items-center gap-1 mb-1.5">
                    <div className="flex items-center text-amber-500">
                        <span className="text-xs">⭐</span>
                        <span className="text-xs font-black text-[#111827] ml-0.5">{turf.rating || '4.8'}</span>
                    </div>
                    <span className="text-[10px] text-[#6B7280] font-medium">(120)</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="text-[8.5px] sm:text-[9px] font-bold text-[#111827] bg-slate-100 px-2 py-0.5 rounded-[6px] border border-[#E5E7EB] flex items-center gap-0.5">
                        {(turf.amenities || []).join(' ').toLowerCase().includes('covered') ? 'Covered' : 'Open'}
                    </span>
                    <span className={`text-[8.5px] sm:text-[9px] font-black px-2 py-0.5 rounded-[6px] border flex items-center gap-0.5
                        ${turf.rating >= 4.4 ? 'text-[#16A34A] border-green-200 bg-green-50' :
                            turf.rating >= 4.0 ? 'text-amber-600 border-amber-200 bg-amber-50' :
                                'text-gray-600 border-gray-200 bg-gray-50'}`}>
                        {turf.rating >= 4.7 ? 'Excellent' : turf.rating >= 4.4 ? 'Very Good' : turf.rating >= 4.0 ? 'Good' : 'Average'}
                    </span>
                    <span className="text-[8.5px] sm:text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-[6px] flex items-center gap-0.5">
                        {hourlyPrice < 600 ? 'Value' : hourlyPrice < 900 ? 'Budget' : hourlyPrice < 1200 ? 'Premium' : 'Expensive'}
                    </span>
                </div>

                <div className="flex flex-wrap items-center mb-1.5">
                    <span className="text-[9.5px] sm:text-[10px] font-medium text-[#4B5563] line-clamp-2 leading-tight">
                        {(()=>{
                            const dim = turf.turfSize || turf.dimensions || '5,000 Sq.Ft';
                            const m = dim.match(/(\d+)\s*(?:[×x*X]|by)\s*(\d+)/);
                            const sqft = m ? (parseInt(m[1], 10) * parseInt(m[2], 10)).toLocaleString('en-IN') : (dim.includes('Sq.Ft') ? dim : `${dim}`);
                            return (
                                <>
                                    <strong className="text-[#111827] font-bold">📏 {sqft}</strong>
                                    <span className="text-slate-300 mx-1">•</span>
                                    <span>{turf.surfaceType || 'TurfPro Synthetic Arena'}</span>
                                </>
                            );
                        })()}
                    </span>
                </div>

                {/* ── PROFESSIONAL IN-CARD COUPON STRIP (Swiggy / Zomato Pro Style) ── */}
                <div 
                    onClick={handleBookNow}
                    className="my-1.5 py-1 px-2 rounded-lg bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-dashed border-emerald-400/90 flex items-center justify-between gap-1.5 transition-all hover:bg-emerald-100/60 cursor-pointer group/promo select-none"
                >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                        <span className="text-xs shrink-0">{promo?.icon || '⚡'}</span>
                        <span className="text-[9.5px] sm:text-[10px] font-black text-emerald-950 truncate tracking-tight">
                            {turf.discountOffer || promo?.tag || '20% OFF FIRST MATCH'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <span className="font-mono font-black text-[8.5px] sm:text-[9px] bg-emerald-700 text-white px-1.5 py-0.5 rounded shadow-2xs uppercase tracking-wider">
                            {turf.couponCode || promo?.code || 'CRICKET20'}
                        </span>
                    </div>
                </div>

                <div className="border-t border-[#E5E7EB] pt-2 mt-auto flex items-center justify-between gap-1.5">
                    <div className="flex flex-col min-w-0">
                        <span className="text-[8px] text-[#6B7280] uppercase tracking-widest font-black mb-0.5 leading-none">Starts From</span>
                        <div className="flex items-baseline text-[#111827]">
                            <span className="text-[16px] sm:text-[18px] font-black leading-none tracking-tight text-[#111827]">₹{hourlyPrice.toLocaleString('en-IN')}</span>
                            <span className="text-[9px] sm:text-[9.5px] text-[#6B7280] font-bold ml-0.5">/hr</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={handleBookNow}
                            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black text-[#111827] bg-[#C8FF2E] hover:bg-[#B5F000] transition-all duration-300 shadow-[0_3px_12px_rgba(200,255,46,0.35)] hover:shadow-[0_5px_18px_rgba(200,255,46,0.55)] hover:scale-105 active:scale-95 cursor-pointer border border-[#B5F000]"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
