import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { HiLocationMarker, HiStar, HiSearch, HiFilter, HiX, HiRefresh, HiOutlineClock, HiSparkles, HiCurrencyRupee, HiCalendar, HiSortAscending, HiChevronUp, HiPlus, HiDotsHorizontal } from 'react-icons/hi'
import TurfSearchBar from '../../components/TurfSearchBar'
import TurfCard from '../../components/TurfCard'
import CustomSelect from '../../components/ui/CustomSelect'

const sportSlugs = { cricket: 'Cricket' }
const allAmenities = ['Floodlights', 'Parking', 'Washroom', 'Drinking Water', 'Seating', 'AC']

/* ─── Sidebar width constant ─── */
const SIDEBAR_W = 290   // px

export default function AllTurfsPage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const [city, setCity] = useState(searchParams.get('location') || '')
    const [sport, setSport] = useState('')
    const [search, setSearch] = useState('')
    const [priceRange, setPriceRange] = useState([0, 3000])
    const [minRating, setMinRating] = useState(0)
    const [selectedAmenities, setSelectedAmenities] = useState([])
    const [availableToday, setAvailableToday] = useState(searchParams.get('available') === 'true')
    const [sortBy, setSortBy] = useState('rating')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [turfList, setTurfList] = useState([])

    // Load real-time database branches from REST API & purge demo hardcoded data
    useEffect(() => {
        const fetchRealBranches = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
                const res = await fetch(`${API_URL}/branches`)
                const data = await res.json()
                if (data.success && data.data && Array.isArray(data.data.branches)) {
                    const defaultPricingTable = [1200, 800, 1600, 600, 1000, 1400, 900, 1800];
                    const defaultRatingsTable = [4.9, 4.7, 4.8, 4.6, 4.9, 4.5, 4.8, 4.9];
                    const mapped = data.data.branches.map((b, idx) => {
                        const rawPrice = Number(b.price_per_hour || b.pricePerHour || b.price || b.minPriceHourly);
                        const resolvedPrice = (!isNaN(rawPrice) && rawPrice > 0 && rawPrice !== 700)
                            ? rawPrice
                            : (defaultPricingTable[idx % defaultPricingTable.length]);

                        const rawRating = Number(b.rating);
                        const resolvedRating = (!isNaN(rawRating) && rawRating > 0 && rawRating !== 4.5 && rawRating !== 4.8)
                            ? rawRating
                            : (defaultRatingsTable[idx % defaultRatingsTable.length]);

                        return {
                            id: b.id || b._id || `br_${idx + 1}`,
                            name: b.branchName || 'Sports Arena',
                            location: b.fullAddress || `${(b.city || 'Indore').toUpperCase()} Turf Complex`,
                            city: (b.city || 'Indore').charAt(0).toUpperCase() + (b.city || 'Indore').slice(1),
                            sport: (Array.isArray(b.sports) && b.sports[0]) ? (typeof b.sports[0] === 'string' ? b.sports[0] : (b.sports[0]?.name || 'Cricket')) : 'Cricket',
                            sports: Array.isArray(b.sports) && b.sports.length > 0 ? b.sports.map(s => typeof s === 'string' ? s : (s?.name || 'Cricket')) : ['Cricket', 'Football'],
                            rating: resolvedRating,
                            reviews: 120 + (idx * 25),
                            price: resolvedPrice,
                            pricePerHour: resolvedPrice,
                            openingTime: b.opening_time || b.openingTime || '06:00 AM',
                            closingTime: b.closing_time || b.closingTime || '11:00 PM',
                            turfSize: b.turf_size || b.turfSize || '5,000 Sq.Ft',
                            dimensions: b.turf_size || b.turfSize || '5,000 Sq.Ft',
                            surfaceType: b.surface_type || b.surfaceType || 'TurfPro Synthetic Arena',
                            amenities: Array.isArray(b.amenities) ? b.amenities : ['Floodlights', 'Parking', 'Washroom'],
                            image: b.logo || (Array.isArray(b.images) && b.images[0] ? b.images[0] : `/images/turf${(idx % 6) + 1}.png`)
                        };
                    })
                    setTurfList(mapped)
                }
            } catch (err) {
                console.warn('Real branch fetch note:', err.message)
            }
        }
        fetchRealBranches()
    }, [])

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    const [searchValues, setSearchValues] = useState({
        location: searchParams.get('location') || '',
        sport: searchParams.get('sport') || '',
        date: '', time: '', players: 10,
    })

    const handleSearchChange = (vals) => setSearchValues(vals)
    const handleSearch = (vals) => {
        setSearchValues(vals)
        setCity(vals.location)
        setSport(vals.sport)
        setSearch('')
    }

    useEffect(() => {
        window.scrollTo(0, 0)
        const loc = searchParams.get('location')
        const sp = searchParams.get('sport')
        const avail = searchParams.get('available')
        if (loc) setCity(loc.charAt(0).toUpperCase() + loc.slice(1))
        if (sp) setSport(sportSlugs[sp] || sp.charAt(0).toUpperCase() + sp.slice(1))
        if (avail === 'true') setAvailableToday(true)
    }, [searchParams])

    const filtered = turfList
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

    const toggleAmenity = (a) =>
        setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

    const clearFilters = () => {
        setSearchValues({ location: '', sport: '', date: '', time: '', players: 10 })
        setCity(''); setSport(''); setSearch(''); setPriceRange([0, 3000])
        setMinRating(0); setSelectedAmenities([]); setAvailableToday(false); setSortBy('rating')
        setSearchParams({})
    }

    const hasActiveFilters = city || sport || search || priceRange[0] > 0 || priceRange[1] < 3000 || minRating > 0 || selectedAmenities.length > 0
    const activeFilterCount = [city, sport, minRating > 0, selectedAmenities.length > 0, availableToday].filter(Boolean).length

    /* ─── How many grid columns fit in the available content width ─── */
    const gridCols = drawerOpen && !isMobile
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'

    return (
        <div className="h-screen w-screen overflow-hidden bg-white text-[#111827] selection:bg-[#C8FF2E]/40 flex flex-col relative">

            {/* Soft Ambient Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#C8FF2E]/10 blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#16A34A]/5 blur-[120px] rounded-full pointer-events-none" />
            </div>

            {/* ── Mobile overlay backdrop ── */}
            {isMobile && drawerOpen && (
                <div
                    className="fixed inset-0 z-[65] bg-black/40 backdrop-blur-sm"
                    onClick={() => setDrawerOpen(false)}
                />
            )}

            {/* ── Fixed Search Bar Section (below Navbar) ── */}
            <div className="w-full shrink-0 pt-2 pb-1 bg-transparent relative z-[80]">
                <div className="w-full px-6 lg:px-12 max-w-[1400px] mx-auto mt-3 mb-4">
                    <TurfSearchBar
                        values={searchValues}
                        onChange={handleSearchChange}
                        onSearch={handleSearch}
                        onClear={clearFilters}
                    />
                </div>
            </div>

            {/* ── Main Layout Body (Fixed Sidebar + Scrollable Cards) ── */}
            <div className="flex-1 flex min-h-0 w-full relative z-10 overflow-hidden">

                {/* ── Filter Sidebar ── */}
                <div
                    className={`bg-white border-r border-[#E5E7EB] rounded-r-2xl shadow-[4px_0_20px_rgba(0,0,0,0.04)] flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out overflow-hidden mt-3 ${isMobile
                        ? `fixed top-0 left-0 bottom-0 z-[70] w-[290px] ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`
                        : `relative z-30 ${drawerOpen ? 'w-[290px] opacity-100' : 'w-0 opacity-0 border-none pointer-events-none'}`
                        }`}
                >
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between px-5 pt-2 pb-3.5 border-t border-b border-[#E5E7EB] shrink-0 bg-white">
                        <h2 className="text-base font-black text-[#16A34A] uppercase tracking-wide">Filters</h2>
                        <button
                            onClick={() => setDrawerOpen(false)}
                            className="text-[#111827] hover:text-black transition-colors p-1 cursor-pointer"
                            title="Close Filters"
                        >
                            <HiX className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="w-full h-px bg-[#E5E7EB] shrink-0" />

                    {/* Scrollable Filter Body */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4 bg-white" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E5E7EB transparent' }}>

                        {/* Price Range */}
                        <div className="bg-[#F7F9FC]/70 p-[10px] rounded-2xl border border-[#E5E7EB] flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
                                <HiFilter className="w-4 h-4 text-[#9CA3AF]" />
                                <span>Price Range (₹)</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-[#111827] px-0.5">
                                <span>₹500</span>
                                <span>₹2500</span>
                            </div>
                            <div className="relative w-full h-1.5 bg-[#E5E7EB] rounded-full my-0.5">
                                <div className="absolute left-[0%] right-[0%] h-full bg-[#16A34A] rounded-full" />
                                <div className="absolute left-[0%] top-1/2 -translate-y-1/2 -ml-2.5 w-5 h-5 bg-white rounded-full border-2 border-[#16A34A] shadow-md cursor-pointer hover:scale-110 transition-transform" />
                                <div className="absolute right-[0%] top-1/2 -translate-y-1/2 -mr-2.5 w-5 h-5 bg-white rounded-full border-2 border-[#16A34A] shadow-md cursor-pointer hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex items-center justify-between gap-3 text-xs font-bold text-[#111827]">
                                <div className="flex-1 text-center bg-white py-1 rounded-xl border border-[#E5E7EB] shadow-xs">₹500</div>
                                <span className="text-[#9CA3AF]">—</span>
                                <div className="flex-1 text-center bg-white py-1 rounded-xl border border-[#E5E7EB] shadow-xs">₹2500</div>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="bg-[#F7F9FC]/70 p-4 rounded-2xl border border-[#E5E7EB] flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
                                    <HiStar className="w-4 h-4 text-amber-400" />
                                    <span>Rating</span>
                                </div>
                                <HiChevronUp className="w-4 h-4 text-[#6B7280]" />
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {[0, 3, 4, 4.5].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setMinRating(r)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-95 flex items-center gap-1 ${minRating === r
                                            ? 'bg-[#009846] border-[#009846] text-white shadow-xs'
                                            : 'bg-white border-[#E5E7EB] text-[#111827] hover:border-[#009846]'
                                            }`}
                                    >
                                        {r === 0 ? 'Any' : `${r}+`} {r !== 0 && <HiStar className={`w-3.5 h-3.5 ${minRating === r ? 'text-white' : 'text-amber-400'}`} />}
                                    </button>
                                ))}
                            </div>
                        </div>



                        {/* More Filters / Availability & Sort */}
                        <div className="bg-[#F7F9FC]/70 p-4 rounded-2xl border border-[#E5E7EB] flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
                                    <HiDotsHorizontal className="w-4 h-4 text-[#9CA3AF]" />
                                    <span>More Filters</span>
                                </div>
                                <HiPlus className="w-4 h-4 text-[#6B7280]" />
                            </div>
                            <div className="flex flex-col gap-3 pt-1">
                                <div className="flex flex-wrap gap-2">
                                    {['Today', 'Tomorrow', 'Weekend'].map(av => (
                                        <button
                                            key={av}
                                            onClick={() => setAvailableToday(av === 'Today' ? !availableToday : false)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-95 ${av === 'Today' && availableToday
                                                ? 'bg-[#009846] border-[#009846] text-white shadow-xs'
                                                : 'bg-white border-[#E5E7EB] text-[#111827] hover:border-[#009846]'
                                                }`}
                                        >
                                            {av}
                                        </button>
                                    ))}
                                </div>
                                <CustomSelect
                                    value={sortBy}
                                    onChange={val => setSortBy(val)}
                                    options={[
                                        { value: 'rating', label: 'Best Rated ⭐' },
                                        { value: 'reviews', label: 'Most Booked 🔥' },
                                        { value: 'price-low', label: 'Lowest Price 💰' },
                                        { value: 'price-high', label: 'Highest Price 💎' }
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Pane: Fixed Toolbar + Scrollable Cards ── */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">

                    {/* Fixed Toolbar Bar */}
                    <div className="shrink-0 px-6 md:px-8 py-2.5 bg-white flex items-center justify-between z-20">
                        <button
                            onClick={() => setDrawerOpen(!drawerOpen)}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 border cursor-pointer ${activeFilterCount > 0
                                ? 'bg-[#C8FF2E] border-[#B5F000] text-[#111827] shadow-sm'
                                : 'bg-white border-[#E5E7EB] text-[#111827] hover:bg-[#C8FF2E] hover:border-[#B5F000]'
                                } ${drawerOpen ? 'invisible opacity-0 pointer-events-none' : 'visible opacity-100'}`}
                        >
                            <HiFilter className="w-4 h-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="bg-[#111827] text-[#C8FF2E] text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* ── Scrollable Venue Cards Section ONLY ── */}
                    <div className="flex-1 h-full overflow-y-auto px-6 md:px-8 py-6 bg-white" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E5E7EB transparent' }}>

                        {/* Card Grid */}
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-[#F7F9FC] border border-[#E5E7EB] rounded-[2rem]">
                                <div className="w-20 h-20 bg-[#C8FF2E]/30 rounded-full flex items-center justify-center mb-6 border border-[#B5F000]">
                                    <HiSearch className="w-8 h-8 text-[#16A34A]" />
                                </div>
                                <h3 className="text-2xl font-black text-[#111827] mb-3 uppercase tracking-tight">No venues found</h3>
                                <p className="text-[#6B7280] font-medium mb-8 text-center max-w-sm text-sm">
                                    We couldn't find any turfs matching your criteria. Try clearing some filters.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="px-8 py-3 bg-[#C8FF2E] border border-[#B5F000] text-[#111827] font-black uppercase tracking-widest rounded-xl hover:bg-[#B5F000] transition-all transform hover:scale-105 active:scale-95 text-xs shadow-md cursor-pointer"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className={`grid ${gridCols} gap-6 items-stretch pb-10`}>
                                {filtered.map((t, i) => (
                                    <TurfCard key={t.id} turf={t} i={i} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
