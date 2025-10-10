import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/HotelForm.css";
import Inputbox from "../components/inputBox";
import axios from "../utils/axios";

const HotelUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    pin: "",
    total_rooms: 1,
    description: "",
    emails: [{ id: null, value: "" }],
    phones: [{ id: null, value: "" }],
  });

  useEffect(() => {
    fetchHotelData();
  }, [id]);

  // ✅ 1. Fetch existing hotel, email, and phone data
  const fetchHotelData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      const [hotelRes, emailRes, phoneRes] = await Promise.all([
        axios.get(`/hotels/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/hotels/${id}/emails/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/hotels/${id}/phones/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const hotel = hotelRes.data.hotel;
      console.log(emailRes.data.data);
      const emails = emailRes.data.data.map((e) => ({ id: e.id, value: e.email }));
      const phones = phoneRes.data.data.map((p) => ({ id: p.id, value: p.phone }));

      setFormData({
        name: hotel.name || "",
        street: hotel.street || "",
        city: hotel.city || "",
        state: hotel.state || "",
        pin: hotel.pin || "",
        total_rooms: hotel.total_rooms || 1,
        description: hotel.description || "",
        emails: emails.length ? emails : [{ id: null, value: "" }],
        phones: phones.length ? phones : [{ id: null, value: "" }],
      });
    } catch (err) {
      console.error(err);
      setMessage("Failed to load hotel data.");
    } finally {
      setLoading(false);
    }
  };

  // Input change handler
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
  };

  // Email/Phone management
  const updateEmail = (idx, val) =>
    setFormData((prev) => {
      const emails = [...prev.emails];
      emails[idx].value = val;
      return { ...prev, emails };
    });

  const addEmail = () =>
    setFormData((prev) => ({
      ...prev,
      emails: [...prev.emails, { id: null, value: "" }],
    }));

  const removeEmail = (idx) =>
    setFormData((prev) => {
      const emails = prev.emails.filter((_, i) => i !== idx);
      return { ...prev, emails: emails.length ? emails : [{ id: null, value: "" }] };
    });

  const updatePhone = (idx, val) =>
    setFormData((prev) => {
      const phones = [...prev.phones];
      phones[idx].value = val.replace(/[^\d+()-\s]/g, "");
      return { ...prev, phones };
    });

  const addPhone = () =>
    setFormData((prev) => ({
      ...prev,
      phones: [...prev.phones, { id: null, value: "" }],
    }));

  const removePhone = (idx) =>
    setFormData((prev) => {
      const phones = prev.phones.filter((_, i) => i !== idx);
      return { ...prev, phones: phones.length ? phones : [{ id: null, value: "" }] };
    });

  // ✅ 2. Handle update logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const token = localStorage.getItem("accessToken");

    try {
      const hotelPayload = {
        name: formData.name.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pin: formData.pin.trim(),
        rating: 0,
        total_rooms: Number(formData.total_rooms) || 0,
        description: formData.description.trim(),
      };

      // 1️⃣ Update hotel details
      await axios.put(`/hotels/${id}/`, hotelPayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // 2️⃣ Get current emails & phones from backend to compare
      const [existingEmails, existingPhones] = await Promise.all([
        axios.get(`/hotels/${id}/emails/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/hotels/${id}/phones/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // 3️⃣ Find removed and newly added emails
      const existingEmailList = existingEmails.data.data.map((e) => e.email);
      const newEmailList = formData.emails
        .map((e) => e.value.trim())
        .filter((v) => v !== "");

      const toAddEmails = newEmailList.filter((v) => !existingEmailList.includes(v));
      const toDeleteEmails = existingEmails.data.data.filter(
        (e) => !newEmailList.includes(e.email)
      );

      // Add new emails
      for (const email of toAddEmails) {
        await axios.post(`/hotels/${id}/emails/`, { emails : [email]}, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Delete removed emails
      for (const e of toDeleteEmails) {
        console.log(e);
        await axios.delete(`/hotels/${id}/emails/${e.email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // 4️⃣ Repeat same for phones
      const existingPhoneList = existingPhones.data.data.map((p) => p.phone);
      const newPhoneList = formData.phones
        .map((p) => p.value.trim())
        .filter((v) => v !== "");

      const toAddPhones = newPhoneList.filter((v) => !existingPhoneList.includes(v));
      const toDeletePhones = existingPhones.data.data.filter(
        (p) => !newPhoneList.includes(p.phone)
      );

      for (const phone of toAddPhones) {
        await axios.post(`/hotels/${id}/phones/`, {phoneNumbers : [phone]}, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      for (const p of toDeletePhones) {
        console.log(p);
        await axios.delete(`/hotels/${id}/phones/${p.phone}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setMessage("Hotel updated successfully!");
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      console.error("Error updating hotel:", err);
      setMessage("Failed to update hotel.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate(-1);

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
          <h1>Update Hotel</h1>
          <p className="subtitle">Update your property details. Changes will be reflected immediately after saving.</p>
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
              <li>Review all fields carefully before saving changes.</li>
              <li>Ensure contact information is up-to-date for guest communication.</li>
              <li>Update descriptions to reflect any new amenities or features.</li>
              <li>Changes take effect immediately after saving.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default HotelUpdate;
