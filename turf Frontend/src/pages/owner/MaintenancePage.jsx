import { useState, useEffect, useMemo } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import { HiExclamation, HiPlus, HiRefresh } from 'react-icons/hi'

const initialTasks = [
    { id: 'MT-001', task: 'Re-paint court lines', area: 'Turf A', assignee: 'Ravi Kumar', priority: 'High', due: '2026-03-05', status: 'In Progress' },
    { id: 'MT-002', task: 'Fix floodlight #3', area: 'Turf B', assignee: 'Suresh P.', priority: 'Urgent', due: '2026-03-03', status: 'Open' },
    { id: 'MT-003', task: 'Replace net post', area: 'Court 1', assignee: 'Ravi Kumar', priority: 'Medium', due: '2026-03-10', status: 'Scheduled' },
    { id: 'MT-004', task: 'Deep clean changing room', area: 'Facility', assignee: 'Staff Team', priority: 'Low', due: '2026-03-08', status: 'Completed' },
]

export default function MaintenancePage() {
    const { addToast } = useToast()
    const [tasks, setTasks] = useState(initialTasks)
    const [modal, setModal] = useState(false)

    // Status update drawer
    const [updateModal, setUpdateModal] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [selectedStatus, setSelectedStatus] = useState('In Progress')

    // Create task form state
    const [newTask, setNewTask] = useState({
        task: '',
        area: 'Turf A',
        assignee: '',
        priority: 'Medium',
        due: ''
    })

    const handleCreateTask = () => {
        if (!newTask.task || !newTask.assignee || !newTask.due) {
            addToast({ title: 'Missing Parameter', message: 'Ensure description, assignee and due date are specified', type: 'error' })
            return
        }

        const nextId = `MT-00${tasks.length + 1}`
        setTasks([...tasks, {
            id: nextId,
            task: newTask.task,
            area: newTask.area,
            assignee: newTask.assignee,
            priority: newTask.priority,
            due: newTask.due,
            status: 'Open'
        }])

        setModal(false)
        addToast({ title: 'Task Registered', message: 'New mechanical inspection log registered', type: 'success' })
    }

    const handleUpdateTrigger = (task) => {
        setSelectedTask(task)
        setSelectedStatus(task.status)
        setUpdateModal(true)
    }

    const handleUpdateSave = () => {
        setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: selectedStatus } : t))
        setUpdateModal(false)
        addToast({ title: 'Task Updated', message: `Maintenance status set to ${selectedStatus}`, type: 'success' })
    }

    const columns = [
        { key: 'id', label: 'Task ID' },
        { key: 'task', label: 'Mechanical Issue / Task' },
        { key: 'area', label: 'Turf Area' },
        { key: 'assignee', label: 'Assigned Specialist' },
        {
            key: 'priority',
            label: 'Priority Level',
            render: v => (
                <Badge variant={v === 'Urgent' ? 'danger' : v === 'High' ? 'warning' : v === 'Medium' ? 'primary' : 'default'}>
                    {v}
                </Badge>
            )
        },
        { key: 'due', label: 'Target Payout' },
        {
            key: 'status',
            label: 'Inspected Status',
            render: v => <Badge variant={v === 'Completed' ? 'success' : v === 'In Progress' ? 'primary' : v === 'Open' ? 'danger' : 'warning'} dot>{v}</Badge>
        },
        {
            key: 'action',
            label: '',
            render: (_, r) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleUpdateTrigger(r)} className="cursor-pointer">
                        Update Status
                    </Button>
                </div>
            )
        },
    ]

    const urgentCount = tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Completed').length

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        Mechanical Logs & Maintenance
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Verify court repaints, audit broken lighting rigs, and configure technician logs</p>
                </div>
                <Button onClick={() => setModal(true)} className="shadow-lg shadow-primary-500/10 cursor-pointer">
                    <HiPlus className="w-5 h-5 mr-1" /> Add Task
                </Button>
            </div>

            {/* Urgent Warning Banners */}
            {urgentCount > 0 && (
                <div className="flex items-center gap-3 bg-red-50 p-4 rounded-3xl border border-red-200/50 shadow-soft animate-bounce">
                    <div className="w-10 h-10 rounded-2xl bg-red-150 text-red-600 flex items-center justify-center text-lg">
                        <HiExclamation />
                    </div>
                    <div className="text-xs">
                        <h4 className="font-black text-red-950">Urgent Repairs Pending!</h4>
                        <p className="text-red-700 font-semibold mt-0.5">There is currently <span className="font-extrabold">{urgentCount}</span> urgent mechanical task requiring engineering inspection.</p>
                    </div>
                </div>
            )}

            {/* Tasks Ledger Table */}
            <Card className="p-6">
                <DataTable columns={columns} data={tasks} />
            </Card>

            {/* Create Task modal */}
            <Modal isOpen={modal} onClose={() => setModal(false)} title="Register Maintenance Task" size="sm">
                <div className="space-y-4 animate-in fade-in">
                    <Input
                        label="Issue / Task Description"
                        placeholder="e.g. Repair fence wiring"
                        value={newTask.task}
                        onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Target Turf Location"
                            value={newTask.area}
                            onChange={(e) => setNewTask({ ...newTask, area: e.target.value })}
                            options={[
                                { value: 'Turf A', label: 'Turf A Field' },
                                { value: 'Turf B', label: 'Turf B Field' },
                                { value: 'Court 1', label: 'Badminton Court 1' },
                                { value: 'Facility', label: 'Branch Facility' }
                            ]}
                        />
                        <Select
                            label="Priority Risk Status"
                            value={newTask.priority}
                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                            options={[
                                { value: 'Urgent', label: 'Urgent Alert' },
                                { value: 'High', label: 'High Priority' },
                                { value: 'Medium', label: 'Medium Level' },
                                { value: 'Low', label: 'Low / Minor' }
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Assigned Inspector"
                            placeholder="e.g. Suresh Patil"
                            value={newTask.assignee}
                            onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                        />
                        <Input
                            label="Target Deadline"
                            type="date"
                            value={newTask.due}
                            onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-surface-100 mt-6 font-semibold">
                        <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
                        <Button onClick={handleCreateTask}>Register Log</Button>
                    </div>
                </div>
            </Modal>

            {/* Status updates modal */}
            {selectedTask && (
                <Modal isOpen={updateModal} onClose={() => setUpdateModal(false)} title={`Update Task Status : ${selectedTask.id}`} size="sm">
                    <div className="space-y-4 animate-in fade-in">
                        <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 text-xs">
                            <p className="font-bold text-surface-700">Task: <span className="font-extrabold text-surface-900">{selectedTask.task}</span></p>
                            <p className="font-semibold text-surface-450 mt-1">Area: {selectedTask.area} • Priority: {selectedTask.priority}</p>
                        </div>
                        <Select
                            label="Current Inspection Status"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            options={[
                                { value: 'Open', label: 'Open Issue' },
                                { value: 'Scheduled', label: 'Scheduled Inspection' },
                                { value: 'In Progress', label: 'In Progress Repairs' },
                                { value: 'Completed', label: 'Completed & Inspected' }
                            ]}
                        />
                        <div className="flex gap-3 justify-end pt-4 border-t border-surface-100 mt-6 font-semibold">
                            <Button variant="secondary" onClick={() => setUpdateModal(false)}>Cancel</Button>
                            <Button onClick={handleUpdateSave} className="bg-emerald-600 hover:bg-emerald-700">Save Payout</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
