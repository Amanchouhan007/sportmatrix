import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
    HiLocationMarker, 
    HiStar, 
    HiArrowLeft, 
    HiShieldCheck, 
    HiClock, 
    HiPhone, 
    HiMail, 
    HiLightBulb, 
    HiCheckCircle, 
    HiX,
    HiCalendar,
    HiChevronLeft,
    HiChevronRight,
    HiChevronDown,
    HiCheck
} from 'react-icons/hi'
import SlotGrid from '../../components/ui/SlotGrid'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { getBranchById } from '../../services/branchService'
import TurfHeroGallery from '../../components/turf-detail/TurfHeroGallery'
import TurfHeaderInfo from '../../components/turf-detail/TurfHeaderInfo'
import TurfDirectionsMap from '../../components/turf-detail/TurfDirectionsMap'
import TurfReviewsSection from '../../components/turf-detail/TurfReviewsSection'
import TurfBookingSuccessModal from '../../components/turf-detail/TurfBookingSuccessModal'
import PaymentModal from '../../components/booking/PaymentModal'
import VenueSwitchModal from '../../components/booking/VenueSwitchModal'
import CorporateBookingModal from '../../components/website/CorporateBookingModal'

const defaultTurfData = {
    id: 1, name: 'SportZone Arena', location: 'Andheri West, Mumbai', rating: 4.8, reviews: 124,
    description: 'Elite sports facility engineered for peak performance. Features high-lumen LED floodlights, pro-grade synthetic turf, and professional recovery zones. Ideal for intense box cricket leagues and standard cricket matches.',
    sports: [
        { name: 'Cricket', price: 800, peakPrice: 1200 },
    ],
    amenities: ['Floodlights', 'Secured Parking', 'Pro Locker Rooms', 'Hydration Station', 'Med-Bay', 'High-Speed Wi-Fi'],
    media: [
        { type: 'image', url: '/images/turf1.png', thumbnail: '/images/turf1.png' },
        { type: 'image', url: '/images/turf2.png', thumbnail: '/images/turf2.png' },
        { type: 'image', url: '/images/turf3.png', thumbnail: '/images/turf3.png' },
        { type: 'image', url: '/images/turf4.png', thumbnail: '/images/turf4.png' }
    ],
    timing: '06:00 - 23:00 Hrs',
    fullAddress: 'Plot No. 42, Lokhandwala Complex, Andheri West, Mumbai, Maharashtra 400053',
    landmarks: ['Near Infinity Mall', '5 min from Andheri Metro Station', 'Opposite HDFC Bank'],
    coordinates: { lat: 19.1364, lng: 72.8296 },
}

const allTurfsList = [
    { id: 1, name: 'Green Arena Football Turf', location: 'Andheri West, Mumbai', city: 'Mumbai', rating: 4.8, price: 1200, image: '/images/turf1.png', sports: ['Football', 'Cricket'], amenities: ['Floodlights', 'Parking', 'Washroom'], lat: 19.1136, lng: 72.8697 },
    { id: 2, name: 'Champion Turf Ground', location: 'Vijay Nagar, Indore', city: 'Indore', rating: 4.8, price: 900, image: '/images/turf2.png', sports: ['Cricket', 'Football'], amenities: ['Floodlights', 'Parking', 'Seating', 'Drinking Water'], lat: 22.7244, lng: 75.8839 },
    { id: 3, name: 'Royal Cricket Ground', location: 'Palasia, Indore', city: 'Indore', rating: 4.7, price: 1000, image: '/images/turf5.png', sports: ['Cricket'], amenities: ['Floodlights', 'Parking', 'Drinking Water'], lat: 22.7533, lng: 75.8937 },
    { id: 4, name: 'ProPlay Cricket Arena', location: 'Vashi, Navi Mumbai', city: 'Mumbai', rating: 4.5, price: 1000, image: '/images/turf4.png', sports: ['Cricket'], amenities: ['Floodlights', 'Parking'], lat: 19.0330, lng: 73.0297 },
    { id: 5, name: 'GameVault Cricket Center', location: 'Koramangala, Bangalore', city: 'Bangalore', rating: 4.9, price: 1200, image: '/images/turf3.png', sports: ['Cricket'], amenities: ['Floodlights', 'Parking', 'Seating', 'Washroom'], lat: 12.9698, lng: 77.7500 },
]

/* ── Reviews Data ── */
const reviewsData = [
    { id: 1, name: 'Arjun Mehta', avatar: '🧑‍💼', rating: 5, date: '2 weeks ago', text: 'Absolutely phenomenal turf! The LED floodlights are incredible for evening matches. Surface quality is top-notch — probably the best in Mumbai. Booking process was seamless too.' },
    { id: 2, name: 'Sneha Kapoor', avatar: '👩‍💻', rating: 4, date: '1 month ago', text: 'Great facility overall. The turf quality is excellent and parking is convenient. Only minor issue was the waiting area could be more comfortable. Will definitely come back!' },
    { id: 3, name: 'Rahul Sharma', avatar: '🧑‍🎓', rating: 5, date: '3 weeks ago', text: 'We hosted our corporate tournament here and the staff was incredibly professional. Everything from the locker rooms to the playing surface screams premium quality.' },
    { id: 4, name: 'Priya Singh', avatar: '👩‍🔬', rating: 4, date: '2 months ago', text: 'Perfect spot for weekend cricket with friends. The pricing is fair for the quality you get. The hydration station is a nice touch — saves us from carrying water bottles.' },
]

const ratingBreakdown = [
    { stars: 5, count: 78 },
    { stars: 4, count: 32 },
    { stars: 3, count: 10 },
    { stars: 2, count: 3 },
    { stars: 1, count: 1 },
]

/* ── Host Data ── */
const hostData = {
    name: 'Vikram Deshmukh',
    avatar: '👨‍💼',
    verified: true,
    superhost: true,
    responseTime: 'Under 1 hour',
    responseRate: '98%',
    hostingSince: 'March 2022',
    totalVenues: 3,
    bio: 'Passionate sports entrepreneur with 8+ years in facility management. Founded SportZone Arena to bring world-class turf experiences to Mumbai. Committed to maintaining the highest standards of playing surface quality and customer satisfaction.',
    phone: '+91 98765 43210',
    email: 'vikram@sportzone.in',
}

/* ── Section Label Component ── */
function SectionLabel({ children, accent = 'emerald' }) {
    return (
        <h2 className="text-[#16A34A] text-xs font-black uppercase tracking-[0.25em] bg-green-50 border border-green-200 px-4 py-1.5 rounded-full shadow-sm inline-flex items-center gap-2 mb-6">
            <span>⚽</span>
            <span>{children}</span>
        </h2>
    )
}

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]
const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Generate all dates for any given year and month in the calendar
const generateMonthDates = (year, month) => {
    const totalDays = new Date(year, month + 1, 0).getDate()
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const list = []
    for (let day = 1; day <= totalDays; day++) {
        const d = new Date(year, month, day)
        const dayOfWeek = d.getDay()
        const dayShort = dayNamesShort[dayOfWeek]
        const fullDayName = dayNamesFull[dayOfWeek]
        const monthShort = monthNames[month].slice(0, 3)
        const fullDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const isToday = fullDateString === todayStr
        const isPast = d < today

        list.push({
            id: `date-${fullDateString}`,
            fullDateString,
            dayShort: isToday ? 'Today' : dayShort,
            dateNum: day,
            monthShort,
            monthIndex: month,
            year,
            isToday,
            isPast,
            isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            formattedLabel: `${fullDayName.toUpperCase()}, ${day} ${monthShort.toUpperCase()} ${year}`
        })
    }
    return list
}

const generateSlotsForDate = (hourlyPrice = 1200, selectedDateObj = null, turfId = 16) => {
    const times = [
        '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
        '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00', '22:00'
    ]

    const dateNum = selectedDateObj?.dateNum || 19
    const dayShort = (selectedDateObj?.dayShort || 'Sun').toUpperCase()
    const fullDate = selectedDateObj?.fullDateString || ''
    const isWeekend = dayShort.includes('SAT') || dayShort.includes('SUN')
    const isPastDate = !!selectedDateObj?.isPast

    const now = new Date()
    const currentHour = now.getHours()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const isToday = selectedDateObj?.isToday || selectedDateObj?.dayShort === 'TODAY' || fullDate === todayStr

    return times.map((t, i) => {
        const slotHour = parseInt(t.split(':')[0], 10)
        const isPeakHour = slotHour >= 18 && slotHour <= 22
        const isEarlyMorning = slotHour < 8

        // Pricing: Peak hours = +25% to +28% (₹1,150/hr for ₹900/hr turf), early morning = -15%
        let factor = 1.0
        if (isPeakHour) factor = isWeekend ? 1.30 : 1.28
        else if (isEarlyMorning) factor = 0.85
        else if (isWeekend && slotHour >= 14) factor = 1.15

        const slotPrice = Math.round((hourlyPrice * factor) / 50) * 50

        // If the date itself has already passed
        if (isPastDate) {
            return {
                id: i,
                time: t,
                price: slotPrice,
                status: 'booked',
                isPassed: true
            }
        }

        // Real-time slot management: if TODAY and slot hour has elapsed
        const isSlotPassedToday = isToday && slotHour <= currentHour

        // Distinct, realistic schedule tailored for each day
        let status = 'available'

        if (dayShort === 'SUN' || dayShort.includes('SUNDAY')) {
            if ([0, 1, 2, 4, 7, 12, 14, 15, 16].includes(i)) status = 'booked'
        } else if (dayShort === 'MON' || dayShort.includes('MONDAY')) {
            if ([0, 1, 3, 4, 5, 7, 11, 15].includes(i)) status = 'booked'
            else if (i === 6) status = 'maintenance' // 12:00 PM
            else if (i === 2) status = 'staff_unavailable' // 8:00 AM
        } else if (dayShort === 'TUE' || dayShort.includes('TUESDAY')) {
            if ([2, 4, 8, 12, 15].includes(i)) status = 'booked'
            else if (i === 5) status = 'maintenance' // 11:00 AM
        } else if (dayShort === 'WED' || dayShort.includes('WEDNESDAY')) {
            if ([3, 7, 11, 14, 15].includes(i)) status = 'booked'
            else if (i === 1) status = 'staff_unavailable' // 7:00 AM
        } else if (dayShort === 'THU' || dayShort.includes('THURSDAY')) {
            if ([0, 2, 5, 8, 11, 15].includes(i)) status = 'booked'
            else if (i === 7) status = 'maintenance' // 1:00 PM
        } else if (dayShort === 'FRI' || dayShort.includes('FRIDAY')) {
            if ([1, 3, 5, 8, 10, 12, 13, 14, 16].includes(i)) status = 'booked'
        } else if (dayShort === 'SAT' || dayShort.includes('SATURDAY')) {
            if ([0, 1, 2, 4, 6, 8, 11, 13, 14, 15].includes(i)) status = 'booked'
            else if (i === 3) status = 'staff_unavailable' // 9:00 AM
        } else {
            const hash = (dateNum * 11 + i * 17 + (turfId || 16) * 5) % 100
            if (hash < 40) status = 'booked'
            else if (hash === 91) status = 'maintenance'
            else if (hash === 92) status = 'staff_unavailable'
        }

        // Lock slot if it has elapsed today
        if (isSlotPassedToday) {
            status = 'booked'
        }

        return {
            id: i,
            time: t,
            price: slotPrice,
            status,
            isPassed: isSlotPassedToday
        }
    })
}

