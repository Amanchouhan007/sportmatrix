import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

export default function Input({ label, id, type = 'text', placeholder, value, onChange, error, className = '', ...props }) {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
        <div className={className}>
            {label && <label htmlFor={id} className="block text-sm font-medium text-surface-700 mb-1.5">{label}</label>}
            <div className="relative">
                <input
                    id={id}
                    type={inputType}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`w-full px-4 py-2.5 rounded-xl border ${error ? 'border-danger-500 focus:ring-danger-500' : 'border-surface-200 focus:ring-primary-500 focus:border-primary-500'} bg-white text-surface-900 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-0 placeholder:text-surface-400 ${isPassword ? 'pr-11' : ''}`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-surface-400 hover:text-surface-600 transition-colors duration-150 cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                )}
            </div>
            {error && <p className="text-danger-500 text-xs mt-1">{error}</p>}
        </div>
    )
}
