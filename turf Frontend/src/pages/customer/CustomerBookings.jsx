import { useState, useEffect, useMemo } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const initialBookings = [
    { id: 'BK-001', sport: 'Cricket', venue: 'SportZone Arena', date: '2026-03-15', time: '10:00 AM', amount: '₹800', status: 'Confirmed' },
    { id: 'BK-002', sport: 'Football', venue: 'ProKick Stadium', date: '2026-03-18', time: '04:30 PM', amount: '₹900', status: 'Pending' },
    { id: 'BK-003', sport: 'Football', venue: 'SmashCourt', date: '2026-03-12', time: '11:00 AM', amount: '₹400', status: 'Completed' },
    { id: 'BK-004', sport: 'Cricket', venue: 'SportZone Arena', date: '2026-03-05', time: '06:00 PM', amount: '₹1,200', status: 'Cancelled' },
]

export default function CustomerBookings() {
    const [bookingsList, setBookingsList] = useState(() => {
        const saved = localStorage.getItem('customer_bookings')
        return saved ? JSON.parse(saved) : initialBookings
    })

    const [rescheduleModal, setRescheduleModal] = useState({ open: false, booking: null })
    const [cancelConfirm, setCancelConfirm] = useState({ open: false, id: null })
    const [formData, setFormData] = useState({ date: '', time: '' })

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
            date: new Date().toISOString().split('T')[0] // Default to today
        }
        setBookingsList([newBk, ...bookingsList])
    }

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
    ], [bookingsList])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">My Bookings</h1>
                <p className="text-surface-500 text-sm mt-1">View and manage your bookings</p>
            </div>
            
            <DataTable columns={columns} data={bookingsList} />

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
