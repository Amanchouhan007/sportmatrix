import { useRef } from 'react'

export default function TurfHeroGallery({
    activeMedia,
    turfData,
    selectedMediaId,
    setSelectedMediaId,
    defaultFallbackImage,
    promo
}) {
    const videoRef = useRef(null)

    return (
        <div className="sticky top-28 space-y-4">
            {/* Main Media Display */}
            <div className="w-full h-[350px] md:h-[480px] rounded-[20px] overflow-hidden bg-slate-100 border border-[#E5E7EB] relative group shadow-[0_15px_45px_rgba(0,0,0,0.08)]">
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
                    <img
                        src={activeMedia.url}
                        alt={turfData.name}
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = defaultFallbackImage;
                        }}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md border border-[#E5E7EB] rounded-full shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse shadow-xs" />
                    <span className="text-[10px] font-black tracking-widest text-[#111827] uppercase">Live Feed</span>
                </div>
                {promo && (
                    <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md border border-[#E5E7EB] rounded-2xl px-3 py-2 flex flex-col shadow-xs pointer-events-none">
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-tight flex items-center gap-1.5 leading-none mb-1">
                            <span className="text-[12px]">{promo.icon}</span> {promo.text.includes('•') ? promo.text.split('•')[0].trim() : 'SPECIAL OFFER'}
                        </span>
                        <span className="text-[9px] font-bold text-[#111827] uppercase tracking-widest leading-none">
                            {promo.text.includes('•') ? promo.text.split('•')[1].trim() : promo.text}
                        </span>
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {turfData.media.map((media, i) => (
                    <button
                        key={i}
                        onClick={() => setSelectedMediaId(i)}
                        className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden cursor-pointer transition-all relative border ${
                            selectedMediaId === i 
                                ? 'border-[#16A34A] ring-2 ring-[#16A34A]/20 opacity-100 shadow-sm' 
                                : 'border-[#E5E7EB] opacity-60 hover:opacity-100'
                        }`}
                    >
                        {media.type === 'video' ? (
                            <div className="w-full h-full relative bg-slate-900">
                                <video src={media.url} className="w-full h-full object-cover" muted />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <span className="w-7 h-7 rounded-full bg-white/90 border border-[#E5E7EB] flex items-center justify-center text-[#111827] text-xs pl-0.5 shadow-xs">▶</span>
                                </div>
                            </div>
                        ) : (
                            <img
                                src={media.thumbnail || media.url || defaultFallbackImage}
                                alt={`Thumbnail ${i + 1}`}
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = defaultFallbackImage;
                                }}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
