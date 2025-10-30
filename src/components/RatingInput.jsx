import { useState } from "react"
import "../styles/RatingInput.css"

const RatingInput = ({ value, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0)

  const handleStarClick = (rating) => {
    onChange(rating)
  }

  const handleStarHover = (rating) => {
    setHoverRating(rating)
  }

  const handleMouseLeave = () => {
    setHoverRating(0)
  }

  const displayRating = hoverRating || value

  return (
    <div className="rating-input">
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= displayRating ? "active" : ""}`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={handleMouseLeave}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
      {value > 0 && (
        <div className="rating-display">
          <span className="rating-value">{value.toFixed(1)}</span>
          <span className="rating-text">out of 5</span>
        </div>
      )}
    </div>
  )
}

export default RatingInput
