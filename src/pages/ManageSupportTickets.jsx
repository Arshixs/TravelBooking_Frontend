import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import "../styles/VendorManagement.css";
import "../styles/SupportTickets.css";

const ManageSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/support/tickets");
      setTickets(response.data);
    } catch (error) {
      toast.error("Failed to fetch support tickets.");
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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
          <h1>Support Ticket Management</h1>
          <p>View and respond to all customer support tickets</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <div className="section-header">
            <h2>All Tickets</h2>
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
                    <th>Booking ID</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Date Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <tr key={ticket.ticket_id}>
                        <td>#{ticket.ticket_id}</td>
                        <td>{ticket.ticket_title}</td>
                        <td>{ticket.booking_id || "N/A"}</td>
                        <td>
                          <span className={`status-badge status-${ticket.status?.toLowerCase()}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td>
                          <span className={`priority-badge priority-${ticket.priority?.toLowerCase()}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td>{formatDate(ticket.created_at)}</td>
                        <td>
                           <Link to={`/staff/support-tickets/${ticket.ticket_id}`} className="btn-action btn-view" title="View Details">
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                           </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
                        No support tickets found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSupportTickets;