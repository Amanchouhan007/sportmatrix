import { useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import { HiPlus, HiTrash, HiPrinter, HiDownload, HiRefresh } from 'react-icons/hi'

export default function StaffPOS() {
    const { addToast } = useToast()
    const [cart, setCart] = useState([])
    const [paymentMethod, setPaymentMethod] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)
    const [lastBill, setLastBill] = useState(null)
    
    // Booking Form State
    const [booking, setBooking] = useState({
        turf: '',
        sport: '',
        date: new Date().toISOString().split('T')[0],
        slot: '',
        players: '',
        price: ''
    })

    // Inventory Item State
    const [inventoryItem, setInventoryItem] = useState({
        id: '',
        name: '',
        price: '',
        qty: 1
    })

    const inventoryOptions = [
        { id: 'item1', name: 'Water Bottle (500ml)', price: 20 },
        { id: 'item2', name: 'Energy Drink', price: 50 },
        { id: 'item3', name: 'Football Rental', price: 100 },
        { id: 'item4', name: 'Cricket Bat Rental', price: 150 },
        { id: 'item5', name: 'Jersey Rental', price: 80 },
    ]

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)

    const handleAddBooking = () => {
        if (!booking.turf || !booking.sport || !booking.slot || !booking.price) {
            addToast({ title: 'Missing Info', message: 'Please select all booking details (Turf, Sport, Slot & Price)', type: 'error' })
            return
        }
        
        const newItem = {
            id: `bk-${Date.now()}`,
            name: `${booking.turf} - ${booking.sport} (${booking.slot})`,
            type: 'Booking',
            price: Number(booking.price),
            qty: 1
        }

        setCart([...cart, newItem])
        setBooking({ ...booking, slot: '', price: '' })
        addToast({ title: 'Added', message: 'Booking added to bill', type: 'success' })
    }

    const handleAddInventory = () => {
        const item = inventoryOptions.find(i => i.id === inventoryItem.id)
        if (!item) {
            addToast({ title: 'Select Item', message: 'Please select an item', type: 'error' })
            return
        }

        const existing = cart.find(c => c.id === item.id)
        if (existing) {
            setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + Number(inventoryItem.qty) } : c))
        } else {
            setCart([...cart, { ...item, type: 'Item', qty: Number(inventoryItem.qty) }])
        }

        setInventoryItem({ id: '', name: '', price: '', qty: 1 })
        addToast({ title: 'Added', message: `${item.name} added to bill`, type: 'success' })
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

    const handleCompletePayment = () => {
        if (cart.length === 0) {
            addToast({ title: 'Empty Bill', message: 'Add items before checkout', type: 'warning' })
            return
        }
        if (!paymentMethod) {
            addToast({ title: 'Payment Method', message: 'Please select a payment method', type: 'error' })
            return
        }

        const billData = {
            items: [...cart],
            total,
            method: paymentMethod,
            date: new Date().toLocaleString(),
            id: `STF-INV-${Math.floor(Math.random() * 90000) + 10000}`
        }

        setLastBill(billData)
        setIsSuccess(true)
        addToast({ title: 'Payment Done', message: 'Sale completed successfully', type: 'success' })
    }

    const handleNewSale = () => {
        setCart([])
        setPaymentMethod('')
        setLastBill(null)
        setIsSuccess(false)
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="space-y-6">
            <style>
                {`
                    @media print {
                        body * { visibility: hidden; }
                        #printable-bill, #printable-bill * { visibility: visible; }
                        #printable-bill { 
                            position: fixed; 
                            left: 0; 
                            top: 0; 
                            width: 100%; 
                            padding: 20px;
                            background: white !important;
                        }
                        .no-print { display: none !important; }
                    }
                `}
            </style>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">POS Billing</h1>
                    <p className="text-surface-500 text-sm mt-1">Manage walk-in bookings and counter sales</p>
                </div>
                {isSuccess && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <HiPrinter className="mr-2" /> Print Bill
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleNewSale}>
                            <HiRefresh className="mr-2" /> New Sale
                        </Button>
                    </div>
                )}
            </div>

            {/* Success State View */}
            {isSuccess ? (
                <div className="max-w-2xl mx-auto py-12 no-print text-center">
                    <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
                    <h2 className="text-3xl font-bold text-surface-900 mb-2">Payment Completed!</h2>
                    <p className="text-surface-500 mb-8">Generated Invoice #{lastBill.id} for ₹{lastBill.total}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="text-left">
                            <h3 className="font-semibold text-surface-900 mb-4 p-2 border-b">Bill Details</h3>
                            <div className="space-y-2 p-2">
                                {lastBill.items.map(i => (
                                    <div key={i.id} className="flex justify-between text-sm">
                                        <span className="text-surface-500">{i.name} x{i.qty}</span>
                                        <span className="text-surface-900 font-medium">₹{i.price * i.qty}</span>
                                    </div>
                                ))}
                                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                    <span>Total Paid</span>
                                    <span className="text-primary-600">₹{lastBill.total}</span>
                                </div>
                            </div>
                        </Card>
                        <div className="flex flex-col gap-4">
                            <Button fullWidth onClick={handlePrint} size="lg"><HiPrinter className="mr-2" /> Print Invoice</Button>
                            <Button fullWidth variant="outline" size="lg"><HiDownload className="mr-2" /> Download PDF</Button>
                            <Button fullWidth variant="ghost" onClick={handleNewSale}>New Sale</Button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
                    <StatCard label="Today's Sales" value="₹2,840" change="+15%" trend="up" icon="💰" />
                    <StatCard label="Bookings" value="6" icon="📅" />
                    <StatCard label="Items Sold" value="18" icon="📦" />
                </div>

                <div className="grid lg:grid-cols-3 gap-6 no-print">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <h2 className="text-lg font-semibold text-surface-900 mb-4">Walk-in Booking</h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                <Select 
                                    label="Select Turf" 
                                    placeholder="Choose Turf..."
                                    value={booking.turf}
                                    onChange={(e) => setBooking({...booking, turf: e.target.value})}
                                    options={[
                                        { value: 'Turf A', label: 'Turf A (Main)' },
                                        { value: 'Turf B', label: 'Turf B (Indoor)' },
                                        { value: 'Court 1', label: 'Badminton Court 1' }
                                    ]}
                                />
                                <Select 
                                    label="Sport" 
                                    placeholder="Choose Sport..."
                                    value={booking.sport}
                                    onChange={(e) => setBooking({...booking, sport: e.target.value})}
                                    options={[
                                        { value: 'Cricket', label: 'Cricket' },
                                        { value: 'Football', label: 'Football' },
                                        { value: 'Badminton', label: 'Badminton' }
                                    ]}
                                />
                                <Input label="Date" type="date" value={booking.date} onChange={(e) => setBooking({...booking, date: e.target.value})} />
                                <Select 
                                    label="Time Slot" 
                                    placeholder="Choose Time..."
                                    value={booking.slot}
                                    onChange={(e) => setBooking({...booking, slot: e.target.value})}
                                    options={[
                                        { value: '06:00 AM', label: '06:00 AM' }, { value: '07:00 AM', label: '07:00 AM' }, { value: '06:00 PM', label: '06:00 PM' }, { value: '07:00 PM', label: '07:00 PM' },
                                    ]}
                                />
                                <Input label="Players" placeholder="10" value={booking.players} onChange={(e) => setBooking({...booking, players: e.target.value})} />
                                <Input label="Price (₹)" type="number" placeholder="900" value={booking.price} onChange={(e) => setBooking({...booking, price: e.target.value})} />
                            </div>
                            <Button className="mt-4" onClick={handleAddBooking}><HiPlus className="mr-2" /> Add to Bill</Button>
                        </Card>

                        <Card>
                            <h2 className="text-lg font-semibold text-surface-900 mb-4">Add Items / Inventory</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Select 
                                    label="Select Item" 
                                    placeholder="Choose item..."
                                    value={inventoryItem.id}
                                    onChange={(e) => setInventoryItem({...inventoryItem, id: e.target.value})}
                                    options={inventoryOptions.map(opt => ({ value: opt.id, label: `${opt.name} - ₹${opt.price}` }))}
                                />
                                <Input label="Quantity" type="number" min="1" value={inventoryItem.qty} onChange={(e) => setInventoryItem({...inventoryItem, qty: e.target.value})} />
                            </div>
                            <Button className="mt-4" onClick={handleAddInventory}><HiPlus className="mr-2" /> Add to Bill</Button>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="flex flex-col h-full min-h-[500px]">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-surface-900">Current Bill</h2>
                                <Badge variant="primary">{cart.length} Items</Badge>
                            </div>

                            <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 scrollbar-hide">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12 text-surface-400">
                                        <div className="text-4xl mb-2">🛒</div>
                                        <p>Cart is empty</p>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.id} className="flex flex-col gap-2 p-3 bg-surface-50 rounded-xl border border-surface-100">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-surface-900 text-sm leading-tight">{item.name}</p>
                                                    <p className="text-xs text-surface-500 mt-1">{item.type} • ₹{item.price}</p>
                                                </div>
                                                <button onClick={() => handleRemove(item.id)} className="text-danger-500 hover:bg-danger-50 p-1 rounded-lg">
                                                    <HiTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <div className="flex items-center border border-surface-200 rounded-lg overflow-hidden bg-white">
                                                    <button onClick={() => handleUpdateQty(item.id, -1)} className="px-2 py-1 hover:bg-surface-50 text-surface-600">-</button>
                                                    <span className="px-3 py-1 text-sm font-medium border-x border-surface-200">{item.qty}</span>
                                                    <button onClick={() => handleUpdateQty(item.id, 1)} className="px-2 py-1 hover:bg-surface-50 text-surface-600">+</button>
                                                </div>
                                                <span className="font-bold text-surface-900">₹{item.price * item.qty}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-auto border-t border-surface-200 pt-4 space-y-3">
                                <div className="flex justify-between text-base font-bold text-surface-900">
                                    <span>Total</span>
                                    <span className="text-primary-600 text-xl font-bold">₹{total}</span>
                                </div>

                                <div className="pt-2">
                                    <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Payment Method</label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {['Cash', 'UPI', 'Card'].map(m => (
                                            <button key={m} onClick={() => setPaymentMethod(m)} className={`py-2 text-xs font-medium rounded-lg border transition-all ${paymentMethod === m ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-surface-200 text-surface-600 hover:border-primary-200'}`}>{m}</button>
                                        ))}
                                    </div>
                                </div>
                                <Button fullWidth size="lg" className="mt-4" onClick={handleCompletePayment} disabled={cart.length === 0}>Complete Payment</Button>
                            </div>
                        </Card>
                    </div>
                </div>
                </>
            )}

            {/* Hidden Printable Invoice */}
            {lastBill && (
                <div id="printable-bill" style={{ display: 'none' }} className="print-only-block bg-white p-8 font-sans">
                    <div className="text-center border-b-2 pb-6 mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">SGBOS TURF MANAGEMENT</h1>
                        <p className="text-gray-500 text-sm">Staff Billing Terminal</p>
                        <p className="text-gray-500 mt-2">Invoice ID: #{lastBill.id}</p>
                        <p className="text-gray-500">{lastBill.date}</p>
                    </div>
                    
                    <div className="mb-8">
                        <h2 className="text-lg font-bold mb-4 uppercase text-gray-700">Bill Summary</h2>
                        <table className="w-full text-left">
                            <thead className="border-b">
                                <tr>
                                    <th className="py-2">Item</th>
                                    <th className="py-2 text-center">Qty</th>
                                    <th className="py-2 text-right">Price</th>
                                    <th className="py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lastBill.items.map(item => (
                                    <tr key={item.id} className="border-b">
                                        <td className="py-4 text-gray-800">{item.name}</td>
                                        <td className="py-4 text-center">{item.qty}</td>
                                        <td className="py-4 text-right">₹{item.price}</td>
                                        <td className="py-4 text-right font-semibold">₹{item.price * item.qty}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-4 border-t-2">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal:</span>
                                <span>₹{lastBill.total}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-900">
                                <span>Grand Total:</span>
                                <span>₹{lastBill.total}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 uppercase">
                                <span>Payment Method:</span>
                                <span>{lastBill.method}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-12 text-center text-gray-400 text-sm">
                        <p>Thank you for visit!</p>
                        <p>Staff Terminal Generated Invoice.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
