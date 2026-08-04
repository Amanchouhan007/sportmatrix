import { useState } from 'react'
import Card from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts'
import { FiTrendingUp, FiCheckCircle, FiDollarSign, FiTag, FiActivity, FiMousePointer, FiShoppingBag, FiBarChart2 } from 'react-icons/fi'

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

export default function AdAnalyticsDashboard() {
    const [timeframe, setTimeframe] = useState('30d')

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl shadow-inner shadow-emerald-500/5">
                        <FiBarChart2 className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-surface-900 tracking-tight">Advertising Analytics</h1>
                        <p className="text-surface-500 text-sm mt-0.5 font-medium">Deep-dive metrics into ad campaigns, conversion rates, and revenue performance</p>
                    </div>
                </div>
                <Select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-40"
                >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="1y">Last 1 Year</option>
                </Select>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-primary-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiTag className="text-primary-500" /> Total Ads
                        </p>
                        <h3 className="text-2xl font-extrabold text-surface-900">128</h3>
                        <p className="text-[11px] font-bold text-emerald-600">↑ +14% this month</p>
                    </div>
                </Card>

                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiCheckCircle className="text-emerald-500" /> Active Ads
                        </p>
                        <h3 className="text-2xl font-extrabold text-emerald-600">42</h3>
                        <p className="text-[11px] font-medium text-surface-500">Across 18 turfs</p>
                    </div>
                </Card>

                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-teal-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiDollarSign className="text-emerald-500" /> Total Revenue
                        </p>
                        <h3 className="text-2xl font-extrabold text-surface-900">₹5.82L</h3>
                        <p className="text-[11px] font-bold text-emerald-600">↑ +22% vs last mth</p>
                    </div>
                </Card>

                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-amber-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiTrendingUp className="text-amber-500" /> Commission
                        </p>
                        <h3 className="text-2xl font-extrabold text-amber-600">₹69,840</h3>
                        <p className="text-[11px] font-medium text-surface-500">Avg 12.0% rate</p>
                    </div>
                </Card>

                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-purple-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiShoppingBag className="text-purple-500" /> Ad Bookings
                        </p>
                        <h3 className="text-2xl font-extrabold text-surface-900">1,390</h3>
                        <p className="text-[11px] font-bold text-purple-600">Slots generated</p>
                    </div>
                </Card>

                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-cyan-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiActivity className="text-cyan-500" /> Conversion
                        </p>
                        <h3 className="text-2xl font-extrabold text-cyan-600">12.8%</h3>
                        <p className="text-[11px] font-bold text-emerald-600">High conversion</p>
                    </div>
                </Card>
            </div>

            {/* Charts Section - Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Monthly Revenue & Commission */}
                <Card variant="glass" className="p-6">
                    <h3 className="font-extrabold text-surface-900 text-base mb-4 flex items-center gap-2">
                        <FiDollarSign className="text-emerald-500" /> Monthly Revenue & Platform Commission
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MONTHLY_REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="month" stroke="#64748B" />
                                <YAxis stroke="#64748B" />
                                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0F172A', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Area type="monotone" dataKey="revenue" name="Total Ad Revenue (₹)" stroke="#10B981" fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="commission" name="Commission (₹)" stroke="#0EA5E9" fillOpacity={1} fill="url(#colorComm)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Chart 2: Advertisement Performance */}
                <Card variant="glass" className="p-6">
                    <h3 className="font-extrabold text-surface-900 text-base mb-4 flex items-center gap-2">
                        <FiTag className="text-primary-500" /> Performance by Advertisement Type
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={AD_PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="type" stroke="#64748B" />
                                <YAxis stroke="#64748B" />
                                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0F172A', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Bar dataKey="bookings" name="Bookings Generated" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Charts Section - Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 3: Booking Trend */}
                <Card variant="glass" className="p-6">
                    <h3 className="font-extrabold text-surface-900 text-base mb-4 flex items-center gap-2">
                        <FiTrendingUp className="text-purple-500" /> Weekly Ad Booking Growth
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={BOOKING_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="week" stroke="#64748B" />
                                <YAxis stroke="#64748B" />
                                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0F172A', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Line type="monotone" dataKey="bookings" name="Weekly Bookings" stroke="#A855F7" strokeWidth={3} dot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Chart 4: Click vs Booking */}
                <Card variant="glass" className="p-6">
                    <h3 className="font-extrabold text-surface-900 text-base mb-4 flex items-center gap-2">
                        <FiMousePointer className="text-cyan-500" /> Daily Clicks vs Final Bookings
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={CLICK_VS_BOOKING_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="day" stroke="#64748B" />
                                <YAxis stroke="#64748B" />
                                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0F172A', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Bar dataKey="clicks" name="Banner Clicks" fill="#38BDF8" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="bookings" name="Confirmed Bookings" fill="#10B981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
