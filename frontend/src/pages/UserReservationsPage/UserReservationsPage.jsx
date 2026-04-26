import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserReservationsPage.css';

const UserReservationsPage = () => {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const isShelter = user?.role === 'shelter';

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5050/api/reservations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Nepavyko gauti rezervacijų');
            }

            const data = await response.json();
            setReservations(data);
        } catch (error) {
            setStatusMessage(error.message);
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReservation = async (reservationId) => {
        if (!window.confirm('Ar tikrai norite atšaukti šią rezervaciją?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5050/api/reservations/${reservationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Nepavyko atšaukti rezervacijos');
            }

            setStatusMessage('Rezervacija sėkmingai atšaukta! 🐾');
            setMessageType('success');
            
            // Refresh the list
            setTimeout(() => {
                fetchReservations();
            }, 1500);
        } catch (error) {
            setStatusMessage(error.message);
            setMessageType('error');
        }
    };

    const formatDate = (dateStr) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('lt-LT', options);
    };

    const formatTime = (timeStr) => {
        return timeStr.slice(0, 5);
    };

    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'confirmed':
                return 'status-confirmed';
            case 'cancelled':
                return 'status-cancelled';
            case 'pending':
                return 'status-pending';
            default:
                return 'status-default';
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'confirmed':
                return 'Patvirtinta';
            case 'cancelled':
                return 'Atšaukta';
            case 'pending':
                return 'Laukiama patvirtinimo';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="reservations-container">
                <div className="loading-screen">Kraunama... 🐾</div>
            </div>
        );
    }

    return (
        <div className="reservations-container">
            <button className="back-link" onClick={() => navigate(-1)}>
                ← Grįžti atgal
            </button>

            <div className="reservations-header">
                <h1>{isShelter ? 'Rezervacijos' : 'Mano Rezervacijos'}</h1>
                <p className="reservations-count">Iš viso: {reservations.length} rezervacijų</p>
            </div>

            {statusMessage && (
                <div className={`status-banner ${messageType}`}>
                    {statusMessage}
                </div>
            )}

            {reservations.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🐾</div>
                    <p>{isShelter ? 'Jūsų augintiniams nėra jokių rezervacijų' : 'Jūs dar neturite jokių rezervacijų'}</p>
                    <button 
                        className="btn-primary" 
                        onClick={() => navigate('/mainAnimals')}
                    >
                        Peržiūrėti augintinių
                    </button>
                </div>
            ) : (
                <div className="reservations-grid">
                    {reservations.map((reservation) => (
                        <div key={reservation.reservation_id} className="reservation-card">
                            <div className="card-header">
                                <h2>{reservation.pet_name}</h2>
                                <span className={`status-badge ${getStatusBadgeClass(reservation.status)}`}>
                                    {getStatusText(reservation.status)}
                                </span>
                            </div>

                            <div className="card-body">
                                <div className="info-row">
                                    <span className="label">📅 Data:</span>
                                    <span className="value">{formatDate(reservation.date)}</span>
                                </div>

                                <div className="info-row">
                                    <span className="label">⏰ Laikas:</span>
                                    <span className="value">
                                        {formatTime(reservation.reservation_start)} - {formatTime(reservation.reservation_end)}
                                    </span>
                                </div>

                                {isShelter && (
                                    <>
                                        <div className="info-row">
                                            <span className="label">👤 Vartotojas:</span>
                                            <span className="value">{reservation.user_name}</span>
                                        </div>

                                        <div className="info-row">
                                            <span className="label">📧 El. paštas:</span>
                                            <span className="value">{reservation.user_email}</span>
                                        </div>
                                    </>
                                )}

                                {!isShelter && (
                                    <div className="info-row">
                                        <span className="label">📍 Prieglaudos ID:</span>
                                        <span className="value">#{reservation.shelter_id}</span>
                                    </div>
                                )}

                                <div className="info-row">
                                    <span className="label">📝 Rezervacijos ID:</span>
                                    <span className="value">#{reservation.reservation_id}</span>
                                </div>
                            </div>

                            <div className="card-actions">
                                <button 
                                    className="btn-view"
                                    onClick={() => navigate(`/pet-details/${reservation.pet_id}`)}
                                >
                                    Peržiūrėti augintinį
                                </button>

                                {reservation.status === 'confirmed' && (
                                    <button 
                                        className="btn-cancel"
                                        onClick={() => handleCancelReservation(reservation.reservation_id)}
                                    >
                                        Atšaukti rezervaciją
                                    </button>
                                )}

                                {reservation.status === 'cancelled' && (
                                    <button 
                                        className="btn-disabled"
                                        disabled
                                    >
                                        Atšaukta
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserReservationsPage;
