import { useState, useEffect } from 'react'
import { HiCheck, HiShieldCheck, HiStar, HiClock, HiUser, HiLockClosed, HiSparkles, HiChevronRight } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'

export default function CustomerProfile() {
    const { addToast } = useToast()
    const [activeTab, setActiveTab] = useState('stats') // 'stats' | 'personal' | 'sports' | 'security'
    const [statsMode, setStatsMode] = useState('verified') // 'verified' | 'all'

    // Personal Info State
    const [savedProfile, setSavedProfile] = useState(() => {
        const saved = localStorage.getItem('customer_profile')
        return saved ? JSON.parse(saved) : {
            fullName: 'Rahul Sharma',
            email: 'rahul.sharma@sportmatrix.in',
            phone: '+91 98765 43210',
            city: 'Mumbai',
<<<<<<< HEAD
            role: '🏏⚾ All-Rounder',
            battingStyle: 'Right-Hand Bat',
            bowlingStyle: 'Right-Arm Fast Medium'
=======
            teamName: 'Andheri Strikers',
            role: 'All-Rounder (Right-Hand Bat / Right-Arm Medium)',
            verificationLevel: 4,
            trustScore: 98
>>>>>>> 09026114b3743f19616b31f32c25347597638e70
        }
    })

    const [formData, setFormData] = useState(savedProfile)
    const [statsTab, setStatsTab] = useState('verified') // 'verified' | 'self'

    // Sports Preferences State
    const [sports, setSports] = useState(() => {
        const saved = localStorage.getItem('customer_sports')
<<<<<<< HEAD
        return saved ? JSON.parse(saved) : ['Cricket', 'Football']
=======
        return saved ? JSON.parse(saved) : ['Cricket', 'Football', 'Badminton']
>>>>>>> 09026114b3743f19616b31f32c25347597638e70
    })
    const [newSport, setNewSport] = useState('')
    const [isAddingSport, setIsAddingSport] = useState(false)

    // Password State
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

    // Effects for persistence
    useEffect(() => {
        localStorage.setItem('customer_sports', JSON.stringify(sports))
    }, [sports])

    // Handlers
    const handleUpdateProfile = () => {
        setSavedProfile(formData)
        localStorage.setItem('customer_profile', JSON.stringify(formData))
        addToast({ title: 'Profile Updated', message: 'Your personal & career information has been saved.', type: 'success' })
    }

    const handleAddSport = () => {
        if (newSport.trim() && !sports.includes(newSport.trim())) {
            setSports([...sports, newSport.trim()])
            setNewSport('')
            setIsAddingSport(false)
        }
    }

    const handleRemoveSport = (sportToRemove) => {
        setSports(sports.filter(s => s !== sportToRemove))
    }

<<<<<<< HEAD
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">My Player Profile & Career Stats</h1>
                <p className="text-surface-500 text-sm mt-1">Verified achievements, rankings, and player badges</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6">
                {/* LEFT CARD: AVATAR, VERIFICATION BADGES & RANK */}
                <Card className="text-center h-max space-y-5">
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="w-24 h-24 rounded-full bg-[#10B981] flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-emerald-500/20">
                            {savedProfile.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 bg-[#C8FF2E] text-[#111827] text-xs px-2 py-0.5 rounded-full font-black border border-[#B5F000] shadow-sm">
                            PRO
                        </span>
                    </div>

                    <div>
                        <h3 className="text-xl font-black text-[#111827]">{savedProfile.fullName}</h3>
                        <p className="text-xs text-slate-500 font-semibold">{savedProfile.city} · {savedProfile.role || '🏏⚾ All-Rounder'}</p>
                    </div>

                    {/* TIERED VERIFICATION BADGES */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2 text-left">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">TRUST VERIFICATION BADGES</span>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg">
                                📱 Phone Verified
                            </span>
                            <span className="text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg">
                                🛡️ ID Verified
                            </span>
                            <span className="text-[10px] font-black bg-emerald-50 text-[#065F46] border border-emerald-300 px-2.5 py-1 rounded-lg">
                                ⚡ Match Verified (L3)
                            </span>
                            <span className="text-[10px] font-black bg-[#FEFCE8] text-[#854D0E] border border-[#FACC15] px-2.5 py-1 rounded-lg">
                                ⚖️ Umpire Verified
                            </span>
                        </div>
                    </div>

                    {/* CITY RANK & PLAYER RATING */}
                    <div className="bg-[#ECFDF5] border border-emerald-300 rounded-2xl p-4 text-center space-y-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">CITY RANKING</span>
                        <div className="text-2xl font-black text-[#065F46] font-mono">
                            #4 <span className="text-xs text-slate-500 font-semibold">in Mumbai</span>
                        </div>
                        <span className="text-xs font-bold text-[#10B981] block">Weighted Rating: 8.4 / 10</span>
                    </div>
                </Card>
                
                {/* RIGHT CARDS: CAREER STATS & PERSONAL INFO */}
                <div className="lg:col-span-2 space-y-6">
                    {/* DUAL STATS HUB */}
                    <Card>
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-surface-900">Career Statistics</h2>
                                <p className="text-xs text-slate-500">Only opponent & umpire verified matches count towards official rank</p>
                            </div>

                            {/* DUAL STATS TOGGLE */}
                            <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setStatsTab('verified')}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                                        statsTab === 'verified'
                                            ? 'bg-[#10B981] text-white shadow-sm'
                                            : 'text-slate-600 hover:text-[#111827]'
                                    }`}
                                >
                                    ✓ Verified Stats
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatsTab('self')}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                                        statsTab === 'self'
                                            ? 'bg-[#111827] text-white shadow-sm'
                                            : 'text-slate-600 hover:text-[#111827]'
                                    }`}
                                >
                                    Self-Reported
                                </button>
                            </div>
                        </div>

                        {statsTab === 'verified' ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">MATCHES</span>
                                        <span className="text-xl font-black text-[#111827] font-mono">18</span>
                                        <span className="text-[10px] text-emerald-600 font-bold block">14 Wins (77%)</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">TOTAL RUNS</span>
                                        <span className="text-xl font-black text-[#10B981] font-mono">412</span>
                                        <span className="text-[10px] text-slate-500 font-bold block">HS: 68* (Avg 34.3)</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">STRIKE RATE</span>
                                        <span className="text-xl font-black text-[#111827] font-mono">168.4</span>
                                        <span className="text-[10px] text-slate-500 font-bold block">3x 50s</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">WICKETS</span>
                                        <span className="text-xl font-black text-purple-700 font-mono">16</span>
                                        <span className="text-[10px] text-slate-500 font-bold block">Econ: 6.2 (BBI 4/12)</span>
                                    </div>
                                </div>

                                <div className="bg-[#ECFDF5] border border-emerald-300 p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold text-[#065F46]">
                                    <span>⭐ MVP Awards: <strong className="font-black text-emerald-900">5x Match MVP</strong></span>
                                    <span>⚖️ Umpire Verified Matches: <strong className="font-black text-emerald-900">8 Matches</strong></span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-600 space-y-2">
                                <p className="font-bold text-[#111827]">Self-Reported Unverified Record:</p>
                                <p>52 Total Matches · 1,140 Runs · 42 Wickets (Self-Entered, Excluded from City Leaderboards).</p>
                            </div>
                        )}
                    </Card>

                    {/* PERSONAL INFORMATION & PLAYING STYLE */}
                    <Card>
                        <h2 className="text-lg font-bold text-surface-900 mb-4">Personal Info & Player Role</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    label="Full Name" 
                                    value={formData.fullName} 
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })} 
                                />
                                <Input 
                                    label="City" 
                                    value={formData.city} 
                                    onChange={e => setFormData({ ...formData, city: e.target.value })} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">Playing Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-bold text-[#111827] outline-none"
                                    >
                                        <option value="🏏 Batsman">🏏 Batsman</option>
                                        <option value="⚾ Bowler">⚾ Bowler</option>
                                        <option value="🏏⚾ All-Rounder">🏏⚾ All-Rounder</option>
                                        <option value="🧤 Wicketkeeper">🧤 Wicketkeeper</option>
                                    </select>
                                </div>
                                <Input 
                                    label="Batting Style" 
                                    value={formData.battingStyle} 
                                    onChange={e => setFormData({ ...formData, battingStyle: e.target.value })} 
                                />
                            </div>
                            <div className="pt-2">
                                <Button onClick={handleUpdateProfile}>Save Changes</Button>
                            </div>
                        </div>
                    </Card>
