import React, { useState } from "react";
import "../styles/Login.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // Here you would handle the login logic, e.g., an API call
    console.log("Attempting login with:", { email, password });
    alert(`Login attempt for ${email}`);
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
            <span>
              <a href="/signup">Sign Up</a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
