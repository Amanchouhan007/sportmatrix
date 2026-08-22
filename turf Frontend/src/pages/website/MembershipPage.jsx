import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    HiCheck, 
    HiStar, 
    HiLightningBolt, 
    HiFire, 
    HiShieldCheck, 
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
    HiQrcode,
    HiPrinter,
    HiPhone,
    HiMail,
    HiBadgeCheck
} from 'react-icons/hi'
import { 
    HiQrCode, 
    HiBuildingLibrary, 
    HiWallet, 
    HiBanknotes, 
    HiSparkles,
    HiArrowPath,
    HiDevicePhoneMobile
} from 'react-icons/hi2'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { getAllPlans, defaultFallbackPlans } from '../../services/subscriptionPlanService'
import { createOwner } from '../../services/ownerService'

export default function MembershipPage() {
    const navigate = useNavigate()
    const toastContext = useToast()
    const addToast = toastContext?.addToast
    const { setSession } = useAuth()

    const [dbPlans, setDbPlans] = useState([])
    const [isLoadingPlans, setIsLoadingPlans] = useState(false)
    const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' | 'yearly'

    // Multi-Step Checkout Modal State:
    // Step 1: DETAILS (Owner & Business info)
    // Step 2: PAYMENT_MODE (UPI, Card, NetBanking, Wallets, EMI, Wire)
    // Step 3: PROCESSING_OTP (3D Secure Gateway & OTP Verification)
    // Step 4: SUCCESS_RECEIPT (Plan Authorized & Tax Invoice)
    const [checkoutStep, setCheckoutStep] = useState(1)
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
    const [selectedPlanForRegistration, setSelectedPlanForRegistration] = useState(null)
    const [isSubmittingOwner, setIsSubmittingOwner] = useState(false)

    // Owner Form State
    const [ownerFormData, setOwnerFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        alternateMobile: '',
        password: '',
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
    const [qrTimer, setQrTimer] = useState(300) // 5 minutes

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

    // Wire / Corporate Transfer States
    const [utrNumber, setUtrNumber] = useState('')

    // Step 3: Gateway & OTP States
    const [otpValue, setOtpValue] = useState(['', '', '', '', '', ''])
    const [otpTimer, setOtpTimer] = useState(45)
    const [gatewayStatus, setGatewayStatus] = useState('Establishing 256-Bit SSL Handshake...')
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)

    // Step 4: Success Details & Receipt Modal
    const [subDetails, setSubDetails] = useState(null)
    const [registeredOwnerUser, setRegisteredOwnerUser] = useState(null)
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)

    const otpInputRefs = useRef([])

    const generatePassword = () => {
        const randStr = Math.floor(100000 + Math.random() * 900000)
        return `Pass@${randStr}`
    }

    useEffect(() => {
        window.scrollTo(0, 0)
        fetchSubscriptionPlans()

        const handlePlansUpdated = () => fetchSubscriptionPlans()
        window.addEventListener('subscription_plans_updated', handlePlansUpdated)
        return () => window.removeEventListener('subscription_plans_updated', handlePlansUpdated)
    }, [])

    // QR Code Live Timer Countdown
    useEffect(() => {
        let timer = null
        if (isCheckoutModalOpen && checkoutStep === 2 && selectedPaymentMode === 'upi' && upiTab === 'qr') {
            timer = setInterval(() => {
                setQrTimer(prev => (prev > 0 ? prev - 1 : 300))
            }, 1000)
        }
        return () => clearInterval(timer)
    }, [isCheckoutModalOpen, checkoutStep, selectedPaymentMode, upiTab])

    // Step 3 OTP Timer Countdown
    useEffect(() => {
        let timer = null
        if (isCheckoutModalOpen && checkoutStep === 3 && otpTimer > 0) {
            timer = setInterval(() => {
                setOtpTimer(prev => prev - 1)
            }, 1000)
        }
        return () => clearInterval(timer)
    }, [isCheckoutModalOpen, checkoutStep, otpTimer])

    const fetchSubscriptionPlans = async () => {
        try {
            setIsLoadingPlans(true)
            const res = await getAllPlans()
            if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                const active = res.data.filter(p => (p.status || 'active').toLowerCase() === 'active')
                if (active.length > 0) {
                    const sorted = [...active].sort((a, b) => {
                        const priceA = a.monthlyPricing?.price ?? (a.monthly_price !== undefined ? Number(a.monthly_price) : (a.price !== undefined ? Number(a.price) : 0))
                        const priceB = b.monthlyPricing?.price ?? (b.monthly_price !== undefined ? Number(b.monthly_price) : (b.price !== undefined ? Number(b.price) : 0))
                        return priceA - priceB
                    })
                    setDbPlans(sorted)
                }
            }
        } catch (err) {
            console.error('Failed to load subscription plans:', err)
        } finally {
            setIsLoadingPlans(false)
        }
    }

    const formatPlanForUI = (p, index) => {
        const isYearly = billingCycle === 'yearly'
        const rawMonthly = p.monthlyPricing?.price ?? p.monthly_price ?? p.price ?? (index === 0 ? 999 : index === 1 ? 2499 : 4999)
        const monthlyPrice = Number(rawMonthly) || 0

        const rawYearly = p.yearlyPricing?.price ?? p.yearly_price ?? Math.round(monthlyPrice * 12 * 0.8)
        const yearlyPrice = Number(rawYearly) || Math.round(monthlyPrice * 12 * 0.8)

        const priceVal = isYearly ? yearlyPrice : monthlyPrice

        const branchLim = isYearly ? (p.yearlyPricing?.branchLimit ?? p.yearly_branch_limit ?? p.monthly_branch_limit) : (p.monthlyPricing?.branchLimit ?? p.monthly_branch_limit)
        const sportsLim = isYearly ? (p.yearlyPricing?.sportsLimit ?? p.yearly_sports_limit ?? p.monthly_sports_limit) : (p.monthlyPricing?.sportsLimit ?? p.monthly_sports_limit)
        const bookingLim = isYearly ? (p.yearlyPricing?.bookingLimit ?? p.yearly_booking_limit ?? p.monthly_booking_limit) : (p.monthlyPricing?.bookingLimit ?? p.monthly_booking_limit)
        const usersLim = isYearly ? (p.yearlyPricing?.activeUsersLimit ?? p.yearly_active_users_limit ?? p.monthly_active_users_limit) : (p.monthlyPricing?.activeUsersLimit ?? p.monthly_active_users_limit)

        const priceStr = priceVal.toLocaleString('en-IN')
        const periodStr = monthlyPrice === 0 ? '/TRIAL' : (isYearly ? '/YEAR' : '/MO')
        const perMonthNote = isYearly && monthlyPrice > 0 
            ? `₹${Math.round(yearlyPrice / 12).toLocaleString('en-IN')}/mo · Save ₹${Math.round((monthlyPrice * 12) - yearlyPrice).toLocaleString('en-IN')}/yr` 
            : null

        const descStr = p.description || (monthlyPrice === 0 ? 'NO CREDIT CARD REQUIRED' : (p.isPopular ? 'RECOMMENDED FOR PROS' : 'STANDARD OPERATIONAL ACCESS'))

        let color = 'from-emerald-500 to-teal-600'
        let accent = 'emerald'
        const pNameLower = (p.planName || p.name || '').toLowerCase()

        if (p.isPopular || pNameLower.includes('enterprise') || pNameLower.includes('premium')) {
            color = 'from-[#16a34a] to-emerald-600'
            accent = 'emerald'
        } else if (monthlyPrice === 0 || pNameLower.includes('starter') || pNameLower.includes('free')) {
            color = 'from-slate-700 to-slate-900'
            accent = 'slate'
        } else {
            color = 'from-blue-600 to-indigo-700'
            accent = 'blue'
        }

        let baseFeatures = [
            '1 Venue / Turf Location Allowed',
            'Online Slot Booking & WhatsApp Confirmations',
            'Basic Revenue & Occupancy Analytics',
            'Standard Email & Chat Support'
        ]
        let monthlyPerks = [
            '7-Day Free Trial (Cancel Anytime)',
            'Instant WhatsApp Slot Alerts',
            'Zero Setup / Onboarding Fee'
        ]
        let yearlyPerks = [
            'FREE Custom Turf Webpage (Val. ₹1,500)',
            '₹500 Featured Turf Ad Credits',
            '1 Month Extra Free Validity (13 Mo)'
        ]

        if (index === 1 || pNameLower.includes('professional') || p.isPopular) {
            baseFeatures = [
                'Up to 3 Venue Branches / Turfs Allowed',
                'Multi-Staff Roles & Cashier POS System',
                '🔥 Dare Match™ & 50:50 Fee Splitting',
                'Advanced Analytics & PDF/CSV Exports',
                'Priority 24/7 WhatsApp Support'
            ]
            monthlyPerks = [
                '14-Day Free Trial (Zero Risk)',
                'Free Staff Training & Role Setup',
                '₹300 Monthly Ad Booster Credit',
                'Unlimited Player Split-Payment Invites'
            ]
            yearlyPerks = [
                'FREE Thermal Receipt Printer Sync',
                '₹2,000 Top-Banner Ad Credits',
                '2 Months Extra Free Validity (14 Mo)',
                'Complimentary Live Scorer Console'
            ]
        } else if (index === 2 || pNameLower.includes('enterprise')) {
            baseFeatures = [
                'Unlimited Branches & Multi-City Networks',
                'Dedicated Account Manager & 99.9% SLA',
                'White-Label Custom Branding & Domain',
                'Corporate GST Invoice & Tournament Suite'
            ]
            monthlyPerks = [
                '30-Day Money-Back Guarantee',
                'Free Custom Subdomain Setup',
                '₹1,000 Monthly Regional Banner Credits',
                'Dedicated WhatsApp Account Manager'
            ]
            yearlyPerks = [
                '0% Platform Corporate Event Commission',
                '₹5,000 Region-Wide Ad Credits',
                'Free Hardware & QR Scanner Bundle',
                'Dedicated 1-on-1 Onboarding & Custom APIs'
            ]
        }

        let features = Array.isArray(p.features) && p.features.length > 0 ? p.features : baseFeatures

        return {
            rawId: p._id || p.id,
            name: p.planName || p.name || 'Access Plan',
            price: priceStr,
            numericPrice: priceVal,
            period: periodStr,
            perMonthNote,
            desc: descStr.toUpperCase(),
            color,
            accent,
            popular: Boolean(p.isPopular),
            features,
            activePerks: isYearly ? yearlyPerks : monthlyPerks,
            isYearly,
            branchLimit: branchLim === -1 ? 'Unlimited' : branchLim,
            bookingLimit: bookingLim === -1 ? 'Unlimited' : bookingLim,
            sportsLimit: sportsLim === -1 ? 'Unlimited' : sportsLim,
            usersLimit: usersLim === -1 ? 'Unlimited' : usersLim,
        }
    }

    const displayPlans = dbPlans.map((p, i) => formatPlanForUI(p, i))

    // Step 1: Open Form Modal on Plan Click
    const handlePlanSelect = (p) => {
        setSelectedPlanForRegistration(p)
        setCheckoutStep(1)
        setOwnerFormData({
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
        setCardHolder('')
        setCardNumber('')
        setCardExpiry('')
        setCardCvv('')
        setUpiId('')
        setUtrNumber('')
        setIsCheckoutModalOpen(true)
    }

    // Step 1 Validation -> Move to Step 2 (Payment Mode Selection)
    const handleProceedToPaymentMode = (e) => {
        e.preventDefault()

        if (!ownerFormData.fullName.trim()) {
            if (addToast) addToast('Full Name is required', 'error')
            return
        }
        if (!ownerFormData.email.trim()) {
            if (addToast) addToast('Email Address is required', 'error')
            return
        }
        if (!ownerFormData.mobile.trim()) {
            if (addToast) addToast('Mobile Number is required', 'error')
            return
        }
        if (!ownerFormData.businessName.trim()) {
            if (addToast) addToast('Business Name is required', 'error')
            return
        }

        // If free plan, immediately finalize
        if (selectedPlanForRegistration?.numericPrice === 0) {
            handleCompletePlanActivation('FREE_TRIAL', 'N/A - Free Trial')
            return
        }

        setCardHolder(ownerFormData.fullName)
        setCheckoutStep(2)
    }

    // Format Card Number input with spaces
    const handleCardNumberChange = (val) => {
        const cleaned = val.replace(/\D/g, '').slice(0, 16)
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
        setCardNumber(formatted)
    }

    // Format Card Expiry MM/YY
    const handleCardExpiryChange = (val) => {
        const cleaned = val.replace(/\D/g, '').slice(0, 4)
        if (cleaned.length >= 2) {
            setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`)
        } else {
            setCardExpiry(cleaned)
        }
    }

    // Detect Card Brand for Preview
    const getCardBrand = (num) => {
        const cleaned = num.replace(/\s/g, '')
        if (cleaned.startsWith('4')) return { name: 'VISA', color: 'from-blue-700 to-indigo-900' }
        if (cleaned.startsWith('5')) return { name: 'MASTERCARD', color: 'from-amber-600 to-red-800' }
        if (cleaned.startsWith('6')) return { name: 'RUPAY', color: 'from-emerald-700 to-teal-900' }
        if (cleaned.startsWith('3')) return { name: 'AMEX', color: 'from-cyan-700 to-blue-900' }
        return { name: 'SPORT CARD', color: 'from-slate-800 to-slate-950' }
    }

    // Step 2 Action -> Initiate Payment Gateway & Proceed to Step 3 (OTP)
    const handleInitiatePayment = () => {
        // Method validation
        if (selectedPaymentMode === 'card') {
            const rawCard = cardNumber.replace(/\s/g, '')
            if (rawCard.length < 15) {
                if (addToast) addToast('Please enter a valid 16-digit card number', 'error')
                return
            }
            if (!cardExpiry || cardExpiry.length < 5) {
                if (addToast) addToast('Please enter valid expiry date (MM/YY)', 'error')
                return
            }
            if (!cardCvv || cardCvv.length < 3) {
                if (addToast) addToast('Please enter a valid 3-digit CVV', 'error')
                return
            }
        } else if (selectedPaymentMode === 'upi' && upiTab === 'id') {
            if (!upiId.trim() || !upiId.includes('@')) {
                if (addToast) addToast('Please enter a valid UPI ID (e.g. name@okhdfcbank)', 'error')
                return
            }
        } else if (selectedPaymentMode === 'wire') {
            if (!utrNumber.trim() || utrNumber.length < 6) {
                if (addToast) addToast('Please enter valid Bank Transfer UTR / Ref Number', 'error')
                return
            }
        }

        // Trigger 3D Secure / OTP Simulation
        setCheckoutStep(3)
        setOtpValue(['8', '4', '9', '2', '0', '1'])
        setOtpTimer(45)
        setGatewayStatus('Connecting to Payment Gateway Handshake...')

        setTimeout(() => {
            setGatewayStatus('Requesting 3D-Secure Two-Factor Authentication...')
        }, 1200)
    }

    // Step 3 OTP Input Handler
    const handleOtpChange = (index, value) => {
        const val = value.slice(-1)
        const newOtp = [...otpValue]
        newOtp[index] = val
        setOtpValue(newOtp)

        if (val && index < 5) {
            otpInputRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpValue[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus()
        }
    }

    // Final Step: Verify OTP & Authorize Account via Backend
    const handleVerifyOtpAndAuthorize = async () => {
        const enteredOtp = otpValue.join('')
        if (enteredOtp.length < 6) {
            if (addToast) addToast('Please enter complete 6-digit OTP', 'error')
            return
        }

        setIsVerifyingOtp(true)
        try {
            // Determine friendly payment method label
            let methodLabel = 'UPI / Instant QR'
            if (selectedPaymentMode === 'card') {
                const brand = getCardBrand(cardNumber).name
                methodLabel = `${brand} Card (•••• ${cardNumber.slice(-4) || '4242'})`
            } else if (selectedPaymentMode === 'upi') {
                methodLabel = upiTab === 'id' ? `UPI (${upiId})` : `UPI QR Code (${selectedUpiApp.toUpperCase()})`
            } else if (selectedPaymentMode === 'netbanking') {
                methodLabel = `Net Banking (${selectedBank.toUpperCase()})`
            } else if (selectedPaymentMode === 'wallet') {
                methodLabel = `Wallet (${selectedWallet.toUpperCase()})`
            } else if (selectedPaymentMode === 'emi') {
                methodLabel = `No-Cost EMI (${selectedEmiTenure} Months)`
            } else if (selectedPaymentMode === 'wire') {
                methodLabel = `Corporate Wire / UTR: ${utrNumber}`
            }

            await handleCompletePlanActivation(selectedPaymentMode.toUpperCase(), methodLabel)
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Payment authorization failed'
            if (addToast) addToast(errMsg, 'error')
        } finally {
            setIsVerifyingOtp(false)
        }
    }

    const handleCompletePlanActivation = async (payModeCode, payModeLabel) => {
        setIsSubmittingOwner(true)
        try {
            const txnId = `TXN-RZP-${Math.floor(10000000 + Math.random() * 90000000)}`
            const subId = `SUB-${Math.floor(100000 + Math.random() * 900000)}`

            const payload = {
                ...ownerFormData,
                confirmPassword: ownerFormData.password,
                role: 'OWNER',
                planId: selectedPlanForRegistration?.rawId,
                planName: selectedPlanForRegistration?.name,
                billingCycle: billingCycle,
                amountPaid: selectedPlanForRegistration?.numericPrice,
                paymentMode: payModeCode,
                paymentMethod: payModeLabel,
                paymentStatus: 'PAID',
                transactionId: txnId,
                subscriptionId: subId
            }

            const res = await createOwner(payload)
            if (res && res.success) {
                const ownerUser = {
                    id: res.data?.id || `owner_${Date.now()}`,
                    name: ownerFormData.fullName,
                    email: ownerFormData.email,
                    role: 'OWNER',
                    mobile: ownerFormData.mobile,
                    businessName: ownerFormData.businessName,
                    token: res.token || `token_${Date.now()}`
                }

                setRegisteredOwnerUser(ownerUser)
                setSubDetails({
                    subId: subId,
                    txnId: txnId,
                    planName: selectedPlanForRegistration?.name,
                    price: selectedPlanForRegistration?.price,
                    period: selectedPlanForRegistration?.period,
                    numericPrice: selectedPlanForRegistration?.numericPrice,
                    paymentMethod: payModeLabel,
                    billingCycle: billingCycle,
                    paidAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' }),
                    nextBillingDate: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                    color: selectedPlanForRegistration?.color || 'from-[#16a34a] to-emerald-600'
                })

                setCheckoutStep(4)

                if (addToast) {
                    addToast(`Plan Authorized & Payment Confirmed Successfully!`, 'success')
                }
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Owner registration failed'
            if (addToast) addToast(errMsg, 'error')
            throw err
        } finally {
            setIsSubmittingOwner(false)
        }
    }

    const handleGoToDashboard = () => {
        setIsCheckoutModalOpen(false)
        navigate('/login', {
            state: {
                email: registeredOwnerUser?.email || ownerFormData.email,
                password: ownerFormData.password,
                role: 'owner'
            }
        })
    }

    const handlePrintReceipt = () => {
        setIsReceiptModalOpen(true)
        triggerInstantIframePrint()
    }

    const triggerInstantIframePrint = () => {
        const invNo = `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`
        const ownerName = registeredOwnerUser?.name || ownerFormData.fullName || 'Valued Turf Owner'
        const bizName = ownerFormData.businessName || 'SportMatrix Sports Arena'
        const ownerEmail = registeredOwnerUser?.email || ownerFormData.email || 'info@kiaantechnology.com'
        const ownerPhone = ownerFormData.mobile || '+91 98765 43210'
        const planTitle = subDetails?.planName || selectedPlanForRegistration?.name || 'Professional Plan'
        const totalAmount = subDetails?.numericPrice || selectedPlanForRegistration?.numericPrice || 2499
        const payMode = subDetails?.paymentMethod || 'UPI'
        const txnId = subDetails?.txnId || 'TXN-IGC2DQO6'
        const subId = subDetails?.subId || 'SUB-20491221'
        const paidTime = subDetails?.paidAt || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' })

        const iframeHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt ${invNo}</title>
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
                            <div style="font-size: 11px; color: #4b5563; font-weight: bold; margin-top: 2px;">SportMatrix Arena Technologies Pvt Ltd</div>
                        </div>
                        <div style="text-align: right;">
                            <span class="badge">MEMBERSHIP PAYMENT RECEIPT</span>
                            <div style="font-size: 12px; font-weight: 800; margin-top: 4px;">${invNo}</div>
                        </div>
                    </div>

                    <div class="grid">
                        <div class="box">
                            <h4>Billed To Customer</h4>
                            <p style="font-size: 12px; color: #111827; font-weight: 800;">${ownerName}</p>
                            <p>${bizName}</p>
                            <p>${ownerEmail}</p>
                            <p>${ownerPhone}</p>
                        </div>
                        <div class="box">
                            <h4>Payment Summary</h4>
                            <p>Plan: <strong>${planTitle}</strong></p>
                            <p>Sub Ref: <strong>${subId}</strong></p>
                            <p>Txn ID: <strong>${txnId}</strong></p>
                            <p>Mode: <strong>${payMode}</strong></p>
                            <p>Time: <strong>${paidTime}</strong></p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th class="text-right">Billing Cycle</th>
                                <th class="text-right">Tax (GST)</th>
                                <th class="text-right">Amount Paid</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <strong>${planTitle}</strong><br>
                                    <span style="font-size: 10px; color: #6b7280;">Multi-Turf OS Subscription Pass</span>
                                </td>
                                <td class="text-right">${subDetails?.billingCycle === 'yearly' ? 'Annual Pass' : 'Monthly Pass'}</td>
                                <td class="text-right">₹0.00</td>
                                <td class="text-right" style="font-weight: 800;">₹${totalAmount.toLocaleString('en-IN')}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="total">
                        <div>
                            <div style="font-size: 9px; text-transform: uppercase; color: #9ca3af;">Total Amount Paid (Zero GST Tax)</div>
                            <div style="font-size: 11px; color: #10b981; font-weight: bold;">Verified Electronic Payment</div>
                        </div>
                        <div class="total-val">₹${totalAmount.toLocaleString('en-IN')}</div>
                    </div>

                    <div class="footer">
                        <p style="margin: 0;">Verified Official Receipt · Support: support@sportmatrix.com</p>
                    </div>
                </div>
            </body>
            </html>
        `

        let iframe = document.getElementById('fast-receipt-print-frame')
        if (!iframe) {
            iframe = document.createElement('iframe')
            iframe.id = 'fast-receipt-print-frame'
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

    const downloadReceiptTxt = () => {
        const invNo = `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`
        const ownerName = registeredOwnerUser?.name || ownerFormData.fullName || 'Valued Turf Owner'
        const bizName = ownerFormData.businessName || 'SportMatrix Sports Arena'
        const ownerEmail = registeredOwnerUser?.email || ownerFormData.email || 'info@kiaantechnology.com'
        const planTitle = subDetails?.planName || selectedPlanForRegistration?.name || 'Professional Plan'
        const totalAmount = subDetails?.numericPrice || selectedPlanForRegistration?.numericPrice || 2499
        const baseAmount = (totalAmount / 1.18).toFixed(2)
        const gstTax = (totalAmount - baseAmount).toFixed(2)
        const payMode = subDetails?.paymentMethod || 'UPI'
        const txnId = subDetails?.txnId || 'TXN-IGC2DQO6'
        const subId = subDetails?.subId || 'SUB-20491221'

        const txtData = `
===========================================================
SPORTMATRIX ARENA TECHNOLOGIES — MEMBERSHIP PAYMENT RECEIPT
===========================================================
Receipt Number : ${invNo}
Generated Date : ${new Date().toLocaleString()}

BILLED TO (TURF OWNER):
-----------------------------------------------------------
Owner Name    : ${ownerName}
Business Name : ${bizName}
Email Address : ${ownerEmail}
Mobile Number : ${ownerFormData.mobile || '+91 98765 43210'}

SUBSCRIPTION PAYMENT SUMMARY:
-----------------------------------------------------------
Plan Name     : ${planTitle} (${subDetails?.billingCycle === 'yearly' ? 'Annual Pass' : 'Monthly Pass'})
Subscription  : ${subId}
Gateway Txn ID: ${txnId}
Payment Mode  : ${payMode}
Payment Time  : ${subDetails?.paidAt || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' })}
Status        : PAID & AUTHORIZED (COMPLETED)

FINANCIAL SUMMARY (INR):
-----------------------------------------------------------
Membership Fee: ₹${totalAmount.toLocaleString('en-IN')}
Tax Amount    : ₹0.00 (Zero GST Tax / All-Inclusive)
-----------------------------------------------------------
TOTAL PAID    : ₹${totalAmount.toLocaleString('en-IN')}
===========================================================
Verified Membership Payment Receipt by SportMatrix OS
Support: support@sportmatrix.com | Helpline: +91 1800-419-TURF
`
        const blob = new Blob([txtData], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Official_Tax_Invoice_${invNo}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        if (addToast) {
            addToast('📁 Official Tax Invoice Downloaded to your Computer!', 'success')
        }
    }

    return (
        <div className="min-h-screen bg-white text-[#111827] pt-20 sm:pt-24 pb-16 sm:pb-20 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#C8FF2E]/10 blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#16A34A]/5 blur-[120px] rounded-full pointer-events-none" />
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F7F9FC] border border-[#E5E7EB] rounded-full mb-3 shadow-xs">
                        <HiFire className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span className="text-[10px] font-black tracking-wider text-[#111827] uppercase">Membership Protocols</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-[#111827] tracking-tight uppercase">MEMBERSHIP ACCESS PLANS</h1>
                    <p className="text-xs text-[#6B7280] max-w-lg mx-auto font-bold mt-2">Choose the perfect tier for your venue. Manage bookings, multi-branch courts, and analytics.</p>

                    {/* Monthly vs Yearly Billing Toggle */}
                    <div className="inline-flex items-center gap-1.5 bg-white border-2 border-slate-200 hover:border-emerald-400 p-1.5 rounded-full shadow-sm transition-all duration-300 mt-6">
                        <button
                            type="button"
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                                billingCycle === 'monthly'
                                    ? 'bg-[#111827] text-white shadow-sm border border-slate-900'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                        >
                            Monthly
                        </button>

                        <div 
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-12 h-6 rounded-full bg-slate-100 border-2 border-slate-300 hover:border-emerald-500 p-0.5 cursor-pointer relative transition-colors shrink-0"
                        >
                            <div className={`w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-6 bg-[#16A34A]' : 'translate-x-0 bg-slate-600'}`} />
                        </div>

                        <button
                            type="button"
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                                billingCycle === 'yearly'
                                    ? 'bg-[#16A34A] text-white shadow-sm border border-emerald-600'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                        >
                            <span>Yearly</span>
                            <span className="bg-[#C8FF2E] text-[#111827] text-[9.5px] font-black px-2 py-0.5 rounded-full border border-[#aee810] shadow-2xs animate-pulse">
                                SAVE 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Grid */}
                {isLoadingPlans ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 my-12">
                        <div className="w-10 h-10 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold uppercase text-[#6B7280] tracking-wider">Loading Membership Plans...</span>
                    </div>
                ) : displayPlans.length === 0 ? (
                    <div className="min-h-[200px] bg-[#F7F9FC] border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center p-8 max-w-lg mx-auto my-12 text-center shadow-xs">
                        <p className="text-[#111827] text-sm font-bold mb-1">No active membership plans available right now.</p>
                        <p className="text-[#6B7280] text-xs">Please check back soon or contact support.</p>
                    </div>
                ) : (
                    <div className={`grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12 items-stretch`}>
                        {displayPlans.map(p => (
                            <div
                                key={p.rawId}
                                className={`relative group flex flex-col bg-white border-2 transition-all duration-300 hover:-translate-y-1 rounded-2xl h-full shadow-md hover:shadow-xl ${p.popular
                                    ? 'border-[#16A34A] ring-4 ring-emerald-400/20 shadow-emerald-100 z-20'
                                    : 'border-slate-300 hover:border-[#16A34A]'
                                    }`}
                            >
                                {p.popular && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30">
                                        <span className="bg-[#C8FF2E] text-[#111827] text-[10px] font-black px-3.5 py-1 rounded-full border border-[#B5F000] shadow-sm tracking-wider uppercase">
                                            MOST POPULAR
                                        </span>
                                    </div>
                                )}

                                <div className="p-5 pb-0">
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                                        {p.accent === 'slate' ? <HiShieldCheck className="w-6 h-6" /> : p.accent === 'blue' ? <HiStar className="w-6 h-6" /> : <HiLightningBolt className="w-6 h-6" />}
                                    </div>
                                    <h3 className="text-xl font-black text-[#111827] tracking-tight uppercase mb-0.5">{p.name}</h3>
                                    <p className="text-[10px] font-bold text-[#6B7280] tracking-wider mb-4">{p.desc}</p>
                                    <div className="flex flex-col mb-4 pb-4 border-b border-[#E5E7EB]">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-wider">INR</span>
                                            <span className="text-4xl font-black text-[#111827] tabular-nums tracking-tight">₹{p.price}</span>
                                            <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-wider">{p.period}</span>
                                        </div>
                                        {p.perMonthNote && (
                                            <span className="text-[9.5px] font-black text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg mt-2 inline-block self-start shadow-2xs">
                                                ⚡ {p.perMonthNote}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="px-5 pb-5 flex-1">
                                    <ul className="space-y-2.5 mb-4">
                                        {p.features.map((f, fidx) => (
                                            <li key={fidx} className="flex items-start gap-2.5 group/item">
                                                <HiCheck className="w-4 h-4 mt-0.5 shrink-0 text-[#16A34A]" />
                                                <span className="text-xs font-bold text-[#111827] uppercase tracking-wide">{f}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* MONTHLY & YEARLY EXCLUSIVE BONUS PERKS */}
                                    {p.activePerks && p.activePerks.length > 0 && (
                                        <div className={`mt-4 p-3.5 border rounded-xl shadow-2xs ${
                                            p.isYearly 
                                                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' 
                                                : 'bg-gradient-to-br from-blue-50 to-slate-50 border-blue-200'
                                        }`}>
                                            <span className={`text-[9.5px] font-black uppercase tracking-wider block mb-1.5 ${
                                                p.isYearly ? 'text-[#065F46]' : 'text-blue-900'
                                            }`}>
                                                {p.isYearly ? '🎁 YEARLY EXCLUSIVE BONUS PERKS' : '⚡ MONTHLY INCLUDED BONUS PERKS'}
                                            </span>
                                            <ul className="space-y-1.5">
                                                {p.activePerks.map((perk, perkIdx) => (
                                                    <li key={perkIdx} className="text-[9.5px] font-extrabold text-[#111827] flex items-center gap-1.5">
                                                        <span className={p.isYearly ? 'text-emerald-600 font-black' : 'text-blue-600 font-black'}>✓</span>
                                                        <span>{perk}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 pt-0">
                                    <button
                                        onClick={() => handlePlanSelect(p)}
                                        className={`w-full py-3 text-xs font-black tracking-wider uppercase rounded-xl transition-all duration-300 cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
                                            p.popular
                                                ? 'bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] border border-[#B5F000] shadow-sm'
                                                : 'bg-[#F7F9FC] hover:bg-[#E5E7EB] text-[#111827] border border-[#E5E7EB]'
                                        }`}
                                    >
                                        <HiLockClosed className="w-3.5 h-3.5 text-[#16A34A]" />
                                        <span>{p.numericPrice === 0 ? 'START FREE TRIAL' : `AUTHORIZE ${p.name}`}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tactical comparison Table */}
                {displayPlans.length > 0 && (
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-6 sm:p-8 border-b border-[#E5E7EB] bg-[#F7F9FC]">
                                <h2 className="text-xl font-black text-[#111827] tracking-tight uppercase flex items-center gap-3">
                                    <span className="w-1.5 h-6 bg-[#16A34A] rounded-full" />
                                    FEATURESETS COMPARISON
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-[#F7F9FC]">
                                            <th className="py-4 px-6 sm:px-8 text-xs font-black text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">FEATURESET</th>
                                            {displayPlans.map((dp) => (
                                                <th key={dp.rawId} className={`py-4 px-6 sm:px-8 text-xs font-black uppercase tracking-wider border-b border-[#E5E7EB] text-center ${dp.popular ? 'text-[#16A34A] bg-[#C8FF2E]/10' : 'text-[#111827]'}`}>
                                                    {dp.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs font-bold uppercase tracking-wide">
                                        <tr className="hover:bg-[#F7F9FC] transition-colors border-b border-[#E5E7EB]">
                                            <td className="py-4 px-6 sm:px-8 text-[#6B7280]">Branch Limit</td>
                                            {displayPlans.map(dp => (
                                                <td key={dp.rawId} className={`py-4 px-6 sm:px-8 text-center ${dp.popular ? 'text-[#16A34A] font-black bg-[#C8FF2E]/10' : 'text-[#111827]'}`}>{dp.branchLimit} Branch(es)</td>
                                            ))}
                                        </tr>
                                        <tr className="hover:bg-[#F7F9FC] transition-colors border-b border-[#E5E7EB]">
                                            <td className="py-4 px-6 sm:px-8 text-[#6B7280]">Field Bookings Limit</td>
                                            {displayPlans.map(dp => (
                                                <td key={dp.rawId} className={`py-4 px-6 sm:px-8 text-center ${dp.popular ? 'text-[#16A34A] font-black bg-[#C8FF2E]/10' : 'text-[#111827]'}`}>{dp.bookingLimit}</td>
                                            ))}
                                        </tr>
                                        <tr className="hover:bg-[#F7F9FC] transition-colors border-b border-[#E5E7EB]">
                                            <td className="py-4 px-6 sm:px-8 text-[#6B7280]">Sports Categories</td>
                                            {displayPlans.map(dp => (
                                                <td key={dp.rawId} className={`py-4 px-6 sm:px-8 text-center ${dp.popular ? 'text-[#16A34A] font-black bg-[#C8FF2E]/10' : 'text-[#111827]'}`}>{dp.sportsLimit}</td>
                                            ))}
                                        </tr>
                                        <tr className="hover:bg-[#F7F9FC] transition-colors border-b border-[#E5E7EB]">
                                            <td className="py-4 px-6 sm:px-8 text-[#6B7280]">Active Users Limit</td>
                                            {displayPlans.map(dp => (
                                                <td key={dp.rawId} className={`py-4 px-6 sm:px-8 text-center ${dp.popular ? 'text-[#16A34A] font-black bg-[#C8FF2E]/10' : 'text-[#111827]'}`}>{dp.usersLimit}</td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MULTI-STAGE CHECKOUT MODAL */}
            {isCheckoutModalOpen && selectedPlanForRegistration && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/70 backdrop-blur-md pt-16 sm:pt-20 pb-6 px-3 sm:px-6 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white border border-[#E5E7EB] rounded-[24px] max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden text-[#111827] my-auto">
                        
                        {/* Sticky Modal Top Bar & Step Indicators */}
                        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] shrink-0 bg-white relative">
                            <button
                                type="button"
                                onClick={() => setIsCheckoutModalOpen(false)}
                                className="absolute top-4 right-4 text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer p-1.5 rounded-full hover:bg-[#F7F9FC]"
                            >
                                <HiX className="w-5 h-5" />
                            </button>

                            {/* Plan Badge & Header */}
                            <div className="flex flex-wrap items-center gap-2 mb-2 pr-8">
                                <span className="bg-[#C8FF2E] text-[#111827] text-[10px] font-black px-2.5 py-0.5 rounded-md border border-[#B5F000] uppercase tracking-wider">
                                    {selectedPlanForRegistration.name}
                                </span>
                                <span className="text-[11px] font-black text-[#16A34A] uppercase tracking-wider">
                                    ₹{selectedPlanForRegistration.price} {selectedPlanForRegistration.period}
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
                                                <label className="text-[10px] font-bold text-[#16A34A] uppercase">Auto Generated Password</label>
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
                                                    placeholder="e.g. Mumbai"
                                                    value={ownerFormData.city}
                                                    onChange={e => setOwnerFormData({ ...ownerFormData, city: e.target.value })}
                                                    className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">State</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Maharashtra"
                                                    value={ownerFormData.state}
                                                    onChange={e => setOwnerFormData({ ...ownerFormData, state: e.target.value })}
                                                    className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Zip Code</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 400001"
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
                                        onClick={() => setIsCheckoutModalOpen(false)}
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
                                                    {/* UPI Sub-tabs */}
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
                                                            {/* Framed QR Code Graphic */}
                                                            <div className="relative p-3 bg-white border-2 border-emerald-500/50 rounded-2xl shadow-md text-center shrink-0 group">
                                                                <div className="w-36 h-36 bg-slate-950 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                                                                    {/* QR Code Pixel Matrix Simulation */}
                                                                    <div className="w-full h-full border-2 border-dashed border-[#C8FF2E]/60 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                                                                        <HiQrCode className="w-20 h-20 text-[#C8FF2E] animate-pulse" />
                                                                        <span className="text-[8px] font-black text-white uppercase tracking-widest mt-0.5">SCAN & PAY</span>
                                                                    </div>
                                                                    {/* Scan Line Animation */}
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
                                                    {/* Interactive Virtual Card Graphic */}
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

                                                    {/* Card Inputs */}
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
                                                                id="saveCardAutoRenew"
                                                                checked={saveCardForAutoRenew}
                                                                onChange={e => setSaveCardForAutoRenew(e.target.checked)}
                                                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                            />
                                                            <label htmlFor="saveCardAutoRenew" className="text-[10px] font-semibold text-slate-600 cursor-pointer">
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
                                                            { tenure: 3, cost: Math.round(selectedPlanForRegistration.numericPrice / 3) },
                                                            { tenure: 6, cost: Math.round(selectedPlanForRegistration.numericPrice / 6) },
                                                            { tenure: 12, cost: Math.round(selectedPlanForRegistration.numericPrice / 12) },
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
                                                            <span className="font-bold text-slate-900">SportTurfs Technologies Ltd</span>
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
                                                        <span>{selectedPlanForRegistration.name} Access</span>
                                                        <span>INR ₹{selectedPlanForRegistration.price}</span>
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
                                                        <span className="text-2xl font-black text-slate-900">₹{selectedPlanForRegistration.price}</span>
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
                                        <span>Pay ₹{selectedPlanForRegistration.price} & Authorize</span>
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
                                    <div className="bg-slate-900 text-white rounded-2xl p-4.5 space-y-3 border border-slate-800 shadow-xl">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <span className="text-[11px] font-black text-[#C8FF2E] uppercase tracking-wider flex items-center gap-1.5">
                                                🔑 Turf Admin Login Credentials
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={`https://wa.me/?text=${encodeURIComponent(
                                                        `🏆 *SportMatrix Turf Admin Credentials*\n\n` +
                                                        `Hello ${registeredOwnerUser?.name || ownerFormData.fullName}!\n` +
                                                        `Your Turf Admin account for *${ownerFormData.businessName}* is active.\n\n` +
                                                        `📧 *Admin Login ID*: ${registeredOwnerUser?.email || ownerFormData.email}\n` +
                                                        `🔑 *Password*: ${ownerFormData.password}\n` +
                                                        `💼 *Active Plan*: ${subDetails?.planName}\n\n` +
                                                        `🌐 *Login URL*: http://localhost:5173/login`
                                                    )}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer bg-emerald-950/80 px-2 py-1 rounded-lg border border-emerald-500/30"
                                                >
                                                    <span>Share WhatsApp 💬</span>
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`Email: ${registeredOwnerUser?.email || ownerFormData.email}\nPassword: ${ownerFormData.password}`)
                                                        if (addToast) addToast('Credentials copied to clipboard!', 'success')
                                                    }}
                                                    className="text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer bg-slate-800 px-2 py-1 rounded-lg border border-slate-700"
                                                >
                                                    <HiClipboardCopy className="w-3.5 h-3.5 text-[#C8FF2E]" />
                                                    <span>Copy All</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                                            <div className="flex justify-between text-slate-300">
                                                <span>Admin Login ID:</span>
                                                <span className="text-white font-bold">{registeredOwnerUser?.email || ownerFormData.email}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-300">
                                                <span>Password:</span>
                                                <span className="text-[#C8FF2E] font-bold">{ownerFormData.password}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                                                <span>Assigned Turf:</span>
                                                <span className="text-emerald-400 font-bold">{ownerFormData.businessName}</span>
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
            )}
            {/* Official GST Tax Invoice Receipt Modal */}
            {isReceiptModalOpen && (
                <div id="printable-tax-receipt-modal-overlay" className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div id="printable-tax-receipt-card" className="bg-white rounded-3xl max-w-2xl w-full border-2 border-slate-200 overflow-hidden shadow-2xl space-y-0">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-400/30">
                                    MEMBERSHIP PAYMENT RECEIPT
                                </span>
                                <h3 className="text-xl font-black text-white tracking-tight mt-2 flex items-center gap-2">
                                    <span>🧾</span> Payment Receipt & Plan Details
                                </h3>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">INV-2026-849201 · ZERO GST TAX / ALL-INCLUSIVE</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsReceiptModalOpen(false)}
                                className="no-print w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Invoice Body */}
                        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            {/* Grid 1: Customer & Business Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Billed To Customer</span>
                                    <p className="font-extrabold text-slate-900 text-sm">{registeredOwnerUser?.name || ownerFormData.fullName || 'Valued Turf Owner'}</p>
                                    <p className="text-xs font-bold text-slate-700">{ownerFormData.businessName || 'SportMatrix Sports Arena'}</p>
                                    <p className="text-xs font-mono text-slate-500">{registeredOwnerUser?.email || ownerFormData.email || 'info@kiaantechnology.com'}</p>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Subscription Payment Summary</span>
                                    <p className="font-extrabold text-slate-900 text-sm">{subDetails?.planName || selectedPlanForRegistration?.name || 'Professional Plan'}</p>
                                    <p className="text-xs font-mono text-slate-600">Sub Ref: <span className="font-bold text-slate-900">{subDetails?.subId || 'SUB-20491221'}</span></p>
                                    <p className="text-xs font-mono text-slate-600">Txn ID: <span className="font-bold text-slate-900">{subDetails?.txnId || 'TXN-IGC2DQO6'}</span></p>
                                    <p className="text-xs font-mono text-emerald-700 font-bold">Mode: {subDetails?.paymentMethod || 'UPI'} · PAID 🟢</p>
                                    <div className="pt-1.5 border-t border-slate-200 mt-1 flex items-center justify-between text-xs font-mono">
                                        <span className="text-slate-500 font-bold flex items-center gap-1">⏰ Payment Time:</span>
                                        <span className="text-slate-900 font-black bg-emerald-100/80 border border-emerald-300 text-emerald-950 px-2 py-0.5 rounded-md shadow-2xs">
                                            {subDetails?.paidAt || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Itemized Financial Table */}
                            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="py-3 px-4">Item Description</th>
                                            <th className="py-3 px-4 text-center">Billing Cycle</th>
                                            <th className="py-3 px-4 text-right">Tax (GST)</th>
                                            <th className="py-3 px-4 text-right">Net Amount Paid</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-150 font-medium">
                                        <tr>
                                            <td className="py-3.5 px-4">
                                                <div className="font-extrabold text-slate-900">{subDetails?.planName || selectedPlanForRegistration?.name || 'Professional Plan'}</div>
                                                <div className="text-[11px] text-slate-500">Multi-Turf Management Operating System Subscription Pass</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                                                {subDetails?.billingCycle === 'yearly' ? 'Annual Pass' : 'Monthly Pass'}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-bold">₹0.00 (Zero GST)</td>
                                            <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-sm">₹{(subDetails?.numericPrice || selectedPlanForRegistration?.numericPrice || 2499).toLocaleString('en-IN')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Total Paid Banner */}
                            <div className="bg-slate-900 p-4 rounded-2xl text-white flex items-center justify-between shadow-md">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Total Net Amount Paid (Zero GST Tax)</span>
                                    <span className="text-xs text-emerald-400 font-bold">All-Inclusive Subscription Payment Completed</span>
                                </div>
                                <span className="text-3xl font-mono font-black text-[#C8FF2E]">
                                    ₹{(subDetails?.numericPrice || selectedPlanForRegistration?.numericPrice || 2499).toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={downloadReceiptTxt}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-300 flex items-center gap-1.5"
                            >
                                <span>📥 Download Invoice File (.txt)</span>
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={triggerInstantIframePrint}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                                >
                                    <HiPrinter className="w-4 h-4" />
                                    <span>Print Now</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsReceiptModalOpen(false)}
                                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
