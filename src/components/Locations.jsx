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
          Our Locations
        </h1>
        <p className="mt-4 text-xl sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Explore our curated collection of world-class properties, each offering a unique and unforgettable experience
        </p>
      </div>

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

export default Location;
