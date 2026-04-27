import React, { useState, useEffect } from 'react';
import PointsCard from '../../components/Achievements/PointsCard';
import BadgesGrid from '../../components/Achievements/BadgesGrid';
import ProgressInfo from '../../components/Achievements/ProgressInfo';
import {useNavigate} from "react-router-dom";

const AchievementsPage = () => {
    const [data, setData] = useState(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

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
                    return;
                }
                return res.json();
            })
            .then(json => setData(json))
            .catch(err => console.error("Klaida:", err));
    }, [navigate]);

    if (!data) return <div>Kraunama...</div>;

    if (data.error) {
        return (
            <div className="error-container">
                <h2>⚠️ Prieiga apribota</h2>
                <p className="error-message-text">{data.error}</p>
                <p className="error-hint">Prašome prisijungti arba kreiptis į administraciją.</p>
                <button className="retry-btn" onClick={() => window.location.reload()}>
                    Bandyti dar kartą
                </button>
            </div>
        );
    }

    return (
        <div className="achievements-page">
            <h1>Sveiki, {user.name}</h1>
            <PointsCard points={data.total_points} />
            <ProgressInfo
                totalPoints={data.total_points}
                nextGoal={data.next_achievement}
                userName={user.name}
            />
            <BadgesGrid earnedBadges={data.earned_badges} />
        </div>
    );
};

export default AchievementsPage;