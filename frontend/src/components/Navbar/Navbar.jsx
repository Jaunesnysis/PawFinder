import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'))

    // 1. Jei esame Login puslapyje (keliu "/"), navigacijos nerodome
    //if (location.pathname === '/') return null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // window.location.href naudojamas, kad programėlė pilnai persikrautų ir išsivalytų visi state
        window.location.href = '/';
    };

    // --- SVEČIO MENIU (Jei nėra tokeno) ---
    if (!token) {
        return (
            <nav style={styles.nav}>
                <div style={styles.sideSection}>
                    <span style={styles.logo}>PawFinder</span>
                </div>

                <div style={styles.centerSection}>
                    <Link to="/" style={styles.link}>Pradžia</Link>
                    <a href="#" style={styles.link}>Apie projektą</a>
                    <a href="#" style={styles.link}>Kaip tapti savanoriu?</a>
                    <a href="#" style={styles.link}>Kontaktai</a>
                </div>

                <div style={styles.sideSectionRight}>
                    {location.pathname !== '/login' && (
                        <Link to="/login" style={styles.loginBtn}>Prisijungti</Link>
                    )}
                </div>
            </nav>
        );
    }

    return (
        <nav style={styles.nav}>
            {/* KAIRĖ: Logo */}
            <div style={styles.sideSection}>
                <span style={styles.logo}>PawFinder</span>
            </div>

            {/* CENTRAS: Nuorodos pagal rolę */}
            <div style={styles.centerSection}>
                {/* Bendros nuorodos visiems prisijungusiems */}
                <Link to="/home" style={styles.link}>Pradžia</Link>
                <Link to="/mainAnimals" style={styles.link}>Gyvūnai</Link>
                <Link to="/shelters" style={styles.link}>Prieglaudos</Link>

                {/* TIK SAVANORIAMS (Volunteer) */}
                {(user.role === 'volunteer' || user.role ==='user') && (
                    <>
                        <Link to="/questionnaire" style={styles.link}>Klausimynas</Link>
                        <Link to="/animals" style={styles.link}>Savanoriams</Link>
                        <Link to="/achievements" style={styles.achievementsLink}>🏆 Pasiekimai</Link>
                    </>
                )}

                {/* TIK PRIEGLAUDOMS (Shelter) - Pavyzdys ateičiai */}
                {user.role === 'shelter' && (
                    <>
                        <Link to="/my-shelter-pets" style={styles.link}>Mano augintiniai</Link>
                        <Link to="/add-pet" style={{...styles.link, color: '#2196F3'}}>➕ Pridėti</Link>
                    </>
                )}

                {/* TIK PRIEGLAUDOMS - Pranešimai */}
                {user.role === 'shelter' && (
                    <Link to="/notifications" style={styles.notificationsLink}>🔔 Pranešimai</Link>
                )}

                {/* TIK SAVANORIAMS IR VARTOTOJAMS - Mano rezervacijos */}
                {(user.role === 'volunteer' || user.role === 'user') && (
                    <Link to="/my-reservations" style={{...styles.link, color: '#9C27B0'}}>📅 Mano rezervacijos</Link>
                )}

                {/* TIK PRIEGLAUDOMS - Jų augintinių rezervacijos */}
                {user.role === 'shelter' && (
                    <Link to="/my-reservations" style={{...styles.link, color: '#9C27B0'}}>📅 Rezervacijos</Link>
                )}

                {/* VISIEMS APART PRIEGLAUDŲ - Mėgstamiausi */}
                {(user.role !== 'shelter') && (
                    <Link to={`/favorites/${user.id}`} style={{...styles.link, color: '#e91e63'}}>❤️ Mėgstamiausi</Link>
                )}
            </div>

            {/* DEŠINĖ: Atsijungimas */}
            <div style={styles.sideSectionRight}>
                <button
                    onClick={handleLogout}
                    style={styles.logoutBtn}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#ffccc7'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#fff1f0'}
                >
                    Atsijungti
                </button>
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 40px', // Padidintas padding (viršus/apačia 15px, šonai 40px)
        background: '#ffffff',
        marginBottom: '30px', // Daugiau vietos iki turinio apačioje
        borderRadius: '16px', // Kiek apvalesni kampai atrodo moderniau
        boxShadow: '0 4px 15px rgba(0,0,0,0.06)', // Švelnesnis, didesnis šešėlis
        width: '100%',         // Naudojam visą prieinamą plotį
        maxWidth: '1400px',    // Bet neleidžiam išsiplėsti per visą milžinišką ekraną
        margin: '15px auto',
        boxSizing: 'border-box'
    },
    sideSection: {
        flex: 1,
        display: 'flex',
        justifyContent: 'flex-start',
        minWidth: '120px' // Užtikrina, kad logotipas nesusitrauktų
    },
    sideSectionRight: {
        flex: 1,
        display: 'flex',
        justifyContent: 'flex-end',
        minWidth: '120px'
    },
    centerSection: {
        flex: 6,               // Padidintas iš 4 į 6 (duoda daugiau vietos centrui)
        display: 'flex',
        justifyContent: 'center',
        gap: '35px',           // Padidintas tarpas tarp nuorodų nuo 20px iki 35px
        flexWrap: 'wrap'
    },
    logo: {
        fontWeight: '800',     // Ryškesnis logotipas
        color: '#4CAF50',
        fontSize: '1.4rem',
        letterSpacing: '-0.5px'
    },
    link: {
        textDecoration: 'none',
        color: '#444',
        fontSize: '1rem',      // Šiek tiek didesnis šriftas geresniam skaitomumui
        fontWeight: '500',
        whiteSpace: 'nowrap',
        transition: 'color 0.2s'
    },
    achievementsLink: {
        textDecoration: 'none',
        color: '#4CAF50',
        fontWeight: '700',
        fontSize: '1rem',
        whiteSpace: 'nowrap'
    },
    notificationsLink: {
        textDecoration: 'none',
        color: '#FF9800',
        fontWeight: '700',
        fontSize: '1rem',
        whiteSpace: 'nowrap'
    },
    logoutBtn: {
        padding: '10px 20px',
        backgroundColor: '#fff1f0',
        color: '#f5222d',
        border: '1px solid #ffa39e',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: '700',
        transition: 'all 0.2s'
    }
};

export default Navbar;