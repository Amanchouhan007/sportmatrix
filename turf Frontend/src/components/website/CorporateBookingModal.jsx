import { useState, useEffect, useRef } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { useToast } from '../ui/Toast'
import { submitCorporateProposal } from '../../services/corporateService'
import { HiOfficeBuilding, HiPhone, HiMail, HiUser, HiCalendar, HiCurrencyRupee, HiCheckCircle, HiSearch, HiChevronDown, HiCheck, HiLocationMarker } from 'react-icons/hi'

const EVENT_CONFIG = {
    'Corporate Tournament': {
        budgets: [
            { label: '₹35,000 - ₹60,000 (Half Day Tourney)', value: '₹35,000 - ₹60,000' },
            { label: '₹60,000 - ₹1,20,000 (Full Day Knockout)', value: '₹60,000 - ₹1,20,000' },
            { label: '₹1,20,000 - ₹2,50,000 (Grand Championship + Trophies)', value: '₹1,20,000 - ₹2,50,000' },
            { label: '₹2,50,000+ (Multi-Turf Super League)', value: '₹2,50,000+' }
        ],
        defaultBudget: '₹60,000 - ₹1,20,000',
        defaultTimeSlot: '🏆 Full Day Arena Booking (08:00 AM - 08:00 PM)',
        defaultPlayers: '40-50 Players'
    },
    'Employee Weekend Match': {
        budgets: [
            { label: '₹4,500 - ₹9,000 (2-3 Hours Friendly)', value: '₹4,500 - ₹9,000' },
            { label: '₹9,000 - ₹18,000 (Half Day Session)', value: '₹9,000 - ₹18,000' },
            { label: '₹18,000 - ₹30,000 (Multi-Team Weekend Clash)', value: '₹18,000 - ₹30,000' }
        ],
        defaultBudget: '₹9,000 - ₹18,000',
        defaultTimeSlot: '🌆 Evening Prime Match (06:00 PM - 09:00 PM)',
        defaultPlayers: '20-30 Players'
    },
    'Monthly Bulk Arena Booking': {
        budgets: [
            { label: '₹20,000 - ₹40,000/mo (4 Weekend Slots)', value: '₹20,000 - ₹40,000/mo' },
            { label: '₹40,000 - ₹80,000/mo (8 Slots + Equipment)', value: '₹40,000 - ₹80,000/mo' },
            { label: '₹80,000 - ₹1,50,000/mo (Unlimited Weekdays)', value: '₹80,000 - ₹1,50,000/mo' },
            { label: '₹1,50,000+/mo (Exclusive Company Prime Pass)', value: '₹1,50,000+/mo' }
        ],
        defaultBudget: '₹40,000 - ₹80,000/mo',
        defaultTimeSlot: '🌙 Night Floodlight League (08:00 PM - 12:00 AM)',
        defaultPlayers: '30-40 Players'
    },
    'Annual Sports Day': {
        budgets: [
            { label: '₹50,000 - ₹1,00,000 (Multi-Sport Arena Takeover)', value: '₹50,000 - ₹1,00,000' },
            { label: '₹1,00,000 - ₹2,50,000 (Full Event, Stage & Sound)', value: '₹1,00,000 - ₹2,50,000' },
            { label: '₹2,50,000 - ₹5,00,000 (Corporate Olympics + Food/DJ)', value: '₹2,50,000 - ₹5,00,000' },
            { label: '₹5,00,000+ (500+ Guests Mega Sports Fest)', value: '₹5,00,000+' }
        ],
        defaultBudget: '₹1,00,000 - ₹2,50,000',
        defaultTimeSlot: '🏆 Full Day Arena Booking (08:00 AM - 08:00 PM)',
        defaultPlayers: '100+ Players (Full Arena Booking)'
    }
}

// Haversine formula to compute direct distance in kilometers
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null
    const R = 6371 // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c
    return Math.round(d * 10) / 10 // rounded to 1 decimal place (e.g. 1.2 km)
}

