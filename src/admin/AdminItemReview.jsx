import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminItemReview = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { showToast, showConfirm } = useUI();

    const [item, setItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchItemDetails = async () => {
            if (!user?.token || !itemId) return;

            try {
                setIsLoading(true);
                const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');
                const response = await fetch(`${baseUrl}/items/${itemId}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch item. Status: ${response.status}`);
                }

                const result = await response.json();
                setItem(result.data);
            } catch (err) {
                console.error("Error fetching admin item details:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchItemDetails();
    }, [itemId, user]);

    const handleAction = async (action) => {
        const confirmed = await showConfirm({
            title: action === 'approve' ? 'Approve Report' : 'Reject Report',
            message: `Are you sure you want to ${action} this report?`,
            type: action === 'approve' ? 'info' : 'danger',
            confirmText: action === 'approve' ? 'Approve' : 'Reject'
        });

        if (!confirmed) return;

        try {
            setActionLoading(true);
            const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');

            const endpoint = action === 'approve' ? 'approve' : 'reject';

            const response = await fetch(`${baseUrl}/items/${itemId}/${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || `Failed to ${action} item.`);
            }

            showToast(`Successfully ${action}d the item report!`, 'success');
            navigate(-1); // Go back to the previous admin page
        } catch (err) {
            console.error(`Error trying to ${action} item:`, err);
            showToast(err.message || `Failed to ${action} item.`, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full bg-[#f8f9fc]">
                <div className="m-auto flex flex-col items-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-slate-500 font-medium font-['Lexend']">Loading Report Details...</p>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="flex h-screen w-full bg-[#f8f9fc] p-8">
                <div className="m-auto bg-rose-50 border border-rose-200 text-rose-600 p-8 rounded-xl max-w-md text-center font-['Lexend'] shadow-sm">
                    <span className="material-symbols-outlined text-4xl mb-4">error</span>
                    <h2 className="text-lg font-bold mb-2">Error Loading Report</h2>
                    <p>{error || "Item not found"}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-6 px-6 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-[#f8f9fc] font-['Lexend'] overflow-hidden">
            {/* Standard Admin Sidebar */}
            <aside className="w-64 bg-white/80 dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800 flex flex-col flex-none z-10 backdrop-blur-xl shadow-xl transition-all duration-300">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 group cursor-default">
                    <div className="size-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                        <span className="material-symbols-outlined text-[24px]">school</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-slate-900 dark:text-white font-bold text-lg leading-tight tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-600 transition-all duration-300">MYBUFINDER</h1>
                        <span className="text-primary text-[10px] font-bold uppercase tracking-widest">Admin Console</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button
                        onClick={() => navigate('/admin')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-primary font-medium text-sm transition-all duration-300 hover:shadow-sm hover:translate-x-1"
                    >
                        <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:scale-110">dashboard</span>
                        Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/admin/all-reports')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-primary font-medium text-sm transition-all duration-300 hover:shadow-sm hover:translate-x-1"
                    >
                        <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:scale-110">folder_open</span>
                        All Reports
                    </button>
                    <button
                        onClick={() => navigate('/admin/claims')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-primary font-medium text-sm transition-all duration-300 hover:shadow-sm hover:translate-x-1">
                        <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:scale-110">fact_check</span>
                        Claims Review
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 font-medium text-sm transition-all duration-300 hover:shadow-sm hover:translate-x-1"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 flex-none justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold"
                        >
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                            Back to List
                        </button>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <h2 className="text-xl font-bold text-slate-900">Review Item Report</h2>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                        <div className="hidden md:block">
                            <p className="text-sm font-bold text-slate-900">Admin User</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase">Super Admin</p>
                        </div>
                        <div className="size-9 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                            <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <div className="max-w-4xl mx-auto">

                        {/* Status Banner */}
                        {item.status !== 'APPROVED' && (
                            <div className={`mb-8 p-5 rounded-2xl border flex items-center justify-between shadow-lg animate-fade-in-up transition-all duration-500 hover:scale-[1.01] ${item.status === 'PENDING'
                                ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-orange-800 shadow-orange-500/10'
                                : 'bg-slate-100 border-slate-300 text-slate-700'
                                }`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${item.status === 'PENDING' ? 'bg-orange-100 text-orange-600 shadow-inner' : 'bg-slate-200 text-slate-500'}`}>
                                        <span className="material-symbols-outlined text-3xl">
                                            {item.status === 'PENDING' ? 'pending_actions' : 'info'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl tracking-tight">
                                            {item.status === 'PENDING' ? 'Action Required' : `Status: ${item.status}`}
                                        </h3>
                                        <p className="text-sm opacity-80 mt-1 font-medium">
                                            {item.status === 'PENDING' ? 'This report is awaiting your review to be visible on the public dashboard.' : 'This item has already been processed.'}
                                        </p>
                                    </div>
                                </div>
                                {item.status === 'PENDING' && (
                                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-sm border border-white/50">
                                        <button
                                            onClick={() => handleAction('reject')}
                                            disabled={actionLoading}
                                            className="flex items-center gap-2 px-6 py-3 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold rounded-lg transition-all duration-300 hover:shadow-md disabled:opacity-50 border border-slate-100"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">close</span>
                                            Reject
                                        </button>
                                        <div className="aura-effect">
                                            <button
                                                onClick={() => handleAction('approve')}
                                                disabled={actionLoading}
                                                className="relative flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">check</span>
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left Column: Image & Actions */}
                            <div className="lg:col-span-1 space-y-6 animate-fade-in-up delay-100">
                                <div className="swaggy-card p-2 overflow-hidden">
                                    <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden group">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <span className="material-symbols-outlined text-6xl text-slate-300">image_not_supported</span>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-105 ${item.type === 'FOUND' ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
                                                }`}>
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 mt-2 grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                        <div className="group cursor-default">
                                            <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-widest group-hover:text-primary transition-colors">Date Reported</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                                                {new Date(item.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="group cursor-default">
                                            <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-widest group-hover:text-primary transition-colors">Category</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm capitalize bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text">
                                                {item.category || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Details */}
                            <div className="lg:col-span-2 space-y-6 animate-fade-in-up delay-200">
                                <div className="swaggy-card p-8 relative overflow-hidden z-0">
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-bl from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl -z-10 animate-pulse-soft"></div>
                                    <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-30 pointer-events-none -z-10 ${item.type === 'FOUND' ? 'bg-emerald-500' : 'bg-rose-500'
                                        }`}></div>

                                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">{item.title}</h1>

                                    <div className="mb-10 group">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                                <span className="material-symbols-outlined text-[20px]">description</span>
                                            </div>
                                            Description
                                        </h3>
                                        <div className="p-5 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors duration-300">
                                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-10 group">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-primary group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                                                <span className="material-symbols-outlined text-[20px]">location_on</span>
                                            </div>
                                            Location Information
                                        </h3>
                                        <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group-hover:border-primary/30">
                                            <div className="size-12 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-xl flex items-center justify-center flex-none">
                                                <span className="material-symbols-outlined">pin_drop</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-slate-900 dark:text-white capitalize">{item.location}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Recorded Area</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                                <span className="material-symbols-outlined text-[20px]">account_circle</span>
                                            </div>
                                            Reporter Information
                                        </h3>
                                        <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group-hover:border-primary/30">
                                            <div className="size-12 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center flex-none shadow-inner">
                                                <span className="material-symbols-outlined">person</span>
                                            </div>
                                            <div className="truncate w-full">
                                                <p className="font-bold text-slate-900 dark:text-white text-base truncate font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">ID: {item.submittedBy}</p>
                                                <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-widest mt-2">Report Originator</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminItemReview;
