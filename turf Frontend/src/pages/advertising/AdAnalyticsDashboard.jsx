import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
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

const MONTHLY_REVENUE_DATA = []
const AD_PERFORMANCE_DATA = []
const BOOKING_TREND_DATA = []
const CLICK_VS_BOOKING_DATA = []

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
    const [timeframe, setTimeframe] = useState('30d')
    const [isTimeframeOpen, setIsTimeframeOpen] = useState(false)

    const [stats, setStats] = useState({
        totalAds: 0,
        activeAds: 0,
        totalRevenue: 0,
        commission: 0,
        adBookings: 0,
        conversionRate: '0.0%'
    })

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
                const adsRes = await fetch(`${API_URL}/ads`).then(r => r.json()).catch(() => ({ success: false }));

                let totalAds = 0;
                let activeAds = 0;
                let totalRevenue = 0;
                let adBookings = 0;

                if (adsRes.success && Array.isArray(adsRes.data)) {
                    const demoAdIds = ['ad_101', 'ad_102', 'ad_103'];
                    const filteredAds = adsRes.data.filter(a => !demoAdIds.includes(a.id) && !demoAdIds.includes(a._id));
                    totalAds = filteredAds.length;
                    activeAds = filteredAds.filter(a => (a.status || '').toLowerCase() === 'active').length;

                    totalRevenue = filteredAds.reduce((sum, a) => {
                        const rev = parseFloat(String(a.revenue || '0').replace(/[^0-9.]/g, '')) || 0;
                        return sum + rev;
                    }, 0);

                    adBookings = filteredAds.reduce((sum, a) => sum + (Number(a.bookings) || 0), 0);
                }

                const comm = Math.round(totalRevenue * 0.12);
                const conv = totalAds > 0 ? ((adBookings / (totalAds * 10)) * 100).toFixed(1) + '%' : '0.0%';

                setStats({
                    totalAds,
                    activeAds,
                    totalRevenue,
                    commission: comm,
                    adBookings,
                    conversionRate: conv
                });
            } catch (e) {
                console.warn('Error syncing ad analytics:', e);
            }
        };

        fetchAnalyticsData();
    }, []);

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

                    {/* Date Filter Controls Popover */}
                    <div className="relative inline-block">
                        <button
                            type="button"
                            onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
                            className="h-11 px-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all cursor-pointer flex items-center gap-2 font-extrabold text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                            <FiCalendar className="w-4 h-4 text-emerald-600" />
                            <span>{TIMEFRAME_OPTIONS.find(o => o.value === timeframe)?.label || 'Last 30 Days'}</span>
                            <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isTimeframeOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                        </button>

                        {isTimeframeOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsTimeframeOpen(false)} />
                                <div className="absolute top-full right-0 mt-2 z-50 w-44 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_15px_35px_rgba(0,0,0,0.1)] p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                    {TIMEFRAME_OPTIONS.map(opt => {
                                        const isSelected = timeframe === opt.value
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => {
                                                    setTimeframe(opt.value)
                                                    setIsTimeframeOpen(false)
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                                                    isSelected 
                                                        ? 'bg-emerald-50 text-emerald-700 font-black' 
                                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                                }`}
                                            >
                                                <span>{opt.label}</span>
                                                {isSelected && <FiCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </>
                        )}
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

                {/* Commission */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 transition-all duration-300 group-hover:h-1.5" />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 truncate">
                            <FiTrendingUp className="text-amber-500 shrink-0" /> Commission
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight leading-none">₹{stats.commission.toLocaleString('en-IN')}</p>
                        <p className="text-[11px] font-medium text-slate-500 truncate">12.0% platform fee</p>
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

                {/* Conversion */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500 transition-all duration-300 group-hover:h-1.5" />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 truncate">
                            <FiActivity className="text-cyan-600 shrink-0" /> Conversion
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-cyan-600 tracking-tight leading-none">12.8%</p>
                        <p className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md inline-block">
                            High conversion
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Section - Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Monthly Revenue & Commission */}
                <div className="bg-white rounded-[20px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center text-base">
                            <FiDollarSign />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                                Monthly Revenue & Platform Commission
                            </h3>
                        </div>
                    </div>
                    <div className="h-64 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MONTHLY_REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748B" tick={{ fontSize: 11, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs font-semibold space-y-1 backdrop-blur-md border border-slate-700/60">
                                                    <p className="font-extrabold text-slate-300">{data.month}</p>
                                                    <p className="text-emerald-400 font-black">Revenue: ₹{data.revenue.toLocaleString()}</p>
                                                    <p className="text-sky-400 font-bold">Commission: ₹{data.commission.toLocaleString()}</p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '700', paddingTop: '10px' }} />
                                <Area type="monotone" dataKey="revenue" name="Total Ad Revenue (₹)" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="commission" name="Commission (₹)" stroke="#0EA5E9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorComm)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Advertisement Performance */}
                <div className="bg-white rounded-[20px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-base">
                            <FiTag />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                                Performance by Advertisement Type
                            </h3>
                        </div>
                    </div>
                    <div className="h-64 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={AD_PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="type" stroke="#64748B" tick={{ fontSize: 11, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748B" tick={{ fontSize: 11, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(14, 165, 233, 0.06)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs font-semibold space-y-1 backdrop-blur-md border border-slate-700/60">
                                                    <p className="font-extrabold text-slate-300">{data.type}</p>
                                                    <p className="text-sky-400 font-black">Bookings: {data.bookings}</p>
                                                    <p className="text-emerald-400 font-bold">Revenue: ₹{data.revenue.toLocaleString()}</p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '700', paddingTop: '10px' }} />
                                <Bar dataKey="bookings" name="Bookings Generated" fill="#0EA5E9" radius={[6, 6, 0, 0]} barSize={36} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Section - Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 3: Booking Trend */}
                <div className="bg-white rounded-[20px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-base">
                            <FiTrendingUp />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                                Weekly Ad Booking Growth
                            </h3>
                        </div>
                    </div>
                    <div className="h-64 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={BOOKING_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="week" stroke="#64748B" tick={{ fontSize: 11, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748B" tick={{ fontSize: 11, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs font-semibold space-y-1 backdrop-blur-md border border-slate-700/60">
                                                    <p className="font-extrabold text-slate-300">{data.week}</p>
                                                    <p className="text-purple-400 font-black">Bookings: {data.bookings}</p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '700', paddingTop: '10px' }} />
                                <Line type="monotone" dataKey="bookings" name="Weekly Bookings" stroke="#A855F7" strokeWidth={3} dot={{ r: 5, fill: '#A855F7', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 4: Click vs Booking */}
                <div className="bg-white rounded-[20px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-base">
                            <FiMousePointer />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                                Daily Clicks vs Final Bookings
                            </h3>
                        </div>
                    </div>
                    <div className="h-64 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={CLICK_VS_BOOKING_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="day" stroke="#64748B" tick={{ fontSize: 11, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748B" tick={{ fontSize: 11, fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(56, 189, 248, 0.06)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs font-semibold space-y-1 backdrop-blur-md border border-slate-700/60">
                                                    <p className="font-extrabold text-slate-300">{data.day}</p>
                                                    <p className="text-sky-400 font-black">Clicks: {data.clicks.toLocaleString()}</p>
                                                    <p className="text-emerald-400 font-black">Bookings: {data.bookings}</p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '700', paddingTop: '10px' }} />
                                <Bar dataKey="clicks" name="Banner Clicks" fill="#38BDF8" radius={[6, 6, 0, 0]} barSize={24} />
                                <Bar dataKey="bookings" name="Confirmed Bookings" fill="#10B981" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
