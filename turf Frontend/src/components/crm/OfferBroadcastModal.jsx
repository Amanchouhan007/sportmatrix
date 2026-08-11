import React, { useState } from 'react'
import { HiX, HiPaperAirplane, HiSparkles, HiCheckCircle, HiDuplicate, HiExternalLink } from 'react-icons/hi'
import { OFFER_TEMPLATES, generateWhatsAppLink } from '../../services/crmService'

export default function OfferBroadcastModal({ isOpen, onClose, selectedLead }) {
    const [selectedTemplateId, setSelectedTemplateId] = useState('morning_discount')
    const [customNote, setCustomNote] = useState('')
    const [copied, setCopied] = useState(false)

    if (!isOpen || !selectedLead) return null

    const currentTemplate = OFFER_TEMPLATES.find(t => t.id === selectedTemplateId) || OFFER_TEMPLATES[0]
    const recipientName = selectedLead.name || 'Valued Player'
    const recipientPhone = selectedLead.phone || ''
    const turfName = selectedLead.turfBranch || 'SportZone Arena'

    const generatedMessage = currentTemplate.message(recipientName, turfName) + (customNote ? `\n\n📌 Note: ${customNote}` : '')
    const whatsappUrl = generateWhatsAppLink(recipientPhone, generatedMessage)

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedMessage)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full shadow-2xl relative space-y-5 my-auto max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                >
                    <HiX className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-[#16A34A] flex items-center justify-center text-2xl shadow-sm">
                        📲
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[#111827] tracking-tight">
                            WhatsApp Offer Broadcast
                        </h3>
                        <p className="text-xs text-[#6B7280] font-semibold">
                            Recipient: <strong className="text-black">{recipientName}</strong> ({selectedLead.role?.toUpperCase()}) · {recipientPhone}
                        </p>
                    </div>
                </div>

                {/* Offer Template Selector */}
                <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 block">
                        Select Campaign / Offer Template
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {OFFER_TEMPLATES.map((tmpl) => (
                            <button
                                key={tmpl.id}
                                type="button"
                                onClick={() => setSelectedTemplateId(tmpl.id)}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${selectedTemplateId === tmpl.id ? 'bg-emerald-50 border-[#16A34A] ring-2 ring-[#16A34A]/20' : 'bg-slate-50 border-slate-200 hover:bg-white'}`}
                            >
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border inline-block mb-1 ${tmpl.badgeColor}`}>
                                    {tmpl.type}
                                </span>
                                <div className="text-xs font-bold text-slate-900 line-clamp-1">{tmpl.title}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Note Option */}
                <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">
                        Add Optional Personal Note / Coupon Code
                    </label>
                    <input
                        type="text"
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        placeholder="e.g. Valid only till this Sunday night!"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white"
                    />
                </div>

                {/* Live Message Preview Box */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            WhatsApp Live Message Preview
                        </label>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="text-[10px] font-bold text-[#16A34A] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            {copied ? <HiCheckCircle className="text-emerald-600" /> : <HiDuplicate />}
                            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                        </button>
                    </div>
                    <div className="bg-emerald-950/5 border border-emerald-300/60 rounded-2xl p-4 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-line shadow-inner max-h-48 overflow-y-auto">
                        {generatedMessage}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                        Cancel
                    </button>

                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                    >
                        <HiPaperAirplane className="rotate-90" />
                        <span>Send WhatsApp Broadcast →</span>
                    </a>
                </div>
            </div>
        </div>
    )
}
