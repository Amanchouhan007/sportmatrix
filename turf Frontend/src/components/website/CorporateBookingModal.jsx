import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { useToast } from '../ui/Toast'
import { submitCorporateProposal } from '../../services/corporateService'
import { getBranches } from '../../services/branchService'
import { HiOfficeBuilding, HiPhone, HiMail, HiUser, HiCalendar, HiCheckCircle, HiLocationMarker } from 'react-icons/hi'

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

    // Fetch real DB turfs on open
    useEffect(() => {
        if (isOpen) {
            getBranches()
                .then(res => {
                    const list = res?.data?.branches || res?.branches || (Array.isArray(res) ? res : [])
                    if (Array.isArray(list) && list.length > 0) {
                        const formatted = list.map(b => ({
                            id: b.id,
                            name: b.branchName || b.name || 'Turf Arena',
                            location: b.fullAddress || b.location || b.city || 'Indore',
                            city: b.city || 'Indore'
                        }))
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
            } else if (preselectedCity) {
                setForm(prev => ({
                    ...prev,
                    city: preselectedCity
                }))
            }
        }
    }, [isOpen, preselectedTurf, preselectedCity])

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
        <Modal isOpen={isOpen} onClose={resetAndClose} title="🏢 Corporate & Bulk Turf Booking Proposal" size="lg">
            {submitted ? (
                <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 border-4 border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-3xl animate-bounce">
                        ✓
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Proposal Request Submitted!</h3>
                    {submittedId && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-emerald-400 font-mono text-[11px] font-bold">
                            <span>REF ID:</span>
                            <span className="text-white">{submittedId}</span>
                        </div>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                        Thank you, <strong>{form.contactPerson || form.companyName}</strong>! Details have been sent to <strong>support@kiaantechnology.com</strong>. Our Event Manager will contact <strong>{form.phone}</strong> with custom GST pricing within 2 hours.
                    </p>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-2 text-left max-w-md mx-auto font-semibold">
                        <div className="flex items-center gap-2">
                            <HiCheckCircle className="text-emerald-600 text-base shrink-0" />
                            <span>100% Tax Deductible GST Invoice Included</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <HiCheckCircle className="text-emerald-600 text-base shrink-0" />
                            <span>Weekly / Recurring Booking Discounts Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <HiCheckCircle className="text-emerald-600 text-base shrink-0" />
                            <span>Dedicated Certified Umpires & Live Scorer</span>
                        </div>
                    </div>

                    <Button onClick={resetAndClose} className="bg-slate-900 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl">
                        Close & Continue
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-slate-800 text-xs">
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Planning a company tournament, weekly team match, or corporate outing? Submit your details to receive custom pricing with <strong>GST Invoices & Recurring Booking Discounts</strong>.
                    </p>

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

                    {/* Venue & Location */}
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
                            <label className="font-bold text-slate-700 block mb-1">Preferred Turf Ground</label>
                            <Select
                                value={form.preferredTurf}
                                onChange={(e) => setForm({ ...form, preferredTurf: e.target.value })}
                            >
                                <option value="">⭐ Any Recommended Turf in City</option>
                                {realTurfs.map(t => (
                                    <option key={t.id} value={`${t.name} (${t.location})`}>
                                        🏟️ {t.name} ({t.location})
                                    </option>
                                ))}
                            </Select>
                        </div>
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
