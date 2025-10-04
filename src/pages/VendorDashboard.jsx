import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/context";
import axios from "../utils/axios";
import "../styles/VendorDashboard.css";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalGuides: 0,
    totalTransports: 0,
    availableGuides: 0,
    availableTransports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [guidesRes, transportsRes] = await Promise.all([
        axios.get("/guides/"),
        axios.get("/transports/"),
      ]);

      const guides = guidesRes.data.data || [];
      const transports = transportsRes.data.data || [];

      setStats({
        totalGuides: guides.length,
        totalTransports: transports.length,
        availableGuides: guides.filter((g) => g.availability).length,
        availableTransports: transports.filter((t) => t.availability).length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Guide Management",
      description:
        "Manage your tour guides, their information, and availability",
      icon: (
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
      ),
      stats: {
        total: stats.totalGuides,
        available: stats.availableGuides,
      },
      path: "/vendor/guides",
      color: "#134686",
    },
    {
      title: "Transport Management",
      description: "Manage your drivers, vehicles, and transportation services",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16,6 22,6 19,13 13,13"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      ),
      stats: {
        total: stats.totalTransports,
        available: stats.availableTransports,
      },
      path: "/vendor/transports",
      color: "#1a5ba8",
    },
  ];

  return (
    <div className="vendor-dashboard-page">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Vendor Dashboard</h1>
          <p>Welcome back, {user?.data?.vendor_name || "Vendor"}</p>
        </div>
      </div>

      <div className="dashboard-cards-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <div className="cards-grid">
            {cards.map((card, index) => (
              <div
                key={index}
                className="dashboard-card"
                onClick={() => navigate(card.path)}
                style={{ borderTopColor: card.color }}
              >
                <div className="card-icon" style={{ color: card.color }}>
                  {card.icon}
                </div>
                <div className="card-content">
                  <h2>{card.title}</h2>
                  <p>{card.description}</p>
                  <div className="card-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total:</span>
                      <span className="stat-value">{card.stats.total}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Available:</span>
                      <span className="stat-value stat-available">
                        {card.stats.available}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-arrow" style={{ color: card.color }}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button
            className="action-btn"
            onClick={() => navigate("/vendor/guides")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Guide
          </button>
          <button
            className="action-btn"
            onClick={() => navigate("/vendor/transports")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Transport
          </button>
          <button className="action-btn" onClick={() => navigate("/profile")}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
