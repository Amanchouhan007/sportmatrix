import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

export default function Input({ label, id, type = 'text', placeholder, value, onChange, error, className = '', ...props }) {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-2.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={id}
                    type={inputType}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`w-full h-[56px] px-4.5 py-3.5 rounded-2xl border ${
                        error 
                            ? 'border-red-500 focus:ring-red-500/20' 
                            : 'border-[#E5E7EB] hover:border-green-400 focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20'
                    } bg-[#FAFBFC] focus:bg-white text-slate-900 text-sm font-medium outline-none transition-all duration-300 placeholder:text-slate-400 ${
                        isPassword ? 'pr-12' : ''
                    }`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-[#16A34A] hover:bg-emerald-50 transition-all cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1 font-semibold">{error}</p>}
        </div>
    )
}
