import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { HiArrowLeft, HiLocationMarker, HiCalendar, HiDocumentText, HiX } from 'react-icons/hi'
import BracketComponent from '../../components/ui/BracketComponent'
import CustomSelect from '../../components/ui/CustomSelect'
import { getTournamentById, getFixtures, getLeaderboard, registerTeam, fallbackPublicTournaments } from '../../services/tournamentService'

const jerseyColorOptions = [
    { value: 'Blue', label: 'Royal Blue', color: '#2563EB' },
    { value: 'Red', label: 'Crimson Red', color: '#DC2626' },
    { value: 'Green', label: 'Emerald Green', color: '#16A34A' },
    { value: 'Yellow', label: 'Electric Yellow', color: '#EAB308' },
    { value: 'White', label: 'Pure White', color: '#FFFFFF' },
    { value: 'Black', label: 'Midnight Black', color: '#111827' },
    { value: 'Orange', label: 'Sunset Orange', color: '#F97316' },
    { value: 'Purple', label: 'Deep Purple', color: '#9333EA' },
];

// Fallback bracket for display when no API fixtures available
const fallbackBracketRounds = [
    {
        name: 'Quarter Finals', matches: [
            { teams: [{ seed: 1, name: 'Vijay Nagar Blasters', score: '148/4', winner: true }, { seed: 2, name: 'Palasia Super Strikers', score: '136/7' }] },
            { teams: [{ seed: 3, name: 'Bhawarkua Titans', score: '162/3', winner: true }, { seed: 4, name: 'Chappan Strikers', score: '158/8' }] },
        ]
    },
    {
        name: 'Final', matches: [
            { teams: [{ seed: 1, name: 'Vijay Nagar Blasters', score: 'Live Soon' }, { seed: 3, name: 'Bhawarkua Titans', score: 'Live Soon' }] },
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
    const location = useLocation()
    const initialT = fallbackPublicTournaments.find(t => t.id === id) || fallbackPublicTournaments[0]
    const [tournament, setTournament] = useState(initialT)
    const [fixtures, setFixtures] = useState([])
    const [leaderboard, setLeaderboard] = useState([])
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('bracket')
    const [showRegModal, setShowRegModal] = useState(false)
    const [regLoading, setRegLoading] = useState(false)
    const [regSuccess, setRegSuccess] = useState(false)
    const [regForm, setRegForm] = useState({
        teamName: '', captainName: '', captainEmail: '', captainMobile: '', jerseyColor: 'Blue', paymentMethod: 'UPI',
        players: [{ name: '', mobile: '', jerseyNumber: '', role: 'Player' }]
    })

    useEffect(() => {
        if (showRegModal) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [showRegModal])

    useEffect(() => {
        window.scrollTo(0, 0)
        const matchT = fallbackPublicTournaments.find(t => t.id === id) || fallbackPublicTournaments[0]
        setTournament(matchT)
        if (location.search.includes('register=true')) {
            setShowRegModal(true)
        }
        fetchData()
    }, [id, location.search])

    const fetchData = async () => {
        try {
            const [tRes, fRes, lRes] = await Promise.all([
                getTournamentById(id).catch(() => null),
                getFixtures(id).catch(() => null),
                getLeaderboard(id).catch(() => null)
            ])

            if (tRes && tRes.success && tRes.data) {
                setTournament(tRes.data)
            }
            if (fRes && fRes.success && Array.isArray(fRes.data)) {
                setFixtures(fRes.data)
            }
            if (lRes && lRes.success && Array.isArray(lRes.data)) {
                setLeaderboard(lRes.data)
            }
        } catch (err) {
            console.error('Error background fetching tournament details:', err)
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
                setTournament(prev => ({
                    ...prev,
                    registrations: ((prev && prev.registrations) || 12) + 1
                }))
                setTimeout(() => {
                    setShowRegModal(false)
                    setRegSuccess(false)
                    setRegForm({ teamName: '', captainName: '', captainEmail: '', captainMobile: '', jerseyColor: 'Blue', paymentMethod: 'UPI', players: [{ name: '', mobile: '', jerseyNumber: '', role: 'Player' }] })
                }, 1800)
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
            <div className="min-h-screen bg-white text-[#111827] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#6B7280] text-xs font-black uppercase tracking-widest">Loading Tournament...</p>
                </div>
            </div>
        )
    }

    if (!tournament) {
        return (
            <div className="min-h-screen bg-white text-[#111827] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[#6B7280] text-lg font-bold">Tournament not found</p>
                    <button onClick={() => navigate('/tournaments')} className="mt-4 px-6 py-2 bg-[#C8FF2E] text-[#111827] rounded-full text-xs font-black uppercase border border-[#B5F000]">Back to Tournaments</button>
                </div>
            </div>
        )
    }

    const t = tournament
    const sport = t.sport || t.sport_name || 'Sports'
    const name = t.name || t.title || 'Tournament'
    const image = t.banner || '/images/turf1.png'
    const entryFee = t.entryFee || t.entry_fee || 500
    const prize = t.prize || t.prizePool || t.prize_pool || String((t.winner_prize || 0) + (t.runner_prize || 0)) || '50,000'
    const format = t.format || 'Knockout'
    const maxTeams = t.max_teams || t.maxTeams || 16
    const registrations = t.registrations ?? 12
    const spotsLeft = Math.max(0, maxTeams - registrations)
    const teamsList = t.teamsList || []
    const rules = t.rules ? (typeof t.rules === 'string' ? t.rules.split('\n').filter(Boolean) : t.rules) : getDefaultRules(sport)
    const rulesArray = Array.isArray(rules) ? rules : getDefaultRules(sport)
    const timeline = getDefaultTimeline(sport)
    const perks = getDefaultPerks(sport)
    const isOpen = (t.status === 'Approved' || t.status === 'Active' || t.status === 'Upcoming' || t.status === 'Registration Open') && spotsLeft > 0

    const formatDate = (dateVal) => {
        if (!dateVal) return ''
        const d = new Date(dateVal)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    }
    const dateStr = t.date || `${formatDate(t.start_date)} - ${formatDate(t.end_date)}`

    return (
        <div className="min-h-screen bg-white text-[#111827] pb-20 relative overflow-x-clip pt-4">
            {/* Hero Image Header */}
            <div className="w-full px-5 md:px-10 lg:px-20 pt-24 pb-6 relative z-10">
                {/* Background subtle glow */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[300px] bg-gradient-to-b from-emerald-50/50 via-white to-transparent pointer-events-none" />
                </div>
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#E5E7EB] pb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Back Button Pill */}
                        <button
                            onClick={() => navigate('/tournaments')}
                            className="inline-flex items-center justify-center w-10 h-10 bg-white hover:bg-slate-50 hover:text-[#16A34A] border border-[#E5E7EB] rounded-full text-[#111827] transition-all shrink-0 cursor-pointer shadow-xs group"
                            title="Back to Tourney Hub"
                        >
                            <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        </button>

                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-1.5">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#111827] italic uppercase tracking-tight">
                                    {name}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 bg-slate-100 border border-[#E5E7EB] text-[9px] font-black tracking-wider text-[#111827] uppercase rounded-full">
                                        {sport}
                                    </span>
                                    <span className={`px-2.5 py-0.5 border text-[9px] font-black tracking-wider uppercase rounded-full flex items-center gap-1 ${isOpen ? 'bg-green-50 border-green-200 text-[#16A34A]' : 'bg-slate-100 border-[#E5E7EB] text-[#6B7280]'}`}>
                                        {isOpen && <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />}
                                        {t.status}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold tracking-wider uppercase text-[#6B7280]">
                                <span className="flex items-center gap-1"><HiLocationMarker className="text-[#16A34A] w-3.5 h-3.5" /> {t.court_name || t.courtName || 'Main Turf'}</span>
                                <span className="text-[#E5E7EB]">|</span>
                                <span className="flex items-center gap-1"><HiCalendar className="text-amber-500 w-3.5 h-3.5" /> {dateStr}</span>
                            </div>
                        </div>
                    </div>

                    {/* Core Stats Grid */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {[
                            { l: 'Prize Pool', v: `₹${prize}`, c: 'text-amber-700', b: 'border-amber-200 bg-amber-50 shadow-xs' },
                            { l: 'Entry Fee', v: `₹${entryFee}`, c: 'text-[#111827]', b: 'border-[#E5E7EB] bg-slate-50 shadow-xs' },
                            { l: 'Format', v: format, c: 'text-[#16A34A]', b: 'border-green-200 bg-green-50 shadow-xs' },
                            { l: 'Spots Left', v: `${spotsLeft}/${maxTeams}`, c: 'text-[#16A34A]', b: 'border-green-200 bg-green-50 shadow-xs' }
                        ].map(s => (
                            <div key={s.l} className={`rounded-2xl px-4 py-2 text-center border transition-all duration-300 ${s.b}`}>
                                <p className={`text-sm lg:text-base font-black italic tracking-tight uppercase tabular-nums block ${s.c}`}>{s.v}</p>
                                <p className="text-[8px] font-black text-[#6B7280] uppercase tracking-widest mt-0.5">{s.l}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full px-5 md:px-10 lg:px-20 relative z-20 mt-6">
                {/* Tab Navigation */}
                <div className="flex items-center gap-2 mb-8 bg-[#F7F9FC] p-1.5 rounded-full border border-[#E5E7EB] shadow-xs w-fit">
                    {[
                        { key: 'bracket', label: 'Bracket' },
                        { key: 'leaderboard', label: 'Leaderboard' },
                        { key: 'info', label: 'Info & Rules' }
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2 rounded-full text-[10px] font-black tracking-wider uppercase transition-all duration-300 cursor-pointer ${activeTab === tab.key ? 'bg-[#C8FF2E] text-[#111827] border border-[#B5F000] shadow-xs' : 'text-[#6B7280] hover:text-[#111827]'}`}
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
                            <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-6 sm:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.08)] relative overflow-hidden">
                                <h2 className="text-xs font-black tracking-[0.25em] uppercase text-[#16A34A] mb-8 flex items-center gap-2">
                                    <span>🏆</span> COMPETITION BRACKET
                                </h2>
                                <div className="overflow-x-auto pb-4 custom-scrollbar">
                                    <BracketComponent rounds={bracketRounds} />
                                </div>
                            </div>
                        )}

                        {/* Leaderboard Tab */}
                        {activeTab === 'leaderboard' && (
                            <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-6 sm:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.08)]">
                                <h2 className="text-xs font-black tracking-[0.25em] uppercase text-[#16A34A] mb-8 flex items-center gap-2">
                                    <span>📊</span> LEADERBOARD STANDINGS
                                </h2>
                                {leaderboard.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-[#E5E7EB] bg-[#F7F9FC]">
                                                    {['#', 'Team', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'PTS'].map(h => (
                                                        <th key={h} className="text-[9px] font-black tracking-widest uppercase text-[#6B7280] py-3 px-3">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#E5E7EB]">
                                                {leaderboard.map((row, i) => (
                                                    <tr key={row.id || i} className="hover:bg-green-50/50 transition-colors">
                                                        <td className="py-3 px-3 text-xs font-black text-[#16A34A]">{row.rank_position || i + 1}</td>
                                                        <td className="py-3 px-3 text-xs font-bold text-[#111827]">{row.team_name || 'Team'}</td>
                                                        <td className="py-3 px-3 text-xs text-[#6B7280]">{row.matches_played}</td>
                                                        <td className="py-3 px-3 text-xs text-[#16A34A] font-bold">{row.wins}</td>
                                                        <td className="py-3 px-3 text-xs text-[#6B7280]">{row.draws}</td>
                                                        <td className="py-3 px-3 text-xs text-red-500 font-bold">{row.losses}</td>
                                                        <td className="py-3 px-3 text-xs text-[#6B7280]">{row.goals_for}</td>
                                                        <td className="py-3 px-3 text-xs text-[#6B7280]">{row.goals_against}</td>
                                                        <td className="py-3 px-3 text-xs text-[#111827] font-bold">{row.goal_difference}</td>
                                                        <td className="py-3 px-3 text-sm font-black text-amber-700">{row.points}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-[#6B7280] text-sm font-bold uppercase tracking-widest">No standings available yet</p>
                                        <p className="text-[#9CA3AF] text-xs mt-1">Leaderboard will appear once matches begin</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Info & Rules Tab */}
                        {activeTab === 'info' && (
                            <>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {/* Rules */}
                                    <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-6 shadow-xs">
                                        <h2 className="text-xs font-black tracking-[0.25em] uppercase text-[#16A34A] mb-6 flex items-center gap-2">
                                            <span>📋</span> TOURNAMENT DIRECTIVES
                                        </h2>
                                        <ul className="space-y-4">
                                            {rulesArray.map((r, i) => (
                                                <li key={i} className="flex items-start gap-3.5 text-xs font-bold text-[#111827] tracking-wide">
                                                    <div className="w-6 h-6 rounded-full bg-green-50 border border-green-200 text-[#16A34A] flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                                                        {i + 1}
                                                    </div>
                                                    <span className="leading-relaxed">{r}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Registered Teams */}
                                    <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-6 shadow-xs">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xs font-black tracking-[0.25em] uppercase text-[#16A34A] flex items-center gap-2">
                                                <span>🛡️</span> ENLISTED SQUADS
                                            </h2>
                                            <span className="px-2.5 py-1 bg-slate-50 border border-[#E5E7EB] rounded-full text-[10px] font-bold text-[#6B7280]">
                                                {registrations} / {maxTeams} MAX
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            {teamsList.filter(tm => tm.status === 'Approved').map((tm, i) => (
                                                <div key={tm.id || i} className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 hover:bg-green-50 border border-[#E5E7EB] hover:border-green-200 rounded-xl text-xs transition-all cursor-default shadow-xs">
                                                    <span className="w-5 h-5 rounded-full bg-white border border-[#E5E7EB] text-[#16A34A] flex items-center justify-center text-[9px] font-black shrink-0">
                                                        {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                    <span className="font-bold tracking-wide uppercase text-[11px] text-[#111827] truncate">{tm.team_name}</span>
                                                </div>
                                            ))}
                                            {Array.from({ length: Math.max(0, maxTeams - registrations) }).map((_, i) => (
                                                <div key={`empty-${i}`} className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50/50 border border-[#E5E7EB] border-dashed rounded-xl opacity-50">
                                                    <span className="w-5 h-5 rounded-full bg-white border border-[#E5E7EB] border-dashed text-[#9CA3AF] flex items-center justify-center text-[9px] font-bold shrink-0">--</span>
                                                    <span className="font-bold tracking-wide uppercase text-[10px] text-[#9CA3AF]">AWAITING</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {/* Schedule Timeline */}
                                    <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-6 shadow-xs relative overflow-hidden">
                                        <h2 className="text-xs font-black tracking-[0.25em] uppercase text-[#16A34A] mb-6 flex items-center gap-2">
                                            <span>⏰</span> TOURNAMENT TIMELINE
                                        </h2>
                                        <div className="relative pl-6 border-l border-[#E5E7EB] space-y-4">
                                            {timeline.map((item, idx) => (
                                                <div key={idx} className="relative">
                                                    <div className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#16A34A] border-2 border-white shadow-xs" />
                                                    <span className="text-[9px] font-black text-[#16A34A] uppercase tracking-widest block mb-0.5">{item.time}</span>
                                                    <span className="text-xs font-bold text-[#111827] tracking-wide">{item.event}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Turf Perks */}
                                    <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-6 shadow-xs">
                                        <h2 className="text-xs font-black tracking-[0.25em] uppercase text-[#16A34A] mb-6 flex items-center gap-2">
                                            <span>✨</span> TURF AMENITIES & PERKS
                                        </h2>
                                        <ul className="space-y-3.5">
                                            {perks.map((p, i) => (
                                                <li key={i} className="flex items-center gap-3.5 text-xs font-bold text-[#111827] tracking-wide">
                                                    <div className="w-6 h-6 rounded-full bg-green-50 border border-green-200 text-[#16A34A] flex items-center justify-center font-black text-xs shrink-0">
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
                            <div className="relative bg-white border border-[#E5E7EB] rounded-[20px] p-6 shadow-[0_15px_45px_rgba(0,0,0,0.08)]">
                                <h3 className="text-lg font-black italic tracking-tight uppercase text-[#111827] border-b border-[#E5E7EB] pb-4 mb-6">REGISTRATION CLEARANCE</h3>

                                <div className="space-y-3 text-[10px] font-black tracking-widest uppercase mb-8">
                                    <div className="flex justify-between items-center bg-[#F7F9FC] p-3 rounded-xl border border-[#E5E7EB]">
                                        <span className="text-[#6B7280]">Entry Fee</span>
                                        <span className="text-[#111827] text-base tabular-nums">₹{entryFee}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-amber-50 p-3 rounded-xl border border-amber-200">
                                        <span className="text-amber-800">Prize Pool</span>
                                        <span className="text-amber-700 font-black tabular-nums text-lg">₹{prize}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-green-50 p-3 rounded-xl border border-green-200">
                                        <span className="text-[#16A34A]">Open Slots</span>
                                        <span className="text-[#16A34A] font-black text-lg tabular-nums">{spotsLeft}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => isOpen && setShowRegModal(true)}
                                    disabled={!isOpen}
                                    className={`w-full py-3.5 text-xs font-black uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer ${isOpen
                                        ? 'bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] border border-[#B5F000] shadow-sm'
                                        : 'bg-slate-100 text-[#9CA3AF] border border-[#E5E7EB] cursor-not-allowed'
                                        }`}
                                >
                                    {isOpen ? 'REGISTER SQUAD' : 'REGISTRATION CLOSED'}
                                </button>

                                <div className="flex items-center gap-2 mt-6 justify-center text-[#6B7280] border-t border-[#E5E7EB] pt-4">
                                    <HiDocumentText className="w-4 h-4 shrink-0 text-[#16A34A]" />
                                    <p className="text-[9px] font-bold uppercase tracking-widest">
                                        Entry fee secured in escrow until match deployment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Registration Modal rendered via Portal onto document.body */}
            {showRegModal && createPortal(
                <div className="fixed inset-0 w-full h-[100dvh] z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
                    <div className="bg-white border border-[#E5E7EB] rounded-[24px] w-[calc(100%-24px)] sm:w-full max-w-[460px] max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-32px)] flex flex-col shadow-2xl overflow-hidden my-auto relative z-10">
                        {/* Sticky Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 shrink-0">
                            <h3 className="text-base sm:text-lg font-black italic uppercase text-[#111827] tracking-tight">Register Your Squad</h3>
                            <button onClick={() => setShowRegModal(false)} className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer shrink-0">
                                <HiX className="w-4 h-4" />
                            </button>
                        </div>

                        {regSuccess ? (
                            <div className="p-8 text-center my-auto">
                                <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-4 text-[#16A34A]">
                                    <span className="text-2xl font-black">✓</span>
                                </div>
                                <p className="text-[#16A34A] font-black uppercase tracking-widest text-sm">Registration Successful!</p>
                                <p className="text-[#6B7280] text-xs font-semibold mt-2">Your team has been registered for this tournament.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleRegister} className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
                                {/* Team Info */}
                                <div>
                                    <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest mb-1.5 block">Team Name *</label>
                                    <input type="text" required value={regForm.teamName} onChange={e => setRegForm(prev => ({ ...prev, teamName: e.target.value }))}
                                        className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] placeholder-slate-400 focus:border-[#16A34A] focus:outline-none transition-colors font-bold"
                                        placeholder="e.g. Thunder XI"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                    <div>
                                        <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest mb-1.5 block">Captain Name *</label>
                                        <input type="text" required value={regForm.captainName} onChange={e => setRegForm(prev => ({ ...prev, captainName: e.target.value }))}
                                            className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] placeholder-slate-400 focus:border-[#16A34A] focus:outline-none transition-colors font-bold"
                                            placeholder="Captain Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest mb-1.5 block">Captain Mobile *</label>
                                        <input type="tel" required value={regForm.captainMobile} onChange={e => setRegForm(prev => ({ ...prev, captainMobile: e.target.value }))}
                                            className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] placeholder-slate-400 focus:border-[#16A34A] focus:outline-none transition-colors font-bold"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                    <div>
                                        <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest mb-1.5 block">Captain Email</label>
                                        <input type="email" value={regForm.captainEmail} onChange={e => setRegForm(prev => ({ ...prev, captainEmail: e.target.value }))}
                                            className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] placeholder-slate-400 focus:border-[#16A34A] focus:outline-none transition-colors font-bold"
                                            placeholder="captain@email.com"
                                        />
                                    </div>
                                    <CustomSelect
                                        label="Jersey Color"
                                        value={regForm.jerseyColor}
                                        onChange={val => setRegForm(prev => ({ ...prev, jerseyColor: val }))}
                                        options={jerseyColorOptions}
                                    />
                                </div>

                                {/* Players Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest">Players Roster</label>
                                        <button type="button" onClick={addPlayer} className="text-[9px] font-black text-[#16A34A] uppercase tracking-widest hover:underline cursor-pointer">+ Add Player</button>
                                    </div>
                                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                        {regForm.players.map((p, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl p-2 sm:p-2.5">
                                                <input type="text" placeholder="Player Name" value={p.name} onChange={e => updatePlayer(idx, 'name', e.target.value)}
                                                    className="flex-1 min-w-0 bg-transparent text-xs text-[#111827] placeholder-slate-400 focus:outline-none font-bold"
                                                />
                                                <input type="text" placeholder="Mobile" value={p.mobile} onChange={e => updatePlayer(idx, 'mobile', e.target.value)}
                                                    className="w-20 sm:w-24 bg-transparent text-xs text-[#111827] placeholder-slate-400 focus:outline-none font-bold"
                                                />
                                                <input type="number" placeholder="#" value={p.jerseyNumber} onChange={e => updatePlayer(idx, 'jerseyNumber', e.target.value)}
                                                    className="w-10 sm:w-12 bg-transparent text-xs text-[#111827] placeholder-slate-400 focus:outline-none text-center font-bold"
                                                />
                                                {regForm.players.length > 1 && (
                                                    <button type="button" onClick={() => removePlayer(idx)} className="text-red-500 hover:text-red-600 text-xs font-bold shrink-0 p-1">✕</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest mb-1.5 block">Payment Method</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['UPI', 'CASH', 'CARD', 'WALLET'].map(m => (
                                            <button key={m} type="button" onClick={() => setRegForm(prev => ({ ...prev, paymentMethod: m }))}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${regForm.paymentMethod === m
                                                    ? 'bg-[#C8FF2E] text-[#111827] border border-[#B5F000] shadow-xs'
                                                    : 'bg-[#F7F9FC] border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]'
                                                    }`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Entry Fee Info */}
                                <div className="flex justify-between items-center bg-amber-50 p-3 rounded-xl border border-amber-200">
                                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Entry Fee</span>
                                    <span className="text-amber-700 font-black text-lg tabular-nums">₹{entryFee}</span>
                                </div>

                                <button type="submit" disabled={regLoading}
                                    className="w-full py-4 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] border border-[#B5F000] text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {regLoading ? 'REGISTERING...' : 'CONFIRM REGISTRATION'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
