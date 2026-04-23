import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import AnimalCard from '../../components/AnimalCard/AnimalCard.jsx';
import AnimalCardVolunteer from "../../components/AnimalCard/AnimalCardVolunteer.jsx"; // 1. IMPORTUOK KORTELĘ

const socket = io('http://localhost:5050');

const AnimalListPage = () => {
    const [pets, setPets] = useState([]);
    const [city, setCity] = useState('Vilnius');
    const [loading, setLoading] = useState(false);

    const fetchPets = async (selectedCity) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5050/api/pets?city=${selectedCity}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Įvyko klaida");
            }

            const data = await response.json();
            setPets(data);
        } catch (error) {
            console.error("Klaida:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()  => { fetchPets(city); }, [city]);

    useEffect(() => {
        socket.on('StatusChanged', () => fetchPets(city));
        return () => socket.off('StatusChanged');
    }, [city]);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Laisvi gyvūnai savanoriams</h1>

            <div style={{ marginBottom: '30px' }}>
                <select value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '8px', borderRadius: '5px' }}>
                    <option value="Vilnius">Vilnius</option>
                    <option value="Kaunas">Kaunas</option>
                    <option value="Klaipėda">Klaipėda</option>
                </select>
            </div>

            {loading ? <p>Kraunama...</p> : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {pets.length > 0 ? (

                        pets.map(pet => <AnimalCardVolunteer key={pet.pet_id} pet={pet} />)
                    ) : (
                        <p>Šiame mieste laisvų augintinių nerasta.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnimalListPage;