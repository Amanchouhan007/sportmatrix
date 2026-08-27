import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { FiTrash2, FiPower, FiSearch, FiBriefcase, FiCheckCircle, FiSlash, FiTrendingUp, FiEye, FiMapPin, FiUser, FiDownload, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi'
import { getOwners, createOwner } from '../../services/ownerService'
import { getAllPlans } from '../../services/subscriptionPlanService'
import {
    createBranch,
    getBranches,
    getBranchById,
    updateBranch,
    changeBranchStatus,
    deleteBranch,
    getDashboardStats
} from '../../services/branchService'

const fallbackBranches = []

export default function BranchManagement() {
    const { addToast } = useToast()
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    // Enforce SUPER_ADMIN authorization
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/login')
            } else {
                const normalizeRole = (r) => (r || '').toUpperCase().replace(/[-_]/g, '');
                const rNorm = normalizeRole(user.role);
                if (rNorm !== 'SUPERADMIN' && rNorm !== 'OWNER') {
                    if (rNorm === 'STAFF') navigate('/staff')
                    else if (rNorm === 'CUSTOMER') navigate('/customer')
                    else navigate('/login')
                }
            }
        }
    }, [user, authLoading, navigate])

    // Main States
    const [branches, setBranches] = useState([])
    const [stats, setStats] = useState({
        totalBranches: 0,
        activeBranches: 0,
        inactiveBranches: 0,
        totalRevenue: 0
    })

    // Pagination
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        pages: 1
    })

    // Dropdown options
    const [owners, setOwners] = useState([])
    const [subscriptionPlans, setSubscriptionPlans] = useState([])

    // Search and Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('ALL')
    const [selectedOwnerId, setSelectedOwnerId] = useState('ALL')
    const [selectedPlanId, setSelectedPlanId] = useState('ALL')

    // Modal and Confirmation Dialog
    const [modal, setModal] = useState(false)
    const [editingBranch, setEditingBranch] = useState(null)
    const [confirm, setConfirm] = useState({ open: false, type: '', id: null })

    // Modal for viewing branch details
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [viewingBranch, setViewingBranch] = useState(null)

    // Loading States
    const [isPageLoading, setIsPageLoading] = useState(false)
    const [isTableLoading, setIsTableLoading] = useState(false)
    const [isSubmitLoading, setIsSubmitLoading] = useState(false)

    // Searchable dropdown state for owner selection
    const [ownerSearchText, setOwnerSearchText] = useState('')
    const [showOwnerDropdown, setShowOwnerDropdown] = useState(false)

    // Form Data reflecting full backend schema
    const [formData, setFormData] = useState({
        branchName: '',
        branchCode: '',
        description: '',
        ownerId: '',
        subscriptionPlanId: '',
        country: '',
        state: '',
        city: '',
        zipCode: '',
        fullAddress: '',
        email: '',
        mobile: '',
        alternateMobile: '',
        gstNumber: '',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        logo: '',
        images: [],
        ownerOption: 'EXISTING',
        newOwnerName: '',
        newOwnerBusinessName: '',
        status: 'ACTIVE'
    })

    const [galleryUrlInput, setGalleryUrlInput] = useState('')

    // Quick Register New Owner state inside modal
    const [isQuickAddOwnerOpen, setIsQuickAddOwnerOpen] = useState(false)
    const [quickOwnerData, setQuickOwnerData] = useState({
        fullName: '',
        businessName: '',
        email: '',
        mobile: '',
        password: 'password123'
    })
    const [isQuickOwnerLoading, setIsQuickOwnerLoading] = useState(false)

    const handleQuickAddOwnerSave = async () => {
        if (!quickOwnerData.fullName.trim()) {
            addToast({ title: 'Required Field', message: 'Please enter New Owner Full Name', type: 'error' })
            return
        }
        try {
            setIsQuickOwnerLoading(true)
            const payload = {
                fullName: quickOwnerData.fullName.trim(),
                businessName: quickOwnerData.businessName.trim() || `${quickOwnerData.fullName.trim()} Sports Network`,
                email: quickOwnerData.email.trim() || `owner_${Date.now()}@turf.com`,
                mobile: quickOwnerData.mobile.trim() || '9876543210',
                password: quickOwnerData.password ? quickOwnerData.password.trim() : 'password123'
            }
            const res = await createOwner(payload)
            const newOwnerObj = (res && (res.data || res.owner)) || {
                _id: 'own_' + Date.now(),
                id: 'own_' + Date.now(),
                fullName: payload.fullName,
                businessName: payload.businessName,
                email: payload.email
            }
            
            const newId = newOwnerObj._id || newOwnerObj.id
            setOwners(prev => [newOwnerObj, ...prev])
            setFormData(prev => ({ ...prev, ownerId: newId }))
            setIsQuickAddOwnerOpen(false)
            setQuickOwnerData({ fullName: '', businessName: '', email: '', mobile: '', password: 'password123' })
            addToast({ title: 'Owner Registered', message: `${newOwnerObj.fullName} registered live in database!`, type: 'success' })
        } catch (error) {
            console.error('Quick owner creation error:', error)
            addToast({ title: 'Error', message: error.response?.data?.message || 'Failed to register owner', type: 'error' })
        } finally {
            setIsQuickOwnerLoading(false)
        }
    }

    // Fetch drop-down data once on load
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [ownersRes, plansRes] = await Promise.all([
                    getOwners({ limit: 1000 }),
                    getAllPlans()
                ])
                const rawOwners = ownersRes.data?.owners || []
                const normalizedOwners = rawOwners.map(o => ({
                    ...o,
                    _id: o._id || o.id,
                    fullName: o.fullName || o.name || o.ownerName || 'Owner',
                    email: o.email || ''
                }))
                setOwners(normalizedOwners)
                setSubscriptionPlans(plansRes.data || [])
            } catch (error) {
                console.error('Error fetching configuration dropdowns:', error)
            }
        }
        fetchDropdowns()
    }, [])

    // Load statistics
    const loadStats = async () => {
        try {
            const userRoleNorm = (user?.role || '').toUpperCase().replace(/[-_]/g, '');
            const isOwnerRole = userRoleNorm === 'OWNER' || userRoleNorm === 'ADMIN';
            const statsFilters = {
                ownerId: isOwnerRole ? (user?._id || user?.id) : selectedOwnerId,
                email: isOwnerRole ? (user?.email || '') : ''
            };
            const res = await getDashboardStats(statsFilters);
            const statsData = res?.data?.data || res?.data || (res && res.totalBranches !== undefined ? res : null);
            if (statsData) {
                setStats(statsData);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    // Convert and handle local photo selection
    const handleLogoChange = (e) => {
        const file = e.target.files && e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                addToast({ title: 'File Too Large', message: 'Logo image size should be under 5MB', type: 'error' })
                return
            }
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result }))
                addToast({ title: 'Logo Uploaded', message: 'Logo preview loaded successfully', type: 'success' })
            }
            reader.readAsDataURL(file)
        }
    }

    // Multiple Gallery Photos Upload handler
    const handleGalleryPhotosChange = (e) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        let loadedImages = []
        let processed = 0

        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                addToast({ title: 'Size Warning', message: `Image ${file.name} exceeds 5MB limit`, type: 'error' })
                processed++
                return
            }
            const reader = new FileReader()
            reader.onloadend = () => {
                loadedImages.push(reader.result)
                processed++
                if (processed === files.length) {
                    setFormData(prev => ({
                        ...prev,
                        images: [...(prev.images || []), ...loadedImages]
                    }))
                    addToast({ title: 'Photos Uploaded', message: `${loadedImages.length} gallery photo(s) added successfully`, type: 'success' })
                }
            }
            reader.readAsDataURL(file)
        })
    }

    const handleAddGalleryUrl = () => {
        if (!galleryUrlInput.trim()) return
        setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), galleryUrlInput.trim()]
        }))
        setGalleryUrlInput('')
        addToast({ title: 'Photo Added', message: 'Gallery photo added via URL', type: 'success' })
    }

    const handleRemoveGalleryPhoto = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, idx) => idx !== indexToRemove)
        }))
    }

    // Load branches with filters, search, and pagination
    const loadBranches = async () => {
        try {
            setIsTableLoading(true)
            const userRoleNorm = (user?.role || '').toUpperCase().replace(/[-_]/g, '');
            const isOwnerRole = userRoleNorm === 'OWNER' || userRoleNorm === 'ADMIN';
            const filters = {
                page,
                limit,
                search: searchTerm,
                status: selectedStatus,
                ownerId: isOwnerRole ? (user?._id || user?.id) : selectedOwnerId,
                email: isOwnerRole ? (user?.email || '') : '',
                subscriptionPlanId: selectedPlanId
            }
            const res = await getBranches(filters)
            const branchList = (res && res.data?.branches) || (res && Array.isArray(res.branches) ? res.branches : (Array.isArray(res) ? res : []))
            const paginationInfo = (res && res.data?.pagination) || (res && res.pagination ? res.pagination : null)

            if (branchList && Array.isArray(branchList)) {
                setBranches(branchList)
                setPagination(paginationInfo || { total: branchList.length, page: 1, limit: 10, pages: 1 })

                const userRoleNorm = (user?.role || '').toUpperCase().replace(/[-_]/g, '');
                if (userRoleNorm === 'OWNER' || userRoleNorm === 'ADMIN') {
                    const activeCount = branchList.filter(b => b.status === 'ACTIVE' || !b.status).length;
                    const inactiveCount = branchList.filter(b => b.status === 'INACTIVE' || b.status === 'SUSPENDED').length;
                    const revenueSum = branchList.reduce((acc, b) => acc + (Number(b.totalRevenue ?? b.bookingRevenue ?? b.planPrice ?? 0)), 0);
                    setStats({
                        totalBranches: branchList.length,
                        activeBranches: activeCount,
                        inactiveBranches: inactiveCount,
                        suspendedBranches: 0,
                        totalRevenue: revenueSum
                    });
                }
            } else {
                setBranches([])
                setPagination({ total: 0, page: 1, limit: 10, pages: 1 })
            }
        } catch (error) {
            console.error('Error loading branches:', error)
            setBranches([])
            setPagination({ total: 0, page: 1, limit: 10, pages: 1 })
        } finally {
            setIsTableLoading(false)
        }
    }

    const ownerOptions = useMemo(() => {
        const map = new Map();
        (branches || []).forEach(b => {
            const ownerObj = b.ownerId;
            const id = typeof ownerObj === 'object' ? (ownerObj?._id || ownerObj?.id) : (typeof ownerObj === 'string' ? ownerObj : null);
            const name = typeof ownerObj === 'object' ? (ownerObj?.fullName || ownerObj?.name) : 'Owner';
            if (id && typeof id === 'string') {
                map.set(id, { value: id, label: name || 'Owner' });
            }
        });
        return [{ value: 'ALL', label: 'All Owners' }, ...Array.from(map.values())];
    }, [branches]);

    const planOptions = useMemo(() => {
        const list = (subscriptionPlans || []).map(p => {
            const id = typeof p === 'object' ? (p._id || p.id) : String(p);
            const name = typeof p === 'object' ? (p.planName || p.name) : String(p);
            return { value: id, label: name };
        }).filter(p => p.value && typeof p.value === 'string');
        return [{ value: 'ALL', label: 'All Plans' }, ...list];
    }, [subscriptionPlans]);

    // Load branches reactively on mount and filter changes
    useEffect(() => {
        loadBranches()
        loadStats()
    }, [page, searchTerm, selectedStatus, selectedOwnerId, selectedPlanId])

    // Fetch individual branch and load detail view modal
    const handleViewBranch = async (branch) => {
        if (!branch) return
        setViewingBranch(branch)
        setIsViewModalOpen(true)
        try {
            const targetId = branch._id || branch.id
            const res = await getBranchById(targetId)
            if (res && (res.data || res.branch)) {
                setViewingBranch(res.data || res.branch)
            }
        } catch (error) {
            console.warn('Branch detail lookup note:', error)
        }
    }

    // Fetch individual branch and load edit modal
    const handleOpenModal = async (branch = null) => {
        if (branch) {
            const fullBranch = branch
            setEditingBranch(fullBranch)
            setOwnerSearchText(fullBranch.ownerId?.fullName || fullBranch.ownerId?.name || fullBranch.ownerName || '')
            setFormData({
                branchName: fullBranch.branchName || '',
                branchCode: fullBranch.branchCode || '',
                description: fullBranch.description || '',
                ownerId: fullBranch.ownerId?._id || fullBranch.ownerId?.id || (typeof fullBranch.ownerId === 'string' ? fullBranch.ownerId : ''),
                subscriptionPlanId: fullBranch.subscriptionPlanId?._id || fullBranch.subscriptionPlanId?.id || (typeof fullBranch.subscriptionPlanId === 'string' ? fullBranch.subscriptionPlanId : ''),
                pricePerHour: fullBranch.pricePerHour || fullBranch.price || 1000,
                openingTime: fullBranch.openingTime || '06:00 AM',
                closingTime: fullBranch.closingTime || '11:00 PM',
                turfSize: fullBranch.turfSize || fullBranch.dimensions || '5,000 Sq.Ft',
                surfaceType: fullBranch.surfaceType || 'TurfPro Synthetic Arena',
                sports: Array.isArray(fullBranch.sports) && fullBranch.sports.length > 0 ? fullBranch.sports : ['Cricket'],
                amenities: Array.isArray(fullBranch.amenities) ? fullBranch.amenities : ['Floodlights', 'Parking', 'Washroom'],
                discountOffer: fullBranch.discountOffer || '20% OFF FIRST MATCH',
                couponCode: fullBranch.couponCode || 'CRICKET20',
                country: fullBranch.country || 'India',
                state: fullBranch.state || '',
                city: fullBranch.city || '',
                zipCode: fullBranch.zipCode || '',
                fullAddress: fullBranch.fullAddress || '',
                email: fullBranch.email || '',
                mobile: fullBranch.mobile || '',
                alternateMobile: fullBranch.alternateMobile || '',
                gstNumber: fullBranch.gstNumber || '',
                timezone: fullBranch.timezone || 'Asia/Kolkata',
                currency: fullBranch.currency || 'INR',
                logo: fullBranch.logo || '',
                images: Array.isArray(fullBranch.images) ? fullBranch.images : (fullBranch.images ? [fullBranch.images] : []),
                status: fullBranch.status || 'ACTIVE'
            })
            setModal(true)

            try {
                const targetId = branch._id || branch.id
                const res = await getBranchById(targetId)
                if (res && (res.data || res.branch)) {
                    const fetched = res.data || res.branch
                    setEditingBranch(fetched)
                    setFormData(prev => ({
                        ...prev,
                        ...fetched,
                        ownerId: fetched.ownerId?._id || fetched.ownerId?.id || (typeof fetched.ownerId === 'string' ? fetched.ownerId : prev.ownerId)
                    }))
                }
            } catch (e) {
                console.warn('Optional edit detail refresh note:', e)
            }
        } else {
            setEditingBranch(null)
            setOwnerSearchText('')
            setIsQuickAddOwnerOpen(false)
            setFormData({
                branchName: '',
                branchCode: '',
                description: '',
                ownerId: '',
                subscriptionPlanId: subscriptionPlans[0]?._id || '',
                pricePerHour: '',
                openingTime: '',
                closingTime: '',
                turfSize: '',
                surfaceType: '',
                sports: [],
                amenities: [],
                discountOffer: '',
                couponCode: '',
                country: 'India',
                state: '',
                city: '',
                zipCode: '',
                fullAddress: '',
                email: '',
                mobile: '',
                alternateMobile: '',
                gstNumber: '',
                timezone: 'Asia/Kolkata',
                currency: 'INR',
                logo: '',
                images: [],
                ownerOption: 'EXISTING',
                newOwnerName: '',
                newOwnerBusinessName: '',
                status: 'ACTIVE'
            })
            setModal(true)
        }
    }

    // Submit Create/Edit Form
    const handleSave = async () => {
        // Validation check for mandatory inputs
        if (!formData.branchName.trim()) {
            addToast({ title: 'Required Field', message: 'Please enter a Branch Name', type: 'error' })
            return
        }
        if (!formData.email.trim()) {
            addToast({ title: 'Required Field', message: 'Please enter an Email Address', type: 'error' })
            return
        }
        if (!formData.mobile.trim()) {
            addToast({ title: 'Required Field', message: 'Please enter a Mobile Number', type: 'error' })
            return
        }

        if (formData.ownerOption === 'NEW' && !formData.newOwnerName.trim()) {
            addToast({ title: 'Required Field', message: 'Please enter New Owner Full Name', type: 'error' })
            return
        }

        const finalOwnerId = formData.ownerOption === 'NEW' 
            ? null 
            : (formData.ownerId || (owners.length > 0 ? (owners[0]._id || owners[0].id) : 'own_001'));
        
        const finalPlanId = formData.subscriptionPlanId || (subscriptionPlans.length > 0 ? subscriptionPlans[0]._id : 'plan_starter');

        const payload = {
            ...formData,
            ownerId: finalOwnerId,
            newOwnerName: formData.ownerOption === 'NEW' ? formData.newOwnerName.trim() : null,
            newOwnerBusinessName: formData.ownerOption === 'NEW' ? formData.newOwnerBusinessName.trim() : null,
            subscriptionPlanId: finalPlanId
        }

        try {
            setIsSubmitLoading(true)

            if (editingBranch) {
                await updateBranch(editingBranch._id || editingBranch.id, payload)
                addToast({ title: 'Updated', message: 'Branch details updated successfully', type: 'success' })
                setModal(false)
                loadBranches()
                loadStats()
            } else {
                await createBranch(payload)
                addToast({ title: 'Success', message: 'Branch & Owner created successfully!', type: 'success' })
                setModal(false)
                
                // Refresh owners dropdown so newly registered owner appears immediately
                try {
                    const ownersRes = await getOwners({ limit: 1000 })
                    const rawOwners = ownersRes.data?.owners || []
                    setOwners(rawOwners.map(o => ({
                        ...o,
                        _id: o._id || o.id,
                        fullName: o.fullName || o.name || o.ownerName || 'Owner',
                        email: o.email || ''
                    })))
                } catch (e) {}

                loadBranches()
                loadStats()
            }
        } catch (error) {
            console.error('Error saving branch:', error)
            const msg = error.response?.data?.message || 'Branch updated/created'
            addToast({ title: 'Notice', message: msg, type: 'info' })
            setModal(false)
            loadBranches()
            loadStats()
        } finally {
            setIsSubmitLoading(false)
        }
    }

    // Soft delete a branch
    const handleDelete = async () => {
        try {
            setIsTableLoading(true)
            const res = await deleteBranch(confirm.id)
            if (res.success) {
                addToast({ title: 'Deleted', message: 'Branch deleted successfully', type: 'success' })
                setConfirm({ open: false, type: '', id: null })
                loadBranches()
                loadStats()
            }
        } catch (error) {
            console.error('Delete failed:', error)
            const msg = error.response?.data?.message || 'Failed to remove branch'
            addToast({ title: 'Error', message: msg, type: 'error' })
        } finally {
            setIsTableLoading(false)
        }
    }

    // Toggle active status
    const handleToggleStatus = async () => {
        try {
            setIsTableLoading(true)
            const targetBranch = branches.find(b => b._id === confirm.id)
            if (!targetBranch) return

            const nextStatus = targetBranch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
            const res = await changeBranchStatus(confirm.id, nextStatus)
            if (res.success) {
                addToast({ title: 'Status Changed', message: `Branch status changed to ${nextStatus}`, type: 'success' })
                setConfirm({ open: false, type: '', id: null })
                loadBranches()
                loadStats()
            }
        } catch (error) {
            console.error('Status toggle failed:', error)
            const msg = error.response?.data?.message || 'Failed to toggle status'
            addToast({ title: 'Error', message: msg, type: 'error' })
        } finally {
            setIsTableLoading(false)
        }
    }

    // Handlers for pagination footer
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPage(newPage)
        }
    }

    // Table Column Config
    const columns = [
        { key: 'branchName', label: 'Branch Name' },
        { key: 'city', label: 'City' },
        { 
            key: 'ownerId', 
            label: 'Owner Name', 
            render: v => v?.fullName || 'N/A' 
        },
        { 
            key: 'subscriptionPlanId', 
            label: 'Subscription Plan', 
            render: (v, r) => r?.planName || r?.subscriptionPlan?.planName || (typeof v === 'object' ? v?.planName : String(v || 'Standard'))
        },
        { 
            key: 'status', 
            label: 'Status', 
            render: v => {
                const upper = (v || '').toUpperCase();
                const variant = upper === 'ACTIVE' ? 'success' : (upper === 'SUSPENDED' ? 'danger' : 'default');
                return <Badge variant={variant} dot>{upper}</Badge>
            } 
        },
        { 
            key: 'totalRevenue', 
            label: 'Plan Price', 
            render: (v, r) => `₹${Number(r?.subscriptionPlan?.monthlyPrice || r?.subscriptionPlanId?.monthlyPrice || r?.planPrice || r?.subscription_price_snapshot || 1000).toLocaleString('en-IN')}` 
        },
        {
            key: 'bookingRevenue',
            label: 'Bookings (Gross)',
            render: (v, r) => (
                <span className="font-bold text-slate-800">
                    {r?.bookingCount || 0} <span className="text-xs font-medium text-slate-500">(₹{Number(r?.bookingRevenue || v || 0).toLocaleString('en-IN')})</span>
                </span>
            )
        },
        {
            key: 'bookingCommission',
            label: 'Commission (10%)',
            render: (v, r) => (
                <span className="font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg text-xs">
                    ₹{Number(r?.bookingCommission || Math.round(Number(r?.bookingRevenue || 0) * 0.1)).toLocaleString('en-IN')}
                </span>
            )
        },
        { 
            key: 'actions', 
            label: 'Actions', 
            render: (_, r) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleViewBranch(r)} title="View Details"><FiEye /></Button>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className={r.status === 'ACTIVE' ? 'text-warning-600' : 'text-success-600'}
                        onClick={() => setConfirm({ open: true, type: 'status', id: r._id })}
                        title="Toggle Status"
                    >
                        <FiPower />
                    </Button>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-danger-600"
                        onClick={() => setConfirm({ open: true, type: 'delete', id: r._id })}
                        title="Delete Branch"
                    >
                        <FiTrash2 />
                    </Button>
                </div>
            )
        },
    ]

    // Automatically trigger initial statistics on render
    useEffect(() => {
        if (user) {
            loadStats()
            setIsPageLoading(false)
        }
    }, [user])

    const handleExportCSV = () => {
        if (!branches || branches.length === 0) {
            addToast({ title: 'Export Failed', message: 'No branch data available to export', type: 'error' })
            return
        }
        const headers = ['Branch Name', 'Branch Code', 'City', 'Owner Name', 'Owner Email', 'Plan', 'Status', 'Revenue', 'Created Date']
        const rows = branches.map(b => [
            `"${b.branchName || ''}"`,
            `"${b.branchCode || ''}"`,
            `"${b.city || ''}"`,
            `"${b.ownerId?.fullName || ''}"`,
            `"${b.ownerId?.email || ''}"`,
            `"${b.subscriptionPlanId?.planName || ''}"`,
            `"${b.status || ''}"`,
            `"${b.totalRevenue || 0}"`,
            `"${b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ''}"`
        ])
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `Branches_Export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        addToast({ title: 'Export Success', message: 'Branch data exported as CSV file', type: 'success' })
    }

    if (isPageLoading || authLoading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-surface-500 text-sm font-semibold">Loading Branch module configuration...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6 bg-[#F6F8FC] min-h-screen p-6 rounded-3xl animate-in fade-in duration-500">
            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 p-6 rounded-3xl border border-indigo-100/60 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight">Branch Management</h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Manage and monitor all registered turf branches across India</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 text-xs font-bold text-surface-700 hover:text-emerald-600 transition-colors px-4 py-2.5 rounded-2xl bg-white hover:bg-surface-50 border border-surface-200/80 shadow-soft cursor-pointer"
                    >
                        <FiDownload className="w-4 h-4 text-emerald-600" /> Export CSV
                    </button>
                    <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-emerald-500/20">
                        + Add Branch
                    </Button>
                </div>
            </div>

            {/* Custom Modern Ultra-Attractive Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1: Total Branches */}
                <div className="relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"></div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Branches</span>
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-sm border border-indigo-100 group-hover:scale-110 transition-transform shrink-0">
                            <FiBriefcase />
                        </div>
                    </div>
                    <div className="my-1.5">
                        <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                            {stats.totalBranches || 0}
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                        <span className="font-medium text-slate-400 truncate">All registered venues</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full shrink-0">
                            Active System
                        </span>
                    </div>
                </div>

                {/* Card 2: Subscription Plan Revenue */}
                <div className="relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Revenue</span>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shadow-sm border border-emerald-100 group-hover:scale-110 transition-transform shrink-0">
                            <FiCheckCircle />
                        </div>
                    </div>
                    <div className="my-1.5">
                        <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                            ₹{Number(stats.planRevenue ?? branches.reduce((sum, b) => sum + Number(b.planPrice || b.subscriptionPlanId?.monthlyPrice || 0), 0)).toLocaleString('en-IN')}
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                        <span className="font-medium text-slate-400 truncate">Monthly Turf Subscriptions</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                            Active Plans
                        </span>
                    </div>
                </div>

                {/* Card 3: Booking Commission (10%) */}
                <div className="relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600"></div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Booking Commission</span>
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shadow-sm border border-blue-100 group-hover:scale-110 transition-transform shrink-0">
                            <FiTrendingUp />
                        </div>
                    </div>
                    <div className="my-1.5">
                        <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                            ₹{Number(stats.bookingCommission ?? 250).toLocaleString('en-IN')}
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                        <span className="font-medium text-slate-400 truncate">From ₹{Number(stats.bookingGross ?? 2500).toLocaleString('en-IN')} Bookings</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full shrink-0">
                            10% Cut
                        </span>
                    </div>
                </div>

                {/* Card 4: Net Owner Revenue */}
                <div className="relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"></div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Owner Net Revenue</span>
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shadow-sm border border-amber-100 group-hover:scale-110 transition-transform shrink-0">
                            <FiTrendingUp />
                        </div>
                    </div>
                    <div className="my-1.5">
                        <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none">
                            ₹{Number(stats.ownerNetShare ?? 2250).toLocaleString('en-IN')}
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                        <span className="font-medium text-slate-400 truncate">Net Share (After 10% Platform Cut)</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full shrink-0">
                            Gross: ₹{Number(stats.bookingGross ?? 2500).toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>


            </div>

            {/* Modern Unified Toolbar (Search + Filters + Summary) */}
            <div className="p-5 border border-surface-200/80 rounded-3xl bg-white shadow-soft space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Search Input */}
                    <div className="relative w-full lg:max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-surface-400">
                            <FiSearch className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            placeholder="Search by branch name, code, city, owner..."
                            value={searchTerm}
                            onChange={e => {
                                setSearchTerm(e.target.value)
                                setPage(1)
                            }}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-surface-400 font-medium shadow-soft"
                        />
                    </div>

                    {/* Filter Select Dropdowns */}
                    <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                        <Select
                            value={selectedStatus}
                            onChange={e => { setSelectedStatus(e.target.value); setPage(1); }}
                            options={[
                                { value: 'ALL', label: 'All Statuses' },
                                { value: 'ACTIVE', label: '🟢 Active' },
                                { value: 'INACTIVE', label: '🔴 Inactive' },
                                { value: 'SUSPENDED', label: '🟡 Suspended' }
                            ]}
                            className="w-40"
                        />

                        <Select
                            value={selectedOwnerId}
                            onChange={e => { setSelectedOwnerId(e.target.value); setPage(1); }}
                            options={ownerOptions}
                            className="w-44"
                        />

                        <Select
                            value={selectedPlanId}
                            onChange={e => { setSelectedPlanId(e.target.value); setPage(1); }}
                            options={planOptions}
                            className="w-44"
                        />
                    </div>
                </div>

                {/* Summary bar below search */}
                <div className="flex items-center justify-between text-xs font-semibold text-surface-500 pt-2 border-t border-surface-100">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Showing <strong className="text-surface-900">{branches.length}</strong> of <strong className="text-surface-900">{pagination.total}</strong> Branches</span>
                    </div>
                    <div className="text-surface-400">Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </div>

            {/* Premium Card-Style Data Grid Container */}
            <div className="rounded-3xl border border-surface-200/80 shadow-soft bg-white overflow-hidden p-6 space-y-4">
                {/* 1. Premium Header Strip */}
                <div className="hidden md:grid grid-cols-12 gap-3 px-6 py-3.5 bg-slate-50/90 rounded-2xl border border-surface-200/60 text-xs font-bold text-surface-500 uppercase tracking-wider items-center">
                    <div className="col-span-3">Branch Name</div>
                    <div className="col-span-1">City</div>
                    <div className="col-span-2">Owner</div>
                    <div className="col-span-2">Plan</div>
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-1 text-right">Plan Price</div>
                    <div className="col-span-2 text-right pr-2">Actions</div>
                </div>

                {/* Loading State */}
                {isTableLoading ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center gap-4 py-12">
                        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-surface-500 text-sm font-semibold">Retrieving branches...</span>
                    </div>
                ) : branches.length === 0 ? (
                    <div className="text-center py-16 text-surface-400 font-semibold text-sm bg-slate-50/50 rounded-2xl border border-dashed border-surface-200">
                        No branches found matching your search or filters.
                    </div>
                ) : (
                    /* 2. Individual Card-Style Rows with perfect column alignment */
                    <div className="space-y-3">
                        {branches.map((r, i) => (
                            <div
                                key={r._id || i}
                                className="grid grid-cols-1 md:grid-cols-12 gap-3 px-6 py-3.5 bg-white hover:bg-slate-50/80 rounded-2xl border border-surface-200/80 shadow-soft hover:shadow-md hover:border-emerald-300 transition-all duration-200 items-center min-h-[72px]"
                            >
                                {/* Branch Name & Avatar */}
                                <div className="col-span-3 flex items-center gap-3">
                                    {r.logo ? (
                                        <img
                                            src={r.logo}
                                            alt={r.branchName}
                                            className="w-10 h-10 rounded-xl object-cover border border-surface-200 bg-white shadow-soft shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center text-white text-xs font-black shadow-soft tracking-wider shrink-0">
                                            {((r.branchName || '').split(' ').map(n => n[0]).join('') || '?').substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="truncate min-w-0">
                                        <div className="font-bold text-surface-900 text-sm tracking-tight truncate">{r.branchName || 'N/A'}</div>
                                        <div className="text-[11px] text-surface-400 font-medium">{r.branchCode || '—'}</div>
                                    </div>
                                </div>

                                {/* City */}
                                <div className="col-span-1 text-surface-700 font-semibold text-xs flex items-center gap-1 truncate">
                                    <FiMapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span className="truncate">{r.city || 'N/A'}</span>
                                </div>

                                {/* Owner */}
                                <div className="col-span-2 truncate min-w-0">
                                    <div className="font-semibold text-surface-800 text-xs flex items-center gap-1 truncate">
                                        <FiUser className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                        <span className="truncate">{r.ownerId?.fullName || 'N/A'}</span>
                                    </div>
                                    {r.ownerId?.email && <div className="text-[11px] text-surface-400 truncate">{r.ownerId.email}</div>}
                                </div>

                                {/* Plan */}
                                <div className="col-span-2">
                                    <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80 text-[11px] font-bold whitespace-nowrap inline-block">
                                        {r.subscriptionPlanId?.planName || 'Standard'}
                                    </span>
                                </div>

                                {/* Status Badge */}
                                <div className="col-span-1 flex justify-center">
                                    {(() => {
                                        const upper = (r.status || '').toUpperCase()
                                        if (upper === 'ACTIVE') {
                                            return (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold whitespace-nowrap">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                                </span>
                                            )
                                        } else if (upper === 'SUSPENDED') {
                                            return (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-[11px] font-bold whitespace-nowrap">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Suspended
                                                </span>
                                            )
                                        } else {
                                            return (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-[11px] font-bold whitespace-nowrap">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Inactive
                                                </span>
                                            )
                                        }
                                    })()}
                                </div>

                                {/* Plan Price */}
                                <div className="col-span-1 text-right">
                                    <span className="text-emerald-600 font-bold text-xs tracking-tight whitespace-nowrap">
                                        ₹{Number(r.subscriptionPlanId?.monthlyPrice || r.planPrice || r.subscription_price_snapshot || (r.totalRevenue && r.totalRevenue <= 3000 ? r.totalRevenue : 1000)).toLocaleString('en-IN')}
                                    </span>
                                </div>

                                {/* Actions - Clean Compact 34x34 Action Buttons */}
                                <div className="col-span-2 flex items-center justify-end gap-1.5 pr-1">
                                    <button
                                        onClick={() => handleViewBranch(r)}
                                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-500 text-surface-600 hover:text-white border border-surface-200/60 hover:border-emerald-500 transition-all duration-200 flex items-center justify-center cursor-pointer"
                                        title="View Details"
                                    >
                                        <FiEye className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setConfirm({ open: true, type: 'status', id: r._id })}
                                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-amber-500 text-surface-600 hover:text-white border border-surface-200/60 hover:border-amber-500 transition-all duration-200 flex items-center justify-center cursor-pointer"
                                        title="Toggle Status"
                                    >
                                        <FiPower className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setConfirm({ open: true, type: 'delete', id: r._id })}
                                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-500 text-surface-600 hover:text-white border border-surface-200/60 hover:border-rose-500 transition-all duration-200 flex items-center justify-center cursor-pointer"
                                        title="Delete Branch"
                                    >
                                        <FiTrash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 11. Modern SaaS Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-surface-150 pt-5 mt-4 gap-4">
                        <p className="text-xs text-surface-500 font-semibold">
                            Showing <span className="font-bold text-surface-900">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                            <span className="font-bold text-surface-900">
                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                            </span>{' '}
                            of <span className="font-bold text-surface-900">{pagination.total}</span> entries
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => handlePageChange(pagination.page - 1)}
                                className="px-4 py-2 text-xs font-bold rounded-xl border border-surface-200 bg-white hover:bg-surface-50 disabled:opacity-40 disabled:hover:bg-white text-surface-700 transition-all cursor-pointer shadow-soft flex items-center gap-1"
                            >
                                <FiChevronLeft className="w-3.5 h-3.5" /> Previous
                            </button>
                            <div className="flex gap-1.5">
                                {Array.from({ length: pagination.pages }, (_, index) => {
                                    const p = index + 1
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            className={`w-9 h-9 text-xs font-bold rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-center ${
                                                pagination.page === p
                                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-soft'
                                                    : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50 hover:border-emerald-300'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                })}
                            </div>
                            <button
                                disabled={pagination.page === pagination.pages}
                                onClick={() => handlePageChange(pagination.page + 1)}
                                className="px-4 py-2 text-xs font-bold rounded-xl border border-surface-200 bg-white hover:bg-surface-50 disabled:opacity-40 disabled:hover:bg-white text-surface-700 transition-all cursor-pointer shadow-soft flex items-center gap-1"
                            >
                                Next <FiChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* In-depth 8-section Add/Edit Modal */}
            <Modal 
                isOpen={modal} 
                onClose={() => setModal(false)} 
                title="Add New Branch"
                size="lg"
            >
                <div className="pt-2 max-h-[70vh] overflow-y-auto pr-2 space-y-6">
                    {/* SECTION 1: Basic Information */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 1: Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="Branch Name *" 
                                placeholder="Enter branch name" 
                                value={formData.branchName}
                                onChange={e => setFormData({ ...formData, branchName: e.target.value })}
                            />
                            <Input 
                                label="Branch Code" 
                                placeholder="System Generated (e.g. BRA-001)" 
                                value={editingBranch ? formData.branchCode : 'System Generated (e.g. BRA-001)'}
                                disabled={true}
                            />
                            <div className="md:col-span-2">
                                <Input 
                                    label="Description" 
                                    placeholder="Enter branch description" 
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Owner Information */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-surface-150 pb-1.5">
                            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                                <span>👤</span> Section 2: Owner Information
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsQuickAddOwnerOpen(!isQuickAddOwnerOpen)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-soft flex items-center gap-1 cursor-pointer"
                            >
                                <span>➕</span> + Add New Admin Owner
                            </button>
                        </div>

                        {/* Quick Register New Owner Inline Panel */}
                        {isQuickAddOwnerOpen && (
                            <div className="p-4 bg-emerald-50/90 border-2 border-emerald-300 rounded-2xl space-y-3 shadow-md">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <span>✨</span> Register New Owner Live into Database
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsQuickAddOwnerOpen(false)}
                                        className="text-emerald-700 hover:text-rose-600 font-bold text-xs cursor-pointer"
                                    >
                                        ✕ Close
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Input 
                                        label="New Owner Full Name *" 
                                        placeholder="e.g. Sunil Chhetri or Rahul Sharma"
                                        value={quickOwnerData.fullName}
                                        onChange={e => setQuickOwnerData({ ...quickOwnerData, fullName: e.target.value })}
                                    />
                                    <Input 
                                        label="Business / Network Name" 
                                        placeholder="e.g. Sunil Sports Arena"
                                        value={quickOwnerData.businessName}
                                        onChange={e => setQuickOwnerData({ ...quickOwnerData, businessName: e.target.value })}
                                    />
                                    <Input 
                                        label="Email Address" 
                                        placeholder="e.g. owner@domain.com"
                                        type="email"
                                        value={quickOwnerData.email}
                                        onChange={e => setQuickOwnerData({ ...quickOwnerData, email: e.target.value })}
                                    />
                                    <Input 
                                        label="Mobile Phone" 
                                        placeholder="e.g. 9876543210"
                                        value={quickOwnerData.mobile}
                                        onChange={e => setQuickOwnerData({ ...quickOwnerData, mobile: e.target.value })}
                                    />
                                    <div className="md:col-span-2">
                                        <Input 
                                            label="🔑 Set Admin Login Password (for Login Access)" 
                                            placeholder="e.g. password123"
                                            type="text"
                                            value={quickOwnerData.password || 'password123'}
                                            onChange={e => setQuickOwnerData({ ...quickOwnerData, password: e.target.value })}
                                        />
                                        <p className="text-[11px] text-emerald-700 font-bold mt-1">
                                            ℹ️ This password will be used by the Turf Owner to log in at <span className="underline font-mono">http://localhost:5173/login</span>
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end pt-1">
                                    <button
                                        type="button"
                                        disabled={isQuickOwnerLoading}
                                        onClick={handleQuickAddOwnerSave}
                                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                                    >
                                        {isQuickOwnerLoading ? 'Registering...' : '💾 Save & Select New Owner'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <Select 
                            label="Assign Registered Turf Owner *" 
                            placeholder="Select Turf Owner"
                            value={formData.ownerId}
                            onChange={e => {
                                if (e.target.value === 'NEW_OWNER_OPTION') {
                                    setIsQuickAddOwnerOpen(true)
                                    setFormData(prev => ({ ...prev, ownerId: '' }))
                                } else {
                                    setFormData(prev => ({ ...prev, ownerId: e.target.value }))
                                }
                            }}
                            options={[
                                { value: 'NEW_OWNER_OPTION', label: '➕ + Add / Register New Admin Owner Live...' },
                                ...owners.map(o => ({
                                    value: o._id || o.id,
                                    label: `👤 ${o.fullName || o.name || o.email || 'Owner'} — (${o.businessName || o.email || 'Turf Network'})`
                                }))
                            ]} 
                        />
                    </div>

                    {/* SECTION 3: Subscription Assignment */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 3: Subscription Plan</h3>
                        <Select 
                            label="Subscription Plan *" 
                            placeholder="Select Plan"
                            value={formData.subscriptionPlanId}
                            onChange={e => setFormData({ ...formData, subscriptionPlanId: e.target.value })}
                            options={subscriptionPlans.map(p => {
                                const price = Number(p.monthlyPrice || p.monthly_price || p.monthlyPricing?.price || 0);
                                const priceStr = price > 0 ? `₹${price.toLocaleString('en-IN')}/mo` : 'Free';
                                return {
                                    value: p._id || p.id,
                                    label: `${p.planName || 'Plan'} — ${priceStr}`
                                }
                            })} 
                        />
                    </div>

                    {/* SECTION 4: Pricing & Operating Timings */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 4: Pricing & Operating Hours</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input 
                                label="Price Per Hour (₹) *" 
                                placeholder="e.g. 1000"
                                type="number"
                                value={formData.pricePerHour}
                                onChange={e => setFormData({ ...formData, pricePerHour: e.target.value })}
                            />
                            <Input 
                                label="Opening Time" 
                                placeholder="e.g. 06:00 AM"
                                value={formData.openingTime}
                                onChange={e => setFormData({ ...formData, openingTime: e.target.value })}
                            />
                            <Input 
                                label="Closing Time" 
                                placeholder="e.g. 11:00 PM"
                                value={formData.closingTime}
                                onChange={e => setFormData({ ...formData, closingTime: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* SECTION 5: Turf Size & Surface Type */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 5: Dimensions & Surface Spec</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="Turf Size / Dimensions" 
                                placeholder="e.g. 5,000 Sq.Ft or 100 × 50 ft"
                                value={formData.turfSize}
                                onChange={e => setFormData({ ...formData, turfSize: e.target.value })}
                            />
                            <Input 
                                label="Surface Type" 
                                placeholder="e.g. TurfPro Synthetic Arena"
                                value={formData.surfaceType}
                                onChange={e => setFormData({ ...formData, surfaceType: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* SECTION 6: Sports & Amenities Offered */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 6: Sports & Amenities</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1.5">Sports Available</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Cricket', 'Football', 'Badminton', 'Tennis'].map(sport => {
                                        const currentSports = Array.isArray(formData.sports) ? formData.sports : [];
                                        const isChecked = currentSports.includes(sport);
                                        return (
                                            <button
                                                key={sport}
                                                type="button"
                                                onClick={() => {
                                                    const nextSports = isChecked
                                                        ? currentSports.filter(s => s !== sport)
                                                        : [...currentSports, sport];
                                                    setFormData({ ...formData, sports: nextSports });
                                                }}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                                    isChecked
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                                                        : 'bg-white text-surface-600 border-surface-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                {isChecked ? '✓ ' : '+ '}{sport}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1.5">Amenities Available</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Floodlights', 'Parking', 'Washroom', 'Seating', 'Drinking Water', 'Locker Room'].map(amenity => {
                                        const currentAmenities = Array.isArray(formData.amenities) ? formData.amenities : [];
                                        const isChecked = currentAmenities.includes(amenity);
                                        return (
                                            <button
                                                key={amenity}
                                                type="button"
                                                onClick={() => {
                                                    const nextAmenities = isChecked
                                                        ? currentAmenities.filter(a => a !== amenity)
                                                        : [...currentAmenities, amenity];
                                                    setFormData({ ...formData, amenities: nextAmenities });
                                                }}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                                    isChecked
                                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-sm'
                                                        : 'bg-white text-surface-600 border-surface-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                {isChecked ? '✓ ' : '+ '}{amenity}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 7: Discount & Special Offers */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 7: Discount Offers & Coupons</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="Offer Badge Text" 
                                placeholder="e.g. 20% OFF FIRST MATCH"
                                value={formData.discountOffer}
                                onChange={e => setFormData({ ...formData, discountOffer: e.target.value })}
                            />
                            <Input 
                                label="Coupon / Promo Code" 
                                placeholder="e.g. CRICKET20"
                                value={formData.couponCode}
                                onChange={e => setFormData({ ...formData, couponCode: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 8: Location Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                label="Country" 
                                placeholder="e.g. India"
                                value={formData.country}
                                onChange={e => setFormData({ ...formData, country: e.target.value })}
                            />
                            <Input 
                                label="State" 
                                placeholder="e.g. Maharashtra"
                                value={formData.state}
                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                            />
                            <Input 
                                label="City" 
                                placeholder="e.g. Mumbai"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                            />
                            <Input 
                                label="Zip Code" 
                                placeholder="e.g. 400001"
                                value={formData.zipCode}
                                onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                            />
                            <div className="col-span-2">
                                <Input 
                                    label="Full Address" 
                                    placeholder="Enter complete physical address"
                                    value={formData.fullAddress}
                                    onChange={e => setFormData({ ...formData, fullAddress: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 9: Contact Information */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 9: Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="Email Address *" 
                                placeholder="e.g. branch@domain.com"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            <Input 
                                label="Mobile Number *" 
                                placeholder="Enter mobile number"
                                value={formData.mobile}
                                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                            />
                            <div className="md:col-span-2">
                                <Input 
                                    label="Alternate Mobile" 
                                    placeholder="Enter secondary contact number"
                                    value={formData.alternateMobile}
                                    onChange={e => setFormData({ ...formData, alternateMobile: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 10: Business Information */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 10: Business Details</h3>
                        <Input 
                            label="GST Number" 
                            placeholder="Enter 15-digit GSTIN number"
                            value={formData.gstNumber}
                            onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                        />
                    </div>

                    {/* SECTION 11: Settings */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider border-b border-surface-150 pb-1.5">Section 11: Settings & Branding</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                label="Timezone" 
                                placeholder="Asia/Kolkata"
                                value={formData.timezone}
                                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                            />
                            <Input 
                                label="Currency" 
                                placeholder="INR"
                                value={formData.currency}
                                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* SECTION 12: Turf Brand Logo Uploader */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider border-b border-surface-150 pb-1.5 flex items-center gap-2">
                            <span>🏷️</span> Section 12: Turf Brand Logo
                        </h3>
                        <div className="p-4 bg-slate-50/90 rounded-2xl border border-surface-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                {formData.logo ? (
                                    <div className="relative group shrink-0">
                                        <img 
                                            src={formData.logo} 
                                            alt="Logo Preview" 
                                            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 bg-white shadow-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, logo: '' })}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full text-xs font-black flex items-center justify-center shadow-lg cursor-pointer hover:bg-rose-600 hover:scale-110 transition-all"
                                            title="Remove Brand Logo"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-emerald-300 bg-white flex flex-col items-center justify-center text-emerald-600 text-xs font-bold shrink-0 shadow-inner">
                                        <span>🏷️</span>
                                        <span className="text-[10px] text-surface-400 mt-1">No Logo</span>
                                    </div>
                                )}
                                <div className="flex-1 space-y-2">
                                    <label className="block text-xs font-bold text-surface-800">Upload Turf Brand Logo</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        disabled={isSubmitLoading}
                                        className="block w-full text-xs text-surface-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer shadow-soft"
                                    />
                                    <div className="flex gap-2 items-center pt-1">
                                        <input
                                            type="text"
                                            placeholder="Or paste Logo Image URL (e.g. https://domain.com/logo.png)"
                                            value={formData.logo}
                                            onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                            className="flex-1 px-3 py-1.5 rounded-xl border border-surface-200 text-xs text-surface-800 outline-none focus:border-emerald-500 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 13: Multiple Turf Gallery & Venue Photos Uploader */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between border-b border-surface-150 pb-1.5">
                            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                                <span>📸</span> Section 13: Turf Gallery & Venue Photos (Multiple Upload)
                            </h3>
                            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                {(formData.images || []).length} Photo(s) Uploaded
                            </span>
                        </div>

                        <div className="p-4 bg-slate-50/90 rounded-2xl border border-surface-200 shadow-sm space-y-4">
                            {/* Upload Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-surface-700 mb-1.5">Upload Multiple Local Photos</label>
                                    <input 
                                        type="file" 
                                        multiple
                                        accept="image/*"
                                        onChange={handleGalleryPhotosChange}
                                        disabled={isSubmitLoading}
                                        className="block w-full text-xs text-surface-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer shadow-soft"
                                    />
                                    <span className="text-[10px] text-surface-400 mt-1 block">Select multiple ground images simultaneously</span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-surface-700 mb-1.5">Or Add Photo via Direct URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="https://images.unsplash.com/photo-..."
                                            value={galleryUrlInput}
                                            onChange={e => setGalleryUrlInput(e.target.value)}
                                            className="flex-1 px-3 py-1.5 rounded-xl border border-surface-200 text-xs text-surface-800 outline-none focus:border-emerald-500 bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddGalleryUrl}
                                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shrink-0 cursor-pointer"
                                        >
                                            + Add Photo
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Live Interactive Photo Grid */}
                            {(formData.images || []).length > 0 ? (
                                <div className="space-y-2 pt-2 border-t border-surface-200">
                                    <div className="text-xs font-bold text-surface-600">Uploaded Venue Gallery Preview:</div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-48 overflow-y-auto p-1">
                                        {(formData.images || []).map((imgUrl, idx) => (
                                            <div key={idx} className="relative group rounded-xl overflow-hidden border border-surface-250 bg-white shadow-soft aspect-video">
                                                <img 
                                                    src={imgUrl} 
                                                    alt={`Venue photo ${idx + 1}`} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveGalleryPhoto(idx)}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-md opacity-90 hover:opacity-100 hover:scale-110 cursor-pointer"
                                                    title="Delete photo"
                                                >
                                                    🗑️
                                                </button>
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 truncate text-center">
                                                    Photo #{idx + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 border border-dashed border-surface-250 rounded-xl bg-white text-surface-400 text-xs">
                                    📸 No gallery photos added yet. Select multiple photos above to build a venue gallery.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="flex gap-3 justify-end pt-3 border-t border-surface-150 bg-white sticky bottom-0">
                        <Button variant="secondary" onClick={() => setModal(false)} disabled={isSubmitLoading}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSubmitLoading}>
                            {isSubmitLoading ? 'Saving...' : (editingBranch ? "Update Branch" : "Create Branch")}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* View Branch Details Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false)
                    setViewingBranch(null)
                }}
                title="Branch Details"
                size="lg"
            >
                {viewingBranch && (
                    <div className="space-y-5 pt-1 max-h-[78vh] overflow-y-auto pr-1">
                        {/* Unified Top Banner: Logo, Name, Status & Core KPIs */}
                        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-5 border border-slate-800">
                            <div className="flex flex-col sm:flex-row items-center gap-5">
                                {viewingBranch.logo ? (
                                    <img 
                                        src={viewingBranch.logo} 
                                        alt={viewingBranch.branchName} 
                                        className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700 bg-white shrink-0 shadow-md"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-md border-2 border-emerald-400/40">
                                        {((viewingBranch.branchName || '').split(' ').map(n => n[0]).join('') || '?').substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div className="text-center sm:text-left flex-1 space-y-1.5 font-sans">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                                        <h3 className="text-2xl font-black text-white tracking-tight">{viewingBranch.branchName}</h3>
                                        <div className="inline-flex justify-center sm:justify-start">
                                            {(() => {
                                                const upper = (viewingBranch.status || 'ACTIVE').toUpperCase()
                                                const badgeBg = upper === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40' : 'bg-rose-500/20 text-rose-400 border-rose-400/40'
                                                return (
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${badgeBg} flex items-center gap-1.5`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${upper === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                                                        {upper}
                                                    </span>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                    <p className="text-xs font-mono text-slate-400">Branch Code: <span className="font-bold text-white">{viewingBranch.branchCode || 'BR-1001'}</span></p>
                                    {viewingBranch.description && (
                                        <p className="text-xs text-slate-300 font-medium italic leading-relaxed">
                                            "{viewingBranch.description}"
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Top KPI Metrics Bar */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs font-mono">
                                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Total Bookings</span>
                                    <span className="text-lg font-black text-white">{viewingBranch.totalBookings || 0}</span>
                                </div>
                                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Total Revenue</span>
                                    <span className="text-lg font-black text-[#C8FF2E]">₹{Number(viewingBranch.totalRevenue !== undefined && viewingBranch.totalRevenue !== null ? viewingBranch.totalRevenue : (Number(viewingBranch.planPrice || viewingBranch.plan_price || viewingBranch.subscriptionPlanId?.monthlyPrice || viewingBranch.subscriptionPlanId?.monthly_price || 0) + Number(viewingBranch.booking_revenue || viewingBranch.bookingRevenue || 0))).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Hourly Rate</span>
                                    <span className="text-lg font-black text-emerald-400">₹{Number(viewingBranch.pricePerHour || viewingBranch.price || 1000).toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">/hr</span></span>
                                </div>
                                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Created On</span>
                                    <span className="text-xs font-bold text-slate-200 block truncate">
                                        {viewingBranch.createdAt ? new Date(viewingBranch.createdAt).toLocaleString('en-IN', { dateStyle: 'medium' }) : '20 Aug 2026'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Single Unified Information Sheet Container */}
                        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm text-xs font-sans">
                            {/* Section 1: Business & Owner Account */}
                            <div>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b-2 border-slate-100 pb-2 mb-4 flex items-center gap-2">
                                    <span>💼</span> Business & Subscription Plan Profile
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Owner Name</span>
                                        <p className="font-extrabold text-slate-900 text-sm">{viewingBranch.ownerId?.fullName || 'Valued Turf Owner'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Owner Email</span>
                                        <p className="font-bold text-slate-700 font-mono text-xs break-all">{viewingBranch.ownerId?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Subscription Plan</span>
                                        <span className="inline-block font-black text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-lg text-xs">
                                            {viewingBranch.subscriptionPlanId?.planName || 'Starter Plan'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">GST Number</span>
                                        <p className="font-bold text-slate-800 font-mono">{viewingBranch.gstNumber || 'N/A (Exempted)'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Timezone</span>
                                        <p className="font-bold text-slate-800">{viewingBranch.timezone || 'Asia/Kolkata'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Currency</span>
                                        <p className="font-bold text-slate-800">{viewingBranch.currency || 'INR (₹)'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Contact & Location Profile */}
                            <div>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b-2 border-slate-100 pb-2 mb-4 flex items-center gap-2">
                                    <span>📍</span> Contact & Location Details
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Branch Email</span>
                                        <p className="font-bold text-slate-800 font-mono">{viewingBranch.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Primary Mobile</span>
                                        <p className="font-bold text-slate-800 font-mono">{viewingBranch.mobile || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Alternate Mobile</span>
                                        <p className="font-bold text-slate-800 font-mono">{viewingBranch.alternateMobile || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">City & State</span>
                                        <p className="font-extrabold text-slate-900 capitalize">{viewingBranch.city || 'Indore'}{viewingBranch.state ? `, ${viewingBranch.state}` : ''}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Country & Zip</span>
                                        <p className="font-bold text-slate-800">{viewingBranch.country || 'India'} ({viewingBranch.zipCode || '452009'})</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Full Address</span>
                                        <p className="font-medium text-slate-700 leading-snug">{viewingBranch.fullAddress || 'Vijay Nagar, Indore, Madhya Pradesh'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Operating Specification */}
                            <div>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b-2 border-slate-100 pb-2 mb-4 flex items-center gap-2">
                                    <span>⚽</span> Venue Specifications & Amenities
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Operating Hours</span>
                                        <p className="font-extrabold text-slate-900 font-mono">{viewingBranch.openingTime || '06:00 AM'} – {viewingBranch.closingTime || '11:00 PM'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Turf Size & Dimensions</span>
                                        <p className="font-bold text-slate-800">{viewingBranch.turfSize || viewingBranch.dimensions || '5,000 Sq.Ft'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Surface Type</span>
                                        <p className="font-bold text-slate-800">{viewingBranch.surfaceType || 'TurfPro Synthetic Arena'}</p>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">Sports Allowed</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(Array.isArray(viewingBranch.sports) ? viewingBranch.sports : ['Cricket', 'Football']).map((sp, idx) => (
                                                <span key={idx} className="bg-slate-900 text-white font-bold text-[11px] px-3 py-0.5 rounded-md">
                                                    {typeof sp === 'object' ? `${sp.icon || '🏏'} ${sp.name || ''}`.trim() : sp}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">Available Amenities</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(Array.isArray(viewingBranch.amenities) ? viewingBranch.amenities : ['Floodlights', 'Parking', 'Washroom']).map((am, idx) => (
                                                <span key={idx} className="bg-white border border-slate-300 text-slate-800 font-bold text-[11px] px-2.5 py-0.5 rounded-md shadow-2xs">
                                                    ✓ {am}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end pt-3 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsViewModalOpen(false)
                                    setViewingBranch(null)
                                }}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirm Dialog for Status Toggle and Delete */}
            <ConfirmDialog 
                isOpen={confirm.open}
                onClose={() => setConfirm({ open: false, type: '', id: null })}
                onConfirm={confirm.type === 'delete' ? handleDelete : handleToggleStatus}
                title={confirm.type === 'delete' ? "Delete Branch" : "Change Branch Status"}
                message={confirm.type === 'delete' ? "Are you sure you want to delete this branch? This cannot be undone." : "Do you want to change the active status of this branch?"}
                type={confirm.type === 'delete' ? "danger" : "warning"}
            />
        </div>
    )
}
