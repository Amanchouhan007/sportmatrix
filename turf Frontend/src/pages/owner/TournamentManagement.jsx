import { useState, useEffect } from 'react'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import BracketComponent from '../../components/ui/BracketComponent'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { HiPlus, HiCalendar, HiCurrencyRupee, HiUsers, HiLightningBolt } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'

const initialTournaments = [
    { id: 1, name: 'Premier Cricket Cup', sport: 'Cricket', date: 'Mar 15, 2026', entryFee: '500', prize: '₹50,000', teams: '12/16', status: 'Active', registrations: 12, maxTeams: 16 },
    { id: 2, name: 'Indore Football Cup', sport: 'Football', date: 'Mar 22, 2026', entryFee: '800', prize: '₹30,000', teams: '6/8', status: 'Upcoming', registrations: 6, maxTeams: 8 },
    { id: 3, name: 'Badminton Open Arena', sport: 'Badminton', date: 'Feb 28, 2026', entryFee: '300', prize: '₹15,000', teams: '16/16', status: 'Completed', registrations: 16, maxTeams: 16 },
]

const bracketRounds = [
    {
        name: 'Semi-Finals',
        matches: [
            { id: 1, teams: [{ seed: 1, name: 'Indore Thunders', score: 145, winner: true }, { seed: 4, name: 'Warriors XI', score: 122 }] },
            { id: 2, teams: [{ seed: 2, name: 'Royal Challengers', score: 156, winner: true }, { seed: 3, name: 'Super Kings', score: 148 }] },
        ]
    },
    {
        name: 'Grand Finale',
        matches: [
            { id: 3, teams: [{ seed: 1, name: 'Indore Thunders', score: '—' }, { seed: 2, name: 'Royal Challengers', score: '—' }] }
        ]
    },
]

