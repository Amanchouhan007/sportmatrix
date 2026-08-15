import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  HiShieldCheck, 
  HiCreditCard, 
  HiQrCode, 
  HiBuildingLibrary, 
  HiWallet, 
  HiClock, 
  HiBanknotes, 
  HiXMark, 
  HiCheckCircle, 
  HiChevronRight,
  HiChevronLeft,
  HiLockClosed,
  HiArrowPath,
  HiCheck,
  HiExclamationTriangle,
  HiDevicePhoneMobile,
  HiSparkles
} from 'react-icons/hi2';

/**
 * Production-Grade 4-Step Payment Modal Component
 * Flow: Step 1 (Select Method) -> Step 2 (Details Form) -> Step 3 (Processing / OTP) -> Step 4 (Success / Confirmation)
 */
export default function PaymentModal({
  isOpen,
  onClose,
  paymentMode = 'FULL_PAY',
  totalRent = 0,
  myPaymentAmount = 0,
  opponentShareAmount = 0,
  handleConfirmBooking,
}) {
  if (!isOpen) return null;

  // Step state: 1 = Select Method, 2 = Payment Form, 3 = Processing/OTP, 4 = Success Result
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState('upi');

  // Step 2 Form States
  // Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  // UPI
  const [upiId, setUpiId] = useState('');
  const [upiTab, setUpiTab] = useState('id'); // 'id' | 'qr'
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');

  // Net Banking
  const [selectedBank, setSelectedBank] = useState('sbi');

  // Wallet
  const [selectedWallet, setSelectedWallet] = useState('paytm');

  // EMI
  const [emiTenure, setEmiTenure] = useState(6);

  // Step 3 Processing & OTP State
  const [processingStatus, setProcessingStatus] = useState('Connecting to Payment Gateway...');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(120); // 2 min countdown
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Error & Validation state
  const [formErrors, setFormErrors] = useState({});

  // Generated Transaction Info
  const [txnDetails, setTxnDetails] = useState(null);

  // OTP Countdown timer
  useEffect(() => {
    let interval = null;
    if (showOtpScreen && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpScreen, otpTimer]);

  // Saved Payment Methods
  const savedMethods = [
    {
      id: 'saved_card_1',
      type: 'card',
      title: 'HDFC Bank Credit Card',
      subtitle: '•••• •••• •••• 4242 | Exp 08/28',
      badge: 'DEFAULT',
      icon: HiCreditCard,
      disabled: false,
    },
  ];

  // Standard Payment Options Grid
  const paymentOptions = [
    {
      id: 'upi',
      name: 'UPI / QR Code',
      helper: 'Google Pay, PhonePe, Paytm & QR',
      badge: 'FASTEST & POPULAR',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: HiQrCode,
      disabled: false,
    },
    {
      id: 'card',
      name: 'Credit / Debit Card',
      helper: 'Visa, Mastercard, RuPay & Diners',
      badge: null,
      icon: HiCreditCard,
      disabled: false,
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      helper: 'All Indian Banks (SBI, HDFC, ICICI)',
      badge: null,
      icon: HiBuildingLibrary,
      disabled: false,
    },
    {
      id: 'wallet',
      name: 'Mobile Wallets',
      helper: 'Paytm Wallet, Mobikwik, Amazon Pay',
      badge: null,
      icon: HiWallet,
      disabled: false,
    },
    {
      id: 'emi',
      name: 'EMI / Pay Later',
      helper: '3 to 12 Month No-Cost EMI Options',
      badge: '0% INTEREST',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: HiClock,
      disabled: false,
    },
    {
      id: 'cash',
      name: 'Pay at Venue',
      helper: 'Pay cash or UPI directly at the turf',
      badge: null,
      icon: HiBanknotes,
      disabled: true,
      disabledReason: 'Not available for peak slots',
    },
  ];

  const popularBanks = [
    { id: 'sbi', name: 'State Bank of India', code: 'SBI' },
    { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
    { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
    { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
    { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KOTAK' },
    { id: 'pnb', name: 'Punjab National Bank', code: 'PNB' },
  ];

  const walletProviders = [
    { id: 'paytm', name: 'Paytm Wallet', balance: '₹4,500 Available' },
    { id: 'phonepe', name: 'PhonePe Wallet', balance: '₹1,200 Available' },
    { id: 'amazon', name: 'Amazon Pay Balance', balance: '₹850 Available' },
    { id: 'mobikwik', name: 'MobiKwik Zip', balance: 'Credit Limit ₹10,000' },
  ];

  const getMethodName = (id) => {
    if (id === 'saved_card_1') return 'HDFC Card (•••• 4242)';
    const found = paymentOptions.find((o) => o.id === id);
    return found ? found.name : 'Payment Method';
  };

  // Card formatting
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Step 2 Form Validation
  const validateStep2Form = () => {
    const errors = {};
    if (selectedMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (!cleanCard || cleanCard.length < 16) errors.cardNumber = 'Enter valid 16-digit card number';
      if (!cardName.trim()) errors.cardName = 'Cardholder name is required';
      if (!cardExpiry || cardExpiry.length < 5) errors.cardExpiry = 'Enter valid MM/YY';
      if (!cardCvv || cardCvv.length < 3) errors.cardCvv = 'Enter 3-digit CVV';
    } else if (selectedMethod === 'upi' && upiTab === 'id') {
      if (!upiId || !upiId.includes('@')) errors.upiId = 'Enter a valid UPI ID (e.g. name@upi)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Proceed to Step 3 (Processing)
  const handleStartPaymentProcessing = () => {
    if (!validateStep2Form()) return;

    setStep(3);
    setIsProcessing(true);
    setProcessingStatus('Initiating secure transaction with bank server...');

    setTimeout(() => {
      if (selectedMethod === 'card' || selectedMethod === 'saved_card_1') {
        setProcessingStatus('Redirecting to 3D Secure OTP verification...');
        setShowOtpScreen(true);
        setIsProcessing(false);
      } else if (selectedMethod === 'upi') {
        setProcessingStatus('Pushing payment request to your UPI App...');
        setTimeout(() => {
          completeSuccessfulPayment();
        }, 2200);
      } else {
        setProcessingStatus('Authorizing payment with provider...');
        setTimeout(() => {
          completeSuccessfulPayment();
        }, 2000);
      }
    }, 1500);
  };

  // OTP Verification
  const handleVerifyOtp = () => {
    const code = otpValue.join('');
    if (code.length < 6) {
      setFormErrors({ otp: 'Please enter full 6-digit OTP' });
      return;
    }
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      completeSuccessfulPayment();
    }, 1800);
  };

  // Final Payment Complete -> Move to Step 4
  const completeSuccessfulPayment = () => {
    const txnId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setTxnDetails({
      txnId,
      amount: myPaymentAmount,
      method: getMethodName(selectedMethod),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setStep(4);
    setIsProcessing(false);
    setShowOtpScreen(false);
  };

  // Reset state on modal close
  const handleCloseModal = () => {
    if (step === 3 && isProcessing) return;
    setStep(1);
    setShowOtpScreen(false);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
      style={{ zIndex: 999999 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[88vh] animate-in slide-in-from-bottom-6 duration-200">
        
        {/* HEADER SECTION WITH STEP INDICATOR */}
        <div className="px-6 py-4 bg-slate-900 text-white shrink-0 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 1 && step < 4 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  disabled={isProcessing}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  aria-label="Back to previous step"
                >
                  <HiChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <HiShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 id="payment-modal-title" className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>
                    {step === 1 && '1. Choose Payment Method'}
                    {step === 2 && `2. Enter ${getMethodName(selectedMethod)} Details`}
                    {step === 3 && '3. Authorizing Payment'}
                    {step === 4 && '4. Payment Verified'}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <HiLockClosed className="w-3 h-3 text-emerald-400" />
                  <span>256-Bit SSL Encrypted &amp; Bank-Grade Gateway</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={step === 3 && isProcessing}
              aria-label="Close payment modal"
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>

          {/* STEP PROGRESS BAR */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[
              { num: 1, label: 'Method' },
              { num: 2, label: 'Details' },
              { num: 3, label: 'Authorize' },
              { num: 4, label: 'Success' },
            ].map((s) => (
              <div key={s.num} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step >= s.num ? 'bg-[#10B981]' : 'bg-slate-800'
                  }`}
                />
                <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-wider">
                  <span className={step >= s.num ? 'text-emerald-400' : 'text-slate-500'}>
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ORDER SUMMARY BANNER (Steps 1, 2 & 3) */}
        {step < 4 && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PAYABLE NOW</span>
              <div className="text-xl font-black text-slate-900 font-mono tracking-tight">
                ₹{myPaymentAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-600">
                Mode: <span className="text-emerald-700 font-bold">{paymentMode.replace(/_/g, ' ')}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Total Match Fee: ₹{totalRent.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">

          {/* STEP 1: PAYMENT METHOD SELECTION */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {savedMethods.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>SAVED PAYMENT METHODS</span>
                    <span className="text-[10px] text-emerald-600 font-extrabold">1-TAP EXPRESS</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {savedMethods.map((saved) => {
                      const isSelected = selectedMethod === saved.id;
                      const IconComponent = saved.icon;
                      return (
                        <button
                          key={saved.id}
                          type="button"
                          onClick={() => setSelectedMethod(saved.id)}
                          aria-label={`Pay with saved ${saved.title}`}
                          className={`relative w-full p-4 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between gap-4 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50/70 border-2 border-[#10B981] shadow-md'
                              : 'bg-white border-slate-200 hover:border-slate-400 hover:-translate-y-0.5 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#10B981] text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">{saved.title}</span>
                                <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider">
                                  {saved.badge}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">{saved.subtitle}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0">
                              <HiCheckCircle className="w-5 h-5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest absolute">
                  ALL PAYMENT OPTIONS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentOptions.map((option) => {
                  const isSelected = selectedMethod === option.id;
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => !option.disabled && setSelectedMethod(option.id)}
                      aria-label={`Pay with ${option.name}`}
                      className={`relative w-full p-4 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between gap-3 ${
                        option.disabled
                          ? 'bg-slate-50 border-slate-200 opacity-50 grayscale cursor-not-allowed'
                          : isSelected
                          ? 'bg-emerald-50/70 border-2 border-[#10B981] shadow-md -translate-y-0.5'
                          : 'bg-white border-slate-200 hover:border-slate-400 hover:-translate-y-0.5 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-[#10B981] text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0">
                            <HiCheckCircle className="w-5 h-5" />
                          </div>
                        ) : option.badge ? (
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${option.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {option.badge}
                          </span>
                        ) : option.disabled ? (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 uppercase tracking-wider">
                            UNAVAILABLE
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                          {option.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
                          {option.disabled && option.disabledReason ? option.disabledReason : option.helper}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DYNAMIC PAYMENT DETAILS FORM */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* CARD FORM */}
              {(selectedMethod === 'card' || selectedMethod === 'saved_card_1') && (
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 text-white shadow-xl space-y-4 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold tracking-widest text-emerald-400">SECURE CARD</span>
                      <HiCreditCard className="w-7 h-7 text-slate-400" />
                    </div>
                    <div className="text-lg sm:text-xl font-mono font-bold tracking-widest text-slate-200">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase">Card Holder</div>
                        <div className="font-bold uppercase tracking-wider">{cardName || 'YOUR NAME'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase">Expires</div>
                        <div className="font-bold">{cardExpiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="4532 0154 9821 4242"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          formErrors.cardNumber ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
                        }`}
                      />
                      {formErrors.cardNumber && <p className="text-xs text-red-600 font-medium mt-1">{formErrors.cardNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          formErrors.cardName ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
                        }`}
                      />
                      {formErrors.cardName && <p className="text-xs text-red-600 font-medium mt-1">{formErrors.cardName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="08/28"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            formErrors.cardExpiry ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
                          }`}
                        />
                        {formErrors.cardExpiry && <p className="text-xs text-red-600 font-medium mt-1">{formErrors.cardExpiry}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            formErrors.cardCvv ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
                          }`}
                        />
                        {formErrors.cardCvv && <p className="text-xs text-red-600 font-medium mt-1">{formErrors.cardCvv}</p>}
                      </div>
                    </div>

                    <label className="flex items-center gap-2 pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="text-xs text-slate-600 font-semibold">Save this card securely for future 1-tap bookings</span>
                    </label>
                  </div>
                </div>
              )}

              {/* UPI FORM */}
              {selectedMethod === 'upi' && (
                <div className="space-y-4">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setUpiTab('id')}
                      className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        upiTab === 'id' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Enter VPA / UPI ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiTab('qr')}
                      className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        upiTab === 'qr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Scan QR Code
                    </button>
                  </div>

                  {upiTab === 'id' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">UPI ID / Virtual Address</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="username@okaxis"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                              formErrors.upiId ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setUpiId('customer@upi')}
                            className="absolute right-2 top-2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-700 uppercase cursor-pointer"
                          >
                            Auto-fill Demo
                          </button>
                        </div>
                        {formErrors.upiId && <p className="text-xs text-red-600 font-medium mt-1">{formErrors.upiId}</p>}
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">OR PAY USING UPI APP</span>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {[
                            { id: 'gpay', name: 'Google Pay' },
                            { id: 'phonepe', name: 'PhonePe' },
                            { id: 'paytm', name: 'Paytm UPI' },
                          ].map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => {
                                setSelectedUpiApp(app.id);
                                setUpiId(`demo.${app.id}@upi`);
                              }}
                              className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                                selectedUpiApp === app.id ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {app.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50/40 border border-emerald-200/80 text-center space-y-3.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-2">
                        <span className="flex items-center gap-1.5 text-emerald-700 font-extrabold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          LIVE UPI QR
                        </span>
                        <span className="font-mono text-slate-500">₹{myPaymentAmount.toLocaleString('en-IN')}</span>
                      </div>

                      {/* REAL SCANNABLE DYNAMIC UPI QR CODE IMAGE */}
                      <div className="relative w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-emerald-500/30 shadow-lg flex flex-col items-center justify-center group hover:scale-[1.02] transition-transform">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                            `upi://pay?pa=sportmatrix@upi&pn=SportMatrix%20Turf%20Booking&am=${myPaymentAmount}&cu=INR&tn=Slot%20Booking`
                          )}`}
                          alt="Real UPI Payment QR Code"
                          className="w-full h-full object-contain rounded-lg"
                        />
                        {/* Center UPI logo overlay */}
                        <div className="absolute inset-0 m-auto w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center p-1">
                          <span className="text-[10px] font-black text-slate-900 font-mono tracking-tighter">BHIM</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-extrabold text-slate-800 flex items-center justify-center gap-1.5">
                          <span>Scan with Google Pay, PhonePe, Paytm or BHIM</span>
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          UPI VPA: <span className="font-mono font-bold text-slate-800">sportmatrix@upi</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Status: <span className="text-emerald-600 font-bold">Waiting for Scan...</span></span>
                        <span>Expires in <span className="font-mono font-bold text-emerald-700">04:59</span></span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* NET BANKING FORM */}
              {selectedMethod === 'netbanking' && (
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase text-slate-600">Select Popular Indian Bank</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {popularBanks.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          selectedBank === bank.id ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-extrabold' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <HiBuildingLibrary className="w-4 h-4 shrink-0 text-slate-500" />
                        <span className="text-xs truncate">{bank.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* WALLETS FORM */}
              {selectedMethod === 'wallet' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase text-slate-600">Choose Wallet Provider</span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {walletProviders.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSelectedWallet(w.id)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          selectedWallet === w.id ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <HiWallet className="w-5 h-5 text-slate-600" />
                          <span className="text-sm font-extrabold">{w.name}</span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-emerald-700">{w.balance}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* EMI FORM */}
              {selectedMethod === 'emi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Select EMI Tenure</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[3, 6, 9, 12].map((m) => {
                        const monthlyEMI = Math.round(myPaymentAmount / m);
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setEmiTenure(m)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              emiTenure === m ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            <div className="text-sm font-extrabold">{m} Months</div>
                            <div className="text-[10px] font-mono text-emerald-700">₹{monthlyEMI}/mo</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 3: PROCESSING & 3D SECURE OTP */}
          {step === 3 && (
            <div className="py-6 space-y-6 text-center animate-in fade-in duration-150">
              {showOtpScreen ? (
                <div className="space-y-5 max-w-md mx-auto text-left bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                      <HiShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>3D Secure OTP Verification</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">HDFC Bank</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter the 6-digit verification code sent to your registered mobile number <span className="font-bold text-slate-900">+91 ••••• ••492</span>
                  </p>

                  <div className="flex items-center justify-center gap-2 py-2">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <input
                        key={idx}
                        id={`otp-box-${idx}`}
                        type="text"
                        maxLength={1}
                        value={otpValue[idx] || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const newOtp = [...otpValue];
                          newOtp[idx] = val;
                          setOtpValue(newOtp);
                          if (val && idx < 5) {
                            const nextBox = document.getElementById(`otp-box-${idx + 1}`);
                            if (nextBox) nextBox.focus();
                          }
                        }}
                        className="w-10 h-12 text-center text-lg font-mono font-bold bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    ))}
                  </div>

                  {formErrors.otp && (
                    <p className="text-xs text-red-600 font-bold text-center">{formErrors.otp}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                    <span>Resend OTP in: <span className="font-mono font-bold text-slate-800">{Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}</span></span>
                    <button
                      type="button"
                      onClick={() => setOtpTimer(120)}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isVerifyingOtp}
                    onClick={handleVerifyOtp}
                    className="w-full py-3.5 bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <HiArrowPath className="w-4 h-4 animate-spin" />
                        <span>Verifying OTP Code...</span>
                      </>
                    ) : (
                      <span>Submit OTP &amp; Authorize Payment ₹{myPaymentAmount.toLocaleString('en-IN')}</span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin flex items-center justify-center">
                    <HiShieldCheck className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Processing Payment...</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">{processingStatus}</p>
                  <p className="text-[11px] text-amber-700 font-medium bg-amber-50 py-1.5 px-3 rounded-full inline-block border border-amber-200">
                    ⚠️ Please do not close or refresh this browser window
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: PAYMENT SUCCESS RESULT SCREEN */}
          {step === 4 && txnDetails && (
            <div className="py-4 space-y-5 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <HiCheckCircle className="w-12 h-12" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Payment Successful!</h3>
                <p className="text-xs text-slate-500 mt-1">Transaction verified by bank gateway</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-800">{txnDetails.txnId}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Amount Paid:</span>
                  <span className="font-mono font-black text-emerald-600">₹{txnDetails.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Method Used:</span>
                  <span className="font-bold text-slate-800">{txnDetails.method}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Time:</span>
                  <span className="font-mono text-slate-600">{txnDetails.timestamp}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-semibold">
                🎉 Match slot is ready to be locked and confirmed!
              </div>
            </div>
          )}

        </div>

        {/* FOOTER ACTION BUTTONS */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3 shrink-0">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-300 text-slate-700 font-black text-xs uppercase tracking-wider hover:bg-slate-100 transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-black text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>CONTINUE TO PAYMENT DETAILS</span>
                <HiChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-300 text-slate-700 font-black text-xs uppercase tracking-wider hover:bg-slate-100 transition-all cursor-pointer text-center"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleStartPaymentProcessing}
                className="w-full flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-black text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>PROCEED &amp; PAY ₹{myPaymentAmount.toLocaleString('en-IN')}</span>
                <HiChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={() => {
                onClose();
                handleConfirmBooking();
              }}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black text-sm uppercase tracking-wider px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>CONFIRM BOOKING &amp; GENERATE RECEIPT →</span>
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}

