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
import VendorContactsPage from "./pages/VendorContactsPage";
import Hotels from "./pages/Hotels";
import HotelCreate from "./pages/HotelCreate";
import RoomCreate from "./pages/RoomCreate";
import HotelUpdate from "./pages/HotelUpdate";
import RoomUpdate from "./pages/RoomUpdate";
import HotelDetails from "./pages/HotelDetails";

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
      {
        path: "/staff/blogs",
        element:(
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
        path:"/vendor/contact",
        element: <VendorContactsPage/>
      },
      {
        path: "hotels", // new Hotels route
        element: <Hotels />,
      },
      {
        path: "hotels/create", // new route for creating hotels
        element: <HotelCreate />,
      },
      {
        path: "hotels/edit/:id", // Added route for updating hotels
        element: <HotelUpdate />,
      },
      {
        path: "hotels/:id/rooms/create",
        element: <RoomCreate />,
      },
      {
        path: "hotels/:id/rooms/edit", // Added route for updating rooms
        element: <RoomUpdate />,
      },
      {
        path: "hotels/:id", // Added route for hotel details
        element: <HotelDetails />,
      }
    ],
  },
]);
