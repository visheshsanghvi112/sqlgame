export interface TableSchema {
    tableName: string;
    columns: { name: string; type: string }[];
}

export interface Case {
    id: string;
    title: string;
    description: string;
    briefing: string;
    objective: string;
    solutionQuery?: string; // Optional regex or simple check
    expectedAnswer: string; // The exact value user needs to submit (e.g., suspect name)
    hint: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QueryResult {
    columns: string[];
    data: any[];
    error?: string;
    executionTime?: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
    isThinking?: boolean;
}

export enum GameState {
    BOOT = 'BOOT',
    PLAYING = 'PLAYING',
    SOLVED = 'SOLVED'
}
