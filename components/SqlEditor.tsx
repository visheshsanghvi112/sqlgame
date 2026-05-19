import React, { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { EditorView } from '@codemirror/view';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { IconPlay, IconCheck, IconTrash } from './Icons';
import { TABLES } from '../constants';

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
    theme: 'light' | 'dark';
}

// Construct schema for autocomplete
const sqlSchema = TABLES.reduce((acc, table) => {
    acc[table.tableName] = table.columns.map(c => c.name);
    return acc;
}, {} as Record<string, string[]>);

// Custom Autocomplete Source (Lowercase & Snippets)
const customCompletions = (context: CompletionContext) => {
    let word = context.matchBefore(/\w*/)
    if (!word || (word.from === word.to && !context.explicit)) return null
    
    return {
        from: word.from,
        options: [
            // Lowercase Keywords
            { label: 'select', type: 'keyword', boost: 99 },
            { label: 'from', type: 'keyword', boost: 99 },
            { label: 'where', type: 'keyword', boost: 99 },
            { label: 'limit', type: 'keyword', boost: 99 },
            { label: 'order by', type: 'keyword', boost: 99 },
            { label: 'group by', type: 'keyword', boost: 99 },
            { label: 'join', type: 'keyword', boost: 99 },
            { label: 'left join', type: 'keyword', boost: 99 },
            { label: 'count', type: 'function', boost: 99 },
            { label: 'distinct', type: 'keyword', boost: 99 },
            
            // Snippets
            { label: 'sf', type: 'text', apply: 'SELECT * FROM ', detail: 'SELECT * FROM', boost: 100 },
            { label: 'sc', type: 'text', apply: 'SELECT COUNT(*) FROM ', detail: 'Count rows', boost: 100 },
        ]
    }
}

// Custom Terminal Theme for CodeMirror (Dark)
const terminalTheme = EditorView.theme({
    "&": {
        backgroundColor: "transparent",
        height: "100%",
        color: "#e0e0e0", // Lighter text for better contrast
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        fontSize: "14px",
    },
    ".cm-content": {
        caretColor: "#00ff00", // Bright green cursor
    },
    ".cm-gutters": {
        backgroundColor: "rgba(0,0,0,0.2)",
        color: "rgba(255,255,255, 0.3)",
        borderRight: "1px solid rgba(255,255,255, 0.1)",
    },
    ".cm-activeLineGutter": {
        backgroundColor: "rgba(255,255,255, 0.1)",
        color: "#fff",
    },
    "&.cm-focused .cm-cursor": {
        borderLeftColor: "#00ff00",
    },
    ".cm-activeLine": {
        backgroundColor: "rgba(255,255,255, 0.05)",
    },
    ".cm-selectionMatch": {
        backgroundColor: "rgba(255,255,0, 0.2)",
    },
    ".cm-selectionBackground, ::selection": {
        backgroundColor: "rgba(0,100,255, 0.3) !important",
    },
    // Autocomplete Dropdown Styling
    ".cm-tooltip": {
        backgroundColor: "#1a1a1a !important",
        border: "1px solid #333 !important",
        borderRadius: "4px",
    },
    ".cm-tooltip-autocomplete": {
        "& > ul > li": {
            fontFamily: "monospace",
            padding: "2px 8px",
        },
        "& > ul > li[aria-selected]": {
            backgroundColor: "#004400 !important",
            color: "#fff !important",
        },
    }
}, { dark: true });

// Custom Light Theme for CodeMirror
const lightTerminalTheme = EditorView.theme({
    "&": {
        backgroundColor: "transparent",
        height: "100%",
        color: "#334155", // Slate 700
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        fontSize: "14px",
    },
    ".cm-content": {
        caretColor: "#2563EB", // Blue 600
    },
    ".cm-gutters": {
        backgroundColor: "#F8FAFC", // Slate 50
        color: "#94A3B8", // Slate 400
        borderRight: "1px solid #E2E8F0", // Slate 200
    },
    ".cm-activeLineGutter": {
        backgroundColor: "#E2E8F0", // Slate 200
        color: "#0F172A", // Slate 900
    },
    "&.cm-focused .cm-cursor": {
        borderLeftColor: "#2563EB",
    },
    ".cm-activeLine": {
        backgroundColor: "#F1F5F9", // Slate 100
    },
    ".cm-selectionMatch": {
        backgroundColor: "rgba(37, 99, 235, 0.2)",
    },
    ".cm-selectionBackground, ::selection": {
        backgroundColor: "#DBEAFE !important", // Blue 100
    },
    // Autocomplete Dropdown Styling
    ".cm-tooltip": {
        backgroundColor: "#ffffff !important",
        border: "1px solid #E2E8F0 !important",
        borderRadius: "4px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    ".cm-tooltip-autocomplete": {
        "& > ul > li": {
            fontFamily: "monospace",
            padding: "2px 8px",
            color: "#334155",
        },
        "& > ul > li[aria-selected]": {
            backgroundColor: "#2563EB !important",
            color: "#fff !important",
        },
    }
}, { dark: false });

