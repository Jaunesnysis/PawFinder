import React, { useState } from 'react';

// Šis komponentas gauna "pet" objektą per "props"
const AnimalCard = ({ pet }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(false);

    const fetchSlots = async (date) => {
        setLoadingSlots(true);
        setErrorMessage('');
        setStatusMessage('');

        try {
            const response = await fetch(`http://localhost:5050/api/pets/${pet.id}/timeslots?date=${date}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Klaida gaunant laisvus laikus');
            }

            setSlots(data.slots || []);
            if ((data.slots || []).length === 0) {
                setStatusMessage('Nėra laisvų laikų šiai dienai. Pasirinkite kitą datą.');
            }
        } catch (error) {
            console.error(error);
            setErrorMessage(error.message || 'Nepavyko užkrauti laikų');
        } finally {
            setLoadingSlots(false);
        }
    };

    const openModal = async () => {
        setShowModal(true);
        await fetchSlots(selectedDate);
    };

    const createReservation = async () => {
        if (!selectedSlot) {
            setErrorMessage('Pasirinkite laiką.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5050/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: 1, // TODO: naudoti prisijungusio vartotojo id
                    pet_id: pet.id,
                    date: selectedDate,
                    reservation_start: selectedSlot.reservation_start,
                    reservation_end: selectedSlot.reservation_end,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Nepavyko sukurti rezervacijos');
            }

            setStatusMessage(data.message || 'Reservation successfully created.');
            setErrorMessage('');
            setSlots((prev) => prev.filter((s) => s.reservation_start !== selectedSlot.reservation_start));
            setSelectedSlot(null);
        } catch (error) {
            console.error(error);
            setErrorMessage(error.message || 'Rezervacijos klaida');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedSlot(null);
        setStatusMessage('');
        setErrorMessage('');
    };

    const slotLabel = (slot) => `${slot.reservation_start.slice(0,5)} - ${slot.reservation_end.slice(0,5)}`;

    return (
        <div style={{
            border: '1px solid #e1e5e9',
            padding: '20px',
            borderRadius: '16px',
            minWidth: '280px',
            maxWidth: '320px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            backgroundColor: 'white',
            textAlign: 'left',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            '@media (max-width: 768px)': {
                minWidth: 'auto',
                maxWidth: 'none',
                padding: '16px'
            }
        }}>
            <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#2c3e50',
                    fontSize: '1.4em',
                    fontWeight: '600'
                }}>
                    {pet.name}
                </h3>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                }}>
                    <span style={{
                        backgroundColor: pet.status === 'Laisvas' ? '#d4edda' : '#fff3cd',
                        color: pet.status === 'Laisvas' ? '#155724' : '#856404',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.85em',
                        fontWeight: '500'
                    }}>
                        {pet.status}
                    </span>
                    <span style={{
                        color: '#6c757d',
                        fontSize: '0.9em',
                        fontWeight: '500'
                    }}>
                        📍 {pet.city}
                    </span>
                </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    fontSize: '0.9em',
                    '@media (max-width: 768px)': {
                        gridTemplateColumns: '1fr',
                        gap: '8px'
                    }
                }}>
                    <div>
                        <strong style={{ color: '#495057' }}>Rūšis:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{pet.species}</p>
                    </div>
                    <div>
                        <strong style={{ color: '#495057' }}>Veislė:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{pet.breed || 'Nežinoma'}</p>
                    </div>
                    <div>
                        <strong style={{ color: '#495057' }}>Amžius:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{pet.age} m.</p>
                    </div>
                    <div>
                        <strong style={{ color: '#495057' }}>Dydis:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{pet.size}</p>
                    </div>
                    <div>
                        <strong style={{ color: '#495057' }}>Svoris:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{pet.weight} kg</p>
                    </div>
                    <div>
                        <strong style={{ color: '#495057' }}>Veikla:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{pet.activity_level}</p>
                    </div>
                </div>
            </div>

            {pet.ai_description && (
                <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    borderLeft: '4px solid #646cff'
                }}>
                    <p style={{
                        margin: 0,
                        fontSize: '0.9em',
                        color: '#495057',
                        lineHeight: '1.4'
                    }}>
                        {pet.ai_description}
                    </p>
                </div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <button
                    onClick={openModal}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#28a745',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '0.95em',
                        transition: 'background-color 0.2s ease',
                    }}
                >
                    Reserve Walk
                </button>
                <button style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#646cff',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.95em',
                    transition: 'background-color 0.2s ease',
                }}>
                    Daugiau informacijos
                </button>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 999,
                }}>
                    <div style={{
                        width: '90%',
                        maxWidth: '520px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    }}>
                        <h3 style={{ color: '#2c3e50', marginTop: 0, marginBottom: '16px' }}>Rezervuoti pasivaikščiojimą</h3>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: '600' }}>Data:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={async (e) => {
                                setSelectedDate(e.target.value);
                                await fetchSlots(e.target.value);
                            }}
                            style={{ marginBottom: '16px', display: 'block', width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', color: '#2c3e50', fontSize: '1em' }}
                        />

                        {loadingSlots ? (
                            <p style={{ color: '#2c3e50', textAlign: 'center' }}>Įkeliame laisvus laikus...</p>
                        ) : (
                            <div>
                                <p style={{ color: '#2c3e50', fontWeight: '600', marginBottom: '8px' }}>Pasirinkite laiką:</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
                                    {slots.map((slot) => (
                                        <button
                                            key={`${slot.reservation_start}-${slot.reservation_end}`}
                                            onClick={() => setSelectedSlot(slot)}
                                            style={{
                                                border: selectedSlot && selectedSlot.reservation_start === slot.reservation_start ? '2px solid #28a745' : '1px solid #ddd',
                                                borderRadius: '8px',
                                                padding: '10px',
                                                backgroundColor: selectedSlot && selectedSlot.reservation_start === slot.reservation_start ? '#e9f7ef' : '#fff',
                                                cursor: 'pointer',
                                                color: '#2c3e50',
                                                fontWeight: '600',
                                                fontSize: '0.95em',
                                            }}
                                        >
                                            {slotLabel(slot)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {statusMessage && <p style={{ color: '#155724', backgroundColor: '#d4edda', padding: '8px', borderRadius: '4px', marginBottom: '12px' }}>{statusMessage}</p>}
                        {errorMessage && <p style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '8px', borderRadius: '4px', marginBottom: '12px' }}>{errorMessage}</p>}

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={closeModal} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#f5f5f5', color: '#2c3e50', cursor: 'pointer', fontWeight: '600' }}>Uždaryti</button>
                            <button onClick={createReservation} style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#28a745', color: 'white', cursor: 'pointer', fontWeight: '600' }}>
                                Patvirtinti rezervaciją
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnimalCard;