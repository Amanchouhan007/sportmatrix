import { useState, useEffect, useCallback, useMemo } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { getBranches } from '../../services/branchService'
import { getBranchSports } from '../../services/sportsService'
import {
    createSlot,
    getSlots,
    updateSlot,
    updateSlotStatus
} from '../../services/slotService'
import {
    createHoliday,
    getHolidays,
    deleteHoliday
} from '../../services/holidayService'
import { HiPlus, HiCheckCircle, HiBan, HiOutlineClock, HiCurrencyRupee, HiCheck } from 'react-icons/hi'

const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const formatTo12Hour = (time24) => {
    if (!time24) return '';
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${String(hours12).padStart(2, '0')}:${minutesStr} ${period}`;
};

const getBookedByName = (notes) => {
    if (!notes) return '';
    try {
        const parsed = JSON.parse(notes);
        if (parsed && parsed.customerName) {
            return parsed.customerName;
        }
    } catch (e) {
        // Fallback for regular string
    }
    return notes;
};

const getLocalDateString = () => {
    const local = new Date();
    const offset = local.getTimezoneOffset();
    const adjusted = new Date(local.getTime() - (offset * 60 * 1000));
    return adjusted.toISOString().split('T')[0];
};

export default function SlotManagement() {
    const { addToast } = useToast()
    const { user, loading: authLoading } = useAuth()

    // Page-wide loaders
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [isSlotsLoading, setIsSlotsLoading] = useState(false)
    const [isHolidayLoading, setIsHolidayLoading] = useState(false)
    const [isBookingLoading, setIsBookingLoading] = useState(false)

    // Data lists
    const [branches, setBranches] = useState([])
    const [selectedBranchId, setSelectedBranchId] = useState(localStorage.getItem('selectedBranchId') || '')
    const [branchSports, setBranchSports] = useState([])
    const [slots, setSlots] = useState([])
    const [holidays, setHolidays] = useState([])

    // Filters
    const [date, setDate] = useState(getLocalDateString)
    const [selectedSport, setSelectedSport] = useState('')
    const [selectedCourt, setSelectedCourt] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')

    // Modals
    const [holidayModal, setHolidayModal] = useState(false)
    const [createModal, setCreateModal] = useState(false)
    const [actionModal, setActionModal] = useState(false)
    const [bookingModal, setBookingModal] = useState(false)

    // Selection details
    const [activeSlot, setActiveSlot] = useState(null)

    // Form states
    const [newSlot, setNewSlot] = useState({
        startTime: '18:00',
        endTime: '19:00',
        regularPrice: 800,
        peakPrice: 1200,
        isPeakHour: false,
        courtName: '',
        sportId: ''
    })
    const [newHoliday, setNewHoliday] = useState({ date: '', reason: '' })
    const [bookingData, setBookingData] = useState({
        customerName: '',
        mobileNumber: '',
        notes: ''
    })

    // Load branches
    useEffect(() => {
        if (!authLoading && user) {
            const loadPageData = async () => {
                setIsPageLoading(true)
                try {
                    const branchesRes = await getBranches({ ownerId: user._id })
                    if (branchesRes && branchesRes.success && branchesRes.data && branchesRes.data.branches) {
                        const branchList = branchesRes.data.branches
                        setBranches(branchList)

                        let activeBranch = selectedBranchId || user.branchId
                        if (branchList.length > 0) {
                            const exists = branchList.some(b => b._id === activeBranch)
                            if (!exists) {
                                activeBranch = branchList[0]._id
                            }
                        }
                        if (activeBranch) {
                            setSelectedBranchId(activeBranch)
                        }
                    }
                } catch (error) {
                    console.error('Failed to load branches', error)
                    addToast({ title: 'Error', message: 'Failed to load branches', type: 'error' })
                } finally {
                    setIsPageLoading(false)
                }
            }
            loadPageData()
        }
    }, [authLoading, user])

    // Load configured branch configurations (sports, holidays)
    const loadBranchConfig = useCallback(async () => {
        if (!selectedBranchId) return
        try {
            const sportsRes = await getBranchSports(selectedBranchId)
            if (sportsRes && sportsRes.success) {
                setBranchSports(sportsRes.data)
                if (sportsRes.data.length > 0) {
                    const first = sportsRes.data[0]
                    const sId = typeof first.sportId === 'object' ? (first.sportId?._id || first.sportId?.id) : (first.sportId || first._id)
                    const sName = typeof first.sportId === 'object' ? first.sportId?.name : (first.name || 'Football')
                    setNewSlot(prev => ({
                        ...prev,
                        sportId: sId || '',
                        courtName: `${sName} Court 1`
                    }))
                }
            }
            
            const holidaysRes = await getHolidays({ branchId: selectedBranchId })
            if (holidaysRes && holidaysRes.success) {
                setHolidays(holidaysRes.data)
            }
        } catch (error) {
            console.error('Failed to load branch configuration', error)
        }
    }, [selectedBranchId])

    useEffect(() => {
        loadBranchConfig()
    }, [loadBranchConfig])

    // Fetch Slots on Branch/Date change
    const loadSlots = useCallback(async () => {
        if (!selectedBranchId || !date) return
        setIsSlotsLoading(true)
        try {
            const slotsRes = await getSlots({
                branchId: selectedBranchId,
                date: date
            })
            if (slotsRes && slotsRes.success) {
                setSlots(slotsRes.data)
            }
        } catch (error) {
            console.error('Failed to load slots', error)
            addToast({ title: 'Error', message: error.response?.data?.message || 'Failed to load slots', type: 'error' })
        } finally {
            setIsSlotsLoading(false)
        }
    }, [selectedBranchId, date, addToast])

    useEffect(() => {
        loadSlots()
    }, [loadSlots])

    // Auto-generate court choices based on branch config
    const courtOptions = useMemo(() => {
        const courts = []
        branchSports.forEach(bs => {
            const sportName = typeof bs.sportId === 'object' ? (bs.sportId?.name || bs.name) : (bs.name || 'Turf')
            const count = bs.totalCourts || 1
            for (let i = 1; i <= count; i++) {
                courts.push({
                    value: `${sportName} Court ${i}`,
                    label: `${sportName} - Court ${i}`
                })
            }
        })
        if (courts.length === 0) {
            return [
                { value: 'Turf A', label: 'Turf A (Main Field)' },
                { value: 'Turf B', label: 'Turf B (Indoor Arena)' },
                { value: 'Court 1', label: 'Football Court 1' }
            ]
        }
        return courts
    }, [branchSports])

    // Get courts list populated for filter dropdown
    const filterCourtOptions = useMemo(() => {
        const uniqueCourts = new Set()
        slots.forEach(s => {
            if (s.courtName) uniqueCourts.add(s.courtName)
        })
        return Array.from(uniqueCourts).map(c => ({ value: c, label: c }))
    }, [slots])

    // Helper to evaluate slot styles and holiday overrides
    const getStatusStyles = useCallback((slot) => {
        let slotDateStr = ''
        if (slot.slotDate) {
            try {
                const parsed = new Date(slot.slotDate)
                if (!isNaN(parsed.getTime())) {
                    slotDateStr = parsed.toISOString().split('T')[0]
                }
            } catch (e) {}
        }
        const matchingHoliday = holidays.find(h => {
            const hDate = h.holidayDate || h.startDate
            if (!hDate) return false
            try {
                const parsed = new Date(hDate)
                return !isNaN(parsed.getTime()) && parsed.toISOString().split('T')[0] === slotDateStr
            } catch (e) {
                return false
            }
        })
        
        if (matchingHoliday) {
            return {
                status: 'BLOCKED',
                bgStyle: 'bg-red-50/30 border-red-200',
                textColor: 'text-red-700',
                statusText: `Holiday: ${matchingHoliday.reason}`
            }
        }

        if (slot.status === 'AVAILABLE') {
            return {
                status: 'AVAILABLE',
                bgStyle: 'bg-emerald-50/20 border-emerald-100 hover:border-emerald-500 hover:shadow-soft-md',
                textColor: 'text-emerald-700',
                statusText: `₹${slot.isPeakHour ? slot.peakPrice : slot.regularPrice}`
            }
        } else if (slot.status === 'BOOKED') {
            return {
                status: 'BOOKED',
                bgStyle: 'bg-blue-50/40 border-blue-200 shadow-inner',
                textColor: 'text-blue-700',
                statusText: getBookedByName(slot.notes) || 'Booked'
            }
        } else if (slot.status === 'COMPLETED') {
            return {
                status: 'COMPLETED',
                bgStyle: 'bg-surface-100 border-surface-200 opacity-60',
                textColor: 'text-surface-500 font-semibold',
                statusText: 'Completed'
            }
        } else { // BLOCKED
            return {
                status: 'BLOCKED',
                bgStyle: 'bg-red-50/30 border-red-200',
                textColor: 'text-red-700',
                statusText: slot.notes || 'Blocked'
            }
        }
    }, [holidays])

    // Client-side filtering logic
    const filteredSlots = useMemo(() => {
        return slots.filter(slot => {
            const matchesSport = !selectedSport || (slot.sportId && slot.sportId._id === selectedSport)
            const matchesCourt = !selectedCourt || slot.courtName === selectedCourt
            const styles = getStatusStyles(slot)
            const matchesStatus = !selectedStatus || styles.status === selectedStatus
            return matchesSport && matchesCourt && matchesStatus
        })
    }, [slots, selectedSport, selectedCourt, selectedStatus, getStatusStyles])

    // Select slot handler
    const handleSelectSlot = (slot) => {
        let slotDateStr = ''
        if (slot.slotDate) {
            try {
                const parsed = new Date(slot.slotDate)
                if (!isNaN(parsed.getTime())) {
                    slotDateStr = parsed.toISOString().split('T')[0]
                }
            } catch (e) {}
        }
        const isHolidayDate = holidays.some(h => {
            const hDate = h.holidayDate || h.startDate
            if (!hDate) return false
            try {
                const parsed = new Date(hDate)
                return !isNaN(parsed.getTime()) && parsed.toISOString().split('T')[0] === slotDateStr
            } catch (e) {
                return false
            }
        })
        
        if (isHolidayDate) {
            addToast({ title: 'Date Locked', message: 'All booking configurations are blocked on holiday dates', type: 'info' })
            return
        }

        setActiveSlot(slot)
        setActionModal(true)
    }

    // Block/Release/Complete status update handler
    const handleUpdateSlotStatus = async (newStatus) => {
        setIsBookingLoading(true)
        try {
            const notes = newStatus === 'BLOCKED' ? 'Blocked by owner' : ''
            const res = await updateSlotStatus(activeSlot._id, newStatus, notes)
            if (res.success) {
                addToast({
                    title: newStatus === 'BLOCKED' ? 'Slot Blocked' : 'Slot Updated',
                    message: `Time slot is now ${newStatus}`,
                    type: 'success'
                })
                loadSlots()
                setActionModal(false)
            }
        } catch (error) {
            addToast({ title: 'Error', message: error.response?.data?.message || 'Failed to update slot status', type: 'error' })
        } finally {
            setIsBookingLoading(false)
        }
    }

    // Set Custom Slot Price
    const handleUpdateSlotPrice = async (newPrice) => {
        if (!newPrice || Number(newPrice) < 0) {
            addToast({ title: 'Validation Error', message: 'Please specify a valid price rate', type: 'error' })
            return
        }
        setIsBookingLoading(true)
        try {
            const res = await updateSlot(activeSlot._id, {
                regularPrice: Number(newPrice),
                peakPrice: Number(newPrice)
            })
            if (res.success) {
                addToast({ title: 'Pricing Updated', message: `Slot price changed to ₹${newPrice}`, type: 'success' })
                loadSlots()
                setActionModal(false)
            }
        } catch (error) {
            addToast({ title: 'Error', message: error.response?.data?.message || 'Failed to update slot price', type: 'error' })
        } finally {
            setIsBookingLoading(false)
        }
    }

    // Booking Submission
    const handleSaveBooking = async () => {
        if (!bookingData.customerName || !bookingData.customerName.trim()) {
            addToast({ title: 'Validation Error', message: 'Customer Name is required', type: 'error' })
            return
        }
        if (!bookingData.mobileNumber || !bookingData.mobileNumber.trim()) {
            addToast({ title: 'Validation Error', message: 'Mobile Number is required', type: 'error' })
            return
        }

        setIsBookingLoading(true)
        try {
            const bookingNotes = JSON.stringify({
                customerName: bookingData.customerName.trim(),
                mobileNumber: bookingData.mobileNumber.trim(),
                notes: bookingData.notes.trim()
            })
            const res = await updateSlotStatus(activeSlot._id, 'BOOKED', bookingNotes)
            if (res.success) {
                addToast({ title: 'Booking Created', message: 'Booking successfully registered', type: 'success' })
                loadSlots()
                setBookingModal(false)
                setActionModal(false)
                setBookingData({ customerName: '', mobileNumber: '', notes: '' })
            }
        } catch (error) {
            addToast({ title: 'Error', message: error.response?.data?.message || 'Failed to create booking', type: 'error' })
        } finally {
            setIsBookingLoading(false)
        }
    }

    // Custom slot configuration creation
    const handleCreateSlotSubmit = async () => {
        if (!newSlot.sportId) {
            addToast({ title: 'Validation Error', message: 'Sport is required', type: 'error' })
            return
        }
        if (!newSlot.courtName) {
            addToast({ title: 'Validation Error', message: 'Court Name is required', type: 'error' })
            return
        }
        if (!newSlot.startTime || !newSlot.endTime) {
            addToast({ title: 'Validation Error', message: 'Start and End times are required', type: 'error' })
            return
        }

        const startMin = parseTimeToMinutes(newSlot.startTime)
        const endMin = parseTimeToMinutes(newSlot.endTime)
        const duration = endMin - startMin

        if (duration <= 0) {
            addToast({ title: 'Validation Error', message: 'Start time must be chronologically before End time', type: 'error' })
            return
        }

        setIsBookingLoading(true)
        try {
            const payload = {
                branchId: selectedBranchId,
                sportId: newSlot.sportId,
                courtName: newSlot.courtName,
                slotDate: date,
                startTime: newSlot.startTime,
                endTime: newSlot.endTime,
                duration,
                regularPrice: Number(newSlot.regularPrice) || 0,
                peakPrice: Number(newSlot.peakPrice) || 0,
                isPeakHour: newSlot.isPeakHour,
                status: 'AVAILABLE'
            }

            const res = await createSlot(payload)
            if (res.success) {
                addToast({ title: 'Slot Created', message: `Time slot ${newSlot.startTime} successfully registered`, type: 'success' })
                loadSlots()
                setCreateModal(false)
            }
        } catch (error) {
            addToast({ title: 'Error', message: error.response?.data?.message || 'Failed to register slot', type: 'error' })
        } finally {
            setIsBookingLoading(false)
        }
    }

    // Holiday creation
    const handleAddHoliday = async () => {
        if (!newHoliday.date) {
            addToast({ title: 'Validation Error', message: 'Holiday Date is required', type: 'error' })
            return
        }
        if (!newHoliday.reason || !newHoliday.reason.trim()) {
            addToast({ title: 'Validation Error', message: 'Holiday Reason is required', type: 'error' })
            return
        }

        setIsHolidayLoading(true)
        try {
            const res = await createHoliday({
                branchId: selectedBranchId,
                holidayDate: newHoliday.date,
                reason: newHoliday.reason.trim()
            })
            if (res.success) {
                addToast({ title: 'Holiday Added', message: 'Holiday successfully added to branch scheduler', type: 'success' })
                setNewHoliday({ date: '', reason: '' })
                loadBranchConfig()
                loadSlots()
            }
        } catch (error) {
            addToast({ title: 'Error', message: error.response?.data?.message || 'Failed to register holiday', type: 'error' })
        } finally {
            setIsHolidayLoading(false)
        }
    }

    // Holiday deletion
    const handleRemoveHoliday = async (id) => {
        setIsHolidayLoading(true)
        try {
            const res = await deleteHoliday(id)
            if (res.success) {
                addToast({ title: 'Holiday Removed', message: 'Holiday configuration deleted successfully', type: 'info' })
                loadBranchConfig()
                loadSlots()
            }
        } catch (error) {
            addToast({ title: 'Error', message: error.response?.data?.message || 'Failed to delete holiday', type: 'error' })
        } finally {
            setIsHolidayLoading(false)
        }
    }

    if (isPageLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-surface-500 text-sm font-semibold">Loading branch configurations...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Branch Context Selector */}
            {branches.length > 1 && (
                <div className="flex justify-end bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-surface-200/50 shadow-soft">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-surface-600">Active Branch:</span>
                        <Select
                            value={selectedBranchId}
                            onChange={(e) => {
                                setSelectedBranchId(e.target.value)
                                localStorage.setItem('selectedBranchId', e.target.value)
                            }}
                            options={branches.map(b => ({ value: b._id, label: `${b.branchName} (${b.branchCode})` }))}
                            className="w-64"
                        />
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        Timetable & Slot Controller
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Create active booking slots, configure peak rates, or block specific play windows</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setHolidayModal(true)} className="cursor-pointer">
                        Manage Holidays
                    </Button>
                    <Button onClick={() => setCreateModal(true)} className="shadow-lg shadow-primary-500/10 cursor-pointer">
                        <HiPlus className="w-5 h-5 mr-1" /> Create Slot
                    </Button>
                </div>
            </div>

            {/* Timetable Controller Panel */}
            <Card className="p-6">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-surface-100 pb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-2xl text-sm font-semibold outline-none focus:border-emerald-500 transition-colors shadow-soft"
                        />
                        <Select
                            placeholder="All Sports"
                            value={selectedSport}
                            onChange={(e) => setSelectedSport(e.target.value)}
                            options={[
                                { value: '', label: 'All Sports' },
                                ...branchSports.map(s => ({ value: s.sportId?._id || '', label: s.sportId?.name || '' }))
                            ]}
                            className="w-48 shadow-soft"
                        />
                        <Select
                            placeholder="All Courts"
                            value={selectedCourt}
                            onChange={(e) => setSelectedCourt(e.target.value)}
                            options={[
                                { value: '', label: 'All Courts' },
                                ...filterCourtOptions
                            ]}
                            className="w-48 shadow-soft"
                        />
                        <Select
                            placeholder="All Statuses"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            options={[
                                { value: '', label: 'All Statuses' },
                                { value: 'AVAILABLE', label: 'Available' },
                                { value: 'BOOKED', label: 'Booked' },
                                { value: 'BLOCKED', label: 'Blocked' },
                                { value: 'COMPLETED', label: 'Completed' }
                            ]}
                            className="w-48 shadow-soft"
                        />
                    </div>

                    {/* Visual color legend */}
                    <div className="flex gap-4 text-xs font-semibold text-surface-500 bg-surface-50 px-4 py-2.5 rounded-2xl border border-surface-200/60 shadow-soft flex-wrap">
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-lg bg-emerald-50 border border-emerald-250 text-emerald-600 flex items-center justify-center font-black">✓</span> Available</span>
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-lg bg-blue-50 border border-blue-200" /> Booked</span>
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-lg bg-red-50 border border-red-200" /> Blocked</span>
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-lg bg-surface-150 border border-surface-300" /> Completed</span>
                    </div>
                </div>

                {/* Advanced Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {isSlotsLoading ? (
                        Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="bg-surface-50 border border-surface-200 rounded-3xl p-4 h-36 flex flex-col justify-between skeleton-pulse">
                                <div className="flex justify-between items-center">
                                    <div className="h-4 w-4 bg-surface-200 rounded animate-pulse" />
                                    <div className="h-3 w-12 bg-surface-200 rounded animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-10 bg-surface-200 rounded animate-pulse" />
                                    <div className="h-4 w-16 bg-surface-200 rounded animate-pulse" />
                                </div>
                                <div className="h-2 w-12 bg-surface-200 rounded self-end animate-pulse" />
                            </div>
                        ))
                    ) : slots.length === 0 ? (
                        <div className="col-span-full py-8">
                            <EmptyState
                                title="No Slots Found"
                                description="No active booking slots are generated for this date. Check if active sports are configured."
                            />
                        </div>
                    ) : filteredSlots.length === 0 ? (
                        <div className="col-span-full py-8 text-center text-surface-400 font-semibold text-sm border border-dashed border-surface-200 rounded-3xl">
                            No slots match the selected filters.
                        </div>
                    ) : (
                        filteredSlots.map((slot) => {
                            const styles = getStatusStyles(slot)

                            return (
                                <div
                                    key={slot._id}
                                    onClick={() => handleSelectSlot(slot)}
                                    className={`group p-4 border rounded-3xl cursor-pointer text-center transition-all duration-300 flex flex-col justify-between h-36 ${styles.bgStyle}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <HiOutlineClock className={`w-4 h-4 ${styles.status === 'BOOKED' ? 'text-blue-500' : styles.status === 'BLOCKED' ? 'text-red-400' : styles.status === 'COMPLETED' ? 'text-surface-400' : 'text-emerald-500'}`} />
                                        <span className="text-xs font-black text-surface-800">{formatTo12Hour(slot.startTime)}</span>
                                    </div>
                                    <div className="mt-2 text-left">
                                        <p className="text-[10px] text-surface-400 font-extrabold uppercase tracking-wider">
                                            {styles.status === 'BOOKED' ? 'Reserved' : styles.status === 'BLOCKED' ? 'Blocked Reason' : styles.status === 'COMPLETED' ? 'Archive' : 'Rate Status'}
                                        </p>
                                        <p className={`text-sm font-extrabold truncate ${styles.textColor}`}>{styles.statusText}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 border-t border-surface-100/30 pt-2">
                                        <span className="text-[10px] text-surface-450 font-bold">{slot.courtName}</span>
                                        {styles.status === 'AVAILABLE' && (
                                            <div className="text-[10px] text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                Configure →
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </Card>

            {/* Individual Slot configuration modal */}
            {activeSlot && (
                <Modal isOpen={actionModal} onClose={() => setActionModal(false)} title={`Configure Slot : ${formatTo12Hour(activeSlot.startTime)}`} size="sm">
                    <div className="space-y-4">
                        <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 text-xs space-y-1">
                            <p className="font-bold text-surface-700">Slot Status: <span className="uppercase text-primary-600 font-extrabold">{activeSlot.status}</span></p>
                            {activeSlot.status === 'BOOKED' && (
                                <>
                                    <p className="font-bold text-surface-600">Reserved Customer: <span className="text-surface-900 font-extrabold">{getBookedByName(activeSlot.notes)}</span></p>
                                    {(() => {
                                        try {
                                            const parsed = JSON.parse(activeSlot.notes);
                                            if (parsed && parsed.mobileNumber) {
                                                return <p className="font-bold text-surface-600">Contact Number: <span className="text-surface-900 font-extrabold">{parsed.mobileNumber}</span></p>
                                            }
                                        } catch (e) {}
                                        return null;
                                    })()}
                                </>
                            )}
                            <p className="font-bold text-surface-600">Base Fare: <span className="text-surface-900 font-extrabold">₹{activeSlot.isPeakHour ? activeSlot.peakPrice : activeSlot.regularPrice}/hr</span></p>
                        </div>

                        {/* Adjust slot fare */}
                        <div>
                            <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Set Custom Rate (₹/hr)</label>
                            <div className="flex gap-2 mt-1.5">
                                <Input
                                    type="number"
                                    defaultValue={activeSlot.isPeakHour ? activeSlot.peakPrice : activeSlot.regularPrice}
                                    id="custom-price-input"
                                    placeholder="800"
                                    className="flex-1"
                                />
                                <Button
                                    onClick={() => {
                                        const el = document.getElementById('custom-price-input')
                                        if (el) handleUpdateSlotPrice(el.value)
                                    }}
                                    disabled={isBookingLoading}
                                    className="cursor-pointer"
                                >
                                    Update Price
                                </Button>
                            </div>
                        </div>

                        {/* Adjust slot status actions */}
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-surface-100">
                            {activeSlot.status === 'AVAILABLE' ? (
                                <>
                                    <Button onClick={() => handleUpdateSlotStatus('BLOCKED')} variant="outline" className="text-red-550 border-red-200 cursor-pointer">
                                        <HiBan className="mr-1.5 w-4 h-4" /> Block Slot
                                    </Button>
                                    <Button onClick={() => {
                                        setBookingModal(true);
                                    }} className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
                                        <HiCheckCircle className="mr-1.5 w-4 h-4" /> Book Slot
                                    </Button>
                                </>
                            ) : activeSlot.status === 'BOOKED' ? (
                                <>
                                    <Button onClick={() => handleUpdateSlotStatus('AVAILABLE')} variant="outline" className="cursor-pointer" disabled={isBookingLoading}>
                                        Unlock Slot
                                    </Button>
                                    <Button onClick={() => handleUpdateSlotStatus('COMPLETED')} className="bg-gray-650 hover:bg-gray-700 text-white cursor-pointer" disabled={isBookingLoading}>
                                        <HiCheck className="mr-1.5 w-4 h-4" /> Complete Slot
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => handleUpdateSlotStatus('AVAILABLE')} variant="outline" fullWidth className="col-span-2 cursor-pointer" disabled={isBookingLoading}>
                                    Release/Unlock Slot
                                </Button>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {/* Booking Modal */}
            {activeSlot && (
                <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title="Create Customer Booking" size="md">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Sport"
                                value={activeSlot.sportId?.name || ''}
                                readOnly
                                className="bg-surface-50 font-bold"
                            />
                            <Input
                                label="Court/Field"
                                value={activeSlot.courtName || ''}
                                readOnly
                                className="bg-surface-50 font-bold"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Input
                                label="Date"
                                value={activeSlot.slotDate ? new Date(activeSlot.slotDate).toLocaleDateString('en-IN') : ''}
                                readOnly
                                className="bg-surface-50 font-bold"
                            />
                            <Input
                                label="Start Time"
                                value={activeSlot.startTime || ''}
                                readOnly
                                className="bg-surface-50 font-bold"
                            />
                            <Input
                                label="End Time"
                                value={activeSlot.endTime || ''}
                                readOnly
                                className="bg-surface-50 font-bold"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Customer Name *"
                                placeholder="Enter customer name"
                                value={bookingData.customerName}
                                onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                            />
                            <Input
                                label="Mobile Number *"
                                placeholder="Enter mobile number"
                                value={bookingData.mobileNumber}
                                onChange={(e) => setBookingData({ ...bookingData, mobileNumber: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Booking Amount (₹)"
                                value={activeSlot.isPeakHour ? activeSlot.peakPrice : activeSlot.regularPrice}
                                readOnly
                                className="bg-surface-50 font-bold"
                            />
                            <Input
                                label="Duration (mins)"
                                value={activeSlot.duration || ''}
                                readOnly
                                className="bg-surface-50 font-bold"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-surface-600 mb-1">Notes</label>
                            <textarea
                                placeholder="Any booking notes/comments"
                                value={bookingData.notes}
                                onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-2xl text-sm font-semibold outline-none focus:border-emerald-500 transition-colors shadow-soft min-h-[80px]"
                            />
                        </div>
                        <div className="flex gap-3 justify-end pt-4 border-t border-surface-100">
                            <Button variant="secondary" onClick={() => setBookingModal(false)}>Cancel</Button>
                            <Button onClick={handleSaveBooking} disabled={isBookingLoading}>
                                {isBookingLoading ? 'Booking...' : 'Save Booking'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Create slot modal */}
            <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Register Custom Slot" size="sm">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Start Time *"
                            type="time"
                            value={newSlot.startTime}
                            onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                        />
                        <Input
                            label="End Time *"
                            type="time"
                            value={newSlot.endTime}
                            onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                        />
                    </div>
                    <Select
                        label="Sport *"
                        value={newSlot.sportId}
                        onChange={(e) => {
                            setNewSlot({ ...newSlot, sportId: e.target.value })
                        }}
                        options={branchSports.map(s => {
                            const val = typeof s.sportId === 'object' ? (s.sportId?._id || s.sportId?.id) : (s.sportId || s._id)
                            const lbl = typeof s.sportId === 'object' ? (s.sportId?.name || s.name) : (s.name || 'Sport')
                            return { value: val, label: lbl }
                        })}
                    />
                    <Select
                        label="Apply to Field/Court *"
                        value={newSlot.courtName}
                        onChange={(e) => setNewSlot({ ...newSlot, courtName: e.target.value })}
                        options={courtOptions}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Regular Price (₹) *"
                            type="number"
                            value={newSlot.regularPrice}
                            onChange={(e) => setNewSlot({ ...newSlot, regularPrice: e.target.value })}
                        />
                        <Input
                            label="Peak Price (₹) *"
                            type="number"
                            value={newSlot.peakPrice}
                            onChange={(e) => setNewSlot({ ...newSlot, peakPrice: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-2 py-1">
                        <input
                            type="checkbox"
                            id="is-peak-checkbox"
                            checked={newSlot.isPeakHour}
                            onChange={(e) => setNewSlot({ ...newSlot, isPeakHour: e.target.checked })}
                            className="rounded border-surface-200 text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor="is-peak-checkbox" className="text-xs font-semibold text-surface-700">Mark as Peak Hour</label>
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-surface-100">
                        <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
                        <Button onClick={handleCreateSlotSubmit} disabled={isBookingLoading}>
                            {isBookingLoading ? 'Creating...' : 'Create Slot'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Holiday Management Modal */}
            <Modal isOpen={holidayModal} onClose={() => setHolidayModal(false)} title="Branch Holiday Configuration" size="md">
                <div className="space-y-4 animate-in fade-in">
                    <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-3">
                        <h4 className="text-xs font-black uppercase text-surface-600 tracking-wider">Schedule a Holiday</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="date"
                                value={newHoliday.date}
                                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                            />
                            <Input
                                placeholder="e.g. Holi Festival"
                                value={newHoliday.reason}
                                onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })}
                            />
                        </div>
                        <Button onClick={handleAddHoliday} disabled={isHolidayLoading} size="sm" className="w-full mt-2 cursor-pointer">
                            {isHolidayLoading ? 'Registering...' : 'Register Holiday'}
                        </Button>
                    </div>

                    <div className="space-y-2 mt-4">
                        <h4 className="text-xs font-black text-surface-500 uppercase tracking-wider mb-2">Registered Holidays</h4>
                        {isHolidayLoading && holidays.length === 0 ? (
                            <div className="text-center py-4 text-xs text-surface-400 font-semibold animate-pulse">Loading holidays...</div>
                        ) : holidays.length === 0 ? (
                            <div className="text-center py-4 text-xs text-surface-400 font-semibold border border-dashed border-surface-200 rounded-2xl">No holidays scheduled</div>
                        ) : (
                            holidays.map(h => {
                                const formattedDate = h.holidayDate ? new Date(h.holidayDate).toLocaleDateString('en-IN') : ''
                                return (
                                    <div key={h._id} className="flex items-center justify-between p-4 bg-white border border-surface-200 rounded-2xl shadow-soft">
                                        <div>
                                            <span className="text-xs font-black text-surface-900 block">{h.reason}</span>
                                            <span className="text-[10px] text-surface-400 font-bold block mt-0.5">{formattedDate}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveHoliday(h._id)} 
                                            disabled={isHolidayLoading}
                                            className="px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-650 cursor-pointer transition-colors disabled:opacity-50"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )
                            })
                        )}
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-surface-100 mt-6">
                        <Button variant="secondary" onClick={() => setHolidayModal(false)}>Close</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
