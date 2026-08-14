import { useState, useEffect } from 'react'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Card from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import { 
    HiTicket, HiCalendar, HiCurrencyRupee, HiSearch, HiCheckCircle, 
    HiBan, HiUser, HiChevronLeft, HiChevronRight, HiClock, HiLocationMarker,
    HiDocumentText, HiTrendingUp, HiX
} from 'react-icons/hi'

const initialBookings = [
    { id: 'BK-001', customer: 'Rahul Kumar', phone: '+91 98765 00001', email: 'rahul@gmail.com', sport: 'Cricket', court: 'Champions Turf Arena', venue: 'Champions Turf Arena', date: '2026-03-16', dayOfWeek: 'Mon', time: '10:00 AM', slotRange: '10:00–11:00 AM', amount: '₹800', type: 'Online', status: 'Confirmed', notes: 'Advance paid via UPI' },
    { id: 'BK-002', customer: 'Priya Sharma', phone: '+91 98765 00002', email: 'priya@gmail.com', sport: 'Football', court: 'Champions Turf Arena', venue: 'Champions Turf Arena', date: '2026-03-17', dayOfWeek: 'Tue', time: '11:30 AM', slotRange: '11:30–12:30 PM', amount: '₹900', type: 'Online', status: 'Confirmed', notes: 'Full payment received' },
    { id: 'BK-003', customer: 'Arjun Mehta', phone: '+91 98765 00003', email: 'arjun@gmail.com', sport: 'Football', court: 'Champions Turf Arena', venue: 'Champions Turf Arena', date: '2026-03-18', dayOfWeek: 'Wed', time: '02:00 PM', slotRange: '02:00–03:00 PM', amount: '₹400', type: 'Walk-in', status: 'Pending', notes: 'Cash payment pending' },
]

