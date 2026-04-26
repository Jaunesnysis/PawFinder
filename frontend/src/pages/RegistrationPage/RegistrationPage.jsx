import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegistrationPage.css';

const RegistrationPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        phone: '',
        birthDate: '',
        password: '',
        passwordConfirmation: ''
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
        if (!formData.birthDate) newErrors.birthDate = 'Gimimo data yra privaloma';

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:5050/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Registracija sėkminga! Nukreipiame į prisijungimą...');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setErrors({ general: data.error || 'Registracija nepavyko' });
            }
        } catch (error) {
            console.error(error);
            setErrors({ general: 'Tinklo klaida. Bandykite vėliau.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Registracija</h2>
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
            </div>
        </div>
    );
};

export default RegistrationPage;