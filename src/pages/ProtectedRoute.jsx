import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/context";

const ProtectedRoute = ({ children, requiredRole, requiredUserType, requiredServiceType}) => {
  const { user, isAuthenticated } = useUser();

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontSize: "1.2rem",
          color: "#134686",
        }}
      >
        <div>
          <div
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #134686",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          ></div>
          Loading...
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check for required role (for staff)
  if (requiredRole) {
    const userRole = user?.data?.role;
    if (userRole !== requiredRole) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            fontSize: "1.5rem",
            color: "#dc3545",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <h2>Access Denied</h2>
          <p>You do not have permission to access this page.</p>
          <a
            href="/"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#134686",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
            }}
          >
            Go to Home
          </a>
        </div>
      );
    }
  }

  // Check for required user type (for vendor/customer)
  if (requiredUserType) {
    const userType = user?.data?.userType;
    if (userType !== requiredUserType) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            fontSize: "1.5rem",
            color: "#dc3545",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <h2>Access Denied</h2>
          <p>
            This page is only accessible to {requiredUserType.toLowerCase()}s.
          </p>
          <a
            href="/"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#134686",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
            }}
          >
            Go to Home
          </a>
        </div>
      );
    }
  }

  if(requiredServiceType){
    const serviceType=user?.data?.service_type;
    if (serviceType !== requiredServiceType) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            fontSize: "1.5rem",
            color: "#dc3545",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <h2>Access Denied</h2>
          <p>
            This page is only accessible to {requiredServiceType.toLowerCase()}s.
          </p>
          <a
            href="/"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#134686",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
            }}
          >
            Go to Home
          </a>
        </div>
      );
    }

  }
  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;
