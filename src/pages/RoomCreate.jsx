import { useState } from "react";
import "../styles/HotelForm.css";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";

const RoomCreate = () => {
    const hotelId = useParams().id;
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
  ]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const updateRoom = (idx, field, value) => {
    setRooms((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

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
    ]);
  };

  const removeRoom = (idx) => {
    setRooms((prev) => {
      const filtered = prev.filter((_, i) => i !== idx);
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
        ];
      }
      return filtered;
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setMessage("");

  try {
    const token = localStorage.getItem("accessToken");

    // 1️⃣ Validate room data
    const cleanedRooms = rooms.map((room) => ({
        room_id: room.room_id.trim(),
      balcony_available: Boolean(room.balcony_available),
      cost_per_night: Number(room.cost_per_night),
      type: room.type.trim(),
      bed_type: room.bed_type.trim(),
      max_capacity: Number(room.max_capacity),
      number_of_rooms_available: Number(room.number_of_rooms_available),
    }));

    if (cleanedRooms.length === 0) {
      setMessage("Please add at least one room.");
      setSaving(false);
      return;
    }

    // 2️⃣ Ensure no empty critical fields
    for (const [idx, r] of cleanedRooms.entries()) {
      if (!r.type || !r.bed_type) {
        setMessage(`Room #${idx + 1}: Type and Bed Type are required.`);
        setSaving(false);
        return;
      }
    }

    // 3️⃣ Define API endpoint — hotelId should come from props or route params
    if (!hotelId) {
      setMessage("Hotel ID missing. Please select or create a hotel first.");
      setSaving(false);
      return;
    }

    // 4️⃣ Send to backend
    const response = await axios.post(
      `/hotels/${hotelId}/rooms`,
      cleanedRooms,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      setMessage("✅ Rooms created successfully!");
      setRooms([
        {
          room_id: "",
          balcony_available: false,
          cost_per_night: "",
          type: "",
          bed_type: "",
          max_capacity: "",
          number_of_rooms_available: "",
        },
      ]);
    } else {
      throw new Error("Unexpected response from server");
    }
  } catch (err) {
    console.error(err);
    setMessage("❌ Failed to create rooms. Please check the data or try again.");
  } finally {
    setSaving(false);
  }
};

  return (
    <main className="hotel-form-page">
      <section className="hotel-form-hero">
        <div className="container">
          <h1>Create Rooms</h1>
          <p className="subtitle">Add room details for your hotel. You can add multiple rooms at once.</p>
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
              <button type="button" className="btn-secondary" disabled={saving} onClick={() => window.history.back()}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Rooms"}
              </button>
            </div>
            {message && <div className="form-message">{message}</div>}
          </form>
        </div>

        <div className="side-column">
          <aside className="side-card tips-card">
            <h3>Room Creation Tips</h3>
            <ul className="tips-list">
              <li>Use unique Room IDs for easy identification.</li>
              <li>Specify accurate room types and bed configurations.</li>
              <li>Set competitive pricing based on amenities and location.</li>
              <li>Keep availability counts updated for better booking management.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default RoomCreate;
