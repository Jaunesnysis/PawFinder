import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuestionnairePage from './pages/QuestionnairePage';
import AnimalListPage from "./pages/AnimalListPage/AnimalListPage.jsx";
import MainAnimalsPage from './pages/MainAnimalsPage';
import ShelterProfilePage from './pages/ShelterProfilePage';
import ShelterListPage from './pages/ShelterListPage';
import './App.css';
import AchievementsPage from "./pages/AchievementsPage/AchievementsPage.jsx";

function App() {
  return (
      <div>
          {/* Pridėkime paprastą navigaciją viršuje, kad galėtum vaikščioti per puslapius */}
        <nav style={{ padding: '10px', background: '#ffffff', marginBottom: '20px',  borderRadius: '12px' }}>
            <Link to="/" style={{ marginRight: '40px', color: '#333' }}>Pradžia</Link>
            <Link to="/mainAnimals" style={{ marginRight: '40px', color: '#333' }}>Gyvūnai</Link>
            <Link to="/shelters" style={{ marginRight: '40px', color: '#333' }}>Priegaudos</Link>
            <Link to="/animals" style={{ marginRight: '40px', color: '#333' }}>Savanoriams (Gyvūnai)</Link>
            <Link to="/questionnaire" style={{marginRight: '40px', color: '#333'}}>Klausimynas </Link>
            <Link to="/achievements" style={{ marginRight: '40px', color: '#4CAF50', fontWeight: 'bold' }}>🏆 Pasiekimai(laikinai)</Link>
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
          <Route path="/animals" element={<AnimalListPage />} />
          <Route path="/mainAnimals" element={<MainAnimalsPage />} />
          <Route path="/shelters" element={<ShelterListPage />} />
          <Route path="/shelters/:shelterId" element={<ShelterProfilePage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
        </Routes>
      </div>
  );
}

export default App;
