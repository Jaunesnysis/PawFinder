const ProgressInfo = ({ totalPoints, nextGoal }) => {
    // Saugiklis, jei duomenys dar kraunasi
    if (totalPoints === undefined) return null;

    // JEI VISI PASIEKIMAI GAUTI (nextGoal yra null)
    if (!nextGoal) {
        return (
            <div style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#fff9c4', // Šviesiai geltona (auksinė)
                borderRadius: '12px',
                border: '1px solid #fbc02d',
                textAlign: 'center'
            }}>
                <h4 style={{ margin: 0, color: '#f57f17', fontSize: '1.2rem' }}>
                    🏆 Visi pasiekimai pasiekti!
                </h4>
                <p style={{ margin: '10px 0 0 0', color: '#555' }}>
                    Puikus darbas, DeivM! Tu pasiekei visus galimus tikslus.
                </p>
            </div>
        );
    }

    // JEI DAR YRA KO SIEKTI (tavo esama logika)
    const current = Number(totalPoints);
    const threshold = Number(nextGoal.points_threshold);

    // Apskaičiuojame procentą
    let progressPercentage = 0;
    if (threshold > 0) {
        progressPercentage = Math.min(Math.round((current / threshold) * 100), 100);
    }

    return (
        <div style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f0f7ff',
            borderRadius: '12px',
            border: '1px solid #d0e3ff',
            textAlign: 'left' // Užtikriname tekstą kairėje
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#0d47a1', fontSize: '1.1rem' }}>
                    Sekantis tikslas: {nextGoal.title}
                </h4>
                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#2196f3' }}>
                    {progressPercentage}%
                </span>
            </div>

            {/* Foninė juosta */}
            <div style={{
                background: '#e0e0e0',
                height: '14px',
                borderRadius: '7px',
                marginTop: '12px',
                overflow: 'hidden'
            }}>
                {/* Užpildyta dalis */}
                <div style={{
                    background: '#2196f3',
                    width: `${progressPercentage}%`, // Naudojame apskaičiuotą procentą
                    height: '100%',
                    transition: 'width 1s ease-out'
                }}></div>
            </div>

            <p style={{ textAlign: 'center', margin: '10px 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                Tau trūksta <strong>{nextGoal.points_missing}</strong> taškų iš {threshold} reikiamų.
            </p>
        </div>
    );
};
export default ProgressInfo;