import React, { useState } from 'react';
import './BadgesGrid.css';

const BadgesGrid = ({ earnedBadges = [] }) => {
    const [sharingBadge, setSharingBadge] = useState(null);

    const handleShare = async (badge, platform) => {
        const text = `I earned the "${badge.title}" achievement on PawFinder! ${badge.description}`;
        const url = window.location.origin + '/achievements';

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'PawFinder Achievement',
                    text: text,
                    url: url,
                });
                alert('Achievement shared successfully!');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    alert('Failed to share. Please try again.');
                }
            }
        } else {
            // Fallback to platform specific
            let shareUrl = '';
            if (platform === 'facebook') {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
            } else if (platform === 'twitter') {
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
            }

            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
                alert('Achievement shared successfully!');
            } else {
                alert('Failed to share. Please try again.');
            }
        }
        setSharingBadge(null);
    };

    const toggleShareOptions = (badgeId) => {
        setSharingBadge(sharingBadge === badgeId ? null : badgeId);
    };

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
                        <button className="share-btn" onClick={() => toggleShareOptions(badge.achievement_id)}>Dalintis</button>
                        {sharingBadge === badge.achievement_id && (
                            <div className="share-options">
                                <button onClick={() => handleShare(badge, 'facebook')}>Facebook</button>
                                <button onClick={() => handleShare(badge, 'twitter')}>Twitter</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BadgesGrid;