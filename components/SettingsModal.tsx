import React, { useState, useEffect } from 'react';
import { IconX, IconUser, IconCheck, IconSettings } from './Icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    badgeId: string;
    completedCount: number;
    totalCases: number;
    onReset: () => void;
    officerName: string;
    setOfficerName: (name: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    badgeId, 
    completedCount, 
    totalCases, 
    onReset,
    officerName,
    setOfficerName
}) => {
    const [nameInput, setNameInput] = useState(officerName);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setNameInput(officerName);
        setIsSaved(false);
    }, [officerName, isOpen]);

    const handleSaveName = () => {
        if (nameInput.trim()) {
            setOfficerName(nameInput.trim());
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        }
    };

    if (!isOpen) return null;

    // Calculate Rank
    let rank = 'Probationary Rookie';
    if (completedCount > 2) rank = 'Junior Detective';
    if (completedCount > 5) rank = 'Senior Detective';
    if (completedCount > 10) rank = 'Lieutenant';
    if (completedCount === totalCases) rank = 'Chief of Data';

    const progressPercentage = Math.round((completedCount / totalCases) * 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/20 dark:bg-black/80 backdrop-blur-sm transition-colors" 
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-terminal-surface dark:bg-terminal-bg border border-terminal-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-terminal-border bg-terminal-bg/50 dark:bg-terminal-surface/50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-terminal-text flex items-center gap-2">
                        <IconSettings className="w-5 h-5 text-terminal-blue" />
                        System Configuration
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-terminal-border/20 rounded-full transition-colors"
                    >
                        <IconX className="w-5 h-5 text-terminal-text/60" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 bg-terminal-surface dark:bg-terminal-bg">
                    {/* ID Card Look */}
                    <div className="bg-terminal-bg/50 dark:bg-terminal-surface p-4 rounded-lg border border-terminal-border flex items-center gap-4 shadow-sm">
                        <div className="w-16 h-16 bg-terminal-blue/10 dark:bg-terminal-blue/20 rounded-full flex items-center justify-center border-2 border-terminal-blue relative overflow-hidden shrink-0">
                            <IconUser className="w-8 h-8 text-terminal-blue" />
                            {/* Scanline effect - only in dark mode */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-terminal-blue/20 to-transparent animate-scan hidden dark:block"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div className="text-xs uppercase text-terminal-text/70 dark:text-terminal-text/50 tracking-wider mb-1 font-bold">Badge Number</div>
                                <div className="text-[10px] uppercase text-terminal-green border border-terminal-green/30 px-1.5 rounded bg-terminal-green/10 font-bold">Active</div>
                            </div>
                            <div className="text-xl font-mono text-terminal-text font-bold tracking-widest mb-2">#{badgeId}</div>
                            
                            {/* Editable Name */}
                            <div className="relative flex gap-2">
                                <input 
                                    type="text" 
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    maxLength={20}
                                    className="w-full bg-white dark:bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-sm text-terminal-text focus:border-terminal-blue focus:ring-1 focus:ring-terminal-blue focus:outline-none transition-all shadow-sm"
                                    placeholder="Enter Name"
                                />
                                <button 
                                    onClick={handleSaveName}
                                    className="p-1.5 bg-white dark:bg-terminal-bg hover:bg-terminal-border/20 rounded text-xs border border-terminal-border transition-colors group shrink-0 shadow-sm"
                                    title="Save Name"
                                >
                                    {isSaved ? <IconCheck className="w-4 h-4 text-terminal-green" /> : <span className="text-[10px] font-bold px-1 text-terminal-text/60 group-hover:text-terminal-text">SAVE</span>}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div>
                        <h3 className="text-xs uppercase text-terminal-text/70 dark:text-terminal-text/50 font-bold mb-3 tracking-widest">Career Progress</h3>
                        <div className="bg-terminal-bg/30 dark:bg-terminal-surface/50 p-4 rounded border border-terminal-border/50 space-y-3 shadow-sm">
                            <div className="flex justify-between text-sm">
                                <span className="text-terminal-text/80 dark:text-terminal-text/60 font-medium">Current Rank</span>
                                <span className="text-terminal-blue font-bold">{rank}</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-terminal-text/70 dark:text-terminal-text/50">
                                    <span>Clearance Level</span>
                                    <span>{progressPercentage}%</span>
                                </div>
                                <div className="w-full h-2 bg-terminal-border/20 dark:bg-terminal-bg rounded-full overflow-hidden border border-terminal-border/30">
                                    <div 
                                        className="h-full bg-gradient-to-r from-terminal-blue to-terminal-green transition-all duration-1000"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="flex justify-between text-xs pt-2 border-t border-terminal-border/30">
                                <span className="text-terminal-text/70 dark:text-terminal-text/50">Cases Solved</span>
                                <span className="font-mono text-terminal-text font-bold">{completedCount} <span className="text-terminal-text/40">/</span> {totalCases}</span>
                            </div>
                        </div>
                    </div>

                    {/* Settings Actions */}
                    <div className="pt-2">
                        <h3 className="text-xs uppercase text-terminal-text/70 dark:text-terminal-text/50 font-bold mb-3 tracking-widest">Danger Zone</h3>
                        
                        <button 
                            onClick={onReset}
                            className="w-full flex items-center justify-between p-3 rounded bg-white dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-500/40 transition-all group shadow-sm"
                        >
                            <span className="flex items-center gap-2">
                                <IconX className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                <span className="font-medium">Reset Career Data</span>
                            </span>
                            <span className="text-[10px] font-bold opacity-60 group-hover:opacity-100 bg-red-100 dark:bg-red-500/20 px-1.5 py-0.5 rounded">IRREVERSIBLE</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-terminal-bg/50 dark:bg-terminal-surface/50 border-t border-terminal-border text-center">
                    <button 
                        onClick={onClose}
                        className="text-xs font-bold text-terminal-text/60 hover:text-terminal-text transition-colors uppercase tracking-widest"
                    >
                        Close Terminal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
