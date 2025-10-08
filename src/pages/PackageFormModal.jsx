import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import "../styles/AdminDashboard.css";

const PackageFormModal = ({ packageData, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("package");

  const initialPackageState = {
    name: "",
    tour_type: "",
    image_url: "",
    duration_days: "",
    price: "",
    max_capacity: "",
    itinerary_summary: "",
    status: "UPCOMING",
  };
  const [packageForm, setPackageForm] = useState(initialPackageState);

  const initialItineraryState = {
    day_number: "",
    duration: "",
    start_time: "",
    end_time: "",
    title: "",
    description: "",
    street_name: "",
    city: "",
    state: "",
    pin: "",
  };
  const [itineraryForm, setItineraryForm] = useState(initialItineraryState);

  const [itineraryItems, setItineraryItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (packageData) {
      setPackageForm({
        name: packageData.name || "",
        tour_type: packageData.tour_type || "",
        image_url: packageData.image_url || "",
        duration_days: packageData.duration_days || "",
        price: packageData.price || "",
        max_capacity: packageData.max_capacity || "",
        itinerary_summary: packageData.itinerary_summary || "",
        status: packageData.status || "UPCOMING",
      });
      if (packageData.itinerary) {
        setItineraryItems(packageData.itinerary);
      } else if (packageData.slug) {
        fetchItinerary(packageData.slug);
      }
    }
  }, [packageData]);

  const fetchItinerary = async (packageSlug) => {
    try {
      const response = await axios.get(`packages/${packageSlug}`);
      if (response.data.success && response.data.data.itinerary) {
        setItineraryItems(response.data.data.itinerary);
      }
    } catch (error) {
      console.error("Error fetching itinerary:", error);
      toast.error("Could not fetch itinerary details.");
    }
  };

  // Generic change handlers for forms
  const handlePackageChange = (e) => {
    const { name, value } = e.target;
    setPackageForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItineraryChange = (e) => {
    const { name, value } = e.target;
    setItineraryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (packageData) {
        await axios.put(`/packages/${packageData.slug}`, packageForm);
        toast.success("Package updated successfully");
      } else {
        await axios.post("packages/", packageForm);
        toast.success("Package created successfully");
      }
      onSave();
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error(error.response?.data?.error || "Failed to save package");
    } finally {
      setLoading(false);
    }
  };

  const handleItinerarySubmit = async (e) => {
    e.preventDefault();
    if (!packageData) {
      toast.error("Please save the package before adding itinerary items.");
      return;
    }
    setLoading(true);
    try {
      if (editingItem) {
        const response = await axios.put(
          `packages/${packageData.slug}/${editingItem.item_id}`,
          itineraryForm
        );
        toast.success("Itinerary item updated successfully");
        setItineraryItems(
          itineraryItems.map((item) =>
            item.item_id === editingItem.item_id ? response.data.data : item
          )
        );
      } else {
        const response = await axios.post("packages/itinerary", {
          ...itineraryForm,
          package_id: packageData.packageId,
        });
        toast.success("Itinerary item added successfully");
        setItineraryItems([...itineraryItems, response.data.data]);
      }
      resetItineraryForm();
    } catch (error) {
      console.error("Error saving itinerary item:", error);
      toast.error(
        error.response?.data?.error || "Failed to save itinerary item"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItinerary = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this itinerary item?"))
      return;
    setLoading(true);
    try {
      await axios.delete(`packages/${packageData.slug}/${itemId}`);
      toast.success("Itinerary item deleted successfully");
      setItineraryItems(
        itineraryItems.filter((item) => item.item_id !== itemId)
      );
    } catch (error) {
      console.error("Error deleting itinerary item:", error);
      toast.error("Failed to delete itinerary item");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this package? This action cannot be undone."
      )
    )
      return;
    setLoading(true);
    try {
      await axios.delete(`packages/${packageData.slug}`);
      toast.success("Package deleted successfully");
      onSave();
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error("Failed to delete package");
    } finally {
      setLoading(false);
    }
  };

  const handleEditItinerary = (item) => {
    setEditingItem(item);
    setItineraryForm({
      day_number: item.day_number,
      duration: item.duration,
      start_time: item.start_time?.slice(0, 16) || "",
      end_time: item.end_time?.slice(0, 16) || "",
      title: item.title,
      description: item.description,
      street_name: item.street_name,
      city: item.city,
      state: item.state,
      pin: item.pin,
    });
    window.scrollTo(0, 0); // Scroll to top of modal to see the form
  };

  const resetItineraryForm = () => {
    setEditingItem(null);
    setItineraryForm(initialItineraryState);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{packageData ? "Edit Package" : "Create New Package"}</h2>
          <button className="modal-close" onClick={onClose}>
            x
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab ${activeTab === "package" ? "active" : ""}`}
            onClick={() => setActiveTab("package")}
          >
            Package Details
          </button>
          {packageData && (
            <button
              className={`tab ${activeTab === "itinerary" ? "active" : ""}`}
              onClick={() => setActiveTab("itinerary")}
            >
              Itinerary ({itineraryItems.length})
            </button>
          )}
        </div>

        <div className="modal-body">
          {activeTab === "package" ? (
            <>
              <form onSubmit={handlePackageSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Package Name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={packageForm.name}
                      onChange={handlePackageChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="tour_type">Tour Type *</label>
                    <select
                      id="tour_type"
                      name="tour_type"
                      value={packageForm.tour_type}
                      onChange={handlePackageChange}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Leisure">Leisure</option>
                      <option value="Wildlife">Wildlife</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="duration_days">Duration (Days) *</label>
                    <input
                      id="duration_days"
                      name="duration_days"
                      type="number"
                      min="1"
                      value={packageForm.duration_days}
                      onChange={handlePackageChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="price">Price (₹) *</label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      value={packageForm.price}
                      onChange={handlePackageChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="max_capacity">Max Capacity *</label>
                    <input
                      id="max_capacity"
                      name="max_capacity"
                      type="number"
                      min="1"
                      value={packageForm.max_capacity}
                      onChange={handlePackageChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status *</label>
                    <select
                      id="status"
                      name="status"
                      value={packageForm.status}
                      onChange={handlePackageChange}
                      required
                    >
                      <option value="UPCOMING">Upcoming</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="FINISHED">Finished</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="image_url">Image URL *</label>
                  <input
                    id="image_url"
                    name="image_url"
                    type="url"
                    value={packageForm.image_url}
                    onChange={handlePackageChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="itinerary_summary">Itinerary Summary *</label>
                  <textarea
                    id="itinerary_summary"
                    name="itinerary_summary"
                    value={packageForm.itinerary_summary}
                    onChange={handlePackageChange}
                    required
                    rows="4"
                  ></textarea>
                </div>
              </form>
              <div className="modal-footer">
                {packageData && (
                  <button
                    type="button"
                    className="btn btn-delete"
                    onClick={handleDeletePackage}
                    disabled={loading}
                  >
                    Delete Package
                  </button>
                )}
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : packageData
                    ? "Update Package"
                    : "Create Package"}
                </button>
              </div>
            </>
          ) : (
            <div>
              <form onSubmit={handleItinerarySubmit} className="itinerary-form">
                <h4>
                  {editingItem
                    ? "Edit Itinerary Item"
                    : "Add New Itinerary Item"}
                </h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="day_number">Day Number *</label>
                    <input
                      id="day_number"
                      name="day_number"
                      type="number"
                      min="1"
                      value={itineraryForm.day_number}
                      onChange={handleItineraryChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="duration">Duration (minutes) *</label>
                    <input
                      id="duration"
                      name="duration"
                      type="number"
                      min="1"
                      value={itineraryForm.duration}
                      onChange={handleItineraryChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="start_time">Start Time *</label>
                    <input
                      id="start_time"
                      name="start_time"
                      type="datetime-local"
                      value={itineraryForm.start_time}
                      onChange={handleItineraryChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="end_time">End Time *</label>
                    <input
                      id="end_time"
                      name="end_time"
                      type="datetime-local"
                      value={itineraryForm.end_time}
                      onChange={handleItineraryChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={itineraryForm.title}
                    onChange={handleItineraryChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={itineraryForm.description}
                    onChange={handleItineraryChange}
                    required
                    rows="3"
                  ></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="street_name">Street Name *</label>
                    <input
                      id="street_name"
                      name="street_name"
                      type="text"
                      value={itineraryForm.street_name}
                      onChange={handleItineraryChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={itineraryForm.city}
                      onChange={handleItineraryChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      value={itineraryForm.state}
                      onChange={handleItineraryChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="pin">PIN Code *</label>
                    <input
                      id="pin"
                      name="pin"
                      type="text"
                      value={itineraryForm.pin}
                      onChange={handleItineraryChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-actions">
                  {editingItem && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={resetItineraryForm}
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : editingItem
                      ? "Update Item"
                      : "Add Item"}
                  </button>
                </div>
              </form>
              <div className="itinerary-list">
                <h3>Itinerary Items</h3>
                {itineraryItems.length === 0 ? (
                  <p>No itinerary items yet. Add one above.</p>
                ) : (
                  itineraryItems
                    .sort((a, b) => a.day_number - b.day_number)
                    .map((item) => (
                      <div key={item.item_id} className="itinerary-card">
                        <div className="itinerary-header">
                          <div>
                            <span className="day-badge">
                              Day {item.day_number}
                            </span>
                            <h4>{item.title}</h4>
                          </div>
                          <div className="actions">
                            <button
                              className="btn-icon-edit"
                              onClick={() => handleEditItinerary(item)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-icon-delete"
                              onClick={() =>
                                handleDeleteItinerary(item.item_id)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="description">{item.description}</p>
                        <div className="details">
                          <div>
                            {item.city}, {item.state} - {item.pin}
                          </div>
                          <div>Duration: {item.duration} minutes</div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageFormModal;
