import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import {
    getDiscountOffers,
    deleteDiscountOffer,
    changeDiscountStatus,
    duplicateDiscountOffer
} from '../../services/discountService'
import {
    FiPlus, FiSearch, FiRefreshCw, FiDownload, FiEdit2, FiTrash2,
    FiEye, FiCopy, FiCheckCircle, FiXCircle, FiTag, FiClock, FiCheck,
    FiFilter, FiLayers, FiDollarSign, FiUsers, FiTrendingUp, FiActivity, FiArrowRight,
    FiChevronDown
} from 'react-icons/fi'

const TURF_OPTIONS = [
    { value: 'ALL', label: 'All Turfs' },
    { value: 'turf-1', label: 'Champions Turf Arena' },
    { value: 'turf-2', label: 'SkyLine Football Turf' },
    { value: 'turf-3', label: 'Velocity Sports Hub' }
]

const TYPE_OPTIONS = [
    { value: 'ALL', label: 'All Discount Types' },
    { value: 'Percentage', label: 'Percentage (%)' },
    { value: 'Flat Amount', label: 'Flat Amount (₹)' },
    { value: 'Buy One Get One', label: 'Buy One Get One' },
    { value: 'Free Slot', label: 'Free Slot' },
    { value: 'Cashback', label: 'Cashback' }
]

const STATUS_OPTIONS = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Expired', label: 'Expired' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Inactive', label: 'Inactive' }
]

