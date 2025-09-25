import React, { useState, useRef, useEffect } from "react";
import "../styles/Profile.css";
import axios from "../utils/axios";
import { useUser } from "../context/context.jsx";
import ProfileField from "../components/Profilefield.jsx"; // Import the helper component
import Inputbox from "../components/inputBox.jsx";

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
  const { user, isAuthenticated } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordSectionVisible, setIsPasswordSectionVisible] = useState(false);

  // A single state object to hold all possible profile data
  const [profileData, setProfileData] = useState({});

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const passwordCardRef = useRef(null);

  // Maps API data (snake_case) to our state (camelCase) for both user types
  useEffect(() => {
    if (user && user.data) {
      const userData = user.data;
      const commonData = {
        email: userData.email || "",
        phone: userData.phone || "",
        userType: userData.userType || "CUSTOMER",
      };

      let specificData = {};
      if (userData.userType === "VENDOR") {
        specificData = {
          vendorName: userData.vendor_name || "",
          serviceType: userData.service_type || "",
          contactPersonFirstName: userData.contact_person_first_name || "",
          contactPersonLastName: userData.contact_person_last_name || "",
          streetName: userData.street_name || "",
          city: userData.city || "",
          state: userData.state || "",
          pin: userData.pin || "",
          accountNo: userData.account_no || "",
          ifscCode: userData.ifsc_code || "",
          amtDue: userData.amt_due || 0,
          status: userData.status || "INACTIVE",
        };
      } else {
        specificData = {
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          dateOfBirth: userData.date_of_birth ? userData.date_of_birth.split("T")[0] : "",
          gender: userData.gender || "",
          emergencyContactFirstName: userData.emergency_contact_first_name || "",
          emergencyContactLastName: userData.emergency_contact_last_name || "",
          emergencyContactNo: userData.emergency_contact_no || "",
        };
      }
      setProfileData({ ...commonData, ...specificData });
    }
  }, [user]);

  // Effect for scrolling to the password section
  useEffect(() => {
    if (isPasswordSectionVisible && passwordCardRef.current) {
      passwordCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isPasswordSectionVisible]);

  // --- Handlers ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Maps state (camelCase) back to the API's format (snake_case) on save
  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      let dataToSend = {
        email: profileData.email,
        phone: profileData.phone,
      };

      if (profileData.userType === 'VENDOR') {
        Object.assign(dataToSend, {
          vendor_name: profileData.vendorName,
          contact_person_first_name: profileData.contactPersonFirstName,
          contact_person_last_name: profileData.contactPersonLastName,
          street_name: profileData.streetName,
          city: profileData.city,
          state: profileData.state,
          pin: profileData.pin,
          account_no: profileData.accountNo,
          ifsc_code: profileData.ifscCode,
        });
      } else {
        Object.assign(dataToSend, {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          date_of_birth: profileData.dateOfBirth,
          gender: profileData.gender,
          emergency_contact_first_name: profileData.emergencyContactFirstName,
          emergency_contact_last_name: profileData.emergencyContactLastName,
          emergency_contact_no: profileData.emergencyContactNo,
        });
      }

      const response = await axios.put("auth/profile", dataToSend);

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
      const response = await axios.post("auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.status === 200) {
        alert("Password updated successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setIsPasswordSectionVisible(false);
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update password.");
      console.error("Password update error:", err);
    }
  };

  // --- Conditional Rendering for loading/error states ---
  if (isAuthenticated === null) {
    return <div className="profile-page-status">Loading your profile...</div>;
  }
  if (!isAuthenticated) {
    return (
      <div className="profile-page-status error">
        Could not load profile. Please log in.
      </div>
    );
  }

  return (
    <div className="profile-page">
      <section className="profile-header">
        <h1>My Account</h1>
        <p>View and manage your {profileData.userType?.toLowerCase()} details and security settings.</p>
      </section>

      <div className="profile-container container">
        <div className="profile-card">
          <div className="card-header">
            <h2>
              <div className="card-icon"><UserIcon /></div>
              {profileData.userType === 'VENDOR' ? 'Vendor Information' : 'Personal Details'}
            </h2>
            <div className="card-header-actions">
              {!isEditing && !isPasswordSectionVisible && (
                <button className="btn-link" onClick={() => setIsPasswordSectionVisible(true)}>
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
              {profileData.userType === 'CUSTOMER' ? (
                <>
                  <ProfileField label="First Name" name="firstName" value={profileData.firstName} onChange={handleProfileChange} isEditing={isEditing} />
                  <ProfileField label="Last Name" name="lastName" value={profileData.lastName} onChange={handleProfileChange} isEditing={isEditing} />
                </>
              ) : (
                 <>
                   <ProfileField label="Firm Name" name="vendorName" value={profileData.vendorName} onChange={handleProfileChange} isEditing={isEditing} />
                   <ProfileField label="Service Type" name="serviceType" value={profileData.serviceType} isEditing={isEditing} isEditable={false} />
                 </>
              )}
              <ProfileField label="Email Address" name="email" value={profileData.email} isEditing={isEditing} isEditable={false} />
              <ProfileField label="Phone Number" name="phone" value={profileData.phone} onChange={handleProfileChange} isEditing={isEditing} type="tel" />
              
              {profileData.userType === 'CUSTOMER' && (
                <>
                  <ProfileField label="Date of Birth" name="dateOfBirth" value={profileData.dateOfBirth} onChange={handleProfileChange} isEditing={isEditing} type="date" />
                  <div className="form-group">
                    <label>Gender</label>
                    {isEditing ? (
                      <select name="gender" value={profileData.gender || ''} onChange={handleProfileChange}>
                        <option value="">Select...</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (<p>{profileData.gender || 'Not set'}</p>)}
                  </div>
                </>
              )}
            </div>

            {profileData.userType === 'VENDOR' && (
              <>
                <hr className="divider" />
                <h3>Contact Person</h3>
                <div className="details-grid">
                  <ProfileField label="First Name" name="contactPersonFirstName" value={profileData.contactPersonFirstName} onChange={handleProfileChange} isEditing={isEditing} />
                  <ProfileField label="Last Name" name="contactPersonLastName" value={profileData.contactPersonLastName} onChange={handleProfileChange} isEditing={isEditing} />
                </div>
                
                <hr className="divider" />
                <h3>Address</h3>
                <div className="details-grid">
                  <ProfileField label="Street Name" name="streetName" value={profileData.streetName} onChange={handleProfileChange} isEditing={isEditing} />
                  <ProfileField label="City" name="city" value={profileData.city} onChange={handleProfileChange} isEditing={isEditing} />
                  <ProfileField label="State" name="state" value={profileData.state} onChange={handleProfileChange} isEditing={isEditing} />
                  <ProfileField label="PIN Code" name="pin" value={profileData.pin} onChange={handleProfileChange} isEditing={isEditing} />
                </div>
                
                <hr className="divider" />
                <h3>Bank & Status</h3>
                <div className="details-grid">
                   <ProfileField label="Account Number" name="accountNo" value={profileData.accountNo} onChange={handleProfileChange} isEditing={isEditing} />
                   <ProfileField label="IFSC Code" name="ifscCode" value={profileData.ifscCode} onChange={handleProfileChange} isEditing={isEditing} />
                   <div className="form-group">
                      <label>Status</label>
                      <p><span className={`status-badge ${profileData.status?.toLowerCase()}`}>{profileData.status}</span></p>
                   </div>
                   <div className="form-group">
                      <label>Amount Due</label>
                      <p className="amount">₹{profileData.amtDue}</p>
                   </div>
                </div>
              </>
            )}

            {profileData.userType === 'CUSTOMER' && (
                <>
                  <hr className="divider" />
                  <h3>Emergency Contact</h3>
                  <div className="details-grid">
                      <ProfileField label="First Name" name="emergencyContactFirstName" value={profileData.emergencyContactFirstName} onChange={handleProfileChange} isEditing={isEditing} />
                      <ProfileField label="Last Name" name="emergencyContactLastName" value={profileData.emergencyContactLastName} onChange={handleProfileChange} isEditing={isEditing} />
                      <ProfileField label="Phone Number" name="emergencyContactNo" value={profileData.emergencyContactNo} onChange={handleProfileChange} isEditing={isEditing} type="tel" />
                  </div>
                </>
            )}

            {isEditing && (
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
        
        {isPasswordSectionVisible && (
           <div className="profile-card" ref={passwordCardRef}>
             <div className="card-header">
               <h2>
                 <div className="card-icon"><LockIcon /></div>
                 Change Password
               </h2>
             </div>
             <form onSubmit={handlePasswordUpdate}>
               <div className="details-grid">
                 <div className="form-group full-width">
                   <label>Current Password</label>
                   <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
                 </div>
                 <div className="form-group">
                   <label>New Password</label>
                   <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required />
                 </div>
                 <div className="form-group">
                   <label>Confirm New Password</label>
                   <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
                 </div>
               </div>
               <div className="form-actions">
                 <button type="button" className="btn-secondary" onClick={() => setIsPasswordSectionVisible(false)}>
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