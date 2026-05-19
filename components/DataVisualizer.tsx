import React, { useMemo } from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { QueryResult } from '../types';
import { IconChartBar, IconChartPie, IconChartLine } from './Icons';

interface DataVisualizerProps {
    result: QueryResult | null;
    theme: 'light' | 'dark';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DataVisualizer: React.FC<DataVisualizerProps> = ({ result, theme }) => {
    const data = useMemo(() => {
        if (!result || !result.data || result.data.length === 0) return null;
        return result.data;
    }, [result]);

    const chartConfig = useMemo(() => {
        if (!result || !result.columns || result.columns.length < 2) return null;

        const columns = result.columns;
        const firstRow = result.data[0];
        
        // Identify potential X and Y axes
        let xAxisKey = '';
        let yAxisKey = '';
        let chartType: 'bar' | 'line' | 'pie' = 'bar';

        // Simple heuristic: 
        // 1. Find a numeric column for Y-axis
        // 2. Find a string/date column for X-axis
        
        for (const col of columns) {
            const val = firstRow[col];
            if (typeof val === 'number') {
                yAxisKey = col;
            } else if (typeof val === 'string') {
                xAxisKey = col;
            }
        }

        if (!xAxisKey || !yAxisKey) return null;

        // Refine chart type
        if (result.data.length <= 10) {
            chartType = 'pie'; // Small dataset -> Pie
        } else if (xAxisKey.toLowerCase().includes('date') || xAxisKey.toLowerCase().includes('time')) {
            chartType = 'line'; // Time series -> Line
        } else {
            chartType = 'bar'; // Default -> Bar
        }

        return { xAxisKey, yAxisKey, chartType };

    }, [result]);

    if (!data || !chartConfig) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-terminal-text/40 font-mono border border-dashed border-terminal-border/30 rounded-lg bg-terminal-surface/10 p-8">
                <IconChartBar className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">No suitable data for visualization.</p>
                <p className="text-xs mt-2 opacity-60">Try selecting 1 text column and 1 numeric column.</p>
            </div>
        );
    }

    const { xAxisKey, yAxisKey, chartType } = chartConfig;
    const isDark = theme === 'dark';
    
    // Theme colors
    const axisColor = isDark ? '#888888' : '#666666';
    const gridColor = isDark ? '#333333' : '#e5e7eb';
    const tooltipBg = isDark ? '#1f2937' : '#ffffff';
    const tooltipBorder = isDark ? '#374151' : '#e5e7eb';
    const tooltipText = isDark ? '#f3f4f6' : '#1f2937';

    const renderChart = () => {
        switch (chartType) {
            case 'line':
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis 
                            dataKey={xAxisKey} 
                            stroke={axisColor} 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <YAxis 
                            stroke={axisColor} 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(value) => `${value}`} 
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText }}
                            itemStyle={{ color: tooltipText }}
                        />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey={yAxisKey} 
                            stroke="#8884d8" 
                            strokeWidth={2} 
                            dot={{ r: 4, fill: '#8884d8' }} 
                            activeDot={{ r: 6 }} 
                        />
                    </LineChart>
                );
            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey={yAxisKey}
                            nameKey={xAxisKey}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText }}
                            itemStyle={{ color: tooltipText }}
                        />
                        <Legend />
                    </PieChart>
                );
            case 'bar':
            default:
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis 
                            dataKey={xAxisKey} 
                            stroke={axisColor} 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <YAxis 
                            stroke={axisColor} 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(value) => `${value}`} 
                        />
                        <Tooltip 
                            cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                            contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText }}
                            itemStyle={{ color: tooltipText }}
                        />
                        <Legend />
                        <Bar dataKey={yAxisKey} fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                );
        }
    };

    return (
        <div className="w-full h-[300px] p-4 bg-terminal-surface/30 rounded-lg border border-terminal-border/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-terminal-text/70 flex items-center gap-2">
                    {chartType === 'line' && <IconChartLine className="w-4 h-4" />}
                    {chartType === 'pie' && <IconChartPie className="w-4 h-4" />}
                    {chartType === 'bar' && <IconChartBar className="w-4 h-4" />}
                    Data Visualization
                </h3>
                <div className="text-[10px] font-mono text-terminal-text/40">
                    {xAxisKey} vs {yAxisKey}
                </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};

export default DataVisualizer;
