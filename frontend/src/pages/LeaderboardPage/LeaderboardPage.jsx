import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LeaderboardTable from "../../components/Leaderboard/LeaderboardTable";

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5050/api/users/leaderboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        return res.json();
      })
      .then((json) => setLeaderboard(json.leaderboard))
      .catch((err) => console.error("Klaida:", err));
  }, [navigate]); // AC3 - fetches fresh data every time page opens

  if (!leaderboard) return <div>Kraunama...</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ color: "#333", marginBottom: "30px" }}>
        🏆 Lyderių lentelė
      </h1>
      <LeaderboardTable leaderboard={leaderboard} />
    </div>
  );
};

export default LeaderboardPage;
