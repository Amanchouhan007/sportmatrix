import React from 'react'
import { HiX, HiCheck, HiShare, HiClipboardCopy, HiShieldCheck } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'
import { FaWhatsapp, FaFire } from 'react-icons/fa'

/**
 * DareRegistrationModal — Animated Pop-Up triggered when a user registers or selects Dare to Play
 */
export default function DareRegistrationModal({
    isOpen = false,
    onClose,
    teamAName = 'Aman XI',
    teamBName = 'Rohit Warriors',
    totalRent = 1200,
    depositAmount = 100,
    bookingId = 'BK-9842'
}) {
    if (!isOpen) return null

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/booking/invitation?mode=dare` : ''

    const handleWhatsAppShare = () => {
        const text = `🔥 DARE MATCH CHALLENGE INVITATION!\n${teamAName} has dared ${teamBName} to a match at SportTurf!\n\nRules: Both pay ₹100 deposit. Winner gets 100% refund. Loser pays full ₹${totalRent.toLocaleString('en-IN')} match fee!\n\nClick here to accept the dare: ${shareUrl}`
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }

    const handleCopy = () => {
        if (navigator.clipboard && shareUrl) {
            navigator.clipboard.writeText(shareUrl)
            alert('Challenge link copied to clipboard!')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl text-white border-2 border-[#B8F52A] shadow-[0_0_50px_rgba(184,255,42,0.4)] ring-4 ring-[#B8F52A]/20 animate-in zoom-in-95 duration-300">
                {/* Layer 1: Moving Turf Photo (Ken Burns Animation) */}
                <div 
                    className="absolute inset-0 bg-cover bg-center animate-kenburns" 
                    style={{ backgroundImage: `url('/images/dare_challenge_turf.png')` }} 
                />

                {/* Layer 2: Dark Background Base Tint */}
                <div className="absolute inset-0 bg-[#0d1210]/85 backdrop-blur-[1px]" />

                {/* Layer 3: BRIGHT ANIMATED FIERY FLAME AURA */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-600/60 via-amber-500/30 to-transparent animate-fire-flame-pulse pointer-events-none" />

                {/* Layer 4: SWEEPING FIRE LIGHT BEAM */}
                <div className="absolute top-0 bottom-0 left-0 w-40 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent animate-fire-glow-sweep pointer-events-none" />

                {/* Layer 5: RISING GLOWING FIRE EMBERS SPARKS */}
                <div className="absolute bottom-2 left-8 w-3 h-3 rounded-full bg-amber-300 shadow-[0_0_15px_#f59e0b] animate-fire-spark-1 pointer-events-none" />
                <div className="absolute bottom-4 left-1/4 w-3.5 h-3.5 rounded-full bg-orange-500 shadow-[0_0_18px_#f97316] animate-fire-spark-2 pointer-events-none" />
                <div className="absolute bottom-3 left-1/2 w-2.5 h-2.5 rounded-full bg-[#B8F52A] shadow-[0_0_15px_#b8f52a] animate-fire-spark-3 pointer-events-none" />
                <div className="absolute bottom-1 right-1/4 w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_15px_#f43f5e] animate-fire-spark-4 pointer-events-none" />
                <div className="absolute bottom-5 right-8 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-fire-spark-5 pointer-events-none" />

                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:rotate-90"
                >
                    <HiX className="w-5 h-5" />
                </button>

                {/* Content Container */}
                <div className="relative z-10 p-6 sm:p-8 space-y-6 text-center">
                    {/* Header Trophy & Flames Animation */}
                    <div className="relative inline-block">
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 border-2 border-[#B8F52A] flex items-center justify-center shadow-[0_0_30px_rgba(245,166,35,0.6)] animate-bounce">
                            <FaFire className="w-10 h-10 text-white animate-pulse" />
                        </div>
                        <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#B8F52A] text-[#121614] font-black flex items-center justify-center text-xs shadow-md">
                            ⚡
                        </span>
                    </div>

                    <div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#D4FF45] bg-[#D4FF45]/20 px-3.5 py-1 rounded-full border border-[#B8F52A]/50">
                            🔥 DARE CHALLENGE REGISTERED!
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
                            Dare to Play Activated
                        </h2>
                        <p className="text-xs text-slate-300 mt-1 font-medium max-w-sm mx-auto">
                            Ref: <strong className="text-white font-mono">{bookingId}</strong>. Your ₹{depositAmount} entry deposit is secured!
                        </p>
                    </div>

                    {/* VS Pulse Matchup Box */}
                    <div className="grid grid-cols-3 items-center text-center gap-2 bg-black/70 border border-white/20 p-4 rounded-2xl backdrop-blur-md shadow-inner">
                        <div>
                            <div className="text-xs font-black text-[#D4FF45] uppercase tracking-wider">{teamAName}</div>
                            <div className="text-sm font-black text-white mt-1">₹{depositAmount} Deposit</div>
                            <span className="inline-block text-[9px] font-black px-2.5 py-0.5 rounded-full mt-1.5 bg-emerald-500/30 text-emerald-300 border border-emerald-400/50">
                                ✓ PAID
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                            <span className="text-2xl font-black italic tracking-tighter text-[#B8F52A] animate-pulse drop-shadow-[0_0_12px_rgba(184,255,42,0.8)]">
                                VS
                            </span>
                            <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest mt-0.5">LOSER PAYS ALL</span>
                        </div>

                        <div>
                            <div className="text-xs font-black text-amber-400 uppercase tracking-wider">{teamBName}</div>
                            <div className="text-sm font-black text-white mt-1">₹{depositAmount} Deposit</div>
                            <span className="inline-block text-[9px] font-black px-2.5 py-0.5 rounded-full mt-1.5 bg-amber-500/30 text-amber-300 border border-amber-400/50">
                                ⏳ WAITING ACCEPT
                            </span>
                        </div>
                    </div>

                    {/* Quick Rules Box */}
                    <div className="bg-black/50 border border-white/15 rounded-2xl p-3.5 text-xs text-left space-y-1.5 backdrop-blur-md text-slate-200">
                        <div className="text-[10px] font-black uppercase text-[#B8F52A] tracking-wider flex items-center justify-between">
                            <span>📜 Challenge Terms:</span>
                            <span className="text-amber-400">Match Rent: ₹{totalRent.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-300 text-[11px]">
                            <span>🏆 Winner Team:</span> Full ₹{depositAmount} deposit refunded.
                        </div>
                        <div className="flex items-center gap-2 text-rose-300 text-[11px]">
                            <span>💀 Loser Team:</span> Forfeits deposit + pays ₹{totalRent.toLocaleString('en-IN')} rent.
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="space-y-2.5 pt-2">
                        <button
                            type="button"
                            onClick={handleWhatsAppShare}
                            className="w-full py-3.5 rounded-2xl bg-[#B8F52A] hover:bg-[#D4FF45] text-[#121614] font-black text-sm uppercase tracking-wider shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <FaWhatsapp className="w-5 h-5 text-[#121614]" />
                            <span>🔥 Dispatch Challenge via WhatsApp</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/15"
                            >
                                <HiClipboardCopy className="w-4 h-4" />
                                <span>Copy Link</span>
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer border border-white/15"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
