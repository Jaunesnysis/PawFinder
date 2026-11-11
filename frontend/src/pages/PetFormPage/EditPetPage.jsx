import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PetForm from "../../components/PetForm/PetForm.jsx";
import { uploadImages, deleteImage, setPrimaryImage } from "../../api/petImages";

const EditPetPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pet, setPet] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadPet = async () => {
            try {
                const response = await fetch(`http://localhost:5050/api/pets/${id}`);
                if (!response.ok) throw new Error("Nepavyko užkrauti gyvūno.");
                setPet(await response.json());
            } catch (err) {
                setError(err.message);
            }
        };
        loadPet();
    }, [id]);

    const handleSubmit = async ({ values, newImages, keepImageIds, primaryExistingId, primaryNewIndex }) => {
        setSubmitting(true);
        setError("");
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`http://localhost:5050/api/pets/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Nepavyko išsaugoti pakeitimų.");
            }
            // 2) ištrinam nuotraukas, kurias vartotojas pašalino
            const removedIds = (pet.images ?? [])
                .map((img) => img.image_id)
                .filter((imageId) => !keepImageIds.includes(imageId));
            for (const imageId of removedIds) {
                await deleteImage(id, imageId);
            }

            // 3) įkeliame naujas (jei pagrindinė yra viena iš jų, serveris ją ir nustato)
            await uploadImages(id, newImages, primaryNewIndex);

            // 4) jei pagrindinė yra viena iš senų ir ji pasikeitė
            const currentPrimaryId = (pet.images ?? []).find((img) => img.is_primary)?.image_id;
            if (primaryExistingId !== null && primaryExistingId !== currentPrimaryId) {
                await setPrimaryImage(id, primaryExistingId);
            }

            navigate("/mySheltersPets");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (error && !pet) return <p>{error}</p>;
    if (!pet) return <p>Kraunama...</p>;

    return (
        <div>
            {error && <p className="field-error">{error}</p>}
            <PetForm
                mode="edit"
                initialValues={pet}
                onSubmit={handleSubmit}
                submitting={submitting}
            />
        </div>
    );
};

export default EditPetPage;