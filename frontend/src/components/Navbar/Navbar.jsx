import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // 1. Jei esame Login puslapyje (keliu "/"), navigacijos nerodome
  //if (location.pathname === '/') return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // window.location.href naudojamas, kad programėlė pilnai persikrautų ir išsivalytų visi state
    window.location.href = "/";
  };

  // --- SVEČIO MENIU (Jei nėra tokeno) ---
  if (!token) {
    return (
      <nav style={styles.nav}>
        <div style={styles.sideSection}>
          <span style={styles.logo}>PawFinder</span>
        </div>

        <div style={styles.centerSection}>
          <Link to="/" style={styles.link}>
            Pradžia
          </Link>
          <a href="#" style={styles.link}>
            Apie projektą
          </a>
          <a href="#" style={styles.link}>
            Kaip tapti savanoriu?
          </a>
          <a href="#" style={styles.link}>
            Kontaktai
          </a>
        </div>

        <div style={styles.sideSectionRight}>
          {location.pathname !== "/login" && (
            <Link to="/login" style={styles.loginBtn}>
              Prisijungti
            </Link>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav style={styles.nav}>
      {/* KAIRĖ: Logo */}
      <div style={styles.sideSection}>
        <span style={styles.logo}>PawFinder</span>
      </div>

      {/* CENTRAS: Nuorodos pagal rolę */}
      <div style={styles.centerSection}>
        {/* Bendros nuorodos visiems prisijungusiems */}
        {/*<Link to="/home" style={styles.link}>*/}
        {/*  Pradžia*/}
        {/*</Link>*/}
        {/* TIK SAVANORIAMS (Volunteer) */}
        {user.role === "user" && (
          <>
            <Link to="/animals" style={styles.link}>
              Savanoriams
            </Link>
            <Link to="/mainAnimals" style={styles.link}>
              Gyvūnai
            </Link>
            <Link to="/shelters" style={styles.link}>
              Prieglaudos
            </Link>
            <Link to="/myReservationsPage" style={styles.link}>
              Mano rezervacijos
            </Link>
            <Link to="/" style={styles.link}>
              Mano profilis
            </Link>

            <Link to="/achievements" style={styles.achievementsLink}>
              🏆 Pasiekimai
            </Link>
            <Link
              to={`/favorites/${user.id}`}
              style={{ ...styles.link, color: "#e91e63" }}
            >
              ❤️ Patikę
            </Link>
          </>
        )}

        {/* TIK PRIEGLAUDOMS (Shelter) - Pavyzdys ateičiai */}
        {user.role === "shelter" && (
          <>
            <Link to="/mySheltersPets" style={styles.link}>
              Mano augintiniai
            </Link>
            <Link to="/shelterReservations" style={styles.link}>
              Prieglaudos rezervacijos
            </Link>
            <Link to="/statistics" style={styles.link}>
              Statistika
            </Link>
            <Link to="/shelterProfile" style={styles.link}>
              Prieglaudos profilis
            </Link>
          </>
        )}

        {/* Bendras visiems */}
        <Link to="/notifications" style={styles.notificationsLink}>
          🔔 Pranešimai
        </Link>
      </div>

      {/* DEŠINĖ: Atsijungimas */}
      <div style={styles.sideSectionRight}>
        <button
          onClick={handleLogout}
          style={styles.logoutBtn}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#ffccc7")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#fff1f0")}
        >
          Atsijungti
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "14px 24px",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
    width: "100%",
    maxWidth: "1400px",
    margin: "15px auto 30px",
    boxSizing: "border-box",
  },
  sideSection: {
    flex: "0 0 auto",
    display: "flex",
    justifyContent: "flex-start",
  },
  sideSectionRight: {
    flex: "0 0 auto",
    display: "flex",
    justifyContent: "flex-end",
  },
  centerSection: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "18px",
    flexWrap: "nowrap",
    overflowX: "auto",
  },
  logo: {
    fontWeight: "800",
    color: "#4CAF50",
    fontSize: "1.35rem",
    letterSpacing: "-0.5px",
    whiteSpace: "nowrap",
  },
  link: {
    textDecoration: "none",
    color: "#444",
    fontSize: "0.93rem",
    fontWeight: "500",
    whiteSpace: "nowrap",
    transition: "color 0.2s",
  },
  achievementsLink: {
    textDecoration: "none",
    color: "#4CAF50",
    fontWeight: "700",
    fontSize: "0.93rem",
    whiteSpace: "nowrap",
  },
  notificationsLink: {
    textDecoration: "none",
    color: "#FF9800",
    fontWeight: "700",
    fontSize: "0.93rem",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    padding: "9px 16px",
    backgroundColor: "#fff1f0",
    color: "#f5222d",
    border: "1px solid #ffa39e",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },
};

export default Navbar;
