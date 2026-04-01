jest.mock("../../Infrastructure/userRepository");
jest.mock("../../../../Infrastructure/db", () => ({ query: jest.fn() }));
jest.mock("bcrypt");

const userService = require("../userService");
const userRepository = require("../../Infrastructure/userRepository");
const bcrypt = require("bcrypt");

describe("UserService - registerUser", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should register a valid user", async () => {
        const userData = {
            name: "John",
            surname: "Doe",
            email: "john@example.com",
            phone: "123456789",
            birthDate: "1990-01-01",
            password: "Password1"
        };

        userRepository.findByEmail.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue("hashedPassword");
        userRepository.create.mockResolvedValue({
            user_id: 1,
            name: "John",
            surname: "Doe",
            email: "john@example.com",
            phone: "123456789",
            birth_date: "1990-01-01",
            created_at: "2023-01-01"
        });

        const result = await userService.registerUser(userData);

        expect(userRepository.findByEmail).toHaveBeenCalledWith("john@example.com");
        expect(bcrypt.hash).toHaveBeenCalledWith("Password1", 10);
        expect(userRepository.create).toHaveBeenCalledWith({
            name: "John",
            surname: "Doe",
            email: "john@example.com",
            phone: "123456789",
            birthDate: "1990-01-01",
            passwordHash: "hashedPassword"
        });
        expect(result).toEqual({
            user_id: 1,
            name: "John",
            surname: "Doe",
            email: "john@example.com",
            phone: "123456789",
            birth_date: "1990-01-01",
            created_at: "2023-01-01"
        });
    });

    test("should throw error for invalid email", async () => {
        const userData = {
            name: "John",
            surname: "Doe",
            email: "invalid-email",
            phone: "123456789",
            birthDate: "1990-01-01",
            password: "Password1"
        };

        await expect(userService.registerUser(userData)).rejects.toThrow("Validation failed: Invalid email format");
    });

    test("should throw error for weak password", async () => {
        const userData = {
            name: "John",
            surname: "Doe",
            email: "john@example.com",
            phone: "123456789",
            birthDate: "1990-01-01",
            password: "weak"
        };

        await expect(userService.registerUser(userData)).rejects.toThrow("Validation failed: Password must be 8-10 characters, contain at least one uppercase letter and one digit");
    });

    test("should throw error if email already exists", async () => {
        const userData = {
            name: "John",
            surname: "Doe",
            email: "john@example.com",
            phone: "123456789",
            birthDate: "1990-01-01",
            password: "Password1"
        };

        userRepository.findByEmail.mockResolvedValue({ user_id: 1 });

        await expect(userService.registerUser(userData)).rejects.toThrow("Email already exists");
    });
});