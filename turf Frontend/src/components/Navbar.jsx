import { useState, useEffect } from 'react'
import { HiMenuAlt4, HiX } from 'react-icons/hi'
import { useNavigate, useLocation } from 'react-router-dom'

const navLinks = [
    { label: 'FEATURES', href: 'features' },
    { label: 'MODULES', href: 'modules' },
    { label: 'ROLES', href: 'roles' },
    { label: 'INTEL', href: 'how-it-works' },
    { label: 'MEMBERSHIP', href: '/membership', isPage: true },
]

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

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
                // Allow routing to complete, then scroll
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

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-black/40 backdrop-blur-xl border-b border-white/10 py-3 shadow-sm' : 'bg-[rgba(0,0,0,0.35)] backdrop-blur-[6px] py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* LOGO: FRESH SPORTS BRANDING */}
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => {
                    if (location.pathname !== '/') {
                        navigate('/')
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                }}>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16a34a] to-green-600 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-green-500/30">SM</div>
                        <div className="absolute inset-0 border border-white/10 -rotate-3 group-hover:scale-110 transition-transform rounded-sm" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-white tracking-[-0.05em] leading-none uppercase italic drop-shadow-md">SportMatrix<span className="text-[#16a34a] text-2xl font-black">.</span></span>
                        <span className="text-[8px] font-black text-slate-300 tracking-[0.4em] uppercase -mt-0.5 drop-shadow-sm">ELITE_COMMAND</span>
                    </div>
                </div>

                {/* NAV LINKS: CLEAN MODERN TYPOGRAPHY */}
                <div className="hidden lg:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <button
                            key={link.href}
                            onClick={() => handleNavClick(link)}
                            className={`text-[10px] font-black tracking-[0.3em] transition-all duration-300 cursor-pointer relative group uppercase drop-shadow-sm ${
                                link.isPage ? 'text-[#16a34a] hover:text-green-400 font-extrabold' : 'text-slate-200 hover:text-white'
                            }`}
                        >
                            {link.label}
                            <span className={`absolute -bottom-1 left-0 w-0 h-px bg-[#16a34a] transition-all duration-300 group-hover:w-full ${link.isPage ? 'w-full bg-[#16a34a]' : ''}`} />
                        </button>
                    ))}
                </div>

                {/* TACTICAL CTA: LIGHT THEME */}
                <div className="hidden lg:flex items-center gap-6">
                    <button
                        onClick={() => scrollTo('cta')}
                        className="px-8 py-2.5 bg-[#16a34a] text-white font-black text-[11px] tracking-[0.2em] uppercase rounded-sm hover:bg-green-500 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-green-600/20"
                    >
                        INITIATE_PRO_OPS
                    </button>
                </div>

                {/* MOBILE TRIGGER */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden text-white cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors"
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
