import React from "react";
import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import Navbar from "./components/Navbar";
import { UserProvider } from "./context/context";

const App = () => {
  return (
    <UserProvider>
      <Navbar />
      <RouterProvider router={router}>
      </RouterProvider>
    </UserProvider>
  );
};

export default App;
