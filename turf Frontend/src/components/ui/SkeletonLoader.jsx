export default function SkeletonLoader({ variant = 'text', lines = 3, className = '' }) {
    if (variant === 'card') {
        return (
            <div className={`bg-white rounded-2xl border border-surface-200 p-6 space-y-4 ${className}`}>
                <div className="h-4 w-1/3 bg-surface-200 rounded-lg skeleton-pulse" />
                <div className="h-8 w-2/3 bg-surface-200 rounded-lg skeleton-pulse" />
                <div className="h-3 w-full bg-surface-100 rounded-lg skeleton-pulse" />
                <div className="h-3 w-4/5 bg-surface-100 rounded-lg skeleton-pulse" />
            </div>
        )
    }
    if (variant === 'table') {
        return (
            <div className={`bg-white rounded-2xl border border-surface-200 overflow-hidden ${className}`}>
                <div className="bg-surface-50 px-5 py-3"><div className="h-3 w-full bg-surface-200 rounded skeleton-pulse" /></div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-5 py-4 border-t border-surface-100 flex gap-6">
                        <div className="h-3 w-1/4 bg-surface-100 rounded skeleton-pulse" />
                        <div className="h-3 w-1/3 bg-surface-100 rounded skeleton-pulse" />
                        <div className="h-3 w-1/6 bg-surface-100 rounded skeleton-pulse" />
                    </div>
                ))}
            </div>
        )
    }
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className={`h-3 bg-surface-200 rounded-lg skeleton-pulse`} style={{ width: `${85 - i * 15}%` }} />
            ))}
        </div>
    )
}
