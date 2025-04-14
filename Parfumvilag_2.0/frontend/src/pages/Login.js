import React, { useState, useContext } from "react"; // Import useContext
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../services/authService"; // Rename to avoid conflict
import { AuthContext } from "../App"; // Import AuthContext

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Get login function from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Set loading true

    try {
      // Call the login service
      const { user, token } = await loginService(email, password);

      // Call the context login function
      login(user, token);

      // Navigate to profile page on successful login
      navigate("/profil");
    } catch (error) {
      // Use the error message from the service or a default one
      setError(error.message || "Bejelentkezés sikertelen!");
      console.error("Login failed:", error);
    } finally {
      setLoading(false); // Set loading false
    }
  };

  return (
    <div className="container">
      <h1>Bejelentkezés</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
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
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Bejelentkezés..." : "Bejelentkezés"}
        </button>
      </form>
    </div>
  );
};

export default Login;
