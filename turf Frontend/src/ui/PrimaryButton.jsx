export default function PrimaryButton({ children, onClick, className = '' }) {
    return (
        <button
            onClick={onClick}
            className={`bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 cursor-pointer ${className}`}
        >
            {children}
        </button>
    )
}
