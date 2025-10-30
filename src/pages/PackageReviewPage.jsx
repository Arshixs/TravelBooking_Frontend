import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useUser } from "../context/context";
import PackageReviewCard from "../components/PackageReviewCard";
import "../styles/PackageReviewPage.css";

const PackageReviewPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchReviews();
  }, [isAuthenticated]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get("/package-reviews/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Sort reviews by creation date (newest first)
        response.data.data.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB.getTime() - dateA.getTime();
        });
        setReviews(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load your reviews. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      setDeleteLoading(reviewId);
      const token = localStorage.getItem("accessToken");
      await axios.delete(`/package-reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the deleted review from the list
      setReviews(reviews.filter((review) => review.review_id !== reviewId));
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete the review. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="package-review-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="package-review-page">
      <div className="reviews-container">
        <div className="reviews-header">
          <h1>My Package Reviews</h1>
          <button className="btn-secondary" onClick={() => navigate("/bookings/packages/my")}>
            View My Bookings
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="no-reviews">
            <div className="no-reviews-icon">⭐</div>
            <h2>No reviews yet</h2>
            <p>You haven't written any package reviews yet</p>
            <button className="btn-primary" onClick={() => navigate("/bookings/packages/my")}>
              View Your Bookings
            </button>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <PackageReviewCard
                key={review.review_id}
                review={review}
                onDelete={handleDeleteReview}
                isDeleting={deleteLoading === review.review_id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PackageReviewPage;