=======
    const handleUpdatePassword = () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            addToast({ title: 'Missing Fields', message: 'Please fill in all password fields.', type: 'error' })
            return
        }
        if (passwords.new !== passwords.confirm) {
            addToast({ title: 'Mismatch', message: 'New password and confirm password do not match.', type: 'error' })
            return
        }
        setPasswords({ current: '', new: '', confirm: '' })
        addToast({ title: 'Password Updated', message: 'Your password has been changed successfully.', type: 'success' })
    }

    // Dynamic Stats Mock depending on Verified vs All
    const verifiedStats = {
        matches: 28,
        wins: 21,
        winRate: '75.0%',
        runs: 1140,
        battingAvg: 47.5,
        strikeRate: 172.4,
        fifties: 7,
        hundreds: 1,
        highScore: '104*',
        wickets: 32,
        economy: 6.75,
        bestBowling: '4/18',
        mvps: 9,
        ppsScore: 88.6,
        cityRank: '#14 in Mumbai',
        tierBreakdown: {
            tier3: 8, // Tournament (2.0x)
            tier2: 12, // Umpire (1.5x)
            tier1: 8, // Captain (1.0x)
        }
    }

    const selfReportedStats = {
        matches: 35,
        wins: 25,
        winRate: '71.4%',
        runs: 1380,
        battingAvg: 44.5,
        strikeRate: 164.2,
        fifties: 8,
        hundreds: 1,
        highScore: '104*',
        wickets: 36,
        economy: 7.20,
        bestBowling: '4/18',
        mvps: 11,
        ppsScore: 79.2,
        cityRank: 'Excluded (Contains Tier 0)',
        tierBreakdown: {
            tier3: 8,
            tier2: 12,
            tier1: 8,
            tier0: 7 // Self-Reported
        }
    }

    const currentStats = statsMode === 'verified' ? verifiedStats : selfReportedStats

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Title Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>🛡️</span> Player Profile & Trust Center
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-0.5">
                        Manage your verified player credentials, trust rating, and tournament career stats.
                    </p>
                </div>

                {/* Sub Header Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'stats', label: 'Career Stats & Badges' },
                        { id: 'personal', label: 'Profile Info' },
                        { id: 'sports', label: 'Sports' },
                        { id: 'security', label: 'Security' },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                                activeTab === t.id
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
>>>>>>> 09026114b3743f19616b31f32c25347597638e70
                </div>
            </div>

            {/* VERIFICATION LEVEL PROGRESS BAR (Level 0 -> Level 4) */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-500/20 shrink-0">
                            {savedProfile.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-black text-white">{savedProfile.fullName}</h2>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center gap-1">
                                    <HiShieldCheck className="w-3.5 h-3.5" /> Level 4 Pro Elite
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 font-medium mt-0.5">
                                {savedProfile.teamName} · {savedProfile.role} · {savedProfile.city}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800 shrink-0">
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Trust Score</div>
                            <div className="text-xl font-black text-emerald-400 font-mono">{savedProfile.trustScore}/100</div>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center font-black text-xs text-emerald-400">
                            98%
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-emerald-400 uppercase tracking-wider text-[10px]">Verification Tier Progression</span>
                        <span className="font-bold text-slate-400 text-[11px]">Level 4 of 4 Reached</span>
                    </div>

                    {/* Stepper Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                        {[
                            { lvl: 'Lvl 0', name: 'Guest', desc: 'Self-Entry (0.0x)', done: true },
                            { lvl: 'Lvl 1', name: 'Phone Verified 📱', desc: 'OTP Confirmed', done: true },
                            { lvl: 'Lvl 2', name: 'ID Verified 🛡️', desc: 'Govt ID / KYC', done: true },
                            { lvl: 'Lvl 3', name: 'Match Verified ⚡', desc: '10+ Captain Handshakes', done: true },
                            { lvl: 'Lvl 4', name: 'Umpire Pro 🏆', desc: 'Tier 2 & 3 Official', done: true },
                        ].map((step, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-2xl border transition-all ${
                                    step.done
                                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                                }`}
                            >
                                <div className="flex items-center justify-between text-[10px] font-black uppercase">
                                    <span>{step.lvl}</span>
                                    {step.done && <HiCheck className="w-3.5 h-3.5 text-emerald-400" />}
                                </div>
                                <div className="text-xs font-black text-white mt-1 truncate">{step.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5 truncate">{step.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* TAB 1: CAREER STATS & BADGES */}
            {activeTab === 'stats' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Dual Stats Toggle Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
                        <div>
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <HiTrophy className="text-amber-500 w-5 h-5" />
                                Official Performance Dashboard
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Toggle between verified competition statistics and complete self-reported history.
                            </p>
                        </div>

                        {/* Dual Tabs Switcher */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
                            <button
                                onClick={() => setStatsMode('verified')}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                                    statsMode === 'verified'
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-black'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <HiShieldCheck className="w-4 h-4" />
                                <span>✓ Verified Stats ({verifiedStats.matches})</span>
                            </button>
                            <button
                                onClick={() => setStatsMode('all')}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                                    statsMode === 'all'
                                        ? 'bg-slate-900 text-white shadow-md'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <span>All Matches ({selfReportedStats.matches})</span>
                            </button>
                        </div>
                    </div>

                    {/* Key Weighted Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Player Performance Score (PPS)</div>
                            <div className="text-3xl font-black text-emerald-700 font-mono mt-1">{currentStats.ppsScore}</div>
                            <div className="text-xs font-bold text-slate-500">{currentStats.cityRank}</div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Batting Average & SR</div>
                            <div className="text-3xl font-black text-slate-900 font-mono mt-1">{currentStats.battingAvg}</div>
                            <div className="text-xs font-bold text-emerald-600">SR: {currentStats.strikeRate} · HS: {currentStats.highScore}</div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Wickets & Economy</div>
                            <div className="text-3xl font-black text-indigo-700 font-mono mt-1">{currentStats.wickets} <span className="text-sm font-medium text-slate-400">wkts</span></div>
                            <div className="text-xs font-bold text-slate-500">Econ: {currentStats.economy} · BBI: {currentStats.bestBowling}</div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Matches & MVPs</div>
                            <div className="text-3xl font-black text-amber-600 font-mono mt-1">{currentStats.mvps} ⭐</div>
                            <div className="text-xs font-bold text-slate-500">{currentStats.wins} Wins ({currentStats.winRate})</div>
                        </div>
                    </div>

                    {/* Breakdown by Verification Tier */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                        <h3 className="font-black text-base text-slate-900 flex items-center justify-between">
                            <span>Match Record Verification Distribution</span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                100% Leaderboard Eligible
                            </span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-purple-50/70 border-2 border-purple-200 rounded-2xl p-4 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-purple-700 block">Tier 3: Official Tournaments</span>
                                    <div className="text-xl font-black text-purple-950 mt-0.5">{currentStats.tierBreakdown.tier3} Matches</div>
                                    <span className="text-[11px] text-purple-800 font-bold">2.0x Maximum Rank Weight</span>
                                </div>
                                <div className="text-2xl">🏆</div>
                            </div>

                            <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-4 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-emerald-700 block">Tier 2: Platform Umpire Add-on</span>
                                    <div className="text-xl font-black text-emerald-950 mt-0.5">{currentStats.tierBreakdown.tier2} Matches</div>
                                    <span className="text-[11px] text-emerald-800 font-bold">1.5x High Trust Weight</span>
                                </div>
                                <div className="text-2xl">⚖️</div>
                            </div>

                            <div className="bg-blue-50/70 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-blue-700 block">Tier 1: Captain Handshake</span>
                                    <div className="text-xl font-black text-blue-950 mt-0.5">{currentStats.tierBreakdown.tier1} Matches</div>
                                    <span className="text-[11px] text-blue-800 font-bold">1.0x Standard Weight</span>
                                </div>
                                <div className="text-2xl">🤝</div>
                            </div>
                        </div>
                    </div>

                    {/* Official Trust Badges Showcase */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                        <h3 className="font-black text-base text-slate-900">Earned Trust Badges & Accreditations</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shrink-0">
                                    ⚖️
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-900">Paid Umpire Certified</h4>
                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">12 official matches officiated by platform umpires</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl shrink-0">
                                    🏆
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-900">Tournament Veteran</h4>
                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Participated in 8 official city tournaments</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shrink-0">
                                    ⭐
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-900">MVP Standard</h4>
                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">9 Player of the Match awards recorded</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl shrink-0">
                                    🛡️
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-900">Zero Dispute Integrity</h4>
                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">100% clean record with 0 unresolved score disputes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: PERSONAL INFO */}
            {activeTab === 'personal' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 max-w-2xl animate-in fade-in duration-200">
                    <h3 className="font-black text-lg text-slate-900">Personal Information</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Mobile Number"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <Input
                                label="City"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Primary Team Name"
                                value={formData.teamName}
                                onChange={e => setFormData({ ...formData, teamName: e.target.value })}
                            />
                            <Input
                                label="Player Role"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            />
                        </div>
                        <div className="pt-2">
                            <Button onClick={handleUpdateProfile}>Save Changes</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: SPORTS PREFERENCES */}
            {activeTab === 'sports' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 max-w-2xl animate-in fade-in duration-200">
                    <h3 className="font-black text-lg text-slate-900">Sports & Booking Preferences</h3>
                    <div className="flex flex-wrap items-center gap-3">
                        {sports.map(s => (
                            <div key={s} className="relative group">
                                <Badge variant="primary" className="px-4 py-2 text-sm">{s}</Badge>
                                <button
                                    onClick={() => handleRemoveSport(s)}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            </div>
                        ))}

                        {isAddingSport ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    className="w-36 py-1 h-9 text-xs font-bold"
                                    placeholder="e.g. Pickleball"
                                    value={newSport}
                                    onChange={e => setNewSport(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddSport()}
                                    autoFocus
                                />
                                <Button size="sm" variant="secondary" onClick={() => setIsAddingSport(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleAddSport}>Add</Button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAddingSport(true)}
                                className="px-4 py-2 border-2 border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer transition-all"
                            >
                                + Add Sport
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 4: SECURITY & PASSWORD */}
            {activeTab === 'security' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 max-w-md animate-in fade-in duration-200">
                    <h3 className="font-black text-lg text-slate-900">Change Password</h3>
                    <div className="space-y-4">
                        <Input
                            label="Current Password"
                            type="password"
                            placeholder="••••••••"
                            value={passwords.current}
                            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                        />
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            value={passwords.new}
                            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            value={passwords.confirm}
                            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                        />
                        <div className="pt-2">
                            <Button onClick={handleUpdatePassword}>Update Password</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
