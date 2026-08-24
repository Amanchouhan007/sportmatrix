import { useState, useEffect, useCallback } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import { useToast } from '../../components/ui/Toast'
import { HiCreditCard, HiCurrencyRupee, HiDocumentText, HiTrendingUp } from 'react-icons/hi'
import { getTournamentPayments } from '../../services/tournamentService'

export default function TournamentPaymentsPage() {
    const { addToast } = useToast()
    const [payments, setPayments] = useState([])
    const [summary, setSummary] = useState({ totalRevenue: 0, totalCommission: 0, totalTransactions: 0 })
    const [isLoading, setIsLoading] = useState(true)

    const fetchPayments = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await getTournamentPayments()
            setPayments(res.data || [])
            setSummary(res.summary || { totalRevenue: 0, totalCommission: 0, totalTransactions: 0 })
        } catch (err) {
            addToast({ title: 'Load Failed', message: err.message || 'Failed to load tournament payments.', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

    useEffect(() => { fetchPayments() }, [fetchPayments])

    const columns = [
        { key: 'invoiceNumber', label: 'Invoice #', render: v => <span className="font-mono font-extrabold text-primary-600">{v}</span> },
        {
            key: 'payerName',
            label: 'Payer & Tournament',
            render: (_, r) => (
                <div>
                    <div className="font-extrabold text-surface-900">{r.payerName}</div>
                    <div className="text-[11px] text-surface-400 font-medium">{r.tournament?.title || ''}</div>
                </div>
            )
        },
        {
            key: 'transactionType',
            label: 'Transaction Type',
            render: v => <Badge variant={v === 'Entry Fee' ? 'primary' : 'success'}>{v}</Badge>
        },
        { key: 'amount', label: 'Amount', render: v => <span className="font-extrabold text-surface-900">₹{Number(v).toLocaleString('en-IN')}</span> },
        { key: 'commissionAmount', label: 'Platform Commission', render: (v, r) => <span className="font-bold text-emerald-600">₹{Number(v).toLocaleString('en-IN')} ({Number(r.platformCommRate)}%)</span> },
        { key: 'paymentMode', label: 'Method' },
        { key: 'status', label: 'Status', render: v => <Badge variant={v === 'COMPLETED' ? 'success' : v === 'PENDING' ? 'warning' : 'danger'} dot>{v}</Badge> },
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
                    value={`₹${summary.totalRevenue.toLocaleString('en-IN')}`}
                    icon={<HiCurrencyRupee className="w-6 h-6 text-primary-600" />}
                    subtitle="Real ledger total"
                />
                <StatCard
                    title="Platform Commission"
                    value={`₹${summary.totalCommission.toLocaleString('en-IN')}`}
                    icon={<HiTrendingUp className="w-6 h-6 text-emerald-500" />}
                    subtitle="Auto calculated on fees & sponsors"
                />
                <StatCard
                    title="Total Transactions"
                    value={summary.totalTransactions}
                    icon={<HiDocumentText className="w-6 h-6 text-indigo-500" />}
                    subtitle="Recorded tournament payments"
                />
            </div>

            {/* Datatable */}
            <Card className="p-6">
                {isLoading ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">Loading payments...</div>
                ) : payments.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">No tournament payments recorded yet.</div>
                ) : (
                    <DataTable columns={columns} data={payments} />
                )}
            </Card>
        </div>
    )
}
