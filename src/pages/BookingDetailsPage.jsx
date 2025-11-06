import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../utils/axios';
import toast from 'react-hot-toast';
import { useUser } from '../context/context';
import CreateTicketModal from '../components/CreateTicketModal';
import '../styles/BookingDetailsPage.css'; // New CSS file

// --- Icons for Itinerary Items ---
const ActivityIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const HotelIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const TransportIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"></polyline><polyline points="16 8 12 12 8 8"></polyline><path d="M3 12h18"></path></svg>; // Using a simple 'navigation' like icon
const GuideIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const TicketIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;

const BookingDetailsPage = () => {
    const { package_booking_id } = useParams();
    const [itinerary, setItinerary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTicketModal, setShowTicketModal] = useState(false);

    const fetchBookingDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/bookings/packages/${package_booking_id}/afterBook`);
            if (response.data.success) {
                setItinerary(response.data.data);
            } else {
                toast.error(response.data.message || 'Could not load booking details.');
            }
        } catch (error) {
            toast.error('Failed to fetch booking details.');
            console.error("Error fetching booking details:", error);
        } finally {
            setLoading(false);
        }
    }, [package_booking_id]);

    useEffect(() => {
        fetchBookingDetails();
    }, [fetchBookingDetails]);

    const handleTicketSave = () => {
        setShowTicketModal(false);
        // No need to refresh data here, just close modal
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading your itinerary...</p>
            </div>
        );
    }

    if (itinerary.length === 0) {
        return <div className="no-data"><h2>Could not find booking details.</h2></div>;
    }

    return (
        <div className="booking-details-page">
            <section className="booking-header">
                <div className="container">
                    <h1>Your Trip Itinerary</h1>
                    <p>Booking ID: #{package_booking_id}</p>
                    <button className="btn-primary" onClick={() => setShowTicketModal(true)}>
                        <TicketIcon /> Get Help with this Booking
                    </button>
                </div>
            </section>

            <div className="timeline-container container">
                {itinerary.map((day) => (
                    <div key={day.itineraryItem.item_id} className="timeline-day-card">
                        <div className="day-header">
                            <h2>Day {day.itineraryItem.day_number}: {day.itineraryItem.title}</h2>
                        </div>
                        <div className="day-content">
                            <p className="day-description">{day.itineraryItem.description}</p>
                            
                            <div className="details-grid">
                                {/* Hotel Details */}
                                {day.hotel && (
                                    <div className="detail-card">
                                        <div className="detail-icon"><HotelIcon /></div>
                                        <div className="detail-info">
                                            <h4>Accommodation</h4>
                                            <p>{day.hotel.name}, {day.hotel.city}</p>
                                            <span>Room: {day.roomType.type} ({day.hotelBooking.no_of_rooms} Room)</span>
                                            <span>Check-in: {new Date(day.hotelBooking.check_in_date).toLocaleDateString('en-IN')}</span>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Transport Details */}
                                {day.transport && (
                                    <div className="detail-card">
                                        <div className="detail-icon"><TransportIcon /></div>
                                        <div className="detail-info">
                                            <h4>Transport</h4>
                                            <p>{day.transport.vehicle_model} ({day.transport.vehicle_type})</p>
                                            <span>Driver: {day.transport.first_name} {day.transport.last_name}</span>
                                            <span>From: {day.transportAssignment.pickup_city} to {day.transportAssignment.drop_city}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Guide Details */}
                                {day.guide && (
                                    <div className="detail-card">
                                        <div className="detail-icon"><GuideIcon /></div>
                                        <div className="detail-info">
                                            <h4>Guide</h4>
                                            <p>{day.guide.first_name} {day.guide.last_name}</p>
                                            <span>Language: {day.guide.primary_language}</span>
                                            <span>Phone: {day.guide.primary_phone}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showTicketModal && (
                <CreateTicketModal
                    onClose={() => setShowTicketModal(false)}
                    onSave={handleTicketSave}
                    bookingId={package_booking_id} // Pass the booking ID
                />
            )}
        </div>
    );
};

export default BookingDetailsPage;