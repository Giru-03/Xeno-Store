import React, { useState } from 'react';
import { Search } from 'lucide-react';
import SalesChart from './SalesChart';
import CustomerGrowthChart from './CustomerGrowthChart';
import OrderStatusChart from './OrderStatusChart';

const DetailsModal = ({ isOpen, onClose, title, data, type }) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredData = data?.filter(item => {
        if (!searchTerm) return true;
        
        if (type === 'sales' || type === 'customers') {
            try {
                const itemDate = new Date(item.date).toISOString().split('T')[0];
                return itemDate === searchTerm;
            } catch (e) {
                console.error('Date parsing error:', e);
                return false;
            }
        }
        if (type === 'orders') {
            return (item.financialStatus || '').toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
    });

    const renderChart = () => {
        if (!data) return null;
        switch (type) {
            case 'sales':
                return <SalesChart data={data} />;
            case 'customers':
                return <CustomerGrowthChart data={data} />;
            case 'orders':
                return <OrderStatusChart data={data} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="mb-6">
                        {renderChart()}
                    </div>
                    <div className="mb-4 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type={type === 'orders' ? "text" : "date"}
                            placeholder={type === 'orders' ? "Search by status..." : "Search by date..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 placeholder-slate-500 ${type !== 'orders' ? '[&::-webkit-calendar-picker-indicator]:invert' : ''}`}
                        />
                    </div>
                    {filteredData && filteredData.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-800">
                            <thead className="bg-slate-950/50">
                                <tr>
                                    {type === 'sales' && (
                                        <>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Sales</th>
                                        </>
                                    )}
                                    {type === 'customers' && (
                                        <>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">New Customers</th>
                                        </>
                                    )}
                                    {type === 'orders' && (
                                        <>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Count</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredData.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                                        {type === 'sales' && (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{new Date(item.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">${parseFloat(item.sales).toFixed(2)}</td>
                                            </>
                                        )}
                                        {type === 'customers' && (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{new Date(item.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.count}</td>
                                            </>
                                        )}
                                        {type === 'orders' && (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.financialStatus}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.count}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-slate-500 text-center py-8">No data available for this period.</p>
                    )}
                </div>
                <div className="p-6 border-t border-slate-800 flex justify-end">
                    <button onClick={onClose} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20">Close</button>
                </div>
            </div>
        </div>
    );
};

export default DetailsModal;
