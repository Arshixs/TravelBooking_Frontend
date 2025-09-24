import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "../utils/axios";

const UserContext = createContext(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true = logged in, false = not logged in

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (accessToken) {
        try {
          // Use a relative path to work correctly with your axios baseURL
          const res = await axios.get("auth/profile", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (res.data) {
            setUser(res.data);
            setIsAuthenticated(true); // FIX: Set as authenticated
          } else {
            // This case is unlikely if the API is consistent, but good to have
            localStorage.removeItem("accessToken");
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          // FIX: Clean up and set auth state to false on error (e.g., expired token)
          localStorage.removeItem("accessToken");
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // FIX: If no token, we are definitively not authenticated.
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    fetchUser();
  }, [isAuthenticated]);

  return (
    <UserContext.Provider
      value={{ user, setUser, isAuthenticated, setIsAuthenticated }}
    >
      {children}
    </UserContext.Provider>
  );
};
