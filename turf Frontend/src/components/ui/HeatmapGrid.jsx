const intensityColors = [
    'bg-surface-100', 'bg-accent-100', 'bg-accent-200', 'bg-accent-400', 'bg-accent-500',
]

export default function HeatmapGrid({ data = [], xLabels = [], yLabels = [], className = '' }) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <div className="inline-block">
                <div className="flex">
                    <div className="w-16" />
                    {xLabels.map((x) => (
                        <div key={x} className="w-10 text-center text-[10px] text-surface-400 font-medium pb-1">{x}</div>
                    ))}
                </div>
                {yLabels.map((y, yi) => (
                    <div key={y} className="flex items-center">
                        <div className="w-16 text-xs text-surface-500 font-medium pr-2 text-right">{y}</div>
                        {xLabels.map((x, xi) => {
                            const val = data[yi]?.[xi] || 0
                            const level = Math.min(4, Math.floor(val / 25))
                            return (
                                <div key={`${y}-${x}`} className="w-10 h-8 p-0.5">
                                    <div className={`w-full h-full rounded ${intensityColors[level]} transition-colors`} title={`${y} ${x}: ${val}%`} />
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}
