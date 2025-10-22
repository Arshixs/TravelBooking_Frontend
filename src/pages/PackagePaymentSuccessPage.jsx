import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import "../styles/PaymentResult.css";

const PackagePaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    confirmPayment();
  }, []);

  const confirmPayment = async () => {
    try {
      const sessionId = sessionStorage.getItem("package_session_id");
      const bookingId = sessionStorage.getItem("pendingPackageBookingId");
      const amount = sessionStorage.getItem("packageBookingAmount");

      if (!bookingId || !amount) {
        setError("Booking information not found");
        setProcessing(false);
        return;
      }

      const token = localStorage.getItem("accessToken");

      await axios.post(
        "/payments/packages/confirm",
        {
          package_booking_id: parseInt(bookingId),
          session_id: sessionId,
          amount: parseFloat(amount),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Clear session storage
      sessionStorage.removeItem("pendingPackageBookingId");
      sessionStorage.removeItem("packageBookingAmount");
      sessionStorage.removeItem("package_session_id");

      setProcessing(false);
    } catch (error) {
      console.error("Error confirming payment:", error);
      setError("Failed to confirm payment. Please contact support.");
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <div className="payment-result-page">
        <div className="result-container">
          <div className="spinner-large"></div>
          <h2>Processing your payment...</h2>
          <p>Please wait while we confirm your package booking</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-result-page">
        <div className="result-container error">
          <div className="result-icon error-icon">✗</div>
          <h1>Payment Error</h1>
          <p>{error}</p>
          <div className="result-actions">
            <button
              onClick={() => navigate("/explore")}
              className="btn-primary"
            >
              Browse Packages
            </button>
            <button
              onClick={() => navigate("/support/tickets")}
              className="btn-secondary"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page">
      <div className="result-container success">
        <div className="result-icon success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p>Your package booking has been confirmed</p>

        <div className="success-details">
          <div className="detail-item">
            <span className="icon">📧</span>
            <span>
              A confirmation email has been sent to your registered email
            </span>
          </div>
          <div className="detail-item">
            <span className="icon">📱</span>
            <span>You can view your booking details in My Bookings</span>
          </div>
          <div className="detail-item">
            <span className="icon">🗺️</span>
            <span>
              Guides, transport, and hotels have been assigned for your trip
            </span>
          </div>
        </div>

        <div className="result-actions">
          <button
            onClick={() => navigate("/bookings/packages/my")}
            className="btn-primary"
          >
            View My Package Bookings
          </button>
          <button
            onClick={() => navigate("/explore")}
            className="btn-secondary"
          >
            Browse More Packages
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackagePaymentSuccessPage;
