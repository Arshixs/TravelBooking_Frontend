import React, { useState } from "react";
import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/auth/login",
        JSON.stringify({ email, password })
      );
      if (response.status === 200) {
        if (response.status === 200) {
          const { refreshToken, accessToken } = response.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          alert("Login successful");
          navigate("/");
        }
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Login failed!");
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-wrapper">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Welcome Back!</h2>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

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
