import { useState } from 'react'
<<<<<<< HEAD
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { useToast } from '../ui/Toast'

export default function MatchScoreVerificationModal({ isOpen, onClose, match, onUpdateSuccess }) {
    const { addToast } = useToast()

    // Form state for score entry
    const [teamAScore, setTeamAScore] = useState(match?.team1_score || 85)
    const [teamAOvers, setTeamAOvers] = useState('6.0')
    const [teamAWickets, setTeamAWickets] = useState(4)

    const [teamBScore, setTeamBScore] = useState(match?.team2_score || 71)
    const [teamBOvers, setTeamBOvers] = useState('6.0')
    const [teamBWickets, setTeamBWickets] = useState(6)

    const [selectedMvp, setSelectedMvp] = useState('Rahul Kumar')
    const [disputeReason, setDisputeReason] = useState('')
    const [showDisputeInput, setShowDisputeInput] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Individual player stats list
    const [playerStats, setPlayerStats] = useState([
        { id: 1, name: 'Rahul Kumar (C)', runs: 42, balls: 24, wickets: 2, overs: '2.0', catches: 1 },
        { id: 2, name: 'Vikram Singh', runs: 18, balls: 11, wickets: 1, overs: '1.0', catches: 0 },
        { id: 3, name: 'Amit Sharma', runs: 15, balls: 9, wickets: 0, overs: '1.0', catches: 2 },
        { id: 4, name: 'Priya Singh (Opp C)', runs: 32, balls: 18, wickets: 1, overs: '2.0', catches: 0 },
    ])

    const isUmpireBooked = match?.hasUmpire || match?.includeUmpire || false
    const currentStatus = match?.verificationStatus || (isUmpireBooked ? 'UMPIRE_VERIFIED' : 'PENDING_OPPONENT_VERIFICATION')

    const handleApprove = () => {
        setIsSubmitting(true)
        setTimeout(() => {
            setIsSubmitting(false)
            addToast({
                title: 'Match Verified! ⚡',
                message: isUmpireBooked 
                    ? 'Official Umpire scorecard approved! Issued 1.5x Verified Rank Weight.'
                    : 'Opponent captain confirmed scorecard! Stats & rankings updated.',
                type: 'success'
            })
            if (onUpdateSuccess) onUpdateSuccess({ ...match, verificationStatus: isUmpireBooked ? 'UMPIRE_VERIFIED' : 'CAPTAIN_VERIFIED' })
=======
import { HiCheck, HiX, HiExclamation, HiShieldCheck, HiStar, HiClock, HiShare } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'
import { useToast } from '../ui/Toast'

export default function MatchScoreVerificationModal({ match, isOpen, onClose, onApprove, onDispute }) {
    const { addToast } = useToast()
    const [disputeMode, setDisputeMode] = useState(false)
    const [disputeReason, setDisputeReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeInningsTab, setActiveInningsTab] = useState('innings1') // 'innings1' | 'innings2' | 'bowling'

    if (!isOpen || !match) return null

    const isUmpireAssigned = match.hasVerifiedUmpire || match.verificationTier === 'Tier 2' || match.umpireName
    const currentTier = match.verificationTier || (isUmpireAssigned ? 'Tier 2' : 'Tier 1')
    const multiplier = currentTier === 'Tier 3' ? '2.0x' : currentTier === 'Tier 2' ? '1.5x' : currentTier === 'Tier 1' ? '1.0x' : '0.0x'
    const isAlreadyVerified = match.verificationStatus === 'Verified' || match.status === 'Verified'
    const isDisputed = match.verificationStatus === 'Disputed' || match.status === 'Disputed'

    // Mock/Real Innings Data Fallback
    const team1Data = match.team1 || {
        name: match.team1Name || match.team1_name || 'Vijay Nagar Blasters (You)',
        score: match.team1Score ?? match.team1_score ?? 148,
        wickets: match.team1Wickets ?? 4,
        overs: match.team1Overs ?? '16.0',
        batting: match.team1Batting || [
            { name: 'Rahul Sharma (C)', runs: 58, balls: 32, fours: 6, sixes: 3, sr: 181.2, isOut: false },
            { name: 'Amit Verma', runs: 34, balls: 22, fours: 4, sixes: 1, sr: 154.5, isOut: true, dismissal: 'c Patel b Kumar' },
            { name: 'Sameer Khan', runs: 28, balls: 18, fours: 3, sixes: 1, sr: 155.5, isOut: true, dismissal: 'b Singh' },
            { name: 'Vikram Joshi', runs: 16, balls: 12, fours: 1, sixes: 1, sr: 133.3, isOut: false },
        ],
        bowling: match.team1Bowling || [
            { name: 'Karan Mehra', overs: '4.0', maidens: 0, runs: 26, wickets: 2, econ: '6.50' },
            { name: 'Siddharth Rao', overs: '4.0', maidens: 1, runs: 22, wickets: 2, econ: '5.50' },
            { name: 'Devendra Gill', overs: '4.0', maidens: 0, runs: 38, wickets: 1, econ: '9.50' },
        ]
    }

    const team2Data = match.team2 || {
        name: match.team2Name || match.team2_name || 'Palasia Super Strikers',
        score: match.team2Score ?? match.team2_score ?? 136,
        wickets: match.team2Wickets ?? 7,
        overs: match.team2Overs ?? '16.0',
        batting: match.team2Batting || [
            { name: 'Pritam Sengupta (C)', runs: 44, balls: 29, fours: 5, sixes: 2, sr: 151.7, isOut: true, dismissal: 'c Sharma b Rao' },
            { name: 'Rohan Gupta', runs: 26, balls: 19, fours: 3, sixes: 0, sr: 136.8, isOut: true, dismissal: 'b Mehra' },
            { name: 'Ankit Patel', runs: 18, balls: 14, fours: 2, sixes: 0, sr: 128.5, isOut: true, dismissal: 'run out' },
            { name: 'Sunil Kumar', runs: 12, balls: 8, fours: 1, sixes: 0, sr: 150.0, isOut: false },
        ],
        bowling: match.team2Bowling || [
            { name: 'Ankit Patel', overs: '4.0', maidens: 0, runs: 32, wickets: 1, econ: '8.00' },
            { name: 'Sunil Kumar', overs: '4.0', maidens: 0, runs: 28, wickets: 1, econ: '7.00' },
            { name: 'Harish Singh', overs: '4.0', maidens: 0, runs: 42, wickets: 1, econ: '10.50' },
        ]
    }

    const mvpName = match.mvp || 'Rahul Sharma (58 Runs & 1 Catch)'
    const winnerName = match.winnerName || (team1Data.score > team2Data.score ? team1Data.name : team2Data.name)
    const margin = Math.abs(team1Data.score - team2Data.score)

    const handleApproveScorecard = () => {
        setIsSubmitting(true)
        setTimeout(() => {
            setIsSubmitting(false)
            if (onApprove) {
                onApprove(match.id || match._id, currentTier)
            }
            if (addToast) {
                addToast({
                    title: 'Scorecard Verified & Certified! 🏆',
                    message: `Official match badge issued (${multiplier} Rank Multiplier applied to career stats).`,
                    type: 'success'
                })
            }
>>>>>>> 09026114b3743f19616b31f32c25347597638e70
            onClose()
        }, 500)
    }

<<<<<<< HEAD
    const handleDispute = () => {
        if (!disputeReason.trim()) {
            addToast({ title: 'Dispute Note Required', message: 'Please type a reason for disputing the scorecard.', type: 'error' })
=======
    const handleDisputeSubmit = () => {
        if (!disputeReason.trim()) {
            if (addToast) addToast({ message: 'Please write a brief reason for disputing this score.', type: 'warning' })
>>>>>>> 09026114b3743f19616b31f32c25347597638e70
            return
        }
        setIsSubmitting(true)
        setTimeout(() => {
            setIsSubmitting(false)
<<<<<<< HEAD
            addToast({
                title: 'Match Disputed ⚠️',
                message: 'Scorecard flagged as disputed. Quarantined stats sent to Turf Organizer for review.',
                type: 'warning'
            })
            if (onUpdateSuccess) onUpdateSuccess({ ...match, verificationStatus: 'DISPUTED', disputeReason })
=======
            if (onDispute) {
                onDispute(match.id || match._id, disputeReason)
            }
            if (addToast) {
                addToast({
                    title: 'Scorecard Disputed ⚠️',
                    message: 'Match stats quarantined. Assigned to Turf Admin & Match Resolver.',
                    type: 'error'
                })
            }
            setDisputeMode(false)
>>>>>>> 09026114b3743f19616b31f32c25347597638e70
            onClose()
        }, 500)
    }

<<<<<<< HEAD
    if (!match) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Match Score & Verification Handshake">
            <div className="space-y-5 animate-in fade-in duration-200">
                {/* MATCH HEADER & VERIFICATION BADGE BANNER */}
                <div className="bg-slate-50 border border-[#E2E8F0] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">MATCH ID: {match.id || 'MT-8902'}</span>
                            {isUmpireBooked && (
                                <span className="text-[10px] font-black uppercase tracking-wider bg-[#C8FF2E] text-[#111827] px-2.5 py-0.5 rounded-full border border-[#B5F000]">
                                    ⚖️ Umpire Assigned
                                </span>
                            )}
                        </div>
                        <h3 className="text-sm font-black text-[#111827] mt-0.5">
                            {match.team1_name || 'Andheri Strikers'} vs {match.team2_name || 'Dadar Destroyers'}
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold">{match.venue || 'SportZone Arena, Mumbai'} · {match.date || '2026-08-09'}</p>
                    </div>

                    {/* Verification Status Badge */}
                    <div>
                        {currentStatus === 'UMPIRE_VERIFIED' ? (
                            <Badge variant="success" className="px-3 py-1 text-xs font-black bg-emerald-100 text-[#065F46] border border-emerald-300">
                                ✓ Umpire Verified (1.5x Rank)
                            </Badge>
                        ) : currentStatus === 'CAPTAIN_VERIFIED' ? (
                            <Badge variant="success" className="px-3 py-1 text-xs font-black bg-blue-100 text-blue-800 border border-blue-300">
                                ✓ Captain Verified (1.0x Rank)
                            </Badge>
                        ) : currentStatus === 'DISPUTED' ? (
                            <Badge variant="danger" className="px-3 py-1 text-xs font-black bg-amber-100 text-amber-950 border border-amber-300">
                                ⚠️ Disputed Match
                            </Badge>
                        ) : (
                            <Badge variant="warning" className="px-3 py-1 text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                                ⏳ Pending Opponent Confirmation
                            </Badge>
                        )}
                    </div>
                </div>

                {/* SCORE SUMMARY CARDS */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-2xl text-center shadow-xs">
                        <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">TEAM A SCORE</span>
                        <div className="text-xl font-black text-[#111827] font-mono mt-1">
                            {teamAScore}/{teamAWickets} <span className="text-xs text-slate-500 font-normal">({teamAOvers} ov)</span>
                        </div>
                        <span className="text-xs font-bold text-slate-600 block mt-0.5">{match.team1_name || 'Andheri Strikers'}</span>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-2xl text-center shadow-xs">
                        <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">TEAM B SCORE</span>
                        <div className="text-xl font-black text-[#111827] font-mono mt-1">
                            {teamBScore}/{teamBWickets} <span className="text-xs text-slate-500 font-normal">({teamBOvers} ov)</span>
                        </div>
                        <span className="text-xs font-bold text-slate-600 block mt-0.5">{match.team2_name || 'Dadar Destroyers'}</span>
                    </div>
                </div>

                {/* PLAYER STATS BREAKDOWN LIST */}
                <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-xs font-black uppercase tracking-wider text-[#111827] flex items-center gap-1.5">
                            📊 INDIVIDUAL PLAYER STATS LOGGED
                        </span>
                        <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-emerald-300">
                            ⭐ MVP: {selectedMvp}
                        </span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {playerStats.map((p) => (
                            <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                                <div>
                                    <span className="font-bold text-[#111827] block">{p.name}</span>
                                    <span className="text-[10px] text-slate-500">
                                        🏏 {p.runs} runs ({p.balls}b) · ⚾ {p.wickets} wkt ({p.overs}ov) · 🧤 {p.catches} catch
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-[#10B981] bg-white border border-emerald-200 px-2 py-0.5 rounded-md">
                                        SR: {Math.round((p.runs / (p.balls || 1)) * 100)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DISPUTE NOTE INPUT IF TOGGLED */}
                {showDisputeInput && (
                    <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-2xl space-y-2 animate-in fade-in">
                        <label className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                            DISPUTE REASON & NOTES
                        </label>
                        <textarea
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            placeholder="Explain discrepancy (e.g. Opponent captain claims Rahul scored 24 runs, not 42)..."
                            className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-xs text-[#111827] font-semibold outline-none focus:border-amber-500 h-20 resize-none"
                        />
                    </div>
                )}

                {/* BOTTOM ACTIONS HANDSHAKE BUTTONS */}
                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#111827] font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                        Close
                    </button>

                    <div className="flex items-center gap-2">
                        {!showDisputeInput ? (
                            <button
                                type="button"
                                onClick={() => setShowDisputeInput(true)}
                                className="px-4 py-2.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs uppercase tracking-wider border border-amber-300 cursor-pointer"
                            >
                                ⚠️ Dispute Score
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleDispute}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer"
                            >
                                Submit Dispute
                            </button>
                        )}

                        <Button
                            onClick={handleApprove}
                            disabled={isSubmitting}
                            className="bg-[#10B981] hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-full text-xs uppercase tracking-wider shadow-md cursor-pointer"
                        >
                            {isUmpireBooked ? '✓ Approve Umpire Scorecard' : '✓ Confirm Scorecard'}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
=======
    return (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-[#111827] my-auto">
                {/* Header (Clean Light & Emerald Aesthetic) */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50/90 via-white to-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#065F46] bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                                Match Scorecard & Handshake
                            </span>
                            {/* Tier Badge */}
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border flex items-center gap-1 ${
                                isUmpireAssigned
                                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                                    : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}>
                                {isUmpireAssigned ? '⚖️ Tier 2: Umpire Verified (1.5x)' : '✓ Tier 1: Captain Handshake (1.0x)'}
                            </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#111827]">
                            {team1Data.name} <span className="text-[#16A34A]">vs</span> {team2Data.name}
                        </h2>

                        <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 flex-wrap">
                            <span>📍 {match.venue || 'Indore Turf Arena, Vijay Nagar'}</span>
                            <span>·</span>
                            <span>📅 {match.date || match.scheduledDate || 'Today'}</span>
                            <span>·</span>
                            <span className="text-slate-700 font-bold">{match.sport || 'Cricket 16-Over'}</span>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#111827] transition-all cursor-pointer shrink-0"
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
                    {/* Status Alert Banner */}
                    {isDisputed ? (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-900">
                            <HiExclamation className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-black text-rose-800 block text-sm">Match Status: Quarantined / Disputed</strong>
                                <span className="font-medium text-slate-700">Dispute reason: "{match.disputeReason || 'Scorecard mismatch reported by opponent captain.'}" Turf manager review in progress.</span>
                            </div>
                        </div>
                    ) : isAlreadyVerified ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-950">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-black text-base shadow-xs">✓</div>
                                <div>
                                    <strong className="font-black text-emerald-900 block text-sm">Official Match Record Certified</strong>
                                    <span className="font-medium text-slate-600">Verified by both captains & official platform scorer. Points credited to Leaderboard with {multiplier} multiplier.</span>
                                </div>
                            </div>
                            <span className="font-mono font-black text-xs text-[#065F46] bg-white px-3 py-1 rounded-full border border-emerald-300 shadow-2xs">
                                CERT-#{match.id || '98432'}
                            </span>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-950">
                            <div className="flex items-center gap-3">
                                <HiClock className="w-6 h-6 text-amber-600 shrink-0" />
                                <div>
                                    <strong className="font-black text-amber-900 block text-sm">Pending Opponent Captain Confirmation</strong>
                                    <span className="font-medium text-slate-600">Review submitted scores below. Confirm to certify stats on Indore Leaderboards.</span>
                                </div>
                            </div>
                            <span className="font-bold text-amber-900 bg-amber-200/70 px-2.5 py-1 rounded-lg shrink-0">
                                ⏳ 36 hrs left
                            </span>
                        </div>
                    )}

                    {/* Result Summary & MVP Highlight */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Match Result</span>
                                <div className="text-sm sm:text-base font-black text-[#111827] mt-0.5 flex items-center gap-1.5">
                                    <HiTrophy className="text-amber-500 w-4 h-4" />
                                    <span>{winnerName} won by {margin} runs</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                    {team1Data.score}/{team1Data.wickets} vs {team2Data.score}/{team2Data.wickets}
                                </span>
                            </div>
                        </div>

                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#065F46] block">Player of the Match (MVP)</span>
                                <div className="text-sm sm:text-base font-black text-emerald-950 mt-0.5 flex items-center gap-1.5">
                                    <HiStar className="text-amber-500 w-4 h-4" />
                                    <span>{mvpName}</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#16A34A] text-white shadow-2xs">
                                +12 Rank PTS
                            </span>
                        </div>
                    </div>

                    {/* Scorecard Tabs (1st Innings / 2nd Innings / Bowling) */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                            <button
                                type="button"
                                onClick={() => setActiveInningsTab('innings1')}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                    activeInningsTab === 'innings1'
                                        ? 'bg-[#111827] text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                1st Inn: {team1Data.name} ({team1Data.score}/{team1Data.wickets})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveInningsTab('innings2')}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                    activeInningsTab === 'innings2'
                                        ? 'bg-[#111827] text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                2nd Inn: {team2Data.name} ({team2Data.score}/{team2Data.wickets})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveInningsTab('bowling')}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                    activeInningsTab === 'bowling'
                                        ? 'bg-[#111827] text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                🎯 Bowling Figures
                            </button>
                        </div>

                        {/* 1st Innings Batting */}
                        {activeInningsTab === 'innings1' && (
                            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="p-3">Batter</th>
                                            <th className="p-3 text-center">R</th>
                                            <th className="p-3 text-center">B</th>
                                            <th className="p-3 text-center">4s</th>
                                            <th className="p-3 text-center">6s</th>
                                            <th className="p-3 text-right">SR</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                        {team1Data.batting.map((b, i) => (
                                            <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="p-3 font-bold text-[#111827]">
                                                    {b.name}
                                                    {b.dismissal && <span className="block text-[10px] text-slate-400 font-normal">{b.dismissal}</span>}
                                                </td>
                                                <td className="p-3 text-center font-black font-mono text-[#111827]">{b.runs}</td>
                                                <td className="p-3 text-center font-mono text-slate-500">{b.balls}</td>
                                                <td className="p-3 text-center font-mono text-slate-500">{b.fours}</td>
                                                <td className="p-3 text-center font-mono text-slate-500">{b.sixes}</td>
                                                <td className="p-3 text-right font-mono font-black text-[#16A34A]">{b.sr}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* 2nd Innings Batting */}
                        {activeInningsTab === 'innings2' && (
                            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="p-3">Batter</th>
                                            <th className="p-3 text-center">R</th>
                                            <th className="p-3 text-center">B</th>
                                            <th className="p-3 text-center">4s</th>
                                            <th className="p-3 text-center">6s</th>
                                            <th className="p-3 text-right">SR</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                        {team2Data.batting.map((b, i) => (
                                            <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="p-3 font-bold text-[#111827]">
                                                    {b.name}
                                                    {b.dismissal && <span className="block text-[10px] text-slate-400 font-normal">{b.dismissal}</span>}
                                                </td>
                                                <td className="p-3 text-center font-black font-mono text-[#111827]">{b.runs}</td>
                                                <td className="p-3 text-center font-mono text-slate-500">{b.balls}</td>
                                                <td className="p-3 text-center font-mono text-slate-500">{b.fours}</td>
                                                <td className="p-3 text-center font-mono text-slate-500">{b.sixes}</td>
                                                <td className="p-3 text-right font-mono font-black text-indigo-600">{b.sr}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Bowling Summary */}
                        {activeInningsTab === 'bowling' && (
                            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="p-3">Bowler</th>
                                            <th className="p-3 text-center">Overs</th>
                                            <th className="p-3 text-center">Runs</th>
                                            <th className="p-3 text-center">Wickets</th>
                                            <th className="p-3 text-right">Economy</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                        {[...team1Data.bowling, ...team2Data.bowling].map((bw, i) => (
                                            <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="p-3 font-bold text-[#111827]">{bw.name}</td>
                                                <td className="p-3 text-center font-mono text-slate-600">{bw.overs}</td>
                                                <td className="p-3 text-center font-mono text-slate-600">{bw.runs}</td>
                                                <td className="p-3 text-center font-mono font-black text-indigo-600">{bw.wickets}</td>
                                                <td className="p-3 text-right font-mono font-bold text-slate-800">{bw.econ}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Dispute Box (if open) */}
                    {disputeMode && (
                        <div className="bg-rose-50/90 border-2 border-rose-300 rounded-2xl p-4 space-y-3 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <HiExclamation className="w-4 h-4 text-rose-600" />
                                    Reason for Disputing Scorecard
                                </label>
                                <button type="button" onClick={() => setDisputeMode(false)} className="text-xs text-rose-700 font-bold hover:underline cursor-pointer">
                                    Cancel
                                </button>
                            </div>
                            <textarea
                                value={disputeReason}
                                onChange={(e) => setDisputeReason(e.target.value)}
                                rows={3}
                                placeholder="Explain what numbers were incorrect (e.g. Batsman Amit was caught on 24, not 34)..."
                                className="w-full bg-white border border-rose-300 rounded-xl p-3 text-xs font-medium text-[#111827] outline-none focus:ring-2 focus:ring-rose-400"
                            />
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleDisputeSubmit}
                                    disabled={isSubmitting}
                                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting Dispute...' : 'Confirm Dispute & Send to Admin'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium w-full sm:w-auto">
                        <HiShieldCheck className="w-4 h-4 text-[#16A34A]" />
                        <span>Verification Weight: <strong className="text-[#111827] font-black">{multiplier}</strong></span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                        {!isAlreadyVerified && !isDisputed && !disputeMode && (
                            <button
                                type="button"
                                onClick={() => setDisputeMode(true)}
                                className="px-4 py-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-black text-xs transition-colors cursor-pointer"
                            >
                                Dispute Score
                            </button>
                        )}

                        {!isAlreadyVerified && !isDisputed && !disputeMode && (
                            <button
                                type="button"
                                onClick={handleApproveScorecard}
                                disabled={isSubmitting}
                                className="px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-black text-xs transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <HiCheck className="w-4 h-4" />
                                {isSubmitting ? 'Verifying...' : 'Approve & Certify Scorecard'}
                            </button>
                        )}

                        {(isAlreadyVerified || isDisputed || disputeMode) && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
>>>>>>> 09026114b3743f19616b31f32c25347597638e70
    )
}
