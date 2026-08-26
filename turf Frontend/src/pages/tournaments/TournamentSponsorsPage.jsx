import { useState, useEffect, useCallback } from 'react'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'
import { HiPlus, HiStar, HiExternalLink, HiPencil, HiTrash } from 'react-icons/hi'
import { getSponsors, createSponsor, updateSponsor, deleteSponsor } from '../../services/tournamentService'
import api from '../../services/api'
import { uploadMedia } from '../../services/uploadService'

const TIER_OPTIONS = [
    { value: 'Bronze Sponsor', label: 'Bronze Sponsor' },
    { value: 'Silver Sponsor', label: 'Silver Sponsor' },
    { value: 'Gold Sponsor', label: 'Gold Sponsor' },
    { value: 'Platinum Sponsor', label: 'Platinum Title Sponsor' },
]

const EMPTY_FORM = { tournamentId: '', companyName: '', tier: 'Gold Sponsor', logo: '', website: '', packageAmount: '10000' }

export default function TournamentSponsorsPage({ role = 'owner' }) {
    const { addToast } = useToast()
    const [sponsors, setSponsors] = useState([])
    const [tournaments, setTournaments] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null })
    const [form, setForm] = useState(EMPTY_FORM)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [sponsorRes, tournamentRes] = await Promise.all([
                getSponsors(),
                api.get('/tournaments')
            ])
            setSponsors(sponsorRes.data || [])
            setTournaments(tournamentRes?.data || [])
        } catch (err) {
            addToast({ title: 'Load Failed', message: err.message || 'Failed to load sponsors.', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

    useEffect(() => { fetchData() }, [fetchData])

    const openCreate = () => {
        setForm({ ...EMPTY_FORM, tournamentId: tournaments[0]?.id || tournaments[0]?._id || '' })
        setModal({ open: true, mode: 'create', data: null })
    }

    const openEdit = (sponsor) => {
        setForm({
            tournamentId: sponsor.tournamentId,
            companyName: sponsor.sponsorName,
            tier: sponsor.sponsorTier,
            logo: sponsor.logo || '',
            website: sponsor.websiteUrl || '',
            packageAmount: String(sponsor.packageAmount)
        })
        setModal({ open: true, mode: 'edit', data: sponsor })
    }

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setIsUploadingLogo(true)
        try {
            const { url } = await uploadMedia(file)
            setForm(prev => ({ ...prev, logo: url }))
        } catch (err) {
            addToast({ title: 'Upload Failed', message: err.message || 'Could not upload logo.', type: 'error' })
        } finally {
            setIsUploadingLogo(false)
        }
    }

    const handleSave = async () => {
        if (!form.companyName.trim()) {
            addToast({ title: 'Validation Error', message: 'Company Name is required.', type: 'error' })
            return
        }
        if (!form.tournamentId) {
            addToast({ title: 'Validation Error', message: 'Please select a tournament.', type: 'error' })
            return
        }

        const payload = {
            tournamentId: form.tournamentId,
            sponsorName: form.companyName.trim(),
            sponsorTier: form.tier,
            logo: form.logo || null,
            websiteUrl: form.website || null,
            packageAmount: Number(form.packageAmount) || 0
        }

        setIsSaving(true)
        try {
            if (modal.mode === 'edit' && modal.data) {
                await updateSponsor(modal.data.id, payload)
                addToast({ title: 'Sponsor Updated', message: `${form.companyName} updated.`, type: 'success' })
            } else {
                await createSponsor(payload)
                addToast({ title: 'Sponsor Added', message: `${form.companyName} added as ${form.tier}.`, type: 'success' })
            }
            setModal({ open: false, mode: 'create', data: null })
            fetchData()
        } catch (err) {
            addToast({ title: 'Save Failed', message: err.message || 'Could not save this sponsor.', type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (sponsor) => {
        if (!window.confirm(`Remove sponsor "${sponsor.sponsorName}"?`)) return
        try {
            await deleteSponsor(sponsor.id)
            addToast({ title: 'Sponsor Removed', message: `${sponsor.sponsorName} removed.`, type: 'info' })
            fetchData()
        } catch (err) {
            addToast({ title: 'Delete Failed', message: err.message || 'Could not remove this sponsor.', type: 'error' })
        }
    }

    const columns = [
        {
            key: 'sponsorName',
            label: 'Sponsor Company',
            render: (_, r) => (
                <div className="flex items-center gap-3">
                    {r.logo ? (
                        <img src={r.logo} alt={r.sponsorName} className="w-9 h-9 rounded-xl object-cover border border-surface-200" />
                    ) : (
                        <div className="w-9 h-9 rounded-xl bg-surface-100 border border-surface-200 flex items-center justify-center text-surface-400 text-xs font-black">
                            {r.sponsorName?.[0]?.toUpperCase()}
                        </div>
                    )}
                    <div>
                        <div className="font-extrabold text-surface-900">{r.sponsorName}</div>
                        {r.websiteUrl && (
                            <a href={r.websiteUrl} target="_blank" rel="noreferrer" className="text-[11px] text-primary-600 font-bold flex items-center gap-1 hover:underline">
                                {r.websiteUrl} <HiExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'sponsorTier',
            label: 'Sponsor Tier',
            render: v => {
                let color = 'default'
                if (v?.startsWith('Platinum')) color = 'primary'
                else if (v?.startsWith('Gold')) color = 'warning'
                else if (v?.startsWith('Silver')) color = 'secondary'
                return <Badge variant={color}>{v}</Badge>
            }
        },
        { key: 'packageAmount', label: 'Package Amount', render: v => <span className="font-extrabold text-surface-900">₹{Number(v).toLocaleString('en-IN')}</span> },
        { key: 'status', label: 'Status', render: v => <Badge variant={v === 'ACTIVE' ? 'success' : 'default'} dot>{v}</Badge> },
        ...(role === 'owner' ? [{
            key: 'action',
            label: 'Action',
            render: (_, r) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(r)} className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer" title="Edit">
                        <HiPencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(r)} className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer" title="Remove">
                        <HiTrash className="w-4 h-4" />
                    </button>
                </div>
            )
        }] : [])
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
                    <Button onClick={openCreate} disabled={tournaments.length === 0}>
                        <HiPlus className="w-5 h-5 mr-1" /> Add Sponsor
                    </Button>
                )}
            </div>

            {/* Datatable */}
            <Card className="p-6">
                {isLoading ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">Loading sponsors...</div>
                ) : sponsors.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-semibold">No sponsors added yet.</div>
                ) : (
                    <DataTable columns={columns} data={sponsors} />
                )}
            </Card>

            {/* Modal */}
            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'edit' ? 'Edit Sponsor' : 'Add Tournament Sponsor'} size="md">
                <div className="space-y-4">
                    <Select
                        label="Tournament *"
                        value={form.tournamentId}
                        onChange={(e) => setForm({ ...form, tournamentId: e.target.value })}
                        options={tournaments.map(t => ({ value: t.id || t._id, label: t.title || t.name }))}
                    />

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
                            options={TIER_OPTIONS}
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

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Sponsor Logo</label>
                        <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingLogo}
                            onChange={handleLogoUpload}
                            className="block w-full text-xs text-surface-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                        />
                        {isUploadingLogo && <p className="text-[11px] text-surface-400 font-semibold mt-1">Uploading...</p>}
                        {form.logo && (
                            <img src={form.logo} alt="Logo preview" className="w-16 h-16 rounded-xl object-cover border border-surface-200 mt-2" />
                        )}
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-surface-100">
                        <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Sponsor'}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
