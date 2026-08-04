export default function StatCard({
    label,
    value,
    change,
    icon,
    trend = 'up',
    className = '',
    accentColor,
    colorTheme = 'blue',
    cardBg,
    iconBg
}) {
    const THEMES = {
        blue: {
            cardBg: 'bg-blue-50/70 border-blue-200/80',
            accent: 'bg-blue-500',
            iconBg: 'bg-blue-500 text-white'
        },
        green: {
            cardBg: 'bg-emerald-50/70 border-emerald-200/80',
            accent: 'bg-emerald-500',
            iconBg: 'bg-emerald-500 text-white'
        },
        emerald: {
            cardBg: 'bg-emerald-50/70 border-emerald-200/80',
            accent: 'bg-emerald-500',
            iconBg: 'bg-emerald-500 text-white'
        },
        purple: {
            cardBg: 'bg-purple-50/70 border-purple-200/80',
            accent: 'bg-purple-500',
            iconBg: 'bg-purple-500 text-white'
        },
        amber: {
            cardBg: 'bg-amber-50/70 border-amber-200/80',
            accent: 'bg-amber-500',
            iconBg: 'bg-amber-500 text-white'
        },
        orange: {
            cardBg: 'bg-amber-50/70 border-amber-200/80',
            accent: 'bg-amber-500',
            iconBg: 'bg-amber-500 text-white'
        },
        rose: {
            cardBg: 'bg-rose-50/70 border-rose-200/80',
            accent: 'bg-rose-500',
            iconBg: 'bg-rose-500 text-white'
        },
        red: {
            cardBg: 'bg-rose-50/70 border-rose-200/80',
            accent: 'bg-rose-500',
            iconBg: 'bg-rose-500 text-white'
        },
        indigo: {
            cardBg: 'bg-indigo-50/70 border-indigo-200/80',
            accent: 'bg-indigo-500',
            iconBg: 'bg-indigo-500 text-white'
        },
        cyan: {
            cardBg: 'bg-cyan-50/70 border-cyan-200/80',
            accent: 'bg-cyan-500',
            iconBg: 'bg-cyan-500 text-white'
        }
    }

    let themeKey = colorTheme
    if (accentColor) {
        if (accentColor.includes('emerald') || accentColor.includes('green')) themeKey = 'emerald'
        else if (accentColor.includes('purple')) themeKey = 'purple'
        else if (accentColor.includes('amber') || accentColor.includes('orange')) themeKey = 'amber'
        else if (accentColor.includes('rose') || accentColor.includes('red')) themeKey = 'rose'
        else if (accentColor.includes('indigo')) themeKey = 'indigo'
        else if (accentColor.includes('cyan')) themeKey = 'cyan'
        else themeKey = 'blue'
    }

    const selectedTheme = THEMES[themeKey] || THEMES.blue
    const finalCardBg = cardBg || selectedTheme.cardBg
    const finalAccent = accentColor || selectedTheme.accent
    const finalIconBg = iconBg || selectedTheme.iconBg

    return (
        <div className={`rounded-2xl border p-5 relative overflow-hidden shadow-soft transition-all hover:-translate-y-0.5 ${finalCardBg} ${className}`}>
            <div className={`absolute top-0 left-0 h-1 w-full ${finalAccent}`}></div>
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-black text-surface-900 tracking-tight">{value}</p>
                    {change && (
                        <p className={`text-xs font-bold flex items-center gap-1 ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {trend === 'up' ? '↑' : '↓'} {change}
                        </p>
                    )}
                </div>
                {icon && <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shadow-soft ${finalIconBg}`}>{icon}</div>}
            </div>
        </div>
    )
}
