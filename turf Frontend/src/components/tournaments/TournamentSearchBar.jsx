import { useState, useRef, useEffect } from 'react';
import { IoLocationOutline, IoCalendarOutline, IoTrophyOutline } from 'react-icons/io5';

/* ── Location Data ── */
const locationSuggestions = [
    { city: 'Indore', areas: ['Vijay Nagar', 'Palasia', 'Bypass', 'Bhawarkuan', 'Rajwada'] },
    { city: 'Mumbai', areas: ['Andheri West', 'Bandra', 'Powai', 'Vashi', 'Thane'] },
    { city: 'Delhi', areas: ['Dwarka', 'Saket', 'Connaught Place', 'Rohini', 'Vasant Kunj'] },
    { city: 'Bangalore', areas: ['Koramangala', 'Whitefield', 'Indiranagar', 'HSR Layout', 'Electronic City'] },
    { city: 'Pune', areas: ['Baner', 'Kothrud', 'Hadapsar', 'Hinjewadi', 'Viman Nagar'] },
    { city: 'Hyderabad', areas: ['Madhapur', 'Gachibowli', 'Banjara Hills', 'Jubilee Hills', 'Kukatpally'] },
    { city: 'Chennai', areas: ['Adyar', 'Velachery', 'T. Nagar', 'Anna Nagar', 'OMR'] },
];

const allLocations = locationSuggestions.flatMap(loc => [
    loc.city,
    ...loc.areas.map(area => `${loc.city} ${area}`)
]);

/* ── Sports Data ── */
const sportsOptions = [
    { name: 'Football', icon: '⚽' },
    { name: 'Cricket', icon: '🏏' },
];

/* ── Helper: Format date ── */
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getDateString(daysFromNow) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
}

function getWeekendDate() {
    const d = new Date();
    const day = d.getDay();
    const daysUntilSat = day === 0 ? 6 : (6 - day);
    d.setDate(d.getDate() + daysUntilSat);
    return d.toISOString().split('T')[0];
}

