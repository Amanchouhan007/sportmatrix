import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { useToast } from '../ui/Toast'

export default function GuestBookingLookupModal({ isOpen, onClose }) {
    const { addToast } = useToast()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState(null)
    const [searching, setSearching] = useState(false)

    const handleSearch = (e) => {
        e.preventDefault()
        if (!query.trim()) {
            if (addToast) addToast({ message: 'Please enter your Mobile Number or Booking ID', type: 'warning' })
            return
        }

        setSearching(true)
        setTimeout(() => {
            try {
                const rawBookings = localStorage.getItem('customer_bookings')
                const parsed = rawBookings ? JSON.parse(rawBookings) : []
                const qClean = query.trim().toLowerCase()

                const found = parsed.filter(b => {
                    const bId = (b.bookingId || b.id || '').toLowerCase()
                    const bPhone = (b.customerPhone || b.phone || b.mobile || '').toLowerCase()
                    return bId.includes(qClean) || (bPhone && bPhone.includes(qClean))
                })

                if (found.length > 0) {
                    setResults(found)
                } else {
                    // Demo fallback lookup result
                    setResults([
                        {
                            id: `BK-GUEST-${Math.floor(1000 + Math.random() * 9000)}`,
                            venue: 'Royal Cricket Ground (Vijay Nagar)',
                            sport: 'Cricket 16-Over',
                            date: 'TODAY',
                            time: '06:00 PM - 07:00 PM',
                            status: 'Confirmed',
                            amount: '₹1,000'
                        }
                    ])
                }
            } catch (err) {
                console.error(err)
            } finally {
                setSearching(false)
            }
        }, 500)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="🔍 Find My Guest Booking">
            <div className="space-y-5 text-slate-800">
                <p className="text-xs text-slate-500 leading-relaxed">
                    Not logged in? Enter your <strong>Mobile Number</strong> or <strong>Booking Reference ID</strong> below to retrieve your slot details instantly.
                </p>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            placeholder="e.g. +91 98765 43210 or BK-9831"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={searching} className="bg-[#10B981] hover:bg-[#0D9668] text-white shrink-0">
                        {searching ? 'Searching...' : 'Find Booking'}
                    </Button>
                </form>

                {results && (
                    <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Found {results.length} Booking(s):
                        </h4>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                            {results.map((b, idx) => (
                                <div key={b.id || idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-slate-900">{b.bookingId || b.id}</span>
                                            <Badge variant="success" dot>{b.status || 'Confirmed'}</Badge>
                                        </div>
                                        <div className="font-bold text-slate-700">{b.venue || b.sport}</div>
                                        <div className="text-[11px] text-slate-500">{b.date} · {b.time}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-[#10B981] text-sm block">{b.amount || '₹1,200'}</span>
                                        <span className="text-[10px] text-slate-400">Paid via UPI</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}
