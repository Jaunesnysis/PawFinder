import { useState } from "react";
import { questions } from "../data/questions";
import { useNavigate } from "react-router-dom";

function Questionnaire() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [petType, setPetType] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryUsed, setRetryUsed] = useState(false);
  const navigate = useNavigate();

  const handleAnswer = (key, value, type) => {
    const processedValue = type === "scale" ? parseInt(value) : value;
    setAnswers((prev) => ({ ...prev, [key]: processedValue }));
  };

  const nextStep = () => {
    if (currentStep === 0 && answers.type) {
      setPetType(answers.type);
      setCurrentStep(1);
    } else if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submit = async (isRetry = false) => {
    setError(null);
    const requiredKeys = ["type"];
    for (let i = 0; i < 6; i++) {
      requiredKeys.push(`${petType}${i}`);
    }
    const missing = requiredKeys.filter((key) => !answers[key]);
    if (missing.length > 0) {
      alert("Please answer all questions.");
      return;
    }

    const data = {};
    data.petType = petType;
    if (petType === "dog") {
      questions.dog.forEach((q, i) => {
        const ans = answers[`dog${i}`];
        if (q.apiKey) {
          data[q.apiKey] = ans;
        } else if (q.type === "choice") {
          const option = q.options.find((o) => o.value === ans);
          if (option.apiMappings) {
            Object.assign(data, option.apiMappings);
          }
        }
      });
    } else if (petType === "cat") {
      questions.cat.forEach((q, i) => {
        const ans = answers[`cat${i}`];
        if (q.apiKey) {
          data[q.apiKey] = ans;
        }
      });
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5050/api/questionnaire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setModalData(result.recommendations);
      } else {
        if (!isRetry) {
          setError(
            "Rekomendacijų paslauga šiuo metu nepasiekiama. Bandykite dar kartą.",
          );
        } else {
          setError(
            "Paslauga vis dar nepasiekiama. Pabandykite po kurio laiko.",
          );
        }
      }
    } catch (e) {
      if (!isRetry) {
        setError(
          "Rekomendacijų paslauga šiuo metu nepasiekiama. Bandykite dar kartą.",
        );
      } else {
        setError("Paslauga vis dar nepasiekiama. Pabandykite po kurio laiko.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = () => {
    if (currentStep === 0) {
      const q = questions.type;
      return (
        <div>
          <h2>{q.question}</h2>
          {q.options.map((opt) => (
            <label key={opt.value} style={{ display: "block" }}>
              <input
                type="radio"
                name="type"
                value={opt.value}
                checked={answers.type === opt.value}
                onChange={(e) => handleAnswer("type", e.target.value, "choice")}
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    } else {
      const qIndex = currentStep - 1;
      const q = questions[petType][qIndex];
      return (
        <div>
          <h2>{q.question}</h2>
          {q.options.map((opt) => (
            <label key={opt.value} style={{ display: "block" }}>
              <input
                type="radio"
                name={`q${currentStep}`}
                value={opt.value}
                checked={answers[`${petType}${qIndex}`] === opt.value}
                onChange={(e) =>
                  handleAnswer(`${petType}${qIndex}`, e.target.value, q.type)
                }
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    }
  };

  const isLastStep = currentStep === 6;
  const canNext =
    currentStep === 0 ? answers.type : answers[`${petType}${currentStep - 1}`];

  return (
    <div>
      <p>Step {currentStep + 1} of 7</p>
      {renderQuestion()}
      <div>
        <button onClick={prevStep} disabled={currentStep === 0}>
          Previous
        </button>
        {isLastStep ? (
          <button onClick={() => submit()} disabled={loading || !!error}>
            Submit
          </button>
        ) : (
          <button onClick={nextStep} disabled={!canNext}>
            Next
          </button>
        )}
      </div>
      {/* LOADING */}
      {loading && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>🐾 Ieškome geriausio augintinio...</p>
        </div>
      )}
      {error && (
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            padding: "16px",
            backgroundColor: "#fff0f0",
            borderRadius: "12px",
            border: "1px solid #ffc1c1",
          }}
        >
          <p style={{ color: "#d32f2f", marginBottom: "12px" }}>{error}</p>
          {!retryUsed && (
            <button
              onClick={() => {
                setError(null);
                setRetryUsed(true);
                submit(true);
              }}
              style={{
                padding: "10px 24px",
                backgroundColor: "#f5222d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Bandyti dar kartą
            </button>
          )}
        </div>
      )}

      {/* MODAL */}
      {modalData && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "800px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              onClick={() => setModalData(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              ✕
            </button>

            <h2 style={{ textAlign: "center", marginBottom: "8px" }}>
              🐾 Jūsų rezultatai
            </h2>

            {/* Ninja suggestions */}
            {modalData.ninjaSuggestions &&
              modalData.ninjaSuggestions.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: "16px" }}>
                    Rekomenduojamos veislės
                  </h3>
                  <div
                    style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
                  >
                    {modalData.ninjaSuggestions.map((breed) => (
                      <div
                        key={breed.name}
                        style={{
                          flex: "1",
                          minWidth: "200px",
                          border: "1px solid #e1e5e9",
                          borderRadius: "12px",
                          padding: "16px",
                          textAlign: "center",
                        }}
                      >
                        {breed.image_link && (
                          <img
                            src={breed.image_link}
                            alt={breed.name}
                            style={{
                              width: "100%",
                              height: "150px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        )}
                        <h4 style={{ margin: "8px 0" }}>{breed.name}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Shelter match */}
            {modalData.shelterMatch && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "20px",
                  backgroundColor: "#f0f9f0",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "2px solid #4caf50",
                }}
              >
                <h3 style={{ color: "#2e7d32", marginBottom: "8px" }}>
                  🏠 Geriausias atitikmuo mūsų prieglaudoje
                </h3>
                <p
                  style={{
                    fontSize: "1.4em",
                    fontWeight: "bold",
                    color: "#1b5e20",
                  }}
                >
                  {modalData.shelterMatch}
                </p>
                <button
                  onClick={() => {
                    setModalData(null);
                    navigate("/mainAnimals", {
                      state: { breed: modalData.shelterMatch },
                    });
                  }}
                  style={{
                    marginTop: "12px",
                    padding: "10px 24px",
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1em",
                  }}
                >
                  Ieškoti šios veislės prieglaudoje →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Questionnaire;
