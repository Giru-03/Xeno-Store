import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomerGrowthChart = ({ data }) => {
    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-6">Customer Acquisition</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
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
                            cursor={{fill: '#334155', opacity: 0.4}}
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                            itemStyle={{ color: '#34d399' }}
                            labelStyle={{ color: '#cbd5e1' }}
                        />
                        <Bar 
                            dataKey="count" 
                            fill="#34d399" 
                            radius={[4, 4, 0, 0]}
                            name="New Customers"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CustomerGrowthChart;
