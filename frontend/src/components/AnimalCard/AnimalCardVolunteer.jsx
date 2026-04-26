import React, { useState } from 'react';
import './AnimalCardVolunteer.css';
import { useNavigate } from 'react-router-dom';

const AnimalCardVolunteer = ({ pet }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Jei gyvūnas neturi nuotraukų, naudojame laikiną "placeholder"
    const hasImages = pet.images && pet.images.length > 0;
    const images = hasImages ? pet.images : [{ url: 'https://via.placeholder.com/400x300?text=Nėra+nuotraukos' }];
    const navigate = useNavigate();
    return (
        <div className="pet-card">
            {/* NUOTRAUKOS DALIS */}
            <div className="pet-image-container">
                <img
                    src={images[currentImageIndex].url}
                    alt={pet.name}
                    className="pet-image"
                />

                {/* Statuso ženkliukas ant nuotraukos */}
                <div className="pet-status-badge">{pet.status}</div>

                {/* Karuselės taškiukai (rodomi tik jei yra > 1 nuotrauka) */}
                {images.length > 1 && (
                    <div className="image-dots">
                        {images.map((_, index) => (
                            <span
                                key={index}
                                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndex(index);
                                }}
                            ></span>
                        ))}
                    </div>
                )}
            </div>

            {/* INFORMACIJOS DALIS */}
            <div className="pet-info">
                <div className="pet-header">
                    <h3>{pet.name}</h3>
                    <span className="pet-city">📍 {pet.city}</span>
                </div>

                <p className="pet-breed">{pet.breed}</p>

                {/* Grupavimo tinklelis pagrindinėms savybėms */}
                <div className="pet-traits">
                    <div className="trait">
                        <span className="trait-label">Amžius</span>
                        <span className="trait-value">{pet.age} m.</span>
                    </div>
                    <div className="trait">
                        <span className="trait-label">Dydis</span>
                        <span className="trait-value">{pet.size}</span>
                    </div>
                    <div className="trait">
                        <span className="trait-label">Svoris</span>
                        <span className="trait-value">{pet.weight} kg</span>
                    </div>
                </div>

                {/* 3. ŠTAI TAVO MYGTUKAS PAČIAME GALE */}
                <button
                    className="more-info-btn"
                    onClick={() => navigate(`/pets/${pet.id}`)}
                >
                    Daugiau informacijos
                </button>
            </div>
        </div>
    );
};

export default AnimalCardVolunteer;