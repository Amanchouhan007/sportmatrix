import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { HiArrowLeft } from 'react-icons/hi'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function RegisterPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', otp: '', step: 1 })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (form.step === 1) {
            setForm({ ...form, step: 2 })
        } else {
            navigate('/customer')
        }
    }

    return (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center p-8 relative">
            {/* Back to Home Button */}
            <Link 
                to="/" 
                className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs tracking-wide transition-all z-50 shadow-sm group"
            >
                <HiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-emerald-600" />
                <span>Back to Home</span>
            </Link>
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-white text-lg">SM</div>
                    <span className="text-lg font-bold text-surface-900">SportMatrix</span>
                </div>
                <h2 className="text-2xl font-bold text-surface-900 mb-1">Create your account</h2>
                <p className="text-surface-500 text-sm mb-8">Start managing your sports facility today</p>

                {form.step === 1 ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input label="Full Name" id="name" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <Input label="Email" id="email" type="email" placeholder="name@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        <Input label="Phone" id="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        <Input label="Password" id="password" type="password" placeholder="Create a password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        <Button type="submit" fullWidth size="lg">Continue</Button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="text-center p-5 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4">
                            <p className="text-xs text-emerald-800 font-medium">We simulated sending a verification code to</p>
                            <p className="font-extrabold text-slate-900 text-base mt-1 font-mono">{form.phone || '+91 98765 43210'}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-300">
                                💡 Demo Mode Active: Use OTP <strong className="font-mono">1234</strong> or any 4 digits!
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">Enter OTP</label>
                            <div className="flex gap-3 justify-center">
                                {[0, 1, 2, 3].map((i) => (
                                    <input key={i} maxLength={1} defaultValue={i + 1} className="w-14 h-14 text-center text-xl font-bold rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-surface-900" />
                                ))}
                            </div>
                        </div>
                        <Button type="submit" fullWidth size="lg">Verify & Create Account</Button>
                        <p className="text-center text-sm text-surface-400">Didn&apos;t receive? <button type="button" onClick={() => alert('Demo Mode: Use OTP 1234')} className="text-primary-600 font-medium cursor-pointer">Resend OTP (Use 1234)</button></p>
                    </form>
                )}

                <p className="text-center text-sm text-surface-500 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    )
}
