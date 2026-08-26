import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../ui/Toast.jsx';
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
  const { user } = useAuth();
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Pre-load Razorpay checkout script on mount
  useEffect(() => {
    if (!window.Razorpay && !document.querySelector('script[src*="checkout.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);



  const toastContext = useToast();
  const addToast = toastContext?.addToast;

  const slotTimeLabel = allTimeSlots.find((s) => s.id === selectedSlotTime)?.time || selectedSlotTime;

  const handleRazorpayCheckout = () => {
    const finalName = guestName.trim();
    const finalPhone = guestPhone.trim();
    const finalEmail = guestEmail.trim();

    if (!finalName) {
      if (addToast) addToast('⚠️ Please enter your Full Name before proceeding to payment.', 'error');
      else alert('⚠️ Please enter your Full Name before proceeding to payment.');
      return;
    }

    if (!finalPhone || finalPhone.length < 10) {
      if (addToast) addToast('⚠️ Please enter a valid 10-digit Mobile Number before proceeding.', 'error');
      else alert('⚠️ Please enter a valid 10-digit Mobile Number before proceeding.');
      return;
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T1r8sgDPyFz1bB';
    const guestData = { guestName: finalName, guestPhone: finalPhone, guestEmail: finalEmail || 'player@sportmatrix.com' };

    const launchPopup = () => {
      if (window.Razorpay) {
        const options = {
          key: razorpayKey,
          amount: Math.round(myPaymentAmount * 100),
          currency: 'INR',
          name: 'SportMatrix Turf Arena',
          description: `Booking - ${selectedVenue?.name || 'Turf Arena'} (₹${myPaymentAmount})`,
          handler: function (response) {
            console.log('Razorpay Payment Success:', response);
            handleConfirmBooking(response.razorpay_payment_id, guestData);
          },
          prefill: {
            name: finalName,
            email: finalEmail || 'player@sportmatrix.com',
            contact: finalPhone
          },
          theme: {
            color: '#10B981'
          }
        };
        try {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (err) {
          console.error('Razorpay popup open error:', err);
          handleConfirmBooking(null, guestData);
        }
      } else {
        handleConfirmBooking(null, guestData);
      }
    };

    if (window.Razorpay) {
      launchPopup();
    } else {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => launchPopup();
      script.onerror = () => handleConfirmBooking(null, guestData);
      document.body.appendChild(script);
    }
  };

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

      {/* Guest / Player Contact Information Card */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">👤 Player & Contact Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Your Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#10B981]"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Mobile Number *</label>
            <input
              type="text"
              placeholder="e.g. 9876543210"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#10B981]"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Email ID (For Receipt)</label>
            <input
              type="email"
              placeholder="e.g. rahul@gmail.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#10B981]"
            />
          </div>
        </div>
      </div>

      {/* Match Summary Breakdown */}

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
          onClick={handleRazorpayCheckout}
          disabled={isSubmitting}
          className="bg-[#10B981] hover:bg-[#059669] text-white font-black text-sm uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span>{isSubmitting ? 'Processing Payment...' : `⚡ LOCK MATCH & PAY ₹${myPaymentAmount.toLocaleString('en-IN')} →`}</span>
        </button>
      </div>
    </div>
  );
}
