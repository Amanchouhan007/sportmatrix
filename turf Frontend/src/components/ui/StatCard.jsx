export default function StatCard({
    label,
    value,
    change,
    icon,
    trend = 'up',
    className = '',
    accentColor,
    colorTheme = 'emerald',
    cardBg,
    iconBg
}) {
    const THEMES = {
        green: {
            accent: 'bg-emerald-500',
            iconBg: 'bg-emerald-50 text-[#10B981] border border-emerald-200/60',
            badgeBg: 'bg-emerald-50 text-emerald-700'
        },
        emerald: {
            accent: 'bg-emerald-500',
            iconBg: 'bg-emerald-50 text-[#10B981] border border-emerald-200/60',
            badgeBg: 'bg-emerald-50 text-emerald-700'
        },
        blue: {
            accent: 'bg-blue-500',
            iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/60',
            badgeBg: 'bg-blue-50 text-blue-700'
        },
        purple: {
            accent: 'bg-purple-500',
            iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/60',
            badgeBg: 'bg-purple-50 text-purple-700'
        },
        amber: {
            accent: 'bg-amber-500',
            iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
            badgeBg: 'bg-amber-50 text-amber-700'
        },
        orange: {
            accent: 'bg-amber-500',
            iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
            badgeBg: 'bg-amber-50 text-amber-700'
        },
        rose: {
            accent: 'bg-rose-500',
            iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/60',
            badgeBg: 'bg-rose-50 text-rose-700'
        },
        red: {
            accent: 'bg-rose-500',
            iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/60',
            badgeBg: 'bg-rose-50 text-rose-700'
        },
        indigo: {
            accent: 'bg-indigo-500',
            iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200/60',
            badgeBg: 'bg-indigo-50 text-indigo-700'
        }
    }

    let themeKey = colorTheme
    if (accentColor) {
        if (accentColor.includes('emerald') || accentColor.includes('green')) themeKey = 'emerald'
        else if (accentColor.includes('purple')) themeKey = 'purple'
        else if (accentColor.includes('amber') || accentColor.includes('orange')) themeKey = 'amber'
        else if (accentColor.includes('rose') || accentColor.includes('red')) themeKey = 'rose'
        else if (accentColor.includes('indigo')) themeKey = 'indigo'
        else themeKey = 'blue'
    }

    const selectedTheme = THEMES[themeKey] || THEMES.emerald
    const finalAccent = accentColor || selectedTheme.accent
    const finalIconBg = iconBg || selectedTheme.iconBg

    return (
        <div className={`bg-white rounded-[20px] border border-slate-200/80 p-5 sm:p-6 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group ${cardBg || ''} ${className}`}>
            {/* Top color accent strip */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${finalAccent} transition-all duration-300 group-hover:h-1.5`} />

            <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 min-w-0">
                    <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest truncate">{label}</p>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none truncate">{value}</p>
                    {change && (
                        <div className="flex items-center gap-1.5 pt-1">
                            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                trend === 'up' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60' : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                            }`}>
                                <span className="text-[10px]">{trend === 'up' ? '▲' : '▼'}</span>
                                {change}
                            </span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-2xs ${finalIconBg}`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    )
}
