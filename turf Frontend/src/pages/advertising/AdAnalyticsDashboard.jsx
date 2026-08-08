import { useState } from 'react'
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

const MONTHLY_REVENUE_DATA = [
    { month: 'Jan', revenue: 45000, commission: 5400 },
    { month: 'Feb', revenue: 52000, commission: 6240 },
    { month: 'Mar', revenue: 61000, commission: 7320 },
    { month: 'Apr', revenue: 58000, commission: 6960 },
    { month: 'May', revenue: 74000, commission: 8880 },
    { month: 'Jun', revenue: 89000, commission: 10680 },
    { month: 'Jul', revenue: 95000, commission: 11400 },
    { month: 'Aug', revenue: 108000, commission: 12960 }
]

const AD_PERFORMANCE_DATA = [
    { type: 'Guaranteed Booking', bookings: 420, revenue: 168000 },
    { type: 'Discount Offer', bookings: 680, revenue: 204000 },
    { type: 'Impression Ad', bookings: 290, revenue: 116000 }
]

const BOOKING_TREND_DATA = [
    { week: 'Wk 1', bookings: 85 },
    { week: 'Wk 2', bookings: 110 },
    { week: 'Wk 3', bookings: 145 },
    { week: 'Wk 4', bookings: 190 },
    { week: 'Wk 5', bookings: 215 }
]

const CLICK_VS_BOOKING_DATA = [
    { day: 'Mon', clicks: 1200, bookings: 140 },
    { day: 'Tue', clicks: 1450, bookings: 165 },
    { day: 'Wed', clicks: 1300, bookings: 150 },
    { day: 'Thu', clicks: 1600, bookings: 190 },
    { day: 'Fri', clicks: 2100, bookings: 280 },
    { day: 'Sat', clicks: 3200, bookings: 450 },
    { day: 'Sun', clicks: 2900, bookings: 390 }
]

const TIMEFRAME_OPTIONS = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last 1 Year' }
]

export default function AdAnalyticsDashboard() {
    const [timeframe, setTimeframe] = useState('30d')
    const [isTimeframeOpen, setIsTimeframeOpen] = useState(false)

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Page Hero Header */}
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
                                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                                isSelected
                                                    ? 'bg-emerald-50 text-[#10B981] border border-emerald-200/60 shadow-2xs'
                                                    : 'text-slate-700 hover:bg-emerald-50/60 hover:text-emerald-700'
                                            }`}
                                        >
                                            <span>{opt.label}</span>
                                            {isSelected && <FiCheck className="w-3.5 h-3.5 text-[#10B981]" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </>
                    )}
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
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">128</p>
                        <p className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md inline-block">
                            ↑ +14% this month
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
                        <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight leading-none">42</p>
                        <p className="text-[11px] font-medium text-slate-500 truncate">Across 18 turfs</p>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500 transition-all duration-300 group-hover:h-1.5" />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 truncate">
                            <FiDollarSign className="text-teal-600 shrink-0" /> Total Revenue
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">₹5.82L</p>
                        <p className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md inline-block">
                            ↑ +22% vs last mth
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
                        <p className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight leading-none">₹69,840</p>
                        <p className="text-[11px] font-medium text-slate-500 truncate">Avg 12.0% rate</p>
                    </div>
                </div>

                {/* Ad Bookings */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500 transition-all duration-300 group-hover:h-1.5" />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 truncate">
                            <FiShoppingBag className="text-purple-500 shrink-0" /> Ad Bookings
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">1,390</p>
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
