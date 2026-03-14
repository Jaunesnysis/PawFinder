const PointsCard = ({ points }) => (
    <div className="points-card" style={{
        background: '#4CAF50', color: 'white', padding: '20px',
        borderRadius: '12px', textAlign: 'center', marginBottom: '20px'
    }}>
        <h3>Surinkta taškų</h3>
        <p style={{ fontSize: '3rem', margin: '0', fontWeight: 'bold' }}>{points}</p>
    </div>
);
export default PointsCard;