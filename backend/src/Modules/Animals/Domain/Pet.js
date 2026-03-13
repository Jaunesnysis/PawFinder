class Pet {
    constructor(pet_id, shelter_id, name, species, breed, age,
                size, weight, activity_level, health_info, status,
                city, shelter_description, ai_description, created_at, updated_at) {
        this.id = pet_id;
        this.shelter_id = shelter_id;
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.age = age;
        this.size = size;
        this.weight = weight;
        this.activity_level = activity_level;
        this.health_info = health_info;
        this.status = status;
        this.city = city;
        this.shelter_description = shelter_description;
        this.ai_description = ai_description;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}