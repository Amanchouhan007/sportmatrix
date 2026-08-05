import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'
import {
    FiCheck, FiArrowLeft, FiTag, FiEye, FiPlusCircle,
    FiCalendar, FiMapPin, FiDollarSign, FiInfo, FiChevronRight, FiChevronLeft, FiSave, FiExternalLink, FiVideo, FiImage, FiLayers, FiTarget, FiTrendingUp, FiActivity
} from 'react-icons/fi'

export default function CreateAdvertisement() {
    const navigate = useNavigate()
    const { addToast } = useToast()

    // 1. Campaign Type State: 'guaranteed_booking' | 'impression_ad'
    const [campaignType, setCampaignType] = useState('guaranteed_booking')

    // 2. Wizard Step State
    const [currentStep, setCurrentStep] = useState(1)

    // 3. Form Data State
    const [formData, setFormData] = useState({
        // Common Fields
        campaignName: 'Champions Night Drive Promo',
        turfId: 'turf-1',
        turfName: 'Champions Turf Arena (Mumbai)',
        location: 'Mumbai Suburban',
        startDate: '2026-08-02',
        endDate: '2026-09-02',
        description: 'Boost evening slot bookings between 6PM-10PM for weekend customers.',

        // Guaranteed Booking Fields
        commissionPercent: '15',
        minBookingGoal: '30',
        avgBookingPrice: '1500',
        targetArea: '5',

        // Impression Ad Fields
        campaignBudget: '5000',
        dailyBudget: '500',
        pricingModel: 'CPM',
        cpmRate: '50', // ₹50 per 1,000 Impressions
        placements: ['Homepage Banner', 'Search Bar Banner'],
        adTitle: 'Champions Arena Weekend Floodlight Pass',
        shortHeadline: 'Get 20% Off Prime Evening Turf Slots',
        adDescription: 'Book premium synthetic grass turf for evening cricket & football matches under FIFA-standard floodlights.',
        callToAction: 'Book Now',
        redirectUrl: 'https://sportmatrix.in/turfs/champions-arena',
        bannerImage: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800',
        mobileBannerImage: '',
        thumbnailImage: '',
        promotionalVideo: '',
        campaignStatus: 'Active'
    })

    // Duration Preset State
    const [durationPreset, setDurationPreset] = useState('1m')

    // Dynamic Stepper Tabs based on selected campaignType
    const steps = campaignType === 'guaranteed_booking' ? [
        { step: 1, title: 'Select Type', subtitle: 'Choose Model' },
        { step: 2, title: 'Campaign Details', subtitle: 'Turf & Schedule' },
        { step: 3, title: 'Booking Rules', subtitle: 'Commission & Goal' },
        { step: 4, title: 'Review & Publish', subtitle: 'Financial Summary' }
    ] : [
        { step: 1, title: 'Select Type', subtitle: 'Choose Model' },
        { step: 2, title: 'Campaign Details', subtitle: 'Turf & Schedule' },
        { step: 3, title: 'Budget & Target', subtitle: 'CPM & Reach' },
        { step: 4, title: 'Ad Details & Creative', subtitle: 'Banners & Copy' },
        { step: 5, title: 'Review & Publish', subtitle: 'Live Preview & Launch' }
    ]

    const handleCampaignTypeSelect = (type) => {
        setCampaignType(type)
        if (type === 'guaranteed_booking' && currentStep > 4) {
            setCurrentStep(4)
        }
    }

    const handleTurfSelect = (turfId) => {
        let turfName = 'Champions Turf Arena (Mumbai)'
        if (turfId === 'turf-2') turfName = 'SkyLine Football Turf (Pune)'
        else if (turfId === 'turf-3') turfName = 'Velocity Sports Hub (Bangalore)'
        setFormData(prev => ({ ...prev, turfId, turfName }))
    }

    const togglePlacement = (placement) => {
        setFormData(prev => {
            const current = prev.placements || []
            if (current.includes(placement)) {
                return { ...prev, placements: current.filter(p => p !== placement) }
            } else {
                return { ...prev, placements: [...current, placement] }
            }
        })
    }

    // File Upload Handler (FileReader Data URL)
    const handleFileUpload = (field, e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result }))
                addToast({ message: `${field} uploaded successfully!`, type: 'success' })
            }
            reader.readAsDataURL(file)
        }
    }

    // Duration Preset Handler
    const handleDurationPresetChange = (presetValue) => {
        setDurationPreset(presetValue)
        if (presetValue === 'custom') return

        const start = formData.startDate ? new Date(formData.startDate) : new Date()
        const end = new Date(start)

        if (presetValue === '1m') end.setMonth(end.getMonth() + 1)
        else if (presetValue === '2m') end.setMonth(end.getMonth() + 2)
        else if (presetValue === '3m') end.setMonth(end.getMonth() + 3)
        else if (presetValue === '6m') end.setMonth(end.getMonth() + 6)
        else if (presetValue === '1y') end.setFullYear(end.getFullYear() + 1)

        setFormData(prev => ({
            ...prev,
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        }))
    }

    const handleStartDateChange = (val) => {
        if (durationPreset !== 'custom') {
            const start = new Date(val)
            const end = new Date(start)
            if (durationPreset === '1m') end.setMonth(end.getMonth() + 1)
            else if (durationPreset === '2m') end.setMonth(end.getMonth() + 2)
            else if (durationPreset === '3m') end.setMonth(end.getMonth() + 3)
            else if (durationPreset === '6m') end.setMonth(end.getMonth() + 6)
            else if (durationPreset === '1y') end.setFullYear(end.getFullYear() + 1)
            setFormData(prev => ({ ...prev, startDate: val, endDate: end.toISOString().split('T')[0] }))
        } else {
            setFormData(prev => ({ ...prev, startDate: val }))
        }
    }

    const handleEndDateChange = (val) => {
        setDurationPreset('custom')
        setFormData(prev => ({ ...prev, endDate: val }))
    }

    // Calculate duration in days
    const calculateDuration = () => {
        if (!formData.startDate || !formData.endDate) return 30
        const start = new Date(formData.startDate)
        const end = new Date(formData.endDate)
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        return diff > 0 ? diff : 1
    }

    const formatDurationText = (days) => {
        if (days >= 28 && days <= 32) return `${days} Days (1 Month)`
        if (days >= 58 && days <= 62) return `${days} Days (2 Months)`
        if (days >= 88 && days <= 93) return `${days} Days (3 Months)`
        if (days >= 178 && days <= 184) return `${days} Days (6 Months)`
        if (days >= 360 && days <= 366) return `${days} Days (1 Year)`
        const months = Math.floor(days / 30)
        if (months > 0) return `${days} Days (~${months} Months)`
        return `${days} Days`
    }

    const durationDays = calculateDuration()

    // Guaranteed Booking Calculations
    const expectedBookings = Number(formData.minBookingGoal || 30)
    const bookingPrice = Number(formData.avgBookingPrice || 1500)
    const grossRevenue = expectedBookings * bookingPrice
    const commissionAmount = Math.round((grossRevenue * Number(formData.commissionPercent || 15)) / 100)
    const netOwnerRevenue = grossRevenue - commissionAmount
    const estimatedReach = Number(formData.targetArea || 5) * 2500

    // Impression Ad Calculations
    const totalBudget = Number(formData.campaignBudget || 5000)
    const cpmRate = Number(formData.cpmRate || 50)
    const estimatedImpressions = cpmRate > 0 ? Math.round((totalBudget / cpmRate) * 1000) : 100000
    const estimatedAudience = Number(formData.targetArea || 5) * 3500

    // Strict Dynamic Validation per Step & Model
    const validateStep = () => {
        if (currentStep === 1) {
            if (!campaignType) {
                addToast({ message: 'Please select a campaign type!', type: 'error' })
                return false
            }
            return true
        }

        if (currentStep === 2) {
            if (!formData.campaignName.trim()) {
                addToast({ message: 'Campaign Name is required!', type: 'error' })
                return false
            }
            if (!formData.turfId) {
                addToast({ message: 'Please select a Turf!', type: 'error' })
                return false
            }
            if (!formData.startDate || !formData.endDate) {
                addToast({ message: 'Start Date and End Date are required!', type: 'error' })
                return false
            }
            if (new Date(formData.endDate) < new Date(formData.startDate)) {
                addToast({ message: 'End Date cannot be before Start Date!', type: 'error' })
                return false
            }
            return true
        }

        if (campaignType === 'guaranteed_booking') {
            if (currentStep === 3) {
                if (!formData.commissionPercent || Number(formData.commissionPercent) <= 0) {
                    addToast({ message: 'Commission % is required and must be greater than 0!', type: 'error' })
                    return false
                }
                if (!formData.minBookingGoal || Number(formData.minBookingGoal) <= 0) {
                    addToast({ message: 'Minimum Booking Goal is required!', type: 'error' })
                    return false
                }
                if (!formData.avgBookingPrice || Number(formData.avgBookingPrice) <= 0) {
                    addToast({ message: 'Average Slot Price is required!', type: 'error' })
                    return false
                }
                return true
            }
        } else if (campaignType === 'impression_ad') {
            if (currentStep === 3) {
                if (!formData.campaignBudget || Number(formData.campaignBudget) <= 0) {
                    addToast({ message: 'Campaign Budget is required!', type: 'error' })
                    return false
                }
                if (!formData.dailyBudget || Number(formData.dailyBudget) <= 0) {
                    addToast({ message: 'Daily Budget is required!', type: 'error' })
                    return false
                }
                if (!formData.cpmRate || Number(formData.cpmRate) <= 0) {
                    addToast({ message: 'CPM Rate is required!', type: 'error' })
                    return false
                }
                return true
            }

            if (currentStep === 4) {
                if (!formData.adTitle.trim()) {
                    addToast({ message: 'Ad Title is required!', type: 'error' })
                    return false
                }
                if (!formData.shortHeadline.trim()) {
                    addToast({ message: 'Short Headline is required!', type: 'error' })
                    return false
                }
                if (!formData.adDescription.trim()) {
                    addToast({ message: 'Ad Description is required!', type: 'error' })
                    return false
                }
                if (!formData.bannerImage) {
                    addToast({ message: 'Desktop Banner Image is required!', type: 'error' })
                    return false
                }
                return true
            }
        }

        return true
    }

    const handleNextStep = () => {
        if (!validateStep()) return
        if (currentStep < steps.length) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handleSubmit = (e) => {
        e?.preventDefault()
        if (!validateStep()) return
        addToast({ message: `Campaign "${formData.campaignName}" published successfully & sent for review!`, type: 'success' })
        navigate('/admin/ads')
    }

    const handleSaveDraft = () => {
        addToast({ message: `Campaign draft "${formData.campaignName}" saved successfully!`, type: 'info' })
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-emerald-500 text-white'
            case 'Draft':
                return 'bg-slate-500 text-white'
            case 'Paused':
                return 'bg-amber-500 text-white'
            case 'Scheduled':
                return 'bg-blue-500 text-white'
            default:
                return 'bg-emerald-500 text-white'
        }
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto bg-[#F4F7FC] p-6 rounded-3xl min-h-screen animate-in fade-in duration-500 pb-28">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/ads')}
                        className="p-3 rounded-2xl bg-surface-100 hover:bg-surface-200 text-surface-600 transition-colors cursor-pointer"
                    >
                        <FiArrowLeft className="text-xl" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                            📢 Create New Campaign
                        </h1>
                        <p className="text-surface-500 text-sm mt-0.5 font-medium">Launch a targeted marketing campaign based on your business model.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs font-bold text-emerald-700 shadow-sm">
                    ⏱️ Setup Time: <span className="text-emerald-800 font-extrabold">2 Minutes</span>
                </div>
            </div>

            {/* Dynamic Stepper Bar */}
            <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className={`grid grid-cols-2 ${steps.length === 5 ? 'sm:grid-cols-5' : 'sm:grid-cols-4'} gap-2 relative`}>
                    {steps.map((s) => {
                        const isCompleted = currentStep > s.step
                        const isCurrent = currentStep === s.step
                        return (
                            <div
                                key={s.step}
                                onClick={() => setCurrentStep(s.step)}
                                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                                    isCurrent
                                        ? 'bg-emerald-50/80 border border-emerald-200/80 text-emerald-800'
                                        : isCompleted
                                        ? 'bg-surface-50 text-emerald-700'
                                        : 'text-surface-400 opacity-60'
                                }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                                        isCompleted
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : isCurrent
                                            ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100'
                                            : 'bg-surface-200 text-surface-600'
                                    }`}
                                >
                                    {isCompleted ? '✓' : s.step}
                                </div>
                                <div className="hidden md:block truncate">
                                    <div className="font-extrabold text-xs tracking-tight truncate">{s.title}</div>
                                    <div className="text-[10px] font-medium text-surface-400 truncate">{s.subtitle}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Wizard Panel */}
                <div className="lg:col-span-7 space-y-6">
                    {/* STEP 1: Select Campaign Type */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="space-y-3">
                                <h2 className="text-lg font-black text-surface-900 tracking-tight">Step 1: Select Campaign Type</h2>
                                <p className="text-xs text-surface-500 font-medium">Choose the campaign model that fits your turf strategy.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Card 1: Guaranteed Booking */}
                                <div
                                    onClick={() => handleCampaignTypeSelect('guaranteed_booking')}
                                    className={`p-6 rounded-3xl cursor-pointer relative overflow-hidden transition-all duration-300 border ${
                                        campaignType === 'guaranteed_booking'
                                            ? 'bg-gradient-to-b from-white to-emerald-50/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl scale-[1.02]'
                                            : 'bg-white border-surface-200/80 hover:border-emerald-300 hover:shadow-md'
                                    }`}
                                >
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold absolute top-4 right-4">
                                        ★ Commission Model
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl mb-4 shadow-inner">
                                        <FiTag />
                                    </div>
                                    <h3 className="font-black text-surface-900 text-base">Guaranteed Booking</h3>
                                    <p className="text-xs font-medium text-surface-500 mt-1.5 leading-relaxed">
                                        Commission-based model guaranteeing minimum court bookings. No upfront ad creative setup needed.
                                    </p>
                                    <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-xs font-bold">
                                        <span className="text-emerald-600">Booking Driven</span>
                                        {campaignType === 'guaranteed_booking' && <span className="text-emerald-700 font-black">✓ Selected (4 Steps)</span>}
                                    </div>
                                </div>

                                {/* Card 2: Impression Ad */}
                                <div
                                    onClick={() => handleCampaignTypeSelect('impression_ad')}
                                    className={`p-6 rounded-3xl cursor-pointer relative overflow-hidden transition-all duration-300 border ${
                                        campaignType === 'impression_ad'
                                            ? 'bg-gradient-to-b from-white to-amber-50/40 border-amber-500 ring-2 ring-amber-500/20 shadow-xl scale-[1.02]'
                                            : 'bg-white border-surface-200/80 hover:border-amber-300 hover:shadow-md'
                                    }`}
                                >
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold absolute top-4 right-4">
                                        🚀 Max Exposure
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-2xl mb-4 shadow-inner">
                                        <FiEye />
                                    </div>
                                    <h3 className="font-black text-surface-900 text-base">Impression Ad</h3>
                                    <p className="text-xs font-medium text-surface-500 mt-1.5 leading-relaxed">
                                        High-visibility banner & video ad campaign charged on CPM basis. Full banner & creative setup.
                                    </p>
                                    <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-xs font-bold">
                                        <span className="text-amber-600">CPM Banners</span>
                                        {campaignType === 'impression_ad' && <span className="text-amber-700 font-black">✓ Selected (5 Steps)</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Campaign Details (Common) */}
                    {currentStep === 2 && (
                        <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-300">
                            <div className="border-b border-surface-150 pb-4">
                                <h2 className="text-lg font-black text-surface-900 tracking-tight">Step 2: Campaign & Turf Details</h2>
                                <p className="text-xs text-surface-500 font-medium">Configure campaign identity, target turf, and active schedule dates.</p>
                            </div>

                            <div className="space-y-4 bg-surface-50/60 p-5 rounded-2xl border border-surface-200/60">
                                <h3 className="text-xs font-extrabold text-surface-800 uppercase tracking-wider flex items-center gap-2">
                                    🏟️ Turf Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-surface-700 mb-1.5">Campaign Name *</label>
                                        <input
                                            type="text"
                                            value={formData.campaignName}
                                            onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                                            placeholder="Enter campaign title"
                                            className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    <Select
                                        label="Select Turf *"
                                        value={formData.turfId}
                                        onChange={(e) => handleTurfSelect(e.target.value)}
                                    >
                                        <option value="turf-1">Champions Turf Arena (Mumbai)</option>
                                        <option value="turf-2">SkyLine Football Turf (Pune)</option>
                                        <option value="turf-3">Velocity Sports Hub (Bangalore)</option>
                                    </Select>
                                </div>
                            </div>

                            {/* Section 2: 📅 Campaign Schedule & Dates */}
                            <div className="space-y-5 bg-surface-50/60 p-5 rounded-2xl border border-surface-200/60">
                                <h3 className="text-xs font-extrabold text-surface-800 uppercase tracking-wider flex items-center gap-2">
                                    📅 Campaign Schedule & Dates
                                </h3>

                                <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-sm space-y-3">
                                    <Select
                                        label="Select Campaign Duration (1 Month, 2 Months, 3 Months, 6 Months, 1 Year) *"
                                        value={durationPreset}
                                        onChange={(e) => handleDurationPresetChange(e.target.value)}
                                        className="w-full"
                                    >
                                        <option value="1m">1 Month (30 Days)</option>
                                        <option value="2m">2 Months (60 Days)</option>
                                        <option value="3m">3 Months (90 Days)</option>
                                        <option value="6m">6 Months (180 Days)</option>
                                        <option value="1y">1 Year (365 Days)</option>
                                        <option value="custom">Custom Date Range (Manual Start & End Date)</option>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        type="date"
                                        label="Start Date *"
                                        value={formData.startDate}
                                        onChange={(e) => handleStartDateChange(e.target.value)}
                                    />
                                    <Input
                                        type="date"
                                        label="End Date *"
                                        value={formData.endDate}
                                        onChange={(e) => handleEndDateChange(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-surface-700">Campaign Goal & Description</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe campaign goals and target expectations..."
                                    className="w-full p-4 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-surface-400 font-medium"
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 3 for Guaranteed Booking: Booking Rules & Commission */}
                    {campaignType === 'guaranteed_booking' && currentStep === 3 && (
                        <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-300">
                            <div className="border-b border-surface-150 pb-4">
                                <h2 className="text-lg font-black text-surface-900 tracking-tight">Step 3: Booking Rules & Commission</h2>
                                <p className="text-xs text-surface-500 font-medium">Set commission percentage and minimum booking performance goals.</p>
                            </div>

                            <div className="space-y-4 bg-surface-50/60 p-5 rounded-2xl border border-surface-200/60">
                                <h3 className="text-xs font-extrabold text-surface-800 uppercase tracking-wider flex items-center gap-2">
                                    💰 Commission & Financial Rules
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Input
                                        type="number"
                                        label="Commission % *"
                                        value={formData.commissionPercent}
                                        onChange={(e) => setFormData({ ...formData, commissionPercent: e.target.value })}
                                    />
                                    <Input
                                        type="number"
                                        label="Minimum Booking Goal *"
                                        value={formData.minBookingGoal}
                                        onChange={(e) => setFormData({ ...formData, minBookingGoal: e.target.value })}
                                    />
                                    <Input
                                        type="number"
                                        label="Average Slot Price (₹) *"
                                        value={formData.avgBookingPrice}
                                        onChange={(e) => setFormData({ ...formData, avgBookingPrice: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <Input
                                        type="number"
                                        label="Target Radius (KM) *"
                                        value={formData.targetArea}
                                        onChange={(e) => setFormData({ ...formData, targetArea: e.target.value })}
                                    />
                                    <div>
                                        <label className="block text-xs font-bold text-surface-700 mb-1.5">Estimated Audience Reach</label>
                                        <div className="px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-sm font-black flex items-center gap-2">
                                            🚀 ~{estimatedReach.toLocaleString()} Sports Enthusiasts Nearby
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 for Impression Ad: Budget & Target */}
                    {campaignType === 'impression_ad' && currentStep === 3 && (
                        <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-300">
                            <div className="border-b border-surface-150 pb-4">
                                <h2 className="text-lg font-black text-surface-900 tracking-tight">Step 3: Budget & Target Settings</h2>
                                <p className="text-xs text-surface-500 font-medium">Configure campaign budget, CPM rate, ad placement slots, and geographic radius.</p>
                            </div>

                            <div className="space-y-4 bg-surface-50/60 p-5 rounded-2xl border border-surface-200/60">
                                <h3 className="text-xs font-extrabold text-surface-800 uppercase tracking-wider flex items-center gap-2">
                                    💳 Budget & CPM Rates
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Input
                                        type="number"
                                        label="Campaign Budget (₹) *"
                                        value={formData.campaignBudget}
                                        onChange={(e) => setFormData({ ...formData, campaignBudget: e.target.value })}
                                    />
                                    <Input
                                        type="number"
                                        label="Daily Budget (₹) *"
                                        value={formData.dailyBudget}
                                        onChange={(e) => setFormData({ ...formData, dailyBudget: e.target.value })}
                                    />
                                    <Input
                                        type="number"
                                        label="CPM Rate (₹ per 1k) *"
                                        value={formData.cpmRate}
                                        onChange={(e) => setFormData({ ...formData, cpmRate: e.target.value })}
                                    />
                                </div>

                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-900 text-xs font-bold flex items-center justify-between">
                                    <span>Estimated Ad Impressions:</span>
                                    <span className="text-sm font-black text-amber-700">👁️ ~{estimatedImpressions.toLocaleString()} Impressions</span>
                                </div>

                                {/* Ad Placements */}
                                <div className="space-y-2 pt-2">
                                    <label className="block text-xs font-bold text-surface-700">Ad Placements</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {['Homepage Banner', 'Search Bar Banner', 'Featured Turf Banner', 'Nearby Turf Banner'].map(placement => (
                                            <button
                                                key={placement}
                                                type="button"
                                                onClick={() => togglePlacement(placement)}
                                                className={`p-3 rounded-xl text-xs font-extrabold transition-all border text-left ${
                                                    formData.placements.includes(placement)
                                                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                                                        : 'bg-white text-surface-600 border-surface-200 hover:bg-surface-100'
                                                }`}
                                            >
                                                {formData.placements.includes(placement) ? '✓ ' : ''}{placement}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <Input
                                        type="number"
                                        label="Target Radius (KM) *"
                                        value={formData.targetArea}
                                        onChange={(e) => setFormData({ ...formData, targetArea: e.target.value })}
                                    />
                                    <div>
                                        <label className="block text-xs font-bold text-surface-700 mb-1.5">Estimated Audience</label>
                                        <div className="px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-sm font-black flex items-center gap-2">
                                            🚀 ~{estimatedAudience.toLocaleString()} Nearby Sports Users
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4 for Impression Ad ONLY: Ad Details & Creative */}
                    {campaignType === 'impression_ad' && currentStep === 4 && (
                        <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-300">
                            <div className="border-b border-surface-150 pb-4 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-black text-surface-900 tracking-tight flex items-center gap-2">
                                        🎨 Step 4: Ad Details & Creative Media
                                    </h2>
                                    <p className="text-xs text-surface-500 font-medium">Add ad copy, graphics banners, CTA buttons, and video media.</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getStatusBadge(formData.campaignStatus)}`}>
                                    {formData.campaignStatus}
                                </span>
                            </div>

                            {/* Section 1: Ad Text & Content */}
                            <div className="space-y-4 bg-surface-50/60 p-5 rounded-2xl border border-surface-200/60">
                                <h3 className="text-xs font-extrabold text-surface-800 uppercase tracking-wider flex items-center gap-2">
                                    📝 Ad Copy & Branding
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-surface-700 mb-1.5">Ad Title *</label>
                                        <input
                                            type="text"
                                            value={formData.adTitle}
                                            onChange={(e) => setFormData({ ...formData, adTitle: e.target.value })}
                                            placeholder="Enter ad title"
                                            className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-surface-700 mb-1.5">Short Headline *</label>
                                        <input
                                            type="text"
                                            value={formData.shortHeadline}
                                            onChange={(e) => setFormData({ ...formData, shortHeadline: e.target.value })}
                                            placeholder="Catchy tagline or offer hook"
                                            className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-surface-700 mb-1.5">Ad Description *</label>
                                    <textarea
                                        rows="3"
                                        value={formData.adDescription}
                                        onChange={(e) => setFormData({ ...formData, adDescription: e.target.value })}
                                        placeholder="Describe offer features or incentives..."
                                        className="w-full p-4 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm outline-none font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Select
                                        label="Call To Action (CTA) *"
                                        value={formData.callToAction}
                                        onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
                                    >
                                        <option value="Book Now">Book Now</option>
                                        <option value="Learn More">Learn More</option>
                                        <option value="View Turf">View Turf</option>
                                        <option value="Play Now">Play Now</option>
                                        <option value="Explore">Explore</option>
                                    </Select>

                                    <Select
                                        label="Campaign Status *"
                                        value={formData.campaignStatus}
                                        onChange={(e) => setFormData({ ...formData, campaignStatus: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Draft">Draft</option>
                                        <option value="Paused">Paused</option>
                                        <option value="Scheduled">Scheduled</option>
                                    </Select>

                                    <Input
                                        label="Redirect URL (Optional)"
                                        value={formData.redirectUrl}
                                        onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                                        placeholder="https://sportmatrix.in/..."
                                    />
                                </div>
                            </div>

                            {/* Section 2: Media Uploads */}
                            <div className="space-y-4 bg-surface-50/60 p-5 rounded-2xl border border-surface-200/60">
                                <h3 className="text-xs font-extrabold text-surface-800 uppercase tracking-wider flex items-center gap-2">
                                    🖼️ Banners & Graphic Uploads
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white rounded-2xl border border-surface-200 space-y-2">
                                        <label className="block text-xs font-bold text-surface-800 flex items-center gap-1.5">
                                            <FiImage className="text-emerald-600" /> Desktop Banner Image *
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload('bannerImage', e)}
                                            className="block w-full text-xs text-surface-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                                        />
                                        {formData.bannerImage && (
                                            <div className="h-20 w-full rounded-xl overflow-hidden border border-surface-200 mt-2">
                                                <img src={formData.bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-white rounded-2xl border border-surface-200 space-y-2">
                                        <label className="block text-xs font-bold text-surface-800 flex items-center gap-1.5">
                                            <FiImage className="text-indigo-600" /> Mobile Banner Upload (Optional)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload('mobileBannerImage', e)}
                                            className="block w-full text-xs text-surface-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                        />
                                        {formData.mobileBannerImage && (
                                            <div className="h-20 w-full rounded-xl overflow-hidden border border-surface-200 mt-2">
                                                <img src={formData.mobileBannerImage} alt="Mobile Banner Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-white rounded-2xl border border-surface-200 space-y-2">
                                        <label className="block text-xs font-bold text-surface-800 flex items-center gap-1.5">
                                            <FiImage className="text-purple-600" /> Thumbnail Upload (Optional)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload('thumbnailImage', e)}
                                            className="block w-full text-xs text-surface-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                                        />
                                        {formData.thumbnailImage && (
                                            <div className="h-20 w-full rounded-xl overflow-hidden border border-surface-200 mt-2">
                                                <img src={formData.thumbnailImage} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-white rounded-2xl border border-surface-200 space-y-2">
                                        <label className="block text-xs font-bold text-surface-800 flex items-center gap-1.5">
                                            <FiVideo className="text-amber-600" /> Promotional Video Upload (Optional)
                                        </label>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => handleFileUpload('promotionalVideo', e)}
                                            className="block w-full text-xs text-surface-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                                        />
                                        {formData.promotionalVideo && (
                                            <div className="h-20 w-full rounded-xl overflow-hidden border border-surface-200 mt-2">
                                                <video src={formData.promotionalVideo} controls className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Final Review & Publish Step */}
                    {((campaignType === 'guaranteed_booking' && currentStep === 4) || (campaignType === 'impression_ad' && currentStep === 5)) && (
                        <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-300">
                            <div className="border-b border-surface-150 pb-4">
                                <h2 className="text-lg font-black text-surface-900 tracking-tight">Final Campaign Review</h2>
                                <p className="text-xs text-surface-500 font-medium">Verify all details before publishing your campaign live.</p>
                            </div>

                            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 p-6 rounded-3xl border border-emerald-200/80 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-600 text-white shadow-soft uppercase">
                                        🟢 {campaignType === 'guaranteed_booking' ? 'GUARANTEED BOOKING MODEL' : 'IMPRESSION AD MODEL'}
                                    </span>
                                    <span className="text-xs font-bold text-emerald-800">Ready for Instant Launch</span>
                                </div>

                                <h3 className="text-xl font-black text-surface-900 tracking-tight">{formData.campaignName}</h3>

                                {campaignType === 'guaranteed_booking' ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-emerald-200/60 text-xs">
                                        <div>
                                            <div className="text-surface-500 font-bold uppercase">Duration</div>
                                            <div className="font-extrabold text-surface-900 mt-0.5">{durationDays} Days ({formData.startDate} → {formData.endDate})</div>
                                        </div>
                                        <div>
                                            <div className="text-surface-500 font-bold uppercase">Commission Rate</div>
                                            <div className="font-extrabold text-emerald-600 mt-0.5">{formData.commissionPercent}% Per Booking</div>
                                        </div>
                                        <div>
                                            <div className="text-surface-500 font-bold uppercase">Min Goal</div>
                                            <div className="font-extrabold text-indigo-600 mt-0.5">{formData.minBookingGoal} Slots</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-emerald-200/60 text-xs">
                                        <div>
                                            <div className="text-surface-500 font-bold uppercase">Budget</div>
                                            <div className="font-extrabold text-emerald-600 mt-0.5">₹{Number(formData.campaignBudget).toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-surface-500 font-bold uppercase">CPM Rate</div>
                                            <div className="font-extrabold text-indigo-600 mt-0.5">₹{formData.cpmRate} / 1k</div>
                                        </div>
                                        <div>
                                            <div className="text-surface-500 font-bold uppercase">Est. Impressions</div>
                                            <div className="font-extrabold text-purple-600 mt-0.5">~{estimatedImpressions.toLocaleString()}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold flex items-center gap-2">
                                <FiInfo className="w-5 h-5 shrink-0" />
                                <span>Publishing this campaign will submit it for immediate review and approval.</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side Panel: Live Campaign Preview Card */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.05)] sticky top-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-surface-150 pb-3">
                            <h3 className="font-black text-surface-900 text-sm tracking-tight flex items-center gap-2">
                                {campaignType === 'impression_ad' ? '📱 Live Advertisement Preview' : '📱 Campaign Live Summary'}
                            </h3>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>

                        {/* Interactive Banner Card ONLY shown for Impression Ad */}
                        {campaignType === 'impression_ad' && (
                            <div className="bg-slate-950 text-white rounded-3xl overflow-hidden border border-white/10 shadow-2xl space-y-0 relative group">
                                <div className="h-44 w-full relative bg-slate-900 overflow-hidden">
                                    {formData.promotionalVideo ? (
                                        <video src={formData.promotionalVideo} autoPlay loop muted className="w-full h-full object-cover" />
                                    ) : (
                                        <img
                                            src={formData.bannerImage || 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800'}
                                            alt={formData.adTitle}
                                            className="w-full h-full object-cover opacity-90"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
                                    
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className="bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
                                            🔥 Promoted Ad
                                        </span>
                                    </div>

                                    <div className="absolute top-3 right-3">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusBadge(formData.campaignStatus)}`}>
                                            {formData.campaignStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 space-y-3 bg-slate-950">
                                    {formData.shortHeadline && (
                                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block">
                                            {formData.shortHeadline}
                                        </span>
                                    )}
                                    <h4 className="font-extrabold text-base text-white tracking-tight leading-snug">
                                        {formData.adTitle || 'Your Ad Title Here'}
                                    </h4>
                                    <p className="text-xs text-slate-400 font-normal leading-relaxed line-clamp-2">
                                        {formData.adDescription || 'Your ad description preview will appear here.'}
                                    </p>

                                    <div className="pt-2 flex items-center justify-between border-t border-white/10 mt-3">
                                        {formData.redirectUrl ? (
                                            <a href={formData.redirectUrl} target="_blank" rel="noreferrer" className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-medium truncate max-w-[150px]">
                                                <FiExternalLink /> Link attached
                                            </a>
                                        ) : (
                                            <span className="text-[11px] text-slate-500 font-medium">SportMatrix Direct</span>
                                        )}

                                        <button className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black tracking-wider uppercase transition-all duration-200">
                                            {formData.callToAction || 'Book Now'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Financial / Impression Live Stats Summary Card */}
                        {campaignType === 'guaranteed_booking' ? (
                            /* GUARANTEED BOOKING LIVE SUMMARY */
                            <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-surface-200/60 text-xs">
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">Campaign Name</span>
                                    <span className="font-extrabold text-surface-900 truncate max-w-[150px]">{formData.campaignName}</span>
                                </div>
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">Turf</span>
                                    <span className="font-bold text-surface-900 truncate max-w-[150px]">{formData.turfName}</span>
                                </div>
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">Duration</span>
                                    <span className="font-bold text-surface-900">{formatDurationText(durationDays)}</span>
                                </div>
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">Commission %</span>
                                    <span className="font-extrabold text-purple-600">{formData.commissionPercent}%</span>
                                </div>
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">Minimum Booking Goal</span>
                                    <span className="font-bold text-indigo-600">{expectedBookings} Slots</span>
                                </div>
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">Average Slot Price</span>
                                    <span className="font-bold text-surface-900">₹{bookingPrice}</span>
                                </div>
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">Target Radius</span>
                                    <span className="font-bold text-indigo-600">{formData.targetArea} KM</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 text-sm">
                                    <span className="text-surface-800 font-black">Est. Net Revenue</span>
                                    <span className="font-black text-emerald-600">₹{netOwnerRevenue.toLocaleString()}</span>
                                </div>
                            </div>
                        ) : (
                            /* IMPRESSION AD LIVE SUMMARY */
                            <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-surface-200/60 text-xs">
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">Campaign Name</span>
                                    <span className="font-extrabold text-surface-900 truncate max-w-[150px]">{formData.campaignName}</span>
                                </div>
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">Turf</span>
                                    <span className="font-bold text-surface-900 truncate max-w-[150px]">{formData.turfName}</span>
                                </div>
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">Duration</span>
                                    <span className="font-bold text-surface-900">{formatDurationText(durationDays)}</span>
                                </div>
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">Campaign Budget</span>
                                    <span className="font-extrabold text-emerald-600">₹{Number(formData.campaignBudget).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">Daily Budget</span>
                                    <span className="font-bold text-surface-900">₹{formData.dailyBudget} / Day</span>
                                </div>
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">CPM Rate</span>
                                    <span className="font-bold text-purple-600">₹{formData.cpmRate} / 1k</span>
                                </div>
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">Est. Impressions</span>
                                    <span className="font-extrabold text-amber-600">~{estimatedImpressions.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">Placements</span>
                                    <span className="font-bold text-indigo-600 text-[11px] truncate max-w-[140px]">
                                        {formData.placements.join(', ') || 'Standard'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                    <span className="text-surface-500 font-bold">Target Radius</span>
                                    <span className="font-bold text-indigo-600">{formData.targetArea} KM</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 text-xs">
                                    <span className="text-surface-800 font-black">Est. Audience</span>
                                    <span className="font-black text-indigo-600">~{estimatedAudience.toLocaleString()} Users</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-surface-200 p-4 shadow-xl">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="secondary" size="sm" onClick={() => navigate('/admin/ads')}>
                            Cancel
                        </Button>
                        <button
                            onClick={handleSaveDraft}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-700 text-xs font-bold transition-all cursor-pointer"
                        >
                            <FiSave className="w-4 h-4 text-indigo-600" /> Save Draft
                        </button>
                    </div>

                    {/* Dynamic Step Navigation Buttons */}
                    <div className="flex items-center gap-3">
                        {currentStep > 1 && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setCurrentStep(prev => prev - 1)}
                                className="flex items-center gap-1"
                            >
                                <FiChevronLeft /> Previous
                            </Button>
                        )}

                        {currentStep < steps.length ? (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleNextStep}
                                className="flex items-center gap-1 shadow-lg shadow-emerald-500/20"
                            >
                                Next Step <FiChevronRight />
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSubmit}
                                className="flex items-center gap-1 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6"
                            >
                                Publish Campaign ✓
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
