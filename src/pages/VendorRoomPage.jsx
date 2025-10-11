import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import "../styles/VendorManagement.css";

const VendorRoomPage = () => {
  const { id: hotelId } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [hotelInfo, setHotelInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    room_id: "",
    type: "",
    bed_type: "",
    cost_per_night: "",
    max_capacity: "",
    total_rooms: "",
    balcony_available: false,
  });

  const [multipleRooms, setMultipleRooms] = useState([
    {
      room_id: "",
      type: "",
      bed_type: "",
      cost_per_night: "",
      max_capacity: "",
      total_rooms: "",
      balcony_available: false,
    },
  ]);

  useEffect(() => {
    fetchHotelAndRooms();
  }, [hotelId]);

  const fetchHotelAndRooms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`/hotels/${hotelId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotelInfo({
        name: response.data.hotel.name,
        city: response.data.hotel.city,
        state: response.data.hotel.state,
      });
     // console.log(response);
      setRooms(response.data.rooms || []);
    } catch (error) {
      console.error("Error fetching hotel and rooms:", error);
      toast.error("Failed to fetch hotel and rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = () => {
    setModalMode("create");
    setMultipleRooms([
      {
        room_id: "",
        type: "",
        bed_type: "",
        cost_per_night: "",
        max_capacity: "",
        total_rooms: "",
        balcony_available: false,
      },
    ]);
    setShowModal(true);
  };

  const handleEditRoom = (room) => {
    setModalMode("edit");
    setRoomForm({
      room_id: room.room_id || "",
      type: room.type || "",
      bed_type: room.bed_type || "",
      cost_per_night: room.cost_per_night || "",
      max_capacity: room.max_capacity || "",
      total_rooms: room.total_rooms || "",
      balcony_available: room.balcony_available || false,
    });
    setSelectedRoom(room.room_id);
    setShowModal(true);
  };

  const handleAddRoomForm = () => {
    setMultipleRooms([
      ...multipleRooms,
      {
        room_id: "",
        type: "",
        bed_type: "",
        cost_per_night: "",
        max_capacity: "",
        total_rooms: "",
        balcony_available: false,
      },
    ]);
  };

  const handleRemoveRoomForm = (index) => {
    if (multipleRooms.length > 1) {
      setMultipleRooms(multipleRooms.filter((_, i) => i !== index));
    }
  };

  const handleMultipleRoomInputChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedRooms = [...multipleRooms];
    updatedRooms[index] = {
      ...updatedRooms[index],
      [name]: type === "checkbox" ? checked : value,
    };
    setMultipleRooms(updatedRooms);
  };

  const handleSubmitRoom = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      if (modalMode === "create") {
        const roomsPayload = multipleRooms.map((room) => ({
          type: room.type.trim(),
          bed_type: room.bed_type.trim(),
          cost_per_night: Number(room.cost_per_night) || 0,
          max_capacity: Number(room.max_capacity) || 0,
          total_rooms: Number(room.total_rooms) || 0,
          balcony_available: Boolean(room.balcony_available),
          rating: 0, // Set initial rating to 0
        }));

        const response = await axios.post(
          `/hotels/${hotelId}/rooms`,
          roomsPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200 || response.status === 201) {
          toast.success(`${multipleRooms.length} room(s) created successfully`);
          fetchHotelAndRooms();
          setShowModal(false);
        }
      } else {
        const payload = {
          type: roomForm.type.trim(),
          bed_type: roomForm.bed_type.trim(),
          cost_per_night: Number(roomForm.cost_per_night) || 0,
          max_capacity: Number(roomForm.max_capacity) || 0,
          total_rooms: Number(roomForm.total_rooms) || 0,
          balcony_available: Boolean(roomForm.balcony_available),
        };

        const response = await axios.put(
          `/hotels/${hotelId}/room/${selectedRoom}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200 || response.status === 201) {
          toast.success("Room updated successfully");
          fetchHotelAndRooms();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error("Error saving room:", error);
      toast.error(error.response?.data?.message || "Failed to save room");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoomForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDeleteRoom = async (roomId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.delete(`/hotels/${hotelId}/room/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200 || response.status === 204) {
        toast.success("Room deleted successfully");
        fetchHotelAndRooms();
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error(error.response?.data?.message || "Failed to delete room");
    } finally {
      setLoading(false);
    }
  };

  //console.log(hotelInfo);
  return (
    <div className="vendor-management">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="breadcrumb">
            {/* <button className="breadcrumb-link" onClick={() => navigate("/vendor/hotels")}>
              Hotels
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{hotelInfo ? `${hotelInfo.name} - Rooms` : "Room Management"}</span> */}
          </div>
          <h1>Room Management</h1>
          {hotelInfo && (
            <p>
              Manage rooms for {hotelInfo.name} ({hotelInfo.city},{" "}
              {hotelInfo.state})
            </p>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <div className="section-header">
            <h2>Rooms</h2>
            <button className="btn-create" onClick={handleCreateRoom}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add a Room Type
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading rooms...</p>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Room ID</th>
                    <th>Type</th>
                    <th>Bed Type</th>
                    <th>Cost/Night</th>
                    <th>Max Capacity</th>
                    <th>Total Rooms</th>
                    {/* <th>Available</th> */}
                    <th>Balcony</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.length > 0 ? (
                    rooms.map((room) => (
                      <tr key={room.room_id}>
                        <td className="vendor-name">{room.room_id}</td>
                        <td>{room.type}</td>
                        <td>{room.bed_type}</td>
                        <td>₹{room.cost_per_night}</td>
                        <td>{room.max_capacity}</td>
                        <td>
                          <span className="badge badge-service">
                            {room.total_rooms}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              room.balcony_available
                                ? "badge-active"
                                : "badge-inactive"
                            }`}
                          >
                            {room.balcony_available ? "Yes" : "No"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-edit"
                              onClick={() => handleEditRoom(room)}
                              title="Edit"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteRoom(room.room_id)}
                              title="Delete"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data">
                        No rooms found. Create your first room!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === "create" ? "Add New Room(s)" : "Edit Room"}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitRoom}>
              <div className="modal-body">
                {modalMode === "create" ? (
                  <>
                    {multipleRooms.map((room, index) => (
                      <div key={index} className="room-form-section">
                        {multipleRooms.length > 1 && (
                          <div className="room-form-header">
                            <h3>Room {index + 1}</h3>
                            <button
                              type="button"
                              className="btn-delete-small"
                              onClick={() => handleRemoveRoomForm(index)}
                              title="Remove this room"
                            >
                              ×
                            </button>
                          </div>
                        )}

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor={`type-${index}`}>Room Type *</label>
                            <input
                              type="text"
                              id={`type-${index}`}
                              name="type"
                              value={room.type}
                              onChange={(e) =>
                                handleMultipleRoomInputChange(index, e)
                              }
                              placeholder="e.g., Deluxe, Suite, Standard"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor={`bed_type-${index}`}>
                              Bed Type *
                            </label>
                            <input
                              type="text"
                              id={`bed_type-${index}`}
                              name="bed_type"
                              value={room.bed_type}
                              onChange={(e) =>
                                handleMultipleRoomInputChange(index, e)
                              }
                              placeholder="e.g., King, Queen, Twin"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor={`cost_per_night-${index}`}>
                              Cost Per Night *
                            </label>
                            <input
                              type="number"
                              id={`cost_per_night-${index}`}
                              name="cost_per_night"
                              value={room.cost_per_night}
                              onChange={(e) =>
                                handleMultipleRoomInputChange(index, e)
                              }
                              placeholder="e.g., 2500"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor={`max_capacity-${index}`}>
                              Max Capacity *
                            </label>
                            <input
                              type="number"
                              id={`max_capacity-${index}`}
                              name="max_capacity"
                              value={room.max_capacity}
                              onChange={(e) =>
                                handleMultipleRoomInputChange(index, e)
                              }
                              placeholder="e.g., 2"
                              min="1"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label
                              htmlFor={`total_rooms-${index}`}
                            >
                              Total Rooms *
                            </label>
                            <input
                              type="number"
                              id={`total_rooms-${index}`}
                              name="total_rooms"
                              value={room.total_rooms}
                              onChange={(e) =>
                                handleMultipleRoomInputChange(index, e)
                              }
                              placeholder="e.g., 5"
                              min="0"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                name="balcony_available"
                                checked={room.balcony_available}
                                onChange={(e) =>
                                  handleMultipleRoomInputChange(index, e)
                                }
                              />
                              <span>Balcony Available</span>
                            </label>
                          </div>
                        </div>

                        {index < multipleRooms.length - 1 && (
                          <hr className="form-divider" />
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleAddRoomForm}
                    >
                      + Add Another Room
                    </button>
                  </>
                ) : (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="room_id">Room ID</label>
                        <input
                          type="text"
                          id="room_id"
                          name="room_id"
                          value={roomForm.room_id}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="type">Room Type *</label>
                        <input
                          type="text"
                          id="type"
                          name="type"
                          value={roomForm.type}
                          onChange={handleInputChange}
                          placeholder="e.g., Deluxe, Suite, Standard"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="bed_type">Bed Type *</label>
                        <input
                          type="text"
                          id="bed_type"
                          name="bed_type"
                          value={roomForm.bed_type}
                          onChange={handleInputChange}
                          placeholder="e.g., King, Queen, Twin"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cost_per_night">Cost Per Night *</label>
                        <input
                          type="number"
                          id="cost_per_night"
                          name="cost_per_night"
                          value={roomForm.cost_per_night}
                          onChange={handleInputChange}
                          placeholder="e.g., 2500"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="max_capacity">Max Capacity *</label>
                        <input
                          type="number"
                          id="max_capacity"
                          name="max_capacity"
                          value={roomForm.max_capacity}
                          onChange={handleInputChange}
                          placeholder="e.g., 2"
                          min="1"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="total_rooms">Total Rooms *</label>
                        <input
                          type="number"
                          id="total_rooms"
                          name="total_rooms"
                          value={roomForm.total_rooms}
                          onChange={handleInputChange}
                          placeholder="e.g., 5"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="balcony_available"
                          checked={roomForm.balcony_available}
                          onChange={handleInputChange}
                        />
                        <span>Balcony Available</span>
                      </label>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
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
                    : modalMode === "create"
                    ? `Create Room(s)`
                    : "Update Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorRoomPage;
