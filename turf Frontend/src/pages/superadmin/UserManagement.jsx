import { useState, useEffect } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'

const initialUsers = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@email.com', role: 'Owner', joined: 'Jan 12, 2026', status: 'Active' },
    { id: 2, name: 'Priya Sharma', email: 'priya@email.com', role: 'Customer', joined: 'Feb 3, 2026', status: 'Active' },
    { id: 3, name: 'Arjun Mehta', email: 'arjun@email.com', role: 'Staff', joined: 'Feb 15, 2026', status: 'Active' },
    { id: 4, name: 'Sneha Reddy', email: 'sneha@email.com', role: 'Customer', joined: 'Jan 28, 2026', status: 'Suspended' },
    { id: 5, name: 'Vikram Singh', email: 'vikram@email.com', role: 'Owner', joined: 'Dec 5, 2025', status: 'Active' },
]

export default function UserManagement() {
    const { addToast } = useToast()
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('sa_users')
        return saved ? JSON.parse(saved) : initialUsers
    })

    const [activeTab, setActiveTab] = useState('All')
    const [confirm, setConfirm] = useState({ open: false, user: null })

    useEffect(() => {
        localStorage.setItem('sa_users', JSON.stringify(users))
    }, [users])

    const handleToggleStatus = () => {
        const user = confirm.user
        const newStatus = user.status === 'Active' ? 'Suspended' : 'Active'
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
        setConfirm({ open: false, user: null })
        addToast({ 
            title: 'Status Updated', 
            message: `${user.name} is now ${newStatus}`, 
            type: newStatus === 'Active' ? 'success' : 'warning' 
        })
    }

    const filteredUsers = activeTab === 'All' 
        ? users 
        : users.filter(u => u.role === activeTab)

    const tabs = ['All', 'Owner', 'Customer', 'Staff']

    const columns = [
        { key: 'name', label: 'Name' }, 
        { key: 'email', label: 'Email' },
        { 
            key: 'role', 
            label: 'Role', 
            render: v => (
                <Badge variant={v === 'Owner' ? 'primary' : v === 'Staff' ? 'accent' : 'secondary'}>
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
