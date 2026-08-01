import { useState, useEffect, useMemo } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import CardGrid from '../../components/ui/CardGrid'
import { useToast } from '../../components/ui/Toast'
import { HiCube, HiExclamation, HiPlus, HiRefresh, HiShieldCheck, HiViewGrid, HiViewList } from 'react-icons/hi'

const initialItems = [
    { id: 1, name: 'Cricket Bats', category: 'Equipment', stock: 12, threshold: 5, value: '₹18,000', status: 'In Stock' },
    { id: 2, name: 'Footballs', category: 'Equipment', stock: 3, threshold: 5, value: '₹4,500', status: 'Low Stock' },
    { id: 3, name: 'Shuttle Cocks (Box)', category: 'Consumable', stock: 8, threshold: 10, value: '₹2,400', status: 'Low Stock' },
    { id: 4, name: 'Water Bottles', category: 'Consumable', stock: 48, threshold: 20, value: '₹2,880', status: 'In Stock' },
    { id: 5, name: 'First Aid Kit', category: 'Safety', stock: 6, threshold: 3, value: '₹3,000', status: 'In Stock' },
]

export default function InventoryPage() {
    const { addToast } = useToast()
    const [items, setItems] = useState(initialItems)
    const [modal, setModal] = useState(false)
    const [restockModal, setRestockModal] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [restockQty, setRestockQty] = useState('')
    const [viewMode, setViewMode] = useState('table')
    const [searchQuery, setSearchQuery] = useState('')
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'Equipment',
        stock: '',
        price: '',
        threshold: '5'
    })

    const handleCreateItem = () => {
        if (!newItem.name || !newItem.stock || !newItem.price) {
            addToast({ title: 'Missing Information', message: 'Please enter name, initial stock and unit price', type: 'error' })
            return
        }
        const nextId = items.length + 1
        const totalValStr = '₹' + (Number(newItem.stock) * Number(newItem.price)).toLocaleString()
        const isLow = Number(newItem.stock) < Number(newItem.threshold)
        setItems([...items, {
            id: nextId,
            name: newItem.name,
            category: newItem.category,
            stock: Number(newItem.stock),
            threshold: Number(newItem.threshold),
            value: totalValStr,
            status: isLow ? 'Low Stock' : 'In Stock'
        }])
        setModal(false)
        addToast({ title: 'Item Registered', message: `${newItem.name} successfully added to inventory logs`, type: 'success' })
    }

    const handleRestockTrigger = (item) => {
        setSelectedItem(item)
        setRestockQty('')
        setRestockModal(true)
    }

    const handleRestockSave = () => {
        if (!restockQty || Number(restockQty) <= 0) return
        setItems(items.map(i => {
            if (i.id === selectedItem.id) {
                const finalQty = i.stock + Number(restockQty)
                const isLow = finalQty < i.threshold
                const rawVal = Number(i.value.replace(/[^0-9]/g, ''))
                const unitPrice = rawVal / i.stock
                const finalValStr = '₹' + Math.round(finalQty * unitPrice).toLocaleString()
                return { ...i, stock: finalQty, value: finalValStr, status: isLow ? 'Low Stock' : 'In Stock' }
            }
            return i
        }))
        setRestockModal(false)
        addToast({ title: 'Stock Restocked', message: `Added ${restockQty} units to ${selectedItem.name}`, type: 'success' })
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
                const barColor = r.status === 'Low Stock' ? 'bg-red-500' : 'bg-emerald-500'
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
                <Button size="sm" variant="outline" onClick={() => handleRestockTrigger(r)} className="cursor-pointer">
                    <HiRefresh className="mr-1 w-4 h-4" /> Restock
                </Button>
            )
        },
    ]

    const lowStockAlerts = items.filter(i => i.status === 'Low Stock').length
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        <HiCube className="w-6 h-6 text-primary-500" /> Inventory Logs &amp; Controls
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Settle consumables, audit physical equipment, or track vendor levels</p>
                </div>
                <Button onClick={() => setModal(true)} className="shadow-lg shadow-primary-500/10 cursor-pointer">
                    <HiPlus className="w-5 h-5 mr-1" /> Add New Item
                </Button>
            </div>

            {/* Quick overview summaries */}
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
                    <span className="text-3xl font-extrabold text-surface-900 mt-1">₹30,780</span>
                </Card>
                <Card className="p-6 flex flex-col justify-between h-28 hover:shadow-soft transition-all border border-surface-200/60 shadow-soft">
                    <span className="text-xs font-bold text-surface-400 uppercase tracking-wider block">Unique Categories</span>
                    <span className="text-3xl font-extrabold text-surface-900 mt-1">3</span>
                </Card>
            </div>

            {/* Search & View toggle */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
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
            {viewMode === 'table' ? (
                <Card className="p-6">
                    <DataTable columns={columns} data={filteredItems} />
                </Card>
            ) : (
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
                                className={`h-full ${item.status === 'Low Stock' ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, Math.round((item.stock / Math.max(item.stock, item.threshold * 2)) * 100))}%` }}
                            />
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleRestockTrigger(item)} className="mt-1 w-full">
                            <HiRefresh className="w-3 h-3 mr-1" /> Restock
                        </Button>
                    </Card>
                )} />
            )}

            {/* Create Item Modal */}
            <Modal isOpen={modal} onClose={() => setModal(false)} title="Register Inventory Stock" size="sm">
                <div className="space-y-4 animate-in fade-in">
                    <Input
                        label="Item Name"
                        placeholder="e.g. Badminton Grips"
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
                    <Input
                        label="Minimum Threshold Alert Limit"
                        type="number"
                        placeholder="e.g. 5"
                        value={newItem.threshold}
                        onChange={(e) => setNewItem({ ...newItem, threshold: e.target.value })}
                    />
                    <div className="flex gap-3 justify-end pt-4 border-t border-surface-100 mt-6 font-semibold">
                        <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
                        <Button onClick={handleCreateItem}>Add Item</Button>
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
                        <div className="flex gap-3 justify-end pt-4 border-t border-surface-100 mt-6">
                            <Button variant="secondary" onClick={() => setRestockModal(false)}>Cancel</Button>
                            <Button onClick={handleRestockSave} className="bg-emerald-600 hover:bg-emerald-700">Save Stock</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
