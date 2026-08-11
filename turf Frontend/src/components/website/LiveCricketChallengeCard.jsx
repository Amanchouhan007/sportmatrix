import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiX, HiArrowRight, HiShieldCheck, HiLocationMarker, HiClock } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'
import { FaFire } from 'react-icons/fa'

/**
 * LiveCricketChallengeCard — High impact floating/front challenge card with real cricket playing photo background
 */
export default function LiveCricketChallengeCard({
    challengerTeam = 'Aman XI Warriors',
    venueName = 'SportZone Arena',
    matchTime = 'Tonight, 8:00 PM - 9:00 PM',
    matchFee = 1200,
    depositFee = 100,
    sportName = 'Cricket',
    onDismiss
}) {
    const navigate = useNavigate()
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    const handleAcceptChallenge = () => {
        navigate('/booking/1?mode=dare&pay=opponent')
    }

    const handleDismiss = () => {
        setIsVisible(false)
        if (onDismiss) onDismiss()
    }

    return (
        <div className="relative overflow-hidden rounded-3xl text-white border-2 border-[#B8F52A] shadow-[0_0_40px_rgba(184,255,42,0.35)] ring-4 ring-[#B8F52A]/20 transition-all duration-500 group">
            {/* Real Cricket Action Playing Photo (Ken Burns Pan/Zoom Motion) */}
            <div 
                className="absolute inset-0 bg-cover bg-center animate-kenburns" 
                style={{ backgroundImage: `url('/images/cricket_match_action.png')` }} 
            />

            {/* Dark Athletic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121614] via-[#121614]/90 to-[#121614]/75 backdrop-blur-[1.5px]" />

            {/* Sweeping Arena Floodlight Beam */}
            <div className="absolute top-0 bottom-0 left-0 w-40 bg-gradient-to-r from-transparent via-[#B8F52A]/35 to-transparent animate-stadium-sweep pointer-events-none" />

            {/* Pitch Glow Aura */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#79C943]/30 via-emerald-600/10 to-transparent animate-pitch-pulse pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 p-5 md:p-6 space-y-4">
                {/* Header Badge & Close */}
                <div className="flex items-center justify-between border-b border-white/15 pb-3.5">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#B8F52A] animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-widest bg-[#B8F52A] text-[#121614] px-3 py-0.5 rounded-full shadow-md animate-wicket-flash">
                            ⚡ LIVE CRICKET CHALLENGE ISSUED!
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="w-7 h-7 rounded-full bg-black/60 border border-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:rotate-90"
                    >
                        <HiX className="w-4 h-4" />
                    </button>
                </div>

                {/* Challenge Title & Teams Matchup */}
                <div>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <HiLocationMarker className="w-3.5 h-3.5" /> {venueName}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase mt-0.5">
                        {challengerTeam} <span className="text-[#B8F52A]">DARES YOU!</span>
                    </h3>
                </div>

                {/* VS Matchup Box */}
                <div className="grid grid-cols-3 items-center text-center gap-2 bg-black/70 border border-[#B8F52A]/40 p-3.5 rounded-2xl backdrop-blur-md shadow-inner">
                    <div>
                        <div className="text-xs font-black text-[#D4FF45] uppercase tracking-wider">{challengerTeam}</div>
                        <div className="text-xs font-black text-white mt-0.5">₹{depositFee} Deposit</div>
                        <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded-full mt-1 bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                            ✓ PAID
                        </span>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl font-black italic tracking-tighter text-[#B8F52A] animate-pulse drop-shadow-[0_0_12px_rgba(184,255,42,0.8)]">
                            VS
                        </span>
                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">LOSER PAYS ALL</span>
                    </div>

                    <div>
                        <div className="text-xs font-black text-amber-400 uppercase tracking-wider">YOUR TEAM</div>
                        <div className="text-xs font-black text-white mt-0.5">₹{depositFee} Deposit</div>
                        <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded-full mt-1 bg-amber-500/30 text-amber-300 border border-amber-400/40">
                            ⏳ OPEN CHALLENGE
                        </span>
                    </div>
                </div>

                {/* Challenge Terms */}
                <div className="bg-black/50 border border-white/15 rounded-xl p-3 text-xs flex justify-between items-center backdrop-blur-md">
                    <div>
                        <span className="text-[10px] text-[#B8F52A] uppercase font-black block">Challenge Rule</span>
                        <span className="text-slate-200 font-semibold text-[11px]">
                            Winner gets full deposit refunded. Loser pays ₹{matchFee.toLocaleString('en-IN')} match fee.
                        </span>
                    </div>
                    <span className="text-xs font-black text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                        Slot: {matchTime}
                    </span>
                </div>

                {/* Action CTAs */}
                <div className="flex items-center gap-3 pt-1">
                    <button
                        type="button"
                        onClick={handleAcceptChallenge}
                        className="flex-1 py-3 rounded-2xl bg-[#B8F52A] hover:bg-[#D4FF45] text-[#121614] font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span>🏏 ACCEPT CHALLENGE & PLAY NOW (₹{depositFee})</span>
                        <HiArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