const CITY_COORDINATES = {
    'Indore': { lat: 22.7196, lng: 75.8577, label: 'Indore City Center' },
    'Mumbai': { lat: 19.0760, lng: 72.8777, label: 'Mumbai Metro' },
    'Bangalore': { lat: 12.9716, lng: 77.5946, label: 'Bangalore Central' },
    'Delhi': { lat: 28.6139, lng: 77.2090, label: 'Delhi NCR' },
    'Pune': { lat: 18.5204, lng: 73.8567, label: 'Pune Central' }
}

const DETAILED_TURFS = [
    // Indore
    { id: 'ind_1', name: 'Champion Turf Ground', location: 'Palasia, Indore', city: 'Indore', tag: 'Box Cricket & Floodlights', rating: '4.8 ★', lat: 22.7244, lng: 75.8839 },
    { id: 'ind_2', name: 'Royal Cricket Ground', location: 'Vijay Nagar, Indore', city: 'Indore', tag: 'Pro Turf Arena', rating: '4.7 ★', lat: 22.7533, lng: 75.8937 },
    { id: 'ind_3', name: 'Indore Sports Complex', location: 'LIG Colony, Indore', city: 'Indore', tag: 'Multi-Sport Arena (AC/Dressing)', rating: '4.9 ★', lat: 22.7380, lng: 75.8820 },
    { id: 'ind_4', name: 'Spike Cricket Turf', location: 'Bhawarkua, Indore', city: 'Indore', tag: 'High-Lumen Night Arena', rating: '4.6 ★', lat: 22.6926, lng: 75.8676 },
    { id: 'ind_5', name: 'Skyline Sports Hub', location: 'Super Corridor, Indore', city: 'Indore', tag: 'Full Size Pitch + Cafeteria', rating: '4.7 ★', lat: 22.7750, lng: 75.8120 },
    { id: 'ind_6', name: 'GreenField Arena', location: 'Rau, Indore', city: 'Indore', tag: 'Natural Seating & Pavilion', rating: '4.6 ★', lat: 22.6350, lng: 75.8050 },
    { id: 'ind_7', name: 'Annapurna Sports Arena', location: 'Annapurna, Indore', city: 'Indore', tag: 'Double Box Turf', rating: '4.5 ★', lat: 22.7000, lng: 75.8350 },
    // Mumbai
    { id: 'mum_1', name: 'SportZone Arena', location: 'Andheri West, Mumbai', city: 'Mumbai', tag: 'FIFA Synthetic Turf', rating: '4.8 ★', lat: 19.1364, lng: 72.8296 },
    { id: 'mum_2', name: 'Mumbai Premier Sports Arena', location: 'Bandra West, Mumbai', city: 'Mumbai', tag: 'Sea-Breeze Pro Arena', rating: '4.9 ★', lat: 19.0596, lng: 72.8295 },
    { id: 'mum_3', name: 'Thane Floodlight Turf Club', location: 'Thane West, Mumbai', city: 'Mumbai', tag: 'Grand Stadium Lighting', rating: '4.7 ★', lat: 19.2183, lng: 72.9781 },
    // Bangalore
    { id: 'blr_1', name: 'Bangalore Central Sports Arena', location: 'Indiranagar, Bangalore', city: 'Bangalore', tag: 'Corporate Tech Leagues', rating: '4.8 ★', lat: 12.9784, lng: 77.6408 },
    { id: 'blr_2', name: 'Whitefield Corporate Turf Club', location: 'Whitefield, Bangalore', city: 'Bangalore', tag: 'Tournament Stadium', rating: '4.7 ★', lat: 12.9698, lng: 77.7500 },
    { id: 'blr_3', name: 'Koramangala Pro Arena', location: 'Koramangala, Bangalore', city: 'Bangalore', tag: 'Multi-Pitch Facility', rating: '4.9 ★', lat: 12.9352, lng: 77.6245 },
    // Delhi
    { id: 'del_1', name: 'Delhi Super Turf Arena', location: 'Saket, South Delhi', city: 'Delhi', tag: 'Executive Turf Club', rating: '4.8 ★', lat: 28.5245, lng: 77.2066 },
    { id: 'del_2', name: 'Gurgaon Cyber City Sports Turf', location: 'Cyber City, Gurgaon', city: 'Delhi', tag: 'Corporate Mega Arena', rating: '4.9 ★', lat: 28.4950, lng: 77.0895 },
    { id: 'del_3', name: 'Noida Expressway Box Ground', location: 'Sector 62, Noida', city: 'Delhi', tag: 'Night Championship Pitch', rating: '4.6 ★', lat: 28.6258, lng: 77.3670 },
    // Pune
    { id: 'pun_1', name: 'Pune Sports Arena', location: 'Kothrud, Pune', city: 'Pune', tag: 'Premium Box Turf', rating: '4.7 ★', lat: 18.5074, lng: 73.8077 },
    { id: 'pun_2', name: 'Hinjewadi Tech Turf Arena', location: 'Hinjewadi Phase 1, Pune', city: 'Pune', tag: 'IT Park Arena', rating: '4.8 ★', lat: 18.5913, lng: 73.7389 },
    { id: 'pun_3', name: 'Viman Nagar Turf Club', location: 'Viman Nagar, Pune', city: 'Pune', tag: 'Pro Turf & Recovery Lounge', rating: '4.6 ★', lat: 18.5679, lng: 73.9143 }
]

