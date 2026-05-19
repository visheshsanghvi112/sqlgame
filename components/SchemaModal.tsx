import React, { useState } from 'react';
import { X, Database, Table, Key, Link as LinkIcon, ArrowRight } from 'lucide-react';

interface SchemaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ColumnDef {
    name: string;
    type: string;
    isPrimaryKey?: boolean;
    foreignKey?: {
        table: string;
        column: string;
    };
}

interface TableDef {
    tableName: string;
    description?: string;
    columns: ColumnDef[];
}

const SCHEMA_DEFINITIONS: TableDef[] = [
    {
        tableName: 'crime_scene_report',
        description: 'Initial reports of crimes',
        columns: [
            { name: 'date', type: 'INT' },
            { name: 'type', type: 'VARCHAR' },
            { name: 'description', type: 'VARCHAR' },
            { name: 'city', type: 'VARCHAR' },
        ]
    },
    {
        tableName: 'drivers_license',
        description: 'DMV records for drivers',
        columns: [
            { name: 'id', type: 'INT', isPrimaryKey: true },
            { name: 'age', type: 'INT' },
            { name: 'height', type: 'INT' },
            { name: 'eye_color', type: 'VARCHAR' },
            { name: 'hair_color', type: 'VARCHAR' },
            { name: 'gender', type: 'VARCHAR' },
            { name: 'plate_number', type: 'VARCHAR' },
            { name: 'car_make', type: 'VARCHAR' },
            { name: 'car_model', type: 'VARCHAR' },
        ]
    },
    {
        tableName: 'person',
        description: 'Central registry of all citizens',
        columns: [
            { name: 'id', type: 'INT', isPrimaryKey: true },
            { name: 'name', type: 'VARCHAR' },
            { name: 'license_id', type: 'INT', foreignKey: { table: 'drivers_license', column: 'id' } },
            { name: 'address_number', type: 'INT' },
            { name: 'address_street_name', type: 'VARCHAR' },
            { name: 'ssn', type: 'VARCHAR', foreignKey: { table: 'income', column: 'ssn' } },
        ]
    },
    {
        tableName: 'income',
        description: 'Financial records linked by SSN',
        columns: [
            { name: 'ssn', type: 'VARCHAR', isPrimaryKey: true },
            { name: 'annual_income', type: 'INT' },
        ]
    },
    {
        tableName: 'interview',
        description: 'Transcripts of witness interviews',
        columns: [
            { name: 'person_id', type: 'INT', foreignKey: { table: 'person', column: 'id' } },
            { name: 'transcript', type: 'VARCHAR' },
        ]
    },
    {
        tableName: 'facebook_event_checkin',
        description: 'Social media event attendance',
        columns: [
            { name: 'person_id', type: 'INT', foreignKey: { table: 'person', column: 'id' } },
            { name: 'event_id', type: 'INT' },
            { name: 'event_name', type: 'VARCHAR' },
            { name: 'date', type: 'INT' },
        ]
    },
    {
        tableName: 'get_fit_now_member',
        description: 'Gym membership roster',
        columns: [
            { name: 'id', type: 'VARCHAR', isPrimaryKey: true },
            { name: 'person_id', type: 'INT', foreignKey: { table: 'person', column: 'id' } },
            { name: 'name', type: 'VARCHAR' },
            { name: 'membership_start_date', type: 'INT' },
            { name: 'membership_status', type: 'VARCHAR' },
        ]
    },
    {
        tableName: 'get_fit_now_check_in',
        description: 'Gym entry/exit logs',
        columns: [
            { name: 'membership_id', type: 'VARCHAR', foreignKey: { table: 'get_fit_now_member', column: 'id' } },
            { name: 'check_in_date', type: 'INT' },
            { name: 'check_in_time', type: 'INT' },
            { name: 'check_out_time', type: 'INT' },
        ]
    },
];

