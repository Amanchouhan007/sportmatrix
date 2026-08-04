import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import GoogleMapView from './GoogleMapView';
import TurfCardPremium from './TurfCardPremium';
import { HiOutlineMap, HiOutlineViewList, HiOutlineLocationMarker } from 'react-icons/hi';

const radii = ['All', 1, 3, 5, 10, 20, 50];
const sportsList = ['Football', 'Cricket', 'Badminton', 'Basketball', 'Pickleball'];
const sortOptions = ['Nearest First', 'Price Low to High', 'Price High to Low', 'Highest Rated', 'Newest'];

export default function TurfMapExplorer() {
    const [turfs, setTurfs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [radius, setRadius] = useState(5);
    const [filters, setFilters] = useState({ sport: '', sort: 'Nearest First' });
    const [hoveredTurfId, setHoveredTurfId] = useState(null);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('map_list'); // map_list, map_only, list_only

    const listRef = useRef(null);
    const itemRefs = useRef({});

    const fetchTurfs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let url = 'http://localhost:5000/api/v1/turfs/filter?';
            const params = new URLSearchParams();
            
            if (userLocation) {
                params.append('lat', userLocation.lat);
                params.append('lng', userLocation.lng);
                params.append('radius', radius === 'All' ? 500 : radius);
            }
            if (filters.sport) params.append('sport', filters.sport);
            
            const res = await axios.get(`${url}${params.toString()}`);
            if (res.data.success) {
                let fetchedTurfs = res.data.data;
                
                if (filters.sort === 'Highest Rated') {
                    fetchedTurfs.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
                } else if (filters.sort === 'Price Low to High') {
                    fetchedTurfs.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                } else if (filters.sort === 'Price High to Low') {
                    fetchedTurfs.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                }

                setTurfs(fetchedTurfs);
            }
        } catch (err) {
            console.error('Error fetching turfs:', err);
            setError('Failed to fetch nearby turfs.');
            setTurfs([
                { id: 'mock1', name: 'Elite Sports Complex', city: 'Indore', latitude: 22.7196, longitude: 75.8577, price: 1200, rating: 4.8, distance: 2.1, sports: '["Football", "Cricket"]' },
                { id: 'mock2', name: 'Rajiv Gandhi Stadium Turf', city: 'Indore', latitude: 22.7000, longitude: 75.8752, price: 700, rating: 4.5, distance: 3.2, sports: '["Football"]' },
                { id: 'mock3', name: 'Royal Cricket Ground', city: 'Indore', latitude: 22.7533, longitude: 75.8937, price: 600, rating: 4.7, distance: 4.8, sports: '["Cricket"]' },
                { id: 'mock4', name: 'Spike Football Turf', city: 'Indore', latitude: 22.6953, longitude: 75.8690, price: 500, rating: 4.6, distance: 6.3, sports: '["Football", "Basketball"]' },
                { id: 'mock5', name: 'Indore Sports Arena', city: 'Indore', latitude: 22.7380, longitude: 75.8916, price: 800, rating: 4.9, distance: 7.1, sports: '["Football", "Cricket"]' }
            ]);
        } finally {
            setLoading(false);
        }
    }, [userLocation, radius, filters]);

    const getUserLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => setUserLocation({ lat: 22.7196, lng: 75.8577 })
            );
        } else {
            setUserLocation({ lat: 22.7196, lng: 75.8577 });
        }
    }, []);

    useEffect(() => {
        getUserLocation();
    }, [getUserLocation]);

    useEffect(() => {
        if (userLocation) fetchTurfs();
    }, [fetchTurfs, userLocation]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleMarkerClick = (turfId) => {
        setHoveredTurfId(turfId);
        if (viewMode === 'map_only') {
            setViewMode('map_list'); // Switch to split view to see card
        }
        
        // Use a short timeout to ensure the DOM updates if we just switched view mode
        setTimeout(() => {
            const element = itemRefs.current[turfId];
            if (element && listRef.current) {
                listRef.current.scrollTo({
                    top: element.offsetTop - listRef.current.offsetTop - 8,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    const isMapVisible = viewMode === 'map_list' || viewMode === 'map_only';
    const isListVisible = viewMode === 'map_list' || viewMode === 'list_only';

    const mapWidthClass = viewMode === 'map_list' ? 'lg:w-[55%]' : 'w-full';
    const listWidthClass = viewMode === 'map_list' ? 'lg:w-[45%]' : 'w-full';

    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 my-4 relative z-20">
            {/* Combined Result Header & Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-3 gap-3 bg-slate-900/60 py-2 px-3 lg:px-4 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="hidden lg:block shrink-0">
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Nearby Turfs</h2>
                    <p className="text-[10px] text-slate-400 font-medium">
                        {turfs.length} Results <span className="text-slate-600 mx-1">•</span> Within {radius === 'All' ? 'All ranges' : `${radius} KM`}
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto overflow-x-auto hide-scrollbar scrollbar-hide">
                    {/* Radius */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Radius</span>
                        <select
                            value={radius}
                            onChange={(e) => setRadius(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                            className="bg-slate-950 border border-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl px-2 py-1 focus:outline-none cursor-pointer"
                        >
                            {radii.map(r => (
                                <option key={r} value={r} className="bg-slate-900">{r === 'All' ? 'All' : `${r} KM`}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="w-px h-4 bg-white/10 hidden sm:block shrink-0"></div>

                    {/* Sport */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Sport</span>
                        <select
                            value={filters.sport}
                            onChange={(e) => handleFilterChange('sport', e.target.value)}
                            className="bg-slate-950 border border-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl px-2 py-1 focus:outline-none cursor-pointer"
                        >
                            <option value="" className="bg-slate-900">All</option>
                            {sportsList.map(sport => (
                                <option key={sport} value={sport} className="bg-slate-900">{sport}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-px h-4 bg-white/10 hidden sm:block shrink-0"></div>

                    {/* Sort */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Sort</span>
                        <select
                            value={filters.sort || 'Nearest First'}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                            className="bg-slate-950 border border-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl px-2 py-1 focus:outline-none cursor-pointer"
                        >
                            {sortOptions.map(opt => (
                                <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* View Toggles */}
                    <div className="flex items-center bg-slate-950 border border-white/10 rounded-xl p-1 shrink-0 ml-auto lg:ml-2">
                        <button 
                            onClick={() => setViewMode('map_list')}
                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'map_list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Both
                        </button>
                        <button 
                            onClick={() => setViewMode('map_only')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'map_only' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            title="Map Only"
                        >
                            <HiOutlineMap className="w-3.5 h-3.5" />
                        </button>
                        <button 
                            onClick={() => setViewMode('list_only')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list_only' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            title="List Only"
                        >
                            <HiOutlineViewList className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6 relative bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
                {/* LEFT: MAP */}
                {isMapVisible && (
                    <div className={`w-full ${mapWidthClass} h-[500px] lg:h-[600px] shrink-0 rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.15)] border border-white/10 relative lg:sticky lg:top-[100px] bg-slate-950 p-[21px] transition-all duration-500`}>
                        <div className="w-full h-full rounded-2xl overflow-hidden relative border border-white/5 shadow-inner">
                            <GoogleMapView 
                                turfs={turfs} 
                                center={userLocation} 
                                hoveredTurfId={hoveredTurfId}
                                onMarkerClick={handleMarkerClick}
                                radius={radius}
                                onLocateMe={getUserLocation}
                            />
                        </div>
                    </div>
                )}
                
                {/* RIGHT: LIST */}
                {isListVisible && (
                    <div 
                        ref={listRef}
                        className={`w-full ${listWidthClass} h-[500px] lg:h-[600px] overflow-y-auto pr-3 custom-scrollbar flex flex-col gap-4 relative pb-4 transition-all duration-500`}
                    >
                        <style>{`
                            .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 10px; }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.8); }
                            .scrollbar-hide::-webkit-scrollbar { display: none; }
                            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                        `}</style>
                        
                        {loading && (
                            <div className="absolute inset-0 z-10 flex flex-col gap-3 bg-[#020617]/50 backdrop-blur-sm pt-1">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="w-full h-[140px] bg-slate-800/50 rounded-2xl animate-pulse border border-white/5"></div>
                                ))}
                            </div>
                        )}
                        
                        {!loading && turfs.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900/80 rounded-2xl border border-white/5 backdrop-blur-md">
                                <div className="w-16 h-16 mb-4 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                                    <HiOutlineLocationMarker className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-base font-black text-white uppercase tracking-tight mb-2">No Turf Found</h3>
                                <p className="text-[11px] text-slate-400 mb-6 max-w-[220px] font-medium leading-relaxed">We couldn't find any turfs matching your current filters and radius.</p>
                                <button 
                                    onClick={() => { setRadius('All'); setFilters({sport: '', sort: 'Nearest First'}); }}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_5px_15px_rgba(59,130,246,0.3)] hover:scale-[1.05]"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                        
                        {!loading && turfs.map(turf => (
                            <div key={turf.id} ref={el => itemRefs.current[turf.id] = el}>
                                <TurfCardPremium 
                                    turf={turf} 
                                    isActive={hoveredTurfId === turf.id}
                                    onMouseEnter={() => setHoveredTurfId(turf.id)}
                                    onClick={() => handleMarkerClick(turf.id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
