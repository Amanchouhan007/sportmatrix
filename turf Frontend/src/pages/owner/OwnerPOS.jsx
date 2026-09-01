
import { useState, useEffect, useMemo } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import api from '../../services/api'
import { getBranchSports } from '../../services/sportsService'
import { getInventory, createInventoryItem } from '../../services/inventoryService'

import { getSlots } from '../../services/slotService'
import { getMyTurfs } from '../../services/branchService'
import { processPayment } from '../../services/paymentLogService'


import { 
    HiPlus, HiTrash, HiPrinter, HiDownload, HiRefresh, HiUser, 
    HiShoppingCart, HiTag, HiCheckCircle, HiExclamationCircle, 
    HiClock, HiCalendar, HiCurrencyRupee, HiCheck, HiShieldCheck
} from 'react-icons/hi'


// ── Master Data & Configuration (Pure Dynamic MySQL Driven) ──
const sportsList = [
    { id: 'cricket', name: 'Cricket', icon: '🏏' }
]

const courtsBySport = {
    Cricket: [
        { id: 'c1', name: 'Box Cricket Pitch 1', status: 'Active' }
    ]
}

const timeSlots = []

const extraServicesList = [
    { id: 'floodlights', label: 'Flood Lights', price: 100, icon: '💡' },
    { id: 'equipment', label: 'Sports Equipment', price: 200, icon: '🏏' },
    { id: 'coach', label: 'Coach', price: 500, icon: '📋' },
    { id: 'locker', label: 'Locker', price: 50, icon: '🔒' },
    { id: 'changingroom', label: 'Changing Room', price: 50, icon: '👕' },
    { id: 'water', label: 'Drinking Water', price: 0, icon: '💧' },
    { id: 'refreshments', label: 'Refreshments', price: 100, icon: '🥤' },
    { id: 'parking', label: 'Parking', price: 0, icon: '🅿️' }
]

const inventoryOptions = []


