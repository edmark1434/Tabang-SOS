import React, { useEffect, useRef, useState } from 'react';
import {
    MapPin,
    HeartHandshake,
    Search,
    Menu,
    X,
    Heart,
    Filter,
    Plus,
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    Tags,
    Check,
    Loader,
    Navigation,
    Shield,
    Users,
    Package,
    Droplets,
    Zap,
    Utensils,
    Clock,
    Flag,
    ArrowUpDown,
    CircleQuestionMarkIcon
} from 'lucide-react';
import { addNeedHelp } from '../services/needHelp.js';
import PinSourcePanel from './modals/PinSourcePanel.jsx';
import AskHelpPanel from './modals/AskHelpPanel.jsx';
import { categories, cities } from '../data/dataset.js';
import { liveHelp } from '../services/needHelp.js';
import { addSource, liveSource } from '../services/source.js';
import EmergencyContactsPage from './EmergencyContactsPage.jsx';

const Home = () => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMapLoading, setIsMapLoading] = useState(true);

    const [isPinPanelOpen, setIsPinPanelOpen] = useState(false);
    const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);

    const [previewMarker, setPreviewMarker] = useState(null);
    const [userLocationMarker, setUserLocationMarker] = useState(null);
    const watchIdRef = useRef(null);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [posts, setPosts] = useState([]);
    const [sortOrder, setSortOrder] = useState('latest'); // 'latest' or 'oldest'

    // Add these new state variables
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [sourcePost,setSourcePost] = useState([]);
    const [helpPost,setHelpPost] = useState([]);
    const [activeEmergencyCases, setActiveEmergencyCases] = useState(
        posts.filter(p => p.type === 'help' && p.urgent).length
    );

    // State for the new emergency contacts page
    const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);

    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const [filters, setFilters] = useState({
        city: '',
        category: '',
        type: ''
    });

    useEffect(() => {
        // Start listening for live updates
        const unsubscribe = liveHelp((listHelps) => {
            setHelpPost(listHelps);
        });
        // Cleanup on unmount
        return () => unsubscribe();
    }, []);
    useEffect(() => {
        // Start listening for live updates
        const unsubscribe = liveSource((listSource) => {
            setSourcePost(listSource);
        });
        // Cleanup on unmount
        return () => unsubscribe();
    }, []);
    useEffect(()=>{
        setPosts([...helpPost,...sourcePost]);
    },[helpPost,sourcePost]);
    // Report reasons
    const reportReasons = [
        'Spam',
        'Fake Information',
        'Inappropriate Content',
        'Wrong Location',
        'Duplicate Post',
        'Harassment',
        'Other'
    ];

    // Function to format timestamp
    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const postTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - postTime) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        }
    };

    const formatExactTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    // Sort posts based on current sort order
    const getSortedPosts = (postsToSort) => {
        return [...postsToSort].sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
        });
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'latest' ? 'oldest' : 'latest');
    };

    // Add these new functions
    const handlePopupHeartClick = (postId) => {
        setPosts(prev => prev.map(post =>
            post.id === postId
                ? {
                    ...post,
                    hearts: post.userHearted ? post.hearts - 1 : post.hearts + 1,
                    userHearted: !post.userHearted,
                    lastUpdated: new Date().toISOString()
                }
                : post
        ));

        // Refresh the popup content to show updated heart state
        refreshPopupContent(postId);
    };

    const handlePopupFlagClick = (postId) => {
        setSelectedPostId(postId);
        setShowReportModal(true);
    };

    const handleSubmitReport = () => {
        if (selectedPostId && reportReason) {
            const post = posts.find(p => p.id === selectedPostId);
            showToast(`Post "${post.title}" reported for: ${reportReason}`, 'success');
            console.log(`Post ${selectedPostId} reported for: ${reportReason}`);

            // Reset and close
            setShowReportModal(false);
            setSelectedPostId(null);
            setReportReason('');
        }
    };

    const refreshPopupContent = (postId) => {
        const post = posts.find(p => p.id === postId);
        if (post && post.marker) {
            const categoryDisplay = Array.isArray(post.category) ? post.category.join(', ') : post.category;
            const timeAgo = formatTimeAgo(post.timestamp);
            const exactTime = formatExactTime(post.timestamp);

            const popupContent = `
                <div class="p-3" style="max-width: 250px;">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="font-bold text-base text-gray-900">${post.title}</h3>
                        <span class="text-xs px-2 py-1 rounded-full ${post.type === 'help' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                            ${post.type === 'help' ? 'HELP' : 'RESOURCE'}
                        </span>
                    </div>
                    <p class="text-sm text-gray-700 my-2">${post.description}</p>
                    <div class="space-y-1 text-xs text-gray-600">
                        <p><strong>Category:</strong> ${categoryDisplay}</p>
                        <p><strong>Contact:</strong> ${post.contact}</p>
                        <p><strong>Posted:</strong> ${exactTime} (${timeAgo})</p>
                        <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                            <div class="flex items-center space-x-2">
                                <button onclick="window.reactApp.handlePopupFlagClick(${post.id})" class="text-gray-400 hover:text-orange-500 transition-colors p-1" title="Report post">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
                                    </svg>
                                </button>
                                <button onclick="window.reactApp.handlePopupHeartClick(${post.id})" class="flex items-center space-x-1 transition-colors ${post.userHearted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${post.userHearted ? '#ef4444' : 'none'}" viewBox="0 0 24 24" stroke="${post.userHearted ? '#ef4444' : '#6b7280'}" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span>${post.hearts}</span>
                                </button>
                            </div>
                            ${post.urgent ? '<p class="text-red-600 font-bold text-xs">🚨</p>' : ''}
                        </div>
                    </div>
                </div>
            `;
            post.marker.setPopupContent(popupContent);
        }
    };

    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
        script.async = true;
        script.onload = () => {
            setIsLoaded(true);
            setTimeout(() => setIsMapLoading(false), 1000);
        };
        document.body.appendChild(script);

        return () => {
            document.head.removeChild(link);
            document.body.removeChild(script);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isLoaded || !mapInstanceRef.current) return;

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
                    userLocationMarker.setLatLng(coords);
                } else {
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
    }, [isLoaded, mapInstanceRef.current]);

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
            const timeAgo = formatTimeAgo(post.timestamp);
            const exactTime = formatExactTime(post.timestamp);

            const popupContent = `
                <div class="p-3" style="max-width: 250px;">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="font-bold text-base text-gray-900">${post.title}</h3>
                        <span class="text-xs px-2 py-1 rounded-full ${post.type === 'help' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                            ${post.type === 'help' ? 'HELP' : 'RESOURCE'}
                        </span>
                    </div>
                    <p class="text-sm text-gray-700 my-2">${post.description}</p>
                    <div class="space-y-1 text-xs text-gray-600">
                        <p><strong>Category:</strong> ${categoryDisplay}</p>
                        <p><strong>Contact:</strong> ${post.contact}</p>
                        <p><strong>Posted:</strong> ${exactTime} (${timeAgo})</p>
                        <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                            <div class="flex items-center space-x-2">
                                <button onclick="window.reactApp.handlePopupFlagClick(${post.id})" class="text-gray-400 hover:text-orange-500 transition-colors p-1" title="Report post">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
                                    </svg>
                                </button>
                                <button onclick="window.reactApp.handlePopupHeartClick(${post.id})" class="flex items-center space-x-1 transition-colors ${post.userHearted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${post.userHearted ? '#ef4444' : 'none'}" viewBox="0 0 24 24" stroke="${post.userHearted ? '#ef4444' : '#6b7280'}" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span>${post.hearts}</span>
                                </button>
                            </div>
                            ${post.urgent ? '<p class="text-red-600 font-bold text-xs">🚨</p>' : ''}
                        </div>
                    </div>
                </div>
            `;
            marker.bindPopup(popupContent);
            post.marker = marker;
        });

    }, [isLoaded, posts, userLocationMarker, previewMarker]);

    // Expose functions to global scope for popup buttons
    useEffect(() => {
        window.reactApp = {
            handlePopupHeartClick,
            handlePopupFlagClick
        };
    }, [posts]); // Re-expose when posts change

    useEffect(() => {
        setActiveEmergencyCases(posts.filter(p => p.type === 'help' && p.urgent).length);
    }, [posts]);

    const handlePreviewLocation = (coords) => {
        if (!mapInstanceRef.current) return;

        const previewIcon = window.L.divIcon({
            html: `<div style="background-color: #8B5CF6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/></svg></div>`,
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24]
        });

        if (previewMarker) {
            mapInstanceRef.current.removeLayer(previewMarker);
        }

        if (coords) {
            const newMarker = window.L.marker(coords, { icon: previewIcon, zIndexOffset: 900 })
                .addTo(mapInstanceRef.current)
                .bindPopup("Selected Location")
                .openPopup();
            setPreviewMarker(newMarker);
            mapInstanceRef.current.flyTo(coords, 15);
        } else {
            setPreviewMarker(null);
        }
    };

    // Function to handle post click and show on map
    const handlePostClick = (post) => {
        if (!mapInstanceRef.current || !post.marker) return;

        // Close sidebar on mobile for better map view
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }

        // Fly to the post location and open popup
        mapInstanceRef.current.flyTo(post.coordinates, 15);
        post.marker.openPopup();
    };

    const handleSubmitSource = async (formData) => {
        const newCoordinates = formData.coordinates || [10.3157, 123.8854];
        const newLocation = formData.manualLocation || 'Location not specified';
        const currentTime = new Date().toISOString();

        const newPost = {
            id: posts.length + 1,
            type: 'source',
            category: formData.category,
            title: formData.title || `${formData.category[0] || 'General'} Source`,
            description: formData.description,
            location: newLocation,
            coordinates: newCoordinates,
            contact: `${formData.fullName} - ${formData.contactNumber}`,
            verified: true,
            urgent: false,
            hearts: 0,
            userHearted: false,
            timestamp: currentTime,
            lastUpdated: currentTime
        };
        await addSource(newPost);
        showToast('Resource shared successfully! Community members can now find your help.', 'success');
        setIsPinPanelOpen(false);
        handlePreviewLocation(null);
    };

    const handleSubmitHelp = async (formData) => {
        const newCoordinates = formData.coordinates || [10.3157, 123.8854];
        const newLocation = formData.manualLocation || 'Location not specified';
        const currentTime = new Date().toISOString();

        const newPost = {
            id: posts.length + 1,
            type: 'help',
            category: formData.category,
            title: formData.title || `${formData.category[0] || 'General'} Request`,
            description: formData.description,
            location: newLocation,
            coordinates: newCoordinates,
            contact: `${formData.fullName} - ${formData.contactNumber}`,
            verified: false,
            urgent: true,
            hearts: 0,
            userHearted: false,
            timestamp: currentTime,
            lastUpdated: currentTime
        };
        await addNeedHelp(newPost);
        showToast('Help request submitted! Community responders have been notified.', 'success');
        setIsHelpPanelOpen(false);
        handlePreviewLocation(null);
    };

    const handleClosePinPanel = () => {
        setIsPinPanelOpen(false);
        handlePreviewLocation(null);
    };

    const handleCloseHelpPanel = () => {
        setIsHelpPanelOpen(false);
        handlePreviewLocation(null);
    };

    // Handle opening panels with mutual exclusion
    const handleOpenPinPanel = () => {
        if (!isHelpPanelOpen) {
            setIsPinPanelOpen(true);
        }
    };

    const handleOpenHelpPanel = () => {
        if (!isPinPanelOpen) {
            setIsHelpPanelOpen(true);
        }
    };

    const handleHeartPost = (postId, e) => {
        e.stopPropagation(); // Prevent triggering the post click when hearting
        setPosts(prev => prev.map(post =>
            post.id === postId
                ? {
                    ...post,
                    hearts: post.userHearted ? post.hearts - 1 : post.hearts + 1,
                    userHearted: !post.userHearted,
                    lastUpdated: new Date().toISOString() // Update timestamp when hearted
                }
                : post
        ));
    };

    const handleFlagPost = (postId, e) => {
        if (e) e.stopPropagation(); // Prevent triggering the post click when flagging
        setSelectedPostId(postId);
        setShowReportModal(true);
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

    const sortedFilteredPosts = getSortedPosts(filteredPosts);

    // Calculate filter panel position based on sidebar state
    const filterPanelLeft = sidebarOpen ? '320px' : '0px';
    const filterPanelWidth = sidebarOpen ? 'calc(100% - 320px)' : '100%';

    return (
        <div className="min-h-screen bg-white relative font-sans overflow-hidden">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg border-l-4 ${
                    toast.type === 'success'
                        ? 'bg-green-50 border-green-500 text-green-800'
                        : 'bg-red-50 border-red-500 text-red-800'
                } transition-transform duration-300 transform translate-x-0`}>
                    <div className="flex items-center space-x-2">
                        {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="font-medium">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white z-30 border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div className="flex items-center space-x-2">
                            <HeartHandshake className="w-6 h-6 text-red-500" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Crowd Sourcing</h1>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    <span>Cebu, Philippines • Version 1.2</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-md transition-colors ${
                                showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                            }`}
                            title="Show filters"
                        >
                            <Filter size={18} />
                        </button>

                        {/* NEW Emergency Contacts Button */}
                        <button
                            onClick={() => setShowEmergencyContacts(true)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="Emergency Hotlines"
                        >
                            <CircleQuestionMarkIcon size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Sidebar (Post List) - Fixed position */}
            <div className={`fixed top-[57px] left-0 h-[calc(100vh-57px)] bg-white z-20 w-80 shadow-xl transform transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="p-4 overflow-y-auto h-full">
                    {/* Added margin-top for spacing */}
                    <div className="flex justify-between items-center mb-4 mt-2">
                        <h2 className="font-bold text-gray-800 text-lg">Community Posts</h2>
                        <button
                            onClick={toggleSortOrder}
                            className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <ArrowUpDown size={14} />
                            <span>{sortOrder === 'latest' ? 'Latest' : 'Oldest'}</span>
                        </button>
                    </div>

                    {/* Add New Post Button */}
                    <button
                        onClick={() => {
                            handleOpenPinPanel();
                            setSidebarOpen(false);
                        }}
                        disabled={isHelpPanelOpen}
                        className={`w-full bg-green-600 text-white py-3 px-4 rounded-lg mb-4 flex items-center justify-center space-x-2 transition-all duration-200 shadow-md ${
                            isHelpPanelOpen ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                        }`}
                    >
                        <Plus size={18} />
                        <span className="font-semibold">Pinpoint a Source</span>
                    </button>

                    {/* Posts List */}
                    <div className="space-y-3">
                        {sortedFilteredPosts.length === 0 && (
                            <div className="text-center py-8">
                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 mb-2">No posts match your filters</p>
                                <button
                                    onClick={() => setFilters({city: '', category: '', type: ''})}
                                    className="text-blue-600 text-sm hover:text-blue-800 font-medium"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                        {sortedFilteredPosts.map(post => {
                            const categoryDisplay = Array.isArray(post.category) ? post.category.join(', ') : post.category;
                            const isHelp = post.type === 'help';
                            const timeAgo = formatTimeAgo(post.timestamp);

                            return (
                                <div
                                    key={`${post.id}-${post.timestamp}`}
                                    onClick={() => handlePostClick(post)}
                                    className={`border rounded-lg p-3 transition-all hover:shadow-md cursor-pointer active:scale-95 ${
                                        isHelp
                                            ? 'border-red-200 bg-red-50 hover:bg-red-100'
                                            : 'border-green-200 bg-green-50 hover:bg-green-100'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-2">
                                            {isHelp ? (
                                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                            ) : (
                                                <MapPin className="w-4 h-4 text-green-600" />
                                            )}
                                            <h3 className="font-semibold text-sm text-gray-900">{post.title}</h3>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            isHelp
                                                ? 'bg-red-100 text-red-800 border border-red-200'
                                                : 'bg-green-100 text-green-800 border border-green-200'
                                        }`}>
                                            {isHelp ? 'HELP' : 'RESOURCE'}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{post.description}</p>

                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                                        <div className="flex items-center space-x-4">
                                            <span className="flex items-center space-x-1">
                                                <MapPin className="w-3 h-3" />
                                                <span>{post.location}</span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <Tags className="w-3 h-3" />
                                                <span>{categoryDisplay}</span>
                                            </span>
                                        </div>
                                        {post.urgent && (
                                            <span className="flex items-center space-x-1 text-red-600 font-medium">
                                                {/*<AlertCircle className="w-3 h-3" />*/}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <span className="text-xs text-gray-500 flex items-center space-x-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{timeAgo}</span>
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={(e) => handleFlagPost(post.id, e)}
                                                className="text-gray-400 hover:text-orange-500 transition-colors p-1"
                                                title="Report post"
                                            >
                                                <Flag size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => handleHeartPost(post.id, e)}
                                                className={`flex items-center space-x-1 transition-colors ${
                                                    post.userHearted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                                                }`}
                                            >
                                                <Heart size={16} fill={post.userHearted ? 'currentColor' : 'none'} />
                                                <span className="text-xs">{post.hearts}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Filters Panel - Moves with sidebar */}
            {showFilters && (
                <div
                    className="fixed top-[57px] bg-white z-20 border-b border-gray-200 shadow-md p-4 animate-slideDown"
                    style={{
                        left: filterPanelLeft,
                        width: filterPanelWidth,
                        transition: 'left 0.3s ease-in-out, width 0.3s ease-in-out'
                    }}
                >
                    <div className="container mx-auto">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                                <select
                                    value={filters.city}
                                    onChange={(e) => setFilters(prev => ({...prev, city: e.target.value}))}
                                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Types</option>
                                    <option value="source">Resources</option>
                                    <option value="help">Help Requests</option>
                                </select>
                            </div>

                            <button
                                onClick={() => setFilters({city: '', category: '', type: ''})}
                                className="text-sm text-blue-600 hover:text-blue-800 pb-2 font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area - The Map */}
            <div className={`pt-[57px] ${showFilters ? 'pt-[160px]' : ''}`}>
                <div className="relative w-full h-screen">
                    {isMapLoading && (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                            <div className="text-center">
                                <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Loading map...</p>
                            </div>
                        </div>
                    )}
                    <div ref={mapRef} className="w-full h-screen fixed top-0 left-0 z-0" />
                </div>
            </div>

            {/* Action Buttons (Bottom Bar) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 shadow-lg">
                <div className="container mx-auto px-4 py-4">
                    <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button
                            onClick={handleOpenPinPanel}
                            disabled={isHelpPanelOpen}
                            className={`flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg shadow-xs transition-all duration-200 flex items-center justify-center space-x-2 group ${
                                isHelpPanelOpen
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:border-green-500 hover:bg-green-50 hover:shadow-sm'
                            }`}
                        >
                            <MapPin className={`w-4 h-4 group-hover:text-green-700 ${
                                isHelpPanelOpen ? 'text-gray-400' : 'text-green-600'
                            }`} />
                            <span className="text-sm font-medium">Pinpoint a Source</span>
                        </button>

                        <button
                            onClick={handleOpenHelpPanel}
                            disabled={isPinPanelOpen}
                            className={`flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg shadow-xs transition-all duration-200 flex items-center justify-center space-x-2 group ${
                                isPinPanelOpen
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm'
                            }`}
                        >
                            <HeartHandshake className={`w-4 h-4 group-hover:text-blue-700 ${
                                isPinPanelOpen ? 'text-gray-400' : 'text-blue-600'
                            }`} />
                            <span className="text-sm font-medium">Ask for Help</span>
                        </button>
                    </div>
                    <div className="text-center mt-3">
                        <p className="text-xs text-gray-500 flex items-center justify-center space-x-4">
                            <span>{filteredPosts.length} posts</span>
                            <span>•</span>
                            <span className="flex items-center space-x-1 text-red-600">
                                <AlertCircle className="w-3 h-3" />
                                <span>{activeEmergencyCases} active emergencies</span>
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center space-x-2 mb-4">
                            <Flag className="w-5 h-5 text-orange-500" />
                            <h3 className="text-lg font-bold text-gray-900">Report Post</h3>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Why are you reporting this post? This helps us keep the community safe.
                        </p>

                        <div className="space-y-3 mb-6">
                            {reportReasons.map((reason) => (
                                <label key={reason} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={reason}
                                        checked={reportReason === reason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        className="text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-gray-700">{reason}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowReportModal(false);
                                    setSelectedPostId(null);
                                    setReportReason('');
                                }}
                                className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReport}
                                disabled={!reportReason}
                                className="flex-1 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Render Panels */}
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

            {/* NEW: Render Emergency Contacts Page */}
            {showEmergencyContacts && (
                <EmergencyContactsPage onClose={() => setShowEmergencyContacts(false)} />
            )}

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slideDown { animation: slideDown 0.3s ease-out; }
                .leaflet-popup-content-wrapper { 
                    border-radius: 12px; 
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                .leaflet-popup-content { 
                    margin: 16px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                /* Mobile optimizations */
                @media (max-width: 768px) {
                    .leaflet-popup-content-wrapper {
                        max-width: 280px;
                    }
                    .leaflet-popup-content {
                        margin: 12px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;