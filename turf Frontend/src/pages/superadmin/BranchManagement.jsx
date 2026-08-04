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
import { FiEdit2, FiTrash2, FiPower, FiSearch, FiBriefcase, FiCheckCircle, FiSlash, FiTrendingUp, FiEye, FiMapPin, FiUser, FiDownload, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi'
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
                    if (rNorm === 'OWNER') navigate('/admin')
                    else if (rNorm === 'STAFF') navigate('/staff')
                    else if (rNorm === 'CUSTOMER') navigate('/customer')
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
                const rawOwners = ownersRes.data?.owners || []
                const normalizedOwners = rawOwners.map(o => ({
                    ...o,
                    _id: o._id || o.id,
                    fullName: o.fullName || o.name || o.ownerName || 'Owner',
                    email: o.email || ''
                }))
                setOwners(normalizedOwners)
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
                    setOwnerSearchText(fullBranch.ownerId?.fullName || fullBranch.ownerId?.name || '')
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
        const finalOwnerId = formData.ownerId || owners[0]?._id || owners[0]?.id || 'own_001'
        const finalPlanId = formData.subscriptionPlanId || subscriptionPlans[0]?._id || 'plan_starter'

        // Validation check for mandatory inputs
        if (!formData.branchName.trim()) {
            addToast({ title: 'Required Field', message: 'Please enter a Branch Name', type: 'error' })
            return
        }
        if (!formData.email.trim()) {
            addToast({ title: 'Required Field', message: 'Please enter an Email Address', type: 'error' })
            return
        }
        if (!formData.mobile.trim()) {
            addToast({ title: 'Required Field', message: 'Please enter a Mobile Number', type: 'error' })
            return
        }

        const payload = {
            ...formData,
            ownerId: finalOwnerId,
            subscriptionPlanId: finalPlanId
        }

        try {
            setIsSubmitLoading(true)

            if (editingBranch) {
                const res = await updateBranch(editingBranch._id, payload)
                if (res.success) {
                    addToast({ title: 'Updated', message: 'Branch updated successfully', type: 'success' })
                    setModal(false)
                    loadBranches()
                    loadStats()
                }
            } else {
                const res = await createBranch(payload)
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

    const handleExportCSV = () => {
        if (!branches || branches.length === 0) {
            addToast({ title: 'Export Failed', message: 'No branch data available to export', type: 'error' })
            return
        }
        const headers = ['Branch Name', 'Branch Code', 'City', 'Owner Name', 'Owner Email', 'Plan', 'Status', 'Revenue', 'Created Date']
        const rows = branches.map(b => [
            `"${b.branchName || ''}"`,
            `"${b.branchCode || ''}"`,
            `"${b.city || ''}"`,
            `"${b.ownerId?.fullName || ''}"`,
            `"${b.ownerId?.email || ''}"`,
            `"${b.subscriptionPlanId?.planName || ''}"`,
            `"${b.status || ''}"`,
            `"${b.totalRevenue || 0}"`,
            `"${b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ''}"`
        ])
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `Branches_Export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        addToast({ title: 'Export Success', message: 'Branch data exported as CSV file', type: 'success' })
    }

    if (isPageLoading || authLoading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-surface-500 text-sm font-semibold">Loading Branch module configuration...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6 bg-[#F6F8FC] min-h-screen p-6 rounded-3xl animate-in fade-in duration-500">
            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 p-6 rounded-3xl border border-indigo-100/60 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight">Branch Management</h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Manage and monitor all registered turf branches across India</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 text-xs font-bold text-surface-700 hover:text-emerald-600 transition-colors px-4 py-2.5 rounded-2xl bg-white hover:bg-surface-50 border border-surface-200/80 shadow-soft cursor-pointer"
                    >
                        <FiDownload className="w-4 h-4 text-emerald-600" /> Export CSV
                    </button>
                    <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-emerald-500/20">
                        + Add Branch
                    </Button>
                </div>
            </div>

            {/* Dashboard Cards Grid (4 StatCards) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    label="Total Branches"
                    value={stats.totalBranches || 0}
                    icon={<FiBriefcase />}
                    colorTheme="indigo"
                />

                <StatCard
                    label="Active Branches"
                    value={stats.activeBranches || 0}
                    icon={<FiCheckCircle />}
                    colorTheme="emerald"
                />

                <StatCard
                    label="Inactive Branches"
                    value={stats.inactiveBranches || 0}
                    icon={<FiSlash />}
                    colorTheme="rose"
                />

                <StatCard
                    label="Total Revenue"
                    value={`₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`}
                    icon={<FiTrendingUp />}
                    colorTheme="amber"
                />
            </div>

            {/* Modern Unified Toolbar (Search + Filters + Summary) */}
            <div className="p-5 border border-surface-200/80 rounded-3xl bg-white shadow-soft space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Search Input */}
                    <div className="relative w-full lg:max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-surface-400">
                            <FiSearch className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by branch name, code, city, owner..."
                            value={searchTerm}
                            onChange={e => {
                                setSearchTerm(e.target.value)
                                setPage(1)
                            }}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-surface-400 font-medium shadow-soft"
                        />
                    </div>

                    {/* Filter Select Dropdowns */}
                    <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                        <Select
                            value={selectedStatus}
                            onChange={e => { setSelectedStatus(e.target.value); setPage(1); }}
                            options={[
                                { value: 'ALL', label: 'All Statuses' },
                                { value: 'ACTIVE', label: '🟢 Active' },
                                { value: 'INACTIVE', label: '🔴 Inactive' },
                                { value: 'SUSPENDED', label: '🟡 Suspended' }
                            ]}
                            className="w-40"
                        />

                        <Select
                            value={selectedOwnerId}
                            onChange={e => { setSelectedOwnerId(e.target.value); setPage(1); }}
                            options={[
                                { value: 'ALL', label: 'All Owners' },
                                ...owners.map(o => ({ value: o._id || o.id, label: o.fullName || o.name || 'Owner' }))
                            ]}
                            className="w-44"
                        />

                        <Select
                            value={selectedPlanId}
                            onChange={e => { setSelectedPlanId(e.target.value); setPage(1); }}
                            options={[
                                { value: 'ALL', label: 'All Plans' },
                                ...subscriptionPlans.map(p => ({ value: p._id, label: p.planName }))
                            ]}
                            className="w-44"
                        />
                    </div>
                </div>

                {/* Summary bar below search */}
                <div className="flex items-center justify-between text-xs font-semibold text-surface-500 pt-2 border-t border-surface-100">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Showing <strong className="text-surface-900">{branches.length}</strong> of <strong className="text-surface-900">{pagination.total}</strong> Branches</span>
                    </div>
                    <div className="text-surface-400">Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </div>

            {/* Premium Card-Style Data Grid Container */}
            <div className="rounded-3xl border border-surface-200/80 shadow-soft bg-white overflow-hidden p-6 space-y-4">
                {/* 1. Premium Header Strip (Normal case 15px, Light Gray/Blue background #F8FAFC) */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#F8FAFC] rounded-2xl border border-surface-200/60 text-[15px] font-semibold text-surface-700 items-center">
                    <div className="col-span-3">Branch Name</div>
                    <div className="col-span-2">City</div>
                    <div className="col-span-2">Owner</div>
                    <div className="col-span-1">Plan</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1 text-right">Revenue</div>
                    <div className="col-span-2 text-right pr-4">Actions</div>
                </div>

                {/* Loading State */}
                {isTableLoading ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center gap-4 py-12">
                        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-surface-500 text-sm font-semibold">Retrieving branches...</span>
                    </div>
                ) : branches.length === 0 ? (
                    <div className="text-center py-16 text-surface-400 font-semibold text-sm bg-[#F8FAFC] rounded-2xl border border-dashed border-surface-200">
                        No branches found matching your search or filters.
                    </div>
                ) : (
                    /* 2. Individual Card-Style Rows with 10-12px gaps (Linear / Stripe SaaS feel) */
                    <div className="space-y-3">
                        {branches.map((r, i) => (
                            <div
                                key={r._id || i}
                                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 bg-white hover:bg-blue-50/30 rounded-2xl border border-surface-200/80 shadow-soft hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300 transition-all duration-200 items-center min-h-[76px]"
                            >
                                {/* Branch Name & Avatar */}
                                <div className="col-span-3 flex items-center gap-3.5">
                                    {r.logo ? (
                                        <img
                                            src={r.logo}
                                            alt={r.branchName}
                                            className="w-11 h-11 rounded-2xl object-cover border border-surface-200 bg-white shadow-soft"
                                        />
                                    ) : (
                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center text-white text-xs font-black shadow-soft tracking-wider">
                                            {((r.branchName || '').split(' ').map(n => n[0]).join('') || '?').substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="truncate">
                                        <div className="font-bold text-surface-900 text-sm tracking-tight truncate">{r.branchName || 'N/A'}</div>
                                        <div className="text-xs text-surface-400 font-semibold">{r.branchCode || '—'}</div>
                                    </div>
                                </div>

                                {/* City */}
                                <div className="col-span-2 text-surface-700 font-semibold text-sm flex items-center gap-1.5 truncate">
                                    <FiMapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span className="truncate">{r.city || 'N/A'}</span>
                                </div>

                                {/* Owner */}
                                <div className="col-span-2 truncate">
                                    <div className="font-semibold text-surface-800 text-sm flex items-center gap-1.5 truncate">
                                        <FiUser className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                        <span className="truncate">{r.ownerId?.fullName || 'N/A'}</span>
                                    </div>
                                    {r.ownerId?.email && <div className="text-xs text-surface-400 truncate">{r.ownerId.email}</div>}
                                </div>

                                {/* Plan */}
                                <div className="col-span-1 text-sm font-bold text-surface-800">
                                    <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80 text-xs font-bold">
                                        {r.subscriptionPlanId?.planName || 'Standard'}
                                    </span>
                                </div>

                                {/* Status Badge */}
                                <div className="col-span-1">
                                    {(() => {
                                        const upper = (r.status || '').toUpperCase()
                                        if (upper === 'ACTIVE') {
                                            return (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold shadow-sm">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                                                </span>
                                            )
                                        } else if (upper === 'SUSPENDED') {
                                            return (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-xs font-bold shadow-sm">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Suspended
                                                </span>
                                            )
                                        } else {
                                            return (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-xs font-bold shadow-sm">
                                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Inactive
                                                </span>
                                            )
                                        }
                                    })()}
                                </div>

                                {/* Revenue */}
                                <div className="col-span-1 text-right">
                                    <span className="text-emerald-600 font-black text-base tracking-tight">
                                        ₹{Number(r.totalRevenue || 0).toLocaleString('en-IN')}
                                    </span>
                                </div>

                                {/* Actions - 40x40 Rounded Square Light Background Buttons */}
                                <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                                    <button
                                        onClick={() => handleViewBranch(r)}
                                        className="w-10 h-10 rounded-xl bg-slate-100/90 hover:bg-emerald-500 text-surface-600 hover:text-white border border-surface-200/60 hover:border-emerald-500 transition-all duration-200 shadow-soft flex items-center justify-center cursor-pointer"
                                        title="View Details"
                                    >
                                        <FiEye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(r)}
                                        className="w-10 h-10 rounded-xl bg-slate-100/90 hover:bg-indigo-500 text-surface-600 hover:text-white border border-surface-200/60 hover:border-indigo-500 transition-all duration-200 shadow-soft flex items-center justify-center cursor-pointer"
                                        title="Edit Branch"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setConfirm({ open: true, type: 'status', id: r._id })}
                                        className="w-10 h-10 rounded-xl bg-slate-100/90 hover:bg-amber-500 text-surface-600 hover:text-white border border-surface-200/60 hover:border-amber-500 transition-all duration-200 shadow-soft flex items-center justify-center cursor-pointer"
                                        title="Toggle Status"
                                    >
                                        <FiPower className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setConfirm({ open: true, type: 'delete', id: r._id })}
                                        className="w-10 h-10 rounded-xl bg-slate-100/90 hover:bg-rose-500 text-surface-600 hover:text-white border border-surface-200/60 hover:border-rose-500 transition-all duration-200 shadow-soft flex items-center justify-center cursor-pointer"
                                        title="Delete Branch"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 11. Modern SaaS Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-surface-150 pt-5 mt-4 gap-4">
                        <p className="text-xs text-surface-500 font-semibold">
                            Showing <span className="font-bold text-surface-900">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                            <span className="font-bold text-surface-900">
                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                            </span>{' '}
                            of <span className="font-bold text-surface-900">{pagination.total}</span> entries
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => handlePageChange(pagination.page - 1)}
                                className="px-4 py-2 text-xs font-bold rounded-xl border border-surface-200 bg-white hover:bg-surface-50 disabled:opacity-40 disabled:hover:bg-white text-surface-700 transition-all cursor-pointer shadow-soft flex items-center gap-1"
                            >
                                <FiChevronLeft className="w-3.5 h-3.5" /> Previous
                            </button>
                            <div className="flex gap-1.5">
                                {Array.from({ length: pagination.pages }, (_, index) => {
                                    const p = index + 1
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            className={`w-9 h-9 text-xs font-bold rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-center ${
                                                pagination.page === p
                                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-soft'
                                                    : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50 hover:border-emerald-300'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                })}
                            </div>
                            <button
                                disabled={pagination.page === pagination.pages}
                                onClick={() => handlePageChange(pagination.page + 1)}
                                className="px-4 py-2 text-xs font-bold rounded-xl border border-surface-200 bg-white hover:bg-surface-50 disabled:opacity-40 disabled:hover:bg-white text-surface-700 transition-all cursor-pointer shadow-soft flex items-center gap-1"
                            >
                                Next <FiChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

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
                                        .filter(o => {
                                            const nameStr = String(o?.fullName || o?.name || o?.ownerName || '').toLowerCase()
                                            const emailStr = String(o?.email || '').toLowerCase()
                                            const queryStr = String(ownerSearchText || '').toLowerCase()
                                            return nameStr.includes(queryStr) || emailStr.includes(queryStr)
                                        })
                                        .map(o => {
                                            const ownerIdVal = o?._id || o?.id
                                            const ownerNameStr = o?.fullName || o?.name || o?.ownerName || 'Owner'
                                            const ownerEmailStr = o?.email || ''

                                            return (
                                                <div
                                                    key={ownerIdVal || Math.random()}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault()
                                                        setOwnerSearchText(ownerNameStr)
                                                        setFormData(prev => ({ ...prev, ownerId: ownerIdVal }))
                                                        setShowOwnerDropdown(false)
                                                    }}
                                                    className="px-4 py-2.5 text-sm text-surface-700 hover:bg-primary-50 hover:text-primary-700 cursor-pointer transition-colors"
                                                >
                                                    <div className="font-semibold">{ownerNameStr}</div>
                                                    {ownerEmailStr && <div className="text-xs text-surface-400 mt-0.5">{ownerEmailStr}</div>}
                                                </div>
                                            )
                                        })}
                                    {owners.filter(o => {
                                        const nameStr = String(o?.fullName || o?.name || o?.ownerName || '').toLowerCase()
                                        const emailStr = String(o?.email || '').toLowerCase()
                                        const queryStr = String(ownerSearchText || '').toLowerCase()
                                        return nameStr.includes(queryStr) || emailStr.includes(queryStr)
                                    }).length === 0 && (
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
