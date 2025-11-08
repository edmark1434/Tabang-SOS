import React, { useState } from 'react';
import { X, Search, Phone, Shield } from 'lucide-react';
import { emergencyContacts } from '../data/emergencyContacts.js'; // Assuming data is in /data

const EmergencyContactsPage = ({ onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Get all categories for the filter dropdown
    const allCategories = ['All', ...emergencyContacts.categories.map(cat => cat.name)];

    // Filter logic
    const filteredCategories = emergencyContacts.categories
        .filter(category => {
            // Filter by selected category
            return selectedCategory === 'All' || category.name === selectedCategory;
        })
        .map(category => {
            // Filter contacts within the category by search term
            const filteredContacts = category.contacts.filter(contact =>
                contact.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            // Return the category only if it has matching contacts
            return {
                ...category,
                contacts: filteredContacts,
            };
        })
        .filter(category => category.contacts.length > 0); // Remove categories with no matching contacts

    // Check if any results were found after all filtering
    const noResults = filteredCategories.length === 0;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 font-sans animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <Shield className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Emergency Hotlines</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                        title="Close"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Controls: Search and Filter */}
                <div className="p-5 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search by name (e.g., 'Cebu City', 'Fire', 'PNP')"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                            <Search
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative sm:max-w-xs flex-1">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                                {allCategories.map(categoryName => (
                                    <option key={categoryName} value={categoryName}>
                                        {categoryName}
                                    </option>
                                ))}
                            </select>
                            <svg className="w-5 h-5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Contacts List */}
                <div className="overflow-y-auto p-5">
                    {noResults ? (
                        <div className="text-center py-12">
                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">No contacts found</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Try adjusting your search or filter.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredCategories.map(category => (
                                <section key={category.name}>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                                        {category.name}
                                    </h3>
                                    <ul className="divide-y divide-gray-100">
                                        {category.contacts.map(contact => (
                                            <li
                                                key={contact.name}
                                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-2 hover:bg-gray-50 rounded-lg"
                                            >
                                                <span className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">
                                                    {contact.name}
                                                </span>
                                                <a
                                                    href={`tel:${contact.number.split('/')[0].replace(/[^0-9+]/g, '')}`}
                                                    className="flex items-center space-x-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                >
                                                    <Phone size={14} />
                                                    <span>{contact.number}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Credits */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                        {emergencyContacts.credits.developedBy} - v{emergencyContacts.credits.version}
                    </p>
                </div>
            </div>

            {/* Simple fade-in animation */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default EmergencyContactsPage;