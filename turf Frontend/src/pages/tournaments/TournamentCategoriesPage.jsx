import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { HiPlus, HiTag, HiPencil, HiTrash } from 'react-icons/hi'

const initialCategories = [
    { id: 'cat_01', name: 'Open Category', description: 'Open for all age groups & player tiers', count: 4, status: 'ACTIVE' },
    { id: 'cat_02', name: 'Under 19 (U-19)', description: 'Youth players born on or after Jan 2007', count: 2, status: 'ACTIVE' },
    { id: 'cat_03', name: 'Corporate Cup', description: 'Verified corporate company employee teams', count: 3, status: 'ACTIVE' },
    { id: 'cat_04', name: 'Veterans (35+)', description: 'Senior players aged 35 years and above', count: 1, status: 'ACTIVE' },
    { id: 'cat_05', name: 'Women League', description: 'All-women team tournament category', count: 2, status: 'ACTIVE' },
]

export default function TournamentCategoriesPage() {
    const { addToast } = useToast()
    const [categories, setCategories] = useState(initialCategories)
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null })
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' })

    const handleSave = () => {
        if (!name) {
            addToast({ title: 'Validation Error', message: 'Category Name is required.', type: 'error' })
            return
        }

        if (modal.mode === 'create') {
            const newCat = {
                id: 'cat_' + Date.now(),
                name,
                description: desc,
                count: 0,
                status: 'ACTIVE'
            }
            setCategories([...categories, newCat])
            addToast({ title: 'Category Created', message: `Category "${name}" added successfully.`, type: 'success' })
        } else {
            setCategories(categories.map(c => c.id === modal.data.id ? { ...c, name, description: desc } : c))
            addToast({ title: 'Category Updated', message: `Category "${name}" updated.`, type: 'success' })
        }

        setModal({ open: false, mode: 'create', data: null })
        setName('')
        setDesc('')
    }

    const handleDelete = () => {
        setCategories(categories.filter(c => c.id !== deleteConfirm.id))
        setDeleteConfirm({ open: false, id: null, name: '' })
        addToast({ title: 'Category Deleted', message: 'Category removed.', type: 'success' })
    }

    const columns = [
        { key: 'name', label: 'Category Name', render: (_, r) => <span className="font-extrabold text-surface-900">{r.name}</span> },
        { key: 'description', label: 'Description' },
        { key: 'count', label: 'Active Tournaments', render: v => <span className="font-bold text-primary-600">{v} Tournaments</span> },
        { key: 'status', label: 'Status', render: v => <Badge variant={v === 'ACTIVE' ? 'success' : 'default'} dot>{v}</Badge> },
        { 
            key: 'action', 
            label: 'Action', 
            render: (_, r) => (
                <div className="flex justify-end gap-2">
                    <button 
                        onClick={() => { setModal({ open: true, mode: 'edit', data: r }); setName(r.name); setDesc(r.description); }} 
                        className="p-1.5 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg cursor-pointer"
                    >
                        <HiPencil className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setDeleteConfirm({ open: true, id: r.id, name: r.name })} 
                        className="p-1.5 text-surface-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                        <HiTrash className="w-4 h-4" />
                    </button>
                </div>
            ) 
        },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        <HiTag className="text-primary-600" /> Tournament Categories
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Manage tournament age, corporate, and skill category classifications</p>
                </div>
                <Button onClick={() => { setModal({ open: true, mode: 'create', data: null }); setName(''); setDesc(''); }}>
                    <HiPlus className="w-5 h-5 mr-1" /> Add Category
                </Button>
            </div>

            {/* Datatable */}
            <Card className="p-6">
                <DataTable columns={columns} data={categories} />
            </Card>

            {/* Modal */}
            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Add Tournament Category' : 'Edit Category'} size="sm">
                <div className="space-y-4">
                    <Input
                        label="Category Name *"
                        placeholder="e.g. Under 19 (U-19)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <div>
                        <label className="block text-xs font-bold text-surface-700 mb-1">Description</label>
                        <textarea
                            rows="3"
                            placeholder="Category guidelines or age eligibility..."
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full p-3 text-xs bg-white border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-surface-100">
                        <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
                        <Button onClick={handleSave}>Save Category</Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title="Delete Category"
                message={`Delete category "${deleteConfirm.name}"?`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    )
}
