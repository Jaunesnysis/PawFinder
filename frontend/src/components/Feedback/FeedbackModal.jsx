import { useEffect, useState } from "react";
import "./FeedbackModal.css";

const MAX_LENGTH = 3000;
// Skaitiklis rodomas tik prisiartinus prie ribos, kad modalas atrodytų kaip makete
const COUNTER_VISIBLE_FROM = Math.floor(MAX_LENGTH * 0.9);

const FeedbackModal = ({ reservation, onSubmit, onClose, loading, error }) => {
  const [content, setContent] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, loading]);

  // Simboliai skaičiuojami taip pat kaip serveryje (Unicode kodo taškai, be krašto tarpų)
  const length = Array.from(content.trim()).length;
  const tooLong = length > MAX_LENGTH;
  // Mygtukas lieka pilnai žalias kaip makete; tuščias tekstas atmetamas paspaudus
  const canSubmit = !tooLong && !loading;
  const shownError = localError || error;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (length < 1) {
      setLocalError("Atsiliepimas negali būti tuščias.");
      return;
    }
    onSubmit(content.trim());
  };

  const handleChange = (e) => {
    setContent(e.target.value);
    setLocalError("");
  };

  return (
    <div className="feedback-overlay" onClick={() => !loading && onClose()}>
      <form
        className="feedback-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 id="feedback-title">Atsiliepimas apie {reservation.pet_name}</h2>

        <label htmlFor="feedback-content" className="feedback-label">
          Jūsų atsiliepimas
        </label>
        <textarea
          id="feedback-content"
          className="feedback-textarea"
          value={content}
          onChange={handleChange}
          rows={7}
          placeholder="Laisvo teksto laukas..."
          disabled={loading}
          autoFocus
        />

        {length >= COUNTER_VISIBLE_FROM && (
          <div
            className={`feedback-counter${tooLong ? " feedback-counter-over" : ""}`}
          >
            {length} / {MAX_LENGTH}
          </div>
        )}
        {tooLong && (
          <p className="feedback-modal-error">
            Atsiliepimas negali būti ilgesnis nei {MAX_LENGTH} simbolių.
          </p>
        )}
        {shownError && <p className="feedback-modal-error">{shownError}</p>}

        <div className="feedback-modal-actions">
          <button
            type="submit"
            className="feedback-btn-primary"
            disabled={!canSubmit}
          >
            {loading ? "Siunčiama..." : "Pateikti"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackModal;