import React, { useState, useEffect } from "react";
import "../styles/AdminDashboard.css";
import axios from "../utils/axios";
import { useUser } from "../context/context";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("vendors");
  const [vendors, setVendors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [refundStatusFilter, setRefundStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create', 'edit', 'editRefund', 'viewRefund'
  const [selectedItem, setSelectedItem] = useState(null);
  const [refundDetails, setRefundDetails] = useState(null);
  const [loadingRefundDetails, setLoadingRefundDetails] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

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

  // Form states for refund
  const [refundForm, setRefundForm] = useState({
    status: "",
    reference: "",
  });

  useEffect(() => {
    if (activeTab === "vendors") {
      fetchVendors();
    } else if (activeTab === "staff") {
      fetchStaff();
    } else if (activeTab === "refunds") {
      fetchRefunds();
    }
  }, [activeTab, refundStatusFilter]);

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

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const url =
        refundStatusFilter === "ALL"
          ? "/payments/refunds"
          : `/payments/refunds?status=${refundStatusFilter}`;
      const response = await axios.get(url);

      console.log(response);
      if (response.data.success) {
        setRefunds(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
      toast.error("Failed to fetch refunds");
    } finally {
      setLoading(false);
    }
  };

  const fetchRefundDetails = async (paymentId, refundId) => {
    setLoadingRefundDetails(true);
    try {
      const response = await axios.get(
        `/payments/refund/${paymentId}/${refundId}`
      );
      if (response.data.success) {
        setRefundDetails(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching refund details:", error);
      toast.error("Failed to fetch refund details");
      return null;
    } finally {
      setLoadingRefundDetails(false);
    }
  };

  const handleViewRefund = async (refund) => {
    const details = await fetchRefundDetails(
      refund.payment_id,
      refund.refund_id
    );
    if (details) {
      setSelectedItem(refund);
      setRefundForm({
        status: details.refundDetails.refund_status || "PROCESSING",
        reference: details.refundDetails.reference || "",
      });
      setModalMode("viewRefund");
      setShowModal(true);
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

  const handleEditRefund = (refund) => {
    setRefundForm({
      status: refund.status || "PROCESSING",
      reference: refund.reference || "",
    });
    setSelectedItem(refund);
    setModalMode("editRefund");
    setShowModal(true);
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

  const handleSubmitRefundFromView = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation for COMPLETED status
      if (
        refundForm.status === "COMPLETED" &&
        (!refundForm.reference || refundForm.reference.trim() === "")
      ) {
        toast.error(
          "Transaction reference is required when marking refund as COMPLETED"
        );
        setLoading(false);
        return;
      }

      const response = await axios.put(
        `/payments/refund/${refundDetails.paymentDetails.payment_id}/${refundDetails.refundDetails.refund_id}`,
        refundForm
      );
      if (response.data.success) {
        toast.success("Refund status updated successfully");
        fetchRefunds();
        setShowModal(false);
        setRefundDetails(null);
      }
    } catch (error) {
      console.error("Error updating refund:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update refund";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRefund = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(
        `/payments/refund/${selectedItem.paymentId}/${selectedItem.refundId}`,
        refundForm
      );
      if (response.data.success) {
        toast.success("Refund status updated successfully");
        fetchRefunds();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error updating refund:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update refund";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStaffForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRefundInputChange = (e) => {
    const { name, value } = e.target;
    setRefundForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "badge-active";
      case "REJECTED":
      case "FAILED":
        return "badge-inactive";
      case "PROCESSING":
        return "badge-processing";
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Manage vendors, staff members, and refunds</p>
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
        <button
          className={`tab-btn ${activeTab === "refunds" ? "active" : ""}`}
          onClick={() => setActiveTab("refunds")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Refunds
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
                                  : member.role === "PackageManager"
                                  ? "badge-package"
                                  : "badge-staff"
                              }`}
                            >
                              {member.role === "PackageManager"
                                ? "Package Manager"
                                : member.role === "admin"
                                ? "Admin"
                                : member.role === "CustomerCare"
                                ? "Customer Care"
                                : "Blog Writer"}
                            </span>
                          </td>
                          <td>
                            {new Date(member.joining_date).toLocaleDateString()}
                          </td>
                          <td className="amount">
                            ₹{Math.round(member.salary)}
                          </td>
                          <td>
                            {member.staff_id !==
                            JSON.parse(localStorage.getItem("user")).userId ? (
                              <button
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
                              </button>
                            ) : (
                              <button> </button>
                            )}
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

        {activeTab === "refunds" && (
          <div className="content-section">
            <div className="section-header">
              <h2>Refund Management</h2>
              <div className="filter-controls">
                <label htmlFor="statusFilter">Filter by Status:</label>
                <select
                  id="statusFilter"
                  value={refundStatusFilter}
                  onChange={(e) => setRefundStatusFilter(e.target.value)}
                  className="status-filter"
                >
                  <option value="ALL">All Refunds</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading refunds...</p>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Refund ID</th>
                      <th>Amount</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Reference</th>
                      <th>Requested Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refunds.length > 0 ? (
                      refunds.map((refund) => (
                        <tr key={refund.refund_id}>
                          <td>{refund.payment_id}</td>
                          <td>{refund.refund_id}</td>
                          <td className="amount">₹{refund.refund_amount}</td>
                          <td className="refund-reason">
                            {refund.refund_reason || "N/A"}
                          </td>
                          <td>
                            <span
                              className={`badge badge-status ${getStatusColor(
                                refund.status
                              )}`}
                            >
                              {refund.refund_status}
                            </span>
                          </td>
                          <td>{refund.reference || "N/A"}</td>
                          <td>
                            {new Date(refund.processed_at).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              className="btn-action-admin btn-view-action-admin"
                              onClick={() => handleViewRefund(refund)}
                              style={{ marginRight: "8px" }}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="no-data">
                          No refunds found
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
      {showModal && (modalMode === "create" || modalMode === "edit") && (
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
                <div className="form-row">
                  {modalMode === "create" && (
                    <div className="form-group">
                      <label htmlFor="employee_code">Employee Code *</label>
                      <input
                        type="text"
                        id="employee_code"
                        name="employee_code"
                        value={staffForm.employee_code}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}
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
                      <label htmlFor="password">Password *</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={staffForm.password}
                        onChange={handleInputChange}
                        required
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
                      <option value="ContentWriter">Blog Writer</option>
                      <option value="CustomerCare">Customer Care</option>
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

      {/* Modal for View/Edit Refund */}
      {showModal && modalMode === "viewRefund" && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Refund Details</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            {loadingRefundDetails ? (
              <div className="loading-state" style={{ padding: "40px" }}>
                <div className="spinner"></div>
                <p>Loading refund details...</p>
              </div>
            ) : refundDetails ? (
              <form onSubmit={handleSubmitRefundFromView}>
                <div className="modal-body">
                  {/* Refund Information */}
                  <div className="detail-section">
                    <h3 className="detail-section-title">Refund Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Refund ID:</span>
                        <span className="detail-value">
                          {refundDetails.refundDetails.refund_id}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Payment ID:</span>
                        <span className="detail-value">
                          {refundDetails.refundDetails.payment_id}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Refund Amount:</span>
                        <span className="detail-value amount">
                          ₹{refundDetails.refundDetails.refund_amount}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">
                          Processing Charges:
                        </span>
                        <span className="detail-value amount">
                          ₹{refundDetails.refundDetails.processing_charges}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span
                          className={`badge badge-status ${getStatusColor(
                            refundDetails.refundDetails.refund_status
                          )}`}
                        >
                          {refundDetails.refundDetails.refund_status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Processed At:</span>
                        <span className="detail-value">
                          {formatDateTime(
                            refundDetails.refundDetails.processed_at
                          )}
                        </span>
                      </div>
                      <div className="detail-item detail-full-width">
                        <span className="detail-label">Refund Reason:</span>
                        <span className="detail-value">
                          {refundDetails.refundDetails.refund_reason || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="detail-section">
                    <h3 className="detail-section-title">
                      Payment Information
                    </h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Original Amount:</span>
                        <span className="detail-value amount">
                          ₹{refundDetails.paymentDetails.amount}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Payment Mode:</span>
                        <span className="detail-value">
                          {refundDetails.paymentDetails.payment_mode}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Payment Status:</span>
                        <span
                          className={`badge badge-status ${getStatusColor(
                            refundDetails.paymentDetails.status
                          )}`}
                        >
                          {refundDetails.paymentDetails.status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Payment Date:</span>
                        <span className="detail-value">
                          {formatDateTime(
                            refundDetails.paymentDetails.payment_datetime
                          )}
                        </span>
                      </div>
                      <div className="detail-item detail-full-width">
                        <span className="detail-label">
                          Transaction Reference:
                        </span>
                        <span className="detail-value">
                          {refundDetails.paymentDetails.transaction_reference ||
                            "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="detail-section">
                    <h3 className="detail-section-title">
                      Customer Information
                    </h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Customer Name:</span>
                        <span className="detail-value">
                          {refundDetails.customer.first_name}{" "}
                          {refundDetails.customer.last_name}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">
                          {refundDetails.customer.email}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">
                          {refundDetails.customer.phone}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Customer ID:</span>
                        <span className="detail-value">
                          {refundDetails.customer.customer_id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Information */}
                  <div className="detail-section">
                    <h3 className="detail-section-title">
                      Booking Information
                    </h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Booking ID:</span>
                        <span className="detail-value">
                          {refundDetails.bookingDetails.booking_id}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Booking Type:</span>
                        <span className="badge badge-service">
                          {refundDetails.bookingDetails.booking_type}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Booking Status:</span>
                        <span
                          className={`badge badge-status ${getStatusColor(
                            refundDetails.bookingDetails.booking_status
                          )}`}
                        >
                          {refundDetails.bookingDetails.booking_status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Created At:</span>
                        <span className="detail-value">
                          {formatDateTime(
                            refundDetails.bookingDetails.created_at
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hotel Booking Details (if applicable) */}
                  {refundDetails.hotelBooking && (
                    <div className="detail-section">
                      <h3 className="detail-section-title">
                        Hotel Booking Details
                      </h3>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Check-in Date:</span>
                          <span className="detail-value">
                            {formatDate(
                              refundDetails.hotelBooking.check_in_date
                            )}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Check-out Date:</span>
                          <span className="detail-value">
                            {formatDate(
                              refundDetails.hotelBooking.check_out_date
                            )}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">
                            Number of Nights:
                          </span>
                          <span className="detail-value">
                            {refundDetails.hotelBooking.number_of_nights}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Number of Rooms:</span>
                          <span className="detail-value">
                            {refundDetails.hotelBooking.no_of_rooms}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Room Type:</span>
                          <span className="detail-value">
                            {refundDetails.hotelBooking.room_type}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Guest Count:</span>
                          <span className="detail-value">
                            {refundDetails.hotelBooking.guest_count}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Booking Cost:</span>
                          <span className="detail-value amount">
                            ₹{refundDetails.hotelBooking.cost}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Hotel Status:</span>
                          <span
                            className={`badge badge-status ${getStatusColor(
                              refundDetails.hotelBooking.status
                            )}`}
                          >
                            {refundDetails.hotelBooking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Package Booking Details (if applicable) */}
                  {refundDetails.packageBooking && (
                    <div className="detail-section">
                      <h3 className="detail-section-title">
                        Package Booking Details
                      </h3>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Package ID:</span>
                          <span className="detail-value">
                            {refundDetails.packageBooking.package_id}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Start Date:</span>
                          <span className="detail-value">
                            {formatDate(
                              refundDetails.packageBooking.start_date
                            )}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">End Date:</span>
                          <span className="detail-value">
                            {formatDate(refundDetails.packageBooking.end_date)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">
                            Number of People:
                          </span>
                          <span className="detail-value">
                            {refundDetails.packageBooking.number_of_people}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Editable Section - Only show if status is PROCESSING */}
                  {refundDetails.refundDetails.refund_status ===
                    "PROCESSING" && (
                    <div className="detail-section edit-section">
                      <h3 className="detail-section-title">
                        Update Refund Status
                      </h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="status">Status *</label>
                          <select
                            id="status"
                            name="status"
                            value={refundForm.status}
                            onChange={handleRefundInputChange}
                            required
                          >
                            <option value="PROCESSING">Processing</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="reference">
                            Transaction Reference{" "}
                            {refundForm.status === "COMPLETED" && "*"}
                          </label>
                          <input
                            type="text"
                            id="reference"
                            name="reference"
                            value={refundForm.reference}
                            onChange={handleRefundInputChange}
                            placeholder="Enter transaction reference or notes"
                            required={refundForm.status === "COMPLETED"}
                          />
                          {refundForm.status === "COMPLETED" && (
                            <small
                              style={{ color: "#e74c3c", fontSize: "12px" }}
                            >
                              Required when marking as completed
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setRefundDetails(null);
                    }}
                  >
                    Close
                  </button>
                  {refundDetails.refundDetails.refund_status ===
                    "PROCESSING" && (
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Refund Status"}
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="modal-body">
                <p>Failed to load refund details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for Edit Refund (Old) */}
      {showModal && modalMode === "editRefund" && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Refund Status</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitRefund}>
              <div className="modal-body">
                <div className="refund-info">
                  <p>
                    <strong>Refund ID:</strong> {selectedItem?.refundId}
                  </p>
                  <p>
                    <strong>Payment ID:</strong> {selectedItem?.paymentId}
                  </p>
                  <p>
                    <strong>Amount:</strong> ₹{selectedItem?.amount}
                  </p>
                  <p>
                    <strong>Customer:</strong> {selectedItem?.customerFirstName}{" "}
                    {selectedItem?.customerLastName}
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={refundForm.status}
                    onChange={handleRefundInputChange}
                    required
                  >
                    <option value="PROCESSING">Processing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="reference">Reference</label>
                  <input
                    type="text"
                    id="reference"
                    name="reference"
                    value={refundForm.reference}
                    onChange={handleRefundInputChange}
                    placeholder="Enter transaction reference or notes"
                  />
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
                  {loading ? "Updating..." : "Update Refund"}
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
