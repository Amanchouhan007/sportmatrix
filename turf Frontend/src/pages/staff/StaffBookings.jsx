import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import { useToast } from '../../components/ui/Toast'

const initialBookings = [
    { id: 'BK-001', customer: 'Rahul K.', phone: '9876543210', sport: 'Cricket', date: 'Mar 15', time: '10:00 AM', court: 'Turf A', amount: '800', duration: '1 Hour', paymentMethod: 'UPI', notes: '', status: 'Confirmed' },
    { id: 'BK-002', customer: 'Priya S.', phone: '9123456789', sport: 'Football', date: 'Mar 15', time: '11:30 AM', court: 'Turf B', amount: '900', duration: '1 Hour', paymentMethod: 'Cash', notes: '', status: 'Confirmed' },
    { id: 'BK-003', customer: 'Walk-in', phone: '9988776655', sport: 'Football', date: 'Mar 15', time: '02:00 PM', court: 'Court 1', amount: '400', duration: '30 Min', paymentMethod: 'Card', notes: 'First time player', status: 'Pending' },
]

export default function StaffBookings() {
    const { addToast } = useToast()
    const [bookings, setBookings] = useState(initialBookings)
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)

    // Form state
    const [formData, setFormData] = useState({
        customer: '',
        phone: '',
        sport: '',
        court: '',
        date: '',
        time: '',
        duration: '',
        amount: '',
        paymentMethod: 'Cash',
        notes: ''
    })

    const handleView = (booking) => {
        setSelectedBooking(booking)
        setIsViewOpen(true)
    }

    const handleAddBooking = (e) => {
        e.preventDefault()
        
        if (!formData.customer || !formData.phone) {
            addToast({ title: 'Validation Error', message: 'Customer Name and Phone Number are required', type: 'error' })
            return
        }

        if (!formData.sport || !formData.court) {
            addToast({ title: 'Validation Error', message: 'Please select both Sport and Court', type: 'error' })
            return
        }

        const newId = `BK-${String(bookings.length + 1).padStart(3, '0')}`
        
        // Format the time for display
        let displayTime = formData.time
        if (formData.time) {
            const [hours, minutes] = formData.time.split(':')
            const h = parseInt(hours)
            const ampm = h >= 12 ? 'PM' : 'AM'
            const displayHour = h % 12 || 12
            displayTime = `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`
        }

        // Format the date for display
        let displayDate = formData.date
        if (formData.date) {
            const dateObj = new Date(formData.date)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            displayDate = `${months[dateObj.getMonth()]} ${dateObj.getDate()}`
        }

        const newBooking = {
            id: newId,
            customer: formData.customer,
            phone: formData.phone,
            sport: formData.sport,
            court: formData.court,
            date: displayDate,
            time: displayTime,
            duration: formData.duration || '1 Hour',
            amount: formData.amount,
            paymentMethod: formData.paymentMethod,
            notes: formData.notes,
            status: 'Confirmed',
        }
        setBookings(prev => [...prev, newBooking])
        setIsAddModalOpen(false)
        setFormData({ customer: '', phone: '', sport: '', court: '', date: '', time: '', duration: '', amount: '', paymentMethod: 'Cash', notes: '' })
        addToast({ title: 'Success', message: `Walk-in booking ${newId} created successfully`, type: 'success' })
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
                <DataTable columns={columns} data={bookings} />
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
                            options={[
                                { value: 'Cricket', label: 'Cricket' },
                                { value: 'Football', label: 'Football' },
                                { value: 'Football', label: 'Football' }
                            ]}
                            value={formData.sport}
                            onChange={(e) => setFormData({...formData, sport: e.target.value})}
                        />
                        <Select 
                            label="Court" 
                            required
                            placeholder="Select Court"
                            options={[
                                { value: 'Turf A', label: 'Turf A' },
                                { value: 'Turf B', label: 'Turf B' },
                                { value: 'Court 1', label: 'Court 1' },
                                { value: 'Indoor Court', label: 'Indoor Court' }
                            ]}
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
                            placeholder="Select Duration"
                            options={[
                                { value: '30 Min', label: '30 Min' },
                                { value: '1 Hour', label: '1 Hour' },
                                { value: '1.5 Hours', label: '1.5 Hours' },
                                { value: '2 Hours', label: '2 Hours' },
                                { value: '3 Hours', label: '3 Hours' }
                            ]}
                            value={formData.duration}
                            onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Amount (₹)" 
                            type="number" 
                            required
                            placeholder="Enter amount"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        />
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-2">Payment Method</label>
                            <div className="flex gap-2">
                                {['Cash', 'UPI', 'Card'].map(method => (
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
                                        {method === 'Cash' && '💵 '}
                                        {method === 'UPI' && '📱 '}
                                        {method === 'Card' && '💳 '}
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>
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
                        <Button type="submit">Create Booking</Button>
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
                        {/* Header with ID and Status */}
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

                        {/* Customer Info */}
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

                        {/* Booking Info */}
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

                        {/* Schedule Info */}
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

                        {/* Payment Info */}
                        <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-surface-600 font-medium">Total Amount</p>
                                <p className="text-xl font-bold text-accent-600">₹{Number(selectedBooking.amount).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-surface-600 font-medium">Payment Method</p>
                                <span className="text-sm font-semibold text-surface-800">
                                    {selectedBooking.paymentMethod === 'Cash' && '💵 '}
                                    {selectedBooking.paymentMethod === 'UPI' && '📱 '}
                                    {selectedBooking.paymentMethod === 'Card' && '💳 '}
                                    {selectedBooking.paymentMethod || 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Notes */}
                        {selectedBooking.notes && (
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Notes</p>
                                <p className="text-sm text-surface-700">{selectedBooking.notes}</p>
                            </div>
                        )}

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
