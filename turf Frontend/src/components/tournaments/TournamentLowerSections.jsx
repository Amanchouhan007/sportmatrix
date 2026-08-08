import React from 'react';
import { HiOutlineLightningBolt, HiOutlineCalendar, HiOutlineStar, HiOutlineMail } from 'react-icons/hi';

export default function TournamentLowerSections() {
    return (
        <div className="mt-16 space-y-12">
            {/* 3. CALENDAR & NEARBY */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <div className="lg:col-span-2 relative overflow-hidden bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#E5E7EB]">
                        <HiOutlineCalendar className="w-5 h-5 text-[#16A34A]" />
                        <h3 className="text-sm font-black uppercase text-[#111827] tracking-wider">Tournament Calendar</h3>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                        {['August', 'September', 'October'].map((month, idx) => (
                            <div 
                                key={idx} 
                                className={`shrink-0 w-48 rounded-2xl p-4 sm:p-5 border transition-all duration-200 ease-out hover:-translate-y-0.5 ${
                                    idx === 0 
                                        ? 'bg-[#F7F9FC] border-[#C8FF2E] shadow-sm ring-1 ring-[#C8FF2E]' 
                                        : 'bg-white border-[#E5E7EB] hover:bg-[#F7F9FC]'
                                }`}
                            >
                                <h4 className={`text-xs font-black uppercase tracking-wider mb-3 ${idx === 0 ? 'text-[#16A34A]' : 'text-[#6B7280]'}`}>{month}</h4>
                                <div className="divide-y divide-[#E5E7EB] space-y-2">
                                    <div className="flex justify-between items-center text-[11px] pt-1 font-bold text-[#111827]">
                                        <span>15th - Football</span>
                                        <span className="text-[#16A34A] font-black">₹50K</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] pt-2 font-bold text-[#111827]">
                                        <span>20th - Football</span>
                                        <span className="text-[#16A34A] font-black">₹20K</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Nearby */}
                <div className="relative overflow-hidden bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                    <div className="pb-4 mb-6 border-b border-[#E5E7EB]">
                        <h3 className="text-sm font-black uppercase text-[#111827] tracking-wider">Nearby You</h3>
                    </div>
                    <div className="space-y-2.5">
                        {['Within 5 KM', 'Within 10 KM', 'Within 25 KM'].map((range, idx) => (
                            <div 
                                key={idx} 
                                className="flex justify-between items-center px-4 py-3.5 bg-[#F7F9FC] rounded-xl border border-[#E5E7EB] cursor-pointer transition-all duration-200 hover:border-[#C8FF2E] hover:bg-white"
                            >
                                <span className="text-xs font-black text-[#111827] uppercase tracking-wider">{range}</span>
                                <span className="px-2.5 py-1 rounded-full bg-[#C8FF2E] border border-[#B5F000] text-[10px] font-black text-[#111827]">{3 * (idx + 1)} Found</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. RECENT WINNERS */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <HiOutlineStar className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-black uppercase text-[#111827] tracking-tight">Recent Champions</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-6">
                    {[
                        { team: 'Team Titans', prize: '₹50,000', sport: 'Football' },
                        { team: 'Smash Masters', prize: '₹20,000', sport: 'Football' },
                        { team: 'Cricket Kings', prize: '₹80,000', sport: 'Cricket' }
                    ].map((w, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] text-center relative overflow-hidden group cursor-pointer hover:border-[#C8FF2E] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all">
                            <div className="text-3xl mb-2">🥇</div>
                            <h4 className="text-base font-black text-[#111827] uppercase tracking-tight">{w.team}</h4>
                            <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-2">{w.sport} Champions</p>
                            <div className="text-sm font-black text-[#16A34A]">{w.prize}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. REVIEWS & SPONSORS */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Reviews */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                    <h3 className="text-sm font-black uppercase text-[#111827] tracking-wider mb-6">What Players Say</h3>
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-[#F7F9FC] p-4 rounded-2xl border border-[#E5E7EB]">
                                <div className="flex gap-1 mb-2">
                                    {[...Array(5)].map((_, j) => <HiOutlineStar key={j} className="w-3.5 h-3.5 text-amber-500" fill="currentColor" />)}
                                </div>
                                <h4 className="text-xs font-black text-[#111827] uppercase mb-1">Great Tournament</h4>
                                <p className="text-xs text-[#6B7280] font-medium">"Very organized, awesome venue, and fair refereeing. Will definitely join the next season."</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ & Newsletter */}
                <div className="flex flex-col gap-8">
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
                            <input type="email" placeholder="Enter Email" className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827] outline-none font-bold" />
                            <button className="px-4 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] border border-[#B5F000] text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors shadow-sm active:scale-95">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sponsors */}
            <div className="pt-8 pb-4 border-t border-[#E5E7EB] text-center">
                <p className="text-[10px] text-[#6B7280] font-black uppercase tracking-[0.2em] mb-6">Trusted By Elite Brands</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
                    <span className="text-xl font-black italic tracking-tighter text-[#111827]">ADIDAS</span>
                    <span className="text-xl font-black italic tracking-tighter text-[#111827]">NIKE</span>
                    <span className="text-xl font-black italic tracking-tighter text-[#111827]">PUMA</span>
                    <span className="text-xl font-black italic tracking-tighter text-[#111827]">DECATHLON</span>
                    <span className="text-xl font-black italic tracking-tighter text-[#111827]">RED BULL</span>
                </div>
            </div>

        </div>
    );
}
