import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { getPublicTournaments, getFixtures } from '../../services/tournamentService'

export default function CustomerMatches() {
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAllMatches()
    }, [])

    const fetchAllMatches = async () => {
        setLoading(true)
        try {
            const tRes = await getPublicTournaments()
            if (tRes.success && Array.isArray(tRes.data)) {
                const activeTourneys = tRes.data.filter(t => ['Approved', 'Active'].includes(t.status))
                
                let allFixtures = []
                for (let t of activeTourneys) {
                    try {
                        const fRes = await getFixtures(t.id || t._id)
                        if (fRes.success && Array.isArray(fRes.data)) {
                            const fWithMeta = fRes.data.map(f => ({
                                ...f,
                                tournament: t.title || t.name,
                                venue: t.courtName || t.court_name || 'Main Turf',
                            }))
                            allFixtures = [...allFixtures, ...fWithMeta]
                        }
                    } catch (e) {
                        // ignore errors for individual fixtures fetch
                    }
                }
                setMatches(allFixtures)
            }
        } catch (error) {
            console.error('Error fetching matches:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">My Matches</h1>
                <p className="text-surface-500 text-sm mt-1">Past and upcoming matches</p>
            </div>

            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-surface-100 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {matches.map(m => {
                        const status = m.status || 'Upcoming'
                        const isWon = m.winner_team_id !== null // simplified check
                        let resultText = status
                        let scoreText = '—'
                        
                        if (status === 'Completed') {
                            resultText = 'Completed'
                            scoreText = `${m.team1_score ?? 0} vs ${m.team2_score ?? 0}`
                        }

                        return (
                        <Card key={m.id || m._id} hover>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                                        status === 'Completed' ? 'bg-accent-500' : 'bg-primary-500'
                                    }`}>
                                        {status === 'Completed' ? 'W' : '—'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-surface-900">{m.team1_name || 'TBD'} vs {m.team2_name || 'TBD'}</p>
                                        <p className="text-sm text-surface-400">{m.tournament} · {m.match_date ? new Date(m.match_date).toLocaleDateString() : 'TBD'} · {m.match_time || 'TBD'}</p>
                                        <p className="text-xs text-surface-500 mt-1">{m.venue}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant={status === 'Completed' ? 'success' : 'warning'}>
                                        {resultText}
                                    </Badge>
                                    {scoreText !== '—' && <p className="text-sm font-medium text-surface-700 mt-2">{scoreText}</p>}
                                </div>
                            </div>
                        </Card>
                    )})}

                    {!loading && matches.length === 0 && (
                        <div className="text-center py-12 bg-surface-50 rounded-xl border border-surface-100">
                            <p className="text-surface-500 mb-4">No matches scheduled yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
