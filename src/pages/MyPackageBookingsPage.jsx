import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useUser } from "../context/context";
import "../styles/MyPackageBookingsPage.css";

const MyPackageBookingsPage = () => {
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

  const getStatusClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "status-confirmed";
      case "FINISHED":
        return "status-finished";
      case "PENDING":
        return "status-pending";
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

  const handleViewDetails = (bookingId) =>{
    navigate(`/bookings/packages/${bookingId}/details`);
  }

  if (loading) {
    return (
      <div className="my-package-bookings-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your package bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-package-bookings-page">
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
        </div>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">📦</div>
            <h2>No package bookings found</h2>
            <p>You haven't booked any tour packages yet</p>
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
                    className="btn-view-package"
                    onClick={() => navigate(`/explore`)}
                  >
                    View Packages
                  </button>
                  <button
                    className="btn-view-package"
                    onClick={()=>handleViewDetails(booking.booking_id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPackageBookingsPage;
