const reservationService = require('../reservationService');
const reservationRepository = require('../../Infrastructure/reservationRepository');

jest.mock('../../Infrastructure/reservationRepository', () => ({
  getReservationsByUserId: jest.fn(),
  getReservationsByShelterId: jest.fn(),
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

  test('should split shelter reservations into future and past for the shelter dashboard', async () => {
    const now = new Date('2026-11-10T12:00:00');

    reservationRepository.getReservationsByShelterId.mockResolvedValue([
      {
        reservation_id: 3,
        pet_id: 22,
        pet_name: 'Misius',
        volunteer_name: 'Jonas',
        volunteer_surname: 'Jonaitis',
        date: '2026-11-12',
        reservation_start: '10:00:00',
        reservation_end: '11:00:00',
      },
      {
        reservation_id: 4,
        pet_id: 23,
        pet_name: 'Luna',
        volunteer_name: 'Petras',
        volunteer_surname: 'Petraitis',
        date: '2026-11-08',
        reservation_start: '13:00:00',
        reservation_end: '14:00:00',
      },
    ]);

    const result = await reservationService.getShelterReservations(5, now);

    expect(reservationRepository.getReservationsByShelterId).toHaveBeenCalledWith(5);
    expect(result.future).toHaveLength(1);
    expect(result.past).toHaveLength(1);
    expect(result.future[0].volunteer_name).toBe('Jonas Jonaitis');
    expect(result.past[0].pet_name).toBe('Luna');
  });
});
