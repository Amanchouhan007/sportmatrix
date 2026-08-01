import { useState } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { HiLightningBolt, HiTrendingUp, HiUsers, HiCurrencyRupee, HiCalendar, HiClock } from 'react-icons/hi'

const peakData = [
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

const bookings = [
    { id: '1', time: '10:00 AM', customer: 'Rahul K.', sport: 'Cricket', court: 'Turf A', amount: '₹800', status: 'Confirmed' },
    { id: '2', time: '11:30 AM', customer: 'Priya S.', sport: 'Football', court: 'Turf B', amount: '₹900', status: 'Confirmed' },
    { id: '3', time: '02:00 PM', customer: 'Arjun M.', sport: 'Badminton', court: 'Court 1', amount: '₹400', status: 'Pending' },
    { id: '4', time: '04:30 PM', customer: 'Sneha R.', sport: 'Cricket', court: 'Turf A', amount: '₹1,200', status: 'Confirmed' },
]

const columns = [
    { key: 'time', label: 'Time' },
    { key: 'customer', label: 'Customer' },
    { key: 'sport', label: 'Sport' },
    { key: 'court', label: 'Court' },
    { key: 'amount', label: 'Amount' },
    {
        key: 'status',
        label: 'Status',
        render: v => (
            <Badge variant={v === 'Confirmed' ? 'success' : 'warning'} dot>
                {v}
            </Badge>
        )
    },
]

export default function OwnerDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Real-time Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
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
                {/* Revenue Card */}
                <Card variant="glass" hover className="p-6 fade-up delay-75">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Today's Revenue</p>
                            <h3 className="text-3xl font-extrabold text-surface-900 tracking-tight">₹12,400</h3>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500">
                                <HiTrendingUp /> +18% Today
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white text-xl shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                            <HiCurrencyRupee className="w-6 h-6" />
                        </div>
                    </div>
                </Card>



                {/* Bookings Card */}
                <Card variant="glass" hover className="p-6 fade-up delay-100">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Today's Bookings</p>
                            <h3 className="text-3xl font-extrabold text-surface-900 tracking-tight">18</h3>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500">
                                <HiTrendingUp /> +3 Scheduled
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                            <HiCalendar className="w-6 h-6" />
                        </div>
                    </div>

                </Card>
                {/* Active Matches Card */}
                <Card variant="glass" hover className="p-6 fade-up delay-150">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Active Matches</p>
                            <h3 className="text-3xl font-extrabold text-surface-900 tracking-tight">3</h3>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-500">
                                Active matches live
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <HiUsers className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                {/* Upcoming Tournaments */}
                <Card variant="glass" hover className="p-6 fade-up delay-200">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Upcoming Events</p>
                            <h3 className="text-3xl font-extrabold text-surface-900 tracking-tight">2</h3>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-500">
                                Next cup in 3 days
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-xl shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                            <span>🏆</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Peak Hour Occupancy Graph */}
            <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-black text-surface-900 tracking-tight">Peak Occupancy Analysis</h2>
                        <p className="text-surface-500 text-xs mt-0.5">Hourly court utilization tracking</p>
                    </div>
                    <Badge variant="primary">Realtime Status</Badge>
                </div>

                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={peakData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

            {/* Today's Bookings */}
            <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-black text-surface-900 tracking-tight">Today&apos;s Bookings</h2>
                        <p className="text-surface-500 text-xs mt-0.5">Scheduled slots for match days</p>
                    </div>
                </div>
                <DataTable columns={columns} data={bookings} />
            </div>
        </div>
    )
}
