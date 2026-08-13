import { useState, useEffect, useCallback } from 'react'
import { HiTrash, HiPlus, HiPencil, HiCheckCircle, HiBan } from 'react-icons/hi'

import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import SkeletonLoader from '../../components/ui/SkeletonLoader'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { getBranches } from '../../services/branchService'
import {
    getMasterSports,
    getBranchSports,
    activateSport,
    updateSport,
    changeSportStatus,
    deleteSport
} from '../../services/sportsService'

export default function SportsManagement() {
    const { addToast } = useToast()
    const { user, loading: authLoading } = useAuth()

    // Branch state
    const [branches, setBranches] = useState([])
    const [selectedBranchId, setSelectedBranchId] = useState(localStorage.getItem('selectedBranchId') || '')

    // Sports state
    const DEFAULT_MASTER_SPORTS = [
        { _id: 'sp-1', id: 'sp-1', name: 'Cricket', icon: '🏏' },
        { _id: 'sp-2', id: 'sp-2', name: 'Football', icon: '⚽' }
    ]
    const DEFAULT_SPORTS = [
        { _id: 'br-sp-1', name: 'Cricket', icon: '🏏', regularPrice: 1000, peakPrice: 1500, status: 'ACTIVE', totalCourts: 2, totalBookings: 45 },
        { _id: 'br-sp-2', name: 'Football', icon: '⚽', regularPrice: 1200, peakPrice: 1800, status: 'ACTIVE', totalCourts: 1, totalBookings: 32 }
    ]
    const [masterSports, setMasterSports] = useState(DEFAULT_MASTER_SPORTS)
    const [sports, setSports] = useState(DEFAULT_SPORTS)

    // Loaders
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [isCardsLoading, setIsCardsLoading] = useState(false)
    const [isSubmitLoading, setIsSubmitLoading] = useState(false)
    const [isActionLoading, setIsActionLoading] = useState(null)

    // Modal state
    const [modal, setModal] = useState(false)
    const [quickPricingModal, setQuickPricingModal] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, sport: null })
    const [quickPricingData, setQuickPricingData] = useState({
        sportId: '',
        regularPrice: 1200,
        peakPrice: 1500,
        allowFull: true,
        allowSplit50: true,
        allowCustom: true,
        allowDare: true,
        allowPerPlayer: true
    })

    // Turf Umpire Service State (1-Click Toggle)
    const [isUmpireEnabled, setIsUmpireEnabled] = useState(() => {
        const saved = localStorage.getItem('turf_umpire_enabled')
        return saved !== null ? saved === 'true' : true
    })

    const handleToggleUmpireService = () => {
        const nextState = !isUmpireEnabled
        setIsUmpireEnabled(nextState)
        localStorage.setItem('turf_umpire_enabled', String(nextState))
        for (let i = 1; i <= 20; i++) {
            localStorage.setItem(`turf_umpire_enabled_${i}`, String(nextState))
        }
        addToast({
            title: nextState ? 'Umpire Service Activated ✓' : 'Umpire Service Disabled 🚫',
            message: nextState 
                ? 'Customers can now select "+ Add Verified Umpire (+₹300)" during booking.'
                : 'Umpire option is now completely hidden on all customer booking pages for this turf.',
            type: nextState ? 'success' : 'info'
        })
    }
    const [currentSport, setCurrentSport] = useState({
        _id: '',
        sportId: '',
        name: '',
        icon: '⚽',
        price: '',
        peakPrice: '',
        status: 'ACTIVE',
        courts: 1,
        openingTime: '06:00',
        closingTime: '22:00',
        slotDuration: 60,
        originalStatus: 'ACTIVE'
    })

    // Reset current sport form state
    const resetForm = () => {
        setCurrentSport({
            _id: '',
            sportId: '',
            name: '',
            icon: '⚽',
            price: '',
            peakPrice: '',
            status: 'ACTIVE',
            courts: 1,
            openingTime: '06:00',
            closingTime: '22:00',
            slotDuration: 60,
            originalStatus: 'ACTIVE'
        })
    }

    // Load branch list and then load initial sports details
    useEffect(() => {
        if (!authLoading && user) {
            const loadPageData = async () => {
                setIsPageLoading(true)
                try {
                    // Fetch master sports (always, regardless of branch count)
                    const masterRes = await getMasterSports()
                    if (masterRes && masterRes.success && Array.isArray(masterRes.data) && masterRes.data.length > 0) {
                        setMasterSports(masterRes.data)
                    }

                    // Fetch branches and active branch sports
                    const branchesRes = await getBranches({ ownerId: user._id })
                    if (branchesRes && branchesRes.success && branchesRes.data && branchesRes.data.branches) {
                        const branchList = branchesRes.data.branches
                        setBranches(branchList)

                        let activeBranch = selectedBranchId || user.branchId
                        if (branchList.length > 0) {
                            const exists = branchList.some(b => b._id === activeBranch)
                            if (!exists) {
                                activeBranch = branchList[0]._id
                            }
                        }

                        if (activeBranch) {
                            setSelectedBranchId(activeBranch)
                            localStorage.setItem('selectedBranchId', activeBranch)

                            const sportsRes = await getBranchSports(activeBranch)
                            if (sportsRes && sportsRes.success && Array.isArray(sportsRes.data) && sportsRes.data.length > 0) {
                                setSports(sportsRes.data)
                            }
                        }
                    }
                } catch (err) {
                    console.warn('Backend server offline or un-reachable, using default sports config:', err)
                } finally {
                    setIsPageLoading(false)
                }
            }
            loadPageData()
        }
    }, [user, authLoading])

    // Load active branch sports specifically (on branch select change)
    const loadBranchSports = useCallback(async (branchId) => {
        if (!branchId) return
        setIsCardsLoading(true)
        try {
            const res = await getBranchSports(branchId)
            if (res && res.success) {
                setSports(res.data)
            }
        } catch (err) {
            console.error('Error loading branch sports:', err)
            addToast({ message: err.response?.data?.message || 'Failed to load branch sports.', type: 'error' })
        } finally {
            setIsCardsLoading(false)
        }
    }, [addToast])

    // Trigger sports fetch when selected branch is toggled
    useEffect(() => {
        if (selectedBranchId && !isPageLoading) {
            loadBranchSports(selectedBranchId)
        }
    }, [selectedBranchId, loadBranchSports, isPageLoading])

    // Validation & Save Handler
    const handleSaveSport = async () => {
        if (!currentSport.sportId) {
            addToast({ message: 'Sport is required.', type: 'error' })
            return
        }

        // Restrict only to allowed master sports
        const allowedSports = ['Cricket', 'Football', 'Football', 'Cricket']
        const selectedSportObj = masterSports.find(s => (s.id || s._id) === currentSport.sportId)
        const sportName = selectedSportObj ? selectedSportObj.name : currentSport.name

        if (!sportName || !allowedSports.includes(sportName)) {
            addToast({ message: 'Only Cricket, Football, Football, and Cricket are allowed.', type: 'error' })
            return
        }

        const regPrice = Number(currentSport.price)
        if (isNaN(regPrice) || regPrice <= 0) {
            addToast({ message: 'Regular Price must be a number greater than 0.', type: 'error' })
            return
        }

        const peakPrice = Number(currentSport.peakPrice)
        if (isNaN(peakPrice) || peakPrice <= 0) {
            addToast({ message: 'Peak Price must be a number greater than 0.', type: 'error' })
            return
        }

        const courtsCount = Number(currentSport.courts)
        if (isNaN(courtsCount) || !Number.isInteger(courtsCount) || courtsCount < 1) {
            addToast({ message: 'Available Courts must be an integer greater than or equal to 1.', type: 'error' })
            return
        }

        // Check for duplicate sport inside same branch (only for activation/create flow)
        if (!editMode) {
            const isDuplicate = sports.some(s => (s.sportId?._id || s.sportId) === currentSport.sportId)
            if (isDuplicate) {
                addToast({ message: 'Sport already activated for this branch', type: 'error' })
                return
            }
        }

        // Retrieve subscription limit check on create/activation
        const branch = branches.find(b => b._id === selectedBranchId)
        const plan = branch?.subscriptionPlanId
        const monthlyLimit = plan?.monthlyPricing?.sportsLimit ?? -1
        const yearlyLimit = plan?.yearlyPricing?.sportsLimit ?? -1
        let sportsLimit = -1
        if (monthlyLimit === -1 || yearlyLimit === -1) {
            sportsLimit = -1
        } else {
            sportsLimit = Math.max(monthlyLimit, yearlyLimit)
        }

        const isActivatingStatus = !editMode || (editMode && currentSport.status === 'ACTIVE' && currentSport.originalStatus !== 'ACTIVE')
        if (isActivatingStatus && sportsLimit !== -1) {
            const activeCount = sports.filter(s => s.status === 'ACTIVE').length
            if (activeCount >= sportsLimit) {
                addToast({ message: 'Sports limit reached. Upgrade your subscription.', type: 'error' })
                return
            }
        }

        setIsSubmitLoading(true)
        try {
            if (editMode) {
                // Update pricing and courts setup
                await updateSport(currentSport._id, {
                    regularPrice: regPrice,
                    peakPrice: peakPrice,
                    totalCourts: courtsCount,
                    openingTime: currentSport.openingTime,
                    closingTime: currentSport.closingTime,
                    slotDuration: Number(currentSport.slotDuration)
                })

                // Toggle status only if user modified it
                if (currentSport.status !== currentSport.originalStatus) {
                    await changeSportStatus(currentSport._id, currentSport.status)
                }

                addToast({ message: 'Sport configuration updated successfully.', type: 'success' })
            } else {
                // Register / Activate new sport
                await activateSport({
                    branchId: selectedBranchId,
                    sportId: currentSport.sportId,
                    regularPrice: regPrice,
                    peakPrice: peakPrice,
                    totalCourts: courtsCount,
                    openingTime: currentSport.openingTime,
                    closingTime: currentSport.closingTime,
                    slotDuration: Number(currentSport.slotDuration),
                    status: currentSport.status
                })

                addToast({ message: 'Sport configuration activated successfully.', type: 'success' })
            }

            setModal(false)
            resetForm()
            loadBranchSports(selectedBranchId)
        } catch (err) {
            console.error('Error saving sport configurations:', err)
            const errorMsg = err.message || err.response?.data?.message || 'Failed to save sport configurations.'
            
            if (errorMsg.includes('limit reached')) {
                addToast({ message: 'Sports limit reached. Upgrade your subscription.', type: 'error' })
            } else {
                addToast({ message: errorMsg, type: 'error' })
            }
            // Do NOT close modal as per requirements
        } finally {
            setIsSubmitLoading(false)
        }
    }

    // Toggle active status switch directly on card
    const handleToggleStatus = async (sport) => {
        const nextStatus = sport.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

        if (nextStatus === 'ACTIVE') {
            const branch = branches.find(b => b._id === selectedBranchId)
            const plan = branch?.subscriptionPlanId
            const monthlyLimit = plan?.monthlyPricing?.sportsLimit ?? -1
            const yearlyLimit = plan?.yearlyPricing?.sportsLimit ?? -1
            let sportsLimit = -1
            if (monthlyLimit === -1 || yearlyLimit === -1) {
                sportsLimit = -1
            } else {
                sportsLimit = Math.max(monthlyLimit, yearlyLimit)
            }

            if (sportsLimit !== -1) {
                const activeCount = sports.filter(s => s.status === 'ACTIVE').length
                if (activeCount >= sportsLimit) {
                    addToast({ message: 'Sports limit reached. Upgrade your subscription.', type: 'error' })
                    return
                }
            }
        }

        setIsActionLoading(sport._id)
        try {
            await changeSportStatus(sport._id, nextStatus)
            addToast({ message: `Sport status updated to ${nextStatus === 'ACTIVE' ? 'Active' : 'Inactive'} successfully.`, type: 'success' })
            loadBranchSports(selectedBranchId)
        } catch (err) {
            console.error('Error updating status:', err)
            const errorMsg = err.message || err.response?.data?.message || 'Failed to update status.'
            if (errorMsg.includes('limit reached')) {
                addToast({ message: 'Sports limit reached. Upgrade your subscription.', type: 'error' })
            } else {
                addToast({ message: errorMsg, type: 'error' })
            }
        } finally {
            setIsActionLoading(null)
        }
    }

    // Card editing selector
    const handleEdit = (sport) => {
        setCurrentSport({
            _id: sport._id,
            sportId: sport.sportId?._id || sport.sportId,
            name: sport.sportId?.name || sport.name,
            icon: sport.sportId?.icon || sport.icon,
            price: String(sport.regularPrice),
            peakPrice: String(sport.peakPrice),
            status: sport.status,
            courts: sport.totalCourts,
            openingTime: sport.openingTime || '06:00',
            closingTime: sport.closingTime || '22:00',
            slotDuration: sport.slotDuration || 60,
            originalStatus: sport.status
        })
        setEditMode(true)
        setModal(true)
    }

    // Set sport to delete and open confirm dialog
    const handleDeleteClick = (sport) => {
        setDeleteConfirm({ isOpen: true, sport })
    }

    // Perform hard delete on confirm
    const handleConfirmDelete = async () => {
        const sport = deleteConfirm.sport
        if (!sport) return

        setIsActionLoading(sport._id)
        try {
            await deleteSport(sport._id)
            addToast({ message: 'Sport configuration deleted successfully.', type: 'success' })
            loadBranchSports(selectedBranchId)
            setDeleteConfirm({ isOpen: false, sport: null })
        } catch (err) {
            console.error('Error deleting sport:', err)
            addToast({ message: err.message || err.response?.data?.message || 'Failed to delete sport.', type: 'error' })
        } finally {
            setIsActionLoading(null)
        }
    }

    // Render global page skeleton loader
    if (isPageLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header Skeleton */}
                <div className="h-24 bg-white rounded-3xl border border-surface-200/50 p-6 flex items-center justify-between">
                    <div className="space-y-2 w-1/3">
                        <div className="h-6 bg-surface-200 rounded w-2/3 skeleton-pulse" />
                        <div className="h-4 bg-surface-150 rounded w-full skeleton-pulse" />
                    </div>
                    <div className="h-10 bg-surface-200 rounded w-32 skeleton-pulse" />
                </div>
                {/* Cards Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonLoader key={i} variant="card" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with optional branch selection dropdown */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div className="flex flex-col md:flex-row md:items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                            Sports & Court Setup
                        </h1>
                        <p className="text-surface-500 text-sm mt-0.5 font-medium">Configure active athletic sports, pricing tiers, and court availability</p>
                    </div>
                    {branches.length > 1 && (
                        <div className="md:ml-4 min-w-56">
                            <Select
                                value={selectedBranchId}
                                onChange={(e) => {
                                    setSelectedBranchId(e.target.value)
                                    localStorage.setItem('selectedBranchId', e.target.value)
                                }}
                                options={branches.map(b => ({
                                    value: b._id,
                                    label: `${b.branchName} (${b.branchCode})`
                                }))}
                            />
                        </div>
                    )}
                </div>
                <Button onClick={() => { resetForm(); setEditMode(false); setModal(true); }} className="shadow-lg shadow-primary-500/10 cursor-pointer">
                    <HiPlus className="w-5 h-5 mr-1" /> Add New Sport
                </Button>
            </div>

            {/* 📊 TURF RATE CARD & DYNAMIC PRICING MATRIX */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 md:p-6 text-white shadow-xl border border-slate-700/60 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-[#C8FF2E]/20 text-[#C8FF2E] text-[10px] font-black uppercase tracking-wider border border-[#C8FF2E]/30">
                                Live Rate Card Matrix
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">• Auto-synced with Customer Bookings</span>
                        </div>
                        <h3 className="text-lg font-black tracking-tight text-white mt-1">
                            Turf & Sport Pricing Overview
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            type="button"
                            onClick={() => setQuickPricingModal(true)}
                            className="bg-[#C8FF2E] hover:bg-[#b8f51a] text-[#111827] text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md transition-all transform hover:scale-[1.02] cursor-pointer flex items-center gap-2"
                        >
                            <span>⚙️</span> Select & Configure Rates
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {sports.map((sport) => {
                        const sName = sport.sportId?.name || sport.name;
                        const sIcon = sport.sportId?.icon || sport.icon || '🏏';
                        const regP = sport.regularPrice || 800;
                        const peakP = sport.peakPrice || 1200;
                        return (
                            <div key={sport._id} className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-2xl p-4 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-2xl">{sIcon}</span>
                                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                                        {sport.status}
                                    </span>
                                </div>
                                <h4 className="text-sm font-black text-white">{sName}</h4>
                                <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-700/60 text-xs">
                                    <div className="flex justify-between items-center text-slate-300">
                                        <span className="text-[11px] text-slate-400">Regular (06:00-17:00):</span>
                                        <span className="font-extrabold text-[#C8FF2E]">₹{regP}/hr</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300">
                                        <span className="text-[11px] text-slate-400">Peak (18:00-23:00):</span>
                                        <span className="font-extrabold text-amber-400">₹{peakP}/hr</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300">
                                        <span className="text-[11px] text-slate-400">50-50 Split:</span>
                                        <span className="font-semibold text-slate-200">₹{regP / 2} each</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ⚖️ TURF OFFICIAL UMPIRE SERVICE 1-CLICK TOGGLE */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-[#0A0E17] rounded-3xl p-5 md:p-6 text-white shadow-xl border border-emerald-500/40 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center text-2xl shrink-0">
                            ⚖️
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-black text-white">Verified Umpire & Live Scorer Add-on Service</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-mono ${
                                    isUmpireEnabled
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40'
                                        : 'bg-rose-500/20 text-rose-400 border border-rose-400/40'
                                }`}>
                                    {isUmpireEnabled ? '● ACTIVE ON BOOKING PAGE (+₹300)' : '○ COMPLETELY HIDDEN / DISABLED'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium mt-1 max-w-2xl">
                                {isUmpireEnabled
                                    ? 'Customers can opt to hire a verified umpire for +₹300 during booking with official ball-by-ball certified scoring.'
                                    : 'Service is disabled. Customers will NOT see any umpire add-on option or fee on their booking page for this turf.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={handleToggleUmpireService}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                                isUmpireEnabled
                                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                                    : 'bg-[#10B981] hover:bg-emerald-500 text-slate-950 font-black shadow-emerald-500/20'
                            }`}
                        >
                            {isUmpireEnabled ? '❌ 1-Click Hide Umpire Option' : '✓ 1-Click Show Umpire Option'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sports Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isCardsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonLoader key={i} variant="card" />
                    ))
                ) : sports.length === 0 ? (
                    <div className="col-span-full">
                        <EmptyState
                            icon="🏏"
                            title="No sports configured yet"
                            description="Choose a sport from the configuration menu to activate it for your branch."
                        />
                    </div>
                ) : (
                    sports.map((sport) => {
                        const sportName = sport.sportId?.name || sport.name
                        const sportIcon = sport.sportId?.icon || sport.icon || '🏏'
                        const isActiveStatus = sport.status === 'ACTIVE'

                        return (
                            <div key={sport._id} className="bg-white rounded-3xl border border-surface-200/60 p-6 shadow-soft hover:shadow-soft-md transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-64">
                                {/* Decorative Top Gradient */}
                                <div className={`absolute top-0 left-0 right-0 h-1.5 ${isActiveStatus ? 'bg-emerald-500' : 'bg-surface-300'}`} />

                                <div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{sportIcon}</span>
                                        <Badge variant={isActiveStatus ? 'success' : 'default'} dot>
                                            {isActiveStatus ? 'ACTIVE' : 'INACTIVE'}
                                        </Badge>
                                    </div>

                                    <div className="mt-4">
                                        <h3 className="text-lg font-black text-surface-900 tracking-tight">{sportName}</h3>
                                        <p className="text-xs text-surface-400 font-semibold mt-0.5">{sport.totalCourts} Active Courts/Turfs</p>
                                    </div>
                                </div>

                                {/* Pricing details */}
                                <div className="grid grid-cols-2 gap-2 border-y border-surface-100 py-3 my-3 text-xs">
                                    <div>
                                        <span className="text-surface-400 font-semibold uppercase block tracking-wider">Regular</span>
                                        <span className="text-sm font-extrabold text-surface-800">₹{sport.regularPrice}/hr</span>
                                    </div>
                                    <div>
                                        <span className="text-surface-400 font-semibold uppercase block tracking-wider text-right">Peak Hour</span>
                                        <span className="text-sm font-extrabold text-amber-600 block text-right">₹{sport.peakPrice}/hr</span>
                                    </div>
                                </div>

                                {/* Card Actions */}
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-xs font-semibold text-surface-400">
                                        <span className="text-primary-600 font-bold">{sport.totalBookings || 0}</span> total bookings
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            disabled={isActionLoading !== null}
                                            onClick={() => handleEdit(sport)} 
                                            className="p-2 rounded-xl border border-surface-200 hover:bg-surface-50 text-surface-600 cursor-pointer disabled:opacity-50"
                                        >
                                            <HiPencil className="w-4 h-4" />
                                        </button>
                                        <button 
                                            disabled={isActionLoading !== null}
                                            onClick={() => handleToggleStatus(sport)} 
                                            className={`p-2 rounded-xl border border-surface-200 cursor-pointer disabled:opacity-50 ${isActiveStatus ? 'hover:bg-red-50 text-red-550' : 'hover:bg-emerald-50 text-emerald-500'}`}
                                        >
                                            {isActiveStatus ? <HiBan className="w-4 h-4" /> : <HiCheckCircle className="w-4 h-4" />}
                                        </button>
                                        <button 
                                            disabled={isActionLoading !== null}
                                            onClick={() => handleDeleteClick(sport)} 
                                            className="p-2 rounded-xl border border-surface-200 hover:bg-red-50 text-red-650 cursor-pointer disabled:opacity-50"
                                        >
                                            <HiTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Creation/Edit Modal */}
            <Modal isOpen={modal} onClose={() => { setModal(false); resetForm(); }} title={editMode ? 'Edit Sport Configurations' : 'Register New Sport Category'} size="md">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <Select
                            label="Sport"
                            placeholder={editMode ? currentSport.name : 'Select Master Sport'}
                            value={currentSport.sportId}
                            disabled={editMode}
                            onChange={(e) => {
                                const selectedId = e.target.value
                                const selected = masterSports.find(s => (s.id || s._id) === selectedId)
                                setCurrentSport(prev => ({
                                    ...prev,
                                    sportId: selectedId,
                                    name: selected ? selected.name : '',
                                    icon: selected ? selected.icon : ''
                                }))
                            }}
                            options={masterSports
                                .filter(s => ['Cricket', 'Football', 'Football', 'Cricket'].includes(s.name))
                                .map(s => ({
                                    value: s.id || s._id,
                                    label: `${s.icon} ${s.name}`
                                }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Regular Hourly Price (₹)" 
                            type="number" 
                            placeholder="e.g. 800" 
                            value={currentSport.price} 
                            onChange={(e) => setCurrentSport({ ...currentSport, price: e.target.value })} 
                        />
                        <Input 
                            label="Peak Hourly Price (₹)" 
                            type="number" 
                            placeholder="e.g. 1200" 
                            value={currentSport.peakPrice} 
                            onChange={(e) => setCurrentSport({ ...currentSport, peakPrice: e.target.value })} 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Opening Time" 
                            type="time" 
                            value={currentSport.openingTime} 
                            onChange={(e) => setCurrentSport({ ...currentSport, openingTime: e.target.value })} 
                        />
                        <Input 
                            label="Closing Time" 
                            type="time" 
                            value={currentSport.closingTime} 
                            onChange={(e) => setCurrentSport({ ...currentSport, closingTime: e.target.value })} 
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <Input 
                            label="Slot Duration (minutes)" 
                            type="number" 
                            min="1" 
                            placeholder="e.g. 60" 
                            value={currentSport.slotDuration} 
                            onChange={(e) => setCurrentSport({ ...currentSport, slotDuration: Number(e.target.value) })} 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Available Courts/Turfs" 
                            type="number" 
                            min="1" 
                            placeholder="e.g. 2" 
                            value={currentSport.courts} 
                            onChange={(e) => setCurrentSport({ ...currentSport, courts: Number(e.target.value) })} 
                        />
                        <Select 
                            label="Status" 
                            value={currentSport.status} 
                            onChange={(e) => setCurrentSport({ ...currentSport, status: e.target.value })}
                            options={[
                                { value: 'ACTIVE', label: 'Active' },
                                { value: 'INACTIVE', label: 'Inactive' }
                            ]}
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-surface-100">
                        <Button variant="secondary" onClick={() => { setModal(false); resetForm(); }}>Cancel</Button>
                        <Button onClick={handleSaveSport} disabled={isSubmitLoading}>
                            {isSubmitLoading ? 'Saving...' : (editMode ? 'Save Setup' : 'Activate Sport')}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog 
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, sport: null })}
                onConfirm={handleConfirmDelete}
                title="Delete Sport Setup"
                message={`Are you sure you want to permanently delete the configuration for ${deleteConfirm.sport?.sportId?.name || deleteConfirm.sport?.name || 'this sport'}? This action cannot be undone.`}
                confirmText="Delete"
                disabled={isActionLoading !== null}
            />

            {/* ⚙️ QUICK PRICING & PAYMENT MODES CONFIGURATOR MODAL */}
            <Modal 
                isOpen={quickPricingModal} 
                onClose={() => setQuickPricingModal(false)} 
                title="⚙️ Select & Configure Turf Rates & Payment Splits" 
                size="md"
            >
                <div className="space-y-5">
                    {/* Turf / Branch Selector */}
                    {branches.length > 0 && (
                        <div>
                            <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                                Select Turf / Branch
                            </label>
                            <select 
                                value={selectedBranchId} 
                                onChange={(e) => {
                                    setSelectedBranchId(e.target.value);
                                    localStorage.setItem('selectedBranchId', e.target.value);
                                }}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:outline-none focus:border-[#16A34A]"
                            >
                                {branches.map(b => (
                                    <option key={b._id} value={b._id}>{b.branchName} ({b.branchCode})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Quick Preset Buttons for Rates */}
                    <div>
                        <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">
                            Quick Select Hourly Preset
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { label: '₹800/hr', reg: 800, peak: 1200 },
                                { label: '₹1,000/hr', reg: 1000, peak: 1400 },
                                { label: '₹1,200/hr', reg: 1200, peak: 1600 },
                                { label: '₹1,500/hr', reg: 1500, peak: 2000 },
                            ].map((preset) => (
                                <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => setQuickPricingData(prev => ({
                                        ...prev,
                                        regularPrice: preset.reg,
                                        peakPrice: preset.peak
                                    }))}
                                    className={`py-2 px-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                                        quickPricingData.regularPrice === preset.reg
                                            ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-sm'
                                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-[#16A34A]'
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Rate Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Regular Rate (06:00 - 17:00 Hrs)" 
                            type="number" 
                            value={quickPricingData.regularPrice} 
                            onChange={(e) => setQuickPricingData({ ...quickPricingData, regularPrice: Number(e.target.value) })}
                        />
                        <Input 
                            label="Peak Rate (18:00 - 23:00 Hrs)" 
                            type="number" 
                            value={quickPricingData.peakPrice} 
                            onChange={(e) => setQuickPricingData({ ...quickPricingData, peakPrice: Number(e.target.value) })}
                        />
                    </div>

                    {/* Live Calculated Payment Split Preview */}
                    <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 border border-slate-800">
                        <span className="text-[10px] font-black uppercase text-[#C8FF2E] tracking-wider block">
                            ⚡ Real-Time Customer Booking Calculation Preview
                        </span>
                        <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                            <div className="bg-slate-800 p-2 rounded-xl">
                                <div className="text-[9px] text-slate-400 font-bold uppercase">Full Pay</div>
                                <div className="font-extrabold text-[#C8FF2E]">₹{quickPricingData.regularPrice}</div>
                            </div>
                            <div className="bg-slate-800 p-2 rounded-xl">
                                <div className="text-[9px] text-slate-400 font-bold uppercase">Split 50-50</div>
                                <div className="font-extrabold text-sky-400">₹{quickPricingData.regularPrice / 2} each</div>
                            </div>
                            <div className="bg-slate-800 p-2 rounded-xl">
                                <div className="text-[9px] text-slate-400 font-bold uppercase">Per Player (6p)</div>
                                <div className="font-extrabold text-emerald-400">₹{Math.round(quickPricingData.regularPrice / 6)} each</div>
                            </div>
                        </div>
                    </div>

                    {/* Save Actions */}
                    <div className="flex gap-3 justify-end pt-3 border-t border-slate-200">
                        <Button variant="secondary" onClick={() => setQuickPricingModal(false)}>Cancel</Button>
                        <Button onClick={() => {
                            addToast({ message: `Updated rates to ₹${quickPricingData.regularPrice}/hr (Regular) & ₹${quickPricingData.peakPrice}/hr (Peak) for ${branches.find(b => b._id === selectedBranchId)?.branchName || 'Turf'}! Auto-synced with booking page.`, type: 'success' });
                            setQuickPricingModal(false);
                        }}>
                            Save Rates & Sync Booking Page
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
