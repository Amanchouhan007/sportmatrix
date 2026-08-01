const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-soft-md hover:shadow-soft-lg',
    secondary: 'bg-surface-100 hover:bg-surface-200 text-surface-800 border border-surface-200',
    outline: 'bg-transparent hover:bg-primary-50 text-primary-600 border border-primary-200 hover:border-primary-300',
    danger: 'bg-danger-500 hover:bg-danger-600 text-white shadow-soft-md',
    accent: 'bg-accent-500 hover:bg-accent-600 text-white shadow-soft-md',
}

const sizes = {
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
