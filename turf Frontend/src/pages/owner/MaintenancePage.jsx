import { useState, useEffect, useCallback } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import Card from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import { HiExclamation, HiPlus, HiRefresh } from 'react-icons/hi'
import { getMaintenanceTickets, createMaintenanceTicket, updateMaintenanceTicket } from '../../services/maintenanceService'
import { getBranches, getMyTurfs } from '../../services/branchService'
import { getBranchSports } from '../../services/sportsService'
import { getStaff } from '../../services/staffService'
import useRealtime from '../../utils/useRealtime'

const PRIORITY_TO_BACKEND = { Urgent: 'URGENT', High: 'HIGH', Medium: 'MEDIUM', Low: 'LOW' }
const PRIORITY_FROM_BACKEND = { URGENT: 'Urgent', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' }
const STATUS_TO_BACKEND = { Open: 'OPEN', Scheduled: 'SCHEDULED', 'In Progress': 'IN_PROGRESS', Completed: 'COMPLETED' }
const STATUS_FROM_BACKEND = { OPEN: 'Open', SCHEDULED: 'Scheduled', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' }

const EMPTY_TASK = { branchId: '', task: '', area: '', assignee: '', priority: 'Medium', due: '' }

export default function MaintenancePage() {
    const { addToast } = useToast()
    const [tasks, setTasks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [myTurfs, setMyTurfs] = useState([])
    const [selectedBranchId, setSelectedBranchId] = useState('')
    const [modal, setModal] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Dynamic dropdown states
    const [courtOptions, setCourtOptions] = useState([])
    const [staffOptions, setStaffOptions] = useState([])

    // Status update drawer
    const [updateModal, setUpdateModal] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [selectedStatus, setSelectedStatus] = useState('In Progress')

    // Create task form state
    const [newTask, setNewTask] = useState(EMPTY_TASK)

    const fetchMaintenanceForBranch = useCallback(async (bId) => {
        setIsLoading(true)
        try {
            const res = await getMaintenanceTickets(bId ? { branchId: bId } : undefined)
            const rawList = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
            const list = Array.isArray(rawList) ? rawList : [];
            setTasks(list.map(t => ({
                id: t.id,
                branchId: t.branchId,
                branchName: t.branchName || t.branch?.branchName || t.branch?.name || '',
                task: t.issueDescription,
                area: t.turfArea,
                assignee: t.assignedSpecialist,
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

    const loadBranchDetails = useCallback((bId, turfsList = []) => {
        const targetId = bId || (turfsList && (turfsList[0]?.id || turfsList[0]?._id))
        if (!targetId) return;
        const currentTurf = (turfsList || []).find(t => (t.id || t._id) === targetId) || {}
        const turfNamePrefix = currentTurf.branchName || currentTurf.name || 'Turf'

        getBranchSports(targetId).then(sportsRes => {
            const sportsList = sportsRes?.data?.data || sportsRes?.data || (Array.isArray(sportsRes) ? sportsRes : [])
            const courts = []
            if (Array.isArray(sportsList) && sportsList.length > 0) {
                sportsList.forEach(sp => {
                    if (Array.isArray(sp.courts) && sp.courts.length > 0) {
                        sp.courts.forEach(c => courts.push({ 
                            value: c.name || c, 
                            label: `🏟️ ${turfNamePrefix} — ${c.name || c} (${sp.name || 'Sport'})` 
                        }))
                    } else {
                        courts.push({ value: `Court 1`, label: `🏟️ ${turfNamePrefix} — Court 1 (${sp.name || 'Sport'})` })
                        courts.push({ value: `Court 2`, label: `🏟️ ${turfNamePrefix} — Court 2 (${sp.name || 'Sport'})` })
                    }
                })
            }
            if (courts.length === 0) {
                courts.push(
                    { value: 'Court 1', label: `🏟️ ${turfNamePrefix} — Court 1` },
                    { value: 'Turf A', label: `🏟️ ${turfNamePrefix} — Turf A Field` }
                )
            }
            courts.push({ value: 'Facility', label: `🏟️ ${turfNamePrefix} — Facility / General` })
            setCourtOptions(courts)
        }).catch(() => {
            setCourtOptions([
                { value: 'Court 1', label: `🏟️ ${turfNamePrefix} — Court 1` },
                { value: 'Turf A', label: `🏟️ ${turfNamePrefix} — Turf A Field` },
                { value: 'Facility', label: `🏟️ ${turfNamePrefix} — Facility / General` }
            ])
        });

        getStaff(targetId).then(staffRes => {
            const rawStaff = staffRes?.data?.data || staffRes?.data || (Array.isArray(staffRes) ? staffRes : []);
            if (Array.isArray(rawStaff) && rawStaff.length > 0) {
                setStaffOptions(rawStaff.map(s => ({ value: s.fullName || s.name, label: `${s.fullName || s.name} (${s.role || 'Staff'})` })))
            } else {
                setStaffOptions([])
            }
        }).catch(() => setStaffOptions([]))
    }, [])

    useEffect(() => {
        let isMounted = true
        const loadTurfs = async () => {
            let list = []
            try {
                const res = await getMyTurfs()
                const raw = res?.data?.data || res?.data
                if (Array.isArray(raw) && raw.length > 0) list = raw
            } catch (e) {
                console.warn('getMyTurfs error:', e?.message)
            }

            if (list.length === 0) {
                try {
                    const res = await getBranches({ limit: 100 })
                    const raw = res?.data?.data?.branches || res?.data?.branches || (Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : []))
                    if (Array.isArray(raw)) list = raw
                } catch (e) {
                    console.warn('getBranches error:', e?.message)
                }
            }

            if (!isMounted) return

            setMyTurfs(list)
            if (list.length > 0) {
                const firstId = list[0].id || list[0]._id
                const initialId = list.length > 1 ? '' : firstId
                setSelectedBranchId(initialId)
                fetchMaintenanceForBranch(initialId)
                loadBranchDetails(firstId, list)
            } else {
                fetchMaintenanceForBranch(null)
            }
        }

        loadTurfs()
        return () => { isMounted = false }
    }, [fetchMaintenanceForBranch, loadBranchDetails])

    useRealtime(['maintenance:updated'], () => fetchMaintenanceForBranch(selectedBranchId))

    const handleBranchSelect = (bId) => {
        setSelectedBranchId(bId)
        fetchMaintenanceForBranch(bId)
        if (bId) loadBranchDetails(bId, myTurfs)
    }

    const handleCreateTask = async () => {
        const targetBranchId = newTask.branchId || selectedBranchId || myTurfs[0]?.id
        if (!newTask.task || !newTask.task.trim()) {
            addToast({ title: 'Description Required', message: 'Please enter the Issue / Task Description', type: 'error' })
            return
        }
        if (!newTask.assignee || !newTask.assignee.trim()) {
            addToast({ title: 'Inspector Required', message: 'Please specify the assigned inspector or specialist', type: 'error' })
            return
        }
        if (!newTask.due) {
            addToast({ title: 'Deadline Required', message: 'Please select a target deadline date', type: 'error' })
            return
        }
        if (!targetBranchId) {
            addToast({ title: 'No Branch Selected', message: 'Please select a Turf Venue first.', type: 'error' })
            return
        }

        setIsSaving(true)
        try {
            await createMaintenanceTicket({
                branchId: targetBranchId,
                issueDescription: newTask.task.trim(),
                turfArea: newTask.area || courtOptions[0]?.value || 'Court 1',
                assignedTo: newTask.assignee.trim(),
                priority: PRIORITY_TO_BACKEND[newTask.priority] || 'MEDIUM',
                targetDeadline: newTask.due
            })
            addToast({ title: 'Task Registered', message: 'Maintenance task registered live in database', type: 'success' })
            setModal(false)
            setNewTask(EMPTY_TASK)
            fetchMaintenanceForBranch(selectedBranchId)
        } catch (err) {
            addToast({ title: 'Save Failed', message: err.message || 'Could not create this task.', type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleUpdateTrigger = (task) => {
        setSelectedTask(task)
        setSelectedStatus(task.status)
        setUpdateModal(true)
    }

    const handleUpdateSave = async () => {
        setIsSaving(true)
        try {
            await updateMaintenanceTicket(selectedTask.id, { status: STATUS_TO_BACKEND[selectedStatus] })
            addToast({ title: 'Task Updated', message: `Maintenance status set to ${selectedStatus}`, type: 'success' })
            setUpdateModal(false)
            fetchMaintenanceForBranch(selectedBranchId)
        } catch (err) {
            addToast({ title: 'Update Failed', message: err.message || 'Could not update this task.', type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    const columns = [
        { key: 'id', label: 'Task ID' },
        ...(myTurfs.length > 1 ? [{
            key: 'branchName',
            label: 'Turf Venue',
            render: (v, r) => (
                <span className="font-semibold text-surface-900">
                    🏟️ {v || r.branchName || myTurfs.find(t => t.id === r.branchId)?.branchName || myTurfs.find(t => t.id === r.branchId)?.name || 'Turf Venue'}
                </span>
            )
        }] : []),
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
        { key: 'due', label: 'Target Deadline' },
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
    const activeTurfObj = myTurfs.find(t => (t.id || t._id) === (newTask.branchId || selectedBranchId)) || myTurfs[0] || {}

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        Mechanical Logs &amp; Maintenance
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Verify court repaints, audit broken lighting rigs, and configure technician logs</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {myTurfs.length > 1 && (
                        <div className="min-w-[220px]">
                            <Select
                                value={selectedBranchId}
                                onChange={(e) => handleBranchSelect(e.target.value)}
                                options={[
                                    { value: '', label: '🌐 All My Turfs' },
                                    ...myTurfs.map(t => ({
                                        value: t.id || t._id,
                                        label: `🏟️ ${t.branchName || t.name}`
                                    }))
                                ]}
                            />
                        </div>
                    )}
                    <Button 
                        onClick={() => { 
                            const initialBId = selectedBranchId || (myTurfs[0]?.id || myTurfs[0]?._id) || '';
                            setNewTask({ ...EMPTY_TASK, branchId: initialBId, area: courtOptions[0]?.value || 'Court 1' }); 
                            if (initialBId) loadBranchDetails(initialBId, myTurfs);
                            setModal(true); 
                        }} 
                        className="shadow-lg shadow-primary-500/10 cursor-pointer"
                    >
                        <HiPlus className="w-5 h-5 mr-1" /> Add Task
                    </Button>
                </div>
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
                {isLoading ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">Loading maintenance tasks...</div>
                ) : (
                    <DataTable columns={columns} data={tasks} />
                )}
            </Card>

            {/* Create Task modal */}
            <Modal isOpen={modal} onClose={() => setModal(false)} title={`Register Maintenance Task (${activeTurfObj.branchName || activeTurfObj.name || 'Turf Venue'})`} size="sm">
                <div className="space-y-4 animate-in fade-in">
                    {myTurfs.length > 1 && (
                        <Select
                            label="Target Turf Venue"
                            value={newTask.branchId || selectedBranchId || (myTurfs[0]?.id || myTurfs[0]?._id)}
                            onChange={(e) => {
                                const newBId = e.target.value;
                                setNewTask(prev => ({ ...prev, branchId: newBId }));
                                loadBranchDetails(newBId, myTurfs);
                            }}
                            options={myTurfs.map(t => ({
                                value: t.id || t._id,
                                label: `🏟️ ${t.branchName || t.name} (${t.city || 'Venue'})`
                            }))}
                        />
                    )}
                    <Input
                        label="Issue / Task Description"
                        placeholder="e.g. Repair fence wiring / Floodlights maintenance"
                        value={newTask.task}
                        onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Target Turf Location"
                            value={newTask.area}
                            onChange={(e) => setNewTask({ ...newTask, area: e.target.value })}
                            options={courtOptions}
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
                        {staffOptions.length > 0 ? (
                            <Select
                                label="Assigned Inspector"
                                value={newTask.assignee}
                                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                                options={staffOptions}
                            />
                        ) : (
                            <Input
                                label="Assigned Inspector"
                                placeholder="e.g. Suresh Patil"
                                value={newTask.assignee}
                                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                            />
                        )}
                        <CustomDatePicker
                            label="Target Deadline"
                            value={newTask.due}
                            onChange={(val) => setNewTask({ ...newTask, due: val })}
                            align="right"
                        />
                    </div>



                    <div className="flex gap-3 justify-end pt-4 border-t border-surface-100 mt-6 font-semibold">
                        <Button variant="secondary" onClick={() => setModal(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleCreateTask} disabled={isSaving}>{isSaving ? 'Saving...' : 'Register Log'}</Button>
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
                            <Button variant="secondary" onClick={() => setUpdateModal(false)} disabled={isSaving}>Cancel</Button>
                            <Button onClick={handleUpdateSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">{isSaving ? 'Saving...' : 'Save Status'}</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
