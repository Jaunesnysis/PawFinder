import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuestionnairePage from './pages/QuestionnairePage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/questionnaire" element={<QuestionnairePage />} />
    </Routes>
  );
}

export default App;
