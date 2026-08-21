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

const REVENUE_TREND_DATA = [
    { month: 'Jan', revenue: 18000, registrations: 12 },
    { month: 'Feb', revenue: 24000, registrations: 18 },
    { month: 'Mar', revenue: 32000, registrations: 22 },
    { month: 'Apr', revenue: 28000, registrations: 20 },
    { month: 'May', revenue: 45000, registrations: 29 },
    { month: 'Jun', revenue: 52000, registrations: 31 },
    { month: 'Jul', revenue: 64500, registrations: 36 },
]

const STATUS_PIE_DATA = [
    { name: 'Active', value: 4, color: '#10B981' },
    { name: 'Pending Review', value: 2, color: '#F59E0B' },
    { name: 'Upcoming', value: 3, color: '#3B82F6' },
    { name: 'Completed', value: 5, color: '#6366F1' },
]

const CATEGORY_BAR_DATA = [
    { category: 'Cricket', count: 16, revenue: 32000 },
    { category: 'Football', count: 12, revenue: 24000 },
    { category: 'Badminton', count: 6, revenue: 6000 },
    { category: 'Tennis', count: 2, revenue: 2500 },
]

const SPARKLINE_DATA_1 = [{ v: 4 }, { v: 5 }, { v: 4 }, { v: 6 }, { v: 7 }, { v: 6 }, { v: 8 }]
const SPARKLINE_DATA_2 = [{ v: 1 }, { v: 3 }, { v: 2 }, { v: 4 }, { v: 3 }, { v: 2 }, { v: 2 }]
const SPARKLINE_DATA_3 = [{ v: 15 }, { v: 18 }, { v: 22 }, { v: 25 }, { v: 29 }, { v: 31 }, { v: 36 }]
const SPARKLINE_DATA_4 = [{ v: 20 }, { v: 28 }, { v: 35 }, { v: 42 }, { v: 48 }, { v: 55 }, { v: 64.5 }]

const LIVE_MATCHES = [
    {
        id: 'LM-101',
        tournament: 'Monsoon Cricket Super Cup 2026',
        teamA: 'Thunder Strikers',
        scoreA: '142/4 (16.2 ov)',
        teamB: 'Royal Challengers',
        scoreB: '138/8 (20 ov)',
        status: 'In Progress (2nd Innings)',
        ground: 'Ground 1 - Main Turf',
        category: 'Cricket T20',
        liveBadge: 'LIVE'
    },
    {
        id: 'LM-102',
        tournament: 'City Champions Trophy 2026',
        teamA: 'Apex FC',
        scoreA: '2',
        teamB: 'Velocity Stars',
        scoreB: '1',
        status: 'Second Half (68\')',
        ground: 'Ground 2 - Football Arena',
        category: 'Football 7v7',
        liveBadge: 'LIVE'
    }
]

const UPCOMING_TOURNAMENTS = [
    {
        id: 'TRN-201',
        name: 'Monsoon Cricket Super Cup 2026',
        category: 'Cricket • T20 Format',
        dates: '12 Aug - 20 Aug 2026',
        teams: '16 / 16 Teams',
        entryFee: '₹4,000',
        prizePool: '₹50,000',
        status: 'Active',
        statusVariant: 'success'
    },
    {
        id: 'TRN-202',
        name: 'City Champions League 7v7',
        category: 'Football • Knockout',
        dates: '18 Aug - 25 Aug 2026',
        teams: '12 / 16 Teams',
        entryFee: '₹3,500',
        prizePool: '₹35,000',
        status: 'Registration Open',
        statusVariant: 'info'
    },
    {
        id: 'TRN-203',
        name: 'Corporate Badminton Smash',
        category: 'Badminton • Doubles',
        dates: '01 Sep - 03 Sep 2026',
        teams: '8 / 12 Teams',
        entryFee: '₹1,500',
        prizePool: '₹15,000',
        status: 'Pending Review',
        statusVariant: 'warning'
    },
    {
        id: 'TRN-204',
        name: 'Box Cricket Night Championship',
        category: 'Cricket • Box Format',
        dates: '10 Sep - 15 Sep 2026',
        teams: '4 / 16 Teams',
        entryFee: '₹2,500',
        prizePool: '₹25,000',
        status: 'Draft',
        statusVariant: 'default'
    }
]

const RECENT_ACTIVITIES = [
    { id: 1, team: 'Phoenix XI', tournament: 'Monsoon Cricket Cup', time: '10 mins ago', amount: '₹4,000', status: 'Paid' },
    { id: 2, team: 'United Warriors', tournament: 'City Champions League', time: '45 mins ago', amount: '₹3,500', status: 'Paid' },
    { id: 3, team: 'Strikers Club', tournament: 'Corporate Badminton Smash', time: '2 hours ago', amount: '₹1,500', status: 'Pending Verification' },
    { id: 4, team: 'Spartans FC', tournament: 'City Champions League', time: '5 hours ago', amount: '₹3,500', status: 'Paid' }
]

