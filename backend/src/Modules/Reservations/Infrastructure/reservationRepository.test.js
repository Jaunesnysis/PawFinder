const db = require("../../../Infrastructure/db");
const reservationRepository = require("./reservationRepository");

jest.mock("../../../Infrastructure/db", () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

describe("reservationRepository.createReservation", () => {
  let client;

  beforeEach(() => {
    jest.clearAllMocks();
    client = {
      query: jest.fn(),
      release: jest.fn(),
    };
    db.connect.mockResolvedValue(client);
  });

  test("locks the pet and inserts a reservation in one transaction", async () => {
    const created = { reservation_id: 12 };
    client.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ pet_id: 5 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [created] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await reservationRepository.createReservation({
      user_id: 7,
      pet_id: 5,
      date: "2026-11-16",
      reservation_start: "11:00:00",
      reservation_end: "12:00:00",
    });

    expect(result).toBe(created);
    expect(client.query.mock.calls[1][0]).toContain("FOR UPDATE");
    expect(client.query.mock.calls[4][0]).toContain("INSERT INTO reservations");
    expect(client.query.mock.calls[5][0]).toBe("COMMIT");
    expect(client.release).toHaveBeenCalled();
  });

  test("rolls back if an overlapping reservation already exists", async () => {
    client.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ pet_id: 5 }] })
      .mockResolvedValueOnce({ rows: [{ reservation_id: 11 }] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(
      reservationRepository.createReservation({
        user_id: 7,
        pet_id: 5,
        date: "2026-11-16",
        reservation_start: "11:00:00",
        reservation_end: "12:00:00",
      }),
    ).rejects.toMatchObject({ status: 409 });

    expect(
      client.query.mock.calls.some(([query]) =>
        query.includes("INSERT INTO reservations"),
      ),
    ).toBe(false);
    expect(client.query.mock.calls[3][0]).toBe("ROLLBACK");
    expect(client.release).toHaveBeenCalled();
  });

  test("rolls back if the slot passes before the transaction inserts", async () => {
    client.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ pet_id: 5 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ "?column?": 1 }] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(
      reservationRepository.createReservation({
        user_id: 7,
        pet_id: 5,
        date: "2026-11-16",
        reservation_start: "11:00:00",
        reservation_end: "12:00:00",
      }),
    ).rejects.toMatchObject({ status: 400 });

    expect(client.query.mock.calls[4][0]).toBe("ROLLBACK");
    expect(client.release).toHaveBeenCalled();
  });
});
