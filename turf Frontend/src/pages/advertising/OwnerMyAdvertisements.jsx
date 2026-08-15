import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import {
    FiEye, FiMousePointer, FiShoppingBag, FiDollarSign, FiPlus,
    FiGrid, FiList, FiPauseCircle, FiPlayCircle, FiEdit2, FiTrash2, FiBarChart2, FiSearch, FiTag,
    FiDownload, FiRefreshCw, FiCalendar, FiTrendingUp, FiCheckCircle
} from 'react-icons/fi'
import { HiMegaphone } from 'react-icons/hi2'

const INITIAL_OWNER_ADS = [
    {
        id: 'AD-1001',
        name: 'Champions Night Drive Promo',
        type: 'Guaranteed Booking',
        status: 'Active',
        icon: '🏏',
        views: 14200,
        clicks: 3600,
        bookings: 64,
        revenue: '₹1,28,000',
        commissionPaid: '₹15,360',
        ctr: '11.3%',
        roi: '240%',
        cpa: '₹82',
        budgetSpent: 4000,
        budgetTotal: 5000,
        startDate: '01 Aug 2026',
        endDate: '31 Aug 2026'
    },
    {
        id: 'AD-1002',
        name: 'Weekend Monsoon 25% Off',
        type: 'Discount Offer',
        status: 'Active',
        icon: '🌧️',
        views: 8900,
        clicks: 1850,
        bookings: 42,
        revenue: '₹75,600',
        commissionPaid: '₹7,560',
        ctr: '9.8%',
        roi: '210%',
        cpa: '₹95',
        budgetSpent: 3200,
        budgetTotal: 4000,
        startDate: '05 Aug 2026',
        endDate: '20 Aug 2026'
    },
    {
        id: 'AD-1003',
        name: 'Homepage Banner Exposure',
        type: 'Impression Ad',
        status: 'Pending',
        icon: '⚽',
        views: 3400,
        clicks: 410,
        bookings: 18,
        revenue: '₹32,400',
        commissionPaid: '₹4,860',
        ctr: '8.4%',
        roi: '180%',
        cpa: '₹110',
        budgetSpent: 1500,
        budgetTotal: 3000,
        startDate: '10 Aug 2026',
        endDate: '25 Aug 2026'
    },
    {
        id: 'AD-1004',
        name: 'Early Morning Slot Boost',
        type: 'Discount Offer',
        status: 'Expired',
        icon: '🌅',
        views: 12100,
        clicks: 980,
        bookings: 35,
        revenue: '₹49,000',
        commissionPaid: '₹3,920',
        ctr: '7.2%',
        roi: '165%',
        cpa: '₹125',
        budgetSpent: 2500,
        budgetTotal: 2500,
        startDate: '01 Jul 2026',
        endDate: '31 Jul 2026'
    }
]

