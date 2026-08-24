import { useState, useEffect, useCallback } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { getInventory } from '../../services/inventoryService'

export default function StaffEquipment() {
    const { addToast } = useToast()
    const [equipment, setEquipment] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)

    const fetchEquipment = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await getInventory()
            setEquipment(res.data || [])
        } catch (err) {
            addToast({ title: 'Load Failed', message: err.message || 'Failed to load equipment/inventory.', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

    useEffect(() => { fetchEquipment() }, [fetchEquipment])

    const handleView = (item) => {
        setSelectedItem(item)
        setIsViewOpen(true)
    }

    const equipmentColumns = [
        { key: 'name', label: 'Item' },
        { key: 'category', label: 'Category' },
        { key: 'stock', label: 'Stock' },
        {
            key: 'status',
            label: 'Status',
            render: v => <Badge variant={v === 'In Stock' ? 'success' : v === 'Low Stock' ? 'warning' : 'danger'} dot>{v}</Badge>
        },
        {
            key: 'action',
            label: 'Action',
            render: (_, r) => (
                <Button size="sm" variant="outline" onClick={() => handleView(r)}>
                    👁️ View
                </Button>
            )
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Equipment Status</h1>
                <p className="text-surface-500 text-sm mt-1">Check stock levels for equipment and consumables</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden pt-4">
                {isLoading ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">Loading equipment...</div>
                ) : equipment.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">No inventory items found for this branch.</div>
                ) : (
                    <DataTable columns={equipmentColumns} data={equipment} />
                )}
            </div>

            {/* View Equipment Details Modal */}
            <Modal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="Equipment Details"
            >
                {selectedItem && (
                    <div className="space-y-5">
                        {/* Header with Name and Status */}
                        <div className="flex items-center justify-between pb-4 border-b border-surface-100">
                            <div>
                                <p className="text-xs text-surface-400 uppercase tracking-wider">Item</p>
                                <p className="text-lg font-bold text-surface-900">{selectedItem.name}</p>
                            </div>
                            <Badge variant={selectedItem.status === 'In Stock' ? 'success' : selectedItem.status === 'Low Stock' ? 'warning' : 'danger'} dot>
                                {selectedItem.status}
                            </Badge>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">📦 Category</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedItem.category}</p>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">🔢 Stock</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedItem.stock} units</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">💰 Asset Value</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedItem.value}</p>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                                <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">📊 Min Threshold</p>
                                <p className="text-sm font-semibold text-surface-900">{selectedItem.threshold} units</p>
                            </div>
                        </div>

                        {/* Close Button */}
                        <div className="flex justify-end pt-2">
                            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
