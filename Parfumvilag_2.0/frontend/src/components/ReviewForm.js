import React, { useState, useContext } from "react";
import { AuthContext } from "../App"; // Import AuthContext
import { createReview } from "../services/reviewService"; // Import service

const ReviewForm = ({ perfumeId, onReviewSubmitted }) => {
  const { isLoggedIn } = useContext(AuthContext);
  const [ratings, setRatings] = useState({
    sillage: 0,
    longevity: 0,
    value: 0,
    overall: 0,
  });
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRatingChange = (category, value) => {
    // Ensure value is between 0 and 5
    const numValue = Math.max(0, Math.min(5, parseInt(value, 10)));
    setRatings({ ...ratings, [category]: numValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError("Be kell jelentkezni az értékeléshez!");
      return;
    }

    // Check if all ratings are given (at least 1 star)
    if (Object.values(ratings).some((rating) => rating === 0)) {
      setError("Kérlek, adj értékelést minden szempontra (minimum 1)!");
      return;
    }
    if (!comment.trim()) {
      setError("Kérlek, írj véleményt!");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const reviewData = { ...ratings, comment };
      const result = await createReview(perfumeId, reviewData); // Call the service

      setSuccess("Értékelés sikeresen beküldve!");
      setRatings({ sillage: 0, longevity: 0, value: 0, overall: 0 });
      setComment("");

      // Notify parent component (PerfumeDetail) to refresh the list
      if (onReviewSubmitted) {
        onReviewSubmitted(result.review); // Pass the newly created review back
      }

      // Clear success message after a delay
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.message || "Hiba történt az értékelés beküldésekor!");
      // Clear error message after a delay
      setTimeout(() => setError(""), 7000);
    } finally {
      setLoading(false);
    }
  };

  // Render only if logged in, PerfumeDetail handles the message otherwise
  if (!isLoggedIn) {
    return null; // Or display a simplified message here
  }

  return (
    <form className="review-form-custom" onSubmit={handleSubmit}>
      <h4 className="mb-3">Írj értékelést!</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Rating Sliders */}
      <div className="review-form-section">
        <label htmlFor="sillageRating" className="form-label">
          Illatfelhő (Sillage):
        </label>
        <input
          type="range"
          id="sillageRating"
          min="0"
          max="5"
          step="1"
          value={ratings.sillage}
          onChange={(e) => handleRatingChange("sillage", e.target.value)}
          className="rating-slider"
          disabled={loading}
        />
        <span className="slider-value">{ratings.sillage}/5</span>
      </div>

      <div className="review-form-section">
        <label htmlFor="longevityRating" className="form-label">
          Tartósság (Longevity):
        </label>
        <input
          type="range"
          id="longevityRating"
          min="0"
          max="5"
          step="1"
          value={ratings.longevity}
          onChange={(e) => handleRatingChange("longevity", e.target.value)}
          className="rating-slider"
          disabled={loading}
        />
        <span className="slider-value">{ratings.longevity}/5</span>
      </div>

      <div className="review-form-section">
        <label htmlFor="valueRating" className="form-label">
          Ár/Érték arány (Value):
        </label>
        <input
          type="range"
          id="valueRating"
          min="0"
          max="5"
          step="1"
          value={ratings.value}
          onChange={(e) => handleRatingChange("value", e.target.value)}
          className="rating-slider"
          disabled={loading}
        />
        <span className="slider-value">{ratings.value}/5</span>
      </div>

      <div className="review-form-section">
        <label htmlFor="overallRating" className="form-label">
          Összbenyomás (Overall):
        </label>
        <input
          type="range"
          id="overallRating"
          min="0"
          max="5"
          step="1"
          value={ratings.overall}
          onChange={(e) => handleRatingChange("overall", e.target.value)}
          className="rating-slider"
          disabled={loading}
        />
        <span className="slider-value">{ratings.overall}/5</span>
      </div>

      {/* Comment Textarea */}
      <div className="review-form-section">
        <label htmlFor="reviewComment" className="form-label">
          Vélemény:
        </label>
        <textarea
          id="reviewComment"
          className="form-control"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Írd ide a véleményed..."
          rows="4" // Increased rows for better usability
          required
          disabled={loading}
        />
      </div>

      {/* Submit Button */}
      <button type="submit" className="btn-submit mt-2" disabled={loading}>
        {loading ? "Küldés..." : "Értékelés beküldése"}
      </button>
    </form>
  );
};

export default ReviewForm;
