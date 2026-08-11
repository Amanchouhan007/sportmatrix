import React, { useState } from 'react'
import { HiX, HiPaperAirplane, HiCheckCircle, HiDuplicate, HiExternalLink, HiUserGroup } from 'react-icons/hi'
import { OFFER_TEMPLATES, generateWhatsAppLink } from '../../services/crmService'

export default function OfferBroadcastModal({ isOpen, onClose, selectedLead = null, selectedLeads = [] }) {
    const [selectedTemplateId, setSelectedTemplateId] = useState('morning_discount')
    const [customNote, setCustomNote] = useState('')
    const [copied, setCopied] = useState(false)

    // Normalize leads list: either selectedLeads array or single selectedLead
    const leads = selectedLeads.length > 0 ? selectedLeads : (selectedLead ? [selectedLead] : [])

    if (!isOpen || leads.length === 0) return null

    const isBulk = leads.length > 1
    const currentTemplate = OFFER_TEMPLATES.find(t => t.id === selectedTemplateId) || OFFER_TEMPLATES[0]

    // Primary/First Lead info for single preview
    const primaryLead = leads[0]
    const recipientName = primaryLead.name || 'Valued Player'
    const recipientPhone = primaryLead.phone || ''
    const turfName = primaryLead.turfBranch || 'SportZone Arena'

    const primaryMessage = currentTemplate.message(recipientName, turfName) + (customNote ? `\n\n📌 Note: ${customNote}` : '')
    const primaryWhatsappUrl = generateWhatsAppLink(recipientPhone, primaryMessage)

    // Generate bulk text for clipboard
    const bulkMessageText = leads.map(l => {
        const msg = currentTemplate.message(l.name || 'Valued Player', l.turfBranch || 'SportZone Arena') + (customNote ? `\n\n📌 Note: ${customNote}` : '')
        return `----------------------------------------\nTO: ${l.name} (${l.phone})\nLINK: ${generateWhatsAppLink(l.phone, msg)}\n\n${msg}`
    }).join('\n\n')

    const handleCopy = () => {
        const textToCopy = isBulk ? bulkMessageText : primaryMessage
        navigator.clipboard.writeText(textToCopy)
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
                        {isBulk ? '📢' : '📲'}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[#111827] tracking-tight">
                            {isBulk ? `Bulk WhatsApp Offer Broadcast (${leads.length} Contacts)` : 'WhatsApp Offer Broadcast'}
                        </h3>
                        <p className="text-xs text-[#6B7280] font-semibold">
                            {isBulk ? (
                                <span className="text-emerald-700 font-bold">
                                    Broadcast offer dispatched to {leads.length} selected contacts simultaneously
                                </span>
                            ) : (
                                <>Recipient: <strong className="text-black">{recipientName}</strong> ({primaryLead.role?.toUpperCase()}) · {recipientPhone}</>
                            )}
                        </p>
                    </div>
                </div>

                {/* Recipient Chips if Bulk */}
                {isBulk && (
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 block">Selected Contacts List ({leads.length})</label>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                            {leads.map(l => (
                                <span key={l.id} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-800 flex items-center gap-1 shadow-2xs">
                                    <span>👤 {l.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">({l.phone})</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

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
                            {isBulk ? 'WhatsApp Sample Message Preview' : 'WhatsApp Live Message Preview'}
                        </label>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="text-[10px] font-bold text-[#16A34A] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            {copied ? <HiCheckCircle className="text-emerald-600" /> : <HiDuplicate />}
                            <span>{copied ? 'Copied All!' : isBulk ? 'Copy All Messages' : 'Copy Text'}</span>
                        </button>
                    </div>
                    <div className="bg-emerald-950/5 border border-emerald-300/60 rounded-2xl p-4 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-line shadow-inner max-h-40 overflow-y-auto">
                        {primaryMessage}
                    </div>
                </div>

                {/* Bulk Recipients WhatsApp Launch List */}
                {isBulk && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                            1-Click Broadcast Actions ({leads.length} Recipients)
                        </label>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                            {leads.map((l) => {
                                const leadMsg = currentTemplate.message(l.name || 'Valued Player', l.turfBranch || 'SportZone Arena') + (customNote ? `\n\n📌 Note: ${customNote}` : '')
                                const leadWaUrl = generateWhatsAppLink(l.phone, leadMsg)
                                return (
                                    <div key={l.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium">
                                        <div>
                                            <span className="font-bold text-slate-900">{l.name}</span>
                                            <span className="text-[11px] text-slate-500 ml-2 font-mono">{l.phone}</span>
                                            <span className="text-[10px] text-slate-400 ml-2">({l.turfBranch})</span>
                                        </div>
                                        <a
                                            href={leadWaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs transition-all"
                                        >
                                            <HiPaperAirplane className="rotate-90 w-3 h-3" />
                                            <span>Send WA</span>
                                        </a>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                        Cancel
                    </button>

                    {!isBulk ? (
                        <a
                            href={primaryWhatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                        >
                            <HiPaperAirplane className="rotate-90" />
                            <span>Send WhatsApp Broadcast →</span>
                        </a>
                    ) : (
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                        >
                            <HiDuplicate />
                            <span>{copied ? 'Copied Broadcast Links & Text!' : 'Copy All Broadcast Links & Text'}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

