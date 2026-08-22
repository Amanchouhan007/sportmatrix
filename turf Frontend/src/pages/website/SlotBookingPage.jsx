import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { HiCheck, HiCreditCard, HiUsers, HiOutlineCheckCircle } from 'react-icons/hi'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { saveCrmLead } from '../../services/crmService'

// Modular Component Imports
import TurfSidebarCard from '../../components/booking/TurfSidebarCard'
import CouponsCard from '../../components/booking/CouponsCard'
import BookingStep1Workspace from '../../components/booking/BookingStep1Workspace'
import BookingStep2Modes from '../../components/booking/BookingStep2Modes'
import BookingStep3Lock from '../../components/booking/BookingStep3Lock'
import BookingStep4Receipt from '../../components/booking/BookingStep4Receipt'
import TurfGalleryModal from '../../components/booking/TurfGalleryModal'
import VenueSwitchModal from '../../components/booking/VenueSwitchModal'
import AuthModal from '../../components/booking/AuthModal'

// Available venues / turfs database lookup
const allAvailableTurfs = [
    { id: 1, name: 'SportZone Arena', location: 'Andheri West', city: 'Mumbai', price: 1200, rating: 4.8, sports: ['Cricket'], dimensions: '100 × 50 ft', squareFeet: '5,000 sq ft', image: '/images/turf1.png', gallery: ['/images/turf1.png', '/images/turf2.png', '/images/turf3.png', '/images/turf4.png', '/images/turf5.png'] },
    { id: 2, name: 'Champion Cricket Ground', location: 'Koramangala', city: 'Bangalore', price: 1500, rating: 4.9, sports: ['Cricket'], dimensions: '120 × 60 ft', squareFeet: '7,200 sq ft', image: '/images/turf2.png', gallery: ['/images/turf2.png', '/images/turf3.png', '/images/turf4.png', '/images/turf5.png', '/images/turf6.png'] },
    { id: 3, name: 'GameVault Cricket Center', location: 'Koramangala', city: 'Bangalore', price: 1200, rating: 4.9, sports: ['Cricket'], dimensions: '110 × 55 ft', squareFeet: '6,050 sq ft', image: '/images/turf3.png', gallery: ['/images/turf3.png', '/images/turf4.png', '/images/turf5.png', '/images/turf6.png', '/images/turf7.png'] },
    { id: 4, name: 'ProKick Cricket Turf', location: 'Indiranagar', city: 'Bangalore', price: 1400, rating: 4.7, sports: ['Cricket'], dimensions: '105 × 52 ft', squareFeet: '5,460 sq ft', image: '/images/turf4.png', gallery: ['/images/turf4.png', '/images/turf5.png', '/images/turf6.png', '/images/turf7.png', '/images/turf1.png'] },
    { id: 5, name: 'ProPlay Cricket Arena', location: 'Vashi', city: 'Mumbai', price: 1000, rating: 4.5, sports: ['Cricket'], dimensions: '95 × 48 ft', squareFeet: '4,560 sq ft', image: '/images/turf4.png', gallery: ['/images/turf4.png', '/images/turf1.png', '/images/turf2.png', '/images/turf3.png', '/images/turf5.png'] },
    { id: 6, name: 'Royal Cricket Ground', location: 'Vijay Nagar', city: 'Indore', price: 1000, rating: 4.7, sports: ['Cricket'], dimensions: '120 × 60 ft', squareFeet: '7,200 sq ft', image: '/images/turf5.png', gallery: ['/images/turf5.png', '/images/turf1.png', '/images/turf3.png', '/images/turf4.png', '/images/turf2.png'] },
    { id: 7, name: 'DunkZone Cricket Turf', location: 'Bandra', city: 'Mumbai', price: 750, rating: 4.3, sports: ['Cricket'], dimensions: '90 × 45 ft', squareFeet: '4,050 sq ft', image: '/images/turf2.png', gallery: ['/images/turf2.png', '/images/turf3.png', '/images/turf4.png', '/images/turf5.png', '/images/turf6.png'] },
    { id: 8, name: 'PixelArena Cricket', location: 'HSR Layout', city: 'Bangalore', price: 1500, rating: 4.8, sports: ['Cricket'], dimensions: '125 × 65 ft', squareFeet: '8,125 sq ft', image: '/images/turf6.png', gallery: ['/images/turf6.png', '/images/turf7.png', '/images/turf1.png', '/images/turf2.png', '/images/turf3.png'] },
    { id: 1, name: 'SportZone Arena', location: 'Andheri West', city: 'Mumbai', price: 1200, rating: 4.8, image: '/images/turf1.png' },
    { id: 2, name: 'Champion Cricket Ground', location: 'Koramangala', city: 'Bangalore', price: 1500, rating: 4.9, image: '/images/turf6.png' },
    { id: 3, name: 'GameVault Cricket Center', location: 'Koramangala', city: 'Bangalore', price: 1200, rating: 4.9, image: '/images/turf2.png' },
    { id: 4, name: 'ProKick Cricket Turf', location: 'Indiranagar', city: 'Bangalore', price: 1400, rating: 4.7, image: '/images/turf3.png' },
    { id: 5, name: 'ProPlay Cricket Arena', location: 'Vashi', city: 'Mumbai', price: 1000, rating: 4.5, image: '/images/turf4.png' },
    { id: 6, name: 'Royal Cricket Ground', location: 'Vijay Nagar', city: 'Indore', price: 1000, rating: 4.7, image: '/images/turf5.png' },
    { id: 7, name: 'DunkZone Cricket Turf', location: 'Bandra', city: 'Mumbai', price: 750, rating: 4.3, image: '/images/turf2.png' },
]

