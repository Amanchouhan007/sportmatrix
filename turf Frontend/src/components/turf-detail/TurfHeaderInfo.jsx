import { HiLocationMarker, HiStar } from 'react-icons/hi'

export default function TurfHeaderInfo({
    turfData,
    selectedSport,
    setSelectedSport,
    totalReviews
}) {
    return (
        <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-emerald-50 text-[#16A34A] border border-emerald-200/60 rounded-full">
                            Official Verified Partner Turf
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-slate-900 text-white rounded-full flex items-center gap-1 cursor-pointer">
                            🏢 GST Corporate Invoicing Available
                        </span>
                        {turfData.badge && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full">
                                {turfData.badge}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
                        {turfData.name}
                    </h1>
                    <div className="flex items-center gap-2 text-[#6B7280] text-xs font-semibold mt-2">
                        <HiLocationMarker className="w-4 h-4 text-[#16A34A] shrink-0" />
                        <span>{turfData.location}</span>
                    </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center gap-1.5 bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1.5 rounded-2xl shadow-2xs">
                        <HiStar className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-black text-[#065F46]">{turfData.rating}</span>
                    </div>
                    <span className="text-[10px] text-[#6B7280] font-bold mt-1">({totalReviews} Reviews)</span>
                </div>
            </div>

            {/* Sport Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-[#E5E7EB] pt-2">
                {turfData.sports.map((sport, i) => (
                    <button
                        key={i}
                        onClick={() => setSelectedSport(sport.name)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                            selectedSport === sport.name
                                ? 'bg-[#16A34A] text-white shadow-md shadow-emerald-600/20'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                    >
                        <span>🏏</span>
                        <span>{sport.name}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
