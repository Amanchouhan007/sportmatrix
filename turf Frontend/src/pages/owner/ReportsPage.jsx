import { useState } from 'react'
import ChartCard from '../../components/ui/ChartCard'
import HeatmapGrid from '../../components/ui/HeatmapGrid'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { HiDownload, HiChartBar, HiTrendingUp, HiCalendar } from 'react-icons/hi'

const revenueData = [
    { m: 'Mon', v: 8200 }, 
    { m: 'Tue', v: 6800 }, 
    { m: 'Wed', v: 9400 }, 
    { m: 'Thu', v: 7600 }, 
    { m: 'Fri', v: 11200 }, 
    { m: 'Sat', v: 15800 }, 
    { m: 'Sun', v: 14600 }
]

const sportData = [
    { name: 'Cricket', value: 40 }, 
    { name: 'Football', value: 25 }, 
    { name: 'Badminton', value: 20 }, 
    { name: 'Tennis', value: 10 }, 
    { name: 'Esports', value: 5 }
]

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#a855f7']

const bookingTrend = [
    { m: 'W1', v: 120 }, 
    { m: 'W2', v: 145 }, 
    { m: 'W3', v: 132 }, 
    { m: 'W4', v: 168 }, 
    { m: 'W5', v: 155 }, 
    { m: 'W6', v: 190 }
]

const heatmapData = [
    [20, 45, 60, 40, 30, 80, 90, 85, 60, 40], 
    [30, 50, 55, 45, 35, 75, 95, 88, 55, 35], 
    [25, 40, 50, 38, 28, 70, 85, 80, 50, 30],
    [35, 55, 65, 48, 40, 85, 98, 92, 65, 45], 
    [40, 60, 70, 55, 50, 90, 100, 95, 70, 50], 
    [45, 65, 75, 60, 55, 92, 98, 90, 65, 45], 
    [30, 50, 60, 42, 35, 82, 90, 85, 55, 38],
]

const xLabels = ['6AM', '7AM', '8AM', '9AM', '10AM', '4PM', '5PM', '6PM', '7PM', '8PM']
const yLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function ReportsPage() {
    const { addToast } = useToast()
    const [dateRange, setDateRange] = useState('This Week')

    const handleExport = (format) => {
        addToast({ title: 'Export Started', message: `Downloading ledger report in ${format} format...`, type: 'success' })
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
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
                <Badge variant="primary">Updated 2m ago</Badge>
            </div>

            {/* Recharts grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Daily Revenue Chart */}
                <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft space-y-4">
                    <h2 className="text-base font-black text-surface-900 tracking-tight">Daily Revenue Metrics</h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
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
                        <ResponsiveContainer width="100%" height="100%">
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
                    <ResponsiveContainer width="100%" height="100%">
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
                    <HeatmapGrid data={heatmapData} xLabels={xLabels} yLabels={yLabels} />
                </div>
            </div>
        </div>
    )
}
