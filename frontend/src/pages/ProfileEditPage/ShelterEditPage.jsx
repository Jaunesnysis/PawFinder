import { useEffect, useState } from "react";
import "./EditPage.css";

const formatDateForInput = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

const getInitialUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
};

export default function ShelterProfilePage() {
  const initialUser = getInitialUser();

  const [form, setForm] = useState({
    name: initialUser.name || "",
    surname: initialUser.surname || "",
    email: initialUser.email || "",
    phone: initialUser.phone || "",
    birthDate: formatDateForInput(initialUser.birthDate || initialUser.birth_date),
    password: "",
    // Prieglaudos duomenys
    shelterName: "",
    city: "",
    address: "",
    description: "",
    contacts: "",
    accountNumber: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5050/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Nepavyko gauti profilio duomenų.");

        const storedUser = getInitialUser();
        const shelterId =
          data.shelterId ||
          data.shelter_id ||
          data.shelter?.id ||
          storedUser.shelterId ||
          storedUser.shelter_id;

        let shelterData = {};
        if (shelterId) {
          const shelterRes = await fetch(
            `http://localhost:5050/api/shelters/${shelterId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              signal: controller.signal,
            }
          );

          const shelterJson = await shelterRes.json();
          if (!shelterRes.ok) {
            throw new Error(shelterJson.error || "Nepavyko gauti prieglaudos duomenų.");
          }

          shelterData = shelterJson.shelter || shelterJson;
        }

        setForm((prev) => ({
          ...prev,
          name: data.name || "",
          surname: data.surname || "",
          email: data.email || "",
          phone: data.phone || "",
          birthDate: formatDateForInput(data.birthDate || data.birth_date),
          password: "",
          shelterName: shelterData.name || "",
          city: shelterData.city || "",
          address: shelterData.contact?.address || shelterData.address || "",
          description: shelterData.description || "",
          contacts:
          shelterData.contact?.phone ||
          shelterData.contact?.contacts ||
          shelterData.contacts ||
          shelterData.phone ||
          "",
        accountNumber:
          shelterData.donation_account ||
          shelterData.donationAccount ||
          shelterData.accountNumber ||
          shelterData.account_number ||
          "",
        }));
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

    loadProfile();
    return () => controller.abort();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      // USER ATNAUJINIMAS
      const userPayload = {
        name: form.name,
        surname: form.surname,
        email: form.email,
        phone: form.phone,
        birthDate: form.birthDate,
      };
      if (form.password.trim()) {
        userPayload.password = form.password;
      }

      const res = await fetch("http://localhost:5050/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nepavyko išsaugoti asmeninių duomenų.");

      localStorage.setItem(
        "user",
        JSON.stringify({ ...getInitialUser(), ...data })
      );

      setForm((prev) => ({ ...prev, password: "" }));

      // PRIEGLAUDOS ATNAUJINIMAS
      const shelterRes = await fetch("http://localhost:5050/api/shelters/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shelterName: form.shelterName,
          city: form.city,
          address: form.address,
          description: form.description,
          contacts: form.contacts,
          donationAccount: form.accountNumber.trim() || null,
        }),
      });

      const shelterData = await shelterRes.json();
      if (!shelterRes.ok) {
        throw new Error(
          shelterData.error ||
            "Asmeniniai duomenys išsaugoti, bet nepavyko išsaugoti prieglaudos duomenų."
        );
      }

      setForm((prev) => ({
        ...prev,
        shelterName: shelterData.name || prev.shelterName,
        city: shelterData.city || prev.city,
        address: shelterData.contact?.address || prev.address,
        description: shelterData.description || prev.description,
        contacts: shelterData.contact?.phone || prev.contacts,
        accountNumber: shelterData.donation_account || "",
      }));

      setMessage("Pakeitimai išsaugoti!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5050/api/shelters/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Nepavyko ištrinti paskyros.");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (err) {
      setShowDeleteModal(false);
      setError(err.message);
    }
  };

  return (
    <div className="profile-page">
      <h1 className="profile-title">Prieglaudos profilis</h1>

      <form className="profile-card" onSubmit={handleSubmit}>
        <h2 className="profile-section-title">Asmeniniai duomenys</h2>

        <div className="profile-grid">
          <label className="profile-field">
            <span>Vardas</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Įveskite vardą"
              disabled={loading}
            />
          </label>

          <label className="profile-field">
            <span>Pavardė</span>
            <input
              type="text"
              name="surname"
              value={form.surname}
              onChange={handleChange}
              placeholder="Įveskite pavardę"
              disabled={loading}
            />
          </label>

          <label className="profile-field">
            <span>El. paštas</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="vardas@paštas.lt"
              disabled={loading}
            />
          </label>

          <label className="profile-field">
            <span>Telefonas</span>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+370 600 00000"
              disabled={loading}
            />
          </label>

          <label className="profile-field">
            <span>Gimimo data</span>
            <input
              type="date"
              name="birthDate"
              value={form.birthDate}
              onChange={handleChange}
              disabled={loading}
            />
          </label>

          <label className="profile-field">
            <span>Slaptažodis</span>
            <div className="profile-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Naujas slaptažodis (nebūtina)"
                className="profile-password-input"
                disabled={loading}
              />
              <button
                type="button"
                className="profile-eye-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Slėpti slaptažodį" : "Rodyti slaptažodį"}
                title={showPassword ? "Slėpti slaptažodį" : "Rodyti slaptažodį"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>
        </div>

        <h2 className="profile-section-title profile-section-title--spaced">
          Prieglaudos duomenys
        </h2>

        <div className="profile-grid">
          <label className="profile-field profile-field-full">
            <span>Prieglaudos pavadinimas</span>
            <input
              type="text"
              name="shelterName"
              value={form.shelterName}
              onChange={handleChange}
              placeholder="Prieglaudos pavadinimas"
              disabled={loading}
            />
          </label>

          <label className="profile-field">
            <span>Miestas</span>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Miestas"
              disabled={loading}
            />
          </label>

          <label className="profile-field">
            <span>Prieglaudos adresas</span>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Prieglaudos adresas"
              disabled={loading}
            />
          </label>

          <label className="profile-field profile-field-full">
            <span>Prieglaudos aprašymas</span>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Trumpas prieglaudos aprašymas"
              disabled={loading}
            />
          </label>

          <label className="profile-field">
            <span>Kontaktai</span>
            <input
              type="text"
              name="contacts"
              value={form.contacts}
              onChange={handleChange}
              placeholder="Telefono numeris"
              disabled={loading}
            />
          </label>

          <label className="profile-field">
            <span>Paramos sąskaita (neprivaloma)</span>
            <input
              type="text"
              name="accountNumber"
              value={form.accountNumber}
              onChange={handleChange}
              placeholder="Sąskaitos numeris"
              disabled={loading}
            />
          </label>
        </div>

        {error && <p className="profile-error">{error}</p>}
        {message && <p className="profile-success">{message}</p>}

        <div className="profile-actions">
          <button
            type="button"
            className="profile-delete-btn"
            onClick={() => setShowDeleteModal(true)}
            disabled={loading || saving}
          >
            Ištrinti paskyrą
          </button>

          <button type="submit" className="profile-save-btn" disabled={loading || saving}>
            {saving ? "Saugoma..." : "Išsaugoti pakeitimus"}
          </button>
        </div>
      </form>

      {showDeleteModal && (
        <div
          className="profile-modal-overlay"
          onClick={() => setShowDeleteModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="profile-modal-title">Ištrinti paskyrą?</h2>
            <p className="profile-modal-text">
              Ar tikrai norite ištrinti savo paskyrą? Šio veiksmo atšaukti negalima.
            </p>
            <div className="profile-modal-actions">
              <button
                type="button"
                className="profile-modal-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Atšaukti
              </button>
              <button
                type="button"
                className="profile-modal-confirm"
                onClick={handleConfirmDelete}
              >
                Taip, ištrinti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}