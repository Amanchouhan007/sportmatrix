import { useState, useEffect } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { getAllUsers, updateUserStatus } from '../../services/authService'

const initialUsers = []

export default function UserManagement() {
    const { addToast } = useToast()
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('sa_users')
        return saved ? JSON.parse(saved) : []
    })
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('All')
    const [confirm, setConfirm] = useState({ open: false, user: null })

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true)
            try {
                const data = await getAllUsers()
                if (Array.isArray(data) && data.length > 0) {
                    setUsers(data)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        loadUsers()
    }, [])

    const handleToggleStatus = async () => {
        const user = confirm.user
        const newStatus = user.status === 'Active' ? 'Suspended' : 'Active'
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
        setConfirm({ open: false, user: null })
        try {
            await updateUserStatus(user.id, newStatus)
        } catch (e) { }
        addToast({ 
            title: 'Status Updated', 
            message: `${user.name} is now ${newStatus}`, 
            type: newStatus === 'Active' ? 'success' : 'warning' 
        })
    }

    const filteredUsers = activeTab === 'All' 
        ? users 
        : users.filter(u => u.role === activeTab)

    const tabs = ['All', 'Super Admin', 'Admin', 'Staff', 'Customer']

    const columns = [
        { 
            key: 'name', 
            label: 'User Details',
            render: (_, r) => {
                const name = r.name || 'N/A'
                const initials = name !== 'N/A' ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-[#C8FF2E] flex items-center justify-center font-black text-xs shadow-xs border border-slate-700 shrink-0">
                            {initials}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-900 text-xs tracking-tight">{name}</span>
                            <span className="text-[10px] text-slate-400 font-mono sm:hidden">{r.email}</span>
                        </div>
                    </div>
                )
            }
        }, 
        { 
            key: 'email', 
            label: 'Email Address',
            render: (v) => (
                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100/90 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                    {v || 'N/A'}
                </span>
            )
        },
        { 
            key: 'role', 
            label: 'Role', 
            render: (v) => {
                const isSuper = v === 'Super Admin'
                const isAdmin = v === 'Admin'
                const isStaff = v === 'Staff'
                const badgeStyle = isSuper 
                    ? 'bg-purple-100 text-purple-800 border-purple-300 font-black' 
                    : isAdmin 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black' 
                        : isStaff 
                            ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold' 
                            : 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                return (
                    <span className={`px-3 py-1 rounded-full text-[10.5px] border uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs ${badgeStyle}`}>
                        {v || 'N/A'}
                    </span>
                )
            }
        },
        { 
            key: 'joined', 
            label: 'Joined Date',
            render: (v) => (
                <span className="text-xs font-semibold text-slate-600 font-mono">
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
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {v}
                    </span>
                )
            }
        },
        { 
            key: 'action', 
            label: 'Action', 
            render: (_, r) => {
                const isActive = r.status === 'Active'
                return (
                    <button
                        type="button"
                        onClick={() => setConfirm({ open: true, user: r })}
                        className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95 border ${
                            isActive 
                                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 hover:shadow-rose-200' 
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 hover:shadow-emerald-200'
                        }`}
                    >
                        {isActive ? '🚫 Suspend' : '✓ Activate'}
                    </button>
                )
            }
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">User Management</h1>
                    <p className="text-surface-500 text-sm mt-1">Manage all platform users and their access</p>
                </div>
                
                <div className="flex bg-surface-100 p-1 rounded-xl w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab 
                                    ? 'bg-white text-primary-600 shadow-sm' 
                                    : 'text-surface-500 hover:text-surface-700'
                            }`}
                        >
                            {tab}{tab !== 'All' ? 's' : ''}
                        </button>
                    ))}
                </div>
            </div>

            <DataTable columns={columns} data={filteredUsers} />

            <ConfirmDialog 
                isOpen={confirm.open}
                onClose={() => setConfirm({ open: false, user: null })}
                onConfirm={handleToggleStatus}
                title={confirm.user?.status === 'Active' ? "Suspend User" : "Activate User"}
                message={`Are you sure you want to ${confirm.user?.status === 'Active' ? 'suspend' : 'activate'} ${confirm.user?.name}?`}
                type={confirm.user?.status === 'Active' ? "danger" : "warning"}
            />
        </div>
    )
}
