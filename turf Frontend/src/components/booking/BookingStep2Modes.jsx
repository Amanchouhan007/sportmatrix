import React from 'react'

/**
 * BookingStep2Modes — Step 2 Payment Mode Selection Component
 */
export default function BookingStep2Modes({
    paymentMode,
    setPaymentMode,
    totalRent,
    perPlayerCount,
    setPerPlayerCount,
    perPlayerShareAmount,
    split50Amount,
    setActiveStep
}) {
    const modes = [
        {
            id: 'FULL_PAY',
            title: 'FULL PAY™',
            subtitle: '"Tera Bhai Dega Pura Bill!"',
            desc: 'Pay complete turf rent upfront & collect from team offline.',
            badge: 'FASTEST',
            badgeBg: 'bg-[#16A34A] text-white',
            borderColor: 'border-emerald-400',
            bgGradient: 'from-emerald-50 to-teal-50/30',
            calcText: `Total: ₹${totalRent.toLocaleString('en-IN')} · You Pay: ₹${totalRent.toLocaleString('en-IN')} · Opponent: ₹0`,
            icon: '💳'
        },
        {
            id: 'DARE_TO_PLAY',
            title: 'DARE MATCH™',
            subtitle: '"Dum Hai Toh Harake Dikha!"',
            desc: 'Winner Plays FREE, Loser Pays Match Rent! Both teams enter with ₹100 deposit.',
            badge: '₹0 FREE',
            badgeBg: 'bg-gradient-to-r from-red-600 to-orange-500 text-white',
            borderColor: 'border-orange-400',
            bgGradient: 'from-orange-50 to-amber-50/30',
            calcText: `Winner: Full Refund · Loser Pays ₹${totalRent.toLocaleString('en-IN')} · Draw: 50:50 Split`,
            icon: '🔥'
        },
        {
            id: 'SPLIT_50_50',
            title: '50:50 SPLIT™',
            subtitle: '"Aadha Bill Tera, Aadha Mera!"',
            desc: 'Both teams pay half (50%) of the booking amount to confirm slot.',
            badge: 'NO KHAT-PAT',
            badgeBg: 'bg-[#10B981] text-white',
            borderColor: 'border-teal-400',
            bgGradient: 'from-teal-50 to-emerald-50/30',
            calcText: `Total: ₹${totalRent.toLocaleString('en-IN')} · You Pay: ₹${split50Amount.toLocaleString('en-IN')} · Opponent: ₹${split50Amount.toLocaleString('en-IN')}`,
            icon: '🤝'
        },
        {
            id: 'PER_PLAYER',
            title: 'SQUAD SPLIT™',
            subtitle: '"Apna Hissa, Khud Bharo!"',
            desc: 'Every player pays their individual share directly using personal UPI links.',
            badge: 'EQUAL PAY',
            badgeBg: 'bg-blue-600 text-white',
            borderColor: 'border-blue-400',
            bgGradient: 'from-blue-50 to-indigo-50/30',
            calcText: `Total: ₹${totalRent.toLocaleString('en-IN')} · ${perPlayerCount} Players: ₹${perPlayerShareAmount.toLocaleString('en-IN')} each`,
            icon: '👥'
        }
    ]

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in duration-200">
            <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">Choose match payment mode</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Select how you and your squad/opponents will split the ₹{totalRent.toLocaleString('en-IN')} turf rent</p>
            </div>

            {/* 4 Mode Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {modes.map((m) => {
                    const isSelected = paymentMode === m.id
                    return (
                        <div
                            key={m.id}
                            onClick={() => setPaymentMode(m.id)}
                            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                                isSelected
                                    ? `bg-gradient-to-br ${m.bgGradient} ${m.borderColor} shadow-md scale-[1.01]`
                                    : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{m.icon}</span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-black text-[#111827]">{m.title}</h3>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${m.badgeBg}`}>
                                                {m.badge}
                                            </span>
                                        </div>
                                        <p className="text-xs font-black text-slate-700 mt-0.5">{m.subtitle}</p>
                                    </div>
                                </div>

                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#10B981] bg-[#10B981]' : 'border-slate-300 bg-white'}`}>
                                    {isSelected && <span className="text-white text-xs font-black">✓</span>}
                                </div>
                            </div>

                            <p className="text-xs text-slate-600 font-medium leading-relaxed">{m.desc}</p>

                            {/* Squad Split Per Player Counter */}
                            {m.id === 'PER_PLAYER' && isSelected && (
                                <div className="bg-white p-3 rounded-2xl border border-blue-200 flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-slate-700">Players Count:</span>
                                    <div className="flex items-center gap-2">
                                        {[4, 6, 8, 10, 12].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setPerPlayerCount(num)
                                                }}
                                                className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                                    perPlayerCount === num ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Calculation Banner */}
                            <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200/80 text-[11px] font-bold text-slate-700 font-mono">
                                💡 {m.calcText}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Step 2 Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
                >
                    ← Back to Slots
                </button>

                <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                    <span>Next: Lock Match & Pay →</span>
                </button>
            </div>
        </div>
    )
}
