import { useState, useEffect, useMemo } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'
import { HiOutlineClock, HiUsers, HiPlus, HiPencil, HiTrash, HiCheckCircle, HiBan } from 'react-icons/hi'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const initialStaff = [
    { id: 1, name: 'Ravi Kumar', email: 'ravi@email.com', role: 'Manager', phone: '+91 98765 43210', shift: 'Morning', status: 'Active' },
    { id: 2, name: 'Suresh Patil', email: 'suresh@email.com', role: 'Technician', phone: '+91 98765 43211', shift: 'Full Day', status: 'Active' },
    { id: 3, name: 'Anita Desai', email: 'anita@email.com', role: 'Cashier', phone: '+91 98765 43212', shift: 'Evening', status: 'Active' },
    { id: 4, name: 'Deepak Joshi', email: 'deepak@email.com', role: 'Manager', phone: '+91 98765 43213', shift: 'Night', status: 'Inactive' },
]

export default function StaffManagement() {
    const { addToast } = useToast()
    const [staff, setStaff] = useState(initialStaff)
    const [modal, setModal] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' })

    // Form inputs state
    const [currentStaff, setCurrentStaff] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'Manager',
        shift: 'Morning',
        status: 'Active'
    })

    const handleSaveStaff = () => {
        if (!currentStaff.name || !currentStaff.email || !currentStaff.phone) return

        if (editMode) {
            setStaff(staff.map(s => s.id === currentStaff.id ? { ...currentStaff } : s))
        } else {
            setStaff([...staff, { ...currentStaff, id: Date.now() }])
        }
        setModal(false)
        setEditMode(false)
        setCurrentStaff({ name: '', email: '', phone: '', role: 'Manager', shift: 'Morning', status: 'Active' })
        addToast({ title: 'Staff Saved', message: 'Roster details successfully updated', type: 'success' })
    }

    const handleToggleStatus = (id) => {
        setStaff(staff.map(s => {
            if (s.id === id) {
                const finalStatus = s.status === 'Active' ? 'Inactive' : 'Active'
                return { ...s, status: finalStatus }
            }
            return s
        }))
        addToast({ title: 'Status Toggle', message: 'Employee availability toggled', type: 'info' })
    }

    const handleEdit = (employee) => {
        setCurrentStaff(employee)
        setEditMode(true)
        setModal(true)
    }

    const handleRemove = () => {
        setStaff(staff.filter(s => s.id !== deleteConfirm.id))
        setDeleteConfirm({ open: false, id: null, name: '' })
        addToast({ title: 'Staff Deleted', message: 'Employee details deleted from database records', type: 'info' })
    }

    const columns = [
        { key: 'name', label: 'Employee Name' },
        { key: 'email', label: 'Email Payout' },
        {
            key: 'role',
            label: 'Assigned Role',
            render: v => <Badge variant={v === 'Manager' ? 'primary' : v === 'Cashier' ? 'success' : 'warning'}>{v}</Badge>
        },
        { key: 'phone', label: 'Phone Number' },
        {
            key: 'shift',
            label: 'Shift Slot',
            render: v => (
                <span className="flex items-center gap-1.5 text-xs font-bold text-surface-650">
                    <HiOutlineClock className="text-primary-500" /> {v} Shift
                </span>
            )
        },
        {
            key: 'status',
            label: 'Active status',
            render: v => <Badge variant={v === 'Active' ? 'success' : 'default'} dot>{v}</Badge>
        },
        {
            key: 'action',
            label: '',
            render: (_, r) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(r)} className="cursor-pointer">
                        Edit
                    </Button>
                    <button onClick={() => handleToggleStatus(r.id)} className={`p-1.5 rounded-xl border border-surface-200 cursor-pointer ${r.status === 'Active' ? 'hover:bg-red-50 text-red-500' : 'hover:bg-emerald-50 text-emerald-500'}`}>
                        {r.status === 'Active' ? <HiBan className="w-4 h-4" /> : <HiCheckCircle className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setDeleteConfirm({ open: true, id: r.id, name: r.name })} className="p-1.5 rounded-xl border border-surface-200 hover:bg-red-50 text-red-650 cursor-pointer">
                        <HiTrash className="w-4 h-4" />
                    </button>
                </div>
            )
        },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        Staff Operations & Shifts
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Verify employee roles, configure morning/night shift logs, and adjust active statuses</p>
                </div>
                <Button onClick={() => { setEditMode(false); setModal(true); }} className="shadow-lg shadow-primary-500/10 cursor-pointer">
                    <HiPlus className="w-5 h-5 mr-1" /> Add Staff Member
                </Button>
            </div>

            {/* List Table */}
            <Card className="p-6">
                <DataTable columns={columns} data={staff} />
            </Card>

            {/* Add/Edit Modal */}
            <Modal isOpen={modal} onClose={() => setModal(false)} title={editMode ? 'Edit Staff Roster' : 'Register New Employee'} size="md">
                <div className="space-y-4 animate-in fade-in">
                    <Input
                        label="Full Employee Name"
                        placeholder="e.g. Ramesh Patil"
                        value={currentStaff.name}
                        onChange={(e) => setCurrentStaff({ ...currentStaff, name: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Email Address"
                            placeholder="staff@email.com"
                            value={currentStaff.email}
                            onChange={(e) => setCurrentStaff({ ...currentStaff, email: e.target.value })}
                        />
                        <Input
                            label="Contact Phone"
                            placeholder="+91 98765..."
                            value={currentStaff.phone}
                            onChange={(e) => setCurrentStaff({ ...currentStaff, phone: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Assigned Operation Role"
                            value={currentStaff.role}
                            onChange={(e) => setCurrentStaff({ ...currentStaff, role: e.target.value })}
                            options={[
                                { value: 'Manager', label: 'Branch Manager' },
                                { value: 'Cashier', label: 'Billing Cashier' },
                                { value: 'Technician', label: 'Technical Inspector' }
                            ]}
                        />

                        <Select
                            label="Scheduled Shift Timings"
                            value={currentStaff.shift}
                            onChange={(e) => setCurrentStaff({ ...currentStaff, shift: e.target.value })}
                            options={[
                                { value: 'Morning', label: 'Morning Slot' },
                                { value: 'Evening', label: 'Evening Slot' },
                                { value: 'Night', label: 'Night Shift' },
                                { value: 'Full Day', label: 'Full Duty Day' }
                            ]}
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-surface-100 mt-6 font-semibold">
                        <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
                        <Button onClick={handleSaveStaff}>
                            {editMode ? 'Save Payout' : 'Add Staff'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
                onConfirm={handleRemove}
                title="Remove Staff Member"
                message={`Are you sure you want to remove ${deleteConfirm.name}? They will no longer have access to the dashboard.`}
                variant="danger"
                confirmText="Remove"
            />
        </div>
    )
}
