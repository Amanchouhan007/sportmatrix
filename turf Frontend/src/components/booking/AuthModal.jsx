import React from 'react'

/**
 * AuthModal — Login / Guest login / Register Modal for Slot Booking
 */
export default function AuthModal({
    isOpen,
    onClose,
    authModalTab,
    setAuthModalTab,
    authRole,
    setAuthRole,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authRegName,
    setAuthRegName,
    authRegPhone,
    setAuthRegPhone,
    authRegEmail,
    setAuthRegEmail,
    authRegPassword,
    setAuthRegPassword,
    authLoading,
    handleAuthLoginSubmit,
    handleQuickDemoLogin,
    handleRegisterSubmit
}) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-100 relative">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                    ✕
                </button>

                <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#16A34A] flex items-center justify-center text-2xl mx-auto mb-2 shadow-xs">
                        🔐
                    </div>
                    <h3 className="text-xl font-black text-[#111827]">Account Sign-In / Registration</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Choose an option to confirm your match slot</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                    <button
                        type="button"
                        onClick={() => setAuthModalTab('login')}
                        className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${authModalTab === 'login' ? 'bg-white text-[#16A34A] shadow-sm font-black' : 'hover:text-slate-900'}`}
                    >
                        🔑 Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => setAuthModalTab('quick')}
                        className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${authModalTab === 'quick' ? 'bg-white text-[#16A34A] shadow-sm font-black' : 'hover:text-slate-900'}`}
                    >
                        ⚡ 1-Click Demo
                    </button>
                    <button
                        type="button"
                        onClick={() => setAuthModalTab('register')}
                        className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${authModalTab === 'register' ? 'bg-white text-[#16A34A] shadow-sm font-black' : 'hover:text-slate-900'}`}
                    >
                        📝 New Account
                    </button>
                </div>

                {/* TAB 1: LOGIN FORM */}
                {authModalTab === 'login' && (
                    <form onSubmit={handleAuthLoginSubmit} className="space-y-3.5 text-xs">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Role / Category</label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {[
                                    { id: 'customer', label: '⚽ Customer' },
                                    { id: 'owner', label: '👑 Owner' },
                                    { id: 'superadmin', label: '🛡️ Admin' },
                                ].map((r) => (
                                    <button
                                        type="button"
                                        key={r.id}
                                        onClick={() => {
                                            setAuthRole(r.id)
                                            if (r.id === 'customer') { setAuthEmail('customer@gmail.com'); setAuthPassword('123') }
                                            if (r.id === 'owner') { setAuthEmail('owner@gmail.com'); setAuthPassword('123456') }
                                            if (r.id === 'superadmin') { setAuthEmail('superadmin@gmail.com'); setAuthPassword('123456') }
                                        }}
                                        className={`py-1.5 px-2 rounded-lg border font-bold text-[11px] transition-all cursor-pointer ${authRole === r.id ? 'bg-emerald-50 border-[#16A34A] text-[#16A34A]' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Email Address</label>
                            <input
                                type="email"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white text-xs"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Password</label>
                            <input
                                type="password"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white text-xs"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md mt-2"
                        >
                            {authLoading ? 'Signing In...' : 'Sign In & Lock Match →'}
                        </button>
                    </form>
                )}

                {/* TAB 2: 1-CLICK QUICK DEMO LOGIN */}
                {authModalTab === 'quick' && (
                    <div className="space-y-2 text-xs">
                        <div
                            onClick={() => handleQuickDemoLogin('customer')}
                            className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl">⚽</span>
                                <div>
                                    <div className="font-black text-[#111827]">Rohan Verma (Customer)</div>
                                    <div className="text-[10px] text-emerald-800 font-medium">customer@gmail.com</div>
                                </div>
                            </div>
                            <span className="text-[10px] font-black bg-[#16A34A] text-white px-2.5 py-1 rounded-md">Select ➔</span>
                        </div>

                        <div
                            onClick={() => handleQuickDemoLogin('guest')}
                            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl">🏃</span>
                                <div>
                                    <div className="font-black text-[#111827]">Continue as Guest</div>
                                    <div className="text-[10px] text-slate-500 font-medium">Fast guest booking</div>
                                </div>
                            </div>
                            <span className="text-[10px] font-black bg-slate-800 text-white px-2.5 py-1 rounded-md">Guest ➔</span>
                        </div>
                    </div>
                )}

                {/* TAB 3: REGISTER NEW ACCOUNT */}
                {authModalTab === 'register' && (
                    <form onSubmit={handleRegisterSubmit} className="space-y-2.5 text-xs">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Full Name</label>
                            <input
                                type="text"
                                value={authRegName}
                                onChange={(e) => setAuthRegName(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white text-xs"
                                placeholder="e.g. Vikram Malhotra"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Mobile Number</label>
                            <input
                                type="text"
                                value={authRegPhone}
                                onChange={(e) => setAuthRegPhone(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white text-xs"
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Email Address</label>
                            <input
                                type="email"
                                value={authRegEmail}
                                onChange={(e) => setAuthRegEmail(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white text-xs"
                                placeholder="vikram@example.com"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Password</label>
                            <input
                                type="password"
                                value={authRegPassword}
                                onChange={(e) => setAuthRegPassword(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white text-xs"
                                placeholder="••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full py-3 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md mt-2"
                        >
                            {authLoading ? 'Creating Account...' : 'Create Account & Confirm Match →'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
