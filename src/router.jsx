import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import ExplorePackages from "./pages/ExplorePackages";
import { UserProvider } from "./context/context";
import Layout from "./layout/Layout";
import TourPackages from "./pages/TourPackage";
import StaffLogin from "./pages/StaffLogin";
import ProtectedRoute from "./pages/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import VendorGuidesPage from "./pages/VendorGuidesPage";
import VendorTransportPage from "./pages/VendorTransportPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <UserProvider>
        <Layout />
      </UserProvider>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "/admin/dashboard",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      // {
      //   path: "/vendor/dashboard",
      //   element: (
      //     <ProtectedRoute requiredUserType="VENDOR">
      //       <VendorDashboard />
      //     </ProtectedRoute>
      //   ),
      // },
      {
        path: "/vendor/guides",
        element: (
          <ProtectedRoute requiredUserType="VENDOR" requiredServiceType="Guide_Provider">
            <VendorGuidesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/vendor/transports",
        element: (
          <ProtectedRoute requiredUserType="VENDOR" requiredServiceType="Transport_Provider">
            <VendorTransportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "TourPackages",
        element: <TourPackages />,
      },
      {
        path: "explore",
        element: <ExplorePackages />,
      },
      {
        path: "/staff/login",
        element: <StaffLogin />,
      },
    ],
  },
]);
