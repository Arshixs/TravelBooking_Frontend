import { memo, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Layout = memo(() => {
  const location = useLocation();
  const { pathname } = location;
  useEffect(() => {}, [pathname]);

  return <Outlet />;
});

export default Layout;
