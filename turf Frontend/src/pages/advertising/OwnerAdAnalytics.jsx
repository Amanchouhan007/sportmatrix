import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts'
import { FiEye, FiMousePointer, FiShoppingBag, FiDollarSign, FiAward, FiPieChart, FiBarChart2 } from 'react-icons/fi'
import { useToast } from '../../components/ui/Toast'
import { getAdAnalytics } from '../../services/adsService'

export default function OwnerAdAnalytics() {
    const { addToast } = useToast()
    const [timeframe, setTimeframe] = useState('7d')
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({ totalViews: 0, totalClicks: 0, adBookings: 0, totalRevenue: 0, conversionRate: 0 })
    const [campaigns, setCampaigns] = useState([])

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true)
            try {
                const res = await getAdAnalytics()
                const d = res.data || {}
                const raw = Array.isArray(d.campaignsRaw) ? d.campaignsRaw : []
                setCampaigns(raw)
                setStats({
                    totalViews: raw.reduce((sum, c) => sum + c.views, 0),
                    totalClicks: Number(d.totalClicks || 0),
                    adBookings: Number(d.adBookings || 0),
                    totalRevenue: Number(d.totalRevenue || 0),
                    conversionRate: Number(d.conversionRate || 0)
                })
            } catch (err) {
                addToast({ title: 'Load Failed', message: err.message || 'Failed to load advertisement analytics.', type: 'error' })
            } finally {
                setIsLoading(false)
            }
        }
        fetchAnalytics()
    }, [addToast])

    const avgCtr = stats.totalViews > 0 ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(1) : '0.0'

    const viewsClicksByCampaign = campaigns.map(c => ({ name: c.name, views: c.views, clicks: c.clicks }))
    const revenueByCampaign = campaigns.map(c => ({ name: c.name, revenue: c.revenue }))

    const topAds = [...campaigns]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((c, i) => ({
            rank: i + 1,
            id: c.id,
            name: c.name,
            type: c.type === 'GUARANTEED_BOOKING' ? 'Guaranteed Booking' : c.type === 'IMPRESSION_AD' ? 'Impression Ad' : 'Discount Offer',
            views: c.views.toLocaleString(),
            clicks: c.clicks.toLocaleString(),
            bookings: c.bookings,
            revenue: `₹${c.revenue.toLocaleString('en-IN')}`,
            ctr: c.views > 0 ? `${((c.clicks / c.views) * 100).toFixed(1)}%` : '0.0%'
        }))

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
                        <p className="text-surface-500 text-sm mt-0.5 font-medium">Performance metrics, CTR, ad bookings, and campaign revenue for your branches</p>
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

            {isLoading ? (
                <div className="py-16 text-center text-slate-400 text-sm font-semibold bg-white rounded-3xl border border-surface-200/60">Loading analytics...</div>
            ) : (
            <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-purple-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiEye className="text-purple-500" /> Total Views
                        </p>
                        <h3 className="text-2xl font-extrabold text-surface-900">{stats.totalViews.toLocaleString()}</h3>
                        <p className="text-[11px] font-medium text-surface-500">Across all campaigns</p>
                    </div>
                </Card>

                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-cyan-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiMousePointer className="text-cyan-500" /> Ad Clicks
                        </p>
                        <h3 className="text-2xl font-extrabold text-cyan-600">{stats.totalClicks.toLocaleString()}</h3>
                        <p className="text-[11px] font-medium text-surface-500">Avg CTR: {avgCtr}%</p>
                    </div>
                </Card>

                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-primary-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiShoppingBag className="text-primary-500" /> Ad Bookings
                        </p>
                        <h3 className="text-2xl font-extrabold text-primary-600">{stats.adBookings}</h3>
                        <p className="text-[11px] font-bold text-emerald-600">From ad campaigns</p>
                    </div>
                </Card>

                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiDollarSign className="text-emerald-500" /> Total Revenue
                        </p>
                        <h3 className="text-2xl font-extrabold text-emerald-600">₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
                        <p className="text-[11px] font-medium text-surface-500">Generated revenue</p>
                    </div>
                </Card>

                <Card variant="glass" hover className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-amber-500"></div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-1">
                            <FiPieChart className="text-amber-500" /> Conversion
                        </p>
                        <h3 className="text-2xl font-extrabold text-amber-600">{stats.conversionRate}%</h3>
                        <p className="text-[11px] font-medium text-surface-500">Bookings / Clicks</p>
                    </div>
                </Card>
            </div>

            {campaigns.length === 0 ? (
                <Card variant="glass" className="p-10 text-center text-surface-400 text-sm font-semibold">
                    No advertisement campaigns yet -- create one to see performance analytics here.
                </Card>
            ) : (
            <>
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card variant="glass" className="p-6">
                    <h3 className="font-extrabold text-surface-900 text-base mb-4 flex items-center gap-2">
                        <FiEye className="text-purple-500" /> Views & Clicks by Campaign
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height={240} minWidth={0}>
                            <BarChart data={viewsClicksByCampaign} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10 }} />
                                <YAxis stroke="#64748B" />
                                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0F172A', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Bar dataKey="views" name="Views" fill="#A855F7" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="clicks" name="Clicks" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card variant="glass" className="p-6">
                    <h3 className="font-extrabold text-surface-900 text-base mb-4 flex items-center gap-2">
                        <FiDollarSign className="text-emerald-500" /> Revenue by Campaign (₹)
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height={240} minWidth={0}>
                            <BarChart data={revenueByCampaign} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10 }} />
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
                    {topAds.map((ad) => (
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
                        </div>
                    ))}
                </div>
            </Card>
            </>
            )}
            </>
            )}
        </div>
    )
}
