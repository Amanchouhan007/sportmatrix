import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { HiUserGroup, HiUser, HiStar } from 'react-icons/hi'

const teams = [
    { name: 'Thunder XI', sport: 'Cricket', players: 11, ranking: 1, wins: 8, losses: 2, logo: '🏏' },
    { name: 'Royal Challengers', sport: 'Cricket', players: 12, ranking: 2, wins: 7, losses: 3, logo: '⚡' },
    { name: 'Urban FC', sport: 'Football', players: 15, ranking: 1, wins: 12, losses: 1, logo: '⚽' },
    { name: 'Smash Masters', sport: 'Badminton', players: 4, ranking: 3, wins: 5, losses: 4, logo: '🏸' },
]

const players = [
    { name: 'Arjun Sharma', sport: 'Cricket', skill: 'Advanced', matches: 45, rating: 4.8, status: 'Active' },
    { name: 'Priya Patel', sport: 'Badminton', skill: 'Expert', matches: 62, rating: 4.9, status: 'Active' },
    { name: 'Rahul Kumar', sport: 'Football', skill: 'Intermediate', matches: 28, rating: 4.5, status: 'Inactive' },
    { name: 'Vikram Singh', sport: 'Esports', skill: 'Expert', matches: 120, rating: 4.9, status: 'Active' },
]

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
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        Roster & Club Leaderboard
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Browse active athletic teams, check participant statistics, and inspect performance skills</p>
                </div>
            </div>

            {/* Teams Ledger */}
            <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between border-b border-surface-100 pb-3">
                    <h2 className="text-base font-black text-surface-900 tracking-tight flex items-center gap-1.5">
                        <HiUserGroup className="text-emerald-500" /> Active Club Teams
                    </h2>
                </div>
                <DataTable columns={teamCols} data={teams} />
            </div>

            {/* Players Ledger */}
            <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between border-b border-surface-100 pb-3">
                    <h2 className="text-base font-black text-surface-900 tracking-tight flex items-center gap-1.5">
                        <HiUser className="text-emerald-500" /> Player Performance Roster
                    </h2>
                </div>
                <DataTable columns={playerCols} data={players} />
            </div>
        </div>
    )
}
