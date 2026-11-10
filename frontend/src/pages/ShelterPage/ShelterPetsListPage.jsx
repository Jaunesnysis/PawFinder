import { useState, useEffect } from 'react';
import {useNavigate} from "react-router-dom";
import AnimalCardShelter from "../../components/AnimalCard/AnimalCardShelter.jsx";
import './ShelterPetsListPage.css';

const ShelterPetsListPage = () => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const filteredPets = pets.filter((pet) =>
        pet.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    const fetchPets = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }
            const response = await fetch(`http://localhost:5050/api/pets/shelter/petList`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Įvyko klaida");
            }

            const data = await response.json();
            setPets(data);
        } catch (error) {
            console.error("Klaida:", error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(()  => { fetchPets( true); },[]);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Mano prieglaudos augintiniai</h1>
            <div className="shelter-toolbar">
                <div className="shelter-search">
                    <label>Vardas</label>
                    <input
                        type="text"
                        placeholder="Ieškoti pagal vardą"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <button className="shelter-add-btn" onClick={() => navigate("/addNewPet")}>
                    Pridėti augintinį
                </button>
            </div>

            {loading ? <p>Kraunama...</p> : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {filteredPets.length > 0 ? (
                        filteredPets.map(pet => <AnimalCardShelter key={pet.pet_id} pet={pet} />)
                    ) : (
                        <p>{search ? "Pagal šį vardą augintinių nerasta." : "Jūs neturite augintinių."}</p>
                    )}
                </div>
            )}
        </div>
    );
};


export default ShelterPetsListPage;