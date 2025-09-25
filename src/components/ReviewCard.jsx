import React from 'react';
import '../styles/ReviewCard.css';

const ReviewCard = ({ reviewData }) => {
  const { author, rating, comment } = reviewData;

  // Function to render star ratings based on the testimonial card's style
  const renderStars = (starRating) => {
    // You can replace these with SVG stars for a more polished look
    const fullStars = '★'.repeat(Math.floor(starRating));
    return (
      <div className="stars">
        {fullStars}
      </div>
    );
  };

  return (
    <div className="testimonial-card">
      {renderStars(rating)}
      <p>"{comment}"</p>
      <div className="testimonial-author">
        <img
          src="https://placehold.co/60x60/A1A1A1/FFFFFF?text=User"
          alt={author}
        />
        <div>
          <h4>{author}</h4>
          <span>Verified Traveler</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
