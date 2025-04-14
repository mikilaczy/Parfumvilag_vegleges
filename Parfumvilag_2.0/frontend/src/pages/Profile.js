import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, updateUser } from "../services/userService";
import { AuthContext } from "../App";
// *** VISSZAÁLLÍTÁS - Biztosítsd, hogy az útvonal helyes! ***
import placeholderImage from "../assets/placeholder.png";

const Profile = () => {
  const {
    isLoggedIn,
    user: contextUser,
    login: contextLogin,
    logout: contextLogout,
  } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- State Definitions ---
  const [user, setUser] = useState(contextUser || null);
  const [loading, setLoading] = useState(!contextUser);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState("");

  // Form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Input mező értéke

  // --- Initialize Form (Memoized) ---
  const initializeForm = useCallback((userData) => {
    if (!userData) return;
    console.log(
      "[initializeForm] Initializing form state from userData:",
      userData
    );
    setNewName(userData.name || "");
    setNewEmail(userData.email || "");
    setPhoneNumber(userData.phone || "");
    // Itt is az input state-et állítjuk be az alapján, ami a user objektumban van
    const currentImageUrl = userData.profile_picture_url || "";
    setImageUrl(currentImageUrl);
    setNewPassword("");
    setValidationErrors({});
    setUpdateError("");
    setUpdateSuccess("");
  }, []);

  // --- Fetch User Data (Memoized) ---
  const fetchUserData = useCallback(async () => {
    console.log("[fetchUserData] Attempting to fetch...");
    setLoading(true);
    setError("");
    try {
      const fetchedData = await getUser();
      if (!fetchedData) throw new Error("Nem érkeztek felhasználói adatok.");
      console.log("[fetchUserData] Success:", fetchedData);
      setUser(fetchedData);
      contextLogin(fetchedData, localStorage.getItem("token"));
    } catch (err) {
      /* ... hibakezelés ... */
      console.error("[fetchUserData] Error:", err);
      setError(err.message || "Profil betöltési hiba.");
      if (
        err.message?.includes("hitelesít") ||
        err.response?.status === 401 ||
        err.response?.data?.error?.includes("Token")
      ) {
        console.warn("[fetchUserData] Auth error, logging out.");
        contextLogout();
        navigate("/bejelentkezes");
      }
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, contextLogin, contextLogout, navigate]);

  // --- Effects ---
  useEffect(() => {
    if (isLoggedIn && !user && !loading) fetchUserData();
    else if (!isLoggedIn && !loading) navigate("/bejelentkezes");
  }, [isLoggedIn, user, loading, fetchUserData, navigate]);

  useEffect(() => {
    if (user && !editing) initializeForm(user);
  }, [user, editing, initializeForm]);

  // --- Validation (Memoized) ---
  const validateForm = useCallback(() => {
    /* ... validation logic ... */
    const errors = {};
    if (!newName.trim()) errors.name = "Név megadása kötelező!";
    if (!newEmail.trim()) errors.email = "Email cím megadása kötelező!";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail))
      errors.email = "Érvénytelen email cím formátum!";
    if (newPassword && newPassword.length < 6)
      errors.password = "Jelszó min. 6 karakter!";
    const trimmedImageUrl = imageUrl.trim();
    if (
      trimmedImageUrl &&
      !trimmedImageUrl.startsWith("http://") &&
      !trimmedImageUrl.startsWith("https://")
    )
      errors.imageUrl = "Érvénytelen URL (http:// vagy https://)!";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [newName, newEmail, newPassword, phoneNumber, imageUrl]);

  // --- Handle Update ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setUpdateLoading(true);
    setUpdateError("");
    setUpdateSuccess("");
    setValidationErrors({});

    const dataToUpdate = {
      /* ... adatösszeállítás ... */ name: newName.trim(),
      email: newEmail.trim(),
      phone: phoneNumber.trim() || null,
      profile_picture_url: imageUrl.trim() || null, // Küldjük az input tartalmát
    };
    if (newPassword.trim()) dataToUpdate.password = newPassword.trim();

    try {
      console.log("[handleEditSubmit] Calling updateUser with:", dataToUpdate);
      const response = await updateUser(dataToUpdate);
      console.log(
        "[handleEditSubmit] Received response from updateUser:",
        response
      );

      if (response && response.success && response.user) {
        console.log("[handleEditSubmit] Update successful.");
        setUser(response.user); // Update local state with received data
        contextLogin(response.user, localStorage.getItem("token")); // Update context
        initializeForm(response.user); // Sync form
        setEditing(false);
        setUpdateSuccess("Adatok sikeresen frissítve!");
        setTimeout(() => setUpdateSuccess(""), 4000);
      } else {
        throw new Error(
          response?.error || "Sikertelen frissítés a szerver oldalon."
        );
      }
    } catch (err) {
      /* ... hibakezelés ... */
      console.error("[handleEditSubmit] Error during update:", err);
      setUpdateError(err.message || "Hiba történt a mentés során.");
    } finally {
      console.log("[handleEditSubmit] Setting updateLoading to false.");
      setUpdateLoading(false); // Stop loading indicator
    }
  };

  // --- Logout & Cancel ---
  const handleLogout = () => {
    /* ... */
    if (window.confirm("Biztosan ki szeretne lépni?")) {
      contextLogout();
      navigate("/");
    }
  };
  const handleCancelEdit = () => {
    /* ... */
    setEditing(false);
    if (user) initializeForm(user);
    setUpdateError("");
    setValidationErrors({});
    setUpdateSuccess("");
  };

  // --- Image Error Handler ---
  const handleImageError = useCallback(
    (e) => {
      console.warn("Image onError triggered for src:", e.target.src);
      if (placeholderImage && e.target.src !== placeholderImage) {
        // Csak akkor cseréljük, ha az src nem eleve a placeholder volt
        e.target.src = placeholderImage;
      } else if (!placeholderImage) {
        // Ha nincs placeholder importálva/elérhető
        console.error("Placeholder image is not available. Hiding image.");
        e.target.style.display = "none";
      } else {
        // Ha már a placeholder src-je volt és az is hibát dobott
        console.error("Placeholder image itself failed to load. Hiding image.");
        e.target.style.display = "none";
      }
    },
    [placeholderImage]
  ); // Függ a placeholderImage importtól

  // --- Render ---
  if (loading) {
    /* ... Loading spinner ... */
    return (
      <div className="container text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Profil betöltése...</span>
        </div>
      </div>
    );
  }
  if (!isLoggedIn || !user) {
    /* ... Login prompt / Error ... */
    return (
      <div className="container py-5 text-center">
        <p className="text-danger">
          {error || "A profil megtekintéséhez be kell jelentkezni."}
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/bejelentkezes")}
        >
          Bejelentkezés
        </button>
      </div>
    );
  }

  // Itt dől el, mit mutatunk: a user objektumban lévő URL-t, vagy ha az nincs, a placeholdert
  const displayImageUrl = user.profile_picture_url || placeholderImage;

  return (
    <div className="container py-5">
      <div className="profile-card card shadow-sm">
        <div className="card-body">
          {/* ... Cím, Üzenetek ... */}
          <h1 className="profile-title card-title text-center mb-4">Profil</h1>
          {updateSuccess && (
            <div
              className="alert alert-success alert-dismissible fade show small"
              role="alert"
            >
              {updateSuccess}
              <button
                type="button"
                className="btn-close btn-sm"
                onClick={() => setUpdateSuccess("")}
                aria-label="Bezár"
              ></button>
            </div>
          )}
          {updateError && (
            <div
              className="alert alert-danger alert-dismissible fade show small"
              role="alert"
            >
              {updateError}
              <button
                type="button"
                className="btn-close btn-sm"
                onClick={() => setUpdateError("")}
                aria-label="Bezár"
              ></button>
            </div>
          )}
          {error && !editing && (
            <div className="alert alert-warning text-center small">{error}</div>
          )}

          <div className="profile-content">
            {/* Image Section */}
            <div className="profile-image-section text-center mb-4">
              <img
                src={displayImageUrl} // Ezt használjuk
                alt={`${user.name || "Felhasználó"} profilképe`}
                className="profile-image rounded-circle border"
                key={displayImageUrl} // key segít a Reactnak észlelni a src változást
                onError={handleImageError} // Error handler
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  backgroundColor: "#eee",
                }} // Háttérszín, ha a kép lassan tölt be
              />
            </div>

            {/* Details / Form Section */}
            {/* ... (a többi JSX változatlan: Display/Edit mód, form mezők, gombok) ... */}
            <h3 className="profile-subtitle h5 text-center text-muted mb-3">
              Felhasználói adatok
            </h3>
            {!editing ? (
              <div className="profile-details text-center">
                <p>
                  <strong>Név:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Telefonszám:</strong> {user.phone || "Nincs megadva"}
                </p>
                <p>
                  <small className="text-muted">
                    Regisztráció:{" "}
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("hu-HU")
                      : "Ismeretlen"}
                  </small>
                </p>
                <div className="profile-actions mt-4 d-flex justify-content-center gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setEditing(true)}
                    disabled={updateLoading}
                  >
                    Adatok szerkesztése
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleLogout}
                    disabled={updateLoading}
                  >
                    Kilépés
                  </button>
                </div>
              </div>
            ) : (
              <form id="profileForm" onSubmit={handleEditSubmit} noValidate>
                {/* Name */}
                <div className="mb-3">
                  <label
                    htmlFor="editName"
                    className="form-label form-label-sm"
                  >
                    Név
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-sm ${
                      validationErrors.name ? "is-invalid" : ""
                    }`}
                    id="editName"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    disabled={updateLoading}
                  />
                  {validationErrors.name && (
                    <div className="invalid-feedback small">
                      {validationErrors.name}
                    </div>
                  )}
                </div>
                {/* Email */}
                <div className="mb-3">
                  <label
                    htmlFor="editEmail"
                    className="form-label form-label-sm"
                  >
                    Email cím
                  </label>
                  <input
                    type="email"
                    className={`form-control form-control-sm ${
                      validationErrors.email ? "is-invalid" : ""
                    }`}
                    id="editEmail"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    disabled={updateLoading}
                  />
                  {validationErrors.email && (
                    <div className="invalid-feedback small">
                      {validationErrors.email}
                    </div>
                  )}
                </div>
                {/* Phone */}
                <div className="mb-3">
                  <label
                    htmlFor="editPhoneNumber"
                    className="form-label form-label-sm"
                  >
                    Telefonszám
                  </label>
                  <input
                    type="tel"
                    className={`form-control form-control-sm ${
                      validationErrors.phoneNumber ? "is-invalid" : ""
                    }`}
                    id="editPhoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Opcionális"
                    disabled={updateLoading}
                  />
                  {validationErrors.phoneNumber && (
                    <div className="invalid-feedback small">
                      {validationErrors.phoneNumber}
                    </div>
                  )}
                </div>
                {/* Profile Image URL */}
                <div className="mb-3">
                  <label
                    htmlFor="profileImageUrl"
                    className="form-label form-label-sm"
                  >
                    Profilkép URL
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-sm ${
                      validationErrors.imageUrl ? "is-invalid" : ""
                    }`}
                    id="profileImageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://kep.url/profil.jpg (Opcionális)"
                    aria-describedby="imageUrlHelp imageUrlError"
                    disabled={updateLoading}
                  />
                  {validationErrors.imageUrl && (
                    <div id="imageUrlError" className="invalid-feedback small">
                      {validationErrors.imageUrl}
                    </div>
                  )}
                  <div id="imageUrlHelp" className="form-text small text-muted">
                    Add meg a kép teljes URL-jét, vagy hagyd üresen a törléshez.
                  </div>
                </div>
                {/* Password */}
                <div className="mb-3">
                  <label
                    htmlFor="editPassword"
                    className="form-label form-label-sm"
                  >
                    Új jelszó
                  </label>
                  <input
                    type="password"
                    className={`form-control form-control-sm ${
                      validationErrors.password ? "is-invalid" : ""
                    }`}
                    id="editPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 karakter"
                    aria-describedby="passwordHelp"
                    disabled={updateLoading}
                  />
                  {validationErrors.password && (
                    <div className="invalid-feedback small">
                      {validationErrors.password}
                    </div>
                  )}
                  <div id="passwordHelp" className="form-text small text-muted">
                    Hagyd üresen, ha nem akarod megváltoztatni.
                  </div>
                </div>

                {/* Buttons */}
                <div className="profile-actions mt-4 d-flex justify-content-center gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Mentés...
                      </>
                    ) : (
                      "Módosítások Mentése"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleCancelEdit}
                    disabled={updateLoading}
                  >
                    Mégse
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
