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
    const [masterSports, setMasterSports] = useState([])
    const [sports, setSports] = useState([])

    // Loaders
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [isCardsLoading, setIsCardsLoading] = useState(false)
    const [isSubmitLoading, setIsSubmitLoading] = useState(false)
    const [isActionLoading, setIsActionLoading] = useState(null)

    // Modal state
    const [modal, setModal] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, sport: null })
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
                    if (masterRes && masterRes.success) {
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
                            if (sportsRes && sportsRes.success) {
                                setSports(sportsRes.data)
                            }
                        }
                    }
                } catch (err) {
                    console.error('Failed to load page configurations:', err)
                    addToast({ message: err.response?.data?.message || 'Failed to load page configurations.', type: 'error' })
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
        const allowedSports = ['Cricket', 'Football', 'Badminton', 'Tennis']
        const selectedSportObj = masterSports.find(s => s._id === currentSport.sportId)
        if (!selectedSportObj || !allowedSports.includes(selectedSportObj.name)) {
            addToast({ message: 'Only Cricket, Football, Badminton, and Tennis are allowed.', type: 'error' })
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
            const errorMsg = err.response?.data?.message || 'Failed to save sport configurations.'
            
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
            const errorMsg = err.response?.data?.message || 'Failed to update status.'
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
            addToast({ message: err.response?.data?.message || 'Failed to delete sport.', type: 'error' })
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
                                const selected = masterSports.find(s => s._id === selectedId)
                                setCurrentSport(prev => ({
                                    ...prev,
                                    sportId: selectedId,
                                    name: selected ? selected.name : '',
                                    icon: selected ? selected.icon : ''
                                }))
                            }}
                            options={masterSports
                                .filter(s => ['Cricket', 'Football', 'Badminton', 'Tennis'].includes(s.name))
                                .map(s => ({
                                    value: s._id,
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
        </div>
    )
}
