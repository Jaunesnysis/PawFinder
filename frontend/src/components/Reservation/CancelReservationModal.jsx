import { useEffect } from "react";
import "./CancelReservationModal.css";

const CancelReservationModal = ({
  reservation,
  volunteerName,
  onConfirm,
  onClose,
  loading,
  error,
}) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, loading]);

  const time = reservation.reservation_start?.slice(0, 5);

  return (
    <div className="cancel-overlay" onClick={() => !loading && onClose()}>
      <div
        className="cancel-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="cancel-title">Atšaukti rezervaciją?</h2>

        {volunteerName ? (
          <p>
            Savanorio <strong>{volunteerName}</strong> pasivaikščiojimas su{" "}
            <strong>{reservation.pet_name}</strong> {reservation.date} {time}{" "}
            bus atšauktas.
          </p>
        ) : (
          <p>
            Jūsų pasivaikščiojimas su <strong>{reservation.pet_name}</strong>{" "}
            {reservation.date} {time} bus atšauktas.
          </p>
        )}
        <p className="cancel-modal-note">Šio veiksmo atšaukti nebus galima.</p>

        {error && <p className="cancel-modal-error">{error}</p>}

        <div className="cancel-modal-actions">
          <button
            className="cancel-btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Ne
          </button>
          <button
            className="cancel-btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Atšaukiama..." : "Taip, atšaukti"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelReservationModal;
