import { useState, useEffect, useCallback } from 'react'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import { useToast } from '../../components/ui/Toast'
import { getBookingHistory, createBooking } from '../../services/bookingService'
import { getBranches } from '../../services/branchService'
import { getBranchSports } from '../../services/sportsService'
import useRealtime from '../../utils/useRealtime'

const COURT_OPTIONS = ['Court 1', 'Court 2', 'Turf A', 'Turf B', 'Indoor Court']

const formatDisplayDate = (isoDate) => {
    if (!isoDate) return ''
    const d = new Date(isoDate)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[d.getMonth()]} ${d.getDate()}`
}

const formatDisplayTime = (hhmmss) => {
    if (!hhmmss) return ''
    const [hours, minutes] = hhmmss.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayHour = h % 12 || 12
    return `${String(displayHour).padStart(2, '0')}:${minutes || '00'} ${ampm}`
}

export default function StaffBookings() {
    const { addToast } = useToast()
    const [bookings, setBookings] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [myBranchId, setMyBranchId] = useState(null)
    const [branchSports, setBranchSports] = useState([])

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        customer: '', phone: '', sportId: '', court: '',
        date: '', time: '', durationHours: '1', paymentMethod: 'CASH', notes: ''
    })

    const fetchBookings = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await getBookingHistory()
            let rawList = (res && res.data && Array.isArray(res.data)) ? res.data : []
            
            if (rawList.length === 0) {
                // Fallback to billing history for POS/Checkout records
                try {
                    const billRes = await api.get('/billing/history')
                    if (billRes && Array.isArray(billRes.data)) {
                        rawList = billRes.data
                    }
                } catch (e) {}
            }

            const seen = new Set();
            const mapped = [];
            for (const b of rawList) {
                const key = b.bookingCode || b.id || b.booking_id || `${b.customer_name || b.customerName}_${b.amount}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    mapped.push({
                        id: b.bookingCode || b.invoiceNumber || b.paymentId || (b.id ? `BK-${b.id}` : 'BK-101'),
                        rawId: b.id || b.booking_id,
                        customer: b.customer_name || b.customerName || b.user?.fullName || b.customer || 'Valued Player',
                        phone: b.mobile_number || b.mobileNumber || b.phone || '',
                        sport: b.sport_name || b.sportName || b.sport || (b.type === 'BOOKING' ? 'Cricket' : 'Sports'),
                        date: b.slot_date ? formatDisplayDate(b.slot_date) : b.booked_on ? formatDisplayDate(b.booked_on) : 'Today',
                        time: b.start_time ? formatDisplayTime(b.start_time) : b.timeSlot || '06:00 PM',
                        court: b.court_name || b.courtName || b.court || b.branchName || 'Main Court',
                        amount: b.owner_amount ? Number(b.owner_amount) : Number(b.amount || 0),
                        duration: b.duration ? `${b.duration} Min` : '60 Min',
                        notes: b.notes || '',
                        status: b.status === 'COMPLETED' || b.booking_status === 'COMPLETED' || b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'REFUNDED' ? 'Cancelled' : (b.status || 'Confirmed')
                    });
                }
            }
            setBookings(mapped)
        } catch (err) {
            console.warn('StaffBookings fetch note:', err)
            setBookings([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => { fetchBookings() }, [fetchBookings])
    useRealtime(['booking:new', 'booking:cancelled'], () => fetchBookings())

    useEffect(() => {
        getBranches().then(res => {
            const branch = (res?.data || res || [])[0]
            if (branch) {
                setMyBranchId(branch.id)
                getBranchSports(branch.id).then(sportsRes => {
                    setBranchSports(sportsRes?.data || [])
                }).catch(() => setBranchSports([]))
            }
        }).catch(() => {})
    }, [])

    const handleView = (booking) => {
        setSelectedBooking(booking)
        setIsViewOpen(true)
    }

    const handleAddBooking = async (e) => {
        e.preventDefault()

        if (!formData.customer || !formData.phone) {
            addToast({ title: 'Validation Error', message: 'Customer Name and Phone Number are required', type: 'error' })
            return
        }
        if (!formData.sportId || !formData.court || !formData.date || !formData.time) {
            addToast({ title: 'Validation Error', message: 'Please select sport, court, date, and time', type: 'error' })
            return
        }
        if (!myBranchId) {
            addToast({ title: 'No Branch Found', message: 'No branch is linked to this account yet.', type: 'error' })
            return
        }

        const startHour = parseInt(formData.time.split(':')[0])
        const startTime = `${formData.time}:00`
        const endTime = `${startHour + Number(formData.durationHours || 1)}:${formData.time.split(':')[1]}:00`

        setIsSubmitting(true)
        try {
            const res = await createBooking({
                branchId: myBranchId,
                sportId: formData.sportId,
                courtName: formData.court,
                slotDate: formData.date,
                startTime, endTime,
                customerName: formData.customer,
                mobileNumber: formData.phone,
                notes: formData.notes,
                paymentMethod: formData.paymentMethod
            })
            addToast({ title: 'Success', message: `Walk-in booking ${res.data.bookingCode} created (₹${res.data.amount})`, type: 'success' })
            setIsAddModalOpen(false)
            setFormData({ customer: '', phone: '', sportId: '', court: '', date: '', time: '', durationHours: '1', paymentMethod: 'CASH', notes: '' })
            fetchBookings()
        } catch (err) {
            addToast({ title: 'Booking Failed', message: err.message || 'Could not create this booking.', type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'customer', label: 'Customer' },
        { key: 'sport', label: 'Sport' },
        { key: 'date', label: 'Date' },
        { key: 'time', label: 'Time' },
        { key: 'court', label: 'Court' },
        {
            key: 'amount',
            label: 'Amount',
            render: v => `₹${v}`
        },
        {
            key: 'status',
            label: 'Status',
            render: (v) => (
                <Badge variant={
                    v === 'Checked In' ? 'primary' :
                    v === 'Confirmed' ? 'success' :
                    v === 'Cancelled' ? 'danger' : 'warning'
                } dot={v !== 'Cancelled'}>
                    {v}
                </Badge>
            )
        },
        {
            key: 'action',
            label: 'Actions',
            render: (_, r) => (
                <Button size="sm" variant="outline" onClick={() => handleView(r)}>
                    👁️ View
                </Button>
            )
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Bookings</h1>
                    <p className="text-surface-500 text-sm mt-1">Manage check-ins and scheduling</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>+ Walk-in Booking</Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden pt-4">
                {isLoading ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">No bookings found.</div>
                ) : (
                    <DataTable columns={columns} data={bookings} />
                )}
            </div>

            {/* Walk-in Booking Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Create Walk-in Booking"
                size="lg"
            >
                <form onSubmit={handleAddBooking} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Customer Name"
                            required
                            placeholder="Enter customer name"
                            value={formData.customer}
                            onChange={(e) => setFormData({...formData, customer: e.target.value})}
                        />
                        <Input
                            label="Phone Number"
                            required
                            type="tel"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Sport"
                            required
                            placeholder="Select Sport"
                            options={branchSports.map(bs => ({ value: bs.sportId?.id || bs.sportId, label: bs.sportId?.name || bs.sportName }))}
                            value={formData.sportId}
                            onChange={(e) => setFormData({...formData, sportId: e.target.value})}
                        />
                        <Select
                            label="Court"
                            required
                            placeholder="Select Court"
                            options={COURT_OPTIONS.map(c => ({ value: c, label: c }))}
                            value={formData.court}
                            onChange={(e) => setFormData({...formData, court: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <CustomDatePicker
                            label="Date *"
                            value={formData.date}
                            onChange={(val) => setFormData({...formData, date: val})}
                            align="left"
                        />
                        <Input
                            label="Start Time"
                            type="time"
                            required
                            value={formData.time}
                            onChange={(e) => setFormData({...formData, time: e.target.value})}
                        />
                        <Select
                            label="Duration"
                            required
                            options={[
                                { value: '1', label: '1 Hour' },
                                { value: '2', label: '2 Hours' },
                                { value: '3', label: '3 Hours' }
                            ]}
                            value={formData.durationHours}
                            onChange={(e) => setFormData({...formData, durationHours: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">Payment Method</label>
                        <div className="flex gap-2">
                            {['CASH', 'UPI', 'CARD'].map(method => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setFormData({...formData, paymentMethod: method})}
                                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer ${
                                        formData.paymentMethod === method
                                            ? 'border-accent-500 bg-accent-50 text-accent-700'
                                            : 'border-surface-200 bg-white text-surface-600 hover:border-surface-300'
                                    }`}
                                >
                                    {method === 'CASH' && '💵 '}
                                    {method === 'UPI' && '📱 '}
                                    {method === 'CARD' && '💳 '}
                                    {method}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-surface-400 mt-2">Amount is calculated automatically from the venue's real slot pricing.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">Notes</label>
                        <textarea
                            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none transition-all text-sm text-surface-800 placeholder:text-surface-400 resize-none"
                            rows="3"
                            placeholder="Any additional notes..."
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                        <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Booking'}</Button>
                    </div>
                </form>
            </Modal>

            {/* View Booking Details Modal */}
            <Modal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="Booking Details"
            >
                {selectedBooking && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between pb-4 border-b border-surface-100">
                            <div>
                                <p className="text-xs text-surface-400 uppercase tracking-wider">Booking ID</p>
                                <p className="text-lg font-bold text-surface-900">{selectedBooking.id}</p>
                            </div>
                            <Badge variant={
                                selectedBooking.status === 'Checked In' ? 'primary' :
                                selectedBooking.status === 'Confirmed' ? 'success' :
                                selectedBooking.status === 'Cancelled' ? 'danger' : 'warning'
                            } dot>
                                {selectedBooking.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Customer Name</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedBooking.customer}</p>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Phone Number</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedBooking.phone || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Sport</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedBooking.sport}</p>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Court</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedBooking.court}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Date</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedBooking.date}</p>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Time</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedBooking.time}</p>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Duration</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedBooking.duration || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-surface-600 font-medium">Total Amount</p>
                                <p className="text-xl font-bold text-accent-600">₹{Number(selectedBooking.amount).toLocaleString()}</p>
                            </div>
                        </div>

                        {selectedBooking.notes && (
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Notes</p>
                                <p className="text-sm text-surface-700">{selectedBooking.notes}</p>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
