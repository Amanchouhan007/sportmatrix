import { useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import { useToast } from '../../components/ui/Toast'
import { HiClipboardList, HiDownload, HiChartBar, HiUserGroup, HiCurrencyRupee, HiCheckCircle } from 'react-icons/hi'

export default function TournamentReportsPage() {
    const { addToast } = useToast()

    const handleDownloadReport = (reportName) => {
        addToast({ title: 'Report Exported', message: `${reportName} downloaded as PDF/CSV.`, type: 'success' })
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-surface-200/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                        <HiClipboardList className="text-primary-600" /> Tournament Reports & Analytics
                    </h1>
                    <p className="text-surface-500 text-sm mt-0.5 font-medium">Export tournament summaries, financial reports, team statistics, and platform commission breakdown</p>
                </div>
            </div>

            {/* Stat Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Active Tournaments" value="4" icon={<HiChartBar className="text-primary-600 w-6 h-6" />} />
                <StatCard title="Registered Teams" value="36 Teams" icon={<HiUserGroup className="text-emerald-500 w-6 h-6" />} />
                <StatCard title="Gross Tournament Income" value="₹1,14,500" icon={<HiCurrencyRupee className="text-indigo-500 w-6 h-6" />} />
                <StatCard title="Platform Commission Share" value="₹11,450" icon={<HiCheckCircle className="text-amber-500 w-6 h-6" />} />
            </div>

            {/* Report Download Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-extrabold text-surface-900 text-base">Comprehensive Tournament Report</h3>
                            <p className="text-xs text-surface-500 mt-1">Includes all tournaments, approval statuses, team counts, and playoff winners</p>
                        </div>
                        <Button size="sm" onClick={() => handleDownloadReport('Tournament Summary Report')}>
                            <HiDownload className="w-4 h-4 mr-1" /> Export PDF
                        </Button>
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-extrabold text-surface-900 text-base">Revenue & Commission Report</h3>
                            <p className="text-xs text-surface-500 mt-1">Detailed breakdown of entry fee earnings, sponsor payouts, and 10% platform commission</p>
                        </div>
                        <Button size="sm" onClick={() => handleDownloadReport('Revenue Report')}>
                            <HiDownload className="w-4 h-4 mr-1" /> Export CSV
                        </Button>
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-extrabold text-surface-900 text-base">Team & Player Roster Report</h3>
                            <p className="text-xs text-surface-500 mt-1">Complete player directory with captain contacts, jersey numbers, and team rosters</p>
                        </div>
                        <Button size="sm" onClick={() => handleDownloadReport('Team Roster Report')}>
                            <HiDownload className="w-4 h-4 mr-1" /> Export PDF
                        </Button>
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-extrabold text-surface-900 text-base">Turf Booking Slot Reservation Impact</h3>
                            <p className="text-xs text-surface-500 mt-1">Audit log of all turf slots locked and reserved for tournaments vs regular bookings</p>
                        </div>
                        <Button size="sm" onClick={() => handleDownloadReport('Turf Slot Impact Report')}>
                            <HiDownload className="w-4 h-4 mr-1" /> Export PDF
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
