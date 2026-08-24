import { useState, useEffect, useCallback } from 'react'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'
import { HiPlay, HiCheck, HiExclamation } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'
import CricketScorerConsole from '../../components/cricket/CricketScorerConsole'
import { getAllTournamentMatches, updateMatchScore } from '../../services/tournamentService'
import useRealtime from '../../utils/useRealtime'

const TIER_LABEL = {
    SELF_ENTRY: { label: 'Tier 0: Self-Reported', multiplier: '0.0x', icon: '' },
    CAPTAIN_HANDSHAKE: { label: 'Tier 1: Captain Handshake', multiplier: '1.0x', icon: '✓' },
    PAID_UMPIRE: { label: 'Tier 2: Umpire Verified', multiplier: '1.5x', icon: '⚖️' },
    OFFICIAL_TOURNAMENT: { label: 'Tier 3: Official Tournament', multiplier: '2.0x', icon: '🏆' }
}

const STATUS_LABEL = { SCHEDULED: 'Scheduled', LIVE: 'Live', COMPLETED: 'Completed', ABANDONED: 'Abandoned' }

const mapFixture = (m) => ({
    id: m.id,
    roundName: m.roundName || 'Playoffs',
    matchNumber: m.matchNumber,
    team1Id: m.teamAId,
    team1Name: m.teamA?.teamName || 'Team A',
    team1Score: m.teamAScore || '',
    team2Id: m.teamBId,
    team2Name: m.teamB?.teamName || 'Team B',
    team2Score: m.teamBScore || '',
    winnerId: m.winnerId,
    winnerName: m.winnerId === m.teamAId ? (m.teamA?.teamName) : m.winnerId === m.teamBId ? (m.teamB?.teamName) : null,
    status: STATUS_LABEL[m.status] || m.status,
    rawStatus: m.status,
    scheduledDate: m.matchDate ? new Date(m.matchDate).toLocaleDateString('en-IN') : '',
    scheduledTime: m.matchTime || '',
    yellowCards: (m.yellowCardsTeamA || 0) + (m.yellowCardsTeamB || 0),
    redCards: (m.redCardsTeamA || 0) + (m.redCardsTeamB || 0),
    yellowCardsTeamA: m.yellowCardsTeamA || 0,
    redCardsTeamA: m.redCardsTeamA || 0,
    yellowCardsTeamB: m.yellowCardsTeamB || 0,
    redCardsTeamB: m.redCardsTeamB || 0,
    remarks: m.matchSummary || '',
    tournament: m.tournament?.title || '',
    verificationTier: m.verificationTier || 'OFFICIAL_TOURNAMENT'
})

