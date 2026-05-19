import React, { useState } from 'react';
import { CASES, TABLES } from '../constants';
import { Case } from '../types';
import { 
    IconFolder, 
    IconCheck, 
    IconLock, 
    IconUnlock,
    IconDatabase, 
    IconChevronLeft, 
    IconChevronRight,
    IconSettings,
    IconUser,
    IconSun,
    IconMoon,
    IconTable,
    IconKey
} from './Icons';

interface SidebarProps {
    currentCase: Case;
    completedCases: string[];
    onCaseSelect: (caseId: string) => void;
    badgeId: string;
    officerName: string; 
    isCollapsed: boolean;
    toggleSidebar: () => void;
    onOpenSettings: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    currentCase, 
    completedCases, 
    onCaseSelect, 
    badgeId, 
    officerName,
    isCollapsed,
    toggleSidebar,
    onOpenSettings,
    theme,
    toggleTheme
}) => {
    const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'Easy' | 'Medium' | 'Hard'>('ALL');
    
    // Collapsible states
    const [isAcademyOpen, setIsAcademyOpen] = useState(true);
    const [isInterviewOpen, setIsInterviewOpen] = useState(true);
    const [isCyberOpen, setIsCyberOpen] = useState(true);
    const [isFieldOpen, setIsFieldOpen] = useState(true);
    const [isSchemaOpen, setIsSchemaOpen] = useState(true);
    
    // Schema Table States (which tables are expanded)
    const [expandedTables, setExpandedTables] = useState<string[]>([]);

    const toggleTable = (tableName: string) => {
        setExpandedTables(prev => 
            prev.includes(tableName) 
                ? prev.filter(t => t !== tableName) 
                : [...prev, tableName]
        );
    };

    // Filter the master list based on selection
    const visibleCases = CASES.filter(c => difficultyFilter === 'ALL' || c.difficulty === difficultyFilter);
    
    // Split into sections
    const academyCases = visibleCases.filter(c => c.id.startsWith('academy'));
    const interviewCases = visibleCases.filter(c => c.id.startsWith('interview'));
    const cyberCases = visibleCases.filter(c => c.id.startsWith('cyber'));
    const fieldCases = visibleCases.filter(c => !c.id.startsWith('academy') && !c.id.startsWith('interview') && !c.id.startsWith('cyber'));

    const totalSolved = completedCases.length;
    const totalCases = CASES.length;
    const progressPercent = Math.round((totalSolved / totalCases) * 100);

    // Helper to render a collapsible header
    const SectionHeader = ({ 
        title, 
        isOpen, 
        setIsOpen, 
        count,
        total
    }: { 
        title: string; 
        isOpen: boolean; 
        setIsOpen: (v: boolean) => void;
        count?: number;
        total?: number;
    }) => {
        if (isCollapsed) return null;
        return (
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-terminal-text/50 uppercase tracking-widest hover:text-terminal-text transition-colors group"
            >
                <div className="flex items-center gap-2">
                    <span className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} opacity-50 group-hover:opacity-100`}>
                         <IconChevronRight className="w-3 h-3" />
                    </span>
                    {title}
                </div>
                {count !== undefined && (
                    <span className="bg-terminal-surface px-1.5 py-0.5 rounded text-terminal-text/40 group-hover:text-terminal-text/80 transition-colors">
                        {count}/{total}
                    </span>
                )}
            </button>
        );
    };

    // Helper to render a case list item
    const CaseItem: React.FC<{ c: Case }> = ({ c }) => {
        const isCompleted = completedCases.includes(c.id);
        const isActive = c.id === currentCase.id;
        
        // Determine if "sequentially locked"
        // Find index in the FULL list to check previous
        const globalIndex = CASES.findIndex(item => item.id === c.id);
        const previousCase = globalIndex > 0 ? CASES[globalIndex - 1] : null;
        const isSequentiallyLocked = previousCase && !completedCases.includes(previousCase.id) && !isCompleted;

        return (
            <div className="relative pl-3">
                {/* Tree Line Horizontal */}
                <div className={`absolute left-0 top-1/2 w-2 h-px -translate-y-1/2 ${isSequentiallyLocked ? 'bg-terminal-border/10' : 'bg-terminal-border/30'}`}></div>
                
                <button 
                    onClick={() => !isSequentiallyLocked && onCaseSelect(c.id)}
                    disabled={isSequentiallyLocked}
                    title={isSequentiallyLocked ? "Complete previous case to unlock" : c.title}
                    className={`
                        group w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-all duration-200 relative overflow-hidden mb-1
                        ${isActive 
                            ? 'bg-terminal-blue/10 text-terminal-text shadow-[inset_0_0_0_1px_rgba(var(--color-terminal-blue-rgb),0.4)] border border-terminal-blue/30' 
                            : ''}
                        ${!isActive && !isSequentiallyLocked
                            ? 'text-terminal-text/60 hover:bg-terminal-surface hover:text-terminal-text border border-transparent cursor-pointer'
                            : ''}
                        ${isSequentiallyLocked 
                            ? 'text-terminal-text/20 bg-terminal-bg/20 border border-transparent cursor-not-allowed grayscale' 
                            : ''}
                    `}
                >
                    {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-terminal-blue shadow-[0_0_8px_var(--color-terminal-blue)]"></div>
                    )}

                    <div className={`
                        flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors relative
                        ${isCompleted && !isActive ? 'text-terminal-green bg-terminal-green/10' : ''}
                        ${isActive ? 'text-terminal-blue' : ''}
                        ${!isCompleted && !isActive && !isSequentiallyLocked ? 'text-terminal-text/40 bg-terminal-surface' : ''}
                        ${isSequentiallyLocked ? 'text-terminal-text/20 bg-terminal-surface/10' : ''}
                    `}>
                        {isCompleted ? <IconCheck className="w-3.5 h-3.5" /> : 
                         isActive ? <IconFolder className="w-3.5 h-3.5" /> :
                         isSequentiallyLocked ? <IconLock className="w-3.5 h-3.5" /> :
                         <IconFolder className="w-3.5 h-3.5" />}
                    </div>

                    {!isCollapsed && (
                        <div className="flex-1 text-left truncate flex justify-between items-center">
                            <div className={`font-medium truncate pr-2 text-xs ${isSequentiallyLocked ? 'italic' : ''}`}>
                                {c.title}
                            </div>
                            
                            {/* Difficulty Dot */}
                            {difficultyFilter === 'ALL' && !isSequentiallyLocked && (
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-sm ${
                                    c.difficulty === 'Easy' ? 'bg-green-500' : 
                                    c.difficulty === 'Medium' ? 'bg-yellow-500' : 
                                    c.difficulty === 'Intermediate' ? 'bg-orange-500' : 'bg-red-500'
                                }`} title={c.difficulty}></div>
                            )}
                            
                            {isSequentiallyLocked && (
                                <IconLock className="w-3 h-3 text-terminal-text/10" />
                            )}
                        </div>
                    )}
                </button>
            </div>
        );
    };

    return (
        <div 
            className={`
                fixed lg:relative h-full bg-terminal-surface/95 dark:bg-terminal-bg/95 backdrop-blur-md border-r border-terminal-border flex flex-col transition-all duration-300 ease-in-out z-50 shadow-xl
                ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16 w-[92%] max-w-[22rem]' : 'translate-x-0 w-[92%] max-w-[22rem] lg:w-80'}
            `}
        >
            {/* 1. Header & Logo */}
            <div className={`h-16 flex items-center border-b border-terminal-border bg-terminal-surface dark:bg-terminal-bg shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between px-4'}`}>
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-terminal-blue rounded-full animate-pulse shadow-[0_0_8px_var(--color-terminal-blue)]"></div>
                        <h1 className="text-lg font-bold text-terminal-text tracking-widest font-sans">SQL-PD</h1>
                    </div>
                )}
                
                <button 
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-md text-terminal-text/60 hover:bg-terminal-surface hover:text-terminal-text transition-colors"
                >
                    {isCollapsed ? <IconChevronRight className="w-5 h-5 lg:block hidden" /> : <IconChevronLeft className="w-4 h-4" />}
                    {isCollapsed && <IconChevronRight className="w-5 h-5 lg:hidden block" />}
                </button>
            </div>

            {/* 2. Global Progress Bar */}
            {!isCollapsed && (
                <div className="px-4 py-3 border-b border-terminal-border/50 bg-terminal-surface/20 shrink-0">
                    <div className="flex justify-between text-[10px] font-bold text-terminal-text/60 mb-1.5 uppercase tracking-wider">
                        <span>Career Progress</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-terminal-bg rounded-full overflow-hidden border border-terminal-border/30">
                        <div 
                            className="h-full bg-gradient-to-r from-terminal-blue to-terminal-green shadow-[0_0_10px_rgba(46,160,67,0.4)] transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* 3. Filter Controls */}
            {!isCollapsed && (
                <div className="px-3 pt-3 pb-2 shrink-0">
                    <div className="flex bg-terminal-surface/50 p-1 rounded-lg border border-terminal-border/50">
                        {(['ALL', 'Easy', 'Medium', 'Hard'] as const).map((level) => (
                            <button
                                key={level}
                                onClick={() => setDifficultyFilter(level)}
                                className={`
                                    flex-1 py-1 text-[9px] uppercase font-bold rounded transition-all text-center active:scale-95
                                    ${difficultyFilter === level
                                        ? 'bg-terminal-bg text-terminal-text shadow-sm border border-terminal-border/20'
                                        : 'text-terminal-text/40 hover:text-terminal-text hover:bg-terminal-bg/50'
                                    }
                                `}
                            >
                                {level === 'Medium' ? 'Med' : level}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-terminal-border/50 scrollbar-track-transparent">
                
                <div className="px-3 pb-4 space-y-2">
                    {/* Academy Section */}
                    {academyCases.length > 0 && (
                        <div className="mt-2">
                            <SectionHeader 
                                title="Training Modules" 
                                isOpen={isAcademyOpen} 
                                setIsOpen={setIsAcademyOpen}
                                count={academyCases.filter(c => completedCases.includes(c.id)).length}
                                total={academyCases.length}
                            />
                            
                            <div className={`
                                space-y-0.5 overflow-hidden transition-all duration-300 
                                ${isAcademyOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
                                ml-2 pl-2 border-l border-terminal-border/20
                            `}>
                                {academyCases.map(c => <CaseItem key={c.id} c={c} />)}
                            </div>
                        </div>
                    )}

                    {/* Interview Section */}
                    {interviewCases.length > 0 && (
                        <div className="mt-2">
                            <SectionHeader 
                                title="Interview Prep" 
                                isOpen={isInterviewOpen} 
                                setIsOpen={setIsInterviewOpen}
                                count={interviewCases.filter(c => completedCases.includes(c.id)).length}
                                total={interviewCases.length}
                            />
                            
                            <div className={`
                                space-y-0.5 overflow-hidden transition-all duration-300 
                                ${isInterviewOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
                                ml-2 pl-2 border-l border-terminal-border/20
                            `}>
                                {interviewCases.map(c => <CaseItem key={c.id} c={c} />)}
                            </div>
                        </div>
                    )}

                    {/* Cyber Warfare Section */}
                    {cyberCases.length > 0 && (
                        <div className="mt-2">
                            <SectionHeader 
                                title="Cyber Warfare" 
                                isOpen={isCyberOpen} 
                                setIsOpen={setIsCyberOpen}
                                count={cyberCases.filter(c => completedCases.includes(c.id)).length}
                                total={cyberCases.length}
                            />
                            
                            <div className={`
                                space-y-0.5 overflow-hidden transition-all duration-300 
                                ${isCyberOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
                                ml-2 pl-2 border-l border-terminal-border/20
                            `}>
                                {cyberCases.map(c => <CaseItem key={c.id} c={c} />)}
                            </div>
                        </div>
                    )}

                    {/* Separator if both exist */}
                    {(academyCases.length > 0 || interviewCases.length > 0 || cyberCases.length > 0) && fieldCases.length > 0 && !isCollapsed && (
                        <div className="h-px bg-terminal-border/30 mx-2 my-2"></div>
                    )}

                    {/* Field Cases Section */}
                    {fieldCases.length > 0 && (
                        <div>
                            <SectionHeader 
                                title="Active Investigations" 
                                isOpen={isFieldOpen} 
                                setIsOpen={setIsFieldOpen}
                                count={fieldCases.filter(c => completedCases.includes(c.id)).length}
                                total={fieldCases.length}
                            />
                            
                            <div className={`
                                space-y-0.5 overflow-hidden transition-all duration-300 
                                ${isFieldOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
                                ml-2 pl-2 border-l border-terminal-border/20
                            `}>
                                {fieldCases.map(c => <CaseItem key={c.id} c={c} />)}
                            </div>
                        </div>
                    )}
                    
                    {academyCases.length === 0 && fieldCases.length === 0 && interviewCases.length === 0 && !isCollapsed && (
                        <div className="text-center text-xs text-terminal-text/40 py-8 italic border border-dashed border-terminal-border/30 rounded mx-2">
                            No matching files found.
                        </div>
                    )}
                </div>

                {/* Schema Section */}
                {!isCollapsed && (
                    <div className="px-3 border-t border-terminal-border/50 pt-2 pb-4 bg-terminal-bg/30">
                         <button 
                            onClick={() => setIsSchemaOpen(!isSchemaOpen)}
                            className="w-full flex items-center justify-between px-2 py-2 mb-1 text-[10px] font-bold text-terminal-text/50 uppercase tracking-widest hover:text-terminal-text transition-colors group"
                        >
                            <div className="flex items-center gap-2">
                                <IconDatabase className="w-3 h-3" />
                                <span>Database Schema</span>
                            </div>
                            <span className={`transition-transform duration-200 ${isSchemaOpen ? 'rotate-180' : ''} opacity-50`}>
                                <IconChevronRight className="w-3 h-3 rotate-90" />
                            </span>
                        </button>
                        
                        <div className={`
                            space-y-1 overflow-hidden transition-all duration-300 
                            ${isSchemaOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
                            ml-2 pl-2 border-l border-terminal-border/20
                        `}>
                            {TABLES.map(table => {
                                const isExpanded = expandedTables.includes(table.tableName);
                                return (
                                    <div key={table.tableName} className="group relative pl-3">
                                        {/* Tree Line Horizontal */}
                                        <div className="absolute left-0 top-[14px] w-2 h-px bg-terminal-border/30"></div>

                                        <button 
                                            onClick={() => toggleTable(table.tableName)}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-terminal-surface rounded transition-colors text-left"
                                        >
                                            <IconTable className="w-3 h-3 text-terminal-blue opacity-70" />
                                            <span className="text-[11px] text-terminal-text/80 font-mono flex-1">{table.tableName}</span>
                                            <IconChevronRight className={`w-2.5 h-2.5 text-terminal-text/30 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                                        </button>
                                        
                                        {/* Inline Columns */}
                                        <div className={`
                                            pl-3 space-y-0.5 overflow-hidden transition-all duration-200 
                                            ${isExpanded ? 'max-h-[500px] py-1' : 'max-h-0'}
                                            ml-2 border-l border-terminal-border/20
                                        `}>
                                            {table.columns.map(col => (
                                                <div key={col.name} className="flex items-center gap-2 py-0.5 relative pl-3">
                                                    {/* Tree Line Horizontal */}
                                                    <div className="absolute left-0 top-1/2 w-2 h-px bg-terminal-border/30 -translate-y-1/2"></div>
                                                    
                                                    <div className="w-1 h-1 rounded-full bg-terminal-text/20"></div>
                                                    <span className="text-[10px] font-mono text-terminal-text/60 flex-1">{col.name}</span>
                                                    <span className="text-[9px] font-mono text-terminal-text/30 uppercase">{col.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* 5. Footer / User Profile */}
            <div className="p-3 border-t border-terminal-border bg-terminal-surface/30 shrink-0">
                <div className={`flex flex-col gap-2 ${isCollapsed ? 'items-center' : ''}`}>
                    {/* Theme Toggle */}
                    <button 
                        onClick={toggleTheme}
                        className={`
                            flex items-center justify-center p-2 rounded-lg text-terminal-text/60 hover:bg-terminal-surface hover:text-terminal-text transition-colors border border-transparent hover:border-terminal-border
                            ${isCollapsed ? 'w-full' : 'w-full mb-1 bg-terminal-surface/50'}
                        `}
                        title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                         {theme === 'dark' ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
                         {!isCollapsed && <span className="text-xs ml-2 font-medium">Switch Theme</span>}
                    </button>

                    <button 
                        onClick={onOpenSettings}
                        className={`
                            w-full flex items-center rounded-lg p-2 transition-all hover:bg-terminal-surface border border-transparent hover:border-terminal-border
                            ${isCollapsed ? 'justify-center' : 'justify-between'}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-terminal-surface dark:bg-gradient-to-tr dark:from-gray-800 dark:to-gray-700 flex items-center justify-center border border-terminal-border dark:border-gray-600 shadow-lg relative">
                                <IconUser className="w-4 h-4 text-terminal-text/60 dark:text-gray-300" />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-terminal-green rounded-full border-2 border-terminal-bg"></div>
                            </div>
                            {!isCollapsed && (
                                <div className="text-left w-24">
                                    <div className="text-xs font-bold text-terminal-text truncate">{officerName}</div>
                                    <div className="text-[10px] text-terminal-blue font-mono">#{badgeId}</div>
                                </div>
                            )}
                        </div>
                        {!isCollapsed && <IconSettings className="w-4 h-4 text-terminal-text/40 hover:text-terminal-text transition-colors" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;