import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { HiLocationMarker, HiStar, HiSearch, HiFilter, HiX, HiCheckCircle, HiArrowRight, HiOutlineUserGroup, HiOutlineCalendar, HiOutlineShieldCheck, HiOutlineLocationMarker, HiOutlineClock, HiRefresh } from 'react-icons/hi'
import { FaTrophy } from 'react-icons/fa'

const allTurfs = [
    { id: 1, name: 'SportZone Arena', location: 'Andheri West, Mumbai', city: 'Mumbai', sport: 'Cricket', sports: ['Cricket'], rating: 4.8, reviews: 124, price: 800, amenities: ['Floodlights', 'Parking', 'Washroom', 'Drinking Water'], image: '/images/turf1.png' },
    { id: 3, name: 'GameVault Center', location: 'Koramangala, Bangalore', city: 'Bangalore', sport: 'Multi-Sport', sports: ['Football', 'Cricket'], rating: 4.9, reviews: 203, price: 1200, amenities: ['Floodlights', 'Parking', 'Washroom', 'Seating', 'Drinking Water'], image: '/images/turf2.png' },
    { id: 4, name: 'ProKick Stadium', location: 'Indiranagar, Bangalore', city: 'Bangalore', sport: 'Football', sports: ['Football'], rating: 4.7, reviews: 156, price: 900, amenities: ['Floodlights', 'Parking', 'Washroom'], image: '/images/turf3.png' },
    { id: 6, name: 'NetPoint Arena', location: 'NetPoint Arena, Delhi', city: 'Delhi', sport: 'Football', sports: ['Football'], rating: 4.4, reviews: 65, price: 500, amenities: ['Parking', 'Washroom'], image: '/images/turf4.png' },
    { id: 7, name: 'DunkZone', location: 'Bandra, Mumbai', city: 'Mumbai', sport: 'Football', sports: ['Football'], rating: 4.3, reviews: 48, price: 750, amenities: ['Floodlights', 'Parking'], image: '/images/turf2.png' },
    { id: 8, name: 'PixelArena', location: 'HSR Layout, Bangalore', city: 'Bangalore', sport: 'Multi-Sport', sports: ['Football', 'Cricket'], rating: 4.8, reviews: 178, price: 1500, amenities: ['Floodlights', 'Parking', 'Washroom', 'Seating', 'Drinking Water', 'AC'], image: '/images/turf6.png' },
    { id: 9, name: 'StrikeZone Cricket', location: 'Noida, Delhi', city: 'Delhi', sport: 'Cricket', sports: ['Cricket'], rating: 4.6, reviews: 92, price: 850, amenities: ['Floodlights', 'Parking', 'Washroom', 'Drinking Water'], image: '/images/turf7.png' },
    { id: 10, name: 'Royal Cricket Ground', location: 'Vijay Nagar, Indore', city: 'Indore', sport: 'Cricket', sports: ['Cricket'], rating: 4.7, reviews: 110, price: 600, amenities: ['Floodlights', 'Parking', 'Drinking Water'], image: '/images/turf1.png' },
    { id: 12, name: 'Pune Football Arena', location: 'Kothrud, Pune', city: 'Pune', sport: 'Football', sports: ['Football'], rating: 4.5, reviews: 67, price: 1000, amenities: ['Floodlights', 'Parking', 'Washroom', 'Seating'], image: '/images/turf2.png' },
    { id: 14, name: 'Indore Sports Complex', location: 'LIG Colony, Indore', city: 'Indore', sport: 'Football', sports: ['Football'], rating: 4.9, reviews: 120, price: 800, amenities: ['Floodlights', 'Parking', 'Seating', 'Washroom', 'AC'], image: '/images/turf3.png' },
    { id: 15, name: 'Rajiv Gandhi Stadium Turf', location: 'Navlakha, Indore', city: 'Indore', sport: 'Football', sports: ['Football', 'Cricket'], rating: 4.5, reviews: 88, price: 700, amenities: ['Floodlights', 'Parking', 'Seating', 'Drinking Water'], image: '/images/turf4.png' },
    { id: 17, name: 'Deccan Arena Football', location: 'Madhapur, Hyderabad', city: 'Hyderabad', sport: 'Football', sports: ['Football'], rating: 4.8, reviews: 90, price: 1100, amenities: ['Floodlights', 'Parking', 'Washroom'], image: '/images/turf1.png' },
    { id: 18, name: 'Grand Turf Cricket Ground', location: 'OMR, Chennai', city: 'Chennai', sport: 'Cricket', sports: ['Cricket'], rating: 4.7, reviews: 64, price: 950, amenities: ['Floodlights', 'Seating', 'Drinking Water'], image: '/images/turf6.png' },
    { id: 19, name: 'Metro Sports Club', location: 'Vijay Nagar, Indore', city: 'Indore', sport: 'Multi-Sport', sports: ['Football', 'Cricket'], rating: 4.9, reviews: 145, price: 1300, amenities: ['Floodlights', 'Parking', 'Washroom', 'Seating', 'Drinking Water', 'AC'], image: '/images/turf7.png' },
    { id: 20, name: 'Cyber City Soccer Turf', location: 'Gachibowli, Hyderabad', city: 'Hyderabad', sport: 'Football', sports: ['Football'], rating: 4.6, reviews: 78, price: 1000, amenities: ['Floodlights', 'Parking', 'Washroom'], image: '/images/turf1.png' },
    { id: 21, name: 'Apex Sports Arena', location: 'Whitefield, Bangalore', city: 'Bangalore', sport: 'Multi-Sport', sports: ['Football', 'Cricket'], rating: 4.8, reviews: 112, price: 1100, amenities: ['Floodlights', 'Parking', 'Washroom', 'Drinking Water'], image: '/images/turf4.png' },
]

