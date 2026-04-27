import React, { useState } from 'react';
import './BadgesGrid.css';

const BadgesGrid = ({ earnedBadges = [] }) => {
    const [sharingBadge, setSharingBadge] = useState(null);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success', duration = 3000) => {
        setNotification({ message, type });
        if (duration > 0) {
            setTimeout(() => setNotification(null), duration);
        }
    };

    const handleShare = async (badge, platform) => {
        const text = `🎉 Pasiekiau "${badge.title}" ženklelį PawFinder programoje!\n\n${badge.description}`;
        const url = window.location.origin + '/achievements';

        try {
            let shareUrl = '';
            let platformName = '';
            
            if (platform === 'facebook') {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
                platformName = 'Facebook';
            } else if (platform === 'twitter') {
                const tweetText = `${text}\n\nPadėk gyvūnams su PawFinder! 🐾`;
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}&hashtags=PawFinder,Pasiekimai`;
                platformName = 'Twitter';
            } else if (platform === 'whatsapp') {
                const waText = `${text}\n\n${url}`;
                shareUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;
                platformName = 'WhatsApp';
            }

            if (!shareUrl) {
                showNotification('❌ Platforma nepalaikoma', 'error');
                return;
            }

            const shareWindow = window.open(shareUrl, '_blank', 'width=600,height=400');
            
            if (!shareWindow) {
                showNotification('❌ Nepavyko atidaryti dalinimosi dialogo. Patikrinkite pop-up blokatorių.', 'error', 4000);
            } else {
                // Stebime ar langas liko atidarytas
                const checkInterval = setInterval(() => {
                    try {
                        if (shareWindow.closed) {
                            clearInterval(checkInterval);
                            // Langas uždarytas - rodome success pranešimą
                            showNotification(`✅ Pasiekimas sėkmingai pasidalintas ${platformName}!`, 'success', 3000);
                        }
                    } catch (e) {
                        // Ignoruojame errors (cross-origin restrictions)
                    }
                }, 500);

                // Sustabdome stebėjimą po 15 sekundžių
                setTimeout(() => clearInterval(checkInterval), 15000);
            }
        } catch (error) {
            showNotification(`❌ Dalinimosi klaida: ${error.message}`, 'error', 4000);
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
            {/* Notifikacijos */}
            {notification && (
                <div className={`notification notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}

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
                                <button onClick={() => handleShare(badge, 'facebook')} title="Dalintis Facebook">
                                    f
                                </button>
                                <button onClick={() => handleShare(badge, 'twitter')} title="Dalintis Twitter">
                                    𝕏
                                </button>
                                <button onClick={() => handleShare(badge, 'whatsapp')} title="Dalintis WhatsApp">
                                    💬
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BadgesGrid;