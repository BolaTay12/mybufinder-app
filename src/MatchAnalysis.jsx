import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';

const MatchAnalysis = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // The item passed from the dashboard when clicking "View Matches"
    const passedItem = location.state;

    // Use the passed item if it exists, otherwise fall back to a mock item
    const [lostItem] = useState(passedItem ? {
        id: `L-${passedItem.id ? passedItem.id.toString().substring(0, 4) : 'XXXX'}`,
        rawId: passedItem.id,
        type: passedItem.category || "Item",
        title: passedItem.title || "Unknown Title",
        description: passedItem.description || "No description provided",
        location: passedItem.location ? passedItem.location.replace(/_/g, ' ') : "Unknown",
        date: passedItem.createdAt ? new Date(passedItem.createdAt).toLocaleDateString() : "Unknown Date",
        image: passedItem.imageUrl || null
    } : {
        id: "L-4029",
        rawId: null,
        type: "Backpack",
        title: "Lost Item",
        description: "Nike Navy Blue Backpack lost at cafeteria",
        location: "Main Cafeteria",
        date: "Oct 24, 2023",
        image: null
    });

    const [foundItems, setFoundItems] = useState([]);
    const [matchResults, setMatchResults] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fetchingItems, setFetchingItems] = useState(true);
    const [itemsError, setItemsError] = useState(null);

    const [aiResult, setAiResult] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    // Fetch potential matches (found items)
    useEffect(() => {
        const fetchFoundItems = async () => {
            if (!lostItem.rawId) {
                setFetchingItems(false);
                return;
            }

            setFetchingItems(true);
            try {
                const userString = localStorage.getItem('user');
                const user = userString ? JSON.parse(userString) : null;
                const token = user?.token || '';

                const rawBaseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production-04b6.up.railway.app');
        const baseUrl = rawBaseUrl && !rawBaseUrl.startsWith('http') && process.env.NODE_ENV !== 'development' ? 'https://' + rawBaseUrl : rawBaseUrl;
                // Fetch potential matches using new endpoint
                const response = await fetch(`${baseUrl}/items/${lostItem.rawId}/matches`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Server Error: Unable to fetch potential matches');
                const data = await response.json();

                const matches = data.data || [];
                setFoundItems(matches.map(m => m.item));

                const formattedAiResults = matches.map(m => ({
                    confidence: Math.round((m.score || 0) * 100),
                    reason: m.reasoning || "Match analyzed.",
                    matches: m.matchAreas ? Object.entries(m.matchAreas).map(([field, isMatch]) => ({
                        field,
                        isMatch,
                        details: ""
                    })) : []
                }));

                setMatchResults(formattedAiResults);
            } catch (error) {
                console.error("Error fetching found items:", error);
                setItemsError(error.message === 'Failed to fetch' || error.message.includes('NetworkError') ? 'Network Error' : error.message);
            } finally {
                setFetchingItems(false);
            }
        };

        fetchFoundItems();
    }, [lostItem.rawId]);

    const currentFoundItemRaw = foundItems[currentIndex];
    const foundItem = currentFoundItemRaw ? {
        id: `F-${currentFoundItemRaw.id ? currentFoundItemRaw.id.toString().substring(0, 4) : 'XXXX'}`,
        rawId: currentFoundItemRaw.id,
        type: currentFoundItemRaw.category || "Item",
        title: currentFoundItemRaw.title || "Unknown Title",
        description: currentFoundItemRaw.description || "No description provided",
        location: currentFoundItemRaw.location ? currentFoundItemRaw.location.replace(/_/g, ' ') : "Unknown",
        date: currentFoundItemRaw.createdAt ? new Date(currentFoundItemRaw.createdAt).toLocaleDateString() : "Unknown Date",
        image: currentFoundItemRaw.imageUrl || null
    } : null;

    useEffect(() => {
        if (!foundItem || matchResults.length === 0) return;
        setAiResult(matchResults[currentIndex]);
    }, [currentIndex, foundItems.length, matchResults, foundItem]);

    if (fetchingItems) {
        return (
            <div className="relative flex h-screen w-full flex-col bg-slate-50">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
                    <LoadingSpinner size="lg" color="blue" />
                    <p className="text-slate-500 font-medium">Gathering potential matches...</p>
                </div>
            </div>
        );
    }

    if (!fetchingItems && foundItems.length === 0) {
        return (
            <div className="relative flex h-screen w-full flex-col bg-slate-50">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300">search_off</span>
                    <h2 className="text-2xl font-bold text-slate-800">No Potential Matches Yet</h2>
                    <p className="text-slate-500 max-w-sm">
                        No one has reported finding an item similar to yours recently. Don't worry, we'll keep checking!
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 px-6 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const nextMatch = () => setCurrentIndex(prev => Math.min(foundItems.length - 1, prev + 1));
    const prevMatch = () => setCurrentIndex(prev => Math.max(0, prev - 1));

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-slate-950 transition-colors duration-300">
            <Header />

            <main className="flex-1 w-full overflow-y-auto bg-[#f8f9fa] dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/dashboard')}>Dashboard</span>
                            <span className="material-symbols-outlined text-xs">chevron_right</span>
                            <span className="hover:text-primary cursor-pointer">Lost Reports</span>
                            <span className="material-symbols-outlined text-xs">chevron_right</span>
                            <span className="font-semibold text-slate-900 dark:text-white">Match Analysis #{lostItem.id}</span>
                        </div>

                        {/* Pagination controls */}
                        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <button
                                onClick={prevMatch}
                                disabled={currentIndex === 0 || loadingAI}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-slate-600"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Match {currentIndex + 1} <span className="text-slate-400 font-medium">of</span> {foundItems.length}
                            </span>
                            <button
                                onClick={nextMatch}
                                disabled={currentIndex === foundItems.length - 1 || loadingAI}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-slate-600"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Potential Match Found
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
                                {loadingAI ? "Our AI is currently analyzing this match..." : aiResult?.reason || "Our system found an item that resembles your lost report. Please review the comparison below."}
                            </p>
                        </div>

                        {/* AI Confidence Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 min-w-[280px]">
                            <div className="relative size-16">
                                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-blue-100 dark:text-blue-900/30"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                    />
                                    {loadingAI ? (
                                        <path
                                            className="text-blue-600 dark:text-blue-500 opacity-50 animate-pulse"
                                            strokeDasharray="100, 100"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        />
                                    ) : (
                                        <path
                                            className="text-blue-600 dark:text-blue-500 transition-all duration-1000 ease-out"
                                            strokeDasharray={`${aiResult?.confidence || 0}, 100`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />
                                    )}
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center pt-1">
                                    {loadingAI ? (
                                        <span className="material-symbols-outlined text-blue-500 animate-spin">sync</span>
                                    ) : (
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{aiResult?.confidence || 0}%</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">AI Confidence</p>
                                <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                    {loadingAI ? "Analyzing..." : (aiResult?.confidence >= 80 ? "High Match Probability" : aiResult?.confidence >= 50 ? "Possible Match" : "Low Match Probability")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Section */}
                    {foundItem && (
                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Center Arrow */}
                            <div className="hidden md:flex absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 rounded-full p-2 shadow-md border border-slate-100 dark:border-slate-700">
                                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">compare_arrows</span>
                            </div>

                            {/* Left Card: Your Report */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full opacity-100 transition-opacity">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">inventory_2</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-200">Your Report (#{lostItem.id})</span>
                                    </div>
                                    <span className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">Lost Item</span>
                                </div>

                                <div className="p-6 space-y-6 flex-1">
                                    <div className="aspect-video w-full rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden relative border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                                        {lostItem.image ? (
                                            <img
                                                src={lostItem.image}
                                                alt="My Lost Item"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                                <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                                                <span className="text-sm font-medium">No Image Provided</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-0 text-sm">
                                        {Object.entries(lostItem).filter(([key]) => !['id', 'image', 'date', 'location'].includes(key)).map(([key, value]) => {
                                            const matchData = aiResult?.matches?.find(m => m.field.toLowerCase() === key.toLowerCase() || m.field.toLowerCase().includes(key.toLowerCase()));

                                            return (
                                                <div key={key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                                                    <span className="text-slate-500 dark:text-slate-400 capitalize">{key}</span>
                                                    <div className="flex items-center gap-2 text-right">
                                                        <span className="font-semibold text-slate-900 dark:text-white capitalize">{value}</span>
                                                        {!loadingAI && matchData && (
                                                            <span className={`material-symbols-outlined text-[18px] ${matchData.isMatch ? 'text-blue-500' : 'text-red-400'}`}>
                                                                {matchData.isMatch ? 'check_circle' : 'cancel'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                                            <span className="text-slate-500 dark:text-slate-400">Location Lost</span>
                                            <span className="font-semibold text-slate-900 dark:text-white text-right">{lostItem.location}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-3">
                                            <span className="text-slate-500 dark:text-slate-400">Date Lost</span>
                                            <span className="font-semibold text-slate-900 dark:text-white text-right">{lostItem.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Card: Potential Match */}
                            <div className="bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border-2 border-blue-500/20 dark:border-blue-500/30 shadow-sm overflow-hidden flex flex-col h-full ring-4 ring-blue-500/5 dark:ring-blue-500/10 transition-opacity">
                                <div className="p-4 border-b border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">find_in_page</span>
                                        <span className="font-bold text-slate-900 dark:text-white">Potential Match (#{foundItem.id})</span>
                                    </div>
                                    <span className="px-2.5 py-1 rounded bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">Found Item</span>
                                </div>

                                <div className="p-6 space-y-6 flex-1">
                                    <div className="aspect-video w-full rounded-xl bg-white dark:bg-slate-900 overflow-hidden relative border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                                        {foundItem.image ? (
                                            <img
                                                src={foundItem.image}
                                                alt="Found Item"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                                <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                                                <span className="text-sm font-medium">No Image Provided</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-0 text-sm">
                                        {Object.entries(foundItem).filter(([key]) => !['id', 'rawId', 'image', 'date', 'location'].includes(key)).map(([key, value]) => {
                                            const matchData = aiResult?.matches?.find(m => m.field.toLowerCase() === key.toLowerCase() || m.field.toLowerCase().includes(key.toLowerCase()));

                                            return (
                                                <div key={key} className="flex relative flex-col border-b border-blue-100/50 dark:border-blue-900/30">
                                                    <div className="flex items-center justify-between py-3 gap-4">
                                                        <span className="text-slate-500 dark:text-slate-400 capitalize">{key}</span>
                                                        <div className="flex items-center justify-end gap-2 text-right">
                                                            <span className="font-semibold text-slate-900 dark:text-white capitalize">{value}</span>
                                                            {!loadingAI && matchData && (
                                                                <span className={`material-symbols-outlined text-[18px] ${matchData.isMatch ? 'text-blue-500' : 'text-red-400'}`}>
                                                                    {matchData.isMatch ? 'check_circle' : 'cancel'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Tooltip explanation of mismatch / match provided by AI */}
                                                    {!loadingAI && matchData && matchData.details && !matchData.isMatch && (
                                                        <p className="text-[11px] text-red-500/80 italic pb-2 text-right">{matchData.details}</p>
                                                    )}
                                                    {!loadingAI && matchData && matchData.details && matchData.isMatch && (
                                                        <p className="text-[11px] text-blue-500/80 italic pb-2 text-right">{matchData.details}</p>
                                                    )}
                                                </div>
                                            )
                                        })}

                                        <div className="flex items-center justify-between py-3 border-b border-blue-100/50 dark:border-blue-900/30 bg-orange-50 dark:bg-orange-900/20 -mx-6 px-6 relative">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-300 dark:bg-orange-500"></div>
                                            <span className="text-slate-500 dark:text-slate-400 shrink-0">Location Found</span>
                                            <div className="text-right pl-4">
                                                <div className="font-semibold text-slate-900 dark:text-white line-clamp-2">{foundItem.location}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between py-3">
                                            <span className="text-slate-500 dark:text-slate-400">Date Found</span>
                                            <span className="font-semibold text-slate-900 dark:text-white text-right">{foundItem.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Footer */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-sm border border-slate-100 dark:border-slate-700 md:mb-12">
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Does this item belong to you?</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                                Confirming ownership will notify the finder and allow you to arrange a pickup.
                                If this isn't yours, skip to the next potential match.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <button
                                className="h-11 px-6 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                onClick={() => {
                                    if (currentIndex < foundItems.length - 1) {
                                        nextMatch();
                                    } else {
                                        navigate('/dashboard');
                                    }
                                }}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    {currentIndex === foundItems.length - 1 ? 'exit_to_app' : 'skip_next'}
                                </span>
                                {currentIndex === foundItems.length - 1 ? 'Not Mine, Return' : 'Not Mine, Show Next'}
                            </button>
                            <button
                                className={`h-11 px-6 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm ${aiResult?.confidence < 50 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 dark:shadow-blue-900/20'}`}
                                onClick={() => {
                                    if (aiResult?.confidence >= 50) {
                                        navigate(`/found-item-details/${foundItem.rawId}`, { state: { ...currentFoundItemRaw } });
                                    }
                                }}
                                disabled={aiResult?.confidence < 50}
                            >
                                <span className="material-symbols-outlined text-[18px]">check</span>
                                {aiResult?.confidence < 50 ? 'Match Required to Claim' : 'Confirm This is Mine'}
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default MatchAnalysis;
