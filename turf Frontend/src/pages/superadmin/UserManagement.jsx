import { useState, useEffect } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { getAllUsers, updateUserStatus } from '../../services/authService'

const initialUsers = [
    { id: 1, name: 'Hitesha Borase', email: 'superadmin@gmail.com', role: 'Super Admin', joined: 'Jan 01, 2026', status: 'Active' },
    { id: 2, name: 'Rajesh Kumar', email: 'rajesh@email.com', role: 'Admin', joined: 'Jan 12, 2026', status: 'Active' },
    { id: 3, name: 'Arjun Mehta', email: 'arjun@email.com', role: 'Staff', joined: 'Feb 15, 2026', status: 'Active' },
    { id: 4, name: 'Priya Sharma', email: 'priya@email.com', role: 'Customer', joined: 'Feb 3, 2026', status: 'Active' },
    { id: 5, name: 'Sneha Reddy', email: 'sneha@email.com', role: 'Customer', joined: 'Jan 28, 2026', status: 'Suspended' },
    { id: 6, name: 'Vikram Singh', email: 'vikram@email.com', role: 'Admin', joined: 'Dec 5, 2025', status: 'Active' },
]

export default function UserManagement() {
    const { addToast } = useToast()
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('sa_users')
        return saved ? JSON.parse(saved) : initialUsers
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
        { key: 'name', label: 'Name' }, 
        { key: 'email', label: 'Email' },
        { 
            key: 'role', 
            label: 'Role', 
            render: v => (
                <Badge variant={v === 'Super Admin' ? 'purple' : v === 'Admin' ? 'primary' : v === 'Staff' ? 'accent' : 'secondary'}>
                    {v}
                </Badge>
            )
        },
        { key: 'joined', label: 'Joined' },
        { 
            key: 'status', 
            label: 'Status', 
            render: v => <Badge variant={v === 'Active' ? 'success' : 'danger'} dot>{v}</Badge> 
        },
        { 
            key: 'action', 
            label: 'Action', 
            render: (_, r) => (
                <Button 
                    size="sm" 
                    variant={r.status === 'Active' ? 'danger' : 'accent'}
                    onClick={() => setConfirm({ open: true, user: r })}
                >
                    {r.status === 'Active' ? 'Suspend' : 'Activate'}
                </Button>
            ) 
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