// Generate upcoming 8 days starting from today
const generateUpcomingDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const list = []
    const today = new Date()

    for (let i = 0; i < 8; i++) {
        const d = new Date()
        d.setDate(today.getDate() + i)

        const dayName = days[d.getDay()]
        const monthName = months[d.getMonth()]
        const dateNum = d.getDate()
        const fullYear = d.getFullYear()
        const fullDateString = `${fullYear}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`

        list.push({
            id: `d-${i + 1}`,
            fullDateString,
            dayShort: i === 0 ? 'TODAY' : dayName,
            dateNum,
            monthShort: monthName,
            formattedLabel: i === 0 ? `TODAY, ${dateNum} ${monthName.toUpperCase()}` : `${dayName.toUpperCase()}, ${dateNum} ${monthName.toUpperCase()}`,
        })
    }
    return list
}

// Generate dynamic time slots based on selected venue price and actual date
const generateDynamicSlots = (basePrice = 1200, selectedDateObj = null, venueId = 16) => {
    const rawTimes = [
        { id: '06:00', time: '6:00 AM' },
        { id: '07:00', time: '7:00 AM' },
        { id: '08:00', time: '8:00 AM' },
        { id: '09:00', time: '9:00 AM' },
        { id: '10:00', time: '10:00 AM' },
        { id: '11:00', time: '11:00 AM' },
        { id: '12:00', time: '12:00 PM' },
        { id: '13:00', time: '1:00 PM' },
        { id: '14:00', time: '2:00 PM' },
        { id: '15:00', time: '3:00 PM' },
        { id: '16:00', time: '4:00 PM' },
        { id: '17:00', time: '5:00 PM' },
        { id: '18:00', time: '6:00 PM' },
        { id: '19:00', time: '7:00 PM' },
        { id: '20:00', time: '8:00 PM' },
        { id: '21:00', time: '9:00 PM' },
        { id: '22:00', time: '10:00 PM' },
    ]

    const dateNum = selectedDateObj?.dateNum || 9
    const dayShort = (selectedDateObj?.dayShort || 'TODAY').toUpperCase()
    const fullDate = selectedDateObj?.fullDateString || ''
    const isWeekend = dayShort.includes('SAT') || dayShort.includes('SUN')

    const now = new Date()
    const currentHour = now.getHours()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const isToday = !selectedDateObj || selectedDateObj.dayShort === 'TODAY' || fullDate === todayStr

    return rawTimes.map((s, i) => {
        const slotHour = parseInt(s.id.split(':')[0], 10)
        const isPeakHour = slotHour >= 18 && slotHour <= 22
        const isEarlyMorning = slotHour < 8

        let factor = 1.0
        if (isPeakHour) factor = isWeekend ? 1.30 : 1.28
        else if (isEarlyMorning) factor = 0.85
        else if (isWeekend && slotHour >= 14) factor = 1.15

        let status = 'available'

        if (dayShort.includes('SUN')) {
            if (dateNum === 9) {
                if ([0, 1, 3, 4, 5, 7, 11, 15].includes(i)) status = 'booked'
            } else {
                if ([0, 1, 2, 4, 7, 12, 14, 15, 16].includes(i)) status = 'booked'
            }
        } else if (dayShort.includes('MON')) {
            if ([0, 1, 3, 4, 5, 7, 11, 15].includes(i)) status = 'booked'
            else if (i === 6) status = 'maintenance' // 12:00 PM
            else if (i === 2) status = 'staff_unavailable' // 8:00 AM
        } else if (dayShort.includes('TUE')) {
            if ([2, 4, 8, 12, 15].includes(i)) status = 'booked'
            else if (i === 5) status = 'maintenance' // 11:00 AM
        } else if (dayShort.includes('WED')) {
            if ([3, 7, 11, 14, 15].includes(i)) status = 'booked'
            else if (i === 1) status = 'staff_unavailable' // 7:00 AM
        } else if (dayShort.includes('THU')) {
            if ([0, 2, 5, 8, 11, 15].includes(i)) status = 'booked'
            else if (i === 7) status = 'maintenance' // 1:00 PM
        } else if (dayShort.includes('FRI')) {
            if ([1, 3, 5, 8, 10, 12, 13, 14, 16].includes(i)) status = 'booked'
        } else if (dayShort.includes('SAT')) {
            if ([0, 1, 2, 4, 6, 8, 11, 13, 14, 15].includes(i)) status = 'booked'
            else if (i === 3) status = 'staff_unavailable' // 9:00 AM
        } else {
            const hash = (dateNum * 11 + i * 17 + (venueId || 16) * 5) % 100
            if (hash < 40) status = 'booked'
            else if (hash === 91) status = 'maintenance'
            else if (hash === 92) status = 'staff_unavailable'
        }

        // Real-time time management: if the date is TODAY and slot hour <= currentHour, slot has passed
        if (isToday && slotHour <= currentHour) {
            status = 'booked'
        }

        return {
            ...s,
            status,
            price: Math.round((basePrice * factor) / 50) * 50
        }
    })
}

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

    // Active venue photo preview state & Lightbox Modal
    const [activePhotoUrl, setActivePhotoUrl] = useState(() => selectedVenue.image || '/images/turf1.png')
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
    const [galleryPhotoIndex, setGalleryPhotoIndex] = useState(0)

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        fetch(`${API_URL}/branches`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data && Array.isArray(data.data.branches) && data.data.branches.length > 0) {
                    const realBranches = data.data.branches.map((b, idx) => ({
                        id: b.id || b._id || idx + 1,
                        name: b.branchName || b.name || 'Indore Turf Complex',
                        location: b.fullAddress || (b.city ? `${b.city} Turf Complex` : 'Indore Turf Complex'),
                        city: b.city || 'Indore',
                        price: b.pricePerHour || b.price || 1000,
                        rating: b.rating || 4.9,
                        sports: Array.isArray(b.sports) && b.sports.length > 0 ? b.sports : ['Cricket'],
                        dimensions: b.dimensions || '100 × 50 ft',
                        squareFeet: b.turfSize || '5,000 sq ft',
                        image: (b.images && b.images[0]) || `/images/turf${(idx % 6) + 1}.png`,
                        gallery: [`/images/turf${(idx % 6) + 1}.png`, '/images/turf2.png', '/images/turf3.png']
                    }))
                    const matched = realBranches.find(b => String(b.id) === String(id)) || realBranches[0]
                    setSelectedVenue(matched)
                    setActivePhotoUrl(matched.image)
                }
            })
            .catch(e => console.warn('Fetch real branches note in SlotBookingPage:', e.message))
    }, [id])

    // Modals
    const [isVenueModalOpen, setIsVenueModalOpen] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [authModalTab, setAuthModalTab] = useState('login')
    const [authEmail, setAuthEmail] = useState('customer@gmail.com')
    const [authPassword, setAuthPassword] = useState('123')
    const [authRole, setAuthRole] = useState('customer')
    const [authRegName, setAuthRegName] = useState('')
    const [authRegPhone, setAuthRegPhone] = useState('')
    const [authRegEmail, setAuthRegEmail] = useState('')
    const [authRegPassword, setAuthRegPassword] = useState('123')
    const [authLoading, setAuthLoading] = useState(false)

    // Booking Steps (1 to 4)
    const [activeStep, setActiveStep] = useState(1)

    // Scroll to top of page whenever booking step changes
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
    }, [activeStep])

    const [durationHours, setDurationHours] = useState(1)
    const [dateList] = useState(generateUpcomingDays())
    const [selectedDateObj, setSelectedDateObj] = useState(dateList[0])
    const [selectedSlotTime, setSelectedSlotTime] = useState('18:00')
    const [hasVerifiedUmpire, setHasVerifiedUmpire] = useState(false)

    // Dynamic slot generation based on selectedVenue price and selectedDateObj
    const allTimeSlots = useMemo(() => {
        return generateDynamicSlots(selectedVenue?.price || 1200, selectedDateObj)
    }, [selectedVenue?.price, selectedDateObj])

    // Coupons
    const [couponInput, setCouponInput] = useState('')
    const [appliedOffer, setAppliedOffer] = useState(null)
    const [promoApplied, setPromoApplied] = useState(false)
    const availableOffers = [
        { code: 'SM200', flatDiscount: 200, minPrice: 800 },
        { code: 'CRICKET20', discountPercent: 20, minPrice: 1000 },
        { code: 'EARLY250', flatDiscount: 250, minPrice: 800 }
    ];

    // Step 2 Payment Modes: 'FULL_PAY' | 'DARE_TO_PLAY' | 'SPLIT_50_50' | 'PER_PLAYER'
    const [paymentMode, setPaymentMode] = useState(() => {
        const modeParam = searchParams.get('mode')
        if (modeParam === 'dare') return 'DARE_TO_PLAY'
        if (modeParam === 'split50' || modeParam === 'split-50') return 'SPLIT_50_50'
        if (modeParam === 'per_player' || modeParam === 'per-player') return 'PER_PLAYER'
        return 'DARE_TO_PLAY'
    })

    const [perPlayerCount, setPerPlayerCount] = useState(6)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
    const [bookingResult, setBookingResult] = useState(null)

    // Calculate totals with consecutive multi-hour pricing
    const selectedSlotIndex = allTimeSlots.findIndex(s => s.id === selectedSlotTime)
    const selectedConsecutiveSlots = selectedSlotIndex !== -1
        ? allTimeSlots.slice(selectedSlotIndex, Math.min(allTimeSlots.length, selectedSlotIndex + durationHours))
        : []
    const currentSlotObj = allTimeSlots.find(s => s.id === selectedSlotTime)
    const currentSlotPrice = currentSlotObj ? currentSlotObj.price : (selectedVenue.price || 1200)
    const grossSlotRent = selectedConsecutiveSlots.reduce((sum, slot) => sum + (slot.price || currentSlotPrice), 0)
    const grossRent = grossSlotRent + (hasVerifiedUmpire ? 300 : 0)

    // Automatically adjust selected slot if current duration doesn't fit consecutive available slots
    useEffect(() => {
        const selectedIndex = allTimeSlots.findIndex(s => s.id === selectedSlotTime)
        let isValid = selectedIndex !== -1
        if (isValid) {
            for (let i = 0; i < durationHours; i++) {
                const nextSlot = allTimeSlots[selectedIndex + i]
                if (!nextSlot || nextSlot.status !== 'available') {
                    isValid = false
                    break
                }
            }
        }
        if (!isValid) {
            const firstValidSlot = allTimeSlots.find((s, idx) => {
                return Array.from({ length: durationHours }).every((_, i) => {
                    const candidate = allTimeSlots[idx + i]
                    return candidate && candidate.status === 'available'
                })
            })
            if (firstValidSlot) {
                setSelectedSlotTime(firstValidSlot.id)
            }
        }
    }, [durationHours])

    let discountAmount = 0
    if (appliedOffer) {
        if (appliedOffer.flatDiscount) discountAmount = appliedOffer.flatDiscount
        else if (appliedOffer.discountPercent) discountAmount = Math.round((grossRent * appliedOffer.discountPercent) / 100)
    }
    const totalRent = Math.max(0, grossRent - discountAmount)

    // Split calculations
    const split50Amount = Math.round(totalRent / 2)
    const perPlayerShareAmount = Math.round(totalRent / perPlayerCount)
    let myPaymentAmount = totalRent
    let opponentShareAmount = 0

    if (paymentMode === 'DARE_TO_PLAY') {
        const dareDeposit = Math.round(totalRent * 0.3)
        myPaymentAmount = dareDeposit // 30% deposit lock
        opponentShareAmount = dareDeposit // 30% deposit lock
    } else if (paymentMode === 'SPLIT_50_50') {
        myPaymentAmount = split50Amount
        opponentShareAmount = split50Amount
    } else if (paymentMode === 'PER_PLAYER') {
        myPaymentAmount = perPlayerShareAmount
        opponentShareAmount = totalRent - perPlayerShareAmount
    }

    // Coupon Apply Handler
    const handleApplyCoupon = (code) => {
        const found = availableOffers.find(o => o.code.toUpperCase() === code.toUpperCase())
        if (found) {
            setAppliedOffer(found)
            if (addToast) addToast(`Promo code ${found.code} applied!`, 'success')
        } else {
            if (addToast) addToast('Invalid promo code', 'error')
        }
    }

    // Apply promo from URL query param on mount
    useEffect(() => {
        const promo = searchParams.get('promo')
        if (promo && !promoApplied) {
            const found = availableOffers.find(o => o.code.toUpperCase() === promo.toUpperCase())
            if (found) {
                setAppliedOffer(found)
                setPromoApplied(true)
                if (addToast) addToast(`Promo code ${found.code} applied!`, 'success')
            } else {
                if (addToast) addToast('Invalid promo code', 'error')
            }
        }
    }, [searchParams, promoApplied])

    // Booking Lock Submission Handler
    const handleConfirmBooking = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setBookingResult({
                bookingId: `SM-${Math.floor(1000 + Math.random() * 9000)}`,
                venueName: selectedVenue.name,
                date: selectedDateObj.formattedLabel,
                slotTime: selectedSlotTime,
                amountPaid: myPaymentAmount,
                paymentMode
            });
            setIsPaymentConfirmed(true);
            setActiveStep(4);
            if (addToast) addToast('⚡ Match Slot Locked Successfully!', 'success');
        }, 1200);
    }

    // Share link copy
    const handleCopyShareLink = () => {
        const shareUrl = `${window.location.origin}/booking/${selectedVenue.id}?mode=${paymentMode.toLowerCase()}&pay=opponent`
        navigator.clipboard.writeText(shareUrl)
        if (addToast) addToast('Link copied to clipboard!', 'info')
    }

    // WhatsApp share
    const handleShareWhatsApp = () => {
        const shareUrl = `${window.location.origin}/booking/${selectedVenue.id}?mode=${paymentMode.toLowerCase()}&pay=opponent`
        const msg = encodeURIComponent(`🔥 Accept Dare Match at ${selectedVenue.name} on ${selectedDateObj.dayShort}! Pay share: ${shareUrl}`)
        window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank')
    }

    // Auth Login Handlers
    const handleAuthLoginSubmit = (e) => {
        e.preventDefault()
        setAuthLoading(true)
        setTimeout(() => {
            setAuthLoading(false)
            login({ email: authEmail, role: authRole, name: authEmail.split('@')[0] })
            setIsAuthModalOpen(false)
            if (addToast) addToast('Signed in successfully', 'success')
        }, 800)
    }

    const handleQuickDemoLogin = (roleType) => {
        const emailMap = { customer: 'customer@gmail.com', owner: 'owner@gmail.com', superadmin: 'superadmin@gmail.com', guest: 'guest@sportmatrix.com' }
        login({ email: emailMap[roleType] || 'customer@gmail.com', role: roleType, name: roleType.toUpperCase() })
        setIsAuthModalOpen(false)
        if (addToast) addToast(`Logged in as ${roleType}`, 'success')
    }

    const handleRegisterSubmit = (e) => {
        e.preventDefault()
        setAuthLoading(true)
        setTimeout(() => {
            setAuthLoading(false)
            login({ email: authRegEmail, role: 'customer', name: authRegName || 'Customer' })
            setIsAuthModalOpen(false)
            if (addToast) addToast('Account created successfully', 'success')
        }, 800)
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#111827] font-sans pt-20 pb-28 px-4 sm:px-6 md:px-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ═══════════════════════════════════════════════════
                    TOP STEP NAVIGATION BAR (Modern Step Indicator)
                ═══════════════════════════════════════════════════ */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-2.5 shadow-xs flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {[
                            { num: 1, label: '1. Select Slot' },
                            { num: 2, label: '2. Payment Mode' },
                            { num: 3, label: '3. Review & Lock' },
                            { num: 4, label: '4. Confirmed' },
                        ].map((step) => {
                            const isActive = activeStep === step.num
                            const isPast = activeStep > step.num
                            const isDisabled = (!isPaymentConfirmed && step.num !== 1) || (!isPast && !isActive)
                            return (
                                <button
                                    key={step.num}
                                    type="button"
                                    onClick={() => isPast && setActiveStep(step.num)}
                                    disabled={isDisabled}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${isActive
                                        ? 'bg-[#111827] text-white shadow-xs'
                                        : isPast
                                            ? 'bg-white text-[#10B981] border border-emerald-300 hover:bg-emerald-50 cursor-pointer'
                                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                                        }`}
                                >
                                    {isPast && <HiCheck className="w-3.5 h-3.5 text-[#10B981]" />}
                                    <span>{step.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsVenueModalOpen(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#065F46] bg-[#ECFDF5] hover:bg-emerald-100 border border-emerald-300 px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0"
                    >
                        <span>🏟️</span>
                        <span>SWITCH TURF</span>
                        <span className="text-[#065F46]">▾</span>
                    </button>
                </div>

                {/* ═══════════════════════════════════════════════════
                    STEP 1: DATE & TIME (2-Column Dashboard Layout)
                ═══════════════════════════════════════════════════ */}
                {activeStep === 1 && (
                    <div className="animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* ── LEFT SIDEBAR (Col-Span 4 ~33% Width) ── */}
                            <div className="lg:col-span-4 space-y-6">
                                <TurfSidebarCard
                                    selectedVenue={selectedVenue}
                                    activePhotoUrl={activePhotoUrl}
                                    setActivePhotoUrl={setActivePhotoUrl}
                                    setGalleryPhotoIndex={setGalleryPhotoIndex}
                                    setIsGalleryModalOpen={setIsGalleryModalOpen}
                                />

                                <CouponsCard
                                    couponInput={couponInput}
                                    setCouponInput={setCouponInput}
                                    appliedOffer={appliedOffer}
                                    setAppliedOffer={setAppliedOffer}
                                    availableOffers={availableOffers}
                                    handleApplyCoupon={handleApplyCoupon}
                                    addToast={addToast}
                                />
                            </div>

                            {/* ── RIGHT MAIN WORKSPACE (Col-Span 8 ~67% Width) ── */}
                            <div className="lg:col-span-8">
                                <BookingStep1Workspace
                                    selectedVenue={selectedVenue}
                                    durationHours={durationHours}
                                    setDurationHours={setDurationHours}
                                    dateList={dateList}
                                    selectedDateObj={selectedDateObj}
                                    setSelectedDateObj={setSelectedDateObj}
                                    allTimeSlots={allTimeSlots}
                                    selectedSlotTime={selectedSlotTime}
                                    setSelectedSlotTime={setSelectedSlotTime}
                                    hasVerifiedUmpire={hasVerifiedUmpire}
                                    setHasVerifiedUmpire={setHasVerifiedUmpire}
                                    currentSlotPrice={currentSlotPrice}
                                    grossRent={grossRent}
                                    discountAmount={discountAmount}
                                    totalRent={totalRent}
                                    appliedOffer={appliedOffer}
                                    setActiveStep={setActiveStep}
                                    setIsGalleryModalOpen={setIsGalleryModalOpen}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════
                    STEP 2: PAYMENT MODE SELECTION
                ═══════════════════════════════════════════════════ */}
                {activeStep === 2 && (
                    <BookingStep2Modes
                        paymentMode={paymentMode}
                        setPaymentMode={setPaymentMode}
                        totalRent={totalRent}
                        perPlayerCount={perPlayerCount}
                        setPerPlayerCount={setPerPlayerCount}
                        perPlayerShareAmount={perPlayerShareAmount}
                        split50Amount={split50Amount}
                        setActiveStep={setActiveStep}
                    />
                )}

                {/* ═══════════════════════════════════════════════════
                    STEP 3: REVIEW & LOCK MATCH
                ═══════════════════════════════════════════════════ */}
                {activeStep === 3 && (
                    <BookingStep3Lock
                        autoOpenModal={promoApplied}
                        selectedVenue={selectedVenue}
                        selectedDateObj={selectedDateObj}
                        selectedSlotTime={selectedSlotTime}
                        allTimeSlots={allTimeSlots}
                        durationHours={durationHours}
                        paymentMode={paymentMode}
                        totalRent={totalRent}
                        myPaymentAmount={myPaymentAmount}
                        opponentShareAmount={opponentShareAmount}
                        perPlayerCount={perPlayerCount}
                        perPlayerShareAmount={perPlayerShareAmount}
                        hasVerifiedUmpire={hasVerifiedUmpire}
                        handleConfirmBooking={handleConfirmBooking}
                        isSubmitting={isSubmitting}
                        setActiveStep={setActiveStep}
                    />
                )}

                {/* ═══════════════════════════════════════════════════
                    STEP 4: CONFIRMATION & RECEIPT
                ═══════════════════════════════════════════════════ */}
                {activeStep === 4 && (
                    <BookingStep4Receipt
                        bookingResult={bookingResult}
                        selectedVenue={selectedVenue}
                        selectedDateObj={selectedDateObj}
                        selectedSlotTime={selectedSlotTime}
                        allTimeSlots={allTimeSlots}
                        paymentMode={paymentMode}
                        totalRent={totalRent}
                        myPaymentAmount={myPaymentAmount}
                        opponentShareAmount={opponentShareAmount}
                        handleCopyShareLink={handleCopyShareLink}
                        handleShareWhatsApp={handleShareWhatsApp}
                        navigate={navigate}
                    />
                )}

                {/* MODALS */}
                <TurfGalleryModal
                    isOpen={isGalleryModalOpen}
                    onClose={() => setIsGalleryModalOpen(false)}
                    selectedVenue={selectedVenue}
                    galleryPhotoIndex={galleryPhotoIndex}
                    setGalleryPhotoIndex={setGalleryPhotoIndex}
                    activePhotoUrl={activePhotoUrl}
                    setActivePhotoUrl={setActivePhotoUrl}
                />

                <VenueSwitchModal
                    isOpen={isVenueModalOpen}
                    onClose={() => setIsVenueModalOpen(false)}
                    allTurfs={allAvailableTurfs}
                    selectedVenue={selectedVenue}
                    onSelectVenue={(venue) => {
                        setSelectedVenue(venue)
                        setActivePhotoUrl(venue.image || '/images/turf1.png')
                        setIsVenueModalOpen(false)
                        navigate(`/booking/${venue.id}`, { replace: true })
                    }}
                />

                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setIsAuthModalOpen(false)}
                    authModalTab={authModalTab}
                    setAuthModalTab={setAuthModalTab}
                    authRole={authRole}
                    setAuthRole={setAuthRole}
                    authEmail={authEmail}
                    setAuthEmail={setAuthEmail}
                    authPassword={authPassword}
                    setAuthPassword={setAuthPassword}
                    authRegName={authRegName}
                    setAuthRegName={setAuthRegName}
                    authRegPhone={authRegPhone}
                    setAuthRegPhone={setAuthRegPhone}
                    authRegEmail={authRegEmail}
                    setAuthRegEmail={setAuthRegEmail}
                    authRegPassword={authRegPassword}
                    setAuthRegPassword={setAuthRegPassword}
                    authLoading={authLoading}
                    handleAuthLoginSubmit={handleAuthLoginSubmit}
                    handleQuickDemoLogin={handleQuickDemoLogin}
                    handleRegisterSubmit={handleRegisterSubmit}
                />
            </div>
        </div>
    )
}
