jest.mock('../../Infrastructure/reservationRepository', () => ({
    getUserById: jest.fn(),
    getPetById: jest.fn(),
    isTimeSlotTaken: jest.fn(),
    createReservation: jest.fn(),
    getReservedSlots: jest.fn(),
}));

jest.mock('../../../Notifications/Application/notificationService', () => ({
    createReservationNotification: jest.fn(),
}));

const reservationRepository = require('../../Infrastructure/reservationRepository');
const notificationService = require('../../../Notifications/Application/notificationService');
const { createReservation } = require('../reservationService');

const validReservation = {
    user_id: 7,
    pet_id: 3,
    date: '2026-12-01',
    reservation_start: '10:00',
    reservation_end: '11:00',
};

const availablePet = { pet_id: 3, shelter_id: 2, name: 'Rikis', status: 'available' };

describe('createReservation', () => {

    beforeEach(() => {
        jest.resetAllMocks();
        reservationRepository.getUserById.mockResolvedValue({ user_id: 7 });
        reservationRepository.getPetById.mockResolvedValue(availablePet);
        reservationRepository.isTimeSlotTaken.mockResolvedValue(false);
        reservationRepository.createReservation.mockResolvedValue({ reservation_id: 55, pet_id: 3 });
        notificationService.createReservationNotification.mockResolvedValue(undefined);
    });

    test('sukuria rezervaciją, normalizuoja laiką ir siunčia pranešimą prieglaudai', async () => {
        const result = await createReservation({ ...validReservation, reservation_start: '9:00', reservation_end: '10:00:00' });

        expect(result).toEqual({ reservation_id: 55, pet_id: 3 });
        expect(reservationRepository.isTimeSlotTaken).toHaveBeenCalledWith(3, '2026-12-01', '09:00:00', '10:00:00');
        expect(reservationRepository.createReservation).toHaveBeenCalledWith({
            user_id: 7,
            pet_id: 3,
            date: '2026-12-01',
            reservation_start: '09:00:00',
            reservation_end: '10:00:00',
        });
        expect(notificationService.createReservationNotification).toHaveBeenCalledWith(
            2, 55, 'Rikis', '2026-12-01', '09:00:00', '10:00:00',
        );
    });

    test('meta 400, kai trūksta bent vieno privalomo lauko', async () => {
        const fields = ['user_id', 'pet_id', 'date', 'reservation_start', 'reservation_end'];

        for (const field of fields) {
            await expect(createReservation({ ...validReservation, [field]: undefined })).rejects.toEqual({
                status: 400,
                message: 'user_id, pet_id, date, reservation_start and reservation_end are required',
            });
        }
        expect(reservationRepository.getUserById).not.toHaveBeenCalled();
    });

    test('meta 404, kai vartotojas nerastas', async () => {
        reservationRepository.getUserById.mockResolvedValue(null);

        await expect(createReservation(validReservation)).rejects.toEqual({ status: 404, message: 'User not found' });
        expect(reservationRepository.getPetById).not.toHaveBeenCalled();
    });

    test('meta 404, kai gyvūnas nerastas', async () => {
        reservationRepository.getPetById.mockResolvedValue(null);

        await expect(createReservation(validReservation)).rejects.toEqual({ status: 404, message: 'Pet not found' });
    });

    test('meta 400, kai gyvūnas neprieinamas', async () => {
        reservationRepository.getPetById.mockResolvedValue({ ...availablePet, status: 'reserved' });

        await expect(createReservation(validReservation)).rejects.toEqual({ status: 400, message: 'Pet status is not available' });
    });

    test('meta 400, kai pradžia ne ankstesnė už pabaigą', async () => {
        await expect(createReservation({ ...validReservation, reservation_start: '11:00', reservation_end: '10:00' }))
            .rejects.toEqual({ status: 400, message: 'Invalid reservation interval' });
    });

    test('meta 400, kai laikas už prieglaudos darbo valandų', async () => {
        await expect(createReservation({ ...validReservation, reservation_start: '08:00', reservation_end: '09:00' }))
            .rejects.toEqual({ status: 400, message: 'Selected slot is outside shelter schedule' });
    });

    test('meta 400, kai intervalas neatitinka valandinio laiko lango', async () => {
        await expect(createReservation({ ...validReservation, reservation_start: '10:00', reservation_end: '12:00' }))
            .rejects.toEqual({ status: 400, message: 'Selected slot is outside shelter schedule' });
        expect(reservationRepository.isTimeSlotTaken).not.toHaveBeenCalled();
    });

    test('meta 409, kai laikas jau užimtas', async () => {
        reservationRepository.isTimeSlotTaken.mockResolvedValue(true);

        await expect(createReservation(validReservation)).rejects.toEqual({ status: 409, message: 'Time slot already taken' });
        expect(reservationRepository.createReservation).not.toHaveBeenCalled();
        expect(notificationService.createReservationNotification).not.toHaveBeenCalled();
    });

});