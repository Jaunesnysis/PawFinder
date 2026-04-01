class User {
    constructor(
        user_id,
        name,
        surname,
        email,
        phone,
        birth_date,
        password_hash,
        role,
        city,
        points,
        last_earned_at,
        created_at,
        consent_given_at
    ) {
        this.id = user_id;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.phone = phone;
        this.birth_date = birth_date;
        this.password_hash = password_hash;
        this.role = role || 'volunteer'; // Numatytasis vaidmuo
        this.city = city;
        this.points = points || 0;
        this.last_earned_at = last_earned_at;
        this.created_at = created_at;
        this.consent_given_at = consent_given_at;
    }

    /**
     * Pavyzdinis metodas: grąžina pilną vartotojo vardą
     */
    getFullName() {
        return `${this.name} ${this.surname}`;
    }

    /**
     * Pavyzdinis metodas: patikrina ar vartotojas yra administratorius
     */
    isAdmin() {
        return this.role === 'admin';
    }
}

module.exports = { User };