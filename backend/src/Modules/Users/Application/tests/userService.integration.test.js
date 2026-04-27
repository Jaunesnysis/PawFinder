const userService = require('../userService');
const pool = require('../../../../Infrastructure/db');
const bcrypt = require('bcrypt');

// Padidiname laukimo laiką, nes jungiamės prie Cloud DB
//jest.setTimeout(15000);

describe('UserService - LOGIN INTEGRACINIS TESTAS (Real DB)', () => {
    const testEmail = 'integration-test@pawfinder.com';
    const password = 'SafePassword123';

    // 1. Prieš pradedant testus, paruošiame švarų testinį vartotoją DB
    beforeAll(async () => {
        // Ištriname jei toks jau buvo
        await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);

        // Sugeneruojame tikrą hash'ą
        const hash = await bcrypt.hash(password, 10);

        // Įrašome testinį vartotoją tiesiai į DB
        await pool.query(
            'INSERT INTO users (name, surname, email, password_hash, points) VALUES ($1, $2, $3, $4, $5)',
            ['TestUser', 'Testukas', testEmail, hash, 0]
        );
    });

    // 2. Po visų testų išvalome šiukšles
    afterAll(async () => {
        await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
        // await pool.end(); // Neuždarykime čia, jei kiti testai dar bėgs
    });

    test('TC1: Turėtų sėkmingai prijungti vartotoją skaitant duomenis iš tikros DB', async () => {

        const result = await userService.login(testEmail, password);

        expect(result).toHaveProperty('token');
        expect(result.user.email).toBe(testEmail);
        expect(result.user.name).toBe('TestUser');
    });

    test('TC2: Turėtų atmesti prisijungimą su neteisingu slaptažodžiu (tikras bcrypt lyginimas)', async () => {
        await expect(userService.login(testEmail, 'wrong-password'))
            .rejects.toThrow("Neteisingas slaptažodis");
    });
});