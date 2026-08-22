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
import { FiSearch, FiFileText, FiDownload, FiEye, FiCreditCard } from 'react-icons/fi'
import { getAdPayments } from '../../services/adsService'

const INITIAL_PAYMENTS = []
export default function AdPaymentsPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : location.pathname.startsWith('/staff') ? '/staff' : '/admin'
    const { addToast } = useToast()
    const [payments, setPayments] = useState([])
    const [search, setSearch] = useState('')
    const [viewInvoiceModal, setViewInvoiceModal] = useState(null)
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const result = await getAdPayments();
                if (result && result.success !== false && Array.isArray(result.data)) {
                    setPayments(result.data);
                }
            } catch (err) {
                console.error('Error fetching ad payments:', err);
            }
        };
        fetchPayments();
    }, []);

    const triggerFastAdInvoicePrint = (inv) => {
        if (!inv) return;
        const iframeHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${inv.invoiceId}</title>
                <style>
                    @page { size: A4 portrait; margin: 8mm; }
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #111827; }
                    .card { max-width: 650px; margin: 0 auto; border: 2px solid #111827; padding: 24px; border-radius: 14px; background: #fff; }
                    .header { border-bottom: 2px solid #16A34A; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
                    .header h2 { margin: 0; font-size: 20px; font-weight: 900; }
                    .meta-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px border-slate-100; font-size: 13px; }
                    .total { background: #0F172A; color: #fff; padding: 14px 18px; border-radius: 10px; font-size: 16px; font-weight: bold; margin-top: 20px; display: flex; justify-content: space-between; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="header">
                        <div>
                            <h2>SPORTMATRIX ADVERTISING</h2>
                            <p style="margin: 4px 0 0 0; color: #64748B; font-size: 12px;">Invoice Ref: <strong>${inv.invoiceId}</strong></p>
                        </div>
                        <div style="text-align:right;">
                            <strong style="color: #16A34A; font-size: 14px;">OFFICIAL TAX INVOICE</strong>
                            <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: bold;">Status: ${inv.status?.toUpperCase() || 'PAID'} 🟢</p>
                        </div>
                    </div>
                    <div class="meta-row"><span>Advertiser / Owner:</span><strong>${inv.ownerName || inv.advertiser || 'Valued Owner'}</strong></div>
                    <div class="meta-row"><span>Turf Venue:</span><strong>${inv.turfName || 'SportMatrix Arena'}</strong></div>
                    <div class="meta-row"><span>Campaign Name:</span><strong>${inv.adName || 'Ad Campaign'}</strong></div>
                    <div class="meta-row"><span>Ad Campaign ID:</span><strong style="font-family: monospace;">${inv.adId || 'AD-1001'}</strong></div>
                    <div class="meta-row"><span>Payment Method:</span><strong>${inv.paymentMethod || inv.method || 'UPI Settlement'}</strong></div>
                    <div class="total"><span>Grand Total Paid:</span><span>${inv.amount}</span></div>
                </div>
            </body>
            </html>
        `;
        let iframe = document.getElementById('ad-invoice-print-frame');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'ad-invoice-print-frame';
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            iframe.style.visibility = 'hidden';
            document.body.appendChild(iframe);
        }
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(iframeHTML);
        doc.close();
        setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); }, 50);
        if (addToast) addToast({ message: `Generating PDF Invoice ${inv.invoiceId}...`, type: 'info' });
    };

    const activePaymentsList = Array.isArray(payments) ? payments : [];

    const filteredPayments = activePaymentsList.filter(item => {
        if (!item) return false;
        const matchesSearch = String(item.invoiceId || '').toLowerCase().includes(search.toLowerCase()) ||
            String(item.adName || '').toLowerCase().includes(search.toLowerCase()) ||
            String(item.ownerName || '').toLowerCase().includes(search.toLowerCase()) ||
            String(item.turfName || '').toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1
    const paginatedPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleMarkPaid = (invoiceId) => {
        setPayments(prev => prev.map(item => item.invoiceId === invoiceId ? { ...item, status: 'Paid' } : item))
        addToast({ message: `Payment for Invoice ${invoiceId} marked as Paid!`, type: 'success' })
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
                            <h1 className="text-2xl font-black text-surface-900 tracking-tight">Ad Payments & Settlements</h1>
                            <p className="text-surface-500 text-sm mt-0.5 font-medium">Track owner ad payouts, bank settlements, and billing statements</p>
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
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
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
                        className="px-4 py-2 rounded-xl text-xs font-black bg-[#10B981] text-white shadow-xs"
                    >
                        💳 Payments
                    </button>
                </div>
            </div>

            {/* Merged Filter Bar & Table into 1 Single Card */}
            <div className="bg-white/90 backdrop-blur-md border border-surface-200/80 rounded-3xl overflow-hidden shadow-soft">
                {/* Filter Bar Header */}
                <div className="p-4.5 border-b border-surface-100 bg-surface-50/50">
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
                </div>

                {/* Table */}
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
                                                    onClick={() => triggerFastAdInvoicePrint(item)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-600 cursor-pointer transition-colors shadow-2xs"
                                                >
                                                    <FiDownload /> Download PDF
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
                            <Button variant="primary" onClick={() => {
                                const inv = viewInvoiceModal;
                                const iframeHTML = `
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                        <title>Invoice ${inv.invoiceId}</title>
                                        <style>
                                            @page { size: A4 portrait; margin: 8mm; }
                                            body { font-family: sans-serif; padding: 20px; color: #111827; }
                                            .card { max-width: 600px; margin: 0 auto; border: 2px solid #111827; padding: 20px; border-radius: 12px; }
                                            .header { border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; }
                                            .total { background: #111827; color: #fff; padding: 12px; border-radius: 8px; font-size: 18px; font-weight: bold; margin-top: 15px; display: flex; justify-content: space-between; }
                                        </style>
                                    </head>
                                    <body>
                                        <div class="card">
                                            <div class="header">
                                                <div><h2>SPORTMATRIX ADVERTISING</h2><p>Ref: ${inv.invoiceId}</p></div>
                                                <div style="text-align:right;"><strong>OFFICIAL TAX INVOICE</strong><p>Status: PAID 🟢</p></div>
                                            </div>
                                            <p><strong>Advertiser:</strong> ${inv.advertiser}</p>
                                            <p><strong>Campaign Name:</strong> ${inv.adName}</p>
                                            <p><strong>Payment Method:</strong> ${inv.method}</p>
                                            <p><strong>Date:</strong> ${inv.date}</p>
                                            <div class="total">
                                                <span>Total Amount Paid (Zero GST Tax)</span>
                                                <span style="color:#c8ff2e;">${inv.amount}</span>
                                            </div>
                                        </div>
                                    </body>
                                    </html>
                                `;
                                let iframe = document.getElementById('fast-ad-print-frame');
                                if (!iframe) {
                                    iframe = document.createElement('iframe');
                                    iframe.id = 'fast-ad-print-frame';
                                    iframe.style.position = 'fixed';
                                    iframe.style.right = '0';
                                    iframe.style.bottom = '0';
                                    iframe.style.width = '0';
                                    iframe.style.height = '0';
                                    iframe.style.border = '0';
                                    iframe.style.visibility = 'hidden';
                                    document.body.appendChild(iframe);
                                }
                                const doc = iframe.contentWindow.document;
                                doc.open();
                                doc.write(iframeHTML);
                                doc.close();
                                setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); }, 50);
                                if (addToast) addToast({ message: `Invoice ${viewInvoiceModal.invoiceId} generating...`, type: 'info' });
                                setViewInvoiceModal(null);
                            }}>
                                <FiDownload className="mr-1 inline" /> Download PDF / Print
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
