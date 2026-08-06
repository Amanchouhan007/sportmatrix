import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
    FiRotateCcw, FiSmartphone, FiShield, FiAlertTriangle, FiCheckCircle, 
    FiWifi, FiXCircle, FiRefreshCw, FiZap, FiRadio
} from 'react-icons/fi'

export default function MobileControllerStandalonePage() {
    const { sessionId } = useParams()
    const navigate = useNavigate()

    const [sessionState, setSessionState] = useState({
        status: 'verifying', // 'valid' | 'expired' | 'invalid' | 'disconnected' | 'verifying'
        deviceInfo: null
    })

    const [portraitWarning, setPortraitWarning] = useState(true)
    const [orientation, setOrientation] = useState('landscape')

    // Local Match State synced with Desktop Operator Console
    const [matchInfo, setMatchInfo] = useState({
        tournamentName: 'Indore Premier League 2026',
        venue: 'Champions Turf Arena, Court A',
        battingTeam: 'Indore Thunders',
        bowlingTeam: 'Bhopal Strikers',
        target: 165,
        status: 'Live',
        oversMax: 20
    })

    const [matchState, setMatchState] = useState({
        totalRuns: 146,
        wickets: 3,
        overs: 16,
        balls: 3,
        extras: { total: 10, wides: 4, noBalls: 2, byes: 1, legByes: 3 },
        currentPartnership: { runs: 42, balls: 26 },
        lastWicket: 'Rahul Sharma 28 (19) - c Patel b Singh',
        currentOverBalls: [
            { id: 1, label: '1' },
            { id: 2, label: '4' },
            { id: 3, label: 'W' },
            { id: 4, label: '0' },
            { id: 5, label: '6' }
        ],
        ballHistory: [
            { id: 101, overNum: '16.3', text: '16.3 - 4 RUNS! Smashed through extra cover boundary!' },
            { id: 100, overNum: '16.2', text: '16.2 - OUT! Caught at long on boundary!' }
        ]
    })

    const [striker, setStriker] = useState({ name: 'Aman Varma', runs: 48, balls: 28, fours: 5, sixes: 2 })
    const [nonStriker, setNonStriker] = useState({ name: 'Karan Malhotra', runs: 22, balls: 14, fours: 2, sixes: 1 })
    const [bowler, setBowler] = useState({ name: 'Vikramaditya Roy', overs: '3.4', runs: 28, wickets: 2, maiden: 0 })

    // Modals state on mobile
    const [activeModal, setActiveModal] = useState(null) // 'wide' | 'noball' | 'bye' | 'legbye' | 'wicket' | 'bowler' | 'batsman'

    // Detect device type & orientation
    useEffect(() => {
        const checkOrientation = () => {
            if (window.innerHeight > window.innerWidth) {
                setOrientation('portrait')
            } else {
                setOrientation('landscape')
                setPortraitWarning(false)
            }
        }

        checkOrientation()
        window.addEventListener('resize', checkOrientation)
        window.addEventListener('orientationchange', checkOrientation)
        return () => {
            window.removeEventListener('resize', checkOrientation)
            window.removeEventListener('orientationchange', checkOrientation)
        }
    }, [])

    // Session validation & handshake
    useEffect(() => {
        const detectDevice = () => {
            const ua = navigator.userAgent
            let platform = 'Android Mobile'
            if (/iPhone|iPad|iPod/i.test(ua)) platform = 'iPhone Safari'
            else if (/Android/i.test(ua)) platform = 'Android Chrome'
            return {
                platform,
                browser: navigator.appName || 'Mobile Web',
                time: new Date().toLocaleTimeString()
            }
        }

        // Check Session Storage
        const rawSession = localStorage.getItem('ctrl_session_' + sessionId)
        if (!rawSession) {
            // Default demo fallback validation if valid pattern
            if (sessionId && sessionId.length >= 6) {
                const deviceInfo = detectDevice()
                setSessionState({ status: 'valid', deviceInfo })
                // Notify Desktop
                notifyDesktopConnection(deviceInfo)
            } else {
                setSessionState({ status: 'invalid', deviceInfo: null })
            }
            return
        }

        try {
            const sess = JSON.parse(rawSession)
            if (sess.status === 'expired' || (sess.expiryTime && Date.now() > sess.expiryTime)) {
                setSessionState({ status: 'expired', deviceInfo: null })
            } else if (sess.status === 'disconnected') {
                setSessionState({ status: 'disconnected', deviceInfo: null })
            } else {
                const deviceInfo = detectDevice()
                setSessionState({ status: 'valid', deviceInfo })
                // Update local storage status
                sess.status = 'connected'
                sess.deviceInfo = deviceInfo
                localStorage.setItem('ctrl_session_' + sessionId, JSON.stringify(sess))
                notifyDesktopConnection(deviceInfo)
            }
        } catch (e) {
            setSessionState({ status: 'invalid', deviceInfo: null })
        }
    }, [sessionId])

    // BroadcastChannel for Real-Time Sync
    useEffect(() => {
        if (!sessionId) return
        const channelName = 'mobile_ctrl_channel_' + sessionId
        let channel
        try {
            channel = new BroadcastChannel(channelName)
            channel.onmessage = (event) => {
                const data = event.data
                if (data.type === 'DESKTOP_DISCONNECT') {
                    setSessionState({ status: 'disconnected', deviceInfo: null })
                } else if (data.type === 'MATCH_STATE_SYNC') {
                    if (data.matchState) setMatchState(data.matchState)
                    if (data.striker) setStriker(data.striker)
                    if (data.nonStriker) setNonStriker(data.nonStriker)
                    if (data.bowler) setBowler(data.bowler)
                }
            }
        } catch (e) {
            console.log('BroadcastChannel not supported fallback to localStorage')
        }

        return () => {
            if (channel) channel.close()
        }
    }, [sessionId])

    const notifyDesktopConnection = (deviceInfo) => {
        try {
            const bc = new BroadcastChannel('mobile_ctrl_channel_' + sessionId)
            bc.postMessage({ type: 'MOBILE_CONNECTED', deviceInfo })
            bc.close()
        } catch (e) {}
    }

    const sendScoreAction = (actionType, payload = {}) => {
        // Dispatch local state update
        if (actionType === 'RUN') {
            const runs = payload.runs
            setMatchState(prev => ({
                ...prev,
                totalRuns: prev.totalRuns + runs,
                balls: prev.balls >= 5 ? 0 : prev.balls + 1,
                overs: prev.balls >= 5 ? prev.overs + 1 : prev.overs,
                currentOverBalls: [...prev.currentOverBalls.slice(-5), { id: Date.now(), label: String(runs) }]
            }))
            setStriker(prev => ({ ...prev, runs: prev.runs + runs, balls: prev.balls + 1 }))
            setBowler(prev => ({ ...prev, runs: prev.runs + runs }))
        } else if (actionType === 'SWAP_STRIKE') {
            const temp = striker
            setStriker(nonStriker)
            setNonStriker(temp)
        } else if (actionType === 'UNDO') {
            setMatchState(prev => ({
                ...prev,
                totalRuns: Math.max(0, prev.totalRuns - 1),
                balls: prev.balls > 0 ? prev.balls - 1 : 5
            }))
        }

        // Notify Desktop Console via BroadcastChannel
        try {
            const bc = new BroadcastChannel('mobile_ctrl_channel_' + sessionId)
            bc.postMessage({ type: 'MOBILE_SCORE_ACTION', actionType, payload })
            bc.close()
        } catch (e) {}
    }

    const crr = ((matchState.totalRuns / (matchState.overs + matchState.balls / 6 || 1))).toFixed(2)

    // ====================================================
    // FAILURE & STATUS SCREENS
    // ====================================================
    if (sessionState.status === 'verifying') {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
                <FiRefreshCw className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
                <h2 className="text-lg font-black tracking-wide">Connecting Mobile Controller...</h2>
                <p className="text-xs text-slate-400 mt-1">Verifying secure pairing session</p>
            </div>
        )
    }

    if (sessionState.status === 'expired') {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-3xl">
                    ⏱️
                </div>
                <h2 className="text-xl font-black text-amber-400">Session Expired</h2>
                <p className="text-xs text-slate-400 max-w-xs">
                    This QR pairing session has expired (validity 10 mins). Please generate a new QR Code on the desktop operator console.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                    Retry Connection
                </button>
            </div>
        )
    }

    if (sessionState.status === 'disconnected') {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 text-3xl">
                    🔌
                </div>
                <h2 className="text-xl font-black text-rose-400">Controller Disconnected</h2>
                <p className="text-xs text-slate-400 max-w-xs">
                    The desktop operator has disconnected this mobile device session. Scan a new QR Code from the desktop console to reconnect.
                </p>
            </div>
        )
    }

    if (sessionState.status === 'invalid') {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 text-3xl">
                    ⚠️
                </div>
                <h2 className="text-xl font-black text-rose-400">Invalid Session</h2>
                <p className="text-xs text-slate-400 max-w-xs">
                    Invalid or non-existent mobile controller pairing session ID.
                </p>
            </div>
        )
    }

    // ====================================================
    // MAIN LANDSCAPE CONTROLLER SCREEN
    // ====================================================
    return (
        <div className="min-h-screen bg-[#0B0F17] text-white font-sans text-xs select-none relative overflow-x-hidden p-2">
            
            {/* PORTRAIT OVERLAY PROMPT (STEP 17) */}
            {orientation === 'portrait' && portraitWarning && (
                <div className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center space-y-5 animate-in fade-in duration-300">
                    <div className="w-20 h-20 rounded-full bg-indigo-600/20 border-2 border-indigo-500/50 flex items-center justify-center text-indigo-400 text-4xl animate-bounce">
                        🔄
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-lg font-black text-white">Rotate Device for Best Control</h2>
                        <p className="text-xs text-slate-400 max-w-xs">
                            Turn your phone horizontally to access the 3-column operator scoring console.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
                        <button
                            onClick={() => {
                                if (window.screen?.orientation?.lock) {
                                    window.screen.orientation.lock('landscape').catch(() => {})
                                }
                                setPortraitWarning(false)
                            }}
                            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-all shadow-lg cursor-pointer"
                        >
                            🔄 Rotate Device / Lock Landscape
                        </button>
                        <button
                            onClick={() => setPortraitWarning(false)}
                            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 transition-all cursor-pointer"
                        >
                            Continue Anyway
                        </button>
                    </div>
                </div>
            )}

            {/* TOP HEADER STATUS BAR */}
            <div className="bg-[#121824] border border-slate-800 rounded-xl px-3 py-1.5 mb-2 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-black text-emerald-400 text-xs">🎮 MOBILE REMOTE CONTROLLER</span>
                    <span className="text-slate-500 text-[10px] hidden sm:inline">• Connected to Desktop</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                        {matchInfo.battingTeam}
                    </span>
                    <span className="text-emerald-400 font-bold hidden sm:inline">⚡ Live Sync Active</span>
                    <button
                        onClick={() => {
                            try {
                                const bc = new BroadcastChannel('mobile_ctrl_channel_' + sessionId)
                                bc.postMessage({ type: 'MOBILE_DISCONNECT' })
                                bc.close()
                            } catch (e) {}
                            setSessionState({ status: 'disconnected', deviceInfo: null })
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] transition-all cursor-pointer shadow-md flex items-center gap-1"
                    >
                        🔌 Disconnect
                    </button>
                </div>
            </div>

            {/* MAIN 3-COLUMN LANDSCAPE LAYOUT */}
            <div className="grid grid-cols-12 gap-2 items-start">
                
                {/* ==================================================== */}
                {/* LEFT PANEL (~28% / col-span-3) */}
                {/* ==================================================== */}
                <div className="col-span-12 md:col-span-3 space-y-2">
                    {/* HERO SCORE CARD */}
                    <div className="bg-[#121824] rounded-xl border border-slate-800 p-2.5 text-center space-y-1 shadow-md">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">CURRENT MATCH SCORE</div>
                        <div className="text-3xl font-black text-white flex items-center justify-center gap-1 my-0.5">
                            <span className="text-emerald-400">{matchState.totalRuns}</span>
                            <span className="text-slate-600">/</span>
                            <span className="text-rose-500">{matchState.wickets}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-300">
                            OVERS: <span className="text-white font-black">{matchState.overs}.{matchState.balls}</span> <span className="text-slate-500 text-[9px]">(20.0)</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-slate-900 overflow-hidden mt-1">
                            <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, ((matchState.overs * 6 + matchState.balls) / 120 * 100))}%` }}></div>
                        </div>
                    </div>

                    {/* RUN RATES & TARGET */}
                    <div className="grid grid-cols-3 gap-1 font-mono text-center text-[9px]">
                        <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                            <div className="text-slate-500 text-[8px]">CRR</div>
                            <div className="font-black text-emerald-400 text-xs mt-0.5">{crr}</div>
                        </div>
                        <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                            <div className="text-slate-500 text-[8px]">TARGET</div>
                            <div className="font-black text-indigo-400 text-xs mt-0.5">{matchInfo.target}</div>
                        </div>
                        <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                            <div className="text-slate-500 text-[8px]">NEED</div>
                            <div className="font-black text-amber-400 text-[10px] mt-0.5">23 in 26b</div>
                        </div>
                    </div>

                    {/* PARTNERSHIP & LAST WICKET */}
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1 text-[10px]">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Partnership:</span>
                            <span className="font-bold text-white">{matchState.currentPartnership.runs} Runs ({matchState.currentPartnership.balls}b)</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-1">
                            <span className="text-slate-400">Last Wkt:</span>
                            <span className="font-bold text-rose-400 truncate text-[9px]">{matchState.lastWicket}</span>
                        </div>
                    </div>

                    {/* OVER BALLS TICKER */}
                    <div className="bg-[#121824] p-2 rounded-xl border border-slate-800 space-y-1 shadow-md">
                        <div className="text-[9px] font-black text-slate-400 uppercase">CURRENT OVER BALLS</div>
                        <div className="flex items-center gap-1 flex-wrap">
                            {matchState.currentOverBalls.map((b, idx) => (
                                <span
                                    key={idx}
                                    className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs ${
                                        b.label === 'W' ? 'bg-rose-600 text-white' : b.label === '6' || b.label === '4' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                                    }`}
                                >
                                    {b.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ==================================================== */}
                {/* CENTER PANEL (~44% / col-span-5) */}
                {/* ==================================================== */}
                <div className="col-span-12 md:col-span-6 space-y-2">
                    
                    {/* RUN CONTROLS GRID (0, 1, 2 / 3, 4, 6) */}
                    <div className="bg-[#121824] rounded-xl border border-slate-800 p-2 space-y-1 shadow-md">
                        <div className="text-[9px] font-black text-slate-400 uppercase">RUN SCORING CONTROLS</div>
                        <div className="grid grid-cols-3 gap-1.5">
                            {[0, 1, 2, 3, 4, 6].map(runs => (
                                <button
                                    key={runs}
                                    onClick={() => sendScoreAction('RUN', { runs })}
                                    className={`h-12 rounded-xl font-black text-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-md ${
                                        runs === 6
                                            ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 shadow-emerald-600/30'
                                            : runs === 4
                                            ? 'bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-indigo-600/30'
                                            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                                    }`}
                                >
                                    {runs}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* EXTRAS */}
                    <div className="grid grid-cols-4 gap-1">
                        <button onClick={() => setActiveModal('wide')} className="py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 font-black text-xs transition-all active:scale-95 cursor-pointer text-center">
                            Wide
                        </button>
                        <button onClick={() => setActiveModal('noball')} className="py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 font-black text-xs transition-all active:scale-95 cursor-pointer text-center">
                            No Ball
                        </button>
                        <button onClick={() => setActiveModal('bye')} className="py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 font-black text-xs transition-all active:scale-95 cursor-pointer text-center">
                            Bye
                        </button>
                        <button onClick={() => setActiveModal('legbye')} className="py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 font-black text-xs transition-all active:scale-95 cursor-pointer text-center">
                            Leg Bye
                        </button>
                    </div>

                    {/* DISMISSALS & CONTROLS */}
                    <div className="grid grid-cols-3 gap-1.5">
                        <button onClick={() => setActiveModal('wicket')} className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all active:scale-95 cursor-pointer col-span-2 flex items-center justify-center gap-1 shadow-md">
                            🚨 WICKET OUT (W)
                        </button>
                        <button onClick={() => sendScoreAction('UNDO')} className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-black text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1">
                            <FiRotateCcw className="w-3.5 h-3.5" /> Undo
                        </button>
                    </div>

                    {/* BOTTOM ACTIONS */}
                    <div className="grid grid-cols-4 gap-1">
                        <button onClick={() => sendScoreAction('SWAP_STRIKE')} className="py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-[10px] border border-slate-800 cursor-pointer">
                            Swap ⇄
                        </button>
                        <button onClick={() => setActiveModal('bowler')} className="py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-[10px] border border-slate-800 cursor-pointer">
                            Bowler
                        </button>
                        <button onClick={() => setActiveModal('batsman')} className="py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-[10px] border border-slate-800 cursor-pointer">
                            Batsman
                        </button>
                        <button onClick={() => alert('Retire hurt logged')} className="py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 text-rose-300 font-bold text-[9px] border border-rose-800/40 cursor-pointer">
                            Retire
                        </button>
                    </div>
                </div>

                {/* ==================================================== */}
                {/* RIGHT PANEL (~28% / col-span-3) */}
                {/* ==================================================== */}
                <div className="col-span-12 md:col-span-3 space-y-2">
                    {/* CURRENT BATSMEN */}
                    <div className="bg-[#121824] rounded-xl border border-slate-800 p-2 space-y-1.5 shadow-md">
                        <div className="text-[9px] font-black text-emerald-400 uppercase">CURRENT BATSMEN</div>
                        <div className="bg-slate-950 p-1.5 rounded-lg border border-emerald-500/30 text-[10px] flex justify-between items-center">
                            <div>
                                <div className="font-black text-white">⭐ {striker.name}</div>
                                <div className="text-[8px] text-slate-400">{striker.fours}x4 • {striker.sixes}x6</div>
                            </div>
                            <div className="text-right font-mono font-black text-emerald-400 text-xs">{striker.runs} ({striker.balls})</div>
                        </div>
                        <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-[10px] flex justify-between items-center">
                            <div>
                                <div className="font-bold text-slate-300">{nonStriker.name}</div>
                                <div className="text-[8px] text-slate-500">{nonStriker.fours}x4 • {nonStriker.sixes}x6</div>
                            </div>
                            <div className="text-right font-mono text-slate-300 text-xs">{nonStriker.runs} ({nonStriker.balls})</div>
                        </div>
                    </div>

                    {/* CURRENT BOWLER */}
                    <div className="bg-[#121824] rounded-xl border border-slate-800 p-2 space-y-1.5 shadow-md">
                        <div className="text-[9px] font-black text-indigo-400 uppercase">CURRENT BOWLER</div>
                        <div className="bg-slate-950 p-1.5 rounded-lg border border-indigo-500/30 text-[10px] space-y-1">
                            <div className="flex justify-between font-black text-white">
                                <span>⚡ {bowler.name}</span>
                                <span className="text-indigo-400 font-mono">ECO: {(bowler.runs / (parseFloat(bowler.overs) || 1)).toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between font-mono text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                                <span>O: {bowler.overs}</span>
                                <span>R: {bowler.runs}</span>
                                <span className="text-emerald-400 font-bold">W: {bowler.wickets}</span>
                            </div>
                        </div>
                    </div>

                    {/* RECENT LOG */}
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1 text-[9px]">
                        <div className="font-black text-slate-400 uppercase">RECENT DELIVERY LOG</div>
                        <div className="text-emerald-400 font-mono truncate text-[10px]">
                            {matchState.ballHistory[0]?.text || '16.3 - 4 RUNS! Smashed through cover boundary!'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
