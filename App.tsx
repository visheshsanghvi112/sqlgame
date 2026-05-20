import React, { useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
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
  const [sqlCode, setSqlCode] = useState<string>(''); 

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
      return (localStorage.getItem('sqlpd_theme') as 'dark' | 'light') || 'dark';
  });

  // Theme Effect
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
    setTheme((prev: 'dark' | 'light') => prev === 'dark' ? 'light' : 'dark');
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
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  // Hint State
  const [hasUsedHint, setHasUsedHint] = useState(false);
  const [activeHint, setActiveHint] = useState<string>('');

  // 1. INITIALIZATION & RESTORE
  useEffect(() => {
    const dbInitInterval = setInterval(() => {
        if (window.alasql) {
            clearInterval(dbInitInterval);
            initDB();
            
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
    if (gameState === 'LOADING') return;
    
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
  }, [currentCaseIndex]);

    useEffect(() => {
        const handleResize = () => {
            const isNowDesktop = window.innerWidth >= 1024;
            setIsDesktop(isNowDesktop);
            if (!isNowDesktop) {
                setIsSidebarCollapsed(true);
            } else {
                setIsSidebarCollapsed(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

  const currentCase = CASES[currentCaseIndex];

  const handleRunQuery = (sql: string) => {
    setIsExecuting(true);
    setQueryHistory((prev: string[]) => [...prev, sql]);
    setFeedback('');
    
    setTimeout(() => {
        const result = runQuery(sql);
        setQueryResult(result);
        setIsExecuting(false);
    }, 300);
  };

  const handleFormatSql = () => {
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
      if (index !== -1) {
          setCurrentCaseIndex(index);
          setGameState('READY');
          // Close sidebar on mobile after selection
          if (!isDesktop) {
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
      setActiveHint(currentCase.hint || "Clue: Review the data patterns matching the crime description.");
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
          setFeedback("Mission AccomplISHED! Great work, Detective.");
          setGameState('SOLVED_ANIMATION');
      } else {
          setGameState('FAILED');
          let failMessage = "Not quite, Detective. Keep digging—the answer is in the data!";
          if (queryResult) {
              if (queryResult.error) failMessage = "🛠️ SYSTEM GLITCH: SQL syntax error.";
              else if (queryResult.data.length === 0) failMessage = "🕳️ DEAD END: Zero results.";
              else if (JSON.stringify(queryResult.data).toLowerCase().includes(expected)) failMessage = "🌟 SO CLOSE! Answer is in your results.";
          }
          setFeedback(failMessage);
      }
  };

  const advanceToNextLevel = () => {
    if (!completedCases.includes(currentCase.id)) {
        setCompletedCases((prev) => [...prev, currentCase.id]);
    }
    if (currentCaseIndex < CASES.length - 1) {
        setGameState('READY');
        setCurrentCaseIndex((prev) => prev + 1);
    } else {
        setGameState('SOLVED_ANIMATION');
    }
  };

  const renderHeaderAndBriefing = () => (
    <div className="h-full overflow-y-auto p-3 sm:p-6 border-b border-terminal-border bg-terminal-surface/80 dark:bg-terminal-bg/50 backdrop-blur-md z-10 transition-colors shadow-sm dark:shadow-none">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div className="flex-1 w-full flex items-start">
              {!isDesktop && (
                  <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="mr-4 mt-1 p-1 text-terminal-text/60 hover:text-terminal-text hover:bg-white/5 rounded transition-colors">
                      <IconMenu className="w-6 h-6" />
                  </button>
              )}
              <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        currentCase.difficulty === 'Easy' ? 'border-green-800 bg-green-900/20 text-green-500' :
                        currentCase.difficulty === 'Medium' ? 'border-yellow-800 bg-yellow-900/20 text-yellow-500' :
                        'border-red-800 bg-red-900/20 text-red-500'
                    }`}>
                        {currentCase.difficulty}
                    </span>
                    {completedCases.includes(currentCase.id) && <span className="text-[10px] font-bold bg-terminal-green text-black px-2 py-0.5 rounded">SOLVED</span>}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl sm:text-3xl font-bold text-terminal-text tracking-tight truncate pr-4">{currentCase.title}</h2>
                      <div className="flex gap-2">
                          <button onClick={() => setIsNotebookOpen(true)} className="text-[10px] font-bold uppercase text-terminal-blue bg-terminal-blue/10 px-2 py-1 rounded flex items-center gap-1 shadow-sm border border-terminal-blue/10 active:scale-95 transition-all">
                              <IconEdit className="w-3 h-3" />
                              <span className="hidden sm:inline">Notes</span>
                          </button>
                          <button onClick={() => setIsBriefingExpanded(!isBriefingExpanded)} className="lg:hidden text-[10px] font-bold uppercase text-terminal-blue bg-terminal-blue/10 px-2 py-1 rounded shadow-sm border border-terminal-blue/10 active:scale-95 transition-all">
                              {isBriefingExpanded ? 'Hide Info' : 'Show Info'}
                          </button>
                      </div>
                  </div>
                  <div className={`bg-terminal-surface/50 dark:bg-black/20 p-3 sm:p-5 rounded-xl border border-terminal-border dark:border-white/10 shadow-inner overflow-y-auto scrollbar-thin transition-all duration-300 ${isBriefingExpanded ? 'max-h-none' : 'max-h-[12vh] sm:max-h-[28vh]'}`}>
                      {currentCase.briefing.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) return <h3 key={i} className="text-terminal-blue text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-4 first:mt-0 mb-2 border-b border-terminal-blue/20 pb-1 sticky top-0 bg-terminal-bg/95 dark:bg-black/90 backdrop-blur-sm py-1 z-10">{part.slice(2, -2)}</h3>;
                          if (!part.trim()) return null;
                          if (part.includes('+---') && part.includes('|')) return <div key={i} className="font-mono text-[10px] sm:text-xs leading-normal text-terminal-text/80 bg-terminal-surface dark:bg-black/40 p-2 sm:p-3 rounded border border-terminal-border dark:border-white/5 overflow-x-auto whitespace-pre mb-3 shadow-sm">{part.trim()}</div>;
                          return <p key={i} className="text-terminal-text/90 text-xs sm:text-sm leading-relaxed mb-3 whitespace-pre-wrap font-sans">{part.trim()}</p>;
                      })}
                  </div>
              </div>
          </div>
          <div className="flex flex-row flex-wrap lg:flex-col items-end gap-2 shrink-0 w-full lg:w-auto mt-2 lg:mt-0">
              <div className="flex gap-2 w-full lg:w-auto justify-end">
                  <button onClick={() => setIsNotebookOpen(!isNotebookOpen)} className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-2 active:scale-95 ${isNotebookOpen ? 'bg-terminal-blue text-white border-terminal-blue shadow-lg shadow-terminal-blue/20' : 'bg-terminal-surface border-terminal-border text-terminal-text/80 hover:bg-terminal-surface-light'}`}>
                      <IconEdit className="w-3 h-3" />
                      <span className="hidden xs:inline">NOTEBOOK</span>
                      <span className="xs:hidden">NOTES</span>
                  </button>
                  <button onClick={() => setIsSchemaOpen(true)} className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-terminal-surface border border-terminal-border hover:bg-white/5 transition-all text-terminal-text/80 hover:text-terminal-text active:scale-95">
                      <span className="hidden xs:inline">DATABASE</span>
                      <span className="xs:hidden">DB</span>
                  </button>
                  <button onClick={requestHint} disabled={hasUsedHint || completedCases.includes(currentCase.id)} className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${hasUsedHint || completedCases.includes(currentCase.id) ? 'bg-transparent text-gray-500 border border-terminal-border' : 'bg-terminal-blue/10 text-terminal-blue border border-terminal-blue/30 hover:bg-terminal-blue/20 active:scale-95'}`}>
                      {hasUsedHint ? 'HINTED' : 'HINT'}
                  </button>
              </div>
          </div>
      </div>
      {activeHint && (
          <div className="mt-4 p-4 rounded-xl bg-blue-900/10 border-2 border-blue-500/20 text-blue-100 text-xs sm:text-sm animate-in slide-in-from-bottom-2 flex gap-4 items-center relative shadow-lg">
              <span className="text-xl">💡</span>
              <div className="flex-1"><div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">Intelligence Hint</div><div className="font-medium leading-relaxed">{activeHint}</div></div>
              <button onClick={() => setActiveHint('')} className="p-1 rounded-lg hover:bg-blue-500/20 text-blue-500/40 hover:text-blue-200 transition-all">✕</button>
          </div>
      )}
      {gameState === 'FAILED' && (
          <div className="mt-4 p-4 rounded-xl bg-red-950/20 border-2 border-red-500/30 text-red-100 text-xs sm:text-sm animate-in slide-in-from-bottom-2 flex gap-4 items-center relative shadow-lg">
              <span className="text-xl">🕵️‍♂️</span>
              <div className="flex-1"><div className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">Investigation Report</div><div className="font-medium leading-relaxed">{feedback}</div></div>
              <button onClick={() => setFeedback('')} className="p-1 rounded-lg hover:bg-red-500/20 text-red-500/40 hover:text-red-200 transition-all">✕</button>
          </div>
      )}
    </div>
  );

  const renderSqlEditor = () => (
    <SqlEditor sql={sqlCode} onChange={setSqlCode} onRun={handleRunQuery} isRunning={isExecuting} answerInput={answerInput} setAnswerInput={setAnswerInput} onSubmitAnswer={checkAnswer} isChecking={gameState === 'CHECKING'} onFormat={handleFormatSql} onShowHistory={() => setIsHistoryOpen(true)} theme={theme} />
  );

  const renderMainWorkspace = () => {
    const mainContent = (
      <div className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-terminal-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-terminal-border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 dark:opacity-[0.03] pointer-events-none"></div>
        {isDesktop ? (
          <PanelGroup direction="vertical" className="h-full">
            <Panel defaultSize={35} minSize={20}>{renderHeaderAndBriefing()}</Panel>
            <PanelResizeHandle className="flex h-1 hover:bg-terminal-blue/40 transition-colors cursor-row-resize items-center justify-center bg-terminal-border/10"><div className="h-px w-8 bg-terminal-border opacity-30" /></PanelResizeHandle>
            <Panel defaultSize={65}>
                <PanelGroup direction="vertical">
                    <Panel defaultSize={55} minSize={25}>{renderSqlEditor()}</Panel>
                    <PanelResizeHandle className="flex h-1.5 hover:bg-terminal-blue/40 transition-colors cursor-row-resize items-center justify-center bg-terminal-border/10 border-b border-terminal-border/20"><div className="h-px w-8 bg-terminal-border opacity-30" /></PanelResizeHandle>
                    <Panel defaultSize={45}><ResultsTable result={queryResult} theme={theme} /></Panel>
                </PanelGroup>
            </Panel>
          </PanelGroup>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
             <div className="flex-[0_0_auto] max-h-[40vh] overflow-y-auto">{renderHeaderAndBriefing()}</div>
             <div className="flex-1 flex flex-col overflow-hidden border-t border-terminal-border">
                <div className="flex-1 overflow-hidden">{renderSqlEditor()}</div>
                <div className="h-1/2 border-t border-terminal-border overflow-hidden"><ResultsTable result={queryResult} theme={theme} /></div>
             </div>
          </div>
        )}
      </div>
    );

    if (!isDesktop) return mainContent;

    return (
      <PanelGroup direction="horizontal" className="h-full w-full">
        <Panel defaultSize={25} minSize={15} maxSize={35} collapsible onCollapse={() => setIsSidebarCollapsed(true)} onExpand={() => setIsSidebarCollapsed(false)} className="border-r border-terminal-border">
          <Sidebar currentCase={currentCase} completedCases={completedCases} onCaseSelect={handleCaseSelect} badgeId={badgeId} officerName={officerName} isCollapsed={false} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} onOpenSettings={() => setIsSettingsOpen(true)} theme={theme} toggleTheme={toggleTheme} />
        </Panel>
        <PanelResizeHandle className="flex w-1.5 hover:bg-terminal-blue/40 transition-colors cursor-col-resize items-center justify-center bg-terminal-border/5"><div className="w-px h-8 bg-terminal-border opacity-30" /></PanelResizeHandle>
        <Panel defaultSize={75}>{mainContent}</Panel>
      </PanelGroup>
    );
  };

  if (gameState === 'LOADING') {
    return (
        <div className="h-screen w-screen bg-terminal-bg flex flex-col items-center justify-center font-mono relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-terminal-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-terminal-border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"></div>
            <div className="flex flex-col items-center z-10"><div className="w-16 h-16 border-4 border-terminal-blue border-t-transparent rounded-full animate-spin mb-4" /><div className="animate-pulse text-lg text-terminal-blue font-bold tracking-[0.2em] uppercase">Bypassing Encryption...</div></div>
        </div>
    );
  }

  if (gameState === 'SOLVED_ANIMATION') {
    const isLastCase = currentCaseIndex === CASES.length - 1;
    const isGameFullyComplete = isLastCase && completedCases.includes(currentCase.id);
    return (
        <div className="h-full sm:h-screen w-screen bg-terminal-bg flex flex-col items-center justify-center font-mono text-center p-4 sm:p-8 space-y-6 animate-in fade-in duration-500 relative overflow-hidden text-terminal-text">
            <div className="absolute inset-0 bg-grid opacity-10"></div>
            <div className="z-10 w-full max-w-3xl overflow-y-auto">
                <h1 className="text-3xl sm:text-6xl font-bold text-yellow-500 mb-4 tracking-tighter">{isGameFullyComplete ? 'MISSION ACCOMPLISHED' : 'CASE CLOSED'}</h1>
                <div className="bg-terminal-surface/90 backdrop-blur-xl p-8 rounded-2xl border border-terminal-green/20"><p className="text-sm sm:text-lg">{feedback || "Great work, Detective."}</p></div>
                <button onClick={advanceToNextLevel} className="mt-8 px-12 py-4 bg-terminal-green text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-all">{isLastCase ? 'CLOSE FILE' : 'NEXT ASSIGNMENT'} →</button>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-terminal-bg text-terminal-text font-sans transition-colors duration-300">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} badgeId={badgeId} completedCount={completedCases.length} totalCases={CASES.length} onReset={confirmReset} officerName={officerName} setOfficerName={setOfficerName} />
      <SchemaModal isOpen={isSchemaOpen} onClose={() => setIsSchemaOpen(false)} />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={queryHistory} onSelectQuery={setSqlCode} />
      <Notebook isOpen={isNotebookOpen} onClose={() => setIsNotebookOpen(false)} theme={theme} />
      
      {!isDesktop && (
          <Sidebar currentCase={currentCase} completedCases={completedCases} onCaseSelect={handleCaseSelect} badgeId={badgeId} officerName={officerName} isCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} onOpenSettings={() => setIsSettingsOpen(true)} theme={theme} toggleTheme={toggleTheme} />
      )}

      {renderMainWorkspace()}
      
      {!isDesktop && !isSidebarCollapsed && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300" onClick={() => setIsSidebarCollapsed(true)} />
      )}
    </div>
  );
}

export default App;