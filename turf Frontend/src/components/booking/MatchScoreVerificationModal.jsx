import { useState } from 'react'
import { createPortal } from 'react-dom'
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

    // Real match data only -- no fabricated per-player batting/bowling lines.
    // The backend doesn't track ball-by-ball stats, so those tables simply show
    // an empty state rather than the same fake names for every match.
    const team1Data = match.team1 || {
        name: match.team1Name || match.team1_name || 'Team A',
        score: match.team1Score ?? match.team1_score ?? null,
        wickets: match.team1Wickets ?? null,
        overs: match.team1Overs ?? null,
        batting: match.team1Batting || [],
        bowling: match.team1Bowling || []
    }

    const team2Data = match.team2 || {
        name: match.team2Name || match.team2_name || 'Team B',
        score: match.team2Score ?? match.team2_score ?? null,
        wickets: match.team2Wickets ?? null,
        overs: match.team2Overs ?? null,
        batting: match.team2Batting || [],
        bowling: match.team2Bowling || []
    }

    const mvpName = match.mvp || null
    const winnerName = match.winnerName || (team1Data.score > team2Data.score ? team1Data.name : team2Data.name)
    const margin = Math.abs(team1Data.score - team2Data.score)

    // No artificial delay or unconditional success toast -- onApprove/onDispute
    // are real API calls (see CustomerMatches.jsx) and already report their own
    // real success/failure toast, so this only closes the modal once that
    // promise resolves rather than pretending it always succeeds.
    const handleApproveScorecard = async () => {
        if (!onApprove) return onClose()
        setIsSubmitting(true)
        try {
            await onApprove(match.id || match._id, currentTier)
        } finally {
            setIsSubmitting(false)
            onClose()
        }
    }

    const handleDisputeSubmit = async () => {
        if (!disputeReason.trim()) {
            if (addToast) addToast({ message: 'Please write a brief reason for disputing this score.', type: 'warning' })
            return
        }
        if (!onDispute) return onClose()
        setIsSubmitting(true)
        try {
            await onDispute(match.id || match._id, disputeReason)
        } finally {
            setIsSubmitting(false)
            setDisputeMode(false)
            onClose()
        }
    }

    return createPortal(
        <div className="fixed inset-0 z-[99999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden text-[#111827] my-auto">
                {/* Header (Clean Light & Emerald Aesthetic - Fixed at top) */}
                <div className="shrink-0 p-5 sm:p-6 bg-gradient-to-r from-emerald-50/90 via-white to-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
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

                {/* Body Content (Independently scrollable) */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 min-h-0">
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
                                    {team1Data.score ?? '—'}{team1Data.wickets != null ? `/${team1Data.wickets}` : ''} vs {team2Data.score ?? '—'}{team2Data.wickets != null ? `/${team2Data.wickets}` : ''}
                                </span>
                            </div>
                        </div>

                        {mvpName && (
                            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#065F46] block">Player of the Match (MVP)</span>
                                    <div className="text-sm sm:text-base font-black text-emerald-950 mt-0.5 flex items-center gap-1.5">
                                        <HiStar className="text-amber-500 w-4 h-4" />
                                        <span>{mvpName}</span>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                1st Inn: {team1Data.name} ({team1Data.score ?? '—'}{team1Data.wickets != null ? `/${team1Data.wickets}` : ''})
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
                                2nd Inn: {team2Data.name} ({team2Data.score ?? '—'}{team2Data.wickets != null ? `/${team2Data.wickets}` : ''})
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
        </div>,
        document.body
    )
}
