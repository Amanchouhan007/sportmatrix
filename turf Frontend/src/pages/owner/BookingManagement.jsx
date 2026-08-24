import { useState, useEffect, useCallback } from 'react'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Card from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import { getBookingSummary, getBookingHistory, updateBookingStatus, cancelBooking } from '../../services/bookingService'
import {
    HiTicket, HiCalendar, HiCurrencyRupee, HiSearch, HiCheckCircle,
    HiBan, HiUser, HiClock, HiDocumentText, HiX
} from 'react-icons/hi'

const STATUS_LABELS = {
    COMPLETED: 'Confirmed',
    PENDING: 'Pending',
    HELD: 'Held',
    FAILED: 'Failed',
    REFUND_PENDING: 'Refund Pending',
    REFUNDED: 'Cancelled'
}
const STATUS_BADGE_VARIANT = {
    Confirmed: 'success',
    Pending: 'warning',
    Held: 'warning',
    Failed: 'danger',
    'Refund Pending': 'warning',
    Cancelled: 'danger'
}

const formatTime = (tStr) => {
    if (!tStr) return ''
    const [h, m] = tStr.split(':')
    const hr = parseInt(h, 10)
    const ampm = hr >= 12 ? 'PM' : 'AM'
    const hr12 = hr % 12 || 12
    return `${String(hr12).padStart(2, '0')}:${m} ${ampm}`
}

