const notificationService = require('../notificationService');

// Mock the repository
jest.mock('../../Infrastructure/notificationRepository', () => ({
    createNotification: jest.fn(),
    getNotificationsByUser: jest.fn(),
    markAsRead: jest.fn()
}));

const notificationRepository = require('../../Infrastructure/notificationRepository');

describe('NotificationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createReservationNotification', () => {
        test('should create reservation notification successfully', async () => {
            // Arrange
            const mockNotification = {
                notification_id: 1,
                shelter_id: 101,
                reservation_id: 1,
                type: 'reservation_created',
                message: 'Nauja rezervacija: Pukis pavedžiojimui 2024-03-20 nuo 10:00 iki 11:00.',
                status: 'unread',
                created_at: new Date(),
                read_at: null
            };
            notificationRepository.createNotification.mockResolvedValue(mockNotification);

            // Act
            const result = await notificationService.createReservationNotification(
                101, 1, 'Pukis', '2024-03-20', '10:00', '11:00'
            );

            // Assert
            expect(notificationRepository.createNotification).toHaveBeenCalledWith({
                shelter_id: 101,
                reservation_id: 1,
                type: 'reservation_created',
                message: 'Nauja rezervacija: Pukis pavedžiojimui 2024-03-20 nuo 10:00 iki 11:00.'
            });
            expect(result).toEqual(mockNotification);
        });

        test('should handle repository error (critical situation)', async () => {
            // Arrange
            notificationRepository.createNotification.mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(notificationService.createReservationNotification(
                101, 1, 'Pukis', '2024-03-20', '10:00', '11:00'
            )).rejects.toThrow('Database error');
        });
    });

    describe('createCancellationNotification', () => {
        test('should create cancellation notification successfully', async () => {
            // Arrange
            const mockNotification = {
                notification_id: 2,
                shelter_id: 101,
                reservation_id: 1,
                type: 'reservation_cancelled',
                message: 'Rezervacija atšaukta: Pukis pavedžiojimas 2024-03-20 nuo 10:00 iki 11:00 buvo atšauktas.',
                status: 'unread',
                created_at: new Date(),
                read_at: null
            };
            notificationRepository.createNotification.mockResolvedValue(mockNotification);

            // Act
            const result = await notificationService.createCancellationNotification(
                101, 1, 'Pukis', '2024-03-20', '10:00', '11:00'
            );

            // Assert
            expect(notificationRepository.createNotification).toHaveBeenCalledWith({
                shelter_id: 101,
                reservation_id: 1,
                type: 'reservation_cancelled',
                message: 'Rezervacija atšaukta: Pukis pavedžiojimas 2024-03-20 nuo 10:00 iki 11:00 buvo atšauktas.'
            });
            expect(result).toEqual(mockNotification);
        });

        test('should handle repository error (critical situation)', async () => {
            // Arrange
            notificationRepository.createNotification.mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(notificationService.createCancellationNotification(
                101, 1, 'Pukis', '2024-03-20', '10:00', '11:00'
            )).rejects.toThrow('Database error');
        });
    });

    describe('getNotifications', () => {
        test('should return notifications', async () => {
            // Arrange
            const mockNotifications = [
                { notification_id: 1, shelter_id: 101, message: 'Test' }
            ];
            notificationRepository.getNotificationsByUser.mockResolvedValue(mockNotifications);

            // Act
            const result = await notificationService.getNotifications(101, null);

            // Assert
            expect(notificationRepository.getNotificationsByUser).toHaveBeenCalledWith(101, null);
            expect(result).toEqual(mockNotifications);
        });

        test('should handle empty notifications list (edge case)', async () => {
            // Arrange
            notificationRepository.getNotificationsByUser.mockResolvedValue([]);

            // Act
            const result = await notificationService.getNotifications(101, null);

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('markNotificationAsRead', () => {
        test('should mark notification as read', async () => {
            // Arrange
            const mockNotification = { notification_id: 1, status: 'read' };
            notificationRepository.markAsRead.mockResolvedValue(mockNotification);

            // Act
            const result = await notificationService.markNotificationAsRead(1);

            // Assert
            expect(notificationRepository.markAsRead).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockNotification);
        });

        test('should handle non-existent notification (critical situation)', async () => {
            // Arrange
            notificationRepository.markAsRead.mockResolvedValue(null);

            // Act
            const result = await notificationService.markNotificationAsRead(999);

            // Assert
            expect(result).toBeNull();
        });
    });
});