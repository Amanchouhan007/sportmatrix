import { useState, useEffect } from 'react'
import StatCard from '../../components/ui/StatCard'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import api from '../../services/api'

export default function StaffDashboard() {
    const [bookings, setBookings] = useState([])
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [isViewOpen, setIsViewOpen] = useState(false)

    // Load live real-time bookings from backend API
    useEffect(() => {
        api.get('/billing/history')
            .then(res => {
                const list = res?.data || (Array.isArray(res) ? res : []);
                if (Array.isArray(list) && list.length > 0) {
                    const mapped = list.map(b => {
                        const gross = Number(b.amount || 0);
                        const comm = b.commissionAmount ? Number(b.commissionAmount) : Math.round(gross * 0.1);
                        const net = b.ownerAmount ? Number(b.ownerAmount) : (gross - comm);

                        return {
                            id: b.invoiceNumber || b.paymentId || b.id,
                            customer: b.customerName || b.user?.fullName || b.user || b.customer || 'Valued Player',
                            sport: b.type === 'BOOKING' ? 'Cricket' : (b.type || 'Sports'),
                            time: b.time || '06:00 PM',
                            court: b.court || b.branchName || 'Main Court',
                            amount: net, // Commission Cut Ke (Net Revenue)
                            grossAmount: gross,
                            commissionAmount: comm,
                            status: b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'Confirmed' : 'Pending',
                            date: b.date ? String(b.date).split('T')[0] : 'Today'
                        };
                    });
                    setBookings(mapped);
                } else {
                    setBookings([]);
                }
            })
            .catch(e => {
                console.warn('StaffDashboard API fetch note:', e.message);
                setBookings([]);
            });
    }, []);

    // Calculate dynamic stats (Net Revenue after Commission)
    const stats = {
        total: bookings.length,
        checkIns: bookings.filter(b => b.status === 'Checked In').length,
        pending: bookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed').length,
        revenue: bookings
            .filter(b => b.status === 'Checked In' || b.status === 'Confirmed' || b.status === 'Completed')
            .reduce((sum, b) => sum + Number(b.amount), 0),
        grossTotal: bookings
            .filter(b => b.status === 'Checked In' || b.status === 'Confirmed' || b.status === 'Completed')
            .reduce((sum, b) => sum + Number(b.grossAmount), 0),
        commissionTotal: bookings
            .filter(b => b.status === 'Checked In' || b.status === 'Confirmed' || b.status === 'Completed')
            .reduce((sum, b) => sum + Number(b.commissionAmount), 0)
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
            label: 'Net Revenue (After 10% Comm)',
            render: (_, r) => (
                <div>
                    <div className="font-bold text-emerald-700">₹{Number(r.amount).toLocaleString()}</div>
                    <div className="text-[10px] text-surface-400 font-medium">Gross: ₹{Number(r.grossAmount).toLocaleString()} • Comm (10%): -₹{Number(r.commissionAmount).toLocaleString()}</div>
                </div>
            )
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
                <StatCard 
                    label="Today's Net Revenue" 
                    value={`₹${stats.revenue.toLocaleString()}`} 
                    change={`Gross: ₹${stats.grossTotal.toLocaleString()} (-10% Comm)`}
                    icon="💰" 
                    colorTheme="purple" 
                />
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
                title="Booking Details & Commission Breakdown"
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

                        {/* Financial Commission Breakdown */}
                        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 rounded-xl p-4 space-y-2 border border-emerald-100">
                            <div className="flex justify-between items-center text-xs text-surface-600">
                                <span>Gross Booking Amount:</span>
                                <span className="font-semibold">₹{Number(selectedBooking.grossAmount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-amber-700">
                                <span>Platform Commission (10%):</span>
                                <span className="font-semibold">-₹{Number(selectedBooking.commissionAmount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm pt-2 border-t border-emerald-200/60 text-emerald-900 font-extrabold">
                                <span>Net Turf Revenue (Commission Cut Ke):</span>
                                <span className="text-lg text-emerald-700">₹{Number(selectedBooking.amount).toLocaleString()}</span>
                            </div>
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
