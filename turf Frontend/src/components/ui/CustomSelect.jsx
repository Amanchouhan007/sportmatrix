import { useState, useRef, useEffect } from 'react'
import { HiChevronDown, HiCheck } from 'react-icons/hi'

export default function CustomSelect({ label, value, onChange, options = [], className = '' }) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedOpt = options.find(o => o.value === value || o.label === value) || options[0]

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {label && (
                <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest mb-1.5 block">
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white border ${isOpen ? 'border-[#16A34A] ring-2 ring-[#16A34A]/20' : 'border-[#E5E7EB] hover:border-[#16A34A]'} rounded-xl px-4 py-2.5 text-sm text-[#111827] font-bold flex items-center justify-between transition-all duration-200 cursor-pointer shadow-xs`}
            >
                <div className="flex items-center gap-2.5">
                    {selectedOpt?.color && (
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs shrink-0" style={{ backgroundColor: selectedOpt.color }} />
                    )}
                    <span>{selectedOpt?.label || value}</span>
                </div>
                <HiChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#16A34A]' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white/95 backdrop-blur-xl border border-[#E5E7EB] rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.12)] p-1.5 max-h-60 overflow-y-auto space-y-1 fade-in">
                    {options.map((opt) => {
                        const optValue = opt.value ?? opt.label ?? opt
                        const optLabel = opt.label ?? opt.value ?? opt
                        const isSelected = optValue === value
                        return (
                            <button
                                key={optValue}
                                type="button"
                                onClick={() => {
                                    onChange(optValue)
                                    setIsOpen(false)
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                                    isSelected
                                        ? 'bg-green-50 text-[#16A34A] border border-green-200 font-black'
                                        : 'text-[#111827] hover:bg-[#F7F9FC] hover:text-[#16A34A]'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    {opt.color && (
                                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs shrink-0" style={{ backgroundColor: opt.color }} />
                                    )}
                                    <span>{optLabel}</span>
                                </div>
                                {isSelected && <HiCheck className="w-4 h-4 text-[#16A34A]" />}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
