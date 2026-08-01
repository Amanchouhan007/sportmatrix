export default function DataTable({ columns = [], data = [], onRowClick }) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-surface-200">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-surface-50 border-b border-surface-200">
                        {columns.map((col) => (
                            <th key={col.key} className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                    {data.map((row, i) => (
                        <tr key={i} onClick={() => onRowClick?.(row)} className={`bg-white hover:bg-surface-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}>
                            {columns.map((col) => (
                                <td key={col.key} className="px-5 py-4 text-surface-700 whitespace-nowrap">
                                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {data.length === 0 && (
                <div className="py-12 text-center text-surface-400 text-sm">No data available</div>
            )}
        </div>
    )
}
