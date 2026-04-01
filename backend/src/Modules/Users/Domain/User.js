class User {
    constructor({ name, surname, email, phone, birthDate, password }) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.phone = phone;
        this.birthDate = birthDate;
        this.password = password;
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
        if (!this.password || !User.validatePassword(this.password)) {
            errors.push('Password must be 8-10 characters, contain at least one uppercase letter and one digit');
        }

        return errors;
    }
}

module.exports = User;