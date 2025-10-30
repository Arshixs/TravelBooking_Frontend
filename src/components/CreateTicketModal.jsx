import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import "../styles/PackageFormModal.css";

// Accept bookingId as a prop (REQUIRED)
const CreateTicketModal = ({ onClose, onSave, bookingId }) => {
  const [formData, setFormData] = useState({
    category: "BOOKING_INQUIRY",
    ticket_title: "",
    ticket_description: "",
    // Initialize booking_id directly from the prop
    booking_id: bookingId ? String(bookingId) : "",
  });
  const [loading, setLoading] = useState(false);

  // Effect to update if prop changes (less likely, but safe)
  useEffect(() => {
    setFormData(prev => ({ ...prev, booking_id: String(bookingId) }));
  }, [bookingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Explicitly block changes to booking_id
    if (name === 'booking_id') {
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ensure a booking ID is present before submitting
    if (!bookingId) {
        toast.error("Cannot create a ticket without a booking ID.");
        return;
    }
    setLoading(true);
    try {
      const payload = {
        category: formData.category,
        ticket_title: formData.ticket_title,
        ticket_description: formData.ticket_description,
        // Send the booking_id as a number
        booking_id: parseInt(bookingId, 10),
      };
      await axios.post("/support/tickets", payload);
      toast.success("Support ticket created successfully!");
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          {/* Update title */}
          <h2>Support for Booking #{bookingId}</h2>
          <button className="btn-icon close-modal-btn" onClick={onClose}>
             <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange}>
                  {/* Keep options */}
                  <option value="BOOKING_INQUIRY">Booking Inquiry</option>
                  <option value="PAYMENT_ISSUE">Payment Issue</option>
                  <option value="TECHNICAL_SUPPORT">Technical Support</option>
                  <option value="GENERAL_FEEDBACK">General Feedback</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Booking ID Input - Always read-only */}
              <div className="input-group">
                <label htmlFor="booking_id">Regarding Booking ID</label>
                <input
                  type="number" // Keep type as number for consistency
                  id="booking_id"
                  name="booking_id"
                  value={formData.booking_id}
                  readOnly // Make read-only ALWAYS
                  className={'read-only-input'} // Style as read-only
                />
              </div>

              {/* Subject and Description fields remain the same */}
              <div className="input-group full-width">
                <label htmlFor="ticket_title">Subject</label>
                <input type="text" id="ticket_title" name="ticket_title" value={formData.ticket_title} onChange={handleChange} required placeholder="A brief summary of your issue" />
              </div>
              <div className="input-group full-width">
                <label htmlFor="ticket_description">Description</label>
                <textarea id="ticket_description" name="ticket_description" value={formData.ticket_description} onChange={handleChange} rows="6" required placeholder="Please describe your issue in detail..."></textarea>
              </div>
            </div>
          </div>
          <footer className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;