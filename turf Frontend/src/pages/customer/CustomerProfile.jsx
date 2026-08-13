import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'

export default function CustomerProfile() {
    const { addToast } = useToast()

    // Personal Info State
    const [savedProfile, setSavedProfile] = useState(() => {
        const saved = localStorage.getItem('customer_profile')
        return saved ? JSON.parse(saved) : {
            fullName: 'Rahul Kumar',
            email: 'rahul@email.com',
            phone: '+91 98765 43210',
            city: 'Mumbai',
            role: '🏏⚾ All-Rounder',
            battingStyle: 'Right-Hand Bat',
            bowlingStyle: 'Right-Arm Fast Medium'
        }
    })

    const [formData, setFormData] = useState(savedProfile)
    const [statsTab, setStatsTab] = useState('verified') // 'verified' | 'self'

    // Sports Preferences State
    const [sports, setSports] = useState(() => {
        const saved = localStorage.getItem('customer_sports')
        return saved ? JSON.parse(saved) : ['Cricket', 'Football']
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
                </div>
            </div>
        </div>
    )
}
