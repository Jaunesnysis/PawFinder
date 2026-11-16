const reservationService = require("../reservationService");

jest.mock("../../Infrastructure/reservationRepository", () => ({
  getReservationForCancellation: jest.fn(),
  cancelReservation: jest.fn(),
  getReservationsByShelterId: jest.fn(),
}));

jest.mock("../../../Notifications/Application/notificationService", () => ({
  createReservationNotification: jest.fn(),
  createCancellationNotification: jest.fn(),
  createShelterCancellationNotification: jest.fn(),
}));

jest.mock("../../../Users/Application/userService", () => ({
  getShelterIdByUserId: jest.fn(),
}));

const reservationRepository = require("../../Infrastructure/reservationRepository");
const notificationService = require("../../../Notifications/Application/notificationService");
const userService = require("../../../Users/Application/userService");

const upcomingReservation = {
  reservation_id: "10",
  user_id: "1",
  pet_id: "5",
  status: "confirmed",
  date: "2026-12-01",
  reservation_start: "10:00:00",
  reservation_end: "11:00:00",
  pet_name: "Mika",
  shelter_id: "3",
  has_started: false,
};

describe("Reservation cancellation (US-15)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe("cancelReservation", () => {
    test("volunteer can cancel own upcoming reservation and shelter is notified", async () => {
      reservationRepository.getReservationForCancellation.mockResolvedValue(
        upcomingReservation,
      );
      reservationRepository.cancelReservation.mockResolvedValue({
        reservation_id: "10",
        status: "cancelled",
      });

      const result = await reservationService.cancelReservation(1, "10");

      expect(reservationRepository.cancelReservation).toHaveBeenCalledWith(10);
      expect(
        notificationService.createCancellationNotification,
      ).toHaveBeenCalledWith(
        "3",
        "10",
        "Mika",
        "2026-12-01",
        "10:00:00",
        "11:00:00",
      );
      expect(result).toEqual({
        reservation_id: "10",
        status: "cancelled",
        cancelled_by: "user",
      });
    });

    test("shelter can cancel reservation of its own pet", async () => {
      reservationRepository.getReservationForCancellation.mockResolvedValue(
        upcomingReservation,
      );
      reservationRepository.cancelReservation.mockResolvedValue({
        reservation_id: "10",
        status: "cancelled",
      });
      userService.getShelterIdByUserId.mockResolvedValue("3");

      const result = await reservationService.cancelReservation(99, "10");

      expect(userService.getShelterIdByUserId).toHaveBeenCalledWith(99);
      expect(result.cancelled_by).toBe("shelter");
      expect(
        notificationService.createCancellationNotification,
      ).not.toHaveBeenCalled();
      expect(
        notificationService.createShelterCancellationNotification,
      ).toHaveBeenCalledWith(
        "1",
        "10",
        "Mika",
        "2026-12-01",
        "10:00:00",
        "11:00:00",
      );
    });

    test("volunteer cancelling does not notify the volunteer", async () => {
      reservationRepository.getReservationForCancellation.mockResolvedValue(
        upcomingReservation,
      );
      reservationRepository.cancelReservation.mockResolvedValue({
        reservation_id: "10",
        status: "cancelled",
      });

      await reservationService.cancelReservation(1, "10");

      expect(
        notificationService.createShelterCancellationNotification,
      ).not.toHaveBeenCalled();
    });

    test("shelter cancellation still succeeds when volunteer notification fails", async () => {
      reservationRepository.getReservationForCancellation.mockResolvedValue(
        upcomingReservation,
      );
      reservationRepository.cancelReservation.mockResolvedValue({
        reservation_id: "10",
        status: "cancelled",
      });
      userService.getShelterIdByUserId.mockResolvedValue("3");
      notificationService.createShelterCancellationNotification.mockRejectedValue(
        new Error("Notification error"),
      );

      const result = await reservationService.cancelReservation(99, "10");

      expect(result).toMatchObject({ status: "cancelled", cancelled_by: "shelter" });
    });

    test("shelter cannot cancel reservation of another shelter's pet", async () => {
      reservationRepository.getReservationForCancellation.mockResolvedValue(
        upcomingReservation,
      );
      userService.getShelterIdByUserId.mockResolvedValue("7");

      await expect(
        reservationService.cancelReservation(99, "10"),
      ).rejects.toMatchObject({ status: 403 });
      expect(reservationRepository.cancelReservation).not.toHaveBeenCalled();
    });

    test("other volunteer cannot cancel someone else's reservation", async () => {
      reservationRepository.getReservationForCancellation.mockResolvedValue(
        upcomingReservation,
      );
      userService.getShelterIdByUserId.mockResolvedValue(null);

      await expect(
        reservationService.cancelReservation(2, "10"),
      ).rejects.toMatchObject({ status: 403 });
    });

    test("should return 401 when user is missing", async () => {
      await expect(
        reservationService.cancelReservation(undefined, "10"),
      ).rejects.toMatchObject({ status: 401 });
    });

    test.each(["abc", "0", "-1", "1.5"])(
      "should return 400 for invalid id %p",
      async (id) => {
        await expect(
          reservationService.cancelReservation(1, id),
        ).rejects.toMatchObject({ status: 400 });
        expect(
          reservationRepository.getReservationForCancellation,
        ).not.toHaveBeenCalled();
      },
    );

    test("should return 404 when reservation does not exist", async () => {
      reservationRepository.getReservationForCancellation.mockResolvedValue(
        null,
      );

      await expect(
        reservationService.cancelReservation(1, "99"),
      ).rejects.toMatchObject({ status: 404 });
    });

    test("should return 409 when already cancelled", async () => {
      reservationRepository.getReservationForCancellation.mockResolvedValue({
        ...upcomingReservation,
        status: "cancelled",
      });

      await expect(
        reservationService.cancelReservation(1, "10"),
      ).rejects.toMatchObject({ status: 409 });
    });

    test("should return 400 when walk already started", async () => {
      reservationRepository.getReservationForCancellation.mockResolvedValue({
        ...upcomingReservation,
        has_started: true,
      });

      await expect(
        reservationService.cancelReservation(1, "10"),
      ).rejects.toMatchObject({ status: 400 });
      expect(reservationRepository.cancelReservation).not.toHaveBeenCalled();
    });

    test("should return 409 when cancelled concurrently", async () => {
      reservationRepository.getReservationForCancellation.mockResolvedValue(
        upcomingReservation,
      );
      reservationRepository.cancelReservation.mockResolvedValue(null);

      await expect(
        reservationService.cancelReservation(1, "10"),
      ).rejects.toMatchObject({ status: 409 });
    });

    test("should still succeed when notification fails", async () => {
      reservationRepository.getReservationForCancellation.mockResolvedValue(
        upcomingReservation,
      );
      reservationRepository.cancelReservation.mockResolvedValue({
        reservation_id: "10",
        status: "cancelled",
      });
      notificationService.createCancellationNotification.mockRejectedValue(
        new Error("Notification error"),
      );

      const result = await reservationService.cancelReservation(1, "10");

      expect(result.status).toBe("cancelled");
    });
  });

  describe("getShelterReservations", () => {
    test("should return mapped reservations for shelter employee", async () => {
      userService.getShelterIdByUserId.mockResolvedValue("3");
      reservationRepository.getReservationsByShelterId.mockResolvedValue([
        {
          reservation_id: "10",
          user_id: "1",
          pet_id: "5",
          pet_name: "Mika",
          user_name: "Jonas",
          user_surname: "Jonaitis",
          date: "2026-12-01",
          reservation_start: "10:00:00",
          reservation_end: "11:00:00",
          status: "confirmed",
          cancelled_at: null,
          is_upcoming: true,
          has_ended: false,
        },
      ]);

      const result = await reservationService.getShelterReservations(99);

      expect(
        reservationRepository.getReservationsByShelterId,
      ).toHaveBeenCalledWith("3");
      expect(result[0].volunteer).toBe("Jonas J.");
      expect(result[0]).not.toHaveProperty("user_surname");
    });

    test("should return 403 for non-shelter user", async () => {
      userService.getShelterIdByUserId.mockResolvedValue(null);

      await expect(
        reservationService.getShelterReservations(1),
      ).rejects.toMatchObject({ status: 403 });
    });
  });
});
