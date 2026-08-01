import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'

const billingHistory = [
    { id: 'INV-1001', customer: 'Amit Sharma', type: 'Turf Booking', amount: '₹1,200', method: 'UPI', status: 'Completed', date: 'May 22, 2026' },
    { id: 'INV-1002', customer: 'Neha Patel', type: 'Equipment Rental', amount: '₹420', method: 'Cash', status: 'Completed', date: 'May 23, 2026' },
    { id: 'INV-1003', customer: 'Karan Singh', type: 'Gaming Session', amount: '₹650', method: 'Card', status: 'Completed', date: 'May 24, 2026' },
    { id: 'INV-1004', customer: 'Pooja Verma', type: 'Turf Booking', amount: '₹980', method: 'UPI', status: 'Pending', date: 'May 25, 2026' },
    { id: 'INV-1005', customer: 'Ravi Kumar', type: 'Merchandise', amount: '₹320', method: 'Cash', status: 'Completed', date: 'May 26, 2026' },
]

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
    return (
        <div className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-gradient-to-r from-cyan-50 via-slate-50 to-rose-50 p-6 shadow-soft text-slate-900">
                <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-600 font-semibold">Owner Finance</p>
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
