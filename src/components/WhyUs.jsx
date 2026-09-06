import React, { useState, useEffect } from 'react';
import { Quote, Star, Video, Image as ImageIcon, ThumbsUp } from 'lucide-react';
import axios from 'axios';
import OwnerImg from '../assets/Images/owner.png';

const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
};

// Default fallback reviews if DB reviews are fewer than 3
const defaultStaticReviews = [
  {
    _id: 'def-1',
    guestName: 'Priya & Aarav Patel',
    guestLocation: 'Ahmedabad',
    rating: 5,
    title: 'Magical Wedding Destination',
    reviewText: 'The perfect wedding destination! The team at Rest and Relax handled everything flawlessly, making our big day in Vadodara absolutely magical and stress-free.',
    wouldRecommend: true,
  },
  {
    _id: 'def-2',
    guestName: 'Raj Kapoor',
    guestLocation: 'CEO, Tech Innovations',
    rating: 5,
    title: 'Outstanding Corporate Retreat',
    reviewText: 'We hosted our annual corporate retreat here, and it was outstanding! The peaceful environment and professional facilities were ideal for team building.',
    wouldRecommend: true,
  },
  {
    _id: 'def-3',
    guestName: 'Meena Sharma',
    guestLocation: 'Baroda',
    rating: 5,
    title: 'Fantastic Family Picnic',
    reviewText: 'A fantastic spot for a family picnic! The kids loved the open space, and the peaceful location near Vadodara was a wonderful escape from the city hustle.',
    wouldRecommend: true,
  },
  {
    _id: 'def-4',
    guestName: 'Vikram & Ananya Desai',
    guestLocation: 'Surat',
    rating: 5,
    title: 'Unforgettable Weekend Stay',
    reviewText: 'The serene atmosphere and luxury amenities made our anniversary celebration extra special. Truly a paradise resort!',
    wouldRecommend: true,
  }
];

const TestimonialSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/reviews`);
        if (res.data?.reviews && res.data.reviews.length > 0) {
          setReviews(res.data.reviews);
        }
      } catch (err) {
        console.error("Error fetching homepage reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Separate video reviews from text/image reviews
  const videoReviews = reviews.filter(r => Boolean(r.video?.url || getYouTubeEmbedUrl(r.youtubeUrl)));
  const textReviews = reviews.filter(r => !r.video?.url && !getYouTubeEmbedUrl(r.youtubeUrl));

  // Combine fetched text reviews with default static reviews if list is short
  const marqueeReviews = textReviews.length > 0 ? textReviews : defaultStaticReviews;
  
  // Duplicate array for seamless infinite marquee scroll loop
  const duplicatedMarqueeReviews = [...marqueeReviews, ...marqueeReviews, ...marqueeReviews];

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Inline styles for right-to-left marquee animation */}
      <style>{`
        @keyframes marqueeLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee-left {
          display: flex;
          width: max-content;
          animation: marqueeLeft 35s linear infinite;
        }
        .animate-marquee-left:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 leading-tight tracking-tight mb-6">
            Why Choose Our Properties?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            You need a getaway that exceeds expectations. That's why we curated exceptional locations to create unforgettable experiences.
          </p>
        </div>

        {/* Featured Owner Testimonial */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 bg-white rounded-3xl shadow-2xl overflow-hidden p-8 lg:p-12">
            {/* Image Section */}
            <div className="w-full lg:w-6/12 flex-shrink-0">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={OwnerImg}
                  alt="Guest testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Testimonial Content */}
            <div className="w-full lg:w-7/12 space-y-6">
              <Quote className="w-12 h-12 text-[#008DDA] opacity-50" />
              
              <blockquote className="text-2xl sm:text-3xl lg:text-4xl text-gray-900 leading-relaxed font-serif">
                "Our resort is more than just a place to stay — it’s a place to create memories, reconnect with loved ones, and experience the best of nature and hospitality."
              </blockquote>
              
              <div className="pt-4">
                <p className="text-xl font-semibold text-gray-900">Taher & Ajab Zabuawala</p>
                <p className="text-base text-[#008DDA] font-medium">Owner and Entrepreneur</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FEATURED VIDEO REVIEWS ================= */}
        {videoReviews.length > 0 && (
          <div className="mb-24">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#008DDA] text-sm font-semibold mb-3">
                <Video className="w-4 h-4" /> Guest Video Stories
              </span>
              <h3 className="text-4xl sm:text-5xl text-gray-900">Watch Guest Experiences</h3>
            </div>

            <div className="space-y-12 max-w-6xl mx-auto">
              {videoReviews.map((rev) => {
                const ytEmbed = getYouTubeEmbedUrl(rev.youtubeUrl);

                return (
                  <div 
                    key={rev._id}
                    className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12"
                  >
                    {/* Left Half: Video Player */}
                    <div className="w-full lg:w-1/2 flex-shrink-0">
                      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg bg-black">
                        {rev.video?.url ? (
                          <video
                            src={rev.video.url}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : ytEmbed ? (
                          <iframe
                            src={ytEmbed}
                            title={rev.title || "Guest Video Review"}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : null}
                      </div>
                    </div>

                    {/* Right Half: Review Details */}
                    <div className="w-full lg:w-1/2 space-y-5">
                      {/* Rating */}
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-6 h-6 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                          />
                        ))}
                        <span className="text-lg font-bold text-gray-800 ml-2">{rev.rating}.0</span>
                      </div>

                      {/* Title */}
                      {rev.title && (
                        <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
                          {rev.title}
                        </h4>
                      )}

                      {/* Review Text */}
                      <blockquote className="text-lg text-gray-700 leading-relaxed italic border-l-4 border-[#008DDA] pl-4">
                        "{rev.reviewText}"
                      </blockquote>

                      {/* Attached Photos thumbnail preview if present */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pt-2 pb-1">
                          {rev.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img.url}
                              alt="Guest uploaded photo"
                              className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm"
                            />
                          ))}
                        </div>
                      )}

                      {/* Guest Details */}
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-xl font-bold text-gray-900">{rev.guestName}</p>
                          <p className="text-sm text-[#008DDA] font-medium">
                            {rev.location?.name || rev.guestLocation || 'Verified Guest'}
                          </p>
                        </div>
                        {rev.wouldRecommend && (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                            <ThumbsUp size={14} /> Recommended
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= HORIZONTAL AUTOMATIC CAROUSEL (MARQUEE) FOR CUSTOMER EXPERIENCES ================= */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-4xl sm:text-5xl text-gray-900 mb-4">Guest Experiences</h3>
            <p className="text-lg text-gray-600">Here's what our guests are saying</p>
          </div>

          {/* Marquee Wrapper */}
          <div className="relative w-full overflow-hidden py-4">
            {/* Left/Right Gradient Fades */}
            <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-left gap-6">
              {duplicatedMarqueeReviews.map((rev, index) => (
                <div 
                  key={`${rev._id}-${index}`}
                  className="w-80 sm:w-96 flex-shrink-0 bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between border border-gray-100"
                >
                  <div>
                    {/* Star Rating */}
                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>

                    {/* Title & Review Text */}
                    {rev.title && (
                      <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{rev.title}</h4>
                    )}
                    <p className="text-base text-gray-700 leading-relaxed mb-4 line-clamp-4">
                      "{rev.reviewText}"
                    </p>

                    {/* Attached Images */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
                        {rev.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt="Guest uploaded"
                            className="w-16 h-16 object-cover rounded-xl border border-gray-100 shadow-sm"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Guest Info */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{rev.guestName}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {rev.location?.name || rev.guestLocation || 'Verified Guest'}
                      </p>
                    </div>
                    {rev.wouldRecommend && (
                      <span className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
                        Recommended
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TestimonialSection;