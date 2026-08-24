import { useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { getProfile, updateProfile, changePassword } from '../../services/authService'

const EMPTY_PROFILE = { fullName: '', email: '', phone: '' }

export default function CustomerProfile() {
    const { addToast } = useToast()
    const [activeTab, setActiveTab] = useState('personal') // 'personal' | 'sports' | 'security'
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    // Personal Info State -- loaded from the real logged-in user's account
    const [savedProfile, setSavedProfile] = useState(EMPTY_PROFILE)
    const [formData, setFormData] = useState(EMPTY_PROFILE)

    // Sports Preferences State -- local UI preference only, no backend model exists for this yet
    const [sports, setSports] = useState(() => {
        const saved = localStorage.getItem('customer_sports')
        return saved ? JSON.parse(saved) : []
    })
    const [newSport, setNewSport] = useState('')
    const [isAddingSport, setIsAddingSport] = useState(false)

    // Password State
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true)
            try {
                const data = await getProfile()
                const mapped = {
                    fullName: data.name || data.fullName || '',
                    email: data.email || '',
                    phone: data.mobile || data.phone || ''
                }
                setSavedProfile(mapped)
                setFormData(mapped)
            } catch (err) {
                addToast({ title: 'Load Failed', message: err.message || 'Failed to load your profile.', type: 'error' })
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    }, [addToast])

    useEffect(() => {
        localStorage.setItem('customer_sports', JSON.stringify(sports))
    }, [sports])

    // Handlers
    const handleUpdateProfile = async () => {
        setIsSaving(true)
        try {
            await updateProfile({ name: formData.fullName, mobile: formData.phone })
            setSavedProfile(formData)
            addToast({ title: 'Profile Updated', message: 'Your personal information has been saved.', type: 'success' })
        } catch (err) {
            addToast({ title: 'Update Failed', message: err.message || 'Could not save your profile.', type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleAddSport = () => {
        if (newSport.trim() && !sports.includes(newSport.trim())) {
            setSports([...sports, newSport.trim()])
            setNewSport('')
            setIsAddingSport(false)
        }
    }

    const handleRemoveSport = (sportToRemove) => {
        setSports(sports.filter(s => s !== sportToRemove))
    }

    const handleUpdatePassword = async () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            addToast({ title: 'Missing Fields', message: 'Please fill in all password fields.', type: 'error' })
            return
        }
        if (passwords.new !== passwords.confirm) {
            addToast({ title: 'Mismatch', message: 'New password and confirm password do not match.', type: 'error' })
            return
        }
        setIsChangingPassword(true)
        try {
            await changePassword({ currentPassword: passwords.current, newPassword: passwords.new })
            setPasswords({ current: '', new: '', confirm: '' })
            addToast({ title: 'Password Updated', message: 'Your password has been changed successfully.', type: 'success' })
        } catch (err) {
            addToast({ title: 'Update Failed', message: err.message || 'Could not change your password.', type: 'error' })
        } finally {
            setIsChangingPassword(false)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Title Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>👤</span> My Profile
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-0.5">
                        Manage your account details, sport preferences, and password.
                    </p>
                </div>

                {/* Sub Header Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'personal', label: 'Profile Info' },
                        { id: 'sports', label: 'Sports' },
                        { id: 'security', label: 'Security' },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                                activeTab === t.id
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Identity Banner */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl">
                <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-500/20 shrink-0">
                        {isLoading ? '…' : (savedProfile.fullName.charAt(0).toUpperCase() || '?')}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white">{isLoading ? 'Loading...' : savedProfile.fullName}</h2>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">{savedProfile.email}</p>
                    </div>
                </div>
            </div>

            {/* TAB 1: PERSONAL INFO */}
            {activeTab === 'personal' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 max-w-2xl animate-in fade-in duration-200">
                    <h3 className="font-black text-lg text-slate-900">Personal Information</h3>
                    {isLoading ? (
                        <div className="py-6 text-center text-slate-400 text-sm font-semibold">Loading profile...</div>
                    ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                readOnly
                                className="bg-slate-50"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Mobile Number"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="pt-2">
                            <Button onClick={handleUpdateProfile} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                        </div>
                    </div>
                    )}
                </div>
            )}

            {/* TAB 3: SPORTS PREFERENCES */}
            {activeTab === 'sports' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 max-w-2xl animate-in fade-in duration-200">
                    <h3 className="font-black text-lg text-slate-900">Sports & Booking Preferences</h3>
                    <div className="flex flex-wrap items-center gap-3">
                        {sports.map(s => (
                            <div key={s} className="relative group">
                                <Badge variant="primary" className="px-4 py-2 text-sm">{s}</Badge>
                                <button
                                    onClick={() => handleRemoveSport(s)}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            </div>
                        ))}

                        {isAddingSport ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    className="w-36 py-1 h-9 text-xs font-bold"
                                    placeholder="e.g. Pickleball"
                                    value={newSport}
                                    onChange={e => setNewSport(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddSport()}
                                    autoFocus
                                />
                                <Button size="sm" variant="secondary" onClick={() => setIsAddingSport(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleAddSport}>Add</Button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAddingSport(true)}
                                className="px-4 py-2 border-2 border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer transition-all"
                            >
                                + Add Sport
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 4: SECURITY & PASSWORD */}
            {activeTab === 'security' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 max-w-md animate-in fade-in duration-200">
                    <h3 className="font-black text-lg text-slate-900">Change Password</h3>
                    <div className="space-y-4">
                        <Input
                            label="Current Password"
                            type="password"
                            placeholder="••••••••"
                            value={passwords.current}
                            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                        />
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            value={passwords.new}
                            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            value={passwords.confirm}
                            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                        />
                        <div className="pt-2">
                            <Button onClick={handleUpdatePassword} disabled={isChangingPassword}>{isChangingPassword ? 'Updating...' : 'Update Password'}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
