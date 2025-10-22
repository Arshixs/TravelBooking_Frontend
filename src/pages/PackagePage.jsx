import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";
import "../styles/PackagePage.css";

import { useNavigate } from "react-router-dom";
// --- SVG Icons for details ---
const CalendarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="#ED3F27"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
const UsersIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="#ED3F27"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
const TagIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="#ED3F27"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
);

const MapPinIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const BedIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 4v16"></path>
    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
    <path d="M2 17h20"></path>
    <path d="M6 8V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"></path>
  </svg>
);

const PackagePage = () => {
  const { slug } = useParams();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackage = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/packages/${slug}`);
        if (response.data.success) {
          setPackageData(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch package:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [slug]);

  // Group hotel rooms by hotel
  const groupHotelsByHotel = (hotelRooms) => {
    const grouped = {};
    hotelRooms.forEach((item) => {
      if (!grouped[item.hotel_id]) {
        grouped[item.hotel_id] = {
          hotel_id: item.hotel_id,
          hotel_name: item.hotel_name,
          hotel_street: item.hotel_street,
          hotel_city: item.hotel_city,
          hotel_state: item.hotel_state,
          hotel_pin: item.hotel_pin,
          hotel_rating: item.hotel_rating,
          hotel_image_url: item.hotel_image_url || "https://placehold.co/600x400/134686/FFFFFF?text=Hotel",
          rooms: [],
        };
      }
      grouped[item.hotel_id].rooms.push({
        room_id: item.room_id,
        room_type: item.room_type,
        room_bed_type: item.room_bed_type,
        room_max_capacity: item.room_max_capacity,
        room_cost_per_night: item.room_cost_per_night,
        room_balcony_available: item.room_balcony_available,
      });
    });
    return Object.values(grouped);
  };

  if (loading) {
    return <div className="loading-state">Loading Package...</div>;
  }

  if (!packageData) {
    return <div className="error-state">Package not found.</div>;
  }

  const hotels = groupHotelsByHotel(packageData.hotel_rooms || []);

  const handleBook = (packageId)=>{
    navigate(`/packages/${packageId}/book`);
    //console.log("Booking room:", room)
    //alert(`Booking ${room.type} room (${room.room_id})`)

    // Navigate to booking page or call booking API
    console.log("Booking package:", packageId);
    alert(`Booking package:-> ${packageId}`);
    
  }

  return (
    <div className="package-page">
      {/* --- Header Section --- */}
      <section
        className="package-hero"
        style={{ backgroundImage: `url(${packageData.image_url})` }}
      >
        <div className="hero-overlay">
          <div className="container">
            <span className="hero-tour-type">{packageData.tour_type}</span>
            <h1 className="hero-title">{packageData.name}</h1>
            <div className="hero-rating">
              <span>★★★★★</span> {packageData.avg_rating} / 5
            </div>
          </div>
        </div>
      </section>

      {/* --- Main Content --- */}
      <main className="container package-main">
        <div className="package-layout">
          {/* --- Left Column: Itinerary & Hotels --- */}
          <div className="package-itinerary">
            {/* Daily Itinerary */}
            <h2 className="section-title">Daily Itinerary</h2>
            <div className="timeline">
              {packageData.itinerary.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>
                      Day {item.day_number}: {item.title}
                    </h4>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Hotels Section */}
            {hotels.length > 0 && (
              <div className="hotels-section">
                <h2 className="section-title">Accommodation</h2>
                <div className="hotels-grid">
                  {hotels.map((hotel) => (
                    <div key={hotel.hotel_id} className="hotel-card">
                      <div className="hotel-image">
                        <img src={hotel.hotel_image_url} alt={hotel.hotel_name} />
                        <div className="hotel-rating-badge">
                          ★ {hotel.hotel_rating}
                        </div>
                      </div>
                      <div className="hotel-details">
                        <h3 className="hotel-name">{hotel.hotel_name}</h3>
                        <div className="hotel-location">
                          <MapPinIcon />
                          <span>
                            {hotel.hotel_city}, {hotel.hotel_state}
                          </span>
                        </div>
                        <div className="hotel-rooms">
                          {hotel.rooms.map((room) => (
                            <div key={room.room_id} className="room-info">
                              <div className="room-header">
                                <BedIcon />
                                <span className="room-type">{room.room_type}</span>
                              </div>
                              <div className="room-details-grid">
                                <span>{room.room_bed_type} Bed</span>
                                <span>Up to {room.room_max_capacity} guests</span>
                                {room.room_balcony_available && (
                                  <span className="balcony-tag">Balcony</span>
                                )}
                              </div>
                              <div className="room-price">
                                ₹{room.room_cost_per_night.toLocaleString("en-IN")} / night
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* --- Right Column: Booking Card --- */}
          <aside className="package-sidebar">
            <div className="booking-card">
              <div className="price-section">
                <span className="price-label">Starting from</span>
                <span className="price-value">
                  ₹{packageData.price.toLocaleString("en-IN")}
                </span>
                <span className="price-per-person">/ per person</span>
              </div>

              <div className="details-section">
                <div className="detail-item">
                  <CalendarIcon />
                  <div>
                    <strong>Duration</strong>
                    <span>{packageData.duration_days} Days</span>
                  </div>
                </div>
                <div className="detail-item">
                  <UsersIcon />
                  <div>
                    <strong>Group Size</strong>
                    <span>Up to {packageData.max_capacity} people</span>
                  </div>
                </div>
                <div className="detail-item">
                  <TagIcon />
                  <div>
                    <strong>Tour Type</strong>
                    <span>{packageData.tour_type}</span>
                  </div>
                </div>
              </div>

              <p className="summary-text">{packageData.itinerary_summary}</p>

              <button className="btn-book-now" onClick={()=> handleBook(packageData.packageId)}>Book This Tour</button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PackagePage;