import { useState, useEffect, useCallback, useRef } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import { useToast } from '../../components/ui/Toast'
import { getPaymentLogs, getPaymentLogById, getPaymentStats } from '../../services/paymentLogService'
import { FiEye, FiSearch, FiFilter, FiX, FiRefreshCw, FiChevronDown, FiCheck } from 'react-icons/fi'
import { HiCash, HiCreditCard, HiChartBar, HiClock, HiReceiptRefund } from 'react-icons/hi'

// ── Status badge helper ──────────────────────────────────────────────────────
const STATUS_VARIANT = {
    COMPLETED: 'success',
    PENDING:   'warning',
    HELD:      'info',
    FAILED:    'danger',
    REFUNDED:  'danger',
}

// ── Type display label helper ────────────────────────────────────────────────
const TYPE_LABEL = {
    BOOKING:        'Booking',
    TOURNAMENT:     'Tournament',
    GAMING_ZONE:    'Gaming Zone',
    HIRE:           'Hire',
    WALLET_RECHARGE:'Wallet Recharge',
    SUBSCRIPTION:   'Subscription',
    REFUND:         'Refund',
}

// ── Date range presets ───────────────────────────────────────────────────────
const DATE_PRESETS = [
    { label: 'Today',    days: 0 },
    { label: '7 Days',   days: 7 },
    { label: '30 Days',  days: 30 },
    { label: '90 Days',  days: 90 },
]

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'HELD', label: 'Held' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'REFUNDED', label: 'Refunded' }
]

const TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'BOOKING', label: 'Booking' },
    { value: 'TOURNAMENT', label: 'Tournament' },
    { value: 'GAMING_ZONE', label: 'Gaming Zone' },
    { value: 'HIRE', label: 'Hire' },
    { value: 'WALLET_RECHARGE', label: 'Wallet Recharge' },
    { value: 'SUBSCRIPTION', label: 'Subscription' },
    { value: 'REFUND', label: 'Refund' }
]

const METHOD_OPTIONS = [
    { value: '', label: 'All Methods' },
    { value: 'CASH', label: 'Cash' },
    { value: 'CARD', label: 'Card' },
    { value: 'UPI', label: 'UPI' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'WALLET', label: 'Wallet' },
    { value: 'ONLINE', label: 'Online' }
]

const toISODate = (date) => date.toISOString().slice(0, 10)

const applyDatePreset = (days) => {
    const end   = new Date()
    const start = new Date()
    if (days === 0) {
        return { startDate: toISODate(start), endDate: toISODate(end) }
    }
    start.setDate(start.getDate() - days)
    return { startDate: toISODate(start), endDate: toISODate(end) }
}

