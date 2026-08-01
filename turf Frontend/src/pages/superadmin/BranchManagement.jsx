import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { FiEdit2, FiTrash2, FiPower, FiSearch, FiBriefcase, FiCheckCircle, FiSlash, FiTrendingUp, FiEye, FiMapPin, FiUser } from 'react-icons/fi'
import { getOwners } from '../../services/ownerService'
import { getAllPlans } from '../../services/subscriptionPlanService'
import {
    createBranch,
    getBranches,
    getBranchById,
    updateBranch,
    changeBranchStatus,
    deleteBranch,
    getDashboardStats
} from '../../services/branchService'

export default function BranchManagement() {
    const { addToast } = useToast()
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    // Enforce SUPER_ADMIN authorization
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/login')
            } else {
                const normalizeRole = (r) => (r || '').toUpperCase().replace(/[-_]/g, '');
                const rNorm = normalizeRole(user.role);
                if (rNorm !== 'SUPERADMIN') {
                    if (rNorm === 'OWNER') navigate('/dashboard/owner')
                    else if (rNorm === 'STAFF') navigate('/dashboard/staff')
                    else if (rNorm === 'CUSTOMER') navigate('/dashboard/customer')
                    else navigate('/login')
                }
            }
        }
    }, [user, authLoading, navigate])

    // Main States
    const [branches, setBranches] = useState([])
    const [stats, setStats] = useState({
        totalBranches: 0,
        activeBranches: 0,
        inactiveBranches: 0,
        totalRevenue: 0
    })

    // Pagination
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        pages: 1
    })

    // Dropdown options
    const [owners, setOwners] = useState([])
    const [subscriptionPlans, setSubscriptionPlans] = useState([])

    // Search and Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('ALL')
    const [selectedOwnerId, setSelectedOwnerId] = useState('ALL')
    const [selectedPlanId, setSelectedPlanId] = useState('ALL')

    // Modal and Confirmation Dialog
    const [modal, setModal] = useState(false)
    const [editingBranch, setEditingBranch] = useState(null)
    const [confirm, setConfirm] = useState({ open: false, type: '', id: null })

    // Modal for viewing branch details
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [viewingBranch, setViewingBranch] = useState(null)

    // Loading States
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [isTableLoading, setIsTableLoading] = useState(false)
    const [isSubmitLoading, setIsSubmitLoading] = useState(false)

    // Searchable dropdown state for owner selection
    const [ownerSearchText, setOwnerSearchText] = useState('')
    const [showOwnerDropdown, setShowOwnerDropdown] = useState(false)



    // Form Data reflecting full backend schema
    const [formData, setFormData] = useState({
        branchName: '',
        branchCode: '',
        description: '',
        ownerId: '',
        subscriptionPlanId: '',
        country: '',
        state: '',
        city: '',
        zipCode: '',
        fullAddress: '',
        email: '',
        mobile: '',
        alternateMobile: '',
        gstNumber: '',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        logo: '',
        status: 'ACTIVE'
    })

    // Fetch drop-down data once on load
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [ownersRes, plansRes] = await Promise.all([
                    getOwners({ limit: 1000 }),
                    getAllPlans()
                ])
                setOwners(ownersRes.data?.owners || [])
                setSubscriptionPlans(plansRes.data || [])
            } catch (error) {
                console.error('Error fetching configuration dropdowns:', error)
                addToast({ title: 'Config Error', message: 'Failed to load Owners or Plans', type: 'error' })
            }
        }
        if (user && user.role === 'SUPER_ADMIN') {
            fetchDropdowns()
        }
    }, [user])

    // Load statistics
    const loadStats = async () => {
        try {
            const res = await getDashboardStats()
            if (res.success) {
                setStats(res.data)
            }
        } catch (error) {
            console.error('Error loading stats:', error)
        }
    }

    // Convert and handle local photo selection
    const handleLogoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result }))
            }
            reader.readAsDataURL(file)
        }
    }

    // Load branches with filters, search, and pagination
    const loadBranches = async () => {
        try {
            setIsTableLoading(true)
            const filters = {
                page,
                limit,
                search: searchTerm,
                status: selectedStatus,
                ownerId: selectedOwnerId,
                subscriptionPlanId: selectedPlanId
            }
            const res = await getBranches(filters)
            if (res.success) {
                setBranches(res.data.branches || [])
                setPagination(res.data.pagination || { total: 0, page: 1, limit: 10, pages: 1 })
            }
        } catch (error) {
            console.error('Error loading branches:', error)
            const msg = error.response?.data?.message || 'Failed to retrieve branches list'
            addToast({ title: 'Error', message: msg, type: 'error' })
        } finally {
            setIsTableLoading(false)
        }
    }

    // Load branches reactively when pagination/filters update
    useEffect(() => {
        if (user && user.role === 'SUPER_ADMIN') {
            loadBranches()
            loadStats()
        }
    }, [user, page, searchTerm, selectedStatus, selectedOwnerId, selectedPlanId])

    // Fetch individual branch and load detail view modal
    const handleViewBranch = async (branch) => {
        try {
            setIsTableLoading(true)
            const res = await getBranchById(branch._id)
            if (res.success) {
                setViewingBranch(res.data)
                setIsViewModalOpen(true)
            }
        } catch (error) {
            console.error('Error fetching branch details:', error)
            addToast({ title: 'Error', message: 'Failed to retrieve branch details', type: 'error' })
        } finally {
            setIsTableLoading(false)
        }
    }

    // Fetch individual branch and load modal
    const handleOpenModal = async (branch = null) => {
        if (branch) {
            try {
                setIsTableLoading(true)
                const res = await getBranchById(branch._id)
                if (res.success) {
                    const fullBranch = res.data
                    setEditingBranch(fullBranch)
                    setOwnerSearchText(fullBranch.ownerId?.fullName || '')
                    setFormData({
                        branchName: fullBranch.branchName || '',
                        branchCode: fullBranch.branchCode || '',
                        description: fullBranch.description || '',
                        ownerId: fullBranch.ownerId?._id || fullBranch.ownerId || '',
                        subscriptionPlanId: fullBranch.subscriptionPlanId?._id || fullBranch.subscriptionPlanId || '',
                        country: fullBranch.country || '',
                        state: fullBranch.state || '',
                        city: fullBranch.city || '',
                        zipCode: fullBranch.zipCode || '',
                        fullAddress: fullBranch.fullAddress || '',
                        email: fullBranch.email || '',
                        mobile: fullBranch.mobile || '',
                        alternateMobile: fullBranch.alternateMobile || '',
                        gstNumber: fullBranch.gstNumber || '',
                        timezone: fullBranch.timezone || 'Asia/Kolkata',
                        currency: fullBranch.currency || 'INR',
                        logo: fullBranch.logo || '',
                        status: fullBranch.status || 'ACTIVE'
                    })
                    setModal(true)
                }
            } catch (error) {
                console.error('Error fetching branch details:', error)
                addToast({ title: 'Error', message: 'Failed to retrieve branch details', type: 'error' })
            } finally {
                setIsTableLoading(false)
            }
        } else {
            setEditingBranch(null)
            setOwnerSearchText('')
            setFormData({
                branchName: '',
                branchCode: '',
                description: '',
                ownerId: '',
                subscriptionPlanId: subscriptionPlans[0]?._id || '',
                country: '',
                state: '',
                city: '',
                zipCode: '',
                fullAddress: '',
                email: '',
                mobile: '',
                alternateMobile: '',
                gstNumber: '',
                timezone: 'Asia/Kolkata',
                currency: 'INR',
                logo: '',
                status: 'ACTIVE'
            })
            setModal(true)
        }
    }

    // Submit Create/Edit Form
    const handleSave = async () => {
        // Validation check
        if (!formData.branchName.trim() || !formData.ownerId || !formData.subscriptionPlanId || !formData.email.trim() || !formData.mobile.trim()) {
            addToast({ title: 'Required Fields', message: 'Please fill in all mandatory fields (*)', type: 'error' })
            return
        }

        try {
            setIsSubmitLoading(true)

            if (editingBranch) {
                const res = await updateBranch(editingBranch._id, formData)
                if (res.success) {
                    addToast({ title: 'Updated', message: 'Branch updated successfully', type: 'success' })
                    setModal(false)
                    loadBranches()
                    loadStats()
                }
            } else {
                const res = await createBranch(formData)
                if (res.success) {
                    addToast({ title: 'Created', message: 'New branch added successfully', type: 'success' })
                    setModal(false)
                    loadBranches()
                    loadStats()
                }
            }
        } catch (error) {
            console.error('Submit failed:', error)
            const msg = error.response?.data?.message || 'Submission failed'
            
            // Check for subscription limit check response
            if (msg.includes('Branch limit exceeded')) {
                addToast({ title: 'Subscription Limit', message: 'Branch limit exceeded for current subscription plan', type: 'error' })
                // Do NOT close modal
            } else {
                addToast({ title: 'Error', message: msg, type: 'error' })
            }
        } finally {
            setIsSubmitLoading(false)
        }
    }

    // Soft delete a branch
    const handleDelete = async () => {
        try {
            setIsTableLoading(true)
            const res = await deleteBranch(confirm.id)
            if (res.success) {
                addToast({ title: 'Deleted', message: 'Branch deleted successfully', type: 'success' })
                setConfirm({ open: false, type: '', id: null })
                loadBranches()
                loadStats()
            }
        } catch (error) {
            console.error('Delete failed:', error)
            const msg = error.response?.data?.message || 'Failed to remove branch'
            addToast({ title: 'Error', message: msg, type: 'error' })
        } finally {
            setIsTableLoading(false)
        }
    }

    // Toggle active status
    const handleToggleStatus = async () => {
        try {
            setIsTableLoading(true)
            const targetBranch = branches.find(b => b._id === confirm.id)
            if (!targetBranch) return

            const nextStatus = targetBranch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
            const res = await changeBranchStatus(confirm.id, nextStatus)
            if (res.success) {
                addToast({ title: 'Status Changed', message: `Branch status changed to ${nextStatus}`, type: 'success' })
                setConfirm({ open: false, type: '', id: null })
                loadBranches()
                loadStats()
            }
        } catch (error) {
            console.error('Status toggle failed:', error)
            const msg = error.response?.data?.message || 'Failed to toggle status'
            addToast({ title: 'Error', message: msg, type: 'error' })
        } finally {
            setIsTableLoading(false)
        }
    }

    // Handlers for pagination footer
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPage(newPage)
        }
    }

    // Table Column Config
    const columns = [
        { key: 'branchName', label: 'Branch Name' },
        { key: 'city', label: 'City' },
        { 
            key: 'ownerId', 
            label: 'Owner Name', 
            render: v => v?.fullName || 'N/A' 
        },
        { 
            key: 'subscriptionPlanId', 
            label: 'Subscription Plan', 
            render: v => v?.planName || 'N/A' 
        },
        { 
            key: 'status', 
            label: 'Status', 
            render: v => {
                const upper = (v || '').toUpperCase();
                const variant = upper === 'ACTIVE' ? 'success' : (upper === 'SUSPENDED' ? 'danger' : 'default');
                return <Badge variant={variant} dot>{upper}</Badge>
            } 
        },
        { 
            key: 'totalRevenue', 
            label: 'Revenue', 
            render: v => `₹${Number(v || 0).toLocaleString()}` 
        },
        { 
            key: 'createdAt', 
            label: 'Created Date', 
            render: v => v ? new Date(v).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A' 
        },
        { 
            key: 'actions', 
            label: 'Actions', 
            render: (_, r) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleViewBranch(r)} title="View Details"><FiEye /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleOpenModal(r)}><FiEdit2 /></Button>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className={r.status === 'ACTIVE' ? 'text-warning-600' : 'text-success-600'}
                        onClick={() => setConfirm({ open: true, type: 'status', id: r._id })}
                        title="Toggle Status"
                    >
                        <FiPower />
                    </Button>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-danger-600"
                        onClick={() => setConfirm({ open: true, type: 'delete', id: r._id })}
                        title="Delete Branch"
                    >
                        <FiTrash2 />
                    </Button>
                </div>
            )
        },
    ]

    // Automatically trigger initial statistics on render
    useEffect(() => {
        if (user && user.role === 'SUPER_ADMIN') {
            loadStats()
            setIsPageLoading(false)
        }
    }, [user])

    if (isPageLoading || authLoading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-surface-500 text-sm font-semibold">Loading Branch module configuration...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Branch Management</h1>
                    <p className="text-surface-500 text-sm mt-1">Manage all registered branches</p>
                </div>
                <Button onClick={() => handleOpenModal()}>+ Add Branch</Button>
            </div>

            {/* Dashboard Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <Card hover={true} className="border border-surface-200/60 shadow-soft relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Total Branches</p>
                            <p className="text-3xl font-extrabold text-surface-900 tracking-tight">{stats.totalBranches || 0}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-soft">
                            <FiBriefcase className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 h-1 w-full bg-indigo-500"></div>
                </Card>

                <Card hover={true} className="border border-surface-200/60 shadow-soft relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Active Branches</p>
                            <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">{stats.activeBranches || 0}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-soft">
                            <FiCheckCircle className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500"></div>
                </Card>

                <Card hover={true} className="border border-surface-200/60 shadow-soft relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Inactive Branches</p>
                            <p className="text-3xl font-extrabold text-danger-500 tracking-tight">{stats.inactiveBranches || 0}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-danger-500 shadow-soft">
                            <FiSlash className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 h-1 w-full bg-red-500"></div>
                </Card>

                <Card hover={true} className="border border-surface-200/60 shadow-soft relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Total Revenue</p>
                            <p className="text-3xl font-extrabold text-surface-900 tracking-tight">₹{Number(stats.totalRevenue || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-warning-500 shadow-soft">
                            <FiTrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 h-1 w-full bg-warning-500"></div>
                </Card>
            </div>

            {/* Toolbar for Search Box & Dropdown Filters */}
            <div className="p-5 flex flex-col md:flex-row gap-4 items-center justify-between border border-surface-200/80 rounded-2xl bg-white/40 shadow-soft backdrop-blur-sm">
                {/* Search Box */}
                <div className="relative w-full md:max-w-xs">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-surface-400">
                        <FiSearch className="w-5 h-5" />
                    </span>
                    <input 
                        type="text"
                        placeholder="Search name, city, owner..."
                        value={searchTerm}
                        onChange={e => {
                            setSearchTerm(e.target.value)
                            setPage(1)
                        }}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 placeholder:text-surface-400 font-medium shadow-sm"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                    <Select 
                        value={selectedStatus}
                        onChange={e => { setSelectedStatus(e.target.value); setPage(1); }}
                        options={[
                            { value: 'ALL', label: 'All Statuses' },
                            { value: 'ACTIVE', label: 'Active' },
                            { value: 'INACTIVE', label: 'Inactive' },
                            { value: 'SUSPENDED', label: 'Suspended' }
                        ]}
                        className="w-40"
                    />

                    <Select 
                        value={selectedOwnerId}
                        onChange={e => { setSelectedOwnerId(e.target.value); setPage(1); }}
                        options={[
                            { value: 'ALL', label: 'All Owners' },
                            ...owners.map(o => ({ value: o._id, label: o.fullName }))
                        ]}
                        className="w-48"
                    />

                    <Select 
                        value={selectedPlanId}
                        onChange={e => { setSelectedPlanId(e.target.value); setPage(1); }}
                        options={[
                            { value: 'ALL', label: 'All Plans' },
                            ...subscriptionPlans.map(p => {
                                const limit = p.monthlyPricing?.branchLimit ?? -1;
                                const limitStr = limit === -1 ? 'Unlimited' : limit;
                                return {
                                    value: p._id,
                                    label: `${p.planName} (Limit: ${limitStr})`
                                }
                            })
                        ]}
                        className="w-48"
                    />
                </div>
            </div>

            {/* Table Content Section */}
            <Card variant="glass" padding={false} className="border border-surface-200/60 shadow-soft-lg overflow-hidden">
                {isTableLoading ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center gap-4 py-12">
                        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-surface-500 text-sm font-semibold">Retrieving branches...</span>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-2xl border border-surface-200/50">
                            <table className="w-full text-sm font-sans">
                                <thead>
                                    <tr className="bg-surface-50 border-b border-surface-200">
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Branch Name</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">City</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Owner Name</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Subscription Plan</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Revenue</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Created Date</th>
                                        <th className="text-right px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider pr-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100">
                                    {branches.map((r, i) => (
                                        <tr key={r._id || i} className="bg-white hover:bg-surface-50 transition-colors">
                                            {/* Branch Info with Logo */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {r.logo ? (
                                                        <img 
                                                            src={r.logo} 
                                                            alt={r.branchName} 
                                                            className="w-10 h-10 rounded-xl object-cover border border-surface-200 bg-white"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-soft">
                                                            {((r.branchName || '').split(' ').map(n => n[0]).join('') || '?').substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold text-surface-900 text-sm">{r.branchName || 'N/A'}</div>
                                                        <div className="text-xs text-surface-400 font-medium">{r.branchCode}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* City */}
                                            <td className="px-5 py-4 whitespace-nowrap text-surface-700 font-medium text-sm">
                                                {r.city || 'N/A'}
                                            </td>

                                            {/* Owner Name */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-surface-800 text-sm">{r.ownerId?.fullName || 'N/A'}</div>
                                                {r.ownerId?.email && <div className="text-xs text-surface-400 font-medium mt-0.5">{r.ownerId.email}</div>}
                                            </td>

                                            {/* Subscription Plan */}
                                            <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-surface-700">
                                                {r.subscriptionPlanId?.planName || 'N/A'}
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {(() => {
                                                    const upper = (r.status || '').toUpperCase()
                                                    const variant = upper === 'ACTIVE' ? 'success' : (upper === 'SUSPENDED' ? 'danger' : 'default')
                                                    return <Badge variant={variant} dot>{upper}</Badge>
                                                })()}
                                            </td>

                                            {/* Revenue */}
                                            <td className="px-5 py-4 whitespace-nowrap text-surface-900 font-bold text-sm">
                                                ₹{Number(r.totalRevenue || 0).toLocaleString()}
                                            </td>

                                            {/* Created Date */}
                                            <td className="px-5 py-4 whitespace-nowrap text-surface-500 font-semibold text-sm">
                                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A'}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 whitespace-nowrap text-right pr-8">
                                                <div className="flex gap-1.5 justify-end items-center">
                                                    <button
                                                        onClick={() => handleViewBranch(r)}
                                                        className="p-2 rounded-xl text-surface-500 hover:text-primary-600 hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all duration-200 cursor-pointer"
                                                        title="View Details"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenModal(r)}
                                                        className="p-2 rounded-xl text-surface-500 hover:text-primary-600 hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all duration-200 cursor-pointer"
                                                        title="Edit Branch"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setConfirm({ open: true, type: 'status', id: r._id })}
                                                        className="p-2 rounded-xl text-surface-500 hover:text-warning-600 hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-all duration-200 cursor-pointer"
                                                        title="Toggle Status"
                                                    >
                                                        <FiPower className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setConfirm({ open: true, type: 'delete', id: r._id })}
                                                        className="p-2 rounded-xl text-danger-500 hover:text-danger-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200 cursor-pointer"
                                                        title="Delete Branch"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {branches.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="py-12 text-center text-surface-400 font-semibold text-sm">
                                                No branches available matching criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination footer */}
                        {pagination.pages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-surface-150 p-5 gap-4 bg-surface-50/20">
                                <p className="text-sm text-surface-500 font-medium">
                                    Showing <span className="font-semibold text-surface-700">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                                    <span className="font-semibold text-surface-700">
                                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                                    </span>{' '}
                                    of <span className="font-semibold text-surface-700">{pagination.total}</span> branches
                                </p>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={pagination.page === 1}
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex gap-1.5">
                                        {Array.from({ length: pagination.pages }, (_, index) => {
                                            const p = index + 1
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() => handlePageChange(p)}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-150 cursor-pointer ${
                                                        pagination.page === p
                                                            ? 'bg-primary-600 border-primary-600 text-white shadow-soft'
                                                            : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50 hover:border-surface-300'
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={pagination.page === pagination.pages}
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* In-depth 8-section Add/Edit Modal */}
            <Modal 
                isOpen={modal} 
                onClose={() => setModal(false)} 
                title={editingBranch ? "Edit Branch" : "Add New Branch"}
                size="lg"
            >
                <div className="pt-2 max-h-[70vh] overflow-y-auto pr-2 space-y-6">
                    {/* SECTION 1: Basic Information */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 1: Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="Branch Name *" 
                                placeholder="Enter branch name" 
                                value={formData.branchName}
                                onChange={e => setFormData({ ...formData, branchName: e.target.value })}
                            />
                            <Input 
                                label="Branch Code" 
                                placeholder="System Generated (e.g. BRA-001)" 
                                value={editingBranch ? formData.branchCode : 'System Generated (e.g. BRA-001)'}
                                disabled={true}
                            />
                            <div className="md:col-span-2">
                                <Input 
                                    label="Description" 
                                    placeholder="Enter branch description" 
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Owner Assignment */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 2: Owner Assignment</h3>
                        <div className="relative">
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">Assign Owner *</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type to search owners..."
                                    value={ownerSearchText}
                                    onChange={e => {
                                        setOwnerSearchText(e.target.value);
                                        setFormData(prev => ({ ...prev, ownerId: '' }));
                                        setShowOwnerDropdown(true);
                                    }}
                                    onFocus={() => setShowOwnerDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowOwnerDropdown(false), 200)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-500 bg-white text-surface-900 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 font-medium placeholder:text-surface-400"
                                />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-surface-400 text-xs">
                                    ▼
                                </span>
                            </div>
                            
                            {showOwnerDropdown && (
                                <div className="absolute z-50 w-full mt-1.5 bg-white border border-surface-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-surface-100 backdrop-blur-md">
                                    {owners
                                        .filter(o => 
                                            o.fullName.toLowerCase().includes(ownerSearchText.toLowerCase()) ||
                                            o.email.toLowerCase().includes(ownerSearchText.toLowerCase())
                                        )
                                        .map(o => (
                                            <div
                                                key={o._id}
                                                onClick={() => {
                                                    setOwnerSearchText(o.fullName);
                                                    setFormData(prev => ({ ...prev, ownerId: o._id }));
                                                    setShowOwnerDropdown(false);
                                                }}
                                                className="px-4 py-2.5 text-sm text-surface-700 hover:bg-primary-50 hover:text-primary-700 cursor-pointer transition-colors"
                                            >
                                                <div className="font-semibold">{o.fullName}</div>
                                                <div className="text-xs text-surface-400 mt-0.5">{o.email}</div>
                                            </div>
                                        ))}
                                    {owners.filter(o => 
                                        o.fullName.toLowerCase().includes(ownerSearchText.toLowerCase()) ||
                                        o.email.toLowerCase().includes(ownerSearchText.toLowerCase())
                                    ).length === 0 && (
                                        <div className="px-4 py-3 text-sm text-surface-400 text-center font-medium">No owners found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 3: Subscription Assignment */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 3: Subscription Plan</h3>
                        <Select 
                            label="Subscription Plan *" 
                            placeholder="Select Plan"
                            value={formData.subscriptionPlanId}
                            onChange={e => setFormData({ ...formData, subscriptionPlanId: e.target.value })}
                            options={subscriptionPlans.map(p => {
                                const limit = p.monthlyPricing?.branchLimit ?? -1;
                                const limitStr = limit === -1 ? 'Unlimited' : limit;
                                return {
                                    value: p._id,
                                    label: `${p.planName} (Limit: ${limitStr})`
                                }
                            })} 
                        />
                    </div>

                    {/* SECTION 4: Location Information */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 4: Location Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                label="Country" 
                                placeholder="e.g. India"
                                value={formData.country}
                                onChange={e => setFormData({ ...formData, country: e.target.value })}
                            />
                            <Input 
                                label="State" 
                                placeholder="e.g. Maharashtra"
                                value={formData.state}
                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                            />
                            <Input 
                                label="City" 
                                placeholder="e.g. Mumbai"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                            />
                            <Input 
                                label="Zip Code" 
                                placeholder="e.g. 400001"
                                value={formData.zipCode}
                                onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                            />
                            <div className="col-span-2">
                                <Input 
                                    label="Full Address" 
                                    placeholder="Enter complete physical address"
                                    value={formData.fullAddress}
                                    onChange={e => setFormData({ ...formData, fullAddress: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: Contact Information */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 5: Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="Email Address *" 
                                placeholder="e.g. branch@domain.com"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            <Input 
                                label="Mobile Number *" 
                                placeholder="Enter mobile number"
                                value={formData.mobile}
                                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                            />
                            <div className="md:col-span-2">
                                <Input 
                                    label="Alternate Mobile" 
                                    placeholder="Enter secondary contact number"
                                    value={formData.alternateMobile}
                                    onChange={e => setFormData({ ...formData, alternateMobile: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 6: Business Information */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 6: Business Details</h3>
                        <Input 
                            label="GST Number" 
                            placeholder="Enter 15-digit GSTIN number"
                            value={formData.gstNumber}
                            onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                        />
                    </div>

                    {/* SECTION 7: Settings */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 7: Settings</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                label="Timezone" 
                                placeholder="Asia/Kolkata"
                                value={formData.timezone}
                                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                            />
                            <Input 
                                label="Currency" 
                                placeholder="INR"
                                value={formData.currency}
                                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* SECTION 8: Logo Upload */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 8: Logo</h3>
                        <div className="flex items-center gap-4">
                            {formData.logo ? (
                                <img 
                                    src={formData.logo} 
                                    alt="Logo Preview" 
                                    className="w-16 h-16 rounded-xl object-cover border border-surface-250 bg-white"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-xl border border-dashed border-surface-300 bg-white flex items-center justify-center text-surface-400 text-xs font-semibold">
                                    No Image
                                </div>
                            )}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-surface-700 mb-1.5">Upload Logo</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    disabled={isSubmitLoading}
                                    className="block w-full text-xs text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-surface-100 file:text-surface-700 hover:file:bg-surface-200 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="flex gap-3 justify-end pt-3 border-t border-surface-150 bg-white sticky bottom-0">
                        <Button variant="secondary" onClick={() => setModal(false)} disabled={isSubmitLoading}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSubmitLoading}>
                            {isSubmitLoading ? 'Saving...' : (editingBranch ? "Update Branch" : "Create Branch")}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* View Branch Details Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false)
                    setViewingBranch(null)
                }}
                title="Branch Details"
                size="lg"
            >
                {viewingBranch && (
                    <div className="space-y-6 pt-2 max-h-[75vh] overflow-y-auto pr-2">
                        {/* Profile/Logo Header Card */}
                        <div className="bg-surface-50 p-5 rounded-2xl border border-surface-200/80 flex flex-col sm:flex-row items-center gap-5">
                            {viewingBranch.logo ? (
                                <img 
                                    src={viewingBranch.logo} 
                                    alt={viewingBranch.branchName} 
                                    className="w-20 h-20 rounded-2xl object-cover border border-surface-250 bg-white"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-soft">
                                    {((viewingBranch.branchName || '').split(' ').map(n => n[0]).join('') || '?').substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="text-center sm:text-left flex-1 space-y-1.5 font-sans">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                                    <h3 className="text-xl font-bold text-surface-900 leading-none">{viewingBranch.branchName}</h3>
                                    <div className="inline-flex justify-center sm:justify-start">
                                        {(() => {
                                            const upper = (viewingBranch.status || '').toUpperCase()
                                            const variant = upper === 'ACTIVE' ? 'success' : (upper === 'SUSPENDED' ? 'danger' : 'default')
                                            return <Badge variant={variant} dot>{upper}</Badge>
                                        })()}
                                    </div>
                                </div>
                                <p className="text-sm text-surface-500 font-medium">{viewingBranch.branchCode}</p>
                                {viewingBranch.description && (
                                    <p className="text-xs text-surface-400 font-normal italic">
                                        "{viewingBranch.description}"
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Details Sections */}
                        <div className="grid md:grid-cols-2 gap-5 font-sans">
                            {/* Section A: Business & Plan Details */}
                            <div className="bg-white p-5 rounded-2xl border border-surface-150 space-y-3.5 shadow-soft">
                                <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-100 pb-1.5 flex items-center gap-1.5">
                                    <FiBriefcase className="w-3.5 h-3.5" />
                                    Business & Subscription Plan
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Owner Name</p>
                                        <p className="text-surface-800 font-bold">{viewingBranch.ownerId?.fullName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Owner Email</p>
                                        <p className="text-surface-800 font-bold break-all">{viewingBranch.ownerId?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Subscription Plan</p>
                                        <p className="text-surface-800 font-bold text-primary-600">{viewingBranch.subscriptionPlanId?.planName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">GST Number</p>
                                        <p className="text-surface-800 font-bold">{viewingBranch.gstNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Timezone</p>
                                        <p className="text-surface-800 font-bold">{viewingBranch.timezone || 'Asia/Kolkata'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Currency</p>
                                        <p className="text-surface-800 font-bold">{viewingBranch.currency || 'INR'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section B: Financial & Metrics Performance */}
                            <div className="bg-white p-5 rounded-2xl border border-surface-150 space-y-3.5 shadow-soft">
                                <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-100 pb-1.5 flex items-center gap-1.5">
                                    <FiTrendingUp className="w-3.5 h-3.5" />
                                    Performance Metrics
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Total Bookings</p>
                                        <p className="text-surface-900 font-extrabold text-sm">{viewingBranch.totalBookings || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Total Revenue</p>
                                        <p className="text-emerald-600 font-extrabold text-sm">
                                            ₹{Number(viewingBranch.totalRevenue || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Created Date</p>
                                        <p className="text-surface-800 font-bold">
                                            {viewingBranch.createdAt ? new Date(viewingBranch.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section C: Contact Details */}
                            <div className="bg-white p-5 rounded-2xl border border-surface-150 space-y-3.5 shadow-soft">
                                <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-100 pb-1.5 flex items-center gap-1.5">
                                    <FiCheckCircle className="w-3.5 h-3.5" />
                                    Contact Information
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                                    <div className="col-span-2">
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Email Address</p>
                                        <p className="text-surface-800 font-bold">{viewingBranch.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Mobile Number</p>
                                        <p className="text-surface-800 font-bold">{viewingBranch.mobile || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Alternate Mobile</p>
                                        <p className="text-surface-800 font-bold">{viewingBranch.alternateMobile || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section D: Address Details */}
                            <div className="bg-white p-5 rounded-2xl border border-surface-150 space-y-3.5 shadow-soft">
                                <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-100 pb-1.5 flex items-center gap-1.5">
                                    <FiMapPin className="w-3.5 h-3.5" />
                                    Location Details
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">City</p>
                                        <p className="text-surface-800 font-bold">{viewingBranch.city || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">State</p>
                                        <p className="text-surface-800 font-bold">{viewingBranch.state || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Country</p>
                                        <p className="text-surface-800 font-bold">{viewingBranch.country || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Zip Code</p>
                                        <p className="text-surface-800 font-bold">{viewingBranch.zipCode || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Full Address</p>
                                        <p className="text-surface-850 font-medium leading-relaxed">{viewingBranch.fullAddress || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end pt-2 border-t border-surface-100 bg-white">
                            <Button onClick={() => {
                                setIsViewModalOpen(false)
                                setViewingBranch(null)
                            }}>Close Details</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirm Dialog for Status Toggle and Delete */}
            <ConfirmDialog 
                isOpen={confirm.open}
                onClose={() => setConfirm({ open: false, type: '', id: null })}
                onConfirm={confirm.type === 'delete' ? handleDelete : handleToggleStatus}
                title={confirm.type === 'delete' ? "Delete Branch" : "Change Branch Status"}
                message={confirm.type === 'delete' ? "Are you sure you want to delete this branch? This cannot be undone." : "Do you want to change the active status of this branch?"}
                type={confirm.type === 'delete' ? "danger" : "warning"}
            />
        </div>
    )
}
