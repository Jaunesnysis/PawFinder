import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PetForm from "../../components/PetForm/PetForm.jsx";
const NewPetPage = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async ({ values, newImages, keepImageIds, primaryExistingId, primaryNewIndex }) => {
        setSubmitting(true);
        const token = localStorage.getItem("token");
        const formData = new FormData();
        Object.entries(values).forEach(([k, v]) => formData.append(k, v));
        newImages.forEach((file) => formData.append("images", file));
        formData.append("keepImageIds", JSON.stringify(keepImageIds));
        formData.append("primaryExistingId", primaryExistingId ?? "");
        formData.append("primaryNewIndex", primaryNewIndex ?? "");

        const res = await fetch("http://localhost:5050/api/pets", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },   // Content-Type NErašyti
            body: formData,
        });
        setSubmitting(false);
        if (res.ok) navigate("/myShelterPets");
    };

    return <PetForm mode="create" onSubmit={handleSubmit} submitting={submitting} />;
};
export default NewPetPage;