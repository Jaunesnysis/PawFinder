class PetImage {
    constructor(image_id, url, is_primary) {
        this.image_id = image_id;
        this.url = url;
        this.is_primary = is_primary || false;
    }
}

module.exports = { PetImage };