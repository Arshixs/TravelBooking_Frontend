import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/HotelForm.css";
import axios from "../utils/axios"

const RoomUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("accessToken");
  const [rooms, setRooms] = useState([
    {
      room_id: "",
      balcony_available: false,
      cost_per_night: "",
      type: "",
      bed_type: "",
      max_capacity: "",
      number_of_rooms_available: "",
    },
  ])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchRoomData()
  }, [id])

  const fetchRoomData = async () => {
  setLoading(true);
  try {
    const response = await axios.get(`/hotels/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRooms(response.data.rooms);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    setMessage("Failed to load room data.");
  } finally {
    setLoading(false);
  }
};

  const updateRoom = (idx, field, value) => {
    setRooms((prev) => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [field]: value }
      return updated
    })
  }

  const addRoom = () => {
    setRooms((prev) => [
      ...prev,
      {
        room_id: "",
        balcony_available: false,
        cost_per_night: "",
        type: "",
        bed_type: "",
        max_capacity: "",
        number_of_rooms_available: "",
      },
    ])
  }

  const removeRoom = (idx) => {
    setRooms((prev) => {
      const filtered = prev.filter((_, i) => i !== idx)
      if (filtered.length === 0) {
        return [
          {
            room_id: "",
            balcony_available: false,
            cost_per_night: "",
            type: "",
            bed_type: "",
            max_capacity: "",
            number_of_rooms_available: "",
          },
        ]
      }
      return filtered
    })
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setMessage("");
  try {
    const payload = rooms.map((room) => {
      console.log(room.room_id);
      return {
        room_id: room.room_id || undefined,
        balcony_available: room.balcony_available,
        cost_per_night: Number(room.cost_per_night) || 0,
        type: room.type.trim(),
        bed_type: room.bed_type.trim(),
        max_capacity: Number(room.max_capacity) || 0,
        number_of_rooms_available: Number(room.number_of_rooms_available) || 0,
      };
    });

    // Send the PUT request to backend
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];

      if (!room.room_id) {
        console.warn(`Skipping room at index ${i} because room_id is missing`);
        continue; // skip if room_id is not set
      }

      await axios.put(`/hotels/${id}/room/${room.room_id}`, payload[i], {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }

    setMessage("Rooms updated successfully!");
    fetchRoomData(); // refresh after update
  } catch (err) {
    console.error("Error updating rooms:", err);
    setMessage(
      err?.response?.data?.message || "Failed to update rooms."
    );
  } finally {
    setSaving(false);
  }
};

  const handleCancel = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <main className="hotel-form-page">
        <section className="hotel-form-hero">
          <div className="container">
            <h1>Loading...</h1>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="hotel-form-page">
      <section className="hotel-form-hero">
        <div className="container">
          <h1>Update Rooms</h1>
          <p className="subtitle">Update room details for your hotel. You can modify multiple rooms at once.</p>
        </div>
      </section>

      <section className="container hotel-form-section">
        <div className="hotel-form-card">
          <form className="hotel-form" onSubmit={handleSubmit}>
            {rooms.map((room, idx) => (
              <div
                key={`room-${idx}`}
                style={{
                  marginBottom: "32px",
                  paddingBottom: "24px",
                  borderBottom: idx < rooms.length - 1 ? "2px solid #e7eaf3" : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h3 style={{ margin: 0, color: "#134686", fontSize: "1.2rem" }}>Room {idx + 1}</h3>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => removeRoom(idx)}
                    aria-label={`Remove room ${idx + 1}`}
                  >
                    Remove Room
                  </button>
                </div>

                <div className="form-grid">
                  <div className="input-group">
                    <label htmlFor={`room_id_${idx}`}>Room ID*</label>
                    <input
                      type="text"
                      id={`room_id_${idx}`}
                      value={room.room_id}
                      onChange={(e) => updateRoom(idx, "room_id", e.target.value)}
                      placeholder="e.g., 101, A-201"
                      required
                      readOnly
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor={`type_${idx}`}>Room Type*</label>
                    <input
                      type="text"
                      id={`type_${idx}`}
                      value={room.type}
                      onChange={(e) => updateRoom(idx, "type", e.target.value)}
                      placeholder="e.g., Deluxe, Suite, Standard"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor={`bed_type_${idx}`}>Bed Type*</label>
                    <input
                      type="text"
                      id={`bed_type_${idx}`}
                      value={room.bed_type}
                      onChange={(e) => updateRoom(idx, "bed_type", e.target.value)}
                      placeholder="e.g., King, Queen, Twin"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor={`cost_per_night_${idx}`}>Cost Per Night*</label>
                    <input
                      type="number"
                      id={`cost_per_night_${idx}`}
                      value={room.cost_per_night}
                      onChange={(e) => updateRoom(idx, "cost_per_night", e.target.value)}
                      placeholder="e.g., 2500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor={`max_capacity_${idx}`}>Max Capacity*</label>
                    <input
                      type="number"
                      id={`max_capacity_${idx}`}
                      value={room.max_capacity}
                      onChange={(e) => updateRoom(idx, "max_capacity", e.target.value)}
                      placeholder="e.g., 2"
                      min="1"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor={`number_of_rooms_available_${idx}`}>Number of Rooms Available*</label>
                    <input
                      type="number"
                      id={`number_of_rooms_available_${idx}`}
                      value={room.number_of_rooms_available}
                      onChange={(e) => updateRoom(idx, "number_of_rooms_available", e.target.value)}
                      placeholder="e.g., 5"
                      min="0"
                      required
                    />
                  </div>

                  <div className="input-group input-group--full">
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={room.balcony_available}
                        onChange={(e) => updateRoom(idx, "balcony_available", e.target.checked)}
                        style={{ width: "auto", cursor: "pointer" }}
                      />
                      <span>Balcony Available</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className="btn-secondary" onClick={addRoom} style={{ marginBottom: "16px" }}>
              + Add Another Room
            </button>

            <div className="form-actions">
              <button type="button" className="btn-secondary" disabled={saving} onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
            {message && <div className="form-message">{message}</div>}
          </form>
        </div>

        <div className="side-column">
          <aside className="side-card tips-card">
            <h3>Update Tips</h3>
            <ul className="tips-list">
              <li>Review all room details before saving changes.</li>
              <li>Update availability counts to reflect current inventory.</li>
              <li>Adjust pricing based on season or demand.</li>
              <li>Changes take effect immediately after saving.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default RoomUpdate
