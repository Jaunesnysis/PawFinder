class User {
    constructor(data = {}) {
        this.id = data.user_id ?? data.id;
        this.name = data.name;
        this.surname = data.surname;
        this.email = data.email;
        this.phone = data.phone;
        this.birthDate = data.birthDate ?? data.birth_date;
        this.birth_date = data.birth_date ?? data.birthDate;
        this.password = data.password;
        this.password_hash = data.password_hash;
        this.role = data.role || 'volunteer';
        this.city = data.city;
        this.points = data.points || 0;
        this.last_earned_at = data.last_earned_at;
        this.created_at = data.created_at;
        this.consent_given_at = data.consent_given_at;
    }

    getFullName() {
        return `${this.name} ${this.surname}`;
    }

    isAdmin() {
        return this.role === 'admin';
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        if (password.length < 8 || password.length > 10) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (!/\d/.test(password)) return false;
        return true;
    }

    validate() {
        const errors = [];

        if (!this.name || this.name.trim().length === 0) errors.push('Name is required');
        if (!this.surname || this.surname.trim().length === 0) errors.push('Surname is required');
        if (!this.email || !User.validateEmail(this.email)) errors.push('Invalid email format');
        if (!this.phone || this.phone.trim().length === 0) errors.push('Phone is required');
        if (!this.birthDate) errors.push('Birth date is required');

        if (this.password !== undefined && this.password !== null) {
            if (!User.validatePassword(this.password)) {
                errors.push('Password must be 8-10 characters, contain at least one uppercase letter and one digit');
            }
        }

        return errors;
    }
}

module.exports = User;