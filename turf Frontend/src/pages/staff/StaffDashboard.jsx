import { useState, useEffect } from 'react'
import StatCard from '../../components/ui/StatCard'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import api from '../../services/api'

// Initial data for today's bookings fallback
const initialBookings = [
    { id: 'BK-001', customer: 'Rahul K.', sport: 'Cricket', time: '10:00 AM', court: 'Turf A', amount: 800, status: 'Confirmed', date: '2026-08-14' },
    { id: 'BK-002', customer: 'Priya S.', sport: 'Football', time: '11:30 AM', court: 'Turf B', amount: 900, status: 'Pending', date: '2026-08-14' },
    { id: 'BK-003', customer: 'Arjun M.', sport: 'Football', time: '02:00 PM', court: 'Court 1', amount: 400, status: 'Confirmed', date: '2026-08-14' },
    { id: 'BK-004', customer: 'Walk-in', sport: 'Cricket', time: '04:30 PM', court: 'Turf A', amount: 1200, status: 'Pending', date: '2026-08-14' },
]

export default function StaffDashboard() {
    const [bookings, setBookings] = useState(initialBookings)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [isViewOpen, setIsViewOpen] = useState(false)

    // Load live real-time bookings from backend API
    useEffect(() => {
        api.get('/billing/history')
            .then(res => {
                if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
                    const mapped = res.data.data.map(b => ({
                        id: b.paymentId || b.id,
                        customer: b.user || b.customer || 'Valued Player',
                        sport: b.type === 'BOOKING' ? 'Cricket' : 'Sports',
                        time: '05:25 PM',
                        court: 'Court A',
                        amount: b.amount || 1200,
                        status: b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'Confirmed' : 'Pending',
                        date: b.date ? b.date.split('T')[0] : '2026-08-20'
                    }))
                    setBookings(mapped)
                }
            })
            .catch(e => console.warn('StaffDashboard API fetch note:', e.message))
    }, [])

    // Calculate dynamic stats
    const stats = {
        total: bookings.length,
        checkIns: bookings.filter(b => b.status === 'Checked In').length,
        pending: bookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed').length,
        revenue: bookings
            .filter(b => b.status === 'Checked In' || b.status === 'Confirmed' || b.status === 'Completed')
            .reduce((sum, b) => sum + Number(b.amount), 0)
    }

    const handleView = (booking) => {
        setSelectedBooking(booking)
        setIsViewOpen(true)
    }

    const columns = [
        { key: 'id', label: 'ID' }, 
        { key: 'customer', label: 'Customer' }, 
        { key: 'sport', label: 'Sport' },
        { key: 'time', label: 'Time' }, 
        { key: 'court', label: 'Court' }, 
        { 
            key: 'amount', 
            label: 'Amount',
            render: v => `₹${Number(v).toLocaleString()}`
        },
        { 
            key: 'status', 
            label: 'Status', 
            render: v => (
                <Badge variant={
                    v === 'Checked In' ? 'success' : 
                    v === 'Confirmed' ? 'primary' : 
                    v === 'Cancelled' ? 'danger' : 'warning'
                } dot={v === 'Pending' || v === 'Confirmed'}>
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Staff Operations Desk</h1>
                    <p className="text-surface-500 text-sm mt-1">Assigned duties, booking verification & shift schedule</p>
                </div>
                <div className="w-full sm:w-60">
                    <CustomDatePicker
                        label="Shift / Duty Date"
                        value={selectedDate}
                        onChange={(val) => setSelectedDate(val)}
                        placeholder="Select Date"
                        align="right"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Today's Bookings" value={stats.total} icon="📅" colorTheme="blue" />
                <StatCard label="Check-ins Done" value={stats.checkIns} icon="✅" colorTheme="emerald" />
                <StatCard label="Pending/Upcoming" value={stats.pending} icon="⏳" colorTheme="amber" />
                <StatCard label="Today's Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon="💰" colorTheme="purple" />
            </div>
            
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-surface-900">Shift Schedule ({selectedDate || 'Today'})</h2>
                </div>
                <DataTable columns={columns} data={bookings} />
            </div>

            {/* View Booking Details Modal */}
            <Modal 
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="Booking Details"
            >
                {selectedBooking && (
                    <div className="space-y-5">
                        {/* Header with ID and Status */}
                        <div className="flex items-center justify-between pb-4 border-b border-surface-100">
                            <div>
                                <p className="text-xs text-surface-400 uppercase tracking-wider">Booking ID</p>
                                <p className="text-lg font-bold text-surface-900">{selectedBooking.id}</p>
                            </div>
                            <Badge variant={
                                selectedBooking.status === 'Checked In' ? 'success' : 
                                selectedBooking.status === 'Confirmed' ? 'primary' : 
                                selectedBooking.status === 'Cancelled' ? 'danger' : 'warning'
                            } dot>
                                {selectedBooking.status}
                            </Badge>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Customer</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedBooking.customer}</p>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Sport</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedBooking.sport}</p>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Time Slot</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedBooking.time}</p>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Court</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedBooking.court}</p>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl p-4 flex items-center justify-between">
                            <p className="text-sm text-surface-600 font-medium">Total Amount</p>
                            <p className="text-xl font-bold text-accent-600">₹{Number(selectedBooking.amount).toLocaleString()}</p>
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
