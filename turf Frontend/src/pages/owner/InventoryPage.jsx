import { useState, useEffect, useCallback } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import CardGrid from '../../components/ui/CardGrid'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { HiCube, HiExclamation, HiPlus, HiRefresh, HiShieldCheck, HiViewGrid, HiViewList, HiPencil, HiTrash } from 'react-icons/hi'
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, restockItem } from '../../services/inventoryService'
import { getBranches } from '../../services/branchService'

const EMPTY_ITEM = { name: '', category: 'Equipment', stock: '', price: '', threshold: '5' }

export default function InventoryPage() {
    const { addToast } = useToast()
    const [items, setItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [myBranchId, setMyBranchId] = useState(null)
    const [modal, setModal] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [restockModal, setRestockModal] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [restockQty, setRestockQty] = useState('')
    const [restockCost, setRestockCost] = useState('')
    const [restockSupplier, setRestockSupplier] = useState('')
    const [viewMode, setViewMode] = useState('table')
    const [searchQuery, setSearchQuery] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' })
    const [newItem, setNewItem] = useState(EMPTY_ITEM)

    const fetchInventory = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await getInventory()
            const list = res?.data || (Array.isArray(res) ? res : []);
            setItems(list)
        } catch (err) {
            addToast({ title: 'Load Failed', message: err.message || 'Failed to load inventory.', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }, [addToast])


    useEffect(() => { fetchInventory() }, [fetchInventory])

    useEffect(() => {
        getBranches().then(res => {
            const branch = (res?.data || res || [])[0]
            if (branch) setMyBranchId(branch.id)
        }).catch(() => {})
    }, [])

    const handleCreateItem = async () => {
        if (!newItem.name || !newItem.stock || !newItem.price) {
            addToast({ title: 'Missing Information', message: 'Please enter name, initial stock and unit price', type: 'error' })
            return
        }
        if (!editMode && !myBranchId) {
            addToast({ title: 'No Branch Found', message: 'No branch is linked to this account yet.', type: 'error' })
            return
        }

        setIsSaving(true)
        try {
            if (editMode) {
                await updateInventoryItem(editingId, {
                    name: newItem.name, category: newItem.category, price: Number(newItem.price), threshold: Number(newItem.threshold)
                })
                addToast({ title: 'Item Updated', message: `${newItem.name} successfully updated.`, type: 'success' })
            } else {
                await createInventoryItem({
                    branchId: myBranchId, name: newItem.name, category: newItem.category,
                    stock: Number(newItem.stock), price: Number(newItem.price), threshold: Number(newItem.threshold)
                })
                addToast({ title: 'Item Registered', message: `${newItem.name} successfully added to inventory logs`, type: 'success' })
            }
            setModal(false)
            setEditMode(false)
            setEditingId(null)
            setNewItem(EMPTY_ITEM)
            fetchInventory()
        } catch (err) {
            addToast({ title: 'Save Failed', message: err.message || 'Could not save this item.', type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleEditTrigger = (item) => {
        setNewItem({ name: item.name, category: item.category, stock: String(item.stock), price: String(item.price), threshold: String(item.threshold) })
        setEditingId(item.id)
        setEditMode(true)
        setModal(true)
    }

    const handleDelete = async () => {
        try {
            await deleteInventoryItem(deleteConfirm.id)
            addToast({ title: 'Item Deleted', message: `${deleteConfirm.name} removed from inventory.`, type: 'info' })
            fetchInventory()
        } catch (err) {
            addToast({ title: 'Delete Failed', message: err.message || 'Could not delete this item.', type: 'error' })
        } finally {
            setDeleteConfirm({ open: false, id: null, name: '' })
        }
    }

    const handleRestockTrigger = (item) => {
        setSelectedItem(item)
        setRestockQty('')
        setRestockCost(String(item.price))
        setRestockSupplier('')
        setRestockModal(true)
    }

    const handleRestockSave = async () => {
        if (!restockQty || Number(restockQty) <= 0) {
            addToast({ title: 'Invalid Quantity', message: 'Enter a restock quantity greater than zero.', type: 'error' })
            return
        }
        if (!restockCost || Number(restockCost) <= 0) {
            addToast({ title: 'Invalid Cost', message: 'Enter the unit purchase cost for this restock.', type: 'error' })
            return
        }
        setIsSaving(true)
        try {
            await restockItem(selectedItem.id, { quantity: Number(restockQty), cost: Number(restockCost), supplier: restockSupplier || undefined })
            addToast({ title: 'Stock Restocked', message: `Added ${restockQty} units to ${selectedItem.name}`, type: 'success' })
            setRestockModal(false)
            fetchInventory()
        } catch (err) {
            addToast({ title: 'Restock Failed', message: err.message || 'Could not restock this item.', type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    const columns = [
        { key: 'name', label: 'Item Name' },
        { key: 'category', label: 'Category', render: v => <Badge>{v}</Badge> },
        {
            key: 'stock',
            label: 'Stock Progress',
            render: (_, r) => {
                const maxCap = Math.max(r.stock, r.threshold * 2)
                const pct = Math.min(100, Math.round((r.stock / maxCap) * 100))
                const barColor = r.status === 'Low Stock' || r.status === 'Out of Stock' ? 'bg-red-500' : 'bg-emerald-500'
                return (
                    <div className="space-y-1 text-xs">
                        <span className="font-extrabold text-surface-850">{r.stock} Units</span>
                        <div className="w-24 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                )
            }
        },
        { key: 'threshold', label: 'Min Threshold' },
        { key: 'value', label: 'Asset Value' },
        {
            key: 'status',
            label: 'Status',
            render: v => <Badge variant={v === 'In Stock' ? 'success' : 'danger'} dot>{v}</Badge>
        },
        {
            key: 'action',
            label: '',
            render: (_, r) => (
                <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => handleRestockTrigger(r)} className="cursor-pointer">
                        <HiRefresh className="mr-1 w-4 h-4" /> Restock
                    </Button>
                    <button onClick={() => handleEditTrigger(r)} className="p-1.5 rounded-xl border border-surface-200 hover:bg-surface-100 text-surface-600 transition-colors cursor-pointer" title="Edit">
                        <HiPencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm({ open: true, id: r.id, name: r.name })} className="p-1.5 rounded-xl border border-surface-200 hover:bg-red-50 hover:border-red-200 text-red-500 transition-colors cursor-pointer" title="Delete">
                        <HiTrash className="w-4 h-4" />
                    </button>
                </div>
            )
        },
    ]

    const lowStockAlerts = items.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length
    const totalAssetValue = items.reduce((sum, i) => sum + (Number(i.value?.replace(/[^0-9.]/g, '')) || 0), 0)
    const uniqueCategories = new Set(items.map(i => i.category)).size
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        <HiCube className="w-6 h-6 text-primary-500" /> Inventory Logs &amp; Controls
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Settle consumables, audit physical equipment, or track vendor levels</p>
                </div>
                <Button onClick={() => { setEditMode(false); setNewItem(EMPTY_ITEM); setModal(true) }} className="shadow-lg shadow-primary-500/10 cursor-pointer">
                    <HiPlus className="w-5 h-5 mr-1" /> Add New Item
                </Button>
            </div>

            {/* Quick overview summaries -- all derived from real fetched items, no hardcoded numbers */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 flex flex-col justify-between h-28 hover:shadow-soft transition-all border border-surface-200/60 shadow-soft">
                    <span className="text-xs font-bold text-surface-400 uppercase tracking-wider block">Total Items</span>
                    <span className="text-3xl font-extrabold text-surface-900 mt-1">{items.length}</span>
                </Card>
                <Card className="p-6 flex flex-col justify-between h-28 hover:shadow-soft transition-all border border-surface-200/60 shadow-soft">
                    <span className="text-xs font-bold text-surface-400 uppercase tracking-wider block">Low Stock Alerts</span>
                    <span className={`text-3xl font-extrabold mt-1 ${lowStockAlerts > 0 ? 'text-red-500' : 'text-surface-900'}`}>{lowStockAlerts}</span>
                </Card>
                <Card className="p-6 flex flex-col justify-between h-28 hover:shadow-soft transition-all border border-surface-200/60 shadow-soft">
                    <span className="text-xs font-bold text-surface-400 uppercase tracking-wider block">Total Asset Value</span>
                    <span className="text-3xl font-extrabold text-surface-900 mt-1">₹{totalAssetValue.toLocaleString('en-IN')}</span>
                </Card>
                <Card className="p-6 flex flex-col justify-between h-28 hover:shadow-soft transition-all border border-surface-200/60 shadow-soft">
                    <span className="text-xs font-bold text-surface-400 uppercase tracking-wider block">Unique Categories</span>
                    <span className="text-3xl font-extrabold text-surface-900 mt-1">{uniqueCategories}</span>
                </Card>
            </div>

            {/* Search, View Toggle & Main Content — Merged into 1 Card */}
            <div className="bg-white rounded-3xl border border-surface-200/60 shadow-soft overflow-hidden">
                {/* Search & View toggle */}
                <div className="flex flex-col sm:flex-row items-center gap-3 p-4 border-b border-surface-200/60">
                    <Input
                        placeholder="Search items by name or category..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="flex-1"
                    />
                    <Button
                        variant="outline"
                        onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                        className="flex items-center gap-2 whitespace-nowrap"
                    >
                        {viewMode === 'table'
                            ? <><HiViewGrid className="w-4 h-4" /> Card View</>
                            : <><HiViewList className="w-4 h-4" /> Table View</>
                        }
                    </Button>
                </div>

                {/* Main content: table or card grid */}
                {isLoading ? (
                    <div className="py-16 text-center text-slate-400 text-sm font-semibold">Loading inventory...</div>
                ) : viewMode === 'table' ? (
                    <div className="p-6">
                        <DataTable columns={columns} data={filteredItems} />
                    </div>
                ) : (
                    <div className="p-6">
                        <CardGrid items={filteredItems} renderCard={item => (
                            <Card key={item.id} className="p-4 flex flex-col gap-2 hover:shadow-md transition-all border border-surface-200/60">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sm text-surface-900 truncate">{item.name}</h3>
                                    <Badge variant={item.status === 'In Stock' ? 'success' : 'danger'} dot>{item.status}</Badge>
                                </div>
                                <Badge>{item.category}</Badge>
                                <div className="text-xs text-surface-500 space-y-0.5 mt-1">
                                    <p>Stock: <span className="font-bold text-surface-800">{item.stock} units</span></p>
                                    <p>Value: <span className="font-bold text-surface-800">{item.value}</span></p>
                                    <p>Threshold: <span className="font-bold text-surface-800">{item.threshold} units</span></p>
                                </div>
                                <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden mt-1">
                                    <div
                                        className={`h-full ${item.status === 'In Stock' ? 'bg-emerald-500' : 'bg-red-500'}`}
                                        style={{ width: `${Math.min(100, Math.round((item.stock / Math.max(item.stock, item.threshold * 2)) * 100))}%` }}
                                    />
                                </div>
                                <div className="flex gap-1.5 mt-1">
                                    <Button size="sm" variant="outline" onClick={() => handleRestockTrigger(item)} className="flex-1">
                                        <HiRefresh className="w-3 h-3 mr-1" /> Restock
                                    </Button>
                                    <button onClick={() => handleEditTrigger(item)} className="p-2 rounded-xl border border-surface-200 hover:bg-surface-100 text-surface-600 cursor-pointer" title="Edit">
                                        <HiPencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setDeleteConfirm({ open: true, id: item.id, name: item.name })} className="p-2 rounded-xl border border-surface-200 hover:bg-red-50 hover:border-red-200 text-red-500 cursor-pointer" title="Delete">
                                        <HiTrash className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </Card>
                        )} />
                    </div>
                )}

                {!isLoading && filteredItems.length === 0 && (
                    <div className="py-16 text-center text-slate-400 text-sm font-semibold">No inventory items found.</div>
                )}
            </div>

            {/* Create/Edit Item Modal */}
            <Modal isOpen={modal} onClose={() => setModal(false)} title={editMode ? 'Edit Inventory Item' : 'Register Inventory Stock'} size="sm">
                <div className="space-y-4 animate-in fade-in">
                    <Input
                        label="Item Name"
                        placeholder="e.g. Football Grips"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                    <Select
                        label="Category Class"
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        options={[
                            { value: 'Equipment', label: 'Equipment / Rent Gear' },
                            { value: 'Consumable', label: 'Consumable / Snacks' },
                            { value: 'Safety', label: 'Safety / Medical Kits' },
                        ]}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Initial Quantity"
                            type="number"
                            placeholder="e.g. 20"
                            value={newItem.stock}
                            disabled={editMode}
                            onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                        />
                        <Input
                            label="Unit Purchase Cost (₹)"
                            type="number"
                            placeholder="e.g. 150"
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        />
                    </div>
                    {editMode && (
                        <p className="text-[11px] text-slate-400 font-medium -mt-2">Use "Restock" to change quantity -- editing here only updates name, category, price, and threshold.</p>
                    )}
                    <Input
                        label="Minimum Threshold Alert Limit"
                        type="number"
                        placeholder="e.g. 5"
                        value={newItem.threshold}
                        onChange={(e) => setNewItem({ ...newItem, threshold: e.target.value })}
                    />
                    <div className="flex gap-3 justify-end pt-4 border-t border-surface-100 mt-6 font-semibold">
                        <Button variant="secondary" onClick={() => setModal(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleCreateItem} disabled={isSaving}>{isSaving ? 'Saving...' : editMode ? 'Save Changes' : 'Add Item'}</Button>
                    </div>
                </div>
            </Modal>

            {/* Restock Modal */}
            {selectedItem && (
                <Modal isOpen={restockModal} onClose={() => setRestockModal(false)} title={`Restock: ${selectedItem.name}`} size="sm">
                    <div className="space-y-4 animate-in fade-in">
                        <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 text-xs">
                            <p className="font-bold text-surface-700">Current Stock: <span className="font-extrabold text-surface-900">{selectedItem.stock} Units</span></p>
                            <p className="font-semibold text-surface-450 mt-1">Alert Threshold: {selectedItem.threshold} Units</p>
                        </div>
                        <Input
                            label="Additional Restock Units"
                            type="number"
                            placeholder="e.g. 10"
                            value={restockQty}
                            onChange={(e) => setRestockQty(e.target.value)}
                        />
                        <Input
                            label="Unit Purchase Cost for this Batch (₹)"
                            type="number"
                            placeholder="e.g. 150"
                            value={restockCost}
                            onChange={(e) => setRestockCost(e.target.value)}
                        />
                        <Input
                            label="Supplier (optional)"
                            placeholder="e.g. Decathlon Wholesale"
                            value={restockSupplier}
                            onChange={(e) => setRestockSupplier(e.target.value)}
                        />
                        <div className="flex gap-3 justify-end pt-4 border-t border-surface-100 mt-6">
                            <Button variant="secondary" onClick={() => setRestockModal(false)} disabled={isSaving}>Cancel</Button>
                            <Button onClick={handleRestockSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">{isSaving ? 'Saving...' : 'Save Stock'}</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirm */}
            <ConfirmDialog
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title="Delete Inventory Item"
                message={`Are you sure you want to delete ${deleteConfirm.name}? This cannot be undone.`}
                variant="danger"
                confirmText="Delete"
            />
        </div>
    )
}
