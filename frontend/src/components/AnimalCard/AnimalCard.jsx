import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AnimalCard = ({ pet }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkFavorite = async () => {
            if (!user.id || !pet.id) {
                setLoading(false);
                return;
            }
            
            try {
                const response = await fetch(
                    `http://localhost:5050/api/pets/favorites/${user.id}/${pet.id}`
                );
                const data = await response.json();
                setIsFavorite(data.isFavorite || false);
            } catch (error) {
                console.error("Klaida tikrinant mėgstamumą:", error);
            } finally {
                setLoading(false);
            }
        };

        checkFavorite();
    }, [user.id, pet.id]);

    // Funkcija navigacijai
    const goToDetails = () => {
        navigate(`/pets/${pet.id}`);
    };

    // funkcija su API iškvietimais
    const toggleFavorite = async (e) => {
    e.stopPropagation();

    try {
        if (isFavorite) {
            await fetch(
                `http://localhost:5050/api/pets/favorites/${user.id}/${pet.id}`,
                { method: 'DELETE' }
            );
        } else {
            await fetch(
                `http://localhost:5050/api/pets/favorites/${user.id}/${pet.id}`,
                { method: 'POST' }
            );
        }
        setIsFavorite(!isFavorite);
    } catch (error) {
        console.error("Klaida:", error);
    }
};

    return (
        <div onClick={goToDetails} style={cardStyle}>
            <div style={{ marginBottom: '16px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                }}>
                    <h3 style={{
                        margin: '0',
                        color: '#2c3e50',
                        fontSize: '1.4em',
                        fontWeight: '600'
                    }}>
                        {pet.name}
                    </h3>
                    <button
                        onClick={toggleFavorite}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '2em',
                            padding: '0',
                            margin: '0',
                            color: isFavorite ? '#ff4757' : '#666',
                            transition: 'color 0.2s ease, transform 0.1s ease'
                        }}
                        title={isFavorite ? 'Pašalinti iš mėgstamų' : 'Pridėti prie mėgstamų'}
                    >
                        {isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                }}>
                    <span style={{
                        backgroundColor: pet.status === 'available' ? '#d4edda' : '#fff3cd',
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.85em'
                    }}>
                        {pet.status}
                    </span>
                    <span style={{ color: '#6c757d' }}>📍 {pet.city}</span>
                </div>
            </div>

            <div style={traitsGridStyle}>
                <div><strong>Rūšis:</strong> <p>{pet.species}</p></div>
                <div><strong>Veislė:</strong> <p>{pet.breed || 'Nežinoma'}</p></div>
                <div><strong>Amžius:</strong> <p>{pet.age} m.</p></div>
                <div><strong>Svoris:</strong> <p>{pet.weight} kg</p></div>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); goToDetails(); }}
                style={buttonStyle}
            >
                Daugiau informacijos
            </button>
        </div>
    );
};

// Paprasti stiliai (iš tavo kodo)
const cardStyle = {
    border: '1px solid #e1e5e9', padding: '20px', borderRadius: '16px',
    backgroundColor: 'white', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
};
const traitsGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9em' };
const buttonStyle = {
    width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
    backgroundColor: '#646cff', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'
};

export default AnimalCard;