import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CancelReservationModal from "../../components/Reservation/CancelReservationModal";
import "./ShelterReservationsPage.css";

const API = "http://localhost:5050/api/reservations";

const STATUS_LABELS = {
  upcoming: "Būsima",
  "in-progress": "Vyksta",
  completed: "Įvykusi",
  cancelled: "Atšaukta",
};

const FILTER_OPTIONS = [
  { value: "all", label: "Visos" },
  { value: "upcoming", label: "Būsimos" },
  { value: "completed", label: "Įvykusios" },
  { value: "cancelled", label: "Atšauktos" },
];

const getDisplayStatus = (r) => {
  if (r.status === "cancelled") return "cancelled";
  if (r.has_ended) return "completed";
  if (r.is_upcoming) return "upcoming";
  return "in-progress";
};

const startKey = (r) => `${r.date} ${r.reservation_start}`;
const isActive = (r) =>
  r.displayStatus === "upcoming" || r.displayStatus === "in-progress";

const ShelterReservationsPage = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API}/shelter`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || "Nepavyko gauti rezervacijų.");
        }

        setReservations(data.reservations || []);
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [navigate]);

  const visibleReservations = useMemo(() => {
    const withStatus = reservations.map((r) => ({
      ...r,
      displayStatus: getDisplayStatus(r),
    }));

    const filtered = withStatus.filter((r) => {
      if (filter === "all") return true;
      if (filter === "upcoming") return isActive(r);
      return r.displayStatus === filter;
    });

    // Būsimos – artimiausios viršuje, kitos – naujausios viršuje
    const active = filtered
      .filter(isActive)
      .sort((a, b) => startKey(a).localeCompare(startKey(b)));
    const rest = filtered
      .filter((r) => !isActive(r))
      .sort((a, b) => startKey(b).localeCompare(startKey(a)));
    return [...active, ...rest];
  }, [reservations, filter]);

  const openCancelModal = (reservation) => {
    setCancelError("");
    setCancelTarget(reservation);
  };

  const handleCancelConfirm = async () => {
    const token = localStorage.getItem("token");
    setCancelling(true);
    setCancelError("");

    try {
      const response = await fetch(
        `${API}/${cancelTarget.reservation_id}/cancel`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Nepavyko atšaukti rezervacijos.");
      }

      setReservations((prev) =>
        prev.map((r) =>
          r.reservation_id === cancelTarget.reservation_id
            ? { ...r, status: "cancelled" }
            : r,
        ),
      );
      setCancelTarget(null);
      setSuccessMessage("Rezervacija atšaukta.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "32px", textAlign: "center" }}>
        Kraunasi rezervacijos...
      </div>
    );
  }

  return (
    <div className="shelter-res-page">
      <div className="shelter-res-header">
        <h1>Prieglaudos rezervacijos</h1>
        <div className="shelter-res-filter">
          <label htmlFor="status-filter">Statusas</label>
          <select
            id="status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="shelter-res-error">{error}</div>}
      {successMessage && (
        <div className="shelter-res-success">{successMessage}</div>
      )}

      {!error && (
        <div className="shelter-res-table">
          <div className="shelter-res-row shelter-res-head">
            <span>Savanoris</span>
            <span>Augintinis</span>
            <span>Data</span>
            <span>Laikas</span>
            <span />
          </div>

          {visibleReservations.length === 0 ? (
            <div className="shelter-res-empty">Rezervacijų nėra.</div>
          ) : (
            visibleReservations.map((r) => (
              <div
                key={r.reservation_id}
                className={`shelter-res-row shelter-res-item ${r.displayStatus === "cancelled" ? "is-cancelled" : ""}`}
              >
                <span>{r.volunteer}</span>
                <span>{r.pet_name}</span>
                <span>{r.date}</span>
                <span>{r.reservation_start.slice(0, 5)}</span>
                <span className="shelter-res-action">
                  {r.displayStatus === "upcoming" ? (
                    <button
                      className="shelter-res-cancel-btn"
                      onClick={() => openCancelModal(r)}
                    >
                      Atšaukti rezervaciją
                    </button>
                  ) : (
                    <span className={`shelter-res-status ${r.displayStatus}`}>
                      {STATUS_LABELS[r.displayStatus]}
                    </span>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {cancelTarget && (
        <CancelReservationModal
          reservation={cancelTarget}
          volunteerName={cancelTarget.volunteer}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
          loading={cancelling}
          error={cancelError}
        />
      )}
    </div>
  );
};

export default ShelterReservationsPage;
