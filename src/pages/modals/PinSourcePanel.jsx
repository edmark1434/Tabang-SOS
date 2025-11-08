import React, { useState, useEffect } from 'react';
import { Navigation, Search, X, Loader, MapPin, Check, User, Phone, MessageCircle, Shield, Tag } from 'lucide-react';

const FormError = ({ message }) => {
    if (!message) return null;
    return <span className="text-xs text-red-500 mt-1 flex items-center space-x-1"><span>•</span><span>{message}</span></span>;
};

const phoneRegex = /^(?:\+63|0)?9\d{9}$/;

export default function PinSourcePanel({ isOpen, onClose, onSubmitSource, onPreviewLocation, categories = [] }) {

    const initialFormState = {
        title: '',
        category: [],
        description: '',
        fullName: '',
        contactNumber: '',
        manualLocation: '',
        coordinates: null,
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);

    const [locationSearch, setLocationSearch] = useState('');
    const [locationResults, setLocationResults] = useState([]);
    const [isDebouncing, setIsDebouncing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormState);
            setErrors({});
            setLocationSearch('');
            setLocationResults([]);
            setCurrentLocation(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (locationSearch.trim().length < 3) {
            setLocationResults([]);
            return;
        }
        setIsDebouncing(true);
        const handler = setTimeout(() => {
            fetchLocations();
        }, 500);
        return () => clearTimeout(handler);
    }, [locationSearch]);

    const fetchLocations = async () => {
        try {
            const viewbox = '123.7,10.1,124.1,10.5';
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}&viewbox=${viewbox}&bounded=1&limit=5`;
            const res = await fetch(url);
            const data = await res.json();
            setLocationResults(data);
        } catch (error) {
            console.error("Error fetching locations:", error);
        } finally {
            setIsDebouncing(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required.';
        }
        if (formData.category.length === 0) {
            newErrors.category = 'Please select at least one category.';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required.';
        }
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required.';
        }
        if (!formData.contactNumber.trim()) {
            newErrors.contactNumber = 'Contact number is required.';
        } else if (!phoneRegex.test(formData.contactNumber.trim())) {
            newErrors.contactNumber = 'Please enter a valid PH mobile number (e.g., 09171234567 or +639171234567).';
        }
        if (!formData.coordinates && !formData.manualLocation.trim()) {
            newErrors.location = 'Please set a location by search or using your current location.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleCategoryToggle = (categoryName) => {
        setFormData(prev => {
            const currentCategories = prev.category;
            const newCategories = currentCategories.includes(categoryName)
                ? currentCategories.filter(c => c !== categoryName)
                : [...currentCategories, categoryName];
            return { ...prev, category: newCategories };
        });
        if (errors.category) {
            setErrors(prev => ({ ...prev, category: null }));
        }
    };
    const fetchCityFromCoords = async (lat, lon) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
            const res = await fetch(url);
            const data = await res.json();
            // city can be in city, town, or village
            const city = data.address.city || data.address.town || data.address.village || '';
            return city;
        } catch (error) {
            console.error("Error fetching city:", error);
            return '';
        }
    };
    const handleLocationSearchChange = (e) => {
        setLocationSearch(e.target.value);
        setFormData(prev => ({ ...prev, manualLocation: e.target.value, coordinates: null }));
        setCurrentLocation(null);
        if (errors.location) {
            setErrors(prev => ({ ...prev, location: null }));
        }
    };

    const handleLocationSelect = async(result) => {
        const coords = [parseFloat(result.lat), parseFloat(result.lon)];
        const city = await fetchCityFromCoords(coords[0], coords[1]);
        setLocationSearch(result.display_name);
        setFormData(prev => ({
            ...prev,
            manualLocation: result.display_name,
            coordinates: coords,
            city: city
        }));
        setCurrentLocation(null);
        setLocationResults([]);
        if (errors.location) {
            setErrors(prev => ({ ...prev, location: null }));
        }
        onPreviewLocation(coords);
    };

    const handleUseCurrentLocation = () => {
        setIsGettingLocation(true);

        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by this browser.');
            setIsGettingLocation(false);
            return;
        }

        let locationRetrieved = false;

        const timeoutId = setTimeout(() => {
            if (!locationRetrieved) {
                console.warn("Location request timed out, using approximate fallback.");
                const coords = [10.3157, 123.8854]; // Cebu fallback
                const locationText = 'Approximate Location (Cebu City)';
                setFormData(prev => ({
                    ...prev,
                    coordinates: coords,
                    manualLocation: locationText,
                    city: "Cebu City",
                }));
                setLocationSearch(locationText);
                setCurrentLocation(coords);
                setIsGettingLocation(false);
                onPreviewLocation(coords);
            }
        }, 7000); // 7s timeout fallback

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                locationRetrieved = true;
                clearTimeout(timeoutId);

                const coords = [position.coords.latitude, position.coords.longitude];
                const locationText = `Current Location (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`;

                // Show coordinates instantly
                setFormData(prev => ({
                    ...prev,
                    coordinates: coords,
                    manualLocation: locationText,
                }));
                setLocationSearch(locationText);
                setCurrentLocation(coords);
                onPreviewLocation(coords);

                // Fetch city name asynchronously (won’t block UI)
                fetchCityFromCoords(coords[0], coords[1]).then(city => {
                    setFormData(prev => ({ ...prev, city }));
                });

                setIsGettingLocation(false);
            },
            (error) => {
                locationRetrieved = true;
                clearTimeout(timeoutId);
                console.error('Unable to retrieve your location.', error);

                // fallback to Cebu if it fails
                const coords = [10.3157, 123.8854];
                const locationText = 'Approximate Location (Cebu City)';
                setFormData(prev => ({
                    ...prev,
                    coordinates: coords,
                    manualLocation: locationText,
                    city: "Cebu City",
                }));
                setLocationSearch(locationText);
                setCurrentLocation(coords);
                setIsGettingLocation(false);
                onPreviewLocation(coords);
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmitSource(formData);
        } else {
            console.error("Validation failed", errors);
        }
    };

    return (
        <div
            className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
            <div className="flex flex-col h-full">
                {/* Panel Header */}
                <div className="flex flex-col p-4 border-b bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-green-600" />
                            <h2 className="text-xl font-bold text-green-800">Share Resources</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-green-700">
                        <Check className="w-3 h-3" />
                        <span>Help your community by sharing available resources</span>
                    </div>
                </div>

                {/* Panel Body & Form (Scrollable) */}
                <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {/* Title Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                            <Tag className="w-4 h-4 text-gray-600" />
                            <span>Resource Title</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g., Free Water Station at Barangay Hall"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <FormError message={errors.title} />
                    </div>

                    {/* Category Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Resource Categories
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <button
                                    type="button"
                                    key={category}
                                    onClick={() => handleCategoryToggle(category)}
                                    className={`py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                                        formData.category.includes(category)
                                            ? 'bg-green-600 text-white shadow-md'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-green-500 hover:bg-green-50'
                                    }`}
                                >
                                    <span>{category}</span>
                                    {formData.category.includes(category) && <Check className="w-3 h-3" />}
                                </button>
                            ))}
                        </div>
                        <FormError message={errors.category} />
                    </div>

                    {/* Location Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-600" />
                            <span>Location Details</span>
                            <span className="text-red-500">*</span>
                        </label>

                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={handleUseCurrentLocation}
                                disabled={isGettingLocation}
                                className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 hover:border-green-500 hover:bg-green-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {isGettingLocation ? (
                                    <Loader className="w-4 h-4 animate-spin text-green-600" />
                                ) : (
                                    <Navigation className="w-4 h-4 text-green-600" />
                                )}
                                <span className="font-medium text-gray-700">
                                    {isGettingLocation ? 'Detecting your location...' : 'Use My Current Location'}
                                </span>
                            </button>

                            {/* Current Location Display */}
                            {currentLocation && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center space-x-2 text-blue-700">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm font-medium">Current Location Set:</span>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-1">
                                        {formData.manualLocation}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center">
                                <div className="flex-1 border-t border-gray-300"></div>
                                <span className="px-3 text-xs text-gray-500 uppercase font-medium bg-gray-50">or search below</span>
                                <div className="flex-1 border-t border-gray-300"></div>
                            </div>

                            <div className="relative">
                                <div className="flex items-center border border-gray-300 rounded-lg bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                                    <span className="pl-3 text-gray-400"><Search className="w-4 h-4" /></span>
                                    <input
                                        type="text"
                                        placeholder="Search for address, landmark, or area..."
                                        value={locationSearch}
                                        onChange={handleLocationSearchChange}
                                        className="flex-1 w-full border-none rounded-r-lg px-3 py-3 focus:ring-0 bg-transparent"
                                    />
                                    {isDebouncing && <Loader className="w-4 h-4 animate-spin text-gray-400 mr-3" />}
                                </div>

                                {locationResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                        {locationResults.map(result => (
                                            <button
                                                type="button"
                                                key={result.place_id}
                                                onClick={() => handleLocationSelect(result)}
                                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                            >
                                                <div className="font-medium">{result.display_name.split(',')[0]}</div>
                                                <div className="text-xs text-gray-500 truncate">{result.display_name}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <FormError message={errors.location} />

                        {/* Mobile Map Preview */}
                        <div className="md:hidden mt-4">
                            <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                                <div className="flex items-center space-x-2 mb-2">
                                    <MapPin className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">Location Preview</span>
                                </div>
                                <div className="bg-white border border-gray-300 rounded-lg h-32 flex items-center justify-center">
                                    {currentLocation || formData.coordinates ? (
                                        <div className="text-center p-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <MapPin className="w-6 h-6 text-green-600" />
                                            </div>
                                            <p className="text-xs text-gray-600">Location pinned on map</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formData.manualLocation || 'Selected location'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <Navigation className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-xs text-gray-500">Set a location to see preview</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Resource Description
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                            placeholder="Describe what resources are available, operating hours, requirements, etc..."
                        />
                        <FormError message={errors.description} />
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <span>Your Contact Information</span>
                            <span className="text-red-500">*</span>
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center border border-gray-300 rounded-lg bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                                    <span className="pl-3 text-gray-400"><User className="w-4 h-4" /></span>
                                    <input
                                        type="text"
                                        name="fullName"
                                        placeholder="Full Name"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="flex-1 w-full border-none rounded-r-lg px-3 py-3 focus:ring-0 bg-transparent"
                                    />
                                </div>
                                <FormError message={errors.fullName} />
                            </div>
                            <div>
                                <div className="flex items-center border border-gray-300 rounded-lg bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                                    <span className="pl-3 text-gray-400"><Phone className="w-4 h-4" /></span>
                                    <input
                                        type="tel"
                                        name="contactNumber"
                                        placeholder="Contact Number (e.g., 09171234567)"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        className="flex-1 w-full border-none rounded-r-lg px-3 py-3 focus:ring-0 bg-transparent"
                                    />
                                </div>
                                <FormError message={errors.contactNumber} />
                            </div>
                        </div>
                    </div>

                    {/* Privacy Notice */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start space-x-2">
                            <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="text-xs text-blue-700">
                                <p className="font-medium">Your privacy matters</p>
                                <p>Your contact information will only be visible to verified community members. We never share your personal data.</p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:from-green-600 hover:to-green-700"
                    >
                        Share Resources with Community
                    </button>
                </form>
            </div>
        </div>
    );
}