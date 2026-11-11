import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PetForm from "../../components/PetForm/PetForm.jsx";
import { uploadImages } from "../../api/petImages";

const NewPetPage = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async ({ values, newImages, primaryNewIndex }) => {
        const token = localStorage.getItem("token");
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:5050/api/pets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(values),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Nepavyko išsaugoti.");
            }
            const created = await res.json();

            // 2) įkeliame nuotraukas (jei yra)
            try {
                await uploadImages(created.id, newImages, primaryNewIndex);
            } catch (imgErr) {
                // gyvūnas jau sukurtas, todėl vedame į redagavimą, kad nepasikartotų
                console.log(imgErr)
                navigate(`/editPet/${created.id}`);
                return;
            }
            navigate("/mySheltersPets");
        } catch (e) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {error && <p className="field-error">{error}</p>}
            <PetForm mode="create" onSubmit={handleSubmit} submitting={submitting} />
        </>
    );
};

export default NewPetPage;