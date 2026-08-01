export default function KPIWidget({ label, value, icon, trend, change, chart, className = '' }) {
    return (
        <div className={`bg-white rounded-2xl border border-surface-200 shadow-soft p-5 flex items-start justify-between ${className}`}>
            <div className="space-y-1">
                <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-surface-900">{value}</p>
                {change && (
                    <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${trend === 'up' ? 'bg-accent-50 text-accent-600' : 'bg-red-50 text-danger-500'}`}>
                        {trend === 'up' ? '↑' : '↓'} {change}
                    </div>
                )}
            </div>
            <div className="flex flex-col items-end gap-2">
                {icon && <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">{icon}</div>}
                {chart}
            </div>
        </div>
    )
}
