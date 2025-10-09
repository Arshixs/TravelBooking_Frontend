import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PackageCard from "../components/PackageCard";
import "../styles/ExplorePackages.css";

const ExplorePackages = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filterType, setFilterType] = useState("All");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("none");

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/api/packages/", {
          headers: {
            Authorization: "YOUR_AUTH_TOKEN_HERE",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch packages");
        }

        const result = await response.json();

        if (result.success) {
          setPackages(result.data);
          setFilteredPackages(result.data);
        } else {
          throw new Error(result.message || "Failed to load packages");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching packages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...packages];

    // Filter by type
    if (filterType !== "All") {
      filtered = filtered.filter((pkg) => pkg.tour_type === filterType);
    }

    // Filter by status
    if (filterStatus !== "All") {
      filtered = filtered.filter((pkg) => pkg.status === filterStatus);
    }

    // Filter by price
    filtered = filtered.filter((pkg) => pkg.price <= maxPrice);

    // Sort
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.avg_rating - a.avg_rating);
    } else if (sortBy === "duration") {
      filtered.sort((a, b) => a.duration_days - b.duration_days);
    }

    setFilteredPackages(filtered);
  }, [filterType, maxPrice, filterStatus, sortBy, packages]);

  const handleCardClick = (slug) => {
    navigate(`/package/${slug}`);
  };

  const resetFilters = () => {
    setFilterType("All");
    setMaxPrice(100000);
    setFilterStatus("All");
    setSortBy("none");
  };

  if (loading) {
    return (
      <div className="explore-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading amazing packages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="explore-page">
        <div className="error-container">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="explore-page">
      <header className="explore-header">
        <h1>
          Discover Your Next <span className="header-highlight">Adventure</span>
        </h1>
        <p>Curated travel packages to make your dreams come true</p>
      </header>

      <main className="content-area container">
        {/* Filter Section */}
        <aside className="filter-section">
          <div className="filter-header">
            <h2 className="filter-title">Filter Your Trip</h2>
            <button className="btn-reset" onClick={resetFilters}>
              Reset
            </button>
          </div>

          <div className="filter-group">
            <label htmlFor="type-filter">Package Type</label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Adventure">Adventure</option>
              <option value="Cultural">Cultural</option>
              <option value="Relaxation">Relaxation</option>
              <option value="Historical">Historical</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="FINISHED">Finished</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="price-filter">
              Max Price: ₹{maxPrice.toLocaleString("en-IN")}
            </label>
            <input
              id="price-filter"
              type="range"
              min="10000"
              max="100000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <div className="price-range">
              <span>₹10k</span>
              <span>₹100k</span>
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-filter">Sort By</label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="none">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="duration">Duration</option>
            </select>
          </div>

          <div className="filter-stats">
            <p>
              {filteredPackages.length} package
              {filteredPackages.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </aside>

        {/* Package Cards Container */}
        <section className="packages-grid">
          {filteredPackages.length > 0 ? (
            filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.packageId}
                packageData={{
                  id: pkg.packageId,
                  name: pkg.name,
                  type: pkg.tour_type,
                  duration: pkg.duration_days,
                  capacity: pkg.max_capacity,
                  rating: pkg.avg_rating,
                  price: pkg.price,
                  description: pkg.itinerary_summary,
                  link: `/package/${pkg.slug}`,
                  image: pkg.image_url,
                  status: pkg.status,
                }}
                onClick={() => handleCardClick(pkg.slug)}
              />
            ))
          ) : (
            <div className="no-packages">
              <h3>No packages found</h3>
              <p>Try adjusting your filters to see more options</p>
              <button onClick={resetFilters}>Clear Filters</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ExplorePackages;