export default function BookingManagement() {
    const { addToast } = useToast()
    const [bookings, setBookings] = useState([])
    const [summary, setSummary] = useState({ todayCount: 0, weekCount: 0, monthCount: 0, totalRevenue: 0 })
    const [isLoading, setIsLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [filterDate, setFilterDate] = useState('')

    const [slideOverOpen, setSlideOverOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [detailModal, setDetailModal] = useState(false)
    const [busyId, setBusyId] = useState(null)

    const fetchLiveBookings = useCallback(async () => {
        setIsLoading(true)
        try {
            const [summaryRes, historyRes] = await Promise.all([getBookingSummary(), getBookingHistory()])
            setSummary(summaryRes.data || { todayCount: 0, weekCount: 0, monthCount: 0, totalRevenue: 0 })

            const formatted = (historyRes.data || []).map(r => {
                const startTime = formatTime(r.start_time)
                const endTime = formatTime(r.end_time)
                const status = STATUS_LABELS[r.booking_status] || r.booking_status
                return {
                    id: r.booking_id,
                    customer: r.customer_name || 'Guest',
                    phone: r.mobile_number || '',
                    sport: r.sport_name || 'Turf Match',
                    court: r.court_name || '',
                    date: r.slot_date ? new Date(r.slot_date).toISOString().split('T')[0] : '',
                    time: startTime,
                    slotRange: startTime && endTime ? `${startTime}–${endTime}` : startTime,
                    amount: `₹${Number(r.amount || 0).toLocaleString('en-IN')}`,
                    status,
                    rawStatus: r.booking_status,
                    notes: r.notes || ''
                }
            })
            setBookings(formatted)
        } catch (err) {
            addToast({ title: 'Load Failed', message: err.message || 'Failed to load bookings.', type: 'error' })
            setBookings([])
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

    useEffect(() => { fetchLiveBookings() }, [fetchLiveBookings])

    const handleOpenSlideOver = (booking) => {
        setSelectedBooking(booking)
        setSlideOverOpen(true)
    }

    const handleOpenDetail = (booking) => {
        setSelectedBooking(booking)
        setDetailModal(true)
    }

    const handleApprove = async (id) => {
        setBusyId(id)
        try {
            await updateBookingStatus(id, 'COMPLETED')
            addToast({ title: 'Booking Confirmed', message: `Booking ${id} confirmed.`, type: 'success' })
            await fetchLiveBookings()
            setSlideOverOpen(false)
            setDetailModal(false)
        } catch (err) {
            addToast({ title: 'Update Failed', message: err.message || 'Could not confirm this booking.', type: 'error' })
        } finally {
            setBusyId(null)
        }
    }

    const handleCancel = async (id) => {
        setBusyId(id)
        try {
            await cancelBooking(id)
            addToast({ title: 'Booking Cancelled', message: `Booking ${id} cancelled and refund processed if applicable.`, type: 'success' })
            await fetchLiveBookings()
            setSlideOverOpen(false)
            setDetailModal(false)
        } catch (err) {
            addToast({ title: 'Cancel Failed', message: err.message || 'Could not cancel this booking.', type: 'error' })
        } finally {
            setBusyId(null)
        }
    }

    const filteredBookings = bookings.filter(b => {
        const matchesStatus = filterStatus === 'All' || b.status === filterStatus
        const matchesSearch = b.customer.toLowerCase().includes(searchQuery.toLowerCase()) || String(b.id).toLowerCase().includes(searchQuery.toLowerCase())
        const matchesDate = !filterDate || b.date === filterDate
        return matchesStatus && matchesSearch && matchesDate
    })

    const columns = [
        { key: 'id', label: 'Booking ID' },
        { key: 'customer', label: 'Customer' },
        { key: 'sport', label: 'Sport' },
        { key: 'date', label: 'Date' },
        { key: 'time', label: 'Time' },
        { key: 'amount', label: 'Amount' },
        {
            key: 'status',
            label: 'Status',
            render: v => <Badge variant={STATUS_BADGE_VARIANT[v] || 'default'} dot>{v}</Badge>
        },
        {
            key: 'action',
            label: '',
            render: (_, r) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleOpenDetail(r)} className="cursor-pointer">
                        Details
                    </Button>
                </div>
            )
        },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        Booking Ledger Manager
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Verify online payments, approve pending slots, or cancel bookings</p>
                </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 border border-surface-200/80 shadow-soft bg-white hover:border-emerald-200 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">Today</p>
                            <p className="text-2xl font-extrabold text-surface-900 mt-0.5">{summary.todayCount}</p>
                            <p className="text-[10px] text-surface-500 font-semibold mt-0.5">Bookings</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <HiCalendar className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border border-surface-200/80 shadow-soft bg-white hover:border-emerald-200 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">This Week</p>
                            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{summary.weekCount}</p>
                            <p className="text-[10px] text-surface-500 font-semibold mt-0.5">Bookings</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <HiTicket className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border border-surface-200/80 shadow-soft bg-white hover:border-emerald-200 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">This Month</p>
                            <p className="text-2xl font-extrabold text-surface-900 mt-0.5">{summary.monthCount}</p>
                            <p className="text-[10px] text-surface-500 font-semibold mt-0.5">Bookings</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <HiClock className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border border-surface-200/80 shadow-soft bg-white hover:border-emerald-200 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">Revenue</p>
                            <p className="text-2xl font-extrabold text-surface-900 mt-0.5">₹{Number(summary.totalRevenue).toLocaleString('en-IN')}</p>
                            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Collected</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                            <HiCurrencyRupee className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filtering tabs & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-surface-200/60 shadow-soft">
                <div className="flex gap-1.5 overflow-x-auto shrink-0 pb-1 md:pb-0">
                    {['All', 'Confirmed', 'Pending', 'Cancelled'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilterStatus(tab)}
                            className={`px-4 py-2 text-xs font-black rounded-2xl border transition-all cursor-pointer ${filterStatus === tab ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/10' : 'bg-white border-surface-200 text-surface-650 hover:bg-surface-50'}`}
                        >
                            {tab} Bookings
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-2xl px-3 py-2 w-full md:w-60 shadow-inner">
                        <HiSearch className="w-4 h-4 text-surface-400" />
                        <input
                            placeholder="Search name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent outline-none text-xs text-surface-700 w-full placeholder:text-surface-400 font-semibold"
                        />
                    </div>

                    <CustomDatePicker
                        value={filterDate}
                        onChange={(val) => setFilterDate(val)}
                        placeholder="All Dates"
                        align="right"
                    />

                    {(searchQuery || filterDate || filterStatus !== 'All') && (
                        <button
                            onClick={() => { setSearchQuery(''); setFilterDate(''); setFilterStatus('All'); }}
                            className="text-xs font-bold text-red-500 hover:text-red-650 cursor-pointer"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Bookings Table */}
            <Card className="p-6">
                {isLoading ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">Loading bookings...</div>
                ) : filteredBookings.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">
                        {bookings.length === 0 ? 'No bookings found for your branches.' : 'No bookings match your filters.'}
                    </div>
                ) : (
                    <DataTable columns={columns} data={filteredBookings} />
                )}
            </Card>

            {/* Right-side slide-over drawer */}
            {slideOverOpen && selectedBooking && (
                <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto space-y-6 border-l border-surface-200 animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between border-b border-surface-150 pb-4">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                                    Booking Details
                                </span>
                                <h3 className="text-lg font-black text-surface-900 mt-1">{selectedBooking.id}</h3>
                            </div>
                            <button
                                onClick={() => setSlideOverOpen(false)}
                                className="p-2 rounded-xl hover:bg-surface-100 text-surface-500 cursor-pointer"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                                <HiUser />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-surface-900">{selectedBooking.customer}</h4>
                                <p className="text-xs text-surface-500 font-medium">{selectedBooking.phone || '—'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3.5 bg-white border border-surface-200 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-surface-400 uppercase">Sport Category</span>
                                <p className="font-extrabold text-surface-850 text-sm">{selectedBooking.sport}</p>
                            </div>
                            <div className="p-3.5 bg-white border border-surface-200 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-surface-400 uppercase">Assigned Court</span>
                                <p className="font-extrabold text-surface-850 text-sm">{selectedBooking.court || '—'}</p>
                            </div>
                            <div className="p-3.5 bg-white border border-surface-200 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-surface-400 uppercase">Schedule Date</span>
                                <p className="font-extrabold text-surface-850 text-sm">{selectedBooking.date}</p>
                            </div>
                            <div className="p-3.5 bg-white border border-surface-200 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-surface-400 uppercase">Slot Range</span>
                                <p className="font-extrabold text-surface-850 text-sm">{selectedBooking.slotRange || selectedBooking.time}</p>
                            </div>
                            <div className="p-3.5 bg-white border border-surface-200 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-surface-400 uppercase">Amount Billed</span>
                                <p className="font-extrabold text-emerald-600 text-sm">{selectedBooking.amount}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3.5 bg-surface-50 rounded-xl border border-surface-200 text-xs">
                                <span className="font-bold text-surface-600">Booking Status:</span>
                                <Badge variant={STATUS_BADGE_VARIANT[selectedBooking.status] || 'default'} dot>
                                    {selectedBooking.status}
                                </Badge>
                            </div>
                            {selectedBooking.notes && (
                                <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-amber-900">
                                    <span className="font-bold block text-[10px] uppercase text-amber-600">Notes:</span>
                                    {selectedBooking.notes}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-surface-150 space-y-2.5 mt-auto">
                            {selectedBooking.rawStatus === 'PENDING' && (
                                <Button
                                    onClick={() => handleApprove(selectedBooking.id)}
                                    disabled={busyId === selectedBooking.id}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 cursor-pointer justify-center"
                                >
                                    <HiCheckCircle className="mr-2 w-4 h-4" /> {busyId === selectedBooking.id ? 'Confirming...' : 'Approve Booking'}
                                </Button>
                            )}
                            {!['REFUNDED', 'REFUND_PENDING'].includes(selectedBooking.rawStatus) && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleCancel(selectedBooking.id)}
                                    disabled={busyId === selectedBooking.id}
                                    className="w-full text-red-600 border-red-200 hover:bg-red-50 cursor-pointer justify-center"
                                >
                                    <HiBan className="mr-2 w-4 h-4" /> {busyId === selectedBooking.id ? 'Cancelling...' : 'Cancel Booking'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal (compact) */}
            {selectedBooking && (
                <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title={`Booking Summary : ${selectedBooking.id}`} size="md">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-surface-50 p-4 rounded-2xl border border-surface-200">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg font-black">
                                <HiUser />
                            </div>
                            <div className="text-xs">
                                <h3 className="text-sm font-black text-surface-900 leading-tight">{selectedBooking.customer}</h3>
                                <p className="text-surface-500 font-semibold mt-1">{selectedBooking.phone || '—'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="p-4 bg-white border border-surface-200 rounded-2xl shadow-soft space-y-1">
                                <span className="text-[10px] text-surface-400 font-extrabold uppercase tracking-wider block">Reserved Slot</span>
                                <span className="text-sm font-black text-surface-850 flex items-center gap-1.5">
                                    <HiCalendar className="text-emerald-500" /> {selectedBooking.date}
                                </span>
                                <span className="text-[11px] text-surface-500 font-bold block mt-1">Slot time: {selectedBooking.time}</span>
                            </div>

                            <div className="p-4 bg-white border border-surface-200 rounded-2xl shadow-soft space-y-1">
                                <span className="text-[10px] text-surface-400 font-extrabold uppercase tracking-wider block">Sport Category</span>
                                <span className="text-sm font-black text-surface-850 flex items-center gap-1.5">
                                    <HiTicket className="text-emerald-500" /> {selectedBooking.sport}
                                </span>
                                <span className="text-[11px] text-surface-500 font-bold block mt-1">Amount: {selectedBooking.amount}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 text-xs flex justify-between items-center">
                            <span className="font-bold text-surface-600">Verification Status:</span>
                            <Badge variant={STATUS_BADGE_VARIANT[selectedBooking.status] || 'default'} dot>
                                {selectedBooking.status}
                            </Badge>
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-surface-100">
                            {selectedBooking.rawStatus === 'PENDING' && (
                                <Button onClick={() => handleApprove(selectedBooking.id)} disabled={busyId === selectedBooking.id} className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
                                    <HiCheckCircle className="mr-1.5 w-4 h-4" /> Approve Booking
                                </Button>
                            )}
                            {!['REFUNDED', 'REFUND_PENDING'].includes(selectedBooking.rawStatus) && (
                                <Button onClick={() => handleCancel(selectedBooking.id)} disabled={busyId === selectedBooking.id} variant="outline" className="text-red-550 border-red-200 hover:bg-red-50 cursor-pointer">
                                    <HiBan className="mr-1.5 w-4 h-4" /> Cancel & Refund
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => setDetailModal(false)} className="cursor-pointer">
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
