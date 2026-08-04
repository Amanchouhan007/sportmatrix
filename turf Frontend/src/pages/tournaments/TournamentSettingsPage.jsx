import { useState } from 'react'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { HiAdjustments, HiCheck } from 'react-icons/hi'

export default function TournamentSettingsPage() {
    const { addToast } = useToast()

    const [settings, setSettings] = useState({
        platformCommissionPercentage: '10',
        autoLockSlots: true,
        allowStaffCreate: true,
        notifyOnApproval: true
    })

    const handleSave = (e) => {
        e.preventDefault()
        addToast({ title: 'Settings Saved', message: 'Tournament settings updated successfully.', type: 'success' })
    }

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        <HiAdjustments className="text-primary-600" /> Tournament System Settings
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Configure platform commission rules, automated slot locking, and approval rules</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <Card className="p-6 space-y-6">
                    <h2 className="text-base font-extrabold text-surface-900 border-b border-surface-100 pb-3">
                        Commission & System Rules
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Platform Commission Percentage (%)"
                            type="number"
                            placeholder="10"
                            value={settings.platformCommissionPercentage}
                            onChange={(e) => setSettings({ ...settings, platformCommissionPercentage: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.autoLockSlots}
                                onChange={(e) => setSettings({ ...settings, autoLockSlots: e.target.checked })}
                                className="w-5 h-5 accent-primary-600 rounded cursor-pointer"
                            />
                            <div>
                                <div className="font-extrabold text-surface-900 text-sm">Automatic Slot Reservation</div>
                                <div className="text-xs text-surface-500">Automatically block turf slots on approval so normal customers cannot book them.</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.allowStaffCreate}
                                onChange={(e) => setSettings({ ...settings, allowStaffCreate: e.target.checked })}
                                className="w-5 h-5 accent-primary-600 rounded cursor-pointer"
                            />
                            <div>
                                <div className="font-extrabold text-surface-900 text-sm">Allow Staff Tournament Creation</div>
                                <div className="text-xs text-surface-500">Staff can create tournaments which require Owner approval.</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.notifyOnApproval}
                                onChange={(e) => setSettings({ ...settings, notifyOnApproval: e.target.checked })}
                                className="w-5 h-5 accent-primary-600 rounded cursor-pointer"
                            />
                            <div>
                                <div className="font-extrabold text-surface-900 text-sm">Automated Approval Notifications</div>
                                <div className="text-xs text-surface-500">Send in-app notifications when a tournament is approved or rejected.</div>
                            </div>
                        </label>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-surface-100">
                        <Button type="submit">
                            <HiCheck className="w-4 h-4 mr-1" /> Save Settings
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    )
}
