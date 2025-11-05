import "../styles/ReviewCard.css"

const ReviewCard = ({ reviewData }) => {
  const { review_title, review_body, overall_rating, cleanliness_rating, created_at, stay_date } = reviewData

  // Function to render star ratings
  const renderStars = (rating) => {
    const fullStars = "★".repeat(Math.floor(rating))
    const emptyStars = "☆".repeat(5 - Math.floor(rating))
    return (
      <div className="stars">
        <span className="full-stars">{fullStars}</span>
        <span className="empty-stars">{emptyStars}</span>
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="testimonial-card">
      <div className="review-header">
        <div>
          <h4 className="review-title">{review_title}</h4>
          <div className="review-meta">
            <span className="stay-date">Stayed on {formatDate(stay_date)}</span>
            <span className="review-date">Reviewed on {formatDate(created_at)}</span>
          </div>
        </div>
      </div>

      <div className="ratings-container">
        <div className="rating-item">
          <span className="rating-label">Overall Rating</span>
          {renderStars(overall_rating)}
          <span className="rating-value">{overall_rating.toFixed(1)}/5</span>
        </div>
        <div className="rating-item">
          <span className="rating-label">Cleanliness</span>
          {renderStars(cleanliness_rating)}
          <span className="rating-value">{cleanliness_rating.toFixed(1)}/5</span>
        </div>
      </div>

      <p className="review-body">"{review_body}"</p>
    </div>
  )
}

export default ReviewCard
