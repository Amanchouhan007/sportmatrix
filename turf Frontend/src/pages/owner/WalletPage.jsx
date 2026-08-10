import { useState } from 'react'
import WalletCard from '../../components/ui/WalletCard'

import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'
import { HiCreditCard, HiCash, HiTrendingUp, HiArrowDown, HiCheckCircle } from 'react-icons/hi'

const transactions = [
  { id: 'TXN-001', type: 'Booking', amount: '+₹800', commission: '-₹64', net: '₹736', date: 'Mar 1, 2026', status: 'Completed' },
  { id: 'TXN-002', type: 'Tournament', amount: '+₹8,000', commission: '-₹640', net: '₹7,360', date: 'Mar 1, 2026', status: 'Completed' },
  { id: 'TXN-003', type: 'Hire Escrow', amount: '+₹2,000', commission: '—', net: '₹2,000', date: 'Feb 28, 2026', status: 'Held' },
  { id: 'TXN-004', type: 'Refund', amount: '-₹400', commission: '+₹32', net: '-₹368', date: 'Feb 27, 2026', status: 'Refunded' },
]

const columns = [
  { key: 'id', label: 'TXN ID' },
  { key: 'type', label: 'Type', render: v => <Badge variant="primary">{v}</Badge> },
  { key: 'amount', label: 'Gross Amount', render: v => <span className={v.startsWith('+') ? 'text-emerald-600 font-extrabold' : 'text-red-500 font-extrabold'}>{v}</span> },
  { key: 'commission', label: 'Platform Comm.' },
  { key: 'net', label: 'Settled Net', render: v => <span className="font-black text-surface-900">{v}</span> },
  { key: 'date', label: 'Payout Date' },
  {
    key: 'status',
    label: 'Payout Status',
    render: v => <Badge variant={v === 'Completed' ? 'success' : v === 'Held' ? 'warning' : 'danger'} dot>{v}</Badge>
  },
]

