export default function GlassCard({ children, className = '', hover = true }) {
    return (
        <div
            className={`bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 ${hover
                    ? 'hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300'
                    : ''
                } ${className}`}
        >
            {children}
        </div>
    )
}
