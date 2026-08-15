import React, { useState, useEffect } from 'react';
import PaymentModal from './PaymentModal.jsx';

/**
 * BookingStep3Lock — Step 3 Review & Payment Lock Component
 */
export default function BookingStep3Lock({
  autoOpenModal,
  selectedVenue,
  selectedDateObj,
  selectedSlotTime,
  allTimeSlots,
  durationHours,
  paymentMode,
  totalRent,
  myPaymentAmount,
  opponentShareAmount,
  perPlayerCount,
  perPlayerShareAmount,
  hasVerifiedUmpire,
  handleConfirmBooking,
  isSubmitting,
  setActiveStep,
}) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Auto-open payment modal if requested
  useEffect(() => {
    if (autoOpenModal) {
      setShowPaymentModal(true);
    }
  }, [autoOpenModal]);

  const slotTimeLabel = allTimeSlots.find((s) => s.id === selectedSlotTime)?.time || selectedSlotTime;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-sm space-y-7 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">
          Review match details &amp; lock slot
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Double check your match timing and complete instant payment to hold slot
        </p>
      </div>

      {/* DARE MATCH HIGHLIGHT BANNER */}
      {paymentMode === 'DARE_TO_PLAY' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-red-500/10 border-2 border-orange-300 space-y-2">
          <div className="flex items-center gap-2 text-orange-950 font-black text-sm">
            <span>🔥 DARE MATCH RULES ACCEPTED</span>
            <span className="bg-orange-500 text-white text-[9px] px-2 py-0.5 rounded-full font-mono uppercase">₹100 DEPOSIT</span>
          </div>
          <p className="text-xs text-orange-900 font-medium leading-relaxed">
            Winner gets 100% deposit refund! Loser team pays remaining match fee ₹{totalRent.toLocaleString('en-IN')}. Accept challenge link will be generated after booking.
          </p>
        </div>
      )}

      {/* Match Summary Breakdown */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-200">
          <span>BOOKING SUMMARY</span>
          <span>TURF DETAILS</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-semibold">Turf Venue:</span>
          <span className="font-black text-[#111827]">{selectedVenue.name} ({selectedVenue.location})</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-semibold">Date &amp; Time:</span>
          <span className="font-black text-[#111827]">
            {selectedDateObj.formattedLabel} · {slotTimeLabel} ({durationHours} Hr)
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-semibold">Selected Mode:</span>
          <span className="font-black text-[#10B981] font-mono">{paymentMode.replace(/_/g, ' ')}</span>
        </div>
        {hasVerifiedUmpire && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-semibold">Match Add-on:</span>
            <span className="font-bold text-emerald-700">⚖️ Verified Umpire (+₹300)</span>
          </div>
        )}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base">
          <span className="font-black text-[#111827]">Amount Payable Now:</span>
          <span className="text-2xl font-black text-[#10B981] font-mono">₹{myPaymentAmount.toLocaleString('en-IN')}</span>
        </div>
        {opponentShareAmount > 0 && (
          <div className="text-xs text-slate-500 font-medium text-right">
            Opponent Team Share: <span className="font-bold text-slate-700">₹{opponentShareAmount.toLocaleString('en-IN')}</span> (Generated Link)
          </div>
        )}
      </div>

      {/* Action CTA Buttons */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
        >
          ← Change Payment Mode
        </button>
        <button
          type="button"
          onClick={() => setShowPaymentModal(true)}
          disabled={isSubmitting}
          className="bg-[#10B981] hover:bg-[#059669] text-white font-black text-sm uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span>{isSubmitting ? 'Processing Payment...' : `⚡ LOCK MATCH & PAY ₹${myPaymentAmount.toLocaleString('en-IN')} →`}</span>
        </button>
        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          paymentMode={paymentMode}
          totalRent={totalRent}
          myPaymentAmount={myPaymentAmount}
          opponentShareAmount={opponentShareAmount}
          handleConfirmBooking={() => { setShowPaymentModal(false); handleConfirmBooking(); }}
        />
      </div>
    </div>
  );
}
