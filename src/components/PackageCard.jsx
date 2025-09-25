import React, { useState } from 'react';
import ReviewCard from './ReviewCard';
import '../styles/PackageCard.css';

const PackageCard = ({ packageData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    name,
    tour_type,
    duration_days,
    max_capacity,
    itinerary_summary,
    full_description,
    itinerary_items,
    status,
    avg_rating,
    reviews,
    image_url
  } = packageData;

  const statusColor = status === 'available' ? 'green' : 'red';

  const renderStars = (rating) => {
    const fullStars = '★'.repeat(Math.floor(rating));
    const emptyStars = '☆'.repeat(5 - Math.floor(rating));
    return (
      <span className="star-rating">
        {fullStars}{emptyStars}
      </span>
    );
  };

  return (
    <div className="package-card">
      <img
        src={image_url}
        alt={name}
        className="package-image"
      />
      <div className="package-header">
        <h2 className="package-name">{name}</h2>
        <span className={`package-status ${status}`}>
          {status === 'available' ? 'Available' : 'Finished'}
        </span>
      </div>
      <div className="package-details">
        <p><strong>Type:</strong> {tour_type}</p>
        <p><strong>Duration:</strong> {duration_days} Days</p>
        <p><strong>Capacity:</strong> {max_capacity}</p>
        <p><strong>Rating:</strong> {renderStars(avg_rating)} {avg_rating}</p>
      </div>
      <div className="package-summary">
        <p>{itinerary_summary}</p>
        <button onClick={() => setIsExpanded(!isExpanded)} className="expand-btn">
          {isExpanded ? 'Collapse' : 'Read More'}
        </button>
      </div>

      {isExpanded && (
        <div className="collapsible-content">
          <div className="package-description">
            <h3>Description</h3>
            <p>{full_description}</p>
          </div>
          <div className="package-itinerary">
            <h3>Itinerary</h3>
            <ul>
              {itinerary_items.map((item) => (
                <li key={item.item_id}>
                  <strong>Day {item.day_number}: {item.title}</strong>
                  <p>{item.description}</p>
                  <p className="itinerary-location">Location: {item.city}, {item.state}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="reviews-section">
            <h3>Customer Reviews</h3>
            {/* <div className="reviews-grid"> */}
              {reviews.map(review => (
                <ReviewCard key={review.id} reviewData={review} />
              ))}
            {/* </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageCard;
