import React, { useState } from 'react';
import './AnimalCardVolunteer.css';
import { useNavigate } from 'react-router-dom';
import { imageUrl } from '../../utils/imageUrl';

const STATUS_LABEL = { available: 'Laisvas', reserved: 'Rezervuotas', adopted: 'Priglaustas' };
const SIZE = { small: 'Mažas', medium: 'Vidutinis', large: 'Didelis' };

const AnimalCardVolunteer = ({ pet }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const navigate = useNavigate();

    // Jei gyvūnas neturi nuotraukų, naudojame laikiną "placeholder"
    const hasImages = pet.images && pet.images.length > 0;
    const images = hasImages
        ? [...pet.images].sort((a, b) => Number(!!b.is_primary) - Number(!!a.is_primary))
        : [{ url: 'https://via.placeholder.com/400x300?text=Nėra+nuotraukos' }];

    const currentImage = images[currentImageIndex] ?? images[0];

    return (
        <div className="pet-card">
            {/* NUOTRAUKOS DALIS */}
            <div className="pet-image-container">
                <img
                    src={imageUrl(currentImage.url)}
                    alt={pet.name}
                    className="pet-image"
                />

                {/* Statuso ženkliukas ant nuotraukos */}
                <div className="pet-status-badge">{STATUS_LABEL[pet.status] ?? pet.status}</div>

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
                        <span className="trait-value">{SIZE[pet.size] ?? '—'}</span>
                    </div>
                    <div className="trait">
                        <span className="trait-label">Svoris</span>
                        <span className="trait-value">
                            {pet.weight ? `${Number(pet.weight)} kg` : '—'}
                        </span>
                    </div>
                </div>

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