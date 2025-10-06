import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useUser } from "../context/context";
import toast from "react-hot-toast";
import "../styles/VendorManagement.css";

const VendorContactsPage = () => {
  const [emails, setEmails] = useState([]);
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const { user } = useUser();

  useEffect(() => {
    if (user?.data?.vendor_id) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const vendorId = user.data.vendor_id;
      const [emailsRes, phonesRes] = await Promise.all([
        axios.get(`/vendors/${vendorId}/emails/`),
        axios.get(`/vendors/${vendorId}/phones/`),
      ]);

      if (emailsRes.data.success) {
        setEmails(emailsRes.data.data || []);
      }
      if (phonesRes.data.success) {
        setPhones(phonesRes.data.data || []);
      }
      //console.log(emailsRes.data.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to fetch contact information");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error("Please enter an email");
      return;
    }

    setLoading(true);
    try {
      const vendorId = user.data.vendor_id;
      const response = await axios.post(`/vendors/${vendorId}/emails/`, {
        email: newEmail,
      });
      if (response.data.success) {
        toast.success("Email added successfully");
        setNewEmail("");
        fetchContacts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add email");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmail = async (email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) {
      return;
    }

    setLoading(true);
    try {
      const vendorId = user.data.vendor_id;
      const response = await axios.delete(
        `/vendors/${vendorId}/emails/${encodeURIComponent(email)}`
      );
      if (response.data.success) {
        toast.success("Email deleted successfully");
        fetchContacts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete email");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhone = async (e) => {
    e.preventDefault();
    if (!newPhone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    setLoading(true);
    try {
      const vendorId = user.data.vendor_id;
      const response = await axios.post(`/vendors/${vendorId}/phones/`, {
        phoneNo: newPhone,
      });
      if (response.data.success) {
        toast.success("Phone number added successfully");
        setNewPhone("");
        fetchContacts();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add phone number"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhone = async (phoneNo) => {
    if (!window.confirm(`Are you sure you want to delete ${phoneNo}?`)) {
      return;
    }

    setLoading(true);
    try {
      const vendorId = user.data.vendor_id;
      const response = await axios.delete(
        `/vendors/${vendorId}/phones/${encodeURIComponent(phoneNo)}`
      );
      if (response.data.success) {
        toast.success("Phone number deleted successfully");
        fetchContacts();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete phone number"
      );
    } finally {
      setLoading(false);
    }
  };

  const primaryEmail = user?.data?.email;
  const primaryPhone = user?.data?.phone;

  return (
    <div className="vendor-management">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Contact Management</h1>
          <p>Manage your email addresses and phone numbers</p>
        </div>
      </div>

      <div className="dashboard-content">
        {loading && emails.length === 0 && phones.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading contact information...</p>
          </div>
        ) : (
          <>
            {/* Email Section */}
            <div className="content-section">
              <div className="section-header">
                <h2>Email Addresses</h2>
              </div>

              <div className="details-section">
                <h3>Add New Email</h3>
                <form onSubmit={handleAddEmail} className="add-item-form">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={loading}
                  />
                  <button type="submit" className="btn-add" disabled={loading}>
                    {loading ? "Adding..." : "Add Email"}
                  </button>
                </form>

                <h3 style={{ marginTop: "2rem" }}>Your Email Addresses</h3>
                <div className="item-list">
                  {primaryEmail && (
                    <div className="item-badge primary-badge">
                      {primaryEmail} <span>(Primary - Cannot be deleted)</span>
                    </div>
                  )}
                  {emails
                    .filter((e) => e.email !== primaryEmail)
                    .map((emailObj) => (
                      <div key={emailObj.email} className="item-badge">
                        {emailObj.email}
                        <button
                          onClick={() => handleDeleteEmail(emailObj.email)}
                          className="btn-remove"
                          disabled={loading}
                          title="Delete email"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    
                  {emails.length === 0 && (
                    <p style={{ color: "#999", fontStyle: "italic" }}>
                      No additional emails found. Add your first email above.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Phone Section */}
            <div className="content-section" style={{ marginTop: "2rem" }}>
              <div className="section-header">
                <h2>Phone Numbers</h2>
              </div>

              <div className="details-section">
                <h3>Add New Phone Number</h3>
                <form onSubmit={handleAddPhone} className="add-item-form">
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    disabled={loading}
                  />
                  <button type="submit" className="btn-add" disabled={loading}>
                    {loading ? "Adding..." : "Add Phone"}
                  </button>
                </form>

                <h3 style={{ marginTop: "2rem" }}>Your Phone Numbers</h3>
                <div className="item-list">
                  {primaryPhone && (
                    <div className="item-badge primary-badge">
                      {primaryPhone} <span>(Primary - Cannot be deleted)</span>
                    </div>
                  )}
                  {phones
                    .filter((p) => p.phone !== primaryPhone)
                    .map((phoneObj) => (
                      <div key={phoneObj.phone} className="item-badge">
                        {phoneObj.phone}
                        <button
                          onClick={() => handleDeletePhone(phoneObj.phone)}
                          className="btn-remove"
                          disabled={loading}
                          title="Delete phone"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  {phones.length === 0 && (
                    <p style={{ color: "#999", fontStyle: "italic" }}>
                      No additional phone numbers found. Add your first phone
                      number above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorContactsPage;