export default function TournamentSearchBar() {
    /* ── State ── */
    const [locInput, setLocInput] = useState('');
    const [location, setLocation] = useState('');
    const [locOpen, setLocOpen] = useState(false);
    const [locHighlight, setLocHighlight] = useState(-1);
    const locRef = useRef(null);
    const locInputRef = useRef(null);

    const [sport, setSport] = useState('');
    const [sportOpen, setSportOpen] = useState(false);
    const sportRef = useRef(null);

    const [date, setDate] = useState('');
    const [dateOpen, setDateOpen] = useState(false);
    const dateRef = useRef(null);

    /* Close dropdowns on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (locRef.current && !locRef.current.contains(e.target)) setLocOpen(false);
            if (sportRef.current && !sportRef.current.contains(e.target)) setSportOpen(false);
            if (dateRef.current && !dateRef.current.contains(e.target)) setDateOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── Filtered location suggestions ── */
    const filteredLocations = locInput.trim()
        ? allLocations.filter(l => l.toLowerCase().includes(locInput.toLowerCase())).slice(0, 8)
        : allLocations.slice(0, 8);

    /* ── Handlers ── */
    const handleLocKeyDown = (e) => {
        if (!locOpen) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setLocHighlight(p => Math.min(p + 1, filteredLocations.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setLocHighlight(p => Math.max(p - 1, 0));
        } else if (e.key === 'Enter' && locHighlight >= 0) {
            e.preventDefault();
            const selected = filteredLocations[locHighlight];
            setLocInput(selected);
            setLocation(selected);
            setLocOpen(false);
        } else if (e.key === 'Escape') {
            setLocOpen(false);
        }
    };

    const selectLocation = (loc) => {
        setLocInput(loc);
        setLocation(loc);
        setLocOpen(false);
    };

    const selectSport = (s) => {
        setSport(s);
        setSportOpen(false);
    };

    const selectDate = (d) => {
        setDate(d);
        setDateOpen(false);
    };

    const todayStr = getDateString(0);
    const selectedSportObj = sportsOptions.find(s => s.name === sport);

    return (
        <div className="w-full relative z-40 select-none">
            <div className="relative bg-[#0b1120]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl lg:rounded-[22px] p-2 flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-row items-stretch justify-between lg:h-[72px] gap-2 lg:gap-0">
                
                {/* 1. CITY */}
                <div ref={locRef} className="flex-1 min-w-0 relative group/sec border-b border-white/10 md:border-b-0 md:border-r lg:border-r lg:border-b-0 lg:border-white/10">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-3 py-3 flex items-center justify-between hover:bg-white/5 rounded-xl lg:rounded-l-2xl"
                        onClick={() => { setLocOpen(true); setTimeout(() => locInputRef.current?.focus(), 50); }}
                    >
                        <div className="flex gap-2 items-center">
                            <IoLocationOutline className="text-[#19E68C] w-6 h-6 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[12px] font-bold text-white">City</span>
                                {locOpen ? (
                                    <input
                                        ref={locInputRef}
                                        type="text"
                                        className="text-[11px] text-white bg-transparent outline-none w-[100px] placeholder:text-slate-500 font-medium p-0 m-0 border-none h-4"
                                        placeholder="Select City"
                                        value={locInput}
                                        onChange={(e) => { setLocInput(e.target.value); setLocOpen(true); setLocHighlight(-1); }}
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
                        <div className="absolute top-full left-0 w-full md:w-[250px] bg-slate-900 border border-white/10 text-white rounded-xl mt-2 overflow-hidden shadow-2xl z-[9999]">
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
                <div ref={sportRef} className="flex-1 min-w-0 relative group/sec border-b border-white/10 md:border-b-0 md:border-r lg:border-r lg:border-b-0 lg:border-white/10">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-3 py-3 flex items-center justify-between hover:bg-white/5 rounded-xl"
                        onClick={() => setSportOpen(!sportOpen)}
                    >
                        <div className="flex gap-2 items-center">
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
                        <div className="absolute top-full left-0 w-full md:w-[200px] bg-slate-900 border border-white/10 text-white rounded-xl mt-2 overflow-hidden shadow-2xl z-[9999]">
                            {sportsOptions.map(s => (
                                <div key={s.name} className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-white/5 text-xs" onClick={() => selectSport(s.name)}>
                                    <span>{s.icon}</span> <span>{s.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. DATE */}
                <div ref={dateRef} className="flex-1 min-w-0 relative group/sec border-b border-white/10 md:border-b-0 lg:border-r lg:border-b-0 lg:border-white/10">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-3 py-3 flex items-center justify-between hover:bg-white/5 rounded-xl"
                        onClick={() => setDateOpen(!dateOpen)}
                    >
                        <div className="flex gap-2 items-center">
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
                        <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 w-[280px] bg-slate-900 border border-white/10 p-3 rounded-xl mt-2 shadow-2xl z-[9999]">
                            <div className="flex gap-2 mb-2 flex-wrap">
                                {[{ l: 'Today', v: getDateString(0) }, { l: 'Tomorrow', v: getDateString(1) }, { l: 'Weekend', v: getWeekendDate() }].map(opt => (
                                    <button key={opt.l} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold text-white" onClick={() => selectDate(opt.v)}>{opt.l}</button>
                                ))}
                            </div>
                            <input type="date" className="w-full bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none [color-scheme:dark]" value={date} min={todayStr} onChange={(e) => selectDate(e.target.value)} />
                        </div>
                    )}
                </div>

                {/* SEARCH BUTTON */}
                <div className="flex items-center shrink-0 justify-center h-full p-1 mt-2 md:mt-0 md:col-span-2 lg:col-span-1 lg:mt-0">
                    <button
                        className="w-full lg:w-auto h-full pl-7 pr-7 lg:pr-[43px] py-2.5 bg-[#19E68C] hover:bg-[#15c577] text-[#020617] font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(25,230,140,0.3)] hover:shadow-[0_0_30px_rgba(25,230,140,0.5)] flex items-center justify-center cursor-pointer min-h-[44px] lg:min-h-full"
                    >
                        Search
                    </button>
                </div>
                
            </div>
        </div>
    );
}
