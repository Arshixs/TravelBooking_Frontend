import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import "../styles/PackageFormModal.css"; // Imports the CSS file

const PackageFormModal = ({ packageData, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("package");
  const [packageForm, setPackageForm] = useState({
    name: "",
    tour_type: "",
    image_url: "",
    duration_days: "",
    price: "",
    max_capacity: "",
    itinerary_summary: "",
    status: "UPCOMING",
  });
  const [itineraryItems, setItineraryItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [itineraryForm, setItineraryForm] = useState({
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
  });

  useEffect(() => {
    if (packageData) {
      setPackageForm({
        name: packageData.name || "",
        tour_type: packageData.tour_type || "",
        image_url: packageData.image_url || "",
        // Ensure numeric fields are converted, though they will be strings in the input value
        duration_days: String(packageData.duration_days) || "",
        price: String(packageData.price) || "",
        max_capacity: String(packageData.max_capacity) || "",
        itinerary_summary: packageData.itinerary_summary || "",
        status: packageData.status || "UPCOMING",
      });
      if (packageData.itinerary) {
        setItineraryItems(packageData.itinerary);
      } else {
        fetchItinerary(packageData.slug);
      }
    }
  }, [packageData]);

  const fetchItinerary = async (packageId) => {
    try {
      const response = await axios.get(`packages/${packageId}`);
      if (response.data.success && response.data.data.itinerary) {
        setItineraryItems(response.data.data.itinerary);
      }
    } catch (error) {
      console.error("Error fetching itinerary:", error);
    }
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (packageData) {
        response = await axios.put(
          `/packages/${packageData.slug}`,
          packageForm
        );
        toast.success("Package updated successfully");
      } else {
        response = await axios.post("packages/", packageForm);
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
      toast.error(
        "Please save the package first before adding itinerary items"
      );
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        const response = await axios.put(
          // Ensure packageData.slug and item_id are correct identifiers for the PUT endpoint
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
          // Assuming packageData.packageId is the correct ID to link the itinerary item
          package_id: packageData.packageId,
        });
        toast.success("Itinerary item added successfully");
        // Ensure the newly added item has a unique key/ID from the backend response
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
      // Endpoint is assumed to be `packages/:slug/:itemId`
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
      onSave(); // Close modal and refresh parent list
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
      // Slice date-time to fit HTML datetime-local input format (YYYY-MM-DDThh:mm)
      start_time: item.start_time?.slice(0, 16) || "",
      end_time: item.end_time?.slice(0, 16) || "",
      title: item.title,
      description: item.description,
      street_name: item.street_name,
      city: item.city,
      state: item.state,
      pin: item.pin,
    });
  };

  const resetItineraryForm = () => {
    setEditingItem(null);
    setItineraryForm({
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
    });
  };

  return (
    <div className="overlay">
      <div className="modal">
        <div className="header">
          <h2 className="title">
            {packageData ? "Edit Package" : "Create New Package"}
          </h2>
          <button className="closeBtn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === "package" ? "tabActive" : ""}`}
            onClick={() => setActiveTab("package")}
          >
            Package Details
          </button>

          {packageData && (
            <button
              className={`tab ${activeTab === "itinerary" ? "tabActive" : ""}`}
              onClick={() => setActiveTab("itinerary")}
            >
              Itinerary ({itineraryItems.length})
            </button>
          )}
        </div>

        <div className="content">
          {activeTab === "package" ? (
            <form onSubmit={handlePackageSubmit}>
              <div className="formRow">
                <div className="formGroup">
                  <label className="label">Package Name *</label>
                  <input
                    className="input"
                    type="text"
                    value={packageForm.name}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="formGroup">
                  <label className="label">Tour Type *</label>
                  <select
                    className="input"
                    value={packageForm.tour_type}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        tour_type: e.target.value,
                      })
                    }
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

              <div className="formRow">
                <div className="formGroup">
                  <label className="label">Duration (Days) *</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={packageForm.duration_days}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        duration_days: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="formGroup">
                  <label className="label">Price (₹) *</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={packageForm.price}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, price: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label className="label">Max Capacity *</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={packageForm.max_capacity}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        max_capacity: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="formGroup">
                  <label className="label">Status *</label>
                  <select
                    className="input"
                    value={packageForm.status}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, status: e.target.value })
                    }
                    required
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ACTIVE">Active</option>
                    <option value="FINISHED">Finished</option>
                  </select>
                </div>
              </div>

              <div className="formGroup">
                <label className="label">Image URL *</label>
                <input
                  className="input"
                  type="url"
                  value={packageForm.image_url}
                  onChange={(e) =>
                    setPackageForm({
                      ...packageForm,
                      image_url: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="formGroup">
                <label className="label">Itinerary Summary *</label>
                <textarea
                  // Use both input and textarea classes for combined base/resize styles
                  className="input textarea"
                  value={packageForm.itinerary_summary}
                  onChange={(e) =>
                    setPackageForm({
                      ...packageForm,
                      itinerary_summary: e.target.value,
                    })
                  }
                  required
                  rows="4"
                />
              </div>

              <div className="footer">
                {packageData && (
                  <button
                    type="button"
                    className="btnDelete"
                    onClick={handleDeletePackage}
                    disabled={loading}
                  >
                    Delete Package
                  </button>
                )}
                <div
                  style={{ display: "flex", gap: "10px", marginLeft: "auto" }}
                >
                  <button
                    type="button"
                    className="btnSecondary"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btnPrimary"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : packageData
                      ? "Update Package"
                      : "Create Package"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div>
              <form
                onSubmit={handleItinerarySubmit}
                style={{ marginBottom: "20px" }} // Keep simple inline styles for layout/margins
              >
                <div className="formRow">
                  <div className="formGroup">
                    <label className="label">Day Number *</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={itineraryForm.day_number}
                      onChange={(e) =>
                        setItineraryForm({
                          ...itineraryForm,
                          day_number: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="formGroup">
                    <label className="label">Duration (minutes) *</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={itineraryForm.duration}
                      onChange={(e) =>
                        setItineraryForm({
                          ...itineraryForm,
                          duration: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label className="label">Start Time *</label>
                    <input
                      className="input"
                      type="datetime-local"
                      value={itineraryForm.start_time}
                      onChange={(e) =>
                        setItineraryForm({
                          ...itineraryForm,
                          start_time: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="formGroup">
                    <label className="label">End Time *</label>
                    <input
                      className="input"
                      type="datetime-local"
                      value={itineraryForm.end_time}
                      onChange={(e) =>
                        setItineraryForm({
                          ...itineraryForm,
                          end_time: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="formGroup">
                  <label className="label">Title *</label>
                  <input
                    className="input"
                    type="text"
                    value={itineraryForm.title}
                    onChange={(e) =>
                      setItineraryForm({
                        ...itineraryForm,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="formGroup">
                  <label className="label">Description *</label>
                  <textarea
                    className="input textarea"
                    value={itineraryForm.description}
                    onChange={(e) =>
                      setItineraryForm({
                        ...itineraryForm,
                        description: e.target.value,
                      })
                    }
                    required
                    rows="3"
                  />
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label className="label">Street Name *</label>
                    <input
                      className="input"
                      type="text"
                      value={itineraryForm.street_name}
                      onChange={(e) =>
                        setItineraryForm({
                          ...itineraryForm,
                          street_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="formGroup">
                    <label className="label">City *</label>
                    <input
                      className="input"
                      type="text"
                      value={itineraryForm.city}
                      onChange={(e) =>
                        setItineraryForm({
                          ...itineraryForm,
                          city: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label className="label">State *</label>
                    <input
                      className="input"
                      type="text"
                      value={itineraryForm.state}
                      onChange={(e) =>
                        setItineraryForm({
                          ...itineraryForm,
                          state: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="formGroup">
                    <label className="label">PIN Code *</label>
                    <input
                      className="input"
                      type="text"
                      value={itineraryForm.pin}
                      onChange={(e) =>
                        setItineraryForm({
                          ...itineraryForm,
                          pin: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  {editingItem && (
                    <button
                      type="button"
                      className="btnSecondary"
                      onClick={resetItineraryForm}
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btnPrimary"
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

              <div className="itineraryList">
                <h3 style={{ margin: "0 0 15px 0", color: "#134686" }}>
                  Itinerary Items
                </h3>
                {itineraryItems.length === 0 ? (
                  <p
                    style={{
                      color: "#666",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No itinerary items yet. Add your first item above.
                  </p>
                ) : (
                  itineraryItems
                    .sort((a, b) => a.day_number - b.day_number)
                    .map((item) => (
                      <div key={item.item_id} className="itineraryCard">
                        <div className="itineraryHeader">
                          <div>
                            <span className="dayBadge">
                              Day {item.day_number}
                            </span>
                            <h4 style={{ margin: "5px 0", color: "#134686" }}>
                              {item.title}
                            </h4>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="btnIconEdit"
                              onClick={() => handleEditItinerary(item)}
                            >
                              Edit
                            </button>
                            <button
                              className="btnIconDelete"
                              onClick={() =>
                                handleDeleteItinerary(item.item_id)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p
                          style={{
                            margin: "8px 0",
                            color: "#555",
                            fontSize: "14px",
                          }}
                        >
                          {item.description}
                        </p>
                        <div style={{ fontSize: "13px", color: "#777" }}>
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

// REMOVE THE STYLES OBJECT
export default PackageFormModal;
