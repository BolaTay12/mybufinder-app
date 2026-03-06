import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useUI } from './context/UIContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Access user data from context
  const { showToast } = useUI();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('recently-lost');

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');

        // Determine endpoint based on active tab and ask for 12 items specifically
        const endpoint = activeTab === 'recently-lost' ? '/items/recently-lost?limit=12' : '/items/recently-found?limit=12';

        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${user?.token || ''}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch items. Status: ${response.status}`);
        }

        const data = await response.json();
        setItems(data.data || []);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError(err.message);
        showToast("Failed to load dashboard items.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [user, activeTab]); // Add activeTab to dependency array

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search-results');
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/search-results?category=${encodeURIComponent(category)}`);
  };

  const handleCardClick = (item) => {
    // If it's a found item, users try to claim it (View Details)
    // If it's a lost item, users view the match analysis (where the system tries to find it)
    if (item.type === 'FOUND') {
      navigate(`/found-item-details/${item.id}`, { state: { ...item } });
    } else {
      navigate('/match-analysis', { state: { ...item } });
    }
  };

  // Filter items by APPROVED status
  // For testing purposes, we are currently showing ALL items including PENDING.
  // In production, uncomment the filter below.
  const displayItems = items; // items.filter(item => item.status === 'APPROVED');

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-slate-950 transition-colors duration-300">
      {/* Top Navigation */}
      <Header />

      <div className="flex flex-1 overflow-hidden w-full">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#e8eaed] dark:bg-slate-950">
          {/* Hero Section */}
          <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
              <div className="flex flex-col items-center text-center gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Lost something on campus?
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-lg mx-auto">
                    Search across Babcock University for ID cards, electronics, keys, and more. We help reunite students with their belongings.
                  </p>
                </div>
                <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400">search</span>
                  </div>
                  <input
                    className="w-full h-14 pl-12 pr-32 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white placeholder:text-slate-400 text-base shadow-sm transition-all"
                    placeholder="Try searching for 'Blue Jansport Backpack'..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-1.5 flex items-center">
                    <button
                      type="submit"
                      className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </form>

                {/* Quick Categories */}
                <div className="flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={() => handleCategoryClick('Documents')} className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors">ID Cards</button>
                  <button type="button" onClick={() => handleCategoryClick('Electronics')} className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors">Electronics</button>
                  <button type="button" onClick={() => handleCategoryClick('Keys')} className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors">Keys</button>
                  <button type="button" onClick={() => handleCategoryClick('Books')} className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors">Books</button>
                </div>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="p-6 md:p-6 w-full flex-1">
            {/* Tab Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              <div className="p-1 bg-slate-200 dark:bg-slate-800 rounded-lg flex w-full sm:w-auto">
                <button
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'recently-lost'
                    ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  onClick={() => setActiveTab('recently-lost')}
                >
                  Recently Lost
                </button>
                <button
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'recently-found'
                    ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  onClick={() => setActiveTab('recently-found')}
                >
                  Recently Found
                </button>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary px-2 py-1">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  Filter
                </button>
                <button className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary px-2 py-1">
                  <span className="material-symbols-outlined text-[18px]">sort</span>
                  Newest
                </button>
              </div>
            </div>

            {/* Dynamic Items Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-rose-500 font-medium">{error}</p>
              </div>
            ) : displayItems.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">inventory_2</span>
                <h3 className="font-bold text-slate-700 dark:text-slate-300">No approved items found</h3>
                <p className="text-sm text-slate-500 mt-1">Check back later or change your category filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayItems.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => handleCardClick(item)}
                    className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 cursor-pointer flex flex-col h-full animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                  >
                    <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors duration-500">
                      {item.imageUrl ? (
                        <img
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={item.imageUrl}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      {/* Fallback Icon if no image or image fails to load */}
                      <div className={`absolute inset-0 flex items-center justify-center ${item.imageUrl ? 'hidden' : ''}`}>
                        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">
                          {item.category?.toLowerCase() === 'electronics' ? 'devices' :
                            item.category?.toLowerCase() === 'documents' ? 'badge' :
                              item.category?.toLowerCase() === 'keys' ? 'key' : 'inventory_2'}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-md text-white text-[10px] font-bold uppercase tracking-wider shadow-sm ${item.type === 'FOUND' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                          {item.type}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{item.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mt-auto">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span className="truncate">{item.location && item.location.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-medium text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <button className="text-primary text-xs font-bold hover:underline">
                          {item.type === 'FOUND' ? 'Claim Item' : 'View Matches'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {!isLoading && !error && displayItems.length > 0 && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => navigate('/search-results')}
                  className="px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  View All Items
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
