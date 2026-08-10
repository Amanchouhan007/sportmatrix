import { useState, useEffect, useMemo } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const initialBookings = [
    { id: 'BK-001', sport: 'Cricket', venue: 'SportZone Arena', date: '2026-03-15', time: '10:00 AM', amount: '₹1,200', status: 'Confirmed' },
    { id: 'BK-002', sport: 'Football', venue: 'ProKick Stadium', date: '2026-03-18', time: '04:30 PM', amount: '₹1,400', status: 'Pending' },
    { id: 'BK-003', sport: 'Football', venue: 'GameVault Center', date: '2026-03-12', time: '11:00 AM', amount: '₹1,200', status: 'Completed' },
    { id: 'BK-004', sport: 'Cricket', venue: 'Champion Cricket Ground', date: '2026-03-05', time: '06:00 PM', amount: '₹1,500', status: 'Cancelled' },
]

export default function CustomerBookings() {
    const [bookingsList, setBookingsList] = useState(() => {
        const saved = localStorage.getItem('customer_bookings')
        return saved ? JSON.parse(saved) : initialBookings
    })

    const [filterStatus, setFilterStatus] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [rescheduleModal, setRescheduleModal] = useState({ open: false, booking: null })
    const [cancelConfirm, setCancelConfirm] = useState({ open: false, id: null })
    const [formData, setFormData] = useState({ date: '', time: '' })

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/v1/bookings/history', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                const data = await res.json();
                if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                    const mapped = data.data.map(b => ({
                        id: `BK-${b.booking_id}`,
                        sport: b.sport_name || 'Turf Match',
                        venue: b.court_name || 'GameVault Center',
                        date: b.slot_date ? b.slot_date.substring(0, 10) : '2026-08-09',
                        time: b.start_time ? b.start_time.substring(0, 5) : '06:00 PM',
                        amount: `₹${b.amount || 1200}`,
                        status: b.booking_status === 'CONFIRMED' ? 'Confirmed' : b.booking_status === 'CANCELLED' ? 'Cancelled' : 'Completed'
                    }));
                    
                    const localSaved = JSON.parse(localStorage.getItem('customer_bookings') || '[]');
                    const combined = [...localSaved];
                    mapped.forEach(m => {
                        if (!combined.some(c => c.id === m.id)) {
                            combined.push(m);
                        }
                    });
                    setBookingsList(combined.length > 0 ? combined : mapped);
                }
            } catch (err) {
                console.warn('Error fetching live customer bookings, using stored:', err.message);
            }
        };
        fetchBookings();
    }, []);

    useEffect(() => {
        localStorage.setItem('customer_bookings', JSON.stringify(bookingsList))
    }, [bookingsList])

    const handleCancelClick = (id) => {
        setCancelConfirm({ open: true, id })
    }

    const confirmCancel = () => {
        setBookingsList(prev => prev.map(bk => bk.id === cancelConfirm.id ? { ...bk, status: 'Cancelled' } : bk))
        setCancelConfirm({ open: false, id: null })
    }

    const handleRescheduleClick = (bk) => {
        setRescheduleModal({ open: true, booking: bk })
        setFormData({ date: bk.date, time: bk.time })
    }

    const saveReschedule = () => {
        setBookingsList(prev => prev.map(bk => bk.id === rescheduleModal.booking.id ? { ...bk, date: formData.date, time: formData.time } : bk))
        setRescheduleModal({ open: false, booking: null })
    }

    const handleRebook = (bk) => {
        const newBk = {
            ...bk,
            id: `BK-${String(bookingsList.length + 1).padStart(3, '0')}`,
            status: 'Confirmed',
            date: new Date().toISOString().split('T')[0]
        }
        setBookingsList([newBk, ...bookingsList])
    }

    const filteredBookings = useMemo(() => {
        return bookingsList.filter(b => {
            const matchesStatus = filterStatus === 'All' || b.status.toLowerCase() === filterStatus.toLowerCase();
            const matchesSearch = !searchQuery || 
                b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.sport.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        })
    }, [bookingsList, filterStatus, searchQuery])

    const columns = useMemo(() => [
        { key: 'id', label: 'ID' }, 
        { key: 'sport', label: 'Sport' }, 
        { key: 'venue', label: 'Venue' },
        { key: 'date', label: 'Date' }, 
        { key: 'time', label: 'Time' }, 
        { key: 'amount', label: 'Amount' },
        { 
            key: 'status', 
            label: 'Status', 
            render: v => (
                <Badge variant={v === 'Confirmed' ? 'success' : v === 'Pending' ? 'warning' : v === 'Completed' ? 'primary' : 'danger'} dot>
                    {v}
                </Badge>
            ) 
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    {(row.status === 'Confirmed' || row.status === 'Pending') && (
                        <>
                            <Button size="sm" variant="secondary" onClick={() => handleRescheduleClick(row)}>
                                Reschedule
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleCancelClick(row.id)}>
                                Cancel
                            </Button>
                        </>
                    )}
                    {(row.status === 'Completed' || row.status === 'Cancelled') && (
                        <Button size="sm" onClick={() => handleRebook(row)}>
                            Rebook
                        </Button>
                    )}
                </div>
            )
        }
    ], [])

    const statusTabs = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled']

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">My Bookings</h1>
                    <p className="text-surface-500 text-sm mt-1">View, reschedule, and manage all your venue slot bookings</p>
                </div>

                <Input 
                    placeholder="Search by venue or ID..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64"
                />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-surface-200 pb-2 overflow-x-auto">
                {statusTabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilterStatus(tab)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            filterStatus === tab
                                ? 'bg-[#16A34A] text-white shadow-sm'
                                : 'text-surface-600 hover:bg-surface-100'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <DataTable columns={columns} data={filteredBookings} />

            {/* Reschedule Modal */}
            <Modal 
                isOpen={rescheduleModal.open} 
                onClose={() => setRescheduleModal({ open: false, booking: null })} 
                title="Reschedule Booking"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="New Date" 
                            type="date" 
                            value={formData.date} 
                            onChange={e => setFormData({ ...formData, date: e.target.value })} 
                        />
                        <Input 
                            label="New Time" 
                            type="time" 
                            value={formData.time} 
                            onChange={e => setFormData({ ...formData, time: e.target.value })} 
                        />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <Button variant="secondary" onClick={() => setRescheduleModal({ open: false, booking: null })}>Cancel</Button>
                        <Button onClick={saveReschedule}>Confirm Reschedule</Button>
                    </div>
                </div>
            </Modal>

            {/* Cancel Confirmation */}
            <ConfirmDialog 
                isOpen={cancelConfirm.open}
                onClose={() => setCancelConfirm({ open: false, id: null })}
                onConfirm={confirmCancel}
                title="Cancel Booking"
                message="Are you sure you want to cancel this booking? This action cannot be undone."
                variant="danger"
                confirmText="Yes, Cancel"
            />
        </div>
    )
}
