import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { getPublicTournaments } from '../../services/tournamentService'

export default function CustomerTournaments() {
    const navigate = useNavigate()
    const [tournaments, setTournaments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTournaments()
    }, [])

    const fetchTournaments = async () => {
        setLoading(true)
        try {
            const res = await getPublicTournaments()
            if (res.success && Array.isArray(res.data)) {
                setTournaments(res.data)
            }
        } catch (error) {
            console.error('Error fetching customer tournaments:', error)
        } finally {
            setLoading(false)
        }
    }

    const ACTIVE_STATUSES = ['approved', 'active', 'running', 'registration_open', 'upcoming']
    const PAST_STATUSES = ['completed', 'cancelled', 'rejected', 'suspended']

    const activeTournaments = tournaments.filter(t => ACTIVE_STATUSES.includes((t.status || '').toLowerCase()))
    const pastTournaments = tournaments.filter(t => PAST_STATUSES.includes((t.status || '').toLowerCase()))

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">My Tournaments</h1>
                    <p className="text-surface-500 text-sm mt-1">Active and past tournament participation</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/tournaments')}>Browse Tournaments</Button>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-8">
                    <div>
                        <div className="h-6 bg-surface-200 rounded w-48 mb-4" />
                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="h-40 bg-surface-100 rounded-xl" />
                            <div className="h-40 bg-surface-100 rounded-xl" />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div>
                        <h2 className="text-lg font-semibold text-surface-900 mb-4">Active Tournaments</h2>
                        {activeTournaments.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-5">
                                {activeTournaments.map(t => (
                                    <Card key={t.id || t._id} hover>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge variant="primary">{t.sport || 'Sports'}</Badge>
                                            <Badge variant={t.status === 'Active' ? 'success' : 'warning'} dot>{t.status}</Badge>
                                        </div>
                                        <h3 className="font-semibold text-surface-900 mb-2">{t.name || t.title}</h3>
                                        <div className="space-y-1.5 text-sm text-surface-500">
                                            <p>Location: <span className="text-surface-700 font-medium">{t.courtName || t.court_name || 'Main Turf'}</span></p>
                                            <p>Date: <span className="text-surface-700 font-medium">{t.date}</span></p>
                                        </div>
                                        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => navigate(`/customer/tournaments/${t.id || t._id}`)}>
                                            View Tournament Details
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-surface-50 border border-surface-100 rounded-xl">
                                <p className="text-surface-500 text-sm">No active tournaments found.</p>
                                <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/tournaments')}>Find Tournaments</Button>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-surface-900 mb-4">Past Tournaments</h2>
                        {pastTournaments.length > 0 ? (
                            <div className="space-y-3">
                                {pastTournaments.map(t => (
                                    <Card key={t.id || t._id}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl bg-surface-100 flex items-center justify-center text-surface-600 font-bold">🏅</div>
                                                <div>
                                                    <p className="font-medium text-surface-900 text-sm">{t.name || t.title}</p>
                                                    <p className="text-xs text-surface-400">{t.sport || 'Sports'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="default">{t.status}</Badge>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-surface-50 border border-surface-100 rounded-xl">
                                <p className="text-surface-500 text-sm">No past tournaments found.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
