import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SalesChart = ({ data }) => {
    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-6">Revenue Trajectory</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {month:'short', day:'numeric'})} 
                            stroke="#94a3b8"
                            tick={{fill: '#94a3b8', fontSize: 12}}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis 
                            stroke="#94a3b8"
                            tick={{fill: '#94a3b8', fontSize: 12}}
                            axisLine={false}
                            tickLine={false}
                            dx={-10}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                            itemStyle={{ color: '#818cf8' }}
                            labelStyle={{ color: '#cbd5e1' }}
                            formatter={(value) => [`$${value}`, 'Revenue']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="sales" 
                            stroke="#6366f1" 
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#1e293b', stroke: '#6366f1', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#818cf8' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;
