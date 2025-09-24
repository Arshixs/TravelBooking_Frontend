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
    userType: "CUSTOMER",
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
      const response = await axios.post("auth/login", JSON.stringify(formData));

      // Check for the success flag from your backend's response structure
      if (response.data.success && response.status === 200) {
        // FIX 1: Access the nested 'data' object
        const responseData = response.data.data;
        console.log(responseData);
        const { accessToken, refreshToken, userType, userId, email } =
          responseData;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // FIX 2: Use JSON.stringify() to store the user object
        localStorage.setItem(
          "user",
          JSON.stringify({ userType, userId, email })
        );

        alert("Login successful");
        navigate("/profile");
      } else {
        // Handle cases where the API call was successful but login failed (e.g., wrong password)
        alert(response.data.message || "Login failed!");
      }
    } catch (error) {
      alert(
        error?.response?.data?.message || "An error occurred during login!"
      );
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
