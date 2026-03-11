import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <button
        onClick={() => navigate('/questionnaire')}
        style={{
          padding: '20px 40px',
          fontSize: '18px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Pradėti klausimyną
      </button>
    </div>
  );
};

export default HomePage;