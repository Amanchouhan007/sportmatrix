import { IoFootball } from 'react-icons/io5'
import { GiCricketBat } from 'react-icons/gi'

const categories = [
    { id: 'football', label: 'Football', icon: IoFootball },
    { id: 'cricket', label: 'Cricket', icon: GiCricketBat },
]

export default function CategoryBar({ activeId, onSelect }) {
    return (
        <div className="w-full flex justify-center pb-0 pt-6">
            <div className="inline-flex items-center gap-1.5 p-1.5 bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl relative z-10">
                {categories.map((item) => {
                    const isActive = activeId?.toLowerCase() === item.label.toLowerCase() || activeId?.toLowerCase() === item.id.toLowerCase()
                    const isGaming = item.id === 'gaming-zone'
                    const Icon = item.icon

                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelect?.(item.label)}
                            className={`
                                relative flex flex-col items-center justify-center min-w-[105px] h-20 px-2 rounded-xl transition-all duration-300 group cursor-pointer border
                                ${isGaming 
                                    ? isActive 
                                        ? 'bg-purple-950/30 border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.25)] text-purple-400' 
                                        : 'border-transparent text-slate-400 hover:text-purple-300 hover:bg-purple-950/10 hover:border-purple-500/10'
                                    : isActive 
                                        ? 'bg-emerald-600/10 border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-emerald-400' 
                                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                }
                            `}
                        >
                            {item.badge && (
                                <span className={`absolute -top-2 px-2 py-0.5 text-[8px] font-black uppercase rounded-md shadow-lg ${isGaming ? 'bg-purple-600 text-white shadow-purple-500/30' : 'bg-emerald-600 text-white shadow-emerald-500/30'}`}>
                                    {item.badge}
                                </span>
                            )}
                            <div className={`
                                transition-all duration-300 mb-1.5
                                ${isActive 
                                    ? isGaming 
                                        ? 'text-purple-400 scale-110 shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                                        : 'text-emerald-400 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                                    : 'text-slate-400'
                                }
                            `}>
                                <Icon className="w-8 h-8 md:w-9 md:h-9" />
                            </div>

                            <span className={`
                                text-[9px] md:text-[10px] font-black uppercase tracking-wider text-center leading-tight
                                ${isActive 
                                    ? isGaming 
                                        ? 'text-purple-400' 
                                        : 'text-emerald-400' 
                                    : 'text-slate-400'
                                }
                            `}>
                                {item.label}
                            </span>

                            {isActive && (
                                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[3px] rounded-full ${isGaming ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

