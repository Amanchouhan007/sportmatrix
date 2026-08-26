export default function DataTable({ columns = [], data = [], onRowClick, emptyMessage = "No records found" }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-soft bg-white pb-2">
            <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200/80">
                        {columns.map((col) => (
                            <th 
                                key={col.key} 
                                className="px-5 py-3 text-[11px] font-black uppercase tracking-wider select-none"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-200/80">
                    {data.map((row, i) => (
                        <tr 
                            key={i} 
                            onClick={() => onRowClick?.(row)} 
                            className={`bg-white odd:bg-slate-50/40 hover:bg-emerald-50/50 hover:border-l-4 hover:border-emerald-500 transition-all duration-150 group ${
                                onRowClick ? 'cursor-pointer' : ''
                            }`}
                        >
                            {columns.map((col) => (
                                <td key={col.key} className="px-5 py-3.5 text-slate-800 font-medium whitespace-nowrap align-middle">
                                    {col.render ? col.render(row[col.key], row) : (
                                        <span className="font-bold text-slate-900">
                                            {row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '—'}
                                        </span>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {data.length === 0 && (
                <div className="py-14 text-center space-y-2 bg-slate-50/50">
                    <div className="text-3xl">🏟️</div>
                    <p className="text-xs font-bold text-slate-700">{emptyMessage}</p>
                    <p className="text-[11px] text-slate-400 font-medium">There are no records matching your current filter.</p>
                </div>
            )}
        </div>
    )
}
