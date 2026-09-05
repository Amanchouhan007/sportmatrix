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
    { 
        key: 'status', 
        label: 'Status', 
        render: (value) => {
            let variant = 'warning';
            if (value === 'Completed') variant = 'success';
            else if (value === 'Refunded' || value === 'Cancelled') variant = 'danger';
            return <Badge variant={variant} dot>{value}</Badge>;
        } 
    },
    { key: 'date', label: 'Date' },
]

export default function BillingHistory() {
    const [billingHistory, setBillingHistory] = useState([])

    useEffect(() => {
        api.get('/billing/history')
            .then(res => {
                const list = res?.data || (Array.isArray(res) ? res : []);
                if (Array.isArray(list)) {
                    const mapped = list.map(b => {
                        const rawStatus = (b.status || '').toUpperCase();
                        let displayStatus = 'Pending';
                        if (rawStatus === 'COMPLETED' || rawStatus === 'CONFIRMED' || rawStatus === 'PAID') {
                            displayStatus = 'Completed';
                        } else if (rawStatus === 'REFUNDED') {
                            displayStatus = 'Refunded';
                        } else if (rawStatus === 'CANCELLED' || rawStatus === 'FAILED') {
                            displayStatus = 'Cancelled';
                        }

                        return {
                            id: b.invoiceNumber || b.id || b.paymentId || `INV-${b.id}`,
                            customer: b.customerName || b.customer || b.user?.fullName || b.user || 'Customer',
                            type: b.type || 'Turf Booking',
                            amount: b.amount ? `₹${Number(b.amount).toLocaleString('en-IN')}` : '₹0',
                            method: b.paymentMethod || b.method || b.payment_mode || 'UPI',
                            status: displayStatus,
                            date: b.date ? String(b.date).split('T')[0] : (b.createdAt ? String(b.createdAt).split('T')[0] : 'Today')
                        };
                    });
                    setBillingHistory(mapped);
                } else {
                    setBillingHistory([]);
                }
            })
            .catch(e => {
                console.warn('Fetch billing history note:', e.message);
                setBillingHistory([]);
            });
    }, []);


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