export default function OwnerMyAdvertisements() {
    const navigate = useNavigate()
    const { addToast } = useToast()
    const [ads, setAds] = useState(INITIAL_OWNER_ADS)
    const [viewMode, setViewMode] = useState('card') // 'card' | 'table'
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [typeFilter, setTypeFilter] = useState('ALL')
    const [confirmModal, setConfirmModal] = useState({ open: false, type: '', ad: null })

    useEffect(() => {
        const fetchLiveAds = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/v1/ads');
                if (!res.ok) throw new Error('Network response was not ok');
                const data = await res.json();
                if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                    setAds(data.data);
                } else {
                    console.warn('Backend returned empty or invalid data, using mock ads');
                    setAds(INITIAL_OWNER_ADS);
                }
            } catch (err) {
                console.error('Error fetching live ad campaigns, falling back to mock data:', err);
                setAds(INITIAL_OWNER_ADS);
            }
        };
        fetchLiveAds();
    }, []);

    const filteredAds = ads.filter(ad => {
        const matchesSearch = ad.name.toLowerCase().includes(search.toLowerCase()) || ad.id.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'ALL' || ad.status === statusFilter
        const matchesType = typeFilter === 'ALL' || ad.type === typeFilter
        return matchesSearch && matchesStatus && matchesType
    })

    const handlePauseToggle = (ad) => {
        const newStatus = ad.status === 'Active' ? 'Pending' : 'Active'
        setAds(prev => prev.map(item => item.id === ad.id ? { ...item, status: newStatus } : item))
        addToast({ message: `Campaign "${ad.name}" is now ${newStatus}!`, type: 'info' })
        setConfirmModal({ open: false, type: '', ad: null })
    }

    const handleMarkPaid = (bookingId) => {
        // Placeholder logic for marking a booking as paid.
        // In a real implementation this would call an API endpoint.
        addToast({ message: `Booking ${bookingId} marked as paid!`, type: 'success' });
    };

    const handleDelete = (id) => {
        setAds(prev => prev.filter(item => item.id !== id))
        addToast({ message: `Campaign deleted successfully!`, type: 'success' })
        setConfirmModal({ open: false, type: '', ad: null })
    }

    const handleExportCSV = () => {
        if (!ads || ads.length === 0) {
            addToast({ title: 'Export Failed', message: 'No advertisement data available to export', type: 'error' })
            return
        }
        const headers = ['ID', 'Name', 'Type', 'Status', 'Views', 'Clicks', 'Bookings', 'Revenue', 'CTR', 'ROI', 'Start Date', 'End Date']
        const rows = ads.map(a => [
            `"${a.id || ''}"`,
            `"${a.name || ''}"`,
            `"${a.type || ''}"`,
            `"${a.status || ''}"`,
            `"${a.views || 0}"`,
            `"${a.clicks || 0}"`,
            `"${a.bookings || 0}"`,
            `"${a.revenue || ''}"`,
            `"${a.ctr || ''}"`,
            `"${a.roi || ''}"`,
            `"${a.startDate || ''}"`,
            `"${a.endDate || ''}"`
        ])
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `Campaigns_Export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        addToast({ title: 'Export Success', message: 'Campaign data exported as CSV file', type: 'success' })
    }

    return (
        <div className="space-y-8 bg-[#F4F7FC] p-6 rounded-3xl min-h-screen animate-in fade-in duration-500">
            {/* 1. Hero Section with Title & Right Side Analytics Chips */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 p-6 rounded-3xl border border-indigo-100/60 shadow-soft">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-3xl shadow-inner shadow-emerald-500/5 shrink-0">
                        <HiMegaphone className="w-7 h-7 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                            My Advertisements
                        </h1>
                        <p className="text-surface-600 text-sm mt-0.5 font-medium">Manage campaigns, boost bookings and track real-time ROI.</p>
                    </div>
                </div>

                {/* Right Side Analytics Mini Chips */}
                <div className="flex flex-wrap items-center gap-3 bg-white/80 backdrop-blur-md p-2.5 rounded-2xl border border-surface-200/80 shadow-soft">
                    <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/80">
                        Campaigns: <strong className="text-surface-900 font-extrabold">{ads.length}</strong>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80">
                        Revenue: <strong className="text-emerald-700 font-extrabold">₹2.85L</strong>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200/80">
                        Conversion: <strong className="text-surface-900 font-extrabold">11.3%</strong>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/80">
                        Active: <strong className="text-amber-700 font-extrabold">{ads.filter(a => a.status === 'Active').length}</strong>
                    </div>
                </div>
            </div>



            {/* 3. Ultra-Clean Toolbar (Fits Inside Card) */}
            <div className="p-3 bg-white border border-surface-200/80 rounded-2xl shadow-soft relative overflow-hidden z-20">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[200px] max-w-sm w-full">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-surface-400">
                            <FiSearch className="w-3.5 h-3.5" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search campaign name or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-surface-200 bg-white text-surface-900 text-xs outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 placeholder:text-surface-400 font-medium shadow-2xs"
                        />
                    </div>

                    {/* All Filter & Action Items in Single Row */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
                        <Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            options={[
                                { value: 'ALL', label: 'All Ad Types' },
                                { value: 'Guaranteed Booking', label: '🟢 Guaranteed' },
                                { value: 'Discount Offer', label: '🟣 Discount' },
                                { value: 'Impression Ad', label: '🟠 Impression' }
                            ]}
                            className="w-32 text-xs font-semibold"
                        />

                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { value: 'ALL', label: 'All Statuses' },
                                { value: 'Active', label: '🟢 Active' },
                                { value: 'Pending', label: '🟡 Pending' },
                                { value: 'Expired', label: '⚫ Expired' }
                            ]}
                            className="w-28 text-xs font-semibold"
                        />

                        {/* View Switcher Buttons */}
                        <div className="flex items-center gap-0.5 bg-surface-100 p-0.5 rounded-xl border border-surface-200/80 shrink-0">
                            <button
                                onClick={() => setViewMode('card')}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    viewMode === 'card' ? 'bg-emerald-600 text-white shadow-xs' : 'text-surface-600 hover:text-surface-900'
                                }`}
                            >
                                <FiGrid className="w-3 h-3" /> Cards
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    viewMode === 'table' ? 'bg-emerald-600 text-white shadow-xs' : 'text-surface-600 hover:text-surface-900'
                                }`}
                            >
                                <FiList className="w-3 h-3" /> Table
                            </button>
                        </div>

                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-surface-50 border border-surface-200/80 text-[11px] font-bold text-surface-700 hover:text-emerald-600 transition-all cursor-pointer shadow-2xs shrink-0"
                        >
                            <FiDownload className="w-3 h-3 text-emerald-600" /> Export
                        </button>

                        <button
                            onClick={() => setAds([...INITIAL_OWNER_ADS])}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-surface-50 border border-surface-200/80 text-[11px] font-bold text-surface-700 hover:text-indigo-600 transition-all cursor-pointer shadow-2xs shrink-0"
                        >
                            <FiRefreshCw className="w-3 h-3 text-indigo-600" /> Refresh
                        </button>

                        <Button
                            variant="primary"
                            onClick={() => navigate('/admin/ads/create')}
                            className="shadow-sm shadow-emerald-500/20 flex items-center gap-1 text-[11px] font-extrabold px-3 py-1.5 rounded-xl shrink-0"
                        >
                            <FiPlus className="w-3.5 h-3.5" /> Campaign
                        </Button>
                    </div>
                </div>
            </div>

            {/* 4 & ⭐ Master Campaign Card Structure VIEW */}
            {viewMode === 'card' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredAds.map((ad) => {
                        // Top Color Accent Strip based on Ad Type
                        const topAccentColor = 
                            ad.type === 'Guaranteed Booking' ? 'bg-emerald-500' :
                            ad.type === 'Discount Offer' ? 'bg-purple-500' : 'bg-amber-500'

                        // Type Badge Gradient Styling
                        const typeBadgeStyle = 
                            ad.type === 'Guaranteed Booking' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' :
                            ad.type === 'Discount Offer' ? 'bg-purple-50 text-purple-700 border-purple-200/80' :
                            'bg-amber-50 text-amber-700 border-amber-200/80'

                        const budgetPercent = Math.min(100, Math.round((ad.budgetSpent / ad.budgetTotal) * 100))

                        return (
                            /* 10. Soft Gradient Card Background & 13. Card Hover Animation */
                            <div
                                key={ad.id}
                                className="bg-gradient-to-b from-white to-[#FCFCFF] rounded-3xl border border-surface-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 relative overflow-hidden p-6 space-y-5"
                            >
                                {/* 4. Top Color Accent Strip */}
                                <div className={`absolute top-0 left-0 h-1.5 w-full ${topAccentColor}`}></div>

                                {/* Top Row: 5. Campaign Type Badge & 11. Status Badge */}
                                <div className="flex items-center justify-between pt-1">
                                    {/* 5. Campaign Type Badge */}
                                    <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border shadow-sm ${typeBadgeStyle}`}>
                                        {ad.type === 'Guaranteed Booking' ? '🟢 Guaranteed Booking' : ad.type === 'Discount Offer' ? '🟣 Discount Offer' : '🟠 Impression Ad'}
                                    </span>

                                    {/* 11. Status Badge with Dot */}
                                    {ad.status === 'Active' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold shadow-sm">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 🟢 Active
                                        </span>
                                    ) : ad.status === 'Pending' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-xs font-bold shadow-sm">
                                            <span className="w-2 h-2 rounded-full bg-amber-500"></span> 🟡 Pending Review
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-bold shadow-sm">
                                            <span className="w-2 h-2 rounded-full bg-slate-400"></span> ⚫ Expired
                                        </span>
                                    )}
                                </div>

                                {/* 12. Campaign Thumbnail & Title */}
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 border border-indigo-100 flex items-center justify-center text-2xl shadow-soft shrink-0">
                                        {ad.icon || '📢'}
                                    </div>
                                    <div className="truncate">
                                        <h3 className="font-black text-surface-900 text-base tracking-tight truncate">{ad.name}</h3>
                                        <span className="text-xs font-mono font-semibold text-surface-400">{ad.id}</span>
                                    </div>
                                </div>

                                {/* 6. Campaign Performance Grid with Trends */}
                                <div className="grid grid-cols-4 gap-3 bg-surface-50/90 p-4 rounded-2xl border border-surface-200/60 text-center">
                                    <div>
                                        <div className="text-[11px] font-bold text-surface-400 uppercase">Views</div>
                                        <div className="text-sm font-black text-surface-900 mt-0.5">{(ad.views / 1000).toFixed(1)}K</div>
                                        <div className="text-[10px] font-extrabold text-emerald-600">▲ 18%</div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-surface-400 uppercase">Clicks</div>
                                        <div className="text-sm font-black text-surface-900 mt-0.5">{(ad.clicks / 1000).toFixed(1)}K</div>
                                        <div className="text-[10px] font-extrabold text-emerald-600">▲ 14%</div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-surface-400 uppercase">Bookings</div>
                                        <div className="text-sm font-black text-indigo-600 mt-0.5">{ad.bookings}</div>
                                        <div className="text-[10px] font-extrabold text-emerald-600">▲ 12%</div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-surface-400 uppercase">Revenue</div>
                                        <div className="text-sm font-black text-emerald-600 mt-0.5">{ad.revenue}</div>
                                        <div className="text-[10px] font-extrabold text-emerald-600">▲ 9%</div>
                                    </div>
                                </div>

                                {/* 14. Analytics Quick Chips (CTR, ROI, CPA) */}
                                <div className="flex items-center justify-between text-xs font-bold text-surface-600 bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/60">
                                    <span>CTR: <strong className="text-indigo-600 font-extrabold">{ad.ctr}</strong></span>
                                    <span>ROI: <strong className="text-emerald-600 font-extrabold">{ad.roi}</strong></span>
                                    <span>CPA: <strong className="text-purple-600 font-extrabold">{ad.cpa}</strong></span>
                                </div>

                                {/* 7. Progress Bar for Budget Spent */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-surface-500">Budget Spent</span>
                                        <span className="text-surface-900 font-bold">₹{ad.budgetSpent.toLocaleString()} / ₹{ad.budgetTotal.toLocaleString()} ({budgetPercent}%)</span>
                                    </div>
                                    <div className="w-full bg-surface-200/80 h-2.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500" style={{ width: `${budgetPercent}%` }}></div>
                                    </div>
                                </div>

                                {/* Bottom Row: 8. Campaign Duration & 9. 40x40 Action Buttons */}
                                <div className="flex items-center justify-between pt-3 border-t border-surface-150">
                                    {/* 8. Campaign Duration */}
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-600 bg-surface-100 px-3 py-1.5 rounded-xl border border-surface-200/60">
                                        📅 {ad.startDate} → {ad.endDate}
                                    </span>

                                    {/* 9. 40x40 Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate('/admin/ads/analytics')}
                                            className="w-10 h-10 rounded-xl bg-slate-100/90 hover:bg-cyan-500 text-surface-600 hover:text-white border border-surface-200/60 hover:border-cyan-500 transition-all duration-200 shadow-soft flex items-center justify-center cursor-pointer"
                                            title="View Analytics"
                                        >
                                            <FiBarChart2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => navigate('/admin/ads/create')}
                                            className="w-10 h-10 rounded-xl bg-slate-100/90 hover:bg-indigo-500 text-surface-600 hover:text-white border border-surface-200/60 hover:border-indigo-500 transition-all duration-200 shadow-soft flex items-center justify-center cursor-pointer"
                                            title="Edit Campaign"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        {ad.status === 'Active' ? (
                                            <button
                                                onClick={() => setConfirmModal({ open: true, type: 'pause', ad })}
                                                className="w-10 h-10 rounded-xl bg-slate-100/90 hover:bg-amber-500 text-surface-600 hover:text-white border border-surface-200/60 hover:border-amber-500 transition-all duration-200 shadow-soft flex items-center justify-center cursor-pointer"
                                                title="Pause Campaign"
                                            >
                                                <FiPauseCircle className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handlePauseToggle(ad)}
                                                className="w-10 h-10 rounded-xl bg-slate-100/90 hover:bg-emerald-500 text-surface-600 hover:text-white border border-surface-200/60 hover:border-emerald-500 transition-all duration-200 shadow-soft flex items-center justify-center cursor-pointer"
                                                title="Activate Campaign"
                                            >
                                                <FiPlayCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setConfirmModal({ open: true, type: 'delete', ad })}
                                            className="w-10 h-10 rounded-xl bg-slate-100/90 hover:bg-rose-500 text-surface-600 hover:text-white border border-surface-200/60 hover:border-rose-500 transition-all shadow-soft flex items-center justify-center cursor-pointer"
                                            title="Delete Campaign"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                        <Button
                                            size="xs"
                                            variant="primary"
                                            className="px-4 py-1.5 text-xs font-bold shadow-xs"
                                            onClick={() => handleMarkPaid(ad.id)}
                                        >
                                            Mark Paid
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                /* TABLE VIEW */
                <div className="bg-white rounded-3xl border border-surface-200/80 overflow-hidden shadow-soft p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-surface-700">
                            <thead className="bg-[#F8FAFC] text-xs font-bold uppercase tracking-wider text-surface-600 border-b border-surface-200">
                                <tr>
                                    <th className="px-5 py-4">ID</th>
                                    <th className="px-5 py-4">Advertisement Name</th>
                                    <th className="px-5 py-4">Type</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-center">Views</th>
                                    <th className="px-5 py-4 text-center">Bookings</th>
                                    <th className="px-5 py-4 text-right">Revenue</th>
                                    <th className="px-5 py-4 text-right pr-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {filteredAds.map((ad, i) => (
                                    <tr key={ad.id} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-5 py-4 font-mono text-xs text-surface-500 font-bold">{ad.id}</td>
                                        <td className="px-5 py-4 font-extrabold text-surface-900 flex items-center gap-2">
                                            <span>{ad.icon}</span> {ad.name}
                                        </td>
                                        <td className="px-5 py-4 text-xs font-bold text-indigo-600">{ad.type}</td>
                                        <td className="px-5 py-4">
                                            {ad.status === 'Active' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
                                                </span>
                                            ) : ad.status === 'Pending' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-xs font-bold">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-bold">
                                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span> Expired
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center text-surface-900 font-bold">{ad.views.toLocaleString()}</td>
                                        <td className="px-5 py-4 text-center font-bold text-indigo-600">{ad.bookings}</td>
                                        <td className="px-5 py-4 text-right font-extrabold text-emerald-600">{ad.revenue}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate('/admin/ads/analytics')}
                                                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-cyan-500 hover:text-white text-surface-600 transition-colors flex items-center justify-center cursor-pointer shadow-soft"
                                                    title="Analytics"
                                                >
                                                    <FiBarChart2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmModal({ open: true, type: 'delete', ad })}
                                                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-500 hover:text-white text-surface-600 transition-colors flex items-center justify-center cursor-pointer shadow-soft"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            {confirmModal.open && confirmModal.ad && (
                <ConfirmDialog
                    isOpen={confirmModal.open}
                    onClose={() => setConfirmModal({ open: false, type: '', ad: null })}
                    onConfirm={() => {
                        if (confirmModal.type === 'pause') handlePauseToggle(confirmModal.ad)
                        else if (confirmModal.type === 'delete') handleDelete(confirmModal.ad.id)
                    }}
                    title={confirmModal.type === 'pause' ? 'Pause Campaign' : 'Delete Campaign'}
                    message={`Are you sure you want to ${confirmModal.type} campaign "${confirmModal.ad.name}"?`}
                />
            )}
        </div>
    )
}
