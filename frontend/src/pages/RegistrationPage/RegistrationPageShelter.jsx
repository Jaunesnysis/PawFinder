import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegistrationPageShelter.css';

const RegistrationPageShelter = () => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        phone: '',
        birthDate: '',
        password: '',
        passwordConfirmation: '',
        shelterName: '',
        city: '',
        address: '',
        contacts: '',
        donationAccount: '',
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Vardas yra privalomas';
        if (!formData.surname.trim()) newErrors.surname = 'Pavardė yra privaloma';
        if (!formData.email.trim()) {
            newErrors.email = 'El. paštas yra privalomas';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Neteisingas el. pašto formatas';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Telefonas yra privalomas';
        if (!formData.birthDate.trim()) newErrors.birthDate = 'Gimimo data yra privaloma';

        if (!formData.password) {
            newErrors.password = 'Slaptažodis yra privalomas';
        } else if (formData.password.length < 8 || formData.password.length > 10) {
            newErrors.password = 'Slaptažodis turi būti 8-10 simbolių';
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = 'Turi būti bent viena didžioji raidė';
        } else if (!/\d/.test(formData.password)) {
            newErrors.password = 'Turi būti bent vienas skaitmuo';
        }

        if (formData.password !== formData.passwordConfirmation) {
            newErrors.passwordConfirmation = 'Slaptažodžiai nesutampa';
        }

        if (!formData.shelterName.trim()) newErrors.shelterName = 'Priegladuos pavadinimas yra privalomas';
        if (!formData.city.trim()) newErrors.city = 'Miestas yra privalomas';
        if (!formData.address.trim()) newErrors.address = 'Adresas yra privalomas';
        if (!formData.contacts.trim()) newErrors.contacts = 'Kontaktai yra privalomi';
        if (!formData.description.trim()) newErrors.description = 'Aprašymas yra privalomas';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            // 1. Prieglauda: tik prieglaudos laukai
            const responseShelter = await fetch('http://localhost:5050/api/shelters/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shelterName: formData.shelterName,
                    city: formData.city,
                    address: formData.address,
                    email: formData.email,
                    contacts: formData.contacts,
                    donationAccount: formData.donationAccount.trim() || null,
                    description: formData.description
                })
            });
            const shelterData = await responseShelter.json();

            if (!responseShelter.ok) {
                setErrors({ general: shelterData.error || 'Prieglaudos registracija nepavyko' });
                return;
            }

            // 2. Naudotojas: tik naudotojo laukai + shelterId
            const responseUser = await fetch('http://localhost:5050/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    surname: formData.surname,
                    email: formData.email,
                    phone: formData.phone,
                    birthDate: formData.birthDate,
                    password: formData.password,
                    passwordConfirmation: formData.passwordConfirmation,
                    shelterId: shelterData.shelter_id
                })
            });
            const userData = await responseUser.json();

            if (!responseUser.ok) {
                setErrors({ general: userData.error || 'Naudotojo registracija nepavyko' });
                return;
            }

            setSuccessMessage('Registracija sėkminga! Nukreipiame į prisijungimą...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            console.error(error);
            setErrors({ general: 'Tinklo klaida. Bandykite vėliau.' });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Prieglaudos Registracija</h2>
                <p className="subtitle">Prisijunk prie PawFinder bendruomenės!</p>

                {successMessage && <div className="success-message">{successMessage}</div>}
                {errors.general && <div className="error-message">{errors.general}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-row">
                        <div className="input-group">
                            <label>Vardas</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>
                        <div className="input-group">
                            <label>Pavardė</label>
                            <input type="text" name="surname" value={formData.surname} onChange={handleChange} required />
                            {errors.surname && <span className="error-text">{errors.surname}</span>}
                        </div>
                    </div>

                    <div className="input-group">
                        <label>El. paštas</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label>Telefonas</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>
                        <div className="input-group">
                            <label>Gimimo data</label>
                            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
                            {errors.birthDate && <span className="error-text">{errors.birthDate}</span>}
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Prieglaudos pavadinimas</label>
                        <input type="text" name="shelterName" value={formData.shelterName} onChange={handleChange} required />
                        {errors.shelterName && <span className="error-text">{errors.shelterName}</span>}
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label>Miestas</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                            {errors.city && <span className="error-text">{errors.city}</span>}
                        </div>

                        <div className="input-group">
                            <label>Prieglaudos adresas</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} required />
                            {errors.address && <span className="error-text">{errors.address}</span>}
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Prieglaudos aprašymas</label>
                        <textarea name="description" rows="4" value={formData.description} onChange={handleChange} required />
                        {errors.description && <span className="error-text">{errors.description}</span>}
                    </div>

                    <div className="input-row">

                        <div className="input-group">
                            <label>Kontaktai</label>
                            <input type="text" name="contacts" value={formData.contacts} onChange={handleChange} required />
                            {errors.contacts && <span className="error-text">{errors.contacts}</span>}
                        </div> 

                        <div className="input-group">
                            <label>Paramos sąskaita (neprivaloma)</label>
                            <input type="text" name="donationAccount" value={formData.donationAccount} onChange={handleChange} />
                            {errors.donationAccount && <span className="error-text">{errors.donationAccount}</span>}
                        </div>

                    </div>

                    <div className="input-group">
                        <label>Slaptažodis</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>

                    <div className="input-group">
                        <label>Pakartokite slaptažodį</label>
                        <input type="password" name="passwordConfirmation" value={formData.passwordConfirmation} onChange={handleChange} required />
                        {errors.passwordConfirmation && <span className="error-text">{errors.passwordConfirmation}</span>}
                    </div>

                    <button type="submit" className="register-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Registruojama...' : 'Registruotis'}
                    </button>

                </form>

                <p className="footer-text">
                    Jau turite paskyrą? <Link to="/login" className="link">Prisijungti</Link>
                </p>

                <p className="footer-text">
                    Esate vartotojas? <Link to="/register" className="link">Registruokitės čia</Link>
                </p>
            </div>
        </div>
    );
};

export default RegistrationPageShelter;