export default function EmptyState({ icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            {icon && <div className="text-4xl mb-4 text-surface-300">{icon}</div>}
            <h3 className="text-lg font-semibold text-surface-700 mb-1">{title || 'No data found'}</h3>
            {description && <p className="text-sm text-surface-400 max-w-sm mb-6">{description}</p>}
            {action}
        </div>
    )
}
