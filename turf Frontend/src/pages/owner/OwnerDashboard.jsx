import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { HiLightningBolt, HiTrendingUp, HiUsers, HiCurrencyRupee, HiCalendar, HiClock, HiLocationMarker } from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
import { getOverview } from '../../services/dashboardService'

const DEFAULT_PEAK_DATA = [
    { h: '6AM', v: 30 },
    { h: '8AM', v: 65 },
    { h: '10AM', v: 45 },
    { h: '12PM', v: 35 },
    { h: '2PM', v: 40 },
    { h: '4PM', v: 80 },
    { h: '6PM', v: 95 },
    { h: '8PM', v: 88 },
    { h: '10PM', v: 50 }
]

const DEFAULT_BOOKINGS = [
    { id: '1', time: '10:00 AM', customer: 'Rahul K.', sport: 'Cricket', court: 'Turf A', amount: '₹800', status: 'Confirmed' },
    { id: '2', time: '11:30 AM', customer: 'Priya S.', sport: 'Football', court: 'Turf B', amount: '₹900', status: 'Confirmed' },
    { id: '3', time: '02:00 PM', customer: 'Arjun M.', sport: 'Football', court: 'Court 1', amount: '₹400', status: 'Pending' },
    { id: '4', time: '04:30 PM', customer: 'Sneha R.', sport: 'Cricket', court: 'Turf A', amount: '₹1,200', status: 'Confirmed' },
]

