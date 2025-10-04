import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useUser } from "../context/context";
import toast from "react-hot-toast";
import "../styles/VendorManagement.css";

const VendorGuidesPage = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [guideDetails, setGuideDetails] = useState(null);
  const { user } = useUser();

  const [guideForm, setGuideForm] = useState({
    first_name: "",
    last_name: "",
    experience: "",
    cost_per_hour: "",
    profile_photo: "",
    availability: true,
    primary_email: "",
    primary_phone: "",
    primary_language: "",
  });

  // Multi-value states
  const [emails, setEmails] = useState([]);
  const [phones, setPhones] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/guides/");
      if (response.data.success) {
        setGuides(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching guides:", error);
      toast.error("Failed to fetch guides");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGuide = () => {
    setModalMode("create");
    setGuideForm({
      first_name: "",
      last_name: "",
      experience: "",
      cost_per_hour: "",
      profile_photo: "",
      availability: true,
      primary_email: "",
      primary_phone: "",
      primary_language: "",
    });
    setShowModal(true);
  };

  const handleEditGuide = async (guideId) => {
    try {
      const response = await axios.get(`/guides/${guideId}`);
      if (response.data.success) {
        const guideData = response.data.data;
        setGuideForm({
          first_name: guideData.first_name || "",
          last_name: guideData.last_name || "",
          experience: guideData.experience || "",
          cost_per_hour: guideData.cost_per_hour || "",
          profile_photo: guideData.profile_photo || "",
          availability: guideData.availability ?? true,
          primary_email: guideData.primary_email || "",
          primary_phone: guideData.primary_phone || "",
          primary_language: guideData.primary_language || "",
        });
        setSelectedGuide(guideId);
        setModalMode("edit");
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching guide details:", error);
      toast.error("Failed to fetch guide details");
    }
  };

  const handleSubmitGuide = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (modalMode === "create") {
        const response = await axios.post("/guides/", guideForm);
        if (response.data.success) {
          toast.success("Guide created successfully");
          fetchGuides();
          setShowModal(false);
        }
      } else {
        const response = await axios.put(`/guides/${selectedGuide}`, guideForm);
        if (response.data.success) {
          toast.success("Guide updated successfully");
          fetchGuides();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error("Error saving guide:", error);
      toast.error(error.response?.data?.message || "Failed to save guide");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGuide = async (guideId) => {
    if (!window.confirm("Are you sure you want to delete this guide?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(`/guides/${guideId}`);
      if (response.data.success) {
        toast.success("Guide deleted successfully");
        fetchGuides();
      }
    } catch (error) {
      console.error("Error deleting guide:", error);
      toast.error("Failed to delete guide");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (guideId) => {
    setLoading(true);
    try {
      const [guideRes, emailsRes, phonesRes, languagesRes] = await Promise.all([
        axios.get(`/guides/${guideId}`),
        axios.get(`/guides/${guideId}/emails/`),
        axios.get(`/guides/${guideId}/phones/`),
        axios.get(`/guides/${guideId}/languages/`),
      ]);

      setGuideDetails({
        ...guideRes.data.data,
        emails: emailsRes.data.data || [],
        phones: phonesRes.data.data || [],
        languages: languagesRes.data.data || [],
      });
      setEmails(emailsRes.data.data || []);
      setPhones(phonesRes.data.data || []);
      setLanguages(languagesRes.data.data || []);
      setSelectedGuide(guideId);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching guide details:", error);
      toast.error("Failed to fetch guide details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      toast.error("Please enter an email");
      return;
    }

    try {
      const response = await axios.post(`/guides/${selectedGuide}/emails/`, {
        email: newEmail,
      });
      if (response.data.success) {
        toast.success("Email added successfully");
        setNewEmail("");
        handleViewDetails(selectedGuide);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add email");
    }
  };

  const handleDeleteEmail = async (email) => {
    try {
      const response = await axios.delete(
        `/guides/${selectedGuide}/emails/${encodeURIComponent(email)}`
      );
      if (response.data.success) {
        toast.success("Email deleted successfully");
        handleViewDetails(selectedGuide);
      }
    } catch (error) {
      toast.error("Failed to delete email");
    }
  };

  const handleAddPhone = async () => {
    if (!newPhone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    try {
      const response = await axios.post(`/guides/${selectedGuide}/phones/`, {
        phoneNo: newPhone,
      });
      if (response.data.success) {
        toast.success("Phone added successfully");
        setNewPhone("");
        handleViewDetails(selectedGuide);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add phone");
    }
  };

  const handleDeletePhone = async (phoneNo) => {
    try {
      const response = await axios.delete(
        `/guides/${selectedGuide}/phones/${encodeURIComponent(phoneNo)}`
      );
      if (response.data.success) {
        toast.success("Phone deleted successfully");
        handleViewDetails(selectedGuide);
      }
    } catch (error) {
      toast.error("Failed to delete phone");
    }
  };

  const handleAddLanguage = async () => {
    if (!newLanguage.trim()) {
      toast.error("Please enter a language");
      return;
    }

    try {
      const response = await axios.post(`/guides/${selectedGuide}/languages/`, {
        language: newLanguage,
      });
      if (response.data.success) {
        toast.success("Language added successfully");
        setNewLanguage("");
        handleViewDetails(selectedGuide);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add language");
    }
  };

  const handleDeleteLanguage = async (language) => {
    try {
      const response = await axios.delete(
        `/guides/${selectedGuide}/languages/${encodeURIComponent(language)}`
      );
      if (response.data.success) {
        toast.success("Language deleted successfully");
        handleViewDetails(selectedGuide);
      }
    } catch (error) {
      toast.error("Failed to delete language");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGuideForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="vendor-management">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Guide Management</h1>
          <p>Manage your tour guides</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <div className="section-header">
            <h2>Your Guides</h2>
            <button className="btn-create" onClick={handleCreateGuide}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Guide
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading guides...</p>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Experience (Years)</th>
                    <th>Cost/Hour</th>
                    <th>Primary Contact</th>
                    <th>Primary Language</th>
                    <th>Availability</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {guides.length > 0 ? (
                    guides.map((guide) => (
                      <tr key={guide.guide_id}>
                        <td>{guide.guide_id}</td>
                        <td>
                          {guide.first_name} {guide.last_name}
                        </td>
                        <td>{guide.experience || "N/A"}</td>
                        <td className="amount">₹{guide.cost_per_hour}</td>
                        <td>
                          <div className="contact-info">
                            <div>{guide.primary_email}</div>
                            <div>{guide.primary_phone}</div>
                          </div>
                        </td>
                        <td>{guide.primary_language}</td>
                        <td>
                          <span
                            className={`badge badge-status ${
                              guide.availability
                                ? "badge-active"
                                : "badge-inactive"
                            }`}
                          >
                            {guide.availability ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-view"
                              onClick={() => handleViewDetails(guide.guide_id)}
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
                              onClick={() => handleEditGuide(guide.guide_id)}
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
                              onClick={() => handleDeleteGuide(guide.guide_id)}
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
                      <td colSpan="8" className="no-data">
                        No guides found. Create your first guide!
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
              <h2>{modalMode === "create" ? "Add New Guide" : "Edit Guide"}</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitGuide}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name *</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={guideForm.first_name}
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
                      value={guideForm.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="primary_email">Primary Email *</label>
                    <input
                      type="email"
                      id="primary_email"
                      name="primary_email"
                      value={guideForm.primary_email}
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
                      value={guideForm.primary_phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="experience">Experience (Years)</label>
                    <input
                      type="number"
                      id="experience"
                      name="experience"
                      value={guideForm.experience}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cost_per_hour">Cost per Hour (₹) *</label>
                    <input
                      type="number"
                      id="cost_per_hour"
                      name="cost_per_hour"
                      value={guideForm.cost_per_hour}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="primary_language">Primary Language *</label>
                    <input
                      type="text"
                      id="primary_language"
                      name="primary_language"
                      value={guideForm.primary_language}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="profile_photo">Profile Photo URL</label>
                    <input
                      type="url"
                      id="profile_photo"
                      name="profile_photo"
                      value={guideForm.profile_photo}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="availability"
                      checked={guideForm.availability}
                      onChange={handleInputChange}
                    />
                    <span>Available for booking</span>
                  </label>
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
                    ? "Create Guide"
                    : "Update Guide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && guideDetails && (
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
                Guide Details - {guideDetails.first_name}{" "}
                {guideDetails.last_name}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                x
              </button>
            </div>
            <div className="modal-body">
              <div className="details-section">
                <h3>Basic Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Experience:</strong>{" "}
                    {guideDetails.experience || "N/A"} years
                  </div>
                  <div className="detail-item">
                    <strong>Cost per Hour:</strong> ₹
                    {guideDetails.cost_per_hour}
                  </div>
                  <div className="detail-item">
                    <strong>Primary Language:</strong>{" "}
                    {guideDetails.primary_language}
                  </div>
                  <div className="detail-item">
                    <strong>Availability:</strong>{" "}
                    <span
                      className={`badge ${
                        guideDetails.availability
                          ? "badge-active"
                          : "badge-inactive"
                      }`}
                    >
                      {guideDetails.availability ? "Available" : "Unavailable"}
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
                    <button
                      type="button"
                      onClick={handleAddEmail}
                      className="btn-add"
                    >
                      Add
                    </button>
                  </div>
                  <div className="item-list">
                    <div className="item-badge primary-badge">
                      {guideDetails.primary_email} <span>(Primary)</span>
                    </div>
                    {emails
                      .filter((e) => e.email !== guideDetails.primary_email)
                      .map((email) => (
                        <div key={email.email} className="item-badge">
                          {email.email}
                          <button
                            onClick={() => handleDeleteEmail(email.email)}
                            className="btn-remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
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
                      {guideDetails.primary_phone} <span>(Primary)</span>
                    </div>
                    {phones
                      .filter((p) => p.phone_no !== guideDetails.primary_phone)
                      .map((phone) => (
                        <div key={phone.phone_no} className="item-badge">
                          {phone.phone_no}
                          <button
                            onClick={() => handleDeletePhone(phone.phone_no)}
                            className="btn-remove"
                          >
                            x
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Languages</h3>
                <div className="multi-value-section">
                  <div className="add-item-form">
                    <input
                      type="text"
                      placeholder="Add new language"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddLanguage}
                      className="btn-add"
                    >
                      Add
                    </button>
                  </div>
                  <div className="item-list">
                    <div className="item-badge primary-badge">
                      {guideDetails.primary_language} <span>(Primary)</span>
                    </div>
                    {languages
                      .filter(
                        (l) => l.language !== guideDetails.primary_language
                      )
                      .map((language) => (
                        <div key={language.language} className="item-badge">
                          {language.language}
                          <button
                            onClick={() =>
                              handleDeleteLanguage(language.language)
                            }
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

export default VendorGuidesPage;
