import { HiLocationMarker } from 'react-icons/hi'

export default function TurfDirectionsMap({ turfData }) {
    return (
        <section className="relative">
            <h2 className="text-[#16A34A] text-xs font-black uppercase tracking-[0.25em] bg-green-50 border border-green-200 px-4 py-1.5 rounded-full shadow-sm inline-flex items-center gap-2 mb-6">
                <span>⚽</span>
                <span>Location & Directions</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Live Interactive Google Map Embed */}
                <div className="lg:col-span-3 relative rounded-[20px] overflow-hidden border border-[#E5E7EB] bg-white min-h-[350px] lg:h-auto group shadow-sm flex flex-col">
                    <iframe
                        title={`Google Map - ${turfData.name}`}
                        width="100%"
                        height="100%"
                        className="w-full h-full min-h-[320px] rounded-[20px] border-0 filter contrast-105"
                        loading="lazy"
                        allowFullScreen
                        src={`https://maps.google.com/maps?q=${turfData.coordinates?.lat || 19.1136},${turfData.coordinates?.lng || 72.8697}&t=&z=15&ie=UTF-8&iwloc=&output=embed`}
                    />
                    <div className="p-4 bg-white/95 backdrop-blur border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 z-10">
                        <div className="flex items-center gap-2 text-[#111827] text-xs font-bold truncate max-w-md">
                            <HiLocationMarker className="text-[#16A34A] w-5 h-5 shrink-0" />
                            <span className="truncate">{turfData.fullAddress}</span>
                        </div>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${turfData.coordinates?.lat || 19.1136},${turfData.coordinates?.lng || 72.8697}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xs uppercase tracking-wider rounded-full transition-all flex items-center gap-2 shadow-xs border border-[#15803D]"
                        >
                            <span>Open in Google Maps</span>
                            <span className="text-base leading-none">↗</span>
                        </a>
                    </div>
                </div>

                {/* Address & Landmarks */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-6 shadow-xs">
                        <h3 className="text-xs font-black uppercase text-[#16A34A] tracking-widest mb-3">Full Address</h3>
                        <p className="text-sm text-[#111827] font-bold leading-relaxed">{turfData.fullAddress}</p>
                    </div>

                    <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-6 shadow-xs">
                        <h3 className="text-xs font-black uppercase text-[#16A34A] tracking-widest mb-3">Nearby Landmarks</h3>
                        <ul className="space-y-2.5">
                            {turfData.landmarks?.map((lm, i) => (
                                <li key={i} className="flex items-center gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0" />
                                    <span className="text-xs text-[#4B5563] font-bold">{lm}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
