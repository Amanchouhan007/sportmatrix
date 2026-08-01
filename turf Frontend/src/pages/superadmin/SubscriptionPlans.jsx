import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi'
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

    // Features Array Handlers
    const handleAddFeature = () => {
        if (newFeatureText.trim() === '') return
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, newFeatureText.trim()]
        }))
        setNewFeatureText('')
    }

    const handleRemoveFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, idx) => idx !== index)
        }))
    }

    // Save Form (Create or Update)
    const handleSave = async () => {
        // Front-end validations
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
            if (limitVal === '' || limitVal === undefined || limitVal === null) return -1; // Default to Unlimited
            const parsed = Number(limitVal);
            return isNaN(parsed) ? -1 : parsed;
        };

        // Prepare parsed payloads
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

        // Integrity check
        if (payload.monthlyPricing.price < 0 || payload.yearlyPricing.price < 0) {
            addToast({ title: 'Validation Error', message: 'Prices must be positive or zero', type: 'error' })
            return
        }

        setIsSaving(true)
        try {
            if (editingPlan) {
                await updatePlan(editingPlan._id, payload)
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

    // Soft delete plan
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

    // Toggle active status
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

    // Toggle popularity status
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

    // Convert -1 value to "Unlimited" for card outputs
    const formatLimit = (limit) => {
        return limit === -1 ? 'Unlimited' : limit
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Subscription Plans</h1>
                    <p className="text-surface-500 text-sm mt-1">Manage subscription tiers and limits</p>
                </div>
                <Button onClick={() => handleOpenModal()}>+ Create Plan</Button>
            </div>

            {isLoading ? (
                <div className="min-h-[300px] flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-surface-500 text-sm font-medium">Fetching subscription plans...</span>
                </div>
            ) : plans.length === 0 ? (
                <div className="min-h-[250px] bg-white rounded-2xl border border-surface-200 flex flex-col items-center justify-center p-8">
                    <p className="text-surface-500 text-sm font-medium">No subscription plans found.</p>
                    <Button variant="secondary" className="mt-4" onClick={() => handleOpenModal()}>Create your first plan</Button>
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map(p => (
                        <Card key={p._id} hover className="relative group overflow-hidden flex flex-col h-full">
                            {p.isPopular && (
                                <div className="absolute top-0 right-0 bg-accent-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-sm z-10">
                                    Most Popular
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-surface-900">{p.planName}</h3>
                                <button 
                                    onClick={() => handleToggleStatus(p._id, p.status)}
                                    disabled={statusUpdatingId === p._id}
                                    className="cursor-pointer disabled:opacity-50"
                                >
                                    <Badge variant={p.status === 'active' ? 'success' : 'default'} dot>
                                        {p.status.toUpperCase()}
                                    </Badge>
                                </button>
                            </div>

                            <p className="text-2xl font-bold text-primary-600 mb-1">
                                ₹{Number(p.monthlyPricing?.price || 0).toLocaleString()}
                                <span className="text-sm font-normal text-surface-500">/mo</span>
                            </p>
                            <p className="text-xs text-surface-400 mb-4">
                                ₹{Number(p.yearlyPricing?.price || 0).toLocaleString()} / year
                            </p>

                            {p.description && (
                                <p className="text-xs text-surface-500 mb-4 italic line-clamp-2">
                                    {p.description}
                                </p>
                            )}

                            {/* Limits list */}
                            <div className="space-y-3 text-sm border-t border-surface-100 pt-4 mt-auto">
                                <div className="flex justify-between">
                                    <span className="text-surface-500">Branches</span>
                                    <span className="font-medium text-surface-900">{formatLimit(p.monthlyPricing?.branchLimit)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-surface-500">Sports</span>
                                    <span className="font-medium text-surface-900">{formatLimit(p.monthlyPricing?.sportsLimit)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-surface-500">Bookings/mo</span>
                                    <span className="font-medium text-surface-900">{formatLimit(p.monthlyPricing?.bookingLimit)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-surface-500">Active Users</span>
                                    <span className="font-medium text-surface-900">{formatLimit(p.monthlyPricing?.activeUsersLimit)}</span>
                                </div>
                            </div>

                            {/* Popular toggle button on card */}
                            <div className="mt-4 pt-3 border-t border-dashed border-surface-100 flex items-center justify-between">
                                <span className="text-xs text-surface-400">Popularity Status</span>
                                <button
                                    onClick={() => handleTogglePopular(p._id, p.isPopular)}
                                    disabled={popularUpdatingId === p._id}
                                    className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer disabled:opacity-50 ${p.isPopular ? 'bg-amber-50 border-amber-200 text-amber-600 font-bold' : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300'}`}
                                >
                                    {p.isPopular ? '⭐ Popular' : '☆ Mark Popular'}
                                </button>
                            </div>

                            {/* Features Preview */}
                            {p.features && p.features.length > 0 && (
                                <div className="mt-4">
                                    <span className="text-[10px] uppercase tracking-widest text-surface-400 font-bold">Features Included</span>
                                    <ul className="text-xs space-y-1.5 mt-1.5">
                                        {p.features.slice(0, 3).map((feat, i) => (
                                            <li key={i} className="text-surface-600 flex items-center gap-1.5">
                                                <span className="text-primary-500 font-bold">•</span> {feat}
                                            </li>
                                        ))}
                                        {p.features.length > 3 && (
                                            <li className="text-surface-400 text-[10px] italic">+{p.features.length - 3} more features</li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mt-6">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    fullWidth
                                    onClick={() => handleOpenModal(p)}
                                >
                                    Edit Settings
                                </Button>
                                <Button 
                                    variant="danger" 
                                    size="sm" 
                                    fullWidth
                                    onClick={() => {
                                        setPlanToDelete(p._id)
                                        setIsConfirmOpen(true)
                                    }}
                                >
                                    Delete Plan
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPlan ? "Edit Subscription Plan" : "Create New Plan"}
                size="lg"
            >
                <div className="space-y-6 pt-2">
                    {/* SECTION 1: Basic Information */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-surface-800 uppercase tracking-widest border-b border-surface-100 pb-1">
                            Section 1: Basic Information
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input 
                                label="Plan Name" 
                                placeholder="e.g. Basic, Pro, Enterprise" 
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
                        {/* Switch for isPopular */}
                        <div className="flex items-center gap-3 bg-surface-50 p-3 rounded-xl border border-surface-200">
                            <button
                                type="button"
                                role="switch"
                                disabled={isSaving}
                                aria-checked={formData.isPopular}
                                onClick={() => setFormData(prev => ({ ...prev, isPopular: !prev.isPopular }))}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.isPopular ? 'bg-primary-600' : 'bg-surface-200'}`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isPopular ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                            <div>
                                <span className="block text-sm font-semibold text-surface-900">Mark As Popular Plan</span>
                                <span className="block text-xs text-surface-500">Highlights this card on the client pricing view</span>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Monthly Pricing */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-surface-800 uppercase tracking-widest border-b border-surface-100 pb-1">
                            Section 2: Monthly Pricing
                        </h4>
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
                                label="Branch Limit" 
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

                    {/* SECTION 3: Yearly Pricing */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-surface-800 uppercase tracking-widest border-b border-surface-100 pb-1">
                            Section 3: Yearly Pricing
                        </h4>
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
                                label="Branch Limit" 
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

                    {/* SECTION 4: Features */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-surface-800 uppercase tracking-widest border-b border-surface-100 pb-1">
                            Section 4: Features List
                        </h4>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="e.g. POS Billing, Wallet System" 
                                value={newFeatureText}
                                onChange={e => setNewFeatureText(e.target.value)}
                                className="flex-1"
                                disabled={isSaving}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                            />
                            <Button 
                                variant="secondary" 
                                onClick={handleAddFeature}
                                disabled={isSaving}
                                className="self-end"
                            >
                                <FiPlus className="w-4 h-4 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {formData.features.map((feat, idx) => (
                                <div 
                                    key={idx} 
                                    className="flex justify-between items-center bg-surface-50 border border-surface-200 px-3.5 py-2 rounded-xl text-xs text-surface-700"
                                >
                                    <span>{feat}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveFeature(idx)}
                                        className="text-danger-500 hover:text-danger-700 transition cursor-pointer"
                                        disabled={isSaving}
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-surface-100 pt-4 mt-6">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : (editingPlan ? "Update Plan" : "Create Plan")}
                        </Button>
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
