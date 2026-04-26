const shelterRepository = require('../../Infrastructure/shelterRepository');
const petRepository = require('../../../Animals/Infrastructure/petRepository');
const shelterService = require('../shelterService');

jest.mock('../../Infrastructure/shelterRepository');
jest.mock('../../../Animals/Infrastructure/petRepository');

describe('shelterService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getShelterProfile', () => {
        it('should return shelter profile with pets', async () => {
            const mockShelter = {
                shelter_id: 1,
                name: 'Pagalba uodegėlėms',
                description: 'A welcoming shelter in Vilnius focused on socializing dogs and cats for adoption',
                city: 'Vilnius',
                contact: {
                    email: 'nfo@vilniusshelter.lt',
                    phone: '+370 612 34567',
                    address: 'Gedimino pr. 3, Vilnius',
                    website: null
                }
            };

            const mockPets = [
                {
                    pet_id: 1,
                    shelter_id: 1,
                    name: 'Rikis',
                    species: 'Dog',
                    breed: 'Auksaspalvis retriveris',
                    age: 3,
                    size: 'large',
                    weight: '30.50',
                    activity_level: null,
                    health_info: null,
                    status: 'available',
                    city: 'Vilnius',
                    shelter_description: null,
                    ai_description: null
                }
            ];

            shelterRepository.findShelterById.mockResolvedValue(mockShelter);
            petRepository.findAvailableByShelterId.mockResolvedValue(mockPets);

            const result = await shelterService.getShelterProfile(1);

            expect(shelterRepository.findShelterById).toHaveBeenCalledWith(1);
            expect(petRepository.findAvailableByShelterId).toHaveBeenCalledWith(1);

            expect(result).toEqual({
                shelter_id: 1,
                name: 'Pagalba uodegėlėms',
                description: 'A welcoming shelter in Vilnius focused on socializing dogs and cats for adoption',
                city: 'Vilnius',
                contact: {
                    email: 'nfo@vilniusshelter.lt',
                    phone: '+370 612 34567',
                    address: 'Gedimino pr. 3, Vilnius',
                    website: null
                },
                pets: mockPets
            });
        });

        it('should return null when shelter is not found', async () => {
            shelterRepository.findShelterById.mockResolvedValue(null);

            const result = await shelterService.getShelterProfile(999);

            expect(shelterRepository.findShelterById).toHaveBeenCalledWith(999);
            expect(petRepository.findAvailableByShelterId).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('should return shelter profile with empty pets array when no pets exist', async () => {
            const mockShelter = {
                shelter_id: 1,
                name: 'Pagalba uodegėlėms',
                description: 'Shelter description',
                city: 'Vilnius',
                contact: {
                    email: 'test@test.lt',
                    phone: '+37060000000',
                    address: 'Gedimino pr. 3, Vilnius',
                    website: null
                }
            };

            shelterRepository.findShelterById.mockResolvedValue(mockShelter);
            petRepository.findAvailableByShelterId.mockResolvedValue([]);

            const result = await shelterService.getShelterProfile(1);

            expect(result.pets).toEqual([]);
            expect(result.contact).toEqual({
                email: 'test@test.lt',
                phone: '+37060000000',
                address: 'Gedimino pr. 3, Vilnius',
                website: null
            });
        });

        it('should normalize missing contact values to null', async () => {
            const mockShelter = {
                shelter_id: 1,
                name: 'Pagalba uodegėlėms',
                description: 'Shelter description',
                city: 'Vilnius',
                contact: {}
            };

            shelterRepository.findShelterById.mockResolvedValue(mockShelter);
            petRepository.findAvailableByShelterId.mockResolvedValue([]);

            const result = await shelterService.getShelterProfile(1);

            expect(result.contact).toEqual({
                email: null,
                phone: null,
                address: null,
                website: null
            });
        });
    });

    describe('getAllShelters', () => {
        it('should return mapped shelters list', async () => {
            const mockShelters = [
                {
                    shelter_id: 1,
                    name: 'Pagalba uodegėlėms',
                    description: 'Desc 1',
                    city: 'Vilnius',
                    contact: {
                        email: 'a@test.lt',
                        phone: '+37060000001',
                        address: 'Address 1',
                        website: null
                    }
                },
                {
                    shelter_id: 2,
                    name: 'Kaunas Animal Home',
                    description: 'Desc 2',
                    city: 'Kaunas',
                    contact: {
                        email: 'b@test.lt',
                        phone: '+37060000002',
                        address: 'Address 2',
                        website: null
                    }
                }
            ];

            shelterRepository.getAllShelters.mockResolvedValue(mockShelters);

            const result = await shelterService.getAllShelters();

            expect(shelterRepository.getAllShelters).toHaveBeenCalled();
            expect(result).toEqual([
                {
                    shelter_id: 1,
                    name: 'Pagalba uodegėlėms',
                    description: 'Desc 1',
                    city: 'Vilnius',
                    contact: {
                        email: 'a@test.lt',
                        phone: '+37060000001',
                        address: 'Address 1',
                        website: null
                    }
                },
                {
                    shelter_id: 2,
                    name: 'Kaunas Animal Home',
                    description: 'Desc 2',
                    city: 'Kaunas',
                    contact: {
                        email: 'b@test.lt',
                        phone: '+37060000002',
                        address: 'Address 2',
                        website: null
                    }
                }
            ]);
        });

        it('should return empty array when repository returns no shelters', async () => {
            shelterRepository.getAllShelters.mockResolvedValue([]);

            const result = await shelterService.getAllShelters();

            expect(result).toEqual([]);
        });
    });
});
