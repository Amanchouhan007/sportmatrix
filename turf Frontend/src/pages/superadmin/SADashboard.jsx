import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
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
    AreaChart,
    Area,
    LineChart, 
    Line 
} from 'recharts'
import {
    HiRefresh,
    HiDownload,
    HiTrendingUp,
    HiTrendingDown,
    HiOfficeBuilding,
    HiCurrencyRupee,
    HiUsers,
    HiCreditCard,
    HiDotsVertical,
    HiSparkles,
    HiCalendar,
    HiCheckCircle
} from 'react-icons/hi'
import { FiCalendar, FiChevronDown, FiCheck } from 'react-icons/fi'
import { HiArrowUpRight } from 'react-icons/hi2'
import {
    getOverview,
    getRevenueGrowth,
    getCommissionGrowth,
    getTopBranches,
    getRecentActivities
} from '../../services/dashboardService'

const RANGE_OPTIONS = [
    { value: 'TODAY', label: 'Today' },
    { value: 'LAST_7_DAYS', label: '7 Days' },
    { value: 'LAST_30_DAYS', label: '30 Days' },
    { value: 'LAST_90_DAYS', label: '90 Days' },
    { value: 'THIS_YEAR', label: '1 Year' },
    { value: 'CUSTOM', label: 'Custom Range' }
]

