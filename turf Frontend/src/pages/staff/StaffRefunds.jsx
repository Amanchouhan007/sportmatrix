import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const initialRefunds = [
    { id: 'REF-001', booking: 'BK-012', customer: 'Rahul K.', phone: '9876543210', amount: '800', reason: 'Weather cancellation', paymentMethod: 'UPI', requestedDate: 'Jul 28, 2026', status: 'Pending' },
    { id: 'REF-002', booking: 'BK-008', customer: 'Priya S.', phone: '9123456789', amount: '400', reason: 'Slot unavailable', paymentMethod: 'Cash', requestedDate: 'Jul 27, 2026', status: 'Approved' },
    { id: 'REF-003', booking: 'BK-005', customer: 'Arjun M.', phone: '9988776655', amount: '1200', reason: 'Customer request', paymentMethod: 'Card', requestedDate: 'Jul 25, 2026', status: 'Rejected' },
]

export default function StaffRefunds() {
    const [refunds] = useState(initialRefunds)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [selectedRefund, setSelectedRefund] = useState(null)

    const handleView = (refund) => {
        setSelectedRefund(refund)
        setIsViewOpen(true)
    }

    const columns = [
        { key: 'id', label: 'ID' }, 
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
                <Badge variant={
                    v === 'Approved' ? 'success' : 
                    v === 'Pending' ? 'warning' : 'danger'
                } dot={v === 'Pending'}>
                    {v}
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

    const getStatusVariant = (status) => {
        if (status === 'Approved') return 'success'
        if (status === 'Pending') return 'warning'
        return 'danger'
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Refund Requests</h1>
                <p className="text-surface-500 text-sm mt-1">View refund request details</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden pt-4">
                <DataTable columns={columns} data={refunds} />
            </div>

            {/* View Refund Details Modal */}
            <Modal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="Refund Details"
            >
                {selectedRefund && (
                    <div className="space-y-5">
                        {/* Header with Refund ID and Status */}
                        <div className="flex items-center justify-between pb-4 border-b border-surface-100">
                            <div>
                                <p className="text-xs text-surface-400 uppercase tracking-wider">Refund ID</p>
                                <p className="text-lg font-bold text-surface-900">{selectedRefund.id}</p>
                            </div>
                            <Badge variant={getStatusVariant(selectedRefund.status)} dot>
                                {selectedRefund.status}
                            </Badge>
                        </div>

                        {/* Booking & Customer Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">📋 Booking ID</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedRefund.booking}</p>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">👤 Customer Name</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedRefund.customer}</p>
                            </div>
                        </div>

                        {/* Phone & Requested Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">📞 Phone Number</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedRefund.phone || 'N/A'}</p>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">📅 Requested Date</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedRefund.requestedDate || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="bg-surface-50 rounded-xl p-4">
                            <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">📝 Reason</p>
                            <p className="text-sm font-semibold text-surface-900">{selectedRefund.reason}</p>
                        </div>

                        {/* Amount & Payment Method */}
                        <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-surface-600 font-medium">💰 Refund Amount</p>
                                <p className="text-xl font-bold text-accent-600">₹{Number(selectedRefund.amount).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-surface-600 font-medium">💳 Payment Method</p>
                                <span className="text-sm font-semibold text-surface-800">
                                    {selectedRefund.paymentMethod === 'Cash' && '💵 '}
                                    {selectedRefund.paymentMethod === 'UPI' && '📱 '}
                                    {selectedRefund.paymentMethod === 'Card' && '💳 '}
                                    {selectedRefund.paymentMethod || 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Current Status */}
                        <div className="bg-surface-50 rounded-xl p-4 flex items-center justify-between">
                            <p className="text-sm text-surface-600 font-medium">📊 Current Status</p>
                            <Badge variant={getStatusVariant(selectedRefund.status)} dot>
                                {selectedRefund.status}
                            </Badge>
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
