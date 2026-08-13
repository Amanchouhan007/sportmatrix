import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import MatchScoreVerificationModal from '../../components/booking/MatchScoreVerificationModal'
import { getPublicTournaments, getFixtures } from '../../services/tournamentService'

const initialMockMatches = [
    {
        id: 'MT-8902',
        team1_name: 'Andheri Strikers',
        team2_name: 'Dadar Destroyers',
        team1_score: 85,
        team2_score: 71,
        venue: 'SportZone Arena, Mumbai',
        date: '2026-08-09',
        time: '06:00 PM',
        status: 'Completed',
        verificationStatus: 'UMPIRE_VERIFIED',
        hasUmpire: true,
        mvp: 'Rahul Kumar'
    },
    {
        id: 'MT-8841',
        team1_name: 'Koramangala Kings',
        team2_name: 'Indiranagar XI',
        team1_score: 112,
        team2_score: 108,
        venue: 'GameVault Center, Bangalore',
        date: '2026-08-05',
        time: '08:00 PM',
        status: 'Completed',
        verificationStatus: 'CAPTAIN_VERIFIED',
        hasUmpire: false,
        mvp: 'Vikram Deshmukh'
    },
    {
        id: 'MT-8920',
        team1_name: 'Indore Thunders',
        team2_name: 'Bhawarkua Warriors',
        team1_score: 94,
        team2_score: 92,
        venue: 'Spike Football Turf, Indore',
        date: '2026-08-11',
        time: '07:00 PM',
        status: 'Completed',
        verificationStatus: 'PENDING_OPPONENT_VERIFICATION',
        hasUmpire: false,
        mvp: 'Amit Sharma'
    }
]

export default function CustomerMatches() {
    const [matches, setMatches] = useState(initialMockMatches)
    const [loading, setLoading] = useState(false)
    const [selectedMatch, setSelectedMatch] = useState(null)
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)

    const handleMatchClick = (m) => {
        setSelectedMatch(m)
        setIsVerificationModalOpen(true)
    }

    const handleUpdateSuccess = (updatedMatch) => {
        setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m))
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">My Matches & Scorecards</h1>
                    <p className="text-surface-500 text-sm mt-1">Track match history, captain handshakes, and umpire verification badges</p>
                </div>
            </div>

            <div className="space-y-4">
                {matches.map(m => {
                    const status = m.status || 'Upcoming'
                    const vStatus = m.verificationStatus || 'PENDING_OPPONENT_VERIFICATION'

                    return (
                        <Card key={m.id} hover onClick={() => handleMatchClick(m)} className="cursor-pointer transition-all duration-200 hover:border-[#10B981]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${
                                        vStatus === 'UMPIRE_VERIFIED' ? 'bg-[#10B981]' : vStatus === 'CAPTAIN_VERIFIED' ? 'bg-blue-600' : 'bg-amber-500'
                                    }`}>
                                        {vStatus === 'UMPIRE_VERIFIED' ? '⚖️' : vStatus === 'CAPTAIN_VERIFIED' ? '✓' : '⏳'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-surface-900 text-base">{m.team1_name} vs {m.team2_name}</p>
                                            {m.hasUmpire && (
                                                <span className="text-[9px] font-black uppercase tracking-wider bg-[#C8FF2E] text-[#111827] px-2.5 py-0.5 rounded-full border border-[#B5F000]">
                                                    ⚖️ Umpire Assigned
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-surface-400 font-medium mt-0.5">{m.venue} · {m.date} ({m.time})</p>
                                        <p className="text-xs font-semibold text-[#10B981] mt-1">
                                            Score: {m.team1_score} - {m.team2_score} · MVP: {m.mvp}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                                    {vStatus === 'UMPIRE_VERIFIED' ? (
                                        <Badge variant="success" className="px-3 py-1 text-xs font-black bg-emerald-100 text-[#065F46] border border-emerald-300">
                                            ✓ Umpire Verified (1.5x Rank)
                                        </Badge>
                                    ) : vStatus === 'CAPTAIN_VERIFIED' ? (
                                        <Badge variant="success" className="px-3 py-1 text-xs font-black bg-blue-100 text-blue-800 border border-blue-300">
                                            ✓ Captain Verified (1.0x Rank)
                                        </Badge>
                                    ) : vStatus === 'DISPUTED' ? (
                                        <Badge variant="danger" className="px-3 py-1 text-xs font-black bg-amber-100 text-amber-950 border border-amber-300">
                                            ⚠️ Disputed Match
                                        </Badge>
                                    ) : (
                                        <Badge variant="warning" className="px-3 py-1 text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                                            ⏳ Handshake Pending
                                        </Badge>
                                    )}

                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleMatchClick(m); }}
                                        className="text-xs font-extrabold text-[#10B981] bg-[#ECFDF5] hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition-colors"
                                    >
                                        View Scorecard & Handshake →
                                    </button>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* MATCH SCORE VERIFICATION HANDSHAKE MODAL */}
            <MatchScoreVerificationModal
                isOpen={isVerificationModalOpen}
                onClose={() => setIsVerificationModalOpen(false)}
                match={selectedMatch}
                onUpdateSuccess={handleUpdateSuccess}
            />
        </div>
    )
}
