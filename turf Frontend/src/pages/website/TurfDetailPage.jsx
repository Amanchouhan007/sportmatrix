import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HiLocationMarker, HiStar, HiArrowLeft, HiShieldCheck, HiClock, HiPhone, HiMail, HiLightBulb, HiCheckCircle, HiX } from 'react-icons/hi'
import { MdSportsCricket, MdWifi, MdLocalParking, MdLocalDrink, MdOutlineHealthAndSafety, MdSportsFootball, MdLock, MdWc } from 'react-icons/md'
import { RiShieldStarFill } from 'react-icons/ri'
import SlotGrid from '../../components/ui/SlotGrid'
import { useToast } from '../../components/ui/Toast'
import MediaUploadModal from '../../components/MediaUploadModal'

const defaultTurfData = {
    id: 1, name: 'SportZone Arena', location: 'Andheri West, Mumbai', rating: 4.8, reviews: 124,
    description: 'Elite sports facility engineered for peak performance. Features high-lumen LED floodlights, FIFA-certified synthetic turf, and professional-grade recovery zones. Ideal for intense 7v7 football campaigns or standard cricket matches.',
    sports: [
        { name: 'Cricket', price: 800, peakPrice: 1200 },
        { name: 'Football', price: 900, peakPrice: 1400 },
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
    { id: 1, name: 'Green Arena Football Turf', location: 'Andheri West, Mumbai', city: 'Mumbai', rating: 4.8, price: 1200, image: '/images/turf1.png', sports: ['Football'], amenities: ['Floodlights', 'Parking', 'Washroom'], lat: 19.1136, lng: 72.8697 },
    { id: 2, name: 'Champion Cricket Academy', location: 'Koramangala, Bangalore', city: 'Bangalore', rating: 4.9, price: 1500, image: '/images/turf2.png', sports: ['Cricket'], amenities: ['Floodlights', 'Seating', 'Drinking Water'], lat: 12.9352, lng: 77.6245 },
    { id: 4, name: 'Elite Sports Complex', location: 'Whitefield, Bangalore', city: 'Bangalore', rating: 4.6, price: 2000, image: '/images/turf3.png', sports: ['Football', 'Cricket'], amenities: ['Floodlights', 'Parking', 'Seating', 'Washroom'], lat: 12.9698, lng: 77.7500 },
    { id: 5, name: 'ProPlay Arena', location: 'Vashi, Navi Mumbai', city: 'Mumbai', rating: 4.5, price: 1000, image: '/images/turf4.png', sports: ['Football'], amenities: ['Floodlights', 'Parking'], lat: 19.0330, lng: 73.0297 },
    { id: 6, name: 'Royal Cricket Ground', location: 'Vijay Nagar, Indore', city: 'Indore', rating: 4.7, price: 600, image: '/images/turf5.png', sports: ['Cricket'], amenities: ['Floodlights', 'Parking', 'Drinking Water'], lat: 22.7533, lng: 75.8937 },
    { id: 9, name: 'Skyline Football Turf', location: 'Powai, Mumbai', city: 'Mumbai', rating: 4.6, price: 1400, image: '/images/turf6.png', sports: ['Football'], amenities: ['Floodlights', 'Washroom'], lat: 19.1176, lng: 72.9060 },
    { id: 11, name: 'Master Blaster Cricket', location: 'Saket, Delhi', city: 'Delhi', rating: 4.8, price: 1100, image: '/images/turf7.png', sports: ['Cricket'], amenities: ['Floodlights', 'Equipment'], lat: 28.5244, lng: 77.2167 },
    { id: 13, name: 'Spike Football Turf', location: 'Bhawarkua, Indore', city: 'Indore', rating: 4.6, price: 500, image: '/images/turf1.png', sports: ['Football'], amenities: ['Floodlights', 'Parking', 'Washroom'], lat: 22.6953, lng: 75.8690 },
    { id: 14, name: 'Indore Sports Arena', location: 'LIG Colony, Indore', city: 'Indore', rating: 4.9, price: 800, image: '/images/turf2.png', sports: ['Football', 'Cricket'], amenities: ['Floodlights', 'Parking', 'Seating', 'Washroom', 'AC'], lat: 22.7380, lng: 75.8916 },
    { id: 15, name: 'Rajiv Gandhi Stadium Turf', location: 'Navlakha, Indore', city: 'Indore', rating: 4.5, price: 700, image: '/images/turf3.png', sports: ['Football', 'Cricket'], amenities: ['Floodlights', 'Parking', 'Seating', 'Drinking Water'], lat: 22.7000, lng: 75.8752 },
]

/* ── Features Data ── */
const features = [
    { icon: HiLightBulb, label: 'LED Floodlights', desc: 'High-lumen LED arena lighting for night sessions' },
    { icon: MdSportsFootball, label: 'FIFA-Grade Turf', desc: 'Certified synthetic grass surface for pro gameplay' },
    { icon: MdLocalParking, label: 'Secured Parking', desc: 'Guarded parking lot with 50+ vehicle capacity' },
    { icon: MdLock, label: 'Pro Locker Rooms', desc: 'Premium changing rooms with individual lockers' },
    { icon: MdLocalDrink, label: 'Hydration Station', desc: 'Free RO drinking water & energy drink counter' },
    { icon: MdWifi, label: 'High-Speed Wi-Fi', desc: '100 Mbps dedicated Wi-Fi across the facility' },
    { icon: MdOutlineHealthAndSafety, label: 'First Aid & Med-Bay', desc: 'On-site medical kit & emergency support' },
    { icon: MdWc, label: 'Washroom Access', desc: 'Clean, hygienic washrooms maintained hourly' },
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

const generateSlots = () => {
    const times = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00']
    return times.map((t, i) => ({
        id: i, time: t, price: i >= 10 && i <= 14 ? 1200 : 800,
        status: [3, 7, 11, 15].includes(i) ? 'booked' : i === 5 ? 'blocked' : 'available',
    }))
}

/* ── Section Label Component ── */
function SectionLabel({ children, accent = 'emerald' }) {
    const colors = {
        emerald: 'text-emerald-400 bg-emerald-500/50',
        blue: 'text-blue-400 bg-blue-500/50',
        amber: 'text-amber-400 bg-amber-500/50',
        purple: 'text-purple-400 bg-purple-500/50',
    }
    return (
        <h2 className={`text-sm md:text-base font-black tracking-[0.2em] uppercase ${colors[accent]?.split(' ')[0] || 'text-emerald-400'} mb-6 flex items-center gap-3`}>
            <span className={`h-px w-6 ${colors[accent]?.split(' ')[1] || 'bg-emerald-500/50'}`} />
            {children}
            <span className={`h-px flex-1 ${colors[accent]?.split(' ')[1] || 'bg-emerald-500/50'} opacity-30`} />
        </h2>
    )
}

export default function TurfDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [selectedMediaId, setSelectedMediaId] = useState(0)
    const [selectedDate, setSelectedDate] = useState('2026-03-15')
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [duration, setDuration] = useState(1)
    const [isDeploying, setIsDeploying] = useState(false)
    const [bookingSuccessModal, setBookingSuccessModal] = useState(false)
    const [deploymentDetails, setDeploymentDetails] = useState(null)
    const toastContext = useToast()
    const addToast = toastContext?.addToast
    const slots = generateSlots()
    const videoRef = useRef(null)

    const activeTurf = allTurfsList.find(t => t.id === Number(id)) || allTurfsList[0];

    const uploadedFilesMedia = [
        { type: 'video', url: 'http://localhost:5000/uploads/files-1785914796662-273628137.mp4', thumbnail: '', filename: 'Uploaded Video' },
        { type: 'image', url: 'http://localhost:5000/uploads/files-1785914764936-630968668.jpeg', thumbnail: 'http://localhost:5000/uploads/files-1785914764936-630968668.jpeg', filename: 'Uploaded Photo' }
    ];

    const initialMedia = [
        ...uploadedFilesMedia,
        { type: 'image', url: activeTurf.image, thumbnail: activeTurf.image },
        ...defaultTurfData.media.slice(1)
    ];

    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [customMediaList, setCustomMediaList] = useState(() => {
        try {
            const saved = localStorage.getItem(`turf_media_${activeTurf.id}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}
        return initialMedia;
    });

    useEffect(() => {
        const fetchTurfMedia = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/v1/turfs/${activeTurf.id}`);
                const data = await res.json();
                if (data.success && data.data && data.data.media) {
                    const backendMedia = typeof data.data.media === 'string' ? JSON.parse(data.data.media) : data.data.media;
                    if (Array.isArray(backendMedia) && backendMedia.length > 0) {
                        setCustomMediaList(backendMedia);
                        localStorage.setItem(`turf_media_${activeTurf.id}`, JSON.stringify(backendMedia));
                    }
                }
            } catch (err) {
                console.error('Could not fetch turf media from server:', err);
            }
        };
        fetchTurfMedia();
    }, [activeTurf.id]);

    const turfData = {
        ...defaultTurfData,
        id: activeTurf.id,
        name: activeTurf.name,
        location: activeTurf.location,
        rating: activeTurf.rating,
        sports: activeTurf.sports.map(s => ({
            name: s,
            price: activeTurf.price,
            peakPrice: activeTurf.price + 400
        })),
        amenities: activeTurf.amenities.length > 0 ? activeTurf.amenities : defaultTurfData.amenities,
        media: customMediaList.length > 0 ? customMediaList : initialMedia,
        coordinates: { lat: activeTurf.lat, lng: activeTurf.lng }
    };

    const activeMedia = turfData.media[selectedMediaId] || turfData.media[0] || initialMedia[0];
    const totalReviews = ratingBreakdown.reduce((a, b) => a + b.count, 0)

    const saveMediaState = async (updatedMedia) => {
        setCustomMediaList(updatedMedia);
        try {
            localStorage.setItem(`turf_media_${activeTurf.id}`, JSON.stringify(updatedMedia));
        } catch (e) {}
        try {
            await fetch(`http://localhost:5000/api/v1/turfs/${activeTurf.id}/media`, {
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
                    await fetch(`http://localhost:5000/api/v1/upload/${filename}`, {
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

    // Integrated 4-Step Booking State (Starts on Date & Time)
    const [bookingStep, setBookingStep] = useState(1);
    const dateList = [
        { id: 'd-1', fullDateString: '2026-08-09', dayShort: 'Sun', dateNum: 9, monthShort: 'Aug', formattedLabel: 'SUNDAY, 9 AUG' },
        { id: 'd-2', fullDateString: '2026-08-10', dayShort: 'Mon', dateNum: 10, monthShort: 'Aug', formattedLabel: 'MONDAY, 10 AUG' },
        { id: 'd-3', fullDateString: '2026-08-11', dayShort: 'Tue', dateNum: 11, monthShort: 'Aug', formattedLabel: 'TUESDAY, 11 AUG' },
        { id: 'd-4', fullDateString: '2026-08-12', dayShort: 'Wed', dateNum: 12, monthShort: 'Aug', formattedLabel: 'WEDNESDAY, 12 AUG' },
        { id: 'd-5', fullDateString: '2026-08-13', dayShort: 'Thu', dateNum: 13, monthShort: 'Aug', formattedLabel: 'THURSDAY, 13 AUG' },
        { id: 'd-6', fullDateString: '2026-08-14', dayShort: 'Fri', dateNum: 14, monthShort: 'Aug', formattedLabel: 'FRIDAY, 14 AUG' },
        { id: 'd-7', fullDateString: '2026-08-15', dayShort: 'Sat', dateNum: 15, monthShort: 'Aug', formattedLabel: 'SATURDAY, 15 AUG' },
        { id: 'd-8', fullDateString: '2026-08-16', dayShort: 'Sun', dateNum: 16, monthShort: 'Aug', formattedLabel: 'SUNDAY, 16 AUG' },
    ];
    const [selectedDateObj, setSelectedDateObj] = useState(dateList[0]);
    const [paymentMode, setPaymentMode] = useState('full');
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

    // Instant Slot Selection
    const handleSelectSlot = (slotId) => {
        setSelectedSlot(slotId);
    };

    const currentSlot = slots.find(s => s.id === selectedSlot) || slots[12] || slots[0];
    const totalRent = (turfData.price || 800) * duration;

    // 5 Payment Modes Calculation (User's Exact Architecture)
    const myShare = paymentMode === 'full'
        ? totalRent
        : paymentMode === 'split-50'
            ? totalRent / 2
            : paymentMode === 'custom'
                ? customSplitMyShare
                : paymentMode === 'dare'
                    ? 100
                    : Math.round(totalRent / 6);

    const opponentShare = paymentMode === 'full' 
        ? 0 
        : paymentMode === 'dare'
            ? 100
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

        const bookingPayload = {
            slotId: `slot_${turfData.id}_${selectedDateObj.fullDateString.replace(/-/g, '')}_${selectedSlot || 12}`,
            customerName: captainName,
            mobileNumber: captainPhone,
            notes: JSON.stringify({
                venueName: turfData.name,
                venueLocation: turfData.location,
                date: selectedDateObj.formattedLabel,
                time: currentSlot?.time || '18:00',
                duration: duration,
                totalRent: totalRent,
                paymentMode: paymentMode,
                captainShare: myShare,
                opponentShare: opponentShare,
                teamA: teamAName,
                teamB: hasOpponentTeam ? teamBName : 'Open Challenge',
                bookingId: generatedBookingId
            })
        };

        try {
            await fetch('http://localhost:5000/api/v1/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingPayload)
            });

            // Save to local storage for instant customer bookings page display
            const existing = JSON.parse(localStorage.getItem('customer_bookings') || '[]');
            const newEntry = {
                id: generatedBookingId,
                sport: 'Turf Match',
                venue: `${turfData.name}, ${turfData.location}`,
                date: selectedDateObj.fullDateString,
                time: currentSlot?.time || '6:00 PM',
                amount: `₹${myShare.toLocaleString('en-IN')}`,
                status: 'Confirmed'
            };
            localStorage.setItem('customer_bookings', JSON.stringify([newEntry, ...existing]));

            setIsDeploying(false);
            setBookingStep(4);
            if (addToast) addToast('Turf booking and match invite recorded in database!', 'success');
        } catch (err) {
            console.error('Booking sync error:', err);
            setIsDeploying(false);
            setBookingStep(4);
        }
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
        <div className="min-h-screen bg-slate-950 pt-24 pb-16 relative">
            {/* Background elements */}
            <div className="absolute inset-x-0 top-0 h-[60vh] z-0 pointer-events-none">
                <img src={turfData.media[0].url} className="w-full h-full object-cover opacity-10 mix-blend-overlay blur-sm" alt="Background" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950" />
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
                <button
                    onClick={() => navigate('/turfs')}
                    className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-emerald-400 transition-colors mb-8 group"
                >
                    <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    BACK TO PREMIUM VENUES
                </button>

                <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
                    {/* Left Side: Sticky Media Gallery */}
                    <div className="lg:w-[50%] xl:w-[55%]">
                        <div className="sticky top-28 space-y-4">
                            {/* Main Media Display */}
                            <div className="w-full h-[350px] md:h-[500px] rounded-sm overflow-hidden bg-slate-900 border border-white/10 relative group shadow-2xl">
                                {activeMedia.type === 'video' ? (
                                    <div className="w-full h-full relative">
                                        <video
                                            ref={videoRef}
                                            src={activeMedia.url}
                                            className="w-full h-full object-cover"
                                            controls
                                            poster={activeMedia.thumbnail}
                                            autoPlay
                                            muted
                                        />
                                    </div>
                                ) : (
                                    <img src={activeMedia.url} alt={turfData.name} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none rounded-sm" />
                                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 backdrop-blur border border-white/10 rounded-sm">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                                    <span className="text-[10px] font-black tracking-widest text-white uppercase">Live Feed</span>
                                </div>
                                {promo && (
                                    <div className="absolute top-4 right-4 z-20 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded px-3 py-2 flex flex-col shadow-lg pointer-events-none">
                                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-tight flex items-center gap-1.5 leading-none mb-1">
                                            <span className="text-[12px]">{promo.icon}</span> {promo.text.includes('•') ? promo.text.split('•')[0].trim() : 'SPECIAL OFFER'}
                                        </span>
                                        <span className="text-[9px] font-bold text-white uppercase tracking-widest leading-none">
                                            {promo.text.includes('•') ? promo.text.split('•')[1].trim() : promo.text}
                                        </span>
                                    </div>
                                )}

                                {/* Delete active photo/video action */}
                                <button
                                    onClick={handleDeleteActiveMedia}
                                    className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-red-500/80 hover:bg-red-600 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded border border-white/20 transition-all flex items-center gap-1 shadow-lg hover:scale-105 cursor-pointer"
                                    title="Delete this photo/video permanently"
                                >
                                    <span>🗑️ Delete {activeMedia.type === 'video' ? 'Video' : 'Photo'}</span>
                                </button>
                            </div>

                             {/* Thumbnails */}
                            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                {turfData.media.map((media, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedMediaId(i)}
                                        className={`flex-shrink-0 w-24 h-24 rounded-sm overflow-hidden cursor-pointer transition-all relative border ${selectedMediaId === i ? 'border-emerald-500 opacity-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-white/10 opacity-50 hover:opacity-100 hover:border-white/30'
                                            }`}
                                    >
                                        {media.type === 'video' ? (
                                            <div className="w-full h-full relative bg-slate-950">
                                                <video src={media.url} className="w-full h-full object-cover" muted />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="w-8 h-8 rounded-full bg-slate-900/80 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xs pl-0.5">▶</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <img src={media.thumbnail || media.url} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Media Upload / Manage Action */}
                            <button
                                onClick={() => setIsMediaModalOpen(true)}
                                className="w-full py-2.5 px-4 bg-slate-900/90 hover:bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 font-black text-xs uppercase tracking-widest rounded-sm transition-all flex items-center justify-between shadow-lg group cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    <span>📸 🎥</span>
                                    <span>Upload Photos & Videos</span>
                                </span>
                                <span className="text-[10px] bg-emerald-500/20 px-2 py-1 rounded text-emerald-300 font-bold group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                                    + Add / Manage
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Information & Booking */}
                    <div className="lg:w-[50%] xl:w-[45%] pb-20">
                        {/* Header Info */}
                        <div className="mb-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-2">{turfData.name}</h1>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${turfData.coordinates?.lat || 19.1136},${turfData.coordinates?.lng || 72.8697}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-emerald-400 font-medium group transition-colors cursor-pointer"
                                        title="Click to get directions on Google Maps"
                                    >
                                        <HiLocationMarker className="text-emerald-500 shrink-0 w-4 h-4 group-hover:scale-125 transition-transform" />
                                        <span className="underline underline-offset-4 decoration-emerald-500/40 group-hover:decoration-emerald-400">{turfData.location}</span>
                                        <span className="text-[10px] font-bold tracking-widest uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                                            📍 Get Directions ↗
                                        </span>
                                    </a>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 border border-emerald-400 rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                        <HiStar className="w-4 h-4 text-slate-950" />
                                        <span className="text-sm font-black text-slate-950">{turfData.rating}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-2">{turfData.reviews} Reviews</p>
                                </div>
                            </div>

                            <div className="inline-block px-3 py-1 bg-slate-900 border border-white/10 rounded-sm mb-6">
                                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Hours: <span className="text-white">{turfData.timing}</span></span>
                            </div>

                            <p className="text-slate-300 text-sm leading-relaxed mb-8">{turfData.description}</p>
                        </div>

                        <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent mb-8" />

                        {/* Amenities */}
                        <div className="mb-10">
                            <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 mb-5 flex items-center gap-2">
                                <span className="h-px w-4 bg-emerald-500/50" /> FACILITY AMENITIES
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {turfData.amenities.map(a => (
                                    <span key={a} className="px-3 py-1.5 bg-slate-900/50 border border-white/10 text-[10px] font-bold tracking-widest text-slate-300 uppercase rounded-sm hover:border-emerald-500/50 transition-colors">
                                        {a}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Sports & Pricing */}
                        <div className="mb-10">
                            <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 mb-5 flex items-center gap-2">
                                <span className="h-px w-4 bg-emerald-500/50" /> DISCIPLINE PRICING
                            </h2>
                            <div className="overflow-hidden border border-white/10 rounded-sm bg-slate-900/30">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-900 border-b border-white/5">
                                            <th className="text-left px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sport</th>
                                            <th className="text-left px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Standard</th>
                                            <th className="text-left px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Peak Hour</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {turfData.sports.map(s => (
                                            <tr key={s.name} className="hover:bg-slate-800/50 transition-colors">
                                                <td className="px-5 py-4 font-bold text-white text-xs tracking-wider uppercase">{s.name}</td>
                                                <td className="px-5 py-4 text-emerald-400 font-bold tabular-nums">₹{s.price}<span className="text-[10px] text-slate-500 ml-1">/hr</span></td>
                                                <td className="px-5 py-4 text-amber-400 font-bold tabular-nums bg-amber-500/5">₹{s.peakPrice}<span className="text-[10px] text-amber-500/50 ml-1">/hr</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Booking Sector — Clean 4-Step Flow Starting Directly on Date & Time */}
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-sm blur" />
                            <div className="relative bg-slate-950 border border-white/10 rounded-sm p-6 sm:p-8 shadow-2xl space-y-6">
                                
                                {/* Top 4-Step Tab Navigation */}
                                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-white/10">
                                    {[
                                        { num: 1, label: '1. Date & Time' },
                                        { num: 2, label: '2. Payment Mode' },
                                        { num: 3, label: '3. Teams' },
                                        { num: 4, label: '4. Confirm' },
                                    ].map(st => {
                                        const isActive = bookingStep === st.num
                                        const isPast = bookingStep > st.num
                                        return (
                                            <button
                                                key={st.num}
                                                onClick={() => setBookingStep(st.num)}
                                                className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                                                    isActive
                                                        ? 'bg-slate-900 text-white border-2 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                                                        : isPast
                                                            ? 'bg-slate-900 text-slate-300 border border-white/10 hover:border-emerald-500/40'
                                                            : 'bg-slate-950/60 text-slate-500 border border-white/5 hover:text-slate-300'
                                                }`}
                                            >
                                                {isPast && <span className="text-emerald-400">✓</span>}
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
                                                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Pick date & time slot</h2>
                                                <p className="text-xs text-slate-400 mt-0.5">{turfData.name} — {turfData.location} · ₹{turfData.price || 800}/hr</p>
                                            </div>

                                            {/* Duration Selector */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Duration:</span>
                                                <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg p-1">
                                                    {[1, 2, 3].map(hr => (
                                                        <button
                                                            key={hr}
                                                            onClick={() => {
                                                                setDuration(hr)
                                                                setSelectedSlot(null)
                                                            }}
                                                            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                                                duration === hr
                                                                    ? 'bg-white text-slate-950 font-black shadow-sm'
                                                                    : 'text-slate-400 hover:text-white'
                                                            }`}
                                                        >
                                                            {hr} {hr === 1 ? 'Hour' : 'Hours'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Horizontal Date Selector */}
                                        <div>
                                            <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block mb-3">SELECT DATE</label>
                                            <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                                                {dateList.map(d => {
                                                    const isSel = selectedDateObj.id === d.id
                                                    return (
                                                        <button
                                                            key={d.id}
                                                            onClick={() => {
                                                                setSelectedDateObj(d)
                                                                setSelectedDate(d.fullDateString)
                                                            }}
                                                            className={`flex-shrink-0 w-18 py-3 px-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                                                                isSel
                                                                    ? 'bg-slate-900 border-2 border-white text-white shadow-lg'
                                                                    : 'bg-slate-900/60 border border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                                                            }`}
                                                        >
                                                            <span className="text-[10px] font-bold mb-0.5">{d.dayShort}</span>
                                                            <span className={`text-xl font-black my-0.5 ${isSel ? 'text-white' : 'text-slate-200'}`}>{d.dateNum}</span>
                                                            <span className="text-[10px] font-medium mt-0.5">{d.monthShort}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Slot Grid */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">AVAILABLE SLOTS — {selectedDateObj.formattedLabel}</label>
                                                <div className="flex items-center gap-4 text-[9px] uppercase tracking-wider font-bold">
                                                    <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-sm bg-slate-800 border border-white/20" /> Available</span>
                                                    <span className="flex items-center gap-1 text-white"><span className="w-2 h-2 rounded-sm bg-white" /> Selected</span>
                                                    <span className="flex items-center gap-1 text-slate-600"><span className="w-2 h-2 rounded-sm bg-slate-950 border border-white/5" /> Booked</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                                {slots.map(s => {
                                                    const isSel = selectedSlot === s.id
                                                    const isBooked = s.status === 'booked' || s.status === 'blocked'
                                                    return (
                                                        <button
                                                            key={s.id}
                                                            disabled={isBooked}
                                                            onClick={() => handleSelectSlot(s.id)}
                                                            className={`py-3 px-3 rounded-lg text-xs font-bold tracking-wider transition-all text-center ${
                                                                isSel
                                                                    ? 'bg-white text-slate-950 font-black shadow-lg border-2 border-white cursor-pointer'
                                                                    : isBooked
                                                                        ? 'bg-slate-950 text-slate-600 border border-white/5 line-through opacity-40 cursor-not-allowed'
                                                                        : 'bg-slate-900/80 text-slate-200 border border-white/10 hover:border-emerald-500/50 hover:bg-slate-800 cursor-pointer'
                                                            }`}
                                                        >
                                                            <span>{s.time}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            {/* Live Selected Summary */}
                                            <div className="mt-4 text-xs font-medium text-slate-400 flex items-center gap-2">
                                                <span>Selected: </span>
                                                <span className="text-white font-bold">{currentSlot?.time || '18:00'} ({duration} {duration > 1 ? 'Hours' : 'Hour'})</span>
                                                <span className="text-slate-600">·</span>
                                                <span className="text-emerald-400 font-bold">₹{totalRent.toLocaleString('en-IN')} total</span>
                                            </div>
                                        </div>

                                        {/* Bottom Action Bar */}
                                        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                            <button
                                                onClick={() => navigate('/turfs')}
                                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
                                            >
                                                ← Back to All Turfs
                                            </button>

                                            <button
                                                onClick={() => setBookingStep(2)}
                                                className="px-7 py-3 bg-white hover:bg-slate-200 text-slate-950 font-black text-xs uppercase tracking-widest rounded transition-all cursor-pointer shadow-md"
                                            >
                                                Next: Payment mode →
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: PAYMENT MODE */}
                                {bookingStep === 2 && (
                                    <div className="space-y-5 animate-in fade-in">
                                        <div>
                                            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">How do you want to pay?</h2>
                                            <p className="text-xs text-slate-400 mt-0.5">Turf: {turfData.name} · {selectedDateObj.dayShort} {selectedDateObj.dateNum} {selectedDateObj.monthShort} · 6:00 PM · ₹{totalRent.toLocaleString('en-IN')}</p>
                                        </div>

                                        {/* Orange Dashed Banner */}
                                        <div className="border border-dashed border-amber-500/80 bg-amber-500/5 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-slate-200">
                                            <span className="text-base">🎯</span>
                                            <p><span className="font-bold text-amber-400">New on BookMyTurf:</span> Split with opponent, dare them to play, or make loser pay!</p>
                                        </div>

                                        {/* 5 Payment Modes */}
                                        <div className="space-y-2.5">
                                            {[
                                                { id: 'full', icon: '💳', title: 'Mode A: I pay full amount (Baseline)', desc: `Captain pays ₹${totalRent.toLocaleString('en-IN')} upfront. Slot is locked immediately. Opponent is invited for free.` },
                                                { id: 'split-50', icon: '⚖️', title: 'Mode B: Split 50-50 with opponent (Main Request)', desc: `You pay ₹${(totalRent / 2).toLocaleString('en-IN')} now. System sends payment link to opponent captain (2 hr timer to pay or full refund).` },
                                                { id: 'custom', icon: '🎴', title: 'Mode C: Custom split', desc: `You set custom ratio. You pay ₹${myShare.toLocaleString('en-IN')}, Opponent pays ₹${opponentShare.toLocaleString('en-IN')}.` },
                                                { id: 'dare', icon: '🔥', title: 'Mode D: Dare to play — Loser pays all (Gamification)', desc: `Both teams deposit ₹100. Match winner gets full refund. Losing team pays full ₹${totalRent.toLocaleString('en-IN')}. (Draw = split 50-50).` },
                                                { id: 'per-player', icon: '👥', title: 'Mode E: Per player split', desc: `Each player pays individually. E.g. ₹${totalRent.toLocaleString('en-IN')} ÷ 6 players = ₹${Math.round(totalRent / 6)} each.` },
                                            ].map(opt => {
                                                const isSel = paymentMode === opt.id
                                                return (
                                                    <div
                                                        key={opt.id}
                                                        onClick={() => setPaymentMode(opt.id)}
                                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                                            isSel
                                                                ? 'bg-slate-900 border-2 border-white shadow-lg'
                                                                : 'bg-slate-950/60 border-white/10 hover:border-white/20'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-sm">{opt.icon}</div>
                                                            <div>
                                                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{opt.title}</h4>
                                                                <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                                                            </div>
                                                        </div>
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSel ? 'border-white bg-white' : 'border-slate-600'}`}>
                                                            {isSel && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* Custom Split Slider if Custom Selected */}
                                        {paymentMode === 'custom' && (
                                            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-3">
                                                <div className="flex justify-between text-xs font-bold text-white">
                                                    <span>Your Share: ₹{customSplitMyShare}</span>
                                                    <span className="text-slate-400">Opponent Share: ₹{totalRent - customSplitMyShare}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min={100}
                                                    max={totalRent - 100}
                                                    step={50}
                                                    value={customSplitMyShare}
                                                    onChange={(e) => setCustomSplitMyShare(Number(e.target.value))}
                                                    className="w-full accent-emerald-500 cursor-pointer"
                                                />
                                            </div>
                                        )}

                                        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                            <button
                                                onClick={() => setBookingStep(1)}
                                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
                                            >
                                                ← Back
                                            </button>

                                            <button
                                                onClick={() => setBookingStep(3)}
                                                className="px-7 py-3 bg-white hover:bg-slate-200 text-slate-950 font-black text-xs uppercase tracking-widest rounded transition-all cursor-pointer shadow-md"
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
                                            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Team details & invite</h2>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Payment mode: {paymentMode === 'full' ? 'Full Pay' : paymentMode === 'split-50' ? 'Split 50-50' : paymentMode === 'dare' ? 'Dare to Play' : 'Custom Split'} · Total ₹{totalRent.toLocaleString('en-IN')}
                                            </p>
                                        </div>

                                        {/* YOUR TEAM */}
                                        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">YOUR TEAM (TEAM A)</label>
                                            <input
                                                type="text"
                                                value={teamAName}
                                                onChange={e => setTeamAName(e.target.value)}
                                                className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-500"
                                            />

                                            <div className="space-y-2">
                                                {teammates.map(member => (
                                                    <div key={member.id} className="bg-slate-950/80 border border-white/5 rounded p-2.5 flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                                                member.tag === 'You' ? 'bg-blue-600/30 text-blue-400' : 'bg-slate-800 text-slate-400'
                                                            }`}>
                                                                {member.tag}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white">{member.name}</div>
                                                                <div className="text-[10px] text-slate-400">{member.phone} · {member.status === 'Paid' ? `Paid ₹${myShare}` : 'Payment pending'}</div>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                                                            member.status === 'Paid'
                                                                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                                                                : 'bg-amber-950 text-amber-400 border-amber-500/40'
                                                        }`}>
                                                            {member.status}
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
                                                        className="flex-1 bg-slate-950 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                                                    />
                                                    <button
                                                        onClick={handleAddTeammate}
                                                        className="px-3 py-1.5 bg-white text-slate-950 font-bold text-xs rounded hover:bg-slate-200 cursor-pointer"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setShowAddTeammateInput(true)}
                                                    className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-white/5 rounded text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer text-center block mt-1"
                                                >
                                                    + Add teammate
                                                </button>
                                            )}
                                        </div>

                                        {/* OPPONENT TEAM */}
                                        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">OPPONENT TEAM (TEAM B)</label>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setHasOpponentTeam(!hasOpponentTeam)}
                                                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${hasOpponentTeam ? 'bg-white' : 'bg-slate-800'}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${hasOpponentTeam ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                                                    </button>
                                                    <span className="text-[10px] text-slate-300 font-medium">I have opponent</span>
                                                </div>
                                            </div>

                                            {hasOpponentTeam && (
                                                <div className="space-y-2 pt-1">
                                                    <input
                                                        type="text"
                                                        value={teamBName}
                                                        onChange={e => setTeamBName(e.target.value)}
                                                        className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-500"
                                                        placeholder="Opponent team name"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={teamBPhone}
                                                        onChange={e => setTeamBPhone(e.target.value)}
                                                        className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-500"
                                                        placeholder="Opponent captain mobile (+91...)"
                                                    />
                                                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-300">
                                                        📩 An invite link will be sent to the opponent captain via SMS/WhatsApp to pay their share (₹{opponentShare.toLocaleString('en-IN')}).
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Open Challenge Toggle */}
                                        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">DON'T HAVE AN OPPONENT?</label>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setIsOpenChallenge(!isOpenChallenge)}
                                                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${isOpenChallenge ? 'bg-emerald-500' : 'bg-slate-800'}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${isOpenChallenge ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                                                    </button>
                                                    <span className="text-[10px] text-slate-300 font-medium">Open challenge</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-400">
                                                List as "Open challenge" — your match will appear in the public challenge feed.
                                            </p>
                                        </div>

                                        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                            <button
                                                onClick={() => setBookingStep(2)}
                                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
                                            >
                                                ← Back
                                            </button>

                                            <button
                                                disabled={isDeploying}
                                                onClick={handleConfirmAndDeploy}
                                                className="px-7 py-3 bg-white hover:bg-slate-200 text-slate-950 font-black text-xs uppercase tracking-widest rounded transition-all cursor-pointer shadow-md flex items-center gap-2"
                                            >
                                                {isDeploying ? (
                                                    <>
                                                        <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                                        <span>Syncing Booking & Dispatching...</span>
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
                                            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20 font-black text-xl">
                                                ✓
                                            </div>
                                            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Turf booking confirmed!</h2>
                                            <p className="text-xs text-slate-400 mt-0.5">Booking and match invite recorded in MySQL database.</p>
                                        </div>

                                        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-5 space-y-3 text-xs">
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-slate-400">Turf Venue</span>
                                                <span className="text-white font-bold">{turfData.name}, {turfData.location}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-slate-400">Date & Slot</span>
                                                <span className="text-white font-bold">{selectedDateObj.dayShort}, {selectedDateObj.dateNum} {selectedDateObj.monthShort} · {currentSlot?.time || '18:00'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-slate-400">Duration</span>
                                                <span className="text-white font-bold">{duration} {duration > 1 ? 'Hours' : 'Hour'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-slate-400">Total rent</span>
                                                <span className="text-white font-bold">₹{totalRent.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-slate-400">Payment mode</span>
                                                <span className="text-white font-bold">{paymentMode === 'full' ? 'Full Pay (Mode A)' : paymentMode === 'split-50' ? 'Split 50-50 (Mode B)' : paymentMode === 'dare' ? 'Dare to Play (Mode D)' : 'Custom Split (Mode C)'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-slate-400">Your share</span>
                                                <span className="text-emerald-400 font-bold">₹{myShare.toLocaleString('en-IN')} [✓ Paid]</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-slate-400">Opponent share</span>
                                                <span className="text-amber-400 font-bold">₹{opponentShare.toLocaleString('en-IN')} (Pending invite)</span>
                                            </div>
                                            <div className="flex justify-between pt-1">
                                                <span className="text-slate-400">Booking ID</span>
                                                <span className="font-mono font-bold text-emerald-400">{bookingId}</span>
                                            </div>
                                        </div>

                                        {/* Teams Matchup Card */}
                                        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-2 text-xs">
                                            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-white/5">
                                                <span className="font-bold text-white">[A] {teamAName}</span>
                                                <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">Ready</span>
                                            </div>
                                            <div className="text-center text-[10px] font-black text-slate-500">VS</div>
                                            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-white/5">
                                                <span className="font-bold text-white">[B] {hasOpponentTeam ? teamBName : 'Open Challenge'}</span>
                                                <span className="text-amber-400 font-bold text-[10px] bg-amber-950 px-2 py-0.5 rounded border border-amber-500/40">Pending</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4 border-t border-white/10">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard?.writeText(window.location.href);
                                                    if (addToast) addToast('Match link copied to clipboard!', 'info');
                                                }}
                                                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors text-center cursor-pointer"
                                            >
                                                Share match
                                            </button>
                                            <button
                                                onClick={() => navigate('/customer/bookings')}
                                                className="flex-1 py-3 bg-white hover:bg-slate-200 text-slate-950 font-black text-xs uppercase tracking-widest rounded transition-colors text-center cursor-pointer shadow-md"
                                            >
                                                View my matches
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
                <div className="mt-20 space-y-16">

                    {/* ── SECTION: WHAT THIS PLACE OFFERS ── */}
                    <section className="relative">
                        <div className="absolute -top-10 left-[20%] w-[40vw] h-[30vw] bg-emerald-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
                        <SectionLabel accent="emerald">What This Place Offers</SectionLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {features.map((f, i) => (
                                <div
                                    key={i}
                                    className="group bg-slate-900/40 border border-white/[0.06] rounded-xl p-5 flex items-start gap-4 hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(16,185,129,0.08)]"
                                >
                                    <div className="w-11 h-11 bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                                        <f.icon className="w-5 h-5 text-emerald-400/80 group-hover:text-emerald-300 transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase text-white tracking-wider mb-1">{f.label}</h3>
                                        <p className="text-xs text-slate-400 font-bold leading-relaxed">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── SECTION: LOCATION & DIRECTIONS ── */}
                    <section className="relative">
                        <div className="absolute top-0 right-[10%] w-[35vw] h-[35vw] bg-blue-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
                        <SectionLabel accent="blue">Location & Directions</SectionLabel>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            {/* Live Interactive Google Map Embed */}
                            <div className="lg:col-span-3 relative rounded-xl overflow-hidden border border-white/10 bg-slate-900 min-h-[350px] lg:h-auto group shadow-2xl flex flex-col">
                                <iframe
                                    title={`Google Map - ${turfData.name}`}
                                    width="100%"
                                    height="100%"
                                    className="w-full h-full min-h-[320px] rounded-xl border-0 filter contrast-105 brightness-95"
                                    loading="lazy"
                                    allowFullScreen
                                    src={`https://maps.google.com/maps?q=${turfData.coordinates?.lat || 19.1136},${turfData.coordinates?.lng || 72.8697}&t=&z=15&ie=UTF-8&iwloc=&output=embed`}
                                />
                                <div className="p-4 bg-slate-900/90 backdrop-blur border-t border-white/10 flex flex-wrap items-center justify-between gap-3 z-10">
                                    <div className="flex items-center gap-2 text-slate-300 text-xs font-bold truncate max-w-md">
                                        <HiLocationMarker className="text-blue-400 w-5 h-5 shrink-0" />
                                        <span className="truncate">{turfData.fullAddress}</span>
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${turfData.coordinates?.lat || 19.1136},${turfData.coordinates?.lng || 72.8697}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105"
                                    >
                                        <span>Open in Google Maps</span>
                                        <span className="text-base leading-none">↗</span>
                                    </a>
                                </div>
                            </div>

                            {/* Address & Landmarks */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-slate-900/40 border border-white/[0.06] rounded-xl p-6">
                                    <h3 className="text-xs font-black uppercase text-blue-400 tracking-widest mb-4">Full Address</h3>
                                    <p className="text-base text-slate-300 font-bold leading-relaxed">{turfData.fullAddress}</p>
                                </div>

                                <div className="bg-slate-900/40 border border-white/[0.06] rounded-xl p-6">
                                    <h3 className="text-xs font-black uppercase text-blue-400 tracking-widest mb-4">Nearby Landmarks</h3>
                                    <ul className="space-y-3">
                                        {turfData.landmarks.map((lm, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                <span className="text-sm text-slate-300 font-bold">{lm}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-slate-900/40 border border-white/[0.06] rounded-xl p-6">
                                    <h3 className="text-xs font-black uppercase text-blue-400 tracking-widest mb-3">Operating Hours</h3>
                                    <div className="flex items-center gap-3">
                                        <HiClock className="w-5 h-5 text-blue-400" />
                                        <span className="text-base text-white font-bold">{turfData.timing}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-bold mt-2">Open all days including weekends & public holidays</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── SECTION: REVIEWS ── */}
                    <section className="relative">
                        <div className="absolute bottom-0 left-[10%] w-[40vw] h-[30vw] bg-amber-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
                        <SectionLabel accent="amber">Player Reviews</SectionLabel>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Rating Summary Card */}
                            <div className="bg-slate-900/40 border border-white/[0.06] rounded-xl p-7 flex flex-col items-center justify-center text-center">
                                <div className="text-6xl font-black text-white mb-2">{turfData.rating}</div>
                                <div className="flex gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <HiStar key={s} className={`w-5 h-5 ${s <= Math.round(turfData.rating) ? 'text-amber-400' : 'text-slate-700'}`} />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-300 font-bold uppercase tracking-widest mb-6">Based on {totalReviews} reviews</p>

                                {/* Rating Bars */}
                                <div className="w-full space-y-2.5">
                                    {ratingBreakdown.map(r => (
                                        <div key={r.stars} className="flex items-center gap-3">
                                            <span className="text-xs font-black text-slate-400 w-3 text-right">{r.stars}</span>
                                            <HiStar className="w-4 h-4 text-amber-500/60" />
                                            <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
                                                    style={{ width: `${(r.count / totalReviews) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 w-8 text-right">{r.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Individual Reviews */}
                            <div className="lg:col-span-2 space-y-4">
                                {reviewsData.map(r => (
                                    <div key={r.id} className="group bg-slate-900/40 border border-white/[0.06] rounded-xl p-5 hover:border-amber-500/20 transition-all duration-500">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-lg">
                                                    {r.avatar}
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-bold text-white mb-0.5">{r.name}</h4>
                                                    <p className="text-xs text-slate-400 font-bold">{r.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <HiStar key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-amber-400' : 'text-slate-700'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm md:text-base text-slate-300 leading-relaxed font-semibold">{r.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── SECTION: MEET YOUR HOST ── */}
                    <section className="relative pb-10">
                        <div className="absolute top-[20%] right-[5%] w-[35vw] h-[35vw] bg-purple-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
                        <SectionLabel accent="purple">Meet Your Host</SectionLabel>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Host Profile Card */}
                            <div className="bg-slate-900/40 border border-white/[0.06] rounded-xl p-7 flex flex-col items-center text-center relative overflow-hidden group hover:border-purple-500/20 transition-all duration-500">
                                {/* Glow accent */}
                                <div className="absolute -top-[30%] left-[50%] -translate-x-1/2 w-[60%] h-[40%] bg-purple-500/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-purple-500/30 flex items-center justify-center text-3xl mb-4 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative z-10">
                                    {hostData.avatar}
                                </div>

                                <h3 className="text-2xl font-black text-white mb-1 relative z-10">{hostData.name}</h3>

                                <div className="flex items-center gap-2 mb-5 relative z-10">
                                    {hostData.verified && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                                            <HiShieldCheck className="w-3.5 h-3.5" /> Verified
                                        </span>
                                    )}
                                    {hostData.superhost && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full">
                                            <RiShieldStarFill className="w-3.5 h-3.5" /> Superhost
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 w-full mb-6 relative z-10">
                                    <div className="bg-slate-950/60 border border-white/5 rounded-lg p-3">
                                        <div className="text-2xl font-black text-white">{hostData.totalVenues}</div>
                                        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Venues</div>
                                    </div>
                                    <div className="bg-slate-950/60 border border-white/5 rounded-lg p-3">
                                        <div className="text-2xl font-black text-white">{hostData.responseRate}</div>
                                        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Response</div>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-400 font-bold relative z-10">Hosting since {hostData.hostingSince}</p>
                            </div>

                            {/* Host Bio & Contact */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-slate-900/40 border border-white/[0.06] rounded-xl p-6">
                                    <h3 className="text-xs font-black uppercase text-purple-400 tracking-widest mb-4">About the Host</h3>
                                    <p className="text-base text-slate-200 font-semibold leading-relaxed">{hostData.bio}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-slate-900/40 border border-white/[0.06] rounded-xl p-5 flex items-center gap-4 group hover:border-purple-500/20 transition-all duration-500">
                                        <div className="w-11 h-11 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                                            <HiClock className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-0.5">Response Time</h4>
                                            <p className="text-base text-white font-bold">{hostData.responseTime}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/40 border border-white/[0.06] rounded-xl p-5 flex items-center gap-4 group hover:border-purple-500/20 transition-all duration-500">
                                        <div className="w-11 h-11 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                                            <HiPhone className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-0.5">Contact</h4>
                                            <p className="text-base text-white font-bold">{hostData.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/40 border border-white/[0.06] rounded-xl p-5 flex items-center gap-4 group hover:border-purple-500/20 transition-all duration-500">
                                    <div className="w-11 h-11 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                                        <HiMail className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-0.5">Email</h4>
                                        <p className="text-base text-white font-bold">{hostData.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
            {/* Deployment Confirmation Modal */}
            {bookingSuccessModal && deploymentDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-lg p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setBookingSuccessModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <HiX className="w-5 h-5" />
                        </button>

                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mb-4 text-emerald-400 mx-auto">
                            <HiCheckCircle className="w-8 h-8" />
                        </div>

                        <h3 className="text-xl font-black italic text-center text-white tracking-wider uppercase mb-1">
                            DEPLOYMENT CONFIRMED
                        </h3>
                        <p className="text-xs text-center text-emerald-400 font-bold uppercase tracking-widest mb-6">
                            Session Successfully Authorized
                        </p>

                        <div className="bg-slate-950/80 border border-white/10 rounded p-4 space-y-3 mb-6 text-xs font-medium">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Deployment Ref</span>
                                <span className="text-emerald-400 font-mono font-bold">{deploymentDetails.deploymentId}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Discipline</span>
                                <span className="text-white font-bold">{deploymentDetails.sport}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Date & Time</span>
                                <span className="text-white font-bold">{deploymentDetails.date} @ {deploymentDetails.time}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Add-ons Selected</span>
                                <span className="text-white font-bold">{deploymentDetails.addOnsCount} Authorized</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-slate-400 font-bold uppercase">Total Amount</span>
                                <span className="text-emerald-400 text-sm font-black">₹{deploymentDetails.amount}</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    setBookingSuccessModal(false)
                                    navigate('/customer/bookings')
                                }}
                                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black italic tracking-wider text-xs uppercase rounded transition-colors cursor-pointer text-center"
                            >
                                View My Bookings
                            </button>
                            <button
                                onClick={() => {
                                    setBookingSuccessModal(false)
                                    setSelectedSlot(null)
                                }}
                                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer text-center border border-white/10"
                            >
                                Book Another
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Media Upload Modal */}
            <MediaUploadModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                currentMedia={turfData.media}
                onSaveMedia={handleSaveMedia}
            />
        </div>
    )
}
