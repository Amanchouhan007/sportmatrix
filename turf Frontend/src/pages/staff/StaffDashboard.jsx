import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
                        const rawDate = b.slotDate || b.slot_date || b.date || b.bookedOn || b.createdAt || b.created_at;
                        const bDateStr = rawDate ? String(rawDate).split('T')[0] : new Date().toISOString().split('T')[0];

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
                            date: bDateStr
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

    // Dynamically filter bookings by selected date (or show all if filter cleared)
    const displayedBookings = selectedDate
        ? bookings.filter(b => b.date === selectedDate)
        : bookings;

    // Calculate dynamic stats for the selected date / filter
    const stats = {
        total: displayedBookings.length,
        checkIns: displayedBookings.filter(b => b.status === 'Checked In').length,
        pending: displayedBookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed').length,
        revenue: displayedBookings
            .filter(b => b.status === 'Checked In' || b.status === 'Confirmed' || b.status === 'Completed')
            .reduce((sum, b) => sum + Number(b.amount), 0),
        grossTotal: displayedBookings
            .filter(b => b.status === 'Checked In' || b.status === 'Confirmed' || b.status === 'Completed')
            .reduce((sum, b) => sum + Number(b.grossAmount), 0),
        commissionTotal: displayedBookings
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
                <div className="flex items-center gap-2">
                    {selectedDate && (
                        <button
                            type="button"
                            onClick={() => setSelectedDate('')}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                            title="Clear date filter to view all bookings"
                        >
                            📋 Show All Dates
                        </button>
                    )}
                    <div className="w-full sm:w-56">
                        <CustomDatePicker
                            label="Shift / Duty Date"
                            value={selectedDate}
                            onChange={(val) => setSelectedDate(val)}
                            placeholder="Select Date"
                            align="right"
                        />
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label={selectedDate ? "Shift Bookings" : "All Bookings"} value={stats.total} icon="📅" colorTheme="blue" />
                <StatCard label="Check-ins Done" value={stats.checkIns} icon="✅" colorTheme="emerald" />
                <StatCard label="Pending/Upcoming" value={stats.pending} icon="⏳" colorTheme="amber" />
                <StatCard 
                    label={selectedDate ? "Shift Net Revenue" : "Total Net Revenue"}
                    value={`₹${stats.revenue.toLocaleString()}`} 
                    change={`Gross: ₹${stats.grossTotal.toLocaleString()} (-10% Comm)`}
                    icon="💰" 
                    colorTheme="purple" 
                />
            </div>
            
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                        Shift Schedule {selectedDate ? `(${selectedDate})` : '(All Dates)'}
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {displayedBookings.length} Bookings
                        </span>
                    </h2>
                    <Link to="/staff/bookings">
                        <Button size="sm" variant="outline" className="text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                            📋 View Master Bookings Ledger ➔
                        </Button>
                    </Link>
                </div>
                <DataTable columns={columns} data={displayedBookings} />
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
