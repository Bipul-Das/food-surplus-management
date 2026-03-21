import { ReactNode } from "react";
import { Loader2, Inbox } from "lucide-react";

interface Column<T> {
    header: string;
    accessor: (row: T) => ReactNode;
    className?: string; // Allows custom alignment (e.g., text-right for actions)
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id?: string | number }>({
    columns,
    data,
    isLoading = false,
    emptyMessage = "No records found.",
    onRowClick,
}: DataTableProps<T>) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className={`px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider ${col.className || ""}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-16 text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-brand-blue mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-500 animate-pulse">Synchronizing data...</p>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-16 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Inbox className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-[15px] font-medium text-gray-500">{emptyMessage}</p>
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={`transition-colors duration-300 ease-out hover:bg-brand-blue/[0.03] ${onRowClick ? "cursor-pointer" : ""
                                    }`}
                            >
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className={`px-6 py-4 text-[15px] text-brand-dark ${col.className || ""}`}>
                                        {col.accessor(row)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}