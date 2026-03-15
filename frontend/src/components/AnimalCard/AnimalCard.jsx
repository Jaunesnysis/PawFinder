import React, { useState } from 'react';

// Šis komponentas gauna "pet" objektą per "props"
const AnimalCard = ({ pet }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    const toggleFavorite = (e) => {
        e.stopPropagation(); // Prevent card click when clicking heart
        setIsFavorite(!isFavorite);
    };

    return (
        <div style={{
            border: '1px solid #e1e5e9',
            padding: '20px',
            borderRadius: '16px',
            minWidth: '280px',
            maxWidth: '320px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            backgroundColor: 'white',
            textAlign: 'left',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            '@media (max-width: 768px)': {
                minWidth: 'auto',
                maxWidth: 'none',
                padding: '16px'
            }
        }}>
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
                        backgroundColor: pet.status === 'Laisvas' ? '#d4edda' : '#fff3cd',
                        color: pet.status === 'Laisvas' ? '#155724' : '#856404',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.85em',
                        fontWeight: '500'
                    }}>
                        {pet.status}
                    </span>
                    <span style={{
                        color: '#6c757d',
                        fontSize: '0.9em',
                        fontWeight: '500'
                    }}>
                        📍 {pet.city}
                    </span>
                </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    fontSize: '0.9em',
                    '@media (max-width: 768px)': {
                        gridTemplateColumns: '1fr',
                        gap: '8px'
                    }
                }}>
                    <div>
                        <strong style={{ color: '#495057' }}>Rūšis:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{pet.species}</p>
                    </div>
                    <div>
                        <strong style={{ color: '#495057' }}>Veislė:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{pet.breed || 'Nežinoma'}</p>
                    </div>
                    <div>
                        <strong style={{ color: '#495057' }}>Amžius:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{pet.age} m.</p>
                    </div>
                    <div>
                        <strong style={{ color: '#495057' }}>Dydis:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{pet.size}</p>
                    </div>
                    <div>
                        <strong style={{ color: '#495057' }}>Svoris:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{pet.weight} kg</p>
                    </div>
                    <div>
                        <strong style={{ color: '#495057' }}>Veikla:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{pet.activity_level}</p>
                    </div>
                </div>
            </div>

            {pet.ai_description && (
                <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    borderLeft: '4px solid #646cff'
                }}>
                    <p style={{
                        margin: 0,
                        fontSize: '0.9em',
                        color: '#495057',
                        lineHeight: '1.4'
                    }}>
                        {pet.ai_description}
                    </p>
                </div>
            )}

            <button style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#646cff',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.95em',
                transition: 'background-color 0.2s ease',
                '@media (max-width: 768px)': {
                    padding: '14px 16px',
                    fontSize: '1em'
                }
            }}>
                Daugiau informacijos
            </button>
        </div>
    );
};

export default AnimalCard;