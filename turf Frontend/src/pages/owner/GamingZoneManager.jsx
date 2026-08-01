import { useState, useEffect } from 'react'
import { HiLightningBolt, HiUsers, HiCurrencyRupee, HiDesktopComputer, HiPlay, HiClock, HiPlus, HiStop, HiAdjustments } from 'react-icons/hi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'

const initialDevices = [
    { id: 'PC-01', name: 'RTX 4090 Elite PC 1', type: 'PC', rate: 150, status: 'Active', player: 'Amit Verma', game: 'Valorant', timeRemaining: 34, maxTime: 120 },
    { id: 'PC-02', name: 'RTX 4090 Elite PC 2', type: 'PC', rate: 150, status: 'Active', player: 'Rajesh K.', game: 'Cyberpunk 2077', timeRemaining: 78, maxTime: 180 },
    { id: 'PS5-01', name: 'PlayStation 5 Console 1', type: 'Console', rate: 120, status: 'Active', player: 'Karan Shah', game: 'FIFA 24', timeRemaining: 12, maxTime: 60 },
    { id: 'PS5-02', name: 'PlayStation 5 Console 2', type: 'Console', rate: 120, status: 'Idle', player: '', game: '', timeRemaining: 0, maxTime: 0 },
    { id: 'VR-01', name: 'Meta Quest 3 VR Pod 1', type: 'VR', rate: 250, status: 'Active', player: 'Sneha Patel', game: 'Beat Saber', timeRemaining: 45, maxTime: 90 },
    { id: 'VR-02', name: 'Meta Quest 3 VR Pod 2', type: 'VR', rate: 250, status: 'Maintenance', player: '', game: '', timeRemaining: 0, maxTime: 0 },
]

