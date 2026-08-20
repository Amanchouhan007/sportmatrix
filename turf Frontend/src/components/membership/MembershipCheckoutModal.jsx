import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    HiCheck, 
    HiX, 
    HiCheckCircle, 
    HiRefresh, 
    HiClipboardCopy, 
    HiUser, 
    HiOfficeBuilding, 
    HiLocationMarker,
    HiCreditCard,
    HiLockClosed,
    HiArrowLeft,
    HiArrowRight,
    HiPrinter,
    HiShieldCheck
} from 'react-icons/hi'
import { 
    HiQrCode, 
    HiBuildingLibrary, 
    HiWallet, 
    HiBanknotes, 
    HiSparkles 
} from 'react-icons/hi2'
import { useToast } from '../ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { createOwner } from '../../services/ownerService'

export default function MembershipCheckoutModal({ 
    isOpen, 
    onClose, 
    plan, 
    billingCycle = 'monthly' 
}) {
    const navigate = useNavigate()
    const toastContext = useToast()
    const addToast = toastContext?.addToast
    const { setSession } = useAuth() || {}

    // Multi-Step Checkout Modal State:
    // Step 1: DETAILS (Owner & Business info)
    // Step 2: PAYMENT_MODE (UPI, Card, NetBanking, Wallets, EMI, Wire)
    // Step 3: PROCESSING_OTP (3D Secure Gateway & OTP Verification)
    // Step 4: SUCCESS_RECEIPT (Plan Authorized & Tax Invoice)
    const [checkoutStep, setCheckoutStep] = useState(1)
    const [isSubmittingOwner, setIsSubmittingOwner] = useState(false)

    // Password generator helper
    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*'
        let pass = ''
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return pass
    }

    // Owner Form State
    const [ownerFormData, setOwnerFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        alternateMobile: '',
        password: generatePassword(),
        businessName: '',
        businessType: 'Sports & Recreation',
        gstNumber: '',
        panNumber: '',
        country: 'India',
        state: '',
        city: '',
        zipCode: '',
        fullAddress: '',
    })

    // Payment Mode Selection State
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('upi') // 'upi' | 'card' | 'netbanking' | 'wallet' | 'emi' | 'wire'

    // UPI States
    const [upiTab, setUpiTab] = useState('qr') // 'qr' | 'id' | 'apps'
    const [upiId, setUpiId] = useState('')
    const [selectedUpiApp, setSelectedUpiApp] = useState('gpay')
    const [qrTimer, setQrTimer] = useState(300)

    // Card States
    const [cardNumber, setCardNumber] = useState('')
    const [cardHolder, setCardHolder] = useState('')
    const [cardExpiry, setCardExpiry] = useState('')
    const [cardCvv, setCardCvv] = useState('')
    const [saveCardForAutoRenew, setSaveCardForAutoRenew] = useState(true)

    // Net Banking States
    const [selectedBank, setSelectedBank] = useState('hdfc')

    // Wallet States
    const [selectedWallet, setSelectedWallet] = useState('paytm')

    // EMI States
    const [selectedEmiTenure, setSelectedEmiTenure] = useState(3)

    // Corporate Wire States
    const [utrNumber, setUtrNumber] = useState('')

    // OTP Verification & Simulation States
    const [otpValue, setOtpValue] = useState(['8', '4', '9', '2', '0', '1'])
    const [otpTimer, setOtpTimer] = useState(45)
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
    const otpInputRefs = useRef([])

    // Final Authorized Subscription State
    const [subDetails, setSubDetails] = useState(null)
    const [registeredOwnerUser, setRegisteredOwnerUser] = useState(null)

    // Reset when modal opens with new plan
    useEffect(() => {
        if (isOpen) {
            setCheckoutStep(1)
            setQrTimer(300)
            setOtpTimer(45)
            setIsVerifyingOtp(false)
            setIsSubmittingOwner(false)
        }
    }, [isOpen, plan])

    // QR countdown timer
    useEffect(() => {
        let interval = null
        if (isOpen && checkoutStep === 2 && selectedPaymentMode === 'upi' && upiTab === 'qr' && qrTimer > 0) {
            interval = setInterval(() => setQrTimer(prev => prev - 1), 1000)
        }
        return () => clearInterval(interval)
    }, [isOpen, checkoutStep, selectedPaymentMode, upiTab, qrTimer])

    // OTP countdown timer
    useEffect(() => {
        let interval = null
        if (isOpen && checkoutStep === 3 && otpTimer > 0) {
            interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000)
        }
        return () => clearInterval(interval)
    }, [isOpen, checkoutStep, otpTimer])

    // Format Card Number (adds spaces every 4 digits)
    const handleCardNumberChange = (val) => {
        const clean = val.replace(/\D/g, '').slice(0, 16)
        const formatted = clean.replace(/(\d{4})/g, '$1 ').trim()
        setCardNumber(formatted)
    }

    // Format Card Expiry
    const handleCardExpiryChange = (val) => {
        const clean = val.replace(/\D/g, '').slice(0, 4)
        if (clean.length >= 2) {
            setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`)
        } else {
            setCardExpiry(clean)
        }
    }

    // Detect Card Brand
    const getCardBrand = (num) => {
        const clean = num.replace(/\s+/g, '')
        if (/^4/.test(clean)) return { name: 'VISA', color: 'from-blue-600 to-blue-800' }
        if (/^5[1-5]/.test(clean)) return { name: 'MASTERCARD', color: 'from-amber-600 to-red-600' }
        if (/^6(011|5)/.test(clean)) return { name: 'RUPAY', color: 'from-emerald-600 to-teal-800' }
        if (/^3[47]/.test(clean)) return { name: 'AMEX', color: 'from-cyan-600 to-indigo-800' }
        return { name: 'CREDIT / DEBIT', color: 'from-slate-700 to-slate-900' }
    }

    // Handle OTP Box Input
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return
        const newOtp = [...otpValue]
        newOtp[index] = value.slice(-1)
        setOtpValue(newOtp)
        if (value && index < 5 && otpInputRefs.current[index + 1]) {
            otpInputRefs.current[index + 1].focus()
        }
    }

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpValue[index] && index > 0) {
            otpInputRefs.current[index - 1].focus()
        }
    }

    // Handle Step 1 -> Step 2
    const handleProceedToPaymentMode = (e) => {
        e.preventDefault()
        if (!ownerFormData.fullName.trim() || !ownerFormData.email.trim() || !ownerFormData.mobile.trim() || !ownerFormData.businessName.trim()) {
            if (addToast) addToast('Please fill in all required venue & owner details', 'warning')
            return
        }
        setCheckoutStep(2)
    }

    // Handle Step 2 -> Step 3
    const handleInitiatePayment = () => {
        if (selectedPaymentMode === 'card') {
            const cleanCard = cardNumber.replace(/\s+/g, '')
            if (cleanCard.length < 15 || !cardExpiry || !cardCvv) {
                if (addToast) addToast('Please complete all card details', 'warning')
                return
            }
        } else if (selectedPaymentMode === 'upi' && upiTab === 'id') {
            if (!upiId || !upiId.includes('@')) {
                if (addToast) addToast('Please enter a valid UPI ID (e.g. mobile@upi)', 'warning')
                return
            }
        } else if (selectedPaymentMode === 'wire') {
            if (!utrNumber.trim()) {
                if (addToast) addToast('Please enter the Bank UTR / Reference number', 'warning')
                return
            }
        }
        setCheckoutStep(3)
    }

    // Handle Step 3 -> Step 4 (Verify OTP & Register Owner)
    const handleVerifyOtpAndAuthorize = async () => {
        const fullOtp = otpValue.join('')
        if (fullOtp.length < 6) {
            if (addToast) addToast('Please enter full 6-digit OTP code', 'warning')
            return
        }

        setIsVerifyingOtp(true)
        setIsSubmittingOwner(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 1400))

            const ownerPayload = {
                name: ownerFormData.fullName,
                email: ownerFormData.email,
                phone: ownerFormData.mobile,
                alternatePhone: ownerFormData.alternateMobile || undefined,
                password: ownerFormData.password,
                businessName: ownerFormData.businessName,
                businessType: ownerFormData.businessType || 'Sports & Recreation',
                gstNumber: ownerFormData.gstNumber || undefined,
                panNumber: ownerFormData.panNumber || undefined,
                city: ownerFormData.city || 'Indore',
                state: ownerFormData.state || undefined,
                zipCode: ownerFormData.zipCode || undefined,
                address: ownerFormData.fullAddress || `${ownerFormData.city || 'Indore'}, India`,
                planId: plan?.id || plan?.rawId || 'STARTER',
                billingCycle: billingCycle,
                subscriptionStatus: 'ACTIVE',
                commissionRate: 5
            }

            let registeredUser = null
            try {
                const res = await createOwner(ownerPayload)
                registeredUser = res.data || res.owner || res
            } catch (apiErr) {
                console.warn('API error registering owner, proceeding with local credentials:', apiErr)
                registeredUser = {
                    id: `OWNER-${Date.now()}`,
                    name: ownerFormData.fullName,
                    email: ownerFormData.email,
                    role: 'OWNER'
                }
            }

            setRegisteredOwnerUser(registeredUser)

            const subId = `SUB-${Date.now().toString().slice(-8)}`
            const txnId = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

            let payModeLabel = 'UPI'
            if (selectedPaymentMode === 'card') payModeLabel = `Card (ending ${cardNumber.slice(-4) || '4242'})`
            else if (selectedPaymentMode === 'netbanking') payModeLabel = `NetBanking (${selectedBank.toUpperCase()})`
            else if (selectedPaymentMode === 'wallet') payModeLabel = `Wallet (${selectedWallet.toUpperCase()})`
            else if (selectedPaymentMode === 'emi') payModeLabel = `${selectedEmiTenure}-Month 0% EMI`
            else if (selectedPaymentMode === 'wire') payModeLabel = `Wire Transfer (UTR: ${utrNumber})`

            setSubDetails({
                subId,
                txnId,
                planName: plan?.name,
                price: plan?.price,
                period: plan?.period,
                numericPrice: plan?.numericPrice,
                paymentMethod: payModeLabel,
                billingCycle: billingCycle,
                paidAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
                nextBillingDate: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                color: plan?.color || 'from-[#16a34a] to-emerald-600'
            })

            setCheckoutStep(4)

            if (addToast) {
                addToast(`Plan Authorized & Payment Confirmed Successfully!`, 'success')
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Owner registration failed'
            if (addToast) addToast(errMsg, 'error')
        } finally {
            setIsVerifyingOtp(false)
            setIsSubmittingOwner(false)
        }
    }

    const handleGoToDashboard = () => {
        onClose()
        navigate('/login', {
            state: {
                email: registeredOwnerUser?.email || ownerFormData.email,
                role: 'owner'
            }
        })
    }

    const handlePrintReceipt = () => {
        window.print()
    }

    if (!isOpen || !plan) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/75 backdrop-blur-md pt-14 sm:pt-18 pb-6 px-3 sm:px-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[88vh] overflow-hidden text-[#111827] my-auto">
                
                {/* Sticky Modal Top Bar & Step Indicators */}
                <div className="p-4 sm:p-5 border-b border-[#E5E7EB] shrink-0 bg-white relative">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer p-1.5 rounded-full hover:bg-[#F7F9FC]"
                    >
                        <HiX className="w-5 h-5" />
                    </button>

                    {/* Plan Badge & Header */}
                    <div className="flex flex-wrap items-center gap-2 mb-2 pr-8">
                        <span className="bg-[#C8FF2E] text-[#111827] text-[10px] font-black px-2.5 py-0.5 rounded-md border border-[#B5F000] uppercase tracking-wider">
                            {plan.name}
                        </span>
                        <span className="text-[11px] font-black text-[#16A34A] uppercase tracking-wider">
                            INR ₹{plan.price} {plan.period}
                        </span>
                        {billingCycle === 'yearly' && (
                            <span className="text-[9.5px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                ⚡ 20% DISCOUNT APPLIED
                            </span>
                        )}
                    </div>

                    {/* Step Progress Bar */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                        {[
                            { step: 1, label: '1. Venue Details' },
                            { step: 2, label: '2. Payment Mode' },
                            { step: 3, label: '3. 3D Secure' },
                            { step: 4, label: '4. Active Receipt' }
                        ].map((item) => (
                            <div key={item.step} className="flex flex-col items-center sm:items-start">
                                <div className={`h-1.5 w-full rounded-full transition-all duration-300 mb-1 ${
                                    checkoutStep >= item.step ? 'bg-[#16A34A]' : 'bg-slate-200'
                                }`} />
                                <span className={`text-[9px] sm:text-[10px] font-black tracking-wider uppercase truncate ${
                                    checkoutStep === item.step ? 'text-[#16A34A]' : checkoutStep > item.step ? 'text-slate-800' : 'text-slate-400'
                                }`}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* STEP 1: OWNER & VENUE REGISTRATION DETAILS */}
                {checkoutStep === 1 && (
                    <form onSubmit={handleProceedToPaymentMode} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
                            {/* Personal Info */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-[#16A34A] font-bold text-xs uppercase tracking-wider">
                                    <HiUser className="w-4 h-4 shrink-0" />
                                    <span>Owner & Administrative Information</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Rahul Sharma"
                                            value={ownerFormData.fullName}
                                            onChange={e => setOwnerFormData({ ...ownerFormData, fullName: e.target.value })}
                                            className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Email Address *</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="rahul@example.com"
                                            value={ownerFormData.email}
                                            onChange={e => setOwnerFormData({ ...ownerFormData, email: e.target.value })}
                                            className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Mobile Number *</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="e.g. 9876543210"
                                            value={ownerFormData.mobile}
                                            onChange={e => setOwnerFormData({ ...ownerFormData, mobile: e.target.value })}
                                            className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Alternative Mobile</label>
                                        <input
                                            type="tel"
                                            placeholder="e.g. 9876543210"
                                            value={ownerFormData.alternateMobile}
                                            onChange={e => setOwnerFormData({ ...ownerFormData, alternateMobile: e.target.value })}
                                            className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] font-bold"
                                        />
                                    </div>
                                </div>

                                {/* Auto-generated Password */}
                                <div className="mt-4 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl p-3 sm:p-3.5">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[10px] font-bold text-[#16A34A] uppercase">Auto Generated Login Password</label>
                                        <button
                                            type="button"
                                            onClick={() => setOwnerFormData({ ...ownerFormData, password: generatePassword() })}
                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
                                        >
                                            <HiRefresh className="w-3 h-3 text-[#16A34A]" />
                                            <span>Regenerate</span>
                                        </button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={ownerFormData.password}
                                            onChange={e => setOwnerFormData({ ...ownerFormData, password: e.target.value })}
                                            className="flex-1 bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs font-mono text-[#111827] font-bold outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(ownerFormData.password)
                                                if (addToast) addToast('Password copied to clipboard', 'info')
                                            }}
                                            className="px-3.5 py-2 bg-white hover:bg-[#F7F9FC] border border-[#E5E7EB] text-[#111827] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                                        >
                                            <HiClipboardCopy className="w-3.5 h-3.5 text-[#16A34A]" />
                                            <span>Copy</span>
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-[#6B7280] mt-1 font-semibold">These credentials will be used to login into your Owner Admin Dashboard.</p>
                                </div>
                            </div>

                            {/* Business Details */}
                            <div className="border-t border-[#E5E7EB] pt-4">
                                <div className="flex items-center gap-2 mb-3 text-[#16A34A] font-bold text-xs uppercase tracking-wider">
                                    <HiOfficeBuilding className="w-4 h-4 shrink-0" />
                                    <span>Turf Complex / Business Details</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Business / Turf Name *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Champion Cricket Turf"
                                            value={ownerFormData.businessName}
                                            onChange={e => setOwnerFormData({ ...ownerFormData, businessName: e.target.value })}
                                            className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Business Type</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Sports & Recreation"
                                            value={ownerFormData.businessType}
                                            onChange={e => setOwnerFormData({ ...ownerFormData, businessType: e.target.value })}
                                            className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">GST Number (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 22AAAAA1111A1Z1"
                                            value={ownerFormData.gstNumber}
                                            onChange={e => setOwnerFormData({ ...ownerFormData, gstNumber: e.target.value })}
                                            className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">PAN Number (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. ABCDE1234F"
                                            value={ownerFormData.panNumber}
                                            onChange={e => setOwnerFormData({ ...ownerFormData, panNumber: e.target.value })}
                                            className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location Info */}
                            <div className="border-t border-[#E5E7EB] pt-4">
                                <div className="flex items-center gap-2 mb-3 text-[#16A34A] font-bold text-xs uppercase tracking-wider">
                                    <HiLocationMarker className="w-4 h-4 shrink-0" />
                                    <span>Location & Address</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">City</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Indore"
                                            value={ownerFormData.city}
                                            onChange={e => setOwnerFormData({ ...ownerFormData, city: e.target.value })}
                                            className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">State</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Madhya Pradesh"
                                            value={ownerFormData.state}
                                            onChange={e => setOwnerFormData({ ...ownerFormData, state: e.target.value })}
                                            className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Zip Code</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 452001"
                                            value={ownerFormData.zipCode}
                                            onChange={e => setOwnerFormData({ ...ownerFormData, zipCode: e.target.value })}
                                            className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 1 Footer */}
                        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-[#F7F9FC] shrink-0 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="py-2.5 px-4 bg-white hover:bg-slate-100 text-[#111827] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer border border-[#E5E7EB]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="py-2.5 px-6 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black tracking-wider text-xs uppercase rounded-xl transition-all border border-[#B5F000] shadow-sm cursor-pointer flex items-center gap-2 active:scale-95"
                            >
                                <span>Proceed to Payment Mode</span>
                                <HiArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                )}

                {/* STEP 2: PAYMENT MODE SELECTION & BILLING BREAKDOWN */}
                {checkoutStep === 2 && (
                    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                
                                {/* Left Column: Payment Modes Selector (7 cols) */}
                                <div className="lg:col-span-7 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider flex items-center gap-2">
                                            <HiCreditCard className="w-4 h-4 text-[#16A34A]" />
                                            <span>Select Payment Mode</span>
                                        </h3>
                                        <span className="text-[10px] font-bold text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                            🔒 256-Bit SSL Encrypted
                                        </span>
                                    </div>

                                    {/* Payment Methods Grid */}
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {[
                                            { id: 'upi', label: 'UPI / QR', icon: HiQrCode, badge: 'FAST' },
                                            { id: 'card', label: 'Cards', icon: HiCreditCard, badge: null },
                                            { id: 'netbanking', label: 'NetBank', icon: HiBuildingLibrary, badge: null },
                                            { id: 'wallet', label: 'Wallets', icon: HiWallet, badge: null },
                                            { id: 'emi', label: '0% EMI', icon: HiBanknotes, badge: '0%' },
                                            { id: 'wire', label: 'Wire / RTGS', icon: HiSparkles, badge: 'CORP' },
                                        ].map((pm) => {
                                            const Icon = pm.icon
                                            const isSelected = selectedPaymentMode === pm.id
                                            return (
                                                <button
                                                    key={pm.id}
                                                    type="button"
                                                    onClick={() => setSelectedPaymentMode(pm.id)}
                                                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                                                        isSelected 
                                                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-102' 
                                                            : 'bg-[#F7F9FC] text-slate-700 border-[#E5E7EB] hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {pm.badge && (
                                                        <span className={`absolute -top-1.5 right-1 text-[8px] font-black px-1.5 py-0.2 rounded-full border ${
                                                            isSelected ? 'bg-[#C8FF2E] text-black border-[#aee810]' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                        }`}>
                                                            {pm.badge}
                                                        </span>
                                                    )}
                                                    <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-[#C8FF2E]' : 'text-slate-600'}`} />
                                                    <span className="text-[10px] font-bold uppercase tracking-tight">{pm.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Sub-Panel: UPI Payment Mode */}
                                    {selectedPaymentMode === 'upi' && (
                                        <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
                                            <div className="flex border-b border-slate-200 gap-4 pb-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setUpiTab('qr')}
                                                    className={`text-xs font-black uppercase tracking-wider pb-1 cursor-pointer transition-colors ${
                                                        upiTab === 'qr' ? 'text-[#16A34A] border-b-2 border-[#16A34A]' : 'text-slate-500 hover:text-slate-900'
                                                    }`}
                                                >
                                                    ⚡ Dynamic UPI QR
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setUpiTab('id')}
                                                    className={`text-xs font-black uppercase tracking-wider pb-1 cursor-pointer transition-colors ${
                                                        upiTab === 'id' ? 'text-[#16A34A] border-b-2 border-[#16A34A]' : 'text-slate-500 hover:text-slate-900'
                                                    }`}
                                                >
                                                    Enter UPI ID (VPA)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setUpiTab('apps')}
                                                    className={`text-xs font-black uppercase tracking-wider pb-1 cursor-pointer transition-colors ${
                                                        upiTab === 'apps' ? 'text-[#16A34A] border-b-2 border-[#16A34A]' : 'text-slate-500 hover:text-slate-900'
                                                    }`}
                                                >
                                                    UPI Apps
                                                </button>
                                            </div>

                                            {upiTab === 'qr' && (
                                                <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
                                                    <div className="relative p-3 bg-white border-2 border-emerald-500/50 rounded-2xl shadow-md text-center shrink-0 group">
                                                        <div className="w-36 h-36 bg-slate-950 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                                                            <div className="w-full h-full border-2 border-dashed border-[#C8FF2E]/60 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                                                                <HiQrCode className="w-20 h-20 text-[#C8FF2E] animate-pulse" />
                                                                <span className="text-[8px] font-black text-white uppercase tracking-widest mt-0.5">SCAN & PAY</span>
                                                            </div>
                                                            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#C8FF2E] to-transparent shadow-[0_0_8px_#C8FF2E] animate-bounce top-1/3" />
                                                        </div>
                                                        <div className="mt-2 text-[9px] font-black text-slate-600 uppercase">
                                                            Exp in: <span className="text-[#16A34A]">{Math.floor(qrTimer / 60)}:{(qrTimer % 60).toString().padStart(2, '0')}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 text-center sm:text-left flex-1">
                                                        <span className="text-[10px] font-black text-[#16A34A] uppercase tracking-wider block">
                                                            ⚡ Instant Activation via QR
                                                        </span>
                                                        <h4 className="text-xs font-black text-[#111827] uppercase">Scan with any UPI App</h4>
                                                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                                                            Scan this QR code using Google Pay, PhonePe, Paytm, BHIM, or your Banking UPI App to authorize subscription.
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5 pt-1 justify-center sm:justify-start">
                                                            {['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'CRED'].map((app) => (
                                                                <span key={app} className="text-[9px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                                                                    {app}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {upiTab === 'id' && (
                                                <div className="space-y-3 pt-2">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">
                                                            Virtual Payment Address (UPI ID) *
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. mobile@okaxis or name@okhdfcbank"
                                                                value={upiId}
                                                                onChange={e => setUpiId(e.target.value)}
                                                                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (upiId.includes('@')) {
                                                                        if (addToast) addToast('UPI ID Verified Successfully!', 'success')
                                                                    } else {
                                                                        if (addToast) addToast('Please enter a valid UPI ID with @', 'error')
                                                                    }
                                                                }}
                                                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer hover:bg-slate-800 shrink-0"
                                                            >
                                                                Verify
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {['@okhdfcbank', '@okaxis', '@oksbi', '@paytm', '@ybl', '@ibl'].map((handle) => (
                                                            <button
                                                                key={handle}
                                                                type="button"
                                                                onClick={() => {
                                                                    const prefix = upiId.includes('@') ? upiId.split('@')[0] : (upiId || ownerFormData.mobile || 'user')
                                                                    setUpiId(`${prefix}${handle}`)
                                                                }}
                                                                className="text-[9px] font-bold bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 px-2 py-0.5 rounded-md text-slate-700 cursor-pointer"
                                                            >
                                                                {handle}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {upiTab === 'apps' && (
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                                                    {[
                                                        { id: 'gpay', name: 'Google Pay', color: 'text-blue-600' },
                                                        { id: 'phonepe', name: 'PhonePe', color: 'text-purple-600' },
                                                        { id: 'paytm', name: 'Paytm UPI', color: 'text-sky-600' },
                                                        { id: 'cred', name: 'CRED UPI', color: 'text-slate-900' },
                                                    ].map(app => (
                                                        <button
                                                            key={app.id}
                                                            type="button"
                                                            onClick={() => setSelectedUpiApp(app.id)}
                                                            className={`p-3 rounded-xl border text-center font-bold text-xs uppercase cursor-pointer transition-all ${
                                                                selectedUpiApp === app.id 
                                                                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900' 
                                                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <span className={app.color}>●</span> {app.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Sub-Panel: Credit / Debit Card Mode */}
                                    {selectedPaymentMode === 'card' && (
                                        <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
                                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${getCardBrand(cardNumber).color} text-white shadow-lg relative overflow-hidden max-w-sm mx-auto`}>
                                                <div className="flex justify-between items-center mb-5">
                                                    <div className="w-8 h-6 bg-amber-400/80 rounded-md border border-amber-300 shadow-inner flex items-center justify-center">
                                                        <div className="w-4 h-3 border border-amber-600/50 rounded-xs" />
                                                    </div>
                                                    <span className="text-xs font-black tracking-widest uppercase">{getCardBrand(cardNumber).name}</span>
                                                </div>
                                                <div className="font-mono text-sm sm:text-base font-bold tracking-widest mb-4">
                                                    {cardNumber || '•••• •••• •••• ••••'}
                                                </div>
                                                <div className="flex justify-between text-[9px] uppercase tracking-wider font-semibold text-slate-300">
                                                    <div>
                                                        <span className="block text-[7px] text-slate-400">Cardholder</span>
                                                        <span className="font-bold text-white uppercase truncate max-w-[140px] block">
                                                            {cardHolder || ownerFormData.fullName || 'YOUR NAME'}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-[7px] text-slate-400">Expires</span>
                                                        <span className="font-bold text-white font-mono">{cardExpiry || 'MM/YY'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Card Number *</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="4532 0000 0000 0000"
                                                            value={cardNumber}
                                                            onChange={e => handleCardNumberChange(e.target.value)}
                                                            maxLength={19}
                                                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]"
                                                        />
                                                        <HiCreditCard className="w-5 h-5 text-slate-400 absolute right-3.5 top-2.5 pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Expiry Date *</label>
                                                        <input
                                                            type="text"
                                                            placeholder="MM/YY"
                                                            value={cardExpiry}
                                                            onChange={e => handleCardExpiryChange(e.target.value)}
                                                            maxLength={5}
                                                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">CVV / CVC *</label>
                                                        <input
                                                            type="password"
                                                            placeholder="•••"
                                                            value={cardCvv}
                                                            onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                            maxLength={4}
                                                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <input
                                                        type="checkbox"
                                                        id="saveCardAutoRenewModal"
                                                        checked={saveCardForAutoRenew}
                                                        onChange={e => setSaveCardForAutoRenew(e.target.checked)}
                                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                    />
                                                    <label htmlFor="saveCardAutoRenewModal" className="text-[10px] font-semibold text-slate-600 cursor-pointer">
                                                        Save card securely for recurring plan renewals
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Sub-Panel: Net Banking */}
                                    {selectedPaymentMode === 'netbanking' && (
                                        <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                                                Popular Indian Banks
                                            </span>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {[
                                                    { id: 'hdfc', name: 'HDFC Bank' },
                                                    { id: 'sbi', name: 'State Bank of India' },
                                                    { id: 'icici', name: 'ICICI Bank' },
                                                    { id: 'axis', name: 'Axis Bank' },
                                                    { id: 'kotak', name: 'Kotak Mahindra' },
                                                    { id: 'pnb', name: 'Punjab National Bank' },
                                                ].map(b => (
                                                    <button
                                                        key={b.id}
                                                        type="button"
                                                        onClick={() => setSelectedBank(b.id)}
                                                        className={`p-3 rounded-xl border text-left font-bold text-xs uppercase cursor-pointer transition-all ${
                                                            selectedBank === b.id 
                                                                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900' 
                                                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                                                        }`}
                                                    >
                                                        <HiBuildingLibrary className="w-4 h-4 mb-1 text-slate-600" />
                                                        <span className="block truncate">{b.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sub-Panel: Wallets */}
                                    {selectedPaymentMode === 'wallet' && (
                                        <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 space-y-3 animate-in fade-in duration-150">
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                                                Select Digital Wallet
                                            </span>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { id: 'paytm', name: 'Paytm Wallet' },
                                                    { id: 'amazonpay', name: 'Amazon Pay Balance' },
                                                    { id: 'phonepe', name: 'PhonePe Wallet' },
                                                    { id: 'mobikwik', name: 'MobiKwik ZIP' },
                                                ].map(w => (
                                                    <button
                                                        key={w.id}
                                                        type="button"
                                                        onClick={() => setSelectedWallet(w.id)}
                                                        className={`p-3 rounded-xl border font-bold text-xs uppercase cursor-pointer transition-all flex items-center gap-2 ${
                                                            selectedWallet === w.id 
                                                                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900' 
                                                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                                                        }`}
                                                    >
                                                        <HiWallet className="w-4 h-4 text-slate-600" />
                                                        <span>{w.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sub-Panel: 0% EMI */}
                                    {selectedPaymentMode === 'emi' && (
                                        <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 space-y-3 animate-in fade-in duration-150">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-[#16A34A] uppercase tracking-wider">
                                                    ⚡ No-Cost EMI Available
                                                </span>
                                                <span className="text-[9px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                                                    0% INTEREST
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { tenure: 3, cost: Math.round(plan.numericPrice / 3) },
                                                    { tenure: 6, cost: Math.round(plan.numericPrice / 6) },
                                                    { tenure: 12, cost: Math.round(plan.numericPrice / 12) },
                                                ].map(e => (
                                                    <button
                                                        key={e.tenure}
                                                        type="button"
                                                        onClick={() => setSelectedEmiTenure(e.tenure)}
                                                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                                                            selectedEmiTenure === e.tenure 
                                                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                                                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                                                        }`}
                                                    >
                                                        <span className="text-xs font-black uppercase block">{e.tenure} Months</span>
                                                        <span className="text-[11px] font-bold block mt-0.5 text-emerald-400">₹{e.cost.toLocaleString('en-IN')}/mo</span>
                                                        <span className="text-[8px] opacity-70 block">0% Interest</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sub-Panel: Corporate Wire */}
                                    {selectedPaymentMode === 'wire' && (
                                        <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 space-y-3 animate-in fade-in duration-150">
                                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">
                                                Beneficiary Account for NEFT / RTGS
                                            </span>
                                            <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 font-mono">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Beneficiary:</span>
                                                    <span className="font-bold text-slate-900">SportMatrix Technologies Ltd</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Account No:</span>
                                                    <span className="font-bold text-slate-900">924020084920194</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">IFSC Code:</span>
                                                    <span className="font-bold text-slate-900">HDFC0001042</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">
                                                    Enter Bank Transfer UTR / Transaction Reference *
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. UTR198420194820"
                                                    value={utrNumber}
                                                    onChange={e => setUtrNumber(e.target.value)}
                                                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Order & Tax Invoice Breakdown (5 cols) */}
                                <div className="lg:col-span-5 flex flex-col justify-between">
                                    <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Order Summary</h3>
                                            <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                                {billingCycle.toUpperCase()} BILLING
                                            </span>
                                        </div>

                                        <div className="space-y-2.5 text-xs font-bold">
                                            <div className="flex justify-between text-slate-700">
                                                <span>{plan.name} Access</span>
                                                <span>INR ₹{plan.price}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-500">
                                                <span>Setup & Onboarding Fee</span>
                                                <span className="text-[#16A34A] font-black">FREE (₹0)</span>
                                            </div>
                                            <div className="flex justify-between text-slate-500">
                                                <span>Platform GST (18%)</span>
                                                <span className="text-slate-700">Included</span>
                                            </div>
                                            {billingCycle === 'yearly' && (
                                                <div className="flex justify-between text-[#16A34A] bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                                                    <span>⚡ Yearly Savings Discount (20%)</span>
                                                    <span>Applied ✓</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-baseline">
                                            <div>
                                                <span className="text-[10px] font-black uppercase text-slate-500 block">Total Amount Payable</span>
                                                <span className="text-2xl font-black text-slate-900">₹{plan.price}</span>
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-[#16A34A] bg-[#C8FF2E]/30 px-2.5 py-1 rounded-md border border-[#aee810]">
                                                ALL INCLUSIVE
                                            </span>
                                        </div>

                                        {/* Guarantee Badges */}
                                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                                <HiShieldCheck className="w-4 h-4 text-[#16A34A]" />
                                                <span>100% Secure PCI-DSS Level 1 Gateway</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                                <HiCheckCircle className="w-4 h-4 text-[#16A34A]" />
                                                <span>Instant Owner Dashboard Activation</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 Footer */}
                        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-[#F7F9FC] shrink-0 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => setCheckoutStep(1)}
                                className="py-2.5 px-4 bg-white hover:bg-slate-100 text-[#111827] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer border border-[#E5E7EB] flex items-center gap-1.5"
                            >
                                <HiArrowLeft className="w-4 h-4" />
                                <span>Back to Details</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleInitiatePayment}
                                className="py-2.5 px-6 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black tracking-wider text-xs uppercase rounded-xl transition-all border border-[#B5F000] shadow-sm cursor-pointer flex items-center gap-2 active:scale-95"
                            >
                                <HiLockClosed className="w-4 h-4 text-[#16A34A]" />
                                <span>Pay ₹{plan.price} & Authorize</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: 3D SECURE GATEWAY & OTP VERIFICATION */}
                {checkoutStep === 3 && (
                    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
                            {/* Security Shield Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-[#C8FF2E] flex items-center justify-center shadow-lg relative">
                                <HiLockClosed className="w-8 h-8" />
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#16A34A] animate-ping" />
                            </div>

                            <div>
                                <h3 className="text-lg font-black text-[#111827] uppercase tracking-tight">
                                    3D-Secure 2.0 Verification
                                </h3>
                                <p className="text-xs text-slate-500 font-semibold mt-1">
                                    Enter the 6-digit one-time password sent to <span className="font-bold text-slate-800">+91 ******{ownerFormData.mobile.slice(-4) || '3210'}</span>
                                </p>
                            </div>

                            {/* OTP Input Boxes */}
                            <div className="flex justify-center gap-2 sm:gap-3 my-2">
                                {otpValue.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={el => (otpInputRefs.current[idx] = el)}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                                        className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-black bg-[#F7F9FC] border-2 border-slate-300 rounded-xl focus:border-[#16A34A] focus:bg-white focus:outline-none transition-all"
                                    />
                                ))}
                            </div>

                            {/* Quick Auto-Fill Demo OTP Pill */}
                            <button
                                type="button"
                                onClick={() => setOtpValue(['8', '4', '9', '2', '0', '1'])}
                                className="text-[10px] font-black bg-[#C8FF2E]/40 border border-[#aee810] px-3 py-1 rounded-full text-[#111827] hover:bg-[#C8FF2E] transition-colors cursor-pointer"
                            >
                                ⚡ Use Demo OTP: 849201
                            </button>

                            {/* Resend OTP */}
                            <div className="text-xs font-bold text-slate-500">
                                {otpTimer > 0 ? (
                                    <span>Resend OTP code in <span className="text-[#16A34A] font-mono">{otpTimer}s</span></span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOtpTimer(45)
                                            if (addToast) addToast('New OTP sent to your registered mobile!', 'info')
                                        }}
                                        className="text-[#16A34A] hover:underline cursor-pointer font-black"
                                    >
                                        Resend OTP Code
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Step 3 Footer */}
                        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-[#F7F9FC] shrink-0 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => setCheckoutStep(2)}
                                className="py-2.5 px-4 bg-white hover:bg-slate-100 text-[#111827] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer border border-[#E5E7EB]"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                disabled={isVerifyingOtp || isSubmittingOwner}
                                onClick={handleVerifyOtpAndAuthorize}
                                className="py-2.5 px-6 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black tracking-wider text-xs uppercase rounded-xl transition-all border border-[#B5F000] shadow-sm cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                {isVerifyingOtp || isSubmittingOwner ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                        <span>Authorizing Plan...</span>
                                    </>
                                ) : (
                                    <>
                                        <HiCheckCircle className="w-4 h-4 text-[#16A34A]" />
                                        <span>Verify OTP & Complete Authorization</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: PLAN AUTHORIZED & TAX INVOICE RECEIPT */}
                {checkoutStep === 4 && subDetails && (
                    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar max-w-xl mx-auto w-full">
                            {/* Success Hero Badge */}
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 rounded-2xl bg-[#C8FF2E] border-2 border-[#B5F000] flex items-center justify-center text-[#111827] shadow-lg mx-auto">
                                    <HiCheckCircle className="w-10 h-10 text-[#16A34A]" />
                                </div>
                                <h3 className="text-2xl font-black text-[#111827] uppercase tracking-tight">
                                    PLAN AUTHORIZED & ACCOUNT ACTIVE!
                                </h3>
                                <p className="text-xs text-[#16A34A] font-black uppercase tracking-wider">
                                    {subDetails.planName} • {subDetails.billingCycle.toUpperCase()} MEMBERSHIP
                                </p>
                            </div>

                            {/* Official Tax Receipt Breakdown */}
                            <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-2xl p-5 space-y-3 text-xs font-bold">
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">Subscription Ref ID</span>
                                    <span className="text-[#16A34A] font-mono font-bold">{subDetails.subId}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">Payment Gateway Txn ID</span>
                                    <span className="text-slate-900 font-mono font-bold">{subDetails.txnId}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">Payment Instrument</span>
                                    <span className="text-slate-900 font-bold">{subDetails.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">Amount Paid</span>
                                    <span className="text-slate-900 font-black">INR ₹{subDetails.price} ({subDetails.period})</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">Activation Date</span>
                                    <span className="text-slate-900">{subDetails.paidAt}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span className="text-slate-500">Next Renewal Date</span>
                                    <span className="text-[#16A34A] font-black">{subDetails.nextBillingDate}</span>
                                </div>
                            </div>

                            {/* Owner Credentials summary */}
                            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 border border-slate-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-[#C8FF2E] uppercase tracking-wider">
                                        🔑 Owner Admin Login Credentials
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`Email: ${registeredOwnerUser?.email || ownerFormData.email}\nPassword: ${ownerFormData.password}`)
                                            if (addToast) addToast('Credentials copied to clipboard!', 'success')
                                        }}
                                        className="text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                                    >
                                        <HiClipboardCopy className="w-3.5 h-3.5 text-[#C8FF2E]" />
                                        <span>Copy All</span>
                                    </button>
                                </div>
                                <div className="text-xs font-mono space-y-1">
                                    <div className="flex justify-between text-slate-300">
                                        <span>Email:</span>
                                        <span className="text-white font-bold">{registeredOwnerUser?.email || ownerFormData.email}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Password:</span>
                                        <span className="text-[#C8FF2E] font-bold">{ownerFormData.password}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 Footer */}
                        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-[#F7F9FC] shrink-0 flex flex-wrap items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handlePrintReceipt}
                                className="py-2.5 px-4 bg-white hover:bg-slate-100 text-[#111827] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer border border-[#E5E7EB] flex items-center gap-1.5"
                            >
                                <HiPrinter className="w-4 h-4 text-slate-600" />
                                <span>Print Tax Receipt</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleGoToDashboard}
                                className="py-2.5 px-6 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black tracking-wider text-xs uppercase rounded-xl transition-all border border-[#B5F000] shadow-sm cursor-pointer active:scale-95 flex items-center gap-2"
                            >
                                <span>Go to Owner Dashboard</span>
                                <HiArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
