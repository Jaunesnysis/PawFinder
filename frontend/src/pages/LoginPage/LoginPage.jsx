import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Jei tokenas yra, vadinasi vartotojas jau prisijungęs - siunčiame jį toliau
            navigate('/HomePage');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Neleidžiame puslapiui persikrauti
        setError('');

        try {
            const response = await fetch('http://localhost:5050/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Nepavyko prisijungti');
            }

            // --- SĖKMĖ: Išsaugome tokeną ir vartotojo info ---
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            navigate('/HomePage');

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Prisijungimas</h2>
                <p className="subtitle">Sveiki sugrįžę į PawFinder!</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>El. paštas</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="pavyzdys@gmail.com"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Slaptažodis</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn">Prisijungti</button>
                </form>

                <p className="footer-text">
                    Neturite paskyros? <Link to="/register" className="link">Registruotis</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;