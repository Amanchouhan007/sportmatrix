import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import { useToast } from '../../components/ui/Toast'
import { createDiscountOffer } from '../../services/discountService'
import { getBranches } from '../../services/branchService'
import {
    FiArrowLeft, FiTag, FiPercent, FiDollarSign, FiClock, FiCalendar,
    FiMapPin, FiUsers, FiSave, FiChevronRight, FiChevronLeft, FiImage, FiCheck, FiInfo, FiLayers
} from 'react-icons/fi'

export default function CreateDiscountOffer() {
    const navigate = useNavigate()
    const { addToast } = useToast()

    // Wizard Step State (1: Basic Details, 2: Config, 3: Targeting, 4: Summary)
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [turfs, setTurfs] = useState([])

    // Form Data State
    const [formData, setFormData] = useState({
        // STEP 1: Basic Details
        title: 'Special Discount Offer',
        turfId: '',
        turfName: '',
        ownerName: '',
        description: 'Instant discount on turf slot bookings.',
        discountType: 'Percentage',
        promoCode: 'OFFER20',
        banner: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800',
        thumbnail: '',

        // STEP 2: Discount Configuration
        discountValue: '20',
        minimumBookingAmount: '500',
        maximumDiscountAmount: '300',
        slotTypes: ['Evening', 'Night'],
        applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        applicableSports: ['Football', 'Cricket'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
        startTime: '00:00:00',
        endTime: '23:59:59',
        usageLimit: '200',
        perUserLimit: '2',
        firstBookingOnly: false,
        stackable: false,
        autoApply: true,

        // STEP 3: Targeting
        targetRadius: '5',
        location: 'Local Region',
        targetCities: [],
        gender: 'All Genders',
        ageGroup: 'All Ages',
        customerType: 'All Users',
        estimatedAudience: 12500,

        // Status
        status: 'ACTIVE'
    })

    useEffect(() => {
        const fetchTurfs = async () => {
            try {
                const res = await getBranches()
                const branchList = Array.isArray(res) ? res : (res?.data || [])
                if (Array.isArray(branchList) && branchList.length > 0) {
                    const mapped = branchList.map(b => ({
                        id: b.id,
                        name: `${b.branchName || b.name || 'Turf'} (${b.city || b.location || 'Location'})`,
                        owner: b.owner?.fullName || b.ownerName || 'Turf Owner'
                    }))
                    setTurfs(mapped)
                    setFormData(prev => ({
                        ...prev,
                        turfId: mapped[0].id,
                        turfName: mapped[0].name,
                        ownerName: mapped[0].owner
                    }))
                }
            } catch (err) {
                console.error('Failed to load turfs in CreateDiscountOffer', err)
            }
        }
        fetchTurfs()
    }, [])

    const handleTurfChange = (selectedId) => {
        const found = turfs.find(t => String(t.id) === String(selectedId))
        setFormData(prev => ({
            ...prev,
            turfId: selectedId,
            turfName: found ? found.name : '',
            ownerName: found ? found.owner : ''
        }))
    }

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

    const toggleArrayItem = (field, item) => {
        setFormData(prev => {
            const arr = prev[field] || []
            if (arr.includes(item)) {
                return { ...prev, [field]: arr.filter(i => i !== item) }
            } else {
                return { ...prev, [field]: [...arr, item] }
            }
        })
    }

    const validateForm = () => {
        if (!formData.title.trim()) {
            addToast({ message: 'Offer Title is required!', type: 'error' })
            return false
        }
        if (!formData.turfId) {
            addToast({ message: 'Target Turf is required!', type: 'error' })
            return false
        }
        if (!formData.discountType) {
            addToast({ message: 'Discount Type is required!', type: 'error' })
            return false
        }
        if (!formData.discountValue || Number(formData.discountValue) <= 0) {
            addToast({ message: 'Discount Value must be greater than 0!', type: 'error' })
            return false
        }
        if (formData.discountType === 'Percentage' && Number(formData.discountValue) > 100) {
            addToast({ message: 'Percentage discount cannot exceed 100%!', type: 'error' })
            return false
        }
        if (formData.discountType === 'Flat Amount' && formData.maximumDiscountAmount) {
            if (Number(formData.discountValue) > Number(formData.maximumDiscountAmount)) {
                addToast({ message: 'Flat discount value cannot exceed Maximum Discount Amount!', type: 'error' })
                return false
            }
        }
        if (!formData.startDate) {
            addToast({ message: 'Start Date is required!', type: 'error' })
            return false
        }
        if (!formData.endDate) {
            addToast({ message: 'End Date is required!', type: 'error' })
            return false
        }
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            addToast({ message: 'End Date cannot be before Start Date!', type: 'error' })
            return false
        }
        if (formData.usageLimit && Number(formData.usageLimit) <= 0) {
            addToast({ message: 'Usage Limit must be greater than 0!', type: 'error' })
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e?.preventDefault()
        if (!validateForm()) return

        setIsSubmitting(true)
        try {
            const res = await createDiscountOffer(formData)
            if (res.success) {
                addToast({ message: `Discount offer "${formData.title}" created successfully!`, type: 'success' })
                navigate('/admin/discount-offers')
            }
        } catch (err) {
            addToast({ message: err.message || 'Failed to create discount offer', type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto bg-[#F4F7FC] p-6 rounded-3xl min-h-screen animate-in fade-in duration-500 pb-28">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/discount-offers')}
                        className="p-3 rounded-2xl bg-surface-100 hover:bg-surface-200 text-surface-600 transition-colors cursor-pointer"
                    >
                        <FiArrowLeft className="text-xl" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                            🏷️ Create Discount Offer
                        </h1>
                        <p className="text-surface-500 text-sm mt-0.5 font-medium">Configure promotional coupons, off-peak slot price discounts, and target rules.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs font-bold text-emerald-700 shadow-sm">
                    ⏱️ Setup Time: <span className="text-emerald-800 font-extrabold">2 Minutes</span>
                </div>
            </div>

            {/* 4-Step Stepper Bar */}
            <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative">
                    {[
                        { step: 1, title: 'Basic Details', subtitle: 'Title & Turf' },
                        { step: 2, title: 'Discount Config', subtitle: 'Value & Validity' },
                        { step: 3, title: 'Targeting', subtitle: 'Audience & Radius' },
                        { step: 4, title: 'Summary & Review', subtitle: 'Live Preview' }
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
                {/* Left Form Panel */}
                <div className="lg:col-span-7 space-y-6">
                    {/* STEP 1: Basic Details */}
                    {currentStep === 1 && (
                        <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-300">
                            <div className="border-b border-surface-150 pb-4">
                                <h2 className="text-lg font-black text-surface-900 tracking-tight">Step 1: Basic Offer Details</h2>
                                <p className="text-xs text-surface-500 font-medium">Set the title, target turf, owner mapping, and discount type.</p>
                            </div>

                            <div className="space-y-4 bg-surface-50/60 p-5 rounded-2xl border border-surface-200/60">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-surface-700 mb-1.5">Offer Title *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Monsoon Special 25% OFF"
                                            className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    <Select
                                        label="Select Turf *"
                                        value={formData.turfId}
                                        onChange={(e) => handleTurfChange(e.target.value)}
                                    >
                                        {turfs.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-surface-700 mb-1.5">Owner (Auto Mapped)</label>
                                        <input
                                            type="text"
                                            disabled
                                            value={formData.ownerName}
                                            className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-100 text-surface-600 text-sm font-bold cursor-not-allowed"
                                        />
                                    </div>

                                    <Select
                                        label="Discount Type *"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    >
                                        <option value="Percentage">Percentage (%)</option>
                                        <option value="Flat Amount">Flat Amount (₹)</option>
                                        <option value="Buy One Get One">Buy One Get One</option>
                                        <option value="Free Slot">Free Slot</option>
                                        <option value="Cashback">Cashback</option>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-surface-700 mb-1.5">Promo Code (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.promoCode}
                                        onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                                        placeholder="e.g. MONSOON25"
                                        className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm font-mono font-bold uppercase tracking-wider outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                    <span className="text-[11px] text-surface-400 font-medium mt-1 block">Leave empty to auto-apply discount without a promo code.</span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-surface-700 mb-1.5">Offer Description</label>
                                    <textarea
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the offer benefits, terms, and conditions..."
                                        className="w-full p-4 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm font-medium outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Image Uploads */}
                            <div className="space-y-4 bg-surface-50/60 p-5 rounded-2xl border border-surface-200/60">
                                <h3 className="text-xs font-extrabold text-surface-800 uppercase tracking-wider flex items-center gap-2">
                                    🖼️ Banner & Thumbnail Graphics
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white rounded-2xl border border-surface-200 space-y-2">
                                        <label className="block text-xs font-bold text-surface-800">Offer Banner Upload</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload('banner', e)}
                                            className="block w-full text-xs text-surface-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                                        />
                                        {formData.banner && (
                                            <div className="h-20 w-full rounded-xl overflow-hidden border border-surface-200 mt-2">
                                                <img src={formData.banner} alt="Banner Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-white rounded-2xl border border-surface-200 space-y-2">
                                        <label className="block text-xs font-bold text-surface-800">Offer Thumbnail Upload</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload('thumbnail', e)}
                                            className="block w-full text-xs text-surface-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                                        />
                                        {formData.thumbnail && (
                                            <div className="h-20 w-full rounded-xl overflow-hidden border border-surface-200 mt-2">
                                                <img src={formData.thumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Discount Configuration */}
                    {currentStep === 2 && (
                        <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-300">
                            <div className="border-b border-surface-150 pb-4">
                                <h2 className="text-lg font-black text-surface-900 tracking-tight">Step 2: Discount Configuration</h2>
                                <p className="text-xs text-surface-500 font-medium">Configure discount values, slot rules, validity dates, and usage limits.</p>
                            </div>

                            <div className="space-y-4 bg-surface-50/60 p-5 rounded-2xl border border-surface-200/60">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Input
                                        type="number"
                                        label={`Discount Value (${formData.discountType === 'Percentage' ? '%' : '₹'}) *`}
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                    />
                                    <Input
                                        type="number"
                                        label="Min Booking Amount (₹)"
                                        value={formData.minimumBookingAmount}
                                        onChange={(e) => setFormData({ ...formData, minimumBookingAmount: e.target.value })}
                                    />
                                    <Input
                                        type="number"
                                        label="Max Discount Amount (₹)"
                                        value={formData.maximumDiscountAmount}
                                        onChange={(e) => setFormData({ ...formData, maximumDiscountAmount: e.target.value })}
                                    />
                                </div>

                                {/* Slot Types Selection */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-surface-700">Applicable Slot Types</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Morning', 'Afternoon', 'Evening', 'Night'].map(slot => (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => toggleArrayItem('slotTypes', slot)}
                                                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                                                    formData.slotTypes.includes(slot)
                                                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                                        : 'bg-white text-surface-600 border-surface-200 hover:bg-surface-100'
                                                }`}
                                            >
                                                {formData.slotTypes.includes(slot) ? '✓ ' : ''}{slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Applicable Days Selection */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-surface-700">Applicable Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleArrayItem('applicableDays', day)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                                    formData.applicableDays.includes(day)
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                        : 'bg-white text-surface-600 border-surface-200 hover:bg-surface-100'
                                                }`}
                                            >
                                                {day.substring(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Applicable Sports Selection */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-surface-700">Applicable Sports</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Football', 'Cricket', 'Badminton', 'Tennis', 'Box Cricket'].map(sport => (
                                            <button
                                                key={sport}
                                                type="button"
                                                onClick={() => toggleArrayItem('applicableSports', sport)}
                                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                                    formData.applicableSports.includes(sport)
                                                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                                        : 'bg-white text-surface-600 border-surface-200 hover:bg-surface-100'
                                                }`}
                                            >
                                                ⚽ {sport}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Validity Range */}
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                                    <CustomDatePicker
                                        label="Start Date *"
                                        value={formData.startDate}
                                        onChange={(val) => setFormData({ ...formData, startDate: val })}
                                        align="left"
                                    />
                                    <CustomDatePicker
                                        label="End Date *"
                                        value={formData.endDate}
                                        onChange={(val) => setFormData({ ...formData, endDate: val })}
                                        align="left"
                                    />
                                    <Input
                                        type="time"
                                        label="Start Time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                    <Input
                                        type="time"
                                        label="End Time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                </div>

                                {/* Usage & Toggles */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label="Usage Limit *"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    />
                                    <Input
                                        type="number"
                                        label="Per User Limit"
                                        value={formData.perUserLimit}
                                        onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                    <label className="flex items-center gap-2 text-xs font-bold text-surface-700 bg-white p-3 rounded-xl border border-surface-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.firstBookingOnly}
                                            onChange={(e) => setFormData({ ...formData, firstBookingOnly: e.target.checked })}
                                            className="w-4 h-4 accent-emerald-600 rounded"
                                        />
                                        First Booking Only
                                    </label>

                                    <label className="flex items-center gap-2 text-xs font-bold text-surface-700 bg-white p-3 rounded-xl border border-surface-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.stackable}
                                            onChange={(e) => setFormData({ ...formData, stackable: e.target.checked })}
                                            className="w-4 h-4 accent-emerald-600 rounded"
                                        />
                                        Stackable Discount
                                    </label>

                                    <label className="flex items-center gap-2 text-xs font-bold text-surface-700 bg-white p-3 rounded-xl border border-surface-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.autoApply}
                                            onChange={(e) => setFormData({ ...formData, autoApply: e.target.checked })}
                                            className="w-4 h-4 accent-emerald-600 rounded"
                                        />
                                        Auto Apply Offer
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Targeting */}
                    {currentStep === 3 && (
                        <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-300">
                            <div className="border-b border-surface-150 pb-4">
                                <h2 className="text-lg font-black text-surface-900 tracking-tight">Step 3: Audience & Geo Targeting</h2>
                                <p className="text-xs text-surface-500 font-medium">Define customer segments, geographic radius, and demographic targeting rules.</p>
                            </div>

                            <div className="space-y-4 bg-surface-50/60 p-5 rounded-2xl border border-surface-200/60">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label="Target Radius (KM) *"
                                        value={formData.targetRadius}
                                        onChange={(e) => setFormData({ ...formData, targetRadius: e.target.value })}
                                    />
                                    <Input
                                        label="Location Area"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Select
                                        label="Customer Type *"
                                        value={formData.customerType}
                                        onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                                    >
                                        <option value="All Users">All Users</option>
                                        <option value="New Users">New Users</option>
                                        <option value="Existing Users">Existing Users</option>
                                        <option value="Premium Users">Premium Users</option>
                                    </Select>

                                    <Select
                                        label="Gender Segment"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="All">All Genders</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </Select>

                                    <Select
                                        label="Age Group"
                                        value={formData.ageGroup}
                                        onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                                    >
                                        <option value="All Ages">All Ages</option>
                                        <option value="18-24">18-24 Years</option>
                                        <option value="25-34">25-34 Years</option>
                                        <option value="35+">35+ Years</option>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-surface-700 mb-1.5">Estimated Audience Reach</label>
                                    <div className="px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-sm font-black flex items-center gap-2">
                                        🚀 ~{(Number(formData.targetRadius || 5) * 2500).toLocaleString()} Potential Customers Nearby
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Summary & Live Preview */}
                    {currentStep === 4 && (
                        <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-300">
                            <div className="border-b border-surface-150 pb-4">
                                <h2 className="text-lg font-black text-surface-900 tracking-tight">Step 4: Summary & Review</h2>
                                <p className="text-xs text-surface-500 font-medium">Verify all discount parameters before publishing live.</p>
                            </div>

                            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 p-6 rounded-3xl border border-emerald-200/80 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-600 text-white shadow-soft uppercase">
                                        🏷️ {formData.discountType} OFFER
                                    </span>
                                    <span className="text-xs font-bold text-emerald-800">Ready for Launch</span>
                                </div>

                                <h3 className="text-xl font-black text-surface-900 tracking-tight">{formData.title}</h3>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-emerald-200/60 text-xs">
                                    <div>
                                        <div className="text-surface-500 font-bold uppercase">Discount Value</div>
                                        <div className="font-extrabold text-emerald-600 mt-0.5 text-base">
                                            {formData.discountType === 'Percentage' ? `${formData.discountValue}% OFF` : `₹${formData.discountValue} OFF`}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-surface-500 font-bold uppercase">Promo Code</div>
                                        <div className="font-extrabold text-indigo-600 mt-0.5 font-mono">{formData.promoCode || 'Auto Apply'}</div>
                                    </div>
                                    <div>
                                        <div className="text-surface-500 font-bold uppercase">Validity</div>
                                        <div className="font-extrabold text-surface-900 mt-0.5">{formData.startDate} → {formData.endDate}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold flex items-center gap-2">
                                <FiInfo className="w-5 h-5 shrink-0" />
                                <span>Publishing this discount offer will make it active immediately for eligible customer slot bookings.</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side Panel: Live Summary Card */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.05)] sticky top-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-surface-150 pb-3">
                            <h3 className="font-black text-surface-900 text-sm tracking-tight flex items-center gap-2">
                                📱 Offer Live Summary Card
                            </h3>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>

                        {/* Banner graphic preview card */}
                        <div className="bg-slate-950 text-white rounded-3xl overflow-hidden border border-white/10 shadow-2xl space-y-0 relative group">
                            <div className="h-40 w-full relative bg-slate-900 overflow-hidden">
                                <img
                                    src={formData.banner || 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800'}
                                    alt={formData.title}
                                    className="w-full h-full object-cover opacity-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
                                <div className="absolute top-3 left-3">
                                    <span className="bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        ⚡ Discount Offer
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 space-y-3 bg-slate-950">
                                <div className="flex items-center justify-between">
                                    <span className="text-emerald-400 font-extrabold text-sm">
                                        {formData.discountType === 'Percentage' ? `${formData.discountValue}% OFF` : `₹${formData.discountValue} OFF`}
                                    </span>
                                    {formData.promoCode && (
                                        <span className="px-2 py-0.5 rounded bg-indigo-900/80 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/40">
                                            {formData.promoCode}
                                        </span>
                                    )}
                                </div>

                                <h4 className="font-extrabold text-base text-white tracking-tight leading-snug">
                                    {formData.title || 'Offer Title Preview'}
                                </h4>

                                <p className="text-xs text-slate-400 font-normal leading-relaxed line-clamp-2">
                                    {formData.description || 'Offer description will appear here...'}
                                </p>
                            </div>
                        </div>

                        {/* Detailed Config Stats */}
                        <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-surface-200/60 text-xs">
                            <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                <span className="text-surface-500 font-bold">Target Turf</span>
                                <span className="font-bold text-surface-900 truncate max-w-[160px]">{formData.turfName}</span>
                            </div>
                            <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                <span className="text-surface-500 font-bold">Discount Type</span>
                                <span className="font-extrabold text-purple-600 uppercase">{formData.discountType}</span>
                            </div>
                            <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                <span className="text-surface-500 font-bold">Validity Period</span>
                                <span className="font-bold text-surface-900">{formData.startDate} → {formData.endDate}</span>
                            </div>
                            <div className="flex justify-between items-center pb-1.5 border-b border-surface-200/40">
                                <span className="text-surface-500 font-bold">Usage Limit</span>
                                <span className="font-bold text-indigo-600">{formData.usageLimit} Claims</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 text-xs">
                                <span className="text-surface-500 font-bold">Audience Reach</span>
                                <span className="font-extrabold text-emerald-600">~{(Number(formData.targetRadius || 5) * 2500).toLocaleString()} Users</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-surface-200 p-4 shadow-xl">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <Button variant="secondary" size="sm" onClick={() => navigate('/admin/discount-offers')}>
                        Cancel
                    </Button>

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
                                disabled={isSubmitting}
                                className="flex items-center gap-1 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6"
                            >
                                {isSubmitting ? 'Publishing...' : 'Publish Discount Offer ✓'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
