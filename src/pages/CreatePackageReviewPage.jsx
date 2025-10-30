import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "../utils/axios"
import { useUser } from "../context/context"
import ReviewForm from "../components/ReviewForm"
import "../styles/CreatePackageReviewPage.css"

const CreatePackageReviewPage = () => {
  const navigate = useNavigate()
  const { packageId } = useParams()
  const { isAuthenticated } = useUser()
  const [packageData, setPackageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    fetchPackageData()
  }, [isAuthenticated, packageId])

  const fetchPackageData = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("accessToken")

      // Fetch the package booking details
      const response = await axios.get(`/bookings/packages/${packageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("Package booking data:", response.data.data);

      if (response.data.success) {
        setPackageData(response.data.data)
      }
    } catch (err) {
      console.error("Error fetching package data:", err)
      setError("Failed to load package details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleReviewSubmit = async (reviewData) => {
    try {
      const token = localStorage.getItem("accessToken")
      const payload = {
        ...reviewData,
        package_booking_id: packageId,
      }
      const response = await axios.post(`/package-reviews/${packageId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        navigate("/reviews/packages/my")
      }
    } catch (err) {
      console.error("Error submitting review:", err)
      throw err
    }
  }

  if (loading) {
    return (
      <div className="create-review-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading package details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="create-review-page">
      <div className="review-form-container">
        <div className="form-header">
          <button className="back-button" onClick={() => navigate("/bookings/packages/my")}>
            ← Back to Bookings
          </button>
          <h1>Write a Review</h1>
          {packageData && (
            <p className="package-info">
              Package: <strong>{packageData.package_name || "Your Package"}</strong>
            </p>
          )}
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <ReviewForm onSubmit={handleReviewSubmit} />
      </div>
    </div>
  )
}

export default CreatePackageReviewPage
