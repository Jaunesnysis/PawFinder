import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuestionnairePage from './pages/QuestionnairePage';
import AnimalListPage from "./pages/AnimalListPage/AnimalListPage.jsx";
import './App.css';

function App() {
  return (
      <div>
          {/* Pridėkime paprastą navigaciją viršuje, kad galėtum vaikščioti per puslapius */}
        <nav style={{ padding: '10px', background: '#ffffff', marginBottom: '20px',  borderRadius: '12px' }}>
            <Link to="/" style={{ marginRight: '40px', color: '#333' }}>Pradžia</Link>
            <Link to="/animals" style={{ marginRight: '40px', color: '#333' }}>Savanoriams (Gyvūnai)</Link>
            <Link to="/questionnaire" style={{marginRight: '40px', color: '#333'}}>Klausimynas</Link>
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
            <Route path="/animals" element={<AnimalListPage />} />
        </Routes>
      </div>
  );
}

export default App;
