import { useState, useEffect } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'

const initialDisputes = [
    { id: 'DSP-001', user: 'Priya Sharma', type: 'Escrow', amount: '2000', reason: 'Player did not show up', status: 'Open', date: 'Mar 1, 2026', notes: '' },
    { id: 'DSP-002', user: 'Arjun Mehta', type: 'Refund', amount: '800', reason: 'Booking cancelled by venue', status: 'In Review', date: 'Feb 28, 2026', notes: '' },
    { id: 'DSP-003', user: 'Sneha Reddy', type: 'Escrow', amount: '3000', reason: 'Match not conducted', status: 'Resolved', date: 'Feb 25, 2026', notes: 'Refund processed to wallet' },
]

export default function Disputes() {
    const { addToast } = useToast()
    const [disputes, setDisputes] = useState(() => {
        const saved = localStorage.getItem('sa_disputes')
        return saved ? JSON.parse(saved) : initialDisputes
    })

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDispute, setSelectedDispute] = useState(null)
    const [resolutionNotes, setResolutionNotes] = useState('')
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    useEffect(() => {
        localStorage.setItem('sa_disputes', JSON.stringify(disputes))
    }, [disputes])

    const handleOpenResolve = (dispute) => {
        setSelectedDispute(dispute)
        setResolutionNotes(dispute.notes || '')
        setIsModalOpen(true)
    }

    const handleConfirmResolve = () => {
        if (!resolutionNotes.trim()) {
            addToast({ title: 'Error', message: 'Please provide resolution notes', type: 'error' })
            return
        }
        setIsModalOpen(false)
        setIsConfirmOpen(true)
    }

    const processResolution = () => {
        setDisputes(prev => prev.map(d => 
            d.id === selectedDispute.id 
                ? { ...d, status: 'Resolved', notes: resolutionNotes } 
                : d
        ))
        setIsConfirmOpen(false)
        setSelectedDispute(null)
        setResolutionNotes('')
        addToast({ title: 'Resolved', message: `Dispute ${selectedDispute.id} has been resolved`, type: 'success' })
    }

    const columns = [
        { key: 'id', label: 'ID' }, 
        { key: 'user', label: 'User' },
        { 
            key: 'type', 
            label: 'Type', 
            render: v => <Badge variant={v === 'Escrow' ? 'warning' : 'info'}>{v}</Badge> 
        },
        { 
            key: 'amount', 
            label: 'Amount',
            render: v => `₹${Number(v).toLocaleString()}`
        }, 
        { key: 'reason', label: 'Reason' },
        { 
            key: 'status', 
            label: 'Status', 
            render: v => (
                <Badge variant={v === 'Open' ? 'danger' : v === 'In Review' ? 'warning' : 'success'} dot>
                    {v}
                </Badge>
            ) 
        },
        { 
            key: 'action', 
            label: 'Action', 
            render: (_, r) => r.status !== 'Resolved' ? (
                <Button size="sm" variant="outline" onClick={() => handleOpenResolve(r)}>
                    Resolve
                </Button>
            ) : (
                <span className="text-xs text-surface-400 font-medium">Completed</span>
            ) 
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Disputes</h1>
                <p className="text-surface-500 text-sm mt-1">Escrow and refund dispute management</p>
            </div>

            <DataTable columns={columns} data={disputes} />

            {/* Resolve Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Resolve Dispute"
            >
                <div className="space-y-4 pt-2">
                    <div className="p-4 bg-surface-50 rounded-xl space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-surface-500">Dispute ID</span>
                            <span className="font-bold text-surface-900">{selectedDispute?.id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-surface-500">Amount</span>
                            <span className="font-bold text-primary-600">₹{Number(selectedDispute?.amount).toLocaleString()}</span>
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
                        <p className="text-xs text-surface-500 mt-1">* This will be visible to both parties</p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmResolve}>Resolve Dispute</Button>
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
