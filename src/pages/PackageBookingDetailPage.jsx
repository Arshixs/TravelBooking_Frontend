import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useUser } from "../context/context";
import "../styles/PackageBookingDetailPage.css";

const PackageBookingDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [expandedSections, setExpandedSections] = useState({
    travellers: true,
    itinerary: true,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchBookingDetails();
  }, [isAuthenticated, bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `/bookings/packages/${bookingId}/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBookingDetails(response.data.data);
    } catch (error) {
      console.error("Error fetching booking details:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "pkg-booking-status-confirmed";
      case "FINISHED":
        return "pkg-booking-status-finished";
      case "PENDING":
        return "pkg-booking-status-pending";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="pkg-booking-detail-wrapper">
        <div className="pkg-booking-loading-state">
          <div className="pkg-booking-spinner"></div>
          <p className="pkg-booking-loading-text">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="pkg-booking-detail-wrapper">
        <div className="pkg-booking-error-state">
          <h2 className="pkg-booking-error-title">Booking not found</h2>
          <button
            className="pkg-booking-back-button"
            onClick={() => navigate("/bookings/packages/my")}
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const { booking, package: pkg, travellers, itinerary } = bookingDetails;

  return (
    <div className="pkg-booking-detail-wrapper">
      <div className="pkg-booking-detail-container">
        {/* Breadcrumb Navigation */}
        <div className="pkg-booking-breadcrumb">
          <a
            href="/bookings/packages/my"
            className="pkg-booking-breadcrumb-link"
            onClick={(e) => {
              e.preventDefault();
              navigate("/bookings/packages/my");
            }}
          >
            My Bookings
          </a>
          <span className="pkg-booking-breadcrumb-separator">›</span>
          <span className="pkg-booking-breadcrumb-current">
            Booking #{booking.booking_id}
          </span>
        </div>

        {/* Hero Header Section */}
        <div className="pkg-booking-hero-header">
          <div className="pkg-booking-hero-content">
            <div className="pkg-booking-hero-left">
              <h1>{pkg.name}</h1>
              <div className="pkg-booking-hero-meta">
                <span className="pkg-booking-hero-meta-item">
                  🏷️ {pkg.tour_type}
                </span>
                <span className="pkg-booking-hero-meta-item">
                  📅 {pkg.duration_days} Days
                </span>
                <span className="pkg-booking-hero-meta-item">
                  👥 {booking.number_of_people} People
                </span>
              </div>
            </div>
            <div className="pkg-booking-hero-right">
              <span
                className={`pkg-booking-status-badge ${getStatusClass(
                  booking.status
                )}`}
              >
                {booking.status}
              </span>
              <div className="pkg-booking-total-cost-card">
                <span className="pkg-booking-cost-label">Total Cost</span>
                <span className="pkg-booking-cost-value">
                  ₹{booking.total_cost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="pkg-booking-info-grid">
          <div className="pkg-booking-info-card">
            <div className="pkg-booking-info-card-header">
              <span className="pkg-booking-info-card-icon">🎫</span>
              <h3 className="pkg-booking-info-card-title">Booking Details</h3>
            </div>
            <div className="pkg-booking-info-card-content">
              <div className="pkg-booking-info-row">
                <span className="pkg-booking-info-label">Booking ID:</span>
                <span className="pkg-booking-info-value">
                  #{booking.booking_id}
                </span>
              </div>
              <div className="pkg-booking-info-row">
                <span className="pkg-booking-info-label">Booked On:</span>
                <span className="pkg-booking-info-value">
                  {formatDate(booking.booking_date)}
                </span>
              </div>
            </div>
          </div>

          <div className="pkg-booking-info-card">
            <div className="pkg-booking-info-card-header">
              <span className="pkg-booking-info-card-icon">🗓️</span>
              <h3 className="pkg-booking-info-card-title">Tour Schedule</h3>
            </div>
            <div className="pkg-booking-info-card-content">
              <div className="pkg-booking-info-row">
                <span className="pkg-booking-info-label">Start Date:</span>
                <span className="pkg-booking-info-value">
                  {formatDate(booking.start_date)}
                </span>
              </div>
              <div className="pkg-booking-info-row">
                <span className="pkg-booking-info-label">Duration:</span>
                <span className="pkg-booking-info-value">
                  {pkg.duration_days} Days
                </span>
              </div>
            </div>
          </div>

          <div className="pkg-booking-info-card">
            <div className="pkg-booking-info-card-header">
              <span className="pkg-booking-info-card-icon">👥</span>
              <h3 className="pkg-booking-info-card-title">Group Size</h3>
            </div>
            <div className="pkg-booking-info-card-content">
              <div className="pkg-booking-info-row">
                <span className="pkg-booking-info-label">Travellers:</span>
                <span className="pkg-booking-info-value">
                  {booking.number_of_people} People
                </span>
              </div>
              <div className="pkg-booking-info-row">
                <span className="pkg-booking-info-label">Cost per person:</span>
                <span className="pkg-booking-info-value">
                  ₹
                  {Math.round(
                    booking.total_cost / booking.number_of_people
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Package Overview with Image */}
        {(pkg.image_url || pkg.itinerary_summary) && (
          <div className="pkg-booking-overview-section">
            {pkg.image_url && (
              <div className="pkg-booking-image-showcase">
                <img src={pkg.image_url} alt={pkg.name} />
              </div>
            )}
            {pkg.itinerary_summary && (
              <div className="pkg-booking-summary-card">
                <h3 className="pkg-booking-summary-title">
                  <span>📝</span> Tour Overview
                </h3>
                <p className="pkg-booking-summary-text">
                  {pkg.itinerary_summary}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Expandable Travellers Section */}
        {travellers && travellers.length > 0 && (
          <div className="pkg-booking-expandable-section">
            <div
              className="pkg-booking-section-header"
              onClick={() => toggleSection("travellers")}
            >
              <div className="pkg-booking-section-header-left">
                <span className="pkg-booking-section-icon">👥</span>
                <h2 className="pkg-booking-section-title">
                  Travellers
                  <span className="pkg-booking-section-count">
                    {travellers.length}
                  </span>
                </h2>
              </div>
              <span
                className={`pkg-booking-expand-icon ${
                  expandedSections.travellers ? "pkg-booking-expanded" : ""
                }`}
              >
                ▼
              </span>
            </div>
            <div
              className={`pkg-booking-section-content ${
                expandedSections.travellers ? "pkg-booking-expanded" : ""
              }`}
            >
              <div className="pkg-booking-travellers-grid">
                {travellers.map((traveller, idx) => (
                  <div key={idx} className="pkg-booking-traveller-card">
                    <div className="pkg-booking-traveller-avatar">
                      {traveller.first_name?.charAt(0)}
                      {traveller.last_name?.charAt(0)}
                    </div>
                    <div className="pkg-booking-traveller-details">
                      <h4>
                        {traveller.first_name} {traveller.last_name}
                      </h4>
                      <p>
                        <span>📧</span>
                        {traveller.email}
                      </p>
                      <p>
                        <span>📱</span>
                        {traveller.phone}
                      </p>
                      <div className="pkg-booking-id-proof-section">
                        🆔 {traveller.id_proof_type}:{" "}
                        {traveller.id_proof_number}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Expandable Itinerary Section */}
        <div className="pkg-booking-expandable-section">
          <div
            className="pkg-booking-section-header"
            onClick={() => toggleSection("itinerary")}
          >
            <div className="pkg-booking-section-header-left">
              <span className="pkg-booking-section-icon">🗓️</span>
              <h2 className="pkg-booking-section-title">
                Day-wise Itinerary
                <span className="pkg-booking-section-count">
                  {itinerary.length} Days
                </span>
              </h2>
            </div>
            <span
              className={`pkg-booking-expand-icon ${
                expandedSections.itinerary ? "pkg-booking-expanded" : ""
              }`}
            >
              ▼
            </span>
          </div>
          <div
            className={`pkg-booking-section-content ${
              expandedSections.itinerary ? "pkg-booking-expanded" : ""
            }`}
          >
            {/* Day Tabs */}
            <div className="pkg-booking-day-tabs-wrapper">
              <div className="pkg-booking-day-tabs-scroll">
                {itinerary.map((day) => (
                  <button
                    key={day.day_number}
                    className={`pkg-booking-day-tab ${
                      activeDay === day.day_number
                        ? "pkg-booking-day-active"
                        : ""
                    }`}
                    onClick={() => setActiveDay(day.day_number)}
                  >
                    Day {day.day_number}
                  </button>
                ))}
              </div>
            </div>

            {/* Day Content */}
            {itinerary
              .filter((day) => day.day_number === activeDay)
              .map((day) => (
                <div key={day.day_number} className="pkg-booking-day-content">
                  <h3 className="pkg-booking-day-title">
                    <span>📅</span>
                    Day {day.day_number}
                  </h3>

                  {/* Hotels */}
                  {day.hotels && day.hotels.length > 0 && (
                    <div className="pkg-booking-hotels-container">
                      <h4 className="pkg-booking-hotels-title">
                        <span>🏨</span>
                        Accommodation
                      </h4>
                      {day.hotels.map((hotel, idx) => (
                        <div key={idx} className="pkg-booking-hotel-card">
                          <div className="pkg-booking-hotel-header">
                            <div className="pkg-booking-hotel-info">
                              <h5>{hotel.name}</h5>
                              <p className="pkg-booking-hotel-address">
                                <span>📍</span>
                                {hotel.address}
                              </p>
                            </div>
                            {hotel.rating && (
                              <div className="pkg-booking-hotel-rating">
                                ⭐ {hotel.rating}
                              </div>
                            )}
                          </div>
                          <div className="pkg-booking-hotel-details-grid">
                            <div className="pkg-booking-hotel-detail-item">
                              <span className="pkg-booking-hotel-detail-label">
                                Check-in:
                              </span>
                              <span className="pkg-booking-hotel-detail-value">
                                {formatDate(hotel.check_in)}
                              </span>
                            </div>
                            <div className="pkg-booking-hotel-detail-item">
                              <span className="pkg-booking-hotel-detail-label">
                                Check-out:
                              </span>
                              <span className="pkg-booking-hotel-detail-value">
                                {formatDate(hotel.check_out)}
                              </span>
                            </div>
                            <div className="pkg-booking-hotel-detail-item">
                              <span className="pkg-booking-hotel-detail-label">
                                Rooms:
                              </span>
                              <span className="pkg-booking-hotel-detail-value">
                                {hotel.rooms} x {hotel.room_type}
                              </span>
                            </div>
                            <div className="pkg-booking-hotel-detail-item">
                              <span className="pkg-booking-hotel-detail-label">
                                Contact:
                              </span>
                              <span className="pkg-booking-hotel-detail-value">
                                📞 {hotel.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Activities */}
                  <div className="pkg-booking-activities-container">
                    <h4 className="pkg-booking-activities-title">
                      <span>🎯</span>
                      Activities & Schedule
                    </h4>
                    {day.activities.map((activity, idx) => (
                      <div key={idx} className="pkg-booking-activity-card">
                        <div className="pkg-booking-activity-timeline">
                          <div className="pkg-booking-timeline-dot"></div>
                          <div className="pkg-booking-timeline-time">
                            {formatTime(activity.start_time)}
                          </div>
                        </div>

                        <div className="pkg-booking-activity-content">
                          <div className="pkg-booking-activity-header">
                            <h5 className="pkg-booking-activity-title">
                              {activity.title}
                            </h5>
                            <span className="pkg-booking-duration-badge">
                              ⏱️ {activity.duration} mins
                            </span>
                          </div>

                          <p className="pkg-booking-activity-description">
                            {activity.description}
                          </p>

                          <div className="pkg-booking-activity-location">
                            <span>📍</span>
                            {activity.location.street}, {activity.location.city}
                            , {activity.location.state}
                          </div>

                          {/* Guide Info */}
                          {activity.guide && (
                            <div className="pkg-booking-service-card">
                              <div className="pkg-booking-service-header">
                                <span className="pkg-booking-service-icon">
                                  👨‍🏫
                                </span>
                                <h6 className="pkg-booking-service-title">
                                  Your Guide
                                </h6>
                              </div>
                              <div className="pkg-booking-service-details">
                                <p>
                                  <strong>{activity.guide.name}</strong>
                                </p>
                                <p>
                                  <span>📧</span>
                                  {activity.guide.email}
                                </p>
                                <p>
                                  <span>📱</span>
                                  {activity.guide.phone}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Transport Info */}
                          {activity.transports &&
                            activity.transports.length > 0 && (
                              <div>
                                {activity.transports.map((transport, tIdx) => (
                                  <div
                                    key={tIdx}
                                    className="pkg-booking-service-card"
                                  >
                                    <div className="pkg-booking-service-header">
                                      <span className="pkg-booking-service-icon">
                                        🚗
                                      </span>
                                      <h6 className="pkg-booking-service-title">
                                        Transport {tIdx + 1}
                                      </h6>
                                    </div>
                                    <div className="pkg-booking-service-details">
                                      <p>
                                        <strong>{transport.driver_name}</strong>
                                      </p>
                                      <p>
                                        <span>🚙</span>
                                        {transport.vehicle} - {transport.reg_no}
                                      </p>
                                      <p>
                                        <span>📱</span>
                                        {transport.phone}
                                      </p>
                                      <div className="pkg-booking-transport-route">
                                        <div className="pkg-booking-route-point">
                                          <span className="pkg-booking-route-label">
                                            Pickup:
                                          </span>
                                          <span className="pkg-booking-route-location">
                                            {transport.pickup.street},{" "}
                                            {transport.pickup.city}
                                          </span>
                                        </div>
                                        <div className="pkg-booking-route-arrow">
                                          →
                                        </div>
                                        <div className="pkg-booking-route-point">
                                          <span className="pkg-booking-route-label">
                                            Drop:
                                          </span>
                                          <span className="pkg-booking-route-location">
                                            {transport.drop.street},{" "}
                                            {transport.drop.city}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageBookingDetailPage;
