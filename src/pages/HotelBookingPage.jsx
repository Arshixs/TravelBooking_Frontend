import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useUser } from "../context/context";
import "../styles/HotelBookingPage.css";

const HotelBookingPage = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const [formData, setFormData] = useState({
    check_in_date: "",
    check_out_date: "",
    no_of_rooms: 1,
    guest_count: 1,
  });

  const [calculatedCost, setCalculatedCost] = useState(0);
  const [numberOfNights, setNumberOfNights] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchHotelAndRoom();
  }, [hotelId, roomId, isAuthenticated]);

  useEffect(() => {
    if (formData.check_in_date && formData.check_out_date) {
      calculateCost();
    }
  }, [
    formData.check_in_date,
    formData.check_out_date,
    formData.no_of_rooms,
    room,
  ]);

  const fetchHotelAndRoom = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/hotels/${hotelId}/`);
      setHotel(response.data.hotel);
      const roomData = response.data.rooms.find(
        (r) => r.room_id === parseInt(roomId)
      );
      setRoom(roomData);
    } catch (error) {
      console.error("Error fetching hotel data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCost = () => {
    if (!room || !formData.check_in_date || !formData.check_out_date) return;

    const checkIn = new Date(formData.check_in_date);
    const checkOut = new Date(formData.check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights > 0) {
      setNumberOfNights(nights);
      setCalculatedCost(room.cost_per_night * nights * formData.no_of_rooms);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "no_of_rooms" || name === "guest_count"
          ? parseInt(value)
          : value,
    }));
    setAvailabilityChecked(false);
  };

  const checkAvailability = async () => {
    if (!formData.check_in_date || !formData.check_out_date) {
      alert("Please select both check-in and check-out dates");
      return;
    }
    
    if (formData.guest_count > room.max_capacity * formData.no_of_rooms) {
      alert("Guest count is too much!");
      return;
    }

    setCheckingAvailability(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "/bookings/hotels/check-availability",
        {
          check_in_date: formData.check_in_date,
          check_out_date: formData.check_out_date,
          required_rooms: formData.no_of_rooms,
          hotel_id: parseInt(hotelId),
          room_id: parseInt(roomId),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsAvailable(response.data.data.available);
      setAvailabilityChecked(true);
    } catch (error) {
      console.error("Error checking availability:", error);
      alert("Failed to check availability");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!availabilityChecked) {
      alert("Please check availability first");
      return;
    }

    if (!isAvailable) {
      alert("Rooms are not available for selected dates");
      return;
    }

    if(formData.guest_count>room.max_capacity * formData.no_of_rooms){
      alert("Guest count is too much!");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      // Create booking
      const bookingResponse = await axios.post(
        "/bookings/hotels",
        {
          check_in_date: formData.check_in_date,
          check_out_date: formData.check_out_date,
          no_of_rooms: formData.no_of_rooms,
          guest_count: formData.guest_count,
          hotel_id: parseInt(hotelId),
          room_id: parseInt(roomId),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const booking = bookingResponse.data.data;

      // Initiate Stripe checkout
      const checkoutResponse = await axios.post("/bookings/checkout", {
        amount: booking.cost * 100, // Stripe expects amount in smallest currency unit
        quantity: 1,
        name: `${hotel.name} - ${room.type} Room`,
        currency: "inr",
      });

      // Store booking ID for payment confirmation
      sessionStorage.setItem("pendingBookingId", booking.booking_id);
      sessionStorage.setItem("bookingAmount", booking.cost);
      sessionStorage.setItem("session_id",checkoutResponse.data.sessionId);

      // Redirect to Stripe
      window.location.href = checkoutResponse.data.sessionUrl;
    } catch (error) {
      console.error("Error creating booking:", error);
      alert(error.response?.data?.message || "Failed to create booking");
    }
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!hotel || !room) {
    return (
      <div className="booking-page">
        <div className="error-message">
          <h2>Hotel or Room not found</h2>
          <button onClick={() => navigate("/hotels")}>Back to Hotels</button>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1>Complete Your Booking</h1>
          <button
            className="back-btn"
            onClick={() => navigate(`/hotels/${hotelId}`)}
          >
            ← Back to Hotel
          </button>
        </div>

        <div className="booking-content">
          <div className="booking-details-section">
            <div className="hotel-summary">
              <h2>{hotel.name}</h2>
              <p className="hotel-location">
                {hotel.street}, {hotel.city}, {hotel.state} - {hotel.pin}
              </p>
              <div className="room-info">
                <h3>{room.type} Room</h3>
                <div className="room-features">
                  <span>🛏️ {room.bed_type}</span>
                  <span>👥 Max {room.max_capacity} guests in one room</span>
                  {room.balcony_available && <span>🌅 Balcony</span>}
                </div>
                <p className="room-price">Room Price: ₹{room.cost_per_night} per night</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
              <h3>Booking Details</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="check_in_date">Check-in Date *</label>
                  <input
                    type="date"
                    id="check_in_date"
                    name="check_in_date"
                    value={formData.check_in_date}
                    onChange={handleInputChange}
                    min={today}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="check_out_date">Check-out Date *</label>
                  <input
                    type="date"
                    id="check_out_date"
                    name="check_out_date"
                    value={formData.check_out_date}
                    onChange={handleInputChange}
                    min={formData.check_in_date || tomorrow}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="no_of_rooms">Number of Rooms *</label>
                  <input
                    type="number"
                    id="no_of_rooms"
                    name="no_of_rooms"
                    value={formData.no_of_rooms}
                    onChange={handleInputChange}
                    min="1"
                    // max={room.total_rooms}
                    required
                  />
                  {/* <small>Available: {room.total_rooms} rooms</small> */}
                </div>

                <div className="form-group">
                  <label htmlFor="guest_count">Number of Guests *</label>
                  <input
                    type="number"
                    id="guest_count"
                    name="guest_count"
                    value={formData.guest_count}
                    onChange={handleInputChange}
                    min="1"
                    //max={room.max_capacity * formData.no_of_rooms}
                    required
                  />
                  <small>
                    Max: {room.max_capacity * formData.no_of_rooms} guests allowed
                  </small>
                </div>
              </div>

              <button
                type="button"
                onClick={checkAvailability}
                className="check-availability-btn"
                disabled={
                  checkingAvailability ||
                  !formData.check_in_date ||
                  !formData.check_out_date
                }
              >
                {checkingAvailability ? "Checking..." : "Check Availability"}
              </button>

              {availabilityChecked && (
                <div
                  className={`availability-result ${
                    isAvailable ? "available" : "unavailable"
                  }`}
                >
                  {isAvailable ? (
                    <>
                      <span className="icon">✓</span>
                      <span>Rooms available for selected dates!</span>
                    </>
                  ) : (
                    <>
                      <span className="icon">✗</span>
                      <span>
                        Not enough rooms available. Please try different dates.
                      </span>
                    </>
                  )}
                </div>
              )}
            </form>
          </div>

          <div className="booking-summary">
            <h3>Booking Summary</h3>

            <div className="summary-item">
              <span>Check-in:</span>
              <strong>{formData.check_in_date || "Not selected"}</strong>
            </div>

            <div className="summary-item">
              <span>Check-out:</span>
              <strong>{formData.check_out_date || "Not selected"}</strong>
            </div>

            <div className="summary-item">
              <span>Number of Nights:</span>
              <strong>{numberOfNights || 0}</strong>
            </div>

            <div className="summary-item">
              <span>Rooms:</span>
              <strong>{formData.no_of_rooms}</strong>
            </div>

            <div className="summary-item">
              <span>Guests:</span>
              <strong>{formData.guest_count}</strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-item">
              <span>Room Rate:</span>
              <strong>
                ₹{room.cost_per_night} × {numberOfNights} nights
              </strong>
            </div>

            <div className="summary-item">
              <span>Number of Rooms:</span>
              <strong>× {formData.no_of_rooms}</strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-item total">
              <span>Total Amount:</span>
              <strong>₹{calculatedCost.toLocaleString()}</strong>
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              className="proceed-payment-btn"
              disabled={
                !availabilityChecked || !isAvailable || calculatedCost === 0
              }
            >
              Proceed to Payment
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

export default HotelBookingPage;
