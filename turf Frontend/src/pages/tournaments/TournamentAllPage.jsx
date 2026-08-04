import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { HiPlus, HiSearch, HiTrash, HiCheck, HiX, HiEye, HiPencil, HiCheckCircle } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'

const initialTournaments = [
    { id: 't_001', title: 'Premier Cricket Cup', sport: 'Cricket', startDate: '2026-03-15', endDate: '2026-03-20', date: 'Mar 15 - Mar 20, 2026', entryFee: '500', prizePool: '50000', prize: '₹50,000', teams: '12/16', registrations: 12, maxTeams: 16, status: 'Approved', format: 'Knockout' },
    { id: 't_002', title: 'Indore Football Cup', sport: 'Football', startDate: '2026-03-22', endDate: '2026-03-25', date: 'Mar 22 - Mar 25, 2026', entryFee: '800', prizePool: '30000', prize: '₹30,000', teams: '6/8', registrations: 6, maxTeams: 8, status: 'Pending Approval', format: 'League' },
    { id: 't_003', title: 'Badminton Open Arena', sport: 'Badminton', startDate: '2026-02-28', endDate: '2026-03-02', date: 'Feb 28 - Mar 02, 2026', entryFee: '300', prizePool: '15000', prize: '₹15,000', teams: '16/16', registrations: 16, maxTeams: 16, status: 'Completed', format: 'League + Knockout' },
    { id: 't_004', title: 'Monsoon Futsal League', sport: 'Football', startDate: '2026-04-10', endDate: '2026-04-12', date: 'Apr 10 - Apr 12, 2026', entryFee: '600', prizePool: '20000', prize: '₹20,000', teams: '4/12', registrations: 4, maxTeams: 12, status: 'Draft', format: 'Knockout' },
]

