import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useUser } from "../context/context";
import toast from "react-hot-toast";
import "../styles/VendorManagement.css";

const VendorTransportPage = () => {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [transportDetails, setTransportDetails] = useState(null);
  const { user } = useUser();

  const [transportForm, setTransportForm] = useState({
    first_name: "",
    last_name: "",
    license_no: "",
    vehicle_model: "",
    vehicle_type: "",
    vehicle_reg_no: "",
    vehicle_ac: false,
    vehicle_seating_capacity: "",
    cost: "",
    availability: true,
    primary_phone: "",
  });

  // Multi-value states
  const [phones, setPhones] = useState([]);
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/transports/");
      if (response.data.success) {
        setTransports(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching transports:", error);
      toast.error("Failed to fetch transports");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransport = () => {
    setModalMode("create");
    setTransportForm({
      first_name: "",
      last_name: "",
      license_no: "",
      vehicle_model: "",
      vehicle_type: "",
      vehicle_reg_no: "",
      vehicle_ac: false,
      vehicle_seating_capacity: "",
      cost: "",
      availability: true,
      primary_phone: "",
    });
    setShowModal(true);
  };

  const handleEditTransport = async (driverId) => {
    try {
      const response = await axios.get(`/transports/${driverId}`);
      if (response.data.success) {
        const transportData = response.data.data;
        setTransportForm({
          first_name: transportData.first_name || "",
          last_name: transportData.last_name || "",
          license_no: transportData.license_no || "",
          vehicle_model: transportData.vehicle_model || "",
          vehicle_type: transportData.vehicle_type || "",
          vehicle_reg_no: transportData.vehicle_reg_no || "",
          vehicle_ac: transportData.vehicle_ac ?? false,
          vehicle_seating_capacity:
            transportData.vehicle_seating_capacity || "",
          cost: transportData.cost || "",
          availability: transportData.availability ?? true,
          primary_phone: transportData.primary_phone || "",
        });
        setSelectedTransport(driverId);
        setModalMode("edit");
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching transport details:", error);
      toast.error("Failed to fetch transport details");
    }
  };

  const handleSubmitTransport = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (modalMode === "create") {
        const response = await axios.post("/transports/", transportForm);
        if (response.data.success) {
          toast.success("Transport created successfully");
          fetchTransports();
          setShowModal(false);
        }
      } else {
        const response = await axios.put(
          `/transports/${selectedTransport}`,
          transportForm
        );
        if (response.data.success) {
          toast.success("Transport updated successfully");
          fetchTransports();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error("Error saving transport:", error);
      toast.error(error.response?.data?.message || "Failed to save transport");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransport = async (driverId) => {
    if (!window.confirm("Are you sure you want to delete this transport?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(`/transports/${driverId}`);
      if (response.data.success) {
        toast.success("Transport deleted successfully");
        fetchTransports();
      }
    } catch (error) {
      console.error("Error deleting transport:", error);
      toast.error("Failed to delete transport");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (driverId) => {
    setLoading(true);
    try {
      const [transportRes, phonesRes] = await Promise.all([
        axios.get(`/transports/${driverId}`),
        axios.get(`/transports/${driverId}/phones/`),
      ]);

      setTransportDetails({
        ...transportRes.data.data,
        phones: phonesRes.data.data || [],
      });
      setPhones(phonesRes.data.data || []);
      setSelectedTransport(driverId);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching transport details:", error);
      toast.error("Failed to fetch transport details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhone = async () => {
    if (!newPhone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    try {
      const response = await axios.post(
        `/transports/${selectedTransport}/phones/`,
        {
          phone: newPhone,
        }
      );
      if (response.data.success) {
        toast.success("Phone added successfully");
        setNewPhone("");
        handleViewDetails(selectedTransport);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add phone");
    }
  };

  const handleDeletePhone = async (phone) => {
    try {
      const response = await axios.delete(
        `/transports/${selectedTransport}/phones/${encodeURIComponent(phone)}`
      );
      if (response.data.success) {
        toast.success("Phone deleted successfully");
        handleViewDetails(selectedTransport);
      }
    } catch (error) {
      toast.error("Failed to delete phone");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTransportForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="vendor-management">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Transport Management</h1>
          <p>Manage your drivers and vehicles</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <div className="section-header">
            <h2>Your Transports</h2>
            <button className="btn-create" onClick={handleCreateTransport}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Transport
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading transports...</p>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Driver Name</th>
                    <th>License No</th>
                    <th>Vehicle</th>
                    <th>Type</th>
                    <th>Reg No</th>
                    <th>Seating</th>
                    <th>AC</th>
                    <th>Cost</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transports.length > 0 ? (
                    transports.map((transport) => (
                      <tr key={transport.driver_id}>
                        <td>{transport.driver_id}</td>
                        <td>
                          {transport.first_name} {transport.last_name}
                        </td>
                        <td>{transport.license_no}</td>
                        <td>{transport.vehicle_model}</td>
                        <td>
                          <span className="badge badge-service">
                            {transport.vehicle_type}
                          </span>
                        </td>
                        <td>{transport.vehicle_reg_no}</td>
                        <td>{transport.vehicle_seating_capacity || "N/A"}</td>
                        <td>
                          <span
                            className={`badge ${
                              transport.vehicle_ac
                                ? "badge-active"
                                : "badge-inactive"
                            }`}
                          >
                            {transport.vehicle_ac ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="amount">₹{transport.cost}</td>
                        <td>
                          <span
                            className={`badge badge-status ${
                              transport.availability
                                ? "badge-active"
                                : "badge-inactive"
                            }`}
                          >
                            {transport.availability
                              ? "Available"
                              : "Unavailable"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-view"
                              onClick={() =>
                                handleViewDetails(transport.driver_id)
                              }
                              title="View Details"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </button>
                            <button
                              className="btn-action btn-edit"
                              onClick={() =>
                                handleEditTransport(transport.driver_id)
                              }
                              title="Edit"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() =>
                                handleDeleteTransport(transport.driver_id)
                              }
                              title="Delete"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
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
                      <td colSpan="11" className="no-data">
                        No transports found. Create your first transport!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === "create"
                  ? "Add New Transport"
                  : "Edit Transport"}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitTransport}>
              <div className="modal-body">
                <h3 className="section-title">Driver Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name *</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={transportForm.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last_name">Last Name *</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={transportForm.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="license_no">License Number *</label>
                    <input
                      type="text"
                      id="license_no"
                      name="license_no"
                      value={transportForm.license_no}
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
                      value={transportForm.primary_phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <h3 className="section-title">Vehicle Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="vehicle_model">Vehicle Model *</label>
                    <input
                      type="text"
                      id="vehicle_model"
                      name="vehicle_model"
                      value={transportForm.vehicle_model}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="vehicle_type">Vehicle Type *</label>
                    <select
                      id="vehicle_type"
                      name="vehicle_type"
                      value={transportForm.vehicle_type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Car">Car</option>
                      <option value="SUV">SUV</option>
                      <option value="Van">Van</option>
                      <option value="Bus">Bus</option>
                      <option value="Tempo Traveller">Tempo Traveller</option>
                      <option value="Luxury Coach">Luxury Coach</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="vehicle_reg_no">
                      Vehicle Registration No *
                    </label>
                    <input
                      type="text"
                      id="vehicle_reg_no"
                      name="vehicle_reg_no"
                      value={transportForm.vehicle_reg_no}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="vehicle_seating_capacity">
                      Seating Capacity
                    </label>
                    <input
                      type="number"
                      id="vehicle_seating_capacity"
                      name="vehicle_seating_capacity"
                      value={transportForm.vehicle_seating_capacity}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cost">Cost (₹) *</label>
                    <input
                      type="number"
                      id="cost"
                      name="cost"
                      value={transportForm.cost}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="vehicle_ac"
                        checked={transportForm.vehicle_ac}
                        onChange={handleInputChange}
                      />
                      <span>Air Conditioned</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="availability"
                        checked={transportForm.availability}
                        onChange={handleInputChange}
                      />
                      <span>Available for booking</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : modalMode === "create"
                    ? "Create Transport"
                    : "Update Transport"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && transportDetails && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                Transport Details - {transportDetails.first_name}{" "}
                {transportDetails.last_name}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="details-section">
                <h3>Driver Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Driver Name:</strong> {transportDetails.first_name}{" "}
                    {transportDetails.last_name}
                  </div>
                  <div className="detail-item">
                    <strong>License Number:</strong>{" "}
                    {transportDetails.license_no}
                  </div>
                  <div className="detail-item">
                    <strong>Primary Phone:</strong>{" "}
                    {transportDetails.primary_phone}
                  </div>
                  <div className="detail-item">
                    <strong>Availability:</strong>{" "}
                    <span
                      className={`badge ${
                        transportDetails.availability
                          ? "badge-active"
                          : "badge-inactive"
                      }`}
                    >
                      {transportDetails.availability
                        ? "Available"
                        : "Unavailable"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Vehicle Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Model:</strong> {transportDetails.vehicle_model}
                  </div>
                  <div className="detail-item">
                    <strong>Type:</strong> {transportDetails.vehicle_type}
                  </div>
                  <div className="detail-item">
                    <strong>Registration:</strong>{" "}
                    {transportDetails.vehicle_reg_no}
                  </div>
                  <div className="detail-item">
                    <strong>Seating Capacity:</strong>{" "}
                    {transportDetails.vehicle_seating_capacity || "N/A"}
                  </div>
                  <div className="detail-item">
                    <strong>Air Conditioning:</strong>{" "}
                    <span
                      className={`badge ${
                        transportDetails.vehicle_ac
                          ? "badge-active"
                          : "badge-inactive"
                      }`}
                    >
                      {transportDetails.vehicle_ac ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Cost:</strong> ₹{transportDetails.cost}
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
                    <button
                      type="button"
                      onClick={handleAddPhone}
                      className="btn-add"
                    >
                      Add
                    </button>
                  </div>
                  <div className="item-list">
                    <div className="item-badge primary-badge">
                      {transportDetails.primary_phone} <span>(Primary)</span>
                    </div>
                    {phones
                      .filter((p) => p.phone !== transportDetails.primary_phone)
                      .map((phone) => (
                        <div key={phone.phone} className="item-badge">
                          {phone.phone}
                          <button
                            onClick={() => handleDeletePhone(phone.phone)}
                            className="btn-remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorTransportPage;