const NOTIFICATIONS = [
    { id: 1, type: 'warning', title: 'Approval Needed', message: 'Staff submitted "Corporate Badminton Smash" for review.', time: '1h ago', path: '/pending' },
    { id: 2, type: 'info', title: 'Roster Submitted', message: 'Team Phoenix XI uploaded updated player IDs.', time: '3h ago', path: '/registrations' },
    { id: 3, type: 'success', title: 'Payout Released', message: 'Tournament prize payout of ₹50,000 cleared.', time: '1d ago', path: '/payments' }
]

const GROUND_STATUS = [
    { name: 'Ground 1 (Main Pitch)', status: 'Live Match in Progress', occupiedBy: 'Monsoon Cricket Cup', type: 'Occupied', color: 'emerald' },
    { name: 'Ground 2 (Football Turf)', status: 'Live Match 2nd Half', occupiedBy: 'City Champions 7v7', type: 'Occupied', color: 'emerald' },
    { name: 'Ground 3 (Box Arena)', status: 'Free for Warmup', occupiedBy: 'Available', type: 'Available', color: 'blue' },
    { name: 'Ground 4 (Indoor Court)', status: 'Maintenance Window', occupiedBy: 'Scheduled Inspection', type: 'Maintenance', color: 'amber' }
]

const TIMELINE_STEPS = [
    { step: 'Phase 1', title: 'Team Registrations', desc: 'Active signups open', date: 'Aug 1 - Aug 10', completed: true },
    { step: 'Phase 2', title: 'Fixture Draw', desc: 'Auto Bracket Gen', date: 'Aug 11', current: true },
    { step: 'Phase 3', title: 'Group Stage', desc: '16 Matches Scheduled', date: 'Aug 12 - Aug 16', upcoming: true },
    { step: 'Phase 4', title: 'Grand Finals', desc: 'Championship Match', date: 'Aug 20', upcoming: true }
]

const LEADERBOARD = [
    { rank: 1, name: 'Monsoon Cricket Super Cup', teams: 16, revenue: '₹64,000', rating: '4.9 ★', badge: '🥇 Top Grossing' },
    { rank: 2, name: 'City Champions League 7v7', teams: 12, revenue: '₹42,000', rating: '4.8 ★', badge: '🥈 High Engagement' },
    { rank: 3, name: 'Box Cricket Night League', teams: 16, revenue: '₹40,000', rating: '4.7 ★', badge: '🥉 Houseful' }
]

