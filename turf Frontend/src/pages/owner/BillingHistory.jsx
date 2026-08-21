import { useState, useEffect } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import api from '../../services/api'

const columns = [
    { key: 'id', label: 'Invoice' },
    { key: 'customer', label: 'Customer' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount' },
    { key: 'method', label: 'Payment Method' },
    { key: 'status', label: 'Status', render: (value) => <Badge variant={value === 'Completed' ? 'success' : value === 'Pending' ? 'warning' : 'default'} dot>{value}</Badge> },
    { key: 'date', label: 'Date' },
]

export default function BillingHistory() {
    const [billingHistory, setBillingHistory] = useState([])

    useEffect(() => {
        api.get('/billing/history')
            .then(res => {
                if (res.data && res.data.success && Array.isArray(res.data.data)) {
                    const mapped = res.data.data.map(b => ({
                        id: b.id || b.paymentId || `INV-${b.id}`,
                        customer: b.user || b.customerName || b.customer || 'Customer',
                        type: b.type || 'Turf Booking',
                        amount: b.amount ? `₹${Number(b.amount).toLocaleString('en-IN')}` : '₹0',
                        method: b.method || b.payment_mode || 'UPI',
                        status: b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'Completed' : 'Pending',
                        date: b.date ? b.date.split('T')[0] : (b.created_at ? b.created_at.split('T')[0] : 'Today')
                    }))
                    setBillingHistory(mapped)
                } else {
                    setBillingHistory([])
                }
            })
            .catch(e => {
                console.warn('Fetch billing history note:', e.message)
                setBillingHistory([])
            })
    }, [])

    return (
        <div className="space-y-4">
            <div className="p-2 text-slate-900">
                <div className="space-y-3">
                    <h1 className="text-xl font-black tracking-tight">Billing History</h1>
                    <p className="max-w-xl text-sm text-slate-500">Premium ledger view for POS invoices and payment status across walk-in sales.</p>
                </div>
            </div>

            <Card className="overflow-hidden border border-slate-200/70 bg-white/95 shadow-2xl shadow-slate-900/10">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-200/70 bg-slate-50/90 px-5 py-4">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500 font-semibold">Transaction ledger</p>
                        <h2 className="text-lg font-black text-slate-950 mt-1">Recent POS Invoices</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase text-slate-600">Live sync</span>
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase text-slate-600">POS audit</span>
                    </div>
                </div>
                <div className="p-4">
                    <DataTable columns={columns} data={billingHistory} />
                </div>
            </Card>
        </div>
    )
}
