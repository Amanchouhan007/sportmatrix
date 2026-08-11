import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiSparkles, HiTag, HiFire, HiShieldCheck, HiArrowRight, HiCurrencyDollar, HiCheckCircle } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'
import { OFFER_TEMPLATES } from '../../services/crmService'
import { useAuth } from '../../context/AuthContext'

export default function CustomerOffersFeed() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [filterRole, setFilterRole] = useState('all') // 'all' | 'player' | 'umpire'

    const sampleDeals = [
        {
            id: 'deal_1',
            type: 'Discount Voucher',
            title: '⚡ 20% OFF Morning Cricket Slots',
            badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            desc: 'Book any Cricket or Box Cricket morning slot between 6 AM and 11 AM at SportZone Arena.',
            code: 'MORNING20',
            actionText: 'Book Slot with 20% OFF',
            link: '/booking/1?code=MORNING20',
            forRole: 'player'
        },
        {
            id: 'deal_2',
            type: 'Dare Challenge',
            title: '🔥 Dare to Play — Winner Gets 100% Refund',
            badgeBg: 'bg-[#B8F52A] text-[#121614] border-[#B8F52A]',
            desc: 'Enter the open challenge match with ₹100 deposit. Winning team receives a 100% refund on match fee!',
            code: 'DAREWINTURF',
            actionText: '🔥 Accept Dare & Challenge Team',
            link: '/booking/1?mode=dare',
            forRole: 'player'
        },
        {
            id: 'deal_3',
            type: 'Umpire Earning Slot',
            title: '🚩 Weekend Box Cricket Referee (Payout: ₹500/Match)',
            badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
            desc: 'Official referee required for Saturday night tournament matches at Champion Cricket Ground. Instant cash/UPI payout after match.',
            code: 'UMP-PAYOUT-500',
            actionText: '🚩 Apply for Umpire Slot',
            link: '/booking/2',
            forRole: 'umpire'
        },
        {
            id: 'deal_4',
            type: 'Tournament Registration',
            title: '🏆 Indore Premier Turf Cup (Prize Pool: ₹50,000)',
            badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
            desc: 'Registration open for 16 teams. Entry fee: ₹2,500/Team. Live scoreboards & trophy.',
            code: 'IPL-INDORE-2026',
            actionText: 'Register Team Now',
            link: '/tournaments',
            forRole: 'player'
        }
    ]

    const filteredDeals = sampleDeals.filter(d => filterRole === 'all' || d.forRole === filterRole)

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#172019] via-[#1b261e] to-[#0f1712] text-white p-6 sm:p-8 rounded-3xl border border-emerald-900/50 shadow-xl space-y-3 relative overflow-hidden">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8F52A] text-[#121614] text-xs font-black uppercase tracking-wider border border-[#B8F52A]">
                    <HiSparkles />
                    <span>RECENT OFFERS & EARNING ALERTS</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Exclusive Deals & Referee Earning Opportunities
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
                    Claim live turf promo vouchers, challenge opponent teams in Dare-to-Play matches, or earn ₹500/match as an official umpire!
                </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 max-w-md mx-auto text-xs font-bold shadow-inner">
                <button
                    onClick={() => setFilterRole('all')}
                    className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${filterRole === 'all' ? 'bg-white text-[#16A34A] shadow-md font-black' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    🔥 All Offers
                </button>
                <button
                    onClick={() => setFilterRole('player')}
                    className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${filterRole === 'player' ? 'bg-white text-[#16A34A] shadow-md font-black' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    🏏 Team & Player Deals
                </button>
                <button
                    onClick={() => setFilterRole('umpire')}
                    className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${filterRole === 'umpire' ? 'bg-white text-[#16A34A] shadow-md font-black' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    🚩 Umpire Earning Slots
                </button>
            </div>

            {/* Deals Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredDeals.map((deal) => (
                    <div key={deal.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${deal.badgeBg}`}>
                                    {deal.type}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-slate-400">
                                    CODE: {deal.code}
                                </span>
                            </div>

                            <h3 className="text-lg font-black text-slate-900 leading-snug">
                                {deal.title}
                            </h3>

                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                {deal.desc}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                Verified Offer
                            </span>

                            <button
                                onClick={() => navigate(deal.link)}
                                className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span>{deal.actionText}</span>
                                <HiArrowRight />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
