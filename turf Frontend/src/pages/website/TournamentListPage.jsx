import { useState, useEffect } from 'react';
import { HiLightningBolt } from 'react-icons/hi';
import { getPublicTournaments } from '../../services/tournamentService';
import TournamentHero from '../../components/tournaments/TournamentHero';
import TournamentSearchBar from '../../components/tournaments/TournamentSearchBar';
import TournamentCardPremium from '../../components/tournaments/TournamentCardPremium';
import TournamentLowerSections from '../../components/tournaments/TournamentLowerSections';
import FloatingActions from '../../components/tournaments/FloatingActions';

export default function TournamentListPage() {
    const [filter, setFilter] = useState('All');
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPublicTournaments();
            if (res.success && Array.isArray(res.data)) {
                setTournaments(res.data);
            } else {
                setTournaments([]);
            }
        } catch (err) {
            console.error('Error fetching tournaments:', err);
            setTournaments([]);
            setError('Failed to fetch tournaments');
        } finally {
            setLoading(false);
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
        <div className="min-h-screen bg-slate-950 pt-[88px] pb-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-x-0 top-0 h-[60vh] z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-950/90 to-slate-950" />
            </div>



            <div className="max-w-[1400px] mx-auto px-5 md:px-8 relative z-10">
                {/* Filter Pills above grid */}
                <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-4 mt-8">
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                        Active Tournaments <span className="text-slate-500 font-medium text-sm not-italic tracking-normal">({filtered.length})</span>
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-1.5 rounded-full border border-white/10 backdrop-blur-xl">
                        {['All', 'Running', 'Upcoming', 'Closed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${filter === f
                                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
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
                            <div key={i} className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden animate-pulse h-[400px]" />
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
                    <div className="text-center py-20 bg-slate-900/30 border border-white/5 rounded-2xl mt-8">
                        <HiLightningBolt className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No tournaments currently available for this filter.</p>
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

