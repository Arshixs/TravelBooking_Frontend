import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../utils/axios';
import toast from 'react-hot-toast';
import { useUser } from '../context/context';
import '../styles/SupportTickets.css';

const TicketDetailPage = () => {
    const { id } = useParams();
    const { user } = useUser();
    const [ticket, setTicket] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- NEW STATE for staff actions ---
    const [newStatus, setNewStatus] = useState('');
    const [newPriority, setNewPriority] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const [replyText, setReplyText] = useState('');
    const [isPublicReply, setIsPublicReply] = useState(true);
    const [isReplying, setIsReplying] = useState(false);
    
    const fetchTicketDetails = useCallback(async () => {
        try {
            const response = await axios.get(`/support/tickets/${id}`);
            setTicket(response.data.ticket);
            setResponses(response.data.responses);
            // --- NEW: Set initial state for dropdowns ---
            setNewStatus(response.data.ticket.status);
            setNewPriority(response.data.ticket.priority);
        } catch (error) {
            toast.error('Failed to load ticket details.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTicketDetails();
    }, [fetchTicketDetails]);

    const handlePostReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setIsReplying(true);
        try {
            await axios.post(`/support/tickets/${id}/responses`, {
                response_text: replyText,
                is_customer_visible: isPublicReply,
            });
            toast.success('Reply posted!');
            setReplyText('');
            fetchTicketDetails();
        } catch (error) {
            toast.error('Failed to post reply.');
        } finally {
            setIsReplying(false);
        }
    };
    
    // --- NEW METHOD to handle status/priority updates ---
    const handleStatusUpdate = async () => {
        setIsUpdating(true);
        try {
            await axios.put(`/support/tickets/${id}/status`, {
                status: newStatus,
                priority: newPriority,
            });
            toast.success('Ticket updated successfully!');
            fetchTicketDetails(); // Refresh data
        } catch (error) {
            toast.error('Failed to update ticket.');
        } finally {
            setIsUpdating(false);
        }
    };
    
    const handleSatisfactionSubmit = async (rating) => {
        try {
            await axios.put(`/support/tickets/${id}/satisfaction`, { satisfaction: rating });
            toast.success('Thank you for your feedback!');
            fetchTicketDetails();
        } catch (error) {
            toast.error(error.response?.data || 'Failed to submit feedback.');
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleString('en-IN');

    if (loading) return <div className="loading-state"><div className="spinner"></div></div>;
    if (!ticket) return <div className="no-data"><h2>Ticket not found</h2></div>;

    
    const isStaff = user?.data?.userType === 'STAFF';
    const isTicketActive = ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED';


    return (
        <div className="ticket-detail-page">
            <header className="ticket-detail-header">
                <div className="header-main">
                    <h1>{ticket.ticket_title}</h1>
                    <span className={`status-badge status-${ticket.status?.toLowerCase()}`}>{ticket.status}</span>
                </div>
                <div className="header-meta">
                    <span>Ticket #{ticket.ticket_id}</span>
                    <span>Category: {ticket.category}</span>
                    <span>Created: {formatDate(ticket.created_at)}</span>
                    {ticket.booking_id && <span>Booking ID: #{ticket.booking_id}</span>}
                </div>
            </header>

            {/* --- NEW UI for Staff Actions --- */}
            {isStaff && (
                <div className="staff-actions-panel">
                    <div className="action-group">
                        <label htmlFor="status-select">Status</label>
                        <select id="status-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                    <div className="action-group">
                        <label htmlFor="priority-select">Priority</label>
                        <select id="priority-select" value={newPriority} onChange={e => setNewPriority(e.target.value)}>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>
                    <button className="btn-primary" onClick={handleStatusUpdate} disabled={isUpdating}>
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            )}

            <div className="conversation-container">
                <div className="message customer-message">
                    <div className="message-header">
                        <span className="sender">Customer Query</span>
                        <span className="timestamp">{formatDate(ticket.created_at)}</span>
                    </div>
                    <div className="message-body">
                        <p>{ticket.ticket_description}</p>
                    </div>
                </div>
                {responses
                .filter(res => isStaff || res.is_customer_visible)
                .map(res => (
                    <div key={res.response_id} className={`message ${res.sender.includes('Staff') ? 'staff-message' : 'customer-message'} ${!res.is_customer_visible ? 'internal-note' : ''}`}>
                        <div className="message-header">
                            <span className="sender">{res.sender}</span>
                            <span className="timestamp">{formatDate(res.created_at)}</span>
                            {!res.is_customer_visible && <span className="internal-badge">Internal Note</span>}
                        </div>
                        <div className="message-body">
                           <p>{res.response_text}</p>
                        </div>
                    </div>
                ))}
            </div>

            {ticket.status === 'RESOLVED' && !ticket.customer_satisfaction && !isStaff && (
                <div className="satisfaction-form">
                    <h3>How was your support experience?</h3>
                    <p>Your feedback helps us improve.</p>
                    <div className="satisfaction-buttons">
                        <button onClick={() => handleSatisfactionSubmit('GOOD')}>👍 Good</button>
                        <button onClick={() => handleSatisfactionSubmit('BAD')}>👎 Bad</button>
                    </div>
                </div>
            )}
            
            {/* --- CHECK THIS CONDITION: Reply form for Staff --- */}
            {isTicketActive && (
                 <div className="reply-form-container">
                    <h3>Post a Reply</h3>
                    <form onSubmit={handlePostReply}>
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your response here..."
                            rows="5"
                            required
                        />
                        <div className="reply-actions">
                            {isStaff ? (
                                <div className="visibility-toggle">
                                    <input 
                                        type="checkbox" 
                                        id="isPublicReply" 
                                        checked={isPublicReply}
                                        onChange={(e) => setIsPublicReply(e.target.checked)} 
                                    />
                                    <label htmlFor="isPublicReply">Visible to customer</label>
                                </div>
                            ) : (
                                <span>&nbsp;</span> // Placeholder to keep button on the right
                            )}
                            <button type="submit" className="btn-primary" disabled={isReplying}>
                                {isReplying ? 'Posting...' : 'Post Reply'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default TicketDetailPage;