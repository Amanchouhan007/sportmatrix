import React from 'react';
import { HiOutlineChat, HiOutlineFilter, HiOutlineUpload, HiOutlineArrowUp } from 'react-icons/hi';

export default function FloatingActions() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {/* Sticky Bottom Bar (Mobile/Tablet usually, or persistent) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/90 backdrop-blur-xl border-t border-white/10 px-4 py-3 flex items-center justify-between">
                <div className="text-white font-black uppercase text-[10px] tracking-widest">
                    128 <span className="text-slate-500">Found</span>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-[9px] font-bold text-white uppercase tracking-widest">Sort</button>
                    <button className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-[9px] font-bold text-white uppercase tracking-widest">Map</button>
                    <button className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg text-[9px] font-bold uppercase tracking-widest">Filter</button>
                </div>
            </div>

            {/* Floating Quick Actions (Desktop) */}
            <div className="fixed bottom-8 right-8 z-50 hidden md:flex flex-col gap-3">
                <button 
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_5px_20px_rgba(37,99,235,0.4)] transition-all group relative"
                >
                    <HiOutlineChat className="w-5 h-5" />
                    <span className="absolute right-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest border border-white/10 whitespace-nowrap">
                        Support Chat
                    </span>
                </button>
                
                <button 
                    className="w-12 h-12 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-[0_5px_20px_rgba(245,158,11,0.4)] transition-all group relative"
                >
                    <HiOutlineUpload className="w-5 h-5" />
                    <span className="absolute right-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest border border-white/10 whitespace-nowrap">
                        Host Tournament
                    </span>
                </button>

                <button 
                    onClick={scrollToTop}
                    className="w-12 h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-full flex items-center justify-center shadow-lg border border-white/10 transition-all group relative"
                >
                    <HiOutlineArrowUp className="w-5 h-5" />
                    <span className="absolute right-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest border border-white/10 whitespace-nowrap">
                        Back to Top
                    </span>
                </button>
            </div>
        </>
    );
}
