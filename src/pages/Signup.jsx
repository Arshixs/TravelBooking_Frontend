import React, { useState, useEffect } from "react";
import "../styles/Signup.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import Inputbox from "../components/inputBox";
import toast from "react-hot-toast";

const Signup = () => {
  const [activeTab, setActiveTab] = useState("CUSTOMER");
  const [formData, setFormData] = useState({
    // User data
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
    // Vendor data
    vendorName: "",
    serviceType: "",
    contactPersonFirstName: "",
    contactPersonLastName: "",
    vendorEmail: "",
    vendorPhone: "",
    streetName: "",
    city: "",
    state: "",
    pin: "",
    accountNo: "",
    ifscCode: "",
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
      const isValid = true;

      // const isValid = validatePassword(formData.password);
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
          <ul style={{ listStyle: "none", padding: 0, marginTop: "5px" }}>
            {requirements.map((req, index) => (
              <li
                key={index}
                style={{ color: req.met ? "green" : "red", fontSize: "0.8rem" }}
              >
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
    console.log(formData);
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const endpoint = "auth/signup";

      const data =
        activeTab === "CUSTOMER"
          ? {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
              dateOfBirth: formData.dateOfBirth,
              gender: formData.gender,
              userType: activeTab,
              emergencyContactFirstName: formData.emergencyFirstName,
              emergencyContactLastName: formData.emergencyLastName,
              emergencyContactNo: formData.emergencyPhone,
            }
          : {
              email: formData.vendorEmail,
              phone: formData.vendorPhone,
              password: formData.password,
              userType: activeTab,
              vendorName: formData.vendorName,
              serviceType: formData.serviceType.toUpperCase(),
              contactPersonFirstName: formData.contactPersonFirstName,
              contactPersonLastName: formData.contactPersonLastName,
              street_name: formData.streetName,
              city: formData.city,
              state: formData.state,
              pin: formData.pin,
              amt_due: "0", // You might want to set this as a default
              account_no: formData.accountNo,
              ifsc_code: formData.ifscCode,
            };

      const response = await axios.post(endpoint, JSON.stringify(data));
      console.log(response);
      if (response.status === 200) {
        // alert("Account created successfully!.");
        // alert("Account created successfully!.");
        toast.success("Blog post created successfully!");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong!");
      //   alert(error?.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="signup-page-container">
      <div className="signup-form-wrapper">
        <div className="tab-container">
          <button
            className={`tab-button ${activeTab === "CUSTOMER" ? "active" : ""}`}
            onClick={() => setActiveTab("CUSTOMER")}
          >
            User
          </button>
          <button
            className={`tab-button ${activeTab === "vendor" ? "active" : ""}`}
            onClick={() => setActiveTab("vendor")}
          >
            Vendor
          </button>
        </div>

        <form className="signup-form" onSubmit={handleSignup}>
          <h2>Create Your Account</h2>
          <p>
            Join us to{" "}
            {activeTab === "CUSTOMER"
              ? "start your next adventure"
              : "become a service provider"}
            .
          </p>

          {activeTab === "CUSTOMER" ? (
            <>
              <fieldset className="form-section">
                <legend>Personal Details</legend>
                <div className="form-grid">
                  <Inputbox
                    label="First Name*"
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  <Inputbox
                    label="Last Name*"
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  <Inputbox
                    label="Email*"
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <Inputbox
                    label="Phone*"
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <Inputbox
                    label="Date of Birth*"
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
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
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>
                </div>
              </fieldset>

              <fieldset className="form-section">
                <legend>Emergency Contact (Optional)</legend>
                <div className="form-grid">
                  <Inputbox
                    label="First Name"
                    type="text"
                    id="emergencyFirstName"
                    name="emergencyFirstName"
                    value={formData.emergencyFirstName}
                    onChange={handleChange}
                    required={false}
                  />
                  <Inputbox
                    label="Last Name"
                    type="text"
                    id="emergencyLastName"
                    name="emergencyLastName"
                    value={formData.emergencyLastName}
                    onChange={handleChange}
                    required={false}
                  />
                  <div className="full-width">
                    <Inputbox
                      label="Phone"
                      type="tel"
                      id="emergencyPhone"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      required={false}
                    />
                  </div>
                </div>
              </fieldset>
            </>
          ) : (
            <>
              <fieldset className="form-section">
                <legend>Vendor Details</legend>
                <div className="form-grid">
                  <Inputbox
                    label="Firm Name*"
                    type="text"
                    id="vendorName"
                    name="vendorName"
                    value={formData.vendorName}
                    onChange={handleChange}
                  />
                  <div className="input-group">
                    <label htmlFor="serviceType">Service Type*</label>
                    <select
                      id="serviceType"
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Guide">Guide</option>
                      <option value="Transport">Transport</option>
                      <option value="Hotel">Hotel</option>
                    </select>
                  </div>
                  <Inputbox
                    label="Email*"
                    type="email"
                    id="vendorEmail"
                    name="vendorEmail"
                    value={formData.vendorEmail}
                    onChange={handleChange}
                  />
                  <Inputbox
                    label="Phone*"
                    type="tel"
                    id="vendorPhone"
                    name="vendorPhone"
                    value={formData.vendorPhone}
                    onChange={handleChange}
                  />
                  <Inputbox
                    label="Street Name*"
                    type="text"
                    id="streetName"
                    name="streetName"
                    value={formData.streetName}
                    onChange={handleChange}
                  />
                  <Inputbox
                    label="City*"
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <Inputbox
                    label="State*"
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                  <Inputbox
                    label="PIN Code*"
                    type="text"
                    id="pin"
                    name="pin"
                    value={formData.pin}
                    onChange={handleChange}
                  />
                </div>
              </fieldset>

              <fieldset className="form-section">
                <legend>Contact Person Details</legend>
                <div className="form-grid">
                  <Inputbox
                    label="First Name*"
                    type="text"
                    id="contactPersonFirstName"
                    name="contactPersonFirstName"
                    value={formData.contactPersonFirstName}
                    onChange={handleChange}
                  />
                  <Inputbox
                    label="Last Name*"
                    type="text"
                    id="contactPersonLastName"
                    name="contactPersonLastName"
                    value={formData.contactPersonLastName}
                    onChange={handleChange}
                  />
                </div>
              </fieldset>

              <fieldset className="form-section">
                <legend>Bank Details</legend>
                <div className="form-grid">
                  <Inputbox
                    label="Account Number*"
                    type="text"
                    id="accountNo"
                    name="accountNo"
                    value={formData.accountNo}
                    onChange={handleChange}
                  />
                  <Inputbox
                    label="IFSC Code*"
                    type="text"
                    id="ifscCode"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                  />
                </div>
              </fieldset>
            </>
          )}

          {/* SHARED SECURITY SECTION - NO LONGER DUPLICATED! */}
          <fieldset className="form-section">
            <legend>Security</legend>
            <div className="form-grid">
              <Inputbox
                label="Password*"
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  borderColor: formData.password
                    ? passwordValid
                      ? "green"
                      : "red"
                    : "",
                }}
              >
                {formData.password && passwordError && (
                  <div className="error-message">{passwordError}</div>
                )}
              </Inputbox>
              <Inputbox
                label="Confirm Password*"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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