// ── Format currency ──────────────────────────────────────────────────────────
const fmtINR = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`

// ── Format date & time ────────────────────────────────────────────────────────
const fmtDate = (d) => {
    if (!d) return '—'
    const dateObj = new Date(d)
    if (isNaN(dateObj.getTime())) return d
    const formattedDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const formattedTime = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    return `${formattedDate} • ${formattedTime}`
}

export default function PaymentLogs() {
    const { addToast } = useToast()
    const searchTimer = useRef(null)

    // ── Data states ─────────────────────────────────────────────────────────
    const [logs,       setLogs]       = useState([])
    const [stats,      setStats]      = useState(null)
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 })
    const [detailLog,  setDetailLog]  = useState(null)

    // ── Loading states ──────────────────────────────────────────────────────
    const [isPageLoading,   setIsPageLoading]   = useState(true)
    const [isTableLoading,  setIsTableLoading]  = useState(false)
    const [isStatsLoading,  setIsStatsLoading]  = useState(true)
    const [isDetailLoading, setIsDetailLoading] = useState(false)
    const [isModalOpen,     setIsModalOpen]     = useState(false)

    // ── Filter states ───────────────────────────────────────────────────────
    const [search,        setSearch]        = useState('')
    const [filterStatus,  setFilterStatus]  = useState('')
    const [filterType,    setFilterType]    = useState('')
    const [filterMethod,  setFilterMethod]  = useState('')
    const [startDate,     setStartDate]     = useState('')
    const [endDate,       setEndDate]       = useState('')
    const [activeDatePreset, setActiveDatePreset] = useState('')
    const [currentPage,   setCurrentPage]   = useState(1)
    const [openDropdown,  setOpenDropdown]  = useState(null)

    // ── Build query params ──────────────────────────────────────────────────
    const buildParams = useCallback((page = 1) => {
        const params = { page, limit: 20 }
        if (search.trim())   params.search        = search.trim()
        if (filterStatus)    params.status        = filterStatus
        if (filterType)      params.type          = filterType
        if (filterMethod)    params.paymentMethod = filterMethod
        if (startDate)       params.startDate     = startDate
        if (endDate)         params.endDate       = endDate
        return params
    }, [search, filterStatus, filterType, filterMethod, startDate, endDate])

    // ── Fetch stats dashboard ───────────────────────────────────────────────
    const fetchStats = useCallback(async () => {
        setIsStatsLoading(true)
        try {
            const params = {}
            if (startDate) params.startDate = startDate
            if (endDate)   params.endDate   = endDate
            const res = await getPaymentStats(params)
            if (res && res.success) setStats(res.data)
        } catch (err) {
            const status = err.response?.status
            if (status !== 401 && status !== 403) {
                addToast({ title: 'Stats Error', message: err.response?.data?.message || 'Failed to load statistics', type: 'error' })
            }
        } finally {
            setIsStatsLoading(false)
        }
    }, [startDate, endDate, addToast])

    // ── Fetch paginated logs ────────────────────────────────────────────────
    const fetchLogs = useCallback(async (page = 1, isFirst = false) => {
        if (isFirst) setIsPageLoading(true)
        else         setIsTableLoading(true)

        try {
            const res = await getPaymentLogs(buildParams(page))
            let apiLogs = (res && res.success && Array.isArray(res.data)) ? res.data : []
            
            setLogs(apiLogs)
            setPagination(res?.pagination || { total: apiLogs.length, page, limit: 20, totalPages: 1 })
            setCurrentPage(page)
        } catch (err) {
            const status = err.response?.status
            if      (status === 401) addToast({ title: 'Unauthorized', message: 'Your session has expired. Please log in again.', type: 'error' })
            else if (status === 403) addToast({ title: 'Forbidden', message: 'Access denied. Only Super Admin can view payment logs.', type: 'error' })
            else if (status === 400) addToast({ title: 'Bad Request', message: err.response?.data?.message || 'Invalid filter parameters.', type: 'error' })
            else                     addToast({ title: 'Load Failed', message: err.response?.data?.message || 'Failed to load payment logs.', type: 'error' })
        } finally {
            setIsPageLoading(false)
            setIsTableLoading(false)
        }
    }, [buildParams, addToast])

    // ── Initial load ────────────────────────────────────────────────────────
    useEffect(() => {
        Promise.all([fetchStats(), fetchLogs(1, true)])
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Re-fetch on filter changes (debounced for search) ──────────────────
    useEffect(() => {
        if (isPageLoading) return
        clearTimeout(searchTimer.current)
        searchTimer.current = setTimeout(() => {
            setCurrentPage(1)
            fetchLogs(1)
            fetchStats()
        }, search ? 400 : 0)
        return () => clearTimeout(searchTimer.current)
    }, [filterStatus, filterType, filterMethod, startDate, endDate, search]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── View single log detail ──────────────────────────────────────────────
    const handleViewDetail = async (logId) => {
        setIsDetailLoading(true)
        setIsModalOpen(true)
        setDetailLog(null)
        try {
            const res = await getPaymentLogById(logId)
            if (res && res.success) setDetailLog(res.data)
        } catch (err) {
            const status = err.response?.status
            if      (status === 404) addToast({ title: 'Not Found', message: 'Payment log not found.', type: 'error' })
            else if (status === 401) addToast({ title: 'Unauthorized', message: 'Session expired.', type: 'error' })
            else                     addToast({ title: 'Error', message: err.response?.data?.message || 'Failed to load log details.', type: 'error' })
            setIsModalOpen(false)
        } finally {
            setIsDetailLoading(false)
        }
    }

    // ── Date preset handler ─────────────────────────────────────────────────
    const handleDatePreset = (preset) => {
        if (activeDatePreset === preset.label) {
            setActiveDatePreset('')
            setStartDate('')
            setEndDate('')
        } else {
            const { startDate: s, endDate: e } = applyDatePreset(preset.days)
            setStartDate(s)
            setEndDate(e)
            setActiveDatePreset(preset.label)
        }
    }

    // ── Clear all filters ───────────────────────────────────────────────────
    const handleClearFilters = () => {
        setSearch('')
        setFilterStatus('')
        setFilterType('')
        setFilterMethod('')
        setStartDate('')
        setEndDate('')
        setActiveDatePreset('')
        setCurrentPage(1)
    }

    const hasActiveFilters = search || filterStatus || filterType || filterMethod || startDate || endDate

    // ── Stats summary card data ─────────────────────────────────────────────
    const summaryCards = [
        {
            label: 'Total Transactions',
            value: isStatsLoading ? '—' : (stats?.summary?.totalTransactions ?? 0).toLocaleString(),
            change: `${stats?.summary?.completedCount ?? 0} completed`,
            trend: 'up', icon: <HiChartBar />,
            cardBg: 'bg-white/85 backdrop-blur-[18px] border-t-2 border-blue-500',
            iconBg: 'bg-blue-500 text-white'
        },
        {
            label: 'Total Revenue',
            value: isStatsLoading ? '—' : fmtINR(stats?.summary?.totalRevenue),
            change: `Net platform earnings`,
            trend: 'up', icon: <HiCash />,
            cardBg: 'bg-white/85 backdrop-blur-[18px] border-t-2 border-[#16A34A]',
            iconBg: 'bg-[#16A34A] text-white'
        },
        {
            label: 'Total Commission',
            value: isStatsLoading ? '—' : fmtINR(stats?.summary?.totalCommission),
            change: 'Platform commission',
            trend: 'up', icon: <HiCreditCard />,
            cardBg: 'bg-white/85 backdrop-blur-[18px] border-t-2 border-purple-500',
            iconBg: 'bg-purple-500 text-white'
        }
    ]

    if (isPageLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Loading payment logs...</span>
            </div>
        )
    }

    return (
        <div 
            style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f7fffb 45%, #eefcf4 100%)'
            }}
            className="min-h-screen -m-6 md:-m-8 p-6 md:p-8 font-sans text-slate-900 relative selection:bg-[#22C55E]/30 overflow-x-hidden space-y-8"
        >
            {/* Extremely soft blurred emerald radial glow (<5% opacity) */}
            <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-[#10B981]/4 rounded-full blur-[160px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 w-[700px] h-[700px] bg-[#22C55E]/4 rounded-full blur-[180px] pointer-events-none -z-10" />

            {/* Page Header (Compact Glassmorphism) */}
            <div 
                style={{
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)'
                }}
                className="rounded-2xl shadow-[0_20px_45px_rgba(0,0,0,0.04)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Payment Logs</h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Platform earnings and escrow logs</p>
                </div>
                <button
                    onClick={() => { fetchLogs(currentPage); fetchStats() }}
                    className="h-9 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                >
                    <FiRefreshCw className={`w-3.5 h-3.5 text-[#16A34A] ${isTableLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* 3 KPI Stat Cards (Responsive, Clean Stacked Layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
                {summaryCards.map((card) => (
                    <div 
                        key={card.label} 
                        style={{
                            border: '1px solid rgba(255, 255, 255, 0.8)'
                        }}
                        className={`rounded-[22px] shadow-[0_12px_35px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_45px_rgba(34,197,94,0.12)] p-4.5 min-h-[128px] flex flex-col justify-between hover:-translate-y-1 hover:scale-[1.015] transition-all duration-200 overflow-hidden ${card.cardBg}`}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate" title={card.label}>
                                {card.label}
                            </span>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-2xs shrink-0 ${card.iconBg}`}>
                                {card.icon}
                            </div>
                        </div>
                        <div className="mt-2.5 flex flex-col gap-1">
                            <span 
                                className="text-xl sm:text-2xl xl:text-[22px] 2xl:text-[25px] font-black text-slate-900 leading-tight tracking-tight truncate" 
                                title={card.value}
                            >
                                {card.value}
                            </span>
                            {card.change && (
                                <div className="flex items-center">
                                    <span 
                                        className={`text-[11px] font-bold tracking-tight truncate ${
                                            card.trend === 'up' 
                                                ? 'text-[#16A34A]' 
                                                : card.trend === 'down' && card.label.includes('Refund') 
                                                    ? 'text-rose-600' 
                                                    : 'text-amber-600'
                                        }`}
                                        title={card.change}
                                    >
                                        {card.change}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter & Table Unified Container (24px Glass Card) */}
            <div className="bg-white/90 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] p-6 space-y-5 relative">
                {/* Search & Select Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search Input (54px Height) */}
                    <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Payment ID, TXN ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-[54px] pl-11 pr-10 rounded-2xl border border-slate-200 bg-[#FAFBFC] focus:bg-white text-slate-900 text-xs font-semibold outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all placeholder:text-slate-400"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
                                <FiX className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                            className="w-full h-[54px] rounded-2xl border border-slate-200 bg-[#FAFBFC] hover:bg-white px-4 text-xs font-bold text-slate-800 outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all cursor-pointer flex items-center justify-between"
                        >
                            <span>{STATUS_OPTIONS.find(o => o.value === filterStatus)?.label || 'All Status'}</span>
                            <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openDropdown === 'status' ? 'rotate-180 text-emerald-600' : ''}`} />
                        </button>

                        {openDropdown === 'status' && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_15px_35px_rgba(0,0,0,0.1)] p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                    {STATUS_OPTIONS.map(opt => {
                                        const isSelected = filterStatus === opt.value
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => {
                                                    setFilterStatus(opt.value)
                                                    setOpenDropdown(null)
                                                }}
                                                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
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

                    {/* Type Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                            className="w-full h-[54px] rounded-2xl border border-slate-200 bg-[#FAFBFC] hover:bg-white px-4 text-xs font-bold text-slate-800 outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all cursor-pointer flex items-center justify-between"
                        >
                            <span>{TYPE_OPTIONS.find(o => o.value === filterType)?.label || 'All Types'}</span>
                            <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openDropdown === 'type' ? 'rotate-180 text-emerald-600' : ''}`} />
                        </button>

                        {openDropdown === 'type' && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_15px_35px_rgba(0,0,0,0.1)] p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                    {TYPE_OPTIONS.map(opt => {
                                        const isSelected = filterType === opt.value
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => {
                                                    setFilterType(opt.value)
                                                    setOpenDropdown(null)
                                                }}
                                                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
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

                    {/* Method Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setOpenDropdown(openDropdown === 'method' ? null : 'method')}
                            className="w-full h-[54px] rounded-2xl border border-slate-200 bg-[#FAFBFC] hover:bg-white px-4 text-xs font-bold text-slate-800 outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all cursor-pointer flex items-center justify-between"
                        >
                            <span>{METHOD_OPTIONS.find(o => o.value === filterMethod)?.label || 'All Methods'}</span>
                            <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openDropdown === 'method' ? 'rotate-180 text-emerald-600' : ''}`} />
                        </button>

                        {openDropdown === 'method' && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_15px_35px_rgba(0,0,0,0.1)] p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150 max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                    {METHOD_OPTIONS.map(opt => {
                                        const isSelected = filterMethod === opt.value
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => {
                                                    setFilterMethod(opt.value)
                                                    setOpenDropdown(null)
                                                }}
                                                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
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
                </div>

                {/* Date Presets & Custom Inputs */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Date Presets:</span>
                        {DATE_PRESETS.map(preset => (
                            <button
                                key={preset.label}
                                onClick={() => handleDatePreset(preset)}
                                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer border ${
                                    activeDatePreset === preset.label
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-transparent shadow-xs'
                                        : 'bg-slate-100/80 border-slate-200/80 text-slate-600 hover:bg-slate-200/70'
                                }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400">Custom:</span>
                        <CustomDatePicker
                            value={startDate}
                            onChange={val => { setStartDate(val); setActiveDatePreset('') }}
                            placeholder="Start date"
                            align="right"
                        />
                        <span className="text-xs font-semibold text-slate-400">to</span>
                        <CustomDatePicker
                            value={endDate}
                            onChange={val => { setEndDate(val); setActiveDatePreset('') }}
                            placeholder="End date"
                            align="right"
                        />
                        {hasActiveFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 transition-all cursor-pointer ml-2"
                            >
                                <FiX className="w-3.5 h-3.5" /> Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* Table Header Counter Strip */}
                <div className="flex items-center justify-between pt-4 pb-2 border-t border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <FiFilter className="w-4 h-4 text-[#16A34A]" />
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            {pagination.total.toLocaleString()} Payment Transactions
                        </span>
                    </div>
                    {isTableLoading && (
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                            <div className="w-4 h-4 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
                            <span>Updating records...</span>
                        </div>
                    )}
                </div>

                {/* Table Body Container */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0F172A] text-white text-xs font-black uppercase tracking-wider h-[58px]">
                                <th className="px-5 py-4 rounded-l-2xl">Payment ID</th>
                                <th className="px-5 py-4">User</th>
                                <th className="px-5 py-4">Type</th>
                                <th className="text-right px-5 py-4">Amount</th>
                                <th className="text-right px-5 py-4">Commission</th>
                                <th className="px-5 py-4">Method</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4 rounded-r-2xl">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {isTableLoading && logs.length === 0 ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse h-[68px]">
                                        {Array.from({ length: 8 }).map((__, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 bg-slate-100 rounded-lg w-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-16 text-slate-400 text-sm font-medium">
                                        <div className="flex flex-col items-center gap-2">
                                            <HiCreditCard className="w-10 h-10 opacity-20" />
                                            <span>No payment logs found{hasActiveFilters ? ' matching your filters' : ''}.</span>
                                            {hasActiveFilters && (
                                                <button onClick={handleClearFilters} className="text-[#16A34A] text-xs font-bold hover:underline cursor-pointer">
                                                    Clear filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr
                                        key={log._id}
                                        className="h-[68px] even:bg-slate-50/60 odd:bg-white hover:bg-emerald-50/40 transition-all duration-200 border-b border-slate-100/80"
                                    >
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-black text-[#16A34A] font-mono">
                                                {log.paymentId || '—'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div>
                                                <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                                                    {log.userId?.fullName || '—'}
                                                </div>
                                                {log.userId?.mobile && (
                                                    <div className="text-[10px] text-slate-400 font-semibold">
                                                        {log.userId.mobile}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                                {TYPE_LABEL[log.type] || log.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <span className={`text-xs font-black ${log.type === 'REFUND' ? 'text-red-500' : 'text-slate-900'}`}>
                                                {log.type === 'REFUND' ? '-' : ''}{fmtINR(log.amount)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="text-xs font-bold text-slate-800">
                                                {fmtINR(log.commissionAmount)}
                                            </div>
                                            {log.commissionRate > 0 && (
                                                <div className="text-[10px] text-slate-400 font-semibold">{log.commissionRate}%</div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs text-slate-700 font-semibold">
                                                {log.paymentMethod || '—'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <Badge
                                                variant={STATUS_VARIANT[log.status] || 'default'}
                                                dot
                                            >
                                                {log.status
                                                    ? log.status.charAt(0) + log.status.slice(1).toLowerCase()
                                                    : '—'}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                                                {fmtDate(log.paymentDate || log.createdAt || log.date)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="border-t border-slate-100 pt-4">
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={(p) => fetchLogs(p)}
                        />
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setDetailLog(null) }}
                title="Payment Log Details"
                size="enterprise"
            >
                {isDetailLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-8 h-8 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Loading transaction details...</span>
                    </div>
                ) : detailLog ? (
                    <div className="space-y-6 pb-2">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment ID</p>
                                <p className="text-sm font-black text-[#16A34A] font-mono">{detailLog.paymentId}</p>
                                {detailLog.transactionId && (
                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">TXN: {detailLog.transactionId}</p>
                                )}
                            </div>
                            <Badge variant={STATUS_VARIANT[detailLog.status] || 'default'} dot>
                                {detailLog.status
                                    ? detailLog.status.charAt(0) + detailLog.status.slice(1).toLowerCase()
                                    : '—'}
                            </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">
                                    Transaction Info
                                </h4>
                                <DetailRow label="Type"           value={<Badge variant="primary">{TYPE_LABEL[detailLog.type] || detailLog.type}</Badge>} />
                                <DetailRow label="Payment Method" value={detailLog.paymentMethod || '—'} />
                                <DetailRow label="Payment Date"   value={fmtDate(detailLog.paymentDate)} />
                                {detailLog.remarks && (
                                    <DetailRow label="Remarks" value={detailLog.remarks} />
                                )}
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">
                                    Payment Breakdown
                                </h4>
                                <DetailRow label="Gross Amount"      value={<span className="font-bold text-slate-900">{fmtINR(detailLog.amount)}</span>} />
                                <DetailRow label="Commission Rate"   value={`${detailLog.commissionRate || 0}%`} />
                                <DetailRow label="Commission Amount" value={<span className="text-red-500 font-semibold">{fmtINR(detailLog.commissionAmount)}</span>} />
                                <DetailRow label="Owner Payout"      value={<span className="text-[#16A34A] font-bold">{fmtINR(detailLog.ownerAmount)}</span>} />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            {detailLog.userId && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">
                                        User Info
                                    </h4>
                                    <DetailRow label="Name"   value={detailLog.userId.fullName  || '—'} />
                                    <DetailRow label="Email"  value={detailLog.userId.email     || '—'} />
                                    <DetailRow label="Mobile" value={detailLog.userId.mobile    || '—'} />
                                    <DetailRow label="Role"   value={detailLog.userId.role      || '—'} />
                                </div>
                            )}

                            {detailLog.ownerId && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">
                                        Owner Info
                                    </h4>
                                    <DetailRow label="Name"          value={detailLog.ownerId.fullName     || '—'} />
                                    <DetailRow label="Email"         value={detailLog.ownerId.email        || '—'} />
                                    <DetailRow label="Mobile"        value={detailLog.ownerId.mobile       || '—'} />
                                    <DetailRow label="Business"      value={detailLog.ownerId.businessName || '—'} />
                                </div>
                            )}
                        </div>

                        {detailLog.branchId && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">
                                    Branch Info
                                </h4>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <DetailRow label="Branch Name" value={detailLog.branchId.branchName || '—'} />
                                    <DetailRow label="Branch Code" value={detailLog.branchId.branchCode || '—'} />
                                    <DetailRow label="City"        value={detailLog.branchId.city       || '—'} />
                                    <DetailRow label="Mobile"      value={detailLog.branchId.mobile     || '—'} />
                                </div>
                            </div>
                        )}

                        {detailLog.bookingId && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">
                                    Booking Info
                                </h4>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <DetailRow label="Booking Date" value={fmtDate(detailLog.bookingId.bookingDate)} />
                                    <DetailRow label="Time Slot"    value={`${detailLog.bookingId.startTime || '—'} – ${detailLog.bookingId.endTime || '—'}`} />
                                    <DetailRow label="Booking Price" value={fmtINR(detailLog.bookingId.price)} />
                                    <DetailRow label="Booking Status" value={<Badge variant={detailLog.bookingId.status === 'COMPLETED' ? 'success' : detailLog.bookingId.status === 'CANCELLED' ? 'danger' : 'info'}>{detailLog.bookingId.status}</Badge>} />
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </Modal>
        </div>
    )
}

function DetailRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-2 py-1.5 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 shrink-0 min-w-[110px]">{label}</span>
            <span className="text-xs font-semibold text-slate-800 text-right">{value}</span>
        </div>
    )
}
