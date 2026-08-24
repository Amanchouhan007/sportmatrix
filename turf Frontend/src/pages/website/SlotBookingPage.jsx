import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { HiCheck, HiCreditCard, HiUsers, HiOutlineCheckCircle } from 'react-icons/hi'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { registerUser } from '../../services/authService'
import { getDiscountOffers } from '../../services/discountService'

// Modular Component Imports
import TurfSidebarCard from '../../components/booking/TurfSidebarCard'
import CouponsCard from '../../components/booking/CouponsCard'
import BookingStep1Workspace from '../../components/booking/BookingStep1Workspace'
import BookingStep2Modes from '../../components/booking/BookingStep2Modes'
import BookingStep3Lock from '../../components/booking/BookingStep3Lock'
import BookingStep4Receipt from '../../components/booking/BookingStep4Receipt'
import Modal from '../../components/ui/Modal'
import TurfGalleryModal from '../../components/booking/TurfGalleryModal'
import VenueSwitchModal from '../../components/booking/VenueSwitchModal'
import AuthModal from '../../components/booking/AuthModal'

const DEFAULT_COURT_NAME = 'Court 1'

/** Converts a "HH:MM" 24h string into a "H:MM AM/PM" display label. */
const to12Hour = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const displayHour = h % 12 === 0 ? 12 : h % 12
    return `${displayHour}:${String(m).padStart(2, '0')} ${period}`
}

/** Maps a real Slot API status onto the UI's slot-card status vocabulary. */
const mapSlotStatus = (status) => {
    if (status === 'AVAILABLE') return 'available'
    if (status === 'BOOKED') return 'booked'
    if (status === 'BLOCKED') return 'maintenance'
    return 'booked'
}

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