export default function TurfDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth() || {}
    const [selectedSport, setSelectedSport] = useState('Cricket')
    const [selectedMediaId, setSelectedMediaId] = useState(0)
    const [duration, setDuration] = useState(1)
    const [isDeploying, setIsDeploying] = useState(false)
    const [bookingSuccessModal, setBookingSuccessModal] = useState(false)
    const [deploymentDetails, setDeploymentDetails] = useState(null)
    const [liveBranch, setLiveBranch] = useState(null)
    const toastContext = useToast()
    const addToast = toastContext?.addToast

    useEffect(() => {
        if (!id) return;
        getBranchById(id).then(res => {
            const b = res?.data || res?.branch || res;
            if (b && (b.branchName || b.name)) {
                setLiveBranch(b);
            }
        }).catch(err => {
            console.warn('Branch detail lookup note:', err);
        });
    }, [id]);

    const activeTurf = useMemo(() => {
        if (liveBranch) {
            let parsedSports = ['Cricket', 'Football'];
            try {
                if (Array.isArray(liveBranch.sports)) parsedSports = liveBranch.sports;
                else if (typeof liveBranch.sports === 'string' && liveBranch.sports.trim().startsWith('[')) parsedSports = JSON.parse(liveBranch.sports);
            } catch (_) {}

            let parsedAmenities = ['Floodlights', 'Parking', 'Washroom'];
            try {
                if (Array.isArray(liveBranch.amenities)) parsedAmenities = liveBranch.amenities;
                else if (typeof liveBranch.amenities === 'string' && liveBranch.amenities.trim().startsWith('[')) parsedAmenities = JSON.parse(liveBranch.amenities);
            } catch (_) {}

            let firstImg = liveBranch.logo;
            if (!firstImg && Array.isArray(liveBranch.images) && liveBranch.images.length > 0) firstImg = liveBranch.images[0];

            return {
                id: liveBranch.id || liveBranch._id || id,
                _id: liveBranch.id || liveBranch._id || id,
                name: liveBranch.branchName || liveBranch.name,
                location: liveBranch.fullAddress || `${liveBranch.city || 'Indore'}, ${liveBranch.country || 'India'}`,
                city: liveBranch.city || 'Indore',
                rating: Number(liveBranch.rating || 4.8),
                price: Number(liveBranch.pricePerHour ?? liveBranch.price ?? liveBranch.price_per_hour ?? 1000),
                dimensions: liveBranch.turfSize || liveBranch.dimensions || '5,000 Sq.Ft',
                surfaceType: liveBranch.surfaceType || liveBranch.surface_type || 'TurfPro Synthetic Arena',
                image: firstImg || '/images/turf1.png',
                sports: parsedSports,
                amenities: parsedAmenities,
                discountOffer: liveBranch.discountOffer || liveBranch.discount_offer || '20% OFF FIRST MATCH',
                couponCode: liveBranch.couponCode || liveBranch.coupon_code || 'CRICKET20',
                lat: Number(liveBranch.latitude || 22.7244),
                lng: Number(liveBranch.longitude || 75.8839)
            };
        }
        const found = allTurfsList.find(t => String(t.id) === String(id));
        return found || allTurfsList[0];
    }, [liveBranch, id]);

    const videoRef = useRef(null)

    const defaultFallbackImage = activeTurf.image || '/images/turf1.png';

    const initialMedia = [
        { type: 'image', url: defaultFallbackImage, thumbnail: defaultFallbackImage },
        ...defaultTurfData.media.map(m => ({
            ...m,
            thumbnail: m.thumbnail || m.url || defaultFallbackImage
        }))
    ];

    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [isCorpModalOpen, setIsCorpModalOpen] = useState(false);
    const [customMediaList, setCustomMediaList] = useState(initialMedia);

    useEffect(() => {
        setCustomMediaList([
            { type: 'image', url: activeTurf.image || defaultFallbackImage, thumbnail: activeTurf.image || defaultFallbackImage },
            ...defaultTurfData.media
        ]);
    }, [activeTurf.image]);

    const turfData = {
        ...defaultTurfData,
        id: activeTurf.id,
        name: activeTurf.name,
        location: activeTurf.location,
        rating: activeTurf.rating,
        sports: (activeTurf.sports || ['Cricket']).map(s => ({
            name: s,
            price: activeTurf.price,
            peakPrice: activeTurf.price + 400
        })),
        amenities: (activeTurf.amenities && activeTurf.amenities.length > 0) ? activeTurf.amenities : defaultTurfData.amenities,
        media: customMediaList.length > 0 ? customMediaList : initialMedia,
        coordinates: { lat: activeTurf.lat, lng: activeTurf.lng }
    };

    const activeMedia = turfData.media[selectedMediaId] || turfData.media[0] || initialMedia[0];
    const totalReviews = ratingBreakdown.reduce((a, b) => a + b.count, 0)

    const saveMediaState = async (updatedMedia) => {
        setCustomMediaList(updatedMedia);
        try {
            localStorage.setItem(`turf_media_${activeTurf.id}`, JSON.stringify(updatedMedia));
        } catch (e) { }
        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
            await fetch(`${apiBase}/turfs/${activeTurf.id}/media`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ media: updatedMedia })
            });
        } catch (e) {
            console.error('Failed to sync media with backend:', e);
        }
    };

    const handleSaveMedia = async (updatedMedia) => {
        setSelectedMediaId(0);
        await saveMediaState(updatedMedia);
        if (addToast) {
            addToast(`Updated turf gallery with ${updatedMedia.length} media items!`, 'success');
        }
    };

    const handleDeleteActiveMedia = async () => {
        if (turfData.media.length <= 1) {
            if (addToast) addToast('Cannot delete the only media item remaining!', 'error');
            return;
        }

        const itemToDelete = turfData.media[selectedMediaId];
        if (window.confirm(`Are you sure you want to delete this ${itemToDelete?.type === 'video' ? 'video' : 'photo'}?`)) {
            if (itemToDelete?.url && itemToDelete.url.includes('/uploads/')) {
                const filename = itemToDelete.url.split('/uploads/').pop();
                try {
                    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
                    await fetch(`${apiBase}/upload/${filename}`, {
                        method: 'DELETE'
                    });
                } catch (e) {
                    console.error('Error deleting file:', e);
                }
            }

            const updatedMedia = turfData.media.filter((_, idx) => idx !== selectedMediaId);
            setSelectedMediaId(0);
            await saveMediaState(updatedMedia);
            if (addToast) {
                addToast(`Deleted ${itemToDelete?.type === 'video' ? 'video' : 'photo'} successfully!`, 'info');
            }
        }
    };

    const [bookingStep, setBookingStep] = useState(1);
    const dateStripRef = useRef(null);
    const [viewYear, setViewYear] = useState(2026);
    const [viewMonth, setViewMonth] = useState(7); // 7 = August (0-indexed)
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const monthDropdownRef = useRef(null);
    const yearDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (monthDropdownRef.current && !monthDropdownRef.current.contains(e.target)) {
                setIsMonthDropdownOpen(false);
            }
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) {
                setIsYearDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Current month dates (all dates 1 to 28/30/31 for active month)
    const currentMonthDates = useMemo(() => {
        return generateMonthDates(viewYear, viewMonth);
    }, [viewYear, viewMonth]);

    const [selectedDateObj, setSelectedDateObj] = useState(() => {
        const nowObj = new Date();
        const curDates = generateMonthDates(nowObj.getFullYear(), nowObj.getMonth());
        return curDates.find(d => d.isToday) || curDates.find(d => !d.isPast) || curDates[0];
    });
    const [selectedDate, setSelectedDate] = useState(() => selectedDateObj?.fullDateString || '');
    const [selectedSlot, setSelectedSlot] = useState(12); // Default to 6:00 PM

    // Generate dynamic date-specific slots whenever activeTurf or selectedDateObj changes
    const slots = useMemo(() => {
        return generateSlotsForDate(activeTurf.price, selectedDateObj, activeTurf.id);
    }, [activeTurf.price, selectedDateObj, activeTurf.id]);

    const handlePrevMonth = () => {
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = now.getMonth();

        // Prevent navigating into past months
        if (viewYear === curYear && viewMonth <= curMonth) {
            if (addToast) addToast('Cannot book slots for past months.', 'info');
            return;
        }
        if (viewMonth === 0) {
            if (viewYear <= curYear) return;
            setViewMonth(11);
            setViewYear(prev => prev - 1);
        } else {
            setViewMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(prev => prev + 1);
        } else {
            setViewMonth(prev => prev + 1);
        }
    };

    const handleSelectMonth = (mIndex) => {
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = now.getMonth();
        const m = Number(mIndex);
        if (viewYear === curYear && m < curMonth) {
            if (addToast) addToast('Cannot select a past month.', 'info');
            return;
        }
        setViewMonth(m);
    };

    const handleSelectYear = (y) => {
        const now = new Date();
        const yr = Number(y);
        if (yr < now.getFullYear()) {
            if (addToast) addToast('Cannot select a past year.', 'info');
            return;
        }
        setViewYear(yr);
    };

    const scrollDateStrip = (direction) => {
        if (dateStripRef.current) {
            const scrollAmount = direction === 'left' ? -260 : 260;
            dateStripRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handleDateSelect = (d) => {
        if (d?.isPast) {
            if (addToast) addToast('Cannot select a past date.', 'warning');
            return;
        }
        setSelectedDateObj(d);
        setSelectedDate(d.fullDateString);
        if (d.year !== viewYear || d.monthIndex !== viewMonth) {
            setViewYear(d.year);
            setViewMonth(d.monthIndex);
        }
        setIsCalendarModalOpen(false);

        // Get slots on the selected date to maintain a valid active selection
        const nextSlots = generateSlotsForDate(activeTurf.price, d, activeTurf.id);
        const isCurrentAvailable = selectedSlot !== null && nextSlots.some(s => s.id === selectedSlot && s.status === 'available');

        if (!isCurrentAvailable) {
            // Find 6:00 PM (18:00) or 7:00 PM (19:00) or first available slot
            const prime = nextSlots.find(s => s.time === '18:00' && s.status === 'available')
                || nextSlots.find(s => s.time === '19:00' && s.status === 'available')
                || nextSlots.find(s => s.time === '20:00' && s.status === 'available')
                || nextSlots.find(s => s.status === 'available');
            if (prime) {
                setSelectedSlot(prime.id);
            }
        }
    };

    const handleJumpToToday = () => {
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = now.getMonth();
        const curDay = now.getDate();
        const dates = generateMonthDates(curYear, curMonth);
        const todayObj = dates.find(d => d.dateNum === curDay) || dates[0];
        setViewYear(curYear);
        setViewMonth(curMonth);
        handleDateSelect(todayObj);
    };

    const [paymentMode, setPaymentMode] = useState('dare');
    const [expandedAccordionMode, setExpandedAccordionMode] = useState('dare');
    const [customSplitMyShare, setCustomSplitMyShare] = useState(1200);
    const [captainName, setCaptainName] = useState('Rahul Sharma');
    const [captainPhone, setCaptainPhone] = useState('+91 98765 43210');
    const [teamAName, setTeamAName] = useState('Andheri Strikers');
    const [teamBName, setTeamBName] = useState('Dadar Destroyers');
    const [teamBPhone, setTeamBPhone] = useState('+91 98765 43222');
    const [hasOpponentTeam, setHasOpponentTeam] = useState(true);
    const [isOpenChallenge, setIsOpenChallenge] = useState(false);
    const [bookingId, setBookingId] = useState('BMT-10AUG-78432');
    const [teammates, setTeammates] = useState([
        { id: 1, name: 'Rahul Sharma (Captain)', phone: '+91 98765 43210', amount: 900, status: 'Paid', isCaptain: true, tag: 'You' },
        { id: 2, name: 'Vikram Singh', phone: '+91 98765 43211', amount: 0, status: 'Pending', isCaptain: false, tag: 'VS' },
    ]);
    const [newTeammateName, setNewTeammateName] = useState('');
    const [showAddTeammateInput, setShowAddTeammateInput] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
    const [perPlayerCount, setPerPlayerCount] = useState(6);

    const [hasVerifiedUmpire, setHasVerifiedUmpire] = useState(false);
    const handleSelectSlot = (slotId) => {
        setSelectedSlot(slotId);
    };

    const currentSlot = slots.find(s => s.id === selectedSlot) || slots.find(s => s.status === 'available') || slots[0];

    // Check if this Turf offers Verified Umpire Service (Configured by Turf Owner)
    const isTurfUmpireAvailable = (() => {
        const savedSetting = localStorage.getItem(`turf_umpire_enabled_${activeTurf?.id || id}`)
        if (savedSetting !== null) return savedSetting === 'true'
        const globalSetting = localStorage.getItem('turf_umpire_enabled')
        if (globalSetting !== null) return globalSetting === 'true'
        return activeTurf?.hasUmpireService !== false
    })()

    const selectedSlotIndex = slots.findIndex(s => s.id === (currentSlot?.id ?? selectedSlot))
    const selectedConsecutiveSlots = selectedSlotIndex !== -1
        ? slots.slice(selectedSlotIndex, Math.min(slots.length, selectedSlotIndex + duration))
        : []
    const baseSlotPrice = currentSlot?.price || activeTurf.price || 1200
    const grossSlotRent = selectedConsecutiveSlots.reduce((sum, slot) => sum + (slot.price || baseSlotPrice), 0)
    const umpireFee = (hasVerifiedUmpire && isTurfUmpireAvailable) ? 300 : 0;
    const totalRent = (grossSlotRent || (baseSlotPrice * duration)) + umpireFee;

    useEffect(() => {
        setCustomSplitMyShare(Math.round(totalRent * 0.6))
    }, [totalRent])

    const getPaymentModeTitle = (mode) => {
        switch (mode) {
            case 'full': return 'Full Pay'
            case 'split-50': return 'Split 50-50'
            case 'custom': return 'Custom Split'
            case 'dare': return 'Dare to Play'
            case 'per-player': return 'Per Player Split'
            default: return 'Full Pay'
        }
    }

    const dareDepositAmount = Math.round(totalRent * 0.3);
    const myShare = paymentMode === 'full'
        ? totalRent
        : paymentMode === 'split-50'
            ? totalRent / 2
            : paymentMode === 'custom'
                ? customSplitMyShare
                : paymentMode === 'dare'
                    ? dareDepositAmount
                    : Math.round(totalRent / perPlayerCount);

    const opponentShare = paymentMode === 'full'
        ? 0
        : paymentMode === 'dare'
            ? dareDepositAmount
            : Math.max(0, totalRent - myShare);

    const handleAddTeammate = () => {
        if (!newTeammateName.trim()) return;
        const newMember = {
            id: Date.now(),
            name: newTeammateName.trim(),
            phone: '+91 98765 ' + Math.floor(10000 + Math.random() * 90000),
            amount: 0,
            status: 'Pending',
            isCaptain: false,
            tag: 'TM'
        };
        setTeammates(prev => [...prev, newMember]);
        setNewTeammateName('');
        setShowAddTeammateInput(false);
        if (addToast) addToast(`Added ${newMember.name} to roster!`, 'info');
    };

    const handleConfirmAndDeploy = async () => {
        setIsDeploying(true);
        const generatedBookingId = `BMT-${selectedDateObj.dateNum}${selectedDateObj.monthShort.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
        setBookingId(generatedBookingId);

        try {
            // 1. Create Match & 5-minute Slot Hold in MySQL
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
            const createRes = await fetch(`${apiBase}/match-payments/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    turfId: `turf_${turfData.id}`,
                    slotId: `slot_${turfData.id}_${selectedDateObj.fullDateString.replace(/-/g, '')}`,
                    sportId: 'Turf Match',
                    captainName,
                    captainPhone,
                    teamAName,
                    teamBName: hasOpponentTeam ? teamBName : 'Open Challenge',
                    paymentMode: paymentMode.toUpperCase().replace(/-/g, '_'),
                    durationHours: duration,
                    slotDate: selectedDateObj.fullDateString,
                    startTime: currentSlot?.time || '18:00:00',
                    endTime: `${(parseInt(currentSlot?.time || '18') || 18) + duration}:00:00`,
                    captainShareInput: myShare,
                    hasOpponentTeam
                })
            });
            const createData = await createRes.json();

            if (createData.success && createData.data?.matchId) {
                // 2. Verify Payment & Generate Token
                const verifyRes = await fetch(`${apiBase}/match-payments/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        matchId: createData.data.matchId,
                        holdId: createData.data.holdId,
                        gatewayOrderId: `order_${Date.now()}`,
                        gatewayPaymentId: `pay_${Date.now()}`,
                        idempotencyKey: `idemp_${Date.now()}`
                    })
                });
                const verifyData = await verifyRes.json();
                if (verifyData.data?.matchId) {
                    setBookingId(verifyData.data.matchId);
                }
            }

            if (user) {
                // Logged-in Customer Booking -> Save in customer_bookings for this specific logged-in user
                const existing = JSON.parse(localStorage.getItem('customer_bookings') || '[]');
                const currentUserId = user.id || (user.email ? `usr_${user.email}` : `usr_cust_${Date.now()}`);
                const currentUserEmail = user.email;
                const currentCustomerName = user.name || captainName || 'Customer';
                const currentCustomerPhone = user.phone || user.mobile || captainPhone || '';

                const newEntry = {
                    id: generatedBookingId,
                    userId: currentUserId,
                    userEmail: currentUserEmail,
                    customerName: currentCustomerName,
                    customerPhone: currentCustomerPhone,
                    turfId: `turf_${turfData.id}`,
                    venueId: turfData.id,
                    venue: `${turfData.name}, ${turfData.location}`,
                    sport: selectedSport || 'Turf Match',
                    date: selectedDateObj.fullDateString,
                    time: currentSlot?.time || '6:00 PM',
                    amount: `₹${myShare.toLocaleString('en-IN')}`,
                    status: 'Confirmed',
                    isGuest: false,
                    createdAt: new Date().toISOString()
                };
                localStorage.setItem('customer_bookings', JSON.stringify([newEntry, ...existing]));
            } else {
                // Unauthenticated Guest Booking -> Save in guest_bookings ONLY (Never attach to customer_bookings or customer@gmail.com)
                const existingGuest = JSON.parse(localStorage.getItem('guest_bookings') || '[]');
                const guestEntry = {
                    id: generatedBookingId,
                    guestId: `guest_${Date.now()}`,
                    customerName: captainName || 'Guest User',
                    customerPhone: captainPhone || '',
                    userEmail: 'guest@sportmatrix.com',
                    turfId: `turf_${turfData.id}`,
                    venueId: turfData.id,
                    venue: `${turfData.name}, ${turfData.location}`,
                    sport: selectedSport || 'Turf Match',
                    date: selectedDateObj.fullDateString,
                    time: currentSlot?.time || '6:00 PM',
                    amount: `₹${myShare.toLocaleString('en-IN')}`,
                    status: 'Confirmed',
                    isGuest: true,
                    createdAt: new Date().toISOString()
                };
                localStorage.setItem('guest_bookings', JSON.stringify([guestEntry, ...existingGuest]));
            }
        } catch (e) {
            console.error('Match payment engine API error:', e);
        }

        setIsDeploying(false);
        setBookingStep(4);
        if (addToast) addToast('Match booked successfully!', 'success');
    };

    const turfNameLower = (turfData.name || '').toLowerCase()
    let promo = null
    if (turfNameLower.includes('indore sports arena') || turfNameLower.includes('indore sports complex')) {
        promo = { icon: '🎁', text: 'Today 9:00 AM - 10:00 AM' }
    } else if (turfNameLower.includes('royal cricket ground')) {
        promo = { icon: '🏷️', text: 'Early Bird Offer • ₹200 OFF' }
    } else if (turfNameLower.includes('green arena') || turfNameLower.includes('sportzone arena')) {
        promo = { icon: '⚽', text: 'Peak Hour Offer • 25% OFF' }
    } else if (turfNameLower.includes('champion cricket') || turfNameLower.includes('prokick stadium')) {
        promo = { icon: '🏏', text: 'Weekend Special • ₹300 OFF' }
    }

    return (
        <div className="min-h-screen bg-white text-[#111827] pt-24 pb-16 relative">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[400px] bg-gradient-to-b from-emerald-50/50 via-white to-transparent pointer-events-none -z-10" />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
                <button
                    onClick={() => navigate('/turfs')}
                    className="inline-flex items-center gap-2 text-xs font-black tracking-wider uppercase text-[#6B7280] hover:text-[#16A34A] transition-colors mb-6 group bg-white border border-[#E5E7EB] hover:border-[#16A34A]/50 px-4 py-2 rounded-full shadow-sm cursor-pointer"
                >
                    <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Premium Venues</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
                    {/* Left Side: Sticky Media Gallery */}
                    <div className="lg:col-span-6 xl:col-span-6">
                        <TurfHeroGallery
                            activeMedia={activeMedia}
                            turfData={turfData}
                            selectedMediaId={selectedMediaId}
                            setSelectedMediaId={setSelectedMediaId}
                            defaultFallbackImage={defaultFallbackImage}
                            promo={promo}
                        />
                    </div>

                    {/* Right Side: Information & Booking */}
                    <div className="lg:col-span-6 xl:col-span-6 pb-20">
                        {/* Header Info */}
                        <div className="mb-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] italic tracking-tighter uppercase mb-2">{turfData.name}</h1>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${turfData.coordinates?.lat || 19.1136},${turfData.coordinates?.lng || 72.8697}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-[#4B5563] hover:text-[#16A34A] font-semibold group transition-colors cursor-pointer"
                                        title="Click to get directions on Google Maps"
                                    >
                                        <HiLocationMarker className="text-[#16A34A] shrink-0 w-4 h-4 group-hover:scale-125 transition-transform" />
                                        <span className="underline underline-offset-4 decoration-[#16A34A]/40 group-hover:decoration-[#16A34A]">{turfData.location}</span>
                                        <span className="text-[10px] font-bold tracking-wider uppercase bg-green-50 border border-green-200 text-[#16A34A] px-2.5 py-0.5 rounded-full flex items-center gap-1 group-hover:bg-[#C8FF2E] group-hover:text-[#111827] group-hover:border-[#B5F000] transition-all">
                                            📍 Get Directions ↗
                                        </span>
                                    </a>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8FF2E] border border-[#B5F000] rounded-xl shadow-xs">
                                        <HiStar className="w-4 h-4 text-[#111827]" />
                                        <span className="text-sm font-black text-[#111827]">{turfData.rating}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-[#6B7280] tracking-widest uppercase mt-2">{turfData.reviews} Reviews</p>
                                </div>
                            </div>

                            <div className="inline-block px-3 py-1 bg-slate-50 border border-[#E5E7EB] rounded-full mb-6">
                                <span className="text-[10px] font-bold text-[#6B7280] tracking-widest uppercase">Hours: <span className="text-[#111827] font-black">{turfData.timing}</span></span>
                            </div>

                            <p className="text-[#4B5563] text-sm leading-relaxed mb-8 font-medium">{turfData.description}</p>
                        </div>

                        <div className="h-px w-full bg-[#E5E7EB] mb-8" />

                        {/* Sports & Pricing */}
                        <div className="mb-10">
                            <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-[#16A34A] mb-4 flex items-center gap-2">
                                <span>💰</span> DISCIPLINE PRICING
                            </h2>
                            <div className="overflow-hidden border border-[#E5E7EB] rounded-[16px] bg-white shadow-xs">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#F7F9FC] border-b border-[#E5E7EB]">
                                            <th className="text-left px-5 py-3.5 text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Sport</th>
                                            <th className="text-left px-5 py-3.5 text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Standard</th>
                                            <th className="text-left px-5 py-3.5 text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Peak Hour</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB]">
                                        {turfData.sports.map(s => (
                                            <tr key={s.name} className="hover:bg-green-50/40 transition-colors">
                                                <td className="px-5 py-4 font-black text-[#111827] text-xs tracking-wider uppercase">{s.name}</td>
                                                <td className="px-5 py-4 text-[#16A34A] font-black tabular-nums">₹{s.price}<span className="text-[10px] text-[#6B7280] font-semibold ml-1">/hr</span></td>
                                                <td className="px-5 py-4 text-amber-600 font-black tabular-nums bg-amber-50/50">₹{s.peakPrice}<span className="text-[10px] text-amber-700/60 font-semibold ml-1">/hr</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Corporate & Bulk Booking Quick Option Card */}
                        <div className="bg-gradient-to-r from-[#1E1B4B] via-[#0F172A] to-[#1E293B] text-white rounded-[22px] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-purple-500/30">
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-2xl flex items-center justify-center shrink-0">
                                    🏢
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-sm uppercase tracking-wide text-[#C8FF2E]">
                                            Corporate Outing or Tournament Booking?
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-200 font-bold text-[10px] border border-purple-400/30">
                                            GST Invoices
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 mt-0.5">
                                        Request custom quote for <strong>{turfData.name} ({turfData.location})</strong> with dedicated umpires, bulk player rates & PO credit terms.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCorpModalOpen(true)}
                                className="w-full sm:w-auto px-5 py-2.5 bg-[#C8FF2E] hover:bg-[#b5f000] text-[#111827] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shrink-0 border border-[#b5f000]"
                            >
                                Get Corporate Quote →
                            </button>
                        </div>

                        {/* Booking Sector — Clean 4-Step Flow Starting Directly on Date & Time */}
                        <div className="relative">
                            <div className="relative bg-white border border-[#E5E7EB] rounded-[20px] p-6 sm:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.08)] space-y-6">

                                {/* Top 4-Step Tab Navigation */}
                                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar border-b border-[#E2E8F0] mb-6">
                                    {[
                                        { num: 1, label: '1. Date & Time' },
                                        { num: 2, label: '2. Payment Mode' },
                                        { num: 3, label: '3. Teams' },
                                        { num: 4, label: '4. Confirm' },
                                    ].map(st => {
                                        const isActive = bookingStep === st.num
                                        const isPast = bookingStep > st.num
                                        const isFuture = st.num > bookingStep
                                        return (
                                            <button
                                                key={st.num}
                                                type="button"
                                                disabled={isFuture}
                                                onClick={() => {
                                                    if (isPast) setBookingStep(st.num)
                                                }}
                                                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-2 shadow-xs ${isActive
                                                        ? 'bg-[#111827] text-white border border-[#111827] shadow-md cursor-default'
                                                        : isPast
                                                            ? 'bg-white text-[#10B981] border border-emerald-300 hover:bg-emerald-50 cursor-pointer'
                                                            : 'bg-slate-100 text-slate-400 border border-[#E2E8F0] cursor-not-allowed opacity-50 select-none'
                                                    }`}
                                            >
                                                {isPast && <span>✓</span>}
                                                <span>{st.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* STEP 1: DATE & TIME (Direct Turf Booking) */}
                                {bookingStep === 1 && (
                                    <div className="space-y-6 animate-in fade-in">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111827] mb-1">
                                                    Pick date & time slot
                                                </h1>
                                                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                                                    <span>{turfData.name} — {turfData.location} · ₹{(activeTurf.price || 1500).toLocaleString('en-IN')}/hr</span>
                                                    <button
                                                        onClick={() => setIsVenueModalOpen(true)}
                                                        className="text-[11px] font-extrabold text-[#065F46] bg-[#ECFDF5] border border-emerald-300 px-2.5 py-0.5 rounded-md hover:bg-emerald-100 cursor-pointer transition-colors flex items-center gap-1"
                                                    >
                                                        <span>Switch Turf</span>
                                                        <span>▾</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Duration Selector */}
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                                                <span className="text-[11px] sm:text-xs font-black tracking-wider text-slate-500 uppercase">DURATION:</span>
                                                <div className="flex items-center bg-[#F1F5F9] border border-slate-200 rounded-full p-1 shadow-xs">
                                                    {[1, 2, 3].map(hr => (
                                                        <button
                                                            key={hr}
                                                            onClick={() => {
                                                                setDuration(hr)
                                                                setSelectedSlot(null)
                                                            }}
                                                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${duration === hr
                                                                    ? 'bg-[#111827] text-white shadow-xs'
                                                                    : 'text-slate-500 hover:text-[#111827]'
                                                                }`}
                                                        >
                                                            {hr} {hr === 1 ? 'HR' : 'HRS'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Horizontal Date Selector with Month Switcher & Full Year Calendar */}
                                        <div className="bg-white border border-[#E5E7EB] rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xs space-y-3 relative">
                                            {/* Month Header & Calendar Actions */}
                                            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">SELECT DATE</span>

                                                    {/* Custom UI Themed Month & Year Stepper & Dropdowns */}
                                                    <div className="flex items-center bg-[#F8FAFC] border border-slate-200/90 rounded-full p-1 shadow-xs gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={handlePrevMonth}
                                                            title="Previous Month"
                                                            className="w-6 h-6 rounded-full hover:bg-white text-slate-700 hover:text-[#10B981] flex items-center justify-center transition-all cursor-pointer font-bold hover:shadow-xs"
                                                        >
                                                            <HiChevronLeft className="w-3.5 h-3.5" />
                                                        </button>

                                                        {/* Custom Month Dropdown */}
                                                        <div className="relative" ref={monthDropdownRef}>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIsMonthDropdownOpen(!isMonthDropdownOpen);
                                                                    setIsYearDropdownOpen(false);
                                                                }}
                                                                className={`px-2.5 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                                                                    isMonthDropdownOpen 
                                                                        ? 'bg-[#111827] text-white shadow-xs' 
                                                                        : 'bg-white hover:bg-emerald-50 text-[#111827] border border-slate-200 hover:border-emerald-300'
                                                                }`}
                                                            >
                                                                <span>{monthNames[viewMonth]}</span>
                                                                <HiChevronDown className={`w-3 h-3 transition-transform ${isMonthDropdownOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400'}`} />
                                                            </button>

                                                            {/* Custom Themed Month Menu Popup */}
                                                            {isMonthDropdownOpen && (
                                                                <div className="absolute top-full mt-2 left-0 z-50 bg-[#111827] border-2 border-emerald-500 text-white rounded-2xl shadow-2xl p-2 w-64 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                                                                    <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider px-2 py-1 border-b border-slate-700 mb-1 flex items-center justify-between">
                                                                        <span>Select Month</span>
                                                                        <span className="text-slate-400 font-mono">{viewYear}</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-3 gap-1.5 p-1">
                                                                        {monthNames.map((name, idx) => {
                                                                            const isCurrent = viewMonth === idx;
                                                                            return (
                                                                                <button
                                                                                    key={name}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        handleSelectMonth(idx);
                                                                                        setIsMonthDropdownOpen(false);
                                                                                    }}
                                                                                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                                                                                        isCurrent
                                                                                            ? 'bg-[#10B981] text-white font-black shadow-md shadow-emerald-500/30'
                                                                                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                                                                                    }`}
                                                                                >
                                                                                    {name.slice(0, 3)}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Custom Year Dropdown */}
                                                        <div className="relative" ref={yearDropdownRef}>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIsYearDropdownOpen(!isYearDropdownOpen);
                                                                    setIsMonthDropdownOpen(false);
                                                                }}
                                                                className={`px-2 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                                                                    isYearDropdownOpen 
                                                                        ? 'bg-[#111827] text-white shadow-xs' 
                                                                        : 'bg-white hover:bg-emerald-50 text-[#111827] border border-slate-200 hover:border-emerald-300'
                                                                }`}
                                                            >
                                                                <span>{viewYear}</span>
                                                                <HiChevronDown className={`w-3 h-3 transition-transform ${isYearDropdownOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400'}`} />
                                                            </button>

                                                            {/* Custom Themed Year Menu Popup */}
                                                            {isYearDropdownOpen && (
                                                                <div className="absolute top-full mt-2 left-0 z-50 bg-[#111827] border-2 border-emerald-500 text-white rounded-2xl shadow-2xl p-2 w-32 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                                                                    <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider px-2 py-1 border-b border-slate-700 mb-1">
                                                                        Year
                                                                    </div>
                                                                    <div className="flex flex-col gap-1 p-1">
                                                                        {[2025, 2026, 2027, 2028].map(yr => {
                                                                            const isCurrent = viewYear === yr;
                                                                            return (
                                                                                <button
                                                                                    key={yr}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        handleSelectYear(yr);
                                                                                        setIsYearDropdownOpen(false);
                                                                                    }}
                                                                                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                                                                                        isCurrent
                                                                                            ? 'bg-[#10B981] text-white font-black shadow-md'
                                                                                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                                                                                    }`}
                                                                                >
                                                                                    <span>{yr}</span>
                                                                                    {isCurrent && <HiCheck className="w-3.5 h-3.5 text-white" />}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={handleNextMonth}
                                                            title="Next Month"
                                                            className="w-6 h-6 rounded-full hover:bg-white text-slate-700 hover:text-[#10B981] flex items-center justify-center transition-all cursor-pointer font-bold hover:shadow-xs"
                                                        >
                                                            <HiChevronRight className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleJumpToToday}
                                                        className="text-[11px] font-black text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-xs hover:border-slate-300"
                                                    >
                                                        Today
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsCalendarModalOpen(!isCalendarModalOpen)}
                                                        className="text-[11px] font-black text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                                                    >
                                                        <HiCalendar className="w-3.5 h-3.5 text-emerald-700" />
                                                        <span>{isCalendarModalOpen ? 'Close Calendar' : '📅 Full Calendar'}</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Full Calendar Dropdown Modal if open */}
                                            {isCalendarModalOpen && (
                                                <div className="bg-white border-2 border-emerald-500/80 rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] animate-in zoom-in-95 duration-150 z-30 ring-4 ring-emerald-500/10">
                                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-base sm:text-lg font-black text-[#111827] uppercase tracking-tight flex items-center gap-1.5">
                                                                <span className="text-[#16A34A]">{monthNames[viewMonth]}</span> 
                                                                <span>{viewYear}</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={handlePrevMonth}
                                                                title="Previous Month"
                                                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#C8FF2E] text-slate-700 hover:text-black font-black flex items-center justify-center text-sm transition-all cursor-pointer shadow-2xs border border-slate-200"
                                                            >
                                                                ‹
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleNextMonth}
                                                                title="Next Month"
                                                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#C8FF2E] text-slate-700 hover:text-black font-black flex items-center justify-center text-sm transition-all cursor-pointer shadow-2xs border border-slate-200"
                                                            >
                                                                ›
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsCalendarModalOpen(false)}
                                                                title="Close Calendar"
                                                                className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center text-xs ml-1 cursor-pointer transition-all border border-rose-200 font-bold"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* 7 Days Grid Header */}
                                                    <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10.5px] sm:text-xs font-black text-slate-400 py-2.5 border-b border-slate-100 tracking-wider">
                                                        <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
                                                    </div>

                                                    {/* Day Cells Matrix */}
                                                    <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-2.5">
                                                        {/* Empty cells before month start */}
                                                        {Array.from({ length: new Date(viewYear, viewMonth, 1).getDay() }).map((_, i) => (
                                                            <div key={`empty-${i}`} className="h-9 sm:h-10" />
                                                        ))}
                                                        {currentMonthDates.map((d) => {
                                                            const isSelected = selectedDateObj?.fullDateString === d.fullDateString
                                                            const isPast = d.isPast

                                                            return (
                                                                <button
                                                                    key={d.id}
                                                                    type="button"
                                                                    disabled={isPast}
                                                                    onClick={() => !isPast && handleDateSelect(d)}
                                                                    title={isPast ? `${d.formattedLabel} (Unavailable)` : d.formattedLabel}
                                                                    className={`h-9 sm:h-10 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center ${
                                                                        isPast
                                                                            ? 'opacity-30 text-slate-400 cursor-not-allowed select-none bg-slate-50 border border-slate-100'
                                                                            : isSelected
                                                                                ? 'bg-[#111827] text-[#C8FF2E] font-black shadow-md border-2 border-[#111827] scale-105 cursor-pointer ring-2 ring-emerald-500/30'
                                                                                : d.isToday
                                                                                    ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-400 hover:border-emerald-600 cursor-pointer shadow-xs'
                                                                                    : 'bg-white border border-slate-200/80 text-[#111827] hover:border-[#10B981] hover:bg-emerald-50 hover:text-[#16A34A] cursor-pointer shadow-2xs'
                                                                    }`}
                                                                >
                                                                    <span>{d.dateNum}</span>
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Horizontal Scrollable Date Strip with Navigation Arrows */}
                                            <div className="relative group/strip">
                                                <button
                                                    type="button"
                                                    onClick={() => scrollDateStrip('left')}
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 shadow-md border border-slate-200 text-slate-700 hover:bg-white flex items-center justify-center transition-all opacity-0 group-hover/strip:opacity-100 cursor-pointer -ml-2"
                                                >
                                                    <HiChevronLeft className="w-4 h-4" />
                                                </button>

                                                <div 
                                                    ref={dateStripRef}
                                                    className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 pt-1 scroll-smooth no-scrollbar"
                                                    style={{ WebkitOverflowScrolling: 'touch' }}
                                                >
                                                    {currentMonthDates.map(d => {
                                                        const isSel = selectedDateObj?.fullDateString === d.fullDateString
                                                        const isPast = d.isPast

                                                        return (
                                                            <button
                                                                key={d.id}
                                                                type="button"
                                                                disabled={isPast}
                                                                onClick={() => !isPast && handleDateSelect(d)}
                                                                title={isPast ? `${d.formattedLabel} (Unavailable)` : d.formattedLabel}
                                                                className={`flex-shrink-0 w-[66px] sm:w-20 py-2.5 sm:py-3 px-1 sm:px-2 rounded-[18px] sm:rounded-[20px] flex flex-col items-center justify-center transition-all duration-200 ${
                                                                    isPast
                                                                        ? 'bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed opacity-40 select-none shadow-none'
                                                                        : isSel
                                                                            ? 'bg-[#111827] text-white border-2 border-[#10B981] shadow-lg scale-[1.03] cursor-pointer'
                                                                            : d.isToday
                                                                                ? 'bg-emerald-50/80 border-2 border-emerald-300 text-emerald-800 hover:border-emerald-500 shadow-xs cursor-pointer'
                                                                                : 'bg-white border border-[#E2E8F0] text-slate-500 hover:border-slate-400 shadow-xs cursor-pointer'
                                                                }`}
                                                            >
                                                                <span className={`text-[10px] sm:text-xs font-bold mb-0.5 ${
                                                                    isPast ? 'text-slate-400' : isSel ? 'text-slate-300' : d.isToday ? 'text-emerald-700 font-black' : 'text-slate-500'
                                                                }`}>
                                                                    {d.dayShort}
                                                                </span>
                                                                <span className={`text-xl sm:text-3xl font-black my-0.5 leading-none ${
                                                                    isPast ? 'text-slate-400' : isSel ? 'text-white' : 'text-[#111827]'
                                                                }`}>
                                                                    {d.dateNum}
                                                                </span>
                                                                <span className={`text-[9px] sm:text-[10px] font-bold mt-0.5 ${
                                                                    isPast ? 'text-slate-400' : isSel ? 'text-slate-300' : d.isToday ? 'text-emerald-600 font-black' : 'text-slate-400'
                                                                }`}>
                                                                    {d.monthShort}
                                                                </span>
                                                            </button>
                                                        )
                                                    })}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => scrollDateStrip('right')}
                                                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 shadow-md border border-slate-200 text-slate-700 hover:bg-white flex items-center justify-center transition-all opacity-0 group-hover/strip:opacity-100 cursor-pointer -mr-2"
                                                >
                                                    <HiChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Slot Grid */}
                                        <div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
                                                <label className="text-[11px] sm:text-xs font-black tracking-wider text-slate-600 uppercase">AVAILABLE SLOTS — {selectedDateObj.formattedLabel}</label>
                                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs uppercase tracking-wider font-extrabold">
                                                    <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-slate-300 bg-white" /> AVAILABLE</span>
                                                    <span className="flex items-center gap-1.5 text-[#10B981] font-black"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#10B981]" /> SELECTED</span>
                                                    <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-300" /> BOOKED</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
                                                {slots.map((s, index) => {
                                                    const selectedIndex = slots.findIndex(slotObj => slotObj.id === selectedSlot || (selectedSlot === null && slotObj.time === '18:00'))
                                                    const isSlotInSelectedRange = selectedIndex !== -1 && index >= selectedIndex && index < selectedIndex + duration
                                                    const isRangeStart = index === selectedIndex
                                                    const rangePosition = index - selectedIndex + 1

                                                    const isBooked = s.status === 'booked'
                                                    const isMaintenance = s.status === 'maintenance'
                                                    const isStaffUnavail = s.status === 'staff_unavailable' || s.status === 'blocked'
                                                    const isDisabled = isBooked || isMaintenance || isStaffUnavail

                                                    const canFulfillConsecutive = Array.from({ length: duration }).every((_, i) => {
                                                        const candidate = slots[index + i]
                                                        return candidate && (candidate.status === 'available' || candidate.id === selectedSlot || (selectedSlot === null && candidate.time === '18:00'))
                                                    })

                                                    const formattedTime = (t) => {
                                                        const [hStr, mStr] = t.split(':')
                                                        let h = parseInt(hStr, 10) || 18
                                                        const ampm = h >= 12 ? 'PM' : 'AM'
                                                        h = h % 12
                                                        if (h === 0) h = 12
                                                        return `${h}:${mStr || '00'} ${ampm}`
                                                    }

                                                    return (
                                                        <button
                                                            key={s.id}
                                                            type="button"
                                                            disabled={isDisabled && !isSlotInSelectedRange}
                                                            onClick={() => {
                                                                if (!canFulfillConsecutive && duration > 1) return;
                                                                handleSelectSlot(s.id)
                                                            }}
                                                            className={`py-3.5 px-3 rounded-[22px] text-center flex flex-col items-center justify-center gap-1 min-h-[76px] transition-all duration-200 ${isSlotInSelectedRange
                                                                    ? 'bg-[#10B981] text-white border-2 border-[#059669] shadow-lg shadow-emerald-500/20 scale-[1.02] cursor-pointer'
                                                                    : isBooked
                                                                        ? 'bg-[#F8FAFC] text-slate-300 border border-slate-100 opacity-75 cursor-not-allowed'
                                                                        : isMaintenance
                                                                            ? 'bg-[#FEFCE8] text-[#854D0E] border-2 border-[#FDE047] cursor-not-allowed'
                                                                            : isStaffUnavail
                                                                                ? 'bg-[#F1F5F9] text-slate-600 border-2 border-slate-200 cursor-not-allowed'
                                                                                : !canFulfillConsecutive && duration > 1
                                                                                    ? 'bg-slate-50 border border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                                                                                    : 'bg-[#ECFDF5] border-2 border-[#10B981] hover:bg-emerald-100/60 text-slate-900 cursor-pointer shadow-xs'
                                                                }`}
                                                        >
                                                            <span className={`text-sm sm:text-base font-black tracking-tight ${isSlotInSelectedRange ? 'text-white' : isBooked ? 'text-slate-400' : isMaintenance ? 'text-[#854D0E]' : isStaffUnavail ? 'text-slate-700' : 'text-[#111827]'}`}>
                                                                {formattedTime(s.time)}
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
                                                            ) : isSlotInSelectedRange && duration > 1 ? (
                                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${isRangeStart ? 'bg-white text-[#065F46]' : 'bg-emerald-600 text-white'}`}>
                                                                    {isRangeStart ? `START (1/${duration})` : `HOUR ${rangePosition}/${duration}`}
                                                                </span>
                                                            ) : !canFulfillConsecutive && duration > 1 ? (
                                                                <span className="text-[9px] font-bold text-slate-400">
                                                                    UNAVAILABLE ({duration}h)
                                                                </span>
                                                            ) : (
                                                                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full font-mono ${isSlotInSelectedRange ? 'bg-white/20 text-white' : 'bg-[#D1FAE5] text-[#065F46]'}`}>
                                                                    ₹{s.price}/hr
                                                                </span>
                                                            )}
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            {/* Live Selected Summary */}
                                            <div className="mt-6 bg-[#F8FAFC] border border-[#E2E8F0] p-4 sm:p-5 rounded-[20px] shadow-xs flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600">
                                                <span>Selected Slot: </span>
                                                <strong className="text-[#111827] font-black text-sm sm:text-base">
                                                    {(currentSlot?.time ? (parseInt(currentSlot.time) >= 12 ? `${parseInt(currentSlot.time) % 12 || 12}:00 PM` : `${parseInt(currentSlot.time)}:00 AM`) : '6:00 PM')} ({duration} {duration > 1 ? 'Hours' : 'Hour'})
                                                </strong>
                                                <span className="text-slate-300 mx-1">·</span>
                                                <span>Slot Rate: </span>
                                                <span className="text-[#10B981] font-black text-sm sm:text-base font-mono">₹{(currentSlot?.price || 1500).toLocaleString('en-IN')}/hr</span>
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

                                            {/* ADD VERIFIED UMPIRE ADD-ON (Tier 2 Verification) - Only shown if Turf Owner enabled service */}
                                            {isTurfUmpireAvailable && (
                                                <div className={`mt-5 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${hasVerifiedUmpire
                                                        ? 'bg-emerald-50/80 border-[#10B981] shadow-md shadow-emerald-500/10'
                                                        : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                                                    }`}>
                                                    <div className="flex items-start gap-3.5">
                                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 transition-colors ${hasVerifiedUmpire ? 'bg-[#10B981] text-white shadow-md shadow-emerald-500/20' : 'bg-slate-100 text-slate-700'
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
                                                        className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap w-full sm:w-auto text-center ${hasVerifiedUmpire
                                                                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                                                                : 'bg-[#10B981] hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                                                            }`}
                                                    >
                                                        {hasVerifiedUmpire ? '✓ Added (+₹300)' : '+ Add ₹300'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bottom Action Bar */}
                                        <div className="pt-6 border-t border-[#E5E7EB] flex items-center justify-between">
                                            <button
                                                onClick={() => navigate('/turfs')}
                                                className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold text-xs uppercase tracking-wider rounded-full transition-colors cursor-pointer flex items-center gap-2"
                                            >
                                                <HiArrowLeft className="w-4 h-4" />
                                                <span>Back to All Turfs</span>
                                            </button>

                                            <button
                                                onClick={() => setBookingStep(2)}
                                                className="px-7 py-3 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-sm border border-[#B5F000]"
                                            >
                                                Next: Payment mode →
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: PAYMENT MODE */}
                                {bookingStep === 2 && (
                                    <div className="space-y-6 animate-in fade-in duration-200">
                                        <div>
                                            <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight mb-2">
                                                How do you want to pay?
                                            </h1>
                                            <p className="text-slate-500 text-sm font-semibold">
                                                Match: Cricket at {turfData.name} · {selectedDateObj.dayShort} {selectedDateObj.dateNum} {selectedDateObj.monthShort} · 6:00 PM · ₹{totalRent.toLocaleString('en-IN')}
                                            </p>
                                        </div>

                                        {/* Payment Options List with Collapsible Accordion Conditions */}
                                        <div className="space-y-4">
                                            {[
                                                {
                                                    id: 'dare',
                                                    icon: '🔥',
                                                    title: 'Dare to play — Loser pays all',
                                                    desc: `Both teams pay 30% deposit (₹${Math.round(totalRent * 0.3).toLocaleString('en-IN')}). Winner gets full deposit refund. Loser pays ₹${totalRent.toLocaleString('en-IN')}. Draw = split ₹${(totalRent / 2).toLocaleString('en-IN')} each.`,
                                                    badge: '🔥 POPULAR MATCH CHALLENGE',
                                                    details: {
                                                        youPay: `₹${Math.round(totalRent * 0.3).toLocaleString('en-IN')} (30% Deposit)`,
                                                        youPaySub: 'Your Initial Share',
                                                        opponentPay: `₹${Math.round(totalRent * 0.3).toLocaleString('en-IN')} (30% Deposit)`,
                                                        opponentPaySub: 'Opponent Required Share',
                                                        ruleTitle: 'CONDITION RULE',
                                                        rule: `Winner gets deposit refunded. Losing team pays full ₹${totalRent.toLocaleString('en-IN')}. Draw = split ₹${(totalRent / 2).toLocaleString('en-IN')} each.`
                                                    }
                                                },
                                                {
                                                    id: 'split-50',
                                                    icon: '⚖️',
                                                    title: 'Split 50-50 with opponent',
                                                    desc: `You pay ₹${(totalRent / 2).toLocaleString('en-IN')} now. Opponent team pays ₹${(totalRent / 2).toLocaleString('en-IN')} to confirm the booking.`,
                                                    details: {
                                                        youPay: `₹${(totalRent / 2).toLocaleString('en-IN')}`,
                                                        youPaySub: '50% Initial Share',
                                                        opponentPay: `₹${(totalRent / 2).toLocaleString('en-IN')}`,
                                                        opponentPaySub: 'Opponent Required Share',
                                                        ruleTitle: 'CONDITION RULE',
                                                        rule: 'Opponent team gets 2 hours to pay via WhatsApp/SMS link. Unpaid in 2h → Full refund to you.'
                                                    }
                                                },
                                                {
                                                    id: 'per-player',
                                                    icon: '👥',
                                                    title: 'Per player split',
                                                    desc: `Each player pays their equal share. ${perPlayerCount} players = ₹${Math.round(totalRent / perPlayerCount).toLocaleString('en-IN')} each.`,
                                                    details: {
                                                        youPay: `₹${Math.round(totalRent / perPlayerCount).toLocaleString('en-IN')} / player`,
                                                        youPaySub: `Your Share (1 of ${perPlayerCount})`,
                                                        opponentPay: `₹${Math.round(totalRent / perPlayerCount).toLocaleString('en-IN')} / player`,
                                                        opponentPaySub: 'Teammates Required Share',
                                                        ruleTitle: 'CONDITION RULE',
                                                        rule: `Rent divided equally across ${perPlayerCount} players. Payment links generated automatically for each slot.`
                                                    }
                                                },
                                                {
                                                    id: 'full',
                                                    icon: '💳',
                                                    title: 'I pay full amount',
                                                    desc: `You pay ₹${totalRent.toLocaleString('en-IN')} now. Collect from your team later offline.`,
                                                    details: {
                                                        youPay: `₹${totalRent.toLocaleString('en-IN')}`,
                                                        youPaySub: 'Your Initial Share',
                                                        opponentPay: '₹0 (Free Invite)',
                                                        opponentPaySub: 'Opponent Required Share',
                                                        ruleTitle: 'CONDITION RULE',
                                                        rule: 'Slot 100% Locked immediately. No opponent payment required.'
                                                    }
                                                },
                                            ].map((opt) => {
                                                const isSelected = paymentMode === opt.id
                                                const isExpanded = expandedAccordionMode === opt.id

                                                return (
                                                    <div
                                                        key={opt.id}
                                                        className={`rounded-[22px] border transition-all duration-200 overflow-hidden ${isSelected
                                                                ? 'bg-emerald-50/60 border-2 border-[#10B981] shadow-md ring-2 ring-[#10B981]/20'
                                                                : 'bg-white border-[#E2E8F0] hover:border-[#10B981]/50 hover:shadow-xs'
                                                            }`}
                                                    >
                                                        {/* Card Header Bar */}
                                                        <div
                                                            onClick={() => {
                                                                setPaymentMode(opt.id)
                                                                setExpandedAccordionMode(isExpanded ? null : opt.id)
                                                            }}
                                                            className="p-3.5 sm:p-5 flex items-start sm:items-center justify-between cursor-pointer select-none gap-2.5"
                                                        >
                                                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                                                                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center text-base sm:text-xl flex-shrink-0 mt-0.5 sm:mt-0 ${isSelected ? 'bg-[#111827] text-white border-[#10B981]' : 'bg-slate-100 border-[#E2E8F0]'}`}>
                                                                    {opt.icon}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                                        <h3 className="text-xs sm:text-base font-black text-[#111827] leading-tight">
                                                                            {opt.title}
                                                                        </h3>
                                                                        {opt.badge && (
                                                                            <span className="text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider bg-[#C8FF2E] text-[#111827] px-2 sm:px-2.5 py-0.5 rounded-full border border-[#B5F000] shadow-xs">
                                                                                {opt.badge}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                                                        {opt.desc}
                                                                    </p>

                                                                    {opt.id === 'per-player' && isSelected && (
                                                                        <div className="mt-3 p-4 rounded-2xl bg-white border border-emerald-200 space-y-3" onClick={(e) => e.stopPropagation()}>
                                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                                                                    Select Total Players to Split Rent:
                                                                                </span>
                                                                                <span className="text-xs font-bold text-emerald-700 font-mono bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                                                                    ₹{Math.round(totalRent / perPlayerCount).toLocaleString('en-IN')} / player ({perPlayerCount} Players)
                                                                                </span>
                                                                            </div>

                                                                            <div className="flex flex-wrap items-center gap-2">
                                                                                {[2, 4, 6, 8, 10, 12, 14, 16, 20].map((num) => (
                                                                                    <button
                                                                                        key={num}
                                                                                        type="button"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation()
                                                                                            setPerPlayerCount(num)
                                                                                        }}
                                                                                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${perPlayerCount === num
                                                                                                ? 'bg-[#111827] text-[#C8FF2E] border-[#111827] shadow-sm scale-105'
                                                                                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                                                                            }`}
                                                                                    >
                                                                                        {num} Players
                                                                                    </button>
                                                                                ))}

                                                                                <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl px-2 py-1">
                                                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Custom:</span>
                                                                                    <input
                                                                                        type="number"
                                                                                        min="1"
                                                                                        max="50"
                                                                                        value={perPlayerCount}
                                                                                        onChange={(e) => {
                                                                                            const val = parseInt(e.target.value, 10)
                                                                                            if (val > 0) setPerPlayerCount(val)
                                                                                        }}
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                        className="w-12 text-center text-xs font-black bg-white border border-slate-300 rounded-lg py-0.5 outline-none focus:border-emerald-500"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Radio & Arrow Accordion Toggle */}
                                                            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#10B981] bg-[#10B981]' : 'border-slate-300'}`}>
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
                                                                    <span className={`text-[10px] font-bold transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* COLLAPSIBLE ACCORDION BREAKDOWN BOX */}
                                                        {isExpanded && (
                                                            <div className="border-t border-[#E2E8F0] bg-white p-4 sm:p-5 animate-in fade-in duration-200 space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs font-black uppercase tracking-wider text-[#10B981] flex items-center gap-1.5">
                                                                        <span>📋</span> STEP-BY-STEP CONDITIONS & RULES
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                                                                        {opt.title}
                                                                    </span>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                                                                    {/* Column 1: You Pay */}
                                                                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                                                                        <div>
                                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                                                                YOU PAY NOW
                                                                            </span>
                                                                            <span className="text-xl font-black text-[#10B981] font-mono block mt-1">
                                                                                {opt.details.youPay}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-[10px] font-medium text-slate-400 mt-2 block">
                                                                            {opt.details.youPaySub}
                                                                        </span>
                                                                    </div>

                                                                    {/* Column 2: Opponent Share */}
                                                                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                                                                        <div>
                                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                                                                OPPONENT SHARE
                                                                            </span>
                                                                            <span className="text-xl font-black text-[#10B981] font-mono block mt-1">
                                                                                {opt.details.opponentPay}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-[10px] font-medium text-slate-400 mt-2 block">
                                                                            {opt.details.opponentPaySub}
                                                                        </span>
                                                                    </div>

                                                                    {/* Column 3: Rule */}
                                                                    <div className="bg-[#FEFCE8] border border-[#FDE047] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                                                                        <div>
                                                                            <span className="text-[10px] font-black text-[#B45309] uppercase tracking-wider block">
                                                                                {opt.details.ruleTitle}
                                                                            </span>
                                                                            <p className="text-xs font-bold text-amber-950 mt-1 leading-relaxed">
                                                                                {opt.details.rule}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* Bottom Action Bar */}
                                        <div className="pt-6 border-t border-[#E2E8F0] flex items-center justify-between">
                                            <button
                                                onClick={() => setBookingStep(1)}
                                                className="px-6 py-3 rounded-full bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#111827] font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                                            >
                                                ← Back
                                            </button>

                                            <button
                                                onClick={() => setBookingStep(3)}
                                                className="px-8 py-3.5 rounded-full bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md border border-[#B5F000]"
                                            >
                                                Next: Team details →
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: TEAMS & INVITES */}
                                {bookingStep === 3 && (
                                    <div className="space-y-5 animate-in fade-in">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black italic tracking-tight uppercase text-[#111827]">Team details & invite</h2>
                                            <p className="text-xs text-[#6B7280] font-semibold mt-0.5">
                                                Payment mode: <span className="font-bold text-[#111827]">{getPaymentModeTitle(paymentMode)}</span> · Total ₹{totalRent.toLocaleString('en-IN')}
                                            </p>
                                        </div>

                                        {/* YOUR TEAM */}
                                        <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-2xl p-4 space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] block">YOUR TEAM (TEAM A)</label>
                                            <input
                                                type="text"
                                                value={teamAName}
                                                onChange={e => setTeamAName(e.target.value)}
                                                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs font-bold text-[#111827] outline-none focus:border-[#16A34A]"
                                            />

                                            {paymentMode === 'full' ? (
                                                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs font-semibold text-green-950 flex items-center gap-2">
                                                    <span>💳</span>
                                                    <div>
                                                        <strong className="block text-green-900 font-bold">Full Pay Selected (100% Paid by You)</strong>
                                                        You are paying full ₹{totalRent.toLocaleString('en-IN')}. No teammate split payment links required.
                                                    </div>
                                                </div>
                                            ) : paymentMode === 'per-player' ? (
                                                <>
                                                    <div className="space-y-2">
                                                        {teammates.map(member => (
                                                            <div key={member.id} className="bg-white border border-[#E5E7EB] rounded-xl p-2.5 flex items-center justify-between text-xs shadow-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${member.tag === 'You' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-slate-100 text-[#6B7280]'
                                                                        }`}>
                                                                        {member.tag}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-[#111827]">{member.name}</div>
                                                                        <div className="text-[10px] text-[#6B7280]">
                                                                            {member.phone} · {member.isCaptain ? `Captain Share (₹${myShare.toLocaleString('en-IN')})` : `Share: ₹${(member.amount || Math.round(totalRent / 6)).toLocaleString('en-IN')}`}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border ${member.status === 'Paid' || member.isCaptain
                                                                        ? 'bg-green-50 text-[#16A34A] border-green-200'
                                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                                    }`}>
                                                                    {member.isCaptain || member.status === 'Paid' ? 'Paid' : 'Pending'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {showAddTeammateInput ? (
                                                        <div className="flex gap-2 pt-1">
                                                            <input
                                                                type="text"
                                                                value={newTeammateName}
                                                                onChange={e => setNewTeammateName(e.target.value)}
                                                                placeholder="Player name"
                                                                className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-xs text-[#111827] font-bold outline-none focus:border-[#16A34A]"
                                                            />
                                                            <button
                                                                onClick={handleAddTeammate}
                                                                className="px-3.5 py-1.5 bg-[#C8FF2E] text-[#111827] font-black text-xs rounded-xl hover:bg-[#B5F000] cursor-pointer border border-[#B5F000]"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setShowAddTeammateInput(true)}
                                                            className="w-full py-2 bg-white hover:bg-slate-50 border border-[#E5E7EB] rounded-xl text-[#6B7280] hover:text-[#111827] text-xs font-bold transition-colors cursor-pointer text-center block mt-1"
                                                        >
                                                            + Add teammate (Send Share Link)
                                                        </button>
                                                    )}
                                                </>
                                            ) : null}
                                        </div>

                                        {/* OPPONENT TEAM */}
                                        <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-2xl p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">OPPONENT TEAM (TEAM B)</label>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setHasOpponentTeam(!hasOpponentTeam)}
                                                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${hasOpponentTeam ? 'bg-[#16A34A]' : 'bg-slate-300'}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${hasOpponentTeam ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                                                    </button>
                                                    <span className="text-[10px] text-[#4B5563] font-bold">I have opponent</span>
                                                </div>
                                            </div>

                                            {/* Explicit Rule Banner for Selected Mode */}
                                            <div className="bg-slate-50 border border-[#E5E7EB] p-3 rounded-xl text-xs space-y-1.5">
                                                <div className="flex items-center justify-between font-black text-[#111827] uppercase tracking-wider text-[10px] border-b border-[#E5E7EB] pb-1.5">
                                                    <span>Payment Condition & Rules</span>
                                                    <span className="text-[#16A34A]">{getPaymentModeTitle(paymentMode)}</span>
                                                </div>
                                                {paymentMode === 'full' && (
                                                    <p className="text-[#4B5563] text-[11px] font-medium leading-relaxed">
                                                        💳 <strong>Full Pay (100%):</strong> You pay ₹{totalRent.toLocaleString('en-IN')} upfront. Slot is locked immediately. Opponent team is invited for free with zero payment required.
                                                    </p>
                                                )}
                                                {paymentMode === 'split-50' && (
                                                    <p className="text-[#4B5563] text-[11px] font-medium leading-relaxed">
                                                        ⚖️ <strong>Split 50-50:</strong> You pay ₹{(totalRent / 2).toLocaleString('en-IN')} now. Opponent captain gets an SMS/WA link to pay the remaining ₹{(totalRent / 2).toLocaleString('en-IN')}. If opponent doesn't pay within <strong>2 hours</strong>, slot is released and you get a <strong>100% refund</strong>.
                                                    </p>
                                                )}
                                                {paymentMode === 'custom' && (
                                                    <p className="text-[#4B5563] text-[11px] font-medium leading-relaxed">
                                                        🎴 <strong>Custom Split:</strong> You pay ₹{myShare.toLocaleString('en-IN')} now. Opponent captain receives a payment link for the remaining ₹{opponentShare.toLocaleString('en-IN')}.
                                                    </p>
                                                )}
                                                {paymentMode === 'dare' && (
                                                    <p className="text-[#4B5563] text-[11px] font-medium leading-relaxed">
                                                        🔥 <strong>Dare to Play:</strong> Both teams deposit 30% (₹{Math.round(totalRent * 0.3).toLocaleString('en-IN')}) now. Winner gets deposit refunded; losing team pays full ₹{totalRent.toLocaleString('en-IN')} after match score confirmation.
                                                    </p>
                                                )}
                                                {paymentMode === 'per-player' && (
                                                    <p className="text-[#4B5563] text-[11px] font-medium leading-relaxed">
                                                        👥 <strong>Per-Player Split:</strong> You pay your ₹{Math.round(totalRent / 6).toLocaleString('en-IN')} share. Share links generated for players. Minimum 4 paid players per side required to confirm.
                                                    </p>
                                                )}
                                            </div>

                                            {hasOpponentTeam && (
                                                <div className="space-y-2 pt-1">
                                                    <input
                                                        type="text"
                                                        value={teamBName}
                                                        onChange={e => setTeamBName(e.target.value)}
                                                        className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs font-bold text-[#111827] outline-none focus:border-[#16A34A]"
                                                        placeholder="Opponent team name"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={teamBPhone}
                                                        onChange={e => setTeamBPhone(e.target.value)}
                                                        className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs font-bold text-[#111827] outline-none focus:border-[#16A34A]"
                                                        placeholder="Opponent captain mobile (+91...)"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Open Challenge Toggle */}
                                        <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-2xl p-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">DON'T HAVE AN OPPONENT?</label>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setIsOpenChallenge(!isOpenChallenge)}
                                                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${isOpenChallenge ? 'bg-[#16A34A]' : 'bg-slate-300'}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${isOpenChallenge ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                                                    </button>
                                                    <span className="text-[10px] text-[#4B5563] font-bold">Open challenge</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-[#6B7280] font-medium">
                                                List as "Open challenge" — your match will appear in the public challenge feed.
                                            </p>
                                        </div>

                                        <div className="pt-6 border-t border-[#E5E7EB] flex items-center justify-between">
                                            <button
                                                onClick={() => setBookingStep(2)}
                                                className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold text-xs uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                                            >
                                                ← Back
                                            </button>

                                            <button
                                                disabled={isDeploying}
                                                onClick={() => setShowPaymentModal(true)}
                                                className="px-7 py-3 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-sm border border-[#B5F000] flex items-center gap-2"
                                            >
                                                {isDeploying ? (
                                                    <>
                                                        <span className="w-3.5 h-3.5 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
                                                        <span>Syncing Booking...</span>
                                                    </>
                                                ) : (
                                                    <span>Send invite & pay →</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4: CONFIRM & RECEIPT */}
                                {bookingStep === 4 && (
                                    <div className="space-y-6 animate-in fade-in">
                                        <div className="text-center pt-2">
                                            <div className="w-12 h-12 rounded-2xl bg-[#C8FF2E] border border-[#B5F000] text-[#111827] flex items-center justify-center mx-auto mb-3 shadow-sm font-black text-xl">
                                                ✓
                                            </div>
                                            <h2 className="text-xl sm:text-2xl font-black italic tracking-tight uppercase text-[#111827]">Turf booking confirmed!</h2>
                                            <p className="text-xs text-[#6B7280] font-semibold mt-0.5">Booking and match invite recorded in MySQL database.</p>
                                        </div>

                                        <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-2xl p-5 space-y-3 text-xs">
                                            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                                                <span className="text-[#6B7280]">Turf Venue</span>
                                                <span className="text-[#111827] font-bold">{turfData.name}, {turfData.location}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                                                <span className="text-[#6B7280]">Date & Slot</span>
                                                <span className="text-[#111827] font-bold">{selectedDateObj.dayShort}, {selectedDateObj.dateNum} {selectedDateObj.monthShort} · {currentSlot?.time || '18:00'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                                                <span className="text-[#6B7280]">Duration</span>
                                                <span className="text-[#111827] font-bold">{duration} {duration > 1 ? 'Hours' : 'Hour'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                                                <span className="text-[#6B7280]">Total rent</span>
                                                <span className="text-[#111827] font-bold">₹{totalRent.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                                                <span className="text-[#6B7280]">Payment mode</span>
                                                <span className="text-[#111827] font-bold">{getPaymentModeTitle(paymentMode)}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                                                <span className="text-[#6B7280]">Your share</span>
                                                <span className="text-[#16A34A] font-black">₹{myShare.toLocaleString('en-IN')} [✓ Paid]</span>
                                            </div>
                                            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                                                <span className="text-[#6B7280]">Opponent share</span>
                                                <span className="font-bold text-[#111827]">
                                                    {paymentMode === 'full'
                                                        ? '₹0 (Free Invite)'
                                                        : paymentMode === 'dare'
                                                            ? '₹100 (Deposit Pending)'
                                                            : `₹${opponentShare.toLocaleString('en-IN')} (Invite Pending)`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between pt-1">
                                                <span className="text-[#6B7280]">Booking ID</span>
                                                <span className="font-mono font-bold text-[#16A34A]">{bookingId}</span>
                                            </div>
                                        </div>

                                        {/* Teams Matchup Card */}
                                        <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-2xl p-4 space-y-2 text-xs">
                                            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-[#E5E7EB]">
                                                <span className="font-bold text-[#111827]">[A] {teamAName}</span>
                                                <span className="text-[#16A34A] font-black text-[10px] bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">Confirmed</span>
                                            </div>
                                            <div className="text-center text-[10px] font-black text-[#9CA3AF]">VS</div>
                                            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-[#E5E7EB]">
                                                <span className="font-bold text-[#111827]">[B] {hasOpponentTeam ? teamBName : 'Open Challenge'}</span>
                                                <span className={`font-black text-[10px] px-2.5 py-0.5 rounded-full border ${paymentMode === 'full' ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                    {paymentMode === 'full' ? 'Invited (Free)' : paymentMode === 'dare' ? 'Challenge Sent' : 'Payment Pending'}
                                                </span>
                                            </div>

                                            {/* Interactive Opponent Action Buttons */}
                                            {paymentMode !== 'full' && (
                                                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                                                    <button
                                                        onClick={() => {
                                                            const url = `${window.location.origin}/turfs/${turfData.id}?mode=${paymentMode}&pay=opponent`
                                                            navigator.clipboard?.writeText(url)
                                                            if (addToast) addToast(`Opponent Payment Link copied! (₹${opponentShare.toLocaleString('en-IN')})`, 'success')
                                                        }}
                                                        className="px-2.5 py-1 bg-[#16A34A] text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        📋 Copy Link
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const text = `Join our match at ${turfData.name}! Pay your ₹${opponentShare.toLocaleString('en-IN')} share: ${window.location.origin}/turfs/${turfData.id}`
                                                            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
                                                        }}
                                                        className="px-2.5 py-1 bg-[#25D366] text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        💬 WhatsApp
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const newTeam = prompt('Enter new opponent team name:', 'Thunder XI')
                                                            if (newTeam) {
                                                                setTeamBName(newTeam)
                                                                if (addToast) addToast(`Re-invited ${newTeam}! Share link sent.`, 'info')
                                                            }
                                                        }}
                                                        className="px-2.5 py-1 bg-slate-200 text-[#111827] font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        🔄 Change Team
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* 2-Hour Pre-Match Guarantee Card */}
                                        {paymentMode !== 'full' && (
                                            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 space-y-2 text-xs text-amber-950">
                                                <div className="flex items-center justify-between font-black uppercase text-[10px] text-amber-900 border-b border-amber-200 pb-1.5">
                                                    <span>🛡️ 2-Hour Pre-Match Policy</span>
                                                    <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-[9px]">Active</span>
                                                </div>
                                                <p className="text-[11px] font-medium leading-relaxed">
                                                    If Team B doesn't pay 2h before match time (4:00 PM), you can either:
                                                </p>
                                                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                                                    <div className="bg-white p-2 rounded-lg border border-amber-200 text-emerald-700">✓ 100% Refund (₹{myShare.toLocaleString('en-IN')})</div>
                                                    <div className="bg-white p-2 rounded-lg border border-amber-200 text-blue-700">✓ Pay ₹{opponentShare.toLocaleString('en-IN')} & play solo</div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-3 pt-4 border-t border-[#E5E7EB]">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard?.writeText(window.location.href);
                                                    if (addToast) addToast('Match link copied to clipboard!', 'info');
                                                }}
                                                className="flex-1 py-3 bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold text-xs uppercase tracking-wider rounded-full transition-colors text-center cursor-pointer"
                                            >
                                                Share match
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (user) {
                                                        navigate('/customer/bookings')
                                                    } else {
                                                        navigate('/turfs')
                                                    }
                                                }}
                                                className="flex-1 py-3 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-xs uppercase tracking-widest rounded-full transition-colors text-center cursor-pointer shadow-sm border border-[#B5F000]"
                                            >
                                                {user ? 'View my matches' : 'Explore More Turfs'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                    FULL-WIDTH PREMIUM SECTIONS BELOW
                ══════════════════════════════════════════════ */}
                <div className="mt-16 space-y-16">

                    {/* ── SECTION: LOCATION & DIRECTIONS ── */}
                    <TurfDirectionsMap turfData={turfData} />

                    {/* ── SECTION: REVIEWS ── */}
                    <TurfReviewsSection
                        ratingBreakdown={ratingBreakdown}
                        totalReviews={totalReviews}
                        turfData={turfData}
                        reviewsList={reviewsData.map(r => ({ id: r.id, author: r.name, date: r.date, rating: r.rating, comment: r.text }))}
                    />

                    {/* ── SECTION: MEET YOUR HOST ── */}
                    <section className="relative pb-10">
                        <SectionLabel accent="purple">Meet Your Host</SectionLabel>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Host Profile Card */}
                            <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-7 flex flex-col items-center text-center relative overflow-hidden group shadow-xs">
                                <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-[#16A34A] flex items-center justify-center text-3xl mb-4 relative z-10">
                                    {hostData.avatar}
                                </div>

                                <h3 className="text-xl font-black text-[#111827] mb-1 relative z-10">{hostData.name}</h3>

                                <div className="flex items-center gap-2 mb-5 relative z-10">
                                    {hostData.verified && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#16A34A] bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                                            <HiShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" /> Verified
                                        </span>
                                    )}
                                    {hostData.superhost && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                                            <HiStar className="w-3.5 h-3.5 text-purple-600" /> Superhost
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 w-full mb-6 relative z-10">
                                    <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl p-3">
                                        <div className="text-xl font-black text-[#111827]">{hostData.totalVenues}</div>
                                        <div className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mt-0.5">Venues</div>
                                    </div>
                                    <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl p-3">
                                        <div className="text-xl font-black text-[#111827]">{hostData.responseRate}</div>
                                        <div className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mt-0.5">Response</div>
                                    </div>
                                </div>

                                <p className="text-xs text-[#6B7280] font-semibold relative z-10">Hosting since {hostData.hostingSince}</p>
                            </div>

                            {/* Host Bio & Contact */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-6 shadow-xs">
                                    <h3 className="text-xs font-black uppercase text-[#16A34A] tracking-widest mb-3">About the Host</h3>
                                    <p className="text-sm text-[#4B5563] font-semibold leading-relaxed">{hostData.bio}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 flex items-center gap-4 shadow-xs">
                                        <div className="w-11 h-11 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center shrink-0">
                                            <HiClock className="w-5 h-5 text-[#16A34A]" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-[#6B7280] tracking-widest mb-0.5">Response Time</h4>
                                            <p className="text-sm text-[#111827] font-black">{hostData.responseTime}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 flex items-center gap-4 shadow-xs">
                                        <div className="w-11 h-11 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center shrink-0">
                                            <HiPhone className="w-5 h-5 text-[#16A34A]" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-[#6B7280] tracking-widest mb-0.5">Contact</h4>
                                            <p className="text-sm text-[#111827] font-black">{hostData.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 flex items-center gap-4 shadow-xs">
                                    <div className="w-11 h-11 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center shrink-0">
                                        <HiMail className="w-5 h-5 text-[#16A34A]" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase text-[#6B7280] tracking-widest mb-0.5">Email</h4>
                                        <p className="text-sm text-[#111827] font-black">{hostData.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
            {/* Deployment Confirmation Modal */}
            <TurfBookingSuccessModal
                isOpen={bookingSuccessModal && !!deploymentDetails}
                onClose={() => setBookingSuccessModal(false)}
                turfData={turfData}
                selectedDateObj={selectedDateObj}
                currentSlot={currentSlot}
                totalRent={totalRent}
                paymentMode={paymentMode}
                bookingId={deploymentDetails?.deploymentId || bookingId}
                navigate={navigate}
                setSelectedSlot={setSelectedSlot}
            />
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                paymentMode={paymentMode}
                totalRent={totalRent}
                myPaymentAmount={myShare}
                opponentShareAmount={opponentShare}
                handleConfirmBooking={() => {
                    setShowPaymentModal(false);
                    handleConfirmAndDeploy();
                }}
            />
            <VenueSwitchModal
                isOpen={isVenueModalOpen}
                onClose={() => setIsVenueModalOpen(false)}
                allTurfs={allTurfsList}
                selectedVenue={activeTurf}
                onSelectVenue={(venue) => {
                    setIsVenueModalOpen(false);
                    navigate(`/turf/${venue.id}`);
                }}
            />
            <CorporateBookingModal
                isOpen={isCorpModalOpen}
                onClose={() => setIsCorpModalOpen(false)}
                preselectedTurf={turfData}
                preselectedCity={turfData.city || 'Indore'}
            />
        </div>
    )
}
