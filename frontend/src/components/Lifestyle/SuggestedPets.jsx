import { useCallback, useEffect, useRef, useState } from "react";
import AnimalCard from "../AnimalCard/AnimalCard.jsx";

const SUGGESTIONS_API = "http://localhost:5050/api/lifestyle/me/suggestions";

// Gyvūnai, turintys bendrų tagų su vartotoju (user_tag ↔ pet_tag)
const SuggestedPets = ({ hasTags, token, onEdit }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(hasTags);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    if (!hasTags) return;

    const loadSuggestions = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(SUGGESTIONS_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Bad response");
        setPets(await response.json());
      } catch (err) {
        console.error("Klaida kraunant pasiūlymus:", err);
        setError("Nepavyko gauti pasiūlymų.");
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [hasTags, token, reloadKey]);

  const updateScrollButtons = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, [pets, updateScrollButtons]);

  const scrollBy = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const renderBody = () => {
    if (!hasTags) {
      return (
        <p className="lifestyle-muted">
          Jūsų aprašymas išsaugotas. Pasiūlymus parodysime, kai jis bus apdorotas.
        </p>
      );
    }

    if (loading) return <p className="lifestyle-muted">Ieškoma tinkamų gyvūnų…</p>;

    if (error) {
      return (
        <div className="lifestyle-error" role="alert">
          {error}
          <button
            type="button"
            className="lifestyle-btn lifestyle-btn--secondary"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Bandyti dar kartą
          </button>
        </div>
      );
    }

    if (pets.length === 0) {
      return (
        <p className="lifestyle-muted">
          Šiuo metu jūsų aprašymą atitinkančių gyvūnų nėra. Pažiūrėkite visą sąrašą žemiau.
        </p>
      );
    }

    return (
      <div className="lifestyle-carousel">
        {canScrollLeft && (
          <button
            type="button"
            className="lifestyle-carousel__arrow lifestyle-carousel__arrow--left"
            onClick={() => scrollBy(-1)}
            aria-label="Ankstesni pasiūlymai"
          >
            ‹
          </button>
        )}
        <div
          ref={trackRef}
          className="lifestyle-carousel__track"
          onScroll={updateScrollButtons}
        >
          {pets.map((pet) => (
            <div key={pet.pet_id || pet.id} className="lifestyle-carousel__item">
              <AnimalCard pet={pet} />
            </div>
          ))}
        </div>
        {canScrollRight && (
          <button
            type="button"
            className="lifestyle-carousel__arrow lifestyle-carousel__arrow--right"
            onClick={() => scrollBy(1)}
            aria-label="Kiti pasiūlymai"
          >
            ›
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="lifestyle-suggestions">
      <div className="lifestyle-suggestions__header">
        <h2 className="lifestyle-suggestions__title">✦ Jums siūlomi</h2>
        <button
          type="button"
          className="lifestyle-btn lifestyle-btn--secondary"
          onClick={onEdit}
        >
          Keisti aprašymą
        </button>
      </div>
      {renderBody()}
    </div>
  );
};

export default SuggestedPets;
