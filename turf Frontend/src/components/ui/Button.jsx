const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft-md hover:shadow-soft-lg active:scale-[0.98]',
    neon: 'bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black border border-[#B5F000] shadow-[0_4px_16px_rgba(200,255,46,0.35)] hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 active:scale-[0.98]',
    outline: 'bg-white hover:bg-emerald-600 text-emerald-600 hover:text-white font-bold border-2 border-emerald-500/90 hover:border-emerald-600 shadow-2xs active:scale-[0.98]',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-soft-md active:scale-[0.98]',
    accent: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-soft-md active:scale-[0.98]',
}

const sizes = {
    xs: 'p-[3px] text-xs',
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-3.5 text-base',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', onClick, disabled, type = 'button', fullWidth }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        >
            {children}
        </button>
    )
}
