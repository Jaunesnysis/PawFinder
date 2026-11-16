import React, { useState, useEffect } from 'react';

const getLocalDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const ReservationModal = ({ pet, onClose, onSuccess }) => {
    const [selectedDate, setSelectedDate] = useState(getLocalDate);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(false);
    const token = localStorage.getItem('token');

    const fetchSlots = async (date) => {
        setLoadingSlots(true);
        setSelectedSlot(null);
        try {
            const response = await fetch(`http://localhost:5050/api/pets/${pet.id}/timeslots?date=${date}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Nepavyko užkrauti laikų');
            setSlots(data.slots || []);
        } catch (error) {
            setSlots([]);
            setErrorMessage(error.message);
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

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Rezervacija nepavyko.');
            }

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
                <input
                    type="date"
                    value={selectedDate}
                    min={getLocalDate()}
                    onChange={(e) => {
                        setErrorMessage('');
                        setSelectedDate(e.target.value);
                    }}
                />

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
                        {slots.length === 0 && <p>Laisvų laikų šią dieną nėra.</p>}
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