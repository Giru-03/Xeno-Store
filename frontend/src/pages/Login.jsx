import React, { useState } from 'react';
import { login } from '../services/api';
import toast from 'react-hot-toast';
import { LayoutDashboard } from 'lucide-react';

const Login = ({ setToken, setShopName }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [shopifyDomain, setShopifyDomain] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await login(email, password, shopifyDomain);
            setToken(data.token);
            setShopName(data.shopName);
            localStorage.setItem('token', data.token);
            localStorage.setItem('shopName', data.shopName);
            toast.success('Login successful!');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 font-sans">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-screen h-[100vw] bg-indigo-500/10 rounded-full blur-3xl opacity-20"></div>
            </div>
            
            <div className="relative bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md backdrop-blur-sm">
                <div className="text-center mb-8">
                    <div className="bg-indigo-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
                        <LayoutDashboard size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Xeno Insights</h2>
                    <p className="text-slate-400 mt-2">Sign in to your analytics dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Shop Domain</label>
                        <input 
                            type="text" 
                            placeholder="store.myshopify.com"
                            value={shopifyDomain} 
                            onChange={(e) => setShopifyDomain(e.target.value)} 
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500"
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            placeholder="you@company.com"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500"
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500"
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-indigo-500/20 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default Login;
