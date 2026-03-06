import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';
import { useUI } from './context/UIContext';
import LoadingSpinner from './components/LoadingSpinner';

const Claims = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast, showConfirm } = useUI();

    const [claims, setClaims] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCancelling, setIsCancelling] = useState(null);

    useEffect(() => {
        const fetchMyClaims = async () => {
            if (!user?.token) return;
            try {
                setIsLoading(true);
                const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');
                const response = await fetch(`${baseUrl}/claims/my?limit=100&offset=0`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to load your claims. Status: ${response.status}`);
                }

                const result = await response.json();
                // Ensure we get an array, safely extracting from paginated API response
                const claimsData = result.data?.content || result.data || result || [];
                setClaims(Array.isArray(claimsData) ? claimsData : []);
            } catch (err) {
                console.error("Error fetching my claims:", err);
                setError(err.message);
                showToast("Failed to load your claims", 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyClaims();
    }, [user, showToast]);

    const handleCancelClaim = async (claimId) => {
        const confirmed = await showConfirm({
            title: 'Cancel Claim',
            message: 'Are you sure you want to cancel this claim request? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Cancel Claim'
        });

        if (!confirmed) return;

        try {
            setIsCancelling(claimId);
            const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');

            // Assuming there is a rejection or delete endpoint for users to cancel claims
            // Using the admin reject endpoint or similar standard REST pattern, fallback to simulation if it fails
            const response = await fetch(`${baseUrl}/claims/${claimId}/cancel`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || 'Failed to cancel claim.');
            }

            // Remove from UI
            setClaims(claims.filter(c => c.id !== claimId));
            showToast('Claim cancelled successfully', 'success');
        } catch (err) {
            console.error("Error cancelling claim:", err);
            // Inform user that API might be missing if it 404s
            if (err.message.includes('404')) {
                showToast('Cancel claim feature not yet available on the server.', 'warning');
            } else {
                showToast(err.message || 'Failed to cancel claim', 'error');
            }
        } finally {
            setIsCancelling(null);
        }
    };

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
                        <div className="mb-6 animate-in fade-in slide-in-from-left-4 duration-500">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Claims</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Track the status of your item claims.</p>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <LoadingSpinner />
                                </div>
                            ) : error ? (
                                <div className="text-center py-12 bg-rose-50 border border-rose-200 rounded-xl text-rose-600">
                                    <span className="material-symbols-outlined text-4xl mb-4">error</span>
                                    <h3 className="text-lg font-bold">Failed to load claims</h3>
                                    <p className="mt-2 text-sm max-w-sm mx-auto">{error}</p>
                                </div>
                            ) : claims.length > 0 ? (
                                claims.map((claim, index) => (
                                    <div
                                        key={claim.id}
                                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500"
                                        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                                    >
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Item Preview */}
                                            <div className="w-full md:w-48 aspect-video md:aspect-square rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden relative">
                                                {claim.item?.imageUrl ? (
                                                    <img src={claim.item.imageUrl} alt="Item" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">image</span>
                                                )}
                                                <div className="absolute top-2 left-2 flex gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md ${claim.item?.type === 'FOUND' ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'}`}>
                                                        {claim.item?.type || 'UNKNOWN'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                                            {claim.item?.title || claim.itemTitle || "Unknown Item"}
                                                        </h3>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            Claimed on {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : 'Unknown Date'}
                                                        </span>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${claim.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        claim.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {claim.status}
                                                    </span>
                                                </div>

                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-4">
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{claim.description || claim.message}"</p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">
                                                        {claim.item?.status === 'SECURED' ? 'S' : (claim.item?.submittedBy ? claim.item?.submittedBy.charAt(0) : 'U')}
                                                    </div>
                                                    <div className="text-xs">
                                                        <p className="text-slate-900 dark:text-white font-medium">
                                                            {claim.item?.status === 'SECURED' ? 'Item held by Central Security' : 'Reported by user'}
                                                        </p>
                                                        <p className="text-slate-500 dark:text-slate-400">
                                                            {claim.status === 'APPROVED' ? 'Please come with ID to claim' : 'Awaiting review'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-4">
                                                <button
                                                    onClick={() => navigate(`/found-item-details/${claim.item?.id || claim.itemId}`)}
                                                    className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
                                                >
                                                    View Item
                                                </button>
                                                {claim.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleCancelClaim(claim.id)}
                                                        disabled={isCancelling === claim.id}
                                                        className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-2"
                                                    >
                                                        {isCancelling === claim.id ? (
                                                            <><span className="material-symbols-outlined text-[16px] animate-spin">refresh</span> Cancelling...</>
                                                        ) : (
                                                            'Cancel Claim'
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <div className="size-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500">handshake</span>
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No claims yet</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mt-1">When you find an item that belongs to you, claim it and track it here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Claims;
