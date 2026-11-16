const db = require("../../../Infrastructure/db");

const NOTIFICATION_COLUMNS = `
    notification_id, user_id, reservation_id, type, message,
    status, created_at, read_at
`;

/**
 * Sukuria po vieną pranešimą kiekvienam gavėjui (users.user_id)
 */
const createNotifications = async (userIds, { reservation_id, type, message }) => {
  if (!Array.isArray(userIds) || userIds.length === 0) return [];

  const query = `
    INSERT INTO notifications (user_id, reservation_id, type, message, status, created_at)
    SELECT recipient_id, $2, $3, $4, 'unread', CURRENT_TIMESTAMP
    FROM unnest($1::bigint[]) AS recipient_id
    RETURNING ${NOTIFICATION_COLUMNS}
  `;

  try {
    const result = await db.query(query, [userIds, reservation_id, type, message]);
    return result.rows;
  } catch (error) {
    throw new Error(`[notificationRepository.createNotifications] ${error.message}`);
  }
};

/**
 * Prieglaudos darbuotojai – vartotojai, kurių users.shelter_id sutampa
 */
const getShelterUserIds = async (shelterId) => {
  const query = `
    SELECT user_id
    FROM users
    WHERE shelter_id = $1
    ORDER BY user_id
  `;

  try {
    const result = await db.query(query, [shelterId]);
    return result.rows.map((row) => row.user_id);
  } catch (error) {
    throw new Error(`[notificationRepository.getShelterUserIds] ${error.message}`);
  }
};

const getNotificationsByUser = async (userId) => {
  const query = `
    SELECT ${NOTIFICATION_COLUMNS}
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC, notification_id DESC
  `;

  try {
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (error) {
    throw new Error(`[notificationRepository.getNotificationsByUser] ${error.message}`);
  }
};

/**
 * Pažymi kaip perskaitytą tik jei pranešimas priklauso šiam vartotojui
 */
const markAsRead = async (notificationId, userId) => {
  const query = `
    UPDATE notifications
    SET status = 'read',
        read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
    WHERE notification_id = $1 AND user_id = $2
    RETURNING ${NOTIFICATION_COLUMNS}
  `;

  try {
    const result = await db.query(query, [notificationId, userId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`[notificationRepository.markAsRead] ${error.message}`);
  }
};

module.exports = {
  createNotifications,
  getShelterUserIds,
  getNotificationsByUser,
  markAsRead,
};
