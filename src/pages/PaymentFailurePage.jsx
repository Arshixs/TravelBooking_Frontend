import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PaymentResult.css";

const PaymentFailurePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear pending booking data
    sessionStorage.removeItem("sessionId");
    sessionStorage.removeItem("pendingBookingId");
    sessionStorage.removeItem("bookingAmount");
  }, []);

  return (
    <div className="payment-result-page">
      <div className="result-container failure">
        <div className="result-icon failure-icon">✗</div>
        <h1>Payment Failed</h1>
        <p>Your payment could not be processed</p>

        <div className="failure-reasons">
          <h3>This could be due to:</h3>
          <ul>
            <li>Insufficient funds in your account</li>
            <li>Card declined by your bank</li>
            <li>Network connectivity issues</li>
            <li>Payment cancelled by user</li>
          </ul>
        </div>

        <div className="failure-note">
          <p>Don't worry! No amount has been deducted from your account.</p>
          <p>Your booking has not been confirmed.</p>
        </div>

        <div className="result-actions">

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
};

export default PaymentFailurePage;
