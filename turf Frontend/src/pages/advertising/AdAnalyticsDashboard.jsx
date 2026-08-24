import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts'
import {
    FiTrendingUp,
    FiCheckCircle,
    FiDollarSign,
    FiTag,
    FiActivity,
    FiMousePointer,
    FiShoppingBag,
    FiBarChart2,
    FiCalendar,
    FiChevronDown,
    FiCheck
} from 'react-icons/fi'
import { useToast } from '../../components/ui/Toast'
import { getAdAnalytics } from '../../services/adsService'

const TIMEFRAME_OPTIONS = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last 1 Year' }
]

export default function AdAnalyticsDashboard() {
    const navigate = useNavigate()
    const location = useLocation()
    const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : location.pathname.startsWith('/staff') ? '/staff' : '/admin'
    const { addToast } = useToast()
    const [timeframe, setTimeframe] = useState('30d')
    const [isTimeframeOpen, setIsTimeframeOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const [stats, setStats] = useState({
        totalAds: 0,
        activeAds: 0,
        totalRevenue: 0,
        commission: 0,
        adBookings: 0,
        conversionRate: 0
    })
    const [campaigns, setCampaigns] = useState([])

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            setIsLoading(true)
            try {
                const res = await getAdAnalytics()
                const d = res.data || {}
                setStats({
                    totalAds: Number(d.totalAds || 0),
                    activeAds: Number(d.activeAds || 0),
                    totalRevenue: Number(d.totalRevenue || 0),
                    commission: Number(d.totalCommission || 0),
                    adBookings: Number(d.adBookings || 0),
                    conversionRate: Number(d.conversionRate || 0)
                })
                setCampaigns(Array.isArray(d.campaignsRaw) ? d.campaignsRaw : [])
            } catch (err) {
                addToast({ title: 'Load Failed', message: err.message || 'Failed to load ad analytics.', type: 'error' })
            } finally {
                setIsLoading(false)
            }
        }
        fetchAnalyticsData()
    }, [addToast])

    // Real per-campaign-type aggregation -- no fabricated time-series, since the
    // backend doesn't track daily/monthly buckets for ad performance yet.
    const byType = Object.values(campaigns.reduce((acc, c) => {
        if (!acc[c.type]) acc[c.type] = { type: c.type, bookings: 0, revenue: 0 }
        acc[c.type].bookings += c.bookings
        acc[c.type].revenue += c.revenue
        return acc
    }, {}))

    const revenueByCampaign = campaigns.map(c => ({ name: c.name, revenue: c.revenue, commission: c.commissionPaid }))
    const clicksVsBookings = campaigns.map(c => ({ name: c.name, clicks: c.clicks, bookings: c.bookings }))
    const budgetUtilization = campaigns.map(c => ({ name: c.name, spent: c.budgetSpent, total: c.budgetTotal }))

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header & Sub-Navigation Tabs */}
            <div className="space-y-4">
                <div className="bg-white rounded-[24px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-[#10B981] flex items-center justify-center text-xl shadow-2xs">
                            <FiBarChart2 className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                                Advertising Analytics
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                                Deep-dive metrics into ad campaigns, conversion rates, and revenue performance
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => navigate(`${basePath}/ads`)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                        📢 All Campaigns
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`${basePath}/ads/commissions`)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                        💵 Commissions
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`${basePath}/ads/analytics`)}
                        className="px-4 py-2 rounded-xl text-xs font-black bg-[#10B981] text-white shadow-xs"
                    >
                        📊 Analytics
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`${basePath}/ads/payments`)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                        💳 Payments
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="py-16 text-center text-slate-400 text-sm font-semibold bg-white rounded-3xl border border-slate-200/80">Loading analytics...</div>
            ) : (
            <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Total Ads */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 transition-all duration-300 group-hover:h-1.5" />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 truncate">
                            <FiTag className="text-[#10B981] shrink-0" /> Total Ads
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">{stats.totalAds}</p>
                        <p className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md inline-block">
                            Real DB Count
                        </p>
                    </div>
                </div>

                {/* Active Ads */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 transition-all duration-300 group-hover:h-1.5" />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 truncate">
                            <FiCheckCircle className="text-[#10B981] shrink-0" /> Active Ads
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight leading-none">{stats.activeAds}</p>
                        <p className="text-[11px] font-medium text-slate-500 truncate">Across registered turfs</p>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500 transition-all duration-300 group-hover:h-1.5" />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 truncate">
                            <FiDollarSign className="text-teal-600 shrink-0" /> Total Revenue
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                        <p className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md inline-block">
                            Live Ledger
                        </p>
                    </div>
                </div>

                {/* Commission -- real sum of AdCommission.commissionPaid per ad, not a guessed flat rate */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 transition-all duration-300 group-hover:h-1.5" />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 truncate">
                            <FiTrendingUp className="text-amber-500 shrink-0" /> Commission
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight leading-none">₹{stats.commission.toLocaleString('en-IN')}</p>
                        <p className="text-[11px] font-medium text-slate-500 truncate">Paid to date</p>
                    </div>
                </div>

                {/* Ad Bookings */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500 transition-all duration-300 group-hover:h-1.5" />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 truncate">
                            <FiShoppingBag className="text-purple-500 shrink-0" /> Ad Bookings
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">{stats.adBookings}</p>
                        <p className="text-[11px] font-extrabold text-purple-600 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-md inline-block">
                            Slots generated
                        </p>
                    </div>
                </div>

                {/* Conversion -- real bookings/clicks ratio, not a hardcoded literal */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500 transition-all duration-300 group-hover:h-1.5" />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 truncate">
                            <FiActivity className="text-cyan-600 shrink-0" /> Conversion
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-cyan-600 tracking-tight leading-none">{stats.conversionRate}%</p>
                        <p className="text-[11px] font-medium text-slate-500 truncate">Bookings / Clicks</p>
                    </div>
                </div>
            </div>

            {campaigns.length === 0 ? (
                <div className="bg-white rounded-[20px] border border-slate-200/80 p-10 text-center text-slate-400 text-sm font-semibold">
                    No advertisement campaigns yet -- charts will populate once campaigns have real activity.
                </div>
            ) : (
            <>
            {/* Charts Section - Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Revenue & Commission by Campaign */}
                <div className="bg-white rounded-[20px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center text-base">
                            <FiDollarSign />
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">Revenue &amp; Commission by Campaign</h3>
                    </div>
                    <div className="h-64 pt-2">
                        <ResponsiveContainer width="100%" height={240} minWidth={0}>
                            <BarChart data={revenueByCampaign} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748B" tick={{ fontSize: 11, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '700', paddingTop: '10px' }} />
                                <Bar dataKey="revenue" name="Revenue (₹)" fill="#10B981" radius={[6, 6, 0, 0]} barSize={28} />
                                <Bar dataKey="commission" name="Commission Paid (₹)" fill="#0EA5E9" radius={[6, 6, 0, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Performance by Advertisement Type */}
                <div className="bg-white rounded-[20px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-base">
                            <FiTag />
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">Performance by Advertisement Type</h3>
                    </div>
                    <div className="h-64 pt-2">
                        <ResponsiveContainer width="100%" height={240} minWidth={0}>
                            <BarChart data={byType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="type" stroke="#64748B" tick={{ fontSize: 11, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748B" tick={{ fontSize: 11, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(14, 165, 233, 0.06)' }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '700', paddingTop: '10px' }} />
                                <Bar dataKey="bookings" name="Bookings Generated" fill="#0EA5E9" radius={[6, 6, 0, 0]} barSize={36} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Section - Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 3: Clicks vs Bookings by Campaign */}
                <div className="bg-white rounded-[20px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-base">
                            <FiMousePointer />
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">Clicks vs Bookings by Campaign</h3>
                    </div>
                    <div className="h-64 pt-2">
                        <ResponsiveContainer width="100%" height={240} minWidth={0}>
                            <BarChart data={clicksVsBookings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748B" tick={{ fontSize: 11, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(56, 189, 248, 0.06)' }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '700', paddingTop: '10px' }} />
                                <Bar dataKey="clicks" name="Clicks" fill="#38BDF8" radius={[6, 6, 0, 0]} barSize={24} />
                                <Bar dataKey="bookings" name="Confirmed Bookings" fill="#10B981" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 4: Budget Utilization by Campaign */}
                <div className="bg-white rounded-[20px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-base">
                            <FiTrendingUp />
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">Budget Utilization by Campaign</h3>
                    </div>
                    <div className="h-64 pt-2">
                        <ResponsiveContainer width="100%" height={240} minWidth={0}>
                            <BarChart data={budgetUtilization} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748B" tick={{ fontSize: 11, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(168, 85, 247, 0.06)' }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '700', paddingTop: '10px' }} />
                                <Bar dataKey="spent" name="Spent (₹)" fill="#A855F7" radius={[6, 6, 0, 0]} barSize={24} />
                                <Bar dataKey="total" name="Total Budget (₹)" fill="#E9D5FF" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            </>
            )}
            </>
            )}
        </div>
    )
}
