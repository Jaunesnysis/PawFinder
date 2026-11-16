const notificationRepository = require("../Infrastructure/notificationRepository");

// "13:00:00" -> "13:00"
const formatTime = (time) =>
  typeof time === "string" && /^\d{2}:\d{2}:\d{2}$/.test(time) ? time.slice(0, 5) : time;

const describeWalk = (petName, date, startTime, endTime) =>
  `${petName} pavedžiojimas ${date} nuo ${formatTime(startTime)} iki ${formatTime(endTime)}`;

// Pranešimas visiems prieglaudos darbuotojams (users.shelter_id = shelterId)
const notifyShelter = async (shelterId, notification) => {
  const recipients = await notificationRepository.getShelterUserIds(shelterId);
  if (recipients.length === 0) {
    console.warn(`Prieglauda ${shelterId} neturi vartotojų – pranešimas nesiųstas.`);
    return [];
  }
  return notificationRepository.createNotifications(recipients, notification);
};

/**
 * Savanoris užsirezervavo pasivaikščiojimą -> pranešama prieglaudai
 */
const createReservationNotification = async (
  shelterId, reservationId, petName, date, startTime, endTime,
) => {
  const message = `Nauja rezervacija: ${petName} pavedžiojimui ${date} nuo ${formatTime(startTime)} iki ${formatTime(endTime)}.`;
  return notifyShelter(shelterId, {
    reservation_id: reservationId,
    type: "reservation_created",
    message,
  });
};

/**
 * Savanoris atšaukė rezervaciją -> pranešama prieglaudai
 */
const createCancellationNotification = async (
  shelterId, reservationId, petName, date, startTime, endTime,
) => {
  const message = `Rezervacija atšaukta: ${describeWalk(petName, date, startTime, endTime)} buvo atšauktas.`;
  return notifyShelter(shelterId, {
    reservation_id: reservationId,
    type: "reservation_cancelled",
    message,
  });
};

/**
 * Prieglauda atšaukė savanorio rezervaciją -> pranešama savanoriui
 */
const createShelterCancellationNotification = async (
  userId, reservationId, petName, date, startTime, endTime,
) => {
  const message = `Prieglauda atšaukė jūsų rezervaciją: ${describeWalk(petName, date, startTime, endTime)} neįvyks.`;
  return notificationRepository.createNotifications([userId], {
    reservation_id: reservationId,
    type: "reservation_cancelled_by_shelter",
    message,
  });
};

const getNotifications = async (userId) => {
  return notificationRepository.getNotificationsByUser(userId);
};

const markNotificationAsRead = async (notificationId, userId) => {
  return notificationRepository.markAsRead(notificationId, userId);
};

module.exports = {
  createReservationNotification,
  createCancellationNotification,
  createShelterCancellationNotification,
  getNotifications,
  markNotificationAsRead,
};
