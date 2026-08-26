import { useState, useEffect, useCallback, useMemo } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import BracketComponent from '../../components/ui/BracketComponent'
import AdminMatchControlModal from '../../components/tournaments/AdminMatchControlModal'
import { useToast } from '../../components/ui/Toast'
import { HiRefresh, HiPlay } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'
import api from '../../services/api'
import { getFixtures, generateFixtures, updateMatchScore } from '../../services/tournamentService'

const STATUS_TO_BACKEND = { Scheduled: 'SCHEDULED', Live: 'LIVE', Completed: 'COMPLETED', Cancelled: 'ABANDONED' }
const STATUS_FROM_BACKEND = { SCHEDULED: 'Scheduled', LIVE: 'Live', COMPLETED: 'Completed', ABANDONED: 'Cancelled' }

export default function TournamentFixturesPage() {
    const { addToast } = useToast()
    const [tournaments, setTournaments] = useState([])
    const [selectedTournament, setSelectedTournament] = useState('')
    const [fixtures, setFixtures] = useState([])
    const [isLoadingTournaments, setIsLoadingTournaments] = useState(true)
    const [isLoadingFixtures, setIsLoadingFixtures] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [selectedMatch, setSelectedMatch] = useState(null)
    const [activeRoundName, setActiveRoundName] = useState('')

    const fetchTournaments = useCallback(async () => {
        setIsLoadingTournaments(true)
        try {
            const res = await api.get('/tournaments')
            const list = (res?.data || (Array.isArray(res) ? res : []))
            setTournaments(list)
            if (list.length > 0) setSelectedTournament(list[0].id || list[0]._id)
        } catch (err) {
            addToast({ title: 'Load Failed', message: err.message || 'Failed to load tournaments.', type: 'error' })
        } finally {
            setIsLoadingTournaments(false)
        }
    }, [addToast])

    useEffect(() => { fetchTournaments() }, [fetchTournaments])

    const fetchFixtures = useCallback(async () => {
        if (!selectedTournament) return
        setIsLoadingFixtures(true)
        try {
            const res = await getFixtures(selectedTournament)
            setFixtures(res.data || [])
        } catch (err) {
            addToast({ title: 'Load Failed', message: err.message || 'Failed to load fixtures.', type: 'error' })
            setFixtures([])
        } finally {
            setIsLoadingFixtures(false)
        }
    }, [selectedTournament, addToast])

    useEffect(() => { fetchFixtures() }, [fetchFixtures])

    // Group real fixtures into bracket rounds, preserving backend round order (matchNumber asc)
    const rounds = useMemo(() => {
        const byRound = []
        const roundIndex = {}
        for (const f of fixtures) {
            if (!(f.roundName in roundIndex)) {
                roundIndex[f.roundName] = byRound.length
                byRound.push({ name: f.roundName, matches: [] })
            }
            byRound[roundIndex[f.roundName]].matches.push({
                id: f.id,
                teamAId: f.teamAId,
                teamBId: f.teamBId,
                status: STATUS_FROM_BACKEND[f.status] || 'Scheduled',
                date: f.matchDate ? String(f.matchDate).split('T')[0] : '',
                time: f.matchTime || '',
                groundCourtName: f.groundCourtName || '',
                teams: [
                    { seed: 1, name: f.teamA?.teamName || 'TBD', score: f.teamAScore ?? '—', winner: !!f.winnerId && f.winnerId === f.teamAId },
                    { seed: 2, name: f.teamB?.teamName || 'TBD', score: f.teamBScore ?? '—', winner: !!f.winnerId && f.winnerId === f.teamBId }
                ]
            })
        }
        return byRound
    }, [fixtures])

    const handleGenerateFixtures = async () => {
        if (!selectedTournament) return
        setIsGenerating(true)
        try {
            const res = await generateFixtures(selectedTournament)
            addToast({ title: 'Fixtures Generated!', message: res.message || `Generated ${res.count || ''} match fixtures.`, type: 'success' })
            fetchFixtures()
        } catch (err) {
            addToast({ title: 'Generation Failed', message: err.message || 'Could not generate fixtures.', type: 'error' })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleMatchClick = (match, roundName) => {
        setSelectedMatch(match)
        setActiveRoundName(roundName)
    }

    const handleSaveMatch = async (updatedMatch) => {
        const [t1, t2] = updatedMatch.teams
        let winnerId
        if (t1.winner) winnerId = updatedMatch.teamAId
        else if (t2.winner) winnerId = updatedMatch.teamBId
        else winnerId = ''

        setIsSaving(true)
        try {
            await updateMatchScore(updatedMatch.id, {
                teamAScore: String(t1.score),
                teamBScore: String(t2.score),
                winnerId,
                status: STATUS_TO_BACKEND[updatedMatch.status] || 'COMPLETED',
                matchDate: updatedMatch.date || undefined,
                matchTime: updatedMatch.time || undefined,
                groundCourtName: updatedMatch.groundCourtName || undefined
            })
            addToast({
                title: 'Match Updated!',
                message: winnerId ? 'Score saved and winner advanced on the leaderboard.' : 'Match details updated.',
                type: 'success'
            })
            setSelectedMatch(null)
            fetchFixtures()
        } catch (err) {
            addToast({ title: 'Save Failed', message: err.message || 'Could not update this match.', type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    const selectedTournamentTitle = tournaments.find(t => (t.id || t._id) === selectedTournament)?.title || ''

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        <HiTrophy className="text-amber-500" /> Fixture Generator & Bracket View
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Automatic playoff bracket generation for Knockout & League formats</p>
                </div>

                <div className="flex gap-3 items-center">
                    <Select
                        value={selectedTournament}
                        onChange={(e) => setSelectedTournament(e.target.value)}
                        disabled={isLoadingTournaments || tournaments.length === 0}
                        options={tournaments.map(t => ({ value: t.id || t._id, label: `${t.title || t.name} (${t.tournamentFormat || t.format || 'Knockout'})` }))}
                    />
                    <Button onClick={handleGenerateFixtures} disabled={isGenerating || !selectedTournament} className="whitespace-nowrap">
                        <HiRefresh className="w-5 h-5 mr-1" /> {isGenerating ? 'Generating...' : 'Auto-Generate Fixtures'}
                    </Button>
                </div>
            </div>

            {/* Interactive Visual Playoff Bracket */}
            <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-surface-100 pb-4">
                    <div>
                        <h2 className="text-base font-black text-surface-900 tracking-tight flex items-center gap-1.5">
                            <HiPlay className="text-emerald-500" /> Interactive Playoff Bracket Tree
                        </h2>
                        <p className="text-surface-500 text-xs mt-0.5 flex items-center gap-1">
                            <span>{selectedTournamentTitle || 'Select a tournament'}</span>
                            {rounds.length > 0 && (
                                <span className="text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 ml-2">
                                    💡 Click any match box to edit scores & advance winners
                                </span>
                            )}
                        </p>
                    </div>
                    <Badge variant="success">LIVE BRACKET</Badge>
                </div>

                {isLoadingFixtures ? (
                    <div className="py-16 text-center text-slate-400 text-sm font-semibold">Loading fixtures...</div>
                ) : rounds.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-sm font-semibold">
                        No fixtures generated yet for this tournament -- click "Auto-Generate Fixtures" above (requires at least 2 approved teams).
                    </div>
                ) : (
                    <BracketComponent rounds={rounds} onMatchClick={handleMatchClick} />
                )}
            </Card>

            {/* Admin Match Control Modal */}
            <AdminMatchControlModal
                isOpen={!!selectedMatch}
                onClose={() => setSelectedMatch(null)}
                matchData={selectedMatch}
                roundName={activeRoundName}
                onSaveMatch={handleSaveMatch}
                isSaving={isSaving}
            />
        </div>
    )
}
