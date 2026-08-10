export default function BracketComponent({ rounds = [] }) {
    return (
        <div className="w-full relative">
            <div className="flex gap-12 min-w-max py-6 px-4">
                {rounds.map((round, ri) => (
                    <div key={ri} className="flex flex-col justify-around gap-8 min-w-[280px] relative">
                        {/* Round Header */}
                        <div className="absolute -top-6 left-0 right-0 text-center">
                            <h4 className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">{round.name}</h4>
                            <div className="h-px w-16 mx-auto bg-[#E5E7EB] mt-2" />
                        </div>

                        {round.matches.map((match, mi) => (
                            <div key={mi} className="relative group p-px rounded-2xl bg-[#E5E7EB] hover:bg-[#16A34A]/40 transition-colors duration-300 shadow-xs">
                                <div className="bg-white rounded-2xl overflow-hidden flex flex-col relative z-10 border border-[#E5E7EB]">
                                    {match.teams.map((team, ti) => (
                                        <div
                                            key={ti}
                                            className={`flex items-center justify-between px-4 py-3 relative transition-colors duration-300 ${ti === 0 ? 'border-b border-[#E5E7EB] pb-3' : 'pt-3'
                                                } ${team.winner
                                                    ? 'bg-green-50/80 border-l-4 border-l-[#16A34A]'
                                                    : 'bg-white hover:bg-slate-50'
                                                }`}
                                        >
                                            {/* Connecting Lines for Bracket (Right Side) */}
                                            {ri < rounds.length - 1 && (
                                                <div className="absolute -right-6 top-1/2 w-6 h-px bg-[#E5E7EB] pointer-events-none group-hover:bg-[#16A34A]/50 transition-colors" />
                                            )}

                                            {/* Vertical Connector */}
                                            {ri < rounds.length - 1 && mi % 2 === 0 && ti === 1 && (
                                                <div className="absolute -right-6 top-1/2 w-px h-[calc(100%+2rem)] bg-[#E5E7EB] pointer-events-none group-hover:bg-[#16A34A]/50 transition-colors" />
                                            )}
                                            {ri < rounds.length - 1 && mi % 2 === 1 && ti === 0 && (
                                                <div className="absolute -right-6 bottom-1/2 w-px h-[calc(100%+2rem)] bg-[#E5E7EB] pointer-events-none group-hover:bg-[#16A34A]/50 transition-colors" />
                                            )}

                                            {/* Left Connecting Line (Incoming) */}
                                            {ri > 0 && ti === 0 && (
                                                <div className="absolute -left-6 top-full w-6 h-px bg-[#E5E7EB] pointer-events-none" />
                                            )}

                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black font-mono transition-colors ${team.winner
                                                    ? 'bg-[#C8FF2E] text-[#111827] border border-[#B5F000] shadow-xs'
                                                    : team.name === 'TBD'
                                                        ? 'bg-slate-100 border border-[#E5E7EB] text-[#9CA3AF]'
                                                        : 'bg-slate-100 border border-[#E5E7EB] text-[#6B7280]'
                                                    }`}>
                                                    {team.seed}
                                                </div>
                                                <span className={`text-xs uppercase tracking-wide truncate max-w-[120px] transition-colors ${team.winner
                                                    ? 'font-black text-[#16A34A]'
                                                    : team.name === 'TBD'
                                                        ? 'font-bold text-[#9CA3AF]'
                                                        : 'font-bold text-[#111827]'
                                                    }`}>
                                                    {team.name}
                                                </span>
                                            </div>
                                            <span className={`text-sm tabular-nums font-black transition-colors ${team.winner
                                                ? 'text-[#16A34A]'
                                                : team.name === 'TBD'
                                                    ? 'text-[#9CA3AF]'
                                                    : 'text-[#6B7280]'
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
