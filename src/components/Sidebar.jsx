import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { showToast } = useUI();
    const [lostCount, setLostCount] = useState(0);
    const [foundCount, setFoundCount] = useState(0);

    const isActive = (path) => {
        return location.pathname === path;
    };

    useEffect(() => {
        const fetchReportedCount = async () => {
            // Optimistic load from cache
            const cachedLostCount = localStorage.getItem('userLostCount');
            const cachedFoundCount = localStorage.getItem('userFoundCount');
            if (cachedLostCount !== null && cachedFoundCount !== null) {
                setLostCount(parseInt(cachedLostCount, 10));
                setFoundCount(parseInt(cachedFoundCount, 10));
            }

            // Always fetch latest from server
            try {
                const token = localStorage.getItem('token');
                const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');

                const response = await fetch(`${baseUrl}/items/my-items/count`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    const lost = parseInt(result.data.lost || 0, 10);
                    const found = parseInt(result.data.found || 0, 10);

                    setLostCount(lost);
                    setFoundCount(found);
                    localStorage.setItem('userLostCount', lost);
                    localStorage.setItem('userFoundCount', found);
                }
            } catch (error) {
                console.error("Failed to fetch item count:", error);
                // Optionally show a toast here, though sidebars failing shouldn't be too intrusive
                showToast("Cannot connect to server to fetch stats.", "warning");
            }
        };

        if (user) {
            fetchReportedCount();
        }
    }, [user]);

    const totalStats = lostCount + foundCount;
    const successRate = totalStats > 0 ? Math.round((foundCount / totalStats) * 100) : 0;

    return (
        <aside className="hidden lg:flex flex-col w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-6 gap-8">
            {/* User Profile */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl text-slate-400 dark:text-slate-500">person</span>
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-slate-900 dark:text-white font-semibold">{user?.name || 'Guest User'}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-[160px]" title={user?.email}>{user?.email || user?.role || 'Welcome'}</p>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px]">{user?.matricNumber || ''}</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Your Stats</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="text-2xl font-bold text-primary dark:text-blue-400">{lostCount}</span>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Lost</span>
                    </div>
                    <div className="flex flex-col p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">{foundCount}</span>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Found</span>
                    </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Success Rate</span>
                    <span className="text-sm font-bold text-primary dark:text-blue-400">{successRate}%</span>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</h4>
                <button
                    onClick={() => navigate('/dashboard')}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${isActive('/dashboard')
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                    <span className="text-sm">Dashboard</span>
                </button>
                <button
                    onClick={() => navigate('/my-reports')}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${isActive('/my-reports')
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">article</span>
                    <span className="text-sm">My Reports</span>
                </button>
                <button
                    onClick={() => navigate('/claims')}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${isActive('/claims')
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">handshake</span>
                    <span className="text-sm">Claims</span>
                </button>
                <button
                    onClick={() => navigate('/settings')}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${isActive('/settings')
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                    <span className="text-sm">Settings</span>
                </button>
            </nav>

            <div className="mt-auto">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#136dec] to-blue-600 text-white">
                    <p className="text-sm font-medium mb-2">Help keep campus safe.</p>
                    <p className="text-xs text-blue-100 mb-3">Found something? Report it immediately to help the owner.</p>
                    <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded text-xs font-bold transition-colors">Learn Guidelines</button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
