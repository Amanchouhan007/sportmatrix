import { useState, useEffect } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import api from '../../services/api'
import { HiUserGroup, HiUser, HiStar, HiPlus } from 'react-icons/hi'
import { getTeams } from '../../services/tournamentService'

const teamCols = [
    { 
        key: 'name', 
        label: 'Team Name',
        render: (v, r) => (
            <div className="flex items-center gap-3">
                <span className="text-2xl bg-surface-50 border border-surface-200 w-10 h-10 rounded-2xl flex items-center justify-center shadow-soft">{r.logo}</span>
                <span className="font-black text-surface-900 leading-snug">{v}</span>
            </div>
        )
    },
    { key: 'sport', label: 'Sport' },
    { key: 'players', label: 'Roster Count' },
    { key: 'ranking', label: 'Rank', render: v => <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 text-xs">#{v}</span> },
    { key: 'wins', label: 'Wins', render: v => <span className="text-emerald-500 font-extrabold">{v} W</span> },
    { key: 'losses', label: 'Losses', render: v => <span className="text-red-500 font-extrabold">{v} L</span> },
]

const playerCols = [
    { 
        key: 'name', 
        label: 'Player Roster',
        render: v => (
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-center text-surface-500 shadow-soft font-black"><HiUser /></div>
                <span className="font-black text-surface-900 leading-snug">{v}</span>
            </div>
        )
    },
    { key: 'sport', label: 'Sport' },
    { 
        key: 'skill', 
        label: 'Skill Class', 
        render: v => <Badge variant={v === 'Expert' ? 'success' : v === 'Advanced' ? 'primary' : 'default'}>{v}</Badge> 
    },
    { key: 'matches', label: 'Matches Played' },
    { 
        key: 'rating', 
        label: 'Rating Score', 
        render: v => (
            <span className="text-amber-500 font-extrabold flex items-center gap-1">
                <HiStar className="w-4 h-4 text-amber-500 animate-pulse" /> {v}
            </span>
        ) 
    },
    { 
        key: 'status', 
        label: 'Status', 
        render: v => <Badge variant={v === 'Active' ? 'success' : 'default'} dot>{v}</Badge> 
    },
]

export default function TeamsPlayers() {
    const [teamList, setTeamList] = useState([])
    const [playerList, setPlayerList] = useState([])
    const [activeTab, setActiveTab] = useState('teams')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [teamName, setTeamName] = useState('')
    const [captainName, setCaptainName] = useState('')
    const [captainPhone, setCaptainPhone] = useState('')
    const [sport, setSport] = useState('Cricket')
    const [membersCount, setMembersCount] = useState(11)

    useEffect(() => {
        getTeams().then(res => {
            if (res && res.success && Array.isArray(res.data)) {
                const mapped = res.data.map((t, idx) => ({
                    id: t.id || idx + 1,
                    name: t.team_name || t.name || 'Team',
                    sport: t.sport || 'Cricket',
                    players: t.players_count || t.players || 11,
                    ranking: idx + 1,
                    wins: t.wins || 0,
                    losses: t.losses || 0,
                    logo: t.sport === 'Football' ? '⚽' : '🏏'
                }))
                setTeamList(mapped)
            } else {
                setTeamList([])
            }
        }).catch(() => setTeamList([]))

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        fetch(`${API_URL}/tournaments/leaderboard/global`)
            .then(r => r.json())
            .then(res => {
                if (res && res.success && Array.isArray(res.data)) {
                    const mapped = res.data.map(p => ({
                        name: p.name || 'Player',
                        sport: p.sport || 'Cricket',
                        skill: p.role || 'All-Rounder',
                        matches: p.matches || 0,
                        rating: p.trustScore ? (p.trustScore / 20).toFixed(1) : 4.8,
                        status: 'Active'
                    }))
                    setPlayerList(mapped)
                } else {
                    setPlayerList([])
                }
            })
            .catch(() => setPlayerList([]))
    }, [])

    // Load live teams from backend REST API
    useEffect(() => {
        api.get('/teams')
            .then(res => {
                if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
                    const mapped = res.data.data.map(t => ({
                        id: t.id,
                        name: t.name,
                        sport: t.sport || 'Cricket',
                        players: t.members_count || 11,
                        ranking: 1,
                        wins: 0,
                        losses: 0,
                        logo: t.sport === 'Football' ? '⚽' : '🏏'
                    }))
                    setTeamList(prev => [...mapped, ...prev])
                }
            })
            .catch(e => console.warn('Fetch teams note:', e.message))
    }, [])

    const handleCreateTeam = async (e) => {
        e.preventDefault()
        if (!teamName || !captainName) return

        const newTeam = {
            id: `tm_${Date.now()}`,
            name: teamName,
            sport: sport,
            players: Number(membersCount || 11),
            ranking: teamList.length + 1,
            wins: 0,
            losses: 0,
            logo: sport === 'Football' ? '⚽' : '🏏'
        }

        setTeamList([newTeam, ...teamList])
        setIsAddModalOpen(false)

        // API post
        try {
            await api.post('/teams', {
                name: teamName,
                captainName,
                captainPhone: captainPhone || '+91 98765 43210',
                sport,
                membersCount: Number(membersCount)
            })
        } catch (err) {
            console.warn('API post team note:', err.message)
        }

        // Reset form
        setTeamName('')
        setCaptainName('')
        setCaptainPhone('')
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        Roster & Club Leaderboard
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Browse active athletic teams, check participant statistics, and inspect performance skills</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-md flex items-center gap-2 self-start md:self-auto transition-all"
                >
                    <HiPlus className="w-5 h-5" /> Add New Team
                </button>
            </div>

            {/* Teams Ledger */}
            <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between border-b border-surface-100 pb-3">
                    <h2 className="text-base font-black text-surface-900 tracking-tight flex items-center gap-1.5">
                        <HiUserGroup className="text-emerald-500" /> Active Club Teams ({teamList.length})
                    </h2>
                </div>
                <DataTable columns={teamCols} data={teamList} />
            </div>

            {/* Players Ledger */}
            <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between border-b border-surface-100 pb-3">
                    <h2 className="text-base font-black text-surface-900 tracking-tight flex items-center gap-1.5">
                        <HiUser className="text-emerald-500" /> Player Performance Roster
                    </h2>
                </div>
                <DataTable columns={playerCols} data={playerList} />
            </div>

            {/* ADD TEAM MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                🏏 Register New Team
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setTeamName('Indore Strikers XI')
                                    setCaptainName('Vikram Malhotra')
                                    setCaptainPhone('+91 98765 43210')
                                    setSport('Cricket')
                                    setMembersCount(11)
                                }}
                                className="px-3 py-1 text-[11px] font-black bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-all"
                            >
                                ⚡ Quick Autofill
                            </button>
                        </div>

                        <form onSubmit={handleCreateTeam} className="space-y-3.5 text-xs">
                            <div>
                                <label className="text-[10px] font-black uppercase text-emerald-700 mb-1 block">Team Name</label>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    required
                                    placeholder="e.g. Thunder XI / Indore Strikers"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Captain Full Name</label>
                                <input
                                    type="text"
                                    value={captainName}
                                    onChange={(e) => setCaptainName(e.target.value)}
                                    required
                                    placeholder="e.g. Vikram Malhotra (Captain)"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Captain WhatsApp Mobile</label>
                                <input
                                    type="text"
                                    value={captainPhone}
                                    onChange={(e) => setCaptainPhone(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Sport Type</label>
                                    <select
                                        value={sport}
                                        onChange={(e) => setSport(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 outline-none focus:border-emerald-600"
                                    >
                                        <option value="Cricket">Box Cricket 🏏</option>
                                        <option value="Football">Football ⚽</option>
                                        <option value="Badminton">Badminton 🏸</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Roster Count</label>
                                    <input
                                        type="number"
                                        value={membersCount}
                                        onChange={(e) => setMembersCount(e.target.value)}
                                        min="1"
                                        max="30"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-emerald-600"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md transition-all"
                                >
                                    Save Team
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
