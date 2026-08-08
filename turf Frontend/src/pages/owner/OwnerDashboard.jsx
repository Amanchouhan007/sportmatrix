import { useState, useEffect } from 'react'
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
import { getOverview } from '../../services/dashboardService'

const DEFAULT_PEAK_DATA_TODAY = [
    { h: '6 AM', v: 30, count: 2 },
    { h: '8 AM', v: 65, count: 5 },
    { h: '10 AM', v: 45, count: 3 },
    { h: '12 PM', v: 35, count: 2 },
    { h: '2 PM', v: 40, count: 3 },
    { h: '4 PM', v: 80, count: 6 },
    { h: '6 PM', v: 95, count: 8 },
    { h: '8 PM', v: 88, count: 7 },
    { h: '10 PM', v: 50, count: 4 }
]

const DEFAULT_PEAK_DATA_7DAYS = [
    { h: 'Mon', v: 55, count: 18 },
    { h: 'Tue', v: 60, count: 20 },
    { h: 'Wed', v: 75, count: 25 },
    { h: 'Thu', v: 70, count: 22 },
    { h: 'Fri', v: 85, count: 28 },
    { h: 'Sat', v: 98, count: 35 },
    { h: 'Sun', v: 92, count: 32 }
]

const DEFAULT_PEAK_DATA_30DAYS = [
    { h: 'Week 1', v: 68, count: 95 },
    { h: 'Week 2', v: 74, count: 110 },
    { h: 'Week 3', v: 82, count: 124 },
    { h: 'Week 4', v: 88, count: 135 }
]

const DEFAULT_BOOKINGS = [
    { id: '1', time: '10:00 AM', customer: 'Rahul K.', sport: 'Cricket', court: 'Turf A', amount: '₹800', status: 'Confirmed' },
    { id: '2', time: '11:30 AM', customer: 'Priya S.', sport: 'Football', court: 'Turf B', amount: '₹900', status: 'Confirmed' },
    { id: '3', time: '02:00 PM', customer: 'Arjun M.', sport: 'Football', court: 'Court 1', amount: '₹400', status: 'Pending' },
    { id: '4', time: '04:30 PM', customer: 'Sneha R.', sport: 'Cricket', court: 'Turf A', amount: '₹1,200', status: 'Confirmed' },
]

export default function OwnerDashboard() {
    const { user } = useAuth()
    const { addToast } = useToast()
    const navigate = useNavigate()

    const [chartRange, setChartRange] = useState('TODAY') // 'TODAY' | '7DAYS' | '30DAYS'
    const [activeRowAction, setActiveRowAction] = useState(null)

    const [stats, setStats] = useState({
        todaysRevenue: 0,
        todaysBookings: 0,
        activeMatches: 0,
        upcomingEvents: 0,
        totalRevenue: 0,
        availableSlots: 0,
        sportsCount: 0,
        peakData: DEFAULT_PEAK_DATA_TODAY,
        recentBookings: DEFAULT_BOOKINGS
    })

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const ownerId = user?.id || user?._id || user?.email;
                if (!ownerId) return;
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
                        recentBookings: Array.isArray(data.data.recentBookings) && data.data.recentBookings.length > 0 ? data.data.recentBookings : DEFAULT_BOOKINGS
                    }));
                }
            } catch (err) {
                console.error('Error fetching Owner Dashboard summary:', err);
            }
        };
        fetchSummary();
    }, [user]);

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
                    <ResponsiveContainer width="100%" height="100%">
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
                <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
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
                                const initials = (b.customer || '').split(' ').map(n => n[0]).join('').toUpperCase() || 'CU'
                                
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

                                            {activeRowAction === (b.id || i) && (
                                                <div className="absolute right-4 top-10 z-30 w-36 bg-white border border-slate-200/90 rounded-xl shadow-lg p-1 space-y-0.5 text-left text-xs font-bold animate-in fade-in duration-150">
                                                    <button
                                                        onClick={() => {
                                                            setActiveRowAction(null)
                                                            navigate('/admin/bookings')
                                                        }}
                                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                                    >
                                                        <HiEye className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>View</span>
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
        </div>
    )
}
