import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HiArrowLeft, HiCheckCircle, HiX } from 'react-icons/hi'
import SlotGrid from '../../components/ui/SlotGrid'
import { useToast } from '../../components/ui/Toast'

const addOns = [
    { id: 1, name: 'Premium Hydration Pack (6)', price: 120 },
    { id: 2, name: 'Energy Elixir (4)', price: 200 },
    { id: 3, name: 'Pro Equipment Authorization', price: 300 },
    { id: 4, name: 'Match Recording / Drone', price: 500 },
]

const generateSlots = () => {
    const times = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']
    return times.map((t, i) => ({
        id: i, time: t, price: i >= 10 && i <= 14 ? 1200 : 800,
        status: [3, 7, 12].includes(i) ? 'booked' : 'available',
    }))
}

export default function SlotBookingPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [selectedDate, setSelectedDate] = useState('2026-03-15')
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [selectedAddOns, setSelectedAddOns] = useState([])
    const [sport, setSport] = useState('Football')
    const [isDeploying, setIsDeploying] = useState(false)
    const [bookingSuccessModal, setBookingSuccessModal] = useState(false)
    const [deploymentDetails, setDeploymentDetails] = useState(null)
    const toastContext = useToast()
    const addToast = toastContext?.addToast
    const slots = generateSlots()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const toggleAddOn = (addOnId) => {
        setSelectedAddOns(prev => prev.includes(addOnId) ? prev.filter(x => x !== addOnId) : [...prev, addOnId])
    }

    const handleConfirmAndDeploy = () => {
        if (selectedSlot === null || isDeploying) return
        setIsDeploying(true)

        setTimeout(() => {
            setIsDeploying(false)
            const details = {
                deploymentId: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
                sport,
                date: selectedDate,
                time: slots[selectedSlot]?.time,
                amount: total,
                addOnsCount: selectedAddOns.length,
            }
            setDeploymentDetails(details)
            setBookingSuccessModal(true)
            if (addToast) {
                addToast('Session slot deployment authorized successfully!', 'success')
            }
        }, 800)
    }

    const slotPrice = selectedSlot !== null ? slots[selectedSlot]?.price || 0 : 0
    const addOnTotal = selectedAddOns.reduce((sum, addOnId) => sum + (addOns.find(a => a.id === addOnId)?.price || 0), 0)
    const total = slotPrice + addOnTotal

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-16 relative">
            {/* Background Map Overlay */}
            <div className="absolute inset-x-0 top-0 h-[50vh] z-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <button
                    onClick={() => navigate(`/turfs/${id || 1}`)}
                    className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-emerald-400 transition-colors mb-8 group"
                >
                    <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    ABORT BOOKING
                </button>

                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-2">Initialize Deployment</h1>
                    <p className="text-slate-400 font-medium">Configure parameters for your upcoming session.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 xl:gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Sport & Date */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-sm shadow-2xl">
                            <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 mb-6 flex items-center gap-2">
                                <span className="h-px w-4 bg-emerald-500/50" /> PRIMARY PARAMETERS
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex-1">
                                    <label className="text-[9px] font-bold tracking-widest text-slate-500 uppercase mb-3 block">Discipline Strategy</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Cricket', 'Football'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setSport(s)}
                                                className={`px-4 py-2 rounded-sm text-xs font-bold tracking-widest uppercase transition-all cursor-pointer border ${sport === s
                                                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                                        : 'bg-slate-950/50 text-slate-400 border-white/10 hover:border-emerald-500/50 hover:text-white'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="sm:w-48">
                                    <label className="text-[9px] font-bold tracking-widest text-slate-500 uppercase mb-3 block">Deployment Date</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={e => setSelectedDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-white/10 bg-slate-950/50 rounded-sm text-sm font-medium text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Slot Grid */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-sm shadow-2xl">
                            <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 mb-2 flex items-center gap-2">
                                <span className="h-px w-4 bg-emerald-500/50" /> SELECT TIME VECTOR
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">Rates per hour • Peak surge: 16:00 - 20:00</p>

                            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8 text-[10px] font-bold tracking-widest uppercase">
                                <span className="flex items-center gap-2 text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-slate-800 border-white/20 border" /> Available</span>
                                <span className="flex items-center gap-2 text-emerald-400"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-[0_0_8px_#10b981]" /> Selected</span>
                                <span className="flex items-center gap-2 text-slate-600"><span className="w-2.5 h-2.5 rounded-sm bg-slate-900 border border-white/5" /> Booked</span>
                            </div>

                            <SlotGrid slots={slots} selectedSlot={selectedSlot} onSelect={s => setSelectedSlot(s.id)} />
                        </div>

                        {/* Add-ons */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-sm shadow-2xl">
                            <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400 mb-6 flex items-center gap-2">
                                <span className="h-px w-4 bg-emerald-500/50" /> AUTHORIZE ADD-ONS
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {addOns.map(a => {
                                    const isSelected = selectedAddOns.includes(a.id)
                                    return (
                                        <button
                                            key={a.id}
                                            onClick={() => toggleAddOn(a.id)}
                                            className={`flex justify-between items-center text-left px-4 py-4 rounded-sm border transition-all cursor-pointer ${isSelected
                                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                                    : 'border-white/10 bg-slate-950/50 hover:border-emerald-500/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                                                    {isSelected && <span className="text-slate-950 text-[10px] font-bold">✓</span>}
                                                </div>
                                                <span className={`text-[10px] font-bold tracking-wider uppercase ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>{a.name}</span>
                                            </div>
                                            <span className={`font-black tabular-nums ${isSelected ? 'text-emerald-400' : 'text-slate-300'}`}>₹{a.price}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Booking Summary */}
                    <div>
                        <div className="sticky top-28">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-b from-emerald-500/20 to-teal-500/0 rounded-sm blur" />
                                <div className="relative bg-slate-950 border border-emerald-500/20 rounded-sm p-6 sm:p-8 shadow-2xl">
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase text-white border-b border-white/10 pb-4 mb-6">FINAL AUTHORIZATION</h3>

                                    <div className="space-y-4 text-[10px] font-bold tracking-widest uppercase mb-8">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Discipline</span>
                                            <span className="text-white bg-slate-900 px-2 py-1 rounded-sm border border-white/10">{sport}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Date</span>
                                            <span className="text-white bg-slate-900 px-2 py-1 rounded-sm border border-white/10">{selectedDate}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Time Vector</span>
                                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-sm border border-emerald-500/30">
                                                {selectedSlot !== null ? slots[selectedSlot]?.time : 'AWAITING SELECTION'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Venue Fee</span>
                                            <span className="text-white text-sm tabular-nums">₹{slotPrice}</span>
                                        </div>

                                        {selectedAddOns.length > 0 && (
                                            <>
                                                <div className="h-px w-full bg-white/10 my-4" />
                                                <p className="text-emerald-500 mb-2">Authorized Add-ons</p>
                                                {selectedAddOns.map(id => {
                                                    const a = addOns.find(x => x.id === id);
                                                    return a ? (
                                                        <div key={id} className="flex justify-between items-center text-slate-400">
                                                            <span>{a.name}</span>
                                                            <span className="text-white text-sm tabular-nums text-right">₹{a.price}</span>
                                                        </div>
                                                    ) : null
                                                })}
                                            </>
                                        )}
                                    </div>

                                    <div className="h-px w-full bg-white/20 mb-6" />

                                    <div className="flex items-end justify-between mb-8">
                                        <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Total Estimate</span>
                                        <span className="font-black text-4xl text-emerald-400 tabular-nums leading-none">₹{total}</span>
                                    </div>

                                    <button
                                        onClick={handleConfirmAndDeploy}
                                        disabled={selectedSlot === null || isDeploying}
                                        className={`w-full py-4 font-black italic tracking-[0.2em] uppercase text-xs rounded-sm transition-all duration-300 ${selectedSlot === null || isDeploying
                                                ? 'bg-slate-900 text-slate-600 border border-white/5 cursor-not-allowed'
                                                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer'
                                            }`}
                                    >
                                        {isDeploying ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                                DEPLOYING SESSION...
                                            </span>
                                        ) : (
                                            'CONFIRM AND DEPLOY'
                                        )}
                                    </button>

                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center mt-6">
                                        Free cancellation up to 2 hours prior to deployment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deployment Confirmation Modal */}
            {bookingSuccessModal && deploymentDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-lg p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setBookingSuccessModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <HiX className="w-5 h-5" />
                        </button>

                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mb-4 text-emerald-400 mx-auto">
                            <HiCheckCircle className="w-8 h-8" />
                        </div>

                        <h3 className="text-xl font-black italic text-center text-white tracking-wider uppercase mb-1">
                            DEPLOYMENT CONFIRMED
                        </h3>
                        <p className="text-xs text-center text-emerald-400 font-bold uppercase tracking-widest mb-6">
                            Session Successfully Authorized
                        </p>

                        <div className="bg-slate-950/80 border border-white/10 rounded p-4 space-y-3 mb-6 text-xs font-medium">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Deployment Ref</span>
                                <span className="text-emerald-400 font-mono font-bold">{deploymentDetails.deploymentId}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Discipline</span>
                                <span className="text-white font-bold">{deploymentDetails.sport}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Date & Time</span>
                                <span className="text-white font-bold">{deploymentDetails.date} @ {deploymentDetails.time}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-400">Add-ons Selected</span>
                                <span className="text-white font-bold">{deploymentDetails.addOnsCount} Authorized</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-slate-400 font-bold uppercase">Total Amount</span>
                                <span className="text-emerald-400 text-sm font-black">₹{deploymentDetails.amount}</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    setBookingSuccessModal(false)
                                    navigate('/dashboard/customer/bookings')
                                }}
                                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black italic tracking-wider text-xs uppercase rounded transition-colors cursor-pointer text-center"
                            >
                                View My Bookings
                            </button>
                            <button
                                onClick={() => {
                                    setBookingSuccessModal(false)
                                    setSelectedSlot(null)
                                }}
                                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer text-center border border-white/10"
                            >
                                Book Another
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
