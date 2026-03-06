import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './context/AuthContext';
import { useUI } from './context/UIContext';

const MyReports = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useUI();
    const [activeTab, setActiveTab] = useState('active');
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyItems = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');

                const response = await fetch(`${baseUrl}/items/my-items`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch your reports. Status: ${response.status}`);
                }

                const data = await response.json();
                if (data.status === 'success' && Array.isArray(data.data)) {
                    setReports(data.data);
                } else {
                    setReports([]);
                }
            } catch (err) {
                console.error("Error fetching my items:", err);
                setError(err.message);
                showToast("Failed to load your reports.", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyItems();
    }, []);

    const filteredReports = reports.filter(report => {
        const isActive = report.status === 'PENDING' || report.status === 'APPROVED';
        const isResolved = report.status === 'RESOLVED' || report.status === 'CLAIMED' || report.status === 'REJECTED';

        if (activeTab === 'all') return true;
        if (activeTab === 'active' && isActive) return true;
        if (activeTab === 'resolved' && isResolved) return true;
        return false;
    });

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-slate-950 transition-colors duration-300">
            {/* Top Navigation */}
            <Header />

            <div className="flex flex-1 overflow-hidden w-full">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#e8eaed] dark:bg-slate-950 p-6 transition-colors duration-300">
                    <div className="max-w-5xl mx-auto w-full">
                        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Reports</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your reported lost and found items.</p>
                            </div>
                            <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => setActiveTab('active')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'active' ? 'bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    Active
                                </button>
                                <button
                                    onClick={() => setActiveTab('resolved')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'resolved' ? 'bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    Resolved
                                </button>
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    All History
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center p-12">
                                    <LoadingSpinner />
                                </div>
                            ) : error ? (
                                <div className="text-center py-12 px-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                                    <span className="material-symbols-outlined text-4xl text-red-400 mb-3 block">error_outline</span>
                                    <h3 className="text-lg font-medium text-red-800 dark:text-red-400">Failed to load reports</h3>
                                    <p className="text-red-600 dark:text-red-500 text-sm mt-1">{error}</p>
                                </div>
                            ) : filteredReports.length > 0 ? (
                                filteredReports.map((report, index) => (
                                    <div
                                        key={report.id}
                                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row gap-4 hover:shadow-lg hover:border-primary/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                                        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                                    >
                                        <div className="size-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:bg-slate-200 transition-colors">
                                            {report.imageUrl ? (
                                                <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500">
                                                    {report.category?.toLowerCase() === 'electronics' ? 'smartphone' :
                                                        report.category?.toLowerCase() === 'clothing' ? 'backpack' : 'article'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-slate-900 dark:text-white">{report.title}</h3>
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${(report.status === 'PENDING' || report.status === 'APPROVED')
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    }`}>
                                                    {report.status}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 line-clamp-2">{report.description}</p>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                    <span>{new Date(report.createdAt || report.dateReported).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                    <span>{report.location}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">category</span>
                                                    <span className="capitalize">{report.type?.toLowerCase() || 'unknown'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-col justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/found-item-details/${report.id}`)}
                                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                View Details
                                            </button>
                                            {(report.status === 'PENDING' || report.status === 'APPROVED') && (
                                                <button className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                    Close
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-primary/20 dark:bg-primary/10 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                                        <div className="relative size-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-700">
                                            <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 animate-bounce" style={{ animationDuration: '2s' }}>folder_open</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No reports found</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mt-1">You haven't reported any items yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MyReports;
