import React from 'react';
import '../styles/PackageDetailsModal.css'; 

const CloseIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const PackageDetailsModal = ({ packageData, onClose, onEdit, onDelete }) => {
    if (!packageData) return null;

    const {
        name, tour_type, duration_days, max_capacity, status,
        image_url, itinerary_summary, itinerary
    } = packageData;

    const fallbackImage = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600";

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="details-modal-header">
                    <h2>{name}</h2>
                    <button className="btn-icon close-modal-btn" onClick={onClose}><CloseIcon /></button>
                </header>
                <div className="details-modal-body">
                    <div className="details-main-content">
                        <img src={image_url || fallbackImage} alt={name} className="details-image" />
                        <div className="details-info-wrapper">
                            <span className={`status-badge status-${status?.toLowerCase()}`}>{status}</span>
                            <p className="details-summary">{itinerary_summary}</p>
                            <div className="details-grid">
                                <p><span className="detail-label">Type:</span> {tour_type}</p>
                                <p><span className="detail-label">Duration:</span> {duration_days} days</p>
                                <p><span className="detail-label">Capacity:</span> {max_capacity} people</p>
                            </div>
                        </div>
                    </div>
                    <div className="details-itinerary">
                        <h3>Itinerary</h3>
                        {itinerary?.length > 0 ? (
                            // MODIFIED: This whole block is updated for the new structure
                            <div className="timeline">
                                {itinerary.map((item, index) => (
                                    <div key={index} className="timeline-item">
                                        <div className="timeline-marker">
                                            <div className="timeline-dot"></div>
                                        </div>
                                        <div className="timeline-content">
                                            <h4>Day {item.day_number}: {item.title}</h4>
                                            <p>{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No itinerary details available.</p>
                        )}
                    </div>
                </div>
                <footer className="details-modal-footer">
                    <button className="btn-danger" onClick={() => onDelete(packageData.package_id)}>Delete Package</button>
                    <button className="btn-primary" onClick={() => onEdit(packageData)}>Update Package</button>
                </footer>
            </div>
        </div>
    );
};

export default PackageDetailsModal;