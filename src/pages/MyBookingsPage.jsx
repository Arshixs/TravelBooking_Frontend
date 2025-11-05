import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "../utils/axios"
import { useUser } from "../context/context"
import toast from "react-hot-toast"
import "../styles/MyBookingsPage.css"
import { mockHotelReviews } from "../mockHotelReviews" // Import added

const MyBookingsPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useUser()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("CONFIRMED")
  const [downloadingReceipt, setDownloadingReceipt] = useState(null)
  const [cancellingBooking, setCancellingBooking] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState(null)

  // Refund states
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [showRefundStatusModal, setShowRefundStatusModal] = useState(false)
  const [bookingToRefund, setBookingToRefund] = useState(null)
  const [refundReason, setRefundReason] = useState("")
  const [submittingRefund, setSubmittingRefund] = useState(false)
  const [loadingRefundStatus, setLoadingRefundStatus] = useState(false)
  const [refundStatus, setRefundStatus] = useState(null)

  const [showHotelReviewModal, setShowHotelReviewModal] = useState(false)
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null)
  const [hotelReviews, setHotelReviews] = useState([])
  const [loadingHotelReviews, setLoadingHotelReviews] = useState(false)
  const [showCreateReviewForm, setShowCreateReviewForm] = useState(false)
  const [reviewFormData, setReviewFormData] = useState({
    cleanliness_rating: 5,
    overall_rating: 5,
    review_title: "",
    review_body: "",
    could_recommend: true,
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    fetchBookings()
  }, [isAuthenticated, filter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("accessToken")
      const url = filter === "all" ? "/bookings/hotels/my" : `/bookings/hotels/my?status=${filter}`

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // console.log(response.data)

      response.data.data.sort((a, b) => {
        const dateA = new Date(a.booking_date)
        const dateB = new Date(b.booking_date)
        return dateB.getTime() - dateA.getTime()
      })
      setBookings(response.data.data)
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const isUpcomingBooking = (checkInDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkIn = new Date(checkInDate)
    checkIn.setHours(0, 0, 0, 0)
    return checkIn >= today
  }

  const handleCancelClick = (booking) => {
    setBookingToCancel(booking)
    setShowCancelModal(true)
  }

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return

    try {
      setCancellingBooking(bookingToCancel.booking_id)
      const token = localStorage.getItem("accessToken")

      const response = await axios.post(
        `/bookings/hotels/${bookingToCancel.booking_id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data.success) {
        toast.success("Booking cancelled successfully!")
        setShowCancelModal(false)
        setBookingToCancel(null)
        fetchBookings()
      }
    } catch (error) {
      console.error("Error cancelling booking:", error)
      const errorMessage = error.response?.data?.message || "Failed to cancel booking. Please try again."
      toast.error(errorMessage)
    } finally {
      setCancellingBooking(null)
    }
  }

  const handleCancelModalClose = () => {
    setShowCancelModal(false)
    setBookingToCancel(null)
  }

  // Refund functions
  const handleClaimRefundClick = (booking) => {
    // console.log(booking)
    setBookingToRefund(booking)
    setRefundReason("")
    setShowRefundModal(true)
  }

  const handleRefundSubmit = async () => {
    if (!bookingToRefund || !refundReason.trim()) {
      toast.error("Please provide a reason for the refund request.")
      return
    }

    try {
      setSubmittingRefund(true)
      const token = localStorage.getItem("accessToken")

      // Get payment ID from booking
      const paymentId = bookingToRefund.parentBooking.payment_id

      if (!paymentId) {
        toast.error("Payment information not found for this booking.")
        return
      }

      const response = await axios.post(
        `/payments/${paymentId}/refund`,
        { refund_reason: refundReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data.success) {
        toast.success("Refund request submitted successfully!")
        setShowRefundModal(false)
        setBookingToRefund(null)
        setRefundReason("")
        fetchBookings()
      }
    } catch (error) {
      console.error("Error submitting refund request:", error)
      const errorMessage = error.response?.data?.message || "Failed to submit refund request. Please try again."
      toast.error(errorMessage)
    } finally {
      setSubmittingRefund(false)
    }
  }

  const handleRefundModalClose = () => {
    if (!submittingRefund) {
      setShowRefundModal(false)
      setBookingToRefund(null)
      setRefundReason("")
    }
  }

  const handleViewRefundStatus = async (booking) => {
    try {
      setLoadingRefundStatus(true)
      setShowRefundStatusModal(true)
      const token = localStorage.getItem("accessToken")

      const paymentId = booking.parentBooking.payment_id

      if (!paymentId) {
        setRefundStatus({ error: "Payment information not found." })
        return
      }

      const response = await axios.get(`payments/refund/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // console.log(response.data.data)

      if (response.data.success) {
        setRefundStatus(response.data.data)
      } else {
        setRefundStatus({ error: "No refund found for this booking." })
      }
    } catch (error) {
      console.error("Error fetching refund status:", error)
      setRefundStatus({
        error: error.response?.data?.message || "Failed to fetch refund status.",
      })
    } finally {
      setLoadingRefundStatus(false)
    }
  }

  const handleRefundStatusModalClose = () => {
    setShowRefundStatusModal(false)
    setRefundStatus(null)
  }

  const downloadReceipt = async (bookingId) => {
    try {
      setDownloadingReceipt(bookingId)
      const token = localStorage.getItem("accessToken")

      const response = await axios.get(`/bookings/hotels/${bookingId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const receiptData = response.data.data
      generatePDF(receiptData)
    } catch (error) {
      console.error("Error downloading receipt:", error)
      toast.error("Failed to download receipt. Please try again.")
    } finally {
      setDownloadingReceipt(null)
    }
  }

  const generatePDF = (data) => {
    const { booking, customer, hotel, room, payment } = data

    const printWindow = window.open("", "", "width=800,height=600")

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Receipt - ${booking.booking_id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: #f5f5f5;
          }
          
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #2563eb;
            font-size: 32px;
            margin-bottom: 10px;
          }
          
          .header p {
            color: #666;
            font-size: 14px;
          }
          
          .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .receipt-info-block h3 {
            color: #1f2937;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          
          .receipt-info-block p {
            color: #4b5563;
            font-size: 14px;
            margin: 5px 0;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section-title {
            background: #f3f4f6;
            padding: 10px 15px;
            color: #1f2937;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
            border-left: 4px solid #2563eb;
          }
          
          .details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            padding: 0 15px;
          }
          
          .detail-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .detail-label {
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
          }
          
          .detail-value {
            color: #1f2937;
            font-size: 14px;
            font-weight: 600;
            text-align: right;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .status-confirmed {
            background: #dcfce7;
            color: #166534;
          }
          
          .status-finished {
            background: #dbeafe;
            color: #1e40af;
          }
          
          .status-pending {
            background: #fef3c7;
            color: #92400e;
          }
          
          .status-cancelled {
            background: #fee2e2;
            color: #991b1b;
          }
          
          .total-section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 18px;
          }
          
          .total-row.grand-total {
            border-top: 2px solid #2563eb;
            margin-top: 10px;
            padding-top: 15px;
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          
          .footer p {
            margin: 5px 0;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .receipt-container {
              box-shadow: none;
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>BOOKING RECEIPT</h1>
            <p>TravelPro - Your Travel Partner</p>
          </div>
          
          <div class="receipt-info">
            <div class="receipt-info-block">
              <h3>Receipt Details</h3>
              <p><strong>Booking ID:</strong> #${booking.booking_id}</p>
              <p><strong>Booking Date:</strong> ${new Date(booking.booking_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}</p>
              <p><strong>Status:</strong> <span class="status-badge status-${booking.status.toLowerCase()}">${
                booking.status
              }</span></p>
            </div>
            
            <div class="receipt-info-block">
              <h3>Customer Information</h3>
              <p><strong>${customer.name}</strong></p>
              <p>${customer.email}</p>
              <p>${customer.phone}</p>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Hotel Information</div>
            <div style="padding: 0 15px;">
              <p style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 10px;">${hotel.name}</p>
              <p style="color: #4b5563; margin-bottom: 5px;">${hotel.address}</p>
              <p style="color: #4b5563;">Phone: ${hotel.phone} | Email: ${hotel.email}</p>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Booking Details</div>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Check-in Date:</span>
                <span class="detail-value">${new Date(booking.check_in_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Check-out Date:</span>
                <span class="detail-value">${new Date(booking.check_out_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Number of Nights:</span>
                <span class="detail-value">${booking.number_of_nights}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Number of Rooms:</span>
                <span class="detail-value">${booking.no_of_rooms}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Number of Guests:</span>
                <span class="detail-value">${booking.guest_count}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Room Type:</span>
                <span class="detail-value">${booking.room_type}</span>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Room Details</div>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Room Type:</span>
                <span class="detail-value">${room.type}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Bed Type:</span>
                <span class="detail-value">${room.bed_type}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Max Capacity:</span>
                <span class="detail-value">${room.max_capacity} persons</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Balcony:</span>
                <span class="detail-value">${room.balcony_available ? "Yes" : "No"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Cost per Night:</span>
                <span class="detail-value">₹${room.cost_per_night.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          ${
            payment && payment.payment_id
              ? `
          <div class="section">
            <div class="section-title">Payment Information</div>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Payment ID:</span>
                <span class="detail-value">#${payment.payment_id}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">${new Date(payment.payment_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment Mode:</span>
                <span class="detail-value">${payment.payment_mode}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Transaction Ref:</span>
                <span class="detail-value">${payment.transaction_reference || "N/A"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment Status:</span>
                <span class="detail-value"><span class="status-badge status-${payment.status.toLowerCase()}">${
                  payment.status
                }</span></span>
              </div>
            </div>
          </div>
          `
              : ""
          }
          
          <div class="total-section">
            <div class="total-row">
              <span>Room Charges (${booking.no_of_rooms} × ₹${
                room.cost_per_night
              } × ${booking.number_of_nights} nights):</span>
              <span>₹${(booking.no_of_rooms * room.cost_per_night * booking.number_of_nights).toLocaleString()}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total Amount:</span>
              <span>₹${booking.total_cost.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Thank you for choosing TravelPro!</strong></p>
            <p>For any queries, please contact us at support@travelpro.com or call +91-1234567890</p>
            <p>This is a computer-generated receipt and does not require a signature.</p>
            <p style="margin-top: 10px; font-size: 10px;">Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 100);
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "status-confirmed"
      case "FINISHED":
        return "status-finished"
      case "CANCELLED":
        return "status-cancelled"
      default:
        return ""
    }
  }

  const getRefundStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
      case "COMPLETED":
        return "refund-status-approved"
      case "PENDING":
        return "refund-status-pending"
      case "REJECTED":
        return "refund-status-rejected"
      default:
        return "refund-status-pending"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleViewHotelReviews = async (booking) => {
    try {
      setLoadingHotelReviews(true)
      setSelectedBookingForReview(booking)
      setShowHotelReviewModal(true)
      // Always show create form immediately if no reviews exist
      setShowCreateReviewForm(false)
      setReviewFormData({
        overall_rating: 5,
        review_title: "",
        review_body: "",
        could_recommend: true,
      });
      const token = localStorage.getItem("accessToken");

      // Mock: Get reviews from mockHotelReviews
      console.log(booking);
      const result = await axios.get(
        `/hotel_review/booking/${booking.booking_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log(result);
      if(result.data.data == null){
        setShowCreateReviewForm(true);
      }
      else setHotelReviews([result.data.data]);
    } catch (error) {
      console.error("Error fetching hotel reviews:", error)
      setHotelReviews([])
    } finally {
      setLoadingHotelReviews(false)
    }
  }
  const reviewExists = async (booking) => {
    try{
      const token = localStorage.getItem("accessToken");
      const result = await axios.get(`/hotel_review/booking/${booking.booking_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if(result.data.data === null) return booking.reviewExists = 0;
      return booking.reviewExists = 1;
    } catch(error){
      console.log(error);
    }
  }

  const handleSubmitHotelReview = async () => {
    if (!reviewFormData.review_title.trim() || !reviewFormData.review_body.trim()) {
      window.alert("Please fill in all fields");
      return
    }

    if (reviewFormData.review_title.length < 5 || reviewFormData.review_title.length > 100) {
      window.alert("Title must be between 5 and 100 characters");
      return
    }

    if (reviewFormData.review_body.length < 20 || reviewFormData.review_body.length > 1000) {
      window.alert("Review must be between 20 and 1000 characters");
      return
    }

    try {
      setSubmittingReview(true)
      const token = localStorage.getItem("accessToken")
      console.log(reviewFormData);

      const response = await axios.post(`/hotel_review/booking/${selectedBookingForReview.booking_id}`, reviewFormData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        toast.success("Review submitted successfully!")
        setShowCreateReviewForm(false)
        setReviewFormData({
          overall_rating: 5,
          review_title: "",
          review_body: "",
          could_recommend: true,
        })
        // Refresh reviews
        handleViewHotelReviews(selectedBookingForReview)
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      const errorMessage = error.response?.data?.message || "Failed to submit review. Please try again."
      toast.error(errorMessage)
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteHotelReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return
    }

    try {
      const token = localStorage.getItem("accessToken")

      const response = await axios.delete(`/reviews/hotels/${selectedBookingForReview.booking_id}/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        toast.success("Review deleted successfully!")
        handleViewHotelReviews(selectedBookingForReview)
      }
    } catch (error) {
      console.error("Error deleting review:", error)
      const errorMessage = error.response?.data?.message || "Failed to delete review. Please try again."
      toast.error(errorMessage)
    }
  };


  const handleCloseReviewModal = () => {
    setShowHotelReviewModal(false)
    setSelectedBookingForReview(null)
    setHotelReviews([])
    setShowCreateReviewForm(false)
    setReviewFormData({
      overall_rating: 5,
      review_title: "",
      review_body: "",
      could_recommend: true,
    })
  }

  if (loading) {
    return (
      <div className="my-bookings-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="my-bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <h1>My Hotel Bookings</h1>
          <button className="btn-secondary" onClick={() => navigate("/hotels")}>
            Book Another Hotel
          </button>
        </div>

        <div className="bookings-filters">
          <button className={filter === "all" ? "filter-btn active" : "filter-btn"} onClick={() => setFilter("all")}>
            All Bookings
          </button>
          <button
            className={filter === "CONFIRMED" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("CONFIRMED")}
          >
            Confirmed
          </button>
          <button
            className={filter === "FINISHED" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("FINISHED")}
          >
            Finished
          </button>
          <button
            className={filter === "CANCELLED" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("CANCELLED")}
          >
            Cancelled
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">📅</div>
            <h2>No bookings found</h2>
            <p>
              {filter === "all"
                ? "You haven't made any hotel bookings yet"
                : `You don't have any ${filter.toLowerCase()} bookings`}
            </p>
            <button className="btn-primary" onClick={() => navigate("/hotels")}>
              Browse Hotels
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking.booking_id} className="booking-card">
                <div className="booking-card-header">
                  <h3>Booking #{booking.booking_id}</h3>
                  <span className={`status-badge ${getStatusClass(booking.status)}`}>{booking.status}</span>
                </div>

                <div className="booking-card-body">
                  <div className="booking-detail">
                    <span className="detail-label">Room Type:</span>
                    <span className="detail-value">{booking.room_type}</span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Check-in:</span>
                    <span className="detail-value">{formatDate(booking.check_in_date)}</span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Check-out:</span>
                    <span className="detail-value">{formatDate(booking.check_out_date)}</span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Nights:</span>
                    <span className="detail-value">{booking.number_of_nights}</span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Rooms:</span>
                    <span className="detail-value">{booking.no_of_rooms}</span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Guests:</span>
                    <span className="detail-value">{booking.guest_count}</span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Booked on:</span>
                    <span className="detail-value">
                      {new Date(booking.booking_date).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="booking-detail total-cost">
                    <span className="detail-label">Total Cost:</span>
                    <span className="detail-value">₹{booking.cost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="booking-card-footer">
                  <button className="btn-view-hotel" onClick={() => navigate(`/hotels/${booking.hotel_id}`)}>
                    View Hotel
                  </button>

                  {booking.status === "FINISHED" &&
                    reviewExists(booking) && ( booking.reviewExists ? (
                      <button className="btn-hotel-review" onClick={() => handleViewHotelReviews(booking)}>
                        ⭐ Reviews
                      </button>
                    ) : (
                      <button className="btn-hotel-review" onClick={() => handleViewHotelReviews(booking)}>
                        ⭐ Create Review
                      </button>
                    ))}

                  {(booking.status === "CONFIRMED" || booking.status === "FINISHED") && (
                    <button
                      className="btn-download-receipt"
                      onClick={() => downloadReceipt(booking.booking_id)}
                      disabled={downloadingReceipt === booking.booking_id}
                    >
                      {downloadingReceipt === booking.booking_id ? (
                        <>
                          <span className="spinner-small"></span> Downloading...
                        </>
                      ) : (
                        <>📄 Print Receipt</>
                      )}
                    </button>
                  )}

                  {booking.status === "CONFIRMED" && isUpcomingBooking(booking.check_in_date) && (
                    <button
                      className="btn-cancel-booking"
                      onClick={() => handleCancelClick(booking)}
                      disabled={cancellingBooking === booking.booking_id}
                    >
                      {cancellingBooking === booking.booking_id ? (
                        <>
                          <span className="spinner-small"></span> Cancelling...
                        </>
                      ) : (
                        <>❌ Cancel Booking</>
                      )}
                    </button>
                  )}

                  {booking.status === "CANCELLED" && (
                    <>
                      <button className="btn-claim-refund" onClick={() => handleClaimRefundClick(booking)}>
                        💰 Claim Refund
                      </button>
                      <button className="btn-refund-status" onClick={() => handleViewRefundStatus(booking)}>
                        📊 View Refund Status
                      </button>
                    </>
                  )}

                  {booking.status === "PENDING" && (
                    <button
                      className="btn-complete-payment"
                      onClick={() => navigate(`/bookings/hotels/${booking.booking_id}/payment`)}
                    >
                      Complete Payment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Cancel Confirmation Modal */}
      {showCancelModal && bookingToCancel && (
        <div className="modal-overlay" onClick={handleCancelModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cancel Booking</h2>
              <button className="modal-close" onClick={handleCancelModalClose} disabled={cancellingBooking !== null}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to cancel this booking?</p>
              <div className="cancel-booking-details">
                <p>
                  <strong>Booking ID:</strong> #{bookingToCancel.booking_id}
                </p>
                <p>
                  <strong>Room Type:</strong> {bookingToCancel.room_type}
                </p>
                <p>
                  <strong>Check-in:</strong> {formatDate(bookingToCancel.check_in_date)}
                </p>
                <p>
                  <strong>Check-out:</strong> {formatDate(bookingToCancel.check_out_date)}
                </p>
                <p>
                  <strong>Total Cost:</strong> ₹{bookingToCancel.cost.toLocaleString()}
                </p>
              </div>
              <p className="cancel-warning">
                ⚠️ This action cannot be undone. Please review your booking details before proceeding.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal-cancel"
                onClick={handleCancelModalClose}
                disabled={cancellingBooking !== null}
              >
                Keep Booking
              </button>
              <button className="btn-modal-confirm" onClick={handleCancelConfirm} disabled={cancellingBooking !== null}>
                {cancellingBooking ? (
                  <>
                    <span className="spinner-small"></span> Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Booking"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Refund Request Modal */}
      {showRefundModal && bookingToRefund && (
        <div className="modal-overlay" onClick={handleRefundModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Refund</h2>
              <button className="modal-close" onClick={handleRefundModalClose} disabled={submittingRefund}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Please provide a reason for your refund request:</p>
              <div className="refund-booking-details">
                <p>
                  <strong>Booking ID:</strong> #{bookingToRefund.booking_id}
                </p>
                <p>
                  <strong>Room Type:</strong> {bookingToRefund.room_type}
                </p>
                <p>
                  <strong>Total Amount:</strong> ₹{bookingToRefund.cost.toLocaleString()}
                </p>
              </div>
              <div className="form-group">
                <label htmlFor="refundReason">Refund Reason *</label>
                <textarea
                  id="refundReason"
                  className="refund-textarea"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Please explain why you're requesting a refund..."
                  rows="5"
                  disabled={submittingRefund}
                  required
                />
              </div>
              <p className="refund-info">
                ℹ️ Your refund request will be reviewed by our team. You'll be notified once it's processed.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={handleRefundModalClose} disabled={submittingRefund}>
                Cancel
              </button>
              <button
                className="btn-modal-confirm"
                onClick={handleRefundSubmit}
                disabled={submittingRefund || !refundReason.trim()}
              >
                {submittingRefund ? (
                  <>
                    <span className="spinner-small"></span> Submitting...
                  </>
                ) : (
                  "Submit Refund Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Refund Status Modal */}
      {showRefundStatusModal && (
        <div className="modal-overlay" onClick={handleRefundStatusModalClose}>
          <div className="modal-content refund-status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Refund Status</h2>
              <button className="modal-close" onClick={handleRefundStatusModalClose}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {loadingRefundStatus ? (
                <div className="refund-loading">
                  <div className="spinner"></div>
                  <p>Loading refund status...</p>
                </div>
              ) : !refundStatus || refundStatus.length === 0 ? (
                // Show this if status is null or an empty array
                <div className="refund-error">
                  <div className="error-icon">ℹ️</div>
                  <p>No refund requests found for this booking.</p>
                </div>
              ) : (
                // Map over the refundStatus array
                <div className="refund-status-list">
                  {refundStatus.map((refund) => (
                    <div key={refund.refund_id} className="refund-status-content">
                      <div className="refund-status-header">
                        <h3>Refund Request #{refund.refund_id}</h3>
                        <span className={`refund-status-badge ${getRefundStatusClass(refund.refund_status)}`}>
                          {refund.refund_status || "PENDING"}
                        </span>
                      </div>

                      <div className="refund-details-grid">
                        <div className="refund-detail-item">
                          <span className="refund-label">Refund ID:</span>
                          <span className="refund-value">#{refund.refund_id}</span>
                        </div>

                        <div className="refund-detail-item">
                          <span className="refund-label">Payment ID:</span>
                          <span className="refund-value">#{refund.payment_id}</span>
                        </div>

                        <div className="refund-detail-item">
                          <span className="refund-label">Refund Amount:</span>
                          <span className="refund-value refund-amount">
                            ₹{refund.refund_amount?.toLocaleString() || "0"}
                          </span>
                        </div>

                        <div className="refund-detail-item">
                          <span className="refund-label">Request Date:</span>
                          <span className="refund-value">
                            {refund.refund_request_date
                              ? new Date(refund.refund_request_date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </span>
                        </div>

                        {refund.refund_processed_date && (
                          <div className="refund-detail-item">
                            <span className="refund-label">Processed Date:</span>
                            <span className="refund-value">
                              {new Date(refund.refund_processed_date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {refund.refund_reason && (
                        <div className="refund-reason-section">
                          <h4>Refund Reason:</h4>
                          <p>{refund.refund_reason}</p>
                        </div>
                      )}

                      {refund.admin_notes && (
                        <div className="admin-notes-section">
                          <h4>Admin Notes:</h4>
                          <p>{refund.admin_notes}</p>
                        </div>
                      )}

                      <div className="refund-status-info">
                        {refund.refund_status === "COMPLETED" && (
                          <p className="status-message completed-message">
                            ✅ Your refund has been completed. Reference Number: {refund.reference}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={handleRefundStatusModalClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Hotel Review Modal */}
      {showHotelReviewModal && selectedBookingForReview && (
        <div className="modal-overlay" onClick={handleCloseReviewModal}>
          <div className="modal-content hotel-review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Hotel Reviews - Booking #{selectedBookingForReview.booking_id}</h2>
              <button className="modal-close" onClick={handleCloseReviewModal} disabled={submittingReview}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {loadingHotelReviews ? (
                <div className="refund-loading">
                  <div className="spinner"></div>
                  <p>Loading reviews...</p>
                </div>
              ) : hotelReviews.length === 0 && !showCreateReviewForm ? (
                <div className="no-reviews-container">
                  <div className="no-reviews-icon">✨</div>
                  <p>No reviews yet for this hotel booking.</p>
                  <button className="btn-create-review" onClick={() => setShowCreateReviewForm(true)}>
                    + Create Review
                  </button>
                </div>
              ) : showCreateReviewForm ? (
                <div className="create-review-form-container">
                  <h3>Create Hotel Review</h3>
                  <div className="review-form-group">
                    <label>Overall Rating *</label>
                    <div className="star-rating-input">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className={`star-btn ${reviewFormData.overall_rating >= star ? "active" : ""}`}
                          onClick={() =>
                            setReviewFormData({
                              ...reviewFormData,
                              overall_rating: star,
                            })
                          }
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                    <p className="rating-value">{reviewFormData.overall_rating}.0 / 5.0</p>
                  </div>

                  <div className="review-form-group">
                    <label>Cleaniness Rating *</label>
                    <div className="star-rating-input">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className={`star-btn ${reviewFormData.cleanliness_rating >= star ? "active" : ""}`}
                          onClick={() =>
                            setReviewFormData({
                              ...reviewFormData,
                              cleanliness_rating: star,
                            })
                          }
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                    <p className="rating-value">{reviewFormData.cleanliness_rating}.0 / 5.0</p>
                  </div>

                  <div className="review-form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      className="review-input"
                      value={reviewFormData.review_title}
                      onChange={(e) =>
                        setReviewFormData({
                          ...reviewFormData,
                          review_title: e.target.value,
                        })
                      }
                      placeholder="Summarize your experience"
                      maxLength="100"
                      disabled={submittingReview}
                    />
                    <small className="char-count">{reviewFormData.review_title.length} / 100</small>
                  </div>

                  <div className="review-form-group">
                    <label>Review *</label>
                    <textarea
                      className="review-textarea"
                      value={reviewFormData.review_body}
                      onChange={(e) =>
                        setReviewFormData({
                          ...reviewFormData,
                          review_body: e.target.value,
                        })
                      }
                      placeholder="Share your detailed experience..."
                      maxLength="1000"
                      rows="5"
                      disabled={submittingReview}
                    />
                    <small className="char-count">{reviewFormData.review_body.length} / 1000</small>
                  </div>

                  <div className="review-form-group checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={reviewFormData.could_recommend}
                        onChange={(e) =>
                          setReviewFormData({
                            ...reviewFormData,
                            could_recommend: e.target.checked,
                          })
                        }
                        disabled={submittingReview}
                      />
                      I would recommend this hotel
                    </label>
                  </div>

                  <div className="form-actions">
                    <button
                      className="btn-cancel"
                      onClick={() => setShowCreateReviewForm(false)}
                      disabled={submittingReview}
                    >
                      Cancel
                    </button>
                    <button className="btn-submit-review" onClick={handleSubmitHotelReview} disabled={submittingReview}>
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="reviews-list">
                  {hotelReviews.map((review) => (
                    <div key={review.review_id || review.hotel_review_id} className="review-item">
                      <div className="review-header">
                        <div>
                          <p className="review-title">{review.review_title || review.title}</p>
                          <div className="review-rating">
                            {"⭐".repeat(Math.round(review.overall_rating))}
                            <span>{review.overall_rating} / 5.0</span>
                          </div>
                        </div>
                        <button
                          className="btn-delete-review"
                          onClick={() => handleDeleteHotelReview(review.hotel_review_id || review.review_id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>

                      <div className="review-fields-grid">
                        <div className="review-field">
                          <span className="review-field-label">Overall Rating</span>
                          <span className="review-field-value">{review.overall_rating} / 5.0</span>
                        </div>
                        <div className="review-field">
                          <span className="review-field-label">Cleanliness Rating</span>
                          <span className="review-field-value">{review.cleanliness_rating} / 5.0</span>
                        </div>
                      </div>

                      <p className="review-body">{review.review_body || review.body}</p>

                      <div className="review-footer">
                        <span className="review-date">
                          {new Date(review.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {review.could_recommend && <span className="recommend-badge">✓ Recommended</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={handleCloseReviewModal} disabled={submittingReview}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBookingsPage
