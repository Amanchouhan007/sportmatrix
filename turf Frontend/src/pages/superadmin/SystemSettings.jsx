import { useState, useEffect, useCallback } from 'react'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { getProfile, updateProfile as apiUpdateProfile, changePassword as apiChangePassword } from '../../services/authService'
import { getCommissionSettings, updateCommissionSettings } from '../../services/commissionService'
import { FiEdit2, FiSave, FiX, FiPercent, FiTrendingUp, FiUser, FiShield, FiUpload } from 'react-icons/fi'

export default function SystemSettings() {
    const { addToast } = useToast()
    const { user, updateUser } = useAuth()
    const [activeTab, setActiveTab] = useState('profile') // 'profile' or 'commission'

    // ─── Commission Settings States ─────────────────────────────────────────────
    const [commissionSettings, setCommissionSettings] = useState(null)
    const [isLoadingCommission, setIsLoadingCommission] = useState(false)
    const [isEditingCommission, setIsEditingCommission] = useState(false)
    const [isSavingCommission, setIsSavingCommission] = useState(false)
    const [tempCommission, setTempCommission] = useState(null)

    // ─── Profile Settings States ────────────────────────────────────────────────
    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        alternateMobile: '',
        profileImage: ''
    })
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [isSavingPassword, setIsSavingPassword] = useState(false)

    // ─── Fetch commission settings from backend ─────────────────────────────────
    const fetchCommissionSettings = useCallback(async () => {
        setIsLoadingCommission(true)
        try {
            const res = await getCommissionSettings()
            if (res && res.success) {
                setCommissionSettings(res.data)
                setTempCommission(res.data)
            }
        } catch (err) {
            const status = err.response?.status
            if (status === 401) {
                addToast({ title: 'Unauthorized', message: 'You are not authorized. Please log in again.', type: 'error' })
            } else if (status === 403) {
                addToast({ title: 'Forbidden', message: 'Access denied. Only Super Admin can view commission settings.', type: 'error' })
            } else {
                addToast({ title: 'Load Failed', message: err.response?.data?.message || 'Failed to load commission settings', type: 'error' })
            }
        } finally {
            setIsLoadingCommission(false)
        }
    }, [addToast])

    // ─── Tab-switch effects ─────────────────────────────────────────────────────
    useEffect(() => {
        if (activeTab === 'profile') {
            fetchProfile()
        } else if (activeTab === 'commission') {
            fetchCommissionSettings()
        }
    }, [activeTab])

    // ─── Profile Fetch ──────────────────────────────────────────────────────────
    const fetchProfile = async () => {
        try {
            const res = await getProfile()
            if (res && res.success) {
                setProfileData({
                    fullName: res.data.fullName || '',
                    email: res.data.email || '',
                    mobile: res.data.mobile || '',
                    alternateMobile: res.data.alternateMobile || '',
                    profileImage: res.data.profileImage || ''
                })
            }
        } catch (err) {
            addToast({ title: 'Error', message: 'Failed to fetch profile details', type: 'error' })
        }
    }

    // ─── Commission Edit Handlers ───────────────────────────────────────────────
    const handleEditCommission = () => {
        setIsEditingCommission(true)
        setTempCommission(JSON.parse(JSON.stringify(commissionSettings)))
    }

    const handleCancelCommission = () => {
        setIsEditingCommission(false)
        setTempCommission(JSON.parse(JSON.stringify(commissionSettings)))
    }

    const handleSaveCommission = async () => {
        // ── Frontend Validations ──
        const defRate = Number(tempCommission.defaultRate)
        const maxRate = Number(tempCommission.maxRate)

        if (isNaN(defRate) || defRate < 0 || defRate > 100) {
            addToast({ title: 'Validation Error', message: 'Default Rate must be between 0 and 100.', type: 'error' })
            return
        }
        if (isNaN(maxRate) || maxRate < 0 || maxRate > 100) {
            addToast({ title: 'Validation Error', message: 'Max Rate must be between 0 and 100.', type: 'error' })
            return
        }

        const sportsRates = tempCommission.sportsRates || []
        for (const s of sportsRates) {
            const rate = Number(s.commissionRate)
            if (isNaN(rate) || rate < 0 || rate > 100) {
                addToast({ title: 'Validation Error', message: `${s.sportName}: Commission rate must be between 0 and 100.`, type: 'error' })
                return
            }
            if (rate > maxRate) {
                addToast({ title: 'Validation Error', message: `${s.sportName}: Commission rate (${rate}%) cannot exceed Max Rate (${maxRate}%).`, type: 'error' })
                return
            }
        }

        // ── Build Payload ──
        const payload = {
            defaultRate: defRate,
            maxRate: maxRate,
            sportsRates: sportsRates.map(s => ({
                sportName: s.sportName,
                commissionRate: Number(s.commissionRate)
            }))
        }

        setIsSavingCommission(true)
        try {
            const res = await updateCommissionSettings(payload)
            if (res && res.success) {
                setCommissionSettings(res.data)
                setTempCommission(res.data)
                setIsEditingCommission(false)
                addToast({
                    title: 'Commission Saved',
                    message: 'Commission rates have been updated successfully',
                    type: 'success'
                })
            }
        } catch (err) {
            const status = err.response?.status
            if (status === 400) {
                addToast({ title: 'Validation Error', message: err.response?.data?.message || 'Invalid commission data.', type: 'error' })
            } else if (status === 401) {
                addToast({ title: 'Unauthorized', message: 'Session expired. Please log in again.', type: 'error' })
            } else if (status === 403) {
                addToast({ title: 'Forbidden', message: 'Only Super Admin can update commission settings.', type: 'error' })
            } else {
                addToast({ title: 'Save Failed', message: err.response?.data?.message || 'Failed to save commission settings.', type: 'error' })
            }
        } finally {
            setIsSavingCommission(false)
        }
    }

    const updateSportRate = (index, value) => {
        setTempCommission(prev => {
            const updated = JSON.parse(JSON.stringify(prev))
            updated.sportsRates[index].commissionRate = value
            return updated
        })
    }

    // ─── Profile Photo Handler ──────────────────────────────────────────────────
    const handleProfileImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfileData(prev => ({ ...prev, profileImage: reader.result }))
            }
            reader.readAsDataURL(file)
        }
    }

    // ─── Update Profile ─────────────────────────────────────────────────────────
    const handleUpdateProfile = async () => {
        if (!profileData.fullName.trim() || !profileData.email.trim() || !profileData.mobile.trim()) {
            addToast({ title: 'Validation Error', message: 'Please fill in all required fields', type: 'error' })
            return
        }

        setIsSavingProfile(true)
        try {
            const res = await apiUpdateProfile(profileData)
            if (res && res.success) {
                updateUser(res.data)
                addToast({ title: 'Profile Updated', message: 'Your profile has been saved successfully.', type: 'success' })
            }
        } catch (err) {
            addToast({ title: 'Update Failed', message: err.response?.data?.message || err.message || 'Failed to update profile details', type: 'error' })
        } finally {
            setIsSavingProfile(false)
        }
    }

    // ─── Change Password ────────────────────────────────────────────────────────
    const handleUpdatePassword = async () => {
        if (!passwords.new || !passwords.confirm) {
            addToast({ title: 'Missing Fields', message: 'Please fill in the new password fields.', type: 'error' })
            return
        }
        if (passwords.new.length < 6) {
            addToast({ title: 'Validation Error', message: 'Password must be at least 6 characters long', type: 'error' })
            return
        }
        if (passwords.new !== passwords.confirm) {
            addToast({ title: 'Mismatch', message: 'New password and confirm password do not match.', type: 'error' })
            return
        }

        setIsSavingPassword(true)
        try {
            const res = await apiChangePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new
            })
            if (res && res.success) {
                setPasswords({ current: '', new: '', confirm: '' })
                addToast({ title: 'Password Updated', message: 'Your password has been changed successfully.', type: 'success' })
            }
        } catch (err) {
            addToast({ title: 'Update Failed', message: err.response?.data?.message || err.message || 'Failed to update password', type: 'error' })
        } finally {
            setIsSavingPassword(false)
        }
    }

    // ─── Section Header Component ───────────────────────────────────────────────
    const SectionHeader = ({ title, icon: Icon, onEdit, onSave, onCancel, isEditing, isSaving }) => (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-100">
            <div className="flex items-center gap-2.5">
                {Icon && <Icon className="w-5 h-5 text-primary-500" />}
                <h2 className="text-base font-extrabold text-surface-900 tracking-tight">{title}</h2>
            </div>
            {onEdit && (
                !isEditing ? (
                    <Button variant="outline" size="sm" onClick={onEdit} className="gap-2 font-bold text-xs h-9 px-4 rounded-xl border-surface-250 hover:bg-surface-50 text-surface-700">
                        <FiEdit2 className="w-3.5 h-3.5" /> Edit
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={onCancel} disabled={isSaving} className="gap-2 font-bold text-xs h-9 px-4 rounded-xl border-surface-200 text-surface-600 hover:text-surface-900">
                            <FiX className="w-3.5 h-3.5" /> Cancel
                        </Button>
                        <Button size="sm" onClick={onSave} disabled={isSaving} className="gap-2 font-bold text-xs h-9 px-4 rounded-xl shadow-soft">
                            <FiSave className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                )
            )}
        </div>
    )

    // ─── Commission loading skeleton ────────────────────────────────────────────
    const CommissionSkeleton = () => (
        <div className="animate-pulse space-y-6">
            <div className="grid sm:grid-cols-2 gap-5 max-w-xl">
                <div className="h-12 bg-surface-100 rounded-xl" />
                <div className="h-12 bg-surface-100 rounded-xl" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-14 bg-surface-100 rounded-2xl" />
                ))}
            </div>
        </div>
    )

    // ─── Active display data ────────────────────────────────────────────────────
    const displayData = isEditingCommission ? tempCommission : commissionSettings

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight">System Settings</h1>
                    <p className="text-surface-500 text-sm mt-1">Platform configurations, admin profile, and commissions</p>
                </div>
            </div>

            {/* Premium Tab Selector */}
            <div className="flex gap-2 p-1.5 bg-surface-100/70 border border-surface-200/50 rounded-2xl w-fit shadow-soft-sm backdrop-blur-md">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-250 flex items-center gap-2 cursor-pointer ${
                        activeTab === 'profile'
                            ? 'bg-white text-primary-600 shadow-soft scale-[1.02] border border-surface-200/10'
                            : 'text-surface-500 hover:text-surface-800'
                    }`}
                >
                    <FiUser className="w-4 h-4" />
                    Profile Settings
                </button>
                <button
                    onClick={() => setActiveTab('commission')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-250 flex items-center gap-2 cursor-pointer ${
                        activeTab === 'commission'
                            ? 'bg-white text-primary-600 shadow-soft scale-[1.02] border border-surface-200/10'
                            : 'text-surface-500 hover:text-surface-800'
                    }`}
                >
                    <FiPercent className="w-4 h-4" />
                    Commission Rates
                </button>
            </div>

            {/* ── Tab 1: Profile Settings ── */}
            {activeTab === 'profile' && (
                <div className="grid lg:grid-cols-3 gap-6 pb-8 animate-fade-in duration-200">
                    {/* Left Column: Avatar & Overview */}
                    <Card variant="glass" className="border border-surface-200/60 shadow-soft text-center h-max hover:shadow-soft-md transition-all duration-300">
                        <div className="relative w-24 h-24 mx-auto mb-4 group">
                            {profileData.profileImage ? (
                                <img
                                    src={profileData.profileImage}
                                    alt={profileData.fullName}
                                    className="w-24 h-24 rounded-2xl object-cover border border-surface-250 bg-white shadow-soft"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-black shadow-soft">
                                    {((profileData.fullName || user?.fullName || '').split(' ').map(n => n[0]).join('') || '?').substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/40 text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-xs font-bold gap-1">
                                <FiUpload className="w-3.5 h-3.5" /> Upload
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfileImageChange}
                                    disabled={isSavingProfile}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <h3 className="text-lg font-extrabold text-surface-900 leading-tight">{profileData.fullName || user?.fullName}</h3>
                        <p className="text-xs text-surface-400 font-medium mt-1">{profileData.email || user?.email}</p>
                        <div className="flex gap-2 justify-center mt-3.5">
                            <Badge variant="primary" dot>SUPER ADMIN</Badge>
                            <Badge variant="success">Platform Owner</Badge>
                        </div>
                    </Card>

                    {/* Right Column: Update Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <Card variant="glass" className="border border-surface-200/60 shadow-soft hover:shadow-soft-md transition-all duration-300">
                            <SectionHeader title="Personal Information" icon={FiUser} />
                            <div className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Full Name"
                                        placeholder="e.g. Super Admin"
                                        value={profileData.fullName}
                                        onChange={e => setProfileData({ ...profileData, fullName: e.target.value })}
                                        disabled={isSavingProfile}
                                        required
                                    />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="superadmin@gmail.com"
                                        value={profileData.email}
                                        onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                        disabled={isSavingProfile}
                                        required
                                    />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Mobile Number"
                                        placeholder="e.g. 9876543210"
                                        value={profileData.mobile}
                                        onChange={e => setProfileData({ ...profileData, mobile: e.target.value })}
                                        disabled={isSavingProfile}
                                        required
                                    />
                                    <Input
                                        label="Alternative Mobile"
                                        placeholder="e.g. 9876543211"
                                        value={profileData.alternateMobile}
                                        onChange={e => setProfileData({ ...profileData, alternateMobile: e.target.value })}
                                        disabled={isSavingProfile}
                                    />
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <Button onClick={handleUpdateProfile} disabled={isSavingProfile} className="min-w-[140px] shadow-soft">
                                        {isSavingProfile ? "Saving..." : "Update Profile"}
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Security & Password */}
                        <Card variant="glass" className="border border-surface-200/60 shadow-soft hover:shadow-soft-md transition-all duration-300">
                            <SectionHeader title="Change Account Password" icon={FiShield} />
                            <div className="space-y-4 max-w-lg">
                                <Input
                                    label="Current Password (Optional)"
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwords.current}
                                    onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                    disabled={isSavingPassword}
                                />
                                <Input
                                    label="New Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwords.new}
                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                    disabled={isSavingPassword}
                                />
                                <Input
                                    label="Confirm New Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    disabled={isSavingPassword}
                                />
                                <div className="pt-2 flex justify-end">
                                    <Button onClick={handleUpdatePassword} disabled={isSavingPassword} className="min-w-[140px] shadow-soft">
                                        {isSavingPassword ? "Updating..." : "Update Password"}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* ── Tab 2: Commission Rates ── */}
            {activeTab === 'commission' && (
                <div className="space-y-6 pb-8 animate-fade-in duration-200">
                    <Card variant="glass" className={`border border-surface-200/60 shadow-soft transition-all duration-300 ${isEditingCommission ? 'ring-2 ring-primary-500/25 border-primary-300' : 'hover:shadow-soft-md'}`}>
                        <SectionHeader
                            title="Platform Commission Settings"
                            icon={FiTrendingUp}
                            isEditing={isEditingCommission}
                            onEdit={isLoadingCommission || !commissionSettings ? undefined : handleEditCommission}
                            onSave={handleSaveCommission}
                            onCancel={handleCancelCommission}
                            isSaving={isSavingCommission}
                        />

                        {/* Loading skeleton */}
                        {isLoadingCommission && <CommissionSkeleton />}

                        {/* Loaded content */}
                        {!isLoadingCommission && displayData && (
                            <>
                                {/* Global Rates Grid */}
                                <div className="space-y-2 mb-8">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-surface-400 mb-4 px-1">Global Rates</h4>
                                    <div className="grid sm:grid-cols-2 gap-5 max-w-xl">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-surface-600 mb-1.5 uppercase tracking-wide">Default Rate (%)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={displayData.defaultRate ?? ''}
                                                    onChange={e => setTempCommission({ ...tempCommission, defaultRate: e.target.value })}
                                                    placeholder="10"
                                                    disabled={!isEditingCommission}
                                                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white transition-all shadow-sm disabled:bg-surface-50 disabled:text-surface-400"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-surface-400 font-bold">%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-surface-600 mb-1.5 uppercase tracking-wide">Max Rate (%)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={displayData.maxRate ?? ''}
                                                    onChange={e => setTempCommission({ ...tempCommission, maxRate: e.target.value })}
                                                    placeholder="12"
                                                    disabled={!isEditingCommission}
                                                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white transition-all shadow-sm disabled:bg-surface-50 disabled:text-surface-400"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-surface-400 font-bold">%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sport-wise List */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-surface-400 mb-2 px-1">Sport-wise Commission Rates</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {(displayData.sportsRates || []).map((item, index) => (
                                            <div key={item.sportName || index} className="flex items-center justify-between p-4 bg-surface-50/60 rounded-2xl border border-surface-150/60 hover:bg-surface-100/40 transition-colors duration-250">
                                                <span className="text-sm font-semibold text-surface-800">{item.sportName}</span>
                                                <div className="relative w-32">
                                                    <input
                                                        type="number"
                                                        value={item.commissionRate ?? ''}
                                                        onChange={e => updateSportRate(index, e.target.value)}
                                                        placeholder="8"
                                                        disabled={!isEditingCommission}
                                                        className="w-full pl-4 pr-10 py-2 border border-surface-200 rounded-xl text-sm font-semibold text-right outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white transition-all shadow-sm disabled:bg-surface-50/50 disabled:text-surface-400"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-surface-400 font-bold">%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Empty / error state */}
                        {!isLoadingCommission && !commissionSettings && (
                            <div className="text-center py-12 text-surface-400">
                                <FiTrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">Unable to load commission settings.</p>
                                <button
                                    onClick={fetchCommissionSettings}
                                    className="mt-3 text-xs font-bold text-primary-500 hover:text-primary-700 underline cursor-pointer"
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    )
}
