import { useState, useEffect } from 'react';
import { HiLightningBolt } from 'react-icons/hi';
import { getPublicTournaments, fallbackPublicTournaments } from '../../services/tournamentService';
import TournamentHero from '../../components/tournaments/TournamentHero';
import TournamentSearchBar from '../../components/tournaments/TournamentSearchBar';
import TournamentCardPremium from '../../components/tournaments/TournamentCardPremium';
import TournamentLowerSections from '../../components/tournaments/TournamentLowerSections';
import FloatingActions from '../../components/tournaments/FloatingActions';

export default function TournamentListPage() {
    const [filter, setFilter] = useState('All');
    const [tournaments, setTournaments] = useState(fallbackPublicTournaments);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            const res = await getPublicTournaments({}, { timeout: 800 });
            if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                setTournaments(res.data);
            }
        } catch (err) {
            console.error('Error fetching tournaments in background:', err);
        }
    }

    const filtered = tournaments.filter(t => {
        if (filter === 'All') return true;
        
        const stat = (t.status || '').toLowerCase();
        if (filter === 'Running') return ['open', 'running', 'approved', 'active'].includes(stat);
        if (filter === 'Upcoming') return ['upcoming', 'pending'].includes(stat);
        if (filter === 'Closed') return ['completed', 'cancelled', 'closed'].includes(stat);
        
        return false;
    });

    return (
        <div className="min-h-screen bg-white text-[#111827] pt-4 md:pt-6 pb-20 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#C8FF2E]/10 blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#16A34A]/5 blur-[120px] rounded-full pointer-events-none" />
            </div>

            <div className="max-w-[1400px] mx-auto px-5 md:px-8 relative z-10 pt-4">

                {/* Filter Pills above grid */}
                <div className="flex justify-between items-center mb-6 border-b border-[#E5E7EB] pb-4 mt-6">
                    <h2 className="text-xl font-black text-[#111827] uppercase tracking-tight">
                        Active Tournaments
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-1.5 bg-[#F7F9FC] p-1.5 rounded-full border border-[#E5E7EB] shadow-xs">
                        {['All', 'Running', 'Upcoming', 'Closed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase transition-all duration-300 cursor-pointer ${filter === f
                                    ? 'bg-[#C8FF2E] text-[#111827] border border-[#B5F000] shadow-sm'
                                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-white'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. PREMIUM TOURNAMENT GRID */}
                {loading && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden animate-pulse h-[400px]" />
                        ))}
                    </div>
                )}

                {!loading && !error && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map(t => (
                            <TournamentCardPremium key={t.id} tournament={t} />
                        ))}
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-20 bg-[#F7F9FC] border border-[#E5E7EB] rounded-2xl mt-8">
                        <HiLightningBolt className="w-12 h-12 text-[#16A34A] mx-auto mb-4 opacity-70" />
                        <p className="text-[#6B7280] font-bold uppercase tracking-widest text-sm">No tournaments currently available for this filter.</p>
                    </div>
                )}

                {/* 5. LOWER SECTIONS (AI, Calendar, FAQ, etc) */}
                <TournamentLowerSections />
            </div>

            {/* 6. FLOATING ACTIONS & STICKY BAR */}
            <FloatingActions />
        </div>
    );
}

