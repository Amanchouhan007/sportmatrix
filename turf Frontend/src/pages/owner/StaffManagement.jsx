import { useState } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'
import { HiOutlineClock, HiPlus, HiPencil, HiTrash, HiCheckCircle, HiBan, HiUsers } from 'react-icons/hi'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const initialStaff = [
    { id: 1, name: 'Ravi Kumar',   email: 'ravi@email.com',   role: 'Manager',    phone: '+91 98765 43210', shift: 'Morning',  status: 'Active'   },
    { id: 2, name: 'Suresh Patil', email: 'suresh@email.com', role: 'Technician', phone: '+91 98765 43211', shift: 'Full Day', status: 'Active'   },
    { id: 3, name: 'Anita Desai',  email: 'anita@email.com',  role: 'Cashier',    phone: '+91 98765 43212', shift: 'Evening',  status: 'Active'   },
    { id: 4, name: 'Deepak Joshi', email: 'deepak@email.com', role: 'Manager',    phone: '+91 98765 43213', shift: 'Night',    status: 'Inactive' },
]

const ROLE_STYLES = {
    Manager:    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    Technician: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
    Cashier:    { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200'     },
}

const SHIFT_COLORS = {
    Morning:  'text-orange-500',
    'Full Day': 'text-yellow-500',
    Evening:  'text-indigo-500',
    Night:    'text-slate-400',
}

const AVATAR_COLORS = [
    'bg-emerald-100 text-emerald-700',
    'bg-sky-100 text-sky-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
]

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function StaffManagement() {
    const { addToast } = useToast()
    const [staff, setStaff] = useState(initialStaff)
    const [modal, setModal] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' })

    const [currentStaff, setCurrentStaff] = useState({
        name: '', email: '', phone: '', role: 'Manager', shift: 'Morning', status: 'Active'
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight">
                        Staff Operations &amp; Shifts
                    </h1>
                    <p className="text-surface-500 text-sm mt-1 font-medium">
                        Verify employee roles, configure morning/night shift logs, and adjust active statuses
                    </p>
                </div>
                <button
                    onClick={() => { setEditMode(false); setModal(true) }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold rounded-2xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
                >
                    <HiPlus className="w-4 h-4" />
                    Add Staff Member
                </button>
            </div>

            {/* ── Summary Pills ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Staff',  value: staff.length,                                               bg: 'bg-slate-50   border-slate-200',   text: 'text-slate-700'   },
                    { label: 'Active',       value: staff.filter(s => s.status === 'Active').length,            bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
                    { label: 'Inactive',     value: staff.filter(s => s.status === 'Inactive').length,          bg: 'bg-red-50     border-red-200',     text: 'text-red-600'     },
                    { label: 'Roles',        value: [...new Set(staff.map(s => s.role))].length,                bg: 'bg-sky-50     border-sky-200',     text: 'text-sky-700'     },
                ].map(p => (
                    <div key={p.label} className={`flex flex-col gap-0.5 px-4 py-3 rounded-2xl border ${p.bg}`}>
                        <span className={`text-xl font-black ${p.text}`}>{p.value}</span>
                        <span className="text-xs font-semibold text-surface-500">{p.label}</span>
                    </div>
                ))}
            </div>

            {/* ── Staff Table Card ─────────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-surface-200/60 shadow-soft overflow-hidden">

                {/* Desktop Table Header */}
                <div className="hidden md:grid grid-cols-[2fr_2fr_1.2fr_1.5fr_1.3fr_1.1fr_auto] gap-4 px-6 py-3 bg-surface-50 border-b border-surface-100">
                    {['Employee Name', 'Email Payout', 'Assigned Role', 'Phone Number', 'Shift Slot', 'Active Status', ''].map((h, i) => (
                        <span key={i} className="text-[10px] font-black uppercase tracking-widest text-surface-400">{h}</span>
                    ))}
                </div>

                {/* Rows */}
                <div className="divide-y divide-surface-100">
                    {staff.map((member, idx) => {
                        const role  = ROLE_STYLES[member.role]  || ROLE_STYLES.Manager
                        const shiftColor = SHIFT_COLORS[member.shift] || 'text-surface-400'
                        const avatar = AVATAR_COLORS[idx % AVATAR_COLORS.length]

                        return (
                            <div key={member.id} className="group hover:bg-surface-50/70 transition-colors duration-150">

                                {/* ── DESKTOP ROW ──────────────────────────── */}
                                <div className="hidden md:grid grid-cols-[2fr_2fr_1.2fr_1.5fr_1.3fr_1.1fr_auto] gap-4 items-center px-6 py-4">

                                    {/* Employee Name */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${avatar}`}>
                                            {getInitials(member.name)}
                                        </div>
                                        <span className="text-sm font-bold text-surface-900 truncate">{member.name}</span>
                                    </div>

                                    {/* Email */}
                                    <span className="text-sm text-surface-500 font-medium truncate">{member.email}</span>

                                    {/* Role Badge */}
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold w-fit ${role.bg} ${role.text} ${role.border}`}>
                                        {member.role}
                                    </span>

                                    {/* Phone */}
                                    <span className="text-sm text-surface-700 font-medium">{member.phone}</span>

                                    {/* Shift */}
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-surface-600">
                                        <HiOutlineClock className={`w-3.5 h-3.5 ${shiftColor}`} />
                                        {member.shift} Shift
                                    </span>

                                    {/* Status */}
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border w-fit ${
                                        member.status === 'Active'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                        {member.status}
                                    </span>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => handleEdit(member)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-surface-600 border border-surface-200 rounded-xl hover:bg-surface-100 transition-colors cursor-pointer"
                                        >
                                            <HiPencil className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(member.id)}
                                            title={member.status === 'Active' ? 'Deactivate' : 'Activate'}
                                            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                                                member.status === 'Active'
                                                    ? 'border-surface-200 hover:bg-red-50 hover:border-red-200 text-red-500'
                                                    : 'border-surface-200 hover:bg-emerald-50 hover:border-emerald-200 text-emerald-500'
                                            }`}
                                        >
                                            {member.status === 'Active' ? <HiBan className="w-4 h-4" /> : <HiCheckCircle className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm({ open: true, id: member.id, name: member.name })}
                                            title="Delete"
                                            className="p-1.5 rounded-xl border border-surface-200 hover:bg-red-50 hover:border-red-200 text-red-500 transition-colors cursor-pointer"
                                        >
                                            <HiTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* ── MOBILE CARD ──────────────────────────── */}
                                <div className="md:hidden p-4">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${avatar}`}>
                                                {getInitials(member.name)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-surface-900 truncate">{member.name}</p>
                                                <p className="text-xs text-surface-500 truncate">{member.email}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border shrink-0 ${
                                            member.status === 'Active'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                            {member.status}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold ${role.bg} ${role.text} ${role.border}`}>
                                            {member.role}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-surface-200 bg-surface-50 text-xs font-bold text-surface-600">
                                            <HiOutlineClock className={`w-3 h-3 ${shiftColor}`} />
                                            {member.shift} Shift
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg border border-surface-200 bg-surface-50 text-xs text-surface-600 font-medium">
                                            {member.phone}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(member)}
                                            className="flex-1 inline-flex items-center justify-center gap-1 py-2 text-xs font-bold text-surface-600 border border-surface-200 rounded-xl hover:bg-surface-100 transition-colors cursor-pointer"
                                        >
                                            <HiPencil className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(member.id)}
                                            className={`flex-1 inline-flex items-center justify-center gap-1 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                                                member.status === 'Active'
                                                    ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                            }`}
                                        >
                                            {member.status === 'Active'
                                                ? <><HiBan className="w-3.5 h-3.5" /> Deactivate</>
                                                : <><HiCheckCircle className="w-3.5 h-3.5" /> Activate</>
                                            }
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm({ open: true, id: member.id, name: member.name })}
                                            className="px-3 py-2 text-xs font-bold rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                        >
                                            <HiTrash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        )
                    })}
                </div>

                {/* Empty State */}
                {staff.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center">
                            <HiUsers className="w-7 h-7 text-surface-400" />
                        </div>
                        <p className="text-sm font-bold text-surface-500">No staff members found</p>
                        <p className="text-xs text-surface-400">Add your first staff member to get started</p>
                    </div>
                )}
            </div>

            {/* ── Add / Edit Modal ─────────────────────────────────────── */}
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
                                { value: 'Manager',    label: 'Branch Manager' },
                                { value: 'Cashier',    label: 'Billing Cashier' },
                                { value: 'Technician', label: 'Technical Inspector' },
                            ]}
                        />
                        <Select
                            label="Scheduled Shift Timings"
                            value={currentStaff.shift}
                            onChange={(e) => setCurrentStaff({ ...currentStaff, shift: e.target.value })}
                            options={[
                                { value: 'Morning',  label: 'Morning Slot' },
                                { value: 'Evening',  label: 'Evening Slot' },
                                { value: 'Night',    label: 'Night Shift' },
                                { value: 'Full Day', label: 'Full Duty Day' },
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

            {/* ── Delete Confirm ───────────────────────────────────────── */}
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

