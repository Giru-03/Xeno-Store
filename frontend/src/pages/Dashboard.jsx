import React, { useEffect, useState, useCallback } from 'react';
import { getStats, triggerSync } from '../services/api';
import StatCard from '../components/StatCard';
import SalesChart from '../components/SalesChart';
import CustomerGrowthChart from '../components/CustomerGrowthChart';
import OrderStatusChart from '../components/OrderStatusChart';
import TopSpenders from '../components/TopSpenders';
import Navbar from '../components/Navbar';
import DetailsModal from '../components/DetailsModal';
import toast from 'react-hot-toast';
import { DollarSign, Users, Package, CreditCard, RefreshCw, Calendar } from 'lucide-react';

const Dashboard = ({ token, shopName, onLogout }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Date Range State (Default: Last 6 Months)
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 6);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalTitle, setModalTitle] = useState('');
    const [modalType, setModalType] = useState('');

    const fetchStats = useCallback(async () => {
        try {
            const data = await getStats(startDate, endDate);
            setStats(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch stats');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        if (token) fetchStats();
    }, [token, fetchStats]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    const openModal = (title, data, type) => {
        setModalTitle(title);
        setModalData(data);
        setModalType(type);
        setModalOpen(true);
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await triggerSync();
            toast.success('Sync started! Data will update shortly.');
            setTimeout(fetchStats, 5000); 
        } catch (err) {
            console.error(err);
            toast.error('Sync failed');
        } finally {
            setSyncing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 font-sans">
            <Navbar shopName={shopName} onLogout={onLogout} />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
                        <p className="text-slate-400 mt-1">Real-time data for <span className="text-indigo-400">{shopName}</span></p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Date Range Pickers */}
                        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
                            <div className="flex items-center px-2">
                                <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                                <input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)} 
                                    className="bg-transparent text-slate-200 text-sm focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>
                            <span className="text-slate-600">-</span>
                            <div className="flex items-center px-2">
                                <input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)} 
                                    className="bg-transparent text-slate-200 text-sm focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-700 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>

                        <button 
                            onClick={handleSync}
                            disabled={syncing}
                            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-900/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Syncing...' : 'Sync Data'}
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard 
                        title="Total Sales" 
                        value={`$${stats?.totalSales?.toLocaleString() || 0}`} 
                        icon={DollarSign} 
                    />
                    <StatCard 
                        title="Customers" 
                        value={stats?.totalCustomers?.toLocaleString() || 0} 
                        icon={Users} 
                    />
                    <StatCard 
                        title="Orders" 
                        value={stats?.totalOrders?.toLocaleString() || 0} 
                        icon={Package} 
                    />
                    <StatCard 
                        title="Products" 
                        value={stats?.totalProducts?.toLocaleString() || 0} 
                        icon={CreditCard} 
                    />
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div onClick={() => openModal('Sales Details', stats?.salesOverTime, 'sales')} className="cursor-pointer transition-transform hover:scale-[1.01]">
                        <SalesChart data={stats?.salesOverTime || []} />
                    </div>
                    <div onClick={() => openModal('Customer Growth Details', stats?.customerGrowth, 'customers')} className="cursor-pointer transition-transform hover:scale-[1.01]">
                        <CustomerGrowthChart data={stats?.customerGrowth || []} />
                    </div>
                </div>

                {/* Secondary Data */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div onClick={() => openModal('Order Status Details', stats?.orderStatus, 'orders')} className="cursor-pointer transition-transform hover:scale-[1.01]">
                        <OrderStatusChart data={stats?.orderStatus || []} />
                    </div>
                    <TopSpenders data={stats?.topSpenders || []} />
                </div>
            </main>

            {modalOpen && (
                <DetailsModal 
                    isOpen={modalOpen} 
                    onClose={() => setModalOpen(false)} 
                    title={modalTitle} 
                    data={modalData} 
                    type={modalType} 
                />
            )}
        </div>
    );
};
export default Dashboard;
