export default function SecondaryButton({ children, onClick, className = '' }) {
    return (
        <button
            onClick={onClick}
            className={`bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 cursor-pointer ${className}`}
        >
            {children}
        </button>
    )
}
