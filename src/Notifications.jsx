import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import { useAuth } from './context/AuthContext';
import { useUI } from './context/UIContext';
import LoadingSpinner from './components/LoadingSpinner';

const Notifications = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useUI();
    const [activeTab, setActiveTab] = useState('all');

    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isMarkingRead, setIsMarkingRead] = useState(null); // id of notification being marked

    const TAKE = 20;

    const fetchNotifications = async (pageNum = 0, append = false) => {
        if (!user?.token) return;

        try {
            setError(null);
            if (!append) setIsLoading(true);

            const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');
            const skip = pageNum * TAKE;
            const response = await fetch(`${baseUrl}/notifications?skip=${skip}&take=${TAKE}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Unauthorized. Please log in again.");
                }
                throw new Error("Failed to load notifications");
            }

            const data = await response.json();

            if (append) {
                setNotifications(prev => [...prev, ...(data.data || [])]);
            } else {
                setNotifications(data.data || []);
            }

            setHasMore((data.data?.length || 0) === TAKE);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setError(err.message);
            showToast("Failed to fetch notifications.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(0, false);
    }, [user]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNotifications(nextPage, true);
    };

    const markAsRead = async (id) => {
        if (!user?.token || isMarkingRead) return;

        try {
            setIsMarkingRead(id);
            const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');
            const response = await fetch(`${baseUrl}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error("Failed to mark as read");
            }

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, isRead: true } : notif
                )
            );

        } catch (err) {
            console.error("Error marking notification as read:", err);
        } finally {
            setIsMarkingRead(null);
        }
    };

    const markAllAsRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.isRead);
        if (unreadNotifications.length === 0) return;

        // Mark all sequentially (can be slow, but robust)
        for (let notif of unreadNotifications) {
            await markAsRead(notif.id);
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Derived counts
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="flex flex-col h-screen w-full bg-white dark:bg-slate-950 overflow-hidden font-['Lexend'] transition-colors duration-300">
            <Header />

            <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-6 py-10">

                    {/* Page Header */}
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Notifications</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Stay updated on your lost and found reports.</p>
                        </div>
                        <button
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0 || isMarkingRead}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition-colors ${unreadCount === 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent cursor-not-allowed' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">done_all</span>
                            Mark all as read
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-5 py-2 rounded-t-lg text-sm font-bold transition-colors border-b-2 ${activeTab === 'all' ? 'border-[#136dec] text-[#136dec] bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                        >
                            All
                            {unreadCount > 0 && <span className="ml-2 bg-[#136dec] text-white px-2 py-0.5 rounded-full text-[10px]">{unreadCount}</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('unread')}
                            className={`px-5 py-2 rounded-t-lg text-sm font-bold transition-colors border-b-2 ${activeTab === 'unread' ? 'border-[#136dec] text-[#136dec] bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                        >
                            Unread
                        </button>
                    </div>

                    {/* Content Section */}
                    {isLoading && page === 0 ? (
                        <div className="flex justify-center items-center py-20">
                            <LoadingSpinner />
                        </div>
                    ) : error ? (
                        <div className="text-center py-10 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                            <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                            <button onClick={() => fetchNotifications(0)} className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Try Again</button>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center size-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
                                <span className="material-symbols-outlined text-[32px]">notifications_off</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No notifications yet</h3>
                            <p className="text-slate-500 dark:text-slate-400">You're all caught up! Check back later for updates.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {notifications
                                .filter(n => activeTab === 'all' || (activeTab === 'unread' && !n.isRead))
                                .map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-5 rounded-2xl border ${!notification.isRead ? 'border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'} hover:border-blue-300 hover:shadow-sm transition-all relative overflow-hidden group`}
                                    >
                                        {!notification.isRead && <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#136dec]"></div>}

                                        <div className="flex items-start gap-4">
                                            <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${!notification.isRead ? 'bg-[#136dec] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                <span className="material-symbols-outlined text-[20px]">
                                                    {notification.title.toLowerCase().includes('match') ? 'search_check' :
                                                        notification.title.toLowerCase().includes('approv') ? 'check_circle' : 'notifications'}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`font-bold ${!notification.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'} text-base`}>
                                                        {notification.title}
                                                    </h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{formatDate(notification.createdAt)}</span>

                                                        {/* Mark as read button (visible on hover or if unread) */}
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                disabled={isMarkingRead === notification.id}
                                                                className="text-[#136dec] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 opacity-60 hover:opacity-100 transition-opacity flex items-center"
                                                                title="Mark as read"
                                                            >
                                                                {isMarkingRead === notification.id ?
                                                                    <LoadingSpinner size="sm" /> :
                                                                    <span className="material-symbols-outlined text-[16px]">check</span>
                                                                }
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className={`text-sm mb-3 leading-relaxed ${!notification.isRead ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {notification.message}
                                                </p>

                                                {notification.matchedItemId && (
                                                    <button
                                                        onClick={() => navigate(`/found-item-details/${notification.matchedItemId}`)}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#136dec] dark:hover:border-blue-500 hover:text-[#136dec] dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-lg transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                        View Item Details
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            {/* Load More Button */}
                            {hasMore && (
                                <div className="flex justify-center mt-6">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoading}
                                        className="flex flex-col items-center gap-2 cursor-pointer group px-6 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        {isLoading ? (
                                            <LoadingSpinner size="sm" />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-slate-400 group-hover:text-[#136dec] transition-colors">keyboard_arrow_down</span>
                                                <span className="text-xs font-bold text-slate-500 group-hover:text-[#136dec] transition-colors uppercase tracking-wider">Load older notifications</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {!hasMore && notifications.length > 0 && (
                                <div className="text-center py-8">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">End of notifications</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default Notifications;
