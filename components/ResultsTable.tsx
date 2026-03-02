import React from 'react';
import { QueryResult } from '../types';
import { IconDatabase } from './Icons';

interface ResultsTableProps {
    result: QueryResult | null;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ result }) => {
    if (!result) {
        return (
            <div className="h-1/2 flex flex-col items-center justify-center text-terminal-text/30 font-mono bg-terminal-bg transition-colors p-8">
                <IconDatabase className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm tracking-widest uppercase">No Data Loaded</p>
                <p className="text-xs mt-2 opacity-50">Execute a query to view results</p>
            </div>
        );
    }

    if (result.error) {
        return (
            <div className="h-1/2 p-6 font-mono bg-terminal-bg transition-colors overflow-auto">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 max-w-2xl">
                    <div className="text-red-500 font-bold mb-2 flex items-center gap-2">
                        <span>⛔</span> SYNTAX ERROR
                    </div>
                    <div className="text-red-400 text-sm whitespace-pre-wrap">{result.error}</div>
                </div>
            </div>
        );
    }

    if (result.data.length === 0 && result.columns.length === 0) {
        return (
             <div className="h-1/2 p-6 font-mono bg-terminal-bg transition-colors flex flex-col items-center justify-center">
                <div className="text-terminal-green font-bold text-lg mb-2">✓ EXECUTION SUCCESSFUL</div>
                <div className="text-terminal-text/60 text-sm">No rows returned by this query.</div>
                <div className="text-xs opacity-30 mt-4 font-mono">Time: {result.executionTime?.toFixed(2)}ms</div>
            </div>
        );
    }

    return (
        <div className="h-1/2 overflow-hidden bg-terminal-bg flex flex-col transition-colors relative">
            {/* Grid Header */}
            <div className="px-4 py-2 bg-terminal-surface border-b border-terminal-border flex justify-between items-center sticky top-0 z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <span className="text-xs uppercase text-terminal-text font-bold tracking-widest flex items-center gap-2">
                        <IconDatabase className="w-3 h-3 text-terminal-blue" />
                        RESULT GRID
                    </span>
                    <span className="px-2 py-0.5 bg-terminal-text/10 rounded text-[10px] font-mono text-terminal-text/60">
                        {result.data.length} ROWS
                    </span>
                </div>
                <span className="text-[10px] font-mono text-terminal-text/40">
                    {result.executionTime?.toFixed(2)}ms
                </span>
            </div>

            {/* Grid Body */}
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-terminal-border/50 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse font-mono text-sm">
                    <thead className="sticky top-0 bg-terminal-bg z-10 shadow-sm">
                        <tr>
                            {result.columns.map((col, idx) => (
                                <th key={idx} className="p-3 border-b border-terminal-border text-terminal-blue font-bold whitespace-nowrap bg-terminal-surface/50 text-xs uppercase tracking-wider">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-terminal-border/30">
                        {result.data.map((row, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-terminal-highlight transition-colors group">
                                {result.columns.map((col, colIdx) => (
                                    <td key={colIdx} className="p-3 text-terminal-text whitespace-nowrap max-w-xs overflow-hidden text-ellipsis text-xs">
                                        {row[col] === null ? (
                                            <span className="text-red-500/50 italic text-[10px]">NULL</span>
                                        ) : (
                                            String(row[col])
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultsTable;