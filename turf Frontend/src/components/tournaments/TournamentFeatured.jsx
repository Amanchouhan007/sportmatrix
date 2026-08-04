import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineBadgeCheck, HiOutlineFire, HiOutlineLocationMarker, HiOutlineCalendar } from 'react-icons/hi';

export default function TournamentFeatured() {
    const navigate = useNavigate();

    return (
        <div className="mb-10 w-full rounded-3xl overflow-hidden relative group border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900 cursor-pointer" onClick={() => navigate('/tournaments/featured')}>
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1574629810360-7efbb6b6923f?auto=format&fit=crop&q=80&w=1200" 
                    alt="Featured Tournament" 
                    className="w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:scale-105 group-hover:opacity-50 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            </div>

            <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center md:items-stretch gap-8">
                <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-[10px] uppercase tracking-widest rounded shadow-[0_0_15px_rgba(245,158,11,0.5)] mb-4">
                        <HiOutlineFire className="w-4 h-4" /> FEATURED TOURNAMENT
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-2 leading-tight">
                        Football Championship 2026
                    </h2>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                        <div className="flex items-center gap-1.5 text-amber-400 font-black text-xl">
                            🏆 ₹2,00,000 Prize
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 hidden md:block" />
                        <div className="flex items-center gap-1 text-slate-300 font-bold text-sm">
                            <span className="bg-slate-800 px-2 py-1 rounded">64 Teams</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 hidden md:block" />
                        <div className="flex items-center gap-1 text-blue-400 font-bold text-sm bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                            <HiOutlineBadgeCheck className="w-4 h-4" /> Verified
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 mb-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        <div className="flex items-center justify-center md:justify-start gap-1.5">
                            <HiOutlineLocationMarker className="w-4 h-4 text-rose-400" />
                            Elite Sports Complex, Indore
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-1.5">
                            <HiOutlineCalendar className="w-4 h-4 text-emerald-400" />
                            Starts 25 Aug 2026
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <button className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black italic tracking-widest uppercase rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                            Join Now - ₹2500
                        </button>
                        <button className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-white font-bold tracking-widest uppercase rounded-lg border border-white/10 backdrop-blur transition-all text-xs">
                            View Details
                        </button>
                    </div>
                </div>

                <div className="shrink-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl w-full md:w-64">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Sponsored By</p>
                    {/* Simulated Logo */}
                    <div className="text-3xl font-black italic tracking-tighter text-white mb-6">
                        ADIDAS
                    </div>
                    
                    <div className="w-full bg-slate-900 rounded-lg p-4 border border-white/5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 text-center">Registration Closes in</p>
                        <div className="text-xl font-black text-amber-400 text-center tabular-nums">
                            05:12:44:10
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
