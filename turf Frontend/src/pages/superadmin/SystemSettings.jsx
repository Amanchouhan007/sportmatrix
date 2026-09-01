import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { getProfile, updateProfile as apiUpdateProfile, changePassword as apiChangePassword } from '../../services/authService'
import { getCommissionSettings, updateCommissionSettings } from '../../services/commissionService'
import { getBranches, getPayoutAccount, updatePayoutAccount } from '../../services/branchService'
import { getPaymentGatewaySettings, updatePaymentGatewaySettings } from '../../services/paymentGatewayService'
import { getApi, putApi } from '../../services/api'
import { FiEdit2, FiSave, FiX, FiPercent, FiTrendingUp, FiUser, FiShield, FiUpload, FiSliders, FiEye, FiEyeOff, FiCreditCard, FiSettings, FiMail } from 'react-icons/fi'

// ─── Custom Reusable Form Input Component ──────────────────────────────────────
const FormInput = ({ label, id, type = 'text', placeholder, value, onChange, disabled, required }) => {
    const [showPass, setShowPass] = useState(false)
    const isPassword = type === 'password'
    const actualType = isPassword ? (showPass ? 'text' : 'password') : type

    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={id} className="block text-xs font-bold text-slate-700 tracking-wide">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    id={id}
                    type={actualType}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full h-11 ${isPassword ? 'pr-11' : 'pr-4'} pl-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 text-xs font-semibold text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        disabled={disabled}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#16A34A] transition-colors cursor-pointer p-1 rounded-lg"
                        aria-label={showPass ? "Hide password" : "Show password"}
                    >
                        {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    )
}

