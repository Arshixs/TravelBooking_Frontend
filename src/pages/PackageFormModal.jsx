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

  // --- Hotel State ---
  const [allHotels, setAllHotels] = useState([]); // For the dropdown
  const [includedHotels, setIncludedHotels] = useState([]); // Hotels in this package
  const [availableRooms, setAvailableRooms] = useState([]); // Rooms for selected hotel
  const [selectedHotelDetails, setSelectedHotelDetails] = useState(null); // Full hotel details
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null); // Full room details
  const [hotelForm, setHotelForm] = useState({
    hotel_id: "",
    room_id: "",
    check_in_day: "",
    check_out_day: "",
  });

  // --- Data Fetching Effects ---
  useEffect(() => {
    // Fetch the list of all available hotels for the dropdown
    const fetchAllHotels = async () => {
      try {
        const response = await axios.get("/hotels/");
        if (response.data.success) {
          setAllHotels(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching all hotels:", error);
        toast.error("Failed to load hotel list.");
      }
    };

    fetchAllHotels();
  }, []);

  useEffect(() => {
    if (packageData) {
      setPackageForm({
        name: packageData.name || "",
        tour_type: packageData.tour_type || "",
        image_url: packageData.image_url || "",
        duration_days: String(packageData.duration_days) || "",
        price: String(packageData.price) || "",
        max_capacity: String(packageData.max_capacity) || "",
        itinerary_summary: packageData.itinerary_summary || "",
        status: packageData.status || "UPCOMING",
      });

      // Fetch Itinerary & Hotels for this specific package
      const fetchPackageDetails = async (packageSlug) => {
        try {
          const response = await axios.get(`packages/${packageSlug}`);
          if (response.data.success) {
            if (response.data.data.itinerary) {
              setItineraryItems(response.data.data.itinerary);
            }
            if (response.data.data.hotel_rooms) {
              setIncludedHotels(response.data.data.hotel_rooms);
            }
          }
        } catch (error) {
          console.error("Error fetching package details:", error);
        }
      };

      fetchPackageDetails(packageData.slug);
    }
  }, [packageData]);

  // --- Main Package Submit ---
  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const packageDataForAPI = {
        ...packageForm,
        duration_days: Number(packageForm.duration_days),
        price: Number(packageForm.price),
        max_capacity: Number(packageForm.max_capacity),
      };

      if (packageData) {
        // --- UPDATE LOGIC ---
        await axios.put(`/packages/${packageData.slug}`, packageDataForAPI);
        toast.success("Package updated successfully");
        onSave();
      } else {
        // --- CREATE LOGIC (3-STEP PROCESS) ---

        // Step 1: Create the package
        const packageResponse = await axios.post(
          "packages/",
          packageDataForAPI
        );
        const newPackage = packageResponse.data.data;
        toast.success("Package created successfully!");

        // Step 2: Bulk-create Itinerary items
        if (itineraryItems.length > 0) {
          const itineraryDataForAPI = itineraryItems.map((item) => ({
            package_id: newPackage.packageId,
            day_number: Number(item.day_number),
            duration: Number(item.duration),
            start_time: item.start_time + ":00",
            end_time: item.end_time + ":00",
            title: item.title,
            description: item.description,
            street_name: item.street_name,
            city: item.city,
            state: item.state,
            pin: item.pin,
          }));
          await axios.post("packages/itineraries", itineraryDataForAPI);
          toast.success("Itinerary items added successfully!");
        }

        // Step 3: Bulk-create Hotel Inclusions
        if (includedHotels.length > 0) {
          const hotelDataForAPI = includedHotels.map((hotel) => ({
            package_id: newPackage.packageId,
            hotel_id: Number(hotel.hotel_id),
            room_id: Number(hotel.room_id),
            check_in_day: Number(hotel.check_in_day),
            check_out_day: Number(hotel.check_out_day),
          }));
          await axios.post("packages/rooms", hotelDataForAPI);
          toast.success("Hotel inclusions added successfully!");
        }

        onSave();
      }
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error(error.response?.data?.error || "Failed to save package");
    } finally {
      setLoading(false);
    }
  };

  // --- Itinerary Handlers ---
  const handleItinerarySubmit = async (e) => {
    e.preventDefault();
    if (packageData) {
      setLoading(true);
      try {
        const itineraryItemForAPI = {
          ...itineraryForm,
          day_number: Number(itineraryForm.day_number),
          duration: Number(itineraryForm.duration),
          start_time: itineraryForm.start_time + ":00",
          end_time: itineraryForm.end_time + ":00",
        };
        if (editingItem) {
          const response = await axios.put(
            `packages/${packageData.slug}/${editingItem.item_id}`,
            itineraryItemForAPI
          );
          setItineraryItems(
            itineraryItems.map((item) =>
              item.item_id === editingItem.item_id ? response.data.data : item
            )
          );
          toast.success("Itinerary item updated");
        } else {
          const response = await axios.post("packages/itinerary", {
            ...itineraryItemForAPI,
            package_id: packageData.packageId,
          });
          setItineraryItems([...itineraryItems, response.data.data]);
          toast.success("Itinerary item added");
        }
        resetItineraryForm();
      } catch (error) {
        console.error("Error saving itinerary item:", error);
        toast.error("Failed to save itinerary item");
      } finally {
        setLoading(false);
      }
    } else {
      const newItem = { ...itineraryForm, item_id: Date.now() };
      setItineraryItems([...itineraryItems, newItem]);
      toast.success("Itinerary item added locally");
      resetItineraryForm();
    }
  };

  const handleDeleteItinerary = async (itemId) => {
    if (!window.confirm("Delete this itinerary item?")) return;
    if (packageData) {
      setLoading(true);
      try {
        await axios.delete(`packages/${packageData.slug}/${itemId}`);
        setItineraryItems(
          itineraryItems.filter((item) => item.item_id !== itemId)
        );
        toast.success("Itinerary item deleted");
      } catch (error) {
        toast.error("Failed to delete item");
      } finally {
        setLoading(false);
      }
    } else {
      setItineraryItems(
        itineraryItems.filter((item) => item.item_id !== itemId)
      );
      toast.success("Itinerary item removed locally");
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

  // --- Hotel Handlers ---
  // Fetch rooms when hotel is selected
  const handleHotelSelect = async (hotelId) => {
    setHotelForm({
      hotel_id: hotelId,
      room_id: "",
      check_in_day: hotelForm.check_in_day,
      check_out_day: hotelForm.check_out_day,
    });
    setAvailableRooms([]);
    setSelectedHotelDetails(null);
    setSelectedRoomDetails(null);

    if (!hotelId) return;

    try {
      const response = await axios.get(`/hotels/${hotelId}/`);
      if (response.data.hotel && response.data.rooms) {
        setSelectedHotelDetails(response.data.hotel);
        setAvailableRooms(response.data.rooms);
      }
    } catch (error) {
      console.error("Error fetching hotel rooms:", error);
      toast.error("Failed to load rooms for this hotel");
    }
  };

  // Update room details when room type is selected
  const handleRoomSelect = (roomId) => {
    setHotelForm({ ...hotelForm, room_id: roomId });

    if (roomId) {
      const room = availableRooms.find((r) => r.room_id === Number(roomId));
      setSelectedRoomDetails(room || null);
    } else {
      setSelectedRoomDetails(null);
    }
  };

  const handleHotelFormSubmit = async (e) => {
    e.preventDefault();
    const hotelDataForAPI = {
      hotel_id: Number(hotelForm.hotel_id),
      room_id: Number(hotelForm.room_id),
      check_in_day: Number(hotelForm.check_in_day),
      check_out_day: Number(hotelForm.check_out_day),
    };

    // Find the full hotel details from the allHotels list
    const addedHotelDetails = allHotels.find(
      (h) => h.hotel_id === hotelDataForAPI.hotel_id
    );

    if (packageData) {
      setLoading(true);
      try {
        await axios.post("packages/room", {
          ...hotelDataForAPI,
          package_id: packageData.packageId,
        });

        toast.success("Hotel inclusion added successfully");

        // Refetch package details to get complete hotel and room data
        const response = await axios.get(`packages/${packageData.slug}`);
        if (response.data.success && response.data.data.hotel_rooms) {
          setIncludedHotels(response.data.data.hotel_rooms);
        }

        resetHotelForm();
      } catch (error) {
        console.error("Error adding hotel inclusion:", error);
        toast.error(error.response?.data?.error || "Failed to add hotel");
      } finally {
        setLoading(false);
      }
    } else {
      // New package, add to local state
      // Map to match the API response structure
      const newItemForState = {
        hotel_id: hotelDataForAPI.hotel_id,
        hotel_name: addedHotelDetails?.name || "",
        hotel_street: addedHotelDetails?.street || "",
        hotel_city: addedHotelDetails?.city || "",
        hotel_state: addedHotelDetails?.state || "",
        hotel_pin: addedHotelDetails?.pin || "",
        hotel_rating: addedHotelDetails?.rating || null,
        hotel_primary_phone: addedHotelDetails?.primary_phone || null,
        hotel_primary_email: addedHotelDetails?.primary_email || null,
        hotel_image_url: addedHotelDetails?.image_url || null,
        room_id: hotelDataForAPI.room_id,
        check_in_day: hotelDataForAPI.check_in_day,
        check_out_day: hotelDataForAPI.check_out_day,
        temp_id: Date.now(), // Use a temp id for local management
      };
      setIncludedHotels([...includedHotels, newItemForState]);
      toast.success("Hotel added locally");
      resetHotelForm();
    }
  };

  const handleDeleteHotel = async (hotelId, roomId, tempId) => {
    if (!window.confirm("Remove this hotel from the package?")) return;

    if (packageData) {
      setLoading(true);
      try {
        await axios.delete(`packages/${packageData.slug}/room/${hotelId}`);

        // Refetch to ensure consistency
        const response = await axios.get(`packages/${packageData.slug}`);
        if (response.data.success && response.data.data.hotel_rooms) {
          setIncludedHotels(response.data.data.hotel_rooms);
        } else {
          // Fallback to local filtering if refetch fails
          setIncludedHotels(
            includedHotels.filter(
              (h) => !(h.hotel_id === hotelId && h.room_id === roomId)
            )
          );
        }

        toast.success("Hotel inclusion removed");
      } catch (error) {
        console.error("Error removing hotel:", error);
        toast.error("Failed to remove hotel");
      } finally {
        setLoading(false);
      }
    } else {
      // New package, remove from local state using tempId
      setIncludedHotels(includedHotels.filter((h) => h.temp_id !== tempId));
      toast.success("Hotel removed locally");
    }
  };

  const resetHotelForm = () => {
    setHotelForm({
      hotel_id: "",
      room_id: "",
      check_in_day: "",
      check_out_day: "",
    });
    setAvailableRooms([]);
    setSelectedHotelDetails(null);
    setSelectedRoomDetails(null);
  };

  // --- Other Handlers ---
  const handleDeletePackage = async () => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
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

  // --- Render ---
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
          <button
            className={`tab ${activeTab === "itinerary" ? "tabActive" : ""}`}
            onClick={() => setActiveTab("itinerary")}
          >
            Itinerary ({itineraryItems.length})
          </button>
          <button
            className={`tab ${activeTab === "hotels" ? "tabActive" : ""}`}
            onClick={() => setActiveTab("hotels")}
          >
            Hotels ({includedHotels.length})
          </button>
        </div>

        <div className="content">
          {activeTab === "package" && (
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
          )}

          {activeTab === "itinerary" && (
            <div>
              <form
                onSubmit={handleItinerarySubmit}
                style={{ marginBottom: "20px" }}
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
                    disabled={packageData && loading}
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

          {activeTab === "hotels" && (
            <div>
              <form
                onSubmit={handleHotelFormSubmit}
                style={{ marginBottom: "20px" }}
              >
                <div className="formRow">
                  <div className="formGroup">
                    <label className="label">Hotel *</label>
                    <select
                      className="input"
                      value={hotelForm.hotel_id}
                      onChange={(e) => handleHotelSelect(e.target.value)}
                      required
                    >
                      <option value="">Select a Hotel</option>
                      {allHotels.map((hotel) => (
                        <option key={hotel.hotel_id} value={hotel.hotel_id}>
                          {hotel.name} ({hotel.city})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="formGroup">
                    <label className="label">Room Type *</label>
                    <select
                      className="input"
                      value={hotelForm.room_id}
                      onChange={(e) => handleRoomSelect(e.target.value)}
                      disabled={!hotelForm.hotel_id}
                      required
                    >
                      <option value="">
                        {hotelForm.hotel_id
                          ? "Select Room Type"
                          : "Select a hotel first"}
                      </option>
                      {availableRooms.map((room) => (
                        <option key={room.room_id} value={room.room_id}>
                          {room.type} - {room.bed_type} Bed (₹
                          {room.cost_per_night}/night)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label className="label">Check-in Day *</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={hotelForm.check_in_day}
                      onChange={(e) =>
                        setHotelForm({
                          ...hotelForm,
                          check_in_day: e.target.value,
                        })
                      }
                      placeholder="e.g., 1"
                      required
                    />
                  </div>
                  <div className="formGroup">
                    <label className="label">Check-out Day *</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={hotelForm.check_out_day}
                      onChange={(e) =>
                        setHotelForm({
                          ...hotelForm,
                          check_out_day: e.target.value,
                        })
                      }
                      placeholder="e.g., 3"
                      required
                    />
                  </div>
                </div>

                {/* Preview Section */}
                {selectedHotelDetails && selectedRoomDetails && (
                  <div
                    style={{
                      backgroundColor: "#f0f7ff",
                      border: "2px solid #134686",
                      borderRadius: "8px",
                      padding: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <h4 style={{ margin: "0 0 12px 0", color: "#134686" }}>
                      📋 Preview Selection
                    </h4>
                    <div
                      style={{ display: "grid", gap: "8px", fontSize: "14px" }}
                    >
                      <div>
                        <strong>Hotel:</strong> {selectedHotelDetails.name}
                      </div>
                      <div>
                        <strong>Location:</strong> {selectedHotelDetails.street}
                        , {selectedHotelDetails.city},{" "}
                        {selectedHotelDetails.state} -{" "}
                        {selectedHotelDetails.pin}
                      </div>
                      <div>
                        <strong>Rating:</strong> {selectedHotelDetails.rating}{" "}
                        ⭐
                      </div>
                      <div
                        style={{
                          marginTop: "8px",
                          paddingTop: "8px",
                          borderTop: "1px solid #ccc",
                        }}
                      >
                        <strong>Room Type:</strong> {selectedRoomDetails.type}
                      </div>
                      <div>
                        <strong>Bed:</strong> {selectedRoomDetails.bed_type}
                      </div>
                      <div>
                        <strong>Capacity:</strong>{" "}
                        {selectedRoomDetails.max_capacity} guests
                      </div>
                      <div>
                        <strong>Balcony:</strong>{" "}
                        {selectedRoomDetails.balcony_available ? "Yes" : "No"}
                      </div>
                      <div>
                        <strong>Cost:</strong> ₹
                        {selectedRoomDetails.cost_per_night} per night
                      </div>
                      {hotelForm.check_in_day && hotelForm.check_out_day && (
                        <div
                          style={{
                            marginTop: "8px",
                            paddingTop: "8px",
                            borderTop: "1px solid #ccc",
                          }}
                        >
                          <strong>Total Nights:</strong>{" "}
                          {Number(hotelForm.check_out_day) -
                            Number(hotelForm.check_in_day)}{" "}
                          night(s)
                          <br />
                          <strong>Total Cost:</strong> ₹
                          {(Number(hotelForm.check_out_day) -
                            Number(hotelForm.check_in_day)) *
                            selectedRoomDetails.cost_per_night}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    className="btnPrimary"
                    disabled={packageData && loading}
                  >
                    {loading ? "Saving..." : "Add Hotel Inclusion"}
                  </button>
                  {(hotelForm.hotel_id || hotelForm.room_id) && (
                    <button
                      type="button"
                      className="btnSecondary"
                      onClick={resetHotelForm}
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </form>

              <div className="itineraryList">
                <h3 style={{ margin: "0 0 15px 0", color: "#134686" }}>
                  Included Hotels
                </h3>
                {includedHotels.length === 0 ? (
                  <p
                    style={{
                      color: "#666",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No hotels included yet. Add a hotel above.
                  </p>
                ) : (
                  includedHotels
                    .sort((a, b) => a.check_in_day - b.check_in_day)
                    .map((hotel) => (
                      <div
                        key={
                          hotel.temp_id || `${hotel.hotel_id}-${hotel.room_id}`
                        }
                        className="itineraryCard"
                      >
                        <div className="itineraryHeader">
                          <div>
                            {hotel.check_in_day && hotel.check_out_day && (
                              <span className="dayBadge">
                                Day {hotel.check_in_day} - Day{" "}
                                {hotel.check_out_day}
                              </span>
                            )}
                            <h4 style={{ margin: "5px 0", color: "#134686" }}>
                              {hotel.hotel_name}
                            </h4>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="btnIconDelete"
                              onClick={() =>
                                handleDeleteHotel(
                                  hotel.hotel_id,
                                  hotel.room_id,
                                  hotel.temp_id
                                )
                              }
                              disabled={packageData && loading}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#777",
                            marginTop: "8px",
                          }}
                        >
                          <div>
                            {hotel.hotel_city}, {hotel.hotel_state} -{" "}
                            {hotel.hotel_pin}
                          </div>
                          {hotel.hotel_rating && (
                            <div>Rating: {hotel.hotel_rating} ⭐</div>
                          )}
                          <div>Room ID: {hotel.room_id}</div>
                          {hotel.room_type && (
                            <div>
                              Type: {hotel.room_type} | Bed:{" "}
                              {hotel.room_bed_type} | Capacity:{" "}
                              {hotel.room_max_capacity} | ₹
                              {hotel.room_cost_per_night}/night
                            </div>
                          )}
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
