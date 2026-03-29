const { Achievement } = require('../Achievement');
const { UserAchievement } = require('../UserAchievement');

describe('Achievements Domain Models', () => {
    test('Achievement modelis teisingai susikuria', () => {
        const ach = new Achievement(1, 'T', 'D', 10, 'i.png');
        expect(ach.achievement_id).toBe(1);
    });

    test('UserAchievement modelis teisingai susikuria', () => {
        const date = new Date();
        const ua = new UserAchievement(1, 100, date);
        expect(ua.user_id).toBe(100);
        expect(ua.earned_at).toBe(date);
    });
});