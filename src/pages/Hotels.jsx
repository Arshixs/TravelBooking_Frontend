import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/context";
import toast from "react-hot-toast";
import "../styles/Home.css";
import "../styles/Hotels.css";
import axios from "../utils/axios";

const Hotels = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const [selectedCity, setSelectedCity] = useState("All");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("/hotels/", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log(response.data.data);
        setHotels(response.data.data);
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setError("Failed to load hotels.");
        //toast.error("Failed to load hotels");
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const cities = useMemo(() => {
    const uniqueCities = [...new Set(hotels.map((h) => h.city))].sort();
    return ["All", ...uniqueCities];
  }, [hotels]);

  const filteredHotels = useMemo(() => {
    if (selectedCity === "All") return hotels;
    return hotels.filter((h) => h.city === selectedCity);
  }, [selectedCity, hotels]);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      toast.error("Please enter a city name");
      return;
    }

    setIsSearching(true);
    setError(null);
    setSelectedCity("All"); // Reset filter when searching

    try {
      const response = await axios.get(`/hotels/${searchQuery.trim()}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.length > 0) {
        setHotels(response.data);
        // toast.success(
        //   `Found ${response.data.length} hotel(s) in ${searchQuery}`
        // );
      } else {
        setHotels([]);
        //toast.info(`No hotels found in ${searchQuery}`);
      }
    } catch (err) {
      console.error("Error searching hotels:", err);
      if (err.response?.status === 404) {
        setHotels([]);
        toast.info(`No hotels found in ${searchQuery}`);
      } else {
        setError("Failed to search hotels.");
        toast.error("Failed to search hotels");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchQuery("");
    setSelectedCity("All");
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/hotels/", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setHotels(response.data.data);
      //toast.success("Showing all hotels");
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setError("Failed to load hotels.");
      //toast.error("Failed to load hotels");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (hotelId) => {
    if (!isAuthenticated) {
      console.error("Please login to view hotel details");
      navigate("/login");
      return;
    }
    navigate(`/hotels/${hotelId}`);
  };

  const renderStars = (value) => {
    const full = Math.floor(value || 0);
    const empty = 5 - full;
    return (
      <span
        className="hotel-stars-large"
        aria-label={`Rating ${value} out of 5`}
      >
        {"★".repeat(full)}
        {"☆".repeat(empty)}
        <span className="hotel-rating-large">{(value || 0).toFixed(1)}</span>
      </span>
    );
  };

  return (
    <div className="hotels-page">
      <section className="hero-section hotels-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Discover Premium
              <span className="highlight"> Hotels</span>
            </h1>
            <p className="hero-subtitle">
              Explore handpicked accommodations with verified ratings, complete
              contact details, and transparent pricing. Your perfect stay is
              just a click away.
            </p>
            <div className="hero-features-list">
              <div className="hero-feature-item">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Verified Properties</span>
              </div>
              <div className="hero-feature-item">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                <span>Real Guest Ratings</span>
              </div>
              <div className="hero-feature-item">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>Direct Contact</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <h3>{hotels.length}+</h3>
            <p>Premium Hotels</p>
          </div>
          <div className="stat-item">
            <h3>{cities.length - 1}+</h3>
            <p>Cities</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Support</p>
          </div>
          <div className="stat-item">
            <h3>4.5</h3>
            <p>Avg. Rating</p>
          </div>
        </div>
      </section>

      <section className="destinations-section">
        <div className="container">
          <div className="section-header">
            <h2>Browse Our Hotels</h2>
            <p>
              Find the perfect accommodation with complete details and verified
              information
            </p>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <svg
                  className="search-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search hotels by city (e.g., Jaipur, Mumbai, Delhi...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="search-submit-btn"
                disabled={isSearching}
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </form>
          </div>

          {/* City Filter */}
          <div className="city-filter-container">
            <label htmlFor="city-filter" className="filter-label">
              Filter by City:
            </label>
            <div className="city-filter-buttons">
              {cities.map((city) => (
                <button
                  key={city}
                  className={`filter-btn ${
                    selectedCity === city ? "active" : ""
                  }`}
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="loading-state">
              <p>Loading hotels...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
            </div>
          )}

          <div className="hotels-modern-grid">
            {filteredHotels.map((hotel) => (
              <article
                key={hotel.hotel_id}
                className="hotel-modern-card"
                role="article"
                aria-label={hotel.name}
              >
                <div className="hotel-modern-card-header">
                  <div className="hotel-modern-card-image">
                    
                    <img
                      src={
                        hotel.image_url ||
                        "/placeholder.svg?height=200&width=350"
                      }
                      alt={`${hotel.name}`}
                    />
                    <div className="hotel-rating-overlay">
                      {renderStars(hotel.rating)}
                    </div>
                  </div>
                </div>

                <div className="hotel-modern-card-body">
                  <h3 className="hotel-modern-title">{hotel.name}</h3>

                  <div className="hotel-modern-info">
                    <div className="hotel-info-row">
                      <svg
                        className="hotel-info-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span className="hotel-info-text">
                        {[hotel.street, hotel.city, hotel.state, hotel.pin]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>

                    {hotel.primary_email && (
                      <div className="hotel-info-row">
                        <svg
                          className="hotel-info-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <span className="hotel-info-text">
                          {hotel.primary_email}
                        </span>
                      </div>
                    )}

                    {hotel.primary_phone && (
                      <div className="hotel-info-row">
                        <svg
                          className="hotel-info-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span className="hotel-info-text">
                          {hotel.primary_phone}
                        </span>
                      </div>
                    )}

                    <div className="hotel-info-row">
                      <svg
                        className="hotel-info-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      <span className="hotel-info-text">
                        {hotel.total_rooms} Rooms Available
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn-view-hotel"
                    type="button"
                    onClick={() => handleViewDetails(hotel.hotel_id)}
                  >
                    View Details
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredHotels.length === 0 && !loading && (
            <div className="no-results">
              <p>
                No hotels found{" "}
                {selectedCity !== "All" ? `in ${selectedCity}` : ""}.{" "}
                {searchQuery && "Try a different city or "} Try selecting a
                different filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Why Book With Us Section */}
      <section className="why-book-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Book With Us?</h2>
            <p>
              Experience hassle-free hotel booking with complete transparency
            </p>
          </div>
          <div className="why-book-grid">
            <div className="why-book-card">
              <div className="why-book-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <h3>Verified Ratings</h3>
              <p>
                All ratings are from real guests who have stayed at our partner
                hotels
              </p>
            </div>
            <div className="why-book-card">
              <div className="why-book-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 9V5a3 3 0 0 0-6 0v4"></path>
                  <rect x="2" y="9" width="20" height="12" rx="2" ry="2"></rect>
                </svg>
              </div>
              <h3>Secure Booking</h3>
              <p>
                Your personal information and payments are protected with
                industry-standard security
              </p>
            </div>
            <div className="why-book-card">
              <div className="why-book-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <h3>24/7 Support</h3>
              <p>
                Our customer support team is always available to help with your
                booking
              </p>
            </div>
            <div className="why-book-card">
              <div className="why-book-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h3>Best Price Guarantee</h3>
              <p>
                We ensure you get the best rates available for your chosen hotel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Book Your Perfect Stay?</h2>
            <p>
              Browse our collection of premium hotels and find your ideal
              accommodation today.
            </p>
            <div className="cta-buttons">
              <button
                className="btn-primary"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Browse Hotels
              </button>
              <button
                className="btn-outline"
                onClick={() => navigate("/contact")}
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hotels;
