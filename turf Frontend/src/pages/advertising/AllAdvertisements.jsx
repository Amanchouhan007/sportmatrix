import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination from '../../components/ui/Pagination'
import { useToast } from '../../components/ui/Toast'
import {
    FiSearch, FiEye, FiEdit2, FiCheckCircle,
    FiXCircle, FiPauseCircle, FiPlayCircle, FiTrash2, FiTag
} from 'react-icons/fi'
import { HiSpeakerphone } from 'react-icons/hi'

const INITIAL_ADS = [
    {
        id: 'AD-1001',
        turfName: 'Champions Turf Arena',
        ownerName: 'Rahul Sharma',
        type: 'Guaranteed Booking',
        budget: '₹15,000',
        commission: '12%',
        startDate: '2026-08-01',
        endDate: '2026-08-31',
        status: 'Active',
        views: 14200,
        bookings: 64
    },
    {
        id: 'AD-1002',
        turfName: 'SkyLine Football Turf',
        ownerName: 'Anita Desai',
        type: 'Discount Offer',
        budget: '₹8,000',
        commission: '10%',
        startDate: '2026-08-05',
        endDate: '2026-08-20',
        status: 'Booking Generated',
        views: 8900,
        bookings: 42
    },
    {
        id: 'AD-1003',
        turfName: 'Velocity Sports Hub',
        ownerName: 'Vikram Singh',
        type: 'Impression Ad',
        budget: '₹25,000',
        commission: '15%',
        startDate: '2026-08-10',
        endDate: '2026-08-25',
        status: 'Pending',
        views: 3400,
        bookings: 18
    },
    {
        id: 'AD-1004',
        turfName: 'GreenField Box Cricket',
        ownerName: 'Sanjay Patel',
        type: 'Discount Offer',
        budget: '₹5,000',
        commission: '8%',
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        status: 'Commission Pending',
        views: 12100,
        bookings: 35
    },
    {
        id: 'AD-1005',
        turfName: 'Apex Turf & Arena',
        ownerName: 'Meera Nair',
        type: 'Guaranteed Booking',
        budget: '₹20,000',
        commission: '14%',
        startDate: '2026-06-15',
        endDate: '2026-07-15',
        status: 'Paid',
        views: 18500,
        bookings: 88
    },
    {
        id: 'AD-1006',
        turfName: 'Urban Sports Complex',
        ownerName: 'Amit Verma',
        type: 'Impression Ad',
        budget: '₹10,000',
        commission: '10%',
        startDate: '2026-08-02',
        endDate: '2026-08-12',
        status: 'Approved',
        views: 1200,
        bookings: 5
    },
    {
        id: 'AD-1007',
        turfName: 'Thunderbolt Arena',
        ownerName: 'Rohan Mehta',
        type: 'Discount Offer',
        budget: '₹6,000',
        commission: '9%',
        startDate: '2026-07-10',
        endDate: '2026-07-20',
        status: 'Rejected',
        views: 0,
        bookings: 0
    },
    {
        id: 'AD-1008',
        turfName: 'Legacy Cricket Ground',
        ownerName: 'Karan Kapoor',
        type: 'Guaranteed Booking',
        budget: '₹12,000',
        commission: '11%',
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        status: 'Expired',
        views: 9400,
        bookings: 29
    }
]

