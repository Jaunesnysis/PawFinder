import React from 'react';
import './BadgesGrid.css';

const BadgesGrid = ({ earnedBadges = [] }) => {
    if (earnedBadges.length === 0) {
        return <p style={{ color: '#888' }}>Dar neturite jokių ženklelių. Pradėkite pagalbą gyvūnams!</p>;
    }

    return (
        <div className="badges-container">
            <h3>Mano uždirbti ženkleliai</h3>
            <div className="badges-grid">
                {earnedBadges.map(badge => (
                    <div key={badge.achievement_id} className="badge-item earned">
                        <div className="badge-icon">🏆</div>
                        <span className="badge-title">{badge.title}</span>
                        <small className="badge-desc">{badge.description}</small>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BadgesGrid;