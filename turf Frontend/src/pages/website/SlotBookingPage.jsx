import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { HiCheck, HiCreditCard, HiUsers, HiOutlineCheckCircle, HiShare, HiArrowRight, HiArrowLeft, HiLocationMarker, HiStar, HiX, HiUser } from 'react-icons/hi'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'

// Available venues / turfs database lookup
const allAvailableTurfs = [
    { id: 1, name: 'Super Strikers Turf', location: 'Andheri West', city: 'Mumbai', price: 1800, rating: 4.9, sports: ['Cricket', 'Football'], image: '/images/turf1.png' },
    { id: 2, name: 'Champion Cricket Ground', location: 'Koramangala', city: 'Bangalore', price: 1500, rating: 4.8, sports: ['Cricket'], image: '/images/turf2.png' },
    { id: 3, name: 'GameVault Center', location: 'Koramangala', city: 'Bangalore', price: 1200, rating: 4.9, sports: ['Football', 'Cricket'], image: '/images/turf3.png' },
    { id: 4, name: 'ProKick Stadium', location: 'Indiranagar', city: 'Bangalore', price: 1400, rating: 4.7, sports: ['Football'], image: '/images/turf4.png' },
    { id: 6, name: 'Royal Cricket Ground', location: 'Vijay Nagar', city: 'Indore', price: 1000, rating: 4.7, sports: ['Cricket'], image: '/images/turf5.png' },
    { id: 14, name: 'Indore Sports Complex', location: 'LIG Colony', city: 'Indore', price: 1200, rating: 4.9, sports: ['Football', 'Cricket'], image: '/images/turf6.png' },
]

