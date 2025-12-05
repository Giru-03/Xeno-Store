import React from 'react';
import { Mail } from 'lucide-react';

const TopSpenders = ({ data }) => {
    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm h-full">
            <h3 className="text-lg font-semibold text-white mb-6">Top Customers</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-900/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-l-lg">Customer</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-r-lg">Total Spent</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {data && data.map((customer, index) => (
                            <tr key={index} className="hover:bg-slate-700/20 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs mr-3">
                                            {customer.firstName?.[0] || '?'}{customer.lastName?.[0] || '?'}
                                        </div>
                                        <div className="text-sm font-medium text-white">
                                            {customer.firstName} {customer.lastName}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Mail size={12} />
                                        {customer.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-emerald-400">
                                    ${parseFloat(customer.totalSpent).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopSpenders;
