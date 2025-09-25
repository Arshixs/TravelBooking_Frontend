import React from 'react';
import '../styles/AdminPackageCard.css';


const AdminPackageCard = ({ packageData, onClick }) => { 
    const {
        name,
        tour_type,
        duration_days,
        max_capacity,
        status,
        image_url
    } = packageData;

    const fallbackImage = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400";

    // The onClick handler is now on the main div
    return (
        <div className="admin-package-card" onClick={() => onClick(packageData)}>
            <div className="card-image-wrapper">
                <img 
                    src={image_url || fallbackImage} 
                    alt={name} 
                    className="card-image" 
                />
            </div>
            <div className="card-content">
                <header className="card-header">
                    <h3 className="card-title">{name}</h3>
                    <span className={`status-badge status-${status?.toLowerCase()}`}>
                        {status}
                    </span>
                </header>
                <div className="card-details">
                    <p><span className="detail-label">Type:</span> {tour_type}</p>
                    <p><span className="detail-label">Duration:</span> {duration_days} days</p>
                    <p><span className="detail-label">Capacity:</span> {max_capacity} people</p>
                </div>
            </div>
        </div>
    );
};

export default AdminPackageCard;