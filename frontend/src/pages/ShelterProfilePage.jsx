import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AnimalCard from '../components/AnimalCard/AnimalCard.jsx';

const ShelterProfilePage = () => {
    const { shelterId } = useParams();
    const [shelter, setShelter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShelterProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5050/api/shelters/${shelterId}`);
                if (!response.ok) {
                    throw new Error('Shelter not found');
                }
                const data = await response.json();
                setShelter(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching shelter:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchShelterProfile();
    }, [shelterId]);

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

    if (error || !shelter) {
        return (
            <div style={{
                padding: '24px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '8px',
                margin: '24px',
                textAlign: 'center'
            }}>
                <p>Nepavyko užkrauti prieglaidos profilio: {error}</p>
                <Link to="/mainAnimals" style={{
                    color: '#721c24',
                    textDecoration: 'underline',
                    fontWeight: '500'
                }}>
                    Grįžti į gyvūnų sąrašą
                </Link>
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
                {/* Back button */}
                <Link to="/mainAnimals" style={{
                    color: '#007bff',
                    textDecoration: 'none',
                    fontSize: '0.95em',
                    fontWeight: '500',
                    marginBottom: '24px',
                    display: 'inline-block'
                }}>
                    ← Grįžti
                </Link>

                {/* Shelter Header */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    marginBottom: '32px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                    <h1 style={{
                        margin: '0 0 16px 0',
                        color: '#2c3e50',
                        fontSize: '2.5em',
                        fontWeight: '700'
                    }}>
                        {shelter.name}
                    </h1>
                    
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '24px',
                        fontSize: '1.1em',
                        color: '#6c757d'
                    }}>
                        <span>📍</span>
                        <span>{shelter.city}</span>
                    </div>

                    <p style={{
                        color: '#495057',
                        lineHeight: '1.6',
                        fontSize: '1.05em',
                        margin: '0 0 24px 0'
                    }}>
                        {shelter.description}
                    </p>

                    {/* Contact Information */}
                    <div style={{
                        borderTop: '1px solid #e1e5e9',
                        paddingTop: '24px',
                        marginTop: '24px'
                    }}>
                        <h2 style={{
                            margin: '0 0 20px 0',
                            color: '#2c3e50',
                            fontSize: '1.4em',
                            fontWeight: '600'
                        }}>
                            Kontaktai
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '20px'
                        }}>
                            {shelter.contact.email && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <span style={{ fontSize: '1.3em' }}>✉️</span>
                                    <div>
                                        <p style={{
                                            margin: '0 0 4px 0',
                                            color: '#6c757d',
                                            fontSize: '0.9em'
                                        }}>
                                            El. paštas
                                        </p>
                                        <a href={`mailto:${shelter.contact.email}`} style={{
                                            color: '#007bff',
                                            textDecoration: 'none',
                                            fontWeight: '500',
                                            wordBreak: 'break-all'
                                        }}>
                                            {shelter.contact.email}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {shelter.contact.phone && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <span style={{ fontSize: '1.3em' }}>📱</span>
                                    <div>
                                        <p style={{
                                            margin: '0 0 4px 0',
                                            color: '#6c757d',
                                            fontSize: '0.9em'
                                        }}>
                                            Telefonas
                                        </p>
                                        <a href={`tel:${shelter.contact.phone}`} style={{
                                            color: '#007bff',
                                            textDecoration: 'none',
                                            fontWeight: '500'
                                        }}>
                                            {shelter.contact.phone}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {shelter.contact.address && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <span style={{ fontSize: '1.3em' }}>🏠</span>
                                    <div>
                                        <p style={{
                                            margin: '0 0 4px 0',
                                            color: '#6c757d',
                                            fontSize: '0.9em'
                                        }}>
                                            Adresas
                                        </p>
                                        <p style={{
                                            margin: '0',
                                            color: '#495057',
                                            fontWeight: '500'
                                        }}>
                                            {shelter.contact.address}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {shelter.contact.website && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <span style={{ fontSize: '1.3em' }}>🌐</span>
                                    <div>
                                        <p style={{
                                            margin: '0 0 4px 0',
                                            color: '#6c757d',
                                            fontSize: '0.9em'
                                        }}>
                                            Svetainė
                                        </p>
                                        <a href={shelter.contact.website} target="_blank" rel="noopener noreferrer" style={{
                                            color: '#007bff',
                                            textDecoration: 'none',
                                            fontWeight: '500',
                                            wordBreak: 'break-all'
                                        }}>
                                            {shelter.contact.website}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pets Section */}
                <div>
                    <h2 style={{
                        color: '#2c3e50',
                        fontSize: '1.8em',
                        fontWeight: '600',
                        marginBottom: '24px'
                    }}>
                        Gyvūnai šioje priegaudoje ({shelter.pets.length})
                    </h2>

                    {shelter.pets.length === 0 ? (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '32px',
                            textAlign: 'center',
                            color: '#6c757d'
                        }}>
                            <p>Šios prieglaidos gyvūnai šiuo metu nėra prieinami.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '24px'
                        }}>
                            {shelter.pets.map(pet => (
                                <AnimalCard key={pet.pet_id} pet={pet} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShelterProfilePage;
