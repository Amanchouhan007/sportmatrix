import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiCheck, HiStar, HiLightningBolt, HiFire, HiShieldCheck, HiX, HiCheckCircle } from 'react-icons/hi'
import { useToast } from '../../components/ui/Toast'

const plans = [
    {
        name: '7-Day Free Trial',
        price: '0',
        period: '/7 DAYS',
        desc: 'NO CREDIT CARD REQUIRED',
        color: 'from-slate-500 to-slate-700',
        accent: 'slate',
        features: ['Full platform access for 7 days', 'Book up to 1 field / court', 'Join 1 open tournament free', 'Standard customer service', 'Basic booking analytics dashboard']
    },
    {
        name: 'Basic Plan',
        price: '499',
        period: '/MO',
        desc: 'RECOMMENDED FOR REGULARS',
        color: 'from-blue-500 to-indigo-600',
        accent: 'blue',
        features: ['10 Field Bookings / Month', 'Squad / Team Authorization', 'Tournament entry access', 'Priority customer service', 'Advanced performance analytics']
    },
    {
        name: 'Premium Plan',
        price: '1,499',
        period: '/MO',
        desc: 'ELITE UNLIMITED OPERATIONS',
        color: 'from-[#16a34a] to-emerald-600',
        accent: 'emerald',
        popular: true,
        features: ['Unlimited Tactical Bookings', 'Full Arena & Court Access', '24/7 VIP Dedicated Link', 'Private Tournament Hosting', '1 Free entry to all local tourneys', 'Elite dashboard metrics']
    },
]

