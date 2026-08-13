import { useState, useRef, useEffect, useCallback } from 'react'
import { IoRefreshOutline, IoLocationOutline, IoCalendarOutline, IoTimeOutline, IoTrophyOutline, IoPeopleOutline, IoSearch, IoFootball, IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { GiCricketBat } from 'react-icons/gi'

/* ── Location Data (Indore Areas Priority) ── */
const allLocations = [
    'Vijay Nagar, Indore',
    'Palasia, Indore',
    'Bhawarkua, Indore',
    'LIG Colony, Indore',
    'Navlakha, Indore',
    'Annapurna, Indore',
    'Super Corridor, Indore',
    'Rau, Indore',
    'Bypass, Indore',
    'Rajwada, Indore',
    'Indore (All Venues)',
    'Mumbai',
    'Bangalore',
    'Delhi',
    'Pune',
]

/* ── Sports Data ── */
const sportsOptions = [
    { name: 'Football', icon: IoFootball },
    { name: 'Cricket', icon: GiCricketBat },
]

/* ── Time Slots (6:00 AM to 11:00 PM Operating Hours) ── */
const timeBands = [
    { label: 'Morning', range: '06:00 AM – 12:00 PM', value: 'morning', icon: '🌅' },
    { label: 'Afternoon', range: '12:00 PM – 04:00 PM', value: 'afternoon', icon: '☀️' },
    { label: 'Evening', range: '04:00 PM – 08:00 PM', value: 'evening', icon: '🌆' },
    { label: 'Night (Lights)', range: '08:00 PM – 11:00 PM', value: 'night', icon: '🌙' },
]

const hourlySlots = [
    '06:00 AM - 07:00 AM',
    '07:00 AM - 08:00 AM',
    '08:00 AM - 09:00 AM',
    '09:00 AM - 10:00 AM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
    '07:00 PM - 08:00 PM',
    '08:00 PM - 09:00 PM',
    '09:00 PM - 10:00 PM',
    '10:00 PM - 11:00 PM',
]

function formatTimeDisplay(val) {
    if (!val) return 'Any Time'
    const foundBand = timeBands.find(b => b.value === val)
    if (foundBand) return `${foundBand.icon} ${foundBand.label}`
    return `${val}`
}

/* ── Helper: Format date ── */
function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function getDateString(daysFromNow) {
    const d = new Date()
    d.setDate(d.getDate() + daysFromNow)
    return d.toISOString().split('T')[0]
}

function getWeekendDate() {
    const d = new Date()
    const day = d.getDay()
    const daysUntilSat = day === 0 ? 6 : (6 - day)
    d.setDate(d.getDate() + daysUntilSat)
    return d.toISOString().split('T')[0]
}

/* ── Custom Sports Calendar Component ── */
function CustomCalendarWidget({ selectedDate, onSelectDate }) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : today
    const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1))

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const prevMonth = () => {
        setViewDate(new Date(year, month - 1, 1))
    }

    const nextMonth = () => {
        setViewDate(new Date(year, month + 1, 1))
    }

    const todayStr = getDateString(0)

    return (
        <div className="w-full select-none pt-0.5">
            {/* Header: Month Year + Prev / Next */}
            <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#111827]">
                    {monthNames[month]} {year}
                </span>
                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        onClick={prevMonth}
                        className="p-0.5 rounded-full hover:bg-slate-100 text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer"
                    >
                        <IoChevronBack className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={nextMonth}
                        className="p-0.5 rounded-full hover:bg-slate-100 text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer"
                    >
                        <IoChevronForward className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Days Grid Header */}
            <div className="grid grid-cols-7 text-center mb-1">
                {dayLabels.map((day) => (
                    <span key={day} className="text-[9px] font-black uppercase tracking-wider text-[#6B7280]">
                        {day}
                    </span>
                ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-0.5 text-center">
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-6.5 w-6.5" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1
                    const dateObj = new Date(year, month, dayNum)
                    dateObj.setHours(0, 0, 0, 0)

                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                    const isSelected = selectedDate === dateStr
                    const isToday = todayStr === dateStr
                    const isPast = dateObj < today

                    return (
                        <button
                            key={dayNum}
                            type="button"
                            disabled={isPast}
                            onClick={() => onSelectDate(dateStr)}
                            className={`h-6.5 w-6.5 mx-auto rounded-full flex items-center justify-center text-[10.5px] font-bold transition-all cursor-pointer ${
                                isPast
                                    ? 'opacity-30 cursor-not-allowed text-[#9CA3AF]'
                                    : isSelected
                                        ? 'bg-[#C8FF2E] text-[#111827] font-black border border-[#B5F000] shadow-[0_2px_8px_rgba(200,255,46,0.4)] scale-105'
                                        : isToday
                                            ? 'border border-[#16A34A] text-[#16A34A] hover:bg-green-50'
                                            : 'hover:bg-slate-100 text-[#111827]'
                            }`}
                        >
                            {dayNum}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default function TurfSearchBar({ onSearch, values, onChange, onClear }) {
    const { location = '', sport = '', date = '', time = '', players = 10 } = values || {}

    /* ── Location Autocomplete State ── */
    const [locInput, setLocInput] = useState(location)
    const [locOpen, setLocOpen] = useState(false)
    const [locHighlight, setLocHighlight] = useState(-1)
    const locRef = useRef(null)
    const locInputRef = useRef(null)

    /* ── Date Picker State ── */
    const [dateOpen, setDateOpen] = useState(false)
    const dateRef = useRef(null)

    /* ── Time Picker State ── */
    const [timeOpen, setTimeOpen] = useState(false)
    const timeRef = useRef(null)

    /* ── Players Selection State ── */
    const [playersOpen, setPlayersOpen] = useState(false)
    const playersRef = useRef(null)

    /* Sync external location value */
    useEffect(() => { setLocInput(location) }, [location])

    /* Close dropdowns on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (locRef.current && !locRef.current.contains(e.target)) setLocOpen(false)
            if (dateRef.current && !dateRef.current.contains(e.target)) setDateOpen(false)
            if (timeRef.current && !timeRef.current.contains(e.target)) setTimeOpen(false)
            if (playersRef.current && !playersRef.current.contains(e.target)) setPlayersOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    /* ── Current Location GPS State ── */
    const [isLocating, setIsLocating] = useState(false)

    const handleUseCurrentLocation = (e) => {
        e?.stopPropagation?.()
        if (navigator.geolocation) {
            setIsLocating(true)
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setIsLocating(false)
                    setLocInput('Near Me (Current Location)')
                    setLocOpen(false)
                    emit('location', 'Near Me (Current Location)', true, {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    })
                },
                (err) => {
                    setIsLocating(false)
                    setLocInput('Indore')
                    setLocOpen(false)
                    emit('location', 'Indore')
                },
                { timeout: 8000 }
            )
        }
    }

    /* ── Filtered location suggestions ── */
    const filteredLocations = locInput.trim()
        ? allLocations.filter(l => l.toLowerCase().includes(locInput.toLowerCase())).slice(0, 10)
        : allLocations.slice(0, 10)

    /* ── Emit changes ── */
    const emit = useCallback((field, val, triggerSearch = true, extraCoords = null) => {
        const next = { location, sport, date, time, players, [field]: val }
        if (extraCoords) {
            next.coords = extraCoords
        }
        onChange?.(next)
        if (triggerSearch) {
            onSearch?.(next)
        }
    }, [location, sport, date, time, players, onChange, onSearch])

    /* ── Handlers ── */
    const handleLocKeyDown = (e) => {
        if (!locOpen) return
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setLocHighlight(p => Math.min(p + 1, filteredLocations.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setLocHighlight(p => Math.max(p - 1, 0))
        } else if (e.key === 'Enter' && locHighlight >= 0) {
            e.preventDefault()
            const selected = filteredLocations[locHighlight]
            setLocInput(selected)
            setLocOpen(false)
            emit('location', selected)
        } else if (e.key === 'Escape') {
            setLocOpen(false)
        }
    }

    const selectLocation = (loc) => {
        setLocInput(loc)
        setLocOpen(false)
        emit('location', loc)
    }

    const selectDate = (d) => {
        setDateOpen(false)
        emit('date', d)
    }

    const selectTime = (t) => {
        setTimeOpen(false)
        emit('time', time === t ? '' : t)
    }

    const todayStr = getDateString(0)

    return (
        <div className="w-full max-w-[880px] mx-auto relative z-40 select-none">
            <div 
                style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(95, 210, 120, 0.12)',
                    boxShadow: '0 20px 45px rgba(20, 80, 20, 0.08)'
                }}
                className="relative rounded-[16px] lg:rounded-full p-1 flex flex-col lg:flex-row items-stretch justify-between lg:h-[60px] gap-1.5 lg:gap-0 transition-all duration-300 hover:border-[#16A34A]/40 focus-within:border-[#16A34A]"
            >
                
                {/* 1. CITY */}
                <div ref={locRef} className="flex-1 min-w-0 relative group/sec border-b border-[#E5E7EB] lg:border-b-0 lg:border-r lg:border-[#E5E7EB]">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-4 py-1.5 flex items-center justify-between hover:bg-slate-50 rounded-[12px] lg:rounded-full lg:rounded-r-none"
                        onClick={() => { setLocOpen(true); setTimeout(() => locInputRef.current?.focus(), 50) }}
                    >
                        <div className="flex gap-3 items-center">
                            <IoLocationOutline className="text-[#16A34A] w-5 h-5 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-[#111827] tracking-wide uppercase">City / Area</span>
                                {locOpen ? (
                                    <input
                                        ref={locInputRef}
                                        type="text"
                                        className="text-[11px] text-[#111827] bg-transparent outline-none w-[130px] placeholder:text-[#6B7280] font-semibold p-0 m-0 border-none h-4"
                                        placeholder="Type Area / City..."
                                        value={locInput}
                                        onChange={(e) => { setLocInput(e.target.value); setLocOpen(true); setLocHighlight(-1); emit('location', e.target.value, false) }}
                                        onFocus={() => setLocOpen(true)}
                                        onKeyDown={handleLocKeyDown}
                                    />
                                ) : (
                                    <span className="text-[11px] font-semibold text-[#6B7280] truncate max-w-[130px]">
                                        {location || 'Select City / Area'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {locOpen && (
                        <div className="absolute top-full left-0 w-full md:w-[290px] bg-white border border-[#E2E8F0] text-[#111827] rounded-[22px] mt-2 p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.18)] z-[99999] max-h-80 overflow-y-auto custom-scrollbar">
                            {/* Live GPS Near Me Button */}
                            <button
                                type="button"
                                onClick={handleUseCurrentLocation}
                                className="w-full mb-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border border-emerald-200 text-[#065F46] font-black text-xs flex items-center justify-between transition-all cursor-pointer shadow-xs group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-lg bg-[#10B981] text-white flex items-center justify-center text-xs shadow-xs group-hover:scale-110 transition-transform shrink-0">
                                        📍
                                    </span>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[11px] font-black text-[#065F46]">Use Current Location</span>
                                        <span className="text-[9px] font-semibold text-emerald-600">Find nearest turfs near me (GPS)</span>
                                    </div>
                                </div>
                                {isLocating ? (
                                    <span className="text-[10px] font-bold text-emerald-700 animate-pulse">Detecting...</span>
                                ) : (
                                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">GPS ➔</span>
                                )}
                            </button>

                            <div className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between border-b border-slate-100 mb-1">
                                <span>SELECT CITY / AREA</span>
                                <span className="text-[9px] bg-emerald-100 text-[#065F46] font-bold px-2 py-0.5 rounded-full">{filteredLocations.length} Available</span>
                            </div>
                            {filteredLocations.length === 0 ? (
                                <div className="p-3 text-center text-slate-400 text-xs font-semibold">No locations found</div>
                            ) : (
                                filteredLocations.map((loc, i) => {
                                    const isSel = location && loc.toLowerCase().includes(location.toLowerCase())
                                    const isHighlighted = i === locHighlight
                                    return (
                                        <div
                                            key={loc}
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 group ${
                                                isSel
                                                    ? 'bg-[#ECFDF5] border-l-4 border-[#10B981] text-[#065F46] font-black shadow-xs'
                                                    : isHighlighted
                                                    ? 'bg-slate-50 text-[#111827] font-bold'
                                                    : 'text-[#374151] font-semibold hover:bg-slate-50 hover:text-[#10B981]'
                                            }`}
                                            onClick={() => selectLocation(loc)}
                                            onMouseEnter={() => setLocHighlight(i)}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 transition-colors ${
                                                    isSel
                                                        ? 'bg-[#10B981] text-white shadow-xs'
                                                        : 'bg-emerald-50 text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white'
                                                }`}>
                                                    <IoLocationOutline className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs truncate">{loc}</span>
                                            </div>

                                            {isSel && (
                                                <span className="w-4 h-4 rounded-full bg-[#10B981] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}
                </div>
                
                {/* 2. DATE */}
                <div ref={dateRef} className="flex-1 min-w-0 relative group/sec border-b border-[#E5E7EB] lg:border-b-0 lg:border-r lg:border-[#E5E7EB]">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-4 py-1.5 flex items-center justify-between hover:bg-slate-50 rounded-[12px] lg:rounded-none"
                        onClick={() => setDateOpen(!dateOpen)}
                    >
                        <div className="flex gap-3 items-center">
                            <IoCalendarOutline className="text-[#16A34A] w-5 h-5 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-[#111827] tracking-wide uppercase">Date</span>
                                <span className="text-[11px] font-semibold text-[#6B7280] truncate max-w-[110px]">
                                    {date ? formatDate(date) : 'Select Date'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {dateOpen && (
                        <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 w-[265px] bg-white border border-[#E5E7EB] p-3.5 rounded-[22px] mt-2 shadow-[0_20px_50px_rgba(0,0,0,0.18)] z-[99999]">
                            {/* Quick Presets Bar */}
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#6B7280] block mb-2">Select Date</span>
                            <div className="flex gap-1.5 mb-2.5 flex-wrap">
                                {[{ l: 'Today', v: getDateString(0) }, { l: 'Tomorrow', v: getDateString(1) }, { l: 'Weekend', v: getWeekendDate() }].map(opt => (
                                    <button
                                        key={opt.l}
                                        type="button"
                                        className={`px-3 py-1 rounded-full text-[10px] font-black transition-all border shadow-xs cursor-pointer ${
                                            date === opt.v
                                                ? 'bg-[#C8FF2E] text-[#111827] border-[#B5F000] shadow-[0_2px_8px_rgba(200,255,46,0.35)]'
                                                : 'bg-white hover:bg-[#C8FF2E] text-[#111827] border-[#E5E7EB] hover:border-[#B5F000]'
                                        }`}
                                        onClick={() => selectDate(opt.v)}
                                    >
                                        {opt.l}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Custom Modern Sports Calendar Widget */}
                            <div className="pt-2 border-t border-[#E5E7EB]">
                                <CustomCalendarWidget selectedDate={date} onSelectDate={selectDate} />
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. TIME */}
                <div ref={timeRef} className="flex-1 min-w-0 relative group/sec">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-4 py-1.5 flex items-center justify-between hover:bg-slate-50 rounded-[12px] lg:rounded-full lg:rounded-l-none"
                        onClick={() => setTimeOpen(!timeOpen)}
                    >
                        <div className="flex gap-3 items-center">
                            <IoTimeOutline className="text-[#16A34A] w-5 h-5 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-[#111827] tracking-wide uppercase">Time Slot</span>
                                <span className="text-[11px] font-semibold text-[#6B7280] truncate max-w-[130px]" title={time || 'Any Time'}>
                                    {formatTimeDisplay(time)}
                                </span>
                            </div>
                        </div>
                    </div>
                    {timeOpen && (
                        <div className="absolute top-full right-0 w-[300px] bg-white border border-[#E5E7EB] p-3.5 rounded-[22px] mt-2 shadow-[0_20px_50px_rgba(0,0,0,0.18)] z-[99999] max-h-96 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between mb-2.5 px-1 border-b border-slate-100 pb-1.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#6B7280]">Select Time Slot</span>
                                {time && (
                                    <button
                                        type="button"
                                        onClick={() => selectTime('')}
                                        className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                                    >
                                        Clear (Any Time)
                                    </button>
                                )}
                            </div>

                            {/* 1. Quick Time Bands */}
                            <div className="grid grid-cols-2 gap-1.5 mb-3">
                                {timeBands.map(t => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        className={`flex flex-col items-start p-2 rounded-xl transition-all border shadow-xs text-left cursor-pointer ${
                                            time === t.value
                                                ? 'bg-[#C8FF2E] text-[#111827] border-[#B5F000] shadow-[0_4px_12px_rgba(200,255,46,0.35)]'
                                                : 'bg-white hover:bg-[#C8FF2E]/30 text-[#111827] border-[#E5E7EB] hover:border-[#B5F000]'
                                        }`}
                                        onClick={() => selectTime(t.value)}
                                    >
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span>{t.icon}</span>
                                            <span className="text-[11px] font-bold">{t.label}</span>
                                        </div>
                                        <span className="text-[9px] text-[#6B7280] font-semibold">{t.range}</span>
                                    </button>
                                ))}
                            </div>

                            {/* 2. Exact Hourly Match Slots */}
                            <div className="border-t border-[#E5E7EB] pt-2">
                                <span className="text-[9px] font-black uppercase tracking-wider text-[#6B7280] block mb-2 px-1">
                                    OR PICK EXACT 1-HOUR SLOT
                                </span>
                                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-0.5 custom-scrollbar">
                                    {hourlySlots.map(slot => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => selectTime(slot)}
                                            className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border shadow-xs text-center cursor-pointer ${
                                                time === slot
                                                    ? 'bg-[#10B981] text-white border-[#059669] shadow-xs'
                                                    : 'bg-slate-50 hover:bg-emerald-50 text-[#374151] hover:text-[#065F46] border-[#E5E7EB] hover:border-emerald-300'
                                            }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* SEARCH BUTTON */}
                <div className="flex items-center shrink-0 justify-center h-full pl-1.5 pr-0.5 py-0.5 mt-1 lg:mt-0">
                    <button
                        onClick={() => onSearch?.({ location, sport, date, time, players })}
                        className="w-full lg:w-auto h-full px-6 py-2 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black rounded-full transition-all shadow-[0_6px_18px_rgba(200,255,46,0.35)] hover:shadow-[0_8px_22px_rgba(200,255,46,0.5)] hover:scale-[1.04] active:scale-95 flex items-center justify-center cursor-pointer min-h-[44px] lg:min-h-full border border-[#B5F000]"
                    >
                        <span className="text-[12px] font-black uppercase tracking-wider">SEARCH</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
