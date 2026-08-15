import React from 'react'
import { useAuth } from '../../context/AuthContext'

/**
 * BookingStep4Receipt — Step 4 Booking Success Receipt & WhatsApp Share Component
 */
export default function BookingStep4Receipt({
    bookingResult,
    selectedVenue,
    selectedDateObj,
    selectedSlotTime,
    allTimeSlots,
    paymentMode,
    totalRent,
    myPaymentAmount,
    opponentShareAmount,
    handleCopyShareLink,
    handleShareWhatsApp,
    navigate
}) {
    const { user } = useAuth() || {}
    const slotTimeLabel = allTimeSlots.find(s => s.id === selectedSlotTime)?.time || selectedSlotTime

    const handleViewAction = () => {
        if (user) {
            navigate('/customer/bookings')
        } else {
            navigate('/turfs')
        }
    }

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-sm space-y-7 text-center animate-in zoom-in-95 duration-200">
            {/* Animated Check Success Badge */}
            <div className="w-20 h-20 bg-emerald-100 border-4 border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-4xl shadow-lg animate-bounce">
                ✓
            </div>

            <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#10B981] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    MATCH SLOT LOCKED & CONFIRMED
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight mt-3">Booking Confirmed!</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                    Booking Ref: <strong className="font-mono text-slate-800">{bookingResult?.bookingId || 'SM-BK-9831'}</strong>
                </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3 max-w-lg mx-auto text-xs">
                <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Turf Venue:</span>
                    <span className="font-black text-[#111827]">{selectedVenue.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Location:</span>
                    <span className="font-bold text-slate-700">{selectedVenue.location}, {selectedVenue.city}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Date & Time:</span>
                    <span className="font-bold text-slate-700">{selectedDateObj.formattedLabel} · {slotTimeLabel}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Payment Mode:</span>
                    <span className="font-black text-[#10B981] font-mono">{paymentMode.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                    <span className="font-black text-[#111827]">Amount Paid:</span>
                    <span className="font-black text-[#10B981] font-mono text-base">₹{myPaymentAmount.toLocaleString('en-IN')}</span>
                </div>
            </div>

            {/* WhatsApp & Public Challenge Board Box */}
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 max-w-lg mx-auto space-y-3.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📲</span>
                        <h4 className="text-xs font-black text-emerald-950 uppercase tracking-tight">Share Challenge / Pay Link</h4>
                    </div>
                    <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                        {paymentMode === 'DARE_TO_PLAY' ? 'Opponent Lock Link' : 'Squad Pay Link'}
                    </span>
                </div>

                {/* Public vs Private Dare Toggle for Dare Mode */}
                {paymentMode === 'DARE_TO_PLAY' && (
                    <div className="bg-white p-3 rounded-xl border border-emerald-200 text-left space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">DARE VISIBILITY MODE</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => {
                                    if (addToast) addToast('Challenge posted to Public Open Dare Board!', 'success')
                                }}
                                className="bg-emerald-100 border-2 border-emerald-500 text-emerald-950 font-black p-2 rounded-xl text-left hover:scale-[1.02] transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-1.5">
                                    <span>🌐</span> <span className="text-[11px]">Public Open Board</span>
                                </div>
                                <div className="text-[9.5px] font-normal text-emerald-800 mt-0.5">Any team on website can accept</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (addToast) addToast('Private challenge link active!', 'info')
                                }}
                                className="bg-slate-50 border border-slate-200 text-slate-700 font-bold p-2 rounded-xl text-left hover:bg-slate-100 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-1.5">
                                    <span>🔒</span> <span className="text-[11px]">Private WhatsApp</span>
                                </div>
                                <div className="text-[9.5px] font-normal text-slate-500 mt-0.5">Only people with link can accept</div>
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 bg-white border border-emerald-200 p-2 rounded-xl">
                    <span className="text-[11px] font-mono text-slate-600 truncate flex-1 text-left px-2">
                        {window.location.origin}/booking/{selectedVenue.id}?mode={paymentMode.toLowerCase()}&pay=opponent
                    </span>
                    <button
                        type="button"
                        onClick={handleCopyShareLink}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                    >
                        Copy
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                    <span>💬 Share directly on WhatsApp</span>
                </button>

                {/* 3-HOUR CANCELLATION POLICY NOTE */}
                {paymentMode === 'DARE_TO_PLAY' && (
                    <div className="bg-amber-50 border border-amber-200/90 p-2.5 rounded-xl text-left text-[10.5px] text-amber-900 font-medium leading-tight">
                        💡 <strong>Dare Match Cancellation Rule:</strong> Opponent nahi milne par aap match time se <strong>3 hours pehle tak cancel</strong> karke 100% deposit refund pa sakte hain. Agar 3 hours pehle tak cancel nahi kiya, to slot aapke naam par confirm rahega aur full bill pay karna hoga.
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-4 pt-3">
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
                >
                    Back to Home
                </button>

                <button
                    type="button"
                    onClick={handleViewAction}
                    className="bg-[#111827] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                >
                    {user ? 'View My Bookings →' : 'Explore More Turfs →'}
                </button>
            </div>
        </div>
    )
}
