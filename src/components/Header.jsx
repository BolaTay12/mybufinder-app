import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const { showConfirm } = useUI();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleGuidelines = () => {
        showConfirm({
            title: 'Campus Reporting Guidelines',
            message: '1. If you find an item, report it here immediately.\n2. Hand over valuable items to the campus security office or department office.\n3. Do not attempt to meet strangers off-campus for item exchange.\n\nReady to report an item?',
            confirmText: 'Report Item',
            cancelText: 'Cancel',
            type: 'info'
        }).then((confirmed) => {
            if (confirmed) {
                setIsMobileMenuOpen(false);
                navigate('/report-item');
            }
        });
    };

    // Mobile Stats
    const lostCount = localStorage.getItem('userLostCount') || 0;
    const foundCount = localStorage.getItem('userFoundCount') || 0;
    const totalStats = parseInt(lostCount) + parseInt(foundCount);
    const successRate = totalStats > 0 ? Math.round((parseInt(foundCount) / totalStats) * 100) : 0;

    return (
        <header className="relative flex-none z-20 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-10 py-3 transition-colors duration-300">
            <div className="flex items-center justify-between mx-auto max-w-[1440px]">
                {/* Logo Section */}
                <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => navigate('/dashboard')}
                >
                    <div className="size-8 text-[#136dec] flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="48" rx="12" fill="#E8F0FE" />
                            <path d="M24 14L12 20.5L24 27L36 20.5L24 14Z" fill="#136DEC" />
                            <path d="M15 23.5V31.5C15 31.5 19 36 24 36C29 36 33 31.5 33 31.5V23.5L24 28.5L15 23.5Z" fill="#136DEC" />
                            <path d="M35 21V29C35 29 35 30.5 36.5 30.5C38 30.5 38 29 38 29V19.5L35 21Z" fill="#136DEC" />
                        </svg>
                    </div>
                    <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">MYBUFinder</h2>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <nav className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className={`text-sm transition-colors ${location.pathname === '/dashboard'
                                ? 'text-primary font-semibold hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                                : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 font-medium'}`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/search-results')}
                            className={`text-sm transition-colors ${location.pathname === '/search-results' && !location.search.includes('view=map')
                                ? 'text-primary font-semibold hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                                : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 font-medium'}`}
                        >
                            Browse Items
                        </button>
                        <button
                            onClick={() => navigate('/search-results?view=map')}
                            className={`text-sm transition-colors ${location.pathname === '/search-results' && location.search.includes('view=map')
                                ? 'text-primary font-semibold hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                                : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 font-medium'}`}
                        >
                            Map
                        </button>
                    </nav>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/report-item')}
                        className="hidden sm:flex h-10 px-4 cursor-pointer items-center justify-center rounded-lg bg-[#136dec] hover:bg-blue-600 text-white text-sm font-bold shadow-sm transition-all"
                    >
                        <span className="mr-2 material-symbols-outlined text-[20px]">add_circle</span>
                        <span>Report Item</span>
                    </button>
                    <button
                        onClick={() => navigate('/notifications')}
                        className="size-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="hidden md:flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors"
                        title="Sign Out"
                    >
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden size-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
            </div>

            {/* Mobile Nav Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-900 shadow-xl border-b border-slate-200 dark:border-slate-800 flex flex-col p-6 md:hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top h-[calc(100vh-64px)] overflow-y-auto">
                    
                    {/* User Profile (Mobile) */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-inner">
                            <span className="material-symbols-outlined text-2xl text-slate-500 dark:text-slate-400">person</span>
                        </div>
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <h3 className="text-slate-900 dark:text-white font-bold truncate">{user?.name || 'Guest User'}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-full" title={user?.email}>{user?.email || user?.role || 'Welcome'}</p>
                            <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5">{user?.matricNumber || ''}</p>
                        </div>
                    </div>

                    {/* Stats (Mobile) */}
                    <div className="flex flex-col gap-3 mb-6">
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

                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</h4>
                    <nav className="flex flex-col gap-2 flex-1 pb-6">
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard'); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${location.pathname === '/dashboard' ? 'bg-blue-50 dark:bg-blue-900/20 text-[#136dec] dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <span className="material-symbols-outlined">dashboard</span>
                            Dashboard
                        </button>
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); navigate('/search-results'); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${location.pathname === '/search-results' && !location.search.includes('view=map') ? 'bg-blue-50 dark:bg-blue-900/20 text-[#136dec] dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <span className="material-symbols-outlined">search</span>
                            Browse Items
                        </button>
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); navigate('/search-results?view=map'); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${location.pathname === '/search-results' && location.search.includes('view=map') ? 'bg-blue-50 dark:bg-blue-900/20 text-[#136dec] dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <span className="material-symbols-outlined">map</span>
                            Map
                        </button>
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); navigate('/my-reports'); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${location.pathname === '/my-reports' ? 'bg-blue-50 dark:bg-blue-900/20 text-[#136dec] dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <span className="material-symbols-outlined">article</span>
                            My Reports
                        </button>
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); navigate('/claims'); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${location.pathname === '/claims' ? 'bg-blue-50 dark:bg-blue-900/20 text-[#136dec] dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <span className="material-symbols-outlined">handshake</span>
                            Claims
                        </button>
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); navigate('/settings'); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${location.pathname === '/settings' ? 'bg-blue-50 dark:bg-blue-900/20 text-[#136dec] dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <span className="material-symbols-outlined">settings</span>
                            Settings
                        </button>
                        
                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); navigate('/report-item'); }}
                            className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#136dec] hover:bg-blue-600 text-white font-bold transition-colors w-full shadow-sm mt-1 mb-4"
                        >
                            <span className="material-symbols-outlined">add_circle</span>
                            Report Item
                        </button>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-[#136dec] to-blue-600 text-white shadow-md">
                            <p className="text-sm font-bold mb-2">Help keep campus safe.</p>
                            <p className="text-xs text-blue-100 mb-4 leading-relaxed">Found something? Report it immediately to help the owner.</p>
                            <button onClick={handleGuidelines} className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors">Learn Guidelines</button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