export default function SystemSettings() {
    const { addToast } = useToast()
    const { user, updateUser } = useAuth()
    const [activeTab, setActiveTab] = useState('profile') // 'profile' or 'commission'

    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'superadmin'
    const userRoleName = isSuperAdmin ? 'SUPER ADMIN' : 'TURF ADMIN'
    const userBadgeSub = isSuperAdmin ? 'Platform Owner' : 'Turf Manager'
    const defaultName = isSuperAdmin ? 'Super Admin' : (user?.fullName || user?.name || 'Turf Admin')
    const defaultEmail = user?.email || (isSuperAdmin ? 'superadmin@gmail.com' : 'owner@gmail.com')

    // ─── Commission Settings States ─────────────────────────────────────────────
    const [commissionSettings, setCommissionSettings] = useState(null)
    const [isLoadingCommission, setIsLoadingCommission] = useState(false)
    const [isEditingCommission, setIsEditingCommission] = useState(false)
    const [isSavingCommission, setIsSavingCommission] = useState(false)
    const [tempCommission, setTempCommission] = useState(null)

    // ─── Profile Settings States ────────────────────────────────────────────────
    const [profileData, setProfileData] = useState(() => {
        const savedAvatar = localStorage.getItem('user_profile_avatar') || ''
        const initialImg = (typeof savedAvatar === 'string' && savedAvatar.startsWith('data:image')) ? savedAvatar : (user?.profileImage || user?.avatar || '')
        return {
            fullName: user?.fullName || user?.name || (isSuperAdmin ? 'Super Admin' : 'Turf Admin'),
            email: user?.email || defaultEmail,
            mobile: user?.mobile || user?.phone || '9876543210',
            alternateMobile: user?.alternateMobile || '',
            profileImage: initialImg
        }
    })

    useEffect(() => {
        if (user) {
            const savedAvatar = localStorage.getItem('user_profile_avatar') || ''
            const validLocalImg = (typeof savedAvatar === 'string' && savedAvatar.startsWith('data:image')) ? savedAvatar : ''
            setProfileData(prev => ({
                fullName: prev.fullName || user.fullName || user.name || (isSuperAdmin ? 'Super Admin' : 'Turf Admin'),
                email: prev.email || user.email || defaultEmail,
                mobile: prev.mobile || user.mobile || user.phone || '9876543210',
                alternateMobile: prev.alternateMobile || user.alternateMobile || '',
                profileImage: validLocalImg || prev.profileImage || user.profileImage || user.avatar || ''
            }))
        }
    }, [user, isSuperAdmin, defaultEmail])

    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [isSavingPassword, setIsSavingPassword] = useState(false)

    // ─── Owner Payout Account States (Phase 1: payment gateway abstraction) ────
    const [myBranchId, setMyBranchId] = useState(null)
    const [payoutAccount, setPayoutAccount] = useState({ accountType: 'UPI', upiId: '', bankAccountHolder: '', bankAccountNumber: '', bankIfsc: '', bankName: '', qrCodeImageUrl: '', isActive: true })
    const [isLoadingPayout, setIsLoadingPayout] = useState(false)
    const [isSavingPayout, setIsSavingPayout] = useState(false)

    // ─── Super Admin Payment Gateway States ────────────────────────────────────
    const [gatewaySettings, setGatewaySettings] = useState(null)
    const [gatewayForm, setGatewayForm] = useState({ activeProvider: 'MANUAL', razorpayKeyId: '', razorpayKeySecret: '' })
    const [isLoadingGateway, setIsLoadingGateway] = useState(false)
    const [isSavingGateway, setIsSavingGateway] = useState(false)

    // ─── Super Admin Website Contact Info States ──────────────────────────────
    const [contactForm, setContactForm] = useState({
        addressLine1: '2341/E, Sudama Nagar',
        cityStateCountry: 'Indore, M.P., India',
        email: 'info@kiaantechnology.com',
        phone: '+91 97521 00980',
        weekdayHours: 'MON-FRI: 09:00 AM - 07:00 PM IST',
        weekendHours: 'SAT: 10:00 AM - 04:00 PM IST',
        poweredBy: 'Powered by Kiaan Technology'
    })
    const [isSavingContact, setIsSavingContact] = useState(false)

    const fetchContactSettings = useCallback(async () => {
        try {
            const res = await getApi('/settings/contact-info')
            if (res?.success && res.data) {
                setContactForm(res.data)
            }
        } catch (e) {}
    }, [])

    const handleSaveContactSettings = async () => {
        setIsSavingContact(true)
        try {
            const res = await putApi('/settings/contact-info', contactForm)
            if (res?.success) {
                addToast({ title: 'Contact Settings Saved', message: 'Website Contact Info updated live across platform!', type: 'success' })
            } else {
                addToast({ title: 'Save Failed', message: res?.message || 'Could not save contact settings.', type: 'danger' })
            }
        } catch (err) {
            addToast({ title: 'Error', message: err.message || 'Failed to update contact info.', type: 'danger' })
        } finally {
            setIsSavingContact(false)
        }
    }

    const fetchPayoutAccount = useCallback(async () => {
        setIsLoadingPayout(true)
        try {
            const branchesRes = await getBranches()
            const branch = (branchesRes?.data || branchesRes || [])[0]
            if (!branch) {
                addToast({ title: 'No Branch Found', message: 'No branch is linked to this account yet.', type: 'error' })
                return
            }
            setMyBranchId(branch.id)
            const res = await getPayoutAccount(branch.id)
            if (res?.data) {
                setPayoutAccount({
                    accountType: res.data.accountType || 'UPI',
                    upiId: res.data.upiId || '',
                    bankAccountHolder: res.data.bankAccountHolder || '',
                    bankAccountNumber: res.data.bankAccountNumber || '',
                    bankIfsc: res.data.bankIfsc || '',
                    bankName: res.data.bankName || '',
                    qrCodeImageUrl: res.data.qrCodeImageUrl || '',
                    isActive: res.data.isActive !== undefined ? res.data.isActive : true
                })
            }
        } catch (err) {
            addToast({ title: 'Load Failed', message: err.message || 'Failed to load payout account.', type: 'error' })
        } finally {
            setIsLoadingPayout(false)
        }
    }, [addToast])

    const handleSavePayoutAccount = async () => {
        if (!myBranchId) return
        setIsSavingPayout(true)
        try {
            const res = await updatePayoutAccount(myBranchId, payoutAccount)
            if (res && res.success) {
                addToast({ title: 'Payout Account Saved', message: 'Customers will now see this account/QR at checkout.', type: 'success' })
            }
        } catch (err) {
            addToast({ title: 'Save Failed', message: err.message || 'Failed to save payout account.', type: 'error' })
        } finally {
            setIsSavingPayout(false)
        }
    }

    const handleQrImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setPayoutAccount(prev => ({ ...prev, qrCodeImageUrl: reader.result }))
            reader.readAsDataURL(file)
        }
    }

    const fetchGatewaySettings = useCallback(async () => {
        setIsLoadingGateway(true)
        try {
            const res = await getPaymentGatewaySettings()
            if (res?.data) {
                setGatewaySettings(res.data)
                setGatewayForm({ activeProvider: res.data.activeProvider, razorpayKeyId: res.data.razorpayKeyId || '', razorpayKeySecret: '' })
            }
        } catch (err) {
            addToast({ title: 'Load Failed', message: err.message || 'Failed to load payment gateway settings.', type: 'error' })
        } finally {
            setIsLoadingGateway(false)
        }
    }, [addToast])

    const handleSaveGatewaySettings = async () => {
        setIsSavingGateway(true)
        try {
            const payload = { activeProvider: gatewayForm.activeProvider }
            if (gatewayForm.razorpayKeyId) payload.razorpayKeyId = gatewayForm.razorpayKeyId
            if (gatewayForm.razorpayKeySecret) payload.razorpayKeySecret = gatewayForm.razorpayKeySecret
            const res = await updatePaymentGatewaySettings(payload)
            if (res && res.success) {
                addToast({ title: 'Gateway Updated', message: res.message || 'Payment gateway settings saved.', type: 'success' })
                fetchGatewaySettings()
            }
        } catch (err) {
            addToast({ title: 'Save Failed', message: err.message || 'Failed to save payment gateway settings.', type: 'error' })
        } finally {
            setIsSavingGateway(false)
        }
    }

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
        } else if (activeTab === 'payout') {
            fetchPayoutAccount()
        } else if (activeTab === 'gateway') {
            fetchGatewaySettings()
            fetchContactSettings()
        }
    }, [activeTab, fetchCommissionSettings, fetchPayoutAccount, fetchGatewaySettings, fetchContactSettings])

    // ─── Profile Fetch ──────────────────────────────────────────────────────────
    const fetchProfile = async () => {
        try {
            const res = await getProfile()
            const savedAvatar = localStorage.getItem('user_profile_avatar') || ''
            if (res && res.success) {
                const data = res.data
                const rawImg = savedAvatar || data.profileImage || data.avatar || ''
                const validImg = typeof rawImg === 'string' && (rawImg.startsWith('data:image') || rawImg.startsWith('http') || rawImg.startsWith('/')) ? rawImg : ''
                setProfileData({
                    fullName: data.fullName || data.name || user?.fullName || defaultName,
                    email: data.email || user?.email || defaultEmail,
                    mobile: data.mobile || user?.mobile || '9876543210',
                    alternateMobile: data.alternateMobile || '',
                    profileImage: validImg
                })
                updateUser({ ...data, profileImage: validImg, avatar: validImg })
            }
        } catch (err) {
            console.warn('Profile fetch note:', err.message)
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
                const base64Img = reader.result
                setProfileData(prev => ({ ...prev, profileImage: base64Img }))
                try {
                    localStorage.setItem('user_profile_avatar', base64Img)
                } catch (err) {
                    console.warn('LocalStorage save avatar note:', err.message)
                }
                updateUser({ ...user, profileImage: base64Img, avatar: base64Img })
                addToast({ title: 'Photo Loaded', message: 'Click "Update Profile" below to confirm changes.', type: 'info' })
            }
            reader.readAsDataURL(file)
        }
    }

    // ─── Update Profile ─────────────────────────────────────────────────────────
    const handleUpdateProfile = async () => {
        if (!profileData.fullName.trim() || !profileData.email.trim()) {
            addToast({ title: 'Validation Error', message: 'Full name and email are required.', type: 'error' })
            return
        }

        if (profileData.profileImage) {
            try {
                localStorage.setItem('user_profile_avatar', profileData.profileImage)
            } catch (e) {}
        }

        setIsSavingProfile(true)
        try {
            const res = await apiUpdateProfile(profileData)
            if (res && res.success) {
                updateUser({ ...res.data, profileImage: profileData.profileImage, avatar: profileData.profileImage })
                addToast({ title: 'Profile Updated', message: 'Your profile settings have been saved successfully.', type: 'success' })
            }
        } catch (err) {
            console.error('Update profile error:', err)
            addToast({ title: 'Update Failed', message: err.response?.data?.message || err.message || 'Failed to update profile', type: 'error' })
        } finally {
            setIsSavingProfile(false)
        }
    }

    // ─── Change Password ────────────────────────────────────────────────────────
    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            addToast({ title: 'Validation Error', message: 'Please fill in all password fields', type: 'error' })
            return
        }
        if (passwords.new !== passwords.confirm) {
            addToast({ title: 'Validation Error', message: 'New password and confirm password do not match', type: 'error' })
            return
        }
        if (passwords.new.length < 6) {
            addToast({ title: 'Validation Error', message: 'New password must be at least 6 characters long', type: 'error' })
            return
        }

        setIsSavingPassword(true)
        try {
            const res = await apiChangePassword({ currentPassword: passwords.current, newPassword: passwords.new })
            if (res && res.success) {
                setPasswords({ current: '', new: '', confirm: '' })
                addToast({ title: 'Password Changed', message: 'Your password has been updated successfully', type: 'success' })
            }
        } catch (err) {
            addToast({ title: 'Update Failed', message: err.response?.data?.message || err.message || 'Failed to update password', type: 'error' })
        } finally {
            setIsSavingPassword(false)
        }
    }

    // ─── Commission Loading Skeleton ───────────────────────────────────────────
    const CommissionSkeleton = () => (
        <div className="animate-pulse space-y-6">
            <div className="grid sm:grid-cols-2 gap-5 max-w-xl">
                <div className="h-11 bg-slate-100 rounded-xl" />
                <div className="h-11 bg-slate-100 rounded-xl" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-12 bg-slate-100 rounded-xl" />
                ))}
            </div>
        </div>
    )

    const displayData = isEditingCommission ? tempCommission : commissionSettings

    return (
        <div className="space-y-6 relative selection:bg-[#16A34A]/20">
            {/* Ambient Background Radial Glows */}
            <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-[#10B981]/5 rounded-full blur-[160px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 w-[700px] h-[700px] bg-[#22C55E]/4 rounded-full blur-[180px] pointer-events-none -z-10" />

            {/* ── 1. Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-[#16A34A] flex items-center justify-center shadow-2xs">
                        <FiSliders className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                            {isSuperAdmin ? 'System Settings' : 'Admin Profile Settings'}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
                            {isSuperAdmin ? 'Platform configurations, admin profile, and commissions' : 'Manage your turf admin account profile and security settings'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── 2. Premium Segmented Control Tabs ── */}
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/70 gap-1.5 shadow-2xs">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                        activeTab === 'profile'
                            ? 'bg-white text-[#16A34A] shadow-xs border border-slate-200/80 scale-[1.01]'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                >
                    <FiUser className={`w-4 h-4 ${activeTab === 'profile' ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                    <span>Profile Settings</span>
                </button>
                {isSuperAdmin && (
                    <button
                        onClick={() => setActiveTab('commission')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                            activeTab === 'commission'
                                ? 'bg-white text-[#16A34A] shadow-xs border border-slate-200/80 scale-[1.01]'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                        <FiPercent className={`w-4 h-4 ${activeTab === 'commission' ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                        <span>Commission Rates</span>
                    </button>
                )}
                {isSuperAdmin && (
                    <button
                        onClick={() => setActiveTab('gateway')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                            activeTab === 'gateway'
                                ? 'bg-white text-[#16A34A] shadow-xs border border-slate-200/80 scale-[1.01]'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                        <FiSettings className={`w-4 h-4 ${activeTab === 'gateway' ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                        <span>Payment Gateway</span>
                    </button>
                )}
                {isSuperAdmin && (
                    <button
                        onClick={() => setActiveTab('contact')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                            activeTab === 'contact'
                                ? 'bg-white text-[#16A34A] shadow-xs border border-slate-200/80 scale-[1.01]'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                        <FiMail className={`w-4 h-4 ${activeTab === 'contact' ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                        <span>Contact & Website Info</span>
                    </button>
                )}
                {!isSuperAdmin && (
                    <button
                        onClick={() => setActiveTab('payout')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                            activeTab === 'payout'
                                ? 'bg-white text-[#16A34A] shadow-xs border border-slate-200/80 scale-[1.01]'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                        <FiCreditCard className={`w-4 h-4 ${activeTab === 'payout' ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                        <span>Payout Account</span>
                    </button>
                )}
            </div>

            {/* ── 3. Tab 1: Profile Settings ── */}
            {activeTab === 'profile' && (
                <div className="grid lg:grid-cols-3 gap-6 pb-8 items-start animate-fade-in duration-200">
                    {/* Left Column: Admin Profile Identity Card */}
                    <div className="bg-white rounded-[20px] border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-7 text-center space-y-5 relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                        {/* Profile Avatar */}
                        <div className="relative w-28 h-28 mx-auto group">
                            {profileData.profileImage && typeof profileData.profileImage === 'string' && (profileData.profileImage.startsWith('data:image') || profileData.profileImage.startsWith('http') || profileData.profileImage.startsWith('/')) ? (
                                <img
                                    src={profileData.profileImage}
                                    alt={profileData.fullName}
                                    onError={() => setProfileData(prev => ({ ...prev, profileImage: '' }))}
                                    className="w-28 h-28 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-md bg-white"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-emerald-600/20 border-2 border-emerald-400/30">
                                    {((profileData.fullName || user?.fullName || defaultName).split(' ').map(n => n[0]).join('') || 'A').substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            {/* Upload Overlay */}
                            <label className="absolute inset-0 bg-slate-900/70 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-xs font-bold gap-1 backdrop-blur-xs">
                                <FiUpload className="w-5 h-5 text-emerald-400" />
                                <span>Change Photo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfileImageChange}
                                    disabled={isSavingProfile}
                                    className="hidden"
                                />
                            </label>
                            {/* Status Dot */}
                            <span className="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full absolute -bottom-1 -right-1 shadow-2xs" title="Active Admin" />
                        </div>

                        {/* Name & Email */}
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                                {profileData.fullName || user?.fullName || defaultName}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                {profileData.email || user?.email || defaultEmail}
                            </p>
                        </div>

                        {/* Admin Role Badges */}
                        <div className="flex flex-wrap gap-2 justify-center pt-2">
                            <span className="bg-emerald-50 text-[#16A34A] border border-emerald-200/80 px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                                {userRoleName}
                            </span>
                            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                {userBadgeSub}
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Information & Password Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-[20px] border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-7 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                                        <FiUser className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-base font-black text-slate-900 tracking-tight">Personal Information</h2>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormInput
                                        label="Full Name"
                                        placeholder={isSuperAdmin ? "e.g. Super Admin" : "e.g. Turf Admin Owner"}
                                        value={profileData.fullName}
                                        onChange={e => setProfileData({ ...profileData, fullName: e.target.value })}
                                        disabled={isSavingProfile}
                                        required
                                    />
                                    <FormInput
                                        label="Email Address"
                                        type="email"
                                        placeholder={defaultEmail}
                                        value={profileData.email}
                                        onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                        disabled={isSavingProfile}
                                        required
                                    />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormInput
                                        label="Mobile Number"
                                        type="tel"
                                        placeholder="e.g. 9876543210"
                                        value={profileData.mobile}
                                        onChange={e => setProfileData({ ...profileData, mobile: e.target.value })}
                                        disabled={isSavingProfile}
                                        required
                                    />
                                    <FormInput
                                        label="Alternative Mobile"
                                        type="tel"
                                        placeholder="e.g. 9876543211"
                                        value={profileData.alternateMobile}
                                        onChange={e => setProfileData({ ...profileData, alternateMobile: e.target.value })}
                                        disabled={isSavingProfile}
                                    />
                                </div>

                                <div className="pt-3 flex justify-end">
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={isSavingProfile}
                                        className="h-11 px-6 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                                    >
                                        {isSavingProfile ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiSave className="w-3.5 h-3.5" />
                                                <span>Update Profile</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Change Account Password */}
                        <div className="bg-white rounded-[20px] border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-7 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                                        <FiShield className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-base font-black text-slate-900 tracking-tight">Change Account Password</h2>
                                </div>
                            </div>

                            <div className="space-y-4 max-w-xl">
                                <FormInput
                                    label="Current Password (Optional)"
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwords.current}
                                    onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                    disabled={isSavingPassword}
                                />
                                <FormInput
                                    label="New Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwords.new}
                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                    disabled={isSavingPassword}
                                />
                                <FormInput
                                    label="Confirm New Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    disabled={isSavingPassword}
                                />

                                <div className="pt-3 flex justify-end">
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={isSavingPassword}
                                        className="h-11 px-6 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
                                    >
                                        {isSavingPassword ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiShield className="w-3.5 h-3.5" />
                                                <span>Update Password</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 4. Tab 2: Commission Rates ── */}
            {activeTab === 'commission' && (
                <div className="space-y-6 pb-8 animate-fade-in duration-200">
                    <div className={`bg-white rounded-[20px] border transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-7 space-y-6 ${
                        isEditingCommission ? 'ring-2 ring-emerald-500/25 border-emerald-400' : 'border-slate-200/80'
                    }`}>
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                                    <FiTrendingUp className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-900 tracking-tight">Platform Commission Settings</h2>
                                </div>
                            </div>
                            {!isLoadingCommission && commissionSettings && (
                                !isEditingCommission ? (
                                    <button
                                        onClick={handleEditCommission}
                                        className="h-9 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                                    >
                                        <FiEdit2 className="w-3.5 h-3.5 text-[#16A34A]" />
                                        <span>Edit Commission Rates</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 self-start sm:self-auto">
                                        <button
                                            onClick={handleCancelCommission}
                                            disabled={isSavingCommission}
                                            className="h-9 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                        >
                                            <FiX className="w-3.5 h-3.5" />
                                            <span>Cancel</span>
                                        </button>
                                        <button
                                            onClick={handleSaveCommission}
                                            disabled={isSavingCommission}
                                            className="h-9 px-5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                        >
                                            <FiSave className="w-3.5 h-3.5" />
                                            <span>{isSavingCommission ? 'Saving...' : 'Save Changes'}</span>
                                        </button>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Skeleton */}
                        {isLoadingCommission && <CommissionSkeleton />}

                        {/* Loaded Content */}
                        {!isLoadingCommission && displayData && (
                            <div className="space-y-8">
                                {/* Global Rates */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Global System Rates</h4>
                                    <div className="grid sm:grid-cols-2 gap-5 max-w-xl">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Default Rate (%)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={displayData.defaultRate ?? ''}
                                                    onChange={e => setTempCommission({ ...tempCommission, defaultRate: e.target.value })}
                                                    placeholder="10"
                                                    disabled={!isEditingCommission}
                                                    className="w-full h-11 px-4 pr-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 bg-white transition-all shadow-2xs disabled:bg-slate-50 disabled:text-slate-400"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Max Rate (%)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={displayData.maxRate ?? ''}
                                                    onChange={e => setTempCommission({ ...tempCommission, maxRate: e.target.value })}
                                                    placeholder="12"
                                                    disabled={!isEditingCommission}
                                                    className="w-full h-11 px-4 pr-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 bg-white transition-all shadow-2xs disabled:bg-slate-50 disabled:text-slate-400"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sport-wise Rates */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Sport-wise Commission Breakdown</h4>
                                    <div className="grid sm:grid-cols-1 max-w-md gap-4">
                                        {(displayData.sportsRates || [])
                                            .filter(item => (item.sportName || '').toLowerCase() === 'cricket')
                                            .map((item, index) => (
                                                <div key={item.sportName || index} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:border-emerald-300 transition-all duration-200">
                                                    <span className="text-xs font-bold text-slate-900">{item.sportName}</span>
                                                    <div className="relative w-28">
                                                        <input
                                                            type="number"
                                                            value={item.commissionRate ?? ''}
                                                            onChange={e => updateSportRate(index, e.target.value)}
                                                            placeholder="8"
                                                            disabled={!isEditingCommission}
                                                            className="w-full h-9 pl-3 pr-8 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-right outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 bg-white transition-all shadow-2xs disabled:bg-slate-100/60 disabled:text-slate-400"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">%</span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isLoadingCommission && !commissionSettings && (
                            <div className="text-center py-12 text-slate-400">
                                <FiTrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#16A34A]" />
                                <p className="text-sm font-medium">Unable to load commission settings.</p>
                                <button
                                    onClick={fetchCommissionSettings}
                                    className="mt-3 text-xs font-bold text-[#16A34A] hover:text-emerald-700 underline cursor-pointer"
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── 5. Tab 3: Owner Payout Account (UPI/Bank/QR) ── */}
            {activeTab === 'payout' && (
                <div className="space-y-6 pb-8 animate-fade-in duration-200 max-w-2xl">
                    <div className="bg-white rounded-[20px] border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-7 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                                <FiCreditCard className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-slate-900 tracking-tight">Payout Account</h2>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">No live payment gateway is connected yet -- customers pay this account/QR directly at checkout.</p>
                            </div>
                        </div>

                        {isLoadingPayout ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-11 bg-slate-100 rounded-xl" />
                                <div className="h-11 bg-slate-100 rounded-xl" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Payout Method</label>
                                    <div className="grid grid-cols-1 gap-2 max-w-xs">
                                        <button
                                            type="button"
                                            className="h-10 rounded-xl text-[11px] font-extrabold uppercase tracking-wide border bg-[#16A34A] text-white border-[#16A34A] shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-default"
                                        >
                                            <span>QR Code Payment</span>
                                        </button>
                                    </div>
                                </div>

                                <FormInput 
                                    label="UPI ID (for Direct QR Payments)" 
                                    placeholder="yourvenue@upi" 
                                    value={payoutAccount.upiId || ''} 
                                    onChange={e => setPayoutAccount({ ...payoutAccount, upiId: e.target.value, accountType: 'QR_CODE' })} 
                                    required 
                                />

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Payment QR Code Image</label>
                                    {payoutAccount.qrCodeImageUrl && (
                                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
                                            <img src={payoutAccount.qrCodeImageUrl} alt="Payment QR" className="w-36 h-36 object-contain rounded-xl bg-white p-1" />
                                        </div>
                                    )}
                                    <div>
                                        <label className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer shadow-sm">
                                            <FiUpload className="w-3.5 h-3.5 text-[#16A34A]" />
                                            <span>{payoutAccount.qrCodeImageUrl ? 'Change QR Image' : 'Upload QR Image'}</span>
                                            <input type="file" accept="image/*" onChange={handleQrImageChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-3 flex justify-end">
                                    <button
                                        onClick={handleSavePayoutAccount}
                                        disabled={isSavingPayout}
                                        className="h-11 px-6 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 min-w-[150px] justify-center"
                                    >
                                        {isSavingPayout ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave className="w-3.5 h-3.5" />}
                                        <span>{isSavingPayout ? 'Saving...' : 'Save Payout Account'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── 6. Tab 4: Super Admin Payment Gateway ── */}
            {activeTab === 'gateway' && (
                <div className="space-y-6 pb-8 animate-fade-in duration-200 max-w-2xl">
                    <div className="bg-white rounded-[20px] border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-7 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                                <FiSettings className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-slate-900 tracking-tight">Payment Gateway</h2>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Manual mode (owner QR/UPI + dual confirmation) is active by default. Add real gateway keys here to go live later -- no other changes needed.</p>
                            </div>
                        </div>

                        {isLoadingGateway ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-11 bg-slate-100 rounded-xl" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Active Provider</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['MANUAL', 'RAZORPAY_ROUTE', 'STRIPE_CONNECT'].map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setGatewayForm(prev => ({ ...prev, activeProvider: p }))}
                                                className={`h-10 rounded-xl text-[11px] font-extrabold uppercase tracking-wide transition-all cursor-pointer border ${gatewayForm.activeProvider === p ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-md shadow-emerald-600/20' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                            >
                                                {p === 'RAZORPAY_ROUTE' ? 'Razorpay Route' : p === 'STRIPE_CONNECT' ? 'Stripe Connect' : 'Manual'}
                                            </button>
                                        ))}
                                    </div>
                                    {gatewayForm.activeProvider !== 'MANUAL' && (
                                        <p className="text-[11px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                                            ⚠️ This provider is a scaffold and requires real API keys below before it will work -- until then, payments through it will fail with a clear "not configured" error rather than silently succeeding.
                                        </p>
                                    )}
                                </div>

                                {gatewayForm.activeProvider === 'RAZORPAY_ROUTE' && (
                                    <div className="space-y-4">
                                        <FormInput label="Razorpay Key ID" placeholder="rzp_live_xxxxxxxx" value={gatewayForm.razorpayKeyId} onChange={e => setGatewayForm({ ...gatewayForm, razorpayKeyId: e.target.value })} />
                                        <FormInput label="Razorpay Key Secret" type="password" placeholder={gatewaySettings?.razorpayKeySecret || 'Leave blank to keep existing secret'} value={gatewayForm.razorpayKeySecret} onChange={e => setGatewayForm({ ...gatewayForm, razorpayKeySecret: e.target.value })} />
                                    </div>
                                )}

                                <div className="pt-3 flex justify-end">
                                    <button
                                        onClick={handleSaveGatewaySettings}
                                        disabled={isSavingGateway}
                                        className="h-11 px-6 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 min-w-[150px] justify-center"
                                    >
                                        {isSavingGateway ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave className="w-3.5 h-3.5" />}
                                        <span>{isSavingGateway ? 'Saving...' : 'Save Gateway Settings'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── 7. Tab 5: Super Admin Website Contact & Company Info ── */}
            {activeTab === 'contact' && (
                <div className="space-y-6 pb-8 animate-fade-in duration-200 max-w-3xl">
                    <div className="bg-white rounded-[20px] border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-7 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-black">
                                📍
                            </div>
                            <div>
                                <h2 className="text-base font-black text-slate-900 tracking-tight">Website Contact & Company Details</h2>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Super Admin can edit platform address, hotline phone, inquiry email, and operating hours live across the website.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <FormInput label="Headquarters Address (Line 1)" placeholder="e.g. 2341/E, Sudama Nagar" value={contactForm.addressLine1} onChange={e => setContactForm({ ...contactForm, addressLine1: e.target.value })} />
                                <FormInput label="City, State & Country" placeholder="e.g. Indore, M.P., India" value={contactForm.cityStateCountry} onChange={e => setContactForm({ ...contactForm, cityStateCountry: e.target.value })} />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <FormInput label="Inquiry Email Address" placeholder="e.g. info@kiaantechnology.com" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} />
                                <FormInput label="Direct Phone Hotline" placeholder="e.g. +91 97521 00980" value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <FormInput label="Weekday Operating Hours" placeholder="e.g. MON-FRI: 09:00 AM - 07:00 PM IST" value={contactForm.weekdayHours} onChange={e => setContactForm({ ...contactForm, weekdayHours: e.target.value })} />
                                <FormInput label="Weekend Operating Hours" placeholder="e.g. SAT: 10:00 AM - 04:00 PM IST" value={contactForm.weekendHours} onChange={e => setContactForm({ ...contactForm, weekendHours: e.target.value })} />
                            </div>

                            <div className="pt-3 flex justify-end">
                                <button
                                    onClick={handleSaveContactSettings}
                                    disabled={isSavingContact}
                                    className="h-11 px-6 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 min-w-[170px] justify-center"
                                >
                                    {isSavingContact ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave className="w-3.5 h-3.5" />}
                                    <span>{isSavingContact ? 'Saving...' : 'Save Contact Settings'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
