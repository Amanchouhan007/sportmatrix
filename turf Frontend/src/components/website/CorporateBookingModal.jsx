import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { useToast } from '../ui/Toast'
import { submitCorporateProposal } from '../../services/corporateService'
import { getBranches } from '../../services/branchService'
import { HiOfficeBuilding, HiPhone, HiMail, HiUser, HiCalendar, HiCheckCircle, HiLocationMarker, HiMap, HiSparkles } from 'react-icons/hi'

/* ── Haversine Distance Helper ── */
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null
    const R = 6371 // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(R * c * 10) / 10
}

// Default Indore Coordinates
const CITY_COORDS = {
    Indore: { lat: 22.7196, lng: 75.8577 },
    Mumbai: { lat: 19.0760, lng: 72.8777 },
    Bangalore: { lat: 12.9716, lng: 77.5946 },
    Delhi: { lat: 28.7041, lng: 77.1025 },
    Pune: { lat: 18.5204, lng: 73.8567 },
}

export default function CorporateBookingModal({ isOpen, onClose, preselectedTurf = null, preselectedCity = null }) {
    const { addToast } = useToast()

    const [form, setForm] = useState({
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        eventType: 'Corporate Tournament',
        city: 'Indore',
        preferredTurf: '',
        estimatedPlayers: '20-40 Players',
        eventDate: '',
        timeSlot: '🌆 Evening Prime Match (06:00 PM - 09:00 PM)',
        notes: ''
    })

    const [submitted, setSubmitted] = useState(false)
    const [submittedId, setSubmittedId] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [realTurfs, setRealTurfs] = useState([])
    const [userLocation, setUserLocation] = useState(null)
    const [isLocating, setIsLocating] = useState(false)
    const [showMap, setShowMap] = useState(false)
    const [selectedTurfData, setSelectedTurfData] = useState(null)

    // Fetch real DB turfs on open
    useEffect(() => {
        if (isOpen) {
            getBranches()
                .then(res => {
                    const list = res?.data?.branches || res?.branches || (Array.isArray(res) ? res : [])
                    if (Array.isArray(list) && list.length > 0) {
                        const formatted = list.map((b, idx) => {
                            // Default lat/lng fallback around city center if missing
                            const baseCoords = CITY_COORDS[b.city || 'Indore'] || CITY_COORDS.Indore
                            const lat = b.latitude ? Number(b.latitude) : baseCoords.lat + (idx * 0.012 - 0.02)
                            const lng = b.longitude ? Number(b.longitude) : baseCoords.lng + (idx * 0.015 - 0.02)

                            return {
                                id: b.id,
                                name: b.branchName || b.name || 'Turf Arena',
                                location: b.fullAddress || b.location || b.city || 'Indore',
                                city: b.city || 'Indore',
                                rating: b.rating || '4.8',
                                price: b.hourlyRate || b.pricePerHour || 1200,
                                lat,
                                lng
                            }
                        })
                        setRealTurfs(formatted)
                    }
                })
                .catch(() => {})
        }
    }, [isOpen])

    // Pre-populate if opened from a specific Turf Detail / Booking page
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
                if (typeof preselectedTurf === 'object') {
                    setSelectedTurfData(preselectedTurf)
                }
            } else if (preselectedCity) {
                setForm(prev => ({
                    ...prev,
                    city: preselectedCity
                }))
            }
        }
    }, [isOpen, preselectedTurf, preselectedCity])

    // GPS Geolocation Handler to calculate closest turfs
    const handleFindNearbyTurfs = () => {
        if (!navigator.geolocation) {
            if (addToast) addToast({ message: 'GPS location is not supported by your browser.', type: 'warning' })
            return
        }

        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const uLat = pos.coords.latitude
                const uLng = pos.coords.longitude
                setUserLocation({ lat: uLat, lng: uLng })

                // Calculate distance for all turfs and sort closest first
                const sorted = [...realTurfs].map(t => {
                    const dist = calculateDistance(uLat, uLng, t.lat, t.lng)
                    return { ...t, distance: dist !== null ? dist : 1.5 }
                }).sort((a, b) => (a.distance || 999) - (b.distance || 999))

                setRealTurfs(sorted)
                setIsLocating(false)

                if (sorted.length > 0) {
                    const closest = sorted[0]
                    const turfLabel = `${closest.name} (${closest.location})`
                    setForm(prev => ({ ...prev, preferredTurf: turfLabel }))
                    setSelectedTurfData(closest)
                    if (addToast) addToast({ message: `📍 Found ${sorted.length} nearby turfs! Auto-selected closest: ${closest.name} (${closest.distance} km away)`, type: 'success' })
                }
            },
            (err) => {
                console.warn('Geolocation error:', err.message)
                setIsLocating(false)
                if (addToast) addToast({ message: 'Could not fetch GPS location. Displaying all city turfs.', type: 'info' })
            },
            { timeout: 8000 }
        )
    }

    const handleSelectTurfOption = (val) => {
        setForm({ ...form, preferredTurf: val })
        const matched = realTurfs.find(t => `${t.name} (${t.location})` === val)
        if (matched) setSelectedTurfData(matched)
        else setSelectedTurfData(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.companyName?.trim() || !form.phone?.trim()) {
            if (addToast) addToast({ message: 'Please provide Company / Group Name and Mobile Number', type: 'warning' })
            return
        }

        setIsSubmitting(true)

        const finalPayload = {
            ...form,
            preferredTurf: form.preferredTurf || 'Any Recommended Turf',
            notes: `[Corporate Proposal] ${form.eventType} | Players: ${form.estimatedPlayers} | Slot: ${form.timeSlot} | Date: ${form.eventDate || 'Flexible'} | Notes: ${form.notes || 'None'}`
        }

        try {
            const res = await submitCorporateProposal(finalPayload)
            setSubmittedId(res?.data?.id || `CORP-${Math.floor(100000 + Math.random() * 900000)}`)
            setSubmitted(true)
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('corporate_proposal_created', { detail: res?.data || res }))
            }
            if (addToast) addToast({ message: 'Corporate proposal request submitted! Sent to support@kiaantechnology.com', type: 'success' })
        } catch (err) {
            console.error('Corporate proposal error:', err)
            if (addToast) addToast({ message: err.message || 'Failed to submit proposal. Please try again.', type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetAndClose = () => {
        setSubmitted(false)
        setSubmittedId(null)
        setIsSubmitting(false)
        setShowMap(false)
        setSelectedTurfData(null)
        setForm({
            companyName: '',
            contactPerson: '',
            phone: '',
            email: '',
            eventType: 'Corporate Tournament',
            city: 'Indore',
            preferredTurf: '',
            estimatedPlayers: '20-40 Players',
            eventDate: '',
            timeSlot: '🌆 Evening Prime Match (06:00 PM - 09:00 PM)',
            notes: ''
        })
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} title="🏢 Corporate & Bulk Turf Booking Proposal" size="xl">
            {submitted ? (
                <div className="text-center py-8 space-y-5">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 border-4 border-emerald-200 rounded-full flex items-center justify-center mx-auto text-white text-4xl shadow-xl animate-bounce">
                        ✓
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Proposal Request Submitted!</h3>
                        <p className="text-xs text-slate-500 mt-1">Our Event Manager is working on your GST proposal.</p>
                    </div>

                    {submittedId && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950 text-emerald-400 font-mono text-xs font-black shadow-md border border-emerald-500/30">
                            <span className="text-slate-400 uppercase tracking-wider text-[10px]">TICKET ID:</span>
                            <span>{submittedId}</span>
                        </div>
                    )}

                    <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                        Thank you, <strong>{form.contactPerson || form.companyName}</strong>! Details have been dispatched to <strong>support@kiaantechnology.com</strong>. Our Event Manager will contact <strong>{form.phone}</strong> with custom GST pricing within 2 hours.
                    </p>

                    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/50 rounded-2xl p-4 text-xs text-slate-200 space-y-2.5 text-left max-w-md mx-auto font-semibold shadow-xl">
                        <div className="flex items-center gap-2.5">
                            <HiCheckCircle className="text-[#C8FF2E] text-lg shrink-0" />
                            <span>100% Tax Deductible GST Invoice Included</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <HiCheckCircle className="text-[#C8FF2E] text-lg shrink-0" />
                            <span>Weekly / Recurring Booking Discounts Applied</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <HiCheckCircle className="text-[#C8FF2E] text-lg shrink-0" />
                            <span>Dedicated Certified Umpires & Live Scorecard Console</span>
                        </div>
                    </div>

                    <Button onClick={resetAndClose} className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white font-black text-xs px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition-all">
                        Close & Continue
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-slate-800 text-xs">
                    {/* Header Banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-4 border border-emerald-500/30 text-white shadow-md">
                        <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#C8FF2E] text-[10px] font-black uppercase tracking-wider border border-emerald-500/40">
                                        🏢 Corporate Special
                                    </span>
                                    <span className="text-slate-400 text-[11px]">• GST Invoices Available</span>
                                </div>
                                <h4 className="text-sm font-black text-white mt-1">Get Custom GST Quote & Recurring Discounts</h4>
                            </div>
                            <div className="flex items-center gap-2 text-[10.5px] font-bold text-slate-300">
                                <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/10">📜 100% Tax Deductible</span>
                                <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/10">🏆 Pro Umpires</span>
                            </div>
                        </div>
                    </div>

                    {/* Company & Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Company / Group Name *</label>
                            <Input
                                placeholder="e.g. TCS / Tech Hub / City Strikers"
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

                    {/* Requirement & Players */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Event / Requirement Type</label>
                            <Select
                                value={form.eventType}
                                onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                            >
                                <option value="Corporate Tournament">🏢 Corporate Tournament / Sports Day</option>
                                <option value="Weekly Recurring Match">⚡ Weekly / Recurring Team Matches (Discounted)</option>
                                <option value="Employee Team Outing">🌆 Employee Team Outing / Friendly Match</option>
                                <option value="Full Day Arena Booking">🏆 Full Arena Day Takeover</option>
                            </Select>
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Estimated Players / Attendees</label>
                            <Select
                                value={form.estimatedPlayers}
                                onChange={(e) => setForm({ ...form, estimatedPlayers: e.target.value })}
                            >
                                <option value="10-20 Players">10-20 Players</option>
                                <option value="20-40 Players">20-40 Players</option>
                                <option value="40-80 Players">40-80 Players</option>
                                <option value="80+ Players (Full Arena)">80+ Players (Full Arena)</option>
                            </Select>
                        </div>
                    </div>

                    {/* 📍 Venue Selection with Nearby GPS Finder & Interactive Map Preview */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <label className="font-black text-slate-900 flex items-center gap-1.5">
                                <HiLocationMarker className="text-emerald-600 text-base" />
                                <span>Preferred Turf Ground & Proximity Selector</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleFindNearbyTurfs}
                                    disabled={isLocating}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isLocating ? (
                                        <>
                                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Locating GPS...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>📍 Find Nearby Turfs (GPS)</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowMap(!showMap)}
                                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                                >
                                    <HiMap className="text-emerald-400" />
                                    <span>{showMap ? 'Hide Map' : '🗺️ Map View'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">City / Region</label>
                                <Select
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                >
                                    <option value="Indore">Indore (Madhya Pradesh)</option>
                                    <option value="Mumbai">Mumbai (Maharashtra)</option>
                                    <option value="Bangalore">Bangalore (Karnataka)</option>
                                    <option value="Delhi">Delhi / NCR</option>
                                    <option value="Pune">Pune (Maharashtra)</option>
                                </Select>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Select Turf Ground</label>
                                <Select
                                    value={form.preferredTurf}
                                    onChange={(e) => handleSelectTurfOption(e.target.value)}
                                >
                                    <option value="">⭐ Any Recommended Turf in City</option>
                                    {realTurfs.map(t => (
                                        <option key={t.id} value={`${t.name} (${t.location})`}>
                                            🏟️ {t.name} ({t.location}) {t.distance !== undefined ? `— 📍 ${t.distance} km away` : ''}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {/* Interactive Nearby Map Preview Panel (Styled to Match Site Emerald Theme) */}
                        {showMap && (
                            <div className="rounded-2xl border-2 border-emerald-300/80 overflow-hidden bg-gradient-to-br from-emerald-50/90 via-white to-green-50/70 text-slate-900 p-3.5 space-y-2.5 shadow-sm animate-in fade-in duration-200">
                                <div className="flex items-center justify-between text-[11px] font-black text-slate-900 border-b border-emerald-200/80 pb-2">
                                    <span className="flex items-center gap-1.5 text-emerald-900">
                                        <HiMap className="text-emerald-600 text-sm" /> 🗺️ Interactive City Venues Map
                                    </span>
                                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-emerald-200">
                                        {realTurfs.length} Recommended Turf Grounds
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto pt-1">
                                    {realTurfs.map((t) => {
                                        const isSelected = form.preferredTurf === `${t.name} (${t.location})`
                                        return (
                                            <div
                                                key={t.id}
                                                onClick={() => handleSelectTurfOption(`${t.name} (${t.location})`)}
                                                className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 shadow-xs ${
                                                    isSelected
                                                        ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 border-emerald-400 text-white shadow-md ring-2 ring-emerald-500/20 scale-[1.02]'
                                                        : 'bg-white border-slate-200/90 hover:border-emerald-500 hover:shadow-md text-slate-900'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`font-black text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>{t.name}</span>
                                                    {isSelected && (
                                                        <span className="text-[9.5px] font-black bg-slate-950 text-[#C8FF2E] px-1.5 py-0.5 rounded-md border border-[#C8FF2E]/40 shrink-0">
                                                            ✓ Selected
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`text-[10.5px] truncate font-medium ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>📍 {t.location}</div>
                                                <div className={`flex items-center justify-between mt-2 pt-1.5 border-t text-[10px] ${isSelected ? 'border-emerald-500/50' : 'border-slate-100'}`}>
                                                    <span className={`font-black flex items-center gap-0.5 ${isSelected ? 'text-amber-300' : 'text-amber-500'}`}>⭐ {t.rating}</span>
                                                    <span className={`font-black px-2 py-0.5 rounded-full text-[9.5px] ${
                                                        isSelected 
                                                            ? 'bg-emerald-950 text-[#C8FF2E] border border-[#C8FF2E]/40' 
                                                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                    }`}>
                                                        {t.distance !== undefined ? `📍 ${t.distance} km` : 'Near City'}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Selected Turf Highlight Card */}
                        {selectedTurfData && (
                            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white border-2 border-emerald-500/50 flex items-center justify-between gap-3 shadow-md">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-[#C8FF2E] flex items-center justify-center text-xl shrink-0 border border-emerald-400/40 shadow-inner">
                                        🏟️
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-black text-xs text-[#C8FF2E] truncate">{selectedTurfData.name}</div>
                                        <div className="text-[11px] text-slate-300 font-medium truncate">📍 {selectedTurfData.location}</div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-[9.5px] uppercase font-black tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/40 inline-block shadow-xs">
                                        Selected Venue
                                    </span>
                                    {selectedTurfData.distance !== undefined && (
                                        <span className="text-[11px] font-black text-[#C8FF2E] mt-1 block">
                                            📍 {selectedTurfData.distance} km away
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preferred Date & Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">📅 Preferred Date</label>
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={form.eventDate}
                                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                                className="w-full h-[38px] px-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            />
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">⏰ Preferred Time Slot</label>
                            <Select
                                value={form.timeSlot}
                                onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                            >
                                <option value="🌅 Morning Session (06:00 AM - 10:00 AM)">🌅 Morning Session (06:00 AM - 10:00 AM)</option>
                                <option value="☀️ Day Tournament (10:00 AM - 04:00 PM)">☀️ Day Tournament (10:00 AM - 04:00 PM)</option>
                                <option value="🌆 Evening Prime Match (06:00 PM - 09:00 PM)">🌆 Evening Prime Match (06:00 PM - 09:00 PM)</option>
                                <option value="🌙 Night Floodlight League (08:00 PM - 12:00 AM)">🌙 Night Floodlight League (08:00 PM - 12:00 AM)</option>
                                <option value="🏆 Full Day Arena Booking (08:00 AM - 08:00 PM)">🏆 Full Day Arena Booking (08:00 AM - 08:00 PM)</option>
                            </Select>
                        </div>
                    </div>

                    {/* Special Notes / Requirement Details */}
                    <div>
                        <label className="font-bold text-slate-700 block mb-1">📝 Special Notes & Requirement Details</label>
                        <textarea
                            rows={2}
                            placeholder="e.g. Need GST tax invoice, looking for weekly recurring match discount, need certified umpires..."
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-medium outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 focus:bg-white transition-all"
                        />
                    </div>

                    {/* Submit Actions */}
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
                            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.4)] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Submitting Proposal...</span>
                                </>
                            ) : (
                                <span>Request Proposal →</span>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    )
}

