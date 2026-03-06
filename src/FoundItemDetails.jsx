import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from './components/Header';
import VerifyOwnershipModal from './components/VerifyOwnershipModal';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CAMPUS_LANDMARKS } from './components/CampusMap';
import LoadingSpinner from './components/LoadingSpinner';
import { useUI } from './context/UIContext';

const FoundItemDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { itemId: id } = useParams(); // Map itemId from route to local 'id' variable

    // Eagerly pull state from location if available, but let fetch override
    const itemFromState = location.state;

    const [itemData, setItemData] = useState(itemFromState || null);
    const [isLoading, setIsLoading] = useState(!itemFromState);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const { showToast } = useUI();

    useEffect(() => {
        const fetchItemDetails = async () => {
            if (!id) return;
            try {
                // Keep loading visually silent if we already have eager state
                if (!itemFromState) setIsLoading(true);

                const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');
                const response = await fetch(`${baseUrl}/items/${id}`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch item. Status: ${response.status}`);
                }

                const result = await response.json();
                setItemData(result.data);
            } catch (err) {
                console.error("Error fetching item details:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchItemDetails();
    }, [id, itemFromState]);

    const displayItem = itemData || itemFromState || {};

    // Ensure images is an array and has at least one image if possible, or use a placeholder
    // Our API returns `.imageUrl` as a string for now, so we shape it to an array
    const images = displayItem.imageUrl
        ? [displayItem.imageUrl]
        : displayItem.images && displayItem.images.length > 0
            ? displayItem.images
            : ["https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=800&fit=crop"]; // Generic placeholder

    // Helper to find coordinates for the given location string
    let matchingKey = Object.keys(CAMPUS_LANDMARKS).find(k =>
        CAMPUS_LANDMARKS[k].name === displayItem.location || k === displayItem.location
    );

    if (!matchingKey) {
        matchingKey = Object.keys(CAMPUS_LANDMARKS).find(k =>
            (displayItem.location && displayItem.location.toLowerCase().includes(k)) ||
            (displayItem.location && displayItem.location.toLowerCase().includes(CAMPUS_LANDMARKS[k].name.toLowerCase()))
        );
    }

    const mapLocation = matchingKey
        ? { ...CAMPUS_LANDMARKS[matchingKey] }
        : { name: displayItem.location, lng: 3.7188, lat: 6.8860 }; // Default to BU center

    // Fallback manual check for Laz Otti or general Library
    if (displayItem.location && displayItem.location.toLowerCase().includes('library')) {
        mapLocation.lng = 3.72233;
        mapLocation.lat = 6.89215;
    }

    const handleClaimSubmit = (description) => {
        console.log("Claim submitted for item:", displayItem.id, "Description:", description);
        showToast(`Claim submitted successfully for ${displayItem.title}!\n\nWe will review your details.`, 'success', 6000);
        setIsVerifyModalOpen(false);
        // Here you would typically send this data to a backend
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex flex-1 items-center justify-center p-8">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex flex-1 items-center justify-center p-8">
                    <div className="text-center bg-white dark:bg-slate-900 p-8 rounded-xl border border-red-200 shadow-sm max-w-md w-full">
                        <span className="material-symbols-outlined text-4xl text-red-500 mb-4 block">error</span>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Item Not Found</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!displayItem || Object.keys(displayItem).length === 0) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex flex-1 items-center justify-center p-8">
                    <div className="text-center bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 shadow-sm max-w-md w-full">
                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-4 block">search_off</span>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Item Not Found</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">The item you are looking for does not exist or has been removed.</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
            <Header />

            <main className="flex-1 w-full overflow-y-auto bg-[#f8f9fa] dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/dashboard')}>Home</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="hover:text-primary cursor-pointer">Found Items</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{displayItem.title}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left Column (Images) - Span 7 */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className="aspect-[4/3] w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative shadow-sm">
                                <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 z-10">
                                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                                    {images.length} Photos
                                </span>
                                <img
                                    src={images[activeImage]}
                                    alt={displayItem.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                                <button className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-2 border-transparent">
                                    <span className="material-symbols-outlined text-3xl">add</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Column (Details) - Span 5 */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* Title Header */}
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${displayItem.status === 'Found' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'}`}>
                                        <span className="material-symbols-outlined text-[16px]">{displayItem.status === 'Found' ? 'check_circle' : 'error'}</span>
                                        Status: {displayItem.status}
                                    </span>
                                    <span className="text-xs font-mono text-slate-400">ID: #{displayItem.id || 'N/A'}</span>
                                </div>

                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">{displayItem.title}</h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Posted {displayItem.postedDate || displayItem.date || 'Recently'}</p>
                                </div>
                            </div>

                            {/* Info Cards Row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                                        <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date Found</span>
                                    </div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{displayItem.date || displayItem.postedDate || 'Unknown'}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                                        <span className="material-symbols-outlined text-[20px]">category</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</span>
                                    </div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{displayItem.category || 'Uncategorized'}</p>
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                        <span className="material-symbols-outlined">location_on</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location Found</p>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{mapLocation?.name || 'Unknown Location'}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{displayItem.locationDetail || 'No additional location details provided.'}</p>
                                    </div>
                                </div>
                                {/* Real Mapbox Map */}
                                <div className="w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-600">
                                    {process.env.REACT_APP_MAPBOX_TOKEN ? (
                                        <Map
                                            initialViewState={{
                                                longitude: mapLocation.lng,
                                                latitude: mapLocation.lat,
                                                zoom: 15
                                            }}
                                            style={{ width: '100%', height: '100%' }}
                                            mapStyle="mapbox://styles/mapbox/streets-v12"
                                            mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
                                            attributionControl={false}
                                        >
                                            <Marker longitude={mapLocation.lng} latitude={mapLocation.lat} anchor="bottom">
                                                <div className="relative group cursor-pointer transform hover:scale-110 transition-transform">
                                                    <div className="size-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                                        <span className="material-symbols-outlined text-white text-[16px]">location_on</span>
                                                    </div>
                                                </div>
                                            </Marker>
                                        </Map>
                                    ) : (
                                        <>
                                            <img
                                                src="https://media.wired.com/photos/59269cd37034dc5f91bec0f1/191:100/w_1280,c_limit/GoogleMapTA.jpg"
                                                alt="Map Location Placeholder"
                                                className="w-full h-full object-cover opacity-80"
                                            />
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                <span className="material-symbols-outlined text-4xl text-blue-600 drop-shadow-md">location_on</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-900 dark:text-white">Item Description</h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                    {displayItem.description}
                                </p>
                            </div>

                            {/* Secured By Card */}
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                                <div className="size-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">security</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-0.5">Item Secured By</p>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Central Security Office</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Main Campus Gate • Extension 555</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 pt-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => window.location.href = 'tel:+2348000000000'}
                                        className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">call</span>
                                        Call Office
                                    </button>
                                    <button
                                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=6.891230,3.722518`, '_blank')}
                                        className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">directions</span>
                                        Get Directions
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsVerifyModalOpen(true)}
                                    className="h-12 w-full rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-300 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined rounded-full bg-white/20 p-1 text-[18px]">pan_tool</span>
                                    Claim This Item
                                </button>
                                <p className="text-[10px] text-center text-slate-400">
                                    You will be asked to verify ownership with unique details.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </main>

            {/* Modal */}
            <VerifyOwnershipModal
                isOpen={isVerifyModalOpen}
                onClose={() => setIsVerifyModalOpen(false)}
                item={{
                    ...displayItem,
                    image: images[0] // Pass the first image to the modal
                }}
                onSubmit={handleClaimSubmit}
            />
        </div>
    );
};

export default FoundItemDetails;
