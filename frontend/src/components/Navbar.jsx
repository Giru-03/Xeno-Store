import { LayoutDashboard, LogOut, ShoppingBag } from 'lucide-react';

const Navbar = ({ shopName, onLogout }) => {
    return (
        <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg">
                            <img src='/favicon.svg' alt='logo' className="text-white h-5 w-5" />
                        </div>
                        <span className="font-bold text-xl text-white tracking-tight">Xeno<span className="text-indigo-400">Insights</span></span>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
                            <ShoppingBag className="text-slate-400 h-4 w-4" />
                            <span className="text-sm font-medium text-slate-300">{shopName}</span>
                        </div>
                        <button 
                            onClick={onLogout}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
