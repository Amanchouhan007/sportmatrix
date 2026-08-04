import React from 'react';

const sportsList = ['Football', 'Cricket', 'Badminton', 'Pickleball', 'Basketball'];
const sortOptions = ['Nearest First', 'Price Low to High', 'Price High to Low', 'Highest Rated', 'Newest'];

export default function PremiumFilters({ filters, onFilterChange }) {
    return (
        <div className="flex flex-col gap-3 mb-4 w-full">
            <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-2 overflow-x-auto hide-scrollbar scrollbar-hide pb-2 sm:pb-0">
                    {sportsList.map(sport => (
                        <button
                            key={sport}
                            onClick={() => onFilterChange('sport', filters.sport === sport ? '' : sport)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border whitespace-nowrap ${filters.sport === sport
                                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                : 'bg-slate-900/80 text-slate-400 border-white/5 hover:border-slate-600 hover:text-slate-200 backdrop-blur-md'
                            }`}
                        >
                            {sport}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-white/5 backdrop-blur-md shrink-0">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:block ml-2">Sort By</span>
                    <select
                        value={filters.sort || 'Nearest First'}
                        onChange={(e) => onFilterChange('sort', e.target.value)}
                        className="bg-slate-950 border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
                    >
                        {sortOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
