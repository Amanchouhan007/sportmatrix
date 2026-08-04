import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'
import {
    FiCheck, FiArrowLeft, FiTag, FiPercent, FiEye, FiPlusCircle,
    FiCalendar, FiMapPin, FiDollarSign, FiInfo, FiChevronRight, FiChevronLeft, FiSave, FiAward
} from 'react-icons/fi'
import { HiMegaphone } from 'react-icons/hi2'

export default function CreateAdvertisement() {
    const navigate = useNavigate()
    const { addToast } = useToast()

    // Wizard Step State (1: Type, 2: Details, 3: Budget & Target, 4: Review)
    const [currentStep, setCurrentStep] = useState(1)

    // Selected Type
    const [selectedType, setSelectedType] = useState('guaranteed') // 'guaranteed' | 'discount' | 'impression'

    // Form Data State
    const [formData, setFormData] = useState({
        campaignName: 'Champions Night Drive Promo',
        turfId: 'turf-1',
        location: 'Mumbai Suburban',
        availableSlots: '18',
        startDate: '2026-08-02',
        endDate: '2026-09-02',
        targetArea: '5',
        commissionPercent: '15',
        minBooking: '30',
        avgBookingPrice: '1500',
        discountType: 'Percentage',
        discountValue: '20',
        budgetTotal: '5000',
        dailyBudget: '500',
        description: 'Boost evening slot bookings between 6PM-10PM for weekend customers.'
    })

    // Calculate duration in days automatically
    const calculateDuration = () => {
        if (!formData.startDate || !formData.endDate) return 30
        const start = new Date(formData.startDate)
        const end = new Date(formData.endDate)
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        return diff > 0 ? diff : 1
    }

    // Live Revenue & Earnings Calculation
    const durationDays = calculateDuration()
    const expectedBookings = Number(formData.minBooking || 30)
    const bookingPrice = Number(formData.avgBookingPrice || 1500)
    const grossRevenue = expectedBookings * bookingPrice
    const commissionAmount = Math.round((grossRevenue * Number(formData.commissionPercent || 15)) / 100)
    const netOwnerRevenue = grossRevenue - commissionAmount
    const estimatedReach = Number(formData.targetArea || 5) * 2500

    const handleSubmit = (e) => {
        e?.preventDefault()
        addToast({ message: `Campaign "${formData.campaignName}" published successfully & sent for review!`, type: 'success' })
        navigate('/admin/ads')
    }

    const handleSaveDraft = () => {
        addToast({ message: `Campaign draft "${formData.campaignName}" saved successfully!`, type: 'info' })
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto bg-[#F4F7FC] p-6 rounded-3xl min-h-screen animate-in fade-in duration-500 pb-28">
            {/* 13. Enhanced Header */}
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
                        <p className="text-surface-500 text-sm mt-0.5 font-medium">Launch a marketing campaign to increase bookings and revenue.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs font-bold text-emerald-700 shadow-sm">
                    ⏱️ Estimated setup time: <span className="text-emerald-800 font-extrabold">2 Minutes</span>
                </div>
            </div>

            {/* 1. 4-Step Stepper Bar (Enterprise SaaS Feel) */}
            <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="grid grid-cols-4 gap-2 relative">
                    {[
                        { step: 1, title: 'Select Type', subtitle: 'Choose Campaign Model' },
                        { step: 2, title: 'Campaign Details', subtitle: 'Turf & Schedule Rules' },
                        { step: 3, title: 'Budget & Target', subtitle: 'Pricing & Radius' },
                        { step: 4, title: 'Review & Publish', subtitle: 'Live Summary & Launch' }
                    ].map((s) => {
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
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                                        isCompleted
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : isCurrent
                                            ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100'
                                            : 'bg-surface-200 text-surface-600'
                                    }`}
                                >
                                    {isCompleted ? '✓' : s.step}
                                </div>
                                <div className="hidden sm:block truncate">
                                    <div className="font-extrabold text-xs tracking-tight truncate">{s.title}</div>
                                    <div className="text-[10px] font-medium text-surface-400 truncate">{s.subtitle}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Main Content Layout (Left: Dynamic Wizard Steps | Right: Live Summary Panel) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Wizard Panel */}
                <div className="lg:col-span-8 space-y-6">
                    {/* STEP 1: Select Type */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* 2. Premium Campaign Type Selection Cards */}
                            <div className="space-y-3">
                                <h2 className="text-lg font-black text-surface-900 tracking-tight">Step 1: Select Campaign Model</h2>
                                <p className="text-xs text-surface-500 font-medium">Select the advertising structure that best matches your turf strategy.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                {/* Card 1: Guaranteed Booking */}
                                <div
                                    onClick={() => setSelectedType('guaranteed')}
                                    className={`p-6 rounded-3xl cursor-pointer relative overflow-hidden transition-all duration-300 border ${
                                        selectedType === 'guaranteed'
                                            ? 'bg-gradient-to-b from-white to-emerald-50/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl scale-[1.02]'
                                            : 'bg-white border-surface-200/80 hover:border-emerald-300 hover:shadow-md'
                                    }`}
                                >
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold absolute top-4 right-4">
                                        ★ Most Popular
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl mb-4 shadow-inner">
                                        <FiTag />
                                    </div>
                                    <h3 className="font-black text-surface-900 text-base">Guaranteed Booking</h3>
                                    <p className="text-xs font-medium text-surface-500 mt-1.5 leading-relaxed">
                                        Commission-based model guaranteeing minimum court bookings. Perfect for new turfs.
                                    </p>
                                    <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-xs font-bold">
                                        <span className="text-emerald-600">Commission Based</span>
                                        {selectedType === 'guaranteed' && <span className="text-emerald-700 font-black">✓ Selected</span>}
                                    </div>
                                </div>

                                {/* Card 2: Discount Offer */}
                                <div
                                    onClick={() => setSelectedType('discount')}
                                    className={`p-6 rounded-3xl cursor-pointer relative overflow-hidden transition-all duration-300 border ${
                                        selectedType === 'discount'
                                            ? 'bg-gradient-to-b from-white to-purple-50/40 border-purple-500 ring-2 ring-purple-500/20 shadow-xl scale-[1.02]'
                                            : 'bg-white border-surface-200/80 hover:border-purple-300 hover:shadow-md'
                                    }`}
                                >
                                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold absolute top-4 right-4">
                                        ⚡ Peak Sales
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center text-2xl mb-4 shadow-inner">
                                        <FiPercent />
                                    </div>
                                    <h3 className="font-black text-surface-900 text-base">Discount Offer</h3>
                                    <p className="text-xs font-medium text-surface-500 mt-1.5 leading-relaxed">
                                        Promotional coupon codes & off-peak slot price discounts. Boosts weak slots.
                                    </p>
                                    <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-xs font-bold">
                                        <span className="text-purple-600">Coupon Discount</span>
                                        {selectedType === 'discount' && <span className="text-purple-700 font-black">✓ Selected</span>}
                                    </div>
                                </div>

                                {/* Card 3: Impression Ad */}
                                <div
                                    onClick={() => setSelectedType('impression')}
                                    className={`p-6 rounded-3xl cursor-pointer relative overflow-hidden transition-all duration-300 border ${
                                        selectedType === 'impression'
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
                                        High-visibility homepage banner exposure & reach booster across your city.
                                    </p>
                                    <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-xs font-bold">
                                        <span className="text-amber-600">CPM Banners</span>
                                        {selectedType === 'impression' && <span className="text-amber-700 font-black">✓ Selected</span>}
                                    </div>
                                </div>
                            </div>

                            {/* 14. Campaign Type Comparison Table */}
                            <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-4">
                                <h3 className="text-sm font-extrabold text-surface-900 flex items-center gap-2">
                                    <FiAward className="text-emerald-600" /> Campaign Models Comparison Matrix
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-[#F8FAFC] text-surface-600 font-bold border-b border-surface-200">
                                            <tr>
                                                <th className="px-4 py-2.5">Feature</th>
                                                <th className="px-4 py-2.5 text-emerald-700">Guaranteed Booking</th>
                                                <th className="px-4 py-2.5 text-purple-700">Discount Offer</th>
                                                <th className="px-4 py-2.5 text-amber-700">Impression Ad</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-surface-100 font-medium">
                                            <tr>
                                                <td className="px-4 py-2.5 font-bold text-surface-800">Payment Model</td>
                                                <td className="px-4 py-2.5 text-emerald-600 font-bold">Commission %</td>
                                                <td className="px-4 py-2.5">Slot Discount</td>
                                                <td className="px-4 py-2.5">CPM Per 1K Views</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2.5 font-bold text-surface-800">Best For</td>
                                                <td className="px-4 py-2.5">More Bookings</td>
                                                <td className="px-4 py-2.5">Promotions</td>
                                                <td className="px-4 py-2.5">City Branding</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2.5 font-bold text-surface-800">Risk Level</td>
                                                <td className="px-4 py-2.5 text-emerald-600 font-bold">🟢 Low (Pay on success)</td>
                                                <td className="px-4 py-2.5 text-purple-600 font-bold">🟣 Medium</td>
                                                <td className="px-4 py-2.5 text-amber-600 font-bold">🟠 Medium</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Campaign Details */}
                    {currentStep === 2 && (
                        <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-300">
                            <div className="border-b border-surface-150 pb-4">
                                <h2 className="text-lg font-black text-surface-900 tracking-tight">Step 2: Campaign & Turf Details</h2>
                                <p className="text-xs text-surface-500 font-medium">Configure campaign identity, target turf, and slot dates.</p>
                            </div>

                            {/* 3. Section 1: 🏟️ Turf Information */}
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
                                        {formData.campaignName && <span className="text-[11px] font-bold text-emerald-600 mt-1 block">✓ Valid</span>}
                                    </div>

                                    <Select
                                        label="Select Turf *"
                                        value={formData.turfId}
                                        onChange={(e) => setFormData({ ...formData, turfId: e.target.value })}
                                    >
                                        <option value="turf-1">Champions Turf Arena (Mumbai)</option>
                                        <option value="turf-2">SkyLine Football Turf (Pune)</option>
                                        <option value="turf-3">Velocity Sports Hub (Bangalore)</option>
                                    </Select>
                                </div>
                            </div>

                            {/* 3. Section 2: 📅 Campaign Schedule & Dates */}
                            <div className="space-y-4 bg-surface-50/60 p-5 rounded-2xl border border-surface-200/60">
                                <h3 className="text-xs font-extrabold text-surface-800 uppercase tracking-wider flex items-center gap-2">
                                    📅 Campaign Schedule & Dates
                                </h3>
                                {/* 9. Start & End Date with Auto Duration */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Input
                                        type="date"
                                        label="Start Date *"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                    <Input
                                        type="date"
                                        label="End Date *"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                    <div>
                                        <label className="block text-xs font-bold text-surface-700 mb-1.5">Calculated Duration</label>
                                        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-sm font-black flex items-center gap-2">
                                            📅 {durationDays} Days Active
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label="Available Slots Per Day *"
                                        value={formData.availableSlots}
                                        onChange={(e) => setFormData({ ...formData, availableSlots: e.target.value })}
                                    />
                                    <Input
                                        label="Location Area"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* 10. Description Textarea */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-surface-700">Campaign Goals & Description</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Example: Boost evening slot bookings between 6PM–10PM for weekend customers."
                                    className="w-full p-4 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-surface-400 font-medium"
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Budget & Target */}
                    {currentStep === 3 && (
                        <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-300">
                            <div className="border-b border-surface-150 pb-4">
                                <h2 className="text-lg font-black text-surface-900 tracking-tight">Step 3: Pricing, Commission & Target Radius</h2>
                                <p className="text-xs text-surface-500 font-medium">Set commission rules and target geographic radius.</p>
                            </div>

                            {/* 3. Section 3: 💰 Commission Rules & 8. Earnings Calculator */}
                            <div className="space-y-4 bg-surface-50/60 p-5 rounded-2xl border border-surface-200/60">
                                <h3 className="text-xs font-extrabold text-surface-800 uppercase tracking-wider flex items-center gap-2">
                                    💰 Commission & Booking Rules
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <Input
                                            type="number"
                                            label="Commission Percentage (%) *"
                                            value={formData.commissionPercent}
                                            onChange={(e) => setFormData({ ...formData, commissionPercent: e.target.value })}
                                        />
                                        {/* 5. Smart Info Card */}
                                        <div className="text-[11px] font-semibold text-surface-500 mt-1 flex items-center gap-1">
                                            <FiInfo className="text-emerald-600" /> Recommended: 15%–25% commission.
                                        </div>
                                    </div>

                                    <Input
                                        type="number"
                                        label="Min Bookings Guarantee *"
                                        value={formData.minBooking}
                                        onChange={(e) => setFormData({ ...formData, minBooking: e.target.value })}
                                    />

                                    <Input
                                        type="number"
                                        label="Avg Slot Price (₹) *"
                                        value={formData.avgBookingPrice}
                                        onChange={(e) => setFormData({ ...formData, avgBookingPrice: e.target.value })}
                                    />
                                </div>

                                {/* 8. Expected Earnings Live Calculator */}
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
                                    <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                                        📊 Live Expected Earnings Calculator
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                                        <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                                            <div className="text-[10px] font-bold text-surface-400 uppercase">Avg Slot Price</div>
                                            <div className="text-sm font-extrabold text-surface-900 mt-0.5">₹{bookingPrice.toLocaleString()}</div>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                                            <div className="text-[10px] font-bold text-surface-400 uppercase">Min Bookings</div>
                                            <div className="text-sm font-extrabold text-indigo-600 mt-0.5">{expectedBookings} Slots</div>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                                            <div className="text-[10px] font-bold text-surface-400 uppercase">Platform Fee ({formData.commissionPercent}%)</div>
                                            <div className="text-sm font-extrabold text-amber-600 mt-0.5">₹{commissionAmount.toLocaleString()}</div>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                                            <div className="text-[10px] font-bold text-surface-400 uppercase">Owner Net Earnings</div>
                                            <div className="text-sm font-black text-emerald-600 mt-0.5">₹{netOwnerRevenue.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Section 4: 📍 Geographic Radius & Target Audience */}
                            <div className="space-y-4 bg-surface-50/60 p-5 rounded-2xl border border-surface-200/60">
                                <h3 className="text-xs font-extrabold text-surface-800 uppercase tracking-wider flex items-center gap-2">
                                    📍 Geographic Target Radius
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Input
                                            type="number"
                                            label="Target Area Radius (KM) *"
                                            value={formData.targetArea}
                                            onChange={(e) => setFormData({ ...formData, targetArea: e.target.value })}
                                        />
                                        {/* 5. Smart Info Card */}
                                        <div className="text-[11px] font-semibold text-surface-500 mt-1 flex items-center gap-1">
                                            <FiMapPin className="text-indigo-600" /> Average radius: 3–7 KM gives best conversions.
                                        </div>
                                    </div>

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

                    {/* STEP 4: Review & Publish */}
                    {currentStep === 4 && (
                        <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-300">
                            <div className="border-b border-surface-150 pb-4">
                                <h2 className="text-lg font-black text-surface-900 tracking-tight">Step 4: Final Campaign Review</h2>
                                <p className="text-xs text-surface-500 font-medium">Verify all details before publishing your campaign to the live network.</p>
                            </div>

                            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 p-6 rounded-3xl border border-emerald-200/80 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-600 text-white shadow-soft">
                                        🟢 {selectedType.toUpperCase()} MODEL
                                    </span>
                                    <span className="text-xs font-bold text-emerald-800">Ready for Instant Review</span>
                                </div>

                                <h3 className="text-xl font-black text-surface-900 tracking-tight">{formData.campaignName}</h3>

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
                                        <div className="text-surface-500 font-bold uppercase">Target Radius</div>
                                        <div className="font-extrabold text-indigo-600 mt-0.5">{formData.targetArea} KM Radius</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold flex items-center gap-2">
                                <FiInfo className="w-5 h-5 shrink-0" />
                                <span>Publishing this campaign will send it to the Super Admin team for review. Approval typically takes less than 15 minutes.</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Right Side Live Campaign Preview Panel (Sticky Side Widget) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.05)] sticky top-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-surface-150 pb-3">
                            <h3 className="font-black text-surface-900 text-sm tracking-tight flex items-center gap-2">
                                📱 Campaign Live Summary
                            </h3>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>

                        {/* Live Summary Stats Card */}
                        <div className="space-y-3 bg-[#F8FAFC] p-4 rounded-2xl border border-surface-200/60 text-xs">
                            <div className="flex justify-between items-center pb-2 border-b border-surface-200/40">
                                <span className="text-surface-500 font-bold">Campaign Model</span>
                                <span className="font-extrabold text-emerald-600 uppercase">{selectedType}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-surface-200/40">
                                <span className="text-surface-500 font-bold">Turf Name</span>
                                <span className="font-bold text-surface-900">Champions Turf</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-surface-200/40">
                                <span className="text-surface-500 font-bold">Duration</span>
                                <span className="font-bold text-surface-900">{durationDays} Days</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-surface-200/40">
                                <span className="text-surface-500 font-bold">Commission</span>
                                <span className="font-extrabold text-purple-600">{formData.commissionPercent}%</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-surface-200/40">
                                <span className="text-surface-500 font-bold">Target Radius</span>
                                <span className="font-bold text-indigo-600">{formData.targetArea} KM</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-surface-200/40">
                                <span className="text-surface-500 font-bold">Estimated Reach</span>
                                <span className="font-extrabold text-emerald-600">~{estimatedReach.toLocaleString()} Users</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-surface-200/40">
                                <span className="text-surface-500 font-bold">Expected Bookings</span>
                                <span className="font-extrabold text-indigo-600">{expectedBookings} Slots</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 text-sm">
                                <span className="text-surface-800 font-black">Est. Net Revenue</span>
                                <span className="font-black text-emerald-600">₹{netOwnerRevenue.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 7. Sticky Bottom Action Bar */}
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

                    {/* Step Navigation Buttons */}
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

                        {currentStep < 4 ? (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setCurrentStep(prev => prev + 1)}
                                className="flex items-center gap-1 shadow-lg shadow-emerald-500/20"
                            >
                                Next Step <FiChevronRight />
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSubmit}
                                className="flex items-center gap-1 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white"
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
