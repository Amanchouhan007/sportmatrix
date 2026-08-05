import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Card from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import { 
    HiTicket, HiCalendar, HiCurrencyRupee, HiSearch, HiCheckCircle, 
    HiBan, HiUser, HiChevronLeft, HiChevronRight, HiClock, HiLocationMarker,
    HiDocumentText, HiTrendingUp, HiX
} from 'react-icons/hi'

const initialBookings = [
    { id: 'BK-001', customer: 'Rahul Kumar', phone: '+91 98765 00001', email: 'rahul@gmail.com', sport: 'Cricket', court: 'Court A', date: '2026-03-16', dayOfWeek: 'Mon', time: '10:00 AM', slotRange: '10:00–11:00 AM', amount: '₹800', type: 'Online', status: 'Confirmed', notes: 'Advance paid via UPI' },
    { id: 'BK-002', customer: 'Priya Sharma', phone: '+91 98765 00002', email: 'priya@gmail.com', sport: 'Football', court: 'Turf 2', date: '2026-03-17', dayOfWeek: 'Tue', time: '11:30 AM', slotRange: '11:30–12:30 PM', amount: '₹900', type: 'Online', status: 'Confirmed', notes: 'Full payment received' },
    { id: 'BK-003', customer: 'Arjun Mehta', phone: '+91 98765 00003', email: 'arjun@gmail.com', sport: 'Football', court: 'Court 1', date: '2026-03-18', dayOfWeek: 'Wed', time: '02:00 PM', slotRange: '02:00–03:00 PM', amount: '₹400', type: 'Walk-in', status: 'Pending', notes: 'Cash payment pending' },
    { id: 'BK-004', customer: 'Sneha Reddy', phone: '+91 98765 00004', email: 'sneha@gmail.com', sport: 'Cricket', court: 'Court B', date: '2026-03-19', dayOfWeek: 'Thu', time: '04:30 PM', slotRange: '04:30–05:30 PM', amount: '₹1,200', type: 'Online', status: 'Cancelled', notes: 'Requested refund' },
    { id: 'BK-005', customer: 'Vikram Singh', phone: '+91 98765 00005', email: 'vikram@gmail.com', sport: 'Cricket', court: 'Court 3', date: '2026-03-20', dayOfWeek: 'Fri', time: '06:00 PM', slotRange: '06:00–07:00 PM', amount: '₹700', type: 'Walk-in', status: 'Confirmed', notes: 'Walk-in guest' },
    { id: 'BK-006', customer: 'Amit Verma', phone: '+91 98111 22334', email: 'amit@gmail.com', sport: 'Football', court: 'Turf 1', date: '2026-03-21', dayOfWeek: 'Sat', time: '08:00 AM', slotRange: '08:00–09:00 AM', amount: '₹1,500', type: 'Online', status: 'Confirmed', notes: 'Weekend league match' },
    { id: 'BK-007', customer: 'Rohan Shah', phone: '+91 99223 34455', email: 'rohan@gmail.com', sport: 'Cricket', court: 'Court A', date: '2026-03-22', dayOfWeek: 'Sun', time: '06:00 PM', slotRange: '06:00–07:00 PM', amount: '₹1,100', type: 'Online', status: 'Confirmed', notes: 'Evening prime slot' }
]