export default function TournamentMatchesPage() {
    const { addToast } = useToast()
    const [matches, setMatches] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [scoreModal, setScoreModal] = useState({ open: false, match: null })
    const [activeLiveScorerMatch, setActiveLiveScorerMatch] = useState(null)
    const [confirmLaunchMatch, setConfirmLaunchMatch] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [form, setForm] = useState({
        team1Score: '',
        team2Score: '',
        status: 'COMPLETED',
        winnerSide: '',
        yellowCardsTeamA: '0',
        redCardsTeamA: '0',
        yellowCardsTeamB: '0',
        redCardsTeamB: '0'
    })

    const fetchMatches = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await getAllTournamentMatches()
            setMatches((res.data || []).map(mapFixture))
        } catch (err) {
            addToast({ title: 'Load Failed', message: err.message || 'Failed to load tournament matches.', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

    useEffect(() => { fetchMatches() }, [fetchMatches])
    useRealtime(['tournament:match-updated'], () => fetchMatches())

    const handleOpenScoreModal = (match) => {
        setScoreModal({ open: true, match })
        setForm({
            team1Score: match.team1Score || '',
            team2Score: match.team2Score || '',
            status: match.rawStatus || 'COMPLETED',
            winnerSide: match.winnerId === match.team1Id ? 'team1' : match.winnerId === match.team2Id ? 'team2' : '',
            yellowCardsTeamA: String(match.yellowCardsTeamA || 0),
            redCardsTeamA: String(match.redCardsTeamA || 0),
            yellowCardsTeamB: String(match.yellowCardsTeamB || 0),
            redCardsTeamB: String(match.redCardsTeamB || 0)
        })
    }

    const handleSaveScore = async () => {
        const currentMatch = scoreModal.match
        const winnerId = form.winnerSide === 'team1' ? currentMatch.team1Id : form.winnerSide === 'team2' ? currentMatch.team2Id : null

        setIsSaving(true)
        try {
            await updateMatchScore(currentMatch.id, {
                teamAScore: form.team1Score,
                teamBScore: form.team2Score,
                winnerId,
                status: form.status,
                yellowCardsTeamA: Number(form.yellowCardsTeamA),
                redCardsTeamA: Number(form.redCardsTeamA),
                yellowCardsTeamB: Number(form.yellowCardsTeamB),
                redCardsTeamB: Number(form.redCardsTeamB)
            })
            addToast({ title: 'Match Score Updated!', message: 'Scorecard, cards & live standings updated.', type: 'success' })
            setScoreModal({ open: false, match: null })
            fetchMatches()
        } catch (err) {
            addToast({ title: 'Save Failed', message: err.message || 'Could not update this match score.', type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    // Clicking "Live Score" no longer jumps straight into the console -- it opens
    // a confirmation popup with match/venue/team details first, from which the
    // operator chooses live scoring or manual scorecard entry.
    const handleLiveScore = (match) => {
        setConfirmLaunchMatch(match)
    }

    const handleConfirmEnterLiveConsole = () => {
        const match = confirmLaunchMatch
        setConfirmLaunchMatch(null)
        setActiveLiveScorerMatch(match)
        addToast({ title: 'Live Cricket Operator Console', message: `Opened live scoring console for Match #${match.matchNumber}`, type: 'info' })
    }

    const handleConfirmManualEntry = () => {
        const match = confirmLaunchMatch
        setConfirmLaunchMatch(null)
        handleOpenScoreModal(match)
    }

    const columns = [
        {
            key: 'roundName',
            label: 'Match # & Round',
            render: (_, r) => (
                <div>
                    <div className="font-extrabold text-surface-900">Match #{r.matchNumber}</div>
                    <div className="text-[11px] text-surface-400 font-medium">{r.roundName}</div>
                </div>
            )
        },
        {
            key: 'fixture',
            label: 'Fixture Teams & Score',
            render: (_, r) => (
                <div className="flex items-center gap-3 text-xs">
                    <span className={`font-black ${r.winnerName === r.team1Name ? 'text-emerald-700 font-bold' : 'text-surface-800'}`}>
                        {r.team1Name} ({r.team1Score})
                    </span>
                    <span className="text-surface-400 font-black">VS</span>
                    <span className={`font-black ${r.winnerName === r.team2Name ? 'text-emerald-700 font-bold' : 'text-surface-800'}`}>
                        {r.team2Name} ({r.team2Score})
                    </span>
                </div>
            )
        },
        {
            key: 'winnerName',
            label: 'Winner',
            render: v => v ? <span className="font-extrabold text-emerald-600 flex items-center gap-1"><HiTrophy className="text-amber-500" /> {v}</span> : <span className="text-surface-400 font-medium">TBD</span>
        },
        {
            key: 'cards',
            label: 'Cards Issued',
            render: (_, r) => (
                <div className="flex gap-2 text-xs font-bold">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded">🟨 {r.yellowCards}</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded">🟥 {r.redCards}</span>
                </div>
            )
        },
        {
            key: 'verification',
            label: 'Verification Tier',
            render: (_, r) => {
                const tier = TIER_LABEL[r.verificationTier] || TIER_LABEL.OFFICIAL_TOURNAMENT
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1 w-max">
                            {tier.icon} {tier.label}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">{tier.multiplier} Rank Weight</span>
                    </div>
                )
            }
        },
        {
            key: 'status',
            label: 'Match Status',
            render: v => <Badge variant={v === 'Completed' ? 'success' : v === 'Live' ? 'danger' : 'default'} dot>{v}</Badge>
        },
        {
            key: 'action',
            label: 'Action',
            render: (_, r) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleLiveScore(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        <HiPlay className="w-3.5 h-3.5" /> Live Score
                    </button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        <HiPlay className="text-emerald-500" /> Match Scorecard & Live Management
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Update match scores, runs, goals, disciplinary yellow/red cards, and live results</p>
                </div>
            </div>

            {/* Match Datatable */}
            <Card className="p-6">
                {isLoading ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">Loading tournament matches...</div>
                ) : matches.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">No tournament fixtures found.</div>
                ) : (
                    <DataTable columns={columns} data={matches} />
                )}
            </Card>

            {/* Match Selection Confirmation Popup -- shown before launching either the
                live scorer console or the manual scorecard entry modal. */}
            <Modal isOpen={!!confirmLaunchMatch} onClose={() => setConfirmLaunchMatch(null)} title="Confirm Match Selection" size="sm">
                {confirmLaunchMatch && (
                    <div className="space-y-4">
                        <div className="bg-surface-50 p-4 rounded-2xl border border-surface-200 text-center">
                            <div className="text-xs font-bold text-surface-400 uppercase">{confirmLaunchMatch.roundName} &bull; Match #{confirmLaunchMatch.matchNumber}</div>
                            <div className="flex justify-around items-center mt-2">
                                <span className="font-black text-surface-900 text-base">{confirmLaunchMatch.team1Name}</span>
                                <span className="text-xs font-black text-surface-400 bg-surface-200 px-2 py-1 rounded-lg">VS</span>
                                <span className="font-black text-surface-900 text-base">{confirmLaunchMatch.team2Name}</span>
                            </div>
                            <div className="text-[11px] text-surface-500 font-semibold mt-2">
                                {confirmLaunchMatch.scheduledDate} &middot; {confirmLaunchMatch.scheduledTime}
                            </div>
                        </div>
                        <p className="text-xs text-surface-500 font-medium text-center">Choose how you want to record this match's result.</p>
                        <div className="flex flex-col gap-2 pt-2">
                            <Button onClick={handleConfirmEnterLiveConsole} className="cursor-pointer">
                                <HiPlay className="w-3.5 h-3.5 mr-1" /> Enter Live Scorer Console
                            </Button>
                            <Button variant="secondary" onClick={handleConfirmManualEntry} className="cursor-pointer">
                                Manual Scorecard Entry
                            </Button>
                            <Button variant="secondary" onClick={() => setConfirmLaunchMatch(null)} className="cursor-pointer">
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Score Updater Modal */}
            <Modal isOpen={scoreModal.open} onClose={() => setScoreModal({ open: false, match: null })} title="Update Match Scorecard" size="md">
                {scoreModal.match && (
                    <div className="space-y-4">
                        <div className="bg-surface-50 p-4 rounded-2xl border border-surface-200 text-center">
                            <div className="text-xs font-bold text-surface-400 uppercase">{scoreModal.match.roundName} &bull; Match #{scoreModal.match.matchNumber}</div>
                            <div className="flex justify-around items-center mt-2">
                                <span className="font-black text-surface-900 text-base">{scoreModal.match.team1Name}</span>
                                <span className="text-xs font-black text-surface-400 bg-surface-200 px-2 py-1 rounded-lg">VS</span>
                                <span className="font-black text-surface-900 text-base">{scoreModal.match.team2Name}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label={`${scoreModal.match.team1Name} Score`}
                                placeholder="e.g. 142/4 (16.2 ov)"
                                value={form.team1Score}
                                onChange={(e) => setForm({ ...form, team1Score: e.target.value })}
                            />
                            <Input
                                label={`${scoreModal.match.team2Name} Score`}
                                placeholder="e.g. 138/8 (20 ov)"
                                value={form.team2Score}
                                onChange={(e) => setForm({ ...form, team2Score: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Status"
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                options={[
                                    { value: 'SCHEDULED', label: 'Scheduled' },
                                    { value: 'LIVE', label: 'Live Now' },
                                    { value: 'COMPLETED', label: 'Completed' },
                                    { value: 'ABANDONED', label: 'Abandoned' },
                                ]}
                            />
                            <Select
                                label="Winner"
                                value={form.winnerSide}
                                onChange={(e) => setForm({ ...form, winnerSide: e.target.value })}
                                options={[
                                    { value: '', label: 'Not decided / Draw' },
                                    { value: 'team1', label: scoreModal.match.team1Name },
                                    { value: 'team2', label: scoreModal.match.team2Name },
                                ]}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-surface-700">{scoreModal.match.team1Name} Cards</label>
                                <div className="flex gap-2">
                                    <Input placeholder="🟨 Yellow" type="number" value={form.yellowCardsTeamA} onChange={(e) => setForm({ ...form, yellowCardsTeamA: e.target.value })} />
                                    <Input placeholder="🟥 Red" type="number" value={form.redCardsTeamA} onChange={(e) => setForm({ ...form, redCardsTeamA: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-surface-700">{scoreModal.match.team2Name} Cards</label>
                                <div className="flex gap-2">
                                    <Input placeholder="🟨 Yellow" type="number" value={form.yellowCardsTeamB} onChange={(e) => setForm({ ...form, yellowCardsTeamB: e.target.value })} />
                                    <Input placeholder="🟥 Red" type="number" value={form.redCardsTeamB} onChange={(e) => setForm({ ...form, redCardsTeamB: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-3 border-t border-surface-100">
                            <Button variant="secondary" onClick={() => setScoreModal({ open: false, match: null })} disabled={isSaving}>Cancel</Button>
                            <Button onClick={handleSaveScore} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Match Result'}</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Professional Live Cricket Scoring Operator Console Overlay */}
            {activeLiveScorerMatch && (
                <CricketScorerConsole
                    match={activeLiveScorerMatch}
                    onClose={() => setActiveLiveScorerMatch(null)}
                />
            )}
        </div>
    )
}
