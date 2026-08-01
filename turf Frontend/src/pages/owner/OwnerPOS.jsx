
import { useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { HiPlus, HiTrash, HiPrinter, HiDownload, HiRefresh, HiUser, HiShoppingCart, HiTag, HiCheckCircle } from 'react-icons/hi'

const inventoryOptions = [
    { id: 'item1', name: 'Cold Drink (Coke/Sprite)', price: 40, icon: '🥤', category: 'Snacks & Drinks' },
    { id: 'item2', name: 'Diet Coke Can', price: 45, icon: '🥤', category: 'Snacks & Drinks' },
    { id: 'item3', name: 'Pepsi Can', price: 40, icon: '🥤', category: 'Snacks & Drinks' },
    { id: 'item4', name: 'Mountain Dew Can', price: 40, icon: '🥤', category: 'Snacks & Drinks' },
    { id: 'item5', name: 'Energy Drink (Red Bull)', price: 110, icon: '⚡', category: 'Snacks & Drinks' },
    { id: 'item6', name: 'Monster Energy Can', price: 110, icon: '⚡', category: 'Snacks & Drinks' },
    { id: 'item7', name: 'Sting Energy Drink', price: 20, icon: '⚡', category: 'Snacks & Drinks' },
    { id: 'item8', name: 'Mineral Water (500ml)', price: 20, icon: '💧', category: 'Snacks & Drinks' },
    { id: 'item9', name: 'Soda Water Bottle', price: 25, icon: '🥤', category: 'Snacks & Drinks' },
    { id: 'item10', name: 'Gold Flake (Smoking)', price: 18, icon: '🚬', category: 'Snacks & Drinks' },
    { id: 'item11', name: 'Marlboro Advance (Smoking)', price: 22, icon: '🚬', category: 'Snacks & Drinks' },
    { id: 'item12', name: 'Classic Milds (Smoking)', price: 20, icon: '🚬', category: 'Snacks & Drinks' },
    { id: 'item13', name: 'Mint / Mouth Freshener', price: 10, icon: '🍃', category: 'Snacks & Drinks' },
    { id: 'item14', name: 'Orbit Mint Chewing Gum', price: 10, icon: '🍬', category: 'Snacks & Drinks' },
    { id: 'item15', name: 'Doublemint Gum', price: 10, icon: '🍬', category: 'Snacks & Drinks' },
    { id: 'item16', name: 'Potato Chips (Masala)', price: 20, icon: '🥔', category: 'Snacks & Drinks' },
    { id: 'item17', name: 'Potato Chips (Cream & Onion)', price: 20, icon: '🥔', category: 'Snacks & Drinks' },
    { id: 'item18', name: 'Lays Chips (Tomato)', price: 20, icon: '🥔', category: 'Snacks & Drinks' },
    { id: 'item19', name: 'Kurkure Masala Munch', price: 20, icon: '🥨', category: 'Snacks & Drinks' },
    { id: 'item20', name: 'Bingo Mad Angles', price: 20, icon: '📐', category: 'Snacks & Drinks' },
    { id: 'item21', name: 'Salted Peanuts (Snacks)', price: 30, icon: '🥜', category: 'Snacks & Drinks' },
    { id: 'item22', name: 'Snickers (Energy Bar)', price: 50, icon: '🍫', category: 'Snacks & Drinks' },
    { id: 'item23', name: 'Dairy Milk Chocolate', price: 40, icon: '🍫', category: 'Snacks & Drinks' },
    { id: 'item24', name: 'Nicotine Pouch (Velo)', price: 120, icon: '📦', category: 'Snacks & Drinks' },
    { id: 'item25', name: 'Real Orange Juice Can', price: 30, icon: '🍹', category: 'Snacks & Drinks' },

    { id: 'item26', name: 'Football Rental', price: 150, icon: '⚽', category: 'Gear & Rentals' },
    { id: 'item27', name: 'Cricket Bat Rental', price: 250, icon: '🏏', category: 'Gear & Rentals' },
    { id: 'item28', name: 'Badminton Racket Rental', price: 80, icon: '🏸', category: 'Gear & Rentals' },
    { id: 'item29', name: 'Jersey Rental', price: 100, icon: '👕', category: 'Gear & Rentals' },
    { id: 'item30', name: 'Football Studs Rent', price: 100, icon: '👟', category: 'Gear & Rentals' },
    { id: 'item31', name: 'Table Tennis Racket Rent', price: 50, icon: '🏓', category: 'Gear & Rentals' },
    { id: 'item32', name: 'Shuttlecock Mavis 350 (1pc)', price: 60, icon: '🏸', category: 'Gear & Rentals' },
    { id: 'item33', name: 'Shuttlecock Mavis 350 (6pcs)', price: 550, icon: '📦', category: 'Gear & Rentals' },
    { id: 'item34', name: 'Cosco Tennis Ball (Single)', price: 40, icon: '🎾', category: 'Gear & Rentals' },
    { id: 'item35', name: 'Cricket Leather Ball', price: 350, icon: '⚾', category: 'Gear & Rentals' },
    { id: 'item36', name: 'Table Tennis Balls (Box of 3)', price: 60, icon: '⚪', category: 'Gear & Rentals' },
    { id: 'item37', name: 'Synthetic Grip Tape', price: 50, icon: '🎗️', category: 'Gear & Rentals' },
    { id: 'item38', name: 'Wrist Band (Pair)', price: 40, icon: '🎗️', category: 'Gear & Rentals' },
    { id: 'item39', name: 'Knee Support Sleeve', price: 150, icon: '🎗️', category: 'Gear & Rentals' },
    { id: 'item40', name: 'Sports Socks (Pair)', price: 80, icon: '🧦', category: 'Gear & Rentals' },
    { id: 'item41', name: 'Pain Relief Spray (Volini)', price: 120, icon: '💨', category: 'Gear & Rentals' },
]

export default function OwnerPOS() {
    const { addToast } = useToast()
    const [cart, setCart] = useState([])
    const [paymentMethod, setPaymentMethod] = useState('UPI')
    const [isSuccess, setIsSuccess] = useState(false)
    const [lastBill, setLastBill] = useState(null)
    const [activeTab, setActiveTab] = useState('Sports') // Sports, Gaming, Gear & Rentals, Snacks & Drinks
    const [searchQuery, setSearchQuery] = useState('')

    // Customer Info
    const [customer, setCustomer] = useState({ name: '', phone: '' })

    // Walk-in Booking State
    const [booking, setBooking] = useState({
        turf: 'Turf A',
        sport: 'Football',
        date: new Date().toISOString().split('T')[0],
        slot: '06:00 PM',
        price: '900'
    })

    // Walk-in Gaming State
    const [gaming, setGaming] = useState({
        device: 'PC-01',
        game: 'EA FC 24',
        duration: '60',
        price: '150'
    })

    const handleAddBooking = () => {
        if (!booking.slot || !booking.price) {
            addToast({ title: 'Incomplete Booking', message: 'Ensure time slot and price are filled', type: 'error' })
            return
        }

        const newItem = {
            id: `bk-${Date.now()}`,
            name: `Walk-in Turf Booking (${booking.slot})`,
            category: 'Sports',
            price: Number(booking.price),
            qty: 1
        }

        setCart([...cart, newItem])
        addToast({ title: 'Slot Added', message: 'Walk-in slot added to checkout sheet', type: 'success' })
    }

    const handleAddGaming = () => {
        if (!gaming.device || !gaming.game || !gaming.duration || !gaming.price) {
            addToast({ title: 'Incomplete Session Details', message: 'Ensure rig, game, duration and rate are specified', type: 'error' })
            return
        }

        const deviceName = gaming.device === 'PC-01' ? 'RTX 4090 PC 1' : gaming.device === 'PC-02' ? 'RTX 4090 PC 2' : gaming.device === 'PS5-01' ? 'PlayStation 5 Console 1' : gaming.device === 'PS5-02' ? 'PlayStation 5 Console 2' : 'Meta Quest 3 VR Pod'
        const minutes = Number(gaming.duration)
        const finalPrice = Math.round((minutes / 60) * Number(gaming.price))

        const newItem = {
            id: `gm-${Date.now()}`,
            name: `🎮 Gaming - ${deviceName} (${gaming.game} - ${minutes}m)`,
            category: 'Gaming',
            price: finalPrice,
            qty: 1
        }

        setCart([...cart, newItem])
        addToast({ title: 'Rig Added', message: 'Gaming session added to checkout sheet', type: 'success' })
    }

    const handleAddItem = (item) => {
        const existing = cart.find(c => c.id === item.id)
        if (existing) {
            setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c))
        } else {
            setCart([...cart, { ...item, qty: 1 }])
        }
        addToast({ title: 'Item Added', message: `${item.name} added to checkout list`, type: 'success' })
    }

    const handleRemove = (id) => {
        setCart(cart.filter(item => item.id !== id))
    }

    const handleUpdateQty = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta)
                return { ...item, qty: newQty }
            }
            return item
        }))
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
    const gstRate = 0.18 // 18% GST
    const tax = Math.round(subtotal * gstRate)
    const total = subtotal + tax

    const handleCompletePayment = () => {
        if (cart.length === 0) {
            addToast({ title: 'Checkout Empty', message: 'Add items or booking slots first', type: 'warning' })
            return
        }

        const billData = {
            id: `INV-${Math.floor(Math.random() * 90000) + 10000}`,
            customerName: customer.name || 'Walk-in Customer',
            customerPhone: customer.phone || 'N/A',
            items: [...cart],
            subtotal,
            tax,
            total,
            method: paymentMethod,
            date: new Date().toLocaleString()
        }

        setLastBill(billData)
        setIsSuccess(true)
        addToast({ title: 'Billing Finalized', message: `Invoice generated for ₹${total}`, type: 'success' })
    }

    const handleNewSale = () => {
        setCart([])
        setCustomer({ name: '', phone: '' })
        setPaymentMethod('UPI')
        setLastBill(null)
        setIsSuccess(false)
    }

    const handlePrint = () => {
        window.print()
    }

    const categories = ['Sports', 'Gear & Rentals', 'Snacks & Drinks']

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Embedded Print stylesheet */}
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
                            <h2 className="text-2xl font-black text-surface-900 tracking-tight">Invoice Settled successfully!</h2>
                            <p className="text-surface-500 text-xs mt-1">Generated print sheet for transaction reference ID: <span className="font-extrabold text-surface-700">{lastBill.id}</span></p>
                        </div>

                        <div className="border-t border-dashed border-surface-200 pt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-left text-xs">
                                <div>
                                    <span className="text-surface-400 block font-bold uppercase tracking-wider">Customer Details</span>
                                    <span className="text-surface-900 font-extrabold block mt-0.5">{lastBill.customerName}</span>
                                    <span className="text-surface-500 block font-semibold">{lastBill.customerPhone}</span>
                                </div>
                                <div>
                                    <span className="text-surface-400 block font-bold uppercase tracking-wider">Checkout Meta</span>
                                    <span className="text-surface-900 font-extrabold block mt-0.5">{lastBill.date}</span>
                                    <span className="text-surface-500 block font-semibold">Payment mode: {lastBill.method}</span>
                                </div>
                            </div>

                            {/* Summary list */}
                            <div className="bg-surface-50 p-4 rounded-2xl border border-surface-200 text-xs text-left space-y-2.5">
                                {lastBill.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center font-semibold text-surface-650">
                                        <span>{item.name} <span className="text-surface-400">x{item.qty}</span></span>
                                        <span className="text-surface-900 font-extrabold">₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                                <div className="border-t border-surface-200 pt-2.5 mt-2.5 flex justify-between font-black text-sm text-surface-900">
                                    <span>Grand Total Paid (incl. Tax)</span>
                                    <span className="text-emerald-600">₹{lastBill.total}</span>
                                </div>
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
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tab filters */}
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

                            {/* Compact Search Option */}
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
                            /* Visual court slot assigner */
                            <Card className="p-6">
                                <h3 className="text-base font-black text-surface-900 tracking-tight mb-4 flex items-center gap-2">
                                    <span>🗓️</span> Quick walk-in field reservations
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                                    <Input
                                        label="Booking Date"
                                        type="date"
                                        value={booking.date}
                                        onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                                    />
                                    <Select
                                        label="Assigned Time Slot"
                                        value={booking.slot}
                                        onChange={(e) => setBooking({ ...booking, slot: e.target.value })}
                                        options={[
                                            { value: '06:00 AM', label: '06:00 AM' },
                                            { value: '07:00 AM', label: '07:00 AM' },
                                            { value: '06:00 PM', label: '06:00 PM (Peak)' },
                                            { value: '07:00 PM', label: '07:00 PM (Peak)' },
                                        ]}
                                    />
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Billing Rate (₹/hr)"
                                            type="number"
                                            value={booking.price}
                                            onChange={(e) => setBooking({ ...booking, price: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleAddBooking} className="mt-6 w-full cursor-pointer bg-emerald-600 hover:bg-emerald-700">
                                    <HiPlus className="mr-1 w-4 h-4" /> Add booking to checkout
                                </Button>
                            </Card>
                        ) : (
                            /* Interactive quick add inventory list */
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

                    {/* Checkout Billing Ledger Sidebar */}
                    <div className="space-y-6">
                        {/* Customer data capture */}
                        <Card className="p-5 space-y-4">
                            <h3 className="text-xs font-black text-surface-500 uppercase tracking-wider flex items-center gap-1.5">
                                <HiUser /> Walk-in customer profile
                            </h3>
                            <div className="space-y-3">
                                <Input
                                    placeholder="Customer Mobile Number"
                                    value={customer.phone}
                                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                />
                                <Input
                                    placeholder="Customer Name"
                                    value={customer.name}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                />
                            </div>
                        </Card>

                        {/* Interactive shopping basket */}
                        <Card className="p-5 flex flex-col min-h-[460px] justify-between">
                            <div>
                                <div className="flex items-center justify-between border-b border-surface-100 pb-4 mb-4">
                                    <h3 className="text-sm font-black text-surface-900 tracking-tight flex items-center gap-1.5">
                                        <HiShoppingCart /> checkout basket
                                    </h3>
                                    <Badge variant="primary">{cart.length} unique lines</Badge>
                                </div>

                                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-hide">
                                    {cart.length === 0 ? (
                                        <div className="text-center py-12 text-surface-400 space-y-2">
                                            <span className="text-4xl block">🛒</span>
                                            <p className="text-xs font-semibold">Ready to bill active items...</p>
                                        </div>
                                    ) : (
                                        cart.map(item => (
                                            <div key={item.id} className="flex justify-between items-center p-3 bg-surface-50 rounded-2xl border border-surface-150 text-xs font-semibold">
                                                <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                                                    <p className="text-surface-900 font-extrabold truncate leading-tight">{item.name}</p>
                                                    <p className="text-[10px] text-surface-400 uppercase tracking-wider">{item.category} • ₹{item.price}</p>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex items-center border border-surface-200 rounded-xl overflow-hidden bg-white shadow-soft font-bold">
                                                        <button onClick={() => handleUpdateQty(item.id, -1)} className="px-2.5 py-1 hover:bg-surface-50">-</button>
                                                        <span className="px-2 text-surface-700">{item.qty}</span>
                                                        <button onClick={() => handleUpdateQty(item.id, 1)} className="px-2.5 py-1 hover:bg-surface-50">+</button>
                                                    </div>
                                                    <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-xl border border-transparent hover:border-red-200">
                                                        <HiTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Price settlements */}
                            <div className="border-t border-surface-100 pt-4 mt-4 space-y-4">
                                <div className="text-xs space-y-2 font-semibold text-surface-500 border-b border-surface-100 pb-3">
                                    <div className="flex justify-between">
                                        <span>Basket Subtotal</span>
                                        <span className="text-surface-800 font-bold">₹{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>GST (18%)</span>
                                        <span className="text-surface-800 font-bold">₹{tax}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-black text-surface-900 pt-1">
                                        <span>Amount Due</span>
                                        <span className="text-emerald-600 text-base">₹{total}</span>
                                    </div>
                                </div>

                                {/* Settlement choices */}
                                <div>
                                    <span className="text-[10px] font-black text-surface-400 uppercase tracking-wider block mb-2">Checkout settlement</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Cash', 'UPI', 'Card'].map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setPaymentMethod(m)}
                                                className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${paymentMethod === m ? 'bg-emerald-600 border-emerald-650 text-white shadow-md shadow-emerald-500/10' : 'bg-white border-surface-200 text-surface-600 hover:border-emerald-250 hover:bg-surface-50'}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    fullWidth
                                    size="lg"
                                    onClick={handleCompletePayment}
                                    disabled={cart.length === 0}
                                    className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/10 cursor-pointer"
                                >
                                    Settle invoice receipt
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Thermal Print Invoice structure */}
            {lastBill && (
                <div id="printable-receipt" style={{ display: 'none' }} className="bg-white p-8 max-w-sm mx-auto text-left font-mono">
                    <div className="text-center border-b border-dashed pb-4 mb-4">
                        <h2 className="text-base font-black uppercase">SPORTMATRIX ENTERPRISE</h2>
                        <p className="text-[10px] text-gray-500 mt-0.5">Plot 145, Scheme No. 78, Indore (M.P.)</p>
                        <p className="text-[10px] text-gray-500">Contact: +91 90000 80000</p>
                    </div>

                    <div className="text-[10px] space-y-1 mb-4">
                        <p><strong>INVOICE ID :</strong> {lastBill.id}</p>
                        <p><strong>DATE/TIME  :</strong> {lastBill.date}</p>
                        <p><strong>CUSTOMER   :</strong> {lastBill.customerName}</p>
                        <p><strong>CONTACT    :</strong> {lastBill.customerPhone}</p>
                    </div>

                    <div className="border-t border-b border-dashed py-3 mb-4 text-[10px]">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dashed text-left">
                                    <th className="pb-1 font-bold">Item Description</th>
                                    <th className="pb-1 text-center font-bold">Qty</th>
                                    <th className="pb-1 text-right font-bold">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lastBill.items.map(item => (
                                    <tr key={item.id}>
                                        <td className="py-1 truncate max-w-[120px]">{item.name}</td>
                                        <td className="py-1 text-center">{item.qty}</td>
                                        <td className="py-1 text-right">₹{item.price * item.qty}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="text-[10px] space-y-1 text-right border-b border-dashed pb-3 mb-3">
                        <p>Subtotal: ₹{lastBill.subtotal}</p>
                        <p>CGST/SGST (18%): ₹{lastBill.tax}</p>
                        <p className="text-sm font-bold mt-1">GRAND TOTAL: ₹{lastBill.total}</p>
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
