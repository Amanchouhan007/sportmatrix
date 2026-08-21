import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import { useToast } from '../../components/ui/Toast'
import { HiClipboardList, HiDownload, HiChartBar, HiUserGroup, HiCurrencyRupee, HiCheckCircle, HiExternalLink, HiEye, HiPlay } from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'

export default function TournamentReportsPage() {
    const { addToast } = useToast()
    const navigate = useNavigate()

    const handleDownloadReport = (reportName, format = 'pdf') => {
        const cleanName = reportName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
        const filename = `${cleanName}_${new Date().toISOString().slice(0, 10)}.${format}`

        let fileContent = ''
        if (format === 'csv') {
            fileContent = `Report Name,${reportName}\nGenerated On,${new Date().toLocaleString()}\nPlatform,SportMatrix OS\n\nMetric,Value\nActive Tournaments,4\nRegistered Teams,36 Teams\nGross Income,114500 INR\nPlatform Commission (10%),11450 INR\n\nMatch ID,Round,Team 1,Score 1,Team 2,Score 2,Winner,Venue\nMTC-984,Quarter-Final,Indore Thunders,180,Warriors XI,142,Indore Thunders,Champions Turf Arena\nMTC-985,Quarter-Final,Red Devils Futsal,165,Blue Eagles,160,Red Devils Futsal,Main Court\nMTC-986,Semi-Final,Indore Thunders,145,Red Devils Futsal,122,Indore Thunders,Champions Turf Arena\n`
        } else {
            fileContent = `=======================================================\nSPORTMATRIX OFFICIAL TOURNAMENT REPORT: ${reportName.toUpperCase()}\n=======================================================\nGenerated Date: ${new Date().toLocaleString()}\nTarget: Tournament Operations & Match Audit Summary\n\n1. OVERVIEW METRICS\n-------------------------------------------------------\n- Active Tournaments: 4\n- Total Participating Teams: 36 Teams\n- Gross Earnings: INR 1,14,500.00\n- Platform Commission Share (10%): INR 11,450.00\n\n2. PLAYOFF MATCH DETAILS SUMMARY\n-------------------------------------------------------\n* Quarter-Final #1: Indore Thunders (180) def. Warriors XI (142)\n* Quarter-Final #2: Red Devils Futsal (165) def. Blue Eagles (160)\n* Quarter-Final #3: Royal Challengers (195) def. Super Kings (178)\n* Quarter-Final #4: Mumbai Express (154) def. Strikers XI (150)\n* Semi-Final #1   : Indore Thunders (145) def. Red Devils Futsal (122)\n* Semi-Final #2   : Royal Challengers (156) def. Mumbai Express (148)\n* Grand Finale    : Indore Thunders vs Royal Challengers (SCHEDULED)\n\n=======================================================\nVerified by SportMatrix Tournament Management OS\n`
        }

        const blob = new Blob([fileContent], { type: format === 'csv' ? 'text/csv' : 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        if (addToast) {
            addToast({ 
                title: '📁 File Downloaded to Computer', 
                message: `Report "${filename}" saved to your Downloads folder!`, 
                type: 'success' 
            })
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <HiClipboardList className="text-emerald-600" /> Tournament Reports & Analytics
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5 font-medium">Export tournament summaries, financial reports, team statistics, and platform commission breakdown</p>
                </div>
            </div>

            {/* Stat Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Active Tournaments" value="4" icon={<HiChartBar className="text-emerald-600 w-6 h-6" />} />
                <StatCard title="Registered Teams" value="36 Teams" icon={<HiUserGroup className="text-emerald-500 w-6 h-6" />} />
                <StatCard title="Gross Tournament Income" value="₹1,14,500" icon={<HiCurrencyRupee className="text-indigo-500 w-6 h-6" />} />
                <StatCard title="Platform Commission Share" value="₹11,450" icon={<HiCheckCircle className="text-amber-500 w-6 h-6" />} />
            </div>

            {/* Report Download Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-base">Comprehensive Tournament Report</h3>
                            <p className="text-xs text-slate-500 mt-1">Includes all tournaments, approval statuses, team counts, and playoff winners</p>
                        </div>
                        <Button size="sm" onClick={() => handleDownloadReport('Comprehensive_Tournament_Report', 'pdf')}>
                            <HiDownload className="w-4 h-4 mr-1" /> Export PDF
                        </Button>
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-base">Revenue & Commission Report</h3>
                            <p className="text-xs text-slate-500 mt-1">Detailed breakdown of entry fee earnings, sponsor payouts, and 10% platform commission</p>
                        </div>
                        <Button size="sm" onClick={() => handleDownloadReport('Revenue_Commission_Report', 'csv')}>
                            <HiDownload className="w-4 h-4 mr-1" /> Export CSV
                        </Button>
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-base">Team & Player Roster Report</h3>
                            <p className="text-xs text-slate-500 mt-1">Complete player directory with captain contacts, jersey numbers, and team rosters</p>
                        </div>
                        <Button size="sm" onClick={() => handleDownloadReport('Team_Player_Roster_Report', 'pdf')}>
                            <HiDownload className="w-4 h-4 mr-1" /> Export PDF
                        </Button>
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-base">Turf Booking Slot Reservation Impact</h3>
                            <p className="text-xs text-slate-500 mt-1">Audit log of all turf slots locked and reserved for tournaments vs regular bookings</p>
                        </div>
                        <Button size="sm" onClick={() => handleDownloadReport('Turf_Slot_Impact_Report', 'pdf')}>
                            <HiDownload className="w-4 h-4 mr-1" /> Export PDF
                        </Button>
                    </div>
                </Card>
            </div>

            {/* How to Check Match Details Section */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 p-6 rounded-3xl text-white border border-emerald-500/30 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <span>🏟️</span> How to Check & Manage Tournament Match Details
                        </h3>
                        <p className="text-xs text-slate-300 mt-0.5 font-medium">Access live scorecards, match fixtures, umpire logs, and bracket trees across the system</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div 
                        onClick={() => navigate('/admin/tournaments/fixtures')}
                        className="p-4 bg-slate-900/80 hover:bg-emerald-950/60 border border-slate-700/80 hover:border-emerald-400 rounded-2xl transition-all cursor-pointer space-y-1.5 group"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-black text-emerald-400 text-sm flex items-center gap-1.5">
                                <HiPlay className="w-4 h-4" /> 1. Playoff Bracket Tree
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono group-hover:translate-x-1 transition-transform">View Tree ➔</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                            Navigate to <strong className="text-white font-mono">/admin/tournaments/fixtures</strong>. Click any match box in Quarter-Finals, Semi-Finals, or Finale to view & edit live scores, slot times, and umpires.
                        </p>
                    </div>

                    <div 
                        onClick={() => navigate('/admin/tournaments/matches')}
                        className="p-4 bg-slate-900/80 hover:bg-emerald-950/60 border border-slate-700/80 hover:border-emerald-400 rounded-2xl transition-all cursor-pointer space-y-1.5 group"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-black text-emerald-400 text-sm flex items-center gap-1.5">
                                <HiTrophy className="w-4 h-4 text-amber-400" /> 2. All Matches Master Directory
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono group-hover:translate-x-1 transition-transform">View Matches ➔</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                            Navigate to <strong className="text-white font-mono">/admin/tournaments/matches</strong>. View the complete table of all scheduled, live, and completed matches with venue & status badges.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
