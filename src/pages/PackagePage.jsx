import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";
import "../styles/PackagePage.css";

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

const PackagePage = () => {
  const { slug } = useParams();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);


  // --- REAL API CALL ---
  // Uncomment this and remove the mock data above to use a live endpoint
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

  if (loading) {
    return <div className="loading-state">Loading Package...</div>;
  }

  if (!packageData) {
    return <div className="error-state">Package not found.</div>;
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
          {/* --- Left Column: Itinerary --- */}
          <div className="package-itinerary">
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

              <button className="btn-book-now">Book This Tour</button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PackagePage;
