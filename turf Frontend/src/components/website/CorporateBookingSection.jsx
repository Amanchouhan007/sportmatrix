import { useState } from 'react'
import CorporateBookingModal from './CorporateBookingModal'
import { HiOfficeBuilding, HiDocumentText, HiShieldCheck, HiUserGroup, HiLightningBolt } from 'react-icons/hi'
import { IoTrophyOutline } from 'react-icons/io5'

export default function CorporateBookingSection() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <section className="relative py-14 overflow-hidden">
            {/* Background Ambient Glow Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                    {/* Ambient Glow Blob */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-[#C8FF2E]/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        {/* Left Column: Heading & Perks */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest">
                                <HiOfficeBuilding className="text-sm" /> CORPORATE & BULK EVENT HIRE
                            </div>

                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                                Host Your Next <span className="text-[#C8FF2E]">Company League</span> & Sports Day With Us
                            </h2>

                            <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
                                Boost team morale with customized corporate cricket tournaments, employee wellness matches, and weekend box cricket leagues across top box cricket grounds in Indore, Mumbai, and Bangalore.
                            </p>

                            {/* 4 Corporate Perks Grid */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl space-y-1">
                                    <div className="flex items-center gap-2 text-[#10B981] font-black text-xs uppercase">
                                        <HiDocumentText className="text-base" /> GST Tax Invoices
                                    </div>
                                    <p className="text-[11px] text-slate-400">100% tax deductible corporate invoicing with input tax credit support.</p>
                                </div>

                                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl space-y-1">
                                    <div className="flex items-center gap-2 text-[#C8FF2E] font-black text-xs uppercase">
                                        <IoTrophyOutline className="text-base" /> Umpires & Trophies
                                    </div>
                                    <p className="text-[11px] text-slate-400">Official certified umpires, custom trophies & medals included.</p>
                                </div>

                                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl space-y-1">
                                    <div className="flex items-center gap-2 text-[#C8FF2E] font-black text-xs uppercase">
                                        <HiLightningBolt className="text-base" /> Digital Live Scoring
                                    </div>
                                    <p className="text-[11px] text-slate-400">Live mobile scoring, ball-by-ball commentary & video highlights.</p>
                                </div>

                                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl space-y-1">
                                    <div className="flex items-center gap-2 text-[#10B981] font-black text-xs uppercase">
                                        <HiUserGroup className="text-base" /> Catering & Logistics
                                    </div>
                                    <p className="text-[11px] text-slate-400">Food stalls, hydration kits, seating setups & photography team.</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: CTA Box & Quick Stats */}
                        <div className="lg:col-span-5 bg-white/10 backdrop-blur-xl border border-white/15 p-6 sm:p-8 rounded-3xl text-center space-y-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10B981] to-emerald-600 flex items-center justify-center mx-auto text-white text-3xl shadow-lg">
                                🏆
                            </div>

                            <div>
                                <h3 className="text-xl font-black">Ready for a Custom Event Quote?</h3>
                                <p className="text-xs text-slate-300 mt-1">Get custom rates for 20 to 200+ employees with instant proposal support.</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="w-full py-4 bg-[#C8FF2E] hover:bg-[#b8f51a] text-[#111827] font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_6px_25px_rgba(200,255,46,0.35)] transition-all transform hover:scale-[1.02] cursor-pointer"
                            >
                                🏢 Request Corporate Proposal →
                            </button>

                            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                <span>✔ 40+ Corporate Clients</span>
                                <span>•</span>
                                <span>✔ Fast 2-hr Turnaround</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CorporateBookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </section>
    )
}
