import { useState, useEffect, useMemo } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const initialBids = [
    { id: 'BID-001', player: 'Arjun Sharma', team: 'Thunder XI', role: 'Batsman', bid: '₹2,000', escrow: '₹2,000', status: 'Pending' },
    { id: 'BID-002', player: 'Priya Patel', team: 'Smash Masters', role: 'Singles', bid: '₹3,000', escrow: '₹3,000', status: 'Approved' },
    { id: 'BID-003', player: 'Rahul Kumar', team: 'Urban FC', role: 'Striker', bid: '₹1,500', escrow: '₹1,500', status: 'Rejected' },
    { id: 'BID-004', player: 'Vikram Singh', team: 'eSports Pro', role: 'Support', bid: '₹4,000', escrow: '₹4,000', status: 'Pending' },
]

export default function PlayerBids() {
    const [bidList, setBidList] = useState(() => {
        const saved = localStorage.getItem('owner_player_bids')
        return saved ? JSON.parse(saved) : initialBids
    })

    const [releaseConfirm, setReleaseConfirm] = useState({ open: false, id: null, player: '' })

    useEffect(() => {
        localStorage.setItem('owner_player_bids', JSON.stringify(bidList))
    }, [bidList])

    const handleUpdateStatus = (id, newStatus) => {
        setBidList(prev => prev.map(bid => 
            bid.id === id ? { ...bid, status: newStatus } : bid
        ))
    }

    const handleReleaseEscrow = () => {
        handleUpdateStatus(releaseConfirm.id, 'Escrow Released')
        setReleaseConfirm({ open: false, id: null, player: '' })
    }

    const columns = useMemo(() => [
        { key: 'id', label: 'ID' }, 
        { key: 'player', label: 'Player' }, 
        { key: 'team', label: 'Team' },
        { key: 'role', label: 'Role' }, 
        { key: 'bid', label: 'Bid Amount' }, 
        { key: 'escrow', label: 'Escrow' },
        { 
            key: 'status', 
            label: 'Status', 
            render: v => (
                <Badge 
                    variant={
                        v === 'Approved' ? 'success' : 
                        v === 'Pending' ? 'warning' : 
                        v === 'Escrow Released' ? 'primary' : 'danger'
                    } 
                    dot
                >
                    {v}
                </Badge>
            ) 
        },
        {
            key: 'action', 
            label: '', 
            render: (_, r) => {
                if (r.status === 'Pending') {
                    return (
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                variant="primary" 
                                onClick={() => handleUpdateStatus(r.id, 'Approved')}
                            >
                                Approve
                            </Button>
                            <Button 
                                size="sm" 
                                variant="danger" 
                                onClick={() => handleUpdateStatus(r.id, 'Rejected')}
                            >
                                Reject
                            </Button>
                        </div>
                    )
                }
                if (r.status === 'Approved') {
                    return (
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setReleaseConfirm({ open: true, id: r.id, player: r.player })}
                        >
                            Release Escrow
                        </Button>
                    )
                }
                return null
            }
        },
    ], [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Player Hire / Bids</h1>
                <p className="text-surface-500 text-sm mt-1">View applications, approve/reject, manage escrow</p>
            </div>
            
            <DataTable columns={columns} data={bidList} />

            <ConfirmDialog 
                isOpen={releaseConfirm.open}
                onClose={() => setReleaseConfirm({ open: false, id: null, player: '' })}
                onConfirm={handleReleaseEscrow}
                title="Release Escrow"
                message={`Are you sure you want to release the escrow amount for ${releaseConfirm.player}? This will complete the transaction.`}
                confirmText="Release"
                variant="primary"
            />
        </div>
    )
}
