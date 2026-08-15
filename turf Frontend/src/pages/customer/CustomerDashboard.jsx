import { useState, useEffect } from 'react'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { getPublicTournaments, getTeams } from '../../services/tournamentService'
import { useAuth } from '../../context/AuthContext'

export default function CustomerDashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const DEFAULT_DEMO = [
        { id: 'BK-701', sport: 'Cricket 🏏', venue: 'Champions Turf Arena (Vijay Nagar)', date: '2026-08-15', time: '06:00 PM', status: 'Confirmed' },
        { id: 'BK-702', sport: 'Football ⚽', venue: 'SkyLine Sports Arena (Palasia)', date: '2026-08-18', time: '07:00 PM', status: 'Confirmed' },
        { id: 'BK-703', sport: 'Box Cricket 🏏', venue: 'Velocity Sports Hub (Rau)', date: '2026-08-22', time: '08:00 PM', status: 'Pending' }
    ]

    const [stats, setStats] = useState({ activeTournaments: 4, activeTeams: 2, matchesPlayed: 14 })
    const [myBookings, setMyBookings] = useState(DEFAULT_DEMO)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const tRes = await getPublicTournaments()
                const teamRes = await getTeams()

                let activeTournaments = 4
                if (tRes?.success && Array.isArray(tRes.data) && tRes.data.length > 0) {
                    activeTournaments = tRes.data.filter(t => ['Approved', 'Active'].includes(t.status)).length || 4
                }

                let activeTeams = 2
                if (teamRes?.success && Array.isArray(teamRes.data) && teamRes.data.length > 0) {
                    activeTeams = teamRes.data.length
                }

                setStats({ activeTournaments, activeTeams, matchesPlayed: 14 })
            } catch (err) {
                console.error("Failed to load tournament dashboard stats", err)
            }
        }
        fetchDashboardData()

        // Load customer's personal bookings
        try {
            const raw = localStorage.getItem('customer_bookings')
            if (raw) {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const currentEmail = (user?.email || '').toLowerCase()
                    const currentUserId = user?.id || ''
                    const currentPhone = user?.phone || user?.mobile || ''

                    const filtered = parsed.filter(b => {
                        if (b.isGuest || b.userEmail === 'guest@sportmatrix.com') return false
                        const bEmail = (b.userEmail || '').toLowerCase()
                        const bUserId = b.userId || ''
                        const bPhone = b.customerPhone || b.phone || ''

                        if (currentEmail && bEmail && bEmail === currentEmail) return true
                        if (currentUserId && bUserId && bUserId === currentUserId) return true
                        if (currentPhone && bPhone && bPhone === currentPhone) return true
                        return false
                    })
                    if (filtered.length > 0) {
                        setMyBookings(filtered)
                    }
                }
            }
        } catch (e) { }
    }, [user?.email, user?.id])

    const upcomingBookings = myBookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">My Dashboard</h1>
                <p className="text-surface-500 text-sm mt-1">Welcome back{user?.name ? `, ${user.name}` : ''}! Here&apos;s your activity overview.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Bookings" value={myBookings.length.toString()} icon="📅" colorTheme="blue" />
                <StatCard label="Active Teams" value={stats.activeTeams.toString()} icon="👥" colorTheme="emerald" />
                <StatCard label="Active Tournaments" value={stats.activeTournaments.toString()} icon="🏆" colorTheme="purple" />
                <StatCard label="Wallet Balance" value="₹0" icon="💰" colorTheme="amber" />
            </div>

            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-surface-900">Upcoming Bookings</h2>
                    <Button size="sm" variant="outline" onClick={() => navigate('/customer/bookings')}>View All</Button>
                </div>
                <div className="space-y-3">
                    {upcomingBookings.length > 0 ? (
                        upcomingBookings.slice(0, 3).map((b, i) => (
                            <div key={b.id || i} className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center text-xl">
                                        {b.sport?.toLowerCase().includes('cricket') ? '🏏' : '⚽'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-surface-900 text-sm">{b.sport || 'Turf Match'} — {b.venue}</p>
                                        <p className="text-xs text-surface-400">{b.date} · {b.time}</p>
                                    </div>
                                </div>
                                <Badge variant={b.status === 'Confirmed' ? 'success' : 'warning'} dot>{b.status}</Badge>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 bg-surface-50 rounded-xl border border-surface-100">
                            <p className="text-xs text-surface-500 mb-2">No upcoming bookings scheduled for your account.</p>
                            <Button size="sm" onClick={() => navigate('/turfs')} className="bg-[#16A34A] text-white">Book Slot Now</Button>
                        </div>
                    )}
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
