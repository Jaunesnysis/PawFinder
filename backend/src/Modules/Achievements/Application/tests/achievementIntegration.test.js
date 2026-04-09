const achievementService = require('../achievementService');
const pool = require('../../../../Infrastructure/db');

jest.setTimeout(30000);

describe('Integracija: AchievementService + UserService + real DB', () => {
    const TEST_USER_ID = 4;

    beforeAll(async () => {
        await pool.query('DELETE FROM user_achievements WHERE user_id = $1', [TEST_USER_ID]);
        await pool.query('UPDATE users SET points = 0 WHERE user_id = $1', [TEST_USER_ID]);
    })

    afterAll(async () => {
        await pool.end();
    });

    test('TC1: Pilna vertikali integracija - taškų pridėjimas ir įrašymas į abi lenteles', async () => {
        const pointsToAdd = 15;

        //Kviečiame achievement servisą, kuriame kreipiamasi į user servisą ir repositorijas, o ten į DB.
        const result = await achievementService.addPoints(TEST_USER_ID, pointsToAdd);

        //Resultatų tikrinimas
        expect(result.current_points).toBe(15);
        expect(result.newly_earned).toHaveLength(1);
        expect(result.newly_earned[0].title).toBe('Pirmas žingsnis');

        //Tikriname, ar taškai tikrai pasikeitė lentelėje 'users'
        const userRes = await pool.query('SELECT points FROM users WHERE user_id = $1', [TEST_USER_ID]);
        expect(userRes.rows[0].points).toBe(15);

        // Tikriname, ar atsirado įrašas lentelėje 'user_achievements'
        const achRes = await pool.query('SELECT * FROM user_achievements WHERE user_id = $1', [TEST_USER_ID]);
        expect(achRes.rows).toHaveLength(1);
    })
    test('TC2: Nefunkcinis reikalavimas - Duomenų vientisumas (Data Integrity)', async () => {
        const pointsToAdd = 2;

        await achievementService.addPoints(TEST_USER_ID, pointsToAdd);

        const response = await pool.query('SELECT * FROM user_achievements WHERE user_id = $1', [TEST_USER_ID]);

        // Taškų daugiau, bet naujų ženklelių neturi būti (nes riba 50 tšk.)
        expect(response.rows).toHaveLength(1);
    })
})