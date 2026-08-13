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
            <div className="relative bg-white border border-[#E5E7EB] shadow-[0_10px_35px_rgba(0,0,0,0.05)] rounded-2xl lg:rounded-[22px] p-2 flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-row items-stretch justify-between lg:h-[72px] gap-2 lg:gap-0">
                
                {/* 1. CITY */}
                <div ref={locRef} className="flex-1 min-w-0 relative group/sec border-b border-[#E5E7EB] md:border-b-0 md:border-r lg:border-r lg:border-b-0 lg:border-[#E5E7EB]">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-4 py-3 flex items-center justify-between hover:bg-[#F7F9FC] rounded-xl lg:rounded-l-2xl"
                        onClick={() => { setLocOpen(true); setTimeout(() => locInputRef.current?.focus(), 50); }}
                    >
                        <div className="flex gap-3 items-center">
                            <IoLocationOutline className="text-[#16A34A] w-6 h-6 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[12px] font-black text-[#111827] uppercase tracking-wider">City</span>
                                {locOpen ? (
                                    <input
                                        ref={locInputRef}
                                        type="text"
                                        className="text-[11px] text-[#111827] bg-transparent outline-none w-[110px] placeholder:text-[#6B7280] font-bold p-0 m-0 border-none h-4"
                                        placeholder="Select City"
                                        value={locInput}
                                        onChange={(e) => { setLocInput(e.target.value); setLocOpen(true); setLocHighlight(-1); }}
                                        onFocus={() => setLocOpen(true)}
                                        onKeyDown={handleLocKeyDown}
                                    />
                                ) : (
                                    <span className="text-[11px] font-bold text-[#6B7280] truncate max-w-[110px]">
                                        {location || 'Select City'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <svg className="w-3.5 h-3.5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    {locOpen && (
                        <div className="absolute top-full left-0 w-full md:w-[250px] bg-white border border-[#E2E8F0] text-[#111827] rounded-[20px] mt-2 p-2 shadow-[0_20px_45px_rgba(0,0,0,0.14)] z-[9999] max-h-72 overflow-y-auto custom-scrollbar">
                            <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between border-b border-slate-100 mb-1">
                                <span>SELECT CITY / AREA</span>
                                <span className="text-[9px] bg-emerald-100 text-[#065F46] font-bold px-2 py-0.5 rounded-full">{filteredLocations.length} Available</span>
                            </div>
                            {filteredLocations.length === 0 ? (
                                <div className="p-3 text-center text-slate-400 text-xs font-semibold">No locations found</div>
                            ) : (
                                filteredLocations.map((loc, i) => {
                                    const isSel = location && loc.toLowerCase().startsWith(location.toLowerCase())
                                    const isHighlighted = i === locHighlight
                                    return (
                                        <div
                                            key={loc}
                                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group ${
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
                                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 transition-colors ${
                                                    isSel
                                                        ? 'bg-[#10B981] text-white shadow-xs'
                                                        : 'bg-emerald-50 text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white'
                                                }`}>
                                                    <IoLocationOutline className="w-4 h-4" />
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

                {/* 2. SPORT */}
                <div ref={sportRef} className="flex-1 min-w-0 relative group/sec border-b border-[#E5E7EB] md:border-b-0 md:border-r lg:border-r lg:border-b-0 lg:border-[#E5E7EB]">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-4 py-3 flex items-center justify-between hover:bg-[#F7F9FC] rounded-xl"
                        onClick={() => setSportOpen(!sportOpen)}
                    >
                        <div className="flex gap-3 items-center">
                            <IoTrophyOutline className="text-[#16A34A] w-6 h-6 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[12px] font-black text-[#111827] uppercase tracking-wider">Sport</span>
                                <span className="text-[11px] font-bold text-[#6B7280] truncate max-w-[110px]">
                                    {selectedSportObj ? selectedSportObj.name : 'Select Sport'}
                                </span>
                            </div>
                        </div>
                        <svg className="w-3.5 h-3.5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    {sportOpen && (
                        <div className="absolute top-full left-0 w-full md:w-[200px] bg-white border border-[#E5E7EB] text-[#111827] rounded-xl mt-2 overflow-hidden shadow-2xl z-[9999]">
                            {sportsOptions.map(s => (
                                <div key={s.name} className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-[#F7F9FC] text-xs font-bold" onClick={() => selectSport(s.name)}>
                                    <span>{s.icon}</span> <span>{s.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. DATE */}
                <div ref={dateRef} className="flex-1 min-w-0 relative group/sec border-b border-[#E5E7EB] md:border-b-0 lg:border-r lg:border-b-0 lg:border-[#E5E7EB]">
                    <div
                        className="transition-all duration-300 cursor-pointer h-full px-4 py-3 flex items-center justify-between hover:bg-[#F7F9FC] rounded-xl"
                        onClick={() => setDateOpen(!dateOpen)}
                    >
                        <div className="flex gap-3 items-center">
                            <IoCalendarOutline className="text-[#16A34A] w-6 h-6 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[12px] font-black text-[#111827] uppercase tracking-wider">Date</span>
                                <span className="text-[11px] font-bold text-[#6B7280] truncate max-w-[110px]">
                                    {date ? formatDate(date) : 'Select Date'}
                                </span>
                            </div>
                        </div>
                        <svg className="w-3.5 h-3.5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    {dateOpen && (
                        <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 w-[280px] bg-white border border-[#E5E7EB] p-3 rounded-xl mt-2 shadow-2xl z-[9999]">
                            <div className="flex gap-2 mb-2 flex-wrap">
                                {[{ l: 'Today', v: getDateString(0) }, { l: 'Tomorrow', v: getDateString(1) }, { l: 'Weekend', v: getWeekendDate() }].map(opt => (
                                    <button key={opt.l} className="px-2.5 py-1 bg-[#F7F9FC] hover:bg-[#C8FF2E] border border-[#E5E7EB] rounded-lg text-[10px] font-black text-[#111827] transition-all" onClick={() => selectDate(opt.v)}>{opt.l}</button>
                                ))}
                            </div>
                            <input type="date" className="w-full bg-[#F7F9FC] border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 text-xs text-[#111827] outline-none font-bold" value={date} min={todayStr} onChange={(e) => selectDate(e.target.value)} />
                        </div>
                    )}
                </div>

                {/* SEARCH BUTTON */}
                <div className="flex items-center shrink-0 justify-center h-full p-1 mt-2 md:mt-0 md:col-span-2 lg:col-span-1 lg:mt-0">
                    <button
                        className="w-full lg:w-auto h-full px-8 py-3 bg-[#16A34A] hover:bg-[#15803D] text-white border border-[#15803D] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_6px_20px_rgba(22,163,74,0.35)] hover:shadow-[0_8px_25px_rgba(22,163,74,0.5)] active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] lg:min-h-full"
                    >
                        <IoSearch className="w-4 h-4 text-white shrink-0" />
                        Search
                    </button>
                </div>
                
            </div>
        </div>
    );
}
