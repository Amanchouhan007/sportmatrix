export default function TurfBookingSuccessModal({
    isOpen,
    onClose,
    turfData,
    selectedDateObj,
    currentSlot,
    totalRent,
    paymentMode,
    bookingId,
    navigate,
    setSelectedSlot
}) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-2xl max-w-md w-full p-6 text-slate-900 relative">
                <div className="text-center pt-2">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 font-black text-2xl">
                        ✓
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-slate-900">
                        Turf Booking Confirmed!
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                        Booking ID: <span className="font-mono font-bold text-slate-800">{bookingId}</span>
                    </p>
                </div>

                <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Venue</span>
                        <span className="text-slate-900 font-bold">{turfData.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Date & Time</span>
                        <span className="text-slate-900 font-bold">
                            {selectedDateObj.dayShort}, {selectedDateObj.dateNum} {selectedDateObj.monthShort} · {currentSlot?.time || '6:00 PM'}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Total Paid</span>
                        <span className="text-emerald-600 font-black">₹{totalRent.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Payment Option</span>
                        <span className="text-slate-900 font-bold capitalize">{paymentMode}</span>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={() => {
                            onClose()
                            navigate('/customer/bookings')
                        }}
                        className="flex-1 py-3 px-4 bg-[#16A34A] hover:bg-[#15803D] text-white font-black tracking-wider text-xs uppercase rounded-full transition-colors cursor-pointer text-center"
                    >
                        View My Bookings
                    </button>
                    <button
                        onClick={() => {
                            onClose()
                            setSelectedSlot(null)
                        }}
                        className="flex-1 py-3 px-4 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider rounded-full transition-colors cursor-pointer text-center border border-slate-200"
                    >
                        Book Another
                    </button>
                </div>
            </div>
        </div>
    )
}
