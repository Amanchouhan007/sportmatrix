import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiCheck, HiStar, HiLightningBolt, HiFire, HiShieldCheck, HiX, HiCheckCircle, HiRefresh, HiClipboardCopy, HiUser, HiOfficeBuilding, HiLocationMarker } from 'react-icons/hi'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { getAllPlans, defaultFallbackPlans } from '../../services/subscriptionPlanService'
import { createOwner } from '../../services/ownerService'

export default function MembershipPage() {
    const navigate = useNavigate()
    const toastContext = useToast()
    const addToast = toastContext?.addToast
    const { setSession } = useAuth()

    const [dbPlans, setDbPlans] = useState(() => defaultFallbackPlans.filter(p => p.status === 'active'))
    const [isLoadingPlans, setIsLoadingPlans] = useState(false)
    const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' | 'yearly'

    // Owner Registration Modal State
    const [selectedPlanForRegistration, setSelectedPlanForRegistration] = useState(null)
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
    const [isSubmittingOwner, setIsSubmittingOwner] = useState(false)

    // Success Confirmation Modal State (Shown AFTER Form Fill)
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
    const [subDetails, setSubDetails] = useState(null)
    const [registeredOwnerUser, setRegisteredOwnerUser] = useState(null)

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

    const generatePassword = () => {
        const randStr = Math.floor(100000 + Math.random() * 900000)
        return `Pass@${randStr}`
    }

    useEffect(() => {
        window.scrollTo(0, 0)
        fetchSubscriptionPlans()
    }, [])

    const fetchSubscriptionPlans = async () => {
        try {
            const res = await getAllPlans()
            if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                const active = res.data.filter(p => p.status === 'active')
                setDbPlans(active)
            }
        } catch (err) {
            console.error('Failed to load subscription plans:', err)
        }
    }

    const formatPlanForUI = (p, index) => {
        const isYearly = billingCycle === 'yearly'
        const monthlyPrice = p.monthlyPricing?.price ?? (index === 0 ? 999 : index === 1 ? 2499 : 4999)
        const annualPriceWithDiscount = Math.round(monthlyPrice * 12 * 0.8)
        const priceVal = isYearly ? annualPriceWithDiscount : monthlyPrice

        const branchLim = isYearly ? p.yearlyPricing?.branchLimit : p.monthlyPricing?.branchLimit
        const sportsLim = isYearly ? p.yearlyPricing?.sportsLimit : p.monthlyPricing?.sportsLimit
        const bookingLim = isYearly ? p.yearlyPricing?.bookingLimit : p.monthlyPricing?.bookingLimit
        const usersLim = isYearly ? p.yearlyPricing?.activeUsersLimit : p.monthlyPricing?.activeUsersLimit

        const priceStr = priceVal.toLocaleString('en-IN')
        const periodStr = monthlyPrice === 0 ? '/TRIAL' : (isYearly ? '/YEAR' : '/MO')
        const perMonthNote = isYearly && monthlyPrice > 0 
            ? `₹${Math.round(monthlyPrice * 0.8).toLocaleString('en-IN')}/mo · Save ₹${Math.round(monthlyPrice * 12 * 0.2).toLocaleString('en-IN')}/yr (20% OFF)` 
            : null

        const descStr = p.description || (monthlyPrice === 0 ? 'NO CREDIT CARD REQUIRED' : (p.isPopular ? 'RECOMMENDED FOR PROS' : 'STANDARD OPERATIONAL ACCESS'))

        let color = 'from-emerald-500 to-teal-600'
        let accent = 'emerald'
        const pNameLower = (p.planName || '').toLowerCase()

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

        let features = p.features && p.features.length > 0 ? p.features : baseFeatures

        return {
            rawId: p._id || p.id,
            name: p.planName || 'Access Plan',
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
        setIsRegisterModalOpen(true)
    }

    // Step 2: Submit Form & Show Plan Authorized Success Modal
    const handleOwnerFormSubmit = async (e) => {
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

        setIsSubmittingOwner(true)
        try {
            const payload = {
                ...ownerFormData,
                confirmPassword: ownerFormData.password,
                role: 'OWNER',
                planId: selectedPlanForRegistration?.rawId,
                planName: selectedPlanForRegistration?.name
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
                    subId: `SUB-${Math.floor(100000 + Math.random() * 900000)}`,
                    planName: selectedPlanForRegistration?.name,
                    price: selectedPlanForRegistration?.price,
                    period: selectedPlanForRegistration?.period,
                    color: selectedPlanForRegistration?.color || 'from-[#16a34a] to-emerald-600'
                })

                setIsRegisterModalOpen(false)
                setIsSuccessModalOpen(true)

                if (addToast) {
                    addToast(`Plan Authorized & Account Created Successfully!`, 'success')
                }
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Owner registration failed'
            if (addToast) addToast(errMsg, 'error')
        } finally {
            setIsSubmittingOwner(false)
        }
    }

    const handleGoToDashboard = () => {
        setIsSuccessModalOpen(false)
        navigate('/login', {
            state: {
                email: registeredOwnerUser?.email,
                role: 'owner'
            }
        })
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

                    {/* Monthly vs Yearly Billing Toggle with Light UI Theme, Boundaries & Hover Highlights */}
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
                            <div className={`w-4.5 h-4.5 rounded-full bg-[#10B981] shadow-md transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-6 bg-[#16A34A]' : 'translate-x-0 bg-slate-600'}`} />
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
                                className={`relative group flex flex-col bg-white border transition-all duration-300 hover:-translate-y-1 rounded-2xl h-full shadow-[0_10px_30px_rgba(0,0,0,0.03)] ${p.popular
                                    ? 'border-[#C8FF2E] ring-2 ring-[#C8FF2E] shadow-[0_15px_35px_rgba(200,255,46,0.25)] z-20'
                                    : 'border-[#E5E7EB] hover:border-[#C8FF2E]'
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
                                        className={`w-full py-3 text-xs font-black tracking-wider uppercase rounded-xl transition-all duration-300 cursor-pointer active:scale-95 ${
                                            p.popular
                                                ? 'bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] border border-[#B5F000] shadow-sm'
                                                : 'bg-[#F7F9FC] hover:bg-[#E5E7EB] text-[#111827] border border-[#E5E7EB]'
                                        }`}
                                    >
                                        {p.numericPrice === 0 ? 'START FREE TRIAL' : `AUTHORIZE ${p.name}`}
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

            {/* STEP 1: Fully Responsive Owner Registration Form Modal */}
            {isRegisterModalOpen && selectedPlanForRegistration && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/65 backdrop-blur-sm pt-20 sm:pt-24 pb-6 px-3 sm:px-6 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white border border-[#E5E7EB] rounded-[20px] sm:rounded-[24px] max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[80vh] overflow-hidden text-[#111827] my-auto">
                        
                        {/* Sticky Header */}
                        <div className="p-3.5 sm:p-5 border-b border-[#E5E7EB] shrink-0 relative bg-white">
                            <button
                                type="button"
                                onClick={() => setIsRegisterModalOpen(false)}
                                className="absolute top-3.5 right-3.5 text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer p-1.5 rounded-full hover:bg-[#F7F9FC]"
                            >
                                <HiX className="w-5 h-5" />
                            </button>

                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F7F9FC] border border-[#E5E7EB] rounded-full mb-1.5 max-w-[85%] sm:max-w-full">
                                <HiCheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                                <span className="text-[10px] font-black text-[#111827] uppercase tracking-wider truncate">
                                    Selected Plan: {selectedPlanForRegistration.name} ({selectedPlanForRegistration.price} INR {selectedPlanForRegistration.period})
                                </span>
                            </div>
                            <h2 className="text-base sm:text-xl md:text-2xl font-black text-[#111827] uppercase tracking-tight pr-8">OWNER REGISTRATION & ACCOUNT SETUP</h2>
                            <p className="text-[10px] sm:text-xs text-[#6B7280] mt-0.5 font-semibold">Fill details below to activate your venue admin account.</p>
                        </div>

                        {/* Scrollable Form Body */}
                        <form onSubmit={handleOwnerFormSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                            <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-6 space-y-5 custom-scrollbar">

                                {/* Section 1: Personal Information */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-[#16A34A] font-bold text-xs uppercase tracking-wider">
                                        <HiUser className="w-4 h-4 shrink-0" />
                                        <span>Personal Information</span>
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
                                                className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#C8FF2E] font-bold"
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
                                                className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#C8FF2E] font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Alternative Mobile</label>
                                            <input
                                                type="tel"
                                                placeholder="e.g. 9876543210"
                                                value={ownerFormData.alternateMobile}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, alternateMobile: e.target.value })}
                                                className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#C8FF2E] font-bold"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Auto Generation Field */}
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
                                        <p className="text-[9px] text-[#6B7280] mt-1 font-semibold">This credentials will be used to login into your Owner Admin Dashboard.</p>
                                    </div>
                                </div>

                                {/* Section 2: Business Details */}
                                <div className="border-t border-[#E5E7EB] pt-4">
                                    <div className="flex items-center gap-2 mb-3 text-[#16A34A] font-bold text-xs uppercase tracking-wider">
                                        <HiOfficeBuilding className="w-4 h-4 shrink-0" />
                                        <span>Business Details</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Business Name *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Turf Gaming Zone"
                                                value={ownerFormData.businessName}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, businessName: e.target.value })}
                                                className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#C8FF2E] font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Business Type</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Sports & Recreation"
                                                value={ownerFormData.businessType}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, businessType: e.target.value })}
                                                className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#C8FF2E] font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">GST Number</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 22AAAAA1111A1Z1"
                                                value={ownerFormData.gstNumber}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, gstNumber: e.target.value })}
                                                className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#C8FF2E] font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">PAN Number</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. ABCDE1234F"
                                                value={ownerFormData.panNumber}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, panNumber: e.target.value })}
                                                className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#C8FF2E] font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Address Location */}
                                <div className="border-t border-[#E5E7EB] pt-4">
                                    <div className="flex items-center gap-2 mb-3 text-[#16A34A] font-bold text-xs uppercase tracking-wider">
                                        <HiLocationMarker className="w-4 h-4 shrink-0" />
                                        <span>Address Location</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Country</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. India"
                                                value={ownerFormData.country}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, country: e.target.value })}
                                                className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#C8FF2E] font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">State</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Maharashtra"
                                                value={ownerFormData.state}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, state: e.target.value })}
                                                className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#C8FF2E] font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">City</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Mumbai"
                                                value={ownerFormData.city}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, city: e.target.value })}
                                                className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#C8FF2E] font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Zip Code</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 400001"
                                                value={ownerFormData.zipCode}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, zipCode: e.target.value })}
                                                className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#C8FF2E] font-bold"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-[10px] font-bold text-[#111827] uppercase mb-1">Full Address</label>
                                            <textarea
                                                rows={2}
                                                placeholder="Full street address details..."
                                                value={ownerFormData.fullAddress}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, fullAddress: e.target.value })}
                                                className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#C8FF2E] resize-none font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Modal Footer / Actions */}
                            <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-[#F7F9FC] shrink-0 flex flex-wrap items-center justify-end gap-3 rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={() => setIsRegisterModalOpen(false)}
                                    className="py-2.5 px-4 sm:px-5 bg-white hover:bg-[#E5E7EB] text-[#111827] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer border border-[#E5E7EB]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingOwner}
                                    className="py-2.5 px-5 sm:px-6 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black tracking-wider text-xs uppercase rounded-xl transition-all border border-[#B5F000] shadow-sm cursor-pointer disabled:opacity-50 active:scale-95"
                                >
                                    {isSubmittingOwner ? 'CREATING ADMIN DASHBOARD...' : 'SUBMIT & AUTHORIZE PLAN'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* STEP 2: Subscription Plan Authorized Success Modal */}
            {isSuccessModalOpen && subDetails && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 backdrop-blur-sm pt-20 sm:pt-24 pb-6 px-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-[#111827]">
                        <button
                            onClick={handleGoToDashboard}
                            className="absolute top-4 right-4 text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
                        >
                            <HiX className="w-5 h-5" />
                        </button>

                        <div className="w-14 h-14 rounded-2xl bg-[#C8FF2E] border border-[#B5F000] flex items-center justify-center text-[#111827] mb-4 shadow-md mx-auto">
                            <HiCheckCircle className="w-9 h-9 text-[#16A34A]" />
                        </div>

                        <h3 className="text-xl font-black text-center text-[#111827] tracking-tight uppercase mb-1">
                            PLAN AUTHORIZED
                        </h3>
                        <p className="text-xs text-center text-[#16A34A] font-black uppercase tracking-wider mb-6">
                            {subDetails.planName} ACTIVE
                        </p>

                        <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl p-4 space-y-3 mb-6 text-xs font-bold">
                            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                                <span className="text-[#6B7280]">Subscription Ref</span>
                                <span className="text-[#16A34A] font-mono font-bold">{subDetails.subId}</span>
                            </div>
                            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                                <span className="text-[#6B7280]">Selected Plan</span>
                                <span className="text-[#111827] font-bold">{subDetails.planName}</span>
                            </div>
                            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                                <span className="text-[#6B7280]">Billing Amount</span>
                                <span className="text-[#111827] font-bold">INR {subDetails.price} {subDetails.period}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-[#6B7280] font-bold uppercase">Membership Status</span>
                                <span className="text-[#16A34A] text-xs font-black uppercase">ACTIVE</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleGoToDashboard}
                                className="flex-1 py-3 px-4 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black tracking-wider text-xs uppercase rounded-xl transition-all border border-[#B5F000] shadow-sm cursor-pointer text-center active:scale-95"
                            >
                                Go To Dashboard
                            </button>
                            <button
                                onClick={handleGoToDashboard}
                                className="flex-1 py-3 px-4 bg-[#F7F9FC] hover:bg-[#E5E7EB] text-[#111827] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center border border-[#E5E7EB]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
