import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

const initialTeams = [
    { id: 1, name: 'Thunder XI', sport: 'Cricket', members: 11, role: 'Captain', wins: 8, losses: 2, ranking: 1 },
    { id: 2, name: 'Urban FC', sport: 'Football', members: 15, role: 'Player', wins: 12, losses: 1, ranking: 3 },
]

const availableTeams = [
    { id: 101, name: 'Strikers XI', sport: 'Cricket', members: 10, wins: 5, losses: 5, ranking: 12 },
    { id: 102, name: 'United United', sport: 'Football', members: 14, wins: 10, losses: 4, ranking: 5 },
    { id: 103, name: 'Smashers', sport: 'Badminton', members: 2, wins: 15, losses: 2, ranking: 2 },
    { id: 104, name: 'Court Kings', sport: 'Tennis', members: 4, wins: 7, losses: 3, ranking: 8 },
    { id: 105, name: 'Goal Getters', sport: 'Football', members: 12, wins: 6, losses: 8, ranking: 15 },
]

export default function CustomerTeams() {
    const [teamsList, setTeamsList] = useState(() => {
        const saved = localStorage.getItem('customer_teams')
        return saved ? JSON.parse(saved) : initialTeams
    })

    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        localStorage.setItem('customer_teams', JSON.stringify(teamsList))
    }, [teamsList])

    const handleJoinTeam = (team) => {
        const newTeam = {
            ...team,
            role: 'Player',
            id: Date.now() // Unique ID for the user's list
        }
        setTeamsList([newTeam, ...teamsList])
        setIsJoinModalOpen(false)
        setSearchTerm('')
    }

    const filteredAvailableTeams = availableTeams.filter(team => 
        !teamsList.some(t => t.name === team.name) &&
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">My Teams</h1>
                    <p className="text-surface-500 text-sm mt-1">Teams you&apos;re part of</p>
                </div>
                <Button onClick={() => setIsJoinModalOpen(true)}>+ Join Team</Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {teamsList.map(t => (
                    <Card key={t.id} hover>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                                    {t.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-surface-900">{t.name}</h3>
                                    <p className="text-xs text-surface-400">{t.sport} · {t.members} members</p>
                                </div>
                            </div>
                            <Badge variant={t.role === 'Captain' ? 'primary' : 'default'}>{t.role}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-surface-50 rounded-lg py-2">
                                <p className="text-lg font-bold text-accent-600">{t.wins}</p>
                                <p className="text-xs text-surface-400">Wins</p>
                            </div>
                            <div className="bg-surface-50 rounded-lg py-2">
                                <p className="text-lg font-bold text-danger-500">{t.losses}</p>
                                <p className="text-xs text-surface-400">Losses</p>
                            </div>
                            <div className="bg-surface-50 rounded-lg py-2">
                                <p className="text-lg font-bold text-primary-600">#{t.ranking}</p>
                                <p className="text-xs text-surface-400">Rank</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

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
                                <div key={team.id} className="flex items-center justify-between p-3 border border-surface-100 rounded-xl hover:bg-surface-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center text-surface-600 font-bold">
                                            {team.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-surface-900 text-sm">{team.name}</p>
                                            <p className="text-xs text-surface-500">{team.sport} · {team.members} members</p>
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => handleJoinTeam(team)}>Join</Button>
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
