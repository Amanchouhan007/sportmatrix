import React, { useState, useEffect } from 'react'
import { HiUserGroup, HiPlus, HiSearch, HiFilter, HiPaperAirplane, HiDownload, HiTrash, HiPencilAlt, HiSparkles, HiPhone, HiTag, HiOutlineRefresh } from 'react-icons/hi'
import { getCrmLeads, saveCrmLead, deleteCrmLead } from '../../services/crmService'
import OfferBroadcastModal from '../../components/crm/OfferBroadcastModal'
import { useToast } from '../../components/ui/Toast'

export default function TurfLeadCRMPage() {
    const [leads, setLeads] = useState([])
    const [activeTab, setActiveTab] = useState('all') // 'all' | 'team' | 'player' | 'umpire' | 'organizer'
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false)
    const [selectedLeadForBroadcast, setSelectedLeadForBroadcast] = useState(null)
    const { addToast } = useToast()

    // Form inputs for Add Lead Modal
    const [formName, setFormName] = useState('')
    const [formPhone, setFormPhone] = useState('')
    const [formRole, setFormRole] = useState('team')
    const [formTeamName, setFormTeamName] = useState('')
    const [formPreferredSport, setFormPreferredSport] = useState('Cricket')
    const [formPreferredSlot, setFormPreferredSlot] = useState('Weekend Evening')
    const [formNotes, setFormNotes] = useState('')

    useEffect(() => {
        setLeads(getCrmLeads())
    }, [])

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
            teamName: formTeamName || (formRole === 'umpire' ? 'Official Referee' : 'Individual Lead'),
            preferredSport: formPreferredSport,
            preferredSlot: formPreferredSlot,
            turfBranch: 'SportZone Arena',
            notes: formNotes
        })
        setLeads(getCrmLeads())
        setIsAddModalOpen(false)
        setFormName('')
        setFormPhone('')
        setFormNotes('')
        if (addToast) addToast(`Lead ${created.name} successfully added to CRM!`, 'success')
    }

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete lead ${name}?`)) {
            setLeads(deleteCrmLead(id))
            if (addToast) addToast(`Lead ${name} deleted.`, 'info')
        }
    }

    const handleOpenBroadcast = (lead) => {
        setSelectedLeadForBroadcast(lead)
        setIsBroadcastModalOpen(true)
    }

    const handleExportCSV = () => {
        const headers = ['ID,Name,Phone,Role,Team Name,Preferred Sport,Preferred Slot,Status,Total Bookings,Notes,Created Date']
        const rows = filteredLeads.map(l => 
            `"${l.id}","${l.name}","${l.phone}","${l.role}","${l.teamName}","${l.preferredSport}","${l.preferredSlot}","${l.status}","${l.totalBookings}","${l.notes || ''}","${l.createdAt}"`
        )
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `turf_crm_leads_${Date.now()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        if (addToast) addToast('CRM contacts exported to CSV!', 'success')
    }

    // Filter Logic
    const filteredLeads = leads.filter(lead => {
        const matchesTab = activeTab === 'all' || lead.role === activeTab
        const matchesSearch = 
            lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.phone?.includes(searchQuery) ||
            lead.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesTab && matchesSearch
    })

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
                        Manage your Captains, Players, Umpires & Tournament Organizers. Send 1-click WhatsApp broadcasts to fill empty slots!
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
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                        <HiPlus className="w-4 h-4" />
                        <span>Add New Lead</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Total Leads</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{leads.length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Teams & Captains</div>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{leads.filter(l => l.role === 'team').length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Registered Umpires</div>
                    <div className="text-2xl font-black text-amber-600 mt-1">{leads.filter(l => l.role === 'umpire').length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Organizers & Players</div>
                    <div className="text-2xl font-black text-sky-600 mt-1">{leads.filter(l => l.role === 'organizer' || l.role === 'player').length}</div>
                </div>
            </div>

            {/* Controls Bar: Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                {/* Tabs */}
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
                            className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all cursor-pointer ${activeTab === tab.id ? 'bg-white text-[#16A34A] shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                    <HiSearch className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name, phone, team..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white"
                    />
                </div>
            </div>

            {/* CRM Leads Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[10px]">
                            <tr>
                                <th className="py-3.5 px-4">Contact / Name</th>
                                <th className="py-3.5 px-4">Category</th>
                                <th className="py-3.5 px-4">Team / Organization</th>
                                <th className="py-3.5 px-4">Slot Preference</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4">Bookings</th>
                                <th className="py-3.5 px-4 text-right">WhatsApp Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-slate-400 font-bold">
                                        No leads found matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-slate-900">
                                            <div>{lead.name}</div>
                                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                                <HiPhone className="w-3 h-3 text-emerald-600" />
                                                <span>{lead.phone}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${roleBadge(lead.role)}`}>
                                                {lead.role}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                                            {lead.teamName || '—'}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600">
                                            {lead.preferredSlot || 'Any Time'}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                                                {lead.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                                            {lead.totalBookings || 0} matches
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenBroadcast(lead)}
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD LEAD MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Add New CRM Lead / Contact</h3>
                        
                        <form onSubmit={handleAddLead} className="space-y-3 text-xs">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Full Name</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    required
                                    placeholder="e.g. Vikram Malhotra"
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

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Lead Category</label>
                                    <select
                                        value={formRole}
                                        onChange={(e) => setFormRole(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 outline-none focus:border-[#16A34A]"
                                    >
                                        <option value="team">🏏 Team / Captain</option>
                                        <option value="player">⚡ Player</option>
                                        <option value="umpire">🚩 Umpire / Referee</option>
                                        <option value="organizer">🏆 Tournament Org</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Team / Organization</label>
                                    <input
                                        type="text"
                                        value={formTeamName}
                                        onChange={(e) => setFormTeamName(e.target.value)}
                                        placeholder="Team Name"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 outline-none focus:border-[#16A34A]"
                                    />
                                </div>
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
                onClose={() => setIsBroadcastModalOpen(false)}
                selectedLead={selectedLeadForBroadcast}
            />
        </div>
    )
}
