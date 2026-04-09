import React, { useState, useEffect } from 'react';
import PointsCard from '../../components/Achievements/PointsCard';
import BadgesGrid from '../../components/Achievements/BadgesGrid';
import ProgressInfo from '../../components/Achievements/ProgressInfo';
import {useNavigate} from "react-router-dom";

const AchievementsPage = () => {
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }
        fetch(`http://localhost:5050/api/achievements/progress`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    throw new Error("Sesija pasibaigė");
                }
                return res.json();
            })
            .then(json => setData(json))
            .catch(err => console.error("Klaida:", err));
    }, [navigate]);

    if (!data) return <div>Kraunama...</div>;

    // --- NAUJAS PATIKRINIMAS KLAIDOMS (TC5 ir TC6 dalis) ---
    if (data.error) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#fff0f0',
                borderRadius: '12px',
                border: '1px solid #ffc1c1',
                margin: '20px'
            }}>
                <h2 style={{ color: '#d32f2f' }}>⚠️ Prieiga apribota</h2>
                <p style={{ fontSize: '1.1rem' }}>{data.error}</p>
                <p style={{ color: '#666' }}>Prašome prisijungti arba kreiptis į administraciją.</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '10px' }}
                >
                    Bandyti dar kartą
                </button>
            </div>
        );
    }

    // Jei klaidos nėra, rodomas normalus puslapis
    return (
        <div className="achievements-page">
            <h1>Sveiki, DeivM!</h1>

            <PointsCard points={data.total_points} />

            <ProgressInfo
                totalPoints={data.total_points}
                nextGoal={data.next_achievement}
            />

            <BadgesGrid earnedBadges={data.earned_badges} />
        </div>
    );
};

export default AchievementsPage;