const express = require('express');
const router = express.Router();
const reservationService = require('../Application/reservationService');
const authorizeUser = require('../../../Infrastructure/Middleware/authMiddleware');

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

router.get('/', authorizeUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const shelterId = req.user.shelterId;
    
    let reservations;
    
    if (userRole === 'shelter') {
      // For shelters, get reservations by their shelter ID
      if (!shelterId) {
        return res.status(403).json({ error: 'Shelter ID not found in token' });
      }
      reservations = await reservationService.getShelterReservations(shelterId);
    } else {
      // For users, get their personal reservations
      reservations = await reservationService.getUserReservations(userId);
    }
    
    res.json(reservations);
  } catch (error) {
    console.error('Fetch user reservations error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/', authorizeUser, async (req, res) => {
  try {
    const bodyData = req.body;
    const securePayload = {
          ...bodyData,
          user_id: req.user.id
    };
    const reservation = await reservationService.createReservation(securePayload);
    res.status(201).json({ message: 'Reservation successfully created.', reservation });
  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
});

router.delete('/:id', authorizeUser, async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id, 10);
    if (!reservationId) {
      return res.status(400).json({ error: 'Reservation ID is required' });
    }
    
    const cancelled = await reservationService.cancelReservation(reservationId);
    res.json({ message: 'Reservation successfully cancelled.', reservation: cancelled });
  } catch (error) {
    console.error('Reservation cancellation error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;