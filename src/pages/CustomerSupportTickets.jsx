import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import CreateTicketModal from "../components/CreateTicketModal";
import "../styles/VendorManagement.css"; // Reuse for dashboard layout
import "../styles/SupportTickets.css"; // Specific styles

const CustomerSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/support/tickets/my-tickets");
      setTickets(response.data);
    } catch (error) {
      toast.error("Failed to fetch your support tickets.");
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSave = () => {
    setShowModal(false);
    fetchTickets(); // Refresh the list after creating a new ticket
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="vendor-management">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>My Support Tickets</h1>
          <p>Track your conversations with our support team</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <div className="section-header">
            <h2>Your Tickets</h2>
            {/* <button className="btn-create" onClick={() => setShowModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Open a New Ticket
            </button> */}
          </div>

          {loading ? (
            <div className="loading-state"><div className="spinner"></div></div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <tr key={ticket.ticket_id}>
                        <td>#{ticket.ticket_id}</td>
                        <td>{ticket.ticket_title}</td>
                        <td>{ticket.category}</td>
                        <td>
                          <span className={`status-badge status-${ticket.status?.toLowerCase()}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td>{formatDate(ticket.created_at)}</td>
                        <td>
                          <Link to={`/support/tickets/${ticket.ticket_id}`} className="btn-action btn-view" title="View Details">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">
                        You haven't created any support tickets yet.
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
        <CreateTicketModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default CustomerSupportTickets;