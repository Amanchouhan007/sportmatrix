import { useState, useEffect, useCallback } from 'react'
import WalletCard from '../../components/ui/WalletCard'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import api from '../../services/api'
import useRealtime from '../../utils/useRealtime'

const columns = [
    {
        key: 'id',
        label: 'Transaction ID',
        render: v => <span className="font-mono font-black text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-xs">{v}</span>
    },
    { key: 'type', label: 'Type', render: v => <Badge variant={v === 'BOOKING' ? 'primary' : v === 'REFUND' || v === 'PRIZE' ? 'success' : v === 'TOURNAMENT' ? 'warning' : 'default'}>{v}</Badge> },
    { key: 'desc', label: 'Description', render: v => <span className="font-bold text-slate-900">{v}</span> },
    {
        key: 'amount',
        label: 'Amount',
        render: v => (
            <span className={v.startsWith('+') ? 'text-emerald-700 font-black font-mono text-sm bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block' : 'text-slate-900 font-extrabold font-mono text-sm'}>
                {v}
            </span>
        )
    },
    { key: 'date', label: 'Date', render: v => <span className="font-mono font-semibold text-slate-600 text-xs">📅 {v}</span> },
    { key: 'status', label: 'Status', render: v => <Badge variant="success" dot>{v}</Badge> },
]

export default function CustomerWallet() {
    const { addToast } = useToast()
    const [balance, setBalance] = useState(0)
    const [locked, setLocked] = useState(0)
    const [txns, setTxns] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [customAmount, setCustomAmount] = useState('')
    const [isToppingUp, setIsToppingUp] = useState(false)

    const fetchWalletData = useCallback(() => {
        setIsLoading(true)
        Promise.all([api.get('/wallet/me'), api.get('/wallet/transactions')])
            .then(([balanceRes, txnRes]) => {
                if (balanceRes && balanceRes.success && balanceRes.data) {
                    setBalance(balanceRes.data.balance || 0)
                    setLocked(balanceRes.data.locked || 0)
                }
                if (txnRes && txnRes.success && Array.isArray(txnRes.data)) {
                    setTxns(txnRes.data.map(t => ({ id: t.id, type: t.type, desc: t.desc, amount: t.amount, date: t.date, status: t.status })))
                }
            })
            .catch(() => {})
            .finally(() => setIsLoading(false))
    }, [])

    useEffect(() => { fetchWalletData() }, [fetchWalletData])
    useRealtime(['wallet:updated', 'payment:settled'], () => fetchWalletData())

    const handleTopUp = async (amount) => {
        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) {
            addToast({ title: 'Invalid Amount', message: 'Please enter a valid top-up amount.', type: 'error' })
            return
        }
        setIsToppingUp(true)
        try {
            const res = await api.post('/wallet/topup', { amount: numAmount })
            if (!res || res.success === false) throw new Error(res?.message || 'Top-up failed.')
            addToast({ title: 'Wallet Credited', message: `₹${numAmount.toLocaleString('en-IN')} added to your wallet.`, type: 'success' })
            setCustomAmount('')
            fetchWalletData()
        } catch (err) {
            addToast({ title: 'Top-up Failed', message: err.message || 'Could not complete top-up.', type: 'error' })
        } finally {
            setIsToppingUp(false)
        }
    }

    const totalSpent = txns
        .filter(t => t.amount.startsWith('-'))
        .reduce((acc, t) => acc + parseFloat(t.amount.replace(/[-₹,]/g, '') || 0), 0)

    const bookingCount = txns.filter(t => t.type === 'BOOKING').length

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">My Wallet</h1>
                <p className="text-surface-500 text-sm mt-1">Balance, transactions, and top-up</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <WalletCard balance={balance} locked={locked} />

                <Card>
                    <p className="text-sm text-surface-500">Total Spent</p>
                    <p className="text-2xl font-bold text-surface-900 mt-1">₹{totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-surface-400 mt-2">Across {bookingCount} bookings</p>
                </Card>

                <Card>
                    <p className="text-sm text-surface-500 mb-3">Quick Top-up</p>
                    <div className="flex gap-2 mb-3">
                        {['500', '1000', '2000'].map(a => (
                            <button
                                key={a}
                                onClick={() => handleTopUp(a)}
                                disabled={isToppingUp}
                                className="px-3 py-1.5 bg-surface-100 rounded-lg text-sm font-medium text-surface-700 hover:bg-primary-50 hover:text-primary-600 cursor-pointer transition-colors disabled:opacity-50"
                            >
                                ₹{a}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Custom amount"
                            className="flex-1"
                            type="number"
                            value={customAmount}
                            onChange={e => setCustomAmount(e.target.value)}
                        />
                        <Button onClick={() => handleTopUp(customAmount)} disabled={isToppingUp}>{isToppingUp ? 'Adding...' : 'Add'}</Button>
                    </div>
                </Card>
            </div>

            {isLoading ? (
                <div className="py-10 text-center text-slate-400 text-sm font-semibold">Loading transactions...</div>
            ) : txns.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm font-semibold">No wallet transactions yet.</div>
            ) : (
                <DataTable columns={columns} data={txns} />
            )}
        </div>
    )
}
