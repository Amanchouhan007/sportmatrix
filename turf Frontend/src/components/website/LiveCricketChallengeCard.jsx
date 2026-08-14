import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiX, HiArrowRight, HiShieldCheck, HiLocationMarker, HiMinus, HiArrowsExpand, HiSelector } from 'react-icons/hi'
import { FaFire } from 'react-icons/fa'

/**
 * LiveCricketChallengeCard — High-energy fiery cricket challenge side popup widget (Fully Draggable & Movable)
 */
export default function LiveCricketChallengeCard({
    challengerTeam = 'Indore Warriors XI',
    venueName = 'Indore Turf Arena, Vijay Nagar, Indore',
    matchTime = 'Tonight, 8:00 PM – 9:00 PM',
    matchFee = 1200,
    depositFee = 100,
    sportName = 'Cricket',
    onDismiss
}) {
    const navigate = useNavigate()
    const [isVisible, setIsVisible] = useState(true)
    const [isMinimized, setIsMinimized] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const dragStartRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 })

    if (!isVisible) return null

    const handleAcceptChallenge = () => {
        navigate('/booking/1?mode=dare&pay=opponent')
    }

    const handleDismiss = (e) => {
        e?.stopPropagation?.()
        setIsVisible(false)
        if (onDismiss) onDismiss()
    }

    const handleDragStart = (e) => {
        // Prevent drag when clicking buttons or interactive elements
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

    // Minimized Floating Pill View (Also Draggable!)
    if (isMinimized) {
        return (
            <div 
                className="fixed bottom-5 right-5 z-[90] animate-in slide-in-from-bottom-3 duration-300 touch-none select-none"
                style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
            >
                <div 
                    onClick={() => setIsMinimized(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/90 border-2 border-orange-500 text-white shadow-[0_0_35px_rgba(249,115,22,0.6)] backdrop-blur-xl transition-all group ${
                        isDragging ? 'cursor-grabbing scale-105 ring-4 ring-orange-500/40' : 'cursor-grab hover:scale-105'
                    }`}
                >
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-[0_0_12px_rgba(249,115,22,0.8)] animate-pulse shrink-0">
                        <FaFire className="w-4 h-4 text-white" />
                    </span>
                    <div className="flex flex-col text-left pr-2">
                        <span className="text-[11px] font-black text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                            🔥 LIVE DARE CHALLENGE <span className="bg-orange-500 text-white text-[8px] px-1.5 py-0.2 rounded-full font-black">OPEN</span>
                        </span>
                        <span className="text-xs font-black text-white truncate max-w-[200px]">
                            {challengerTeam} Dares You!
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <HiX className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div 
            className="fixed bottom-5 right-4 sm:right-6 z-[90] max-w-[340px] sm:max-w-[360px] w-[calc(100vw-32px)] animate-in slide-in-from-bottom-5 duration-300 touch-none select-none"
            style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        >
            <div className={`relative overflow-hidden rounded-2xl text-white border-2 border-orange-500 animate-border-fire ring-2 ring-orange-500/20 transition-all duration-300 group bg-black/95 backdrop-blur-xl shadow-2xl ${
                isDragging ? 'cursor-grabbing scale-[1.02] shadow-[0_20px_50px_rgba(249,115,22,0.4)]' : 'cursor-default'
            }`}>
                {/* Real Cricket Action Playing Photo (Ken Burns Pan/Zoom Motion) */}
                <div 
                    className="absolute inset-0 bg-cover bg-center animate-kenburns scale-105 opacity-30 pointer-events-none" 
                    style={{ backgroundImage: `url('/images/cricket_match_action.png')` }} 
                />

                {/* Dark Athletic Fire Ember Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f0e] via-[#16120e]/95 to-[#16120e]/85 backdrop-blur-[1.5px] pointer-events-none" />

                {/* Animated Rising Fire Embers */}
                <div className="absolute bottom-3 left-10 w-1.5 h-1.5 rounded-full bg-orange-400 blur-[0.5px] animate-ember-1 pointer-events-none" />
                <div className="absolute bottom-6 right-16 w-1 h-1 rounded-full bg-amber-300 blur-[0.5px] animate-ember-2 pointer-events-none" />

                {/* Fire Energy Glow at Top & Bottom */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-gradient-to-br from-orange-500/30 via-red-500/20 to-transparent blur-2xl rounded-full pointer-events-none" />

                {/* Content Container */}
                <div className="relative z-10 p-3 sm:p-3.5 space-y-2.5">
                    {/* Header Drag Banner & Action Controls */}
                    <div 
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                        className={`flex items-center justify-between border-b border-white/15 pb-2 ${
                            isDragging ? 'cursor-grabbing' : 'cursor-grab'
                        }`}
                        title="Click & Drag to Move Anywhere"
                    >
                        <div className="flex items-center gap-1.5">
                            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-fire-float">
                                <FaFire className="w-2.5 h-2.5 text-white" />
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 text-black px-2 py-0.5 rounded-full shadow-xs font-sans animate-pulse">
                                🔥 LIVE DARE
                            </span>
                            <span className="text-[8px] font-black text-amber-300 bg-black/60 border border-orange-500/40 px-1.5 py-0.5 rounded-full">
                                ⏳ 14m LEFT
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <span className="text-[8px] font-black uppercase tracking-wider text-orange-400/80 bg-orange-500/10 border border-orange-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 hidden sm:flex">
                                <HiSelector className="w-2.5 h-2.5 text-orange-400" /> Drag
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsMinimized(true)}
                                title="Minimize"
                                className="w-5 h-5 rounded-full bg-black/60 border border-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:bg-white/10"
                            >
                                <HiMinus className="w-2.5 h-2.5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleDismiss}
                                title="Dismiss Challenge"
                                className="w-5 h-5 rounded-full bg-black/60 border border-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:rotate-90 hover:bg-white/10"
                            >
                                <HiX className="w-2.5 h-2.5" />
                            </button>
                        </div>
                    </div>

                    {/* Challenge Title & Teams Matchup */}
                    <div 
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                        className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
                    >
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 truncate">
                            <HiLocationMarker className="w-3 h-3 text-orange-400 shrink-0" /> {venueName}
                        </span>
                        <h3 className="text-sm font-black tracking-tight text-white uppercase mt-0.5 flex items-center gap-1 flex-wrap leading-tight">
                            <span>{challengerTeam}</span> 
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-500 animate-pulse">
                                DARES YOU!
                            </span>
                        </h3>
                    </div>

                    {/* VS Matchup Box */}
                    <div className="grid grid-cols-3 items-center text-center gap-1 bg-black/85 border border-orange-500/40 p-2 rounded-xl backdrop-blur-md shadow-inner">
                        <div>
                            <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider truncate">{challengerTeam}</div>
                            <div className="text-[10px] font-black text-white mt-0.5">₹{depositFee} Deposit</div>
                            <span className="inline-block text-[7.5px] font-black px-1.5 py-0.2 rounded-full mt-0.5 bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                                ✓ DEPOSITED
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                            <span className="text-base font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-500 animate-pulse-vs">
                                VS
                            </span>
                            <span className="text-[7.5px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-0.5">
                                <FaFire className="w-2 h-2 text-orange-500 inline animate-bounce" /> LOSER PAYS
                            </span>
                        </div>

                        <div>
                            <div className="text-[10px] font-black text-orange-300 uppercase tracking-wider truncate">YOUR SQUAD</div>
                            <div className="text-[10px] font-black text-white mt-0.5">₹{depositFee} Deposit</div>
                            <span className="inline-block text-[7.5px] font-black px-1.5 py-0.2 rounded-full mt-0.5 bg-amber-500/30 text-amber-300 border border-amber-400/40 animate-pulse">
                                ⚔️ OPEN DARE
                            </span>
                        </div>
                    </div>

                    {/* Challenge Terms */}
                    <div className="bg-black/60 border border-orange-500/20 rounded-lg p-2 text-[10px] flex justify-between items-center backdrop-blur-md gap-1.5">
                        <span className="text-slate-200 font-semibold text-[9px] leading-tight">
                            🏆 <b className="text-amber-400">Winner:</b> Free. <b className="text-orange-400">Loser:</b> Pays ₹{matchFee.toLocaleString('en-IN')}.
                        </span>
                        <span className="text-[9px] font-black text-amber-300 bg-orange-950/70 px-1.5 py-0.5 rounded border border-orange-500/30 shrink-0">
                            {matchTime.split('–')[0]}
                        </span>
                    </div>

                    {/* Action CTA */}
                    <div className="pt-0.5">
                        <button
                            type="button"
                            onClick={handleAcceptChallenge}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-400 to-[#C8FF2E] hover:from-orange-400 hover:to-[#B5F000] text-[#111827] font-black text-[11px] uppercase tracking-wider shadow-[0_4px_20px_rgba(249,115,22,0.5)] transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-orange-400/60 shimmer-sweep"
                        >
                            <FaFire className="w-3.5 h-3.5 text-orange-900 animate-bounce" />
                            <span>ACCEPT DARE & PLAY NOW (₹{depositFee})</span>
                            <HiArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
