import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { HiUser, HiClock, HiCalendar, HiShieldCheck, HiRefresh } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'

export default function AdminMatchControlModal({ isOpen, onClose, matchData, roundName, onSaveMatch }) {
    const [team1Name, setTeam1Name] = useState('')
    const [team1Score, setTeam1Score] = useState(0)
    const [team2Name, setTeam2Name] = useState('')
    const [team2Score, setTeam2Score] = useState(0)
    const [winnerSeed, setWinnerSeed] = useState(null)
    const [status, setStatus] = useState('Scheduled')
    const [matchDate, setMatchDate] = useState('2026-08-25')
    const [slotTime, setSlotTime] = useState('06:00 PM - 08:00 PM')
    const [umpireName, setUmpireName] = useState('Sunil Gavaskar (BCCI Level 2)')

    useEffect(() => {
        if (matchData && matchData.teams) {
            const t1 = matchData.teams[0] || {}
            const t2 = matchData.teams[1] || {}

            setTeam1Name(t1.name || 'TBD')
            setTeam1Score(t1.score && typeof t1.score === 'number' ? t1.score : 0)
            setTeam2Name(t2.name || 'TBD')
            setTeam2Score(t2.score && typeof t2.score === 'number' ? t2.score : 0)

            if (t1.winner) setWinnerSeed(t1.seed)
            else if (t2.winner) setWinnerSeed(t2.seed)
            else setWinnerSeed(null)

            setStatus(matchData.status || (t1.winner || t2.winner ? 'Completed' : 'Scheduled'))
            setMatchDate(matchData.date || '2026-08-25')
            setSlotTime(matchData.time || '06:00 PM - 08:00 PM')
            setUmpireName(matchData.umpire || 'Sunil Gavaskar (BCCI Level 2)')
        }
    }, [matchData])

    if (!matchData) return null

    const handleSave = () => {
        const t1ScoreNum = Number(team1Score) || 0
        const t2ScoreNum = Number(team2Score) || 0

        // Auto-determine winner if scores changed
        let isT1Winner = winnerSeed === matchData.teams[0]?.seed
        let isT2Winner = winnerSeed === matchData.teams[1]?.seed

        if (status === 'Completed' || t1ScoreNum !== t2ScoreNum) {
            if (t1ScoreNum > t2ScoreNum) {
                isT1Winner = true
                isT2Winner = false
            } else if (t2ScoreNum > t1ScoreNum) {
                isT1Winner = false
                isT2Winner = true
            }
        }

        const updatedMatch = {
            ...matchData,
            status: status,
            date: matchDate,
            time: slotTime,
            umpire: umpireName,
            teams: [
                {
                    ...matchData.teams[0],
                    name: team1Name,
                    score: t1ScoreNum,
                    winner: isT1Winner
                },
                {
                    ...matchData.teams[1],
                    name: team2Name,
                    score: t2ScoreNum,
                    winner: isT2Winner
                }
            ]
        }

        onSaveMatch(updatedMatch)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`✏️ Admin Match Control — ${roundName || 'Playoff Match'}`} size="lg">
            <div className="space-y-5 text-slate-800 -mt-2">
                {/* Banner Header */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 rounded-2xl text-white border border-emerald-500/30 flex justify-between items-center shadow-md">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                                {roundName || 'PLAYOFF MATCH'}
                            </span>
                            <span className="text-slate-400 text-xs font-mono">MATCH #{matchData.id}</span>
                        </div>
                        <h3 className="text-base font-black text-white mt-0.5">
                            {team1Name} vs {team2Name}
                        </h3>
                    </div>
                    <Badge variant={status === 'Completed' ? 'success' : status === 'Live' ? 'danger' : 'warning'} dot>
                        {status.toUpperCase()}
                    </Badge>
                </div>

                {/* Score Editing Inputs */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                        <HiTrophy className="text-amber-500 w-4 h-4" /> 
                        <span>Official Match Scorecard & Winner Selection</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        {/* Team 1 Card */}
                        <div className="p-3.5 bg-white rounded-xl border-2 border-slate-200 space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-extrabold text-slate-900 block">Team 1 Name</label>
                                <span className="text-[10px] font-mono font-bold text-slate-400">Seed #{matchData.teams?.[0]?.seed || 1}</span>
                            </div>
                            <Input
                                value={team1Name}
                                onChange={(e) => setTeam1Name(e.target.value)}
                                placeholder="Team 1 Name"
                            />
                            <div>
                                <label className="text-[11px] font-bold text-slate-600 block mb-1">Score / Runs / Goals</label>
                                <Input
                                    type="number"
                                    value={team1Score}
                                    onChange={(e) => setTeam1Score(e.target.value)}
                                    placeholder="e.g. 180"
                                />
                            </div>
                        </div>

                        {/* Team 2 Card */}
                        <div className="p-3.5 bg-white rounded-xl border-2 border-slate-200 space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-extrabold text-slate-900 block">Team 2 Name</label>
                                <span className="text-[10px] font-mono font-bold text-slate-400">Seed #{matchData.teams?.[1]?.seed || 2}</span>
                            </div>
                            <Input
                                value={team2Name}
                                onChange={(e) => setTeam2Name(e.target.value)}
                                placeholder="Team 2 Name"
                            />
                            <div>
                                <label className="text-[11px] font-bold text-slate-600 block mb-1">Score / Runs / Goals</label>
                                <Input
                                    type="number"
                                    value={team2Score}
                                    onChange={(e) => setTeam2Score(e.target.value)}
                                    placeholder="e.g. 142"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Match Scheduling & Umpire Controls */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                        <HiCalendar className="text-emerald-600 w-4 h-4" /> 
                        <span>Match Scheduling & Official Umpire</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">Match Date</label>
                            <Input
                                type="date"
                                value={matchDate}
                                onChange={(e) => setMatchDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">Turf Slot Time</label>
                            <Input
                                value={slotTime}
                                onChange={(e) => setSlotTime(e.target.value)}
                                placeholder="06:00 PM - 08:00 PM"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">Match Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full h-[42px] px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                            >
                                <option value="Scheduled">Scheduled</option>
                                <option value="Live">Live 🔴</option>
                                <option value="Completed">Completed 🟢</option>
                                <option value="Cancelled">Cancelled 🔴</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Official Certified Umpire / Referee</label>
                        <select
                            value={umpireName}
                            onChange={(e) => setUmpireName(e.target.value)}
                            className="w-full h-[42px] px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                        >
                            <option value="Sunil Gavaskar (BCCI Level 2)">Sunil Gavaskar (BCCI Level 2 Umpire)</option>
                            <option value="K. Parthasarathy (MPCA State Panel)">K. Parthasarathy (MPCA State Panel Referee)</option>
                            <option value="Rakesh Varma (Turf Pro Referee)">Rakesh Varma (Turf Pro Senior Umpire)</option>
                            <option value="Unassigned">Unassigned (Assign Later)</option>
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2 transform hover:-translate-y-0.5"
                    >
                        <span>💾 Save & Update Playoff Bracket</span>
                    </button>
                </div>
            </div>
        </Modal>
    )
}
