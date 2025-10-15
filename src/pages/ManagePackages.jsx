import React, { useState, useEffect } from "react";
import "../styles/AdminDashboard.css";
import axios from "../utils/axios";
import { useUser } from "../context/context";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import PackageFormModal from "./PackageFormModal"; // NEW: Import the package modal

const ManagePackages = () => {
  const [activeTab, setActiveTab] = useState("packages");
  const [vendors, setVendors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null); // To hold data for editing

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
    if (activeTab === "packages") {
      fetchPackages();
    }
  }, [activeTab]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/packages/");
      if (response.data.success) {
        console.log(response);
        setPackages(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching Packages: ", error);
      toast.error("Failed to fetch packages");
    } finally {
      setLoading(false);
    }
  };

  const handlePackageView = (slug) => {
    navigate(`/package/${slug}`);
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
  // --- NEW: Package Modal Handlers ---
  const handleCreatePackage = () => {
    setSelectedPackage(null); // Ensure no data is passed for "create" mode
    setShowPackageModal(true);
  };

  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg); // Pass the selected package's data to the modal
    setShowPackageModal(true);
  };

  const handleSavePackage = () => {
    setShowPackageModal(false); // Close the modal
    fetchPackages(); // Refresh the packages list to show changes
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-dashboard-header">
        <div className="header-content">
          <h1>Manage Packages</h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "packages" ? "active" : ""}`}
          onClick={() => setActiveTab("packages")}
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
          Packages
        </button>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {activeTab === "packages" && (
          <div className="content-section">
            <div className="section-header">
              <h2>Package Management</h2>
              {/* NEW: Button to open the create package modal */}
              <button className="btn-create" onClick={handleCreatePackage}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Package
              </button>
            </div>

            {loading ? (
              <div className="loading-state">{/* ... */}</div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Package Name</th>
                      <th>Tour Type</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.length > 0 ? (
                      packages.map((pkg) => (
                        <tr key={pkg.packageId}>
                          <td>{pkg.packageId}</td>
                          <td className="vendor-name">{pkg.name}</td>
                          <td>
                            <span className="badge badge-service">
                              {pkg.tour_type}
                            </span>
                          </td>
                          <td className="amount">₹{pkg.price}</td>
                          <td>
                            <span
                              className={`badge badge-status ${pkg.status.toLowerCase()}`}
                            >
                              {pkg.status}
                            </span>
                          </td>
                          <td>
                            {/* UPDATED: Button now opens the edit modal */}
                            <button
                              className="btn-action-admin btn-edit-action-admin"
                              onClick={() => handleEditPackage(pkg)}
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
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="no-data">
                          No packages found
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

      {/* --- NEW: Render the Package Modal Conditionally --- */}
      {showPackageModal && (
        <PackageFormModal
          packageData={selectedPackage}
          onClose={() => setShowPackageModal(false)}
          onSave={handleSavePackage}
        />
      )}
    </div>
  );
};

export default ManagePackages;
