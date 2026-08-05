import { useState, useRef, useEffect, useCallback } from 'react'
import { IoRefreshOutline, IoLocationOutline, IoCalendarOutline, IoTimeOutline, IoTrophyOutline, IoPeopleOutline, IoSearch } from 'react-icons/io5'

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
        <div className="w-full max-w-[1060px] mx-auto relative z-40 select-none">
            <div className="relative bg-[#0b1120]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[32px] lg:rounded-full p-[3px] flex flex-col lg:flex-row items-stretch justify-between lg:h-[66px] gap-2 lg:gap-0">
                
                {/* 1. CITY */}
                <div ref={locRef} className="flex-1 min-w-0 relative group/sec border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-5 py-3 flex items-center justify-between hover:bg-white/5 rounded-2xl lg:rounded-full lg:rounded-r-none"
                        onClick={() => { setLocOpen(true); setTimeout(() => locInputRef.current?.focus(), 50) }}
                    >
                        <div className="flex gap-4 items-center">
                            <IoLocationOutline className="text-[#19E68C] w-6 h-6 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-white tracking-wide">City</span>
                                {locOpen ? (
                                    <input
                                        ref={locInputRef}
                                        type="text"
                                        className="text-[12px] text-white bg-transparent outline-none w-[120px] placeholder:text-slate-500 font-medium p-0 m-0 border-none h-4"
                                        placeholder="Select City"
                                        value={locInput}
                                        onChange={(e) => { setLocInput(e.target.value); setLocOpen(true); setLocHighlight(-1); emit('location', e.target.value, false) }}
                                        onFocus={() => setLocOpen(true)}
                                        onKeyDown={handleLocKeyDown}
                                    />
                                ) : (
                                    <span className="text-[12px] font-medium text-slate-400 truncate max-w-[120px]">
                                        {location || 'Select City'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {locOpen && (
                        <div className="absolute top-full left-0 w-full md:w-[250px] bg-slate-900 border border-white/10 text-white rounded-2xl mt-4 overflow-hidden shadow-2xl z-[9999]">
                            {filteredLocations.length === 0 ? (
                                <div className="p-3 text-center text-slate-500 text-xs">No locations found</div>
                            ) : (
                                filteredLocations.map((loc, i) => (
                                    <div
                                        key={loc}
                                        className={`flex items-center gap-2.5 px-4 py-3 cursor-pointer transition-all ${i === locHighlight ? 'bg-[#19E68C]/20 text-[#19E68C]' : 'hover:bg-white/5'}`}
                                        onClick={() => selectLocation(loc)}
                                        onMouseEnter={() => setLocHighlight(i)}
                                    >
                                        <span className="text-xs">{loc}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                
                {/* 2. SPORT */}
                <div ref={sportRef} className="flex-1 min-w-0 relative group/sec border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-5 py-3 flex items-center justify-between hover:bg-white/5 rounded-2xl lg:rounded-none"
                        onClick={() => setSportOpen(!sportOpen)}
                    >
                        <div className="flex gap-4 items-center">
                            <IoTrophyOutline className="text-[#19E68C] w-6 h-6 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-white tracking-wide">Sport</span>
                                <span className="text-[12px] font-medium text-slate-400 truncate max-w-[120px]">
                                    {selectedSportObj ? selectedSportObj.name : 'Select Sport'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {sportOpen && (
                        <div className="absolute top-full left-0 w-full md:w-[200px] bg-slate-900 border border-white/10 text-white rounded-2xl mt-4 overflow-hidden shadow-2xl z-[9999]">
                            {sportsOptions.map(s => (
                                <div key={s.name} className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-white/5 text-xs" onClick={() => selectSport(s.name)}>
                                    <span className="text-sm">{s.icon}</span> <span className="font-medium">{s.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. DATE */}
                <div ref={dateRef} className="flex-1 min-w-0 relative group/sec border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-5 py-3 flex items-center justify-between hover:bg-white/5 rounded-2xl lg:rounded-none"
                        onClick={() => setDateOpen(!dateOpen)}
                    >
                        <div className="flex gap-4 items-center">
                            <IoCalendarOutline className="text-[#19E68C] w-6 h-6 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-white tracking-wide">Date</span>
                                <span className="text-[12px] font-medium text-slate-400 truncate max-w-[120px]">
                                    {date ? formatDate(date) : 'Select Date'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {dateOpen && (
                        <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 w-[280px] bg-slate-900 border border-white/10 p-4 rounded-2xl mt-4 shadow-2xl z-[9999]">
                            <div className="flex gap-2 mb-3 flex-wrap">
                                {[{ l: 'Today', v: getDateString(0) }, { l: 'Tomorrow', v: getDateString(1) }, { l: 'Weekend', v: getWeekendDate() }].map(opt => (
                                    <button key={opt.l} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-white transition-colors" onClick={() => selectDate(opt.v)}>{opt.l}</button>
                                ))}
                            </div>
                            <input type="date" className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none [color-scheme:dark]" value={date} min={todayStr} onChange={(e) => selectDate(e.target.value)} />
                        </div>
                    )}
                </div>

                {/* 4. TIME */}
                <div ref={timeRef} className="flex-1 min-w-0 relative group/sec">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-5 py-3 flex items-center justify-between hover:bg-white/5 rounded-2xl lg:rounded-full lg:rounded-l-none"
                        onClick={() => setTimeOpen(!timeOpen)}
                    >
                        <div className="flex gap-4 items-center">
                            <IoTimeOutline className="text-[#19E68C] w-6 h-6 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-white tracking-wide">Time</span>
                                <span className="text-[12px] font-medium text-slate-400 truncate max-w-[120px]">
                                    {selectedTime ? selectedTime.label : 'Any Time'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {timeOpen && (
                        <div className="absolute top-full right-0 w-[240px] bg-slate-900 border border-white/10 p-3 rounded-2xl mt-4 shadow-2xl z-[9999]">
                            <div className="grid grid-cols-2 gap-2">
                                {timeSlots.map(t => (
                                    <button key={t.value} className="flex flex-col items-center p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors" onClick={() => selectTime(t.value)}>
                                        <span className="text-[11px] font-bold">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* SEARCH BUTTON */}
                <div className="flex items-center shrink-0 justify-center h-full pl-2 pr-1 py-1 mt-2 lg:mt-0">
                    <button
                        onClick={() => onSearch?.({ location, sport, date, time, players })}
                        className="w-full lg:w-auto h-full px-6 py-3 bg-[#19E68C] hover:bg-[#15c577] text-[#020617] font-black rounded-full transition-all shadow-[0_0_15px_rgba(25,230,140,0.2)] hover:shadow-[0_0_25px_rgba(25,230,140,0.6)] flex items-center justify-center cursor-pointer min-h-[52px] lg:min-h-full"
                    >
                        <IoSearch className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    )
}
