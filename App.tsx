import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import SqlEditor from './components/SqlEditor';
import ResultsTable from './components/ResultsTable';
import ChatAssistant from './components/ChatAssistant';
import SettingsModal from './components/SettingsModal';
import SchemaModal from './components/SchemaModal';
import HistoryModal from './components/HistoryModal';
import { CASES } from './constants';
import { runQuery, initDB } from './services/dbService';
import { QueryResult } from './types';
import { submitCaseReview, getFastHint } from './services/geminiService';

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

  // Execution State
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState<string>('');
  
  // UI States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Hint State
  const [hasUsedHint, setHasUsedHint] = useState(false);
  const [activeHint, setActiveHint] = useState<string>('');

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
      }
  };

  const handleResetProgress = () => {
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
          hintText = await getFastHint("Give me a hint", currentCase.briefing);
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
          submitCaseReview(JSON.stringify(currentCase), answerInput, queryHistory)
            .then(review => setFeedback(review));
            
          setGameState('SOLVED_ANIMATION');
      } else {
          setGameState('FAILED');
          
          let failMessage = "Incorrect. The evidence does not match this conclusion.";
          
          if (queryResult) {
              if (queryResult.error) {
                   failMessage = "Your investigation is halted by a Syntax Error. Check the red error message in the table below.";
              } else if (queryResult.data.length === 0) {
                   failMessage = "Your query returned ZERO rows. You might be filtering too strictly or there is no matching data.";
              } else {
                   const rawData = JSON.stringify(queryResult.data).toLowerCase();
                   if (rawData.includes(expected)) {
                        failMessage = "Target Identified! The correct answer IS listed in your query results. Read the table carefully and submit the exact value.";
                   } else {
                        failMessage = "Query executed successfully, but the answer is NOT in the results. You are asking the wrong questions.";
                   }
              }
          } else {
              failMessage = "You haven't run any queries yet. Don't guess—investigate! Use the Query Console.";
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
        <div className="h-screen w-screen bg-terminal-bg flex flex-col items-center justify-center font-mono text-center p-8 space-y-6 animate-in fade-in duration-500 relative overflow-hidden text-terminal-text">
             {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-terminal-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-terminal-border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"></div>
            
            <div className="z-10 w-full max-w-3xl">
                {isGameFullyComplete ? (
                     <div className="space-y-6">
                        <div className="inline-block p-4 rounded-full bg-yellow-500/10 border border-yellow-500/50 mb-4 animate-bounce">
                             <span className="text-4xl">🏆</span>
                        </div>
                        <h1 className="text-6xl font-bold text-yellow-500 mb-4 tracking-tighter">
                            MISSION ACCOMPLISHED
                        </h1>
                        <div className="text-terminal-text text-xl border border-yellow-500/20 p-8 rounded-xl bg-gradient-to-br from-yellow-900/10 to-transparent backdrop-blur-sm">
                            <p className="font-bold mb-2">ALL INVESTIGATIONS CLOSED.</p>
                            <span className="text-sm opacity-70 block">Congratulations, {officerName}. Your record has been permanently added to the hall of fame.</span>
                        </div>
                        <button 
                            onClick={handleResetProgress}
                            className="px-8 py-3 mt-8 text-terminal-text hover:text-terminal-text border border-terminal-border rounded-lg hover:bg-terminal-surface transition-all"
                        >
                            Reset Career (Clear Data)
                        </button>
                     </div>
                ) : (
                    <>
                        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-terminal-green to-emerald-800 mb-6 tracking-tight">
                            {currentCase.id.startsWith('academy') ? 'MODULE COMPLETE' : 'CASE CLOSED'}
                        </h1>
                        
                        <div className="bg-terminal-surface/90 backdrop-blur-xl p-8 rounded-2xl border border-terminal-green/20 shadow-[0_0_30px_rgba(46,160,67,0.1)] w-full">
                            <div className="text-xs text-terminal-text opacity-50 mb-4 uppercase tracking-[0.2em] font-bold">Chief's Report</div>
                            <p className="text-lg text-terminal-text whitespace-pre-wrap leading-relaxed">
                                {feedback || `Excellent work, ${officerName}. Your query logic was sound and the suspect has been apprehended.`}
                            </p>
                        </div>

                        <div className="flex justify-center gap-4 mt-10">
                            <button 
                                onClick={advanceToNextLevel}
                                className="group relative px-8 py-4 bg-terminal-text text-terminal-bg font-bold text-lg rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(100,100,100,0.3)] overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isLastCase ? 'CLOSE FILE' : 'NEXT ASSIGNMENT'} 
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-terminal-bg text-terminal-text font-sans transition-colors duration-300">
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        badgeId={badgeId}
        completedCount={completedCases.length}
        totalCases={CASES.length}
        onReset={handleResetProgress}
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
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Subtle Background Grid for the Workspace */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-terminal-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-terminal-border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.03] pointer-events-none"></div>

        {/* Header */}
        <div className="p-6 border-b border-terminal-border bg-terminal-bg/50 backdrop-blur-sm z-10 transition-colors">
            <div className="flex justify-between items-start">
                <div className="flex-1 mr-4">
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
                    <h2 className="text-3xl font-bold text-terminal-text mb-4 tracking-tight">
                        {currentCase.title}
                    </h2>
                    <div className="bg-black/20 p-5 rounded-xl border border-white/10 shadow-inner max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {currentCase.briefing.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                    <h3 key={i} className="text-terminal-blue text-xs font-bold uppercase tracking-widest mt-4 first:mt-0 mb-2 border-b border-terminal-blue/20 pb-1 sticky top-0 bg-black/90 backdrop-blur-sm py-1 z-10">
                                        {part.slice(2, -2)}
                                    </h3>
                                );
                            }
                            if (!part.trim()) return null;
                            
                            // Detect Schema/ASCII tables (must have border characters)
                            if (part.includes('+---') && part.includes('|')) {
                                return (
                                    <div key={i} className="font-mono text-xs leading-normal text-terminal-text/80 bg-black/40 p-3 rounded border border-white/5 overflow-x-auto whitespace-pre mb-3 shadow-sm">
                                        {part.trim()}
                                    </div>
                                );
                            }
                            
                            // Regular text
                            return (
                                <p key={i} className="text-terminal-text/90 text-sm leading-relaxed mb-3 whitespace-pre-wrap font-sans">
                                    {part.trim()}
                                </p>
                            );
                        })}
                    </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsSchemaOpen(true)}
                            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-terminal-surface border border-terminal-border hover:bg-white/5 transition-all text-terminal-text/80 hover:text-terminal-text"
                        >
                            DATABASE
                        </button>
                        <button 
                            onClick={requestHint}
                            disabled={hasUsedHint || completedCases.includes(currentCase.id)}
                            className={`
                                group relative px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                                ${hasUsedHint || completedCases.includes(currentCase.id)
                                    ? 'bg-transparent text-gray-500 border border-terminal-border cursor-default' 
                                    : 'bg-terminal-blue/10 text-terminal-blue border border-terminal-blue/30 hover:bg-terminal-blue/20'}
                            `}
                        >
                            {hasUsedHint ? 'HINT RECEIVED' : 'REQUEST HINT'}
                        </button>
                    </div>
                </div>
            </div>
            
            {activeHint && (
                <div className="mt-4 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-yellow-500 text-sm animate-in slide-in-from-top-2 flex gap-3">
                    <span className="font-bold">💡 HINT:</span> 
                    {activeHint}
                </div>
            )}

            {gameState === 'FAILED' && (
                <div className="mt-4 p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-red-500 text-sm animate-in shake flex gap-3">
                    <span className="font-bold">⛔ ERROR:</span> 
                    {feedback}
                </div>
            )}
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-h-0 z-0">
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
            />
            <ResultsTable result={queryResult} />
        </div>
      </div>

      {/* Chat is fixed width on the right, could be collapsible too in future iterations */}
      <ChatAssistant 
        currentCase={currentCase}
        queryHistory={queryHistory}
        onCaseSolved={() => {
            if (!completedCases.includes(currentCase.id)) {
                 setGameState('SOLVED_ANIMATION');
            }
        }}
      />
    </div>
  );
}

export default App;