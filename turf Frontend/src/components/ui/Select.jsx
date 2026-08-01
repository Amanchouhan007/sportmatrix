export default function Select({ label, id, options = [], value, onChange, error, className = '', placeholder }) {
    return (
        <div className={className}>
            {label && <label htmlFor={id} className="block text-sm font-medium text-surface-700 mb-1.5">{label}</label>}
            <div className="relative">
                <select
                    id={id}
                    value={value}
                    onChange={onChange}
                    className={`w-full px-4 py-2.5 pr-10 rounded-xl border ${error ? 'border-danger-500' : 'border-surface-200 focus:border-primary-500'} bg-white text-surface-900 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer appearance-none`}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-surface-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2005/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                </div>
            </div>
            {error && <p className="text-danger-500 text-xs mt-1">{error}</p>}
        </div>
    )
}
