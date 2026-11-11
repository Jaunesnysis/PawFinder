const { PetImage } = require('./PetImage');

const SPECIES  = ['Šuo', 'Katė'];
const SIZES    = ['small', 'medium', 'large'];
const ACTIVITY = ['low', 'moderate', 'high'];
const STATUSES = ['available', 'reserved', 'adopted'];

const emptyToNull = (v) => {
    const s = String(v ?? '').trim();
    return s === '' ? null : s;
};

class Pet {
    constructor(data = {}) {
        this.id = data.pet_id || data.id;
        this.shelter_id = data.shelter_id;
        this.name = data.name;
        this.species = data.species;
        this.breed = data.breed;
        this.age = data.age;
        this.size = data.size;
        this.weight = data.weight;
        this.activity_level = data.activity_level;
        this.health_info = data.health_info;
        this.status = data.status;
        this.city = data.city;
        this.shelter_description = data.shelter_description;
        this.ai_description = data.ai_description;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;

        this.images = (data.images || []).map(img =>
            new PetImage(img.image_id, img.image_url || img.url, img.is_primary)
        );
    }

    getPrimaryImageUrl() {
        const primary = this.images.find(img => img.is_primary);
        return primary ? primary.url : 'default-pet-image.png';
    }

    static fromInput(raw = {}, isEdit = false) {
        return new Pet({
            name: emptyToNull(raw.name),
            species: raw.species,
            breed: emptyToNull(raw.breed),
            age: emptyToNull(raw.age) === null ? null : Number(raw.age),
            size: emptyToNull(raw.size),
            weight: emptyToNull(raw.weight) === null ? null : Number(raw.weight),
            activity_level: emptyToNull(raw.activity_level),
            health_info: emptyToNull(raw.health_info),
            shelter_description: emptyToNull(raw.shelter_description),
            status: isEdit ? raw.status : 'available',
        });
    }

    validate() {
        const errors = [];

        if (!this.name || this.name.length > 100) errors.push('Vardas privalomas (iki 100 simbolių)');
        if (!SPECIES.includes(this.species)) errors.push('Neteisinga rūšis');
        if (!Number.isInteger(this.age) || this.age < 0) errors.push('Amžius turi būti sveikas neneigiamas skaičius');
        if (this.weight !== null && !(this.weight > 0)) errors.push('Svoris turi būti didesnis už 0');
        if (this.size && !SIZES.includes(this.size)) errors.push('Neteisingas dydis');
        if (this.activity_level && !ACTIVITY.includes(this.activity_level)) errors.push('Neteisingas aktyvumo lygis');
        if (this.shelter_description && this.shelter_description.length > 3000) errors.push('Aprašymas per ilgas (maks. 3000)');
        if (this.health_info && this.health_info.length > 1000) errors.push('Sveikatos informacija per ilga (maks. 1000)');
        if (!STATUSES.includes(this.status)) errors.push('Neteisingas statusas');

        return errors;
    }
}

module.exports = { Pet };