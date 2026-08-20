import { useState, useEffect } from 'react'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi'
import { HiCheckCircle, HiStar } from 'react-icons/hi'
import { 
    createPlan, 
    getAllPlans, 
    updatePlan, 
    deletePlan, 
    toggleStatus, 
    togglePopular 
} from '../../services/subscriptionPlanService'

export default function SubscriptionPlans() {
    const { addToast } = useToast()
    
    // Loading states
    const [plans, setPlans] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [statusUpdatingId, setStatusUpdatingId] = useState(null)
    const [popularUpdatingId, setPopularUpdatingId] = useState(null)

    // Modal and Confirmation Dialog states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [planToDelete, setPlanToDelete] = useState(null)

    // Dynamic Feature Input
    const [newFeatureText, setNewFeatureText] = useState('')

    // Form inputs state
    const [formData, setFormData] = useState({
        planName: '',
        description: '',
        isPopular: false,
        status: 'active',
        monthlyPricing: {
            price: '',
            branchLimit: '',
            sportsLimit: '',
            bookingLimit: '',
            activeUsersLimit: ''
        },
        yearlyPricing: {
            price: '',
            branchLimit: '',
            sportsLimit: '',
            bookingLimit: '',
            activeUsersLimit: ''
        },
        features: []
    })

    // Load plans from server on mount
    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        setIsLoading(true)
        try {
            const res = await getAllPlans()
            if (res && res.success) {
                setPlans(res.data)
            } else {
                addToast({ title: 'Error', message: res.message || 'Failed to fetch plans', type: 'error' })
            }
        } catch (err) {
            addToast({ title: 'Error', message: err.response?.data?.message || err.message || 'Failed to fetch plans', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan)
            setFormData({
                planName: plan.planName || '',
                description: plan.description || '',
                isPopular: plan.isPopular || false,
                status: plan.status || 'active',
                monthlyPricing: {
                    price: plan.monthlyPricing?.price ?? '',
                    branchLimit: plan.monthlyPricing?.branchLimit ?? '',
                    sportsLimit: plan.monthlyPricing?.sportsLimit ?? '',
                    bookingLimit: plan.monthlyPricing?.bookingLimit ?? '',
                    activeUsersLimit: plan.monthlyPricing?.activeUsersLimit ?? ''
                },
                yearlyPricing: {
                    price: plan.yearlyPricing?.price ?? '',
                    branchLimit: plan.yearlyPricing?.branchLimit ?? '',
                    sportsLimit: plan.yearlyPricing?.sportsLimit ?? '',
                    bookingLimit: plan.yearlyPricing?.bookingLimit ?? '',
                    activeUsersLimit: plan.yearlyPricing?.activeUsersLimit ?? ''
                },
                features: plan.features || []
            })
        } else {
            setEditingPlan(null)
            setFormData({
                planName: '',
                description: '',
                isPopular: false,
                status: 'active',
                monthlyPricing: { price: '', branchLimit: '', sportsLimit: '', bookingLimit: '', activeUsersLimit: '' },
                yearlyPricing: { price: '', branchLimit: '', sportsLimit: '', bookingLimit: '', activeUsersLimit: '' },
                features: []
            })
        }
        setNewFeatureText('')
        setIsModalOpen(true)
    }

    const handleAddFeature = (textToAdd) => {
        const featStr = typeof textToAdd === 'string' ? textToAdd : newFeatureText
        if (!featStr || featStr.trim() === '') {
            addToast({ title: 'Input Required', message: 'Please enter or select a feature name first', type: 'warning' })
            return
        }
        const cleanText = featStr.trim()
        if (formData.features && formData.features.includes(cleanText)) {
            addToast({ title: 'Already Added', message: `"${cleanText}" is already included in this plan`, type: 'info' })
            setNewFeatureText('')
            return
        }
        setFormData(prev => ({
            ...prev,
            features: [...(prev.features || []), cleanText]
        }))
        setNewFeatureText('')
        addToast({ title: 'Feature Added ⚡', message: `Added "${cleanText}" to plan features list`, type: 'success' })
    }

    const handleRemoveFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: (prev.features || []).filter((_, idx) => idx !== index)
        }))
    }

    const handleSave = async () => {
        if (!formData.planName.trim()) {
            addToast({ title: 'Validation Error', message: 'Plan Name is required', type: 'error' })
            return
        }

        const parsePrice = (priceVal) => {
            if (priceVal === '' || priceVal === undefined || priceVal === null) return 0;
            const parsed = Number(priceVal);
            return isNaN(parsed) ? 0 : parsed;
        };

        const parseLimit = (limitVal) => {
            if (limitVal === '' || limitVal === undefined || limitVal === null) return -1;
            const parsed = Number(limitVal);
            return isNaN(parsed) ? -1 : parsed;
        };

        const payload = {
            planName: formData.planName.trim(),
            description: formData.description.trim(),
            isPopular: formData.isPopular,
            status: formData.status,
            monthlyPricing: {
                price: parsePrice(formData.monthlyPricing.price),
                branchLimit: parseLimit(formData.monthlyPricing.branchLimit),
                sportsLimit: parseLimit(formData.monthlyPricing.sportsLimit),
                bookingLimit: parseLimit(formData.monthlyPricing.bookingLimit),
                activeUsersLimit: parseLimit(formData.monthlyPricing.activeUsersLimit)
            },
            yearlyPricing: {
                price: parsePrice(formData.yearlyPricing.price),
                branchLimit: parseLimit(formData.yearlyPricing.branchLimit),
                sportsLimit: parseLimit(formData.yearlyPricing.sportsLimit),
                bookingLimit: parseLimit(formData.yearlyPricing.bookingLimit),
                activeUsersLimit: parseLimit(formData.yearlyPricing.activeUsersLimit)
            },
            features: formData.features
        }

        if (payload.monthlyPricing.price < 0 || payload.yearlyPricing.price < 0) {
            addToast({ title: 'Validation Error', message: 'Prices must be positive or zero', type: 'error' })
            return
        }

        setIsSaving(true)
        try {
            if (editingPlan) {
                await updatePlan(editingPlan._id || editingPlan.id, payload)
                addToast({ title: 'Updated', message: 'Plan updated successfully', type: 'success' })
                setIsModalOpen(false)
                fetchPlans()
            } else {
                await createPlan(payload)
                addToast({ title: 'Created', message: 'New plan created successfully', type: 'success' })
                setIsModalOpen(false)
                fetchPlans()
            }
        } catch (err) {
            addToast({ title: 'Save Failed', message: err.response?.data?.message || err.message || 'Failed to save plan', type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!planToDelete) return
        setIsDeleting(true)
        try {
            await deletePlan(planToDelete)
            addToast({ title: 'Deleted', message: 'Plan deleted successfully', type: 'success' })
            setIsConfirmOpen(false)
            setPlanToDelete(null)
            fetchPlans()
        } catch (err) {
            addToast({ title: 'Delete Failed', message: err.response?.data?.message || err.message || 'Failed to delete plan', type: 'error' })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleToggleStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'active' ? 'inactive' : 'active'
        setStatusUpdatingId(id)
        try {
            const res = await toggleStatus(id, nextStatus)
            if (res && res.success) {
                addToast({ title: 'Status Updated', message: `Plan is now ${nextStatus}`, type: 'info' })
                fetchPlans()
            }
        } catch (err) {
            addToast({ title: 'Status Failed', message: err.response?.data?.message || err.message || 'Failed to update status', type: 'error' })
        } finally {
            setStatusUpdatingId(null)
        }
    }

    const handleTogglePopular = async (id, currentPopular) => {
        const nextPopular = !currentPopular
        setPopularUpdatingId(id)
        try {
            const res = await togglePopular(id, nextPopular)
            if (res && res.success) {
                addToast({ title: 'Popularity Updated', message: nextPopular ? 'Plan marked as popular' : 'Popular tag removed', type: 'info' })
                fetchPlans()
            }
        } catch (err) {
            addToast({ title: 'Popularity Failed', message: err.response?.data?.message || err.message || 'Failed to update popularity', type: 'error' })
        } finally {
            setPopularUpdatingId(null)
        }
    }

    const formatLimit = (limit) => {
        return limit === -1 ? 'Unlimited' : limit
    }

    return (
        <div className="space-y-8 font-sans text-slate-900">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Subscription Plans</h1>
                    <p className="text-slate-500 text-sm font-semibold mt-1">Manage subscription tiers and limits</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="h-11 px-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-[0_4px_14px_rgba(34,197,94,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-400/40"
                >
                    <FiPlus className="w-4 h-4" />
                    <span>+ Create Plan</span>
                </button>
            </div>

            {/* Plan Cards Grid (3 Cards Desktop matching Screenshot 2) */}
            {isLoading ? (
                <div className="min-h-[350px] flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Fetching subscription plans...</span>
                </div>
            ) : plans.length === 0 ? (
                <div className="min-h-[280px] bg-white rounded-[24px] border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-slate-500 text-sm font-semibold mb-4">No subscription plans found.</p>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="h-11 px-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-sm cursor-pointer"
                    >
                        Create your first plan
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch">
                    {plans.map(p => (
                        <div 
                            key={p._id}
                            className={`bg-white rounded-[24px] border-2 transition-all duration-300 p-7 flex flex-col justify-between relative overflow-hidden group shadow-md hover:shadow-xl ${
                                p.isPopular 
                                    ? 'border-purple-500 ring-4 ring-purple-100 shadow-purple-100/50' 
                                    : 'border-slate-300 hover:border-emerald-500 shadow-slate-200/60'
                            }`}
                        >
                            {/* Purple Most Popular Tag (Matching Screenshot 2) */}
                            {p.isPopular && (
                                <div className="absolute top-4 right-4 bg-[#7C3AED] text-white text-[9.5px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
                                    <HiStar className="w-3 h-3 text-amber-300" />
                                    <span>Most Popular</span>
                                </div>
                            )}

                            <div>
                                {/* Card Header: Title & Status Badge */}
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{p.planName}</h3>
                                    {!p.isPopular && (
                                        <button 
                                            onClick={() => handleToggleStatus(p._id, p.status)}
                                            disabled={statusUpdatingId === p._id}
                                            className="cursor-pointer disabled:opacity-50"
                                        >
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 border ${
                                                p.status === 'active' ? 'bg-emerald-100/80 text-[#16A34A] border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-[#22C55E]' : 'bg-slate-400'}`} />
                                                {p.status.toUpperCase()}
                                            </span>
                                        </button>
                                    )}
                                </div>

                                {/* Price Display */}
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="text-[38px] font-black text-[#16A34A] leading-none tracking-tight">
                                        ₹{Number(p.monthlyPricing?.price || 0).toLocaleString()}
                                    </span>
                                    <span className="text-xs font-black text-slate-500">/mo</span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-bold mb-4">
                                    ₹{Number(p.yearlyPricing?.price || 0).toLocaleString()} / year
                                </p>

                                {p.description && (
                                    <p className="text-xs text-slate-600 font-medium mb-6 italic leading-relaxed line-clamp-2">
                                        {p.description}
                                    </p>
                                )}

                                {/* Limits Rows */}
                                <div className="space-y-3.5 text-xs border-t-2 border-slate-200/90 pt-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-bold">Branches</span>
                                        <span className="font-black text-slate-900 text-sm">{formatLimit(p.monthlyPricing?.branchLimit)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-bold">Sports</span>
                                        <span className="font-black text-slate-900 text-sm">{formatLimit(p.monthlyPricing?.sportsLimit)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-bold">Bookings/mo</span>
                                        <span className="font-black text-slate-900 text-sm">{formatLimit(p.monthlyPricing?.bookingLimit)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-bold">Active Users</span>
                                        <span className="font-black text-slate-900 text-sm">{formatLimit(p.monthlyPricing?.activeUsersLimit)}</span>
                                    </div>
                                </div>

                                {/* Popularity Tag Bar */}
                                <div className="mb-6 pt-3 border-t border-dashed border-slate-300 flex items-center justify-between">
                                    <span className="text-xs text-slate-500 font-bold">Popularity Tag</span>
                                    <button
                                        onClick={() => handleTogglePopular(p._id, p.isPopular)}
                                        disabled={popularUpdatingId === p._id}
                                        className={`text-xs px-3.5 py-1 rounded-full border-2 transition cursor-pointer disabled:opacity-50 font-black ${
                                            p.isPopular ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-2xs' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                                        }`}
                                    >
                                        {p.isPopular ? '⭐ Popular' : '☆ Mark Popular'}
                                    </button>
                                </div>

                                {/* Features Included List */}
                                {p.features && p.features.length > 0 && (
                                    <div className="mb-6 space-y-2.5">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-black">Features Included</span>
                                        <div className="space-y-2">
                                            {p.features.map((feat, i) => (
                                                <div 
                                                    key={i} 
                                                    className="bg-slate-50 border border-slate-300/80 rounded-2xl px-4 py-3 flex items-center gap-3 text-xs font-bold text-slate-900 shadow-2xs"
                                                >
                                                    <HiCheckCircle className="w-4.5 h-4.5 text-[#16A34A] shrink-0" />
                                                    <span className="leading-snug">{feat}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Card Footer Action Buttons */}
                            <div className="flex items-center gap-3 pt-4 border-t-2 border-slate-200">
                                <button
                                    onClick={() => handleOpenModal(p)}
                                    className="flex-1 py-3 px-4 rounded-full border-2 border-[#16A34A] bg-white text-[#16A34A] hover:bg-[#16A34A] hover:text-white font-black text-xs transition-all text-center cursor-pointer shadow-2xs"
                                >
                                    Edit Settings
                                </button>
                                <button
                                    onClick={() => {
                                        setPlanToDelete(p._id)
                                        setIsConfirmOpen(true)
                                    }}
                                    className="flex-1 py-3 px-4 rounded-full bg-[#FF3B30] hover:bg-red-600 text-white font-black text-xs transition-all text-center cursor-pointer shadow-sm"
                                >
                                    Delete Plan
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPlan ? "Edit Subscription Plan" : "Create New Plan"}
                size="enterprise"
            >
                <div className="space-y-6 pt-2 max-h-[75vh] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {/* Section 1: Basic Information */}
                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center font-bold text-xs">
                                1
                            </div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                Section 1: Basic Information
                            </h4>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Input 
                                label="Plan Name" 
                                placeholder="e.g. Starter Plan, Professional Plan, Enterprise Arena" 
                                value={formData.planName}
                                onChange={e => setFormData({ ...formData, planName: e.target.value })}
                                disabled={isSaving}
                            />
                            <Select 
                                label="Status"
                                id="status"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                options={[
                                    { value: 'active', label: 'ACTIVE' },
                                    { value: 'inactive', label: 'INACTIVE' },
                                    { value: 'draft', label: 'DRAFT' }
                                ]}
                                disabled={isSaving}
                            />
                        </div>

                        <Input 
                            label="Description" 
                            placeholder="Provide a brief plan description..." 
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            disabled={isSaving}
                        />

                        <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                            <button
                                type="button"
                                role="switch"
                                disabled={isSaving}
                                aria-checked={formData.isPopular}
                                onClick={() => setFormData(prev => ({ ...prev, isPopular: !prev.isPopular }))}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.isPopular ? 'bg-[#16A34A]' : 'bg-slate-200'}`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isPopular ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                            <div>
                                <span className="block text-xs font-bold text-slate-900">Mark As Popular Plan</span>
                                <span className="block text-[11px] text-slate-500 font-medium">Highlights this card on client pricing pages</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Monthly Pricing */}
                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                2
                            </div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                Section 2: Monthly Pricing & Tier Limits
                            </h4>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Input 
                                label="Monthly Price (₹)" 
                                type="number"
                                placeholder="0" 
                                value={formData.monthlyPricing.price}
                                onChange={e => setFormData({
                                    ...formData,
                                    monthlyPricing: { ...formData.monthlyPricing, price: e.target.value }
                                })}
                                disabled={isSaving}
                            />
                            <Input 
                                label="Branch Limit (-1 for Unlimited)" 
                                type="number"
                                placeholder="-1 for Unlimited" 
                                value={formData.monthlyPricing.branchLimit}
                                onChange={e => setFormData({
                                    ...formData,
                                    monthlyPricing: { ...formData.monthlyPricing, branchLimit: e.target.value }
                                })}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Input 
                                label="Sports Limit" 
                                type="number"
                                placeholder="-1 for Unlimited" 
                                value={formData.monthlyPricing.sportsLimit}
                                onChange={e => setFormData({
                                    ...formData,
                                    monthlyPricing: { ...formData.monthlyPricing, sportsLimit: e.target.value }
                                })}
                                disabled={isSaving}
                            />
                            <Input 
                                label="Monthly Booking Limit" 
                                type="number"
                                placeholder="-1 for Unlimited" 
                                value={formData.monthlyPricing.bookingLimit}
                                onChange={e => setFormData({
                                    ...formData,
                                    monthlyPricing: { ...formData.monthlyPricing, bookingLimit: e.target.value }
                                })}
                                disabled={isSaving}
                            />
                            <Input 
                                label="Monthly Active Users Limit" 
                                type="number"
                                placeholder="-1 for Unlimited" 
                                value={formData.monthlyPricing.activeUsersLimit}
                                onChange={e => setFormData({
                                    ...formData,
                                    monthlyPricing: { ...formData.monthlyPricing, activeUsersLimit: e.target.value }
                                })}
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Section 3: Yearly Pricing */}
                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70">
                            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                                3
                            </div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                Section 3: Yearly Pricing & Tier Limits
                            </h4>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Input 
                                label="Yearly Price (₹)" 
                                type="number"
                                placeholder="0" 
                                value={formData.yearlyPricing.price}
                                onChange={e => setFormData({
                                    ...formData,
                                    yearlyPricing: { ...formData.yearlyPricing, price: e.target.value }
                                })}
                                disabled={isSaving}
                            />
                            <Input 
                                label="Branch Limit (-1 for Unlimited)" 
                                type="number"
                                placeholder="-1 for Unlimited" 
                                value={formData.yearlyPricing.branchLimit}
                                onChange={e => setFormData({
                                    ...formData,
                                    yearlyPricing: { ...formData.yearlyPricing, branchLimit: e.target.value }
                                })}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Input 
                                label="Sports Limit" 
                                type="number"
                                placeholder="-1 for Unlimited" 
                                value={formData.yearlyPricing.sportsLimit}
                                onChange={e => setFormData({
                                    ...formData,
                                    yearlyPricing: { ...formData.yearlyPricing, sportsLimit: e.target.value }
                                })}
                                disabled={isSaving}
                            />
                            <Input 
                                label="Yearly Booking Limit" 
                                type="number"
                                placeholder="-1 for Unlimited" 
                                value={formData.yearlyPricing.bookingLimit}
                                onChange={e => setFormData({
                                    ...formData,
                                    yearlyPricing: { ...formData.yearlyPricing, bookingLimit: e.target.value }
                                })}
                                disabled={isSaving}
                            />
                            <Input 
                                label="Yearly Active Users Limit" 
                                type="number"
                                placeholder="-1 for Unlimited" 
                                value={formData.yearlyPricing.activeUsersLimit}
                                onChange={e => setFormData({
                                    ...formData,
                                    yearlyPricing: { ...formData.yearlyPricing, activeUsersLimit: e.target.value }
                                })}
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Section 4: Features List */}
                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70">
                            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                                4
                            </div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                Section 4: Features List
                            </h4>
                        </div>

                        <div className="flex gap-2">
                            <Input 
                                placeholder="e.g. Online Slot Booking, POS Integration, Revenue Analytics" 
                                value={newFeatureText}
                                onChange={e => setNewFeatureText(e.target.value)}
                                className="flex-1"
                                disabled={isSaving}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                            />
                            <button 
                                type="button" 
                                onClick={() => handleAddFeature()}
                                disabled={isSaving}
                                className="h-11 px-5 bg-white hover:bg-emerald-50 hover:border-[#16A34A] border border-slate-200 text-[#16A34A] font-black text-xs rounded-xl cursor-pointer self-end flex items-center gap-1.5 shadow-2xs shrink-0 transition-all active:scale-95"
                            >
                                <FiPlus className="w-4 h-4 text-[#16A34A]" /> Add Feature
                            </button>
                        </div>

                        {/* Quick Preset Feature Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Quick Add:</span>
                            {['Online Slot Booking', 'POS Integration', 'Revenue Analytics', 'Multi-Branch Support', '24/7 Priority Support'].map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => handleAddFeature(preset)}
                                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-[#16A34A] rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                >
                                    <FiPlus className="w-3 h-3 text-[#16A34A]" /> {preset}
                                </button>
                            ))}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2 mt-2">
                            {(formData.features || []).map((feat, idx) => (
                                <div 
                                    key={idx} 
                                    className="flex justify-between items-center bg-white border border-slate-200/80 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 shadow-2xs"
                                >
                                    <span className="flex items-center gap-2">
                                        <HiCheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                                        <span>{feat}</span>
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveFeature(idx)}
                                        className="text-slate-400 hover:text-red-600 transition cursor-pointer p-1 rounded-lg hover:bg-red-50"
                                        disabled={isSaving}
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            disabled={isSaving}
                            className="h-11 px-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button"
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="h-11 px-7 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 min-w-[140px]"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>{editingPlan ? "Update Plan" : "Create Plan"}</span>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Plan"
                message="Are you sure you want to delete this subscription plan? This action is permanent and cannot be undone."
                type="danger"
                disabled={isDeleting}
            />
        </div>
    )
}
