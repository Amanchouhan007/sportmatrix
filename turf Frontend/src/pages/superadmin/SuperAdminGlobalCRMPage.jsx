import React, { useState, useEffect } from 'react'
import { HiShieldCheck, HiSearch, HiPaperAirplane, HiDownload, HiFilter, HiPhone, HiGlobeAlt, HiOfficeBuilding, HiCurrencyRupee } from 'react-icons/hi'
import { getCrmLeads, isDemoLead } from '../../services/crmService'
import { getCorporateProposals } from '../../services/corporateService'
import OfferBroadcastModal from '../../components/crm/OfferBroadcastModal'
import CorporateQuoteModal from '../../components/superadmin/CorporateQuoteModal'
import { useToast } from '../../components/ui/Toast'
import CustomSelect from '../../components/ui/CustomSelect'
import CustomDatePicker from '../../components/ui/CustomDatePicker'

export default function SuperAdminGlobalCRMPage() {
    const [leads, setLeads] = useState([])
    const [selectedBranch, setSelectedBranch] = useState('all')
    const [selectedRole, setSelectedRole] = useState('all')
    const [selectedDate, setSelectedDate] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedLeadIds, setSelectedLeadIds] = useState([])
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false)
    const [selectedLeadForBroadcast, setSelectedLeadForBroadcast] = useState(null)
    const [selectedLeadsForBroadcast, setSelectedLeadsForBroadcast] = useState([])
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
    const [selectedLeadForQuote, setSelectedLeadForQuote] = useState(null)
    const { addToast } = useToast()

    // Formatting helpers for enhanced UI presentation
    const formatDisplayName = (lead) => {
        let name = lead.name || lead.contactPerson || 'Player Contact'
        if (name.includes('@')) {
            const username = name.split('@')[0]
            name = username.charAt(0).toUpperCase() + username.slice(1).replace(/[^a-zA-Z0-9]/g, ' ')
        } else if (name.toLowerCase() === 'wrf') {
            name = 'WRF Captain'
        } else if (name.toLowerCase() === 'aman') {
            name = 'Aman Enterprise'
        } else {
            name = name.split(' ').map(w => w ? (w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) : '').join(' ')
        }
        return name
    }

    const formatPhoneBadge = (phoneStr) => {
        if (!phoneStr || phoneStr === '123' || phoneStr === '2255') return `+91 ${phoneStr || '98765 00000'}`
        if (phoneStr.startsWith('+91')) return phoneStr
        if (phoneStr.length === 10 && /^\d+$/.test(phoneStr)) {
            return `+91 ${phoneStr.slice(0, 5)} ${phoneStr.slice(5)}`
        }
        return `+91 ${phoneStr}`
    }

    const formatSlotDisplay = (slotStr) => {
        if (!slotStr) return '06:00 PM • Today'
        if (slotStr.includes('(2026-')) {
            const [time, dateRaw] = slotStr.split('(')
            const cleanDate = dateRaw.replace(')', '').trim()
            let cleanTime = time.trim()
            if (cleanTime.includes(':')) {
                const [h, m] = cleanTime.split(':')
                const hour = parseInt(h, 10)
                const ampm = hour >= 12 ? 'PM' : 'AM'
                const formattedHour = hour % 12 || 12
                cleanTime = `${formattedHour}:${m} ${ampm}`
            }
            return `${cleanTime} • ${cleanDate}`
        }
        if (slotStr.includes('08:00 AM') || slotStr.includes('Full Day')) {
            return `Full Day Arena (08:00 AM - 08:00 PM)`
        }
        return slotStr
    }

    const loadAllLeads = async () => {
        const crmData = getCrmLeads().filter(item => !isDemoLead(item))
        try {
            const corpData = await getCorporateProposals()
            if (Array.isArray(corpData) && corpData.length > 0) {
                const mappedCorp = corpData
                    .map(c => ({
                        id: c.id ? String(c.id) : `corp_${Date.now()}`,
                        proposalId: c.id,
                        name: c.company_name || c.companyName || c.contact_person || c.contactPerson || 'Corporate Contact',
                        contactPerson: c.contact_person || c.contactPerson,
                        companyName: c.company_name || c.companyName,
                        phone: c.phone || '+91 98765 00000',
                        email: c.email || '',
                        role: 'corporate',
                        teamName: `${c.estimated_players || c.estimatedPlayers || '40-50 Players'} • ${c.event_type || c.eventType || 'Tournament'}`,
                        preferredSport: c.event_type || c.eventType || 'Corporate Tournament',
                        preferredSlot: c.time_slot || c.timeSlot || (c.event_date ? `${c.event_date} (Full Day)` : 'Full Day Arena Booking'),
                        turfBranch: c.preferred_turf || c.preferredTurf || (c.city ? `🏟️ ${c.city} Turf Complex` : 'Champion Turf Ground (Palasia, Indore)'),
                        budget: c.budget || '₹60,000 - ₹1,20,000',
                        status: c.status || 'NEW',
                        quotedPrice: c.quotedPrice || c.quoted_price || null,
                        quoteData: c.quoteData || null,
                        totalBookings: 1,
                        notes: `Corporate request for ${c.company_name || c.companyName} (${c.estimated_players || c.estimatedPlayers || '40+ Players'}, Budget: ${c.budget || 'Custom'})`,
                        createdAt: c.created_at ? c.created_at.split('T')[0] : (c.createdAt ? c.createdAt.split('T')[0] : new Date().toISOString().split('T')[0])
                    }))
                    .filter(item => !isDemoLead(item))

                // Merge and deduplicate by unique lead ID
                const combined = [...mappedCorp, ...crmData].filter(item => !isDemoLead(item))
                const seen = new Set()
                const deduplicated = []
                for (const item of combined) {
                    const key = item.id || item.proposalId || (item.name + '_' + item.phone)
                    if (!seen.has(key)) {
                        seen.add(key)
                        deduplicated.push(item)
                    }
                }
                setLeads(deduplicated)
                return
            }
        } catch (e) {
            console.warn('Corp proposals sync note:', e)
        }
        setLeads(crmData)
    }

    useEffect(() => {
        loadAllLeads()

        const handleProposalCreated = (e) => {
            const detail = e.detail || {}
            addToast({ 
                title: '🏢 New Corporate Proposal Received!', 
                message: `${detail.companyName || 'Corporate Client'} requested a proposal quote!`, 
                type: 'success' 
            })
            loadAllLeads()
        }

        window.addEventListener('corporate_proposal_created', handleProposalCreated)
        return () => window.removeEventListener('corporate_proposal_created', handleProposalCreated)
    }, [])

    const handleOpenBroadcast = (lead) => {
        setSelectedLeadForBroadcast(lead)
        setSelectedLeadsForBroadcast([])
        setIsBroadcastModalOpen(true)
    }

    const handleOpenBulkBroadcast = () => {
        const bulkLeads = leads.filter(l => selectedLeadIds.includes(l.id))
        if (bulkLeads.length === 0) {
            if (addToast) addToast('Please select at least one contact!', 'error')
            return
        }
        setSelectedLeadsForBroadcast(bulkLeads)
        setSelectedLeadForBroadcast(null)
        setIsBroadcastModalOpen(true)
    }

    const handleExportMasterCSV = () => {
        const targetLeads = selectedLeadIds.length > 0 ? leads.filter(l => selectedLeadIds.includes(l.id)) : filteredLeads
        const headers = ['ID,Name,Phone,Role,Team Name,Turf Branch,Preferred Slot,Status,Total Bookings,Created Date']
        const rows = targetLeads.map(l => 
            `"${l.id}","${l.name}","${l.phone}","${l.role}","${l.teamName}","${l.turfBranch}","${l.preferredSlot}","${l.status}","${l.totalBookings}","${l.createdAt}"`
        )
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `superadmin_master_crm_${Date.now()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        if (addToast) addToast(`Master Platform CRM exported ${targetLeads.length} contacts to CSV!`, 'success')
    }

    const branches = ['all', ...new Set(leads.map(l => l.turfBranch).filter(Boolean))]

    const filteredLeads = leads.filter(lead => {
        const matchesBranch = selectedBranch === 'all' || lead.turfBranch === selectedBranch
        const matchesRole = selectedRole === 'all' || lead.role === selectedRole
        const matchesDate = !selectedDate || (lead.createdAt && lead.createdAt.includes(selectedDate))
        const matchesSearch = 
            lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.phone?.includes(searchQuery) ||
            lead.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesBranch && matchesRole && matchesDate && matchesSearch
    })

    const isAllSelected = filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.includes(l.id))

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedLeadIds([])
        } else {
            setSelectedLeadIds(filteredLeads.map(l => l.id))
        }
    }

    const handleToggleSelectLead = (id) => {
        if (selectedLeadIds.includes(id)) {
            setSelectedLeadIds(selectedLeadIds.filter(i => i !== id))
        } else {
            setSelectedLeadIds([...selectedLeadIds, id])
        }
    }

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8FF2E]/20 text-[#C8FF2E] text-xs font-black uppercase tracking-wider border border-[#C8FF2E]/40 font-mono">
                        <span>🛡️ SUPER ADMIN GLOBAL CRM OVERSIGHT</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Platform Master Lead Database
                    </h1>
                    <p className="text-xs text-slate-400 font-medium">
                        Unified cross-platform view of all Players, Teams, Umpires & Tournament Organizers across all turf branches.
                    </p>
                </div>

                <button
                    onClick={handleExportMasterCSV}
                    className="px-5 py-2.5 rounded-xl bg-[#C8FF2E] hover:bg-[#B5F000] text-slate-950 font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all self-start sm:self-auto"
                >
                    <HiDownload className="w-4 h-4" />
                    <span>Export Master CSV</span>
                </button>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Total Registered Contacts</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{filteredLeads.length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Total Teams & Captains</div>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{filteredLeads.filter(l => l.role === 'team').length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Corporate Proposals</div>
                    <div className="text-2xl font-black text-indigo-600 mt-1">{filteredLeads.filter(l => l.role === 'corporate').length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Active Umpires</div>
                    <div className="text-2xl font-black text-amber-600 mt-1">{filteredLeads.filter(l => l.role === 'umpire').length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Active Venues</div>
                    <div className="text-2xl font-black text-purple-600 mt-1">{branches.length - 1 || 1}</div>
                </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <CustomSelect
                        label="Filter by Venue / Branch"
                        value={selectedBranch}
                        onChange={(val) => setSelectedBranch(val)}
                        options={branches.map(b => ({
                            value: b,
                            label: b === 'all' ? '🌐 All Turf Branches' : b
                        }))}
                    />
                </div>

                <div>
                    <CustomSelect
                        label="Filter by Category"
                        value={selectedRole}
                        onChange={(val) => setSelectedRole(val)}
                        options={[
                            { value: 'all', label: '👥 All Roles' },
                            { value: 'corporate', label: '🏢 Corporate & Bulk Proposals' },
                            { value: 'team', label: '🏏 Teams / Captains' },
                            { value: 'player', label: '⚡ Players' },
                            { value: 'umpire', label: '🚩 Umpires / Referees' },
                            { value: 'organizer', label: '🏆 Tournament Organizers' }
                        ]}
                    />
                </div>

                <div>
                    <CustomDatePicker
                        label="Filter by Creation Date"
                        value={selectedDate}
                        onChange={(val) => setSelectedDate(val)}
                        placeholder="All Dates"
                        align="left"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Search Contacts</label>
                    <div className="relative">
                        <HiSearch className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search name, phone, team..."
                            className="w-full h-[42px] bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#16A34A]"
                        />
                    </div>
                </div>
            </div>

            {/* STICKY BULK BROADCAST TOOLBAR */}
            {selectedLeadIds.length > 0 && (
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                        <span className="bg-[#C8FF2E] text-slate-950 px-3 py-1 rounded-full text-xs font-black">
                            {selectedLeadIds.length} Selected
                        </span>
                        <span className="text-xs font-bold text-slate-300">
                            SuperAdmin Bulk Broadcast Ready
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleOpenBulkBroadcast}
                            className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                        >
                            <HiPaperAirplane className="rotate-90 w-4 h-4" />
                            <span>📢 Global Offer Broadcast to ({selectedLeadIds.length}) Contacts</span>
                        </button>
                        <button
                            onClick={() => setSelectedLeadIds([])}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                        >
                            Deselect All
                        </button>
                    </div>
                </div>
            )}

            {/* Master Table */}
            <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-white uppercase font-black tracking-wider text-[10px]">
                            <tr>
                                <th className="py-4 px-4 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleToggleSelectAll}
                                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer accent-[#16A34A]"
                                        title="Select All Leads"
                                    />
                                </th>
                                <th className="py-4 px-4">Contact / Name</th>
                                <th className="py-4 px-4">Category</th>
                                <th className="py-4 px-4">Turf Branch</th>
                                <th className="py-4 px-4">Booking Time / Slot</th>
                                <th className="py-4 px-4">Team / Details</th>
                                <th className="py-4 px-4">Status</th>
                                <th className="py-4 px-4 text-right">SuperAdmin Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                            {filteredLeads.map((lead) => {
                                const isSelected = selectedLeadIds.includes(lead.id)
                                const isCorp = lead.role === 'corporate'
                                const isTeam = lead.role === 'team'
                                const isUmpire = lead.role === 'umpire'
                                const isOrg = lead.role === 'organizer'

                                const avatarIcon = isCorp ? '🏢' : isTeam ? '🏏' : isUmpire ? '🚩' : isOrg ? '🏆' : '👤'
                                const formattedName = formatDisplayName(lead)
                                const formattedPhone = formatPhoneBadge(lead.phone)
                                const formattedSlot = formatSlotDisplay(lead.preferredSlot)

                                return (
                                    <tr key={lead.id} className={`hover:bg-emerald-50/30 transition-colors ${isSelected ? 'bg-emerald-50/60' : ''}`}>
                                        <td className="py-4 px-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleToggleSelectLead(lead.id)}
                                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#16A34A]"
                                            />
                                        </td>
                                        
                                        {/* Contact / Name Column */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base shrink-0 shadow-2xs border ${
                                                    isCorp ? 'bg-purple-50 border-purple-200' : isTeam ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-200'
                                                }`}>
                                                    {avatarIcon}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 text-sm">{formattedName}</div>
                                                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                                        <HiPhone className="w-3 h-3 text-emerald-600" />
                                                        <span>{formattedPhone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category Column */}
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider border shadow-2xs ${
                                                isCorp 
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                                    : isTeam
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : isUmpire
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : isOrg
                                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                            }`}>
                                                <span>{avatarIcon}</span>
                                                {isCorp ? 'Corporate' : isTeam ? 'Captain / Team' : isOrg ? 'Tournament Org' : isUmpire ? 'Umpire' : lead.role}
                                            </span>
                                        </td>

                                        {/* Turf Branch Column */}
                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-800 font-bold text-xs">
                                                📍 {lead.turfBranch || 'Indore Turf Complex'}
                                            </span>
                                        </td>

                                        {/* Booking Time / Slot Column */}
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                                                <span className="text-emerald-600">⏰</span>
                                                <span className="font-mono text-slate-800">{formattedSlot}</span>
                                            </div>
                                        </td>

                                        {/* Team / Details Column */}
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-slate-900">{lead.teamName || `${formattedName}'s Team`}</div>
                                            {lead.notes && (
                                                <div className="text-[11px] text-slate-400 font-medium truncate max-w-xs mt-0.5">{lead.notes}</div>
                                            )}
                                        </td>

                                        {/* Status Column */}
                                        <td className="py-4 px-4">
                                            {lead.status?.includes('Quote Sent') ? (
                                                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 font-black text-[11px] whitespace-nowrap inline-flex items-center gap-1">
                                                    💼 {lead.status}
                                                </span>
                                            ) : lead.status?.includes('Confirmed') ? (
                                                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[11px] whitespace-nowrap inline-flex items-center gap-1">
                                                    ✅ {lead.status}
                                                </span>
                                            ) : lead.status === 'NEW' ? (
                                                <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 font-black text-[11px] whitespace-nowrap inline-flex items-center gap-1">
                                                    ✨ NEW LEAD
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-black text-[11px] whitespace-nowrap inline-flex items-center gap-1">
                                                    🔥 {lead.status || 'Active'}
                                                </span>
                                            )}
                                        </td>

                                        {/* SuperAdmin Action Buttons */}
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {isCorp && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedLeadForQuote(lead)
                                                            setIsQuoteModalOpen(true)
                                                        }}
                                                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-sm cursor-pointer flex items-center gap-1.5 transition-all"
                                                        title="Set Custom Price & Send Quote"
                                                    >
                                                        <HiCurrencyRupee className="w-4 h-4" />
                                                        <span>Set Price Quote</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenBroadcast(lead)}
                                                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5 transition-all"
                                                >
                                                    <HiPaperAirplane className="w-3.5 h-3.5 rotate-90" />
                                                    <span>Broadcast</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BROADCAST OFFER MODAL */}
            <OfferBroadcastModal
                isOpen={isBroadcastModalOpen}
                onClose={() => {
                    setIsBroadcastModalOpen(false)
                    setSelectedLeadForBroadcast(null)
                    setSelectedLeadsForBroadcast([])
                }}
                selectedLead={selectedLeadForBroadcast}
                selectedLeads={selectedLeadsForBroadcast}
            />

            {/* CORPORATE ADMIN PRICE QUOTE MODAL */}
            <CorporateQuoteModal
                isOpen={isQuoteModalOpen}
                onClose={() => {
                    setIsQuoteModalOpen(false)
                    setSelectedLeadForQuote(null)
                }}
                lead={selectedLeadForQuote}
                onQuoteSent={() => {
                    loadAllLeads()
                }}
            />
        </div>
    )
}

