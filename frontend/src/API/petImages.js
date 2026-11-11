const API_URL = "http://localhost:5050";

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const check = async (res, fallback) => {
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || fallback);
    }
};

export const uploadImages = async (petId, files, primaryIndex) => {
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    if (primaryIndex !== null && primaryIndex !== undefined) {
        formData.append("primaryIndex", primaryIndex);
    }
    // Content-Type NENURODOME: naršyklė pati prideda multipart ribą
    const res = await fetch(`${API_URL}/api/pets/${petId}/images`, {
        method: "POST",
        headers: authHeader(),
        body: formData,
    });
    await check(res, "Nepavyko įkelti nuotraukų.");
};

export const deleteImage = async (petId, imageId) => {
    const res = await fetch(`${API_URL}/api/pets/${petId}/images/${imageId}`, {
        method: "DELETE",
        headers: authHeader(),
    });
    await check(res, "Nepavyko ištrinti nuotraukos.");
};

export const setPrimaryImage = async (petId, imageId) => {
    const res = await fetch(`${API_URL}/api/pets/${petId}/images/${imageId}/primary`, {
        method: "PUT",
        headers: authHeader(),
    });
    await check(res, "Nepavyko pakeisti pagrindinės nuotraukos.");
};