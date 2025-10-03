import React from "react";
import "../styles/Home.css";

const Home = () => {
  return (
    <div className="Home">
   
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Discover Your Next
              <span className="highlight"> Adventure</span>
            </h1>
            <p className="hero-subtitle">
              From exotic destinations to comfortable stays, we make your travel
              dreams come true with our comprehensive booking platform.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">
            <a href="/explore">
              Explore Packages
            </a>
          </button>
              <button className="btn-secondary">Plan Your Trip</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <img
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop"
                alt="Mountain Adventure"
              />
              <div className="card-content">
                <h4>Mountain Adventures</h4>
                <p>From $299</p>
              </div>
            </div>
            <div className="floating-card card-2">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop"
                alt="Beach Paradise"
              />
              <div className="card-content">
                <h4>Beach Paradise</h4>
                <p>From $199</p>
              </div>
            </div>
            <div className="floating-card card-3">
              <img
                src="https://images.unsplash.com/photo-1513326738677-b964603b136d?w=300&h=200&fit=crop"
                alt="City Tours"
              />
              <div className="card-content">
                <h4>City Exploration</h4>
                <p>From $149</p>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <h3>1000+</h3>
            <p>Happy Travelers</p>
          </div>
          <div className="stat-item">
            <h3>50+</h3>
            <p>Destinations</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Customer Support</p>
          </div>
          <div className="stat-item">
            <h3>95%</h3>
            <p>Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Our Platform?</h2>
            <p>
              Experience seamless travel planning with our comprehensive booking
              system
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3>Customer Management</h3>
              <p>
                Complete customer profiles with travel history, preferences, and
                emergency contacts for personalized service.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h3>Tour Packages</h3>
              <p>
                Discover amazing tour packages with detailed itineraries,
                multiple destinations, and comprehensive travel guides.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3>Easy Booking</h3>
              <p>
                Streamlined booking process with real-time availability checks,
                payment processing, and instant confirmation.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <h3>Expert Guides</h3>
              <p>
                Professional guides with years of experience and multiple
                languages to enhance your travel experience.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16,6 22,6 19,13 13,13"></polygon>
                </svg>
              </div>
              <h3>Trusted Vendors</h3>
              <p>
                Network of verified hotels, transport providers, and service
                vendors with ratings and quality assurance.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
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
              <h3>Secure Payments</h3>
              <p>
                Safe and secure payment processing with flexible cancellation
                policies and automated refund management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="destinations-section">
        <div className="container">
          <div className="section-header">
            <h2>Popular Destinations</h2>
            <p>
              Explore the world's most beautiful places with our curated travel
              packages
            </p>
          </div>
          <div className="destinations-grid">
            <div className="destination-card large">
              <img
                src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=400&fit=crop"
                alt="Paris"
              />
              <div className="destination-overlay">
                <h3>Paris, France</h3>
                <p>15 Packages Available</p>
                <button className="explore-btn">Explore</button>
              </div>
            </div>
            <div className="destination-card">
              <img
                src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=400&fit=crop"
                alt="Paris"
              />
              <div className="destination-overlay">
                <h3>Bali, Indonesia</h3>
                <p>12 Packages</p>
                <button className="explore-btn">Explore</button>
              </div>
            </div>
            <div className="destination-card">
              <img
                src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop"
                alt="Jaipur"
              />
              <div className="destination-overlay">
                <h3>Tokyo, Japan</h3>
                <p>8 Packages</p>
                <button className="explore-btn">Explore</button>
              </div>
            </div>
            <div className="destination-card">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop"
                alt="Iceland"
              />
              <div className="destination-overlay">
                <h3>Iceland</h3>
                <p>6 Packages</p>
                <button className="explore-btn">Explore</button>
              </div>
            </div>
            <div className="destination-card">
              <img
                src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300&h=300&fit=crop"
                alt="Dubai"
              />
              <div className="destination-overlay">
                <h3>Dubai, UAE</h3>
                <p>10 Packages</p>
                <button className="explore-btn">Explore</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Travelers Say</h2>
            <p>Real experiences from our happy customers</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>
                "Amazing experience! The booking process was seamless and our
                guide was incredibly knowledgeable. Will definitely book again!"
              </p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
                  alt="Sarah Johnson"
                />
                <div>
                  <h4>Sarah Johnson</h4>
                  <span>Adventure Enthusiast</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>
                "The customer service was exceptional. They helped us customize
                our package perfectly and handled all arrangements flawlessly."
              </p>
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
              <p>
                "Best travel platform I've used! Easy booking, great prices, and
                excellent support throughout our entire trip."
              </p>
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
            <h2>Ready to Start Your Journey?</h2>
            <p>
              Join thousands of satisfied travelers and discover your next
              adventure with us.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary">Book Now</button>
              <button className="btn-outline">Contact Us</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
