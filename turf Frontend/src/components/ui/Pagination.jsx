import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1)

    return (
        <div className="flex items-center justify-between px-1 py-3">
            <p className="text-sm text-surface-500">Page {currentPage} of {totalPages}</p>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors">
                    <HiChevronLeft className="w-4 h-4" />
                </button>
                {pages.map((p) => (
                    <button key={p} onClick={() => onPageChange(p)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${currentPage === p ? 'bg-primary-600 text-white shadow-soft-md' : 'text-surface-600 hover:bg-surface-100'}`}>
                        {p}
                    </button>
                ))}
                <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors">
                    <HiChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