export default function AllAdvertisements() {
    const navigate = useNavigate()
    const { addToast } = useToast()

    const [ads, setAds] = useState(INITIAL_ADS)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [typeFilter, setTypeFilter] = useState('ALL')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 6

    const [selectedAd, setSelectedAd] = useState(null)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [confirmModal, setConfirmModal] = useState({ open: false, action: '', ad: null })

    const statusBadgeVariant = (status) => {
        switch (status) {
            case 'Pending': return 'warning'
            case 'Approved': return 'info'
            case 'Active': return 'success'
            case 'Booking Generated': return 'primary'
            case 'Commission Pending': return 'warning'
            case 'Paid': return 'success'
            case 'Rejected': return 'danger'
            case 'Expired': return 'default'
            default: return 'default'
        }
    }

    const filteredAds = ads.filter(ad => {
        const matchesSearch = ad.id.toLowerCase().includes(search.toLowerCase()) ||
            ad.turfName.toLowerCase().includes(search.toLowerCase()) ||
            ad.ownerName.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'ALL' || ad.status === statusFilter
        const matchesType = typeFilter === 'ALL' || ad.type === typeFilter
        return matchesSearch && matchesStatus && matchesType
    })

    const totalPages = Math.ceil(filteredAds.length / itemsPerPage) || 1
    const paginatedAds = filteredAds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleAction = (action, ad) => {
        if (action === 'view') {
            setSelectedAd(ad)
            setViewModalOpen(true)
        } else if (action === 'edit') {
            setSelectedAd({ ...ad })
            setEditModalOpen(true)
        } else {
            setConfirmModal({ open: true, action, ad })
        }
    }

    const confirmAction = () => {
        const { action, ad } = confirmModal
        if (!ad) return

        let updatedStatus = ad.status
        if (action === 'approve') updatedStatus = 'Approved'
        else if (action === 'reject') updatedStatus = 'Rejected'
        else if (action === 'pause') updatedStatus = ad.status === 'Active' ? 'Pending' : 'Active'
        else if (action === 'delete') {
            setAds(prev => prev.filter(item => item.id !== ad.id))
            addToast({ message: `Advertisement ${ad.id} deleted successfully!`, type: 'success' })
            setConfirmModal({ open: false, action: '', ad: null })
            return
        }

        setAds(prev => prev.map(item => item.id === ad.id ? { ...item, status: updatedStatus } : item))
        addToast({ message: `Advertisement ${ad.id} status updated to ${updatedStatus}!`, type: 'info' })
        setConfirmModal({ open: false, action: '', ad: null })
    }

    const saveEdit = (e) => {
        e.preventDefault()
        setAds(prev => prev.map(item => item.id === selectedAd.id ? selectedAd : item))
        addToast({ message: `Advertisement ${selectedAd.id} updated successfully!`, type: 'success' })
        setEditModalOpen(false)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl shadow-inner shadow-emerald-500/5">
                        <FiSpeakerphone className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-surface-900 tracking-tight">
                            All Advertisements
                        </h1>
                        <p className="text-surface-500 text-sm mt-0.5 font-medium">Manage, approve, and track advertisement campaigns across all turfs</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/admin/discount-offers')}
                        className="flex items-center gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-extrabold"
                    >
                        <FiTag /> Discount Offers
                    </Button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <Card variant="glass" className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="col-span-1 sm:col-span-2">
                        <Input
                            placeholder="Search by Ad ID, Turf or Owner Name..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    <Select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Active">Active</option>
                        <option value="Booking Generated">Booking Generated</option>
                        <option value="Commission Pending">Commission Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Expired">Expired</option>
                    </Select>

                    <Select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="ALL">All Ad Types</option>
                        <option value="Guaranteed Booking">Guaranteed Booking</option>
                        <option value="Discount Offer">Discount Offer</option>
                        <option value="Impression Ad">Impression Ad</option>
                    </Select>
                </div>
            </Card>

            {/* Data Table */}
            <div className="bg-white/80 backdrop-blur-md border border-surface-200/60 rounded-3xl overflow-hidden shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-surface-700">
                        <thead className="bg-surface-50/80 text-xs font-bold uppercase tracking-wider text-surface-500 border-b border-surface-200/60">
                            <tr>
                                <th className="px-5 py-4">Ad ID</th>
                                <th className="px-5 py-4">Turf & Owner</th>
                                <th className="px-5 py-4">Ad Type</th>
                                <th className="px-5 py-4">Budget</th>
                                <th className="px-5 py-4">Commission</th>
                                <th className="px-5 py-4">Duration</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100">
                            {paginatedAds.length > 0 ? (
                                paginatedAds.map((ad) => (
                                    <tr key={ad.id} className="hover:bg-surface-50/50 transition-colors">
                                        <td className="px-5 py-4 font-mono text-xs font-bold text-surface-900 whitespace-nowrap">{ad.id}</td>
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-surface-900">{ad.turfName}</div>
                                            <div className="text-xs text-surface-500 font-medium">{ad.ownerName}</div>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-primary-600 font-bold">{ad.type}</td>
                                        <td className="px-5 py-4 font-bold text-surface-900">{ad.budget}</td>
                                        <td className="px-5 py-4 font-bold text-emerald-600">{ad.commission}</td>
                                        <td className="px-5 py-4 text-xs text-surface-500 font-medium whitespace-nowrap">
                                            {ad.startDate} to {ad.endDate}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <Badge variant={statusBadgeVariant(ad.status)} dot>{ad.status}</Badge>
                                        </td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleAction('view', ad)} className="p-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-600 transition-colors cursor-pointer" title="View">
                                                    <FiEye />
                                                </button>
                                                <button onClick={() => handleAction('edit', ad)} className="p-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-blue-600 transition-colors cursor-pointer" title="Edit">
                                                    <FiEdit2 />
                                                </button>

                                                {ad.status === 'Pending' && (
                                                    <>
                                                        <button onClick={() => handleAction('approve', ad)} className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors cursor-pointer" title="Approve">
                                                            <FiCheckCircle />
                                                        </button>
                                                        <button onClick={() => handleAction('reject', ad)} className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer" title="Reject">
                                                            <FiXCircle />
                                                        </button>
                                                    </>
                                                )}

                                                <button onClick={() => handleAction('pause', ad)} className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors cursor-pointer" title={ad.status === 'Active' ? 'Pause' : 'Activate'}>
                                                    {ad.status === 'Active' ? <FiPauseCircle /> : <FiPlayCircle />}
                                                </button>

                                                <button onClick={() => handleAction('delete', ad)} className="p-2 rounded-xl bg-surface-100 hover:bg-red-50 text-surface-400 hover:text-red-600 transition-colors cursor-pointer" title="Delete">
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-5 py-8 text-center text-surface-400 font-medium">
                                        No advertisements found matching criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-surface-200/60 flex justify-end">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(p) => setCurrentPage(p)}
                        />
                    </div>
                )}
            </div>

            {/* View Modal */}
            {viewModalOpen && selectedAd && (
                <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title={`Advertisement - ${selectedAd.id}`}>
                    <div className="space-y-4 text-surface-700">
                        <div className="flex justify-between items-center bg-surface-50 p-4 rounded-2xl border border-surface-200">
                            <div>
                                <h3 className="font-bold text-surface-900 text-lg">{selectedAd.turfName}</h3>
                                <p className="text-xs text-surface-500 font-medium">Owner: {selectedAd.ownerName}</p>
                            </div>
                            <Badge variant={statusBadgeVariant(selectedAd.status)} dot>{selectedAd.status}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs bg-surface-50/50 p-4 rounded-2xl border border-surface-100">
                            <div><span className="text-surface-500">Type:</span> <span className="font-bold text-primary-600 block">{selectedAd.type}</span></div>
                            <div><span className="text-surface-500">Budget:</span> <span className="font-bold text-surface-900 block">{selectedAd.budget}</span></div>
                            <div><span className="text-surface-500">Commission Rate:</span> <span className="font-bold text-emerald-600 block">{selectedAd.commission}</span></div>
                            <div><span className="text-surface-500">Duration:</span> <span className="font-bold text-surface-900 block">{selectedAd.startDate} to {selectedAd.endDate}</span></div>
                            <div><span className="text-surface-500">Total Banner Views:</span> <span className="font-bold text-surface-900 block">{selectedAd.views.toLocaleString()}</span></div>
                            <div><span className="text-surface-500">Slots Booked:</span> <span className="font-bold text-surface-900 block">{selectedAd.bookings}</span></div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={() => setViewModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit Modal */}
            {editModalOpen && selectedAd && (
                <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit Advertisement - ${selectedAd.id}`}>
                    <form onSubmit={saveEdit} className="space-y-4">
                        <Input label="Turf Name" value={selectedAd.turfName} onChange={(e) => setSelectedAd({ ...selectedAd, turfName: e.target.value })} />

                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Budget" value={selectedAd.budget} onChange={(e) => setSelectedAd({ ...selectedAd, budget: e.target.value })} />
                            <Input label="Commission (%)" value={selectedAd.commission} onChange={(e) => setSelectedAd({ ...selectedAd, commission: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input type="date" label="Start Date" value={selectedAd.startDate} onChange={(e) => setSelectedAd({ ...selectedAd, startDate: e.target.value })} />
                            <Input type="date" label="End Date" value={selectedAd.endDate} onChange={(e) => setSelectedAd({ ...selectedAd, endDate: e.target.value })} />
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-surface-200">
                            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                            <Button type="submit" variant="primary">Save Changes</Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Confirm Dialog */}
            {confirmModal.open && confirmModal.ad && (
                <ConfirmDialog
                    isOpen={confirmModal.open}
                    onClose={() => setConfirmModal({ open: false, action: '', ad: null })}
                    onConfirm={confirmAction}
                    title={`${confirmModal.action.toUpperCase()} Advertisement`}
                    message={`Are you sure you want to ${confirmModal.action} advertisement "${confirmModal.ad.id}" (${confirmModal.ad.turfName})?`}
                />
            )}
        </div>
    )
}
