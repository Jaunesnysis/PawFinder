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

    const handleSubmit = async ({ values }) => {
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