export default function TournamentManagement() {
    const { addToast } = useToast()
    const [tournaments, setTournaments] = useState(initialTournaments)
    const [modal, setModal] = useState(false)

    // Create new tournament state
    const [newTourney, setNewTourney] = useState({
        name: '',
        sport: 'Cricket',
        entryFee: '',
        prize: '',
        maxTeams: '16',
        date: ''
    })

    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' })

    const handleDeleteTournament = () => {
        setTournaments(prev => prev.filter(t => t.id !== deleteConfirm.id))
        setDeleteConfirm({ open: false, id: null, name: '' })
        addToast({ title: 'Tournament Deleted', message: `${deleteConfirm.name} has been removed`, type: 'success' })
    }

    const handleCreateTournament = () => {
        if (!newTourney.name || !newTourney.entryFee || !newTourney.prize || !newTourney.date) {
            addToast({ title: 'Missing parameters', message: 'Ensure all parameters are configured for setup', type: 'error' })
            return
        }

        const nextId = tournaments.length + 1
        setTournaments([...tournaments, {
            id: nextId,
            name: newTourney.name,
            sport: newTourney.sport,
            date: newTourney.date,
            entryFee: newTourney.entryFee,
            prize: '₹' + Number(newTourney.prize).toLocaleString(),
            teams: `0/${newTourney.maxTeams}`,
            registrations: 0,
            maxTeams: Number(newTourney.maxTeams),
            status: 'Upcoming'
        }])
        setModal(false)
        addToast({ title: 'Tournament Created', message: `${newTourney.name} registered for season`, type: 'success' })
    }

    const columns = [
        { key: 'name', label: 'Tournament Title' },
        { key: 'sport', label: 'Sport' },
        { key: 'date', label: 'Date' },
        { key: 'prize', label: 'Prize Pool' },
        {
            key: 'teams',
            label: 'Slots Filled',
            render: (_, r) => {
                const pct = Math.round((r.registrations / r.maxTeams) * 100)
                return (
                    <div className="flex items-center gap-2 text-xs">
                        <span className="font-extrabold text-surface-850">{r.teams}</span>
                        <div className="w-16 h-1.5 bg-surface-100 rounded-full overflow-hidden hidden sm:block">
                            <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                )
            }
        },
        {
            key: 'status',
            label: 'Status',
            render: v => <Badge variant={v === 'Active' ? 'success' : v === 'Upcoming' ? 'warning' : 'default'} dot>{v}</Badge>
        },
        { 
            key: 'action', 
            label: '', 
            render: (_, r) => (
                <div className="flex justify-end">
                    <button 
                        onClick={() => setDeleteConfirm({ open: true, id: r.id, name: r.name })} 
                        className="p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
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
                        Tournament & Bracket Setup
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Coordinate registrations, publish entry fees, and view live interactive match trees</p>
                </div>
                <Button onClick={() => setModal(true)} className="shadow-lg shadow-primary-500/10 cursor-pointer">
                    <HiPlus className="w-5 h-5 mr-1" /> Create Tournament
                </Button>
            </div>

            {/* List Table */}
            <Card className="p-6">
                <DataTable columns={columns} data={tournaments} />
            </Card>

            {/* Dynamic Bracket Viewer */}
            <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft space-y-6">
                <div className="flex items-center justify-between border-b border-surface-100 pb-4">
                    <div>
                        <h2 className="text-base font-black text-surface-900 tracking-tight flex items-center gap-1.5">
                            <HiTrophy className="text-amber-500" /> Active Playoffs Bracket
                        </h2>
                        <p className="text-surface-500 text-xs mt-0.5">Live play-by-play seed tracker : Indore Premier League</p>
                    </div>
                    <Badge variant="success">LIVE MATCH TREE</Badge>
                </div>

                {/* Visual node representation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold">
                    {bracketRounds.map((round) => (
                        <div key={round.name} className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-surface-400 tracking-wider text-center bg-surface-50 py-2 rounded-xl border border-surface-200">{round.name}</h4>
                            <div className="space-y-4">
                                {round.matches.map((match) => (
                                    <div key={match.id} className="bg-white border border-surface-200 rounded-2xl p-4 shadow-soft hover:shadow-soft-md transition-all space-y-2">
                                        {match.teams.map((t, idx) => (
                                            <div key={idx} className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] bg-surface-100 text-surface-400 font-extrabold w-5 h-5 rounded-lg flex items-center justify-center">#{t.seed}</span>
                                                    <span className={`font-black ${t.winner ? 'text-emerald-700' : 'text-surface-700'}`}>{t.name}</span>
                                                </div>
                                                <span className={`font-extrabold ${t.winner ? 'text-emerald-600' : 'text-surface-400'}`}>{t.score}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Tourney Modal */}
            <Modal isOpen={modal} onClose={() => setModal(false)} title="Register Playoff Tournament" size="md">
                <div className="space-y-4 animate-in fade-in">
                    <Input
                        label="Tournament Name"
                        placeholder="e.g. Indore Badminton Open"
                        value={newTourney.name}
                        onChange={(e) => setNewTourney({ ...newTourney, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Sport Category"
                            value={newTourney.sport}
                            onChange={(e) => setNewTourney({ ...newTourney, sport: e.target.value })}
                            options={[
                                { value: 'Cricket', label: 'Cricket' },
                                { value: 'Football', label: 'Football' },
                                { value: 'Badminton', label: 'Badminton' },
                            ]}
                        />
                        <Input
                            label="Entry Fee per Team (₹)"
                            type="number"
                            placeholder="e.g. 500"
                            value={newTourney.entryFee}
                            onChange={(e) => setNewTourney({ ...newTourney, entryFee: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Grand Prize Pool (₹)"
                            type="number"
                            placeholder="e.g. 50000"
                            value={newTourney.prize}
                            onChange={(e) => setNewTourney({ ...newTourney, prize: e.target.value })}
                        />
                        <Input
                            label="Max Registered Teams"
                            type="number"
                            placeholder="e.g. 16"
                            value={newTourney.maxTeams}
                            onChange={(e) => setNewTourney({ ...newTourney, maxTeams: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Start Date"
                        type="date"
                        value={newTourney.date}
                        onChange={(e) => setNewTourney({ ...newTourney, date: e.target.value })}
                    />

                    <div className="flex gap-3 justify-end pt-4 border-t border-surface-100 mt-6">
                        <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
                        <Button onClick={handleCreateTournament}>Create Tournament</Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
                onConfirm={handleDeleteTournament}
                title="Delete Tournament"
                message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    )
}
