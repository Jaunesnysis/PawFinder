import { useEffect, useMemo, useState } from "react";
import "./StatisticsPage.css";

const PERIODS = [
  { value: 7, label: "7 dienų" },
  { value: 30, label: "30 dienų" },
  { value: 90, label: "90 dienų" },
];

export default function StatisticsPage() {
  const [period, setPeriod] = useState(30);
  const [petId, setPetId] = useState("all");
  const [rows, setRows] = useState([]);
  const [petOptions, setPetOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadStatistics() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5050/api/pets/shelter/statistics?days=${period}&petId=${petId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            signal: controller.signal,
          }
        );

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Nepavyko užkrauti statistikos.");
        }

        const summary = data.summary || [];
        setRows(summary);

        if (petId === "all") {
          setPetOptions(summary);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadStatistics();
    return () => controller.abort();
  }, [period, petId]);

  const { maxScale, yTicks } = useMemo(() => {
    const maxVal = Math.max(0, ...rows.map((r) => r.views));
    const targetMax = Math.max(3, maxVal);

    let step = 1;
    if (targetMax > 6) {
      step = Math.ceil(targetMax / 5);
    }

    const top = Math.ceil(targetMax / step) * step;
    const ticks = [];
    for (let v = top; v >= 0; v -= step) {
      ticks.push(v);
    }

    return { maxScale: top, yTicks: ticks };
  }, [rows]);

  return (
    <div className="stats-page">
      <h1 className="stats-title">Statistika</h1>

      <div className="stats-filters">
        <label className="stats-field">
          <span>Laikotarpis</span>
          <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>

        <label className="stats-field">
          <span>Augintinis</span>
          <select value={petId} onChange={(e) => setPetId(e.target.value)}>
            <option value="all">Visi</option>
            {petOptions.map((p) => (
              <option key={p.petId} value={String(p.petId)}>{p.name}</option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="stats-error">{error}</p>}

      <section className="stats-chart-card">
        <h2 className="stats-chart-title">Grafikas (peržiūros)</h2>

        {loading ? (
          <p className="stats-empty">Kraunama...</p>
        ) : rows.length === 0 ? (
          <p className="stats-empty">Duomenų nėra</p>
        ) : (
          <div className="stats-chart-wrapper">
            <div className="stats-y-axis">
              {yTicks.map((tick) => (
                <span key={tick} className="stats-y-tick">
                  {tick}
                </span>
              ))}
            </div>

            <div className="stats-chart-scroll">
              <div className="stats-plot">
                <div className="stats-grid-lines">
                  {yTicks.map((tick) => (
                    <div key={tick} className="stats-grid-line" />
                  ))}
                </div>

                <div className="stats-bars-row">
                  {rows.map((p) => {
                    const heightPct = maxScale > 0 ? (p.views / maxScale) * 100 : 0;
                    const showInside = p.views > 0 && heightPct >= 15;

                    return (
                      <div key={p.petId} className="stats-bar-col">
                        <div className="stats-bar-track">
                          <div
                            className={`stats-bar ${p.views === 0 ? "stats-bar-zero" : ""}`}
                            style={{ height: p.views === 0 ? "6px" : `${heightPct}%` }}
                            title={`${p.name}: ${p.views}`}
                          >
                            <span
                              className={
                                showInside
                                  ? "stats-bar-value-inside"
                                  : "stats-bar-value-above"
                              }
                            >
                              {p.views}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="stats-labels-row">
                {rows.map((p) => (
                  <span key={p.petId} className="stats-bar-label" title={p.name}>
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="stats-table">
        <div className="stats-row stats-row-head">
          <span>Augintinis</span>
          <span>Peržiūros</span>
        </div>

        {loading ? (
          <div className="stats-row">
            <span>Kraunama...</span>
            <span>-</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="stats-row">
            <span>Duomenų nėra</span>
            <span>0</span>
          </div>
        ) : (
          rows.map((p) => (
            <div key={p.petId} className="stats-row">
              <span>{p.name}</span>
              <span>{p.views}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}