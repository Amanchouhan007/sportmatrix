export default function SectionLabel({ children, className = '' }) {
    return (
        <span
            className={`uppercase tracking-wider text-emerald-400 text-xs font-semibold inline-block mb-4 ${className}`}
        >
            {children}
        </span>
    )
}
