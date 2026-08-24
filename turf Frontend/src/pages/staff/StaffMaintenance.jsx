import { useState, useEffect, useCallback } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { getMaintenanceTickets, updateMaintenanceTicket } from '../../services/maintenanceService'
import useRealtime from '../../utils/useRealtime'

const PRIORITY_FROM_BACKEND = { URGENT: 'Urgent', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' }
const STATUS_FROM_BACKEND = { OPEN: 'Open', SCHEDULED: 'Scheduled', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' }

export default function StaffMaintenance() {
    const { addToast } = useToast()
    const [tasks, setTasks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [busyId, setBusyId] = useState(null)

    const fetchTasks = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await getMaintenanceTickets()
            setTasks((res.data || []).map(t => ({
                id: t.id,
                task: t.issueDescription,
                area: t.turfArea,
                priority: PRIORITY_FROM_BACKEND[t.priorityLevel] || t.priorityLevel,
                due: t.targetDeadline ? new Date(t.targetDeadline).toLocaleDateString('en-IN') : '',
                status: STATUS_FROM_BACKEND[t.status] || t.status
            })))
        } catch (err) {
            addToast({ title: 'Load Failed', message: err.message || 'Failed to load maintenance tasks.', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

    useEffect(() => { fetchTasks() }, [fetchTasks])
    useRealtime(['maintenance:updated'], () => fetchTasks())

    const handleStartTask = async (taskId) => {
        setBusyId(taskId)
        try {
            await updateMaintenanceTicket(taskId, { status: 'IN_PROGRESS' })
            addToast({ title: 'Task Started', message: `Task ${taskId} is now In Progress`, type: 'info' })
            fetchTasks()
        } catch (err) {
            addToast({ title: 'Update Failed', message: err.message || 'Could not start this task.', type: 'error' })
        } finally {
            setBusyId(null)
        }
    }

    const handleCompleteTask = async (taskId) => {
        setBusyId(taskId)
        try {
            await updateMaintenanceTicket(taskId, { status: 'COMPLETED' })
            addToast({ title: 'Task Completed', message: `Task ${taskId} has been completed`, type: 'success' })
            fetchTasks()
        } catch (err) {
            addToast({ title: 'Update Failed', message: err.message || 'Could not complete this task.', type: 'error' })
        } finally {
            setBusyId(null)
        }
    }

    const handleView = (task) => {
        setSelectedTask(task)
        setIsViewOpen(true)
    }

    const taskColumns = [
        { key: 'id', label: 'ID' },
        { key: 'task', label: 'Task' },
        { key: 'area', label: 'Area' },
        {
            key: 'priority',
            label: 'Priority',
            render: v => <Badge variant={v === 'Urgent' ? 'danger' : v === 'Medium' ? 'warning' : 'default'}>{v}</Badge>
        },
        { key: 'due', label: 'Due' },
        {
            key: 'status',
            label: 'Status',
            render: v => <Badge variant={v === 'In Progress' ? 'primary' : v === 'Completed' ? 'success' : 'warning'} dot={v !== 'Completed'}>{v}</Badge>
        },
        {
            key: 'action',
            label: 'Action',
            render: (_, r) => {
                const isBusy = busyId === r.id
                if (r.status === 'Open' || r.status === 'Scheduled') {
                    return (
                        <Button size="sm" variant="accent" onClick={() => handleStartTask(r.id)} disabled={isBusy}>
                            ▶️ {isBusy ? 'Starting...' : 'Start Task'}
                        </Button>
                    )
                }
                if (r.status === 'In Progress') {
                    return (
                        <Button size="sm" variant="success" onClick={() => handleCompleteTask(r.id)} disabled={isBusy}>
                            ✅ {isBusy ? 'Completing...' : 'Complete Task'}
                        </Button>
                    )
                }
                if (r.status === 'Completed') {
                    return (
                        <Button size="sm" variant="outline" onClick={() => handleView(r)}>
                            👁️ View
                        </Button>
                    )
                }
                return null
            }
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Maintenance Tasks</h1>
                <p className="text-surface-500 text-sm mt-1">Your assigned maintenance duties</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden pt-4">
                {isLoading ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">No maintenance tasks assigned.</div>
                ) : (
                    <DataTable columns={taskColumns} data={tasks} />
                )}
            </div>

            {/* View Completed Task Modal */}
            <Modal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="Task Details"
            >
                {selectedTask && (
                    <div className="space-y-5">
                        {/* Header with ID and Status */}
                        <div className="flex items-center justify-between pb-4 border-b border-surface-100">
                            <div>
                                <p className="text-xs text-surface-400 uppercase tracking-wider">Task ID</p>
                                <p className="text-lg font-bold text-surface-900">{selectedTask.id}</p>
                            </div>
                            <Badge variant="success" dot>{selectedTask.status}</Badge>
                        </div>

                        {/* Task Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">🔧 Task</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedTask.task}</p>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">📍 Area</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedTask.area}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">⚡ Priority</p>
                                <Badge variant={selectedTask.priority === 'Urgent' ? 'danger' : selectedTask.priority === 'Medium' ? 'warning' : 'default'}>
                                    {selectedTask.priority}
                                </Badge>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">📅 Due Date</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedTask.due}</p>
                            </div>
                        </div>

                        {/* Status Highlight */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 flex items-center justify-between">
                            <p className="text-sm text-surface-600 font-medium">✅ Current Status</p>
                            <Badge variant="success" dot>{selectedTask.status}</Badge>
                        </div>

                        {/* Close Button */}
                        <div className="flex justify-end pt-2">
                            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
