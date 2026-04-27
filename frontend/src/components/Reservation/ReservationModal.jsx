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

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage('❌ ' + (data.error || 'Rezervacija nepavyko.'));
                return;
            }

            // Pranešame tėviniam komponentui apie sėkmę
            onSuccess();
        } catch (error) {
            setErrorMessage('❌ ' + (error.message || 'Klaida kuriant rezervaciją'));
        }
    };

    const handleSlotClick = (slot) => {
        // Jei jau pasirinktas laikas, negalima keisti
        if (selectedSlot !== null) {
            setErrorMessage('⚠️ Jau pasirinktas laikas. Patvirtinkite arba atšaukite pasirinkimą.');
            return;
        }
        setSelectedSlot(slot);
        setErrorMessage('');
    };

    const handleResetSelection = () => {
        setSelectedSlot(null);
        setErrorMessage('');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Rezervuoti laiką su {pet.name}</h3>
                
                {/* Data input - disabled kai jau pasirinktas laikas */}
                <div>
                    <label>Pasirinkite datą:</label>
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                        disabled={selectedSlot !== null}
                        style={{ opacity: selectedSlot !== null ? 0.5 : 1, cursor: selectedSlot !== null ? 'not-allowed' : 'pointer' }}
                    />
                </div>

                {/* Laikai - mygtikai disabled kai jau vienas pasirinktas */}
                {loadingSlots ? <p>Kraunama...</p> : (
                    <div className="slots-grid">
                        {slots.map(slot => (
                            <button
                                key={slot.reservation_start}
                                className={`slot-btn ${selectedSlot === slot ? 'active' : ''}`}
                                onClick={() => handleSlotClick(slot)}
                                disabled={selectedSlot !== null && selectedSlot !== slot}
                                style={{
                                    opacity: selectedSlot !== null && selectedSlot !== slot ? 0.4 : 1,
                                    cursor: selectedSlot !== null && selectedSlot !== slot ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {slot.reservation_start.slice(0,5)}
                            </button>
                        ))}
                    </div>
                )}

                {/* Pasirinkto laiko info */}
                {selectedSlot && (
                    <div className="selected-info" style={{ padding: '12px', background: '#e8f5e9', borderRadius: '8px', marginTop: '15px' }}>
                        <strong>✓ Pasirinktas laikas:</strong> {selectedSlot.reservation_start.slice(0,5)} - {selectedSlot.reservation_end.slice(0,5)}
                    </div>
                )}

                {errorMessage && <p className="error-text">{errorMessage}</p>}

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={selectedSlot ? handleResetSelection : onClose}>
                        {selectedSlot ? 'Atšaukti pasirinkimą' : 'Atšaukti'}
                    </button>
                    <button className="btn-confirm" onClick={handleConfirm} disabled={!selectedSlot}>
                        Patvirtinti
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReservationModal;