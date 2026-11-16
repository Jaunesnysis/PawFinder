const request = require("supertest");
const express = require("express");

jest.mock("../../Application/userService", () => ({
    registerUser: jest.fn(),
}));
const userService = require("../../Application/userService");
const userRoutes = require("../userRoutes");

const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);

const validBody = {
    name: "Jonas", surname: "Jonaitis", email: "j@j.lt", phone: "+37060000000",
    birthDate: "2000-01-01", password: "Pass1234", passwordConfirmation: "Pass1234",
};

describe("POST /api/users/register", () => {
    beforeEach(() => jest.clearAllMocks());

    test("sėkminga registracija grąžina 201", async () => {
        userService.registerUser.mockResolvedValue({ id: 1 });
        const res = await request(app).post("/api/users/register").send(validBody);
        expect(res.status).toBe(201);
        expect(res.body.message).toBe("User registered successfully");
    });

    test("slaptažodis ir patvirtinimas nesutampa grąžina 400", async () => {
        const res = await request(app).post("/api/users/register")
            .send({ ...validBody, passwordConfirmation: "kitas" });
        expect(res.status).toBe(400);
        expect(userService.registerUser).not.toHaveBeenCalled();
    });

    test("Validation failed grąžina 400", async () => {
        userService.registerUser.mockRejectedValue(new Error("Validation failed: x"));
        const res = await request(app).post("/api/users/register").send(validBody);
        expect(res.status).toBe(400);
    });

    test("Email already exists grąžina 409", async () => {
        userService.registerUser.mockRejectedValue(new Error("Email already exists"));
        const res = await request(app).post("/api/users/register").send(validBody);
        expect(res.status).toBe(409);
    });

    test("kita klaida grąžina 500", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});
        userService.registerUser.mockRejectedValue(new Error("DB down"));
        const res = await request(app).post("/api/users/register").send(validBody);
        expect(res.status).toBe(500);
    });
});