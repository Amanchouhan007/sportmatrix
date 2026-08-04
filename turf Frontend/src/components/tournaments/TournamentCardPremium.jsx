import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    HiStar, HiLocationMarker, HiCalendar, HiClock, 
    HiUserGroup, HiOutlineBadgeCheck, HiOutlineHeart, 
    HiOutlineShare, HiOutlineSwitchHorizontal, HiOutlineFire
} from 'react-icons/hi';

export default function TournamentCardPremium({ tournament }) {
    const navigate = useNavigate();
    
    // Mock data for rich UI presentation if real data is missing
    const t = {
        id: tournament?.id || tournament?._id || 'mock_id',
        title: tournament?.title || tournament?.name || 'Premier Cricket Cup',
        image: tournament?.banner || 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800',
        rating: tournament?.rating || 4.9,
        maxTeams: tournament?.maxTeams || 16,
        registeredTeams: tournament?.registrations || 12,
        location: tournament?.location || 'Vijay Nagar, Indore',
        date: tournament?.date || '15 Aug 2026',
        time: tournament?.time || '6:00 PM',
        level: tournament?.level || 'Intermediate',
        age: tournament?.age || '18+',
        prize: tournament?.prize || '₹50,000',
        entryFee: tournament?.entryFee || '500',
        organizer: tournament?.organizer || 'SportMatrix',
        isVerified: true,
        isTrending: true,
        status: tournament?.status === 'Approved' ? 'Open' : (tournament?.status || 'Open'),
        daysLeft: 2
    };

    const fillPercentage = Math.round((t.registeredTeams / t.maxTeams) * 100);

    return (
        <div 
            onClick={() => navigate(`/tournaments/${t.id}`)}
            className="group flex flex-col bg-slate-900 border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_10px_40px_rgba(16,185,129,0.15)] hover:-translate-y-1 relative"
        >
            {/* Top Image Section */}
            <div className="h-44 relative overflow-hidden shrink-0">
                <img 
                    src={t.image} 
                    alt={t.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/20" />
                
                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {t.isTrending && (
                        <div className="bg-orange-500/90 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest text-white shadow-lg border border-white/20 flex items-center gap-1">
                            <span>🔥</span> Trending
                        </div>
                    )}
                    {t.isVerified && (
                        <div className="bg-blue-500/90 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest text-white shadow-lg border border-white/20 flex items-center gap-1">
                            <HiOutlineBadgeCheck className="w-3 h-3" /> Verified
                        </div>
                    )}
                </div>

                <div className="absolute top-3 right-3">
                    <div className="bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {t.status}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1 relative z-10">
                <h3 className="text-lg font-black text-white italic tracking-tighter uppercase leading-tight mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {t.title}
                </h3>
                
                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 mb-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                        <HiStar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-[10px] font-bold">{t.rating} <span className="text-slate-500 font-normal">(42 Reviews)</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                        <HiUserGroup className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="text-[10px] font-bold">{t.registeredTeams}/{t.maxTeams} Teams</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                        <HiLocationMarker className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="text-[10px] font-bold truncate pr-2">{t.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                        <HiCalendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-[10px] font-bold">{t.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                        <HiClock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="text-[10px] font-bold">{t.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                        <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">🎯 {t.level}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4 bg-slate-950 p-2.5 rounded-lg border border-white/5">
                    <div className="flex justify-between items-end mb-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.registeredTeams} Registered</span>
                        <span className="text-[10px] font-black text-emerald-400">{fillPercentage}% Filled</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                            style={{ width: `${fillPercentage}%` }}
                        />
                    </div>
                    <div className="mt-2 text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                        <span>⏳</span> Registration Ends in {t.daysLeft} Days
                    </div>
                </div>

                {/* Prizes & Fee */}
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                    <div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Prize Pool</div>
                        <div className="text-sm font-black text-amber-400 flex items-center gap-1">
                            🏆 {t.prize}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Entry Fee</div>
                        <div className="text-sm font-black text-white">💰 ₹{t.entryFee}</div>
                    </div>
                </div>

                {/* Organizer */}
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-slate-300">{t.organizer.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                        <div className="text-[8px] text-slate-500 uppercase font-bold tracking-widest leading-none mb-0.5">Hosted By</div>
                        <div className="text-[10px] font-black text-white flex items-center gap-1">
                            {t.organizer} <HiOutlineBadgeCheck className="w-3 h-3 text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-auto flex flex-col gap-3">
                    <div className="flex items-center gap-4 text-slate-400">
                        <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center gap-1 hover:text-rose-400 transition-colors text-[9px] font-bold uppercase tracking-widest">
                            <HiOutlineHeart className="w-3.5 h-3.5" /> Save
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center gap-1 hover:text-blue-400 transition-colors text-[9px] font-bold uppercase tracking-widest">
                            <HiOutlineShare className="w-3.5 h-3.5" /> Share
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center gap-1 hover:text-amber-400 transition-colors text-[9px] font-bold uppercase tracking-widest ml-auto">
                            <HiOutlineSwitchHorizontal className="w-3.5 h-3.5" /> Compare
                        </button>
                    </div>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/tournaments/${t.id}`); }}
                            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors border border-white/5"
                        >
                            View
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/tournaments/${t.id}/register`); }}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                            Join Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
