import React from 'react';
import '../styles/ContactPage.css'; // We'll create this CSS file next

// --- Icons ---
const MapPinIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const PhoneCallIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const MailIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;

const ContactPage = () => {
    // Static form handler - prevents actual submission
    const handleStaticSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for your message! (This is a static form)');
        // Optionally clear the form
        // e.target.reset();
    };

    return (
        <div className="contact-page">
            <section className="contact-header">
                <div className="container">
                    <h1>Get In Touch</h1>
                    <p>We'd love to hear from you! Whether you have a question about our packages, need assistance, or just want to talk travel, our team is ready to answer all your questions.</p>
                </div>
            </section>

            <section className="contact-content container">
                <div className="contact-grid">
                    {/* Contact Information */}
                    <div className="contact-info">
                        <h3>Contact Information</h3>
                        <ul className="info-list">
                            <li>
                                <PhoneCallIcon />
                                <span>+91 98765 43210</span>
                            </li>
                            <li>
                                <MailIcon />
                                <span>support@travelpro.com</span>
                            </li>
                            <li>
                                <MapPinIcon />
                                <span>TravelPro HQ, Lanka, Varanasi, Uttar Pradesh, India</span>
                            </li>
                        </ul>
                        {/* Placeholder for a small map or relevant image */}
                        {/* <div className="map-placeholder"> */}
                           {/* You could embed a Google Maps iframe here later */}
                           
                           {/* <p>(Map Area)</p> */}
                        {/* </div> */}
                    </div>

                    
                </div>
            </section>
        </div>
    );
};

export default ContactPage;