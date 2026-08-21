import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'

const DEFAULT_DEMO_BOOKINGS = []

export default function CustomerBookings() {
    const { user } = useAuth()
    const navigate = useNavigate()

    // Helper: Load bookings for currently logged-in user or active guest session
    const getMyBookingsFromStorage = () => {
        try {
            const rawCustomer = localStorage.getItem('customer_bookings')
            const rawGuest = localStorage.getItem('guest_bookings')
            
            const customerList = rawCustomer ? JSON.parse(rawCustomer) : []
            const guestList = rawGuest ? JSON.parse(rawGuest) : []

            const allBookings = [...(Array.isArray(customerList) ? customerList : []), ...(Array.isArray(guestList) ? guestList : [])]

            if (allBookings.length === 0) return []
            
            const currentEmail = (user?.email || '').toLowerCase()
            const currentUserId = user?.id || ''
            const currentPhone = user?.phone || user?.mobile || ''
            const cleanCurrentPhone = currentPhone.replace(/\D/g, '').slice(-10)

            // If user is logged in, filter their specific bookings
            if (user && (currentEmail || currentUserId || cleanCurrentPhone)) {
                const matched = allBookings.filter(b => {
                    const bEmail = (b.userEmail || b.email || '').toLowerCase()
                    const bUserId = b.userId || b.id || ''
                    const bPhone = b.customerPhone || b.phone || ''
                    const cleanBPhone = bPhone.replace(/\D/g, '').slice(-10)

                    if (currentEmail && bEmail && bEmail === currentEmail) return true
                    if (currentUserId && bUserId && bUserId === currentUserId) return true
                    if (cleanCurrentPhone && cleanBPhone && cleanBPhone === cleanCurrentPhone) return true
                    return false
                })

                // If user matched items, return them. If user just made a booking, return recent items
                if (matched.length > 0) return matched
            }

            // For Guest users or newly created bookings, return all recent bookings from this session
            const formattedList = allBookings.map(b => ({
                id: b.id || b.bookingId || `BK-${Math.floor(1000 + Math.random() * 9000)}`,
                venue: b.venue || b.turfName || 'SportMatrix Turf Arena',
                court: b.court || b.pitch || 'Main Court',
                sport: b.sport || 'Cricket 🏏',
                date: b.date || b.slotDate || new Date().toISOString().split('T')[0],
                time: b.time || b.slotTime || '06:00 PM - 07:00 PM',
                amount: `₹${Number(b.amount || b.rent || 1000).toLocaleString('en-IN')}`,
                status: b.status || 'Confirmed',
                paymentMethod: b.paymentMode || b.paymentMethod || 'UPI (Paid)',
                createdOn: b.createdAt ? b.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
            }))

            return formattedList
        } catch (e) {
            console.error('Error fetching bookings from storage:', e)
            return []
        }
    }

    const [bookingsList, setBookingsList] = useState(getMyBookingsFromStorage)
    const [filterStatus, setFilterStatus] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [rescheduleModal, setRescheduleModal] = useState({ open: false, booking: null })
    const [cancelConfirm, setCancelConfirm] = useState({ open: false, id: null })
    const [formData, setFormData] = useState({ date: '', time: '' })
    const [calendarMonthDate, setCalendarMonthDate] = useState({ year: 2026, month: 7 })

    const timeSlotsList = [
        '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM',
        '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
        '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
        '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'
    ]

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const calendarGrid = useMemo(() => {
        const { year, month } = calendarMonthDate
        const firstDay = new Date(year, month, 1).getDay()
        const totalDays = new Date(year, month + 1, 0).getDate()
        const days = []

        for (let i = 0; i < firstDay; i++) {
            days.push({ id: `blank-${i}`, dayNum: null, isCurrentMonth: false })
        }

        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            days.push({
                id: `d-${d}`,
                dayNum: d,
                dateStr,
                isCurrentMonth: true
            })
        }

        return days
    }, [calendarMonthDate])

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

                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1'
                const res = await fetch(`${baseUrl}/bookings/history?${queryParams.toString()}`, {
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
        const dateVal = bk.date || '2026-08-09'
        const timeVal = bk.time || '06:00 PM'
        setFormData({ date: dateVal, time: timeVal })
        
        try {
            const parts = dateVal.split('-')
            if (parts.length === 3) {
                const y = parseInt(parts[0], 10)
                const m = parseInt(parts[1], 10) - 1
                if (!isNaN(y) && !isNaN(m)) {
                    setCalendarMonthDate({ year: y, month: m })
                }
            }
        } catch (e) {}
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

            {/* Custom UI Reschedule Modal */}
            <Modal 
                isOpen={rescheduleModal.open} 
                onClose={() => setRescheduleModal({ open: false, booking: null })} 
                title="Reschedule Booking"
            >
                <div className="space-y-5 animate-in fade-in duration-200">
                    {/* Booking Context Banner */}
                    <div className="bg-slate-50 border border-[#E2E8F0] p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">TARGET BOOKING</span>
                            <span className="text-xs font-black text-[#111827]">{rescheduleModal.booking?.id} · {rescheduleModal.booking?.venue}</span>
                        </div>
                        <span className="text-[11px] font-extrabold text-[#065F46] bg-[#ECFDF5] border border-emerald-300 px-2.5 py-1 rounded-full">
                            Current: {rescheduleModal.booking?.date} ({rescheduleModal.booking?.time})
                        </span>
                    </div>

                    {/* CUSTOM CALENDAR PICKER */}
                    <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-4 shadow-xs">
                        {/* Month & Year Navigation Header */}
                        <div className="flex items-center justify-between mb-3 px-1">
                            <span className="text-sm font-black text-[#111827] flex items-center gap-1.5">
                                📅 {monthNames[calendarMonthDate.month]} {calendarMonthDate.year}
                            </span>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCalendarMonthDate(prev => prev.month === 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: prev.month - 1 })
                                    }}
                                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-[#10B981] text-[#111827] font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    ‹
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCalendarMonthDate(prev => prev.month === 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: prev.month + 1 })
                                    }}
                                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-[#10B981] text-[#111827] font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    ›
                                </button>
                            </div>
                        </div>

                        {/* Days of Week Header */}
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <span key={day} className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                    {day}
                                </span>
                            ))}
                        </div>

                        {/* Calendar Days Grid */}
                        <div className="grid grid-cols-7 gap-1.5 text-center">
                            {calendarGrid.map(cell => {
                                if (!cell.isCurrentMonth) {
                                    return <div key={cell.id} className="h-8" />
                                }
                                const isSelected = formData.date === cell.dateStr
                                return (
                                    <button
                                        key={cell.id}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, date: cell.dateStr }))}
                                        className={`h-8 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                                            isSelected
                                                ? 'bg-[#10B981] text-white border-2 border-[#059669] shadow-md scale-105'
                                                : 'bg-slate-50 hover:bg-emerald-50 hover:border-[#10B981] text-[#111827] border border-[#E2E8F0]'
                                        }`}
                                    >
                                        {cell.dayNum}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* CUSTOM TIME SLOT PICKER */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 px-1">
                            SELECT NEW TIME SLOT
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {timeSlotsList.map(t => {
                                const isSelected = formData.time === t
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, time: t }))}
                                        className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                                            isSelected
                                                ? 'bg-[#10B981] text-white border-2 border-[#059669] shadow-md scale-[1.02]'
                                                : 'bg-[#ECFDF5] border border-[#10B981] text-[#111827] hover:bg-emerald-100 shadow-xs'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Live Selected Summary */}
                    <div className="bg-[#ECFDF5] border border-emerald-300 p-3.5 rounded-xl flex items-center justify-between text-xs font-semibold text-emerald-950">
                        <span>New Selected Slot:</span>
                        <span className="font-black text-[#065F46]">{formData.date || '2026-08-09'} at {formData.time || '06:00 PM'}</span>
                    </div>

                    {/* Modal Bottom Actions */}
                    <div className="flex gap-3 justify-end pt-3 border-t border-[#E2E8F0]">
                        <Button variant="secondary" onClick={() => setRescheduleModal({ open: false, booking: null })} className="px-5 py-2.5 rounded-full text-xs font-bold">
                            Cancel
                        </Button>
                        <Button onClick={saveReschedule} className="bg-[#10B981] hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-full text-xs uppercase tracking-wider shadow-md">
                            Confirm Reschedule
                        </Button>
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