export default function BookingManagement() {
    const { addToast } = useToast()
    const [bookings, setBookings] = useState(initialBookings)
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

    const handleOpenSlideOver = (booking) => {
        setSelectedBooking(booking)
        setSlideOverOpen(true)
    }

    const handleOpenDetail = (booking) => {
        setSelectedBooking(booking)
        setDetailModal(true)
    }

    const handleUpdateStatus = (id, newStatus) => {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b))
        if (selectedBooking && selectedBooking.id === id) {
            setSelectedBooking({ ...selectedBooking, status: newStatus })
        }
        addToast({ title: 'Status Updated', message: `Booking status changed to ${newStatus}`, type: 'success' })
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

                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="px-3 py-2 bg-surface-50 border border-surface-200 rounded-2xl text-xs font-semibold outline-none focus:border-emerald-500 shadow-soft"
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

            {/* ══════════════════════════════════════════════════════
               NEW FEATURE: BOOKING CALENDAR MODULE
            ══════════════════════════════════════════════════════ */}

            {/* Quick Summary Cards (4 Compact Stat Cards) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 border border-surface-200/80 shadow-soft bg-white hover:border-emerald-200 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">Today</p>
                            <p className="text-2xl font-extrabold text-surface-900 mt-0.5">12</p>
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
                            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">64</p>
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
                            <p className="text-2xl font-extrabold text-surface-900 mt-0.5">248</p>
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
                            <p className="text-2xl font-extrabold text-surface-900 mt-0.5">₹1,84,500</p>
                            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Collected</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                            <HiCurrencyRupee className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Calendar Header & Views Container Card */}
            <Card className="p-6 rounded-[24px] border border-surface-200/80 shadow-soft bg-white space-y-6">
                {/* Header Controls Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-150 pb-5">
                    {/* Left Side Info */}
                    <div>
                        <h2 className="text-xl font-bold text-surface-900 tracking-tight flex items-center gap-2">
                            Booking Calendar
                        </h2>
                        <p className="text-xs text-surface-500 font-medium mt-1">
                            Visualize slot occupancy, payments, and booking activity across daily, weekly, and monthly schedules.
                        </p>
                    </div>

                    {/* Right Side Navigation & View Switcher */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button 
                            onClick={() => addToast({ title: 'Calendar Sync', message: 'Navigated to current date', type: 'info' })}
                            className="px-3.5 py-1.5 text-xs font-bold bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl transition-colors cursor-pointer"
                        >
                            Today
                        </button>
                        
                        <div className="flex items-center bg-surface-100 p-1 rounded-xl">
                            <button 
                                onClick={() => addToast({ title: 'Previous Range', message: 'Loaded previous schedule', type: 'info' })}
                                className="p-1 text-surface-600 hover:text-surface-900 cursor-pointer"
                            >
                                <HiChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-bold text-surface-800 px-2 min-w-[90px] text-center">{calendarDate}</span>
                            <button 
                                onClick={() => addToast({ title: 'Next Range', message: 'Loaded next schedule', type: 'info' })}
                                className="p-1 text-surface-600 hover:text-surface-900 cursor-pointer"
                            >
                                <HiChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* View Switcher Segmented Pills */}
                        <div className="flex bg-surface-100 p-1 rounded-xl border border-surface-200/60">
                            {['Day', 'Week', 'Month'].map(view => (
                                <button
                                    key={view}
                                    onClick={() => setCalendarView(view)}
                                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                        calendarView === view 
                                            ? 'bg-[#10B981] text-white shadow-sm font-bold' 
                                            : 'bg-white text-[#374151] border border-gray-300 hover:bg-surface-50'
                                    }`}
                                >
                                    {view}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── WEEKLY CALENDAR VIEW ── */}
                {calendarView === 'Week' && (
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Grid Header Days Row */}
                            <div className="grid grid-cols-8 border-b border-surface-200 pb-3 text-center text-xs font-bold text-surface-500">
                                <div className="text-left pl-3 text-surface-400 uppercase tracking-wider">Time</div>
                                {weekDays.map(d => (
                                    <div key={d.day} className={`p-2 rounded-xl ${d.day === 'Mon' ? 'bg-emerald-50 text-emerald-700 font-extrabold' : ''}`}>
                                        <div>{d.day}</div>
                                        <div className="text-sm font-black text-surface-900 mt-0.5">{d.dateNum}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Scheduler Time Slots Grid */}
                            <div className="divide-y divide-surface-100">
                                {timeSlots.map(time => (
                                    <div key={time} className="grid grid-cols-8 min-h-[75px] items-stretch">
                                        <div className="py-3 text-[11px] font-bold text-surface-400 pr-2 flex items-start pt-3">
                                            {time}
                                        </div>

                                        {weekDays.map(d => {
                                            const matches = bookings.filter(b => b.time === time && (b.dayOfWeek === d.day || b.date === d.fullDate))
                                            return (
                                                <div key={d.day} className="p-1 border-l border-surface-100/80 min-h-[75px] relative hover:bg-surface-50/50 transition-colors">
                                                    {matches.map(b => (
                                                        <div
                                                            key={b.id}
                                                            onClick={() => handleOpenSlideOver(b)}
                                                            className={`p-2 rounded-xl text-[10px] font-semibold cursor-pointer shadow-soft transition-all hover:scale-[1.02] mb-1 ${getEventBadgeStyle(b)}`}
                                                        >
                                                            <div className="font-extrabold uppercase tracking-tight flex items-center justify-between">
                                                                <span>{b.sport}</span>
                                                                <span>{b.amount}</span>
                                                            </div>
                                                            <div className="font-bold truncate mt-0.5">{b.customer}</div>
                                                            <div className="text-[9px] opacity-80 mt-0.5">{b.slotRange || b.time}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MONTHLY CALENDAR VIEW ── */}
                {calendarView === 'Month' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-extrabold text-surface-900">March 2026</h3>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">248 Total Bookings</span>
                        </div>

                        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-surface-500 border-b border-surface-200 pb-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                <div key={d} className="uppercase tracking-wider py-1">{d}</div>
                            ))}
                        </div>

                        {/* Month 35-cell grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 31 }, (_, i) => {
                                const dayNum = i + 1
                                const isToday = dayNum === 16
                                const bookingsCount = (dayNum % 3 === 0) ? 8 : (dayNum % 2 === 0 ? 5 : 3)
                                const revenueSum = bookingsCount * 700

                                return (
                                    <div
                                        key={dayNum}
                                        onClick={() => addToast({ title: `Date: ${dayNum} March`, message: `${bookingsCount} Bookings • ₹${revenueSum.toLocaleString()}`, type: 'info' })}
                                        className={`p-3 rounded-2xl border transition-all cursor-pointer min-h-[95px] flex flex-col justify-between ${
                                            isToday 
                                                ? 'border-2 border-emerald-500 bg-emerald-50/60 shadow-md' 
                                                : 'border-surface-200/80 bg-white hover:border-emerald-300 hover:shadow-soft'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs font-extrabold ${isToday ? 'text-emerald-700 bg-emerald-200/70 px-1.5 py-0.5 rounded-lg' : 'text-surface-800'}`}>
                                                {dayNum}
                                            </span>
                                            {isToday && <span className="text-[9px] font-black text-emerald-600 uppercase">Today</span>}
                                        </div>

                                        <div className="space-y-0.5 my-1">
                                            <div className="text-[11px] font-black text-surface-900">{bookingsCount} Bookings</div>
                                            <div className="text-[10px] font-bold text-emerald-600">₹{revenueSum.toLocaleString()}</div>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-[9px] font-semibold text-surface-500">
                                            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Cricket</span>
                                            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> Football</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* ── DAILY AGENDA TIMELINE VIEW ── */}
                {calendarView === 'Day' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-base font-extrabold text-surface-900">Agenda for Monday, 16 March 2026</h3>
                            <span className="text-xs font-bold text-surface-500">12 Scheduled Sessions</span>
                        </div>

                        <div className="space-y-3">
                            {[
                                { time: '10:00 AM', title: 'Cricket • Court A', customer: 'Rahul Kumar', type: 'Online', amount: '₹800', status: 'Confirmed' },
                                { time: '11:30 AM', title: 'Football • Turf 2', customer: 'Priya Sharma', type: 'Online', amount: '₹900', status: 'Confirmed' },
                                { time: '02:00 PM', title: 'Football • Court 1', customer: 'Arjun Mehta', type: 'Walk-in', amount: '₹400', status: 'Pending' },
                                { time: '04:30 PM', title: 'Cricket • Court B', customer: 'Sneha Reddy', type: 'Online', amount: '₹1,200', status: 'Cancelled' },
                                { time: '06:00 PM', title: 'Cricket • Court 3', customer: 'Vikram Singh', type: 'Walk-in', amount: '₹700', status: 'Confirmed' }
                            ].map((item, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => handleOpenSlideOver({
                                        id: `BK-00${idx + 1}`,
                                        customer: item.customer,
                                        sport: item.title.split(' • ')[0],
                                        court: item.title.split(' • ')[1],
                                        time: item.time,
                                        amount: item.amount,
                                        type: item.type,
                                        status: item.status,
                                        date: '2026-03-16'
                                    })}
                                    className="p-4 rounded-2xl border border-surface-200/80 bg-white hover:border-emerald-300 transition-all cursor-pointer shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 text-xs font-black text-emerald-600 bg-emerald-50 py-2 px-3 rounded-xl text-center border border-emerald-100">
                                            {item.time}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-surface-900">{item.title}</h4>
                                            <p className="text-xs text-surface-500 font-semibold mt-0.5">{item.customer} • {item.type} Payment</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 justify-between md:justify-end">
                                        <span className="text-sm font-extrabold text-surface-900">{item.amount}</span>
                                        <Badge variant={item.status === 'Confirmed' ? 'success' : item.status === 'Pending' ? 'warning' : 'danger'} dot>
                                            {item.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

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
