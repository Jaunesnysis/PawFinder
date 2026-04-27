import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import io from 'socket.io-client';
import AnimalCard from '../components/AnimalCard/AnimalCard.jsx';

const socket = io('http://localhost:5050');

const AnimalListPage = () => {
    const {userid} = useParams();
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPets = async () => {
        setLoading(true);
        try {
            // Kreipiamės į pagrindinį gyvūnų sąrašą be filtrų
            const response = await fetch(`http://localhost:5050/api/pets/favorites/${userid}`);
            const data = await response.json();
            setPets(data);
        } catch (error) {
            console.error("Klaida užkraunant gyvūnus:", error);
        } finally {
            setLoading(false);
        }
    };

    // Užkrauname duomenis tik vieną kartą, kai puslapis atsidaro
    useEffect(() => { 
        fetchPets(); 
    }, []);

    // Realaus laiko atnaujinimas per Socket.io
    useEffect(() => {
        socket.on('StatusChanged', fetchPets);
        return () => socket.off('StatusChanged');
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Mano Mėgstmiausi</h1>

            {loading ? <p>Kraunama...</p> : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '20px'
                }}>
                    {pets.length > 0 ? (
                        pets.map(pet => <AnimalCard key={pet.pet_id || pet.id} pet={pet} />)
                    ) : (
                        <p>Mėgstamiausių gyvūnų sąrašas tuščias</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnimalListPage;