import { useState, useEffect } from 'react'
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
    { id: 9, name: 'Skyline Cricket Turf', location: 'Powai', city: 'Mumbai', price: 1400, rating: 4.6, sports: ['Cricket'], dimensions: '100 × 50 ft', squareFeet: '5,000 sq ft', image: '/images/turf6.png', gallery: ['/images/turf6.png', '/images/turf1.png', '/images/turf2.png', '/images/turf4.png', '/images/turf5.png'] },
    { id: 10, name: 'StrikeZone Cricket', location: 'Noida', city: 'Delhi', price: 850, rating: 4.6, sports: ['Cricket'], dimensions: '90 × 45 ft', squareFeet: '4,050 sq ft', image: '/images/turf7.png', gallery: ['/images/turf7.png', '/images/turf1.png', '/images/turf2.png', '/images/turf3.png', '/images/turf5.png'] },
    { id: 11, name: 'Master Blaster Cricket', location: 'Saket', city: 'Delhi', price: 1100, rating: 4.8, sports: ['Cricket'], dimensions: '105 × 52 ft', squareFeet: '5,460 sq ft', image: '/images/turf7.png', gallery: ['/images/turf7.png', '/images/turf3.png', '/images/turf4.png', '/images/turf5.png', '/images/turf6.png'] },
    { id: 12, name: 'Pune Cricket Arena', location: 'Kothrud', city: 'Pune', price: 1000, rating: 4.5, sports: ['Cricket'], dimensions: '100 × 50 ft', squareFeet: '5,000 sq ft', image: '/images/turf2.png', gallery: ['/images/turf2.png', '/images/turf1.png', '/images/turf3.png', '/images/turf5.png', '/images/turf4.png'] },
    { id: 13, name: 'Spike Cricket Turf', location: 'Bhawarkua', city: 'Indore', price: 500, rating: 4.6, sports: ['Cricket'], dimensions: '95 × 48 ft', squareFeet: '4,560 sq ft', image: '/images/turf1.png', gallery: ['/images/turf1.png', '/images/turf2.png', '/images/turf3.png', '/images/turf4.png', '/images/turf5.png'] },
    { id: 14, name: 'Indore Sports Complex', location: 'LIG Colony', city: 'Indore', price: 1200, rating: 4.9, sports: ['Cricket'], dimensions: '115 × 58 ft', squareFeet: '6,670 sq ft', image: '/images/turf3.png', gallery: ['/images/turf3.png', '/images/turf4.png', '/images/turf5.png', '/images/turf1.png', '/images/turf2.png'] },
    { id: 15, name: 'Rajiv Gandhi Stadium Turf', location: 'Navlakha', city: 'Indore', price: 700, rating: 4.5, sports: ['Cricket'], dimensions: '100 × 50 ft', squareFeet: '5,000 sq ft', image: '/images/turf4.png', gallery: ['/images/turf4.png', '/images/turf5.png', '/images/turf1.png', '/images/turf2.png', '/images/turf3.png'] },
]

// Generate 31 upcoming days starting from today
const generateUpcomingDays = () => {
    const days = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const baseDate = new Date()

    for (let i = 0; i < 31; i++) {
        const d = new Date(baseDate)
        d.setDate(baseDate.getDate() + i)
        const fullDateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        days.push({
            id: `date-${fullDateString}`,
            fullDateString,
            dayShort: i === 0 ? 'TODAY' : dayNames[d.getDay()],
            dayFull: fullDayNames[d.getDay()],
            dateNum: d.getDate(),
            monthShort: monthNames[d.getMonth()],
            year: d.getFullYear(),
            formattedLabel: `${i === 0 ? 'TODAY' : fullDayNames[d.getDay()].toUpperCase()}, ${d.getDate()} ${monthNames[d.getMonth()].toUpperCase()}`
        })
    }
    return days
}

// Available Time Slots matching exact grid with dynamic pricing
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

    // Active venue photo preview state & Lightbox Modal
    const [activePhotoUrl, setActivePhotoUrl] = useState(() => selectedVenue.image || '/images/turf1.png')
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
    const [galleryPhotoIndex, setGalleryPhotoIndex] = useState(0)

    useEffect(() => {
        if (id) {
            const found = allAvailableTurfs.find(t => t.id === Number(id))
            if (found) {
                setSelectedVenue(found)
                setActivePhotoUrl(found.image || '/images/turf1.png')
            }
        }
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

    // Step 1 Selections
    const [durationHours, setDurationHours] = useState(1)
    const [dateList] = useState(generateUpcomingDays())
    const [selectedDateObj, setSelectedDateObj] = useState(dateList[0])
    const [selectedSlotTime, setSelectedSlotTime] = useState('18:00')
    const [hasVerifiedUmpire, setHasVerifiedUmpire] = useState(false)

    // Coupons
    const [couponInput, setCouponInput] = useState('')
    const [appliedOffer, setAppliedOffer] = useState(null)
    const availableOffers = [
        { code: 'SM200', flatDiscount: 200, minPrice: 800 },
        { code: 'CRICKET20', discountPercent: 20, minPrice: 1000 }
    ]

    // Step 2 Payment Modes: 'FULL_PAY' | 'DARE_TO_PLAY' | 'SPLIT_50_50' | 'PER_PLAYER'
    const [paymentMode, setPaymentMode] = useState(() => {
        const modeParam = searchParams.get('mode')
        if (modeParam === 'dare') return 'DARE_TO_PLAY'
        if (modeParam === 'split50') return 'SPLIT_50_50'
        if (modeParam === 'per_player') return 'PER_PLAYER'
        return 'FULL_PAY'
    })

    const [perPlayerCount, setPerPlayerCount] = useState(6)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [bookingResult, setBookingResult] = useState(null)

    // Calculate totals
    const currentSlotObj = allTimeSlots.find(s => s.id === selectedSlotTime)
    const currentSlotPrice = currentSlotObj ? currentSlotObj.price : (selectedVenue.price || 1200)
    const grossRent = (currentSlotPrice * durationHours) + (hasVerifiedUmpire ? 300 : 0)

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
        myPaymentAmount = 100 // ₹100 deposit lock
        opponentShareAmount = totalRent
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

    // Booking Lock Submission Handler
    const handleConfirmBooking = () => {
        setIsSubmitting(true)
        setTimeout(() => {
            setIsSubmitting(false)
            setBookingResult({
                bookingId: `SM-${Math.floor(1000 + Math.random() * 9000)}`,
                venueName: selectedVenue.name,
                date: selectedDateObj.formattedLabel,
                slotTime: selectedSlotTime,
                amountPaid: myPaymentAmount,
                paymentMode
            })
            setActiveStep(4)
            if (addToast) addToast('⚡ Match Slot Locked Successfully!', 'success')
        }, 1200)
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
                            return (
                                <button
                                    key={step.num}
                                    type="button"
                                    onClick={() => isPast && setActiveStep(step.num)}
                                    disabled={!isPast && !isActive}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                                        isActive
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
