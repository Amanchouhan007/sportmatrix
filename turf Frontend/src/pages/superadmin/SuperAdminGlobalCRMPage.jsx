import React, { useState, useEffect } from 'react'
import { HiShieldCheck, HiSearch, HiPaperAirplane, HiDownload, HiFilter, HiPhone, HiGlobeAlt } from 'react-icons/hi'
import { getCrmLeads } from '../../services/crmService'
import OfferBroadcastModal from '../../components/crm/OfferBroadcastModal'
import { useToast } from '../../components/ui/Toast'
import CustomSelect from '../../components/ui/CustomSelect'

export default function SuperAdminGlobalCRMPage() {
    const [leads, setLeads] = useState([])
    const [selectedBranch, setSelectedBranch] = useState('all')
    const [selectedRole, setSelectedRole] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedLeadIds, setSelectedLeadIds] = useState([])
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false)
    const [selectedLeadForBroadcast, setSelectedLeadForBroadcast] = useState(null)
    const [selectedLeadsForBroadcast, setSelectedLeadsForBroadcast] = useState([])
    const { addToast } = useToast()

    useEffect(() => {
        setLeads(getCrmLeads())
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
        const matchesSearch = 
            lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.phone?.includes(searchQuery) ||
            lead.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesBranch && matchesRole && matchesSearch
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Total Registered Contacts</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{filteredLeads.length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-[10px] font-black uppercase text-slate-400">Total Teams & Captains</div>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{filteredLeads.filter(l => l.role === 'team').length}</div>
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
            <div className="grid sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
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
                            { value: 'team', label: '🏏 Teams / Captains' },
                            { value: 'player', label: '⚡ Players' },
                            { value: 'umpire', label: '🚩 Umpires / Referees' },
                            { value: 'organizer', label: '🏆 Tournament Organizers' }
                        ]}
                    />
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
                                <th className="py-3.5 px-4">Contact / Name</th>
                                <th className="py-3.5 px-4">Category</th>
                                <th className="py-3.5 px-4">Turf Branch</th>
                                <th className="py-3.5 px-4">Booking Time / Slot</th>
                                <th className="py-3.5 px-4">Team / Details</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-right">SuperAdmin Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                            {filteredLeads.map((lead) => {
                                const isSelected = selectedLeadIds.includes(lead.id)
                                return (
                                    <tr key={lead.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}>
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
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-300">
                                                {lead.role === 'team' ? 'Captain / Team' : lead.role === 'organizer' ? 'Tournament Org' : lead.role}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-emerald-700">
                                            {lead.turfBranch}
                                        </td>
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                                <span className="text-emerald-600">⏰</span>
                                                <span className="font-mono text-slate-800">{lead.preferredSlot || '6:00 PM (Today)'}</span>
                                            </div>
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
        </div>
    )
}

