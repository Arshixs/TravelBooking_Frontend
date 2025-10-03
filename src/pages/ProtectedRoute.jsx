import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/context";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useUser();

  // Show loading state while authentication is being checked
  if (isAuthenticated === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#fdf4e3",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "#134686",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid #f0f0f0",
              borderTop: "4px solid #ed3f27",
              borderRadius: "50%",
              margin: "0 auto 20px",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user type is STAFF
  if (user?.data?.userType !== "STAFF") {
    return <Navigate to="/" replace />;
  }

  // Check if specific role is required (e.g., "admin")
  if (requiredRole && user?.data?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has correct role
  return children;
};

export default ProtectedRoute;
