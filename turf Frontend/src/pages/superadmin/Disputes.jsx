import { useState, useEffect } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { getDisputes, resolveDispute, updateDisputeStatus } from '../../services/disputeService'

export default function Disputes() {
    const { addToast } = useToast()
    const [disputes, setDisputes] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeStatus, setActiveStatus] = useState('ALL')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDispute, setSelectedDispute] = useState(null)
    const [resolutionNotes, setResolutionNotes] = useState('')
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Fetch from real API on mount
    useEffect(() => {
        loadDisputes()
    }, [activeStatus])

    const loadDisputes = async () => {
        setLoading(true)
        try {
            const params = activeStatus !== 'ALL' ? { status: activeStatus } : {}
            const result = await getDisputes(params)
            if (result && result.success !== false) {
                setDisputes(result.data || [])
            }
        } catch (err) {
            console.error('[Disputes] Load error:', err)
            addToast({ title: 'Load Error', message: 'Could not fetch disputes from server.', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleOpenResolve = (dispute) => {
        setSelectedDispute(dispute)
        setResolutionNotes(dispute.notes || '')
        setIsModalOpen(true)
    }

    const handleMarkInReview = async (dispute) => {
        try {
            await updateDisputeStatus(dispute.id, 'IN_REVIEW')
            setDisputes(prev => prev.map(d =>
                d.id === dispute.id ? { ...d, status: 'In Review', rawStatus: 'IN_REVIEW' } : d
            ))
            addToast({ title: 'Status Updated', message: `Dispute ${dispute.id} marked as In Review`, type: 'info' })
        } catch (err) {
            addToast({ title: 'Error', message: 'Failed to update dispute status.', type: 'error' })
        }
    }

    const handleConfirmResolve = () => {
        if (!resolutionNotes.trim()) {
            addToast({ title: 'Error', message: 'Please provide resolution notes', type: 'error' })
            return
        }
        setIsModalOpen(false)
        setIsConfirmOpen(true)
    }

    const processResolution = async () => {
        setIsSaving(true)
        try {
            await resolveDispute(selectedDispute.id, resolutionNotes)
            setDisputes(prev => prev.map(d =>
                d.id === selectedDispute.id
                    ? { ...d, status: 'Resolved', rawStatus: 'RESOLVED', notes: resolutionNotes }
                    : d
            ))
            addToast({ title: 'Resolved', message: `Dispute ${selectedDispute.id} has been resolved`, type: 'success' })
        } catch (err) {
            addToast({ title: 'Error', message: 'Failed to resolve dispute on server.', type: 'error' })
        } finally {
            setIsSaving(false)
            setIsConfirmOpen(false)
            setSelectedDispute(null)
            setResolutionNotes('')
        }
    }

    const STATUS_TABS = ['ALL', 'OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED']

    const columns = [
        {
            key: 'id',
            label: 'ID',
            render: (v) => (
                <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {v}
                </span>
            )
        },
        { 
            key: 'user', 
            label: 'User',
            render: v => <span className="font-semibold text-slate-800 text-xs">{v}</span>
        },
        {
            key: 'type',
            label: 'Type',
            render: v => <Badge variant={v === 'Escrow' ? 'warning' : v === 'Refund' ? 'info' : 'default'}>{v}</Badge>
        },
        {
            key: 'amount',
            label: 'Amount',
            render: v => <span className="font-bold text-slate-900 text-xs">₹{Number(v || 0).toLocaleString('en-IN')}</span>
        },
        { 
            key: 'reason', 
            label: 'Reason',
            render: v => (
                <div className="max-w-[280px] lg:max-w-[340px] truncate text-xs text-slate-600" title={v}>
                    {v}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: v => (
                <Badge variant={v === 'Open' ? 'danger' : v === 'In Review' ? 'warning' : v === 'Resolved' ? 'success' : 'default'} dot>
                    {v}
                </Badge>
            )
        },
        {
            key: 'action',
            label: 'Actions',
            render: (_, r) => {
                if (r.status === 'Resolved' || r.rawStatus === 'RESOLVED') {
                    return <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">✓ Resolved</span>
                }
                return (
                    <div className="flex gap-1.5 whitespace-nowrap">
                        {(r.status === 'Open' || r.rawStatus === 'OPEN') && (
                            <Button size="sm" variant="outline" onClick={() => handleMarkInReview(r)}>
                                Review
                            </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleOpenResolve(r)}>
                            Resolve
                        </Button>
                    </div>
                )
            }
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Dispute Resolution</h1>
                    <p className="text-surface-500 text-sm mt-1">Manage escrow, refund and match disputes</p>
                </div>
                <button
                    onClick={loadDisputes}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-300 text-xs font-bold transition-all"
                >
                    ↻ Refresh
                </button>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 flex-wrap">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveStatus(tab)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            activeStatus === tab
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                        }`}
                    >
                        {tab === 'IN_REVIEW' ? 'In Review' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl" />)}
                </div>
            ) : (
                <DataTable columns={columns} data={disputes} />
            )}

            {disputes.length === 0 && !loading && (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <span className="text-4xl mb-3 block">⚖️</span>
                    <p className="text-sm font-bold text-slate-700">No Disputes Found</p>
                    <p className="text-xs text-slate-400 mt-1">Platform disputes raised by users will appear here in real-time.</p>
                </div>
            )}

            {/* Resolve Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Resolve Dispute">
                <div className="space-y-4 pt-2">
                    <div className="p-4 bg-surface-50 rounded-xl space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-surface-500">Dispute ID</span>
                            <span className="font-bold text-surface-900">{selectedDispute?.id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-surface-500">Amount</span>
                            <span className="font-bold text-primary-600">₹{Number(selectedDispute?.amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col gap-1 pt-2 border-t border-surface-200">
                            <span className="text-xs text-surface-500 font-medium uppercase tracking-wider">Reason</span>
                            <p className="text-sm text-surface-700">{selectedDispute?.reason}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-2">
                        <label className="text-sm font-medium text-surface-700">Resolution Notes</label>
                        <textarea
                            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-500 bg-white text-surface-900 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                            placeholder="Enter how this dispute was resolved..."
                            value={resolutionNotes}
                            onChange={e => setResolutionNotes(e.target.value)}
                        />
                        <p className="text-xs text-surface-500 mt-1">* This will be saved to the database as the official resolution record</p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmResolve} disabled={isSaving}>Resolve Dispute</Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={processResolution}
                title="Finalize Resolution"
                message="Are you sure you want to mark this dispute as Resolved? This action cannot be undone."
                type="warning"
            />
        </div>
    )
}
