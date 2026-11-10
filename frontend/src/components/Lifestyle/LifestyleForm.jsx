import { useId, useState } from "react";

// Turi sutapti su backend/src/Modules/Lifestyle/Domain/LifestyleDescription.js
const MIN_LENGTH = 200;
const MAX_LENGTH = 2000;

const countCharacters = (text) => Array.from(text.trim()).length;

const LifestyleForm = ({ initialText = "", onSave, onCancel }) => {
  const [text, setText] = useState(initialText);
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const textareaId = useId();
  const hintId = useId();
  const consentId = useId();

  const length = countCharacters(text);
  const tooShort = length < MIN_LENGTH;
  const tooLong = length > MAX_LENGTH;
  const canSubmit = !tooShort && !tooLong && consent && !saving;

  let hint = `Mažiausiai ${MIN_LENGTH} simbolių.`;
  if (length > 0 && tooShort) hint = `Dar trūksta ${MIN_LENGTH - length} simbolių.`;
  if (tooLong) hint = `Viršijote ribą ${length - MAX_LENGTH} simboliais.`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setError("");
    try {
      await onSave(text.trim(), consent);
    } catch (err) {
      // Tekstas lieka laukelyje (AC2.4)
      setError(err.message || "Nepavyko išsaugoti aprašymo. Bandykite dar kartą.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="lifestyle-card">
      <h2 className="lifestyle-card__title">✦ Gaukite jums tinkamų augintinių</h2>
      <p className="lifestyle-card__lead">
        Aprašykite savo gyvenimo būdą ir pasiūlysime tinkamiausius gyvūnus.
        Paminėkite būsto dydį, ar turite vaikų, darbo grafiką, patirtį su
        gyvūnais ir kiek esate aktyvūs.
      </p>

      <label htmlFor={textareaId} className="lifestyle-visually-hidden">
        Gyvenimo būdo aprašymas
      </label>
      <textarea
        id={textareaId}
        className={`lifestyle-textarea${tooLong ? " lifestyle-textarea--invalid" : ""}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Pvz.: gyvenu bute, dirbu iš namų, mėgstu ilgus pasivaikščiojimus, turiu mažą vaiką…"
        rows={5}
        aria-describedby={hintId}
        aria-invalid={tooLong}
        disabled={saving}
      />

      <div id={hintId} className="lifestyle-counter">
        <span className={tooLong ? "lifestyle-counter--over" : undefined}>{hint}</span>
        <span className={tooLong ? "lifestyle-counter--over" : undefined}>
          {length} / {MAX_LENGTH}
        </span>
      </div>

      <div className="lifestyle-consent">
        <input
          id={consentId}
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={saving}
        />
        <label htmlFor={consentId}>
          Sutinku, kad šis aprašymas būtų perduotas DI paslaugai rekomendacijoms sudaryti
        </label>
      </div>

      {error && (
        <div className="lifestyle-error" role="alert">
          {error}
        </div>
      )}

      <div className="lifestyle-actions">
        {onCancel && (
          <button
            type="button"
            className="lifestyle-btn lifestyle-btn--secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Atšaukti
          </button>
        )}
        <button
          type="button"
          className="lifestyle-btn lifestyle-btn--primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {saving ? "Saugoma…" : "Išsaugoti"}
        </button>
      </div>
    </div>
  );
};

export default LifestyleForm;
