const petService = require('../petService');
const petRepository = require('../../Infrastructure/petRepository');

jest.mock('../../Infrastructure/petRepository');

describe('PetService - getAvailablePets', () => {

    test('turi grąžinti tik laisvus gyvūnus pasirinktame mieste', async () => {
        // 1. Paruošiame netikrus duomenis, kuriuos "vaidins" Repository
        const mockData = [
            { id: 1, name: 'Rikis', city: 'Vilnius', status: 'Laisvas' },
            { id: 2, name: 'Bosas', city: 'Vilnius', status: 'Rezervuotas' }
        ];

        // Pasakome, kad repository visada grąžins šiuos duomenis
        petRepository.findAvailableByCity.mockResolvedValue([mockData[0]]);

        // 2. Iškviečiame Service funkciją
        const result = await petService.getAvailablePets('Vilnius');

        // 3. Tikriname rezultatus (Assertions)
        expect(result).toHaveLength(1); // Turime gauti 1 gyvūną
        expect(result[0].name).toBe('Rikis'); // Tai turi būti Rikis
        expect(result[0].status).toBe('Laisvas'); // Statusas turi būti Laisvas
    });

    test('turi iškviesti repository su teisingu miesto pavadinimu', async () => {
        await petService.getAvailablePets('Kaunas');

        // Tikriname, ar Service sluoksnis kreipėsi į Repository su teisingu parametru
        expect(petRepository.findAvailableByCity).toHaveBeenCalledWith('Kaunas');
    });
});