export default function TournamentAllPage({ role = 'owner' }) {
    const { addToast } = useToast()
    const [tournaments, setTournaments] = useState(initialTournaments)
    const [activeTab, setActiveTab] = useState('ALL')
    const [searchTerm, setSearchTerm] = useState('')
    
    // Approval & Rejection Modal
    const [reviewModal, setReviewModal] = useState({ open: false, tournament: null, remarks: '' })
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, title: '' })

    const basePath = role === 'staff' ? '/staff/tournaments' : '/admin/tournaments'

    const handleApprove = (t, remarks = 'Approved by Owner') => {
        setTournaments(prev => prev.map(item => item.id === t.id ? { ...item, status: 'Approved', ownerRemarks: remarks } : item))
        setReviewModal({ open: false, tournament: null, remarks: '' })
        addToast({ title: 'Tournament Approved!', message: `${t.title} is now public & match slots are locked on turf.`, type: 'success' })
    }

    const handleReject = (t, remarks) => {
        if (!remarks) {
            addToast({ title: 'Remarks required', message: 'Please provide rejection remarks', type: 'error' })
            return
        }
        setTournaments(prev => prev.map(item => item.id === t.id ? { ...item, status: 'Rejected', ownerRemarks: remarks } : item))
        setReviewModal({ open: false, tournament: null, remarks: '' })
        addToast({ title: 'Tournament Rejected', message: `${t.title} has been rejected.`, type: 'warning' })
    }

    const handleDelete = () => {
        setTournaments(prev => prev.filter(t => t.id !== deleteConfirm.id))
        setDeleteConfirm({ open: false, id: null, title: '' })
        addToast({ title: 'Tournament Deleted', message: `Tournament has been removed`, type: 'success' })
    }

    const filteredTournaments = tournaments.filter(t => {
        const matchesTab = activeTab === 'ALL' || t.status.toUpperCase() === activeTab.replace('_', ' ')
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.sport.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesTab && matchesSearch
    })

    const columns = [
        { 
            key: 'title', 
            label: 'Tournament Name',
            render: (_, r) => (
                <div>
                    <div className="font-extrabold text-surface-900">{r.title}</div>
                    <div className="text-[11px] text-surface-400 font-medium">{r.format} Format &bull; {r.sport}</div>
                </div>
            ) 
        },
        { key: 'date', label: 'Dates' },
        { 
            key: 'entryFee', 
            label: 'Entry Fee & Prize',
            render: (_, r) => (
                <div className="text-xs">
                    <span className="font-bold text-surface-700">₹{r.entryFee} / team</span>
                    <div className="text-emerald-600 font-bold">{r.prize} Prize</div>
                </div>
            )
        },
        {
            key: 'teams',
            label: 'Teams Registered',
            render: (_, r) => {
                const pct = Math.round((r.registrations / r.maxTeams) * 100)
                return (
                    <div className="flex items-center gap-2 text-xs">
                        <span className="font-extrabold text-surface-850">{r.teams}</span>
                        <div className="w-16 h-1.5 bg-surface-100 rounded-full overflow-hidden hidden sm:block">
                            <div className="h-full bg-primary-500" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                )
            }
        },
        {
            key: 'status',
            label: 'Approval Status',
            render: v => {
                let badgeVariant = 'default'
                if (v === 'Approved' || v === 'Active') badgeVariant = 'success'
                else if (v === 'Pending Approval') badgeVariant = 'warning'
                else if (v === 'Rejected' || v === 'Cancelled') badgeVariant = 'danger'
                return <Badge variant={badgeVariant} dot>{v}</Badge>
            }
        },
        { 
            key: 'action', 
            label: 'Actions', 
            render: (_, r) => (
                <div className="flex justify-end gap-1.5">
                    {r.status === 'Pending Approval' && role === 'owner' && (
                        <button 
                            onClick={() => setReviewModal({ open: true, tournament: r, remarks: '' })} 
                            className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                        >
                            Review
                        </button>
                    )}

                    {role === 'owner' && (
                        <button 
                            onClick={() => setDeleteConfirm({ open: true, id: r.id, title: r.title })} 
                            className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Tournament"
                        >
                            <HiTrash className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ) 
        },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        All Tournaments
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Browse, review, and manage all scheduled and ongoing tournaments</p>
                </div>
                <Link to={`${basePath}/create`}>
                    <Button className="shadow-lg shadow-primary-500/10 cursor-pointer">
                        <HiPlus className="w-5 h-5 mr-1" /> Create Tournament
                    </Button>
                </Link>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1">
                    {['ALL', 'APPROVED', 'PENDING_APPROVAL', 'DRAFT', 'COMPLETED', 'REJECTED'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                                activeTab === tab
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-100'
                            }`}
                        >
                            {tab.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <HiSearch className="absolute left-3 top-3 text-surface-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search tournament..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 text-xs bg-white border border-surface-200 rounded-xl outline-none w-full focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            {/* Table */}
            <Card className="p-6">
                <DataTable columns={columns} data={filteredTournaments} />
            </Card>

            {/* Review Approval Modal */}
            <Modal isOpen={reviewModal.open} onClose={() => setReviewModal({ open: false, tournament: null, remarks: '' })} title="Review Tournament Approval" size="md">
                {reviewModal.tournament && (
                    <div className="space-y-4">
                        <div className="bg-surface-50 p-4 rounded-2xl border border-surface-200 space-y-2">
                            <h3 className="font-extrabold text-surface-900 text-base">{reviewModal.tournament.title}</h3>
                            <div className="text-xs text-surface-600 grid grid-cols-2 gap-2">
                                <div><span className="font-bold">Sport:</span> {reviewModal.tournament.sport}</div>
                                <div><span className="font-bold">Format:</span> {reviewModal.tournament.format}</div>
                                <div><span className="font-bold">Entry Fee:</span> ₹{reviewModal.tournament.entryFee}</div>
                                <div><span className="font-bold">Prize Pool:</span> {reviewModal.tournament.prize}</div>
                                <div><span className="font-bold">Dates:</span> {reviewModal.tournament.date}</div>
                                <div><span className="font-bold">Max Teams:</span> {reviewModal.tournament.maxTeams}</div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-surface-700 mb-1">Owner Remarks (Optional for approval, mandatory for rejection)</label>
                            <textarea
                                rows="3"
                                placeholder="Add any comments or instructions..."
                                value={reviewModal.remarks}
                                onChange={(e) => setReviewModal({ ...reviewModal, remarks: e.target.value })}
                                className="w-full p-3 text-xs bg-white border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-surface-100">
                            <Button 
                                variant="danger" 
                                onClick={() => handleReject(reviewModal.tournament, reviewModal.remarks)}
                            >
                                Reject Tournament
                            </Button>
                            <Button 
                                onClick={() => handleApprove(reviewModal.tournament, reviewModal.remarks)}
                            >
                                Approve & Lock Turf Slots
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null, title: '' })}
                onConfirm={handleDelete}
                title="Delete Tournament"
                message={`Are you sure you want to delete "${deleteConfirm.title}"? This cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    )
}
