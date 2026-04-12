import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PetDetailsPage.css';

const PetDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Pagrindinės būsenos
    const [pet, setPet] = useState(null);
    const [activeImg, setActiveImg] = useState(0);
    const [showModal, setShowModal] = useState(false);

    // Rezervacijos būsenos
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Saugumo duomenys
    const token = localStorage.getItem('token');

    // 1. Užkrauname gyvūno duomenis
    useEffect(() => {
        fetch(`http://localhost:5050/api/pets/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Nepavyko gauti duomenų");
                return res.json();
            })
            .then(data => {
                setPet(data);
                // Jei yra nuotraukų, surandame pagrindinę
                const primaryIdx = data.images.findIndex(img => img.is_primary);
                if (primaryIdx !== -1) setActiveImg(primaryIdx);
            })
            .catch(err => console.error("Klaida:", err));
    }, [id]);

    // 2. Užkrauname laisvus laikus pasirinktai datai
    const fetchSlots = async (date) => {
        setLoadingSlots(true);
        try {
            const response = await fetch(`http://localhost:5050/api/pets/${id}/timeslots?date=${date}`);
            const data = await response.json();
            setSlots(data.slots || []);
        } catch (error) {
            setErrorMessage('Nepavyko užkrauti laikų');
        } finally {
            setLoadingSlots(false);
        }
    };

    // 3. Rezervacijos kūrimas
    const handleCreateReservation = async () => {
        if (!selectedSlot) return setErrorMessage('Pasirinkite laiką.');

        try {
            const response = await fetch('http://localhost:5050/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    pet_id: pet.id,
                    date: selectedDate,
                    reservation_start: selectedSlot.reservation_start,
                    reservation_end: selectedSlot.reservation_end,
                }),
            });

            if (!response.ok) throw new Error('Rezervacija nepavyko. Bandykite dar kartą.');

            setStatusMessage('Rezervacija sėkmingai sukurta! 🐾');
            setShowModal(false);
            // Po 3 sekundžių nuimame sėkmės pranešimą
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    if (!pet) return <div className="loading-screen">Kraunama informacija... 🐾</div>;

    return (
        <div className="details-wrapper">
            <button className="back-link" onClick={() => navigate(-1)}>
                ← Grįžti į sąrašą
            </button>

            {statusMessage && <div className="success-banner">{statusMessage}</div>}

            <div className="details-card">
                {/* KAIRĖ: Galerija */}
                <div className="details-gallery">
                    <div className="main-stage">
                        <img
                            src={pet.images && pet.images.length > 0
                                ? pet.images[activeImg]?.url
                                : 'https://via.placeholder.com/600x400?text=Nėra+nuotraukos'}
                            alt={pet.name}
                        />
                    </div>
                    {pet.images && pet.images.length > 1 && (
                        <div className="thumbnails">
                            {pet.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img.url}
                                    className={activeImg === index ? 'thumb active' : 'thumb'}
                                    onClick={() => setActiveImg(index)}
                                    alt=""
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* DEŠINĖ: Info skiltis */}
                <div className="details-info">
                    <div className="info-top">
                        <h1>{pet.name}</h1>
                        <span className={`badge-status ${pet.status === 'available' ? 'status-available' : 'status-reserved'}`}>
                         {pet.status}
                        </span>
                    </div>

                    <p className="breed-text">{pet.species} • {pet.breed}</p>
                    <p className="location-text">📍 {pet.city}</p>

                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="label">Amžius</span>
                            <span className="value">{pet.age} m.</span>
                        </div>
                        <div className="stat-item">
                            <span className="label">Svoris</span>
                            <span className="value">{pet.weight} kg</span>
                        </div>
                        <div className="stat-item">
                            <span className="label">Dydis</span>
                            <span className="value">{pet.size}</span>
                        </div>
                        <div className="stat-item">
                            <span className="label">Aktyvumas</span>
                            <span className="value">{pet.activity_level}</span>
                        </div>
                    </div>

                    <div className="description-section">
                        <h3>Apie augintinį</h3>
                        <p>{pet.shelter_description || "Aprašymo nėra."}</p>
                    </div>

                    {pet.ai_description && (
                        <div className="ai-section">
                            <div className="ai-header">✨ AI Įžvalga</div>
                            <p>{pet.ai_description}</p>
                        </div>
                    )}

                    <div className="action-area">
                        {pet.status === 'available' ? (
                            <button
                                className="cta-reserve"
                                onClick={() => { setShowModal(true); fetchSlots(selectedDate); }}
                            >
                                Rezervuoti pasivaikščiojimą
                            </button>
                        ) : (
                            <div className="reserved-message">
                                🔒 Šiuo metu augintinis rezervuotas. Laisvų laikų nėra.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rezervacijos Modalinis langas */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Rezervuoti laiką su {pet.name}</h3>

                        <div className="modal-body">
                            <label>Pasirinkite datą:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    fetchSlots(e.target.value);
                                }}
                            />

                            {loadingSlots ? (
                                <p className="loading-text">Ieškome laisvų laikų...</p>
                            ) : (
                                <div className="slots-container">
                                    <p>Galimi laikai:</p>
                                    <div className="slots-grid">
                                        {slots.length > 0 ? slots.map(slot => (
                                            <button
                                                key={slot.reservation_start}
                                                className={`slot-btn ${selectedSlot?.reservation_start === slot.reservation_start ? 'active' : ''}`}
                                                onClick={() => setSelectedSlot(slot)}
                                            >
                                                {slot.reservation_start.slice(0,5)}
                                            </button>
                                        )) : <p className="no-slots">Šiai dienai laisvų laikų nėra.</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {errorMessage && <p className="error-text-modal">{errorMessage}</p>}

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Atšaukti</button>
                            <button className="btn-confirm" onClick={handleCreateReservation}>Patvirtinti</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PetDetailsPage;