import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiCheck, HiStar, HiLightningBolt, HiFire, HiShieldCheck, HiX, HiCheckCircle, HiRefresh, HiClipboardCopy, HiUser, HiOfficeBuilding, HiLocationMarker } from 'react-icons/hi'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { getAllPlans } from '../../services/subscriptionPlanService'
import { createOwner } from '../../services/ownerService'

export default function MembershipPage() {
    const navigate = useNavigate()
    const toastContext = useToast()
    const addToast = toastContext?.addToast
    const { setSession } = useAuth()

    const [dbPlans, setDbPlans] = useState([])
    const [isLoadingPlans, setIsLoadingPlans] = useState(true)
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
        setIsLoadingPlans(true)
        try {
            const res = await getAllPlans()
            if (res && res.success && Array.isArray(res.data)) {
                const active = res.data.filter(p => p.status === 'active')
                setDbPlans(active)
            }
        } catch (err) {
            console.error('Failed to load subscription plans:', err)
        } finally {
            setIsLoadingPlans(false)
        }
    }

    const formatPlanForUI = (p, index) => {
        const isYearly = billingCycle === 'yearly'
        const priceVal = isYearly
            ? (p.yearlyPricing?.price ?? 0)
            : (p.monthlyPricing?.price ?? 0)

        const branchLim = isYearly ? p.yearlyPricing?.branchLimit : p.monthlyPricing?.branchLimit
        const sportsLim = isYearly ? p.yearlyPricing?.sportsLimit : p.monthlyPricing?.sportsLimit
        const bookingLim = isYearly ? p.yearlyPricing?.bookingLimit : p.monthlyPricing?.bookingLimit
        const usersLim = isYearly ? p.yearlyPricing?.activeUsersLimit : p.monthlyPricing?.activeUsersLimit

        const priceStr = priceVal.toLocaleString('en-IN')
        const periodStr = priceVal === 0 ? '/TRIAL' : (isYearly ? '/YR' : '/MO')
        const descStr = p.description || (priceVal === 0 ? 'NO CREDIT CARD REQUIRED' : (p.isPopular ? 'RECOMMENDED FOR PROS' : 'STANDARD OPERATIONAL ACCESS'))

        let color = 'from-blue-500 to-indigo-600'
        let accent = 'blue'
        const pNameLower = (p.planName || '').toLowerCase()

        if (p.isPopular || pNameLower.includes('enterprise') || pNameLower.includes('premium')) {
            color = 'from-[#16a34a] to-emerald-600'
            accent = 'emerald'
        } else if (priceVal === 0 || pNameLower.includes('starter') || pNameLower.includes('free')) {
            color = 'from-slate-500 to-slate-700'
            accent = 'slate'
        } else if (index % 3 === 0) {
            color = 'from-slate-500 to-slate-700'
            accent = 'slate'
        }

        let features = p.features && p.features.length > 0 ? p.features : [
            `${branchLim === -1 ? 'Unlimited' : branchLim} Branch(es) Allowed`,
            `${sportsLim === -1 ? 'Unlimited' : sportsLim} Sports Types`,
            `${bookingLim === -1 ? 'Unlimited' : bookingLim} Field Bookings`,
            `${usersLim === -1 ? 'Unlimited' : usersLim} Active User Accounts`,
            'Standard Platform Support'
        ]

        return {
            rawId: p._id || p.id,
            name: p.planName || 'Access Plan',
            price: priceStr,
            numericPrice: priceVal,
            period: periodStr,
            desc: descStr.toUpperCase(),
            color,
            accent,
            popular: Boolean(p.isPopular),
            features,
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
        <div className="min-h-screen bg-slate-950 pt-20 sm:pt-24 pb-16 sm:pb-20 relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute inset-x-0 top-0 h-[60vh] z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-950/90 to-slate-950" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-emerald-500/5 rounded-full blur-[160px]" />
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full mb-3">
                        <HiFire className="w-3 h-3 text-amber-500" />
                        <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase">Membership Protocols</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg">MEMBERSHIP ACCESS PLANS</h1>
                    <p className="text-xs text-slate-400 max-w-lg mx-auto font-semibold mt-2">Choose the perfect tier for your venue. Manage bookings, multi-branch courts, and analytics.</p>

                    {/* Monthly vs Yearly Billing Toggle */}
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <span className={`text-xs font-black uppercase tracking-wider transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-12 h-6 rounded-full bg-slate-800 border border-white/15 p-1 relative cursor-pointer transition-colors"
                        >
                            <div className={`w-4 h-4 rounded-full bg-emerald-500 transition-transform duration-200 ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500'}`}>
                            Yearly <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">Save 20%</span>
                        </span>
                    </div>
                </div>

                {/* Pricing Grid */}
                {isLoadingPlans ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 my-12">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Loading Membership Plans...</span>
                    </div>
                ) : displayPlans.length === 0 ? (
                    <div className="min-h-[200px] bg-slate-900/60 border border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 max-w-lg mx-auto my-12 text-center">
                        <p className="text-slate-400 text-sm font-semibold mb-2">No active membership plans available right now.</p>
                        <p className="text-slate-500 text-xs">Please check back soon or contact support.</p>
                    </div>
                ) : (
                    <div className={`grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12 items-stretch`}>
                        {displayPlans.map(p => (
                            <div
                                key={p.rawId}
                                className={`relative group flex flex-col bg-slate-900 border transition-all duration-500 hover:-translate-y-1 rounded-2xl h-full ${p.popular
                                    ? 'border-[#16a34a]/40 shadow-[0_15px_35px_rgba(0,0,0,0.5),0_0_15px_rgba(22,163,74,0.1)] z-20'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                {p.popular && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30">
                                        <span className="bg-[#16a34a] text-white text-[9px] font-black px-3.5 py-1 rounded-full shadow-[0_0_15px_rgba(22,163,74,0.3)] tracking-widest uppercase italic">
                                            MOST POPULAR
                                        </span>
                                    </div>
                                )}

                                <div className="p-5 pb-0">
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-4 shadow-xl`}>
                                        {p.accent === 'slate' ? <HiShieldCheck className="w-6 h-6" /> : p.accent === 'blue' ? <HiStar className="w-6 h-6" /> : <HiLightningBolt className="w-6 h-6" />}
                                    </div>
                                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-0.5">{p.name}</h3>
                                    <p className="text-[9px] font-bold text-slate-500 tracking-[0.2em] mb-4">{p.desc}</p>
                                    <div className="flex items-baseline gap-1 mb-4 pb-4 border-b border-white/5">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">INR</span>
                                        <span className="text-4xl font-black text-white tabular-nums tracking-tighter">{p.price}</span>
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{p.period}</span>
                                    </div>
                                </div>

                                <div className="px-5 pb-5 flex-1">
                                    <ul className="space-y-2.5 mb-6">
                                        {p.features.map((f, fidx) => (
                                            <li key={fidx} className="flex items-start gap-2.5 group/item">
                                                <HiCheck className={`w-3.5 h-3.5 mt-0.5 shrink-0 transition-colors ${p.popular ? 'text-[#16a34a]' : 'text-slate-600 group-hover/item:text-white'}`} />
                                                <span className="text-[11px] font-semibold text-slate-400 group-hover/item:text-slate-200 transition-colors uppercase tracking-wide">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-5 pt-0">
                                    <button
                                        onClick={() => handlePlanSelect(p)}
                                        className={`w-full py-3 text-[10px] font-black italic tracking-[0.2em] uppercase rounded-xl border transition-all duration-300 cursor-pointer ${
                                            p.accent === 'slate'
                                                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                                : p.accent === 'blue'
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500/20 text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                                    : 'bg-gradient-to-r from-emerald-500 to-[#16a34a] border-emerald-500/20 text-white hover:from-emerald-400 hover:to-green-500 hover:shadow-[0_0_20px_rgba(22,163,74,0.3)]'
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
                        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-6 sm:p-8 border-b border-white/10 bg-slate-950/50">
                                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                                    <span className="w-1.5 h-6 bg-[#16a34a] rounded-full" />
                                    FEATURESETS COMPARISON
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-slate-950/30">
                                            <th className="py-5 px-6 sm:px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">FEATURESET</th>
                                            {displayPlans.map((dp) => (
                                                <th key={dp.rawId} className={`py-5 px-6 sm:px-8 text-[10px] font-black uppercase tracking-widest border-b border-white/5 text-center ${dp.popular ? 'text-[#16a34a] bg-emerald-500/5' : 'text-slate-500'}`}>
                                                    {dp.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs font-bold uppercase tracking-wider">
                                        <tr className="hover:bg-white/5 transition-colors border-b border-white/5 group">
                                            <td className="py-5 px-6 sm:px-8 text-slate-400 group-hover:text-white">Branch Limit</td>
                                            {displayPlans.map(dp => (
                                                <td key={dp.rawId} className={`py-5 px-6 sm:px-8 text-center ${dp.popular ? 'text-[#16a34a] bg-emerald-500/5' : 'text-slate-300'}`}>{dp.branchLimit} Branch(es)</td>
                                            ))}
                                        </tr>
                                        <tr className="hover:bg-white/5 transition-colors border-b border-white/5 group">
                                            <td className="py-5 px-6 sm:px-8 text-slate-400 group-hover:text-white">Field Bookings Limit</td>
                                            {displayPlans.map(dp => (
                                                <td key={dp.rawId} className={`py-5 px-6 sm:px-8 text-center ${dp.popular ? 'text-[#16a34a] bg-emerald-500/5' : 'text-slate-300'}`}>{dp.bookingLimit}</td>
                                            ))}
                                        </tr>
                                        <tr className="hover:bg-white/5 transition-colors border-b border-white/5 group">
                                            <td className="py-5 px-6 sm:px-8 text-slate-400 group-hover:text-white">Sports Categories</td>
                                            {displayPlans.map(dp => (
                                                <td key={dp.rawId} className={`py-5 px-6 sm:px-8 text-center ${dp.popular ? 'text-[#16a34a] bg-emerald-500/5' : 'text-slate-300'}`}>{dp.sportsLimit}</td>
                                            ))}
                                        </tr>
                                        <tr className="hover:bg-white/5 transition-colors border-b border-white/5 group">
                                            <td className="py-5 px-6 sm:px-8 text-slate-400 group-hover:text-white">Active Users Limit</td>
                                            {displayPlans.map(dp => (
                                                <td key={dp.rawId} className={`py-5 px-6 sm:px-8 text-center ${dp.popular ? 'text-[#16a34a] bg-emerald-500/5' : 'text-slate-300'}`}>{dp.usersLimit}</td>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">
                        
                        {/* Sticky Header */}
                        <div className="p-4 sm:p-6 border-b border-white/10 shrink-0 relative bg-slate-900">
                            <button
                                type="button"
                                onClick={() => setIsRegisterModalOpen(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5"
                            >
                                <HiX className="w-5 h-5" />
                            </button>

                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-2 max-w-[85%] sm:max-w-full">
                                <HiCheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest truncate">
                                    Selected Plan: {selectedPlanForRegistration.name} ({selectedPlanForRegistration.price} INR {selectedPlanForRegistration.period})
                                </span>
                            </div>
                            <h2 className="text-lg sm:text-2xl font-black text-white italic uppercase tracking-tight">OWNER REGISTRATION & ACCOUNT SETUP</h2>
                            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Fill details below to activate your venue admin account.</p>
                        </div>

                        {/* Scrollable Form Body */}
                        <form onSubmit={handleOwnerFormSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

                                {/* Section 1: Personal Information */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                        <HiUser className="w-4 h-4 shrink-0" />
                                        <span>Personal Information</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Full Name *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Rahul Sharma"
                                                value={ownerFormData.fullName}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, fullName: e.target.value })}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Email Address *</label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="rahul@example.com"
                                                value={ownerFormData.email}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, email: e.target.value })}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Mobile Number *</label>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="e.g. 9876543210"
                                                value={ownerFormData.mobile}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, mobile: e.target.value })}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Alternative Mobile</label>
                                            <input
                                                type="tel"
                                                placeholder="e.g. 9876543210"
                                                value={ownerFormData.alternateMobile}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, alternateMobile: e.target.value })}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Auto Generation Field */}
                                    <div className="mt-4 bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3 sm:p-3.5">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-[10px] font-bold text-emerald-400 uppercase">Auto Generated Password</label>
                                            <button
                                                type="button"
                                                onClick={() => setOwnerFormData({ ...ownerFormData, password: generatePassword() })}
                                                className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                                            >
                                                <HiRefresh className="w-3 h-3" />
                                                <span>Regenerate</span>
                                            </button>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input
                                                type="text"
                                                value={ownerFormData.password}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, password: e.target.value })}
                                                className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(ownerFormData.password)
                                                    if (addToast) addToast('Password copied to clipboard', 'info')
                                                }}
                                                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                                            >
                                                <HiClipboardCopy className="w-3.5 h-3.5" />
                                                <span>Copy</span>
                                            </button>
                                        </div>
                                        <p className="text-[9px] text-slate-500 mt-1">This credentials will be used to login into your Owner Admin Dashboard.</p>
                                    </div>
                                </div>

                                {/* Section 2: Business Details */}
                                <div className="border-t border-white/10 pt-4">
                                    <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                        <HiOfficeBuilding className="w-4 h-4 shrink-0" />
                                        <span>Business Details</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Business Name *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Turf Gaming Zone"
                                                value={ownerFormData.businessName}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, businessName: e.target.value })}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Business Type</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Sports & Recreation"
                                                value={ownerFormData.businessType}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, businessType: e.target.value })}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">GST Number</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 22AAAAA1111A1Z1"
                                                value={ownerFormData.gstNumber}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, gstNumber: e.target.value })}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">PAN Number</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. ABCDE1234F"
                                                value={ownerFormData.panNumber}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, panNumber: e.target.value })}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Address Location */}
                                <div className="border-t border-white/10 pt-4">
                                    <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                        <HiLocationMarker className="w-4 h-4 shrink-0" />
                                        <span>Address Location</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Country</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. India"
                                                value={ownerFormData.country}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, country: e.target.value })}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">State</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Maharashtra"
                                                value={ownerFormData.state}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, state: e.target.value })}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">City</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Mumbai"
                                                value={ownerFormData.city}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, city: e.target.value })}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Zip Code</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 400001"
                                                value={ownerFormData.zipCode}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, zipCode: e.target.value })}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Full Address</label>
                                            <textarea
                                                rows={2}
                                                placeholder="Full street address details..."
                                                value={ownerFormData.fullAddress}
                                                onChange={e => setOwnerFormData({ ...ownerFormData, fullAddress: e.target.value })}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Modal Footer / Actions */}
                            <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/90 shrink-0 flex flex-wrap items-center justify-end gap-3 rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={() => setIsRegisterModalOpen(false)}
                                    className="py-2.5 px-4 sm:px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingOwner}
                                    className="py-2.5 px-5 sm:px-6 bg-gradient-to-r from-emerald-500 to-[#16a34a] hover:from-emerald-400 hover:to-green-500 text-white font-black italic tracking-wider text-xs uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(22,163,74,0.3)] cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmittingOwner ? 'CREATING ADMIN DASHBOARD...' : 'SUBMIT & AUTHORIZE PLAN'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* STEP 2: Subscription Plan Authorized Success Modal (Shown AFTER Form Fill) */}
            {isSuccessModalOpen && subDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
                        <button
                            onClick={handleGoToDashboard}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <HiX className="w-5 h-5" />
                        </button>

                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subDetails.color || 'from-[#16a34a] to-emerald-600'} flex items-center justify-center text-white mb-4 shadow-xl mx-auto`}>
                            <HiCheckCircle className="w-9 h-9" />
                        </div>

                        <h3 className="text-xl font-black italic text-center text-white tracking-wider uppercase mb-1">
                            PLAN AUTHORIZED
                        </h3>
                        <p className="text-xs text-center text-emerald-400 font-bold uppercase tracking-widest mb-6">
                            {subDetails.planName} ACTIVE
                        </p>

                        <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4 space-y-3 mb-6 text-xs font-medium">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Subscription Ref</span>
                                <span className="text-emerald-400 font-mono font-bold">{subDetails.subId}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Selected Plan</span>
                                <span className="text-white font-bold">{subDetails.planName}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Billing Amount</span>
                                <span className="text-white font-bold">INR {subDetails.price} {subDetails.period}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-slate-400 font-bold uppercase">Membership Status</span>
                                <span className="text-emerald-400 text-xs font-black uppercase">ACTIVE</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleGoToDashboard}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-[#16a34a] hover:from-emerald-400 hover:to-green-500 text-white font-black italic tracking-wider text-xs uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(22,163,74,0.3)] cursor-pointer text-center"
                            >
                                Go To Dashboard
                            </button>
                            <button
                                onClick={handleGoToDashboard}
                                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center border border-white/10"
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
