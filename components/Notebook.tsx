import React, { useState, useEffect } from 'react';
import { IconTrash, IconPlus, IconCheck, IconX, IconEdit } from './Icons';

interface Note {
    id: string;
    content: string;
    timestamp: number;
    type: 'text' | 'evidence';
}

interface NotebookProps {
    isOpen: boolean;
    onClose: () => void;
    theme: 'light' | 'dark';
}

const Notebook: React.FC<NotebookProps> = ({ isOpen, onClose, theme }) => {
    const [notes, setNotes] = useState<Note[]>(() => {
        const saved = localStorage.getItem('sqlpd_notebook');
        return saved ? JSON.parse(saved) : [];
    });
    const [newNote, setNewNote] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        localStorage.setItem('sqlpd_notebook', JSON.stringify(notes));
    }, [notes]);

    const addNote = () => {
        if (!newNote.trim()) return;
        const note: Note = {
            id: Date.now().toString(),
            content: newNote,
            timestamp: Date.now(),
            type: 'text'
        };
        setNotes([note, ...notes]);
        setNewNote('');
        setIsAdding(false);
    };

    const deleteNote = (id: string) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-16 bottom-0 w-80 bg-terminal-surface dark:bg-terminal-surface border-l border-terminal-border shadow-2xl z-40 flex flex-col transition-transform duration-300 transform translate-x-0">
            <div className="p-4 border-b border-terminal-border flex justify-between items-center bg-white/50 dark:bg-terminal-bg/50 backdrop-blur-sm">
                <h2 className="text-sm font-bold uppercase tracking-widest text-terminal-text flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.6)]"></span>
                    Detective's Notebook
                </h2>
                <button onClick={onClose} className="text-terminal-text/40 hover:text-terminal-text transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded">
                    <IconX className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-terminal-border/50 bg-slate-50 dark:bg-terminal-bg/20">
                {isAdding ? (
                    <div className="bg-white dark:bg-terminal-bg p-3 rounded-lg border border-terminal-blue/50 shadow-lg animate-in fade-in zoom-in-95 duration-200 ring-1 ring-terminal-blue/20">
                        <textarea
                            autoFocus
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Enter your observation..."
                            className="w-full bg-transparent text-sm font-mono text-terminal-text focus:outline-none resize-none h-24 placeholder:text-terminal-text/30"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    addNote();
                                }
                            }}
                        />
                        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-terminal-border/20">
                            <button 
                                onClick={() => setIsAdding(false)}
                                className="p-1.5 rounded text-terminal-text/40 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                <IconX className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={addNote}
                                className="p-1.5 rounded text-terminal-blue hover:text-white hover:bg-terminal-blue transition-colors"
                            >
                                <IconCheck className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="w-full py-3 border-2 border-dashed border-terminal-border/40 rounded-lg text-terminal-text/50 hover:text-terminal-blue hover:border-terminal-blue/50 hover:bg-terminal-blue/5 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider group"
                    >
                        <div className="p-1 rounded-full bg-terminal-border/20 group-hover:bg-terminal-blue/20 transition-colors">
                            <IconPlus className="w-3 h-3" />
                        </div>
                        Add New Note
                    </button>
                )}

                {notes.map(note => (
                    <div key={note.id} className="group relative bg-white dark:bg-terminal-bg p-4 rounded-lg border border-terminal-border/60 hover:border-terminal-blue/40 transition-all shadow-sm hover:shadow-md">
                        <div className="text-[10px] text-terminal-text/40 font-mono mb-2 flex justify-between items-center border-b border-terminal-border/10 pb-1">
                            <span>{new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <button 
                                onClick={() => deleteNote(note.id)}
                                className="opacity-0 group-hover:opacity-100 text-terminal-text/30 hover:text-red-500 transition-all p-1 hover:bg-red-500/10 rounded"
                            >
                                <IconTrash className="w-3 h-3" />
                            </button>
                        </div>
                        <p className="text-sm text-terminal-text/90 whitespace-pre-wrap font-sans leading-relaxed">
                            {note.content}
                        </p>
                        {note.type === 'evidence' && (
                            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] ring-2 ring-white dark:ring-terminal-bg"></div>
                        )}
                    </div>
                ))}

                {notes.length === 0 && !isAdding && (
                    <div className="text-center text-terminal-text/30 text-xs italic py-12 flex flex-col items-center gap-2">
                        <IconEdit className="w-8 h-8 opacity-20" />
                        <p>No notes yet. Record your findings here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notebook;
