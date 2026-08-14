import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
    HiSearch, HiFilter, HiShieldCheck, HiStar, HiCheck,
    HiLocationMarker, HiChevronRight, HiEye, HiX, HiFire, HiSparkles, HiUser
} from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'
import Badge from '../../components/ui/Badge'
import CustomSelect from '../../components/ui/CustomSelect'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import MatchScoreVerificationModal from '../../components/booking/MatchScoreVerificationModal'
import FloatingActions from '../../components/tournaments/FloatingActions'
import { getLeaderboardPlayers, calculatePPS } from '../../services/leaderboardService'

const mockLeaderboardPlayers = [
    {
        id: 'ply_indore_1',
        name: 'Karan Malhotra',
        avatar: '🔥',
        team: 'Vijay Nagar Blasters',
        city: 'Indore',
        sport: 'Cricket',
        role: 'Top-Order Batsman',
        matches: 34,
        runs: 1540,
        battingAvg: 55.0,
        strikeRate: 186.5,
        wickets: 14,
        economy: 7.80,
        winRate: '82.4%',
        mvps: 12,
        highestScore: '124*',
        bestBowling: '2/18',
        verificationTier: 'Tier 3',
        tierMultiplier: 2.0,
        trustScore: 99,
        badges: ['🏆 Indore Cup Champion', '⭐ 12x MVP', '🔥 Century Master']
    },
    {
        id: 'ply_indore_2',
        name: 'Vikramaditya Roy',
        avatar: '🎯',
        team: 'Palasia Super Strikers',
        city: 'Indore',
        sport: 'Cricket',
        role: 'Fast Bowler & All-Rounder',
        matches: 29,
        runs: 560,
        battingAvg: 28.0,
        strikeRate: 148.0,
        wickets: 48,
        economy: 5.60,
        winRate: '75.8%',
        mvps: 8,
        highestScore: '54*',
        bestBowling: '5/10',
        verificationTier: 'Tier 2',
        tierMultiplier: 1.5,
        trustScore: 97,
        badges: ['⚖️ Paid Umpire Verified', '🎯 5-Wicket Haul', '⚡ Pace King']
    },
    {
        id: 'ply_indore_3',
        name: 'Rohit Soni',
        avatar: '🏏',
        team: 'Bhawarkua Royal Kings',
        city: 'Indore',
        sport: 'Cricket',
        role: 'All-Rounder',
        matches: 27,
        runs: 1120,
        battingAvg: 46.6,
        strikeRate: 169.2,
        wickets: 31,
        economy: 6.90,
        winRate: '70.3%',
        mvps: 7,
        highestScore: '92',
        bestBowling: '4/22',
        verificationTier: 'Tier 2',
        tierMultiplier: 1.5,
        trustScore: 96,
        badges: ['⚖️ Paid Umpire Verified', '⭐ 7x MVP']
    },
    {
        id: 'ply_indore_4',
        name: 'Rahul Sharma (You)',
        avatar: '🏏',
        team: 'Vijay Nagar Blasters',
        city: 'Indore',
        sport: 'Cricket',
        role: 'All-Rounder',
        matches: 28,
        runs: 1140,
        battingAvg: 47.5,
        strikeRate: 172.4,
        wickets: 32,
        economy: 6.75,
        winRate: '75.0%',
        mvps: 9,
        highestScore: '104*',
        bestBowling: '4/18',
        verificationTier: 'Tier 2',
        tierMultiplier: 1.5,
        trustScore: 98,
        badges: ['🛡️ Level 4 Elite', '⭐ 9x MVP', '⚖️ Umpire Verified']
    },
    {
        id: 'ply_indore_5',
        name: 'Devendra Rathore',
        avatar: '🛡️',
        team: 'Annapurna Titans',
        city: 'Indore',
        sport: 'Cricket',
        role: 'Opening Batsman',
        matches: 24,
        runs: 980,
        battingAvg: 44.5,
        strikeRate: 162.0,
        wickets: 6,
        economy: 8.20,
        winRate: '66.7%',
        mvps: 5,
        highestScore: '86*',
        bestBowling: '2/14',
        verificationTier: 'Tier 3',
        tierMultiplier: 2.0,
        trustScore: 95,
        badges: ['🏆 Tournament Elite', '⭐ 5x MVP']
    },
    {
        id: 'ply_indore_6',
        name: 'Shubham Joshi',
        avatar: '🌪️',
        team: 'Super Corridor Smashers',
        city: 'Indore',
        sport: 'Cricket',
        role: 'Spin Bowler',
        matches: 22,
        runs: 240,
        battingAvg: 20.0,
        strikeRate: 130.0,
        wickets: 38,
        economy: 5.90,
        winRate: '68.2%',
        mvps: 6,
        highestScore: '38',
        bestBowling: '4/11',
        verificationTier: 'Tier 2',
        tierMultiplier: 1.5,
        trustScore: 96,
        badges: ['⚖️ Paid Umpire Verified', '🌪️ Spin Wizard']
    },
    {
        id: 'ply_indore_7',
        name: 'Yashwant Rao',
        avatar: '⚡',
        team: 'Rau Cricket Club',
        city: 'Indore',
        sport: 'Cricket',
        role: 'Wicketkeeper Batsman',
        matches: 26,
        runs: 890,
        battingAvg: 42.3,
        strikeRate: 174.0,
        wickets: 0,
        economy: 0,
        winRate: '65.4%',
        mvps: 5,
        highestScore: '88',
        bestBowling: '—',
        verificationTier: 'Tier 1',
        tierMultiplier: 1.0,
        trustScore: 93,
        badges: ['✓ Captain Handshake', '🧤 26 Dismissals']
    },
    {
        id: 'ply_indore_8',
        name: 'Deepak Patel',
        avatar: '🌟',
        team: 'Scheme 54 Blasters',
        city: 'Indore',
        sport: 'Cricket',
        role: 'All-Rounder',
        matches: 20,
        runs: 710,
        battingAvg: 39.4,
        strikeRate: 158.0,
        wickets: 24,
        economy: 7.10,
        winRate: '65.0%',
        mvps: 4,
        highestScore: '74',
        bestBowling: '3/16',
        verificationTier: 'Tier 1',
        tierMultiplier: 1.0,
        trustScore: 92,
        badges: ['✓ Captain Handshake']
    }
]

