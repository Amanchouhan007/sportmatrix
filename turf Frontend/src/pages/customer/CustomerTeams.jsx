import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { getTeams } from '../../services/tournamentService'

export default function CustomerTeams() {
    const [teamsList, setTeamsList] = useState([])
    const [loading, setLoading] = useState(true)

    // For demonstration of join modal
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchTeams()
    }, [])

    const fetchTeams = async () => {
        setLoading(true)
        try {
            const res = await getTeams()
            if (res.success && Array.isArray(res.data)) {
                setTeamsList(res.data)
            }
        } catch (error) {
            console.error('Error fetching teams:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleJoinTeam = (team) => {
        // In a real implementation, this would call an API to request joining a team.
        alert(`Request to join ${team.team_name} sent!`)
        setIsJoinModalOpen(false)
        setSearchTerm('')
    }

    const filteredAvailableTeams = teamsList.filter(team => 
        (team.team_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">My Teams</h1>
                    <p className="text-surface-500 text-sm mt-1">Teams you&apos;re part of or exploring</p>
                </div>
                <Button onClick={() => setIsJoinModalOpen(true)}>+ Join Team</Button>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 gap-6 animate-pulse">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-40 bg-surface-100 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {teamsList.map(t => {
                        const name = t.team_name || 'Unknown Team'
                        const sport = t.tournament_title || 'Tournament'
                        const membersCount = t.players ? t.players.length : 1
                        const role = t.captain_name ? 'Captain' : 'Player' // simplistic logic for UI
                        
                        return (
                        <Card key={t.id || t._id} hover>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                                        {name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-surface-900">{name}</h3>
                                        <p className="text-xs text-surface-400">{sport} · {membersCount} members</p>
                                    </div>
                                </div>
                                <Badge variant={role === 'Captain' ? 'primary' : 'default'}>{role}</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-surface-50 rounded-lg py-2">
                                    <p className="text-lg font-bold text-accent-600">0</p>
                                    <p className="text-xs text-surface-400">Wins</p>
                                </div>
                                <div className="bg-surface-50 rounded-lg py-2">
                                    <p className="text-lg font-bold text-danger-500">0</p>
                                    <p className="text-xs text-surface-400">Losses</p>
                                </div>
                                <div className="bg-surface-50 rounded-lg py-2">
                                    <p className="text-lg font-bold text-primary-600">-</p>
                                    <p className="text-xs text-surface-400">Rank</p>
                                </div>
                            </div>
                        </Card>
                    )})}
                </div>
            )}

            {!loading && teamsList.length === 0 && (
                <div className="text-center py-12 bg-surface-50 rounded-xl border border-surface-100">
                    <p className="text-surface-500 mb-4">You haven't joined any teams yet.</p>
                    <Button onClick={() => setIsJoinModalOpen(true)}>Find a Team</Button>
                </div>
            )}

            {/* Join Team Modal */}
            <Modal 
                isOpen={isJoinModalOpen} 
                onClose={() => setIsJoinModalOpen(false)} 
                title="Join a Team"
            >
                <div className="space-y-4">
                    <Input 
                        placeholder="Search teams..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    
                    <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
                        {filteredAvailableTeams.length > 0 ? (
                            filteredAvailableTeams.map(team => (
                                <div key={team.id || team._id} className="flex items-center justify-between p-3 border border-surface-100 rounded-xl hover:bg-surface-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center text-surface-600 font-bold">
                                            {(team.team_name || 'T')[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-surface-900 text-sm">{team.team_name}</p>
                                            <p className="text-xs text-surface-500">{team.tournament_title} · {team.players ? team.players.length : 1} members</p>
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => handleJoinTeam(team)}>Request</Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-surface-500 py-8 text-sm">No teams found matching your search</p>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    )
}
