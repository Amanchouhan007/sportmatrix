import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import { useToast } from '../../components/ui/Toast'
import { FiDollarSign, FiFileText, FiCheckCircle, FiClock, FiCreditCard } from 'react-icons/fi'
import { getAdCommissions, markCommissionPaid } from '../../services/adsService'

export default function CommissionManagement() {
    const navigate = useNavigate()
    const location = useLocation()
    const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : location.pathname.startsWith('/staff') ? '/staff' : '/admin'
    const { addToast } = useToast()
    const [commissions, setCommissions] = useState([])
    const [summary, setSummary] = useState({ totalPool: 0, pendingPayouts: 0, settledCommissions: 0 })
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedInvoice, setSelectedInvoice] = useState(null)
    const [payingId, setPayingId] = useState(null)
    const itemsPerPage = 5

    const fetchLiveCommissions = async () => {
        setIsLoading(true)
        try {
            const res = await getAdCommissions()
            setCommissions(Array.isArray(res.data) ? res.data : [])
            if (res.summary) setSummary(res.summary)
        } catch (err) {
            addToast({ title: 'Load Failed', message: err.message || 'Failed to load commissions.', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    };

    useEffect(() => {
        fetchLiveCommissions();
    }, []);

    const filteredData = commissions.filter(item => {
        if (!item) return false;
        const matchesSearch = String(item.bookingId || '').toLowerCase().includes(search.toLowerCase()) ||
            String(item.adId || '').toLowerCase().includes(search.toLowerCase()) ||
            String(item.turfName || '').toLowerCase().includes(search.toLowerCase()) ||
            String(item.invoiceNo || '').toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'ALL' || item.paymentStatus === statusFilter
        return matchesSearch && matchesStatus
    })

    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleMarkPaid = async (id) => {
        setPayingId(id)
        try {
            await markCommissionPaid(id)
            addToast({ message: `Commission for Booking ${id} marked as Paid!`, type: 'success' })
            fetchLiveCommissions();
        } catch (err) {
            addToast({ title: 'Update Failed', message: err.message || 'Could not mark this commission as paid.', type: 'error' })
        } finally {
            setPayingId(null)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Sub-Navigation Tabs */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl shadow-inner shadow-emerald-500/5">
                            <FiCreditCard className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-surface-900 tracking-tight">Commission Management</h1>
                            <p className="text-surface-500 text-sm mt-0.5 font-medium">Audit advertisement commission payouts, invoices, and settlements</p>
                        </div>
                    </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => navigate(`${basePath}/ads`)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                        📢 All Campaigns
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`${basePath}/ads/commissions`)}
                        className="px-4 py-2 rounded-xl text-xs font-black bg-[#10B981] text-white shadow-xs"
                    >
                        💵 Commissions
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`${basePath}/ads/analytics`)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                        📊 Analytics
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`${basePath}/ads/payments`)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                        💳 Payments
                    </button>
                </div>
            </div>

            {/* KPI Cards matching OwnerDashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card variant="glass" hover className="p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500"></div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl">
                            <FiDollarSign />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Total Commission Pool</p>
                            <h3 className="text-2xl font-extrabold text-surface-900 mt-0.5">₹{Number(summary.totalPool).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        </div>
                    </div>
                </Card>

                <Card variant="glass" hover className="p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-amber-500"></div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-xl">
                            <FiClock />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Pending Payouts</p>
                            <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">₹{Number(summary.pendingPayouts).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        </div>
                    </div>
                </Card>

                <Card variant="glass" hover className="p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 w-full bg-teal-500"></div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center text-xl">
                            <FiCheckCircle />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Settled Commissions</p>
                            <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">₹{Number(summary.settledCommissions).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Merged Filter Bar & Data Table into 1 Single Card */}
            <div className="bg-white/90 backdrop-blur-md border border-surface-200/80 rounded-3xl overflow-hidden shadow-soft">
                {/* Filter Bar Header */}
                <div className="p-4.5 border-b border-surface-100 bg-surface-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <Input
                                placeholder="Search by Booking ID, Ad ID, Turf or Invoice..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                        </Select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-surface-700">
                        <thead className="bg-surface-50/80 text-xs font-bold uppercase tracking-wider text-surface-500 border-b border-surface-200/60">
                            <tr>
                                <th className="px-5 py-4">Booking ID</th>
                                <th className="px-5 py-4">Advertisement & Turf</th>
                                <th className="px-5 py-4">Booking Amount</th>
                                <th className="px-5 py-4">Commission</th>
                                <th className="px-5 py-4">Owner Amount</th>
                                <th className="px-5 py-4">Invoice</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100">
                            {isLoading ? (
                                <tr><td colSpan="8" className="px-5 py-8 text-center text-surface-400 font-medium">Loading commissions...</td></tr>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((item) => (
                                    <tr key={item.bookingId} className="hover:bg-surface-50/50 transition-colors">
                                        <td className="px-5 py-4 font-bold text-surface-900 whitespace-nowrap">{item.bookingId}</td>
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-surface-900">{item.adName}</div>
                                            <div className="text-xs text-surface-500 font-medium">{item.turfName} ({item.adId})</div>
                                        </td>
                                        <td className="px-5 py-4 font-medium text-surface-900">{item.bookingAmount}</td>
                                        <td className="px-5 py-4 font-bold text-emerald-600">{item.commission}</td>
                                        <td className="px-5 py-4 font-medium text-surface-700">{item.ownerAmount}</td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => setSelectedInvoice(item)}
                                                className="inline-flex items-center gap-1 text-xs font-mono text-primary-600 font-bold hover:underline cursor-pointer"
                                            >
                                                <FiFileText /> {item.invoiceNo}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <Badge variant={item.paymentStatus === 'PAID' ? 'success' : 'warning'} dot>
                                                {item.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap">
                                            {item.paymentStatus === 'PENDING' ? (
                                                <Button
                                                    size="xs"
                                                    variant="primary"
                                                    className="px-4 py-1.5 text-xs font-bold shadow-xs"
                                                    disabled={payingId === item.bookingId}
                                                    onClick={() => handleMarkPaid(item.bookingId)}
                                                >
                                                    {payingId === item.bookingId ? 'Saving...' : 'Mark Paid'}
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-surface-400 italic font-medium">Settled</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-5 py-8 text-center text-surface-400 font-medium">
                                        No commission records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-surface-200/60 flex justify-end">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(p) => setCurrentPage(p)}
                        />
                    </div>
                )}
            </div>

            {/* Modal: View Invoice */}
            {selectedInvoice && (
                <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title={`Invoice - ${selectedInvoice.invoiceNo}`}>
                    <div className="space-y-4 text-surface-700">
                        <div className="flex justify-between items-center bg-surface-50 p-4 rounded-2xl border border-surface-200">
                            <div>
                                <h3 className="font-bold text-surface-900 text-base">SportMatrix Platform</h3>
                                <p className="text-xs text-surface-500 font-medium">Commission Invoice Statement</p>
                            </div>
                            <Badge variant={selectedInvoice.paymentStatus === 'PAID' ? 'success' : 'warning'} dot>
                                {selectedInvoice.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs bg-surface-50/50 p-4 rounded-2xl border border-surface-100">
                            <div><span className="text-surface-500">Invoice No:</span> <span className="font-bold text-surface-900 block">{selectedInvoice.invoiceNo}</span></div>
                            <div>
                                <span className="text-surface-500">Date & Time:</span>
                                <span className="font-bold text-surface-900 block flex items-center gap-1.5 mt-0.5">
                                    <span>📅 {selectedInvoice.date}</span>
                                    {selectedInvoice.time && (
                                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 font-mono font-extrabold text-[11px]">⏰ {selectedInvoice.time}</span>
                                    )}
                                </span>
                            </div>
                            <div><span className="text-surface-500">Booking ID:</span> <span className="font-bold text-surface-900 block">{selectedInvoice.bookingId}</span></div>
                            <div><span className="text-surface-500">Ad Campaign:</span> <span className="font-bold text-primary-600 block">{selectedInvoice.adId}</span></div>
                        </div>

                        <div className="space-y-2 border-t border-surface-200 pt-3 text-sm">
                            <div className="flex justify-between text-surface-500 font-medium"><span>Gross Booking Amount:</span><span className="text-surface-900 font-bold">{selectedInvoice.bookingAmount}</span></div>
                            <div className="flex justify-between text-surface-500 font-medium"><span>Platform Commission Rate:</span><span className="text-emerald-600 font-bold">{selectedInvoice.commission}</span></div>
                            <div className="flex justify-between text-surface-900 font-bold border-t border-surface-200 pt-2"><span>Net Payable to Turf Owner:</span><span>{selectedInvoice.ownerAmount}</span></div>
                        </div>

                        {/* PDF export isn't built yet -- no button pretending to generate one. */}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={() => setSelectedInvoice(null)}>Close</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
