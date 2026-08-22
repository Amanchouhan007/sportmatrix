import React, { useState, useEffect } from 'react';
import { HiOutlineLightningBolt, HiOutlineCalendar, HiOutlineStar, HiOutlineMail } from 'react-icons/hi';
import { getPublicTournaments } from '../../services/tournamentService';
import { getBranches } from '../../services/branchService';

export default function TournamentLowerSections() {
    const [liveTournaments, setLiveTournaments] = useState([]);
    const [branchCount, setBranchCount] = useState(0);

    useEffect(() => {
        getPublicTournaments().then(res => {
            if (res && res.success && Array.isArray(res.data)) {
                setLiveTournaments(res.data);
            }
        }).catch(() => {});

        getBranches().then(res => {
            const raw = res?.data?.branches || res?.branches || [];
            if (Array.isArray(raw)) {
                setBranchCount(raw.length);
            }
        }).catch(() => {});
    }, []);

    const upcomingList = liveTournaments.filter(t => (t.status || '').toLowerCase() === 'approved' || (t.status || '').toLowerCase() === 'active');
    const completedList = liveTournaments.filter(t => (t.status || '').toLowerCase() === 'completed');

    return (
        <div className="mt-16 space-y-12">
            {/* 3. CALENDAR & NEARBY */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <div className="lg:col-span-2 relative overflow-hidden bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#E5E7EB]">
                        <HiOutlineCalendar className="w-5 h-5 text-[#16A34A]" />
                        <h3 className="text-sm font-black uppercase text-[#111827] tracking-wider">Tournament Schedule</h3>
                    </div>
                    {upcomingList.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                            {upcomingList.slice(0, 6).map((t, idx) => (
                                <div 
                                    key={t.id || idx} 
                                    className="shrink-0 w-52 rounded-2xl p-4 sm:p-5 border bg-[#F7F9FC] border-[#E5E7EB] shadow-xs"
                                >
                                    <h4 className="text-xs font-black uppercase tracking-wider mb-2 text-[#16A34A] truncate">{t.title}</h4>
                                    <div className="space-y-1 text-[11px] font-bold text-[#111827]">
                                        <div className="flex justify-between">
                                            <span>Sport:</span>
                                            <span className="text-[#16A34A]">{t.sport || 'Cricket'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Prize:</span>
                                            <span className="text-[#16A34A]">₹{t.prizePool || t.cash_prize || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-6 text-center text-xs font-bold text-[#6B7280]">
                            No upcoming tournaments scheduled in the database.
                        </div>
                    )}
                </div>

                {/* Nearby */}
                <div className="relative overflow-hidden bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                    <div className="pb-4 mb-6 border-b border-[#E5E7EB]">
                        <h3 className="text-sm font-black uppercase text-[#111827] tracking-wider">Verified Turf Arenas</h3>
                    </div>
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-center px-4 py-3.5 bg-[#F7F9FC] rounded-xl border border-[#E5E7EB]">
                            <span className="text-xs font-black text-[#111827] uppercase tracking-wider">Active Locations</span>
                            <span className="px-2.5 py-1 rounded-full bg-[#C8FF2E] border border-[#B5F000] text-[10px] font-black text-[#111827]">{branchCount} Arenas Found</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. RECENT WINNERS */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <HiOutlineStar className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-black uppercase text-[#111827] tracking-tight">Recent Champions</h3>
                </div>
                {completedList.length > 0 ? (
                    <div className="grid sm:grid-cols-3 gap-6">
                        {completedList.slice(0, 3).map((w, idx) => (
                            <div key={w.id || idx} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] text-center relative overflow-hidden shadow-xs">
                                <div className="text-3xl mb-2">🥇</div>
                                <h4 className="text-base font-black text-[#111827] uppercase tracking-tight">{w.title}</h4>
                                <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-2">{w.sport || 'Cricket'} Champion</p>
                                <div className="text-sm font-black text-[#16A34A]">Prize: ₹{w.prizePool || 0}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#F7F9FC] p-6 rounded-2xl border border-[#E5E7EB] text-center text-xs font-bold text-[#6B7280]">
                        No completed tournament champions recorded yet in the database.
                    </div>
                )}
            </div>

            {/* 5. FAQ & NEWSLETTER */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* FAQ Quick Links */}
                <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex-1">
                    <h3 className="text-sm font-black uppercase text-[#111827] tracking-wider mb-4">Quick FAQ</h3>
                    <div className="flex flex-wrap gap-2">
                        {['How to Join', 'Refund Policy', 'Rules & Regulations', 'Documents Required', 'Age Limit'].map((q, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-[#F7F9FC] border border-[#E5E7EB] rounded-full text-[10px] font-bold text-[#111827] uppercase tracking-wider cursor-pointer hover:bg-[#C8FF2E] hover:border-[#B5F000] transition-colors">
                                {q}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Newsletter */}
                <div className="bg-[#F7F9FC] p-6 rounded-3xl border border-[#E5E7EB]">
                    <div className="flex items-center gap-2 mb-2">
                        <HiOutlineMail className="w-4 h-4 text-[#16A34A]" />
                        <h3 className="text-xs font-black uppercase text-[#111827] tracking-wider">Never Miss a Tourney</h3>
                    </div>
                    <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-4">Get alerted for high-prize tournaments.</p>
                    <div className="flex gap-2">
                        <input 
                            type="email" 
                            placeholder="Enter Email" 
                            className="bg-white border border-[#E5E7EB] px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-[#16A34A] flex-1"
                        />
                        <button className="px-4 py-2 bg-[#16A34A] text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer hover:bg-[#15803D] transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
