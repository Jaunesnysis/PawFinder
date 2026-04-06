import React from 'react';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
    return (
        <div style={styles.container}>
            <div style={styles.hero}>
                <h1 style={styles.title}>Sveiki atvykę į PawFinder 🐾</h1>
                <p style={styles.subtitle}>
                    Padėkime prieglaudų augintiniams kartu. Prisijunk prie mūsų savanorių bendruomenės!
                </p>

                <div style={styles.features}>
                    <div style={styles.card}>
                        <h3>🐶 Savanoriauk</h3>
                        <p>Rezervuok laiką ir vedžiok prieglaudos šunis.</p>
                    </div>
                    <div style={styles.card}>
                        <h3>🏆 Rink taškus</h3>
                        <p>Gauk ženklelius už kiekvieną atliktą gerą darbą.</p>
                    </div>
                    <div style={styles.card}>
                        <h3>❤️ Rask draugą</h3>
                        <p>Susipažink su gyvūnais, ieškančiais naujų namų.</p>
                    </div>
                </div>

                <Link to="/login" style={styles.ctaButton}>Pradėti kelionę</Link>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        padding: '20px',
        textAlign: 'center',
    },
    hero: {
        maxWidth: '800px',
    },
    title: {
        fontSize: '3rem',
        color: '#333',
        marginBottom: '20px',
    },
    subtitle: {
        fontSize: '1.2rem',
        color: '#666',
        marginBottom: '40px',
        lineHeight: '1.6',
    },
    features: {
        display: 'flex',
        gap: '20px',
        marginBottom: '50px',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    card: {
        background: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
        width: '220px',
        border: '1px solid #eee',
    },
    ctaButton: {
        display: 'inline-block',
        padding: '15px 40px',
        backgroundColor: '#4CAF50',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '30px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        transition: 'transform 0.2s',
        boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
    }
};

export default WelcomePage;