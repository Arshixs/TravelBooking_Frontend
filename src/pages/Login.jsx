import React, { useState } from "react";
import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import Inputbox from "../components/inputBox";

const LoginPage = () => {
  // Use a single state object for the form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  // A single handler for all input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/auth/login",
        JSON.stringify(formData)
      );
      // Removed redundant nested if-statement here
      if (response.status === 200) {
        const { refreshToken, accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        alert("Login successful");
        navigate("/");
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Login failed!");
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-wrapper">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Welcome Back! 👋</h2>

          <Inputbox
            label="Email"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <Inputbox
            label="Password"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <button type="submit" className="login-btn">
            Sign In
          </button>

          <div className="form-footer">
            <span id="nowrap-text">Don't have an account? </span>
            <Link to="/signup">Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
