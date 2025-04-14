import React, { createContext, useState, useEffect, useCallback } from "react"; // Import useEffect, useCallback
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import PerfumeDetail from "./pages/PerfumeDetail";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Login from "./pages/Login";
import About from "./pages/About";
import Aszf from "./pages/Aszf";
import Favorites from "./pages/Favorites"; // Import Favorites

import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

// AuthContext létrehozása
export const AuthContext = createContext();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // Store user data
  const [token, setToken] = useState(localStorage.getItem("token")); // Get token from localStorage

  // Check login status on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user"); // Assuming user data is stored as JSON string
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user data", e);
          // Handle potential corrupted data, maybe log out
          logout();
        }
      }
      // Optional: Verify token validity with backend here if needed
    }
  }, []);

  // Login function to update context and localStorage
  const login = useCallback((userData, userToken) => {
    try {
      console.log("[Context] Updating context login:", userData);
      localStorage.setItem("token", userToken);
      localStorage.setItem("isLoggedIn", "true");
      // Győződj meg róla, hogy userData nem null/undefined
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        localStorage.removeItem("user"); // Vagy kezeld a hibát
      }
      setToken(userToken);
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("[Context] Error during login update:", error);
      // Itt is lehet hiba, pl. ha userData nem szerializálható
    }
  }, []);

  // Logout function to update context and clear localStorage
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("username"); // Clear legacy items if needed
    localStorage.removeItem("email"); // Clear legacy items if needed
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    // Optionally navigate to home or login page after logout
    // navigate('/'); // Requires useNavigate hook, place inside component or pass navigate
  }, []);

  // Provide auth state and functions to children
  const authContextValue = {
    isLoggedIn,
    user,
    token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {" "}
      {/* Pass the context value */}
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar /> {/* Navbar now has access to AuthContext */}
        <div className="container my-5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/katalogus" element={<Catalog />} />
            <Route path="/kereses" element={<Search />} />
            <Route path="/rolunk" element={<About />} />
            {/* Pass login function to Login component */}
            <Route path="/bejelentkezes" element={<Login />} />
            {/* Pass login function to Register component */}
            <Route path="/regisztracio" element={<Register />} />
            {/* Protected Route Example (adjust as needed) */}
            <Route
              path="/profil"
              element={isLoggedIn ? <Profile /> : <Login />}
            />
            <Route path="/parfume/:id" element={<PerfumeDetail />} />
            <Route path="/aszf" element={<Aszf />} />
            {/* Protected Route for Favorites */}
            <Route
              path="/kedvencek"
              element={isLoggedIn ? <Favorites /> : <Login />}
            />
          </Routes>
        </div>
        <Footer />
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
