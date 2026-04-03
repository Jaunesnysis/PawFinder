const db = require("../../../Infrastructure/db");

const createNotification = async (notification) => {
    const { shelter_id, reservation_id, type, message } = notification;

    const result = await db.query(
        `INSERT INTO notifications (shelter_id, reservation_id, type, message, status, created_at)
         VALUES ($1, $2, $3, $4, 'unread', CURRENT_TIMESTAMP)
         RETURNING *`,
        [shelter_id, reservation_id, type, message]
    );

    return result.rows[0];
};

const getNotificationsByShelter = async (shelterId) => {
    const result = await db.query(
        "SELECT * FROM notifications WHERE shelter_id = $1 ORDER BY created_at DESC",
        [shelterId]
    );

    return result.rows;
};

const markAsRead = async (notificationId) => {
    const result = await db.query(
        `UPDATE notifications 
         SET status = 'read', read_at = CURRENT_TIMESTAMP 
         WHERE notification_id = $1 
         RETURNING *`,
        [notificationId]
    );

    return result.rows[0] || null;
};

module.exports = {
    createNotification,
    getNotificationsByShelter,
    markAsRead
};