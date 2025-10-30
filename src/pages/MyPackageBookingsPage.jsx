import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useUser } from "../context/context";
import "../styles/MyBookingsPage.css";

const MyPackageBookingsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("CONFIRMED");
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // Refund states
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showRefundStatusModal, setShowRefundStatusModal] = useState(false);
  const [bookingToRefund, setBookingToRefund] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [loadingRefundStatus, setLoadingRefundStatus] = useState(false);
  const [refundStatus, setRefundStatus] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchBookings();
  }, [isAuthenticated, filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const url =
        filter === "all"
          ? "/bookings/packages/my"
          : `/bookings/packages/my?status=${filter}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      response.data.data.sort((a, b) => {
        const dateA = new Date(a.booking_date);
        const dateB = new Date(b.booking_date);
        return dateB.getTime() - dateA.getTime();
      });
      setBookings(response.data.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const isUpcomingBooking = (startDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    return start >= today;
  };

  const handleCancelClick = (booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return;

    try {
      setCancellingBooking(bookingToCancel.booking_id);
      const token = localStorage.getItem("accessToken");

      const response = await axios.post(
        `/bookings/packages/${bookingToCancel.booking_id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Package booking cancelled successfully!");
        setShowCancelModal(false);
        setBookingToCancel(null);
        fetchBookings();
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to cancel booking. Please try again.";
      alert(errorMessage);
    } finally {
      setCancellingBooking(null);
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setBookingToCancel(null);
  };

  // Refund functions
  const handleClaimRefundClick = (booking) => {
    console.log(booking);
    setBookingToRefund(booking);
    setRefundReason("");
    setShowRefundModal(true);
  };

  const handleRefundSubmit = async () => {
    if (!bookingToRefund || !refundReason.trim()) {
      alert("Please provide a reason for the refund request.");
      return;
    }

    try {
      setSubmittingRefund(true);
      const token = localStorage.getItem("accessToken");

      // Get payment ID from booking
      const paymentId = bookingToRefund.parent_booking.payment_id;

      if (!paymentId) {
        alert("Payment information not found for this booking.");
        return;
      }

      const response = await axios.post(
        `/payments/${paymentId}/refund`,
        { refund_reason: refundReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Refund request submitted successfully!");
        setShowRefundModal(false);
        setBookingToRefund(null);
        setRefundReason("");
        fetchBookings();
      }
    } catch (error) {
      console.error("Error submitting refund request:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit refund request. Please try again.";
      alert(errorMessage);
    } finally {
      setSubmittingRefund(false);
    }
  };

  const handleRefundModalClose = () => {
    if (!submittingRefund) {
      setShowRefundModal(false);
      setBookingToRefund(null);
      setRefundReason("");
    }
  };

  const handleViewRefundStatus = async (booking) => {
    try {
      console.log("My name is ARsh");
      //   console.log(response.data.data);
      setLoadingRefundStatus(true);
      setShowRefundStatusModal(true);
      const token = localStorage.getItem("accessToken");

      const paymentId = booking.parent_booking.payment_id;

      if (!paymentId) {
        setRefundStatus({ error: "Payment information not found." });
        return;
      }

      const response = await axios.get(`payments/refund/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("My name is ARsh");
      console.log(response.data.data);

      if (response.data.success) {
        setRefundStatus(response.data.data);
      } else {
        setRefundStatus({ error: "No refund found for this booking." });
      }
    } catch (error) {
      console.error("Error fetching refund status:", error);
      setRefundStatus({
        error:
          error.response?.data?.message || "Failed to fetch refund status.",
      });
    } finally {
      setLoadingRefundStatus(false);
    }
  };

  const handleRefundStatusModalClose = () => {
    setShowRefundStatusModal(false);
    setRefundStatus(null);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "status-confirmed";
      case "FINISHED":
        return "status-finished";
      case "CANCELLED":
        return "status-cancelled";
      case "PENDING":
        return "status-pending";
      default:
        return "";
    }
  };

  const getRefundStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
      case "COMPLETED":
        return "refund-status-approved";
      case "PENDING":
        return "refund-status-pending";
      case "REJECTED":
        return "refund-status-rejected";
      default:
        return "refund-status-pending";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewDetails = (bookingId) =>{
    navigate(`/bookings/packages/${bookingId}/details`);
  }

  if (loading) {
    return (
      <div className="my-bookings-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your package bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <h1>My Package Bookings</h1>
          <button
            className="btn-secondary"
            onClick={() => navigate("/explore")}
          >
            Book Another Package
          </button>
        </div>

        <div className="bookings-filters">
          <button
            className={filter === "all" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("all")}
          >
            All Bookings
          </button>
          <button
            className={
              filter === "CONFIRMED" ? "filter-btn active" : "filter-btn"
            }
            onClick={() => setFilter("CONFIRMED")}
          >
            Confirmed
          </button>
          <button
            className={
              filter === "CANCELLED" ? "filter-btn active" : "filter-btn"
            }
            onClick={() => setFilter("CANCELLED")}
          >
            Cancelled
          </button>
          <button
            className={
              filter === "FINISHED" ? "filter-btn active" : "filter-btn"
            }
            onClick={() => setFilter("FINISHED")}
          >
            Finished
          </button>
          <button
            className={
              filter === "CANCELLED" ? "filter-btn active" : "filter-btn"
            }
            onClick={() => setFilter("CANCELLED")}
          >
            Cancelled
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">📦</div>
            <h2>No package bookings found</h2>
            <p>
              {filter === "all"
                ? "You haven't booked any tour packages yet"
                : `You don't have any ${filter.toLowerCase()} package bookings`}
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate("/explore")}
            >
              Browse Packages
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking.booking_id} className="booking-card">
                <div className="booking-card-header">
                  <h3>Booking #{booking.booking_id}</h3>
                  <span
                    className={`status-badge ${getStatusClass(booking.status)}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="booking-card-body">
                  <div className="booking-detail">
                    <span className="detail-label">Package ID:</span>
                    <span className="detail-value">{booking.package_id}</span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Start Date:</span>
                    <span className="detail-value">
                      {formatDate(booking.start_date)}
                    </span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Number of People:</span>
                    <span className="detail-value">
                      {booking.number_of_people}
                    </span>
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
                    <span className="detail-value">
                      ₹{booking.total_cost.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="booking-card-footer">
                  <button
                    className="btn-view-hotel"
                    onClick={() => navigate(`/explore`)}
                  >
                    View Packages
                  </button>

                  {booking.status === "CONFIRMED" &&
                    isUpcomingBooking(booking.start_date) && (
                      <button
                        className="btn-cancel-booking"
                        onClick={() => handleCancelClick(booking)}
                        disabled={cancellingBooking === booking.booking_id}
                      >
                        {cancellingBooking === booking.booking_id ? (
                          <>
                            <span className="spinner-small"></span>{" "}
                            Cancelling...
                          </>
                        ) : (
                          <>❌ Cancel Booking</>
                        )}
                      </button>
                    )}

                  {booking.status === "CANCELLED" && (
                    <>
                      <button
                        className="btn-claim-refund"
                        onClick={() => handleClaimRefundClick(booking)}
                      >
                        💰 Claim Refund
                      </button>
                      <button
                        className="btn-refund-status"
                        onClick={() => handleViewRefundStatus(booking)}
                      >
                        📊 View Refund Status
                      </button>
                    </>
                  )}

                  {booking.status === "PENDING" && (
                    <button
                      className="btn-complete-payment"
                      onClick={() =>
                        navigate(
                          `/bookings/packages/${booking.booking_id}/payment`
                        )
                      }
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
              <h2>Cancel Package Booking</h2>
              <button
                className="modal-close"
                onClick={handleCancelModalClose}
                disabled={cancellingBooking !== null}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to cancel this package booking?</p>
              <div className="cancel-booking-details">
                <p>
                  <strong>Booking ID:</strong> #{bookingToCancel.booking_id}
                </p>
                <p>
                  <strong>Package ID:</strong> {bookingToCancel.package_id}
                </p>
                <p>
                  <strong>Start Date:</strong>{" "}
                  {formatDate(bookingToCancel.start_date)}
                </p>
                <p>
                  <strong>Number of People:</strong>{" "}
                  {bookingToCancel.number_of_people}
                </p>
                <p>
                  <strong>Total Cost:</strong> ₹
                  {bookingToCancel.total_cost.toLocaleString()}
                </p>
              </div>
              <p className="cancel-warning">
                ⚠️ This action cannot be undone. Please review your booking
                details before proceeding.
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
              <button
                className="btn-modal-confirm"
                onClick={handleCancelConfirm}
                disabled={cancellingBooking !== null}
              >
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
              <button
                className="modal-close"
                onClick={handleRefundModalClose}
                disabled={submittingRefund}
              >
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
                  <strong>Package ID:</strong> {bookingToRefund.package_id}
                </p>
                <p>
                  <strong>Total Amount:</strong> ₹
                  {bookingToRefund.total_cost.toLocaleString()}
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
                ℹ️ Your refund request will be reviewed by our team. You'll be
                notified once it's processed.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal-cancel"
                onClick={handleRefundModalClose}
                disabled={submittingRefund}
              >
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
          <div
            className="modal-content refund-status-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Refund Status</h2>
              <button
                className="modal-close"
                onClick={handleRefundStatusModalClose}
              >
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
                <div className="refund-error">
                  <div className="error-icon">ℹ️</div>
                  <p>No refund requests found for this booking.</p>
                </div>
              ) : (
                <div className="refund-status-list">
                  {refundStatus?.map((refund) => (
                    <div
                      key={refund.refund_id}
                      className="refund-status-content"
                    >
                      <div className="refund-status-header">
                        <h3>Refund Request #{refund.refund_id}</h3>
                        <span
                          className={`refund-status-badge ${getRefundStatusClass(
                            refund.refund_status
                          )}`}
                        >
                          {refund.refund_status || "PENDING"}
                        </span>
                      </div>

                      <div className="refund-details-grid">
                        <div className="refund-detail-item">
                          <span className="refund-label">Refund ID:</span>
                          <span className="refund-value">
                            #{refund.refund_id}
                          </span>
                        </div>

                        <div className="refund-detail-item">
                          <span className="refund-label">Payment ID:</span>
                          <span className="refund-value">
                            #{refund.payment_id}
                          </span>
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
                              ? new Date(
                                  refund.refund_request_date
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </span>
                        </div>

                        {refund.refund_processed_date && (
                          <div className="refund-detail-item">
                            <span className="refund-label">
                              Processed Date:
                            </span>
                            <span className="refund-value">
                              {new Date(
                                refund.refund_processed_date
                              ).toLocaleDateString("en-US", {
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
                            ✅ Your refund has been completed. Reference Number:{" "}
                            {refund.reference}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal-cancel"
                onClick={handleRefundStatusModalClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPackageBookingsPage;
