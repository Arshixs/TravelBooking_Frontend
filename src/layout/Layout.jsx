import { memo, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const Layout = memo(() => {
  const location = useLocation();
  const { pathname } = location;
  useEffect(() => {}, [pathname]);

  return (
    <div className="app-layout">
      <Navbar /> 
      <main>
        <Outlet />
      </main>
      <Footer /> 
    </div>
  );
});

export default Layout;
