import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LifestyleForm from "./LifestyleForm.jsx";
import SuggestedPets from "./SuggestedPets.jsx";
import "./Lifestyle.css";

const LIFESTYLE_API = "http://localhost:5050/api/lifestyle/me";

/**
 * US-02: gyvenimo būdo aprašymas Gyvūnų puslapyje.
 * - Aprašymo dar nėra -> rodoma forma
 * - Aprašymas yra -> rodomi pasiūlymai pagal vartotojo tagus ir "Keisti aprašymą"
 */
const LifestyleSection = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const canUseLifestyle = Boolean(token) && user.role !== "shelter";

  const [lifestyle, setLifestyle] = useState(null);
  const [loading, setLoading] = useState(canUseLifestyle);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!canUseLifestyle) return;

    const loadLifestyle = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const response = await fetch(LIFESTYLE_API, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || "Nepavyko užkrauti aprašymo.");
        }

        setLifestyle(data.lifestyle);
      } catch (error) {
        console.error("Klaida kraunant gyvenimo būdo aprašymą:", error);
        setLoadError("Nepavyko užkrauti jūsų gyvenimo būdo aprašymo.");
      } finally {
        setLoading(false);
      }
    };

    loadLifestyle();
  }, [canUseLifestyle, token, navigate, reloadKey]);

  // Klaidą metame toliau, kad forma ją parodytų ir neištrintų teksto (AC2.4)
  const saveLifestyle = async (description, consent) => {
    const response = await fetch(LIFESTYLE_API, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ description, consent }),
    });

    if (response.status === 401) {
      throw new Error("Sesija baigėsi. Nukopijuokite tekstą ir prisijunkite iš naujo.");
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      // 4xx klaidos (validacija) rodomos kaip yra, serverio klaidos - suprantamu tekstu
      const message =
        response.status < 500 && data.error
          ? data.error
          : "Nepavyko išsaugoti aprašymo. Bandykite dar kartą.";
      throw new Error(message);
    }

    setLifestyle(data.lifestyle);
    setEditing(false);
  };

  if (!canUseLifestyle) return null;

  if (loading) {
    return (
      <section className="lifestyle-section">
        <p className="lifestyle-muted">Kraunamas jūsų aprašymas…</p>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="lifestyle-section">
        <div className="lifestyle-error" role="alert">
          {loadError}
          <button
            type="button"
            className="lifestyle-btn lifestyle-btn--secondary"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Bandyti dar kartą
          </button>
        </div>
      </section>
    );
  }

  const hasDescription = Boolean(lifestyle?.description);

  if (!hasDescription || editing) {
    return (
      <section className="lifestyle-section">
        <LifestyleForm
          initialText={lifestyle?.description || ""}
          onSave={saveLifestyle}
          onCancel={hasDescription ? () => setEditing(false) : undefined}
        />
      </section>
    );
  }

  return (
    <section className="lifestyle-section">
      <SuggestedPets
        hasTags={lifestyle.tags?.length > 0}
        token={token}
        onEdit={() => setEditing(true)}
      />
    </section>
  );
};

export default LifestyleSection;
