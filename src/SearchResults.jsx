import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import CampusMap from './components/CampusMap';
import { useUI } from './context/UIContext';

const SearchResults = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useUI();

    // Parse URL params
    const searchParams = new URLSearchParams(location.search);
    const initialQuery = searchParams.get('q') || '';
    const initialCategory = searchParams.get('category');
    const initialView = searchParams.get('view') === 'map' ? 'map' : 'grid';

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [searchInput, setSearchInput] = useState(initialQuery);
    const [viewMode, setViewMode] = useState(initialView); // 'grid' | 'map'

    // Sync viewMode with URL parameter changes
    useEffect(() => {
        const currentView = new URLSearchParams(location.search).get('view');
        setViewMode(currentView === 'map' ? 'map' : 'grid');
    }, [location.search]);

    const [activeFilters, setActiveFilters] = useState({
        status: ['Lost Items'], // Default to showing Lost Items
        category: initialCategory ? [initialCategory] : [],
        dateRange: { start: '', end: '' },
        location: 'All Locations'
    });
    const [expandedCategories, setExpandedCategories] = useState(['Electronics']); // Default expanded

    // Category Data Structure
    const CATEGORY_DATA = [
        {
            name: 'Electronics',
            subcategories: ['Laptops', 'Phones', 'Tablets', 'Accessories', 'Calculators']
        },
        {
            name: 'Documents & IDs',
            subcategories: ['Student ID', 'Driver License', 'Passport', 'Textbooks', 'Notebooks']
        },
        {
            name: 'Personal Items',
            subcategories: ['Clothing', 'Bags', 'Wallets', 'Keys', 'Water Bottles']
        }
    ];

    // API state
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ limit: 12, offset: 0, total: 0 });

    useEffect(() => {
        // Fetch whenever searchQuery or filters change and reset pagination to 0
        fetchItems(0);
        setPagination(prev => ({ ...prev, offset: 0 }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, activeFilters]);

    useEffect(() => {
        // Fetch whenever offset changes (pagination)
        if (pagination.offset > 0 || items.length > 0) {
            fetchItems(pagination.offset);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.offset]);

    const fetchItems = async (currentOffset) => {
        setLoading(true);
        setError(null);
        try {
            const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');
            const params = new URLSearchParams();

            // We append q later down if needed

            if (activeFilters.status.length === 1) {
                if (activeFilters.status[0] === 'Lost Items') params.append('type', 'LOST');
                if (activeFilters.status[0] === 'Found Items') params.append('type', 'FOUND');
            }

            if (activeFilters.category.length > 0) {
                const catMap = {
                    'Laptops': 'Electronics',
                    'Phones': 'Electronics',
                    'Tablets': 'Electronics',
                    'Accessories': 'Electronics',
                    'Calculators': 'Electronics',
                    'Student ID': 'Documents & IDs',
                    'Driver License': 'Documents & IDs',
                    'Passport': 'Documents & IDs',
                    'Textbooks': 'Documents & IDs',
                    'Notebooks': 'Documents & IDs',
                    'Clothing': 'Clothing & Accessories',
                    'Bags': 'Clothing & Accessories',
                    'Wallets': 'Clothing & Accessories',
                    'Keys': 'Keys',
                    'Water Bottles': 'Other'
                };
                const selectedCat = activeFilters.category[0];
                const mappedCategory = catMap[selectedCat] || selectedCat;
                params.append('category', mappedCategory);
            }

            if (activeFilters.location !== 'All Locations') {
                params.append('location', activeFilters.location);
            }

            params.append('limit', pagination.limit);
            params.append('offset', currentOffset);

            // Create React App proxy will only forward requests reliably if they accept json
            const headers = {
                'Accept': 'application/json'
            };

            let fetchUrl = '';
            // Backend /items/search throws 400 if q is empty or < 1 char. 
            // Better to fetch all items via /items if there's no query.
            if (searchQuery.trim().length > 0) {
                params.append('q', searchQuery.trim());
                fetchUrl = `${baseUrl}/items/search?${params.toString()}`;
            } else {
                fetchUrl = `${baseUrl}/items?${params.toString()}`;
            }

            const response = await fetch(fetchUrl, { headers });
            if (!response.ok) {
                let errorMsg = `Server returned ${response.status}`;
                try {
                    const text = await response.text();
                    if (text.includes("Proxy error") || text.includes("<!DOCTYPE html>")) {
                        errorMsg = "Backend server is waking up or proxy failed. Please refresh.";
                    } else {
                        try {
                            const json = JSON.parse(text);
                            if (json.message) {
                                // Sometimes message is an array from class-validator
                                errorMsg = Array.isArray(json.message) ? json.message.join(', ') : json.message;
                            }
                        } catch (e) { }
                    }
                } catch (e) { }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            if (data.status === 'success') {
                setItems(data.data || []);
                setPagination(prev => ({ ...prev, total: data.pagination?.total || data.data?.length || 0, offset: currentOffset }));
            } else {
                throw new Error(data.message || 'Error searching items');
            }
        } catch (err) {
            console.error('Search error:', err);
            setError(err.message);
            setItems([]);
            showToast("Failed to perform search. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const toggleCategoryExpansion = (categoryName) => {
        setExpandedCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
    };

    const handleStatusChange = (status) => {
        setActiveFilters(prev => {
            const currentStatuses = prev.status;
            const newStatuses = currentStatuses.includes(status)
                ? currentStatuses.filter(s => s !== status)
                : [...currentStatuses, status];
            return { ...prev, status: newStatuses };
        });
    };

    const handleCategorySelect = (subcategory) => {
        setActiveFilters(prev => {
            const currentCategories = prev.category;
            const newCategories = currentCategories.includes(subcategory)
                ? currentCategories.filter(c => c !== subcategory)
                : [...currentCategories, subcategory];
            return { ...prev, category: newCategories };
        });
    };

    // The filteredItems mock logic is removed as we fetch directly.

    return (
        <div className="flex flex-col h-screen w-full bg-[#f8f9fc] dark:bg-slate-950 overflow-hidden font-['Lexend'] transition-colors duration-300">
            <Header />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Filters */}
                <aside className="hidden lg:block w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto flex-none transition-colors duration-300">
                    <div className="p-6 sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-slate-100 dark:border-slate-800 mb-2 transition-colors duration-300">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h2>
                            <button
                                onClick={() => {
                                    setActiveFilters({
                                        status: [],
                                        category: [],
                                        dateRange: { start: '', end: '' },
                                        location: 'All Locations'
                                    });
                                    setSearchQuery('');
                                }}
                                className="text-sm font-medium text-primary hover:text-blue-700"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Status Section */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Status</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="peer w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20 bg-white dark:bg-slate-700"
                                            checked={activeFilters.status.includes('Lost Items')}
                                            onChange={() => handleStatusChange('Lost Items')}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Lost Items</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="peer w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20 bg-white dark:bg-slate-700"
                                            checked={activeFilters.status.includes('Found Items')}
                                            onChange={() => handleStatusChange('Found Items')}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Found Items</span>
                                </label>
                            </div>
                        </div>

                        {/* Category Section */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Category</h3>
                            <div className="space-y-3">
                                {CATEGORY_DATA.map((cat) => {
                                    const isExpanded = expandedCategories.includes(cat.name);
                                    return (
                                        <div key={cat.name} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-colors">
                                            <button
                                                onClick={() => toggleCategoryExpansion(cat.name)}
                                                className="w-full flex items-center justify-between p-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                            >
                                                <span>{cat.name}</span>
                                                <span className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                                            </button>

                                            {/* Subcategories with simple animation logic */}
                                            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                <div className="p-3 pt-0 space-y-2 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
                                                    {cat.subcategories.map(sub => (
                                                        <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                                                            <div className="relative flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    className="peer w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20 bg-white dark:bg-slate-700"
                                                                    checked={activeFilters.category.includes(sub)}
                                                                    onChange={() => handleCategorySelect(sub)}
                                                                />
                                                            </div>
                                                            <span className={`text-sm text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors ${activeFilters.category.includes(sub) ? 'font-medium text-primary dark:text-blue-400' : ''}`}>
                                                                {sub}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Date Range */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Date Range</h3>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">From</label>
                                    <input type="date" className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 focus:border-primary outline-none" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">To</label>
                                    <input type="date" className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 focus:border-primary outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Location</h3>
                            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-primary/50 transition-colors">
                                <span>All Locations</span>
                                <span className="material-symbols-outlined text-slate-400">expand_more</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <div className="max-w-7xl mx-auto flex flex-col gap-8">

                        {/* Header Section */}
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                {viewMode === 'grid' && (
                                    <div className="space-y-1">
                                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Search Results</h1>
                                        <p className="text-slate-500 dark:text-slate-400">Find what you've lost, or help return what you've found.</p>
                                    </div>
                                )}
                            </div>

                            {/* Search Bar & Filters (Grid Only) */}
                            {viewMode === 'grid' && (
                                <>
                                    <div className="relative max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full h-14 pl-12 pr-24 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                                            placeholder="Search for items like 'Macbook', 'Blue Wallet', 'ID Card'..."
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            // Submit on enter
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    setSearchQuery(searchInput);
                                                }
                                            }}
                                        />
                                        <button
                                            className="absolute inset-y-2 right-2 px-4 bg-[#136dec] hover:bg-blue-600 text-white font-medium rounded-lg text-sm transition-colors"
                                            onClick={() => {
                                                setSearchQuery(searchInput);
                                            }}
                                        >
                                            Search
                                        </button>
                                    </div>

                                    {/* Active Filters */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mr-2">Active:</span>
                                        {activeFilters.status.map(status => (
                                            <span key={status} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-100 dark:border-blue-900/30">
                                                {status}
                                                <button onClick={() => handleStatusChange(status)} className="hover:text-blue-900 dark:hover:text-blue-200"><span className="material-symbols-outlined text-[14px] align-middle">close</span></button>
                                            </span>
                                        ))}
                                        {activeFilters.category.map(cat => (
                                            <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-100 dark:border-emerald-900/30">
                                                {cat}
                                                <button onClick={() => handleCategorySelect(cat)} className="hover:text-emerald-900 dark:hover:text-emerald-200"><span className="material-symbols-outlined text-[14px] align-middle">close</span></button>
                                            </span>
                                        ))}
                                        {(activeFilters.status.length === 0 && activeFilters.category.length === 0) && (
                                            <span className="text-xs text-slate-400 italic">No filters active</span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Results Grid / Map */}
                        {items.length > 0 && !loading ? (
                            viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 group flex flex-col">
                                            {/* Image Area */}
                                            <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800">
                                                        <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                                                        <span className="text-xs font-medium">No Image Provided</span>
                                                    </div>
                                                )}

                                                <div className="absolute top-4 left-4">
                                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border ${item.type === 'FOUND'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        : 'bg-rose-50 text-rose-700 border-rose-100'
                                                        }`}>
                                                        {item.type === 'FOUND' ? 'Found' : 'Lost'}
                                                    </span>
                                                </div>

                                                <div className="absolute top-4 right-4 text-xs font-medium text-white drop-shadow-md bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm">
                                                    {new Date(item.dateReported || item.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="p-5 flex flex-col flex-1">
                                                <div className="mb-4">
                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 truncate" title={item.title}>{item.title}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>
                                                </div>

                                                <div className="mt-auto space-y-4">
                                                    <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                                                        <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-slate-500 shrink-0">location_on</span>
                                                        <span className="mt-0.5">{item.location}</span>
                                                    </div>

                                                    <button className="w-full py-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-[#136dec] dark:text-blue-400 hover:bg-[#136dec] hover:text-white dark:hover:bg-blue-600 font-semibold text-sm transition-all duration-200" onClick={() => navigate(`/found-item-details/${item.id}`, { state: item })}>
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Map View
                                <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                                    <CampusMap items={items} />
                                </div>
                            )
                        ) : loading ? (
                            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
                        ) : error ? (
                            <div className="flex justify-center py-20 text-red-500 font-medium">Error: {error}</div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-4xl text-slate-400">search_off</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No results found</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                    Try adjusting your filters or search for something else.
                                </p>
                                <button
                                    onClick={() => {
                                        setActiveFilters({
                                            status: [],
                                            category: [],
                                            dateRange: { start: '', end: '' },
                                            location: 'All Locations'
                                        });
                                        setSearchQuery('');
                                        setSearchInput('');
                                    }}
                                    className="mt-6 px-6 py-2 bg-[#136dec] text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {items.length > 0 && !loading && (
                            <div className="flex justify-center mt-8 mb-8">
                                <nav className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                                        disabled={pagination.offset === 0}
                                        className="size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                    </button>

                                    <span className="mx-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Page {Math.floor(pagination.offset / pagination.limit) + 1}
                                    </span>

                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                                        disabled={items.length < pagination.limit}
                                        className="size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                    </button>
                                </nav>
                            </div>
                        )}

                        {items.length > 0 && !loading && (
                            <div className="text-center text-slate-400 text-sm font-medium">
                                Showing {pagination.offset + 1}-{pagination.offset + items.length} results
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
};

export default SearchResults;
