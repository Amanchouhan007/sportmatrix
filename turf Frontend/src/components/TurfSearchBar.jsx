import { useState, useRef, useEffect, useCallback } from 'react'
import { IoRefreshOutline, IoLocationOutline, IoCalendarOutline, IoTimeOutline } from 'react-icons/io5'

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
    { name: 'Football', icon: '⚽' },
    { name: 'Cricket', icon: '🏏' },
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

    /* Sync external location value */
    useEffect(() => { setLocInput(location) }, [location])

    /* Close dropdowns on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (locRef.current && !locRef.current.contains(e.target)) setLocOpen(false)
            if (dateRef.current && !dateRef.current.contains(e.target)) setDateOpen(false)
            if (timeRef.current && !timeRef.current.contains(e.target)) setTimeOpen(false)
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

    /* ── Location keyboard nav ── */
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

    const todayStr = getDateString(0)
    const selectedTime = timeSlots.find(t => t.value === time)

    return (
        <div className="w-full max-w-[950px] mx-auto px-4 relative z-40 select-none">
            {/* ── MAKE MY TRIP STYLE PREMIUM DARK GLASS CAPSULE ── */}
            <div className="relative bg-[#0B0F19]/70 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-3xl md:rounded-full p-2 flex flex-col md:flex-row items-stretch group/card transition-all duration-500">

                {/* 1. LOCATION */}
                <div ref={locRef} className="flex-[1.5] min-w-0 relative group/sec border-b md:border-b-0 md:border-r border-white/10">
                    <div
                        className={`transition-all duration-300 cursor-pointer h-full px-5 md:px-6 py-3 flex flex-col justify-center rounded-t-2xl md:rounded-l-full md:rounded-tr-none ${locOpen ? 'bg-purple-600/10' : 'hover:bg-white/5'}`}
                        onClick={() => { setLocOpen(true); setTimeout(() => locInputRef.current?.focus(), 50) }}
                    >
                        <div className="flex items-center gap-2 mb-1.5">
                            <IoLocationOutline className="text-purple-400 w-4.5 h-4.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Location</span>
                        </div>
                        <div className="flex items-center gap-1 overflow-hidden">
                            {locOpen ? (
                                <input
                                    ref={locInputRef}
                                    type="text"
                                    className="text-base font-black text-white bg-slate-950 border border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.35)] rounded-xl outline-none w-full px-3 py-1 focus:border-purple-500 placeholder:text-slate-500"
                                    placeholder="Explore Venues..."
                                    value={locInput}
                                    onChange={(e) => { setLocInput(e.target.value); setLocOpen(true); setLocHighlight(-1); emit('location', e.target.value, false) }}
                                    onFocus={() => setLocOpen(true)}
                                    onKeyDown={handleLocKeyDown}
                                />
                            ) : (
                                <span className={`text-base md:text-lg font-black truncate ${location ? 'text-white' : 'text-slate-500'}`}>
                                    {location || 'Explore Venues...'}
                                </span>
                            )}
                        </div>
                    </div>
                    {locOpen && (
                        <div className="absolute top-full left-0 w-full md:w-[320px] bg-slate-950/95 border border-white/10 text-white rounded-2xl mt-4 overflow-hidden shadow-2xl z-[60] backdrop-blur-xl">
                            {filteredLocations.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 font-bold text-xs">No locations found</div>
                            ) : (
                                filteredLocations.map((loc, i) => (
                                    <div
                                        key={loc}
                                        className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-all ${i === locHighlight ? 'bg-purple-600/20 text-purple-400 font-black' : 'hover:bg-white/5 text-slate-300'}`}
                                        onClick={() => selectLocation(loc)}
                                        onMouseEnter={() => setLocHighlight(i)}
                                    >
                                        <IoLocationOutline className="w-4 h-4 text-purple-500" />
                                        <span className="font-semibold text-xs">{loc}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* 2. DATE */}
                <div ref={dateRef} className="flex-1 min-w-0 relative group/sec border-b md:border-b-0 md:border-r border-white/10">
                    <div
                        className={`transition-all duration-300 cursor-pointer h-full px-5 py-3 flex flex-col justify-center ${dateOpen ? 'bg-purple-600/10' : 'hover:bg-white/5'}`}
                        onClick={() => setDateOpen(!dateOpen)}
                    >
                        <div className="flex items-center gap-2 mb-1.5">
                            <IoCalendarOutline className="text-purple-400 w-4.5 h-4.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Date</span>
                        </div>
                        <div className="text-base md:text-lg font-black text-white">{date ? formatDate(date) : 'Choose Date'}</div>
                    </div>
                    {dateOpen && (
                        <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 w-[300px] bg-slate-950/95 border border-white/10 p-5 rounded-2xl mt-4 shadow-2xl z-[60] backdrop-blur-xl text-white">
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {[
                                    { l: 'Today', v: getDateString(0) },
                                    { l: 'Tomorrow', v: getDateString(1) },
                                    { l: 'Weekend', v: getWeekendDate() }
                                ].map(opt => (
                                    <button
                                        key={opt.l}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${date === opt.v ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                        onClick={() => selectDate(opt.v)}
                                    >
                                        {opt.l}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="date"
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-purple-500 [color-scheme:dark]"
                                value={date}
                                min={todayStr}
                                onChange={(e) => selectDate(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* 3. TIME SLOT */}
                <div ref={timeRef} className="flex-1 min-w-0 relative group/sec border-b md:border-b-0 md:border-r border-white/10">
                    <div
                        className={`transition-all duration-300 cursor-pointer h-full px-5 py-3 flex flex-col justify-center ${timeOpen ? 'bg-purple-600/10' : 'hover:bg-white/5'}`}
                        onClick={() => setTimeOpen(!timeOpen)}
                    >
                        <div className="flex items-center gap-2 mb-1.5">
                            <IoTimeOutline className="text-purple-400 w-4.5 h-4.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Time Slot</span>
                        </div>
                        <div className="text-base md:text-lg font-black text-white tracking-tight">{selectedTime ? selectedTime.label : 'Any Time'}</div>
                    </div>
                    {timeOpen && (
                        <div className="absolute top-full right-0 w-[280px] bg-slate-950/95 border border-white/10 p-3 rounded-2xl mt-4 shadow-2xl z-[60] backdrop-blur-xl">
                            <div className="grid grid-cols-2 gap-2">
                                {timeSlots.map(t => (
                                    <button
                                        key={t.value}
                                        className={`flex flex-col items-center p-2.5 rounded-xl transition-all ${time === t.value ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                        onClick={() => selectTime(t.value)}
                                    >
                                        <span className="text-xs font-black uppercase tracking-wider">{t.label}</span>
                                        <span className="text-[9px] opacity-60 font-bold">{t.range}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {/* ── ACTION BUTTONS ── */}
                <div className="flex items-center gap-3 px-4 py-2 shrink-0">
                    <button 
                        onClick={onClear} 
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors border border-white/10 cursor-pointer"
                        title="Reset Search"
                    >
                        <IoRefreshOutline className="w-4 h-4 text-slate-400 hover:text-white" />
                    </button>
                    <button
                        onClick={() => onSearch?.({ location, sport, date, time, players })}
                        className="h-10 flex-1 md:flex-initial px-8 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-black text-xs uppercase tracking-[0.2em] rounded-full transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] flex items-center justify-center cursor-pointer"
                    >
                        SEARCH
                    </button>
                </div>
            </div>
        </div>
    )
}