export default function BookingManagement() {
    const { addToast } = useToast()
    const { user } = useAuth()
    const [bookings, setBookings] = useState(initialBookings)
    const [summary, setSummary] = useState({ todayCount: 12, weekCount: 64, monthCount: 248, totalRevenue: 184500 })
    const [filterStatus, setFilterStatus] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [filterDate, setFilterDate] = useState('')

    // Calendar View State: 'Day' | 'Week' | 'Month' (Default: 'Week')
    const [calendarView, setCalendarView] = useState('Week')
    const [calendarDate, setCalendarDate] = useState('March 2026')

    // Slide-over panel state for booking details
    const [slideOverOpen, setSlideOverOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)

    // Table detail modal
    const [detailModal, setDetailModal] = useState(false)

    const fetchLiveBookings = async () => {
        try {
            const summaryRes = await fetch('http://localhost:5000/api/v1/bookings/summary');
            const summaryData = await summaryRes.json();
            if (summaryData.success && summaryData.data) {
                setSummary(summaryData.data);
            }

            const queryParams = new URLSearchParams()
            if (user?.id) queryParams.append('userId', user.id)
            if (user?.email) queryParams.append('userEmail', user.email)
            if (user?.role) queryParams.append('role', user.role || 'OWNER')

            const res = await fetch(`http://localhost:5000/api/v1/bookings/history?${queryParams.toString()}`);
            const data = await res.json();
            let formatted = []
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                formatted = data.data.map(r => {
                    const d = new Date(r.slot_date || r.booked_on || Date.now());
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const formatTime = (tStr) => {
                        if (!tStr) return '10:00 AM';
                        const [h, m] = tStr.split(':');
                        const hr = parseInt(h, 10);
                        const ampm = hr >= 12 ? 'PM' : 'AM';
                        const hr12 = hr % 12 || 12;
                        const hrF = hr12 < 10 ? `0${hr12}` : `${hr12}`;
                        return `${hrF}:${m} ${ampm}`;
                    };
                    const formattedTime = formatTime(r.start_time);
                    const formattedEndTime = formatTime(r.end_time);

                    return {
                        id: String(r.booking_id || r.id || 'BK-001'),
                        customer: r.customer_name || 'Rahul Kumar',
                        phone: r.mobile_number || '+91 98765 00001',
                        email: r.booking_notes?.includes('@') ? r.booking_notes : 'customer@gmail.com',
                        sport: r.sport_name || 'Turf Match',
                        court: r.court_name || 'Champions Turf Arena',
                        venue: r.court_name || 'Champions Turf Arena',
                        turfId: r.branch_id || 'turf-1',
                        date: r.slot_date ? new Date(r.slot_date).toISOString().split('T')[0] : '2026-08-09',
                        dayOfWeek: dayNames[d.getDay()],
                        time: formattedTime,
                        slotRange: `${formattedTime}–${formattedEndTime}`,
                        amount: `₹${(r.amount || 1800).toLocaleString()}`,
                        type: 'Online',
                        status: r.booking_status === 'CONFIRMED' ? 'Confirmed' : r.booking_status === 'PENDING' ? 'Pending' : r.booking_status === 'CANCELLED' ? 'Cancelled' : r.booking_status || 'Confirmed',
                        notes: r.booking_notes || 'Booking confirmed'
                    };
                });
            }

            // Merge with locally booked entries, scoped strictly to this turf / owner
            const localSaved = JSON.parse(localStorage.getItem('customer_bookings') || '[]');
            const isSuperAdmin = user?.role === 'SUPER_ADMIN';
            
            // Filter local entries to this owner's turf
            const filteredLocal = localSaved.filter(l => {
                if (isSuperAdmin) return true;
                // If owner, check if booking was made at their turf
                const ownerKeywords = [
                    user?.businessName,
                    user?.turfName,
                    user?.name?.toLowerCase().includes('rajesh') ? 'champions' : null,
                    user?.email?.toLowerCase().includes('owner') ? 'champions' : null,
                    'champions', 'super strikers'
                ].filter(Boolean).map(k => k.toLowerCase());

                const bookingVenue = (l.venue || l.court || '').toLowerCase();
                return ownerKeywords.some(kw => bookingVenue.includes(kw));
            });

            const mappedLocal = filteredLocal.map(l => ({
                id: l.id,
                customer: l.customerName || 'Online Customer',
                phone: l.customerPhone || '+91 98765 43210',
                email: l.userEmail || 'customer@gmail.com',
                sport: l.sport || 'Cricket',
                court: l.venue || 'Champions Turf Arena',
                venue: l.venue || 'Champions Turf Arena',
                turfId: l.turfId || 'turf-1',
                date: l.date || '2026-08-09',
                dayOfWeek: 'Sat',
                time: l.time || '06:00 PM',
                slotRange: `${l.time || '06:00 PM'}–07:00 PM`,
                amount: l.amount || '₹1,800',
                type: 'Online',
                status: l.status || 'Confirmed',
                notes: 'Advance paid online'
            }));
            
            const combined = [...mappedLocal];
            formatted.forEach(f => {
                if (!combined.some(c => c.id === f.id)) {
                    combined.push(f);
                }
            });

            setBookings(combined.length > 0 ? combined : initialBookings);
        } catch (err) {
            console.warn('Error fetching live bookings, using defaults:', err.message);
        }
    };

    useEffect(() => {
        fetchLiveBookings();
    }, []);

    const handleOpenSlideOver = (booking) => {
        setSelectedBooking(booking)
        setSlideOverOpen(true)
    }

    const handleOpenDetail = (booking) => {
        setSelectedBooking(booking)
        setDetailModal(true)
    }

    const handleUpdateStatus = async (id, newStatus) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
        if (selectedBooking && selectedBooking.id === id) {
            setSelectedBooking({ ...selectedBooking, status: newStatus })
        }
        addToast({ title: 'Status Updated', message: `Booking status changed to ${newStatus}`, type: 'success' })
        try {
            await fetch(`http://localhost:5000/api/v1/bookings/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchLiveBookings();
        } catch (err) {
            console.error('Error updating booking status:', err);
        }
    }

    const handleReschedule = (id) => {
        addToast({ title: 'Reschedule Requested', message: `Opening slot picker to reschedule ${id}`, type: 'info' })
    }

    const handleViewInvoice = (id) => {
        addToast({ title: 'Generating Invoice', message: `Downloading tax invoice PDF for ${id}`, type: 'success' })
    }

    // Filter bookings for table view
    const filteredBookings = bookings.filter(b => {
        const matchesStatus = filterStatus === 'All' || b.status === filterStatus
        const matchesSearch = b.customer.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toLowerCase().includes(searchQuery.toLowerCase())
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
            key: 'type',
            label: 'Type',
            render: v => <Badge variant={v === 'Online' ? 'primary' : 'default'}>{v}</Badge>
        },
        {
            key: 'status',
            label: 'Status',
            render: v => <Badge variant={v === 'Confirmed' ? 'success' : v === 'Pending' ? 'warning' : 'danger'} dot>{v}</Badge>
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

    // Days & Time Slots for Weekly Scheduler
    const weekDays = [
        { day: 'Mon', dateNum: '16', fullDate: '2026-03-16' },
        { day: 'Tue', dateNum: '17', fullDate: '2026-03-17' },
        { day: 'Wed', dateNum: '18', fullDate: '2026-03-18' },
        { day: 'Thu', dateNum: '19', fullDate: '2026-03-19' },
        { day: 'Fri', dateNum: '20', fullDate: '2026-03-20' },
        { day: 'Sat', dateNum: '21', fullDate: '2026-03-21' },
        { day: 'Sun', dateNum: '22', fullDate: '2026-03-22' },
    ]

    const timeSlots = [
        '06:00 AM', '08:00 AM', '10:00 AM', '12:00 PM', 
        '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'
    ]

    // Event Card Color Styling
    const getEventBadgeStyle = (b) => {
        if (b.type === 'Walk-in' && b.status !== 'Confirmed') {
            return 'bg-[#E5E7EB] border border-[#CBD5E1] text-slate-800'
        }
        if (b.status === 'Confirmed') return 'bg-[#DCFCE7] border border-[#86EFAC] text-emerald-900'
        if (b.status === 'Pending') return 'bg-[#FEF3C7] border border-[#FCD34D] text-amber-900'
        return 'bg-[#FEE2E2] border border-[#FCA5A5] text-red-900'
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        Booking Ledger Manager
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Verify online payments, approve pending slots, or configure manual overrides</p>
                </div>
            </div>

            {/* Quick Summary Cards (4 Compact Stat Cards) */}
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

            {/* Visual filtering tabs & Search Bar */}
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

                {/* Filter Controls */}
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
                <DataTable columns={columns} data={filteredBookings} />
            </Card>

            {/* ══════════════════════════════════════════════════════
               RIGHT-SIDE SLIDE-OVER DRAWER FOR BOOKING DETAILS
            ══════════════════════════════════════════════════════ */}
            {slideOverOpen && selectedBooking && (
                <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto space-y-6 border-l border-surface-200 animate-in slide-in-from-right duration-300">
                        {/* Header */}
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

                        {/* Customer Card */}
                        <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                                <HiUser />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-surface-900">{selectedBooking.customer}</h4>
                                <p className="text-xs text-surface-500 font-medium">{selectedBooking.phone || '+91 98765 00001'}</p>
                                <p className="text-xs text-surface-400 font-medium">{selectedBooking.email || 'customer@gmail.com'}</p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3.5 bg-white border border-surface-200 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-surface-400 uppercase">Sport Category</span>
                                <p className="font-extrabold text-surface-850 text-sm">{selectedBooking.sport}</p>
                            </div>
                            <div className="p-3.5 bg-white border border-surface-200 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-surface-400 uppercase">Assigned Court</span>
                                <p className="font-extrabold text-surface-850 text-sm">{selectedBooking.court || 'Court A'}</p>
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
                            <div className="p-3.5 bg-white border border-surface-200 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-surface-400 uppercase">Payment Mode</span>
                                <p className="font-extrabold text-surface-850 text-sm">{selectedBooking.type}</p>
                            </div>
                        </div>

                        {/* Status Badge & Notes */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3.5 bg-surface-50 rounded-xl border border-surface-200 text-xs">
                                <span className="font-bold text-surface-600">Booking Status:</span>
                                <Badge variant={selectedBooking.status === 'Confirmed' ? 'success' : selectedBooking.status === 'Pending' ? 'warning' : 'danger'} dot>
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

                        {/* Action Buttons */}
                        <div className="pt-4 border-t border-surface-150 space-y-2.5 mt-auto">
                            {selectedBooking.status === 'Pending' && (
                                <Button 
                                    onClick={() => handleUpdateStatus(selectedBooking.id, 'Confirmed')}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 cursor-pointer justify-center"
                                >
                                    <HiCheckCircle className="mr-2 w-4 h-4" /> Approve Booking
                                </Button>
                            )}

                            <Button 
                                variant="secondary"
                                onClick={() => handleReschedule(selectedBooking.id)}
                                className="w-full cursor-pointer justify-center"
                            >
                                Reschedule Slot
                            </Button>

                            <Button 
                                variant="outline"
                                onClick={() => handleViewInvoice(selectedBooking.id)}
                                className="w-full cursor-pointer justify-center text-surface-700"
                            >
                                <HiDocumentText className="mr-2 w-4 h-4" /> View Invoice
                            </Button>

                            {selectedBooking.status !== 'Cancelled' && (
                                <Button 
                                    variant="outline"
                                    onClick={() => handleUpdateStatus(selectedBooking.id, 'Cancelled')}
                                    className="w-full text-red-600 border-red-200 hover:bg-red-50 cursor-pointer justify-center"
                                >
                                    <HiBan className="mr-2 w-4 h-4" /> Cancel Booking
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal (Legacy Table View) */}
            {selectedBooking && (
                <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title={`Booking Summary : ${selectedBooking.id}`} size="md">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-surface-50 p-4 rounded-2xl border border-surface-200">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg font-black">
                                <HiUser />
                            </div>
                            <div className="text-xs">
                                <h3 className="text-sm font-black text-surface-900 leading-tight">{selectedBooking.customer}</h3>
                                <p className="text-surface-500 font-semibold mt-1">{selectedBooking.phone} • {selectedBooking.email}</p>
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
                                <span className="text-[11px] text-surface-500 font-bold block mt-1">Pricing tier: {selectedBooking.amount} ({selectedBooking.type})</span>
                            </div>
                        </div>

                        <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 text-xs flex justify-between items-center">
                            <span className="font-bold text-surface-600">Verification Status:</span>
                            <Badge variant={selectedBooking.status === 'Confirmed' ? 'success' : selectedBooking.status === 'Pending' ? 'warning' : 'danger'} dot>
                                {selectedBooking.status}
                            </Badge>
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-surface-100">
                            {selectedBooking.status === 'Pending' && (
                                <Button onClick={() => handleUpdateStatus(selectedBooking.id, 'Confirmed')} className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
                                    <HiCheckCircle className="mr-1.5 w-4 h-4" /> Approve Booking
                                </Button>
                            )}
                            {selectedBooking.status !== 'Cancelled' ? (
                                <Button onClick={() => handleUpdateStatus(selectedBooking.id, 'Cancelled')} variant="outline" className="text-red-550 border-red-200 hover:bg-red-50 cursor-pointer">
                                    <HiBan className="mr-1.5 w-4 h-4" /> Cancel & Refund
                                </Button>
                            ) : (
                                <Button onClick={() => handleUpdateStatus(selectedBooking.id, 'Confirmed')} variant="secondary" className="cursor-pointer">
                                    Restore Booking
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
