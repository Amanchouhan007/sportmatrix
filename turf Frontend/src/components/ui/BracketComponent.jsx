export default function BracketComponent({ rounds = [] }) {
    return (
        <div className="w-full relative">
            <div className="flex gap-12 min-w-max py-6 px-4">
                {rounds.map((round, ri) => (
                    <div key={ri} className="flex flex-col justify-around gap-8 min-w-[280px] relative">
                        {/* Round Header */}
                        <div className="absolute -top-6 left-0 right-0 text-center">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{round.name}</h4>
                            <div className="h-px w-16 mx-auto bg-slate-800 mt-2" />
                        </div>

                        {round.matches.map((match, mi) => (
                            <div key={mi} className="relative group p-px rounded-sm bg-gradient-to-b from-white/10 to-transparent hover:from-emerald-500/50 transition-colors duration-500">
                                <div className="bg-slate-900 rounded-sm overflow-hidden flex flex-col relative z-10 shadow-lg">
                                    {match.teams.map((team, ti) => (
                                        <div
                                            key={ti}
                                            className={`flex items-center justify-between px-4 py-3 relative transition-colors duration-300 ${ti === 0 ? 'border-b border-white/5 pb-3.5' : 'pt-3.5'
                                                } ${team.winner
                                                    ? 'bg-emerald-500/10 shadow-[inset_2px_0_0_0_#10b981]'
                                                    : 'bg-transparent hover:bg-white/5'
                                                }`}
                                        >
                                            {/* Connecting Lines for Bracket (Right Side) */}
                                            {ri < rounds.length - 1 && (
                                                <div className="absolute -right-6 top-1/2 w-6 h-px bg-slate-800 pointer-events-none group-hover:bg-emerald-500/30 transition-colors" />
                                            )}

                                            {/* Vertical Connector (Generated dynamically via CSS ideally, simplified here) */}
                                            {ri < rounds.length - 1 && mi % 2 === 0 && ti === 1 && (
                                                <div className="absolute -right-6 top-1/2 w-px h-[calc(100%+2rem)] bg-slate-800 pointer-events-none group-hover:bg-emerald-500/30 transition-colors" />
                                            )}
                                            {ri < rounds.length - 1 && mi % 2 === 1 && ti === 0 && (
                                                <div className="absolute -right-6 bottom-1/2 w-px h-[calc(100%+2rem)] bg-slate-800 pointer-events-none group-hover:bg-emerald-500/30 transition-colors" />
                                            )}

                                            {/* Left Connecting Line (Incoming) */}
                                            {ri > 0 && ti === 0 && (
                                                <div className="absolute -left-6 top-full w-6 h-px bg-slate-800 pointer-events-none" />
                                            )}

                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-sm flex items-center justify-center text-[9px] font-black font-mono transition-colors ${team.winner
                                                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                                    : team.name === 'TBD'
                                                        ? 'bg-slate-950/50 border border-white/5 text-slate-700'
                                                        : 'bg-slate-800 text-slate-400'
                                                    }`}>
                                                    {team.seed}
                                                </div>
                                                <span className={`text-xs uppercase tracking-wide truncate max-w-[120px] transition-colors ${team.winner
                                                    ? 'font-black text-white'
                                                    : team.name === 'TBD'
                                                        ? 'font-bold text-slate-600'
                                                        : 'font-bold text-slate-300 group-hover:text-white'
                                                    }`}>
                                                    {team.name}
                                                </span>
                                            </div>
                                            <span className={`text-sm tabular-nums font-black transition-colors ${team.winner
                                                ? 'text-emerald-400'
                                                : team.name === 'TBD'
                                                    ? 'text-slate-700'
                                                    : 'text-slate-500 group-hover:text-slate-300'
                                                }`}>
                                                {team.score}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
