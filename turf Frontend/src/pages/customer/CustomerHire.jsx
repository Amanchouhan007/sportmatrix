import { useState, useEffect } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'

const initialApplications = [
    { id: 'HA-001', tournament: 'Premier Cricket League', team: 'Royal Challengers', role: 'Batsman', bid: '₹2,000', status: 'Pending' },
    { id: 'HA-002', tournament: 'Football Cup', team: 'City Strikers', role: 'Midfielder', bid: '₹1,500', status: 'Approved' },
    { id: 'HA-003', tournament: 'Esports Championship', team: 'Pixel Warriors', role: 'Support', bid: '₹3,000', status: 'Rejected' },
]

export default function CustomerHire() {
    const { addToast } = useToast()
    const [apps, setApps] = useState(() => {
        const saved = localStorage.getItem('customer_hire_apps')
        return saved ? JSON.parse(saved) : initialApplications
    })

    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
    const [isContractModalOpen, setIsContractModalOpen] = useState(false)
    const [selectedApp, setSelectedApp] = useState(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [withdrawId, setWithdrawId] = useState(null)

    const [formData, setFormData] = useState({
        tournament: '',
        team: '',
        role: '',
        bid: ''
    })

    useEffect(() => {
        localStorage.setItem('customer_hire_apps', JSON.stringify(apps))
    }, [apps])

    const handleApply = () => {
        if (!formData.tournament || !formData.team || !formData.role || !formData.bid) {
            addToast({ title: 'Error', message: 'Please fill all fields', type: 'error' })
            return
        }

        const newApp = {
            id: `HA-${String(apps.length + 1).padStart(3, '0')}`,
            ...formData,
            bid: `₹${formData.bid}`,
            status: 'Pending'
        }

        setApps([newApp, ...apps])
        setIsApplyModalOpen(false)
        setFormData({ tournament: '', team: '', role: '', bid: '' })
        addToast({ title: 'Success', message: 'Application submitted successfully', type: 'success' })
    }

    const handleWithdraw = () => {
        setApps(apps.filter(a => a.id !== withdrawId))
        setIsConfirmOpen(false)
        addToast({ title: 'Withdrawn', message: 'Application withdrawn successfully', type: 'success' })
    }

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'tournament', label: 'Tournament' },
        { key: 'team', label: 'Team' },
        { key: 'role', label: 'Role' },
        { key: 'bid', label: 'Bid Amount' },
        { 
            key: 'status', 
            label: 'Status', 
            render: v => <Badge variant={v === 'Approved' ? 'success' : v === 'Pending' ? 'warning' : 'danger'} dot>{v}</Badge> 
        },
        { 
            key: 'action', 
            label: '', 
            render: (_, r) => (
                <div className="flex gap-2">
                    {r.status === 'Pending' && (
                        <Button 
                            size="sm" 
                            variant="danger" 
                            onClick={() => {
                                setWithdrawId(r.id)
                                setIsConfirmOpen(true)
                            }}
                        >
                            Withdraw
                        </Button>
                    )}
                    {r.status === 'Approved' && (
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                                setSelectedApp(r)
                                setIsContractModalOpen(true)
                            }}
                        >
                            View Contract
                        </Button>
                    )}
                </div>
            )
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-surface-900">Hire Applications</h1><p className="text-surface-500 text-sm mt-1">Track your player-for-hire applications</p></div>
                <Button onClick={() => setIsApplyModalOpen(true)}>Apply as Player</Button>
            </div>
            
            <Card className="border-l-4 border-l-primary-500 bg-primary-50/30">
                <p className="text-sm text-surface-600"><span className="font-semibold text-primary-700">💡 Tip:</span> Teams in active tournaments are looking for skilled players. Browse the <span className="text-primary-600 font-medium hover:underline cursor-pointer">Marketplace</span> to find opportunities.</p>
            </Card>

            <DataTable columns={columns} data={apps} />

            {/* Apply Modal */}
            <Modal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                title="Apply for Hire"
            >
                <div className="space-y-4 pt-2">
                    <Input 
                        label="Tournament" 
                        placeholder="e.g. Premier Cricket League" 
                        value={formData.tournament}
                        onChange={e => setFormData({ ...formData, tournament: e.target.value })}
                    />
                    <Input 
                        label="Team Name" 
                        placeholder="e.g. Royal Challengers" 
                        value={formData.team}
                        onChange={e => setFormData({ ...formData, team: e.target.value })}
                    />
                    <Input 
                        label="Role" 
                        placeholder="e.g. Batsman, Bowler, Midfielder" 
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                    />
                    <Input 
                        label="Bid Amount (₹)" 
                        type="number" 
                        placeholder="0.00" 
                        value={formData.bid}
                        onChange={e => setFormData({ ...formData, bid: e.target.value })}
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleApply}>Submit Application</Button>
                    </div>
                </div>
            </Modal>

            {/* Contract Modal */}
            <Modal
                isOpen={isContractModalOpen}
                onClose={() => setIsContractModalOpen(false)}
                title="Player Contract"
            >
                {selectedApp && (
                    <div className="space-y-6 pt-2">
                        <div className="bg-surface-50 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between border-b border-surface-200 pb-2">
                                <span className="text-surface-500">Tournament</span>
                                <span className="font-semibold text-surface-900">{selectedApp.tournament}</span>
                            </div>
                            <div className="flex justify-between border-b border-surface-200 pb-2">
                                <span className="text-surface-500">Team</span>
                                <span className="font-semibold text-surface-900">{selectedApp.team}</span>
                            </div>
                            <div className="flex justify-between border-b border-surface-200 pb-2">
                                <span className="text-surface-500">Role</span>
                                <span className="font-semibold text-surface-900">{selectedApp.role}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-surface-500">Agreed Fee</span>
                                <span className="font-bold text-accent-600">{selectedApp.bid}</span>
                            </div>
                        </div>
                        
                        <div className="text-sm text-surface-500 space-y-2">
                            <h4 className="font-semibold text-surface-900">Contract Terms</h4>
                            <p>1. The player must be available for all scheduled match dates.</p>
                            <p>2. The team will provide necessary equipment during matches.</p>
                            <p>3. Fee will be released post-tournament completion.</p>
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button onClick={() => setIsContractModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirm Withdraw */}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleWithdraw}
                title="Withdraw Application"
                message="Are you sure you want to withdraw this application? This action cannot be undone."
                type="danger"
            />
        </div>
    )
}
