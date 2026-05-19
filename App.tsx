import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import SqlEditor from './components/SqlEditor';
import ResultsTable from './components/ResultsTable';
import SettingsModal from './components/SettingsModal';
import SchemaModal from './components/SchemaModal';
import HistoryModal from './components/HistoryModal';
import Notebook from './components/Notebook';
import { CASES } from './constants';
import { IconMenu, IconEdit } from './components/Icons';
import { runQuery, initDB } from './services/dbService';
import { QueryResult } from './types';


function App() {
  // Game State
  const [gameState, setGameState] = useState<'LOADING' | 'READY' | 'CHECKING' | 'SOLVED_ANIMATION' | 'FAILED'>('LOADING');
  
  // Persistence Data
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [completedCases, setCompletedCases] = useState<string[]>([]);
  const [badgeId, setBadgeId] = useState<string>('Unknown');
  const [officerName, setOfficerName] = useState<string>('Detective');
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [sqlCode, setSqlCode] = useState<string>(''); // Lifted state for persistence

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
      return (localStorage.getItem('sqlpd_theme') as 'dark' | 'light') || 'dark';
  });

  // 0. THEME EFFECT
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('sqlpd_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Execution State
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState<string>('');
  
  // UI States
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => window.innerWidth < 1024);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isBriefingExpanded, setIsBriefingExpanded] = useState(false);

  // Hint State
  const [hasUsedHint, setHasUsedHint] = useState(false);
  const [activeHint, setActiveHint] = useState<string>('');

  // 0. THEME EFFECT - REMOVED (Forced Dark)


  // 1. INITIALIZATION & RESTORE
  useEffect(() => {
    // Poll for Alasql to be ready (Script loading)
    const dbInitInterval = setInterval(() => {
        if (window.alasql) {
            clearInterval(dbInitInterval);
            initDB();
            
            // Restore Persistent Data
            const savedCase = localStorage.getItem('sqlpd_currentCase');
            const savedCompleted = localStorage.getItem('sqlpd_completed');
            const savedBadge = localStorage.getItem('sqlpd_badgeId');
            const savedName = localStorage.getItem('sqlpd_officerName');
            const savedHistory = localStorage.getItem('sqlpd_queryHistory');
            const savedSql = localStorage.getItem('sqlpd_editorContent');

            if (savedCase) {
                 const idx = parseInt(savedCase);
                 if (idx < CASES.length) setCurrentCaseIndex(idx);
            }
            if (savedCompleted) setCompletedCases(JSON.parse(savedCompleted));
            if (savedName) setOfficerName(savedName);
            if (savedHistory) setQueryHistory(JSON.parse(savedHistory));
            if (savedSql) setSqlCode(savedSql);

            // Restore or Create Badge ID
            if (savedBadge) {
                setBadgeId(savedBadge);
            } else {
                const newBadge = Math.floor(10000 + Math.random() * 90000).toString();
                localStorage.setItem('sqlpd_badgeId', newBadge);
                setBadgeId(newBadge);
            }

            setGameState('READY');
        }
    }, 100);

    return () => clearInterval(dbInitInterval);
  }, []);

  // 2. PERSISTENCE SAVER
  useEffect(() => {
    if (gameState === 'LOADING') return; // Don't save empty state during boot
    
    localStorage.setItem('sqlpd_currentCase', currentCaseIndex.toString());
    localStorage.setItem('sqlpd_completed', JSON.stringify(completedCases));
    localStorage.setItem('sqlpd_officerName', officerName);
    localStorage.setItem('sqlpd_queryHistory', JSON.stringify(queryHistory));
    localStorage.setItem('sqlpd_editorContent', sqlCode);
  }, [currentCaseIndex, completedCases, officerName, queryHistory, sqlCode, gameState]);

  // Reset hint/feedback on new case
  useEffect(() => {
      setHasUsedHint(false);
      setActiveHint('');
      setAnswerInput('');
      setQueryResult(null);
      setFeedback('');
      // We do NOT reset sqlCode here, giving users a scratchpad feeling across cases if they want
  }, [currentCaseIndex]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarCollapsed(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

  const currentCase = CASES[currentCaseIndex];

  const handleRunQuery = (sql: string) => {
    setIsExecuting(true);
    setQueryHistory(prev => [...prev, sql]);
    setFeedback(''); // Clear previous errors
    
    // Simulate network delay for realism
    setTimeout(() => {
        const result = runQuery(sql);
        setQueryResult(result);
        setIsExecuting(false);
    }, 300);
  };

  const handleFormatSql = () => {
      // Simple SQL formatting (indentation)
      const formatted = sqlCode
          .replace(/\s+/g, ' ')
          .replace(/\s*,\s*/g, ',\n  ')
          .replace(/\s*(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|GROUP BY|ORDER BY|LIMIT|HAVING)\s*/gi, '\n$1 ')
          .replace(/\(\s*/g, '(\n  ')
          .replace(/\s*\)/g, '\n)')
          .trim();
      setSqlCode(formatted);
  };

  const handleCaseSelect = (caseId: string) => {
      const index = CASES.findIndex(c => c.id === caseId);
      
      // Strict locking removed as per user request
      // Users can now jump to any level
      if (index !== -1) {
          setCurrentCaseIndex(index);
          setGameState('READY');
          if (window.innerWidth < 1024) {
              setIsSidebarCollapsed(true);
          }
      }
  };

  const confirmReset = () => {
      if (window.confirm("WARNING: This will wipe your badge history, profile, and reset all progress. Are you sure?")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  const requestHint = async () => {
      if (hasUsedHint) return;
      
      setHasUsedHint(true);
      setActiveHint("Decrypting clue from HQ...");
      
      let hintText = '';
      if (currentCase.hint) {
          hintText = currentCase.hint;
      } else {
          hintText = "💡 Review the case briefing carefully. Look for patterns in the data that match the crime description.";
      }
      setActiveHint(hintText);
  };

  const checkAnswer = async () => {
      if (!answerInput.trim()) return;
      
      setGameState('CHECKING');
      
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');

      const input = normalize(answerInput);
      const expected = normalize(currentCase.expectedAnswer);
      const solution = currentCase.solutionQuery ? normalize(currentCase.solutionQuery) : '';
      
      const isMatch = input === expected || (solution && input === solution);
      
      if (isMatch) {
          const review = "Case Solved! ✅ You've successfully completed this investigation. The suspect has been identified correctly.";
          setFeedback(review);
            
          setGameState('SOLVED_ANIMATION');
      } else {
          setGameState('FAILED');
          
          let failMessage = "Incorrect. The evidence does not match this conclusion.";
          
          if (queryResult) {
              if (queryResult.error) {
                   failMessage = "⚠️ SYSTEM ERROR: Your investigation is halted by a Syntax Error. Check the console output below for details.";
              } else if (queryResult.data.length === 0) {
                   failMessage = "🚫 NO EVIDENCE FOUND: Your query returned 0 rows. Try loosening your WHERE clauses or checking for typos in your conditions.";
              } else {
                   const rawData = JSON.stringify(queryResult.data).toLowerCase();
                   if (rawData.includes(expected)) {
                        failMessage = "🔍 TARGET SPOTTED: The correct answer is IN your query results! Review the table carefully and submit the exact value.";
                   } else {
                        failMessage = "❌ COLD TRAIL: The answer is NOT in your query results. You are looking at the wrong data. Try a different query.";
                   }
              }
          } else {
              failMessage = "🕵️‍♂️ NO DATA: You haven't run any queries yet. Use the SQL Editor to find evidence before guessing.";
          }
          
          setFeedback(failMessage);
      }
  };

  const advanceToNextLevel = () => {
    // 1. Mark current as completed if not already
    if (!completedCases.includes(currentCase.id)) {
        setCompletedCases(prev => [...prev, currentCase.id]);
    }

    // 2. Determine next step
    if (currentCaseIndex < CASES.length - 1) {
        // Unlock next case immediately in UI
        setGameState('READY');
        setCurrentCaseIndex(prev => prev + 1);
    } else {
        // Game Finished
        setGameState('SOLVED_ANIMATION'); // Triggers the "Mission Accomplished" view in render
    }
  };

  if (gameState === 'LOADING') {
    return (
        <div className="h-screen w-screen bg-terminal-bg flex flex-col items-center justify-center font-mono relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-terminal-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-terminal-border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"></div>
            <div className="flex flex-col items-center z-10">
                <div className="w-16 h-16 border-4 border-terminal-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="animate-pulse text-lg text-terminal-green font-bold tracking-[0.2em]">CONNECTING TO MAINFRAME...</div>
            </div>
        </div>
    );
  }

  // Solved View
  if (gameState === 'SOLVED_ANIMATION') {
    const isLastCase = currentCaseIndex === CASES.length - 1;
    // Check if we are truly done (includes checking completedCases updated state if it happened fast, 
    // but usually relying on local logic for 'Game Finished' view)
    const isGameFullyComplete = isLastCase && completedCases.includes(currentCase.id);

    return (
        <div className="h-full sm:h-screen w-screen bg-terminal-bg flex flex-col items-center justify-center font-mono text-center p-4 sm:p-8 space-y-6 animate-in fade-in duration-500 relative overflow-hidden text-terminal-text">
             {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-terminal-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-terminal-border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"></div>
            
            <div className="z-10 w-full max-w-3xl overflow-y-auto">
                {isGameFullyComplete ? (
                     <div className="space-y-4 sm:space-y-6 py-8">
                        <div className="inline-block p-4 rounded-full bg-yellow-500/10 border border-yellow-500/50 mb-2 sm:mb-4 animate-bounce">
                             <span className="text-3xl sm:text-4xl">🏆</span>
                        </div>
                        <h1 className="text-3xl sm:text-6xl font-bold text-yellow-500 mb-2 sm:mb-4 tracking-tighter">
                            MISSION ACCOMPLISHED
                        </h1>
                        <div className="text-terminal-text text-base sm:text-xl border border-yellow-500/20 p-4 sm:p-8 rounded-xl bg-gradient-to-br from-yellow-900/10 to-transparent backdrop-blur-sm">
                            <p className="font-bold mb-2">ALL INVESTIGATIONS CLOSED.</p>
                            <span className="text-xs sm:text-sm opacity-70 block">Congratulations, {officerName}. Your record has been permanently added to the hall of fame.</span>
                        </div>
                        <button 
                            onClick={confirmReset}
                            className="px-6 sm:px-8 py-2 sm:py-3 mt-4 sm:mt-8 text-xs sm:text-sm text-terminal-text hover:text-terminal-text border border-terminal-border rounded-lg hover:bg-terminal-surface transition-all"
                        >
                            Reset Career (Clear Data)
                        </button>
                     </div>
                ) : (
                    <div className="space-y-4 sm:space-y-8 py-8">
                        <h1 className="text-2xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-terminal-green to-emerald-800 mb-4 sm:mb-6 tracking-tight">
                            {currentCase.id.startsWith('academy') ? 'MODULE COMPLETE' : 'CASE CLOSED'}
                        </h1>
                        
                        <div className="bg-terminal-surface/90 backdrop-blur-xl p-4 sm:p-8 rounded-2xl border border-terminal-green/20 shadow-[0_0_30px_rgba(46,160,67,0.1)] w-full">
                            <div className="text-[10px] text-terminal-text opacity-50 mb-2 sm:mb-4 uppercase tracking-[0.2em] font-bold">Chief's Report</div>
                            <p className="text-sm sm:text-lg text-terminal-text whitespace-pre-wrap leading-relaxed">
                                {feedback || `Excellent work, ${officerName}. Your query logic was sound and the suspect has been apprehended.`}
                            </p>
                        </div>

                        <div className="flex justify-center gap-4 mt-6 sm:mt-10">
                            <button 
                                onClick={advanceToNextLevel}
                                className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-terminal-text text-terminal-bg font-bold text-sm sm:text-lg rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(100,100,100,0.3)] overflow-hidden w-full sm:w-auto"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isLastCase ? 'CLOSE FILE' : 'NEXT ASSIGNMENT'} 
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen md:h-[100dvh] w-screen overflow-hidden bg-terminal-bg text-terminal-text font-sans transition-colors duration-300">
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        badgeId={badgeId}
        completedCount={completedCases.length}
        totalCases={CASES.length}
        onReset={confirmReset}
        officerName={officerName}
        setOfficerName={setOfficerName}
      />

      <SchemaModal 
        isOpen={isSchemaOpen}
        onClose={() => setIsSchemaOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={queryHistory}
        onSelectQuery={setSqlCode}
      />

      <Notebook 
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        theme={theme}
      />

      <Sidebar 
        currentCase={currentCase} 
        completedCases={completedCases}
        onCaseSelect={handleCaseSelect} 
        badgeId={badgeId}
        officerName={officerName}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      {/* Mobile Sidebar Backdrop */}
      {!isSidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300" 
            onClick={() => setIsSidebarCollapsed(true)}
          />
      )}
      
    <div className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
        {/* Subtle Background Grid for the Workspace */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-terminal-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-terminal-border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 dark:opacity-[0.03] pointer-events-none"></div>

        {/* Header */}
        <div className="p-3 sm:p-6 border-b border-terminal-border bg-terminal-surface/80 dark:bg-terminal-bg/50 backdrop-blur-md z-10 transition-colors shadow-sm dark:shadow-none">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                <div className="flex-1 w-full flex items-start">
                    <button 
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="lg:hidden mr-4 mt-1 p-1 text-terminal-text/60 hover:text-terminal-text hover:bg-white/5 rounded transition-colors"
                    >
                        <IconMenu className="w-6 h-6" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            currentCase.difficulty === 'Easy' ? 'border-green-800 bg-green-900/20 text-green-500' :
                            currentCase.difficulty === 'Medium' ? 'border-yellow-800 bg-yellow-900/20 text-yellow-500' :
                            'border-red-800 bg-red-900/20 text-red-500'
                        }`}>
                            {currentCase.difficulty}
                        </span>
                        {completedCases.includes(currentCase.id) && (
                            <span className="text-[10px] font-bold bg-terminal-green text-black px-2 py-0.5 rounded">SOLVED</span>
                        )}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl sm:text-3xl font-bold text-terminal-text tracking-tight truncate">
                            {currentCase.title}
                        </h2>
                        <button 
                            onClick={() => setIsBriefingExpanded(!isBriefingExpanded)}
                            className="lg:hidden text-[10px] font-bold uppercase text-terminal-blue bg-terminal-blue/10 px-2 py-1 rounded"
                        >
                            {isBriefingExpanded ? 'COLLAPSE' : 'EXPAND'}
                        </button>
                    </div>
                    <div className={`
                        bg-terminal-surface/50 dark:bg-black/20 p-3 sm:p-5 rounded-xl border border-terminal-border dark:border-white/10 shadow-inner overflow-y-auto scrollbar-thin scrollbar-thumb-terminal-border dark:scrollbar-thumb-white/10 scrollbar-track-transparent transition-all duration-300
                        ${isBriefingExpanded ? 'max-h-[60vh]' : 'max-h-[12vh] sm:max-h-[28vh]'}
                    `}>
                        {currentCase.briefing.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                    <h3 key={i} className="text-terminal-blue text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-4 first:mt-0 mb-2 border-b border-terminal-blue/20 pb-1 sticky top-0 bg-terminal-bg/95 dark:bg-black/90 backdrop-blur-sm py-1 z-10">
                                        {part.slice(2, -2)}
                                    </h3>
                                );
                            }
                            if (!part.trim()) return null;
                            
                            // Detect Schema/ASCII tables (must have border characters)
                            if (part.includes('+---') && part.includes('|')) {
                                return (
                                    <div key={i} className="font-mono text-[10px] sm:text-xs leading-normal text-terminal-text/80 bg-terminal-surface dark:bg-black/40 p-2 sm:p-3 rounded border border-terminal-border dark:border-white/5 overflow-x-auto whitespace-pre mb-3 shadow-sm">
                                        {part.trim()}
                                    </div>
                                );
                            }
                            
                            // Regular text
                            return (
                                <p key={i} className="text-terminal-text/90 text-xs sm:text-sm leading-relaxed mb-3 whitespace-pre-wrap font-sans">
                                    {part.trim()}
                                </p>
                            );
                        })}
                    </div>
                    </div>
                </div>
                
                <div className="flex flex-row flex-wrap lg:flex-col items-end gap-2 shrink-0 w-full lg:w-auto">
                    <div className="flex gap-2 w-full lg:w-auto justify-end sm:justify-start">
                        <button 
                            onClick={() => setIsNotebookOpen(!isNotebookOpen)}
                            className={`
                                flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-2 active:scale-95
                                ${isNotebookOpen 
                                    ? 'bg-terminal-blue text-white border-terminal-blue shadow-lg shadow-terminal-blue/20' 
                                    : 'bg-terminal-surface border-terminal-border text-terminal-text/80 hover:text-terminal-text hover:bg-terminal-surface/80'}
                            `}
                        >
                            <IconEdit className="w-3 h-3" />
                            <span className="hidden xs:inline">NOTEBOOK</span>
                            <span className="xs:hidden">NOTES</span>
                        </button>
                        <button 
                            onClick={() => setIsSchemaOpen(true)}
                            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-terminal-surface border border-terminal-border hover:bg-white/5 transition-all text-terminal-text/80 hover:text-terminal-text active:scale-95"
                        >
                            <span className="hidden xs:inline">DATABASE</span>
                            <span className="xs:hidden">DB</span>
                        </button>
                        <button 
                            onClick={requestHint}
                            disabled={hasUsedHint || completedCases.includes(currentCase.id)}
                            className={`
                                flex-1 sm:flex-initial group relative px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all
                                ${hasUsedHint || completedCases.includes(currentCase.id)
                                    ? 'bg-transparent text-gray-500 border border-terminal-border cursor-default' 
                                    : 'bg-terminal-blue/10 text-terminal-blue border border-terminal-blue/30 hover:bg-terminal-blue/20 active:scale-95'}
                            `}
                        >
                            {hasUsedHint ? (
                                <>
                                    <span className="hidden xs:inline">HINT RECEIVED</span>
                                    <span className="xs:hidden">HINTED</span>
                                </>
                            ) : (
                                <>
                                    <span className="hidden xs:inline">REQUEST HINT</span>
                                    <span className="xs:hidden">HINT</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            {activeHint && (
                <div className="mt-2 sm:mt-4 p-3 sm:p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-yellow-500 text-xs sm:text-sm animate-in slide-in-from-top-2 flex gap-3">
                    <span className="font-bold shrink-0">💡 HINT:</span> 
                    <div className="flex-1">{activeHint}</div>
                </div>
            )}

            {gameState === 'FAILED' && (
                <div className="mt-2 sm:mt-4 p-3 sm:p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-red-500 text-xs sm:text-sm animate-in shake flex gap-3">
                    <span className="font-bold shrink-0">⛔ ERROR:</span> 
                    <div className="flex-1">{feedback}</div>
                </div>
            )}
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-h-0 z-0 overflow-y-auto lg:overflow-hidden">
            <SqlEditor 
                sql={sqlCode}
                onChange={setSqlCode}
                onRun={handleRunQuery} 
                isRunning={isExecuting}
                answerInput={answerInput}
                setAnswerInput={setAnswerInput}
                onSubmitAnswer={checkAnswer}
                isChecking={gameState === 'CHECKING'}
                onFormat={handleFormatSql}
                onShowHistory={() => setIsHistoryOpen(true)}
                theme={theme}
            />
            <ResultsTable result={queryResult} theme={theme} />
        </div>
      </div>
    </div>
  );
}

export default App;