export default function CustomerLeaderboard() {
    const navigate = useNavigate()
    const { addToast } = useToast()
    const { user } = useAuth()

    // Get active logged in customer profile
    const activeCustomerProfile = useMemo(() => {
        try {
            const saved = localStorage.getItem('customer_profile')
            if (saved) return JSON.parse(saved)
        } catch (e) {
            console.error(e)
        }
        return {
            fullName: user?.name || user?.email?.split('@')[0] || 'Rahul Sharma',
            teamName: 'Vijay Nagar Blasters',
            city: 'Indore',
            role: 'All-Rounder'
        }
    }, [user])

    const [viewScope, setViewScope] = useState('my_records') // 'my_records' | 'all_city'
    const [selectedCity, setSelectedCity] = useState('All Indore')
    const [selectedTier, setSelectedTier] = useState('all')
    const [selectedCategory, setSelectedCategory] = useState('all-rounders')
    const [searchQuery, setSearchQuery] = useState('')
    const [inspectPlayer, setInspectPlayer] = useState(null)

    // Direct Score Submission Modal State
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
    const [handshakeMatch, setHandshakeMatch] = useState(null)
    const [playerList, setPlayerList] = useState(getLeaderboardPlayers)

    useEffect(() => {
        const handleRefresh = () => {
            setPlayerList(getLeaderboardPlayers())
        }
        window.addEventListener('leaderboardUpdated', handleRefresh)
        window.addEventListener('storage', handleRefresh)
        return () => {
            window.removeEventListener('leaderboardUpdated', handleRefresh)
            window.removeEventListener('storage', handleRefresh)
        }
    }, [])

    const demoPendingMatch = {
        id: 'MTC-IND-98432',
        team1Name: 'Vijay Nagar Blasters (You)',
        team1Score: 148,
        team1Wickets: 4,
        team1Overs: '16.0',
        team2Name: 'Palasia Super Strikers',
        team2Score: 136,
        team2Wickets: 7,
        team2Overs: '16.0',
        winnerName: 'Vijay Nagar Blasters (You)',
        venue: 'Indore Turf Arena, Vijay Nagar',
        date: 'Today · 6:00 PM',
        sport: 'Cricket 16-Over Format',
        hasVerifiedUmpire: true,
        umpireName: 'Sunil Gavaskar (Level 2 Certified Umpire)',
        verificationTier: 'Tier 2',
        verificationStatus: 'Pending',
        mvp: `${activeCustomerProfile.fullName} (58 Runs off 32 balls)`,
        team1Batting: [
            { name: `${activeCustomerProfile.fullName} (C)`, runs: 58, balls: 32, fours: 6, sixes: 3, sr: 181.2, isOut: false },
            { name: 'Amit Verma', runs: 34, balls: 22, fours: 4, sixes: 1, sr: 154.5, isOut: true, dismissal: 'c Patel b Kumar' },
            { name: 'Sameer Khan', runs: 28, balls: 18, fours: 3, sixes: 1, sr: 155.5, isOut: true, dismissal: 'b Singh' },
            { name: 'Vikram Joshi', runs: 16, balls: 12, fours: 1, sixes: 1, sr: 133.3, isOut: false },
        ],
        team1Bowling: [
            { name: 'Karan Mehra', overs: '4.0', maidens: 0, runs: 26, wickets: 2, econ: '6.50' },
            { name: 'Siddharth Rao', overs: '4.0', maidens: 1, runs: 22, wickets: 2, econ: '5.50' },
            { name: 'Devendra Gill', overs: '4.0', maidens: 0, runs: 38, wickets: 1, econ: '9.50' },
        ],
        team2Batting: [
            { name: 'Pritam Sengupta (C)', runs: 44, balls: 29, fours: 5, sixes: 2, sr: 151.7, isOut: true, dismissal: 'c Sharma b Rao' },
            { name: 'Rohan Gupta', runs: 26, balls: 19, fours: 3, sixes: 0, sr: 136.8, isOut: true, dismissal: 'b Mehra' },
            { name: 'Ankit Patel', runs: 18, balls: 14, fours: 2, sixes: 0, sr: 128.5, isOut: true, dismissal: 'run out' },
            { name: 'Sunil Kumar', runs: 12, balls: 8, fours: 1, sixes: 0, sr: 150.0, isOut: false },
        ],
        team2Bowling: [
            { name: 'Ankit Patel', overs: '4.0', maidens: 0, runs: 32, wickets: 1, econ: '8.00' },
            { name: 'Sunil Kumar', overs: '4.0', maidens: 0, runs: 28, wickets: 1, econ: '7.00' },
            { name: 'Harish Singh', overs: '4.0', maidens: 0, runs: 42, wickets: 1, econ: '10.50' },
        ]
    }

    const handleApproveHandshake = (matchId, tier) => {
        const approvedEntry = {
            id: `handshake_ply_${Date.now()}`,
            name: `${activeCustomerProfile.fullName} (You)`,
            avatar: '🏏',
            team: `${activeCustomerProfile.teamName || 'Vijay Nagar Blasters'} (Indore)`,
            city: 'Indore',
            sport: 'Cricket',
            role: 'Captain & All-Rounder',
            matches: 29,
            runs: 1198,
            battingAvg: 48.2,
            strikeRate: 173.5,
            wickets: 34,
            economy: 6.70,
            winRate: '76.0%',
            mvps: 10,
            highestScore: '104*',
            bestBowling: '4/18',
            verificationTier: tier || 'Tier 2',
            tierMultiplier: tier === 'Tier 3' ? 2.0 : tier === 'Tier 2' ? 1.5 : 1.0,
            trustScore: 99,
            badges: ['🤝 Certified Captain Handshake', '⭐ 10x MVP', '🛡️ Zero Dispute']
        }

        const updated = [approvedEntry, ...customPlayers]
        setCustomPlayers(updated)
        try {
            localStorage.setItem('indore_custom_leaderboard_players', JSON.stringify(updated))
        } catch (e) {
            console.error(e)
        }
        setHandshakeMatch(null)
        if (addToast) addToast({ message: '🎉 Captain Handshake Certified! Scorecard verified and Leaderboard updated live!', type: 'success' })
    }

    const handleDisputeHandshake = (matchId, reason) => {
        setHandshakeMatch(null)
        if (addToast) addToast({ message: '⚠️ Scorecard disputed and forwarded to Turf Admin.', type: 'error' })
    }

    const [formScore, setFormScore] = useState({
        playerName: `${activeCustomerProfile.fullName} (You)`,
        teamName: activeCustomerProfile.teamName || 'Vijay Nagar Blasters',
        zone: 'Vijay Nagar',
        role: 'All-Rounder',
        tier: 'Tier 2',
        runs: 76,
        balls: 38,
        fours: 7,
        sixes: 4,
        wickets: 3,
        overs: '4.0',
        economy: 6.25,
        isMvp: true,
        certifier: 'UMP-IND-4481'
    })

    const handleFormSubmit = (e) => {
        e.preventDefault()
        if (!formScore.playerName.trim()) {
            if (addToast) addToast({ message: 'Please enter player name', type: 'error' })
            return
        }

        const tierWeight = formScore.tier === 'Tier 3' ? 2.0 : formScore.tier === 'Tier 2' ? 1.5 : 1.0
        const calculatedAvg = formScore.runs > 0 ? (formScore.runs * 1.2).toFixed(1) : 35.0
        const calculatedSr = formScore.balls > 0 ? ((formScore.runs / formScore.balls) * 100).toFixed(1) : 150.0

        const newPlayerEntry = {
            id: `custom_ply_${Date.now()}`,
            name: formScore.playerName.trim(),
            avatar: '⚡',
            team: `${formScore.teamName} (${formScore.zone})`,
            city: 'Indore',
            sport: 'Cricket',
            role: formScore.role,
            matches: 12,
            runs: Number(formScore.runs) + 380,
            battingAvg: parseFloat(calculatedAvg),
            strikeRate: parseFloat(calculatedSr),
            wickets: Number(formScore.wickets) + 14,
            economy: parseFloat(formScore.economy) || 6.5,
            winRate: '75.0%',
            mvps: formScore.isMvp ? 6 : 4,
            highestScore: `${formScore.runs}*`,
            bestBowling: `${formScore.wickets}/18`,
            verificationTier: formScore.tier,
            tierMultiplier: tierWeight,
            trustScore: 98,
            badges: [
                formScore.tier === 'Tier 3' ? '🏆 Tournament Elite' : formScore.tier === 'Tier 2' ? '⚖️ Paid Umpire Verified' : '✓ Captain Handshake',
                formScore.isMvp ? '⭐ Match MVP' : '🏏 Certified Performer'
            ]
        }

        const updatedList = [newPlayerEntry, ...customPlayers]
        setCustomPlayers(updatedList)
        try {
            localStorage.setItem('indore_custom_leaderboard_players', JSON.stringify(updatedList))
        } catch (err) {
            console.error(err)
        }

        setIsSubmitModalOpen(false)
        if (addToast) addToast({ message: `🎉 Score Verified & Certified! ${newPlayerEntry.name} ranked in Indore Leaderboard with ${formScore.tier}!`, type: 'success' })
    }

    const fillDemoScore = () => {
        setFormScore({
            playerName: `${activeCustomerProfile.fullName} (You)`,
            teamName: activeCustomerProfile.teamName || 'Vijay Nagar Blasters',
            zone: 'Vijay Nagar',
            role: 'All-Rounder',
            tier: 'Tier 2',
            runs: 94,
            balls: 46,
            fours: 9,
            sixes: 5,
            wickets: 2,
            overs: '3.0',
            economy: 7.0,
            isMvp: true,
            certifier: 'UMP-LIC-8821'
        })
        if (addToast) addToast({ message: '⚡ Demo match scorecard filled! Click "Submit & Certify" below.', type: 'info' })
    }

    // Process & Rank Players with PPS Formula
    const rankedPlayers = useMemo(() => {
        let processed = playerList
            .map(p => {
                let tierMultiplier = p.tierMultiplier || (p.verificationTier === 'Tier 3' ? 2.0 : p.verificationTier === 'Tier 2' ? 1.5 : 1.0)
                if (selectedTier === 'tier1') tierMultiplier = 1.0
                else if (selectedTier === 'tier2') tierMultiplier = 1.5
                else if (selectedTier === 'tier3') tierMultiplier = 2.0

                const pps = calculatePPS(p, tierMultiplier)
                return { ...p, currentPPS: pps }
            })
            .filter(p => {
                // If My Records Only is selected, show only current customer entries
                if (viewScope === 'my_records') {
                    const cName = activeCustomerProfile.fullName.toLowerCase()
                    const isUserRow = p.name.toLowerCase().includes('(you)') || p.name.toLowerCase().includes(cName)
                    if (!isUserRow) return false
                }

                if (selectedCity !== 'All Indore' && selectedCity !== 'All') {
                    if (!p.team.toLowerCase().includes(selectedCity.toLowerCase()) && !p.city.toLowerCase().includes(selectedCity.toLowerCase())) {
                        return false
                    }
                }
                if (selectedTier === 'tier1' && p.verificationTier !== 'Tier 1') return false
                if (selectedTier === 'tier2' && p.verificationTier !== 'Tier 2') return false
                if (selectedTier === 'tier3' && p.verificationTier !== 'Tier 3') return false
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase()
                    return (
                        p.name.toLowerCase().includes(q) ||
                        p.team.toLowerCase().includes(q) ||
                        p.city.toLowerCase().includes(q) ||
                        p.role.toLowerCase().includes(q)
                    )
                }
                return true
            })
            .sort((a, b) => {
                if (selectedCategory === 'batsmen') {
                    return (b.runs * (b.battingAvg / 10)) - (a.runs * (a.battingAvg / 10))
                }
                if (selectedCategory === 'bowlers') {
                    return (b.wickets * 10 - b.economy) - (a.wickets * 10 - a.economy)
                }
                if (selectedCategory === 'mvps') {
                    return b.mvps - a.mvps
                }
                return b.currentPPS - a.currentPPS
            })

        return processed
    }, [playerList, viewScope, activeCustomerProfile, selectedCity, selectedTier, selectedCategory, searchQuery])

    const top3 = rankedPlayers.slice(0, 3)

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Title & Scope Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>🏆</span> Player Leaderboard & Career Records
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-0.5">
                        Viewing performance records for <strong className="text-slate-900 font-bold">{activeCustomerProfile.fullName}</strong>.
                    </p>
                </div>

                {/* VIEW SCOPE TOGGLE: MY RECORDS vs ALL CITY */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
                    <button
                        type="button"
                        onClick={() => setViewScope('my_records')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            viewScope === 'my_records'
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <HiUser className="w-4 h-4" />
                        <span>My Personal Records</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewScope('all_city')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            viewScope === 'all_city'
                                ? 'bg-[#111827] text-white shadow-md'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <HiTrophy className="w-4 h-4 text-amber-400" />
                        <span>All City Leaderboard</span>
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                🌟 PERSONAL RANK HIGHLIGHT CARD FOR LOGGED-IN CUSTOMER
            ═══════════════════════════════════════════════════ */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-500/20 shrink-0">
                            🏏
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-black text-white">{activeCustomerProfile.fullName} (You)</h2>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center gap-1">
                                    <HiShieldCheck className="w-3.5 h-3.5" /> Level 4 Pro Elite
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 font-medium mt-0.5">
                                {activeCustomerProfile.teamName || 'Vijay Nagar Blasters'} · {activeCustomerProfile.role || 'All-Rounder'} · {activeCustomerProfile.city || 'Indore Chapter'}
                            </p>
                        </div>
                    </div>

                    {/* Stats Metric Box */}
                    <div className="grid grid-cols-3 gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 shrink-0 text-center">
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">City Rank</div>
                            <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">#4 Indore</div>
                        </div>
                        <div className="border-x border-slate-800 px-2">
                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">PPS Score</div>
                            <div className="text-lg font-black text-white font-mono mt-0.5">88.6</div>
                        </div>
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Trust Credential</div>
                            <div className="text-lg font-black text-amber-400 font-mono mt-0.5">98/100</div>
                        </div>
                    </div>
                </div>

                {/* Rank Progression Bar */}
                <div className="pt-3 border-t border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-400 text-[11px] flex items-center gap-1">
                            <HiSparkles className="w-3.5 h-3.5 text-amber-400" />
                            Next Milestone: <strong className="text-white">Rank #3 (Bronze Podium)</strong>
                        </span>
                        <span className="font-mono text-emerald-400 font-black text-[11px]">3.4 PPS needed</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[82%]" />
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                ⚡ DIRECT 1-CLICK SCORE SUBMISSION & HANDSHAKE ACTION BAR
            ═══════════════════════════════════════════════════ */}
            <div className="bg-gradient-to-r from-emerald-600 via-[#16A34A] to-emerald-800 rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider">
                        <span>⚡</span> Live Match Scoring & Handshake Hub
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">Played a match at an Indore Turf?</h2>
                    <p className="text-emerald-100 text-xs font-semibold">Enter your scorecard or verify umpire sign-off right here to rank on the Indore Leaderboard!</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsSubmitModalOpen(true)}
                        className="bg-[#C8FF2E] hover:bg-[#b8f51a] text-[#111827] font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                    >
                        <span>📝</span>
                        <span>Submit Match Score</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setHandshakeMatch(demoPendingMatch)}
                        className="bg-white/15 hover:bg-white/25 border border-white/40 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-2xl transition-all cursor-pointer flex items-center gap-2"
                    >
                        <span>🤝</span>
                        <span>Captain Handshake</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/umpire')}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-3 rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-105"
                    >
                        <span>⚖️</span>
                        <span>Umpire Scoring Desk</span>
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                FILTERS & CONTROLS BAR
            ═══════════════════════════════════════════════════ */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                {/* Top Row: Categories & Search */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Category Buttons */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
                        {[
                            { id: 'all-rounders', label: '⚡ All-Rounders (PPS Score)' },
                            { id: 'batsmen', label: '🏏 Top Batsmen (Runs & Avg)' },
                            { id: 'bowlers', label: '🎯 Top Bowlers (Wickets & Econ)' },
                            { id: 'mvps', label: '⭐ MVP Leaders' },
                        ].map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                                    selectedCategory === cat.id
                                        ? 'bg-[#111827] text-white shadow-md'
                                        : 'bg-slate-50 text-slate-600 hover:text-[#111827] border border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-72">
                        <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search player, team, role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold text-[#111827] placeholder-slate-400 outline-none focus:border-[#16A34A] focus:bg-white transition-colors"
                        />
                    </div>
                </div>

                {/* Bottom Row: City Selector & Tier Filter */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    {/* Indore Areas / Zones Filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1 flex items-center gap-1">
                            <HiLocationMarker className="w-3.5 h-3.5 text-[#16A34A]" /> Indore Hubs:
                        </span>
                        {['All Indore', 'Vijay Nagar', 'Palasia', 'Bhawarkua', 'Super Corridor', 'Rau'].map(zone => (
                            <button
                                key={zone}
                                onClick={() => setSelectedCity(zone)}
                                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                                    selectedCity === zone
                                        ? 'bg-[#ECFDF5] text-[#065F46] border border-emerald-300 font-black shadow-2xs'
                                        : 'text-slate-600 hover:text-[#111827] hover:bg-slate-100'
                                }`}
                            >
                                {zone === 'All Indore' ? '📍 All Indore' : zone}
                            </button>
                        ))}
                    </div>

                    {/* Tier Filters */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1">
                            Tier Filter:
                        </span>
                        {[
                            { id: 'all', label: 'All Weighted' },
                            { id: 'tier2', label: '⚖️ Umpire (1.5x)' },
                            { id: 'tier3', label: '🏆 Tournament (2.0x)' },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTier(t.id)}
                                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                                    selectedTier === t.id
                                        ? 'bg-purple-600 text-white font-black shadow-xs'
                                        : 'bg-slate-50 text-slate-600 hover:text-[#111827] border border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                TOP 3 PODIUM DISPLAY (WHEN VIEWING ALL CITY)
            ═══════════════════════════════════════════════════ */}
            {viewScope === 'all_city' && top3.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                    {/* 🥈 #2 Silver */}
                    {top3[1] && (
                        <div className="order-2 md:order-1 bg-gradient-to-b from-slate-50 via-white to-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md relative overflow-hidden text-center space-y-4 hover:border-slate-300 transition-all">
                            <div className="absolute top-3 left-4 text-2xl font-black text-slate-400 font-mono">#2</div>
                            <span className="absolute top-4 right-4 text-xs font-black uppercase bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-300">
                                🥈 SILVER
                            </span>

                            <div className="space-y-2 pt-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-3xl mx-auto shadow-inner border border-slate-200">
                                    {top3[1].avatar}
                                </div>
                                <h3 className="font-black text-lg text-[#111827]">{top3[1].name}</h3>
                                <p className="text-xs text-slate-500 font-semibold">{top3[1].team} · {top3[1].city}</p>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1">
                                <div className="text-[10px] font-black uppercase text-slate-500">Player Performance Score</div>
                                <div className="text-3xl font-black text-[#111827] font-mono">{top3[1].currentPPS}</div>
                                <div className="text-[11px] text-[#16A34A] font-bold">{top3[1].runs} Runs · {top3[1].wickets} Wkts · {top3[1].mvps} MVPs</div>
                            </div>

                            <button
                                onClick={() => setInspectPlayer(top3[1])}
                                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                                <HiEye className="w-4 h-4" /> Inspect Record
                            </button>
                        </div>
                    )}

                    {/* 🥇 #1 GOLD CHAMPION */}
                    {top3[0] && (
                        <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/30 rounded-3xl border-2 border-amber-400 p-6 flex flex-col justify-between shadow-lg relative overflow-hidden text-center space-y-4 scale-100 md:scale-105 z-10">
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute top-3 left-4 text-3xl font-black text-amber-500 font-mono">#1</div>
                            <span className="absolute top-4 right-4 text-xs font-black uppercase bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-3 py-0.5 rounded-full shadow-xs">
                                👑 GOLD CHAMPION
                            </span>

                            <div className="space-y-2 pt-4">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 flex items-center justify-center text-4xl mx-auto shadow-md border-2 border-amber-300">
                                    {top3[0].avatar}
                                </div>
                                <h3 className="font-black text-xl text-[#111827]">{top3[0].name}</h3>
                                <p className="text-xs text-amber-800 font-bold">{top3[0].team} · {top3[0].city}</p>
                            </div>

                            <div className="bg-white rounded-2xl p-4 border border-amber-300 shadow-2xs space-y-1">
                                <div className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Player Performance Score</div>
                                <div className="text-4xl font-black text-[#111827] font-mono">
                                    {top3[0].currentPPS}
                                </div>
                                <div className="text-xs text-[#16A34A] font-bold">{top3[0].runs} Runs · {top3[0].wickets} Wkts · {top3[0].mvps} MVPs</div>
                            </div>

                            <button
                                onClick={() => setInspectPlayer(top3[0])}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <HiTrophy className="w-4 h-4" /> View Champion Stats
                            </button>
                        </div>
                    )}

                    {/* 🥉 #3 Bronze */}
                    {top3[2] && (
                        <div className="order-3 bg-gradient-to-b from-orange-50/60 via-white to-white rounded-3xl border-2 border-amber-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md relative overflow-hidden text-center space-y-4 hover:border-amber-300 transition-all">
                            <div className="absolute top-3 left-4 text-2xl font-black text-amber-700 font-mono">#3</div>
                            <span className="absolute top-4 right-4 text-xs font-black uppercase bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-300">
                                🥉 BRONZE
                            </span>

                            <div className="space-y-2 pt-4">
                                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center text-3xl mx-auto shadow-inner border border-amber-200">
                                    {top3[2].avatar}
                                </div>
                                <h3 className="font-black text-lg text-[#111827]">{top3[2].name}</h3>
                                <p className="text-xs text-slate-500 font-semibold">{top3[2].team} · {top3[2].city}</p>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1">
                                <div className="text-[10px] font-black uppercase text-slate-500">Player Performance Score</div>
                                <div className="text-3xl font-black text-[#111827] font-mono">{top3[2].currentPPS}</div>
                                <div className="text-[11px] text-[#16A34A] font-bold">{top3[2].runs} Runs · {top3[2].wickets} Wkts · {top3[2].mvps} MVPs</div>
                            </div>

                            <button
                                onClick={() => setInspectPlayer(top3[2])}
                                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                                <HiEye className="w-4 h-4" /> Inspect Record
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════
                FULL LEADERBOARD / CUSTOMER STANDINGS TABLE
            ═══════════════════════════════════════════════════ */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-black text-base text-[#111827] flex items-center gap-2">
                        <span>📊</span> {viewScope === 'my_records' ? `Customer Personal Performance (${rankedPlayers.length} Record)` : `Official Standings Table (${rankedPlayers.length} Ranked)`}
                    </h3>
                    <span className="text-xs font-mono font-bold text-slate-500">
                        Sorted by: {selectedCategory.toUpperCase()}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="py-3.5 px-4 text-center">Rank</th>
                                <th className="py-3.5 px-4">Player & Team</th>
                                <th className="py-3.5 px-4">Verification Tier</th>
                                <th className="py-3.5 px-4 text-center">Matches</th>
                                <th className="py-3.5 px-4 text-center">Runs (Avg / SR)</th>
                                <th className="py-3.5 px-4 text-center">Wkts (Econ)</th>
                                <th className="py-3.5 px-4 text-center">MVPs</th>
                                <th className="py-3.5 px-4 text-right">PPS Score</th>
                                <th className="py-3.5 px-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {rankedPlayers.map((player, idx) => {
                                const isCurrentCustomer = player.name.includes('(You)') || player.name.toLowerCase().includes(activeCustomerProfile.fullName.toLowerCase())
                                return (
                                    <tr key={player.id} className={`transition-colors ${isCurrentCustomer ? 'bg-emerald-50/70 border-l-4 border-l-[#16A34A]' : 'hover:bg-emerald-50/30'}`}>
                                        <td className="py-3.5 px-4 text-center font-mono font-black text-sm text-[#111827]">
                                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0">
                                                    {player.avatar}
                                                </div>
                                                <div>
                                                    <div className="font-black text-[#111827] text-sm flex items-center gap-1.5">
                                                        <span>{player.name}</span>
                                                        {isCurrentCustomer && (
                                                            <span className="text-[9px] font-black uppercase bg-[#16A34A] text-white px-2 py-0.5 rounded-full">
                                                                YOU
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 font-semibold">{player.team} · {player.city}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {player.verificationTier === 'Tier 3' ? (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                                                    🏆 Tournament (2.0x)
                                                </span>
                                            ) : player.verificationTier === 'Tier 2' ? (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#ECFDF5] text-[#065F46] border border-emerald-300 inline-flex items-center gap-1">
                                                    ⚖️ Umpire Verified (1.5x)
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                                                    ✓ Handshake (1.0x)
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">{player.matches}</td>
                                        <td className="py-3.5 px-4 text-center">
                                            <div className="font-mono font-black text-[#111827]">{player.runs}</div>
                                            <div className="text-[10px] font-mono text-slate-500">{player.battingAvg} avg · {player.strikeRate} sr</div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <div className="font-mono font-black text-indigo-600">{player.wickets}</div>
                                            <div className="text-[10px] font-mono text-slate-500">{player.economy} econ</div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-mono font-black text-amber-600">
                                            {player.mvps} ⭐
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <span className="text-base font-black font-mono text-[#16A34A]">
                                                {player.currentPPS}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <button
                                                onClick={() => setInspectPlayer(player)}
                                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                                            >
                                                Inspect
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                INSPECT PLAYER DETAILS MODAL
            ═══════════════════════════════════════════════════ */}
            {inspectPlayer && createPortal(
                <div className="fixed inset-0 z-[99999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 text-[#111827] relative max-h-[85vh] overflow-y-auto">
                        {/* Close Button */}
                        <button
                            onClick={() => setInspectPlayer(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#111827] transition-all cursor-pointer"
                        >
                            <HiX className="w-5 h-5" />
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-center gap-3.5">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#065F46] border border-emerald-200 flex items-center justify-center text-3xl font-black shrink-0">
                                {inspectPlayer.avatar}
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-[#111827]">{inspectPlayer.name}</h3>
                                <p className="text-xs text-slate-500 font-semibold">
                                    {inspectPlayer.team} · {inspectPlayer.city} · {inspectPlayer.role}
                                </p>
                            </div>
                        </div>

                        {/* Trust Score & PPS Rating */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                                <div className="text-[10px] font-black uppercase text-slate-500">Player Performance Score</div>
                                <div className="text-2xl font-black text-[#16A34A] font-mono mt-0.5">{inspectPlayer.currentPPS}</div>
                            </div>
                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                                <div className="text-[10px] font-black uppercase text-slate-500">Trust Credential</div>
                                <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">{inspectPlayer.trustScore}/100</div>
                            </div>
                        </div>

                        {/* Detailed Statistics */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                            <div className="font-black text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1.5">
                                Verified Career Breakdown
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-slate-700">
                                <div>Total Runs: <strong className="text-[#111827] font-mono">{inspectPlayer.runs}</strong></div>
                                <div>Batting Avg: <strong className="text-[#111827] font-mono">{inspectPlayer.battingAvg}</strong></div>
                                <div>Strike Rate: <strong className="text-[#111827] font-mono">{inspectPlayer.strikeRate}</strong></div>
                                <div>Highest Score: <strong className="text-[#111827] font-mono">{inspectPlayer.highestScore}</strong></div>
                                <div>Wickets Taken: <strong className="text-indigo-600 font-mono">{inspectPlayer.wickets}</strong></div>
                                <div>Economy Rate: <strong className="text-indigo-600 font-mono">{inspectPlayer.economy}</strong></div>
                                <div>Best Figures: <strong className="text-indigo-600 font-mono">{inspectPlayer.bestBowling}</strong></div>
                                <div>Win Rate: <strong className="text-[#16A34A] font-mono">{inspectPlayer.winRate}</strong></div>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="space-y-1.5">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Accreditations & Badges</div>
                            <div className="flex flex-wrap gap-2">
                                {inspectPlayer.badges.map((b, i) => (
                                    <span key={i} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold">
                                        {b}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setInspectPlayer(null)}
                            className="w-full py-2.5 rounded-xl bg-[#111827] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                            Close Inspection
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {/* ═══════════════════════════════════════════════════
                📝 DIRECT MATCH SCORECARD & VERIFICATION MODAL
            ═══════════════════════════════════════════════════ */}
            {isSubmitModalOpen && createPortal(
                <div className="fixed inset-0 z-[99999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-7 w-full max-w-xl shadow-2xl space-y-5 text-[#111827] relative my-auto max-h-[85vh] overflow-y-auto">
                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={() => setIsSubmitModalOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#111827] transition-all cursor-pointer"
                        >
                            <HiX className="w-5 h-5" />
                        </button>

                        {/* Modal Header */}
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#065F46] text-[11px] font-black uppercase tracking-wider">
                                <span>🏏</span> Direct Match Scorecard Entry
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#111827]">
                                Submit Indore Turf Match Score
                            </h3>
                            <p className="text-xs text-slate-500 font-semibold">
                                Enter your match stats. Verification Tier multiplier will be applied automatically to compute your live PPS Score.
                            </p>
                        </div>

                        {/* Quick 1-Click Demo Fill */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between gap-2">
                            <div className="text-[11px] font-bold text-amber-900">
                                Testing? Click to pre-fill realistic match stats in 1-click:
                            </div>
                            <button
                                type="button"
                                onClick={fillDemoScore}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-xs cursor-pointer shrink-0 transition-all"
                            >
                                ⚡ 1-Click Fill
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            {/* Verification Tier Selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                                    Verification Tier (Multiplier)
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'Tier 2', label: '⚖️ Umpire (1.5x)', desc: 'Paid Licensed Umpire' },
                                        { id: 'Tier 1', label: '✓ Handshake (1.0x)', desc: 'Captain Verified' },
                                        { id: 'Tier 3', label: '🏆 Tournament (2.0x)', desc: 'Official Cup' },
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setFormScore(prev => ({ ...prev, tier: t.id }))}
                                            className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
                                                formScore.tier === t.id
                                                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-[#065F46]'
                                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            <div className="font-black text-xs">{t.label}</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">{t.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Player & Team Name */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">Player Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formScore.playerName}
                                        onChange={e => setFormScore(prev => ({ ...prev, playerName: e.target.value }))}
                                        placeholder="e.g. Rahul Sharma (You)"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#111827] outline-none focus:border-[#16A34A] focus:bg-white"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">Team Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formScore.teamName}
                                        onChange={e => setFormScore(prev => ({ ...prev, teamName: e.target.value }))}
                                        placeholder="e.g. Vijay Nagar Blasters"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#111827] outline-none focus:border-[#16A34A] focus:bg-white"
                                    />
                                </div>
                            </div>

                            {/* Indore Zone & Role */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <CustomSelect
                                        label="Indore Turf Area / Hub"
                                        value={formScore.zone}
                                        onChange={val => setFormScore(prev => ({ ...prev, zone: val }))}
                                        options={['Vijay Nagar', 'Palasia', 'Bhawarkua', 'Super Corridor', 'Rau', 'Annapurna', 'Scheme 54'].map(z => ({ value: z, label: z }))}
                                    />
                                </div>

                                <div>
                                    <CustomSelect
                                        label="Playing Role"
                                        value={formScore.role}
                                        onChange={val => setFormScore(prev => ({ ...prev, role: val }))}
                                        options={['Top-Order Batsman', 'All-Rounder', 'Fast Bowler', 'Spin Bowler', 'Wicketkeeper Batsman', 'Pinch Hitter'].map(r => ({ value: r, label: r }))}
                                    />
                                </div>
                            </div>

                            {/* Batting Stats */}
                            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                                <div className="text-[11px] font-black uppercase text-[#065F46]">🏏 Match Batting Stats</div>
                                <div className="grid grid-cols-4 gap-2">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600">Runs Scored</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formScore.runs}
                                            onChange={e => setFormScore(prev => ({ ...prev, runs: e.target.value }))}
                                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-black text-center text-[#111827]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600">Balls</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formScore.balls}
                                            onChange={e => setFormScore(prev => ({ ...prev, balls: e.target.value }))}
                                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-black text-center text-[#111827]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600">Fours (4s)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formScore.fours}
                                            onChange={e => setFormScore(prev => ({ ...prev, fours: e.target.value }))}
                                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-black text-center text-[#111827]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600">Sixes (6s)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formScore.sixes}
                                            onChange={e => setFormScore(prev => ({ ...prev, sixes: e.target.value }))}
                                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-black text-center text-[#111827]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bowling Stats */}
                            <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-2">
                                <div className="text-[11px] font-black uppercase text-indigo-900">🎯 Match Bowling Stats</div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600">Wickets Taken</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formScore.wickets}
                                            onChange={e => setFormScore(prev => ({ ...prev, wickets: e.target.value }))}
                                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-black text-center text-[#111827]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600">Overs Bowled</label>
                                        <input
                                            type="text"
                                            value={formScore.overs}
                                            onChange={e => setFormScore(prev => ({ ...prev, overs: e.target.value }))}
                                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-black text-center text-[#111827]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600">Economy Rate</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formScore.economy}
                                            onChange={e => setFormScore(prev => ({ ...prev, economy: e.target.value }))}
                                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-black text-center text-[#111827]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* MVP Checkbox & Umpire License */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                <label className="flex items-center gap-2 p-3 bg-amber-50/70 border border-amber-200 rounded-2xl cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formScore.isMvp}
                                        onChange={e => setFormScore(prev => ({ ...prev, isMvp: e.target.checked }))}
                                        className="w-4 h-4 text-amber-600 rounded"
                                    />
                                    <span className="text-xs font-black text-amber-900">⭐ Match MVP Award (+12 pts)</span>
                                </label>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">Certifier / Umpire ID</label>
                                    <input
                                        type="text"
                                        value={formScore.certifier}
                                        onChange={e => setFormScore(prev => ({ ...prev, certifier: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#111827]"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsSubmitModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center gap-2"
                                >
                                    <span>🚀 Submit & Rank Player Live</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* ═══════════════════════════════════════════════════
                🤝 DIRECT CAPTAIN HANDSHAKE SCORECARD MODAL
            ═══════════════════════════════════════════════════ */}
            {handshakeMatch && (
                <MatchScoreVerificationModal
                    isOpen={!!handshakeMatch}
                    match={handshakeMatch}
                    onClose={() => setHandshakeMatch(null)}
                    onApprove={handleApproveHandshake}
                    onDispute={handleDisputeHandshake}
                />
            )}

            {/* Floating Action Buttons */}
            <FloatingActions />
        </div>
    )
}
