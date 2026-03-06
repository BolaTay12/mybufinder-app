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
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-none z-10">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="size-8 bg-[#136dec] rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[20px]">school</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-slate-900 font-bold text-base leading-tight">MYBUFinder</h1>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Admin Console</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <button
                        onClick={() => navigate('/admin')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/admin/all-reports')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">folder_open</span>
                        All Reports
                    </button>
                    <button
                        onClick={() => navigate('/admin/claims')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-colors">
                        <span className="material-symbols-outlined text-[20px]">fact_check</span>
                        Claims Review
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-600 font-medium text-sm transition-colors"
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
                            <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${item.status === 'PENDING'
                                ? 'bg-orange-50 border-orange-200 text-orange-800'
                                : 'bg-slate-200 border-slate-300 text-slate-700'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-2xl">
                                        {item.status === 'PENDING' ? 'pending_actions' : 'info'}
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-lg">
                                            {item.status === 'PENDING' ? 'Action Required' : `Status: ${item.status}`}
                                        </h3>
                                        <p className="text-sm opacity-80">
                                            {item.status === 'PENDING' ? 'This report is awaiting your review to be visible on the public dashboard.' : 'This item has already been processed.'}
                                        </p>
                                    </div>
                                </div>
                                {item.status === 'PENDING' && (
                                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm">
                                        <button
                                            onClick={() => handleAction('reject')}
                                            disabled={actionLoading}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction('approve')}
                                            disabled={actionLoading}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-[#136dec] text-white hover:bg-[#0f58c5] font-bold rounded-lg transition-colors disabled:opacity-50 shadow-sm shadow-[#136dec]/20"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">check</span>
                                            Approve
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left Column: Image & Actions */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                    <div className="aspect-square bg-slate-100 flex items-center justify-center relative">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="material-symbols-outlined text-6xl text-slate-300">image_not_supported</span>
                                        )}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${item.type === 'FOUND' ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
                                                }`}>
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Date Reported</p>
                                            <p className="font-bold text-slate-900 text-sm">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Category</p>
                                            <p className="font-bold text-slate-900 text-sm capitalize">
                                                {item.category || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Details */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-20 pointer-events-none ${item.type === 'FOUND' ? 'bg-emerald-500' : 'bg-rose-500'
                                        }`}></div>

                                    <h1 className="text-3xl font-bold text-slate-900 mb-4">{item.title}</h1>

                                    <div className="mb-8">
                                        <h3 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">description</span>
                                            Description
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="mb-8">
                                        <h3 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">location_on</span>
                                            Location Information
                                        </h3>
                                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="size-10 bg-blue-100 text-[#136dec] rounded-full flex items-center justify-center flex-none">
                                                <span className="material-symbols-outlined">pin_drop</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 capitalize">{item.location}</p>
                                                <p className="text-sm text-slate-500">Recorded Area</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">account_circle</span>
                                            Reporter Information
                                        </h3>
                                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="size-10 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center flex-none">
                                                <span className="material-symbols-outlined">person</span>
                                            </div>
                                            <div className="truncate w-full">
                                                <p className="font-bold text-slate-900 text-sm truncate">ID: {item.submittedBy}</p>
                                                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mt-0.5">Report Originator</p>
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
