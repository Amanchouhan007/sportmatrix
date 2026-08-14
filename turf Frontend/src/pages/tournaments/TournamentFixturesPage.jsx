import { useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import BracketComponent from '../../components/ui/BracketComponent'
import { useToast } from '../../components/ui/Toast'
import { HiRefresh, HiCalendar, HiPlay } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'

const mockBracketRounds = [
    {
        name: 'Quarter-Finals',
        matches: [
            { id: 1, teams: [{ seed: 1, name: 'Indore Thunders', score: 180, winner: true }, { seed: 8, name: 'Warriors XI', score: 142 }] },
            { id: 2, teams: [{ seed: 4, name: 'Red Devils Futsal', score: 165, winner: true }, { seed: 5, name: 'Blue Eagles', score: 160 }] },
            { id: 3, teams: [{ seed: 2, name: 'Royal Challengers', score: 195, winner: true }, { seed: 7, name: 'Super Kings', score: 178 }] },
            { id: 4, teams: [{ seed: 3, name: 'Strikers XI', score: 150 }, { seed: 6, name: 'Mumbai Express', score: 154, winner: true }] },
        ]
    },
    {
        name: 'Semi-Finals',
        matches: [
            { id: 5, teams: [{ seed: 1, name: 'Indore Thunders', score: 145, winner: true }, { seed: 4, name: 'Red Devils Futsal', score: 122 }] },
            { id: 6, teams: [{ seed: 2, name: 'Royal Challengers', score: 156, winner: true }, { seed: 6, name: 'Mumbai Express', score: 148 }] },
        ]
    },
    {
        name: 'Grand Finale',
        matches: [
            { id: 7, teams: [{ seed: 1, name: 'Indore Thunders', score: '—' }, { seed: 2, name: 'Royal Challengers', score: '—' }] }
        ]
    },
]

export default function TournamentFixturesPage() {
    const { addToast } = useToast()
    const [selectedTournament, setSelectedTournament] = useState('t_001')
    const [rounds, setRounds] = useState(mockBracketRounds)

    const handleGenerateFixtures = () => {
        addToast({ title: 'Fixtures Generated!', message: 'Automated match bracket schedule generated for tournament.', type: 'success' })
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        <HiTrophy className="text-amber-500" /> Fixture Generator & Bracket View
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Automatic playoff bracket generation for Knockout, League & Hybrid formats</p>
                </div>

                <div className="flex gap-3 items-center">
                    <Select
                        value={selectedTournament}
                        onChange={(e) => setSelectedTournament(e.target.value)}
                        options={[
                            { value: 't_001', label: 'Premier Cricket Cup (Knockout)' },
                            { value: 't_002', label: 'Indore Football Cup (League)' },
                            { value: 't_003', label: 'Football Open (Hybrid)' },
                        ]}
                    />
                    <Button onClick={handleGenerateFixtures} className="whitespace-nowrap">
                        <HiRefresh className="w-5 h-5 mr-1" /> Auto-Generate Fixtures
                    </Button>
                </div>
            </div>

            {/* Interactive Visual Playoff Bracket */}
            <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-surface-100 pb-4">
                    <div>
                        <h2 className="text-base font-black text-surface-900 tracking-tight flex items-center gap-1.5">
                            <HiPlay className="text-emerald-500" /> Interactive Playoff Bracket Tree
                        </h2>
                        <p className="text-surface-500 text-xs mt-0.5">Premier Cricket Cup Playoffs</p>
                    </div>
                    <Badge variant="success">LIVE BRACKET</Badge>
                </div>

                <BracketComponent rounds={rounds} />
            </Card>
        </div>
    )
}