const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose }) => {
    const [hoveredColumn, setHoveredColumn] = useState<{ table: string, col: string } | null>(null);

    if (!isOpen) return null;

    // Helper to check if a table is related to the hovered element
    const isRelated = (tableName: string) => {
        if (!hoveredColumn) return false;
        
        // If hovering a FK, highlight the target table
        const colDef = SCHEMA_DEFINITIONS.find(t => t.tableName === hoveredColumn.table)
            ?.columns.find(c => c.name === hoveredColumn.col);
            
        if (colDef?.foreignKey?.table === tableName) return true;

        // If hovering a PK, highlight tables that reference it
        if (colDef?.isPrimaryKey) {
            const referencingTable = SCHEMA_DEFINITIONS.find(t => 
                t.tableName === tableName && 
                t.columns.some(c => c.foreignKey?.table === hoveredColumn.table && c.foreignKey?.column === hoveredColumn.col)
            );
            if (referencingTable) return true;
        }

        return false;
    };

    // Helper to check if a column is the target of the hovered FK
    const isTargetColumn = (tableName: string, colName: string) => {
        if (!hoveredColumn) return false;

        const sourceColDef = SCHEMA_DEFINITIONS.find(t => t.tableName === hoveredColumn.table)
            ?.columns.find(c => c.name === hoveredColumn.col);

        // Case 1: Hovering a FK -> Highlight target PK
        if (sourceColDef?.foreignKey) {
            return sourceColDef.foreignKey.table === tableName && sourceColDef.foreignKey.column === colName;
        }

        // Case 2: Hovering a PK -> Highlight referencing FKs
        const targetColDef = SCHEMA_DEFINITIONS.find(t => t.tableName === tableName)
            ?.columns.find(c => c.name === colName);
            
        if (targetColDef?.foreignKey) {
            return targetColDef.foreignKey.table === hoveredColumn.table && targetColDef.foreignKey.column === hoveredColumn.col;
        }

        return false;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 transition-colors">
            <div className="bg-terminal-bg border border-terminal-border rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-terminal-border bg-terminal-surface/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-terminal-blue/10 rounded-lg border border-terminal-blue/20">
                            <Database className="w-5 h-5 text-terminal-blue" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-terminal-text tracking-tight">Database Schema</h2>
                            <p className="text-[10px] text-terminal-text/60 uppercase tracking-wider">Entity Relationship Diagram</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-terminal-surface rounded-lg transition-colors text-terminal-text/60 hover:text-terminal-text"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-terminal-surface/50 dark:bg-black/20 scrollbar-thin scrollbar-thumb-terminal-border dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {SCHEMA_DEFINITIONS.map((table) => {
                            const isDimmed = hoveredColumn && 
                                hoveredColumn.table !== table.tableName && 
                                !isRelated(table.tableName);
                                
                            return (
                                <div 
                                    key={table.tableName} 
                                    className={`
                                        relative rounded-xl border transition-all duration-300 group shadow-sm
                                        ${isDimmed ? 'opacity-30 scale-95 grayscale' : 'opacity-100 scale-100'}
                                        ${hoveredColumn?.table === table.tableName 
                                            ? 'border-terminal-blue shadow-[0_0_20px_rgba(59,130,246,0.2)] bg-terminal-surface dark:bg-terminal-surface' 
                                            : 'border-terminal-border dark:border-white/10 bg-white dark:bg-black/40 hover:border-terminal-blue/30 dark:hover:border-white/20'}
                                    `}
                                >
                                    {/* Table Header */}
                                    <div className="px-4 py-3 border-b border-terminal-border dark:border-white/5 flex items-center justify-between bg-terminal-bg/50 dark:bg-white/5">
                                        <div className="flex items-center gap-2">
                                            <Table className={`w-4 h-4 ${hoveredColumn?.table === table.tableName ? 'text-terminal-blue' : 'text-terminal-text/50'}`} />
                                            <span className="font-mono text-sm font-bold text-terminal-text">{table.tableName}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Columns */}
                                    <div className="p-4 space-y-1">
                                        {table.columns.map((col) => {
                                            const isTarget = isTargetColumn(table.tableName, col.name);
                                            const isSource = hoveredColumn?.table === table.tableName && hoveredColumn?.col === col.name;
                                            
                                            return (
                                                <div 
                                                    key={col.name} 
                                                    className={`
                                                        flex items-center justify-between px-2 py-1.5 rounded text-xs font-mono transition-colors cursor-help
                                                        ${isSource ? 'bg-terminal-blue/20 text-terminal-blue' : ''}
                                                        ${isTarget ? 'bg-terminal-green/20 text-terminal-green font-bold ring-1 ring-terminal-green/50' : 'hover:bg-terminal-highlight dark:hover:bg-white/5'}
                                                    `}
                                                    onMouseEnter={() => setHoveredColumn({ table: table.tableName, col: col.name })}
                                                    onMouseLeave={() => setHoveredColumn(null)}
                                                >
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        {col.isPrimaryKey && (
                                                            <Key className="w-3 h-3 text-yellow-500 shrink-0" />
                                                        )}
                                                        {col.foreignKey && (
                                                            <LinkIcon className="w-3 h-3 text-terminal-blue shrink-0" />
                                                        )}
                                                        <span className={`truncate ${col.isPrimaryKey ? 'text-yellow-600 dark:text-yellow-500' : 'text-terminal-text/80'} ${col.foreignKey ? 'text-terminal-blue' : ''}`}>
                                                            {col.name}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                                        <span className="text-terminal-text/40 scale-90">{col.type}</span>
                                                        {col.foreignKey && (
                                                            <div className="flex items-center gap-1 text-[10px] bg-terminal-blue/10 text-terminal-blue px-1.5 py-0.5 rounded border border-terminal-blue/20">
                                                                <ArrowRight className="w-2 h-2" />
                                                                {col.foreignKey.table}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend/Footer */}
                <div className="p-4 border-t border-terminal-border bg-terminal-surface/30 flex justify-between items-center text-xs text-terminal-text/60 font-mono">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1"><Key className="w-3 h-3 text-yellow-600 dark:text-yellow-500" /> Primary Key</span>
                        <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3 text-terminal-blue" /> Foreign Key</span>
                    </div>
                    <p>HOVER OVER COLUMNS TO TRACE RELATIONSHIPS</p>
                </div>
            </div>
        </div>
    );
};

export default SchemaModal;
