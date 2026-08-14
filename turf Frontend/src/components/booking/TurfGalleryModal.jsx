import React from 'react'

/**
 * TurfGalleryModal — Full-screen Lightbox Photo Gallery Component
 */
export default function TurfGalleryModal({
    isOpen,
    onClose,
    selectedVenue,
    galleryPhotoIndex,
    setGalleryPhotoIndex,
    activePhotoUrl,
    setActivePhotoUrl
}) {
    if (!isOpen) return null

    const gallery = selectedVenue?.gallery || ['/images/turf1.png', '/images/turf2.png', '/images/turf3.png']

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
                    <div>
                        <h3 className="text-lg font-black text-white">{selectedVenue?.name} — Photo Gallery</h3>
                        <p className="text-xs text-slate-400 font-medium">
                            📍 {selectedVenue?.location}, {selectedVenue?.city} · 📐 {selectedVenue?.dimensions || '100 × 50 ft'} ({selectedVenue?.squareFeet || '5,000 sq ft'})
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-lg font-bold transition-all cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Main Lightbox Photo Display */}
                <div className="relative flex-1 bg-black flex items-center justify-center min-h-[360px] p-4 group">
                    <img
                        src={gallery[galleryPhotoIndex] || activePhotoUrl}
                        alt="Turf Gallery"
                        className="max-h-[60vh] max-w-full object-contain rounded-2xl shadow-2xl"
                    />

                    {/* Previous Photo Arrow */}
                    <button
                        type="button"
                        onClick={() => {
                            const newIdx = (galleryPhotoIndex - 1 + gallery.length) % gallery.length
                            setGalleryPhotoIndex(newIdx)
                            setActivePhotoUrl(gallery[newIdx])
                        }}
                        className="absolute left-4 bg-black/60 hover:bg-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all cursor-pointer backdrop-blur-md border border-white/10"
                    >
                        ‹
                    </button>

                    {/* Next Photo Arrow */}
                    <button
                        type="button"
                        onClick={() => {
                            const newIdx = (galleryPhotoIndex + 1) % gallery.length
                            setGalleryPhotoIndex(newIdx)
                            setActivePhotoUrl(gallery[newIdx])
                        }}
                        className="absolute right-4 bg-black/60 hover:bg-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all cursor-pointer backdrop-blur-md border border-white/10"
                    >
                        ›
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                        Photo {galleryPhotoIndex + 1} of {gallery.length}
                    </div>
                </div>

                {/* Thumbnail Selector Bar */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-3 overflow-x-auto">
                    {gallery.map((img, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => {
                                setGalleryPhotoIndex(idx)
                                setActivePhotoUrl(img)
                            }}
                            className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                galleryPhotoIndex === idx ? 'border-[#C8FF2E] scale-110 shadow-lg' : 'border-slate-800 opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img src={img} alt="thumb" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
