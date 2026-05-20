import React, { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql, SQLite } from '@codemirror/lang-sql';
import { EditorView } from '@codemirror/view';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { bracketMatching } from '@codemirror/language';
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

// Custom Autocomplete Source (UPPERCASE Keywords, Snippets, & Schema)
const customCompletions = (context: CompletionContext) => {
    let word = context.matchBefore(/\w*/)
    if (!word || (word.from === word.to && !context.explicit)) return null
    
    // Add Schema (Tables and Columns)
    const schemaCompletions = Object.entries(sqlSchema).flatMap(([table, columns]) => {
        return [
            { label: table, type: 'namespace', boost: 90 },
            ...columns.map(col => ({ label: col, type: 'property', boost: 85 }))
        ];
    });

    return {
        from: word.from,
        options: [
            // UPPERCASE Keywords for professional practice
            { label: 'SELECT', type: 'keyword', boost: 99 },
            { label: 'FROM', type: 'keyword', boost: 99 },
            { label: 'WHERE', type: 'keyword', boost: 99 },
            { label: 'INSERT INTO', type: 'keyword', boost: 99 },
            { label: 'UPDATE', type: 'keyword', boost: 99 },
            { label: 'DELETE FROM', type: 'keyword', boost: 99 },
            { label: 'LIMIT', type: 'keyword', boost: 99 },
            { label: 'ORDER BY', type: 'keyword', boost: 99 },
            { label: 'GROUP BY', type: 'keyword', boost: 99 },
            { label: 'HAVING', type: 'keyword', boost: 99 },
            { label: 'JOIN', type: 'keyword', boost: 99 },
            { label: 'LEFT JOIN', type: 'keyword', boost: 99 },
            { label: 'COUNT', type: 'function', boost: 99 },
            { label: 'SUM', type: 'function', boost: 99 },
            { label: 'AVG', type: 'function', boost: 99 },
            { label: 'DISTINCT', type: 'keyword', boost: 99 },
            { label: 'AS', type: 'keyword', boost: 99 },
            { label: 'AND', type: 'keyword', boost: 99 },
            { label: 'OR', type: 'keyword', boost: 99 },
            { label: 'LIKE', type: 'keyword', boost: 99 },
            { label: 'IN', type: 'keyword', boost: 99 },
            { label: 'BETWEEN', type: 'keyword', boost: 99 },
            { label: 'CASE', type: 'keyword', boost: 99 },
            { label: 'WHEN', type: 'keyword', boost: 99 },
            { label: 'THEN', type: 'keyword', boost: 99 },
            { label: 'ELSE', type: 'keyword', boost: 99 },
            { label: 'END', type: 'keyword', boost: 99 },
            
            // Snippets (Upper)
            { label: 'sf', type: 'text', apply: 'SELECT * FROM ', detail: 'SELECT * FROM', boost: 100 },
            { label: 'sc', type: 'text', apply: 'SELECT COUNT(*) FROM ', detail: 'Count rows', boost: 100 },
            
            ...schemaCompletions
        ]
    }
}

// Custom Terminal Theme for CodeMirror (Dark)
const terminalTheme = EditorView.theme({
    "&": {
        backgroundColor: "transparent",
        height: "100%",
        color: "#e0e0e0", 
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        fontSize: "14px",
    },
    ".cm-content": {
        caretColor: "#00ff00",
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
    // SQL Highlighting Overrides - PRO LEVEL
    ".tok-keyword": {
        color: "#569cd6",
        fontWeight: "bold",
    },
    ".tok-function": {
        color: "#dcdcaa",
        fontWeight: "bold",
    },
    ".tok-string": {
        color: "#ce9178",
    },
    ".tok-number": {
        color: "#b5cea8",
    },
    ".tok-comment": {
        color: "#6a9955",
        fontStyle: "italic",
    },
    ".tok-propertyName": {
        color: "#9cdcfe",
    },
    ".tok-variableName": {
        color: "#9cdcfe",
    },
    ".tok-operator": {
        color: "#d4d4d4",
    },
    "&.cm-focused": {
        outline: "none",
    },
    // Autocomplete Dropdown Styling
    ".cm-tooltip": {
        backgroundColor: "#1a1a1a !important",
        border: "1px solid #333 !important",
        borderRadius: "4px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
    },
    ".cm-tooltip-autocomplete": {
        "& > ul > li": {
            fontFamily: "monospace",
            padding: "4px 12px",
            fontSize: "12px",
        },
        "& > ul > li[aria-selected]": {
            backgroundColor: "#2e7d32 !important",
            color: "#fff !important",
        },
    }
}, { dark: true });

// Custom Light Theme for CodeMirror
const lightTerminalTheme = EditorView.theme({
    "&": {
        backgroundColor: "transparent",
        height: "100%",
        color: "#334155", 
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        fontSize: "14px",
    },
    ".cm-content": {
        caretColor: "#2563EB",
    },
    ".cm-gutters": {
        backgroundColor: "#F8FAFC",
        color: "#94A3B8",
        borderRight: "1px solid #E2E8F0",
    },
    ".cm-activeLineGutter": {
        backgroundColor: "#E2E8F0",
        color: "#0F172A",
    },
    "&.cm-focused .cm-cursor": {
        borderLeftColor: "#2563EB",
    },
    ".cm-activeLine": {
        backgroundColor: "#F1F5F9",
    },
    ".cm-selectionMatch": {
        backgroundColor: "rgba(37, 99, 235, 0.2)",
    },
    ".cm-selectionBackground, ::selection": {
        backgroundColor: "#DBEAFE !important",
    },
    // SQL Highlighting Overrides - PRO LEVEL
    ".tok-keyword": {
        color: "#0000ff",
        fontWeight: "bold",
    },
    ".tok-function": {
        color: "#795e26",
        fontWeight: "bold",
    },
    ".tok-string": {
        color: "#a31515",
    },
    ".tok-number": {
        color: "#098658",
    },
    ".tok-comment": {
        color: "#008000",
        fontStyle: "italic",
    },
    ".tok-propertyName": {
        color: "#001080",
    },
    ".tok-variableName": {
        color: "#001080",
    },
    ".tok-operator": {
        color: "#333",
    },
    "&.cm-focused": {
        outline: "none",
    },
    // Autocomplete Dropdown Styling
    ".cm-tooltip": {
        backgroundColor: "#ffffff !important",
        border: "1px solid #E2E8F0 !important",
        borderRadius: "4px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    },
    ".cm-tooltip-autocomplete": {
        "& > ul > li": {
            fontFamily: "monospace",
            padding: "4px 12px",
            fontSize: "12px",
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
        <div className="h-full flex flex-col min-h-[230px] border-b border-terminal-border bg-terminal-bg relative group transition-all">
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
                        sql({ schema: sqlSchema, upperCaseKeywords: true }),
                        bracketMatching(),
                        autocompletion({ override: [customCompletions] }), // Still using override but we trust our expanded list
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