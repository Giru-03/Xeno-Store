import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon }) => {
    const Icon = icon;
    return (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm hover:shadow-md hover:border-slate-600 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg text-indigo-400 border border-slate-700">
                    <Icon size={20} />
                </div>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                <TrendingUp size={14} />
                <span>Analytics Data</span>
            </div>
        </div>
    );
};

export default StatCard;
