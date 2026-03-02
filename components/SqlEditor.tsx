import React, { useRef, useEffect } from 'react';
import { IconPlay, IconCheck } from './Icons';

interface SqlEditorProps {
    sql: string;
    onChange: (val: string) => void;
    onRun: (sql: string) => void;
    isRunning: boolean;
    answerInput: string;
    setAnswerInput: (val: string) => void;
    onSubmitAnswer: () => void;
    isChecking: boolean;
    onFormat: () => void;
    onShowHistory: () => void;
}

const SqlEditor: React.FC<SqlEditorProps> = ({ 
    sql,
    onChange,
    onRun, 
    isRunning, 
    answerInput, 
    setAnswerInput, 
    onSubmitAnswer,
    isChecking,
    onFormat,
    onShowHistory
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            onRun(sql);
        }
    };

    const handleScroll = () => {
        if (textareaRef.current && lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    const lineCount = sql.split('\n').length;
    const lines = Array.from({ length: Math.max(lineCount, 10) }, (_, i) => i + 1);

    return (
        <div className="flex flex-col h-1/2 min-h-[300px] border-b border-terminal-border bg-terminal-bg relative group">
            {/* Toolbar */}
            <div className="bg-terminal-surface/50 px-4 py-2 flex justify-between items-center border-b border-terminal-border backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <span className="text-xs uppercase text-terminal-text font-bold tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-terminal-blue animate-pulse"></span>
                        QUERY CONSOLE
                    </span>
                    <span className="text-[10px] text-terminal-text/40 font-mono hidden sm:inline-block">
                        SQL-92 COMPLIANT
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onShowHistory}
                        className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-terminal-text/60 hover:text-terminal-text hover:bg-white/5 rounded transition-colors"
                    >
                        HISTORY
                    </button>
                    <button 
                        onClick={onFormat}
                        className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-terminal-text/60 hover:text-terminal-text hover:bg-white/5 rounded transition-colors"
                    >
                        FORMAT
                    </button>
                    <span className="w-px h-4 bg-terminal-border mx-1"></span>
                    <span className="text-[10px] text-terminal-text/40 font-mono hidden sm:inline-block">
                        CTRL+ENTER to RUN
                    </span>
                    <button 
                        onClick={() => onRun(sql)}
                        disabled={isRunning}
                        className={`
                            flex items-center gap-2 px-3 py-1 bg-terminal-green/10 text-terminal-green border border-terminal-green/30 
                            font-bold font-mono text-xs rounded hover:bg-terminal-green/20 transition-all
                            ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_10px_rgba(46,160,67,0.2)]'}
                        `}
                    >
                        <IconPlay className="w-3 h-3" />
                        {isRunning ? 'EXECUTING...' : 'RUN'}
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex relative overflow-hidden">
                {/* Line Numbers */}
                <div 
                    ref={lineNumbersRef}
                    className="w-10 bg-terminal-surface/30 border-r border-terminal-border/50 text-right font-mono text-sm text-terminal-text/30 py-4 pr-3 select-none overflow-hidden"
                >
                    {lines.map(line => (
                        <div key={line} className="leading-6">{line}</div>
                    ))}
                </div>

                {/* Text Area */}
                <textarea
                    ref={textareaRef}
                    value={sql}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onScroll={handleScroll}
                    className="flex-1 bg-transparent text-terminal-text p-4 font-mono text-sm leading-6 resize-none focus:outline-none placeholder:text-terminal-text/20"
                    placeholder="-- Enter your SQL query here...
SELECT * FROM crime_scene_report LIMIT 5;"
                    spellCheck={false}
                />
            </div>

            {/* Bottom Action Bar (Answer Input) */}
            <div className="p-3 bg-terminal-surface/30 border-t border-terminal-border flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
                <div className="flex-1 w-full flex items-center gap-2 bg-terminal-bg border border-terminal-border rounded-md px-3 py-2 shadow-sm focus-within:border-terminal-blue/50 focus-within:ring-1 focus-within:ring-terminal-blue/20 transition-all">
                    <span className="text-terminal-text/40 font-mono text-xs">ANSWER &gt;</span>
                    <input 
                        type="text" 
                        value={answerInput}
                        onChange={(e) => setAnswerInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSubmitAnswer()}
                        placeholder="Type your final answer here..."
                        className="flex-1 bg-transparent text-sm text-terminal-text focus:outline-none font-mono placeholder:text-terminal-text/20"
                    />
                </div>
                
                <button 
                    onClick={onSubmitAnswer}
                    disabled={isChecking || !answerInput.trim()}
                    className={`
                        w-full sm:w-auto px-6 py-2 bg-terminal-blue text-white border border-terminal-blue 
                        font-bold font-mono text-sm rounded shadow-lg hover:bg-terminal-blue/90 transition-all
                        flex items-center justify-center gap-2
                        ${(isChecking || !answerInput.trim()) ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105'}
                    `}
                >
                    {isChecking ? (
                        <span className="animate-pulse">VERIFYING...</span>
                    ) : (
                        <>
                            <IconCheck className="w-4 h-4" />
                            SUBMIT ANSWER
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default SqlEditor;