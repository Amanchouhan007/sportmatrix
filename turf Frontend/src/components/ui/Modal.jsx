import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HiX } from 'react-icons/hi'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!isOpen) return null

    const sizes = { 
        sm: 'max-w-md', 
        md: 'max-w-lg', 
        lg: 'max-w-2xl', 
        xl: 'max-w-4xl', 
        full: 'max-w-6xl',
        enterprise: 'max-w-[900px]'
    }

    const isEnterprise = size === 'enterprise' || size === 'lg' || size === 'xl'

    const modalContent = (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 md:p-8">
            {/* Full-screen Backdrop: Blurs Top Nav Bar, Left Sidebar & All Page Content */}
            <div 
                className="fixed inset-0 bg-slate-950/65 transition-all duration-300 animate-in fade-in" 
                style={{ 
                    backdropFilter: 'blur(16px)', 
                    WebkitBackdropFilter: 'blur(16px)' 
                }}
                onClick={onClose} 
            />

            {/* Modal Dialog Box */}
            <div 
                style={{
                    background: 'rgba(255, 255, 255, 0.96)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 30px 90px rgba(15, 23, 42, 0.35)'
                }}
                className={`relative bg-white/95 rounded-[24px] w-full ${sizes[size] || 'max-w-[900px]'} max-h-[86vh] overflow-hidden flex flex-col z-10 my-auto shadow-2xl animate-in zoom-in-95 duration-200`}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-200/80 shrink-0 bg-slate-50/50">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug pr-4">
                        {title}
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 border border-slate-200/60"
                        aria-label="Close modal"
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="px-6 sm:px-8 py-6 overflow-y-auto max-h-[calc(86vh-85px)] custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    )

    return createPortal(modalContent, document.body)
}
