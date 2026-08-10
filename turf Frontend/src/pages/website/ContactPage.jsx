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
        <div className="min-h-screen bg-white text-[#111827] pt-[100px] md:pt-[110px] pb-16 relative overflow-hidden flex flex-col justify-center">
            {/* Ambient background glows */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#C8FF2E]/10 blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#16A34A]/5 blur-[120px] rounded-full pointer-events-none" />
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-8 relative">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111827] tracking-tight uppercase relative inline-block">
                        <span>Get In Touch With SportMatrix</span>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#16A34A] rounded-full" />
                    </h1>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto items-start">
                    {/* Form Card */}
                    <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] relative overflow-hidden group transition-all duration-300 hover:border-[#C8FF2E]">
                        {/* Top subtle color indicator line */}
                        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#16A34A] via-[#C8FF2E] to-[#16A34A]" />

                        {/* Form Header */}
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3.5 mb-5">
                            <h2 className="text-lg font-black text-[#111827] tracking-tight uppercase flex items-center gap-3">
                                <span className="w-1.5 h-4 bg-[#16A34A] rounded-full" />
                                Send Us A Message
                            </h2>
                            <span className="text-[10px] font-black text-[#16A34A] bg-[#F7F9FC] px-3 py-1 border border-[#E5E7EB] rounded-full uppercase tracking-wider shadow-xs">
                                SECURE CHANNEL
                            </span>
                        </div>

                        <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider ml-0.5">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-[#F7F9FC] border border-[#E5E7EB] focus:border-[#C8FF2E] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#111827] tracking-wide focus:outline-none placeholder:text-[#6B7280]"
                                />
                            </div>

                            {/* Email Address */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider ml-0.5">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    placeholder="yourname@company.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full bg-[#F7F9FC] border border-[#E5E7EB] focus:border-[#C8FF2E] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#111827] tracking-wide focus:outline-none placeholder:text-[#6B7280]"
                                />
                            </div>

                            {/* Subject */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider ml-0.5">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    placeholder="How can we help you?"
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                    className="w-full bg-[#F7F9FC] border border-[#E5E7EB] focus:border-[#C8FF2E] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#111827] tracking-wide focus:outline-none placeholder:text-[#6B7280]"
                                />
                            </div>

                            {/* Your Message */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider ml-0.5">
                                    Your Message
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe your inquiry in detail..."
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                    className="w-full bg-[#F7F9FC] border border-[#E5E7EB] focus:border-[#C8FF2E] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#111827] tracking-wide focus:outline-none resize-none placeholder:text-[#6B7280]"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-3.5 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] border border-[#B5F000] font-black text-xs tracking-wider uppercase rounded-xl transition-all duration-300 shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                                    submitting ? 'opacity-80 cursor-wait' : ''
                                }`}
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
                                        SENDING MESSAGE...
                                    </span>
                                ) : (
                                    <>
                                        <HiPaperAirplane className="w-4 h-4 rotate-90 text-[#16A34A]" />
                                        SEND MESSAGE
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Info Cards */}
                    <div className="space-y-4">
                        {[
                            { icon: <HiLocationMarker />, title: 'OUR HEADQUARTERS', details: ['Sector 24, Cyber City, BKC', 'Mumbai, MH 40051, India'] },
                            { icon: <HiMail />, title: 'EMAIL INQUIRIES', details: ['support@sportmatrix.com', 'operations@sportmatrix.com'] },
                            { icon: <HiPhone />, title: 'DIRECT PHONE HOTLINE', details: ['+91 (022) 2890-5000', '1800-SPORT-MATRIX'] },
                            { icon: <HiShieldCheck />, title: 'OPERATING HOURS', details: ['MON-FRI: 09:00 AM - 06:00 PM IST', 'SAT: 10:00 AM - 02:00 PM IST'] },
                        ].map((c, i) => (
                            <div key={i} className="group bg-white border border-[#E5E7EB] hover:border-[#C8FF2E] p-4 sm:p-5 rounded-3xl transition-all duration-300 flex items-center gap-4 shadow-[0_8px_25px_rgba(0,0,0,0.02)] hover:-translate-y-0.5">
                                {/* Icon container */}
                                <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-2xl bg-[#F7F9FC] border border-[#E5E7EB] text-[#16A34A] text-xl font-black shadow-xs">
                                    {c.icon}
                                </div>
                                
                                <div>
                                    <h3 className="text-xs font-black text-[#111827] tracking-tight uppercase mb-0.5">{c.title}</h3>
                                    {c.details.map(d => (
                                        <p key={d} className="text-xs font-bold text-[#6B7280] tracking-wide mb-0.5">{d}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Message Sent Confirmation Modal */}
            {sentSuccessModal && sentData && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-[#111827]">
                        <button
                            onClick={() => setSentSuccessModal(false)}
                            className="absolute top-4 right-4 text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
                        >
                            <HiX className="w-5 h-5" />
                        </button>

                        <div className="w-14 h-14 rounded-2xl bg-[#C8FF2E] border border-[#B5F000] flex items-center justify-center text-[#16A34A] mb-4 shadow-md mx-auto">
                            <HiCheckCircle className="w-9 h-9" />
                        </div>

                        <h3 className="text-xl font-black text-center text-[#111827] tracking-tight uppercase mb-1">
                            MESSAGE TRANSMITTED
                        </h3>
                        <p className="text-xs text-center text-[#16A34A] font-black uppercase tracking-wider mb-6">
                            Inquiry Received By SportMatrix
                        </p>

                        <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl p-4 space-y-3 mb-6 text-xs font-bold">
                            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                                <span className="text-[#6B7280]">Ticket Ref</span>
                                <span className="text-[#16A34A] font-mono font-bold">{sentData.ticketId}</span>
                            </div>
                            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                                <span className="text-[#6B7280]">Sender</span>
                                <span className="text-[#111827] font-bold">{sentData.name}</span>
                            </div>
                            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                                <span className="text-[#6B7280]">Email</span>
                                <span className="text-[#111827] font-bold">{sentData.email}</span>
                            </div>
                            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                                <span className="text-[#6B7280]">Subject</span>
                                <span className="text-[#111827] font-bold">{sentData.subject}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-[#6B7280] font-bold uppercase">Status</span>
                                <span className="text-[#16A34A] text-xs font-black uppercase">QUEUED FOR SUPPORT</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSentSuccessModal(false)}
                            className="w-full py-3 px-4 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black tracking-wider text-xs uppercase rounded-xl transition-all border border-[#B5F000] shadow-sm cursor-pointer text-center active:scale-95"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
