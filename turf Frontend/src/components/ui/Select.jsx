import { useState, useRef, useEffect, Children } from 'react'
import { createPortal } from 'react-dom'
import { HiChevronDown, HiCheck } from 'react-icons/hi'

export default function Select({
    label,
    id,
    options = [],
    value,
    onChange,
    error,
    className = '',
    placeholder = 'Select option',
    children,
    disabled = false
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, positionAbove: false })
    const containerRef = useRef(null)
    const buttonRef = useRef(null)

    // Calculate dynamic coordinates when open or on scroll/resize
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

    // Close dropdown when clicking outside
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

    // Parse options from either `options` prop or `<option>` JSX children
    const parsedOptions = (options && options.length > 0)
        ? options.map(opt => {
            if (typeof opt === 'object' && opt !== null) {
                return {
                    value: opt.value !== undefined ? opt.value : (opt.id ?? opt.label ?? opt.name),
                    label: opt.label !== undefined ? opt.label : (opt.name ?? opt.value ?? String(opt))
                }
            }
            return { value: opt, label: String(opt) }
        })
        : Children.toArray(children)
            .map(child => {
                if (!child) return null
                if (typeof child === 'string' || typeof child === 'number') {
                    return { value: child, label: String(child) }
                }
                const val = child.props?.value !== undefined ? child.props.value : child.props?.children
                const lbl = child.props?.children !== undefined ? child.props.children : val
                return {
                    value: val,
                    label: lbl
                }
            })
            .filter(Boolean)

    // Currently selected option object
    const selectedOpt = parsedOptions.find(o => String(o.value) === String(value)) || (value ? { value, label: value } : parsedOptions[0])

    const handleSelect = (optValue) => {
        if (disabled) return
        setIsOpen(false)
        if (onChange) {
            const syntheticEvent = {
                target: { value: optValue, id, name: id },
                preventDefault: () => {},
                stopPropagation: () => {}
            }
            onChange(syntheticEvent)
        }
    }

    return (
        <div ref={containerRef} className={`relative w-full text-left ${className}`}>
            {label && (
                <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    {label}
                </label>
            )}

            <button
                ref={buttonRef}
                type="button"
                id={id}
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-[42px] bg-white border ${
                    isOpen
                        ? 'border-[#16A34A] ring-2 ring-[#16A34A]/20 shadow-md'
                        : error
                        ? 'border-rose-500 text-rose-600'
                        : 'border-slate-200 hover:border-[#16A34A] hover:bg-slate-50/60'
                } rounded-2xl px-4 py-2 text-xs font-black text-slate-900 flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer shadow-xs ${
                    disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
                }`}
            >
                <span className="truncate">
                    {selectedOpt ? selectedOpt.label : (placeholder || 'Select...')}
                </span>
                <HiChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#16A34A]' : ''
                    }`}
                />
            </button>

            {isOpen && !disabled && createPortal(
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
                    {parsedOptions.length === 0 ? (
                        <div className="px-3 py-2.5 text-xs font-bold text-slate-400 text-center">No options available</div>
                    ) : (
                        parsedOptions.map((opt, idx) => {
                            const isSelected = String(opt.value) === String(value)
                            return (
                                <button
                                    key={opt.value ?? idx}
                                    type="button"
                                    onClick={() => handleSelect(opt.value)}
                                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer text-left ${
                                        isSelected
                                            ? 'bg-[#16A34A] text-white font-black shadow-xs'
                                            : 'text-slate-800 hover:bg-emerald-50/70 hover:text-[#065F46]'
                                    }`}
                                >
                                    <span className="truncate">{opt.label}</span>
                                    {isSelected && <HiCheck className="w-4 h-4 text-white shrink-0" />}
                                </button>
                            )
                        })
                    )}
                </div>,
                document.body
            )}

            {error && <p className="text-rose-500 text-[11px] mt-1 font-bold">{error}</p>}
        </div>
    )
}

