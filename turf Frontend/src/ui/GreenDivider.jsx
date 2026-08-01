export default function GreenDivider({ className = '' }) {
    return (
        <div className={`flex items-center justify-center my-2 ${className}`}>
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
        </div>
    )
}
