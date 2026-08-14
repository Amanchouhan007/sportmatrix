const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold',
    neon: 'bg-emerald-100 text-[#065F46] font-black border border-emerald-300',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
    info: 'bg-sky-50 text-sky-800 border border-sky-200 font-semibold',
}

export default function Badge({ children, variant = 'default', className = '', dot }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium ${variants[variant]} ${className}`}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' ? 'bg-emerald-500' : variant === 'danger' ? 'bg-danger-500' : variant === 'warning' ? 'bg-warning-500' : 'bg-surface-400'}`} />}
            {children}
        </span>
    )
}

