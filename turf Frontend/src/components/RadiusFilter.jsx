import React from 'react';

const radii = [1, 3, 5, 10, 20, 50];

export default function RadiusFilter({ selectedRadius, onChange }) {
    return (
        <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start w-full bg-slate-900/50 p-3 rounded-2xl border border-white/5 mb-4 backdrop-blur-md">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Search Radius</span>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar scrollbar-hide">
                {radii.map(r => (
                    <button
                        key={r}
                        onClick={() => onChange(r)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${selectedRadius === r
                            ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-500'
                            : 'bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 hover:border-white/20'
                        }`}
                    >
                        {r} KM
                    </button>
                ))}
            </div>
        </div>
    );
}
