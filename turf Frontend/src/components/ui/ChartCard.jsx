export default function ChartCard({ title, subtitle, children, action, className = '' }) {
    return (
        <div className={`bg-white rounded-2xl border border-surface-200 shadow-soft ${className}`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
                <div>
                    <h3 className="text-sm font-semibold text-surface-900">{title}</h3>
                    {subtitle && <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>}
                </div>
                {action}
            </div>
            <div className="px-6 py-4">{children}</div>
        </div>
    )
}
