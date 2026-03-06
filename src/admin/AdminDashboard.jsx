import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [items, setItems] = useState([]);
    const [metrics, setMetrics] = useState({ totalReports: 0, pendingApprovals: 0, resolvedCases: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { showToast, showConfirm } = useUI();

    useEffect(() => {
        const fetchItems = async () => {
            if (!user?.token) return;

            try {
                setIsLoading(true);
                const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');
                const headers = {
                    'Authorization': `Bearer ${user.token}`,
                    'Accept': 'application/json'
                };

                // Fetch approved items
                const approvedResponse = await fetch(`${baseUrl}/items`, { headers });

                // Fetch pending items
                const pendingResponse = await fetch(`${baseUrl}/items/admin/pending`, { headers });

                if (!approvedResponse.ok || !pendingResponse.ok) {
                    throw new Error(`Failed to fetch items.`);
                }

                const approvedData = await approvedResponse.json();
                const pendingData = await pendingResponse.json();

                // Fetch rejected items (optional - may not exist yet)
                let rejectedData = { data: [] };
                try {
                    const rejectedResponse = await fetch(`${baseUrl}/items/admin/rejected`, { headers });
                    if (rejectedResponse.ok) {
                        rejectedData = await rejectedResponse.json();
                    }
                } catch (e) { /* endpoint may not exist yet */ }

                // Fetch metrics (optional - may not exist yet)
                let metricsData = { data: null };
                try {
                    const metricsResponse = await fetch(`${baseUrl}/items/admin/metrics`, { headers });
                    if (metricsResponse.ok) {
                        metricsData = await metricsResponse.json();
                    }
                } catch (e) { /* endpoint may not exist yet */ }

                // Combine all lists
                const allItems = [
                    ...(approvedData.data || []),
                    ...(pendingData.data || []),
                    ...(rejectedData.data || [])
                ];
                setItems(allItems);

                if (metricsData.data) {
                    setMetrics(metricsData.data);
                }
            } catch (err) {
                console.error("Error fetching admin items:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, [user]);

    const handleItemAction = async (itemId, action) => {
        const confirmed = await showConfirm({
            title: action === 'approve' ? 'Approve Report' : 'Reject Report',
            message: `Are you sure you want to ${action} this report?`,
            type: action === 'approve' ? 'info' : 'danger',
            confirmText: action === 'approve' ? 'Approve Report' : 'Reject Report'
        });
        if (!confirmed) return;

        try {
            const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');
            const response = await fetch(`${baseUrl}/items/${itemId}/${action}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || `Failed to ${action} item.`);
            }

            setItems(prevItems => prevItems.map(item => item.id === itemId ? { ...item, status: action === 'approve' ? 'APPROVED' : 'REJECTED' } : item));

            setMetrics(prev => ({
                ...prev,
                pendingApprovals: Math.max(0, prev.pendingApprovals - 1)
            }));

            showToast(`Item successfully ${action}d!`, 'success');

        } catch (err) {
            console.error(`Error trying to ${action} item:`, err);
            showToast(err.message || `Failed to ${action} item.`, 'error');
        }
    };

    // Computed Stats from API Metrics
    const { totalReports, pendingApprovals, resolvedCases } = metrics;

    // Filtered lists
    const pendingList = items
        .filter(item => item.status === 'PENDING')
        .filter(item =>
            !searchTerm ||
            (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.type && item.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .slice(0, 10); // show top 10

    return (
        <div className="flex h-screen w-full bg-[#f8f9fc] font-['Lexend'] overflow-hidden">
            {/* Sidebar */}
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
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-[#136dec] font-semibold text-sm transition-colors">
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/admin/all-reports')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-colors">
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
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-none">
                    <h2 className="text-xl font-bold text-slate-900">Dashboard Overview</h2>

                    <div className="flex items-center gap-6">
                        <div className="relative w-64">
                            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                                <span className="material-symbols-outlined text-[18px]">search</span>
                            </span>
                            <input
                                type="text"
                                placeholder="Search pending reports..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                            <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-0 right-0 size-2 bg-rose-500 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="flex items-center gap-3 text-right">
                                <div className="hidden md:block">
                                    <p className="text-sm font-bold text-slate-900">Admin User</p>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase">Super Admin</p>
                                </div>
                                <div className="size-9 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                                    <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-20">
                            <LoadingSpinner />
                        </div>
                    ) : error ? (
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center text-rose-600">
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-start justify-between animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                                    <div>
                                        <p className="text-slate-500 text-sm font-medium mb-1">Total Reports</p>
                                        <h3 className="text-3xl font-bold text-slate-900 mb-2">{totalReports.toLocaleString()}</h3>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-600">
                                            System Lifetime
                                        </span>
                                    </div>
                                    <div className="size-12 rounded-lg bg-blue-50 text-[#136dec] flex items-center justify-center">
                                        <span className="material-symbols-outlined text-2xl">article</span>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-start justify-between relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                                    <div>
                                        <p className="text-slate-500 text-sm font-medium mb-1">Pending Approvals</p>
                                        <h3 className="text-3xl font-bold text-slate-900 mb-2">{pendingApprovals}</h3>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 animate-pulse-soft">
                                            <span className="material-symbols-outlined text-[14px]">priority_high</span>
                                            Current Backlog
                                        </span>
                                    </div>
                                    <div className="size-12 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-2xl">assignment_late</span>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-start justify-between animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                                    <div>
                                        <p className="text-slate-500 text-sm font-medium mb-1">Resolved Cases</p>
                                        <h3 className="text-3xl font-bold text-slate-900 mb-2">{resolvedCases}</h3>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600">
                                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                            Successful Matches
                                        </span>
                                    </div>
                                    <div className="size-12 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-2xl">task_alt</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Reports Section */}
                            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-orange-500 animate-pulse">schedule</span>
                                    <h3 className="text-xl font-bold text-slate-900">Pending Reports Queue</h3>

                                    <div className="ml-auto flex gap-3">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors hover:shadow-md">
                                            <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                            Filter
                                        </button>

                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                                    <div className="overflow-x-auto">
                                        {pendingList.length > 0 ? (
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                                                        <th className="p-4 font-bold max-w-[100px] truncate">Report ID</th>
                                                        <th className="p-4 font-bold">Item Name</th>
                                                        <th className="p-4 font-bold">Category</th>
                                                        <th className="p-4 font-bold">Type</th>
                                                        <th className="p-4 font-bold">Date Reported</th>
                                                        <th className="p-4 font-bold">Status</th>
                                                        <th className="p-4 font-bold text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                                    {pendingList.map((report) => (
                                                        <tr key={report.id} className="hover:bg-slate-50/80 transition-colors group">
                                                            <td className="p-4 font-medium text-slate-400 max-w-[100px] truncate" title={report.id}>#{report.id.slice(0, 8)}</td>
                                                            <td className="p-4">
                                                                <div>
                                                                    <p className="font-bold text-slate-900 truncate max-w-xs">{report.title}</p>
                                                                    <p className="text-xs text-slate-500 truncate max-w-xs">{report.description}</p>
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`inline-flex px-2.5 py-1 rounded text-xs font-bold ${report.category?.toLowerCase() === 'electronics' ? 'bg-slate-100 text-slate-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                    {report.category || 'Unknown'}
                                                                </span>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`inline-flex px-2.5 py-1 rounded text-xs font-bold ${report.type === 'FOUND' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                                    {report.type}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 font-medium">
                                                                {new Date(report.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="p-4">
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                                                    <span className="size-1.5 rounded-full bg-current"></span>
                                                                    Pending
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => navigate(`/admin/review/${report.id}`)} className="size-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Review Report">
                                                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                                    </button>
                                                                    <button onClick={() => handleItemAction(report.id, 'approve')} className="size-8 flex items-center justify-center rounded text-slate-400 hover:bg-emerald-50 hover:text-emerald-600" title="Approve">
                                                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                                                    </button>
                                                                    <button onClick={() => handleItemAction(report.id, 'reject')} className="size-8 flex items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Reject">
                                                                        <span className="material-symbols-outlined text-[18px]">flag</span>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="p-10 text-center text-slate-500">
                                                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">task_alt</span>
                                                <p className="font-medium text-slate-700">All caught up!</p>
                                                <p className="text-sm">There are no pending reports requiring approval.</p>
                                            </div>
                                        )}
                                    </div>

                                    {pendingList.length > 0 && (
                                        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
                                            <p className="text-xs text-slate-500 font-medium">Showing 1-{pendingList.length} of {pendingApprovals} pending</p>
                                            <div className="flex gap-2">
                                                <button className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Previous</button>
                                                <button className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-slate-50">Next</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
