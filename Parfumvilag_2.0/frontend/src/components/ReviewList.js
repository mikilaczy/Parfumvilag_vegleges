import React, { useState, useEffect } from "react"; // useEffect itt már nem is feltétlen kell, ha nincs dropdown

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString;
  }
};

// Csillagok generálása
const renderStars = (rating) => {
  const filledStars = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return (
    <>
      {"★".repeat(filledStars)}
      {"☆".repeat(5 - filledStars)}
    </>
  );
};

// --- Individual Review Item Component ---
const ReviewItem = ({ review, currentUserId, onDelete }) => {
  const isOwnReview = review.user_id === currentUserId;

  // Közvetlen törlés handler
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Megakadályozza a felesleges kattintásokat
    onDelete(review.id); // Meghívja a szülőtől kapott onDelete függvényt az ID-val
  };

  return (
    <div className="review-item-custom card mb-3 position-relative">
      {/* Delete Button  */}

      {isOwnReview && (
        <div
          className="position-absolute"
          style={{ top: "10px", right: "10px", zIndex: 2 }}
        >
          <button
            onClick={handleDeleteClick}
            className="btn btn-sm btn-danger p-1" // Veszélyes művelet jelzése (piros)
            aria-label="Értékelés törlése"
            title="Értékelés törlése" // Title tooltip
            style={{
              lineHeight: 1 /*background: 'transparent', border: 'none'*/,
            }} // Esetleg standard danger gomb
          >
            <i className="fas fa-trash-alt"></i> {/* Trash icon */}
          </button>
        </div>
      )}

      {/* Card Body with Review Content */}
      <div className="card-body">
        <div className="review-header-custom d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
          <span className="review-author-custom fw-bold">
            {review.author || "Ismeretlen felhasználó"}
          </span>
          <span className="review-date-custom text-muted">
            {formatDate(review.created_at)}
          </span>
        </div>

        {/* Ratings Grid */}
        <div className="review-ratings-grid mb-2">
          <div className="rating-item">
            <span className="rating-category">Illatcsík:</span>
            <span className="rating-stars">
              {renderStars(review.scent_trail_rating)}
            </span>
          </div>
          <div className="rating-item">
            <span className="rating-category">Tartósság:</span>
            <span className="rating-stars">
              {renderStars(review.longevity_rating)}
            </span>
          </div>
          <div className="rating-item">
            <span className="rating-category">Ár/Érték:</span>
            <span className="rating-stars">
              {renderStars(review.value_rating)}
            </span>
          </div>
          <div className="rating-item">
            <span className="rating-category">Összbenyomás:</span>
            <span className="rating-stars">
              {renderStars(review.overall_impression)}
            </span>
          </div>
        </div>

        {/* Review Comment */}
        {review.review_text && (
          <p className="review-comment-custom card-text bg-light p-2 rounded border mt-2">
            {review.review_text}
          </p>
        )}
      </div>
    </div>
  );
};

// --- Main ReviewList Component ---
// Most már nem kell neki az 'onEdit' prop
const ReviewList = ({ reviews, loading, currentUserId, onDelete }) => {
  if (loading) {
    return (
      <div className="text-center my-4 text-muted">
        Értékelések betöltése...
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <p className="text-center text-muted mt-4">
        Még nincsenek értékelések ehhez a parfümhöz.
      </p>
    );
  }

  return (
    <div className="review-list-custom mt-4">
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          currentUserId={currentUserId}
          // onEdit nincs többé
          onDelete={onDelete} // Csak az onDelete van átadva
        />
      ))}
    </div>
  );
};

export default ReviewList;
