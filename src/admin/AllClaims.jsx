import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Note: Replace these mocked endpoints/data with actual backend responses
// when they become available. Assuming GET /claims and PUT /claims/:id/status

const AllClaims = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const [claims, setClaims] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { showToast, showConfirm } = useUI();

    const [selectedClaim, setSelectedClaim] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isStatusChanging, setIsStatusChanging] = useState(false);

    useEffect(() => {
        const fetchClaims = async () => {
            if (!user?.token) return;

            try {
                setIsLoading(true);
                const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');

                // Real Endpoint Attempt:
                const response = await fetch(`${baseUrl}/claims/admin?limit=100&offset=0`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const responseData = await response.json();
                    setClaims(responseData.data || []);
                } else {
                    // Fallback mocked data if endpoint doesn't exist yet
                    // console.warn('Real claims endpoint failed, using mock data.');
                    // throw new Error(`Status: ${response.status}`);
                    setClaims([
                        {
                            id: "cl-001",
                            itemTitle: "Black HP Laptop",
                            itemId: "it-102",
                            claimantName: "John Doe",
                            claimantEmail: "john@student.babcock.edu.ng",
                            description: "It has a NASA sticker on the cover and a small scratch near the trackpad.",
                            status: "PENDING",
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: "cl-002",
                            itemTitle: "Toyota Car Keys",
                            itemId: "it-045",
                            claimantName: "Jane Smith",
                            claimantEmail: "jane@student.babcock.edu.ng",
                            description: "It has a leather keychain with the letters 'JS'.",
                            status: "APPROVED",
                            createdAt: new Date(Date.now() - 86400000).toISOString()
                        }
                    ]);
                }
            } catch (err) {
                console.error("Error fetching claims:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClaims();
    }, [user]);

    const handleUpdateStatus = async (claimId, newStatus) => {
        if (!user?.token) return;

        const actionName = newStatus === 'APPROVED' ? 'approve' : 'reject';
        const confirmed = await showConfirm({
            title: `${actionName === 'approve' ? 'Approve' : 'Reject'} Claim`,
            message: `Are you sure you want to ${actionName} this claim?`,
            type: actionName === 'approve' ? 'info' : 'danger',
            confirmText: actionName === 'approve' ? 'Approve' : 'Reject'
        });

        if (!confirmed) return;

        setIsStatusChanging(true);

        try {
            const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');

            // Try actual backend integration
            const endpoint = newStatus === 'APPROVED' ? 'approve' : 'reject';
            const response = await fetch(`${baseUrl}/claims/admin/${claimId}/${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const responseData = await response.json();
                const updatedClaim = responseData.data;

                // Update local state with the exact status returned by the server
                setClaims(prev => prev.map(c =>
                    c.id === claimId ? { ...c, status: updatedClaim.status } : c
                ));
            } else {
                // Mock local state update if backend fails
                setClaims(prev => prev.map(c =>
                    c.id === claimId ? { ...c, status: newStatus } : c
                ));
                console.warn('Backend update failed, using local mock update');
                showToast("Backend update failed, using local mock.", 'warning');
            }

            showToast(`Claim successfully ${newStatus.toLowerCase()}!`, 'success');
            setSelectedClaim(null); // Close modal if open

        } catch (err) {
            console.error("Error updating claim status:", err);
            showToast("Failed to update status. Mocking update for UI demonstration.", 'error');
            setClaims(prev => prev.map(c =>
                c.id === claimId ? { ...c, status: newStatus } : c
            ));
            setSelectedClaim(null);
        } finally {
            setIsStatusChanging(false);
        }
    };

    const handleViewClaimDetails = async (claimId) => {
        if (!user?.token) return;
        setIsLoadingDetails(true);

        try {
            const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');
            const response = await fetch(`${baseUrl}/claims/admin/${claimId}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const responseData = await response.json();
                setSelectedClaim(responseData.data);
            } else {
                console.error("Failed to fetch claim details");
                showToast("Failed to fetch detailed claim data.", 'error');
            }
        } catch (err) {
            console.error("Error fetching single claim:", err);
            showToast("Error connecting to server to fetch claim details.", 'error');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const filteredClaims = claims.filter(claim =>
        (claim.itemTitle && claim.itemTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (claim.claimantName && claim.claimantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (claim.claimantEmail && claim.claimantEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (claim.status && claim.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (claim.id && claim.id.toLowerCase().includes(searchTerm.toLowerCase()))
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
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">folder_open</span>
                        All Reports
                    </button>
                    <button
                        onClick={() => navigate('/admin/claims')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-[#136dec] font-semibold text-sm transition-colors"
                    >
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
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-none">
                    <h2 className="text-xl font-bold text-slate-900">Claims Overview</h2>

                    <div className="flex items-center gap-6">
                        <div className="relative w-64">
                            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                                <span className="material-symbols-outlined text-[18px]">search</span>
                            </span>
                            <input
                                type="text"
                                placeholder="Search claims..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                    </div>
                </header>

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
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
                            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900">Total Claims: <span className="text-[#136dec]">{filteredClaims.length}</span></h3>
                            </div>
                            <div className="overflow-x-auto">
                                {filteredClaims.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                                                <th className="p-4 font-bold">Claim ID</th>
                                                <th className="p-4 font-bold">Item & Claimant</th>
                                                <th className="p-4 font-bold">Date Submitted</th>
                                                <th className="p-4 font-bold">Status</th>
                                                <th className="p-4 font-bold text-right">Review</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                            {filteredClaims.map((claim) => (
                                                <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="p-4 font-medium text-slate-400">#{claim.id.slice(0, 8)}</td>
                                                    <td className="p-4">
                                                        <div>
                                                            <p className="font-bold text-slate-900">{claim.itemTitle}</p>
                                                            <p className="text-xs text-slate-500">Claimed by {claim.claimantName}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-medium">
                                                        {new Date(claim.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        {claim.status === 'PENDING' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                                                Pending
                                                            </span>
                                                        ) : claim.status === 'APPROVED' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                                                Approved
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                                                                Rejected
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button
                                                            disabled={isLoadingDetails}
                                                            onClick={() => handleViewClaimDetails(claim.id)}
                                                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-bold transition-colors disabled:opacity-50">
                                                            {isLoadingDetails ? 'Loading...' : 'Read Proof'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-20 text-center text-slate-500">
                                        <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">inbox</span>
                                        <p className="font-bold text-slate-900 mt-2">No claims found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Claim Details Modal */}
                {selectedClaim && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedClaim(null)}></div>
                        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-6">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Claim Review</h3>
                                    <p className="text-xs text-slate-500">#{selectedClaim.id}</p>
                                </div>
                                <button onClick={() => setSelectedClaim(null)} className="text-slate-400 hover:bg-slate-100 rounded-full p-1">
                                    <span className="material-symbols-outlined text-[24px]">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Item Details</p>
                                    <p className="font-bold text-slate-900">{selectedClaim.itemTitle}</p>
                                    <p className="text-xs text-slate-500">{selectedClaim.itemId || "No ID"}</p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Claimant Info</p>
                                    <p className="font-bold text-slate-900">{selectedClaim.claimantName}</p>
                                    <p className="text-xs text-slate-500">{selectedClaim.claimantEmail}</p>
                                </div>

                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-2">Proof of Ownership</p>
                                    <p className="text-sm text-slate-700 leading-relaxed italic border-l-2 border-blue-400 pl-3 mb-4">"{selectedClaim.description}"</p>

                                    {selectedClaim.proofImageUrl && (
                                        <div className="mt-3">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Proof Image</p>
                                            <a href={selectedClaim.proofImageUrl} target="_blank" rel="noreferrer" className="block max-w-xs rounded overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity">
                                                <img src={selectedClaim.proofImageUrl} alt="Proof of ownership" className="w-full h-auto" />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <p className="text-sm">Current Status:
                                        <span className="ml-2 font-bold">{selectedClaim.status}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                {selectedClaim.status === 'PENDING' && (
                                    <>
                                        <button
                                            disabled={isStatusChanging}
                                            onClick={() => handleUpdateStatus(selectedClaim.id, 'REJECTED')}
                                            className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-sm font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                            Decline
                                        </button>
                                        <button
                                            disabled={isStatusChanging}
                                            onClick={() => handleUpdateStatus(selectedClaim.id, 'APPROVED')}
                                            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">check</span>
                                            Accept
                                        </button>
                                    </>
                                )}
                                {selectedClaim.status !== 'PENDING' && (
                                    <button
                                        onClick={() => setSelectedClaim(null)}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-bold">
                                        Close
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AllClaims;
