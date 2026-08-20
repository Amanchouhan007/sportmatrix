import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { HiStar, HiLocationMarker, HiOutlineRefresh, HiOutlineArrowsExpand } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: 22.7196,
    lng: 75.8577 // Indore fallback
};

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#022c22" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#059669" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3b82f6" }, { lightness: -50 }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#2563eb" }, { lightness: -40 }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#93c5fd" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#8b5cf6" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3b82f6" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#020617" }] }
];

const createPriceMarker = (price, isHovered) => {
    const bgColor = isHovered ? '#10b981' : '#ffffff';
    const textColor = isHovered ? '#ffffff' : '#0f172a';
    const stroke = isHovered ? '#059669' : '#cbd5e1';
    const width = isHovered ? 72 : 60;
    const height = isHovered ? 34 : 28;
    const textY = isHovered ? 21 : 17;
    const fontSize = isHovered ? 13 : 11;
    const shadow = isHovered ? 'box-shadow: 0 0 15px rgba(16,185,129,0.8)' : 'box-shadow: 0 4px 6px rgba(0,0,0,0.3)';
    
    // Create an SVG data URI
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width + 10}" height="${height + 10}">
        <rect x="5" y="5" width="${width}" height="${height}" rx="${height/2}" fill="${bgColor}" stroke="${stroke}" stroke-width="2" style="${shadow}"/>
        <text x="${width/2 + 5}" y="${textY + 5}" font-family="sans-serif" font-size="${fontSize}" font-weight="900" fill="${textColor}" text-anchor="middle">₹${price}</text>
    </svg>`;
    
    return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
        scaledSize: typeof window !== 'undefined' ? new window.google.maps.Size(width + 10, height + 10) : null,
        anchor: typeof window !== 'undefined' ? new window.google.maps.Point((width + 10)/2, (height + 10)/2) : null,
    };
};

export default function GoogleMapView({ turfs, center, hoveredTurfId, onMarkerClick, radius, onLocateMe }) {
    const navigate = useNavigate();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    });

    const [map, setMap] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(null);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    useEffect(() => {
        if (map && center && !hoveredTurfId) {
            map.panTo(center);
        }
    }, [map, center, hoveredTurfId]);

    useEffect(() => {
        if (hoveredTurfId && map) {
            const turf = turfs.find(t => t.id === hoveredTurfId);
            if (turf && turf.latitude && turf.longitude) {
                map.panTo({ lat: parseFloat(turf.latitude), lng: parseFloat(turf.longitude) });
                // We don't automatically open InfoWindow on hover as requested, just zoom/pan and highlight marker
            }
        }
    }, [hoveredTurfId, turfs, map]);

    const handleMarkerClick = (turf) => {
        setSelectedMarker(turf);
        if (map && turf.latitude && turf.longitude) {
            map.panTo({ lat: parseFloat(turf.latitude), lng: parseFloat(turf.longitude) });
        }
        if (onMarkerClick) {
            onMarkerClick(turf.id);
        }
    };

    const handleFullscreen = () => {
        if (map) {
            const el = map.getDiv();
            if (el.requestFullscreen) {
                el.requestFullscreen();
            }
        }
    };

    const handleReset = () => {
        if (map && center) {
            map.panTo(center);
            map.setZoom(13);
            setSelectedMarker(null);
        }
    };

    if (!isLoaded) return (
        <div className="w-full h-full relative bg-[#0B132B] rounded-2xl overflow-hidden border border-white/10 flex flex-col items-center justify-center p-6 select-none">
            {/* FLOATING GLASS HEADER */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
                <div className="bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 px-4 py-2.5 rounded-2xl shadow-xl flex flex-col gap-0.5">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        {turfs.length} Active Indore Turfs
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Radius: <span className="text-emerald-400">{radius === 'All' ? 'ALL' : `${radius} KM`}</span></span>
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span className="flex items-center gap-0.5 text-slate-300"><HiLocationMarker className="text-emerald-400" /> Indore</span>
                    </div>
                </div>
            </div>

            {/* Interactive Vector Grid of Turfs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg mt-12 z-10">
                {turfs.slice(0, 6).map((turf) => (
                    <button
                        key={turf.id}
                        type="button"
                        onClick={() => {
                            if (onMarkerClick) onMarkerClick(turf.id);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            hoveredTurfId === turf.id
                                ? 'bg-emerald-950/80 border-emerald-400 shadow-lg scale-105 ring-1 ring-emerald-400'
                                : 'bg-slate-900/80 border-white/10 hover:border-emerald-500/50 hover:bg-slate-800'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-black text-white truncate">{turf.name}</span>
                            <span className="text-[10px] font-bold text-amber-400 font-mono">★{turf.rating || '4.8'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span className="text-emerald-400 font-mono">₹{turf.price}/hr</span>
                            <span className="text-slate-500 truncate">{turf.area || 'Indore'}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Ambient Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        </div>
    );

    return (
        <div className="w-full h-full relative">
            <style>{`
                .gm-err-container { display: none !important; }
            `}</style>
            
            {/* FLOATING GLASS HEADER */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col gap-1 pointer-events-auto">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">{turfs.length} Nearby Turfs</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Radius: <span className="text-blue-400">{radius === 'All' ? 'ALL' : `${radius} KM`}</span></span>
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span className="flex items-center gap-0.5"><HiLocationMarker /> Indore</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 pointer-events-auto">
                    <button onClick={onLocateMe} className="bg-slate-900/80 hover:bg-blue-600 backdrop-blur-md border border-white/10 p-2.5 rounded-xl shadow-lg transition-colors group" title="Current Location">
                        <HiLocationMarker className="w-5 h-5 text-slate-300 group-hover:text-white" />
                    </button>
                    <button onClick={handleReset} className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-white/10 p-2.5 rounded-xl shadow-lg transition-colors group" title="Reset View">
                        <HiOutlineRefresh className="w-5 h-5 text-slate-300 group-hover:text-white" />
                    </button>
                    <button onClick={handleFullscreen} className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-white/10 p-2.5 rounded-xl shadow-lg transition-colors group hidden sm:block" title="Fullscreen">
                        <HiOutlineArrowsExpand className="w-5 h-5 text-slate-300 group-hover:text-white" />
                    </button>
                </div>
            </div>

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center || defaultCenter}
                zoom={13}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    styles: darkMapStyle,
                    disableDefaultUI: true,
                    gestureHandling: 'cooperative'
                }}
            >
                {/* User Location Marker */}
                {center && (
                    <Marker 
                        position={center} 
                        icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: '#3b82f6',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 2,
                        }}
                    />
                )}

                {/* Turf Markers with Price Tags */}
                {turfs.map((turf) => {
                    const isHovered = hoveredTurfId === turf.id || (selectedMarker && selectedMarker.id === turf.id);
                    const lat = parseFloat(turf.latitude);
                    const lng = parseFloat(turf.longitude);

                    if (isNaN(lat) || isNaN(lng)) return null;

                    return (
                        <Marker
                            key={turf.id}
                            position={{ lat, lng }}
                            onClick={() => handleMarkerClick(turf)}
                            icon={createPriceMarker(turf.price || 1000, isHovered)}
                            zIndex={isHovered ? 100 : 1}
                        />
                    );
                })}

                {/* Simplified Compact Info Window */}
                {selectedMarker && (
                    <InfoWindow
                        position={{ lat: parseFloat(selectedMarker.latitude), lng: parseFloat(selectedMarker.longitude) }}
                        onCloseClick={() => setSelectedMarker(null)}
                    >
                        <div style={{ margin: '-12px', padding: '4px', maxWidth: '320px', minWidth: '280px' }}>
                            <TurfCardPremium 
                                turf={selectedMarker}
                                isActive={true}
                                onClick={() => navigate(`/turfs/${selectedMarker._id || selectedMarker.slug || selectedMarker.id}`)}
                            />
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
