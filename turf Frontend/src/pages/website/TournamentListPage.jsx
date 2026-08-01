import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiLightningBolt, HiCalendar } from 'react-icons/hi'

const tournaments = [
    { id: 1, name: 'Premier Cricket League', sport: 'Cricket', date: 'Mar 15, 2026', prize: '50,000', entryFee: '500', teams: 16, spotsLeft: 4, status: 'Registration Open', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800' },
    { id: 2, name: 'Urban Football Cup', sport: 'Football', date: 'Mar 22, 2026', prize: '30,000', entryFee: '400', teams: 16, spotsLeft: 2, status: 'Registration Open', image: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80&w=800' },
    { id: 3, name: 'Football Super Cup', sport: 'Football', date: 'Apr 20, 2026', prize: '25,000', entryFee: '600', teams: 8, spotsLeft: 3, status: 'Registration Open', image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=800' },
    { id: 4, name: 'Championship Turf League', sport: 'Cricket', date: 'May 5, 2026', prize: '60,000', entryFee: '800', teams: 12, spotsLeft: 5, status: 'Registration Open', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800' },
    { id: 5, name: 'Metro Football Series', sport: 'Football', date: 'May 12, 2026', prize: '40,000', entryFee: '500', teams: 16, spotsLeft: 10, status: 'Registration Open', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800' },
    { id: 6, name: 'Deccan Cricket Challenge', sport: 'Cricket', date: 'Jun 1, 2026', prize: '1,00,000', entryFee: '1,200', teams: 24, spotsLeft: 14, status: 'Registration Open', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800' },
    { id: 7, name: 'National Turf Football Cup', sport: 'Football', date: 'Jun 18, 2026', prize: '80,000', entryFee: '1,000', teams: 20, spotsLeft: 8, status: 'Registration Open', image: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80&w=800' },
    { id: 8, name: 'Golden Bat Invitational', sport: 'Cricket', date: 'Jul 4, 2026', prize: '35,000', entryFee: '400', teams: 12, spotsLeft: 0, status: 'Registration Closed', image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&q=80&w=800' },
    { id: 9, name: 'Champions Arena Cup', sport: 'Football', date: 'Jul 24, 2026', prize: '45,000', entryFee: '550', teams: 16, spotsLeft: 6, status: 'Registration Open', image: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=800' },
    { id: 10, name: 'Apex Cricket Trophy', sport: 'Cricket', date: 'Aug 10, 2026', prize: '75,000', entryFee: '900', teams: 12, spotsLeft: 8, status: 'Registration Open', image: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?auto=format&fit=crop&q=80&w=800' },
]

export default function TournamentListPage() {
    const navigate = useNavigate()
    const [filter, setFilter] = useState('All')

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const filtered = tournaments.filter(t => {
        if (filter === 'All') return true
        if (filter === 'Open') return t.status === 'Registration Open'
        if (filter === 'Closed') return t.status === 'Registration Closed' || t.status === 'Upcoming'
        return true
    })

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-x-0 top-0 h-[50vh] z-0 pointer-events-none">
                <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-20 mix-blend-overlay" alt="Tournament Background" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/90 to-slate-950" />
            </div>

            <div className="w-full px-5 md:px-10 lg:px-20 relative z-10">
                {/* Header section with inline filters */}
                <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/10 pb-8 gap-8">
                    <div className="shrink-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full mb-4.5">
                            <HiLightningBolt className="w-3 h-3 text-amber-500" />
                            <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase">Competitive Matrix</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg mb-2">TOURNEY HUB</h1>
                        <p className="text-slate-400 font-medium max-w-lg text-sm">Assemble your squad, compete for glory, and dominate the leaderboard in elite verified tournaments.</p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-1.5 rounded-full border border-white/10 backdrop-blur-xl">
                        {['All', 'Open', 'Closed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${filter === f
                                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tournament Grid */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    {filtered.map(t => {
                        const isOpen = t.status === 'Registration Open'

                        return (
                            <div
                                key={t.id}
                                onClick={() => navigate(`/tournaments/${t.id}`)}
                                className="group relative bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:border-emerald-500/35 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.08)] flex flex-col h-full"
                            >
                                {/* Top Image Banner */}
                                <div className="h-40 relative overflow-hidden shrink-0">
                                    <img src={t.image} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                                    {/* Status Badge */}
                                    <div className={`absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-0.5 backdrop-blur-md rounded-md border text-[8px] font-black tracking-widest uppercase ${isOpen
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                        : 'bg-slate-950/60 border-white/20 text-slate-400'
                                        }`}>
                                        {isOpen && <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />}
                                        {t.status}
                                    </div>

                                    {/* Sport Badge */}
                                    <div className="absolute top-3.5 left-3.5 bg-slate-950/80 backdrop-blur border border-white/10 px-2.5 py-0.5 rounded-md">
                                        <span className="text-[8px] font-black tracking-widest text-white uppercase">{t.sport}</span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 flex flex-col flex-1 relative z-10">
                                    <h3 className="text-base font-black text-white italic tracking-tighter uppercase leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors mb-1.5">
                                        {t.name}
                                    </h3>
                                    
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mb-4">
                                        <HiCalendar className="w-3.5 h-3.5 text-emerald-500" />
                                        {t.date}
                                        <span className="text-slate-600 font-normal">|</span>
                                        <span className={`font-black uppercase tracking-wider text-[8px] ${isOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {t.spotsLeft}/{t.teams} spots left
                                        </span>
                                    </div>

                                    {/* Simple Clean Bottom Info */}
                                    <div className="flex justify-between items-center mt-auto pt-3.5 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">Grand Prize</span>
                                            <span className="text-sm font-black text-amber-400">₹{t.prize}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">Entry Fee</span>
                                            <span className="text-sm font-black text-white">₹{t.entryFee}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-20 bg-slate-900/30 border border-white/5 rounded-2xl">
                        <HiLightningBolt className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No tournaments currently available for this filter.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
