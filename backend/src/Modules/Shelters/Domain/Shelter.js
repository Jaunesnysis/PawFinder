class Shelter {
    constructor(data = {}) {
        this.id = data.shelter_id ?? data.id;
        this.name = data.shelterName ?? data.name;
        this.description = data.description;
        this.city = data.city;
        this.address = data.address;
        this.email = data.email;
        this.phone = data.contacts ?? data.phone;
        this.donation_account = data.donation_account ?? data.donationAccount ?? null;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    validate() {
        const errors = [];

        if (!this.name || this.name.trim().length === 0) errors.push('Shelter name is required');
        if (!this.city || this.city.trim().length === 0) errors.push('City is required');
        if (!this.address || this.address.trim().length === 0) errors.push('Address is required');
        if (!this.phone || this.phone.trim().length === 0) errors.push('Contacts are required');
        if (!this.description || this.description.trim().length === 0) errors.push('Description is required');

        // donation_account neprivalomas, netikriname

        return errors;
    }
}

module.exports = { Shelter };