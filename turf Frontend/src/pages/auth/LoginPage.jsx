import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
    const navigate = useNavigate()
    const { login, logout, token, user } = useAuth()
    
    const [form, setForm] = useState({ email: '', password: '', role: 'customer' })
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Redirect already authenticated users
    useEffect(() => {
        if (token && user) {
            const normalizeRole = (r) => (r || '').toUpperCase().replace(/[-_]/g, '');
            const rNorm = normalizeRole(user.role);
            const roleRoutes = {
                SUPERADMIN: '/dashboard/super-admin',
                OWNER: '/dashboard/owner',
                STAFF: '/dashboard/staff',
                CUSTOMER: '/dashboard/customer'
            };
            if (roleRoutes[rNorm]) {
                navigate(roleRoutes[rNorm]);
            } else {
                console.warn('Unknown user role:', user.role);
                logout();
            }
        }
    }, [token, user, navigate, logout]);

    const handleEmailChange = (e) => {
        setForm({ ...form, email: e.target.value });
        if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
        if (error) setError('');
    };

    const handlePasswordChange = (e) => {
        setForm({ ...form, password: e.target.value });
        if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
        if (error) setError('');
    };

    const handleRoleChange = (role) => {
        const credentials = {
            superadmin: { email: 'superadmin@gmail.com', password: '123456' },
            owner: { email: 'owner@gmail.com', password: '123456' },
            staff: { email: 'staff@gmail.com', password: '123' },
            customer: { email: 'customer@gmail.com', password: '123' }
        };

        const selectedCreds = credentials[role] || { email: '', password: '' };

        setForm({ 
            email: selectedCreds.email, 
            password: selectedCreds.password, 
            role 
        });

        // Clear field validation errors and general errors
        setFieldErrors({ email: '', password: '' });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        
        let hasErrors = false;
        const newFieldErrors = { email: '', password: '' };

        // 1. Email validation
        if (!form.email) {
            newFieldErrors.email = 'Email address is required';
            hasErrors = true;
        } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) {
            newFieldErrors.email = 'Please enter a valid email address';
            hasErrors = true;
        }

        // 2. Password validation
        if (!form.password) {
            newFieldErrors.password = 'Password is required';
            hasErrors = true;
        } else if (form.password.length < 3) {
            newFieldErrors.password = 'Password must be at least 3 characters long';
            hasErrors = true;
        }

        if (hasErrors) {
            setFieldErrors(newFieldErrors);
            return;
        }

        setIsSubmitting(true)
        
        try {
            await login(form.email, form.password, form.role)
            // Success redirect is handled reactively by the useEffect hook on token/user state change
        } catch (err) {
            // Handle error messages returned from backend or role mismatch
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError(err.message || 'An error occurred during sign in');
            }
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
            {/* Left Side - Turf Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-16">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80&fit=crop')] bg-cover bg-center opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 to-slate-950/90" />
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-32 translate-x-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] translate-y-24 -translate-x-24 pointer-events-none" />
                
                <div className="relative z-10 text-white max-w-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] border border-emerald-300/50">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 15l10 5 10-5M2 12l10 5 10-5"/></svg>
                        </div>
                        <span className="text-2xl font-black uppercase tracking-widest italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">SportMatrix</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight uppercase italic tracking-tighter text-white drop-shadow-xl">SPORTS FACILITY <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">PLATFORM</span></h1>
                    <p className="text-emerald-50/80 text-lg leading-relaxed font-medium">Manage bookings, tournaments, players, and revenue analytics for your sports facilities from one unified platform.</p>
                    <div className="mt-12 grid grid-cols-2 gap-4">
                        {[{ v: '500+', l: 'Facilities' }, { v: '50K+', l: 'Bookings' }, { v: '10K+', l: 'Players' }, { v: '99.9%', l: 'Uptime' }].map((s) => (
                            <div key={s.l} className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-xl p-5 hover:border-emerald-500/30 transition-all duration-300">
                                <p className="text-2xl font-black text-white">{s.v}</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mt-1">{s.l}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-950">
                <div className="w-full max-w-md">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-slate-950 text-lg shadow-[0_0_25px_rgba(16,185,129,0.3)] mb-4 border border-emerald-300/50">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 15l10 5 10-5M2 12l10 5 10-5"/></svg>
                        </div>
                        <span className="text-2xl font-black uppercase tracking-widest italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">SportMatrix</span>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 text-center uppercase tracking-tighter italic">Welcome back</h2>
                    <p className="text-slate-400 text-sm mb-8 text-center font-semibold">Enter your credentials to access your dashboard</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Email</label>
                            <input 
                                type="email" 
                                placeholder="name@company.com" 
                                value={form.email} 
                                onChange={handleEmailChange}
                                disabled={isSubmitting}
                                className={`w-full px-4 py-3 rounded-xl bg-slate-900 border ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-emerald-500 focus:ring-emerald-500'} text-white placeholder:text-slate-600 outline-none focus:ring-1 transition-all font-medium text-sm`}
                            />
                            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={form.password} 
                                onChange={handlePasswordChange}
                                disabled={isSubmitting}
                                className={`w-full px-4 py-3 rounded-xl bg-slate-900 border ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-emerald-500 focus:ring-emerald-500'} text-white placeholder:text-slate-600 outline-none focus:ring-1 transition-all font-medium text-sm`}
                            />
                            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
                        </div>

                        <div className="pt-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2.5">Login as</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[{ k: 'owner', l: 'Owner' }, { k: 'staff', l: 'Staff' }, { k: 'customer', l: 'Customer' }, { k: 'superadmin', l: 'Admin' }].map((r) => (
                                    <button 
                                        key={r.k} 
                                        type="button" 
                                        disabled={isSubmitting}
                                        onClick={() => handleRoleChange(r.k)} 
                                        className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border disabled:opacity-50 ${form.role === r.k ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/30 hover:text-white'}`}
                                    >
                                        {r.l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-3.5 mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </button>
                        
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-semibold text-center mt-3 animate-fade-in">
                                {error}
                            </div>
                        )}
                    </form>

                    <p className="text-center text-sm text-slate-500 font-medium mt-8">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline transition-colors">Create account</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
