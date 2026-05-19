import React from 'react';
import { X, History, Terminal } from 'lucide-react';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: string[];
    onSelectQuery: (sql: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onSelectQuery }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 transition-colors">
            <div className="bg-terminal-bg border border-terminal-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-terminal-border bg-terminal-surface/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-terminal-blue/10 rounded-lg border border-terminal-blue/20">
                            <History className="w-5 h-5 text-terminal-blue" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-terminal-text tracking-tight">Command History</h2>
                            <p className="text-xs text-terminal-text/60 uppercase tracking-wider">Session Logs</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-terminal-surface rounded-lg transition-colors text-terminal-text/60 hover:text-terminal-text"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-terminal-border dark:scrollbar-thumb-white/10 scrollbar-track-transparent bg-terminal-surface/30 dark:bg-black/20">
                    {history.length === 0 ? (
                        <div className="text-center py-12 text-terminal-text/40">
                            <Terminal className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No queries executed in this session.</p>
                        </div>
                    ) : (
                        [...history].reverse().map((sql, i) => (
                            <div 
                                key={i} 
                                onClick={() => {
                                    onSelectQuery(sql);
                                    onClose();
                                }}
                                className="group relative bg-white dark:bg-black/40 border border-terminal-border dark:border-white/5 rounded-lg p-4 hover:border-terminal-blue/30 hover:bg-terminal-highlight dark:hover:bg-white/5 transition-all cursor-pointer shadow-sm"
                            >
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] uppercase font-bold text-terminal-blue bg-terminal-blue/10 px-2 py-1 rounded border border-terminal-blue/20">
                                        Load Query
                                    </span>
                                </div>
                                <pre className="font-mono text-xs text-terminal-text/80 whitespace-pre-wrap break-all">
                                    {sql}
                                </pre>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[10px] text-terminal-text/30 font-mono">
                                        #{history.length - i}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
