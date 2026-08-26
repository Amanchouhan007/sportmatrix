import { useState, useEffect } from 'react'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { HiUserGroup, HiPhone, HiMail, HiCheckCircle, HiXCircle, HiEye, HiCurrencyRupee } from 'react-icons/hi'
import api from '../../services/api'

export default function TournamentRegistrationsPage() {
    const { addToast } = useToast()
    const [teams, setTeams] = useState([])
    const [viewRosterModal, setViewRosterModal] = useState({ open: false, team: null })

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await api.get('/tournaments/teams')
                const list = res.data || (Array.isArray(res) ? res : [])
                setTeams(Array.isArray(list) ? list : [])
            } catch (err) {
                console.warn('Error fetching teams:', err)
                setTeams([])
            }
        }
        fetchTeams()
    }, [])

    const handleUpdateStatus = async (teamId, newStatus) => {
        try {
            await api.put(`/tournaments/teams/${teamId}/status`, { status: newStatus.toUpperCase() });
            setTeams(teams.map(t => t.id === teamId ? { ...t, status: newStatus } : t))
            addToast({ title: 'Status Updated', message: `Team status changed to ${newStatus}.`, type: 'success' })
        } catch (err) {
            addToast({ title: 'Update Failed', message: err.message || 'Could not update team status.', type: 'error' })
        }
    }

    const columns = [
        {
            key: 'teamName',
            label: 'Team Name',
            render: (_, r) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-lg font-black">
                        {r.logo || '🛡️'}
                    </div>
                    <div>
                        <div className="font-extrabold text-surface-900">{r.teamName}</div>
                        <div className="text-[11px] text-surface-400 font-medium">{r.tournamentTitle}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'captainName',
            label: 'Captain Info',
            render: (_, r) => (
                <div className="text-xs">
                    <div className="font-bold text-surface-800">{r.captainName}</div>
                    <div className="text-surface-400 flex items-center gap-1 mt-0.5"><HiPhone className="w-3 h-3" /> {r.captainMobile}</div>
                </div>
            )
        },
        {
            key: 'paymentStatus',
            label: 'Payment',
            render: (_, r) => (
                <div className="text-xs">
                    <Badge variant={r.paymentStatus === 'PAID' ? 'success' : 'warning'}>{r.paymentStatus}</Badge>
                    <div className="text-[10px] text-surface-400 font-bold mt-0.5">₹{r.amount} via {r.paymentMethod}</div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Registration Status',
            render: v => <Badge variant={v === 'Approved' ? 'success' : v === 'Pending' ? 'warning' : 'danger'} dot>{v}</Badge>
        },
        {
            key: 'action',
            label: 'Action',
            render: (_, r) => (
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setViewRosterModal({ open: true, team: r })}>
                        <HiEye className="w-4 h-4 mr-1" /> Roster ({r.players?.length || 0})
                    </Button>

                    {r.status === 'Pending' && (
                        <>
                            <button
                                onClick={() => handleUpdateStatus(r.id, 'Approved')}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer font-bold text-xs flex items-center"
                                title="Approve Registration"
                            >
                                <HiCheckCircle className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(r.id, 'Rejected')}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer font-bold text-xs flex items-center"
                                title="Reject Registration"
                            >
                                <HiXCircle className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        <HiUserGroup className="text-primary-600" /> Team Registrations & Player Rosters
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Verify team registrations, review player rosters, and approve entries</p>
                </div>
            </div>

            {/* Datatable */}
            <Card className="p-6">
                <DataTable columns={columns} data={teams} />
            </Card>

            {/* Roster View Modal */}
            <Modal isOpen={viewRosterModal.open} onClose={() => setViewRosterModal({ open: false, team: null })} title="Team Player Roster" size="md">
                {viewRosterModal.team && (
                    <div className="space-y-4">
                        <div className="bg-surface-50 p-4 rounded-2xl border border-surface-200 flex items-center justify-between">
                            <div>
                                <h3 className="font-extrabold text-surface-900 text-base">{viewRosterModal.team.teamName}</h3>
                                <p className="text-xs text-surface-500">Captain: {viewRosterModal.team.captainName} ({viewRosterModal.team.captainMobile})</p>
                            </div>
                            <Badge variant="success">Jersey: {viewRosterModal.team.jerseyColor}</Badge>
                        </div>

                        <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-surface-400 mb-2">Registered Player Roster</h4>
                            <div className="divide-y divide-surface-100 border border-surface-200 rounded-xl overflow-hidden">
                                {viewRosterModal.team.players?.map((p, idx) => (
                                    <div key={idx} className="p-3 bg-white flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-lg bg-surface-100 font-black text-surface-600 flex items-center justify-center text-[10px]">
                                                #{p.jerseyNumber}
                                            </span>
                                            <span className="font-bold text-surface-900">{p.name}</span>
                                        </div>
                                        <span className="font-medium text-surface-400">{p.role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-3">
                            <Button variant="secondary" onClick={() => setViewRosterModal({ open: false, team: null })}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