export default function MembershipPage() {
    const navigate = useNavigate()
    const toastContext = useToast()
    const addToast = toastContext?.addToast

    const [loadingPlan, setLoadingPlan] = useState(null)
    const [activeModalPlan, setActiveModalPlan] = useState(null)
    const [subDetails, setSubDetails] = useState(null)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const handlePlanSelect = (p) => {
        setLoadingPlan(p.name)
        setTimeout(() => {
            setLoadingPlan(null)
            const details = {
                subId: `SUB-${Math.floor(100000 + Math.random() * 900000)}`,
                planName: p.name,
                price: p.price,
                period: p.period,
                accent: p.accent,
            }
            setSubDetails(details)
            setActiveModalPlan(p)
            if (addToast) {
                addToast(`${p.name} authorized & activated successfully!`, 'success')
            }
        }, 800)
    }

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-20 relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute inset-x-0 top-0 h-[60vh] z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-950/90 to-slate-950" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-emerald-500/5 rounded-full blur-[160px]" />
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full mb-3">
                        <HiFire className="w-3 h-3 text-amber-500" />
                        <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase">Membership Protocols</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg">MEMBERSHIP ACCESS PLANS</h1>
                </div>

                {/* Pricing Grid */}
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
                    {plans.map(p => (
                        <div
                            key={p.name}
                            className={`relative group flex flex-col bg-slate-900 border transition-all duration-500 hover:-translate-y-1 rounded-2xl h-full ${p.popular
                                ? 'border-[#16a34a]/40 shadow-[0_15px_35px_rgba(0,0,0,0.5),0_0_15px_rgba(22,163,74,0.1)] z-20'
                                : 'border-white/10 hover:border-white/20'
                                }`}
                        >
                            {p.popular && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30">
                                    <span className="bg-[#16a34a] text-white text-[9px] font-black px-3.5 py-1 rounded-full shadow-[0_0_15px_rgba(22,163,74,0.3)] tracking-widest uppercase italic">
                                        MOST POPULAR
                                    </span>
                                </div>
                            )}

                            <div className="p-5 pb-0">
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-4 shadow-xl`}>
                                    {p.accent === 'slate' ? <HiShieldCheck className="w-6 h-6" /> : p.accent === 'blue' ? <HiStar className="w-6 h-6" /> : <HiLightningBolt className="w-6 h-6" />}
                                </div>
                                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-0.5">{p.name}</h3>
                                <p className="text-[9px] font-bold text-slate-500 tracking-[0.2em] mb-4">{p.desc}</p>
                                <div className="flex items-baseline gap-1 mb-4 pb-4 border-b border-white/5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">INR</span>
                                    <span className="text-4xl font-black text-white tabular-nums tracking-tighter">{p.price}</span>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{p.period}</span>
                                </div>
                            </div>

                            <div className="px-5 pb-5 flex-1">
                                <ul className="space-y-2 mb-6">
                                    {p.features.map(f => (
                                        <li key={f} className="flex items-start gap-2.5 group/item">
                                            <HiCheck className={`w-3.5 h-3.5 mt-0.5 shrink-0 transition-colors ${p.popular ? 'text-[#16a34a]' : 'text-slate-600 group-hover/item:text-white'}`} />
                                            <span className="text-[11px] font-semibold text-slate-400 group-hover/item:text-slate-200 transition-colors uppercase tracking-wide">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-5 pt-0">
                                <button
                                    onClick={() => handlePlanSelect(p)}
                                    disabled={loadingPlan !== null}
                                    className={`w-full py-3 text-[10px] font-black italic tracking-[0.2em] uppercase rounded-xl border transition-all duration-300 cursor-pointer ${
                                        p.accent === 'slate'
                                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                            : p.accent === 'blue'
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500/20 text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                                : 'bg-gradient-to-r from-emerald-500 to-[#16a34a] border-emerald-500/20 text-white hover:from-emerald-400 hover:to-green-500 hover:shadow-[0_0_20px_rgba(22,163,74,0.3)]'
                                    } ${loadingPlan === p.name ? 'opacity-80 cursor-wait' : ''}`}
                                >
                                    {loadingPlan === p.name ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            AUTHORIZING...
                                        </span>
                                    ) : p.price === '0' ? (
                                        'START FREE TRIAL'
                                    ) : (
                                        `AUTHORIZE ${p.name}`
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tactical comparison Table */}
                <div className="max-w-5xl mx-auto">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/10 bg-slate-950/50">
                            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-[#16a34a] rounded-full" />
                                FEATURESETS COMPARISON
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-950/30">
                                        <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">FEATURESET</th>
                                        <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 text-center">FREE TRIAL</th>
                                        <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 text-center">BASIC</th>
                                        <th className="py-5 px-8 text-[10px] font-black text-[#16a34a] uppercase tracking-widest border-b border-white/5 text-center bg-emerald-500/5">PREMIUM</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs font-bold uppercase tracking-wider">
                                    {[
                                        { f: 'Field Bookings / MO', b: '01 (Trial)', s: '10 Bookings', g: 'UNLIMITED' },
                                        { f: 'Squad Authorization', b: '---', s: '✓', g: '✓' },
                                        { f: 'Tournament Access', b: '1 Tourney', s: 'Yes', g: 'Yes + Free Entry' },
                                        { f: 'Performance Analytics', b: 'Basic', s: 'Advanced', g: 'Full Suite' },
                                        { f: 'Dedicated Support', b: 'Standard', s: 'Priority', g: '24/7 VIP' },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors border-b border-white/5 group">
                                            <td className="py-5 px-8 text-slate-400 group-hover:text-white">{row.f}</td>
                                            <td className="py-5 px-8 text-center text-slate-600">{row.b}</td>
                                            <td className="py-5 px-8 text-center text-slate-400">{row.s}</td>
                                            <td className="py-5 px-8 text-center text-[#16a34a] bg-emerald-500/5">{row.g}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscription Success Modal */}
            {activeModalPlan && subDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
                        <button
                            onClick={() => setActiveModalPlan(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <HiX className="w-5 h-5" />
                        </button>

                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeModalPlan.color} flex items-center justify-center text-white mb-4 shadow-xl mx-auto`}>
                            <HiCheckCircle className="w-9 h-9" />
                        </div>

                        <h3 className="text-xl font-black italic text-center text-white tracking-wider uppercase mb-1">
                            PLAN AUTHORIZED
                        </h3>
                        <p className="text-xs text-center text-emerald-400 font-bold uppercase tracking-widest mb-6">
                            {activeModalPlan.name} Active
                        </p>

                        <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4 space-y-3 mb-6 text-xs font-medium">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Subscription Ref</span>
                                <span className="text-emerald-400 font-mono font-bold">{subDetails.subId}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Selected Plan</span>
                                <span className="text-white font-bold">{subDetails.planName}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Billing Amount</span>
                                <span className="text-white font-bold">INR {subDetails.price} {subDetails.period}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-slate-400 font-bold uppercase">Membership Status</span>
                                <span className="text-emerald-400 text-xs font-black uppercase">ACTIVE</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    setActiveModalPlan(null)
                                    navigate('/customer')
                                }}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-[#16a34a] hover:from-emerald-400 hover:to-green-500 text-white font-black italic tracking-wider text-xs uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(22,163,74,0.3)] cursor-pointer text-center"
                            >
                                Go To Dashboard
                            </button>
                            <button
                                onClick={() => setActiveModalPlan(null)}
                                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center border border-white/10"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
