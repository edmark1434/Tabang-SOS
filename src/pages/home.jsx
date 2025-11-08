import React, { useEffect, useRef, useState } from 'react';
import {
    MapPin,
    HeartHandshake,
    Search,
    Menu,
    X,
    Heart,
    Filter,
    Plus
} from 'lucide-react';

// --- IMPORT THE NEW SEPARATE PANELS ---
import PinSourcePanel from './modals/PinSourcePanel.jsx';
import AskHelpPanel from './modals/AskHelpPanel.jsx';

// Import from our data file
import { initialPosts, categories, cities } from '../data/dataset.js';

const Home = () => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // --- NEW: State for separate panels ---
    const [isPinPanelOpen, setIsPinPanelOpen] = useState(false);
    const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);

    // --- NEW: State for map markers ---
    const [previewMarker, setPreviewMarker] = useState(null); // The purple "selected" marker
    const [userLocationMarker, setUserLocationMarker] = useState(null); // The blue "you are here" dot
    const watchIdRef = useRef(null); // To store the ID of the geolocation watcher

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [posts, setPosts] = useState(initialPosts);

    const [activeEmergencyCases, setActiveEmergencyCases] = useState(
        posts.filter(p => p.type === 'help' && p.urgent).length
    );

    const [filters, setFilters] = useState({
        city: '',
        category: '',
        type: ''
    });

    useEffect(() => {
        // Load Leaflet CSS & JS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
        script.async = true;
        script.onload = () => setIsLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.head.removeChild(link);
            document.body.removeChild(script);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }
            // --- NEW: Stop watching location on unmount ---
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    // --- NEW: Effect to watch user's location ---
    useEffect(() => {
        if (!isLoaded || !mapInstanceRef.current) return;

        // Create a custom icon for the user's location
        const userIcon = window.L.divIcon({
            html: `<div style="background-color: #3B82F6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
            className: '',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const coords = [position.coords.latitude, position.coords.longitude];
                if (userLocationMarker) {
                    // If marker exists, just update its position
                    userLocationMarker.setLatLng(coords);
                } else {
                    // Otherwise, create a new marker
                    const newMarker = window.L.marker(coords, { icon: userIcon, zIndexOffset: 1000 })
                        .addTo(mapInstanceRef.current)
                        .bindPopup("Your Location");
                    setUserLocationMarker(newMarker);
                }
            },
            (error) => {
                console.error("Error watching user location:", error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

    }, [isLoaded, mapInstanceRef.current]); // Depends on map being loaded


    // Effect to add markers for posts
    useEffect(() => {
        if (!isLoaded || !mapRef.current) return;

        if (!mapInstanceRef.current) {
            const map = window.L.map(mapRef.current).setView([10.3157, 123.8854], 11);
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);
            mapInstanceRef.current = map;
        }

        mapInstanceRef.current.eachLayer((layer) => {
            if (layer instanceof window.L.Marker && layer !== userLocationMarker && layer !== previewMarker) {
                mapInstanceRef.current.removeLayer(layer);
            }
        });

        posts.forEach(post => {
            // ... (rest of the post marker logic is unchanged) ...
            const iconHtml = post.type === 'help'
                ? `<div style="background-color: #EF4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);">!</div>`
                : `<div style="background-color: #22C55E; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/></svg></div>`;

            const customIcon = window.L.divIcon({
                html: iconHtml,
                className: '',
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                popupAnchor: [0, -24]
            });
            const marker = window.L.marker(post.coordinates, { icon: customIcon }).addTo(mapInstanceRef.current);
            const categoryDisplay = Array.isArray(post.category) ? post.category.join(', ') : post.category;
            const popupContent = `
                <div class="p-2" style="max-width: 200px;">
                    <h3 class="font-bold text-base">${post.title}</h3>
                    <p class="text-sm text-gray-700 my-1">${post.description}</p>
                    <p class="text-xs mt-1"><strong>Category:</strong> ${categoryDisplay}</p>
                    <p class="text-xs"><strong>Contact:</strong> ${post.contact}</p>
                    ${post.type === 'help' ? '<p class="text-red-600 text-xs font-bold mt-1">URGENT HELP NEEDED</p>' : ''}
                </div>
            `;
            marker.bindPopup(popupContent);
        });

    }, [isLoaded, posts, userLocationMarker, previewMarker]); // Re-run if markers change

    useEffect(() => {
        setActiveEmergencyCases(posts.filter(p => p.type === 'help' && p.urgent).length);
    }, [posts]);


    // --- NEW: Handler for the preview marker ---
    const handlePreviewLocation = (coords) => {
        if (!mapInstanceRef.current) return;

        // Create a custom icon for the preview marker (purple)
        const previewIcon = window.L.divIcon({
            html: `<div style="background-color: #8B5CF6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/></svg></div>`,
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24]
        });

        // Remove old preview marker
        if (previewMarker) {
            mapInstanceRef.current.removeLayer(previewMarker);
        }

        // If new coords are provided, add a new marker
        if (coords) {
            const newMarker = window.L.marker(coords, { icon: previewIcon, zIndexOffset: 900 })
                .addTo(mapInstanceRef.current)
                .bindPopup("Selected Location")
                .openPopup();
            setPreviewMarker(newMarker);
            mapInstanceRef.current.flyTo(coords, 15);
        } else {
            setPreviewMarker(null); // Clear the marker
        }
    };

    // --- NEW: Specific submit handler for Sources ---
    const handleSubmitSource = (formData) => {
        const newCoordinates = formData.coordinates || [10.3157, 123.8854];
        const newLocation = formData.manualLocation || 'Location not specified';

        const newPost = {
            id: posts.length + 1,
            type: 'source',
            category: formData.category,
            title: `${formData.category[0] || 'General'} Source`,
            description: formData.description,
            location: newLocation,
            coordinates: newCoordinates,
            contact: `${formData.fullName} - ${formData.contactNumber}`,
            verified: true,
            urgent: false,
            hearts: 0,
            userHearted: false
        };

        setPosts(prev => [...prev, newPost]);
        alert('Source submitted successfully!');
        setIsPinPanelOpen(false); // Close correct panel
        handlePreviewLocation(null); // Remove preview marker
    };

    // --- NEW: Specific submit handler for Help ---
    const handleSubmitHelp = (formData) => {
        const newCoordinates = formData.coordinates || [10.3157, 123.8854];
        const newLocation = formData.manualLocation || 'Location not specified';

        const newPost = {
            id: posts.length + 1,
            type: 'help',
            category: formData.category,
            title: `${formData.category[0] || 'General'} Request`,
            description: formData.description,
            location: newLocation,
            coordinates: newCoordinates,
            contact: `${formData.fullName} - ${formData.contactNumber}`,
            verified: false,
            urgent: true,
            hearts: 0,
            userHearted: false
        };

        setPosts(prev => [...prev, newPost]);
        alert('Help request submitted successfully!');
        setIsHelpPanelOpen(false); // Close correct panel
        handlePreviewLocation(null); // Remove preview marker
    };

    // --- NEW: Close handlers that also clear the preview marker ---
    const handleClosePinPanel = () => {
        setIsPinPanelOpen(false);
        handlePreviewLocation(null);
    };

    const handleCloseHelpPanel = () => {
        setIsHelpPanelOpen(false);
        handlePreviewLocation(null);
    };


    const handleHeartPost = (postId) => {
        setPosts(prev => prev.map(post =>
            post.id === postId
                ? { ...post, hearts: post.userHearted ? post.hearts - 1 : post.hearts + 1, userHearted: !post.userHearted }
                : post
        ));
    };

    const filteredPosts = posts.filter(post => {
        if (filters.city && post.location !== filters.city) return false;
        if (filters.category) {
            const postCategory = post.category;
            if (Array.isArray(postCategory)) {
                if (!postCategory.includes(filters.category)) return false;
            } else {
                if (postCategory !== filters.category) return false;
            }
        }
        if (filters.type && post.type !== filters.type) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-white relative font-sans overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white z-30 border-b border-gray-200 shadow-sm">
                {/* ... (header content unchanged) ... */}
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="mr-3 p-2 rounded-md hover:bg-gray-100"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Cebu City Crowd Source V1.1</h1>
                            <p className="text-gray-500 text-xs mt-1">{activeEmergencyCases} active emergency cases</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="p-2 rounded-md hover:bg-gray-100"
                        >
                            <Filter size={18} />
                        </button>
                        <div className="text-xs text-gray-500">
                            Cebu, Philippines
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters Panel */}
            {showFilters && (
                <div className="fixed top-[57px] left-0 right-0 bg-white z-20 border-b border-gray-200 shadow-md p-4 animate-slideDown">
                    {/* ... (filter content unchanged) ... */}
                    <div className="container mx-auto">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                                <select
                                    value={filters.city}
                                    onChange={(e) => setFilters(prev => ({...prev, city: e.target.value}))}
                                    className="text-sm border border-gray-300 rounded px-3 py-1 bg-white"
                                >
                                    <option value="">All Cities</option>
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
                                    className="text-sm border border-gray-300 rounded px-3 py-1 bg-white"
                                >
                                    <option value="">All Categories</option>
                                    {[...new Set([...categories.source, ...categories.help])].sort().map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}
                                    className="text-sm border border-gray-300 rounded px-3 py-1 bg-white"
                                >
                                    <option value="">All Types</option>
                                    <option value="source">Resources</option>
                                    <option value="help">Help Requests</option>
                                </select>
                            </div>

                            <button
                                onClick={() => setFilters({city: '', category: '', type: ''})}
                                className="text-xs text-blue-600 hover:text-blue-800 pb-1"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar (Post List) */}
            <div className={`fixed top-[57px] left-0 h-[calc(100vh-57px)] bg-white z-20 w-80 shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 overflow-y-auto h-full">
                    <h2 className="font-bold text-gray-800 mb-4">Community Posts</h2>

                    {/* Add New Post Button */}
                    <button
                        onClick={() => {
                            // --- UPDATED to open PinSourcePanel ---
                            setIsPinPanelOpen(true);
                            setSidebarOpen(false);
                        }}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg mb-4 flex items-center justify-center space-x-2 hover:bg-green-700"
                    >
                        <Plus size={16} />
                        <span>Pinpoint a Source</span>
                    </button>

                    {/* Posts List */}
                    <div className="space-y-3">
                        {filteredPosts.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No posts match your filters.</p>
                        )}
                        {filteredPosts.map(post => {
                            const categoryDisplay = Array.isArray(post.category) ? post.category.join(', ') : post.category;
                            return (
                                <div key={post.id} className={`border rounded-lg p-3 ${post.type === 'help' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                                    {/* ... (post card content unchanged) ... */}
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-sm">{post.title}</h3>
                                        <span className={`text-xs px-2 py-1 rounded ${post.type === 'help' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                                            {post.type === 'help' ? 'HELP' : 'RESOURCE'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">{post.description}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-gray-500">{post.location}</span>
                                        <button
                                            onClick={() => handleHeartPost(post.id)}
                                            className={`flex items-center space-x-1 ${post.userHearted ? 'text-red-500' : 'text-gray-400'}`}
                                        >
                                            <Heart size={14} fill={post.userHearted ? 'currentColor' : 'none'} />
                                            <span className="text-xs">{post.hearts}</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Category: {categoryDisplay}</p>
                                    <p className="text-xs text-gray-500 mt-1">{post.contact}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content Area - The Map */}
            <div className={`pt-[57px] ${showFilters ? 'pt-[160px]' : ''}`}>
                <div ref={mapRef} className="w-full h-screen fixed top-0 left-0 z-0" />
            </div>

            {/* Action Buttons (Bottom Bar) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 shadow-lg">
                <div className="container mx-auto px-4 py-4">
                    <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* --- UPDATED to open PinSourcePanel --- */}
                        <button
                            onClick={() => setIsPinPanelOpen(true)}
                            className="flex-1 bg-white border border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 font-medium py-3 px-4 rounded-lg shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-center space-x-2 group"
                        >
                            <MapPin className="w-4 h-4 text-green-600 group-hover:text-green-700" />
                            <span className="text-sm font-medium">Pinpoint a Source</span>
                        </button>

                        {/* --- UPDATED to open AskHelpPanel --- */}
                        <button
                            onClick={() => setIsHelpPanelOpen(true)}
                            className="flex-1 bg-white border border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50 font-medium py-3 px-4 rounded-lg shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-center space-x-2 group"
                        >
                            <HeartHandshake className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                            <span className="text-sm font-medium">Ask for Help</span>
                        </button>
                    </div>
                    {/* ... (quick info unchanged) ... */}
                </div>
            </div>


            {/* --- RENDER THE NEW SEPARATE PANELS --- */}
            <PinSourcePanel
                isOpen={isPinPanelOpen}
                onClose={handleClosePinPanel}
                onSubmitSource={handleSubmitSource}
                onPreviewLocation={handlePreviewLocation}
                categories={categories.source}
            />

            <AskHelpPanel
                isOpen={isHelpPanelOpen}
                onClose={handleCloseHelpPanel}
                onSubmitHelp={handleSubmitHelp}
                onPreviewLocation={handlePreviewLocation}
                categories={categories.help}
            />


            {/* ... (styles unchanged) ... */}
            <style jsx global>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slideDown { animation: slideDown 0.3s ease-out; }
                .leaflet-popup-content-wrapper { border-radius: 8px; }
                .leaflet-popup-content { margin: 10px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; }
            `}</style>
        </div>
    );
};

export default Home;