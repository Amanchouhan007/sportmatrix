export default function WalletCard({ balance, currency = '₹', locked = 0, className = '' }) {
    return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-soft-lg ${className}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
            <div className="relative z-10">
                <p className="text-sm text-primary-200 mb-1">Available Balance</p>
                <p className="text-3xl font-bold">{currency}{Number(balance).toLocaleString()}</p>
                {locked > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                        <span className="text-sm text-primary-200">Escrow Locked</span>
                        <span className="text-sm font-semibold">{currency}{Number(locked).toLocaleString()}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
