import React, { useState, useRef, useEffect } from "react";
import "../styles/Navbar.css";

const Navbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const accountRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
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
  }, [isDropdownOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-title">
        <a href="/">TravelPro</a>
      </div>
      <div className="navbar-account" ref={accountRef}>
        <div className="account-logo" onClick={toggleDropdown}>
          {/* You can place an icon or image here */}
          <img className="profile-img" src="src\assets\user.png" />
        </div>
        {isDropdownOpen && (
          <ul className="dropdown-menu">
            <li>
              <a href="/login">Login</a>
            </li>
            <li>
              <a href="/signup">Sign In</a>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
