import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Case } from '../types';
import { getFastHint, getKnowledgeHelp, submitCaseReview } from '../services/geminiService';
import { IconUser, IconCheck } from './Icons';

interface ChatAssistantProps {
    currentCase: Case;
    queryHistory: string[];
    onCaseSolved: () => void;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ currentCase, queryHistory, onCaseSolved }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { 
            id: '1', 
            role: 'model', 
            text: `Detective, I'm your AI partner. I can help with SQL syntax or give you clues.`, 
            timestamp: Date.now() 
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Determine intent
            const lowerInput = input.toLowerCase();
            let aiResponseText = '';

            if (lowerInput.startsWith('solve:')) {
                // SUBMIT ANSWER -> GEMINI 3 PRO (Thinking)
                const answer = input.substring(6).trim();
                
                // Add a placeholder for thinking
                setMessages(prev => [...prev, {
                    id: 'thinking',
                    role: 'model',
                    text: "Analyzing case files and cross-referencing evidence...",
                    timestamp: Date.now(),
                    isThinking: true
                }]);

                const review = await submitCaseReview(
                    JSON.stringify(currentCase),
                    answer,
                    queryHistory
                );

                const isCorrect = answer.toLowerCase() === currentCase.expectedAnswer.toLowerCase();
                
                setMessages(prev => prev.filter(m => m.id !== 'thinking')); // Remove thinking placeholder
                
                aiResponseText = review;
                
                if (isCorrect) {
                     setTimeout(onCaseSolved, 3000);
                }

            } else if (lowerInput.includes('how to') || lowerInput.includes('syntax') || lowerInput.includes('what is')) {
                // SQL HELP -> GEMINI 3 FLASH (Search Grounding)
                const { text, sources } = await getKnowledgeHelp(input);
                aiResponseText = text;
                if (sources.length > 0) {
                    aiResponseText += `\n\nSources:\n${sources.map(s => `- ${s}`).join('\n')}`;
                }

            } else if (lowerInput.includes('hint')) {
                // STATIC HINT + AI FLAVOR
                if (currentCase.hint) {
                    aiResponseText = `I found a note in the case file that might help:\n\n"${currentCase.hint}"`;
                } else {
                    const hint = await getFastHint(input, currentCase.briefing);
                    aiResponseText = hint;
                }
            } else {
                // HINT -> GEMINI 2.5 FLASH LITE (Fast)
                const hint = await getFastHint(input, currentCase.briefing);
                aiResponseText = hint;
            }

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: aiResponseText,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: "Communication error. Try again.",
                timestamp: Date.now()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-terminal-bg border-l border-terminal-border w-80 lg:w-96 transition-colors shadow-xl z-20">
            <div className="p-4 border-b border-terminal-border bg-terminal-surface/50 backdrop-blur-md flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse"></div>
                <h2 className="text-terminal-text font-bold uppercase text-xs tracking-widest">AI Field Partner</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-terminal-border/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`
                                w-6 h-6 rounded-full flex items-center justify-center shrink-0 border
                                ${msg.role === 'user' 
                                    ? 'bg-terminal-blue/20 border-terminal-blue/50 text-terminal-blue' 
                                    : 'bg-terminal-green/20 border-terminal-green/50 text-terminal-green'}
                            `}>
                                {msg.role === 'user' ? <IconUser className="w-3 h-3" /> : <span className="text-[10px] font-bold">AI</span>}
                            </div>

                            {/* Bubble */}
                            <div 
                                className={`
                                    max-w-[240px] p-3 rounded-2xl text-xs leading-relaxed shadow-sm border
                                    ${msg.role === 'user' 
                                        ? 'bg-terminal-blue/10 text-terminal-text border-terminal-blue/20 rounded-br-none' 
                                        : 'bg-terminal-surface text-terminal-text border-terminal-border rounded-bl-none'}
                                    ${msg.isThinking ? 'animate-pulse' : ''}
                                `}
                            >
                                {msg.text}
                            </div>
                        </div>
                        <span className="text-[9px] text-terminal-text/30 mt-1 px-9">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-terminal-border bg-terminal-surface/30 backdrop-blur-sm">
                <div className="flex gap-2 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask for hint..."
                        className="flex-1 bg-terminal-bg border border-terminal-border rounded-full px-4 py-2 text-sm text-terminal-text focus:outline-none focus:border-terminal-blue font-mono transition-colors shadow-inner placeholder:text-terminal-text/30"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className={`
                            p-2 rounded-full transition-all shadow-sm flex items-center justify-center w-10 h-10
                            ${isLoading || !input.trim() 
                                ? 'bg-terminal-surface text-terminal-text/30 cursor-not-allowed' 
                                : 'bg-terminal-blue text-white hover:bg-terminal-blue/90 hover:scale-105'}
                        `}
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <span className="text-xs">➤</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatAssistant;