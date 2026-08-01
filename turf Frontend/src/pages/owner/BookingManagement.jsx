import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import Card from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import { HiTicket, HiCalendar, HiCurrencyRupee, HiSearch, HiCheckCircle, HiBan, HiUser } from 'react-icons/hi'

const initialBookings = [
    { id: 'BK-001', customer: 'Rahul Kumar', phone: '+91 98765 00001', email: 'rahul@gmail.com', sport: 'Cricket', date: '2026-03-15', time: '10:00 AM', amount: '₹800', type: 'Online', status: 'Confirmed' },
    { id: 'BK-002', customer: 'Priya Sharma', phone: '+91 98765 00002', email: 'priya@gmail.com', sport: 'Football', date: '2026-03-15', time: '11:30 AM', amount: '₹900', type: 'Online', status: 'Confirmed' },
    { id: 'BK-003', customer: 'Arjun Mehta', phone: '+91 98765 00003', email: 'arjun@gmail.com', sport: 'Badminton', date: '2026-03-15', time: '02:00 PM', amount: '₹400', type: 'Walk-in', status: 'Pending' },
    { id: 'BK-004', customer: 'Sneha Reddy', phone: '+91 98765 00004', email: 'sneha@gmail.com', sport: 'Cricket', date: '2026-03-16', time: '04:30 PM', amount: '₹1,200', type: 'Online', status: 'Cancelled' },
    { id: 'BK-005', customer: 'Vikram Singh', phone: '+91 98765 00005', email: 'vikram@gmail.com', sport: 'Tennis', date: '2026-03-16', time: '06:00 PM', amount: '₹700', type: 'Walk-in', status: 'Confirmed' },
]

export default function BookingManagement() {
    const { addToast } = useToast()
    const [bookings, setBookings] = useState(initialBookings)
    const [filterStatus, setFilterStatus] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [filterDate, setFilterDate] = useState('')

    // Details drawer modal
    const [detailModal, setDetailModal] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)

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

    // Filter bookings based on selections
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

            {/* Visual filtering tabs */}
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
                            className="text-xs font-bold text-red-500 hover:text-red-650"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table layout */}
            <Card className="p-6">
                <DataTable columns={columns} data={filteredBookings} />
            </Card>

            {/* Details Modal */}
            {selectedBooking && (
                <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title={`Booking Summary : ${selectedBooking.id}`} size="md">
                    <div className="space-y-6">
                        {/* Customer overview */}
                        <div className="flex items-center gap-4 bg-surface-50 p-4 rounded-2xl border border-surface-200">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg font-black">
                                <HiUser />
                            </div>
                            <div className="text-xs">
                                <h3 className="text-sm font-black text-surface-900 leading-tight">{selectedBooking.customer}</h3>
                                <p className="text-surface-500 font-semibold mt-1">{selectedBooking.phone} • {selectedBooking.email}</p>
                            </div>
                        </div>

                        {/* Match particulars */}
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

                        {/* Booking Status Tracker */}
                        <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 text-xs flex justify-between items-center">
                            <span className="font-bold text-surface-600">Verification Status:</span>
                            <Badge variant={selectedBooking.status === 'Confirmed' ? 'success' : selectedBooking.status === 'Pending' ? 'warning' : 'danger'} dot>
                                {selectedBooking.status}
                            </Badge>
                        </div>

                        {/* Detailed action triggers */}
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
