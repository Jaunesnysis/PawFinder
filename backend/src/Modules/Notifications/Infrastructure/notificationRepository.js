const db = require('../../../Infrastructure/db');

let mockNotifications = [
    // Mock notifications
];

let nextId = 1;

const createNotification = async (notification) => {
    const { shelter_id, reservation_id, type, message } = notification;
    
    try {
        const result = await db.query(
            `INSERT INTO notifications (shelter_id, reservation_id, type, message, status, created_at)
             VALUES ($1, $2, $3, $4, 'unread', CURRENT_TIMESTAMP)
             RETURNING notification_id, shelter_id, reservation_id, type, message, status, created_at, read_at`,
            [shelter_id, reservation_id, type, message]
        );
        
        return result.rows[0];
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

const getNotificationsByUser = async (userId, shelterId) => {
    // Jei shelterId pateiktas, gauti prane\u0161imus iš duomenų bazės
    if (shelterId) {
        try {
            const result = await db.query(
                `SELECT notification_id, shelter_id, reservation_id, type, message, status, created_at, read_at
                 FROM notifications
                 WHERE shelter_id = $1
                 ORDER BY created_at DESC`,
                [shelterId]
            );
            
            return result.rows;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }
    // Priešingu atveju grąžinti tuščią masyvą (nėra prieglaudos)
    return [];
};

const markAsRead = async (notificationId) => {
    try {
        const result = await db.query(
            `UPDATE notifications
             SET status = 'read', read_at = CURRENT_TIMESTAMP
             WHERE notification_id = $1
             RETURNING notification_id, shelter_id, reservation_id, type, message, status, created_at, read_at`,
            [notificationId]
        );
        
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

module.exports = {
    createNotification,
    getNotificationsByUser,
    markAsRead
};