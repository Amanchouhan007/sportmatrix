
import { useState, useEffect, useMemo } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { 
    HiPlus, HiTrash, HiPrinter, HiDownload, HiRefresh, HiUser, 
    HiShoppingCart, HiTag, HiCheckCircle, HiExclamationCircle, 
    HiClock, HiCalendar, HiCurrencyRupee, HiCheck, HiShieldCheck
} from 'react-icons/hi'

// ── Master Data & Configuration ──
const sportsList = [
    { id: 'football', name: 'Football', icon: '⚽' },
    { id: 'cricket', name: 'Cricket', icon: '🏏' },
    { id: 'badminton', name: 'Badminton', icon: '🏸' },
    { id: 'tennis', name: 'Tennis', icon: '🎾' },
]

const courtsBySport = {
    Football: [
        { id: 'c1', name: 'Court A (Main Turf)', status: 'Active' },
        { id: 'c2', name: 'Court B (5v5 Arena)', status: 'Active' },
        { id: 'c3', name: 'Court C (7v7 Pro Ground)', status: 'Maintenance' },
    ],
    Cricket: [
        { id: 'c4', name: 'Box Cricket Pitch 1', status: 'Active' },
        { id: 'c5', name: 'Box Cricket Pitch 2', status: 'Active' },
    ],
    Badminton: [
        { id: 'c6', name: 'Wooden Court 1', status: 'Active' },
        { id: 'c7', name: 'Synthetic Court 2', status: 'Active' },
    ],
    Tennis: [
        { id: 'c8', name: 'Hard Court 1', status: 'Active' },
    ]
}

const timeSlots = [
    { id: 's1', time: '06:00 AM', status: 'Available', isPeak: false, rate: 800 },
    { id: 's2', time: '07:00 AM', status: 'Booked', isPeak: false, rate: 800 },
    { id: 's3', time: '08:00 AM', status: 'Available', isPeak: false, rate: 800 },
    { id: 's4', time: '09:00 AM', status: 'Maintenance', isPeak: false, rate: 800 },
    { id: 's5', time: '05:00 PM', status: 'Available', isPeak: true, rate: 1200 },
    { id: 's6', time: '06:00 PM', status: 'Available', isPeak: true, rate: 1200 },
    { id: 's7', time: '07:00 PM', status: 'Booked', isPeak: true, rate: 1200 },
    { id: 's8', time: '08:00 PM', status: 'Available', isPeak: true, rate: 1200 },
    { id: 's9', time: '09:00 PM', status: 'Available', isPeak: true, rate: 1000 },
]

const extraServicesList = [
    { id: 'floodlights', label: 'Flood Lights', price: 100, icon: '💡' },
    { id: 'equipment', label: 'Sports Equipment', price: 200, icon: '🏏' },
    { id: 'coach', label: 'Coach', price: 500, icon: '📋' },
    { id: 'locker', label: 'Locker', price: 50, icon: '🔒' },
    { id: 'changingroom', label: 'Changing Room', price: 50, icon: '👕' },
    { id: 'water', label: 'Drinking Water', price: 0, icon: '💧' },
    { id: 'refreshments', label: 'Refreshments', price: 100, icon: '🥤' },
    { id: 'parking', label: 'Parking', price: 0, icon: '🅿️' },
]

const mockCustomerDatabase = {
    '9876543210': {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        type: 'Member',
        membershipId: 'MEM-2026-88',
        bookingsCount: 14,
        status: 'Active Pass',
        outstanding: 0
    },
    '9826012345': {
        name: 'Vikramaditya Roy',
        email: 'vikram.roy@corporatemail.com',
        type: 'Corporate',
        membershipId: 'CORP-IPL-09',
        bookingsCount: 28,
        status: 'Corporate VIP',
        outstanding: 500
    },
    '9009988776': {
        name: 'Aman Varma',
        email: 'aman.varma@gmail.com',
        type: 'Regular',
        membershipId: 'REG-104',
        bookingsCount: 5,
        status: 'Verified Player',
        outstanding: 0
    }
}

const inventoryOptions = [
    { id: 'item1', name: 'Cold Drink (Coke/Sprite)', price: 40, icon: '🥤', category: 'Snacks & Drinks' },
    { id: 'item2', name: 'Diet Coke Can', price: 45, icon: '🥤', category: 'Snacks & Drinks' },
    { id: 'item3', name: 'Pepsi Can', price: 40, icon: '🥤', category: 'Snacks & Drinks' },
    { id: 'item5', name: 'Energy Drink (Red Bull)', price: 110, icon: '⚡', category: 'Snacks & Drinks' },
    { id: 'item8', name: 'Mineral Water (500ml)', price: 20, icon: '💧', category: 'Snacks & Drinks' },
    { id: 'item16', name: 'Potato Chips (Masala)', price: 20, icon: '🥔', category: 'Snacks & Drinks' },
    { id: 'item22', name: 'Snickers (Energy Bar)', price: 50, icon: '🍫', category: 'Snacks & Drinks' },

    { id: 'item26', name: 'Football Rental', price: 150, icon: '⚽', category: 'Gear & Rentals' },
    { id: 'item27', name: 'Cricket Bat Rental', price: 250, icon: '🏏', category: 'Gear & Rentals' },
    { id: 'item29', name: 'Jersey Rental', price: 100, icon: '👕', category: 'Gear & Rentals' },
    { id: 'item34', name: 'Cosco Cricket Ball', price: 40, icon: '🏏', category: 'Gear & Rentals' },
    { id: 'item41', name: 'Pain Relief Spray (Volini)', price: 120, icon: '💨', category: 'Gear & Rentals' },
]

