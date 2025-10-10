import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useUser } from "../context/context";
import "../styles/MyBookingsPage.css";

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("CONFIRMED");

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
          ? "/bookings/hotels/my"
          : `/bookings/hotels/my?status=${filter}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings(response.data.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "status-confirmed";
      case "PENDING":
        return "status-pending";
      case "CANCELLED":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="my-bookings-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
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
              filter === "PENDING" ? "filter-btn active" : "filter-btn"
            }
            onClick={() => setFilter("PENDING")}
          >
            Pending
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
            <div className="no-bookings-icon">📅</div>
            <h2>No bookings found</h2>
            <p>You haven't made any hotel bookings yet</p>
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
                  <span
                    className={`status-badge ${getStatusClass(booking.status)}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="booking-card-body">
                  <div className="booking-detail">
                    <span className="detail-label">Room Type:</span>
                    <span className="detail-value">{booking.room_type}</span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Check-in:</span>
                    <span className="detail-value">
                      {formatDate(booking.check_in_date)}
                    </span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Check-out:</span>
                    <span className="detail-value">
                      {formatDate(booking.check_out_date)}
                    </span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Nights:</span>
                    <span className="detail-value">
                      {booking.number_of_nights}
                    </span>
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
                    <span className="detail-value">
                      ₹{booking.cost.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="booking-card-footer">
                  <button
                    className="btn-view-hotel"
                    onClick={() => navigate(`/hotels/${booking.hotel_id}`)}
                  >
                    View Hotel
                  </button>
                  {booking.status === "PENDING" && (
                    <button
                      className="btn-complete-payment"
                      onClick={() =>
                        navigate(
                          `/bookings/hotels/${booking.booking_id}/payment`
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
    </div>
  );
};

export default MyBookingsPage;
