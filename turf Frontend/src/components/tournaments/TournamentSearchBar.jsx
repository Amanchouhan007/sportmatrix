import React from 'react';
import { HiOutlineSearch } from 'react-icons/hi';

export default function TournamentSearchBar() {
    return (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl w-full">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                <HiOutlineSearch className="w-4 h-4 text-emerald-500" />
                <h2 className="text-xs font-black text-white uppercase tracking-widest">Search Tournament</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Sport */}
                <div className="flex flex-col">
                    <select className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white outline-none focus:border-emerald-500 transition-colors cursor-pointer">
                        <option value="">Sport</option>
                        <option value="Football">⚽ Football</option>
                        <option value="Cricket">🏏 Cricket</option>
                        <option value="Badminton">🏸 Badminton</option>
                    </select>
                </div>

                {/* City */}
                <div className="flex flex-col">
                    <select className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white outline-none focus:border-emerald-500 transition-colors cursor-pointer">
                        <option value="">City</option>
                        <option value="Indore">Indore</option>
                        <option value="Bhopal">Bhopal</option>
                    </select>
                </div>

                {/* Date */}
                <div className="flex flex-col">
                    <input 
                        type="date" 
                        placeholder="Date"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white outline-none focus:border-emerald-500 transition-colors cursor-pointer [color-scheme:dark]"
                    />
                </div>

                {/* Search Button */}
                <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_5px_15px_rgba(16,185,129,0.3)]">
                    Search
                </button>
            </div>
        </div>
    );
}
