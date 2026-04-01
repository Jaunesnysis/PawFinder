import { useState } from 'react';

function RegistrationPage() {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.birthDate) newErrors.birthDate = 'Birth date is required';
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8 || formData.password.length > 10) {
            newErrors.password = 'Password must be 8-10 characters';
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/\d/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one digit';
        }
        if (formData.password !== formData.passwordConfirmation) {
            newErrors.passwordConfirmation = 'Password confirmation does not match';
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
                setSuccessMessage('Registration successful!');
                setFormData({
                    name: '',
                    surname: '',
                    email: '',
                    phone: '',
                    birthDate: '',
                    password: '',
                    passwordConfirmation: ''
                });
            } else {
                if (response.status === 409) {
                    setErrors({ email: 'Email already exists' });
                } else {
                    setErrors({ general: data.error || 'Registration failed' });
                }
            }
        } catch (error) {
            setErrors({ general: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2>User Registration</h2>
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            {errors.general && <p style={{ color: 'red' }}>{errors.general}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                    {errors.name && <p style={{ color: 'red', fontSize: '14px' }}>{errors.name}</p>}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Surname:</label>
                    <input
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                    {errors.surname && <p style={{ color: 'red', fontSize: '14px' }}>{errors.surname}</p>}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                    {errors.email && <p style={{ color: 'red', fontSize: '14px' }}>{errors.email}</p>}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Phone:</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                    {errors.phone && <p style={{ color: 'red', fontSize: '14px' }}>{errors.phone}</p>}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Birth Date:</label>
                    <input
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                    {errors.birthDate && <p style={{ color: 'red', fontSize: '14px' }}>{errors.birthDate}</p>}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                    {errors.password && <p style={{ color: 'red', fontSize: '14px' }}>{errors.password}</p>}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        name="passwordConfirmation"
                        value={formData.passwordConfirmation}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                    {errors.passwordConfirmation && <p style={{ color: 'red', fontSize: '14px' }}>{errors.passwordConfirmation}</p>}
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ width: '100%', padding: '10px', background: '#4CAF50', color: 'white', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                    {isSubmitting ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
}

export default RegistrationPage;