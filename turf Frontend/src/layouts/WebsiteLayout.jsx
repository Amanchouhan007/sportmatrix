import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { HiMenu, HiX } from 'react-icons/hi'
import Button from '../components/ui/Button'

const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Turfs', to: '/turfs' },
    { label: 'Tournaments', to: '/tournaments' },
    { label: 'Membership', to: '/membership' },
    { label: 'Contact', to: '/contact' },
]

export default function WebsiteLayout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div 
            style={{ 
                background: 'radial-gradient(circle at top left, #F3FFF5 0%, #FFFFFF 50%), radial-gradient(circle at bottom right, #F4FFF7 0%, transparent 40%)' 
            }} 
            className="min-h-screen overflow-x-clip relative flex flex-col"
        >
            {/* Ambient Background Glow Blobs */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-[#16A34A]/5 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-[#C8FF2E]/10 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* 🌟 Top Navigation Bar (Highest z-index so it is always visible) */}
            <header 
                className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 bg-white/95 backdrop-blur-md border-b ${
                    isScrolled 
                        ? 'border-slate-200/80 shadow-md' 
                        : 'border-slate-200/60 shadow-xs'
                }`}
            >
                <div className="w-full px-5 md:px-10 lg:px-16 h-[64px] flex items-center justify-between relative">
                    {/* Brand Logo */}
                    <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#16A34A] to-emerald-600 flex items-center justify-center font-black text-white text-sm shadow-md group-hover:scale-105 transition-transform">
                            SM
                        </div>
                        <span className="text-xl font-black text-[#111827] tracking-tight leading-none uppercase italic">
                            SportMatrix<span className="text-[#16A34A] text-2xl font-black">.</span>
                        </span>
                    </NavLink>

                    {/* Nav Links (Centered on Desktop) */}
                    <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                        {navLinks.map((link) => (
                            <NavLink 
                                key={link.to} 
                                to={link.to} 
                                className={({ isActive }) => 
                                    `relative text-[12px] font-black tracking-widest uppercase transition-all duration-200 py-2 ${
                                        isActive 
                                            ? 'text-[#16A34A]' 
                                            : 'text-[#111827] hover:text-[#16A34A]'
                                    }`
                                } 
                            >
                                {({ isActive }) => (
                                    <>
                                        {link.label}
                                        <span className={`absolute -bottom-1 left-0 w-full h-[3px] bg-[#16A34A] rounded-full transform origin-left transition-transform duration-200 ${
                                            isActive ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
                                        }`} />
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Auth Buttons (Desktop) */}
                    <div className="hidden lg:flex items-center gap-3 shrink-0">
                        <button 
                            type="button"
                            onClick={() => navigate('/login')} 
                            className="font-black text-[11px] tracking-widest uppercase px-5 py-2 border border-slate-200 text-[#111827] hover:border-[#16A34A] hover:text-[#16A34A] hover:bg-slate-50 transition-all rounded-xl cursor-pointer"
                        >
                            Log In
                        </button>
                        <button 
                            type="button"
                            onClick={() => navigate('/register')} 
                            className="bg-[#C8FF2E] hover:bg-[#b8f51a] text-[#111827] font-black text-[11px] tracking-widest uppercase px-6 py-2 border border-[#aee810] rounded-full shadow-[0_4px_14px_rgba(184,255,44,0.35)] hover:shadow-[0_6px_20px_rgba(184,255,44,0.45)] transition-all transform hover:scale-[1.03] cursor-pointer"
                        >
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Toggle Button */}
                    <button 
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)} 
                        className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-[#111827] cursor-pointer shrink-0 transition-colors" 
                        aria-label="Toggle navigation menu"
                    >
                        {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileOpen && (
                    <div className="lg:hidden bg-white/98 backdrop-blur-xl border-t border-slate-200 px-6 pb-6 pt-4 space-y-1 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                        {navLinks.map((link) => (
                            <NavLink 
                                key={link.to} 
                                to={link.to} 
                                onClick={() => setMobileOpen(false)} 
                                className={({ isActive }) => 
                                    `block px-4 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-colors ${
                                        isActive 
                                            ? 'bg-[#C8FF2E]/30 text-[#16A34A] font-black border-l-4 border-[#16A34A]' 
                                            : 'text-[#111827] hover:bg-slate-50 hover:text-[#16A34A]'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        <div className="pt-4 space-y-2.5 border-t border-slate-200 mt-3">
                            <button 
                                type="button"
                                className="w-full py-3 border border-slate-200 text-[#111827] font-black text-[11px] tracking-widest uppercase rounded-xl hover:border-[#16A34A] hover:text-[#16A34A] transition-all cursor-pointer" 
                                onClick={() => { navigate('/login'); setMobileOpen(false) }}
                            >
                                Log In
                            </button>
                            <button 
                                type="button"
                                className="w-full py-3 bg-[#C8FF2E] hover:bg-[#b8f51a] text-[#111827] font-black text-[11px] tracking-widest uppercase rounded-full shadow-[0_6px_20px_rgba(184,255,44,0.35)] transition-all cursor-pointer" 
                                onClick={() => { navigate('/register'); setMobileOpen(false) }}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content with top padding so content is never hidden under fixed header */}
            <main className="relative flex-1 pt-[64px]">{children}</main>

            {/* Footer */}
            <footer className="bg-gradient-to-b from-white via-[#F8FFF9] to-[#F3FFF5] border-t border-[#00A651]/12 text-[#111827] relative mt-auto">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-2 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-[#C8FF2E] border border-[#B5F000] flex items-center justify-center font-black text-[#111827] text-xs shadow-sm">SM</div>
                                <span className="text-lg font-black text-[#111827] tracking-[-0.05em] uppercase italic">SportMatrix<span className="text-[#16A34A]">.</span></span>
                            </div>
                            <p className="text-[13px] font-semibold text-[#6B7280] max-w-xs leading-relaxed">The complete digital operating system for sports turfs. Manage everything from one platform.</p>
                        </div>
                        
                        <div>
                            <h4 className="text-xs font-black text-[#111827] uppercase tracking-widest mb-3">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><NavLink to="/" className="text-[13px] font-bold text-[#6B7280] hover:text-[#16A34A] transition-colors">Home</NavLink></li>
                                <li><NavLink to="/turfs" className="text-[13px] font-bold text-[#6B7280] hover:text-[#16A34A] transition-colors">Explore Turfs</NavLink></li>
                                <li><NavLink to="/tournaments" className="text-[13px] font-bold text-[#6B7280] hover:text-[#16A34A] transition-colors">Tournaments</NavLink></li>
                                <li><NavLink to="/membership" className="text-[13px] font-bold text-[#6B7280] hover:text-[#16A34A] transition-colors">Membership Plans</NavLink></li>
                                <li><NavLink to="/contact" className="text-[13px] font-bold text-[#6B7280] hover:text-[#16A34A] transition-colors">Contact Us</NavLink></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-[#111827] uppercase tracking-widest mb-3">Subscription</h4>
                            <ul className="space-y-2">
                                <li><NavLink to="/membership" className="text-[13px] font-bold text-[#6B7280] hover:text-[#16A34A] transition-colors">7-Day Free Trial</NavLink></li>
                                <li><NavLink to="/membership" className="text-[13px] font-bold text-[#6B7280] hover:text-[#16A34A] transition-colors">Basic Plan</NavLink></li>
                                <li><NavLink to="/membership" className="text-[13px] font-bold text-[#6B7280] hover:text-[#16A34A] transition-colors">Premium Plan</NavLink></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-[#111827] uppercase tracking-widest mb-3">Sports</h4>
                            <ul className="space-y-2">
                                <li><NavLink to="/turfs?sport=Cricket" className="text-[13px] font-bold text-[#6B7280] hover:text-[#16A34A] transition-colors">Cricket Turfs</NavLink></li>
                                <li><NavLink to="/turfs?sport=Cricket" className="text-[13px] font-bold text-[#6B7280] hover:text-[#16A34A] transition-colors">Box Cricket Arenas</NavLink></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="mt-10 pt-6 border-t border-[#16A34A]/15 text-center text-[11px] font-semibold text-[#6B7280]">
                        © {new Date().getFullYear()} SportMatrix. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}
