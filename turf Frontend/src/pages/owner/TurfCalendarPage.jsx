import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { 
    HiCalendar, HiClock, HiCurrencyRupee, HiUser, HiPlus, HiChevronLeft, HiChevronRight, HiChevronDown,
    HiCheckCircle, HiBan, HiFilter, HiX, HiDotsVertical, HiPencil, HiTrash, HiDocumentText,
    HiLocationMarker, HiEye, HiRefresh, HiCheck, HiTag, HiLightningBolt, HiExclamationCircle,
    HiPhone, HiMail, HiShare
} from 'react-icons/hi'
import { FiCalendar, FiClock, FiPlus, FiCheck, FiX, FiFilter, FiUser, FiDollarSign, FiMove } from 'react-icons/fi'

// Initial Sample Turfs (Single Physical Ground per Turf with Multi-Sport support)
const INITIAL_TURFS = [
    {
        id: 'turf-1',
        name: 'Champions Turf Arena',
        location: 'Mumbai, MH',
        type: 'Single Physical Ground (Multi-Sport)',
        sports: [
            { id: 'sp-cricket', name: 'Cricket', icon: '🏏', price: 1000 },
            { id: 'sp-football', name: 'Football', icon: '⚽', price: 1200 }
        ]
    },
    {
        id: 'turf-2',
        name: 'SkyLine Sports Arena',
        location: 'Pune, MH',
        type: 'Single Physical Ground (Multi-Sport)',
        sports: [
            { id: 'sp-football', name: 'Football', icon: '⚽', price: 1400 },
            { id: 'sp-badminton', name: 'Badminton', icon: '🏸', price: 750 }
        ]
    },
    {
        id: 'turf-3',
        name: 'Velocity Sports Hub',
        location: 'Thane, MH',
        type: 'Single Physical Ground (Multi-Sport)',
        sports: [
            { id: 'sp-cricket', name: 'Cricket', icon: '🏏', price: 1100 },
            { id: 'sp-football', name: 'Football', icon: '⚽', price: 1300 }
        ]
    }
]

// Helper to parse HH:MM or 24-hour time to minutes
const parseTimeToMins = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
};

