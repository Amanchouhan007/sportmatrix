import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { HiCheck, HiX, HiExclamationCircle, HiClock, HiCalendar, HiCurrencyRupee } from 'react-icons/hi'

const mockPendingTournaments = [
    { 
        id: 't_002', 
        title: 'Indore Football Cup', 
        sport: 'Football', 
        createdBy: 'Amit Kumar (Staff)', 
        startDate: '2026-03-22', 
        endDate: '2026-03-25', 
        date: 'Mar 22 - Mar 25, 2026', 
        entryFee: '800', 
        prizePool: '30000', 
        maxTeams: 8, 
        format: 'League', 
        status: 'Pending Approval',
        description: '5-a-side football tournament under floodlights.'
    },
    { 
        id: 't_005', 
        title: 'Central Zone Badminton Clash', 
        sport: 'Badminton', 
        createdBy: 'Amit Kumar (Staff)', 
        startDate: '2026-04-05', 
        endDate: '2026-04-07', 
        date: 'Apr 05 - Apr 07, 2026', 
        entryFee: '400', 
        prizePool: '20000', 
        maxTeams: 16, 
        format: 'Knockout', 
        status: 'Pending Approval',
        description: 'Singles badminton tournament.'
    }
]

export default function TournamentPendingPage({ role = 'owner' }) {
    const { addToast } = useToast()
    const [pendingList, setPendingList] = useState(mockPendingTournaments)
    const [selectedTourney, setSelectedTourney] = useState(null)
    const [remarks, setRemarks] = useState('')

    const handleApprove = (t) => {
        setPendingList(prev => prev.filter(item => item.id !== t.id))
        setSelectedTourney(null)
        addToast({ 
            title: 'Tournament Approved!', 
            message: `"${t.title}" is now Approved & Public. Turf slots automatically blocked.`, 
            type: 'success' 
        })
    }

    const handleReject = (t) => {
        if (!remarks) {
            addToast({ title: 'Remarks Required', message: 'Please enter remarks for rejection.', type: 'error' })
            return
        }
        setPendingList(prev => prev.filter(item => item.id !== t.id))
        setSelectedTourney(null)
        setRemarks('')
        addToast({ 
            title: 'Tournament Rejected', 
            message: `"${t.title}" has been rejected with remarks.`, 
            type: 'warning' 
        })
    }

    const columns = [
        { 
            key: 'title', 
            label: 'Tournament Title',
            render: (_, r) => (
                <div>
                    <div className="font-extrabold text-surface-900">{r.title}</div>
                    <div className="text-[11px] text-surface-400 font-medium">Created by {r.createdBy}</div>
                </div>
            ) 
        },
        { key: 'sport', label: 'Sport' },
        { key: 'date', label: 'Dates' },
        { 
            key: 'entryFee', 
            label: 'Entry Fee & Prize',
            render: (_, r) => (
                <div className="text-xs">
                    <span className="font-bold text-surface-700">₹{r.entryFee} / team</span>
                    <div className="text-emerald-600 font-bold">₹{Number(r.prizePool).toLocaleString()} Prize</div>
                </div>
            )
        },
        { key: 'format', label: 'Format' },
        {
            key: 'status',
            label: 'Status',
            render: () => <Badge variant="warning" dot>Pending Approval</Badge>
        },
        { 
            key: 'action', 
            label: 'Action', 
            render: (_, r) => (
                <Button 
                    size="sm" 
                    onClick={() => { setSelectedTourney(r); setRemarks(''); }}
                >
                    Review & Decide
                </Button>
            ) 
        },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        <HiExclamationCircle className="text-amber-500" /> Pending Tournament Approvals
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Review staff submitted tournaments before publishing and auto-locking turf slots</p>
                </div>
            </div>

            {/* List Table */}
            <Card className="p-6">
                {pendingList.length > 0 ? (
                    <DataTable columns={columns} data={pendingList} />
                ) : (
                    <div className="py-12 text-center text-surface-400 text-sm space-y-2">
                        <HiCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                        <p className="font-bold text-surface-700">No Pending Approvals</p>
                        <p className="text-xs text-surface-400">All submitted tournaments have been reviewed.</p>
                    </div>
                )}
            </Card>

            {/* Review Modal */}
            <Modal isOpen={!!selectedTourney} onClose={() => setSelectedTourney(null)} title="Review Tournament Approval" size="md">
                {selectedTourney && (
                    <div className="space-y-4">
                        <div className="bg-surface-50 p-4 rounded-2xl border border-surface-200 space-y-2">
                            <h3 className="font-extrabold text-surface-900 text-base">{selectedTourney.title}</h3>
                            <p className="text-xs text-surface-500">{selectedTourney.description}</p>
                            
                            <div className="text-xs text-surface-700 grid grid-cols-2 gap-2 pt-2 border-t border-surface-200">
                                <div><span className="font-bold">Sport:</span> {selectedTourney.sport}</div>
                                <div><span className="font-bold">Format:</span> {selectedTourney.format}</div>
                                <div><span className="font-bold">Dates:</span> {selectedTourney.date}</div>
                                <div><span className="font-bold">Max Teams:</span> {selectedTourney.maxTeams}</div>
                                <div><span className="font-bold">Entry Fee:</span> ₹{selectedTourney.entryFee}</div>
                                <div><span className="font-bold">Prize Pool:</span> ₹{Number(selectedTourney.prizePool).toLocaleString()}</div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-surface-700 mb-1">Owner Remarks (Mandatory for rejection)</label>
                            <textarea
                                rows="3"
                                placeholder="Enter remarks..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full p-3 text-xs bg-white border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        {role === 'owner' ? (
                            <div className="flex gap-3 justify-end pt-4 border-t border-surface-100">
                                <Button variant="danger" onClick={() => handleReject(selectedTourney)}>
                                    Reject Tournament
                                </Button>
                                <Button onClick={() => handleApprove(selectedTourney)}>
                                    Approve & Lock Turf Slots
                                </Button>
                            </div>
                        ) : (
                            <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-xs font-bold">
                                Only the Owner (Admin) can approve or reject tournaments.
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    )
}
