import { useState } from 'react'

export default function Dropdown({ trigger, items = [], className = '' }) {
    const [open, setOpen] = useState(false)

    return (
        <div className={`relative ${className}`}>
            <div onClick={() => setOpen(!open)} className="cursor-pointer">{trigger}</div>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-surface-200 shadow-soft-lg z-50 py-1 fade-up">
                        {items.map((item, i) => item.divider ? (
                            <div key={i} className="border-t border-surface-100 my-1" />
                        ) : (
                            <button key={i} onClick={() => { item.onClick?.(); setOpen(false) }} className="w-full text-left px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 hover:text-primary-600 transition-colors cursor-pointer flex items-center gap-2">
                                {item.icon && <span className="text-surface-400">{item.icon}</span>}
                                {item.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
