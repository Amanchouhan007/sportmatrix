import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'

export default function CustomerBookings() {
    const { user } = useAuth()
    const navigate = useNavigate()

    // Helper: Filter bookings strictly belonging to the currently logged in customer
    const getMyBookingsFromStorage = () => {
        try {
            const raw = localStorage.getItem('customer_bookings')
            if (!raw) return []
            const parsed = JSON.parse(raw)
            if (!Array.isArray(parsed)) return []
            
            const currentEmail = (user?.email || '').toLowerCase()
            const currentUserId = user?.id || ''
            const currentPhone = user?.phone || user?.mobile || ''

            return parsed.filter(b => {
                const bEmail = (b.userEmail || '').toLowerCase()
                const bUserId = b.userId || ''
                const bPhone = b.customerPhone || b.phone || ''

                // Check exact email match
                if (currentEmail && bEmail && bEmail === currentEmail) return true
                // Check exact user ID match
                if (currentUserId && bUserId && bUserId === currentUserId) return true
                // Check phone match
                if (currentPhone && bPhone && bPhone === currentPhone) return true
                // If the booking has no user attached and current user is default demo customer
                if (!bEmail && !bUserId && currentEmail === 'customer@gmail.com') return true

                return false
            })
        } catch (e) {
            return []
        }
    }

    const [bookingsList, setBookingsList] = useState(getMyBookingsFromStorage)
    const [filterStatus, setFilterStatus] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [rescheduleModal, setRescheduleModal] = useState({ open: false, booking: null })
    const [cancelConfirm, setCancelConfirm] = useState({ open: false, id: null })
    const [formData, setFormData] = useState({ date: '', time: '' })

    // Reload when user switches/logs in
    useEffect(() => {
        setBookingsList(getMyBookingsFromStorage())
    }, [user?.email, user?.id])

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token')
                const queryParams = new URLSearchParams()
                if (user?.id) queryParams.append('userId', user.id)
                if (user?.email) queryParams.append('userEmail', user.email)
                if (user?.role) queryParams.append('role', user.role)

                const res = await fetch(`http://localhost:5000/api/v1/bookings/history?${queryParams.toString()}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                })
                const data = await res.json()
                if (data.success && Array.isArray(data.data)) {
                    const mapped = data.data.map(b => ({
                        id: `BK-${b.booking_id}`,
                        sport: b.sport_name || 'Turf Match',
                        venue: b.court_name || 'GameVault Center',
                        date: b.slot_date ? b.slot_date.substring(0, 10) : '2026-08-09',
                        time: b.start_time ? b.start_time.substring(0, 5) : '06:00 PM',
                        amount: `₹${b.amount || 1200}`,
                        status: b.booking_status === 'CONFIRMED' ? 'Confirmed' : b.booking_status === 'CANCELLED' ? 'Cancelled' : 'Completed',
                        userEmail: b.booking_notes?.includes('@') ? b.booking_notes : user?.email,
                        userId: b.user_id || user?.id
                    }))
                    
                    const localSaved = getMyBookingsFromStorage()
                    const combined = [...localSaved]
                    mapped.forEach(m => {
                        if (!combined.some(c => c.id === m.id)) {
                            combined.push(m)
                        }
                    })
                    setBookingsList(combined)
                }
            } catch (err) {
                console.warn('Error fetching live customer bookings, using storage:', err.message)
            }
        }
        fetchBookings()
    }, [user?.email, user?.id])

    const updateStorageForBooking = (updatedBooking) => {
        try {
            const allSaved = JSON.parse(localStorage.getItem('customer_bookings') || '[]')
            const updatedAll = allSaved.map(item => item.id === updatedBooking.id ? { ...item, ...updatedBooking } : item)
            localStorage.setItem('customer_bookings', JSON.stringify(updatedAll))
        } catch (e) {}
    }

    const handleCancelClick = (id) => {
        setCancelConfirm({ open: true, id })
    }

    const confirmCancel = () => {
        setBookingsList(prev => prev.map(bk => {
            if (bk.id === cancelConfirm.id) {
                const updated = { ...bk, status: 'Cancelled' }
                updateStorageForBooking(updated)
                return updated
            }
            return bk
        }))
        setCancelConfirm({ open: false, id: null })
    }

    const handleRescheduleClick = (bk) => {
        setRescheduleModal({ open: true, booking: bk })
        setFormData({ date: bk.date, time: bk.time })
    }

    const saveReschedule = () => {
        setBookingsList(prev => prev.map(bk => {
            if (bk.id === rescheduleModal.booking.id) {
                const updated = { ...bk, date: formData.date, time: formData.time }
                updateStorageForBooking(updated)
                return updated
            }
            return bk
        }))
        setRescheduleModal({ open: false, booking: null })
    }

    const handleRebook = (bk) => {
        const newBk = {
            ...bk,
            id: `BK-${String(Date.now()).slice(-4)}`,
            status: 'Confirmed',
            date: new Date().toISOString().split('T')[0],
            userId: user?.id,
            userEmail: user?.email
        }
        const allSaved = JSON.parse(localStorage.getItem('customer_bookings') || '[]')
        localStorage.setItem('customer_bookings', JSON.stringify([newBk, ...allSaved]))
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
        { 
            key: 'paymentMode', 
            label: 'Payment Mode',
            render: (_, row) => {
                const mode = (row.paymentMode || 'FULL').toUpperCase()
                if (mode.includes('DARE')) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#B8F52A] text-[#121614] border border-[#B8F52A]">🔥 DARE MATCH</span>
                if (mode.includes('SPLIT_50') || mode.includes('SPLIT_50_50')) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-900 border border-sky-300">⚖️ 50-50 SPLIT</span>
                if (mode.includes('CUSTOM')) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-300">🎴 CUSTOM SPLIT</span>
                if (mode.includes('PER_PLAYER')) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">👥 PER PLAYER</span>
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">💳 FULL PAID</span>
            }
        },
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

            {bookingsList.length === 0 ? (
                <div className="bg-surface-50 border border-surface-200 rounded-3xl p-10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center text-3xl mx-auto">
                        🏟️
                    </div>
                    <div className="max-w-md mx-auto">
                        <h3 className="text-lg font-bold text-surface-900">No Bookings Yet</h3>
                        <p className="text-surface-500 text-xs mt-1">
                            You haven't made any turf reservations yet. Book your favorite sport slot now and challenge your friends!
                        </p>
                    </div>
                    <Button onClick={() => navigate('/turfs')} className="bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md">
                        Explore Turfs & Book Slot →
                    </Button>
                </div>
            ) : (
                <DataTable columns={columns} data={filteredBookings} />
            )}

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
