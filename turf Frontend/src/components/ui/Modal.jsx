import { useEffect } from 'react'
import { HiX } from 'react-icons/hi'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
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

    if (size === 'page') {
        return (
            <div className="fixed inset-0 z-[100]" style={{ left: '256px' }}>
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[10px]" style={{ left: '256px' }} onClick={onClose} />
                <div className="relative bg-white h-full w-full flex flex-col fade-up overflow-hidden">
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
                        <h3 className="text-[32px] font-black text-slate-900 tracking-tight leading-none">{title}</h3>
                        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 hover:rotate-90 transition-all duration-300 flex items-center justify-center cursor-pointer">
                            <HiX className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-8 py-6">{children}</div>
                </div>
            </div>
        )
    }

    const isEnterprise = size === 'enterprise' || size === 'lg'

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
            {/* Overlay: rgba(15,23,42,0.40) + backdrop-blur 10px */}
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-[10px] transition-opacity duration-300" 
                onClick={onClose} 
            />

            {/* Modal Dialog Box */}
            <div 
                style={isEnterprise ? {
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    boxShadow: '0 30px 80px rgba(15, 23, 42, 0.15)'
                } : {}}
                className={`relative bg-white ${isEnterprise ? 'rounded-[28px]' : 'rounded-2xl shadow-2xl'} w-full ${sizes[size] || 'max-w-[900px]'} max-h-[90vh] overflow-hidden fade-up flex flex-col z-10`}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100/80 shrink-0">
                    <h3 className="text-[28px] sm:text-[32px] font-black text-slate-900 tracking-tight leading-none">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 rounded-full hover:bg-slate-100/80 text-slate-400 hover:text-slate-800 hover:rotate-90 transition-all duration-300 flex items-center justify-center cursor-pointer shrink-0"
                        aria-label="Close modal"
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-90px)]" style={{ scrollbarWidth: 'thin' }}>
                    {children}
                </div>
            </div>
        </div>
    )
}
