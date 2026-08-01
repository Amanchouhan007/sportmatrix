import { useEffect } from 'react'
import { HiX } from 'react-icons/hi'

export default function Drawer({ isOpen, onClose, title, children, position = 'right' }) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!isOpen) return null

    const posClass = position === 'right' ? 'right-0' : 'left-0'
    const animClass = position === 'right' ? 'animate-slide-left' : 'animate-slide-right'

    return (
        <div className="fixed inset-0 z-[100]">
            <div className="fixed inset-0 bg-surface-900/20 backdrop-blur-sm" onClick={onClose} />
            <div className={`fixed top-0 ${posClass} h-full w-full max-w-sm bg-white shadow-soft-xl ${animClass} overflow-y-auto`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
                    <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors cursor-pointer">
                        <HiX className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    )
}
