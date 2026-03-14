const achievementService = require('../achievementService');
const achievementRepository = require('../../Infrastructure/achievementRepository');
const userService = require('../../../Users/Application/userService');

// 1. Mock'iname (imituojame) priklausomybes, kad testuotume tik serviso logiką
jest.mock('../../Infrastructure/achievementRepository');
jest.mock('../../../Users/Application/userService');

describe('AchievementService Logika (FR1 + DeivM)', () => {

    beforeEach(() => {
        jest.clearAllMocks(); // Išvalome senus kviestinius duomenis prieš kiekvieną testą
    });

    // TESTAS 1: AC2 ir AC3 (Taškų pridėjimas ir pirmo ženklelio gavimas)
    test('Turėtų pridėti taškus ir suteikti "First Steps" ženklelį, kai pasiekiama 10 tšk. riba', async () => {
        const userId = 1;
        const pointsToAdd = 15;

        // Imituojame, ką grąžina User modulis (AC2 dalis)
        userService.addPointsToUser.mockResolvedValue({ user_id: userId, points: 15 });

        // Imituojame Repository duomenis (AC3 dalis)
        achievementRepository.getAllAchievements.mockResolvedValue([
            { achievement_id: 1, title: 'First Steps', points_threshold: 10 }
        ]);
        achievementRepository.getEarnedBadgeIds.mockResolvedValue([]); // Vartotojas dar nieko neturi

        const result = await achievementService.addPoints(userId, pointsToAdd);

        // Patikrinimai:
        expect(result.current_points).toBe(15);
        expect(result.newly_earned).toHaveLength(1);
        expect(result.newly_earned[0].title).toBe('First Steps');

        // Patikrinam, ar repository buvo iškviestas įrašyti naują pasiekimą
        expect(achievementRepository.saveEarnedBadges).toHaveBeenCalledWith(userId, [1]);
    });

    // TESTAS 2: AC3 (Daugiau ženklelių vienu metu)
    test('Turėtų suteikti kelis ženklelius, jei taškų kiekis peršoka kelias ribas', async () => {
        const userId = 1;
        userService.addPointsToUser.mockResolvedValue({ user_id: userId, points: 60 });

        achievementRepository.getAllAchievements.mockResolvedValue([
            { achievement_id: 1, points_threshold: 10 },
            { achievement_id: 2, points_threshold: 50 }
        ]);
        achievementRepository.getEarnedBadgeIds.mockResolvedValue([]);

        const result = await achievementService.addPoints(userId, 60);

        expect(result.newly_earned).toHaveLength(2); // Gavo abu: 10 ir 50 tšk.
    });

    // TESTAS 3: AC4 (Progresas ir trūkstami taškai)
    test('Turėtų teisingai suskaičiuoti, kiek taškų trūksta iki kito pasiekimo', async () => {
        const userId = 1;
        userService.getUserPoints.mockResolvedValue(35); // Vartotojas turi 35 tšk.

        achievementRepository.getAllAchievements.mockResolvedValue([
            { achievement_id: 1, title: '10 tšk. badge', points_threshold: 10 },
            { achievement_id: 2, title: 'Sekantis badge', points_threshold: 50 }
        ]);
        achievementRepository.getEarnedBadgeIds.mockResolvedValue([1]); // Pirmą jau turi

        const progress = await achievementService.getAchievementProgress(userId);

        expect(progress.total_points).toBe(35);
        expect(progress.next_achievement.title).toBe('Sekantis badge');
        expect(progress.next_achievement.points_missing).toBe(15); // 50 - 35 = 15
    });

    // TESTAS 4: AC4 Edge Case (Visi pasiekimai gauti)
    test('Turėtų pranešti, kai visi pasiekimai jau yra uždirbti', async () => {
        const userId = 1;
        userService.getUserPoints.mockResolvedValue(150);

        achievementRepository.getAllAchievements.mockResolvedValue([
            { achievement_id: 1, points_threshold: 10 }
        ]);
        achievementRepository.getEarnedBadgeIds.mockResolvedValue([1]);

        const progress = await achievementService.getAchievementProgress(userId);

        expect(progress.next_achievement).toBeNull();
        expect(progress.message).toBe("Visi pasiekimai jau pasiekti!");
    });
});