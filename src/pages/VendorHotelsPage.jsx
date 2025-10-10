import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import "../styles/VendorManagement.css";

const VendorHotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const navigate = useNavigate();
  const vendorId = JSON.parse(localStorage.getItem("user")).userId;
//   console.log(vendorId);

  const [hotelForm, setHotelForm] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    pin: "",
    total_rooms: 1,
    primary_email: "",
    primary_phone: "",
  })

  const [newEmail, setNewEmail] = useState("")
  const [newPhone, setNewPhone] = useState("")

  useEffect(() => {
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`/hotels/vendor/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      setHotels(response.data.data || []);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      toast.error("Failed to fetch hotels");    
    } finally {
      setLoading(false);
    }
  }

  const handleCreateHotel = () => {
    setModalMode("create");
    setHotelForm({
      name: "",
      street: "",
      city: "",
      state: "",
      pin: "",
      total_rooms: 1,
      primary_email: "",
      primary_phone: "",
    });
    setShowModal(true); 
  }

  const handleEditHotel = async (hotelId) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await axios.get(`/hotels/${hotelId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const hotelData = response.data.hotel;
      setHotelForm({
        name: hotelData.name || "",
        street: hotelData.street || "",
        city: hotelData.city || "",
        state: hotelData.state || "",
        pin: hotelData.pin || "",
        total_rooms: hotelData.total_rooms || 1,
        primary_email: hotelData.primary_email || "",
        primary_phone: hotelData.primary_phone || "",
      })
      setSelectedHotel(hotelId)
      setModalMode("edit")
      setShowModal(true)
    } catch (error) {
      console.error("Error fetching hotel details:", error)
      toast.error("Failed to fetch hotel details")
    }
  }

  const handleSubmitHotel = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("accessToken")
      const payload = {
        name: hotelForm.name.trim(),
        street: hotelForm.street.trim(),
        city: hotelForm.city.trim(),
        state: hotelForm.state.trim(),
        pin: hotelForm.pin.trim(),
        total_rooms: Number(hotelForm.total_rooms) || 0,
        primary_email: hotelForm.primary_email.trim(),
        primary_phone: hotelForm.primary_phone.trim(),
        ...(modalMode === "create" && { rating: 0 }),
      }

      if (modalMode === "create") {
        const response = await axios.post("/hotels/", payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.status === 200 || response.status === 201) {
          toast.success("Hotel created successfully")
          fetchHotels()
          setShowModal(false)
        }
      } else {
        const response = await axios.put(`/hotels/${selectedHotel}/`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.status === 200 || response.status === 201) {
          toast.success("Hotel updated successfully")
          fetchHotels()
          setShowModal(false)
        }
      }
    } catch (error) {
      console.error("Error saving hotel:", error)
      toast.error(error.response?.data?.message || "Failed to save hotel")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm("Are you sure you want to delete this hotel? This will also delete all associated rooms.")) {
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await axios.delete(`/hotels/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.status === 200 || response.status === 204) {
        toast.success("Hotel deleted successfully")
        fetchHotels()
      }
    } catch (error) {
      console.error("Error deleting hotel:", error)
      toast.error("Failed to delete hotel")
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (hotelId) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken");
      const [hotelRes, emailsRes, phonesRes] = await Promise.all([
        axios.get(`/hotels/${hotelId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios
          .get(`/hotels/${hotelId}/emails/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        axios
          .get(`/hotels/${hotelId}/phones/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
      ]);

      const emails = emailsRes.data.data.map(email => email.email) || [];
      const phones = phonesRes.data.data.map(phone => phone.phone) || [];

      setDetailsData({
        ...hotelRes.data.hotel,
        emails: emails,
        phones: phones,
      })
      setSelectedHotel(hotelId);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching hotel details:", error)
      toast.error("Failed to fetch hotel details")
    } finally {
      setLoading(false)
    }
  }

  const handleViewRooms = (hotelId) => {
    navigate(`/vendor/hotels/${hotelId}/rooms`)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setHotelForm((prev) => ({
      ...prev,
      [name]:
        name === "total_rooms"
          ? value === ""
            ? ""
            : Math.max(1, Number.parseInt(value, 10) || 1)
          : name === "pin"
            ? value.replace(/\D/g, "").slice(0, 6)
            : value,
    }))
  }

  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      toast.error("Please enter an email")
      return
    }

    try {
      const token = localStorage.getItem("accessToken")
      await axios.post(
        `/hotels/${selectedHotel}/emails/`,
        { emails: [newEmail.trim()] },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )
      toast.success("Email added successfully")
      setNewEmail("")
      handleViewDetails(selectedHotel)
    } catch (error) {
      console.error("Error adding email:", error)
      toast.error(error.response?.data?.message || "Failed to add email")
    }
  }

  const handleDeleteEmail = async (email) => {
    try {
      const token = localStorage.getItem("accessToken")
      await axios.delete(`/hotels/${selectedHotel}/emails/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Email deleted successfully")
      handleViewDetails(selectedHotel)
    } catch (error) {
      console.error("Error deleting email:", error)
      toast.error("Failed to delete email")
    }
  }

  const handleAddPhone = async () => {
    if (!newPhone.trim()) {
      toast.error("Please enter a phone number")
      return
    }

    try {
      const token = localStorage.getItem("accessToken")
      await axios.post(
        `/hotels/${selectedHotel}/phones/`,
        { phoneNumbers: [newPhone.trim()] },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )
      toast.success("Phone added successfully")
      setNewPhone("")
      handleViewDetails(selectedHotel)
    } catch (error) {
      console.error("Error adding phone:", error)
      toast.error(error.response?.data?.message || "Failed to add phone")
    }
  }

  const handleDeletePhone = async (phone) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`/hotels/${selectedHotel}/phones/${phone}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Phone deleted successfully");
      handleViewDetails(selectedHotel);
    } catch (error) {
      console.error("Error deleting phone:", error);
      toast.error("Failed to delete phone");
    }
  }

  return (
    <div className="vendor-management">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Hotel Management</h1>
          <p>Manage your hotels and properties</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <div className="section-header">
            <h2>Your Hotels</h2>
            <button className="btn-create" onClick={handleCreateHotel}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Hotel
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading hotels...</p>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Hotel Name</th>
                    <th>Location</th>
                    <th>Primary Contact</th>
                    <th>Total Rooms</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hotels.length > 0 ? (
                    hotels.map((hotel) => (
                      <tr key={hotel.hotel_id}>
                        <td>{hotel.hotel_id}</td>
                        <td className="vendor-name">{hotel.name}</td>
                        <td>
                          <div className="contact-info">
                            <div>
                              {hotel.city}, {hotel.state}
                            </div>
                            <div className="text-muted">{hotel.street}</div>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div>{hotel.primary_email}</div>
                            {/* {console.log(hotel.primary_phone)} */}
                            <div>{hotel.primary_phone}</div>
                          </div>
                        </td>
                        <td>{hotel.total_rooms}</td>
                        <td>
                          <span className="badge badge-service">
                            {hotel.rating ? `⭐ ${hotel.rating}` : "Not rated"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-view"
                              onClick={() => handleViewDetails(hotel.hotel_id)}
                              title="View Details"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </button>
                            <button
                              className="btn-action btn-info"
                              onClick={() => handleViewRooms(hotel.hotel_id)}
                              title="Manage Rooms"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                              </svg>
                            </button>
                            <button
                              className="btn-action btn-edit"
                              onClick={() => handleEditHotel(hotel.hotel_id)}
                              title="Edit"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteHotel(hotel.hotel_id)}
                              title="Delete"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
                        No hotels found. Create your first hotel!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === "create" ? "Add New Hotel" : "Edit Hotel"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitHotel}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Hotel Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={hotelForm.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={hotelForm.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={hotelForm.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="pin">PIN Code *</label>
                    <input
                      type="text"
                      id="pin"
                      name="pin"
                      value={hotelForm.pin}
                      onChange={handleInputChange}
                      maxLength="6"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="street">Street Address *</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={hotelForm.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="primary_email">Primary Email *</label>
                    <input
                      type="email"
                      id="primary_email"
                      name="primary_email"
                      value={hotelForm.primary_email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="primary_phone">Primary Phone *</label>
                    <input
                      type="tel"
                      id="primary_phone"
                      name="primary_phone"
                      value={hotelForm.primary_phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="total_rooms">Total Rooms *</label>
                    <input
                      type="number"
                      id="total_rooms"
                      name="total_rooms"
                      value={hotelForm.total_rooms}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Saving..." : modalMode === "create" ? "Create Hotel" : "Update Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && detailsData && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Hotel Details - {detailsData.name}</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="details-section">
                <h3>Basic Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Location:</strong> {detailsData.street}, {detailsData.city}, {detailsData.state} -{" "}
                    {detailsData.pin}
                  </div>
                  <div className="detail-item">
                    <strong>Total Rooms:</strong> {detailsData.total_rooms}
                  </div>
                  <div className="detail-item">
                    <strong>Rating:</strong>{" "}
                    <span className={`badge ${detailsData.rating > 0 ? "badge-active" : "badge-inactive"}`}>
                      {detailsData.rating ? `⭐ ${detailsData.rating}` : "Not rated"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Email Addresses</h3>
                <div className="multi-value-section">
                  <div className="add-item-form">
                    <input
                      type="email"
                      placeholder="Add new email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                    <button type="button" onClick={handleAddEmail} className="btn-add">
                      Add
                    </button>
                  </div>
                  <div className="item-list">
                    <div className="item-badge primary-badge">
                      {detailsData.primary_email} <span>(Primary)</span>
                    </div>
                    {detailsData.emails && detailsData.emails.length > 0
                      ? detailsData.emails
                          .filter((email) => email !== detailsData.primary_email)
                          .map((email, idx) => (
                            <div key={idx} className="item-badge">
                              {email}
                              <button onClick={() => handleDeleteEmail(email)} className="btn-remove">
                                ×
                              </button>
                            </div>
                          ))
                      : null}
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Phone Numbers</h3>
                <div className="multi-value-section">
                  <div className="add-item-form">
                    <input
                      type="tel"
                      placeholder="Add new phone"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                    />
                    <button type="button" onClick={handleAddPhone} className="btn-add">
                      Add
                    </button>
                  </div>
                  <div className="item-list">
                    <div className="item-badge primary-badge">
                      {detailsData.primary_phone} <span>(Primary)</span>
                    </div>
                    {detailsData.phones && detailsData.phones.length > 0
                      ? detailsData.phones
                          .filter((phone) => phone !== detailsData.primary_phone)
                          .map((phone, idx) => (
                            <div key={idx} className="item-badge">
                              {phone}
                              <button onClick={() => handleDeletePhone(phone)} className="btn-remove">
                                ×
                              </button>
                            </div>
                          ))
                      : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorHotelsPage
