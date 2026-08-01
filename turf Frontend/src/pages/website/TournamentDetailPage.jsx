import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HiArrowLeft, HiLocationMarker, HiCalendar, HiDocumentText } from 'react-icons/hi'
import BracketComponent from '../../components/ui/BracketComponent'

const bracketRounds = [
    {
        name: 'Quarter Finals', matches: [
            { teams: [{ seed: 1, name: 'Thunder XI', score: 145, winner: true }, { seed: 8, name: 'Cobras', score: 122 }] },
            { teams: [{ seed: 4, name: 'Warriors', score: 138 }, { seed: 5, name: 'Titans', score: 142, winner: true }] },
            { teams: [{ seed: 2, name: 'Royal Challengers', score: 156, winner: true }, { seed: 7, name: 'Eagles', score: 134 }] },
            { teams: [{ seed: 3, name: 'Super Kings', score: 160, winner: true }, { seed: 6, name: 'Panthers', score: 148 }] },
        ]
    },
    {
        name: 'Semi Finals', matches: [
            { teams: [{ seed: 1, name: 'Thunder XI', score: '—' }, { seed: 5, name: 'Titans', score: '—' }] },
            { teams: [{ seed: 2, name: 'Royal Challengers', score: '—' }, { seed: 3, name: 'Super Kings', score: '—' }] },
        ]
    },
    {
        name: 'Final', matches: [
            { teams: [{ seed: '?', name: 'TBD', score: '—' }, { seed: '?', name: 'TBD', score: '—' }] },
        ]
    },
]

