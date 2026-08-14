import React from 'react'

/**
 * CouponsCard — Promo codes, coupon input, and accepted payment method badges card
 */
export default function CouponsCard({
    couponInput,
    setCouponInput,
    appliedOffer,
    setAppliedOffer,
    availableOffers = [],
    handleApplyCoupon,
    addToast
}) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🏷️</span>
                    <div>
                        <h4 className="text-sm font-black text-[#111827]">Coupons & Payment</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Available turf promo codes & payment options</p>
                    </div>
                </div>
                {appliedOffer && (
                    <button
                        type="button"
                        onClick={() => {
                            setAppliedOffer(null)
                            setCouponInput('')
                            if (addToast) addToast('Coupon removed', 'info')
                        }}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 cursor-pointer transition-colors"
                    >
                        ✕ Remove
                    </button>
                )}
            </div>

            {/* Custom Coupon Input */}
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="ENTER PROMO CODE (e.g. SM200)"
                    className="flex-1 uppercase font-mono font-bold text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#10B981] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-normal uppercase"
                />
                <button
                    type="button"
                    onClick={() => handleApplyCoupon(couponInput)}
                    className="bg-[#111827] hover:bg-slate-800 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                >
                    APPLY &gt;
                </button>
            </div>

            {/* Quick Available Promo Chips */}
            {availableOffers.length > 0 && (
                <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">QUICK OFFERS</span>
                    <div className="flex flex-wrap gap-2">
                        {availableOffers.map((off) => (
                            <button
                                key={off.code}
                                type="button"
                                onClick={() => {
                                    setCouponInput(off.code)
                                    handleApplyCoupon(off.code)
                                }}
                                className={`text-[11px] font-bold font-mono px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                                    appliedOffer?.code === off.code
                                        ? 'bg-emerald-100 border-[#10B981] text-[#065F46] shadow-xs'
                                        : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 text-slate-700'
                                }`}
                            >
                                🏷️ <span>{off.code}</span>
                                <span className="text-[9px] font-bold text-emerald-700 bg-white/80 px-1.5 py-0.2 rounded-full border border-emerald-200 font-sans">
                                    {off.discountPercent ? `${off.discountPercent}% OFF` : `₹${off.flatDiscount} OFF`}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Payment Method Badges */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Accepted Payments:</span>
                <div className="flex items-center gap-2 font-bold text-slate-600">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[10px]">VISA</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[10px]">MasterCard</span>
                    <span className="bg-emerald-50 text-[#065F46] px-2 py-0.5 rounded border border-emerald-200 text-[10px]">GPay / UPI</span>
                </div>
            </div>
        </div>
    )
}
