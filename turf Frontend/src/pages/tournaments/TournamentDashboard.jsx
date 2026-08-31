import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar,
    PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts'
import {
    HiUserGroup, HiCurrencyRupee, HiClock, HiPlus, HiCheckCircle,
    HiExclamationCircle, HiPlay, HiChartBar, HiDownload, HiEye,
    HiSparkles, HiTrendingUp, HiCalendar, HiChevronRight, HiFilter,
    HiRefresh, HiSun, HiShieldCheck, HiCreditCard, HiDocumentReport,
    HiFire, HiLocationMarker
} from 'react-icons/hi'
import { HiTrophy, HiBolt, HiArrowTrendingUp } from 'react-icons/hi2'
import api from '../../services/api'

export default function TournamentDashboard({ role = 'owner' }) {
    const [stats, setStats] = useState({
        totalTournaments: 0,
        pendingApprovals: 0,
        approvedActive: 0,
        totalTeams: 0,
        totalRevenue: 0,
        platformCommission: 0
    })

    const [isLoading, setIsLoading] = useState(false)
    const [lastUpdated, setLastUpdated] = useState('Just now')

    const basePath = role === 'staff' ? '/staff/tournaments' : '/admin/tournaments'

    const [liveTournamentsList, setLiveTournamentsList] = useState([])
    const [liveMatchesList, setLiveMatchesList] = useState([])

    const fetchLiveStats = async () => {
        try {
            const res = await api.get('/tournaments')
            const list = (res && res.success && Array.isArray(res.data)) ? res.data : []
            setLiveTournamentsList(list)

            const totalT = list.length
            const pendingA = list.filter(t => (t.status || '').toLowerCase().includes('pending')).length
            const activeA = list.filter(t => (t.status || '').toLowerCase().includes('approved') || (t.status || '').toLowerCase().includes('active')).length
            const teamsCount = list.reduce((sum, t) => sum + (Number(t.maximum_teams || t.maxTeams || t.registrations) || 0), 0)
            const revenueSum = list.reduce((sum, t) => sum + (Number(t.entry_fee_per_team || t.entryFee || 0) * (Number(t.registrations) || 0)), 0)

            setStats({
                totalTournaments: totalT,
                pendingApprovals: pendingA,
                approvedActive: activeA,
                totalTeams: teamsCount,
                totalRevenue: revenueSum
            })
        } catch (err) {
            console.warn('Sync live tournament stats note:', err)
            setLiveTournamentsList([])
        }
    }

    useEffect(() => {
        fetchLiveStats()
    }, [])

    const handleRefresh = () => {
        setIsLoading(true)
        fetchLiveStats()
        setTimeout(() => {
            setIsLoading(false)
            setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }, 600)
    }

    // Dynamic Chart Data
    const statusPieData = [
        { name: 'Active', value: liveTournamentsList.filter(t => ['APPROVED', 'ACTIVE', 'RUNNING'].includes((t.status || '').toUpperCase())).length, color: '#10B981' },
        { name: 'Pending Review', value: liveTournamentsList.filter(t => (t.status || '').toUpperCase().includes('PENDING')).length, color: '#F59E0B' },
        { name: 'Upcoming', value: liveTournamentsList.filter(t => (t.status || '').toUpperCase().includes('UPCOMING') || (t.status || '').toUpperCase().includes('DRAFT')).length, color: '#3B82F6' },
        { name: 'Completed', value: liveTournamentsList.filter(t => (t.status || '').toUpperCase() === 'COMPLETED').length, color: '#6366F1' },
    ].filter(d => d.value > 0);

    const leaderboardList = liveTournamentsList
        .slice()
        .sort((a, b) => (Number(b.entry_fee_per_team || b.entryFee || 0) * Number(b.registrations || 0)) - (Number(a.entry_fee_per_team || a.entryFee || 0) * Number(a.registrations || 0)))
        .slice(0, 3)
        .map((t, idx) => ({
            rank: idx + 1,
            name: t.title || t.name,
            teams: `${t.registrations || 0} Teams`,
            revenue: `₹${((Number(t.entry_fee_per_team || t.entryFee || 0) * Number(t.registrations || 0))).toLocaleString('en-IN')}`,
            badge: idx === 0 ? '🥇 Top Grossing' : idx === 1 ? '🥈 High Engagement' : '🥉 Active'
        }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">

            {/* 1. HERO SECTION */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-[22px] p-6 sm:p-8 shadow-xl border border-indigo-900/40">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5 backdrop-blur-md">
                                <HiSparkles className="w-3.5 h-3.5" /> ENTERPRISE COMMAND CENTER
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Monitoring
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            <HiTrophy className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]" />
                            Tournament Management Dashboard
                        </h1>
                        <p className="text-slate-300 text-sm font-medium leading-relaxed">
                            Monitor live match fixtures, automate bracket draws, manage team entry fees, track commission revenue, and review staff submissions in real-time.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold backdrop-blur-md border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <HiRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Sync Data
                        </button>

                        {role !== 'staff' && (
                            <Link to={`${basePath}/create`}>
                                <Button className="w-full sm:w-auto shadow-lg shadow-indigo-500/20 cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black border-none px-5 py-2.5 rounded-xl">
                                    <HiPlus className="w-4 h-4 mr-1.5" /> CREATE TOURNAMENT
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. QUICK ACTION HUB */}
            <div className="bg-white/80 backdrop-blur-md p-5 rounded-[20px] border border-slate-200/70 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-100 pb-2">
                    <span className="flex items-center gap-1.5 text-slate-700 uppercase tracking-wider">
                        <HiBolt className="text-amber-500" /> Quick Action Hub
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{role === 'staff' ? '6 Module Controls' : '7 Module Controls'}</span>
                </div>

                <div className={`grid grid-cols-2 sm:grid-cols-3 ${role === 'staff' ? 'lg:grid-cols-6' : 'lg:grid-cols-7'} gap-3`}>
                    {[
                        ...(role !== 'staff' ? [{ label: 'New Tournament', icon: <HiPlus className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 hover:bg-emerald-100', border: 'border-emerald-200', path: `${basePath}/create` }] : []),
                        { label: 'Team Roster', icon: <HiUserGroup className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50 hover:bg-indigo-100', border: 'border-indigo-200', path: `${basePath}/registrations` },
                        { label: 'Auto Fixtures', icon: <HiChartBar className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-200', path: `${basePath}/fixtures` },
                        { label: 'Live Matches', icon: <HiPlay className="w-5 h-5 text-rose-600" />, bg: 'bg-rose-50 hover:bg-rose-100', border: 'border-rose-200', path: `${basePath}/matches` },
                        { label: 'Entry Payments', icon: <HiCurrencyRupee className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50 hover:bg-amber-100', border: 'border-amber-200', path: `${basePath}/payments` },
                        { label: 'Reports & Audit', icon: <HiDocumentReport className="w-5 h-5 text-teal-600" />, bg: 'bg-teal-50 hover:bg-teal-100', border: 'border-teal-200', path: `${basePath}/reports` },
                        { label: 'Sponsorships', icon: <HiTrophy className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50 hover:bg-purple-100', border: 'border-purple-200', path: `${basePath}/sponsors` },
                    ].map((item, idx) => (
                        <Link key={idx} to={item.path}>
                            <div className={`p-3 rounded-xl border ${item.border} ${item.bg} transition-all duration-200 text-center flex flex-col items-center justify-center gap-1.5 group cursor-pointer h-full`}>
                                <div className="p-2 rounded-lg bg-white shadow-soft group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                                    {item.label}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* 3. PREMIUM KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* KPI 1 */}
                <div className="relative bg-white/85 backdrop-blur-md rounded-[18px] p-5 border border-slate-200/80 border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tournaments</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                            <HiTrophy />
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalTournaments}</div>
                        {stats.totalTournaments > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                <HiTrendingUp /> Active
                            </span>
                        )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100 flex justify-between">
                        <span>All categories included</span>
                        <span>Updated {lastUpdated}</span>
                    </div>
                </div>

                {/* KPI 2 */}
                <div className="relative bg-white/85 backdrop-blur-md rounded-[18px] p-5 border border-slate-200/80 border-t-4 border-t-amber-500 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                            <HiClock />
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{stats.pendingApprovals}</div>
                        {stats.pendingApprovals > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                                Requires Owner Review
                            </span>
                        )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100 flex justify-between">
                        <span>Staff submissions log</span>
                        <Link to={`${basePath}/pending`} className="text-indigo-600 hover:underline font-bold">Review →</Link>
                    </div>
                </div>

                {/* KPI 3 */}
                <div className="relative bg-white/85 backdrop-blur-md rounded-[18px] p-5 border border-slate-200/80 border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Teams</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                            <HiUserGroup />
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalTeams}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100 flex justify-between">
                        <span>Player roster verified</span>
                        <Link to={`${basePath}/registrations`} className="text-indigo-600 hover:underline font-bold">Teams →</Link>
                    </div>
                </div>

                {/* KPI 4 */}
                <div className="relative bg-white/85 backdrop-blur-md rounded-[18px] p-5 border border-slate-200/80 border-t-4 border-t-indigo-500 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                            <HiCurrencyRupee />
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">₹{(stats.totalRevenue || 0).toLocaleString()}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100 flex justify-between">
                        <span>Entry fee earnings</span>
                        <Link to={`${basePath}/payments`} className="text-indigo-600 hover:underline font-bold">Payouts →</Link>
                    </div>
                </div>
            </div>

            {/* 4. ANALYTICS CHARTS SECTION */}
            {statusPieData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Status Doughnut Chart */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-[18px] border border-slate-200/70 shadow-sm flex flex-col justify-between">
                        <div className="mb-2">
                            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                                <HiTrophy className="text-amber-500" /> Tournament Status Breakdown
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Distribution across active, upcoming & completed</p>
                        </div>
                        <div className="h-52 w-full relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={240} minWidth={0}>
                                <PieChart>
                                    <Pie
                                        data={statusPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {statusPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '10px', color: '#FFF', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-slate-900">{stats.totalTournaments}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                            {statusPieData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                    <span className="text-slate-600 font-medium truncate">{item.name}:</span>
                                    <span className="font-bold text-slate-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 5. LIVE MATCHES & GROUND AVAILABILITY GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Match Widget */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-[18px] border border-slate-200/70 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                                </span>
                                Live Match Scorecards
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Real-time ground match monitoring & score updates</p>
                        </div>
                        <Link to={`${basePath}/matches`}>
                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer">
                                All Live Matches →
                            </button>
                        </Link>
                    </div>

                    {liveMatchesList.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {liveMatchesList.map((match) => (
                                <div key={match.id} className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-soft relative overflow-hidden space-y-3">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-indigo-400 font-extrabold tracking-wide uppercase">{match.category}</span>
                                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-black tracking-wider flex items-center gap-1 border border-rose-500/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" /> LIVE
                                        </span>
                                    </div>
                                    <div className="font-bold text-xs text-slate-300 truncate">{match.tournament}</div>
                                    <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-white">{match.teamA}</span>
                                            <span className="font-mono font-black text-amber-400">{match.scoreA}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-white">{match.teamB}</span>
                                            <span className="font-mono font-black text-amber-400">{match.scoreB}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-slate-50/50 rounded-xl border border-slate-200/60">
                            No live matches currently in progress.
                        </div>
                    )}
                </div>

                {/* Ground Availability Widget */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[18px] border border-slate-200/70 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                            <HiLocationMarker className="text-emerald-600" /> Turf Ground Status
                        </h3>
                    </div>
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-slate-50/50 rounded-xl border border-slate-200/60">
                        No live tournament matches assigned to grounds.
                    </div>
                </div>
            </div>

            {/* 6. UPCOMING TOURNAMENTS TABLE */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-[18px] border border-slate-200/70 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                            <HiTrophy className="text-indigo-600" /> All Managed Tournaments
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Overview of active, pending review & draft tournaments</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to={`${basePath}/all`}>
                            <button className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                                View Full List →
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                    <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-100/80 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="p-3.5">Tournament Name</th>
                                <th className="p-3.5">Category & Format</th>
                                <th className="p-3.5">Dates</th>
                                <th className="p-3.5">Teams</th>
                                <th className="p-3.5">Entry Fee</th>
                                <th className="p-3.5">Prize Pool</th>
                                <th className="p-3.5">Status</th>
                                <th className="p-3.5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/70 font-medium">
                            {liveTournamentsList.length > 0 ? (
                                liveTournamentsList.map((trn) => (
                                    <tr key={trn.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-3.5 font-extrabold text-slate-900">{trn.title || trn.name}</td>
                                        <td className="p-3.5 text-slate-600">{trn.sport_name || trn.category || 'Cricket • T20'}</td>
                                        <td className="p-3.5 text-slate-600">{trn.start_date ? `${trn.start_date} - ${trn.end_date}` : 'Upcoming'}</td>
                                        <td className="p-3.5 font-bold text-slate-800">{trn.maximum_teams ? `${trn.maximum_teams} Teams` : '16 Teams'}</td>
                                        <td className="p-3.5 font-bold text-slate-900">₹{(trn.entry_fee_per_team || trn.entryFee || 1000).toLocaleString('en-IN')}</td>
                                        <td className="p-3.5 font-extrabold text-emerald-600">{trn.prize_pool_total || trn.prizePool || '₹50,000'}</td>
                                        <td className="p-3.5">
                                            <Badge variant={trn.status === 'APPROVED' ? 'success' : 'warning'}>{trn.status || 'Active'}</Badge>
                                        </td>
                                        <td className="p-3.5 text-right">
                                            <Link to={`${basePath}/all`} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                                                Manage
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-6 text-center text-slate-400 font-bold">
                                        No managed tournaments currently in database.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 7. RECENT ACTIVITY, NOTIFICATIONS & LEADERBOARD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Recent Registration Activity */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[18px] border border-slate-200/70 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                            <HiUserGroup className="text-emerald-600" /> Recent Registrations
                        </h3>
                        <Link to={`${basePath}/registrations`} className="text-xs font-bold text-indigo-600 hover:underline">
                            View All →
                        </Link>
                    </div>
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-slate-50/50 rounded-xl border border-slate-200/60">
                        No recent team registrations.
                    </div>
                </div>

                {/* Notifications & Approvals Center */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[18px] border border-slate-200/70 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                            <HiExclamationCircle className="text-amber-500" /> Notification Center
                        </h3>
                    </div>
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-slate-50/50 rounded-xl border border-slate-200/60">
                        No pending notifications or alerts.
                    </div>
                </div>

                {/* Top Tournament Leaderboard */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[18px] border border-slate-200/70 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                            <HiFire className="text-rose-500" /> Top Leagues
                        </h3>
                        <span className="text-xs font-bold text-slate-500">Ranked by Revenue</span>
                    </div>
                    {leaderboardList.length > 0 ? (
                        <div className="space-y-3">
                            {leaderboardList.map((item) => (
                                <div key={item.rank} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-slate-900">{item.name}</span>
                                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{item.badge}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                                        <span>{item.teams}</span>
                                        <span className="font-bold text-emerald-600">{item.revenue}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-slate-50/50 rounded-xl border border-slate-200/60">
                            No active leagues recorded.
                        </div>
                    )}
                </div>

            </div>

        </div>
    )
}
