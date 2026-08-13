import { HiStar } from 'react-icons/hi'

export default function TurfReviewsSection({
    ratingBreakdown,
    totalReviews,
    turfData,
    reviewsList
}) {
    return (
        <section className="relative">
            <h2 className="text-[#16A34A] text-xs font-black uppercase tracking-[0.25em] bg-green-50 border border-green-200 px-4 py-1.5 rounded-full shadow-sm inline-flex items-center gap-2 mb-6">
                <span>⭐</span>
                <span>Ratings & Customer Reviews</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Rating Breakdown Card */}
                <div className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-[20px] p-6 shadow-xs h-fit space-y-6">
                    <div className="text-center pb-4 border-b border-[#E5E7EB]">
                        <div className="text-5xl font-black text-[#111827] tracking-tight mb-1">{turfData.rating}</div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <HiStar key={s} className="w-5 h-5 text-amber-400" />
                            ))}
                        </div>
                        <span className="text-xs text-[#6B7280] font-bold">Based on {totalReviews} Verified Player Reviews</span>
                    </div>

                    <div className="space-y-2.5">
                        {ratingBreakdown.map((r) => {
                            const pct = totalReviews > 0 ? Math.round((r.count / totalReviews) * 100) : 0
                            return (
                                <div key={r.stars} className="flex items-center gap-3 text-xs">
                                    <span className="w-12 font-bold text-[#4B5563] shrink-0">{r.stars} Stars</span>
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#16A34A] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="w-8 font-extrabold text-[#111827] text-right shrink-0">{r.count}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-8 space-y-4">
                    {reviewsList.map((rev) => (
                        <div key={rev.id} className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-xs hover:border-[#16A34A]/30 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                                        {rev.author.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase text-[#111827]">{rev.author}</h4>
                                        <span className="text-[10px] text-[#6B7280] font-bold">{rev.date} · Verified Player</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-black text-amber-800">
                                    <HiStar className="w-3.5 h-3.5 text-amber-500" />
                                    <span>{rev.rating}.0</span>
                                </div>
                            </div>
                            <p className="text-xs text-[#4B5563] font-semibold leading-relaxed pl-13">{rev.comment}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