export default function CorporateBookingModal({ isOpen, onClose, preselectedTurf = null, preselectedCity = null }) {
    const { addToast } = useToast()
    const [form, setForm] = useState({
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        eventType: 'Corporate Tournament',
        city: 'Indore',
        preferredTurf: 'Champion Turf Ground (Palasia, Indore)',
        estimatedPlayers: '40-50 Players',
        budget: '₹60,000 - ₹1,20,000',
        eventDate: '',
        timeSlot: '🏆 Full Day Arena Booking (08:00 AM - 08:00 PM)',
        paymentMode: 'GST_INVOICE'
    })
    const [submitted, setSubmitted] = useState(false)
    const [submittedId, setSubmittedId] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCustomPlayerCount, setIsCustomPlayerCount] = useState(false)
    const [customPlayerCount, setCustomPlayerCount] = useState('')
    const [isCustomBudget, setIsCustomBudget] = useState(false)
    const [customBudget, setCustomBudget] = useState('')
    const [isCustomTurf, setIsCustomTurf] = useState(false)
    const [customTurfName, setCustomTurfName] = useState('')

    // Custom List Dropdown & Geolocation States
    const [isTurfDropdownOpen, setIsTurfDropdownOpen] = useState(false)
    const [turfSearchTerm, setTurfSearchTerm] = useState('')
    const turfDropdownRef = useRef(null)
    const [userCoords, setUserCoords] = useState(null)
    const [isLocating, setIsLocating] = useState(false)
    const [userLocationLabel, setUserLocationLabel] = useState('')

    // Live Geolocation Detection
    const detectUserLocation = (notify = false) => {
        if (!navigator.geolocation) {
            const cityCenter = CITY_COORDINATES[form.city] || CITY_COORDINATES['Indore']
            setUserCoords({ lat: cityCenter.lat, lng: cityCenter.lng })
            setUserLocationLabel(`${cityCenter.label}`)
            return
        }

        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserCoords({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                })
                setUserLocationLabel('Live GPS Location')
                setIsLocating(false)
                if (notify && addToast) {
                    addToast({ message: '📍 GPS Location acquired! Turfs sorted by nearest distance.', type: 'success' })
                }
            },
            (err) => {
                console.log('Location fallback to city center:', err)
                const cityCenter = CITY_COORDINATES[form.city] || CITY_COORDINATES['Indore']
                setUserCoords({ lat: cityCenter.lat, lng: cityCenter.lng })
                setUserLocationLabel(`${cityCenter.label}`)
                setIsLocating(false)
            },
            { timeout: 6000, enableHighAccuracy: true }
        )
    }

    // Auto-detect when modal opens
    useEffect(() => {
        if (isOpen) {
            detectUserLocation(false)
        }
    }, [isOpen])

    // Close custom dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (turfDropdownRef.current && !turfDropdownRef.current.contains(e.target)) {
                setIsTurfDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Pre-populate if opened from a specific Turf Detail page
    useEffect(() => {
        if (isOpen) {
            if (preselectedTurf) {
                const turfLabel = typeof preselectedTurf === 'string'
                    ? preselectedTurf
                    : `${preselectedTurf.name || 'Turf Arena'} (${preselectedTurf.location || preselectedTurf.city || 'Indore'})`
                const turfCity = preselectedTurf.city || preselectedCity || 'Indore'
                setForm(prev => ({
                    ...prev,
                    city: turfCity,
                    preferredTurf: turfLabel
                }))
                setIsCustomTurf(false)
                setCustomTurfName('')
            } else if (preselectedCity) {
                const matchedTurf = DETAILED_TURFS.find(t => t.city.toLowerCase() === preselectedCity.toLowerCase())
                const defaultLabel = matchedTurf ? `${matchedTurf.name} (${matchedTurf.location})` : 'Champion Turf Ground (Palasia, Indore)'
                setForm(prev => ({
                    ...prev,
                    city: preselectedCity,
                    preferredTurf: defaultLabel
                }))
            }
        }
    }, [isOpen, preselectedTurf, preselectedCity])

    const handleEventTypeChange = (newType) => {
        const config = EVENT_CONFIG[newType] || EVENT_CONFIG['Corporate Tournament']
        setIsCustomBudget(false)
        setCustomBudget('')
        setForm(prev => ({
            ...prev,
            eventType: newType,
            budget: config.defaultBudget,
            timeSlot: config.defaultTimeSlot,
            estimatedPlayers: isCustomPlayerCount ? prev.estimatedPlayers : config.defaultPlayers
        }))
    }

    const currentBudgets = EVENT_CONFIG[form.eventType]?.budgets || EVENT_CONFIG['Corporate Tournament'].budgets

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.companyName?.trim() || !form.phone?.trim()) {
            if (addToast) addToast({ message: 'Please provide Company Name and Mobile Number', type: 'warning' })
            return
        }

        setIsSubmitting(true)
        const finalPlayerCount = isCustomPlayerCount ? (customPlayerCount || 'Custom Count') : form.estimatedPlayers
        const finalBudget = isCustomBudget ? (customBudget || 'Custom Budget') : form.budget
        const finalTurf = isCustomTurf ? (customTurfName || 'Custom Turf Arena') : form.preferredTurf
        const finalPayload = { 
            ...form, 
            preferredTurf: finalTurf,
            estimatedPlayers: finalPlayerCount, 
            budget: finalBudget,
            paymentMode: form.paymentMode || 'GST_INVOICE'
        }

        try {
            const res = await submitCorporateProposal(finalPayload)
            setSubmittedId(res.data.id)
            setSubmitted(true)
            if (addToast) addToast({ message: 'Corporate Inquiry submitted! Stored in database successfully.', type: 'success' })
        } catch (err) {
            console.error('Corporate proposal error:', err)
            if (addToast) addToast({ message: err.message || 'Failed to submit your proposal. Please try again.', type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetAndClose = () => {
        setSubmitted(false)
        setSubmittedId(null)
        setIsSubmitting(false)
        setIsCustomPlayerCount(false)
        setCustomPlayerCount('')
        setIsCustomBudget(false)
        setCustomBudget('')
        setIsCustomTurf(false)
        setCustomTurfName('')
        setForm({
            companyName: '',
            contactPerson: '',
            phone: '',
            email: '',
            eventType: 'Corporate Tournament',
            city: 'Indore',
            preferredTurf: 'Champion Turf Ground (Palasia, Indore)',
            estimatedPlayers: '40-50 Players',
            budget: '₹60,000 - ₹1,20,000',
            eventDate: '',
            timeSlot: '🏆 Full Day Arena Booking (08:00 AM - 08:00 PM)',
            paymentMode: 'GST_INVOICE'
        })
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} title="🏢 Corporate & Bulk Turf Booking Proposal">
            {submitted ? (
                <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 border-4 border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-3xl animate-bounce">
                        ✓
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Proposal Request Received!</h3>
                    {submittedId && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-emerald-400 font-mono text-[11px] font-bold">
                            <span>REF:</span>
                            <span className="text-white">{submittedId}</span>
                        </div>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                        Thank you, <strong>{form.contactPerson || form.companyName}</strong>! Our Corporate Event Manager will reach out to <strong>{form.phone}</strong> with custom pricing, GST tax invoices, and food/trophy packages within 2 hours.
                    </p>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-1.5 text-left max-w-sm mx-auto">
                        <div className="font-bold flex items-center gap-1.5">
                            <HiCheckCircle className="text-emerald-600 text-base" /> Dedicated Event Coordinator Assigned
                        </div>
                        <div className="font-bold flex items-center gap-1.5">
                            <HiCheckCircle className="text-emerald-600 text-base" /> 100% Tax Deductible GST Invoice Included
                        </div>
                        <div className="font-bold flex items-center gap-1.5">
                            <HiCheckCircle className="text-emerald-600 text-base" /> Complimentary Digital Scoring & Umpires
                        </div>
                    </div>
                    <Button onClick={resetAndClose} className="bg-slate-900 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl">
                        Close & Return to Website
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-slate-800 text-xs">
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Planning a company tournament, team outing, or employee league? Fill out your details below to receive a custom quote with <strong>GST Invoices & Full Event Management</strong>.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Company / Organization Name *</label>
                            <Input
                                placeholder="e.g. TCS / Infosys / Tech Hub"
                                value={form.companyName}
                                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Contact Person Name</label>
                            <Input
                                placeholder="e.g. Rahul Sharma (HR Manager)"
                                value={form.contactPerson}
                                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Mobile Number *</label>
                            <Input
                                placeholder="e.g. +91 98765 43210"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Official Email ID</label>
                            <Input
                                type="email"
                                placeholder="e.g. hr@company.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Event Type</label>
                            <Select
                                value={form.eventType}
                                onChange={(e) => handleEventTypeChange(e.target.value)}
                            >
                                <option value="Corporate Tournament">Corporate Tournament</option>
                                <option value="Employee Weekend Match">Employee Weekend Match</option>
                                <option value="Monthly Bulk Arena Booking">Monthly Bulk Arena Booking</option>
                                <option value="Annual Sports Day">Annual Sports Day</option>
                            </Select>
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Estimated Players</label>
                            <Select
                                value={isCustomPlayerCount ? 'CUSTOM' : form.estimatedPlayers}
                                onChange={(e) => {
                                    if (e.target.value === 'CUSTOM') {
                                        setIsCustomPlayerCount(true)
                                    } else {
                                        setIsCustomPlayerCount(false)
                                        setForm({ ...form, estimatedPlayers: e.target.value })
                                    }
                                }}
                            >
                                <option value="10-20 Players">10-20 Players</option>
                                <option value="20-30 Players">20-30 Players</option>
                                <option value="30-40 Players">30-40 Players</option>
                                <option value="40-50 Players">40-50 Players</option>
                                <option value="100+ Players (Full Arena Booking)">100+ Players (Full Arena Booking)</option>
                                <option value="CUSTOM">✏️ Custom / Type Manually...</option>
                            </Select>

                            {/* Manual Custom Input Field */}
                            {isCustomPlayerCount && (
                                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <Input
                                        placeholder="Enter exact count (e.g. 35 Players, 150 Guests)"
                                        value={customPlayerCount}
                                        onChange={(e) => setCustomPlayerCount(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Preferred City / Region</label>
                            <Select
                                value={form.city}
                                onChange={(e) => {
                                    const newCity = e.target.value
                                    setIsCustomTurf(false)
                                    setCustomTurfName('')
                                    if (newCity === 'ALL') {
                                        setForm({ 
                                            ...form, 
                                            city: 'ALL',
                                            preferredTurf: '🏟️ Any Top Recommended Arena (Platform Best Match)'
                                        })
                                    } else {
                                        const matched = DETAILED_TURFS.find(t => t.city.toLowerCase() === newCity.toLowerCase())
                                        const defaultLabel = matched ? `${matched.name} (${matched.location})` : 'Champion Turf Ground (Palasia, Indore)'
                                        setForm({ 
                                            ...form, 
                                            city: newCity,
                                            preferredTurf: defaultLabel
                                        })
                                    }
                                }}
                            >
                                <option value="Indore">Indore (Madhya Pradesh)</option>
                                <option value="Mumbai">Mumbai (Maharashtra)</option>
                                <option value="Bangalore">Bangalore (Karnataka)</option>
                                <option value="Delhi">Delhi / NCR</option>
                                <option value="Pune">Pune (Maharashtra)</option>
                                <option value="ALL">🌐 All Cities (Show All Registered Turfs)</option>
                            </Select>
                        </div>

                        {/* Custom Searchable List Dropdown for Turf Selection */}
                        <div className="relative" ref={turfDropdownRef}>
                            <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                                <span>🏟️ Preferred Turf Arena / Ground</span>
                                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Interactive List</span>
                            </label>

                            {/* Trigger Button */}
                            <button
                                type="button"
                                onClick={() => setIsTurfDropdownOpen(prev => !prev)}
                                className="w-full h-[38px] px-3 bg-white hover:bg-slate-50/80 border border-slate-300 hover:border-emerald-500 rounded-xl flex items-center justify-between text-left transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <div className="flex items-center gap-2 min-w-0 pr-1">
                                    <span className="text-sm shrink-0">🏟️</span>
                                    <span className="font-bold text-xs text-slate-800 truncate block">
                                        {isCustomTurf ? (customTurfName ? `✏️ ${customTurfName}` : '✏️ Custom Ground / Enter Name') : (form.preferredTurf || 'Select Preferred Arena')}
                                    </span>
                                </div>
                                <HiChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isTurfDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                            </button>

                            {/* Custom List Dropdown Popover */}
                            {isTurfDropdownOpen && (
                                <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-emerald-500 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-50 p-2 max-h-72 overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-150">
                                    {/* Sticky Search Filter */}
                                    <div className="sticky top-0 bg-white pb-1.5 z-10">
                                        <div className="relative">
                                            <HiSearch className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                placeholder="Search arena, area, landmark..."
                                                value={turfSearchTerm}
                                                onChange={(e) => setTurfSearchTerm(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full pl-8 pr-2.5 py-1.5 text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    {/* Recommended Top Choice Option */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCustomTurf(false)
                                            setForm({ ...form, preferredTurf: `🏟️ Any Top Recommended Arena (${form.city === 'ALL' ? 'Best Match' : form.city})` })
                                            setIsTurfDropdownOpen(false)
                                            setTurfSearchTerm('')
                                        }}
                                        className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer border ${
                                            !isCustomTurf && form.preferredTurf?.includes('Any Top Recommended')
                                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-black'
                                                : 'bg-amber-50/50 hover:bg-amber-100/70 border-amber-200 text-amber-950'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">⭐</span>
                                            <div>
                                                <div className="text-xs font-black">Any Top Recommended Arena (Platform Best Match)</div>
                                                <div className="text-[10px] text-amber-700 font-semibold">SportMatrix will match highest-rated turf in your area</div>
                                            </div>
                                        </div>
                                        {!isCustomTurf && form.preferredTurf?.includes('Any Top Recommended') && (
                                            <HiCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                        )}
                                    </button>

                                    {/* Nearest Location Header & GPS Action */}
                                    <div className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-50/90 rounded-xl border border-emerald-200 text-[11px] mb-1">
                                        <div className="flex items-center gap-1.5 text-emerald-950 font-bold min-w-0 pr-1">
                                            <HiLocationMarker className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-bounce" />
                                            <span className="truncate">
                                                Sorted by Nearest: <strong className="text-emerald-700">{userLocationLabel || form.city}</strong>
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => detectUserLocation(true)}
                                            disabled={isLocating}
                                            className="text-[10px] font-black text-emerald-800 bg-white hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300 shadow-xs cursor-pointer shrink-0 transition-colors"
                                        >
                                            {isLocating ? 'Locating...' : '📍 Refresh GPS'}
                                        </button>
                                    </div>

                                    {/* Filtered Turfs in Clean List Form (Sorted by Nearest First) */}
                                    <div className="space-y-1 pt-1">
                                        {(() => {
                                            const activeCityCoords = userCoords || CITY_COORDINATES[form.city] || CITY_COORDINATES['Indore']
                                            
                                            let availableTurfs = form.city === 'ALL'
                                                ? DETAILED_TURFS
                                                : DETAILED_TURFS.filter(t => t.city.toLowerCase() === form.city.toLowerCase())

                                            // Calculate live distance in km
                                            availableTurfs = availableTurfs.map(turf => {
                                                const dist = activeCityCoords ? calculateDistanceKm(activeCityCoords.lat, activeCityCoords.lng, turf.lat, turf.lng) : null
                                                return { ...turf, distance: dist }
                                            })

                                            // Sort nearest first (ascending distance)
                                            availableTurfs.sort((a, b) => {
                                                if (a.distance == null) return 1
                                                if (b.distance == null) return -1
                                                return a.distance - b.distance
                                            })

                                            const filteredTurfs = availableTurfs.filter(t =>
                                                t.name.toLowerCase().includes(turfSearchTerm.toLowerCase()) ||
                                                t.location.toLowerCase().includes(turfSearchTerm.toLowerCase()) ||
                                                t.city.toLowerCase().includes(turfSearchTerm.toLowerCase()) ||
                                                (t.tag && t.tag.toLowerCase().includes(turfSearchTerm.toLowerCase()))
                                            )

                                            if (filteredTurfs.length === 0) {
                                                return (
                                                    <div className="py-3 text-center text-xs text-slate-400">
                                                        No turfs found for "{turfSearchTerm}". Use custom option below!
                                                    </div>
                                                )
                                            }

                                            return filteredTurfs.map((turf, idx) => {
                                                const fullLabel = `${turf.name} (${turf.location})`
                                                const isSelected = !isCustomTurf && form.preferredTurf === fullLabel
                                                const isNearest = idx === 0 && turf.distance != null

                                                return (
                                                    <button
                                                        key={turf.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setIsCustomTurf(false)
                                                            setForm({ ...form, preferredTurf: fullLabel })
                                                            setIsTurfDropdownOpen(false)
                                                            setTurfSearchTerm('')
                                                        }}
                                                        className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer border ${
                                                            isSelected
                                                                ? 'bg-emerald-50 border-emerald-400 shadow-xs ring-1 ring-emerald-300'
                                                                : isNearest
                                                                    ? 'bg-emerald-50/40 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-300'
                                                                    : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-2.5 min-w-0 pr-1">
                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                                                                isSelected ? 'bg-emerald-500 text-white font-bold' : isNearest ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                {isNearest ? '🏆' : '🏟️'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <span className={`text-xs font-black ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                                                                        {turf.name}
                                                                    </span>
                                                                    {isNearest ? (
                                                                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-black text-[9px] shadow-xs animate-pulse">
                                                                            🟢 NEAREST ({turf.distance} km)
                                                                        </span>
                                                                    ) : turf.distance != null ? (
                                                                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold text-[9px] border border-slate-200">
                                                                            📍 {turf.distance} km
                                                                        </span>
                                                                    ) : null}
                                                                    <span className="px-1 py-0.2 rounded bg-amber-50 text-amber-700 font-bold text-[9px] border border-amber-200">
                                                                        {turf.rating}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-0.5">
                                                                    <HiLocationMarker className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                                                    <span>{turf.location}</span>
                                                                    {turf.tag && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span className="text-emerald-700 font-semibold">{turf.tag}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                                                <HiCheck className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </button>
                                                )
                                            })
                                        })()}
                                    </div>

                                    {/* Option: Other / Custom Ground */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCustomTurf(true)
                                            setIsTurfDropdownOpen(false)
                                            setTurfSearchTerm('')
                                        }}
                                        className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer border ${
                                            isCustomTurf
                                                ? 'bg-purple-50 border-purple-400 text-purple-950 font-black'
                                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">✏️</span>
                                            <div>
                                                <div className="text-xs font-bold">Other / Enter Custom Ground Name</div>
                                                <div className="text-[10px] text-slate-500">Specify any private arena or ground manually</div>
                                            </div>
                                        </div>
                                        {isCustomTurf && (
                                            <HiCheck className="w-4 h-4 text-purple-600 shrink-0" />
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Custom Turf Input Field */}
                            {isCustomTurf && (
                                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <Input
                                        placeholder="Enter Ground Name & Landmark (e.g. VIP Club Arena, Vijay Nagar)"
                                        value={customTurfName}
                                        onChange={(e) => setCustomTurfName(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preferred Date & Time Slot Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">📅 Preferred Event Date</label>
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={form.eventDate || ''}
                                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                                className="w-full h-[38px] px-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            />
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">⏰ Preferred Time Slot</label>
                            <Select
                                value={form.timeSlot || '🏆 Full Day Arena Booking (08:00 AM - 08:00 PM)'}
                                onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                            >
                                <option value="🌅 Morning Session (06:00 AM - 10:00 AM)">🌅 Morning Session (06:00 AM - 10:00 AM)</option>
                                <option value="☀️ Day Tournament (10:00 AM - 04:00 PM)">☀️ Day Tournament (10:00 AM - 04:00 PM)</option>
                                <option value="🌆 Evening Prime Match (06:00 PM - 09:00 PM)">🌆 Evening Prime Match (06:00 PM - 09:00 PM)</option>
                                <option value="🌙 Night Floodlight League (08:00 PM - 12:00 AM)">🌙 Night Floodlight League (08:00 PM - 12:00 AM)</option>
                                <option value="🏆 Full Day Arena Booking (08:00 AM - 08:00 PM)">🏆 Full Day Arena Booking (08:00 AM - 08:00 PM)</option>
                                <option value="📅 Multi-Day Corporate Championship">📅 Multi-Day Corporate Championship</option>
                                <option value="⏱️ Custom Slot / Flexible Hours">⏱️ Custom Slot / Flexible Hours</option>
                            </Select>
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">💰 Estimated Budget ({form.eventType})</label>
                            <Select
                                value={isCustomBudget ? 'CUSTOM' : (form.budget || currentBudgets[0]?.value)}
                                onChange={(e) => {
                                    if (e.target.value === 'CUSTOM') {
                                        setIsCustomBudget(true)
                                    } else {
                                        setIsCustomBudget(false)
                                        setForm({ ...form, budget: e.target.value })
                                    }
                                }}
                            >
                                {currentBudgets.map(b => (
                                    <option key={b.value} value={b.value}>{b.label}</option>
                                ))}
                                <option value="CUSTOM">✏️ Custom Budget / Type Manually...</option>
                            </Select>

                            {/* Manual Custom Budget Input Field */}
                            {isCustomBudget && (
                                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <Input
                                        placeholder="Enter custom budget (e.g. ₹45,000 or ₹2.5 Lakhs)"
                                        value={customBudget}
                                        onChange={(e) => setCustomBudget(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preferred Corporate Payment Mode */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                        <label className="font-bold text-slate-700 block mb-1.5">💳 Corporate Payment & Invoicing Terms</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { id: 'GST_INVOICE', label: 'GST Tax Invoice (30-Day PO Net Credit)', icon: '🏢' },
                                { id: 'ADVANCE_50', label: '50% Advance + 50% Post-Event', icon: '⚖️' },
                                { id: 'CORP_CARD', label: 'Corporate Card / NetBanking', icon: '💳' },
                                { id: 'UPI_GATEWAY', label: 'UPI / Company Razorpay', icon: '📱' },
                            ].map((pm) => (
                                <button
                                    key={pm.id}
                                    type="button"
                                    onClick={() => setForm({ ...form, paymentMode: pm.id })}
                                    className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                        (form.paymentMode || 'GST_INVOICE') === pm.id
                                            ? 'border-emerald-600 bg-emerald-100/60 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-sm'
                                            : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium'
                                    }`}
                                >
                                    <div className="text-base mb-1">{pm.icon}</div>
                                    <div className="text-[10.5px] leading-tight">{pm.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_22px_rgba(16,185,129,0.5)] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Submitting Proposal...</span>
                                </>
                            ) : (
                                <span>Request Custom Proposal →</span>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    )
}
