import { useState, useEffect } from 'react'
import WalletCard from '../../components/ui/WalletCard'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'

const initialTransactions = [
    { id: 'TXN-001', type: 'Booking', desc: 'Cricket - SportZone Arena', amount: '-₹800', date: 'Mar 1, 2026', status: 'Completed' },
    { id: 'TXN-002', type: 'Tournament', desc: 'PCL Entry Fee', amount: '-₹500', date: 'Feb 28, 2026', status: 'Completed' },
    { id: 'TXN-003', type: 'Refund', desc: 'Booking BK-004 refund', amount: '+₹1,200', date: 'Feb 25, 2026', status: 'Completed' },
    { id: 'TXN-004', type: 'Top-up', desc: 'Wallet top-up', amount: '+₹2,000', date: 'Feb 20, 2026', status: 'Completed' },
    { id: 'TXN-005', type: 'Prize', desc: 'Cricket Tournament Winner', amount: '+₹5,000', date: 'Feb 15, 2026', status: 'Completed' },
]

const columns = [
    { key: 'id', label: 'ID' },
    { key: 'type', label: 'Type', render: v => <Badge variant={v === 'Booking' ? 'primary' : v === 'Refund' || v === 'Prize' ? 'success' : v === 'Tournament' ? 'warning' : 'default'}>{v}</Badge> },
    { key: 'desc', label: 'Description' },
    { key: 'amount', label: 'Amount', render: v => <span className={v.startsWith('+') ? 'text-accent-600 font-semibold' : 'text-surface-900 font-semibold'}>{v}</span> },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status', render: v => <Badge variant="success" dot>{v}</Badge> },
]

export default function CustomerWallet() {
    const [balance, setBalance] = useState(() => {
        const saved = localStorage.getItem('customer_balance')
        return saved ? parseFloat(saved) : 2450
    })

    const [txns, setTxns] = useState(() => {
        const saved = localStorage.getItem('customer_transactions')
        return saved ? JSON.parse(saved) : initialTransactions
    })

    const [customAmount, setCustomAmount] = useState('')

    useEffect(() => {
        localStorage.setItem('customer_balance', balance.toString())
    }, [balance])

    useEffect(() => {
        localStorage.setItem('customer_transactions', JSON.stringify(txns))
    }, [txns])

    const handleTopUp = (amount) => {
        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) return

        const newBalance = balance + numAmount
        setBalance(newBalance)

        const newTxn = {
            id: `TXN-${String(txns.length + 1).padStart(3, '0')}`,
            type: 'Top-up',
            desc: 'Wallet top-up',
            amount: `+₹${numAmount.toLocaleString()}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'Completed'
        }
        setTxns([newTxn, ...txns])
        setCustomAmount('')
    }

    const totalSpent = txns
        .filter(t => t.amount.startsWith('-'))
        .reduce((acc, t) => acc + parseFloat(t.amount.replace(/[-₹,]/g, '')), 0)

    const bookingCount = txns.filter(t => t.type === 'Booking').length

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">My Wallet</h1>
                <p className="text-surface-500 text-sm mt-1">Balance, transactions, and top-up</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
                <WalletCard balance={balance} locked={500} />
                
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
                                className="px-3 py-1.5 bg-surface-100 rounded-lg text-sm font-medium text-surface-700 hover:bg-primary-50 hover:text-primary-600 cursor-pointer transition-colors"
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
                        <Button onClick={() => handleTopUp(customAmount)}>Add</Button>
                    </div>
                </Card>
            </div>

            <DataTable columns={columns} data={txns} />
        </div>
    )
}
