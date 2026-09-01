import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { 
    HiLightningBolt, 
    HiUsers, 
    HiCurrencyRupee, 
    HiCalendar, 
    HiClock, 
    HiDotsVertical,
    HiEye,
    HiPencil,
    HiXCircle,
    HiCreditCard,
    HiArrowSmUp
} from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { getOverview, getDashboardHistory } from '../../services/dashboardService'
import useRealtime from '../../utils/useRealtime'

const DEFAULT_PEAK_DATA_TODAY = [
    { h: '6 AM', v: 0, count: 0 },
    { h: '8 AM', v: 0, count: 0 },
    { h: '10 AM', v: 0, count: 0 },
    { h: '12 PM', v: 0, count: 0 },
    { h: '2 PM', v: 0, count: 0 },
    { h: '4 PM', v: 0, count: 0 },
    { h: '6 PM', v: 0, count: 0 },
    { h: '8 PM', v: 0, count: 0 },
    { h: '10 PM', v: 0, count: 0 }
]

const DEFAULT_PEAK_DATA_7DAYS = [
    { h: 'Mon', v: 0, count: 0 },
    { h: 'Tue', v: 0, count: 0 },
    { h: 'Wed', v: 0, count: 0 },
    { h: 'Thu', v: 0, count: 0 },
    { h: 'Fri', v: 0, count: 0 },
    { h: 'Sat', v: 0, count: 0 },
    { h: 'Sun', v: 0, count: 0 }
]

const DEFAULT_PEAK_DATA_30DAYS = [
    { h: 'Week 1', v: 0, count: 0 },
    { h: 'Week 2', v: 0, count: 0 },
    { h: 'Week 3', v: 0, count: 0 },
    { h: 'Week 4', v: 0, count: 0 }
]

const DEFAULT_BOOKINGS = []