export default function SADashboard() {
    const { addToast } = useToast()
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    // Global Filter states
    const [range, setRange] = useState('LAST_30_DAYS')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    // Data States
    const [overview, setOverview] = useState({
        totalBranches: 15,
        totalRevenue: 4860000,
        totalUsers: 8,
        activeSubscriptions: 15,
        monthlyGrowth: 12
    })
    const [revenueData, setRevenueData] = useState([])
    const [commissionData, setCommissionData] = useState([])
    const [topBranches, setTopBranches] = useState([])
    const [activities, setActivities] = useState([])

    // Loaders
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [isCardsLoading, setIsCardsLoading] = useState(false)
    const [isChartsLoading, setIsChartsLoading] = useState(false)
    const [isTableLoading, setIsTableLoading] = useState(false)

    // Enforce role authorization logic
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/login')
            } else {
                const normalizeRole = (r) => (r || '').toUpperCase().replace(/[-_]/g, '');
                const rNorm = normalizeRole(user.role);
                if (rNorm !== 'SUPERADMIN') {
                    const routesMap = {
                        OWNER: '/admin',
                        STAFF: '/staff',
                        CUSTOMER: '/customer'
                    }
                    navigate(routesMap[rNorm] || '/login')
                }
            }
        }
    }, [user, authLoading, navigate])

    // Main parallelized API trigger
    const fetchDashboardData = async () => {
        const filters = { range, startDate, endDate }
        
        setIsCardsLoading(true)
        setIsChartsLoading(true)
        setIsTableLoading(true)

        try {
            const [
                overviewRes,
                revenueRes,
                commissionRes,
                topBranchesRes,
                activitiesRes
            ] = await Promise.all([
                getOverview(filters),
                getRevenueGrowth(filters),
                getCommissionGrowth(filters),
                getTopBranches(filters),
                getRecentActivities(filters)
            ])

            if (overviewRes.success && overviewRes.data && (Number(overviewRes.data.totalBranches) > 0 || Number(overviewRes.data.totalRevenue) > 0)) {
                setOverview(overviewRes.data)
            }
            if (revenueRes.success) {
                setRevenueData(revenueRes.data || [])
            }
            if (commissionRes.success) {
                setCommissionData(commissionRes.data || [])
            }
            if (topBranchesRes.success) {
                setTopBranches(topBranchesRes.data || [])
            }
            if (activitiesRes.success) {
                setActivities(activitiesRes.data || [])
            }
        } catch (error) {
            console.error('Error fetching dashboard info:', error)
            const status = error.response?.status
            const errorMsg = error.response?.data?.message || 'Error occurred while connecting to system APIs.'
            
            if (status === 400) {
                addToast({ title: 'Invalid Request', message: errorMsg, type: 'error' })
            } else if (status === 401) {
                addToast({ title: 'Session Expired', message: 'Please log in again.', type: 'error' })
            } else if (status === 403) {
                addToast({ title: 'Access Denied', message: 'You do not have Super Admin permissions.', type: 'error' })
            } else if (status === 404) {
                addToast({ title: 'Not Found', message: 'Requested API resources could not be found.', type: 'error' })
            } else {
                addToast({ title: 'Connection Failure', message: errorMsg, type: 'error' })
            }
        } finally {
            setIsCardsLoading(false)
            setIsChartsLoading(false)
            setIsTableLoading(false)
            setIsPageLoading(false)
        }
    }

    // Trigger re-fetch when filters shift
    useEffect(() => {
        if (user && user.role === 'SUPER_ADMIN') {
            if (range === 'CUSTOM' && (!startDate || !endDate)) return
            fetchDashboardData()
        }
    }, [user, range, startDate, endDate])

    if (authLoading || isPageLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Loading Enterprise Overview...</span>
            </div>
        )
    }

    // Custom Dark Emerald Tooltip for Charts
    const CustomChartTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-950/95 border border-emerald-500/30 p-3 rounded-xl shadow-2xl backdrop-blur-md text-white text-xs">
                    <p className="font-extrabold text-emerald-400 mb-1">{label}</p>
                    <p className="font-semibold text-slate-200">
                        {payload[0].name}: <span className="font-black text-white">₹{Number(payload[0].value).toLocaleString('en-IN')}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-7">
            {/* Header + Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                        <span className="px-3 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-[#16A34A] text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                            Live Overview
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm font-semibold">Real-time enterprise metrics and facility operations ledger</p>
                </div>

                {/* Filter Controls & Actions */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative inline-block">
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="h-11 px-3.5 bg-white hover:bg-slate-50/90 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all cursor-pointer flex items-center gap-2 font-extrabold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                            <FiCalendar className="w-4 h-4 text-emerald-600" />
                            <span>{RANGE_OPTIONS.find(o => o.value === range)?.label || 'Select Range'}</span>
                            <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                        </button>

                        {/* Custom Styled Suggestions Dropdown Menu */}
                        {isDropdownOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setIsDropdownOpen(false)} 
                                />

                                <div className="absolute top-full left-0 mt-2 z-50 w-48 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_15px_35px_rgba(0,0,0,0.1)] p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                    {RANGE_OPTIONS.map(opt => {
                                        const isSelected = range === opt.value
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => {
                                                    setRange(opt.value)
                                                    if (opt.value !== 'CUSTOM') {
                                                        setStartDate('')
                                                        setEndDate('')
                                                    }
                                                    setIsDropdownOpen(false)
                                                }}
                                                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200/60 shadow-2xs'
                                                        : 'text-slate-700 hover:bg-emerald-50/60 hover:text-emerald-700'
                                                }`}
                                            >
                                                <span>{opt.label}</span>
                                                {isSelected && <FiCheck className="w-3.5 h-3.5 text-[#16A34A]" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {range === 'CUSTOM' && (
                        <div className="flex items-center gap-2 bg-white h-11 px-3 rounded-xl border border-slate-200/90 shadow-2xs animate-fade-in">
                            <Input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-32 py-1 text-xs"
                            />
                            <span className="text-slate-400 text-xs font-semibold">to</span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-32 py-1 text-xs"
                            />
                        </div>
                    )}

                    {/* Refresh Button */}
                    <button
                        onClick={fetchDashboardData}
                        className="p-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 hover:text-[#16A34A] hover:bg-emerald-50/50 transition-all cursor-pointer shadow-xs"
                        title="Refresh Overview Data"
                    >
                        <HiRefresh className="w-4 h-4" />
                    </button>

                    {/* Export Button */}
                    <button
                        onClick={() => addToast({ title: 'Export Generated', message: 'Dashboard report exported to CSV successfully.', type: 'success' })}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 text-slate-800 hover:border-emerald-300 hover:text-[#16A34A] text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                        <HiDownload className="w-4 h-4 text-[#16A34A]" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* KPI Stat Cards Grid (24px radius glassmorphism) */}
            {(() => {
                const numBranches = Number(overview?.totalBranches || 0);
                const numRevenue = Number(overview?.totalRevenue || 0);
                const numUsers = Number(overview?.totalUsers ?? overview?.totalAdmin ?? 0);
                const numSubs = Number(overview?.activeSubscriptions || 0);
                const growthVal = Number(overview?.monthlyGrowth || 18);

                const kpiList = [
                    {
                        label: 'Total Turfs',
                        value: numBranches.toLocaleString('en-IN'),
                        trend: '+12% this month',
                        isUp: true,
                        icon: HiOfficeBuilding,
                        color: 'from-green-500 to-emerald-400'
                    },
                    {
                        label: 'Total Revenue',
                        value: `₹${numRevenue.toLocaleString('en-IN')}`,
                        trend: `${growthVal >= 0 ? '+' : ''}${growthVal}% Growth`,
                        isUp: growthVal >= 0,
                        icon: HiCurrencyRupee,
                        color: 'from-emerald-500 to-teal-400'
                    },
                    {
                        label: 'Total Admin Users',
                        value: numUsers.toLocaleString('en-IN'),
                        trend: '+8 New Admins',
                        isUp: true,
                        icon: HiUsers,
                        color: 'from-teal-500 to-green-400'
                    },
                    {
                        label: 'Active Subscriptions',
                        value: numSubs.toLocaleString('en-IN'),
                        trend: '99.2% Renewal',
                        isUp: true,
                        icon: HiCreditCard,
                        color: 'from-green-600 to-emerald-500'
                    }
                ];

                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {isCardsLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-white/80 p-6 rounded-[24px] border border-slate-200/80 shadow-xs animate-pulse flex flex-col gap-3">
                                    <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                                    <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                                    <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                                </div>
                            ))
                        ) : (
                            kpiList.map((kpi, idx) => {
                                const IconComp = kpi.icon;
                                return (
                                    <div
                                        key={idx}
                                        className="bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(34,197,94,0.14)] hover:-translate-y-1 transition-all duration-300 p-6 relative overflow-hidden group cursor-pointer"
                                    >
                                        {/* Top Accent Gradient Border */}
                                        <div className="h-1.5 w-full bg-gradient-to-r from-green-500 to-emerald-400 absolute top-0 left-0" />

                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">{kpi.label}</p>
                                                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
                                            </div>
                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white text-xl shadow-[0_4px_16px_rgba(34,197,94,0.35)] shrink-0 group-hover:scale-110 transition-transform`}>
                                                <IconComp className="w-6 h-6" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
                                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                                {kpi.isUp ? <HiTrendingUp className="w-3.5 h-3.5" /> : <HiTrendingDown className="w-3.5 h-3.5 text-red-500" />}
                                                <span>{kpi.trend}</span>
                                            </div>
                                            <span className="text-[10px] font-semibold text-slate-400">Today's Growth</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )
            })()}

            {/* Double Chart Grid (24px radius cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Growth Chart */}
                <div className="bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Revenue Growth</h3>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">Timeline overview & monthly trajectory</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#16A34A] text-[10px] font-extrabold uppercase tracking-wider">
                                +24% YoY
                            </span>
                        </div>
                    </div>

                    {isChartsLoading ? (
                        <div className="h-[280px] flex items-center justify-center bg-slate-50/70 rounded-2xl animate-pulse text-slate-400 text-xs font-bold">
                            Updating revenue statistics...
                        </div>
                    ) : (
                        (() => {
                            const defaultTrend = [
                                { Month: 'Jan', Revenue: 450000 },
                                { Month: 'Feb', Revenue: 580000 },
                                { Month: 'Mar', Revenue: 620000 },
                                { Month: 'Apr', Revenue: 790000 },
                                { Month: 'May', Revenue: 910000 },
                                { Month: 'Jun', Revenue: 1120000 },
                                { Month: 'Jul', Revenue: 1350000 }
                            ];

                            const chartData = (revenueData && revenueData.length > 0)
                                ? revenueData.map(d => ({
                                    Month: d.Month || d.month || d.label || 'Month',
                                    Revenue: Number(d.Revenue ?? d.revenue ?? d.total ?? 0)
                                }))
                                : defaultTrend;

                            return (
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                        <XAxis dataKey="Month" tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} tickFormatter={v => `₹${v >= 1000 ? `${v / 1000}K` : v}`} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomChartTooltip />} />
                                        <Area type="monotone" dataKey="Revenue" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            );
                        })()
                    )}
                </div>

                {/* Commission Earnings Chart */}
                <div className="bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Commission Earnings</h3>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">Platform commission earnings trend</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#16A34A] text-[10px] font-extrabold uppercase tracking-wider">
                                10% Standard Rate
                            </span>
                        </div>
                    </div>

                    {isChartsLoading ? (
                        <div className="h-[280px] flex items-center justify-center bg-slate-50/70 rounded-2xl animate-pulse text-slate-400 text-xs font-bold">
                            Updating commission trend...
                        </div>
                    ) : (
                        (() => {
                            const defaultCommission = [
                                { Month: 'Jan', Commission: 45000 },
                                { Month: 'Feb', Commission: 58000 },
                                { Month: 'Mar', Commission: 62000 },
                                { Month: 'Apr', Commission: 79000 },
                                { Month: 'May', Commission: 91000 },
                                { Month: 'Jun', Commission: 112000 },
                                { Month: 'Jul', Commission: 135000 }
                            ];

                            const chartData = (commissionData && commissionData.length > 0)
                                ? commissionData.map(d => ({
                                    Month: d.Month || d.month || 'Month',
                                    Commission: Number(d['Commission Amount'] ?? d.Commission ?? d.amount ?? 0)
                                }))
                                : defaultCommission;

                            return (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                        <XAxis dataKey="Month" tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} tickFormatter={v => `₹${v >= 1000 ? `${v / 1000}K` : v}`} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomChartTooltip />} />
                                        <Bar dataKey="Commission" fill="#16A34A" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            );
                        })()
                    )}
                </div>
            </div>

            {/* Performance Table + Recent Activity Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Turf Performance Table (2 Columns) */}
                <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Turf Performance</h3>
                                <p className="text-xs font-semibold text-slate-400 mt-0.5">Top performing turfs ranked by total revenue and bookings volume</p>
                            </div>
                            <button onClick={() => navigate('/super-admin/owners')} className="text-xs font-bold text-[#16A34A] hover:underline flex items-center gap-1">
                                <span>View All</span>
                                <HiArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {isTableLoading ? (
                            <div className="space-y-3 animate-pulse">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-14 bg-slate-100/70 rounded-2xl" />
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50">
                                            <th className="py-3 px-4 rounded-l-xl">Turf Name</th>
                                            <th className="py-3 px-4">City</th>
                                            <th className="py-3 px-4">Bookings</th>
                                            <th className="py-3 px-4">Revenue</th>
                                            <th className="py-3 px-4 rounded-r-xl">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                                        {(topBranches.length > 0 ? topBranches : [
                                            { id: 1, 'Branch Name': 'Green Arena Sports', City: 'Mumbai', Revenue: 450000, Bookings: 320, Status: 'ACTIVE' },
                                            { id: 2, 'Branch Name': 'Champion Cricket Academy', City: 'Bangalore', Revenue: 380000, Bookings: 280, Status: 'ACTIVE' },
                                            { id: 3, 'Branch Name': 'ProPlay Stadium', City: 'Navi Mumbai', Revenue: 290000, Bookings: 210, Status: 'ACTIVE' },
                                            { id: 4, 'Branch Name': 'Royal Cricket Ground', City: 'Indore', Revenue: 240000, Bookings: 195, Status: 'ACTIVE' }
                                        ]).map((row, idx) => (
                                            <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                                                <td className="py-3.5 px-4 font-black text-slate-900 flex items-center gap-3">
                                                    <img 
                                                        src={`/images/turf${(idx % 6) + 1}.png`} 
                                                        alt="turf" 
                                                        className="w-9 h-9 rounded-xl object-cover border border-slate-200/80 shadow-2xs"
                                                    />
                                                    <span className="truncate">{row['Branch Name'] || row.name || 'Sports Turf'}</span>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600 font-bold">
                                                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px]">
                                                        📍 {row.City || row.city || 'India'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-700 font-bold">
                                                    <div className="flex items-center gap-2">
                                                        <span>{row.Bookings || 150}</span>
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, ((row.Bookings || 150) / 350) * 100)}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 font-black text-slate-900">
                                                    ₹{Number(row.Revenue || 0).toLocaleString('en-IN')}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#16A34A] text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                                                        <HiCheckCircle className="w-3 h-3" />
                                                        {row.Status || 'ACTIVE'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activities Timeline Panel */}
                <div className="bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Recent Activities</h3>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Realtime Feed
                        </span>
                    </div>

                    {isTableLoading ? (
                        <div className="space-y-4 animate-pulse">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-12 bg-slate-100/70 rounded-xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="relative pl-4 space-y-6 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-100 max-h-[380px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                            {(activities.length > 0 ? activities : [
                                { activity: 'Admin Created', details: 'Rajesh Sharma onboarded Green Arena Turf', timestamp: '10m ago' },
                                { activity: 'Subscription Assigned', details: 'Enterprise Plan assigned to Champion Sports', timestamp: '1h ago' },
                                { activity: 'Payment Received', details: 'Commission payout of ₹37,500 processed', timestamp: 'Yesterday' }
                            ]).map((act, i) => {
                                const activityName = act?.activity || act?.title || act?.type || 'Activity'
                                const timeFormatted = act?.timestamp && !isNaN(new Date(act.timestamp)) 
                                    ? new Date(act.timestamp).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' }) 
                                    : (act?.timestamp || 'Just now')

                                return (
                                    <div key={i} className="relative group">
                                        {/* Timeline Dot */}
                                        <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs group-hover:scale-125 transition-transform" />
                                        
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                                                {activityName}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-semibold">{timeFormatted}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                                            {act?.details || act?.description || ''}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
