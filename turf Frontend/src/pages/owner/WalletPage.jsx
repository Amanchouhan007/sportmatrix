import { useState, useEffect, useCallback } from 'react'
import WalletCard from '../../components/ui/WalletCard'

import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'
import { HiCreditCard, HiCash, HiTrendingUp, HiArrowDown, HiCheckCircle, HiClock } from 'react-icons/hi'
import api from '../../services/api'
import { getPendingSettlements, confirmOwnerReceipt } from '../../services/matchPaymentService'
import useRealtime from '../../utils/useRealtime'

export default function WalletPage() {
  const { addToast } = useToast()
  const [withdrawModal, setWithdrawModal] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [payoutMethod, setPayoutMethod] = useState('UPI')
  const [details, setDetails] = useState({ upi: '', bank: '', ifsc: '' })
  const [transactionsList, setTransactionsList] = useState([])
  const [balance, setBalance] = useState(0)
  const [totalCommissionPaid, setTotalCommissionPaid] = useState(0)
  const [lockedEscrow, setLockedEscrow] = useState(0)
  const [pendingSettlements, setPendingSettlements] = useState([])
  const [isLoadingPending, setIsLoadingPending] = useState(false)
  const [confirmingId, setConfirmingId] = useState(null)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  const fetchWalletData = useCallback(() => {
    api.get('/wallet/me')
      .then(res => {
        if (res && res.success && res.data) {
          setBalance(res.data.balance || 0)
          setTotalCommissionPaid(res.data.totalCommissionPaid || 0)
          setLockedEscrow(res.data.locked || 0)
        }
      })
      .catch(() => {})

    api.get('/wallet/transactions')
      .then(res => {
        if (res && res.success && Array.isArray(res.data)) {
          const mapped = res.data.map(t => ({
            id: t.id || `TXN-${t._id}`,
            type: t.type || 'Booking',
            amount: `+₹${(t.grossAmount || 0).toLocaleString('en-IN')}`,
            rawAmount: t.amount,
            commission: `-₹${Math.abs(t.platformCommission || 0).toLocaleString('en-IN')}`,
            net: `₹${(t.settledNet || 0).toLocaleString('en-IN')}`,
            date: t.date || 'Today',
            rawDate: t.rawDate,
            status: t.status || 'Completed'
          }))
          setTransactionsList(mapped)
        }
      })
      .catch(() => setTransactionsList([]))
  }, [])

  useEffect(() => { fetchWalletData() }, [fetchWalletData])

  const fetchPendingSettlements = useCallback(async () => {
    setIsLoadingPending(true)
    try {
      const res = await getPendingSettlements()
      setPendingSettlements(res.data || [])
    } catch (err) {
      // Non-fatal: pending settlements panel just stays empty
    } finally {
      setIsLoadingPending(false)
    }
  }, [])

  useEffect(() => { fetchPendingSettlements() }, [fetchPendingSettlements])

  // Real-time: refresh when a payment enters/leaves the pending queue or the wallet changes.
  useRealtime(['payment:pending', 'payment:settled', 'payment:commission-confirmed', 'wallet:updated'], () => {
    fetchPendingSettlements()
    fetchWalletData()
  })

  const handleConfirmReceipt = async (paymentId) => {
    setConfirmingId(paymentId)
    try {
      await confirmOwnerReceipt(paymentId)
      addToast({ title: 'Receipt Confirmed', message: 'This payment leg is confirmed. It completes once the platform confirms its commission.', type: 'success' })
      fetchPendingSettlements()
    } catch (err) {
      addToast({ title: 'Confirmation Failed', message: err.message || 'Could not confirm receipt.', type: 'error' })
    } finally {
      setConfirmingId(null)
    }
  }

  // This month's settled revenue, derived from already-fetched real transactions (no hardcoded figure).
  const thisMonthNet = transactionsList
    .filter(t => t.rawDate && new Date(t.rawDate).getMonth() === new Date().getMonth() && new Date(t.rawDate).getFullYear() === new Date().getFullYear() && (t.rawAmount || 0) > 0)
    .reduce((sum, t) => sum + Number(t.net.replace(/[₹,]/g, '') || 0), 0)

  const handleWithdrawTrigger = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      addToast({ title: 'Invalid Amount', message: 'Please specify withdrawal amount first', type: 'error' })
      return
    }
    if (Number(withdrawAmount) > balance) {
      addToast({ title: 'Insufficient Funds', message: 'Withdrawal request exceeds current settled balance', type: 'error' })
      return
    }
    if (payoutMethod === 'UPI' && !details.upi) {
      addToast({ title: 'UPI ID Required', message: 'Please enter your UPI ID.', type: 'error' })
      return
    }
    if (payoutMethod === 'Bank' && (!details.bank || !details.ifsc)) {
      addToast({ title: 'Bank Details Required', message: 'Please enter account number and IFSC.', type: 'error' })
      return
    }

    setIsWithdrawing(true)
    try {
      const res = await api.post('/wallet/withdraw', {
        amount: Number(withdrawAmount),
        payoutMethod,
        upiId: details.upi,
        bankAccountNumber: details.bank,
        bankIfsc: details.ifsc
      })
      if (!res || res.success === false) throw new Error(res?.message || 'Withdrawal request failed.')
      setWithdrawModal(false)
      setSuccessModal(true)
      fetchWalletData()
    } catch (err) {
      addToast({ title: 'Withdrawal Failed', message: err.message || 'Could not submit withdrawal request.', type: 'error' })
    } finally {
      setIsWithdrawing(false)
    }
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
              <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">₹{balance.toLocaleString('en-IN')}</h4>
            </div>
            <span className="text-2xl font-black italic text-emerald-500">SM</span>
          </div>

          <div className="text-xs space-y-1 font-mono">
            <p className="tracking-widest text-surface-400">**** **** **** 8848</p>
            <div className="flex justify-between text-[10px] text-surface-400 uppercase pt-2">
              <span>Admin Controller</span>
              <span>Locked Escrow: ₹{lockedEscrow.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Total Commission Paid */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-surface-200/60 p-5 sm:p-6 shadow-soft flex flex-col justify-between h-52 sm:h-56">
          <div className="space-y-2">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider block">Total Commission Paid</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-surface-900">₹{totalCommissionPaid.toLocaleString('en-IN')}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-surface-450 mt-1">
              Debited from wallet as bookings settle
            </span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-md">
            <HiCash className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Revenue stats */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-surface-200/60 p-5 sm:p-6 shadow-soft flex flex-col justify-between h-52 sm:h-56">
          <div className="space-y-2">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider block">This Month Settled Revenue</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-surface-900">₹{thisMonthNet.toLocaleString('en-IN')}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 mt-1">
              <HiTrendingUp /> Net of platform commission
            </span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-md">
            <HiArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Pending Payment Confirmations (Phase 1: payment gateway abstraction) --
          no live gateway yet, so the owner confirms receipt of each booking
          payment before it counts as settled. */}
      {(isLoadingPending || pendingSettlements.length > 0) && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-amber-200 p-4 sm:p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
            <HiClock className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-black text-surface-900 tracking-tight">Pending Payment Confirmations</h2>
            {pendingSettlements.length > 0 && <Badge variant="warning">{pendingSettlements.length}</Badge>}
          </div>
          {isLoadingPending ? (
            <div className="text-center py-6 text-slate-400 text-sm">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingSettlements.map(p => (
                <div key={p.id} className="border border-amber-200 bg-amber-50/50 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-900">₹{p.amount.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{p.payerName} &middot; {p.teamSide} &middot; Match {p.matchId}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleConfirmReceipt(p.id)}
                    disabled={confirmingId === p.id}
                    className="shrink-0 cursor-pointer"
                  >
                    {confirmingId === p.id ? 'Confirming...' : 'Confirm Receipt'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-surface-200/60 p-4 sm:p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-surface-100 pb-3 gap-1">
          <h2 className="text-base sm:text-lg font-black text-surface-900 tracking-tight">Transaction Statement</h2>
          <p className="text-xs sm:text-sm text-slate-500">Recent wallet transactions and payout activity</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {transactionsList.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 text-sm font-semibold">No wallet transactions found in database.</div>
          ) : transactionsList.map(tx => (
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
            <Button variant="secondary" onClick={() => setWithdrawModal(false)} disabled={isWithdrawing}>Cancel</Button>
            <Button onClick={handleWithdrawTrigger} disabled={isWithdrawing}>{isWithdrawing ? 'Submitting...' : 'Request Withdrawal'}</Button>
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
              <p className="text-surface-500 text-xs mt-1">Funds of <span className="font-extrabold text-surface-850">₹{withdrawAmount}</span> are now held pending manual settlement to your {payoutMethod} account.</p>
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
