import React from 'react'
import { createPortal } from 'react-dom'

/**
 * VenueSwitchModal — Quick venue selection modal
 */
export default function VenueSwitchModal({
    isOpen,
    onClose,
    allTurfs = [],
    selectedVenue,
    onSelectVenue
}) {
    if (!isOpen) return null

    return createPortal(
        <div
            className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            style={{ zIndex: 999999 }}
        >
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-100 max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                        <h3 className="text-lg font-black text-[#111827]">Switch Turf Venue</h3>
                        <p className="text-xs text-slate-500 font-medium">Select any available turf arena across cities</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 custom-scrollbar">
                    {allTurfs.map((t) => {
                        const isSelected = selectedVenue?.id === t.id
                        return (
                            <div
                                key={t.id}
                                onClick={() => {
                                    onSelectVenue(t)
                                    onClose()
                                }}
                                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                    isSelected
                                        ? 'bg-emerald-50 border-[#10B981] shadow-xs'
                                        : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={t.image || '/images/turf1.png'}
                                        alt={t.name}
                                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                                    />
                                    <div>
                                        <div className="font-black text-[#111827] text-sm">{t.name}</div>
                                        <div className="text-xs text-slate-500 font-medium">📍 {t.location}, {t.city} · ⭐ {t.rating}</div>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <div className="text-sm font-black text-[#065F46] font-mono">₹{t.price}/hr</div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${isSelected ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-700'}`}>
                                        {isSelected ? 'ACTIVE' : 'SELECT'}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>,
        document.body
    )
}
