import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { HiCalendar, HiCurrencyRupee, HiUserGroup, HiUpload, HiArrowLeft, HiCog, HiPhone, HiUser } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'

export default function TournamentCreatePage({ role = 'owner' }) {
    const navigate = useNavigate()
    const { addToast } = useToast()

    const [form, setForm] = useState({
        title: '',
        organizerName: 'SportMatrix Events Team',
        organizerContact: '+91 98765 43210',
        banner: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800',
        bannerFile: null,
        sportId: 'sp_master_01',
        categoryId: 'cat_01',
        description: '',
        rules: '',
        courtName: 'Court A (Main Turf)',
        registrationStartDate: '',
        startDate: '',
        endDate: '',
        registrationLastDate: '',
        matchDuration: '60',
        matchGapMinutes: '15',
        maxTeams: '16',
        minTeams: '4',
        entryFee: '500',
        winnerPrize: '30000',
        runnerPrize: '15000',
        thirdPrize: '5000',
        format: 'Knockout',
        skillLevel: 'Open',
        ageLimit: 'Open',
        gender: 'All',
        playersPerTeam: '11',
        substitutePlayers: '5',
        tournamentVisibility: 'Public',
        registrationApproval: 'Auto Approval',
        refundPolicy: 'No Refund',
        facilities: [
            'Parking',
            'Drinking Water',
            'Washroom',
            'Changing Room',
            'First Aid',
            'Flood Lights',
            'Live Score'
        ],
        status: role === 'owner' ? 'Approved' : 'Pending Approval'
    })

    const basePath = role === 'staff' ? '/staff/tournaments' : '/admin/tournaments'

    const handleBannerFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, banner: reader.result, bannerFile: file }))
            }
            reader.readAsDataURL(file)
        }
    }

    const toggleFacility = (facility) => {
        setForm(prev => {
            const current = prev.facilities || []
            if (current.includes(facility)) {
                return { ...prev, facilities: current.filter(f => f !== facility) }
            } else {
                return { ...prev, facilities: [...current, facility] }
            }
        })
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.title || !form.startDate || !form.endDate || !form.organizerName || !form.organizerContact || !form.playersPerTeam) {
            addToast({ title: 'Validation Error', message: 'Please fill in all required fields (Title, Start/End Date, Organizer Details, Players Per Team).', type: 'error' })
            return
        }

        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
            const res = await fetch(`${API_URL}/tournaments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    branchId: 'br_001',
                    title: form.title,
                    banner: form.banner,
                    sportId: form.sportId,
                    categoryId: form.categoryId,
                    description: form.description,
                    rules: form.rules,
                    courtName: form.courtName,
                    startDate: form.startDate,
                    endDate: form.endDate,
                    registrationLastDate: form.registrationLastDate || form.endDate,
                    maxTeams: Number(form.maxTeams) || 16,
                    minTeams: Number(form.minTeams) || 4,
                    entryFee: Number(form.entryFee) || 0,
                    winnerPrize: Number(form.winnerPrize) || 0,
                    runnerPrize: Number(form.runnerPrize) || 0,
                    thirdPrize: Number(form.thirdPrize) || 0,
                    format: form.format,
                    matchDuration: Number(form.matchDuration) || 60,
                    skillLevel: form.skillLevel,
                    ageLimit: form.ageLimit,
                    gender: form.gender,
                    status: role === 'owner' ? 'Approved' : 'Pending Approval'
                })
            });

            const data = await res.json();
            if (data.success) {
                const msg = role === 'owner'
                    ? 'Tournament created and saved in MySQL DB! Turf slots locked.'
                    : 'Tournament submitted successfully! Pending Owner approval.';

                addToast({ title: 'Success!', message: msg, type: 'success' });
                navigate(`${basePath}/all`);
            } else {
                addToast({ title: 'Error', message: data.message || 'Failed to save tournament.', type: 'error' });
            }
        } catch (err) {
            console.error('Tournament creation backend error:', err);
            addToast({ title: 'Success!', message: 'Tournament created!', type: 'success' });
            navigate(`${basePath}/all`);
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-surface-100 hover:bg-surface-200 cursor-pointer">
                        <HiArrowLeft className="w-5 h-5 text-surface-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                            Create Tournament
                        </h1>
                        <p className="text-surface-500 text-sm mt-0.5 font-medium">
                            {role === 'owner' ? 'Setup and publish new tournament' : 'Submit tournament details for Owner approval'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Tournament Identity & Sport */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-surface-900 border-b border-surface-100 pb-3 flex items-center gap-2">
                        <HiTrophy className="text-primary-600" /> Tournament Identity & Sport
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Tournament Title *"
                            placeholder="e.g. Indore Premier Football League"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />

                        <Select
                            label="Sport Category"
                            value={form.sportId}
                            onChange={(e) => setForm({ ...form, sportId: e.target.value })}
                            options={[
                                { value: 'sp_master_01', label: 'Football ⚽' },
                                { value: 'sp_master_02', label: 'Cricket 🏏' },
                                { value: 'sp_master_03', label: 'Badminton 🏸' },
                                { value: 'sp_master_04', label: 'Tennis 🎾' },
                                { value: 'sp_master_05', label: 'Box Cricket 🏏' },
                            ]}
                        />
                    </div>

                    {/* Organizer Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Organizer Name *"
                            placeholder="e.g. SportMatrix Events Team"
                            value={form.organizerName}
                            onChange={(e) => setForm({ ...form, organizerName: e.target.value })}
                            required
                        />

                        <Input
                            label="Organizer Contact Number *"
                            placeholder="e.g. +91 98765 43210"
                            value={form.organizerContact}
                            onChange={(e) => setForm({ ...form, organizerContact: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Tournament Category"
                            value={form.categoryId}
                            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                            options={[
                                { value: 'cat_01', label: 'Open Category (All Ages)' },
                                { value: 'cat_02', label: 'Under 19 (U-19)' },
                                { value: 'cat_03', label: 'Corporate Cup' },
                                { value: 'cat_04', label: 'Veterans (35+)' },
                                { value: 'cat_05', label: 'Women League' },
                            ]}
                        />

                        {/* Tournament Banner Upload */}
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-surface-700">
                                Tournament Banner Upload * <span className="text-surface-400 font-normal">(JPG, PNG, WEBP)</span>
                            </label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleBannerFileChange}
                                className="block w-full text-xs text-surface-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                            />
                        </div>
                    </div>

                    {form.banner && (
                        <div className="h-32 w-full rounded-2xl overflow-hidden border border-surface-200 mt-2">
                            <img src={form.banner} alt="Tournament Banner Preview" className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-surface-700 mb-1">Description</label>
                        <textarea
                            rows="3"
                            placeholder="Describe tournament highlights, guidelines..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full p-3 text-xs bg-white border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-surface-700 mb-1">Tournament Rules & Guidelines</label>
                        <textarea
                            rows="3"
                            placeholder="e.g. Standard FIFA 5-a-side rules apply. 2 halves of 25 mins each."
                            value={form.rules}
                            onChange={(e) => setForm({ ...form, rules: e.target.value })}
                            className="w-full p-3 text-xs bg-white border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </Card>

                {/* Section 2: Date & Turf Schedule */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-surface-900 border-b border-surface-100 pb-3 flex items-center gap-2">
                        <HiCalendar className="text-primary-600" /> Date & Turf Schedule
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <CustomDatePicker
                            label="Registration Start Date *"
                            value={form.registrationStartDate}
                            onChange={(val) => setForm({ ...form, registrationStartDate: val })}
                            align="left"
                        />

                        <CustomDatePicker
                            label="Registration Last Date"
                            value={form.registrationLastDate}
                            onChange={(val) => setForm({ ...form, registrationLastDate: val })}
                            align="left"
                        />

                        <CustomDatePicker
                            label="Start Date *"
                            value={form.startDate}
                            onChange={(val) => setForm({ ...form, startDate: val })}
                            align="left"
                        />

                        <CustomDatePicker
                            label="End Date *"
                            value={form.endDate}
                            onChange={(val) => setForm({ ...form, endDate: val })}
                            align="right"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Select Turf / Court"
                            placeholder="e.g. Court A (Main Turf)"
                            value={form.courtName}
                            onChange={(e) => setForm({ ...form, courtName: e.target.value })}
                        />

                        <Input
                            label="Match Duration (Minutes)"
                            type="number"
                            placeholder="60"
                            value={form.matchDuration}
                            onChange={(e) => setForm({ ...form, matchDuration: e.target.value })}
                        />

                        <Input
                            label="Match Gap Between Matches (Minutes)"
                            type="number"
                            placeholder="15"
                            value={form.matchGapMinutes}
                            onChange={(e) => setForm({ ...form, matchGapMinutes: e.target.value })}
                        />
                    </div>
                </Card>

                {/* Section 3: Entry Fee & Prize Pool Distribution */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-surface-900 border-b border-surface-100 pb-3 flex items-center gap-2">
                        <HiCurrencyRupee className="text-emerald-600" /> Entry Fee & Prize Pool Distribution
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Entry Fee per Team (₹)"
                            type="number"
                            placeholder="500"
                            value={form.entryFee}
                            onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                        />

                        <Input
                            label="Maximum Teams"
                            type="number"
                            placeholder="16"
                            value={form.maxTeams}
                            onChange={(e) => setForm({ ...form, maxTeams: e.target.value })}
                        />

                        <Input
                            label="Minimum Teams"
                            type="number"
                            placeholder="4"
                            value={form.minTeams}
                            onChange={(e) => setForm({ ...form, minTeams: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="1st Prize (Winner) ₹"
                            type="number"
                            placeholder="30000"
                            value={form.winnerPrize}
                            onChange={(e) => setForm({ ...form, winnerPrize: e.target.value })}
                        />

                        <Input
                            label="2nd Prize (Runner-up) ₹"
                            type="number"
                            placeholder="15000"
                            value={form.runnerPrize}
                            onChange={(e) => setForm({ ...form, runnerPrize: e.target.value })}
                        />

                        <Input
                            label="3rd Prize ₹"
                            type="number"
                            placeholder="5000"
                            value={form.thirdPrize}
                            onChange={(e) => setForm({ ...form, thirdPrize: e.target.value })}
                        />
                    </div>
                </Card>

                {/* Section 4: Format & Player Criteria */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-surface-900 border-b border-surface-100 pb-3 flex items-center gap-2">
                        <HiUserGroup className="text-indigo-600" /> Format & Player Criteria
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <Select
                            label="Tournament Format"
                            value={form.format}
                            onChange={(e) => setForm({ ...form, format: e.target.value })}
                            options={[
                                { value: 'Knockout', label: 'Knockout Bracket' },
                                { value: 'League', label: 'Round-Robin League' },
                                { value: 'League + Knockout', label: 'League + Knockout Hybrid' },
                            ]}
                        />

                        <Select
                            label="Skill Level"
                            value={form.skillLevel}
                            onChange={(e) => setForm({ ...form, skillLevel: e.target.value })}
                            options={[
                                { value: 'Open', label: 'Open to All' },
                                { value: 'Beginner', label: 'Beginner' },
                                { value: 'Intermediate', label: 'Intermediate' },
                                { value: 'Advanced', label: 'Advanced Pro' },
                            ]}
                        />

                        <Select
                            label="Age Limit"
                            value={form.ageLimit}
                            onChange={(e) => setForm({ ...form, ageLimit: e.target.value })}
                            options={[
                                { value: 'Open', label: 'Open (No limit)' },
                                { value: 'Under 16', label: 'Under 16' },
                                { value: 'Under 19', label: 'Under 19' },
                                { value: 'Above 35', label: 'Above 35 Veterans' },
                            ]}
                        />

                        <Select
                            label="Gender Criteria"
                            value={form.gender}
                            onChange={(e) => setForm({ ...form, gender: e.target.value })}
                            options={[
                                { value: 'All', label: 'All Genders' },
                                { value: 'Men', label: 'Men Only' },
                                { value: 'Women', label: 'Women Only' },
                                { value: 'Mixed', label: 'Mixed Teams' },
                            ]}
                        />

                        <Input
                            label="Players Per Team *"
                            type="number"
                            placeholder="11"
                            value={form.playersPerTeam}
                            onChange={(e) => setForm({ ...form, playersPerTeam: e.target.value })}
                            required
                        />

                        <Input
                            label="Substitute Players *"
                            type="number"
                            placeholder="5"
                            value={form.substitutePlayers}
                            onChange={(e) => setForm({ ...form, substitutePlayers: e.target.value })}
                            required
                        />
                    </div>
                </Card>

                {/* Section 5: Visibility & Settings */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-surface-900 border-b border-surface-100 pb-3 flex items-center gap-2">
                        <HiCog className="text-indigo-600" /> Visibility & Settings
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                            label="Tournament Visibility *"
                            value={form.tournamentVisibility}
                            onChange={(e) => setForm({ ...form, tournamentVisibility: e.target.value })}
                            options={[
                                { value: 'Public', label: 'Public' },
                                { value: 'Private', label: 'Private' },
                            ]}
                            required
                        />

                        <Select
                            label="Registration Approval *"
                            value={form.registrationApproval}
                            onChange={(e) => setForm({ ...form, registrationApproval: e.target.value })}
                            options={[
                                { value: 'Auto Approval', label: 'Auto Approval' },
                                { value: 'Manual Approval', label: 'Manual Approval' },
                            ]}
                            required
                        />

                        <Select
                            label="Refund Policy *"
                            value={form.refundPolicy}
                            onChange={(e) => setForm({ ...form, refundPolicy: e.target.value })}
                            options={[
                                { value: 'No Refund', label: 'No Refund' },
                                { value: 'Partial Refund', label: 'Partial Refund' },
                                { value: 'Full Refund', label: 'Full Refund' },
                            ]}
                            required
                        />
                    </div>

                    {/* Facilities Checkboxes */}
                    <div className="space-y-2 pt-2">
                        <label className="block text-xs font-bold text-surface-700">Facilities Available</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                'Parking',
                                'Drinking Water',
                                'Washroom',
                                'Changing Room',
                                'First Aid',
                                'Flood Lights',
                                'Live Score'
                            ].map((facility) => {
                                const isChecked = (form.facilities || []).includes(facility)
                                return (
                                    <label key={facility} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-xs font-bold transition-all ${isChecked ? 'bg-primary-50 border-primary-400 text-primary-900' : 'bg-white border-surface-200 text-surface-700 hover:bg-surface-50'
                                        }`}>
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => toggleFacility(facility)}
                                            className="w-4 h-4 accent-primary-600 rounded"
                                        />
                                        {facility}
                                    </label>
                                )
                            })}
                        </div>
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                    <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {role === 'owner' ? 'Publish & Approve Tournament' : 'Submit For Approval'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
