import { useState, useEffect } from 'react'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import { useToast } from '../../components/ui/Toast'
import { FiDollarSign, FiFileText, FiCheckCircle, FiClock, FiDownload, FiCreditCard } from 'react-icons/fi'

const INITIAL_COMMISSIONS = [
    {
        bookingId: 'BK-9021',
        adId: 'AD-1001',
        adName: 'Champions Night Drive',
        turfName: 'Champions Turf Arena',
        bookingAmount: '₹3,500',
        commission: '₹420 (12%)',
        ownerAmount: '₹3,080',
        invoiceNo: 'INV-2026-001',
        paymentStatus: 'Pending',
        date: '2026-08-01'
    },
    {
        bookingId: 'BK-9022',
        adId: 'AD-1002',
        adName: 'Monsoon 25% Off',
        turfName: 'SkyLine Football Turf',
        bookingAmount: '₹2,400',
        commission: '₹240 (10%)',
        ownerAmount: '₹2,160',
        invoiceNo: 'INV-2026-002',
        paymentStatus: 'Paid',
        date: '2026-08-01'
    },
    {
        bookingId: 'BK-9023',
        adId: 'AD-1003',
        adName: 'Banner Impression Push',
        turfName: 'Velocity Sports Hub',
        bookingAmount: '₹5,000',
        commission: '₹750 (15%)',
        ownerAmount: '₹4,250',
        invoiceNo: 'INV-2026-003',
        paymentStatus: 'Pending',
        date: '2026-08-02'
    },
    {
        bookingId: 'BK-9024',
        adId: 'AD-1004',
        adName: 'Weekday Discount',
        turfName: 'GreenField Box Cricket',
        bookingAmount: '₹1,800',
        commission: '₹144 (8%)',
        ownerAmount: '₹1,656',
        invoiceNo: 'INV-2026-004',
        paymentStatus: 'Paid',
        date: '2026-08-02'
    },
    {
        bookingId: 'BK-9025',
        adId: 'AD-1005',
        adName: 'Guaranteed Tournament Slot',
        turfName: 'Apex Turf & Arena',
        bookingAmount: '₹6,200',
        commission: '₹868 (14%)',
        ownerAmount: '₹5,332',
        invoiceNo: 'INV-2026-005',
        paymentStatus: 'Pending',
        date: '2026-08-02'
    }
]

export default function CommissionManagement() {
    const { addToast } = useToast()
    const [commissions, setCommissions] = useState(INITIAL_COMMISSIONS)
    const [summary, setSummary] = useState({ totalPool: 2422, pendingPayouts: 2038, settledCommissions: 384 })
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedInvoice, setSelectedInvoice] = useState(null)
    const itemsPerPage = 5

    const fetchLiveCommissions = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/v1/ads/commissions');
            const data = await res.json();
            if (data.success) {
                if (Array.isArray(data.data) && data.data.length > 0) {
                    setCommissions(data.data);
                }
                if (data.summary) {
                    setSummary(data.summary);
                }
            }
        } catch (err) {
            console.error('Error fetching dynamic commissions:', err);
        }
    };

    useEffect(() => {
        fetchLiveCommissions();
    }, []);

    const filteredData = commissions.filter(item => {
        const matchesSearch = item.bookingId.toLowerCase().includes(search.toLowerCase()) ||
            item.adId.toLowerCase().includes(search.toLowerCase()) ||
            item.turfName.toLowerCase().includes(search.toLowerCase()) ||
            item.invoiceNo.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'ALL' || item.paymentStatus === statusFilter
        return matchesSearch && matchesStatus
    })

    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleMarkPaid = async (id) => {
        setCommissions(prev => prev.map(item => item.bookingId === id ? { ...item, paymentStatus: 'Paid' } : item))
        addToast({ message: `Commission for Booking ${id} marked as Paid!`, type: 'success' })
        try {
            await fetch(`http://localhost:5000/api/v1/ads/commissions/${id}/pay`, { method: 'PATCH' });
            fetchLiveCommissions();
        } catch (err) {
            console.error('Error marking commission paid:', err);
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
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

            {/* Filter Bar */}
            <Card variant="glass" className="p-4">
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
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                    </Select>
                </div>
            </Card>

            {/* Data Table */}
            <div className="bg-white/80 backdrop-blur-md border border-surface-200/60 rounded-3xl overflow-hidden shadow-soft">
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
                            {paginatedData.length > 0 ? (
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
                                            <Badge variant={item.paymentStatus === 'Paid' ? 'success' : 'warning'} dot>
                                                {item.paymentStatus}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap">
                                            {item.paymentStatus === 'Pending' ? (
                                                <Button
                                                    size="xs"
                                                    variant="primary"
                                                    onClick={() => handleMarkPaid(item.bookingId)}
                                                >
                                                    Mark Paid
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
                            <Badge variant={selectedInvoice.paymentStatus === 'Paid' ? 'success' : 'warning'} dot>
                                {selectedInvoice.paymentStatus}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs bg-surface-50/50 p-4 rounded-2xl border border-surface-100">
                            <div><span className="text-surface-500">Invoice No:</span> <span className="font-bold text-surface-900 block">{selectedInvoice.invoiceNo}</span></div>
                            <div><span className="text-surface-500">Date:</span> <span className="font-bold text-surface-900 block">{selectedInvoice.date}</span></div>
                            <div><span className="text-surface-500">Booking ID:</span> <span className="font-bold text-surface-900 block">{selectedInvoice.bookingId}</span></div>
                            <div><span className="text-surface-500">Ad Campaign:</span> <span className="font-bold text-primary-600 block">{selectedInvoice.adId}</span></div>
                        </div>

                        <div className="space-y-2 border-t border-surface-200 pt-3 text-sm">
                            <div className="flex justify-between text-surface-500 font-medium"><span>Gross Booking Amount:</span><span className="text-surface-900 font-bold">{selectedInvoice.bookingAmount}</span></div>
                            <div className="flex justify-between text-surface-500 font-medium"><span>Platform Commission Rate:</span><span className="text-emerald-600 font-bold">{selectedInvoice.commission}</span></div>
                            <div className="flex justify-between text-surface-900 font-bold border-t border-surface-200 pt-2"><span>Net Payable to Turf Owner:</span><span>{selectedInvoice.ownerAmount}</span></div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={() => setSelectedInvoice(null)}>Close</Button>
                            <Button variant="primary" onClick={() => { addToast({ message: 'Invoice download started.', type: 'info' }); setSelectedInvoice(null); }}>
                                <FiDownload className="mr-1 inline" /> Download PDF
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
