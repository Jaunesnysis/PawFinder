import React from 'react';
import { useNavigate } from 'react-router-dom';

const AnimalCard = ({ pet }) => {
    const navigate = useNavigate();

    // Funkcija navigacijai
    const goToDetails = () => {
        navigate(`/pets/${pet.id}`);
    };

    return (
        <div onClick={goToDetails} style={cardStyle}>
            <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>{pet.name}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
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