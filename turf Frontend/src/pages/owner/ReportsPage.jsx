import { useState, useEffect, useCallback } from 'react'
import ChartCard from '../../components/ui/ChartCard'
import HeatmapGrid from '../../components/ui/HeatmapGrid'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { HiDownload, HiChartBar, HiTrendingUp, HiCalendar } from 'react-icons/hi'
import api from '../../services/api'
import { getSportsReport, getOccupancyHeatmap } from '../../services/reportsService'

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#a855f7']

export default function ReportsPage() {
    const { addToast } = useToast()
    const [dateRange, setDateRange] = useState('This Week')
    const [revenueData, setRevenueData] = useState([])
    const [bookingTrend, setBookingTrend] = useState([])
    const [sportData, setSportData] = useState([])
    const [heatmapData, setHeatmapData] = useState([])
    const [heatmapLabels, setHeatmapLabels] = useState({ xLabels: [], yLabels: [] })

    const loadReports = useCallback(() => {
        api.get('/billing/history')
            .then(res => {
                const raw = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
                const list = Array.isArray(raw) ? raw : [];
                if (list.length > 0) {
                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const dayMap = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
                    const weekMap = {};
                    list.forEach(b => {
                        const d = b.createdAt || b.created_at || b.date ? new Date(b.createdAt || b.created_at || b.date) : new Date();
                        const grossAmt = Number(b.amount || b.grossTotal || 0);
                        const netAmt = Number(b.netShare || b.ownerAmount || Math.round(grossAmt * 0.9));
                        dayMap[days[d.getDay()]] = (dayMap[days[d.getDay()]] || 0) + netAmt;
                        const weekKey = `${d.getFullYear()}-W${Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 86400000) + new Date(d.getFullYear(), 0, 1).getDay() + 1) / 7)}`;
                        weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
                    });
                    setRevenueData(Object.keys(dayMap).map(m => ({ m, v: dayMap[m] })));
                    setBookingTrend(Object.keys(weekMap).sort().slice(-6).map((wk, i) => ({ m: `W${i + 1}`, v: weekMap[wk] })));
                } else {
                    setRevenueData([]);
                    setBookingTrend([]);
                }
            })
            .catch(() => { setRevenueData([]); setBookingTrend([]); });




        getSportsReport().then(rows => {
            const total = rows.reduce((s, r) => s + r.bookingsCount, 0);
            setSportData(total > 0 ? rows.map(r => ({ name: r.name, value: Math.round((r.bookingsCount / total) * 100) })) : []);
        });

        getOccupancyHeatmap().then(({ data, xLabels, yLabels }) => {
            setHeatmapData(data || []);
            setHeatmapLabels({ xLabels: xLabels || [], yLabels: yLabels || [] });
        });
    }, [])

    useEffect(() => { loadReports() }, [loadReports, dateRange]);

    const handleExport = (format) => {
        addToast({ title: 'Export Started', message: `Downloading ledger report in ${format} format...`, type: 'success' })
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        Analytics & Visual Reports
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Verify overall occupancy percentages, sport popularities, and weekly revenues</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleExport('CSV')} className="cursor-pointer">
                        <HiDownload className="mr-1 w-4 h-4" /> Export CSV
                    </Button>
                    <Button onClick={() => handleExport('PDF')} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/10 cursor-pointer">
                        <HiDownload className="mr-1 w-4 h-4" /> Export PDF
                    </Button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-surface-200/60 shadow-soft">
                <div className="flex gap-1.5">
                    {['This Week', 'This Month', 'Last 3 Months'].map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-2 text-xs font-black rounded-2xl border transition-all cursor-pointer ${dateRange === range ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/10' : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'}`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
                <Button variant="outline" size="sm" onClick={loadReports} className="cursor-pointer">Refresh</Button>
            </div>

            {/* Recharts grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Daily Revenue Chart */}
                <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft space-y-4">
                    <h2 className="text-base font-black text-surface-900 tracking-tight">Daily Revenue Metrics</h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height={240} minWidth={0}>
                            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#64748b', fontWeight: '500' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: '500' }} tickFormatter={v => `₹${v/1000}k`} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                                    formatter={v => [`₹${Number(v).toLocaleString()}`, 'Revenue']} 
                                />
                                <Bar dataKey="v" fill="#10b981" radius={[8, 8, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Popularity chart */}
                <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft space-y-4 flex flex-col justify-between">
                    <h2 className="text-base font-black text-surface-900 tracking-tight">Sport Popularity Distribution</h2>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height={240} minWidth={0}>
                            <PieChart>
                                <Pie 
                                    data={sportData} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={50} 
                                    outerRadius={80} 
                                    paddingAngle={4} 
                                    dataKey="value"
                                >
                                    {sportData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Visual legend details */}
                    <div className="flex flex-wrap gap-4 justify-center py-2">
                        {sportData.map((s, i) => (
                            <span key={s.name} className="flex items-center gap-2 text-xs font-semibold text-surface-600">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                <span>{s.name} ({s.value}%)</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Weekly bookings trend line chart */}
            <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft space-y-4">
                <h2 className="text-base font-black text-surface-900 tracking-tight">Weekly Booking Trends</h2>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height={240} minWidth={0}>
                        <LineChart data={bookingTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#64748b', fontWeight: '500' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: '500' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px' }} />
                            <Line type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1' }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft space-y-6">
                <div>
                    <h2 className="text-base font-black text-surface-900 tracking-tight">Peak Occupancy Matrix Heatmap</h2>
                    <p className="text-surface-500 text-xs mt-0.5">Average slot occupancy percentage grouped by weekdays and active hours</p>
                </div>
                <div className="overflow-x-auto pb-4">
                    {heatmapData.length > 0 ? (
                        <HeatmapGrid data={heatmapData} xLabels={heatmapLabels.xLabels} yLabels={heatmapLabels.yLabels} />
                    ) : (
                        <div className="py-8 text-center text-slate-400 text-sm font-semibold">No slot data yet to compute occupancy.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
