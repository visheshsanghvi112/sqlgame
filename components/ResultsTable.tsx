import React, { useState } from 'react';
import { QueryResult } from '../types';
import { IconDatabase, IconTable, IconChartBar } from './Icons';
import DataVisualizer from './DataVisualizer';

interface ResultsTableProps {
    result: QueryResult | null;
    theme: 'light' | 'dark';
}

const ResultsTable: React.FC<ResultsTableProps> = ({ result, theme }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid');

    if (!result) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-terminal-text/30 font-mono bg-terminal-bg transition-colors p-8 border-t border-terminal-border/50 min-h-[200px]">
                <div className="p-6 rounded-full bg-terminal-surface/50 mb-4 animate-pulse">
                    <IconDatabase className="w-8 h-8 opacity-40" />
                </div>
                <p className="text-sm tracking-[0.2em] uppercase font-bold opacity-60">Ready for Query</p>
                <p className="text-xs mt-2 opacity-40">Results will appear here...</p>
            </div>
        );
    }

    if (result.error) {
        return (
            <div className="flex-1 p-6 font-mono bg-terminal-bg transition-colors overflow-auto border-t border-terminal-border/50 min-h-[200px]">
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6 max-w-3xl mx-auto shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                    <div className="text-red-500 font-bold mb-3 flex items-center gap-3 text-lg">
                        <span className="text-2xl">⛔</span> 
                        <span>SYNTAX ERROR</span>
                    </div>
                    <div className="text-red-400/90 text-sm whitespace-pre-wrap font-mono bg-terminal-surface dark:bg-black/30 p-4 rounded border border-red-500/10">
                        {result.error}
                    </div>
                </div>
            </div>
        );
    }

    if (result.data.length === 0 && result.columns.length === 0) {
        return (
             <div className="flex-1 p-6 font-mono bg-terminal-bg transition-colors flex flex-col items-center justify-center border-t border-terminal-border/50 min-h-[200px]">
                <div className="text-terminal-green font-bold text-xl mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse"></span>
                    EXECUTION SUCCESSFUL
                </div>
                <div className="text-terminal-text/60 text-sm">No rows returned by this query.</div>
                <div className="text-xs opacity-30 mt-4 font-mono">Time: {result.executionTime?.toFixed(2)}ms</div>
            </div>
        );
    }

    return (
        <div className="flex-[0.9] overflow-hidden bg-terminal-bg flex flex-col transition-colors relative border-t border-terminal-border/50 min-h-[200px]">
            {/* Grid Header */}
            <div className="px-2 sm:px-4 py-2 bg-terminal-surface/80 dark:bg-terminal-surface/80 backdrop-blur-sm border-b border-terminal-border flex justify-between items-center sticky top-0 z-20 shrink-0 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <span className="text-[10px] sm:text-xs uppercase text-terminal-text font-bold tracking-widest flex items-center gap-1 sm:gap-2 shrink-0">
                        <IconDatabase className="w-3 h-3 text-terminal-blue" />
                        <span className="hidden xs:inline">RESULT GRID</span>
                        <span className="xs:hidden">RESULTS</span>
                    </span>
                    <span className="px-1.5 sm:px-2 py-0.5 bg-terminal-blue/10 border border-terminal-blue/20 rounded text-[9px] sm:text-[10px] font-mono text-terminal-blue font-bold whitespace-nowrap">
                        {result.data.length} <span className="hidden xs:inline">ROWS</span>
                    </span>
                    
                    {/* View Toggle */}
                    <div className="flex bg-white dark:bg-terminal-bg rounded border border-terminal-border/50 p-0.5 ml-1 sm:ml-4 shadow-sm shrink-0">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-1 rounded transition-all ${viewMode === 'grid' ? 'bg-terminal-blue/10 text-terminal-blue shadow-sm' : 'text-terminal-text/40 hover:text-terminal-text hover:bg-black/5 dark:hover:bg-white/5'}`}
                            title="Grid View"
                        >
                            <IconTable className="w-3 h-3" />
                        </button>
                        <button 
                            onClick={() => setViewMode('chart')}
                            className={`p-1 rounded transition-all ${viewMode === 'chart' ? 'bg-terminal-blue/10 text-terminal-blue shadow-sm' : 'text-terminal-text/40 hover:text-terminal-text hover:bg-black/5 dark:hover:bg-white/5'}`}
                            title="Chart View"
                        >
                            <IconChartBar className="w-3 h-3" />
                        </button>
                    </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono text-terminal-text/40 bg-white dark:bg-black/20 px-1.5 sm:px-2 py-1 rounded border border-terminal-border/30 shrink-0">
                    {result.executionTime?.toFixed(2)}ms
                </span>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-terminal-border/50 scrollbar-track-transparent bg-slate-50 dark:bg-terminal-bg relative">
                {viewMode === 'grid' ? (
                    <div className="min-w-full inline-block align-middle overflow-x-auto">
                        <table className="w-full text-left border-collapse font-mono text-sm">
                            <thead className="sticky top-0 bg-white dark:bg-terminal-bg z-10 shadow-sm">
                                <tr>
                                    {result.columns.map((col, idx) => (
                                        <th key={idx} className="p-2 sm:p-3 border-b border-terminal-border text-terminal-text/70 font-bold whitespace-nowrap bg-slate-100 dark:bg-terminal-surface text-[10px] sm:text-xs uppercase tracking-wider border-r border-terminal-border/30 last:border-r-0">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-terminal-border/10">
                                {result.data.map((row, rowIdx) => (
                                    <tr key={rowIdx} className="hover:bg-blue-50/50 dark:hover:bg-white/5 transition-colors group even:bg-white dark:even:bg-white/[0.02] odd:bg-slate-50/50 dark:odd:bg-transparent">
                                        {result.columns.map((col, colIdx) => (
                                            <td key={colIdx} className="p-2 sm:p-3 text-terminal-text/90 whitespace-nowrap max-w-[150px] sm:max-w-xs overflow-hidden text-ellipsis text-[10px] sm:text-xs border-r border-terminal-border/10 last:border-r-0">
                                                {row[col] === null ? (
                                                    <span className="text-terminal-text/20 italic text-[9px] sm:text-[10px]">NULL</span>
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
                ) : (
                    <div className="p-4 h-full bg-white dark:bg-terminal-bg">
                        <DataVisualizer result={result} theme={theme} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultsTable;