import React, { useState, useEffect } from 'react'
import { HiShieldCheck, HiSearch, HiPaperAirplane, HiDownload, HiFilter, HiPhone, HiGlobeAlt } from 'react-icons/hi'
import { getCrmLeads } from '../../services/crmService'
import OfferBroadcastModal from '../../components/crm/OfferBroadcastModal'
import { useToast } from '../../components/ui/Toast'

export default function SuperAdminGlobalCRMPage() {
    const [leads, setLeads] = useState([])
    const [selectedBranch, setSelectedBranch] = useState('all')
    const [selectedRole, setSelectedRole] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false)
    const [selectedLeadForBroadcast, setSelectedLeadForBroadcast] = useState(null)
    const { addToast } = useToast()

    useEffect(() => {
        setLeads(getCrmLeads())
    }, [])

    const handleOpenBroadcast = (lead) => {
        setSelectedLeadForBroadcast(lead)
        setIsBroadcastModalOpen(true)
    }

    const handleExportMasterCSV = () => {
        const headers = ['ID,Name,Phone,Role,Team Name,Turf Branch,Preferred Slot,Status,Total Bookings,Created Date']
        const rows = filteredLeads.map(l => 
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
        if (addToast) addToast('Master Platform CRM exported to CSV!', 'success')
    }

    const branches = ['all', ...new Set(leads.map(l => l.turfBranch))]

    const filteredLeads = leads.filter(lead => {
        const matchesBranch = selectedBranch === 'all' || lead.turfBranch === selectedBranch
        const matchesRole = selectedRole === 'all' || lead.role === selectedRole
        const matchesSearch = 
            lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.phone?.includes(searchQuery) ||
            lead.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesBranch && matchesRole && matchesSearch
    })

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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Total Registered Contacts</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{leads.length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Total Teams & Captains</div>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{leads.filter(l => l.role === 'team').length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Active Umpires</div>
                    <div className="text-2xl font-black text-amber-600 mt-1">{leads.filter(l => l.role === 'umpire').length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Active Venues</div>
                    <div className="text-2xl font-black text-purple-600 mt-1">{branches.length - 1 || 1}</div>
                </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="grid sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Filter by Venue / Branch</label>
                    <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#16A34A]"
                    >
                        {branches.map(b => (
                            <option key={b} value={b}>{b === 'all' ? '🌐 All Turf Branches' : b}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Filter by Category</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#16A34A]"
                    >
                        <option value="all">👥 All Roles</option>
                        <option value="team">🏏 Teams / Captains</option>
                        <option value="player">⚡ Players</option>
                        <option value="umpire">🚩 Umpires / Referees</option>
                        <option value="organizer">🏆 Tournament Organizers</option>
                    </select>
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Search Contacts</label>
                    <div className="relative">
                        <HiSearch className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search name, phone, team..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#16A34A]"
                        />
                    </div>
                </div>
            </div>

            {/* Master Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[10px]">
                            <tr>
                                <th className="py-3.5 px-4">Contact / Name</th>
                                <th className="py-3.5 px-4">Category</th>
                                <th className="py-3.5 px-4">Turf Branch</th>
                                <th className="py-3.5 px-4">Team / Details</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-right">SuperAdmin Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-3.5 px-4 font-bold text-slate-900">
                                        <div>{lead.name}</div>
                                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                            <HiPhone className="w-3 h-3 text-emerald-600" />
                                            <span>{lead.phone}</span>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-300">
                                            {lead.role}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-emerald-700">
                                        {lead.turfBranch}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-600">
                                        {lead.teamName || '—'}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <button
                                            onClick={() => handleOpenBroadcast(lead)}
                                            className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[11px] shadow-sm cursor-pointer flex items-center gap-1 transition-all ml-auto"
                                        >
                                            <HiPaperAirplane className="w-3 h-3 rotate-90" />
                                            <span>Global Broadcast</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BROADCAST OFFER MODAL */}
            <OfferBroadcastModal
                isOpen={isBroadcastModalOpen}
                onClose={() => setIsBroadcastModalOpen(false)}
                selectedLead={selectedLeadForBroadcast}
            />
        </div>
    )
}
