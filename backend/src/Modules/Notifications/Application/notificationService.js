const notificationRepository = require('../Infrastructure/notificationRepository');

const createReservationNotification = async (shelterId, reservationId, petName, date, startTime, endTime) => {
    const message = `Nauja rezervacija: ${petName} pavedžiojimui ${date} nuo ${startTime} iki ${endTime}.`;
    return await notificationRepository.createNotification({
        shelter_id: shelterId,
        reservation_id: reservationId,
        type: 'reservation_created',
        message
    });
};

const createCancellationNotification = async (shelterId, reservationId, petName, date, startTime, endTime) => {
    const message = `Rezervacija atšaukta: ${petName} pavedžiojimas ${date} nuo ${startTime} iki ${endTime} buvo atšauktas.`;
    return await notificationRepository.createNotification({
        shelter_id: shelterId,
        reservation_id: reservationId,
        type: 'reservation_cancelled',
        message
    });
};

const getNotifications = async (userId, shelterId) => {
    return await notificationRepository.getNotificationsByUser(userId, shelterId);
};

const markNotificationAsRead = async (notificationId) => {
    return await notificationRepository.markAsRead(notificationId);
};

module.exports = {
    createReservationNotification,
    createCancellationNotification,
    getNotifications,
    markNotificationAsRead
};