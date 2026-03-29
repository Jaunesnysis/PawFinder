import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ShelterListPage = () => {
    const [shelters, setShelters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShelters = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5050/api/shelters');
                if (!response.ok) {
                    throw new Error('Failed to load shelters');
                }
                const data = await response.json();
                setShelters(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching shelters:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchShelters();
    }, []);

    if (loading) {
        return (
            <div style={{
                padding: '24px',
                textAlign: 'center',
                color: '#6c757d'
            }}>
                Kraunasi...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                padding: '24px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '8px',
                margin: '24px',
                textAlign: 'center'
            }}>
                <p>Nepavyko užkrauti priegaudų: {error}</p>
            </div>
        );
    }

    return (
        <div style={{
            padding: '24px',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <h1 style={{
                    color: '#2c3e50',
                    fontSize: '2em',
                    fontWeight: '700',
                    marginBottom: '32px',
                    textAlign: 'center'
                }}>
                    Gyvūnų priegaudos
                </h1>

                {shelters.length === 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '32px',
                        textAlign: 'center',
                        color: '#6c757d'
                    }}>
                        <p>Priegaudų nėra.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '24px'
                    }}>
                        {shelters.map(shelter => (
                            <Link
                                key={shelter.shelter_id}
                                to={`/shelters/${shelter.shelter_id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    cursor: 'pointer',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                }}
                                >
                                    <h2 style={{
                                        margin: '0 0 12px 0',
                                        color: '#2c3e50',
                                        fontSize: '1.5em',
                                        fontWeight: '600'
                                    }}>
                                        {shelter.name}
                                    </h2>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '16px',
                                        color: '#6c757d',
                                        fontSize: '0.95em'
                                    }}>
                                        <span>📍</span>
                                        <span>{shelter.city}</span>
                                    </div>

                                    <p style={{
                                        color: '#495057',
                                        lineHeight: '1.5',
                                        fontSize: '0.95em',
                                        margin: '0 0 16px 0',
                                        flex: 1
                                    }}>
                                        {shelter.description}
                                    </p>

                                    <div style={{
                                        paddingTop: '16px',
                                        borderTop: '1px solid #e1e5e9',
                                        display: 'flex',
                                        gap: '12px',
                                        fontSize: '0.85em',
                                        flexWrap: 'wrap'
                                    }}>
                                        {shelter.contact.email && (
                                            <span style={{
                                                color: '#007bff',
                                                fontWeight: '500'
                                            }}>
                                                ✉️ {shelter.contact.email}
                                            </span>
                                        )}
                                        {shelter.contact.phone && (
                                            <span style={{
                                                color: '#007bff',
                                                fontWeight: '500'
                                            }}>
                                                📱 {shelter.contact.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShelterListPage;
