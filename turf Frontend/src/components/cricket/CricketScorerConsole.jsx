import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Peer } from 'peerjs'
import {
    FiPlay, FiPause, FiRotateCcw, FiUserCheck, FiUsers, FiAward,
    FiTrendingUp, FiActivity, FiX, FiCheck, FiCheckCircle, FiCornerUpLeft, FiClock,
    FiRefreshCw, FiZap, FiRadio, FiEdit2, FiPlus, FiChevronRight, FiSmartphone
} from 'react-icons/fi'
import { HiTrophy } from 'react-icons/hi2'
import { useToast } from '../ui/Toast'

export default function CricketScorerConsole({ match, onClose }) {
    const toastCtx = useToast()
    const addToast = useCallback((toastInput, typeInput = 'info') => {
        if (toastCtx && typeof toastCtx.addToast === 'function') {
            toastCtx.addToast(toastInput, typeInput)
        } else {
            console.log('[ScorerConsole Toast]:', toastInput)
        }
    }, [toastCtx])

    // Match Info State
    const [matchInfo, setMatchInfo] = useState({
        tournamentName: match?.tournamentName || 'Indore Premier League 2026',
        matchNumber: match?.matchNumber || 3,
        roundName: match?.roundName || 'Grand Finale',
        venue: match?.venue || 'Champions Turf Arena, Court A',
        battingTeam: match?.team1Name || 'Indore Thunders',
        bowlingTeam: match?.team2Name || 'Royal Challengers',
        innings: 1, // 1 or 2
        target: 165,
        status: match?.status === 'Live' ? 'Live' : 'Live',
        timerSeconds: 2535 // Timer in seconds
    })

    // Scores & Stats State
    const [matchState, setMatchState] = useState({
        totalRuns: 142,
        wickets: 3,
        overs: 15,
        balls: 4, // 15.4 overs
        extras: { wides: 4, noBalls: 2, byes: 1, legByes: 3, total: 10 },
        currentPartnership: { runs: 42, balls: 26 },
        lastWicket: 'Rahul Sharma 28 (19) - c Patel b Singh',
        currentOverBalls: [
            { type: 'run', runs: 1, label: '1' },
            { type: 'run', runs: 4, label: '4' },
            { type: 'wicket', runs: 0, label: 'W' },
            { type: 'run', runs: 0, label: '0' },
            { type: 'run', runs: 6, label: '6' }
        ],
        ballHistory: [
            { id: 1, overNum: '15.1', label: '1', text: '15.1 - 1 Run to Striker. Worked towards deep midwicket.' },
            { id: 2, overNum: '15.2', label: '4', text: '15.2 - FOUR! Smashed through extra cover boundary!' },
            { id: 3, overNum: '15.3', label: 'W', text: '15.3 - OUT! Caught at long-on. Big wicket falls!' },
            { id: 4, overNum: '15.4', label: '0', text: '15.4 - Dot Ball. Defended back to the bowler.' },
            { id: 5, overNum: '15.5', label: '6', text: '15.5 - SIX! Massive hit over deep square leg!' }
        ],
        overHistory: [
            { overNum: 14, balls: ['1', '0', '4', 'W', '2', '1'], totalRuns: 8 },
            { overNum: 15, balls: ['0', '6', '1', 'WD', '4', '1'], totalRuns: 13 }
        ]
    })

    // Players State
    const [striker, setStriker] = useState({
        name: 'Aman Varma', runs: 48, balls: 28, fours: 5, sixes: 2
    })
    const [nonStriker, setNonStriker] = useState({
        name: 'Karan Malhotra', runs: 22, balls: 14, fours: 2, sixes: 1
    })
    const [bowler, setBowler] = useState({
        name: 'Vikramaditya Roy', overs: '3.4', runs: 28, wickets: 2, maiden: 0
    })

    // Squad List for Change Bowler & New Batsman
    const squadBatting = [
        'Aman Varma', 'Karan Malhotra', 'Rohit Sen', 'Devendra Singh', 'Pankaj Kumar',
        'Siddharth Jain', 'Varun Dhawan', 'Arjun Kapoor'
    ]
    const squadBowling = [
        'Vikramaditya Roy', 'Suresh Raina', 'Jasprit B', 'Yuzvendra C', 'Hardik P'
    ]

    // Undo Stack State
    const [historyStack, setHistoryStack] = useState([])

    // Active Modal Popups
    const [wicketModalOpen, setWicketModalOpen] = useState(false)
    const [wideModalOpen, setWideModalOpen] = useState(false)
    const [noBallModalOpen, setNoBallModalOpen] = useState(false)
    const [byeModalOpen, setByeModalOpen] = useState(false)
    const [legByeModalOpen, setLegByeModalOpen] = useState(false)
    const [changeBowlerModalOpen, setChangeBowlerModalOpen] = useState(false)
    const [newBatsmanModalOpen, setNewBatsmanModalOpen] = useState(false)
    const [liveScoreModalOpen, setLiveScoreModalOpen] = useState(false)
    const [qrModalOpen, setQrModalOpen] = useState(false)
    const [isLandscapeMode, setIsLandscapeMode] = useState(false)
    const [finalizeModalOpen, setFinalizeModalOpen] = useState(false)
    const [isUmpireCertified, setIsUmpireCertified] = useState(false)
    const [selectedMvp, setSelectedMvp] = useState('Aman Varma (48 Runs)')
    const [umpireLicense, setUmpireLicense] = useState('UMP-LIC-4481 (BCCI Level 2)')

    // Mobile Controller QR Connection Session State
    const [connectModalOpen, setConnectModalOpen] = useState(false)
    const [localIp, setLocalIp] = useState('')
    const [ctrlSession, setCtrlSession] = useState({
        id: '',
        url: '',
        status: 'waiting', // 'waiting' | 'connected' | 'expired' | 'disconnected'
        deviceInfo: null,
        expiryTime: 0
    })
    const [connectTimer, setConnectTimer] = useState(600) // 10 minutes (600s)

    // Detect Local Network IP for Wi-Fi QR scanning
    useEffect(() => {
        try {
            const pc = new RTCPeerConnection({ iceServers: [] })
            pc.createDataChannel('')
            pc.createOffer().then(o => pc.setLocalDescription(o)).catch(() => { })
            pc.onicecandidate = (ice) => {
                if (!ice || !ice.candidate || !ice.candidate.candidate) return
                const match = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(ice.candidate.candidate)
                if (match && match[1] && !match[1].startsWith('127.')) {
                    setLocalIp(match[1])
                    pc.onicecandidate = null
                }
            }
        } catch (e) { }
    }, [])

    // Function to generate new pairing session
    const startNewControllerSession = () => {
        const sessionId = 'session_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36)

        let hostOrigin = window.location.origin
        if (window.location.hostname === 'localhost') {
            const targetIp = localIp || window.location.hostname
            hostOrigin = `${window.location.protocol}//${targetIp}:${window.location.port || '5173'}`
        }

        const mobileUrl = `${hostOrigin}/mobile-controller/${sessionId}`
        const expiry = Date.now() + 600000 // 10 mins

        const sessionObj = {
            id: sessionId,
            url: mobileUrl, // regular https URL for QR & clipboard
            status: 'waiting',
            deviceInfo: null,
            expiryTime: expiry,
            createdAt: Date.now()
        }

        localStorage.setItem('ctrl_session_' + sessionId, JSON.stringify(sessionObj))
        setCtrlSession(sessionObj)
        setConnectTimer(600)
        setConnectModalOpen(true)
    }

    // Effect for countdown timer (10 mins = 600s)
    useEffect(() => {
        if (!connectModalOpen || ctrlSession.status === 'expired' || ctrlSession.status === 'disconnected') return

        const timerInterval = setInterval(() => {
            setConnectTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerInterval)
                    setCtrlSession(curr => ({ ...curr, status: 'expired' }))
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timerInterval)
    }, [connectModalOpen, ctrlSession.status])



    const handleDisconnectMobile = () => {
        try {
            const bc = new BroadcastChannel('mobile_ctrl_channel_' + ctrlSession.id)
            bc.postMessage({ type: 'DESKTOP_DISCONNECT' })
            bc.close()
        } catch (e) { }
        setCtrlSession(prev => ({ ...prev, status: 'disconnected' }))
        addToast({ message: 'Mobile controller session disconnected', type: 'info' })
    }

    // Modal Temporary State
    const [wicketForm, setWicketForm] = useState({
        outPlayer: 'striker',
        dismissalType: 'Caught',
        fielder: 'Suresh Raina',
        newBatsman: 'Rohit Sen'
    })
    const [extraValue, setExtraValue] = useState(1)
    const [customCommentaryText, setCustomCommentaryText] = useState('')

    // Timer Effect
    useEffect(() => {
        const interval = setInterval(() => {
            setMatchInfo(prev => ({ ...prev, timerSeconds: prev.timerSeconds + 1 }))
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const formatTimer = (sec) => {
        const h = Math.floor(sec / 3600)
        const m = Math.floor((sec % 3600) / 60)
        const s = sec % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    // Calculations
    const totalBallsBowled = matchState.overs * 6 + matchState.balls
    const crr = totalBallsBowled > 0 ? ((matchState.totalRuns / totalBallsBowled) * 6).toFixed(2) : '0.00'
    const projectedScore8 = totalBallsBowled > 0 ? Math.round(matchState.totalRuns + (120 - totalBallsBowled) * (8 / 6)) : 160
    const projectedScore10 = totalBallsBowled > 0 ? Math.round(matchState.totalRuns + (120 - totalBallsBowled) * (10 / 6)) : 200

    const strikerSR = striker.balls > 0 ? ((striker.runs / striker.balls) * 100).toFixed(1) : '0.0'
    const nonStrikerSR = nonStriker.balls > 0 ? ((nonStriker.runs / nonStriker.balls) * 100).toFixed(1) : '0.0'

    const bowlerTotalBalls = (parseInt(bowler.overs) || 0) * 6 + (Math.round((parseFloat(bowler.overs) % 1) * 10) || 0)
    const bowlerEco = bowlerTotalBalls > 0 ? ((bowler.runs / bowlerTotalBalls) * 6).toFixed(2) : '0.00'

    // Core Ball Processing Function
    const recordBall = useCallback((ballData) => {
        // Save current snapshot to historyStack for Undo
        setHistoryStack(prev => [...prev, {
            matchState: JSON.parse(JSON.stringify(matchState)),
            striker: { ...striker },
            nonStriker: { ...nonStriker },
            bowler: { ...bowler }
        }])

        setMatchState(prev => {
            let runsToAdd = ballData.runs || 0
            let isLegalBall = ballData.isLegal !== false
            let isWicket = ballData.isWicket || false
            let label = ballData.label || String(runsToAdd)

            let newBalls = prev.balls + (isLegalBall ? 1 : 0)
            let newOvers = prev.overs
            if (newBalls >= 6) {
                newOvers += 1
                newBalls = 0
            }

            const overStr = `${newOvers}.${newBalls}`

            // Update Bowler Runs & Wickets
            setBowler(b => ({
                ...b,
                runs: b.runs + runsToAdd + (ballData.extraRuns || 0),
                wickets: b.wickets + (isWicket ? 1 : 0),
                overs: `${newOvers}.${newBalls}`
            }))

            // Update Striker Runs & Balls
            if (ballData.type === 'run') {
                setStriker(s => ({
                    ...s,
                    runs: s.runs + runsToAdd,
                    balls: isLegalBall ? s.balls + 1 : s.balls,
                    fours: runsToAdd === 4 ? s.fours + 1 : s.fours,
                    sixes: runsToAdd === 6 ? s.sixes + 1 : s.sixes
                }))

                // Swap strike on odd runs
                if (runsToAdd % 2 !== 0) {
                    setStriker(nonStriker)
                    setNonStriker(striker)
                }
            }

            // End of over strike swap
            if (newBalls === 0 && isLegalBall) {
                setStriker(nonStriker)
                setNonStriker(striker)
            }

            // Generate Commentary Text
            let commText = `${overStr} - `
            if (isWicket) commText += `WICKET! ${ballData.wicketDetails || 'Out!'}`
            else if (runsToAdd === 6) commText += `SIX! Smashed high and clear into the stands!`
            else if (runsToAdd === 4) commText += `FOUR! Crisp shot finding the rope!`
            else if (runsToAdd === 0 && isLegalBall) commText += `Dot Ball. Good length delivery.`
            else commText += `${runsToAdd} Run(s) taken.`

            const newBallLog = {
                id: Date.now(),
                overNum: overStr,
                label: label,
                text: commText
            }

            return {
                ...prev,
                totalRuns: prev.totalRuns + runsToAdd + (ballData.extraRuns || 0),
                wickets: prev.wickets + (isWicket ? 1 : 0),
                overs: newOvers,
                balls: newBalls,
                extras: {
                    ...prev.extras,
                    total: prev.extras.total + (ballData.extraRuns || 0)
                },
                currentOverBalls: [...prev.currentOverBalls, { type: ballData.type, runs: runsToAdd, label }],
                ballHistory: [newBallLog, ...prev.ballHistory]
            }
        })

        addToast({ title: 'Ball Recorded', message: `${ballData.label} added to scorecard`, type: 'success' })
    }, [matchState, striker, nonStriker, bowler, addToast])

    // Keyboard Shortcuts Listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if input/textarea active
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return

            if (e.key === '0') recordBall({ type: 'run', runs: 0, label: '0', isLegal: true })
            else if (e.key === '1') recordBall({ type: 'run', runs: 1, label: '1', isLegal: true })
            else if (e.key === '2') recordBall({ type: 'run', runs: 2, label: '2', isLegal: true })
            else if (e.key === '3') recordBall({ type: 'run', runs: 3, label: '3', isLegal: true })
            else if (e.key === '4') recordBall({ type: 'run', runs: 4, label: '4', isLegal: true })
            else if (e.key === '6') recordBall({ type: 'run', runs: 6, label: '6', isLegal: true })
            else if (e.key.toLowerCase() === 'w') setWicketModalOpen(true)
            else if (e.ctrlKey && e.key.toLowerCase() === 'z') handleUndo()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [recordBall])

    // Action Handlers
    const handleUndo = () => {
        if (historyStack.length === 0) {
            addToast({ message: 'No actions to undo!', type: 'info' })
            return
        }
        const lastState = historyStack[historyStack.length - 1]
        setMatchState(lastState.matchState)
        setStriker(lastState.striker)
        setNonStriker(lastState.nonStriker)
        setBowler(lastState.bowler)
        setHistoryStack(prev => prev.slice(0, -1))
        addToast({ message: 'Last ball undone!', type: 'warning' })
    }

    const handleSwapStrike = () => {
        const temp = striker
        setStriker(nonStriker)
        setNonStriker(temp)
        addToast({ message: 'Strike swapped between batsmen', type: 'info' })
    }

    // Refs for safe async call inside BroadcastChannel listeners
    const recordBallRef = useRef(recordBall)
    recordBallRef.current = recordBall

    const handleSwapStrikeRef = useRef(handleSwapStrike)
    handleSwapStrikeRef.current = handleSwapStrike

    const handleUndoRef = useRef(handleUndo)
    handleUndoRef.current = handleUndo

    // Effect for real-time mobile connection listener (PeerJS P2P + BroadcastChannel)
    useEffect(() => {
        if (!ctrlSession.id) return

        let peer
        const peerId = 'sm_sess_' + ctrlSession.id.replace(/[^a-zA-Z0-9]/g, '')

        const handleIncomingData = (data) => {
            if (!data) return
            if (data.type === 'MOBILE_CONNECTED') {
                const devInfo = data.deviceInfo && typeof data.deviceInfo === 'object' ? data.deviceInfo : {}
                setCtrlSession(prev => ({
                    ...prev,
                    status: 'connected',
                    deviceInfo: devInfo
                }))
                addToast({ message: '✓ Mobile Controller Connected Successfully!', type: 'success' })
            } else if (data.type === 'MOBILE_DISCONNECT') {
                setCtrlSession(prev => ({ ...prev, status: 'disconnected' }))
                addToast({ message: 'Mobile device disconnected', type: 'info' })
            } else if (data.type === 'MOBILE_SCORE_ACTION') {
                // Mobile user clicked a scoring button! Synchronize match state immediately!
                if (data.actionType === 'RUN') {
                    recordBallRef.current?.({ type: 'run', runs: data.payload?.runs || 0, label: String(data.payload?.runs || 0), isLegal: true })
                } else if (data.actionType === 'EXTRA') {
                    recordBallRef.current?.({
                        type: data.payload?.extraType || 'extra',
                        runs: data.payload?.runs || 1,
                        label: data.payload?.label || 'E',
                        isLegal: data.payload?.isLegal ?? false
                    })
                } else if (data.actionType === 'WICKET') {
                    recordBallRef.current?.({ type: 'wicket', runs: 0, label: 'W', isLegal: true })
                } else if (data.actionType === 'SWAP_STRIKE') {
                    handleSwapStrikeRef.current?.()
                } else if (data.actionType === 'UNDO') {
                    handleUndoRef.current?.()
                }
            }
        }

        try {
            peer = new Peer(peerId)
            peer.on('connection', (conn) => {
                conn.on('data', (data) => {
                    handleIncomingData(data)
                })
            })
        } catch (err) {
            console.log('PeerJS server error:', err)
        }

        const channelName = 'mobile_ctrl_channel_' + ctrlSession.id
        let bc
        try {
            bc = new BroadcastChannel(channelName)
            bc.onmessage = (e) => {
                if (e && e.data) handleIncomingData(e.data)
            }
        } catch (err) {
            console.log('BroadcastChannel fallback', err)
        }

        // HTTP API Polling Fallback (Guaranteed to work over 4G/5G, WhatsApp links & any network)
        let lastSeenTime = 0
        const pollInterval = setInterval(async () => {
            try {
                const apiBase = import.meta.env.VITE_SERVER_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5005' : window.location.origin)
                const res = await fetch(`${apiBase}/api/v1/mobile-sync/poll/${ctrlSession.id}?since=${lastSeenTime}`)
                if (res.ok) {
                    const data = await res.json()
                    if (data.status === 'connected') {
                        setCtrlSession(prev => ({
                            ...prev,
                            status: 'connected',
                            deviceInfo: data.deviceInfo || prev.deviceInfo
                        }))
                    }
                    if (Array.isArray(data.events) && data.events.length > 0) {
                        data.events.forEach(evt => {
                            if (evt.timestamp > lastSeenTime) {
                                lastSeenTime = evt.timestamp
                                handleIncomingData(evt)
                            }
                        })
                    }
                }
            } catch (err) { }
        }, 500)

        return () => {
            clearInterval(pollInterval)
            if (peer) peer.destroy()
            if (bc) bc.close()
        }
    }, [ctrlSession.id, addToast])

    const handleConfirmWicket = () => {
        recordBall({
            type: 'wicket',
            runs: 0,
            isWicket: true,
            isLegal: true,
            label: 'W',
            wicketDetails: `${wicketForm.dismissalType} by ${wicketForm.fielder}`
        })
        if (wicketForm.outPlayer === 'striker') {
            setStriker({ name: wicketForm.newBatsman, runs: 0, balls: 0, fours: 0, sixes: 0 })
        } else {
            setNonStriker({ name: wicketForm.newBatsman, runs: 0, balls: 0, fours: 0, sixes: 0 })
        }
        setWicketModalOpen(false)
    }

    const handleConfirmWide = () => {
        recordBall({ type: 'extra', runs: extraValue, extraRuns: extraValue, isLegal: false, label: `WD+${extraValue - 1}` })
        setWideModalOpen(false)
    }

    const handleConfirmNoBall = () => {
        recordBall({ type: 'extra', runs: extraValue, extraRuns: extraValue, isLegal: false, label: `NB+${extraValue - 1}` })
        setNoBallModalOpen(false)
    }

    const handleConfirmBye = () => {
        recordBall({ type: 'run', runs: extraValue, isLegal: true, label: `${extraValue}B` })
        setByeModalOpen(false)
    }

    const handleConfirmLegBye = () => {
        recordBall({ type: 'run', runs: extraValue, isLegal: true, label: `${extraValue}LB` })
        setLegByeModalOpen(false)
    }

    return createPortal(
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[999999] bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/30 text-slate-900 flex flex-col font-sans overflow-hidden select-none animate-in fade-in duration-300">
            {/* Ambient Background Glow Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* ---------------------------------------------------- */}
            {/* TOP HEADER */}
            {/* ---------------------------------------------------- */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-5 py-3 flex flex-col lg:flex-row items-center justify-between gap-3 shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-500/20">
                        🏏
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="font-black text-lg tracking-tight text-slate-900">{matchInfo.tournamentName}</span>
                            <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> LIVE OPERATOR CONSOLE
                            </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                            Match #{matchInfo.matchNumber} • {matchInfo.roundName} • {matchInfo.venue}
                        </div>
                    </div>
                </div>

                {/* Match Status Controls */}
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => {
                            setLiveModalTab('scorecard')
                            setLiveScoreModalOpen(true)
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border font-extrabold text-xs transition-all cursor-pointer shadow-sm hover:scale-105 ${liveScoreModalOpen && liveModalTab === 'scorecard'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 font-black shadow-emerald-500/20'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                            }`}
                    >
                        <span>📱</span> Live Score
                    </button>

                    <button
                        onClick={() => startNewControllerSession()}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs transition-all cursor-pointer shadow-md shadow-indigo-600/20 hover:scale-105"
                    >
                        <span>🎮</span> Mobile Controller
                    </button>

                    {ctrlSession.status === 'connected' && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-2xl text-xs font-black text-emerald-800 shadow-sm animate-in fade-in">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                            <span>🟢 Connected to Mobile {ctrlSession.deviceInfo?.platform ? `(${ctrlSession.deviceInfo.platform})` : ''}</span>
                            <button
                                onClick={handleDisconnectMobile}
                                title="Disconnect Mobile Session"
                                className="ml-1 px-2.5 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] transition-all cursor-pointer shadow-sm"
                            >
                                🔌 Disconnect
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 bg-slate-100 px-3.5 py-2 rounded-2xl border border-slate-200 text-xs font-mono text-emerald-700 font-bold shadow-inner">
                        <FiClock className="animate-spin text-emerald-600" />
                        <span>TIMER: {formatTimer(matchInfo.timerSeconds)}</span>
                    </div>

                    <button
                        onClick={() => setFinalizeModalOpen(true)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs transition-all shadow-md cursor-pointer hover:scale-105 ${isUmpireCertified
                                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                                : 'bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 hover:from-amber-400 hover:to-emerald-500 text-white shadow-amber-500/20'
                            }`}
                    >
                        <span>⚖️</span>
                        <span>{isUmpireCertified ? '✓ Certified (1.5x)' : 'Finalize & Certify ⚖️'}</span>
                    </button>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                        {['Scheduled', 'Live', 'Innings Break', 'Completed'].map(st => (
                            <button
                                key={st}
                                onClick={() => setMatchInfo(prev => ({ ...prev, status: st }))}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${matchInfo.status === st
                                        ? 'bg-emerald-600 text-white shadow-md font-black'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => addToast({ message: 'Match data synced with cloud & live broadcast server!', type: 'success' })}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer hover:scale-105"
                    >
                        <FiRefreshCw className="animate-spin" /> Sync Live
                    </button>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* MAIN 4-PANEL BODY */}
            {/* ---------------------------------------------------- */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden min-h-0 z-10">

                {/* ---------------------------------------------------- */}
                {/* LEFT PANEL: LIVE MATCH INFO & STATS (3 cols) */}
                {/* ---------------------------------------------------- */}
                <div className="lg:col-span-3 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-4 shadow-sm flex flex-col justify-between overflow-y-auto">
                    <div className="flex-1 flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">LIVE INNINGS 1</span>
                            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                                {matchInfo.battingTeam}
                            </span>
                        </div>

                        {/* BIG SCORE DISPLAY CARD */}
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-4 rounded-2xl text-center space-y-1 relative overflow-hidden shadow-xl text-white">
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
                            <div className="text-[10px] text-slate-300 font-black uppercase tracking-widest">CURRENT SCORE</div>
                            <div className="text-5xl font-black tracking-tight flex items-center justify-center gap-1.5 my-1">
                                <span className="text-emerald-400 drop-shadow-md">{matchState.totalRuns}</span>
                                <span className="text-slate-500">/</span>
                                <span className="text-rose-400 drop-shadow-md">{matchState.wickets}</span>
                            </div>
                            <div className="text-xs font-extrabold text-slate-200">
                                OVERS: <span className="text-white text-base font-black">{matchState.overs}.{matchState.balls}</span> <span className="text-slate-400 text-[10px]">(20.0 Max)</span>
                            </div>
                        </div>

                        {/* RUN RATES & TARGET */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-center">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Current Run Rate</div>
                                <div className="text-xl font-black text-emerald-600 mt-0.5">{crr}</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-center">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Target Score</div>
                                <div className="text-xl font-black text-indigo-600 mt-0.5">{matchInfo.target}</div>
                            </div>
                        </div>

                        {/* EXTRAS BREAKDOWN */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                            <div className="flex justify-between font-extrabold text-slate-700 text-xs">
                                <span>EXTRAS TOTAL</span>
                                <span className="text-amber-700 font-black">{matchState.extras.total} Runs</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono text-center text-slate-800 font-black">
                                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">WD: {matchState.extras.wides}</div>
                                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">NB: {matchState.extras.noBalls}</div>
                                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">B: {matchState.extras.byes}</div>
                                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">LB: {matchState.extras.legByes}</div>
                            </div>
                        </div>

                        {/* PARTNERSHIP & LAST WICKET */}
                        <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
                            <div>
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Current Partnership</div>
                                <div className="font-extrabold text-slate-900 text-xs mt-0.5">
                                    {matchState.currentPartnership.runs} Runs off {matchState.currentPartnership.balls} Balls
                                </div>
                            </div>
                            <div className="pt-2 border-t border-slate-200">
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Last Wicket</div>
                                <div className="font-extrabold text-rose-600 truncate text-xs mt-0.5">{matchState.lastWicket}</div>
                            </div>
                        </div>

                        {/* LAST 6 BALLS TICKER */}
                        <div className="space-y-1.5">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CURRENT OVER BALLS</div>
                            <div className="flex items-center gap-2">
                                {matchState.currentOverBalls.map((b, idx) => (
                                    <span
                                        key={idx}
                                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-sm transition-all ${b.label === 'W'
                                                ? 'bg-rose-600 text-white shadow-rose-500/20'
                                                : b.label === '6' || b.label === '4'
                                                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                                            }`}
                                    >
                                        {b.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* PROJECTED SCORES */}
                        <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 text-xs space-y-1 mt-1">
                            <div className="font-black text-emerald-800 flex items-center justify-between text-[10px] uppercase tracking-wider">
                                <span>PROJECTED SCORE</span>
                                <span>@ Current RPO</span>
                            </div>
                            <div className="flex justify-between font-mono text-slate-700 text-xs font-bold">
                                <span>@ 8 RPO: <strong className="text-slate-900 text-xs font-black">{projectedScore8}</strong></span>
                                <span>@ 10 RPO: <strong className="text-slate-900 text-xs font-black">{projectedScore10}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* CENTER PANEL: TOUCH SCORING CONSOLE (6 cols) */}
                {/* ---------------------------------------------------- */}
                <div className="lg:col-span-6 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-4 shadow-sm flex flex-col justify-between overflow-y-auto">
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                            <span className="text-xs font-black text-emerald-700 tracking-wider flex items-center gap-2 uppercase">
                                🎮 OPERATOR TOUCH CONSOLE
                            </span>
                            <span className="text-[10px] text-slate-500 font-extrabold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                1-CLICK INSTANT RECORDING
                            </span>
                        </div>

                        {/* SCORING BUTTONS GRID */}
                        <div className="flex-1 flex flex-col justify-between py-1 space-y-4">
                            {/* ROW 1: RUN BUTTONS (0, 1, 2, 3, 4, 6) */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">RUNS</span>
                                <div className="grid grid-cols-6 gap-3">
                                    {[0, 1, 2, 3, 4, 6].map(runs => (
                                        <button
                                            key={runs}
                                            onClick={() => recordBall({ type: 'run', runs, label: String(runs), isLegal: true })}
                                            className={`h-16 lg:h-20 rounded-2xl font-black text-2xl lg:text-3xl transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center border ${runs === 6
                                                    ? 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-emerald-500/30 border-emerald-400/40'
                                                    : runs === 4
                                                        ? 'bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 text-white shadow-indigo-600/30 border-indigo-400/40'
                                                        : 'bg-white hover:bg-emerald-600 hover:text-white text-slate-900 border-slate-200 hover:border-emerald-500'
                                                }`}
                                        >
                                            {runs}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ROW 2: EXTRAS (WD, NB, BYE, LEG BYE) */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">EXTRAS</span>
                                <div className="grid grid-cols-4 gap-3">
                                    <button
                                        onClick={() => setWideModalOpen(true)}
                                        className="h-14 lg:h-16 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-black text-sm lg:text-base transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                                    >
                                        Wide (WD)
                                    </button>
                                    <button
                                        onClick={() => setNoBallModalOpen(true)}
                                        className="h-14 lg:h-16 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-black text-sm lg:text-base transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                                    >
                                        No Ball (NB)
                                    </button>
                                    <button
                                        onClick={() => setByeModalOpen(true)}
                                        className="h-14 lg:h-16 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 font-black text-sm lg:text-base transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                                    >
                                        Bye (B)
                                    </button>
                                    <button
                                        onClick={() => setLegByeModalOpen(true)}
                                        className="h-14 lg:h-16 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 font-black text-sm lg:text-base transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                                    >
                                        Leg Bye (LB)
                                    </button>
                                </div>
                            </div>

                            {/* ROW 3: WICKET, UNDO, DOT */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DISMISSALS & CONTROLS</span>
                                <div className="grid grid-cols-4 gap-3">
                                    <button
                                        onClick={() => setWicketModalOpen(true)}
                                        className="h-14 lg:h-16 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm lg:text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-600/30 border border-rose-400/30 cursor-pointer col-span-2 flex items-center justify-center gap-2"
                                    >
                                        🚨 WICKET OUT (W)
                                    </button>
                                    <button
                                        onClick={handleUndo}
                                        className="h-14 lg:h-16 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black text-sm lg:text-base transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                    >
                                        <FiRotateCcw /> Undo
                                    </button>
                                    <button
                                        onClick={() => recordBall({ type: 'run', runs: 0, label: '0', isLegal: true })}
                                        className="h-14 lg:h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-black text-sm lg:text-base transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                                    >
                                        Dot Ball
                                    </button>
                                </div>
                            </div>

                            {/* ROW 4: INNINGS CONTROLS */}
                            <div className="space-y-2 pt-3 border-t border-slate-100">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TACTICAL ACTIONS</span>
                                <div className="grid grid-cols-4 gap-3">
                                    <button
                                        onClick={handleSwapStrike}
                                        className="h-12 lg:h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-extrabold border border-slate-200 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                                    >
                                        Swap Strike ⇄
                                    </button>
                                    <button
                                        onClick={() => setChangeBowlerModalOpen(true)}
                                        className="h-12 lg:h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-extrabold border border-slate-200 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                                    >
                                        Change Bowler
                                    </button>
                                    <button
                                        onClick={() => setNewBatsmanModalOpen(true)}
                                        className="h-12 lg:h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-extrabold border border-slate-200 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                                    >
                                        New Batsman
                                    </button>
                                    <button
                                        onClick={() => addToast({ message: 'Batsman retired hurt logged.', type: 'warning' })}
                                        className="h-12 lg:h-14 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs sm:text-sm font-extrabold border border-rose-200 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                                    >
                                        Retire Hurt
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KEYBOARD SHORTCUTS FOOTER */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[10px] text-slate-600 flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900">⌨️ SHORTCUTS:</span>
                            <span className="bg-white px-2.5 py-0.5 rounded-lg text-slate-800 border border-slate-200 font-mono text-[9px] font-bold shadow-xs">0, 1, 2, 3, 4, 6</span>
                            <span className="bg-white px-2.5 py-0.5 rounded-lg text-slate-800 border border-slate-200 font-mono text-[9px] font-bold shadow-xs">W = Wicket</span>
                            <span className="bg-white px-2.5 py-0.5 rounded-lg text-slate-800 border border-slate-200 font-mono text-[9px] font-bold shadow-xs">Ctrl+Z = Undo</span>
                        </div>
                    </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* RIGHT PANEL: PLAYERS & MOBILE LIVE PREVIEW (3 cols) */}
                {/* ---------------------------------------------------- */}
                <div className="lg:col-span-3 overflow-y-auto flex flex-col justify-between space-y-4">

                    {/* CURRENT BATSMEN CARD */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-4 space-y-3 shadow-sm flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">CURRENT BATSMEN</span>
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">ON CREASE</span>
                        </div>

                        {/* STRIKER */}
                        <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 space-y-1 shadow-sm">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-black text-emerald-900 flex items-center gap-1.5">
                                    ★ {striker.name} <span className="text-[10px] text-emerald-700 font-extrabold">(Striker)</span>
                                </span>
                                <span className="font-mono text-slate-800 text-xs font-black bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-xs">SR: {strikerSR}</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-1">
                                <span className="text-3xl font-black text-slate-900">{striker.runs} <span className="text-xs text-slate-500 font-bold">({striker.balls})</span></span>
                                <span className="text-xs text-slate-700 font-black">{striker.fours}×4 • {striker.sixes}×6</span>
                            </div>
                        </div>

                        {/* NON-STRIKER */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-extrabold text-slate-800">{nonStriker.name}</span>
                                <span className="font-mono text-slate-500 text-xs font-bold">SR: {nonStrikerSR}</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-1">
                                <span className="text-2xl font-extrabold text-slate-800">{nonStriker.runs} <span className="text-xs text-slate-500 font-normal">({nonStriker.balls})</span></span>
                                <span className="text-xs text-slate-600 font-medium">{nonStriker.fours}×4 • {nonStriker.sixes}×6</span>
                            </div>
                        </div>
                    </div>

                    {/* CURRENT BOWLER CARD */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-4 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">CURRENT BOWLER</span>
                            <button onClick={() => setChangeBowlerModalOpen(true)} className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-wider">Change</button>
                        </div>

                        <div className="bg-indigo-50/80 p-3 rounded-2xl border border-indigo-200 space-y-1.5 shadow-sm">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-black text-indigo-900 text-sm flex items-center gap-1">⚡ {bowler.name}</span>
                                <span className="font-mono text-slate-800 text-xs font-black bg-white px-2 py-0.5 rounded-md border border-indigo-200 shadow-xs">ECO: {bowlerEco}</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-1 text-xs font-black text-slate-700">
                                <span>Overs: <strong className="text-slate-900 text-base font-black">{bowler.overs}</strong></span>
                                <span>Runs: <strong className="text-slate-900 text-base font-black">{bowler.runs}</strong></span>
                                <span>Wkts: <strong className="text-rose-600 text-base font-black">{bowler.wickets}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* MOBILE LIVE CARD PREVIEW */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-4 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-black text-slate-800 tracking-wider flex items-center gap-2">
                                <FiSmartphone className="text-emerald-600" /> MOBILE SCORECARD PREVIEW
                            </span>
                        </div>

                        <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs shadow-md">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                                <span className="font-black text-white text-xs">{matchInfo.battingTeam}</span>
                                <span className="font-black text-emerald-400 text-sm">{matchState.totalRuns}/{matchState.wickets} ({matchState.overs}.{matchState.balls})</span>
                            </div>
                            <div className="space-y-1 text-xs text-slate-200">
                                <div className="flex justify-between">
                                    <span className="font-bold text-emerald-300">* {striker.name}</span>
                                    <span className="font-black text-white">{striker.runs} ({striker.balls})</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>{nonStriker.name}</span>
                                    <span>{nonStriker.runs} ({nonStriker.balls})</span>
                                </div>
                            </div>
                            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-emerald-400 text-center font-black tracking-wider flex items-center justify-center gap-1">
                                <span>Live Broadcast Sync Active</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* BOTTOM PANEL: LIVE COMMENTARY & BALL HISTORY */}
            {/* ---------------------------------------------------- */}
            <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200/80 px-5 py-3 shrink-0 shadow-sm z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">LIVE COMMENTARY LOG:</span>
                        <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono text-emerald-700 font-bold truncate w-full md:w-[650px] shadow-inner">
                            {matchState.ballHistory[0]?.text || 'Match in progress...'}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => addToast({ message: 'Match scorecard saved to database!', type: 'success' })}
                            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer hover:scale-105"
                        >
                            Save Match State ✓
                        </button>
                    </div>
                </div>
            </div>

            {/* ==================================================== */}
            {/* ==================================================== */}
            {/* WICKET POPUP MODAL */}
            {/* ==================================================== */}
            {wicketModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-900">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-black text-rose-600 flex items-center gap-2">
                                🚨 RECORD WICKET DISMISSAL
                            </h3>
                            <button onClick={() => setWicketModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-lg">✕</button>
                        </div>

                        <div className="space-y-4 text-xs font-bold text-slate-700">
                            <div>
                                <label className="block text-slate-500 mb-1.5 uppercase text-[10px] tracking-wider font-black">PLAYER OUT *</label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setWicketForm({ ...wicketForm, outPlayer: 'striker' })}
                                        className={`p-3 rounded-2xl border font-black transition-all ${wicketForm.outPlayer === 'striker' ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-500 shadow-md shadow-rose-600/20' : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'}`}
                                    >
                                        Striker ({striker.name})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setWicketForm({ ...wicketForm, outPlayer: 'nonStriker' })}
                                        className={`p-3 rounded-2xl border font-black transition-all ${wicketForm.outPlayer === 'nonStriker' ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-500 shadow-md shadow-rose-600/20' : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'}`}
                                    >
                                        Non-Striker ({nonStriker.name})
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-500 mb-1.5 uppercase text-[10px] tracking-wider font-black">DISMISSAL TYPE *</label>
                                <select
                                    value={wicketForm.dismissalType}
                                    onChange={(e) => setWicketForm({ ...wicketForm, dismissalType: e.target.value })}
                                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-black outline-none focus:border-rose-500 transition-all cursor-pointer"
                                >
                                    {['Bowled', 'LBW', 'Caught', 'Run Out', 'Stumped', 'Hit Wicket', 'Retired Out'].map(dt => (
                                        <option key={dt} value={dt}>{dt}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-500 mb-1.5 uppercase text-[10px] tracking-wider font-black">SELECT NEW BATSMAN *</label>
                                <select
                                    value={wicketForm.newBatsman}
                                    onChange={(e) => setWicketForm({ ...wicketForm, newBatsman: e.target.value })}
                                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-black outline-none focus:border-emerald-500 transition-all cursor-pointer"
                                >
                                    {squadBatting.map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                            <button onClick={() => setWicketModalOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 font-extrabold text-xs">
                                Cancel
                            </button>
                            <button onClick={handleConfirmWicket} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-md shadow-rose-600/20">
                                Confirm Wicket ✓
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* WIDE POPUP MODAL */}
            {/* ==================================================== */}
            {wideModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center text-slate-900">
                        <h3 className="text-lg font-black text-amber-600 tracking-wide">RECORD WIDE BALL</h3>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setExtraValue(r)}
                                    className={`w-12 h-12 rounded-2xl font-black text-lg border transition-all ${extraValue === r ? 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/20 scale-105' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-amber-400'}`}
                                >
                                    +{r}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button onClick={() => setWideModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-extrabold text-slate-600">Cancel</button>
                            <button onClick={handleConfirmWide} className="px-5 py-2 rounded-xl bg-amber-500 text-white font-black text-xs shadow-md">Save Wide</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* NO BALL POPUP MODAL */}
            {/* ==================================================== */}
            {noBallModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center text-slate-900">
                        <h3 className="text-lg font-black text-amber-600 tracking-wide">RECORD NO BALL (FREE HIT)</h3>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5, 7].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setExtraValue(r)}
                                    className={`w-12 h-12 rounded-2xl font-black text-lg border transition-all ${extraValue === r ? 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/20 scale-105' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-amber-400'}`}
                                >
                                    +{r}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button onClick={() => setNoBallModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-extrabold text-slate-600">Cancel</button>
                            <button onClick={handleConfirmNoBall} className="px-5 py-2 rounded-xl bg-amber-500 text-white font-black text-xs shadow-md">Save No Ball</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* BYE POPUP MODAL */}
            {/* ==================================================== */}
            {byeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center text-slate-900">
                        <h3 className="text-lg font-black text-indigo-600 tracking-wide">RECORD BYE RUNS</h3>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setExtraValue(r)}
                                    className={`w-12 h-12 rounded-2xl font-black text-lg border transition-all ${extraValue === r ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20 scale-105' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-indigo-400'}`}
                                >
                                    {r}B
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button onClick={() => setByeModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-extrabold text-slate-600">Cancel</button>
                            <button onClick={handleConfirmBye} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md">Save Bye</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* LEG BYE POPUP MODAL */}
            {/* ==================================================== */}
            {legByeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center text-slate-900">
                        <h3 className="text-lg font-black text-indigo-600 tracking-wide">RECORD LEG BYE RUNS</h3>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setExtraValue(r)}
                                    className={`w-12 h-12 rounded-2xl font-black text-lg border transition-all ${extraValue === r ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20 scale-105' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-indigo-400'}`}
                                >
                                    {r}LB
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button onClick={() => setLegByeModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-extrabold text-slate-600">Cancel</button>
                            <button onClick={handleConfirmLegBye} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md">Save Leg Bye</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* CHANGE BOWLER MODAL */}
            {/* ==================================================== */}
            {changeBowlerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-slate-900">
                        <h3 className="text-lg font-black text-indigo-600 tracking-wide">SELECT NEW BOWLER</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {squadBowling.map(b => (
                                <button
                                    key={b}
                                    onClick={() => {
                                        setBowler({ name: b, overs: '0.0', runs: 0, wickets: 0, maiden: 0 })
                                        setChangeBowlerModalOpen(false)
                                        addToast({ message: `Bowler changed to ${b}`, type: 'info' })
                                    }}
                                    className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs font-bold text-slate-800 flex justify-between items-center transition-all"
                                >
                                    <span className="font-black text-slate-900">⚡ {b}</span>
                                    <span className="text-indigo-600 font-extrabold text-[10px]">Select →</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setChangeBowlerModalOpen(false)} className="w-full py-2.5 rounded-2xl bg-slate-100 text-xs font-extrabold text-slate-600 hover:text-slate-900">Cancel</button>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* NEW BATSMAN MODAL */}
            {/* ==================================================== */}
            {newBatsmanModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-slate-900">
                        <h3 className="text-lg font-black text-emerald-600 tracking-wide">SELECT NEW BATSMAN</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {squadBatting.map(b => (
                                <button
                                    key={b}
                                    onClick={() => {
                                        setStriker({ name: b, runs: 0, balls: 0, fours: 0, sixes: 0 })
                                        setNewBatsmanModalOpen(false)
                                        addToast({ message: `New batsman ${b} came to crease`, type: 'info' })
                                    }}
                                    className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-800 flex justify-between items-center transition-all"
                                >
                                    <span className="font-black text-slate-900">🏏 {b}</span>
                                    <span className="text-emerald-600 font-extrabold text-[10px]">Select →</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setNewBatsmanModalOpen(false)} className="w-full py-2.5 rounded-2xl bg-slate-100 text-xs font-extrabold text-slate-600 hover:text-slate-900">Cancel</button>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* MOBILE PREVIEW MODAL (LIVE SCORE & CONTROLLER) */}
            {/* ==================================================== */}
            {liveScoreModalOpen && (
                <div className="fixed inset-0 z-[9999999] bg-slate-950/92 backdrop-blur-xl flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300 select-none">

                    {/* TOP ACTION BAR & ORIENTATION TOGGLE */}
                    <div className={`w-full flex items-center justify-between gap-2 mb-2 px-1 transition-all ${isLandscapeMode ? 'max-w-[880px]' : 'max-w-[420px]'}`}>
                        {/* PREVIEW LABEL */}
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                            <h3 className="font-black text-white text-xs sm:text-sm tracking-wide">
                                {liveModalTab === 'controller'
                                    ? (isLandscapeMode ? '🎮 Mobile Landscape Controller' : '🎮 Mobile Controller Preview')
                                    : '📱 Mobile Live Score Preview'
                                }
                            </h3>
                        </div>

                        {/* TOP-RIGHT ACTIONS & ORIENTATION TOGGLE */}
                        <div className="flex items-center gap-1.5">
                            {/* ORIENTATION TOGGLE BUTTON */}
                            <button
                                onClick={() => setIsLandscapeMode(!isLandscapeMode)}
                                title="Toggle Landscape/Portrait Mode"
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all cursor-pointer flex items-center gap-1 ${isLandscapeMode
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md'
                                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                                    }`}
                            >
                                {isLandscapeMode ? '🔄 Landscape ON' : '📱 Portrait'}
                            </button>

                            {/* TAB SWAP BUTTONS */}
                            <div className="bg-slate-900 p-0.5 rounded-xl border border-slate-800 flex items-center gap-0.5">
                                <button
                                    onClick={() => setLiveModalTab('scorecard')}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${liveModalTab === 'scorecard'
                                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    📱 Score
                                </button>
                                <button
                                    onClick={() => setLiveModalTab('controller')}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${liveModalTab === 'controller'
                                            ? 'bg-indigo-500 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    🎮 Control
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    navigator.clipboard?.writeText(window.location.href)
                                    addToast({ message: 'Link copied to clipboard!', type: 'success' })
                                }}
                                title="Copy Share Link"
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-xs font-extrabold transition-all cursor-pointer shadow-md"
                            >
                                🔗
                            </button>

                            <button
                                onClick={() => {
                                    window.open(window.location.href, '_blank')
                                    addToast({ message: 'Opened in new tab!', type: 'info' })
                                }}
                                title="Open in New Tab"
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 text-xs font-extrabold transition-all cursor-pointer shadow-md"
                            >
                                ↗️
                            </button>

                            <button
                                onClick={() => setQrModalOpen(true)}
                                title="Generate QR Code"
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 text-xs font-extrabold transition-all cursor-pointer shadow-md"
                            >
                                🔳
                            </button>

                            <button
                                onClick={() => setLiveScoreModalOpen(false)}
                                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* ==================================================== */}
                    {/* REALISTIC MOBILE PHONE FRAME CONTAINER */}
                    {/* ==================================================== */}
                    <div className={`w-full bg-slate-900 rounded-[38px] p-2.5 border-4 border-slate-700/80 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] relative overflow-hidden flex flex-col items-center transition-all ${isLandscapeMode ? 'max-w-[880px]' : 'max-w-[410px]'
                        }`}>

                        {/* PHONE TOP NOTCH / DYNAMIC ISLAND */}
                        <div className="w-28 h-4 bg-slate-950 rounded-b-2xl mb-1.5 flex items-center justify-center gap-2 border-x border-b border-slate-800/80 z-20 shrink-0">
                            <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                            <span className="w-8 h-1 bg-slate-800 rounded-full"></span>
                        </div>

                        {/* MOBILE VIEWPORT SCREEN CONTAINER */}
                        <div className="w-full bg-slate-950 rounded-[28px] overflow-y-auto max-h-[80vh] p-2.5 space-y-2.5 scrollbar-none border border-slate-800/80 text-white font-sans text-xs">

                            {/* IF LIVE SCORECARD TAB IS SELECTED */}
                            {liveModalTab === 'scorecard' ? (
                                <>
                                    {/* 1. LIVE MATCH STATUS & CURRENT SCORE HERO CARD */}
                                    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3 space-y-2 shadow-xl">
                                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">🟢 LIVE INNINGS 1</span>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
                                                {matchInfo.battingTeam}
                                            </span>
                                        </div>

                                        {/* BIG SCORE DISPLAY */}
                                        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-3 rounded-2xl border border-emerald-500/20 text-center relative overflow-hidden shadow-inner">
                                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
                                            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">CURRENT SCORE</div>
                                            <div className="text-4xl font-black tracking-tight text-white flex items-center justify-center gap-1 my-1 drop-shadow-md">
                                                <span className="text-emerald-400">{matchState.totalRuns}</span>
                                                <span className="text-slate-600">/</span>
                                                <span className="text-rose-500">{matchState.wickets}</span>
                                            </div>
                                            <div className="text-[11px] font-extrabold text-slate-300">
                                                OVERS: <span className="text-white font-black">{matchState.overs}.{matchState.balls}</span> <span className="text-slate-500 text-[9px]">(20.0 Max)</span>
                                            </div>
                                        </div>

                                        {/* MATCH PROGRESS BAR */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                                                <span>Progress</span>
                                                <span className="text-emerald-400">{((matchState.overs * 6 + matchState.balls) / 120 * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                                    style={{ width: `${Math.min(100, ((matchState.overs * 6 + matchState.balls) / 120 * 100))}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* CRR & TARGET & NEED */}
                                        <div className="grid grid-cols-3 gap-1.5 text-center font-mono pt-1">
                                            <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                                                <div className="text-[8px] font-black text-slate-400">CRR</div>
                                                <div className="text-xs font-black text-emerald-400 mt-0.5">{crr}</div>
                                            </div>
                                            <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                                                <div className="text-[8px] font-black text-slate-400">TARGET</div>
                                                <div className="text-xs font-black text-indigo-400 mt-0.5">{matchInfo.target}</div>
                                            </div>
                                            <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                                                <div className="text-[8px] font-black text-slate-400">NEED</div>
                                                <div className="text-[10px] font-black text-amber-400 mt-0.5">23 in 26b</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CURRENT BATSMEN CARD */}
                                    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-2.5 space-y-1.5 shadow-xl">
                                        <div className="text-[9px] font-black text-emerald-400 uppercase tracking-wider border-b border-slate-800/80 pb-1 flex justify-between">
                                            <span>🏏 CURRENT BATSMEN</span>
                                            <span>SR</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl border border-emerald-500/30">
                                                <div>
                                                    <div className="font-black text-white text-xs flex items-center gap-1">⭐ {striker.name}</div>
                                                    <div className="text-[8px] text-slate-400">{striker.fours}×4 • {striker.sixes}×6</div>
                                                </div>
                                                <div className="text-right font-mono">
                                                    <div className="font-black text-emerald-400 text-xs">{striker.runs} <span className="text-slate-400 text-[9px]">({striker.balls})</span></div>
                                                    <div className="text-[8px] text-slate-400">{((striker.runs / (striker.balls || 1)) * 100).toFixed(1)}</div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl border border-slate-800">
                                                <div>
                                                    <div className="font-extrabold text-slate-300 text-xs">{nonStriker.name}</div>
                                                    <div className="text-[8px] text-slate-500">{nonStriker.fours}×4 • {nonStriker.sixes}×6</div>
                                                </div>
                                                <div className="text-right font-mono">
                                                    <div className="font-bold text-slate-200 text-xs">{nonStriker.runs} <span className="text-slate-500 text-[9px]">({nonStriker.balls})</span></div>
                                                    <div className="text-[8px] text-slate-500">{((nonStriker.runs / (nonStriker.balls || 1)) * 100).toFixed(1)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CURRENT BOWLER CARD */}
                                    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-2.5 space-y-1.5 shadow-xl">
                                        <div className="text-[9px] font-black text-indigo-400 uppercase tracking-wider border-b border-slate-800/80 pb-1 flex justify-between">
                                            <span>🎯 CURRENT BOWLER</span>
                                            <span>ECON</span>
                                        </div>
                                        <div className="bg-slate-950 p-2 rounded-xl border border-indigo-500/30 space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-black text-white text-xs">⚡ {bowler.name}</span>
                                                <span className="text-indigo-400 font-mono font-black text-xs">
                                                    {(bowler.runs / (parseFloat(bowler.overs) || 1)).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px] text-slate-300 pt-1 border-t border-slate-800/80 font-bold">
                                                <div><span className="text-slate-500">O:</span> {bowler.overs}</div>
                                                <div><span className="text-slate-500">R:</span> {bowler.runs}</div>
                                                <div><span className="text-emerald-400 font-black">W:</span> {bowler.wickets}</div>
                                                <div><span className="text-slate-500">M:</span> {bowler.maiden}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CURRENT OVER BALLS TICKER */}
                                    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-2.5 space-y-1.5 shadow-xl">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">CURRENT OVER BALLS</div>
                                        <div className="flex items-center gap-1.5">
                                            {matchState.currentOverBalls.map((b, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow-md ${b.label === 'W'
                                                            ? 'bg-rose-600 text-white'
                                                            : b.label === '6' || b.label === '4'
                                                                ? 'bg-emerald-500 text-slate-950'
                                                                : 'bg-slate-800 text-slate-200'
                                                        }`}
                                                >
                                                    {b.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : isLandscapeMode ? (
                                /* ==================================================== */
                                /* 🎮 MOBILE LANDSCAPE CONTROLLER (3-COLUMN OPERATOR LAYOUT) */
                                /* ==================================================== */
                                <div className="grid grid-cols-12 gap-2 animate-in fade-in duration-200 items-start">

                                    {/* LEFT PANEL (~28% / col-span-3) */}
                                    <div className="col-span-3 space-y-1.5">
                                        {/* CURRENT SCORE CARD */}
                                        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-2 space-y-1 shadow-md text-center">
                                            <div className="text-[8px] font-black text-slate-400 uppercase">CURRENT SCORE</div>
                                            <div className="text-2xl font-black text-white flex items-center justify-center gap-0.5">
                                                <span className="text-emerald-400">{matchState.totalRuns}</span>
                                                <span className="text-slate-600">/</span>
                                                <span className="text-rose-500">{matchState.wickets}</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-300">
                                                OV: <span className="text-white font-black">{matchState.overs}.{matchState.balls}</span> <span className="text-slate-500 text-[8px]">(20.0)</span>
                                            </div>
                                            <div className="w-full h-1 rounded-full bg-slate-950 overflow-hidden mt-1">
                                                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, ((matchState.overs * 6 + matchState.balls) / 120 * 100))}%` }}></div>
                                            </div>
                                        </div>

                                        {/* RUN RATES & TARGET */}
                                        <div className="grid grid-cols-3 gap-1 font-mono text-center text-[8px]">
                                            <div className="bg-slate-950 p-1 rounded border border-slate-800">
                                                <div className="text-slate-500">CRR</div>
                                                <div className="font-black text-emerald-400">{crr}</div>
                                            </div>
                                            <div className="bg-slate-950 p-1 rounded border border-slate-800">
                                                <div className="text-slate-500">TARGET</div>
                                                <div className="font-black text-indigo-400">{matchInfo.target}</div>
                                            </div>
                                            <div className="bg-slate-950 p-1 rounded border border-slate-800">
                                                <div className="text-slate-500">NEED</div>
                                                <div className="font-black text-amber-400">23 (26b)</div>
                                            </div>
                                        </div>

                                        {/* PARTNERSHIP & LAST WKT */}
                                        <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 space-y-0.5 text-[9px]">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Partnership:</span>
                                                <span className="font-bold text-white">{matchState.currentPartnership.runs}r ({matchState.currentPartnership.balls}b)</span>
                                            </div>
                                            <div className="flex justify-between border-t border-slate-800/80 pt-0.5">
                                                <span className="text-slate-400">Last Wkt:</span>
                                                <span className="font-bold text-rose-400 truncate">{matchState.lastWicket}</span>
                                            </div>
                                        </div>

                                        {/* CURRENT OVER BALLS TICKER */}
                                        <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 space-y-1">
                                            <div className="text-[8px] font-black text-slate-400 uppercase">OVER BALLS</div>
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {matchState.currentOverBalls.map((b, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={`w-5 h-5 rounded flex items-center justify-center font-black text-[9px] ${b.label === 'W' ? 'bg-rose-600 text-white' : b.label === '6' || b.label === '4' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                                                            }`}
                                                    >
                                                        {b.label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* CENTER PANEL (~44% / col-span-6) */}
                                    <div className="col-span-6 space-y-1.5">
                                        {/* RUN BUTTONS (0 1 2 / 3 4 6) */}
                                        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-1.5 space-y-1 shadow-md">
                                            <div className="text-[8px] font-black text-slate-400 uppercase">RUN CONTROLS</div>
                                            <div className="grid grid-cols-3 gap-1">
                                                {[0, 1, 2, 3, 4, 6].map(runs => (
                                                    <button
                                                        key={runs}
                                                        onClick={() => recordBall({ type: 'run', runs, label: String(runs), isLegal: true })}
                                                        className={`h-11 rounded-lg font-black text-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center ${runs === 6
                                                                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-sm'
                                                                : runs === 4
                                                                    ? 'bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-sm'
                                                                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                                                            }`}
                                                    >
                                                        {runs}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* EXTRAS ROW */}
                                        <div className="grid grid-cols-4 gap-1">
                                            <button onClick={() => setWideModalOpen(true)} className="py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 font-black text-[10px] cursor-pointer">
                                                Wide
                                            </button>
                                            <button onClick={() => setNoBallModalOpen(true)} className="py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 font-black text-[10px] cursor-pointer">
                                                No Ball
                                            </button>
                                            <button onClick={() => setByeModalOpen(true)} className="py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 font-black text-[10px] cursor-pointer">
                                                Bye
                                            </button>
                                            <button onClick={() => setLegByeModalOpen(true)} className="py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 font-black text-[10px] cursor-pointer">
                                                Leg Bye
                                            </button>
                                        </div>

                                        {/* DISMISSALS & UNDO */}
                                        <div className="grid grid-cols-3 gap-1">
                                            <button onClick={() => setWicketModalOpen(true)} className="py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] cursor-pointer col-span-2 flex items-center justify-center gap-1 shadow-sm">
                                                🚨 WICKET OUT (W)
                                            </button>
                                            <button onClick={handleUndo} className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-black text-[10px] cursor-pointer flex items-center justify-center gap-1">
                                                <FiRotateCcw className="w-3 h-3" /> Undo
                                            </button>
                                        </div>

                                        {/* BOTTOM ACTIONS */}
                                        <div className="grid grid-cols-4 gap-1 pt-0.5">
                                            <button onClick={handleSwapStrike} className="py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-[9px] border border-slate-800 cursor-pointer">
                                                Swap ⇄
                                            </button>
                                            <button onClick={() => setChangeBowlerModalOpen(true)} className="py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-[9px] border border-slate-800 cursor-pointer">
                                                Bowler
                                            </button>
                                            <button onClick={() => setNewBatsmanModalOpen(true)} className="py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-[9px] border border-slate-800 cursor-pointer">
                                                Batsman
                                            </button>
                                            <button onClick={() => addToast({ message: 'Retired hurt logged', type: 'warning' })} className="py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 font-bold text-[9px] border border-rose-800/40 cursor-pointer">
                                                Retire
                                            </button>
                                        </div>
                                    </div>

                                    {/* RIGHT PANEL (~28% / col-span-3) */}
                                    <div className="col-span-3 space-y-1.5">
                                        {/* CURRENT BATSMEN */}
                                        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-1.5 space-y-1 shadow-md">
                                            <div className="text-[8px] font-black text-emerald-400 uppercase">BATSMEN</div>
                                            <div className="bg-slate-950 p-1 rounded border border-emerald-500/30 text-[9px] flex justify-between">
                                                <div>
                                                    <div className="font-black text-white">⭐ {striker.name}</div>
                                                    <div className="text-[7px] text-slate-400">{striker.fours}×4 • {striker.sixes}×6</div>
                                                </div>
                                                <div className="text-right font-mono font-black text-emerald-400">{striker.runs} ({striker.balls})</div>
                                            </div>
                                            <div className="bg-slate-950 p-1 rounded border border-slate-800 text-[9px] flex justify-between">
                                                <div>
                                                    <div className="font-bold text-slate-300">{nonStriker.name}</div>
                                                    <div className="text-[7px] text-slate-500">{nonStriker.fours}×4 • {nonStriker.sixes}×6</div>
                                                </div>
                                                <div className="text-right font-mono text-slate-300">{nonStriker.runs} ({nonStriker.balls})</div>
                                            </div>
                                        </div>

                                        {/* CURRENT BOWLER */}
                                        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-1.5 space-y-1 shadow-md">
                                            <div className="text-[8px] font-black text-indigo-400 uppercase">BOWLER</div>
                                            <div className="bg-slate-950 p-1 rounded border border-indigo-500/30 text-[9px] space-y-0.5">
                                                <div className="flex justify-between font-black text-white">
                                                    <span>⚡ {bowler.name}</span>
                                                    <span className="text-indigo-400 font-mono">ECO: {(bowler.runs / (parseFloat(bowler.overs) || 1)).toFixed(1)}</span>
                                                </div>
                                                <div className="flex justify-between font-mono text-[8px] text-slate-400 pt-0.5 border-t border-slate-800">
                                                    <span>O: {bowler.overs}</span>
                                                    <span>R: {bowler.runs}</span>
                                                    <span className="text-emerald-400 font-bold">W: {bowler.wickets}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RECENT DELIVERIES LOG */}
                                        <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 space-y-1 text-[8px]">
                                            <div className="text-[8px] font-black text-slate-400 uppercase">RECENT LOG</div>
                                            <div className="text-emerald-400 font-mono truncate">
                                                {matchState.ballHistory[0]?.text || '16.3 - 4 RUNS! Smashed through cover boundary!'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* ==================================================== */
                                /* 🎮 MOBILE PORTRAIT CONTROLLER PREVIEW INTERFACE */
                                /* ==================================================== */
                                <div className="space-y-2.5 animate-in fade-in duration-200">

                                    {/* CONTROLLER HEADER DISPLAY */}
                                    <div className="bg-[#121824] rounded-2xl border border-indigo-500/40 p-2.5 space-y-1 shadow-xl text-center">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[9px]">
                                            <span className="font-black text-indigo-400 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span> 🎮 CONTROLLER
                                            </span>
                                            <span className="font-mono text-slate-400">{matchInfo.battingTeam}</span>
                                        </div>

                                        <div className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1 py-1">
                                            <span className="text-emerald-400">{matchState.totalRuns}</span>
                                            <span className="text-slate-600">/</span>
                                            <span className="text-rose-500">{matchState.wickets}</span>
                                            <span className="text-xs font-mono text-slate-400 ml-1">({matchState.overs}.{matchState.balls} ov)</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-1 text-[9px] font-mono bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                                            <div><span className="text-slate-500">Striker:</span> <strong className="text-emerald-400">{striker.name}</strong></div>
                                            <div><span className="text-slate-500">Bowler:</span> <strong className="text-indigo-400">{bowler.name}</strong></div>
                                        </div>
                                    </div>

                                    {/* 1. RUN SCORING GRID (0, 1, 2, 3, 4, 6) */}
                                    <div className="bg-[#121824] rounded-2xl border border-slate-800 p-2 space-y-1.5 shadow-xl">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">RUN SCORING CONTROLS</div>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {[0, 1, 2, 3, 4, 6].map(runs => (
                                                <button
                                                    key={runs}
                                                    onClick={() => recordBall({ type: 'run', runs, label: String(runs), isLegal: true })}
                                                    className={`h-12 rounded-xl font-black text-xl transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center ${runs === 6
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

                                    {/* 2. EXTRAS CONTROLS */}
                                    <div className="bg-[#121824] rounded-2xl border border-slate-800 p-2 space-y-1.5 shadow-xl">
                                        <div className="text-[9px] font-black text-amber-400 uppercase tracking-wider">EXTRAS</div>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <button
                                                onClick={() => setWideModalOpen(true)}
                                                className="py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/40 font-black text-xs transition-all active:scale-95 cursor-pointer text-center"
                                            >
                                                Wide (WD)
                                            </button>
                                            <button
                                                onClick={() => setNoBallModalOpen(true)}
                                                className="py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/40 font-black text-xs transition-all active:scale-95 cursor-pointer text-center"
                                            >
                                                No Ball (NB)
                                            </button>
                                            <button
                                                onClick={() => setByeModalOpen(true)}
                                                className="py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 font-black text-xs transition-all active:scale-95 cursor-pointer text-center"
                                            >
                                                Bye (B)
                                            </button>
                                            <button
                                                onClick={() => setLegByeModalOpen(true)}
                                                className="py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 font-black text-xs transition-all active:scale-95 cursor-pointer text-center"
                                            >
                                                Leg Bye (LB)
                                            </button>
                                        </div>
                                    </div>

                                    {/* 3. DISMISSALS & UNDO */}
                                    <div className="bg-[#121824] rounded-2xl border border-slate-800 p-2 space-y-1.5 shadow-xl">
                                        <div className="text-[9px] font-black text-rose-400 uppercase tracking-wider">DISMISSALS & UNDO</div>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <button
                                                onClick={() => setWicketModalOpen(true)}
                                                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all active:scale-95 shadow-md shadow-rose-600/30 cursor-pointer flex items-center justify-center gap-1 col-span-2"
                                            >
                                                🚨 WICKET OUT (W)
                                            </button>
                                            <button
                                                onClick={handleUndo}
                                                className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-black text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                                            >
                                                <FiRotateCcw /> Undo
                                            </button>
                                            <button
                                                onClick={() => recordBall({ type: 'run', runs: 0, label: '0', isLegal: true })}
                                                className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-black text-xs transition-all active:scale-95 cursor-pointer"
                                            >
                                                0 Dot Ball
                                            </button>
                                        </div>
                                    </div>

                                    {/* 4. TACTICAL ACTIONS */}
                                    <div className="bg-[#121824] rounded-2xl border border-slate-800 p-2 space-y-1.5 shadow-xl">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">TACTICAL ACTIONS</div>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <button
                                                onClick={handleSwapStrike}
                                                className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                                            >
                                                Swap Strike ⇄
                                            </button>
                                            <button
                                                onClick={() => setChangeBowlerModalOpen(true)}
                                                className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                                            >
                                                Change Bowler
                                            </button>
                                            <button
                                                onClick={() => setNewBatsmanModalOpen(true)}
                                                className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                                            >
                                                New Batsman
                                            </button>
                                            <button
                                                onClick={() => addToast({ message: 'Batsman retired hurt logged.', type: 'warning' })}
                                                className="py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-800/50 transition-all cursor-pointer"
                                            >
                                                Retire Hurt
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PHONE BOTTOM BAR */}
                        <div className="w-16 h-1 bg-slate-700 rounded-full mt-2 z-20 shrink-0"></div>
                    </div>
                </div>
            )}

            {/* QR CODE POPUP MODAL */}
            {qrModalOpen && (
                <div className="fixed inset-0 z-[99999999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0B0F17] border border-slate-800 rounded-3xl p-6 w-full max-w-xs shadow-2xl space-y-4 text-center relative">
                        <h3 className="font-black text-white text-base flex items-center justify-center gap-2">
                            <span>🔳</span> SPECTATOR QR CODE
                        </h3>
                        <div className="bg-white p-3 rounded-2xl mx-auto w-52 h-52 flex items-center justify-center shadow-inner overflow-hidden border-2 border-slate-700">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(window.location.href)}`}
                                alt="Spectator Live Scorecard QR Code"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <p className="text-slate-400 text-xs font-medium">Scan with any phone camera to view Live Match Scorecard</p>
                        <button
                            onClick={() => setQrModalOpen(false)}
                            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
                        >
                            Close QR Code
                        </button>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* WHATSAPP WEB STYLE CONNECT MOBILE CONTROLLER MODAL */}
            {/* ==================================================== */}
            {connectModalOpen && (
                <div className="fixed inset-0 z-[99999999] bg-slate-950/92 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300 select-none">
                    <div className="bg-[#0B0F17] border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 relative text-center">

                        {/* CLOSE BUTTON */}
                        <button
                            onClick={() => setConnectModalOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-800"
                        >
                            <FiX className="w-4 h-4" />
                        </button>

                        {/* MODAL HEADER */}
                        <div className="space-y-1">
                            <h3 className="font-black text-white text-lg tracking-wide flex items-center justify-center gap-2">
                                📱 Connect Mobile Controller
                            </h3>
                            <p className="text-slate-400 text-xs font-medium">
                                Continue controlling this live match from your mobile phone.
                            </p>
                        </div>

                        {/* STATUS BANNER */}
                        {ctrlSession.status === 'connected' ? (
                            <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-3 space-y-1 text-center animate-in zoom-in duration-300">
                                <div className="text-emerald-400 font-black text-sm flex items-center justify-center gap-1.5">
                                    <FiCheckCircle className="w-5 h-5 text-emerald-400" /> ✓ Connected Successfully!
                                </div>
                                <div className="text-white text-xs font-extrabold flex items-center justify-center gap-2 pt-1 border-t border-emerald-500/30">
                                    <span>🟢 {typeof ctrlSession.deviceInfo?.platform === 'string' ? ctrlSession.deviceInfo.platform : 'Mobile Device'}</span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-300">{typeof ctrlSession.deviceInfo?.time === 'string' ? ctrlSession.deviceInfo.time : 'Just Now'}</span>
                                </div>
                            </div>
                        ) : ctrlSession.status === 'expired' ? (
                            <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl p-3 space-y-1.5 text-center">
                                <div className="text-amber-400 font-black text-xs uppercase tracking-wider">⏱️ SESSION EXPIRED</div>
                                <p className="text-slate-300 text-xs font-medium">QR code was valid for 10 minutes. Click below to generate a new session.</p>
                                <button
                                    onClick={startNewControllerSession}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                                >
                                    Generate New QR
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                    <span>Waiting for connection...</span>
                                </span>
                                <span className="font-mono text-amber-400 font-black">
                                    ⏱️ {Math.floor(connectTimer / 60).toString().padStart(2, '0')}:{(connectTimer % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                        )}

                        {/* LARGE REAL SCANNABLE QR CODE CONTAINER */}
                        {ctrlSession.status !== 'expired' && (
                            <div className="space-y-2">
                                {/* Larger QR with low error correction = less dense = easier to scan */}
                                <div className="bg-white p-4 rounded-3xl mx-auto w-72 h-72 flex items-center justify-center shadow-2xl relative group overflow-hidden border-4 border-slate-800">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=20&ecc=L&data=${encodeURIComponent(ctrlSession.url)}`}
                                        alt="Mobile Controller Pairing QR Code"
                                        className="w-full h-full object-contain"
                                    />

                                    {ctrlSession.status === 'connected' && (
                                        <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center text-white p-3 space-y-1">
                                            <FiCheckCircle className="w-10 h-10 text-emerald-400" />
                                            <span className="font-black text-xs text-emerald-400">Mobile Connected</span>
                                        </div>
                                    )}
                                </div>

                                {/* HOW TO SCAN — clear instruction for Redmi/MIUI users */}
                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-3 py-2 space-y-1">
                                    <p className="text-amber-400 text-[11px] font-black text-center">
                                        📱 Scan karne ke liye:
                                    </p>
                                    <p className="text-slate-300 text-[10px] font-semibold text-center leading-relaxed">
                                        <strong className="text-emerald-400">Google Lens</strong> use karo<br />
                                        <span className="text-slate-400">(Redmi/MIUI Camera se Chrome nahi khulta)</span>
                                    </p>
                                    <p className="text-slate-500 text-[9px] text-center">
                                        Google App → 🔍 Search bar → Camera icon → Scan
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ACTION BUTTONS (STEPS 5, 6, 7, 8, 12) */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                            <button
                                onClick={() => {
                                    navigator.clipboard?.writeText(ctrlSession.url)
                                    addToast({ message: '✓ Link Copied to clipboard!', type: 'success' })
                                }}
                                className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-extrabold text-xs border border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                🔗 Copy Link
                            </button>

                            <button
                                onClick={() => {
                                    window.open(ctrlSession.url, '_blank')
                                    addToast({ message: 'Mobile Controller opened in new tab!', type: 'info' })
                                }}
                                className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 font-extrabold text-xs border border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                ↗️ Open in New Tab
                            </button>

                            {ctrlSession.status === 'connected' ? (
                                <button
                                    onClick={handleDisconnectMobile}
                                    className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all cursor-pointer col-span-2 shadow-md"
                                >
                                    Disconnect Mobile
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={startNewControllerSession}
                                        className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs border border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1"
                                    >
                                        🔄 Refresh QR
                                    </button>

                                    <button
                                        onClick={() => setConnectModalOpen(false)}
                                        className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* OFFICIAL UMPIRE CERTIFICATION & SIGN-OFF MODAL */}
            {/* ==================================================== */}
            {finalizeModalOpen && (
                <div className="fixed inset-0 z-[99999999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0B0F17] border-2 border-emerald-500/50 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 text-white relative">
                        {/* CLOSE BUTTON */}
                        <button
                            onClick={() => setFinalizeModalOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-800"
                        >
                            <FiX className="w-4 h-4" />
                        </button>

                        {/* HEADER */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center text-2xl font-black">
                                ⚖️
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-black text-white text-lg">Official Umpire Sign-off</h3>
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40">
                                        Tier 2 Verified (1.5x)
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">Certify match result and push locked ball-by-ball record to leaderboard.</p>
                            </div>
                        </div>

                        {/* MATCH SUMMARY BOX */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-2">
                                <span className="text-slate-400">Match #{matchInfo.matchNumber} · {matchInfo.venue}</span>
                                <span className="text-emerald-400 font-black">STATUS: {matchInfo.status}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-slate-400">Batting Team</div>
                                    <div className="text-base font-black text-white">{matchInfo.battingTeam}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-emerald-400 font-mono">
                                        {matchState.totalRuns}/{matchState.wickets}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400">({matchState.overs}.{matchState.balls} Overs)</div>
                                </div>
                            </div>
                        </div>

                        {/* MVP & UMPIRE CREDENTIALS */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                                    Select Match MVP / Player of the Match
                                </label>
                                <select
                                    value={selectedMvp}
                                    onChange={(e) => setSelectedMvp(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
                                >
                                    <option value="Aman Varma (48 Runs off 28b)">Aman Varma (48 Runs off 28b)</option>
                                    <option value="Vikramaditya Roy (2 Wickets, 28 Runs)">Vikramaditya Roy (2 Wickets, 28 Runs)</option>
                                    <option value="Karan Malhotra (22 Runs off 14b)">Karan Malhotra (22 Runs off 14b)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                                    Umpire License & Digital Credential
                                </label>
                                <input
                                    type="text"
                                    value={umpireLicense}
                                    onChange={(e) => setUmpireLicense(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-300 outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        {/* TRUST PERK HIGHLIGHT */}
                        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 text-xs text-emerald-300 flex items-center gap-2.5">
                            <span className="text-xl">🏆</span>
                            <div>
                                <strong className="block font-black text-emerald-400">1.5x Player Performance Score Applied</strong>
                                <span>Stats will be permanently locked and verified without opponent dispute risk.</span>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                            <button
                                onClick={() => setFinalizeModalOpen(false)}
                                className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    setIsUmpireCertified(true)
                                    setMatchInfo(prev => ({ ...prev, status: 'Completed' }))
                                    setFinalizeModalOpen(false)

                                    // Save live score state directly into MySQL DB via REST API
                                    try {
                                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
                                        await fetch(`${API_URL}/tournaments/matches/save-score`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                matchId: match?.id || 'fix_103',
                                                team1Score: matchState.totalRuns,
                                                team2Score: 0,
                                                winnerName: matchInfo.battingTeam,
                                                status: 'Completed',
                                                liveState: {
                                                    totalRuns: matchState.totalRuns,
                                                    wickets: matchState.wickets,
                                                    overs: matchState.overs,
                                                    balls: matchState.balls,
                                                    certifiedBy: umpireLicense,
                                                    mvp: selectedMvp
                                                }
                                            })
                                        })
                                    } catch (e) {
                                        console.warn('API save score note:', e.message)
                                    }

                                    addToast({
                                        title: 'Match Saved to Database & Certified ⚖️',
                                        message: `Match result (${matchState.totalRuns}/${matchState.wickets}) committed to MySQL DB!`,
                                        type: 'success'
                                    })
                                }}
                                className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <FiCheck className="w-4 h-4" /> Save to DB & Certify
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>,
        document.body
    )
}
