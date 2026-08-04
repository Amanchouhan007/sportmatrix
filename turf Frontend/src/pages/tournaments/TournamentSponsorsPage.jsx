import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'
import { HiPlus, HiStar, HiExternalLink, HiPencil, HiTrash } from 'react-icons/hi'

const mockSponsors = [
    { id: 'spn_01', companyName: 'RedBull Energy', tier: 'Platinum', logo: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=100', website: 'https://redbull.com', packageAmount: 50000, status: 'ACTIVE' },
    { id: 'spn_02', companyName: 'Nike Sports India', tier: 'Gold', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=100', website: 'https://nike.com', packageAmount: 30000, status: 'ACTIVE' },
    { id: 'spn_03', companyName: 'Decathlon Arena', tier: 'Silver', logo: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=100', website: 'https://decathlon.in', packageAmount: 15000, status: 'ACTIVE' },
    { id: 'spn_04', companyName: 'Local Fitness Zone', tier: 'Bronze', logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=100', website: 'https://localfitness.com', packageAmount: 5000, status: 'ACTIVE' },
]

export default function TournamentSponsorsPage({ role = 'owner' }) {
    const { addToast } = useToast()
    const [sponsors, setSponsors] = useState(mockSponsors)
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null })

    const [form, setForm] = useState({
        companyName: '',
        tier: 'Gold',
        logo: '',
        website: '',
        packageAmount: '10000'
    })

    const handleSave = () => {
        if (!form.companyName) {
            addToast({ title: 'Validation Error', message: 'Company Name is required.', type: 'error' })
            return
        }

        if (modal.mode === 'create') {
            const newSponsor = {
                id: 'spn_' + Date.now(),
                companyName: form.companyName,
                tier: form.tier,
                logo: form.logo || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=100',
                website: form.website,
                packageAmount: Number(form.packageAmount),
                status: 'ACTIVE'
            }
            setSponsors([...sponsors, newSponsor])
            addToast({ title: 'Sponsor Added!', message: `${form.companyName} added as ${form.tier} sponsor.`, type: 'success' })
        }

        setModal({ open: false, mode: 'create', data: null })
    }

    const columns = [
        {
            key: 'companyName',
            label: 'Sponsor Company',
            render: (_, r) => (
                <div className="flex items-center gap-3">
                    <img src={r.logo} alt={r.companyName} className="w-9 h-9 rounded-xl object-cover border border-surface-200" />
                    <div>
                        <div className="font-extrabold text-surface-900">{r.companyName}</div>
                        {r.website && (
                            <a href={r.website} target="_blank" rel="noreferrer" className="text-[11px] text-primary-600 font-bold flex items-center gap-1 hover:underline">
                                {r.website} <HiExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'tier',
            label: 'Sponsor Tier',
            render: v => {
                let color = 'default'
                if (v === 'Platinum') color = 'primary'
                else if (v === 'Gold') color = 'warning'
                else if (v === 'Silver') color = 'secondary'
                return <Badge variant={color}>{v} Sponsor</Badge>
            }
        },
        { key: 'packageAmount', label: 'Package Amount', render: v => <span className="font-extrabold text-surface-900">₹{v.toLocaleString()}</span> },
        { key: 'status', label: 'Status', render: v => <Badge variant="success" dot>{v}</Badge> },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        <HiStar className="text-amber-500" /> Sponsor Management Module
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Manage corporate sponsorship tiers (Bronze, Silver, Gold, Platinum) and logos</p>
                </div>
                {role === 'owner' && (
                    <Button onClick={() => setModal({ open: true, mode: 'create', data: null })}>
                        <HiPlus className="w-5 h-5 mr-1" /> Add Sponsor
                    </Button>
                )}
            </div>

            {/* Datatable */}
            <Card className="p-6">
                <DataTable columns={columns} data={sponsors} />
            </Card>

            {/* Modal */}
            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title="Add Tournament Sponsor" size="md">
                <div className="space-y-4">
                    <Input
                        label="Company Name *"
                        placeholder="e.g. RedBull Energy"
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Sponsorship Tier"
                            value={form.tier}
                            onChange={(e) => setForm({ ...form, tier: e.target.value })}
                            options={[
                                { value: 'Bronze', label: 'Bronze Sponsor' },
                                { value: 'Silver', label: 'Silver Sponsor' },
                                { value: 'Gold', label: 'Gold Sponsor' },
                                { value: 'Platinum', label: 'Platinum Title Sponsor' },
                            ]}
                        />
                        <Input
                            label="Package Amount (₹)"
                            type="number"
                            placeholder="30000"
                            value={form.packageAmount}
                            onChange={(e) => setForm({ ...form, packageAmount: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Website URL"
                        placeholder="https://..."
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                    />

                    <Input
                        label="Sponsor Logo Image URL"
                        placeholder="https://..."
                        value={form.logo}
                        onChange={(e) => setForm({ ...form, logo: e.target.value })}
                    />

                    <div className="flex gap-3 justify-end pt-4 border-t border-surface-100">
                        <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
                        <Button onClick={handleSave}>Save Sponsor</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