// Generate upcoming days starting from Sat 9 Aug
const generateUpcomingDays = () => {
    const days = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    const baseDate = new Date(2026, 7, 9)

    for (let i = 0; i < 9; i++) {
        const d = new Date(baseDate)
        d.setDate(baseDate.getDate() + i)
        days.push({
            id: `date-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            fullDateString: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            dayShort: dayNames[d.getDay()],
            dayFull: fullDayNames[d.getDay()],
            dateNum: d.getDate(),
            monthShort: monthNames[d.getMonth()],
            year: d.getFullYear(),
            formattedLabel: `${fullDayNames[d.getDay()].toUpperCase()}, ${d.getDate()} ${monthNames[d.getMonth()].toUpperCase()}`
        })
    }
    return days
}

// Available Time Slots matching exact grid
const allTimeSlots = [
    { id: '06:00', time: '6:00 AM', isBooked: false },
    { id: '07:00', time: '7:00 AM', isBooked: false },
    { id: '08:00', time: '8:00 AM', isBooked: false },
    { id: '09:00', time: '9:00 AM', isBooked: true }, // Dimmed
    { id: '10:00', time: '10:00 AM', isBooked: false },
    { id: '11:00', time: '11:00 AM', isBooked: false },
    { id: '12:00', time: '12:00 PM', isBooked: false },
    { id: '13:00', time: '1:00 PM', isBooked: false },
    { id: '14:00', time: '2:00 PM', isBooked: false },
    { id: '15:00', time: '3:00 PM', isBooked: false },
    { id: '16:00', time: '4:00 PM', isBooked: false },
    { id: '17:00', time: '5:00 PM', isBooked: false },
    { id: '18:00', time: '6:00 PM', isBooked: false }, // Selected
    { id: '19:00', time: '7:00 PM', isBooked: false },
    { id: '20:00', time: '8:00 PM', isBooked: true }, // Dimmed
    { id: '21:00', time: '9:00 PM', isBooked: false },
]

export default function SlotBookingPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const toastContext = useToast()
    const addToast = toastContext?.addToast
    const { user } = useAuth()

    // Selected Turf Venue State
    const [selectedVenue, setSelectedVenue] = useState(() => {
        const found = allAvailableTurfs.find(t => t.id === Number(id))
        return found || allAvailableTurfs[0]
    })

    // Venue switch modal state
    const [isVenueModalOpen, setIsVenueModalOpen] = useState(false)

    // Step state: 1 to 4 (Directly starts on Step 1: Date & Time as requested)
    const [activeStep, setActiveStep] = useState(1)

    // Step 1: Date & Slot
    const dateList = generateUpcomingDays()
    const [selectedDateObj, setSelectedDateObj] = useState(dateList[0])
    const [selectedSlotTime, setSelectedSlotTime] = useState('18:00') // 6:00 PM
    const [selectedSport, setSelectedSport] = useState(searchParams.get('sport') || 'Cricket')
    const [durationHours, setDurationHours] = useState(1)

    // Step 2: Payment Mode Options
    const [paymentMode, setPaymentMode] = useState('full')
    const [customSplitMyShare, setCustomSplitMyShare] = useState(1200)

    // Step 3: Teams & Customer Details
    const initialName = user?.name || user?.customerName || (user?.email ? user.email.split('@')[0] : 'Rahul Sharma')
    const initialPhone = user?.phone || user?.mobileNumber || '+91 98765 43210'
    const [teamAName, setTeamAName] = useState(user?.teamName || 'Andheri Strikers')
    const [captainName, setCaptainName] = useState(initialName)
    const [captainPhone, setCaptainPhone] = useState(initialPhone)
    const [teammates, setTeammates] = useState([
        { id: 1, name: `${initialName} (Captain)`, phone: initialPhone, amount: 900, status: 'Paid', isCaptain: true, tag: 'You' },
        { id: 2, name: 'Vikram Singh', phone: '+91 98765 43211', amount: 0, status: 'Pending', isCaptain: false, tag: 'VS' },
    ])

    useEffect(() => {
        if (user) {
            const uName = user.name || user.customerName || (user.email ? user.email.split('@')[0] : 'Player')
            const uPhone = user.phone || user.mobileNumber || '+91 98765 43210'
            setCaptainName(uName)
            setCaptainPhone(uPhone)
            setTeammates(prev => [
                { ...prev[0], name: `${uName} (Captain)`, phone: uPhone },
                ...prev.slice(1)
            ])
        }
    }, [user])
    const [hasOpponentTeam, setHasOpponentTeam] = useState(true)
    const [teamBName, setTeamBName] = useState('Dadar Destroyers')
    const [teamBPhone, setTeamBPhone] = useState('+91 98765 43222')
    const [isOpenChallenge, setIsOpenChallenge] = useState(false)
    const [newTeammateName, setNewTeammateName] = useState('')
    const [showAddTeammateInput, setShowAddTeammateInput] = useState(false)

    // Step 4: Generated Booking ID
    const [bookingId, setBookingId] = useState('BMT-9AUG-78432')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [activeStep])

    const totalRent = selectedVenue.price * durationHours
    const myShareAmount = paymentMode === 'full' 
        ? totalRent 
        : paymentMode === 'split-50' 
            ? totalRent / 2 
            : paymentMode === 'custom' 
                ? customSplitMyShare 
                : paymentMode === 'dare' 
                    ? 100 
                    : Math.round(totalRent / 6)

    const opponentShareAmount = totalRent - myShareAmount

    const handleSwitchVenue = (turf) => {
        setSelectedVenue(turf)
        setIsVenueModalOpen(false)
        if (addToast) addToast(`Switched venue to ${turf.name}!`, 'info')
    }

    const handleAddTeammate = () => {
        if (!newTeammateName.trim()) return
        const newMember = {
            id: Date.now(),
            name: newTeammateName.trim(),
            phone: '+91 98765 ' + Math.floor(10000 + Math.random() * 90000),
            amount: 0,
            status: 'Pending',
            isCaptain: false,
            tag: 'TM'
        }
        setTeammates(prev => [...prev, newMember])
        setNewTeammateName('')
        setShowAddTeammateInput(false)
        if (addToast) addToast(`Added ${newMember.name} to roster!`, 'info')
    }

    const handleProceedToConfirm = async () => {
        setIsSubmitting(true)
        const generatedId = `BMT-${selectedDateObj.dateNum}${selectedDateObj.monthShort.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`
        setBookingId(generatedId)

        try {
            await fetch('http://localhost:5000/api/v1/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slotId: `slot_${selectedVenue.id}_${selectedDateObj.fullDateString.replace(/-/g, '')}_${selectedSlotTime.replace(':', '')}`,
                    customerName: captainName,
                    mobileNumber: captainPhone,
                    notes: `Match: ${selectedSport} at ${selectedVenue.name} - ${teamAName} vs ${teamBName}`
                })
            })

            const existing = JSON.parse(localStorage.getItem('customer_bookings') || '[]')
            const newEntry = {
                id: generatedId,
                sport: selectedSport,
                venue: selectedVenue.name,
                date: selectedDateObj.fullDateString,
                time: '6:00 PM',
                amount: `₹${myShareAmount.toLocaleString('en-IN')}`,
                status: 'Confirmed'
            }
            localStorage.setItem('customer_bookings', JSON.stringify([newEntry, ...existing]))
        } catch (e) {
            console.error(e)
        }

        setIsSubmitting(false)
        setActiveStep(4)
        if (addToast) addToast('Match successfully created and invite dispatched!', 'success')
    }

    const steps = [
        { num: 1, label: '1. Date & Time' },
        { num: 2, label: '2. Payment Mode' },
        { num: 3, label: '3. Teams' },
        { num: 4, label: '4. Confirm' },
    ]

    return (
        <div className="min-h-screen text-[#111827] font-sans pt-20 pb-28 px-4 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto">

                {/* ═══════════════════════════════════════════════════
                    BACK TO ALL TURFS QUICK NAVIGATION BAR
                ═══════════════════════════════════════════════════ */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#16A34A] transition-colors cursor-pointer group bg-white border border-[#E5E7EB] hover:border-[#16A34A]/50 px-3.5 py-1.5 rounded-full shadow-sm"
                    >
                        <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>← Back to Turf Details</span>
                    </button>

                    <button
                        onClick={() => setIsVenueModalOpen(true)}
                        className="text-xs font-bold text-[#16A34A] hover:text-emerald-700 underline underline-offset-4 cursor-pointer flex items-center gap-1"
                    >
                        <span>Change Turf Venue (Switch)</span>
                        <span>▾</span>
                    </button>
                </div>

                {/* ═══════════════════════════════════════════════════
                    TOP STEP NAVIGATION BAR (Landing Page Style)
                ═══════════════════════════════════════════════════ */}
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar mb-10">
                    {steps.map((step) => {
                        const isActive = activeStep === step.num
                        const isPast = activeStep > step.num

                        return (
                            <button
                                key={step.num}
                                onClick={() => setActiveStep(step.num)}
                                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm ${
                                    isActive
                                        ? 'bg-[#111827] text-white border-2 border-[#16A34A] shadow-[0_4px_15px_rgba(22,163,74,0.25)]'
                                        : isPast
                                            ? 'bg-white text-[#111827] border border-[#E5E7EB] hover:border-[#16A34A]'
                                            : 'bg-white/80 text-[#6B7280] border border-[#E5E7EB] hover:border-[#16A34A]/50 hover:text-[#111827]'
                                }`}
                            >
                                {isPast && <HiCheck className="w-3.5 h-3.5 text-[#16A34A]" />}
                                <span>{step.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* ═══════════════════════════════════════════════════
                    STEP 1: DATE & TIME (Starts Directly Here)
                ═══════════════════════════════════════════════════ */}
                {activeStep === 1 && (
                    <div className="animate-in fade-in duration-200">
                        {/* Title & Subtitle with Duration Hours Selector */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight mb-2">
                                    Pick date & time slot
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#6B7280]">
                                    <span>{selectedVenue.name} — {selectedVenue.location} · ₹{selectedVenue.price.toLocaleString('en-IN')}/hr</span>
                                    <button
                                        onClick={() => setIsVenueModalOpen(true)}
                                        className="text-xs font-bold text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md hover:bg-emerald-100 cursor-pointer transition-colors"
                                    >
                                        Switch Turf ▾
                                    </button>
                                </div>
                            </div>

                            {/* Duration Hours Selector */}
                            <div className="flex items-center gap-2.5">
                                <span className="text-xs font-black tracking-wider text-[#6B7280] uppercase">
                                    Duration:
                                </span>
                                <div className="flex items-center bg-slate-100 border border-[#E5E7EB] rounded-xl p-1 shadow-xs">
                                    {[1, 2, 3].map((hr) => (
                                        <button
                                            key={hr}
                                            onClick={() => setDurationHours(hr)}
                                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                                durationHours === hr
                                                    ? 'bg-[#111827] text-white shadow-md'
                                                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-slate-200/60'
                                            }`}
                                        >
                                            {hr} {hr === 1 ? 'Hour' : 'Hours'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* SELECT DATE Section */}
                        <div className="mb-10">
                            <h2 className="text-xs font-black uppercase tracking-widest text-[#6B7280] mb-4">
                                SELECT DATE
                            </h2>

                            {/* Horizontal date cards */}
                            <div className="flex gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar">
                                {dateList.map((d) => {
                                    const isSelected = selectedDateObj.id === d.id
                                    return (
                                        <button
                                            key={d.id}
                                            onClick={() => setSelectedDateObj(d)}
                                            className={`flex-shrink-0 w-20 sm:w-22 py-4 px-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[#111827] text-white border-2 border-[#16A34A] shadow-md'
                                                    : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#16A34A]/60 hover:text-[#111827] shadow-sm'
                                            }`}
                                        >
                                            <span className={`text-xs font-bold mb-1 ${isSelected ? 'text-slate-300' : 'text-[#6B7280]'}`}>
                                                {d.dayShort}
                                            </span>
                                            <span className={`text-2xl sm:text-3xl font-black tracking-tight my-0.5 ${isSelected ? 'text-white' : 'text-[#111827]'}`}>
                                                {d.dateNum}
                                            </span>
                                            <span className={`text-xs font-bold mt-1 ${isSelected ? 'text-slate-300' : 'text-[#6B7280]'}`}>
                                                {d.monthShort}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* AVAILABLE SLOTS Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-black uppercase tracking-widest text-[#6B7280]">
                                    AVAILABLE SLOTS — {selectedDateObj.formattedLabel}
                                </h2>
                                <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider font-bold">
                                    <span className="flex items-center gap-1.5 text-slate-500">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-300" /> Available
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[#16A34A]">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-[#16A34A]" /> Selected
                                    </span>
                                    <span className="flex items-center gap-1.5 text-slate-400">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 border border-slate-300 line-through" /> Booked
                                    </span>
                                </div>
                            </div>

                            {/* Slot Grid (4 columns) */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                {allTimeSlots.map((slot) => {
                                    const isSelected = selectedSlotTime === slot.id
                                    const isDisabled = slot.isBooked

                                    return (
                                        <button
                                            key={slot.id}
                                            disabled={isDisabled}
                                            onClick={() => setSelectedSlotTime(slot.id)}
                                            className={`py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-150 text-center ${
                                                isSelected
                                                    ? 'bg-[#16A34A] text-white font-black shadow-lg border-2 border-[#15803D] cursor-pointer'
                                                    : isDisabled
                                                        ? 'bg-slate-100 text-slate-400 border border-slate-200 line-through opacity-60 cursor-not-allowed'
                                                        : 'bg-white text-[#111827] border border-[#E5E7EB] hover:border-[#16A34A] hover:bg-emerald-50/50 shadow-sm cursor-pointer'
                                            }`}
                                        >
                                            {slot.time}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Selected Slot Summary Line */}
                            {selectedSlotTime && (
                                <div className="mt-6 text-sm font-medium text-[#6B7280] flex items-center gap-2">
                                    <span>Selected: </span>
                                    <span className="text-[#111827] font-black">
                                        {allTimeSlots.find(s => s.id === selectedSlotTime)?.time || selectedSlotTime} ({durationHours} {durationHours > 1 ? 'Hours' : 'Hour'})
                                    </span>
                                    <span className="text-neutral-300">·</span>
                                    <span className="text-[#16A34A] font-black">₹{totalRent.toLocaleString('en-IN')} total</span>
                                </div>
                            )}
                        </div>

                        {/* Bottom Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#E5E7EB] mt-10">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <span>← Back to Turf Details</span>
                                </button>
                                <button
                                    onClick={() => setIsVenueModalOpen(true)}
                                    className="flex-1 sm:flex-none px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#111827] font-bold text-sm transition-colors cursor-pointer text-center"
                                >
                                    Switch Venue
                                </button>
                            </div>

                            <button
                                onClick={() => setActiveStep(2)}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-sm transition-all duration-200 shadow-[0_6px_20px_rgba(200,255,46,0.4)] border border-[#B5F000] cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span>Next: Payment mode →</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════
                    STEP 2: PAYMENT MODE (IMAGE 2)
                ═══════════════════════════════════════════════════ */}
                {activeStep === 2 && (
                    <div className="animate-in fade-in duration-200 space-y-6">
                        {/* Title & Match Subtitle */}
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight mb-2">
                                How do you want to pay?
                            </h1>
                            <p className="text-[#6B7280] text-sm font-semibold">
                                Match: {selectedSport} at {selectedVenue.name} · {selectedDateObj.dayShort} {selectedDateObj.dateNum} {selectedDateObj.monthShort} · 6:00 PM · ₹{totalRent.toLocaleString('en-IN')}
                            </p>
                        </div>

                        {/* Dashed Orange Banner */}
                        <div className="border-2 border-dashed border-amber-400 bg-amber-50/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3">
                            <span className="text-xl">🎯</span>
                            <p className="text-sm font-semibold text-amber-950">
                                <span className="font-black text-amber-700">New on BookMyTurf:</span> Split with opponent, dare them to play, or make loser pay!
                            </p>
                        </div>

                        {/* Payment Options List */}
                        <div className="space-y-3">
                            {[
                                {
                                    id: 'full',
                                    icon: '💳',
                                    title: 'I pay full amount',
                                    desc: `You pay ₹${totalRent.toLocaleString('en-IN')} now. Collect from your team later offline.`
                                },
                                {
                                    id: 'split-50',
                                    icon: '⚖️',
                                    title: 'Split 50-50 with opponent',
                                    desc: `You pay ₹${(totalRent / 2).toLocaleString('en-IN')} now. Opponent team pays ₹${(totalRent / 2).toLocaleString('en-IN')} to confirm the booking.`
                                },
                                {
                                    id: 'custom',
                                    icon: '🎴',
                                    title: 'Custom split',
                                    desc: 'You decide the split. Example: You pay ₹1,200, opponent pays ₹600.'
                                },
                                {
                                    id: 'dare',
                                    icon: '🔥',
                                    title: 'Dare to play — Loser pays all',
                                    desc: `Both teams pay ₹100 deposit. Winner gets full refund. Loser pays ₹${totalRent.toLocaleString('en-IN')}. Draw = split ₹${(totalRent / 2).toLocaleString('en-IN')} each.`
                                },
                                {
                                    id: 'per-player',
                                    icon: '👥',
                                    title: 'Per player split',
                                    desc: `Each player pays their share. 6 players = ₹${Math.round(totalRent / 6)} each. Send payment links to teammates.`
                                },
                            ].map((opt) => {
                                const isSelected = paymentMode === opt.id
                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => setPaymentMode(opt.id)}
                                        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                            isSelected
                                                ? 'bg-emerald-50/60 border-2 border-[#16A34A] shadow-md'
                                                : 'bg-white border-[#E5E7EB] hover:border-[#16A34A]/50 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3.5 sm:gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-[#E5E7EB] flex items-center justify-center text-lg flex-shrink-0">
                                                {opt.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-sm sm:text-base font-black text-[#111827] leading-tight">
                                                    {opt.title}
                                                </h3>
                                                <p className="text-xs text-[#6B7280] font-medium mt-1 leading-relaxed">
                                                    {opt.desc}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Radio Circle */}
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                                            isSelected ? 'border-[#16A34A] bg-[#16A34A]' : 'border-slate-300'
                                        }`}>
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Bottom Highlight Notice Banner */}
                        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs sm:text-sm text-sky-950 font-medium">
                            {paymentMode === 'full' && (
                                <p>
                                    <span className="font-bold text-[#111827]">Full pay selected:</span> You will be charged ₹{totalRent.toLocaleString('en-IN')} immediately. The slot is 100% yours. Invite opponent team for free.
                                </p>
                            )}
                            {paymentMode === 'split-50' && (
                                <p>
                                    <span className="font-bold text-[#111827]">Split 50-50 selected:</span> You pay ₹{(totalRent / 2).toLocaleString('en-IN')} now. Opponent team receives an invite to pay ₹{(totalRent / 2).toLocaleString('en-IN')}.
                                </p>
                            )}
                            {paymentMode === 'custom' && (
                                <p>
                                    <span className="font-bold text-[#111827]">Custom split selected:</span> You pay ₹1,200 now. Opponent team pays ₹600.
                                </p>
                            )}
                            {paymentMode === 'dare' && (
                                <p>
                                    <span className="font-bold text-[#111827]">Dare to play selected:</span> Both teams deposit ₹100. Match winner plays free; loser pays the slot rent.
                                </p>
                            )}
                            {paymentMode === 'per-player' && (
                                <p>
                                    <span className="font-bold text-[#111827]">Per player split selected:</span> You pay your ₹{Math.round(totalRent / 6)} share. 5 checkout links will be created.
                                </p>
                            )}
                        </div>

                        {/* Bottom Action Buttons */}
                        <div className="flex items-center justify-between pt-8 border-t border-[#E5E7EB] mt-10">
                            <button
                                onClick={() => setActiveStep(1)}
                                className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer flex items-center gap-2"
                            >
                                <span>← Back to Date & Time</span>
                            </button>

                            <button
                                onClick={() => setActiveStep(3)}
                                className="px-8 py-3.5 rounded-xl bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-sm transition-all duration-200 shadow-[0_6px_20px_rgba(200,255,46,0.4)] border border-[#B5F000] cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span>Next: Team details →</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════
                    STEP 3: TEAMS & INVITE
                ═══════════════════════════════════════════════════ */}
                {activeStep === 3 && (
                    <div className="animate-in fade-in duration-200 space-y-6">
                        {/* Title & Subtitle */}
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight mb-2">
                                Team details & invite
                            </h1>
                            <p className="text-[#6B7280] text-sm font-semibold">
                                Payment mode: {paymentMode === 'split-50' ? 'Split 50-50' : paymentMode === 'full' ? 'Full Pay' : paymentMode === 'dare' ? 'Dare to Play' : 'Per Player Split'}
                            </p>
                        </div>

                        {/* YOUR TEAM (TEAM A) Card */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-black uppercase tracking-widest text-[#6B7280]">
                                    YOUR TEAM (TEAM A) & CUSTOMER DETAILS
                                </h2>
                                {user && (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                                        ✓ Logged in as {user.name || user.email}
                                    </span>
                                )}
                            </div>

                            {/* Customer & Team Inputs */}
                            <div className="grid sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#6B7280] mb-1 block">
                                        Your Team Name
                                    </label>
                                    <input
                                        type="text"
                                        value={teamAName}
                                        onChange={(e) => setTeamAName(e.target.value)}
                                        className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-[#111827] text-xs font-bold outline-none focus:border-[#16A34A] focus:bg-white"
                                        placeholder="Team A Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#6B7280] mb-1 block">
                                        Customer / Captain Name
                                    </label>
                                    <input
                                        type="text"
                                        value={captainName}
                                        onChange={(e) => {
                                            setCaptainName(e.target.value);
                                            setTeammates(prev => [{ ...prev[0], name: `${e.target.value} (Captain)` }, ...prev.slice(1)]);
                                        }}
                                        className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-[#111827] text-xs font-bold outline-none focus:border-[#16A34A] focus:bg-white"
                                        placeholder="Your Full Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#6B7280] mb-1 block">
                                        Mobile Number (SMS / Invite)
                                    </label>
                                    <input
                                        type="text"
                                        value={captainPhone}
                                        onChange={(e) => {
                                            setCaptainPhone(e.target.value);
                                            setTeammates(prev => [{ ...prev[0], phone: e.target.value }, ...prev.slice(1)]);
                                        }}
                                        className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-[#111827] text-xs font-bold outline-none focus:border-[#16A34A] focus:bg-white"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            {/* Teammates List */}
                            <div className="space-y-2.5 pt-1">
                                {teammates.map((member) => (
                                    <div
                                        key={member.id}
                                        className="bg-slate-50 border border-[#E5E7EB] rounded-xl p-3.5 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                                member.tag === 'You' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                                            }`}>
                                                {member.tag}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-[#111827]">{member.name}</div>
                                                <div className="text-xs text-[#6B7280] font-medium mt-0.5">
                                                    {member.phone} {member.status === 'Paid' ? `· Paid ₹${member.amount || 900}` : '· Payment pending'}
                                                </div>
                                            </div>
                                        </div>

                                        <span className={`text-xs px-2.5 py-1 rounded-md font-black border ${
                                            member.status === 'Paid'
                                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                : 'bg-amber-100 text-amber-800 border-amber-300'
                                        }`}>
                                            {member.status}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Add Teammate Input / Button */}
                            {showAddTeammateInput ? (
                                <div className="flex gap-2 pt-2">
                                    <input
                                        type="text"
                                        value={newTeammateName}
                                        onChange={(e) => setNewTeammateName(e.target.value)}
                                        placeholder="Player name (e.g. Sameer Khan)"
                                        className="flex-1 bg-slate-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-[#111827] text-xs font-bold outline-none focus:border-[#16A34A] focus:bg-white"
                                    />
                                    <button
                                        onClick={handleAddTeammate}
                                        className="px-4 py-2.5 bg-[#111827] text-white font-bold text-xs rounded-xl hover:bg-black cursor-pointer"
                                    >
                                        Add
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAddTeammateInput(true)}
                                    className="w-full py-3 rounded-xl border border-[#E5E7EB] hover:border-[#16A34A] bg-slate-50 hover:bg-slate-100 text-[#111827] text-xs font-bold transition-colors cursor-pointer text-center block mt-2"
                                >
                                    + Add teammate
                                </button>
                            )}
                        </div>

                        {/* OPPONENT TEAM (TEAM B) Card */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-widest text-[#6B7280]">
                                OPPONENT TEAM (TEAM B)
                            </h2>

                            {/* Toggle Switch */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setHasOpponentTeam(!hasOpponentTeam)}
                                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                                        hasOpponentTeam ? 'bg-[#16A34A]' : 'bg-slate-300'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full transition-transform absolute top-0.5 bg-white shadow-sm ${
                                        hasOpponentTeam ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                                </button>
                                <span className="text-xs font-bold text-[#111827]">
                                    {hasOpponentTeam ? 'I have an opponent team ready to invite' : 'Open challenge — post match for anyone to join'}
                                </span>
                            </div>

                            {/* Opponent Inputs if Enabled */}
                            {hasOpponentTeam ? (
                                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-[#6B7280] mb-1.5 block">
                                            Opponent Team Name
                                        </label>
                                        <input
                                            type="text"
                                            value={teamBName}
                                            onChange={(e) => setTeamBName(e.target.value)}
                                            className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-[#111827] text-xs font-bold outline-none focus:border-[#16A34A] focus:bg-white"
                                            placeholder="Enter opponent team name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-[#6B7280] mb-1.5 block">
                                            Opponent Captain Phone
                                        </label>
                                        <input
                                            type="text"
                                            value={teamBPhone}
                                            onChange={(e) => setTeamBPhone(e.target.value)}
                                            className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-[#111827] text-xs font-bold outline-none focus:border-[#16A34A] focus:bg-white"
                                            placeholder="+91 98765 00000"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 font-medium">
                                    Your match will be listed under <strong className="text-emerald-800">Open Challenges</strong>. Any team captain in the area can accept and pay their share.
                                </div>
                            )}
                        </div>

                        {/* Bottom Action Buttons */}
                        <div className="flex items-center justify-between pt-8 border-t border-[#E5E7EB] mt-10">
                            <button
                                onClick={() => setActiveStep(2)}
                                className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer flex items-center gap-2"
                            >
                                <span>← Back</span>
                            </button>

                            <button
                                onClick={handleProceedToConfirm}
                                disabled={isSubmitting}
                                className="px-8 py-3.5 rounded-xl bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-sm transition-all duration-200 shadow-[0_6px_20px_rgba(200,255,46,0.4)] border border-[#B5F000] cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                <span>{isSubmitting ? 'Processing...' : 'Proceed & confirm match →'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════
                    STEP 4: CONFIRMATION
                ═══════════════════════════════════════════════════ */}
                {activeStep === 4 && (
                    <div className="animate-in fade-in duration-200 space-y-6">
                        {/* Green Success Badge */}
                        <div className="text-center space-y-3 py-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto text-3xl shadow-sm">
                                <HiCheck />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
                                Match invite dispatched!
                            </h1>
                            <p className="text-[#6B7280] text-sm font-semibold max-w-md mx-auto">
                                Booking reference: <strong className="text-[#111827] font-mono">{bookingId}</strong>. We've sent SMS invites to your teammates and opponent captain.
                            </p>
                        </div>

                        {/* Match Summary Box */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-6">
                            {/* Match Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
                                <div>
                                    <div className="text-xs font-black uppercase tracking-wider text-[#16A34A] mb-1">
                                        Confirmed Slot
                                    </div>
                                    <div className="text-xl font-black text-[#111827]">
                                        {selectedSport} Match · {selectedVenue.name}
                                    </div>
                                    <div className="text-xs text-[#6B7280] font-medium flex items-center gap-1 mt-1">
                                        <HiLocationMarker className="text-[#16A34A]" />
                                        <span>{selectedVenue.location}, {selectedVenue.city}</span>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <div className="text-2xl font-black text-[#111827]">
                                        ₹{myShareAmount.toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-[#6B7280] font-bold">
                                        Your share ({paymentMode === 'full' ? '100% Paid' : '50% Share'})
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                                <div className="bg-slate-50 rounded-xl p-3 border border-[#E5E7EB]">
                                    <div className="text-[10px] uppercase font-black text-[#6B7280]">Date</div>
                                    <div className="text-sm font-black text-[#111827] mt-0.5">{selectedDateObj.dayShort} {selectedDateObj.dateNum} {selectedDateObj.monthShort}</div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-[#E5E7EB]">
                                    <div className="text-[10px] uppercase font-black text-[#6B7280]">Time</div>
                                    <div className="text-sm font-black text-[#111827] mt-0.5">6:00 PM – 7:00 PM</div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-[#E5E7EB]">
                                    <div className="text-[10px] uppercase font-black text-[#6B7280]">Duration</div>
                                    <div className="text-sm font-black text-[#111827] mt-0.5">1 Hour</div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-[#E5E7EB]">
                                    <div className="text-[10px] uppercase font-black text-[#6B7280]">Mode</div>
                                    <div className="text-sm font-black text-[#111827] mt-0.5 capitalize">{paymentMode}</div>
                                </div>
                            </div>

                            {/* Teams Status Box */}
                            <div className="space-y-3 pt-2">
                                <div className="text-xs font-black uppercase tracking-wider text-[#6B7280]">
                                    Teams & Readiness
                                </div>

                                {/* Team A */}
                                <div className="bg-slate-50 border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                                            A
                                        </div>
                                        <div>
                                            <div className="font-black text-[#111827] text-sm">{teamAName}</div>
                                            <div className="text-xs text-[#6B7280] font-semibold mt-0.5">{captainName} · 2/6 players confirmed</div>
                                        </div>
                                    </div>
                                    <span className="text-xs px-2.5 py-1 rounded-md font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        Ready
                                    </span>
                                </div>

                                {/* VS Divider */}
                                <div className="text-center text-xs font-black text-slate-400 uppercase tracking-widest py-0.5">
                                    VS
                                </div>

                                {/* Team B */}
                                <div className="bg-slate-50 border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center font-bold text-xs">
                                            B
                                        </div>
                                        <div>
                                            <div className="font-black text-[#111827] text-sm">{teamBName}</div>
                                            <div className="text-xs text-[#6B7280] font-semibold mt-0.5">Invite sent · Waiting for captain to accept</div>
                                        </div>
                                    </div>
                                    <span className="text-xs px-2.5 py-1 rounded-md font-black bg-amber-100 text-amber-800 border border-amber-300">
                                        Pending
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Action Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t border-[#E5E7EB] mt-8">
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: `Match Invite: ${teamAName} vs ${teamBName}`,
                                            text: `Join the match at ${selectedVenue.name} on Sat 9 Aug 6:00 PM! Booking ID: ${bookingId}`,
                                            url: window.location.href
                                        })
                                    } else {
                                        navigator.clipboard.writeText(window.location.href)
                                        if (addToast) addToast('Match link copied to clipboard!', 'info')
                                    }
                                }}
                                className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer flex items-center gap-2"
                            >
                                <HiShare className="w-4 h-4 text-[#16A34A]" />
                                <span>Share match</span>
                            </button>

                            <button
                                onClick={() => navigate('/customer/bookings')}
                                className="px-8 py-3.5 rounded-xl bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-sm transition-all duration-200 shadow-[0_6px_20px_rgba(200,255,46,0.4)] border border-[#B5F000] cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span>View my matches</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-8 border-t border-[#E5E7EB]">
                            <button
                                onClick={() => navigate('/turfs')}
                                className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold text-sm transition-all shadow-sm cursor-pointer"
                            >
                                ← Browse All Turfs
                            </button>
                            <button
                                onClick={() => setActiveStep(2)}
                                className="px-8 py-3.5 rounded-xl bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-sm transition-all shadow-[0_6px_20px_rgba(200,255,46,0.4)] border border-[#B5F000] cursor-pointer"
                            >
                                Next: Date & Time →
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════
                    SWITCH TURF MODAL (Quick Selection Modal)
                ═══════════════════════════════════════════════════ */}
                {isVenueModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
                            <button
                                onClick={() => setIsVenueModalOpen(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-black cursor-pointer"
                            >
                                <HiX className="w-5 h-5" />
                            </button>

                            <h3 className="text-xl font-black text-[#111827] mb-1">
                                Choose Another Turf
                            </h3>
                            <p className="text-xs text-[#6B7280] font-medium mb-5">
                                Select any venue to immediately switch your booking session.
                            </p>

                            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                                {allAvailableTurfs.map((t) => {
                                    const isSelected = selectedVenue.id === t.id
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => handleSwitchVenue(t)}
                                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                                isSelected
                                                    ? 'bg-emerald-50 border-2 border-[#16A34A] shadow-sm'
                                                    : 'bg-slate-50 border-[#E5E7EB] hover:border-[#16A34A]/50 hover:bg-slate-100'
                                            }`}
                                        >
                                            <div>
                                                <div className="font-black text-sm text-[#111827]">{t.name}</div>
                                                <div className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5 font-medium">
                                                    <span>📍 {t.location}, {t.city}</span>
                                                    <span>•</span>
                                                    <span className="text-amber-500 font-bold">★ {t.rating}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-sm text-[#111827]">₹{t.price}</div>
                                                <div className="text-[10px] text-[#6B7280]">/hr</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex justify-between items-center">
                                <button
                                    onClick={() => {
                                        setIsVenueModalOpen(false)
                                        navigate('/turfs')
                                    }}
                                    className="text-xs font-bold text-[#6B7280] hover:text-[#111827] underline cursor-pointer"
                                >
                                    Browse Turfs Directory with Map & Filters →
                                </button>
                                <button
                                    onClick={() => setIsVenueModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#111827] font-bold text-xs rounded-xl cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
