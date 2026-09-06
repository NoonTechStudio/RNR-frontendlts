<<<<<<< HEAD
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapPin, Star, ArrowRight, Sun, ChevronDown, ChevronUp, Home, Filter, X, Search } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;
const PRIMARY_COLOR_CLASS = 'text-[#008DDA]';

// Helper to build absolute image URL
const getImageUrl = (image) => {
  if (!image) return null;

  let url = typeof image === 'string' ? image : image?.url || image?.path || image?.webpPath || image?.src;
  if (!url) return null;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  let base = API_BASE_URL ? (API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL) : '';

  if (base.includes('/api')) {
    base = base.split('/api')[0];
  }

  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
};

const Location = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set());

  // Default all groups to CLOSED
  const [expandedGroups, setExpandedGroups] = useState({});
  const navigate = useNavigate();

  // Filter states
  const [filterCity, setFilterCity] = useState('');
  const [filterAddressLine2, setFilterAddressLine2] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [availableAddressLine2, setAvailableAddressLine2] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Extract location group name matching Locations page logic
  const extractLocationGroupName = useCallback((location) => {
    const { address } = location;

    let groupName = '';

    if (address?.line2 && address?.city) {
      groupName = `${address.line2}, ${address.city}`;
    } else if (address?.line2) {
      groupName = address.line2;
    } else if (address?.city) {
      groupName = address.city;
    } else {
      const title = location.name;
      const match = title.match(/"([^"]+)"/);
      if (match && match[1]) return match[1];
      const atMatch = title.match(/at\s+([^\d]+)/i);
      if (atMatch && atMatch[1]) return atMatch[1].trim();
      const colonMatch = title.match(/:\s*([^\d]+)/i);
      if (colonMatch && colonMatch[1]) return colonMatch[1].trim();
      return title;
    }
    return groupName;
  }, []);

  // Extract unique cities and address line 2 values
  useEffect(() => {
    if (locations.length > 0) {
      const cities = [...new Set(
        locations.map(loc => loc.address?.city).filter(city => city && city.trim() !== '')
      )].sort();
      const addressLine2s = [...new Set(
        locations.map(loc => loc.address?.line2).filter(line2 => line2 && line2.trim() !== '')
      )].sort();
      setAvailableCities(cities);
      setAvailableAddressLine2(addressLine2s);
    }
  }, [locations]);

  // Filter locations
  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      const matchesCity = !filterCity ||
        (location.address?.city && location.address.city.toLowerCase() === filterCity.toLowerCase());
      const matchesAddressLine2 = !filterAddressLine2 ||
        (location.address?.line2 && location.address.line2.toLowerCase() === filterAddressLine2.toLowerCase());
      return matchesCity && matchesAddressLine2;
    });
  }, [locations, filterCity, filterAddressLine2]);

  // Group locations
  const locationGroups = useMemo(() => {
    const groups = {};
    filteredLocations.forEach(location => {
      const groupName = extractLocationGroupName(location);
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(location);
    });
    return groups;
  }, [filteredLocations, extractLocationGroupName]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilterCity('');
    setFilterAddressLine2('');
  }, []);

  // Fetch locations data from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setFailedImages(new Set());

        const response = await axios.get(`${API_BASE_URL}/locations`);
        let locationsData = response.data;

        if (locationsData.length > 0 && !locationsData[0].images) {
          locationsData = await Promise.all(
            locationsData.map(async (location) => {
              try {
                const imagesResponse = await axios.get(`${API_BASE_URL}/locations/${location._id}`);
                const images = imagesResponse.data.images || [];
                return { ...location, images };
              } catch (imgError) {
                console.error(`Error fetching images for location ${location._id}:`, imgError);
                return { ...location, images: [] };
              }
            })
          );
        } else {
          locationsData = locationsData.map(loc => ({
            ...loc,
            images: loc.images || []
          }));
        }

        setLocations(locationsData);
        // By default all groups remain CLOSED (expandedGroups = {})
        setExpandedGroups({});

        setLoading(false);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to load locations. Please try again later.');
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Get main image URL
  const getMainImageUrl = useCallback((location) => {
    if (!location.images || location.images.length === 0) {
      return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
    }

    const mainImage = location.images.find(img => img.isMainImage === true);
    if (mainImage) {
      const imageUrl = getImageUrl(mainImage);
      return imageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
    }

    const firstImageUrl = getImageUrl(location.images[0]);
    return firstImageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  }, []);

  const handleImageError = useCallback((locationId, imageUrl) => {
    console.error(`Failed to load image for location ${locationId}:`, imageUrl);
    setFailedImages(prev => new Set([...prev, locationId]));
  }, []);

  const toggleGroupExpand = useCallback((groupName) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  }, []);

  if (loading) {
    return (
      <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 mb-6">Our Locations</h1>
          <div className="text-xl text-gray-600">Loading locations...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 mb-6">Our Locations</h1>
          <div className="text-xl text-red-600">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="locations" className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 sm:mb-16">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 leading-tight tracking-tight mb-4">
=======
import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import SwargImg    from '../assets/Images/Swarg.png';
import MistyImg    from '../assets/Images/MistyWood.png';
import AmbavadiImg from '../assets/Images/ambawadi.png';

const LOCATIONS = [
  {
    id: 'swarg-maru-gaam',
    name: 'Swarg Maru Gaam',
    area: 'Vadodara, Gujarat',
    mapUrl: 'https://maps.app.goo.gl/L8RzR4zsAU3Nkrg7A',
    image: SwargImg,
    description:
      'Introducing Swarg, Maru Gaam — a unique weekend home project that beautifully recreates a village perfect in every detail. Built with the sole purpose of giving you a resort-like feeling amidst nature, this property blends traditional Gujarati charm with modern comforts for an unforgettable stay.',
    guests: 15,
    bedrooms: 2,
    bathrooms: 2,
  },
  {
    id: 'misty-wood-farm-house',
    name: 'Misty Wood Farm House',
    area: 'Vadodara, Gujarat',
    mapUrl: 'https://maps.app.goo.gl/LjmU8dcJjRu2XTfW9',
    image: MistyImg,
    description:
      'Nestled within lush green surroundings, Misty Wood Farm House is a tranquil escape from the city. Wake up to birdsong, enjoy bonfires under starlit skies, and unwind in the lap of nature. The perfect retreat for families, friends, and anyone seeking peace and fresh air.',
    guests: 20,
    bedrooms: 3,
    bathrooms: 2,
  },
  {
    id: 'ambawadi-resort',
    name: 'Ambawadi Resort',
    area: 'Vadodara, Gujarat',
    mapUrl: 'https://maps.app.goo.gl/hN4qKPgcYaJN9MuC7',
    image: AmbavadiImg,
    description:
      'Ambawadi Resort offers a luxurious blend of nature and comfort. Surrounded by mango orchards and open landscapes, this spacious resort is ideal for large gatherings, corporate retreats, pool parties, and destination celebrations. Come and create memories that last a lifetime.',
    guests: 50,
    bedrooms: 5,
    bathrooms: 4,
  },
];

const Location = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 sm:mb-24">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 leading-tight tracking-tight mb-6">
>>>>>>> 33400f3f40d94494055bcf19a7d97e942f5fd394
          Our Locations
        </h1>
        <p className="mt-2 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Explore our curated collection of world-class properties, each offering a unique and unforgettable experience
        </p>
      </div>

<<<<<<< HEAD
      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden border-b border-gray-200 bg-white sticky top-0 z-10 mb-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between py-4 text-gray-700 font-medium"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {(filterCity || filterAddressLine2) && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Active
                </span>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Layout with Sidebar Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Sidebar - Filters */}
          <div className={`
            ${showMobileFilters ? 'block' : 'hidden'}
            lg:block lg:w-80 flex-shrink-0
          `}>
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 lg:sticky lg:top-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                </div>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Active Filters */}
              {(filterCity || filterAddressLine2) && (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">Active Filters</span>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filterCity && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded-full text-xs text-blue-700">
                        City: {filterCity}
                        <button
                          onClick={() => setFilterCity('')}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filterAddressLine2 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded-full text-xs text-blue-700">
                        Area: {filterAddressLine2}
                        <button
                          onClick={() => setFilterAddressLine2('')}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Filter Form Controls */}
              <div className="space-y-6">
                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <div className="relative">
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 appearance-none bg-white cursor-pointer"
                    >
                      <option value="">All Cities</option>
                      {availableCities.map(city => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Address Line 2 / Area Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area
                  </label>
                  <div className="relative">
                    <select
                      value={filterAddressLine2}
                      onChange={(e) => setFilterAddressLine2(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 appearance-none bg-white cursor-pointer"
                    >
                      <option value="">All Areas</option>
                      {availableAddressLine2.map(line2 => (
                        <option key={line2} value={line2}>
                          {line2}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Showing</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredLocations.length} <span className="text-lg font-normal text-gray-600">locations</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    of {locations.length} total
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Grouped Location Cards */}
          <div className="flex-1 space-y-8">
            {Object.entries(locationGroups).map(([groupName, groupLocations]) => {
              const isExpanded = expandedGroups[groupName];

              return (
                <div
                  key={groupName}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  {/* Group Header */}
                  <div
                    className="p-6 sm:p-8 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => toggleGroupExpand(groupName)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                              {groupName}
                            </h2>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                              {groupLocations[0]?.address?.line1 && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {groupLocations[0].address.line1}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Pool Party Badge */}
                          {groupLocations.some(loc => loc.poolPartyConfig?.hasPoolParty) && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              <Sun className="w-3.5 h-3.5" />
                              Pool Party
                              <span className="ml-1 text-xs font-bold">
                                ({groupLocations.filter(loc => loc.poolPartyConfig?.hasPoolParty).length})
                              </span>
                            </span>
                          )}

                          {/* Night Stay Badge */}
                          {groupLocations.some(loc => loc.propertyDetails?.nightStay) && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              <Star className="w-3.5 h-3.5" />
                              Night Stay
                              <span className="ml-1 text-xs font-bold">
                                ({groupLocations.filter(loc => loc.propertyDetails?.nightStay).length})
                              </span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="text-sm text-gray-500">
                            {groupLocations.length} propert{groupLocations.length === 1 ? 'y' : 'ies'} available
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <button
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold ${PRIMARY_COLOR_CLASS} bg-blue-50 hover:bg-blue-100 transition-all duration-300`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGroupExpand(groupName);
                          }}
                        >
                          {isExpanded ? 'Show Less' : 'View More'}
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Border line */}
                  <div className="border-t border-gray-200"></div>

                  {/* Expandable Content */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <div className="p-6 sm:p-8 space-y-10">
                      {groupLocations.map((location) => {
                        const mainImageUrl = getMainImageUrl(location);
                        const hasFailed = failedImages.has(location._id);

                        return (
                          <div
                            key={location._id}
                            className="bg-gray-50 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col lg:flex-row items-stretch"
                          >
                            {/* Image Section */}
                            <div className="w-full lg:w-2/5 relative">
                              <div className="relative h-64 lg:h-full overflow-hidden">
                                {!hasFailed ? (
                                  <img
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    src={mainImageUrl}
                                    alt={location.name}
                                    loading="lazy"
                                    onError={() => handleImageError(location._id, mainImageUrl)}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                      <Home className="w-10 h-10 mx-auto mb-2" />
                                      <p className="text-sm">Image not available</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Content Section */}
                            <div className="w-full lg:w-3/5 p-6 sm:p-8">
                              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                                {location.name}
                              </h3>

                              {/* Address Details */}
                              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-600">
                                {location.address?.line1 && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="truncate">{location.address.line1}</span>
                                  </span>
                                )}
                              </div>

                              {/* Description */}
                              <p className="text-gray-600 mb-6 line-clamp-3">
                                {location.description || 'No description available.'}
                              </p>

                              {/* Features */}
                              <div className="flex flex-wrap gap-3 mb-6">
                                {location.capacityOfPersons && (
                                  <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{location.capacityOfPersons} guests</span>
                                  </div>
                                )}
                                {location.propertyDetails?.bedrooms && (
                                  <div className="flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                                    <Sun className="w-3.5 h-3.5" />
                                    <span>{location.propertyDetails.bedrooms} bedrooms</span>
                                  </div>
                                )}
                                {location.propertyDetails?.bathrooms && (
                                  <div className="flex items-center gap-2 bg-purple-50 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium">
                                    <Sun className="w-3.5 h-3.5" />
                                    <span>{location.propertyDetails.bathrooms} bathrooms</span>
                                  </div>
                                )}
                                {location.poolPartyConfig?.hasPoolParty && (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                    <Sun className="w-3 h-3" />
                                    Pool Party
                                  </span>
                                )}
                                {location.propertyDetails?.nightStay && (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    <Star className="w-3 h-3" />
                                    Night Stay
                                  </span>
                                )}
                              </div>

                              {/* CTA Buttons */}
                              <div className="flex flex-wrap gap-3">
                                <a
                                  href={`/locations-details/${location._id}`}
                                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-[#008DDA] hover:bg-[#0278b8] transition-colors duration-300"
                                >
                                  View Details
                                  <ArrowRight className="w-4 h-4" />
                                </a>
                                <a
                                  href={`/locations-details/${location._id}`}
                                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg text-[#008DDA] bg-white border border-[#008DDA] hover:bg-blue-50 transition-colors duration-300"
                                >
                                  Book Now
                                </a>
                                {(location.poolPartyConfig?.isSharedPoolCreatedFromHere ||
                                  location.poolPartyConfig?.isPrivatePoolCreatedFromHere) && (
                                    <button
                                      onClick={() => navigate(`/locations-details/${location._id}`)}
                                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg
                                      bg-gradient-to-r from-[#008DDA] to-[#00A8E8]
                                      text-white shadow-md hover:shadow-lg
                                      hover:from-[#0278b8] hover:to-[#0090c9]
                                      transition-all duration-300 transform hover:scale-[1.02]
                                      border-2 border-[#008DDA]"
                                    >
                                      <Sun className="w-4 h-4" />
                                      Book Pool Party Only
                                      <ArrowRight className="w-4 h-4" />
                                    </button>
                                  )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {Object.keys(locationGroups).length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="max-w-md mx-auto">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600 mb-2">No locations found</p>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your filters to see more results
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* See All Locations Button */}
        <div className="flex justify-center pt-12">
=======
      {/* Location Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {LOCATIONS.map((location, index) => (
          <div
            key={location.id}
            className={`flex flex-col ${
              index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
            } items-center gap-8 lg:gap-12 group`}
          >
            {/* Image */}
            <div className="w-full lg:w-1/2 relative overflow-hidden rounded-2xl shadow-2xl">
              <div className="relative h-80 lg:h-96 overflow-hidden">
                <img
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  src={location.image}
                  alt={location.name}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>

            {/* Content */}
            <div className="w-full lg:w-1/2 space-y-6">

              {/* Map link / area tag */}
              <a
                href={location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#008DDA] hover:text-[#0278b8] transition-colors duration-300 group/map"
                title={`View ${location.name} on Google Maps`}
              >
                <MapPin className="w-5 h-5 group-hover/map:scale-110 transition-transform duration-300" />
                <span className="text-sm font-medium uppercase tracking-wider underline-offset-2 hover:underline">
                  {location.area}
                </span>
              </a>

              {/* Title */}
              <h2 className="text-2xl lg:text-4xl text-gray-900 leading-tight">
                {location.name}
              </h2>

              {/* Description */}
              <p className="text-lg text-justify text-gray-600 leading-relaxed">
                {location.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{location.guests} guests</span>
                <span>·</span>
                <span>{location.bedrooms} bedrooms</span>
                <span>·</span>
                <span>{location.bathrooms} bathrooms</span>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <button
                  onClick={() => navigate('/locations')}
                  className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl text-white bg-[#008DDA] hover:bg-[#0278b8] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  View Details
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* See All Locations */}
        <div className="flex justify-center pt-8">
>>>>>>> 33400f3f40d94494055bcf19a7d97e942f5fd394
          <a
            href="/locations"
            className="inline-flex items-center gap-2 px-10 py-4 text-lg font-bold rounded-xl text-white bg-[#008DDA] hover:bg-[#0278b8] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            See All Locations
            <ArrowRight className="w-6 h-6" />
          </a>
        </div>
      </div>
    </section>
  );
};

<<<<<<< HEAD
export default React.memo(Location);
=======
export default Location;
>>>>>>> 33400f3f40d94494055bcf19a7d97e942f5fd394