export default function WalletPage() {
  const { addToast } = useToast()
  const [withdrawModal, setWithdrawModal] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [payoutMethod, setPayoutMethod] = useState('UPI')
  const [details, setDetails] = useState({ upi: '', bank: '', ifsc: '' })

  const handleWithdrawTrigger = () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      addToast({ title: 'Invalid Amount', message: 'Please specify withdrawal amount first', type: 'error' })
      return
    }

    if (Number(withdrawAmount) > 124500) {
      addToast({ title: 'Insufficient Funds', message: 'Withdrawal request exceeds current settled limit', type: 'error' })
      return
    }

    setWithdrawModal(false)
    setSuccessModal(true)
    addToast({ title: 'Payout Initiated', message: `Withdrawal of ₹${withdrawAmount} successfully submitted`, type: 'success' })
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-surface-200/60 shadow-soft">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
            Financial Ledger &amp; Payouts
          </h1>
          <p className="text-surface-500 text-xs sm:text-sm mt-0.5 font-medium">Verify daily balance transfers, settle locked client escrow, or initiate payouts</p>
        </div>
        <Button onClick={() => setWithdrawModal(true)} className="w-full sm:w-auto justify-center shadow-lg shadow-primary-500/10 cursor-pointer">
          <HiArrowDown className="w-5 h-5 mr-1" /> Withdraw Funds
        </Button>
      </div>

      {/* Premium Payout Suite */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Visual Debit Card element */}
        <div className="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between h-52 sm:h-56 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full group-hover:scale-125 transition-transform" />

          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">SportMatrix Platinum Business</span>
              <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">₹1,24,500</h4>
            </div>
            <span className="text-2xl font-black italic text-emerald-500">SM</span>
          </div>

          <div className="text-xs space-y-1 font-mono">
            <p className="tracking-widest text-surface-400">**** **** **** 8848</p>
            <div className="flex justify-between text-[10px] text-surface-400 uppercase pt-2">
              <span>Admin Controller</span>
              <span>Locked Escrow: ₹5,000</span>
            </div>
          </div>
        </div>

        {/* Total Commission Paid */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-surface-200/60 p-5 sm:p-6 shadow-soft flex flex-col justify-between h-52 sm:h-56">
          <div className="space-y-2">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider block">Total Commission Paid</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-surface-900">₹28,640</h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-surface-450 mt-1">
              8% flat platform commission rate
            </span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-md">
            <HiCash className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Revenue stats */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-surface-200/60 p-5 sm:p-6 shadow-soft flex flex-col justify-between h-52 sm:h-56">
          <div className="space-y-2">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider block">This Month Revenue</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-surface-900">₹52,400</h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 mt-1">
              <HiTrendingUp /> ↑ +18% vs last month
            </span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-md">
            <HiArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-surface-200/60 p-4 sm:p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-surface-100 pb-3 gap-1">
          <h2 className="text-base sm:text-lg font-black text-surface-900 tracking-tight">Transaction Statement</h2>
          <p className="text-xs sm:text-sm text-slate-500">Recent wallet transactions and payout activity</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {transactions.map(tx => (
            <div key={tx.id} className="bg-white rounded-[20px] border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-emerald-500/30 transition-all p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 tracking-tight">{tx.id}</span>
                  <Badge variant={tx.status === 'Completed' ? 'success' : tx.status === 'Held' ? 'warning' : 'danger'} dot>{tx.status}</Badge>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <Badge variant="primary" className="text-[11px] font-semibold">{tx.type}</Badge>
                  <span className="text-[11px] font-medium text-slate-400">{tx.date}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <span className={`text-xl sm:text-2xl font-black ${tx.amount.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{tx.amount}</span>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gross Amount</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100/80 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Platform Commission</span>
                  <span className="font-semibold text-slate-700">{tx.commission}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Settled Net</span>
                  <span className="font-bold text-slate-900">{tx.net}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Withdrawal Modal */}
      <Modal isOpen={withdrawModal} onClose={() => setWithdrawModal(false)} title="Initiate Payout Settlement" size="sm">
        <div className="space-y-4 animate-in fade-in">
          <Input
            label="Settlement Amount (₹)"
            type="number"
            placeholder="e.g. 10000"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <Select
            label="Payout Payout Type"
            value={payoutMethod}
            onChange={(e) => setPayoutMethod(e.target.value)}
            options={[
              { value: 'UPI', label: 'Instant UPI Transfer' },
              { value: 'Bank', label: 'Direct Bank Wire Transfer' }
            ]}
          />

          {payoutMethod === 'UPI' ? (
            <Input
              label="UPI Virtual Payment Address"
              placeholder="e.g. admin@oksbi"
              value={details.upi}
              onChange={(e) => setDetails({ ...details, upi: e.target.value })}
            />
          ) : (
            <div className="space-y-3 text-xs">
              <Input
                label="Bank Account Number"
                placeholder="e.g. 987654321000"
                value={details.bank}
                onChange={(e) => setDetails({ ...details, bank: e.target.value })}
              />
              <Input
                label="IFSC Code"
                placeholder="e.g. SBIN0001234"
                value={details.ifsc}
                onChange={(e) => setDetails({ ...details, ifsc: e.target.value })}
              />
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-surface-100 mt-6">
            <Button variant="secondary" onClick={() => setWithdrawModal(false)}>Cancel</Button>
            <Button onClick={handleWithdrawTrigger}>Request Withdrawal</Button>
          </div>
        </div>
      </Modal>

      {/* Success withdrawal alert */}
      {successModal && (
        <Modal isOpen={successModal} onClose={() => setSuccessModal(false)} title="Payout Processing" size="sm">
          <div className="text-center py-6 space-y-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
              <HiCheckCircle />
            </div>
            <div>
              <h3 className="text-lg font-black text-surface-900 tracking-tight">Withdrawal Requested!</h3>
              <p className="text-surface-500 text-xs mt-1">Funds of <span className="font-extrabold text-surface-850">₹{withdrawAmount}</span> will be processed and settled within 4-6 business hours.</p>
            </div>
            <Button onClick={() => setSuccessModal(false)} fullWidth className="mt-4 cursor-pointer">
              Understood
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
