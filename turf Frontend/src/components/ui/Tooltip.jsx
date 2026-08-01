export default function Tooltip({ children, text }) {
    return (
        <div className="relative group inline-block">
            {children}
            <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium text-white bg-surface-800 rounded-lg whitespace-nowrap z-50 shadow-lg">
                {text}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-surface-800" />
            </div>
        </div>
    )
}
