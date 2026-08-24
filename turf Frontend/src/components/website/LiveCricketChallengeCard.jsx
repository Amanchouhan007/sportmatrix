import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    HiX, 
    HiArrowRight, 
    HiShieldCheck, 
    HiLocationMarker, 
    HiMinus, 
    HiSelector,
    HiChevronLeft,
    HiChevronRight
} from 'react-icons/hi'
import { FaFire } from 'react-icons/fa'

/**
 * LiveCricketChallengeCard — High-energy fiery cricket challenge widget with Multi-Match Carousel (Draggable & Movable)
 */
export default function LiveCricketChallengeCard({
    challenges = [],
    turfId = 16,
    challengerTeam = 'Indore Strikers XI',
    venueName = 'Champion Turf Ground, Palasia, Indore',
    matchTime = 'Tonight, 8:30 PM – 9:30 PM',
    matchFee = 1800,
    depositFee,
    sportName = 'Box Cricket',
    onDismiss
}) {
    const navigate = useNavigate()
    const [isVisible, setIsVisible] = useState(true)
    const [isMinimized, setIsMinimized] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 768; // Auto-minimize on mobile and tablets to keep cards 100% visible
        }
        return false;
    })
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [timeLeft, setTimeLeft] = useState(862) // Countdown in seconds
    const dragStartRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 })

    // Normalize challenges array strictly from props
    const matchPool = Array.isArray(challenges) && challenges.length > 0 
        ? challenges 
        : [];

    if (matchPool.length === 0) return null;


    const totalMatches = matchPool.length
    const safeIndex = Math.min(currentIndex, totalMatches - 1)
    const currentMatch = matchPool[safeIndex] || matchPool[0]

    // Accurate 30% security deposit calculation
    const currentMatchFee = currentMatch.matchFee || 1800
    const actualDepositFee = currentMatch.depositFee !== undefined && currentMatch.depositFee !== 100
        ? currentMatch.depositFee
        : Math.round(currentMatchFee * 0.3)

    // Countdown Timer decrement
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 1 ? prev - 1 : 899))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // Auto-rotate matches every 7 seconds when more than 1 match is available
    useEffect(() => {
        if (totalMatches <= 1 || isPaused || isDragging) return
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % totalMatches)
        }, 7000)
        return () => clearInterval(interval)
    }, [totalMatches, isPaused, isDragging])

    const handlePrev = (e) => {
        e?.stopPropagation?.()
        setCurrentIndex(prev => (prev - 1 + totalMatches) % totalMatches)
    }

    const handleNext = (e) => {
        e?.stopPropagation?.()
        setCurrentIndex(prev => (prev + 1) % totalMatches)
    }

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`
    }

    if (!isVisible) return null

    const handleAcceptChallenge = () => {
        navigate(`/booking/${currentMatch.id || 16}?mode=dare&pay=opponent`)
    }

    const handleDismiss = (e) => {
        e?.stopPropagation?.()
        setIsVisible(false)
        if (onDismiss) onDismiss()
    }

    const handleDragStart = (e) => {
        // Prevent drag when clicking buttons, links or interactive controls
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) return

        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY

        dragStartRef.current = {
            startX: clientX,
            startY: clientY,
            initialX: position.x,
            initialY: position.y
        }
        setIsDragging(true)
    }

    useEffect(() => {
        const handleMove = (e) => {
            if (!isDragging) return
            const clientX = e.touches ? e.touches[0].clientX : e.clientX
            const clientY = e.touches ? e.touches[0].clientY : e.clientY

            const deltaX = clientX - dragStartRef.current.startX
            const deltaY = clientY - dragStartRef.current.startY

            setPosition({
                x: dragStartRef.current.initialX + deltaX,
                y: dragStartRef.current.initialY + deltaY
            })
        }

        const handleEnd = () => {
            if (isDragging) setIsDragging(false)
        }

        if (isDragging) {
            window.addEventListener('mousemove', handleMove)
            window.addEventListener('mouseup', handleEnd)
            window.addEventListener('touchmove', handleMove)
            window.addEventListener('touchend', handleEnd)
        }

        return () => {
            window.removeEventListener('mousemove', handleMove)
            window.removeEventListener('mouseup', handleEnd)
            window.removeEventListener('touchmove', handleMove)
            window.removeEventListener('touchend', handleEnd)
        }
    }, [isDragging])

    // Minimized Floating Pill View (Also Draggable)
    if (isMinimized) {
        return (
            <div 
                className="fixed bottom-4 sm:bottom-5 right-3 sm:right-5 z-[90] animate-in slide-in-from-bottom-3 duration-300 touch-none select-none"
                style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
            >
                <div 
                    onClick={() => setIsMinimized(false)}
                    className={`flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-full sm:rounded-2xl bg-black/95 border-2 border-orange-500 text-white shadow-[0_4px_25px_rgba(249,115,22,0.6)] backdrop-blur-xl transition-all group ${
                        isDragging ? 'cursor-grabbing scale-105 ring-2 ring-orange-500/40' : 'cursor-grab hover:scale-105'
                    }`}
                >
                    <span className="flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse shrink-0">
                        <FaFire className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-white" />
                    </span>
                    <div className="flex flex-col text-left pr-1">
                        <span className="text-[9px] sm:text-[11px] font-black text-orange-400 uppercase tracking-wider flex items-center gap-1">
                            🔥 LIVE DARE <span className="bg-orange-500 text-white text-[7px] sm:text-[8px] px-1.5 py-0.2 rounded-full font-black">OPEN</span>
                        </span>
                        <span className="text-[10px] sm:text-xs font-black text-white truncate max-w-[120px] sm:max-w-[200px]">
                            {currentMatch.challengerTeam}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
                        title="Close"
                    >
                        <HiX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div 
            className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-5 z-[90] max-w-[calc(100vw-24px)] sm:max-w-[350px] animate-in slide-in-from-bottom-5 duration-300 touch-none select-none mx-auto sm:mx-0"
            style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className={`relative overflow-hidden rounded-lg sm:rounded-2xl text-white border sm:border-2 border-orange-500 animate-border-fire ring-1 sm:ring-2 ring-orange-500/20 transition-all duration-300 group bg-black/95 backdrop-blur-xl shadow-2xl ${
                isDragging ? 'cursor-grabbing scale-[1.02] shadow-[0_20px_50px_rgba(249,115,22,0.4)]' : 'cursor-default'
            }`}>
                {/* Real Cricket Action Playing Photo Background */}
                <div 
                    className="absolute inset-0 bg-cover bg-center animate-kenburns scale-105 opacity-25 pointer-events-none" 
                    style={{ backgroundImage: `url('/images/cricket_match_action.png')` }} 
                />

                {/* Dark Athletic Fire Ember Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f0e] via-[#16120e]/95 to-[#16120e]/85 backdrop-blur-[1.5px] pointer-events-none" />

                {/* Animated Rising Fire Embers */}
                <div className="absolute bottom-2 left-6 w-1 h-1 rounded-full bg-orange-400 blur-[0.5px] animate-ember-1 pointer-events-none" />
                <div className="absolute bottom-4 right-10 w-1 h-1 rounded-full bg-amber-300 blur-[0.5px] animate-ember-2 pointer-events-none" />

                {/* Fire Energy Glow at Top & Bottom */}
                <div className="absolute -top-8 -right-8 w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-br from-orange-500/30 via-red-500/20 to-transparent blur-2xl rounded-full pointer-events-none" />

                {/* Content Container */}
                <div className="relative z-10 p-2 sm:p-3.5 space-y-1 sm:space-y-2.5">
                    {/* Header Drag Banner & Action Controls */}
                    <div 
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                        className={`flex items-center justify-between border-b border-white/10 pb-1 sm:pb-2 ${
                            isDragging ? 'cursor-grabbing' : 'cursor-grab'
                        }`}
                        title="Click & Drag to Move Anywhere"
                    >
                        <div className="flex items-center gap-0.5 sm:gap-1.5">
                            <span className="flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-[0_0_6px_rgba(249,115,22,0.8)] animate-fire-float">
                                <FaFire className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 text-white" />
                            </span>
                            <span className="text-[6.5px] sm:text-[8px] font-black uppercase tracking-wider bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 text-black px-1 sm:px-2 py-0.5 rounded-full font-sans animate-pulse">
                                🔥 LIVE DARE
                            </span>
                            <span className="text-[6.5px] sm:text-[8px] font-black text-amber-300 bg-black/60 border border-orange-500/40 px-1 sm:px-1.5 py-0.5 rounded-full font-mono">
                                ⏳ {formatTimer(timeLeft)} LEFT
                            </span>
                        </div>

                        <div className="flex items-center gap-0.5 sm:gap-1">
                            {/* Carousel Next/Prev Controls if multiple matches */}
                            {totalMatches > 1 && (
                                <div className="flex items-center gap-0.5 bg-black/60 border border-orange-500/30 rounded-md px-1 py-0.5">
                                    <button
                                        type="button"
                                        onClick={handlePrev}
                                        title="Previous Dare"
                                        className="text-slate-300 hover:text-amber-400 p-0.5 transition-colors cursor-pointer"
                                    >
                                        <HiChevronLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    </button>
                                    <span className="text-[6.5px] sm:text-[7.5px] font-mono font-bold text-amber-300">
                                        {safeIndex + 1}/{totalMatches}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        title="Next Dare"
                                        className="text-slate-300 hover:text-amber-400 p-0.5 transition-colors cursor-pointer"
                                    >
                                        <HiChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    </button>
                                </div>
                            )}

                            <span className="text-[7.5px] font-black uppercase tracking-wider text-orange-400/80 bg-orange-500/10 border border-orange-500/30 px-1.5 py-0.5 rounded-md hidden sm:flex items-center gap-0.5">
                                <HiSelector className="w-2.5 h-2.5 text-orange-400" /> Drag
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsMinimized(true)}
                                title="Minimize"
                                className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-black/60 border border-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:bg-white/10"
                            >
                                <HiMinus className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleDismiss}
                                title="Dismiss Challenge"
                                className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-black/60 border border-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:rotate-90 hover:bg-white/10"
                            >
                                <HiX className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5" />
                            </button>
                        </div>
                    </div>

                    {/* Challenge Title & Teams Matchup (Animated per match) */}
                    <div 
                        key={`match-title-${currentMatch.id}-${safeIndex}`}
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                        className={`animate-in fade-in duration-200 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    >
                        <span className="text-[7.5px] sm:text-[10px] font-bold text-amber-400 flex items-center gap-0.5 sm:gap-1 truncate">
                            <HiLocationMarker className="w-2 h-2 sm:w-3 sm:h-3 text-orange-400 shrink-0" /> {currentMatch.venueName}
                        </span>
                        <h3 className="text-[9.5px] xs:text-[10.5px] sm:text-sm font-black tracking-tight text-white uppercase mt-0.5 flex items-center gap-1 flex-wrap leading-tight">
                            <span className="truncate max-w-[120px] xs:max-w-[150px] sm:max-w-none">{currentMatch.challengerTeam}</span> 
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-500 animate-pulse text-[9.5px] xs:text-[10.5px] sm:text-sm">
                                DARES YOU!
                            </span>
                        </h3>
                    </div>

                    {/* VS Matchup Box */}
                    <div className="grid grid-cols-3 items-center text-center gap-0.5 sm:gap-1 bg-black/85 border border-orange-500/40 p-1 sm:p-2 rounded-md sm:rounded-xl backdrop-blur-md shadow-inner">
                        <div className="min-w-0">
                            <div className="text-[7.5px] sm:text-[10px] font-black text-amber-300 uppercase tracking-wider truncate" title={currentMatch.challengerTeam}>
                                {currentMatch.challengerTeam}
                            </div>
                            <div className="text-[7.5px] sm:text-[10px] font-bold text-white mt-0.2">₹{actualDepositFee} Deposit</div>
                            <span className="inline-block text-[5.5px] sm:text-[7.5px] font-black px-1 sm:px-1.5 py-0.2 rounded-full mt-0.2 bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                                ✓ DEPOSITED
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                            <span className="text-[10px] sm:text-base font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-500 animate-pulse-vs leading-none">
                                VS
                            </span>
                            <span className="text-[5.5px] sm:text-[7.5px] font-black text-orange-400 uppercase tracking-tight flex items-center justify-center gap-0.5 mt-0.5">
                                <FaFire className="w-1 h-1 sm:w-2 sm:h-2 text-orange-500 inline animate-bounce" /> LOSER PAYS
                            </span>
                        </div>

                        <div className="min-w-0">
                            <div className="text-[7.5px] sm:text-[10px] font-black text-orange-300 uppercase tracking-wider truncate">YOUR SQUAD</div>
                            <div className="text-[7.5px] sm:text-[10px] font-bold text-white mt-0.2">₹{actualDepositFee} Deposit</div>
                            <span className="inline-block text-[5.5px] sm:text-[7.5px] font-black px-1 sm:px-1.5 py-0.2 rounded-full mt-0.2 bg-amber-500/30 text-amber-300 border border-amber-400/40 animate-pulse">
                                ⚔️ OPEN DARE
                            </span>
                        </div>
                    </div>

                    {/* Challenge Terms */}
                    <div className="bg-black/60 border border-orange-500/20 rounded sm:rounded-lg px-1.5 py-0.5 sm:p-2 text-[7px] sm:text-[10px] flex justify-between items-center backdrop-blur-md gap-1">
                        <span className="text-slate-200 font-semibold text-[7px] sm:text-[9px] leading-tight truncate">
                            🏆 <b className="text-amber-400">Winner:</b> Free. <b className="text-orange-400">Loser:</b> Pays ₹{currentMatchFee.toLocaleString('en-IN')}.
                        </span>
                        <span className="text-[6.5px] sm:text-[9px] font-black text-amber-300 bg-orange-950/70 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded border border-orange-500/30 shrink-0">
                            {currentMatch.matchTime?.split('–')?.[0] || currentMatch.matchTime}
                        </span>
                    </div>

                    {/* Action CTA */}
                    <div className="pt-0.5">
                        <button
                            type="button"
                            onClick={handleAcceptChallenge}
                            className="w-full py-1.5 sm:py-2.5 rounded-md sm:rounded-xl bg-gradient-to-r from-orange-500 via-amber-400 to-[#C8FF2E] hover:from-orange-400 hover:to-[#B5F000] text-[#111827] font-black text-[8px] xs:text-[9px] sm:text-[11px] uppercase tracking-wider shadow-[0_4px_15px_rgba(249,115,22,0.4)] transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer border border-orange-400/60 shimmer-sweep"
                        >
                            <FaFire className="w-2 h-2 sm:w-3.5 sm:h-3.5 text-orange-900 animate-bounce" />
                            <span>ACCEPT DARE & PLAY (₹{actualDepositFee})</span>
                            <HiArrowRight className="w-2 h-2 sm:w-3.5 sm:h-3.5" />
                        </button>
                    </div>

                    {/* Pagination Dots if multiple matches */}
                    {totalMatches > 1 && (
                        <div className="flex items-center justify-center gap-1 pt-0.5">
                            {matchPool.map((_, i) => (
                                <button
                                    key={`dot-${i}`}
                                    type="button"
                                    onClick={() => setCurrentIndex(i)}
                                    className={`h-1 rounded-full transition-all cursor-pointer ${
                                        i === safeIndex ? 'w-4 bg-[#C8FF2E]' : 'w-1.5 bg-white/30 hover:bg-white/60'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
