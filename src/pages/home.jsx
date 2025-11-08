import React, { useEffect, useRef, useState } from 'react';

const Home = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
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
    };
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstanceRef.current) {
      // Initialize map centered on Cebu City
      const map = window.L.map(mapRef.current).setView([10.3157, 123.8854], 13);

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Add a marker for Cebu City
      const marker = window.L.marker([10.3157, 123.8854]).addTo(map);
      marker.bindPopup('<b>Cebu City</b><br>Central Visayas, Philippines').openPopup();

      // Add some additional markers
      window.L.marker([10.2934, 123.9019])
        .addTo(map)
        .bindPopup('<b>Mactan-Cebu International Airport</b>');

      window.L.marker([10.3225, 123.8924])
        .addTo(map)
        .bindPopup('<b>Fuente Osmeña Circle</b>');

      mapInstanceRef.current = map;
    }
  }, [isLoaded]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to Cebu City
          </h1>
          <p className="text-xl text-gray-600">
            Explore the beautiful Queen City of the South
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div 
            ref={mapRef} 
            className="w-full h-96 md:h-[600px]"
            style={{ minHeight: '400px' }}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🏖️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Beautiful Beaches</h3>
            <p className="text-gray-600">Discover pristine white sand beaches and crystal-clear waters</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🏛️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Rich History</h3>
            <p className="text-gray-600">Explore centuries of Spanish colonial heritage and culture</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Amazing Cuisine</h3>
            <p className="text-gray-600">Taste the famous lechon and other local delicacies</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;