import { useState, useEffect } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const initialTeams = [
    { id: 1, name: 'Thunder XI', sport: 'Cricket', players: 11, ranking: 1, wins: 8, losses: 2 },
    { id: 2, name: 'Royal Challengers', sport: 'Cricket', players: 12, ranking: 2, wins: 7, losses: 3 },
    { id: 3, name: 'Urban FC', sport: 'Football', players: 15, ranking: 1, wins: 12, losses: 1 },
    { id: 4, name: 'Smash Masters', sport: 'Badminton', players: 4, ranking: 3, wins: 5, losses: 4 },
]

export default function TeamManagement() {
    const [teamList, setTeamList] = useState(() => {
        const saved = localStorage.getItem('owner_teams')
        return saved ? JSON.parse(saved) : initialTeams
    })
    const [modal, setModal] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' })

    const [formData, setFormData] = useState({
        name: '',
        sport: 'Cricket',
        players: '',
        ranking: '',
        wins: '',
        losses: ''
    })

    useEffect(() => {
        localStorage.setItem('owner_teams', JSON.stringify(teamList))
    }, [teamList])

    const handleOpenCreateModal = () => {
        setEditMode(false)
        setEditingId(null)
        setFormData({ name: '', sport: 'Cricket', players: '', ranking: '', wins: '', losses: '' })
        setModal(true)
    }

    const handleEditClick = (team) => {
        setEditMode(true)
        setEditingId(team.id)
        setFormData({ ...team })
        setModal(true)
    }

    const handleSaveTeam = () => {
        if (!formData.name || !formData.sport) return

        if (editMode) {
            setTeamList(prev => prev.map(t => t.id === editingId ? { ...formData, id: editingId } : t))
        } else {
            setTeamList([{ ...formData, id: Date.now() }, ...teamList])
        }
        setModal(false)
    }

    const handleDeleteTeam = () => {
        setTeamList(prev => prev.filter(t => t.id !== deleteConfirm.id))
        setDeleteConfirm({ open: false, id: null, name: '' })
    }

    const columns = [
        { key: 'name', label: 'Team' }, 
        { key: 'sport', label: 'Sport' }, 
        { key: 'players', label: 'Players' },
        { key: 'ranking', label: 'Rank', render: v => <span className="font-bold text-primary-600">#{v}</span> },
        { key: 'wins', label: 'W', render: v => <span className="text-accent-600 font-medium">{v}</span> },
        { key: 'losses', label: 'L', render: v => <span className="text-danger-500 font-medium">{v}</span> },
        { 
            key: 'action', 
            label: '', 
            render: (_, r) => (
                <div className="flex gap-2">
                    <button onClick={() => handleEditClick(r)} className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => setDeleteConfirm({ open: true, id: r.id, name: r.name })} className="p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            ) 
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Teams</h1>
                    <p className="text-surface-500 text-sm mt-1">Manage turf teams and rankings</p>
                </div>
                <Button onClick={handleOpenCreateModal}>+ Create Team</Button>
            </div>

            <DataTable columns={columns} data={teamList} />

            <Modal isOpen={modal} onClose={() => setModal(false)} title={editMode ? "Edit Team" : "Create New Team"}>
                <div className="space-y-4">
                    <Input label="Team Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <Input label="Sport" value={formData.sport} onChange={e => setFormData({ ...formData, sport: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Players" type="number" value={formData.players} onChange={e => setFormData({ ...formData, players: e.target.value })} />
                        <Input label="Rank" type="number" value={formData.ranking} onChange={e => setFormData({ ...formData, ranking: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Wins" type="number" value={formData.wins} onChange={e => setFormData({ ...formData, wins: e.target.value })} />
                        <Input label="Losses" type="number" value={formData.losses} onChange={e => setFormData({ ...formData, losses: e.target.value })} />
                    </div>
                    <div className="flex gap-3 justify-end mt-4">
                        <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
                        <Button onClick={handleSaveTeam}>{editMode ? "Update" : "Create"}</Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog 
                isOpen={deleteConfirm.open} 
                onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
                onConfirm={handleDeleteTeam}
                title="Delete Team"
                message={`Are you sure you want to delete "${deleteConfirm.name}"?`}
                variant="danger"
            />
        </div>
    )
}
