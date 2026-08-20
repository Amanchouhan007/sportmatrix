import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useToast } from '../ui/Toast'
import { saveCorporateQuote } from '../../services/corporateService'
import { 
    HiOfficeBuilding, 
    HiPhone, 
    HiMail, 
    HiCalendar, 
    HiCurrencyRupee, 
    HiCheckCircle, 
    HiClock, 
    HiTag, 
    HiSparkles,
    HiShieldCheck,
    HiDocumentDownload,
    HiLocationMarker
} from 'react-icons/hi'

const AVAILABLE_ADDONS = [
    { id: 'umpire', label: 'Official BCCI / State Certified Umpires (x2)', price: 3000 },
    { id: 'floodlights', label: 'Pro LED Floodlights (Evening / Night Slots)', price: 2500 },
    { id: 'live_stream', label: 'HD Live Multi-Cam Stream with Commentary & Replays', price: 6000 },
    { id: 'hydration', label: 'Unlimited Hydration & Energy Drinks Station', price: 4000 },
    { id: 'trophy', label: 'Championship Trophies, Medals & Best Player Awards', price: 5000 },
    { id: 'dj_sound', label: 'DJ Sound System & Live Announcer', price: 4500 },
    { id: 'balls_gear', label: 'Pro Leather & Tennis Match Balls + Extra Batting Gear', price: 2000 }
]

