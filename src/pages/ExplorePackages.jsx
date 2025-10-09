import React, { useState, useEffect } from 'react';
import PackageCard from '../components/PackageCard';
import '../styles/ExplorePackages.css';
import axios from 'axios';

// Fetch packages data from backend API
const fetchPackages = async () => {
    try {
        const response = await axios.get('packages/');
        console.log("Hello from fetchPackages");
        console.log(response);
        return response.data;
    } catch (error) {
        console.error('Error fetching packages:', error);
        return [];
    }
};

const ExplorePackages = () => {
    console.log('ExplorePackages Component Rendered');
    const [filterType, setFilterType] = useState('All');
    const [packagesData, setPackagesData] = useState([]);
    const [filteredPackages, setFilteredPackages] = useState([]);

    useEffect(() => {
        // Fetch packages on mount
        fetchPackages().then(data => {
            const safeData = Array.isArray(data) ? data : [];
            setPackagesData(safeData);
            setFilteredPackages(safeData);
        });
    }, []);

    useEffect(() => {
        console.log('Filter Type Changed:', filterType);
        if (filterType === 'All') {
            console.log(packagesData);
            setFilteredPackages(packagesData);
        } else {
            const newFiltered = packagesData.filter(pkg => pkg.type === filterType);
            setFilteredPackages(newFiltered);
        }
    }, [filterType, packagesData]);

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
                            onChange={(e) => { console.log(e.target.value); setFilterType(e.target.value)}}
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
                            No packages of type <b>{filterType}</b> found.
                        </p>
                    )}
                </section>
            </main>
        </div>
    );
};

export default ExplorePackages;