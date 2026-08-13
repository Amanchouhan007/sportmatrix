import { useState, useEffect } from 'react'
import { HiCheck, HiExclamation, HiShieldCheck, HiStar, HiClock, HiFilter, HiSearch, HiUsers } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import MatchScoreVerificationModal from '../../components/booking/MatchScoreVerificationModal'

const initialMockMatches = [
    {
        id: 'MTC-98432',
        team1Name: 'Vijay Nagar Blasters (You)',
        team1Score: 148,
        team1Wickets: 4,
        team1Overs: '16.0',
        team2Name: 'Palasia Super Strikers',
        team2Score: 136,
        team2Wickets: 7,
        team2Overs: '16.0',
        winnerName: 'Vijay Nagar Blasters (You)',
        tournament: 'Indore Elite Turf League 2026',
        venue: 'Indore Turf Arena, Vijay Nagar (Court A)',
        date: '12 Aug 2026',
        time: '6:00 PM - 7:30 PM',
        sport: 'Cricket 16-Over',
        hasVerifiedUmpire: true,
        umpireName: 'Sunil Gavaskar (Level 2 Certified Umpire)',
        verificationTier: 'Tier 2',
        verificationStatus: 'Pending', // Pending | Verified | Disputed
        hoursRemaining: 36,
        mvp: 'Rahul Sharma (58 Runs off 32 balls)',
        ppsScore: 84.5
    },
    {
        id: 'MTC-97210',
        team1Name: 'Vijay Nagar Blasters (You)',
        team1Score: 162,
        team1Wickets: 3,
        team1Overs: '15.0',
        team2Name: 'Bhawarkua Royal Kings',
        team2Score: 160,
        team2Wickets: 9,
        team2Overs: '15.0',
        winnerName: 'Vijay Nagar Blasters (You)',
        tournament: 'Indore Captains Friendly Cup',
        venue: 'Champion Turf Ground, Bhawarkua',
        date: '08 Aug 2026',
        time: '8:00 PM - 9:30 PM',
        sport: 'Cricket 15-Over',
        hasVerifiedUmpire: false,
        verificationTier: 'Tier 1',
        verificationStatus: 'Verified',
        mvp: 'Aman Varma (72 Runs & 2 Wkts)',
        ppsScore: 92.0
    },
    {
        id: 'MTC-96104',
        team1Name: 'Annapurna Titans',
        team1Score: 180,
        team1Wickets: 6,
        team1Overs: '20.0',
        team2Name: 'Vijay Nagar Blasters (You)',
        team2Score: 175,
        team2Wickets: 8,
        team2Overs: '20.0',
        winnerName: 'Annapurna Titans',
        tournament: 'Super Corridor Champions Trophy 2026',
        venue: 'Skyline Sports Hub, Super Corridor',
        date: '01 Aug 2026',
        time: '7:00 PM - 10:00 PM',
        sport: 'Cricket 20-Over',
        hasVerifiedUmpire: true,
        umpireName: 'K. Parthasarathy (MPCA Panel)',
        verificationTier: 'Tier 3',
        verificationStatus: 'Verified',
        mvp: 'Karan Malhotra (85 Runs)',
        ppsScore: 110.2
    },
    {
        id: 'MTC-95089',
        team1Name: 'Vijay Nagar Blasters (You)',
        team1Score: 115,
        team1Wickets: 8,
        team1Overs: '12.0',
        team2Name: 'Rau Smashers Club',
        team2Score: 118,
        team2Wickets: 3,
        team2Overs: '10.2',
        winnerName: 'Rau Smashers Club',
        tournament: 'Casual Evening Scrimmage',
        venue: 'GreenField Turf, Rau',
        date: '24 Jul 2026',
        time: '6:00 PM - 7:00 PM',
        sport: 'Cricket 12-Over',
        hasVerifiedUmpire: false,
        verificationTier: 'Tier 1',
        verificationStatus: 'Disputed',
        disputeReason: 'Overcount discrepancy in the 9th over reported by Captain.',
        mvp: 'Rohit Sen (42 Runs)',
        ppsScore: 45.0
    }
]

