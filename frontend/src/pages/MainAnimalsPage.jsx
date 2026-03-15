import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import AnimalCard from '../components/AnimalCard/AnimalCard.jsx'; // 1. IMPORTUOK KORTELĘ

const socket = io('http://localhost:5050');

const MainAnimalsPage = () => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPets = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5050/api/pets/mainAnimals');
            const data = await response.json();
            setPets(data);
        } catch (error) {
            console.error("Klaida:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPets(); }, []);

    useEffect(() => {
        socket.on('StatusChanged', fetchPets);
        return () => socket.off('StatusChanged');
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Visų gyvūnų sąrašas</h1>


            {loading ? <p>Kraunama...</p> : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '20px'
                }}>
                    {pets.length > 0 ? (
                        // 2. NAUDOK KORTELĘ ČIA
                        pets.map(pet => <AnimalCard key={pet.id} pet={pet} />)
                    ) : (
                        <p>Gyvūnų nerasta.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default MainAnimalsPage;