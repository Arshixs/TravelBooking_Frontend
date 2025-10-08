import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import "../styles/Hotels.css";
import axios from "../utils/axios";

const sampleHotels = [
  {
    hotel_id: 1,
    name: "Blue Horizon Inn",
    street: "221B Baker Street",
    city: "London",
    state: "England",
    pin: "NW1 6XE",
    rating: 4.2,
    total_rooms: 80,
    image: "https://images.unsplash.com/photo-1468276311594-df7cb65d8df6?w=600&h=400&fit=crop",
  },
  {
    hotel_id: 2,
    name: "Coastal Retreat",
    street: "18 Beach Ave",
    city: "Goa",
    state: "Goa",
    pin: "403001",
    rating: 3.9,
    total_rooms: 40,
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop",
  },
  {
    hotel_id: 3,
    name: "Sunrise Residency",
    street: "12 MG Road",
    city: "Bangalore",
    state: "Karnataka",
    pin: "560001",
    rating: 4.5,
    total_rooms: 55,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
  },
  {
    hotel_id: 4,
    name: "Highland View",
    street: "77 Valley Lane",
    city: "Manali",
    state: "Himachal Pradesh",
    pin: "175131",
    rating: 4.1,
    total_rooms: 36,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=400&fit=crop",
  },
  {
    hotel_id: 5,
    name: "City Central Suites",
    street: "44 Business Park",
    city: "Mumbai",
    state: "Maharashtra",
    pin: "400001",
    rating: 4.7,
    total_rooms: 120,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop",
  },
  {
    hotel_id: 6,
    name: "Palm Grove Resort",
    street: "9 Sunset Blvd",
    city: "Kochi",
    state: "Kerala",
    pin: "682001",
    rating: 4.0,
    total_rooms: 60,
    image: "https://images.unsplash.com/photo-1518684079-5b7b7f9269b1?w=600&h=400&fit=crop",
  },
]

const Hotels = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState("All");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("/hotels/", {
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`, // if required
          },
        });
        setHotels(response.data.data); // assuming API returns an array of hotels
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setError("Failed to load hotels.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

   const cities = useMemo(() => {
    const uniqueCities = [...new Set(hotels.map(h => h.city))].sort();
    // const uniqueCities = [];
    return ["All", ...uniqueCities];
  }, [hotels]);

  const filteredHotels = useMemo(() => {
    if (selectedCity === "All") return hotels;
    return hotels.filter((h) => h.city === selectedCity);
  }, [selectedCity, hotels]);

  const renderStars = (value) => {
    const full = Math.floor(value || 0);
    const empty = 5 - full;
    return (
      <span className="hotel-stars-inline" aria-label={`Rating ${value} out of 5`}>
        {"★".repeat(full)}
        {"☆".repeat(empty)}
        <span className="hotel-rating-badge">{(value || 0).toFixed(1)}</span>
      </span>
    );
  };

  return (
    <div className="hotels-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Find Your Perfect
              <span className="highlight"> Stay</span>
            </h1>
            <p className="hero-subtitle">
              Browse curated hotels across top cities. Compare ratings, rooms, and addresses — all in the same trusted
              TravelPro experience.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">Explore Hotels</button>
              <button className="btn-secondary">Book Your Hotel</button>
            </div>
          </div>

          {/* Floating image cards */}
          <div className="hero-image">
            <div className="floating-card card-1">
              <img
                src="https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=300&h=200&fit=crop"
                alt="Hotel Lobby"
              />
              <div className="card-content">
                <h4>Luxury Lobbies</h4>
                <p>Top Picks</p>
              </div>
            </div>
            <div className="floating-card card-2">
              <img
                src="https://images.unsplash.com/photo-1554995207-c18c203602cb?w=300&h=200&fit=crop"
                alt="Hotel Room"
              />
              <div className="card-content">
                <h4>Cozy Rooms</h4>
                <p>From $49</p>
              </div>
            </div>
            <div className="floating-card card-3">
              <img
                src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&h=200&fit=crop"
                alt="Rooftop Pool"
              />
              <div className="card-content">
                <h4>Rooftop Pools</h4>
                <p>Best Views</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero stats */}
        <div className="hero-stats">
          <div className="stat-item">
            <h3>500+</h3>
            <p>Partner Hotels</p>
          </div>
          <div className="stat-item">
            <h3>40+</h3>
            <p>Cities Covered</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Support</p>
          </div>
          <div className="stat-item">
            <h3>4.6</h3>
            <p>Avg. Rating</p>
          </div>
        </div>
      </section>

      <section className="destinations-section">
        <div className="container">
          <div className="section-header">
            <h2>Available Hotels</h2>
            <p>Explore top stays across popular cities with curated picks just for you</p>
          </div>

          <div className="city-filter-container">
            <label htmlFor="city-filter" className="filter-label">
              Filter by City:
            </label>
            <div className="city-filter-buttons">
              {cities.map((city) => (
                <button
                  key={city}
                  className={`filter-btn ${selectedCity === city ? "active" : ""}`}
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="hotels-list-vertical">
            {filteredHotels.map((hotel) => {
              const fullAddress = [hotel.street, hotel.city, hotel.state, hotel.pin].filter(Boolean).join(", ")
              return (
                <article key={hotel.hotel_id} className="hotel-card-detailed" role="article" aria-label={hotel.name}>
                  <div className="hotel-card-detailed-img">
                    <img src={hotel.image || "/placeholder.svg"} alt={`${hotel.name} exterior`} />
                  </div>
                  <div className="hotel-card-detailed-body">
                    <header className="hotel-card-detailed-header">
                      <h3>{hotel.name}</h3>
                      <div className="hotel-card-detailed-stars" aria-label={`Rating ${hotel.rating} out of 5`}>
                        {renderStars(hotel.rating)}
                      </div>
                    </header>
                    <p className="hotel-card-detailed-address">
                      <strong>Address:</strong> {fullAddress}
                    </p>
                    <div className="hotel-card-detailed-meta">
                      <span className="chip">Total Rooms: {hotel.total_rooms ?? "-"}</span>
                      <span className="chip">City: {hotel.city}</span>
                    </div>
                    <div className="hotel-card-detailed-actions">
                      <button
                        className="btn-primary-sm"
                        type="button"
                        onClick={() => navigate(`/hotels/${hotel.hotel_id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {filteredHotels.length === 0 && (
            <div className="no-results">
              <p>No hotels found in {selectedCity}. Try selecting a different city.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Travelers Say</h2>
            <p>Real experiences from our happy customers</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"Found an amazing boutique hotel at a great price. Booking was quick and easy!"</p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
                  alt="Sarah Johnson"
                />
                <div>
                  <h4>Sarah Johnson</h4>
                  <span>Frequent Traveler</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"Great selection across cities. The ratings and info helped us pick perfectly."</p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
                  alt="Michael Chen"
                />
                <div>
                  <h4>Michael Chen</h4>
                  <span>Business Traveler</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"Loved the interface and the deals. We'll book our next family trip here again."</p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
                  alt="Emily Rodriguez"
                />
                <div>
                  <h4>Emily Rodriguez</h4>
                  <span>Family Traveler</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Book Your Stay?</h2>
            <p>Compare hotels and lock in great rates with TravelPro.</p>
            <div className="cta-buttons">
              <button className="btn-primary">Book Now</button>
              <button className="btn-outline">Contact Us</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Hotels
