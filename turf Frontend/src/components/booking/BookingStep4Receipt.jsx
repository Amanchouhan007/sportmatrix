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

    const triggerFastBookingReceiptPrint = () => {
        const bookingId = bookingResult?.bookingId || 'SM-BK-9831'
        const venueName = selectedVenue?.name || 'SportMatrix Turf Arena'
        const venueLocation = `${selectedVenue?.location || 'Indore'}, ${selectedVenue?.city || 'Madhya Pradesh'}`
        const dateLabel = `${selectedDateObj?.formattedLabel || 'Today'} · ${slotTimeLabel}`
        const paidAmount = `₹${myPaymentAmount?.toLocaleString('en-IN')}`
        const payModeLabel = paymentMode?.replace(/_/g, ' ') || 'UPI'
        const customerName = user?.name || 'Valued Player'
        const customerEmail = user?.email || 'player@sportmatrix.com'
        const currentDate = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' })

        const iframeHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Booking Receipt ${bookingId}</title>
                <style>
                    @page { size: A4 portrait; margin: 8mm; }
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; margin: 0; padding: 15px; background: #fff; }
                    .card { max-width: 650px; margin: 0 auto; border: 2px solid #111827; border-radius: 12px; padding: 24px; }
                    .header { border-bottom: 2px solid #16a34a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
                    .brand { font-size: 22px; font-weight: 900; }
                    .brand span { color: #16a34a; }
                    .badge { background: #ecfdf5; color: #065f46; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 12px; border: 1px solid #a7f3d0; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
                    .box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; font-size: 11px; }
                    .box h4 { margin: 0 0 6px 0; font-size: 10px; text-transform: uppercase; color: #6b7280; }
                    .box p { margin: 2px 0; font-weight: 600; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th { background: #111827; color: #fff; font-size: 10px; padding: 8px 12px; text-align: left; text-transform: uppercase; }
                    td { border-bottom: 1px solid #e5e7eb; padding: 10px 12px; font-size: 12px; font-weight: 500; }
                    .text-right { text-align: right; }
                    .total { background: #111827; color: #fff; padding: 14px 18px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
                    .total-val { font-size: 20px; font-weight: 900; color: #c8ff2e; font-family: monospace; }
                    .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #6b7280; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="header">
                        <div>
                            <div class="brand">SPORTMATRIX<span>.</span></div>
                            <div style="font-size: 11px; color: #4b5563; font-weight: bold; margin-top: 2px;">SportMatrix Slot Reservation Receipt</div>
                        </div>
                        <div style="text-align: right;">
                            <span class="badge">MATCH SLOT LOCKED & CONFIRMED</span>
                            <div style="font-size: 12px; font-weight: 800; margin-top: 4px;">Ref: ${bookingId}</div>
                        </div>
                    </div>

                    <div class="grid">
                        <div class="box">
                            <h4>Player Information</h4>
                            <p style="font-size: 12px; color: #111827; font-weight: 800;">${customerName}</p>
                            <p>${customerEmail}</p>
                            <p>Date Generated: ${currentDate}</p>
                        </div>
                        <div class="box">
                            <h4>Turf Match Details</h4>
                            <p>Venue: <strong>${venueName}</strong></p>
                            <p>Location: <strong>${venueLocation}</strong></p>
                            <p>Slot: <strong>${dateLabel}</strong></p>
                            <p>Mode: <strong>${payModeLabel}</strong></p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Slot Description</th>
                                <th class="text-right">Payment Mode</th>
                                <th class="text-right">Tax (GST)</th>
                                <th class="text-right">Net Paid</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <strong>${venueName} — Match Slot Lock</strong><br>
                                    <span style="font-size: 10px; color: #6b7280;">${dateLabel}</span>
                                </td>
                                <td class="text-right">${payModeLabel}</td>
                                <td class="text-right">₹0.00</td>
                                <td class="text-right" style="font-weight: 800;">${paidAmount}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="total">
                        <div>
                            <div style="font-size: 9px; text-transform: uppercase; color: #9ca3af;">${bookingResult?.paymentStatus === 'PENDING' ? 'Amount Due (Zero GST Tax)' : 'Total Amount Paid (Zero GST Tax)'}</div>
                            <div style="font-size: 11px; color: ${bookingResult?.paymentStatus === 'PENDING' ? '#d97706' : '#10b981'}; font-weight: bold;">${bookingResult?.paymentStatus === 'PENDING' ? 'Pending Venue & Platform Confirmation' : 'Verified Electronic Payment Completed'}</div>
                        </div>
                        <div class="total-val">${paidAmount}</div>
                    </div>

                    <div class="footer">
                        <p style="margin: 0;">Verified Official Receipt · SportMatrix OS Support: support@sportmatrix.com</p>
                    </div>
                </div>
            </body>
            </html>
        `

        let iframe = document.getElementById('fast-booking-receipt-frame')
        if (!iframe) {
            iframe = document.createElement('iframe')
            iframe.id = 'fast-booking-receipt-frame'
            iframe.style.position = 'fixed'
            iframe.style.right = '0'
            iframe.style.bottom = '0'
            iframe.style.width = '0'
            iframe.style.height = '0'
            iframe.style.border = '0'
            iframe.style.visibility = 'hidden'
            document.body.appendChild(iframe)
        }

        const doc = iframe.contentWindow.document
        doc.open()
        doc.write(iframeHTML)
        doc.close()

        setTimeout(() => {
            iframe.contentWindow.focus()
            iframe.contentWindow.print()
        }, 50)
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
                    <span className="font-black text-[#111827]">{bookingResult?.paymentStatus === 'PENDING' ? 'Amount Due:' : 'Amount Paid:'}</span>
                    <span className={`font-black font-mono text-base ${bookingResult?.paymentStatus === 'PENDING' ? 'text-amber-600' : 'text-[#10B981]'}`}>₹{myPaymentAmount.toLocaleString('en-IN')}</span>
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

                <div className="flex items-center gap-2 bg-[#F7F9FC] border border-emerald-200 p-2 rounded-xl">
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

                <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                        type="button"
                        onClick={handleShareWhatsApp}
                        className="py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                        <span>💬 WhatsApp Receipt</span>
                    </button>

                    <button
                        type="button"
                        onClick={triggerFastBookingReceiptPrint}
                        className="py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                        <span>📄 Download PDF / Print</span>
                    </button>
                </div>

                {/* 3-HOUR CANCELLATION POLICY NOTE */}
                {paymentMode === 'DARE_TO_PLAY' && (
                    <div className="bg-amber-50 border border-amber-200/90 p-2.5 rounded-xl text-left text-[10.5px] text-amber-900 font-medium leading-tight">
                        💡 <strong>Dare Match Cancellation Rule:</strong> Opponent nahi milne par aap match time se <strong>3 hours pehle tak cancel</strong> karke 100% deposit refund pa sakte hain. Agar 3 hours pehle tak cancel nahi kiya, to slot aapke naam par confirm rahega aur full bill pay karna hoga.
                    </div>
                )}
            </div>

            {/* GUEST ACCOUNT CREATION OFFER CARD (Visible when guest completes booking) --
                links to real registration; no fabricated session/token is ever created here. */}
            {!user && (
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-5 text-white text-left max-w-lg mx-auto shadow-lg space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🎁</span>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-tight">Create Your Account</h4>
                            <p className="text-[11px] text-emerald-100">Sign up to track this booking, get match updates, and manage future bookings.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="w-full bg-[#C8FF2E] hover:bg-[#b8f51a] text-[#111827] font-black text-xs uppercase px-4 py-2.5 rounded-xl transition-transform hover:scale-[1.01] cursor-pointer shadow-md"
                    >
                        Create Account →
                    </button>
                </div>
            )}

            {/* Owner Payout Destination -- no live payment gateway yet, so the customer
                pays the venue's own UPI/bank/QR account directly; payment stays pending
                until the venue and platform both confirm their settlement legs. */}
            {bookingResult?.paymentStatus === 'PENDING' && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 max-w-lg mx-auto text-left space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">⏳</span>
                        <h4 className="text-xs font-black text-amber-950 uppercase tracking-tight">Payment Pending Confirmation</h4>
                    </div>
                    {bookingResult.payoutDestination?.configured ? (
                        <div className="bg-white rounded-xl border border-amber-200 p-3 text-xs space-y-1.5">
                            <p className="text-slate-600 font-semibold">Pay ₹{myPaymentAmount?.toLocaleString('en-IN')} directly to the venue:</p>
                            {bookingResult.payoutDestination.accountType === 'UPI' && (
                                <p className="font-black text-slate-900 font-mono text-sm">{bookingResult.payoutDestination.upiId}</p>
                            )}
                            {bookingResult.payoutDestination.accountType === 'BANK_ACCOUNT' && (
                                <div className="font-bold text-slate-800">
                                    <p>{bookingResult.payoutDestination.bankAccountHolder}</p>
                                    <p className="font-mono">{bookingResult.payoutDestination.bankAccountNumber} · {bookingResult.payoutDestination.bankIfsc}</p>
                                </div>
                            )}
                            {bookingResult.payoutDestination.accountType === 'QR_CODE' && bookingResult.payoutDestination.qrCodeImageUrl && (
                                <img src={bookingResult.payoutDestination.qrCodeImageUrl} alt="Venue payment QR code" className="w-32 h-32 object-contain border border-slate-200 rounded-lg" />
                            )}
                        </div>
                    ) : (
                        <p className="text-[11px] text-amber-900 font-medium">{bookingResult.payoutDestination?.message || 'This venue has not added a payout account yet. Confirm payment details with the venue directly.'}</p>
                    )}
                    <p className="text-[10px] text-amber-800 font-medium">Your booking will show as fully confirmed once the venue and platform confirm this payment.</p>
                </div>
            )}

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
