import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

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
  const [visibleCount, setVisibleCount] = useState(5);
  const navigate = useNavigate();

  // Fetch locations data from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/locations`);
        let locationsData = response.data;

        // Fetch detailed location data with images if not populated
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

  // Get map URL
  const getMapUrl = (location) => {
    if (location.mapUrl) return location.mapUrl;
    if (location.googleMapsUrl) return location.googleMapsUrl;

    const lat = location.locationCoordinates?.lat;
    const lng = location.locationCoordinates?.lng;
    if (lat && lng) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }

    const query = [location.name, location.address?.line2, location.address?.city, location.address?.state]
      .filter(Boolean)
      .join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const handleLoadMore = () => {
    if (visibleCount < locations.length) {
      setVisibleCount(prev => prev + 5);
    } else {
      navigate('/locations');
    }
  };

  if (loading) {
    return (
      <section id="locations" className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 mb-6">Our Locations</h1>
          <div className="text-xl text-gray-600">Loading locations...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="locations" className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 mb-6">Our Locations</h1>
          <div className="text-xl text-red-600">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="locations" className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 sm:mb-24">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 leading-tight tracking-tight mb-6">
          Our Locations
        </h1>
        <p className="mt-4 text-xl sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Explore our curated collection of world-class properties, each offering a unique and unforgettable experience
        </p>
      </div>

      {/* Location Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {locations.slice(0, visibleCount).map((location, index) => {
          const mainImageUrl = getMainImageUrl(location);
          const mapUrl = getMapUrl(location);
          const areaName = [location.address?.line2, location.address?.city, location.address?.state]
            .filter(Boolean)
            .join(', ') || location.address?.city || 'Vadodara, Gujarat';

          return (
            <div
              key={location._id || index}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center gap-8 lg:gap-12 group`}
            >
              {/* Image */}
              <div className="w-full lg:w-1/2 relative overflow-hidden rounded-2xl shadow-2xl">
                <div className="relative h-80 lg:h-96 overflow-hidden">
                  <img
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    src={mainImageUrl}
                    alt={location.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>

              {/* Content */}
              <div className="w-full lg:w-1/2 space-y-6">
                {/* Map link / area tag */}
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#008DDA] hover:text-[#0278b8] transition-colors duration-300 group/map"
                  title={`View ${location.name} on Google Maps`}
                >
                  <MapPin className="w-5 h-5 group-hover/map:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium uppercase tracking-wider underline-offset-2 hover:underline">
                    {areaName}
                  </span>
                </a>

                {/* Title */}
                <h2 className="text-2xl lg:text-4xl text-gray-900 leading-tight">
                  {location.name}
                </h2>

                {/* Description */}
                <p className="text-lg text-justify text-gray-600 leading-relaxed">
                  {location.description
                    ? `${location.description.substring(0, 220)}${location.description.length > 220 ? '...' : ''}`
                    : 'A luxurious property blending nature and comfort for an unforgettable stay.'}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {location.capacityOfPersons && (
                    <span>{location.capacityOfPersons} guests</span>
                  )}
                  {location.propertyDetails?.bedrooms && (
                    <>
                      {location.capacityOfPersons && <span>·</span>}
                      <span>{location.propertyDetails.bedrooms} bedrooms</span>
                    </>
                  )}
                  {location.propertyDetails?.bathrooms && (
                    <>
                      {(location.capacityOfPersons || location.propertyDetails?.bedrooms) && <span>·</span>}
                      <span>{location.propertyDetails.bathrooms} bathrooms</span>
                    </>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    onClick={() => navigate(`/locations-details/${location._id}`)}
                    className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl text-white bg-[#008DDA] hover:bg-[#0278b8] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    View Details
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate(`/locations-details/${location._id}`)}
                    className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl text-[#008DDA] bg-white border-2 border-[#008DDA] hover:bg-indigo-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* See More Locations Button */}
        {locations.length > 0 && (
          <div className="flex justify-center pt-8">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2 px-10 py-4 text-lg font-bold rounded-xl text-white bg-[#008DDA] hover:bg-[#0278b8] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 cursor-pointer"
            >
              {visibleCount < locations.length ? 'See More Locations' : 'See All Locations'}
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(Location);