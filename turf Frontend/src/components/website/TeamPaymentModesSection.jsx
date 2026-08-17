import React, { useState } from 'react'
import { HiCheckCircle, HiSparkles, HiArrowRight, HiShieldCheck } from 'react-icons/hi'
import { FaFire } from 'react-icons/fa'

export default function TeamPaymentModesSection({ onSelectMode, selectedMode = 'full' }) {
    const [activeTab, setActiveTab] = useState('50-50')

    const paymentModes = [
        {
            id: 'dare',
            icon: '🔥',
            bgImage: '/images/dare_match_template.jpg',
            borderColor: 'border-orange-500/60 hover:border-orange-400',
            glowShadow: 'hover:shadow-[0_20px_45px_rgba(249,115,22,0.45)]',
            accentColor: 'text-orange-400',
            title: 'Dare Match — "Dum Hai Toh Harake Dikha!"',
            desc: 'Winner plays 100% FREE! Both teams enter with 30% advance deposit and settle after match result.',
            tableData: [
                { label: 'Winner Rule', val: '100% Free (Refund)', valColor: 'text-emerald-400' },
                { label: 'Loser Rule', val: 'Pays Total Match Fee', valColor: 'text-red-400' },
                { label: 'Advance Entry', val: '30% Refundable Deposit', valColor: 'text-amber-400' },
            ],
            cta: 'Play Dare Match →',
            steps: [
                '1. Both teams deposit 30% security amount to lock match.',
                '2. Play the match at the turf venue.',
                '3. Match winner gets full deposit refund; losing team settles the match fee.'
            ]
        },
        {
            id: 'split-50',
            icon: '🤝',
            bgImage: '/images/split_50_template.jpg',
            borderColor: 'border-emerald-500/60 hover:border-emerald-400',
            glowShadow: 'hover:shadow-[0_20px_45px_rgba(16,185,129,0.45)]',
            accentColor: 'text-emerald-400',
            title: '50:50 Split — "Aadha Bill Tera, Aadha Mera!"',
            desc: 'Both captains pay half (50%) of the booking amount to confirm the slot.',
            tableData: [
                { label: 'Your Share', val: '50% (₹600 of ₹1,200)', valColor: 'text-emerald-400' },
                { label: 'Opponent Share', val: '50% (₹600 of ₹1,200)', valColor: 'text-teal-400' },
                { label: 'Auto Confirm', val: 'Auto WhatsApp Link', valColor: 'text-amber-400' },
            ],
            cta: 'Choose 50-50 →',
            steps: [
                '1. You pay your half share (₹600) to initiate booking.',
                '2. System automatically generates and sends payment link to Opponent Captain.',
                '3. Booking confirms automatically once Opponent completes their share.'
            ]
        },
        {
            id: 'per-player',
            icon: '👥',
            bgImage: '/images/squad_split_template.jpg',
            borderColor: 'border-blue-500/60 hover:border-blue-400',
            glowShadow: 'hover:shadow-[0_20px_45px_rgba(59,130,246,0.45)]',
            accentColor: 'text-blue-400',
            title: 'Squad Split — "Apna Hissa, Khud Bharo!"',
            desc: 'Every player pays their individual share directly using personal UPI payment links.',
            tableData: [
                { label: 'Squad Range', val: '2 to 14 Players', valColor: 'text-blue-400' },
                { label: 'Per Player Cost', val: '₹150 – ₹300 / Head', valColor: 'text-cyan-400' },
                { label: 'UPI Status', val: 'Live Teammate Tracking', valColor: 'text-emerald-400' },
            ],
            cta: 'Split Between Players →',
            steps: [
                '1. Add player count (e.g. 6 players = ₹200/player).',
                '2. Send personal WhatsApp payment links to teammates.',
                '3. Booking completes as required individual payments are collected.'
            ]
        },
        {
            id: 'full',
            icon: '💳',
            bgImage: '/images/full_pay_template.jpg',
            borderColor: 'border-lime-500/60 hover:border-lime-400',
            glowShadow: 'hover:shadow-[0_20px_45px_rgba(132,204,22,0.45)]',
            accentColor: 'text-[#C8FF2E]',
            title: 'Full Pay — "Tera Bhai Dega!"',
            desc: 'Pay complete turf amount upfront now and collect from your team later offline.',
            tableData: [
                { label: 'Booking Speed', val: 'Instant (10s Slot Lock)', valColor: 'text-[#C8FF2E]' },
                { label: 'Upfront Pay', val: '100% Single Captain', valColor: 'text-emerald-400' },
                { label: 'Settlement', val: 'Collect Offline / Cash', valColor: 'text-cyan-400' },
            ],
            cta: 'Choose Full Pay →',
            steps: [
                '1. Pay the total match fee upfront.',
                '2. Turf slot is locked and confirmed instantly.',
                '3. Collect cash/UPI from your teammates at your convenience.'
            ]
        }
    ]

    return (
        <section className="py-12 bg-[#F6F7F4] border-y border-[#E3E8E1] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4FF45]/40 text-[#172019] text-xs font-black uppercase tracking-wider border border-[#B8F52A]">
                        <span>💳 Team Payment System</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black text-[#172019] tracking-tight uppercase">
                        Choose How You Want to Play & Pay
                    </h2>
                    <p className="text-sm text-[#6B746D] font-medium">
                        Flexible team payment options for every match. No confusion, no manual offline math.
                    </p>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {paymentModes.map((mode) => {
                        const isSelected = selectedMode === mode.id
                        return (
                            <div
                                key={mode.id}
                                onClick={() => onSelectMode && onSelectMode(mode.id)}
                                className={`relative overflow-hidden group cursor-pointer rounded-3xl p-5.5 transition-all duration-500 transform hover:-translate-y-2 border-2 flex flex-col justify-between min-h-[350px] ${mode.borderColor} ${mode.glowShadow} ${
                                    isSelected ? 'ring-4 ring-offset-2 ring-emerald-500 shadow-2xl scale-[1.02]' : 'shadow-lg'
                                }`}
                            >
                                {/* Background Image */}
                                <div 
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                                    style={{ backgroundImage: `url('${mode.bgImage}')` }}
                                />
                                {/* Dark Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F0C] via-[#0B0F0C]/90 to-[#0B0F0C]/65 backdrop-blur-[1px]" />

                                <div className="relative z-10 space-y-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/20 flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                                            {mode.icon}
                                        </div>
                                        <h3 className={`text-base font-black uppercase tracking-wide leading-tight ${mode.accentColor}`}>
                                            {mode.title}
                                        </h3>
                                    </div>

                                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                        {mode.desc}
                                    </p>

                                    {/* Table of Details */}
                                    <div className="p-3 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md space-y-1.5 text-[11px]">
                                        {mode.tableData.map((row, rIdx) => (
                                            <div key={rIdx} className="flex justify-between items-center text-slate-300 font-semibold border-b border-white/10 last:border-0 pb-1 last:pb-0">
                                                <span>{row.label}</span>
                                                <span className={`font-black ${row.valColor}`}>{row.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative z-10 pt-4 flex items-center justify-between text-xs font-black text-white group-hover:text-amber-300 transition-colors border-t border-white/15 mt-4">
                                    <span>{mode.cta}</span>
                                    <HiArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* 3-Step Interactive Tab Guide ("How Team Payments Work") */}
                <div className="bg-white rounded-3xl border border-[#E3E8E1] p-6 md:p-8 space-y-6 shadow-xs">
                    <div className="text-center max-w-xl mx-auto space-y-1">
                        <h3 className="text-xl font-black text-[#172019] uppercase tracking-tight">
                            How Team Payments Work
                        </h3>
                        <p className="text-xs text-[#6B746D]">
                            Select a payment mode below to see its 3-step automated flow:
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {paymentModes.map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setActiveTab(m.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                                    activeTab === m.id
                                        ? 'bg-[#172019] text-[#D4FF45] border-[#172019] shadow-sm'
                                        : 'bg-[#F6F7F4] text-[#172019] border-[#E3E8E1] hover:border-[#172019]'
                                }`}
                            >
                                {m.icon} {m.title}
                            </button>
                        ))}
                    </div>

                    {/* Selected Tab Steps */}
                    {(() => {
                        const currentObj = paymentModes.find(m => m.id === activeTab) || paymentModes[1]
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                {currentObj.steps.map((stepText, idx) => (
                                    <div key={idx} className="bg-[#F6F7F4] border border-[#E3E8E1] p-4 rounded-2xl space-y-2">
                                        <span className="w-7 h-7 rounded-xl bg-[#D4FF45]/40 text-[#172019] font-black text-xs flex items-center justify-center border border-[#B8F52A]">
                                            0{idx + 1}
                                        </span>
                                        <p className="text-xs font-extrabold text-[#172019]">
                                            {stepText}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )
                    })()}
                </div>
            </div>
        </section>
    )
}
