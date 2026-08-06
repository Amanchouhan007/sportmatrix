import { useEffect } from 'react'
import { HiX } from 'react-icons/hi'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!isOpen) return null

    const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' }

    // 'page' size fills entire content area (right of sidebar w-64 = 256px)
    if (size === 'page') {
        return (
            <div className="fixed inset-0 z-[100]" style={{ left: '256px' }}>
                <div className="fixed inset-0 bg-surface-900/20 backdrop-blur-sm" style={{ left: '256px' }} onClick={onClose} />
                <div className="relative bg-white h-full w-full flex flex-col fade-up overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 shrink-0">
                        <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors cursor-pointer">
                            <HiX className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-surface-900/20 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-white rounded-2xl shadow-soft-xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden fade-up`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
                    <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors cursor-pointer">
                        <HiX className="w-5 h-5" />
                    </button>
                </div>
                <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-80px)]">{children}</div>
            </div>
        </div>
    )
}
