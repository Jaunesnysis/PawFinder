import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import AnimalCard from "../components/AnimalCard/AnimalCard.jsx"; // 1. IMPORTUOK KORTELĘ

const socket = io("http://localhost:5050");

const MainAnimalsPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [species, setSpecies] = useState("");
  //   const [breed, setBreed] = useState("");
  const [breed, setBreed] = useState(location.state?.breed || "");
  const [size, setSize] = useState("");
  const [activity, setActivity] = useState("");
  const [city, setCity] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [weightMin, setWeightMin] = useState("");
  const [weightMax, setWeightMax] = useState("");

  const fetchPets = async () => {
    setLoading(true);
    try {
      // Sukuriame query parametrus iš filtrų
      const params = new URLSearchParams();
      if (species) params.append("species", species);
      if (breed) params.append("breed", breed);
      if (size) params.append("size", size);
      if (activity) params.append("activity", activity);
      if (city) params.append("city", city);
      if (ageMin) params.append("ageMin", ageMin);
      if (ageMax) params.append("ageMax", ageMax);
      if (weightMin) params.append("weightMin", weightMin);
      if (weightMax) params.append("weightMax", weightMax);

      const queryString = params.toString();
      const url = queryString
        ? `http://localhost:5050/api/pets/mainAnimals?${queryString}`
        : "http://localhost:5050/api/pets/mainAnimals";

      const response = await fetch(url);
      const data = await response.json();
      setPets(data);
    } catch (error) {
      console.error("Klaida:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  // Automatiškai persikrauname duomenis kai keičiasi filtrai
  useEffect(() => {
    fetchPets();
  }, [
    species,
    breed,
    size,
    activity,
    city,
    ageMin,
    ageMax,
    weightMin,
    weightMax,
  ]);

  useEffect(() => {
    socket.on("StatusChanged", fetchPets);
    return () => socket.off("StatusChanged");
  }, []);

  const speciesOptions = Array.from(new Set(pets.map((p) => p.species)))
    .filter(Boolean)
    .sort();
  const breedOptions = Array.from(new Set(pets.map((p) => p.breed)))
    .filter(Boolean)
    .sort();
  const sizeOptions = Array.from(new Set(pets.map((p) => p.size)))
    .filter(Boolean)
    .sort();
  const activityOptions = Array.from(new Set(pets.map((p) => p.activity_level)))
    .filter(Boolean)
    .sort();
  const cityOptions = Array.from(new Set(pets.map((p) => p.city)))
    .filter(Boolean)
    .sort();

  const resetFilters = () => {
    setSpecies("");
    setBreed("");
    setSize("");
    setActivity("");
    setCity("");
    setAgeMin("");
    setAgeMax("");
    setWeightMin("");
    setWeightMax("");
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        "@media (max-width: 768px)": {
          padding: "16px",
        },
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          "@media (max-width: 768px)": {
            maxWidth: "100%",
          },
        }}
      >
        {/* HEADER */}
        <h1
          style={{
            textAlign: "center",
            color: "#2c3e50",
            fontSize: "2.2em",
            fontWeight: "700",
            marginBottom: "8px",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          🐾 Gyvūnų pasaulis
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#6c757d",
            fontSize: "1.1em",
            marginBottom: "32px",
            fontWeight: "400",
          }}
        >
          Rask savo naują geriausią draugą iš mūsų augintinių
        </p>

        {/* FILTRŲ SKYRIUS */}
        <div
          style={{
            marginBottom: "32px",
            padding: "24px",
            border: "1px solid #e1e5e9",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            "@media (max-width: 768px)": {
              padding: "16px",
            },
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#2c3e50",
                fontSize: "1.3em",
                fontWeight: "600",
              }}
            >
              🔍 Filtruoti gyvūnus
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
              "@media (max-width: 768px)": {
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
              },
              "@media (max-width: 480px)": {
                gridTemplateColumns: "1fr",
                gap: "12px",
              },
            }}
          >
            {/* Top row - all 5 filters */}
            <div
              style={{
                gridColumn: "span 4",
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{ flex: "0 0 calc(20% - 12.8px)", maxWidth: "200px" }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#495057",
                    fontWeight: "500",
                    fontSize: "0.9em",
                  }}
                >
                  🐾 Rūšis
                </label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #ced4da",
                    backgroundColor: "white",
                    fontSize: "0.9em",
                    color: "#495057",
                    cursor: "pointer",
                    minHeight: "40px",
                  }}
                >
                  <option value="">Visos rūšys</option>
                  {speciesOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{ flex: "0 0 calc(20% - 12.8px)", maxWidth: "200px" }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#495057",
                    fontWeight: "500",
                    fontSize: "0.9em",
                  }}
                >
                  🐕 Veislė
                </label>
                <select
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #ced4da",
                    backgroundColor: "white",
                    fontSize: "0.9em",
                    color: "#495057",
                    cursor: "pointer",
                    minHeight: "40px",
                  }}
                >
                  <option value="">Visos veislės</option>
                  {breedOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{ flex: "0 0 calc(20% - 12.8px)", maxWidth: "200px" }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#495057",
                    fontWeight: "500",
                    fontSize: "0.9em",
                  }}
                >
                  📏 Dydis
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #ced4da",
                    backgroundColor: "white",
                    fontSize: "0.9em",
                    color: "#495057",
                    cursor: "pointer",
                    minHeight: "40px",
                  }}
                >
                  <option value="">Visi dydžiai</option>
                  {sizeOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{ flex: "0 0 calc(20% - 12.8px)", maxWidth: "200px" }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#495057",
                    fontWeight: "500",
                    fontSize: "0.9em",
                  }}
                >
                  ⚡ Veiklos lygis
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #ced4da",
                    backgroundColor: "white",
                    fontSize: "0.9em",
                    color: "#495057",
                    cursor: "pointer",
                    minHeight: "40px",
                  }}
                >
                  <option value="">Visi lygiai</option>
                  {activityOptions.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{ flex: "0 0 calc(20% - 12.8px)", maxWidth: "200px" }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#495057",
                    fontWeight: "500",
                    fontSize: "0.9em",
                  }}
                >
                  🏙️ Miestas
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #ced4da",
                    backgroundColor: "white",
                    fontSize: "0.9em",
                    color: "#495057",
                    cursor: "pointer",
                    minHeight: "40px",
                  }}
                >
                  <option value="">Visi miestai</option>
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bottom row - 4 range inputs */}
            <div
              style={{
                gridColumn: "span 4",
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                marginTop: "16px",
              }}
            >
              <div
                style={{ flex: "0 0 calc(20% - 12.8px)", maxWidth: "200px" }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#495057",
                    fontWeight: "500",
                    fontSize: "0.9em",
                  }}
                >
                  🎂 Amžius nuo
                </label>
                <input
                  type="number"
                  placeholder="nuo"
                  value={ageMin}
                  onChange={(e) => setAgeMin(e.target.value)}
                  min="0"
                  style={{
                    width: "70%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #ced4da",
                    backgroundColor: "white",
                    fontSize: "0.9em",
                    color: "#495057",
                    cursor: "pointer",
                    minHeight: "40px",
                  }}
                />
              </div>

              <div
                style={{ flex: "0 0 calc(20% - 12.8px)", maxWidth: "200px" }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#495057",
                    fontWeight: "500",
                    fontSize: "0.9em",
                  }}
                >
                  🎂 Amžius iki
                </label>
                <input
                  type="number"
                  placeholder="iki"
                  value={ageMax}
                  onChange={(e) => setAgeMax(e.target.value)}
                  min="0"
                  style={{
                    width: "70%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #ced4da",
                    backgroundColor: "white",
                    fontSize: "0.9em",
                    color: "#495057",
                    cursor: "pointer",
                    minHeight: "40px",
                  }}
                />
              </div>

              <div
                style={{ flex: "0 0 calc(20% - 12.8px)", maxWidth: "200px" }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#495057",
                    fontWeight: "500",
                    fontSize: "0.9em",
                  }}
                >
                  ⚖️ Svoris nuo
                </label>
                <input
                  type="number"
                  placeholder="nuo"
                  min="0"
                  value={weightMin}
                  onChange={(e) => setWeightMin(e.target.value)}
                  style={{
                    width: "70%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #ced4da",
                    backgroundColor: "white",
                    fontSize: "0.9em",
                    color: "#495057",
                    cursor: "pointer",
                    minHeight: "40px",
                  }}
                />
              </div>

              <div
                style={{ flex: "0 0 calc(20% - 12.8px)", maxWidth: "200px" }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#495057",
                    fontWeight: "500",
                    fontSize: "0.9em",
                  }}
                >
                  ⚖️ Svoris iki
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="iki"
                  value={weightMax}
                  onChange={(e) => setWeightMax(e.target.value)}
                  style={{
                    width: "70%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #ced4da",
                    backgroundColor: "white",
                    fontSize: "0.9em",
                    color: "#495057",
                    cursor: "pointer",
                    minHeight: "40px",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <button
                onClick={resetFilters}
                style={{
                  padding: "12px 32px",
                  borderRadius: "8px",
                  border: "1px solid #6c757d",
                  backgroundColor: "white",
                  color: "#6c757d",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "0.95em",
                  transition: "all 0.2s ease",
                  minWidth: "200px",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#6c757d";
                  e.target.style.color = "white";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "white";
                  e.target.style.color = "#6c757d";
                }}
              >
                🗑️ Išvalyti filtrus
              </button>
            </div>
          </div>
        </div>

        {/* KORTELIŲ ZONA */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            "@media (max-width: 768px)": {
              padding: "16px",
            },
          }}
        >
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
              }}
            >
              <div
                style={{
                  fontSize: "1.2em",
                  color: "#6c757d",
                  marginBottom: "16px",
                }}
              >
                🔄 Kraunama...
              </div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #e9ecef",
                  borderTop: "4px solid #646cff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto",
                }}
              ></div>
              <style>{`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
                "@media (max-width: 1024px)": {
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "20px",
                },
                "@media (max-width: 768px)": {
                  gridTemplateColumns: "1fr",
                  gap: "16px",
                },
              }}
            >
              {pets.length > 0 ? (
                pets.map((pet) => (
                  <AnimalCard key={pet.pet_id || pet.id} pet={pet} />
                ))
              ) : (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "80px 40px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "3em",
                      marginBottom: "16px",
                    }}
                  >
                    🐾
                  </div>
                  <h3
                    style={{
                      color: "#6c757d",
                      marginBottom: "8px",
                      fontSize: "1.4em",
                    }}
                  >
                    Gyvūnų nerasta
                  </h3>
                  <p
                    style={{
                      color: "#adb5bd",
                      fontSize: "1em",
                    }}
                  >
                    Pabandykite pakeisti filtrus arba išvalyti juos
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainAnimalsPage;
