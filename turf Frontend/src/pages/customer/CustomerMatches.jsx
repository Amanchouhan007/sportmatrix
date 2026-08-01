import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const initialMatches = [
    { id: 1, tournament: 'Premier Cricket League', team: 'Thunder XI', opponent: 'Royal Challengers', date: '2026-03-15', time: '10:00 AM', venue: 'SportZone Arena', result: 'Won', score: '145/3 vs 122/8' },
    { id: 2, tournament: 'Football Cup', team: 'Urban FC', opponent: 'City Strikers', date: '2026-03-22', time: '05:00 PM', venue: 'ProKick Stadium', result: 'Upcoming', score: '—' },
    { id: 3, tournament: 'Premier Cricket League', team: 'Thunder XI', opponent: 'Warriors', date: '2026-03-10', time: '02:00 PM', venue: 'SportZone Arena', result: 'Lost', score: '138/6 vs 142/4' },
]

export default function CustomerMatches() {
    const [matches, setMatches] = useState(() => {
        const saved = localStorage.getItem('customer_matches')
        return saved ? JSON.parse(saved) : initialMatches
    })

    useEffect(() => {
        localStorage.setItem('customer_matches', JSON.stringify(matches))
    }, [matches])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">My Matches</h1>
                <p className="text-surface-500 text-sm mt-1">Past and upcoming matches</p>
            </div>

            <div className="space-y-4">
                {matches.map(m => (
                    <Card key={m.id} hover>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                                    m.result === 'Won' ? 'bg-accent-500' : 
                                    m.result === 'Lost' ? 'bg-danger-500' : 
                                    'bg-primary-500'
                                }`}>
                                    {m.result === 'Won' ? 'W' : m.result === 'Lost' ? 'L' : '—'}
                                </div>
                                <div>
                                    <p className="font-semibold text-surface-900">{m.team} vs {m.opponent}</p>
                                    <p className="text-sm text-surface-400">{m.tournament} · {m.date} · {m.time}</p>
                                    <p className="text-xs text-surface-500 mt-1">{m.venue}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant={m.result === 'Won' ? 'success' : m.result === 'Lost' ? 'danger' : 'warning'}>
                                    {m.result}
                                </Badge>
                                {m.score !== '—' && <p className="text-sm font-medium text-surface-700 mt-2">{m.score}</p>}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