export default function GamingZoneManager() {
    const { addToast } = useToast()
    const [devices, setDevices] = useState(initialDevices)
    const [modal, setModal] = useState(false)
    const [selectedDevice, setSelectedDevice] = useState(null)
    
    // Form state for starting session
    const [sessionData, setSessionData] = useState({
        player: '',
        game: 'EA FC 24',
        duration: '60'
    })

    // Simulated Timer Countdown
    useEffect(() => {
        const interval = setInterval(() => {
            setDevices(prev => prev.map(dev => {
                if (dev.status === 'Active' && dev.timeRemaining > 0) {
                    return { ...dev, timeRemaining: dev.timeRemaining - 1 }
                } else if (dev.status === 'Active' && dev.timeRemaining === 0) {
                    // Session finished
                    return { ...dev, status: 'Idle', player: '', game: '', timeRemaining: 0, maxTime: 0 }
                }
                return dev
            }))
        }, 60000) // update every minute
        return () => clearInterval(interval)
    }, [])

    const handleOpenSessionModal = (device) => {
        setSelectedDevice(device)
        setSessionData({ player: '', game: 'EA FC 24', duration: '60' })
        setModal(true)
    }

    const handleStartSession = () => {
        if (!sessionData.player) {
            addToast({ title: 'Player Name Required', message: 'Please enter customer name to register session', type: 'error' })
            return
        }

        setDevices(devices.map(d => {
            if (d.id === selectedDevice.id) {
                return {
                    ...d,
                    status: 'Active',
                    player: sessionData.player,
                    game: sessionData.game,
                    timeRemaining: Number(sessionData.duration),
                    maxTime: Number(sessionData.duration)
                }
            }
            return d
        }))

        setModal(false)
        addToast({ title: 'Session Started', message: `Device ${selectedDevice.id} assigned to ${sessionData.player}`, type: 'success' })
    }

    const handleEndSession = (id) => {
        setDevices(devices.map(d => {
            if (d.id === id) {
                return { ...d, status: 'Idle', player: '', game: '', timeRemaining: 0, maxTime: 0 }
            }
            return d
        }))
        addToast({ title: 'Session Ended', message: `Session for device ${id} has been manually cleared`, type: 'info' })
    }

    const handleToggleMaintenance = (id) => {
        setDevices(devices.map(d => {
            if (d.id === id) {
                return { ...d, status: d.status === 'Maintenance' ? 'Idle' : 'Maintenance', player: '', game: '', timeRemaining: 0 }
            }
            return d
        }))
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Cinematic Header Block */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 to-slate-900 p-6 rounded-3xl border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full" />
                <div className="relative z-10">
                    <h1 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-2">
                        <HiLightningBolt className="text-purple-400 animate-bounce" /> GAMING ZONE HQ
                    </h1>
                    <p className="text-purple-200/60 text-sm font-semibold mt-0.5">Real-time control station for premium gaming rigs & VR pods</p>
                </div>
                <div className="flex gap-3 relative z-10">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-950/50 border border-purple-500/20 text-xs font-bold text-purple-300">
                        <HiDesktopComputer className="w-4 h-4 text-cyan-400" />
                        <span>System Latency: <span className="text-emerald-400">4ms (Stable)</span></span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft group hover:shadow-soft-md transition-all">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Active Sessions</p>
                            <h3 className="text-3xl font-extrabold text-surface-900">4 / 6</h3>
                            <span className="text-xs font-bold text-purple-600 block">66% Live Occupancy</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-md">
                            <HiPlay className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft group hover:shadow-soft-md transition-all">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Hourly Rates</p>
                            <h3 className="text-3xl font-extrabold text-surface-900">₹120 - 250</h3>
                            <span className="text-xs font-bold text-surface-400 block">Based on Rig category</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-600 shadow-md">
                            <HiDesktopComputer className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft group hover:shadow-soft-md transition-all">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Today's Revenue</p>
                            <h3 className="text-3xl font-extrabold text-surface-900">₹4,250</h3>
                            <span className="text-xs font-bold text-emerald-500 block">↑ +24% vs yesterday</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-md">
                            <HiCurrencyRupee className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft group hover:shadow-soft-md transition-all">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Maint. Alerts</p>
                            <h3 className="text-3xl font-extrabold text-red-500">1</h3>
                            <span className="text-xs font-bold text-surface-400 block">Meta Quest VR Pod 2</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-500 shadow-md">
                            <span>🛠️</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Devices Live Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => {
                    const pct = device.maxTime ? Math.round((device.timeRemaining / device.maxTime) * 100) : 0
                    return (
                        <div key={device.id} className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft hover:shadow-soft-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-80">
                            {/* Decorative Type tag */}
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 text-xs font-extrabold uppercase tracking-wider bg-surface-100 text-surface-600 rounded-xl">
                                    {device.type} Rig
                                </span>
                                <Badge 
                                    variant={device.status === 'Active' ? 'success' : device.status === 'Maintenance' ? 'danger' : 'default'} 
                                    dot
                                >
                                    {device.status}
                                </Badge>
                            </div>

                            {/* Device Info */}
                            <div>
                                <h3 className="text-lg font-black text-surface-900 tracking-tight leading-tight">{device.name}</h3>
                                <p className="text-xs text-surface-400 font-bold mt-1">Setup rate: ₹{device.rate}/hour</p>
                            </div>

                            {/* Active Session metrics */}
                            {device.status === 'Active' ? (
                                <div className="mt-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-surface-550 font-bold">Player: <span className="text-purple-600 font-extrabold">{device.player}</span></span>
                                        <span className="text-surface-500 font-semibold italic">{device.game}</span>
                                    </div>
                                    {/* Custom Progress Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] text-purple-600 font-extrabold uppercase">
                                            <span>Progress</span>
                                            <span>{device.timeRemaining} min left</span>
                                        </div>
                                        <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 p-4 bg-surface-50 rounded-2xl border border-dashed border-surface-200/80 flex items-center justify-center h-20 text-center text-xs text-surface-450 font-semibold italic">
                                    {device.status === 'Maintenance' ? '⚠️ Under mechanical inspection' : '💤 Station is currently idle'}
                                </div>
                            )}

                            {/* Rig actions footer */}
                            <div className="flex items-center justify-between gap-3 mt-6">
                                {device.status === 'Active' ? (
                                    <Button onClick={() => handleEndSession(device.id)} variant="danger" fullWidth className="cursor-pointer">
                                        <HiStop className="mr-1.5 w-4 h-4" /> End Session
                                    </Button>
                                ) : device.status === 'Maintenance' ? (
                                    <Button onClick={() => handleToggleMaintenance(device.id)} variant="outline" fullWidth className="cursor-pointer">
                                        Activate Rig
                                    </Button>
                                ) : (
                                    <Button onClick={() => handleOpenSessionModal(device)} fullWidth className="bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/10 cursor-pointer">
                                        <HiPlay className="mr-1.5 w-4 h-4" /> Start Session
                                    </Button>
                                )}
                                
                                {device.status !== 'Active' && (
                                    <button 
                                        onClick={() => handleToggleMaintenance(device.id)} 
                                        title="Toggle Maintenance Mode"
                                        className="p-3 rounded-2xl border border-surface-200 hover:bg-surface-50 text-surface-500 hover:text-surface-700 cursor-pointer transition-colors"
                                    >
                                        <HiAdjustments className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Launch session modal */}
            {selectedDevice && (
                <Modal isOpen={modal} onClose={() => setModal(false)} title={`Initiate Session — ${selectedDevice.id}`} size="md">
                    <div className="space-y-4">
                        <Input 
                            label="Customer / Player Name" 
                            placeholder="e.g. Amit Verma" 
                            value={sessionData.player}
                            onChange={(e) => setSessionData({ ...sessionData, player: e.target.value })}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Select 
                                label="Select Game" 
                                value={sessionData.game}
                                onChange={(e) => setSessionData({ ...sessionData, game: e.target.value })}
                                options={[
                                    { value: 'EA FC 24', label: 'EA FC 24' },
                                    { value: 'Valorant', label: 'Valorant' },
                                    { value: 'GTA V', label: 'GTA V' },
                                    { value: 'Cyberpunk 2077', label: 'Cyberpunk 2077' },
                                    { value: 'Beat Saber VR', label: 'Beat Saber VR' }
                                ]}
                            />

                            <Select 
                                label="Session Duration" 
                                value={sessionData.duration}
                                onChange={(e) => setSessionData({ ...sessionData, duration: e.target.value })}
                                options={[
                                    { value: '30', label: '30 Minutes' },
                                    { value: '60', label: '1 Hour' },
                                    { value: '120', label: '2 Hours' },
                                    { value: '180', label: '3 Hours' },
                                ]}
                            />
                        </div>

                        <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 text-xs text-purple-700 space-y-1">
                            <p className="font-extrabold uppercase">Fare Estimate</p>
                            <p className="text-sm font-black">₹{Math.round((Number(sessionData.duration) / 60) * selectedDevice.rate)} total pricing due at check-out.</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
                            <Button onClick={handleStartSession} className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer">
                                Start Session
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
