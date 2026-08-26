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
    durationHours = 1,
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
        if (user?.role === 'SUPER_ADMIN') {
            navigate('/super-admin/crm')
        } else if (user?.role === 'OWNER' || user?.role === 'ADMIN' || user?.role === 'TURF_ADMIN') {
            navigate('/admin/bookings')
        } else if (user?.role === 'CUSTOMER' || user?.role === 'PLAYER') {
            navigate('/customer/bookings')
        } else {
            // Guest user — copy booking ref to clipboard and show instructions
            const bookingId = bookingResult?.bookingId || ''
            if (bookingId) {
                navigator.clipboard?.writeText(bookingId).catch(() => {})
            }
            alert(`Your Booking Reference:\n\n${bookingId}\n\nSave this ID! Use the "🔍 FIND BOOKING" option in the top navigation bar to look up your booking anytime using your phone number or this reference ID.`)
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
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 text-center animate-in zoom-in-95 duration-200 max-w-2xl mx-auto">
            {/* Success Hero Header */}
            <div className="relative">
                <div className="w-20 h-20 bg-[#C8FF2E] border-4 border-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-950 text-3xl font-black shadow-lg animate-bounce">
                    ✓
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                    <span>⚡ MATCH SLOT LOCKED & CONFIRMED</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Booking Successful!</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                    Booking Reference: <strong className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{bookingResult?.bookingId || 'SM-BK-9831'}</strong>
                </p>
            </div>

            {/* Receipt Breakdown Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 text-left space-y-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8FF2E]/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">VENUE ARENA</span>
                        <h3 className="text-lg font-black text-white">{selectedVenue?.name || 'SportZone Arena'}</h3>
                        <p className="text-xs text-slate-400 font-medium">{selectedVenue?.location || 'Indore'}, {selectedVenue?.city || 'M.P.'}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">SLOT TIME</span>
                        <p className="text-xs font-bold text-[#C8FF2E]">{selectedDateObj?.formattedLabel || 'Today'}</p>
                        <p className="text-xs font-mono text-slate-300">{slotTimeLabel} ({durationHours || 1} Hr)</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                    <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Payment Mode</span>
                        <span className="font-black text-white">{paymentMode?.replace(/_/g, ' ') || 'FULL PAY'}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Transaction Status</span>
                        <span className="font-black text-emerald-400">VERIFIED ELECTRONIC</span>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">TOTAL AMOUNT PAID</span>
                        <span className="text-xs text-emerald-400 font-semibold">Taxes Included (GST Invoice)</span>
                    </div>
                    <span className="text-3xl font-black text-[#C8FF2E] font-mono">₹{myPaymentAmount?.toLocaleString('en-IN')}</span>
                </div>
            </div>

            {/* Actions & WhatsApp Sharing */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
                    <span className="text-xs font-mono text-slate-600 truncate flex-1 text-left px-2 font-bold">
                        {window.location.origin}/booking/{selectedVenue?.id || 'branch-1'}?mode={paymentMode?.toLowerCase()}&pay=opponent
                    </span>
                    <button
                        type="button"
                        onClick={handleCopyShareLink}
                        className="bg-slate-900 hover:bg-slate-800 text-[#C8FF2E] font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0"
                    >
                        Copy Link
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                        type="button"
                        onClick={handleShareWhatsApp}
                        className="py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                        <span>💬 Share WhatsApp Receipt</span>
                    </button>

                    <button
                        type="button"
                        onClick={triggerFastBookingReceiptPrint}
                        className="py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                        <span>📄 Download PDF Receipt</span>
                    </button>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100">
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-6 py-3 rounded-2xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                    🏠 Back to Home
                </button>
                <button
                    type="button"
                    onClick={handleViewAction}
                    className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-[#C8FF2E] font-black text-xs cursor-pointer shadow-md"
                >
                    {user ? '🎟️ View My Bookings →' : '📋 Save Booking Ref →'}
                </button>
            </div>
        </div>
    )
}
