import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import CustomSelect from '../../components/ui/CustomSelect'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import { useToast } from '../../components/ui/Toast'

// Initial data for demonstration
const initialTournaments = [
    { 
        id: 'TRN-001', 
        name: 'Premier Cricket League', 
        sport: 'Cricket', 
        venue: 'SportMatrix Arena, Mumbai',
        date: 'Mar 15', 
        totalMatches: 8, 
        activeNow: 2, 
        status: 'Live',
        teams: ['Avengers', 'Warriors', 'Knights', 'Royals'],
        schedule: 'Mar 15 - Mar 30, 2026',
        officials: ['Umpire: Rajesh P.', 'Referee: Sunil K.', 'Scorer: Amit T.'],
        matches: [
            { id: 'M-1', teamA: 'Avengers', teamB: 'Warriors', score: '145/2 - 120/4', status: 'Live', time: '10:00 AM' },
            { id: 'M-2', teamA: 'Knights', teamB: 'Royals', score: '0/0 - 0/0', status: 'Scheduled', time: '02:00 PM' },
            { id: 'M-3', teamA: 'Avengers', teamB: 'Knights', score: '180/5 - 175/8', status: 'Completed', time: '10:00 AM' },
            { id: 'M-4', teamA: 'Warriors', teamB: 'Royals', score: '—', status: 'Scheduled', time: '04:00 PM' },
        ]
    },
    { 
        id: 'TRN-002', 
        name: 'Football Cup', 
        sport: 'Football', 
        venue: 'Green Field Ground, Pune',
        date: 'Mar 22', 
        totalMatches: 4, 
        activeNow: 0, 
        status: 'Upcoming',
        teams: ['Strikers FC', 'Goal Getters', 'Thunder XI', 'Blue Hawks'],
        schedule: 'Mar 22 - Mar 28, 2026',
        officials: ['Referee: Mohan S.', 'Linesman: Vikas D.'],
        matches: [
            { id: 'M-5', teamA: 'Strikers FC', teamB: 'Goal Getters', score: '—', status: 'Scheduled', time: '09:00 AM' },
            { id: 'M-6', teamA: 'Thunder XI', teamB: 'Blue Hawks', score: '—', status: 'Scheduled', time: '11:00 AM' },
        ]
    },
]

