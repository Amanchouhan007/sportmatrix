import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { HiCheck, HiCreditCard, HiUsers, HiOutlineCheckCircle, HiShare, HiArrowRight, HiArrowLeft, HiLocationMarker, HiStar, HiX, HiUser } from 'react-icons/hi'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'

// Available venues / turfs database lookup
const allAvailableTurfs = [
    { id: 1, name: 'SportZone Arena', location: 'Andheri West', city: 'Mumbai', price: 1200, rating: 4.8, sports: ['Cricket', 'Football'], image: '/images/turf1.png' },
    { id: 2, name: 'Champion Cricket Ground', location: 'Koramangala', city: 'Bangalore', price: 1500, rating: 4.9, sports: ['Cricket'], image: '/images/turf2.png' },
    { id: 3, name: 'GameVault Center', location: 'Koramangala', city: 'Bangalore', price: 1200, rating: 4.9, sports: ['Football', 'Cricket'], image: '/images/turf3.png' },
    { id: 4, name: 'ProKick Stadium', location: 'Indiranagar', city: 'Bangalore', price: 1400, rating: 4.7, sports: ['Football'], image: '/images/turf4.png' },
    { id: 5, name: 'ProPlay Arena', location: 'Vashi', city: 'Mumbai', price: 1000, rating: 4.5, sports: ['Football'], image: '/images/turf4.png' },
    { id: 6, name: 'Royal Cricket Ground', location: 'Vijay Nagar', city: 'Indore', price: 1000, rating: 4.7, sports: ['Cricket'], image: '/images/turf5.png' },
    { id: 7, name: 'DunkZone', location: 'Bandra', city: 'Mumbai', price: 750, rating: 4.3, sports: ['Football'], image: '/images/turf2.png' },
    { id: 8, name: 'PixelArena', location: 'HSR Layout', city: 'Bangalore', price: 1500, rating: 4.8, sports: ['Football', 'Cricket'], image: '/images/turf6.png' },
    { id: 9, name: 'Skyline Football Turf', location: 'Powai', city: 'Mumbai', price: 1400, rating: 4.6, sports: ['Football'], image: '/images/turf6.png' },
    { id: 10, name: 'StrikeZone Cricket', location: 'Noida', city: 'Delhi', price: 850, rating: 4.6, sports: ['Cricket'], image: '/images/turf7.png' },
    { id: 11, name: 'Master Blaster Cricket', location: 'Saket', city: 'Delhi', price: 1100, rating: 4.8, sports: ['Cricket'], image: '/images/turf7.png' },
    { id: 12, name: 'Pune Football Arena', location: 'Kothrud', city: 'Pune', price: 1000, rating: 4.5, sports: ['Football'], image: '/images/turf2.png' },
    { id: 13, name: 'Spike Football Turf', location: 'Bhawarkua', city: 'Indore', price: 500, rating: 4.6, sports: ['Football'], image: '/images/turf1.png' },
    { id: 14, name: 'Indore Sports Complex', location: 'LIG Colony', city: 'Indore', price: 1200, rating: 4.9, sports: ['Football', 'Cricket'], image: '/images/turf3.png' },
    { id: 15, name: 'Rajiv Gandhi Stadium Turf', location: 'Navlakha', city: 'Indore', price: 700, rating: 4.5, sports: ['Football', 'Cricket'], image: '/images/turf4.png' },
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
    const { user, login, setSession } = useAuth()

    // Selected Turf Venue State
    const [selectedVenue, setSelectedVenue] = useState(() => {
        const found = allAvailableTurfs.find(t => t.id === Number(id))
        return found || allAvailableTurfs[0]
    })

    // Venue switch modal state
    const [isVenueModalOpen, setIsVenueModalOpen] = useState(false)

    // Auth / Login Modal state
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [authModalTab, setAuthModalTab] = useState('login') // 'login' | 'quick' | 'register'
    const [authEmail, setAuthEmail] = useState('customer@gmail.com')
    const [authPassword, setAuthPassword] = useState('123')
    const [authRole, setAuthRole] = useState('customer')
    const [authRegName, setAuthRegName] = useState('')
    const [authRegPhone, setAuthRegPhone] = useState('')
    const [authRegEmail, setAuthRegEmail] = useState('')
    const [authRegPassword, setAuthRegPassword] = useState('123')
    const [authLoading, setAuthLoading] = useState(false)

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

    // Live Ticking Timers (5-min Slot Hold & 2-Hour Opponent Deadline)
    const [holdSeconds, setHoldSeconds] = useState(300)
    const [deadlineSeconds, setDeadlineSeconds] = useState(7200)
    const [scoreTeamA, setScoreTeamA] = useState(3)
    const [scoreTeamB, setScoreTeamB] = useState(2)
    const [scoreSubmitted, setScoreSubmitted] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => {
            setHoldSeconds(prev => (prev > 0 ? prev - 1 : 0))
            setDeadlineSeconds(prev => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTimer = (sec) => {
        const m = Math.floor(sec / 60)
        const s = sec % 60
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    const formatDeadlineTimer = (sec) => {
        const h = Math.floor(sec / 3600)
        const m = Math.floor((sec % 3600) / 60)
        const s = sec % 60
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [activeStep])

    // Helper to format slot time range (e.g. 6:00 PM – 7:00 PM)
    const formatSlotTimeRange = (timeStr, hours = 1) => {
        const found = allTimeSlots.find(s => s.id === timeStr || s.time === timeStr)
        const rawTime = found ? found.id : timeStr || '18:00'
        const [hStr] = rawTime.split(':')
        const startHour = parseInt(hStr, 10) || 18
        const endHour = startHour + hours

        const formatHour = (h) => {
            const period = h >= 12 && h < 24 ? 'PM' : 'AM'
            const displayH = h % 12 === 0 ? 12 : h % 12
            return `${displayH}:00 ${period}`
        }

        return `${formatHour(startHour)} – ${formatHour(endHour)}`
    }

    const totalRent = selectedVenue.price * durationHours

    useEffect(() => {
        setCustomSplitMyShare(Math.round(selectedVenue.price * durationHours * 0.6))
    }, [selectedVenue.price, durationHours])

    const getPaymentModeLabel = (mode) => {
        switch (mode) {
            case 'full': return 'Full Pay'
            case 'split-50': return 'Split 50-50'
            case 'custom': return 'Custom Split'
            case 'dare': return 'Dare to Play'
            case 'per-player': return 'Per Player Split'
            default: return 'Full Pay'
        }
    }

    const playerCount = Math.max(1, teammates.length || 6)
    const perPlayerAmount = Math.round(totalRent / playerCount)

    const myShareAmount = paymentMode === 'full'
        ? totalRent
        : paymentMode === 'split-50'
            ? totalRent / 2
            : paymentMode === 'custom'
                ? customSplitMyShare
                : paymentMode === 'dare'
                    ? 100
                    : perPlayerAmount

    const opponentShareAmount = Math.max(0, totalRent - myShareAmount)

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

    const handleAuthLoginSubmit = async (e) => {
        if (e) e.preventDefault()
        setAuthLoading(true)
        try {
            let loggedUser
            if (login) {
                loggedUser = await login(authEmail, authPassword, authRole)
            } else {
                loggedUser = { name: authEmail.split('@')[0], email: authEmail, role: authRole }
            }
            if (loggedUser) {
                const uName = loggedUser.name || authEmail.split('@')[0]
                const uPhone = loggedUser.phone || '+91 98765 43210'
                setCaptainName(uName)
                setCaptainPhone(uPhone)
            }
            if (addToast) addToast(`Logged in successfully as ${loggedUser?.name || authEmail}!`, 'success')
            setIsAuthModalOpen(false)
            handleProceedToConfirm()
        } catch (err) {
            if (addToast) addToast(err.message || 'Login failed. Please check credentials.', 'error')
        } finally {
            setAuthLoading(false)
        }
    }

    const handleQuickDemoLogin = (userType) => {
        let demoObj = {
            id: 'usr_cust_' + Date.now(),
            name: 'Rohan Verma',
            email: 'customer@gmail.com',
            phone: '+91 98765 99999',
            role: 'CUSTOMER'
        }
        if (userType === 'owner') {
            demoObj = { id: 'own_1', name: 'Rajesh Sharma (Turf Owner)', email: 'owner@gmail.com', phone: '+91 98200 11111', role: 'OWNER' }
        } else if (userType === 'superadmin') {
            demoObj = { id: 'sa_1', name: 'Super Administrator', email: 'superadmin@gmail.com', phone: '+91 98765 43210', role: 'SUPER_ADMIN' }
        } else if (userType === 'guest') {
            demoObj = { id: 'guest_1', name: 'Guest Captain', email: 'guest@bookmyturf.com', phone: '+91 98765 00000', role: 'CUSTOMER' }
        }

        if (setSession) {
            setSession(demoObj, `token_quick_${Date.now()}`)
        } else {
            localStorage.setItem('user', JSON.stringify(demoObj))
            localStorage.setItem('token', `token_quick_${Date.now()}`)
        }
        setCaptainName(demoObj.name)
        setCaptainPhone(demoObj.phone)
        if (addToast) addToast(`Signed in as ${demoObj.name}!`, 'success')
        setIsAuthModalOpen(false)
        handleProceedToConfirm()
    }

    const handleRegisterSubmit = async (e) => {
        if (e) e.preventDefault()
        if (!authRegEmail || !authRegName) {
            if (addToast) addToast('Please enter your Name and Email address', 'warning')
            return
        }
        setAuthLoading(true)
        const newUser = {
            id: `usr_${Date.now()}`,
            name: authRegName,
            email: authRegEmail,
            phone: authRegPhone || '+91 98765 43210',
            role: 'CUSTOMER'
        }
        if (setSession) {
            setSession(newUser, `token_reg_${Date.now()}`)
        } else {
            localStorage.setItem('user', JSON.stringify(newUser))
            localStorage.setItem('token', `token_reg_${Date.now()}`)
        }
        setCaptainName(newUser.name)
        setCaptainPhone(newUser.phone)
        if (addToast) addToast(`Welcome ${newUser.name}! Account created.`, 'success')
        setIsAuthModalOpen(false)
        setAuthLoading(false)
        handleProceedToConfirm()
    }

    const handleProceedClick = () => {
        setIsAuthModalOpen(true)
    }

    const handleProceedToConfirm = async () => {
        setIsSubmitting(true)
        const generatedId = `BMT-${selectedDateObj.dateNum}${selectedDateObj.monthShort.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`
        setBookingId(generatedId)

        try {
            // 1. Init Match Booking & 5-minute Slot Hold in MySQL
            const createRes = await fetch('http://localhost:5000/api/v1/match-payments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    turfId: `turf_${selectedVenue.id}`,
                    slotId: `slot_${selectedVenue.id}_${selectedDateObj.fullDateString.replace(/-/g, '')}`,
                    sportId: selectedSport,
                    captainName,
                    captainPhone,
                    teamAName,
                    teamBName: hasOpponentTeam ? teamBName : 'Open Challenge',
                    paymentMode: paymentMode.toUpperCase().replace(/-/g, '_'),
                    durationHours,
                    slotDate: selectedDateObj.fullDateString,
                    startTime: '18:00:00',
                    endTime: `${18 + durationHours}:00:00`,
                    captainShareInput: myShareAmount,
                    hasOpponentTeam
                })
            })
            const createData = await createRes.json()

            if (createData.success && createData.data?.matchId) {
                // 2. Verify Payment & Generate Token
                const verifyRes = await fetch('http://localhost:5000/api/v1/match-payments/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        matchId: createData.data.matchId,
                        holdId: createData.data.holdId,
                        gatewayOrderId: `order_${Date.now()}`,
                        gatewayPaymentId: `pay_${Date.now()}`,
                        idempotencyKey: `idemp_${Date.now()}`
                    })
                })
                const verifyData = await verifyRes.json()
                if (verifyData.data?.matchId) {
                    setBookingId(verifyData.data.matchId)
                }
            }

            const existing = JSON.parse(localStorage.getItem('customer_bookings') || '[]')
            const currentUserId = user?.id || (user?.email ? `usr_${user.email}` : `usr_cust_${Date.now()}`)
            const currentUserEmail = user?.email || authEmail || 'customer@gmail.com'
            const currentCustomerName = captainName || user?.name || 'Customer'
            const currentCustomerPhone = captainPhone || user?.phone || user?.mobile || '+91 98765 43210'

            const newEntry = {
                id: generatedId,
                userId: currentUserId,
                userEmail: currentUserEmail,
                customerName: currentCustomerName,
                customerPhone: currentCustomerPhone,
                turfId: `turf_${selectedVenue.id}`,
                venueId: selectedVenue.id,
                venue: selectedVenue.name,
                sport: selectedSport,
                date: selectedDateObj.fullDateString,
                time: '6:00 PM',
                amount: `₹${myShareAmount.toLocaleString('en-IN')}`,
                status: 'Confirmed',
                createdAt: new Date().toISOString()
            }
            localStorage.setItem('customer_bookings', JSON.stringify([newEntry, ...existing]))
        } catch (e) {
            console.error('Match payment engine API error:', e)
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
                                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm ${isActive
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
                                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${durationHours === hr
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
                                            className={`flex-shrink-0 w-20 sm:w-22 py-4 px-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${isSelected
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
                                            className={`py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-150 text-center ${isSelected
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

                        {/* Live 5-Minute Slot Hold Banner */}
                        <div className="bg-emerald-950 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-md border border-emerald-800 animate-pulse">
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl">⏳</span>
                                <div>
                                    <span className="text-xs font-black uppercase tracking-wider text-[#C8FF2E]">5-Minute Temporary Slot Hold Active</span>
                                    <p className="text-[11px] text-slate-300 font-medium">Your slot is locked in database for 5 minutes during payment verification.</p>
                                </div>
                            </div>
                            <div className="text-right pl-2">
                                <span className="font-mono text-lg font-black text-[#C8FF2E]">{formatTimer(holdSeconds)}</span>
                                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold">Slot Lock</span>
                            </div>
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
                                    desc: `You decide the split. Example: You pay ₹${myShareAmount.toLocaleString('en-IN')}, opponent pays ₹${opponentShareAmount.toLocaleString('en-IN')}.`
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
                                    desc: `Each player pays their share. ${playerCount} players = ₹${perPlayerAmount.toLocaleString('en-IN')} each. Send payment links to teammates.`
                                },
                            ].map((opt) => {
                                const isSelected = paymentMode === opt.id
                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => setPaymentMode(opt.id)}
                                        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
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
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${isSelected ? 'border-[#16A34A] bg-[#16A34A]' : 'border-slate-300'
                                            }`}>
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* ALL 5 PAYMENT MODE CONDITIONS — Always Visible Comparison */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-[#C8FF2E] flex items-center gap-1.5">
                                    <span>⚙️</span> ALL PAYMENT CONDITIONS & RULES
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                                    Selected: {getPaymentModeLabel(paymentMode)}
                                </span>
                            </div>
                            <div className="divide-y divide-[#F3F4F6]">

                                {/* MODE A: FULL PAY */}
                                <div className={`p-4 transition-all ${paymentMode === 'full' ? 'bg-emerald-50 border-l-4 border-l-[#16A34A]' : 'bg-white'}`}>
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <span>💳</span>
                                        <span className="text-xs font-black text-[#111827] uppercase tracking-wide">Mode A — Full Pay</span>
                                        {paymentMode === 'full' && <span className="ml-auto text-[10px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">✓ SELECTED</span>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-2.5">
                                            <div className="text-[9px] font-black uppercase text-[#6B7280] mb-1">You Pay Now</div>
                                            <div className="font-black text-[#16A34A] text-sm">₹{totalRent.toLocaleString('en-IN')}</div>
                                            <div className="text-[9px] text-[#6B7280] mt-0.5">100% Full Rent</div>
                                        </div>
                                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-2.5">
                                            <div className="text-[9px] font-black uppercase text-[#6B7280] mb-1">Opponent Pays</div>
                                            <div className="font-black text-sky-600 text-sm">₹0</div>
                                            <div className="text-[9px] text-[#6B7280] mt-0.5">Free Invite Only</div>
                                        </div>
                                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-2.5">
                                            <div className="text-[9px] font-black uppercase text-[#6B7280] mb-1">Condition</div>
                                            <div className="font-bold text-[#111827] text-[10px]">Slot 100% Locked immediately</div>
                                            <div className="text-[9px] text-[#6B7280] mt-0.5">No opponent payment needed</div>
                                        </div>
                                    </div>
                                </div>

                                {/* MODE B: SPLIT 50-50 */}
                                <div className={`p-4 transition-all ${paymentMode === 'split-50' ? 'bg-emerald-50 border-l-4 border-l-[#16A34A]' : 'bg-white'}`}>
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <span>⚖️</span>
                                        <span className="text-xs font-black text-[#111827] uppercase tracking-wide">Mode B — Split 50-50</span>
                                        {paymentMode === 'split-50' && <span className="ml-auto text-[10px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">✓ SELECTED</span>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-2.5">
                                            <div className="text-[9px] font-black uppercase text-[#6B7280] mb-1">You Pay Now</div>
                                            <div className="font-black text-[#16A34A] text-sm">₹{(totalRent / 2).toLocaleString('en-IN')}</div>
                                            <div className="text-[9px] text-[#6B7280] mt-0.5">Your 50% Share</div>
                                        </div>
                                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-2.5">
                                            <div className="text-[9px] font-black uppercase text-[#6B7280] mb-1">Opponent Pays</div>
                                            <div className="font-black text-emerald-600 text-sm">₹{(totalRent / 2).toLocaleString('en-IN')}</div>
                                            <div className="text-[9px] text-[#6B7280] mt-0.5">Via SMS / WhatsApp Link</div>
                                        </div>
                                        <div className="bg-white border border-amber-200 rounded-lg p-2.5">
                                            <div className="text-[9px] font-black uppercase text-[#6B7280] mb-1">Condition</div>
                                            <div className="font-bold text-amber-700 text-[10px]">2-Hour Payment Window</div>
                                            <div className="text-[9px] text-[#6B7280] mt-0.5">Unpaid in 2h → Full refund to you</div>
                                        </div>
                                    </div>
                                </div>

                                {/* MODE C: CUSTOM SPLIT */}
                                <div className={`p-4 transition-all ${paymentMode === 'custom' ? 'bg-emerald-50 border-l-4 border-l-[#16A34A]' : 'bg-white'}`}>
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <span>🎴</span>
                                        <span className="text-xs font-black text-[#111827] uppercase tracking-wide">Mode C — Custom Split</span>
                                        {paymentMode === 'custom' && <span className="ml-auto text-[10px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">✓ SELECTED</span>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-2.5">
                                            <div className="text-[9px] font-black uppercase text-[#6B7280] mb-1">You Pay Now</div>
                                            <div className="font-black text-[#16A34A] text-sm">₹{myShareAmount.toLocaleString('en-IN')}</div>
                                            <div className="text-[9px] text-[#6B7280] mt-0.5">Your custom % of total</div>
                                        </div>
                                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-2.5">
                                            <div className="text-[9px] font-black uppercase text-[#6B7280] mb-1">Opponent Pays</div>
                                            <div className="font-black text-purple-600 text-sm">₹{opponentShareAmount.toLocaleString('en-IN')}</div>
                                            <div className="text-[9px] text-[#6B7280] mt-0.5">Remaining custom share</div>
                                        </div>
                                        <div className="bg-white border border-amber-200 rounded-lg p-2.5">
                                            <div className="text-[9px] font-black uppercase text-[#6B7280] mb-1">Condition</div>
                                            <div className="font-bold text-amber-700 text-[10px]">2-Hour Payment Window</div>
                                            <div className="text-[9px] text-[#6B7280] mt-0.5">You choose who pays how much</div>
                                        </div>
                                    </div>
                                </div>

                                {/* MODE D: DARE TO PLAY */}
                                <div className={`p-4 transition-all ${paymentMode === 'dare' ? 'bg-amber-50 border-l-4 border-l-amber-500' : 'bg-white'}`}>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span>🔥</span>
                                        <span className="text-xs font-black text-[#111827] uppercase tracking-wide">Mode D — Dare to Play (Loser Pays All)</span>
                                        {paymentMode === 'dare' && <span className="ml-auto text-[10px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">✓ SELECTED</span>}
                                    </div>
                                    <div className="text-[10px] text-amber-800 font-semibold mb-2.5 bg-amber-100/70 border border-amber-200 rounded-lg px-2.5 py-1.5">
                                        ⚠️ Both teams pre-authorize or prepay full liability ₹{totalRent.toLocaleString('en-IN')} before match confirms. ₹100 deposit is a hold — NOT the final charge. Loser's full ₹{totalRent.toLocaleString('en-IN')} is captured after verified result.
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white border border-amber-200 rounded-lg p-2.5">
                                            <div className="text-[9px] font-black uppercase text-[#6B7280] mb-1">You Secure Now</div>
                                            <div className="font-black text-amber-600 text-sm">₹100 deposit</div>
                                            <div className="text-[9px] text-[#6B7280] mt-0.5">Refunded if you WIN</div>
                                        </div>
                                        <div className="bg-white border border-amber-200 rounded-lg p-2.5">
                                            <div className="text-[9px] font-black uppercase text-[#6B7280] mb-1">Opponent Secures</div>
                                            <div className="font-black text-amber-600 text-sm">₹100 deposit</div>
                                            <div className="text-[9px] text-[#6B7280] mt-0.5">Refunded if they WIN</div>
                                        </div>
                                        <div className="bg-white border border-red-200 rounded-lg p-2.5">
                                            <div className="text-[9px] font-black uppercase text-[#6B7280] mb-1">Final Settlement</div>
                                            <div className="font-bold text-red-600 text-[10px]">Loser pays ₹{totalRent.toLocaleString('en-IN')}</div>
                                            <div className="text-[9px] text-[#6B7280] mt-0.5">Draw → ₹{(totalRent / 2).toLocaleString('en-IN')} each</div>
                                        </div>
                                    </div>
                                </div>

                                {/* MODE E: PER PLAYER */}
                                <div className={`p-4 transition-all ${paymentMode === 'per-player' ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white'}`}>
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <span>👥</span>
                                        <span className="text-xs font-black text-[#111827] uppercase tracking-wide">Mode E — Per Player Split</span>
                                        {paymentMode === 'per-player' && <span className="ml-auto text-[10px] font-black text-blue-700 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full">✓ SELECTED</span>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-2.5">
                                            <div className="text-[9px] font-black uppercase text-[#6B7280] mb-1">Per Player Share</div>
                                            <div className="font-black text-[#16A34A] text-sm">₹{perPlayerAmount.toLocaleString('en-IN')}</div>
                                            <div className="text-[9px] text-[#6B7280] mt-0.5">₹{totalRent.toLocaleString('en-IN')} ÷ {playerCount} players</div>
                                        </div>
                                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-2.5">
                                            <div className="text-[9px] font-black uppercase text-[#6B7280] mb-1">Teammates Pay</div>
                                            <div className="font-black text-blue-600 text-sm">₹{perPlayerAmount.toLocaleString('en-IN')} each</div>
                                            <div className="text-[9px] text-[#6B7280] mt-0.5">Individual SMS/WA links</div>
                                        </div>
                                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-2.5">
                                            <div className="text-[9px] font-black uppercase text-[#6B7280] mb-1">Condition</div>
                                            <div className="font-bold text-[#111827] text-[10px]">Min. 4 Players Must Pay</div>
                                            <div className="text-[9px] text-[#6B7280] mt-0.5">Match won't confirm if underfunded</div>
                                        </div>
                                    </div>
                                </div>

                            </div>
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
                                Payment mode: <span className="font-bold text-[#111827]">{getPaymentModeLabel(paymentMode)}</span>
                            </p>
                        </div>

                        {/* YOUR TEAM (TEAM A) Card */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-black uppercase tracking-widest text-[#6B7280]">
                                    YOUR TEAM (TEAM A) & CUSTOMER DETAILS
                                </h2>
                                <div className="flex items-center gap-2">
                                    {user ? (
                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                                            ✓ Logged in as {user.name || user.email}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-300 animate-pulse">
                                            ⚠️ Guest Mode
                                        </span>
                                    )}
                                    <button
                                        onClick={() => setIsAuthModalOpen(true)}
                                        className="text-[11px] bg-[#16A34A] hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg shadow-sm cursor-pointer flex items-center gap-1 transition-all"
                                    >
                                        <span>🔑 Sign In / Login</span>
                                    </button>
                                </div>
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

                            {/* Teammates List - Only show split links if per-player, otherwise show simple full pay notice */}
                            {paymentMode === 'full' ? (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs font-semibold text-emerald-950 flex items-start gap-3">
                                    <span className="text-lg">💳</span>
                                    <div>
                                        <strong className="block text-emerald-900 font-bold mb-0.5">Full Pay Selected (100% Paid by You)</strong>
                                        You are paying the entire venue rent of ₹{totalRent.toLocaleString('en-IN')} upfront. Teammate payment split links are not needed for Full Pay.
                                    </div>
                                </div>
                            ) : paymentMode === 'per-player' ? (
                                <>
                                    <div className="space-y-2.5 pt-1">
                                        {teammates.map((member) => {
                                            const isPaid = member.isCaptain || member.status === 'Paid'
                                            const displayAmount = member.isCaptain ? myShareAmount : member.amount || Math.round(totalRent / 6)

                                            return (
                                                <div
                                                    key={member.id}
                                                    className="bg-slate-50 border border-[#E5E7EB] rounded-xl p-3.5 flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${member.tag === 'You' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                                                            {member.tag}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-[#111827]">{member.name}</div>
                                                            <div className="text-xs text-[#6B7280] font-medium mt-0.5">
                                                                {member.phone} · {member.isCaptain ? `Captain Share (₹${myShareAmount.toLocaleString('en-IN')})` : `Share: ₹${displayAmount.toLocaleString('en-IN')}`}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <span className={`text-xs px-2.5 py-1 rounded-md font-black border ${isPaid
                                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                        : 'bg-amber-100 text-amber-800 border-amber-300'
                                                        }`}>
                                                        {isPaid ? 'Paid' : 'Pending'}
                                                    </span>
                                                </div>
                                            )
                                        })}
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
                                            + Add teammate (Send Share Link)
                                        </button>
                                    )}
                                </>
                            ) : null}
                        </div>

                        {/* OPPONENT TEAM (TEAM B) Card */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-black uppercase tracking-widest text-[#6B7280]">
                                    OPPONENT TEAM (TEAM B)
                                </h2>
                                {paymentMode === 'full' ? (
                                    <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full border border-sky-300">
                                        Free Invite (Slot 100% Paid by You)
                                    </span>
                                ) : paymentMode === 'split-50' ? (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                                        Opponent Share: ₹{(totalRent / 2).toLocaleString('en-IN')} (2-Hour Window)
                                    </span>
                                ) : paymentMode === 'custom' ? (
                                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full border border-purple-300">
                                        Opponent Share: ₹{opponentShareAmount.toLocaleString('en-IN')}
                                    </span>
                                ) : paymentMode === 'dare' ? (
                                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                                        Opponent Deposit: ₹100
                                    </span>
                                ) : (
                                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full border border-blue-300">
                                        Per Player Links
                                    </span>
                                )}
                            </div>

                            {/* Mode Specific Explanation Banner */}
                            <div className="bg-slate-50 border border-[#E5E7EB] p-4 rounded-xl text-xs space-y-2">
                                <div className="flex items-center justify-between font-black text-[#111827] uppercase tracking-wider text-[11px] border-b border-[#E5E7EB] pb-2">
                                    <span>Payment Condition & Rules</span>
                                    <span className="text-[#16A34A]">{getPaymentModeLabel(paymentMode)}</span>
                                </div>
                                {paymentMode === 'full' && (
                                    <p className="text-[#4B5563] font-medium leading-relaxed">
                                        💳 <strong>Full Pay (100%):</strong> You pay ₹{totalRent.toLocaleString('en-IN')} upfront. Slot is locked immediately. Opponent team is invited for free with zero payment required.
                                    </p>
                                )}
                                {paymentMode === 'split-50' && (
                                    <p className="text-[#4B5563] font-medium leading-relaxed">
                                        ⚖️ <strong>Split 50-50:</strong> You pay ₹{(totalRent / 2).toLocaleString('en-IN')} now. Opponent captain gets an SMS/WA link to pay the remaining ₹{(totalRent / 2).toLocaleString('en-IN')}. If opponent doesn't pay within <strong>2 hours</strong>, slot is released and you get a <strong>100% refund</strong>.
                                    </p>
                                )}
                                {paymentMode === 'custom' && (
                                    <p className="text-[#4B5563] font-medium leading-relaxed">
                                        🎴 <strong>Custom Split:</strong> You pay ₹{myShareAmount.toLocaleString('en-IN')} now. Opponent captain receives a payment link for the remaining ₹{opponentShareAmount.toLocaleString('en-IN')}.
                                    </p>
                                )}
                                {paymentMode === 'dare' && (
                                    <p className="text-[#4B5563] font-medium leading-relaxed">
                                        🔥 <strong>Dare to Play:</strong> Both teams deposit ₹100 now. Winner gets deposit refunded; losing team pays full ₹{totalRent.toLocaleString('en-IN')} after match score confirmation.
                                    </p>
                                )}
                                {paymentMode === 'per-player' && (
                                    <p className="text-[#4B5563] font-medium leading-relaxed">
                                        👥 <strong>Per-Player Split:</strong> You pay your ₹{Math.round(totalRent / 6).toLocaleString('en-IN')} share. Share links generated for players. Minimum 4 paid players per side required to confirm.
                                    </p>
                                )}
                            </div>

                            {/* Toggle Switch */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setHasOpponentTeam(!hasOpponentTeam)}
                                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${hasOpponentTeam ? 'bg-[#16A34A]' : 'bg-slate-300'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full transition-transform absolute top-0.5 bg-white shadow-sm ${hasOpponentTeam ? 'translate-x-6' : 'translate-x-0.5'
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
                                            Opponent Captain Phone (SMS / WhatsApp Invite)
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
                                onClick={handleProceedClick}
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
                                        {paymentMode === 'full'
                                            ? 'Your Payment (100% Full Rent)'
                                            : paymentMode === 'split-50'
                                                ? 'Your 50% Share Paid'
                                                : paymentMode === 'custom'
                                                    ? 'Your Custom Share Paid'
                                                    : paymentMode === 'dare'
                                                        ? 'Your Refundable Deposit Paid'
                                                        : 'Your Player Share Paid'}
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
                                    <div className="text-sm font-black text-[#111827] mt-0.5">{durationHours} {durationHours > 1 ? 'Hours' : 'Hour'}</div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-[#E5E7EB]">
                                    <div className="text-[10px] uppercase font-black text-[#6B7280]">Mode</div>
                                    <div className="text-sm font-black text-[#111827] mt-0.5">{getPaymentModeLabel(paymentMode)}</div>
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
                                            <div className="text-xs text-[#6B7280] font-semibold mt-0.5">
                                                Captain: {captainName} · {paymentMode === 'full'
                                                    ? `Paid 100% (₹${totalRent.toLocaleString('en-IN')})`
                                                    : paymentMode === 'split-50'
                                                        ? `Paid 50% Share (₹${(totalRent / 2).toLocaleString('en-IN')})`
                                                        : paymentMode === 'custom'
                                                            ? `Paid Custom Share (₹${myShareAmount.toLocaleString('en-IN')})`
                                                            : paymentMode === 'dare'
                                                                ? 'Deposit Paid (₹100)'
                                                                : `${teammates.filter(t => t.status === 'Paid' || t.isCaptain).length}/${teammates.length || 6} players paid`}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs px-2.5 py-1 rounded-md font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        Confirmed
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
                                            <div className="font-black text-[#111827] text-sm">{hasOpponentTeam ? teamBName : 'Open Challenge (Public Match)'}</div>
                                            <div className="text-xs text-[#6B7280] font-semibold mt-0.5">
                                                {paymentMode === 'full'
                                                    ? 'Friendly Match · Free Invite (Slot 100% Paid by Team A)'
                                                    : paymentMode === 'split-50'
                                                        ? `Opponent Share: ₹${(totalRent / 2).toLocaleString('en-IN')} · Invite Link Sent (2-Hour Window)`
                                                        : paymentMode === 'custom'
                                                            ? `Opponent Share: ₹${opponentShareAmount.toLocaleString('en-IN')} · Invite Link Sent`
                                                            : paymentMode === 'dare'
                                                                ? 'Challenge Sent · ₹100 Deposit Pending'
                                                                : 'Player Share Links Sent · Min. 4 Paid Players Required'}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2.5 py-1 rounded-md font-black border ${paymentMode === 'full'
                                        ? 'bg-sky-100 text-sky-800 border-sky-300'
                                        : paymentMode === 'split-50' || paymentMode === 'custom'
                                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                                            : paymentMode === 'dare'
                                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                                : 'bg-blue-100 text-blue-800 border-blue-300'
                                        }`}>
                                        {paymentMode === 'full' ? 'Invited (Free)' : paymentMode === 'dare' ? 'Challenge Sent' : 'Payment Pending'}
                                    </span>
                                </div>

                                {/* Interactive Opponent Action Buttons */}
                                {paymentMode !== 'full' && (
                                    <div className="bg-slate-100/80 border border-[#E5E7EB] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                                        <div className="text-[11px] font-black uppercase text-[#6B7280] tracking-wider">
                                            Opponent Invite Controls:
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    const url = `${window.location.origin}/booking/${selectedVenue.id}?mode=${paymentMode}&pay=opponent`
                                                    navigator.clipboard?.writeText(url)
                                                    if (addToast) addToast(`Opponent Payment Link copied! (₹${opponentShareAmount.toLocaleString('en-IN')})`, 'success')
                                                }}
                                                className="px-3 py-1.5 bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                                            >
                                                <span>📋 Copy Payment Link</span>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    const text = `Join our ${selectedSport} match at ${selectedVenue.name} on ${selectedDateObj.dayShort} ${selectedDateObj.dateNum} ${selectedDateObj.monthShort}! Pay your ₹${opponentShareAmount.toLocaleString('en-IN')} share here: ${window.location.origin}/booking/${selectedVenue.id}`
                                                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
                                                }}
                                                className="px-3 py-1.5 bg-[#25D366] hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                                            >
                                                <span>💬 WhatsApp Invite</span>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    const newTeam = prompt('Enter new opponent team name:', 'Thunder XI')
                                                    if (newTeam) {
                                                        setTeamBName(newTeam)
                                                        if (addToast) addToast(`Re-invited ${newTeam}! Share link dispatched.`, 'info')
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-white hover:bg-slate-200 text-[#111827] font-bold text-xs rounded-lg border border-slate-300 transition-colors cursor-pointer"
                                            >
                                                <span>🔄 Change Opponent Team</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 2-Hour Pre-Match Guarantee & Refund Policy Card */}
                                {paymentMode !== 'full' && (
                                    <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-2.5 text-xs text-amber-950 mt-4">
                                        <div className="flex items-center justify-between font-black uppercase text-[11px] text-amber-900 border-b border-amber-200 pb-2">
                                            <span className="flex items-center gap-1.5">
                                                <span>🛡️</span> 2-HOUR PRE-MATCH GUARANTEE & REFUND POLICY
                                            </span>
                                            <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-[10px]">Active Protection</span>
                                        </div>
                                        <p className="font-semibold leading-relaxed">
                                            If no opponent accepts or pays up to <strong>2 hours before match time (4:00 PM)</strong>, you have 2 flexible choices:
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-2 pt-1 font-bold">
                                            <div className="bg-white border border-amber-200 rounded-xl p-3">
                                                <span className="text-emerald-700 block mb-0.5">Option 1: 100% Full Refund</span>
                                                <span className="text-[#6B7280] font-medium text-[10px] block">Slot auto-releases and your ₹{myShareAmount.toLocaleString('en-IN')} share is refunded instantly.</span>
                                            </div>
                                            <div className="bg-white border border-amber-200 rounded-xl p-3">
                                                <span className="text-blue-700 block mb-0.5">Option 2: Convert to Full Pay</span>
                                                <span className="text-[#6B7280] font-medium text-[10px] block">Pay the remaining ₹{opponentShareAmount.toLocaleString('en-IN')} to lock the turf for your team practice.</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Live 2-Hour Opponent Deadline Countdown Banner */}
                                {paymentMode !== 'full' && (
                                    <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-slate-700 mt-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">⌛</span>
                                            <div>
                                                <div className="text-xs font-black uppercase tracking-wider text-[#C8FF2E] flex items-center gap-2">
                                                    <span>Opponent Payment Deadline (DB Lock)</span>
                                                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">DB Active</span>
                                                </div>
                                                <p className="text-xs text-slate-300 mt-0.5 font-medium">Automated worker auto-releases slot & refunds your ₹{myShareAmount.toLocaleString('en-IN')} if unpaid at cutoff.</p>
                                            </div>
                                        </div>
                                        <div className="bg-black/60 border border-slate-700 rounded-xl px-4 py-2 text-right">
                                            <div className="font-mono text-xl font-black text-[#C8FF2E]">{formatDeadlineTimer(deadlineSeconds)}</div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Countdown</span>
                                        </div>
                                    </div>
                                )}

                                {/* Score Entry & Settlement Widget */}
                                <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4 mt-4">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-wider text-[#C8FF2E] flex items-center gap-2">
                                                <span>⚽</span> Match Day Score Submission & Settlement
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {paymentMode === 'dare'
                                                    ? 'Submit final scores to determine winner deposit refund & loser charge.'
                                                    : 'Submit final scores to record match outcome in official leaderboard & ledger.'}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${scoreSubmitted ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                                            {scoreSubmitted ? '✓ Result Verified' : 'Awaiting Scores'}
                                        </span>
                                    </div>

                                    {!scoreSubmitted ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">{teamAName} Score</label>
                                                    <input
                                                        type="number"
                                                        value={scoreTeamA}
                                                        onChange={(e) => setScoreTeamA(parseInt(e.target.value) || 0)}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-base font-bold text-white outline-none focus:border-[#C8FF2E]"
                                                    />
                                                </div>
                                                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">{teamBName} Score</label>
                                                    <input
                                                        type="number"
                                                        value={scoreTeamB}
                                                        onChange={(e) => setScoreTeamB(parseInt(e.target.value) || 0)}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-base font-bold text-white outline-none focus:border-[#C8FF2E]"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await fetch(`http://localhost:5000/api/v1/match-payments/${bookingId}/submit-score`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ captainSide: 'A', teamAScore: scoreTeamA, teamBScore: scoreTeamB })
                                                        });
                                                        setScoreSubmitted(true);
                                                        if (addToast) addToast('Score submitted to settlement engine!', 'success');
                                                    } catch (e) {
                                                        setScoreSubmitted(true);
                                                        if (addToast) addToast('Score recorded!', 'success');
                                                    }
                                                }}
                                                className="w-full py-2.5 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                                            >
                                                Submit Score & Process Settlement →
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-xl p-3.5 text-xs text-emerald-200 flex items-center justify-between">
                                            <div>
                                                <span className="font-bold block text-white text-sm">Score Submitted: {teamAName} {scoreTeamA} - {scoreTeamB} {teamBName}</span>
                                                <span className="text-[11px] text-emerald-300">Dual-captain verification active. Outcome recorded in financial ledger.</span>
                                            </div>
                                            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2.5 py-1 rounded-md border border-emerald-500/30">
                                                {scoreTeamA > scoreTeamB ? `${teamAName} WIN` : scoreTeamB > scoreTeamA ? `${teamBName} WIN` : 'DRAW'}
                                            </span>
                                        </div>
                                    )}
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
                    SWITCH TURF MODAL (Quick Selection Modal)
                ═══════════════════════════════════════════════════ */}
                {isVenueModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-lg w-full shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
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
                                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
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
                {/* ═══════════════════════════════════════════════════
                    LOGIN / SIGN IN POPUP MODAL
                ═══════════════════════════════════════════════════ */}
                {isAuthModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
                        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative space-y-5 my-auto max-h-[90vh] overflow-y-auto">
                            {/* Close Button */}
                            <button
                                onClick={() => setIsAuthModalOpen(false)}
                                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <HiX className="w-5 h-5" />
                            </button>

                            {/* Header */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-[#16A34A] flex items-center justify-center text-2xl font-black shadow-sm">
                                    🔐
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#111827] tracking-tight">
                                        Sign In to Confirm Match
                                    </h3>
                                    <p className="text-xs text-[#6B7280] font-semibold mt-0.5">
                                        Log in or select a demo account to verify match booking.
                                    </p>
                                </div>
                            </div>

                            {/* If currently logged in alert */}
                            {user && (
                                <div className="bg-[#111827] text-white border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                            <span className="text-xs font-bold text-slate-300">Signed In Session Verified</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-[#C8FF2E] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono">
                                            {user.role || 'CUSTOMER'}
                                        </span>
                                    </div>
                                    <div className="text-sm font-black text-white">
                                        {user.name || user.email}
                                    </div>
                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            onClick={() => {
                                                setIsAuthModalOpen(false)
                                                handleProceedToConfirm()
                                            }}
                                            className="flex-1 py-2.5 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black rounded-xl text-xs shadow-md transition-all cursor-pointer text-center uppercase tracking-wider"
                                        >
                                            Proceed as {user.name?.split(' ')[0] || 'User'} & Confirm Match →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Tab Navigation Bar */}
                            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
                                <button
                                    onClick={() => setAuthModalTab('login')}
                                    className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${authModalTab === 'login' ? 'bg-white text-[#16A34A] shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    🔑 Sign In
                                </button>
                                <button
                                    onClick={() => setAuthModalTab('quick')}
                                    className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${authModalTab === 'quick' ? 'bg-white text-[#16A34A] shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    ⚡ 1-Click Demo
                                </button>
                                <button
                                    onClick={() => setAuthModalTab('register')}
                                    className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${authModalTab === 'register' ? 'bg-white text-[#16A34A] shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    📝 New Account
                                </button>
                            </div>

                            {/* TAB 1: SIGN IN FORM */}
                            {authModalTab === 'login' && (
                                <form onSubmit={handleAuthLoginSubmit} className="space-y-3.5 text-xs">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Role / Category</label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {[
                                                { id: 'customer', label: '⚽ Customer' },
                                                { id: 'owner', label: '👑 Owner' },
                                                { id: 'superadmin', label: '🛡️ Admin' },
                                            ].map((r) => (
                                                <button
                                                    type="button"
                                                    key={r.id}
                                                    onClick={() => {
                                                        setAuthRole(r.id)
                                                        if (r.id === 'customer') { setAuthEmail('customer@gmail.com'); setAuthPassword('123') }
                                                        if (r.id === 'owner') { setAuthEmail('owner@gmail.com'); setAuthPassword('123456') }
                                                        if (r.id === 'superadmin') { setAuthEmail('superadmin@gmail.com'); setAuthPassword('123456') }
                                                    }}
                                                    className={`py-1.5 px-2 rounded-lg border font-bold text-[11px] transition-all cursor-pointer ${authRole === r.id ? 'bg-emerald-50 border-[#16A34A] text-[#16A34A]' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                                >
                                                    {r.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Email Address</label>
                                        <input
                                            type="email"
                                            value={authEmail}
                                            onChange={(e) => setAuthEmail(e.target.value)}
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white text-xs"
                                            placeholder="customer@gmail.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Password</label>
                                        <input
                                            type="password"
                                            value={authPassword}
                                            onChange={(e) => setAuthPassword(e.target.value)}
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white text-xs"
                                            placeholder="••••••"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={authLoading}
                                        className="w-full py-3 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md border border-[#B5F000] mt-2 flex items-center justify-center gap-2"
                                    >
                                        <span>{authLoading ? 'Signing In...' : 'Sign In & Confirm Match →'}</span>
                                    </button>
                                </form>
                            )}

                            {/* TAB 2: 1-CLICK QUICK DEMO LOGIN */}
                            {authModalTab === 'quick' && (
                                <div className="space-y-2 text-xs">
                                    <p className="text-[11px] text-slate-500 font-semibold mb-2">Select a pre-configured account for instant 1-click authentication:</p>

                                    <div
                                        onClick={() => handleQuickDemoLogin('customer')}
                                        className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-xl">⚽</span>
                                            <div>
                                                <div className="font-black text-[#111827]">Rohan Verma (Customer / Captain)</div>
                                                <div className="text-[10px] text-emerald-800 font-medium">customer@gmail.com · Standard Player Account</div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black bg-[#16A34A] text-white px-2.5 py-1 rounded-md group-hover:scale-105 transition-transform">Select ➔</span>
                                    </div>

                                    <div
                                        onClick={() => handleQuickDemoLogin('owner')}
                                        className="p-3 bg-purple-50 hover:bg-purple-100/80 border border-purple-300 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-xl">👑</span>
                                            <div>
                                                <div className="font-black text-[#111827]">Rajesh Sharma (Turf Owner)</div>
                                                <div className="text-[10px] text-purple-800 font-medium">owner@gmail.com · Business Owner Account</div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black bg-purple-600 text-white px-2.5 py-1 rounded-md group-hover:scale-105 transition-transform">Select ➔</span>
                                    </div>

                                    <div
                                        onClick={() => handleQuickDemoLogin('superadmin')}
                                        className="p-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-300 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-xl">🛡️</span>
                                            <div>
                                                <div className="font-black text-[#111827]">Super Administrator</div>
                                                <div className="text-[10px] text-amber-800 font-medium">superadmin@gmail.com · Platform SuperAdmin</div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black bg-amber-600 text-white px-2.5 py-1 rounded-md group-hover:scale-105 transition-transform">Select ➔</span>
                                    </div>

                                    <div
                                        onClick={() => handleQuickDemoLogin('guest')}
                                        className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-xl">🏃</span>
                                            <div>
                                                <div className="font-black text-[#111827]">Continue as Guest</div>
                                                <div className="text-[10px] text-slate-500 font-medium">Fast guest booking without permanent account</div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black bg-slate-800 text-white px-2.5 py-1 rounded-md group-hover:scale-105 transition-transform">Guest ➔</span>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: REGISTER NEW ACCOUNT */}
                            {authModalTab === 'register' && (
                                <form onSubmit={handleRegisterSubmit} className="space-y-2.5 text-xs">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Full Name</label>
                                        <input
                                            type="text"
                                            value={authRegName}
                                            onChange={(e) => setAuthRegName(e.target.value)}
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white text-xs"
                                            placeholder="e.g. Vikram Malhotra"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Mobile Number (SMS / WhatsApp)</label>
                                        <input
                                            type="text"
                                            value={authRegPhone}
                                            onChange={(e) => setAuthRegPhone(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white text-xs"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Email Address</label>
                                        <input
                                            type="email"
                                            value={authRegEmail}
                                            onChange={(e) => setAuthRegEmail(e.target.value)}
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white text-xs"
                                            placeholder="vikram@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Create Password</label>
                                        <input
                                            type="password"
                                            value={authRegPassword}
                                            onChange={(e) => setAuthRegPassword(e.target.value)}
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white text-xs"
                                            placeholder="••••••"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={authLoading}
                                        className="w-full py-3 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md border border-[#B5F000] mt-2 flex items-center justify-center gap-2"
                                    >
                                        <span>{authLoading ? 'Creating Account...' : 'Create Account & Confirm Match →'}</span>
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