export default function CustomerMatches() {
    const { addToast } = useToast()
    const [matches, setMatches] = useState(() => {
        const saved = localStorage.getItem('customer_matches_records')
        return saved ? JSON.parse(saved) : initialMockMatches
    })
    const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'pending' | 'verified' | 'disputed'
    const [selectedMatchForModal, setSelectedMatchForModal] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        localStorage.setItem('customer_matches_records', JSON.stringify(matches))
    }, [matches])

    const handleApproveMatch = (matchId, tier) => {
        setMatches(prev => prev.map(m => {
            if (m.id === matchId) {
                return {
                    ...m,
                    verificationStatus: 'Verified',
                    verificationTier: tier || m.verificationTier,
                    verifiedAt: new Date().toISOString()
                }
            }
            return m
        }))
    }

    const handleDisputeMatch = (matchId, reason) => {
        setMatches(prev => prev.map(m => {
            if (m.id === matchId) {
                return {
                    ...m,
                    verificationStatus: 'Disputed',
                    disputeReason: reason,
                    disputedAt: new Date().toISOString()
                }
            }
            return m
        }))
    }

    // Pending count
    const pendingMatches = matches.filter(m => m.verificationStatus === 'Pending')
    const verifiedMatches = matches.filter(m => m.verificationStatus === 'Verified')
    const disputedMatches = matches.filter(m => m.verificationStatus === 'Disputed')

    const filteredMatches = matches.filter(m => {
        if (activeFilter === 'pending') return m.verificationStatus === 'Pending'
        if (activeFilter === 'verified') return m.verificationStatus === 'Verified'
        if (activeFilter === 'disputed') return m.verificationStatus === 'Disputed'
        return true
    }).filter(m => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
            m.team1Name.toLowerCase().includes(q) ||
            m.team2Name.toLowerCase().includes(q) ||
            m.venue.toLowerCase().includes(q) ||
            m.id.toLowerCase().includes(q) ||
            m.tournament.toLowerCase().includes(q)
        )
    })

    const getTierBadge = (match) => {
        if (match.verificationStatus === 'Disputed') {
            return (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <HiExclamation className="w-3.5 h-3.5" /> Disputed Match
                </span>
            )
        }
        if (match.verificationStatus === 'Pending') {
            return (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <HiClock className="w-3.5 h-3.5 animate-pulse" /> Pending Handshake
                </span>
            )
        }
        if (match.verificationTier === 'Tier 3') {
            return (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 shadow-xs">
                    <HiTrophy className="w-3.5 h-3.5 text-purple-600" /> 🏆 Tier 3: Tournament (2.0x)
                </span>
            )
        }
        if (match.verificationTier === 'Tier 2') {
            return (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-xs">
                    <HiShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> ⚖️ Tier 2: Umpire Verified (1.5x)
                </span>
            )
        }
        return (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <HiCheck className="w-3.5 h-3.5 text-blue-600" /> ✓ Tier 1: Captain Handshake (1.0x)
            </span>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>🏏</span> My Matches & Verified Records
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-0.5">
                        Track career performances, verify opponent scorecards, and earn weighted leaderboard points.
                    </p>
                </div>
            </div>

            {/* PENDING VERIFICATION ALERT BANNER */}
            {pendingMatches.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-amber-500/20 shrink-0">
                            ⚖️
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md">
                                    Action Required ({pendingMatches.length} Pending)
                                </span>
                                <span className="text-xs font-mono font-bold text-amber-800">
                                    ⏳ 48-Hour Handshake Window Active
                                </span>
                            </div>
                            <h3 className="font-black text-slate-900 text-sm sm:text-base mt-1">
                                {pendingMatches[0].team1Name} vs {pendingMatches[0].team2Name}
                            </h3>
                            <p className="text-xs text-slate-600 font-medium mt-0.5">
                                Opponent submitted the match scorecard. Review batter & bowler stats to certify your official 1.5x ranking badge.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setSelectedMatchForModal(pendingMatches[0])}
                        className="w-full md:w-auto px-6 py-3 rounded-2xl bg-[#111827] hover:bg-slate-800 text-[#C8FF2E] font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span>Review & Verify Scorecard ➔</span>
                    </button>
                </div>
            )}

            {/* Quick Stats Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Matches</div>
                    <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{matches.length}</div>
                    <div className="text-[11px] text-emerald-600 font-bold mt-0.5">3 Wins · 1 Loss</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <div className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Verified Records</div>
                    <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">{verifiedMatches.length}</div>
                    <div className="text-[11px] text-slate-500 font-bold mt-0.5">100% Rank Weight</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <div className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Pending Handshake</div>
                    <div className="text-2xl font-black text-amber-700 mt-1 font-mono">{pendingMatches.length}</div>
                    <div className="text-[11px] text-amber-800 font-bold mt-0.5">Awaiting Confirmation</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <div className="text-[10px] font-black uppercase text-purple-600 tracking-wider">Career PPS Score</div>
                    <div className="text-2xl font-black text-purple-700 mt-1 font-mono">82.4</div>
                    <div className="text-[11px] text-purple-800 font-bold mt-0.5">Top 8% in Mumbai</div>
                </div>
            </div>

            {/* Filters & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                {/* Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
                    {[
                        { id: 'all', label: `All (${matches.length})` },
                        { id: 'pending', label: `Pending (${pendingMatches.length})` },
                        { id: 'verified', label: `Verified (${verifiedMatches.length})` },
                        { id: 'disputed', label: `Disputed (${disputedMatches.length})` },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                                activeFilter === tab.id
                                    ? 'bg-[#111827] text-white shadow-xs'
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search team, venue, match..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500"
                    />
                </div>
            </div>

            {/* Match Cards List */}
            <div className="space-y-4">
                {filteredMatches.map(m => {
                    const isWon = m.winnerName === m.team1Name
                    return (
                        <div
                            key={m.id}
                            className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-4"
                        >
                            {/* Card Top Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className="text-xs font-mono font-bold text-slate-400">#{m.id}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-xs font-bold text-slate-700">{m.tournament}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-xs text-slate-500 font-medium">{m.sport}</span>
                                </div>
                                <div>{getTierBadge(m)}</div>
                            </div>

                            {/* Match Content (Teams & Score) */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                {/* Teams Score Column (7 cols) */}
                                <div className="md:col-span-7 space-y-3">
                                    <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white ${
                                                isWon ? 'bg-emerald-600' : 'bg-slate-700'
                                            }`}>
                                                {isWon ? 'W' : 'L'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900">{m.team1Name}</div>
                                                <div className="text-[10px] font-mono text-slate-400">Overs: {m.team1Overs}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-black font-mono text-slate-900">{m.team1Score}/{m.team1Wickets}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white ${
                                                !isWon ? 'bg-emerald-600' : 'bg-slate-400'
                                            }`}>
                                                {!isWon ? 'W' : 'L'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900">{m.team2Name}</div>
                                                <div className="text-[10px] font-mono text-slate-400">Overs: {m.team2Overs}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-black font-mono text-slate-900">{m.team2Score}/{m.team2Wickets}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Meta & Actions Column (5 cols) */}
                                <div className="md:col-span-5 bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between space-y-3 h-full">
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex items-center justify-between text-slate-600 font-medium">
                                            <span>📍 Venue:</span>
                                            <strong className="text-slate-900 font-bold truncate max-w-[180px]">{m.venue}</strong>
                                        </div>
                                        <div className="flex items-center justify-between text-slate-600 font-medium">
                                            <span>📅 Schedule:</span>
                                            <strong className="text-slate-900 font-bold">{m.date} · {m.time.split('-')[0]}</strong>
                                        </div>
                                        <div className="flex items-center justify-between text-slate-600 font-medium">
                                            <span>⭐ MVP:</span>
                                            <strong className="text-emerald-700 font-black">{m.mvp}</strong>
                                        </div>
                                        {m.umpireName && (
                                            <div className="flex items-center justify-between text-slate-600 font-medium pt-1 border-t border-slate-200">
                                                <span>⚖️ Scorer:</span>
                                                <strong className="text-slate-900 font-bold truncate max-w-[180px]">{m.umpireName}</strong>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedMatchForModal(m)}
                                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                                                m.verificationStatus === 'Pending'
                                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                    : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200'
                                            }`}
                                        >
                                            {m.verificationStatus === 'Pending' ? (
                                                <>
                                                    <HiCheck className="w-4 h-4" />
                                                    <span>Review & Verify</span>
                                                </>
                                            ) : (
                                                <span>View Full Scorecard ➔</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {filteredMatches.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl mb-2">
                            🔍
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">No matches found</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Try switching filter tabs or changing your search terms.</p>
                    </div>
                )}
            </div>

            {/* Scorecard Modal */}
            <MatchScoreVerificationModal
                match={selectedMatchForModal}
                isOpen={!!selectedMatchForModal}
                onClose={() => setSelectedMatchForModal(null)}
                onApprove={handleApproveMatch}
                onDispute={handleDisputeMatch}
            />
        </div>
    )
}
