import React from "react";

const LeaderboardTable = ({ leaderboard }) => {
  if (!leaderboard || leaderboard.length === 0) {
    return <p style={{ color: "#888", textAlign: "center" }}>Nėra duomenų.</p>;
  }

  return (
    <table
      style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
    >
      <thead>
        <tr style={{ backgroundColor: "#4CAF50", color: "white" }}>
          <th style={th}>#</th>
          <th style={th}>Vardas</th>
          <th style={th}>Pavardė</th>
          <th style={th}>Taškai</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard.map((user) => (
          <tr
            key={user.userId}
            style={{ backgroundColor: user.rank <= 3 ? "#f1f8e9" : "white" }}
          >
            <td style={td}>{user.rank}</td>
            <td style={td}>{user.name}</td>
            <td style={td}>{user.surname}</td>
            <td style={td}>
              <strong>{user.points}</strong>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const th = { padding: "12px 16px", textAlign: "left", fontWeight: "700" };
const td = { padding: "12px 16px", borderBottom: "1px solid #eee" };

export default LeaderboardTable;
