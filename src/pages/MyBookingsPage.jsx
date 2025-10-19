import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useUser } from "../context/context";
import "../styles/MyBookingsPage.css";

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("CONFIRMED");
  const [downloadingReceipt, setDownloadingReceipt] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchBookings();
  }, [isAuthenticated, filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const url =
        filter === "all"
          ? "/bookings/hotels/my"
          : `/bookings/hotels/my?status=${filter}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      response.data.data.sort((a, b) => {
        const dateA = new Date(a.booking_date);
        const dateB = new Date(b.booking_date);
        return dateB.getTime() - dateA.getTime();
      });
      setBookings(response.data.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (bookingId) => {
    try {
      setDownloadingReceipt(bookingId);
      const token = localStorage.getItem("accessToken");

      const response = await axios.get(
        `/bookings/hotels/${bookingId}/receipt`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const receiptData = response.data.data;
      generatePDF(receiptData);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      alert("Failed to download receipt. Please try again.");
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const generatePDF = (data) => {
    const { booking, customer, hotel, room, payment } = data;

    // Create a new window for printing
    const printWindow = window.open("", "", "width=800,height=600");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Receipt - ${booking.booking_id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: #f5f5f5;
          }
          
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #2563eb;
            font-size: 32px;
            margin-bottom: 10px;
          }
          
          .header p {
            color: #666;
            font-size: 14px;
          }
          
          .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .receipt-info-block h3 {
            color: #1f2937;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          
          .receipt-info-block p {
            color: #4b5563;
            font-size: 14px;
            margin: 5px 0;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section-title {
            background: #f3f4f6;
            padding: 10px 15px;
            color: #1f2937;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
            border-left: 4px solid #2563eb;
          }
          
          .details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            padding: 0 15px;
          }
          
          .detail-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .detail-label {
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
          }
          
          .detail-value {
            color: #1f2937;
            font-size: 14px;
            font-weight: 600;
            text-align: right;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .status-confirmed {
            background: #dcfce7;
            color: #166534;
          }
          
          .status-finished {
            background: #dbeafe;
            color: #1e40af;
          }
          
          .status-pending {
            background: #fef3c7;
            color: #92400e;
          }
          
          .total-section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 18px;
          }
          
          .total-row.grand-total {
            border-top: 2px solid #2563eb;
            margin-top: 10px;
            padding-top: 15px;
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          
          .footer p {
            margin: 5px 0;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .receipt-container {
              box-shadow: none;
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>BOOKING RECEIPT</h1>
            <p>TravelPro - Your Travel Partner</p>
          </div>
          
          <div class="receipt-info">
            <div class="receipt-info-block">
              <h3>Receipt Details</h3>
              <p><strong>Booking ID:</strong> #${booking.booking_id}</p>
              <p><strong>Booking Date:</strong> ${new Date(
                booking.booking_date
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}</p>
              <p><strong>Status:</strong> <span class="status-badge status-${booking.status.toLowerCase()}">${
      booking.status
    }</span></p>
            </div>
            
            <div class="receipt-info-block">
              <h3>Customer Information</h3>
              <p><strong>${customer.name}</strong></p>
              <p>${customer.email}</p>
              <p>${customer.phone}</p>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Hotel Information</div>
            <div style="padding: 0 15px;">
              <p style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 10px;">${
                hotel.name
              }</p>
              <p style="color: #4b5563; margin-bottom: 5px;">${
                hotel.address
              }</p>
              <p style="color: #4b5563;">Phone: ${hotel.phone} | Email: ${
      hotel.email
    }</p>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Booking Details</div>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Check-in Date:</span>
                <span class="detail-value">${new Date(
                  booking.check_in_date
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Check-out Date:</span>
                <span class="detail-value">${new Date(
                  booking.check_out_date
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Number of Nights:</span>
                <span class="detail-value">${booking.number_of_nights}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Number of Rooms:</span>
                <span class="detail-value">${booking.no_of_rooms}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Number of Guests:</span>
                <span class="detail-value">${booking.guest_count}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Room Type:</span>
                <span class="detail-value">${booking.room_type}</span>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Room Details</div>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Room Type:</span>
                <span class="detail-value">${room.type}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Bed Type:</span>
                <span class="detail-value">${room.bed_type}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Max Capacity:</span>
                <span class="detail-value">${room.max_capacity} persons</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Balcony:</span>
                <span class="detail-value">${
                  room.balcony_available ? "Yes" : "No"
                }</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Cost per Night:</span>
                <span class="detail-value">₹${room.cost_per_night.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          ${
            payment && payment.payment_id
              ? `
          <div class="section">
            <div class="section-title">Payment Information</div>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Payment ID:</span>
                <span class="detail-value">#${payment.payment_id}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">${new Date(
                  payment.payment_date
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment Mode:</span>
                <span class="detail-value">${payment.payment_mode}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Transaction Ref:</span>
                <span class="detail-value">${
                  payment.transaction_reference || "N/A"
                }</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment Status:</span>
                <span class="detail-value"><span class="status-badge status-${payment.status.toLowerCase()}">${
                  payment.status
                }</span></span>
              </div>
            </div>
          </div>
          `
              : ""
          }
          
          <div class="total-section">
            <div class="total-row">
              <span>Room Charges (${booking.no_of_rooms} × ₹${
      room.cost_per_night
    } × ${booking.number_of_nights} nights):</span>
              <span>₹${(
                booking.no_of_rooms *
                room.cost_per_night *
                booking.number_of_nights
              ).toLocaleString()}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total Amount:</span>
              <span>₹${booking.total_cost.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Thank you for choosing TravelPro!</strong></p>
            <p>For any queries, please contact us at support@travelpro.com or call +91-1234567890</p>
            <p>This is a computer-generated receipt and does not require a signature.</p>
            <p style="margin-top: 10px; font-size: 10px;">Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 100);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "status-confirmed";
      case "FINISHED":
        return "status-finished";
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="my-bookings-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <h1>My Hotel Bookings</h1>
          <button className="btn-secondary" onClick={() => navigate("/hotels")}>
            Book Another Hotel
          </button>
        </div>

        <div className="bookings-filters">
          <button
            className={filter === "all" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("all")}
          >
            All Bookings
          </button>
          <button
            className={
              filter === "CONFIRMED" ? "filter-btn active" : "filter-btn"
            }
            onClick={() => setFilter("CONFIRMED")}
          >
            Confirmed
          </button>
          <button
            className={
              filter === "FINISHED" ? "filter-btn active" : "filter-btn"
            }
            onClick={() => setFilter("FINISHED")}
          >
            Finished
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">📅</div>
            <h2>No bookings found</h2>
            <p>You haven't made any hotel bookings yet</p>
            <button className="btn-primary" onClick={() => navigate("/hotels")}>
              Browse Hotels
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking.booking_id} className="booking-card">
                <div className="booking-card-header">
                  <h3>Booking #{booking.booking_id}</h3>
                  <span
                    className={`status-badge ${getStatusClass(booking.status)}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="booking-card-body">
                  <div className="booking-detail">
                    <span className="detail-label">Room Type:</span>
                    <span className="detail-value">{booking.room_type}</span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Check-in:</span>
                    <span className="detail-value">
                      {formatDate(booking.check_in_date)}
                    </span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Check-out:</span>
                    <span className="detail-value">
                      {formatDate(booking.check_out_date)}
                    </span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Nights:</span>
                    <span className="detail-value">
                      {booking.number_of_nights}
                    </span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Rooms:</span>
                    <span className="detail-value">{booking.no_of_rooms}</span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Guests:</span>
                    <span className="detail-value">{booking.guest_count}</span>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-label">Booked on:</span>
                    <span className="detail-value">
                      {new Date(booking.booking_date).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="booking-detail total-cost">
                    <span className="detail-label">Total Cost:</span>
                    <span className="detail-value">
                      ₹{booking.cost.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="booking-card-footer">
                  <button
                    className="btn-view-hotel"
                    onClick={() => navigate(`/hotels/${booking.hotel_id}`)}
                  >
                    View Hotel
                  </button>
                  {(booking.status === "CONFIRMED" ||
                    booking.status === "FINISHED") && (
                    <button
                      className="btn-download-receipt"
                      onClick={() => downloadReceipt(booking.booking_id)}
                      disabled={downloadingReceipt === booking.booking_id}
                    >
                      {downloadingReceipt === booking.booking_id ? (
                        <>
                          <span className="spinner-small"></span> Downloading...
                        </>
                      ) : (
                        <>📄 Print Receipt</>
                      )}
                    </button>
                  )}
                  {booking.status === "PENDING" && (
                    <button
                      className="btn-complete-payment"
                      onClick={() =>
                        navigate(
                          `/bookings/hotels/${booking.booking_id}/payment`
                        )
                      }
                    >
                      Complete Payment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
