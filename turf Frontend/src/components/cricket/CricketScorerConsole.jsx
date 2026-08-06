import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
    FiPlay, FiPause, FiRotateCcw, FiUserCheck, FiUsers, FiAward,
    FiTrendingUp, FiActivity, FiX, FiCheck, FiCornerUpLeft, FiClock,
    FiRefreshCw, FiZap, FiRadio, FiEdit2, FiPlus, FiChevronRight, FiSmartphone
} from 'react-icons/fi'
import { HiTrophy } from 'react-icons/hi2'
import { useToast } from '../ui/Toast'

export default function CricketScorerConsole({ match, onClose }) {
    const { addToast } = useToast()

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
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[999999] bg-[#0B0F17] text-white flex flex-col font-sans overflow-y-auto select-none animate-in fade-in duration-300">
            {/* ---------------------------------------------------- */}
            {/* TOP HEADER */}
            {/* ---------------------------------------------------- */}
            <div className="bg-[#121824]/90 backdrop-blur-md border-b border-slate-800 p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shrink-0 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
                        🏏
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-black text-base tracking-tight text-white">{matchInfo.tournamentName}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> LIVE OPERATOR CONSOLE
                            </span>
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                            Match #{matchInfo.matchNumber} • {matchInfo.roundName} • {matchInfo.venue}
                        </div>
                    </div>
                </div>

                {/* Match Status Controls */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400">
                        <FiClock className="animate-spin text-emerald-500" />
                        <span>TIMER: {formatTimer(matchInfo.timerSeconds)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                        {['Scheduled', 'Live', 'Innings Break', 'Completed'].map(st => (
                            <button
                                key={st}
                                onClick={() => setMatchInfo(prev => ({ ...prev, status: st }))}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                    matchInfo.status === st
                                        ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => addToast({ message: 'Match data synced with cloud & live broadcast server!', type: 'success' })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                    >
                        <FiRefreshCw className="animate-spin" /> Sync Live
                    </button>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* MAIN 4-PANEL BODY */}
            {/* ---------------------------------------------------- */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-y-auto min-h-0 bg-[#0B0F17]">
                
                {/* ---------------------------------------------------- */}
                {/* LEFT PANEL: LIVE MATCH INFO & STATS (3 cols) */}
                {/* ---------------------------------------------------- */}
                <div className="lg:col-span-3 bg-[#121824] rounded-3xl border border-slate-800 p-5 space-y-5 overflow-y-auto shadow-xl flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">LIVE INNINGS 1</span>
                            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                {matchInfo.battingTeam}
                            </span>
                        </div>

                        {/* BIG SCORE DISPLAY */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800/80 text-center space-y-1 relative overflow-hidden shadow-inner">
                            <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl"></div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">CURRENT SCORE</div>
                            <div className="text-5xl font-black tracking-tight text-white flex items-center justify-center gap-1">
                                <span className="text-emerald-400">{matchState.totalRuns}</span>
                                <span className="text-slate-600">/</span>
                                <span className="text-rose-500">{matchState.wickets}</span>
                            </div>
                            <div className="text-sm font-extrabold text-slate-300 mt-1">
                                OVERS: <span className="text-white">{matchState.overs}.{matchState.balls}</span> <span className="text-slate-500 text-xs">(20.0 Max)</span>
                            </div>
                        </div>

                        {/* RUN RATES & TARGET */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 text-center">
                                <div className="text-[10px] font-extrabold text-slate-400 uppercase">Current Run Rate</div>
                                <div className="text-lg font-black text-emerald-400 mt-0.5">{crr}</div>
                            </div>
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 text-center">
                                <div className="text-[10px] font-extrabold text-slate-400 uppercase">Target Score</div>
                                <div className="text-lg font-black text-indigo-400 mt-0.5">{matchInfo.target}</div>
                            </div>
                        </div>

                        {/* EXTRAS BREAKDOWN */}
                        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                            <div className="flex justify-between font-bold text-slate-400">
                                <span>EXTRAS TOTAL</span>
                                <span className="text-amber-400 font-black">{matchState.extras.total} Runs</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center text-slate-400">
                                <div className="bg-slate-950 p-1 rounded">WD: {matchState.extras.wides}</div>
                                <div className="bg-slate-950 p-1 rounded">NB: {matchState.extras.noBalls}</div>
                                <div className="bg-slate-950 p-1 rounded">B: {matchState.extras.byes}</div>
                                <div className="bg-slate-950 p-1 rounded">LB: {matchState.extras.legByes}</div>
                            </div>
                        </div>

                        {/* PARTNERSHIP & LAST WICKET */}
                        <div className="space-y-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 text-xs">
                            <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Current Partnership</div>
                                <div className="font-extrabold text-slate-200 mt-0.5">
                                    {matchState.currentPartnership.runs} Runs off {matchState.currentPartnership.balls} Balls
                                </div>
                            </div>
                            <div className="pt-2 border-t border-slate-800">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Last Wicket</div>
                                <div className="font-medium text-rose-400 truncate mt-0.5">{matchState.lastWicket}</div>
                            </div>
                        </div>

                        {/* LAST 6 BALLS TICKER */}
                        <div className="space-y-2">
                            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">CURRENT OVER BALLS</div>
                            <div className="flex items-center gap-2">
                                {matchState.currentOverBalls.map((b, idx) => (
                                    <span
                                        key={idx}
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-md ${
                                            b.label === 'W'
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
                    </div>

                    {/* PROJECTED SCORES */}
                    <div className="bg-emerald-950/30 p-3 rounded-2xl border border-emerald-500/20 text-xs space-y-1">
                        <div className="font-extrabold text-emerald-400 flex items-center justify-between">
                            <span>PROJECTED SCORE</span>
                            <span>@ Current RPO</span>
                        </div>
                        <div className="flex justify-between font-mono text-slate-300">
                            <span>@ 8 RPO: <strong className="text-white">{projectedScore8}</strong></span>
                            <span>@ 10 RPO: <strong className="text-white">{projectedScore10}</strong></span>
                        </div>
                    </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* CENTER PANEL: TOUCH SCORING CONSOLE (5 cols) */}
                {/* ---------------------------------------------------- */}
                <div className="lg:col-span-6 bg-[#121824] rounded-3xl border border-slate-800 p-5 space-y-5 overflow-y-auto shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <span className="text-xs font-black text-emerald-400 tracking-wider flex items-center gap-2">
                                🎮 OPERATOR TOUCH CONSOLE
                            </span>
                            <span className="text-[11px] text-slate-500 font-bold">1-CLICK INSTANT RECORDING</span>
                        </div>

                        {/* SCORING BUTTONS GRID */}
                        <div className="space-y-4">
                            {/* ROW 1: RUN BUTTONS (0, 1, 2, 3, 4, 6) */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">RUNS</span>
                                <div className="grid grid-cols-6 gap-3">
                                    {[0, 1, 2, 3, 4, 6].map(runs => (
                                        <button
                                            key={runs}
                                            onClick={() => recordBall({ type: 'run', runs, label: String(runs), isLegal: true })}
                                            className={`h-16 rounded-2xl font-black text-2xl transition-all active:scale-95 shadow-lg cursor-pointer flex items-center justify-center ${
                                                runs === 6
                                                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 shadow-emerald-600/30 hover:brightness-110'
                                                    : runs === 4
                                                    ? 'bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-indigo-600/30 hover:brightness-110'
                                                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                                            }`}
                                        >
                                            {runs}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ROW 2: EXTRAS (WD, NB, BYE, LEG BYE) */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">EXTRAS</span>
                                <div className="grid grid-cols-4 gap-3">
                                    <button
                                        onClick={() => setWideModalOpen(true)}
                                        className="h-14 rounded-2xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/40 font-black text-base transition-all active:scale-95 cursor-pointer shadow-md"
                                    >
                                        Wide (WD)
                                    </button>
                                    <button
                                        onClick={() => setNoBallModalOpen(true)}
                                        className="h-14 rounded-2xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/40 font-black text-base transition-all active:scale-95 cursor-pointer shadow-md"
                                    >
                                        No Ball (NB)
                                    </button>
                                    <button
                                        onClick={() => setByeModalOpen(true)}
                                        className="h-14 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 font-black text-base transition-all active:scale-95 cursor-pointer shadow-md"
                                    >
                                        Bye (B)
                                    </button>
                                    <button
                                        onClick={() => setLegByeModalOpen(true)}
                                        className="h-14 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 font-black text-base transition-all active:scale-95 cursor-pointer shadow-md"
                                    >
                                        Leg Bye (LB)
                                    </button>
                                </div>
                            </div>

                            {/* ROW 3: WICKET, UNDO, DOT, DEAD BALL */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">DISMISSALS & CONTROLS</span>
                                <div className="grid grid-cols-4 gap-3">
                                    <button
                                        onClick={() => setWicketModalOpen(true)}
                                        className="h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-base transition-all active:scale-95 shadow-lg shadow-rose-600/30 cursor-pointer col-span-2 flex items-center justify-center gap-2"
                                    >
                                        🚨 WICKET OUT (W)
                                    </button>
                                    <button
                                        onClick={handleUndo}
                                        className="h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-extrabold text-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                                    >
                                        <FiRotateCcw /> Undo
                                    </button>
                                    <button
                                        onClick={() => recordBall({ type: 'run', runs: 0, label: '0', isLegal: true })}
                                        className="h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-extrabold text-sm transition-all active:scale-95 cursor-pointer"
                                    >
                                        Dot Ball
                                    </button>
                                </div>
                            </div>

                            {/* ROW 4: INNINGS CONTROLS */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-800">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">TACTICAL ACTIONS</span>
                                <div className="grid grid-cols-4 gap-3">
                                    <button
                                        onClick={handleSwapStrike}
                                        className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
                                    >
                                        Swap Strike ⇄
                                    </button>
                                    <button
                                        onClick={() => setChangeBowlerModalOpen(true)}
                                        className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
                                    >
                                        Change Bowler
                                    </button>
                                    <button
                                        onClick={() => setNewBatsmanModalOpen(true)}
                                        className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
                                    >
                                        New Batsman
                                    </button>
                                    <button
                                        onClick={() => addToast({ message: 'Batsman retired hurt logged.', type: 'warning' })}
                                        className="h-12 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold border border-rose-800/50 transition-all cursor-pointer"
                                    >
                                        Retire Hurt
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KEYBOARD SHORTCUTS FOOTER */}
                    <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white">⌨️ KEYBOARD SHORTCUTS:</span>
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">0, 1, 2, 3, 4, 6</span>
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">W = Wicket</span>
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">Ctrl+Z = Undo</span>
                        </div>
                    </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* RIGHT PANEL: PLAYERS & MOBILE LIVE PREVIEW (3 cols) */}
                {/* ---------------------------------------------------- */}
                <div className="lg:col-span-3 space-y-4 overflow-y-auto flex flex-col justify-between">
                    
                    {/* CURRENT BATSMEN CARD */}
                    <div className="bg-[#121824] rounded-3xl border border-slate-800 p-4 space-y-3 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">CURRENT BATSMEN</span>
                            <span className="text-[10px] font-bold text-emerald-400">ON CREASE</span>
                        </div>

                        {/* STRIKER */}
                        <div className="bg-slate-900/90 p-3 rounded-2xl border border-emerald-500/40 space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-black text-emerald-400 flex items-center gap-1">
                                    ★ {striker.name} <span className="text-[10px] text-emerald-500">(Striker)</span>
                                </span>
                                <span className="font-mono text-slate-400 text-[11px]">SR: {strikerSR}</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-1">
                                <span className="text-2xl font-black text-white">{striker.runs} <span className="text-xs text-slate-400 font-normal">({striker.balls})</span></span>
                                <span className="text-xs text-slate-400 font-medium">{striker.fours}x4 • {striker.sixes}x6</span>
                            </div>
                        </div>

                        {/* NON-STRIKER */}
                        <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-extrabold text-slate-300">{nonStriker.name}</span>
                                <span className="font-mono text-slate-400 text-[11px]">SR: {nonStrikerSR}</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-1">
                                <span className="text-xl font-extrabold text-slate-200">{nonStriker.runs} <span className="text-xs text-slate-500 font-normal">({nonStriker.balls})</span></span>
                                <span className="text-xs text-slate-500 font-medium">{nonStriker.fours}x4 • {nonStriker.sixes}x6</span>
                            </div>
                        </div>
                    </div>

                    {/* CURRENT BOWLER CARD */}
                    <div className="bg-[#121824] rounded-3xl border border-slate-800 p-4 space-y-3 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">CURRENT BOWLER</span>
                            <button onClick={() => setChangeBowlerModalOpen(true)} className="text-[10px] font-bold text-indigo-400 hover:underline">Change</button>
                        </div>

                        <div className="bg-slate-900/90 p-3 rounded-2xl border border-indigo-500/40 space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-black text-indigo-400">⚡ {bowler.name}</span>
                                <span className="font-mono text-slate-400 text-[11px]">ECO: {bowlerEco}</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-1 text-xs font-bold text-slate-300">
                                <span>Overs: <strong className="text-white">{bowler.overs}</strong></span>
                                <span>Runs: <strong className="text-white">{bowler.runs}</strong></span>
                                <span>Wkts: <strong className="text-rose-400">{bowler.wickets}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* MOBILE LIVE CARD PREVIEW */}
                    <div className="bg-[#121824] rounded-3xl border border-slate-800 p-4 space-y-3 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black text-slate-300 tracking-wider flex items-center gap-1.5">
                                <FiSmartphone className="text-emerald-400" /> MOBILE SCORECARD PREVIEW
                            </span>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-3 font-mono text-xs">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <span className="font-black text-white text-sm">{matchInfo.battingTeam}</span>
                                <span className="font-black text-emerald-400 text-base">{matchState.totalRuns}/{matchState.wickets} ({matchState.overs}.{matchState.balls})</span>
                            </div>
                            <div className="space-y-1 text-[11px] text-slate-300">
                                <div className="flex justify-between">
                                    <span>* {striker.name}</span>
                                    <span className="font-bold text-white">{striker.runs} ({striker.balls})</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>{nonStriker.name}</span>
                                    <span>{nonStriker.runs} ({nonStriker.balls})</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center">
                                Live Broadcast Sync Active ⚡
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* BOTTOM PANEL: LIVE COMMENTARY & BALL HISTORY */}
            {/* ---------------------------------------------------- */}
            <div className="bg-[#121824] border-t border-slate-800 p-4 shrink-0 shadow-2xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest shrink-0">LIVE COMMENTARY LOG:</span>
                        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 truncate w-full md:w-[600px]">
                            {matchState.ballHistory[0]?.text || 'Match in progress...'}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => addToast({ message: 'Match scorecard saved to database!', type: 'success' })}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-all shadow-lg cursor-pointer"
                        >
                            Save Match State ✓
                        </button>
                    </div>
                </div>
            </div>

            {/* ==================================================== */}
            {/* WICKET POPUP MODAL */}
            {/* ==================================================== */}
            {wicketModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#121824] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-lg font-black text-rose-500 flex items-center gap-2">
                                🚨 RECORD WICKET DISMISSAL
                            </h3>
                            <button onClick={() => setWicketModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-4 text-xs font-bold text-slate-300">
                            <div>
                                <label className="block text-slate-400 mb-1">PLAYER OUT *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setWicketForm({ ...wicketForm, outPlayer: 'striker' })}
                                        className={`p-3 rounded-xl border font-bold ${wicketForm.outPlayer === 'striker' ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                                    >
                                        Striker ({striker.name})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setWicketForm({ ...wicketForm, outPlayer: 'nonStriker' })}
                                        className={`p-3 rounded-xl border font-bold ${wicketForm.outPlayer === 'nonStriker' ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                                    >
                                        Non-Striker ({nonStriker.name})
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-1">DISMISSAL TYPE *</label>
                                <select
                                    value={wicketForm.dismissalType}
                                    onChange={(e) => setWicketForm({ ...wicketForm, dismissalType: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold outline-none"
                                >
                                    {['Bowled', 'LBW', 'Caught', 'Run Out', 'Stumped', 'Hit Wicket', 'Retired Out'].map(dt => (
                                        <option key={dt} value={dt}>{dt}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-1">SELECT NEW BATSMAN *</label>
                                <select
                                    value={wicketForm.newBatsman}
                                    onChange={(e) => setWicketForm({ ...wicketForm, newBatsman: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold outline-none"
                                >
                                    {squadBatting.map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                            <button onClick={() => setWicketModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs">
                                Cancel
                            </button>
                            <button onClick={handleConfirmWicket} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#121824] border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
                        <h3 className="text-lg font-black text-amber-400">RECORD WIDE BALL</h3>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setExtraValue(r)}
                                    className={`w-12 h-12 rounded-xl font-black text-lg border ${extraValue === r ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                                >
                                    +{r}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setWideModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold">Cancel</button>
                            <button onClick={handleConfirmWide} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs">Save Wide</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* NO BALL POPUP MODAL */}
            {/* ==================================================== */}
            {noBallModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#121824] border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
                        <h3 className="text-lg font-black text-amber-400">RECORD NO BALL (FREE HIT)</h3>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5, 7].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setExtraValue(r)}
                                    className={`w-12 h-12 rounded-xl font-black text-lg border ${extraValue === r ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                                >
                                    +{r}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setNoBallModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold">Cancel</button>
                            <button onClick={handleConfirmNoBall} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs">Save No Ball</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* BYE POPUP MODAL */}
            {/* ==================================================== */}
            {byeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#121824] border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
                        <h3 className="text-lg font-black text-indigo-400">RECORD BYE RUNS</h3>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setExtraValue(r)}
                                    className={`w-12 h-12 rounded-xl font-black text-lg border ${extraValue === r ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                                >
                                    {r}B
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setByeModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold">Cancel</button>
                            <button onClick={handleConfirmBye} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-black text-xs">Save Bye</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* LEG BYE POPUP MODAL */}
            {/* ==================================================== */}
            {legByeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#121824] border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
                        <h3 className="text-lg font-black text-indigo-400">RECORD LEG BYE RUNS</h3>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setExtraValue(r)}
                                    className={`w-12 h-12 rounded-xl font-black text-lg border ${extraValue === r ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                                >
                                    {r}LB
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setLegByeModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold">Cancel</button>
                            <button onClick={handleConfirmLegBye} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-black text-xs">Save Leg Bye</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* CHANGE BOWLER MODAL */}
            {/* ==================================================== */}
            {changeBowlerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#121824] border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
                        <h3 className="text-lg font-black text-indigo-400">SELECT NEW BOWLER</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {squadBowling.map(b => (
                                <button
                                    key={b}
                                    onClick={() => {
                                        setBowler({ name: b, overs: '0.0', runs: 0, wickets: 0, maiden: 0 })
                                        setChangeBowlerModalOpen(false)
                                        addToast({ message: `Bowler changed to ${b}`, type: 'info' })
                                    }}
                                    className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-indigo-900/50 border border-slate-800 text-xs font-bold text-slate-200 flex justify-between items-center"
                                >
                                    <span>⚡ {b}</span>
                                    <span className="text-slate-500 font-normal">Select →</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setChangeBowlerModalOpen(false)} className="w-full py-2 rounded-xl bg-slate-800 text-xs font-bold">Cancel</button>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* NEW BATSMAN MODAL */}
            {/* ==================================================== */}
            {newBatsmanModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#121824] border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
                        <h3 className="text-lg font-black text-emerald-400">SELECT NEW BATSMAN</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {squadBatting.map(b => (
                                <button
                                    key={b}
                                    onClick={() => {
                                        setStriker({ name: b, runs: 0, balls: 0, fours: 0, sixes: 0 })
                                        setNewBatsmanModalOpen(false)
                                        addToast({ message: `New batsman ${b} came to crease`, type: 'info' })
                                    }}
                                    className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-emerald-900/50 border border-slate-800 text-xs font-bold text-slate-200 flex justify-between items-center"
                                >
                                    <span>🏏 {b}</span>
                                    <span className="text-slate-500 font-normal">Select →</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setNewBatsmanModalOpen(false)} className="w-full py-2 rounded-xl bg-slate-800 text-xs font-bold">Cancel</button>
                    </div>
                </div>
            )}
        </div>,
        document.body
    )
}
