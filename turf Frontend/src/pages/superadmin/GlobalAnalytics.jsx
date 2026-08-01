import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ChartCard from '../../components/ui/ChartCard'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { FiTrendingUp, FiDownload, FiCalendar, FiUsers, FiBriefcase, FiMapPin, FiActivity } from 'react-icons/fi'
import {
    getOverview,
    getRevenueAnalytics,
    getSportsAnalytics,
    getUserAnalytics,
    getSubscriptionAnalytics,
    getTopOwners,
    getTopBranches,
    getTopSports,
    downloadReport
} from '../../services/analyticsService'

// Brand-aligned chart palette matching the software's emerald-green primary theme
const COLORS = [
    '#059669', // primary-600 — Emerald Green (brand primary)
    '#6366f1', // accent-500 — Indigo/Violet
    '#06b6d4', // Cyan-500 — Teal
    '#f59e0b', // warning-500 — Amber
    '#f43f5e', // danger-500 — Rose
]

export default function GlobalAnalytics() {
    const { addToast } = useToast()
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    // Enforce SUPER_ADMIN security routing protection
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/login')
            } else {
                const normalizeRole = (r) => (r || '').toUpperCase().replace(/[-_]/g, '');
                const rNorm = normalizeRole(user.role);
                if (rNorm !== 'SUPERADMIN') {
                    const routesMap = {
                        OWNER: '/dashboard/owner',
                        STAFF: '/dashboard/staff',
                        CUSTOMER: '/dashboard/customer'
                    }
                    navigate(routesMap[rNorm] || '/login')
                }
            }
        }
    }, [user, authLoading, navigate])

    // Global Filter states
    const [range, setRange] = useState('LAST_30_DAYS')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Data States
    const [overview, setOverview] = useState({
        totalRevenue: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        revenueGrowthPercentage: 0,
        totalBookings: 0,
        todayBookings: 0,
        monthlyBookings: 0,
        cancelledBookings: 0,
        totalOwners: 0,
        totalStaff: 0,
        totalCustomers: 0,
        newRegistrations: 0,
        totalBranches: 0,
        activeBranches: 0,
        suspendedBranches: 0,
        inactiveBranches: 0
    })
    const [revenueData, setRevenueData] = useState([])
    const [sportsData, setSportsData] = useState([])
    const [userGrowthData, setUserGrowthData] = useState([])
    const [subscriptionData, setSubscriptionData] = useState([])
    const [topOwners, setTopOwners] = useState([])
    const [topBranches, setTopBranches] = useState([])
    const [topSports, setTopSports] = useState([])

    // Loading states
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [isChartLoading, setIsChartLoading] = useState(false)
    const [exportingReport, setExportingReport] = useState({
        revenue: false,
        bookings: false,
        owners: false,
        branches: false
    })

    // Fetch all analytics datasets concurrently using Promise.all()
    const fetchAnalytics = async () => {
        try {
            setIsChartLoading(true)
            const filters = { range, startDate, endDate }

            const [
                overviewRes,
                revenueRes,
                sportsRes,
                usersRes,
                subscriptionsRes,
                topOwnersRes,
                topBranchesRes,
                topSportsRes
            ] = await Promise.all([
                getOverview(filters),
                getRevenueAnalytics(filters),
                getSportsAnalytics(filters),
                getUserAnalytics(filters),
                getSubscriptionAnalytics(filters),
                getTopOwners(filters),
                getTopBranches(filters),
                getTopSports(filters)
            ])

            if (overviewRes.success) setOverview(overviewRes.data)
            
            // Map revenue keys back to match existing recharts 'm' and 'v' properties
            if (revenueRes.success) {
                const mappedRev = (revenueRes.data || []).map(item => {
                    // Extract label month or date cleanly for XAxis representation
                    const dateParts = item.label.split('-');
                    const displayLabel = dateParts.length === 2 
                        ? new Date(dateParts[0], dateParts[1] - 1).toLocaleString('en-IN', { month: 'short' })
                        : item.label;
                    return {
                        m: displayLabel,
                        v: Math.round(item.revenue / 1000) // represented in thousands
                    }
                })
                setRevenueData(mappedRev)
            }

            // Map sports keys back to match Pie chart 'name' and 'value' properties
            if (sportsRes.success) {
                const mappedSports = (sportsRes.data || []).map(item => ({
                    name: item.sport,
                    value: item.bookingsCount,
                    revenue: item.revenue
                }))
                setSportsData(mappedSports)
            }

            // Map user growth keys back for LineChart representation
            if (usersRes.success) {
                const mappedUsers = (usersRes.data || []).map(item => {
                    const dateParts = item.label.split('-');
                    const label = dateParts.length === 3
                        ? `${dateParts[2]}/${dateParts[1]}`
                        : item.label;
                    return {
                        m: label,
                        Owners: item.OWNER || 0,
                        Staff: item.STAFF || 0,
                        Customers: item.CUSTOMER || 0,
                        Total: item.total || 0
                    }
                })
                setUserGrowthData(mappedUsers)
            }

            if (subscriptionsRes.success) setSubscriptionData(subscriptionsRes.data || [])
            if (topOwnersRes.success) setTopOwners(topOwnersRes.data || [])
            if (topBranchesRes.success) setTopBranches(topBranchesRes.data || [])
            if (topSportsRes.success) setTopSports(topSportsRes.data || [])

        } catch (error) {
            console.error('Error loading analytics dataset:', error)
            const errMsg = error.response?.data?.message || 'Failed to retrieve analytics datasets'
            addToast({ title: 'Fetch Error', message: errMsg, type: 'error' })
        } finally {
            setIsChartLoading(false)
            setIsPageLoading(false)
        }
    }

    // Trigger page re-fetch reactively when global filter conditions change
    useEffect(() => {
        if (user && user.role === 'SUPER_ADMIN') {
            // Prevent custom range query if dates are not completely selected
            if (range === 'CUSTOM' && (!startDate || !endDate)) return;
            fetchAnalytics()
        }
    }, [user, range, startDate, endDate])

    // Handler to stream and trigger automatic file downloads from Blob streams
    const handleExport = async (reportType, format) => {
        try {
            setExportingReport(prev => ({ ...prev, [reportType]: true }))
            addToast({ title: 'Exporting', message: `Generating ${format.toUpperCase()} report...`, type: 'info' })
            
            const filters = { range, startDate, endDate }
            const blob = await downloadReport(reportType, format, filters)

            // Dynamic browser anchor simulation to trigger download cleanly
            const url = window.URL.createObjectURL(new Blob([blob]))
            const link = document.createElement('a')
            link.href = url
            
            const fileExt = format === 'excel' ? 'xls' : format
            link.setAttribute('download', `${reportType}-report-${Date.now()}.${fileExt}`)
            
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
            
            addToast({ title: 'Export Success', message: `Successfully downloaded ${reportType} report`, type: 'success' })
        } catch (error) {
            console.error('Export report failed:', error)
            addToast({ title: 'Export Error', message: 'Failed to compile or download report', type: 'error' })
        } finally {
            setExportingReport(prev => ({ ...prev, [reportType]: false }))
        }
    }

    if (authLoading || isPageLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-surface-500 text-sm font-semibold">Preparing analytics commands...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Global Analytics</h1>
                    <p className="text-surface-500 text-sm mt-1">Platform-wide metrics and performance</p>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-surface-200 shadow-soft">
                    <Select
                        value={range}
                        onChange={e => {
                            setRange(e.target.value)
                            if (e.target.value !== 'CUSTOM') {
                                setStartDate('')
                                setEndDate('')
                            }
                        }}
                        options={[
                            { value: 'TODAY', label: 'Today' },
                            { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
                            { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
                            { value: 'LAST_90_DAYS', label: 'Last 90 Days' },
                            { value: 'THIS_YEAR', label: 'This Year' },
                            { value: 'CUSTOM', label: 'Custom Range' }
                        ]}
                        className="w-44"
                    />

                    {range === 'CUSTOM' && (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <Input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-36 py-1 text-xs"
                            />
                            <span className="text-surface-400 text-xs font-semibold">to</span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-36 py-1 text-xs"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Metrics Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    label="Total Revenue" 
                    value={`₹${Number(overview.totalRevenue).toLocaleString('en-IN')}`} 
                    change={`${overview.revenueGrowthPercentage >= 0 ? '+' : ''}${overview.revenueGrowthPercentage}%`} 
                    trend={overview.revenueGrowthPercentage >= 0 ? 'up' : 'down'} 
                    icon="💰" 
                />
                <StatCard 
                    label="Active Bookings" 
                    value={Number(overview.totalBookings).toLocaleString()} 
                    change="Platform Active" 
                    trend="up" 
                    icon="📅" 
                />
                <StatCard 
                    label="Active Branches" 
                    value={overview.activeBranches} 
                    change={`Suspended: ${overview.suspendedBranches}`} 
                    trend="up" 
                    icon="🏢" 
                />
                <StatCard 
                    label="Total Owners" 
                    value={overview.totalOwners} 
                    change={`Customers: ${overview.totalCustomers}`} 
                    trend="up" 
                    icon="👤" 
                />
            </div>

            {/* Charts Loading Wrapper */}
            {isChartLoading ? (
                <Card className="min-h-[400px] flex flex-col items-center justify-center gap-4 py-24">
                    <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-surface-500 text-sm font-semibold">Calculating pipeline aggregates...</span>
                </Card>
            ) : (
                <>
                    {/* Charts Rows */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Revenue Bar Chart */}
                        <ChartCard title="Revenue by Month" subtitle="In thousands (₹)">
                            <ResponsiveContainer width="100%" height={260}>
                                {revenueData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-surface-400 text-sm font-medium">
                                        No billing revenue records in selected date range.
                                    </div>
                                ) : (
                                    <BarChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.12)" />
                                        <XAxis dataKey="m" tick={{ fontSize: 12, fill: '#9098ad' }} />
                                        <YAxis tick={{ fontSize: 12, fill: '#9098ad' }} tickFormatter={v => `₹${v}K`} />
                                        <Tooltip
                                            formatter={v => [`₹${v * 1000}`, 'Revenue']}
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #d1fae5', background: '#f0fdf8', fontSize: 12, fontWeight: 700 }}
                                            itemStyle={{ color: '#059669' }}
                                            labelStyle={{ color: '#047857', fontWeight: 800 }}
                                        />
                                        <Bar dataKey="v" fill="#059669" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </ChartCard>

                        {/* Sports Donut Chart */}
                        <ChartCard title="Sport Popularity" subtitle="Booking distribution per sport">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 h-[260px]">
                                <div className="w-full md:w-3/5 h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {sportsData.length === 0 ? (
                                            <div className="h-full flex items-center justify-center text-surface-400 text-sm font-medium">
                                                No sports bookings found.
                                            </div>
                                        ) : (
                                            <PieChart>
                                                <Pie 
                                                    data={sportsData} 
                                                    cx="50%" 
                                                    cy="50%" 
                                                    innerRadius={55} 
                                                    outerRadius={90} 
                                                    paddingAngle={4} 
                                                    dataKey="value"
                                                >
                                                    {sportsData.map((_, i) => (
                                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={v => [`${v} Bookings`]} />
                                            </PieChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-col gap-2.5 w-full md:w-2/5 justify-center pl-2">
                                    {sportsData.map((s, i) => (
                                        <div key={s.name} className="flex flex-col justify-start">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-surface-700">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                                <span className="truncate max-w-[120px]">{s.name}</span>
                                                <span className="ml-auto text-surface-500 font-bold">{s.value} bookings</span>
                                            </div>
                                            <span className="text-[10px] text-surface-400 font-medium pl-4.5">
                                                Revenue: ₹{Number(s.revenue || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ChartCard>
                    </div>

                    {/* User Growth Line Chart */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <ChartCard title="User growth" subtitle="Registrations over time">
                                <ResponsiveContainer width="100%" height={280}>
                                    {userGrowthData.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-surface-400 text-sm font-medium">
                                            No user growth data in selected range.
                                        </div>
                                    ) : (
                                        <LineChart data={userGrowthData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.12)" />
                                            <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#9098ad' }} />
                                            <YAxis tick={{ fontSize: 11, fill: '#9098ad' }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: '1px solid #d1fae5', background: '#f0fdf8', fontSize: 12, fontWeight: 700 }}
                                                labelStyle={{ color: '#047857', fontWeight: 800 }}
                                            />
                                            <Line type="monotone" name="Owners" dataKey="Owners" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, fill: '#059669' }} activeDot={{ r: 6, fill: '#059669' }} />
                                            <Line type="monotone" name="Staff" dataKey="Staff" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} activeDot={{ r: 5, fill: '#f59e0b' }} />
                                            <Line type="monotone" name="Customers" dataKey="Customers" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6, fill: '#6366f1' }} />
                                        </LineChart>
                                    )}
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>

                        {/* Top lists rankings grid */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            <Card className="border border-surface-200/80 shadow-soft h-[360px] flex flex-col p-5 bg-white/40 backdrop-blur-sm">
                                <div className="flex items-center justify-between border-b border-surface-150 pb-3 mb-3">
                                    <h3 className="text-sm font-bold text-surface-800 flex items-center gap-1.5 uppercase tracking-wider">
                                        <FiActivity className="w-4 h-4 text-primary-500" />
                                        Top Sports by Bookings
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 font-sans">
                                    {topSports.slice(0, 4).map((s, idx) => (
                                        <div key={s.sport} className="flex items-center justify-between p-3 rounded-xl border border-surface-100 hover:border-primary-100 bg-white/60 hover:bg-primary-50/20 transition-all duration-150">
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xs">
                                                    #{idx + 1}
                                                </span>
                                                <div>
                                                    <div className="text-xs font-bold text-surface-800">{s.sport}</div>
                                                    <div className="text-[10px] text-surface-400 font-medium">₹{Number(s.revenue || 0).toLocaleString()} Revenue</div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-primary-600 bg-primary-100/50 px-2.5 py-1 rounded-lg">
                                                {s.bookingsCount} bookings
                                            </span>
                                        </div>
                                    ))}
                                    {topSports.length === 0 && (
                                        <div className="h-full flex items-center justify-center text-surface-400 text-xs font-semibold py-12">
                                            No sports statistics found.
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Subscription plan tables and Top performance metrics row */}
                    <div className="grid lg:grid-cols-3 gap-6 font-sans">
                        {/* Subscription stats */}
                        <Card className="border border-surface-200/80 shadow-soft p-5 bg-white/40 backdrop-blur-sm lg:col-span-1">
                            <h3 className="text-sm font-bold text-surface-800 border-b border-surface-150 pb-3 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
                                <FiBriefcase className="w-4 h-4 text-primary-500" />
                                Subscription Plans Analytics
                            </h3>
                            <div className="space-y-4">
                                {subscriptionData.map(plan => (
                                    <div key={plan.planName} className="p-4 rounded-2xl border border-surface-150 bg-white hover:border-primary-200 transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-surface-800">{plan.planName} Plan</span>
                                            <span className="text-xs font-extrabold text-emerald-600">₹{Number(plan.revenue).toLocaleString()}/mo</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-surface-400 font-medium">
                                            <span>Active Subscriptions</span>
                                            <span className="font-bold text-surface-700">{plan.totalUsers} branches</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Top branches */}
                        <Card className="border border-surface-200/80 shadow-soft p-5 bg-white/40 backdrop-blur-sm lg:col-span-1">
                            <h3 className="text-sm font-bold text-surface-800 border-b border-surface-150 pb-3 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
                                <FiBriefcase className="w-4 h-4 text-emerald-500" />
                                Top Branches by Bookings
                            </h3>
                            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                                {topBranches.map((b, i) => (
                                    <div key={b._id} className="flex items-center justify-between p-3.5 rounded-xl border border-surface-150 bg-white">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                                #{i + 1}
                                            </span>
                                            <div>
                                                <div className="text-xs font-bold text-surface-800 truncate max-w-[140px]">{b.branchName}</div>
                                                <div className="text-[10px] text-surface-400 font-semibold">{b.city} • {b.ownerName || 'N/A'}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-surface-900">{b.bookingsCount} Bookings</div>
                                            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">₹{Number(b.revenue || 0).toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                                {topBranches.length === 0 && (
                                    <div className="text-center text-surface-400 py-12 text-xs font-semibold">No branches matching data.</div>
                                )}
                            </div>
                        </Card>

                        {/* Top Owners */}
                        <Card className="border border-surface-200/80 shadow-soft p-5 bg-white/40 backdrop-blur-sm lg:col-span-1">
                            <h3 className="text-sm font-bold text-surface-800 border-b border-surface-150 pb-3 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
                                <FiUsers className="w-4 h-4 text-indigo-500" />
                                Top Owners by Revenue
                            </h3>
                            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                                {topOwners.map((o, i) => (
                                    <div key={o._id} className="flex items-center justify-between p-3.5 rounded-xl border border-surface-150 bg-white">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                #{i + 1}
                                            </span>
                                            <div>
                                                <div className="text-xs font-bold text-surface-800 truncate max-w-[140px]">{o.fullName}</div>
                                                <div className="text-[10px] text-surface-400 font-semibold">{o.branchesCount} active branches</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-extrabold text-surface-900">₹{Number(o.revenue || 0).toLocaleString()}</div>
                                            <div className="text-[10px] text-surface-400 font-medium mt-0.5">Revenue Earned</div>
                                        </div>
                                    </div>
                                ))}
                                {topOwners.length === 0 && (
                                    <div className="text-center text-surface-400 py-12 text-xs font-semibold">No owners matching data.</div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Report Export downloads grid section */}
                    <Card className="border border-surface-200/80 shadow-soft p-6 bg-white/40 backdrop-blur-sm font-sans">
                        <div className="border-b border-surface-150 pb-3.5 mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-surface-800 uppercase tracking-wider">Export PDF & Data Reports</h3>
                                <p className="text-[11px] text-surface-400 font-semibold mt-0.5">Download styled summaries dynamically with selected date filters</p>
                            </div>
                            <FiDownload className="w-5 h-5 text-primary-500 shrink-0" />
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {/* Revenue Exports */}
                            <div className="p-4.5 rounded-2xl border border-surface-150 bg-white flex flex-col justify-between h-44 shadow-sm hover:border-primary-100 transition-colors">
                                <div>
                                    <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Financials</span>
                                    <h4 className="text-xs font-bold text-surface-800 mt-1">Revenue Performance</h4>
                                    <p className="text-[10px] text-surface-400 font-semibold mt-1">Payments billing streams and transaction listings</p>
                                </div>
                                <div className="flex gap-1.5 mt-4">
                                    <Button size="xs" variant="secondary" onClick={() => handleExport('revenue', 'pdf')} disabled={exportingReport.revenue}>PDF</Button>
                                    <Button size="xs" variant="secondary" onClick={() => handleExport('revenue', 'excel')} disabled={exportingReport.revenue}>Excel</Button>
                                    <Button size="xs" variant="secondary" onClick={() => handleExport('revenue', 'csv')} disabled={exportingReport.revenue}>CSV</Button>
                                </div>
                            </div>

                            {/* Bookings Exports */}
                            <div className="p-4.5 rounded-2xl border border-surface-150 bg-white flex flex-col justify-between h-44 shadow-sm hover:border-primary-100 transition-colors">
                                <div>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Scheduling</span>
                                    <h4 className="text-xs font-bold text-surface-800 mt-1">Bookings Registry</h4>
                                    <p className="text-[10px] text-surface-400 font-semibold mt-1">Time slots, court schedules and user statuses</p>
                                </div>
                                <div className="flex gap-1.5 mt-4">
                                    <Button size="xs" variant="secondary" onClick={() => handleExport('bookings', 'pdf')} disabled={exportingReport.bookings}>PDF</Button>
                                    <Button size="xs" variant="secondary" onClick={() => handleExport('bookings', 'excel')} disabled={exportingReport.bookings}>Excel</Button>
                                    <Button size="xs" variant="secondary" onClick={() => handleExport('bookings', 'csv')} disabled={exportingReport.bookings}>CSV</Button>
                                </div>
                            </div>

                            {/* Owners Exports */}
                            <div className="p-4.5 rounded-2xl border border-surface-150 bg-white flex flex-col justify-between h-44 shadow-sm hover:border-primary-100 transition-colors">
                                <div>
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Partners</span>
                                    <h4 className="text-xs font-bold text-surface-800 mt-1">Owners Registry</h4>
                                    <p className="text-[10px] text-surface-400 font-semibold mt-1">Active turf owners list with branch counters</p>
                                </div>
                                <div className="flex gap-1.5 mt-4">
                                    <Button size="xs" variant="secondary" onClick={() => handleExport('owners', 'pdf')} disabled={exportingReport.owners}>PDF</Button>
                                    <Button size="xs" variant="secondary" onClick={() => handleExport('owners', 'excel')} disabled={exportingReport.owners}>Excel</Button>
                                    <Button size="xs" variant="secondary" onClick={() => handleExport('owners', 'csv')} disabled={exportingReport.owners}>CSV</Button>
                                </div>
                            </div>

                            {/* Branches Exports */}
                            <div className="p-4.5 rounded-2xl border border-surface-150 bg-white flex flex-col justify-between h-44 shadow-sm hover:border-primary-100 transition-colors">
                                <div>
                                    <span className="text-[10px] font-bold text-warning-600 uppercase tracking-widest">Facilities</span>
                                    <h4 className="text-xs font-bold text-surface-800 mt-1">Branches Performance</h4>
                                    <p className="text-[10px] text-surface-400 font-semibold mt-1">Branch revenues, metrics, and plan listings</p>
                                </div>
                                <div className="flex gap-1.5 mt-4">
                                    <Button size="xs" variant="secondary" onClick={() => handleExport('branches', 'pdf')} disabled={exportingReport.branches}>PDF</Button>
                                    <Button size="xs" variant="secondary" onClick={() => handleExport('branches', 'excel')} disabled={exportingReport.branches}>Excel</Button>
                                    <Button size="xs" variant="secondary" onClick={() => handleExport('branches', 'csv')} disabled={exportingReport.branches}>CSV</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </>
            )}
        </div>
    )
}
