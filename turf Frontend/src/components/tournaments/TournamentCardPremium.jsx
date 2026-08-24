import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    HiStar, HiLocationMarker, HiCalendar, HiClock, 
    HiUserGroup, HiOutlineBadgeCheck, HiOutlineHeart, 
    HiOutlineShare, HiOutlineSwitchHorizontal, HiOutlineFire
} from 'react-icons/hi';

export default function TournamentCardPremium({ tournament }) {
    const navigate = useNavigate();

    const rawPrize = tournament?.prize || tournament?.prizePool || tournament?.prize_pool || tournament?.total_prize;
    const formattedPrize = (() => {
        if (!rawPrize || String(rawPrize).includes('NaN')) return '₹0';
        if (typeof rawPrize === 'number') return `₹${rawPrize.toLocaleString('en-IN')}`;
        const str = String(rawPrize).trim();
        return str.startsWith('₹') ? str : `₹${str}`;
    })();

    const rawFee = tournament?.entryFee || tournament?.entry_fee || tournament?.price;
    const formattedFee = (() => {
        if (!rawFee || String(rawFee).includes('NaN')) return '0';
        if (typeof rawFee === 'number') return rawFee.toLocaleString('en-IN');
        const str = String(rawFee).replace(/[^0-9]/g, '');
        return str || '0';
    })();
    
    const t = {
        id: tournament?.id || tournament?._id,
        title: tournament?.title || tournament?.name || 'Tournament',
        image: tournament?.banner || tournament?.image || '/images/turf1.png',
        rating: tournament?.rating || 5.0,
        maxTeams: tournament?.maxTeams || tournament?.max_teams || 16,
        registeredTeams: tournament?.registrations || tournament?.registeredTeams || tournament?.registered_teams || 0,
        location: tournament?.location || tournament?.courtName || tournament?.city || 'SportMatrix Venue',
        date: tournament?.startDate ? new Date(tournament.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : (tournament?.date || 'Scheduled'),
        time: tournament?.time || 'Flexible',
        level: tournament?.level || tournament?.skillLevel || 'Open',
        age: tournament?.age || tournament?.ageLimit || 'Open',
        prize: formattedPrize,
        entryFee: formattedFee,
        organizer: tournament?.organizer || tournament?.createdBy || 'SportMatrix',
        isVerified: true,
        isTrending: false,
        status: tournament?.status === 'APPROVED' ? 'REGISTRATION OPEN' : (tournament?.status || 'Active'),
        daysLeft: tournament?.registrationLastDate ? Math.max(0, Math.ceil((new Date(tournament.registrationLastDate) - new Date()) / (1000 * 60 * 60 * 24))) : 7
    };

    const fillPercentage = Math.round((t.registeredTeams / t.maxTeams) * 100);

    return (
        <div 
            onClick={() => navigate(`/tournaments/${t.id}`)}
            className="group flex flex-col bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-[#C8FF2E] hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)] hover:-translate-y-1 relative"
        >
            {/* Top Image Section */}
            <div className="h-44 relative overflow-hidden shrink-0">
                <img 
                    src={t.image} 
                    alt={t.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 via-transparent to-black/20" />
                
                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {t.isTrending && (
                        <div className="bg-orange-500 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-sm flex items-center gap-1">
                            <span>🔥</span> Trending
                        </div>
                    )}
                    {t.isVerified && (
                        <div className="bg-blue-600 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-sm flex items-center gap-1">
                            <HiOutlineBadgeCheck className="w-3.5 h-3.5" /> Verified
                        </div>
                    )}
                </div>

                <div className="absolute top-3 right-3">
                    <div className="bg-[#C8FF2E] border border-[#B5F000] px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-[#111827] shadow-sm flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                        {t.status}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1 relative z-10">
                <h3 className="text-base font-black text-[#111827] tracking-tight uppercase leading-tight mb-3 group-hover:text-[#16A34A] transition-colors line-clamp-1">
                    {t.title}
                </h3>
                
                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 mb-4">
                    <div className="flex items-center gap-1.5 text-[#111827]">
                        <HiStar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-[11px] font-bold">{t.rating} <span className="text-[#6B7280] font-medium">(42)</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#111827]">
                        <HiUserGroup className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-[11px] font-bold">{t.registeredTeams}/{t.maxTeams} Teams</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#111827]">
                        <HiLocationMarker className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="text-[11px] font-bold truncate pr-2">{t.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#111827]">
                        <HiCalendar className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        <span className="text-[11px] font-bold">{t.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#111827]">
                        <HiClock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="text-[11px] font-bold">{t.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#111827]">
                        <span className="text-[10px] font-black bg-[#F7F9FC] text-[#111827] px-2 py-0.5 rounded-md border border-[#E5E7EB]">🎯 {t.level}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4 bg-[#F7F9FC] p-3 rounded-xl border border-[#E5E7EB]">
                    <div className="flex justify-between items-end mb-1.5">
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{t.registeredTeams} Registered</span>
                        <span className="text-[10px] font-black text-[#16A34A]">{fillPercentage}% Filled</span>
                    </div>
                    <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#C8FF2E] rounded-full shadow-[0_0_10px_rgba(200,255,46,0.6)]"
                            style={{ width: `${fillPercentage}%` }}
                        />
                    </div>
                    <div className="mt-2 text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                        <span>⏳</span> Registration Ends in {t.daysLeft} Days
                    </div>
                </div>

                {/* Prizes & Fee */}
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E5E7EB]">
                    <div>
                        <div className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mb-0.5">Prize Pool</div>
                        <div className="text-sm font-black text-[#111827] flex items-center gap-1">
                            🏆 {t.prize}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mb-0.5">Entry Fee</div>
                        <div className="text-sm font-black text-[#16A34A]">💰 ₹{t.entryFee}</div>
                    </div>
                </div>

                {/* Organizer */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-[#F7F9FC] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-[#111827]">{t.organizer.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                        <div className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider leading-none mb-0.5">Hosted By</div>
                        <div className="text-[11px] font-black text-[#111827] flex items-center gap-1">
                            {t.organizer} <HiOutlineBadgeCheck className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-auto flex flex-col gap-3">
                    <div className="flex items-center gap-4 text-[#6B7280]">
                        <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center gap-1 hover:text-rose-500 transition-colors text-[10px] font-bold uppercase tracking-wider">
                            <HiOutlineHeart className="w-3.5 h-3.5" /> Save
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center gap-1 hover:text-blue-600 transition-colors text-[10px] font-bold uppercase tracking-wider">
                            <HiOutlineShare className="w-3.5 h-3.5" /> Share
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center gap-1 hover:text-amber-500 transition-colors text-[10px] font-bold uppercase tracking-wider ml-auto">
                            <HiOutlineSwitchHorizontal className="w-3.5 h-3.5" /> Compare
                        </button>
                    </div>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/tournaments/${t.id}`); }}
                            className="flex-1 py-2 bg-[#F7F9FC] hover:bg-[#E5E7EB] text-[#111827] text-[11px] font-black uppercase tracking-wider rounded-xl transition-colors border border-[#E5E7EB] active:scale-95"
                        >
                            View
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/tournaments/${t.id}?register=true`); }}
                            className="flex-1 py-2 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] text-[11px] font-black uppercase tracking-wider rounded-xl transition-colors border border-[#B5F000] shadow-sm active:scale-95"
                        >
                            Join Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
