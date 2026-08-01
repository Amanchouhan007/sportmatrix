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
    const isHomePage = location.pathname === '/'

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-surface-50 overflow-x-clip">
            {/* Navbar: Transparent to Solid Transition */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-[400ms] ${isScrolled || !isHomePage ? 'bg-[#0f172a] shadow-[0_4px_20px_rgba(0,0,0,0.4)] border-b border-white/5 py-1' : 'bg-transparent py-4'}`}>

                <div className="w-full px-5 md:px-10 lg:px-20 h-16 flex items-center justify-between relative z-10">
                    {/* Logo */}
                    <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform">SM</div>
                        <span className="text-xl font-black text-white tracking-[-0.05em] leading-none uppercase italic" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>SportMatrix<span className="text-emerald-500 text-2xl font-black">.</span></span>
                    </NavLink>

                    {/* Nav Links (Absolutely centered on desktop) */}
                    <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                        {navLinks.map((link) => (
                            <NavLink 
                                key={link.to} 
                                to={link.to} 
                                className={({ isActive }) => 
                                    `relative group text-[11px] font-black tracking-widest uppercase transition-all duration-300 py-2 ${
                                        isActive 
                                            ? 'text-white' 
                                            : 'text-slate-300 hover:text-white'
                                    }`
                                } 
                                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                            >
                                {({ isActive }) => (
                                    <>
                                        {link.label}
                                        <span className={`absolute -bottom-1 left-0 w-full h-[3px] bg-emerald-500 shadow-[0_0_10px_#10b981] transform origin-left transition-transform duration-300 ease-out ${
                                            isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                        }`} />
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    {/* Auth Buttons (Desktop) */}
                    <div className="hidden lg:flex items-center gap-4 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => navigate('/login')} className="font-black text-[10px] tracking-widest uppercase px-5 border-white/30 text-white hover:bg-white hover:text-slate-950 hover:border-white transition-all shadow-lg backdrop-blur-sm">Log In</Button>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-600 opacity-0 blur-xl rounded-sm group-hover:opacity-40 transition-opacity duration-500" />
                            <Button size="sm" onClick={() => navigate('/register')} className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[10px] tracking-widest uppercase px-6 border border-blue-500 rounded-sm shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:from-blue-500 hover:to-indigo-500 transition-all transform hover:scale-[1.02]">Get Started</Button>
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-white/10 cursor-pointer drop-shadow-md shrink-0" aria-label="Toggle menu">
                        {mobileOpen ? <HiX className="w-6 h-6 text-white" /> : <HiMenu className="w-6 h-6 text-white" />}
                    </button>
                </div>

                {mobileOpen && (
                    <div className="lg:hidden bg-slate-950 border-t border-white/10 px-6 pb-6 pt-3 space-y-1 fade-up shadow-2xl">
                        {navLinks.map((link) => (
                            <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `block px-4 py-3 rounded-sm text-[11px] font-black uppercase tracking-widest ${isActive ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                {({ isActive }) => (
                                    <>{link.label}</>
                                )}
                            </NavLink>
                        ))}
                        <div className="pt-5 space-y-3 border-t border-white/10 mt-3">
                             <button className="w-full py-3 border border-white/20 text-white font-black text-[10px] tracking-widest uppercase rounded-sm hover:bg-white hover:text-slate-950 transition-all" onClick={() => { navigate('/login'); setMobileOpen(false) }}>Log In</button>
                            <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[10px] tracking-widest uppercase rounded-sm hover:from-blue-500 hover:to-indigo-500 transition-all animate-pulse" onClick={() => { navigate('/register'); setMobileOpen(false) }}>Get Started</button>
                        </div>
                    </div>
                )}
            </nav>

            <main>{children}</main>

            <footer className="bg-slate-950 border-t border-slate-900/60">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-2 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)]">SM</div>
                                <span className="text-lg font-black text-white tracking-[-0.05em] uppercase italic">SportMatrix<span className="text-emerald-500">.</span></span>
                            </div>
                            <p className="text-[13px] font-medium text-slate-400 max-w-xs leading-relaxed">The complete digital operating system for sports turfs. Manage everything from one platform.</p>
                        </div>
                        
                        <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><NavLink to="/" className="text-[13px] font-bold text-slate-400 hover:text-emerald-400 transition-colors">Home</NavLink></li>
                                <li><NavLink to="/turfs" className="text-[13px] font-bold text-slate-400 hover:text-emerald-400 transition-colors">Explore Turfs</NavLink></li>
                                <li><NavLink to="/tournaments" className="text-[13px] font-bold text-slate-400 hover:text-emerald-400 transition-colors">Tournaments</NavLink></li>
                                <li><NavLink to="/membership" className="text-[13px] font-bold text-slate-400 hover:text-emerald-400 transition-colors">Membership Plans</NavLink></li>
                                <li><NavLink to="/contact" className="text-[13px] font-bold text-slate-400 hover:text-emerald-400 transition-colors">Contact Us</NavLink></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3">Subscription</h4>
                            <ul className="space-y-2">
                                <li><NavLink to="/membership" className="text-[13px] font-bold text-slate-400 hover:text-emerald-400 transition-colors">7-Day Free Trial</NavLink></li>
                                <li><NavLink to="/membership" className="text-[13px] font-bold text-slate-400 hover:text-emerald-400 transition-colors">Basic Plan</NavLink></li>
                                <li><NavLink to="/membership" className="text-[13px] font-bold text-slate-400 hover:text-emerald-400 transition-colors">Premium Plan</NavLink></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3">Sports</h4>
                            <ul className="space-y-2">
                                <li><NavLink to="/turfs?sport=Football" className="text-[13px] font-bold text-slate-400 hover:text-emerald-400 transition-colors">Football Turfs</NavLink></li>
                                <li><NavLink to="/turfs?sport=Cricket" className="text-[13px] font-bold text-slate-400 hover:text-emerald-400 transition-colors">Cricket Turfs</NavLink></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-slate-900/60 text-center text-[11px] text-slate-500">
                        © {new Date().getFullYear()} SportMatrix. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}
