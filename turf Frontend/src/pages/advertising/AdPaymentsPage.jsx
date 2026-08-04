import { useState } from 'react'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import { useToast } from '../../components/ui/Toast'
import { FiSearch, FiFileText, FiDownload, FiEye, FiCreditCard } from 'react-icons/fi'

const INITIAL_PAYMENTS = [
    {
        invoiceId: 'INV-2026-801',
        adName: 'Champions Guaranteed Booking',
        adId: 'AD-1001',
        ownerName: 'Rahul Sharma',
        turfName: 'Champions Turf Arena',
        amount: '₹15,000',
        status: 'Paid',
        date: '2026-08-01',
        paymentMethod: 'Bank Transfer (NEFT)'
    },
    {
        invoiceId: 'INV-2026-802',
        adName: 'Monsoon 25% Off',
        adId: 'AD-1002',
        ownerName: 'Anita Desai',
        turfName: 'SkyLine Football Turf',
        amount: '₹8,000',
        status: 'Pending',
        date: '2026-08-01',
        paymentMethod: 'UPI Settlement'
    },
    {
        invoiceId: 'INV-2026-803',
        adName: 'Top Impression Push',
        adId: 'AD-1003',
        ownerName: 'Vikram Singh',
        turfName: 'Velocity Sports Hub',
        amount: '₹25,000',
        status: 'Paid',
        date: '2026-07-28',
        paymentMethod: 'Razorpay Payout'
    },
    {
        invoiceId: 'INV-2026-804',
        adName: 'Weekday Discount Campaign',
        adId: 'AD-1004',
        ownerName: 'Sanjay Patel',
        turfName: 'GreenField Box Cricket',
        amount: '₹5,000',
        status: 'Paid',
        date: '2026-07-25',
        paymentMethod: 'Bank Transfer (IMPS)'
    },
    {
        invoiceId: 'INV-2026-805',
        adName: 'Weekend Floodlight Push',
        adId: 'AD-1005',
        ownerName: 'Meera Nair',
        turfName: 'Apex Turf & Arena',
        amount: '₹20,000',
        status: 'Pending',
        date: '2026-07-20',
        paymentMethod: 'UPI Settlement'
    }
]

export default function AdPaymentsPage() {
    const { addToast } = useToast()
    const [payments, setPayments] = useState(INITIAL_PAYMENTS)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [currentPage, setCurrentPage] = useState(1)
    const [viewInvoiceModal, setViewInvoiceModal] = useState(null)
    const itemsPerPage = 5

    const filteredPayments = payments.filter(item => {
        const matchesSearch = item.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
            item.adName.toLowerCase().includes(search.toLowerCase()) ||
            item.ownerName.toLowerCase().includes(search.toLowerCase()) ||
            item.turfName.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1
    const paginatedPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl shadow-inner shadow-emerald-500/5">
                        <FiCreditCard className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-surface-900 tracking-tight">Advertisement Payments</h1>
                        <p className="text-surface-500 text-sm mt-0.5 font-medium">Audit campaign billing invoices, payment statuses, and downloadable receipts</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <Card variant="glass" className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <Input
                            placeholder="Search by Invoice, Ad, Owner or Turf..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                    </Select>
                </div>
            </Card>

            {/* Table */}
            <div className="bg-white/80 backdrop-blur-md border border-surface-200/60 rounded-3xl overflow-hidden shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-surface-700">
                        <thead className="bg-surface-50/80 text-xs font-bold uppercase tracking-wider text-surface-500 border-b border-surface-200/60">
                            <tr>
                                <th className="px-5 py-4">Invoice ID</th>
                                <th className="px-5 py-4">Advertisement</th>
                                <th className="px-5 py-4">Owner & Turf</th>
                                <th className="px-5 py-4">Amount</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Date</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100">
                            {paginatedPayments.length > 0 ? (
                                paginatedPayments.map((item) => (
                                    <tr key={item.invoiceId} className="hover:bg-surface-50/50 transition-colors">
                                        <td className="px-5 py-4 font-mono font-bold text-surface-900 whitespace-nowrap">{item.invoiceId}</td>
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-surface-900">{item.adName}</div>
                                            <div className="text-xs text-surface-500 font-medium">ID: {item.adId}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-surface-900">{item.ownerName}</div>
                                            <div className="text-xs text-surface-500 font-medium">{item.turfName}</div>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-surface-900">{item.amount}</td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <Badge variant={item.status === 'Paid' ? 'success' : 'warning'} dot>
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-surface-500 font-medium whitespace-nowrap">{item.date}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewInvoiceModal(item)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-xs font-bold text-surface-700 cursor-pointer transition-colors"
                                                >
                                                    <FiEye /> View
                                                </button>
                                                <button
                                                    onClick={() => addToast({ message: `Downloading invoice ${item.invoiceId}...`, type: 'info' })}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-600 cursor-pointer transition-colors"
                                                >
                                                    <FiDownload /> Download
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-5 py-8 text-center text-surface-400 font-medium">
                                        No advertisement payments found.
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

            {/* View Invoice Modal */}
            {viewInvoiceModal && (
                <Modal isOpen={!!viewInvoiceModal} onClose={() => setViewInvoiceModal(null)} title={`Tax Invoice - ${viewInvoiceModal.invoiceId}`}>
                    <div className="space-y-4 text-surface-700">
                        <div className="flex justify-between items-center bg-surface-50 p-4 rounded-2xl border border-surface-200">
                            <div>
                                <h3 className="font-bold text-surface-900 text-base">SportMatrix Ads Billing</h3>
                                <p className="text-xs text-surface-500 font-medium">GST Registration: 27AAAAA0000A1Z5</p>
                            </div>
                            <Badge variant={viewInvoiceModal.status === 'Paid' ? 'success' : 'warning'} dot>
                                {viewInvoiceModal.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs bg-surface-50/50 p-4 rounded-2xl border border-surface-100">
                            <div><span className="text-surface-500">Invoice Number:</span> <span className="font-bold text-surface-900 block">{viewInvoiceModal.invoiceId}</span></div>
                            <div><span className="text-surface-500">Billing Date:</span> <span className="font-bold text-surface-900 block">{viewInvoiceModal.date}</span></div>
                            <div><span className="text-surface-500">Turf Owner:</span> <span className="font-bold text-surface-900 block">{viewInvoiceModal.ownerName}</span></div>
                            <div><span className="text-surface-500">Payment Mode:</span> <span className="font-bold text-primary-600 block">{viewInvoiceModal.paymentMethod}</span></div>
                        </div>

                        <div className="border-t border-surface-200 pt-3 space-y-2 text-sm">
                            <div className="flex justify-between font-medium"><span className="text-surface-500">Campaign Name:</span><span className="text-surface-900 font-bold">{viewInvoiceModal.adName}</span></div>
                            <div className="flex justify-between font-medium"><span className="text-surface-500">Ad Campaign ID:</span><span className="text-surface-700 font-mono">{viewInvoiceModal.adId}</span></div>
                            <div className="flex justify-between border-t border-surface-200 pt-2 font-bold text-surface-900"><span>Total Amount Paid:</span><span className="text-emerald-600 text-base">{viewInvoiceModal.amount}</span></div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={() => setViewInvoiceModal(null)}>Close</Button>
                            <Button variant="primary" onClick={() => { addToast({ message: `Invoice ${viewInvoiceModal.invoiceId} downloaded.`, type: 'info' }); setViewInvoiceModal(null); }}>
                                <FiDownload className="mr-1 inline" /> Download PDF
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
