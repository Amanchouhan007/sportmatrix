import { useState, useEffect } from 'react'
import { HiMenuAlt4, HiX, HiUser, HiLogout, HiTicket } from 'react-icons/hi'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
    { label: 'TURFS & VENUES', href: '/turfs', isPage: true },
    { label: 'FEATURES', href: 'features' },
    { label: 'MODULES', href: 'modules' },
    { label: 'MEMBERSHIP', href: '/membership', isPage: true },
]

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleNavClick = (link) => {
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
        navigate('/login')
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
            <div className={`lg:hidden absolute top-0 left-0 w-full h-screen bg-white transition-all duration-700 ${mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
                <div className="flex flex-col h-full px-8 pt-32 pb-12 overflow-hidden">
                    <div className="space-y-10">
                        {navLinks.map((link, i) => (
                            <button
                                key={link.href}
                                onClick={() => handleNavClick(link)}
                                className={`block text-3xl font-black text-slate-900 hover:text-[#16a34a] transition-all w-full text-left uppercase italic tracking-tighter ${mobileOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}
                                style={{ transitionDelay: `${i * 100}ms` }}
                            >
                                <span className="text-emerald-500/20 mr-4 text-xl not-italic">0{i + 1} //</span>
                                {link.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto space-y-6">
                        <button
                            onClick={() => scrollTo('cta')}
                            className="w-full py-6 bg-slate-900 text-white font-black text-lg tracking-tighter uppercase italic rounded-sm transition-all shadow-2xl shadow-slate-900/20"
                        >
                            LAUNCH_COMMAND_CENTER
                        </button>
                        <p className="text-center text-[8px] font-black text-slate-300 tracking-[0.5em] uppercase italic">ENCRYPTED_SESSION_v2.04</p>
                    </div>
                </div>

                {/* Close Button Mobile Overlay */}
                <button onClick={() => setMobileOpen(false)} className="absolute top-6 right-6 text-slate-900 p-4">
                    <HiX className="w-10 h-10" />
                </button>
            </div>
        </nav>
    )
}