// Helper to format minutes to 12-hour AM/PM string
const formatMinsTo12H = (totalMins) => {
    const hours24 = Math.floor(totalMins / 60) % 24;
    const mins = totalMins % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    return `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
};

// Helper to format minutes to 24-hour HH:MM string
const formatMinsTo24H = (totalMins) => {
    const hours24 = Math.floor(totalMins / 60) % 24;
    const mins = totalMins % 60;
    return `${String(hours24).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// Generator function: calculates day slots based on Start Time, End Time & Duration Minutes
const calculateDaySlots = (startTimeStr, endTimeStr, durationMinutes) => {
    const startMins = parseTimeToMins(startTimeStr);
    const endMins = parseTimeToMins(endTimeStr);
    const duration = Number(durationMinutes) || 60;

    if (endMins <= startMins || duration <= 0) return [];

    const slots = [];
    let curr = startMins;

    while (curr + duration <= endMins) {
        const timeId = formatMinsTo24H(curr);
        const startLabel = formatMinsTo12H(curr);
        const endLabel = formatMinsTo12H(curr + duration);
        slots.push({
            timeId,
            startLabel,
            endLabel,
            label: `${startLabel} - ${endLabel}`
        });
        curr += duration;
    }

    return slots;
};

// 1-Hour Time Slots from 06:00 AM to 11:00 PM
const TIME_SLOTS = [
    { id: '06:00', label: '06:00 AM', endLabel: '07:00 AM' },
    { id: '07:00', label: '07:00 AM', endLabel: '08:00 AM' },
    { id: '08:00', label: '08:00 AM', endLabel: '09:00 AM' },
    { id: '09:00', label: '09:00 AM', endLabel: '10:00 AM' },
    { id: '10:00', label: '10:00 AM', endLabel: '11:00 AM' },
    { id: '11:00', label: '11:00 AM', endLabel: '12:00 PM' },
    { id: '12:00', label: '12:00 PM', endLabel: '01:00 PM' },
    { id: '13:00', label: '01:00 PM', endLabel: '02:00 PM' },
    { id: '14:00', label: '02:00 PM', endLabel: '03:00 PM' },
    { id: '15:00', label: '03:00 PM', endLabel: '04:00 PM' },
    { id: '16:00', label: '04:00 PM', endLabel: '05:00 PM' },
    { id: '17:00', label: '05:00 PM', endLabel: '06:00 PM' },
    { id: '18:00', label: '06:00 PM', endLabel: '07:00 PM' },
    { id: '19:00', label: '07:00 PM', endLabel: '08:00 PM' },
    { id: '20:00', label: '08:00 PM', endLabel: '09:00 PM' },
    { id: '21:00', label: '09:00 PM', endLabel: '10:00 PM' },
    { id: '22:00', label: '10:00 PM', endLabel: '11:00 PM' },
]

// Sample Multi-Sport Booking & Slot Master Data (Single Physical Ground)
const INITIAL_SLOT_DATA = TIME_SLOTS.map(t => {
    if (t.id === '08:00') {
        return { id: 'slot-103', turfId: 'turf-1', date: '2026-08-08', timeId: '08:00', status: 'Booked', bookedSportId: 'sp-cricket', booking: { id: 'BK-901', customerName: 'Rahul Sharma', phone: '+91 98765 12345', email: 'rahul@gmail.com', sportName: 'Cricket 🏏', amount: 1000, paidAmount: 1000, paymentStatus: 'Paid', paymentMethod: 'UPI', status: 'Confirmed', invoiceNo: 'INV-2026-081' } }
    }
    if (t.id === '09:00') {
        return { id: 'slot-104', turfId: 'turf-1', date: '2026-08-08', timeId: '09:00', status: 'Blocked', blockReason: 'Maintenance', blockNotes: 'Ground leveling & net repair' }
    }
    if (t.id === '13:00') {
        return { id: 'slot-105', turfId: 'turf-1', date: '2026-08-08', timeId: '13:00', status: 'Pending', bookedSportId: 'sp-cricket', subtext: 'Customer may confirm soon' }
    }
    if (t.id === '14:00') {
        return { id: 'slot-106', turfId: 'turf-1', date: '2026-08-08', timeId: '14:00', status: 'Cancelled', bookedSportId: 'sp-cricket', subtext: 'Booking cancelled by user' }
    }
    if (t.id === '17:00') {
        return { id: 'slot-110', turfId: 'turf-1', date: '2026-08-08', timeId: '17:00', status: 'Available', customPrices: { 'sp-cricket': 1500, 'sp-football': 1800 }, surgeTag: '🔥 Peak Rate (+₹500)', isPeak: true }
    }
    if (t.id === '18:00') {
        return { id: 'slot-107', turfId: 'turf-1', date: '2026-08-08', timeId: '18:00', status: 'Booked', bookedSportId: 'sp-football', booking: { id: 'BK-902', customerName: 'Vikramaditya Roy', phone: '+91 98111 22334', email: 'vikram@gmail.com', sportName: 'Football ⚽', amount: 1200, paidAmount: 1200, paymentStatus: 'Paid', paymentMethod: 'Card', status: 'Confirmed', invoiceNo: 'INV-2026-082' } }
    }
    if (t.id === '19:00') {
        return { id: 'slot-108', turfId: 'turf-1', date: '2026-08-08', timeId: '19:00', status: 'Booked', bookedSportId: 'sp-cricket', booking: { id: 'BK-903', customerName: 'Anita Desai', phone: '+91 99887 76655', email: 'anita@gmail.com', sportName: 'Cricket 🏏', amount: 1000, paidAmount: 0, paymentStatus: 'Pending', paymentMethod: 'Cash', status: 'Pending', invoiceNo: 'INV-2026-083' } }
    }
    if (t.id === '20:00') {
        return { id: 'slot-109', turfId: 'turf-1', date: '2026-08-08', timeId: '20:00', status: 'Booked', bookedSportId: 'sp-football', booking: { id: 'BK-904', customerName: 'Karan Johar', phone: '+91 97766 55443', email: 'karan@gmail.com', sportName: 'Football ⚽', amount: 1200, paidAmount: 1200, paymentStatus: 'Paid', paymentMethod: 'UPI', status: 'Confirmed', invoiceNo: 'INV-2026-084' } }
    }
    return {
        id: `slot-init-${t.id}`,
        turfId: 'turf-1',
        date: '2026-08-08',
        timeId: t.id,
        timeLabel: t.label,
        endTimeLabel: t.endLabel,
        status: 'Available',
        allowedSports: ['sp-cricket', 'sp-football']
    }
})

export default function TurfCalendarPage() {
    const toastCtx = useToast()
    const addToast = toastCtx?.addToast || ((msg) => console.log('Toast:', msg))
    const navigate = useNavigate()

    // ── Primary Context Filters ──
    const [turfs, setTurfs] = useState(INITIAL_TURFS)
    const [selectedTurfId, setSelectedTurfId] = useState('turf-1')

    // Active Turf Object & Sports List
    const activeTurf = useMemo(() => {
        return turfs.find(t => t.id === selectedTurfId) || turfs[0] || {
            id: 'turf-1',
            name: 'Champions Turf Arena',
            location: 'Mumbai, MH',
            sports: [
                { id: 'sp-cricket', name: 'Cricket', icon: '🏏', price: 1000 },
                { id: 'sp-football', name: 'Football', icon: '⚽', price: 1200 }
            ]
        }
    }, [turfs, selectedTurfId])

    const [selectedSportFilter, setSelectedSportFilter] = useState('ALL') // 'ALL' or sportId
    const [currentDate, setCurrentDate] = useState('2026-08-08')
    const [viewMode, setViewMode] = useState('Day') // 'Day' | 'Week' | 'Month'

    // ── Slots & Bookings Master State ──
    const [slotsData, setSlotsData] = useState(INITIAL_SLOT_DATA)

    // ── Modals & Drawers State ──
    const [createSlotOpen, setCreateSlotOpen] = useState(false)
    const [createBookingOpen, setCreateBookingOpen] = useState(false)
    const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false)
    const [blockSlotOpen, setBlockSlotOpen] = useState(false)
    const [addTurfOpen, setAddTurfOpen] = useState(false)

    // Active Selection Contexts
    const [targetSlotCtx, setTargetSlotCtx] = useState(null)
    const [selectedBooking, setSelectedBooking] = useState(null)

    // Custom Dropdown Popover States & Refs
    const [turfDropdownOpen, setTurfDropdownOpen] = useState(false)
    const [sportDropdownOpen, setSportDropdownOpen] = useState(false)
    const turfDropdownRef = useRef(null)
    const sportDropdownRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (turfDropdownRef.current && !turfDropdownRef.current.contains(event.target)) {
                setTurfDropdownOpen(false)
            }
            if (sportDropdownRef.current && !sportDropdownRef.current.contains(event.target)) {
                setSportDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Synchronize and isolate customer bookings strictly for the selected turf
    useEffect(() => {
        try {
            const raw = localStorage.getItem('customer_bookings')
            if (raw) {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const turfKeywords = [
                        activeTurf?.name,
                        activeTurf?.id,
                        selectedTurfId === 'turf-1' ? 'champions' : null,
                        selectedTurfId === 'turf-2' ? 'skyline' : null,
                        selectedTurfId === 'turf-3' ? 'velocity' : null,
                    ].filter(Boolean).map(k => k.toLowerCase())

                    // Only filter bookings for this active turf
                    const turfBookings = parsed.filter(b => {
                        const venueStr = (b.venue || b.court || b.turfId || '').toLowerCase()
                        return turfKeywords.some(kw => venueStr.includes(kw))
                    })

                    if (turfBookings.length > 0) {
                        setSlotsData(prev => {
                            const updated = [...prev]
                            turfBookings.forEach(bk => {
                                const bkTime = bk.time ? (bk.time.includes(':') ? bk.time.split(' ')[0] : '18:00') : '18:00'
                                const timeId = bkTime.length === 4 ? `0${bkTime}` : bkTime.substring(0, 5)
                                const slotDate = bk.date || currentDate

                                const existingIndex = updated.findIndex(s => s.turfId === selectedTurfId && s.date === slotDate && s.timeId?.startsWith(timeId.substring(0, 2)))
                                if (existingIndex >= 0) {
                                    updated[existingIndex] = {
                                        ...updated[existingIndex],
                                        status: bk.status === 'Cancelled' ? 'Cancelled' : 'Booked',
                                        bookedSportId: bk.sport?.toLowerCase().includes('cricket') ? 'sp-cricket' : 'sp-football',
                                        booking: {
                                            id: bk.id,
                                            customerName: bk.customerName || 'Online Customer',
                                            phone: bk.customerPhone || '+91 98765 43210',
                                            email: bk.userEmail || 'customer@gmail.com',
                                            sportName: bk.sport || 'Cricket 🏏',
                                            amount: bk.amount ? parseInt(String(bk.amount).replace(/[^0-9]/g, '')) || 1000 : 1000,
                                            paidAmount: bk.amount ? parseInt(String(bk.amount).replace(/[^0-9]/g, '')) || 1000 : 1000,
                                            paymentStatus: 'Paid',
                                            paymentMethod: 'UPI',
                                            status: bk.status || 'Confirmed',
                                            invoiceNo: `INV-${bk.id}`
                                        }
                                    }
                                }
                            })
                            return updated
                        })
                    }
                }
            }
        } catch (e) {}
    }, [selectedTurfId, currentDate, activeTurf])

    // ── Bulk Day Slot Generator State ──
    const [slotCreateMode, setSlotCreateMode] = useState('BULK') // 'BULK' | 'SINGLE'
    const [customTimeSlots, setCustomTimeSlots] = useState([])
    const [bulkForm, setBulkForm] = useState({
        date: '2026-08-08',
        startTime: '06:00',
        endTime: '23:00',
        durationMinutes: 60,
        cricketPrice: 1000,
        footballPrice: 1200
    })

    // Forms State
    const [slotForm, setSlotForm] = useState({
        turfId: 'turf-1',
        date: '2026-08-08',
        startTime: '10:00',
        endTime: '11:00',
        allowedSport: 'ALL', // 'ALL' or sportId
        cricketPrice: 1000,
        footballPrice: 1200,
        repeat: 'none' // 'none' | 'daily' | 'weekly' | 'mon_fri' | 'sat_sun'
    })

    const [bookingForm, setBookingForm] = useState({
        customerName: '',
        phone: '',
        email: '',
        sportId: 'sp-cricket',
        amount: 1000,
        discount: 0,
        tax: 0,
        paymentStatus: 'Paid',
        paymentMethod: 'UPI',
        notes: ''
    })

    const [blockForm, setBlockForm] = useState({
        reason: 'Maintenance',
        notes: ''
    })

    // Slot Quick Action & Custom Price State
    const [slotActionTab, setSlotActionTab] = useState('BOOKING') // 'BOOKING' | 'EDIT_PRICE'
    const [slotPriceForm, setSlotPriceForm] = useState({
        cricketPrice: 1000,
        footballPrice: 1200,
        surgeTag: 'Peak Rate'
    })

    const [newTurfForm, setNewTurfForm] = useState({
        name: '',
        location: '',
        cricketPrice: 1000,
        footballPrice: 1200
    })

    const activeSports = useMemo(() => {
        const sportsList = activeTurf?.sports || []
        if (selectedSportFilter === 'ALL') return sportsList
        const filtered = sportsList.filter(s => s.id === selectedSportFilter)
        return filtered.length > 0 ? filtered : sportsList
    }, [activeTurf, selectedSportFilter])

    // Filtered slots for current date & turf
    const activeSlots = useMemo(() => {
        return slotsData.filter(s => s.turfId === selectedTurfId && s.date === currentDate)
    }, [slotsData, selectedTurfId, currentDate])

    // Dynamic Time Slots calculation (renders ONLY generated slots for currentDate when present, or base TIME_SLOTS if none generated)
    const activeTimeSlots = useMemo(() => {
        const slotsForDate = slotsData.filter(s => s.turfId === selectedTurfId && s.date === currentDate)
        const map = new Map()

        if (slotsForDate.length > 0) {
            slotsForDate.forEach(s => {
                if (s.timeId) {
                    const label = s.timeLabel || formatMinsTo12H(parseTimeToMins(s.timeId))
                    const endLabel = s.endTimeLabel || formatMinsTo12H(parseTimeToMins(s.timeId) + 60)
                    map.set(s.timeId, { id: s.timeId, label, endLabel })
                }
            })
        } else {
            TIME_SLOTS.forEach(t => map.set(t.id, t))
        }

        return Array.from(map.values()).sort((a, b) => parseTimeToMins(a.id) - parseTimeToMins(b.id))
    }, [slotsData, selectedTurfId, currentDate])

    // Real-time Preview calculation for Auto Bulk Day Generator
    const generatedPreviewSlots = useMemo(() => {
        return calculateDaySlots(bulkForm.startTime, bulkForm.endTime, bulkForm.durationMinutes)
    }, [bulkForm.startTime, bulkForm.endTime, bulkForm.durationMinutes])

    // Handler to Bulk Auto-Generate Day Slots
    const handleSaveBulkSlots = (e) => {
        e.preventDefault()
        if (generatedPreviewSlots.length === 0) {
            addToast({ title: 'Invalid Time Range', message: 'End time must be after start time and duration must be valid.', type: 'error' })
            return
        }

        const targetDate = bulkForm.date || currentDate
        const targetTurfId = selectedTurfId

        setSlotsData(prev => {
            const existingForDate = prev.filter(s => s.turfId === targetTurfId && s.date === targetDate)
            const otherSlots = prev.filter(s => !(s.turfId === targetTurfId && s.date === targetDate))

            const newDaySlots = generatedPreviewSlots.map(gen => {
                const existing = existingForDate.find(s => s.timeId === gen.timeId)
                if (existing && (existing.status === 'Booked' || existing.status === 'Pending' || existing.status === 'Blocked')) {
                    return existing // Preserve existing bookings/blocked slots!
                }

                return {
                    id: `slot-${targetTurfId}-${targetDate}-${gen.timeId}`,
                    turfId: targetTurfId,
                    date: targetDate,
                    timeId: gen.timeId,
                    timeLabel: gen.startLabel,
                    endTimeLabel: gen.endLabel,
                    status: 'Available',
                    allowedSports: activeTurf.sports.map(s => s.id)
                }
            })

            return [...otherSlots, ...newDaySlots]
        })

        // Auto-switch calendar date to targetDate
        setCurrentDate(targetDate)

        addToast({
            title: '⚡ Full Day Slots Auto-Generated!',
            message: `Created/Refreshed ${generatedPreviewSlots.length} slots (${bulkForm.durationMinutes} mins each) for ${targetDate}`,
            type: 'success'
        })
        setCreateSlotOpen(false)
    }

    // KPI Dynamic Calculations (Single Physical Ground)
    const kpiSummary = useMemo(() => {
        const total = activeTimeSlots.length
        const booked = activeSlots.filter(s => s.status === 'Booked').length
        const pending = activeSlots.filter(s => s.status === 'Pending').length
        const blocked = activeSlots.filter(s => s.status === 'Blocked').length
        const available = activeSlots.filter(s => s.status === 'Available').length

        const todayRevenue = activeSlots
            .filter(s => s.status === 'Booked' && s.booking)
            .reduce((acc, s) => acc + (Number(s.booking.paidAmount) || 0), 0)

        return { total, available, booked, pending, blocked, todayRevenue }
    }, [activeSlots, activeTimeSlots])

    // Date Navigation Handlers
    const handleNavigateDate = (direction) => {
        const curr = new Date(currentDate)
        if (direction === 'today') {
            setCurrentDate('2026-08-08')
            return
        }
        curr.setDate(curr.getDate() + (direction === 'next' ? 1 : -1))
        setCurrentDate(curr.toISOString().split('T')[0])
    }

    // Cell Click Handler (Sport + Time Slot)
    const handleCellClick = (sport, timeSlot) => {
        const existing = activeSlots.find(s => s.timeId === timeSlot.id)

        if (!existing || existing.status === 'Available') {
            const cricketSport = activeTurf.sports.find(s => s.name.toLowerCase().includes('cricket')) || activeTurf.sports[0]
            const footballSport = activeTurf.sports.find(s => s.name.toLowerCase().includes('football')) || activeTurf.sports[1] || activeTurf.sports[0]

            const cricketPrice = existing?.customPrices?.[cricketSport?.id] || cricketSport?.price || 1000
            const footballPrice = existing?.customPrices?.[footballSport?.id] || footballSport?.price || 1200
            const currentSelectedPrice = existing?.customPrices?.[sport.id] || sport.price || 1000

            setTargetSlotCtx({
                turfId: selectedTurfId,
                turfName: activeTurf.name,
                sportId: sport.id,
                sportName: `${sport.name} ${sport.icon}`,
                date: currentDate,
                timeId: timeSlot.id,
                timeLabel: timeSlot.label,
                endTimeLabel: timeSlot.endLabel,
                price: currentSelectedPrice,
                existingSlotId: existing?.id,
                customPrices: existing?.customPrices || {},
                surgeTag: existing?.surgeTag || ''
            })

            setBookingForm({
                customerName: '',
                phone: '',
                email: '',
                sportId: sport.id,
                amount: currentSelectedPrice,
                discount: 0,
                tax: 0,
                paymentStatus: 'Paid',
                paymentMethod: 'UPI',
                notes: ''
            })

            setSlotPriceForm({
                cricketPrice,
                footballPrice,
                surgeTag: existing?.surgeTag || 'Peak Rate'
            })

            setSlotActionTab('BOOKING')
            setCreateBookingOpen(true)
        } else if (existing.status === 'Booked' || existing.status === 'Pending') {
            setSelectedBooking({ ...existing.booking, slotData: existing, turfName: activeTurf.name })
            setBookingDetailsOpen(true)
        } else if (existing.status === 'Blocked') {
            setTargetSlotCtx(existing)
            setBlockForm({ reason: existing.blockReason || 'Maintenance', notes: existing.blockNotes || '' })
            setBlockSlotOpen(true)
        }
    }

    // Submit Custom Slot Price Override
    const handleSaveCustomSlotPrices = (e) => {
        e.preventDefault()
        const targetTimeId = targetSlotCtx?.timeId
        if (!targetTimeId) return

        const cricketSport = activeTurf.sports.find(s => s.name.toLowerCase().includes('cricket')) || activeTurf.sports[0]
        const footballSport = activeTurf.sports.find(s => s.name.toLowerCase().includes('football')) || activeTurf.sports[1] || activeTurf.sports[0]

        setSlotsData(prev => {
            const existingMap = new Map()
            prev.forEach(s => existingMap.set(`${s.turfId}-${s.date}-${s.timeId}`, s))

            const key = `${selectedTurfId}-${currentDate}-${targetTimeId}`
            const existing = existingMap.get(key)

            const newCricketPrice = Number(slotPriceForm.cricketPrice) || cricketSport.price
            const newFootballPrice = Number(slotPriceForm.footballPrice) || footballSport.price
            const isCricketPeak = newCricketPrice > cricketSport.price
            const isFootballPeak = newFootballPrice > footballSport.price
            const isPeak = isCricketPeak || isFootballPeak || Boolean(slotPriceForm.surgeTag && slotPriceForm.surgeTag !== 'none')

            const updated = {
                ...(existing || {}),
                id: existing?.id || `slot-${selectedTurfId}-${currentDate}-${targetTimeId}`,
                turfId: selectedTurfId,
                date: currentDate,
                timeId: targetTimeId,
                timeLabel: targetSlotCtx?.timeLabel,
                endTimeLabel: targetSlotCtx?.endTimeLabel,
                status: existing?.status || 'Available',
                customPrices: {
                    ...(existing?.customPrices || {}),
                    [cricketSport.id]: newCricketPrice,
                    [footballSport.id]: newFootballPrice
                },
                surgeTag: slotPriceForm.surgeTag || (isPeak ? '🔥 Peak Rate' : ''),
                isPeak: isPeak
            }

            existingMap.set(key, updated)
            return Array.from(existingMap.values())
        })

        addToast({
            title: 'Slot Prices Updated!',
            message: `Saved custom rates for ${targetSlotCtx?.timeLabel}: Cricket ₹${slotPriceForm.cricketPrice}, Football ₹${slotPriceForm.footballPrice}`,
            type: 'success'
        })

        setCreateBookingOpen(false)
    }

    // Submit Create Slot
    const handleSaveSlot = (e) => {
        e.preventDefault()
        const newSlot = {
            id: `slot-${Date.now()}`,
            turfId: slotForm.turfId,
            date: slotForm.date,
            timeId: slotForm.startTime,
            status: 'Available',
            allowedSports: slotForm.allowedSport === 'ALL' ? activeTurf.sports.map(s => s.id) : [slotForm.allowedSport]
        }

        setSlotsData(prev => [...prev.filter(s => !(s.turfId === slotForm.turfId && s.timeId === slotForm.startTime && s.date === slotForm.date)), newSlot])
        addToast({ title: 'Slot Created', message: `Single ground slot created for ${slotForm.startTime} on ${slotForm.date}`, type: 'success' })
        setCreateSlotOpen(false)
    }

    // Submit Create Booking
    const handleSaveBooking = (e) => {
        e.preventDefault()
        if (!bookingForm.customerName) {
            addToast({ title: 'Validation Error', message: 'Please enter customer name', type: 'error' })
            return
        }

        const selectedSportObj = activeTurf.sports.find(s => s.id === bookingForm.sportId) || activeTurf.sports[0]
        const finalAmount = Math.max(0, (Number(bookingForm.amount) || 0) - (Number(bookingForm.discount) || 0) + (Number(bookingForm.tax) || 0))
        const paidAmount = bookingForm.paymentStatus === 'Paid' ? finalAmount : 0

        const newBookingObj = {
            id: `BK-${Math.floor(100 + Math.random() * 900)}`,
            customerName: bookingForm.customerName,
            phone: bookingForm.phone || '+91 98000 11122',
            email: bookingForm.email || 'customer@example.com',
            sportName: `${selectedSportObj.name} ${selectedSportObj.icon}`,
            amount: finalAmount,
            paidAmount,
            paymentStatus: bookingForm.paymentStatus,
            paymentMethod: bookingForm.paymentMethod,
            status: bookingForm.paymentStatus === 'Paid' ? 'Confirmed' : 'Pending',
            invoiceNo: `INV-2026-${Math.floor(100 + Math.random() * 900)}`
        }

        const updatedSlot = {
            id: targetSlotCtx?.existingSlotId || `slot-${Date.now()}`,
            turfId: targetSlotCtx?.turfId || selectedTurfId,
            date: targetSlotCtx?.date || currentDate,
            timeId: targetSlotCtx?.timeId || '10:00',
            status: bookingForm.paymentStatus === 'Paid' ? 'Booked' : 'Pending',
            bookedSportId: selectedSportObj.id,
            booking: newBookingObj
        }

        setSlotsData(prev => [
            ...prev.filter(s => !(s.turfId === updatedSlot.turfId && s.timeId === updatedSlot.timeId && s.date === updatedSlot.date)),
            updatedSlot
        ])

        addToast({ title: 'Booking Confirmed!', message: `Single ground booked for ${selectedSportObj.name} (${newBookingObj.customerName})`, type: 'success' })
        setCreateBookingOpen(false)
    }

    // Submit Block Slot
    const handleSaveBlockSlot = (e) => {
        e.preventDefault()
        const blockedSlot = {
            id: targetSlotCtx?.id || `slot-${Date.now()}`,
            turfId: targetSlotCtx?.turfId || selectedTurfId,
            date: targetSlotCtx?.date || currentDate,
            timeId: targetSlotCtx?.timeId || '10:00',
            status: 'Blocked',
            blockReason: blockForm.reason,
            blockNotes: blockForm.notes
        }

        setSlotsData(prev => [
            ...prev.filter(s => !(s.turfId === blockedSlot.turfId && s.timeId === blockedSlot.timeId && s.date === blockedSlot.date)),
            blockedSlot
        ])

        addToast({ title: 'Slot Blocked', message: `Turf ground blocked due to ${blockForm.reason}`, type: 'info' })
        setBlockSlotOpen(false)
    }

    // Unblock Slot
    const handleUnblockSlot = () => {
        if (!targetSlotCtx) return
        setSlotsData(prev => prev.filter(s => s.id !== targetSlotCtx.id))
        addToast({ title: 'Turf Unblocked', message: 'Ground is now available for all sports', type: 'success' })
        setBlockSlotOpen(false)
    }

    // Add New Single Ground Multi-Sport Turf
    const handleSaveNewTurf = (e) => {
        e.preventDefault()
        if (!newTurfForm.name) return
        const newTurf = {
            id: `turf-${Date.now()}`,
            name: newTurfForm.name,
            location: newTurfForm.location || 'Mumbai, MH',
            type: 'Single Physical Ground (Multi-Sport)',
            sports: [
                { id: `sp-cricket-${Date.now()}`, name: 'Cricket', icon: '🏏', price: Number(newTurfForm.cricketPrice) || 1000 },
                { id: `sp-football-${Date.now()}`, name: 'Football', icon: '⚽', price: Number(newTurfForm.footballPrice) || 1200 }
            ]
        }
        setTurfs(prev => [...prev, newTurf])
        setSelectedTurfId(newTurf.id)
        addToast({ title: 'Turf Created!', message: `${newTurf.name} (Single Multi-Sport Ground) created`, type: 'success' })
        setAddTurfOpen(false)
        setNewTurfForm({ name: '', location: '', cricketPrice: 1000, footballPrice: 1200 })
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* ── 1. Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-[#10B981] flex items-center justify-center text-xl shadow-2xs">
                        <FiCalendar className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-2">
                            Turf Calendar
                            <span className="text-[11px] font-extrabold bg-emerald-50 text-[#10B981] border border-emerald-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                1 Physical Ground • Multi-Sport
                            </span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                            Single physical turf arena: Multi-sport scheduling & auto-conflict prevention
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => {
                            setSlotCreateMode('BULK')
                            setCreateSlotOpen(true)
                        }}
                        className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/20 border border-emerald-400/30"
                    >
                        <HiLightningBolt className="w-4 h-4" />
                        <span>⚡ Auto Generate Day Slots</span>
                    </button>
                </div>
            </div>

            {/* ── 2. KPI Header Summary Cards (Positioned Top) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Slots</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{kpiSummary.total}</p>
                </div>
                <div className="bg-white rounded-2xl border border-emerald-200/80 p-4 shadow-2xs bg-emerald-50/30">
                    <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">Available</p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">{kpiSummary.available}</p>
                </div>
                <div className="bg-white rounded-2xl border border-emerald-200/80 p-4 shadow-2xs bg-emerald-50/50">
                    <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">Booked</p>
                    <p className="text-xl sm:text-2xl font-black text-[#10B981] mt-1">{kpiSummary.booked}</p>
                </div>
                <div className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-2xs bg-amber-50/30">
                    <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest">Pending</p>
                    <p className="text-xl sm:text-2xl font-black text-amber-700 mt-1">{kpiSummary.pending}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs bg-slate-50">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Blocked</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-700 mt-1">{kpiSummary.blocked}</p>
                </div>
                <div className="bg-white rounded-2xl border border-teal-200/80 p-4 shadow-2xs bg-teal-50/30">
                    <p className="text-[10px] font-extrabold text-teal-700 uppercase tracking-widest">Today&apos;s Revenue</p>
                    <p className="text-xl sm:text-2xl font-black text-teal-700 mt-1">₹{kpiSummary.todayRevenue.toLocaleString()}</p>
                </div>
            </div>

            {/* ── 3. Merged Control Bar & Calendar Schedule Matrix into 1 Single Card ── */}
            <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-hidden">
                {/* Control Bar Header Section */}
                <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/40 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                    {/* Left Side: Custom Turf Selector & Sport Filter Controls */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Custom Premium Turf Selector Dropdown */}
                        <div className="relative flex-1 sm:flex-none" ref={turfDropdownRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setTurfDropdownOpen(!turfDropdownOpen)
                                    setSportDropdownOpen(false)
                                }}
                                className="flex items-center gap-2.5 px-3.5 py-2 bg-white hover:bg-slate-50/90 rounded-xl border border-slate-200/90 transition-all shadow-2xs cursor-pointer group"
                            >
                                <HiLocationMarker className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div className="text-left">
                                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                        {activeTurf.name}
                                    </span>
                                </div>
                                <HiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ml-1 ${turfDropdownOpen ? 'rotate-180 text-emerald-600' : 'group-hover:text-slate-700'}`} />
                            </button>

                            {/* Floating Dropdown Popover */}
                            {turfDropdownOpen && (
                                <div className="absolute left-0 top-full mt-2 w-72 bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.12)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-3 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Select Turf Arena ({turfs.length})</span>
                                        <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">Active Ground</span>
                                    </div>

                                    <div className="space-y-1 max-h-60 overflow-y-auto">
                                        {turfs.map(t => {
                                            const isSelected = t.id === selectedTurfId
                                            return (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedTurfId(t.id)
                                                        setSelectedSportFilter('ALL')
                                                        setTurfDropdownOpen(false)
                                                    }}
                                                    className={`w-full p-2.5 rounded-xl transition-all flex items-center justify-between text-left cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-emerald-50 text-emerald-950 font-black border border-emerald-200/80 shadow-2xs'
                                                            : 'hover:bg-slate-50 text-slate-700 font-bold border border-transparent'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                                                            isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            🏟️
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-black truncate">{t.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium truncate">{t.location || 'Mumbai, MH'}</p>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <HiCheck className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <div className="pt-1.5 mt-1 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTurfDropdownOpen(false)
                                                setAddTurfOpen(true)
                                            }}
                                            className="w-full p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-700 font-black text-xs transition-all flex items-center justify-center gap-1.5 border border-dashed border-emerald-300/80 cursor-pointer"
                                        >
                                            <HiPlus className="w-4 h-4" />
                                            <span>+ Add New Turf Arena...</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="hidden sm:block h-6 w-px bg-slate-200/80" />

                        {/* Custom Premium Sport Filter Dropdown */}
                        <div className="relative flex-1 sm:flex-none" ref={sportDropdownRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setSportDropdownOpen(!sportDropdownOpen)
                                    setTurfDropdownOpen(false)
                                }}
                                className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50/90 rounded-xl border border-slate-200/90 transition-all shadow-2xs cursor-pointer group"
                            >
                                <FiFilter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span className="text-xs font-bold text-slate-800">
                                    {selectedSportFilter === 'ALL'
                                        ? `All Sports (${activeTurf?.sports?.length || 0})`
                                        : (() => {
                                            const found = activeTurf?.sports?.find(s => s.id === selectedSportFilter)
                                            return found ? `${found.name} ${found.icon}` : `All Sports (${activeTurf?.sports?.length || 0})`
                                        })()}
                                </span>
                                <HiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ml-1 ${sportDropdownOpen ? 'rotate-180 text-emerald-600' : 'group-hover:text-slate-700'}`} />
                            </button>

                            {/* Floating Dropdown Popover */}
                            {sportDropdownOpen && (
                                <div className="absolute left-0 top-full mt-2 w-64 bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.12)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Filter By Sport</span>
                                    </div>

                                    <div className="space-y-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedSportFilter('ALL')
                                                setSportDropdownOpen(false)
                                            }}
                                            className={`w-full p-2.5 rounded-xl transition-all flex items-center justify-between text-left cursor-pointer ${
                                                selectedSportFilter === 'ALL'
                                                    ? 'bg-emerald-50 text-emerald-950 font-black border border-emerald-200/80 shadow-2xs'
                                                    : 'hover:bg-slate-50 text-slate-700 font-bold border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">🏆</span>
                                                <span className="text-xs font-black">All Sports ({activeTurf?.sports?.length || 0})</span>
                                            </div>
                                            {selectedSportFilter === 'ALL' && (
                                                <HiCheck className="w-4 h-4 text-emerald-600" />
                                            )}
                                        </button>

                                        {activeTurf.sports.map(s => {
                                            const isSelected = selectedSportFilter === s.id
                                            return (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedSportFilter(s.id)
                                                        setSportDropdownOpen(false)
                                                    }}
                                                    className={`w-full p-2.5 rounded-xl transition-all flex items-center justify-between text-left cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-emerald-50 text-emerald-950 font-black border border-emerald-200/80 shadow-2xs'
                                                            : 'hover:bg-slate-50 text-slate-700 font-bold border border-transparent'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base">{s.icon}</span>
                                                        <div>
                                                            <p className="text-xs font-black">{s.name}</p>
                                                            <p className="text-[10px] text-emerald-700 font-bold">₹{s.price}/hr</p>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <HiCheck className="w-4 h-4 text-emerald-600" />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Date Navigator & View Switcher */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Date Navigation */}
                        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200/80 gap-1 text-xs font-bold shadow-2xs">
                            <button
                                onClick={() => handleNavigateDate('today')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#16A34A] hover:bg-emerald-100 transition-all font-black cursor-pointer border border-emerald-200/60"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => handleNavigateDate('prev')}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                aria-label="Previous day"
                            >
                                <HiChevronLeft className="w-4 h-4" />
                            </button>
                            <CustomDatePicker
                                value={currentDate}
                                onChange={(val) => val && setCurrentDate(val)}
                                placeholder="Select date"
                                align="right"
                            />
                            <button
                                onClick={() => handleNavigateDate('next')}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                aria-label="Next day"
                            >
                                <HiChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* View Mode Segmented Control */}
                        <div className="inline-flex p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 gap-1 text-xs font-bold shadow-2xs">
                            {['Day', 'Week', 'Month'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                                        viewMode === mode
                                            ? 'bg-[#10B981] text-white shadow-sm font-extrabold'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                    }`}
                                >
                                    {mode} View
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Schedule Matrix Table */}
                <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
                    <table className="w-full text-xs text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-700 font-black uppercase tracking-wider h-12">
                                <th className="w-28 px-4 py-3 border-r border-slate-200/60 sticky left-0 bg-slate-50 z-10">
                                    TIME SLOT
                                </th>
                                {activeSports.map(sport => (
                                    <th key={sport.id} className="px-4 py-3 border-r border-slate-200/60 min-w-[240px]">
                                        <div className="flex items-center justify-between">
                                            <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                                                <span>{sport.icon}</span>
                                                <span>{sport.name}</span>
                                            </span>
                                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200/60">
                                                ₹{sport.price}/hr
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {activeTimeSlots.map(timeSlot => {
                                const slot = activeSlots.find(s => s.timeId === timeSlot.id)
                                const isBooked = slot?.status === 'Booked'
                                const isPending = slot?.status === 'Pending'
                                const isBlocked = slot?.status === 'Blocked'

                                return (
                                    <tr key={timeSlot.id} className="h-16 hover:bg-slate-50/40 transition-colors">
                                        {/* Time Label Column */}
                                        <td className="px-4 py-3 font-mono font-bold text-slate-700 border-r border-slate-200/60 sticky left-0 bg-white z-10 whitespace-nowrap">
                                            <div>{timeSlot.label}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{timeSlot.endLabel}</div>
                                        </td>

                                        {/* Multi-Sport Columns for the Single Physical Ground */}
                                        {activeSports.map(sport => {
                                            const isBookedState = slot?.status === 'Booked' && slot?.bookedSportId === sport.id
                                            const isPendingState = slot?.status === 'Pending' && slot?.bookedSportId === sport.id
                                            const isCancelledState = slot?.status === 'Cancelled' && slot?.bookedSportId === sport.id
                                            const isOtherSportBooked = (slot?.status === 'Booked' || slot?.status === 'Pending') && slot?.bookedSportId !== sport.id
                                            const otherSportObj = activeTurf?.sports?.find(s => s.id === slot?.bookedSportId)
                                            const isBlocked = slot?.status === 'Blocked'

                                            return (
                                                <td
                                                    key={sport.id}
                                                    onClick={() => !isOtherSportBooked && handleCellClick(sport, timeSlot)}
                                                    className={`p-2 border-r border-slate-200/60 transition-all align-top h-20 relative group ${
                                                        isOtherSportBooked ? 'bg-slate-50/40 cursor-not-allowed' : 'cursor-pointer'
                                                    }`}
                                                >
                                                    {isBookedState ? (
                                                        /* 🟢 BOOKED CELL CARD */
                                                        <div className="h-full w-full rounded-2xl bg-[#10B981] hover:bg-emerald-600 text-white p-3 shadow-2xs transition-all flex flex-col justify-between cursor-pointer">
                                                            <div className="flex items-center justify-between gap-1">
                                                                <div className="flex items-center gap-1.5 font-black text-xs min-w-0">
                                                                    <HiUser className="w-3.5 h-3.5 opacity-90 shrink-0" />
                                                                    <span className="truncate">{slot.booking?.customerName || 'Rahul Sharma'}</span>
                                                                </div>
                                                                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-mono font-extrabold shrink-0">
                                                                    {slot.booking?.id || 'BK-901'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-xs font-black mt-2">
                                                                <span>₹{slot.booking?.amount || sport.price}</span>
                                                                <span className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1">
                                                                    {sport.name.toUpperCase()} <HiLightningBolt className="w-3 h-3 text-amber-300" />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : isPendingState ? (
                                                        /* 🟡 PENDING BOOKING CELL CARD */
                                                        <div className="h-full w-full bg-amber-50/90 border border-amber-200/90 text-amber-900 rounded-2xl p-3 flex flex-col justify-between cursor-pointer hover:bg-amber-100/70 transition-all">
                                                            <div className="flex items-center justify-between gap-1">
                                                                <div className="flex items-center gap-1.5 font-extrabold text-xs text-amber-900">
                                                                    <HiClock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                                    <span>Pending Booking</span>
                                                                </div>
                                                                <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider">
                                                                    PENDING
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-amber-700/90 font-medium truncate mt-1">
                                                                {slot.subtext || 'Customer may confirm soon'}
                                                            </p>
                                                        </div>
                                                    ) : isCancelledState ? (
                                                        /* 🔴 CANCELLED BOOKING CELL CARD */
                                                        <div className="h-full w-full bg-red-50/90 border border-red-200/90 text-red-900 rounded-2xl p-3 flex flex-col justify-between cursor-pointer hover:bg-red-100/70 transition-all">
                                                            <div className="flex items-center justify-between gap-1">
                                                                <div className="flex items-center gap-1.5 font-extrabold text-xs text-red-900">
                                                                    <HiX className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                                                    <span>Cancelled</span>
                                                                </div>
                                                                <span className="text-[9px] bg-red-100 text-red-800 px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider">
                                                                    CANCELLED
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-red-700/90 font-medium truncate mt-1">
                                                                {slot.subtext || 'Booking cancelled by user'}
                                                            </p>
                                                        </div>
                                                    ) : isOtherSportBooked ? (
                                                        /* 🔒 GROUND RESERVED / CONFLICT CELL CARD */
                                                        <div className="h-full w-full bg-slate-100/90 border border-slate-200/90 text-slate-500 rounded-2xl p-3 flex flex-col justify-between cursor-not-allowed">
                                                            <div className="flex items-center justify-between gap-1">
                                                                <span className="font-extrabold text-xs text-slate-700">Ground Reserved</span>
                                                                <span className="text-[9px] bg-slate-200/90 text-slate-600 px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider">
                                                                    LOCKED
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 font-medium truncate mt-1">
                                                                Booked for {otherSportObj?.name || 'Cricket'} ({slot?.booking?.customerName || 'Rahul Sharma'})
                                                            </p>
                                                        </div>
                                                    ) : isBlocked ? (
                                                        /* 🔧 MAINTENANCE / BLOCKED CELL CARD */
                                                        <div className="h-full w-full bg-slate-100/90 border border-slate-200/90 text-slate-600 rounded-2xl p-3 flex flex-col justify-between cursor-pointer hover:bg-slate-200/60 transition-all">
                                                            <div className="flex items-center gap-1.5 font-extrabold text-xs text-slate-700">
                                                                <HiBan className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                                <span className="truncate">{slot.blockReason || 'Maintenance'}</span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 font-medium truncate mt-1">
                                                                {slot.blockNotes || 'Ground leveling & net repair'}
                                                            </p>
                                                        </div>
                                                    ) : (() => {
                                                        const slotPrice = slot?.customPrices?.[sport.id] || sport.price
                                                        const isPriceIncreased = slotPrice > sport.price
                                                        const isPeakSlot = isPriceIncreased || slot?.isPeak || (slot?.surgeTag && slot?.surgeTag !== 'none')

                                                        if (isPeakSlot) {
                                                            return (
                                                                /* 🔥 PEAK TIME / INCREASED PRICE CELL CARD */
                                                                <div className="h-full w-full rounded-2xl border-2 border-amber-400/90 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-50/70 hover:border-amber-500 hover:shadow-md hover:shadow-amber-500/10 transition-all p-3 flex flex-col justify-between cursor-pointer group">
                                                                    <div className="flex items-center justify-between gap-1">
                                                                        <div className="flex items-center gap-1.5 font-black text-xs text-amber-950">
                                                                            <span className="text-amber-500 animate-pulse text-sm">🔥</span>
                                                                            <span>Peak Time</span>
                                                                        </div>
                                                                        <span className="text-[9px] bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs">
                                                                            ⚡ PEAK RATE
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between mt-1">
                                                                        <span className="text-xs font-black text-amber-950">
                                                                            ₹{slotPrice}
                                                                        </span>
                                                                        {isPriceIncreased && (
                                                                            <span className="text-[9px] font-extrabold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-300/80">
                                                                                +₹{slotPrice - sport.price} Peak
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        }

                                                        return (
                                                            /* ⚪ NORMAL AVAILABLE CELL CARD */
                                                            <div className="h-full w-full rounded-2xl border border-emerald-200/80 bg-emerald-50/20 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all p-3 flex flex-col justify-between cursor-pointer">
                                                                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                                                                    <span>Available</span>
                                                                </div>
                                                                <div className="text-xs font-semibold text-slate-400 mt-1">
                                                                    ₹{slotPrice}
                                                                </div>
                                                            </div>
                                                        )
                                                    })()}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── MODAL 1: Create Slot Modal (Auto Bulk Generator + Single Custom Slot) ── */}
            <Modal
                isOpen={createSlotOpen}
                onClose={() => setCreateSlotOpen(false)}
                title="Turf Slot Management"
                size="lg"
            >
                <div className="space-y-4 pt-2">
                    {/* Mode Segmented Control Tabs */}
                    <div className="flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 gap-1 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setSlotCreateMode('BULK')}
                            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                slotCreateMode === 'BULK'
                                    ? 'bg-[#10B981] text-white shadow-sm font-extrabold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <HiLightningBolt className="w-4 h-4" />
                            ⚡ Auto Bulk Generator (Full Day Slots)
                        </button>
                        <button
                            type="button"
                            onClick={() => setSlotCreateMode('SINGLE')}
                            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                slotCreateMode === 'SINGLE'
                                    ? 'bg-[#10B981] text-white shadow-sm font-extrabold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <HiPlus className="w-4 h-4" />
                            ➕ Single Custom Slot
                        </button>
                    </div>

                    {slotCreateMode === 'BULK' ? (
                        /* ⚡ AUTO BULK DAY SLOT GENERATOR FORM */
                        <form onSubmit={handleSaveBulkSlots} className="space-y-4">
                            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/80 text-xs font-bold text-emerald-950 flex items-start gap-3 shadow-2xs">
                                <span className="text-2xl shrink-0">⚡</span>
                                <div>
                                    <span className="font-black text-sm block leading-tight">Auto Day Slot Generator — {activeTurf.name}</span>
                                    <p className="text-[11px] text-emerald-800 font-medium mt-1">
                                        Select target date, opening start time, closing end time, and slot duration in minutes (e.g. 60 mins). All slots for the day will be calculated and generated automatically!
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Input
                                    label="Target Date *"
                                    type="date"
                                    value={bulkForm.date}
                                    onChange={e => setBulkForm({ ...bulkForm, date: e.target.value })}
                                />
                                <Select
                                    label="Start Time (Opening) *"
                                    value={bulkForm.startTime}
                                    onChange={e => setBulkForm({ ...bulkForm, startTime: e.target.value })}
                                    options={[
                                        { value: '05:00', label: '05:00 AM' },
                                        { value: '06:00', label: '06:00 AM' },
                                        { value: '07:00', label: '07:00 AM' },
                                        { value: '08:00', label: '08:00 AM' },
                                        { value: '09:00', label: '09:00 AM' },
                                        { value: '10:00', label: '10:00 AM' },
                                        { value: '11:00', label: '11:00 AM' },
                                        { value: '12:00', label: '12:00 PM' },
                                        { value: '13:00', label: '01:00 PM' },
                                        { value: '14:00', label: '02:00 PM' },
                                        { value: '15:00', label: '03:00 PM' },
                                        { value: '16:00', label: '04:00 PM' },
                                        { value: '17:00', label: '05:00 PM' },
                                        { value: '18:00', label: '06:00 PM' }
                                    ]}
                                />
                                <Select
                                    label="End Time (Closing) *"
                                    value={bulkForm.endTime}
                                    onChange={e => setBulkForm({ ...bulkForm, endTime: e.target.value })}
                                    options={[
                                        { value: '12:00', label: '12:00 PM' },
                                        { value: '14:00', label: '02:00 PM' },
                                        { value: '16:00', label: '04:00 PM' },
                                        { value: '18:00', label: '06:00 PM' },
                                        { value: '20:00', label: '08:00 PM' },
                                        { value: '21:00', label: '09:00 PM' },
                                        { value: '22:00', label: '10:00 PM' },
                                        { value: '23:00', label: '11:00 PM' },
                                        { value: '23:59', label: '12:00 AM (Midnight)' }
                                    ]}
                                />
                            </div>

                            {/* Slot Duration Selector (Minutes) */}
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                                    Slot Duration (in Minutes) *
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { mins: 30, label: '30 Mins (0.5 Hr)' },
                                        { mins: 60, label: '60 Mins (1.0 Hr)' },
                                        { mins: 90, label: '90 Mins (1.5 Hr)' },
                                        { mins: 120, label: '120 Mins (2.0 Hr)' }
                                    ].map(item => (
                                        <button
                                            key={item.mins}
                                            type="button"
                                            onClick={() => setBulkForm({ ...bulkForm, durationMinutes: item.mins })}
                                            className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                                                Number(bulkForm.durationMinutes) === item.mins
                                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 shadow-2xs'
                                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Cricket Price (₹/hr)"
                                    type="number"
                                    value={bulkForm.cricketPrice}
                                    onChange={e => setBulkForm({ ...bulkForm, cricketPrice: e.target.value })}
                                />
                                <Input
                                    label="Football Price (₹/hr)"
                                    type="number"
                                    value={bulkForm.footballPrice}
                                    onChange={e => setBulkForm({ ...bulkForm, footballPrice: e.target.value })}
                                />
                            </div>

                            {/* Real-time Preview Box */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <span>🎯</span> Live Day Slots Preview ({generatedPreviewSlots.length} Slots Generated)
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                                        {bulkForm.durationMinutes} Mins / Slot
                                    </span>
                                </div>

                                {generatedPreviewSlots.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 text-xs" style={{ scrollbarWidth: 'thin' }}>
                                        {generatedPreviewSlots.map((gen, i) => (
                                            <span
                                                key={i}
                                                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 font-mono shadow-2xs"
                                            >
                                                {gen.label}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-rose-500 font-bold italic">Please select a valid time range.</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setCreateSlotOpen(false)}
                                    className="h-10 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={generatedPreviewSlots.length === 0}
                                    className="h-10 px-6 rounded-xl bg-[#10B981] hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                                >
                                    ⚡ Generate & Create All {generatedPreviewSlots.length} Slots for Day
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* ➕ SINGLE CUSTOM SLOT FORM */
                        <form onSubmit={handleSaveSlot} className="space-y-4">
                            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/60 text-xs font-bold text-emerald-900">
                                <span>Turf: {activeTurf.name} (Single Ground)</span>
                                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Creating a slot makes the physical ground available for both Cricket and Football.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Slot Date"
                                    type="date"
                                    value={slotForm.date}
                                    onChange={e => setSlotForm({ ...slotForm, date: e.target.value })}
                                />
                                <Select
                                    label="Start Time"
                                    value={slotForm.startTime}
                                    onChange={e => setSlotForm({ ...slotForm, startTime: e.target.value })}
                                    options={activeTimeSlots.map(t => ({ value: t.id, label: t.label }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Cricket Price (₹)"
                                    type="number"
                                    value={slotForm.cricketPrice}
                                    onChange={e => setSlotForm({ ...slotForm, cricketPrice: e.target.value })}
                                />
                                <Input
                                    label="Football Price (₹)"
                                    type="number"
                                    value={slotForm.footballPrice}
                                    onChange={e => setSlotForm({ ...slotForm, footballPrice: e.target.value })}
                                />
                            </div>

                            <Select
                                label="Repeat Schedule"
                                value={slotForm.repeat}
                                onChange={e => setSlotForm({ ...slotForm, repeat: e.target.value })}
                                options={[
                                    { value: 'none', label: 'Does not repeat' },
                                    { value: 'daily', label: 'Daily (Everyday)' },
                                    { value: 'weekly', label: 'Weekly (Same Day)' },
                                    { value: 'mon_fri', label: 'Monday to Friday' },
                                    { value: 'sat_sun', label: 'Saturday & Sunday' }
                                ]}
                            />

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setCreateSlotOpen(false)}
                                    className="h-10 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="h-10 px-6 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
                                >
                                    Create Slot
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>

            {/* ── MODAL 2: Create Booking & Slot Price Management Drawer ── */}
            <Modal
                isOpen={createBookingOpen}
                onClose={() => setCreateBookingOpen(false)}
                title={`Slot Action — ${targetSlotCtx?.timeLabel || '06:00 AM'} (${targetSlotCtx?.date || currentDate})`}
                size="lg"
            >
                <div className="space-y-5 pt-1">
                    {/* Tab Navigation: Create Booking vs Edit Slot Rates */}
                    <div className="flex p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/70 gap-1.5 text-xs font-bold shadow-2xs">
                        <button
                            type="button"
                            onClick={() => setSlotActionTab('BOOKING')}
                            className={`flex-1 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                slotActionTab === 'BOOKING'
                                    ? 'bg-[#10B981] text-white shadow-md shadow-emerald-500/20 font-black'
                                    : 'text-slate-600 hover:text-slate-900 font-extrabold hover:bg-slate-200/50'
                            }`}
                        >
                            <span className="text-sm">🎟️</span> Create Customer Booking
                        </button>
                        <button
                            type="button"
                            onClick={() => setSlotActionTab('EDIT_PRICE')}
                            className={`flex-1 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                slotActionTab === 'EDIT_PRICE'
                                    ? 'bg-[#10B981] text-white shadow-md shadow-emerald-500/20 font-black'
                                    : 'text-slate-600 hover:text-slate-900 font-extrabold hover:bg-slate-200/50'
                            }`}
                        >
                            <span className="text-sm">✏️</span> Edit Slot Price & Rates
                        </button>
                    </div>

                    {slotActionTab === 'BOOKING' ? (
                        /* 🎟️ TAB 1: CREATE BOOKING FORM */
                        <form onSubmit={handleSaveBooking} className="space-y-5">
                            {/* Slot Details Card */}
                            <div className="p-4 bg-gradient-to-r from-slate-50 via-slate-50/80 to-emerald-50/20 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">SLOT DETAILS</span>
                                    <span className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                                        {targetSlotCtx?.turfName} • {targetSlotCtx?.date || currentDate} ({targetSlotCtx?.timeLabel || '06:00 AM'})
                                    </span>
                                </div>
                                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100/90 text-emerald-900 font-black text-xs border border-emerald-300/80 shrink-0 self-start sm:self-auto flex items-center gap-1">
                                    {targetSlotCtx?.sportName || 'Cricket 🏏'}
                                </span>
                            </div>

                            {/* Form Row 1: Full Name & Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-800 uppercase tracking-tight mb-2">
                                        Customer Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Rahul Kumar"
                                        value={bookingForm.customerName}
                                        onChange={e => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 text-slate-900 text-sm font-semibold outline-none transition-all duration-200 placeholder:text-slate-400 placeholder:font-normal"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-800 uppercase tracking-tight mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="+91 98765 43210"
                                        value={bookingForm.phone}
                                        onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 text-slate-900 text-sm font-semibold outline-none transition-all duration-200 placeholder:text-slate-400 placeholder:font-normal"
                                    />
                                </div>
                            </div>

                            {/* Form Row 2: Select Sport & Booking Amount */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Select
                                    label="Select Sport Played *"
                                    value={bookingForm.sportId}
                                    onChange={e => {
                                        const val = e.target.value
                                        const sp = activeTurf.sports.find(s => s.id === val)
                                        const customP = targetSlotCtx?.customPrices?.[val] || sp?.price || 1000
                                        setBookingForm({ ...bookingForm, sportId: val, amount: customP })
                                    }}
                                    options={activeTurf.sports.map(s => ({
                                        value: s.id,
                                        label: `${s.name} ${s.icon || ''} (₹${targetSlotCtx?.customPrices?.[s.id] || s.price})`
                                    }))}
                                />
                                <div>
                                    <label className="block text-xs font-black text-slate-800 uppercase tracking-tight mb-1">
                                        Booking Amount (₹) [Editable]
                                    </label>
                                    <input
                                        type="number"
                                        value={bookingForm.amount}
                                        onChange={e => setBookingForm({ ...bookingForm, amount: e.target.value })}
                                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-500/10 text-slate-900 text-xs font-extrabold outline-none transition-all duration-200"
                                    />
                                </div>
                            </div>

                            {/* Form Row 3: Payment Status & Payment Method */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Select
                                    label="Payment Status"
                                    value={bookingForm.paymentStatus}
                                    onChange={e => setBookingForm({ ...bookingForm, paymentStatus: e.target.value })}
                                    options={[
                                        { value: 'Paid', label: '✅ Paid (Confirmed)' },
                                        { value: 'Pending', label: '⏳ Pending Payment' }
                                    ]}
                                />
                                <Select
                                    label="Payment Method"
                                    value={bookingForm.paymentMethod}
                                    onChange={e => setBookingForm({ ...bookingForm, paymentMethod: e.target.value })}
                                    options={[
                                        { value: 'UPI', label: '📱 UPI' },
                                        { value: 'Cash', label: '💵 Cash (Walk-in)' },
                                        { value: 'Card', label: '💳 Credit/Debit Card' },
                                        { value: 'Wallet', label: '👛 Wallet' }
                                    ]}
                                />
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setCreateBookingOpen(false)}
                                    className="w-full sm:w-auto h-12 px-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-100/80 text-slate-700 font-bold text-xs transition-all duration-200 cursor-pointer shadow-2xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto h-12 px-7 rounded-xl bg-[#10B981] hover:bg-emerald-600 active:scale-[0.98] text-white font-black text-xs transition-all duration-200 shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* ✏️ TAB 2: EDIT SLOT CUSTOM PRICE FORM */
                        <form onSubmit={handleSaveCustomSlotPrices} className="space-y-5">
                            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/90 text-xs font-bold text-amber-950 flex items-start gap-3 shadow-2xs">
                                <span className="text-2xl shrink-0">💰</span>
                                <div>
                                    <span className="font-black text-sm block">Custom Slot Price Override ({targetSlotCtx?.timeLabel})</span>
                                    <p className="text-[11px] text-amber-800 font-semibold mt-0.5 leading-relaxed">
                                        Adjust rate specifically for this time slot (e.g. Peak Evening Surge, Weekend Special, or Discount).
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-800 uppercase tracking-tight mb-2">
                                        Cricket Rate Override (₹/hr)
                                    </label>
                                    <input
                                        type="number"
                                        value={slotPriceForm.cricketPrice}
                                        onChange={e => setSlotPriceForm({ ...slotPriceForm, cricketPrice: e.target.value })}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 text-slate-900 text-sm font-semibold outline-none transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-800 uppercase tracking-tight mb-2">
                                        Football Rate Override (₹/hr)
                                    </label>
                                    <input
                                        type="number"
                                        value={slotPriceForm.footballPrice}
                                        onChange={e => setSlotPriceForm({ ...slotPriceForm, footballPrice: e.target.value })}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 text-slate-900 text-sm font-semibold outline-none transition-all duration-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-800 uppercase tracking-tight mb-2">
                                    Surge Tag / Label (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 🔥 Prime Evening, Weekend Surge, IPL Special"
                                    value={slotPriceForm.surgeTag}
                                    onChange={e => setSlotPriceForm({ ...slotPriceForm, surgeTag: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 text-slate-900 text-sm font-semibold outline-none transition-all duration-200 placeholder:text-slate-400 placeholder:font-normal"
                                />
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setCreateBookingOpen(false)}
                                    className="w-full sm:w-auto h-12 px-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-100/80 text-slate-700 font-bold text-xs transition-all duration-200 cursor-pointer shadow-2xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto h-12 px-7 rounded-xl bg-[#10B981] hover:bg-emerald-600 active:scale-[0.98] text-white font-black text-xs transition-all duration-200 shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    💾 Save Custom Slot Price
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>

            {/* ── MODAL 3: Booking Details Slide-Over Drawer ── */}
            <Modal
                isOpen={bookingDetailsOpen}
                onClose={() => setBookingDetailsOpen(false)}
                title={`Booking Details - ${selectedBooking?.id || ''}`}
                size="lg"
            >
                {selectedBooking && (
                    <div className="space-y-5 pt-2">
                        {/* Customer Info Card */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                    <HiUser className="text-[#10B981]" /> {selectedBooking.customerName}
                                </h4>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    selectedBooking.paymentStatus === 'Paid' ? 'bg-emerald-100 text-[#10B981]' : 'bg-amber-100 text-amber-800'
                                }`}>
                                    {selectedBooking.paymentStatus}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 pt-1">
                                <p className="flex items-center gap-1.5"><HiPhone className="text-slate-400" /> {selectedBooking.phone}</p>
                                <p className="flex items-center gap-1.5"><HiMail className="text-slate-400" /> {selectedBooking.email}</p>
                            </div>
                        </div>

                        {/* Booking & Payment Ledger */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                                <span className="text-slate-400 font-semibold text-[10px] uppercase">Sport & Time</span>
                                <p className="font-black text-slate-900">{selectedBooking.sportName}</p>
                                <p className="text-slate-500 font-medium">{currentDate} ({selectedBooking.slotData?.timeId}:00)</p>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                                <span className="text-slate-400 font-semibold text-[10px] uppercase">Total Amount</span>
                                <p className="font-black text-emerald-600 text-base">₹{selectedBooking.amount}</p>
                                <p className="text-slate-500 font-medium">Method: {selectedBooking.paymentMethod}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-slate-100">
                            {selectedBooking.paymentStatus === 'Pending' && (
                                <button
                                    onClick={() => {
                                        setSlotsData(prev => prev.map(s => s.id === selectedBooking.slotData.id ? { ...s, status: 'Booked', booking: { ...s.booking, paymentStatus: 'Paid', paidAmount: s.booking.amount, status: 'Confirmed' } } : s))
                                        addToast({ title: 'Payment Recorded', message: 'Marked as paid!', type: 'success' })
                                        setBookingDetailsOpen(false)
                                    }}
                                    className="h-10 px-4 rounded-xl bg-emerald-50 text-[#10B981] hover:bg-emerald-100 font-extrabold text-xs transition-colors cursor-pointer"
                                >
                                    Record Payment
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    setSlotsData(prev => prev.filter(s => s.id !== selectedBooking.slotData.id))
                                    addToast({ title: 'Booking Cancelled', message: `Booking ${selectedBooking.id} cancelled`, type: 'info' })
                                    setBookingDetailsOpen(false)
                                }}
                                className="h-10 px-4 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs transition-colors cursor-pointer"
                            >
                                Cancel Booking
                            </button>

                            <button
                                onClick={() => setBookingDetailsOpen(false)}
                                className="h-10 px-5 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── MODAL 4: Block / Unblock Slot Modal ── */}
            <Modal
                isOpen={blockSlotOpen}
                onClose={() => setBlockSlotOpen(false)}
                title="Block / Unblock Single Physical Ground"
                size="md"
            >
                <form onSubmit={handleSaveBlockSlot} className="space-y-4 pt-2">
                    <Select
                        label="Block Reason *"
                        value={blockForm.reason}
                        onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })}
                        options={[
                            { value: 'Maintenance', label: 'Ground Maintenance / Net Repair' },
                            { value: 'Private Event', label: 'Private Event' },
                            { value: 'Owner Reservation', label: 'Turf Owner Reservation' },
                            { value: 'Holiday', label: 'Holiday' },
                            { value: 'Other', label: 'Other Reason' }
                        ]}
                    />

                    <Input
                        label="Notes (Optional)"
                        placeholder="Add additional notes..."
                        value={blockForm.notes}
                        onChange={e => setBlockForm({ ...blockForm, notes: e.target.value })}
                    />

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        {targetSlotCtx?.status === 'Blocked' ? (
                            <button
                                type="button"
                                onClick={handleUnblockSlot}
                                className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-extrabold text-xs transition-colors cursor-pointer"
                            >
                                Unblock Ground
                            </button>
                        ) : <div />}

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setBlockSlotOpen(false)}
                                className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="h-10 px-5 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                Save Block
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* ── MODAL 5: Add New Single Ground Multi-Sport Turf Modal ── */}
            <Modal
                isOpen={addTurfOpen}
                onClose={() => setAddTurfOpen(false)}
                title="Add New Single Ground Multi-Sport Turf"
                size="md"
            >
                <form onSubmit={handleSaveNewTurf} className="space-y-4 pt-2">
                    <Input
                        label="Turf Arena Name *"
                        placeholder="e.g. Champions Sports Arena"
                        value={newTurfForm.name}
                        onChange={e => setNewTurfForm({ ...newTurfForm, name: e.target.value })}
                    />
                    <Input
                        label="Location / City"
                        placeholder="e.g. Mumbai, MH"
                        value={newTurfForm.location}
                        onChange={e => setNewTurfForm({ ...newTurfForm, location: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Cricket Price (₹/hr)"
                            type="number"
                            value={newTurfForm.cricketPrice}
                            onChange={e => setNewTurfForm({ ...newTurfForm, cricketPrice: e.target.value })}
                        />
                        <Input
                            label="Football Price (₹/hr)"
                            type="number"
                            value={newTurfForm.footballPrice}
                            onChange={e => setNewTurfForm({ ...newTurfForm, footballPrice: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setAddTurfOpen(false)}
                            className="h-10 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="h-10 px-6 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
                        >
                            Create Turf
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