export default function StaffTournaments() {
    const { addToast } = useToast()
    const [tournaments, setTournaments] = useState(initialTournaments)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [selectedTournament, setSelectedTournament] = useState(null)

    // Form states
    const [newTournament, setNewTournament] = useState({
        name: '', sport: '', date: '', totalMatches: ''
    })

    const handleUpdateStatus = (tournamentId, newStatus) => {
        setTournaments(prev => prev.map(t => 
            t.id === tournamentId ? { ...t, status: newStatus } : t
        ))
        addToast({ title: 'Status Updated', message: `Tournament status changed to ${newStatus}`, type: 'success' })
    }

    const handleCreateTournament = (e) => {
        e.preventDefault()
        const trn = {
            ...newTournament,
            id: `TRN-${String(tournaments.length + 1).padStart(3, '0')}`,
            activeNow: 0,
            status: 'Upcoming',
            venue: 'TBD',
            teams: [],
            schedule: newTournament.date,
            officials: [],
            matches: []
        }
        setTournaments(prev => [...prev, trn])
        setIsCreateModalOpen(false)
        setNewTournament({ name: '', sport: '', date: '', totalMatches: '' })
        addToast({ title: 'Success', message: 'Tournament created successfully' })
    }

    const handleView = (tournament) => {
        setSelectedTournament(tournament)
        setIsViewOpen(true)
    }

    const columns = [
        { key: 'name', label: 'Tournament' }, 
        { key: 'sport', label: 'Sport' }, 
        { key: 'date', label: 'Date' },
        { key: 'totalMatches', label: 'Total Matches' }, 
        { key: 'activeNow', label: 'Active Now' },
        { 
            key: 'status', 
            label: 'Status', 
            render: (v, r) => (
                <div className="flex items-center gap-2">
                    <Badge variant={v === 'Live' ? 'success' : v === 'Finished' ? 'primary' : 'warning'} dot>{v}</Badge>
                    <CustomSelect 
                        value={v}
                        onChange={(val) => handleUpdateStatus(r.id, val)}
                        options={[
                            { value: 'Upcoming', label: 'Upcoming' },
                            { value: 'Live', label: 'Live' },
                            { value: 'Finished', label: 'Finished' }
                        ]}
                    />
                </div>
            ) 
        },
        { 
            key: 'action', 
            label: 'Actions', 
            render: (_, r) => (
                <Button size="sm" variant="outline" onClick={() => handleView(r)}>
                    👁️ View
                </Button>
            ) 
        },
    ]

    const getMatchStatusVariant = (status) => {
        if (status === 'Live') return 'success'
        if (status === 'Completed') return 'primary'
        return 'warning'
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Tournaments</h1>
                    <p className="text-surface-500 text-sm mt-1">View tournaments and manage matches</p>
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden pt-4">
                <DataTable columns={columns} data={tournaments} />
            </div>

            {/* Create Tournament Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Tournament">
                <form onSubmit={handleCreateTournament} className="space-y-4">
                    <Input label="Tournament Name" required value={newTournament.name} onChange={(e) => setNewTournament({...newTournament, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <Select 
                            label="Sport" required 
                            options={[{ value: 'Cricket', label: 'Cricket' }, { value: 'Football', label: 'Football' }, { value: 'Football', label: 'Football' }]} 
                            value={newTournament.sport} 
                            onChange={(e) => setNewTournament({...newTournament, sport: e.target.value})}
                        />
                        <CustomDatePicker
                            label="Date *"
                            value={newTournament.date}
                            onChange={(val) => setNewTournament({...newTournament, date: val})}
                            align="left"
                        />
                    </div>
                    <Input label="Total Matches" type="number" required value={newTournament.totalMatches} onChange={(e) => setNewTournament({...newTournament, totalMatches: e.target.value})} />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create</Button>
                    </div>
                </form>
            </Modal>

            {/* View Tournament Details Modal */}
            <Modal 
                isOpen={isViewOpen} 
                onClose={() => setIsViewOpen(false)} 
                title="Tournament Details"
                size="xl"
            >
                {selectedTournament && (
                    <div className="space-y-5">
                        {/* Header: Tournament Name & Status */}
                        <div className="flex items-center justify-between pb-4 border-b border-surface-100">
                            <div>
                                <p className="text-xs text-surface-400 uppercase tracking-wider">Tournament</p>
                                <p className="text-xl font-bold text-surface-900">{selectedTournament.name}</p>
                            </div>
                            <Badge variant={
                                selectedTournament.status === 'Live' ? 'success' : 
                                selectedTournament.status === 'Finished' ? 'primary' : 'warning'
                            } dot>
                                {selectedTournament.status}
                            </Badge>
                        </div>

                        {/* Info Grid: Sport, Venue */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">🏅 Sport</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedTournament.sport}</p>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">📍 Venue</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedTournament.venue || 'TBD'}</p>
                            </div>
                        </div>

                        {/* Teams */}
                        <div className="bg-surface-50 rounded-xl p-4">
                            <p className="text-xs text-surface-400 uppercase tracking-wider mb-2">👥 Teams</p>
                            {selectedTournament.teams && selectedTournament.teams.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {selectedTournament.teams.map((team, idx) => (
                                        <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-surface-200 text-sm font-medium text-surface-800">
                                            {team}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-surface-500 italic">No teams added yet</p>
                            )}
                        </div>

                        {/* Schedule */}
                        <div className="bg-surface-50 rounded-xl p-4">
                            <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">📅 Schedule</p>
                            <p className="text-sm font-semibold text-surface-900">{selectedTournament.schedule || selectedTournament.date}</p>
                        </div>

                        {/* Matches */}
                        <div>
                            <p className="text-xs text-surface-400 uppercase tracking-wider mb-3">⚔️ Matches ({selectedTournament.matches?.length || 0})</p>
                            {selectedTournament.matches && selectedTournament.matches.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedTournament.matches.map(match => (
                                        <div key={match.id} className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono text-surface-400">{match.id}</span>
                                                    {match.time && <span className="text-xs text-surface-400">• {match.time}</span>}
                                                </div>
                                                <Badge size="sm" variant={getMatchStatusVariant(match.status)}>{match.status}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-semibold text-surface-900">{match.teamA}</span>
                                                    <span className="text-xs text-surface-400 font-medium">VS</span>
                                                    <span className="text-sm font-semibold text-surface-900">{match.teamB}</span>
                                                </div>
                                                <span className={`text-sm font-bold ${match.status === 'Live' ? 'text-green-600' : match.status === 'Completed' ? 'text-accent-600' : 'text-surface-400'}`}>
                                                    {match.score}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-surface-50 rounded-xl p-6 text-center">
                                    <p className="text-sm text-surface-500 italic">No matches scheduled yet</p>
                                </div>
                            )}
                        </div>

                        {/* Officials */}
                        <div className="bg-surface-50 rounded-xl p-4">
                            <p className="text-xs text-surface-400 uppercase tracking-wider mb-2">🧑‍⚖️ Officials</p>
                            {selectedTournament.officials && selectedTournament.officials.length > 0 ? (
                                <div className="space-y-1.5">
                                    {selectedTournament.officials.map((official, idx) => (
                                        <p key={idx} className="text-sm text-surface-800 font-medium">{official}</p>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-surface-500 italic">No officials assigned yet</p>
                            )}
                        </div>

                        {/* Score Summary */}
                        <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl p-4">
                            <p className="text-xs text-surface-400 uppercase tracking-wider mb-2">🏆 Score Summary</p>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-accent-600">{selectedTournament.totalMatches}</p>
                                    <p className="text-xs text-surface-500">Total Matches</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{selectedTournament.activeNow}</p>
                                    <p className="text-xs text-surface-500">Active Now</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-primary-600">
                                        {selectedTournament.matches?.filter(m => m.status === 'Completed').length || 0}
                                    </p>
                                    <p className="text-xs text-surface-500">Completed</p>
                                </div>
                            </div>
                        </div>

                        {/* Close Button */}
                        <div className="flex justify-end pt-2">
                            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
