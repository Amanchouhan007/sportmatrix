import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { FiEdit2, FiTrash2, FiSlash, FiCheckCircle, FiKey, FiUsers, FiUserCheck, FiUserX, FiTrendingUp, FiSearch, FiUser, FiBriefcase, FiMapPin, FiEye, FiMoreVertical } from 'react-icons/fi'
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
    const { user, token } = useAuth()

    // Authorization: Only SUPER_ADMIN can access
    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        if (user) {
            const normalizeRole = (r) => (r || '').toUpperCase().replace(/[-_]/g, '');
            const rNorm = normalizeRole(user.role);
            if (rNorm !== 'SUPERADMIN') {
                const roleRoutes = {
                    OWNER: '/dashboard/owner',
                    STAFF: '/dashboard/staff',
                    CUSTOMER: '/dashboard/customer'
                }
                navigate(roleRoutes[rNorm] || '/dashboard/customer')
            }
        }
    }, [user, token, navigate])

    // State definitions
    const [owners, setOwners] = useState([])
    const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, totalCommission: 0 })
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 })
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')

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
        if (token && user?.role === 'SUPER_ADMIN') {
            fetchData()
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
                // Remove password fields for updates
                const { password, confirmPassword, ...updateData } = formData
                await updateOwner(editingOwner._id, updateData)
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
            // Sanitize duplicate key errors
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Owner Management</h1>
                    <p className="text-surface-500 text-sm mt-1">View owners and commission tracking</p>
                </div>
                <Button onClick={() => handleOpenModal()}>+ Add Owner</Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <Card hover={true} className="border border-surface-200/60 shadow-soft relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Total Owners</p>
                            <p className="text-3xl font-extrabold text-surface-900 tracking-tight">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-accent-600 shadow-soft">
                            <FiUsers className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 h-1 w-full bg-accent-500"></div>
                </Card>

                <Card hover={true} className="border border-surface-200/60 shadow-soft relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Active Owners</p>
                            <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">{stats.active}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-soft">
                            <FiUserCheck className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500"></div>
                </Card>

                <Card hover={true} className="border border-surface-200/60 shadow-soft relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Suspended Owners</p>
                            <p className="text-3xl font-extrabold text-danger-500 tracking-tight">{stats.suspended}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-danger-500 shadow-soft">
                            <FiUserX className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 h-1 w-full bg-danger-500"></div>
                </Card>

                <Card hover={true} className="border border-surface-200/60 shadow-soft relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Total Commission</p>
                            <p className="text-3xl font-extrabold text-surface-900 tracking-tight">₹{stats.totalCommission.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-warning-500 shadow-soft">
                            <FiTrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 h-1 w-full bg-warning-500"></div>
                </Card>
            </div>

            {/* Unified Card for Filters, Custom Table & Pagination */}
            <Card variant="glass" padding={false} className="border border-surface-200/60 shadow-soft-lg overflow-hidden mt-6">
                {/* Search & Filters Toolbar */}
                <div className="p-5 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-surface-150/80 bg-surface-50/40">
                    <div className="relative w-full md:max-w-xs">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-surface-400">
                            <FiSearch className="w-5 h-5" />
                        </span>
                        <input 
                            type="text"
                            placeholder="Search name, email, or business..."
                            value={searchTerm}
                            onChange={e => {
                                setSearchTerm(e.target.value)
                                setPage(1)
                            }}
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 placeholder:text-surface-400 font-medium"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                        {['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED'].map((statusOption) => {
                            const isActive = statusFilter === statusOption
                            let activeStyles = ''
                            if (isActive) {
                                if (statusOption === 'ALL') activeStyles = 'bg-surface-800 border-surface-800 text-white shadow-soft-md scale-[1.02]'
                                else if (statusOption === 'ACTIVE') activeStyles = 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-soft-md scale-[1.02]'
                                else if (statusOption === 'INACTIVE') activeStyles = 'bg-amber-50 border-amber-300 text-warning-600 shadow-soft-md scale-[1.02]'
                                else if (statusOption === 'SUSPENDED') activeStyles = 'bg-red-50 border-red-200 text-danger-600 shadow-soft-md scale-[1.02]'
                            } else {
                                activeStyles = 'bg-white border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-surface-50'
                            }
                            
                            return (
                                <button
                                    key={statusOption}
                                    onClick={() => {
                                        setStatusFilter(statusOption)
                                        setPage(1)
                                    }}
                                    className={`px-5 py-2 rounded-xl text-xs font-bold border tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap uppercase ${activeStyles}`}
                                >
                                    {statusOption}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Table Content Section */}
                {isLoading ? (
                    <div className="min-h-[350px] flex flex-col items-center justify-center gap-4 p-8">
                        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-surface-500 text-sm font-medium">Fetching owners list...</span>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-50/50 border-b border-surface-150 text-xs font-bold text-surface-500 uppercase tracking-wider">
                                        <th className="px-6 py-4">Owner Info</th>
                                        <th className="px-6 py-4">Mobile</th>
                                        <th className="px-6 py-4">Business Details</th>
                                        <th className="px-6 py-4 text-center">Branches</th>
                                        <th className="px-6 py-4">Revenue</th>
                                        <th className="px-6 py-4">Commission</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right pr-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100">
                                    {owners.map((r, i) => (
                                        <tr key={r._id || i} className="bg-white hover:bg-surface-50/60 transition-colors duration-200">
                                            {/* Owner Info with Profile Photo */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {r.profileImage ? (
                                                        <img 
                                                            src={r.profileImage} 
                                                            alt={r.fullName} 
                                                            className="w-10 h-10 rounded-xl object-cover border border-surface-200 bg-white"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-soft">
                                                            {((r.fullName || '').split(' ').map(n => n[0]).join('') || '?').substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold text-surface-900 text-sm">{r.fullName || 'N/A'}</div>
                                                        <div className="text-xs text-surface-400 font-medium">{r.email}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Mobile Numbers */}
                                            <td className="px-6 py-4 whitespace-nowrap text-surface-700 font-medium">
                                                <div>{r.mobile || 'N/A'}</div>
                                                {r.alternateMobile && <div className="text-xs text-surface-400 font-normal mt-0.5">{r.alternateMobile}</div>}
                                            </td>

                                            {/* Business Details */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-surface-800">{r.businessName || 'N/A'}</div>
                                                {r.businessType && <div className="text-xs text-surface-400 font-medium mt-0.5">{r.businessType}</div>}
                                            </td>

                                            {/* Total Branches */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-surface-100 text-surface-700 font-bold text-xs">
                                                    {r.branches || 0}
                                                </span>
                                            </td>

                                            {/* Revenue */}
                                            <td className="px-6 py-4 whitespace-nowrap text-surface-900 font-semibold">
                                                {typeof r.revenue === 'number' ? `₹${r.revenue.toLocaleString()}` : (r.revenue || '₹0')}
                                            </td>

                                            {/* Commission */}
                                            <td className="px-6 py-4 whitespace-nowrap text-surface-900 font-semibold">
                                                {typeof r.commission === 'number' ? `₹${r.commission.toLocaleString()}` : (r.commission || '₹0')}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {(() => {
                                                    const upper = (r.status || '').toUpperCase()
                                                    const variant = upper === 'ACTIVE' ? 'success' : (upper === 'SUSPENDED' ? 'danger' : 'default')
                                                    return <Badge variant={variant} dot>{upper}</Badge>
                                                })()}
                                            </td>

                                            {/* Row Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right pr-8">
                                                <div className="flex gap-1 justify-end items-center">
                                                    <button
                                                        onClick={() => handleViewOwner(r)}
                                                        className="p-2 rounded-xl text-surface-500 hover:text-primary-600 hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all duration-200 cursor-pointer"
                                                        title="View Details"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenModal(r)}
                                                        className="p-2 rounded-xl text-surface-500 hover:text-primary-600 hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all duration-200 cursor-pointer"
                                                        title="Edit Details"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setConfirm({ open: true, type: 'delete', id: r._id })}
                                                        className="p-2 rounded-xl text-danger-500 hover:text-danger-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200 cursor-pointer"
                                                        title="Delete Owner"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
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
                                                            className={`p-2 rounded-xl text-surface-500 hover:text-surface-800 hover:bg-surface-100 border border-transparent transition-all duration-200 cursor-pointer ${
                                                                activeActionDropdownId === r._id ? 'bg-surface-100 text-surface-800' : ''
                                                            }`}
                                                            title="More Actions"
                                                        >
                                                            <FiMoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {owners.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="py-12 text-center text-surface-400 font-semibold text-sm">
                                                No owners available matching criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls inside Card Footer */}
                        {pagination.pages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-surface-150 p-5 gap-4 bg-surface-50/20">
                                <p className="text-sm text-surface-500 font-medium">
                                    Showing <span className="font-semibold text-surface-700">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                                    <span className="font-semibold text-surface-700">
                                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                                    </span>{' '}
                                    of <span className="font-semibold text-surface-700">{pagination.total}</span> owners
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

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingOwner ? "Edit Owner" : "Add New Owner"}
                size="lg"
            >
                <div className="pt-2 max-h-[75vh] overflow-y-auto pr-2">
                    {/* Tabs Header */}
                    <div className="flex border-b border-surface-200 mb-6">
                        <button
                            type="button"
                            onClick={() => setActiveTab('personal')}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-all duration-200 cursor-pointer ${
                                activeTab === 'personal'
                                    ? 'border-primary-500 text-primary-600 font-extrabold'
                                    : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-200'
                            }`}
                        >
                            <FiUser className="w-4 h-4" />
                            Personal Info
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('business')}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-all duration-200 cursor-pointer ${
                                activeTab === 'business'
                                    ? 'border-primary-500 text-primary-600 font-extrabold'
                                    : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-200'
                            }`}
                        >
                            <FiBriefcase className="w-4 h-4" />
                            Business Info
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('address')}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-all duration-200 cursor-pointer ${
                                activeTab === 'address'
                                    ? 'border-primary-500 text-primary-600 font-extrabold'
                                    : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-200'
                            }`}
                        >
                            <FiMapPin className="w-4 h-4" />
                            Address & Profile
                        </button>
                    </div>

                    {/* Tab 1: Personal */}
                    {activeTab === 'personal' && (
                        <div className="space-y-5 animate-fade-in duration-200">
                            <div className="bg-surface-50/50 p-5 rounded-2xl border border-surface-200/80 space-y-4">
                                <h4 className="text-xs font-bold text-surface-500 uppercase tracking-widest border-b border-surface-200 pb-1.5">
                                    Personal Information
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
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
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input 
                                        label="Mobile Number" 
                                        placeholder="e.g. 9876543210" 
                                        value={formData.mobile}
                                        onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                        disabled={isSaving}
                                        required
                                    />
                                    <Input 
                                        label="Alternative Mobile" 
                                        placeholder="e.g. 9876543211" 
                                        value={formData.alternateMobile}
                                        onChange={e => setFormData({ ...formData, alternateMobile: e.target.value })}
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            {!editingOwner && (
                                <div className="bg-surface-50/50 p-5 rounded-2xl border border-surface-200/80 space-y-4">
                                    <h4 className="text-xs font-bold text-surface-500 uppercase tracking-widest border-b border-surface-200 pb-1.5">
                                        Login Credentials
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-4">
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
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Business */}
                    {activeTab === 'business' && (
                        <div className="space-y-5 animate-fade-in duration-200">
                            <div className="bg-surface-50/50 p-5 rounded-2xl border border-surface-200/80 space-y-4">
                                <h4 className="text-xs font-bold text-surface-500 uppercase tracking-widest border-b border-surface-200 pb-1.5">
                                    Business Details
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
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
                                <div className="grid md:grid-cols-2 gap-4">
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
                        </div>
                    )}

                    {/* Tab 3: Address & Profile */}
                    {activeTab === 'address' && (
                        <div className="space-y-5 animate-fade-in duration-200">
                            <div className="bg-surface-50/50 p-5 rounded-2xl border border-surface-200/80 space-y-4">
                                <h4 className="text-xs font-bold text-surface-500 uppercase tracking-widest border-b border-surface-200 pb-1.5">
                                    Address Location
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
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
                                <div className="grid md:grid-cols-2 gap-4">
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

                            <div className="bg-surface-50/50 p-5 rounded-2xl border border-surface-200/80 space-y-4">
                                <h4 className="text-xs font-bold text-surface-500 uppercase tracking-widest border-b border-surface-200 pb-1.5">
                                    Profile Image
                                </h4>
                                <div className="flex items-center gap-4">
                                    {formData.profileImage ? (
                                        <img 
                                            src={formData.profileImage} 
                                            alt="Profile Preview" 
                                            className="w-16 h-16 rounded-xl object-cover border border-surface-250 bg-white"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl border border-dashed border-surface-300 bg-white flex items-center justify-center text-surface-400 text-xs font-semibold">
                                            No Image
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-surface-700 mb-1.5">Upload Image</label>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={isSaving}
                                            className="block w-full text-xs text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-surface-100 file:text-surface-700 hover:file:bg-surface-200 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal Actions Footer */}
                    <div className="flex justify-between items-center border-t border-surface-100 pt-4 mt-6">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <div className="flex gap-2">
                            {activeTab !== 'personal' && (
                                <Button 
                                    variant="secondary" 
                                    onClick={() => {
                                        if (activeTab === 'address') setActiveTab('business')
                                        else if (activeTab === 'business') setActiveTab('personal')
                                    }}
                                    disabled={isSaving}
                                >
                                    Previous
                                </Button>
                            )}
                            {activeTab !== 'address' && (
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        if (activeTab === 'personal') setActiveTab('business')
                                        else if (activeTab === 'business') setActiveTab('address')
                                    }}
                                    disabled={isSaving}
                                >
                                    Next
                                </Button>
                            )}
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "Saving..." : (editingOwner ? "Update Owner" : "Create Owner")}
                            </Button>
                        </div>
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
                        <Button variant="secondary" onClick={() => {
                            setIsResetModalOpen(false)
                            setResetPasswordData({ password: '', confirmPassword: '' })
                            setOwnerToReset(null)
                        }} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleResetPassword} disabled={isSaving}>
                            {isSaving ? 'Resetting...' : 'Reset Password'}
                        </Button>
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
                    <div className="space-y-6 pt-2 max-h-[75vh] overflow-y-auto pr-2">
                        {/* Profile Header Card */}
                        <div className="bg-surface-50 p-5 rounded-2xl border border-surface-200/80 flex flex-col sm:flex-row items-center gap-5">
                            {viewingOwner.profileImage ? (
                                <img 
                                    src={viewingOwner.profileImage} 
                                    alt={viewingOwner.fullName} 
                                    className="w-20 h-20 rounded-2xl object-cover border border-surface-250 bg-white"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-soft">
                                    {((viewingOwner.fullName || '').split(' ').map(n => n[0]).join('') || '?').substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="text-center sm:text-left flex-1 space-y-1.5">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                                    <h3 className="text-xl font-bold text-surface-900 leading-none">{viewingOwner.fullName}</h3>
                                    <div className="inline-flex justify-center sm:justify-start">
                                        {(() => {
                                            const upper = (viewingOwner.status || '').toUpperCase()
                                            const variant = upper === 'ACTIVE' ? 'success' : (upper === 'SUSPENDED' ? 'danger' : 'default')
                                            return <Badge variant={variant} dot>{upper}</Badge>
                                        })()}
                                    </div>
                                </div>
                                <p className="text-sm text-surface-500 font-medium">{viewingOwner.email}</p>
                                <div className="text-xs text-surface-400 font-normal">
                                    System Role: <span className="font-semibold text-surface-600">OWNER</span>
                                </div>
                            </div>
                        </div>

                        {/* Details Sections */}
                        <div className="grid md:grid-cols-2 gap-5 font-sans">
                            {/* Section A: Personal Details */}
                            <div className="bg-white p-5 rounded-2xl border border-surface-150 space-y-3.5 shadow-soft">
                                <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-100 pb-1.5 flex items-center gap-1.5">
                                    <FiUser className="w-3.5 h-3.5" />
                                    Personal & Account Info
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Mobile Number</p>
                                        <p className="text-surface-800 font-bold">{viewingOwner.mobile || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Alternate Mobile</p>
                                        <p className="text-surface-800 font-bold">{viewingOwner.alternateMobile || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Last Login</p>
                                        <p className="text-surface-800 font-bold">
                                            {viewingOwner.lastLogin 
                                                ? new Date(viewingOwner.lastLogin).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) 
                                                : 'Never Logged In'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Created At</p>
                                        <p className="text-surface-800 font-bold">
                                            {viewingOwner.createdAt 
                                                ? new Date(viewingOwner.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) 
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Updated At</p>
                                        <p className="text-surface-800 font-bold">
                                            {viewingOwner.updatedAt 
                                                ? new Date(viewingOwner.updatedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) 
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section B: Financial & Platform Performance */}
                            <div className="bg-white p-5 rounded-2xl border border-surface-150 space-y-3.5 shadow-soft">
                                <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-100 pb-1.5 flex items-center gap-1.5">
                                    <FiTrendingUp className="w-3.5 h-3.5" />
                                    Performance Metrics
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Total Branches</p>
                                        <p className="text-surface-900 font-extrabold text-sm">{viewingOwner.branches || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Revenue Earned</p>
                                        <p className="text-surface-900 font-extrabold text-sm">
                                            {typeof viewingOwner.revenue === 'number' 
                                                ? `₹${viewingOwner.revenue.toLocaleString('en-IN')}` 
                                                : (viewingOwner.revenue || '₹0')}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Commission Earned</p>
                                        <p className="text-emerald-600 font-extrabold text-base">
                                            {typeof viewingOwner.commission === 'number' 
                                                ? `₹${viewingOwner.commission.toLocaleString('en-IN')}` 
                                                : (viewingOwner.commission || '₹0')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section C: Business Information */}
                            <div className="bg-white p-5 rounded-2xl border border-surface-150 space-y-3.5 shadow-soft">
                                <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-100 pb-1.5 flex items-center gap-1.5">
                                    <FiBriefcase className="w-3.5 h-3.5" />
                                    Business Details
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                                    <div className="col-span-2">
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Business Name</p>
                                        <p className="text-surface-800 font-bold">{viewingOwner.businessName || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Business Type</p>
                                        <p className="text-surface-800 font-bold">{viewingOwner.businessType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">GST Number</p>
                                        <p className="text-surface-800 font-bold">{viewingOwner.gstNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">PAN Number</p>
                                        <p className="text-surface-800 font-bold">{viewingOwner.panNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section D: Address Information */}
                            <div className="bg-white p-5 rounded-2xl border border-surface-150 space-y-3.5 shadow-soft">
                                <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-100 pb-1.5 flex items-center gap-1.5">
                                    <FiMapPin className="w-3.5 h-3.5" />
                                    Address Details
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">City</p>
                                        <p className="text-surface-800 font-bold">{viewingOwner.city || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">State</p>
                                        <p className="text-surface-800 font-bold">{viewingOwner.state || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Country</p>
                                        <p className="text-surface-800 font-bold">{viewingOwner.country || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Zip Code</p>
                                        <p className="text-surface-800 font-bold">{viewingOwner.zipCode || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Full Address</p>
                                        <p className="text-surface-850 font-medium leading-relaxed">{viewingOwner.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end pt-2 border-t border-surface-100">
                            <Button onClick={() => {
                                setIsViewModalOpen(false)
                                setViewingOwner(null)
                            }}>Close Details</Button>
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
            {/* Portal Dropdown — renders at document.body level so it's never clipped by overflow */}
            {activeActionDropdownId && dropdownOwner && createPortal(
                <div
                    className="actions-dropdown-portal fixed z-[9999] w-44 rounded-xl bg-white border border-surface-200 shadow-soft-lg py-1.5 animate-scale-in"
                    style={{ top: dropdownPos.top, left: dropdownPos.left }}
                >
                    <button
                        onClick={() => {
                            handleOpenResetPassword(dropdownOwner)
                            setActiveActionDropdownId(null)
                            setDropdownOwner(null)
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-surface-700 hover:bg-surface-50 hover:text-accent-600 flex items-center gap-2 transition-colors cursor-pointer text-left"
                    >
                        <FiKey className="w-3.5 h-3.5" />
                        Change Password
                    </button>
                    <button
                        onClick={() => {
                            setConfirm({ open: true, type: 'status', id: dropdownOwner._id, currentStatus: dropdownOwner.status })
                            setActiveActionDropdownId(null)
                            setDropdownOwner(null)
                        }}
                        className={`w-full px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer text-left ${
                            dropdownOwner.status === 'ACTIVE'
                                ? 'text-surface-700 hover:bg-surface-50 hover:text-warning-600'
                                : 'text-surface-700 hover:bg-surface-50 hover:text-emerald-600'
                        }`}
                    >
                        {dropdownOwner.status === 'ACTIVE' ? (
                            <>
                                <FiSlash className="w-3.5 h-3.5" />
                                Suspend Account
                            </>
                        ) : (
                            <>
                                <FiCheckCircle className="w-3.5 h-3.5" />
                                Activate Account
                            </>
                        )}
                    </button>
                </div>,
                document.body
            )}
        </div>

    )
}
