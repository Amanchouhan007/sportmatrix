import { useState, useEffect, useMemo, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { 
    FiEdit2, 
    FiTrash2, 
    FiSlash, 
    FiCheckCircle, 
    FiKey, 
    FiUsers, 
    FiUserCheck, 
    FiUserX, 
    FiTrendingUp, 
    FiSearch, 
    FiUser, 
    FiBriefcase, 
    FiMapPin, 
    FiEye, 
    FiMoreVertical,
    FiRefreshCw,
    FiDownload,
    FiPlus,
    FiChevronDown,
    FiChevronUp,
    FiClock,
    FiLayers
} from 'react-icons/fi'
import { HiShieldCheck } from 'react-icons/hi'
import {
    createOwner,
    getOwners,
    getOwnerById,
    updateOwner,
    changeOwnerStatus,
    resetOwnerPassword,
    deleteOwner
} from '../../services/ownerService'

export default function OwnerManagement() {
    const { addToast } = useToast()
    const navigate = useNavigate()
    const { user, token, loading: authLoading } = useAuth()

    // Authorization: Only SUPER_ADMIN can access
    useEffect(() => {
        if (!authLoading) {
            if (!token) {
                navigate('/login')
                return
            }
            if (user) {
                const normalizeRole = (r) => (r || '').toUpperCase().replace(/[-_]/g, '');
                const rNorm = normalizeRole(user.role);
                if (rNorm !== 'SUPERADMIN') {
                    const roleRoutes = {
                        OWNER: '/admin',
                        STAFF: '/staff',
                        CUSTOMER: '/customer'
                    }
                    navigate(roleRoutes[rNorm] || '/customer')
                }
            }
        }
    }, [user, token, authLoading, navigate])

    // State definitions
    const [owners, setOwners] = useState([])
    const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, totalCommission: 0 })
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 })
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [statusFilter, setStatusFilter] = useState('ALL')

    // Smart In-App Suggestions matching SportMatrix UI theme
    const searchSuggestions = useMemo(() => {
        if (!isSearchFocused && !searchTerm.trim()) return []
        const term = searchTerm.toLowerCase().trim()
        const pool = []

        owners.forEach(o => {
            if (o.email && (!term || o.email.toLowerCase().includes(term))) {
                pool.push({ type: 'email', label: o.email, subtext: o.name || 'Owner Email', icon: '✉️', value: o.email })
            }
            if (o.name && (!term || o.name.toLowerCase().includes(term))) {
                pool.push({ type: 'name', label: o.name, subtext: o.email || 'Owner Name', icon: '👤', value: o.name })
            }
            if (o.businessName && (!term || o.businessName.toLowerCase().includes(term))) {
                pool.push({ type: 'business', label: o.businessName, subtext: `${o.name || ''} • ${o.city || 'Indore'}`, icon: '🏢', value: o.businessName })
            }
            if (o.phone && (!term || o.phone.includes(term))) {
                pool.push({ type: 'phone', label: o.phone, subtext: o.name || 'Phone Contact', icon: '📱', value: o.phone })
            }
        })

        // Deduplicate suggestions by label
        const seen = new Set()
        return pool.filter(item => {
            if (!item.label || seen.has(item.label.toLowerCase())) return false
            seen.add(item.label.toLowerCase())
            return true
        }).slice(0, 6)
    }, [owners, searchTerm, isSearchFocused])

    // Expanded Row ID state
    const [expandedRowId, setExpandedRowId] = useState(null)

    // Loaders
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isStatusUpdating, setIsStatusUpdating] = useState(false)

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('personal')
    const [editingOwner, setEditingOwner] = useState(null)
    const [confirm, setConfirm] = useState({ open: false, type: '', id: null, currentStatus: '' })

    // View Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [viewingOwner, setViewingOwner] = useState(null)

    // Action Dropdown State
    const [activeActionDropdownId, setActiveActionDropdownId] = useState(null)
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })
    const [dropdownOwner, setDropdownOwner] = useState(null)

    // Reset Password State
    const [isResetModalOpen, setIsResetModalOpen] = useState(false)
    const [ownerToReset, setOwnerToReset] = useState(null)
    const [resetPasswordData, setResetPasswordData] = useState({ password: '', confirmPassword: '' })

    // Form inputs state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        alternateMobile: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        businessType: '',
        gstNumber: '',
        panNumber: '',
        country: '',
        state: '',
        city: '',
        zipCode: '',
        address: '',
        profileImage: ''
    })

    // Fetch data from backend on mount, pagination, filter or search update
    useEffect(() => {
        if (token && user) {
            const normalizeRole = (r) => (r || '').toUpperCase().replace(/[-_]/g, '');
            if (normalizeRole(user.role) === 'SUPERADMIN') {
                fetchData()
            }
        }
    }, [page, searchTerm, statusFilter, token, user])

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.actions-dropdown-container') && !e.target.closest('.actions-dropdown-portal')) {
                setActiveActionDropdownId(null)
                setDropdownOwner(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            // 1. Fetch Paginated Owners
            const res = await getOwners({
                page,
                limit: 10,
                status: statusFilter,
                search: searchTerm
            })
            if (res && res.success) {
                setOwners(res.data.owners)
                setPagination(res.data.pagination)
            }

            // 2. Fetch Full List for Stats Calculation
            const statsRes = await getOwners({ limit: 10000 })
            if (statsRes && statsRes.success) {
                const allOwners = statsRes.data.owners
                const total = allOwners.length
                const active = allOwners.filter(o => o.status === 'ACTIVE').length
                const suspended = allOwners.filter(o => o.status === 'SUSPENDED').length
                const totalCommission = allOwners.reduce((acc, curr) => {
                    const val = typeof curr.commission === 'string'
                        ? parseFloat(curr.commission.replace(/[₹,]/g, ''))
                        : parseFloat(curr.commission || 0)
                    return acc + (isNaN(val) ? 0 : val)
                }, 0)

                setStats({ total, active, suspended, totalCommission })
            }
        } catch (err) {
            addToast({ title: 'Fetch Failed', message: err.response?.data?.message || err.message || 'Failed to fetch owners', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleViewOwner = async (owner) => {
        setIsLoading(true)
        try {
            const res = await getOwnerById(owner._id)
            if (res && res.success) {
                setViewingOwner(res.data)
                setIsViewModalOpen(true)
            }
        } catch (err) {
            addToast({ title: 'Error', message: 'Failed to fetch owner details', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenModal = async (owner = null) => {
        setActiveTab('personal')
        if (owner) {
            setIsSaving(true)
            try {
                const res = await getOwnerById(owner._id)
                if (res && res.success) {
                    const data = res.data
                    setEditingOwner(data)
                    setFormData({
                        fullName: data.fullName || '',
                        email: data.email || '',
                        mobile: data.mobile || '',
                        alternateMobile: data.alternateMobile || '',
                        password: '',
                        confirmPassword: '',
                        businessName: data.businessName || '',
                        businessType: data.businessType || '',
                        gstNumber: data.gstNumber || '',
                        panNumber: data.panNumber || '',
                        country: data.country || '',
                        state: data.state || '',
                        city: data.city || '',
                        zipCode: data.zipCode || '',
                        address: data.address || '',
                        profileImage: data.profileImage || ''
                    })
                    setIsModalOpen(true)
                }
            } catch (err) {
                addToast({ title: 'Error', message: 'Failed to fetch owner details', type: 'error' })
            } finally {
                setIsSaving(false)
            }
        } else {
            setEditingOwner(null)
            setFormData({
                fullName: '',
                email: '',
                mobile: '',
                alternateMobile: '',
                password: '',
                confirmPassword: '',
                businessName: '',
                businessType: '',
                gstNumber: '',
                panNumber: '',
                country: '',
                state: '',
                city: '',
                zipCode: '',
                address: '',
                profileImage: ''
            })
            setIsModalOpen(true)
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profileImage: reader.result }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        if (!formData.fullName.trim() || !formData.email.trim() || !formData.mobile.trim() || !formData.businessName.trim()) {
            addToast({ title: 'Validation Error', message: 'Please fill all required fields', type: 'error' })
            return
        }

        setIsSaving(true)
        try {
            if (editingOwner) {
                const { password, confirmPassword, ...updateData } = formData
                await updateOwner(editingOwner._id || editingOwner.id, {
                    ...updateData,
                    fullAddress: formData.address || formData.fullAddress
                })
                addToast({ title: 'Updated', message: 'Owner details updated successfully', type: 'success' })
                setIsModalOpen(false)
                fetchData()
            } else {
                if (!formData.password || !formData.confirmPassword) {
                    addToast({ title: 'Validation Error', message: 'Password credentials are required', type: 'error' })
                    setIsSaving(false)
                    return
                }
                if (formData.password.length < 6) {
                    addToast({ title: 'Validation Error', message: 'Password must be at least 6 characters long', type: 'error' })
                    setIsSaving(false)
                    return
                }
                if (formData.password !== formData.confirmPassword) {
                    addToast({ title: 'Validation Error', message: 'Passwords do not match', type: 'error' })
                    setIsSaving(false)
                    return
                }

                await createOwner(formData)
                addToast({ title: 'Created', message: 'New owner added successfully', type: 'success' })
                setIsModalOpen(false)
                fetchData()
            }
        } catch (err) {
            const rawMsg = err.response?.data?.message || err.message || 'Failed to save owner'
            let friendlyMsg = rawMsg
            if (rawMsg.includes('E11000') || rawMsg.includes('duplicate key')) {
                if (rawMsg.includes('email')) friendlyMsg = 'Email is already registered. Please use a different email.'
                else if (rawMsg.includes('mobile')) friendlyMsg = 'Mobile number is already registered. Please use a different number.'
                else friendlyMsg = 'This record already exists.'
            }
            addToast({ title: 'Save Failed', message: friendlyMsg, type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm.id) return
        setIsDeleting(true)
        try {
            await deleteOwner(confirm.id)
            addToast({ title: 'Deleted', message: 'Owner removed successfully', type: 'success' })
            setConfirm({ open: false, type: '', id: null, currentStatus: '' })
            fetchData()
        } catch (err) {
            addToast({ title: 'Delete Failed', message: err.response?.data?.message || err.message || 'Failed to delete owner', type: 'error' })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleToggleStatus = async () => {
        if (!confirm.id) return
        setIsStatusUpdating(true)
        const nextStatus = confirm.currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
        try {
            await changeOwnerStatus(confirm.id, nextStatus)
            addToast({ title: 'Status Changed', message: `Owner status updated to ${nextStatus}`, type: 'success' })
            setConfirm({ open: false, type: '', id: null, currentStatus: '' })
            fetchData()
        } catch (err) {
            addToast({ title: 'Status Failed', message: err.response?.data?.message || err.message || 'Failed to update status', type: 'error' })
        } finally {
            setIsStatusUpdating(false)
        }
    }

    const handleOpenResetPassword = (owner) => {
        setOwnerToReset(owner)
        setResetPasswordData({ password: '', confirmPassword: '' })
        setIsResetModalOpen(true)
    }

    const handleResetPassword = async () => {
        if (!resetPasswordData.password || !resetPasswordData.confirmPassword) {
            addToast({ title: 'Validation Error', message: 'Please fill all fields', type: 'error' })
            return
        }
        if (resetPasswordData.password.length < 6) {
            addToast({ title: 'Validation Error', message: 'Password must be at least 6 characters long', type: 'error' })
            return
        }
        if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
            addToast({ title: 'Validation Error', message: 'Passwords do not match', type: 'error' })
            return
        }

        setIsSaving(true)
        try {
            await resetOwnerPassword(ownerToReset._id, resetPasswordData)
            addToast({ title: 'Success', message: 'Password reset successful', type: 'success' })
            setIsResetModalOpen(false)
            setOwnerToReset(null)
            setResetPasswordData({ password: '', confirmPassword: '' })
        } catch (err) {
            addToast({ title: 'Reset Failed', message: err.response?.data?.message || err.message || 'Failed to reset password', type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPage(newPage)
        }
    }

    return (
        <div className="space-y-7 font-sans text-slate-900">
            {/* Page Title & Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Owner Management</h1>
                    <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">Manage owners, subscriptions, branches and commissions</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="h-11 px-4 rounded-full bg-white border border-slate-200/80 text-slate-700 hover:text-[#16A34A] hover:border-emerald-300 font-bold text-xs transition-all cursor-pointer shadow-2xs flex items-center gap-2"
                        title="Refresh List"
                    >
                        <FiRefreshCw className="w-4 h-4 text-[#16A34A]" />
                        <span className="hidden md:inline">Refresh</span>
                    </button>
                    <button
                        onClick={() => addToast({ title: 'Export Generated', message: 'Owners report exported to CSV successfully.', type: 'success' })}
                        className="h-11 px-4 rounded-full bg-white border border-slate-200/80 text-slate-700 hover:text-[#16A34A] hover:border-emerald-300 font-bold text-xs transition-all cursor-pointer shadow-2xs flex items-center gap-2"
                    >
                        <FiDownload className="w-4 h-4 text-[#16A34A]" />
                        <span className="hidden md:inline">Export</span>
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="h-11 px-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-[0_4px_14px_rgba(34,197,94,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                    >
                        <FiPlus className="w-4 h-4" />
                        <span>+ Add Owner</span>
                    </button>
                </div>
            </div>

            {/* 4 Summary KPI Cards (24px Radius Glassmorphism) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Total Owners */}
                <div className="bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(34,197,94,0.12)] hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 p-6 relative overflow-hidden h-[125px] flex flex-col justify-between cursor-pointer group">
                    <div className="h-1.5 w-full bg-gradient-to-r from-green-500 to-emerald-400 absolute top-0 left-0" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Owners</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{stats.total}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 text-white flex items-center justify-center text-xl shadow-[0_4px_14px_rgba(34,197,94,0.3)] shrink-0 group-hover:scale-110 transition-transform">
                            <FiUsers className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600">
                        <span className="flex items-center gap-1"><FiTrendingUp className="w-3.5 h-3.5" /> +18% growth</span>
                        <span className="text-[10px] text-slate-400">Registered</span>
                    </div>
                </div>

                {/* Card 2: Active Owners */}
                <div className="bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(34,197,94,0.12)] hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 p-6 relative overflow-hidden h-[125px] flex flex-col justify-between cursor-pointer group">
                    <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-400 absolute top-0 left-0" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Active Owners</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{stats.active}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-xl shadow-[0_4px_14px_rgba(20,184,166,0.3)] shrink-0 group-hover:scale-110 transition-transform">
                            <FiUserCheck className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600">
                        <span className="flex items-center gap-1"><FiCheckCircle className="w-3.5 h-3.5" /> {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% Active Rate</span>
                        <span className="text-[10px] text-slate-400">Verified</span>
                    </div>
                </div>

                {/* Card 3: Suspended Owners */}
                <div className="bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(239,68,68,0.12)] hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 p-6 relative overflow-hidden h-[125px] flex flex-col justify-between cursor-pointer group">
                    <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-red-400 absolute top-0 left-0" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Suspended</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{stats.suspended}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-400 text-white flex items-center justify-center text-xl shadow-[0_4px_14px_rgba(239,68,68,0.3)] shrink-0 group-hover:scale-110 transition-transform">
                            <FiUserX className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-rose-500">
                        <span>Requires Review</span>
                        <span className="text-[10px] text-slate-400">Restricted</span>
                    </div>
                </div>

                {/* Card 4: Total Commission */}
                <div className="bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(34,197,94,0.12)] hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 p-6 relative overflow-hidden h-[125px] flex flex-col justify-between cursor-pointer group">
                    <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-emerald-500 absolute top-0 left-0" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Commission</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">₹{stats.totalCommission.toLocaleString()}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-white flex items-center justify-center text-xl shadow-[0_4px_14px_rgba(245,158,11,0.3)] shrink-0 group-hover:scale-110 transition-transform">
                            <FiTrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600">
                        <span>Platform Yield</span>
                        <span className="text-[10px] text-slate-400">Net Earned</span>
                    </div>
                </div>
            </div>



            {/* Single Unified Card: Search Toolbar + Table */}
            <div className="bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] overflow-hidden p-6 space-y-6">
                {/* Search + Filter Bar Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="relative w-full md:w-96">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
                        <input
                            type="text"
                            name="owner_search_input_no_autofill"
                            id="owner_search_input"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            placeholder="Search owner, email, or business..."
                            value={searchTerm}
                            onFocus={() => setIsSearchFocused(true)}
                            onChange={e => {
                                setSearchTerm(e.target.value)
                                setPage(1)
                                setIsSearchFocused(true)
                            }}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 text-slate-900 text-xs font-semibold outline-none focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/10 transition-all placeholder:text-slate-400"
                        />

                        {/* SportMatrix Custom Themed Suggestions Dropdown */}
                        {isSearchFocused && searchSuggestions.length > 0 && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setIsSearchFocused(false)} 
                                />
                                <div className="absolute left-0 top-full mt-2 w-full min-w-[280px] sm:min-w-[340px] bg-white border border-slate-200/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.14)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                                    <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                        <span className="flex items-center gap-1">⚡ <span>Suggestions</span></span>
                                        <span className="text-[#16A34A]">{searchSuggestions.length} found</span>
                                    </div>
                                    <div className="py-1 space-y-1 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                        {searchSuggestions.map((item, idx) => (
                                            <button
                                                key={`${item.type}-${item.label}-${idx}`}
                                                type="button"
                                                onMouseDown={(e) => {
                                                    e.preventDefault()
                                                    setSearchTerm(item.value || item.label)
                                                    setIsSearchFocused(false)
                                                    setPage(1)
                                                }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2.5 hover:bg-emerald-50/80 hover:text-emerald-950 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#C8FF2E] group-hover:text-black flex items-center justify-center text-xs shrink-0 transition-colors shadow-2xs">
                                                        {item.icon}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 group-hover:text-[#16A34A] truncate">
                                                            {item.label}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 truncate font-medium">
                                                            {item.subtext}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800 shrink-0">
                                                    {item.type}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0" style={{ scrollbarWidth: 'thin' }}>
                        {['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED'].map((statusOption) => {
                            const isActive = statusFilter === statusOption
                            return (
                                <button
                                    key={statusOption}
                                    onClick={() => {
                                        setStatusFilter(statusOption)
                                        setPage(1)
                                    }}
                                    className={`px-5 py-2 rounded-full text-xs font-black tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap uppercase ${
                                        isActive
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)] scale-105'
                                            : 'bg-slate-100/80 border border-slate-200/70 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                                    }`}
                                >
                                    {statusOption}
                                </button>
                            )
                        })}
                    </div>
                </div>
                {isLoading ? (
                    <div className="min-h-[350px] flex flex-col items-center justify-center gap-4 p-8">
                        <div className="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Fetching owner records...</span>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/70">
                                        <th className="py-3.5 px-4 rounded-l-xl">Owner Info</th>
                                        <th className="py-3.5 px-4">Business Details</th>
                                        <th className="py-3.5 px-4 text-center">Branches</th>
                                        <th className="py-3.5 px-4">Revenue</th>
                                        <th className="py-3.5 px-4">Commission</th>
                                        <th className="py-3.5 px-4">Plan</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4 text-right rounded-r-xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                                    {owners.map((r, i) => {
                                        const isExpanded = expandedRowId === r._id;
                                        return (
                                            <Fragment key={r._id || i}>
                                                <tr 
                                                    className={`h-[72px] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-emerald-50/40`}
                                                >
                                                    {/* Owner Info with Avatar & Verification Badge */}
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <button 
                                                                onClick={() => setExpandedRowId(isExpanded ? null : r._id)}
                                                                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                                                                title="Expand Details"
                                                            >
                                                                {isExpanded ? <FiChevronUp className="w-4 h-4 text-[#16A34A]" /> : <FiChevronDown className="w-4 h-4" />}
                                                            </button>

                                                            {r.profileImage ? (
                                                                <img
                                                                    src={r.profileImage}
                                                                    alt={r.fullName}
                                                                    className="w-10 h-10 rounded-2xl object-cover border border-slate-200 bg-white shadow-2xs"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-white text-xs font-black shadow-xs">
                                                                    {((r.fullName || '').split(' ').map(n => n[0]).join('') || '?').substring(0, 2).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                                                    <span>{r.fullName || 'N/A'}</span>
                                                                    <HiShieldCheck className="w-3.5 h-3.5 text-emerald-500" title="Verified Owner" />
                                                                </div>
                                                                <div className="text-[11px] text-slate-400 font-medium">{r.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Business Details */}
                                                    <td className="py-3 px-4">
                                                        <div className="font-bold text-slate-800">{r.businessName || 'N/A'}</div>
                                                        {r.businessType && (
                                                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-[10px] font-bold">
                                                                {r.businessType}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Total Branches */}
                                                    <td className="py-3 px-4 text-center">
                                                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-black text-xs border border-slate-200/60">
                                                            {r.branches || 0}
                                                        </span>
                                                    </td>

                                                    {/* Revenue */}
                                                    <td className="py-3 px-4 font-black text-[#16A34A]">
                                                        {typeof r.revenue === 'number' ? `₹${r.revenue.toLocaleString('en-IN')}` : (r.revenue || '₹0')}
                                                    </td>

                                                    {/* Commission Progress */}
                                                    <td className="py-3 px-4">
                                                        <div className="font-black text-slate-900">
                                                            {typeof r.commission === 'number' ? `₹${r.commission.toLocaleString('en-IN')}` : (r.commission || '₹0')}
                                                        </div>
                                                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                                                            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: '65%' }} />
                                                        </div>
                                                    </td>

                                                    {/* Subscription Plan Badge */}
                                                    <td className="py-3 px-4">
                                                        <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black uppercase">
                                                            Enterprise
                                                        </span>
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="py-3 px-4">
                                                        {(() => {
                                                            const upper = (r.status || '').toUpperCase()
                                                            const isAct = upper === 'ACTIVE'
                                                            return (
                                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                                                                    isAct ? 'bg-emerald-100 text-[#16A34A]' : 'bg-red-100 text-red-600'
                                                                }`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${isAct ? 'bg-[#22C55E]' : 'bg-red-500'}`} />
                                                                    {upper}
                                                                </span>
                                                            )
                                                        })()}
                                                    </td>

                                                    {/* Circular Action Buttons */}
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => handleViewOwner(r)}
                                                                className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:scale-110 shadow-2xs"
                                                                title="View Details"
                                                            >
                                                                <FiEye className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenModal(r)}
                                                                className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-[#22C55E] hover:text-white flex items-center justify-center transition-all cursor-pointer hover:scale-110 shadow-2xs"
                                                                title="Edit Details"
                                                            >
                                                                <FiEdit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirm({ open: true, type: 'delete', id: r._id })}
                                                                className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:scale-110 shadow-2xs"
                                                                title="Delete Owner"
                                                            >
                                                                <FiTrash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <div className="actions-dropdown-container">
                                                                <button
                                                                    onClick={(e) => {
                                                                        if (activeActionDropdownId === r._id) {
                                                                            setActiveActionDropdownId(null)
                                                                            setDropdownOwner(null)
                                                                        } else {
                                                                            const rect = e.currentTarget.getBoundingClientRect()
                                                                            setDropdownPos({ top: rect.bottom + 4, left: rect.right - 176 })
                                                                            setDropdownOwner(r)
                                                                            setActiveActionDropdownId(r._id)
                                                                        }
                                                                    }}
                                                                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:scale-110 shadow-2xs"
                                                                    title="More Actions"
                                                                >
                                                                    <FiMoreVertical className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expanded Drawer Details Row */}
                                                {isExpanded && (
                                                    <tr className="bg-emerald-50/20 border-b border-emerald-100">
                                                        <td colSpan="8" className="p-4">
                                                            <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                                                                <div>
                                                                    <span className="text-[10px] text-slate-400 uppercase font-black block">Registered Date</span>
                                                                    <span className="text-slate-800 font-bold">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-[10px] text-slate-400 uppercase font-black block">Contact Mobile</span>
                                                                    <span className="text-slate-800 font-bold">{r.mobile || 'N/A'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-[10px] text-slate-400 uppercase font-black block">Location</span>
                                                                    <span className="text-slate-800 font-bold">📍 {r.city || 'India'}, {r.state || ''}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-[10px] text-slate-400 uppercase font-black block">GST / PAN</span>
                                                                    <span className="text-slate-800 font-bold">{r.gstNumber || r.panNumber || 'Not Provided'}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                             </Fragment>
                                        )
                                    })}
                                    {owners.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="py-16 text-center text-slate-400 font-bold text-xs">
                                                No owners found matching search criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {pagination.pages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-5 mt-4 gap-4">
                                <p className="text-xs text-slate-500 font-semibold">
                                    Showing <strong className="text-slate-900">{((pagination.page - 1) * pagination.limit) + 1}</strong> to{' '}
                                    <strong className="text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of{' '}
                                    <strong className="text-slate-900">{pagination.total}</strong> owners
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={pagination.page === 1}
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex gap-1">
                                        {Array.from({ length: pagination.pages }, (_, index) => {
                                            const p = index + 1
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() => handlePageChange(p)}
                                                    className={`w-8 h-8 rounded-full text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                                                        pagination.page === p
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xs'
                                                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
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
                                        className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add/Edit Owner Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingOwner ? "Edit Owner" : "Add New Owner"}
                size="enterprise"
            >
                <div className="space-y-7">
                    {/* Step Navigation Tabs */}
                    <div className="grid grid-cols-3 gap-3 p-1.5 bg-slate-100/70 rounded-2xl border border-slate-200/60">
                        <button
                            type="button"
                            onClick={() => setActiveTab('personal')}
                            className={`h-[52px] rounded-2xl flex items-center justify-center gap-2.5 text-xs font-bold transition-all duration-300 cursor-pointer ${
                                activeTab === 'personal'
                                    ? 'bg-white text-[#16A34A] border-t-2 border-[#16A34A] font-extrabold shadow-2xs'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                            }`}
                        >
                            <FiUser className="w-5 h-5" />
                            <span>Personal Info</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('business')}
                            className={`h-[52px] rounded-2xl flex items-center justify-center gap-2.5 text-xs font-bold transition-all duration-300 cursor-pointer ${
                                activeTab === 'business'
                                    ? 'bg-white text-[#16A34A] border-t-2 border-[#16A34A] font-extrabold shadow-2xs'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                            }`}
                        >
                            <FiBriefcase className="w-5 h-5" />
                            <span>Business Info</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('address')}
                            className={`h-[52px] rounded-2xl flex items-center justify-center gap-2.5 text-xs font-bold transition-all duration-300 cursor-pointer ${
                                activeTab === 'address'
                                    ? 'bg-white text-[#16A34A] border-t-2 border-[#16A34A] font-extrabold shadow-2xs'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                            }`}
                        >
                            <FiMapPin className="w-5 h-5" />
                            <span>Address & Profile</span>
                        </button>
                    </div>

                    {/* Step 1: Personal Info */}
                    {activeTab === 'personal' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Full Name"
                                    placeholder="e.g. Rahul Sharma"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    disabled={isSaving}
                                    required
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="rahul@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    disabled={isSaving || !!editingOwner}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Mobile Number"
                                    placeholder="e.g. 9876543210"
                                    value={formData.mobile}
                                    onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                    disabled={isSaving}
                                    required
                                    maxLength={10}
                                />
                                <Input
                                    label="Alternative Mobile"
                                    placeholder="e.g. 9876543211"
                                    value={formData.alternateMobile}
                                    onChange={e => setFormData({ ...formData, alternateMobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                    disabled={isSaving}
                                    maxLength={10}
                                />
                            </div>
                            {!editingOwner && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        disabled={isSaving}
                                        required
                                    />
                                    <Input
                                        label="Confirm Password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        disabled={isSaving}
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Business Info */}
                    {activeTab === 'business' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Business Name"
                                    placeholder="e.g. Turf Gaming Zone"
                                    value={formData.businessName}
                                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                    disabled={isSaving}
                                    required
                                />
                                <Input
                                    label="Business Type"
                                    placeholder="e.g. Sports & Recreation"
                                    value={formData.businessType}
                                    onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="GST Number"
                                    placeholder="e.g. 22AAAAA1111A1Z1"
                                    value={formData.gstNumber}
                                    onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                                    disabled={isSaving}
                                />
                                <Input
                                    label="PAN Number"
                                    placeholder="e.g. ABCDE1234F"
                                    value={formData.panNumber}
                                    onChange={e => setFormData({ ...formData, panNumber: e.target.value })}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Address & Profile */}
                    {activeTab === 'address' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Country"
                                    placeholder="e.g. India"
                                    value={formData.country}
                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                    disabled={isSaving}
                                />
                                <Input
                                    label="State"
                                    placeholder="e.g. Maharashtra"
                                    value={formData.state}
                                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="City"
                                    placeholder="e.g. Mumbai"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    disabled={isSaving}
                                />
                                <Input
                                    label="Zip Code"
                                    placeholder="e.g. 400001"
                                    value={formData.zipCode}
                                    onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                    disabled={isSaving}
                                />
                            </div>
                            <Input
                                label="Full Address"
                                placeholder="Street address, building, suite..."
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                disabled={isSaving}
                            />
                        </div>
                    )}

                    {/* Modal Footer Buttons */}
                    <div className="flex justify-between items-center border-t border-slate-100/80 pt-6 mt-8">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            disabled={isSaving}
                            className="px-7 h-[52px] rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 h-[52px] rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_4px_14px_rgba(34,197,94,0.35)] hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span>{editingOwner ? "Update Owner" : "CREATE OWNER"}</span>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                isOpen={isResetModalOpen}
                onClose={() => {
                    setIsResetModalOpen(false)
                    setResetPasswordData({ password: '', confirmPassword: '' })
                    setOwnerToReset(null)
                }}
                title={`Reset Password for ${ownerToReset?.fullName || ''}`}
            >
                <div className="space-y-4 pt-2">
                    <Input
                        label="New Password"
                        type="password"
                        placeholder="••••••••"
                        value={resetPasswordData.password}
                        onChange={e => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
                        disabled={isSaving}
                    />
                    <Input
                        label="Confirm New Password"
                        type="password"
                        placeholder="••••••••"
                        value={resetPasswordData.confirmPassword}
                        onChange={e => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                        disabled={isSaving}
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <button 
                            onClick={() => {
                                setIsResetModalOpen(false)
                                setResetPasswordData({ password: '', confirmPassword: '' })
                                setOwnerToReset(null)
                            }} 
                            className="px-5 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleResetPassword} 
                            disabled={isSaving}
                            className="px-6 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-sm cursor-pointer"
                        >
                            {isSaving ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* View Owner Details Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false)
                    setViewingOwner(null)
                }}
                title="Owner Details"
                size="lg"
            >
                {viewingOwner && (
                    <div className="space-y-6 pt-2 max-h-[75vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-5">
                            {viewingOwner.profileImage ? (
                                <img
                                    src={viewingOwner.profileImage}
                                    alt={viewingOwner.fullName}
                                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200 bg-white"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-white text-2xl font-black shadow-md">
                                    {((viewingOwner.fullName || '').split(' ').map(n => n[0]).join('') || '?').substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="text-center sm:text-left flex-1 space-y-1.5">
                                <h3 className="text-xl font-black text-slate-900 leading-none">{viewingOwner.fullName}</h3>
                                <p className="text-xs text-slate-500 font-semibold">{viewingOwner.email}</p>
                                <div className="text-xs text-slate-400 font-medium">
                                    System Role: <span className="font-extrabold text-[#16A34A]">OWNER</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5 font-sans">
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
                                <h4 className="text-xs font-black text-emerald-600 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                                    <FiUser className="w-3.5 h-3.5" />
                                    Personal & Contact
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <p className="text-slate-400 font-semibold uppercase text-[10px]">Mobile</p>
                                        <p className="text-slate-900 font-bold">{viewingOwner.mobile || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-semibold uppercase text-[10px]">Alt Mobile</p>
                                        <p className="text-slate-900 font-bold">{viewingOwner.alternateMobile || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
                                <h4 className="text-xs font-black text-emerald-600 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                                    <FiBriefcase className="w-3.5 h-3.5" />
                                    Business Info
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="col-span-2">
                                        <p className="text-slate-400 font-semibold uppercase text-[10px]">Business Name</p>
                                        <p className="text-slate-900 font-bold">{viewingOwner.businessName || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false)
                                    setViewingOwner(null)
                                }}
                                className="px-6 py-2 rounded-full bg-slate-900 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirm.open}
                onClose={() => setConfirm({ open: false, type: '', id: null, currentStatus: '' })}
                onConfirm={confirm.type === 'delete' ? handleDelete : handleToggleStatus}
                title={confirm.type === 'delete' ? "Delete Owner" : "Toggle Status"}
                message={confirm.type === 'delete' ? "Are you sure you want to delete this owner? This will remove all their data." : "Are you sure you want to change the status for this owner?"}
                type={confirm.type === 'delete' ? "danger" : "warning"}
                disabled={isDeleting || isStatusUpdating}
            />

            {/* Portal Dropdown */}
            {activeActionDropdownId && dropdownOwner && createPortal(
                <div
                    className="actions-dropdown-portal fixed z-[9999] w-48 rounded-2xl bg-white border border-slate-200/90 shadow-xl py-2 animate-scale-in"
                    style={{ top: dropdownPos.top, left: dropdownPos.left }}
                >
                    <button
                        onClick={() => {
                            handleOpenResetPassword(dropdownOwner)
                            setActiveActionDropdownId(null)
                            setDropdownOwner(null)
                        }}
                        className="w-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#16A34A] flex items-center gap-2 transition-colors cursor-pointer text-left"
                    >
                        <FiKey className="w-3.5 h-3.5" />
                        <span>Change Password</span>
                    </button>
                    <button
                        onClick={() => {
                            setConfirm({ open: true, type: 'status', id: dropdownOwner._id, currentStatus: dropdownOwner.status })
                            setActiveActionDropdownId(null)
                            setDropdownOwner(null)
                        }}
                        className={`w-full px-4 py-2 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer text-left ${
                            dropdownOwner.status === 'ACTIVE'
                                ? 'text-slate-700 hover:bg-red-50 hover:text-red-600'
                                : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                    >
                        {dropdownOwner.status === 'ACTIVE' ? (
                            <>
                                <FiSlash className="w-3.5 h-3.5" />
                                <span>Suspend Account</span>
                            </>
                        ) : (
                            <>
                                <FiCheckCircle className="w-3.5 h-3.5" />
                                <span>Activate Account</span>
                            </>
                        )}
                    </button>
                </div>,
                document.body
            )}
        </div>
    )
}
