import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReservationModal from '../../components/Reservation/ReservationModal';
import './PetDetailsPage.css';

const PetDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [pet, setPet] = useState(null);
    const [activeImg, setActiveImg] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        fetch(`http://localhost:5050/api/pets/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Nepavyko gauti duomenų");
                return res.json();
            })
            .then(data => {
                setPet(data);
                const primaryIdx = data.images.findIndex(img => img.is_primary);
                if (primaryIdx !== -1) setActiveImg(primaryIdx);
            })
            .catch(err => console.error("Klaida:", err));
    }, [id]);

    const handleReservationSuccess = () => {
        setStatusMessage('Rezervacija sėkmingai sukurta! 🐾');
        setShowModal(false);
        setTimeout(() => window.location.reload(), 2000);
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
                                : 'https://placehold.co/600x400?text=Nėra+nuotraukos'}
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

                    {/* VEIKSMO ZONA: Mygtukas rodomas tik jei laisvas */}
                    <div className="action-area">
                        {pet.status === 'available' ? (
                            <button className="cta-reserve" onClick={() => setShowModal(true)}>
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

            {/* IŠKELTAS KOMPONENTAS (MODALAS) */}
            {showModal && (
                <ReservationModal
                    pet={pet}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleReservationSuccess}
                />
            )}
        </div>
    );
};

export default PetDetailsPage;