export default function CorporateQuoteModal({ isOpen, onClose, lead, onQuoteSent }) {
    const { addToast } = useToast()
    const [basePrice, setBasePrice] = useState(75000)
    const [discount, setDiscount] = useState(5000)
    const [includeGst, setIncludeGst] = useState(true)
    const [selectedAddons, setSelectedAddons] = useState(['umpire', 'floodlights', 'trophy', 'hydration'])
    const [advancePercent, setAdvancePercent] = useState(50)
    const [adminNotes, setAdminNotes] = useState('Official quotation valid for 7 days. Includes dedicated event pitch manager, GST tax invoice, and scoreboard coordinator.')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [quoteSuccess, setQuoteSuccess] = useState(false)
    const [generatedQuoteSummary, setGeneratedQuoteSummary] = useState(null)

    useEffect(() => {
        if (lead) {
            setQuoteSuccess(false)
            setGeneratedQuoteSummary(null)

            // Pre-seed pricing based on budget if available
            let suggestedBase = 75000
            if (lead.budget) {
                if (lead.budget.includes('35,000')) suggestedBase = 45000
                else if (lead.budget.includes('60,000')) suggestedBase = 75000
                else if (lead.budget.includes('1,20,000')) suggestedBase = 150000
                else if (lead.budget.includes('2,50,000')) suggestedBase = 280000
                else if (lead.budget.includes('4,500')) suggestedBase = 9000
                else if (lead.budget.includes('20,000')) suggestedBase = 35000
            }
            setBasePrice(suggestedBase)
            setDiscount(Math.round(suggestedBase * 0.05))
        }
    }, [lead])

    if (!lead) return null

    // Calculations
    const addonsTotal = selectedAddons.reduce((sum, addId) => {
        const addon = AVAILABLE_ADDONS.find(a => a.id === addId)
        return sum + (addon ? addon.price : 0)
    }, 0)

    const subtotal = Math.max(0, basePrice - discount + addonsTotal)
    const gstAmount = includeGst ? Math.round(subtotal * 0.18) : 0
    const finalTotal = subtotal + gstAmount
    const advanceAmount = Math.round((finalTotal * advancePercent) / 100)

    const toggleAddon = (addonId) => {
        setSelectedAddons(prev => 
            prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
        )
    }

    const handleSendQuote = async (statusOverride = 'QUOTE_SENT') => {
        setIsSubmitting(true)
        const quotePayload = {
            quotedPrice: finalTotal,
            basePrice,
            discountAmount: discount,
            addonsTotal,
            gstAmount,
            finalTotal,
            depositRequired: advanceAmount,
            addons: selectedAddons.map(id => AVAILABLE_ADDONS.find(a => a.id === id)?.label).filter(Boolean),
            adminNotes,
            status: statusOverride === 'CONFIRMED' ? 'Confirmed (₹' + finalTotal.toLocaleString('en-IN') + ')' : 'Quote Sent (₹' + finalTotal.toLocaleString('en-IN') + ')',
            leadId: lead.id,
            companyName: lead.name || lead.companyName,
            preferredTurf: lead.turfBranch || lead.preferredTurf
        }

        try {
            await saveCorporateQuote(lead.id, quotePayload)
            setGeneratedQuoteSummary(quotePayload)
            setQuoteSuccess(true)

            if (addToast) {
                addToast({ 
                    message: statusOverride === 'CONFIRMED' 
                        ? `Booking marked Confirmed for ₹${finalTotal.toLocaleString('en-IN')}!` 
                        : `Official Quote of ₹${finalTotal.toLocaleString('en-IN')} sent to ${lead.name || 'Corporate'}!`, 
                    type: 'success' 
                })
            }

            if (onQuoteSent) {
                onQuoteSent(quotePayload)
            }
        } catch (err) {
            console.error('Error saving quote:', err)
            if (addToast) addToast({ message: 'Saved quote locally in CRM.', type: 'info' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="💼 Set Custom Price & Send Corporate Quotation" size="xl">
            {quoteSuccess && generatedQuoteSummary ? (
                <div className="text-center py-2 space-y-3 text-slate-800 max-w-2xl mx-auto">
                    <div className="w-12 h-12 bg-emerald-100 border-4 border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-2xl animate-bounce shadow-md">
                        ✓
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Official Quotation Dispatched!</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Quotation generated for <strong>{lead.name || lead.companyName}</strong>
                        </p>
                    </div>

                    {/* Official Quotation Card Preview */}
                    <div className="bg-slate-950 text-white rounded-2xl p-4 text-left border border-slate-800 shadow-xl space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-emerald-500/20 text-[#C8FF2E]">
                                    <HiOfficeBuilding className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm text-white">{lead.name || lead.companyName}</h4>
                                    <span className="text-[10px] text-slate-400 font-mono">Arena: {lead.turfBranch || lead.preferredTurf || 'Champion Turf Ground'}</span>
                                </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#C8FF2E] font-black text-xs border border-emerald-500/30">
                                {generatedQuoteSummary.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-1">
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="text-slate-400 text-[9px] uppercase tracking-wider font-bold block">Base Rate</span>
                                <span className="font-mono font-black text-slate-100 text-xs">₹{basePrice.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="text-slate-400 text-[9px] uppercase tracking-wider font-bold block">Discount</span>
                                <span className="font-mono font-black text-rose-400 text-xs">-₹{discount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="text-slate-400 text-[9px] uppercase tracking-wider font-bold block">18% GST Tax</span>
                                <span className="font-mono font-black text-amber-300 text-xs">+₹{gstAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="text-slate-400 text-[9px] uppercase tracking-wider font-bold block">50% Advance</span>
                                <span className="font-mono font-black text-[#C8FF2E] text-xs">₹{advanceAmount.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                            <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">Total Quoted Package</span>
                            <span className="text-xl font-black text-[#C8FF2E] font-mono">₹{finalTotal.toLocaleString('en-IN')}</span>
                        </div>

                        {generatedQuoteSummary.addons?.length > 0 && (
                            <div className="pt-2 text-xs text-slate-400 border-t border-slate-800">
                                <span className="font-bold text-slate-300 block mb-1 text-[11px]">Included Addons ({generatedQuoteSummary.addons.length}):</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                                    {generatedQuoteSummary.addons.map((a, i) => (
                                        <span key={i} className="px-2 py-1 rounded-lg bg-slate-900 text-emerald-400 text-[10px] font-semibold border border-slate-800 truncate" title={a}>
                                            ✓ {a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-center pt-2">
                        <button 
                            onClick={onClose} 
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-8 py-3 rounded-xl cursor-pointer shadow-lg transition-all"
                        >
                            Done & Return to CRM
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-5 text-xs text-slate-800">
                    {/* 1. Client Request Summary Banner */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-4 shadow-md border border-emerald-500/20 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xl shrink-0">
                                    🏢
                                </div>
                                <div>
                                    <h4 className="font-black text-white text-base tracking-tight">{lead.name || lead.companyName || 'Corporate Client'}</h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-300 font-medium mt-0.5">
                                        <span className="flex items-center gap-1 font-mono"><HiPhone className="w-3.5 h-3.5 text-emerald-400" /> {lead.phone}</span>
                                        {lead.email && <span className="flex items-center gap-1"><HiMail className="w-3.5 h-3.5 text-blue-400" /> {lead.email}</span>}
                                    </div>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-[#C8FF2E] font-black text-xs border border-emerald-500/30">
                                Corporate Lead
                            </span>
                        </div>

                        {/* Preferred Arena, Date & Budget info */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-700/80 text-xs">
                            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
                                <span className="text-slate-400 block text-[10px] font-bold">🏟️ Preferred Arena</span>
                                <span className="font-bold text-emerald-300 truncate block mt-0.5">{lead.turfBranch || lead.preferredTurf || 'Champion Turf Ground'}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
                                <span className="text-slate-400 block text-[10px] font-bold">📅 Date / Slot</span>
                                <span className="font-semibold text-slate-200 truncate block mt-0.5">{lead.preferredSlot || 'Full Day Knockout'}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
                                <span className="text-slate-400 block text-[10px] font-bold">👥 Players</span>
                                <span className="font-semibold text-slate-200 block mt-0.5">{lead.teamName || lead.estimatedPlayers || '40-50 Players'}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
                                <span className="text-slate-400 block text-[10px] font-bold">💰 Client Budget</span>
                                <span className="font-black text-[#C8FF2E] block mt-0.5">{lead.budget || '₹60k - ₹1.2L'}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Admin Price Quote Inputs */}
                    <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                            <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                                <HiCurrencyRupee className="w-4 h-4 text-emerald-600" />
                                <span>Set Official Admin Quotation Pricing</span>
                            </h4>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Dynamic GST Engine
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div>
                                <label className="font-bold text-slate-700 block mb-1 text-xs">Base Price Quote (₹) *</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(Number(e.target.value) || 0)}
                                    placeholder="e.g. 75000"
                                    required
                                />
                            </div>
                            <div>
                                <label className="font-bold text-slate-700 block mb-1 text-xs">Corporate Discount (₹)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="500"
                                    value={discount}
                                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                                    placeholder="e.g. 5000"
                                />
                            </div>
                            <div>
                                <label className="font-bold text-slate-700 block mb-1 text-xs">Advance Deposit %</label>
                                <select
                                    value={advancePercent}
                                    onChange={(e) => setAdvancePercent(Number(e.target.value))}
                                    className="w-full h-[42px] px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                                >
                                    <option value={50}>50% Advance (Standard)</option>
                                    <option value={30}>30% Token Advance</option>
                                    <option value={100}>100% Full Payment Upfront</option>
                                    <option value={0}>0% (Post-Event 30-Day Net PO)</option>
                                </select>
                            </div>
                        </div>

                        {/* GST Toggle */}
                        <div className="flex items-center justify-between pt-1 bg-white p-3 rounded-xl border border-slate-200/80">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={includeGst}
                                    onChange={(e) => setIncludeGst(e.target.checked)}
                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#16A34A]"
                                />
                                <span className="font-bold text-slate-800">Apply 18% GST (Tax Deductible Invoice for Corporate)</span>
                            </label>
                            <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                {includeGst ? `+₹${gstAmount.toLocaleString('en-IN')}` : 'GST Exempt'}
                            </span>
                        </div>
                    </div>

                    {/* 3. Included Package Addons */}
                    <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                            <label className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                                <HiSparkles className="w-4 h-4 text-amber-500" />
                                <span>Included Complimentary Package Addons</span>
                            </label>
                            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                Addons Value: ₹{addonsTotal.toLocaleString('en-IN')}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {AVAILABLE_ADDONS.map((addon) => {
                                const isChecked = selectedAddons.includes(addon.id)
                                return (
                                    <div
                                        key={addon.id}
                                        onClick={() => toggleAddon(addon.id)}
                                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                                            isChecked 
                                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs' 
                                                : 'bg-white border-slate-200/90 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 pr-2">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {}}
                                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#16A34A]"
                                            />
                                            <span className="text-xs font-bold">{addon.label}</span>
                                        </div>
                                        <span className="font-mono text-xs text-slate-600 shrink-0 font-bold">₹{addon.price.toLocaleString('en-IN')}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* 4. Admin Notes to Company */}
                    <div>
                        <label className="font-bold text-slate-700 block mb-1 text-xs">Admin Notes / Terms for Corporate HR</label>
                        <textarea
                            rows={2}
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none shadow-2xs"
                            placeholder="Enter special perks, venue terms, umpire coordination details..."
                        />
                    </div>

                    {/* 5. Live Pricing Summary & Submit Buttons */}
                    <div className="bg-slate-950 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-slate-800">
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Final Quoted Package Total</div>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-3xl font-black text-[#C8FF2E] font-mono">₹{finalTotal.toLocaleString('en-IN')}</span>
                                {includeGst && <span className="text-xs text-emerald-400 font-bold">(incl. 18% GST)</span>}
                            </div>
                            <div className="text-xs text-slate-300 font-mono mt-1">
                                Advance Required: <strong className="text-[#C8FF2E] font-extrabold">₹{advanceAmount.toLocaleString('en-IN')}</strong> ({advancePercent}%)
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleSendQuote('QUOTE_SENT')}
                                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-[#C8FF2E] hover:bg-[#bbf324] text-slate-950 font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transform hover:-translate-y-0.5"
                            >
                                <span>📤 Send Official Quote</span>
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleSendQuote('CONFIRMED')}
                                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transform hover:-translate-y-0.5"
                            >
                                <span>✅ Confirm & Lock</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    )
}
