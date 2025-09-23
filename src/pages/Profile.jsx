import React, { useState, useRef, useEffect } from "react"; // MODIFIED: Import useRef and useEffect
import "../styles/Profile.css";
import axios from "../utils/axios";

// --- SVG Icons ---
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const Profile = () => {
  // --- State Management  ---
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordSectionVisible, setIsPasswordSectionVisible] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    emergencyContactFirstName: "",
    emergencyContactLastName: "",
    emergencyContactNo: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // --- Refs and Effects for Scrolling ---
  const passwordCardRef = useRef(null); // NEW: Create a ref for the password card

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Assumes your API endpoint for fetching profile data is /api/profile
        const response = await axios.get("/api/profile");

        // Ensure date is in YYYY-MM-DD format for the input field
        if (response.data.dateOfBirth) {
          response.data.dateOfBirth = response.data.dateOfBirth.split("T")[0];
        }

        setProfileData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch profile data. Please try again later.");
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // NEW: Add an effect to scroll when the password section appears
  useEffect(() => {
    if (isPasswordSectionVisible && passwordCardRef.current) {
      passwordCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isPasswordSectionVisible]); // This effect runs only when isPasswordSectionVisible changes

  // --- Handlers  ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      // Assumes your API endpoint for updating is a PUT request to /api/profile
      const response = await axios.put("/api/profile", profileData);

      if (response.status === 200) {
        alert("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update profile.");
      console.error("Update profile error:", err);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      // Assumes a password change endpoint like /api/auth/change-password
      const response = await axios.post("/api/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.status === 200) {
        alert("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setIsPasswordSectionVisible(false);
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update password.");
      console.error("Password update error:", err);
    }
  };

  // --- Conditional Rendering for Loading and Error States ---
  if (loading) {
    return <div className="profile-page-status">Loading your profile...</div>;
  }

  if (error) {
    return <div className="profile-page-status error">{error}</div>;
  }

  return (
    <div className="profile-page">
      {/* --- Profile Header  --- */}
      <section className="profile-header">
        <h1>My Account</h1>
        <p>View and manage your personal details and security settings.</p>
      </section>

      <div className="profile-container container">
        {/* --- Personal Details Card --- */}
        <div className="profile-card">
          <div className="card-header">
            <h2>
              <div className="card-icon">
                <UserIcon />
              </div>
              Personal Details
            </h2>
            <div className="card-header-actions">
              {!isEditing && !isPasswordSectionVisible && (
                <button
                  className="btn-link"
                  onClick={() => setIsPasswordSectionVisible(true)}
                >
                  Change Password
                </button>
              )}
              {!isEditing && (
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
          <form onSubmit={handleProfileSave}>
            <div className="details-grid">
              {/* Form fields rendered based on isEditing state */}
              <div className="form-group">
                <label>First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                  />
                ) : (
                  <p>{profileData.firstName}</p>
                )}
              </div>
              <div className="form-group">
                <label>Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                  />
                ) : (
                  <p>{profileData.lastName}</p>
                )}
              </div>
              <div className="form-group">
                <label>Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                  />
                ) : (
                  <p>{profileData.email}</p>
                )}
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                  />
                ) : (
                  <p>{profileData.phone}</p>
                )}
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleProfileChange}
                  />
                ) : (
                  <p>{profileData.dateOfBirth}</p>
                )}
              </div>
              <div className="form-group">
                <label>Gender</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleProfileChange}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                ) : (
                  <p>{profileData.gender}</p>
                )}
              </div>
            </div>
            <hr className="divider" />
            <h3>Emergency Contact</h3>
            <div className="details-grid">
              <div className="form-group">
                <label>First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="emergencyContactFirstName"
                    value={profileData.emergencyContactFirstName}
                    onChange={handleProfileChange}
                  />
                ) : (
                  <p>{profileData.emergencyContactFirstName}</p>
                )}
              </div>
              <div className="form-group">
                <label>Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="emergencyContactLastName"
                    value={profileData.emergencyContactLastName}
                    onChange={handleProfileChange}
                  />
                ) : (
                  <p>{profileData.emergencyContactLastName}</p>
                )}
              </div>
              <div className="form-group full-width">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="emergencyContactNo"
                    value={profileData.emergencyContactNo}
                    onChange={handleProfileChange}
                  />
                ) : (
                  <p>{profileData.emergencyContactNo}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        {/* --- Change Password Card (Conditionally Rendered) --- */}
        {isPasswordSectionVisible && (
          // MODIFIED: Attach the ref to this div
          <div className="profile-card" ref={passwordCardRef}>
            <div className="card-header">
              <h2>
                <div className="card-icon">
                  <LockIcon />
                </div>
                Change Password
              </h2>
            </div>
            <form onSubmit={handlePasswordUpdate}>
              <div className="details-grid">
                <div className="form-group full-width">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsPasswordSectionVisible(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
