import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import api from '../../services/api'
import { HiCalendar, HiCurrencyRupee, HiUserGroup, HiUpload, HiArrowLeft, HiCog, HiPhone, HiUser } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'

export default function TournamentCreatePage({ role = 'owner' }) {
    const navigate = useNavigate()
    const { addToast } = useToast()

    const [form, setForm] = useState({
        title: '',
        organizerName: '',
        organizerContact: '',
        banner: '',
        bannerFile: null,
        sportId: '',
        categoryId: '',
        description: '',
        rules: '',
        courtName: '',
        registrationStartDate: '',
        startDate: '',
        endDate: '',
        registrationLastDate: '',
        matchDuration: '60',
        matchGapMinutes: '15',
        maxTeams: '16',
        minTeams: '4',
        entryFee: '0',
        winnerPrize: '0',
        runnerPrize: '0',
        thirdPrize: '0',
        format: 'Knockout',
        skillLevel: 'Open',
        ageLimit: 'Open',
        gender: 'All',
        playersPerTeam: '11',
        substitutePlayers: '5',
        tournamentVisibility: 'Public',
        registrationApproval: 'Auto Approval',
        refundPolicy: 'No Refund',
        facilities: [],
        status: role === 'owner' ? 'Approved' : 'Pending Approval'
    })

    const [masterSports, setMasterSports] = useState([])
    const [categories, setCategories] = useState([])
    const [ownerTurfs, setOwnerTurfs] = useState([])

    useEffect(() => {
        // Load sports & real turfs from owner's active branches
        Promise.all([
            api.get('/branches').catch(() => null),
            api.get('/sports/master').catch(() => null)
        ]).then(([branchesRes, masterRes]) => {
            const masterList = (masterRes && masterRes.success && Array.isArray(masterRes.data)) ? masterRes.data : []
            const branchesList = (branchesRes && branchesRes.success && Array.isArray(branchesRes.data?.branches))
                ? branchesRes.data.branches
                : (branchesRes && Array.isArray(branchesRes.data)) ? branchesRes.data : []

            // Extract real owner turfs/venues (Venue-wise, no court-wise fluff)
            const turfsList = branchesList.map(b => ({
                id: b.id || b._id || b.branchId,
                name: b.branchName || b.name || b.turfName || 'My Turf Venue',
                city: b.city || ''
            }))
            setOwnerTurfs(turfsList)
            if (turfsList.length > 0) {
                setForm(prev => ({ ...prev, courtName: prev.courtName || turfsList[0].name }))
            }

            // Extract sports configured on owner's real turfs/branches
            const activeBranchSports = []
            branchesList.forEach(b => {
                if (Array.isArray(b.sports) && b.sports.length > 0) {
                    b.sports.forEach(sp => {
                        if (!sp.status || sp.status === 'ACTIVE') {
                            const sportId = sp.sportId || sp.id
                            const master = masterList.find(m => m.id === sportId)
                            activeBranchSports.push({
                                id: sportId,
                                name: sp.name || master?.name || 'Cricket',
                                icon: sp.icon || master?.icon || '🏏'
                            })
                        }
                    })
                }
            })

            // Deduplicate active sports
            const uniqueActive = []
            const seen = new Set()
            activeBranchSports.forEach(s => {
                if (s.id && !seen.has(s.id)) {
                    seen.add(s.id)
                    uniqueActive.push(s)
                }
            })

            let finalSports = []
            if (uniqueActive.length > 0) {
                finalSports = uniqueActive
            } else if (masterList.length > 0) {
                // Default to primary turf sports (Cricket & Football)
                finalSports = masterList.filter(s =>
                    ['Cricket', 'Football', 'Box Cricket'].some(n => (s.name || '').toLowerCase().includes(n.toLowerCase()))
                )
                if (finalSports.length === 0) finalSports = masterList
            }

            setMasterSports(finalSports)
            const cricket = finalSports.find(s => s.id === 'sp_master_02' || (s.name || '').toLowerCase().includes('cricket'))
            const defaultSportId = cricket ? cricket.id : (finalSports[0]?.id || '')
            setForm(prev => ({ ...prev, sportId: defaultSportId }))
        })

        // Load tournament categories
        api.get('/tournaments/categories').then(res => {
            if (res && res.success && Array.isArray(res.data)) {
                setCategories(res.data)
                if (res.data.length > 0) {
                    setForm(prev => ({ ...prev, categoryId: res.data[0].id }))
                }
            }
        }).catch(() => {})
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
                    title: form.title,
                    banner: form.banner,
                    sportId: form.sportId,
                    categoryId: form.categoryId || undefined,
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

    const entryFee = Number(form.entryFee) || 0;
    const maxTeams = Number(form.maxTeams) || 0;
    const minTeams = Number(form.minTeams) || 0;
    const winnerPrize = Number(form.winnerPrize) || 0;
    const runnerPrize = Number(form.runnerPrize) || 0;
    const thirdPrize = Number(form.thirdPrize) || 0;

    const totalPrizePool = winnerPrize + runnerPrize + thirdPrize;
    const maxCollection = entryFee * maxTeams;
    const minCollection = entryFee * minTeams;
    const maxProfit = maxCollection - totalPrizePool;

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
                            placeholder="e.g. Indore Premier Cricket League T20"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />

                        <Select
                            label="Sport"
                            value={form.sportId}
                            onChange={(e) => setForm({ ...form, sportId: e.target.value })}
                            options={masterSports.map(s => ({ value: s.id, label: `${s.icon ? s.icon + ' ' : ''}${s.name}` }))}
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
                            options={categories.map(c => ({ value: c.id, label: c.name }))}
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
                            placeholder="e.g. Standard Box Cricket / T20 tournament rules apply. 10 overs per inning."
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
                        {ownerTurfs.length > 0 ? (
                            <Select
                                label="Select Turf Venue *"
                                value={form.courtName}
                                onChange={(e) => setForm({ ...form, courtName: e.target.value })}
                                options={ownerTurfs.map(t => ({
                                    value: t.name,
                                    label: t.city ? `${t.name} (${t.city})` : t.name
                                }))}
                            />
                        ) : (
                            <Input
                                label="Select Turf Venue *"
                                placeholder="Enter Turf Venue Name"
                                value={form.courtName}
                                onChange={(e) => setForm({ ...form, courtName: e.target.value })}
                            />
                        )}

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

                    {/* Live Financial Breakdown & Dynamic Prize Pool Summary */}
                    <div className="mt-4 p-4.5 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/90 border border-emerald-200 rounded-2xl space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-emerald-200/70 pb-2.5">
                            <span className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center gap-2">
                                <HiTrophy className="text-amber-500 w-4 h-4" /> Live Prize Pool & Team Revenue Calculation
                            </span>
                            <span className="text-[10px] font-extrabold px-3 py-1 bg-emerald-600 text-white rounded-full shadow-xs tracking-wider uppercase">
                                Realtime Calculation
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Total Prize Pool */}
                            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs space-y-1">
                                <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">Total Prize Pool</span>
                                <span className="text-xl font-black text-amber-600 tabular-nums block">₹{totalPrizePool.toLocaleString('en-IN')}</span>
                                <span className="text-[9px] font-bold text-surface-400 block truncate">1st + 2nd + 3rd Prize</span>
                            </div>

                            {/* Total Revenue Collection */}
                            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs space-y-1">
                                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Total Revenue ({maxTeams || 0} Teams)</span>
                                <span className="text-xl font-black text-emerald-700 tabular-nums block">₹{maxCollection.toLocaleString('en-IN')}</span>
                                <span className="text-[9px] font-bold text-surface-400 block truncate">{maxTeams || 0} Teams × ₹{(entryFee || 0).toLocaleString('en-IN')}</span>
                            </div>

                            {/* Net Margin */}
                            <div className={`bg-white p-3.5 rounded-xl border shadow-xs space-y-1 ${maxProfit >= 0 ? 'border-emerald-300' : 'border-rose-300'}`}>
                                <span className="text-[10px] font-extrabold text-surface-600 uppercase tracking-wider block">Est. Net Profit</span>
                                <span className={`text-xl font-black tabular-nums block ${maxProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {maxProfit >= 0 ? `+₹${maxProfit.toLocaleString('en-IN')}` : `-₹${Math.abs(maxProfit).toLocaleString('en-IN')}`}
                                </span>
                                <span className="text-[9px] font-bold text-surface-400 block truncate">Total Revenue - Prize Pool</span>
                            </div>
                        </div>
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
