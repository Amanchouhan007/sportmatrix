export default function IconBox({ children, className = '' }) {
    return (
        <div
            className={`w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl mb-4 ${className}`}
        >
            {children}
        </div>
    )
}
