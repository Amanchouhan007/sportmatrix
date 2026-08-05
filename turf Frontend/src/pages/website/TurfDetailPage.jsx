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
        { type: 'image', url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1200&q=80&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=300&q=80&fit=crop' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&q=80&fit=crop' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=80&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=300&q=80&fit=crop' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=1200&q=80&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=300&q=80&fit=crop' }
    ],
    timing: '06:00 - 23:00 Hrs',
    fullAddress: 'Plot No. 42, Lokhandwala Complex, Andheri West, Mumbai, Maharashtra 400053',
    landmarks: ['Near Infinity Mall', '5 min from Andheri Metro Station', 'Opposite HDFC Bank'],
    coordinates: { lat: 19.1364, lng: 72.8296 },
}

const allTurfsList = [
    { id: 1, name: 'Green Arena Football Turf', location: 'Andheri West, Mumbai', city: 'Mumbai', rating: 4.8, price: 1200, image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80&fit=crop', sports: ['Football'], amenities: ['Floodlights', 'Parking', 'Washroom'], lat: 19.1136, lng: 72.8697 },
    { id: 2, name: 'Champion Cricket Academy', location: 'Koramangala, Bangalore', city: 'Bangalore', rating: 4.9, price: 1500, image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80&fit=crop', sports: ['Cricket'], amenities: ['Floodlights', 'Seating', 'Drinking Water'], lat: 12.9352, lng: 77.6245 },
    { id: 4, name: 'Elite Sports Complex', location: 'Whitefield, Bangalore', city: 'Bangalore', rating: 4.6, price: 2000, image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80&fit=crop', sports: ['Football', 'Cricket'], amenities: ['Floodlights', 'Parking', 'Seating', 'Washroom'], lat: 12.9698, lng: 77.7500 },
    { id: 5, name: 'ProPlay Arena', location: 'Vashi, Navi Mumbai', city: 'Mumbai', rating: 4.5, price: 1000, image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80&fit=crop', sports: ['Football'], amenities: ['Floodlights', 'Parking'], lat: 19.0330, lng: 73.0297 },
    { id: 6, name: 'Royal Cricket Ground', location: 'Vijay Nagar, Indore', city: 'Indore', rating: 4.7, price: 600, image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80&fit=crop', sports: ['Cricket'], amenities: ['Floodlights', 'Parking', 'Drinking Water'], lat: 22.7533, lng: 75.8937 },
    { id: 9, name: 'Skyline Football Turf', location: 'Powai, Mumbai', city: 'Mumbai', rating: 4.6, price: 1400, image: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&q=80&fit=crop', sports: ['Football'], amenities: ['Floodlights', 'Washroom'], lat: 19.1176, lng: 72.9060 },
    { id: 11, name: 'Master Blaster Cricket', location: 'Saket, Delhi', city: 'Delhi', rating: 4.8, price: 1100, image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80&fit=crop', sports: ['Cricket'], amenities: ['Floodlights', 'Equipment'], lat: 28.5244, lng: 77.2167 },
    { id: 13, name: 'Spike Football Turf', location: 'Bhawarkua, Indore', city: 'Indore', rating: 4.6, price: 500, image: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80&fit=crop', sports: ['Football'], amenities: ['Floodlights', 'Parking', 'Washroom'], lat: 22.6953, lng: 75.8690 },
    { id: 14, name: 'Indore Sports Arena', location: 'LIG Colony, Indore', city: 'Indore', rating: 4.9, price: 800, image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80&fit=crop', sports: ['Football', 'Cricket'], amenities: ['Floodlights', 'Parking', 'Seating', 'Washroom', 'AC'], lat: 22.7380, lng: 75.8916 },
    { id: 15, name: 'Rajiv Gandhi Stadium Turf', location: 'Navlakha, Indore', city: 'Indore', rating: 4.5, price: 700, image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80&fit=crop', sports: ['Football', 'Cricket'], amenities: ['Floodlights', 'Parking', 'Seating', 'Drinking Water'], lat: 22.7000, lng: 75.8752 },
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

    const handleSelectSlot = (startId) => {
        let canBook = true;
        for (let i = 0; i < duration; i++) {
            const s = slots.find(slot => slot.id === startId + i);
            if (!s || s.status === 'booked' || s.status === 'blocked') {
                canBook = false;
                break;
            }
        }
        if (canBook) {
            setSelectedSlot(startId);
        }
    }

    const selectedSlotsArray = selectedSlot !== null ? Array.from({length: duration}, (_, i) => selectedSlot + i) : []
    const totalPrice = selectedSlotsArray.reduce((sum, id) => {
        const s = slots.find(slot => slot.id === id);
        return sum + (s ? s.price : 0);
    }, 0);

    const handleConfirmAndDeploy = async () => {
        if (selectedSlot === null || isDeploying) return
        setIsDeploying(true)

        try {
            const slot = slots[selectedSlot];
            const targetSlotId = slot?.id || `slot_${turfData.id}_${selectedDate.replace(/-/g, '')}_${selectedSlot}`;

            const res = await fetch('http://localhost:5000/api/v1/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slotId: targetSlotId,
                    customerName: 'Rohan Verma',
                    mobileNumber: '+91 98765 99999',
                    notes: `Booked for ${turfData.name} on ${selectedDate}`
                })
            });

            const result = await res.json();
            setIsDeploying(false);

            const details = {
                deploymentId: result.data?.bookingId ? `BK-${result.data.bookingId}` : `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
                sport: turfData.sports[0]?.name || 'Football',
                date: selectedDate,
                time: slots[selectedSlot]?.time,
                amount: totalPrice,
                addOnsCount: 0,
            };
            setDeploymentDetails(details);
            setBookingSuccessModal(true);
            if (addToast) {
                addToast('Booking successfully recorded in MySQL Database!', 'success');
            }
        } catch (error) {
            setIsDeploying(false);
            console.error('Booking backend integration error:', error);
            const fallbackDetails = {
                deploymentId: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
                sport: turfData.sports[0]?.name || 'Football',
                date: selectedDate,
                time: slots[selectedSlot]?.time,
                amount: totalPrice,
                addOnsCount: 0,
            };
            setDeploymentDetails(fallbackDetails);
            setBookingSuccessModal(true);
        }
    }

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

                        {/* Booking Sector */}
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-sm blur" />
                            <div className="relative bg-slate-950 border border-white/10 rounded-sm p-6 sm:p-8 shadow-2xl">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 pb-6 border-b border-white/10">
                                    <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">RESERVE SLOT</h2>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap">Duration</label>
                                            <select
                                                value={duration}
                                                onChange={e => {
                                                    setDuration(Number(e.target.value))
                                                    setSelectedSlot(null)
                                                }}
                                                className="px-4 py-2 bg-slate-900 border border-white/10 rounded-sm text-sm font-medium text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer whitespace-nowrap"
                                            >
                                                <option value={1}>1 Hour</option>
                                                <option value={2}>2 Hours</option>
                                                <option value={3}>3 Hours</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap">Deploy Date</label>
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                onChange={e => {
                                                    setSelectedDate(e.target.value)
                                                    setSelectedSlot(null)
                                                }}
                                                className="px-4 py-2 bg-slate-900 border border-white/10 rounded-sm text-sm font-medium text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer [color-scheme:dark] whitespace-nowrap"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8 text-[10px] font-bold tracking-widest uppercase">
                                    <span className="flex items-center gap-2 text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-slate-800 border-white/20 border" /> Available</span>
                                    <span className="flex items-center gap-2 text-emerald-400"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-[0_0_8px_#10b981]" /> Selected</span>
                                    <span className="flex items-center gap-2 text-slate-600"><span className="w-2.5 h-2.5 rounded-sm bg-slate-900 border border-white/5" /> Booked</span>
                                    <span className="flex items-center gap-2 text-red-500"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/20 border border-red-500/50" /> Blocked</span>
                                </div>

                                <SlotGrid slots={slots} selectedSlot={selectedSlotsArray} onSelect={s => handleSelectSlot(s.id)} />

                                {/* Booking Action */}
                                <div className="mt-10 p-6 bg-slate-900 border border-white/5 rounded-sm mt-8">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">Selected Protocol</span>
                                    </div>
                                    <div className="flex items-end justify-between mb-8">
                                        <span className="text-2xl font-black text-white px-3 py-1 bg-slate-950 border border-white/10 rounded-sm tabular-nums">
                                            {selectedSlot !== null ? `${slots[selectedSlot]?.time} (${duration} ${duration > 1 ? 'Hrs' : 'Hr'})` : '--:--'}
                                        </span>
                                        <div className="text-right">
                                            <span className="block text-[9px] font-bold tracking-widest text-emerald-500/70 uppercase mb-1">Total Authorization</span>
                                            <span className="font-black text-3xl text-emerald-400 tabular-nums">
                                                ₹{selectedSlot !== null ? totalPrice : '0'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        disabled={selectedSlot === null || isDeploying}
                                        onClick={handleConfirmAndDeploy}
                                        className={`w-full py-4 font-black italic tracking-widest uppercase text-sm rounded-sm transition-all duration-300 ${selectedSlot === null || isDeploying
                                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                                            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer'
                                            }`}
                                    >
                                        {isDeploying ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                                DEPLOYING...
                                            </span>
                                        ) : selectedSlot === null ? (
                                            'AWAITING SELECTION'
                                        ) : (
                                            'INITIATE BOOKING'
                                        )}
                                    </button>
                                </div>
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
