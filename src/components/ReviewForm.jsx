import { useState } from "react"
import toast from "react-hot-toast"
import RatingInput from "./RatingInput"
import "../styles/ReviewForm.css"

const ReviewForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    overall_rating: 0,
    title: "",
    body: "",
    could_recommend: false,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (formData.overall_rating === 0) {
      newErrors.overall_rating = "Please select a rating"
    }

    if (!formData.title.trim()) {
      newErrors.title = "Review title is required"
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters"
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must not exceed 100 characters"
    }

    if (!formData.body.trim()) {
      newErrors.body = "Review content is required"
    } else if (formData.body.length < 20) {
      newErrors.body = "Review must be at least 20 characters"
    } else if (formData.body.length > 1000) {
      newErrors.body = "Review must not exceed 1000 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({
      ...prev,
      overall_rating: rating,
    }))
    if (errors.overall_rating) {
      setErrors((prev) => ({
        ...prev,
        overall_rating: "",
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    try {
      setLoading(true)
      await onSubmit(formData)
      toast.success("Review submitted successfully!")
    } catch (err) {
      console.error("Error submitting review:", err)
      toast.error(err.response?.data?.message || "Failed to submit review. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      {/* Rating Section */}
      <div className="form-group">
        <label className="form-label">
          Overall Rating <span className="required">*</span>
        </label>
        <RatingInput value={formData.overall_rating} onChange={handleRatingChange} />
        {errors.overall_rating && <span className="error-text">{errors.overall_rating}</span>}
      </div>

      {/* Title Section */}
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Review Title <span className="required">*</span>
        </label>
        <input
          id="title"
          type="text"
          name="title"
          className={`form-input ${errors.title ? "input-error" : ""}`}
          placeholder="e.g., Unforgettable experience"
          value={formData.title}
          onChange={handleInputChange}
          maxLength="100"
        />
        <div className="input-helper">
          <span className={formData.title.length > 90 ? "char-warning" : ""}>{formData.title.length}/100</span>
        </div>
        {errors.title && <span className="error-text">{errors.title}</span>}
      </div>

      {/* Body Section */}
      <div className="form-group">
        <label htmlFor="body" className="form-label">
          Your Review <span className="required">*</span>
        </label>
        <textarea
          id="body"
          name="body"
          className={`form-textarea ${errors.body ? "input-error" : ""}`}
          placeholder="Share your experience with this package. What did you like? What could be improved?"
          value={formData.body}
          onChange={handleInputChange}
          maxLength="1000"
          rows="6"
        />
        <div className="input-helper">
          <span className={formData.body.length > 900 ? "char-warning" : ""}>{formData.body.length}/1000</span>
        </div>
        {errors.body && <span className="error-text">{errors.body}</span>}
      </div>

      {/* Recommendation Section */}
      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="could_recommend"
            checked={formData.could_recommend}
            onChange={handleInputChange}
          />
          <span>I would recommend this package to others</span>
        </label>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  )
}

export default ReviewForm
