import { useState } from 'react'
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
            onClose()
        }, 500)
    }

    const handleDispute = () => {
        if (!disputeReason.trim()) {
            addToast({ title: 'Dispute Note Required', message: 'Please type a reason for disputing the scorecard.', type: 'error' })
            return
        }
        setIsSubmitting(true)
        setTimeout(() => {
            setIsSubmitting(false)
            addToast({
                title: 'Match Disputed ⚠️',
                message: 'Scorecard flagged as disputed. Quarantined stats sent to Turf Organizer for review.',
                type: 'warning'
            })
            if (onUpdateSuccess) onUpdateSuccess({ ...match, verificationStatus: 'DISPUTED', disputeReason })
            onClose()
        }, 500)
    }

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
    )
}
