import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AllReports = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const { showToast, showConfirm } = useUI();

    useEffect(() => {
        const fetchItems = async () => {
            if (!user?.token) return;

            try {
                setIsLoading(true);
                const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');

                // Fetch approved items
                const approvedResponse = await fetch(`${baseUrl}/items`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Accept': 'application/json'
                    }
                });

                // Fetch pending items
                const pendingResponse = await fetch(`${baseUrl}/items/admin/pending`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!approvedResponse.ok || !pendingResponse.ok) {
                    throw new Error(`Failed to fetch items.`);
                }

                const approvedData = await approvedResponse.json();
                const pendingData = await pendingResponse.json();

                // Fetch rejected items (optional - may not exist yet)
                let rejectedData = { data: [] };
                try {
                    const rejectedResponse = await fetch(`${baseUrl}/items/admin/rejected`, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`,
                            'Accept': 'application/json'
                        }
                    });
                    if (rejectedResponse.ok) {
                        rejectedData = await rejectedResponse.json();
                    }
                } catch (e) { /* endpoint may not exist yet */ }

                // Combine all lists
                const allItems = [
                    ...(approvedData.data || []),
                    ...(pendingData.data || []),
                    ...(rejectedData.data || [])
                ];

                // Sort by date descending
                const sortedData = allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setItems(sortedData);
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

            showToast(`Item successfully ${action}d!`, 'success');

        } catch (err) {
            console.error(`Error trying to ${action} item:`, err);
            showToast(err.message || `Failed to ${action} item.`, 'error');
        }
    };

    const filteredItems = items.filter(item =>
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.type && item.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.status && item.status.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/admin/all-reports')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-[#136dec] font-semibold text-sm transition-colors"
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
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-none">
                    <h2 className="text-xl font-bold text-slate-900">All Reports</h2>

                    <div className="flex items-center gap-6">
                        <div className="relative w-64">
                            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                                <span className="material-symbols-outlined text-[18px]">search</span>
                            </span>
                            <input
                                type="text"
                                placeholder="Search reports..."
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
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative min-h-[500px]">
                            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900">Total Records: <span className="text-[#136dec]">{filteredItems.length}</span></h3>
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                        Filter
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                {filteredItems.length > 0 ? (
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
                                            {filteredItems.map((report) => (
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
                                                        {report.status === 'PENDING' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                                                <span className="size-1.5 rounded-full bg-current"></span>
                                                                Pending
                                                            </span>
                                                        ) : report.status === 'RESOLVED' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                                                <span className="size-1.5 rounded-full bg-current"></span>
                                                                Resolved
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                                                <span className="size-1.5 rounded-full bg-current"></span>
                                                                {report.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => navigate(`/admin/review/${report.id}`)} className="size-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Review Report">
                                                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                            </button>
                                                            {report.status === 'PENDING' && (
                                                                <>
                                                                    <button onClick={() => handleItemAction(report.id, 'approve')} className="size-8 flex items-center justify-center rounded text-slate-400 hover:bg-emerald-50 hover:text-emerald-600" title="Approve">
                                                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                                                    </button>
                                                                    <button onClick={() => handleItemAction(report.id, 'reject')} className="size-8 flex items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Reject">
                                                                        <span className="material-symbols-outlined text-[18px]">flag</span>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-20 text-center text-slate-500 flex flex-col items-center">
                                        <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">search_off</span>
                                        <p className="font-bold text-slate-900 mt-2">No reports found</p>
                                        <p className="text-sm mt-1">Try adjusting your search criteria.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AllReports;
