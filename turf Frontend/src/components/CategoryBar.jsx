import { IoFootball, IoFootballOutline, IoCricketballOutline } from 'react-icons/io5'
import { GiCricketBat, GiShuttlecock, GiCricketBall } from 'react-icons/gi'
import { MdSportsCricket } from 'react-icons/md'

const categories = [
    { id: 'cricket', label: 'Cricket', icon: GiCricketBat },
    { id: 'boxcricket', label: 'Box Cricket', icon: GiCricketBat },
]

export default function CategoryBar({ activeId, onSelect }) {
    return (
        <div className="w-full relative px-6 md:px-12 max-w-[1400px] mx-auto z-40">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <div className="flex overflow-x-auto hide-scrollbar py-4 scroll-smooth">
                <div className="flex items-center gap-4 lg:gap-8 mx-auto px-4 min-w-max">
                    {categories.map((item) => {
                        const isActive = activeId?.toLowerCase() === item.label.toLowerCase() || activeId?.toLowerCase() === item.id.toLowerCase()
                        const Icon = item.icon

                        return (
                            <button
                                key={item.id}
                                onClick={() => onSelect?.(item.label)}
                                className={`
                                    relative flex flex-col items-center justify-center min-w-[72px] lg:min-w-[84px] gap-1.5 rounded-xl transition-all duration-300 group cursor-pointer 
                                    ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
                                `}
                            >
                                <div className={`
                                    transition-all duration-300 w-10 h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center border
                                    ${isActive 
                                        ? 'bg-[#19E68C]/10 border-[#19E68C] text-[#19E68C] shadow-[0_0_15px_rgba(25,230,140,0.2)]' 
                                        : 'bg-white/5 border-transparent text-slate-400 group-hover:bg-white/10 group-hover:text-white'
                                    }
                                `}>
                                    <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                                </div>

                                <span className={`
                                    text-[10px] lg:text-xs font-bold tracking-wide text-center whitespace-nowrap
                                    ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}
                                `}>
                                    {item.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

