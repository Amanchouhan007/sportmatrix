import { useState, useEffect } from 'react'
import { useNavigate } from 'react'
import Input from '../../components/ui/Input'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    LineChart, 
    Line 
} from 'recharts'
import { 
    FiTrendingUp, 
    FiDownload, 
    FiCalendar, 
    FiUsers, 
    FiBriefcase, 
    FiMapPin, 
    FiActivity,
    FiDollarSign,
    FiFileText,
    FiChevronDown,
    FiCheck
} from 'react-icons/fi'
import { HiArrowUpRight } from 'react-icons/hi2'
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

const COLORS = [
    '#22C55E', // Primary Emerald
    '#6366F1', // Indigo Accent
    '#06B6D4', // Cyan Teal
    '#F59E0B', // Amber
    '#EC4899', // Pink
]

const RANGE_OPTIONS = [
    { value: 'TODAY', label: 'Today' },
    { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
    { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { value: 'LAST_90_DAYS', label: 'Last 90 Days' },
    { value: 'THIS_YEAR', label: 'This Year' },
    { value: 'CUSTOM', label: 'Custom Range' }
]

const RenderEmptyState = ({ icon, title, message }) => (
    <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/80">
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-xl text-slate-400 mb-2">
            {icon}
        </div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{title}</h4>
        <p className="text-xs font-medium text-slate-400 max-w-xs mt-1 leading-relaxed">{message}</p>
    </div>
);

export default function GlobalAnalytics() {
    const { addToast } = useToast()
    const { user, loading: authLoading } = useAuth()

    // Global Filter states
    const [range, setRange] = useState('LAST_30_DAYS')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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

            const ovData = overviewRes?.data || (overviewRes?.totalRevenue !== undefined ? overviewRes : null);
            if (ovData) {
                setOverview(ovData);
            }

            const rawRev = revenueRes?.data || (Array.isArray(revenueRes) ? revenueRes : []);
            if (Array.isArray(rawRev)) {
                const mappedRev = rawRev.map(item => {
                    const label = item.Month || item.month || item.label || 'Jan';
                    const revenue = Number(item.Revenue ?? item.revenue ?? item.total ?? 0);
                    return {
                        m: label,
                        v: Math.round(revenue / 1000)
                    };
                });
                setRevenueData(mappedRev);
            }

            const rawSports = sportsRes?.data || (Array.isArray(sportsRes) ? sportsRes : []);
            if (Array.isArray(rawSports)) {
                const mappedSports = rawSports
                    .filter(item => (item.sport || item.name || '').toLowerCase() === 'cricket')
                    .map(item => ({
                        name: item.sport || item.name || 'Cricket',
                        value: Number(item.bookingsCount ?? item.bookings ?? item.share ?? 0),
                        revenue: Number(item.revenue ?? item.total_revenue ?? 0)
                    }));
                setSportsData(mappedSports);
            }

            const rawUsers = usersRes?.data || (Array.isArray(usersRes) ? usersRes : []);
            if (Array.isArray(rawUsers)) {
                const mappedUsers = rawUsers.map(item => ({
                    m: item.label || item.month || 'Month',
                    Owners: Number(item.OWNER || item.owners || 0),
                    Staff: Number(item.STAFF || item.staff || 0),
                    Customers: Number(item.CUSTOMER || item.customers || 0),
                    Total: Number(item.total || 0)
                }));
                setUserGrowthData(mappedUsers);
            }

            const rawSubs = subscriptionsRes?.data || (Array.isArray(subscriptionsRes) ? subscriptionsRes : []);
            setSubscriptionData(rawSubs);

            const rawOwners = topOwnersRes?.data || (Array.isArray(topOwnersRes) ? topOwnersRes : []);
            if (Array.isArray(rawOwners)) {
                const mappedOwners = rawOwners.map(o => ({
                    _id: o._id || o.id || Math.random().toString(),
                    fullName: o.fullName || o.ownerName || o.businessName || 'Owner',
                    branchesCount: Number(o.branchesCount ?? o.branches ?? 1),
                    revenue: Number(o.revenue ?? 0)
                }));
                setTopOwners(mappedOwners);
            }

            const rawBranches = topBranchesRes?.data || (Array.isArray(topBranchesRes) ? topBranchesRes : []);
            if (Array.isArray(rawBranches)) {
                const mappedBranches = rawBranches.map(b => ({
                    _id: b._id || b.id || Math.random().toString(),
                    branchName: b.branchName || b['Branch Name'] || 'Branch',
                    city: b.city || b.City || 'Location',
                    ownerName: b.ownerName || 'Owner',
                    bookingsCount: Number(b.bookingsCount ?? b.bookings ?? b.Bookings ?? 0),
                    revenue: Number(b.revenue ?? b.Revenue ?? 0)
                }));
                setTopBranches(mappedBranches);
            }

            const rawTopSports = topSportsRes?.data || (Array.isArray(topSportsRes) ? topSportsRes : []);
            if (Array.isArray(rawTopSports)) {
                const mappedTopSports = rawTopSports
                    .filter(s => (s.sport || s.name || '').toLowerCase() === 'cricket')
                    .map(s => ({
                        sport: s.sport || s.name || 'Cricket',
                        bookingsCount: Number(s.bookingsCount ?? s.bookings ?? 0),
                        revenue: Number(s.revenue ?? s.total_revenue ?? 0)
                    }));
                setTopSports(mappedTopSports);
            }

        } catch (error) {
            console.error('Error loading analytics dataset:', error)
            const errMsg = error.response?.data?.message || 'Failed to retrieve analytics datasets'
            addToast({ title: 'Fetch Error', message: errMsg, type: 'error' })
        } finally {
            setIsChartLoading(false)
            setIsPageLoading(false)
        }
    }

    useEffect(() => {
        if (range === 'CUSTOM' && (!startDate || !endDate)) return;
        fetchAnalytics()
    }, [range, startDate, endDate])

    const handleExport = async (reportType, format) => {
        try {
            setExportingReport(prev => ({ ...prev, [reportType]: true }))
            addToast({ title: 'Exporting', message: `Generating ${format.toUpperCase()} report...`, type: 'info' })
            
            const filters = { range, startDate, endDate }
            const blob = await downloadReport(reportType, format, filters)

            const url = window.URL.createObjectURL(new Blob([blob]))
            const link = document.createElement('a')
            link.href = url
            
            const fileExt = format === 'excel' ? 'xls' : format
            link.setAttribute('download', `${reportType}-report-${Date.now()}.${fileExt}`)
            
            document.body.appendChild(link)
            link.click()
            
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            addToast({ title: 'Export Success', message: `${reportType.toUpperCase()} report downloaded.`, type: 'success' })
        } catch (err) {
            console.error('Export report error:', err)
            addToast({ title: 'Export Failed', message: err.message || 'Failed to download report', type: 'error' })
        } finally {
            setExportingReport(prev => ({ ...prev, [reportType]: false }))
        }
    }

    if (authLoading || isPageLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Preparing analytics commands...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header with Glassmorphism & Custom Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-[24px] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Global Analytics
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 mt-1">Platform-wide metrics and performance</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Timeframe Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer transition-all"
                        >
                            <FiCalendar className="w-4 h-4 text-[#16A34A]" />
                            <span>{RANGE_OPTIONS.find(o => o.value === range)?.label || 'Last 30 Days'}</span>
                            <FiChevronDown className="w-4 h-4 text-slate-400" />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-150 shadow-xl z-50 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                {RANGE_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            setRange(opt.value)
                                            setIsDropdownOpen(false)
                                        }}
                                        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                            range === opt.value ? 'bg-emerald-50 text-[#16A34A]' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {opt.label}
                                        {range === opt.value && <FiCheck className="w-4 h-4 text-[#16A34A]" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {range === 'CUSTOM' && (
                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-2xl border border-slate-200/90 shadow-2xs animate-fade-in">
                            <CustomDatePicker
                                value={startDate}
                                onChange={val => setStartDate(val)}
                                placeholder="Start Date"
                                align="left"
                            />
                            <span className="text-slate-400 text-xs font-bold">to</span>
                            <CustomDatePicker
                                value={endDate}
                                onChange={val => setEndDate(val)}
                                placeholder="End Date"
                                align="right"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* 4 Glassmorphism KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div 
                    style={{
                        background: 'rgba(255, 255, 255, 0.82)',
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                        border: '1px solid rgba(255, 255, 255, 0.7)'
                    }}
                    className="rounded-[24px] shadow-[0_18px_45px_rgba(15,23,42,0.08)] hover:shadow-[0_25px_50px_rgba(34,197,94,0.12)] border-t-2 border-[#16A34A] p-6 h-[120px] flex flex-col justify-between hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                        <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#16A34A] flex items-center justify-center text-base shadow-2xs group-hover:bg-[#16A34A] group-hover:text-white transition-all">
                            💰
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-[36px] font-black text-slate-900 leading-none tracking-tight">
                            ₹{Number(overview.totalRevenue).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-extrabold text-[#16A34A] bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-0.5">
                            {overview.revenueGrowthPercentage >= 0 ? '+' : ''}{overview.revenueGrowthPercentage}%
                            <HiArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                    </div>
                </div>

                <div 
                    style={{
                        background: 'rgba(255, 255, 255, 0.82)',
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                        border: '1px solid rgba(255, 255, 255, 0.7)'
                    }}
                    className="rounded-[24px] shadow-[0_18px_45px_rgba(15,23,42,0.08)] hover:shadow-[0_25px_50px_rgba(99,102,241,0.12)] border-t-2 border-indigo-500 p-6 h-[120px] flex flex-col justify-between hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Bookings</span>
                        <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            📅
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-[36px] font-black text-slate-900 leading-none tracking-tight">
                            {Number(overview.totalBookings).toLocaleString()}
                        </span>
                        <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                            Platform Active
                        </span>
                    </div>
                </div>

                <div 
                    style={{
                        background: 'rgba(255, 255, 255, 0.82)',
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                        border: '1px solid rgba(255, 255, 255, 0.7)'
                    }}
                    className="rounded-[24px] shadow-[0_18px_45px_rgba(15,23,42,0.08)] hover:shadow-[0_25px_50px_rgba(6,182,212,0.12)] border-t-2 border-cyan-500 p-6 h-[120px] flex flex-col justify-between hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Turfs</span>
                        <div className="w-9 h-9 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-base shadow-2xs group-hover:bg-cyan-600 group-hover:text-white transition-all">
                            🏟️
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-[36px] font-black text-slate-900 leading-none tracking-tight">
                            {overview.activeBranches}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                            Suspended: {overview.suspendedBranches}
                        </span>
                    </div>
                </div>

                <div 
                    style={{
                        background: 'rgba(255, 255, 255, 0.82)',
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                        border: '1px solid rgba(255, 255, 255, 0.7)'
                    }}
                    className="rounded-[24px] shadow-[0_18px_45px_rgba(15,23,42,0.08)] hover:shadow-[0_25px_50px_rgba(245,158,11,0.12)] border-t-2 border-amber-500 p-6 h-[120px] flex flex-col justify-between hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Admin</span>
                        <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-base shadow-2xs group-hover:bg-amber-600 group-hover:text-white transition-all">
                            👤
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-[36px] font-black text-slate-900 leading-none tracking-tight">
                            {overview.totalOwners}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                            Customers: {overview.totalCustomers}
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Section Container */}
            {isChartLoading ? (
                <div className="bg-white/85 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] min-h-[400px] flex flex-col items-center justify-center gap-4 py-24">
                    <div className="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Calculating pipeline aggregates...</span>
                </div>
            ) : (
                <>
                    {/* Charts Row 1: Revenue Bar Chart & Sports Donut */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Revenue Bar Chart Card */}
                        <div className="bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] p-7 space-y-6 flex flex-col">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Revenue by Month</h3>
                                    <p className="text-xs font-semibold text-slate-500 mt-0.5">In thousands (₹)</p>
                                </div>
                            </div>
                            <div className="h-[280px] w-full">
                                {revenueData.length === 0 ? (
                                    <RenderEmptyState 
                                        icon="📈" 
                                        title="No Revenue Records" 
                                        message="No billing revenue records logged in selected date range." 
                                    />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.08)" vertical={false} />
                                            <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} tickFormatter={v => `₹${v}K`} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                formatter={v => [`₹${(v * 1000).toLocaleString()}`, 'Revenue']}
                                                contentStyle={{ 
                                                    borderRadius: '16px', 
                                                    border: 'none', 
                                                    background: '#0F172A', 
                                                    color: '#FFFFFF',
                                                    fontSize: 12, 
                                                    fontWeight: 700,
                                                    boxShadow: '0 20px 40px rgba(0,0,0,0.25)' 
                                                }}
                                                itemStyle={{ color: '#22C55E' }}
                                                labelStyle={{ color: '#94A3B8', fontWeight: 800 }}
                                            />
                                            <Bar dataKey="v" fill="#22C55E" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Sports Donut Chart Card */}
                        <div className="bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] p-7 space-y-6 flex flex-col">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Sport Popularity</h3>
                                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Booking distribution per sport</p>
                                </div>
                            </div>
                            <div className="h-[280px] w-full">
                                {sportsData.length === 0 ? (
                                    <RenderEmptyState 
                                        icon="⚽" 
                                        title="No Sports Bookings" 
                                        message="No sports booking distribution logged in selected date range." 
                                    />
                                ) : (
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 h-full">
                                        <div className="w-full md:w-3/5 h-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie 
                                                        data={sportsData} 
                                                        cx="50%" 
                                                        cy="50%" 
                                                        innerRadius={60} 
                                                        outerRadius={95} 
                                                        paddingAngle={5} 
                                                        dataKey="value"
                                                    >
                                                        {sportsData.map((_, i) => (
                                                            <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={4} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        formatter={v => [`${v} Bookings`]} 
                                                        contentStyle={{ 
                                                            borderRadius: '16px', 
                                                            border: 'none', 
                                                            background: '#0F172A', 
                                                            color: '#FFFFFF',
                                                            fontSize: 12, 
                                                            fontWeight: 700 
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex flex-col gap-3 w-full md:w-2/5 justify-center">
                                            {sportsData.map((s, i) => (
                                                <div key={s.name} className="flex flex-col justify-start bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                                        <span className="truncate">{s.name}</span>
                                                        <span className="ml-auto font-black text-slate-900">{s.value}</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-semibold pl-4.5 mt-0.5">
                                                        Revenue: ₹{Number(s.revenue || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 2: User Growth Line & Top Sports Rankings */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* User Growth Line Chart */}
                        <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] p-7 space-y-6 flex flex-col">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">User Growth</h3>
                                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Registrations over time</p>
                                </div>
                            </div>
                            <div className="h-[280px] w-full">
                                {userGrowthData.length === 0 ? (
                                    <RenderEmptyState 
                                        icon="👥" 
                                        title="No User Growth Data" 
                                        message="No user registrations recorded in selected date range." 
                                    />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={userGrowthData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.08)" vertical={false} />
                                            <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ 
                                                    borderRadius: '16px', 
                                                    border: 'none', 
                                                    background: '#0F172A', 
                                                    color: '#FFFFFF',
                                                    fontSize: 12, 
                                                    fontWeight: 700 
                                                }}
                                            />
                                            <Line type="monotone" name="Owners" dataKey="Owners" stroke="#22C55E" strokeWidth={3} dot={{ r: 4, fill: '#22C55E' }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" name="Staff" dataKey="Staff" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3, fill: '#F59E0B' }} activeDot={{ r: 5 }} />
                                            <Line type="monotone" name="Customers" dataKey="Customers" stroke="#6366F1" strokeWidth={3} dot={{ r: 4, fill: '#6366F1' }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Top Sports Rankings Card */}
                        <div className="lg:col-span-1 bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] p-6 flex flex-col justify-between">
                            <div className="h-full flex flex-col">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                        <FiActivity className="w-4 h-4 text-[#16A34A]" />
                                        Top Sports by Bookings
                                    </h3>
                                </div>
                                <div className="space-y-3 flex-1 flex flex-col justify-center">
                                    {topSports.length === 0 ? (
                                        <RenderEmptyState 
                                            icon="🏆" 
                                            title="No Ranked Sports" 
                                            message="No sports booking statistics available." 
                                        />
                                    ) : (
                                        topSports.slice(0, 4).map((s, idx) => (
                                            <div key={s.sport} className="min-h-[60px] p-3.5 rounded-[22px] border border-slate-100 bg-white/90 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all duration-200 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 text-white text-xs font-black flex items-center justify-center shadow-xs">
                                                        #{idx + 1}
                                                    </span>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-900">{s.sport}</div>
                                                        <div className="text-[10px] text-slate-400 font-semibold">₹{Number(s.revenue || 0).toLocaleString()} Revenue</div>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-[#16A34A] bg-emerald-100/70 px-3 py-1 rounded-full">
                                                    {s.bookingsCount} bookings
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rankings Row 3: Subscriptions, Top Branches, Top Owners */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Subscription Plans Analytics */}
                        <div className="bg-white/90 backdrop-blur-md rounded-[22px] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] p-5 flex flex-col justify-between">
                            <div className="h-full flex flex-col">
                                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <FiBriefcase className="w-4 h-4 text-[#16A34A]" />
                                    Subscription Plans Analytics
                                </h3>
                                <div className="space-y-3.5 flex-1 flex flex-col justify-center">
                                    {subscriptionData.filter(plan => Number(plan.totalUsers || plan.count) > 0).length === 0 ? (
                                        <RenderEmptyState 
                                            icon="💼" 
                                            title="No Active Subscriptions" 
                                            message="No active subscription plan records found." 
                                        />
                                    ) : (
                                        subscriptionData.filter(plan => Number(plan.totalUsers || plan.count) > 0).map(plan => (
                                            <div key={plan.planName} className="p-4 rounded-2xl border border-slate-150 bg-white/90 hover:border-emerald-200 transition-all duration-200">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-slate-900">{plan.planName.endsWith('Plan') ? plan.planName : `${plan.planName} Plan`}</span>
                                                    <span className="text-xs font-black text-[#16A34A]">
                                                        ₹{Number(plan.revenue || plan.price || 0).toLocaleString()}/mo
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                                                    <span>Active Subscriptions</span>
                                                    <span className="font-bold text-slate-700">{plan.totalUsers} branches</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Branches */}
                        <div className="bg-white/90 backdrop-blur-md rounded-[22px] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] p-5 flex flex-col justify-between">
                            <div className="h-full flex flex-col">
                                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <FiMapPin className="w-4 h-4 text-emerald-600" />
                                    Top Branches by Bookings
                                </h3>
                                <div className="space-y-3 flex-1 flex flex-col justify-center max-h-[300px] overflow-y-auto pr-1">
                                    {topBranches.length === 0 ? (
                                        <RenderEmptyState 
                                            icon="📍" 
                                            title="No Top Branches" 
                                            message="No branch booking statistics matching selected criteria." 
                                        />
                                    ) : (
                                        topBranches.map((b, i) => (
                                            <div key={b._id} className="min-h-[60px] p-3.5 rounded-[22px] border border-slate-100 bg-white/90 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all duration-200 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 text-white text-xs font-black flex items-center justify-center shadow-xs">
                                                        #{i + 1}
                                                    </span>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">{b.branchName}</div>
                                                        <div className="text-[10px] text-slate-400 font-semibold">{b.city} • {b.ownerName || 'N/A'}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-bold text-slate-900">{b.bookingsCount} Bookings</div>
                                                    <div className="text-[10px] text-[#16A34A] font-bold mt-0.5">₹{Number(b.revenue || 0).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Owners */}
                        <div className="bg-white/90 backdrop-blur-md rounded-[22px] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] p-5 flex flex-col justify-between">
                            <div className="h-full flex flex-col">
                                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <FiUsers className="w-4 h-4 text-indigo-600" />
                                    Top Owners by Revenue
                                </h3>
                                <div className="space-y-3 flex-1 flex flex-col justify-center max-h-[300px] overflow-y-auto pr-1">
                                    {topOwners.length === 0 ? (
                                        <RenderEmptyState 
                                            icon="👤" 
                                            title="No Top Owners" 
                                            message="No owner revenue rankings matching selected criteria." 
                                        />
                                    ) : (
                                        topOwners.map((o, i) => (
                                            <div key={o._id} className="min-h-[60px] p-3.5 rounded-[22px] border border-slate-100 bg-white/90 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all duration-200 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-xs font-black flex items-center justify-center shadow-xs">
                                                        #{i + 1}
                                                    </span>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">{o.fullName}</div>
                                                        <div className="text-[10px] text-slate-400 font-semibold">{o.branchesCount} active branches</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-black text-slate-900">₹{Number(o.revenue || 0).toLocaleString()}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">Revenue Earned</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Report Export Downloads Section */}
                    <div className="bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] p-6 space-y-5">
                        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Export PDF & Data Reports</h3>
                                <p className="text-xs text-slate-400 font-semibold mt-0.5">Download styled summaries dynamically with selected date filters</p>
                            </div>
                            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                                <FiDownload className="w-5 h-5" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {/* Revenue Exports */}
                            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white flex flex-col justify-between h-44 shadow-2xs hover:border-[#16A34A]/50 transition-all duration-200">
                                <div>
                                    <span className="text-[10px] font-black text-[#16A34A] uppercase tracking-widest">Financials</span>
                                    <h4 className="text-xs font-bold text-slate-900 mt-1">Revenue Performance</h4>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Payments billing streams and transaction listings</p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => handleExport('revenue', 'pdf')} disabled={exportingReport.revenue} className="flex-1 py-1.5 rounded-xl border border-slate-200 text-[10px] font-extrabold text-slate-700 hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] transition-all cursor-pointer">PDF</button>
                                    <button onClick={() => handleExport('revenue', 'excel')} disabled={exportingReport.revenue} className="flex-1 py-1.5 rounded-xl border border-slate-200 text-[10px] font-extrabold text-slate-700 hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] transition-all cursor-pointer">Excel</button>
                                    <button onClick={() => handleExport('revenue', 'csv')} disabled={exportingReport.revenue} className="flex-1 py-1.5 rounded-xl border border-slate-200 text-[10px] font-extrabold text-slate-700 hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] transition-all cursor-pointer">CSV</button>
                                </div>
                            </div>

                            {/* Bookings Exports */}
                            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white flex flex-col justify-between h-44 shadow-2xs hover:border-[#16A34A]/50 transition-all duration-200">
                                <div>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Scheduling</span>
                                    <h4 className="text-xs font-bold text-slate-900 mt-1">Bookings Registry</h4>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Time slots, court schedules and user statuses</p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => handleExport('bookings', 'pdf')} disabled={exportingReport.bookings} className="flex-1 py-1.5 rounded-xl border border-slate-200 text-[10px] font-extrabold text-slate-700 hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] transition-all cursor-pointer">PDF</button>
                                    <button onClick={() => handleExport('bookings', 'excel')} disabled={exportingReport.bookings} className="flex-1 py-1.5 rounded-xl border border-slate-200 text-[10px] font-extrabold text-slate-700 hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] transition-all cursor-pointer">Excel</button>
                                    <button onClick={() => handleExport('bookings', 'csv')} disabled={exportingReport.bookings} className="flex-1 py-1.5 rounded-xl border border-slate-200 text-[10px] font-extrabold text-slate-700 hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] transition-all cursor-pointer">CSV</button>
                                </div>
                            </div>

                            {/* Owners Exports */}
                            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white flex flex-col justify-between h-44 shadow-2xs hover:border-[#16A34A]/50 transition-all duration-200">
                                <div>
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Partners</span>
                                    <h4 className="text-xs font-bold text-slate-900 mt-1">Owners Registry</h4>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Active turf owners list with branch counters</p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => handleExport('owners', 'pdf')} disabled={exportingReport.owners} className="flex-1 py-1.5 rounded-xl border border-slate-200 text-[10px] font-extrabold text-slate-700 hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] transition-all cursor-pointer">PDF</button>
                                    <button onClick={() => handleExport('owners', 'excel')} disabled={exportingReport.owners} className="flex-1 py-1.5 rounded-xl border border-slate-200 text-[10px] font-extrabold text-slate-700 hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] transition-all cursor-pointer">Excel</button>
                                    <button onClick={() => handleExport('owners', 'csv')} disabled={exportingReport.owners} className="flex-1 py-1.5 rounded-xl border border-slate-200 text-[10px] font-extrabold text-slate-700 hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] transition-all cursor-pointer">CSV</button>
                                </div>
                            </div>

                            {/* Branches Exports */}
                            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white flex flex-col justify-between h-44 shadow-2xs hover:border-[#16A34A]/50 transition-all duration-200">
                                <div>
                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Facilities</span>
                                    <h4 className="text-xs font-bold text-slate-900 mt-1">Branches Performance</h4>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Branch revenues, metrics, and plan listings</p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => handleExport('branches', 'pdf')} disabled={exportingReport.branches} className="flex-1 py-1.5 rounded-xl border border-slate-200 text-[10px] font-extrabold text-slate-700 hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] transition-all cursor-pointer">PDF</button>
                                    <button onClick={() => handleExport('branches', 'excel')} disabled={exportingReport.branches} className="flex-1 py-1.5 rounded-xl border border-slate-200 text-[10px] font-extrabold text-slate-700 hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] transition-all cursor-pointer">Excel</button>
                                    <button onClick={() => handleExport('branches', 'csv')} disabled={exportingReport.branches} className="flex-1 py-1.5 rounded-xl border border-slate-200 text-[10px] font-extrabold text-slate-700 hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] transition-all cursor-pointer">CSV</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
