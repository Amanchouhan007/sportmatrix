import { useState, useEffect, useCallback } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { getRefundRequests, updateRefundStatus } from '../../services/refundService'
import useRealtime from '../../utils/useRealtime'
import { useAuth } from '../../context/AuthContext'

export default function StaffRefunds() {
    const { addToast } = useToast()
    const { user } = useAuth() || {}
    const isOwnerOrAdmin = user?.role === 'OWNER' || user?.role === 'SUPER_ADMIN'

    const [refunds, setRefunds] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [selectedRefund, setSelectedRefund] = useState(null)
    const [isUpdating, setIsUpdating] = useState(false)

    const fetchRefunds = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await getRefundRequests()
            setRefunds(res.data || [])
        } catch (err) {
            addToast({ title: 'Load Failed', message: err.message || 'Failed to load refund requests.', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

    useEffect(() => { fetchRefunds() }, [fetchRefunds])
    useRealtime(['refund:new', 'refund:updated'], () => fetchRefunds())

    const handleView = (refund) => {
        setSelectedRefund(refund)
        setIsViewOpen(true)
    }

    const handleUpdateStatus = async (status) => {
        if (!selectedRefund) return
        setIsUpdating(true)
        try {
            await updateRefundStatus(selectedRefund.id, status)
            addToast({ title: 'Refund Updated', message: `Refund ${selectedRefund.ticketNumber} marked ${status.toLowerCase()}.`, type: 'success' })
            setIsViewOpen(false)
            fetchRefunds()
        } catch (err) {
            addToast({ title: 'Update Failed', message: err.message || 'Could not update refund status.', type: 'error' })
        } finally {
            setIsUpdating(false)
        }
    }

    const getStatusVariant = (status) => {
        if (status === 'APPROVED' || status === 'REFUNDED') return 'success'
        if (status === 'PENDING_REVIEW') return 'warning'
        return 'danger'
    }

    const columns = [
        { key: 'ticketNumber', label: 'ID' },
        { key: 'booking', label: 'Booking' },
        { key: 'customer', label: 'Customer' },
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
                <Badge variant={getStatusVariant(v)} dot={v === 'PENDING_REVIEW'}>
                    {v?.replace(/_/g, ' ')}
                </Badge>
            )
        },
        {
            key: 'action',
            label: 'Action',
            render: (_, r) => (
                <Button size="sm" variant="outline" onClick={() => handleView(r)}>
                    👁️ View
                </Button>
            )
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Refund Requests</h1>
                <p className="text-surface-500 text-sm mt-1">View and manage refund request details</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden pt-4">
                {isLoading ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">Loading refund requests...</div>
                ) : refunds.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">No refund requests found.</div>
                ) : (
                    <DataTable columns={columns} data={refunds} />
                )}
            </div>

            {/* View/Update Refund Details Modal */}
            <Modal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="Refund Details"
            >
                {selectedRefund && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between pb-4 border-b border-surface-100">
                            <div>
                                <p className="text-xs text-surface-400 uppercase tracking-wider">Refund ID</p>
                                <p className="text-lg font-bold text-surface-900">{selectedRefund.ticketNumber}</p>
                            </div>
                            <Badge variant={getStatusVariant(selectedRefund.status)} dot>
                                {selectedRefund.status?.replace(/_/g, ' ')}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">📋 Booking ID</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedRefund.booking || 'N/A'}</p>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">👤 Customer Name</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedRefund.customer}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">📞 Phone Number</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedRefund.phone || 'N/A'}</p>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">📅 Requested Date</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedRefund.requestedDate ? new Date(selectedRefund.requestedDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                            </div>
                        </div>

                        <div className="bg-surface-50 rounded-xl p-4">
                            <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">📝 Reason</p>
                            <p className="text-sm font-semibold text-surface-900">{selectedRefund.reason}</p>
                        </div>

                        <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-surface-600 font-medium">💰 Refund Amount</p>
                                <p className="text-xl font-bold text-accent-600">₹{Number(selectedRefund.amount).toLocaleString()}</p>
                            </div>
                        </div>

                        {isOwnerOrAdmin && selectedRefund.status === 'PENDING_REVIEW' ? (
                            <div className="flex gap-3 justify-end pt-2">
                                <Button variant="outline" disabled={isUpdating} onClick={() => handleUpdateStatus('REJECTED')}>Reject</Button>
                                <Button disabled={isUpdating} onClick={() => handleUpdateStatus('APPROVED')}>Approve</Button>
                            </div>
                        ) : isOwnerOrAdmin && selectedRefund.status === 'APPROVED' ? (
                            <div className="flex gap-3 justify-end pt-2">
                                <Button disabled={isUpdating} onClick={() => handleUpdateStatus('REFUNDED')}>Mark Refunded (Credit Wallet)</Button>
                            </div>
                        ) : (
                            <div className="flex justify-end pt-2">
                                <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    )
}