const SqlEditor: React.FC<SqlEditorProps> = ({ 
    sql: sqlCode,
    onChange,
    onRun, 
    isRunning, 
    answerInput, 
    setAnswerInput, 
    onSubmitAnswer,
    isChecking,
    onFormat,
    onShowHistory,
    theme
}) => {
    
    // Custom keymap for Ctrl+Enter
    const keyMapExtension = EditorView.domEventHandlers({
        keydown: (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                onRun(sqlCode);
                return true;
            }
            return false;
        }
    });

    return (
        <div className="flex-[1.2] flex flex-col min-h-[230px] border-b border-terminal-border bg-terminal-bg relative group transition-all">
            {/* Toolbar */}
            <div className="bg-terminal-surface/80 px-2 sm:px-4 py-2 flex flex-wrap justify-between items-center border-b border-terminal-border backdrop-blur-md z-10 gap-2">
                <div className="flex items-center gap-2 sm:gap-4">
                    <span className="text-[10px] sm:text-xs uppercase text-terminal-text font-bold tracking-widest flex items-center gap-1 sm:gap-2">
                        <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-terminal-blue animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                        <span className="hidden xs:inline">QUERY CONSOLE</span>
                        <span className="xs:hidden">QUERY</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-terminal-text/40 font-mono hidden md:inline-block">
                        INTELLISENSE ACTIVE
                    </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <button 
                        onClick={() => onChange('')}
                        className="p-1.5 text-terminal-text/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors active:scale-95"
                        title="Clear Editor"
                    >
                        <IconTrash className="w-3.5 h-3.5" />
                    </button>
                    <div className="h-4 w-px bg-terminal-border mx-0.5 sm:mx-1"></div>
                    <button 
                        onClick={onShowHistory}
                        className="px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-terminal-text/60 hover:text-terminal-text hover:bg-terminal-surface rounded transition-colors active:scale-95"
                    >
                        HISTORY
                    </button>
                    <button 
                        onClick={onFormat}
                        className="px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-terminal-text/60 hover:text-terminal-text hover:bg-terminal-surface rounded transition-colors active:scale-95"
                    >
                        FORMAT
                    </button>
                    <span className="w-px h-4 bg-terminal-border mx-0.5 sm:mx-1"></span>
                    <button 
                        onClick={() => onRun(sqlCode)}
                        disabled={isRunning}
                        className={`
                            flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-terminal-green text-white border border-terminal-green
                            font-bold font-mono text-[10px] sm:text-xs rounded hover:bg-terminal-green/90 transition-all shadow-[0_0_10px_rgba(46,160,67,0.3)]
                            ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                        `}
                    >
                        <IconPlay className="w-3 h-3" />
                        <span className="hidden xs:inline">{isRunning ? 'RUNNING...' : 'RUN QUERY'}</span>
                        <span className="xs:hidden">{isRunning ? 'RUN...' : 'RUN'}</span>
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex relative overflow-hidden bg-terminal-bg">
                <CodeMirror
                    value={sqlCode}
                    height="100%"
                    theme={theme === 'dark' ? terminalTheme : lightTerminalTheme}
                    extensions={[
                        sql({ schema: sqlSchema }),
                        autocompletion({ override: [customCompletions] }),
                        keyMapExtension,
                        EditorView.lineWrapping
                    ]}
                    onChange={onChange}
                    className="flex-1 text-sm font-mono h-full"
                    basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        highlightSpecialChars: true,
                        history: true,
                        foldGutter: true,
                        drawSelection: true,
                        dropCursor: true,
                        allowMultipleSelections: true,
                        indentOnInput: true,
                        syntaxHighlighting: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: true,
                        rectangularSelection: true,
                        crosshairCursor: true,
                        highlightActiveLine: true,
                        highlightSelectionMatches: true,
                        closeBracketsKeymap: true,
                        defaultKeymap: true,
                        searchKeymap: true,
                        historyKeymap: true,
                        foldKeymap: true,
                        completionKeymap: true,
                        lintKeymap: true,
                    }}
                />
            </div>

            {/* Bottom Action Bar (Answer Input) */}
            <div className="p-3 bg-terminal-surface/30 border-t border-terminal-border flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors backdrop-blur-sm">
                <div className="flex-1 w-full flex items-center gap-2 bg-terminal-bg/80 border border-terminal-border rounded-md px-3 py-2 shadow-sm focus-within:border-terminal-blue/50 focus-within:ring-1 focus-within:ring-terminal-blue/20 transition-all">
                    <span className="text-terminal-text/40 font-mono text-xs whitespace-nowrap">FINAL ANSWER &gt;</span>
                    <input 
                        type="text" 
                        value={answerInput}
                        onChange={(e) => setAnswerInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSubmitAnswer()}
                        placeholder="Type answer here..."
                        className="flex-1 bg-transparent text-sm text-terminal-text focus:outline-none font-mono placeholder:text-terminal-text/20 min-w-0"
                    />
                </div>
                
                <button 
                    onClick={onSubmitAnswer}
                    disabled={isChecking || !answerInput.trim()}
                    className={`
                        w-full sm:w-auto px-6 py-2 bg-terminal-blue text-white border border-terminal-blue 
                        font-bold font-mono text-sm rounded shadow-lg hover:bg-terminal-blue/90 transition-all
                        flex items-center justify-center gap-2 active:scale-95
                        ${(isChecking || !answerInput.trim()) ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105 hover:shadow-blue-500/20'}
                    `}
                >
                    {isChecking ? (
                        <span className="animate-pulse">VERIFYING...</span>
                    ) : (
                        <>
                            <IconCheck className="w-4 h-4" />
                            SUBMIT
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default SqlEditor;