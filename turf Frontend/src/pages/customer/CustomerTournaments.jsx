import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'

const activeTournaments = [
    { id: 1, name: 'Premier Cricket League', sport: 'Cricket', team: 'Thunder XI', nextMatch: 'Mar 15, 10:00 AM', status: 'In Progress' },
    { id: 2, name: 'Esports Championship', sport: 'Esports', team: '—', nextMatch: 'Apr 5', status: 'Registered' },
]
const pastTournaments = [
    { id: 3, name: 'Winter Badminton Cup', sport: 'Badminton', team: 'Smash Masters', result: '3rd Place', prize: '₹3,000' },
]

export default function CustomerTournaments() {
    const navigate = useNavigate()
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-surface-900">My Tournaments</h1><p className="text-surface-500 text-sm mt-1">Active and past tournament participation</p></div>
                <Button variant="outline" onClick={() => navigate('/tournaments')}>Browse Tournaments</Button>
            </div>
            <div>
                <h2 className="text-lg font-semibold text-surface-900 mb-4">Active Tournaments</h2>
                <div className="grid md:grid-cols-2 gap-5">
                    {activeTournaments.map(t => (
                        <Card key={t.id} hover>
                            <div className="flex items-center gap-2 mb-3"><Badge variant="primary">{t.sport}</Badge><Badge variant={t.status === 'In Progress' ? 'success' : 'warning'} dot>{t.status}</Badge></div>
                            <h3 className="font-semibold text-surface-900 mb-2">{t.name}</h3>
                            <div className="space-y-1.5 text-sm text-surface-500">
                                <p>Team: <span className="text-surface-700 font-medium">{t.team}</span></p>
                                <p>Next: <span className="text-surface-700 font-medium">{t.nextMatch}</span></p>
                            </div>
                            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate(`/tournaments/${t.id}`)}>View Bracket</Button>
                        </Card>
                    ))}
                </div>
            </div>
            <div>
                <h2 className="text-lg font-semibold text-surface-900 mb-4">Past Tournaments</h2>
                <div className="space-y-3">
                    {pastTournaments.map(t => (
                        <Card key={t.id}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center text-accent-600 font-bold">🏆</div>
                                    <div><p className="font-medium text-surface-900 text-sm">{t.name}</p><p className="text-xs text-surface-400">{t.sport} · {t.team}</p></div>
                                </div>
                                <div className="text-right"><Badge variant="success">{t.result}</Badge><p className="text-xs text-accent-600 font-medium mt-1">{t.prize}</p></div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
