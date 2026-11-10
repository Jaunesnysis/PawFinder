import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const MyReservationsPage = () => {
  const navigate = useNavigate();
  const [futureReservations, setFutureReservations] = useState([]);
  const [pastReservations, setPastReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        const response = await fetch("http://localhost:5050/api/reservations/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Nepavyko gauti rezervacijų.");
        }

        const data = await response.json();
        setFutureReservations(data.future || []);
        setPastReservations(data.past || []);
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [navigate]);

  const renderCard = (reservation) => (
    <div
      key={reservation.reservation_id}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "18px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
        <strong style={{ fontSize: "1.05rem" }}>{reservation.pet_name}</strong>
        <span
          style={{
            backgroundColor: reservation.is_past ? "#e5e7eb" : "#d1fae5",
            color: reservation.is_past ? "#374151" : "#065f46",
            padding: "6px 10px",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          {reservation.is_past ? "Įvykusi" : "Būsima"}
        </span>
      </div>

      <p style={{ margin: "6px 0", color: "#4b5563" }}>
        <strong>Data:</strong> {reservation.date}
      </p>
      <p style={{ margin: "6px 0", color: "#4b5563" }}>
        <strong>Laikas:</strong> {reservation.reservation_start} - {reservation.reservation_end}
      </p>
      <p style={{ margin: "6px 0", color: "#4b5563" }}>
        <strong>Prieglauda:</strong> {reservation.shelter_name}
      </p>
    </div>
  );

  if (loading) {
    return <div style={{ padding: "32px", textAlign: "center" }}>Kraunasi rezervacijos...</div>;
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 0 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: 0, color: "#1f2937" }}>Mano rezervacijos</h1>
        </div>
        <Link to="/mainAnimals" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
          ← Atgal į gyvūnus
        </Link>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: "10px", marginBottom: "24px" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gap: "28px" }}>
        <section>
          <h2 style={{ color: "#111827", marginBottom: "14px" }}>Būsimų apsilankymų</h2>
          {futureReservations.length === 0 ? (
            <p style={{ color: "#6b7280" }}>Jūsų neturi ateinančių rezervacijų.</p>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {futureReservations.map(renderCard)}
            </div>
          )}
        </section>

        <section>
          <h2 style={{ color: "#111827", marginBottom: "14px" }}>Įvykusių apsilankymų</h2>
          {pastReservations.length === 0 ? (
            <p style={{ color: "#6b7280" }}>Jūsų neturi įvykusių rezervacijų.</p>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {pastReservations.map(renderCard)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyReservationsPage;
