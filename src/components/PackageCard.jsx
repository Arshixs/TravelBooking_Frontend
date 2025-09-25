import React from 'react';
import '../styles/PackageCard.css';

const PackageCard = ({ packageData, onClick }) => {
    const { 
        name, 
        type, 
        duration, 
        capacity, 
        rating, 
        price, 
        description, 
        link,
        image 
    } = packageData;

    const formattedPrice = price.toLocaleString();

    return (
        <div 
            className="package-card" 
            role="button"
            tabIndex="0"
            aria-label={`View details for ${name}`}
        >
            <div className="card-image-wrapper">
                <img src={image} alt={name} className="card-image" />
                <div className="card-tag card-tag-primary">{type}</div>
            </div>

            <div className="card-content">
                <h3 className="package-name">{name}</h3>
                
                <p className="package-description">{description}</p>

                <div className="package-details-grid">
                    {/* UPDATED LINES BELOW: Using <strong> for bold title */}
                    <p><strong>Duration:</strong> {duration} Days</p>
                    <p><strong>Capacity:</strong> {capacity}</p>
                    <p><strong>Rating:</strong> <span className="rating-stars">{rating}</span></p>
                    {/* Add Type back here if desired, or keep it as a tag */}
                </div>
                
                <div className="card-footer">
                    <p className="package-pricing">
                        From Rs. <strong>{formattedPrice}</strong>
                    </p>
                    <button className="btn-explore-card" onClick={() => onClick(link)}>
                        View Details &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PackageCard;