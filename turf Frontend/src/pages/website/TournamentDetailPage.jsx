import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HiArrowLeft, HiLocationMarker, HiCalendar, HiDocumentText, HiX } from 'react-icons/hi'
import BracketComponent from '../../components/ui/BracketComponent'
import { getTournamentById, getFixtures, getLeaderboard, registerTeam } from '../../services/tournamentService'

// Fallback bracket for display when no API fixtures available
const fallbackBracketRounds = [
    {
        name: 'Quarter Finals', matches: [
            { teams: [{ seed: 1, name: 'TBD', score: '—' }, { seed: 2, name: 'TBD', score: '—' }] },
            { teams: [{ seed: 3, name: 'TBD', score: '—' }, { seed: 4, name: 'TBD', score: '—' }] },
        ]
    },
    {
        name: 'Final', matches: [
            { teams: [{ seed: '?', name: 'TBD', score: '—' }, { seed: '?', name: 'TBD', score: '—' }] },
        ]
    },
]

// Default rules and perks based on sport
const getDefaultRules = (sport) => {
    const isCricket = (sport || '').toLowerCase().includes('cricket')
    return isCricket ? [
        'Strict 10-over campaign format',
        'Minimum active roster size: 6 players',
        'DRS protocol unavailable in this tier',
        'Match referee decisions are absolute',
        'Squads must synchronize 30 mins pre-deployment'
    ] : [
        '15-minute halves with a 5-minute break',
        '7v7 squad layout (Max 10 players registered)',
        'Strictly studs/turf shoes allowed on pitch',
        'Tie-breaker: Instant 3-penalty shootout',
        'Respect FIFA Fair Play directives'
    ]
}

const getDefaultTimeline = (sport) => {
    const isCricket = (sport || '').toLowerCase().includes('cricket')
    return isCricket ? [
        { time: '08:00 AM', event: 'Captains Briefing & Toss' },
        { time: '09:00 AM', event: 'Round 1 Matches Begin' },
        { time: '01:00 PM', event: 'Midday Pitch Maintenance' },
        { time: '02:00 PM', event: 'Semi-Final Matches' },
        { time: '05:00 PM', event: 'Grand Finale & Ceremony' }
    ] : [
        { time: '08:30 AM', event: 'Captains Briefing & Draws' },
        { time: '09:00 AM', event: 'Group Stage Kicks Off' },
        { time: '01:00 PM', event: 'Lunch & Hydration Break' },
        { time: '02:30 PM', event: 'Semi-Final Matches' },
        { time: '04:00 PM', event: 'Grand Finale & Ceremony' }
    ]
}

const getDefaultPerks = (sport) => {
    const isCricket = (sport || '').toLowerCase().includes('cricket')
    return isCricket ? [
        'Professional Turf Pitch Matting',
        'Premium Leather Match Balls Provided',
        'YouTube Live Stream with Commentary',
        'Hydration station (Electrolytes & water)',
        'Certified Medical & First-Aid Support'
    ] : [
        'High-Definition YouTube Stream',
        'Professional IFA-Certified Referees',
        'Free RedBull & Electral Hydration',
        'Qualified On-Field Medical Team',
        'Air-Conditioned Player Lounges'
    ]
}

