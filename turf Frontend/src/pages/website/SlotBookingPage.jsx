import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { HiCheck, HiCreditCard, HiUsers, HiOutlineCheckCircle, HiShare, HiArrowRight, HiArrowLeft, HiLocationMarker, HiStar, HiX, HiUser } from 'react-icons/hi'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { saveCrmLead } from '../../services/crmService'
import MatchPaymentProgress from '../../components/booking/MatchPaymentProgress'
import DareRegistrationModal from '../../components/booking/DareRegistrationModal'

// Available venues / turfs database lookup
const allAvailableTurfs = [
    { id: 1, name: 'SportZone Arena', location: 'Andheri West', city: 'Mumbai', price: 1200, rating: 4.8, sports: ['Cricket'], image: '/images/turf1.png' },
    { id: 2, name: 'Champion Cricket Ground', location: 'Koramangala', city: 'Bangalore', price: 1500, rating: 4.9, sports: ['Cricket'], image: '/images/turf2.png' },
    { id: 3, name: 'GameVault Cricket Center', location: 'Koramangala', city: 'Bangalore', price: 1200, rating: 4.9, sports: ['Cricket'], image: '/images/turf3.png' },
    { id: 4, name: 'ProKick Cricket Turf', location: 'Indiranagar', city: 'Bangalore', price: 1400, rating: 4.7, sports: ['Cricket'], image: '/images/turf4.png' },
    { id: 5, name: 'ProPlay Cricket Arena', location: 'Vashi', city: 'Mumbai', price: 1000, rating: 4.5, sports: ['Cricket'], image: '/images/turf4.png' },
    { id: 6, name: 'Royal Cricket Ground', location: 'Vijay Nagar', city: 'Indore', price: 1000, rating: 4.7, sports: ['Cricket'], image: '/images/turf5.png' },
    { id: 7, name: 'DunkZone Cricket Turf', location: 'Bandra', city: 'Mumbai', price: 750, rating: 4.3, sports: ['Cricket'], image: '/images/turf2.png' },
    { id: 8, name: 'PixelArena Cricket', location: 'HSR Layout', city: 'Bangalore', price: 1500, rating: 4.8, sports: ['Cricket'], image: '/images/turf6.png' },
    { id: 9, name: 'Skyline Cricket Turf', location: 'Powai', city: 'Mumbai', price: 1400, rating: 4.6, sports: ['Cricket'], image: '/images/turf6.png' },
    { id: 10, name: 'StrikeZone Cricket', location: 'Noida', city: 'Delhi', price: 850, rating: 4.6, sports: ['Cricket'], image: '/images/turf7.png' },
    { id: 11, name: 'Master Blaster Cricket', location: 'Saket', city: 'Delhi', price: 1100, rating: 4.8, sports: ['Cricket'], image: '/images/turf7.png' },
    { id: 12, name: 'Pune Cricket Arena', location: 'Kothrud', city: 'Pune', price: 1000, rating: 4.5, sports: ['Cricket'], image: '/images/turf2.png' },
    { id: 13, name: 'Spike Cricket Turf', location: 'Bhawarkua', city: 'Indore', price: 500, rating: 4.6, sports: ['Cricket'], image: '/images/turf1.png' },
    { id: 14, name: 'Indore Sports Complex', location: 'LIG Colony', city: 'Indore', price: 1200, rating: 4.9, sports: ['Cricket'], image: '/images/turf3.png' },
    { id: 15, name: 'Rajiv Gandhi Stadium Turf', location: 'Navlakha', city: 'Indore', price: 700, rating: 4.5, sports: ['Cricket'], image: '/images/turf4.png' },
]

const getSlotTimeRangeText = (slotTime, durationHours = 1) => {
    if (!slotTime) return '6:00 PM - 7:00 PM'
    return `${slotTime} (${durationHours} Hr)`
}

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

