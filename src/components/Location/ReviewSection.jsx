import React, { useState, useMemo } from 'react';
import { Star, Award, Video, ThumbsUp } from 'lucide-react';
import { formatReviewDate } from '../../utils/locations/locationUitls';

// Helper to get youtube embed url
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
};

// Pure helper moved outside component
const renderStars = (rating) => {
  const numericRating = Number(rating) || 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={star <= numericRating ? "text-black fill-current" : "text-gray-300"}
        />
      ))}
    </div>
  );
};

// Memoized GuestFavorite component
const GuestFavorite = React.memo(({ rating }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-white p-6 mb-8 text-center max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-4xl font-bold text-gray-900">{rating}</span>
        {renderStars(rating)}
      </div>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Award className="text-black" size={50} />
        <h3 className="text-4xl font-semibold text-gray-900">Guest favourite</h3>
      </div>
      <p className="text-gray-600 text-sm max-w-md leading-relaxed">
        This home is a guest favourite based on<br />
        ratings, reviews and reliability
      </p>
    </div>
  );
});

const ReviewsSection = ({ reviews, expandedReviews, onToggleReviewExpansion }) => {
  const [showAll, setShowAll] = useState(false);

  // Memoize average rating to avoid recalculation
  const averageRating = useMemo(
    () => reviews?.summary?.averageRating || 0,
    [reviews?.summary?.averageRating]
  );

  const allReviewsList = reviews?.reviews || [];

  // Separate video reviews from standard reviews
  const videoReviews = useMemo(
    () => allReviewsList.filter((r) => Boolean(r.video?.url || getYouTubeEmbedUrl(r.youtubeUrl))),
    [allReviewsList]
  );

  const standardReviews = useMemo(
    () => allReviewsList.filter((r) => !r.video?.url && !getYouTubeEmbedUrl(r.youtubeUrl)),
    [allReviewsList]
  );

  // Visible standard reviews based on showAll toggle
  const visibleStandardReviews = useMemo(
    () => (showAll ? standardReviews : standardReviews.slice(0, 4)),
    [standardReviews, showAll]
  );

  // If no reviews at all, render nothing
  if (!allReviewsList.length) return null;

  return (
    <div className="mt-16 border-t border-gray-200 pt-12">
      <div className="max-w-7xl mx-auto">
        {/* Conditionally render GuestFavorite */}
        {averageRating >= 4.5 && <GuestFavorite rating={averageRating} />}

        <h3 className="font-semibold text-2xl mb-8">Guest Reviews</h3>

        {/* ================= FEATURED VIDEO REVIEWS SECTION ================= */}
        {videoReviews.length > 0 && (
          <div className="mb-12 space-y-8">
            <div className="flex items-center gap-2 text-[#008DDA] font-semibold text-sm">
              <Video size={18} />
              <span>Featured Guest Video Stories</span>
            </div>

            {videoReviews.map((rev) => {
              const ytEmbed = getYouTubeEmbedUrl(rev.youtubeUrl);

              return (
                <div
                  key={rev._id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow flex flex-col lg:flex-row items-center gap-8"
                >
                  {/* Left Half (50%): Video Player */}
                  <div className="w-full lg:w-1/2 flex-shrink-0">
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm bg-black">
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

                  {/* Right Half (50%): Review Details */}
                  <div className="w-full lg:w-1/2 space-y-4">
                    {/* Guest info & rating */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-semibold text-gray-600 text-sm">
                            {(rev.guestName || 'Guest').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-base capitalize">
                            {rev.guestName || 'Guest'}
                          </h4>
                          {rev.yearsOnPlatform && (
                            <p className="text-gray-500 text-xs">
                              {rev.yearsOnPlatform} years on platform
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(rev.rating)}
                        <span className="text-sm font-semibold text-gray-800 ml-1">
                          {rev.rating}.0
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    {rev.title && (
                      <h4 className="font-bold text-gray-900 text-xl">
                        {rev.title}
                      </h4>
                    )}

                    {/* Review text */}
                    <p className="text-gray-700 leading-relaxed text-sm italic border-l-4 border-[#008DDA] pl-3">
                      "{rev.reviewText}"
                    </p>

                    {/* Attached photos if present */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pt-1 pb-1">
                        {rev.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt="Review attachment"
                            className="w-16 h-16 object-cover rounded-lg border border-gray-100 shadow-sm"
                          />
                        ))}
                      </div>
                    )}

                    {/* Stay details & recommend badge */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                      <div>
                        <span>{formatReviewDate(rev.createdAt || rev.stayDate)}</span>
                        {rev.stayDetails && <span className="ml-2">• {rev.stayDetails}</span>}
                      </div>
                      {rev.wouldRecommend && (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                          <ThumbsUp size={12} /> Recommended
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= STANDARD REVIEWS GRID (2 COLUMNS) ================= */}
        {standardReviews.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {visibleStandardReviews.map((review, index) => {
              const isExpanded = expandedReviews[review._id];
              const reviewText = review.reviewText || '';
              const shouldTruncate = reviewText.length > 150 && !isExpanded;
              const displayText = shouldTruncate
                ? `${reviewText.substring(0, 150)}...`
                : reviewText;

              return (
                <div
                  key={review._id || index}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="font-semibold text-gray-600 text-sm">
                              {(review.guestName || 'Guest').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-base capitalize">
                              {review.guestName || 'Guest'}
                            </h4>
                            {review.title && (
                              <p className="text-sm font-semibold text-gray-700">{review.title}</p>
                            )}
                            {review.yearsOnPlatform && (
                              <p className="text-gray-600 text-xs">
                                {review.yearsOnPlatform} years on Airbnb
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        {renderStars(review.rating)}
                        <span className="text-gray-500 text-sm">
                          {formatReviewDate(review.createdAt || review.stayDate)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {displayText}
                      </p>

                      {reviewText.length > 150 && (
                        <button
                          onClick={() => onToggleReviewExpansion(review._id)}
                          className="text-gray-600 font-medium hover:text-gray-800 transition-colors mt-2 text-sm"
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>

                    {/* Attached Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto mb-4 pb-2">
                        {review.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt="Review attachment"
                            className="w-20 h-20 object-cover rounded-xl border border-gray-100 shadow-sm"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 pt-4 border-t border-gray-100">
                    {review.guestLocation && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{review.guestLocation}</span>
                      </div>
                    )}
                    {review.stayDetails && (
                      <div className="flex items-center gap-1">
                        <span>{review.stayDetails}</span>
                        {review.travelGroup && (
                          <>
                            <span className="text-gray-400 mx-1">•</span>
                            <span>{review.travelGroup}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Toggle button for showing all standard reviews */}
        {standardReviews.length > 4 && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 border border-gray-400 rounded-lg font-medium hover:bg-gray-50 transition-colors text-gray-900 text-base"
            >
              {showAll
                ? 'Show less reviews'
                : `Show all ${standardReviews.length} reviews`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ReviewsSection);