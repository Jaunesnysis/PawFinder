const reservationService = require('../reservationService');
const reservationRepository = require('../../Infrastructure/reservationRepository');

jest.mock('../../Infrastructure/reservationRepository', () => ({
  getReservationsByUserId: jest.fn(),
}));

describe('ReservationService - getUserReservations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should split future and past reservations for the logged-in volunteer', async () => {
    const now = new Date('2026-11-10T12:00:00');

    reservationRepository.getReservationsByUserId.mockResolvedValue([
      {
        reservation_id: 1,
        user_id: 7,
        pet_id: 10,
        pet_name: 'Rikis',
        shelter_name: 'Pavasaris',
        date: '2026-11-11',
        reservation_start: '09:00:00',
        reservation_end: '10:00:00',
        status: 'confirmed',
      },
      {
        reservation_id: 2,
        user_id: 7,
        pet_id: 11,
        pet_name: 'Murka',
        shelter_name: 'Pavasaris',
        date: '2026-11-09',
        reservation_start: '14:00:00',
        reservation_end: '15:00:00',
        status: 'confirmed',
      },
    ]);

    const result = await reservationService.getUserReservations(7, now);

    expect(reservationRepository.getReservationsByUserId).toHaveBeenCalledWith(7);
    expect(result.future).toHaveLength(1);
    expect(result.past).toHaveLength(1);
    expect(result.future[0].pet_name).toBe('Rikis');
    expect(result.past[0].pet_name).toBe('Murka');
  });

  test('should reject missing user id', async () => {
    await expect(reservationService.getUserReservations()).rejects.toMatchObject({
      status: 400,
      message: 'User id is required',
    });
  });
});
