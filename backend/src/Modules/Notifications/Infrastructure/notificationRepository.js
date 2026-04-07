let mockNotifications = [
    // Mock notifications
];

let nextId = 1;

const createNotification = async (notification) => {
    const newNotification = {
        notification_id: nextId++,
        ...notification,
        status: 'unread',
        created_at: new Date(),
        read_at: null
    };
    mockNotifications.push(newNotification);
    return newNotification;
};

const getNotificationsByUser = async (userId) => {
    return mockNotifications.filter(n => n.shelter_id === userId);
};

const markAsRead = async (notificationId) => {
    const notification = mockNotifications.find(n => n.notification_id === notificationId);
    if (notification) {
        notification.status = 'read';
        notification.read_at = new Date();
    }
    return notification;
};

module.exports = {
    createNotification,
    getNotificationsByUser,
    markAsRead
};