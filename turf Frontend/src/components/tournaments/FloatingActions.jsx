import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineChat, HiOutlineUpload, HiOutlineArrowUp, HiX, HiShare, HiClipboardCheck, HiExternalLink, HiLightningBolt } from 'react-icons/hi';
import { useToast } from '../ui/Toast';

export default function FloatingActions() {
    const [showChatModal, setShowChatModal] = useState(false);
    const [showHostModal, setShowHostModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.scrollTo({ top: 0, behavior: 'smooth' });
        const scrollContainers = document.querySelectorAll('.overflow-y-auto, main');
        scrollContainers.forEach(el => el.scrollTo({ top: 0, behavior: 'smooth' }));
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        addToast('Link copied to clipboard! 📋', 'success');
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <>
            {/* Sticky Bottom Bar (Mobile/Tablet) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-[#E5E7EB] px-4 py-3 flex items-center justify-between shadow-lg">
                <div className="text-[#111827] font-black uppercase text-[10px] tracking-wider">
                    SportaMax <span className="text-[#16A34A]">Live Desk</span>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowChatModal(true)}
                        className="px-3 py-1.5 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl text-[10px] font-black text-[#111827] uppercase tracking-wider flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                        <HiOutlineChat className="w-3.5 h-3.5 text-[#16A34A]" /> Chat
                    </button>
                    <button 
                        onClick={() => setShowHostModal(true)}
                        className="px-3.5 py-1.5 bg-[#C8FF2E] border border-[#B5F000] text-[#111827] rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                        <HiOutlineUpload className="w-3.5 h-3.5" /> Host
                    </button>
                    <button 
                        onClick={scrollToTop}
                        className="px-2.5 py-1.5 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl text-[10px] font-black text-[#111827] cursor-pointer active:scale-95"
                    >
                        <HiOutlineArrowUp className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Floating Quick Actions (Desktop) */}
            <div className="fixed bottom-8 right-8 z-[9999] hidden md:flex flex-col gap-3">
                {/* 1. Support Chat Button */}
                <button 
                    onClick={() => setShowChatModal(true)}
                    className="w-12 h-12 bg-white hover:bg-emerald-50 text-[#111827] rounded-full flex items-center justify-center shadow-[0_6px_25px_rgba(0,0,0,0.12)] border border-slate-200 transition-all group relative cursor-pointer active:scale-95 hover:border-[#16A34A]"
                    title="Live Support Chat"
                >
                    <HiOutlineChat className="w-5 h-5 text-[#16A34A]" />
                    <span className="absolute right-14 bg-[#111827] text-white text-[10px] font-black px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-wider whitespace-nowrap shadow-md">
                        Support Chat
                    </span>
                </button>
                
                {/* 2. Host Tournament / Share Button */}
                <button 
                    onClick={() => setShowHostModal(true)}
                    className="w-12 h-12 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] rounded-full flex items-center justify-center shadow-[0_6px_25px_rgba(200,255,46,0.45)] border border-[#B5F000] transition-all group relative cursor-pointer active:scale-95"
                    title="Host Tournament / Share"
                >
                    <HiOutlineUpload className="w-5 h-5 text-[#111827]" />
                    <span className="absolute right-14 bg-[#111827] text-white text-[10px] font-black px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-wider whitespace-nowrap shadow-md">
                        Host / Share
                    </span>
                </button>

                {/* 3. Back to Top Button */}
                <button 
                    onClick={scrollToTop}
                    className="w-12 h-12 bg-white hover:bg-slate-100 text-[#111827] rounded-full flex items-center justify-center shadow-[0_6px_25px_rgba(0,0,0,0.12)] border border-slate-200 transition-all group relative cursor-pointer active:scale-95"
                    title="Scroll to Top"
                >
                    <HiOutlineArrowUp className="w-5 h-5 text-[#111827]" />
                    <span className="absolute right-14 bg-[#111827] text-white text-[10px] font-black px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-wider whitespace-nowrap shadow-md">
                        Back to Top
                    </span>
                </button>
            </div>

            {/* 💬 SUPPORT CHAT MODAL */}
            {showChatModal && (
                <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 relative">
                        <button 
                            onClick={() => setShowChatModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
                        >
                            <HiX className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#16A34A] flex items-center justify-center shrink-0">
                                <HiOutlineChat className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">SportaMax Live Support</h3>
                                <p className="text-xs text-slate-500 font-bold">24/7 Concierge & Turf Assistance</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                            <p className="text-xs text-slate-700 font-bold leading-relaxed">
                                👋 Need instant assistance with booking a slot, tournament registration, or turf amenities?
                            </p>
                            
                            <div className="space-y-2 pt-1">
                                <button 
                                    onClick={() => {
                                        addToast('Connecting to Turf Desk...', 'info');
                                        window.open('https://wa.me/919876543210?text=Hi%20SportaMax%20Support,%20I%20need%20assistance%20with%20a%20booking.', '_blank');
                                    }}
                                    className="w-full py-2.5 px-4 bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-between transition-all cursor-pointer shadow-xs"
                                >
                                    <span className="flex items-center gap-2">💬 WhatsApp Live Support</span>
                                    <HiExternalLink className="w-4 h-4" />
                                </button>

                                <button 
                                    onClick={() => {
                                        setShowChatModal(false);
                                        navigate('/contact');
                                    }}
                                    className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:border-[#16A34A] text-slate-800 font-black text-xs rounded-xl flex items-center justify-between transition-all cursor-pointer"
                                >
                                    <span>📧 Submit Support Ticket</span>
                                    <HiLightningBolt className="w-4 h-4 text-emerald-600" />
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button 
                                onClick={() => setShowChatModal(false)}
                                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🏆 HOST TOURNAMENT / SHARE MODAL */}
            {showHostModal && (
                <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 relative">
                        <button 
                            onClick={() => setShowHostModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
                        >
                            <HiX className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                <HiShare className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">Host Tournament & Share</h3>
                                <p className="text-xs text-slate-500 font-bold">Organize events or share this page</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={() => {
                                    setShowHostModal(false);
                                    navigate('/tournaments/create');
                                }}
                                className="w-full py-3 px-4 bg-[#C8FF2E] hover:bg-[#B5F000] text-slate-950 font-black text-xs rounded-xl flex items-center justify-between transition-all cursor-pointer shadow-xs border border-[#B5F000]"
                            >
                                <span className="flex items-center gap-2">🏆 Host a New Tournament</span>
                                <HiLightningBolt className="w-4 h-4" />
                            </button>

                            <button 
                                onClick={handleCopyLink}
                                className="w-full py-3 px-4 bg-white border border-slate-200 hover:border-[#16A34A] text-slate-800 font-black text-xs rounded-xl flex items-center justify-between transition-all cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    {copied ? <HiClipboardCheck className="w-4 h-4 text-emerald-600" /> : <HiShare className="w-4 h-4 text-slate-500" />}
                                    {copied ? 'Link Copied to Clipboard!' : 'Share Page URL'}
                                </span>
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase">{copied ? 'COPIED' : 'COPY'}</span>
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <button 
                                onClick={() => setShowHostModal(false)}
                                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
