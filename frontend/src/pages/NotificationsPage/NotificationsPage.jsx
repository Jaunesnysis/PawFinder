import React, { useState, useEffect } from 'react';
import './NotificationsPage.css';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5050/api/notifications');
            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }
            const data = await response.json();
            setNotifications(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`http://localhost:5050/api/notifications/${notificationId}/read`, {
                method: 'PUT'
            });
            if (response.ok) {
                setNotifications(notifications.map(n => 
                    n.notification_id === notificationId ? { ...n, status: 'read', read_at: new Date() } : n
                ));
            }
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    if (loading) {
        return <div>Kraunasi pranešimai...</div>;
    }

    if (error) {
        return <div>Klaida: {error}</div>;
    }

    return (
        <div className="notifications-page">
            <h1>Pranešimai</h1>
            {notifications.length === 0 ? (
                <p>Nėra naujų pranešimų.</p>
            ) : (
                <div className="notifications-list">
                    {notifications.map(notification => (
                        <div key={notification.notification_id} className={`notification-item ${notification.status}`}>
                            <div className="notification-content">
                                <p>{notification.message}</p>
                                <small>{new Date(notification.created_at).toLocaleString()}</small>
                            </div>
                            {notification.status === 'unread' && (
                                <button onClick={() => markAsRead(notification.notification_id)}>
                                    Pažymėti kaip perskaitytą
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;