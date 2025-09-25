import React, { useState, useRef, useEffect } from "react";
import "../styles/Navbar.css";
import { useUser } from "../context/context.jsx";
import "../styles/Navbar.css";

const Navbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const accountRef = useRef(null);
  const { user, setUser, isAuthenticated, setIsAuthenticated } = useUser();
  const accessToken = localStorage.getItem("accessToken");

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("accessToken");
    // Clear user state
    setUser(null);
    // Close dropdown
    setDropdownOpen(false);
    setIsAuthenticated(false);
    // Optionally redirect to home page
    window.location.href = "/";
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isAuthenticated]);

  // Don't render dropdown while authentication state is loading
  if (isAuthenticated === null) {
    return (
      <nav className="navbar">
        <div className="navbar-title">
          <a href="/">TravelPro</a>
        </div>
        <div className="navbar-account">
          <div className="account-logo">
            <img
              className="profile-img"
              src="src\assets\user.png"
              alt="Profile"
            />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-title">
        <a href="/">TravelPro</a>
      </div>
      <div className="navbar-account" ref={accountRef}>
        <div className="account-logo" onClick={toggleDropdown}>
          <img
            className="profile-img"
            src="src\assets\user.png"
            alt="Profile"
          />
        </div>
        {isDropdownOpen && (
          <ul className="dropdown-menu">
            {accessToken ? (
              // Show authenticated user options
              <>
                <li>
                  <span className="user-greeting">
                    Hello, {user?.name || user?.email || "User"}!
                  </span>
                </li>
                <li>
                  <a href="/profile">Profile</a>
                </li>
                <li>
                  <a href="/dashboard">Dashboard</a>
                </li>
                <li>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              // Show login/signup options for unauthenticated users
              <>
                <li>
                  <a href="/login">Login</a>
                </li>
                <li>
                  <a href="/signup">Sign Up</a>
                </li>
              </>
            )}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