const getTournamentDetails = (id) => {
    const list = [
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
    
    const found = list.find(t => t.id === Number(id)) || list[0]
    const isCricket = found.sport.toLowerCase() === 'cricket'
    
    return {
        ...found,
        venue: isCricket ? 'SportZone Arena, Mumbai' : 'Green Arena Football Turf, Mumbai',
        format: 'Single Elimination',
        rules: isCricket ? [
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
        ],
        timeline: isCricket ? [
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
        ],
        perks: isCricket ? [
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
        ],
        registeredTeams: ['Thunder XI', 'Royal Challengers', 'Super Kings', 'Warriors', 'Titans', 'Panthers', 'Eagles', 'Sharks', 'Lions', 'Bulls', 'Hawks', 'Cobras'].slice(0, found.teams - found.spotsLeft)
    }
}

export default function TournamentDetailPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const tournament = getTournamentDetails(id)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [id])

    return (
        <div className="min-h-screen bg-slate-950 pb-20 relative overflow-x-clip">
            {/* Hero Image Header */}
            <div className="w-full px-5 md:px-10 lg:px-20 pt-28 pb-6 relative z-10">
                {/* Background subtle banner overlay */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <img src={tournament.image} alt={tournament.name} className="w-full h-full object-cover opacity-10 blur-sm" />
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
                                    {tournament.name}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-slate-900 border border-white/10 text-[8px] font-black tracking-widest text-white uppercase rounded-md">
                                        {tournament.sport}
                                    </span>
                                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black tracking-widest text-emerald-400 uppercase rounded-md flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                        {tournament.status}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold tracking-widest uppercase text-slate-400">
                                <span className="flex items-center gap-1"><HiLocationMarker className="text-emerald-500 w-3.5 h-3.5" /> {tournament.venue}</span>
                                <span className="text-slate-700">|</span>
                                <span className="flex items-center gap-1"><HiCalendar className="text-amber-500 w-3.5 h-3.5" /> {tournament.date}</span>
                            </div>
                        </div>
                    </div>

                    {/* Core Stats Grid rendered directly in the header row on the right */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {[
                            { l: 'Prize Pool', v: `₹${tournament.prize}`, c: 'text-amber-400', b: 'border-amber-500/25 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-amber-500/5' },
                            { l: 'Entry Fee', v: `₹${tournament.entryFee}`, c: 'text-white', b: 'border-white/15 bg-white/5' },
                            { l: 'Format', v: tournament.format, c: 'text-emerald-400', b: 'border-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-500/5' },
                            { l: 'Spots Left', v: `${tournament.spotsLeft}/${tournament.teams}`, c: 'text-emerald-400', b: 'border-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-500/5' }
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
                <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
                    {/* Main Content Space */}
                    <div className="lg:w-[65%] xl:w-[70%] space-y-8">
                        {/* Tournament Bracket (shifted to top) */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
                            <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 mb-8 flex items-center gap-2">
                                <span className="h-px w-4 bg-emerald-500/50" /> COMPETITION BRACKET
                            </h2>
                            <div className="overflow-x-auto pb-4 custom-scrollbar">
                                <BracketComponent rounds={bracketRounds} />
                            </div>
                        </div>

                        {/* Row 1 Side by side Rules & Squads */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Rules */}
                            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                                <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 mb-6 flex items-center gap-2">
                                    <span className="h-px w-4 bg-emerald-500/50" /> TOURNAMENT DIRECTIVES
                                </h2>
                                <ul className="space-y-5">
                                    {tournament.rules.map((r, i) => (
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
                                        {tournament.registeredTeams.length} / {tournament.teams} MAX
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-white">
                                    {tournament.registeredTeams.map((t, i) => (
                                        <div key={t} className="flex items-center gap-2.5 px-3 py-3 bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-emerald-500/30 rounded-xl text-sm transition-all duration-300 group cursor-default shadow-md">
                                            <span className="w-6 h-6 rounded-full bg-slate-950 border border-white/10 text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 flex items-center justify-center text-[10px] font-black transition-colors shrink-0">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <span className="font-black tracking-wide uppercase text-[11px] text-slate-200 group-hover:text-emerald-400 transition-colors truncate">{t}</span>
                                        </div>
                                    ))}
                                    {/* Empty Slots */}
                                    {Array.from({ length: tournament.teams - tournament.registeredTeams.length }).map((_, i) => (
                                        <div key={`empty-${i}`} className="flex items-center gap-2.5 px-3 py-3 bg-slate-950/20 border border-white/5 border-dashed rounded-xl opacity-40">
                                            <span className="w-6 h-6 rounded-full bg-slate-950/40 border border-white/5 border-dashed text-slate-600 flex items-center justify-center text-[9px] font-black shrink-0">
                                                --
                                            </span>
                                            <span className="font-bold tracking-wide uppercase text-[10px] text-slate-500">AWAITING</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Row 2 Side by side Schedule & Turf Perks (Expanded Owner Info) */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Schedule Timeline */}
                            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                                <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 mb-6 flex items-center gap-2">
                                    <span className="h-px w-4 bg-emerald-500/50" /> TOURNAMENT TIMELINE
                                </h2>
                                <div className="relative pl-6 border-l border-white/10 space-y-4">
                                    {tournament.timeline.map((item, idx) => (
                                        <div key={idx} className="relative">
                                            {/* Glowing Dot */}
                                            <div className="absolute -left-[30px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">{item.time}</span>
                                            <span className="text-xs font-bold text-slate-200 tracking-wide">{item.event}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Turf Perks & Amenities */}
                            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                                <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 mb-6 flex items-center gap-2">
                                    <span className="h-px w-4 bg-emerald-500/50" /> TURF AMENITIES & PERKS
                                </h2>
                                <ul className="space-y-4">
                                    {tournament.perks.map((p, i) => (
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
                                        <span className="text-white text-base tabular-nums">₹{tournament.entryFee}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
                                        <span className="text-amber-500/70">Prize Pool</span>
                                        <span className="text-amber-400 font-black tabular-nums text-lg">₹{tournament.prize}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                                        <span className="text-emerald-500/70">Open Slots</span>
                                        <span className="text-emerald-400 font-black text-lg tabular-nums">{tournament.spotsLeft}</span>
                                    </div>
                                </div>

                                <button
                                    className="w-full py-4 text-xs font-black italic tracking-widest uppercase rounded-xl transition-all duration-300 bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                                >
                                    REGISTER SQUAD
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
        </div>
    )
}
