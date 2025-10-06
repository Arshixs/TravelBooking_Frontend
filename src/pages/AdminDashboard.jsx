import React, { useState, useEffect } from "react";
import "../styles/AdminDashboard.css";
import axios from "../utils/axios";
import { useUser } from "../context/context";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("vendors");
  const [vendors, setVendors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const { user } = useUser();

  // Form states for staff
  const [staffForm, setStaffForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    salary: "",
  });

  useEffect(() => {
    if (activeTab === "vendors") {
      fetchVendors();
    } else if (activeTab === "staff") {
      fetchStaff();
    }
  }, [activeTab]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/admin/vendors");
      if (response.data.success) {
        setVendors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/admin/staff");
      if (response.data.success) {
        setStaff(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = () => {
    setModalMode("create");
    setStaffForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      role: "",
      salary: "",
      employee_code: "",
      joining_date: "",
    });
    setShowModal(true);
  };

  const handleEditStaff = async (staffId) => {
    try {
      const response = await axios.get(`/admin/staff/${staffId}`);
      if (response.data.success) {
        const staffData = response.data.data;
        setStaffForm({
          first_name: staffData.first_name || "",
          last_name: staffData.last_name || "",
          email: staffData.email || "",
          phone: staffData.phone || "",
          password: "",
          role: staffData.role || "",
          salary: staffData.salary || "",
        });
        setSelectedItem(staffId);
        setModalMode("edit");
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching staff details:", error);
      toast.error("Failed to fetch staff details");
    }
  };

  const handleSubmitStaff = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (modalMode === "create") {
        staffForm.joining_date = new Date();
        const response = await axios.post("/admin/staff", staffForm);
        if (response.data.success) {
          toast.success("Staff created successfully");
          fetchStaff();
          setShowModal(false);
        }
      } else {
        // For edit mode
        const updateData = { ...staffForm };
        if (!updateData.password) {
          delete updateData.password;
        }
        const response = await axios.put(
          `/admin/staff/${selectedItem}`,
          updateData
        );
        if (response.data.success) {
          toast.success("Staff updated successfully");
          fetchStaff();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error("Error saving staff:", error);
      toast.error(error.response?.data?.error || "Failed to save staff");
    } finally {
      setLoading(false);
    }


  };

  //console.log(JSON.parse(localStorage.getItem("user")).userId);
  //console.log(user);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStaffForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Manage vendors and staff members</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "vendors" ? "active" : ""}`}
          onClick={() => setActiveTab("vendors")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16,6 22,6 19,13 13,13"></polygon>
          </svg>
          Vendors
        </button>
        <button
          className={`tab-btn ${activeTab === "staff" ? "active" : ""}`}
          onClick={() => setActiveTab("staff")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Staff
        </button>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {activeTab === "vendors" && (
          <div className="content-section">
            <div className="section-header">
              <h2>Vendor Management</h2>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading vendors...</p>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Vendor Name</th>
                      <th>Service Type</th>
                      <th>Contact Person</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>City</th>
                      <th>Status</th>
                      <th>Amount Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.length > 0 ? (
                      vendors.map((vendor) => (
                        <tr key={vendor.vendorId}>
                          <td>{vendor.vendorId}</td>
                          <td className="vendor-name">{vendor.vendor_name}</td>
                          <td>
                            <span className="badge badge-service">
                              {vendor.service_type}
                            </span>
                          </td>
                          <td>
                            {vendor.contact_person_first_name}{" "}
                            {vendor.contact_person_last_name}
                          </td>
                          <td>{vendor.email}</td>
                          <td>{vendor.phone}</td>
                          <td>{vendor.city}</td>
                          <td>
                            <span
                              className={`badge badge-status ${
                                vendor.status === "AVAILABLE"
                                  ? "badge-active"
                                  : "badge-inactive"
                              }`}
                            >
                              {vendor.status}
                            </span>
                          </td>
                          <td className="amount">₹{vendor.amt_due || 0}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="no-data">
                          No vendors found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "staff" && (
          <div className="content-section">
            <div className="section-header">
              <h2>Staff Management</h2>
              <button className="btn-create" onClick={handleCreateStaff}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Staff
              </button>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading staff...</p>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Employee Code</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Joining Date</th>
                      <th>Salary</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.length > 0 ? (
                      staff.map((member) => (
                        <tr key={member.staff_id}>
                          <td>{member.staff_id}</td>
                          <td className="employee-code">
                            {member.employee_code}
                          </td>
                          <td>
                            {member.first_name} {member.last_name}
                          </td>
                          <td>{member.email}</td>
                          <td>{member.phone}</td>
                          <td>
                            <span
                              className={`badge badge-role ${
                                member.role === "admin"
                                  ? "badge-admin"
                                  : member.role==="PackageManager"? "badge-package" :"badge-staff"
                              }`}
                            >
                              {member.role === "PackageManager"
                                ? "Package Manager"
                                : member.role ==="admin" ? "Admin" : "Blog Writer"}
                            </span>
                          </td>
                          <td>
                            {new Date(member.joining_date).toLocaleDateString()}
                          </td>
                          <td className="amount">₹{Math.round(member.salary)}</td>
                          <td>

                          {member.staff_id!==JSON.parse(localStorage.getItem("user")).userId ? <button
                              className="btn-action-admin btn-edit-action-admin"
                              onClick={() => handleEditStaff(member.staff_id)}
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
                              Edit
                            </button>: <button>{" "}</button> }
                            
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="no-data">
                          No staff members found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Create/Edit Staff */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === "create" ? "Create New Staff" : "Edit Staff"}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitStaff}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name *</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={staffForm.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last_name">Last Name *</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={staffForm.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                {modalMode === "create"}
                <div className="form-row">
                  {modalMode === "create" && <div className="form-group">
                    <label htmlFor="last_name">Employee Code *</label>
                    <input
                      type="text"
                      id="employee_code"
                      name="employee_code"
                      value={staffForm.employee_code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>}
                  <div className="form-group">
                    <label htmlFor="phone">Phone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={staffForm.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                {modalMode === "create" && (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={staffForm.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="password">
                        Password{" "}
                        {modalMode === "edit" &&
                          "(Leave blank to keep current)"}
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={staffForm.password}
                        onChange={handleInputChange}
                        required={modalMode === "create"}
                      />
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="role">Role *</label>
                    <select
                      id="role"
                      name="role"
                      value={staffForm.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="admin">Admin</option>
                      <option value="PackageManager">Package Manager</option>
                      <option value="BlogWriter">Blog Writer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="salary">Salary *</label>
                    <input
                      type="number"
                      id="salary"
                      name="salary"
                      value={staffForm.salary}
                      onChange={handleInputChange}
                      required
                      min="0"
                      
                    />
                  </div>
                </div>
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
                    ? "Create Staff"
                    : "Update Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
