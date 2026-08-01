import { useState, useEffect } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const initialPlayers = [
    { id: 1, name: 'Arjun Sharma', sport: 'Cricket', skill: 'Advanced', matches: 45, rating: 4.8, status: 'Active' },
    { id: 2, name: 'Priya Patel', sport: 'Badminton', skill: 'Expert', matches: 62, rating: 4.9, status: 'Active' },
    { id: 3, name: 'Rahul Kumar', sport: 'Football', skill: 'Intermediate', matches: 28, rating: 4.5, status: 'Inactive' },
    { id: 4, name: 'Vikram Singh', sport: 'Esports', skill: 'Expert', matches: 120, rating: 4.9, status: 'Active' },
]

export default function PlayerManagement() {
    const [playerList, setPlayerList] = useState(() => {
        const saved = localStorage.getItem('owner_players')
        return saved ? JSON.parse(saved) : initialPlayers
    })
    const [modal, setModal] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' })

    const [formData, setFormData] = useState({
        name: '',
        sport: 'Cricket',
        skill: 'Advanced',
        matches: '',
        rating: '',
        status: 'Active'
    })

    useEffect(() => {
        localStorage.setItem('owner_players', JSON.stringify(playerList))
    }, [playerList])

    const handleOpenCreateModal = () => {
        setEditMode(false)
        setEditingId(null)
        setFormData({ name: '', sport: 'Cricket', skill: 'Advanced', matches: '', rating: '', status: 'Active' })
        setModal(true)
    }

    const handleEditClick = (player) => {
        setEditMode(true)
        setEditingId(player.id)
        setFormData({ ...player })
        setModal(true)
    }

    const handleSavePlayer = () => {
        if (!formData.name || !formData.sport) return

        if (editMode) {
            setPlayerList(prev => prev.map(p => p.id === editingId ? { ...formData, id: editingId } : p))
        } else {
            setPlayerList([{ ...formData, id: Date.now() }, ...playerList])
        }
        setModal(false)
    }

    const handleDeletePlayer = () => {
        setPlayerList(prev => prev.filter(p => p.id !== deleteConfirm.id))
        setDeleteConfirm({ open: false, id: null, name: '' })
    }

    const columns = [
        { key: 'name', label: 'Player' }, 
        { key: 'sport', label: 'Sport' },
        { key: 'skill', label: 'Skill', render: v => <Badge variant={v === 'Expert' ? 'success' : v === 'Advanced' ? 'primary' : 'default'}>{v}</Badge> },
        { key: 'matches', label: 'Matches' }, 
        { key: 'rating', label: 'Rating', render: v => <span className="text-accent-600 font-medium">★ {v}</span> },
        { key: 'status', label: 'Status', render: v => <Badge variant={v === 'Active' ? 'success' : 'default'} dot>{v}</Badge> },
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
                    <h1 className="text-2xl font-bold text-surface-900">Players</h1>
                    <p className="text-surface-500 text-sm mt-1">View players and performance</p>
                </div>
                <Button onClick={handleOpenCreateModal}>+ Add Player</Button>
            </div>

            <DataTable columns={columns} data={playerList} />

            <Modal isOpen={modal} onClose={() => setModal(false)} title={editMode ? "Edit Player" : "Add New Player"}>
                <div className="space-y-4">
                    <Input label="Player Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <Input label="Sport" value={formData.sport} onChange={e => setFormData({ ...formData, sport: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-surface-700">Skill Level</label>
                            <select className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm outline-none focus:border-primary-500 bg-white" 
                                value={formData.skill} onChange={e => setFormData({ ...formData, skill: e.target.value })}>
                                <option>Expert</option>
                                <option>Advanced</option>
                                <option>Intermediate</option>
                                <option>Beginner</option>
                            </select>
                        </div>
                        <Input label="Matches" type="number" value={formData.matches} onChange={e => setFormData({ ...formData, matches: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Rating" type="number" step="0.1" value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} />
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-surface-700">Status</label>
                            <select className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm outline-none focus:border-primary-500 bg-white" 
                                value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end mt-4">
                        <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
                        <Button onClick={handleSavePlayer}>{editMode ? "Update" : "Add"}</Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog 
                isOpen={deleteConfirm.open} 
                onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
                onConfirm={handleDeletePlayer}
                title="Delete Player"
                message={`Are you sure you want to delete "${deleteConfirm.name}"?`}
                variant="danger"
            />
        </div>
    )
}
