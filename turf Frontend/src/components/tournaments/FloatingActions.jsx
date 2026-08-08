import React from 'react';
import { HiOutlineChat, HiOutlineFilter, HiOutlineUpload, HiOutlineArrowUp } from 'react-icons/hi';

export default function FloatingActions() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {/* Sticky Bottom Bar (Mobile/Tablet) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-[#E5E7EB] px-4 py-3 flex items-center justify-between shadow-lg">
                <div className="text-[#111827] font-black uppercase text-[10px] tracking-wider">
                    128 <span className="text-[#6B7280]">Found</span>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl text-[10px] font-black text-[#111827] uppercase tracking-wider">Sort</button>
                    <button className="px-3 py-1.5 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl text-[10px] font-black text-[#111827] uppercase tracking-wider">Map</button>
                    <button className="px-3.5 py-1.5 bg-[#C8FF2E] border border-[#B5F000] text-[#111827] rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">Filter</button>
                </div>
            </div>

            {/* Floating Quick Actions (Desktop) */}
            <div className="fixed bottom-8 right-8 z-50 hidden md:flex flex-col gap-3">
                <button 
                    className="w-12 h-12 bg-white hover:bg-[#C8FF2E] text-[#111827] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E5E7EB] transition-all group relative cursor-pointer active:scale-95"
                >
                    <HiOutlineChat className="w-5 h-5 text-[#16A34A]" />
                    <span className="absolute right-14 bg-[#111827] text-white text-[10px] font-black px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-wider whitespace-nowrap shadow-md">
                        Support Chat
                    </span>
                </button>
                
                <button 
                    className="w-12 h-12 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(200,255,46,0.4)] border border-[#B5F000] transition-all group relative cursor-pointer active:scale-95"
                >
                    <HiOutlineUpload className="w-5 h-5 text-[#111827]" />
                    <span className="absolute right-14 bg-[#111827] text-white text-[10px] font-black px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-wider whitespace-nowrap shadow-md">
                        Host Tournament
                    </span>
                </button>

                <button 
                    onClick={scrollToTop}
                    className="w-12 h-12 bg-white hover:bg-[#F7F9FC] text-[#111827] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E5E7EB] transition-all group relative cursor-pointer active:scale-95"
                >
                    <HiOutlineArrowUp className="w-5 h-5 text-[#111827]" />
                    <span className="absolute right-14 bg-[#111827] text-white text-[10px] font-black px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-wider whitespace-nowrap shadow-md">
                        Back to Top
                    </span>
                </button>
            </div>
        </>
    );
}
