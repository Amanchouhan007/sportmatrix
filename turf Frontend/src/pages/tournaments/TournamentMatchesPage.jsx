import { useState, useEffect } from 'react'
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

const mockMatches = [
    {
        id: 'fix_101',
        roundName: 'Semi-Finals',
        matchNumber: 1,
        team1Name: 'Indore Thunders',
        team1Score: 145,
        team2Name: 'Warriors XI',
        team2Score: 122,
        winnerName: 'Indore Thunders',
        winnerTeamId: 'tm_101',
        status: 'Completed',
        scheduledDate: '2026-03-16',
        scheduledTime: '16:00',
        yellowCards: 2,
        redCards: 0,
        remarks: 'High scoring match',
        verificationTier: 'Tier 3',
        trustMultiplier: '2.0x'
    },
    {
        id: 'fix_102',
        roundName: 'Semi-Finals',
        matchNumber: 2,
        team1Name: 'Royal Challengers',
        team1Score: 156,
        team2Name: 'Super Kings',
        team2Score: 148,
        winnerName: 'Royal Challengers',
        winnerTeamId: 'tm_102',
        status: 'Completed',
        scheduledDate: '2026-03-16',
        scheduledTime: '18:00',
        yellowCards: 1,
        redCards: 1,
        remarks: '1 Red card issued in 18th over',
        verificationTier: 'Tier 3',
        trustMultiplier: '2.0x'
    },
    {
        id: 'fix_103',
        roundName: 'Grand Finale',
        matchNumber: 3,
        team1Name: 'Indore Thunders',
        team1Score: 0,
        team2Name: 'Royal Challengers',
        team2Score: 0,
        winnerName: null,
        status: 'Scheduled',
        scheduledDate: '2026-03-20',
        scheduledTime: '19:00',
        yellowCards: 0,
        redCards: 0,
        remarks: '',
        verificationTier: 'Tier 3',
        trustMultiplier: '2.0x'
    }
]

export default function TournamentMatchesPage() {
    const { addToast } = useToast()
    const [matches, setMatches] = useState(mockMatches)
    const [scoreModal, setScoreModal] = useState({ open: false, match: null })
    const [activeLiveScorerMatch, setActiveLiveScorerMatch] = useState(null)
    const [form, setForm] = useState({
        team1Score: '0',
        team2Score: '0',
        status: 'Completed',
        yellowCards: '0',
        redCards: '0',
        remarks: ''
    })

    // Fetch live matches from MySQL DB via REST API
    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/v1/tournaments/matches/all')
                const data = await res.json()
                if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                    const mapped = data.data.map(m => ({
                        id: m.id,
                        roundName: m.round_name || 'Playoffs',
                        matchNumber: m.match_number,
                        team1Name: m.team1_name,
                        team1Score: m.team1_score,
                        team2Name: m.team2_name,
                        team2Score: m.team2_score,
                        winnerName: m.winner_name,
                        status: m.status || 'Scheduled',
                        scheduledDate: '2026-03-20',
                        scheduledTime: '19:00',
                        yellowCards: 0,
                        redCards: 0,
                        remarks: m.live_state_json ? 'Live Scorer Console Enabled' : ''
                    }))
                    setMatches(mapped)
                }
            } catch (err) {
                console.warn('API fetch matches note:', err.message)
            }
        }
        fetchMatches()
    }, [])

    const handleOpenScoreModal = (match) => {
        setScoreModal({ open: true, match })
        setForm({
            team1Score: String(match.team1Score || 0),
            team2Score: String(match.team2Score || 0),
            status: match.status || 'Completed',
            yellowCards: String(match.yellowCards || 0),
            redCards: String(match.redCards || 0),
            remarks: match.remarks || ''
        })
    }

    const handleSaveScore = () => {
        const t1Score = Number(form.team1Score)
        const t2Score = Number(form.team2Score)
        const currentMatch = scoreModal.match

        let winnerName = null
        if (t1Score > t2Score) winnerName = currentMatch.team1Name
        else if (t2Score > t1Score) winnerName = currentMatch.team2Name

        setMatches(matches.map(m => m.id === currentMatch.id ? {
            ...m,
            team1Score: t1Score,
            team2Score: t2Score,
            winnerName,
            status: form.status,
            yellowCards: Number(form.yellowCards),
            redCards: Number(form.redCards),
            remarks: form.remarks
        } : m))

        setScoreModal({ open: false, match: null })
        addToast({ title: 'Match Score Updated!', message: 'Scorecard, cards & live standings updated.', type: 'success' })
    }

    const handleLiveScore = (match) => {
        setActiveLiveScorerMatch(match)
        addToast({ title: 'Live Cricket Operator Console', message: `Opened live scoring console for Match #${match.matchNumber}`, type: 'info' })
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
            render: (_, r) => (
                <div className="flex flex-col gap-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1 w-max">
                        🏆 Tier 3 Official
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">2.0x Rank Weight</span>
                </div>
            )
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
                <DataTable columns={columns} data={matches} />
            </Card>

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
                                type="number"
                                value={form.team1Score}
                                onChange={(e) => setForm({ ...form, team1Score: e.target.value })}
                            />
                            <Input
                                label={`${scoreModal.match.team2Name} Score`}
                                type="number"
                                value={form.team2Score}
                                onChange={(e) => setForm({ ...form, team2Score: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <Select
                                label="Status"
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                options={[
                                    { value: 'Scheduled', label: 'Scheduled' },
                                    { value: 'Live', label: 'Live Now' },
                                    { value: 'Completed', label: 'Completed' },
                                ]}
                            />
                            <Input
                                label="Yellow Cards 🟨"
                                type="number"
                                value={form.yellowCards}
                                onChange={(e) => setForm({ ...form, yellowCards: e.target.value })}
                            />
                            <Input
                                label="Red Cards 🟥"
                                type="number"
                                value={form.redCards}
                                onChange={(e) => setForm({ ...form, redCards: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-surface-700 mb-1">Match Remarks & Notes</label>
                            <textarea
                                rows="2"
                                placeholder="e.g. Player of match: Rajesh Patel"
                                value={form.remarks}
                                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                                className="w-full p-3 text-xs bg-white border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-3 border-t border-surface-100">
                            <Button variant="secondary" onClick={() => setScoreModal({ open: false, match: null })}>Cancel</Button>
                            <Button onClick={handleSaveScore}>Save Match Result</Button>
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
