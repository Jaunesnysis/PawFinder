import React, { useState, useEffect } from 'react';

const ReservationModal = ({ pet, onClose, onSuccess }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(false);
    const token = localStorage.getItem('token');

    const fetchSlots = async (date) => {
        setLoadingSlots(true);
        try {
            const response = await fetch(`http://localhost:5050/api/pets/${pet.id}/timeslots?date=${date}`);
            const data = await response.json();
            setSlots(data.slots || []);
        } catch (error) {
            setErrorMessage('Nepavyko užkrauti laikų');
        } finally {
            setLoadingSlots(false);
        }
    };

    useEffect(() => {
        fetchSlots(selectedDate);
    }, [selectedDate]);

    const handleConfirm = async () => {
        if (!selectedSlot) return setErrorMessage('Pasirinkite laiką.');

        try {
            const response = await fetch('http://localhost:5050/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    pet_id: pet.id,
                    date: selectedDate,
                    reservation_start: selectedSlot.reservation_start,
                    reservation_end: selectedSlot.reservation_end,
                }),
            });

            if (!response.ok) throw new Error('Rezervacija nepavyko.');

            // Pranešame tėviniam komponentui apie sėkmę
            onSuccess();
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Rezervuoti laiką su {pet.name}</h3>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />

                {loadingSlots ? <p>Kraunama...</p> : (
                    <div className="slots-grid">
                        {slots.map(slot => (
                            <button
                                key={slot.reservation_start}
                                className={`slot-btn ${selectedSlot === slot ? 'active' : ''}`}
                                onClick={() => setSelectedSlot(slot)}
                            >
                                {slot.reservation_start.slice(0,5)}
                            </button>
                        ))}
                    </div>
                )}

                {errorMessage && <p className="error-text">{errorMessage}</p>}

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Atšaukti</button>
                    <button className="btn-confirm" onClick={handleConfirm}>Patvirtinti</button>
                </div>
            </div>
        </div>
    );
};

export default ReservationModal;