import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import BracketComponent from '../../components/ui/BracketComponent'
import { getTournamentById, getFixtures, getLeaderboard } from '../../services/tournamentService'

export default function CustomerTournamentDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [tournament, setTournament] = useState(null)
    const [fixtures, setFixtures] = useState([])
    const [leaderboard, setLeaderboard] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('bracket')

    useEffect(() => {
        fetchData()
    }, [id])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await getTournamentById(id)
            if (res.success && res.data) {
                setTournament(res.data)
            }
            try {
                const fRes = await getFixtures(id)
                if (fRes.success && Array.isArray(fRes.data)) setFixtures(fRes.data)
            } catch (e) { /* ignore */ }
            
            try {
                const lRes = await getLeaderboard(id)
                if (lRes.success && Array.isArray(lRes.data)) setLeaderboard(lRes.data)
            } catch (e) { /* ignore */ }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-surface-200 rounded w-64" />
                <div className="h-48 bg-surface-100 rounded-xl" />
            </div>
        )
    }

    if (!tournament) {
        return (
            <div className="text-center py-12 bg-surface-50 rounded-xl border border-surface-100">
                <p className="text-surface-500 mb-4">Tournament not found.</p>
                <Button onClick={() => navigate('/customer/tournaments')}>Back to Tournaments</Button>
            </div>
        )
    }

    // Build bracket from fixtures
    const bracketRounds = fixtures.length > 0
        ? Object.entries(fixtures.reduce((acc, f) => {
            const round = f.round_name || 'Round 1'
            if (!acc[round]) acc[round] = []
            acc[round].push({
                teams: [
                    { seed: f.match_number || 1, name: f.team1_name || 'TBD', score: f.team1_score ?? '—', winner: f.winner_team_id === f.team1_id },
                    { seed: f.match_number || 2, name: f.team2_name || 'TBD', score: f.team2_score ?? '—', winner: f.winner_team_id === f.team2_id }
                ]
            })
            return acc
        }, {})).map(([name, matches]) => ({ name, matches }))
        : [{ name: 'Round 1', matches: [{ teams: [{ seed: 1, name: 'TBD', score: '—' }, { seed: 2, name: 'TBD', score: '—' }] }] }]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-100 rounded-lg text-surface-500 transition-colors">
                    ←
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">{tournament.title || tournament.name}</h1>
                    <div className="flex items-center gap-3 mt-1 text-sm text-surface-500">
                        <Badge variant="primary">{tournament.sport || 'Sports'}</Badge>
                        <span>·</span>
                        <span>{tournament.courtName || tournament.court_name || 'Main Turf'}</span>
                        <span>·</span>
                        <span>{tournament.date || new Date(tournament.start_date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center py-4">
                    <p className="text-sm text-surface-500">Status</p>
                    <p className="font-bold text-surface-900 mt-1">{tournament.status}</p>
                </Card>
                <Card className="text-center py-4">
                    <p className="text-sm text-surface-500">Format</p>
                    <p className="font-bold text-surface-900 mt-1">{tournament.format || 'Knockout'}</p>
                </Card>
                <Card className="text-center py-4">
                    <p className="text-sm text-surface-500">Prize Pool</p>
                    <p className="font-bold text-surface-900 mt-1">₹{tournament.prize_pool || tournament.prizePool || '0'}</p>
                </Card>
                <Card className="text-center py-4">
                    <p className="text-sm text-surface-500">Teams</p>
                    <p className="font-bold text-surface-900 mt-1">{tournament.registrations} / {tournament.max_teams || 16}</p>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-surface-200">
                {['bracket', 'leaderboard'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                            activeTab === tab 
                                ? 'border-primary-500 text-primary-600' 
                                : 'border-transparent text-surface-500 hover:text-surface-700'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl border border-surface-200 p-6">
                {activeTab === 'bracket' && (
                    <div className="overflow-x-auto min-h-[400px]">
                        <BracketComponent rounds={bracketRounds} />
                    </div>
                )}
                
                {activeTab === 'leaderboard' && (
                    <div>
                        {leaderboard.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-surface-200 text-surface-500 text-xs uppercase bg-surface-50">
                                        <th className="py-3 px-4 rounded-tl-lg">Rank</th>
                                        <th className="py-3 px-4">Team</th>
                                        <th className="py-3 px-4">P</th>
                                        <th className="py-3 px-4">W</th>
                                        <th className="py-3 px-4">D</th>
                                        <th className="py-3 px-4">L</th>
                                        <th className="py-3 px-4">GD</th>
                                        <th className="py-3 px-4 rounded-tr-lg">Pts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((row, i) => (
                                        <tr key={i} className="border-b border-surface-100 hover:bg-surface-50">
                                            <td className="py-3 px-4 font-bold text-surface-900">{row.rank_position || i + 1}</td>
                                            <td className="py-3 px-4 font-medium text-surface-900">{row.team_name}</td>
                                            <td className="py-3 px-4 text-surface-500">{row.matches_played}</td>
                                            <td className="py-3 px-4 text-success-600 font-medium">{row.wins}</td>
                                            <td className="py-3 px-4 text-surface-500">{row.draws}</td>
                                            <td className="py-3 px-4 text-danger-600 font-medium">{row.losses}</td>
                                            <td className="py-3 px-4 text-surface-700">{row.goal_difference}</td>
                                            <td className="py-3 px-4 font-bold text-primary-600">{row.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12 text-surface-500">
                                No leaderboard data available yet.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
