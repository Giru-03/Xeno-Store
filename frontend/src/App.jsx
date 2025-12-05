import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Toaster, toast } from 'react-hot-toast';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [shopName, setShopName] = useState(localStorage.getItem('shopName'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('shopName');
        setToken(null);
        setShopName(null);
        toast.success('Logged out successfully');
    };

    return (
        <>
            <Toaster 
                position="top-right" 
                toastOptions={{
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid #334155',
                    },
                }}
            />
            {!token ? (
                <Login setToken={setToken} setShopName={setShopName} />
            ) : (
                <Dashboard token={token} shopName={shopName} onLogout={handleLogout} />
            )}
        </>
    );
}


export default App;
