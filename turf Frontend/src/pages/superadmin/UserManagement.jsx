import { useState, useEffect, useMemo } from 'react'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { getAllUsers, updateUserStatus } from '../../services/authService'
import { postApi, deleteApi } from '../../services/api'
import { FiSearch, FiX, FiKey, FiSlash, FiCheck, FiTrash2, FiUser, FiUsers } from 'react-icons/fi'

import useRealtime from '../../utils/useRealtime'

export default function UserManagement() {
    const { addToast } = useToast()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('All')
    const [confirm, setConfirm] = useState({ open: false, user: null })
    const [deleteModal, setDeleteModal] = useState({ open: false, user: null })
    const [resetModal, setResetModal] = useState({ open: false, user: null, password: '' })

    const loadUsers = async () => {
        setLoading(true)
        try {
            const data = await getAllUsers()
            if (Array.isArray(data)) {
                setUsers(data)
            }
        } catch (err) {
            console.error('Failed to load real users from API:', err)
            addToast({
                title: 'Fetch Failed',
                message: err?.message || 'Could not load users from backend database.',
                type: 'danger'
            })
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    useRealtime(['status_updated', 'global_data_changed'], () => {
        loadUsers()
    })

    const handleToggleStatus = async () => {
        const user = confirm.user
        if (!user) return
        const newStatus = user.status === 'Active' ? 'Suspended' : 'Active'
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
        setConfirm({ open: false, user: null })
        try {
            await updateUserStatus(user.id, newStatus)
        } catch (e) { }
        addToast({ 
            title: 'Status Updated', 
            message: `${user.name || user.email} is now ${newStatus}`, 
            type: newStatus === 'Active' ? 'success' : 'warning' 
        })
    }

    const handleResetPassword = async () => {
        if (!resetModal.password || resetModal.password.length < 4) {
            addToast({ title: 'Validation Error', message: 'Password must be at least 4 characters long.', type: 'danger' })
            return
        }
        try {
            const res = await postApi(`/auth/users/${resetModal.user.id}/reset-password`, { newPassword: resetModal.password })
            if (res.success || res.data?.success) {
                addToast({ title: 'Password Reset Successful', message: res.message || `Password for ${resetModal.user.name} has been updated.`, type: 'success' })
                setResetModal({ open: false, user: null, password: '' })
            } else {
                addToast({ title: 'Reset Failed', message: res.error?.message || res.message || 'Could not reset password.', type: 'danger' })
            }
        } catch (err) {
            addToast({ title: 'Reset Error', message: err.message || 'Failed to update password.', type: 'danger' })
        }
    }

    const handleDeleteUser = async () => {
        const user = deleteModal.user
        if (!user) return
        try {
            const res = await deleteApi(`/auth/users/${user.id}`)
            if (res.success || res.data?.success) {
                setUsers(prev => prev.filter(u => u.id !== user.id))
                addToast({ title: 'User Deleted', message: res.message || `User ${user.name || user.email} deleted successfully.`, type: 'success' })
            } else {
                addToast({ title: 'Delete Failed', message: res.error?.message || res.message || 'Could not delete user.', type: 'danger' })
            }
        } catch (err) {
            addToast({ title: 'Delete Error', message: err.message || 'Error deleting user.', type: 'danger' })
        } finally {
            setDeleteModal({ open: false, user: null })
        }
    }

    const stats = useMemo(() => {
        const total = users.length
        const admins = users.filter(u => u.role === 'Admin' || u.role === 'Turf Owner' || u.role === 'Super Admin').length
        const customers = users.filter(u => u.role === 'Customer' || u.role === 'PLAYER').length
        const staff = users.filter(u => u.role === 'Staff' || u.role === 'UMPIRE').length
        return { total, admins, customers, staff }
    }, [users])

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesRole = activeTab === 'All' 
                ? true 
                : activeTab === 'Admin'
                    ? (u.role === 'Admin' || u.role === 'Turf Owner')
                    : u.role === activeTab

            const q = searchQuery.toLowerCase().trim()
            const matchesSearch = !q || (
                (u.name || '').toLowerCase().includes(q) ||
                (u.email || '').toLowerCase().includes(q) ||
                (u.role || '').toLowerCase().includes(q)
            )

            return matchesRole && matchesSearch
        })
    }, [users, activeTab, searchQuery])

    const tabs = [
        { id: 'All', label: 'All Accounts', count: stats.total },
        { id: 'Super Admin', label: 'Super Admins', count: users.filter(u => u.role === 'Super Admin').length },
        { id: 'Admin', label: 'Turf Admins / Owners', count: stats.admins },
        { id: 'Staff', label: 'Staffs & Umpires', count: stats.staff },
        { id: 'Customer', label: 'Customers', count: stats.customers },
    ]

    const columns = [
        { 
            key: 'name', 
            label: 'User Details',
            render: (_, r) => {
                const name = r.name || r.fullName || 'User'
                const initials = name !== 'User' ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-[#C8FF2E] flex items-center justify-center font-black text-xs shadow-sm border border-slate-700 shrink-0">
                            {initials}
                        </div>
                        <div className="flex flex-col min-w-[140px]">
                            <span className="font-black text-slate-900 text-xs tracking-tight">{name}</span>
                            <span className="text-[11px] text-slate-500 font-mono mt-0.5">{r.email}</span>
                        </div>
                    </div>
                )
            }
        }, 
        { 
            key: 'email', 
            label: 'Email Address',
            render: (v) => (
                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100/90 border border-slate-200/80 px-2.5 py-1 rounded-xl inline-block">
                    {v || 'N/A'}
                </span>
            )
        },
        { 
            key: 'role', 
            label: 'Role', 
            render: (v) => {
                const isSuper = v === 'Super Admin'
                const isAdmin = v === 'Admin' || v === 'Turf Owner'
                const isStaff = v === 'Staff' || v === 'UMPIRE'
                const badgeStyle = isSuper 
                    ? 'bg-purple-50 text-purple-700 border-purple-200 font-black' 
                    : isAdmin 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-black' 
                        : isStaff 
                            ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold' 
                            : 'bg-sky-50 text-sky-700 border-sky-200 font-semibold'
                return (
                    <span className={`px-3 py-1 rounded-full text-[10.5px] border uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs ${badgeStyle}`}>
                        {v === 'Turf Owner' ? 'Admin / Owner' : v || 'User'}
                    </span>
                )
            }
        },
        { 
            key: 'joined', 
            label: 'Joined Date',
            render: (v) => (
                <span className="text-xs font-bold text-slate-500 font-mono">
                    {v || 'N/A'}
                </span>
            )
        },
        { 
            key: 'status', 
            label: 'Status', 
            render: (v) => {
                const isActive = v === 'Active'
                return (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border shadow-2xs ${
                        isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {v || 'Active'}
                    </span>
                )
            }
        },
        { 
            key: 'action', 
            label: 'Actions', 
            render: (_, r) => {
                const isActive = r.status === 'Active'
                return (
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setResetModal({ open: true, user: r, password: '' })}
                            className="h-8 px-2.5 rounded-xl text-[11px] font-extrabold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Reset Password"
                        >
                            <FiKey className="w-3.5 h-3.5 text-amber-600" />
                            <span>Reset</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirm({ open: true, user: r })}
                            className={`h-8 px-2.5 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                                isActive 
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' 
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}
                            title={isActive ? "Suspend Account" : "Activate Account"}
                        >
                            {isActive ? <FiSlash className="w-3.5 h-3.5 text-rose-600" /> : <FiCheck className="w-3.5 h-3.5 text-emerald-600" />}
                            <span>{isActive ? 'Suspend' : 'Activate'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeleteModal({ open: true, user: r })}
                            className="h-8 w-8 rounded-xl bg-slate-50 hover:bg-rose-600 hover:text-white text-slate-500 border border-slate-200 hover:border-rose-600 transition-all cursor-pointer flex items-center justify-center shadow-2xs"
                            title="Delete Account"
                        >
                            <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )
            }
        },
    ]

    return (
        <div className="space-y-6 relative">
            <div className="fixed top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-[#16A34A] flex items-center justify-center shadow-2xs">
                        <FiUsers className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">User Management</h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">Manage all registered platform accounts, credentials, and access statuses</p>
                    </div>
                </div>
                <div className="relative min-w-[260px] sm:min-w-[320px]">
                    <FiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by name, email or role..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-10 pr-9 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all shadow-2xs"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                            <FiX className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`h-10 px-4 rounded-xl text-xs font-extrabold tracking-wide uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer border shrink-0 ${
                            activeTab === tab.id
                                ? 'bg-slate-900 text-[#C8FF2E] border-slate-900 shadow-md shadow-slate-900/10 scale-[1.01]'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === tab.id ? 'bg-[#C8FF2E] text-slate-900' : 'bg-slate-100 text-slate-600'}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>
            <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-extrabold text-slate-600 tracking-wide">Loading user directory...</span>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                            <FiUser className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-black text-slate-800">No users found</h3>
                        <p className="text-xs text-slate-500 font-medium">Try clearing your search query or selecting a different tab filter.</p>
                    </div>
                ) : (
                    <DataTable columns={columns} data={filteredUsers} />
                )}
            </div>
            <ConfirmDialog 
                isOpen={confirm.open}
                onClose={() => setConfirm({ open: false, user: null })}
                onConfirm={handleToggleStatus}
                title={confirm.user?.status === 'Active' ? "Suspend User Account" : "Activate User Account"}
                message={`Are you sure you want to ${confirm.user?.status === 'Active' ? 'suspend' : 'activate'} ${confirm.user?.name || confirm.user?.email}?`}
                type={confirm.user?.status === 'Active' ? "danger" : "warning"}
            />
            <ConfirmDialog 
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, user: null })}
                onConfirm={handleDeleteUser}
                title="Delete User Account"
                message={`Are you sure you want to permanently delete user "${deleteModal.user?.name || deleteModal.user?.email}"? This action will remove their account permanently.`}
                type="danger"
            />
            <Modal isOpen={resetModal.open} onClose={() => setResetModal({ open: false, user: null, password: '' })} title={`🔑 Reset Password for ${resetModal.user?.name || resetModal.user?.email || 'User'}`} size="sm">
                <div className="space-y-4">
                    <p className="text-xs text-slate-500 font-medium">Enter a new password to immediately overwrite and reset credentials for this account.</p>
                    <Input
                        label="New Password *"
                        type="text"
                        placeholder="Enter new password"
                        value={resetModal.password}
                        onChange={(e) => setResetModal({ ...resetModal, password: e.target.value })}
                    />
                    <div className="flex gap-3 justify-end pt-3">
                        <button type="button" onClick={() => setResetModal({ open: false, user: null, password: '' })} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                        <button type="button" onClick={handleResetPassword} className="px-4 py-2 text-xs font-black bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md cursor-pointer">Save New Password</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
