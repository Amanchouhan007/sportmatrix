import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HiChevronDown, HiCheck } from 'react-icons/hi'

export default function CustomSelect({ label, value, onChange, options = [], className = '' }) {
    const [isOpen, setIsOpen] = useState(false)
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, positionAbove: false })
    const containerRef = useRef(null)
    const buttonRef = useRef(null)

    useEffect(() => {
        const updateCoords = () => {
            if (isOpen && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect()
                const spaceBelow = window.innerHeight - rect.bottom
                const positionAbove = spaceBelow < 220 && rect.top > 220
                setCoords({
                    top: positionAbove ? rect.top : rect.bottom,
                    left: rect.left,
                    width: rect.width,
                    positionAbove
                })
            }
        }

        if (isOpen) {
            updateCoords()
            window.addEventListener('scroll', updateCoords, true)
            window.addEventListener('resize', updateCoords)
        }

        return () => {
            window.removeEventListener('scroll', updateCoords, true)
            window.removeEventListener('resize', updateCoords)
        }
    }, [isOpen])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target) &&
                !e.target.closest('.custom-select-portal')
            ) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const selectedOpt = options.find(o => o.value === value || o.label === value) || options[0]

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {label && (
                <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest mb-1.5 block">
                    {label}
                </label>
            )}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-[42px] bg-white border ${
                    isOpen ? 'border-[#16A34A] ring-2 ring-[#16A34A]/20 shadow-md' : 'border-slate-200 hover:border-[#16A34A] hover:bg-slate-50/60'
                } rounded-2xl px-4 py-2 text-xs text-[#111827] font-black flex items-center justify-between transition-all duration-200 cursor-pointer shadow-xs`}
            >
                <div className="flex items-center gap-2.5 truncate">
                    {selectedOpt?.color && (
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs shrink-0" style={{ backgroundColor: selectedOpt.color }} />
                    )}
                    <span className="truncate">{selectedOpt?.label || value}</span>
                </div>
                <HiChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#16A34A]' : ''}`} />
            </button>

            {isOpen && createPortal(
                <div
                    className="custom-select-portal fixed bg-white border border-slate-200/90 rounded-2xl shadow-[0_20px_45px_rgba(0,0,0,0.18)] p-1.5 max-h-60 overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-150 custom-scrollbar"
                    style={{
                        zIndex: 999999,
                        top: coords.positionAbove ? 'auto' : `${coords.top + 6}px`,
                        bottom: coords.positionAbove ? `${window.innerHeight - coords.top + 6}px` : 'auto',
                        left: `${coords.left}px`,
                        width: `${Math.max(coords.width, 160)}px`,
                        minWidth: `${coords.width}px`
                    }}
                >
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
                                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer text-left ${
                                    isSelected
                                        ? 'bg-[#16A34A] text-white font-black shadow-xs'
                                        : 'text-slate-800 hover:bg-emerald-50/70 hover:text-[#065F46]'
                                }`}
                            >
                                <div className="flex items-center gap-2.5 truncate">
                                    {opt.color && (
                                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs shrink-0" style={{ backgroundColor: opt.color }} />
                                    )}
                                    <span className="truncate">{optLabel}</span>
                                </div>
                                {isSelected && <HiCheck className="w-4 h-4 text-white shrink-0" />}
                            </button>
                        )
                    })}
                </div>,
                document.body
            )}
        </div>
    )
}
