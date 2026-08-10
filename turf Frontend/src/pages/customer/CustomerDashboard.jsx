import { useState, useEffect } from 'react'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { getPublicTournaments, getTeams } from '../../services/tournamentService'

const upcomingBookings = [
    { sport: 'Cricket', venue: 'SportZone Arena', date: 'Mar 15', time: '10:00 AM', status: 'Confirmed' },
    { sport: 'Football', venue: 'ProKick Stadium', date: 'Mar 18', time: '04:30 PM', status: 'Pending' },
]

export default function CustomerDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState({ activeTournaments: 0, activeTeams: 0, matchesPlayed: 0 })

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const tRes = await getPublicTournaments()
                const teamRes = await getTeams()

                let activeTournaments = 0
                if (tRes.success && Array.isArray(tRes.data)) {
                    activeTournaments = tRes.data.filter(t => ['Approved', 'Active'].includes(t.status)).length
                }

                let activeTeams = 0
                if (teamRes.success && Array.isArray(teamRes.data)) {
                    activeTeams = teamRes.data.length
                }

                setStats({ activeTournaments, activeTeams, matchesPlayed: 0 }) // Matches played mock for now
            } catch (err) {
                console.error("Failed to load tournament dashboard stats", err)
            }
        }
        fetchDashboardData()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">My Dashboard</h1>
                <p className="text-surface-500 text-sm mt-1">Welcome back! Here&apos;s your activity overview.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Bookings" value="24" icon="📅" colorTheme="blue" />
                <StatCard label="Active Teams" value={stats.activeTeams.toString()} icon="👥" colorTheme="emerald" />
                <StatCard label="Active Tournaments" value={stats.activeTournaments.toString()} icon="🏆" colorTheme="purple" />
                <StatCard label="Wallet Balance" value="₹2,450" icon="💰" colorTheme="amber" />
            </div>

            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-surface-900">Upcoming Bookings</h2>
                    <Button size="sm" variant="outline" onClick={() => navigate('/customer/bookings')}>View All</Button>
                </div>
                <div className="space-y-3">
                    {upcomingBookings.map((b, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center text-xl">{b.sport === 'Cricket' ? '🏏' : '⚽'}</div>
                                <div><p className="font-medium text-surface-900 text-sm">{b.sport} — {b.venue}</p><p className="text-xs text-surface-400">{b.date} · {b.time}</p></div>
                            </div>
                            <Badge variant={b.status === 'Confirmed' ? 'success' : 'warning'} dot>{b.status}</Badge>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card hover className="cursor-pointer" onClick={() => navigate('/turfs')}>
                    <h3 className="font-semibold text-surface-900 mb-2">🏟️ Book a Turf</h3>
                    <p className="text-sm text-surface-500">Explore and book sports facilities near you</p>
                </Card>
                <Card hover className="cursor-pointer" onClick={() => navigate('/tournaments')}>
                    <h3 className="font-semibold text-surface-900 mb-2">🏆 Join Tournament</h3>
                    <p className="text-sm text-surface-500">Compete in upcoming tournaments and win prizes</p>
                </Card>
            </div>
        </div>
    )
}
