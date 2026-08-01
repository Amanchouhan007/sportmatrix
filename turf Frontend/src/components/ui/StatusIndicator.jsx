export default function StatusIndicator({ status = 'active', label }) {
    const colors = {
        active: 'bg-accent-500', inactive: 'bg-surface-300', pending: 'bg-warning-500', error: 'bg-danger-500',
    }
    return (
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${colors[status] || colors.active}`} />
            {label && <span className="text-sm text-surface-600">{label}</span>}
        </div>
    )
}