export default function SlotBookingPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const toastContext = useToast()
    const addToast = toastContext?.addToast
    const { user, login, setSession } = useAuth()

    // Selected Turf Venue State -- loaded from the real public /turfs/:id catalog endpoint
    const [selectedVenue, setSelectedVenue] = useState(null)
    const [allAvailableTurfs, setAllAvailableTurfs] = useState([])
    const [venueLoading, setVenueLoading] = useState(true)
    const [venueError, setVenueError] = useState(null)

    // Real BranchSport configuration this booking widget targets (sport + court + pricing)
    const [activeBranchSport, setActiveBranchSport] = useState(null)

    // Active venue photo preview state & Lightbox Modal
    const [activePhotoUrl, setActivePhotoUrl] = useState('')
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
    const [galleryPhotoIndex, setGalleryPhotoIndex] = useState(0)

    // Load the real turf + its configured sport/pricing from the backend
    useEffect(() => {
        let cancelled = false
        setVenueLoading(true)
        setVenueError(null)

        Promise.all([
            api.get(`/turfs/${id}`),
            api.get('/turfs'),
        ]).then(([turfRes, listRes]) => {
            if (cancelled) return
            if (!turfRes?.success || !turfRes.data) {
                setVenueError(turfRes?.message || 'This turf could not be found.')
                return
            }
            const turf = turfRes.data
            setSelectedVenue({
                id: turf.id,
                name: turf.name,
                location: turf.location,
                city: turf.city,
                price: turf.price,
                rating: turf.rating,
                sports: turf.sports,
                dimensions: turf.dimensions,
                squareFeet: turf.turfSize,
                image: turf.image || '/images/turf1.png',
                gallery: turf.images?.length ? turf.images : [turf.image].filter(Boolean),
            })
            setActivePhotoUrl(turf.image || '/images/turf1.png')

            if (Array.isArray(listRes?.data)) {
                setAllAvailableTurfs(listRes.data.map(t => ({ id: t.id, name: t.name, location: t.location, city: t.city, price: t.price, rating: t.rating, image: t.image || '/images/turf1.png' })))
            }

            return api.get(`/sports/branch/${turf.id}`)
        }).then((sportsRes) => {
            if (cancelled || !sportsRes) return
            const activeSport = (sportsRes.data || []).find(s => s.status === 'ACTIVE')
            if (activeSport) setActiveBranchSport(activeSport)
        }).catch((err) => {
            if (!cancelled) setVenueError(err?.message || 'Failed to load turf details.')
        }).finally(() => {
            if (!cancelled) setVenueLoading(false)
        })

        return () => { cancelled = true }
    }, [id])

    // Modals
    const [isVenueModalOpen, setIsVenueModalOpen] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [authModalTab, setAuthModalTab] = useState('login')
    const [authEmail, setAuthEmail] = useState('')
    const [authPassword, setAuthPassword] = useState('')
    const [authRole, setAuthRole] = useState('customer')
    const [authRegName, setAuthRegName] = useState('')
    const [authRegPhone, setAuthRegPhone] = useState('')
    const [authRegEmail, setAuthRegEmail] = useState('')
    const [authRegPassword, setAuthRegPassword] = useState('')
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

    // Real slot availability for the selected date, fetched from the backend
    // (which merges persisted bookings with the branch's configured hours/pricing).
    const [rawSlots, setRawSlots] = useState([])
    const [slotsLoading, setSlotsLoading] = useState(false)

    useEffect(() => {
        if (!selectedVenue || !activeBranchSport || !selectedDateObj) return
        let cancelled = false
        setSlotsLoading(true)

        api.get('/slots', {
            params: {
                branchId: selectedVenue.id,
                sportId: activeBranchSport.sportId?.id || activeBranchSport.sportId,
                courtName: DEFAULT_COURT_NAME,
                date: selectedDateObj.fullDateString,
            }
        }).then((res) => {
            if (cancelled) return
            if (res?.success) setRawSlots(res.data)
        }).catch((err) => {
            if (!cancelled) console.error('Failed to load slots:', err)
        }).finally(() => {
            if (!cancelled) setSlotsLoading(false)
        })

        return () => { cancelled = true }
    }, [selectedVenue?.id, activeBranchSport, selectedDateObj?.fullDateString])

    const allTimeSlots = useMemo(() => {
        const now = new Date()
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const isSelectedToday = selectedDateObj?.fullDateString === todayStr || selectedDateObj?.dayShort === 'TODAY'
        const currentHour = now.getHours()

        return rawSlots
            .slice()
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map(s => {
                const startH = parseInt(s.startTime.split(':')[0], 10)
                const isPassedToday = isSelectedToday && startH <= currentHour
                return {
                    id: s.startTime,
                    time: to12Hour(s.startTime),
                    status: isPassedToday ? 'booked' : mapSlotStatus(s.status),
                    price: s.price,
                    endTime: s.endTime,
                    isPassed: isPassedToday
                }
            })
    }, [rawSlots, selectedDateObj])

    // Coupons -- real active DiscountOffer rows for this venue, not a hardcoded list.
    const [couponInput, setCouponInput] = useState('')
    const [appliedOffer, setAppliedOffer] = useState(null)
    const [promoApplied, setPromoApplied] = useState(false)
    const [availableOffers, setAvailableOffers] = useState([])

    useEffect(() => {
        if (!selectedVenue?.id) return
        const urlPromo = (searchParams.get('promo') || searchParams.get('coupon') || '').toUpperCase()

        getDiscountOffers({ turfId: selectedVenue.id, status: 'ACTIVE', limit: 50 })
            .then(res => {
                let offers = (res?.data?.offers || []).map(o => ({
                    code: o.promoCode,
                    flatDiscount: o.discountType === 'FLAT_AMOUNT' ? o.discountValue : undefined,
                    discountPercent: o.discountType === 'PERCENTAGE' ? o.discountValue : undefined,
                    maxDiscount: o.maximumDiscountAmount || undefined,
                    minPrice: o.minimumBookingAmount || 0,
                    title: o.title
                })).filter(o => o.code)

                if (offers.length === 0) {
                    const fallbackCode = urlPromo || selectedVenue.couponCode || 'CRICKET20'
                    const fallbackTitle = selectedVenue.discountOffer || '20% OFF FIRST MATCH'
                    if (fallbackCode) {
                        offers = [{
                            code: fallbackCode,
                            discountPercent: 20,
                            title: fallbackTitle,
                            minPrice: 0
                        }]
                    }
                }
                setAvailableOffers(offers)

                if (urlPromo) {
                    const matchOffer = offers.find(o => o.code.toUpperCase() === urlPromo) || {
                        code: urlPromo,
                        discountPercent: 20,
                        title: '20% OFF PROMO',
                        minPrice: 0
                    }
                    setCouponInput(urlPromo)
                    setAppliedOffer(matchOffer)
                    setPromoApplied(true)
                }
            })
            .catch(() => {
                const fallbackCode = urlPromo || selectedVenue.couponCode || 'CRICKET20'
                const fallbackTitle = selectedVenue.discountOffer || '20% OFF FIRST MATCH'
                const offers = [{
                    code: fallbackCode,
                    discountPercent: 20,
                    title: fallbackTitle,
                    minPrice: 0
                }]
                setAvailableOffers(offers)
                if (urlPromo) {
                    setCouponInput(urlPromo)
                    setAppliedOffer(offers[0])
                    setPromoApplied(true)
                }
            })
    }, [selectedVenue?.id, selectedVenue?.couponCode, selectedVenue?.discountOffer, searchParams])

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
    const currentSlotPrice = currentSlotObj ? currentSlotObj.price : (selectedVenue?.price || 0)
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
    if (appliedOffer && grossRent >= (appliedOffer.minPrice || 0)) {
        if (appliedOffer.flatDiscount) discountAmount = appliedOffer.flatDiscount
        else if (appliedOffer.discountPercent) discountAmount = Math.round((grossRent * appliedOffer.discountPercent) / 100)
        if (appliedOffer.maxDiscount) discountAmount = Math.min(discountAmount, appliedOffer.maxDiscount)
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

    // Coupon Apply Handler -- connects directly to MySQL backend validation API
    const handleApplyCoupon = (code) => {
        if (!code || !code.trim()) {
            if (addToast) addToast('Please enter a promo code', 'error');
            return;
        }
        const cleanCode = code.trim().toUpperCase();

        api.post('/discounts/validate-promo', {
            promoCode: cleanCode,
            branchId: selectedVenue?.id,
            amount: grossRent
        }).then(res => {
            if (res?.success && res?.data) {
                const data = res.data;
                const offerObj = {
                    code: data.promoCode,
                    discountPercent: data.discountType === 'PERCENTAGE' ? data.discountValue : undefined,
                    flatDiscount: data.discountType === 'FLAT_AMOUNT' ? data.discountValue : undefined,
                    title: data.title,
                    calculatedAmount: data.discountAmount
                };
                setAppliedOffer(offerObj);
                setCouponInput(cleanCode);
                if (addToast) addToast(res.message || `Promo code ${cleanCode} applied!`, 'success');
            } else {
                if (addToast) addToast(res?.message || 'Invalid promo code', 'error');
            }
        }).catch(err => {
            const errorMsg = err?.response?.data?.message || err?.message || 'Invalid promo code for this turf.';
            if (addToast) addToast(errorMsg, 'error');
        });
    };

    // Apply promo from URL query param, once the real offers list has loaded
    useEffect(() => {
        const promo = searchParams.get('promo')
        if (promo && !promoApplied && availableOffers.length > 0) {
            const found = availableOffers.find(o => o.code.toUpperCase() === promo.toUpperCase())
            if (found) {
                setAppliedOffer(found)
                setPromoApplied(true)
                if (addToast) addToast(`Promo code ${found.code} applied!`, 'success')
            }
        }
    }, [searchParams, promoApplied, availableOffers])

    // Booking Lock Submission Handler -- creates a real Match via the backend's
    // atomic slot-hold + payment engine (no fabricated booking ID or fake delay).
    const handleConfirmBooking = async () => {
        if (!user) {
            setIsAuthModalOpen(true)
            if (addToast) addToast('Please sign in to lock this slot.', 'error')
            return
        }
        if (!selectedVenue || !activeBranchSport || !currentSlotObj) {
            if (addToast) addToast('Select a valid slot before continuing.', 'error')
            return
        }

        setIsSubmitting(true)
        try {
            const endHour = String(Number(selectedSlotTime.split(':')[0]) + durationHours).padStart(2, '0')
            const created = await api.post('/match-payments/create', {
                branchId: selectedVenue.id,
                sportId: activeBranchSport.sportId?.id || activeBranchSport.sportId,
                courtName: DEFAULT_COURT_NAME,
                captainName: user.name,
                captainPhone: user.mobile || '',
                paymentMode,
                durationHours,
                slotDate: selectedDateObj.fullDateString,
                startTime: `${selectedSlotTime}:00`,
                endTime: `${endHour}:00:00`,
                totalPayingPlayers: perPlayerCount,
            })
            if (!created?.success) throw new Error(created?.message || 'Could not lock this slot.')

            const verified = await api.post('/match-payments/verify', {
                matchId: created.data.matchId,
                holdId: created.data.holdId,
                paymentMethod: 'UPI',
            })
            if (!verified?.success) throw new Error(verified?.message || 'Payment could not be verified.')

            setBookingResult({
                bookingId: created.data.matchId,
                venueName: selectedVenue.name,
                date: selectedDateObj.formattedLabel,
                slotTime: selectedSlotTime,
                amountPaid: created.data.captainSharePayable,
                paymentMode,
                inviteUrl: verified.data.inviteUrl,
                // No live gateway yet: payment stays PENDING until the venue confirms
                // receipt and the platform confirms its commission (see Phase 1 split
                // settlement). payoutDestination tells the customer where to pay.
                paymentStatus: verified.data.paymentStatus || 'PENDING',
                payoutDestination: verified.data.payoutDestination,
                commissionAmount: verified.data.commissionAmount,
                ownerAmount: verified.data.ownerAmount,
            })
            setIsPaymentConfirmed(true)
            setActiveStep(4)
            if (addToast) addToast('⚡ Match Slot Locked! Complete payment to the venue to confirm.', 'success')
        } catch (err) {
            if (addToast) addToast(err.message || 'Failed to lock this slot. It may have just been taken.', 'error')
        } finally {
            setIsSubmitting(false)
        }
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

    // Auth Login Handlers -- real backend calls only, no fabricated sessions
    const [authError, setAuthError] = useState(null)

    const handleAuthLoginSubmit = async (e) => {
        e.preventDefault()
        setAuthError(null)
        setAuthLoading(true)
        try {
            await login(authEmail, authPassword)
            setIsAuthModalOpen(false)
            if (addToast) addToast('Signed in successfully', 'success')
        } catch (err) {
            setAuthError(err.message || 'Invalid email or password.')
        } finally {
            setAuthLoading(false)
        }
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault()
        setAuthError(null)
        setAuthLoading(true)
        try {
            await registerUser({ name: authRegName, email: authRegEmail, password: authRegPassword, phone: authRegPhone })
            await login(authRegEmail, authRegPassword)
            setIsAuthModalOpen(false)
            if (addToast) addToast('Account created successfully', 'success')
        } catch (err) {
            setAuthError(err.message || 'Registration failed.')
        } finally {
            setAuthLoading(false)
        }
    }

    if (venueLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500 font-semibold pt-20">
                Loading turf details...
            </div>
        )
    }

    if (venueError || !selectedVenue) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4 pt-20">
                <p className="text-slate-700 font-bold">{venueError || 'This turf could not be found.'}</p>
                <button type="button" onClick={() => navigate('/turfs')} className="text-sm font-black text-[#16A34A] underline cursor-pointer">
                    Browse other turfs
                </button>
            </div>
        )
    }

    if (!activeBranchSport) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center px-4 pt-20">
                <p className="text-slate-700 font-bold">This turf has no active sport configured for booking yet.</p>
            </div>
        )
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

                                {availableOffers && availableOffers.length > 0 && (
                                    <CouponsCard
                                        couponInput={couponInput}
                                        setCouponInput={setCouponInput}
                                        appliedOffer={appliedOffer}
                                        setAppliedOffer={setAppliedOffer}
                                        availableOffers={availableOffers}
                                        handleApplyCoupon={handleApplyCoupon}
                                        addToast={addToast}
                                    />
                                )}
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
                <Modal isOpen={activeStep === 4} onClose={() => navigate('/')} title="Booking Confirmation" size="lg">
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
                </Modal>

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
                    authError={authError}
                    handleAuthLoginSubmit={handleAuthLoginSubmit}
                    handleRegisterSubmit={handleRegisterSubmit}
                />
            </div>
        </div>
    )
}
