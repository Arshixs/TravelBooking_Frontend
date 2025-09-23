import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import LoginPage from "./pages/Login";
import Profile from "./pages/Profile";
import SignupPage from "./pages/Signup";

function App() {
  return (
    <>
      <Navbar />
      {/* <LoginPage /> */}
      {/* <SignupPage /> */}
      {/* <Home /> */}
      <Profile/>
    </>
  );
}

export default App;
