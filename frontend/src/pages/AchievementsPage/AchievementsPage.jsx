import React, { useState, useEffect } from 'react';
import PointsCard from '../../components/Achievements/PointsCard';
import BadgesGrid from '../../components/Achievements/BadgesGrid';
import ProgressInfo from '../../components/Achievements/ProgressInfo';

const AchievementsPage = () => {
    const [data, setData] = useState(null);
    const userId = 1; // Laikinai naudojame tavo ID: 1

    useEffect(() => {
        fetch(`http://localhost:5050/api/achievements/progress?userId=${userId}`)
            .then(res => res.json())
            .then(json => setData(json))
            .catch(err => console.error("Klaida:", err));
    }, []);

    if (!data) return <div>Kraunama...</div>;

    return (
        <div className="achievements-page">
            <h1>Sveiki, DeivM!</h1>

            {/* AC1 */}
            <PointsCard points={data.total_points} />

            {/* AC4 - ČIA BUVO KLAIDA: reikia pridėti totalPoints prop'są */}
            <ProgressInfo
                totalPoints={data.total_points}
                nextGoal={data.next_achievement}
            />

            {/* Uždirbti ženkleliai */}
            <BadgesGrid earnedBadges={data.earned_badges} />
        </div>
    );
};

export default AchievementsPage;