export default function DiscountOffersList() {
    const navigate = useNavigate()
    const { addToast } = useToast()

    // State
    const [offers, setOffers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [turfFilter, setTurfFilter] = useState('ALL')
    const [typeFilter, setTypeFilter] = useState('ALL')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [page, setPage] = useState(1)
    const [openDropdown, setOpenDropdown] = useState(null)
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })

    // Modals state
    const [viewModalOffer, setViewModalOffer] = useState(null)
    const [deleteModalOffer, setDeleteModalOffer] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        fetchData()
    }, [searchTerm, turfFilter, typeFilter, statusFilter, page])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await getDiscountOffers({
                search: searchTerm,
                turfId: turfFilter,
                discountType: typeFilter,
                status: statusFilter,
                page,
                limit: 10
            })
            if (res.success && res.data) {
                setOffers(res.data.offers || [])
                setPagination(res.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 })
            }
        } catch (err) {
            addToast({ message: 'Failed to load discount offers', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleStatusToggle = async (offer) => {
        const nextStatus = offer.status === 'Active' ? 'Inactive' : 'Active'
        try {
            await changeDiscountStatus(offer.id || offer._id, nextStatus)
            addToast({ message: `Offer "${offer.title}" status changed to ${nextStatus}`, type: 'success' })
            fetchData()
        } catch (err) {
            addToast({ message: 'Failed to update status', type: 'error' })
        }
    }

    const handleDuplicate = async (id) => {
        try {
            const res = await duplicateDiscountOffer(id)
            if (res.success) {
                addToast({ message: 'Discount offer duplicated successfully as Draft!', type: 'success' })
                fetchData()
            }
        } catch (err) {
            addToast({ message: 'Failed to duplicate offer', type: 'error' })
        }
    }

    const handleDelete = async () => {
        if (!deleteModalOffer) return
        setIsDeleting(true)
        try {
            await deleteDiscountOffer(deleteModalOffer.id || deleteModalOffer._id)
            addToast({ message: `Discount offer "${deleteModalOffer.title}" deleted successfully!`, type: 'success' })
            setDeleteModalOffer(null)
            fetchData()
        } catch (err) {
            addToast({ message: 'Failed to delete offer', type: 'error' })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleExportCSV = () => {
        if (offers.length === 0) {
            addToast({ message: 'No records available to export', type: 'info' })
            return
        }

        const headers = ['ID', 'Title', 'Turf Name', 'Owner Name', 'Discount Type', 'Value', 'Promo Code', 'Start Date', 'End Date', 'Used Count', 'Usage Limit', 'Status']
        const csvRows = [headers.join(',')]

        offers.forEach(o => {
            const row = [
                `"${o.id}"`,
                `"${o.title.replace(/"/g, '""')}"`,
                `"${o.turfName.replace(/"/g, '""')}"`,
                `"${o.ownerName.replace(/"/g, '""')}"`,
                `"${o.discountType}"`,
                `"${o.discountType === 'Percentage' ? `${o.discountValue}%` : `₹${o.discountValue}`}"`,
                `"${o.promoCode || 'N/A'}"`,
                `"${o.startDate}"`,
                `"${o.endDate}"`,
                `"${o.usedCount}"`,
                `"${o.usageLimit}"`,
                `"${o.status}"`
            ]
            csvRows.push(row.join(','))
        })

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.setAttribute('href', url)
        a.setAttribute('download', `Discount_Offers_${new Date().toISOString().split('T')[0]}.csv`)
        a.click()
        addToast({ message: 'Discount offers exported to CSV successfully!', type: 'success' })
    }

    // Calculated Dashboard Stats
    const activeCount = offers.filter(o => o.status === 'Active').length
    const scheduledCount = offers.filter(o => o.status === 'Scheduled').length
    const expiredCount = offers.filter(o => o.status === 'Expired').length
    const totalCount = offers.length
    const totalBookingsImpact = offers.reduce((acc, curr) => acc + (curr.usedCount || 0), 0)
    const totalEstRevenue = offers.reduce((acc, curr) => acc + (curr.usedCount * 1200), 0)

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'Scheduled':
                return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'Expired':
                return 'bg-rose-50 text-rose-700 border-rose-200'
            case 'Draft':
                return 'bg-slate-100 text-slate-700 border-slate-300'
            default:
                return 'bg-amber-50 text-amber-700 border-amber-200'
        }
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto bg-[#F4F7FC] p-6 rounded-3xl min-h-screen animate-in fade-in duration-500 pb-28">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        🏷️ Discount Offers Management
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Create, manage, and track promotional coupons, off-peak deals, and slot discounts.</p>
                </div>

                <Button
                    variant="primary"
                    onClick={() => navigate('/admin/discount-offers/create')}
                    className="flex items-center gap-2 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3 rounded-2xl"
                >
                    <FiPlus className="text-lg" /> Create Discount Offer
                </Button>
            </div>

            {/* 6 Dashboard Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-surface-200/80 shadow-sm space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-surface-500">
                        <span>Active Offers</span>
                        <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><FiCheckCircle /></span>
                    </div>
                    <div className="text-2xl font-black text-emerald-600">{activeCount}</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-surface-200/80 shadow-sm space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-surface-500">
                        <span>Scheduled</span>
                        <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><FiClock /></span>
                    </div>
                    <div className="text-2xl font-black text-blue-600">{scheduledCount}</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-surface-200/80 shadow-sm space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-surface-500">
                        <span>Expired</span>
                        <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600"><FiXCircle /></span>
                    </div>
                    <div className="text-2xl font-black text-rose-600">{expiredCount}</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-surface-200/80 shadow-sm space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-surface-500">
                        <span>Total Offers</span>
                        <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600"><FiTag /></span>
                    </div>
                    <div className="text-2xl font-black text-purple-600">{totalCount}</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-surface-200/80 shadow-sm space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-surface-500">
                        <span>Est. Bookings</span>
                        <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><FiActivity /></span>
                    </div>
                    <div className="text-2xl font-black text-indigo-600">{totalBookingsImpact}</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-surface-200/80 shadow-sm space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-surface-500">
                        <span>Revenue Impact</span>
                        <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><FiDollarSign /></span>
                    </div>
                    <div className="text-xl font-black text-emerald-700">₹{totalEstRevenue.toLocaleString()}</div>
                </div>
            </div>

            {/* Merged Filter Controls & Data Table into 1 Single Card */}
            <div className="bg-white rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                {/* Filter Controls Header */}
                <div className="p-5 border-b border-surface-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="relative col-span-1 sm:col-span-2">
                            <FiSearch className="absolute left-4 top-3.5 text-surface-400 text-sm" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by title, promo code, turf or owner..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50/50 text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all"
                            />
                        </div>

                        {/* Turf Filter Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpenDropdown(openDropdown === 'turf' ? null : 'turf')}
                                className="w-full h-10 px-3.5 rounded-xl border border-surface-200 bg-surface-50/50 hover:bg-white text-xs font-bold text-surface-800 outline-none focus:border-emerald-500 transition-all cursor-pointer flex items-center justify-between"
                            >
                                <span className="truncate">{TURF_OPTIONS.find(o => o.value === turfFilter)?.label || 'All Turfs'}</span>
                                <FiChevronDown className={`w-3.5 h-3.5 text-surface-400 shrink-0 transition-transform duration-200 ${openDropdown === 'turf' ? 'rotate-180 text-emerald-600' : ''}`} />
                            </button>

                            {openDropdown === 'turf' && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white/95 backdrop-blur-md rounded-2xl border border-surface-200/90 shadow-[0_15px_35px_rgba(0,0,0,0.1)] p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                        {TURF_OPTIONS.map(opt => {
                                            const isSelected = turfFilter === opt.value
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setTurfFilter(opt.value)
                                                        setOpenDropdown(null)
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs'
                                                            : 'text-surface-700 hover:bg-emerald-50/60 hover:text-emerald-700'
                                                    }`}
                                                >
                                                    <span className="truncate">{opt.label}</span>
                                                    {isSelected && <FiCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Discount Type Filter Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                                className="w-full h-10 px-3.5 rounded-xl border border-surface-200 bg-surface-50/50 hover:bg-white text-xs font-bold text-surface-800 outline-none focus:border-emerald-500 transition-all cursor-pointer flex items-center justify-between"
                            >
                                <span className="truncate">{TYPE_OPTIONS.find(o => o.value === typeFilter)?.label || 'All Discount Types'}</span>
                                <FiChevronDown className={`w-3.5 h-3.5 text-surface-400 shrink-0 transition-transform duration-200 ${openDropdown === 'type' ? 'rotate-180 text-emerald-600' : ''}`} />
                            </button>

                            {openDropdown === 'type' && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white/95 backdrop-blur-md rounded-2xl border border-surface-200/90 shadow-[0_15px_35px_rgba(0,0,0,0.1)] p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                        {TYPE_OPTIONS.map(opt => {
                                            const isSelected = typeFilter === opt.value
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setTypeFilter(opt.value)
                                                        setOpenDropdown(null)
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs'
                                                            : 'text-surface-700 hover:bg-emerald-50/60 hover:text-emerald-700'
                                                    }`}
                                                >
                                                    <span className="truncate">{opt.label}</span>
                                                    {isSelected && <FiCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Status Filter Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                                className="w-full h-10 px-3.5 rounded-xl border border-surface-200 bg-surface-50/50 hover:bg-white text-xs font-bold text-surface-800 outline-none focus:border-emerald-500 transition-all cursor-pointer flex items-center justify-between"
                            >
                                <span className="truncate">{STATUS_OPTIONS.find(o => o.value === statusFilter)?.label || 'All Statuses'}</span>
                                <FiChevronDown className={`w-3.5 h-3.5 text-surface-400 shrink-0 transition-transform duration-200 ${openDropdown === 'status' ? 'rotate-180 text-emerald-600' : ''}`} />
                            </button>

                            {openDropdown === 'status' && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white/95 backdrop-blur-md rounded-2xl border border-surface-200/90 shadow-[0_15px_35px_rgba(0,0,0,0.1)] p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                        {STATUS_OPTIONS.map(opt => {
                                            const isSelected = statusFilter === opt.value
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setStatusFilter(opt.value)
                                                        setOpenDropdown(null)
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs'
                                                            : 'text-surface-700 hover:bg-emerald-50/60 hover:text-emerald-700'
                                                    }`}
                                                >
                                                    <span className="truncate">{opt.label}</span>
                                                    {isSelected && <FiCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-surface-150 pt-3 text-xs font-bold text-surface-500">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchData}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-700 transition-colors cursor-pointer"
                            >
                                <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
                            </button>
                            <button
                                onClick={handleExportCSV}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                                <FiDownload /> Export CSV
                            </button>
                        </div>

                        <span>Showing {offers.length} discount offers</span>
                    </div>
                </div>

                {/* Discounts Data Table */}
                {loading ? (
                    <div className="p-12 text-center text-surface-400 font-bold text-sm">
                        <FiRefreshCw className="animate-spin text-3xl mx-auto mb-3 text-emerald-600" />
                        Loading discount offers...
                    </div>
                ) : offers.length === 0 ? (
                    <div className="p-12 text-center text-surface-500 font-bold text-sm space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-surface-100 text-surface-400 flex items-center justify-center mx-auto text-xl">
                            <FiTag />
                        </div>
                        <div>No discount offers found matching your filter criteria.</div>
                        <Button variant="secondary" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setTypeFilter('ALL'); setTurfFilter('ALL'); }}>
                            Reset Filters
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-surface-50 border-b border-surface-200 text-surface-600 font-extrabold uppercase tracking-wider">
                                    <th className="py-4 px-5">ID</th>
                                    <th className="py-4 px-5">Banner</th>
                                    <th className="py-4 px-5">Offer Details</th>
                                    <th className="py-4 px-5">Turf & Owner</th>
                                    <th className="py-4 px-5">Type & Value</th>
                                    <th className="py-4 px-5">Promo Code</th>
                                    <th className="py-4 px-5">Validity</th>
                                    <th className="py-4 px-5">Usage</th>
                                    <th className="py-4 px-5">Status</th>
                                    <th className="py-4 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-150">
                                {offers.map(o => (
                                    <tr key={o.id} className="hover:bg-surface-50/80 transition-colors font-medium text-surface-800">
                                        <td className="py-4 px-5 font-mono text-[11px] font-bold text-surface-500">{o.id}</td>
                                        
                                        <td className="py-4 px-5">
                                            <div className="w-12 h-9 rounded-xl overflow-hidden bg-surface-100 border border-surface-200 shrink-0">
                                                <img
                                                    src={o.banner || o.thumbnail || 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800'}
                                                    alt={o.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>

                                        <td className="py-4 px-5 max-w-[200px]">
                                            <div className="font-extrabold text-surface-900 truncate">{o.title}</div>
                                            <div className="text-[11px] text-surface-400 truncate">{o.description || 'No description'}</div>
                                        </td>

                                        <td className="py-4 px-5">
                                            <div className="font-bold text-surface-900">{o.turfName}</div>
                                            <div className="text-[11px] text-surface-400 font-medium">{o.ownerName}</div>
                                        </td>

                                        <td className="py-4 px-5">
                                            <span className="font-extrabold text-emerald-600 block">
                                                {o.discountType === 'Percentage' ? `${o.discountValue}% OFF` : `₹${o.discountValue} OFF`}
                                            </span>
                                            <span className="text-[10px] text-surface-400 font-bold uppercase">{o.discountType}</span>
                                        </td>

                                        <td className="py-4 px-5">
                                            {o.promoCode ? (
                                                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold text-[11px] border border-indigo-200/60">
                                                    {o.promoCode}
                                                </span>
                                            ) : (
                                                <span className="text-surface-400 italic text-[11px]">Auto Apply</span>
                                            )}
                                        </td>

                                        <td className="py-4 px-5 text-[11px]">
                                            <div>{o.startDate}</div>
                                            <div className="text-surface-400">to {o.endDate}</div>
                                        </td>

                                        <td className="py-4 px-5">
                                            <div className="font-bold text-surface-900">{o.usedCount} / {o.usageLimit}</div>
                                            <div className="w-16 h-1.5 bg-surface-150 rounded-full overflow-hidden mt-1">
                                                <div
                                                    className="h-full bg-emerald-500"
                                                    style={{ width: `${Math.min(100, Math.round((o.usedCount / o.usageLimit) * 100))}%` }}
                                                />
                                            </div>
                                        </td>

                                        <td className="py-4 px-5">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(o.status)}`}>
                                                {o.status}
                                            </span>
                                        </td>

                                        <td className="py-4 px-5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => setViewModalOffer(o)}
                                                    title="View Offer Details"
                                                    className="p-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-600 transition-colors"
                                                >
                                                    <FiEye className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusToggle(o)}
                                                    title={o.status === 'Active' ? 'Deactivate Offer' : 'Activate Offer'}
                                                    className={`p-2 rounded-xl transition-colors ${o.status === 'Active' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                                >
                                                    {o.status === 'Active' ? <FiXCircle className="text-sm" /> : <FiCheckCircle className="text-sm" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDuplicate(o.id)}
                                                    title="Duplicate Offer"
                                                    className="p-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                                                >
                                                    <FiCopy className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModalOffer(o)}
                                                    title="Delete Offer"
                                                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                                >
                                                    <FiTrash2 className="text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* VIEW DETAILS MODAL */}
            {viewModalOffer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-surface-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start border-b border-surface-150 pb-4">
                            <div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(viewModalOffer.status)}`}>
                                    {viewModalOffer.status}
                                </span>
                                <h3 className="text-xl font-black text-surface-900 mt-2">{viewModalOffer.title}</h3>
                                <p className="text-xs text-surface-500 font-medium">{viewModalOffer.turfName} • {viewModalOffer.ownerName}</p>
                            </div>
                            <button onClick={() => setViewModalOffer(null)} className="p-2 rounded-xl bg-surface-100 text-surface-500 hover:bg-surface-200">
                                ✕
                            </button>
                        </div>

                        {viewModalOffer.banner && (
                            <div className="h-44 w-full rounded-2xl overflow-hidden border border-surface-200">
                                <img src={viewModalOffer.banner} alt={viewModalOffer.title} className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-surface-50 p-4 rounded-2xl text-xs font-bold text-surface-700">
                            <div>
                                <span className="text-surface-400 uppercase text-[10px] block">Discount Value</span>
                                <span className="text-emerald-600 text-base font-extrabold">{viewModalOffer.discountType === 'Percentage' ? `${viewModalOffer.discountValue}% OFF` : `₹${viewModalOffer.discountValue} OFF`}</span>
                            </div>
                            <div>
                                <span className="text-surface-400 uppercase text-[10px] block">Promo Code</span>
                                <span className="text-indigo-600 font-mono">{viewModalOffer.promoCode || 'Auto Apply'}</span>
                            </div>
                            <div>
                                <span className="text-surface-400 uppercase text-[10px] block">Validity</span>
                                <span>{viewModalOffer.startDate} → {viewModalOffer.endDate}</span>
                            </div>
                            <div>
                                <span className="text-surface-400 uppercase text-[10px] block">Usage Count</span>
                                <span>{viewModalOffer.usedCount} / {viewModalOffer.usageLimit}</span>
                            </div>
                            <div>
                                <span className="text-surface-400 uppercase text-[10px] block">Min Booking</span>
                                <span>₹{viewModalOffer.minimumBookingAmount}</span>
                            </div>
                            <div>
                                <span className="text-surface-400 uppercase text-[10px] block">Max Discount</span>
                                <span>₹{viewModalOffer.maximumDiscountAmount}</span>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs">
                            <h4 className="font-extrabold text-surface-900">Description</h4>
                            <p className="text-surface-600 font-medium leading-relaxed">{viewModalOffer.description || 'No detailed description provided.'}</p>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-surface-150">
                            <Button variant="secondary" size="sm" onClick={() => setViewModalOffer(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteModalOffer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-surface-200">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold">
                            <FiTrash2 />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-surface-900">Delete Discount Offer?</h3>
                            <p className="text-xs text-surface-500 font-medium">
                                Are you sure you want to delete <span className="font-bold text-surface-800">"{deleteModalOffer.title}"</span>? This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-150">
                            <Button variant="secondary" size="sm" onClick={() => setDeleteModalOffer(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete Offer'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
