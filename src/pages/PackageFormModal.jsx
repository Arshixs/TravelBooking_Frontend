import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";

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
        duration_days: packageData.duration_days || "",
        price: packageData.price || "",
        max_capacity: packageData.max_capacity || "",
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
        console.log(response);
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
    <div style={styles.overlay}>
      {" "}
      <div style={styles.modal}>
        {" "}
        <div style={styles.header}>
          {" "}
          <h2 style={styles.title}>
            {packageData ? "Edit Package" : "Create New Package"}{" "}
          </h2>{" "}
          <button style={styles.closeBtn} onClick={onClose}>
            ×{" "}
          </button>{" "}
        </div>{" "}
        <div style={styles.tabs}>
          {" "}
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "package" && styles.tabActive),
            }}
            onClick={() => setActiveTab("package")}
          >
            Package Details{" "}
          </button>{" "}
          {packageData && (
            <button
              style={{
                ...styles.tab,
                ...(activeTab === "itinerary" && styles.tabActive),
              }}
              onClick={() => setActiveTab("itinerary")}
            >
              Itinerary ({itineraryItems.length}){" "}
            </button>
          )}{" "}
        </div>{" "}
        <div style={styles.content}>
          {" "}
          {activeTab === "package" ? (
            <form onSubmit={handlePackageSubmit}>
              {" "}
              <div style={styles.formRow}>
                {" "}
                <div style={styles.formGroup}>
                  {" "}
                  <label style={styles.label}>Package Name *</label>{" "}
                  <input
                    style={styles.input}
                    type="text"
                    value={packageForm.name}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, name: e.target.value })
                    }
                    required
                  />{" "}
                </div>{" "}
                <div style={styles.formGroup}>
                  {" "}
                  <label style={styles.label}>Tour Type *</label>{" "}
                  <select
                    style={styles.input}
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
                    <option value="Adventure">Adventure</option>{" "}
                    <option value="Cultural">Cultural</option>
                    <option value="Leisure">Leisure</option>
                    <option value="Wildlife">Wildlife</option>{" "}
                  </select>{" "}
                </div>{" "}
              </div>{" "}
              <div style={styles.formRow}>
                {" "}
                <div style={styles.formGroup}>
                  {" "}
                  <label style={styles.label}>Duration (Days) *</label>{" "}
                  <input
                    style={styles.input}
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
                  />{" "}
                </div>{" "}
                <div style={styles.formGroup}>
                  {" "}
                  <label style={styles.label}>Price (₹) *</label>{" "}
                  <input
                    style={styles.input}
                    type="number"
                    min="0"
                    value={packageForm.price}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, price: e.target.value })
                    }
                    required
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div style={styles.formRow}>
                {" "}
                <div style={styles.formGroup}>
                  {" "}
                  <label style={styles.label}>Max Capacity *</label>{" "}
                  <input
                    style={styles.input}
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
                  />{" "}
                </div>{" "}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Status *</label>{" "}
                  <select
                    style={styles.input}
                    value={packageForm.status}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, status: e.target.value })
                    }
                    required
                  >
                    {" "}
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="FINISHED">Finished</option>{" "}
                  </select>{" "}
                </div>{" "}
              </div>{" "}
              <div style={styles.formGroup}>
                <label style={styles.label}>Image URL *</label>{" "}
                <input
                  style={styles.input}
                  type="url"
                  value={packageForm.image_url}
                  onChange={(e) =>
                    setPackageForm({
                      ...packageForm,
                      image_url: e.target.value,
                    })
                  }
                  required
                />{" "}
              </div>{" "}
              <div style={styles.formGroup}>
                {" "}
                <label style={styles.label}>Itinerary Summary *</label>{" "}
                <textarea
                  style={{ ...styles.input, ...styles.textarea }}
                  value={packageForm.itinerary_summary}
                  onChange={(e) =>
                    setPackageForm({
                      ...packageForm,
                      itinerary_summary: e.target.value,
                    })
                  }
                  required
                  rows="4"
                />{" "}
              </div>{" "}
              <div style={styles.footer}>
                {" "}
                {packageData && (
                  <button
                    type="button"
                    style={styles.btnDelete}
                    onClick={handleDeletePackage}
                    disabled={loading}
                  >
                    Delete Package{" "}
                  </button>
                )}{" "}
                <div
                  style={{ display: "flex", gap: "10px", marginLeft: "auto" }}
                >
                  {" "}
                  <button
                    type="button"
                    style={styles.btnSecondary}
                    onClick={onClose}
                  >
                    Cancel{" "}
                  </button>{" "}
                  <button
                    type="submit"
                    style={styles.btnPrimary}
                    disabled={loading}
                  >
                    {" "}
                    {loading
                      ? "Saving..."
                      : packageData
                      ? "Update Package"
                      : "Create Package"}{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </form>
          ) : (
            <div>
              {" "}
              <form
                onSubmit={handleItinerarySubmit}
                style={{ marginBottom: "20px" }}
              >
                {" "}
                <div style={styles.formRow}>
                  {" "}
                  <div style={styles.formGroup}>
                    {" "}
                    <label style={styles.label}>Day Number *</label>{" "}
                    <input
                      style={styles.input}
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
                    />{" "}
                  </div>{" "}
                  <div style={styles.formGroup}>
                    {" "}
                    <label style={styles.label}>
                      Duration (minutes) *
                    </label>{" "}
                    <input
                      style={styles.input}
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
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div style={styles.formRow}>
                  {" "}
                  <div style={styles.formGroup}>
                    {" "}
                    <label style={styles.label}>Start Time *</label>{" "}
                    <input
                      style={styles.input}
                      type="datetime-local"
                      value={itineraryForm.start_time}
                      onChange={(e) =>
                        setItineraryForm({
                          ...itineraryForm,
                          start_time: e.target.value,
                        })
                      }
                      required
                    />{" "}
                  </div>{" "}
                  <div style={styles.formGroup}>
                    {" "}
                    <label style={styles.label}>End Time *</label>{" "}
                    <input
                      style={styles.input}
                      type="datetime-local"
                      value={itineraryForm.end_time}
                      onChange={(e) =>
                        setItineraryForm({
                          ...itineraryForm,
                          end_time: e.target.value,
                        })
                      }
                      required
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Title *</label>{" "}
                  <input
                    style={styles.input}
                    type="text"
                    value={itineraryForm.title}
                    onChange={(e) =>
                      setItineraryForm({
                        ...itineraryForm,
                        title: e.target.value,
                      })
                    }
                    required
                  />{" "}
                </div>{" "}
                <div style={styles.formGroup}>
                  {" "}
                  <label style={styles.label}>Description *</label>{" "}
                  <textarea
                    style={{ ...styles.input, ...styles.textarea }}
                    value={itineraryForm.description}
                    onChange={(e) =>
                      setItineraryForm({
                        ...itineraryForm,
                        description: e.target.value,
                      })
                    }
                    required
                    rows="3"
                  />{" "}
                </div>{" "}
                <div style={styles.formRow}>
                  {" "}
                  <div style={styles.formGroup}>
                    {" "}
                    <label style={styles.label}>Street Name *</label>{" "}
                    <input
                      style={styles.input}
                      type="text"
                      value={itineraryForm.street_name}
                      onChange={(e) =>
                        setItineraryForm({
                          ...itineraryForm,
                          street_name: e.target.value,
                        })
                      }
                      required
                    />{" "}
                  </div>{" "}
                  <div style={styles.formGroup}>
                    {" "}
                    <label style={styles.label}>City *</label>{" "}
                    <input
                      style={styles.input}
                      type="text"
                      value={itineraryForm.city}
                      onChange={(e) =>
                        setItineraryForm({
                          ...itineraryForm,
                          city: e.target.value,
                        })
                      }
                      required
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div style={styles.formRow}>
                  {" "}
                  <div style={styles.formGroup}>
                    {" "}
                    <label style={styles.label}>State *</label>{" "}
                    <input
                      style={styles.input}
                      type="text"
                      value={itineraryForm.state}
                      onChange={(e) =>
                        setItineraryForm({
                          ...itineraryForm,
                          state: e.target.value,
                        })
                      }
                      required
                    />{" "}
                  </div>{" "}
                  <div style={styles.formGroup}>
                    {" "}
                    <label style={styles.label}>PIN Code *</label>{" "}
                    <input
                      style={styles.input}
                      type="text"
                      value={itineraryForm.pin}
                      onChange={(e) =>
                        setItineraryForm({
                          ...itineraryForm,
                          pin: e.target.value,
                        })
                      }
                      required
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div style={{ display: "flex", gap: "10px" }}>
                  {" "}
                  {editingItem && (
                    <button
                      type="button"
                      style={styles.btnSecondary}
                      onClick={resetItineraryForm}
                    >
                      Cancel Edit{" "}
                    </button>
                  )}{" "}
                  <button
                    type="submit"
                    style={styles.btnPrimary}
                    disabled={loading}
                  >
                    {" "}
                    {loading
                      ? "Saving..."
                      : editingItem
                      ? "Update Item"
                      : "Add Item"}{" "}
                  </button>{" "}
                </div>{" "}
              </form>{" "}
              <div style={styles.itineraryList}>
                {" "}
                <h3 style={{ margin: "0 0 15px 0", color: "#134686" }}>
                  Itinerary Items{" "}
                </h3>{" "}
                {itineraryItems.length === 0 ? (
                  <p
                    style={{
                      color: "#666",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No itinerary items yet. Add your first item above.{" "}
                  </p>
                ) : (
                  itineraryItems
                    .sort((a, b) => a.day_number - b.day_number)
                    .map((item) => (
                      <div key={item.item_id} style={styles.itineraryCard}>
                        {" "}
                        <div style={styles.itineraryHeader}>
                          {" "}
                          <div>
                            {" "}
                            <span style={styles.dayBadge}>
                              Day {item.day_number}{" "}
                            </span>{" "}
                            <h4 style={{ margin: "5px 0", color: "#134686" }}>
                              {item.title}{" "}
                            </h4>{" "}
                          </div>{" "}
                          <div style={{ display: "flex", gap: "8px" }}>
                            {" "}
                            <button
                              style={styles.btnIconEdit}
                              onClick={() => handleEditItinerary(item)}
                            >
                              Edit{" "}
                            </button>{" "}
                            <button
                              style={styles.btnIconDelete}
                              onClick={() =>
                                handleDeleteItinerary(item.item_id)
                              }
                            >
                              Delete{" "}
                            </button>{" "}
                          </div>{" "}
                        </div>{" "}
                        <p
                          style={{
                            margin: "8px 0",
                            color: "#555",
                            fontSize: "14px",
                          }}
                        >
                          {item.description}{" "}
                        </p>{" "}
                        <div style={{ fontSize: "13px", color: "#777" }}>
                          {" "}
                          <div>
                            {item.city}, {item.state} - {item.pin}{" "}
                          </div>{" "}
                          <div>Duration: {item.duration} minutes</div>{" "}
                        </div>{" "}
                      </div>
                    ))
                )}{" "}
              </div>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "#FDF4E3",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "900px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "2px solid #134686",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FDF4E3",
  },
  title: {
    margin: 0,
    color: "#134686",
    fontSize: "24px",
    fontWeight: "600",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "32px",
    color: "#134686",
    cursor: "pointer",
    padding: "0",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: "1",
  },
  tabs: {
    display: "flex",
    backgroundColor: "#FDF4E3",
    borderBottom: "1px solid #ddd",
  },
  tab: {
    flex: 1,
    padding: "12px 20px",
    border: "none",
    backgroundColor: "transparent",
    color: "#666",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    borderBottom: "3px solid transparent",
    transition: "all 0.2s",
  },
  tabActive: {
    color: "#134686",
    borderBottomColor: "#134686",
  },
  content: {
    padding: "24px",
    overflowY: "auto",
    flex: 1,
  },
  formRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "16px",
  },
  formGroup: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#134686",
    marginBottom: "6px",
  },
  input: {
    padding: "10px 12px",
    border: "2px solid #134686",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "#fff",
    color: "#333",
    outline: "none",
  },
  textarea: {
    resize: "vertical",
    fontFamily: "inherit",
    minHeight: "80px",
  },
  footer: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #ddd",
  },
  btnPrimary: {
    padding: "10px 24px",
    backgroundColor: "#134686",
    color: "#FDF4E3",
    border: "none",
    borderRadius: "4px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  btnSecondary: {
    padding: "10px 24px",
    backgroundColor: "transparent",
    color: "#134686",
    border: "2px solid #134686",
    borderRadius: "4px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnDelete: {
    padding: "10px 24px",
    backgroundColor: "#ED3F27",
    color: "#FDF4E3",
    border: "none",
    borderRadius: "4px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
  },
  itineraryList: {
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "2px solid #ddd",
  },
  itineraryCard: {
    backgroundColor: "#fff",
    border: "2px solid #134686",
    borderRadius: "4px",
    padding: "16px",
    marginBottom: "12px",
  },
  itineraryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
  },
  dayBadge: {
    display: "inline-block",
    backgroundColor: "#FEB21A",
    color: "#134686",
    padding: "4px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
  },
  btnIconEdit: {
    padding: "6px 12px",
    backgroundColor: "#134686",
    color: "#FDF4E3",
    border: "none",
    borderRadius: "4px",
    fontSize: "13px",
    cursor: "pointer",
  },
  btnIconDelete: {
    padding: "6px 12px",
    backgroundColor: "#ED3F27",
    color: "#FDF4E3",
    border: "none",
    borderRadius: "4px",
    fontSize: "13px",
    cursor: "pointer",
  },
};

export default PackageFormModal;
