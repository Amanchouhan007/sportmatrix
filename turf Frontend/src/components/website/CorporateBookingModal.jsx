import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { useToast } from '../ui/Toast'
import { HiOfficeBuilding, HiPhone, HiMail, HiUser, HiCalendar, HiCurrencyRupee, HiCheckCircle } from 'react-icons/hi'

export default function CorporateBookingModal({ isOpen, onClose }) {
    const { addToast } = useToast()
    const [form, setForm] = useState({
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        eventType: 'Corporate Tournament',
        city: 'Indore',
        estimatedPlayers: '10-20 Players',
        budget: '₹25,000 - ₹50,000',
        eventDate: ''
    })
    const [submitted, setSubmitted] = useState(false)
    const [isCustomPlayerCount, setIsCustomPlayerCount] = useState(false)
    const [customPlayerCount, setCustomPlayerCount] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.companyName || !form.phone) {
            if (addToast) addToast({ message: 'Please provide Company Name and Mobile Number', type: 'warning' })
            return
        }

        const finalPlayerCount = isCustomPlayerCount ? (customPlayerCount || 'Custom Count') : form.estimatedPlayers
        const finalPayload = { ...form, estimatedPlayers: finalPlayerCount }

        // Save lead in localStorage for demo
        try {
            const existing = JSON.parse(localStorage.getItem('corporate_leads') || '[]')
            existing.push({ ...finalPayload, id: `CORP-${Date.now()}`, createdAt: new Date().toISOString() })
            localStorage.setItem('corporate_leads', JSON.stringify(existing))
        } catch (err) {
            console.error(err)
        }

        setSubmitted(true)
        if (addToast) addToast({ message: 'Corporate Inquiry submitted! Our event manager will contact you within 2 hours.', type: 'success' })
    }

    const resetAndClose = () => {
        setSubmitted(false)
        setIsCustomPlayerCount(false)
        setCustomPlayerCount('')
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} title="🏢 Corporate & Bulk Turf Hire Proposal">
            {submitted ? (
                <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 border-4 border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-3xl animate-bounce">
                        ✓
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Proposal Request Received!</h3>
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Event Type</label>
                            <Select
                                value={form.eventType}
                                onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                            >
                                <option value="Corporate Tournament">Corporate Tournament</option>
                                <option value="Employee Weekend Match">Employee Weekend Match</option>
                                <option value="Monthly Bulk Arena Booking">Monthly Bulk Arena Booking</option>
                                <option value="Annual Sports Day">Annual Sports Day</option>
                            </Select>
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Preferred City</label>
                            <Select
                                value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                            >
                                <option value="Indore">Indore</option>
                                <option value="Mumbai">Mumbai</option>
                                <option value="Bangalore">Bangalore</option>
                                <option value="Delhi">Delhi</option>
                                <option value="Pune">Pune</option>
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
                                <option value="100+ Players (Full Arena Hire)">100+ Players (Full Arena Hire)</option>
                                <option value="Number of Players">Number of Players</option>
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
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_22px_rgba(16,185,129,0.5)] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95"
                        >
                            Request Custom Proposal →
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    )
}
