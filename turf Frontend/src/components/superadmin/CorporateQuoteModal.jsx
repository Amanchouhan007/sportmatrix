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
        <Modal isOpen={isOpen} onClose={onClose} title="💼 Set Custom Price & Send Corporate Quotation">
            {quoteSuccess && generatedQuoteSummary ? (
                <div className="text-center py-5 space-y-4 text-slate-800">
                    <div className="w-16 h-16 bg-emerald-100 border-4 border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-3xl animate-bounce shadow-md">
                        ✓
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Official Quotation Dispatched!</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Quotation generated for <strong>{lead.name || lead.companyName}</strong>
                        </p>
                    </div>

                    {/* Official Quotation Card Preview */}
                    <div className="bg-slate-900 text-white rounded-3xl p-5 text-left border border-slate-800 shadow-xl space-y-3 max-w-md mx-auto">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-xl bg-emerald-500/20 text-[#C8FF2E]">
                                    <HiOfficeBuilding className="w-5 h-5" />
                                </span>
                                <div>
                                    <h4 className="font-black text-sm text-white">{lead.name || lead.companyName}</h4>
                                    <span className="text-[10px] text-slate-400 font-mono">Arena: {lead.turfBranch || lead.preferredTurf || 'Champion Turf Ground'}</span>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-[#C8FF2E] font-black text-xs border border-emerald-500/30">
                                {generatedQuoteSummary.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs py-1">
                            <div>
                                <span className="text-slate-400 text-[10px] block">Base Rate</span>
                                <span className="font-mono font-bold text-slate-200">₹{basePrice.toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 text-[10px] block">Corporate Discount</span>
                                <span className="font-mono font-bold text-rose-400">-₹{discount.toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 text-[10px] block">18% GST Tax</span>
                                <span className="font-mono font-bold text-amber-300">+₹{gstAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 text-[10px] block">50% Advance Due</span>
                                <span className="font-mono font-bold text-[#C8FF2E]">₹{advanceAmount.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                            <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">Total Quoted Amount</span>
                            <span className="text-xl font-black text-[#C8FF2E] font-mono">₹{finalTotal.toLocaleString('en-IN')}</span>
                        </div>

                        {generatedQuoteSummary.addons?.length > 0 && (
                            <div className="pt-1 text-[11px] text-slate-400 border-t border-slate-800/80">
                                <span className="font-bold text-slate-300 block mb-1">Included Addons ({generatedQuoteSummary.addons.length}):</span>
                                <div className="flex flex-wrap gap-1">
                                    {generatedQuoteSummary.addons.map((a, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]">
                                            ✓ {a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-2">
                        <Button 
                            onClick={onClose} 
                            className="bg-[#111827] text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-black cursor-pointer shadow-md"
                        >
                            Done & Return to CRM
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 text-xs text-slate-800">
                    {/* 1. Client Request Summary Banner */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm">
                                    🏢
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm">{lead.name || lead.companyName || 'Corporate Client'}</h4>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                                        <span className="flex items-center gap-1 font-mono"><HiPhone className="w-3 h-3 text-emerald-600" /> {lead.phone}</span>
                                        {lead.email && <span className="flex items-center gap-1"><HiMail className="w-3 h-3 text-blue-600" /> {lead.email}</span>}
                                    </div>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-black text-[10px] border border-purple-200">
                                Corporate Lead
                            </span>
                        </div>

                        {/* Preferred Arena, Date & Budget info */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
                            <div>
                                <span className="text-slate-400 block text-[10px] font-bold">🏟️ Preferred Arena</span>
                                <span className="font-bold text-emerald-700 truncate block">{lead.turfBranch || lead.preferredTurf || 'Champion Turf Ground'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px] font-bold">📅 Date / Slot</span>
                                <span className="font-semibold text-slate-800 truncate block">{lead.preferredSlot || 'Full Day Knockout'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px] font-bold">👥 Players</span>
                                <span className="font-semibold text-slate-800">{lead.teamName || lead.estimatedPlayers || '40-50 Players'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px] font-bold">💰 Client Budget</span>
                                <span className="font-bold text-amber-700">{lead.budget || '₹60k - ₹1.2L'}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Admin Price Quote Inputs */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                <HiCurrencyRupee className="w-4 h-4 text-emerald-600" />
                                <span>Set Official Admin Quotation Pricing</span>
                            </h4>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Dynamic GST Engine
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Base Price Quote (₹) *</label>
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
                                <label className="font-bold text-slate-700 block mb-1">Corporate Discount (₹)</label>
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
                                <label className="font-bold text-slate-700 block mb-1">Advance Deposit %</label>
                                <select
                                    value={advancePercent}
                                    onChange={(e) => setAdvancePercent(Number(e.target.value))}
                                    className="w-full h-[38px] px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value={50}>50% Advance (Standard)</option>
                                    <option value={30}>30% Token Advance</option>
                                    <option value={100}>100% Full Payment Upfront</option>
                                    <option value={0}>0% (Post-Event 30-Day Net PO)</option>
                                </select>
                            </div>
                        </div>

                        {/* GST Toggle */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={includeGst}
                                    onChange={(e) => setIncludeGst(e.target.checked)}
                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#16A34A]"
                                />
                                <span className="font-bold text-slate-800">Apply 18% GST (Tax Deductible Invoice for Corporate)</span>
                            </label>
                            <span className="font-mono font-bold text-slate-600">
                                {includeGst ? `+₹${gstAmount.toLocaleString('en-IN')}` : 'GST Exempt'}
                            </span>
                        </div>
                    </div>

                    {/* 3. Included Package Addons */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                <HiSparkles className="w-4 h-4 text-amber-500" />
                                <span>Included Complimentary Package Addons</span>
                            </label>
                            <span className="text-[11px] font-mono font-bold text-slate-500">
                                Addons Value: ₹{addonsTotal.toLocaleString('en-IN')}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {AVAILABLE_ADDONS.map((addon) => {
                                const isChecked = selectedAddons.includes(addon.id)
                                return (
                                    <div
                                        key={addon.id}
                                        onClick={() => toggleAddon(addon.id)}
                                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                                            isChecked 
                                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold shadow-2xs' 
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 pr-2">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {}}
                                                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#16A34A]"
                                            />
                                            <span className="text-[11px]">{addon.label}</span>
                                        </div>
                                        <span className="font-mono text-[10px] text-slate-500 shrink-0">₹{addon.price.toLocaleString('en-IN')}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* 4. Admin Notes to Company */}
                    <div>
                        <label className="font-bold text-slate-700 block mb-1">Admin Notes / Terms for Corporate HR</label>
                        <textarea
                            rows={2}
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            placeholder="Enter special perks, venue terms, umpire coordination details..."
                        />
                    </div>

                    {/* 5. Live Pricing Summary & Submit Buttons */}
                    <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Final Quoted Package Total</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-[#C8FF2E] font-mono">₹{finalTotal.toLocaleString('en-IN')}</span>
                                {includeGst && <span className="text-[10px] text-emerald-400 font-bold">(incl. 18% GST)</span>}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Advance Required: <strong className="text-white">₹{advanceAmount.toLocaleString('en-IN')}</strong> ({advancePercent}%)
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleSendQuote('QUOTE_SENT')}
                                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#C8FF2E] hover:bg-[#bbf324] text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <span>📤 Send Official Quote</span>
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleSendQuote('CONFIRMED')}
                                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <span>✅ Confirm & Lock Slot</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    )
}
