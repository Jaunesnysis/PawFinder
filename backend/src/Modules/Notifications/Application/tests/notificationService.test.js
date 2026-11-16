const notificationService = require("../notificationService");

jest.mock("../../Infrastructure/notificationRepository", () => ({
  createNotifications: jest.fn(),
  getShelterUserIds: jest.fn(),
  getNotificationsByUser: jest.fn(),
  markAsRead: jest.fn(),
}));

const notificationRepository = require("../../Infrastructure/notificationRepository");

describe("NotificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  describe("createReservationNotification (savanoris rezervavo -> prieglauda)", () => {
    test("sends one notification to every user of the pet's shelter", async () => {
      notificationRepository.getShelterUserIds.mockResolvedValue(["5", "6"]);
      notificationRepository.createNotifications.mockResolvedValue([
        { notification_id: "1", user_id: "5" },
        { notification_id: "2", user_id: "6" },
      ]);

      const result = await notificationService.createReservationNotification(
        101, 1, "Pukis", "2024-03-20", "10:00:00", "11:00:00",
      );

      expect(notificationRepository.getShelterUserIds).toHaveBeenCalledWith(101);
      expect(notificationRepository.createNotifications).toHaveBeenCalledWith(["5", "6"], {
        reservation_id: 1,
        type: "reservation_created",
        message: "Nauja rezervacija: Pukis pavedžiojimui 2024-03-20 nuo 10:00 iki 11:00.",
      });
      expect(result).toHaveLength(2);
    });

    test("does not insert anything when the shelter has no users", async () => {
      notificationRepository.getShelterUserIds.mockResolvedValue([]);

      const result = await notificationService.createReservationNotification(
        101, 1, "Pukis", "2024-03-20", "10:00", "11:00",
      );

      expect(notificationRepository.createNotifications).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    test("propagates repository errors", async () => {
      notificationRepository.getShelterUserIds.mockResolvedValue(["5"]);
      notificationRepository.createNotifications.mockRejectedValue(new Error("Database error"));

      await expect(
        notificationService.createReservationNotification(101, 1, "Pukis", "2024-03-20", "10:00", "11:00"),
      ).rejects.toThrow("Database error");
    });
  });

  describe("createCancellationNotification (savanoris atšaukė -> prieglauda)", () => {
    test("notifies the shelter users about the cancellation", async () => {
      notificationRepository.getShelterUserIds.mockResolvedValue(["5"]);
      notificationRepository.createNotifications.mockResolvedValue([{ notification_id: "3" }]);

      await notificationService.createCancellationNotification(
        101, 1, "Pukis", "2024-03-20", "10:00:00", "11:00:00",
      );

      expect(notificationRepository.createNotifications).toHaveBeenCalledWith(["5"], {
        reservation_id: 1,
        type: "reservation_cancelled",
        message: "Rezervacija atšaukta: Pukis pavedžiojimas 2024-03-20 nuo 10:00 iki 11:00 buvo atšauktas.",
      });
    });
  });

  describe("createShelterCancellationNotification (prieglauda atšaukė -> savanoris)", () => {
    test("notifies only the volunteer who made the reservation", async () => {
      notificationRepository.createNotifications.mockResolvedValue([{ notification_id: "4" }]);

      await notificationService.createShelterCancellationNotification(
        "7", "10", "Mika", "2026-12-01", "10:00:00", "11:00:00",
      );

      expect(notificationRepository.getShelterUserIds).not.toHaveBeenCalled();
      expect(notificationRepository.createNotifications).toHaveBeenCalledWith(["7"], {
        reservation_id: "10",
        type: "reservation_cancelled_by_shelter",
        message: "Prieglauda atšaukė jūsų rezervaciją: Mika pavedžiojimas 2026-12-01 nuo 10:00 iki 11:00 neįvyks.",
      });
    });
  });

  describe("getNotifications", () => {
    test("returns the user's notifications", async () => {
      const rows = [{ notification_id: "1", user_id: "5", status: "unread" }];
      notificationRepository.getNotificationsByUser.mockResolvedValue(rows);

      const result = await notificationService.getNotifications(5);

      expect(notificationRepository.getNotificationsByUser).toHaveBeenCalledWith(5);
      expect(result).toEqual(rows);
    });

    test("returns an empty list when there are none", async () => {
      notificationRepository.getNotificationsByUser.mockResolvedValue([]);
      expect(await notificationService.getNotifications(5)).toEqual([]);
    });
  });

  describe("markNotificationAsRead", () => {
    test("passes the user id so only own notifications can be marked", async () => {
      notificationRepository.markAsRead.mockResolvedValue({ notification_id: "1", status: "read" });

      const result = await notificationService.markNotificationAsRead(1, 5);

      expect(notificationRepository.markAsRead).toHaveBeenCalledWith(1, 5);
      expect(result.status).toBe("read");
    });

    test("returns null for a missing or someone else's notification", async () => {
      notificationRepository.markAsRead.mockResolvedValue(null);
      expect(await notificationService.markNotificationAsRead(999, 5)).toBeNull();
    });
  });
});
