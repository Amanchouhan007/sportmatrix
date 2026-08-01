import { useState, useEffect, useCallback, useRef } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import StatCard from '../../components/ui/StatCard'
import Pagination from '../../components/ui/Pagination'
import { useToast } from '../../components/ui/Toast'
import { getPaymentLogs, getPaymentLogById, getPaymentStats } from '../../services/paymentLogService'
import { FiEye, FiSearch, FiFilter, FiX, FiRefreshCw } from 'react-icons/fi'
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

// ── Format date ──────────────────────────────────────────────────────────────
const fmtDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
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
            if (res && res.success) {
                setLogs(res.data || [])
                setPagination(res.pagination || { total: 0, page, limit: 20, totalPages: 1 })
                setCurrentPage(page)
            }
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
        fetchStats()
        fetchLogs(1, true)
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
            trend: 'up', icon: <HiChartBar />
        },
        {
            label: 'Total Revenue',
            value: isStatsLoading ? '—' : fmtINR(stats?.summary?.totalRevenue),
            change: `Net platform earnings`,
            trend: 'up', icon: <HiCash />
        },
        {
            label: 'Total Commission',
            value: isStatsLoading ? '—' : fmtINR(stats?.summary?.totalCommission),
            change: 'Platform commission earned',
            trend: 'up', icon: <HiCreditCard />
        },
        {
            label: 'Pending Payments',
            value: isStatsLoading ? '—' : fmtINR(stats?.summary?.pendingPayments),
            change: `${stats?.summary?.pendingCount ?? 0} pending`,
            trend: 'down', icon: <HiClock />
        },
        {
            label: 'Refunded Amount',
            value: isStatsLoading ? '—' : fmtINR(stats?.summary?.refundedAmount),
            change: `${stats?.summary?.refundedCount ?? 0} refunds`,
            trend: 'down', icon: <HiReceiptRefund />
        },
    ]

    // ── Page loading skeleton ───────────────────────────────────────────────
    if (isPageLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-surface-500 text-sm font-medium">Loading payment logs...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Payment Logs</h1>
                    <p className="text-surface-500 text-sm mt-1">Platform earnings and escrow logs</p>
                </div>
                <button
                    onClick={() => { fetchLogs(currentPage); fetchStats() }}
                    className="flex items-center gap-2 text-xs font-bold text-surface-500 hover:text-primary-600 transition-colors px-3 py-2 rounded-xl hover:bg-primary-50 border border-surface-200 cursor-pointer"
                >
                    <FiRefreshCw className={`w-3.5 h-3.5 ${isTableLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {summaryCards.map((card) => (
                    <StatCard
                        key={card.label}
                        label={card.label}
                        value={card.value}
                        change={card.change}
                        trend={card.trend}
                        icon={card.icon}
                    />
                ))}
            </div>

            {/* Filters Panel */}
            <Card className="border border-surface-200/80 shadow-soft p-5 space-y-4">
                {/* Row 1: Search + dropdowns */}
                <div className="flex flex-wrap gap-3 items-end">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                            type="text"
                            placeholder="Search by Payment ID, Transaction ID, User name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-surface-200 rounded-xl text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 cursor-pointer">
                                <FiX className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Status filter */}
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-3 py-2.5 border border-surface-200 rounded-xl text-sm text-surface-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white cursor-pointer"
                    >
                        <option value="">All Status</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="PENDING">Pending</option>
                        <option value="HELD">Held</option>
                        <option value="FAILED">Failed</option>
                        <option value="REFUNDED">Refunded</option>
                    </select>

                    {/* Type filter */}
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="px-3 py-2.5 border border-surface-200 rounded-xl text-sm text-surface-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white cursor-pointer"
                    >
                        <option value="">All Types</option>
                        <option value="BOOKING">Booking</option>
                        <option value="TOURNAMENT">Tournament</option>
                        <option value="GAMING_ZONE">Gaming Zone</option>
                        <option value="HIRE">Hire</option>
                        <option value="WALLET_RECHARGE">Wallet Recharge</option>
                        <option value="SUBSCRIPTION">Subscription</option>
                        <option value="REFUND">Refund</option>
                    </select>

                    {/* Payment Method filter */}
                    <select
                        value={filterMethod}
                        onChange={e => setFilterMethod(e.target.value)}
                        className="px-3 py-2.5 border border-surface-200 rounded-xl text-sm text-surface-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white cursor-pointer"
                    >
                        <option value="">All Methods</option>
                        <option value="CASH">Cash</option>
                        <option value="CARD">Card</option>
                        <option value="UPI">UPI</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="WALLET">Wallet</option>
                        <option value="ONLINE">Online</option>
                    </select>

                    {/* Clear filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="flex items-center gap-1.5 text-xs font-bold text-danger-500 hover:text-danger-700 px-3 py-2.5 rounded-xl border border-danger-200 hover:bg-danger-50 transition-all cursor-pointer"
                        >
                            <FiX className="w-3.5 h-3.5" /> Clear All
                        </button>
                    )}
                </div>

                {/* Row 2: Date range */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-surface-400 uppercase tracking-wide">Date Range:</span>
                    {DATE_PRESETS.map(preset => (
                        <button
                            key={preset.label}
                            onClick={() => handleDatePreset(preset)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                activeDatePreset === preset.label
                                    ? 'bg-primary-600 text-white border-primary-600 shadow-soft'
                                    : 'bg-white text-surface-600 border-surface-200 hover:border-primary-300 hover:text-primary-600'
                            }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                    <span className="text-xs text-surface-400 font-medium">or custom:</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => { setStartDate(e.target.value); setActiveDatePreset('') }}
                        className="px-3 py-1.5 border border-surface-200 rounded-lg text-xs outline-none focus:border-primary-500 bg-white cursor-pointer"
                    />
                    <span className="text-xs text-surface-400">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => { setEndDate(e.target.value); setActiveDatePreset('') }}
                        className="px-3 py-1.5 border border-surface-200 rounded-lg text-xs outline-none focus:border-primary-500 bg-white cursor-pointer"
                    />
                </div>
            </Card>

            {/* Table */}
            <Card className="border border-surface-200/80 shadow-soft overflow-hidden">
                {/* Table header row with total count */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-100">
                    <div className="flex items-center gap-2">
                        <FiFilter className="w-4 h-4 text-surface-400" />
                        <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">
                            {pagination.total.toLocaleString()} Transactions
                        </span>
                    </div>
                    {isTableLoading && (
                        <div className="flex items-center gap-2 text-xs text-surface-400 font-medium">
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            Loading...
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-surface-50/60 border-b border-surface-100">
                                <th className="text-left px-5 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">Payment ID</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">User</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">Type</th>
                                <th className="text-right px-5 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">Amount</th>
                                <th className="text-right px-5 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">Commission</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">Method</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">Date</th>
                                <th className="text-center px-5 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100">
                            {isTableLoading && logs.length === 0 ? (
                                /* Table skeleton while loading */
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array.from({ length: 9 }).map((__, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 bg-surface-100 rounded-lg w-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-16 text-surface-400 text-sm font-medium">
                                        <div className="flex flex-col items-center gap-2">
                                            <HiCreditCard className="w-10 h-10 opacity-20" />
                                            <span>No payment logs found{hasActiveFilters ? ' matching your filters' : ''}.</span>
                                            {hasActiveFilters && (
                                                <button onClick={handleClearFilters} className="text-primary-500 text-xs font-bold hover:text-primary-700 underline cursor-pointer">
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
                                        className={`hover:bg-surface-50/60 transition-colors duration-150 ${isTableLoading ? 'opacity-50' : ''}`}
                                    >
                                        {/* Payment ID */}
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-bold text-primary-600 font-mono">
                                                {log.paymentId || '—'}
                                            </span>
                                        </td>

                                        {/* User */}
                                        <td className="px-5 py-4">
                                            <div>
                                                <div className="text-sm font-semibold text-surface-800 truncate max-w-[140px]">
                                                    {log.userId?.fullName || '—'}
                                                </div>
                                                {log.userId?.mobile && (
                                                    <div className="text-[10px] text-surface-400 font-medium">
                                                        {log.userId.mobile}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td className="px-5 py-4">
                                            <Badge variant="primary">
                                                {TYPE_LABEL[log.type] || log.type}
                                            </Badge>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-5 py-4 text-right">
                                            <span className={`text-sm font-bold ${log.type === 'REFUND' ? 'text-danger-500' : 'text-surface-900'}`}>
                                                {log.type === 'REFUND' ? '-' : ''}{fmtINR(log.amount)}
                                            </span>
                                        </td>

                                        {/* Commission */}
                                        <td className="px-5 py-4 text-right">
                                            <div className="text-sm font-semibold text-surface-700">
                                                {fmtINR(log.commissionAmount)}
                                            </div>
                                            {log.commissionRate > 0 && (
                                                <div className="text-[10px] text-surface-400 font-medium">{log.commissionRate}%</div>
                                            )}
                                        </td>

                                        {/* Payment Method */}
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-surface-700 font-medium">
                                                {log.paymentMethod || '—'}
                                            </span>
                                        </td>

                                        {/* Status */}
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

                                        {/* Date */}
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-surface-600 whitespace-nowrap">
                                                {fmtDate(log.paymentDate)}
                                            </span>
                                        </td>

                                        {/* Action */}
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => handleViewDetail(log._id)}
                                                className="p-2 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition-colors cursor-pointer"
                                                title="View Details"
                                            >
                                                <FiEye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="border-t border-surface-100 px-5">
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={(p) => fetchLogs(p)}
                        />
                    </div>
                )}
            </Card>

            {/* Detail Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setDetailLog(null) }}
                title="Payment Log Details"
                size="xl"
            >
                {isDetailLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-surface-500 text-sm font-medium">Loading transaction details...</span>
                    </div>
                ) : detailLog ? (
                    <div className="space-y-6 pb-2">
                        {/* Status + Payment ID header */}
                        <div className="flex items-center justify-between p-4 bg-surface-50 rounded-2xl border border-surface-100">
                            <div>
                                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Payment ID</p>
                                <p className="text-sm font-bold text-primary-600 font-mono">{detailLog.paymentId}</p>
                                {detailLog.transactionId && (
                                    <p className="text-[10px] text-surface-400 font-medium mt-0.5">TXN: {detailLog.transactionId}</p>
                                )}
                            </div>
                            <Badge variant={STATUS_VARIANT[detailLog.status] || 'default'} dot>
                                {detailLog.status
                                    ? detailLog.status.charAt(0) + detailLog.status.slice(1).toLowerCase()
                                    : '—'}
                            </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            {/* Transaction Info */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-surface-500 uppercase tracking-widest border-b border-surface-100 pb-2">
                                    Transaction Info
                                </h4>
                                <DetailRow label="Type"           value={<Badge variant="primary">{TYPE_LABEL[detailLog.type] || detailLog.type}</Badge>} />
                                <DetailRow label="Payment Method" value={detailLog.paymentMethod || '—'} />
                                <DetailRow label="Payment Date"   value={fmtDate(detailLog.paymentDate)} />
                                {detailLog.remarks && (
                                    <DetailRow label="Remarks" value={detailLog.remarks} />
                                )}
                            </div>

                            {/* Payment Breakdown */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-surface-500 uppercase tracking-widest border-b border-surface-100 pb-2">
                                    Payment Breakdown
                                </h4>
                                <DetailRow label="Gross Amount"      value={<span className="font-bold text-surface-900">{fmtINR(detailLog.amount)}</span>} />
                                <DetailRow label="Commission Rate"   value={`${detailLog.commissionRate || 0}%`} />
                                <DetailRow label="Commission Amount" value={<span className="text-danger-500 font-semibold">{fmtINR(detailLog.commissionAmount)}</span>} />
                                <DetailRow label="Owner Payout"      value={<span className="text-primary-600 font-bold">{fmtINR(detailLog.ownerAmount)}</span>} />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            {/* User Info */}
                            {detailLog.userId && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-surface-500 uppercase tracking-widest border-b border-surface-100 pb-2">
                                        User Info
                                    </h4>
                                    <DetailRow label="Name"   value={detailLog.userId.fullName  || '—'} />
                                    <DetailRow label="Email"  value={detailLog.userId.email     || '—'} />
                                    <DetailRow label="Mobile" value={detailLog.userId.mobile    || '—'} />
                                    <DetailRow label="Role"   value={detailLog.userId.role      || '—'} />
                                </div>
                            )}

                            {/* Owner Info */}
                            {detailLog.ownerId && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-surface-500 uppercase tracking-widest border-b border-surface-100 pb-2">
                                        Owner Info
                                    </h4>
                                    <DetailRow label="Name"          value={detailLog.ownerId.fullName     || '—'} />
                                    <DetailRow label="Email"         value={detailLog.ownerId.email        || '—'} />
                                    <DetailRow label="Mobile"        value={detailLog.ownerId.mobile       || '—'} />
                                    <DetailRow label="Business"      value={detailLog.ownerId.businessName || '—'} />
                                </div>
                            )}
                        </div>

                        {/* Branch Info */}
                        {detailLog.branchId && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-surface-500 uppercase tracking-widest border-b border-surface-100 pb-2">
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

                        {/* Booking Info */}
                        {detailLog.bookingId && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-surface-500 uppercase tracking-widest border-b border-surface-100 pb-2">
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

// ── Detail modal row helper ──────────────────────────────────────────────────
function DetailRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-2 py-1.5 border-b border-surface-50">
            <span className="text-xs font-semibold text-surface-500 shrink-0 min-w-[110px]">{label}</span>
            <span className="text-xs font-medium text-surface-800 text-right">{value}</span>
        </div>
    )
}
