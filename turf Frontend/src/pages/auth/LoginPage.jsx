import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import {
    HiArrowLeft,
    HiMail,
    HiLockClosed,
    HiEye,
    HiEyeOff,
    HiShieldCheck,
    HiUserGroup,
    HiUser,
    HiOfficeBuilding,
    HiLightningBolt,
    HiExclamationCircle,
    HiCheckCircle,
    HiBadgeCheck
} from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()

    const [form, setForm] = useState({
        email: location.state?.email || '',
        password: '',
        role: location.state?.role || 'customer'
    })
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Pre-fill form from location state if provided
    useEffect(() => {
        if (location.state?.email) {
            setForm(prev => ({
                ...prev,
                email: location.state.email || '',
                role: location.state.role || 'customer'
            }));
        }
    }, [location.state]);

    const handleEmailChange = (e) => {
        setForm(prev => ({ ...prev, email: e.target.value }));
        if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
        if (error) setError('');
    };

    const handlePasswordChange = (e) => {
        setForm(prev => ({ ...prev, password: e.target.value }));
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
            const userObj = await login(form.email, form.password, form.role)

            const roleRoutes = {
                SUPERADMIN: '/super-admin',
                SUPER_ADMIN: '/super-admin',
                OWNER: '/admin',
                STAFF: '/staff',
                CUSTOMER: '/customer'
            };

            const userRole = (userObj?.role || '').toUpperCase();
            const targetRoute = roleRoutes[userRole] || (
                userRole.includes('OWNER') ? '/admin' :
                    userRole.includes('STAFF') ? '/staff' :
                        userRole.includes('CUSTOMER') ? '/customer' : '/super-admin'
            );

            navigate(targetRoute);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError(err.message || 'An error occurred during sign in');
            }
            setIsSubmitting(false)
        }
    }

    const rolesConfig = [
        { k: 'superadmin', l: 'Super Admin', icon: HiShieldCheck },
        { k: 'owner', l: 'Admin', icon: HiOfficeBuilding },
        { k: 'staff', l: 'Staff', icon: HiUserGroup },
        { k: 'customer', l: 'Customer', icon: HiUser },
    ];

    const statsData = [
        { v: '500+', l: 'Facilities Managed', icon: HiOfficeBuilding },
        { v: '50K+', l: 'Bookings Processed', icon: HiLightningBolt },
        { v: '10K+', l: 'Active Players', icon: HiUserGroup },
        { v: '99.9%', l: 'Uptime Guarantee', icon: HiCheckCircle },
    ];

    return (
        <div className="min-h-screen bg-slate-900 lg:bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-900 relative selection:bg-[#C8FF2E]/40 overflow-x-hidden">
            {/* Floating Back Button */}
            <Link
                to="/"
                className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/80 text-slate-800 font-bold text-xs tracking-wide transition-all z-30 shadow-md hover:shadow-lg backdrop-blur-md group"
            >
                <HiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#16A34A]" />
                <span>Back</span>
            </Link>

            {/* Left Side Showcase (Desktop & Tablet Hero) */}
            <div className="hidden lg:flex lg:w-7/12 xl:w-1/2 relative overflow-hidden items-center justify-center p-12 xl:p-16 bg-slate-950 min-h-screen">
                {/* Background Image with Dark Vignette Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
                    style={{ backgroundImage: `url('/images/turf1.png')` }}
                />
                {/* Dual Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-emerald-950/60" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/90" />

                {/* Glow Effects */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C8FF2E]/15 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#16A34A]/20 rounded-full blur-[100px] pointer-events-none" />

                {/* Content Box */}
                <div className="relative z-10 max-w-xl text-white">
                    {/* Top Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-8">
                        <span className="w-2 h-2 rounded-full bg-[#C8FF2E] animate-pulse" />
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C8FF2E]">Sports Business OS</span>
                    </div>

                    {/* Logo & Brand Header */}
                    <div className="flex items-center gap-3.5 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#16A34A] to-emerald-400 flex items-center justify-center font-black text-white text-xl shadow-[0_0_25px_rgba(22,163,74,0.5)] border border-emerald-400/40">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zm0 15l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="text-3xl font-black uppercase tracking-widest italic text-white">
                            SportMatrix<span className="text-[#C8FF2E]">.</span>
                        </span>
                    </div>

                    <h1 className="text-4xl xl:text-5xl font-black mb-6 leading-[1.15] uppercase italic tracking-tight text-white">
                        SPORTS FACILITY <br />
                        <span className="bg-gradient-to-r from-[#C8FF2E] via-emerald-400 to-emerald-200 bg-clip-text text-transparent">
                            PLATFORM
                        </span>
                    </h1>

                    <p className="text-slate-300 text-base leading-relaxed font-medium mb-10 max-w-lg">
                        Manage bookings, tournaments, player analytics, and facility revenue seamlessly from one unified enterprise dashboard.
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {statsData.map((s) => {
                            const IconComponent = s.icon;
                            return (
                                <div
                                    key={s.l}
                                    className="bg-white/10 border border-white/15 backdrop-blur-xl rounded-2xl p-4 shadow-xl hover:bg-white/15 hover:border-[#C8FF2E]/40 transition-all duration-300 group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-2xl xl:text-3xl font-black text-white group-hover:text-[#C8FF2E] transition-colors">{s.v}</p>
                                        <IconComponent className="w-5 h-5 text-[#C8FF2E] opacity-80 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-300">{s.l}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-slate-50 relative min-h-screen">
                {/* Background Ambient Glow for Right Panel */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#16A34A]/10 to-[#C8FF2E]/10 rounded-full blur-[140px] pointer-events-none" />

                <div className="w-full max-w-md bg-white p-6 sm:p-9 rounded-3xl border border-slate-200/80 shadow-[0_15px_45px_rgba(0,0,0,0.06)] relative z-10 my-auto overflow-hidden">
                    {/* Top Accent Gradient Border */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#16A34A] via-[#C8FF2E] to-emerald-500 absolute top-0 left-0" />

                    {/* Mobile Branded Header (visible on mobile / small screens) */}
                    <div className="lg:hidden flex flex-col items-center mb-6 pt-4 sm:pt-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#16A34A] to-emerald-500 flex items-center justify-center font-black text-white text-xl shadow-lg mb-3 border border-emerald-400">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zm0 15l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="text-2xl font-black uppercase tracking-widest italic text-slate-900">
                            SportMatrix<span className="text-[#16A34A]">.</span>
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight italic">Welcome Back</h2>
                        <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">Enter your credentials to access your dashboard</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <HiMail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={form.email}
                                    onChange={handleEmailChange}
                                    disabled={isSubmitting}
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border ${fieldErrors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-[#16A34A] focus:ring-[#16A34A]/20'} text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:bg-white transition-all font-semibold text-sm`}
                                />
                            </div>
                            {fieldErrors.email && (
                                <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                                    <HiExclamationCircle className="w-3.5 h-3.5" />
                                    {fieldErrors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <HiLockClosed className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handlePasswordChange}
                                    disabled={isSubmitting}
                                    className={`w-full pl-11 pr-11 py-3 rounded-xl bg-slate-50 border ${fieldErrors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-[#16A34A] focus:ring-[#16A34A]/20'} text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:bg-white transition-all font-semibold text-sm`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                >
                                    {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                                    <HiExclamationCircle className="w-3.5 h-3.5" />
                                    {fieldErrors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password Row */}
                        <div className="flex items-center justify-between text-xs pt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-semibold select-none">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-[#16A34A] focus:ring-[#16A34A] cursor-pointer"
                                />
                                <span>Remember me</span>
                            </label>
                            <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[#16A34A] font-bold hover:underline transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        {/* Role Selector Grid */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">Select Role</label>
                                <span className="text-[10px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <HiBadgeCheck className="w-3 h-3" /> Quick Demo
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                {rolesConfig.map((r) => {
                                    const RoleIcon = r.icon;
                                    const isActive = form.role === r.k;
                                    return (
                                        <button
                                            key={r.k}
                                            type="button"
                                            onClick={() => handleRoleChange(r.k)}
                                            className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all uppercase tracking-wider flex items-center justify-between cursor-pointer ${isActive
                                                    ? 'bg-[#C8FF2E] border-[#B5F000] text-slate-900 shadow-md scale-[1.02]'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-100/80'
                                                }`}
                                        >
                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                <RoleIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                                                <span className="truncate">{r.l}</span>
                                            </div>
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-[#16A34A]' : 'bg-slate-300'}`} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 mt-4 bg-gradient-to-r from-[#C8FF2E] to-[#b5f000] hover:from-[#bbf525] hover:to-[#a7e400] text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(200,255,46,0.35)] hover:shadow-[0_6px_24px_rgba(200,255,46,0.55)] active:scale-[0.99] cursor-pointer border border-[#b5f000] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Signing In...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold text-center mt-3 flex items-center justify-center gap-2">
                                <HiExclamationCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </form>

                    {/* Footer */}
                    <p className="text-center text-xs text-slate-500 font-semibold mt-6">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-[#16A34A] font-black hover:underline transition-colors">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
