import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PetForm from "../../components/PetForm/PetForm.jsx";

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
            const formData = new FormData();

            Object.entries(values).forEach(([key, value]) => formData.append(key, value ?? ""));
            newImages.forEach((file) => formData.append("images", file));
            formData.append("keepImageIds", JSON.stringify(keepImageIds));
            formData.append("primaryExistingId", primaryExistingId ?? "");
            formData.append("primaryNewIndex", primaryNewIndex ?? "");

            const response = await fetch(`http://localhost:5050/api/pets/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }, // Content-Type nenurodyti
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Nepavyko išsaugoti pakeitimų.");
            }

            navigate("/myShelterPets");
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