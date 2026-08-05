import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import { HiCreditCard, HiCurrencyRupee, HiDocumentText, HiTrendingUp } from 'react-icons/hi'

const mockPayments = [
    { id: 1, tournamentTitle: 'Premier Cricket Cup', transactionType: 'Entry Fee', invoiceNumber: 'INV-TRN-1001', payerName: 'Indore Thunders', amount: 500, commissionAmount: 50, paymentMethod: 'UPI', status: 'COMPLETED', date: '2026-03-01' },
    { id: 2, tournamentTitle: 'Premier Cricket Cup', transactionType: 'Sponsor Payment', invoiceNumber: 'INV-SPN-2001', payerName: 'RedBull Energy', amount: 50000, commissionAmount: 5000, paymentMethod: 'CARD', status: 'COMPLETED', date: '2026-03-02' },
    { id: 3, tournamentTitle: 'Indore Football Cup', transactionType: 'Entry Fee', invoiceNumber: 'INV-TRN-1002', payerName: 'Red Devils Futsal', amount: 800, commissionAmount: 80, paymentMethod: 'WALLET', status: 'COMPLETED', date: '2026-03-05' },
    { id: 4, tournamentTitle: 'Football Open Arena', transactionType: 'Sponsor Payment', invoiceNumber: 'INV-SPN-2002', payerName: 'Nike Sports', amount: 30000, commissionAmount: 3000, paymentMethod: 'UPI', status: 'COMPLETED', date: '2026-02-28' },
]

export default function TournamentPaymentsPage() {
    const [payments] = useState(mockPayments)

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
    const totalCommission = payments.reduce((sum, p) => sum + p.commissionAmount, 0)

    const columns = [
        { key: 'invoiceNumber', label: 'Invoice #', render: v => <span className="font-mono font-extrabold text-primary-600">{v}</span> },
        { 
            key: 'payerName', 
            label: 'Payer & Tournament', 
            render: (_, r) => (
                <div>
                    <div className="font-extrabold text-surface-900">{r.payerName}</div>
                    <div className="text-[11px] text-surface-400 font-medium">{r.tournamentTitle}</div>
                </div>
            ) 
        },
        { 
            key: 'transactionType', 
            label: 'Transaction Type',
            render: v => <Badge variant={v === 'Entry Fee' ? 'primary' : 'success'}>{v}</Badge>
        },
        { key: 'amount', label: 'Amount', render: v => <span className="font-extrabold text-surface-900">₹{v.toLocaleString()}</span> },
        { key: 'commissionAmount', label: 'Platform Comm. (10%)', render: v => <span className="font-bold text-emerald-600">₹{v.toLocaleString()}</span> },
        { key: 'paymentMethod', label: 'Method' },
        { key: 'status', label: 'Status', render: v => <Badge variant="success" dot>{v}</Badge> },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        <HiCreditCard className="text-primary-600" /> Tournament Payments & Commission Engine
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Track team entry fees, sponsor deposits, platform commission, and invoice logs</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard
                    title="Total Tournament Revenue"
                    value={`₹${totalRevenue.toLocaleString()}`}
                    icon={<HiCurrencyRupee className="w-6 h-6 text-primary-600" />}
                    trend="+18% vs last month"
                    trendUp={true}
                />
                <StatCard
                    title="Platform Commission (10%)"
                    value={`₹${totalCommission.toLocaleString()}`}
                    icon={<HiTrendingUp className="w-6 h-6 text-emerald-500" />}
                    subtitle="Auto calculated on fees & sponsors"
                />
                <StatCard
                    title="Completed Transactions"
                    value={payments.length}
                    icon={<HiDocumentText className="w-6 h-6 text-indigo-500" />}
                    subtitle="100% Settled via Gateway"
                />
            </div>

            {/* Datatable */}
            <Card className="p-6">
                <DataTable columns={columns} data={payments} />
            </Card>
        </div>
    )
}
