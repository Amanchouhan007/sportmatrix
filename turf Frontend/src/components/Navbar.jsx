import { useState, useEffect } from 'react'
import { HiMenuAlt4, HiX, HiUser, HiLogout, HiTicket } from 'react-icons/hi'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
    { label: 'TURFS & VENUES', href: '/turfs', isPage: true },
    { label: 'LEADERBOARD 🏆', href: '/leaderboard', isPage: true },
    { label: 'MEMBERSHIP', href: '/membership', isPage: true },
    { label: '🔍 FIND BOOKING', isFindModal: true },
]

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [isFindModalOpen, setIsFindModalOpen] = useState(false)
    const [lookupQuery, setLookupQuery] = useState('')
    const [lookupLoading, setLookupLoading] = useState(false)
    const [lookupResult, setLookupResult] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleNavClick = (link) => {
        if (link.isFindModal) {
            setIsFindModalOpen(true)
            setMobileOpen(false)
            return
        }
        if (link.isPage) {
            navigate(link.href)
            setMobileOpen(false)
        } else {
            if (location.pathname !== '/') {
                navigate('/')
                setTimeout(() => {
                    document.getElementById(link.href)?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
            } else {
                document.getElementById(link.href)?.scrollIntoView({ behavior: 'smooth' })
            }
            setMobileOpen(false)
        }
    }

    const scrollTo = (id) => {
        if (location.pathname !== '/') {
            navigate('/')
            setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        } else {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
        }
        setMobileOpen(false)
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-[#E5E7EB] py-2 shadow-sm' : 'bg-white/85 backdrop-blur-md border-b border-[#E5E7EB] py-3'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* LOGO: FRESH SPORTS BRANDING */}
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => {
                    if (location.pathname !== '/') {
                        navigate('/')
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                }}>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16A34A] to-emerald-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-emerald-500/20">SM</div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-[#111827] tracking-[-0.05em] leading-none uppercase italic">SportMatrix<span className="text-[#16A34A] text-2xl font-black">.</span></span>
                        <span className="text-[8px] font-black text-[#6B7280] tracking-[0.4em] uppercase -mt-0.5">ELITE_COMMAND</span>
                    </div>
                </div>

                {/* NAV LINKS */}
                <div className="hidden lg:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <button
                            key={link.href}
                            onClick={() => handleNavClick(link)}
                            className={`text-[10.5px] font-extrabold tracking-[0.25em] transition-all duration-300 cursor-pointer relative group uppercase ${
                                link.isPage ? 'text-[#16A34A] font-black' : 'text-[#111827] hover:text-[#16A34A]'
                            }`}
                        >
                            {link.label}
                            <span className={`absolute -bottom-1 left-0 w-0 h-[2px] bg-[#C8FF2E] transition-all duration-300 group-hover:w-full ${link.isPage ? 'w-full bg-[#C8FF2E]' : ''}`} />
                        </button>
                    ))}
                </div>

                {/* AUTH & USER ACTIONS */}
                <div className="hidden lg:flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-full pl-3 pr-1.5 py-1">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-xs font-black">
                                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-black text-slate-800 truncate max-w-[120px]">
                                    {user.name || user.email?.split('@')[0] || 'Player'}
                                </span>
                            </div>

                            <button
                                onClick={() => navigate('/customer/bookings')}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                                title="View your matches"
                            >
                                <HiTicket className="w-3.5 h-3.5 text-[#16A34A]" />
                                <span>My Bookings</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                                title="Sign out"
                            >
                                <HiLogout className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 text-[#111827] hover:text-[#16A34A] font-black text-[11px] tracking-wider uppercase transition-colors cursor-pointer"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-5 py-2.5 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-[10.5px] tracking-[0.15em] uppercase rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(200,255,46,0.3)] cursor-pointer"
                            >
                                Get Started
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => navigate('/admin')}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#111827] font-black text-[10px] tracking-[0.15em] uppercase rounded-xl border border-[#E5E7EB] transition-all cursor-pointer shadow-2xs"
                        title="Portal Switcher"
                    >
                        ⚙️ Admin
                    </button>
                </div>

                {/* MOBILE TRIGGER */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden text-[#111827] cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-colors"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <HiX className="w-8 h-8" /> : <HiMenuAlt4 className="w-8 h-8" />}
                </button>
            </div>

            {/* MOBILE INTERFACE: LIGHT SLIDE */}
            <div className={`lg:hidden fixed inset-0 z-[120] bg-white transition-all duration-300 flex flex-col ${mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
                {/* Header inside mobile drawer */}
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-black text-xs">SM</div>
                        <span className="text-lg font-black text-[#111827] uppercase italic">SportMatrix.</span>
                    </div>
                    <button onClick={() => setMobileOpen(false)} className="p-2 text-[#111827] hover:bg-slate-100 rounded-full cursor-pointer">
                        <HiX className="w-7 h-7" />
                    </button>
                </div>

                {/* Nav Links List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {[
                        { label: 'HOME', href: '/', isPage: true },
                        { label: 'TURFS & VENUES', href: '/turfs', isPage: true },
                        { label: 'LEADERBOARD', href: '/leaderboard', isPage: true },
                        { label: 'TOURNAMENTS', href: '/tournaments', isPage: true },
                        { label: 'MEMBERSHIP', href: '/membership', isPage: true },
                        { label: 'CONTACT', href: '/contact', isPage: true },
                    ].map((link) => (
                        <button
                            key={link.href}
                            onClick={() => handleNavClick(link)}
                            className={`w-full text-left py-3.5 px-4 rounded-2xl text-base font-black tracking-wider uppercase transition-all flex items-center justify-between cursor-pointer ${
                                location.pathname === link.href ? 'bg-green-50 text-[#16A34A] border border-green-200' : 'text-[#111827] hover:bg-slate-50 border border-transparent'
                            }`}
                        >
                            <span>{link.label}</span>
                            <span className="text-xs text-[#6B7280]">→</span>
                        </button>
                    ))}
                </div>

                {/* Footer Action Buttons */}
                <div className="p-6 border-t border-[#E5E7EB] bg-slate-50 space-y-3 shrink-0">
                    {user ? (
                        <button
                            onClick={() => { navigate('/customer/bookings'); setMobileOpen(false); }}
                            className="w-full py-3.5 bg-[#16A34A] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <HiTicket className="w-4 h-4" />
                            <span>My Bookings</span>
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={() => { navigate('/login'); setMobileOpen(false); }}
                                className="flex-1 py-3 bg-white border border-[#E5E7EB] text-[#111827] font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => { navigate('/login'); setMobileOpen(false); }}
                                className="flex-1 py-3 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] border border-[#B5F000] font-black text-xs uppercase tracking-wider rounded-xl shadow-xs cursor-pointer"
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* GUEST FIND BOOKING MODAL */}
            {isFindModalOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                🔍 Find Guest Booking
                            </h3>
                            <button
                                type="button"
                                onClick={() => { setIsFindModalOpen(false); setLookupResult(null); setLookupQuery(''); }}
                                className="text-slate-400 hover:text-slate-600 font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 font-medium">
                            Enter your <strong>Mobile Number</strong> or <strong>Booking Reference ID</strong> to track and download your receipt:
                        </p>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Phone / Booking Ref ID</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. 9876543210 or SM-BK-9831"
                                        value={lookupQuery}
                                        onChange={(e) => setLookupQuery(e.target.value)}
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#16A34A]"
                                    />
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!lookupQuery.trim()) return;
                                            setLookupLoading(true);
                                            setLookupResult(null);
                                            try {
                                                const res = await api.get(`/bookings/guest-lookup?query=${encodeURIComponent(lookupQuery.trim())}`);
                                                if (res?.success && res.data && res.data.length > 0) {
                                                    const b = res.data[0];
                                                    setLookupResult({
                                                        found: true,
                                                        id: b.id || b.bookingId,
                                                        status: b.status || 'CONFIRMED',
                                                        venue: b.turfName || 'SportMatrix Turf Arena',
                                                        date: `${b.slotDate || 'Date'} · ${b.slotTime || 'Time'}`,
                                                        amount: `₹${Number(b.amount || 0).toLocaleString('en-IN')}`,
                                                        customerName: b.customerName
                                                    });
                                                } else {
                                                    setLookupResult({ notFound: true });
                                                }
                                            } catch (err) {
                                                setLookupResult({ notFound: true });
                                            } finally {
                                                setLookupLoading(false);
                                            }
                                        }}
                                        disabled={lookupLoading}
                                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-[#C8FF2E] font-black text-xs rounded-xl cursor-pointer"
                                    >
                                        {lookupLoading ? 'Finding...' : 'Search'}
                                    </button>
                                </div>
                            </div>

                            {lookupResult && lookupResult.found && (
                                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2 text-xs animate-in fade-in">
                                    <div className="flex items-center justify-between font-black text-emerald-950">
                                        <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full text-[10px]">STATUS: {lookupResult.status}</span>
                                        <span className="font-mono text-emerald-700 text-sm font-bold">{lookupResult.amount}</span>
                                    </div>
                                    <p className="text-slate-800 font-bold">{lookupResult.venue}</p>
                                    <p className="text-slate-600 font-medium">{lookupResult.date}</p>
                                    <p className="text-slate-500 text-[11px]">Booked by: <strong>{lookupResult.customerName}</strong></p>
                                    <div className="pt-2 border-t border-emerald-200 flex justify-end">
                                        <span className="text-[10px] font-mono text-emerald-800 font-bold">REF: {lookupResult.id}</span>
                                    </div>
                                </div>
                            )}

                            {lookupResult && lookupResult.notFound && (
                                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-800 font-bold text-center animate-in fade-in">
                                    ❌ No booking found for "{lookupQuery}". Please check the phone number or booking reference ID.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
