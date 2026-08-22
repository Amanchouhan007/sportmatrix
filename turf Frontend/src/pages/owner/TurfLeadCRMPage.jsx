import React, { useState, useEffect } from 'react'
import { HiUserGroup, HiPlus, HiSearch, HiFilter, HiPaperAirplane, HiDownload, HiTrash, HiPencilAlt, HiSparkles, HiPhone, HiTag, HiOutlineRefresh, HiCheck } from 'react-icons/hi'
import { getCrmLeads, saveCrmLead, deleteCrmLead, AVAILABLE_TURF_BRANCHES } from '../../services/crmService'
import { getCorporateProposals } from '../../services/corporateService'
import OfferBroadcastModal from '../../components/crm/OfferBroadcastModal'
import { useToast } from '../../components/ui/Toast'
import CustomSelect from '../../components/ui/CustomSelect'
import CustomDatePicker from '../../components/ui/CustomDatePicker'

export default function TurfLeadCRMPage() {
    const [leads, setLeads] = useState([])
    const [selectedBranch, setSelectedBranch] = useState('all') // 'all' | specific turf branch
    const [selectedDate, setSelectedDate] = useState('')
    const [activeTab, setActiveTab] = useState('all') // 'all' | 'team' | 'player' | 'umpire' | 'organizer'
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedLeadIds, setSelectedLeadIds] = useState([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false)
    const [selectedLeadForBroadcast, setSelectedLeadForBroadcast] = useState(null)
    const [selectedLeadsForBroadcast, setSelectedLeadsForBroadcast] = useState([])
    const { addToast } = useToast()

    // Form inputs for Add Lead Modal
    const [formName, setFormName] = useState('')
    const [formPhone, setFormPhone] = useState('')
    const [formRole, setFormRole] = useState('team')
    const [formTeamName, setFormTeamName] = useState('')
    const [formTurfBranch, setFormTurfBranch] = useState('SportZone Arena')
    const [formPreferredSport, setFormPreferredSport] = useState('Cricket')
    const [formPreferredSlot, setFormPreferredSlot] = useState('Weekend Evening')
    const [formNotes, setFormNotes] = useState('')

    const loadLeadsData = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
            const userStr = localStorage.getItem('sportmatrix_user') || localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const query = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
            const res = await fetch(`${API_URL}/crm/leads${query}`)
            const data = await res.json()
            if (data.success && Array.isArray(data.data)) {
                const mapped = data.data.map(l => ({
                    id: l.id,
                    name: l.name || l.contact_name || 'Valued Contact',
                    phone: l.phone || l.mobile || '',
                    email: l.email || '',
                    role: l.role || (l.category || '').toLowerCase(),
                    category: l.category || 'PLAYER',
                    teamName: l.teamName || l.team_name || 'Registered Member',
                    preferredSport: l.preferredSport || l.preferred_sport || 'Cricket',
                    preferredSlot: l.preferredSlot || l.slot_preference || 'Flexible',
                    turfBranch: l.turfBranch || l.branch_name || 'Indore Strikers Arena',
                    status: l.status || 'Confirmed',
                    notes: l.notes || '',
                    createdAt: l.createdAt ? l.createdAt.split('T')[0] : 'Today'
                }))
                setLeads(mapped)
            } else {
                setLeads([])
            }
        } catch (e) {
            console.warn('Error fetching CRM leads:', e);
            setLeads([]);
        }
    }

    useEffect(() => {
        loadLeadsData()

        const handleProposalCreated = (e) => {
            const detail = e.detail || {}
            addToast({ 
                title: '🏢 New Corporate Proposal Received!', 
                message: `${detail.companyName || 'Corporate Client'} requested a booking proposal!`, 
                type: 'success' 
            })
            loadLeadsData()
        }

        window.addEventListener('corporate_proposal_created', handleProposalCreated)
        return () => window.removeEventListener('corporate_proposal_created', handleProposalCreated)
    }, [])

    // Dynamic config for form field labels & placeholders based on Lead Category
    const getCategoryFieldConfig = (role) => {
        switch (role) {
            case 'organizer':
                return {
                    nameLabel: 'ORGANIZER / CONTACT NAME',
                    namePlaceholder: 'e.g. Rajesh Kumar (Event Manager)',
                    secondaryLabel: 'TOURNAMENT / ORGANIZATION',
                    secondaryPlaceholder: 'e.g. Indore Tournament Association',
                    categoryName: '🏆 Tournament Organizer'
                }
            case 'player':
                return {
                    nameLabel: 'PLAYER NAME',
                    namePlaceholder: 'e.g. Amit Kumar',
                    secondaryLabel: 'TEAM / ACADEMY NAME',
                    secondaryPlaceholder: 'e.g. Free Agent / Royals XI',
                    categoryName: '⚡ Player'
                }
            case 'umpire':
                return {
                    nameLabel: 'UMPIRE / REFEREE NAME',
                    namePlaceholder: 'e.g. Siddharth Roy',
                    secondaryLabel: 'ASSOCIATION / CERTIFICATION',
                    secondaryPlaceholder: 'e.g. BCA Certified Official',
                    categoryName: '🚩 Umpire / Referee'
                }
            case 'team':
            default:
                return {
                    nameLabel: 'CAPTAIN / CONTACT NAME',
                    namePlaceholder: 'e.g. Vikram Malhotra (Captain)',
                    secondaryLabel: 'TEAM NAME',
                    secondaryPlaceholder: 'e.g. Andheri Strikers',
                    categoryName: '🏏 Team / Captain'
                }
        }
    }

    const fieldConfig = getCategoryFieldConfig(formRole)

    const handleAddLead = (e) => {
        e.preventDefault()
        if (!formName || !formPhone) {
            if (addToast) addToast('Please provide Name and Phone number!', 'error')
            return
        }
        const created = saveCrmLead({
            name: formName,
            phone: formPhone,
            role: formRole,
            teamName: formTeamName || (formRole === 'umpire' ? 'Official Referee' : formRole === 'organizer' ? 'Independent Organizer' : 'Individual Lead'),
            preferredSport: formPreferredSport,
            preferredSlot: formPreferredSlot,
            turfBranch: formTurfBranch || (selectedBranch !== 'all' ? selectedBranch : 'SportZone Arena'),
            notes: formNotes
        })
        setLeads(getCrmLeads())
        setIsAddModalOpen(false)
        setFormName('')
        setFormPhone('')
        setFormTeamName('')
        setFormNotes('')
        if (addToast) addToast(`Lead ${created.name} (${fieldConfig.categoryName}) successfully added to CRM!`, 'success')
    }

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete lead ${name}?`)) {
            const updated = deleteCrmLead(id)
            setLeads(updated)
            setSelectedLeadIds(prev => prev.filter(i => i !== id))
            if (addToast) addToast(`Lead ${name} deleted.`, 'info')
        }
    }

    const handleOpenSingleBroadcast = (lead) => {
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

    // Filter Logic
    const branchOptions = ['all', ...new Set([...AVAILABLE_TURF_BRANCHES, ...leads.map(l => l.turfBranch).filter(Boolean)])]

    const filteredLeads = leads.filter(lead => {
        const matchesBranch = selectedBranch === 'all' || lead.turfBranch === selectedBranch
        const matchesTab = activeTab === 'all' || lead.role === activeTab
        const matchesDate = !selectedDate || (lead.createdAt && lead.createdAt.includes(selectedDate))
        const matchesSearch = 
            lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.phone?.includes(searchQuery) ||
            lead.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesBranch && matchesTab && matchesDate && matchesSearch
    })

    // Checkbox toggles
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

    const handleExportCSV = () => {
        const targetLeads = selectedLeadIds.length > 0 ? leads.filter(l => selectedLeadIds.includes(l.id)) : filteredLeads
        const headers = ['ID,Name,Phone,Role,Team/Organization,Turf Branch,Preferred Sport,Preferred Slot,Status,Total Bookings,Notes,Created Date']
        const rows = targetLeads.map(l => 
            `"${l.id}","${l.name}","${l.phone}","${l.role}","${l.teamName}","${l.turfBranch}","${l.preferredSport}","${l.preferredSlot}","${l.status}","${l.totalBookings}","${l.notes || ''}","${l.createdAt}"`
        )
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `turf_crm_leads_${Date.now()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        if (addToast) addToast(`Exported ${targetLeads.length} contacts to CSV!`, 'success')
    }

    const roleBadge = (role) => {
        switch (role) {
            case 'team': return 'bg-emerald-100 text-emerald-800 border-emerald-300'
            case 'player': return 'bg-sky-100 text-sky-800 border-sky-300'
            case 'umpire': return 'bg-amber-100 text-amber-900 border-amber-300'
            case 'organizer': return 'bg-purple-100 text-purple-900 border-purple-300'
            default: return 'bg-slate-100 text-slate-800 border-slate-300'
        }
    }

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4FF45]/40 text-[#172019] text-xs font-black uppercase tracking-wider border border-[#B8F52A]">
                        <span>📊 TURF CRM & MARKETING</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Lead Database & Offer Broadcast
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Manage your Captains, Players, Umpires & Tournament Organizers separately per Turf Branch.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                        <HiDownload className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>

                    <button
                        onClick={() => {
                            if (selectedBranch !== 'all') setFormTurfBranch(selectedBranch)
                            setIsAddModalOpen(true)
                        }}
                        className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                        <HiPlus className="w-4 h-4" />
                        <span>Add New Lead</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid - Dynamic to Selected Turf Branch */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Total Leads ({selectedBranch === 'all' ? 'All Turfs' : selectedBranch})</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{filteredLeads.length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Teams & Captains</div>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{filteredLeads.filter(l => l.role === 'team').length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Registered Umpires</div>
                    <div className="text-2xl font-black text-amber-600 mt-1">{filteredLeads.filter(l => l.role === 'umpire').length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Organizers & Players</div>
                    <div className="text-2xl font-black text-sky-600 mt-1">{filteredLeads.filter(l => l.role === 'organizer' || l.role === 'player').length}</div>
                </div>
            </div>

            {/* Controls Bar: Turf Selector, Tabs & Search */}
            <div className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Turf Branch & Date Selectors */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <CustomSelect
                            label="🏟️ Turf Branch"
                            value={selectedBranch}
                            onChange={(val) => setSelectedBranch(val)}
                            options={branchOptions.map(b => ({
                                value: b,
                                label: b === 'all' ? '🌐 All Turf Branches' : `🏟️ ${b}`
                            }))}
                            className="w-full sm:w-60"
                        />
                        <CustomDatePicker
                            label="📅 Filter Date"
                            value={selectedDate}
                            onChange={(val) => setSelectedDate(val)}
                            placeholder="All Dates"
                            align="left"
                            className="w-full sm:w-48"
                        />
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64 self-end">
                        <HiSearch className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search captain name, phone..."
                            className="w-full h-[42px] bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-4 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white"
                        />
                    </div>
                </div>

                {/* Role Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold overflow-x-auto">
                    {[
                        { id: 'all', label: '👥 All Contacts' },
                        { id: 'team', label: '🏏 Teams / Captains' },
                        { id: 'player', label: '⚡ Players' },
                        { id: 'umpire', label: '🚩 Umpires' },
                        { id: 'organizer', label: '🏆 Organizers' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${activeTab === tab.id ? 'bg-white text-[#16A34A] shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* STICKY BULK BROADCAST TOOLBAR (When contacts selected) */}
            {selectedLeadIds.length > 0 && (
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                        <span className="bg-[#D4FF45] text-slate-950 px-3 py-1 rounded-full text-xs font-black">
                            {selectedLeadIds.length} Contacts Ticked
                        </span>
                        <span className="text-xs font-bold text-slate-300">
                            Ready to dispatch bulk WhatsApp offers to all selected leads
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleOpenBulkBroadcast}
                            className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                        >
                            <HiPaperAirplane className="rotate-90 w-4 h-4" />
                            <span>📢 Broadcast Offer to ({selectedLeadIds.length}) Contacts</span>
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

            {/* CRM Leads Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[10px]">
                            <tr>
                                <th className="py-3.5 px-4 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleToggleSelectAll}
                                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#16A34A]"
                                        title="Select All Leads"
                                    />
                                </th>
                                <th className="py-3.5 px-4">Captain / Contact Name</th>
                                <th className="py-3.5 px-4">Category</th>
                                <th className="py-3.5 px-4">Team / Organization</th>
                                <th className="py-3.5 px-4">Turf Branch</th>
                                <th className="py-3.5 px-4">Slot Preference</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-right">WhatsApp Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-8 text-slate-400 font-bold">
                                        No leads found matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => {
                                    const isSelected = selectedLeadIds.includes(lead.id)
                                    return (
                                        <tr key={lead.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}>
                                            <td className="py-3.5 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleSelectLead(lead.id)}
                                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#16A34A]"
                                                />
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900">
                                                <div>{lead.name}</div>
                                                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                                    <HiPhone className="w-3 h-3 text-emerald-600" />
                                                    <span>{lead.phone}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${roleBadge(lead.role)}`}>
                                                    {lead.role === 'team' ? 'Captain / Team' : lead.role === 'organizer' ? 'Tournament Org' : lead.role}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-slate-700">
                                                {lead.teamName || '—'}
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-emerald-700">
                                                {lead.turfBranch || 'SportZone Arena'}
                                            </td>
                                             <td className="py-3.5 px-4 whitespace-nowrap">
                                                 <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                                     <span className="text-emerald-600">⏰</span>
                                                     <span className="font-mono text-slate-800">{lead.preferredSlot || '6:00 PM (Today)'}</span>
                                                 </div>
                                             </td>
                                            <td className="py-3.5 px-4">
                                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                                                    {lead.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenSingleBroadcast(lead)}
                                                        className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[11px] shadow-sm cursor-pointer flex items-center gap-1 transition-all"
                                                    >
                                                        <HiPaperAirplane className="w-3 h-3 rotate-90" />
                                                        <span>Offer Broadcast</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(lead.id, lead.name)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                                        title="Delete Lead"
                                                    >
                                                        <HiTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD LEAD MODAL WITH DYNAMIC CATEGORY LABELS */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                Add New CRM Lead / Contact
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormName('Vikram Malhotra')
                                    setFormPhone('+91 98765 43210')
                                    setFormTeamName('Andheri Strikers')
                                    setFormPreferredSlot('Weekend Evening 6-9 PM')
                                    setFormNotes('Requires 2 astro turf courts for friendly league')
                                }}
                                className="px-3 py-1 text-[11px] font-black bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-all"
                            >
                                ⚡ Quick Autofill
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddLead} className="space-y-3 text-xs">
                            {/* Category Selector */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Lead Category</label>
                                <CustomSelect
                                    value={formRole}
                                    onChange={(val) => setFormRole(val)}
                                    options={[
                                        { value: 'team', label: '🏏 Team / Captain' },
                                        { value: 'organizer', label: '🏆 Tournament Organization' },
                                        { value: 'player', label: '⚡ Individual Player' },
                                        { value: 'umpire', label: '🚩 Umpire / Referee' }
                                    ]}
                                />
                            </div>

                            {/* Dynamic Full Name / Captain / Organizer Name */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-[#16A34A] mb-1 block">
                                    {fieldConfig.nameLabel}
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    required
                                    placeholder={fieldConfig.namePlaceholder}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-[#16A34A]"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">WhatsApp Mobile Number</label>
                                <input
                                    type="text"
                                    value={formPhone}
                                    onChange={(e) => setFormPhone(e.target.value)}
                                    required
                                    placeholder="+91 98765 43210"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-[#16A34A]"
                                />
                            </div>

                            {/* Dynamic Team Name / Tournament Org Name */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-[#16A34A] mb-1 block">
                                    {fieldConfig.secondaryLabel}
                                </label>
                                <input
                                    type="text"
                                    value={formTeamName}
                                    onChange={(e) => setFormTeamName(e.target.value)}
                                    placeholder={fieldConfig.secondaryPlaceholder}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-[#16A34A]"
                                />
                            </div>

                            {/* Turf Branch Selector */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Assign Turf Branch</label>
                                <CustomSelect
                                    value={formTurfBranch}
                                    onChange={(val) => setFormTurfBranch(val)}
                                    options={AVAILABLE_TURF_BRANCHES.map(b => ({ value: b, label: `🏟️ ${b}` }))}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Preferred Time Slot</label>
                                <input
                                    type="text"
                                    value={formPreferredSlot}
                                    onChange={(e) => setFormPreferredSlot(e.target.value)}
                                    placeholder="e.g. Weekend Evening 6-9 PM"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-[#16A34A]"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Notes & Details</label>
                                <textarea
                                    value={formNotes}
                                    onChange={(e) => setFormNotes(e.target.value)}
                                    rows="2"
                                    placeholder="Add any specific requirements..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-[#16A34A]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#16A34A] text-white font-black shadow-md"
                                >
                                    Save Lead
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
        </div>
    )
}