export default function TournamentDetailPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [tournament, setTournament] = useState(null)
    const [fixtures, setFixtures] = useState([])
    const [leaderboard, setLeaderboard] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('bracket')
    const [showRegModal, setShowRegModal] = useState(false)
    const [regLoading, setRegLoading] = useState(false)
    const [regSuccess, setRegSuccess] = useState(false)
    const [regForm, setRegForm] = useState({
        teamName: '', captainName: '', captainEmail: '', captainMobile: '', jerseyColor: 'Blue', paymentMethod: 'UPI',
        players: [{ name: '', mobile: '', jerseyNumber: '', role: 'Player' }]
    })

    useEffect(() => {
        window.scrollTo(0, 0)
        fetchData()
    }, [id])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await getTournamentById(id)
            if (res.success && res.data) {
                setTournament(res.data)
            }
            // Fetch fixtures
            try {
                const fRes = await getFixtures(id)
                if (fRes.success && Array.isArray(fRes.data)) setFixtures(fRes.data)
            } catch (e) { /* no fixtures yet */ }
            // Fetch leaderboard
            try {
                const lRes = await getLeaderboard(id)
                if (lRes.success && Array.isArray(lRes.data)) setLeaderboard(lRes.data)
            } catch (e) { /* no leaderboard yet */ }
        } catch (err) {
            console.error('Error fetching tournament:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        if (!regForm.teamName || !regForm.captainName || !regForm.captainMobile) return
        setRegLoading(true)
        try {
            const res = await registerTeam(id, regForm)
            if (res.success) {
                setRegSuccess(true)
                setTimeout(() => {
                    setShowRegModal(false)
                    setRegSuccess(false)
                    setRegForm({ teamName: '', captainName: '', captainEmail: '', captainMobile: '', jerseyColor: 'Blue', paymentMethod: 'UPI', players: [{ name: '', mobile: '', jerseyNumber: '', role: 'Player' }] })
                    fetchData()
                }, 2000)
            }
        } catch (err) {
            alert(err.message || 'Registration failed')
        } finally {
            setRegLoading(false)
        }
    }

    const addPlayer = () => {
        setRegForm(prev => ({ ...prev, players: [...prev.players, { name: '', mobile: '', jerseyNumber: '', role: 'Player' }] }))
    }

    const removePlayer = (idx) => {
        setRegForm(prev => ({ ...prev, players: prev.players.filter((_, i) => i !== idx) }))
    }

    const updatePlayer = (idx, field, value) => {
        setRegForm(prev => {
            const players = [...prev.players]
            players[idx] = { ...players[idx], [field]: value }
            return { ...prev, players }
        })
    }

    // Build bracket rounds from fixtures
    const bracketRounds = fixtures.length > 0
        ? Object.entries(fixtures.reduce((acc, f) => {
            const round = f.round_name || 'Round 1'
            if (!acc[round]) acc[round] = []
            acc[round].push({
                teams: [
                    { seed: f.match_number || 1, name: f.team1_name || 'TBD', score: f.team1_score ?? '—', winner: f.winner_team_id === f.team1_id },
                    { seed: f.match_number || 2, name: f.team2_name || 'TBD', score: f.team2_score ?? '—', winner: f.winner_team_id === f.team2_id }
                ]
            })
            return acc
        }, {})).map(([name, matches]) => ({ name, matches }))
        : fallbackBracketRounds

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Loading Tournament...</p>
                </div>
            </div>
        )
    }

    if (!tournament) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-400 text-lg font-bold">Tournament not found</p>
                    <button onClick={() => navigate('/tournaments')} className="mt-4 px-6 py-2 bg-emerald-500 text-slate-950 rounded-full text-xs font-black uppercase">Back to Tournaments</button>
                </div>
            </div>
        )
    }

    const t = tournament
    const sport = t.sport || t.sport_name || 'Sports'
    const name = t.name || t.title || 'Tournament'
    const image = t.banner || 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800'
    const entryFee = t.entry_fee || t.entryFee || 0
    const prize = t.prize_pool || t.prizePool || String((t.winner_prize || 0) + (t.runner_prize || 0))
    const format = t.format || 'Knockout'
    const maxTeams = t.max_teams || t.maxTeams || 16
    const registrations = t.registrations || 0
    const spotsLeft = maxTeams - registrations
    const teamsList = t.teamsList || []
    const rules = t.rules ? (typeof t.rules === 'string' ? t.rules.split('\n').filter(Boolean) : t.rules) : getDefaultRules(sport)
    const rulesArray = Array.isArray(rules) ? rules : getDefaultRules(sport)
    const timeline = getDefaultTimeline(sport)
    const perks = getDefaultPerks(sport)
    const isOpen = t.status === 'Approved' && spotsLeft > 0

    const formatDate = (dateVal) => {
        if (!dateVal) return ''
        const d = new Date(dateVal)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    }
    const dateStr = t.date || `${formatDate(t.start_date)} - ${formatDate(t.end_date)}`

    return (
        <div className="min-h-screen bg-slate-950 pb-20 relative overflow-x-clip">
            {/* Hero Image Header */}
            <div className="w-full px-5 md:px-10 lg:px-20 pt-28 pb-6 relative z-10">
                {/* Background subtle banner overlay */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <img src={image} alt={name} className="w-full h-full object-cover opacity-10 blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950" />
                </div>
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Back Button Pill */}
                        <button
                            onClick={() => navigate('/tournaments')}
                            className="inline-flex items-center justify-center w-10 h-10 bg-slate-900/60 hover:bg-slate-800 hover:text-emerald-400 border border-white/10 rounded-full text-slate-400 hover:border-emerald-500/30 transition-all shrink-0 cursor-pointer shadow-lg backdrop-blur-sm group"
                            title="Back to Tourney Hub"
                        >
                            <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        </button>

                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-1.5">
                                <h1 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">
                                    {name}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-slate-900 border border-white/10 text-[8px] font-black tracking-widest text-white uppercase rounded-md">
                                        {sport}
                                    </span>
                                    <span className={`px-2 py-0.5 border text-[8px] font-black tracking-widest uppercase rounded-md flex items-center gap-1 ${isOpen ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-900/60 border-white/10 text-slate-400'}`}>
                                        {isOpen && <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />}
                                        {t.status}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold tracking-widest uppercase text-slate-400">
                                <span className="flex items-center gap-1"><HiLocationMarker className="text-emerald-500 w-3.5 h-3.5" /> {t.court_name || t.courtName || 'Main Turf'}</span>
                                <span className="text-slate-700">|</span>
                                <span className="flex items-center gap-1"><HiCalendar className="text-amber-500 w-3.5 h-3.5" /> {dateStr}</span>
                            </div>
                        </div>
                    </div>

                    {/* Core Stats Grid */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {[
                            { l: 'Prize Pool', v: `₹${prize}`, c: 'text-amber-400', b: 'border-amber-500/25 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-amber-500/5' },
                            { l: 'Entry Fee', v: `₹${entryFee}`, c: 'text-white', b: 'border-white/15 bg-white/5' },
                            { l: 'Format', v: format, c: 'text-emerald-400', b: 'border-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-500/5' },
                            { l: 'Spots Left', v: `${spotsLeft}/${maxTeams}`, c: 'text-emerald-400', b: 'border-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-500/5' }
                        ].map(s => (
                            <div key={s.l} className={`backdrop-blur-md rounded-2xl px-4 py-2.5 text-center border transition-all duration-300 ${s.b}`}>
                                <p className={`text-sm lg:text-base font-black italic tracking-tighter uppercase tabular-nums block ${s.c}`}>{s.v}</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{s.l}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full px-5 md:px-10 lg:px-20 relative z-20 mt-6">
                {/* Tab Navigation */}
                <div className="flex items-center gap-2 mb-8 bg-slate-900/60 p-1.5 rounded-full border border-white/10 backdrop-blur-xl w-fit">
                    {[
                        { key: 'bracket', label: 'Bracket' },
                        { key: 'leaderboard', label: 'Leaderboard' },
                        { key: 'info', label: 'Info & Rules' }
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${activeTab === tab.key ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
                    {/* Main Content Space */}
                    <div className="lg:w-[65%] xl:w-[70%] space-y-8">

                        {/* Bracket Tab */}
                        {activeTab === 'bracket' && (
                            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
                                <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 mb-8 flex items-center gap-2">
                                    <span className="h-px w-4 bg-emerald-500/50" /> COMPETITION BRACKET
                                </h2>
                                <div className="overflow-x-auto pb-4 custom-scrollbar">
                                    <BracketComponent rounds={bracketRounds} />
                                </div>
                            </div>
                        )}

                        {/* Leaderboard Tab */}
                        {activeTab === 'leaderboard' && (
                            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
                                <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 mb-8 flex items-center gap-2">
                                    <span className="h-px w-4 bg-emerald-500/50" /> LEADERBOARD STANDINGS
                                </h2>
                                {leaderboard.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    {['#', 'Team', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'PTS'].map(h => (
                                                        <th key={h} className="text-[9px] font-black tracking-widest uppercase text-slate-500 pb-3 px-2">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leaderboard.map((row, i) => (
                                                    <tr key={row.id || i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                        <td className="py-3 px-2 text-xs font-black text-emerald-400">{row.rank_position || i + 1}</td>
                                                        <td className="py-3 px-2 text-xs font-bold text-white">{row.team_name || 'Team'}</td>
                                                        <td className="py-3 px-2 text-xs text-slate-400">{row.matches_played}</td>
                                                        <td className="py-3 px-2 text-xs text-emerald-400">{row.wins}</td>
                                                        <td className="py-3 px-2 text-xs text-slate-400">{row.draws}</td>
                                                        <td className="py-3 px-2 text-xs text-red-400">{row.losses}</td>
                                                        <td className="py-3 px-2 text-xs text-slate-400">{row.goals_for}</td>
                                                        <td className="py-3 px-2 text-xs text-slate-400">{row.goals_against}</td>
                                                        <td className="py-3 px-2 text-xs text-slate-300 font-bold">{row.goal_difference}</td>
                                                        <td className="py-3 px-2 text-sm font-black text-amber-400">{row.points}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">No standings available yet</p>
                                        <p className="text-slate-600 text-xs mt-2">Leaderboard will appear once matches begin</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Info & Rules Tab */}
                        {activeTab === 'info' && (
                            <>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {/* Rules */}
                                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                                        <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 mb-6 flex items-center gap-2">
                                            <span className="h-px w-4 bg-emerald-500/50" /> TOURNAMENT DIRECTIVES
                                        </h2>
                                        <ul className="space-y-5">
                                            {rulesArray.map((r, i) => (
                                                <li key={i} className="flex items-start gap-4 text-sm font-bold text-slate-200 tracking-wide">
                                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)] mt-0.5">
                                                        {i + 1}
                                                    </div>
                                                    <span className="leading-relaxed">{r}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Registered Teams */}
                                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 flex items-center gap-2">
                                                <span className="h-px w-4 bg-emerald-500/50" /> ENLISTED SQUADS
                                            </h2>
                                            <span className="px-2.5 py-1 bg-slate-950 border border-white/10 rounded-md text-[10px] font-bold text-slate-400">
                                                {registrations} / {maxTeams} MAX
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-white">
                                            {teamsList.filter(tm => tm.status === 'Approved').map((tm, i) => (
                                                <div key={tm.id || i} className="flex items-center gap-2.5 px-3 py-3 bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-emerald-500/30 rounded-xl text-sm transition-all duration-300 group cursor-default shadow-md">
                                                    <span className="w-6 h-6 rounded-full bg-slate-950 border border-white/10 text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 flex items-center justify-center text-[10px] font-black transition-colors shrink-0">
                                                        {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                    <span className="font-black tracking-wide uppercase text-[11px] text-slate-200 group-hover:text-emerald-400 transition-colors truncate">{tm.team_name}</span>
                                                </div>
                                            ))}
                                            {Array.from({ length: Math.max(0, maxTeams - registrations) }).map((_, i) => (
                                                <div key={`empty-${i}`} className="flex items-center gap-2.5 px-3 py-3 bg-slate-950/20 border border-white/5 border-dashed rounded-xl opacity-40">
                                                    <span className="w-6 h-6 rounded-full bg-slate-950/40 border border-white/5 border-dashed text-slate-600 flex items-center justify-center text-[9px] font-black shrink-0">--</span>
                                                    <span className="font-bold tracking-wide uppercase text-[10px] text-slate-500">AWAITING</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {/* Schedule Timeline */}
                                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                                        <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 mb-6 flex items-center gap-2">
                                            <span className="h-px w-4 bg-emerald-500/50" /> TOURNAMENT TIMELINE
                                        </h2>
                                        <div className="relative pl-6 border-l border-white/10 space-y-4">
                                            {timeline.map((item, idx) => (
                                                <div key={idx} className="relative">
                                                    <div className="absolute -left-[30px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">{item.time}</span>
                                                    <span className="text-xs font-bold text-slate-200 tracking-wide">{item.event}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Turf Perks */}
                                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                                        <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 mb-6 flex items-center gap-2">
                                            <span className="h-px w-4 bg-emerald-500/50" /> TURF AMENITIES & PERKS
                                        </h2>
                                        <ul className="space-y-4">
                                            {perks.map((p, i) => (
                                                <li key={i} className="flex items-center gap-4 text-xs font-bold text-slate-200 tracking-wide">
                                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                                        ✓
                                                    </div>
                                                    <span className="leading-relaxed">{p}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Side: Action Widget */}
                    <div className="lg:w-[35%] xl:w-[30%] lg:sticky lg:top-28 self-start">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-b from-emerald-500/20 to-teal-500/0 rounded-2xl blur" />
                            <div className="relative bg-slate-950 border border-emerald-500/20 rounded-2xl p-6 shadow-2xl">
                                <h3 className="text-xl font-black italic tracking-tighter uppercase text-white border-b border-white/10 pb-4 mb-6">REGISTRATION CLEARANCE</h3>

                                <div className="space-y-4 text-[10px] font-bold tracking-widest uppercase mb-8">
                                    <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-white/5">
                                        <span className="text-slate-500">Entry Fee</span>
                                        <span className="text-white text-base tabular-nums">₹{entryFee}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
                                        <span className="text-amber-500/70">Prize Pool</span>
                                        <span className="text-amber-400 font-black tabular-nums text-lg">₹{prize}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                                        <span className="text-emerald-500/70">Open Slots</span>
                                        <span className="text-emerald-400 font-black text-lg tabular-nums">{spotsLeft}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => isOpen && setShowRegModal(true)}
                                    disabled={!isOpen}
                                    className={`w-full py-4 text-xs font-black italic tracking-widest uppercase rounded-xl transition-all duration-300 cursor-pointer ${isOpen
                                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    {isOpen ? 'REGISTER SQUAD' : 'REGISTRATION CLOSED'}
                                </button>

                                <div className="flex items-center gap-2 mt-6 justify-center text-slate-500 border-t border-white/10 pt-4">
                                    <HiDocumentText className="w-4 h-4 shrink-0" />
                                    <p className="text-[9px] font-bold uppercase tracking-widest">
                                        Entry fee secured in escrow until match deployment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Registration Modal */}
            {showRegModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-slate-950 border border-emerald-500/20 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h3 className="text-lg font-black italic uppercase text-white tracking-tighter">Register Your Squad</h3>
                            <button onClick={() => setShowRegModal(false)} className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                                <HiX className="w-4 h-4" />
                            </button>
                        </div>

                        {regSuccess ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">✓</span>
                                </div>
                                <p className="text-emerald-400 font-black uppercase tracking-widest text-sm">Registration Successful!</p>
                                <p className="text-slate-500 text-xs mt-2">Your team has been registered for this tournament.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleRegister} className="p-6 space-y-5">
                                {/* Team Info */}
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Team Name *</label>
                                    <input type="text" required value={regForm.teamName} onChange={e => setRegForm(prev => ({ ...prev, teamName: e.target.value }))}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none transition-colors"
                                        placeholder="e.g. Thunder XI"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Captain Name *</label>
                                        <input type="text" required value={regForm.captainName} onChange={e => setRegForm(prev => ({ ...prev, captainName: e.target.value }))}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none transition-colors"
                                            placeholder="Captain Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Captain Mobile *</label>
                                        <input type="tel" required value={regForm.captainMobile} onChange={e => setRegForm(prev => ({ ...prev, captainMobile: e.target.value }))}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none transition-colors"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Captain Email</label>
                                        <input type="email" value={regForm.captainEmail} onChange={e => setRegForm(prev => ({ ...prev, captainEmail: e.target.value }))}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none transition-colors"
                                            placeholder="captain@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Jersey Color</label>
                                        <select value={regForm.jerseyColor} onChange={e => setRegForm(prev => ({ ...prev, jerseyColor: e.target.value }))}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                                        >
                                            {['Blue', 'Red', 'Green', 'Yellow', 'White', 'Black', 'Orange', 'Purple'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Players Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Players Roster</label>
                                        <button type="button" onClick={addPlayer} className="text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors">+ Add Player</button>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {regForm.players.map((p, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-slate-900/60 border border-white/5 rounded-xl p-2.5">
                                                <input type="text" placeholder="Player Name" value={p.name} onChange={e => updatePlayer(idx, 'name', e.target.value)}
                                                    className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
                                                />
                                                <input type="text" placeholder="Mobile" value={p.mobile} onChange={e => updatePlayer(idx, 'mobile', e.target.value)}
                                                    className="w-24 bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
                                                />
                                                <input type="number" placeholder="#" value={p.jerseyNumber} onChange={e => updatePlayer(idx, 'jerseyNumber', e.target.value)}
                                                    className="w-12 bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none text-center"
                                                />
                                                {regForm.players.length > 1 && (
                                                    <button type="button" onClick={() => removePlayer(idx)} className="text-red-500 hover:text-red-400 text-xs">✕</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Payment Method</label>
                                    <div className="flex gap-2">
                                        {['UPI', 'CASH', 'CARD', 'WALLET'].map(m => (
                                            <button key={m} type="button" onClick={() => setRegForm(prev => ({ ...prev, paymentMethod: m }))}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${regForm.paymentMethod === m
                                                    ? 'bg-emerald-500 text-slate-950'
                                                    : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Entry Fee Info */}
                                <div className="flex justify-between items-center bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
                                    <span className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest">Entry Fee</span>
                                    <span className="text-amber-400 font-black text-lg tabular-nums">₹{entryFee}</span>
                                </div>

                                <button type="submit" disabled={regLoading}
                                    className="w-full py-4 bg-emerald-500 text-slate-950 text-xs font-black italic tracking-widest uppercase rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
                                >
                                    {regLoading ? 'REGISTERING...' : 'CONFIRM REGISTRATION'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
