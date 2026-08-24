import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { getBookingHistory, cancelBooking } from '../../services/bookingService'
import useRealtime from '../../utils/useRealtime'

const STATUS_LABEL = { COMPLETED: 'Confirmed', HELD: 'Pending', REFUNDED: 'Cancelled', FAILED: 'Cancelled' }

export default function CustomerBookings() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { addToast } = useToast()

    const [bookingsList, setBookingsList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [cancelConfirm, setCancelConfirm] = useState({ open: false, id: null })
    const [isCancelling, setIsCancelling] = useState(false)

    const fetchBookings = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await getBookingHistory()
            const mapped = (res.data || []).map(b => ({
                id: b.bookingCode || `BK-${b.booking_id}`,
                rawId: b.booking_id,
                sport: b.sport_name || 'Turf Match',
                venue: b.court_name || 'Venue',
                court: b.court_name || '',
                date: b.slot_date ? b.slot_date.substring(0, 10) : '',
                time: b.start_time || '',
                amount: `₹${Number(b.amount || 0).toLocaleString('en-IN')}`,
                status: STATUS_LABEL[b.status] || b.status
            }))
            setBookingsList(mapped)
        } catch (err) {
            addToast({ title: 'Load Failed', message: err.message || 'Failed to load your bookings.', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

    useEffect(() => { fetchBookings() }, [fetchBookings])
    useRealtime(['booking:new', 'booking:cancelled'], () => fetchBookings())

    const handleCancelClick = (id) => {
        setCancelConfirm({ open: true, id })
    }

    const confirmCancel = async () => {
        const booking = bookingsList.find(b => b.id === cancelConfirm.id)
        setIsCancelling(true)
        try {
            await cancelBooking(booking.rawId)
            addToast({ title: 'Booking Cancelled', message: 'Your booking has been cancelled and refunded if applicable.', type: 'success' })
            fetchBookings()
        } catch (err) {
            addToast({ title: 'Cancellation Failed', message: err.message || 'Could not cancel this booking.', type: 'error' })
        } finally {
            setIsCancelling(false)
            setCancelConfirm({ open: false, id: null })
        }
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
        {
            key: 'id',
            label: 'Booking ID',
            render: v => <span className="font-mono font-black text-slate-900 bg-slate-100 border border-slate-250 px-2 py-0.5 rounded-md text-xs">{v}</span>
        },
        {
            key: 'sport',
            label: 'Sport',
            render: v => <span className="font-extrabold text-slate-900 flex items-center gap-1">{v}</span>
        },
        {
            key: 'venue',
            label: 'Venue & Pitch',
            render: (v, row) => (
                <div>
                    <span className="font-extrabold text-slate-900 block text-xs">{v}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{row.court || 'Main Arena'}</span>
                </div>
            )
        },
        {
            key: 'date',
            label: 'Slot Date',
            render: v => <span className="font-mono font-semibold text-slate-700 text-xs">📅 {v}</span>
        },
        {
            key: 'time',
            label: 'Time Slot',
            render: v => <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">⏰ {v}</span>
        },
        {
            key: 'amount',
            label: 'Total Amount',
            render: v => <span className="font-mono font-black text-emerald-700 text-sm">{v}</span>
        },
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
                <div className="flex items-center gap-1.5">
                    {(row.status === 'Confirmed' || row.status === 'Pending') && (
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleCancelClick(row.id)}>
                            Cancel
                        </Button>
                    )}
                    {(row.status === 'Cancelled') && (
                        <Button size="sm" onClick={() => navigate('/turfs')}>
                            Book Again
                        </Button>
                    )}
                </div>
            )
        }
    ], [navigate])

    const statusTabs = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled']

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">My Bookings</h1>
                    <p className="text-surface-500 text-sm mt-1">View and manage all your venue slot bookings</p>
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

            {isLoading ? (
                <div className="py-10 text-center text-slate-400 text-sm font-semibold">Loading your bookings...</div>
            ) : bookingsList.length === 0 ? (
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

            {/* Cancel Confirmation */}
            <ConfirmDialog
                isOpen={cancelConfirm.open}
                onClose={() => setCancelConfirm({ open: false, id: null })}
                onConfirm={confirmCancel}
                title="Cancel Booking"
                message="Are you sure you want to cancel this booking? This action cannot be undone."
                variant="danger"
                confirmText={isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
            />
        </div>
    )
}
