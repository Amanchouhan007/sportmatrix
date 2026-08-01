export default function SlotGrid({ slots = [], onSelect, selectedSlot }) {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {slots.map((slot) => {
                const isSelected = selectedSlot === slot.id
                const isBooked = slot.status === 'booked'
                const isBlocked = slot.status === 'blocked'
                return (
                    <button
                        key={slot.id}
                        onClick={() => !isBooked && !isBlocked && onSelect?.(slot)}
                        disabled={isBooked || isBlocked}
                        className={`px-3 py-2.5 rounded-sm text-xs font-bold tracking-wider transition-all duration-300 border cursor-pointer disabled:cursor-not-allowed ${isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                            : isBooked
                                ? 'bg-slate-900/50 text-slate-600 border-white/5 opacity-50'
                                : isBlocked
                                    ? 'bg-red-500/10 text-red-500/50 border-red-500/20 opacity-50'
                                    : 'bg-slate-800 text-slate-300 border-white/10 hover:border-emerald-500/50 hover:bg-slate-700 hover:text-white hover:shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                            }`}
                    >
                        <span className="block tabular-nums">{slot.time}</span>
                        {slot.price && <span className="block text-[9px] mt-0.5 opacity-70 tabular-nums font-medium">₹{slot.price}</span>}
                    </button>
                )
            })}
        </div>
    )
}
