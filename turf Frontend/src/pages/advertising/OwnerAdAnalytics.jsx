import { useState } from 'react'
import Card from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts'
import { FiTrendingUp, FiEye, FiMousePointer, FiShoppingBag, FiDollarSign, FiAward, FiPieChart, FiBarChart2 } from 'react-icons/fi'

const DAILY_VIEWS_DATA = [
    { day: 'Mon', views: 2400, clicks: 310 },
    { day: 'Tue', views: 2800, clicks: 380 },
    { day: 'Wed', views: 2600, clicks: 340 },
    { day: 'Thu', views: 3200, clicks: 420 },
    { day: 'Fri', views: 4500, clicks: 680 },
    { day: 'Sat', views: 6800, clicks: 940 },
    { day: 'Sun', views: 6100, clicks: 870 }
]

const BOOKINGS_REVENUE_DATA = [
    { day: 'Mon', bookings: 12, revenue: 24000 },
    { day: 'Tue', bookings: 15, revenue: 30000 },
    { day: 'Wed', bookings: 14, revenue: 28000 },
    { day: 'Thu', bookings: 18, revenue: 36000 },
    { day: 'Fri', bookings: 28, revenue: 56000 },
    { day: 'Sat', bookings: 42, revenue: 84000 },
    { day: 'Sun', bookings: 36, revenue: 72000 }
]

const TOP_PERFORMING_ADS = [
    {
        rank: 1,
        id: 'AD-1001',
        name: 'Champions Night Drive Promo',
        type: 'Guaranteed Booking',
        views: '14,200',
        clicks: '1,850',
        bookings: '64',
        revenue: '₹1,28,000',
        ctr: '13.0%',
        status: 'Active'
    },
    {
        rank: 2,
        id: 'AD-1002',
        name: 'Weekend Monsoon 25% Off',
        type: 'Discount Offer',
        views: '8,900',
        clicks: '1,120',
        bookings: '42',
        revenue: '₹75,600',
        ctr: '12.5%',
        status: 'Active'
    },
    {
        rank: 3,
        id: 'AD-1004',
        name: 'Early Morning Slot Boost',
        type: 'Discount Offer',
        views: '12,100',
        clicks: '980',
        bookings: '35',
        revenue: '₹49,000',
        ctr: '8.1%',
        status: 'Expired'
    }
]

export default function OwnerAdAnalytics() {
    const [timeframe, setTimeframe] = useState('7d')

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl shadow-inner shadow-emerald-500/5">
                        <FiBarChart2 className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-surface-900 tracking-tight">Advertisement Analytics</h1>
                        <p className="text-surface-500 text-sm mt-0.5 font-medium">Real-time performance metrics, CTR, ad bookings, and campaign ROI</p>
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
                </Select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-purple-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiEye className="text-purple-500" /> Daily Views
                        </p>
                        <h3 className="text-2xl font-extrabold text-surface-900">28.4K</h3>
                        <p className="text-[11px] font-bold text-emerald-600">↑ +15% this week</p>
                    </div>
                </Card>

                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-cyan-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiMousePointer className="text-cyan-500" /> Ad Clicks
                        </p>
                        <h3 className="text-2xl font-extrabold text-cyan-600">3,940</h3>
                        <p className="text-[11px] font-medium text-surface-500">Avg CTR: 13.8%</p>
                    </div>
                </Card>

                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-primary-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiShoppingBag className="text-primary-500" /> Ad Bookings
                        </p>
                        <h3 className="text-2xl font-extrabold text-primary-600">165</h3>
                        <p className="text-[11px] font-bold text-emerald-600">From ad clicks</p>
                    </div>
                </Card>

                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiDollarSign className="text-emerald-500" /> Total Revenue
                        </p>
                        <h3 className="text-2xl font-extrabold text-emerald-600">₹3.30L</h3>
                        <p className="text-[11px] font-medium text-surface-500">Generated revenue</p>
                    </div>
                </Card>

                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-amber-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiPieChart className="text-amber-500" /> Conversion
                        </p>
                        <h3 className="text-2xl font-extrabold text-amber-600">14.1%</h3>
                        <p className="text-[11px] font-bold text-emerald-600">Top tier ROI</p>
                    </div>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Views & Clicks */}
                <Card variant="glass" className="p-6">
                    <h3 className="font-extrabold text-surface-900 text-base mb-4 flex items-center gap-2">
                        <FiEye className="text-purple-500" /> Daily Views & Click Breakdown
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={DAILY_VIEWS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="day" stroke="#64748B" />
                                <YAxis stroke="#64748B" />
                                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0F172A', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Area type="monotone" dataKey="views" name="Banner Views" stroke="#A855F7" fillOpacity={1} fill="url(#colorViews)" />
                                <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#06B6D4" fillOpacity={1} fill="url(#colorClicks)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Bookings & Revenue */}
                <Card variant="glass" className="p-6">
                    <h3 className="font-extrabold text-surface-900 text-base mb-4 flex items-center gap-2">
                        <FiDollarSign className="text-emerald-500" /> Bookings & Generated Revenue (₹)
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={BOOKINGS_REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="day" stroke="#64748B" />
                                <YAxis stroke="#64748B" />
                                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0F172A', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Bar dataKey="revenue" name="Revenue (₹)" fill="#10B981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Top Performing Advertisements Section */}
            <Card variant="glass" className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-surface-200/60 pb-3">
                    <h3 className="font-extrabold text-surface-900 text-base flex items-center gap-2">
                        <FiAward className="text-amber-500 text-lg" /> Top Performing Advertisements
                    </h3>
                    <span className="text-xs text-surface-500 font-medium">Ranked by revenue contribution</span>
                </div>

                <div className="space-y-3">
                    {TOP_PERFORMING_ADS.map((ad) => (
                        <div key={ad.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-50/70 border border-surface-200/60 hover:bg-white transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                    ad.rank === 1 ? 'bg-amber-100 text-amber-600 border border-amber-300' :
                                    ad.rank === 2 ? 'bg-surface-200 text-surface-700 border border-surface-300' :
                                    'bg-orange-100 text-orange-600 border border-orange-300'
                                }`}>
                                    #{ad.rank}
                                </div>
                                <div>
                                    <h4 className="font-bold text-surface-900 text-sm">{ad.name}</h4>
                                    <div className="text-xs text-surface-500 font-medium flex items-center gap-2 mt-0.5">
                                        <span>ID: {ad.id}</span>
                                        <span>•</span>
                                        <span className="text-primary-600 font-bold">{ad.type}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-4 gap-4 text-center text-xs">
                                <div>
                                    <span className="text-surface-400 block font-medium">Views</span>
                                    <span className="font-bold text-surface-900">{ad.views}</span>
                                </div>
                                <div>
                                    <span className="text-surface-400 block font-medium">Bookings</span>
                                    <span className="font-bold text-primary-600">{ad.bookings}</span>
                                </div>
                                <div>
                                    <span className="text-surface-400 block font-medium">CTR</span>
                                    <span className="font-bold text-cyan-600">{ad.ctr}</span>
                                </div>
                                <div>
                                    <span className="text-surface-400 block font-medium">Revenue</span>
                                    <span className="font-bold text-emerald-600">{ad.revenue}</span>
                                </div>
                            </div>

                            <div>
                                <Badge variant={ad.status === 'Active' ? 'success' : 'default'} dot>{ad.status}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}