// Available Time Slots matching exact grid with dynamic pricing and maintenance states
const allTimeSlots = [
    { id: '06:00', time: '6:00 AM', price: 1000, status: 'available' },
    { id: '07:00', time: '7:00 AM', price: 1000, status: 'available' },
    { id: '08:00', time: '8:00 AM', price: 1000, status: 'staff_unavailable' },
    { id: '09:00', time: '9:00 AM', price: 1200, status: 'booked' },
    { id: '10:00', time: '10:00 AM', price: 1200, status: 'available' },
    { id: '11:00', time: '11:00 AM', price: 1200, status: 'available' },
    { id: '12:00', time: '12:00 PM', price: 1200, status: 'maintenance' },
    { id: '13:00', time: '1:00 PM', price: 1200, status: 'available' },
    { id: '14:00', time: '2:00 PM', price: 1200, status: 'available' },
    { id: '15:00', time: '3:00 PM', price: 1400, status: 'available' },
    { id: '16:00', time: '4:00 PM', price: 1400, status: 'available' },
    { id: '17:00', time: '5:00 PM', price: 1500, status: 'available' },
    { id: '18:00', time: '6:00 PM', price: 1500, status: 'available' },
    { id: '19:00', time: '7:00 PM', price: 1500, status: 'available' },
    { id: '20:00', time: '8:00 PM', price: 1500, status: 'booked' },
    { id: '21:00', time: '9:00 PM', price: 1500, status: 'available' },
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

    useEffect(() => {
        if (id) {
            const found = allAvailableTurfs.find(t => t.id === Number(id))
            if (found) {
                setSelectedVenue(found)
            }
        }
    }, [id])

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
    const [hasVerifiedUmpire, setHasVerifiedUmpire] = useState(false)

    // Step 2: Payment Mode Options & Collapsible Accordion State
    const initialMode = searchParams.get('mode') || 'full'
    const [paymentMode, setPaymentMode] = useState(initialMode)
    const [expandedAccordionMode, setExpandedAccordionMode] = useState(initialMode)
    const [customSplitMyShare, setCustomSplitMyShare] = useState(1200)

    // Step 3: Teams & Customer Details (Empty by default — no autofill)
    const [teamAName, setTeamAName] = useState('')
    const [captainName, setCaptainName] = useState('')
    const [captainPhone, setCaptainPhone] = useState('')
    const [guestPassword, setGuestPassword] = useState('')
    const [teammates, setTeammates] = useState([])
    const [isWhatsappSame, setIsWhatsappSame] = useState(true)
    const [whatsappPhone, setWhatsappPhone] = useState('')
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

    // Dynamic Slot Price Calculation
    const activeSlotObj = allTimeSlots.find(s => s.id === selectedSlotTime)
    const currentSlotPrice = activeSlotObj?.price || selectedVenue.price

    // Check if this Turf offers Verified Umpire Service (Configured by Turf Owner)
    const isTurfUmpireAvailable = (() => {
        const savedSetting = localStorage.getItem(`turf_umpire_enabled_${selectedVenue?.id}`)
        if (savedSetting !== null) return savedSetting === 'true'
        const globalSetting = localStorage.getItem('turf_umpire_enabled')
        if (globalSetting !== null) return globalSetting === 'true'
        return selectedVenue?.hasUmpireService !== false
    })()

    const umpireFee = (hasVerifiedUmpire && isTurfUmpireAvailable) ? 300 : 0
    const totalRent = (currentSlotPrice * durationHours) + umpireFee

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

    const getPaymentModeLabel = (mode) => {
        switch (mode) {
            case 'full': return 'Full Pay'
            case 'dare': return 'Dare to Play (Loser Pays All)'
            case 'split-50': return 'Split 50-50'
            case 'per-player': return 'Per Player Split'
            default: return 'Full Pay'
        }
    }

    const playerCount = Math.max(1, teammates.length || 6)
    const perPlayerAmount = Math.round(totalRent / playerCount)

    const myShareAmount = paymentMode === 'full'
        ? totalRent
        : paymentMode === 'dare'
            ? 100
            : paymentMode === 'split-50'
                ? totalRent / 2
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

    const [validationErrors, setValidationErrors] = useState({})

    const handleStepHeaderClick = (targetStep) => {
        // Top step bar only allows going BACK to already completed steps
        if (targetStep < activeStep) {
            setActiveStep(targetStep)
        }
    }

    const handleProceedClick = () => {
        const errors = {}
        if (!captainName || !captainName.trim()) {
            errors.name = 'Full Name is required'
        }
        if (!captainPhone || !captainPhone.trim()) {
            errors.phone = 'Mobile Number is required'
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            if (addToast) addToast('Please enter your Full Name and Mobile Number to proceed!', 'error')
            return
        }

        setValidationErrors({})
        if (!user && captainName && captainPhone) {
            // Auto register/login guest with entered name, whatsapp phone & password
            const guestUser = {
                id: `usr_guest_${Date.now()}`,
                name: captainName,
                phone: captainPhone,
                email: `${captainPhone.replace(/\D/g, '')}@guest.com`,
                role: 'customer'
            }
            if (setSession) {
                setSession(guestUser, `token_guest_${Date.now()}`)
            } else {
                localStorage.setItem('user', JSON.stringify(guestUser))
                localStorage.setItem('token', `token_guest_${Date.now()}`)
            }
        }
        handleProceedToConfirm()
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
                setBookingId(createData.data.matchId)
            }
        } catch (e) {
            console.log('Backend API server offline, proceeding with frontend local state booking:', e?.message || e)
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
            time: selectedSlotTime || '6:00 PM',
            amount: `₹${myShareAmount.toLocaleString('en-IN')}`,
            status: 'Confirmed',
            hasVerifiedUmpire,
            umpireFee,
            verificationTier: hasVerifiedUmpire ? 'Tier 2' : 'Tier 1',
            createdAt: new Date().toISOString()
        }
        localStorage.setItem('customer_bookings', JSON.stringify([newEntry, ...existing]))

        // Sync lead directly to Turf CRM Database
        saveCrmLead({
            name: currentCustomerName,
            phone: currentCustomerPhone,
            role: 'team',
            teamName: teamAName || `${currentCustomerName}'s Team`,
            preferredSport: selectedSport || 'Cricket',
            preferredSlot: `${selectedSlotTime || '6:00 PM'} (${selectedDateObj.fullDateString})`,
            turfBranch: selectedVenue.name || 'SportZone Arena',
            status: 'Hot Lead',
            totalBookings: 1,
            notes: `Website Match Booking (${generatedId})`
        })

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
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-[#16A34A] transition-colors cursor-pointer group bg-white border border-[#E2E8F0] hover:border-slate-400 px-5 py-2.5 rounded-full shadow-xs"
                    >
                        <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>BACK TO TURF DETAILS</span>
                    </button>

                    <button
                        onClick={() => setIsVenueModalOpen(true)}
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#065F46] hover:text-emerald-900 bg-[#ECFDF5] hover:bg-emerald-100 border border-emerald-300 hover:border-emerald-400 px-5 py-2.5 rounded-full shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span>🏟️</span>
                        <span>SWITCH TURF VENUE</span>
                        <span className="text-emerald-700 text-sm font-black">▾</span>
                    </button>
                </div>

                {/* ═══════════════════════════════════════════════════
                    TOP STEP NAVIGATION BAR (Landing Page Style)
                ═══════════════════════════════════════════════════ */}
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar mb-8 border-b border-[#E2E8F0]">
                    {steps.map((step) => {
                        const isActive = activeStep === step.num
                        const isPast = activeStep > step.num
                        const isFuture = step.num > activeStep

                        return (
                            <button
                                key={step.num}
                                onClick={() => setActiveStep(step.num)}
                                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-xs ${
                                    isActive
                                        ? 'bg-[#111827] text-white border border-[#111827] shadow-md'
                                        : isPast
                                        ? 'bg-white text-[#10B981] border border-emerald-300'
                                        : 'bg-white text-slate-500 border border-[#E2E8F0] hover:text-[#111827] hover:border-slate-400'
                                }`}
                            >
                                {isPast && <HiCheck className="w-3.5 h-3.5 text-[#10B981]" />}
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
                                <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight mb-1">
                                    Pick date & time slot
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                                    <span>{selectedVenue.name} — {selectedVenue.location} · ₹{selectedVenue.price.toLocaleString('en-IN')}/hr</span>
                                    <button
                                        onClick={() => setIsVenueModalOpen(true)}
                                        className="text-xs font-black text-[#065F46] bg-[#ECFDF5] border border-emerald-300 px-3 py-1 rounded-full hover:bg-emerald-100 cursor-pointer transition-all inline-flex items-center gap-1 shadow-xs hover:scale-105"
                                    >
                                        <span>Switch Turf</span>
                                        <span>▾</span>
                                    </button>
                                </div>
                            </div>

                            {/* Duration Hours Selector */}
                            <div className="flex items-center gap-2.5">
                                <span className="text-xs font-black tracking-wider text-slate-500 uppercase">
                                    DURATION:
                                </span>
                                <div className="flex items-center bg-[#F1F5F9] border border-slate-200 rounded-full p-1 shadow-xs">
                                    {[1, 2, 3].map((hr) => (
                                        <button
                                            key={hr}
                                            onClick={() => setDurationHours(hr)}
                                            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                                durationHours === hr
                                                    ? 'bg-[#111827] text-white shadow-xs'
                                                    : 'text-slate-500 hover:text-[#111827]'
                                            }`}
                                        >
                                            {hr} {hr === 1 ? 'HOUR' : 'HOURS'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* SELECT DATE Section */}
                        <div className="mb-10">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
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
                                            className={`flex-shrink-0 w-20 py-4 px-2 rounded-[20px] flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[#111827] text-white border-2 border-[#10B981] shadow-md scale-[1.02]'
                                                    : 'bg-white border border-[#E2E8F0] text-slate-500 hover:border-slate-400 shadow-xs'
                                            }`}
                                        >
                                            <span className={`text-xs font-bold mb-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                                {d.dayShort}
                                            </span>
                                            <span className={`text-3xl font-black my-0.5 ${isSelected ? 'text-white' : 'text-[#111827]'}`}>
                                                {d.dateNum}
                                            </span>
                                            <span className={`text-xs font-bold mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
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
                                    const isBooked = slot.status === 'booked'
                                    const isMaintenance = slot.status === 'maintenance'
                                    const isStaffUnavail = slot.status === 'staff_unavailable'
                                    const isDisabled = isBooked || isMaintenance || isStaffUnavail

                                    return (
                                        <button
                                            key={slot.id}
                                            disabled={isDisabled}
                                            onClick={() => setSelectedSlotTime(slot.id)}
                                            className={`py-3.5 px-3 rounded-[22px] text-center flex flex-col items-center justify-center gap-1 min-h-[72px] transition-all duration-200 ${
                                                isSelected
                                                    ? 'bg-[#10B981] text-white border-2 border-[#059669] shadow-lg shadow-emerald-500/20 scale-[1.02] cursor-pointer'
                                                    : isBooked
                                                    ? 'bg-[#F8FAFC] text-slate-300 border border-slate-100 opacity-75 cursor-not-allowed'
                                                    : isMaintenance
                                                    ? 'bg-[#FEFCE8] text-[#854D0E] border-2 border-[#FDE047] cursor-not-allowed'
                                                    : isStaffUnavail
                                                    ? 'bg-[#F1F5F9] text-slate-600 border-2 border-slate-200 cursor-not-allowed'
                                                    : 'bg-[#ECFDF5] border-2 border-[#10B981] hover:bg-emerald-100/60 text-slate-900 cursor-pointer shadow-xs'
                                            }`}
                                        >
                                            <span className={`text-sm sm:text-base font-black tracking-tight ${isSelected ? 'text-white' : isBooked ? 'text-slate-300 line-through' : isMaintenance ? 'text-[#854D0E]' : isStaffUnavail ? 'text-slate-700' : 'text-[#111827]'}`}>
                                                {slot.time}
                                            </span>

                                            {isMaintenance ? (
                                                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#FEF08A] text-[#854D0E] border border-[#FACC15] flex items-center gap-1">
                                                    🛠️ MAINTENANCE
                                                </span>
                                            ) : isStaffUnavail ? (
                                                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#E2E8F0] text-slate-700 border border-slate-300 flex items-center gap-1">
                                                    🚫 STAFF UNAVAIL
                                                </span>
                                            ) : isBooked ? (
                                                <span className="text-[11px] font-bold text-slate-400">Booked</span>
                                            ) : (
                                                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-[#D1FAE5] text-[#065F46]'}`}>
                                                    ₹{slot.price}/hr
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* PAID ADD-ON: VERIFIED UMPIRE & SCORER */}
                            <div className="mt-8 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border-2 border-[#10B981] p-4 sm:p-5 rounded-[22px] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-start sm:items-center gap-3.5">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#10B981] text-white flex items-center justify-center text-2xl font-bold shrink-0 shadow-md shadow-emerald-500/20">
                                        ⚖️
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm sm:text-base font-black text-[#111827]">
                                                Add Verified Umpire & Live Scorer
                                            </h3>
                                            <span className="text-[9px] font-black uppercase tracking-wider bg-[#C8FF2E] text-[#111827] px-2.5 py-0.5 rounded-full border border-[#B5F000]">
                                                1.5x Rank Weight
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 font-semibold mt-0.5 leading-relaxed">
                                            Official ball-by-ball umpiring at turf, 100% verified match badge (`✓ Umpire Verified`), MVP trophy badge, and 1.5x bonus ranking points.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setAddVerifiedUmpire(!addVerifiedUmpire)}
                                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer shadow-xs ${
                                        addVerifiedUmpire
                                            ? 'bg-[#111827] text-white border border-[#111827]'
                                            : 'bg-[#10B981] hover:bg-emerald-700 text-white'
                                    }`}
                                >
                                    {addVerifiedUmpire ? '✓ Umpire Added (+₹300)' : '+ Add Umpire (+₹300)'}
                                </button>
                            </div>

                            {/* Selected Slot Summary Line */}
                            {selectedSlotTime && (
                                <div className="mt-4 bg-[#F8FAFC] border border-[#E2E8F0] p-4 sm:p-5 rounded-[20px] shadow-xs flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600">
                                    <span>Selected Slot: </span>
                                    <strong className="text-[#111827] font-black text-sm sm:text-base">
                                        {allTimeSlots.find(s => s.id === selectedSlotTime)?.time || selectedSlotTime} ({durationHours} {durationHours > 1 ? 'Hours' : 'Hour'})
                                    </strong>
                                    {addVerifiedUmpire && (
                                        <span className="text-[10px] font-black bg-emerald-100 text-[#065F46] px-2 py-0.5 rounded-full border border-emerald-300">
                                            ⚖️ Umpire Included (+₹300)
                                        </span>
                                    )}
                                    <span className="text-slate-300 mx-1">·</span>
                                    <span>Slot Rate: </span>
                                    <span className="text-[#10B981] font-black text-sm sm:text-base font-mono">₹{currentSlotPrice.toLocaleString('en-IN')}/hr</span>
                                    {hasVerifiedUmpire && (
                                        <>
                                            <span className="text-slate-300 mx-1">·</span>
                                            <span>Umpire Add-on: </span>
                                            <span className="text-emerald-700 font-black text-sm sm:text-base font-mono">+₹300</span>
                                        </>
                                    )}
                                    <span className="text-slate-300 mx-1">·</span>
                                    <span>Total Rent: </span>
                                    <span className="text-[#10B981] font-black text-base sm:text-lg font-mono">₹{totalRent.toLocaleString('en-IN')}</span>
                                </div>
                            )}

                            {/* ADD VERIFIED UMPIRE BOOKING ADD-ON (Tier 2 Verification) - Only shown if Turf Owner enabled service */}
                            {isTurfUmpireAvailable && (
                                <div className={`mt-5 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                                    hasVerifiedUmpire 
                                        ? 'bg-emerald-50/80 border-[#10B981] shadow-md shadow-emerald-500/10' 
                                        : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                                }`}>
                                    <div className="flex items-start gap-3.5">
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 transition-colors ${
                                            hasVerifiedUmpire ? 'bg-[#10B981] text-white shadow-md shadow-emerald-500/20' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            ⚖️
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-black text-[#111827]">Add Verified Umpire & Live Scorer</h4>
                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-[#065F46] border border-emerald-300">
                                                    ⭐ 1.5x Rank Weight
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                Official ball-by-ball scoring, dispute-free result, guaranteed 1.5x verified player rating & MVP trophy badge.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHasVerifiedUmpire(!hasVerifiedUmpire)
                                            if (addToast) addToast(!hasVerifiedUmpire ? '✓ Added Verified Umpire (+₹300) to booking!' : 'Removed Verified Umpire add-on', 'info')
                                        }}
                                        className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap w-full sm:w-auto text-center ${
                                            hasVerifiedUmpire 
                                                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs' 
                                                : 'bg-[#10B981] hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                                        }`}
                                    >
                                        {hasVerifiedUmpire ? '✓ Added (+₹300)' : '+ Add ₹300'}
                                    </button>
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
                                    <HiArrowLeft className="w-4 h-4" />
                                    <span>Back to Turf Details</span>
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

                        {/* Payment Options List with Collapsible Accordion Conditions */}
                        <div className="space-y-4">
                            {[
                                {
                                    id: 'full',
                                    icon: '💳',
                                    title: 'I pay full amount',
                                    desc: `You pay ₹${totalRent.toLocaleString('en-IN')} now. Collect from your team later offline.`,
                                    details: {
                                        youPay: `₹${totalRent.toLocaleString('en-IN')}`,
                                        opponentPay: '₹0 (Free Invite)',
                                        rule: 'Slot 100% Locked immediately. No opponent payment required.'
                                    }
                                },
                                {
                                    id: 'dare',
                                    icon: '🔥',
                                    title: 'Dare to play — Loser pays all',
                                    desc: `Both teams pay ₹100 deposit. Winner gets full refund. Loser pays ₹${totalRent.toLocaleString('en-IN')}. Draw = split ₹${(totalRent / 2).toLocaleString('en-IN')} each.`,
                                    badge: '🔥 POPULAR MATCH CHALLENGE',
                                    details: {
                                        youPay: '₹100 Deposit',
                                        opponentPay: '₹100 Deposit',
                                        rule: `Winner gets ₹100 deposit refunded. Loser pays full ₹${totalRent.toLocaleString('en-IN')} match fee. Draw = split ₹${(totalRent / 2).toLocaleString('en-IN')} each.`
                                    }
                                },
                                {
                                    id: 'split-50',
                                    icon: '⚖️',
                                    title: 'Split 50-50 with opponent',
                                    desc: `You pay ₹${(totalRent / 2).toLocaleString('en-IN')} now. Opponent team pays ₹${(totalRent / 2).toLocaleString('en-IN')} to confirm the booking.`,
                                    details: {
                                        youPay: `₹${(totalRent / 2).toLocaleString('en-IN')} (50%)`,
                                        opponentPay: `₹${(totalRent / 2).toLocaleString('en-IN')} (50%)`,
                                        rule: 'Opponent team gets 2 hours to pay via WhatsApp/SMS link. Unpaid in 2h → Full refund to you.'
                                    }
                                },
                                {
                                    id: 'per-player',
                                    icon: '👥',
                                    title: 'Per player split',
                                    desc: `Each player pays their share. ${playerCount} players = ₹${perPlayerAmount.toLocaleString('en-IN')} each. Send payment links to teammates.`,
                                    details: {
                                        youPay: `₹${perPlayerAmount.toLocaleString('en-IN')} / player`,
                                        opponentPay: `₹${perPlayerAmount.toLocaleString('en-IN')} / player`,
                                        rule: `Minimum 4 players must complete payment before match is confirmed.`
                                    }
                                },
                            ].map((opt) => {
                                const isSelected = paymentMode === opt.id
                                const isExpanded = expandedAccordionMode === opt.id

                                return (
                                    <div
                                        key={opt.id}
                                        className={`rounded-2xl border transition-all overflow-hidden ${isSelected
                                            ? 'bg-emerald-50/70 border-2 border-[#16A34A] shadow-md ring-2 ring-[#16A34A]/20'
                                            : 'bg-white border-[#E5E7EB] hover:border-[#16A34A]/50 hover:shadow-sm'
                                            }`}
                                    >
                                        {/* Card Header Bar */}
                                        <div
                                            onClick={() => {
                                                setPaymentMode(opt.id)
                                                setExpandedAccordionMode(isExpanded ? null : opt.id)
                                            }}
                                            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
                                        >
                                            <div className="flex items-center gap-3.5 sm:gap-4">
                                                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xl flex-shrink-0 ${isSelected ? 'bg-[#172019] text-white border-[#B8F52A]' : 'bg-slate-100 border-[#E5E7EB]'}`}>
                                                    {opt.icon}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm sm:text-base font-black text-[#111827] leading-tight">
                                                            {opt.title}
                                                        </h3>
                                                        {opt.badge && (
                                                            <span className="text-[9px] font-black uppercase tracking-wider bg-[#B8F52A] text-[#121614] px-2.5 py-0.5 rounded-full border border-[#B8F52A] shadow-xs">
                                                                {opt.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-[#6B7280] font-medium mt-1 leading-relaxed">
                                                        {opt.desc}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Toggles: Radio & Arrow Accordion Toggle */}
                                            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#16A34A] bg-[#16A34A]' : 'border-slate-300'}`}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setExpandedAccordionMode(isExpanded ? null : opt.id)
                                                    }}
                                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#111827] flex items-center justify-center transition-all cursor-pointer"
                                                >
                                                    <span className={`text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* COLLAPSIBLE ACCORDION BREAKDOWN BOX */}
                                        {isExpanded && (
                                            <div className="border-t border-[#E5E7EB] bg-white p-4 sm:p-5 animate-in fade-in duration-200 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black uppercase tracking-wider text-[#16A34A] flex items-center gap-1.5">
                                                        <span>📋</span> STEP-BY-STEP CONDITIONS & RULES
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                                        {opt.title}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                                    <div className="bg-slate-50 border border-[#E5E7EB] rounded-xl p-3">
                                                        <div className="text-[9px] font-black uppercase tracking-wider text-[#6B7280] mb-1">You Pay Now</div>
                                                        <div className="font-black text-[#16A34A] text-sm sm:text-base">{opt.details.youPay}</div>
                                                        <div className="text-[9px] text-[#6B7280] font-medium mt-0.5">Your Initial Share</div>
                                                    </div>
                                                    <div className="bg-slate-50 border border-[#E5E7EB] rounded-xl p-3">
                                                        <div className="text-[9px] font-black uppercase tracking-wider text-[#6B7280] mb-1">Opponent Share</div>
                                                        <div className="font-black text-emerald-700 text-sm sm:text-base">{opt.details.opponentPay}</div>
                                                        <div className="text-[9px] text-[#6B7280] font-medium mt-0.5">Opponent Required Share</div>
                                                    </div>
                                                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3">
                                                        <div className="text-[9px] font-black uppercase tracking-wider text-amber-800 mb-1">Condition Rule</div>
                                                        <div className="font-bold text-amber-950 text-xs leading-snug">{opt.details.rule}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>


                        {/* Bottom Action Buttons */}
                        <div className="flex items-center justify-between pt-8 border-t border-[#E5E7EB] mt-10">
                            <button
                                onClick={() => setActiveStep(1)}
                                className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer flex items-center gap-2"
                            >
                                <HiArrowLeft className="w-4 h-4" />
                                <span>Back to Date & Time</span>
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
                    <div className="animate-in fade-in duration-200 space-y-6 max-w-xl mx-auto">
                        {/* Title */}
                        <div className="text-center">
                            <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight mb-1">
                                Player & Team Details
                            </h1>
                            <p className="text-[#6B7280] text-xs font-semibold">
                                Enter your name and phone number to confirm match booking
                            </p>
                        </div>

                        {/* Clean Input Card */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4">
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-wider text-[#374151] mb-1.5 flex items-center justify-between">
                                    <span>Full Name *</span>
                                    {validationErrors.name && <span className="text-red-600 font-bold text-xs normal-case">⚠️ Full Name is required</span>}
                                </label>
                                <input
                                    type="text"
                                    value={captainName}
                                    onChange={(e) => {
                                        setCaptainName(e.target.value)
                                        if (validationErrors.name) setValidationErrors(prev => ({ ...prev, name: null }))
                                    }}
                                    autoComplete="off"
                                    required
                                    className={`w-full border rounded-xl px-4 py-3 text-[#111827] text-sm font-bold outline-none transition-all ${validationErrors.name ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500/20' : 'bg-slate-50 border-[#E5E7EB] focus:border-[#16A34A] focus:bg-white'}`}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-black uppercase tracking-wider text-[#374151] mb-1.5 flex items-center justify-between">
                                    <span>Mobile / WhatsApp Number *</span>
                                    {validationErrors.phone && <span className="text-red-600 font-bold text-xs normal-case">⚠️ Mobile Number is required</span>}
                                </label>
                                <input
                                    type="text"
                                    value={captainPhone}
                                    onChange={(e) => {
                                        setCaptainPhone(e.target.value)
                                        if (validationErrors.phone) setValidationErrors(prev => ({ ...prev, phone: null }))
                                    }}
                                    autoComplete="off"
                                    required
                                    className={`w-full border rounded-xl px-4 py-3 text-[#111827] text-sm font-bold outline-none transition-all ${validationErrors.phone ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500/20' : 'bg-slate-50 border-[#E5E7EB] focus:border-[#16A34A] focus:bg-white'}`}
                                    placeholder="+91 98765 43210"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-black uppercase tracking-wider text-[#374151] mb-1.5 block">
                                    Your Team Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={teamAName}
                                    onChange={(e) => setTeamAName(e.target.value)}
                                    autoComplete="off"
                                    className="w-full bg-slate-50 border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#111827] text-sm font-bold outline-none focus:border-[#16A34A] focus:bg-white"
                                    placeholder="e.g. Andheri Strikers"
                                />
                            </div>

                            {/* Umpire Option in Step 3 */}
                            <div className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                                hasVerifiedUmpire ? 'bg-emerald-50/80 border-emerald-500' : 'bg-slate-50 border-slate-200'
                            }`}>
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xl">⚖️</span>
                                    <div>
                                        <div className="text-xs font-black text-slate-900">Verified Platform Umpire (+₹300)</div>
                                        <div className="text-[10px] text-slate-500 font-medium">1.5x Trust Multiplier & Official Live Scorer</div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setHasVerifiedUmpire(!hasVerifiedUmpire)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                                        hasVerifiedUmpire ? 'bg-emerald-700 text-white' : 'bg-[#10B981] text-white hover:bg-emerald-600'
                                    }`}
                                >
                                    {hasVerifiedUmpire ? '✓ Selected' : '+ Add'}
                                </button>
                            </div>
                        </div>

                        {/* Bottom Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
                            <button
                                onClick={() => setActiveStep(2)}
                                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold text-sm transition-all duration-200 cursor-pointer flex items-center gap-2"
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
                    STEP 4: CONFIRMATION & MATCH PAYMENT TRACKER
                ═══════════════════════════════════════════════════ */}
                {activeStep === 4 && (
                    <div className="animate-in fade-in duration-200 space-y-6">
                        {/* Green Success Badge */}
                        <div className="text-center space-y-2 py-2">
                            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto text-2xl shadow-sm">
                                <HiCheck />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
                                Match Invite Dispatched!
                            </h1>
                            <p className="text-[#6B7280] text-xs font-semibold max-w-md mx-auto">
                                Booking reference: <strong className="text-[#111827] font-mono">{bookingId}</strong>. We've sent SMS invites to your teammates & opponent captain.
                            </p>
                        </div>

                        {/* Universal Match Payment Tracker Component */}
                        <MatchPaymentProgress
                            paymentMode={paymentMode}
                            totalAmount={totalRent}
                            collectedAmount={myShareAmount}
                            teamAName={teamAName}
                            teamAPaid={true}
                            teamAAmount={myShareAmount}
                            teamBName={hasOpponentTeam ? teamBName : 'Open Opponent'}
                            teamBPaid={paymentMode === 'full'}
                            teamBAmount={opponentShareAmount}
                            players={teammates}
                            matchDate={`${selectedDateObj.dayShort} ${selectedDateObj.dateNum} ${selectedDateObj.monthShort}`}
                            matchTime={formatSlotTimeRange(selectedSlotTime, durationHours)}
                            turfName={selectedVenue.name}
                        />

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
