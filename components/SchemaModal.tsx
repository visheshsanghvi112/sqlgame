import React from 'react';
import { X, Database, Table, Columns } from 'lucide-react';

interface SchemaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SCHEMA_DEFINITIONS = [
    {
        tableName: 'crime_scene_report',
        columns: [
            { name: 'date', type: 'INT' },
            { name: 'type', type: 'VARCHAR' },
            { name: 'description', type: 'VARCHAR' },
            { name: 'city', type: 'VARCHAR' },
        ]
    },
    {
        tableName: 'drivers_license',
        columns: [
            { name: 'id', type: 'INT' },
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
        columns: [
            { name: 'id', type: 'INT' },
            { name: 'name', type: 'VARCHAR' },
            { name: 'license_id', type: 'INT' },
            { name: 'address_number', type: 'INT' },
            { name: 'address_street_name', type: 'VARCHAR' },
            { name: 'ssn', type: 'VARCHAR' },
        ]
    },
    {
        tableName: 'facebook_event_checkin',
        columns: [
            { name: 'person_id', type: 'INT' },
            { name: 'event_id', type: 'INT' },
            { name: 'event_name', type: 'VARCHAR' },
            { name: 'date', type: 'INT' },
        ]
    },
    {
        tableName: 'interview',
        columns: [
            { name: 'person_id', type: 'INT' },
            { name: 'transcript', type: 'VARCHAR' },
        ]
    },
    {
        tableName: 'get_fit_now_member',
        columns: [
            { name: 'id', type: 'VARCHAR' },
            { name: 'person_id', type: 'INT' },
            { name: 'name', type: 'VARCHAR' },
            { name: 'membership_start_date', type: 'INT' },
            { name: 'membership_status', type: 'VARCHAR' },
        ]
    },
    {
        tableName: 'get_fit_now_check_in',
        columns: [
            { name: 'membership_id', type: 'VARCHAR' },
            { name: 'check_in_date', type: 'INT' },
            { name: 'check_in_time', type: 'INT' },
            { name: 'check_out_time', type: 'INT' },
        ]
    },
    {
        tableName: 'income',
        columns: [
            { name: 'ssn', type: 'VARCHAR' },
            { name: 'annual_income', type: 'INT' },
        ]
    },
];

const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-terminal-bg border border-terminal-border rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-terminal-border bg-terminal-surface/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-terminal-blue/10 rounded-lg border border-terminal-blue/20">
                            <Database className="w-5 h-5 text-terminal-blue" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-terminal-text tracking-tight">Database Schema</h2>
                            <p className="text-xs text-terminal-text/60 uppercase tracking-wider">Full System Access</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-terminal-text/60 hover:text-terminal-text"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {SCHEMA_DEFINITIONS.map((table) => (
                        <div key={table.tableName} className="bg-black/40 border border-white/5 rounded-lg overflow-hidden hover:border-terminal-blue/30 transition-colors group">
                            <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center gap-2">
                                <Table className="w-4 h-4 text-terminal-blue opacity-70 group-hover:opacity-100 transition-opacity" />
                                <span className="font-mono text-sm font-bold text-terminal-text">{table.tableName}</span>
                            </div>
                            <div className="p-4">
                                <div className="space-y-2">
                                    {table.columns.map((col) => (
                                        <div key={col.name} className="flex justify-between items-center text-xs font-mono border-b border-white/5 last:border-0 pb-1 last:pb-0">
                                            <span className="text-terminal-text/80 flex items-center gap-2">
                                                <Columns className="w-3 h-3 opacity-30" />
                                                {col.name}
                                            </span>
                                            <span className="text-terminal-blue/60">{col.type}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-terminal-border bg-terminal-surface/30 text-center">
                    <p className="text-xs text-terminal-text/40 font-mono">
                        SYSTEM STATUS: ONLINE • READ-ONLY ACCESS
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SchemaModal;
