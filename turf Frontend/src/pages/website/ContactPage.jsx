import { useState, useEffect } from 'react'
import { HiMail, HiPhone, HiLocationMarker, HiPaperAirplane, HiShieldCheck, HiCheckCircle, HiX } from 'react-icons/hi'
import { useToast } from '../../components/ui/Toast'

export default function ContactPage() {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const toastContext = useToast()
    const addToast = toastContext?.addToast

    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
    const [submitting, setSubmitting] = useState(false)
    const [sentSuccessModal, setSentSuccessModal] = useState(false)
    const [sentData, setSentData] = useState(null)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (submitting) return

        if (!form.name.trim() || !form.email.trim()) {
            if (addToast) addToast('Please enter your Name and Email Address', 'error')
            return
        }

        setSubmitting(true)
        setTimeout(() => {
            setSubmitting(false)
            const details = {
                ticketId: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
                name: form.name,
                email: form.email,
                subject: form.subject || 'General Inquiry',
                message: form.message,
            }
            setSentData(details)
            setSentSuccessModal(true)
            if (addToast) {
                addToast('Your inquiry message has been sent successfully!', 'success')
            }
            setForm({ name: '', email: '', subject: '', message: '' })
        }, 800)
    }

    return (
        <div className="min-h-screen bg-[#030510] pt-[110px] pb-8 relative overflow-hidden flex flex-col justify-center">
            {/* Highly Aesthetic Mesh Gradients & Glowing Spheres */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none">
                {/* Elegant subtle dotted mesh overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:28px_28px] opacity-80" />
                
                {/* Stunning Premium Mesh Glow Blobs */}
                <div className="absolute -top-40 left-1/4 w-[750px] h-[750px] bg-gradient-to-tr from-emerald-500/10 via-indigo-500/10 to-purple-500/5 rounded-full blur-[140px] opacity-80 animate-float" />
                <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-cyan-500/10 via-indigo-600/10 to-teal-500/5 rounded-full blur-[120px] opacity-70 animate-float-delayed" />
                <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-purple-600/10 to-emerald-500/5 rounded-full blur-[130px] opacity-60" />
                
                {/* Aesthetic Floating Particles */}
                <div className="absolute top-[20%] left-[15%] w-2 h-2 rounded-full bg-emerald-400/40 blur-[2px] animate-pulse" />
                <div className="absolute bottom-[30%] right-[20%] w-3 h-3 rounded-full bg-indigo-400/40 blur-[2px] animate-pulse" style={{ animationDelay: '1.5s' }} />
                <div className="absolute top-[60%] right-[10%] w-2 h-2 rounded-full bg-cyan-400/30 blur-[2px] animate-pulse" style={{ animationDelay: '3s' }} />
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
                {/* Gorgeous Aesthetic Header */}
                <div className="text-center mb-6 relative">
                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-extrabold text-white tracking-tight uppercase relative">
                        <span className="bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">Get In Touch With SportMatrix</span>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full" />
                    </h1>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-start">
                    {/* Beautiful Frosted Glass Form Card */}
                    <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl p-5 lg:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.37)] relative overflow-hidden group transition-all duration-500 hover:border-emerald-500/30 hover:shadow-[0_0_40px_rgba(16,185,129,0.08)]">
                        {/* Top subtle color indicator line */}
                        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-400 via-indigo-500 to-cyan-400 opacity-60" />
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none" />

                        {/* Form Header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                            <h2 className="text-lg font-bold text-white tracking-tight uppercase flex items-center gap-3">
                                <span className="w-1.5 h-4 bg-gradient-to-b from-emerald-400 to-indigo-500 rounded-full" />
                                Send Us A Message
                            </h2>
                            <span className="text-[9px] font-bold text-slate-400 bg-white/[0.04] px-3 py-1 border border-white/10 rounded-full uppercase tracking-wider">
                                SECURE CHANNEL
                            </span>
                        </div>

                        <form className="space-y-3 relative z-10" onSubmit={handleSubmit}>
                            {/* Full Name */}
                            <div className="space-y-2 group/input">
                                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider ml-1 group-focus-within/input:text-emerald-400 transition-colors duration-300">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/50 rounded-xl px-3 py-2.5 text-xs font-bold text-white tracking-wide focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all duration-300 placeholder:text-slate-600 focus:placeholder:text-slate-500"
                                />
                            </div>

                            {/* Email Address */}
                            <div className="space-y-1.5 group/input">
                                <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider ml-1 group-focus-within/input:text-emerald-400 transition-colors duration-300">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="yourname@company.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/50 rounded-xl px-3 py-2.5 text-xs font-bold text-white tracking-wide focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all duration-300 placeholder:text-slate-600 focus:placeholder:text-slate-500"
                                />
                            </div>

                            {/* Subject */}
                            <div className="space-y-1.5 group/input">
                                <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider ml-1 group-focus-within/input:text-emerald-400 transition-colors duration-300">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    placeholder="How can we help you?"
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                    className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/50 rounded-xl px-3 py-2.5 text-xs font-bold text-white tracking-wide focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all duration-300 placeholder:text-slate-600 focus:placeholder:text-slate-500"
                                />
                            </div>

                            {/* Your Message */}
                            <div className="space-y-1.5 group/input">
                                <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider ml-1 group-focus-within/input:text-emerald-400 transition-colors duration-300">
                                    Your Message
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe your inquiry in detail..."
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                    className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/50 rounded-xl px-3 py-2.5 text-xs font-bold text-white tracking-wide focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all duration-300 resize-none placeholder:text-slate-600 focus:placeholder:text-slate-500"
                                />
                            </div>

                            {/* Beautiful Vibrant Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-3 bg-gradient-to-r from-emerald-500 to-indigo-500 text-slate-950 font-bold text-xs tracking-[0.2em] uppercase rounded-xl hover:opacity-95 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer group/btn relative overflow-hidden ${
                                    submitting ? 'opacity-80 cursor-wait' : ''
                                }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                        SENDING MESSAGE...
                                    </span>
                                ) : (
                                    <>
                                        <HiPaperAirplane className="w-4 h-4 rotate-90" />
                                        SEND MESSAGE
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Aesthetic Info Cards */}
                    <div className="space-y-3">
                        {[
                            { icon: <HiLocationMarker />, title: 'OUR HEADQUARTERS', details: ['Sector 24, Cyber City, BKC', 'Mumbai, MH 40051, India'], accent: 'from-emerald-400 to-teal-500 text-emerald-400' },
                            { icon: <HiMail />, title: 'EMAIL INQUIRIES', details: ['support@sportmatrix.com', 'operations@sportmatrix.com'], accent: 'from-amber-400 to-orange-500 text-amber-400' },
                            { icon: <HiPhone />, title: 'DIRECT PHONE HOTLINE', details: ['+91 (022) 2890-5000', '1800-SPORT-MATRIX'], accent: 'from-cyan-400 to-blue-500 text-cyan-400' },
                            { icon: <HiShieldCheck />, title: 'OPERATING HOURS', details: ['MON-FRI: 09:00 AM - 06:00 PM IST', 'SAT: 10:00 AM - 02:00 PM IST'], accent: 'from-slate-400 to-slate-500 text-slate-300' },
                        ].map((c, i) => (
                            <div key={i} className="group bg-white/[0.02] backdrop-blur-3xl border border-white/10 hover:border-emerald-500/30 p-4 rounded-3xl transition-all duration-300 flex items-center gap-5 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(16,185,129,0.06)]">
                                {/* Sweep glow overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                                {/* Icon container with gradient ring */}
                                <div className={`relative flex items-center justify-center w-14 h-14 shrink-0 rounded-2xl bg-slate-950 border border-white/10 transition-all duration-300 group-hover:scale-105 shadow-md`}>
                                    <div className={`text-xl bg-gradient-to-br ${c.accent} bg-clip-text text-transparent`}>
                                        {c.icon}
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl bg-white/[0.02]" />
                                </div>
                                
                                <div className="relative z-10">
                                    <h3 className="text-xs font-bold text-white tracking-tight uppercase mb-1 group-hover:text-emerald-400 transition-colors duration-300">{c.title}</h3>
                                    {c.details.map(d => (
                                        <p key={d} className="text-[10px] font-semibold text-slate-400 tracking-wide mb-0.5 group-hover:text-slate-300 transition-colors duration-300">{d}</p>
                                    ))}
                                </div>
                            </div>
                        ))}


                    </div>
                </div>
            </div>

            {/* Message Sent Confirmation Modal */}
            {sentSuccessModal && sentData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
                        <button
                            onClick={() => setSentSuccessModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <HiX className="w-5 h-5" />
                        </button>

                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-4 shadow-xl mx-auto">
                            <HiCheckCircle className="w-9 h-9" />
                        </div>

                        <h3 className="text-xl font-black italic text-center text-white tracking-wider uppercase mb-1">
                            MESSAGE TRANSMITTED
                        </h3>
                        <p className="text-xs text-center text-emerald-400 font-bold uppercase tracking-widest mb-6">
                            Inquiry Received By SportMatrix
                        </p>

                        <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4 space-y-3 mb-6 text-xs font-medium">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Ticket Ref</span>
                                <span className="text-emerald-400 font-mono font-bold">{sentData.ticketId}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Sender</span>
                                <span className="text-white font-bold">{sentData.name}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Email</span>
                                <span className="text-white font-bold">{sentData.email}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Subject</span>
                                <span className="text-white font-bold">{sentData.subject}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-slate-400 font-bold uppercase">Status</span>
                                <span className="text-emerald-400 text-xs font-black uppercase">QUEUED FOR SUPPORT</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSentSuccessModal(false)}
                            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-indigo-500 hover:from-emerald-400 hover:to-indigo-400 text-slate-950 font-black italic tracking-wider text-xs uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer text-center"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
