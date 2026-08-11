import React, { useState } from 'react'
import { HiCheck, HiClipboardCopy, HiShare, HiClock, HiExclamation, HiUserGroup, HiShieldCheck } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'
import { FaWhatsapp, FaFire } from 'react-icons/fa'

/**
 * MatchPaymentProgress — Universal Team Payment Mode Tracker Component
 * Supports: FULL_PAY, SPLIT_50_50, CUSTOM_SPLIT, DARE_TO_PLAY, PER_PLAYER
 */
export default function MatchPaymentProgress({
    paymentMode = 'SPLIT_50_50', // 'FULL_PAY' | 'SPLIT_50_50' | 'CUSTOM_SPLIT' | 'DARE_TO_PLAY' | 'PER_PLAYER'
    totalAmount = 1200,
    collectedAmount = 600,
    teamAName = 'Aman XI',
    teamAPaid = true,
    teamAAmount = 600,
    teamBName = 'Rohit Warriors',
    teamBPaid = false,
    teamBAmount = 600,
    players = [], // [{ name: 'Aman', amount: 300, status: 'Paid' }, ...]
    matchDate = '12 August 2026',
    matchTime = '7:00 PM – 8:00 PM',
    turfName = 'ABC Cricket Arena',
    onInviteOpponent,
    onInvitePlayers,
    onAcceptDare,
    onDeclineDare,
    onSettleResult
}) {
    const [copied, setCopied] = useState(false)
    const [selectedWinner, setSelectedWinner] = useState(null) // 'TEAM_A' | 'TEAM_B' | 'DRAW'

    const modeNormalized = (paymentMode || 'FULL_PAY').toUpperCase().replace(/-/g, '_')
    const remainingAmount = Math.max(0, totalAmount - collectedAmount)
    const progressPercent = Math.min(100, Math.round((collectedAmount / totalAmount) * 100))

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/booking/invitation?mode=${modeNormalized.toLowerCase()}` : ''

    const handleCopy = () => {
        if (navigator.clipboard && shareUrl) {
            navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleWhatsAppShare = () => {
        const text = `🏏 Match Invitation on SportTurf!\nJoin ${teamAName} vs ${teamBName} at ${turfName}.\nPayment Mode: ${modeNormalized.replace(/_/g, ' ')}\nClick here to confirm your share: ${shareUrl}`
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }

    // Default sample player list if none provided for PER_PLAYER
    const playerList = players && players.length > 0 ? players : [
        { id: 1, name: 'Aman (Captain)', amount: Math.round(totalAmount / 4), status: 'Paid' },
        { id: 2, name: 'Rohit', amount: Math.round(totalAmount / 4), status: 'Paid' },
        { id: 3, name: 'Karan', amount: Math.round(totalAmount / 4), status: 'Pending' },
        { id: 4, name: 'Arjun', amount: Math.round(totalAmount / 4), status: 'Pending' },
    ]

    return (
        <div className="bg-[#FFFFFF] border border-[#E3E8E1] rounded-3xl p-5 md:p-6 shadow-sm space-y-6 text-[#172019]">
            {/* Header Badge & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E8E1] pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#F6F7F4] border border-[#E3E8E1] flex items-center justify-center text-xl shadow-xs">
                        {modeNormalized === 'FULL_PAY' && '💳'}
                        {modeNormalized === 'SPLIT_50_50' && '⚖️'}
                        {modeNormalized === 'CUSTOM_SPLIT' && '🎴'}
                        {modeNormalized === 'DARE_TO_PLAY' && '🔥'}
                        {modeNormalized === 'PER_PLAYER' && '👥'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4FF45]/30 text-[#172019] border border-[#B8F52A]">
                                {modeNormalized.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs font-semibold text-[#6B746D]">• {turfName}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-[#172019] mt-0.5">
                            {teamAName} <span className="text-[#6B746D] font-medium">vs</span> {teamBName}
                        </h3>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold text-[#6B746D] uppercase">Match Slot</div>
                    <div className="text-xs font-extrabold text-[#172019]">{matchDate} · {matchTime}</div>
                </div>
            </div>

            {/* ── 1. FULL PAY MODE DISPLAY ── */}
            {modeNormalized === 'FULL_PAY' && (
                <div className="bg-[#F6F7F4] border border-[#E3E8E1] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
                            <HiShieldCheck className="w-5 h-5 text-emerald-600" />
                            <span>✓ Booking Fully Confirmed</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                            100% PAID
                        </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-[#E3E8E1]">
                        <div>
                            <span className="text-[#6B746D] block text-[10px]">Total Match Fee</span>
                            <span className="font-extrabold text-[#172019] text-sm">₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                            <span className="text-[#6B746D] block text-[10px]">Paid by Captain</span>
                            <span className="font-extrabold text-[#79C943] text-sm">₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <span className="text-[#6B746D] block text-[10px]">Opponent Liability</span>
                            <span className="font-semibold text-[#172019]">₹0 (Offline Settlement)</span>
                        </div>
                    </div>
                    <p className="text-xs text-[#6B746D] bg-white p-3 rounded-xl border border-[#E3E8E1]">
                        💡 Your turf slot is locked immediately. You can collect offline cash or UPI from your teammates at the venue.
                    </p>
                </div>
            )}

            {/* ── 2. SPLIT 50-50 MODE DISPLAY ── */}
            {modeNormalized === 'SPLIT_50_50' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className={`p-4 rounded-2xl border ${teamAPaid ? 'bg-emerald-50/60 border-emerald-300' : 'bg-[#F6F7F4] border-[#E3E8E1]'}`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-black text-[#172019] uppercase">{teamAName} (Team A)</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${teamAPaid ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                                    {teamAPaid ? '✓ PAID' : 'PENDING'}
                                </span>
                            </div>
                            <div className="text-lg font-black text-[#172019]">₹{teamAAmount.toLocaleString('en-IN')}</div>
                            <div className="text-[10px] text-[#6B746D] mt-0.5">{teamAPaid ? 'Captain share completed' : 'Awaiting payment'}</div>
                        </div>

                        <div className={`p-4 rounded-2xl border ${teamBPaid ? 'bg-emerald-50/60 border-emerald-300' : 'bg-amber-50/60 border-amber-300'}`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-black text-[#172019] uppercase">{teamBName} (Team B)</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${teamBPaid ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                                    {teamBPaid ? '✓ PAID' : '⏳ WAITING FOR OPPONENT'}
                                </span>
                            </div>
                            <div className="text-lg font-black text-[#172019]">₹{teamBAmount.toLocaleString('en-IN')}</div>
                            <div className="text-[10px] text-[#6B746D] mt-0.5">{teamBPaid ? 'Opponent share received' : 'Send invitation link below'}</div>
                        </div>
                    </div>

                    <div className="space-y-1.5 bg-[#F6F7F4] p-3 rounded-2xl border border-[#E3E8E1]">
                        <div className="flex justify-between text-xs font-bold text-[#172019]">
                            <span>Collected: ₹{collectedAmount.toLocaleString('en-IN')} / ₹{totalAmount.toLocaleString('en-IN')}</span>
                            <span className="text-[#79C943] font-black">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-[#E3E8E1] h-3 rounded-full overflow-hidden p-0.5">
                            <div className="bg-[#79C943] h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                </div>
            )}

            {/* ── 3. CUSTOM SPLIT MODE DISPLAY ── */}
            {modeNormalized === 'CUSTOM_SPLIT' && (
                <div className="space-y-4">
                    <div className="bg-[#F6F7F4] border border-[#E3E8E1] rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between text-xs font-bold text-[#172019]">
                            <span>Custom Split Ratio</span>
                            <span className="text-[#6B746D]">Total: ₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="w-full h-4 rounded-full overflow-hidden flex bg-[#E3E8E1]">
                            <div className="bg-[#172019] text-[#D4FF45] text-[9px] font-black flex items-center justify-center transition-all" style={{ width: `${Math.round((teamAAmount / totalAmount) * 100)}%` }}>
                                {Math.round((teamAAmount / totalAmount) * 100)}%
                            </div>
                            <div className="bg-[#79C943] text-white text-[9px] font-black flex items-center justify-center transition-all" style={{ width: `${Math.round((teamBAmount / totalAmount) * 100)}%` }}>
                                {Math.round((teamBAmount / totalAmount) * 100)}%
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                            <div className="bg-white p-3 rounded-xl border border-[#E3E8E1]">
                                <div className="text-[10px] text-[#6B746D] uppercase font-bold">Team A Share</div>
                                <div className="text-sm font-black text-[#172019]">₹{teamAAmount.toLocaleString('en-IN')}</div>
                                <span className={`text-[9px] font-bold ${teamAPaid ? 'text-[#79C943]' : 'text-amber-600'}`}>{teamAPaid ? '✓ Paid' : 'Pending'}</span>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-[#E3E8E1]">
                                <div className="text-[10px] text-[#6B746D] uppercase font-bold">Team B Share</div>
                                <div className="text-sm font-black text-[#172019]">₹{teamBAmount.toLocaleString('en-IN')}</div>
                                <span className={`text-[9px] font-bold ${teamBPaid ? 'text-[#79C943]' : 'text-amber-600'}`}>{teamBPaid ? '✓ Paid' : 'Pending'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 4. DARE TO PLAY (LOSER PAYS ALL) CRICKET TURF STADIUM CARD ── */}
            {modeNormalized === 'DARE_TO_PLAY' && (
                <div className="relative overflow-hidden rounded-3xl text-white border-2 border-[#B8F52A] shadow-2xl ring-4 ring-[#B8F52A]/20 group">
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

                    <div className="relative z-10 p-5 md:p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/15 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-[#172019] border-2 border-[#B8F52A] flex items-center justify-center text-xl shadow-[0_0_20px_rgba(184,255,42,0.5)] animate-cricket-spin">
                                    🏏
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-[#B8F52A] text-[#121614] px-3 py-0.5 rounded-full border border-[#B8F52A] shadow-md animate-wicket-flash">
                                        🏏 CRICKET MATCH CHALLENGE
                                    </span>
                                    <h4 className="text-xl font-black tracking-tight text-white mt-0.5">
                                        Dare to Play — Loser Pays All
                                    </h4>
                                </div>
                            </div>
                            <span className="text-xs font-black text-[#D4FF45] bg-black/80 px-3 py-1.5 rounded-full border border-[#B8F52A]/50 shadow-md">
                                Match Fee: ₹{totalAmount.toLocaleString('en-IN')}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 items-center text-center gap-2 bg-black/60 border border-white/20 p-4 rounded-2xl backdrop-blur-md shadow-inner">
                            <div>
                                <div className="text-xs font-black text-[#D4FF45] uppercase tracking-wider">{teamAName}</div>
                                <div className="text-sm font-black text-white mt-1">₹100 Deposit</div>
                                <span className={`inline-block text-[9px] font-black px-2.5 py-0.5 rounded-full mt-1.5 ${teamAPaid ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50' : 'bg-amber-500/30 text-amber-300'}`}>
                                    {teamAPaid ? '✓ DEPOSITED' : 'PENDING'}
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
                                <div className="text-sm font-black text-white mt-1">₹100 Deposit</div>
                                <span className={`inline-block text-[9px] font-black px-2.5 py-0.5 rounded-full mt-1.5 ${teamBPaid ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50' : 'bg-amber-500/30 text-amber-300'}`}>
                                    {teamBPaid ? '✓ ACCEPTED' : '⏳ AWAITING ACCEPT'}
                                </span>
                            </div>
                        </div>

                        {!teamBPaid && (
                            <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                                <div>
                                    <div className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5 justify-center sm:justify-start">
                                        <span>🔥 You've Been Challenged by {teamAName}!</span>
                                    </div>
                                    <p className="text-[11px] text-slate-200 mt-0.5 font-medium">
                                        Pay ₹100 entry deposit to accept this challenge. Loser settles full ₹{totalAmount.toLocaleString('en-IN')}.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => onAcceptDare && onAcceptDare()}
                                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#B8F52A] hover:bg-[#D4FF45] text-[#121614] font-black text-xs uppercase tracking-wider shadow-lg transform hover:scale-105 transition-all cursor-pointer"
                                    >
                                        🔥 Accept Dare & Pay ₹100
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDeclineDare && onDeclineDare()}
                                        className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs cursor-pointer"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-black/50 border border-white/15 rounded-2xl p-3.5 text-xs space-y-1 text-slate-300 backdrop-blur-md">
                            <div className="text-[10px] font-black uppercase text-[#B8F52A] tracking-wider">📜 Dare Match Rules:</div>
                            <div className="flex items-center gap-2 text-emerald-300 text-[11px]">
                                <span>🏆 Winner:</span> Gets full ₹100 deposit refunded.
                            </div>
                            <div className="flex items-center gap-2 text-rose-300 text-[11px]">
                                <span>💀 Loser:</span> Forfeits deposit & pays full ₹{totalAmount.toLocaleString('en-IN')} match fee.
                            </div>
                            <div className="flex items-center gap-2 text-slate-200 text-[11px]">
                                <span>🤝 Draw:</span> Both teams split match fee equally (₹{Math.round(totalAmount / 2).toLocaleString('en-IN')} each).
                            </div>
                        </div>

                        <div className="border-t border-white/15 pt-4">
                            <div className="text-xs font-black text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <HiTrophy className="w-4 h-4 text-amber-400" /> Settle Match Result
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedWinner('TEAM_A')}
                                    className={`p-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                                        selectedWinner === 'TEAM_A'
                                            ? 'bg-[#B8F52A] text-[#121614] border-[#B8F52A]'
                                            : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                    }`}
                                >
                                    🏆 {teamAName} Wins
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedWinner('TEAM_B')}
                                    className={`p-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                                        selectedWinner === 'TEAM_B'
                                            ? 'bg-amber-400 text-[#121614] border-amber-400'
                                            : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                    }`}
                                >
                                    🏆 {teamBName} Wins
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedWinner('DRAW')}
                                    className={`p-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                                        selectedWinner === 'DRAW'
                                            ? 'bg-[#79C943] text-white border-[#79C943]'
                                            : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                    }`}
                                >
                                    🤝 Match Drawn
                                </button>
                            </div>
                            {selectedWinner && (
                                <div className="mt-3 p-3 bg-white/10 border border-white/20 rounded-xl text-xs flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-emerald-400 block">
                                            {selectedWinner === 'DRAW' ? '🤝 Draw Confirmed!' : `🏆 ${selectedWinner === 'TEAM_A' ? teamAName : teamBName} Declared Winner!`}
                                        </span>
                                        <span className="text-[10px] text-slate-300">
                                            {selectedWinner === 'DRAW' ? 'Both deposits refunded. Fee split 50-50.' : 'Winner gets 100% refund. Loser account charged match fee.'}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onSettleResult && onSettleResult(selectedWinner)}
                                        className="px-3 py-1.5 rounded-lg bg-[#B8F52A] text-[#121614] font-black text-xs hover:bg-[#D4FF45] cursor-pointer"
                                    >
                                        Confirm Result
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── 5. PER PLAYER SPLIT MODE DISPLAY ── */}
            {modeNormalized === 'PER_PLAYER' && (
                <div className="space-y-4">
                    <div className="bg-[#F6F7F4] border border-[#E3E8E1] rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-[#172019]">Individual Player Shares ({playerList.length} Players)</span>
                            <span className="text-[#79C943] font-black">₹{Math.round(totalAmount / Math.max(1, playerList.length)).toLocaleString('en-IN')} / player</span>
                        </div>

                        <div className="space-y-2 pt-1">
                            {playerList.map((p, idx) => (
                                <div key={p.id || idx} className="bg-white border border-[#E3E8E1] p-3 rounded-xl flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-[#172019] text-[#D4FF45] font-black flex items-center justify-center text-xs">
                                            {p.name.substring(0, 1).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className="font-bold text-[#172019] block">{p.name}</span>
                                            <span className="text-[10px] text-[#6B746D]">Share: ₹{p.amount?.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${p.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {p.status === 'Paid' ? '✓ Paid' : '⏳ Pending'}
                                        </span>
                                        {p.status !== 'Paid' && (
                                            <button 
                                                type="button" 
                                                onClick={handleWhatsAppShare}
                                                className="px-2 py-1 rounded-md bg-[#172019] text-[#D4FF45] text-[10px] font-bold hover:bg-[#202922] cursor-pointer"
                                            >
                                                Remind
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── EXPLICIT NEXT ACTION AREA ── */}
            <div className="bg-[#F6F7F4] border border-[#E3E8E1] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#6B746D]">
                        <HiClock className="w-4 h-4 text-[#79C943]" /> Next Required Action
                    </div>
                    <p className="text-xs font-bold text-[#172019] mt-0.5">
                        {modeNormalized === 'FULL_PAY' && 'Slot is fully confirmed. You can now invite your team players!'}
                        {modeNormalized === 'SPLIT_50_50' && 'Send the payment link to Opponent Captain to confirm match.'}
                        {modeNormalized === 'CUSTOM_SPLIT' && 'Send custom split link to Team B for remaining amount.'}
                        {modeNormalized === 'DARE_TO_PLAY' && 'Opponent team must accept the ₹100 deposit challenge.'}
                        {modeNormalized === 'PER_PLAYER' && 'Send payment links to remaining pending players.'}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={handleWhatsAppShare}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                        <FaWhatsapp className="w-4 h-4" /> Share WhatsApp
                    </button>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="px-3.5 py-2.5 rounded-xl bg-[#172019] hover:bg-[#202922] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                        {copied ? <HiCheck className="w-4 h-4 text-[#B8F52A]" /> : <HiClipboardCopy className="w-4 h-4" />}
                        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
