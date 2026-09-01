import { useState, useEffect, useCallback } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import {
    getTeams,
    getMyTeams,
    createTeam,
    joinTeam,
    getJoinRequests,
    approveJoinRequest,
    rejectJoinRequest
} from '../../services/tournamentService'

export default function CustomerTeams() {
    const { user } = useAuth()
    const { addToast } = useToast()
    
    // Core Data States
    const [myTeamsList, setMyTeamsList] = useState([])
    const [discoveryTeams, setDiscoveryTeams] = useState([])
    const [loading, setLoading] = useState(true)

    // Modal States
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false)
    const [activeCaptainTeam, setActiveCaptainTeam] = useState(null)
    const [pendingRequests, setPendingRequests] = useState([])
    
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Create Team Form State
    const [createForm, setCreateForm] = useState({
        teamName: '',
        sport: 'Cricket',
        membersCount: 11
    })

    const fetchAllData = useCallback(async () => {
        setLoading(true)
        try {
            const [myRes, allRes] = await Promise.all([
                getMyTeams(),
                getTeams()
            ])
            setMyTeamsList(myRes.data || [])
            setDiscoveryTeams(allRes.data || [])
        } catch (error) {
            console.error('Error fetching teams:', error)
            setMyTeamsList([])
            setDiscoveryTeams([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAllData()
    }, [fetchAllData])

    const handleCreateTeamSubmit = async (e) => {
        e.preventDefault()
        if (!createForm.teamName.trim()) {
            if (addToast) addToast({ title: 'Validation Error', message: 'Team Name is required.', type: 'error' })
            return
        }

        setIsSubmitting(true)
        try {
            const res = await createTeam({
                teamName: createForm.teamName.trim(),
                sport: createForm.sport,
                membersCount: Number(createForm.membersCount || 1),
                captainName: user?.name || user?.email?.split('@')[0] || 'Team Captain'
            })
            if (addToast) addToast({ title: 'Team Created', message: res.message || 'Team created successfully!', type: 'success' })
            setIsCreateModalOpen(false)
            setCreateForm({ teamName: '', sport: 'Cricket', membersCount: 11 })
            fetchAllData()
        } catch (err) {
            if (addToast) addToast({ title: 'Creation Failed', message: err.message || 'Failed to create team.', type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleJoinTeamClick = async (team) => {
        setIsSubmitting(true)
        try {
            const res = await joinTeam(team.id || team._id)
            if (addToast) addToast({ title: 'Join Request Sent', message: res.message || `Request to join ${team.team_name || team.name} sent!`, type: 'success' })
            setIsJoinModalOpen(false)
            setSearchTerm('')
            fetchAllData()
        } catch (err) {
            if (addToast) addToast({ title: 'Join Failed', message: err.message || 'Could not request to join team.', type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleOpenRequests = async (team) => {
        setActiveCaptainTeam(team)
        try {
            const res = await getJoinRequests(team.id || team._id)
            setPendingRequests(res.data || [])
            setIsRequestsModalOpen(true)
        } catch (err) {
            if (addToast) addToast({ title: 'Fetch Error', message: err.message || 'Could not load join requests.', type: 'error' })
        }
    }

    const handleApprove = async (requestId) => {
        if (!activeCaptainTeam) return
        setIsSubmitting(true)
        try {
            const res = await approveJoinRequest(activeCaptainTeam.id || activeCaptainTeam._id, requestId)
            if (addToast) addToast({ title: 'Request Approved', message: res.message, type: 'success' })
            setPendingRequests(prev => prev.filter(r => r.id !== requestId))
            fetchAllData()
        } catch (err) {
            if (addToast) addToast({ title: 'Approval Failed', message: err.message, type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReject = async (requestId) => {
        if (!activeCaptainTeam) return
        setIsSubmitting(true)
        try {
            const res = await rejectJoinRequest(activeCaptainTeam.id || activeCaptainTeam._id, requestId)
            if (addToast) addToast({ title: 'Request Rejected', message: res.message, type: 'info' })
            setPendingRequests(prev => prev.filter(r => r.id !== requestId))
            fetchAllData()
        } catch (err) {
            if (addToast) addToast({ title: 'Rejection Failed', message: err.message, type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredDiscoveryTeams = discoveryTeams.filter(team => 
        (team.team_name || team.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">My Squads & Teams</h1>
                    <p className="text-surface-500 text-sm mt-1">Teams you&apos;re an accepted member or captain of</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" onClick={() => setIsJoinModalOpen(true)}>🔍 Join Team</Button>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#16A34A] text-white">+ Create Team</Button>
                </div>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 gap-6 animate-pulse">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-40 bg-surface-100 rounded-xl" />
                    ))}
                </div>
            ) : myTeamsList.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                    {myTeamsList.map(t => {
                        const name = t.team_name || t.name || 'Unknown Team'
                        const sport = t.tournament_title || `${t.sport || 'Sports'} League`
                        const membersCount = t.rosterCount || (t.players ? t.players.length : 1)
                        const role = t.isCaptain ? 'Captain' : 'Member'
                        
                        return (
                            <Card key={t.id || t._id} hover className="relative overflow-hidden">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl shadow-2xs border border-emerald-200">
                                            {name[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-surface-900 text-base">{name}</h3>
                                            <p className="text-xs text-surface-500 font-medium">{sport} · {membersCount} members</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={role === 'Captain' ? 'primary' : 'default'}>{role}</Badge>
                                        {role === 'Captain' && (
                                            <Button size="xs" variant="outline" onClick={() => handleOpenRequests(t)}>
                                                📬 Requests
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="bg-surface-50 rounded-lg py-2 border border-surface-200">
                                        <p className="text-lg font-bold text-emerald-600 font-mono">{t.wins ?? 0}</p>
                                        <p className="text-[11px] text-surface-400 font-semibold uppercase">Wins</p>
                                    </div>
                                    <div className="bg-surface-50 rounded-lg py-2 border border-surface-200">
                                        <p className="text-lg font-bold text-rose-500 font-mono">{t.losses ?? 0}</p>
                                        <p className="text-[11px] text-surface-400 font-semibold uppercase">Losses</p>
                                    </div>
                                    <div className="bg-surface-50 rounded-lg py-2 border border-surface-200">
                                        <p className="text-lg font-bold text-primary-600 font-mono">{t.rank || '#1 Hub'}</p>
                                        <p className="text-[11px] text-surface-400 font-semibold uppercase">Rank</p>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            ) : null}

            {!loading && myTeamsList.length === 0 && (
                <div className="text-center py-12 bg-surface-50 rounded-2xl border border-surface-200 space-y-3">
                    <div className="text-4xl">👥</div>
                    <h3 className="font-extrabold text-surface-900 text-base">No Squad Memberships Yet</h3>
                    <p className="text-surface-500 text-xs max-w-sm mx-auto">
                        You haven&apos;t created a squad or been accepted into any teams yet. Create a squad or send join requests below.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setIsJoinModalOpen(true)}>Find a Team</Button>
                        <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="bg-[#16A34A] text-white">+ Create Squad</Button>
                    </div>
                </div>
            )}

            {/* Create Team Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Team"
            >
                <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
                    <Input 
                        label="Team Name *"
                        placeholder="e.g. Vijay Nagar Strikers"
                        value={createForm.teamName}
                        onChange={e => setCreateForm({ ...createForm, teamName: e.target.value })}
                        required
                    />
                    
                    <div>
                        <label className="block text-xs font-bold text-surface-700 mb-1">Primary Sport</label>
                        <select
                            value={createForm.sport}
                            onChange={e => setCreateForm({ ...createForm, sport: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-surface-300 text-xs font-bold text-surface-900 bg-white"
                        >
                            <option value="Cricket">🏏 Cricket</option>
                            <option value="Football">⚽ Football</option>
                            <option value="Badminton">🏸 Badminton</option>
                            <option value="Tennis">🎾 Tennis</option>
                        </select>
                    </div>

                    <Input 
                        label="Roster Size (Players)"
                        type="number"
                        placeholder="11"
                        value={createForm.membersCount}
                        onChange={e => setCreateForm({ ...createForm, membersCount: e.target.value })}
                    />

                    <div className="flex justify-end gap-3 pt-3 border-t border-surface-150">
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit" size="sm" disabled={isSubmitting} className="bg-[#16A34A] text-white">
                            {isSubmitting ? 'Creating...' : 'Create Squad'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Join Team Modal */}
            <Modal 
                isOpen={isJoinModalOpen} 
                onClose={() => setIsJoinModalOpen(false)} 
                title="Join a Team"
            >
                <div className="space-y-4">
                    <Input 
                        placeholder="Search teams by name..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    
                    <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1">
                        {filteredDiscoveryTeams.length > 0 ? (
                            filteredDiscoveryTeams.map(team => (
                                <div key={team.id || team._id} className="flex items-center justify-between p-3 border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
                                            {(team.team_name || team.name || 'T')[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-surface-900 text-sm">{team.team_name || team.name}</p>
                                            <p className="text-xs text-surface-500 font-medium">{team.tournament_title || `${team.sport} League`} · {team.rosterCount || 1} members</p>
                                        </div>
                                    </div>

                                    {team.userStatus === 'ACCEPTED' ? (
                                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300">
                                            MEMBER
                                        </span>
                                    ) : team.userStatus === 'PENDING' ? (
                                        <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300">
                                            REQUEST PENDING
                                        </span>
                                    ) : (
                                        <Button size="sm" disabled={isSubmitting} onClick={() => handleJoinTeamClick(team)}>
                                            {isSubmitting ? 'Joining...' : 'Request Join'}
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-surface-500 py-8 text-xs font-semibold">
                                No teams found matching your search. Create a new team above!
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Captain Join Requests Modal */}
            <Modal
                isOpen={isRequestsModalOpen}
                onClose={() => setIsRequestsModalOpen(false)}
                title={`Join Requests — ${activeCaptainTeam?.team_name || activeCaptainTeam?.name || 'Squad'}`}
            >
                <div className="space-y-4">
                    {pendingRequests.length > 0 ? (
                        pendingRequests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-3.5 border border-surface-200 rounded-xl bg-surface-50">
                                <div>
                                    <p className="font-black text-surface-900 text-sm">{req.user?.name || 'Applicant'}</p>
                                    <p className="text-xs text-surface-500 font-medium">{req.user?.email || req.user?.mobile || 'Player'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="xs" variant="outline" disabled={isSubmitting} onClick={() => handleReject(req.id)}>
                                        Reject
                                    </Button>
                                    <Button size="xs" disabled={isSubmitting} className="bg-[#16A34A] text-white" onClick={() => handleApprove(req.id)}>
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-surface-500 text-xs font-semibold">
                            No pending join requests for this team right now.
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    )
}
