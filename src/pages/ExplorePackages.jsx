import React, { useState, useEffect } from 'react';
import PackageCard from '../components/PackageCard';
import '../styles/ExplorePackages.css';

// --- Sample Data ---
const packagesData = [
    {
        id: 1,
        name: "Majestic Himalayan Trek",
        type: "Adventure",
        duration: 10,
        capacity: 15,
        rating: 4.8,
        price: 1200,
        description: "A challenging trek through the stunning peaks and valleys. Experience the Himalayas with professional guides.",
        link: "/packages/himalayan-trek-1",
        image: "https://i.imgur.com/2Y4p5v6.png" // AI-Inspired: Icy blue mountain peak
    },
    {
        id: 2,
        name: "Historic Parisian Culture",
        type: "Culture",
        duration: 5,
        capacity: 25,
        rating: 4.5,
        price: 850,
        description: "Explore the art, history, and cuisine of Paris. Visit iconic landmarks and enjoy local wine tasting.",
        link: "/packages/paris-culture-2",
        image: "https://i.imgur.com/x07Z5V2.png" // AI-Inspired: Sunset on a European historical city street
    },
    {
        id: 3,
        name: "Tropical Coastal Retreat",
        type: "Relaxation",
        duration: 7,
        capacity: 10,
        rating: 4.9,
        price: 950,
        description: "Seven days of pure relaxation on a secluded beach. Yoga, spa treatments, and gourmet seafood included.",
        link: "/packages/coastal-relax-3",
        image: "https://i.imgur.com/Y3gQ3Jq.png" // AI-Inspired: White sand beach with turquoise water
    },
    {
        id: 4,
        name: "Lush Amazon Wildlife Safari",
        type: "Wildlife",
        duration: 14,
        capacity: 8,
        rating: 4.7,
        price: 2500,
        description: "An immersive exploration deep into the Amazon rainforest, observing unique flora and fauna with expert biologists.",
        link: "/packages/amazon-safari-4",
        image: "https://i.imgur.com/W2d3sH8.png" // AI-Inspired: Dense, foggy green rainforest canopy
    },
];

const ExplorePackages = () => {
    const [filterType, setFilterType] = useState('All');
    const [filteredPackages, setFilteredPackages] = useState(packagesData);

    useEffect(() => {
        if (filterType === 'All') {
            setFilteredPackages(packagesData);
        } else {
            const newFiltered = packagesData.filter(pkg => pkg.type === filterType);
            setFilteredPackages(newFiltered);
        }
    }, [filterType]);

    const handleCardClick = (link) => {
        // Placeholder for React Router navigation
        console.log(`Simulated Redirecting to: ${link}`);
        alert(`Redirecting to details page: ${link}`);
    };

    return (
        <div className="explore-page">
            <header className="explore-header">
                <h1>Discover Your Next <span className="header-highlight">Adventure</span></h1>
                <p>Curated travel packages to make your dreams come true.</p>
            </header>

            <main className="content-area container">
                
                {/* Filter Section */}
                <aside className="filter-section">
                    <h2 className="filter-title">Filter Your Trip</h2>
                    <div className="filter-group">
                        <label htmlFor="type-filter">Package Type:</label>
                        <select 
                            id="type-filter" 
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="All">All Packages</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Culture">Culture</option>
                            <option value="Relaxation">Relaxation</option>
                            <option value="Wildlife">Wildlife</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Max Price (Placeholder)</label>
                        <input type="range" disabled title="Not Implemented Yet"/>
                    </div>
                    <button className="btn-filter-apply">Apply Filters</button>
                </aside>

                {/* Package Cards Container */}
                <section className="packages-grid">
                    {filteredPackages.length > 0 ? (
                        filteredPackages.map(pkg => (
                            <PackageCard 
                                key={pkg.id} 
                                packageData={pkg} 
                                onClick={handleCardClick}
                            />
                        ))
                    ) : (
                        <p className="no-packages">
                            No packages of type **{filterType}** found.
                        </p>
                    )}
                </section>
            </main>
        </div>
    );
};

export default ExplorePackages;