import { useState } from "react";
import "../styles/HotelForm.css";
import Inputbox from "../components/inputBox";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

const HotelCreate = () => {
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    pin: "",
    total_rooms: 1,
    description: "",
    emails: [{ value: "" }],
    phones: [{ value: "" }],
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "total_rooms"
          ? value === ""
            ? ""
            : Math.max(1, Number.parseInt(value, 10) || 1)
          : name === "pin"
            ? value.replace(/\D/g, "").slice(0, 6)
            : value,
    }));
  }

  const updateEmail = (idx, val) =>
    setFormData((prev) => {
      const emails = [...prev.emails];
      emails[idx] = { value: val };
      return { ...prev, emails };
    });

  const addEmail = () => setFormData((prev) => ({ ...prev, emails: [...prev.emails, { value: "" }] })); 

  const removeEmail = (idx) =>
    setFormData((prev) => {
      const emails = prev.emails.filter((_, i) => i !== idx);
      if (emails.length === 0) emails.push({ value: "" });
      return { ...prev, emails };
    });

  const updatePhone = (idx, val) =>
    setFormData((prev) => {
      const phones = [...prev.phones];
      phones[idx] = { value: val.replace(/[^\d+()-\s]/g, "") };
      return { ...prev, phones };
    });

  const addPhone = () => setFormData((prev) => ({ ...prev, phones: [...prev.phones, { value: "" }] }));

  const removePhone = (idx) =>
    setFormData((prev) => {
      const phones = prev.phones.filter((_, i) => i !== idx);
      if (phones.length === 0) phones.push({ value: "" });
      return { ...prev, phones };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
        // Construct payload
        const payload = {
            name: formData.name.trim(),
            street: formData.street.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pin: formData.pin.trim(),
            total_rooms: Number(formData.total_rooms) || 0,
            description: formData.description.trim(),
        };

            // Get token from localStorage (set after login)
            const token = localStorage.getItem("accessToken");

            if (!token) {
            setMessage("You must be logged in to add a hotel.");
            setSaving(false);
            return;
            }

            // API endpoint — adjust path to match your backend route
            const endpoint = "/hotels/";

            const response = await axios.post(endpoint, payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            });

            if (response.status === 200 || response.status === 201) {
                const hotelId = response.data?.hotel_id;
                const phoneNumbers = formData.phones
            .filter((p) => p.value.trim() !== "")
            .map((p) => p.value.trim());

            if (phoneNumbers.length > 0) {
            await axios.post(
                `/hotels/${hotelId}/phones/`,
                { phoneNumbers }, // adjust key based on backend
                {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                }
            );
            }
            
            // 4️⃣ Post emails (if any)
            const emails = formData.emails
            .filter((e) => e.value.trim() !== "")
            .map((e) => e.value.trim());
            
            if (emails.length > 0) {
                await axios.post(
                    `/hotels/${hotelId}/emails/`,
                    { emails }, // adjust key based on backend
                    {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    }
            if (emails.length === 0) {
                setMessage("Please add at least one email address.");
                setSaving(false);
                return;
            }
            if(phoneNumbers.length === 0) {
            setMessage("Please add at least one phone number.");
            setSaving(false);
            return;
            }
            setMessage("Hotel created successfully!");
            navigate("/hotels"); // redirect to hotels list page
            } else {
            setMessage("Unexpected response from server.");
            }
        } catch (error) {
            console.error(error);
            setMessage(
            error?.response?.data?.message || "Failed to save hotel. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

  return (
    <main className="hotel-form-page">
      <section className="hotel-form-hero">
        <div className="container">
          <h1>Create Your Hotel</h1>
          <p className="subtitle">
            Add your property details and publish when ready. You can update information anytime.
          </p>
        </div>
      </section>

      <section className="container hotel-form-section">
        <div className="hotel-form-card">
          <form className="hotel-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <Inputbox
                label="Hotel Name*"
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              <Inputbox
                label="Street*"
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
              />
              <Inputbox label="City*" type="text" id="city" name="city" value={formData.city} onChange={handleChange} />
              <Inputbox
                label="State*"
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
              <Inputbox
                label="PIN Code*"
                type="text"
                id="pin"
                name="pin"
                value={formData.pin}
                onChange={handleChange}
              />
              <div className="input-group">
                <label htmlFor="total_rooms">Total Rooms*</label>
                <input
                  id="total_rooms"
                  name="total_rooms"
                  type="number"
                  min="1"
                  value={formData.total_rooms}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group input-group--full">
                <label htmlFor="description">Hotel Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Describe your property, surroundings, and any highlights guests care about."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group input-group--full">
                <label>Emails</label>
                {formData.emails.map((e, idx) => (
                  <div key={`email-${idx}`} className="contact-row">
                    <input
                      type="email"
                      placeholder="owner@hotel.com"
                      value={e.value}
                      onChange={(ev) => updateEmail(idx, ev.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => removeEmail(idx)}
                      aria-label="Remove email"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" className="btn-secondary" onClick={addEmail}>
                  + Add another email
                </button>
              </div>

              <div className="input-group input-group--full">
                <label>Phone Numbers</label>
                {formData.phones.map((p, idx) => (
                  <div key={`phone-${idx}`} className="contact-row">
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={p.value}
                      onChange={(ev) => updatePhone(idx, ev.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => removePhone(idx)}
                      aria-label="Remove phone"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" className="btn-secondary" onClick={addPhone}>
                  + Add another phone
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" disabled={saving} onClick={() => window.history.back()}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Publishing..." : "Publish Listing"}
              </button>
            </div>
            {message && <div className="form-message">{message}</div>}
          </form>
        </div>

        <div className="side-column">
          <aside className="side-card tips-card">
            <h3>Listing Tips</h3>
            <ul className="tips-list">
              <li>Use the exact property name guests will recognize.</li>
              <li>Keep address and PIN accurate for smooth check‑in.</li>
              <li>Provide at least one contact email and phone number.</li>
              <li>Write a concise description highlighting location and access.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default HotelCreate;
