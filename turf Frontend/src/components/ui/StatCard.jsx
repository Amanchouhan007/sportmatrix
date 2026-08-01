export default function StatCard({ label, value, change, icon, trend = 'up', className = '' }) {
    return (
        <div className={`bg-white rounded-2xl border border-surface-200 shadow-soft p-5 ${className}`}>
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-surface-500">{label}</p>
                    <p className="text-2xl font-bold text-surface-900">{value}</p>
                    {change && (
                        <p className={`text-xs font-medium flex items-center gap-1 ${trend === 'up' ? 'text-accent-500' : 'text-danger-500'}`}>
                            {trend === 'up' ? '↑' : '↓'} {change}
                        </p>
                    )}
                </div>
                {icon && <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 text-lg">{icon}</div>}
            </div>
        </div>
    )
}
