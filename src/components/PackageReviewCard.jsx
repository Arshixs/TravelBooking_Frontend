import "../styles/PackageReviewCard.css";

const PackageReviewCard = ({ review, onDelete, isDeleting }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="stars-container">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star full">
            ★
          </span>
        ))}
        {hasHalfStar && <span className="star half">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star empty">
            ★
          </span>
        ))}
        <span className="rating-value">({rating})</span>
      </div>
    );
  }

  return (
    <div className="review-card">
      <div className="review-card-header">
        <div className="review-rating">{renderStars(review.overall_rating)}</div>
        <button
          className="btn-delete"
          onClick={() => onDelete(review.review_id)}
          disabled={isDeleting}
          title="Delete this review"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <div className="review-card-body">
        <h3 className="review-title">{review.title}</h3>
        <p className="review-body">{review.body}</p>

        <div className="review-meta">
          {/* <div className="meta-item">
            <span className="meta-label">Booking ID:</span>
            <span className="meta-value">#{review.package_booking_id}</span>
          </div> */}
          <div className="meta-item">
            <span className="meta-label">Date:</span>
            <span className="meta-value">{formatDate(review.created_at)}</span>
          </div>
          {review.could_recommend && (
            <div className="meta-item recommend">
              <span className="recommend-badge">✓ Would Recommend</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PackageReviewCard;
