import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useUser } from "../context/context";
import "../styles/PackageBookingPage.css";

const PackageBookingPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    start_date: "",
    number_of_people: 1,
  });

  const [travellers, setTravellers] = useState([
    {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      emergency_contact_first_name: "",
      emergency_contact_last_name: "",
      emergency_contact_no: "",
      id_proof_type: "PASSPORT",
      id_proof_number: "",
    },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchPackage();
  }, [packageId, isAuthenticated]);

  useEffect(() => {
    // Update travellers array when number of people changes
    const newCount = formData.number_of_people;
    if (newCount > travellers.length) {
      const newTravellers = [...travellers];
      for (let i = travellers.length; i < newCount; i++) {
        newTravellers.push({
          first_name: "",
          last_name: "",
          phone: "",
          email: "",
          emergency_contact_first_name: "",
          emergency_contact_last_name: "",
          emergency_contact_no: "",
          id_proof_type: "PASSPORT",
          id_proof_number: "",
        });
      }
      setTravellers(newTravellers);
    } else if (newCount < travellers.length) {
      setTravellers(travellers.slice(0, newCount));
    }
  }, [formData.number_of_people]);

  const fetchPackage = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/packages/id/${packageId}`);
      setPackageData(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching package:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "number_of_people" ? parseInt(value) : value,
    }));
  };

  const handleTravellerChange = (index, field, value) => {
    const updatedTravellers = [...travellers];
    updatedTravellers[index][field] = value;
    setTravellers(updatedTravellers);
  };

  const validateForm = () => {
    if (!formData.start_date) {
      alert("Please select a start date");
      return false;
    }

    for (let i = 0; i < travellers.length; i++) {
      const t = travellers[i];
      if (
        !t.first_name ||
        !t.last_name ||
        !t.phone ||
        !t.email ||
        !t.emergency_contact_first_name ||
        !t.emergency_contact_last_name ||
        !t.emergency_contact_no ||
        !t.id_proof_number
      ) {
        alert(`Please fill all details for Traveller ${i + 1}`);
        return false;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(t.email)) {
        alert(`Invalid email for Traveller ${i + 1}`);
        return false;
      }

      // Validate phone numbers (10 digits)
      const phoneRegex = /^\d{10}$/;
      if (
        !phoneRegex.test(t.phone) ||
        !phoneRegex.test(t.emergency_contact_no)
      ) {
        alert(
          `Invalid phone number for Traveller ${i + 1}. Must be 10 digits.`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");

      const requestData = {
        packageBooking: {
          package_id: parseInt(packageId),
          start_date: formData.start_date,
          number_of_people: formData.number_of_people,
        },
        travellers: travellers,
      };

      const response = await axios.post("/bookings/packages/", requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { packageBookingId, totalCost, sessionId, sessionUrl } =
        response.data.data;

      // Store for payment confirmation
      sessionStorage.setItem("pendingPackageBookingId", packageBookingId);
      sessionStorage.setItem("packageBookingAmount", totalCost);
      sessionStorage.setItem("package_session_id", sessionId);

      // Redirect to Stripe
      window.location.href = sessionUrl;
    } catch (error) {
      console.error("Error creating booking:", error);
      alert(error.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="package-booking-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading package details...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="package-booking-page">
        <div className="error-message">
          <h2>Package not found</h2>
          <button onClick={() => navigate("/explore")}>Back to Packages</button>
        </div>
      </div>
    );
  }

  const totalCost = packageData.price * formData.number_of_people;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="package-booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1>Book Your Package</h1>
          <button
            className="back-btn"
            onClick={() => navigate(`/package/${packageData.slug}`)}
          >
            ← Back to Package
          </button>
        </div>

        <div className="booking-content">
          <div className="booking-details-section">
            <div className="package-summary">
              <h2>{packageData.name}</h2>
              <p className="package-description">{packageData.description}</p>
              <div className="package-info">
                <span>📅 {packageData.duration_days} days</span>
                <span>💰 ₹{packageData.price} per person</span>
                <span>📍 {packageData.tour_type}</span>
                <span>🧑‍🦱 Max {packageData.max_capacity-1} travelers allowed</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
              <h3>Booking Details</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_date">Start Date *</label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    min={today}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="number_of_people">Number of People *</label>
                  <input
                    type="number"
                    id="number_of_people"
                    name="number_of_people"
                    value={formData.number_of_people}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    required
                  />
                </div>
              </div>

              <div className="travellers-section">
                <h3>Traveller Details</h3>
                {travellers.map((traveller, index) => (
                  <div key={index} className="traveller-card">
                    <h4>Traveller {index + 1}</h4>

                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input
                          type="text"
                          value={traveller.first_name}
                          onChange={(e) =>
                            handleTravellerChange(
                              index,
                              "first_name",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input
                          type="text"
                          value={traveller.last_name}
                          onChange={(e) =>
                            handleTravellerChange(
                              index,
                              "last_name",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Phone *</label>
                        <input
                          type="tel"
                          value={traveller.phone}
                          onChange={(e) =>
                            handleTravellerChange(
                              index,
                              "phone",
                              e.target.value
                            )
                          }
                          placeholder="10 digits"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={traveller.email}
                          onChange={(e) =>
                            handleTravellerChange(
                              index,
                              "email",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>ID Proof Type *</label>
                        <select
                          value={traveller.id_proof_type}
                          onChange={(e) =>
                            handleTravellerChange(
                              index,
                              "id_proof_type",
                              e.target.value
                            )
                          }
                          required
                        >
                          <option value="PASSPORT">Passport</option>
                          <option value="AADHAR">Aadhar Card</option>
                          <option value="DRIVING_LICENSE">
                            Driving License
                          </option>
                          <option value="VOTER_ID">Voter ID</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>ID Proof Number *</label>
                        <input
                          type="text"
                          value={traveller.id_proof_number}
                          onChange={(e) =>
                            handleTravellerChange(
                              index,
                              "id_proof_number",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                    </div>

                    <h5>Emergency Contact</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input
                          type="text"
                          value={traveller.emergency_contact_first_name}
                          onChange={(e) =>
                            handleTravellerChange(
                              index,
                              "emergency_contact_first_name",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input
                          type="text"
                          value={traveller.emergency_contact_last_name}
                          onChange={(e) =>
                            handleTravellerChange(
                              index,
                              "emergency_contact_last_name",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Emergency Contact Phone *</label>
                      <input
                        type="tel"
                        value={traveller.emergency_contact_no}
                        onChange={(e) =>
                          handleTravellerChange(
                            index,
                            "emergency_contact_no",
                            e.target.value
                          )
                        }
                        placeholder="10 digits"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </div>

          <div className="booking-summary">
            <h3>Booking Summary</h3>

            <div className="summary-item">
              <span>Package:</span>
              <strong>{packageData.name}</strong>
            </div>

            <div className="summary-item">
              <span>Duration:</span>
              <strong>{packageData.duration} days</strong>
            </div>

            <div className="summary-item">
              <span>Start Date:</span>
              <strong>{formData.start_date || "Not selected"}</strong>
            </div>

            <div className="summary-item">
              <span>Number of People:</span>
              <strong>{formData.number_of_people}</strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-item">
              <span>Price per Person:</span>
              <strong>₹{packageData.price}</strong>
            </div>

            <div className="summary-item">
              <span>Number of People:</span>
              <strong>× {formData.number_of_people}</strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-item total">
              <span>Total Amount:</span>
              <strong>₹{totalCost.toLocaleString()}</strong>
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              className="proceed-payment-btn"
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Proceed to Payment"}
            </button>

            <p className="payment-note">
              You will be redirected to a secure payment page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageBookingPage;
