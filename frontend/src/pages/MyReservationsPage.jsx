import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CancelReservationModal from "../components/Reservation/CancelReservationModal";
import FeedbackModal from "../components/Feedback/FeedbackModal";

const API = "http://localhost:5050/api/reservations";
const FEEDBACK_API = "http://localhost:5050/api/feedback";

const STATUS_BADGES = {
  upcoming: {
    label: "Būsima",
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  completed: {
    label: "Įvykusi",
    backgroundColor: "#e5e7eb",
    color: "#374151",
  },
  cancelled: {
    label: "Atšaukta",
    backgroundColor: "#fde8e8",
    color: "#c53030",
  },
};

const getDisplayStatus = (r) => {
  if (r.status === "cancelled") return "cancelled";
  if (r.is_past || r.has_ended) return "completed";
  return "upcoming";
};

const toTimestamp = (r) => {
  const time = (r.reservation_start || "00:00").slice(0, 5);
  return new Date(`${r.date}T${time}:00`).getTime();
};

const MyReservationsPage = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // US-15: atšaukimas
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // US-10: atsiliepimas po pavedžiojimo
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === "shelter") {
      navigate("/home");
      return;
    }

    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || "Nepavyko gauti rezervacijų.");
        }

        const combined = [
          ...(Array.isArray(data.future) ? data.future : []),
          ...(Array.isArray(data.past) ? data.past : []),
          ...(Array.isArray(data.reservations) ? data.reservations : []),
        ];

        // Pašaliname galimus dublikatus pagal reservation_id
        const unique = Array.from(
          new Map(combined.map((item) => [item.reservation_id, item])).values(),
        );

        setReservations(unique);
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [navigate]);

  // Filtravimas pagal dropdown'ą ir rikiavimas nuo arčiausios iki tolimiausios
  const filteredReservations = useMemo(() => {
    const now = Date.now();

    const withStatus = reservations.map((r) => ({
      ...r,
      displayStatus: getDisplayStatus(r),
      ts: toTimestamp(r),
    }));

    const filtered =
      statusFilter === "all"
        ? withStatus
        : withStatus.filter((r) => r.displayStatus === statusFilter);

    const priority = {
      upcoming: 0,
      completed: 1,
      cancelled: 2,
    };

    return [...filtered].sort((a, b) => {
      if (statusFilter === "all" && priority[a.displayStatus] !== priority[b.displayStatus]) {
        return priority[a.displayStatus] - priority[b.displayStatus];
      }

      // Būsimos – nuo artimiausios ateities iki tolimiausios
      if (a.displayStatus === "upcoming" && b.displayStatus === "upcoming") {
        return a.ts - b.ts;
      }

      // Įvykusios / atšauktos – nuo arčiausios šiandienai iki tolimiausios
      return Math.abs(a.ts - now) - Math.abs(b.ts - now);
    });
  }, [reservations, statusFilter]);

  const canCancel = (reservation) =>
    reservation.displayStatus === "upcoming" &&
    (reservation.status === "confirmed" || reservation.status === "pending");

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

  const canLeaveFeedback = (reservation) =>
    reservation.displayStatus === "completed" && !reservation.feedback_received;

  const openFeedbackModal = (reservation) => {
    setFeedbackError("");
    setFeedbackTarget(reservation);
  };

  const handleFeedbackSubmit = async (content) => {
    const token = localStorage.getItem("token");
    setFeedbackSubmitting(true);
    setFeedbackError("");

    try {
      const response = await fetch(FEEDBACK_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reservation_id: feedbackTarget.reservation_id,
          content,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Nepavyko pateikti atsiliepimo.");
      }

      setReservations((prev) =>
        prev.map((r) =>
          r.reservation_id === feedbackTarget.reservation_id
            ? { ...r, feedback_received: true }
            : r,
        ),
      );
      setFeedbackTarget(null);
      setSuccessMessage("Ačiū! Jūsų atsiliepimas gautas.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setFeedbackError(err.message);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const formatTime = (r) => {
    const start = r.reservation_start?.slice(0, 5) || "";
    if (r.reservation_end) {
      return `${start} - ${r.reservation_end.slice(0, 5)}`;
    }
    return start;
  };

  if (loading) {
    return (
      <div style={{ padding: "32px", textAlign: "center" }}>
        Kraunasi rezervacijos...
      </div>
    );
  }

  return (
    <div
      style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 0 40px" }}
    >
      <div style={{ marginBottom: "8px" }}>
        <Link
          to="/mainAnimals"
          style={{
            color: "#2563eb",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          ← Atgal į gyvūnus
        </Link>
      </div>

      {/* Viršutinė eilutė: Pavadinimas + Statuso dropdown */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "18px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <h1 style={{ margin: 0, color: "#1f2937", fontSize: "1.65rem" }}>
          Mano rezervacijos
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label
            htmlFor="user-status-filter"
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#6b7280",
            }}
          >
            Statusas
          </label>
          <select
            id="user-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              minWidth: "200px",
              padding: "9px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              backgroundColor: "#fff",
              color: "#374151",
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            <option value="all">Visos</option>
            <option value="upcoming">Būsimos</option>
            <option value="completed">Įvykusios</option>
            <option value="cancelled">Atšauktos</option>
          </select>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "18px",
          }}
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            backgroundColor: "#e3f1df",
            color: "#3f7a35",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "18px",
            fontWeight: 600,
          }}
        >
          {successMessage}
        </div>
      )}

      {!error && (
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: "860px" }}>
            {/* Žalias headingas */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1.2fr 1fr 1fr 110px 190px",
                alignItems: "center",
                gap: "12px",
                backgroundColor: "#6aa84f",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.95rem",
                padding: "14px 20px",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            >
              <span>Prieglauda</span>
              <span>Augintinis</span>
              <span>Data</span>
              <span>Laikas</span>
              <span style={{ textAlign: "center" }}>Statusas</span>
              <span />
            </div>

            {/* Rezervacijų eilutės */}
            {filteredReservations.length === 0 ? (
              <div
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                  padding: "24px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                Pagal pasirinktą statusą rezervacijų nėra.
              </div>
            ) : (
              filteredReservations.map((r) => {
                const badge = STATUS_BADGES[r.displayStatus];

                return (
                  <div
                    key={r.reservation_id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.4fr 1.2fr 1fr 1fr 110px 190px",
                      alignItems: "center",
                      gap: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      backgroundColor: "#fff",
                      padding: "12px 20px",
                      marginBottom: "8px",
                      color: "#374151",
                      fontSize: "0.95rem",
                      opacity: r.displayStatus === "cancelled" ? 0.75 : 1,
                    }}
                  >
                    <span>{r.shelter_name}</span>
                    <span>{r.pet_name}</span>
                    <span>{r.date}</span>
                    <span>{formatTime(r)}</span>
                    <span style={{ display: "flex", justifyContent: "center" }}>
                      <span
                        style={{
                          backgroundColor: badge.backgroundColor,
                          color: badge.color,
                          padding: "6px 14px",
                          borderRadius: "999px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                        }}
                      >
                        {badge.label}
                      </span>
                    </span>
                    <span style={{ display: "flex", justifyContent: "flex-end" }}>
                      {canCancel(r) && (
                        <button
                          onClick={() => openCancelModal(r)}
                          style={{
                            width: "100%",
                            backgroundColor: "#e5e7eb",
                            color: "#1f2937",
                            border: "none",
                            borderRadius: "6px",
                            padding: "10px 14px",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            cursor: "pointer",
                          }}
                        >
                          Atšaukti rezervaciją
                        </button>
                      )}
                      {canLeaveFeedback(r) && (
                        <button
                          onClick={() => openFeedbackModal(r)}
                          style={{
                            width: "100%",
                            backgroundColor: "#6aa84f",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "10px 14px",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            cursor: "pointer",
                          }}
                        >
                          Palikti atsiliepimą
                        </button>
                      )}
                      {r.displayStatus === "completed" && r.feedback_received && (
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "#3f7a35",
                          }}
                        >
                          Atsiliepimas paliktas
                        </span>
                      )}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {cancelTarget && (
        <CancelReservationModal
          reservation={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
          loading={cancelling}
          error={cancelError}
        />
      )}

      {feedbackTarget && (
        <FeedbackModal
          reservation={feedbackTarget}
          onSubmit={handleFeedbackSubmit}
          onClose={() => setFeedbackTarget(null)}
          loading={feedbackSubmitting}
          error={feedbackError}
        />
      )}
    </div>
  );
};

export default MyReservationsPage;