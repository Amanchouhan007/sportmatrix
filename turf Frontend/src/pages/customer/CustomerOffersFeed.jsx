import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiSparkles, HiArrowRight } from 'react-icons/hi'
import { useToast } from '../../components/ui/Toast'
import { getDiscountOffers } from '../../services/discountService'

export default function CustomerOffersFeed() {
    const navigate = useNavigate()
    const { addToast } = useToast()
    const [offers, setOffers] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchOffers = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await getDiscountOffers({ status: 'Active', limit: 50 })
            setOffers(res.data?.offers || [])
        } catch (err) {
            addToast({ title: 'Load Failed', message: err.message || 'Failed to load offers.', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

    useEffect(() => { fetchOffers() }, [fetchOffers])

    const formatDiscountLabel = (offer) => {
        if (offer.discountType === 'Flat' || offer.discountType === 'Fixed') return `₹${offer.discountValue} OFF`
        return `${offer.discountValue}% OFF`
    }

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#172019] via-[#1b261e] to-[#0f1712] text-white p-6 sm:p-8 rounded-3xl border border-emerald-900/50 shadow-xl space-y-3 relative overflow-hidden">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8F52A] text-[#121614] text-xs font-black uppercase tracking-wider border border-[#B8F52A]">
                    <HiSparkles />
                    <span>ACTIVE OFFERS</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Live Turf Promo Vouchers
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
                    Real discount codes currently active across our partner turfs -- apply them at checkout.
                </p>
            </div>

            {/* Offers Feed */}
            {isLoading ? (
                <div className="py-16 text-center text-slate-400 text-sm font-semibold bg-white rounded-3xl border border-slate-200">Loading offers...</div>
            ) : offers.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm font-semibold bg-white rounded-3xl border border-slate-200">
                    No active offers right now -- check back soon!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {offers.map((offer) => (
                        <div key={offer.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-300">
                                        {formatDiscountLabel(offer)}
                                    </span>
                                    {offer.promoCode && (
                                        <span className="text-[10px] font-mono font-bold text-slate-400">
                                            CODE: {offer.promoCode}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-black text-slate-900 leading-snug">
                                    {offer.title}
                                </h3>

                                {offer.description && (
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                        {offer.description}
                                    </p>
                                )}
                                {offer.turfName && (
                                    <p className="text-[11px] text-slate-500 font-bold">📍 {offer.turfName}</p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                    Active Offer
                                </span>

                                <button
                                    onClick={() => navigate(offer.turfId ? `/turfs/${offer.turfId}` : '/turfs')}
                                    className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <span>Book Now</span>
                                    <HiArrowRight />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
