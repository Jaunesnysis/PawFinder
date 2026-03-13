import React from 'react';

// Šis komponentas gauna "pet" objektą per "props"
const AnimalCard = ({ pet }) => {
    return (
        <div style={{
            border: '1px solid #ddd',
            padding: '15px',
            borderRadius: '12px',
            minWidth: '220px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            backgroundColor: 'white',
            textAlign: 'left'
        }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{pet.name}</h3>
            <p style={{ margin: '5px 0', color: '#666' }}>📍 {pet.city}</p>
            <p style={{ margin: '5px 0' }}>
                <strong style={{ color: '#333' }}>Būsena:</strong>
                <span style={{
                    marginLeft: '5px',
                    color: pet.status === 'Laisvas' ? 'green' : 'orange',
                    fontWeight: 'bold'
                }}>
          {pet.status}
        </span>
            </p>
            <p style={{ fontSize: '0.9em', color: '#888' }}>Rūšis: {pet.species}</p>
            <button style={{
                marginTop: '10px',
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: '#646cff',
                color: 'white',
                cursor: 'pointer'
            }}>
                Daugiau informacijos
            </button>
        </div>
    );
};

export default AnimalCard;