export default function OwnerPOS() {
    const { addToast } = useToast()
    const [cart, setCart] = useState([])
    const [activeTab, setActiveTab] = useState('Sports') // Sports | Gear & Rentals | Snacks & Drinks
    const [searchQuery, setSearchQuery] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)
    const [lastBill, setLastBill] = useState(null)

    // ── Walk-In Quick Booking Form State ──
    const [booking, setBooking] = useState({
        sport: 'Football',
        court: 'Court A (Main Turf)',
        date: new Date().toISOString().split('T')[0],
        slot: '06:00 PM',
        duration: 60, // 30, 60, 90, 120 mins
        players: 10,
        bookingType: 'Walk-In', // Walk-In | Online | Phone Booking | Corporate | Membership
        billingRate: 1200,
        discountType: 'None', // None | Flat | Percentage | Promo Code
        discountValue: 0,
        promoCode: '',
        selectedExtras: ['floodlights'],
        notes: ''
    })

    // ── Customer Profile State ──
    const [customer, setCustomer] = useState({
        phone: '',
        name: '',
        email: '',
        type: 'Guest', // Regular | Member | Corporate | Guest
        membershipId: '',
        isExisting: false,
        bookingsCount: 0,
        status: '',
        outstanding: 0
    })

    // ── Payment Settlement State ──
    const [paymentStatus, setPaymentStatus] = useState('Paid') // Pending | Partial | Paid
    const [paymentMethod, setPaymentMethod] = useState('UPI') // Cash | UPI | Card | Wallet | Bank Transfer | Split Payment
    const [advanceAmount, setAdvanceAmount] = useState(0)

    // ── Automations ──

    // 1. Auto search customer when mobile number changes
    const handlePhoneChange = (phoneVal) => {
        setCustomer(prev => ({ ...prev, phone: phoneVal }))
        const clean = phoneVal.trim()
        if (mockCustomerDatabase[clean]) {
            const found = mockCustomerDatabase[clean]
            setCustomer({
                phone: clean,
                name: found.name,
                email: found.email,
                type: found.type,
                membershipId: found.membershipId,
                isExisting: true,
                bookingsCount: found.bookingsCount,
                status: found.status,
                outstanding: found.outstanding
            })
            addToast({ title: 'Customer Recognized', message: `Found ${found.name} (${found.type})`, type: 'success' })
        } else if (clean.length < 10) {
            setCustomer(prev => ({
                ...prev,
                phone: phoneVal,
                isExisting: false,
                type: 'Guest',
                membershipId: '',
                bookingsCount: 0,
                status: '',
                outstanding: 0
            }))
        }
    }

    // 2. Available courts based on selected sport
    const availableCourts = useMemo(() => {
        return courtsBySport[booking.sport] || []
    }, [booking.sport])

    // Auto-update court when sport changes
    const handleSportChange = (newSport) => {
        const courts = courtsBySport[newSport] || []
        const defaultCourt = courts[0]?.name || ''
        setBooking(prev => ({
            ...prev,
            sport: newSport,
            court: defaultCourt
        }))
    }

    // ── Smart Validation: Check Consecutive Slot Availability for Multi-Hour Bookings ──
    const checkSlotAvailabilityForDuration = (startSlotTime, hours, slotsArray = timeSlots) => {
        const startIndex = slotsArray.findIndex(s => s.time === startSlotTime)
        if (startIndex === -1) return { isValid: false, reason: 'Invalid starting slot selected' }

        const neededSlotsCount = Number(hours)
        const requiredSlots = slotsArray.slice(startIndex, startIndex + neededSlotsCount)

        if (requiredSlots.length < neededSlotsCount) {
            return { 
                isValid: false, 
                reason: `Only ${requiredSlots.length} consecutive slot(s) available before closing!` 
            }
        }

        const conflictSlot = requiredSlots.find(s => s.status !== 'Available')
        if (conflictSlot) {
            return {
                isValid: false,
                reason: `Slot ${conflictSlot.time} is already ${conflictSlot.status}! Cannot book ${hours} consecutive hours.`
            }
        }

        return { isValid: true, requiredSlots }
    }

    // Auto-update billing rate when slot changes with consecutive slot check
    const handleSlotSelect = (slotObj) => {
        if (slotObj.status === 'Booked' || slotObj.status === 'Maintenance') {
            addToast({ title: 'Slot Unavailable', message: `Selected slot is ${slotObj.status}`, type: 'warning' })
            return
        }

        const hoursNeeded = booking.duration / 60
        const slotCheck = checkSlotAvailabilityForDuration(slotObj.time, hoursNeeded)
        if (!slotCheck.isValid) {
            addToast({
                title: 'Consecutive Slots Conflict',
                message: slotCheck.reason,
                type: 'warning'
            })
            return
        }

        setBooking(prev => ({
            ...prev,
            slot: slotObj.time,
            billingRate: slotObj.rate
        }))
    }

    // Toggle extra services
    const handleToggleExtra = (serviceId) => {
        setBooking(prev => {
            const exists = prev.selectedExtras.includes(serviceId)
            const updated = exists 
                ? prev.selectedExtras.filter(id => id !== serviceId)
                : [...prev.selectedExtras, serviceId]
            return { ...prev, selectedExtras: updated }
        })
    }

    // ── Calculations ──

    // Base court price calculated from billing rate and duration
    const baseCourtPrice = useMemo(() => {
        const rate = Number(booking.billingRate) || 0
        const durationMins = Number(booking.duration) || 60
        return Math.round((durationMins / 60) * rate)
    }, [booking.billingRate, booking.duration])

    // Selected Extra Services Total
    const selectedExtrasList = useMemo(() => {
        return extraServicesList.filter(s => booking.selectedExtras.includes(s.id))
    }, [booking.selectedExtras])

    const extrasTotal = useMemo(() => {
        return selectedExtrasList.reduce((acc, s) => acc + s.price, 0)
    }, [selectedExtrasList])

    // Discount Calculation
    const discountAmount = useMemo(() => {
        const val = Number(booking.discountValue) || 0
        if (booking.discountType === 'Flat') return val
        if (booking.discountType === 'Percentage') return Math.round((baseCourtPrice * val) / 100)
        if (booking.discountType === 'Promo Code') {
            if (booking.promoCode.toUpperCase() === 'TURF20') return Math.round(baseCourtPrice * 0.20)
            if (booking.promoCode.toUpperCase() === 'PROMO100') return 100
            return 50 // default promo code discount
        }
        return 0
    }, [booking.discountType, booking.discountValue, booking.promoCode, baseCourtPrice])

    // Subtotal, Tax & Totals
    const currentBookingSubtotal = Math.max(0, baseCourtPrice + extrasTotal - discountAmount)
    
    // Total including cart items
    const inventoryCartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
    const grandSubtotal = currentBookingSubtotal + inventoryCartSubtotal
    const gstTax = Math.round(grandSubtotal * 0.18)
    const grandTotal = grandSubtotal + gstTax
    const remainingBalance = paymentStatus === 'Partial' ? Math.max(0, grandTotal - Number(advanceAmount)) : paymentStatus === 'Pending' ? grandTotal : 0

    // Check if current selected court is under maintenance
    const currentCourtObj = availableCourts.find(c => c.name === booking.court)
    const isCourtMaintenance = currentCourtObj?.status === 'Maintenance'

    // ── Handlers ──

    const handleAddBookingToCheckout = () => {
        if (isCourtMaintenance) {
            addToast({ title: 'Court Under Maintenance', message: 'Cannot book a court currently under maintenance', type: 'error' })
            return
        }

        const hoursCount = booking.duration / 60
        const slotCheck = checkSlotAvailabilityForDuration(booking.slot, hoursCount)
        if (!slotCheck.isValid) {
            addToast({
                title: 'Consecutive Slots Conflict',
                message: slotCheck.reason,
                type: 'error'
            })
            return
        }

        const newItem = {
            id: `bk-${Date.now()}`,
            name: `${booking.sport} - ${booking.court} (${booking.slot}, ${hoursCount} ${hoursCount > 1 ? 'Hrs' : 'Hr'})`,
            category: 'Sports',
            price: currentBookingSubtotal,
            qty: 1,
            meta: {
                sport: booking.sport,
                court: booking.court,
                date: booking.date,
                slot: booking.slot,
                duration: `${hoursCount} ${hoursCount > 1 ? 'Hours' : 'Hour'}`,
                players: booking.players,
                extras: selectedExtrasList.map(e => e.label).join(', '),
                discount: discountAmount > 0 ? `₹${discountAmount}` : 'None'
            }
        }

        setCart([...cart, newItem])
        addToast({ title: 'Booking Added', message: 'Turf reservation added to checkout basket', type: 'success' })
    }

    const handleAddItem = (item) => {
        const existing = cart.find(c => c.id === item.id)
        if (existing) {
            setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c))
        } else {
            setCart([...cart, { ...item, qty: 1 }])
        }
        addToast({ title: 'Item Added', message: `${item.name} added to cart`, type: 'success' })
    }

    const handleRemoveCartItem = (id) => {
        setCart(cart.filter(item => item.id !== id))
    }

    const handleUpdateCartQty = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta)
                return { ...item, qty: newQty }
            }
            return item
        }))
    }

    const handleClearForm = () => {
        setBooking({
            sport: 'Football',
            court: 'Court A (Main Turf)',
            date: new Date().toISOString().split('T')[0],
            slot: '06:00 PM',
            duration: 60,
            players: 10,
            bookingType: 'Walk-In',
            billingRate: 1200,
            discountType: 'None',
            discountValue: 0,
            promoCode: '',
            selectedExtras: [],
            notes: ''
        })
        setCustomer({
            phone: '',
            name: '',
            email: '',
            type: 'Guest',
            membershipId: '',
            isExisting: false,
            bookingsCount: 0,
            status: '',
            outstanding: 0
        })
        addToast({ title: 'Form Cleared', message: 'Quick booking form reset', type: 'info' })
    }

    const handleSaveDraft = () => {
        addToast({ title: 'Draft Saved', message: `Booking draft saved for ${customer.name || 'Walk-in Guest'}`, type: 'success' })
    }

    const handleCompletePayment = async () => {
        const customerName = customer.name || 'Walk-in Customer'

        const billData = {
            id: `INV-${Math.floor(Math.random() * 90000) + 10000}`,
            customerName,
            customerPhone: customer.phone || 'N/A',
            customerType: customer.type,
            bookingSummary: {
                sport: booking.sport,
                court: booking.court,
                date: booking.date,
                slot: booking.slot,
                duration: `${booking.duration} Mins`,
                players: booking.players,
                basePrice: baseCourtPrice,
                extrasTotal,
                discount: discountAmount,
                subtotal: grandSubtotal,
                tax: gstTax,
                total: grandTotal,
                paid: paymentStatus === 'Partial' ? Number(advanceAmount) : paymentStatus === 'Pending' ? 0 : grandTotal,
                remaining: remainingBalance
            },
            cartItems: [...cart],
            paymentStatus,
            method: paymentMethod,
            date: new Date().toLocaleString()
        }

        setLastBill(billData)
        setIsSuccess(true)
        addToast({ title: 'Invoice Settled', message: `Invoice ${billData.id} generated for ₹${grandTotal}`, type: 'success' })
    }

    const handleNewSale = () => {
        setCart([])
        handleClearForm()
        setPaymentStatus('Paid')
        setPaymentMethod('UPI')
        setAdvanceAmount(0)
        setLastBill(null)
        setIsSuccess(false)
    }

    const handlePrint = () => {
        window.print()
    }

    const categories = ['Sports', 'Gear & Rentals', 'Snacks & Drinks']

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Thermal Print stylesheet */}
            <style>
                {`
                    @media print {
                        body * { visibility: hidden; background: white !important; color: black !important; }
                        #printable-receipt, #printable-receipt * { visibility: visible; }
                        #printable-receipt { 
                            position: fixed; 
                            left: 0; 
                            top: 0; 
                            width: 100%; 
                            padding: 20px; 
                            font-family: monospace !important;
                        }
                        .no-print { display: none !important; }
                    }
                `}
            </style>

            {isSuccess ? (
                /* Cinematic receipt confirmation card */
                <div className="max-w-2xl mx-auto py-8 no-print space-y-6">
                    <div className="bg-white rounded-3xl border border-surface-200/60 p-8 shadow-soft text-center space-y-6">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                            <HiCheckCircle />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-surface-900 tracking-tight">Invoice Settled Successfully!</h2>
                            <p className="text-surface-500 text-xs mt-1">Generated print sheet for transaction reference ID: <span className="font-extrabold text-surface-700">{lastBill.id}</span></p>
                        </div>

                        <div className="border-t border-dashed border-surface-200 pt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-left text-xs">
                                <div>
                                    <span className="text-surface-400 block font-bold uppercase tracking-wider">Customer Profile</span>
                                    <span className="text-surface-900 font-extrabold block mt-0.5">{lastBill.customerName} ({lastBill.customerType})</span>
                                    <span className="text-surface-500 block font-semibold">{lastBill.customerPhone}</span>
                                </div>
                                <div>
                                    <span className="text-surface-400 block font-bold uppercase tracking-wider">Payment Status</span>
                                    <span className="text-emerald-600 font-extrabold block mt-0.5">{lastBill.paymentStatus} via {lastBill.method}</span>
                                    <span className="text-surface-500 block font-semibold">{lastBill.date}</span>
                                </div>
                            </div>

                            {/* Summary list */}
                            <div className="bg-surface-50 p-4 rounded-2xl border border-surface-200 text-xs text-left space-y-2.5">
                                <div className="font-black text-surface-900 uppercase border-b border-surface-200 pb-2">Booking Summary</div>
                                <div className="flex justify-between text-surface-700">
                                    <span>{lastBill.bookingSummary.sport} - {lastBill.bookingSummary.court} ({lastBill.bookingSummary.slot})</span>
                                    <span className="font-bold">₹{lastBill.bookingSummary.basePrice}</span>
                                </div>
                                {lastBill.bookingSummary.extrasTotal > 0 && (
                                    <div className="flex justify-between text-surface-600">
                                        <span>Extra Services</span>
                                        <span>+₹{lastBill.bookingSummary.extrasTotal}</span>
                                    </div>
                                )}
                                {lastBill.bookingSummary.discount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Discount Applied</span>
                                        <span>-₹{lastBill.bookingSummary.discount}</span>
                                    </div>
                                )}

                                {lastBill.cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-surface-650 pt-1">
                                        <span>{item.name} <span className="text-surface-400">x{item.qty}</span></span>
                                        <span className="text-surface-900 font-extrabold">₹{item.price * item.qty}</span>
                                    </div>
                                ))}

                                <div className="border-t border-surface-200 pt-2.5 mt-2.5 flex justify-between font-black text-sm text-surface-900">
                                    <span>Grand Total Paid (incl. 18% GST)</span>
                                    <span className="text-emerald-600 text-base">₹{lastBill.bookingSummary.total}</span>
                                </div>
                                {lastBill.bookingSummary.remaining > 0 && (
                                    <div className="flex justify-between font-bold text-xs text-rose-600 pt-1">
                                        <span>Outstanding Remaining Balance</span>
                                        <span>₹{lastBill.bookingSummary.remaining}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button fullWidth onClick={handlePrint} size="lg" className="cursor-pointer">
                                <HiPrinter className="mr-2" /> Print Invoice Receipt
                            </Button>
                            <Button fullWidth variant="outline" onClick={handleNewSale} size="lg" className="cursor-pointer">
                                Start New Register
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Primary POS Workspace splitting layout */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
                    
                    {/* LEFT PANEL (~66% / col-span-2) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tab Category Bar */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-white p-2 rounded-2xl border border-surface-200/60 shadow-soft shrink-0">
                            <div className="flex gap-2 overflow-x-auto">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setActiveTab(cat)
                                            setSearchQuery('')
                                        }}
                                        className={`px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${activeTab === cat ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/10' : 'bg-white border-surface-150 text-surface-600 hover:bg-surface-50'}`}
                                    >
                                        {cat === 'Sports' ? '⚽ Turf Bookings' : cat === 'Gear & Rentals' ? '🏏 Gear & Rentals' : '🍔 Snacks & Drinks'}
                                    </button>
                                ))}
                            </div>

                            {(activeTab === 'Gear & Rentals' || activeTab === 'Snacks & Drinks') && (
                                <div className="px-2 w-full sm:w-44 shrink-0">
                                    <input
                                        type="text"
                                        placeholder="🔍 Search item..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-3 py-1.5 text-[11px] rounded-xl border border-surface-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-surface-800 font-extrabold shadow-sm placeholder-surface-400"
                                    />
                                </div>
                            )}
                        </div>

                        {activeTab === 'Sports' ? (
                            /* QUICK WALK-IN BOOKING FORM CARD */
                            <Card className="p-6 space-y-6">
                                <div className="flex items-center justify-between border-b border-surface-100 pb-4">
                                    <h3 className="text-base font-black text-surface-900 tracking-tight flex items-center gap-2">
                                        <span>🗓️</span> Quick walk-in field reservations
                                    </h3>
                                    {isCourtMaintenance && (
                                        <Badge variant="warning" className="animate-pulse">
                                            ⚠️ Selected Court Under Maintenance
                                        </Badge>
                                    )}
                                </div>

                                {/* 1. SPORT & COURT SELECTION */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Select
                                        label="Sport"
                                        value={booking.sport}
                                        onChange={(e) => handleSportChange(e.target.value)}
                                        options={sportsList.map(s => ({ value: s.name, label: `${s.icon} ${s.name}` }))}
                                    />
                                    <Select
                                        label="Court / Turf"
                                        value={booking.court}
                                        onChange={(e) => setBooking({ ...booking, court: e.target.value })}
                                        options={availableCourts.map(c => ({
                                            value: c.name,
                                            label: `${c.name} ${c.status === 'Maintenance' ? '(Under Maintenance)' : ''}`
                                        }))}
                                    />
                                </div>

                                {/* BOOKING DATE & BOOKING TYPE */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Booking Date"
                                        type="date"
                                        value={booking.date}
                                        onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                                    />
                                    <Select
                                        label="Booking Type"
                                        value={booking.bookingType}
                                        onChange={(e) => setBooking({ ...booking, bookingType: e.target.value })}
                                        options={[
                                            { value: 'Walk-In', label: '🚶 Walk-In' },
                                            { value: 'Online', label: '🌐 Online' },
                                            { value: 'Phone Booking', label: '📞 Phone Booking' },
                                            { value: 'Corporate', label: '🏢 Corporate' },
                                            { value: 'Membership', label: '👑 Membership' }
                                        ]}
                                    />
                                </div>

                                {/* 2. SLOT SELECTION (Modern Card Grid) */}
                                <div>
                                    <label className="block text-xs font-bold text-surface-700 mb-2 uppercase tracking-wider flex justify-between items-center">
                                        <span>Select Assigned Time Slot</span>
                                        <span className="text-[10px] text-surface-400 font-semibold">Click to select slot</span>
                                    </label>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                        {timeSlots.map(slotObj => {
                                            const isSelected = booking.slot === slotObj.time
                                            const isBooked = slotObj.status === 'Booked'
                                            const isMaint = slotObj.status === 'Maintenance'
                                            
                                            // Check consecutive slot availability for current selected duration hours
                                            const hoursNeeded = booking.duration / 60
                                            const slotCheck = checkSlotAvailabilityForDuration(slotObj.time, hoursNeeded)
                                            const hasConflict = !isBooked && !isMaint && !slotCheck.isValid

                                            return (
                                                <button
                                                    key={slotObj.id}
                                                    type="button"
                                                    disabled={isBooked || isMaint}
                                                    onClick={() => handleSlotSelect(slotObj)}
                                                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative flex flex-col justify-between h-16 ${
                                                        isSelected
                                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500'
                                                            : isBooked || isMaint
                                                            ? 'bg-surface-100 text-surface-400 border-surface-200 cursor-not-allowed opacity-60'
                                                            : hasConflict
                                                            ? 'bg-amber-50/70 text-amber-900 border-amber-300 hover:bg-amber-100/70'
                                                            : 'bg-white text-surface-800 border-surface-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[11px] font-black leading-tight">{slotObj.time}</span>
                                                        {hasConflict && (
                                                            <span className="text-[9px] font-extrabold text-amber-600" title={slotCheck.reason}>⚠️</span>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                                            isSelected 
                                                                ? 'bg-white/20 text-white' 
                                                                : isBooked 
                                                                ? 'bg-red-100 text-red-600' 
                                                                : isMaint 
                                                                ? 'bg-amber-100 text-amber-700' 
                                                                : hasConflict
                                                                ? 'bg-amber-200 text-amber-800'
                                                                : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                            {hasConflict ? 'Conflict' : slotObj.status}
                                                        </span>
                                                        {slotObj.isPeak && (
                                                            <span className={`text-[8px] font-bold ${isSelected ? 'text-amber-200' : 'text-amber-600'}`}>
                                                                🔥 Peak
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* 3. BOOKING DURATION & 4. NUMBER OF PLAYERS */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Select
                                        label="Booking Time (Hours)"
                                        value={booking.duration}
                                        onChange={(e) => setBooking({ ...booking, duration: Number(e.target.value) })}
                                        options={[
                                            { value: 60, label: '⏰ 1 Hour' },
                                            { value: 120, label: '⏰ 2 Hours' },
                                            { value: 180, label: '⏰ 3 Hours' },
                                            { value: 240, label: '⏰ 4 Hours' },
                                            { value: 300, label: '⏰ 5 Hours' }
                                        ]}
                                    />
                                    <div>
                                        <Input
                                            label="Players"
                                            type="number"
                                            value={booking.players}
                                            onChange={(e) => setBooking({ ...booking, players: e.target.value })}
                                            placeholder="e.g. 10"
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Billing Rate (₹/hr)"
                                            type="number"
                                            value={booking.billingRate}
                                            onChange={(e) => setBooking({ ...booking, billingRate: e.target.value })}
                                            placeholder="₹ Rate"
                                        />
                                    </div>
                                </div>

                                {/* 7. DISCOUNT SECTION */}
                                <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-3">
                                    <div className="text-xs font-black text-surface-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <HiTag className="text-emerald-600" /> Apply Discount & Promo Code
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <Select
                                            label="Discount Type"
                                            value={booking.discountType}
                                            onChange={(e) => setBooking({ ...booking, discountType: e.target.value })}
                                            options={[
                                                { value: 'None', label: 'None' },
                                                { value: 'Flat', label: 'Flat Discount (₹)' },
                                                { value: 'Percentage', label: 'Percentage (%)' },
                                                { value: 'Promo Code', label: 'Promo Code' }
                                            ]}
                                        />

                                        {booking.discountType === 'Promo Code' ? (
                                            <div className="sm:col-span-2">
                                                <Input
                                                    label="Promo Code"
                                                    placeholder="Enter code (e.g. TURF20)"
                                                    value={booking.promoCode}
                                                    onChange={(e) => setBooking({ ...booking, promoCode: e.target.value })}
                                                />
                                            </div>
                                        ) : booking.discountType !== 'None' ? (
                                            <div className="sm:col-span-2">
                                                <Input
                                                    label={booking.discountType === 'Flat' ? 'Discount Amount (₹)' : 'Discount Percentage (%)'}
                                                    type="number"
                                                    placeholder="0"
                                                    value={booking.discountValue}
                                                    onChange={(e) => setBooking({ ...booking, discountValue: e.target.value })}
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* 8. EXTRA SERVICES (Multi-select Checkboxes) */}
                                <div>
                                    <label className="block text-xs font-bold text-surface-700 mb-2 uppercase tracking-wider">
                                        Extra Add-on Services
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {extraServicesList.map(service => {
                                            const isChecked = booking.selectedExtras.includes(service.id)
                                            return (
                                                <button
                                                    key={service.id}
                                                    type="button"
                                                    onClick={() => handleToggleExtra(service.id)}
                                                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                                                        isChecked
                                                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-extrabold shadow-sm'
                                                            : 'bg-white border-surface-200 text-surface-700 hover:bg-surface-50 font-bold'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-1.5 text-xs truncate">
                                                        <span>{service.icon}</span>
                                                        <span className="truncate">{service.label}</span>
                                                    </div>
                                                    <span className="text-[10px] text-emerald-600 font-black ml-1">
                                                        {service.price > 0 ? `+₹${service.price}` : 'Free'}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* 9. NOTES */}
                                <div>
                                    <label className="block text-xs font-bold text-surface-700 mb-1.5 uppercase tracking-wider">Booking Notes / Special Instructions</label>
                                    <textarea
                                        rows={2}
                                        placeholder="e.g. VIP guest, Birthday celebration, Corporate match setup required..."
                                        value={booking.notes}
                                        onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                                        className="w-full p-2.5 text-xs font-medium bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-surface-900 shadow-sm placeholder-surface-400"
                                    />
                                </div>

                                {/* BUTTONS BAR */}
                                <div className="flex flex-wrap sm:flex-nowrap gap-3 pt-2">
                                    <Button 
                                        type="button" 
                                        onClick={handleAddBookingToCheckout} 
                                        className="flex-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 font-black text-xs py-3"
                                    >
                                        <HiPlus className="mr-1 w-4 h-4" /> Add booking to checkout
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={handleSaveDraft} 
                                        className="cursor-pointer border-surface-300 font-bold text-xs"
                                    >
                                        Save Draft
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={handleClearForm} 
                                        className="cursor-pointer text-red-600 border-red-200 hover:bg-red-50 font-bold text-xs"
                                    >
                                        Clear Form
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            /* INVENTORY LIST GRID FOR GEAR / SNACKS */
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                                {(() => {
                                    const filtered = inventoryOptions.filter(
                                        i => i.category === activeTab &&
                                            i.name.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    if (filtered.length === 0) {
                                        return (
                                            <div className="col-span-full text-center py-12 text-surface-400 bg-white rounded-2xl border border-surface-200/50 p-6 shadow-soft">
                                                <span className="text-3xl block">🔍</span>
                                                <p className="text-xs font-bold mt-2 text-surface-600">No matching items found</p>
                                            </div>
                                        )
                                    }
                                    return filtered.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleAddItem(item)}
                                            className="bg-white rounded-2xl border border-surface-200/50 p-2.5 shadow-soft hover:shadow-soft-md cursor-pointer transition-all duration-300 relative group overflow-hidden flex flex-col justify-between h-28 text-left"
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                                <span className="w-6 h-6 rounded-lg bg-surface-50 border border-surface-200/30 flex items-center justify-center font-bold text-xs text-surface-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-250 transition-colors">+</span>
                                            </div>
                                            <div className="mt-1">
                                                <h4 className="text-[10px] font-black text-surface-800 leading-snug truncate" title={item.name}>{item.name}</h4>
                                                <p className="text-xs font-black text-emerald-600 mt-0.5">₹{item.price}</p>
                                            </div>
                                        </div>
                                    ))
                                })()}
                            </div>
                        )}
                    </div>

                    {/* RIGHT PANEL – CUSTOMER PROFILE & CHECKOUT BASKET */}
                    <div className="space-y-6">
                        
                        {/* CUSTOMER PROFILE CARD */}
                        <Card className="p-5 space-y-3">
                            <div className="flex items-center justify-between border-b border-surface-100 pb-3">
                                <h3 className="text-xs font-black text-surface-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <HiUser className="text-emerald-600" /> Walk-in customer profile
                                </h3>
                                {customer.isExisting && (
                                    <Badge variant="success" className="text-[9px]">
                                        ✓ Verified Member
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-2.5">
                                <Input
                                    placeholder="Customer Mobile Number (e.g. 9876543210)"
                                    value={customer.phone}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                />
                                <Input
                                    placeholder="Customer Name"
                                    value={customer.name}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                />
                                <Input
                                    placeholder="Customer Email Address"
                                    type="email"
                                    value={customer.email}
                                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                                />

                                <div className="grid grid-cols-2 gap-2">
                                    <Select
                                        label="Customer Type"
                                        value={customer.type}
                                        onChange={(e) => setCustomer({ ...customer, type: e.target.value })}
                                        options={[
                                            { value: 'Regular', label: 'Regular' },
                                            { value: 'Member', label: 'Member' },
                                            { value: 'Corporate', label: 'Corporate' },
                                            { value: 'Guest', label: 'Guest' }
                                        ]}
                                    />
                                    <Input
                                        label="Membership ID"
                                        placeholder="MEM-ID"
                                        value={customer.membershipId}
                                        onChange={(e) => setCustomer({ ...customer, membershipId: e.target.value })}
                                    />
                                </div>

                                {customer.isExisting && (
                                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-[10px] space-y-1 font-bold text-emerald-900">
                                        <div className="flex justify-between">
                                            <span>Previous Bookings:</span>
                                            <span className="font-extrabold">{customer.bookingsCount} Completed</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Status:</span>
                                            <span className="font-extrabold">{customer.status}</span>
                                        </div>
                                        {customer.outstanding > 0 && (
                                            <div className="flex justify-between text-rose-600 font-extrabold border-t border-emerald-200 pt-1">
                                                <span>Outstanding Dues:</span>
                                                <span>₹{customer.outstanding}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* CHECKOUT BASKET CARD */}
                        <Card className="p-5 flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-center justify-between border-b border-surface-100 pb-3 mb-3">
                                    <h3 className="text-sm font-black text-surface-900 tracking-tight flex items-center gap-1.5">
                                        <HiShoppingCart /> checkout basket
                                    </h3>
                                    <Badge variant="primary">{cart.length + (activeTab === 'Sports' ? 1 : 0)} items</Badge>
                                </div>

                                {/* Itemized booking summary in basket */}
                                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 scrollbar-hide">
                                    {/* Active Walk-in Booking Summary Item */}
                                    {activeTab === 'Sports' && (
                                        <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs font-semibold space-y-1.5">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-black text-emerald-950 text-xs block">{booking.sport} - {booking.court}</span>
                                                    <span className="text-[10px] text-emerald-700 font-bold block">{booking.slot} ({booking.duration} Mins) • {booking.players} Players</span>
                                                </div>
                                                <span className="font-black text-emerald-800 text-xs">₹{baseCourtPrice}</span>
                                            </div>

                                            {selectedExtrasList.length > 0 && (
                                                <div className="text-[10px] text-surface-600 border-t border-emerald-200/60 pt-1 space-y-0.5">
                                                    {selectedExtrasList.map(e => (
                                                        <div key={e.id} className="flex justify-between">
                                                            <span>+ {e.label}</span>
                                                            <span>₹{e.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {discountAmount > 0 && (
                                                <div className="flex justify-between text-[10px] text-emerald-700 font-extrabold border-t border-emerald-200/60 pt-1">
                                                    <span>Discount Applied ({booking.discountType})</span>
                                                    <span>-₹{discountAmount}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Inventory Cart Items */}
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between items-center p-3 bg-surface-50 rounded-2xl border border-surface-150 text-xs font-semibold">
                                            <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                                                <p className="text-surface-900 font-extrabold truncate leading-tight">{item.name}</p>
                                                <p className="text-[10px] text-surface-400 uppercase tracking-wider">{item.category} • ₹{item.price}</p>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex items-center border border-surface-200 rounded-xl overflow-hidden bg-white shadow-soft font-bold">
                                                    <button onClick={() => handleUpdateCartQty(item.id, -1)} className="px-2 py-0.5 hover:bg-surface-50">-</button>
                                                    <span className="px-2 text-surface-700">{item.qty}</span>
                                                    <button onClick={() => handleUpdateCartQty(item.id, 1)} className="px-2 py-0.5 hover:bg-surface-50">+</button>
                                                </div>
                                                <button onClick={() => handleRemoveCartItem(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded-xl">
                                                    <HiTrash className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* COMPACT BOOKING & PRICE SUMMARY */}
                            <div className="border-t border-surface-100 pt-3 space-y-3">
                                <div className="text-xs space-y-1.5 font-semibold text-surface-600 border-b border-surface-100 pb-3">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="text-surface-800 font-bold">₹{grandSubtotal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>GST (18%)</span>
                                        <span className="text-surface-800 font-bold">₹{gstTax}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-black text-surface-900 pt-1">
                                        <span>Grand Total</span>
                                        <span className="text-emerald-600 text-base">₹{grandTotal}</span>
                                    </div>
                                </div>

                                {/* PAYMENT SETTLEMENT SECTION */}
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <Select
                                            label="Payment Status"
                                            value={paymentStatus}
                                            onChange={(e) => setPaymentStatus(e.target.value)}
                                            options={[
                                                { value: 'Paid', label: '✅ Paid' },
                                                { value: 'Partial', label: '⏳ Partial' },
                                                { value: 'Pending', label: '❌ Pending' }
                                            ]}
                                        />
                                        <Select
                                            label="Payment Method"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            options={[
                                                { value: 'UPI', label: '📱 UPI' },
                                                { value: 'Cash', label: '💵 Cash' },
                                                { value: 'Card', label: '💳 Card' },
                                                { value: 'Wallet', label: '👛 Wallet' },
                                                { value: 'Bank Transfer', label: '🏦 Bank Transfer' },
                                                { value: 'Split Payment', label: '🔀 Split Payment' }
                                            ]}
                                        />
                                    </div>

                                    {paymentStatus === 'Partial' && (
                                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                                            <Input
                                                label="Advance Payment Amount (₹)"
                                                type="number"
                                                value={advanceAmount}
                                                onChange={(e) => setAdvanceAmount(e.target.value)}
                                                placeholder="Enter advance amount"
                                            />
                                            <div className="flex justify-between text-xs font-bold text-amber-900">
                                                <span>Remaining Balance Due:</span>
                                                <span className="font-extrabold text-rose-600">₹{remainingBalance}</span>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        fullWidth
                                        size="lg"
                                        onClick={handleCompletePayment}
                                        className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/10 cursor-pointer font-black text-xs py-3"
                                    >
                                        Complete Payment & Settle Invoice
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Thermal Print Invoice structure */}
            {lastBill && (
                <div id="printable-receipt" style={{ display: 'none' }} className="bg-white p-8 max-w-sm mx-auto text-left font-mono">
                    <div className="text-center border-b border-dashed pb-4 mb-4">
                        <h2 className="text-base font-black uppercase">SPORTMATRIX ENTERPRISE POS</h2>
                        <p className="text-[10px] text-gray-500 mt-0.5">Champions Turf Arena, Indore (M.P.)</p>
                        <p className="text-[10px] text-gray-500">Contact: +91 90000 80000</p>
                    </div>

                    <div className="text-[10px] space-y-1 mb-4">
                        <p><strong>INVOICE ID :</strong> {lastBill.id}</p>
                        <p><strong>DATE/TIME  :</strong> {lastBill.date}</p>
                        <p><strong>CUSTOMER   :</strong> {lastBill.customerName} ({lastBill.customerType})</p>
                        <p><strong>CONTACT    :</strong> {lastBill.customerPhone}</p>
                        <p><strong>PAYMENT    :</strong> {lastBill.paymentStatus} ({lastBill.method})</p>
                    </div>

                    <div className="border-t border-b border-dashed py-3 mb-4 text-[10px]">
                        <p className="font-bold border-b border-dashed pb-1 mb-2">RESERVATION & ITEMS</p>
                        <p><strong>Sport/Court:</strong> {lastBill.bookingSummary.sport} - {lastBill.bookingSummary.court}</p>
                        <p><strong>Slot/Time:</strong> {lastBill.bookingSummary.slot} ({lastBill.bookingSummary.duration})</p>
                        <p><strong>Base Rate:</strong> ₹{lastBill.bookingSummary.basePrice}</p>
                        {lastBill.bookingSummary.extrasTotal > 0 && <p><strong>Extras:</strong> ₹{lastBill.bookingSummary.extrasTotal}</p>}
                        {lastBill.bookingSummary.discount > 0 && <p><strong>Discount:</strong> -₹{lastBill.bookingSummary.discount}</p>}
                    </div>

                    <div className="text-[10px] space-y-1 text-right border-b border-dashed pb-3 mb-3">
                        <p>Subtotal: ₹{lastBill.bookingSummary.subtotal}</p>
                        <p>GST (18%): ₹{lastBill.bookingSummary.tax}</p>
                        <p className="text-sm font-bold mt-1">GRAND TOTAL: ₹{lastBill.bookingSummary.total}</p>
                        {lastBill.bookingSummary.remaining > 0 && <p className="text-rose-600 font-bold">BALANCE REMAINING: ₹{lastBill.bookingSummary.remaining}</p>}
                    </div>

                    <div className="text-center text-[10px] space-y-0.5 text-gray-500 uppercase tracking-widest mt-6">
                        <p>--- THANK YOU FOR SPORTING WITH US ---</p>
                        <p>Visit again soon!</p>
                    </div>
                </div>
            )}
        </div>
    )
}