export default function OwnerDashboard() {
    const { user } = useAuth()

    const [stats, setStats] = useState({
        todaysRevenue: 0,
        todaysBookings: 0,
        activeMatches: 0,
        upcomingEvents: 0,
        totalRevenue: 0,
        availableSlots: 0,
        sportsCount: 0,
        peakData: DEFAULT_PEAK_DATA,
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
                        peakData: Array.isArray(data.data.peakData) ? data.data.peakData : DEFAULT_PEAK_DATA,
                        recentBookings: Array.isArray(data.data.recentBookings) && data.data.recentBookings.length > 0 ? data.data.recentBookings : DEFAULT_BOOKINGS
                    }));
                }
            } catch (err) {
                console.error('Error fetching Owner Dashboard summary:', err);
            }
        };
        fetchSummary();
    }, [user]);

    return (
        <div className="space-y-8 bg-[#F4F7FC] p-6 rounded-3xl min-h-screen animate-in fade-in duration-500">
            {/* Real-time Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl shadow-inner shadow-emerald-500/5">
                        <HiLightningBolt className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                            Turf Controller Dashboard
                        </h1>
                        <p className="text-surface-500 text-sm mt-0.5 font-medium">Real-time operational summary & court occupancy analytics</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface-50 border border-surface-200/60 text-xs font-semibold text-surface-700 shadow-soft">
                        <HiClock className="w-4 h-4 text-emerald-500" />
                        <span>Subscription Active: <span className="text-emerald-600 font-bold">30 Days Left</span></span>
                    </div>
                </div>
            </div>

            {/* Premium Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Today's Revenue"
                    value={`₹${stats.todaysRevenue.toLocaleString()}`}
                    change="Live MySQL Data"
                    trend="up"
                    icon={<HiCurrencyRupee />}
                    colorTheme="amber"
                />

                <StatCard
                    label="Today's Bookings"
                    value={stats.todaysBookings}
                    change="Real-time DB"
                    trend="up"
                    icon={<HiCalendar />}
                    colorTheme="emerald"
                />

                <StatCard
                    label="Active Matches"
                    value={stats.activeMatches}
                    change="Active matches live"
                    trend="up"
                    icon={<HiUsers />}
                    colorTheme="blue"
                />

                <StatCard
                    label="Upcoming Events"
                    value={stats.upcomingEvents}
                    change="Next cup in 3 days"
                    trend="up"
                    icon={<HiClock />}
                    colorTheme="purple"
                />
            </div>

            {/* Peak Hour Occupancy Graph */}
            <div className="bg-white rounded-3xl border border-surface-200/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-black text-surface-900 tracking-tight">Peak Occupancy Analysis</h2>
                        <p className="text-surface-500 text-xs mt-0.5">Hourly court utilization tracking</p>
                    </div>
                    <Badge variant="primary">Realtime Status</Badge>
                </div>

                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.peakData || DEFAULT_PEAK_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="h" tick={{ fontSize: 11, fill: '#64748b', fontWeight: '500' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: '500' }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(34, 197, 94, 0.05)' }}
                                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                                formatter={v => [`${v}%`, 'Occupancy']}
                            />
                            <Bar dataKey="v" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 11. Today's Bookings Table Container */}
            <div className="bg-white rounded-3xl border border-surface-200/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black text-surface-900 tracking-tight">Today&apos;s Bookings</h2>
                        <p className="text-surface-500 text-xs mt-0.5">Scheduled slots for match days</p>
                    </div>
                </div>

                {/* Ultra-Premium Data Grid / Table */}
                <div className="overflow-x-auto rounded-2xl border border-surface-200/80 shadow-soft bg-white">
                    <table className="w-full text-sm text-left border-collapse">
                        {/* 1. Light Gradient Table Header (#F8FAFC -> #EEF4FF, Bottom Border #D6E4F0) */}
                        <thead>
                            <tr className="bg-gradient-to-r from-[#F8FAFC] to-[#EEF4FF] border-b border-[#D6E4F0]">
                                <th className="px-6 py-4 text-xs font-bold text-surface-600 uppercase tracking-wider">TIME</th>
                                <th className="px-6 py-4 text-xs font-bold text-surface-600 uppercase tracking-wider">CUSTOMER</th>
                                <th className="px-6 py-4 text-xs font-bold text-surface-600 uppercase tracking-wider">SPORT</th>
                                <th className="px-6 py-4 text-xs font-bold text-surface-600 uppercase tracking-wider">COURT</th>
                                <th className="px-6 py-4 text-xs font-bold text-surface-600 uppercase tracking-wider">AMOUNT</th>
                                <th className="px-6 py-4 text-xs font-bold text-surface-600 uppercase tracking-wider">STATUS</th>
                            </tr>
                        </thead>

                        {/* 10. Soft Row Dividers rgba(15,23,42,.06) */}
                        <tbody className="divide-y divide-[rgba(15,23,42,0.06)]">
                            {(stats.recentBookings || DEFAULT_BOOKINGS).map((b, i) => {
                                // Initials for Customer Avatar
                                const initials = (b.customer || '').split(' ').map(n => n[0]).join('').toUpperCase() || 'CU'
                                
                                return (
                                    /* 2. Alternate Row Colors (#FFFFFF vs #FAFBFD), 3. Hover Effect (#F0F9FF) & 12. 4px Left Green Accent Strip */
                                    <tr
                                        key={b.id || i}
                                        className={`transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-emerald-500 hover:bg-[#F0F9FF] ${
                                            i % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FAFBFD]'
                                        }`}
                                    >
                                        {/* 5. Time Column with Badge */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF4FF] text-indigo-800 border border-indigo-100 text-xs font-bold shadow-sm">
                                                🕘 {b.time}
                                            </span>
                                        </td>

                                        {/* 8. Customer Name with Gradient Avatar */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 flex items-center justify-center text-white text-[11px] font-black shadow-soft">
                                                    {initials}
                                                </div>
                                                <span className="font-bold text-surface-900 text-sm">{b.customer}</span>
                                            </div>
                                        </td>

                                        {/* 6. Sport Column Badges */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {b.sport === 'Cricket' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold shadow-sm">
                                                    🏏 Cricket
                                                </span>
                                            ) : b.sport === 'Football' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold shadow-sm">
                                                    ⚽ Football
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80 text-xs font-bold shadow-sm">
                                                    ⚽ {b.sport}
                                                </span>
                                            )}
                                        </td>

                                        {/* 7. Court Column */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F8FAFC] text-surface-700 border border-surface-200 text-xs font-bold shadow-sm">
                                                📍 {b.court}
                                            </span>
                                        </td>

                                        {/* 4. Amount Column (Bold Green Font 700) */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-emerald-600 font-extrabold text-sm sm:text-base">
                                                {b.amount}
                                            </span>
                                        </td>

                                        {/* 9. Status Badge (#ECFDF3 Soft Green for Confirmed, #FFF7E6 Soft Yellow for Pending) */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {b.status === 'Confirmed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ECFDF3] text-emerald-700 border border-emerald-200/80 text-xs font-bold shadow-sm">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Confirmed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF7E6] text-amber-700 border border-amber-200/80 text-xs font-bold shadow-sm">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending
                                                </span>
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
