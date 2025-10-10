import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import ReviewCard from "../components/ReviewCard"
import "../styles/HotelDetails.css"
import axios from "../utils/axios";

import { Link, useNavigate } from "react-router-dom";
const HotelDetails = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
    const [hotel, setHotel] = useState(null)
    const [rooms, setRooms] = useState([])
    const [reviews, setReviews] = useState([])
    const [error, setError] = useState(null)
    useEffect(() => {
        fetchHotelData()
    }, [id])

    const navigate = useNavigate();

    const fetchHotelData = async () => {
    setLoading(true)
    setError(null)

    try {
        // 1. Fetch hotel details
        const hotelResponse = await axios.get(`/hotels/${id}/`);
        setHotel(hotelResponse.data.hotel) // ensure backend returns hotel object
        setRooms(hotelResponse.data.rooms) // array of rooms

        // 3. Fetch reviews for this hotel
        // const reviewsResponse = await axios.get(`/hotels/${id}/reviews`)
        // setReviews(reviewsResponse.data) // array of reviews

    } catch (err) {
        console.error("Failed to load hotel data:", err)
        setError("Failed to load hotel data. Please try again later.")
    } finally {
        setLoading(false)
    }
    }


    const handleBookRoom = (room) => {
    // if (room.number_of_rooms_available === 0) {
    //     alert("Sorry, this room is fully booked!")
    //     return
    const hotelId=room.hotel_id;;
    const roomId=room.room_id;
    // }
        // Navigate to booking page or call booking API
      navigate(`/hotels/${hotelId}/rooms/${roomId}/book`);
        console.log("Booking room:", room)
        alert(`Booking ${room.type} room (${room.room_id})`)
    }

  if (loading) {
    return (
      <main className="hotel-details-page">
        <div className="container">
          <div className="loading-state">Loading hotel details...</div>
        </div>
      </main>
    )
  }

  if (!hotel) {
    return (
      <main className="hotel-details-page">
        <div className="container">
          <div className="error-state">Hotel not found</div>
        </div>
      </main>
    )
  }

  const fullAddress = [hotel.street, hotel.city, hotel.state, hotel.pin].filter(Boolean).join(", ")

  return (
    <main className="hotel-details-page">
      <section className="hotel-hero">
        <img src={hotel.image || "/placeholder.svg"} alt={hotel.name} className="hotel-hero-image" />
        <div className="hotel-hero-overlay">
          <div className="container">
            <h1>{hotel.name}</h1>
            <div className="hotel-rating">
              <span className="stars">
                {"★".repeat(Math.floor(hotel.rating || 0))}
                {"☆".repeat(5 - Math.floor(hotel.rating || 0))}
              </span>
              <span className="rating-number">{(hotel.rating || 0).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container hotel-details-content">
        <div className="hotel-info-section">
          <div className="info-card">
            <h2>About This Hotel</h2>
            <p className="hotel-description">{hotel.description}</p>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-value">{fullAddress}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Rooms</span>
                <span className="info-value">{hotel.total_rooms}</span>
              </div>
            </div>

            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="amenities-section">
                <h3>Amenities</h3>
                <div className="amenities-grid">
                  {hotel.amenities.map((amenity, idx) => (
                    <span key={idx} className="amenity-badge">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="contact-section">
              <h3>Contact Information</h3>
              <div className="contact-grid">
                {hotel.emails && hotel.emails.length > 0 && (
                  <div className="contact-item">
                    <span className="contact-label">Email</span>
                    {hotel.emails.map((email, idx) => (
                      <a key={idx} href={`mailto:${email}`} className="contact-value">
                        {email}
                      </a>
                    ))}
                  </div>
                )}
                {hotel.phones && hotel.phones.length > 0 && (
                  <div className="contact-item">
                    <span className="contact-label">Phone</span>
                    {hotel.phones.map((phone, idx) => (
                      <a key={idx} href={`tel:${phone}`} className="contact-value">
                        {phone}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rooms-section">
          <h2>Available Rooms</h2>
          <div className="rooms-grid">
            {rooms.map((room) => (
              <article key={room.room_id} className="room-card">
                <div className="room-header">
                  <h3>{room.type}</h3>
                  <span className="room-id">Room {room.room_id}</span>
                </div>

                <div className="room-details">
                  <div className="room-detail-item">
                    <span className="detail-icon">🛏️</span>
                    <span>{room.bed_type}</span>
                  </div>
                  <div className="room-detail-item">
                    <span className="detail-icon">👥</span>
                    <span>Max {room.max_capacity} guests</span>
                  </div>
                  {room.balcony_available && (
                    <div className="room-detail-item">
                      <span className="detail-icon">🏖️</span>
                      <span>Balcony</span>
                    </div>
                  )}
                </div>

                <div className="room-footer">
                  <div className="room-price">
                    <span className="price-label">Per Night</span>
                    <span className="price-value">₹{room.cost_per_night.toLocaleString()}</span>
                  </div>

                  {/* {room.number_of_rooms_available == 0 ? ( */}
                    <div className="room-actions">
                      <span className="availability-badge available">{room.number_of_rooms_available} available</span>
                      <button className="btn-book" onClick={() => handleBookRoom(room)}>
                        Book Now
                      </button>
                    </div>
                  {/* ) : (
                    <div className="room-actions">
                      <span className="availability-badge unavailable">Not Available</span>
                      <div className="unavailable-message">Please check back later</div>
                    </div>
                  )} */}
                </div>
              </article>
            ))}
          </div>
        </div>

        {reviews && reviews.length > 0 && (
          <div className="reviews-section">
            <h2>Guest Reviews</h2>
            <div className="reviews-grid">
              {reviews.map((review, idx) => (
                <ReviewCard key={idx} reviewData={review} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default HotelDetails
