import React, { useState, useEffect } from "react";
// import axios from "../utils/axios"; // Kept commented
import PackageFormModal from "../components/PackageFormModal";
import AdminPackageCard from "../components/AdminPackageCard";
import PackageDetailsModal from "../components/PackageDetailsModal";
import "../styles/TourPackages.css";

// REMOVE (Import for mock data)
import { mockPackages } from "../mockPackages"

const PlusIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

const TourPackages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Updated state to manage two separate modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);

    // --- Data Fetching ---
    // (This is the version that would use your backend)
    // const fetchPackages = async () => {
    //     try {
    //         setLoading(true);
    //         const response = await axios.get("/api/packages");
    //         setPackages(Array.isArray(response.data) ? response.data : []);
    //         setError(null);
    //     } catch (err) {
    //         setError("Failed to fetch tour packages.");
    //         console.error(err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // REMOVE (This is the mock data version for frontend testing)
    const fetchPackages = () => {
        setLoading(true);
        setTimeout(() => {
            setPackages(mockPackages);
            setLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchPackages();
    }, []); // Removed the duplicate useEffect

    // --- NEW MODAL WORKFLOW HANDLERS ---

    // 1. User clicks a card to open the details view
    const handleCardClick = (pkg) => {
        setSelectedPackage(pkg);
        setIsDetailsModalOpen(true);
    };

    // 2. User clicks "Update" in the details modal
    const handleEditRequest = (pkg) => {
        setIsDetailsModalOpen(false); // Close details modal
        setEditingPackage(pkg);
        setIsFormModalOpen(true);    // Open form modal for editing
    };

    // 3. User clicks "Delete" in the details modal
    const handleDeleteRequest = (packageId) => {
        setIsDetailsModalOpen(false);
        if (window.confirm("Are you sure you want to delete this package?")) {
            // This would be an axios.delete() call in a real app
            setPackages(prevPackages => prevPackages.filter(p => p.package_id !== packageId));
            alert("Package deleted locally!");
        }
    };
    
    // --- FORM MODAL HANDLERS ---
    
    // Handles clicking the "Add New Package" button
    const handleAddRequest = () => {
        setEditingPackage(null);
        setIsFormModalOpen(true);
    };
    
    // Handles saving data from the form (for both create and update)
    const handleModalSave = (savedPackage) => {
        setIsFormModalOpen(false);
        if (editingPackage) {
            // Logic to update an existing package in the local state
            setPackages(prev => prev.map(p => (p.package_id === savedPackage.package_id ? savedPackage : p)));
        } else {
            // Logic to add a new package to the local state
            const newPackage = { ...savedPackage, package_id: Date.now() }; // Create a temporary unique ID
            setPackages(prev => [newPackage, ...prev]);
        }
    };
    
    if (loading) return <div className="status-message">Loading packages...</div>;
    if (error) return <div className="status-message error">{error}</div>;

    return (
        <div className="packages-page">
            <header className="packages-header">
                <h1>Manage Tour Packages</h1>
                <button className="btn-primary add-package-btn" onClick={handleAddRequest}>
                    <PlusIcon /> Add New Package
                </button>
            </header>

            <main className="packages-grid container">
                {packages.length > 0 ? (
                    packages.map((pkg) => (
                        <AdminPackageCard
                            key={pkg.package_id}
                            packageData={pkg}
                            onClick={handleCardClick} // Card now has a single onClick handler
                        />
                    ))
                ) : (
                    <div className="no-data-message">
                        <h3>No tour packages found.</h3>
                        <p>Click "Add New Package" to get started.</p>
                    </div>
                )}
            </main>

            {/* Render the Details Modal */}
            {isDetailsModalOpen && (
                <PackageDetailsModal
                    packageData={selectedPackage}
                    onClose={() => setIsDetailsModalOpen(false)}
                    onEdit={handleEditRequest}
                    onDelete={handleDeleteRequest}
                />
            )}

            {/* Render the Form Modal for Add/Edit */}
            {isFormModalOpen && (
                <PackageFormModal
                    packageData={editingPackage}
                    onClose={() => setIsFormModalOpen(false)}
                    onSave={handleModalSave}
                />
            )}
        </div>
    );
};

export default TourPackages;