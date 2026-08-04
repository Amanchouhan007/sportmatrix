import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { HiCalendar, HiCurrencyRupee, HiUserGroup, HiUpload, HiArrowLeft } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'

export default function TournamentCreatePage({ role = 'owner' }) {
    const navigate = useNavigate()
    const { addToast } = useToast()

    const [form, setForm] = useState({
        title: '',
        banner: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800',
        sportId: 'sp_master_01',
        categoryId: 'cat_01',
        description: '',
        rules: '',
        courtName: 'Court A (Main Turf)',
        startDate: '',
        endDate: '',
        registrationLastDate: '',
        maxTeams: '16',
        minTeams: '4',
        entryFee: '500',
        winnerPrize: '30000',
        runnerPrize: '15000',
        thirdPrize: '5000',
        format: 'Knockout',
        matchDuration: '60',
        skillLevel: 'Open',
        ageLimit: 'Open',
        gender: 'All',
        status: role === 'owner' ? 'Approved' : 'Pending Approval'
    })

    const basePath = role === 'staff' ? '/staff/tournaments' : '/admin/tournaments'

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.title || !form.startDate || !form.endDate) {
            addToast({ title: 'Validation Error', message: 'Please fill in all required fields (Name, Start Date, End Date).', type: 'error' })
            return
        }

        const msg = role === 'owner' 
            ? 'Tournament created and approved automatically! Turf slots locked.' 
            : 'Tournament submitted successfully! Pending Owner approval.'

        addToast({ title: 'Success!', message: msg, type: 'success' })
        navigate(`${basePath}/all`)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
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
                {/* Basic Details */}
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
                                { value: 'sp_master_04', label: 'Basketball 🏀' },
                                { value: 'sp_master_05', label: 'Tennis 🎾' },
                            ]}
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

                        <Input
                            label="Banner Image URL"
                            placeholder="https://..."
                            value={form.banner}
                            onChange={(e) => setForm({ ...form, banner: e.target.value })}
                        />
                    </div>

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

                {/* Date & Turf Selection */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-surface-900 border-b border-surface-100 pb-3 flex items-center gap-2">
                        <HiCalendar className="text-primary-600" /> Date & Turf Schedule
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Start Date *"
                            type="date"
                            value={form.startDate}
                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            required
                        />

                        <Input
                            label="End Date *"
                            type="date"
                            value={form.endDate}
                            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                            required
                        />

                        <Input
                            label="Registration Last Date"
                            type="date"
                            value={form.registrationLastDate}
                            onChange={(e) => setForm({ ...form, registrationLastDate: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                </Card>

                {/* Team Limits, Fees & Prize Distribution */}
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

                {/* Tournament Format & Criteria */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-surface-900 border-b border-surface-100 pb-3 flex items-center gap-2">
                        <HiUserGroup className="text-indigo-600" /> Format & Player Criteria
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