export default function OwnerPOS() {
    const { addToast } = useToast()
    const [cart, setCart] = useState([])
    const [activeTab, setActiveTab] = useState('Sports') // Sports | Gear & Rentals | Snacks & Drinks
    const [searchQuery, setSearchQuery] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)
    const [lastBill, setLastBill] = useState(null)

    // ── Walk-In Quick Booking Form State ──
    const [booking, setBooking] = useState({
        sport: 'Cricket',
        court: 'Box Cricket Pitch 1',
        date: new Date().toISOString().split('T')[0],

        slot: '',
        duration: 60, // 30, 60, 90, 120 mins
        players: 10,
        bookingType: 'Walk-In', // Walk-In | Online | Phone Booking | Corporate | Membership
        billingRate: 0,
        discountType: 'None', // None | Flat | Percentage | Promo Code
        discountValue: 0,
        promoCode: '',
        selectedExtras: [],
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
    const [autoPrintReceipt, setAutoPrintReceipt] = useState(() => localStorage.getItem('pos_auto_print') !== 'false')

    const toggleAutoPrint = (val) => {
        setAutoPrintReceipt(val)
        localStorage.setItem('pos_auto_print', String(val))
    }

    // ── Add Custom Product / Ball Modal State ──
    const [isAddProductOpen, setIsAddProductOpen] = useState(false)
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: 'Gear & Rentals',
        itemType: 'Sell', // Sell | Rental
        price: '',
        stock: '20'
    })

    const handleCreateCustomProduct = async (e) => {
        e.preventDefault()
        if (!newProduct.name || !newProduct.price) {
            addToast({ title: 'Validation Error', message: 'Item name and price are required', type: 'warning' })
            return
        }

        try {
            const branchId = selectedTurfId || localStorage.getItem('selectedBranchId') || 'br_indore_01'
            const payload = {
                branchId,
                name: `${newProduct.name} ${newProduct.itemType === 'Rental' ? '(Rental)' : '(Sale)'}`,
                category: newProduct.category,
                price: Number(newProduct.price),
                stock: Number(newProduct.stock || 20),
                threshold: 5
            }

            await createInventoryItem(payload)
            addToast({ title: 'Product Added', message: `${newProduct.name} saved to MySQL inventory!`, type: 'success' })
            setIsAddProductOpen(false)
            setNewProduct({ name: '', category: 'Gear & Rentals', itemType: 'Sell', price: '', stock: '20' })

            // Refresh live inventory from MySQL
            getInventory()
                .then(r => {
                    const list = r?.data || (Array.isArray(r) ? r : [])
                    if (Array.isArray(list)) setDbInventory(list)
                })
                .catch(() => {})
        } catch (err) {
            addToast({ title: 'Error Adding Item', message: err.message || 'Failed to create item in MySQL', type: 'error' })
        }
    }


    // ── Automations ──

    // 1. Auto search customer when mobile number changes via MySQL Database
    const handlePhoneChange = async (phoneVal) => {
        setCustomer(prev => ({ ...prev, phone: phoneVal }))
        const clean = phoneVal.trim()
        if (clean.length >= 10) {
            try {
                const res = await api.get(`/crm/customer-lookup?phone=${clean}`)
                if (res && res.found && res.data) {
                    const found = res.data
                    setCustomer({
                        phone: clean,
                        name: found.name || '',
                        email: found.email || '',
                        type: found.type || 'Regular',
                        membershipId: found.membershipId || '',
                        isExisting: true,
                        bookingsCount: found.bookingsCount || 1,
                        status: found.status || 'Verified Player',
                        outstanding: found.outstanding || 0
                    })
                    addToast({ title: 'Customer Recognized', message: `Found ${found.name} (${found.type})`, type: 'success' })
                    return
                }
            } catch (e) {
                console.warn('Customer lookup error:', e)
            }

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


    // ── Live MySQL Database Driven State ──
    const [myTurfs, setMyTurfs] = useState([])
    const [selectedTurfId, setSelectedTurfId] = useState(() => localStorage.getItem('selectedBranchId') || '')
    const [dbSports, setDbSports] = useState([])
    const [dbSlots, setDbSlots] = useState([])
    const [dbInventory, setDbInventory] = useState([])

    // 1. Load logged-in owner's real MySQL turfs/branches
    useEffect(() => {
        getMyTurfs()
            .then(res => {
                const list = res?.data || (Array.isArray(res) ? res : [])
                if (Array.isArray(list) && list.length > 0) {
                    setMyTurfs(list)
                    const activeExists = list.find(t => t.id === selectedTurfId)
                    if (!activeExists) {
                        const firstId = list[0].id
                        setSelectedTurfId(firstId)
                        localStorage.setItem('selectedBranchId', firstId)
                    }
                }
            })
            .catch(e => console.warn('getMyTurfs error:', e.message))
    }, [])

    // 2. Load live Branch Sports and Inventory Items when selectedTurfId changes
    useEffect(() => {
        if (!selectedTurfId) return
        getBranchSports(selectedTurfId)
            .then(res => {
                const list = res?.data || (Array.isArray(res) ? res : [])
                if (Array.isArray(list) && list.length > 0) {
                    setDbSports(list)
                    const cricketObj = list.find(s => (s.sport?.name || s.name || '').toLowerCase() === 'cricket') || list[0]
                    const sName = cricketObj.sport?.name || cricketObj.name || 'Cricket'
                    setBooking(prev => ({
                        ...prev,
                        sport: sName,
                        sportId: cricketObj.sportId || cricketObj.id,
                        court: sName === 'Cricket' ? 'Box Cricket Pitch 1' : 'Court 1 (Main Turf)'
                    }))
                }
            })
            .catch(() => {})

        getInventory()
            .then(res => {
                const list = res?.data || (Array.isArray(res) ? res : [])
                if (Array.isArray(list) && list.length > 0) {
                    setDbInventory(list)
                }
            })
            .catch(() => {})
    }, [selectedTurfId])

    // 3. Load live Time Slots from MySQL based on selected date & turf
    useEffect(() => {
        if (selectedTurfId && booking.date) {
            getSlots({ branchId: selectedTurfId, date: booking.date })
                .then(res => {
                    const list = res?.data || (Array.isArray(res) ? res : [])
                    if (Array.isArray(list) && list.length > 0) {
                        const mappedSlots = list.map(s => {
                            const startTimeStr = s.startTime ? (s.startTime.includes(':') ? s.startTime.substring(0, 5) : s.startTime) : '06:00'
                            const [h, m] = startTimeStr.split(':').map(Number)
                            const period = h >= 12 ? 'PM' : 'AM'
                            const h12 = h % 12 || 12
                            const formattedTime = `${String(h12).padStart(2, '0')}:${String(m || 0).padStart(2, '0')} ${period}`
                            const status = s.status === 'BOOKED' ? 'Booked' : s.status === 'BLOCKED' ? 'Maintenance' : 'Available'
                            return {
                                id: s.id,
                                time: formattedTime,
                                status,
                                isPeak: !!s.isPeak,
                                rate: s.regularPrice || 1200
                            }
                        })
                        setDbSlots(mappedSlots)
                    }
                })
                .catch(() => {})
        }
    }, [selectedTurfId, booking.date])


    const activeSportsList = useMemo(() => {
        if (dbSports.length > 0) {
            return dbSports.map(bs => ({
                id: bs.sportId || bs.id,
                name: bs.sport?.name || bs.name || 'Sport',
                icon: (bs.sport?.name || bs.name || '').toLowerCase().includes('cricket') ? '🏏' : '⚽'
            }))
        }
        return sportsList
    }, [dbSports])

    // Available courts based on selected sport
    const availableCourts = useMemo(() => {
        if (dbSports.length > 0) {
            const found = dbSports.find(bs => (bs.sport?.name || bs.name) === booking.sport)
            const count = found?.totalCourts || 2
            const courtArr = []
            for (let i = 1; i <= count; i++) {
                courtArr.push({ id: `c_${i}`, name: `Pitch ${i} (${found?.sport?.name || booking.sport})`, status: 'Active' })
            }
            return courtArr
        }
        return courtsBySport[booking.sport] || courtsBySport['Cricket'] || []
    }, [dbSports, booking.sport])

    // Court & Turf options combined with Owner's real MySQL Turfs
    const courtOptions = useMemo(() => {
        if (myTurfs.length > 0) {
            const opts = []
            myTurfs.forEach(t => {
                const tName = t.branchName || t.name || 'Turf'
                const count = t.sports?.[0]?.totalCourts || 2
                for (let i = 1; i <= Math.max(1, count); i++) {
                    const courtName = count > 1 ? `${tName} - Pitch ${i}` : tName
                    opts.push({
                        value: `${t.id}:::${courtName}`,
                        label: `🏟️ ${tName} (${t.city || 'Indore'}) - Pitch ${i}`,
                        turfId: t.id,
                        courtName
                    })
                }
            })
            return opts
        }
        return availableCourts.map(c => ({
            value: `default:::${c.name}`,
            label: `${c.name}`,
            turfId: selectedTurfId,
            courtName: c.name
        }))
    }, [myTurfs, availableCourts, selectedTurfId])

    const currentCourtValue = useMemo(() => {
        const matched = courtOptions.find(o => o.turfId === selectedTurfId && o.courtName === booking.court)
        if (matched) return matched.value
        const firstForTurf = courtOptions.find(o => o.turfId === selectedTurfId)
        if (firstForTurf) return firstForTurf.value
        return courtOptions[0]?.value || ''
    }, [courtOptions, selectedTurfId, booking.court])

    const handleCourtSelectChange = (val) => {
        const [tId, cName] = val.split(':::')
        if (tId && tId !== 'default' && tId !== selectedTurfId) {
            setSelectedTurfId(tId)
            localStorage.setItem('selectedBranchId', tId)
            addToast({ title: 'Venue Selected', message: `Selected venue: ${cName || val}`, type: 'info' })
        }
        setBooking(prev => ({
            ...prev,
            court: cName || val
        }))
    }

    const activeTimeSlots = useMemo(() => {
        if (dbSlots.length > 0) {
            return dbSlots
        }
        return timeSlots
    }, [dbSlots])

    const activeInventoryOptions = useMemo(() => {
        if (dbInventory.length > 0) {
            return dbInventory
                .filter(item => {
                    const cat = (item.category || '').toLowerCase()
                    if (activeTab === 'Gear & Rentals') return cat.includes('gear') || cat.includes('rental')
                    if (activeTab === 'Snacks & Drinks') return cat.includes('snack') || cat.includes('drink') || cat.includes('beverage') || cat.includes('food')
                    return true
                })
                .map(item => ({
                    id: item.id,
                    name: item.name,
                    price: Number(item.price || 0),
                    category: item.category || 'Gear & Rentals',
                    icon: (item.category || '').toLowerCase().includes('snack') || (item.category || '').toLowerCase().includes('drink') ? '🥤' : '🏏'
                }))
        }
        return inventoryOptions
    }, [dbInventory, activeTab])


    // Auto-update court when sport changes
    const handleSportChange = (newSport) => {
        const defaultCourt = availableCourts[0]?.name || ''
        setBooking(prev => ({
            ...prev,
            sport: newSport,
            court: defaultCourt
        }))
    }


    // ── Smart Validation: Check Consecutive Slot Availability for Multi-Hour Bookings ──
    const checkSlotAvailabilityForDuration = (startSlotTime, hours, slotsArray = activeTimeSlots) => {
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

    // Base court price calculated from billing rate and duration (only when slot is selected)
    const baseCourtPrice = useMemo(() => {
        if (!booking.slot) return 0
        const rate = Number(booking.billingRate) || 0
        const durationMins = Number(booking.duration) || 60
        return Math.round((durationMins / 60) * rate)
    }, [booking.slot, booking.billingRate, booking.duration])

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

    // Subtotal & Totals (18% GST completely removed)
    const currentBookingSubtotal = booking.slot ? Math.max(0, baseCourtPrice + extrasTotal - discountAmount) : 0
    const inventoryCartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
    const grandSubtotal = currentBookingSubtotal + inventoryCartSubtotal
    const gstTax = 0
    const grandTotal = grandSubtotal
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

        try {
            const selectedBranchId = localStorage.getItem('selectedBranchId') || ''
            const res = await api.post('/billing/pos-checkout', {
                branchId: selectedBranchId,
                sportId: booking.sportId || null,
                courtName: booking.court,
                slotDate: booking.date,
                slotTime: booking.slot,
                duration: booking.duration,
                customerName: customerName,
                customerPhone: customer.phone,
                customerEmail: customer.email,
                customerType: customer.type,
                paymentMethod: paymentMethod || 'UPI',
                paymentStatus: paymentStatus,
                advanceAmount: Number(advanceAmount) || 0,
                cartItems: cart,
                discountAmount: discountAmount,
                totalAmount: grandTotal,
                notes: booking.notes
            })
            if (res && res.data && res.data.invoiceNumber) {
                billData.id = res.data.invoiceNumber
            }
        } catch (e) {
            console.warn('POS MySQL checkout sync note:', e.message)
            try {
                await processPayment({
                    customerName: customerName,
                    amount: grandTotal,
                    paymentMethod: paymentMethod || 'UPI'
                })
            } catch (err) {}
        }


        setLastBill(billData)
        setIsSuccess(true)
        addToast({ title: 'Invoice Settled', message: `Invoice ${billData.id} generated for ₹${grandTotal}`, type: 'success' })

        if (autoPrintReceipt) {
            setTimeout(() => {
                window.print()
            }, 200)
        }
    }

    const handleShareWhatsApp = () => {
        if (!lastBill) return
        const cleanPhone = (lastBill.customerPhone || '').replace(/\D/g, '')
        const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone
        const invId = lastBill.id || 'INV-001'
        const name = lastBill.customerName || 'Customer'
        const sport = lastBill.bookingSummary?.sport || 'Turf'
        const court = lastBill.bookingSummary?.court || 'Pitch'
        const slot = lastBill.bookingSummary?.slot || ''
        const date = lastBill.date || new Date().toLocaleString()
        const paid = lastBill.bookingSummary?.total || 0
        const method = lastBill.method || 'UPI'

        const msg = `🧾 *KIAAN TECHNOLOGY TURF - INVOICE RECEIPT*\n----------------------------------------\n*Invoice ID:* ${invId}\n*Customer:* ${name}\n*Date & Time:* ${date}\n*Venue/Slot:* ${sport} - ${court} (${slot})\n*Payment Status:* ${lastBill.paymentStatus} via ${method}\n*Grand Total Paid:* ₹${paid}\n----------------------------------------\nThank you for playing with us! 🏟️⚡`

        const waUrl = formattedPhone 
            ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`
            : `https://wa.me/?text=${encodeURIComponent(msg)}`
        window.open(waUrl, '_blank')
    }

    const handleShareSMS = () => {
        if (!lastBill) return
        const cleanPhone = (lastBill.customerPhone || '').replace(/\D/g, '')
        const msg = `Kiaan Turf Invoice ${lastBill.id}: Paid ₹${lastBill.bookingSummary?.total || 0} via ${lastBill.method || 'UPI'} for ${lastBill.bookingSummary?.sport || 'Booking'} (${lastBill.bookingSummary?.slot || ''}). Thank you!`
        const smsUrl = cleanPhone ? `sms:${cleanPhone}?body=${encodeURIComponent(msg)}` : `sms:?body=${encodeURIComponent(msg)}`
        window.location.href = smsUrl
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
                            display: block !important;
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

                        {/* INSTANT MULTI-CHANNEL RECEIPT SHARING ACTION BAR */}
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-left">
                                ⚡ INSTANT CUSTOMER RECEIPT DISPATCH
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <Button 
                                    onClick={handleShareWhatsApp} 
                                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs py-3 shadow-md shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <span>📱</span> Send WhatsApp Receipt to {lastBill.customerPhone || 'Customer'}
                                </Button>
                                <Button 
                                    onClick={handleShareSMS} 
                                    className="bg-sky-600 hover:bg-sky-700 text-white font-black text-xs py-3 shadow-md shadow-sky-500/10 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <span>💬</span> Send Direct SMS Receipt
                                </Button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                <Button fullWidth onClick={handlePrint} size="lg" className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3.5 shadow-lg cursor-pointer flex items-center justify-center gap-2">
                                    <HiPrinter className="w-5 h-5 text-amber-400" /> 🖨️ Thermal Print Receipt
                                </Button>
                                <Button fullWidth variant="outline" onClick={handleNewSale} size="lg" className="border-slate-300 hover:bg-slate-50 font-bold text-xs py-3.5 cursor-pointer text-slate-800">
                                    Start New Register
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Primary POS Workspace splitting layout */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
                    
                    {/* LEFT PANEL (~66% / col-span-2) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tab Category Bar */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-white p-3 rounded-2xl border border-surface-200/60 shadow-soft shrink-0">
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
                                        options={activeSportsList.map(s => ({ value: s.name, label: `${s.icon} ${s.name}` }))}
                                    />
                                    <Select
                                        label="Court / Turf"
                                        value={currentCourtValue}
                                        onChange={(e) => handleCourtSelectChange(e.target.value)}
                                        options={courtOptions.map(o => ({ value: o.value, label: o.label }))}
                                    />

                                </div>

                                {/* BOOKING DATE & BOOKING TYPE */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <CustomDatePicker
                                        label="Booking Date"
                                        value={booking.date}
                                        onChange={(val) => setBooking({ ...booking, date: val })}
                                        align="left"
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
                                        {activeTimeSlots.map(slotObj => {
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
                                {/* Always visible Add New Custom Product Card */}
                                <div
                                    onClick={() => {
                                        setNewProduct(prev => ({ ...prev, category: activeTab }))
                                        setIsAddProductOpen(true)
                                    }}
                                    className="bg-emerald-50/80 hover:bg-emerald-100 rounded-2xl border-2 border-dashed border-emerald-400 p-2.5 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center h-28 text-center group shadow-2xs"
                                >
                                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-110 transition-transform">
                                        +
                                    </div>
                                    <span className="text-[10.5px] font-black text-emerald-950 mt-1.5 leading-tight">Add New Product</span>
                                    <span className="text-[9px] text-emerald-700 font-bold mt-0.5">Sell ball, rent gear...</span>
                                </div>

                                {(() => {
                                    const filtered = activeInventoryOptions.filter(
                                        i => i.category === activeTab &&
                                            i.name.toLowerCase().includes(searchQuery.toLowerCase())
                                    )

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
                                    <Badge variant="primary">{cart.length + (booking.slot ? 1 : 0)} items</Badge>
                                </div>

                                {/* Itemized booking summary in basket */}
                                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 scrollbar-hide">
                                    {cart.length === 0 && !booking.slot ? (
                                        <div className="text-center py-6 text-surface-400 bg-surface-50/60 rounded-2xl border border-dashed border-surface-200 p-4">
                                            <span className="text-2xl block">🛒</span>
                                            <p className="text-xs font-bold mt-1 text-surface-600">Checkout Basket is Empty</p>
                                            <p className="text-[10px] text-surface-400 mt-0.5">Select a time slot or add items to checkout</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Active Walk-in Booking Summary Item */}
                                            {booking.slot && (
                                                <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs font-semibold space-y-1.5">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className="font-black text-emerald-950 text-xs block">{booking.sport} - {booking.court}</span>
                                                            <span className="text-[10px] text-emerald-700 font-bold block">{booking.slot} ({booking.duration} Mins) • {booking.players} Players</span>
                                                        </div>
                                                        <span className="font-black text-emerald-800 text-xs">₹{baseCourtPrice}</span>
                                                    </div>

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
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* COMPACT BOOKING & PRICE SUMMARY */}
                            <div className="border-t border-surface-100 pt-3 space-y-3">
                                <div className="text-xs space-y-1.5 font-semibold text-surface-600 border-b border-surface-100 pb-3">
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
                                                { value: 'Cash', label: '💵 Cash (Venue)' },
                                                { value: 'UPI', label: '📱 Venue UPI / QR Scan' }
                                            ]}
                                        />

                                    </div>

                                    {(paymentMethod === 'UPI' || paymentMethod === 'Venue QR') && (() => {
                                        const activeTurf = myTurfs.find(t => t.id === selectedTurfId) || myTurfs[0] || {}
                                        const venueUpiId = activeTurf.upiId || activeTurf.paymentUpiId || activeTurf.upi || 'owner@upi'
                                        const venueQrSrc = activeTurf.qrCodeUrl || activeTurf.upiQrUrl || activeTurf.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${venueUpiId}&pn=${encodeURIComponent(activeTurf.name || 'Turf Venue')}&am=${grandTotal}&cu=INR`
                                        return (
                                            <div className="p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200 text-center space-y-2 animate-in fade-in duration-300">
                                                <div className="text-[11px] font-black text-emerald-950 uppercase tracking-wider flex items-center justify-center gap-1.5">
                                                    <span>📱</span> Venue QR Code Payment (₹{grandTotal})
                                                </div>
                                                <div className="bg-white p-2 rounded-xl border border-emerald-200 inline-block shadow-sm">
                                                    <img
                                                        src={venueQrSrc}
                                                        alt="Venue Payment QR"
                                                        className="w-28 h-28 mx-auto rounded-md object-contain"
                                                    />
                                                </div>
                                                <div className="text-[10.5px] font-bold text-emerald-900">
                                                    Scan & Pay to Venue UPI: <span className="font-black text-emerald-950 bg-emerald-100 px-1.5 py-0.5 rounded">{venueUpiId}</span>
                                                </div>
                                                <div className="text-[9.5px] text-emerald-700 font-bold border-t border-emerald-200/60 pt-1 mt-1">
                                                    ⚡ Direct 0% Commission Payment (100% Venue Owner Share)
                                                </div>
                                            </div>
                                        )
                                    })()}



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

                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 p-2.5 rounded-xl cursor-pointer hover:bg-slate-200/80 transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={autoPrintReceipt} 
                                            onChange={(e) => toggleAutoPrint(e.target.checked)}
                                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer" 
                                        />
                                        <span className="flex items-center gap-1">
                                            ⚡ Auto-Print Receipt Instantly on Payment
                                        </span>
                                    </label>

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
                <div id="printable-receipt" className="hidden print:block bg-white p-8 max-w-sm mx-auto text-left font-mono">
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
                        <p className="text-sm font-bold mt-1">GRAND TOTAL: ₹{lastBill.bookingSummary.total}</p>
                        {lastBill.bookingSummary.remaining > 0 && <p className="text-rose-600 font-bold">BALANCE REMAINING: ₹{lastBill.bookingSummary.remaining}</p>}
                    </div>


                    <div className="text-center text-[10px] space-y-0.5 text-gray-500 uppercase tracking-widest mt-6">
                        <p>--- THANK YOU FOR SPORTING WITH US ---</p>
                        <p>Visit again soon!</p>
                    </div>
                </div>
            )}

            {/* ── Add New Custom Product / Equipment Modal ── */}

            <Modal
                isOpen={isAddProductOpen}
                onClose={() => setIsAddProductOpen(false)}
                title="➕ Add Custom Product / Equipment to MySQL"
                size="md"
            >
                <form onSubmit={handleCreateCustomProduct} className="space-y-4 text-xs font-medium">
                    <p className="text-slate-500 font-semibold">
                        Add cricket balls, rental bats, water bottles or custom snacks to sell directly at POS.
                    </p>

                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Product / Item Name *</label>
                        <Input
                            placeholder="e.g. Cosco Cricket Ball, SG Leather Ball, Grips..."
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Category</label>
                            <Select
                                value={newProduct.category}
                                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                options={[
                                    { value: 'Gear & Rentals', label: '🏏 Gear & Rentals' },
                                    { value: 'Snacks & Drinks', label: '🥤 Snacks & Drinks' }
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Transaction Type</label>
                            <Select
                                value={newProduct.itemType}
                                onChange={(e) => setNewProduct({ ...newProduct, itemType: e.target.value })}
                                options={[
                                    { value: 'Sell', label: '🛒 Sale (Bechna)' },
                                    { value: 'Rental', label: '🔑 Rental (Kiraye par Dena)' }
                                ]}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Price (₹) *</label>
                            <Input
                                type="number"
                                placeholder="e.g. 50"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Initial Stock Quantity</label>
                            <Input
                                type="number"
                                placeholder="20"
                                value={newProduct.stock}
                                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                        <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 font-black">
                            Save Item
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}


