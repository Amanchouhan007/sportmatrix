import React from 'react'
import { HiLocationMarker } from 'react-icons/hi'

/**
 * TurfSidebarCard — Clean, uncluttered, premium turf venue card for Step 1 sidebar
 */
export default function TurfSidebarCard({
    selectedVenue,
    activePhotoUrl,
    setActivePhotoUrl,
    setGalleryPhotoIndex,
    setIsGalleryModalOpen
}) {
    const gallery = selectedVenue?.gallery || ['/images/turf1.png', '/images/turf2.png', '/images/turf3.png', '/images/turf4.png', '/images/turf5.png']

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-sm space-y-4">
            {/* Main Turf Image with Rating Badge & Gallery Lightbox Trigger */}
            <div
                onClick={() => setIsGalleryModalOpen(true)}
                className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden group cursor-pointer border border-slate-200"
            >
                <img
                    src={activePhotoUrl || selectedVenue?.image || '/images/turf1.png'}
                    alt={selectedVenue?.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.src = '/images/turf1.png' }}
                />
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-[#C8FF2E] text-xs font-black px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1 shadow-md">
                    <span>⭐</span> {selectedVenue?.rating || '4.8'}
                </div>
                <button
                    type="button"
                    className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 shadow-lg transition-all"
                >
                    <span>🖼️</span> <span>View Photos ({gallery.length})</span>
                </button>
            </div>

            {/* Photo Gallery Thumbnails Strip */}
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {gallery.map((img, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => {
                            setActivePhotoUrl(img)
                            setGalleryPhotoIndex(idx)
                            setIsGalleryModalOpen(true)
                        }}
                        className={`relative w-13 h-10 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer group shadow-2xs ${
                            activePhotoUrl === img ? 'border-[#10B981] scale-105 shadow-md' : 'border-slate-200 hover:border-emerald-400 opacity-80 hover:opacity-100'
                        }`}
                    >
                        <img src={img} alt="turf preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </button>
                ))}
            </div>

            {/* Venue Details */}
            <div className="pt-1">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-black text-[#111827] tracking-tight leading-snug">{selectedVenue?.name}</h3>
                    <span className="text-sm font-black text-[#065F46] font-mono">
                        ₹{selectedVenue?.price?.toLocaleString('en-IN')}<span className="text-[10px] text-slate-500 font-sans font-normal">/hr</span>
                    </span>
                </div>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                    <HiLocationMarker className="text-[#10B981] shrink-0" />
                    <span>{selectedVenue?.location}, {selectedVenue?.city || 'Indore'}</span>
                </p>
            </div>

            {/* Direct Square Feet Badge */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <span className="bg-emerald-50 text-[#065F46] border border-emerald-200/90 px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-2xs font-mono">
                    📐 {selectedVenue?.squareFeet || '5,000 sq ft'}
                </span>
            </div>
        </div>
    )
}