export default function OwnerDashboard() {
    const { user } = useAuth()
    const { addToast } = useToast()
    const navigate = useNavigate()

    const [chartRange, setChartRange] = useState('TODAY') // 'TODAY' | '7DAYS' | '30DAYS'
    const [activeRowAction, setActiveRowAction] = useState(null)
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
    const [historyTab, setHistoryTab] = useState('DAY_BY_DAY') // 'DAY_BY_DAY' | 'WEEKLY' | 'ALL_LOGS'
    const [historySearchQuery, setHistorySearchQuery] = useState('')

    // 100% Database-Authoritative History State
    const [historyAnalytics, setHistoryAnalytics] = useState({
        dailyHistory: [],
        weeklyBreakdown: [],
        allLogs: []
    })
    const [loadingHistory, setLoadingHistory] = useState(false)

    const fetchHistory = useCallback(async () => {
        setLoadingHistory(true)
        try {
            const ownerId = user?.id || user?._id || user?.email;
            const res = await getDashboardHistory({ ownerId, email: user?.email });
            if (res && res.success && res.data) {
                setHistoryAnalytics({
                    dailyHistory: Array.isArray(res.data.dailyHistory) ? res.data.dailyHistory : [],
                    weeklyBreakdown: Array.isArray(res.data.weeklyBreakdown) ? res.data.weeklyBreakdown : [],
                    allLogs: Array.isArray(res.data.allLogs) ? res.data.allLogs : []
                });
            }
        } catch (err) {
            console.error('Error fetching database history analytics:', err);
        } finally {
            setLoadingHistory(false)
        }
    }, [user])

    useEffect(() => {
        if (isHistoryModalOpen) {
            fetchHistory()
        }
    }, [isHistoryModalOpen, fetchHistory])

    const [stats, setStats] = useState({
        todaysRevenue: 0,
        todaysBookings: 0,
        activeMatches: 0,
        upcomingEvents: 0,
        totalRevenue: 0,
        availableSlots: 0,
        sportsCount: 0,
        peakData: DEFAULT_PEAK_DATA_TODAY,
        recentBookings: []
    })

    const fetchSummary = useCallback(async () => {
        try {
            const ownerId = user?.id || user?._id || user?.email;
            const data = await getOverview({ ownerId, email: user?.email });
            if (data && data.success && data.data) {
                setStats(prev => ({
                    ...prev,
                    todaysRevenue: Number(data.data.todaysRevenue) || 0,
                    todaysBookings: Number(data.data.todaysBookings) || 0,
                    activeMatches: Number(data.data.activeMatches) || 0,
                    upcomingEvents: Number(data.data.upcomingEvents) || 0,
                    totalRevenue: Number(data.data.totalRevenue) || 0,
                    availableSlots: Number(data.data.availableSlots) || 0,
                    sportsCount: Number(data.data.sportsCount) || 0,
                    peakData: Array.isArray(data.data.peakData) && data.data.peakData.length > 0 ? data.data.peakData : DEFAULT_PEAK_DATA_TODAY,
                    recentBookings: Array.isArray(data.data.recentBookings) ? data.data.recentBookings : []
                }));
            }
        } catch (err) {
            console.error('Error fetching Owner Dashboard summary:', err);
        }
    }, [user]);

    useEffect(() => { fetchSummary() }, [fetchSummary]);
    useRealtime(['booking:new', 'booking:cancelled', 'payment:pending', 'payment:settled', 'wallet:updated'], () => fetchSummary());

    // Close row action dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.row-action-container')) {
                setActiveRowAction(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Dynamic Chart Data based on Tab
    const activeChartData = chartRange === 'TODAY' 
        ? stats.peakData 
        : chartRange === '7DAYS' 
            ? DEFAULT_PEAK_DATA_7DAYS 
            : DEFAULT_PEAK_DATA_30DAYS

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* ── 1. Compact Dashboard Header ── */}
            <div className="bg-white rounded-[20px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-[#10B981] flex items-center justify-center text-xl shadow-2xs">
                        <HiLightningBolt className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-2">
                            Turf Controller
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Real-time operational overview of your sports facility</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsHistoryModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 border border-emerald-500"
                    >
                        <span>📜</span>
                        <span>View History Log</span>
                    </button>

                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-[#10B981] border border-emerald-200/70 text-xs font-extrabold shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                        <span>Active • 30 Days Left</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold px-2 py-1">
                        <HiClock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Last updated just now</span>
                    </div>
                </div>
            </div>

            {/* ── 2. Premium 4 KPI Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    label="Today's Revenue"
                    value={`₹${stats.todaysRevenue.toLocaleString()}`}
                    change="Live MySQL Data"
                    trend="up"
                    icon={<HiCurrencyRupee />}
                    colorTheme="emerald"
                />

                <StatCard
                    label="Today's Bookings"
                    value={stats.todaysBookings}
                    change="Real-time DB"
                    trend="up"
                    icon={<HiCalendar />}
                    colorTheme="blue"
                />

                <StatCard
                    label="Active Matches"
                    value={stats.activeMatches}
                    change="Active matches live"
                    trend="up"
                    icon={<HiUsers />}
                    colorTheme="purple"
                />

                <StatCard
                    label="Upcoming Events"
                    value={stats.upcomingEvents}
                    change="Next cup in 3 days"
                    trend="up"
                    icon={<HiClock />}
                    colorTheme="amber"
                />
            </div>

            {/* ── 3. Peak Occupancy Analysis Section ── */}
            <div className="bg-white rounded-[20px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Peak Occupancy Analysis</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Hourly court utilization tracking</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Interactive Range Selector Tabs */}
                        <div className="inline-flex p-1 rounded-xl bg-slate-100/90 border border-slate-200/70 gap-1 text-xs font-bold">
                            <button
                                onClick={() => setChartRange('TODAY')}
                                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                    chartRange === 'TODAY'
                                        ? 'bg-white text-[#10B981] shadow-2xs font-extrabold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setChartRange('7DAYS')}
                                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                    chartRange === '7DAYS'
                                        ? 'bg-white text-[#10B981] shadow-2xs font-extrabold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                7 Days
                            </button>
                            <button
                                onClick={() => setChartRange('30DAYS')}
                                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                    chartRange === '30DAYS'
                                        ? 'bg-white text-[#10B981] shadow-2xs font-extrabold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                30 Days
                            </button>
                        </div>

                        <Badge variant="primary">Live Status</Badge>
                    </div>
                </div>

                <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis 
                                dataKey="h" 
                                tick={{ fontSize: 11, fill: '#64748b', fontWeight: '600' }} 
                                axisLine={false} 
                                tickLine={false} 
                            />
                            <YAxis 
                                tick={{ fontSize: 11, fill: '#64748b', fontWeight: '600' }} 
                                tickFormatter={v => `${v}%`} 
                                axisLine={false} 
                                tickLine={false} 
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload
                                        return (
                                            <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs font-semibold space-y-1 backdrop-blur-md border border-slate-700/60">
                                                <p className="font-extrabold text-slate-300">{data.h}</p>
                                                <p className="text-emerald-400 font-black">Occupancy: {data.v}%</p>
                                                {data.count !== undefined && <p className="text-slate-300 text-[11px]">Bookings: {data.count}</p>}
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="v" fill="#10B981" radius={[6, 6, 0, 0]} barSize={36} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── 4. Today's Bookings Data Section ── */}
            <div className="bg-white rounded-[20px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Today&apos;s Bookings</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Scheduled slots for match days</p>
                    </div>

                    <button
                        onClick={() => navigate('/admin/bookings')}
                        className="text-xs font-extrabold text-[#10B981] hover:text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                    >
                        <span>View All</span>
                        <span>→</span>
                    </button>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white pb-2">
                    <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-black uppercase tracking-wider h-11">
                                <th className="px-4.5 py-3">TIME</th>
                                <th className="px-4.5 py-3">CUSTOMER</th>
                                <th className="px-4.5 py-3">SPORT</th>
                                <th className="px-4.5 py-3">COURT</th>
                                <th className="px-4.5 py-3">AMOUNT</th>
                                <th className="px-4.5 py-3">STATUS</th>
                                <th className="px-4.5 py-3 text-right">ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {(stats.recentBookings || DEFAULT_BOOKINGS).map((b, i) => {
                                const list = stats.recentBookings || DEFAULT_BOOKINGS;
                                const initials = (b.customer || '').split(' ').map(n => n[0]).join('').toUpperCase() || 'CU';
                                const isNearBottom = i >= Math.max(0, list.length - 2);
                                
                                return (
                                    <tr
                                        key={b.id || i}
                                        className="h-14 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                    >
                                        {/* Time */}
                                        <td className="px-4.5 py-3 whitespace-nowrap font-bold text-slate-800">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/60">
                                                <HiClock className="w-3.5 h-3.5 text-slate-400" />
                                                {b.time}
                                            </span>
                                        </td>

                                        {/* Customer */}
                                        <td className="px-4.5 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-black shadow-2xs shrink-0">
                                                    {initials}
                                                </div>
                                                <span className="font-extrabold text-slate-900 text-xs">{b.customer}</span>
                                            </div>
                                        </td>

                                        {/* Sport Badge */}
                                        <td className="px-4.5 py-3 whitespace-nowrap">
                                            {b.sport === 'Cricket' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/70 text-[11px] font-extrabold">
                                                    🏏 Cricket
                                                </span>
                                            ) : b.sport === 'Football' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-extrabold">
                                                    ⚽ Football
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200/70 text-[11px] font-extrabold">
                                                    🎾 {b.sport}
                                                </span>
                                            )}
                                        </td>

                                        {/* Court */}
                                        <td className="px-4.5 py-3 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100/90 text-slate-700 font-extrabold text-[11px] border border-slate-200/60">
                                                {b.court}
                                            </span>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-4.5 py-3 whitespace-nowrap font-black text-emerald-600 text-xs sm:text-sm">
                                            {b.amount}
                                        </td>

                                        {/* Status Badge */}
                                        <td className="px-4.5 py-3 whitespace-nowrap">
                                            {b.status === 'Confirmed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[#10B981] border border-emerald-200/80 text-[11px] font-extrabold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                                                    Confirmed
                                                </span>
                                            ) : b.status === 'Pending' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-[11px] font-extrabold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                    Pending
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-[11px] font-extrabold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                    {b.status}
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions Dropdown */}
                                        <td className="px-4.5 py-3 whitespace-nowrap text-right relative row-action-container">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate('/admin/bookings')
                                                    }}
                                                    className="px-2.5 py-1 text-[11px] font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveRowAction(activeRowAction === (b.id || i) ? null : (b.id || i))
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                                    aria-label="Actions"
                                                >
                                                    <HiDotsVertical className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {activeRowAction === (b.id || i) && (
                                                <div className={`absolute right-4 ${isNearBottom ? 'bottom-full mb-1.5' : 'top-10'} z-50 w-36 bg-white border border-slate-200/90 rounded-xl shadow-xl p-1 space-y-0.5 text-left text-xs font-bold animate-in fade-in duration-150`}>
                                                    <button
                                                        onClick={() => {
                                                            setActiveRowAction(null)
                                                            navigate('/admin/bookings')
                                                        }}
                                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                                    >
                                                        <HiEye className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>Details</span>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setActiveRowAction(null)
                                                            navigate('/admin/bookings')
                                                        }}
                                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                                    >
                                                        <HiPencil className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setActiveRowAction(null)
                                                            addToast({ title: 'Booking Action', message: `Booking ${b.id} cancellation requested`, type: 'info' })
                                                        }}
                                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                    >
                                                        <HiXCircle className="w-3.5 h-3.5" />
                                                        <span>Cancel</span>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                📜 DETAILED HISTORY & ANALYTICS LOG MODAL
            ═══════════════════════════════════════════════════ */}
            {isHistoryModalOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 space-y-5 my-auto max-h-[92vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center text-xl font-black border border-emerald-200/60 shadow-2xs">
                                    📜
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[#111827]">
                                        Operational Booking & Revenue History Log
                                    </h3>
                                    <p className="text-xs text-slate-500 font-semibold">
                                        Complete historical record with day-by-day and weekly performance breakdown.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsHistoryModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer transition-all"
                            >
                                <HiXCircle className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Filter Tabs & Summary Row */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200 text-xs font-bold shadow-2xs">
                                <button
                                    type="button"
                                    onClick={() => setHistoryTab('DAY_BY_DAY')}
                                    className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                                        historyTab === 'DAY_BY_DAY' ? 'bg-[#10B981] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    📆 Day-by-Day History
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setHistoryTab('WEEKLY')}
                                    className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                                        historyTab === 'WEEKLY' ? 'bg-[#10B981] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    🗓️ Weekly Breakdown
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setHistoryTab('ALL_LOGS')}
                                    className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                                        historyTab === 'ALL_LOGS' ? 'bg-[#10B981] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    📋 All Match Logs
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const exportDataset = historyAnalytics.allLogs.length > 0 ? historyAnalytics.allLogs : (stats.recentBookings || DEFAULT_BOOKINGS);
                                        const csvContent = "data:text/csv;charset=utf-8,Date,Time,Customer,Sport,Court,Net Amount,Gross Amount,Status\n" +
                                            exportDataset.map(b => `"${b.date || 'Today'}","${b.time || ''}","${b.customer || ''}","${b.sport || ''}","${b.court || ''}","${b.amount || ''}","${b.grossAmount || b.amount || ''}","${b.status || ''}"`).join("\n");
                                        const encodedUri = encodeURI(csvContent);
                                        const link = document.createElement("a");
                                        link.setAttribute("href", encodedUri);
                                        link.setAttribute("download", `turf_history_log_${Date.now()}.csv`);
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        if (addToast) addToast({ title: 'Export Complete', message: `Exported ${exportDataset.length} DB records to CSV!`, type: 'success' });
                                    }}
                                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs"
                                >
                                    <span>📥</span>
                                    <span>Export CSV Log</span>
                                </button>
                            </div>
                        </div>

                        {/* Loading Spinner */}
                        {loadingHistory && (
                            <div className="py-12 flex flex-col items-center justify-center space-y-3">
                                <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                                <span className="text-xs font-bold text-slate-500">Querying MySQL Database Analytics...</span>
                            </div>
                        )}

                        {/* TAB 1: DAY-BY-DAY HISTORY (100% Real DB Data) */}
                        {!loadingHistory && historyTab === 'DAY_BY_DAY' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs font-black uppercase text-slate-500 tracking-wider">
                                    <span>Past 7 Days Daily Operational Performance:</span>
                                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        ✓ 100% MySQL Database Authoritative
                                    </span>
                                </div>
                                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                                    {historyAnalytics.dailyHistory.length === 0 ? (
                                        <div className="p-8 text-center text-xs font-bold text-slate-400">
                                            No daily history records found in MySQL database.
                                        </div>
                                    ) : (
                                        historyAnalytics.dailyHistory.map((row, idx) => (
                                            <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                                                <div>
                                                    <span className="font-extrabold text-slate-900 text-xs block">{row.date}</span>
                                                    <span className="text-[11px] text-slate-500 font-medium">Top Sport: <strong className="text-slate-700">{row.topSport}</strong> · Occupancy: {row.occupancy}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs">
                                                    <div className="text-right">
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Day Revenue</span>
                                                        <span className="font-black text-emerald-600 font-mono">₹{(row.revenue || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Slots Booked</span>
                                                        <span className="font-extrabold text-slate-800">{row.bookings} Matches</span>
                                                    </div>
                                                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-full border border-emerald-200">
                                                        {row.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 2: WEEKLY BREAKDOWN (100% Real DB Data) */}
                        {!loadingHistory && historyTab === 'WEEKLY' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs font-black uppercase text-slate-500 tracking-wider">
                                    <span>Past 4 Weeks Performance Breakdown:</span>
                                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        ✓ 100% MySQL Database Authoritative
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {historyAnalytics.weeklyBreakdown.length === 0 ? (
                                        <div className="col-span-2 p-8 text-center text-xs font-bold text-slate-400 bg-white rounded-2xl border border-slate-200">
                                            No weekly breakdown records found in MySQL database.
                                        </div>
                                    ) : (
                                        historyAnalytics.weeklyBreakdown.map((w, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-emerald-300 transition-all">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-slate-900">{w.title}</span>
                                                    <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                                                        {w.badge}
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline justify-between pt-1">
                                                    <div className="text-2xl font-black text-slate-900 font-mono">₹{(w.revenue || 0).toLocaleString()}</div>
                                                    <span className="text-xs font-extrabold text-emerald-600">{w.trend}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 font-medium pt-1 border-t border-slate-100 flex items-center justify-between">
                                                    <span>Bookings: <strong className="text-slate-800 font-bold">{w.bookings} Slots</strong></span>
                                                    <span>Occupancy Rate: <strong className="text-slate-800 font-bold">{w.occupancy}</strong></span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: ALL MATCH LOGS (100% Real DB Data) */}
                        {!loadingHistory && historyTab === 'ALL_LOGS' && (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={historySearchQuery}
                                    onChange={e => setHistorySearchQuery(e.target.value)}
                                    placeholder="🔍 Search history logs by customer name, sport, or court..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#111827]"
                                />
                                <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
                                    <table className="w-full text-xs text-left border-collapse min-w-[650px]">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-black uppercase tracking-wider h-10">
                                                <th className="px-4 py-2">DATE & TIME</th>
                                                <th className="px-4 py-2">CUSTOMER</th>
                                                <th className="px-4 py-2">SPORT</th>
                                                <th className="px-4 py-2">COURT</th>
                                                <th className="px-4 py-2">AMOUNT</th>
                                                <th className="px-4 py-2">STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(historyAnalytics.allLogs.length > 0 ? historyAnalytics.allLogs : (stats.recentBookings || DEFAULT_BOOKINGS))
                                                .filter(b => !historySearchQuery || b.customer?.toLowerCase().includes(historySearchQuery.toLowerCase()) || b.sport?.toLowerCase().includes(historySearchQuery.toLowerCase()) || b.court?.toLowerCase().includes(historySearchQuery.toLowerCase()))
                                                .map((b, i) => (
                                                    <tr key={i} className="h-12 hover:bg-slate-50">
                                                        <td className="px-4 py-2 font-bold text-slate-800">{b.date || 'Today'} {b.time}</td>
                                                        <td className="px-4 py-2 font-extrabold text-slate-900">{b.customer}</td>
                                                        <td className="px-4 py-2">
                                                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-lg border border-emerald-200">
                                                                {b.sport}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-slate-600 font-semibold">{b.court}</td>
                                                        <td className="px-4 py-2 font-mono font-black text-emerald-600">{b.amount}</td>
                                                        <td className="px-4 py-2">
                                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                                                                {b.status || 'Confirmed'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsHistoryModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
                            >
                                Close Log View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