const sportSlugs = {
    football: 'Football',
    cricket: 'Cricket',
    'multi-sport': 'Multi-Sport',
}

const allAmenities = ['Floodlights', 'Parking', 'Washroom', 'Drinking Water', 'Seating', 'AC']

export default function AllTurfsPage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const [city, setCity] = useState(searchParams.get('location') || '')
    const [sport, setSport] = useState('')
    const [search, setSearch] = useState('')
    const [priceRange, setPriceRange] = useState([0, 3000])
    const [minRating, setMinRating] = useState(0)
    const [selectedAmenities, setSelectedAmenities] = useState([])
    const [availableToday, setAvailableToday] = useState(searchParams.get('available') === 'true' || false)
    const [sortBy, setSortBy] = useState('rating')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
        const loc = searchParams.get('location')
        const sp = searchParams.get('sport')
        const avail = searchParams.get('available')

        if (loc) setCity(loc.charAt(0).toUpperCase() + loc.slice(1))
        if (sp) setSport(sportSlugs[sp] || sp.charAt(0).toUpperCase() + sp.slice(1))
        if (avail === 'true') setAvailableToday(true)
    }, [searchParams])

    const filtered = allTurfs
        .filter(t => {
            if (city && !t.city.toLowerCase().includes(city.toLowerCase())) return false
            if (sport && !t.sports.some(s => s.toLowerCase().includes(sport.toLowerCase())) && !t.sport.toLowerCase().includes(sport.toLowerCase())) return false
            if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.location.toLowerCase().includes(search.toLowerCase())) return false
            if (t.price < priceRange[0] || t.price > priceRange[1]) return false
            if (t.rating < minRating) return false
            if (selectedAmenities.length > 0 && !selectedAmenities.every(a => t.amenities.includes(a))) return false
            return true
        })
        .sort((a, b) => {
            if (sortBy === 'rating') return b.rating - a.rating
            if (sortBy === 'price-low') return a.price - b.price
            if (sortBy === 'price-high') return b.price - a.price
            if (sortBy === 'reviews') return b.reviews - a.reviews
            return 0
        })

    const toggleAmenity = (a) => setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
    const clearFilters = () => {
        setCity(''); setSport(''); setSearch(''); setPriceRange([0, 3000]); setMinRating(0); setSelectedAmenities([]); setAvailableToday(false); setSortBy('rating')
        setSearchParams({})
    }

    const hasActiveFilters = city || sport || search || priceRange[0] > 0 || priceRange[1] < 3000 || minRating > 0 || selectedAmenities.length > 0

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30 overflow-x-clip pt-20">
            {/* Cinematic Background Elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-500/10 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="relative z-10">
                {/* Header Section */}
                <div className="w-full relative overflow-hidden mb-8 border-b border-white/5 bg-[#020617]">
                    {/* The right-side image */}
                    <div className="absolute top-0 right-0 w-full lg:w-[65%] h-full z-0">
                        <img src="https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Turf" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/90 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent lg:hidden" />
                    </div>

                    <div className="w-full px-5 md:px-10 lg:px-20 py-10 sm:pt-20 sm:pb-12 relative z-10">
                        <div className="flex flex-col gap-8">
                            <div className="shrink-0 max-w-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="w-8 h-[2px] bg-emerald-500 rounded-full" />
                                    <span className="text-white/80 text-[11px] font-bold tracking-[0.2em] uppercase">Play. Compete. Win.</span>
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 drop-shadow-2xl leading-[1.05]">
                                    Discover the <br className="hidden md:block" /> Best <span className="text-emerald-400">Turfs</span>
                                </h1>
                                <p className="text-white/70 text-base md:text-lg max-w-md mb-12 leading-relaxed">
                                    Book premium turfs near you and enjoy the best playing experience.
                                </p>
                                
                                {/* Stats */}
                                <div className="flex flex-wrap items-center gap-8 md:gap-12">
                                    <div className="flex items-center gap-3">
                                        <div className="text-emerald-400">
                                            <FaTrophy className="w-7 h-7" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white font-black text-xl leading-tight">200+</span>
                                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Premium Turfs</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-emerald-400">
                                            <HiOutlineUserGroup className="w-8 h-8" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white font-black text-xl leading-tight">10K+</span>
                                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Happy Players</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-emerald-400">
                                            <HiOutlineCalendar className="w-8 h-8" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white font-black text-xl leading-tight">50K+</span>
                                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Bookings</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-emerald-400">
                                            <HiOutlineShieldCheck className="w-8 h-8" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white font-black text-xl leading-tight">100%</span>
                                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Secure</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Search Bar matching screenshot */}
                            <div className="mt-5 max-w-4xl bg-[#080d1a] border border-white/5 p-2 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center gap-2 relative z-20">
                                <div className="flex-[1.5] w-full px-6 py-2 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <HiOutlineLocationMarker className="text-emerald-400 w-[14px] h-[14px]" />
                                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Location</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Explore Venues..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full bg-transparent text-sm font-bold text-white placeholder:text-white/70 outline-none focus:ring-0"
                                    />
                                </div>

                                <div className="hidden md:block w-px h-10 bg-white/5" />

                                <div className="flex-1 w-full px-6 py-2 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <HiOutlineCalendar className="text-emerald-400 w-[14px] h-[14px]" />
                                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Date</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Choose Date"
                                        className="w-full bg-transparent text-sm font-bold text-white placeholder:text-white/70 outline-none focus:ring-0"
                                    />
                                </div>

                                <div className="hidden md:block w-px h-10 bg-white/5" />

                                <div className="flex-1 w-full px-6 py-2 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <HiOutlineClock className="text-emerald-400 w-[14px] h-[14px]" />
                                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Time Slot</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Any Time"
                                        className="w-full bg-transparent text-sm font-bold text-white placeholder:text-white/70 outline-none focus:ring-0"
                                    />
                                </div>

                                <div className="flex items-center gap-3 pr-2 w-full md:w-auto mt-2 md:mt-0 pb-1 md:pb-0 justify-end md:justify-start">
                                    <button onClick={clearFilters} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                                        <HiRefresh className="w-4 h-4" />
                                    </button>
                                    <button className="px-8 py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black uppercase tracking-widest text-xs rounded-full transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                        Search
                                    </button>
                                </div>
                            </div>



                            {/* Filters Trigger for Mobile */}
                            <button
                                onClick={() => setShowFilters(true)}
                                className="lg:hidden flex items-center justify-center gap-2 px-5 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all active:scale-95 w-fit"
                            >
                                <HiFilter className="w-4 h-4 text-emerald-400" /> Filters
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full px-5 md:px-10 lg:px-20 py-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters - Desktop Glass Card */}
                        <div className={`
                              ${showFilters ? 'fixed inset-0 z-50 p-6 bg-slate-950/90 backdrop-blur-md' : 'hidden'} 
                              lg:block lg:w-[260px] lg:shrink-0 lg:bg-transparent lg:p-0 lg:z-auto lg:sticky lg:top-24 h-fit
                          `}>
                            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-4 space-y-10 shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-white uppercase tracking-wider">Filters</h3>
                                    <div className="flex items-center gap-3">
                                        {hasActiveFilters && (
                                            <button onClick={clearFilters} className="text-xs text-red-400 font-black uppercase tracking-widest hover:text-red-300 transition-colors">Clear</button>
                                        )}
                                        <button onClick={() => setShowFilters(false)} className="lg:hidden text-white/60 hover:text-white">
                                            <HiX className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 block">Price / Hr</label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs font-bold">₹</span>
                                            <input type="number" value={priceRange[0]} onChange={e => setPriceRange([+e.target.value, priceRange[1]])} className="w-full pl-6 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:border-emerald-500/50 outline-none transition-all" />
                                        </div>
                                        <span className="text-white/20">–</span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs font-bold">₹</span>
                                            <input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])} className="w-full pl-6 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:border-emerald-500/50 outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 block">Rating</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[0, 3, 4, 4.5].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setMinRating(r)}
                                                className={`flex flex-col items-center justify-center py-3 rounded-2xl text-xs font-black border transition-all ${minRating === r ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                                            >
                                                {r === 0 ? 'Any' : <><HiStar className={`w-3 h-3 mb-1 ${minRating === r ? 'text-white' : 'text-amber-500'}`} /> {r}+</>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort By */}
                                <div>
                                    <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 block">Sort By</label>
                                    <div className="relative group">
                                        <select
                                            value={sortBy}
                                            onChange={e => setSortBy(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-xs font-black text-white hover:border-emerald-500/50 appearance-none outline-none cursor-pointer focus:ring-0 uppercase tracking-wider transition-all"
                                        >
                                            <option value="rating" className="bg-slate-900">Best Rated</option>
                                            <option value="reviews" className="bg-slate-900">Popularity</option>
                                            <option value="price-low" className="bg-slate-900">Price: Low</option>
                                            <option value="price-high" className="bg-slate-900">Price: High</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Mobile apply */}
                                <button onClick={() => setShowFilters(false)} className="lg:hidden w-full py-5 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                                    Show {filtered.length} Venues
                                </button>
                            </div>
                        </div>

                        {/* Turf Grid List */}
                        <div className="flex-1 min-w-0">
                            {/* Quick Filter Chips */}
                            {hasActiveFilters && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {city && <Chip label={city} onRemove={() => setCity('')} icon={<HiLocationMarker className="w-3 h-3" />} />}
                                    {sport && <Chip label={sport} onRemove={() => setSport('')} />}
                                    {minRating > 0 && <Chip label={`${minRating}+ Rating`} onRemove={() => setMinRating(0)} icon={<HiStar className="w-3 h-3" />} />}
                                </div>
                            )}

                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-3xl animate-in fade-in zoom-in duration-700">
                                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20">
                                        <HiSearch className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-4">No venuses found</h3>
                                    <p className="text-white/40 font-medium mb-10 text-center max-w-md">We couldn't find any turfs matching your premium criteria. Try clearing some filters.</p>
                                    <button onClick={clearFilters} className="px-10 py-4 bg-white text-slate-950 font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500 hover:text-white transition-all transform hover:scale-110 active:scale-95">Clear All Filters</button>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {filtered.map((t, i) => {
                                        const turfNameLower = (t.name || '').toLowerCase()
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
                                            <div
                                                key={t.id}
                                                className="group relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-xl overflow-hidden transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] hover:-translate-y-3 flex flex-col h-full cursor-pointer"
                                                style={{ animationDelay: `${i * 100}ms` }}
                                                onClick={() => navigate(`/turfs/${t.id}`)}
                                            >
                                                {/* Card Image */}
                                                <div className="relative h-36 overflow-hidden">
                                                    <img src={t.image} alt={t.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />

                                                    {/* Top Left: Glass Badge Offer */}
                                                    {promo && (
                                                        <div className="absolute top-2.5 left-2.5 z-20 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded px-2 py-1.5 flex flex-col shadow-lg pointer-events-none">
                                                            <span className="text-[8px] font-black text-orange-500 uppercase tracking-tight flex items-center gap-1 leading-none mb-1">
                                                                <span className="text-[9px]">{promo.icon}</span> {promo.text.includes('•') ? promo.text.split('•')[0].trim() : 'SPECIAL OFFER'}
                                                            </span>
                                                            <span className="text-[7.5px] font-bold text-white uppercase tracking-widest leading-none">
                                                                {promo.text.includes('•') ? promo.text.split('•')[1].trim() : promo.text}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Top Tags */}
                                                    <div className={`absolute bottom-3 left-3 flex flex-wrap gap-1.5 ${promo ? 'max-w-[70%]' : ''}`}>
                                                        {t.sports.slice(0, 2).map(s => (
                                                            <span key={s} className="px-2.5 py-1 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">{s}</span>
                                                        ))}
                                                    </div>

                                                    {/* Rating Tag (Top-Right) */}
                                                    <div className="absolute top-3 right-3 z-20 min-w-[48px] flex items-center justify-center gap-1 px-2.5 py-1 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-xl shadow-xl shadow-emerald-500/20">
                                                        <HiStar className="w-3.5 h-3.5 text-slate-950" /> {t.rating}
                                                    </div>
                                                </div>

                                                {/* Card Content */}
                                                <div className="p-3.5 flex flex-col flex-grow">
                                                    <h3 className="text-base font-black text-white mb-1 group-hover:text-emerald-400 transition-colors truncate">{t.name}</h3>
                                                    <p className="flex items-center gap-1.5 text-white/40 font-bold text-xs mb-1 truncate">
                                                        <HiLocationMarker className="w-3.5 h-3.5 text-emerald-500" /> {t.location}
                                                    </p>

                                                    {/* Pricing & CTA */}
                                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-0.5">Starting At</span>
                                                            <div>
                                                                <span className="text-xl font-black text-white">₹{t.price}</span>
                                                                <span className="text-white/30 text-[10px] font-bold ml-0.5">/hr</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); navigate(`/turfs/${t.id}`) }}
                                                                className="flex items-center gap-1 px-4 py-2.5 bg-emerald-500 text-slate-950 font-black uppercase tracking-wider text-[9px] rounded-xl hover:bg-emerald-400 transition-all active:scale-95 group/btn shadow-lg"
                                                            >
                                                                Book Now <HiArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Chip({ label, onRemove, icon }) {
    return (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500/20 transition-all">
            {icon && icon} {label}
            <HiX className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" onClick={onRemove} />
        </span>
    )
}
