import { useState } from 'react'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import { HiTrophy, HiStar, HiCheckCircle, HiLocationMarker, HiShieldCheck } from 'react-icons/hi'

const mockLeaderboardData = [
    {
        rank: 1,
        name: 'Arjun Mehta',
        avatar: '🧑‍💼',
        city: 'Mumbai',
        role: '🏏 Batsman',
        rating: '9.4',
        matches: 24,
        verifiedMatches: 22,
        umpireMatches: 12,
        runs: 684,
        highScore: '84*',
        avg: 45.6,
        sr: 178.2,
        wickets: 8,
        mvps: 7,
        badge: '🏆 Tournament Pro'
    },
    {
        rank: 2,
        name: 'Vikram Deshmukh',
        avatar: '👨‍💼',
        city: 'Bangalore',
        role: '🏏⚾ All-Rounder',
        rating: '9.1',
        matches: 20,
        verifiedMatches: 19,
        umpireMatches: 10,
        runs: 512,
        highScore: '72*',
        avg: 39.3,
        sr: 165.4,
        wickets: 24,
        mvps: 6,
        badge: '⚖️ Umpire Verified'
    },
    {
        rank: 3,
        name: 'Sneha Kapoor',
        avatar: '👩‍💻',
        city: 'Mumbai',
        role: '⚾ Bowler',
        rating: '8.8',
        matches: 18,
        verifiedMatches: 18,
        umpireMatches: 9,
        runs: 142,
        highScore: '28',
        avg: 18.2,
        sr: 132.0,
        wickets: 28,
        mvps: 5,
        badge: '⚡ Match Verified'
    },
    {
        rank: 4,
        name: 'Rahul Kumar',
        avatar: '🏏',
        city: 'Mumbai',
        role: '🏏⚾ All-Rounder',
        rating: '8.4',
        matches: 18,
        verifiedMatches: 16,
        umpireMatches: 8,
        runs: 412,
        highScore: '68*',
        avg: 34.3,
        sr: 168.4,
        wickets: 16,
        mvps: 5,
        badge: '⚡ Match Verified'
    },
    {
        rank: 5,
        name: 'Priya Singh',
        avatar: '👩‍🔬',
        city: 'Indore',
        role: '🏏 Batsman',
        rating: '8.2',
        matches: 15,
        verifiedMatches: 14,
        umpireMatches: 6,
        runs: 390,
        highScore: '61',
        avg: 32.5,
        sr: 154.2,
        wickets: 4,
        mvps: 3,
        badge: '⚡ Match Verified'
    }
]

export default function PlayerLeaderboardPage() {
    const [selectedCategory, setSelectedCategory] = useState('all') // 'all' | 'batsman' | 'bowler' | 'allrounder'
    const [selectedCity, setSelectedCity] = useState('All Cities')

    const topThree = mockLeaderboardData.slice(0, 3)
    const restList = mockLeaderboardData.slice(3)

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* HEADER BANNER */}
                <div className="bg-[#111827] text-white rounded-[28px] p-6 sm:p-10 relative overflow-hidden shadow-xl border border-slate-800">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    
                    <div className="relative z-10 max-w-2xl">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] bg-[#10B981] text-white px-3 py-1 rounded-full inline-block mb-3">
                            ⚡ VERIFIED PLATFORM RANKINGS
                        </span>
                        <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight uppercase text-white mb-2">
                            City & Turf Player Leaderboard
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                            Only opponent captain confirmed & paid umpire verified matches count towards official rankings and leaderboard points.
                        </p>
                    </div>

                    {/* CATEGORY & CITY FILTERS */}
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6">
                        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                            {[
                                { id: 'all', label: '🏆 Top Overall' },
                                { id: 'batsman', label: '🏏 Top Batsmen' },
                                { id: 'bowler', label: '⚾ Top Bowlers' },
                                { id: 'allrounder', label: '⚡ All-Rounders' }
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                                        selectedCategory === cat.id
                                            ? 'bg-[#C8FF2E] text-[#111827] shadow-md border border-[#B5F000]'
                                            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer"
                        >
                            <option value="All Cities">🌆 All Cities</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Bangalore">Bangalore</option>
                            <option value="Indore">Indore</option>
                        </select>
                    </div>
                </div>

                {/* PODIUM CARDS FOR TOP 3 PLAYERS */}
                <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 px-1">
                        🥇 TOP 3 RANKED PLAYERS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {topThree.map((player, idx) => {
                            const isFirst = idx === 0
                            const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'
                            const borderStyle = idx === 0 ? 'border-2 border-amber-400 bg-gradient-to-b from-amber-50/50 to-white' : 'border border-slate-200 bg-white'

                            return (
                                <Card key={player.rank} className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${borderStyle}`}>
                                    {isFirst && (
                                        <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
                                            RANK #1 CHAMPION
                                        </div>
                                    )}

                                    <div className="text-center space-y-3 pt-2">
                                        <div className="relative w-20 h-20 mx-auto">
                                            <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-3xl">
                                                {player.avatar}
                                            </div>
                                            <span className="absolute -bottom-1 -right-1 text-2xl">
                                                {medalEmoji}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-black text-[#111827]">{player.name}</h3>
                                            <p className="text-xs text-slate-500 font-semibold">{player.city} · {player.role}</p>
                                        </div>

                                        <div className="flex justify-center">
                                            <span className="text-[10px] font-black bg-emerald-50 text-[#065F46] border border-emerald-300 px-2.5 py-1 rounded-full">
                                                {player.badge}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                                            <div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase block">RATING</span>
                                                <span className="text-sm font-black text-[#10B981] font-mono">{player.rating}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase block">RUNS</span>
                                                <span className="text-sm font-black text-[#111827] font-mono">{player.runs}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase block">WKTS</span>
                                                <span className="text-sm font-black text-purple-700 font-mono">{player.wickets}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                {/* FULL LEADERBOARD TABLE */}
                <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-xs">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                        📊 OFFICIAL RANKING STANDINGS
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="py-3 px-4">RANK</th>
                                    <th className="py-3 px-4">PLAYER</th>
                                    <th className="py-3 px-4">ROLE</th>
                                    <th className="py-3 px-4">VERIFIED MATCHES</th>
                                    <th className="py-3 px-4 text-center">RUNS (AVG)</th>
                                    <th className="py-3 px-4 text-center">WICKETS</th>
                                    <th className="py-3 px-4 text-right">RATING SCORE</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                                {mockLeaderboardData.map((p) => (
                                    <tr key={p.rank} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-4 font-black font-mono text-sm text-[#111827]">
                                            #{p.rank}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                                                    {p.avatar}
                                                </div>
                                                <div>
                                                    <span className="font-black text-[#111827] block">{p.name}</span>
                                                    <span className="text-[10px] text-slate-500">{p.city} · {p.badge}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 font-bold">{p.role}</td>
                                        <td className="py-3.5 px-4">
                                            <span className="text-[11px] font-extrabold text-[#065F46] bg-[#ECFDF5] border border-emerald-300 px-2.5 py-1 rounded-full">
                                                {p.verifiedMatches} Verified ({p.umpireMatches} Umpire)
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-mono font-bold text-[#111827]">
                                            {p.runs} <span className="text-[10px] text-slate-400 font-normal">({p.avg})</span>
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-mono font-bold text-purple-700">
                                            {p.wickets}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-black font-mono text-base text-[#10B981]">
                                            {p.rating}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
