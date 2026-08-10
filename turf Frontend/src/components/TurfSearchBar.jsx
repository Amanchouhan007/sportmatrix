import { useState, useRef, useEffect, useCallback } from 'react'
import { IoRefreshOutline, IoLocationOutline, IoCalendarOutline, IoTimeOutline, IoTrophyOutline, IoPeopleOutline, IoSearch, IoFootball, IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { GiCricketBat } from 'react-icons/gi'

/* ── Location Data ── */
const locationSuggestions = [
    { city: 'Indore', areas: ['Vijay Nagar', 'Palasia', 'Bypass', 'Bhawarkuan', 'Rajwada'] },
    { city: 'Mumbai', areas: ['Andheri West', 'Bandra', 'Powai', 'Vashi', 'Thane'] },
    { city: 'Delhi', areas: ['Dwarka', 'Saket', 'Connaught Place', 'Rohini', 'Vasant Kunj'] },
    { city: 'Bangalore', areas: ['Koramangala', 'Whitefield', 'Indiranagar', 'HSR Layout', 'Electronic City'] },
    { city: 'Pune', areas: ['Baner', 'Kothrud', 'Hadapsar', 'Hinjewadi', 'Viman Nagar'] },
    { city: 'Hyderabad', areas: ['Madhapur', 'Gachibowli', 'Banjara Hills', 'Jubilee Hills', 'Kukatpally'] },
    { city: 'Chennai', areas: ['Adyar', 'Velachery', 'T. Nagar', 'Anna Nagar', 'OMR'] },
]

const allLocations = locationSuggestions.flatMap(loc => [
    loc.city,
    ...loc.areas.map(area => `${loc.city} ${area}`)
])

/* ── Sports Data ── */
const sportsOptions = [
    { name: 'Football', icon: IoFootball },
    { name: 'Cricket', icon: GiCricketBat },
]

/* ── Time Slots ── */
const timeSlots = [
    { label: 'Morning', range: '6AM–12PM', value: 'morning' },
    { label: 'Afternoon', range: '12PM–4PM', value: 'afternoon' },
    { label: 'Evening', range: '4PM–8PM', value: 'evening' },
    { label: 'Night', range: '8PM–12AM', value: 'night' },
]

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
    
    /* ── Sport Selection State ── */
    const [sportOpen, setSportOpen] = useState(false)
    const sportRef = useRef(null)
    
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
            if (sportRef.current && !sportRef.current.contains(e.target)) setSportOpen(false)
            if (playersRef.current && !playersRef.current.contains(e.target)) setPlayersOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    /* ── Filtered location suggestions ── */
    const filteredLocations = locInput.trim()
        ? allLocations.filter(l => l.toLowerCase().includes(locInput.toLowerCase())).slice(0, 8)
        : allLocations.slice(0, 8)

    /* ── Emit changes ── */
    const emit = useCallback((field, val, triggerSearch = true) => {
        const next = { location, sport, date, time, players, [field]: val }
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
            emit('location', selected.split(' ')[0])
        } else if (e.key === 'Escape') {
            setLocOpen(false)
        }
    }

    const selectLocation = (loc) => {
        setLocInput(loc)
        setLocOpen(false)
        emit('location', loc.split(' ')[0])
    }

    const selectDate = (d) => {
        setDateOpen(false)
        emit('date', d)
    }

    const selectTime = (t) => {
        setTimeOpen(false)
        emit('time', time === t ? '' : t)
    }

    const selectSport = (s) => {
        setSportOpen(false)
        emit('sport', sport === s ? '' : s)
    }

    const selectPlayers = (p) => {
        setPlayersOpen(false)
        emit('players', p)
    }

    const todayStr = getDateString(0)
    const selectedTime = timeSlots.find(t => t.value === time)
    const selectedSportObj = sportsOptions.find(s => s.name === sport)

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
                                <span className="text-[11px] font-black text-[#111827] tracking-wide uppercase">City</span>
                                {locOpen ? (
                                    <input
                                        ref={locInputRef}
                                        type="text"
                                        className="text-[11px] text-[#111827] bg-transparent outline-none w-[110px] placeholder:text-[#6B7280] font-semibold p-0 m-0 border-none h-4"
                                        placeholder="Select City"
                                        value={locInput}
                                        onChange={(e) => { setLocInput(e.target.value); setLocOpen(true); setLocHighlight(-1); emit('location', e.target.value, false) }}
                                        onFocus={() => setLocOpen(true)}
                                        onKeyDown={handleLocKeyDown}
                                    />
                                ) : (
                                    <span className="text-[11px] font-semibold text-[#6B7280] truncate max-w-[110px]">
                                        {location || 'Select City'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {locOpen && (
                        <div className="absolute top-full left-0 w-full md:w-[230px] bg-white border border-[#E5E7EB] text-[#111827] rounded-[16px] mt-2 overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.12)] z-[9999]">
                            {filteredLocations.length === 0 ? (
                                <div className="p-3 text-center text-[#6B7280] text-xs font-semibold">No locations found</div>
                            ) : (
                                filteredLocations.map((loc, i) => (
                                    <div
                                        key={loc}
                                        className={`flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-all font-bold text-xs ${
                                            location && loc.toLowerCase().startsWith(location.toLowerCase())
                                                ? 'bg-[#C8FF2E] text-[#111827]'
                                                : i === locHighlight
                                                ? 'bg-[#F7F9FC] text-[#111827]'
                                                : 'text-[#4B5563] hover:bg-[#F7F9FC] hover:text-[#111827]'
                                        }`}
                                        onClick={() => selectLocation(loc)}
                                        onMouseEnter={() => setLocHighlight(i)}
                                    >
                                        <span>{loc}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                
                {/* 2. SPORT */}
                <div ref={sportRef} className="flex-1 min-w-0 relative group/sec border-b border-[#E5E7EB] lg:border-b-0 lg:border-r lg:border-[#E5E7EB]">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-4 py-1.5 flex items-center justify-between hover:bg-slate-50 rounded-[12px] lg:rounded-none"
                        onClick={() => setSportOpen(!sportOpen)}
                    >
                        <div className="flex gap-3 items-center">
                            <IoTrophyOutline className="text-[#16A34A] w-5 h-5 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-[#111827] tracking-wide uppercase">Sport</span>
                                <span className="text-[11px] font-semibold text-[#6B7280] truncate max-w-[110px]">
                                    {selectedSportObj ? selectedSportObj.name : 'Select Sport'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {sportOpen && (
                        <div className="absolute top-full left-0 w-full md:w-[210px] bg-white border border-[#E5E7EB] text-[#111827] p-3 rounded-[20px] mt-2 shadow-[0_20px_40px_rgba(0,0,0,0.1)] z-[9999]">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#6B7280] block mb-2 px-1">Select Sport</span>
                            <div className="flex flex-col gap-1">
                                {sportsOptions.map(s => {
                                    const IconComponent = s.icon
                                    const isSelected = s.name === sport
                                    return (
                                        <div
                                            key={s.name}
                                            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all text-xs font-bold ${
                                                isSelected
                                                    ? 'bg-[#C8FF2E] text-[#111827] border border-[#B5F000] shadow-[0_4px_12px_rgba(200,255,46,0.35)]'
                                                    : 'text-[#4B5563] bg-white hover:bg-[#C8FF2E] hover:text-[#111827] border border-transparent hover:border-[#B5F000]'
                                            }`}
                                            onClick={() => selectSport(s.name)}
                                        >
                                            {typeof IconComponent === 'function' ? (
                                                <IconComponent className="w-4 h-4 shrink-0 text-[#16A34A]" />
                                            ) : (
                                                <span className="text-sm">{s.icon}</span>
                                            )}
                                            <span>{s.name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. DATE */}
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
                        <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 w-[235px] bg-white border border-[#E5E7EB] p-3 rounded-[20px] mt-2 shadow-[0_15px_35px_rgba(0,0,0,0.12)] z-[9999]">
                            {/* Quick Presets Bar */}
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#6B7280] block mb-1.5">Select Date</span>
                            <div className="flex gap-1 mb-2 flex-wrap">
                                {[{ l: 'Today', v: getDateString(0) }, { l: 'Tomorrow', v: getDateString(1) }, { l: 'Weekend', v: getWeekendDate() }].map(opt => (
                                    <button
                                        key={opt.l}
                                        type="button"
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border shadow-sm cursor-pointer ${
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
                            <div className="pt-1.5 border-t border-[#E5E7EB]">
                                <CustomCalendarWidget selectedDate={date} onSelectDate={selectDate} />
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. TIME */}
                <div ref={timeRef} className="flex-1 min-w-0 relative group/sec">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-4 py-1.5 flex items-center justify-between hover:bg-slate-50 rounded-[12px] lg:rounded-full lg:rounded-l-none"
                        onClick={() => setTimeOpen(!timeOpen)}
                    >
                        <div className="flex gap-3 items-center">
                            <IoTimeOutline className="text-[#16A34A] w-5 h-5 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-[#111827] tracking-wide uppercase">Time</span>
                                <span className="text-[11px] font-semibold text-[#6B7280] truncate max-w-[110px]">
                                    {selectedTime ? selectedTime.label : 'Any Time'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {timeOpen && (
                        <div className="absolute top-full right-0 w-[260px] bg-white border border-[#E5E7EB] p-4 rounded-[20px] mt-2 shadow-[0_20px_40px_rgba(0,0,0,0.1)] z-[9999]">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#6B7280] block mb-2">Select Time Slot</span>
                            <div className="grid grid-cols-2 gap-2">
                                {timeSlots.map(t => (
                                    <button
                                        key={t.value}
                                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all border shadow-sm ${
                                            time === t.value
                                                ? 'bg-[#C8FF2E] text-[#111827] border-[#B5F000] shadow-[0_4px_12px_rgba(200,255,46,0.35)]'
                                                : 'bg-white hover:bg-[#C8FF2E] text-[#111827] border-[#E5E7EB] hover:border-[#B5F000]'
                                        }`}
                                        onClick={() => selectTime(t.value)}
                                    >
                                        <span className="text-[11px] font-bold">{t.label}</span>
                                        <span className="text-[9px] text-[#6B7280] font-semibold mt-0.5">{t.range}</span>
                                    </button>
                                ))}
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
