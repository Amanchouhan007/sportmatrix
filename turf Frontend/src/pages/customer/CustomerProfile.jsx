import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'

export default function CustomerProfile() {
    const { addToast } = useToast()

    // Personal Info State
    const [savedProfile, setSavedProfile] = useState(() => {
        const saved = localStorage.getItem('customer_profile')
        return saved ? JSON.parse(saved) : {
            fullName: 'Rahul Kumar',
            email: 'rahul@email.com',
            phone: '+91 98765 43210',
            city: 'Mumbai',
        }
    })

    const [formData, setFormData] = useState(savedProfile)

    // Sports Preferences State
    const [sports, setSports] = useState(() => {
        const saved = localStorage.getItem('customer_sports')
        return saved ? JSON.parse(saved) : ['Cricket', 'Football', 'Football']
    })
    const [newSport, setNewSport] = useState('')
    const [isAddingSport, setIsAddingSport] = useState(false)

    // Password State
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

    // Effects for persistence
    useEffect(() => {
        localStorage.setItem('customer_sports', JSON.stringify(sports))
    }, [sports])

    // Handlers
    const handleUpdateProfile = () => {
        setSavedProfile(formData)
        localStorage.setItem('customer_profile', JSON.stringify(formData))
        addToast({ title: 'Profile Updated', message: 'Your personal information has been saved successfully.', type: 'success' })
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

    const handleUpdatePassword = () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            addToast({ title: 'Missing Fields', message: 'Please fill in all password fields.', type: 'error' })
            return
        }
        if (passwords.new !== passwords.confirm) {
            addToast({ title: 'Mismatch', message: 'New password and confirm password do not match.', type: 'error' })
            return
        }
        
        // Simulate password logic
        setPasswords({ current: '', new: '', confirm: '' })
        addToast({ title: 'Password Updated', message: 'Your password has been changed successfully.', type: 'success' })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">My Profile</h1>
                <p className="text-surface-500 text-sm mt-1">Manage your account</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="text-center h-max">
                    <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-600 mx-auto mb-4">
                        {savedProfile.fullName.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-semibold text-surface-900">{savedProfile.fullName}</h3>
                    <p className="text-sm text-surface-500">{savedProfile.email}</p>
                    <div className="flex gap-2 justify-center mt-3">
                        <Badge variant="primary">Player</Badge>
                        <Badge variant="success">Verified</Badge>
                    </div>
                    <div className="mt-8 text-center border-t border-surface-100 pt-6">
                        <div className="bg-surface-50 rounded-xl py-3 max-w-xs mx-auto">
                            <p className="text-xl font-bold text-surface-900">24</p>
                            <p className="text-xs text-surface-500 mt-1">Bookings</p>
                        </div>
                    </div>
                </Card>
                
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Info */}
                    <Card>
                        <h2 className="text-lg font-semibold text-surface-900 mb-5">Personal Information</h2>
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <Input 
                                    label="Full Name" 
                                    value={formData.fullName} 
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })} 
                                />
                                <Input 
                                    label="Email" 
                                    type="email"
                                    value={formData.email} 
                                    onChange={e => setFormData({ ...formData, email: e.target.value })} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <Input 
                                    label="Phone" 
                                    value={formData.phone} 
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                                />
                                <Input 
                                    label="City" 
                                    value={formData.city} 
                                    onChange={e => setFormData({ ...formData, city: e.target.value })} 
                                />
                            </div>
                            <div className="pt-2">
                                <Button onClick={handleUpdateProfile}>Update Profile</Button>
                            </div>
                        </div>
                    </Card>

                    {/* Sports Preferences */}
                    <Card>
                        <h2 className="text-lg font-semibold text-surface-900 mb-5">Sports Preferences</h2>
                        <div className="flex flex-wrap items-center gap-3">
                            {sports.map(s => (
                                <div key={s} className="relative group">
                                    <Badge variant="primary" className="px-3 py-1.5 text-sm">{s}</Badge>
                                    <button 
                                        onClick={() => handleRemoveSport(s)}
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-danger-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pb-[1px]"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            
                            {isAddingSport ? (
                                <div className="flex items-center gap-2 ml-1">
                                    <Input 
                                        className="w-32 py-1 h-8 text-sm" 
                                        placeholder="Add sport..." 
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
                                    className="px-4 py-1.5 border border-dashed border-surface-300 rounded-lg text-sm font-medium text-surface-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 cursor-pointer transition-all ml-1"
                                >
                                    + Add Sport
                                </button>
                            )}
                        </div>
                    </Card>

                    {/* Change Password */}
                    <Card>
                        <h2 className="text-lg font-semibold text-surface-900 mb-5">Change Password</h2>
                        <div className="space-y-5 max-w-md">
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
                                <Button onClick={handleUpdatePassword}>Update Password</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
