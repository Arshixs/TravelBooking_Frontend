import React, { useState, useEffect } from "react";
import "../styles/Signup.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios"; // Fixed typo

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhone: "",
  });
  const navigate = useNavigate();
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  useEffect(() => {
    if (formData.password || formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordMatch(null);
    }

    if (formData.password) {
      const isValid = validatePassword(formData.password);
      setPasswordValid(isValid);
      if (!isValid) {
        const requirements = [
          { met: formData.password.length >= 8, text: "At least 8 characters" },
          {
            met: /[A-Z]/.test(formData.password),
            text: "One uppercase letter",
          },
          {
            met: /[a-z]/.test(formData.password),
            text: "One lowercase letter",
          },
          { met: /[0-9]/.test(formData.password), text: "One number" },
          {
            met: /[@$!%*?&]/.test(formData.password),
            text: "One special character (@$!%*?&)",
          },
        ];

        setPasswordError(
          <ul style={{ listStyle: "none", padding: 0 }}>
            {requirements.map((req, index) => (
              <li key={index} style={{ color: req.met ? "green" : "red" }}>
                {req.met ? "✓" : "✗"} {req.text}
              </li>
            ))}
          </ul>
        );
      } else {
        setPasswordError("");
      }
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const response = await axios.post(
        "/auth/signup",
        JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          emergencyFirstName: formData.emergencyFirstName,
          emergencyLastName: formData.emergencyLastName,
          emergencyPhone: formData.emergencyPhone,
        })
      );
      if (response.status === 200) {
        alert("Account created successfully! Email verification sent.");
        navigate("/login");
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Something went wrong!");
    }
    console.log("New user data submitted:", formData);
  };

  return (
    <div className="signup-page-container">
      <div className="signup-form-wrapper">
        <form className="signup-form" onSubmit={handleSignup}>
          <h2>Create Your Account</h2>
          <p>Join us to start your next adventure.</p>

          <fieldset className="form-section">
            <legend>Personal Details</legend>
            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="firstName">First Name*</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="lastName">Last Name*</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="email">Email*</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="phone">Phone*</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="password">Password*</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{
                    borderColor: formData.password
                      ? passwordValid
                        ? "green"
                        : "red"
                      : "",
                  }}
                />
                {passwordError && (
                  <div
                    className="error-message"
                    style={{ color: "red", fontSize: "0.8rem" }}
                  >
                    {passwordError}
                  </div>
                )}
              </div>
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password*</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{
                    borderColor:
                      passwordMatch === null
                        ? ""
                        : passwordMatch
                        ? "green"
                        : "red",
                  }}
                />
              </div>
              <div className="input-group">
                <label htmlFor="dateOfBirth">Date of Birth*</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="gender">Gender*</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Emergency Contact (Optional)</legend>
            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="emergencyFirstName">First Name</label>
                <input
                  type="text"
                  id="emergencyFirstName"
                  name="emergencyFirstName"
                  value={formData.emergencyFirstName}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label htmlFor="emergencyLastName">Last Name</label>
                <input
                  type="text"
                  id="emergencyLastName"
                  name="emergencyLastName"
                  value={formData.emergencyLastName}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group full-width">
                <label htmlFor="emergencyPhone">Phone</label>
                <input
                  type="tel"
                  id="emergencyPhone"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </fieldset>

          <button type="submit" className="signup-btn">
            Create Account
          </button>

          <div className="form-footer">
            <span>Already have an account? </span>
            <Link to="/login">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;