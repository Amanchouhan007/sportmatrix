import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'

export default function CustomDatePicker({ value, onChange, placeholder = 'Select date', label, align = 'right', className = '' }) {
    const [isOpen, setIsOpen] = useState(false)
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, positionAbove: false })
    const containerRef = useRef(null)
    const buttonRef = useRef(null)

    // Current displayed month & year in calendar popup
    const initialDate = value ? new Date(value) : new Date()
    const [viewDate, setViewDate] = useState(initialDate)

    useEffect(() => {
        if (value) {
            const d = new Date(value)
            if (!isNaN(d.getTime())) {
                setViewDate(d)
            }
        }
    }, [value])

    useEffect(() => {
        const updateCoords = () => {
            if (isOpen && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect()
                const spaceBelow = window.innerHeight - rect.bottom
                const positionAbove = spaceBelow < 300 && rect.top > 300
                setCoords({
                    top: positionAbove ? rect.top : rect.bottom,
                    left: align === 'right' ? Math.max(10, rect.right - 260) : rect.left,
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
    }, [isOpen, align])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target) &&
                !e.target.closest('.custom-datepicker-portal')
            ) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfWeek = new Date(year, month, 1).getDay()

    const handlePrevMonth = () => {
        setViewDate(new Date(year, month - 1, 1))
    }

    const handleNextMonth = () => {
        setViewDate(new Date(year, month + 1, 1))
    }

    const handleSelectDay = (day) => {
        const formattedMonth = String(month + 1).padStart(2, '0')
        const formattedDay = String(day).padStart(2, '0')
        const dateStr = `${year}-${formattedMonth}-${formattedDay}`
        onChange(dateStr)
        setIsOpen(false)
    }

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return placeholder
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return dateStr
        return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const getLocalDateStr = (d) => {
        if (!d || isNaN(d.getTime())) return ''
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    const selectedDateStr = value ? getLocalDateStr(new Date(value)) : ''
    const todayStr = getLocalDateStr(new Date())

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{label}</label>}
            
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`h-[42px] px-3.5 rounded-xl border ${
                    isOpen ? 'border-[#16A34A] ring-2 ring-[#16A34A]/20 bg-white' : 'border-slate-200 bg-[#FAFBFC] hover:bg-white hover:border-[#16A34A]'
                } text-xs font-bold text-slate-800 transition-all flex items-center gap-2 cursor-pointer shadow-2xs`}
            >
                <FiCalendar className={`w-4 h-4 ${value ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                <span className={value ? 'text-slate-900 font-bold' : 'text-slate-400'}>
                    {formatDisplayDate(value)}
                </span>
                {value && (
                    <span
                        onClick={(e) => {
                            e.stopPropagation()
                            onChange('')
                        }}
                        className="ml-1 text-slate-400 hover:text-rose-500 p-0.5 rounded-full hover:bg-rose-50 cursor-pointer"
                    >
                        <FiX className="w-3.5 h-3.5" />
                    </span>
                )}
            </button>

            {isOpen && createPortal(
                <div
                    className="custom-datepicker-portal fixed z-[999999] w-64 max-w-[90vw] bg-white border border-slate-200/90 rounded-2xl shadow-[0_20px_45px_rgba(0,0,0,0.18)] p-3.5 animate-in fade-in zoom-in-95 duration-150"
                    style={{
                        top: coords.positionAbove ? 'auto' : `${coords.top + 6}px`,
                        bottom: coords.positionAbove ? `${window.innerHeight - coords.top + 6}px` : 'auto',
                        left: `${coords.left}px`
                    }}
                >
                    {/* Month / Year Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                        <button type="button" onClick={handlePrevMonth} className="p-1.5 rounded-xl text-slate-500 hover:bg-emerald-50 hover:text-[#16A34A] transition-colors cursor-pointer">
                            <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                            {monthNames[month]} {year}
                        </span>
                        <button type="button" onClick={handleNextMonth} className="p-1.5 rounded-xl text-slate-500 hover:bg-emerald-50 hover:text-[#16A34A] transition-colors cursor-pointer">
                            <FiChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 text-center mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                            <span key={d} className="text-[10px] font-black text-[#16A34A] uppercase tracking-wider">{d}</span>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {/* Empty padding cells for first week */}
                        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-8" />
                        ))}

                        {/* Day numbers */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNum = i + 1
                            const formattedMonth = String(month + 1).padStart(2, '0')
                            const formattedDay = String(dayNum).padStart(2, '0')
                            const currentCellDateStr = `${year}-${formattedMonth}-${formattedDay}`

                            const isSelected = selectedDateStr === currentCellDateStr
                            const isToday = todayStr === currentCellDateStr

                            return (
                                <button
                                    key={dayNum}
                                    type="button"
                                    onClick={() => handleSelectDay(dayNum)}
                                    className={`h-8 w-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center mx-auto cursor-pointer ${
                                        isSelected
                                            ? 'bg-[#16A34A] text-white font-black shadow-md ring-2 ring-[#16A34A]/30 scale-105'
                                            : isToday
                                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                                            : 'text-slate-700 hover:bg-emerald-50 hover:text-[#16A34A]'
                                    }`}
                                >
                                    {dayNum}
                                </button>
                            )
                        })}
                    </div>

                    {/* Footer Quick Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3 text-[11px]">
                        <button
                            type="button"
                            onClick={() => {
                                onChange('')
                                setIsOpen(false)
                            }}
                            className="text-slate-400 hover:text-slate-700 font-bold transition-colors cursor-pointer"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onChange(todayStr)
                                setIsOpen(false)
                            }}
                            className="text-[#16A34A] hover:underline font-black cursor-pointer uppercase tracking-wider text-[10px]"
                        >
                            ● Today
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
