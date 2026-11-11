import { useState } from "react";
import "./PetForm.css"
import { Link } from "react-router-dom";

const emptyPet = {
    name: "", species: "", breed: "", age: "", size: "", weight: "",
    activity_level: "", health_info: "", shelter_description: "",
    status: "available",
};

const PetForm = ({ initialValues, mode, onSubmit, submitting }) => {
    const pickFormValues = (pet) =>
        Object.fromEntries(
            Object.keys(emptyPet).map((key) => [key, pet?.[key] ?? emptyPet[key]])
        );

    const [values, setValues] = useState(() => pickFormValues(initialValues));
    const [errors, setErrors] = useState({});

    const isEdit = mode === "edit";

    const [images, setImages] = useState(() => {
        const list = (initialValues?.images ?? []).map((img) => ({
            key: `e-${img.image_id}`,
            id: img.image_id,
            url: img.url,
            isPrimary: img.is_primary,
        }));
        if (list.length > 0 && !list.some((i) => i.isPrimary)) list[0].isPrimary = true;
        return list;
    });

    const handleFiles = (e) => {
        const files = Array.from(e.target.files);
        const allowed = ["image/jpeg", "image/png"];
        const invalid = files.find((f) => !allowed.includes(f.type));
        if (invalid) {
            setErrors((prev) => ({ ...prev, images: "Leidžiami tik JPG arba PNG failai." }));
            return;
        }
        setErrors((prev) => ({ ...prev, images: undefined }));

        setImages((prev) => {
            const added = files.map((file) => ({
                key: `n-${crypto.randomUUID()}`,
                file,
                url: URL.createObjectURL(file),
                isPrimary: false,
            }));
            const next = [...prev, ...added];
            if (!next.some((i) => i.isPrimary) && next.length > 0) next[0].isPrimary = true;
            return next;
        });
        e.target.value = "";   // leidžia pasirinkti tą patį failą dar kartą
    };

    const makePrimary = (key) =>
        setImages((prev) => prev.map((i) => ({ ...i, isPrimary: i.key === key })));

    const removeImage = (key) =>
        setImages((prev) => {
            const next = prev.filter((i) => i.key !== key);
            if (next.length > 0 && !next.some((i) => i.isPrimary)) next[0].isPrimary = true;
            return next;
        });



    const handleChange = (e) =>
        setValues({ ...values, [e.target.name]: e.target.value });

    const validate = () => {
        const e = {};
        if (!values.name.trim()) e.name = "Įveskite vardą.";
        if (!values.species) e.species = "Pasirinkite rūšį.";
        if (values.age === "" || Number(values.age) < 0) e.age = "Įveskite amžių.";
        //if (images.length === 0) e.images = "Pridėkite bent vieną nuotrauką.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        const newFiles = images.filter((i) => i.file);
        const existing = images.filter((i) => i.id);
        const primaryImage = images.find((i) => i.isPrimary);

        onSubmit({
            values,
            newImages: newFiles.map((i) => i.file),
            keepImageIds: existing.map((i) => i.id),
            primaryExistingId: primaryImage?.id ?? null,
            primaryNewIndex: primaryImage?.file ? newFiles.indexOf(primaryImage) : null,
        });
    };

    return (
        <form className="pet-form" onSubmit={handleSubmit}>
            <Link to="/mySheltersPets" className="pet-form-back">
                ← Atgal į mano augintinius
            </Link>
            <div className="pet-form-grid">
                <label>Vardas
                    <input name="name" value={values.name} onChange={handleChange} />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                </label>

                <label>Rūšis
                    <select name="species" value={values.species} onChange={handleChange}>
                        <option value="">Pasirinkite</option>
                        <option value="dog">Šuo</option>
                        <option value="cat">Katė</option>
                    </select>
                    {errors.species && <span className="field-error">{errors.species}</span>}
                </label>

                <label>Amžius (m.)
                    <input type="number" min="0" name="age" value={values.age} onChange={handleChange} />
                    {errors.age && <span className="field-error">{errors.age}</span>}
                </label>

                <label>Veislė
                    <input name="breed" value={values.breed} onChange={handleChange} />
                </label>

                <label>Dydis
                    <select name="size" value={values.size} onChange={handleChange}>
                        <option value="">Pasirinkite</option>
                        <option value="small">Mažas</option>
                        <option value="medium">Vidutinis</option>
                        <option value="large">Didelis</option>
                    </select>
                </label>

                <label>Svoris (kg)
                    <input type="number" step="0.1" min="0" name="weight" value={values.weight} onChange={handleChange} />
                    {errors.weight && <span className="field-error">{errors.weight}</span>}
                </label>

                <label>Aktyvumo lygis
                    <select name="activity_level" value={values.activity_level} onChange={handleChange}>
                        <option value="">Pasirinkite</option>
                        <option value="low">Žemas</option>
                        <option value="moderate">Vidutinis</option>
                        <option value="high">Aukštas</option>
                    </select>
                </label>

                <label>Sveikatos informacija
                    <textarea name="health_info" rows="3" className="no-resize"
                              value={values.health_info} onChange={handleChange} />
                </label>

                {isEdit && (
                    <label>Statusas
                        <select name="status" value={values.status} onChange={handleChange}>
                            <option value="available">Laisvas</option>
                            <option value="reserved">Rezervuotas</option>
                            <option value="adopted">Priglaustas</option>
                        </select>
                    </label>
                )}
            </div>


            <label>Laisvas aprašas
                <textarea name="shelter_description" rows="4" value={values.shelter_description} onChange={handleChange} />
            </label>

            {/* Nuotraukų valdymas: žr. 3 punktą */}
            <div className="pet-images">
                <span className="pet-images-title">Nuotraukos (JPG/PNG)</span>

                <div className="pet-images-list">
                    {images.map((img) => (
                        <div key={img.key} className="pet-image-item">
                            <img src={img.url} alt="" />
                            {img.isPrimary && <span className="pet-image-badge">★ Pagrindinė</span>}
                            <button type="button" className="pet-image-remove" onClick={() => removeImage(img.key)}>✕</button>
                            {!img.isPrimary && (
                                <button type="button" className="pet-image-primary" onClick={() => makePrimary(img.key)}>
                                    Padaryti pagrindine
                                </button>
                            )}
                        </div>
                    ))}

                    <label className="pet-image-upload">
                        + Įkelti nuotrauką
                        <input type="file" accept="image/jpeg,image/png" multiple onChange={handleFiles} hidden />
                    </label>
                </div>

                {errors.images && <span className="field-error">{errors.images}</span>}
            </div>

            <button type="submit" className="pet-form-submit" disabled={submitting}>
                {isEdit ? "Išsaugoti" : "Sukurti"}
            </button>
        </form>
    );
};

export default PetForm;