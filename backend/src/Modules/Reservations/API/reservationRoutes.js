const express = require('express');
const router = express.Router();
const reservationService = require('../Application/reservationService');

router.get('/pets/:id/timeslots', async (req, res) => {
  try {
    const petId = parseInt(req.params.id, 10);
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const slots = await reservationService.getAvailableTimeslots(petId, date);
    res.json({ pet_id: petId, date, slots });
  } catch (error) {
    console.error('Reservation timeslot error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    const reservation = await reservationService.createReservation(payload);
    res.status(201).json({ message: 'Reservation successfully created.', reservation });
  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id, 10);
    const cancelled = await reservationService.cancelReservation(reservationId);
    res.status(200).json({ message: 'Reservation successfully cancelled.', reservation: cancelled });
  } catch (error) {
    console.error('Reservation cancellation error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;