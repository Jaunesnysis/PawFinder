const reservationService = require("../reservationService");
const reservationRepository = require("../../Infrastructure/reservationRepository");
const notificationService = require("../../../Notifications/Application/notificationService");

jest.mock("../../Infrastructure/reservationRepository", () => ({
  getPetById: jest.fn(),
  getUserById: jest.fn(),
  getReservedSlots: jest.fn(),
  getCurrentDateTime: jest.fn(),
  isTimeSlotTaken: jest.fn(),
  createReservation: jest.fn(),
}));

jest.mock("../../../Notifications/Application/notificationService", () => ({
  createReservationNotification: jest.fn(),
}));

jest.mock("../../../Users/Application/userService", () => ({}));

describe("Reservation creation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    reservationRepository.getPetById.mockResolvedValue({
      pet_id: 5,
      name: "Mika",
      shelter_id: 3,
      status: "available",
    });
    reservationRepository.getUserById.mockResolvedValue({ user_id: 7 });
    reservationRepository.getCurrentDateTime.mockResolvedValue({
      date: "2026-11-16",
      time: "10:30:00",
    });
    reservationRepository.getReservedSlots.mockResolvedValue([]);
    reservationRepository.isTimeSlotTaken.mockResolvedValue(false);
    reservationRepository.createReservation.mockResolvedValue({
      reservation_id: 12,
    });
  });

  test("does not show slots that have already started today", async () => {
    const slots = await reservationService.getAvailableTimeslots(
      5,
      "2026-11-16",
    );

    expect(slots.map((slot) => slot.reservation_start)).toEqual([
      "11:00:00",
      "12:00:00",
      "13:00:00",
      "14:00:00",
      "15:00:00",
      "16:00:00",
    ]);
  });

  test("returns no available slots for a past date", async () => {
    const slots = await reservationService.getAvailableTimeslots(
      5,
      "2026-11-15",
    );

    expect(slots).toEqual([]);
    expect(reservationRepository.getReservedSlots).not.toHaveBeenCalled();
  });

  test("returns no available slots when the pet is not available", async () => {
    reservationRepository.getPetById.mockResolvedValue({
      pet_id: 5,
      status: "reserved",
    });

    const slots = await reservationService.getAvailableTimeslots(
      5,
      "2026-11-17",
    );

    expect(slots).toEqual([]);
    expect(reservationRepository.getReservedSlots).not.toHaveBeenCalled();
  });

  test("rejects a past date", async () => {
    await expect(
      reservationService.createReservation({
        user_id: 7,
        pet_id: 5,
        date: "2026-11-15",
        reservation_start: "11:00:00",
        reservation_end: "12:00:00",
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(reservationRepository.createReservation).not.toHaveBeenCalled();
  });

  test("rejects a time that has already started today", async () => {
    await expect(
      reservationService.createReservation({
        user_id: 7,
        pet_id: 5,
        date: "2026-11-16",
        reservation_start: "10:00:00",
        reservation_end: "11:00:00",
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(reservationRepository.createReservation).not.toHaveBeenCalled();
  });

  test("rejects malformed or impossible dates", async () => {
    await expect(
      reservationService.getAvailableTimeslots(5, "2026-02-30"),
    ).rejects.toMatchObject({ status: 400 });
  });

  test("creates a valid future reservation and notifies the shelter", async () => {
    const reservation = await reservationService.createReservation({
      user_id: 7,
      pet_id: 5,
      date: "2026-11-16",
      reservation_start: "11:00:00",
      reservation_end: "12:00:00",
    });

    expect(reservation).toEqual({ reservation_id: 12 });
    expect(reservationRepository.createReservation).toHaveBeenCalledWith({
      user_id: 7,
      pet_id: 5,
      date: "2026-11-16",
      reservation_start: "11:00:00",
      reservation_end: "12:00:00",
    });
    expect(
      notificationService.createReservationNotification,
    ).toHaveBeenCalledWith(
      3,
      12,
      "Mika",
      "2026-11-16",
      "11:00:00",
      "12:00:00",
    );
  });

  test("still creates the reservation when the shelter notification fails", async () => {
    notificationService.createReservationNotification.mockRejectedValueOnce(
      new Error("Notification error"),
    );
    jest.spyOn(console, "error").mockImplementation(() => {});

    const reservation = await reservationService.createReservation({
      user_id: 7,
      pet_id: 5,
      date: "2026-11-16",
      reservation_start: "11:00:00",
      reservation_end: "12:00:00",
    });

    expect(reservation).toEqual({ reservation_id: 12 });
    console.error.mockRestore();
  });

  test("allows separate time slots for the same available pet", async () => {
    reservationRepository.getCurrentDateTime.mockResolvedValue({
      date: "2026-11-16",
      time: "08:00:00",
    });
    reservationRepository.createReservation
      .mockResolvedValueOnce({ reservation_id: 12 })
      .mockResolvedValueOnce({ reservation_id: 13 });

    await reservationService.createReservation({
      user_id: 7,
      pet_id: 5,
      date: "2026-11-16",
      reservation_start: "09:00:00",
      reservation_end: "10:00:00",
    });
    await reservationService.createReservation({
      user_id: 8,
      pet_id: 5,
      date: "2026-11-16",
      reservation_start: "10:00:00",
      reservation_end: "11:00:00",
    });

    expect(reservationRepository.createReservation).toHaveBeenCalledTimes(2);
    expect(reservationRepository.createReservation).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ reservation_start: "09:00:00" }),
    );
    expect(reservationRepository.createReservation).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ reservation_start: "10:00:00" }),
    );
  });

  test("does not allow a reservation when the pet is reserved", async () => {
    reservationRepository.getPetById.mockResolvedValue({
      pet_id: 5,
      name: "Mika",
      shelter_id: 3,
      status: "reserved",
    });

    await expect(
      reservationService.createReservation({
        user_id: 7,
        pet_id: 5,
        date: "2026-11-16",
        reservation_start: "11:00:00",
        reservation_end: "12:00:00",
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(reservationRepository.createReservation).not.toHaveBeenCalled();
  });
});
