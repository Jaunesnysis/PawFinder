import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuestionnairePage from './pages/QuestionnairePage';
import AnimalListPage from "./pages/AnimalListPage/AnimalListPage.jsx";
import MainAnimalsPage from './pages/MainAnimalsPage';
import ShelterProfilePage from './pages/ShelterProfilePage';
import ShelterListPage from './pages/ShelterListPage';
import FavoritesPage from './pages/FavoritesPage.jsx';
import './App.css';
import AchievementsPage from "./pages/AchievementsPage/AchievementsPage.jsx";
import NotificationsPage from "./pages/NotificationsPage/NotificationsPage.jsx";
import LoginPage from './pages/LoginPage/LoginPage';
import WelcomePage from './pages/GuestPages/WelcomePage/WelcomePage.jsx';
import Navbar from './components/Navbar/Navbar';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage.jsx';
import PetDetailsPage from './pages/PetDetailsPage/PetDetailsPage';


function App() {
    return (
        <div className="app-main-container">
            {/* Navbar pats nusprendžia ar ir ką rodyti */}
            <Navbar />

            {/* Pagrindinis turinys */}
            <main style={{ padding: '0 20px' }}>
                <Routes>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/questionnaire" element={<QuestionnairePage />} />
                    <Route path="/animals" element={<AnimalListPage />} />
                    <Route path="/mainAnimals" element={<MainAnimalsPage />} />
                    <Route path="/shelters" element={<ShelterListPage />} />
                    <Route path="/shelters/:shelterId" element={<ShelterProfilePage />} />
                    <Route path="/achievements" element={<AchievementsPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/register" element={<RegistrationPage />} />
                    <Route path="/pets/:id" element={<PetDetailsPage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
