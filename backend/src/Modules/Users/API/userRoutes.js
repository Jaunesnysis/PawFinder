const express = require('express');
const router = express.Router();
const userService = require('../Application/userService');

router.post('/register', async (req, res) => {
    try {
        const { name, surname, email, phone, birthDate, password, passwordConfirmation } = req.body;

        if (password !== passwordConfirmation) {
            return res.status(400).json({ error: 'Password confirmation does not match' });
        }

        const userData = { name, surname, email, phone, birthDate, password };
        const user = await userService.registerUser(userData);

        res.status(201).json({
            message: 'User registered successfully',
            user
        });
    } catch (error) {
        if (error.message.includes('Validation failed')) {
            return res.status(400).json({ error: error.message });
        }

        if (error.message === 'Email already exists') {
            return res.status(409).json({ error: 'Email already exists' });
        }

        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;