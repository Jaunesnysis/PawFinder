const { PetImage } = require('./PetImage');

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
}

module.exports = { Pet };