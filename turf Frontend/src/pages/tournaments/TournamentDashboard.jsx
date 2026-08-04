import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { HiUserGroup, HiCurrencyRupee, HiClock, HiPlus, HiCheckCircle, HiExclamationCircle, HiPlay } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'

export default function TournamentDashboard({ role = 'owner' }) {
    const [stats, setStats] = useState({
        totalTournaments: 8,
        pendingApprovals: 2,
        approvedActive: 4,
        totalTeams: 36,
        totalRevenue: 64500,
        platformCommission: 6450
    })

    const basePath = role === 'staff' ? '/staff/tournaments' : '/admin/tournaments'

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        <HiTrophy className="text-amber-500" /> Tournament Management Dashboard
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">
                        Comprehensive overview of tournament approvals, team registrations, fixtures, and revenue
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to={`${basePath}/create`}>
                        <Button className="shadow-lg shadow-primary-500/10 cursor-pointer">
                            <HiPlus className="w-5 h-5 mr-1" /> Create Tournament
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Total Tournaments"
                    value={stats.totalTournaments}
                    icon={<HiTrophy className="w-6 h-6 text-primary-600" />}
                    trend="+2 this month"
                    trendUp={true}
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats.pendingApprovals}
                    icon={<HiClock className="w-6 h-6 text-amber-500" />}
                    subtitle="Requires Owner Review"
                />
                <StatCard
                    title="Registered Teams"
                    value={stats.totalTeams}
                    icon={<HiUserGroup className="w-6 h-6 text-emerald-500" />}
                    trend="+12 this week"
                    trendUp={true}
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={<HiCurrencyRupee className="w-6 h-6 text-indigo-500" />}
                    subtitle={`Commission: ₹${stats.platformCommission.toLocaleString()}`}
                />
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-xl font-bold">
                            <HiExclamationCircle />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-surface-900">Pending Approvals</h3>
                            <p className="text-xs text-surface-500 mt-0.5">Review staff submitted tournaments</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-surface-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                            {stats.pendingApprovals} Tournaments Waiting
                        </span>
                        <Link to={`${basePath}/pending`} className="text-xs font-bold text-primary-600 hover:underline">
                            Review Now &rarr;
                        </Link>
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl font-bold">
                            <HiPlay />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-surface-900">Live Fixtures & Matches</h3>
                            <p className="text-xs text-surface-500 mt-0.5">Update scores & card stats</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-surface-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            Auto Bracket Generator
                        </span>
                        <Link to={`${basePath}/matches`} className="text-xs font-bold text-primary-600 hover:underline">
                            View Matches &rarr;
                        </Link>
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xl font-bold">
                            <HiUserGroup />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-surface-900">Team Registrations</h3>
                            <p className="text-xs text-surface-500 mt-0.5">Player rosters & entry fee log</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-surface-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                            {stats.totalTeams} Registered Teams
                        </span>
                        <Link to={`${basePath}/registrations`} className="text-xs font-bold text-primary-600 hover:underline">
                            Manage Teams &rarr;
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    )
}
