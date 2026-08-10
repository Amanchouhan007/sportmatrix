export default function Select({ label, id, options = [], value, onChange, error, className = '', placeholder, children }) {
    return (
        <div className={className}>
            {label && <label htmlFor={id} className="block text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-1.5">{label}</label>}
            <div className="relative">
                <select
                    id={id}
                    value={value}
                    onChange={onChange}
                    className={`w-full px-4 py-2.5 pr-10 rounded-xl border ${error ? 'border-red-500' : 'border-[#E5E7EB] hover:border-[#16A34A] focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20'} bg-white text-[#111827] font-bold text-sm outline-none transition-all duration-200 cursor-pointer appearance-none shadow-xs`}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {children ? children : options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#6B7280]">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                </div>
            </div>
            {error && <p className="text-red-500 text-xs mt-1 font-semibold">{error}</p>}
        </div>
    )
}
