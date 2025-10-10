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
import ManageBlogs from "./pages/ManageBlogs";
import BlogPage from "./pages/BlogPage";
import BlogPostDetail from "./pages/BlogPostDetail";
import PackagePage from "./pages/PackagePage";
import VendorContactsPage from "./pages/VendorContactsPage";
import Hotels from "./pages/Hotels";
import HotelDetails from "./pages/HotelDetails";
import CustomerSupportTickets from "./pages/CustomerSupportTickets";
import ManageSupportTickets from "./pages/ManageSupportTickets";
import TicketDetailPage from "./pages/TicketDetailPage";
import VendorHotelsPage from "./pages/VendorHotelsPage";
import VendorRoomPage from "./pages/VendorRoomPage";

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
          <ProtectedRoute
            requiredUserType="VENDOR"
            requiredServiceType="Guide_Provider"
          >
            <VendorGuidesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/vendor/transports",
        element: (
          <ProtectedRoute
            requiredUserType="VENDOR"
            requiredServiceType="Transport_Provider"
          >
            <VendorTransportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/vendor/hotels",
        element: (
          <ProtectedRoute
            requiredUserType="VENDOR"
            requiredServiceType="Hotel_Provider"
          >
            <VendorHotelsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "vendor/hotels/:id/rooms",
        element: (
          <ProtectedRoute
            requiredUserType="VENDOR"
            requiredServiceType="Hotel_Provider"
          >
            <VendorRoomPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/packages",
        element: (
          <ProtectedRoute requiredRole="admin">
            <TourPackages />
          </ProtectedRoute>
        ),
      },
      {
        path: "explore",
        element: <ExplorePackages />,
      },
      {
        path: "/staff/login",
        element: <StaffLogin />,
      },
      {
        path: "/staff/blogs",
        element: (
          <ProtectedRoute requiredUserType="STAFF" requiredRole="ContentWriter">
            <ManageBlogs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/blogs",
        element: <BlogPage />,
      },
      {
        path: "/blogs/:id",
        element: <BlogPostDetail />,
      },
      {
        path: "/package/:slug",
        element: <PackagePage />,
      },
      {
        path:"/vendor/contact",
        element: <VendorContactsPage/>
      },
      {
        path: "hotels", // new Hotels route
        element: <Hotels />,
      },
      {
        path: "hotels/:id", // Added route for hotel details
        element: <HotelDetails />,
      },

      {
        path: "/support/tickets",
        element: (
          <ProtectedRoute requiredUserType="CUSTOMER">
            <CustomerSupportTickets />
          </ProtectedRoute>
        ),
      },

      {
        path: "/support/tickets/:id",
        element: (
          <ProtectedRoute requiredUserType="CUSTOMER">
            <TicketDetailPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "/staff/support-tickets",
        element: (
          <ProtectedRoute requiredUserType="STAFF">
            <ManageSupportTickets />
          </ProtectedRoute>
        ),
      },

      {
        path: "/staff/support-tickets/:id",
        element: (
          <ProtectedRoute requiredUserType="STAFF" requiredRole= "CustomerCare">
            <TicketDetailPage />
          </ProtectedRoute>
        ),
      }

    ],
  },
]);