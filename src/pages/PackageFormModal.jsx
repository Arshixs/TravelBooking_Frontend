import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import "../styles/PackageFormModal.css"; 

const CloseIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const TrashIcon = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const PackageFormModal = ({ packageData, onClose, onSave }) => {
    const [formData, setFormData] = useState({
    name: "",
    tour_type: "",
    duration_days: 1,
    max_capacity: 10,
    itinerary_summary: "",
    status: "Draft",
    image_url: "",
    itinerary: [{ day_number: 1, title: "", description: "" }],
    });
    const [activeTab, setActiveTab] = useState("details");

    useEffect(() => {
        if (packageData) {
            // If editing, fetch full package details including itinerary
            const fetchFullPackage = async () => {
                try {
                    const response = await axios.get(`/api/packages/${packageData.package_id}`);
                    setFormData({
                        ...response.data,
                        itinerary: response.data.itinerary || [{ day_number: 1, title: "", description: "" }],
                    });
                } catch (error) {
                    console.error("Failed to fetch full package details", error);
                    // Fallback to basic data if fetch fails
                    setFormData({
                        ...packageData,
                        itinerary: packageData.itinerary || [{ day_number: 1, title: "", description: "" }],
                    });
                }
            };
            fetchFullPackage();
        }
    }, [packageData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItineraryChange = (index, e) => {
        const { name, value } = e.target;
        const newItinerary = [...formData.itinerary];
        newItinerary[index] = { ...newItinerary[index], [name]: value };
        setFormData(prev => ({ ...prev, itinerary: newItinerary }));
    };

    const addItineraryItem = () => {
        const lastDay = formData.itinerary.length > 0 ? formData.itinerary[formData.itinerary.length - 1].day_number : 0;
        setFormData(prev => ({
            ...prev,
            itinerary: [...prev.itinerary, { day_number: lastDay + 1, title: "", description: "" }]
        }));
    };

    const removeItineraryItem = (index) => {
        const newItinerary = formData.itinerary.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, itinerary: newItinerary }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (packageData) {
                // Update existing package
                await axios.put(`/api/packages/${packageData.package_id}`, formData);
                alert("Package updated successfully!");
            } else {
                // Create new package
                await axios.post("/api/packages", formData);
                alert("Package created successfully!");
            }
            onSave();
        } catch (error) {
            alert("Failed to save package.");
            console.error(error);
        }
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{packageData ? "Edit Tour Package" : "Add New Tour Package"}</h2>
                    <button className="btn-icon close-modal-btn" onClick={onClose}><CloseIcon /></button>
                </header>
                
                <div className="modal-tabs">
                    <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
                        Package Details
                    </button>
                    <button className={`tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`} onClick={() => setActiveTab('itinerary')}>
                        Itinerary
                    </button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {activeTab === 'details' && (
                            <div className="form-section">
                                <h3 className="form-section-title">Package Details</h3>
                                <div className="form-grid">
                                    <div className="input-group full-width">
                                        <label htmlFor="name">Package Name</label>
                                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                                    </div>

                                    {/*Image URL Input */}
                                    <div className="input-group full-width">
                                        <label htmlFor="image_url">Image URL</label>
                                        <input type="url" id="image_url" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="tour_type">Tour Type</label>
                                        <input type="text" id="tour_type" name="tour_type" value={formData.tour_type} onChange={handleChange} placeholder="e.g., Adventure, Cultural" />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="status">Status</label>
                                        <select id="status" name="status" value={formData.status} onChange={handleChange}>
                                            <option value="Draft">Draft</option>
                                            <option value="Published">Published</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="duration_days">Duration (days)</label>
                                        <input type="number" id="duration_days" name="duration_days" value={formData.duration_days} onChange={handleChange} min="1" required />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="max_capacity">Max Capacity</label>
                                        <input type="number" id="max_capacity" name="max_capacity" value={formData.max_capacity} onChange={handleChange} min="1" required />
                                    </div>
                                    <div className="input-group full-width">
                                        <label htmlFor="itinerary_summary">Itinerary Summary</label>
                                        <textarea id="itinerary_summary" name="itinerary_summary" value={formData.itinerary_summary} onChange={handleChange} rows="4" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'itinerary' && (
                            <div className="form-section itinerary-container">
                                <h3 className="form-section-title">Daily Itinerary</h3>
                                {formData.itinerary.map((item, index) => (
                                    <div key={index} className="itinerary-item">
                                        <h4><span className="day-label">Day {item.day_number}</span></h4>
                                        <div className="itinerary-item-form">
                                            <input type="text" name="title" placeholder="Activity Title (e.g., City Tour)" value={item.title} onChange={(e) => handleItineraryChange(index, e)} required />
                                            <textarea name="description" placeholder="Activity Description..." value={item.description} onChange={(e) => handleItineraryChange(index, e)} rows="3" />
                                        </div>
                                        <button type="button" className="btn-icon remove-item-btn" onClick={() => removeItineraryItem(index)}><TrashIcon/></button>
                                    </div>
                                ))}
                                <button type="button" className="btn-secondary add-item-btn" onClick={addItineraryItem}>
                                    Add Day / Activity
                                </button>
                            </div>
                        )}
                    </div>
                    <footer className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Package</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default PackageFormModal;