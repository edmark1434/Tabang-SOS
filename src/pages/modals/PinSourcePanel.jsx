import React, { useState, useEffect } from 'react';
import { Navigation, Search, X, Loader } from 'lucide-react';

// Reusable component for form errors
const FormError = ({ message }) => {
    if (!message) return null;
    return <span className="text-xs text-red-500 mt-1">{message}</span>;
};

// Phone number regex (simple)
const phoneRegex = /^(?:\+63|0)?9\d{9}$/;

export default function PinSourcePanel({ isOpen, onClose, onSubmitSource, onPreviewLocation, categories = [] }) {

    const initialFormState = {
        category: [],
        description: '',
        fullName: '',
        contactNumber: '',
        manualLocation: '',
        coordinates: null
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({}); // --- NEW: For validation
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const [locationSearch, setLocationSearch] = useState('');
    const [locationResults, setLocationResults] = useState([]);
    const [isDebouncing, setIsDebouncing] = useState(false);

    // Reset form when panel opens
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormState);
            setErrors({});
            setLocationSearch('');
            setLocationResults([]);
        }
    }, [isOpen]);

    // Debounced effect for location search
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

    // --- NEW: Validation function ---
    const validateForm = () => {
        const newErrors = {};
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
        // Returns true if form is valid, false otherwise
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on change
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
        // Clear error on change
        if (errors.category) {
            setErrors(prev => ({ ...prev, category: null }));
        }
    };

    const handleLocationSearchChange = (e) => {
        setLocationSearch(e.target.value);
        setFormData(prev => ({ ...prev, manualLocation: e.target.value, coordinates: null }));
        if (errors.location) {
            setErrors(prev => ({ ...prev, location: null }));
        }
    };

    const handleLocationSelect = (result) => {
        const coords = [parseFloat(result.lat), parseFloat(result.lon)];
        setLocationSearch(result.display_name);
        setFormData(prev => ({
            ...prev,
            manualLocation: result.display_name,
            coordinates: coords
        }));
        setLocationResults([]);
        if (errors.location) {
            setErrors(prev => ({ ...prev, location: null }));
        }
        onPreviewLocation(coords); // --- NEW: Call preview handler
    };

    const handleUseCurrentLocation = () => {
        setIsGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = [position.coords.latitude, position.coords.longitude];
                    setFormData(prev => ({
                        ...prev,
                        coordinates: coords,
                        manualLocation: 'Current Location (approx.)'
                    }));
                    setLocationSearch('Current Location (approx.)');
                    setIsGettingLocation(false);
                    if (errors.location) {
                        setErrors(prev => ({ ...prev, location: null }));
                    }
                    onPreviewLocation(coords); // --- NEW: Call preview handler
                },
                (error) => {
                    setIsGettingLocation(false);
                    console.error('Unable to retrieve your location.', error);
                }
            );
        } else {
            setIsGettingLocation(false);
            console.error('Geolocation is not supported by this browser.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // --- NEW: Validate first ---
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
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-green-600">Pinpoint a Source</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Panel Body & Form (Scrollable) */}
                <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5 overflow-y-auto">

                    {/* Category Checkable Buttons */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category <span className="text-red-500">*</span> (Select one or more)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <button
                                    type="button"
                                    key={category}
                                    onClick={() => handleCategoryToggle(category)}
                                    className={`py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                                        formData.category.includes(category)
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                        <FormError message={errors.category} />
                    </div>

                    {/* Location Search/Autocomplete */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={handleUseCurrentLocation}
                                disabled={isGettingLocation}
                                className="w-full flex items-center justify-center space-x-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <Navigation size={16} />
                                <span>{isGettingLocation ? 'Getting Location...' : 'Use My Current Location'}</span>
                            </button>

                            <div className="flex items-center">
                                <div className="flex-1 border-t border-gray-300"></div>
                                <span className="px-2 text-xs text-gray-500 uppercase">or</span>
                                <div className="flex-1 border-t border-gray-300"></div>
                            </div>

                            <div className="relative">
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <span className="pl-3 text-gray-400"><Search size={16} /></span>
                                    <input
                                        type="text"
                                        placeholder="Search for location..."
                                        value={locationSearch}
                                        onChange={handleLocationSearchChange}
                                        className="flex-1 w-full border-none rounded-r-lg px-3 py-2 focus:ring-0"
                                    />
                                    {isDebouncing && <Loader size={16} className="animate-spin text-gray-400 mr-3" />}
                                </div>
                                {locationResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {locationResults.map(result => (
                                            <button
                                                type="button"
                                                key={result.place_id}
                                                onClick={() => handleLocationSelect(result)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                {result.display_name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <FormError message={errors.location} />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            What is this place all about? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g., 'Cebu City Hall - Distribution of free bottled water...'"
                        />
                        <FormError message={errors.description} />
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-700">Your Contact Information <span className="text-red-500">*</span></h3>
                        <div>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                            <FormError message={errors.fullName} />
                        </div>
                        <div>
                            <input
                                type="tel"
                                name="contactNumber"
                                placeholder="Contact Number (e.g., 09171234567)"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                            <FormError message={errors.contactNumber} />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-lg text-white font-medium transition-colors bg-green-600 hover:bg-green-700"
                    >
                        Submit Source
                    </button>
                </form>
            </div>
        </div>
    );
}