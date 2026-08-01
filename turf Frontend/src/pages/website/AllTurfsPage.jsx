import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { HiLocationMarker, HiStar, HiSearch, HiFilter, HiX, HiCheckCircle, HiArrowRight } from 'react-icons/hi'

const allTurfs = [
    { id: 1, name: 'SportZone Arena', location: 'Andheri West, Mumbai', city: 'Mumbai', sport: 'Cricket', sports: ['Cricket'], rating: 4.8, reviews: 124, price: 800, amenities: ['Floodlights', 'Parking', 'Washroom', 'Drinking Water'], image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=1200' },
    { id: 3, name: 'GameVault Center', location: 'Koramangala, Bangalore', city: 'Bangalore', sport: 'Multi-Sport', sports: ['Football', 'Cricket'], rating: 4.9, reviews: 203, price: 1200, amenities: ['Floodlights', 'Parking', 'Washroom', 'Seating', 'Drinking Water'], image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=1200' },
    { id: 4, name: 'ProKick Stadium', location: 'Indiranagar, Bangalore', city: 'Bangalore', sport: 'Football', sports: ['Football'], rating: 4.7, reviews: 156, price: 900, amenities: ['Floodlights', 'Parking', 'Washroom'], image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200' },
    { id: 6, name: 'NetPoint Arena', location: 'NetPoint Arena, Delhi', city: 'Delhi', sport: 'Football', sports: ['Football'], rating: 4.4, reviews: 65, price: 500, amenities: ['Parking', 'Washroom'], image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200' },
    { id: 7, name: 'DunkZone', location: 'Bandra, Mumbai', city: 'Mumbai', sport: 'Football', sports: ['Football'], rating: 4.3, reviews: 48, price: 750, amenities: ['Floodlights', 'Parking'], image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=1200' },
    { id: 8, name: 'PixelArena', location: 'HSR Layout, Bangalore', city: 'Bangalore', sport: 'Multi-Sport', sports: ['Football', 'Cricket'], rating: 4.8, reviews: 178, price: 1500, amenities: ['Floodlights', 'Parking', 'Washroom', 'Seating', 'Drinking Water', 'AC'], image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=1200' },
    { id: 9, name: 'StrikeZone Cricket', location: 'Noida, Delhi', city: 'Delhi', sport: 'Cricket', sports: ['Cricket'], rating: 4.6, reviews: 92, price: 850, amenities: ['Floodlights', 'Parking', 'Washroom', 'Drinking Water'], image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=1200' },
    { id: 10, name: 'Royal Cricket Ground', location: 'Vijay Nagar, Indore', city: 'Indore', sport: 'Cricket', sports: ['Cricket'], rating: 4.7, reviews: 110, price: 600, amenities: ['Floodlights', 'Parking', 'Drinking Water'], image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=1200' },
    { id: 12, name: 'Pune Football Arena', location: 'Kothrud, Pune', city: 'Pune', sport: 'Football', sports: ['Football'], rating: 4.5, reviews: 67, price: 1000, amenities: ['Floodlights', 'Parking', 'Washroom', 'Seating'], image: 'https://images.unsplash.com/photo-1529900245041-3560295ef247?auto=format&fit=crop&q=80&w=1200' },
    { id: 14, name: 'Indore Sports Complex', location: 'LIG Colony, Indore', city: 'Indore', sport: 'Football', sports: ['Football'], rating: 4.9, reviews: 120, price: 800, amenities: ['Floodlights', 'Parking', 'Seating', 'Washroom', 'AC'], image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=1200' },
    { id: 15, name: 'Rajiv Gandhi Stadium Turf', location: 'Navlakha, Indore', city: 'Indore', sport: 'Football', sports: ['Football', 'Cricket'], rating: 4.5, reviews: 88, price: 700, amenities: ['Floodlights', 'Parking', 'Seating', 'Drinking Water'], image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200' },
    { id: 17, name: 'Deccan Arena Football', location: 'Madhapur, Hyderabad', city: 'Hyderabad', sport: 'Football', sports: ['Football'], rating: 4.8, reviews: 90, price: 1100, amenities: ['Floodlights', 'Parking', 'Washroom'], image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200' },
    { id: 18, name: 'Grand Turf Cricket Ground', location: 'OMR, Chennai', city: 'Chennai', sport: 'Cricket', sports: ['Cricket'], rating: 4.7, reviews: 64, price: 950, amenities: ['Floodlights', 'Seating', 'Drinking Water'], image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=1200' },
    { id: 19, name: 'Metro Sports Club', location: 'Vijay Nagar, Indore', city: 'Indore', sport: 'Multi-Sport', sports: ['Football', 'Cricket'], rating: 4.9, reviews: 145, price: 1300, amenities: ['Floodlights', 'Parking', 'Washroom', 'Seating', 'Drinking Water', 'AC'], image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200' },
    { id: 20, name: 'Cyber City Soccer Turf', location: 'Gachibowli, Hyderabad', city: 'Hyderabad', sport: 'Football', sports: ['Football'], rating: 4.6, reviews: 78, price: 1000, amenities: ['Floodlights', 'Parking', 'Washroom'], image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200' },
    { id: 21, name: 'Apex Sports Arena', location: 'Whitefield, Bangalore', city: 'Bangalore', sport: 'Multi-Sport', sports: ['Football', 'Cricket'], rating: 4.8, reviews: 112, price: 1100, amenities: ['Floodlights', 'Parking', 'Washroom', 'Drinking Water'], image: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=1200' },
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
                <div className="w-full px-5 md:px-10 lg:px-20 py-6 sm:py-8">
                    <div className="w-full">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                            <div className="shrink-0">
                                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2 drop-shadow-2xl">
                                    {sport ? `${sport} Turfs` : city ? `Turfs in ${city}` : 'Discover the Best Turfs'}
                                </h1>
                                <p className="text-white/50 text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-[2px] bg-emerald-500 rounded-full" />
                                    {filtered.length} Premium {filtered.length === 1 ? 'Venue' : 'Venues'} available
                                </p>
                            </div>

                            {/* Top Control Bar - Integrated Search */}
                            <div className="flex-1 max-w-3xl w-full bg-white/5 backdrop-blur-3xl border border-white/10 p-1.5 md:p-2 rounded-2xl md:rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-stretch gap-1">
                                <div className="flex-[1.5] relative group">
                                    <HiSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 md:bg-transparent rounded-xl md:rounded-none text-base font-bold text-white placeholder:text-white/20 outline-none focus:ring-0"
                                    />
                                </div>
                                
                                <div className="hidden md:block w-px bg-white/10 my-3" />

                                <div className="flex-1 relative group">
                                    <HiLocationMarker className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-hover:text-emerald-400 transition-colors" />
                                    <select 
                                        value={city} 
                                        onChange={e => setCity(e.target.value)} 
                                        className="w-full pl-12 pr-8 py-3 bg-white/5 md:bg-transparent rounded-xl md:rounded-none text-sm font-bold text-white appearance-none outline-none cursor-pointer focus:bg-slate-900"
                                    >
                                        <option value="" className="bg-slate-900">All Cities</option>
                                        {['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Indore', 'Hyderabad', 'Chennai'].map(c => (
                                            <option key={c} value={c} className="bg-slate-900">{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="hidden md:block w-px bg-white/10 my-3" />

                                <div className="flex-1 relative group">
                                    <HiStar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-hover:text-emerald-400 transition-colors" />
                                    <select 
                                        value={sport} 
                                        onChange={e => setSport(e.target.value)} 
                                        className="w-full pl-12 pr-8 py-3 bg-white/5 md:bg-transparent rounded-xl md:rounded-none text-sm font-bold text-white appearance-none outline-none cursor-pointer focus:bg-slate-900"
                                    >
                                        <option value="" className="bg-slate-900">All Sports</option>
                                        {['Football', 'Cricket', 'Multi-Sport'].map(s => (
                                            <option key={s} value={s} className="bg-slate-900">{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Filters Trigger for Mobile */}
                            <button 
                                onClick={() => setShowFilters(true)}
                                className="lg:hidden flex items-center justify-center gap-2 px-5 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all active:scale-95"
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
                                    {filtered.map((t, i) => (
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
                                                
                                                {/* Top Tags */}
                                                <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                                                    {t.sports.slice(0, 2).map(s => (
                                                        <span key={s} className="px-2.5 py-1 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">{s}</span>
                                                    ))}
                                                </div>

                                                {/* Rating Tag */}
                                                <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-xl shadow-xl shadow-emerald-500/20">
                                                    <HiStar className="w-3.5 h-3.5 text-slate-950" /> {t.rating}
                                                </div>
                                            </div>

                                            {/* Card Content */}
                                            <div className="p-3.5 flex flex-col flex-grow">
                                                <h3 className="text-base font-black text-white mb-1 group-hover:text-emerald-400 transition-colors truncate">{t.name}</h3>
                                                <p className="flex items-center gap-1.5 text-white/40 font-bold text-xs mb-auto truncate">
                                                    <HiLocationMarker className="w-3.5 h-3.5 text-emerald-500" /> {t.location}
                                                </p>

                                                {/* Pricing & CTA */}
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-0.5">Starting At</span>
                                                        <div>
                                                            <span className="text-xl font-black text-white">₹{t.price}</span>
                                                            <span className="text-white/30 text-[10px] font-bold ml-0.5">/hr</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/booking/${t.id}`) }} 
                                                            className="flex items-center gap-1 px-4 py-2.5 bg-emerald-500 text-slate-950 font-black uppercase tracking-wider text-[9px] rounded-xl hover:bg-emerald-400 transition-all active:scale-95 group/btn shadow-lg"
                                                        >
                                                            Book Now <HiArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
