// frontend/src/pages/Register.js
import React, { useState, useContext } from "react"; // Import useContext
import { useNavigate } from "react-router-dom";
import { register as registerService } from "../services/authService"; // Rename to avoid conflict
import { AuthContext } from "../App"; // Import AuthContext

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Get login function from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (password !== confirmPassword) {
      setError("A jelszavak nem egyeznek!");
      return;
    }
    if (password.length < 6) {
      setError("A jelszónak legalább 6 karakter hosszúnak kell lennie!");
      return;
    }

    setLoading(true); // Set loading true

    try {
      // Call the register service
      const { user, token } = await registerService(name, email, password);

      // Call the context login function to log the user in immediately after registration
      login(user, token);

      // Navigate to profile page on successful registration
      navigate("/profil");
    } catch (error) {
      // Use the error message from the service or a default one
      setError(error.message || "Regisztráció sikertelen!");
      console.error("Registration failed:", error);
    } finally {
      setLoading(false); // Set loading false
    }
  };

  return (
    <div className="container">
      <h1>Regisztráció</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Felhasználónév
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading} // Disable input while loading
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email cím
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading} // Disable input while loading
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Jelszó
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading} // Disable input while loading
          />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Jelszó megerősítése
          </label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading} // Disable input while loading
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Regisztráció..." : "Regisztráció"}
        </button>
      </form>
    </div>
  );
};

export default Register;
