import { useState, useRef, useEffect, useCallback } from 'react'
import { IoRefreshOutline, IoLocationOutline, IoCalendarOutline, IoTimeOutline, IoTrophyOutline, IoPeopleOutline } from 'react-icons/io5'

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
        <div className="w-full max-w-[1200px] mx-auto relative z-40 select-none">
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl lg:rounded-[22px] p-2 flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-row items-stretch justify-between lg:h-[72px] gap-2 lg:gap-0">
                
                {/* 1. CITY */}
                <div ref={locRef} className="flex-1 relative group/sec border-b border-white/10 md:border-b-0 md:border-r lg:border-r lg:border-b-0 lg:border-white/10">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-5 py-4 flex items-center justify-between hover:bg-white/5 rounded-xl lg:rounded-l-2xl"
                        onClick={() => { setLocOpen(true); setTimeout(() => locInputRef.current?.focus(), 50) }}
                    >
                        <div className="flex gap-4 items-center">
                            <IoLocationOutline className="text-[#19E68C] w-6 h-6 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[12px] font-bold text-white">City</span>
                                {locOpen ? (
                                    <input
                                        ref={locInputRef}
                                        type="text"
                                        className="text-[11px] text-white bg-transparent outline-none w-full placeholder:text-slate-500 font-medium p-0 m-0 border-none h-4"
                                        placeholder="Select City"
                                        value={locInput}
                                        onChange={(e) => { setLocInput(e.target.value); setLocOpen(true); setLocHighlight(-1); emit('location', e.target.value, false) }}
                                        onFocus={() => setLocOpen(true)}
                                        onKeyDown={handleLocKeyDown}
                                    />
                                ) : (
                                    <span className="text-[11px] font-medium text-slate-400 truncate max-w-[100px]">
                                        {location || 'Select City'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    {locOpen && (
                        <div className="absolute top-full left-0 w-full md:w-[250px] bg-slate-900 border border-white/10 text-white rounded-xl mt-2 overflow-hidden shadow-2xl z-[60]">
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
                <div ref={sportRef} className="flex-1 relative group/sec border-b border-white/10 md:border-b-0 md:border-r lg:border-r lg:border-b-0 lg:border-white/10">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-5 py-4 flex items-center justify-between hover:bg-white/5 rounded-xl"
                        onClick={() => setSportOpen(!sportOpen)}
                    >
                        <div className="flex gap-4 items-center">
                            <IoTrophyOutline className="text-[#19E68C] w-6 h-6 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[12px] font-bold text-white">Sport</span>
                                <span className="text-[11px] font-medium text-slate-400 truncate max-w-[100px]">
                                    {selectedSportObj ? selectedSportObj.name : 'Select Sport'}
                                </span>
                            </div>
                        </div>
                        <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    {sportOpen && (
                        <div className="absolute top-full left-0 w-full md:w-[200px] bg-slate-900 border border-white/10 text-white rounded-xl mt-2 overflow-hidden shadow-2xl z-[60]">
                            {sportsOptions.map(s => (
                                <div key={s.name} className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-white/5 text-xs" onClick={() => selectSport(s.name)}>
                                    <span>{s.icon}</span> <span>{s.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. DATE */}
                <div ref={dateRef} className="flex-1 relative group/sec border-b border-white/10 md:border-b-0 lg:border-r lg:border-b-0 lg:border-white/10">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-5 py-4 flex items-center justify-between hover:bg-white/5 rounded-xl"
                        onClick={() => setDateOpen(!dateOpen)}
                    >
                        <div className="flex gap-4 items-center">
                            <IoCalendarOutline className="text-[#19E68C] w-6 h-6 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[12px] font-bold text-white">Date</span>
                                <span className="text-[11px] font-medium text-slate-400 truncate max-w-[100px]">
                                    {date ? formatDate(date) : 'Select Date'}
                                </span>
                            </div>
                        </div>
                        <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    {dateOpen && (
                        <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 w-[280px] bg-slate-900 border border-white/10 p-3 rounded-xl mt-2 shadow-2xl z-[60]">
                            <div className="flex gap-2 mb-2 flex-wrap">
                                {[{ l: 'Today', v: getDateString(0) }, { l: 'Tomorrow', v: getDateString(1) }, { l: 'Weekend', v: getWeekendDate() }].map(opt => (
                                    <button key={opt.l} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold text-white" onClick={() => selectDate(opt.v)}>{opt.l}</button>
                                ))}
                            </div>
                            <input type="date" className="w-full bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none [color-scheme:dark]" value={date} min={todayStr} onChange={(e) => selectDate(e.target.value)} />
                        </div>
                    )}
                </div>

                {/* 4. TIME */}
                <div ref={timeRef} className="flex-1 relative group/sec border-b border-white/10 md:border-b-0 md:border-r lg:border-r lg:border-b-0 lg:border-white/10 mt-2 md:mt-0">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-5 py-4 flex items-center justify-between hover:bg-white/5 rounded-xl"
                        onClick={() => setTimeOpen(!timeOpen)}
                    >
                        <div className="flex gap-4 items-center">
                            <IoTimeOutline className="text-[#19E68C] w-6 h-6 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[12px] font-bold text-white">Time</span>
                                <span className="text-[11px] font-medium text-slate-400 truncate max-w-[100px]">
                                    {selectedTime ? selectedTime.label : 'Any Time'}
                                </span>
                            </div>
                        </div>
                        <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    {timeOpen && (
                        <div className="absolute top-full right-0 w-[240px] bg-slate-900 border border-white/10 p-2 rounded-xl mt-2 shadow-2xl z-[60]">
                            <div className="grid grid-cols-2 gap-1.5">
                                {timeSlots.map(t => (
                                    <button key={t.value} className="flex flex-col items-center p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white" onClick={() => selectTime(t.value)}>
                                        <span className="text-[10px] font-bold">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>



                {/* SEARCH BUTTON */}
                <div className="flex items-center shrink-0 justify-center h-full p-2 mt-2 md:mt-0 md:col-span-2 lg:col-span-1 lg:mt-0">
                    <button
                        onClick={() => onSearch?.({ location, sport, date, time, players })}
                        className="w-full lg:w-auto h-full px-10 py-3 bg-[#19E68C] hover:bg-[#15c577] text-[#020617] font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(25,230,140,0.3)] hover:shadow-[0_0_30px_rgba(25,230,140,0.5)] flex items-center justify-center cursor-pointer min-h-[50px] lg:min-h-full"
                    >
                        Search
                    </button>
                </div>
            </div>
        </div>
    )
}