import { getMasterTournamentMetrics } from '../../services/tournamentStore'

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

    const fetchLiveStats = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
            const res = await fetch(`${API_URL}/tournaments`)
            const data = await res.json()
            if (data.success && Array.isArray(data.data)) {
                const list = data.data
                setLiveTournamentsList(list)

                const totalT = list.length
                const pendingA = list.filter(t => (t.status || '').toLowerCase().includes('pending')).length
                const activeA = list.filter(t => (t.status || '').toLowerCase().includes('approved') || (t.status || '').toLowerCase().includes('active')).length
                const teamsCount = list.reduce((sum, t) => sum + (Number(t.maximum_teams || t.registrations) || 0), 0)
                const revenueSum = list.reduce((sum, t) => sum + (Number(t.entry_fee_per_team || t.entryFee) * (Number(t.maximum_teams || t.registrations) || 0)), 0)

                setStats({
                    totalTournaments: totalT,
                    pendingApprovals: pendingA,
                    approvedActive: activeA,
                    totalTeams: teamsCount,
                    totalRevenue: revenueSum
                })
            } else {
                setLiveTournamentsList([])
            }
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">

            {/* 1. HERO SECTION */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-[22px] p-6 sm:p-8 shadow-xl border border-indigo-900/40">
                {/* Decorative Background Micro Graphics */}
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

                    {/* Hero Action Right Side */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold backdrop-blur-md border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <HiRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            <span>Sync Data</span>
                        </button>
                        <Link to={`${basePath}/reports`}>
                            <button className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white text-xs font-bold border border-slate-700/80 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-soft">
                                <HiDownload className="w-4 h-4 text-slate-300" />
                                <span>Export Report</span>
                            </button>
                        </Link>
                        {role !== 'staff' && (
                            <Link to={`${basePath}/create`}>
                                <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer">
                                    <HiPlus className="w-4 h-4 stroke-[3]" />
                                    <span>CREATE TOURNAMENT</span>
                                </button>
                            </Link>
                        )}
                    </div>
                </div>

            </div>

            {/* 2. QUICK ACTION TILES BAR */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-[18px] border border-slate-200/70 shadow-sm">
                <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
                        <HiBolt className="w-4 h-4 text-amber-500" /> QUICK ACTION HUB
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                        {role !== 'staff' ? '7 Module Controls' : '6 Management Controls'}
                    </span>
                </div>
                <div className={`grid grid-cols-2 sm:grid-cols-3 ${role !== 'staff' ? 'lg:grid-cols-7' : 'lg:grid-cols-6'} gap-3`}>
                    {[
                        ...(role !== 'staff' ? [{ title: 'New Tournament', icon: <HiPlus />, path: '/create', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/80' }] : []),
                        { title: 'Team Roster', icon: <HiUserGroup />, path: '/registrations', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/80' },
                        { title: 'Auto Fixtures', icon: <HiChartBar />, path: '/fixtures', color: 'bg-blue-500/10 text-blue-600 border-blue-200/80' },
                        { title: 'Live Matches', icon: <HiPlay />, path: '/matches', color: 'bg-purple-500/10 text-purple-600 border-purple-200/80' },
                        { title: 'Entry Payments', icon: <HiCreditCard />, path: '/payments', color: 'bg-amber-500/10 text-amber-600 border-amber-200/80' },
                        { title: 'Reports & Audit', icon: <HiDocumentReport />, path: '/reports', color: 'bg-teal-500/10 text-teal-600 border-teal-200/80' },
                        { title: 'Sponsorships', icon: <HiTrophy />, path: '/sponsors', color: 'bg-rose-500/10 text-rose-600 border-rose-200/80' },
                    ].map((act, idx) => (
                        <Link key={idx} to={`${basePath}${act.path}`}>
                            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all duration-200 group text-center cursor-pointer">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-2 border ${act.color} group-hover:scale-110 transition-transform`}>
                                    {act.icon}
                                </div>
                                <span className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                    {act.title}
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
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            <HiTrendingUp /> +2 this month
                        </span>
                    </div>
                    <div className="h-9">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={SPARKLINE_DATA_1}>
                                <Area type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} fill="#3B82F6" fillOpacity={0.15} />
                            </AreaChart>
                        </ResponsiveContainer>
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
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                            Requires Owner Review
                        </span>
                    </div>
                    <div className="h-9">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={SPARKLINE_DATA_2}>
                                <Area type="monotone" dataKey="v" stroke="#F59E0B" strokeWidth={2} fill="#F59E0B" fillOpacity={0.15} />
                            </AreaChart>
                        </ResponsiveContainer>
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
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            <HiTrendingUp /> +12 this week
                        </span>
                    </div>
                    <div className="h-9">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={SPARKLINE_DATA_3}>
                                <Area type="monotone" dataKey="v" stroke="#10B981" strokeWidth={2} fill="#10B981" fillOpacity={0.15} />
                            </AreaChart>
                        </ResponsiveContainer>
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
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            Comm: ₹{(stats.platformCommission || Math.round((stats.totalRevenue || 0) * 0.1)).toLocaleString()}
                        </span>
                    </div>
                    <div className="h-9">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={SPARKLINE_DATA_4}>
                                <Area type="monotone" dataKey="v" stroke="#6366F1" strokeWidth={2} fill="#6366F1" fillOpacity={0.15} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100 flex justify-between">
                        <span>Entry fee earnings</span>
                        <Link to={`${basePath}/payments`} className="text-indigo-600 hover:underline font-bold">Payouts →</Link>
                    </div>
                </div>
            </div>

            {/* 4. ANALYTICS CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Revenue & Registrations Area Chart */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-[18px] border border-slate-200/70 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                                <HiChartBar className="text-indigo-600" /> Revenue & Team Signups Trend
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Monthly progression of entry fee earnings & team registrations</p>
                        </div>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            2026 YTD
                        </span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={REVENUE_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF', fontSize: '12px' }}
                                    formatter={(value, name) => [name === 'revenue' ? `₹${value}` : `${value} Teams`, name === 'revenue' ? 'Revenue' : 'Signups']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Doughnut Chart */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[18px] border border-slate-200/70 shadow-sm flex flex-col justify-between">
                    <div className="mb-2">
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                            <HiTrophy className="text-amber-500" /> Tournament Status Breakdown
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Distribution across active, upcoming & completed</p>
                    </div>
                    <div className="h-52 w-full relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={STATUS_PIE_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {STATUS_PIE_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '10px', color: '#FFF', fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black text-slate-900">8</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                        {STATUS_PIE_DATA.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                <span className="text-slate-600 font-medium truncate">{item.name}:</span>
                                <span className="font-bold text-slate-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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

                    <div className="grid sm:grid-cols-2 gap-4">
                        {LIVE_MATCHES.map((match) => (
                            <div key={match.id} className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-soft relative overflow-hidden space-y-3">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-indigo-400 font-extrabold tracking-wide uppercase">{match.category}</span>
                                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-black tracking-wider flex items-center gap-1 border border-rose-500/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" /> {match.liveBadge}
                                    </span>
                                </div>
                                <div className="font-bold text-xs text-slate-300 truncate">{match.tournament}</div>

                                {/* Score Row */}
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

                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1">
                                    <span className="flex items-center gap-1 text-slate-300">
                                        <HiLocationMarker className="text-emerald-400" /> {match.ground}
                                    </span>
                                    <span className="text-slate-400">{match.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ground Availability Widget */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[18px] border border-slate-200/70 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                            <HiLocationMarker className="text-emerald-600" /> Turf Ground Status
                        </h3>
                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            4 Grounds Active
                        </span>
                    </div>

                    <div className="space-y-2.5">
                        {GROUND_STATUS.map((grd, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-between text-xs">
                                <div>
                                    <div className="font-bold text-slate-900">{grd.name}</div>
                                    <div className="text-[11px] text-slate-500 font-medium">{grd.occupiedBy}</div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${grd.type === 'Occupied' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    grd.type === 'Available' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                    {grd.type}
                                </span>
                            </div>
                        ))}
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
                    <div className="space-y-3">
                        {RECENT_ACTIVITIES.map((act) => (
                            <div key={act.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-between text-xs">
                                <div>
                                    <div className="font-bold text-slate-900">{act.team}</div>
                                    <div className="text-[11px] text-slate-500 font-medium">{act.tournament} • {act.time}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-slate-900">{act.amount}</div>
                                    <span className={`text-[10px] font-bold ${act.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {act.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notifications & Approvals Center */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[18px] border border-slate-200/70 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                            <HiExclamationCircle className="text-amber-500" /> Notification Center
                        </h3>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {NOTIFICATIONS.length} Alerts
                        </span>
                    </div>
                    <div className="space-y-3">
                        {NOTIFICATIONS.map((note) => (
                            <div key={note.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-slate-900">{note.title}</span>
                                    <span className="text-[10px] text-slate-400 font-semibold">{note.time}</span>
                                </div>
                                <p className="text-xs text-slate-600">{note.message}</p>
                                <div className="pt-1 text-right">
                                    <Link to={`${basePath}${note.path}`} className="text-[11px] font-bold text-indigo-600 hover:underline">
                                        Take Action →
                                    </Link>
                                </div>
                            </div>
                        ))}
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
                    <div className="space-y-3">
                        {LEADERBOARD.map((item) => (
                            <div key={item.rank} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-900">{item.name}</span>
                                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{item.badge}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                                    <span>{item.teams} Teams</span>
                                    <span className="font-bold text-emerald-600">{item.revenue}</span>
                                    <span>{item.rating}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* 8. SEASON TIMELINE & WEATHER SUMMARY WIDGET */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Season Timeline */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-[18px] border border-slate-200/70 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        <HiCalendar className="text-blue-600" /> Active Season Phase Timeline
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                        {TIMELINE_STEPS.map((step, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border text-xs space-y-1 relative ${step.completed ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' :
                                step.current ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-soft ring-2 ring-indigo-500/20' :
                                    'bg-slate-50/70 border-slate-200 text-slate-600'
                                }`}>
                                <div className="font-black text-[10px] uppercase tracking-wider text-slate-500">{step.step}</div>
                                <div className="font-bold text-sm text-slate-900">{step.title}</div>
                                <div className="text-[11px] text-slate-500">{step.desc}</div>
                                <div className="text-[10px] font-bold text-indigo-600 pt-1">{step.date}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weather & Outdoor Conditions */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[18px] border border-slate-200/70 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                            <HiSun className="text-amber-500" /> Venue Weather Check
                        </h3>
                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            98% Playable
                        </span>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-black">27°C</div>
                                <div className="text-xs text-slate-300 font-medium">Clear Sky • Mild Wind</div>
                            </div>
                            <HiSun className="w-10 h-10 text-amber-400 animate-spin-slow" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-white/10 text-slate-300">
                            <div>Humidity: <strong className="text-white">45%</strong></div>
                            <div>Wind: <strong className="text-white">12 km/h</strong></div>
                            <div>Dew Factor: <strong className="text-white">Low</strong></div>
                            <div>Lighting: <strong className="text-emerald-400">Optimal</strong></div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    )
}
