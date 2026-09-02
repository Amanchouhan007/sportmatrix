import { useState, useEffect, useCallback, useMemo } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import CustomSelect from '../../components/ui/CustomSelect'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import PageLoader from '../../components/ui/PageLoader'
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
        slotName: 'Evening Prime Slot',
        startTime: '18:00',
        endTime: '19:00',
        sportId: '',
        courtName: '',
        slotType: 'Regular', // Regular | Peak | Tournament | Practice | Maintenance | Private
        regularPrice: 800,
        peakPrice: 1200,
        gstPercent: 18,
        applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        repeat: 'Weekly', // One Time | Daily | Weekly | Monthly
        repeatInterval: 1,
        startDate: getLocalDateString(),
        endDate: '',
        minDuration: 60, // mins
        maxDuration: 240, // mins
        bookingWindow: 7, // days advance
        bufferTime: 15, // mins
        maxConcurrentBookings: 1,
        minPlayers: 4,
        maxPlayers: 14,
        holidayPricing: true,
        weekendPricing: true,
        membershipDiscount: true,
        promoCodeEligible: true,
        slotStatus: 'Available', // Available | Blocked | Maintenance | Hidden
        cancellationAllowed: true,
        cancellationDeadline: '24 Hours Before',
        autoConfirmation: true,
        internalNotes: '',
        bookingInstructions: ''
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
                    const branchesRes = await getBranches()
                    let branchList = branchesRes?.data?.data?.branches || branchesRes?.data?.branches || branchesRes?.branches || (Array.isArray(branchesRes?.data?.data) ? branchesRes.data.data : (Array.isArray(branchesRes?.data) ? branchesRes.data : []))
                    if (Array.isArray(branchList) && branchList.length > 0) {
                        setBranches(branchList)

                        let activeBranch = selectedBranchId || user.branchId || (branchList[0] ? (branchList[0].id || branchList[0]._id) : '')
                        const exists = branchList.some(b => (b.id || b._id) === activeBranch)
                        if (!exists && branchList[0]) {
                            activeBranch = branchList[0].id || branchList[0]._id
                        }
                        if (activeBranch) {
                            setSelectedBranchId(activeBranch)
                            localStorage.setItem('selectedBranchId', activeBranch)
                        }
                    } else {
                        const fallbackBranch = selectedBranchId || user?.branchId || 'br_1787426001925_85151'
                        setSelectedBranchId(fallbackBranch)
                        localStorage.setItem('selectedBranchId', fallbackBranch)
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
            const slotList = slotsRes?.data || (Array.isArray(slotsRes) ? slotsRes : [])
            if (Array.isArray(slotList)) {
                setSlots(slotList)
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
            const slotSportId = typeof slot.sportId === 'object' ? (slot.sportId?.id || slot.sportId?._id) : slot.sportId
            const matchesSport = !selectedSport || (slotSportId === selectedSport)
            const matchesCourt = !selectedCourt || slot.courtName === selectedCourt
            const styles = getStatusStyles(slot)
            const matchesStatus = !selectedStatus || styles.status === selectedStatus
            return matchesSport && matchesCourt && matchesStatus
        })
    }, [slots, selectedSport, selectedCourt, selectedStatus, getStatusStyles])

    // KPI Summary statistics
    const stats = useMemo(() => {
        const total = slots.length
        const available = slots.filter(s => s.status === 'AVAILABLE').length
        const booked = slots.filter(s => s.status === 'BOOKED').length
        const blocked = slots.filter(s => s.status === 'BLOCKED').length
        const totalRevenue = slots.reduce((acc, s) => {
            if (s.status === 'BOOKED') {
                return acc + Number(s.price || s.peakPrice || s.regularPrice || 1000)
            }
            return acc
        }, 0)
        return { total, available, booked, blocked, totalRevenue }
    }, [slots])

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

    // Save Slot Draft handler
    const handleSaveSlotDraft = () => {
        addToast({ title: 'Draft Saved', message: `Slot configuration "${newSlot.slotName || 'Custom Slot'}" saved as draft`, type: 'success' })
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

        if (Number(newSlot.regularPrice) < 0 || Number(newSlot.peakPrice) < 0) {
            addToast({ title: 'Validation Error', message: 'Prices cannot be negative', type: 'error' })
            return
        }

        // Validate duplicate / overlapping slots for same court & time
        const overlapping = slots.find(s => {
            if (s.courtName !== newSlot.courtName) return false
            const sStart = parseTimeToMinutes(s.startTime)
            const sEnd = parseTimeToMinutes(s.endTime)
            return (startMin < sEnd && endMin > sStart)
        })

        if (overlapping) {
            addToast({ 
                title: 'Slot Overlap Warning', 
                message: `Warning: Slot overlaps with existing slot (${overlapping.startTime} - ${overlapping.endTime}) on ${newSlot.courtName}`, 
                type: 'warning' 
            })
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
                isPeakHour: newSlot.slotType === 'Peak',
                status: newSlot.slotStatus === 'Maintenance' ? 'MAINTENANCE' : newSlot.slotStatus === 'Blocked' ? 'BLOCKED' : 'AVAILABLE',
                meta: {
                    slotName: newSlot.slotName,
                    slotType: newSlot.slotType,
                    applicableDays: newSlot.applicableDays,
                    minPlayers: newSlot.minPlayers,
                    maxPlayers: newSlot.maxPlayers,
                    gstPercent: newSlot.gstPercent,
                    notes: newSlot.internalNotes
                }
            }

            const res = await createSlot(payload)
            if (res.success) {
                addToast({ title: 'Slot Created', message: `Slot "${newSlot.slotName}" (${newSlot.startTime} - ${newSlot.endTime}) successfully registered`, type: 'success' })
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
        return <PageLoader text="Loading branch configurations..." />
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

            {/* Header & Stats Banner */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-slate-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-black uppercase tracking-wider">
                                ⚡ Live Timetable Engine
                            </span>
                            <span className="text-xs text-slate-400 font-medium">Auto-synced with Customer Bookings</span>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2">
                            📅 Timetable & Slot Controller
                        </h1>
                        <p className="text-slate-400 text-xs mt-0.5 font-medium">
                            Configure peak rates, lock play windows, or register custom court slots for your turf.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setHolidayModal(true)} className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer">
                            Manage Holidays
                        </Button>
                        <Button onClick={() => setCreateModal(true)} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20 cursor-pointer">
                            <HiPlus className="w-5 h-5 mr-1" /> + Create Slot
                        </Button>
                    </div>
                </div>

                {/* KPI Summary Cards Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Day Slots</span>
                            <div className="text-xl font-black text-slate-900 mt-0.5">{stats.total} Slots</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-base">
                            ⏱️
                        </div>
                    </div>
                    <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Available Bookable</span>
                            <div className="text-xl font-black text-emerald-950 mt-0.5">{stats.available} Open</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
                            ✓
                        </div>
                    </div>
                    <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">Reserved Bookings</span>
                            <div className="text-xl font-black text-blue-950 mt-0.5">{stats.booked} Reserved</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                            🔒
                        </div>
                    </div>
                    <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">Est. Booking Revenue</span>
                            <div className="text-xl font-black text-amber-950 mt-0.5">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
                            💰
                        </div>
                    </div>
                </div>
            </div>

            {/* Timetable Controller Panel */}
            <Card className="p-6">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-surface-100 pb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-2xl font-bold text-xs shadow-sm">
                            <span className="text-emerald-400">📅</span>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
                            />
                        </div>

                        <Select
                            placeholder="All Sports"
                            value={selectedSport}
                            onChange={(e) => setSelectedSport(e.target.value)}
                            options={[
                                { value: '', label: 'All Sports' },
                                ...branchSports.map(s => {
                                    const sId = typeof s.sportId === 'object' ? (s.sportId?.id || s.sportId?._id) : (s.sportId || s.id || s._id);
                                    const sName = typeof s.sportId === 'object' ? s.sportId?.name : (s.name || 'Cricket');
                                    return { value: sId || '', label: `🏏 ${sName}` };
                                })
                            ]}
                            className="w-44 shadow-soft text-xs"
                        />
                        <Select
                            placeholder="All Courts"
                            value={selectedCourt}
                            onChange={(e) => setSelectedCourt(e.target.value)}
                            options={[
                                { value: '', label: 'All Courts' },
                                ...filterCourtOptions
                            ]}
                            className="w-44 shadow-soft text-xs"
                        />
                        <Select
                            placeholder="All Statuses"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            options={[
                                { value: '', label: 'All Statuses' },
                                { value: 'AVAILABLE', label: '✓ Available' },
                                { value: 'BOOKED', label: '🔒 Booked' },
                                { value: 'BLOCKED', label: '⛔ Blocked' },
                                { value: 'COMPLETED', label: '🏁 Completed' }
                            ]}
                            className="w-44 shadow-soft text-xs"
                        />
                    </div>

                    {/* Visual color legend */}
                    <div className="flex gap-3 text-xs font-black text-slate-700 bg-slate-100/80 px-4 py-2 rounded-2xl border border-slate-200 shadow-soft flex-wrap">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600" /> Available</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 border border-blue-700" /> Booked</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-600" /> Blocked</span>
                    </div>
                </div>

                {/* Advanced Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
                        <div className="col-span-full py-12">
                            <EmptyState
                                title="No Active Slots Configured"
                                description="No active booking slots were found for this date. Ensure active sports are configured in Sports Setup."
                            />
                        </div>
                    ) : filteredSlots.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-500 font-bold text-sm border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                            🔍 No slots match your selected filters (Sport / Court / Status).
                        </div>
                    ) : (
                        filteredSlots.map((slot) => {
                            const styles = getStatusStyles(slot)
                            const isBooked = styles.status === 'BOOKED'
                            const isBlocked = styles.status === 'BLOCKED'
                            const isCompleted = styles.status === 'COMPLETED'
                            const isPeak = slot.isPeakHour

                            let cardBg = 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10'
                            let badgeBg = 'bg-emerald-500 text-slate-950 font-black'
                            let badgeText = `₹${slot.isPeakHour ? slot.peakPrice : slot.regularPrice}`

                            if (isBooked) {
                                cardBg = 'bg-blue-50/80 border-blue-300 shadow-sm'
                                badgeBg = 'bg-blue-600 text-white font-black'
                                badgeText = '🔒 RESERVED'
                            } else if (isBlocked) {
                                cardBg = 'bg-rose-50/70 border-rose-200'
                                badgeBg = 'bg-rose-600 text-white font-black'
                                badgeText = '⛔ BLOCKED'
                            } else if (isCompleted) {
                                cardBg = 'bg-slate-100 border-slate-200 opacity-60'
                                badgeBg = 'bg-slate-400 text-white font-bold'
                                badgeText = '🏁 PAST'
                            }

                            return (
                                <div
                                    key={slot._id}
                                    onClick={() => handleSelectSlot(slot)}
                                    className={`group p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between h-40 ${cardBg}`}
                                >
                                    {/* Slot Header: Time & Peak Badge */}
                                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                        <div className="flex items-center gap-1.5">
                                            <HiOutlineClock className={`w-4 h-4 ${isBooked ? 'text-blue-600' : isBlocked ? 'text-rose-500' : 'text-emerald-600'}`} />
                                            <span className="text-xs font-black text-slate-900 tracking-tight">
                                                {formatTo12Hour(slot.startTime)}
                                            </span>
                                        </div>
                                        {isPeak && !isBooked && !isBlocked && (
                                            <span className="text-[10px] bg-amber-500/20 text-amber-800 border border-amber-500/30 px-1.5 py-0.5 rounded-md font-black">
                                                🔥 Peak
                                            </span>
                                        )}
                                    </div>

                                    {/* Middle Section: Status / Price Card */}
                                    <div className="my-2">
                                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                                            {isBooked ? 'Customer Reservation' : isBlocked ? 'Status' : isPeak ? 'Peak Hour Rate' : 'Regular Rate'}
                                        </div>
                                        <div className={`text-base font-black truncate ${isBooked ? 'text-blue-900' : isBlocked ? 'text-rose-700' : 'text-emerald-950'}`}>
                                            {isBooked ? (styles.statusText || 'Booked') : `₹${slot.isPeakHour ? slot.peakPrice : slot.regularPrice} / hr`}
                                        </div>
                                    </div>

                                    {/* Footer: Court Name & Action */}
                                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px]">
                                        <span className="font-extrabold text-slate-600">{slot.courtName || 'Court 1'}</span>
                                        <span className="text-[10px] font-black text-emerald-600 group-hover:underline">
                                            {isBooked ? 'View Details' : 'Manage →'}
                                        </span>
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

            {/* Enterprise Register Custom Slot Modal */}
            <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Register Custom Slot" size="page">
                <div className="space-y-6 text-left">
                    
                    {/* LIVE PREVIEW SUMMARY CARD */}
                    <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-xs space-y-2 font-bold text-emerald-950 shadow-sm">
                        <div className="flex justify-between items-center border-b border-emerald-200/60 pb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">⚙️</span>
                                <div>
                                    <h5 className="font-black text-sm text-emerald-950 leading-tight">{newSlot.slotName || 'Custom Slot'}</h5>
                                    <span className="text-[10px] text-emerald-700 font-extrabold">
                                        {branchSports.find(s => (s.sportId?.id || s.sportId?._id || s.sportId || s.id || s._id) === newSlot.sportId)?.name || 'Cricket'} • {newSlot.courtName || 'Court 1'}
                                    </span>
                                </div>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                                newSlot.slotStatus === 'Available' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                            }`}>
                                {newSlot.slotStatus}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                            <div>
                                <span className="text-emerald-700 text-[9px] uppercase block font-extrabold">Time & Type</span>
                                <span className="font-extrabold text-emerald-900">{formatTo12Hour(newSlot.startTime)} – {formatTo12Hour(newSlot.endTime)} ({newSlot.slotType})</span>
                            </div>
                            <div>
                                <span className="text-emerald-700 text-[9px] uppercase block font-extrabold">Applicable Days</span>
                                <span className="font-extrabold text-emerald-900 truncate">
                                    {newSlot.applicableDays.length === 7 ? 'All 7 Days' : newSlot.applicableDays.join(', ')}
                                </span>
                            </div>
                            <div>
                                <span className="text-emerald-700 text-[9px] uppercase block font-extrabold">Rate (+{newSlot.gstPercent}% GST)</span>
                                <span className="font-black text-emerald-950">₹{newSlot.slotType === 'Peak' ? newSlot.peakPrice : newSlot.regularPrice}</span>
                            </div>
                            <div>
                                <span className="text-emerald-700 text-[9px] uppercase block font-extrabold">Players Limit</span>
                                <span className="font-extrabold text-emerald-900">{newSlot.minPlayers} - {newSlot.maxPlayers} Players</span>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 1 – BASIC INFORMATION */}
                    <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-3">
                        <div className="text-xs font-black text-surface-800 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="text-emerald-600">1.</span> Basic Information
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                                label="Slot Name *"
                                placeholder="e.g. Evening Prime Slot"
                                value={newSlot.slotName}
                                onChange={(e) => setNewSlot({ ...newSlot, slotName: e.target.value })}
                            />
                            <Select
                                label="Slot Type *"
                                value={newSlot.slotType}
                                onChange={(e) => setNewSlot({ ...newSlot, slotType: e.target.value })}
                                options={[
                                    { value: 'Regular', label: 'Regular' },
                                    { value: 'Peak', label: '🔥 Peak' },
                                    { value: 'Tournament', label: '🏆 Tournament' },
                                    { value: 'Practice', label: '🎯 Practice' },
                                    { value: 'Maintenance', label: '🛠️ Maintenance' },
                                    { value: 'Private', label: '🔒 Private' }
                                ]}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Select
                                label="Sport *"
                                value={newSlot.sportId}
                                onChange={(e) => setNewSlot({ ...newSlot, sportId: e.target.value })}
                                options={branchSports.length > 0 ? branchSports.map(bs => {
                                    const sId = typeof bs.sportId === 'object' ? (bs.sportId?.id || bs.sportId?._id) : (bs.sportId || bs.id || bs._id);
                                    const sName = typeof bs.sportId === 'object' ? bs.sportId?.name : (bs.name || 'Cricket');
                                    return {
                                        value: sId,
                                        label: `🏏 ${sName}`
                                    };
                                }) : [{ value: 'sp_master_02', label: '🏏 Cricket' }]}
                            />
                            <Select
                                label="Apply to Field/Court *"
                                value={newSlot.courtName}
                                onChange={(e) => setNewSlot({ ...newSlot, courtName: e.target.value })}
                                options={courtOptions}
                            />
                        </div>
                    </div>

                    {/* SECTION 2 – APPLICABLE DAYS */}
                    <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="text-xs font-black text-surface-800 uppercase tracking-wider">
                                <span className="text-emerald-600">2.</span> Applicable Days
                            </div>
                            <div className="flex gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setNewSlot({ ...newSlot, applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] })}
                                    className="px-2 py-1 bg-white border border-surface-200 rounded-lg text-[10px] font-extrabold hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer"
                                >
                                    All Days
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewSlot({ ...newSlot, applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] })}
                                    className="px-2 py-1 bg-white border border-surface-200 rounded-lg text-[10px] font-extrabold hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer"
                                >
                                    Weekdays
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewSlot({ ...newSlot, applicableDays: ['Saturday', 'Sunday'] })}
                                    className="px-2 py-1 bg-white border border-surface-200 rounded-lg text-[10px] font-extrabold hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer"
                                >
                                    Weekends
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                const isSel = newSlot.applicableDays.includes(day)
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => {
                                            const updated = isSel
                                                ? newSlot.applicableDays.filter(d => d !== day)
                                                : [...newSlot.applicableDays, day]
                                            setNewSlot({ ...newSlot, applicableDays: updated })
                                        }}
                                        className={`px-3 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                                            isSel
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                : 'bg-white text-surface-600 border-surface-200 hover:bg-surface-100'
                                        }`}
                                    >
                                        {day.slice(0, 3)}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* SECTION 3 – RECURRENCE */}
                    <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-3">
                        <div className="text-xs font-black text-surface-800 uppercase tracking-wider">
                            <span className="text-emerald-600">3.</span> Recurrence Configuration
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <Select
                                label="Repeat"
                                value={newSlot.repeat}
                                onChange={(e) => setNewSlot({ ...newSlot, repeat: e.target.value })}
                                options={[
                                    { value: 'One Time', label: 'One Time' },
                                    { value: 'Daily', label: 'Daily' },
                                    { value: 'Weekly', label: 'Weekly' },
                                    { value: 'Monthly', label: 'Monthly' }
                                ]}
                            />
                            <Input
                                label="Repeat Interval"
                                type="number"
                                value={newSlot.repeatInterval}
                                onChange={(e) => setNewSlot({ ...newSlot, repeatInterval: e.target.value })}
                            />
                            <Input
                                label="Effective Start Date"
                                type="date"
                                value={newSlot.startDate}
                                onChange={(e) => setNewSlot({ ...newSlot, startDate: e.target.value })}
                            />
                            <Input
                                label="Effective End Date"
                                type="date"
                                value={newSlot.endDate}
                                onChange={(e) => setNewSlot({ ...newSlot, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* SECTION 4 – BOOKING RULES & SECTION 5 – PLAYER CONFIGURATION */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-3">
                            <div className="text-xs font-black text-surface-800 uppercase tracking-wider">
                                <span className="text-emerald-600">4.</span> Booking Rules
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-surface-600 mb-1 uppercase">Min Duration</label>
                                    <select
                                        value={newSlot.minDuration}
                                        onChange={(e) => setNewSlot({ ...newSlot, minDuration: Number(e.target.value) })}
                                        className="w-full p-2 text-xs font-extrabold bg-white border border-surface-200 rounded-xl outline-none"
                                    >
                                        <option value={30}>30 Mins</option>
                                        <option value={60}>60 Mins (1 Hr)</option>
                                        <option value={90}>90 Mins</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-surface-600 mb-1 uppercase">Max Duration</label>
                                    <select
                                        value={newSlot.maxDuration}
                                        onChange={(e) => setNewSlot({ ...newSlot, maxDuration: Number(e.target.value) })}
                                        className="w-full p-2 text-xs font-extrabold bg-white border border-surface-200 rounded-xl outline-none"
                                    >
                                        <option value={120}>120 Mins (2 Hr)</option>
                                        <option value={180}>180 Mins (3 Hr)</option>
                                        <option value={240}>240 Mins (4 Hr)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-[9px] font-bold text-surface-600 mb-1 uppercase">Booking Window</label>
                                    <select
                                        value={newSlot.bookingWindow}
                                        onChange={(e) => setNewSlot({ ...newSlot, bookingWindow: Number(e.target.value) })}
                                        className="w-full p-2 text-xs font-extrabold bg-white border border-surface-200 rounded-xl outline-none"
                                    >
                                        <option value={1}>1 Day</option>
                                        <option value={7}>7 Days</option>
                                        <option value={14}>14 Days</option>
                                        <option value={30}>30 Days</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-surface-600 mb-1 uppercase">Buffer Time</label>
                                    <select
                                        value={newSlot.bufferTime}
                                        onChange={(e) => setNewSlot({ ...newSlot, bufferTime: Number(e.target.value) })}
                                        className="w-full p-2 text-xs font-extrabold bg-white border border-surface-200 rounded-xl outline-none"
                                    >
                                        <option value={0}>0 Mins</option>
                                        <option value={15}>15 Mins</option>
                                        <option value={30}>30 Mins</option>
                                    </select>
                                </div>
                                <Input
                                    label="Max Concurrent"
                                    type="number"
                                    value={newSlot.maxConcurrentBookings}
                                    onChange={(e) => setNewSlot({ ...newSlot, maxConcurrentBookings: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-3">
                            <div className="text-xs font-black text-surface-800 uppercase tracking-wider">
                                <span className="text-emerald-600">5.</span> Player Configuration
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Minimum Players"
                                    type="number"
                                    value={newSlot.minPlayers}
                                    onChange={(e) => setNewSlot({ ...newSlot, minPlayers: e.target.value })}
                                />
                                <Input
                                    label="Maximum Players"
                                    type="number"
                                    value={newSlot.maxPlayers}
                                    onChange={(e) => setNewSlot({ ...newSlot, maxPlayers: e.target.value })}
                                />
                            </div>

                            {/* SECTION 7 – SLOT STATUS */}
                            <div>
                                <label className="block text-xs font-bold text-surface-700 mb-1 uppercase tracking-wider">7. Slot Status</label>
                                <select
                                    value={newSlot.slotStatus}
                                    onChange={(e) => setNewSlot({ ...newSlot, slotStatus: e.target.value })}
                                    className="w-full p-2.5 text-xs font-extrabold bg-white border border-surface-200 rounded-xl outline-none cursor-pointer"
                                >
                                    <option value="Available">✅ Available</option>
                                    <option value="Blocked">🛑 Blocked</option>
                                    <option value="Maintenance">🛠️ Maintenance</option>
                                    <option value="Hidden">👁️‍🗨️ Hidden</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 6 – PRICING OPTIONS */}
                    <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-3">
                        <div className="text-xs font-black text-surface-800 uppercase tracking-wider">
                            <span className="text-emerald-600">6.</span> Pricing & Tax Configuration
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                            <Input
                                label="GST (%)"
                                type="number"
                                value={newSlot.gstPercent}
                                onChange={(e) => setNewSlot({ ...newSlot, gstPercent: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            {[
                                { key: 'holidayPricing', label: 'Holiday Rate' },
                                { key: 'weekendPricing', label: 'Weekend Rate' },
                                { key: 'membershipDiscount', label: 'Member Disc.' },
                                { key: 'promoCodeEligible', label: 'Promo Eligible' },
                            ].map(item => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => setNewSlot({ ...newSlot, [item.key]: !newSlot[item.key] })}
                                    className={`p-2 rounded-xl border text-left text-xs font-extrabold transition-all cursor-pointer flex justify-between items-center ${
                                        newSlot[item.key]
                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                            : 'bg-white border-surface-200 text-surface-500'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                    <span>{newSlot[item.key] ? 'ON' : 'OFF'}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 8 – CANCELLATION */}
                    <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-3">
                        <div className="text-xs font-black text-surface-800 uppercase tracking-wider">
                            <span className="text-emerald-600">8.</span> Cancellation Policy
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                            <button
                                type="button"
                                onClick={() => setNewSlot({ ...newSlot, cancellationAllowed: !newSlot.cancellationAllowed })}
                                className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer flex justify-between items-center ${
                                    newSlot.cancellationAllowed ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-white border-surface-200 text-surface-500'
                                }`}
                            >
                                <span>Allow Cancellation</span>
                                <span>{newSlot.cancellationAllowed ? 'YES' : 'NO'}</span>
                            </button>

                            <div>
                                <label className="block text-[10px] font-bold text-surface-600 mb-1 uppercase">Deadline</label>
                                <select
                                    value={newSlot.cancellationDeadline}
                                    onChange={(e) => setNewSlot({ ...newSlot, cancellationDeadline: e.target.value })}
                                    className="w-full p-2 text-xs font-extrabold bg-white border border-surface-200 rounded-xl outline-none"
                                >
                                    <option value="12 Hours Before">12 Hours Before</option>
                                    <option value="24 Hours Before">24 Hours Before</option>
                                    <option value="48 Hours Before">48 Hours Before</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={() => setNewSlot({ ...newSlot, autoConfirmation: !newSlot.autoConfirmation })}
                                className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer flex justify-between items-center ${
                                    newSlot.autoConfirmation ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-white border-surface-200 text-surface-500'
                                }`}
                            >
                                <span>Auto Confirmation</span>
                                <span>{newSlot.autoConfirmation ? 'ON' : 'OFF'}</span>
                            </button>
                        </div>
                    </div>

                    {/* SECTION 9 – NOTES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-surface-700 mb-1 uppercase">Internal Notes</label>
                            <textarea
                                rows={2}
                                placeholder="Staff internal notes..."
                                value={newSlot.internalNotes}
                                onChange={(e) => setNewSlot({ ...newSlot, internalNotes: e.target.value })}
                                className="w-full p-2.5 text-xs font-medium bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-surface-700 mb-1 uppercase">Booking Instructions</label>
                            <textarea
                                rows={2}
                                placeholder="Customer booking instructions..."
                                value={newSlot.bookingInstructions}
                                onChange={(e) => setNewSlot({ ...newSlot, bookingInstructions: e.target.value })}
                                className="w-full p-2.5 text-xs font-medium bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* FOOTER BUTTONS */}
                    <div className="flex gap-3 justify-end pt-4 border-t border-surface-100">
                        <Button variant="secondary" onClick={() => setCreateModal(false)} className="cursor-pointer">
                            Cancel
                        </Button>
                        <Button variant="outline" onClick={handleSaveSlotDraft} className="cursor-pointer font-bold border-surface-300">
                            Save Draft
                        </Button>
                        <Button onClick={handleCreateSlotSubmit} disabled={isBookingLoading} className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white">
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
