import React, { useState } from 'react'
import { HiCheckCircle, HiSparkles, HiArrowRight, HiShieldCheck } from 'react-icons/hi'
import { FaFire } from 'react-icons/fa'

export default function TeamPaymentModesSection({ onSelectMode, selectedMode = 'full' }) {
    const [activeTab, setActiveTab] = useState('50-50')

    const paymentModes = [
        {
            id: 'full',
            icon: '💳',
            badge: 'FASTEST BOOKING',
            badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            title: 'I Pay Full Amount',
            desc: 'Pay the complete turf amount now and collect from your team later offline.',
            example: 'Total: ₹1,200 · You Pay: ₹1,200 · Opponent: ₹0',
            cta: 'Choose Full Pay',
            steps: [
                '1. Pay the total match fee (₹1,200) upfront.',
                '2. Turf slot is locked and confirmed instantly.',
                '3. Collect cash/UPI from your teammates at your convenience.'
            ]
        },
        {
            id: 'split-50',
            icon: '⚖️',
            badge: 'MOST POPULAR',
            badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
            title: 'Split 50-50',
            desc: 'Both teams pay half of the booking amount to confirm the slot.',
            example: 'Total: ₹1,200 · You Pay: ₹600 · Opponent: ₹600',
            cta: 'Choose 50-50',
            steps: [
                '1. You pay your half share (₹600) to initiate booking.',
                '2. System automatically generates and sends payment link to Opponent Captain.',
                '3. Booking confirms automatically once Opponent completes their ₹600 share.'
            ]
        },
        {
            id: 'custom',
            icon: '🎴',
            badge: 'FLEXIBLE RATIO',
            badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
            title: 'Custom Split',
            desc: 'Decide exactly how much each team will pay using a custom ratio slider.',
            example: 'Total: ₹1,200 · Team A: ₹800 (67%) · Team B: ₹400 (33%)',
            cta: 'Create Custom Split',
            steps: [
                '1. Adjust the slider to set custom amounts for both teams.',
                '2. Pay your custom share amount.',
                '3. Opponent team receives link for the exact remaining balance.'
            ]
        },
        {
            id: 'dare',
            icon: '🔥',
            badge: '🔥 CHALLENGE MODE',
            badgeBg: 'bg-[#B8F52A] text-[#121614] font-black border-[#B8F52A]',
            isDare: true,
            title: 'Dare to Play — Loser Pays All',
            desc: 'Both teams enter the challenge with a ₹100 security deposit. Loser pays full match fee!',
            example: 'Winner: Full refund · Loser: Pays ₹1,200 · Draw: Split ₹600 each',
            cta: '🔥 Accept the Dare',
            subText: 'Play first. Settle after the result.',
            steps: [
                '1. Both teams deposit ₹100 security amount to lock match.',
                '2. Play the match at the turf venue.',
                '3. Match winner gets full deposit refund; losing team settles the ₹1,200 match fee.'
            ]
        },
        {
            id: 'per-player',
            icon: '👥',
            badge: 'SPLIT PER PLAYER',
            badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
            title: 'Split Per Player',
            desc: 'Every player pays their individual share using personal payment links.',
            example: 'Total: ₹1,200 · 2 Players: ₹600 each · 4 Players: ₹300 each · 6 Players: ₹200 each',
            cta: 'Split Between Players',
            steps: [
                '1. Add player count (e.g. 6 players = ₹200/player).',
                '2. Send personal WhatsApp payment links to teammates.',
                '3. Booking completes as required individual payments are collected.'
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

                {/* 5 Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paymentModes.map((mode) => {
                        const isSelected = selectedMode === mode.id
                        if (mode.isDare) {
                            return (
                                <div
                                    key={mode.id}
                                    onClick={() => onSelectMode && onSelectMode(mode.id)}
                                    className={`col-span-1 md:col-span-2 lg:col-span-1 relative overflow-hidden group cursor-pointer rounded-3xl p-6 transition-all duration-500 transform hover:-translate-y-1.5 text-white border-2 ${
                                        isSelected ? 'border-[#B8F52A] shadow-2xl ring-4 ring-[#B8F52A]/30' : 'border-[#B8F52A]/70 hover:border-[#B8F52A]'
                                    }`}
                                >
                                    {/* Layer 1: Night Turf Stadium Photo (Ken Burns Pan/Zoom) */}
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center animate-kenburns" 
                                        style={{ backgroundImage: `url('/images/dare_challenge_turf.png')` }} 
                                    />

                                    {/* Layer 2: Dark Athletic Grass Tint Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#121614] via-[#121614]/88 to-[#121614]/75 backdrop-blur-[1.5px]" />

                                    {/* Layer 3: Sweeping Arena Floodlight Beam */}
                                    <div className="absolute top-0 bottom-0 left-0 w-36 bg-gradient-to-r from-transparent via-[#B8F52A]/30 to-transparent animate-stadium-sweep pointer-events-none" />

                                    {/* Layer 4: Pitch Glow Aura */}
                                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#79C943]/25 via-emerald-600/10 to-transparent animate-pitch-pulse pointer-events-none" />

                                    <div className="relative z-10 space-y-4">
                                        <div className="flex justify-between items-start">
                                            {/* Spinning Cricket Leather Ball / Trophy Icon */}
                                            <div className="w-12 h-12 rounded-2xl bg-[#172019] border-2 border-[#B8F52A] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(184,255,42,0.5)] animate-cricket-spin">
                                                🏏
                                            </div>
                                            <span className="text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider bg-[#B8F52A] text-[#121614] border border-[#B8F52A] shadow-md animate-wicket-flash">
                                                🏏 CRICKET CHALLENGE
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
                                                {mode.title}
                                            </h3>
                                            <p className="text-xs text-slate-200 mt-1 line-clamp-2 font-medium">
                                                {mode.desc}
                                            </p>
                                        </div>

                                        {/* Visual Example Box */}
                                        <div className="p-3.5 rounded-2xl bg-black/75 border border-[#B8F52A]/30 text-xs text-slate-200 font-semibold space-y-1 backdrop-blur-md shadow-inner">
                                            <div className="text-[10px] text-[#B8F52A] uppercase font-black tracking-wider flex items-center justify-between">
                                                <span>Match Challenge Terms</span>
                                                <span className="text-amber-400 font-extrabold">₹100 Deposit Each</span>
                                            </div>
                                            <div className="text-white text-[11px] font-bold">{mode.example}</div>
                                        </div>

                                        <div className="pt-2 flex items-center justify-between text-xs font-black text-[#D4FF45] group-hover:text-white transition-colors">
                                            <span>Accept & Challenge Opponent</span>
                                            <HiArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <div
                                key={mode.id}
                                onClick={() => onSelectMode && onSelectMode(mode.id)}
                                className={`relative overflow-hidden group cursor-pointer rounded-3xl p-6 transition-all duration-300 transform hover:-translate-y-1 bg-white border-2 flex flex-col justify-between ${
                                    isSelected 
                                        ? 'border-[#79C943] shadow-xl ring-4 ring-[#79C943]/15' 
                                        : 'border-[#E3E8E1] hover:border-[#79C943]/50 hover:shadow-md'
                                }`}
                            >
                                {/* Subtle Moving Background Light Shimmer */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#F6F7F4]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-moving-gradient pointer-events-none" />

                                <div className="relative z-10 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-2xl bg-[#F6F7F4] border border-[#E3E8E1] flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                                            {mode.icon}
                                        </div>
                                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider border ${mode.badgeBg}`}>
                                            {mode.badge}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-black text-[#172019] uppercase tracking-wide">
                                            {mode.title}
                                        </h3>
                                        <p className="text-xs text-[#6B746D] mt-1 line-clamp-2 font-medium">
                                            {mode.desc}
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-[#F6F7F4] border border-[#E3E8E1] text-xs text-[#172019] font-semibold space-y-1">
                                        <div className="text-[10px] text-[#6B746D] uppercase font-bold">Example Calculation</div>
                                        <div>{mode.example}</div>
                                    </div>
                                </div>

                                <div className="relative z-10 pt-4 flex items-center justify-between text-xs font-bold text-[#172019] group-hover:text-[#79C943] transition-colors border-t border-[#E3E8E1] mt-4">
                                    <span>Select Payment Mode</span>
                                    <HiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
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
